# AKAM — Corrected Investment Dossier (2026-09-15)

Akamai Technologies, Inc. sells cloud security, cloud infrastructure, and internet-delivery services. It reports in USD under U.S. GAAP.

Run root: analyses/AKAM_2026-09-15 | Targeted integrity correction, published 2026-09-15 | Price and operating evidence remain dated 2026-09-14. Unaffected module evidence is reused from the original publication; this is not a fresh full-company research run.

## Publication correction and limits

This new run at **analyses/AKAM_2026-09-15** corrects the sealed September 14 publication. The original thesis, decision, audits and admission are preserved. The old source audit identified absent discount-rate evidence and a convertible/share mismatch; the latest pre-mortem recommended 40/100 while the published record still showed 45. This publication incorporates the cumulative 10-point haircut and fixes the common share basis. It does not claim all seven specialist teams ran again.

**148.333m = 153.686m GAAP diluted shares − 5.353m disclosed note-hedge benefit.** Cash-settled principal remains in debt. The same economic period-average working count now drives forward and reverse calculations; it is not an exact current fully diluted count. [Q2 FY2026 Form 10-Q, Note 7 pp.18–20, Note 13 p.25, MD&A p.39]

The dated Treasury and equity-premium inputs are now source-bound, but beta 1.00, the tax rate, carrying-debt weights and historical convertible-interest ratio remain explicit assumptions. CFO-minus-cash-capex is a cash proxy, not fully unlevered FCFF. Therefore the $71.26 base and $78.64 weighted value are conditional model outputs. The September 14 Treasury-rate sensitivity gives a $69.28 base; a broad rate grid spans $23.45–$152.45. No sensitivity counts as an independent valuation method. [valuation/04_intrinsic-dcf.md, §§1–7]

Current confidence is **40/100 after audit**, from raw 50 less the cumulative 10-point haircut. The highest-value next work is a complete matched independent valuation. Peer workbooks exist in the new inventory; their existence does not establish a warranted multiple. Operating evidence and price remain dated September 14, without hindsight from later earnings.

## Table of Contents

- [Part I — Investment Committee Decision](#part-i--investment-committee-decision)
- [Part II — Cross-Cutting Analysis](#part-ii--cross-cutting-analysis)
- [Part III — Module Chapters](#part-iii--module-chapters)
- [Part IV — Module Appendices](#part-iv--module-appendices)
- [Part V — Evidence and Process](#part-v--evidence-and-process)

# Part I — Investment Committee Decision

## 1. One-Line Decision

**Decision: Avoid — at $106.79, the only valid value-producing method gives a $71.26 base value, while falling GAAP profitability, 5.14x strict net leverage, and unproven acquisition returns do not justify the cash growth embedded in the price.** [analyses/AKAM_2026-09-15/valuation/99_valuation-synthesis.md, §§1–7; analyses/AKAM_2026-09-14/earnings/99_earnings-synthesis.md, §§1–5; analyses/AKAM_2026-09-14/management-governance/99_management-governance-synthesis.md, §§4–6]

This is a rejection of the long, not a short recommendation. The module's DCF sensitivity bull is only 6.39% above the price, so the master adds a distinct 10%-probability good-outcome case: the reverse-DCF's 16.97% cash-growth path and 4.9553% market-implied WACC together produce $153.39, or +43.64%. That joint tail, plus missing borrow and options data, makes an active short unsuitable. [analyses/AKAM_2026-09-15/valuation/04_intrinsic-dcf.md, §§4–7; analyses/AKAM_2026-09-15/valuation/05_reverse-dcf.md, §§2–2A]

## 2. Headline Scorecard

| Item | Answer |
|---|---|
| Rating | **Avoid** |
| **Decision line (ticker · venue · currency)** | **AKAM · Nasdaq Global Select Market · USD** |
| Suggested action | Do not own at $106.79. Reassess after a second matched-basis valuation or reported proof that Security and Cloud Infrastructure Services convert to cash at the rate implied by the price. |
| Time horizon | 12 months; separate 24–36 month avoid-ruin floor noted below |
| Expected return | **−26.36%** to the $78.64 probability-weighted target; diagnostic because the good-outcome case is a low-probability, two-condition DCF inference |
| Downside risk | **55.71%** to the 12-month `bear_cyclical` level |
| Risk/reward | **−0.47x**; the computed expected reward to a long is negative |
| Understanding /100 | **74.0** — evidence quality and how well the situation is understood, not a buy signal |
| Conviction /100 | **50.0** raw conviction; the one-model distribution limits how much to bet |
| Effective confidence after pre-mortem /100 | **40.0 = 50.0 − 10.0 cumulative haircut**; no confidence was restored merely because arithmetic was fixed |
| Suggested sizing | **lean avoid — monitor, no position** |
| Thesis type | **Company-specific; Sector-cycle** |
| Variant perception — edge score /100 | **45/100** |
| Biggest upside driver | Security and CIS growth converts to free cash flow while investors continue to require a cost of capital near the 4.96% market-implied rate |
| Biggest downside driver | Capacity, payroll, and stock-compensation costs stay ahead of revenue while Delivery pricing remains weak |
| Killer risk | A lower market-required return and better cash conversion occur together; the explicit good-outcome case reaches $153.39 even though the 6.22% WACC base DCF does not support today's price |
| Avoid-Big-Risks filters tripped (§24) | **Filter 4 — serial acquirer (RF-CAP-004); Filter 5 — fast-changing industry (RF-BQ-005).** Filter 3 is elevated but not verdict-locked: the owning solvency module says Adequate. |
| Rating cap, if any | Any long is capped at **Watchlist** by RF-CAP-004. The three-tag forensic mosaic separately caps a long at **Starter Position Only**. There are **0 Critical** governance and **0 Critical** earnings flags; the final rating is lower than both ceilings. |

The scenario returns use the pool-verified 14 September 2026 close. The working assumptions are a 12-month horizon, medium-to-high risk tolerance, a desired gain of at least 30%, and long common equity unless the evidence supports another structure. Capital IQ and IBKR access are assumed, but the pool contains no usable options or borrow snapshot.

## 3. Would I Buy This With Real Money Today?

**Final answer: I would not buy AKAM today.** Free cash flow (FCF, cash from operations minus total cash capital expenditure) was $629.9m on the module's trailing basis. The reverse discounted-cash-flow model (reverse-DCF, solving for what the share price requires) says $106.79 needs 16.97% annual FCF growth to about $1.275bn by FY2030 at a 6.22% weighted-average cost of capital (WACC, the return demanded by lenders and shareholders). The matched FCF record grew 6.34% annually in FY2023–FY2025 and then fell 9.92% on the latest trailing basis. [analyses/AKAM_2026-09-15/valuation/05_reverse-dcf.md, §§2–5]

- **Confidence:** 40/100 effective conviction (50 raw less cumulative 10-point pre-mortem haircut); 74/100 understanding.
- **Position stance:** no position. Track the avoided and foregone return, including upside we miss.
- **What would raise confidence:** a second independent valuation; filed Security/CIS economics; and LTM strict FCF at or above about $736.8m by Q2 2027 on the same basis.
- **What would lower confidence in the Avoid:** Q3 revenue of at least $1,123.7m together with gross margin at or above the 59.3% Q3 FY2025 comparable, followed by cash conversion rather than another adjusted-only beat.
- **What would force rejection of the Avoid:** an independent matched-basis valuation supports the market price and reported cash flow begins tracking the reverse-DCF requirement while strict leverage falls for two consecutive quarters.

## 4. The Actual Variant Perception

- **What everyone already knows:** Security and CIS are growing while legacy Delivery is shrinking. Capital IQ's recommendation is Outperform, and 23 target-price estimates average $153.31 with a $155 median. [data/AKAM/AkamaiTechnologies,IncNasdaqGSAKAMEstimatesReport.xls, Consensus sheet, data as of 2026-09-14]
- **What is probably priced in:** $106.79 can be reconciled either by 16.97% annual FCF growth to $1.275bn by FY2030 at the model's 6.22% WACC, or by keeping the DCF cash path and lowering WACC to 4.96%. Those are non-exclusive explanations. [analyses/AKAM_2026-09-15/valuation/05_reverse-dcf.md, §§2–5]
- **What the engine thinks may be missed:** revenue mix is not the same as economic value. Q2 Security grew 10% and CIS 39%, but category profit and capital are undisclosed; group gross margin fell 331 basis points and GAAP-derived EBITDA fell 18.7%. [data/AKAM/Akamai Technologies, Inc., Q2 2026.pdf, Form 10-Q, pp.5, 23, 25, 30; data/AKAM/Supplemental Financial Information, 2nd Quarter 2026.xlsx, Supplemental Metrics sheet]
- **What evidence proves we are actually different:** by Q2 2027, the same-basis LTM FCF should be moving through roughly $736.8m, the first-year 16.97% growth step from $629.9m, while category economics and reported margins stop worsening. A result below $736.8m with no margin recovery supports the engine's negative expectations gap; a result at or above it with lower strict leverage disproves it. This is a judgment test, not a measured base rate. [analyses/AKAM_2026-09-15/valuation/05_reverse-dcf.md, §§2–5]

**Edge score: 45/100.** The price-implied cash requirement is quantified and falsifiable, but the edge is not proven enough for high conviction because value comes from one terminal-heavy model and a genuine upside outcome requires both the price-implied cash path and the lower market-implied WACC.

## 5. Thesis → Antithesis → Final Thesis

- **Thesis:** Akamai's Security and CIS mix shift can replace Delivery weakness and restore cash growth.
- **Antithesis:** the latest filings show the cost build arriving before that value: Q2 revenue rose 5.4%, but GAAP gross margin fell 331 basis points and GAAP-derived EBITDA margin fell 716 basis points. [data/AKAM/Akamai Technologies, Inc., Q2 2026.pdf, Form 10-Q, pp.5, 30, 32–34]
- **Revised thesis:** the operating option is real, but the market price already requires a cash outcome that the matched history does not prove.
- **Final thesis:** reject the long at $106.79. Do not short it because the scenario set contains a +43.64% good-outcome tail, the valuation has one method, and positioning data is missing.
- **Insight threshold:** Insight threshold reached: the remaining uncertainty is mostly data-dependent, not reasoning-dependent.

## 6. Simple Summary

- Akamai sells internet security, cloud infrastructure, and delivery services.
- Security grew 10% and CIS grew 39% in Q2, but Delivery fell 6%. [data/AKAM/Akamai Technologies, Inc., Q2 2026.pdf, Form 10-Q, p.30]
- Revenue growth is not yet turning into reported profit growth: Q2 gross margin was 55.8%, down 331 basis points year on year. [data/AKAM/Akamai Technologies, Inc., Q2 2026.pdf, Form 10-Q, p.5]
- Strict net debt was $6.083bn, or 5.14x GAAP-derived EBITDA; liquidity covers the scheduled 2027 maturity, so this is not a distress call. [analyses/AKAM_2026-09-14/balance-sheet-survival/99_balance-sheet-survival-synthesis.md, §§1–5]
- The $71.26 base DCF is well below the $106.79 price, but its 82.85% terminal-value share makes it sensitive. [analyses/AKAM_2026-09-15/valuation/99_valuation-synthesis.md, §§1–5]
- The company has bought businesses repeatedly without disclosing deal-level returns, which caps any long at Watchlist. [analyses/AKAM_2026-09-14/management-governance/99_management-governance-synthesis.md, §§4–6]
- **Do not buy now; do not short now.**
- **Highest-value next item:** a complete same-date matched peer valuation with EV, LTM and NTM revenue, EBITDA, EBIT, EPS, FCF, and net debt for Cloudflare, Fortinet, and Fastly.

# Part II — Cross-Cutting Analysis

## Decision Audit Trail

| Decision Driver | Bull Evidence | Bear Evidence | Which Side Wins? | Why? | Confidence /100 |
|---|---|---|---|---|---:|
| Security/CIS growth versus current profit | Security added 5.03 percentage points to Q2 revenue growth and CIS added 2.67 points; the category bridge has zero residual. | Delivery subtracted 2.32 points, gross margin fell 331 basis points, and GAAP EBIT margin fell 721 basis points; the cost bridge also has zero residual. | Bear, for now | The latest reported profit evidence outranks a revenue-only mix story. Category margins are not disclosed, so growth cannot prove value creation. [analyses/AKAM_2026-09-14/earnings/99_earnings-synthesis.md, §§2–3] | 85 |
| Moat trajectory versus cash conversion | CFO/vendor EBITDA improved from 117.7% to about 134% on the business-model series. | Gross margin fell from 63.3% in FY2021 to 57.5% LTM, EBIT margin from 23.3% to 11.9%, and vendor ROIC from 7.0% to 2.7%. | Bear on profit economics; not “confirmed” across every metric | Cash conversion directly contradicts an absolute erosion claim. It does not overturn the margin and return decline, but it keeps the verdict qualified. [analyses/AKAM_2026-09-14/business-model/99_business-model-synthesis.md, §§1–3] | 72 |
| Leverage versus survival | $4.355bn of committed liquidity equals $1.480bn cash + $1.875bn current securities + $1.000bn undrawn revolver; cash plus current securities cover the $1.150bn 2027 maturity 2.92x. | Strict net leverage rose from 2.49x at FY2025 to 5.14x at Q2; the 6.0x analyst warning is crossed after an 11.5% EBITDA decline on the known LayerX basis. | Bull on near-term survival; bear on flexibility | The filing supports liquidity but not numerical covenant headroom. This removes a distress lock, not the valuation and capital-allocation risk. [analyses/AKAM_2026-09-14/balance-sheet-survival/99_balance-sheet-survival-synthesis.md, §§1–5] | 78 |
| Serial acquisition pattern | The business-model quick read did not trigger the filter at its narrower threshold. | The dedicated governance work totals FY2021–FY2025 cash acquisitions at $2.066bn = $598.8m + $872.1m + $106.2m + $434.1m + $55.1m, plus $205m for LayerX, with no deal-level returns. | Bear; dedicated governance overrides quick read | The deeper, jurisdiction-owning module assessed the full five-year cash record and opportunity cost. RF-CAP-004 caps a long at Watchlist. [analyses/AKAM_2026-09-14/management-governance/99_management-governance-synthesis.md, §§3–6] | 82 |
| DCF value versus market-required return | The same DCF cash path supports $106.79 at a 4.96% market-implied WACC; Security/CIS growth could make that path conservative. | At 6.22% WACC, the price requires 16.97% annual FCF growth; the valid base value is $71.26 and the matched FCF history is weaker. | Bear for owning; unresolved for shorting | The model-rate case has no cushion, but the market-rate solve is real disconfirmation. One method cannot support a high-conviction short. [analyses/AKAM_2026-09-15/valuation/99_valuation-synthesis.md, §§1–5] | 65 |
| Consensus optimism versus evidence | The mean target is $153.31, median $155, and all four observed quarterly revenue/normalized-EPS prints beat final consensus. | The beat sizes narrowed, Q3 estimates fell about 1.2% over 90 days, and the target range is $93–$195. | Neither target consensus nor the four-quarter streak wins | Targets are not valuation proof, and four observations are judgment input, not a base rate. The current Q3 bar is fair. [data/AKAM/AkamaiTechnologies,IncNasdaqGSAKAMEstimatesReport.xls, Consensus, Trends, Revisions, and Surprise sheets, data as of 2026-09-14] | 68 |

**Sign check:** the headline turns on whether Security/CIS revenue becomes durable cash. The earnings module calls Security the largest current driver but CIS only a later acceleration lever, and calls the next setup balanced. The master keeps that sign: the option exists, but the latest reported profitability and the lack of category economics win today. No specialist is overridden on its own variable. [analyses/AKAM_2026-09-14/earnings/99_earnings-synthesis.md, §§1–5]

**Same-company memory check:** no earlier AKAM decision record or review was present, so no prior-company lesson could be tested. The shadow memory packet also failed to compile because the host lacks active Xcode command-line tools; under the runtime policy, the run proceeded with ordinary no-memory analysis and no score change.

## 6. Valuation and Peer Mispricing

The valuation module controls this section. Its sole value-producing method is a conditional enterprise DCF using CFO-minus-cash-capex as a cash-flow proxy. This is not fully unlevered FCFF: cash interest remains in CFO. The approximation and the historical convertible-interest discount-rate proxy limit confidence. The EV-to-equity bridge deducts $6.0826bn of **strict net debt**, meaning $7.5628bn of debt less $1.4803bn of cash and equivalents, and divides by 148.333m economic diluted working shares. [analyses/AKAM_2026-09-15/valuation/01_price-and-capital-structure.md, Anchor Block]

| Read | Result | Weight | Decision use |
|---|---:|---:|---|
| Own history | 13.4x LTM EV/EBITDA; 83rd percentile of only six closes | 0% | Too little history for reversion; directional only |
| Peer multiples | 13.4x versus 59.4x heterogeneous median; mechanical value $377.81 | 0% | Definitions and peers do not support a warranted multiple; exclude |
| Conditional cash-flow DCF | joint bull $153.39 / sensitivity bull $113.62 / base $71.26 / `bear_cyclical` $47.30 | 100% of valid methods | One-method range; 82.85% of EV is terminal value |
| Structural reset | `bear_structural` $35.22 | Avoid-ruin cross-check | Separate 24–36 month floor, not a 12-month scenario |

The DCF uses a 6.22% WACC. The filing discloses only obligation-specific lease rates of 3.6%, 4.4%, and 5.1%, not a scope-matched group discount rate, so those rates do not replace the WACC. The reverse-DCF's 4.96% market-implied WACC is the strongest contrary read. [analyses/AKAM_2026-09-15/valuation/04_intrinsic-dcf.md, §§1–2; analyses/AKAM_2026-09-15/valuation/05_reverse-dcf.md, §2A]

| Metric | Company | Peer Median | Premium / Discount | Interpretation |
|---|---:|---:|---:|---|
| LTM EV/EBITDA, vendor basis | 13.4x | 59.4x | −77.4% | **Not a cheapness signal.** The broad basket is heterogeneous and AKAM's vendor EV/EBITDA does not reconcile to the filing bridge. |

Three possible explanations for the apparent gap are true mispricing, fear of Delivery/margin decline, or a quality/leverage discount. The evidence cannot separate them. There is no stable peer or own-history multiple anchor, so the DCF remains a low-confidence cash-expectations warning rather than triangulated fair value.

Margin of safety—the cushion between value and price—is **−49.85% = ($71.26 − $106.79) / $71.26**. Downside to the 12-month bear is **55.71%**. These are different measures. The $35.22 structural floor implies 67.02% downside over 24–36 months and is not mixed into the 12-month math.

## 7. Catalyst Calendar

The catalyst module controls this section. Its 55/100 strength and 60/100 timing visibility reflect that the hard dates mostly test financing, while the main operating event is vaguely timed and belongs to a fast-changing industry.

| Date / Window | Catalyst | Why It Matters | Bullish Trigger | Bearish Trigger |
|---|---|---|---|---|
| 30 Sep 2026 | End of Q3 conversion window for $1.725bn 2033 Notes | Conversion can call cash principal before 2033 contractual maturity. | No material holder conversion is reported. | A material conversion creates a cash-principal use. [data/AKAM/Akamai Technologies, Inc., Q2 2026.pdf, Form 10-Q, Note 7, pp.17–18] |
| 3 Nov 2026, vendor-expected | Q3 results and FY2026 guidance | First report after the Q3 CIS delay; exact date is not issuer-confirmed. | Revenue ≥$1,123.7m and normalized EPS ≥$1.70, with Q4 timing retained. | Revenue ≤$1,112.6m or EPS ≤$1.66, or guidance/ramp is cut. [data/AKAM/AkamaiTechnologies,IncNasdaqGSAKAMEstimatesReport.xls, Consensus and Guidance sheets; data/AKAM/23cab413-4bd3-4055-8415-e3e81559c003.pdf, Q2 2026 earnings release, p.2] |
| Q4 2026–Q1 2027 | First revenue from two large CIS deployments | Central test of whether capacity spend becomes revenue. | The roughly $15m + $20m Q4 management expectations begin and Q1 accelerates without another margin setback. | Equipment, power, or setup delay moves revenue while costs continue. These amounts are expectations, not matched-period thresholds. [data/AKAM/Akamai Technologies, Inc., Q2 2026 Earnings Call, Aug 06, 2026.pdf, CFO Q&A; data/AKAM/Akamai Technologies, Inc. Presents at Goldman Sachs Communacopia + Technology Conference 2026, Sep-09-2026 02_25 PM.pdf, CFO discussion] |
| 1 May 2027 | 2027 Notes become freely convertible | Makes $1.150bn principal a live capital-structure issue before maturity. | No adverse liquidity or dilution result. | Conversion forces cash principal or value-above-principal settlement. [data/AKAM/Akamai Technologies, Inc., Q2 2026.pdf, Form 10-Q, Note 7, pp.17–18] |
| Jun 2027 | $2.0bn buyback authorization expires | Tests whether debt, cloud capex, or repurchases rank first. | Board explains a cash-return rule tied to per-share value and leverage. | More repurchases compete with debt reduction without a disclosed return hurdle. [data/AKAM/Akamai Technologies, Inc., Q2 2026.pdf, Form 10-Q, Note 9, p.22] |
| 1 Sep 2027 | $1.150bn 2027 Notes mature | First scheduled maturity; cash-covered today, but covenant headroom is unknown. | Repayment or refinancing without a funding surprise. | Funding terms or cash use expose covenant or capex conflict. [data/AKAM/Akamai Technologies, Inc., Q2 2026.pdf, Form 10-Q, Note 7, pp.17–20] |

### Numeric-trigger validation

| Trigger as written | Comparable it is measured against | Implied stub arithmetic | Last-two-period test |
|---|---|---|---|
| Q3 revenue ≥$1,123.7m (+6.55%) and normalized EPS ≥$1.70 (−8.60%) | Q3 FY2025 standalone revenue $1,054.630m and normalized EPS $1.86; same quarter and vendor basis | None; AKAM files a standalone quarter | Only one prior Q3 lies in the six-quarter pool, so a two-period seasonal back-test is not available. This is explicitly a judgment monitor, not a measured rate. |
| Q3 revenue ≤$1,112.6m (+5.50%) or normalized EPS ≤$1.66 (−10.75%) | Same Q3 FY2025 standalone comparables | None | Same limitation. The thresholds can fail because the management ranges extend on both sides; they are not conviction-lifting. |

The absence of a second like-for-like Q3 observation is itself a limit. It does not justify replacing the Q3 comparable with Q1 or Q2, which would mix seasonal quarters.

## 8. Scenario Model

| Case | Probability | Probability basis | Return | Price Target | What Must Happen |
|---|---:|---|---:|---:|---|
| `bull_execution` | 10% | judgment | **+43.64%** | **$153.39** | The reverse-DCF's 16.97% annual FCF path reaches about $1.275bn in FY2030 **and** the market retains the separately solved 4.9553% WACC, with 0.80% terminal growth. One clean CIS report can improve both cash expectations and perceived risk, but either condition alone supports roughly today's price rather than this target; the 10% applies to the conjunction, not each condition separately. |
| `bull_dcf_sensitivity` | 15% | judgment | **+6.39%** | **$113.62** | FY2030 FCF reaches $972.3m, cash capex falls toward 18.5% of revenue, and the market accepts 5.22% WACC and 1.30% terminal growth. The 15% applies to this conjunction, not each condition separately. |
| `base` | 45% | judgment | **−33.27%** | **$71.26** | FY2026–FY2028 consensus revenue broadly holds, GAAP EBIT margin recovers to 14.0% by FY2030, and terminal ROIC fades to the 6.22% WACC. The probability applies to the joint operating and valuation path. |
| `bear_cyclical` | 30% | judgment | **−55.71%** | **$47.30** | The same explicit cash path is valued at 7.22% WACC and 0.30% terminal growth as capacity cost, CIS delay, and Delivery pressure weaken durability. These conditions share the same cash-durability driver. |

The complete corrected model is in [valuation/04_intrinsic-dcf.md](valuation/04_intrinsic-dcf.md), including the full cash schedule and matched reverse solve. The joint bull uses cash of $340.622m / $796.881m / $932.148m / $1,090.374m / $1,275.460m at 4.955325% WACC and 0.801737% terminal growth. Explicit present value $3,936.212m + terminal present value $24,899.532m = enterprise value $28,835.745m; less strict net debt $6,082.571m = equity $22,753.174m; divided by 148.333m economic working shares = $153.3925. This is a conditional model inference, not a filing forecast or independent method.

**Span check:** the best case is now +43.64%, well outside an ordinary weekly move. A Security/CIS report that lifts the cash path while keeping the market-required return near 4.96% is the single news pattern that can move the stock 10% or more, and `bull_execution` contains it. The module's +6.39% grid point remains as a separate mild-upside state rather than masquerading as the full bull. The master did not use the $153.31 consensus target as valuation proof.

**Common drivers:** cash durability and required return move every case; the cases are not diversified draws. A cash-flow disappointment would also raise strict leverage, so operating and balance-sheet downside are correlated. The separate $35.22 `bear_structural` floor is a 24–36 month avoid-ruin check and is excluded from this 365-day probability set.

- Probability-weighted target: **$78.64**.
- Probability-weighted expected return: **−26.36%**.
- Main upside driver: Security/CIS cash conversion with a lower required return.
- Main downside driver: cost-before-revenue and weak Delivery pricing.
- Risk/reward: **−0.47x**.
- Verdict: the expected return is not worth taking the long risk; the explicit +43.64% good-outcome tail also makes a short unsuitable.

## 9. Risk Register

All probabilities below are judgment. None is presented as a measured frequency.

| Risk | Severity /100 | Probability /100 | Probability basis | Early Warning Signal | How To Monitor |
|---|---:|---:|---|---|---|
| Reported-profit compression | 85 | 70 | judgment | GAAP gross and EBIT margins remain below the same quarter a year earlier | Q3 and Q4 Forms 10-Q / 10-K |
| Solution-economics gap | 80 | 75 | judgment | Security/CIS growth is reported without category profit, capital, or cash returns | Notes 11 and 14; investor supplements |
| Delivery renewal pricing | 75 | 70 | judgment | Delivery remains down year on year and management again cites price/traffic optimization | Quarterly MD&A |
| CIS deployment delay with cost already incurred | 85 | 60 | judgment | Q4 timing slips while co-location and network costs keep growing faster than revenue | Q3 call, Q4 filing, deployment commentary |
| Recurring non-GAAP exclusions — RF-DISC-002 | 80 | 80 | judgment | SBC and restructuring remain excluded while the GAAP/adjusted gap stays large | Quarterly GAAP-to-non-GAAP bridge |
| Serial acquisitions without return proof — RF-CAP-004 | 80 | 75 | judgment | More M&A occurs before prior-deal return disclosure | 10-Q acquisition notes and annual cash-flow record |
| Shareholder dissent — RF-SHR-001 | 60 | 55 | judgment | Board does not explain the 2026 stock-plan vote or dilution controls | Proxy and annual-meeting results |
| Auditor-firm discipline — RF-AUD-007 | 50 | 30 | judgment | Evidence connects the 2024 PwC censure or remediation to the AKAM team | Form AP and audit disclosures; no AKAM link exists today |
| Lease commitment burden — RF-FIN-003 / RF-CL-001 | 75 | 65 | judgment | New commitments rise without matching capacity-use or cancellation disclosure | Annual lease note; keep $1.8659bn + $278.0m + $187.1m build intact |
| Strict leverage / covenant opacity | 80 | 45 | judgment | EBITDA falls and the undisclosed leverage covenant becomes binding before cash runs out | Executed credit agreement and quarterly compliance disclosure |
| 2033-note conversion cash call | 75 | 35 | judgment | Holders submit a material amount during the disclosed window | Filing after 30 Sep 2026 |
| One-model valuation error | 90 | 55 | judgment | A matched independent method supports the market price or the market-required return stays near 4.96% | Same-date peer export and reverse-DCF refresh |
| Policy / regulatory | 50 | 30 | judgment | A material service restriction, privacy rule, or enforcement matter changes demand/cost | 10-Q risk factors and regulator filings |
| Liquidity / positioning | 55 | 45 | judgment | Price moves sharply without a filing while borrow/options data remain absent | IBKR price, volume, borrow, and options snapshot; not available in this run |
| Thesis timing | 70 | 65 | judgment | Q3 is in line but the Q4–Q1 CIS conversion remains vague | Q3 results and Q4/Q1 revenue conversion |

**Correlation note:** profit compression, deployment delay, leverage, and valuation are all tied to the same cash-durability path. If capacity costs arrive while revenue slips, EBITDA falls, leverage rises, and the DCF weakens together. The rows are not independent protection.

### Forensic mosaic

| Tag | Distinct underlying signal | Counted separately? |
|---|---|---|
| RF-EQ-001 | Receivables grew 9.1% versus 5.4% FY2025 revenue growth; deferred revenue fell 4.1%; capitalized SBC rose as a share of revenue, although cash conversion stayed above 100%. [analyses/AKAM_2026-09-14/earnings/06_earnings-quality.md, §§3–9] | Yes — balance-sheet and capitalization trend |
| RF-DISC-002 | FY2025 SBC of $459.4m exceeded $452.0m GAAP net income; restructuring recurred; Q2 adjusted operating income exceeded GAAP by $190.4m. [analyses/AKAM_2026-09-14/management-governance/06_candor-and-disclosure-quality.md, §§2–5] | Yes — adjusted-reporting policy |
| RF-OBS-001 | Known gross lease-related exposure was $2.331bn = $1.8659bn scheduled payments + $278.0m uncommenced leases + $187.1m final commitment; $1.570bn was already recognized and $731.2m future sublease income is separate. [analyses/AKAM_2026-09-14/balance-sheet-survival/05_off-balance-sheet-and-contingencies.md, §§1–5] | Yes — obligation build |

Earnings/08 and governance echoes are deduplicated. Three distinct tags across three modules therefore form one **High compound accounting-integrity flag**. It is not proof of fraud and not a Critical flag, but it caps a long at Starter Position Only with no edge bypass.

## 9b. Governance & Stewardship

- **Non-Negotiable Gate: PASS.** No hard disqualifier, Critical governance flag, Disqualifying controller/KMP grade, or material undisclosed matter was found.
- **Checklist:** 116 of 179 tests answered, or 64.8%; 40 Green, 67 Amber, 9 Red, and 63 Not assessable. The worst binding inverted risk is RPT/leakage risk at 45/100; lower is better in that family. [analyses/AKAM_2026-09-14/management-governance/99_management-governance-synthesis.md, §§1–6]
- **Stewardship:** Misaligned or weak stewardship. Governance Score 50/100; Confidence-Adjusted Score 33/100; rating Weak.
- **People and network:** 24 named people were graded Clean on a coverage-limited own-record basis; 0 Minor, 0 Material, 0 Disqualifying, and one unnamed CSO. The clearest named monitor is Aaron Ahola because Nasdaq council recusal controls are unverified, not because an adverse personal record was found. Discovery reached hop 1 and stopped at its query budget with seven declared scope boundaries. This is not a clean-network claim.
- **Capital allocation:** FY2021–FY2025 cash acquisitions total $2.066bn, LayerX added $205m, and deal-level returns are undisclosed. H1 2026 buybacks of $615.744m were 278.4% of strict FCF of $221.174m = $638.774m CFO − $246.613m property/equipment − $170.987m capitalized software. [data/AKAM/Akamai Technologies, Inc., Q2 2026.pdf, Form 10-Q, p.7; Note 6]
- **Incentives:** 94.42% of available FY2025 grant units were service-based, burn was 4.73%, and overhang 13.04%; the frozen pool lacks the final proxy evidence needed for a full pay read.

### Governance Red-Flag Register

| Red Flag ID | Severity | Finding | Decision effect |
|---|---|---|---|
| RF-CAP-004 | High | Serial acquisitions without deal-level return or opportunity-cost evidence | Long rating capped at Watchlist |
| RF-SHR-001 | High | 41.9% (inherited public-source observation; unverified in this correction’s bound pool) of votes cast opposed the 8.0m-share stock-plan increase | Lowers shareholder-rights confidence; no hard lock |
| RF-DISC-002 | High | Recurring SBC/restructuring exclusions and large GAAP-to-adjusted gap | Part of forensic mosaic |
| RF-AUD-007 | High | PwC U.S. 2024 censure and $2.75m (inherited public-source observation; unverified in this correction’s bound pool) penalty; **no AKAM link identified** | Audit-quality penalty only |
| RF-FIN-003 | High | Gross known lease build of $2.331bn | Raises contingent-risk read |
| RF-CL-001 | High | Same lease build equals 46.8% of FY2025 equity and 515.7% of FY2025 PAT; recognized liability and sublease receipts are separate | No gate lock; keep matched basis |

The business-model disqualifier scan found **no disqualifier triggered**. Pledges and aggregate related-party transactions remain Not assessable because the incorporated proxy and ownership export are absent. [analyses/AKAM_2026-09-14/business-model/01_disqualifier-scan.md, §§1–4]

## 9A. Bull Case — Steelman

| Bull Driver | Why it could dominate | Evidence today | What would confirm it |
|---|---|---|---|
| Security and CIS growth | These categories can replace Delivery and use Akamai's global network more profitably if capacity fills. | Q2 Security grew 10% to $604.436m and CIS grew 39% to $99.319m. [data/AKAM/Akamai Technologies, Inc., Q2 2026.pdf, Form 10-Q, pp.23, 30] | Filed category profit/capital data and group margin recovery |
| Contracted CIS conversion | Signed business can produce a later revenue step even though Q3 does not accelerate. | Management reported more than $2.8bn of signed 2026 multi-year CIS commitments and described Q4/Q1 conversion. [data/AKAM/Akamai Technologies, Inc., Q2 2026 Earnings Call, Aug 06, 2026.pdf, prepared remarks and Q&A] | The two large Q4 contributions begin and Q1 accelerates without cash-capex slippage |
| Low required return | A 4.96% market-implied WACC supports the current price on the DCF cash path. | Reverse-DCF dual solve; 1.26 percentage points below the model WACC. [analyses/AKAM_2026-09-15/valuation/05_reverse-dcf.md, §2A] | Independent market/peer evidence supports a low rate and cash flow follows the path |
| Liquidity | Near-term debt does not force equity issuance. | $4.355bn committed liquidity and 2.92x cash-plus-current-securities coverage of the 2027 maturity. [analyses/AKAM_2026-09-14/balance-sheet-survival/99_balance-sheet-survival-synthesis.md, §§1–5] | 2033 notes do not convert materially and strict leverage falls |

The best opposite case is that Akamai is paying for a capacity build one or two quarters before a contracted CIS step-up, while its security platform continues to grow. If that revenue arrives with stable margins and investors keep using a roughly 5% required return, the $71.26 DCF can be too low. The single evidence item that would move the view most is filed Security/CIS cash economics that reconcile the category growth to group FCF.

## 10. What Would Kill the Thesis?

The Avoid is wrong if the operating option becomes cash, leverage falls, and an independent valuation supports the price. The top five tests follow.

### Thesis Kill Criteria

| Kill Criteria | Measured against (same period, prior year, same basis) | What It Would Mean | How To Monitor | Module Source |
|---|---|---|---|---|
| Q3 2026 revenue is at least $1,123.7m **and** GAAP gross margin is at least 59.3% | Q3 FY2025 standalone revenue $1,054.630m and GAAP gross margin 59.3%; no stub. The analogous test failed in Q1 and Q2 2026 because both margins were below their year-ago quarters and revenue growth was below 6.55%. | Growth has begun to carry reported economics, not only adjusted EPS. | Q3 Form 10-Q, expected around 3 Nov 2026 (vendor date) | earnings |
| LTM strict FCF reaches at least $736.8m by Q2 2027 | LTM Q2 2026 strict FCF $629.9m, same CFO-minus-total-cash-capex definition; no stub. FY2025 $699.3m and LTM Q2 2026 $629.9m were both below $736.8m. | The first one-year step toward the price-implied 16.97% FCF path is present. | Q2 2027 Form 10-Q and trailing cash-flow calculation | valuation; earnings |
| Strict net leverage is at or below 3.0x for two consecutive quarter-ends by Q2 2027 | Q2 2026 5.14x, filing debt less cash divided by GAAP-derived LTM EBITDA; no stub. The two-period condition was not met by FY2025 2.49x followed by Q2 2026 5.14x. | The May debt-funded balance-sheet change is reversing rather than compounding. | Q1 and Q2 2027 Forms 10-Q | balance-sheet-survival |
| A filed deal-level scorecard shows the FY2021–FY2025 $2.066bn acquisition cohort and $205m LayerX earn returns above the matched cost of capital | Compare each deal's post-acquisition cash return with its own invested capital and same-period cost of capital; no stub. No such scorecard existed in the last two annual/quarterly reviews. | RF-CAP-004 and the opportunity-cost concern may be temporary rather than structural. | FY2026 Form 10-K / 2027 proxy | management-governance |
| A second independent, matched-basis valuation supports value at or above the prevailing market price | Same-date EV, debt, cash, diluted shares, and forward earnings/cash basis; no stub. The own-history and peer methods both failed to produce a valid value in this run. | The sole DCF is giving a false negative. | Refresh same-date peer and own-history data after Q3 | valuation |

## 11. Positioning and Trade Construction

- **Position:** wait; no long and no short.
- **Entry style:** no automatic entry. A fall to the $71.26 base value would trigger a fresh review, not a buy order, because the value is one-model and RF-CAP-004 remains.
- **Add levels:** none while category economics and a second valuation are missing.
- **Stop-loss logic:** not applicable without a position. If a later event trade is taken, the stop may not protect us on an earnings gap.
- **What not to do:** do not short merely because base DCF is below price; the model has 82.85% terminal value and no borrow or positioning evidence.
- **Hedge:** none recommended from the supplied evidence.
- **Options:** not assessable; no pool options surface or implied-volatility data is available.

## 12. 2nd Best Bet

**No credible second-best bet exists from the available data.** The peer file identifies Cloudflare, Fortinet, and Fastly, but the competitive-intel module has no peer calls or matched read-through, and the peer valuation set is too heterogeneous to choose a safer or more convex expression.

## 13. Thesis → Antithesis Iteration

### Thesis 1

Security and CIS growth can turn Akamai into a faster-growing, higher-value cloud platform.

### Antithesis 1

The latest quarter shows revenue mix improving while GAAP margins and earnings worsen; solution-level economics are missing.

### Revised Thesis 2

The mix shift is an option, not yet a proven return. Value should depend on reported cash conversion and the price paid for that option.

### Antithesis 2

The DCF itself is fragile: combining the price-implied 16.97% cash-growth path with the separately solved 4.9553% market-required return produces a $153.39 good-outcome value.

### Final Thesis

Avoid the long at $106.79 because the priced cash path is not proven. Also avoid the short because the distribution includes a +43.64% good-outcome tail and positioning evidence is incomplete.

**Insight threshold reached: the remaining uncertainty is mostly data-dependent, not reasoning-dependent.**

## 14. Math Validation

- Probability sum: **10% + 15% + 45% + 30% = 100%**.
- Probability-weighted target: **0.10 × $153.39 + 0.15 × $113.62 + 0.45 × $71.26 + 0.30 × $47.30 = $78.64**.
- Expected return: **($78.64 − $106.79) / $106.79 = −26.36%**.
- Scenario returns: `bull_execution` **+43.64%**; `bull_dcf_sensitivity` **+6.39%**; base **−33.27%**; `bear_cyclical` **−55.71%**.
- Downside risk: **−min(+43.64%, +6.39%, −33.27%, −55.71%) = 55.71%**.
- Risk/reward: **($78.64 − $106.79) / ($106.79 − $47.30) = −0.47x**.
- Margin of safety: **($71.26 − $106.79) / $71.26 = −49.85%**.

The result is highly sensitive to WACC and terminal growth. That limitation caused a 10-point conviction downgrade. The repaired span uses an explicit DCF conjunction from the frozen reverse-DCF inputs, not an invented consensus target, and its +43.64% upside helps block a short.

# Part III — Module Chapters

## Chapter A: Business Model

**Verdict: Average business — deeper work only if valuation is low.** Business quality is 48/100, data quality 80/100, and synthesis usefulness 68/100. Security is 55% of Q2 revenue and grew 10%, but category profit is absent; Delivery fell 6%, group margins and ROIC declined, and cash conversion improved. The right qualified wording is “no moat proven; trajectory eroding on profit economics, not confirmed across every metric.” RF-BQ-005 trips the fast-changing-industry filter and caps business quality at 65, already above the 48 score. No hard disqualifier fired. Full audit trail: [analyses/AKAM_2026-09-14/business-model/99_business-model-synthesis.md].

## Chapter B: Earnings

**Verdict: Mixed earnings setup.** Earnings quality is 63/100, volatility 62/100 (inverted: higher is worse), data quality 80/100, and usefulness 65/100. Q2 revenue rose 5.4%, but GAAP-derived EBITDA fell 18.7%, GAAP EPS fell 26.8%, and gross margin fell 331 basis points. The revenue and margin bridges each have zero residual; the remaining uncertainty is category economics, not unexplained arithmetic. The Q3 consensus bar is fair and the next-quarter setup balanced, while the larger CIS test is Q4 and later. Earnings/08 reports 10 High and 8 Medium flags, with 0 Critical. Full audit trail: [analyses/AKAM_2026-09-14/earnings/99_earnings-synthesis.md].

## Chapter C: Balance Sheet Survival

**Verdict: Adequate.** Solvency strength is 56/100, liquidity 78/100, refinancing risk 34/100 (inverted), downside resilience 66/100, and usefulness 74/100. Strict net leverage is 5.14x; gross leverage is 6.39x. The $1.15bn scheduled 24-month wall is cash-covered, and the model survives a 60% EBITDA decline with a $3.097bn liquidity surplus, but leverage rises to 13.28x and actual covenant headroom is Not assessable. A separate $1.725bn conversion right is the near-term cash contingency. Full audit trail: [analyses/AKAM_2026-09-14/balance-sheet-survival/99_balance-sheet-survival-synthesis.md].

## Chapter D: Catalyst

**Verdict: Dated, evidenced near-term catalysts, but not a timed bull case.** Strength is 55/100, timing visibility 60/100, risk 68/100 (inverted), and usefulness 72/100. The nearest hard date is the 30 September 2033-note conversion-window end. The main operating event is CIS revenue conversion in Q4 2026–Q1 2027, but management gave a quarter window and warned that one or two weeks can move revenue. Because the main upside is vague and carries Filter 5, it does not raise conviction. Full audit trail: [analyses/AKAM_2026-09-14/catalyst/99_catalyst-synthesis.md].

## Chapter E: Competitive Intel

**Verdict: Not assessable; no effect on the investment view.** The frozen pool names Cloudflare, Fortinet, and Fastly but contains no peer transcript, peer results release, or permitted broker call summary. Coverage is 0% of AKAM's revenue categories, so direction, weight, and confidence are all Not assessable. This is an exposed gap, not a neutral peer signal. Full audit trail: [analyses/AKAM_2026-09-14/competitive-intel/99_competitive-intel-synthesis.md].

## Chapter F: Management & Governance

**Verdict: Misaligned or weak stewardship; Gate PASS.** Governance Score is 50/100, Confidence-Adjusted Score 33/100, and rating Weak; data quality is 58/100 and usefulness 68/100. The dedicated work overrides the business-model quick read on serial acquisitions and fires RF-CAP-004. It also carries five other High IDs but no Critical flag. The people sweep found no material own-record fact, yet remained coverage-limited and stopped at hop 1. Missing frozen proxy, ownership, RPT, and audit-fee data cap confidence. Full audit trail: [analyses/AKAM_2026-09-14/management-governance/99_management-governance-synthesis.md].

## Chapter G: Valuation

**Verdict: Materially overvalued, with low confidence.** The price is $106.79; 12-month levels are $153.39 joint execution bull, $113.62 sensitivity bull, $71.26 base, and $47.30 `bear_cyclical`, with a separate $35.22 structural floor over 24–36 months. Valuation attractiveness is 10/100, margin-of-safety score 5/100, valuation confidence 50/100, downside risk 85/100 (inverted), data quality 72/100, and usefulness 62/100. The Conditional cash-flow DCF is the only valid value-producing method and 82.85% of EV is terminal value. The peer and own-history reads have zero weight. Full audit trail: [analyses/AKAM_2026-09-15/valuation/99_valuation-synthesis.md].

# Part IV — Module Appendices

## Appendix A: Business Model — Sub-Agent Outputs

| File | Agent | Verdict / Headline Finding |
|---|---|---|
| `00_data-triage.md` | data-triage | Sufficient; all 16 frozen raw files extracted, but no proxy. |
| `01_disqualifier-scan.md` | disqualifier-scan | No disqualifier; pledge and RPT tests remain Not assessable. |
| `02_business-identity.md` | business-identity | Global cloud-security, edge/cloud-infrastructure, and delivery provider with contracted and usage revenue. |
| `03_segment-map.md` | segment-map | Security is the dominant revenue category; profit dominance is Not assessable. |
| `04_unit-economics.md` | unit-economics | Unclear; no Security customer contribution margin, acquisition cost, or lifetime data. |
| `05_customer-geography.md` | customer-geography | No customer ≥10%; U.S. supplied 51% of FY2025 revenue. |
| `06_value-chain.md` | value-chain | Mixed control; Delivery renewal pricing fell while network costs rose. |
| `07_business-quality.md` | business-quality | 48/100, Mixed/Average. |
| `08_competitive-map.md` | competitive-map | Position versus peers is not disclosed on a matched basis. |
| `09_moat.md` | moat | No moat proven; profit economics eroding, with improving cash conversion as a contradiction. |
| `10_external-dependency.md` | external-dependency | Partly externally driven by capacity, power, server, and memory inputs. |
| `11_capital-allocation-governance.md` | capital-allocation-governance | New convertibles, capex, and buybacks create allocation concerns. |
| `12_red-flags-sweep.md` | red-flags-sweep | Repeat product retirement/restructuring is an execution issue, not proof of aggressive accounting. |

## Appendix B: Earnings — Sub-Agent Outputs

| File | Agent | Verdict / Headline Finding |
|---|---|---|
| `00_earnings-data-triage.md` | earnings-data-triage | Sufficient; no active partial-data cap, but only six actual quarters. |
| `01_historical-financials.md` | historical-financials | Revenue stable; reported profitability compressing. |
| `02_revenue-drivers.md` | revenue-drivers | Security leads current growth; CIS is a later acceleration lever. |
| `03_margin-drivers.md` | margin-drivers | Near-term margin pressure; the bridge has zero residual. |
| `04_guidance-consensus.md` | guidance-consensus | Q3 bar is fair and on the correct standalone-quarter basis. |
| `05_beat-miss-setup.md` | beat-miss-setup | Balanced; Q4 timing matters more than Q3. |
| `06_earnings-quality.md` | earnings-quality | 63/100; cash-backed but adjustment noise is material. |
| `07_earnings-sensitivity.md` | earnings-sensitivity | 62/100 inverted; measurable operating-cost sensitivity is elevated. |
| `08_earnings-red-flags.md` | earnings-red-flags | Material concerns: 10 High, 8 Medium, 0 Critical. |

## Appendix C: Balance Sheet Survival — Sub-Agent Outputs

| File | Agent | Verdict / Headline Finding |
|---|---|---|
| `00_solvency-data-triage.md` | solvency-data-triage | Sufficient; numerical covenant headroom is the main gap. |
| `01_capital-structure-and-leverage.md` | capital-structure-and-leverage | Strict net leverage 5.14x; gross leverage 6.39x. |
| `02_maturity-wall-and-refinancing.md` | maturity-wall-and-refinancing | Scheduled maturities through Sep 2028 are self-funded; conversion is separate. |
| `03_liquidity-runway.md` | liquidity-runway | 100.5-month mechanical runway; 2027 maturity cash-covered. |
| `04_coverage-and-covenants.md` | coverage-and-covenants | Coupon service covered; covenant headroom Not assessable. |
| `05_off-balance-sheet-and-contingencies.md` | off-balance-sheet-and-contingencies | Known lease exposure is large; total maximum exposure is not aggregable. |
| `06_downside-stress-test.md` | downside-stress-test | Cash survives −30% to −60% EBITDA on known components; leverage does not. |

## Appendix D: Catalyst — Sub-Agent Outputs

| File | Agent | Verdict / Headline Finding |
|---|---|---|
| `00_catalyst-data-triage.md` | catalyst-data-triage | Sufficient for a calendar; issuer-confirmed Q3 and deployment dates are absent. |
| `01_catalyst-calendar.md` | catalyst-calendar | Financing dates are firm; the main CIS operating window is vague and §24-flagged. |

## Appendix E: Competitive Intel — Sub-Agent Outputs

| File | Agent | Verdict / Headline Finding |
|---|---|---|
| `00_competitive-intel-triage.md` | competitive-intel-triage | Insufficient; 0% peer-call coverage of AKAM revenue categories. |
| `01_peer-claim-extraction.md` | peer-claim-extraction | Insufficient; no usable competitor call in the pool. |
| `02_dimension-matrix.md` | peer-dimension-matrix | Not assessable; all 11 dimensions lack matched observations. |
| `03_readthrough-to-subject.md` | peer-readthrough-to-subject | Not assessable; no already-reported overlapping peer. |
| `04_narrative-triangulation.md` | peer-narrative-triangulation | Not testable; no peer claim corroborates or contradicts AKAM. |

## Appendix F: Management & Governance — Sub-Agent Outputs

| File | Agent | Verdict / Headline Finding |
|---|---|---|
| `00_governance-data-triage.md` | governance-data-triage | Partial; FY2026 DEF 14A is the highest-value missing governance document. |
| `01_management-and-track-record.md` | management-and-track-record | Mixed; stable founder-led team, but little completed guidance history. |
| `02_capital-allocation-scorecard.md` | capital-allocation-scorecard | Weak; per-share value creation is not proven and RF-CAP-004 fires. |
| `03_incentives-and-compensation.md` | incentives-and-compensation | Partial and weakly aligned; 43/100 under the proxy cap. |
| `04_ownership-and-insider-behavior.md` | ownership-and-insider-behavior | Insufficient for full alignment; complete trades and pledges are missing. |
| `05_board-and-shareholder-rights.md` | board-and-shareholder-rights | Board independent; shareholder rights mixed and constrained. |
| `06_candor-and-disclosure-quality.md` | candor-and-disclosure-quality | Mixed; disclosed adjusted framing changes the economic picture. |
| `07_people-integrity-dossiers.md` | people-integrity-dossiers | Coverage-limited; no material or disqualifying personal fact found. |
| `08_audit-and-assurance-quality.md` | audit-and-assurance-quality | Mixed; clean opinions, incomplete partner/fee coverage, unrelated firm censure. |
| `09_related-party-and-group-forensics.md` | related-party-and-group-forensics | Mixed/unknown leakage risk; aggregate RPT dollars and cash-by-entity map absent. |
| `10_contingent-liabilities-and-commitments.md` | contingent-liabilities-and-commitments | Moderate risk concentrated in the matched $2.331bn lease build. |
| `11_accounting-forensics.md` | accounting-forensics | Mixed; Beneish green, Dechow amber, recurring restructuring red. |
| `12_regulatory-legal-and-compliance.md` | regulatory-legal-and-compliance | Coverage-limited watch; no current hard-lock matter confirmed. |

## Appendix G: Valuation — Sub-Agent Outputs

| File | Agent | Verdict / Headline Finding |
|---|---|---|
| `00_valuation-data-triage.md` | valuation-data-triage | Sufficient, with method limits. |
| `01_price-and-capital-structure.md` | price-and-capital-structure | Pool-verified $106.79 anchor and filing-based EV bridge. |
| `02_multiples-own-history.md` | multiples-own-history | Upper-range directional read; fair value Not assessable from six closes. |
| `03_relative-valuation-peers.md` | relative-valuation-peers | Warranted peer value Not assessable; $377.81 is mechanical only. |
| `04_intrinsic-dcf.md` | intrinsic-dcf | Base $71.26; low confidence and 82.85% terminal value. |
| `05_reverse-dcf.md` | reverse-dcf | Price requires 16.97% annual FCF growth at 6.22% WACC. |
| `06_sum-of-the-parts.md` | sum-of-the-parts | SOTP collapses because AKAM reports one segment and no category profit/capital. |
| `07_scenario-and-fair-value.md` | scenario-and-fair-value | One-method four-case distribution $153.39 / $113.62 / $71.26 / $47.30; raw50, effective40. |

# Part V — Evidence and Process

## 15. Evidence Used

| Evidence Source | What It Proves | Quality | Freshness | Problems |
|---|---|---|---|---|
| FY2025 Form 10-K | Audited financials, business, leases, commitments, restructuring, audit opinion | High | Filed 20 Feb 2026 | Proxy-incorporated items are outside the frozen file |
| Q1 and Q2 FY2026 Forms 10-Q | Current revenue, margins, cash flow, debt, conversion terms, categories | High | Through 30 Jun 2026 | Category profit/capital and covenant formula absent |
| Q1/Q2 supplemental workbooks | Reported/adjusted bridges and quarterly metrics | Medium | Through Q2 2026 | Company-defined adjusted measures; must stay separate from GAAP |
| Q2 earnings release and calls | Guidance, CIS deployment timing, operating explanation | Medium | 6 Aug 2026 | Management narrative, not audited outcome |
| 9 Sep 2026 conferences | Newer CIS timing detail | Medium | Five days before decision | Management commentary; no filed deployment date |
| Capital IQ estimates workbook and deterministic facts | Price, consensus, revisions, target range, vendor history | Medium | Price 14 Sep; estimates dated 4–7 Sep | Vendor definitions differ from filings; snapshot header not single-dated |
| Capital IQ comparable workbook | Price and named peers | Medium | 14 Sep 2026 | Peer set heterogeneous; subject multiple does not reconcile to filing EV |
| Competitive peer evidence | No usable evidence | Low | N/A | No peer calls, results releases, or broker summaries in frozen pool |

### Claim Quality Ledger

| Key Claim | Claim Quality Level 0–5 | Evidence | Weakness / Caveat | Keep, Downgrade, or Remove |
|---|---:|---|---|---|
| Q2 revenue grew while GAAP profitability fell | 5 | Q2 Form 10-Q and supplemental metrics | EBITDA is explicitly GAAP-derived | Keep |
| Strict net leverage was 5.14x | 5 | Filing debt/cash and GAAP-derived LTM EBITDA | Excludes operating leases; broad vendor basis differs | Keep with strict basis |
| Scheduled 2027 maturity is cash-covered | 5 | Q2 balance sheet and debt note | Separate 2033 conversion right remains | Keep |
| Base value is $71.26 | 1 | Reproducible DCF using filing bridge and consensus inputs | One method; 82.85% terminal value | Keep, low confidence |
| Price implies 16.97% FCF growth at 6.22% WACC | 1 | Executed reverse-DCF | Model-conditional; 4.96% market-rate solve is contrary evidence | Keep with condition |
| Serial acquisitions total $2.066bn plus $205m LayerX | 4 | Tier-5 cash-flow history plus Q2 filing | Deal returns unavailable | Keep; do not claim destruction as proven |
| No moat is proven; profit economics are eroding | 4 | Filing and vendor margin/ROIC trends | Cash conversion improved, so not confirmed across every metric | Keep qualified |
| Consensus expects $153.31 mean target | 4 | Capital IQ Consensus sheet | Target prices are opinions, not value proof | Keep as consensus, not valuation |
| A short would work | 0 | The modeled good-outcome case is +43.64%, and borrow and options data are absent | Unsupported | Remove; final action is no short |

## 16. Module Scorecard

| Module | Main Verdict | Module Synthesis Usefulness /100 | Sub-Agent Exception | Key Weakness | Override Needed? |
|---|---|---:|---|---|---|
| business-model | Average business | 68 | unit-economics: unclear | Category profit, capital, retention absent | No |
| earnings | Mixed earnings setup | 65 | earnings-red-flags: 10 High flags | Only six quarters; definition gaps | No |
| balance-sheet-survival | Adequate | 74 | coverage-and-covenants: headroom Not assessable | Executed credit agreement absent | No |
| catalyst | Dated events, weak operating timing | 72 | None | Main bull event is vague | No |
| competitive-intel | Not assessable | 0 | Entire module evidence gap | No peer calls/results | No; carries zero weight |
| management-governance | Misaligned or weak stewardship | 68 | data triage partial; people sweep coverage-limited | Proxy, ownership, legal/registry breadth | No; it supersedes the business-model quick read in its own scope |
| valuation | Materially overvalued | 62 | DCF confidence capped at 50 | One method; master span case requires a low-probability cash-growth/WACC conjunction | No |

## 17. Consensus Expectations

- **Q3 2026 revenue:** $1,118.153m, 22 analysts; 0.06% above the $1,117.5m guidance midpoint.
- **Q3 EBITDA:** $434.247m, 17 analysts; directionally 0.39% below the derived management midpoint, with no full definition bridge.
- **Q3 normalized EPS:** $1.68032, 22 analysts; 1.16% below the $1.70 company non-GAAP midpoint, with no formal definition bridge.
- **FY2026 revenue / EBITDA / normalized EPS:** $4,491.263m / $1,749.296m / $6.69863; analyst counts 24 / 19 / 25.
- **Target price:** mean $153.31, median $155, high $195, low $93, standard deviation $27.64, 23 estimates.
- **Revisions:** Q3 revenue and normalized EPS each fell about 1.2% over 90 days; last-month FY2026 revenue breadth was 3 up / 1 down and GAAP EPS 0 up / 1 down.
- **Dispersion:** the target range is wide; forecast dispersion also expands beyond FY2026. Four observed quarterly revenue/normalized-EPS beats are too few for an empirical beat rate.

**Market bar: fair.** Consensus sits inside management's ranges and near the midpoints. It is neither an easy cushion nor a demanding threshold. [data/AKAM/AkamaiTechnologies,IncNasdaqGSAKAMEstimatesReport.xls, Consensus, Guidance, Trends, Revisions, and Surprise sheets, data as of 2026-09-14]

## 18. Balance Sheet and Survival Test

- **Debt and net debt:** $7.5628bn carrying debt; $6.0826bn strict net debt = debt less $1.4803bn cash and equivalents. Marketable securities are liquidity but are not silently netted into the strict figure.
- **Leverage:** 6.39x gross and 5.14x strict net leverage on $1.1841bn LTM GAAP-derived EBITDA. The known LayerX stress basis is 5.31x.
- **Maturity wall:** $1.150bn, or 15.1% of principal, due 1 Sep 2027. The $1.725bn 2033-note conversion right is a separate timing contingency, not added to scheduled maturities.
- **Liquidity:** $4.3554bn = $1.4803bn cash + $1.8751bn current marketable securities + $1.0000bn committed undrawn revolver. The 100.5-month runway is a mechanical coverage translation, not a forecast.
- **Covenants:** compliance is reported, but the maximum leverage threshold, actual covenant ratio, Covenant EBITDA, addback caps, triggers, cures, and default terms are absent. Headroom is **Not assessable**.
- **Stress:** the zero-mitigation −60% EBITDA bound leaves a $3.0974bn 12-month liquidity surplus but pushes strict net leverage to 13.28x. The analyst-only 6.0x warning is crossed after an 11.5% EBITDA decline. This is not a covenant.

The survival read removes a distress verdict-lock but does not make 5.14x strict leverage low. [analyses/AKAM_2026-09-14/balance-sheet-survival/99_balance-sheet-survival-synthesis.md, §§1–7]

## Forecast Ledger

| Prediction | Probability | Time Window | Evidence Today | Confirmation Trigger | Falsification Trigger | Owner Module | Type | Confidence /100 |
|---|---:|---|---|---|---|---|---|---:|
| Q3 2026 revenue is at least $1,123.7m | 45% — judgment | 15 Oct–15 Nov 2026 | Consensus is $1,118.153m; guidance is $1,105m–$1,130m; four observed beats are not a base rate | Q3 Form 10-Q reports revenue ≥$1,123.7m | Q3 Form 10-Q reports revenue <$1,123.7m | earnings | revenue | 68 |
| Q3 2026 normalized EPS is at least $1.70 | 55% — judgment | 15 Oct–15 Nov 2026 | Consensus $1.68032 is below the $1.70 non-GAAP midpoint, but definitions do not fully bridge | Q3 release reports normalized/non-GAAP EPS ≥$1.70 on the same disclosed basis | Q3 release reports normalized/non-GAAP EPS <$1.70 on that basis | earnings | earnings_eps | 62 |
| Q3 2026 GAAP gross margin remains below the Q3 FY2025 59.3% comparable | 75% — judgment | 15 Oct–15 Nov 2026 | Q1 and Q2 FY2026 margins were below their year-ago quarters; costs grew faster than revenue | Q3 Form 10-Q reports GAAP gross margin <59.3% | Q3 Form 10-Q reports GAAP gross margin ≥59.3% | earnings | margin_or_cost | 72 |
| LTM strict FCF reaches at least $736.8m by Q2 2027 | 35% — judgment | 1 Jul–15 Aug 2027 | LTM Q2 2026 strict FCF was $629.9m; $736.8m is its first 16.97% annual growth step | Q2 2027 Form 10-Q cash-flow data yield LTM CFO minus property/equipment and capitalized-software cash capex ≥$736.8m | Same named filing and basis yield <$736.8m | valuation | cash_flow | 65 |

The first three forecasts resolve within 90 days of the decision date. Their triggers partition the outcome and name the company filing or release that settles them. All probabilities are judgment, including the 75% margin call; none is an empirical frequency.

## Evidence Inventory, Sufficiency, and Data Needs

**Present:** 16 frozen raw files, successful extracts, FY2025 10-K, Q1/Q2 2026 10-Qs and calls, current supplemental data, price, consensus, revisions, capital structure, maturity schedule, and all seven terminal module syntheses. There are no missing required modules and no carried-forward module outputs.

**Missing or incomplete:** filed category profit/capital/retention; a valid matched peer valuation; peer calls/results; the frozen FY2026 proxy and complete ownership/Form 4 history; deal-level acquisition returns; executed credit agreement/covenant definitions; company-confirmed Q3 date and deployment schedule; current issuer rating; and options/borrow/liquidity data.

**Data sufficiency: 72/100 — good, with decision-relevant gaps.** This does not trigger a data-sufficiency rating cap. The active cap comes from RF-CAP-004 and the forensic mosaic; the valuation confidence cap comes from one method.

**Single highest-value next request:** a complete same-date matched peer valuation with EV, LTM and NTM revenue, EBITDA, EBIT, EPS, FCF, net debt, diluted shares, and data dates for Cloudflare, Fortinet, and Fastly. It is the most direct way to test whether the one-method $71.26 result is a false negative.

## Calibration Feedback and Process Notes

The latest summary is [analyses/performance/2026-09-14_calibration_summary.json]. Its verdict is Pre-data: 16 decisions, 13 reviews, 4 resolved forecasts, and 1 resolved directional call; Brier, hit rate, and basket spread are below floor and withheld. Module, forecast-type, and thesis-type slices are empty, so none can adjust this run.

Leading error categories were checked even in Pre-data:

| Leading category | Current-run defense |
|---|---|
| bad base rate (n=2) | The reverse-DCF compares FCF growth with matched FCF history, not revenue, and labels four-quarter surprise history as judgment rather than a frequency. [analyses/AKAM_2026-09-15/valuation/05_reverse-dcf.md, §§3–5; analyses/AKAM_2026-09-14/earnings/04_guidance-consensus.md, §6] |
| valuation multiple error (n=2) | Six-close own history and the heterogeneous 59.4x peer median are assigned 0% weight; the $377.81 mechanical output is excluded. [analyses/AKAM_2026-09-15/valuation/07_scenario-and-fair-value.md, §§1–2] |
| bad causal inference (n=3) | Revenue and margin bridges print their arithmetic and zero residuals; no category sensitivity is treated as a forecast. [analyses/AKAM_2026-09-14/earnings/99_earnings-synthesis.md, §§2–3] |
| false negative (n=2) | The module's +6.39% bull failed the span test, so the master explicitly models the joint price-implied cash path and 4.9553% WACC at $153.39 (+43.64%), refuses a short, and retains a second valuation as the top data request. [analyses/AKAM_2026-09-15/valuation/04_intrinsic-dcf.md, §§4–7; analyses/AKAM_2026-09-15/valuation/05_reverse-dcf.md, §§2–2A; this dossier §§8–9A] |
| timing error (n=2) | The catalyst calendar separates the vendor-expected Q3 date from proven contractual dates and labels Q4–Q1 CIS timing vague. [analyses/AKAM_2026-09-14/catalyst/99_catalyst-synthesis.md, §§1–4] |

**Calibration status: `checked_no_action`; haircut: 0 points.** These defenses reduce the chance of repeating the named process errors but do not prove the investment call correct.

The original run reported a failed shadow-memory compilation. This targeted correction does not claim that process ran again. The prior record and adverse audits were read explicitly as correction evidence; no new memory-derived fact or score is used.

This maintenance task extracted the current source pool locally with the canonical extractor on 2026-09-15, then read its immutable generation. It also captured official market-input pages in a separate dated archive, preserving hashes and limited fact excerpts. The old frozen generation remains historical; it is not claimed to contain these newly captured pages. `evidence_binding.json` records the new generation and source digests. Unaffected research is reused with the original dates and citations; additional peer exports present in the new inventory are not called absent and have not been turned into a new matched peer valuation.
