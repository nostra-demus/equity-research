# Coverage & Covenants — AKAM

All figures are USD millions and use U.S. GAAP. Ratios use the latest twelve months (LTM) through 30 June 2026 unless a different basis is stated. EBITDA is **GAAP-derived**, calculated as income from operations plus depreciation and amortization; it is not Akamai's company-defined Adjusted EBITDA. Interest is **gross income-statement interest expense**, not netted against the company's interest and marketable-securities income.

## 1. Coverage Ratios

| Ratio | Value | Source |
|---|---:|---|
| EBITDA / interest | 35.73x = $1,184.094m / $33.143m | [FY2025 Form 10-K, Consolidated Statements of Income and Cash Flows, pp.54–56; Q2 FY2026 Form 10-Q, Statements of Income and Cash Flows, pp.5, 7–8; calculation from stated rows] |
| EBIT / interest | 13.75x = $455.678m / $33.143m | [FY2025 Form 10-K, Consolidated Statements of Income, p.54; Q2 FY2026 Form 10-Q, Statements of Income, p.5; calculation from stated rows] |
| (EBITDA − capex) / interest | 11.07x = ($1,184.094m − $817.311m) / $33.143m | [FY2025 Form 10-K, Consolidated Statements of Cash Flows, pp.55–56; Q2 FY2026 Form 10-Q, Statements of Cash Flows, pp.7–8; calculation from stated rows] |
| Fixed-charge coverage | 0.23x = ($1,184.094m − $817.311m) / ($33.143m interest + $1,149.992m scheduled convertible-note repayment + $398.715m operating-lease cash payments) | [FY2025 Form 10-K, Consolidated Statements of Cash Flows, pp.55–56; Q2 FY2026 Form 10-Q, Statements of Cash Flows, pp.7–8; calculation from stated rows] |

The LTM EBITDA build is FY2025 $1,275.555m less H1 FY2025 $655.527m plus H1 FY2026 $564.066m. LTM interest is $30.759m less $14.951m plus $17.335m; the latest half-year interest includes coupon interest, debt-issuance-cost amortization, credit-facility interest and commitment fees, less capitalized interest. [FY2025 Form 10-K, Consolidated Statements of Income, p.54; Q2 FY2026 Form 10-Q, Note 7 (Interest Expense), p.20]

Fixed-charge coverage is a strict historical LTM measure: it includes the $1,149.992m May 2025 convertible-note repayment that fell in the period, rather than treating that debt repayment as if it were an operating expense. The next stated final maturity is the $1,150.0m 2027 Notes on 1 September 2027; the 2033 Notes were classified current at 30 June 2026 because a conversion condition was met, but no holder had submitted notes for conversion through the filing date. Excluding the past bullet repayment gives a **0.85x reference**, but it is not an LTM fixed-charge ratio because it removes one historic LTM charge; it is shown only to separate the past refinancing event from recurring capex, interest and lease cash demands. [Q2 FY2026 Form 10-Q, Note 7 (Debt), pp.17–20]

Calculation audit — executed Bash command using the filing inputs above:

```bash
awk 'BEGIN {ebitda=1275.555-(306.044+349.483)+(194.778+369.288); interest=30.759-14.951+17.335; capex=819.500-419.789+417.600; lease=329.674-156.036+225.077; repayment=1149.992; cash_surplus=ebitda-capex; ltm_fixed=interest+repayment+lease; printf "LTM EBITDA less capex=%.3f; LTM fixed charges incl. scheduled 2025-note repayment=%.3f; LTM fixed-charge coverage=%.2fx\n", cash_surplus, ltm_fixed, cash_surplus/ltm_fixed; printf "Reference excluding that past bullet repayment (not an LTM fixed-charge ratio)=%.2fx\n", cash_surplus/(interest+lease)}'
```

```text
LTM EBITDA less capex=366.783; LTM fixed charges incl. scheduled 2025-note repayment=1581.850; LTM fixed-charge coverage=0.23x
Reference excluding that past bullet repayment (not an LTM fixed-charge ratio)=0.85x
```

Cash quality is a qualifier, not an adjustment to the table. FY2025 CFO was $1,518.8m against GAAP-derived EBITDA of $1,275.6m (119.1%), so the EBITDA base is cash-backed on that measure. But CFO benefits from adding back $459.4m of stock-based compensation, and the earnings-quality review identifies recurring stock-based compensation and restructuring exclusions; coverage should therefore not be recast onto management's adjusted earnings. [FY2025 Form 10-K, pp.54–56; Q2 2026 Supplemental Financial Information, GAAP to Non-GAAP Reconciliation sheet]

The deterministic CIQ sidecar's authoritative workbook read is 32.6x LTM interest coverage, using $1,079.9m CIQ EBITDA. The filing-based result is 35.73x because its GAAP-derived EBITDA is $1,184.1m, $104.2m (8.8%) higher; the vendor read implies LTM interest of $33.126m — **inference from the vendor read, not from filings** — which is consistent after rounding with the filed $33.143m. This is a disclosed EBITDA-definition difference, not a replacement of the filing-based coverage ratio. [CIQ Financials→Income Statement, EBITDA ÷ Interest Expense, LTM Jun-30-2026 — vendor basis; ciq_facts.json, `interest_coverage_x` and `ltm_ebitda_m`, present]

## 2. Covenant Inventory

| Covenant | Threshold | Current Actual | Headroom | Source |
|---|---|---:|---:|---|
| Maximum consolidated leverage ratio (ceiling) | Not disclosed | Not disclosed; company states it was compliant at 30 Jun 2026 | Not assessable | [Q2 FY2026 Form 10-Q, Note 7 (Revolving Credit Facilities), pp.19–20] |
| Minimum interest coverage | Not disclosed in the data pool | Not disclosed | Not assessable | [Q2 FY2026 Form 10-Q, Note 7 (Revolving Credit Facilities), pp.19–20] |
| Minimum liquidity / net worth | Not disclosed in the data pool | Not disclosed | Not assessable | [Q2 FY2026 Form 10-Q, Note 7 (Revolving Credit Facilities), pp.19–20] |
| Springing covenant trigger (e.g., revolver utilization threshold) | Not disclosed | $0.0m drawn under the $1,000.0m committed 2022 facility | Not assessable | [Q2 FY2026 Form 10-Q, Note 7 (Revolving Credit Facilities), pp.19–20] |
| Equity cure rights (Y/N, limits) | Not disclosed | Not assessable | Not assessable | [Q2 FY2026 Form 10-Q, Note 7 (Revolving Credit Facilities), pp.19–20] |
| Other: restrictions on subsidiary debt, liens and fundamental changes | Qualitative negative covenants; exceptions and qualifications not quantified | Company states compliance | Quantitative headroom not assessable | [Q2 FY2026 Form 10-Q, Note 7 (Revolving Credit Facilities), p.20] |

The $1,000.0m 2022 Credit Agreement expires on 22 November 2028, has no drawing at the reporting date, and contains the disclosed maximum consolidated leverage-ratio covenant. The separate $150.0m 2025 facility is uncommitted, cancellable at any time and callable on demand; it is not evidence of a covenant cushion or usable committed liquidity. [Q2 FY2026 Form 10-Q, Note 7 (Revolving Credit Facilities), pp.19–20]

### Covenant EBITDA Definition & Quality (required if headroom is computed)

No numerical covenant headroom is computed because the filing does not disclose the maximum ratio, the actual ratio, or the agreement's EBITDA definition.

| Item | Value / Description | Source |
|---|---|---|
| Covenant EBITDA definition summary | Not disclosed in the data pool | [Q2 FY2026 Form 10-Q, Note 7 (Revolving Credit Facilities), pp.19–20] |
| Addbacks permitted (types) | Not disclosed in the data pool | [Q2 FY2026 Form 10-Q, Note 7 (Revolving Credit Facilities), pp.19–20] |
| Addback caps / limits | Not disclosed in the data pool | [Q2 FY2026 Form 10-Q, Note 7 (Revolving Credit Facilities), pp.19–20] |
| Is covenant EBITDA materially above reported EBITDA? | Not assessable | [Q2 FY2026 Form 10-Q, Note 7 (Revolving Credit Facilities), pp.19–20] |

Headroom quality is unknown: a compliance statement cannot establish whether the lender's EBITDA includes material addbacks or whether those addbacks have caps. The synthesis layer should retain covenant headroom as **Not assessable** and apply the module cap for missing covenant-EBITDA/addback detail; the executed 2022 Credit Agreement and amendments are the single document needed to remove this limitation.

## 3. Headroom & Breach Proximity

| Metric | Value |
|---|---:|
| Tightest covenant | Not assessable — the only disclosed financial test is a maximum consolidated leverage ratio, without its threshold or current actual |
| Headroom on tightest covenant (%) | Not assessable |
| EBITDA decline that would breach it (approx.) | Not assessable — the ceiling and Covenant EBITDA definition are absent |
| Debt increase that would breach it (approx.) | Not assessable — the ceiling and current covenant leverage are absent |

For a maximum-leverage covenant, the direction-correct formula would be `(threshold − actual) / threshold`; a positive result would be remaining headroom. Neither input is disclosed, so naming a breach percentage, EBITDA decline or debt increase would be invented. The filing confirms compliance only and does not establish whether the covenant is springing, the relevant debt netting, or equity-cure capacity. [Q2 FY2026 Form 10-Q, Note 7 (Revolving Credit Facilities), pp.19–20]

## 4. Coverage / Covenant Read

LTM GAAP-derived EBITDA covers gross interest expense by 35.73x and EBIT covers it by 13.75x; after total capex, the interest-only coverage is 11.07x. The strict LTM fixed-charge result is 0.23x because it includes the $1.150bn scheduled 2025 Note repayment and $398.7m operating-lease cash payments, so it describes the cash burden of a refinancing year rather than evidence that coupon interest cannot be paid. The only disclosed financial covenant is a maximum consolidated leverage ratio: Akamai reported compliance, but without the threshold, current ratio or Covenant EBITDA definition, the tightest covenant, its headroom and the operational move that would breach it are Not assessable.
