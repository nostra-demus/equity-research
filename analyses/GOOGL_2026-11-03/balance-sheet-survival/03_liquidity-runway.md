# Liquidity Runway — GOOGL

Alphabet reports under U.S. GAAP in USD. Amounts below are USD millions and use the latest filed balance-sheet date, 30 September 2026, unless noted. Free cash flow (FCF) means cash from operations less total capex; liquidity runway means the time committed funds can meet near-term needs.

## 1. Liquidity Sources (committed only)

| Source | Amount | Usable? | Notes | Source |
|---|---:|---|---|---|
| Cash & equivalents | 56,334 | Y | No restricted-cash balance is separately reported. Geographic or legal cash-trapping detail is not disclosed, so this does not establish that every subsidiary dollar can be upstreamed immediately. | [data/GOOGL/Alphabet_Inc_-_Form_10-Q(Oct-29-2026).doc, Q3 FY2026 Form 10-Q, Consolidated Balance Sheets] |
| Liquid short-term investments / marketable securities | 208,764 | Y | No restriction is disclosed. The portfolio includes deposits, money-market funds, government and corporate debt, asset-backed securities and marketable equity securities. | [data/GOOGL/Alphabet_Inc_-_Form_10-Q(Oct-29-2026).doc, Q3 FY2026 Form 10-Q, Consolidated Balance Sheets; Item 2 — Cash, Cash Equivalents, and Marketable Securities] |
| Revolver / facilities (commitment) | 10,000 | No | $4,000 expires April 2027 and $6,000 April 2030; no amounts were drawn. Commitment is shown separately because usable availability, letters of credit and any reserves are not disclosed. | [data/GOOGL/Alphabet_Inc_-_Form_10-Q(Oct-29-2026).doc, Q3 FY2026 Form 10-Q, Note 6 — Credit Facility, p.27] |
| Revolver availability (if disclosed) | Not disclosed | No | Excluded from usable liquidity under the module rule; this makes the headline figure conservative to the extent the $10,000 commitment is available. | [data/GOOGL/Alphabet_Inc_-_Form_10-Q(Oct-29-2026).doc, Q3 FY2026 Form 10-Q, Note 6 — Credit Facility, p.27] |
| **Total usable liquidity** | **265,098** |  | **$56,334 cash and equivalents + $208,764 marketable securities; excludes the $10,000 revolver.** | **[data/GOOGL/Alphabet_Inc_-_Form_10-Q(Oct-29-2026).doc, Q3 FY2026 Form 10-Q, Consolidated Balance Sheets]** |

## 2. Near-Term Uses (next 12 months)

| Use | Amount | Source |
|---|---:|---|
| Debt maturities (from 02) | 1,016 | This is the disclosed current portion of financial debt and therefore a minimum. The filing does not calendarise finance-lease principal; the lease-payment schedule cannot be put on the same 12-month principal basis. [analyses/GOOGL_2026-11-03/balance-sheet-survival/02_maturity-wall-and-refinancing.md, §§1–2; data/GOOGL/Alphabet_Inc_-_Form_10-Q(Oct-29-2026).doc, Q3 FY2026 Form 10-Q, Note 6 — Debt, pp.26–27] |
| Cash interest | Not separately disclosed | Not added on the net-of-FCF basis: cash interest paid is already inside cash from operations. [analyses/GOOGL_2026-11-03/earnings/06_earnings-quality.md, §1; data/GOOGL/Alphabet_Inc_-_Form_10-Q(Oct-29-2026).doc, Q3 FY2026 Form 10-Q, Consolidated Statements of Cash Flows] |
| Maintenance capex | Not disclosed | Alphabet does not split maintenance from growth capex. Total LTM capex was $159,804 and is already deducted in FCF, so it is not added again. [analyses/GOOGL_2026-11-03/earnings/01_historical-financials.md, §§1–2; CIQ Financials → Cash Flow, LTM ended 2026-09-30] |
| Committed dividends / buybacks | 3,002 | Currently declared cash payments only: about $2,705 common dividend ($0.22 × 12,294m 30-September common shares) plus $297 mandatory-preferred dividend ($15.63 × 19m preferred shares), payable in November–December 2026. The calculation is an inference from filing-disclosed share counts and rates. The $69,500 remaining common-share repurchase authorization is discretionary and excluded. [data/GOOGL/Alphabet_Inc_-_Form_10-Q(Oct-29-2026).doc, Q3 FY2026 Form 10-Q, Note 11 — Preferred and Common Dividends / Share Repurchases, pp.36–37] |
| **Total near-term uses** | **4,018 known uses outside FCF** | **$1,016 maturities + $3,002 currently declared cash distributions. Cash interest and total capex are deliberately excluded from this net-of-FCF total to avoid double counting.** |

## 3. Runway

| Metric | Value |
|---|---:|
| Total committed liquidity | 265,098 |
| Annual FCF (or proxy) | 19,747 |
| Basis used (net-of-FCF / gross-obligations) | Net-of-FCF |
| Annual net cash burn (on the stated basis — see step 4) | **(15,729) surplus** |
| Monthly net cash burn (annual burn ÷ 12) | **(1,311) surplus per month** |
| **Liquidity runway (months) = liquidity ÷ monthly net cash burn** | **No finite runway — FCF covers the disclosed financing and declared-cash uses.** |

Formula: `$265,098` usable liquidity; annual net cash burn = `($1,016 debt maturities + $3,002 currently declared cash dividends/buybacks) − $19,747 FCF = −$15,729`. FCF covers the known $4,018 of outside-FCF uses 4.9×; a negative burn is an annual surplus, so it does not produce a finite months figure. Cash interest and capex are not re-added because FCF already includes them.

The $19,747 FCF equals $179,551 LTM CFO less $159,804 total LTM capex. The deterministic CIQ sidecar confirms the $179,551 CFO reading (`ltm_ocf_m`, status present); its separate `levered_fcf_m` value of **$(1,162.5)** is explicitly a vendor-defined levered-FCF measure after interest, not the required CFO-minus-capex FCF, so it is not substituted into this calculation. [CIQ Financials → Cash Flow, LTM ended 2026-09-30; `ciq_facts.json`, `ltm_ocf_m` and `levered_fcf_m`; analyses/GOOGL_2026-11-03/earnings/01_historical-financials.md, §§1–2]

### Seasonality / Peak Liquidity Need (Hard Check)

Historical revenue is somewhat seasonal, with Q4 averaging 28.0% of annual revenue, but the filing does not disclose a peak working-capital cash build. Q3 FY2026 alone had $42.3bn of CFO and $51.4bn of capex, a roughly $9.1bn quarterly FCF deficit; that is evidence of capex timing, not a disclosed peak working-capital requirement. **Peak working-capital need not disclosed — runway may be overstated.** [analyses/GOOGL_2026-11-03/earnings/01_historical-financials.md, §5; data/GOOGL/Alphabet_Inc_-_Form_10-Q(Oct-29-2026).doc, Q3 FY2026 Form 10-Q, Item 2 — Liquidity and Capital Resources]

## 4. Sources & Uses Bridge

Internal sources cover the disclosed next-12-month uses: $265,098 of already-held cash and marketable securities covers the $4,018 of known debt maturity and declared cash distributions 66.0×, before the $19,747 of LTM FCF. No refinancing, asset sale or facility draw is required for those disclosed uses. [data/GOOGL/Alphabet_Inc_-_Form_10-Q(Oct-29-2026).doc, Q3 FY2026 Form 10-Q, Consolidated Balance Sheets; Note 6 — Debt; Note 11 — Preferred and Common Dividends]

All headline liquidity is already in hand; FCF does not need to materialise to meet the known $4,018. The conclusion beyond those known uses depends on FCF remaining positive while AI infrastructure spend stays high, and it excludes the $10,000 revolver because availability is not disclosed. [data/GOOGL/Alphabet_Inc_-_Form_10-Q(Oct-29-2026).doc, Q3 FY2026 Form 10-Q, Note 6 — Credit Facility; Item 2 — Capital Expenditures and Leases]

## 5. Liquidity Read

On the required net-of-FCF basis, Alphabet has **no finite liquidity-runway limit**: $19,747 of LTM CFO-minus-capex FCF exceeds the $4,018 of disclosed 12-month debt maturity and currently declared cash distributions by $15,729. This read depends only partly on FCF because $265,098 is already held, but ongoing self-funding of capex does depend on FCF remaining positive. [CIQ Financials → Cash Flow, LTM ended 2026-09-30; analyses/GOOGL_2026-11-03/earnings/01_historical-financials.md, §2]

The biggest liquidity risk is AI capex reducing FCF faster than the base case assumes: Q3 CFO was $42.3bn against $51.4bn of capex, and the filing reports $132.0bn of nine-month capex. A second limitation is that the $1,016 disclosed maturity is only a minimum because the 2027 allocation and finance-lease principal timing are not disclosed. Revolver availability is unknown and excluded; therefore the liquidity-runway confidence is capped at 60 under the module partial-data rule. [data/GOOGL/Alphabet_Inc_-_Form_10-Q(Oct-29-2026).doc, Q3 FY2026 Form 10-Q, Item 2 — Liquidity and Capital Resources; Note 4 — Leases; Note 6 — Debt / Credit Facility]
