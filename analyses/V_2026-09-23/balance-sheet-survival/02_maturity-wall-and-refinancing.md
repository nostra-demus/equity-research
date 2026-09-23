# Maturity Wall & Refinancing — V

Visa Inc. reports in USD under U.S. GAAP and has a September fiscal year-end. Amounts below are USD millions at June 30, 2026, unless stated otherwise. The debt note lists each note and its maturity rather than one aggregate maturity table; this schedule is therefore reconstructed from the disclosed principal of every instrument. It sums to $24,131m principal, which reconciles to the upstream canonical $23,858m carrying-value gross debt after $165m of unamortized discounts/issuance costs and $108m of hedge-accounting adjustments. `[data/V/Visa Inc. Q3 FY2026 Form 10-Q, filed 2026-07-29, Note 8 (Debt), pp.17–18]` The June 2026 carrying value also agrees with the source-bound vendor fact of $23,858m; the sidecar's older maturity block is as-reported at September 2025 and is not substituted for the intervening filing. `[data/V/ciq_facts.json, \`total_debt_m\` and \`debt_maturity_wall\`, Jun-30-2026 / Sep-30-2025 — CIQ vendor basis]`

## 1. Maturity Schedule

| Period | Amount Due | % of Total Debt | Instrument(s) | Source |
|---|---:|---:|---|---|
| Within 12 months | $3,000 | 12.4% | $1,500 commercial paper classified current; $1,500 1.90% notes due Apr. 2027 | `[Visa Q3 FY2026 Form 10-Q, Note 8 (Debt), pp.17–18]` |
| Year 2 | $2,678 | 11.1% | $500 0.75% notes due Aug. 2027; $750 2.75% notes due Sep. 2027; $1,428 2.25% euro notes due May 2028 | `[Visa Q3 FY2026 Form 10-Q, Note 8 (Debt), pp.17–18]` |
| Year 3 | $2,042 | 8.5% | $900 3.80% notes due Feb. 2029; $1,142 2.00% euro notes due Jun. 2029 | `[Visa Q3 FY2026 Form 10-Q, Note 8 (Debt), pp.17–18]` |
| Year 4 | $1,500 | 6.2% | 2.05% notes due Apr. 2030 | `[Visa Q3 FY2026 Form 10-Q, Note 8 (Debt), pp.17–18]` |
| Year 5 | $1,750 | 7.3% | $750 4.10% and $1,000 1.10% notes, both due Feb. 2031 | `[Visa Q3 FY2026 Form 10-Q, Note 8 (Debt), pp.17–18]` |
| Thereafter | $13,161 | 54.5% | Notes due 2033–2050, including the $3,500 4.30% notes due Dec. 2045 | `[Visa Q3 FY2026 Form 10-Q, Note 8 (Debt), pp.17–18]` |
| **Total** | **$24,131 principal** | **100.0%** | **$22,631 senior notes + $1,500 commercial paper** | `[Visa Q3 FY2026 Form 10-Q, Note 8 (Debt), pp.17–18]` |

The balance-sheet current-debt carrying value is $2,996m, rather than the $3,000m current-principal row, because discounts, issuance costs and hedge-accounting adjustments are reported only in aggregate. `[Visa Q3 FY2026 Form 10-Q, Consolidated Balance Sheets and Note 8, pp.4, 17–18]`

## 2. Maturity Profile Metrics

| Metric | Value |
|---|---:|
| Weighted-average maturity (years) | 9.3 years, principal-weighted from June 30, 2026. Commercial paper is assumed to mature in six months solely for this calculation; its permitted 0–397-day maturity range changes the result only to 9.28–9.38 years. `[Visa Q3 FY2026 Form 10-Q, Note 8 (Debt), pp.17–18; calculation]` |
| % due within 12 months | 12.4% = $3,000 / $24,131. `[Visa Q3 FY2026 Form 10-Q, Note 8 (Debt), pp.17–18; calculation]` |
| % due within 24 months | 23.5% = $5,678 / $24,131. `[Visa Q3 FY2026 Form 10-Q, Note 8 (Debt), pp.17–18; calculation]` |
| % due within 36 months | 32.0% = $7,720 / $24,131. `[Visa Q3 FY2026 Form 10-Q, Note 8 (Debt), pp.17–18; calculation]` |
| Largest single maturity year (and amount) | Calendar 2045: $3,500 (14.5% of principal), the 4.30% USD notes. `[Visa Q3 FY2026 Form 10-Q, Note 8 (Debt), pp.17–18; calculation]` |

## 3. Rate Exposure

| Metric | Value | Source |
|---|---:|---|
| Fixed-rate share | 93.8% of principal ($22,631 senior notes) on legal coupon terms. The post-swap economic fixed share is not disclosed. | `[Visa Q3 FY2026 Form 10-Q, Note 8 (Debt), pp.17–18]` |
| Floating-rate share | 6.2% ($1,500 commercial paper) on legal terms; the commercial-paper rate rolls at maturity. Visa has swaps on an undisclosed portion of senior notes, so total economic floating exposure is not assessable. | `[Visa Q3 FY2026 Form 10-Q, Note 8 (Debt), p.18]` |
| Weighted-average coupon | 3.07% across $24,131 principal, weighted by each disclosed legal coupon and the 3.77% commercial-paper rate. The weighted average reported effective rate is 3.18%; neither figure incorporates an undisclosed swap notional. | `[Visa Q3 FY2026 Form 10-Q, Note 8 (Debt), pp.17–18; calculation]` |
| Current market refi rate (matching tenor) | 5.24% yield to maturity on Visa's USD 4.70% notes due Feb. 2036, a roughly 9.4-year remaining-tenor market proxy. Quote calculation date: Sep. 10, 2026; retrieved Sep. 23, 2026. | `[Web: finanzen.net, Visa 4.700% notes due 2036, quote/yield dated 2026-09-10 — indicative, unverified]` |
| Estimated refi cost step-up (bps) | **+207 bps for USD debt** = 5.24% current USD bond yield − 3.18% weighted USD effective rate. This comparison uses only $18,250m USD debt; applying a USD yield to the $5,881m euro notes would mix currencies. Euro refinancing cost is not assessable from the available evidence. | `[Visa Q3 FY2026 Form 10-Q, Note 8 (Debt), pp.17–18; Web: finanzen.net, Visa 4.700% notes due 2036, quote/yield dated 2026-09-10 — indicative, unverified; calculation]` |

On the disclosed legal-rate structure, a 100-basis-point move affects the $1,500m commercial-paper balance by about $15m annualized if that balance remains outstanding. That is a direct short-rate sensitivity only; it does not capture the undisclosed interest-rate swaps on senior notes. `[Visa Q3 FY2026 Form 10-Q, Note 8 (Debt), p.18; calculation]`

## 4. Refinancing Exposure

### Refi Funding Plan (no speculation)

| Source of repayment for next-24m maturities | Amount | Evidence |
|---|---:|---|
| Cash on hand | $12,359 | Cash and cash equivalents at June 30, 2026; restricted cash, customer collateral and litigation escrow are separate and excluded. `[Visa Q3 FY2026 Form 10-Q, Consolidated Balance Sheets and Note 4, pp.4, 14]` |
| Forecast FCF (or recent run-rate, labeled) | $21,013 recent LTM FCF run-rate; **not a forecast or committed source** | LTM CFO $22,580 less total capex $1,567 = $21,013. CFO fell 3.9% year on year, so this run-rate should not be treated as guaranteed. `[Visa FY2025 Form 10-K, Consolidated Statements of Cash Flows, p.65; Visa Q3 FY2026 Form 10-Q, Consolidated Statements of Cash Flows, p.10; calculation]` |
| Revolver availability (only if availability known) | Unknown; excluded | The FY25 filing disclosed a $7,000 committed unsecured facility expiring May 2028 and no FY25 drawings; the current June 2026 available amount/reserves are not disclosed. `[Visa FY2025 Form 10-K, Note 10 (Credit Facility), p.84]` |
| Asset-sale proceeds (only if announced / authorized) | Unknown; none announced in the reviewed filings | Not disclosed in the data pool. |
| New debt issuance (only if committed / announced) | No future committed amount disclosed | Visa issued $3,000 in February 2026, but this completed issuance is not an available future funding source. `[Visa Q3 FY2026 Form 10-Q, Note 8 (Debt), p.18]` |

The next 12-month $3,000m principal wall is covered 4.12x by $12,359m cash alone; the next 24-month $5,678m is covered 2.18x by cash alone. Those coverage figures deliberately do not add a point-in-time cash stock to a trailing FCF flow, and they do not rely on the revolver. `[Visa Q3 FY2026 Form 10-Q, Consolidated Balance Sheets and Note 8, pp.4, 17–18; calculation]` Visa repaid $5,565m of senior notes in the first nine months of FY2026 and issued $2,995m of new fixed-rate notes, demonstrating market access in February 2026 but not securing any future issuance. `[Visa Q3 FY2026 Form 10-Q, Consolidated Statements of Cash Flows, p.10; Note 8, p.18]` The issuer's official fixed-income webpage lists Aa3 / AA− issuer ratings, but the frozen evidence does not establish a current outlook or a later rating action. `[Web: Visa Fixed Income, retrieved 2026-09-23 — issuer webpage, indicative/unverified]`

The legal fixed-rate mix means only the 6.2% commercial-paper balance visibly reprices as short rates move; the senior-note swap overlay prevents a complete economic fixed/floating conclusion. The largest qualification to cash coverage is Visa's settlement and litigation liquidity needs: $6,409m of restricted cash/collateral is already excluded, while its remaining settlement-guarantee exposure is not determinable in advance. `[Visa Q3 FY2026 Form 10-Q, Note 4, p.14; Note 9, p.19]` **Conclusion: self-funded / low refi risk** for the next 12–24 months on the stated debt maturities and cash balance.

## 5. Refinancing Read

The immediate wall is $3.0bn within 12 months and $5.678bn within 24 months, against $12.359bn of unrestricted cash; this does not require new unsecured issuance to survive. A like-for-like USD market-yield proxy is 5.24% versus a 3.18% weighted USD effective rate, implying about a **+207bp** cost step-up for future USD refinancing, not an immediate increase on the largely fixed debt stock. `[Visa Q3 FY2026 Form 10-Q, Note 8, pp.17–18; Web: finanzen.net, Visa 4.700% notes due 2036, quote/yield dated 2026-09-10 — indicative, unverified; calculation]` The biggest refinancing risk is not the scheduled wall: it is a market closure coinciding with an unquantified settlement-guarantee or litigation-related liquidity call and continued discretionary cash returns. Under a 12-month market-closure assumption (no new unsecured issuance), Visa survives the scheduled $3.0bn principal maturity from cash alone, leaving $9.359bn before operating cash generation and other uses; this is an arithmetic conclusion, not a forecast. `[Visa Q3 FY2026 Form 10-Q, Consolidated Balance Sheets and Notes 4, 8 and 9, pp.4, 14, 17–19; calculation]`
