# Maturity Wall & Refinancing — GOOGL

All figures are USD millions under U.S. GAAP unless stated otherwise. The balance-sheet date is 30 September 2026. This is a partial-data maturity read: the current 10-Q gives the current portion of debt and maturity ranges by issuance cohort, but not the principal due in each future year. Refinancing-risk confidence is therefore **Low**.

## 1. Maturity Schedule

| Period | Amount Due | % of Total Debt | Instrument(s) | Source |
|---|---:|---:|---|---|
| Within 12 months | 1,016 | 0.8%* | Current portion of long-term notes | [Q3 FY2026 Form 10-Q, Note 6 (Debt), pp. 26–27] |
| Year 2 | Not disclosed | Not assessable | The $9,000 2020 U.S.-dollar note cohort spans 2027–2060; the filing gives no amount for 2027 | [Q3 FY2026 Form 10-Q, Note 6 (Debt), p. 26] |
| Year 3 | Not disclosed | Not assessable | Several cohorts begin in 2028, but no 2028 principal amount is disclosed | [Q3 FY2026 Form 10-Q, Note 6 (Debt), p. 26] |
| Year 4 | Not disclosed | Not assessable | Cohort maturity ranges include 2029; no annual allocation is disclosed | [Q3 FY2026 Form 10-Q, Note 6 (Debt), p. 26] |
| Year 5 | Not disclosed | Not assessable | Cohort maturity ranges include 2030; no annual allocation is disclosed | [Q3 FY2026 Form 10-Q, Note 6 (Debt), p. 26] |
| Thereafter / unallocated non-current balance** | 125,102 | 99.2%* | Senior unsecured note cohorts with disclosed ranges of 2027–2126, plus other long-term debt | [Q3 FY2026 Form 10-Q, Note 6 (Debt), p. 26] |
| **Total financial debt** | **126,118** | **100.0%** | **$1,016 current portion + $125,102 long-term debt** | **[Q3 FY2026 Form 10-Q, Consolidated Balance Sheets; Note 6 (Debt)]** |

*Percentages use the $126,118 financial-debt schedule, not the $129,823 gross-debt measure used by `01`. Thus 0.8% is a minimum next-12-month share: it excludes finance-lease principal because the filing does not allocate that principal by year.

**This is not a claim that all $125,102 is due after Year 5. It is the entire non-current carrying balance held outside annual buckets because the filing does not provide those buckets.

The reporting currency is USD. The schedule reconciles to the $126,118 of current plus long-term debt in the filing. `01` reports $129,823 gross debt because it also includes the $3,705 finance-lease liability. The lease note gives cash payments, not annual principal: $771 remaining in 2026, $499 in 2027, $487 in 2028, $466 in 2029, $395 in 2030 and $1,712 thereafter, or $4,330 total less $625 imputed interest = the $3,705 liability. Adding the $4,330 payment flow to debt principal would mix bases. [Q3 FY2026 Form 10-Q, Note 4 (Leases); `01_capital-structure-and-leverage.md`, §§1 and 7]

The deterministic CIQ workbook read reports a $67,504 mixed debt-and-lease principal block: $24,420 dated debt + $24,632 undated debt + $18,453 amortising leases (rounding accounts for the $1 difference), with a roughly 9.8-year WAM as of 31 December 2025. That is not a usable current wall: it includes lease payments without a refinancing maturity, leaves $24,632 undated, and predates the 2026 issuance of $45.0bn of U.S.-dollar and $35.8bn of foreign-currency senior notes. It therefore cannot reconcile to the 30 September 2026 filing's $127,485 face value of long-term debt; the current filing controls. [CIQ Financials → Capital Structure Details, latest as-reported block: `ciq_facts.json`, `debt_maturity_wall` (present); Q3 FY2026 Form 10-Q, Note 6 (Debt), pp. 26–27]

## 2. Maturity Profile Metrics

| Metric | Value |
|---|---:|
| Weighted-average maturity (years) | Not assessable for current debt; no annual principal schedule is disclosed. The CIQ 9.8-year figure is a FY2025 partial-detail read and is not used. [CIQ Financials → Capital Structure Details, `ciq_facts.json`, `debt_maturity_wall`] |
| % due within 12 months | At least 0.8% of financial debt: $1,016 ÷ $126,118. Finance-lease principal due is not separately disclosed. [Q3 FY2026 Form 10-Q, Note 6 (Debt); Note 4 (Leases)] |
| % due within 24 months | Not assessable; lower bound is 0.8%. The 2027 amount is not disclosed. [Q3 FY2026 Form 10-Q, Note 6 (Debt), p. 26] |
| % due within 36 months | Not assessable; lower bound is 0.8%. The 2027–2028 annual allocations are not disclosed. [Q3 FY2026 Form 10-Q, Note 6 (Debt), p. 26] |
| Largest single maturity year (and amount) | Not assessable. The largest disclosed *cohort* is $45,000 of 2026 U.S.-dollar notes, but its maturities span 2028–2066 rather than one year. [Q3 FY2026 Form 10-Q, Note 6 (Debt), p. 26] |

The only precise near-term principal finding is the $1,016 current portion. The filing's maturity ranges show the next notes may begin in 2027, but a range is not an annual maturity schedule. Treating the $9,000 2020 U.S.-dollar cohort as a 2027 maturity, or the $45,000 2026 cohort as a 2028 maturity, would overstate the wall without evidence. *Inference, not from filings: the missing annual allocation is the main limitation in this read.*

## 3. Rate Exposure

| Metric | Value | Source |
|---|---:|---|
| Fixed-rate share | About 96.4% of $127,485 face debt is identified as fixed-rate by contractual classification; this is before interest-rate swaps and excludes the $1,221 other-long-term-debt line with no rate classification | $122,878 proxy ÷ $127,485; build below. [Q3 FY2026 Form 10-Q, Note 6 (Debt), pp. 26–27] |
| Floating-rate share | About 2.7% of face debt on a gross contractual proxy, before swaps | $3,386 proxy ÷ $127,485; build below. [Q3 FY2026 Form 10-Q, Note 6 (Debt), pp. 26–27] |
| Weighted-average coupon | Not disclosed and not computable from the filing's cohort-level coupon ranges and multi-currency balances | [Q3 FY2026 Form 10-Q, Note 6 (Debt), p. 26] |
| Current market refi rate (matching tenor) | 5.60% ICE BofA AA U.S. corporate effective yield at 30 October 2026; a broad AA USD proxy, **not tenor-matched** because current WAM is not assessable | [Web: FRED / ICE BofA AA U.S. Corporate Index Effective Yield, 2026-10-30 (indicative, unverified)] |
| Estimated refi cost step-up (bps) | Not assessable at portfolio level: no portfolio weighted-average coupon and no single matching maturity. Illustrative only: 5.60% less the 5.55% coupon on Q3's $1,300 U.S.-dollar floating issue = +5bp, not a whole-debt estimate | [Q3 FY2026 Form 10-Q, Note 6 (Debt), p. 26; Web: FRED / ICE BofA AA U.S. Corporate Index Effective Yield, 2026-10-30 (indicative, unverified)] |

The gross floating proxy is reconstructable: $1,800 of U.S.-dollar floating notes plus $1,586 pro rata for the A$2.3bn floating tranche within the $3,861 USD carrying value of the A$3.3bn fixed and A$2.3bn floating notes (`$1,800 + $3,861 × 2.3 ÷ 5.6 = $3,386`). Known fixed-rate debt is `$127,485 − $3,386 − $1,221 = $122,878`; the remaining 1.0% is other long-term debt whose rate is not classified. This is an inference from the disclosed currency-tranche proportions, not a filing-provided rate split. [Q3 FY2026 Form 10-Q, Note 6 (Debt), pp. 26–27]

The CIQ sidecar instead labels $500 as floating and $67,004 as fixed in its FY2025 mixed debt-and-lease detail. That is materially different from the current filing, which alone identifies $1,300 of new U.S.-dollar floating issuance in Q3 2026, as well as $1,800 of U.S.-dollar and A$2.3bn of Australian-dollar floating notes outstanding at 30 September. The period and scope mismatch is therefore flagged rather than averaged with the filing; the current filing controls. [CIQ Financials → Capital Structure Details, `ciq_facts.json`, `debt_maturity_wall` (present); Q3 FY2026 Form 10-Q, Note 6 (Debt), pp. 26–27]

Alphabet also says interest-rate swaps convert a portion of fixed-rate debt to floating-rate debt, but does not disclose the swap notional. The 2.7% figure is therefore a gross contractual measure, not net economic exposure. A 200bp rise would add roughly $68 annually to interest on the $3,386 directly identified floating proxy (`$3,386 × 2%`), before the unknown swap effect. [Q3 FY2026 Form 10-Q, Note 3 (Derivative Financial Instruments); Note 6 (Debt)]

## 4. Refinancing Exposure

### Refi Funding Plan (no speculation)

| Source of repayment for next-24m maturities | Amount | Evidence |
|---|---:|---|
| Cash on hand | 56,334 | Cash and cash equivalents at 30 September 2026; no separate restricted-cash balance is reported. [Q3 FY2026 Form 10-Q, Consolidated Balance Sheets] |
| Marketable securities (not cash on hand; broad-liquidity source only) | 208,764 | Marketable securities at 30 September 2026. This is not netted in the strict cash-only debt measure. [Q3 FY2026 Form 10-Q, Consolidated Balance Sheets; Note 3 (Debt and Equity Securities)] |
| Forecast FCF (or recent run-rate, labeled) | No forecast available; recent LTM FCF was 19,747 | Recent run-rate only, not a forecast: $179,551 LTM CFO less $159,804 LTM capex. [CIQ Financials → Cash Flow / Income Statement, LTM ended 2026-09-30; `ciq_facts.json`, `ltm_ocf_m` (present); `earnings/01_historical-financials.md`, §2] |
| Revolver availability (only if availability known) | Unknown; excluded from available funding | $10,000 of revolvers, $0 drawn; the filing does not disclose usable availability, reserves, or letters of credit. [Q3 FY2026 Form 10-Q, Note 6 (Credit Facility), p. 27] |
| Asset-sale proceeds (only if announced / authorized) | Unknown / none identified | No announced or authorised asset sale was identified in the reviewed filing. [Q3 FY2026 Form 10-Q, Note 6 (Debt); Item 2 (Liquidity and Capital Resources)] |
| New debt issuance (only if committed / announced) | Unknown; excluded from repayment sources | No committed parent refinancing is disclosed. Waymo's October $5,000 secured term-loan facility is separate, its draw is not stated, and Alphabet does not guarantee it. [Q3 FY2026 Form 10-Q, Note 6 (Debt), p. 27] |

The disclosed next-12-month note principal of $1,016 is covered by cash alone 55.4 times (`$56,334 ÷ $1,016`), before the recent FCF run-rate or marketable securities. Accordingly, the conclusion for the disclosed 12-month wall is **self-funded / low refi risk**; it does not extend to a quantified 24-month wall because the 2027 allocation is missing. The $265,098 of cash, equivalents and marketable securities provides a further broad-liquidity cushion, but only the $56,334 cash balance is used in the strict measure. [Q3 FY2026 Form 10-Q, Consolidated Balance Sheets; Note 6 (Debt)]

Recent market access is evidenced by $80,800 of 2026 senior-note issuance. The only available rating read is a Capital IQ vendor field showing S&P foreign-currency long-term `AA+`; no rating-agency report is in the pool, so this is not treated as primary rating evidence. The LTM FCF run-rate is not a repayment forecast and has fallen to $19,747 as capex reached $159,804, so ongoing investment needs rather than the disclosed 12-month principal wall are the cash-use constraint. [Q3 FY2026 Form 10-Q, Note 6 (Debt); Capital IQ Credit Health Panel — Summary, LTM ended 2026-09-30; CIQ Financials → Cash Flow, LTM ended 2026-09-30; `earnings/01_historical-financials.md`, §2]

## 5. Refinancing Read

The reported wall is $1,016 within 12 months, or at least 0.8% of financial debt, versus $56,334 cash; Alphabet survives the next 12 months under a market-closure assumption of no new unsecured issuance, assuming the reported cash remains available. The actual 24- and 36-month wall, WAM, and portfolio refinancing step-up are **Not assessable** because the 10-Q does not allocate $125,102 of non-current debt by year or disclose a weighted-average coupon. The biggest refinancing risk is not the disclosed 12-month maturity but the unquantified 2027–2028 allocation following $80,800 of 2026 issuance, while capex has reduced LTM CFO-minus-capex FCF to $19,747. [Q3 FY2026 Form 10-Q, Consolidated Balance Sheets; Note 6 (Debt); CIQ Financials → Cash Flow, LTM ended 2026-09-30; `earnings/01_historical-financials.md`, §2]
