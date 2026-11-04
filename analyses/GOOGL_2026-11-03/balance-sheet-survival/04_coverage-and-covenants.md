# Coverage & Covenants — GOOGL

Alphabet reports under U.S. GAAP in USD. Amounts below are USD millions unless stated otherwise; ratios use the LTM period ended 30 September 2026. Alphabet does not report company-defined EBITDA. The $185,516m denominator is Capital IQ's calculated LTM EBITDA, not management-adjusted EBITDA. The deterministic sidecar is the controlling workbook read: the four quarterly CIQ EBITDA fields sum to $185,891m, $375m (0.2%) higher, so this report uses $185,516m rather than silently substituting the quarterly sum. [CIQ Financials → Income Statement, LTM ended 2026-09-30; `ciq_facts.json`, `ltm_ebitda_m`; `data/GOOGL/Alphabet Inc NasdaqGS GOOGL Financials_Quarterly.xls`, CIQ Financials → Quarterly Income Statement, Q4 FY2025–Q3 FY2026]

## 1. Coverage Ratios

| Ratio | Value | Source |
|---|---:|---|
| EBITDA / interest | 43.94x | $185,516 ÷ $4,222 gross-interest proxy. [CIQ Financials → Income Statement, LTM ended 2026-09-30; `ciq_facts.json`, `ltm_ebitda_m`; FY2025 Form 10-K, Other Income (Expense) note; Q3 FY2026 Form 10-Q, Other Income (Expense) note] |
| EBIT / interest | 37.18x | $156,976 ÷ $4,222. [CIQ Financials → Quarterly Income Statement, Q4 FY2025–Q3 FY2026; FY2025 Form 10-K, Other Income (Expense) note; Q3 FY2026 Form 10-Q, Other Income (Expense) note] |
| (EBITDA − capex) / interest | 6.09x | ($185,516 − $159,804) ÷ $4,222. [CIQ Financials → Income Statement / Cash Flow, LTM ended 2026-09-30; `ciq_facts.json`, `ltm_ebitda_m`, `ltm_ocf_m`; `data/GOOGL/Alphabet Inc NasdaqGS GOOGL Financials_Quarterly.xls`, CIQ Financials → Cash Flow, Q4 FY2025–Q3 FY2026] |
| Fixed-charge coverage | Not assessable | The pool provides annual and nine-month lease cash flows, but does not separate LTM scheduled debt amortisation from voluntary repayments; a matched-basis fixed-charge denominator cannot be built. [FY2025 Form 10-K, Note 4 (Leases); Q3 FY2026 Form 10-Q, Note 4 (Leases) and Consolidated Statements of Cash Flows] |

The interest denominator is a **gross-interest proxy**, not net interest income: reported LTM interest expense is $3,076m and is stated net of capitalised interest. This report adds back estimated LTM capitalised interest of $1,146m — $447m FY2025 less $301m in 9M FY2025 plus $1,000m in 9M FY2026 — giving $4,222m. It excludes interest income. The CIQ sidecar's 60.3x interest-coverage fact reconciles to $185,516m ÷ $3,076m = 60.31x because it uses reported interest expense after capitalisation; that is a different denominator, not a conflicting source read. [FY2025 Form 10-K, Other Income (Expense) note; Q3 FY2026 Form 10-Q, Other Income (Expense) note; CIQ Financials → Income Statement EBITDA ÷ Interest Expense, LTM ended 2026-09-30; `ciq_facts.json`, `interest_coverage_x`]

EBITDA is cash-backed at the CFO level: LTM CFO was $179,551m, or 96.8% of the CIQ EBITDA measure. The caution is the $159,804m capex burden, which leaves $19,747m of CFO-minus-capex FCF and reduces EBITDA-minus-capex interest coverage to 6.09x. This report does not treat EBITDA as adjusted or as a substitute for post-capex cash generation. [CIQ Financials → Cash Flow / Income Statement, LTM ended 2026-09-30; `ciq_facts.json`, `ltm_ocf_m`, `ltm_ebitda_m`; `analyses/GOOGL_2026-11-03/earnings/06_earnings-quality.md`, §§1–2]

**Executed calculation check (Bash/AWK; USD millions):**

```text
$ awk 'BEGIN { ebitda=185516; ebit=156976; capex=159804; reported_interest=3076; capitalized_interest=(447-301)+1000; gross_interest=reported_interest+capitalized_interest; strict_net_debt=73489; max_leverage=4.5; min_coverage=3.0; printf("capitalized_interest_ltm=%.0f\\n", capitalized_interest); printf("gross_interest_ltm=%.0f\\n", gross_interest); printf("EBITDA/gross_interest=%.2fx\\n", ebitda/gross_interest); printf("EBIT/gross_interest=%.2fx\\n", ebit/gross_interest); printf("(EBITDA-capex)/gross_interest=%.2fx\\n", (ebitda-capex)/gross_interest); printf("CIQ_EBITDA/reported_interest=%.2fx\\n", ebitda/reported_interest); printf("max_leverage_actual=%.3fx\\n", strict_net_debt/ebitda); printf("max_leverage_headroom=%.1f%%\\n", (max_leverage-(strict_net_debt/ebitda))/max_leverage*100); printf("min_coverage_headroom=%.1f%%\\n", ((ebitda/gross_interest)-min_coverage)/min_coverage*100); printf("EBITDA_decline_to_leverage_breach=%.1f%%\\n", (1-((strict_net_debt/max_leverage)/ebitda))*100); printf("net_debt_increase_to_leverage_breach=%.0f\\n", max_leverage*ebitda-strict_net_debt); }'
capitalized_interest_ltm=1146
gross_interest_ltm=4222
EBITDA/gross_interest=43.94x
EBIT/gross_interest=37.18x
(EBITDA-capex)/gross_interest=6.09x
CIQ_EBITDA/reported_interest=60.31x
max_leverage_actual=0.396x
max_leverage_headroom=91.2%
min_coverage_headroom=1364.7%
EBITDA_decline_to_leverage_breach=91.2%
net_debt_increase_to_leverage_breach=761333
```

## 2. Covenant Inventory

The filed credit-facility summaries disclose $10,000m of revolvers ($4,000m due April 2027 and $6,000m due April 2030), all undrawn at 30 September 2026, but do **not** disclose financial-maintenance thresholds, testing conditions, covenant EBITDA definitions, addback limits, cure rights, or revolver-utilisation triggers. The pool contains no underlying credit agreement. Waymo also entered a $5,000m senior secured term loan in October 2026, due October 2032 at Term SOFR + 5.25%; its financial covenants are likewise not disclosed, and Alphabet does not guarantee it. Contractual covenant headroom is therefore **Not assessable** for scoring. [Q3 FY2026 Form 10-Q, Note 6 (Debt and Credit Facility); FY2025 Form 10-K, Note 6 (Credit Facility)]

| Covenant | Threshold | Current Actual | Headroom | Source |
|---|---|---:|---:|---|
| Max net leverage | **Illustrative 4.5x maximum; not a disclosed contractual term** | 0.40x strict net debt / LTM EBITDA | +91.2% | Labeled market-style assumption only: $(4.5 - 0.396) / 4.5$. Actual covenant definition is undisclosed. Strict net debt is $73,489m. [Q3 FY2026 Form 10-Q, Consolidated Balance Sheets; `analyses/GOOGL_2026-11-03/balance-sheet-survival/01_capital-structure-and-leverage.md`, §§4–5] |
| Min interest coverage | **Illustrative 3.0x minimum; not a disclosed contractual term** | 43.94x gross-interest proxy | +1,364.7% | Labeled market-style assumption only: $(43.94 - 3.0) / 3.0$. Actual covenant definition is undisclosed. [FY2025 Form 10-K, Other Income (Expense) note; Q3 FY2026 Form 10-Q, Other Income (Expense) note] |
| Min liquidity / net worth | Not disclosed | Not assessable | Not assessable | No contractual threshold in the data pool. [Q3 FY2026 Form 10-Q, Note 6 (Credit Facility)] |
| Springing covenant trigger (e.g., revolver utilisation threshold) | Not disclosed | $10,000m revolvers undrawn; activation status not assessable | Not assessable | Facility balances are disclosed; testing trigger is not. [Q3 FY2026 Form 10-Q, Note 6 (Credit Facility)] |
| Equity cure rights (Y/N, limits) | Not disclosed | Not assessable | Not assessable | No cure terms in the data pool. [Q3 FY2026 Form 10-Q, Note 6 (Credit Facility)] |
| Other: Waymo term-loan covenants | Not disclosed | $5,000m facility entered October 2026; draw status and covenant terms not disclosed | Not assessable | [Q3 FY2026 Form 10-Q, Note 6 (Debt)] |

The illustrative rows are not evidence that Alphabet has a 4.5x leverage covenant or a 3.0x coverage covenant. They are sensitivity cases required by the partial-data rule, based on the conservative strict-net-debt measure from the upstream debt analysis rather than a covenant-defined net-debt measure.

### Covenant EBITDA Definition & Quality (required if headroom is computed)

| Item | Value / Description | Source |
|---|---|---|
| Covenant EBITDA definition summary | Not disclosed. Illustrative calculations use CIQ's unadjusted calculated LTM EBITDA of $185,516m, not covenant EBITDA. | [CIQ Financials → Income Statement, LTM ended 2026-09-30; `ciq_facts.json`, `ltm_ebitda_m`; Q3 FY2026 Form 10-Q, Note 6 (Credit Facility)] |
| Addbacks permitted (types) | Not disclosed. | [Q3 FY2026 Form 10-Q, Note 6 (Credit Facility)] |
| Addback caps / limits | Not disclosed. | [Q3 FY2026 Form 10-Q, Note 6 (Credit Facility)] |
| Is covenant EBITDA materially above reported EBITDA? | Unknown. Alphabet does not report company EBITDA, and no covenant calculation is supplied. Headroom quality is unknown; this is an addback-illusion risk. | [Q3 FY2026 Form 10-Q, Consolidated Statements of Income; Note 6 (Credit Facility)] |

## 3. Headroom & Breach Proximity

| Metric | Value |
|---|---:|
| Tightest covenant | **Not assessable — contractual terms are undisclosed.** The smaller illustrative, noncontractual cushion is the assumed 4.5x maximum net-leverage case. |
| Headroom on tightest covenant (%) | **Not assessable contractually; illustrative maximum-leverage headroom: +91.2%.** |
| EBITDA decline that would breach it (approx.) | **Not assessable contractually; illustrative maximum-leverage case: 91.2%**, holding strict net debt at $73,489m. Breach EBITDA would be $16,331m ($73,489m ÷ 4.5). |
| Debt increase that would breach it (approx.) | **Not assessable contractually; illustrative maximum-leverage case: $761,333m** of additional strict net debt, holding EBITDA at $185,516m: $(4.5 × 185,516) - 73,489$. |

The interest-coverage sensitivity would reach its assumed 3.0x floor after an approximately 93.2% EBITDA decline, using the $4,222m gross-interest proxy. It is less restrictive than the assumed maximum-leverage sensitivity, but neither is a contractual breach test. [FY2025 Form 10-K, Other Income (Expense) note; Q3 FY2026 Form 10-Q, Other Income (Expense) note; CIQ Financials → Income Statement, LTM ended 2026-09-30]

## 4. Coverage / Covenant Read

Earnings carry the gross-interest proxy at 43.94x EBITDA/interest; after total capex the ratio is still 6.09x, although LTM CFO-minus-capex FCF is only $19,747m. [CIQ Financials → Income Statement / Cash Flow, LTM ended 2026-09-30; `ciq_facts.json`, `ltm_ebitda_m`, `ltm_ocf_m`; `data/GOOGL/Alphabet Inc NasdaqGS GOOGL Financials_Quarterly.xls`, CIQ Financials → Cash Flow, Q4 FY2025–Q3 FY2026]

The tightest actual covenant and its headroom are not proven from available data: the facility summaries disclose balance and maturity, not thresholds, definitions, or cure terms. The illustrative 4.5x maximum-leverage case shows 91.2% headroom and would require a 91.2% EBITDA decline or $761.3bn of additional strict net debt to fail, but it must not be used as a contractual breach forecast. [Q3 FY2026 Form 10-Q, Note 6 (Credit Facility); `analyses/GOOGL_2026-11-03/balance-sheet-survival/01_capital-structure-and-leverage.md`, §§4–5]
