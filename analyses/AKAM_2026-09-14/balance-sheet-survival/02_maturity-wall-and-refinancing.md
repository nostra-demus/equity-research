# Maturity Wall & Refinancing — AKAM

All amounts are USD millions under U.S. GAAP. Debt balances are at 30 June 2026; the maturity buckets and weighted-average maturity (WAM) are measured from 14 September 2026. The debt total is contractual principal of $7,640.0m, which is the maturity basis and reconciles to the $7,562.8m carrying-value gross-debt figure in `01`; the $77.2m difference is unamortized issuance costs. Operating leases are excluded because `01` treats them separately from interest-bearing debt. [Q2 FY2026 Form 10-Q, Note 7 (Debt), pp.17–20; `01_capital-structure-and-leverage.md`, Debt Stack]

## 1. Maturity Schedule

| Period | Amount Due | % of Total Debt | Instrument(s) | Source |
|---|---:|---:|---|---|
| Within 12 months | $1,150.0 | 15.1% | 0.375% 2027 convertible senior notes, due 1 Sep 2027 | [Q2 FY2026 Form 10-Q, Note 7 (Debt), pp.17–19] |
| Year 2 | $0.0 | 0.0% | No contractual maturity | [Q2 FY2026 Form 10-Q, Note 7 (Debt), pp.17–19] |
| Year 3 | $1,265.0 | 16.6% | 1.125% 2029 convertible senior notes, due 15 Feb 2029 | [Q2 FY2026 Form 10-Q, Note 7 (Debt), pp.17–19] |
| Year 4 | $1,750.0 | 22.9% | 0.000% 2030 convertible senior notes, due 15 May 2030 | [Q2 FY2026 Form 10-Q, Note 7 (Debt), pp.17–19] |
| Year 5 | $0.0 | 0.0% | No contractual maturity | [Q2 FY2026 Form 10-Q, Note 7 (Debt), pp.17–19] |
| Thereafter | $3,475.0 | 45.5% | 0.000% 2032 notes ($1,750.0m) and 0.250% 2033 notes ($1,725.0m) | [Q2 FY2026 Form 10-Q, Note 7 (Debt), pp.17–19] |
| **Total** | **$7,640.0** | **100.0%** | **Five senior unsecured convertible-note series** | [Q2 FY2026 Form 10-Q, Note 7 (Debt), pp.17–20] |

The $1,725.0m 2033 Notes are **not** a contractual near-term maturity and are therefore not added to the table. They were classified current at 30 June because holders could convert during Q3 2026 after the market-price condition was met; the company would pay the principal in cash on conversion. No holder had submitted notes for conversion through the 7 August filing date. The post-filing conversion status is not proven from the frozen evidence. [Q2 FY2026 Form 10-Q, Note 7 (Debt), pp.17–18]

The deterministic CIQ sidecar reports the older 31 December 2025 capital-structure block: $4,105m of dated notes, $5,675m total principal including leases, 0 floating and a roughly 4.5-year WAM. That vendor block predates the $3,500m May 2026 issuance, so the primary Q2 filing's five-note schedule is used for the current wall rather than silently applying the stale vendor schedule. [ciq_facts.json, `debt_maturity_wall`, present; Q2 FY2026 Form 10-Q, Note 7 (Debt), p.17]

## 2. Maturity Profile Metrics

| Metric | Value |
|---|---:|
| Weighted-average maturity (years) | 4.19 years |
| % due within 12 months | 15.1% ($1,150.0m scheduled) |
| % due within 24 months | 15.1% ($1,150.0m scheduled) |
| % due within 36 months | 31.6% ($2,415.0m scheduled) |
| Largest single maturity year (and amount) | 2030 and 2032 tie: $1,750.0m each (22.9% each) |

WAM is contractual-maturity based: ($1,150.0m × 0.96 years + $1,265.0m × 2.42 + $1,750.0m × 3.67 + $1,750.0m × 5.67 + $1,725.0m × 6.67) ÷ $7,640.0m = 4.19 years. The 12/24/36-month shares are measured from 14 September 2026; they exclude the separately stated $1,725.0m conversion contingency because it is not a maturity. [Q2 FY2026 Form 10-Q, Note 7 (Debt), pp.17–19; calculation from stated rows]

## 3. Rate Exposure

| Metric | Value | Source |
|---|---:|---|
| Fixed-rate share | 100.0% of $7,640.0m principal | [Q2 FY2026 Form 10-Q, Note 7 (Debt), pp.17–20] |
| Floating-rate share | 0.0% drawn; the $1.0bn committed 2022 revolver and $150.0m uncommitted 2025 facility would float if drawn | [Q2 FY2026 Form 10-Q, Note 7 (Debt), pp.19–20; Form 10-Q, Market Risk, p.43] |
| Weighted-average coupon | 0.30% = (($1,150.0m × 0.375%) + ($1,265.0m × 1.125%) + ($1,725.0m × 0.250%)) ÷ $7,640.0m | [Q2 FY2026 Form 10-Q, Note 7 (Debt), p.17; calculation from stated rows] |
| Current market refi rate (matching tenor) | 4.78% 5-year U.S. Treasury par yield on 11 Sep 2026 — a risk-free benchmark, not an all-in Akamai credit rate | [Web: U.S. Treasury Daily Treasury Par Yield Curve, 2026-09-11 (indicative, unverified)] |
| Estimated refi cost step-up (bps) | At least +448 bps: 4.78% − 0.30%, before an Akamai credit spread | [Web: U.S. Treasury Daily Treasury Par Yield Curve, 2026-09-11 (indicative, unverified); Q2 FY2026 Form 10-Q, Note 7 (Debt), p.17; calculation from stated rows] |

The +448 bps is a lower-bound comparison, not an estimate of an all-in unsecured refinancing coupon: no current Akamai credit spread or bond yield is in the frozen pool. It also does not predict the cost of another convertible. Akamai issued $3,500.0m of zero-coupon 2030 and 2032 convertibles in May 2026, whose economic price includes an equity conversion option and related hedge/warrant transactions rather than a plain-vanilla cash coupon. With no floating debt drawn, a rate move does not directly reprice the existing notes; it raises future revolver and refinancing cost instead. [Q2 FY2026 Form 10-Q, Note 7 (Debt), pp.17–20; Statements of Cash Flows, pp.7–8]

## 4. Refinancing Exposure

### Refi Funding Plan (no speculation)

| Source of repayment for next-24m maturities | Amount | Evidence |
|---|---:|---|
| Cash on hand | $1,480.3m cash and equivalents; $1.5m separate restricted cash is excluded | [Q2 FY2026 Form 10-Q, Condensed Consolidated Balance Sheets, p.3; Statements of Cash Flows, p.8] |
| Current marketable securities | $1,875.1m; cash plus these current securities is $3,355.4m on a labelled broad-liquidity basis | [Q2 FY2026 Form 10-Q, Condensed Consolidated Balance Sheets, p.3; calculation from stated rows] |
| Forecast FCF (or recent run-rate, labeled) | $629.9m LTM operating FCF run-rate, not a forecast: $1,447.2m CFO − $817.3m total capex | [FY2025 Form 10-K, Statements of Cash Flows, pp.55–56; Q2 FY2026 Form 10-Q, Statements of Cash Flows, pp.7–8; calculation from stated rows] |
| Revolver availability (only if availability known) | $1,000.0m committed 2022 facility with no borrowings; the filing does not separately state availability after any letters of credit or reserves, so it is not required for the market-closure conclusion | [Q2 FY2026 Form 10-Q, Note 7 (Debt), pp.19–20; Capital IQ Financials → Capital Structure Summary, 2026-08-07 filing column — vendor basis, “Undrawn Revolving Credit” $1,000.0m] |
| Asset-sale proceeds (only if announced / authorized) | Unknown; none announced or authorized in the frozen evidence | [Q2 FY2026 Form 10-Q, Note 7 (Debt); Item 2, Liquidity and Capital Resources] |
| New debt issuance (only if committed / announced) | No issuance announced for the 2027 maturity. Historical activity only: $3,500.0m of 2030/2032 convertibles issued in May 2026. | [Q2 FY2026 Form 10-Q, Note 7 (Debt), p.17; Statements of Cash Flows, pp.7–8] |

The scheduled next-12-month maturity is $1,150.0m, covered by the $1,480.3m strict cash balance without relying on FCF, current marketable securities, or the revolver. The larger near-term issue is contingent: if all $1,725.0m of currently convertible 2033 Notes demanded cash principal while the $1,150.0m 2027 Notes also came due, the combined $2,875.0m would exceed cash alone but is below cash plus current marketable securities of $3,355.4m; this uses the filing's current-securities classification and is an inference, not a disclosed repayment plan. [Q2 FY2026 Form 10-Q, Condensed Consolidated Balance Sheets, p.3; Note 7 (Debt), pp.17–18; calculation from stated rows]

No current issuer rating, outlook, or rating-agency action is disclosed in the frozen pool, so rating posture is **not proven from available data**. Recent market access is proven only by the May 2026 $3,500.0m zero-coupon convertible issuance; it is evidence of then-current access, not a commitment to refinance the 2027 Notes. The conclusion is **self-funded / low refi risk** for scheduled maturities through September 2028, while the conversion contingency and continued cloud-capex cash use remain the key qualifications. [Q2 FY2026 Form 10-Q, Note 7 (Debt), pp.17–20; Item 1A, Risk Factors, pp.60–61]

## 5. Refinancing Read

The contractual wall begins with $1,150.0m (15.1% of principal) due 1 September 2027; 31.6% is due by September 2029, while $3,475.0m (45.5%) is not due until 2032–33. Cash-coupon cost is only 0.30%, but a plain unsecured refinancing at the 11 September 2026 5-year Treasury benchmark would step up by at least 448 bps before credit spread; this is a lower bound, and a convertible refinancing is not comparable to a straight bond. [Q2 FY2026 Form 10-Q, Note 7 (Debt), pp.17–20; Web: U.S. Treasury Daily Treasury Par Yield Curve, 2026-09-11 (indicative, unverified)]

The single biggest refinancing risk is the $1,725.0m 2033 series' active Q3 2026 conversion right, which is a cash-principal contingency rather than a 2033 maturity. AKAM survives the next 12 months under a market-closure assumption (no new unsecured issuance): $1,480.3m cash exceeds the $1,150.0m scheduled maturity; if the conversion contingency is added, the $2,875.0m combined amount remains below $3,355.4m of cash plus current marketable securities. This conclusion assumes those current marketable securities remain saleable at their reported value and excludes the undrawn revolver and future FCF. [Q2 FY2026 Form 10-Q, Condensed Consolidated Balance Sheets, p.3; Note 7 (Debt), pp.17–20; calculation from stated rows]
