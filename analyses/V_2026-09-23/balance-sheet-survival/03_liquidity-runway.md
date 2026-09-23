# Liquidity Runway — V

Visa Inc. reports in USD under U.S. GAAP. All amounts below are USD millions and, unless noted, are measured at June 30, 2026. Free cash flow (FCF) means cash from operations (CFO) less total capex.

## 1. Liquidity Sources (committed only)

| Source | Amount | Usable? | Notes | Source |
|---|---:|---|---|---|
| Cash & equivalents | $12,359 | Y | Restricted cash is presented separately, so this balance excludes $888 of litigation escrow, $4,310 of customer collateral, and $1,211 in other restricted cash ($6,409 total). | [data/V/Visa Inc. Q3 FY2026 Form 10-Q, filed 2026-07-29, Consolidated Balance Sheets p.4; Note 4 p.14] |
| Liquid short-term investments | $1,433 | Y | Current investment securities: $1,137 of U.S. Treasury/government-sponsored debt due within one year plus $446 of marketable equity securities. The debt securities and marketable equities have observable market prices; no restriction is disclosed. | [data/V/Visa Inc. Q3 FY2026 Form 10-Q, filed 2026-07-29, Consolidated Balance Sheets p.4; Note 6 pp.15–16] |
| Revolver / facilities (commitment) | $7,000 | No — availability unknown | Five-year unsecured revolver expires May 2028. It had no drawings at September 30, 2025, but the June 2026 filing does not disclose current drawings, reserves, or available capacity. It is excluded from usable liquidity. | [data/V/Visa FY2025 Form 10-K, Note 10 (Credit Facility), p.84] |
| Revolver availability | Not disclosed | N | No current availability, borrowing-base, reserve, or minimum-liquidity disclosure was found. | [data/V/Visa FY2025 Form 10-K, Note 10 (Credit Facility), p.84; data/V/Visa Inc. Q3 FY2026 Form 10-Q, filed 2026-07-29] |
| **Total usable liquidity** | **$13,792** |  | **$12,359 cash + $1,433 current liquid investment securities; excludes $6,409 restricted cash/collateral and the $7,000 revolver.** | [data/V/Visa Inc. Q3 FY2026 Form 10-Q, filed 2026-07-29, pp.4, 14–16; calculation] |

No uncommitted bank line is disclosed. The commercial-paper program was increased to a $7,000 authorization in July 2026, but it requires market issuance and is not a committed facility; it is also excluded. [data/V/Visa Inc. Q3 FY2026 Form 10-Q, filed 2026-07-29, Note 8 p.18; MD&A p.38]

The $13,792 headline may understate potential committed capacity because it excludes the revolver; it is not evidence that the full $7,000 remains drawable. **Partial-data cap: revolver availability is unknown, so the liquidity-runway score is capped at 60.**

## 2. Near-Term Uses (next 12 months)

| Use | Amount | Source |
|---|---:|---|
| Debt maturities (from 02) | $3,000 | $1,500 commercial paper plus $1,500 of 1.90% notes due April 2027, reconstructed from the debt note. [data/V/Visa Inc. Q3 FY2026 Form 10-Q, filed 2026-07-29, Note 8 pp.17–18; analyses/V_2026-09-23/balance-sheet-survival/02_maturity-wall-and-refinancing.md, Maturity Schedule] |
| Cash interest | $648 LTM | FY25 cash interest $587 − FY25 nine-month $539 + FY26 nine-month $600 = $648. This is shown for the gross-use bridge only; it is already inside CFO and therefore not added to the net-of-FCF runway formula. [data/V/Visa FY2025 Form 10-K, Consolidated Statements of Cash Flows p.65; data/V/Visa Inc. Q3 FY2026 Form 10-Q, filed 2026-07-29, Consolidated Statements of Cash Flows p.10; calculation] |
| Maintenance capex | $1,567 LTM proxy | The filings do not split maintenance from growth capex. Total capex is used as the conservative maintenance proxy: FY25 $1,482 − FY25 nine-month $1,093 + FY26 nine-month $1,178 = $1,567. It is already inside FCF and therefore not added to the net-of-FCF formula. [data/V/Visa FY2025 Form 10-K, Consolidated Statements of Cash Flows p.65; data/V/Visa Inc. Q3 FY2026 Form 10-Q, filed 2026-07-29, Consolidated Statements of Cash Flows p.10; calculation] |
| Committed dividends / buybacks | ≈$1,273 dividend; $0 buybacks | The board declared a $0.67 per-share dividend payable September 1, 2026; the exact aggregate was not separately stated. The immediately preceding dividend at the same rate was $1,273, used only as a disclosed-rate proxy (*inference, not from filings*). The $28,400 buyback authorization has multi-year flexibility and no expiry, so it is not a committed use. [data/V/Visa Inc. Q3 FY2026 Form 10-Q, filed 2026-07-29, Note 11 pp.22–23] |
| **Total near-term uses** | **≈$6,488 gross** | **$3,000 maturities + $648 cash interest + $1,567 total-capex proxy + ≈$1,273 declared-dividend proxy. This is a gross bridge, not the runway burn basis.** |

The full LTM cash-dividend run rate is $4,998 ($4,634 FY25 − $3,488 FY25 nine-month + $3,852 FY26 nine-month), but quarterly dividends remain board-approved rather than committed for a full year. It is therefore a sensitivity, not the contractual base. [data/V/Visa FY2025 Form 10-K, Consolidated Statements of Cash Flows p.65; data/V/Visa Inc. Q3 FY2026 Form 10-Q, filed 2026-07-29, Consolidated Statements of Cash Flows p.10; calculation]

## 3. Runway

| Metric | Value |
|---|---:|
| Total committed liquidity | $13,792 |
| Annual FCF | $21,013 LTM = $22,580 CFO − $1,567 total capex |
| Basis used (net-of-FCF / gross-obligations) | Net-of-FCF — FCF is positive and cash-backed, though LTM CFO fell 3.9% year on year. |
| Annual net cash burn (on the stated basis — see step 4) | **No burn; ≈$16,740 annual FCF surplus** = $21,013 − ($3,000 maturities + ≈$1,273 declared-dividend proxy) |
| Monthly net cash burn (annual burn ÷ 12) | **No burn; ≈$1,395 monthly FCF surplus** |
| **Liquidity runway (months) = liquidity ÷ monthly net cash burn** | **No finite runway on the net-of-FCF basis.** FCF exceeds the stated next-12-month financing uses. |

Formula: `annual net burn = (12-month debt maturities + committed dividends/buybacks) − FCF`; `monthly burn = annual net burn ÷ 12`; `runway = liquidity ÷ monthly burn`. Cash interest and capex are not re-added because CFO less total capex already captures them. On an ordinary-dividend sensitivity, using the $4,998 LTM dividend run rate rather than only the one declared payment, the annual FCF surplus remains $13,015 = $21,013 − ($3,000 + $4,998); there is still no finite runway. [data/V/Visa FY2025 Form 10-K, Consolidated Statements of Cash Flows p.65; data/V/Visa Inc. Q3 FY2026 Form 10-Q, filed 2026-07-29, Consolidated Statements of Cash Flows p.10; calculation]

The source-bound CIQ facts sidecar reports LTM CFO of $22,580, matching the filing-based LTM build above. It reports $20,404 of **levered FCF**, $609 lower than the $21,013 CFO-minus-total-capex measure; the sidecar labels it an after-interest vendor measure and explicitly says it is not the required CFO−capex FCF. It is not substituted into the runway calculation. [data/V/ciq_facts.json, `ltm_ocf_m` and `levered_fcf_m`, LTM June 30, 2026 — Capital IQ Financials Cash Flow vendor basis]

### Seasonality / Peak Liquidity Need (Hard Check)

Working-capital seasonality is not proven from the available filings. Visa's settlement exposure varies day to day: maximum daily exposure was $168,600 and average daily exposure was $99,500 in the first nine months of FY2026, but the filing does not disclose a seasonal peak working-capital cash build. **Peak working-capital need not disclosed — runway may be overstated.** [data/V/Visa Inc. Q3 FY2026 Form 10-Q, filed 2026-07-29, Note 9 p.19]

## 4. Sources & Uses Bridge

Already-in-hand liquidity of $13,792 covers the $3,000 next-12-month debt wall 4.6x before operating cash generation and the ≈$6,488 gross bridge 2.1x, although interest and capex are normally paid from CFO. The $21,013 LTM FCF must continue to materialize to preserve the stated surplus, but external refinancing, asset sales, or a revolver draw are not required for the scheduled wall on this base case; the $7,000 revolver is excluded, so this conclusion does not assume facility access. [data/V/Visa Inc. Q3 FY2026 Form 10-Q, filed 2026-07-29, pp.4, 10, 17–18; calculation]

If management maintains its LTM $21,638 buyback pace ($18,597 FY25 − $13,389 FY25 nine-month + $16,430 FY26 nine-month), adding it to the $3,000 maturity and $4,998 ordinary-dividend run rate gives an $8,623 annual net cash burn and a 19.2-month cash-and-investments runway; this is a sensitivity, not a forecast or a committed-use case. [data/V/Visa FY2025 Form 10-K, Consolidated Statements of Cash Flows p.65; data/V/Visa Inc. Q3 FY2026 Form 10-Q, filed 2026-07-29, Consolidated Statements of Cash Flows p.10; calculation]

## 5. Liquidity Read

**Verdict: FCF surplus; no finite runway on the committed-use base.** $13,792 of usable cash and current liquid securities sits against a $3,000 scheduled 12-month maturity wall, and LTM FCF of $21,013 exceeds that wall plus the declared-dividend proxy by about $16,740. [data/V/Visa Inc. Q3 FY2026 Form 10-Q, filed 2026-07-29, pp.4, 10, 14–18; calculation]

The $7,000 revolver is deliberately excluded because current availability is not disclosed, which caps the liquidity-runway score at 60 despite the cash balance. [data/V/Visa FY2025 Form 10-K, Note 10 p.84]

The biggest liquidity risk is an unquantified settlement-guarantee or litigation call, not the scheduled debt wall: Visa reports $168,600 of maximum daily settlement exposure, $9,500 of collateral, and says future settlement-guarantee obligations are not determinable; continued discretionary buybacks are the controllable second risk. [data/V/Visa Inc. Q3 FY2026 Form 10-Q, filed 2026-07-29, Note 4 p.14; Note 9 p.19; Note 16 pp.24–25]
