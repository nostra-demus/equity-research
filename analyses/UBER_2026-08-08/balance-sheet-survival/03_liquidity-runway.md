# Liquidity Runway — UBER

Reporting currency: US dollars (USD, millions unless stated). All balance-sheet figures are as of June 30, 2026, the most recent balance sheet in the data pool [Q2 FY26 10-Q, Condensed Consolidated Balance Sheets], consistent with `01_capital-structure-and-leverage.md` and `02_maturity-wall-and-refinancing.md`. Flow figures (FCF, CFO, capex) use the trailing twelve months (TTM) ended June 30, 2026 unless stated otherwise.

**Neither partial-data cap in this module applies.** Committed, undrawn facility availability is disclosed (the $5.0bn Revolving Credit Agreement is commitment-based, not borrowing-base, and was $0 drawn at Jun-30-2026 [Q2 FY26 10-Q, Note 5]), and a full cash flow statement is available (CFO, capex, FCF all sourced from `earnings/01_historical-financials.md`). Liquidity runway is therefore not capped for either missing-facility-detail or missing-cash-flow-statement reasons (MODULE_RULES.md Score Cap Rules).

## 1. Liquidity Sources (committed only)

| Source | Amount | Usable? | Notes | Source |
|---|---:|---|---|---|
| Cash & equivalents | $4,870M | Y | Not restricted | Q2 FY26 10-Q, Balance Sheet; `01` §3 |
| Liquid short-term investments | $521M | Y | Not restricted | Q2 FY26 10-Q, Balance Sheet; `01` §3 |
| Revolver / facilities (commitment) | $5,000M committed | Maybe (see next row) | Revolving Credit Agreement, matures Sep-26-2029; commitment-based (no borrowing-base mechanism) | Q2 FY26 10-Q, Note 5 |
| Revolver availability (disclosed) | $5,000M fully available | Y | $0 drawn as of Jun-30-2026; no borrowing base, no reserves subtracted | Q2 FY26 10-Q, Note 5; `02` §4 |
| **Total usable liquidity** | **$10,391M** | | $4,870 + $521 + $5,000 | Computed |

**Excluded from the headline figure (per module rule 4 — committed liquidity only):**
- **Restricted cash & investments: $11,793M** ($661M current restricted cash + $1,646M non-current restricted cash + $9,486M restricted investments) — larger than Uber's entire gross debt stack. Likely tied to collateral requirements under Uber's self-insurance program (inference, not explicitly reconciled in the filing) [Q2 FY26 10-Q, Balance Sheet; `01` §3, §6A]. **Flagged and excluded** — none of it is treated as usable liquidity anywhere in this report.
- **Commercial Paper Program: up to $2.0bn capacity, $0 outstanding** — this is an issuance program, not a bank commitment; no third party is obligated to buy Uber's paper, so it is treated as **uncommitted** and excluded from the headline figure [Q2 FY26 10-Q, Note 5].
- **Term Loan Credit Agreement's remaining $1.0bn undrawn commitment expired August 2, 2026** (before this report's date) and is no longer available under any circumstance [Q2 FY26 10-Q, Note 5; `02` §1]. It is not a current exclusion judgment call — it is simply gone.
- **Strategic equity stakes (Didi $1,900M / Grab $2,020M / Aurora $1,763M / other $2,076M — $8,759M total)** are not treated as liquidity: they are non-marketable/marketable minority equity positions, not treasury cash-management assets, and the Aurora stake is already pledged as collateral for the 2028 Exchangeable Notes [Q2 FY26 10-Q, Note 3; `01` §3].

Reporting currency: USD.

## 2. Near-Term Uses (next 12 months)

| Use | Amount | Source |
|---|---:|---|
| Debt maturities (from `02`) | $2,000M | `02` §1 — 2026 Term Loan, due December 2026 (the only maturity within 12 months of the 2026-08-08 report date) |
| Cash interest | ~$470M (annualized from H1 FY2026 disclosed interest expense of $235M × 2) | Q2 FY26 10-Q, Income Statement / Interest Expense note. Cross-check: `02` §3's weighted-average **effective** coupon of 3.82% × $12,945M canonical gross debt ≈ $495M — the two independent estimates ($470M filed, $495M computed) bracket a consistent ~$470M–$495M range. **Both are proxies, not a disclosed "cash paid for interest" line** — the 10-Q's GAAP interest expense includes some non-cash amortization of debt discount/issuance costs (on the convertible/exchangeable notes especially), so true cash interest paid is likely modestly below $470M. This is a conservative (slightly high) proxy, used because no supplemental "cash paid for interest" disclosure was found in the pool. |
| Maintenance capex | $308M (TTM capex, ended Jun-30-2026) | `earnings/01_historical-financials.md` §2. Uber does not disclose a maintenance-vs-growth capex split — as an asset-light marketplace, its total capex ($308M TTM against $55.2bn TTM revenue, ~0.6% of revenue) is used in full as the proxy, which is conservative (overstates "maintenance" capex since it includes all growth capex too) |
| Committed dividends / buybacks | $0 | Uber pays no dividend in its reported history (2016–LTM) [`business-model/11_capital-allocation-governance.md`]. The $20.0bn Share Repurchase Program authorized July 2025 (board authorization, $15.7bn remaining as of Jun-30-2026) explicitly "does not obligate [Uber] to repurchase any specific dollar amount or to acquire any specific number of shares" and repurchases are "determined at the discretion of... management" [Q2 FY26 10-Q, MD&A — Share Repurchase Program / Note 7]. **Not a committed obligation** — excluded from this table on that basis, per §4 memo below |
| **Total near-term uses (gross-obligations view)** | **$2,778M** | $2,000 + $470 + $308 + $0 |

**Memo — actual (discretionary) buyback pace, for context only, not counted as a committed use.** Uber repurchased $3.5bn of stock in the six months ended Jun-30-2026 (a ~$7.0bn annualized run-rate) against $6.5bn in full-year FY2025 — trailing-twelve-month buybacks of $6,904M against trailing CFO of $10,424M [`01` §6; `earnings/01_historical-financials.md` §6]. This is real, ongoing cash use, but it is discretionary by the program's own terms and can be slowed or stopped at any time without breaching any obligation — it is not included in the committed-uses total above, consistent with the module's definition of "committed dividends/buybacks."

## 3. Runway

| Metric | Value |
|---|---:|
| Total committed liquidity | $10,391M |
| Annual FCF (TTM ended Jun-30-2026) | $10,116M (CFO $10,424M − capex $308M) [`earnings/01_historical-financials.md` §2] |
| Basis used (net-of-FCF / gross-obligations) | **Net-of-FCF** — FCF is meaningful and positive (TTM $10,116M, +18.5% YoY), so the module's net-of-FCF basis applies |
| Annual net cash burn (net-of-FCF basis) | **−$8,116M (i.e., a surplus, not a burn)** = (12-month debt maturities $2,000M + committed dividends/buybacks $0) − FCF $10,116M. Cash interest and maintenance capex are **not** re-added here — FCF already carries both, per the module formula |
| Monthly net cash burn | Not applicable — annual figure is a surplus, so no monthly burn rate exists on this basis |
| **Liquidity runway (months) = liquidity ÷ monthly net cash burn** | **No finite runway — annual surplus of $8,116M.** The only near-term obligation not already inside FCF ($2,000M) is covered by FCF alone 5.1x over ($10,116M ÷ $2,000M), before touching a dollar of the $10,391M in-hand liquidity |

**Formula and basis, shown explicitly.** Net-of-FCF annual burn = (12-month maturities + committed dividends/buybacks) − FCF = ($2,000M + $0) − $10,116M = −$8,116M. A negative "burn" is a surplus: FCF alone, without drawing on cash, short-term investments, or the revolver, more than covers the only obligation due in the next 12 months. Per MODULE_RULES.md Calculation Standard 8, this is stated as an annual surplus rather than a finite runway in months.

**Conservative cross-check (gross-obligations basis, hypothetical zero-FCF stress).** If FCF is deliberately assumed to be zero (operations generate no net cash — a scenario far more severe than anything currently observed), the full 12-month obligations bucket from §2 applies with no FCF subtraction: annual burn = $2,778M ÷ 12 = $231.5M/month. Liquidity runway = $10,391M ÷ $231.5M/month ≈ **44.9 months (~3.7 years)**. This is a deliberately conservative hypothetical, not the primary read — TTM FCF is solidly positive and growing (+18.5% YoY), so the net-of-FCF surplus above is the operative conclusion.

### Seasonality / Peak Liquidity Need (Hard Check)

Working capital is **moderately seasonal but not flagged as a hard seasonality risk**. Revenue share by quarter has held a consistent pattern across FY2023–FY2025: Q1 is the smallest quarter (~23.0% of annual revenue, average) and Q4 the largest (~27.2%), a ~4.2-point spread, consistent with lower Mobility/Delivery demand post-holiday in Q1 and higher demand over the holiday season in Q4 [`earnings/01_historical-financials.md` §5]. This does not cross the module's >30%/<20% hard-flag threshold, and Uber's own Working Capital balance (Total Current Assets − Total Current Liabilities) has stayed positive and did not show a disclosed seasonal cash trough in the annual series ($(205)M FY2021 to $1,673M FY2025, described as "Volatile" but not tied to a specific seasonal low) [`earnings/01_historical-financials.md` §1]. **No peak-quarter cash usage figure is separately disclosed in the pool.** Per the hard-check rule: **peak working-capital need not disclosed — runway may be overstated.** Given the moderate (not extreme) seasonality and the $8.1bn annual FCF surplus computed above, this gap is unlikely to change the surplus conclusion, but it is not independently verified.

## 4. Sources & Uses Bridge

Internal sources cover the next 12 months with room to spare: $10,391M of already-in-hand committed liquidity (cash, short-term investments, and a fully available, commitment-based $5.0bn revolver) covers the full $2,778M gross-obligations bucket (maturities + interest + capex) 3.7x over, without needing a single dollar of the $10,116M TTM FCF. FCF is not required for near-term survival — it is a large ($8.1bn/year) surplus on top of an already-covered position, currently being redirected mostly into discretionary share buybacks ($6.9bn TTM) rather than accumulating as cash. **Roughly 100% of this runway is already-in-hand liquidity; none of it depends on FCF materializing** — the FCF surplus is upside capacity, not a load-bearing assumption for the 12-month obligations shown here. External access (new debt issuance, asset sales) is not required for the maturity schedule in this report; it is only relevant to the separate, not-yet-closed Delivery Hero acquisition financing (§5).

## 5. Liquidity Read

Uber's near-term liquidity position is not in question: the only obligation due in the next 12 months is a $2,000M Term Loan maturing December 2026, and it is covered more than five times over by TTM free cash flow alone ($10,116M) or nearly three times over by cash and short-term investments alone ($5,391M), before the fully available $5,000M revolver is even considered. The runway depends almost entirely on liquidity already in hand, not on FCF holding up — a real strength given that Uber discontinued disclosing consolidated Adjusted EBITDA in FY2026 and its GAAP EPS has been volatile on non-operating items (`earnings/01_historical-financials.md` §6). The single biggest liquidity risk visible in this report is not the 12-month figures above but what sits outside them: the pending, not-yet-closed Delivery Hero acquisition financed via a €14.2bn bridge facility that management plans to term out into permanent debt in Q3 2026 — none of the debt, interest, or maturity figures in this report reflect that financing, and if it converts to permanent debt at scale it would materially change the near-term uses picture this runway is built on [`01` §5; `02` §5].
