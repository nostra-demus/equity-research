# Accounting Forensics — BURL

## 0. Sector Gate & Inputs

| Item | Detail | Source |
|---|---|---|
| Sector (from triage 00) | US off-price retailer; US GAAP, USD, January year-end. | [00_governance-data-triage, 2026-09-29] |
| Financials overlay applied? (bank/NBFC/insurer → battery invalid) | No. BURL is a retailer, so the accrual and cash-flow batteries are valid. | [00_governance-data-triage, 2026-09-29] |
| Years of audited annual history in pool | FY2023–FY2025. | [FY2025 Form 10-K, pp. 41–46, filed 2026-03-19]; [FY2024 Form 10-K, pp. 48–53, filed 2025-03-17] |
| earnings/06 baseline present? | Yes; used rather than recomputed for CFO/PAT and CFO/EBITDA. | [earnings/06_earnings-quality, §§1–6, 2026-09-29] |
| balance-sheet-survival/01 debt stack present? | No. balance-sheet-survival/01_capital-structure-and-leverage cross-module input not available — proceeding on this module's own read of the data pool. | [FY2025 Form 10-K, pp. 45, 69–71] |
| Battery computable? (needs 2 consecutive annual filings) | Yes. FY2023 comparative balance-sheet data enables all Dechow components. | [FY2024 Form 10-K, pp. 50, 52–53]; [FY2025 Form 10-K, pp. 43, 45–46] |

All figures are USD millions unless stated. Not Applicable (no data) is a disclosure gap, not a clean result.

## 1. Battery Inputs (two consecutive audited annual filings — every number cited, verbatim per §5)

| Input line item | FY2024 | FY2025 | Evidence |
|---|---:|---:|---|
| Revenue (net sales, model convention) | 10,616.743 | 11,549.607 | [FY2025 Form 10-K, p. 43] |
| Trade receivables | 88.079 | 105.296 | [FY2025 Form 10-K, p. 45] |
| Cost of goods sold / gross margin | 6,025.272 / 43.25% | 6,486.922 / 43.84% | [FY2025 Form 10-K, p. 43]; margin calculated from cited inputs |
| Current assets | 2,628.803 | 2,771.532 | [FY2025 Form 10-K, p. 45] |
| Net PP&E | 2,369.720 | 3,164.218 | [FY2025 Form 10-K, pp. 45, 62] |
| Securities / non-current investments | 0 separately presented | 0 separately presented | [FY2025 Form 10-K, p. 45] |
| Total assets | 8,770.413 | 9,919.057 | [FY2025 Form 10-K, p. 45] |
| Depreciation & amortization | 347.575 | 417.871 | [FY2025 Form 10-K, pp. 43, 46] |
| SG&A | 3,546.967 | 3,817.180 | [FY2025 Form 10-K, p. 43] |
| Long-term debt | 1,539.918 | 2,011.735 | [FY2025 Form 10-K, pp. 45, 69–71] |
| Current liabilities | 2,272.511 | 2,249.211 | [FY2025 Form 10-K, p. 45] |
| Current debt | 170.891 | 70.591 | [FY2025 Form 10-K, p. 45] |
| CFO (cash from operations) | 863.376 | 1,231.382 | [FY2025 Form 10-K, p. 46] |
| Net income from continuing operations | 503.639 | 610.153 | [FY2025 Form 10-K, p. 43] |
| Inventory | 1,250.775 | 1,311.903 | [FY2025 Form 10-K, p. 45] |
| Cash & bank deposits | 994.698 | 1,232.525 | [FY2025 Form 10-K, p. 45] |
| Interest income | 31.519 | 20.904 | [FY2025 Form 10-K, p. 43; MD&A, p. 31] |
| Cash taxes paid, net of refunds | 170.259 | 170.886 | [FY2025 Form 10-K, Note 12, pp. 66–67] |
| Securities issued during FY2025 | — | $500.0 incremental Term B-7 loans, 2025-06-11 | [FY2025 Form 10-K, Note 5, pp. 69–71] |

FY2023 Dechow comparatives: cash 925.359, receivables 74.361, inventory 1,087.841, current assets 2,327.024, total assets 7,706.840, current liabilities 2,028.786, current debt 13.703, long-term debt 1,394.942 and net income 339.649. [FY2024 Form 10-K, pp. 50, 52–53]

## 2. Beneish M-Score (A8-14) — computed with python3, computation shown

The M-score is a statement-pattern screen, not proof of fraud. I computed the mandated formula from Section 1 using the Bash/Python method.

| Component | Value FY2025 | Non-manipulator mean | Manipulator zone | Verdict |
|---|---:|---:|---|---|
| DSRI (receivables outrunning sales) | 1.0989 | 1.031 | ≥1.465 | Green |
| GMI (gross margin deteriorating) | 0.9866 | 1.014 | ≥1.193 | Green |
| AQI (asset quality softening) | 0.9338 | 1.039 | ≥1.254 | Green |
| SGI (sales growth pressure) | 1.0879 | 1.134 | ≥1.607 | Green |
| DEPI (depreciation rate slowing) | 1.0965 | 1.001 | ≥1.077 | Amber — one zone component |
| SGAI (overhead vs sales) | 0.9893 | 1.054 | not banded | Green |
| LVGI (leverage rising) | 0.9882 | 1.037 | ≥1.111 | Green |
| TATA (accruals vs assets) | −0.0626 | 0.018 | ≥0.031 | Green |

Composite: M = −4.84 + 0.920×1.0989 + 0.528×0.9866 + 0.404×0.9338 + 0.892×1.0879 + 0.115×1.0965 − 0.172×0.9893 − 0.327×0.9882 + 4.679×(−0.0626) = **−2.6207**. [FY2025 Form 10-K, pp. 43, 45–46]; computation by this agent.

| Composite / rule | Value | Green band | Amber band | Red band | Verdict |
|---|---:|---|---|---|---|
| M-score | −2.6207 | < −2.22, no component in zone | −2.22 to −1.78 | > −1.78 | Amber: composite Green, but one zone component must be Amber. |
| Components in manipulator zone | 1 of 7 | 0 | 1–2 | ≥3 | Amber |

DEPI is the only zone signal: the depreciation rate fell from 12.79% to 11.67%. PP&E grew 33.5% and D&A rose 20.2%, so the filings do not establish an unexplained expense suppression. [FY2025 Form 10-K, pp. 45–46, 62]

## 3. Dechow F-Score & Accrual Battery (A8-17, A8-18) — computed with python3, computation shown

The Dechow F-score estimates misstatement probability; 1.00 is the average company. RSST is total accruals, or profit booked before cash, across working capital, non-current operating assets and financing. Soft assets are assets other than cash and PP&E, which rely more on estimates.

| Test | Value | Green band | Red band | Verdict | Evidence |
|---|---:|---|---|---|---|
| Dechow F-score | 0.8819 | <1.00 | ≥1.85; ≥2.45 high | Green | Required Python computation. |
| RSST accruals / average assets | 2.13% | ≤3% | ≥10% | Green | ΔWC −172.098 + ΔNCO 742.551 + ΔFIN −371.517 = 198.936; average assets 9,344.735. |
| Soft assets / total assets | 55.67% | <50% | >65% and rising | Amber | (9,919.057 − 3,164.218 − 1,232.525) / 9,919.057. |
| Δ receivables / average assets | 0.18% | <2% | ≥5% | Green | 17.217 / 9,344.735. |
| Δ inventory / average assets | 0.65% | <2% | ≥5% | Green | 61.128 / 9,344.735. |
| A8-18 — issuance in a flagged year | $500.0m Term B-7 incremental loans; F 0.8819 and TATA −6.26% | none while flagged | issued while F ≥1.85 or TATA ≥3.1% | Green | Debt was raised, but not in a battery-flagged year. |

Inputs and output: WC FY2023/FY2024/FY2025 = −613.418/−467.515/−639.613; NCO = 2,093.636/2,554.122/3,296.673; FIN = −1,408.645/−1,710.809/−2,082.326. Cash sales rose from 10,603.025 to 11,532.390, or 8.765%; ROA rose 6.113% to 6.529%. The Python output was pred = −5.7219, probability = 0.3263%, F = 0.8819. [FY2024 Form 10-K, pp. 50, 52–53]; [FY2025 Form 10-K, pp. 43, 45–46]

## 4. Cash Authenticity (A8-19)

| Test | Value | Band | Verdict | Evidence |
|---|---:|---|---|---|
| Interest income ÷ average cash & deposits | Not computable — mixed interest line | — | Not Applicable (no data) | The $20.904m line is not split between cash/deposits and investments; FY2025 MD&A says the change reflected more investments in FY2024. [FY2025 Form 10-K, p. 31, pp. 43, 45] |
| Period risk-free rate | 3.91% | — | Reference only | Calendar-2025 US one-year Treasury annual observation, used as an imperfect fiscal-2025 proxy and not today’s rate. [FRED RIFLGFCY01NA, retrieved 2026-09-29] |
| Gap | Not computable | Green within about 150bp; Red <50% of risk-free | Not Applicable (no data) | An illustrative 1.88% using total interest would be scope-invalid and is not a result. |
| Cash held in company’s own name at major banks? | Direct cash-and-equivalents presentation; no trust/custody wording found | Third-party trust/custody is Red | Not proven from available data | Presentation is not independent ownership confirmation. [FY2025 Form 10-K, pp. 45, 52] |
| Auditor obtained independent bank confirmations? | Not disclosed in public report | Confirmations never independently obtained is Red | Not Applicable (no data) | The report gives unqualified financial-statement and ICFR opinions but no bank-confirmation procedure. [FY2025 Form 10-K, p. 41] |

## 5. Revenue Quality (A8-15)

| Cross-check | FY2024 | FY2025 | Band | Verdict | Evidence |
|---|---:|---:|---|---|---|
| Revenue growth vs cash-taxes-paid growth | Sales 10,616.743; tax 170.259 | Sales 11,549.607, +8.79%; tax 170.886, +0.37% | Red if revenue grows while cash taxes and collections stay flat | Amber | Taxes were flat, though tax expense rose to 205.965 from 171.175. [FY2025 Form 10-K, pp. 43, 66–67] |
| Collections proxy: revenue − Δreceivables | 10,603.025 | 11,532.390, +8.77% | Red if collections flat while revenue grows | Green | Collections rose with sales. [FY2024 Form 10-K, p. 52]; [FY2025 Form 10-K, pp. 43, 45] |
| Unbilled revenue + contract assets / revenue | Not separately disclosed | Not separately disclosed | Green <10%; Red >25% | Not Applicable (business model / no data) | Point-of-sale/delivery revenue; layaway cash is a liability until delivery. Zero contract assets are not assumed. [FY2025 Form 10-K, Note 1, p. 52] |
| Order book: binding or MOU-paper? | Not applicable | Not applicable | MOU-paper is Red | Not Applicable (business model) | Retail sales have no order-book claim. [FY2025 Form 10-K, Note 1, p. 52] |

## 6. Accrual & Conversion Baseline (A8-01, A8-11, A8-12) — figures from earnings/06 where present

| Test | Raw value | Green band | Red band | Trend (3–5y) | Verdict | Evidence |
|---|---:|---|---|---|---|---|
| A8-01 — CFO/PAT | 2.02× FY2025 | ≥0.8 | <0.6 | 2.59×, 2.56×, 1.71×, 2.02× | Green | [earnings/06_earnings-quality, §§1–3, 2026-09-29] |
| A8-11 — cash EPS / accounting EPS | 2.02× FY2025 proxy | ≈1 | <0.7 | Same CFO/NI proxy trend | Green | Same diluted-share denominator; cash EPS proxy is above 1.0. [earnings/06_earnings-quality, §§1–3, 2026-09-29] |
| A8-12 — CFO/EBITDA | 99.2% FY2025 | ≥0.7 | <0.5 sustained | 91.6%, 102.5%, 82.4%, 99.2% | Green | EBITDA is earnings before interest, tax, depreciation and amortisation. [earnings/06_earnings-quality, §§1–3, 2026-09-29] |

## 7. Balance-Sheet Hygiene (A8-02, A8-03, A8-04, A8-06)

| Test | Raw value | Green band | Red band | Trend | Verdict | Evidence |
|---|---:|---|---|---|---|---|
| A8-02 — working-capital days | CCC 13.2 days FY2025 | stable or negative | rising >20% with no model change | 8.5, 14.4, 13.2 | Amber | Better YoY, but 4.7 days above FY2023. DSO rose 2.6→2.7→2.8; DIO fell 77.7→74.2→70.8. [earnings/06_earnings-quality, §4, 2026-09-29] |
| A8-03 — receivables aged >6 months | No ageing ladder | minimal/stable | sharply rising/concentrated | Receivables +19.5%; DSO +0.1 day | Not Applicable (no data) | Total receivables only. [FY2025 Form 10-K, p. 45]; [earnings/06_earnings-quality, §4] |
| A8-04 — expense capitalization | Capitalised additions not separately disclosed | conservative/stable | development or interest capitalization rising | Software amortisation 25.7→29.1 | Not Applicable (no data) | Software policy is 3–10 years; a capitalisation rate cannot be calculated. [FY2025 Form 10-K, pp. 62–63] |
| A8-06 — goodwill vs net worth; impairment | 47.064 / 1,807.259 = 2.60% | modest/tested | > net worth or serial impairments | Goodwill unchanged | Green | FY2025 impairment is disclosed long-lived-asset impairment, not goodwill. [FY2025 Form 10-K, pp. 43, 45, 56–57] |

## 8. P&L Quality (A8-05, A8-08, A8-09, A8-10)

| Test | Raw value | Green band | Red band | Trend | Verdict | Evidence |
|---|---:|---|---|---|---|---|
| A8-05 — exceptionals frequency; other income / PBT | 31.287 / 816.118 = 3.83% | <10% | yearly one-offs or >⅓ PBT | FY2024 2.47% | Green | [FY2025 Form 10-K, p. 43] |
| A8-08 — depreciation charge vs asset base | Depreciation rate 12.79%→11.67%; DEPI 1.0965 | tracks asset base | unexplained drop on stable base | PP&E +33.5%; D&A +20.2% | Amber | Zone component, but not a stable asset base. [FY2025 Form 10-K, pp. 45–46, 62] |
| A8-09 — provisioning adequacy | No credit-book provision series | coverage stable | releases funding profit | Not assessable | Not Applicable (business model / no data) | Retailer has no lending-book coverage metric. [FY2025 Form 10-K, pp. 43, 45, 52–67] |
| A8-10 — effective tax rate | 25.2% FY2025; 25.4% FY2024 | near statutory/explained | persistently low/unexplained | Stable | Green | [FY2025 Form 10-K, Note 12, pp. 66–67] |

## 9. Policy, Estimate & Perimeter Stability (A8-07, A8-13, A8-16)

| Test | Finding | Green band | Red band | Verdict | Evidence |
|---|---|---|---|---|---|
| A8-07 — policy / estimate / year-end changes | Interest income was separated from other income with comparatives recast; no disclosed profit-boosting change; both years 52 weeks. | stable | profit-boosting change or muddied year-end | Green | [FY2025 Form 10-K, pp. 43, 52] |
| A8-13 — consolidation perimeter | Consolidated subsidiaries and intercompany eliminations in both filings; no disclosed deconsolidation identified. | stable/explained | churn or engineered associates | Green, confidence 3/5 | Filing-level test only. [FY2025 Form 10-K, Note 1, p. 52]; [FY2024 Form 10-K, Note 1] |
| A8-16 — segment / geography disclosure shifts | One reportable segment in both years. | stable/clearer | merged/redefined on deterioration | Green | [FY2025 Form 10-K, Note 1, p. 52] |

## 10. Regulator-Found Divergence (A8-20) — swept per frameworks/GOVERNANCE_DATABASES.md

| Check | Finding | Red band | Verdict | Evidence |
|---|---|---|---|---|
| Regulator inspection divergence vs reported numbers | No attributable SEC enforcement, restatement or inspection-divergence result was returned by the limited official-domain searches. | any divergence | Amber — coverage-limited | SEC-1 and SEC-2 Sweep Log rows |
| Lender- or regulator-directed forensic audit | No attributable DOJ result was returned by the limited official-domain search. | any (RF-ACC-005) | Amber — coverage-limited | DOJ-1 Sweep Log row |

## 11. Leverage & Advances Hygiene (A14-01, A14-02) — debt stack from balance-sheet-survival/01 where present

| Test | Raw value (basis labeled per §15) | Green band | Red band | Trend | Verdict | Evidence |
|---|---:|---|---|---|---|---|
| A14-01 — net debt / EBITDA | **Strict net debt** = 70.591 + 2,011.735 − 1,232.525 = 849.801; strict net debt / EBITDA = 0.68× | net cash or <0.5× | >3× or promoter-objective leverage | FY2024 strict ratio 0.68× | Amber | Stable and far below Red, but not within Green. [FY2025 Form 10-K, pp. 45, 69–71]; [earnings/06_earnings-quality, §1] |
| A14-02 — loans & advances / total assets | No separately presented loans-and-advances balance | <2% | >5%, rising, or non-repaying | Not assessable | Not Applicable (no data) | Prepaids cannot be relabelled as loans. [FY2025 Form 10-K, p. 45] |

## 12. Forensics Read

BURL’s measured batteries do not show a current manipulation pattern: Beneish M = **−2.6207** and Dechow F = **0.8819**, both below Red cutoffs. The worst measured signal is DEPI of **1.0965**, which can rhyme with delayed depreciation, but PP&E grew 33.5% and D&A rose 20.2%, so the filings do not establish expense suppression. CFO/PAT of **2.02×**, CFO/EBITDA of **99.2%**, and collections growth of 8.77% corroborate earnings; cash taxes were nearly flat and require a timing check. Cash authenticity is **not proven from available data** because interest income is scope-mixed and the public audit report does not disclose bank-confirmation procedures. A minority holder has no measured books-manipulation red flag today, but should require FY2026 detail on cash interest, receivable ageing and capitalised-development additions.

## Sweep Log

| Database | Query | Date | Results | Attributed? (identifier used) | Coverage note |
|---|---|---|---:|---|---|
| SEC EDGAR / SEC-domain | site:sec.gov/enforcement-litigation “Burlington Stores” accounting OR financial reporting OR restatement OR forensic | 2026-09-29 | 0 attributable enforcement results | No | Ordinary filings returned; not a dedicated enforcement-index review. |
| SEC litigation/admin | site:sec.gov “Burlington Stores, Inc.” “Accounting and Auditing Enforcement Release” OR “administrative proceeding” OR “litigation release” | 2026-09-29 | 0 attributable release/order results | No | Search-index coverage limited; direct SEC review remains required. |
| DOJ | site:justice.gov “Burlington Stores, Inc.” fraud OR accounting OR forensic | 2026-09-29 | 0 attributable results | No | Press-release search is not a court-docket sweep. |
| FRED / US Treasury source | RIFLGFCY01NA, annual 2025 one-year constant-maturity Treasury yield | 2026-09-29 | 1 observation: 3.91% | Yes | Calendar-year proxy for fiscal 2025; used only as cash-test reference. |

## Universal Findings Table

| Finding ID | Section | Question / Test | Standardized Verdict | Raw Value | Unit | Current Period | Prior Period | Trend | Peer Benchmark | Peer Verdict | Score | Max Score | Penalty | Confidence 1–5 | Materiality | Evidence | As-of Date | Analyst Interpretation | Red Flag Triggered? | Red Flag ID | Follow-up Required |
|---|---|---|---|---:|---|---|---|---|---|---|---:|---:|---:|---:|---|---|---|---|---|---|---|
| A8-01 | 6 | A8-01 — CFO / PAT | Green | 2.02 | x | FY2025 | 1.71 | Sustained >0.8 | No peer set | Not assessed | 0 | 25 | 0 | 5 | High | S03 | 2026-01-31 | Cash confirms profit. | No | — | — |
| A8-02 | 7 | A8-02 — working-capital days creep | Amber | 13.2 | days CCC | FY2025 | 14.4 | Above FY2023 8.5 | No peer set | Not assessed | 1 | 20 | 0 | 4 | Medium | S03 | 2026-01-31 | Better YoY, not back to FY2023. | No | — | Explain CCC rise. |
| A8-03 | 7 | A8-03 — receivables aged >6 months | Not Applicable (no data) | null | — | FY2025 | FY2024 | Ageing unavailable | No peer set | Not assessed | 1 | 20 | 0 | 2 | Medium | S01,S03 | 2026-01-31 | Total receivables only. | No | — | Obtain aged receivables. |
| A8-04 | 7 | A8-04 — expense capitalization | Not Applicable (no data) | null | — | FY2025 | FY2024 | Rate unavailable | No peer set | Not assessed | 1 | 20 | 0 | 2 | Medium | S01 | 2026-01-31 | Capitalisation rate not disclosed. | No | — | Obtain additions. |
| A8-05 | 8 | A8-05 — recurring exceptionals & other income | Green | 3.83 | % PBT | FY2025 | 2.47 | Below 10% | No peer set | Not assessed | 0 | 10 | 0 | 4 | Low | S01 | 2026-01-31 | Other income does not drive profit. | No | — | — |
| A8-06 | 7 | A8-06 — goodwill build-up & impairment | Green | 2.60 | % equity | FY2025 | 3.43 | Unchanged goodwill | No peer set | Not assessed | 0 | 20 | 0 | 5 | Low | S01 | 2026-01-31 | Goodwill modest. | No | — | — |
| A8-07 | 9 | A8-07 — policy / estimate / year-end changes | Green | 0 | changes | FY2025 | FY2024 | 52-week years | No peer set | Not assessed | 0 | 10 | 0 | 4 | Medium | S01 | 2026-01-31 | Presentation change only. | No | — | — |
| A8-08 | 8 | A8-08 — depreciation rate consistency | Amber | 1.0965 | DEPI | FY2025 | 1.0000 | 12.79% to 11.67% | No peer set | Not assessed | 1 | 10 | 0 | 4 | Medium | S01 | 2026-01-31 | One Beneish zone component. | No | — | Test useful lives. |
| A8-09 | 8 | A8-09 — provisioning adequacy | Not Applicable (business model / no data) | null | — | FY2025 | FY2024 | No lender reserve series | No peer set | Not assessed | 0 | 10 | 0 | 2 | Low | S01 | 2026-01-31 | Retailer lacks credit-book coverage metric. | No | — | Identify reserve releases. |
| A8-10 | 8 | A8-10 — effective tax-rate anomaly | Green | 25.2 | % | FY2025 | 25.4 | Stable | No peer set | Not assessed | 0 | 10 | 0 | 5 | Medium | S01 | 2026-01-31 | No low-tax pattern. | No | — | — |
| A8-11 | 6 | A8-11 — cash EPS / accounting EPS | Green | 2.02 | x proxy | FY2025 | 1.71 | Above 1.0 | No peer set | Not assessed | 0 | 25 | 0 | 4 | High | S03 | 2026-01-31 | Cash EPS proxy supports earnings. | No | — | — |
| A8-12 | 6 | A8-12 — CFO / EBITDA conversion | Green | 99.2 | % | FY2025 | 82.4 | Above green four years | No peer set | Not assessed | 0 | 25 | 0 | 5 | High | S03 | 2026-01-31 | Sustained conversion. | No | — | — |
| A8-13 | 9 | A8-13 — consolidation opacity | Green | 1 | segment | FY2025 | 1 | No disclosed churn | No peer set | Not assessed | 0 | 20 | 0 | 3 | Medium | S01,S02 | 2026-01-31 | Filing-level screen stable. | No | — | Recheck exhibit. |
| A8-14 | 2 | A8-14 — Beneish M-score | Amber | -2.6207 | M-score | FY2025 | FY2024 inputs | 1 zone component | No peer set | Not assessed | 2 | 25 | 0 | 5 | High | S01,S02 | 2026-01-31 | Composite Green; DEPI Amber. | No | — | Recompute FY2026. |
| A8-15 | 5 | A8-15 — revenue-quality cross-checks | Amber | 0.37 | % cash-tax growth | FY2025 | FY2024 | Sales +8.79%; collections +8.77% | No peer set | Not assessed | 3 | 15 | 0 | 4 | High | S01,S02 | 2026-01-31 | Cash tax timing needs reconciliation. | No | — | Reconcile timing. |
| A8-16 | 9 | A8-16 — segment / geography disclosure shifts | Green | 1 | segment | FY2025 | 1 | Stable | No peer set | Not assessed | 0 | 10 | 0 | 4 | Medium | S01 | 2026-01-31 | No masking redefinition. | No | — | — |
| A8-17 | 3 | A8-17 — Dechow F-score & accrual battery | Amber | 0.8819 | F-score | FY2025 | FY2024 inputs | Soft assets 55.67% | No peer set | Not assessed | 2 | 25 | 0 | 5 | High | S01,S02 | 2026-01-31 | F Green; soft assets Amber. | No | — | Repeat test. |
| A8-18 | 3 | A8-18 — issuance in a flagged year | Green | 500.0 | USDm debt | FY2025 | — | F Green, TATA negative | No peer set | Not assessed | 0 | 25 | 0 | 5 | Medium | S01 | 2026-01-31 | No flagged-year issue. | No | — | — |
| A8-19 | 4 | A8-19 — cash authenticity | Not Applicable (no data) | null | — | FY2025 | FY2024 | Interest split unavailable | No peer set | Not assessed | 6 | 15 | 0 | 2 | High | S01,S05 | 2026-01-31 | Cash not independently authenticated here. | No | — | Obtain split and confirmations. |
| A8-20 | 10 | A8-20 — regulator-found divergence | Amber | 0 | attributable results | 2026-09-29 | — | Coverage limited | No peer set | Not assessed | 2 | 10 | 0 | 2 | High | S06 | 2026-09-29 | No hit is not a clean sweep. | No | — | Direct SEC/court review. |
| A14-01 | 11 | A14-01 — net debt / EBITDA | Amber | 0.68 | x strict | FY2025 | 0.68 | Stable; above Green | No peer set | Not assessed | 4 | 15 | 0 | 4 | High | S01,S03 | 2026-01-31 | Far below Red, not Green. | No | — | Confirm debt use. |
| A14-02 | 11 | A14-02 — loans & advances / assets | Not Applicable (no data) | null | — | FY2025 | FY2024 | No standalone line | No peer set | Not assessed | 0 | 15 | 0 | 2 | Medium | S01 | 2026-01-31 | Prepaids are not loans. | No | — | Obtain note or nil confirmation. |

## Accounting-Forensics Risk Score (INVERTED — higher = WORSE)

| Component | Score | Max Score | Evidence |
|---|---:|---:|---|
| Accrual battery — Beneish + Dechow (A8-01, A8-11, A8-12, A8-14, A8-17, A8-18) | 5 | 25 | M and F Green; DEPI and soft assets are Amber. |
| Cash authenticity (A8-19) | 6 | 15 | Scope-matched interest yield and confirmation basis unavailable. |
| Revenue quality (A8-15) | 3 | 15 | Cash taxes flat; collections corroborate sales. |
| Balance-sheet hygiene — WC creep, receivables ageing, capitalization, goodwill, consolidation (A8-02, A8-03, A8-04, A8-06, A8-13) | 5 | 20 | CCC monitor and two disclosure gaps; goodwill/perimeter Green. |
| P&L quality & policy stability (A8-05, A8-07, A8-08, A8-09, A8-10, A8-16, A8-20) | 2 | 10 | DEPI monitor and coverage-limited sweep. |
| Leverage & advances hygiene (A14-01, A14-02) | 4 | 15 | Strict leverage 0.68× and advances gap. |
| **Total** | **25** | **100** | **No score-cap floor: RF-ACC-001 and RF-ACC-002 did not fire.** |

## Source Log

| Source ID | Source Type | Filename / Filing | Period | Page / Section | Date | Confidence 1–5 | Used For |
|---|---|---|---|---|---|---:|---|
| S01 | Tier 1 audited filing | Burlington Stores, Inc. Form 10-K | FY2025 | pp. 41, 43, 45–46, 52, 56–57, 62–63, 66–71 | 2026-03-19 | 5 | Battery, cash/revenue/tax, policies, debt |
| S02 | Tier 1 audited filing | Burlington Stores, Inc. Form 10-K | FY2024/FY2023 | pp. 50, 52–53 | 2025-03-17 | 5 | Dechow t−2 and collections inputs |
| S03 | Cross-module output | 06_earnings-quality.md | FY2022–FY2025 | §§1–4, 6 | 2026-09-29 | 4 | CFO/PAT, CFO/EBITDA, working capital |
| S05 | Official rate database | FRED RIFLGFCY01NA | Calendar 2025 | annual one-year Treasury observation | 2026-09-29 | 4 | Cash-test reference |
| S06 | Official regulator web searches | SEC and DOJ queries in Sweep Log | through 2026-09-29 | search results | 2026-09-29 | 2 | A8-20 coverage-limited sweep |

## Machine-Readable Findings

~~~json
[
{"finding_id":"A8-01","ticker":"BURL","date":"2026-09-29","agent":"accounting-forensics","section":"6","question":"CFO/PAT","standardized_verdict":"Green","raw_value":2.02,"unit":"x","current_period":"FY2025","prior_period":"FY2024 1.71x","trend":"sustained","peer_benchmark":"No peer set","peer_verdict":"Not assessed","score":0,"max_score":25,"penalty":0,"confidence_1_to_5":5,"materiality":"High","evidence":"CFO/PAT baseline","source_id":"S03","source_type":"cross-module","source_date":"2026-09-29","as_of_date":"2026-01-31","analyst_interpretation":"Cash confirms profit.","red_flag_triggered":false,"red_flag_id":"","follow_up_required":""},
{"finding_id":"A8-02","ticker":"BURL","date":"2026-09-29","agent":"accounting-forensics","section":"7","question":"Working-capital days creep","standardized_verdict":"Amber","raw_value":13.2,"unit":"days CCC","current_period":"FY2025","prior_period":"FY2024 14.4","trend":"above FY2023","peer_benchmark":"No peer set","peer_verdict":"Not assessed","score":1,"max_score":20,"penalty":0,"confidence_1_to_5":4,"materiality":"Medium","evidence":"CCC baseline","source_id":"S03","source_type":"cross-module","source_date":"2026-09-29","as_of_date":"2026-01-31","analyst_interpretation":"Improved YoY but not to FY2023.","red_flag_triggered":false,"red_flag_id":"","follow_up_required":"Explain CCC rise."},
{"finding_id":"A8-03","ticker":"BURL","date":"2026-09-29","agent":"accounting-forensics","section":"7","question":"Receivables aged >6 months","standardized_verdict":"Not Applicable (no data)","raw_value":null,"unit":"","current_period":"FY2025","prior_period":"FY2024","trend":"unavailable","peer_benchmark":"No peer set","peer_verdict":"Not assessed","score":1,"max_score":20,"penalty":0,"confidence_1_to_5":2,"materiality":"Medium","evidence":"Total receivables only","source_id":"S01","source_type":"audited filing","source_date":"2026-03-19","as_of_date":"2026-01-31","analyst_interpretation":"No ageing ladder.","red_flag_triggered":false,"red_flag_id":"","follow_up_required":"Obtain ageing."},
{"finding_id":"A8-04","ticker":"BURL","date":"2026-09-29","agent":"accounting-forensics","section":"7","question":"Expense capitalization","standardized_verdict":"Not Applicable (no data)","raw_value":null,"unit":"","current_period":"FY2025","prior_period":"FY2024","trend":"rate unavailable","peer_benchmark":"No peer set","peer_verdict":"Not assessed","score":1,"max_score":20,"penalty":0,"confidence_1_to_5":2,"materiality":"Medium","evidence":"Software policy","source_id":"S01","source_type":"audited filing","source_date":"2026-03-19","as_of_date":"2026-01-31","analyst_interpretation":"No additions data.","red_flag_triggered":false,"red_flag_id":"","follow_up_required":"Obtain additions."},
{"finding_id":"A8-05","ticker":"BURL","date":"2026-09-29","agent":"accounting-forensics","section":"8","question":"Exceptionals and other income","standardized_verdict":"Green","raw_value":3.83,"unit":"% PBT","current_period":"FY2025","prior_period":"FY2024 2.47%","trend":"below 10%","peer_benchmark":"No peer set","peer_verdict":"Not assessed","score":0,"max_score":10,"penalty":0,"confidence_1_to_5":4,"materiality":"Low","evidence":"Income statement","source_id":"S01","source_type":"audited filing","source_date":"2026-03-19","as_of_date":"2026-01-31","analyst_interpretation":"Not profit-driving.","red_flag_triggered":false,"red_flag_id":"","follow_up_required":""},
{"finding_id":"A8-06","ticker":"BURL","date":"2026-09-29","agent":"accounting-forensics","section":"7","question":"Goodwill and impairment","standardized_verdict":"Green","raw_value":2.6,"unit":"% equity","current_period":"FY2025","prior_period":"FY2024 3.43%","trend":"unchanged","peer_benchmark":"No peer set","peer_verdict":"Not assessed","score":0,"max_score":20,"penalty":0,"confidence_1_to_5":5,"materiality":"Low","evidence":"Balance sheet and impairment note","source_id":"S01","source_type":"audited filing","source_date":"2026-03-19","as_of_date":"2026-01-31","analyst_interpretation":"Goodwill modest.","red_flag_triggered":false,"red_flag_id":"","follow_up_required":""},
{"finding_id":"A8-07","ticker":"BURL","date":"2026-09-29","agent":"accounting-forensics","section":"9","question":"Policy, estimate, year-end changes","standardized_verdict":"Green","raw_value":0,"unit":"profit-boosting changes","current_period":"FY2025","prior_period":"FY2024","trend":"52-week comparable years","peer_benchmark":"No peer set","peer_verdict":"Not assessed","score":0,"max_score":10,"penalty":0,"confidence_1_to_5":4,"materiality":"Medium","evidence":"Note 1","source_id":"S01","source_type":"audited filing","source_date":"2026-03-19","as_of_date":"2026-01-31","analyst_interpretation":"Presentation change only.","red_flag_triggered":false,"red_flag_id":"","follow_up_required":""},
{"finding_id":"A8-08","ticker":"BURL","date":"2026-09-29","agent":"accounting-forensics","section":"8","question":"Depreciation consistency","standardized_verdict":"Amber","raw_value":1.0965,"unit":"DEPI","current_period":"FY2025","prior_period":"FY2024","trend":"rate 12.79% to 11.67%","peer_benchmark":"No peer set","peer_verdict":"Not assessed","score":1,"max_score":10,"penalty":0,"confidence_1_to_5":4,"materiality":"Medium","evidence":"PP&E and D&A","source_id":"S01","source_type":"audited filing","source_date":"2026-03-19","as_of_date":"2026-01-31","analyst_interpretation":"One zone component.","red_flag_triggered":false,"red_flag_id":"","follow_up_required":"Test useful lives."},
{"finding_id":"A8-09","ticker":"BURL","date":"2026-09-29","agent":"accounting-forensics","section":"8","question":"Provisioning adequacy","standardized_verdict":"Not Applicable (business model / no data)","raw_value":null,"unit":"","current_period":"FY2025","prior_period":"FY2024","trend":"no lender series","peer_benchmark":"No peer set","peer_verdict":"Not assessed","score":0,"max_score":10,"penalty":0,"confidence_1_to_5":2,"materiality":"Low","evidence":"Financial statements","source_id":"S01","source_type":"audited filing","source_date":"2026-03-19","as_of_date":"2026-01-31","analyst_interpretation":"Retailer not lender.","red_flag_triggered":false,"red_flag_id":"","follow_up_required":"Identify reserve releases."},
{"finding_id":"A8-10","ticker":"BURL","date":"2026-09-29","agent":"accounting-forensics","section":"8","question":"Effective tax rate","standardized_verdict":"Green","raw_value":25.2,"unit":"%","current_period":"FY2025","prior_period":"FY2024 25.4%","trend":"stable","peer_benchmark":"No peer set","peer_verdict":"Not assessed","score":0,"max_score":10,"penalty":0,"confidence_1_to_5":5,"materiality":"Medium","evidence":"Tax note","source_id":"S01","source_type":"audited filing","source_date":"2026-03-19","as_of_date":"2026-01-31","analyst_interpretation":"No low-tax pattern.","red_flag_triggered":false,"red_flag_id":"","follow_up_required":""},
{"finding_id":"A8-11","ticker":"BURL","date":"2026-09-29","agent":"accounting-forensics","section":"6","question":"Cash EPS/accounting EPS","standardized_verdict":"Green","raw_value":2.02,"unit":"x proxy","current_period":"FY2025","prior_period":"FY2024 1.71x","trend":"above 1.0","peer_benchmark":"No peer set","peer_verdict":"Not assessed","score":0,"max_score":25,"penalty":0,"confidence_1_to_5":4,"materiality":"High","evidence":"CFO/NI proxy","source_id":"S03","source_type":"cross-module","source_date":"2026-09-29","as_of_date":"2026-01-31","analyst_interpretation":"Cash EPS supports earnings.","red_flag_triggered":false,"red_flag_id":"","follow_up_required":""},
{"finding_id":"A8-12","ticker":"BURL","date":"2026-09-29","agent":"accounting-forensics","section":"6","question":"CFO/EBITDA conversion","standardized_verdict":"Green","raw_value":99.2,"unit":"%","current_period":"FY2025","prior_period":"FY2024 82.4%","trend":"green four years","peer_benchmark":"No peer set","peer_verdict":"Not assessed","score":0,"max_score":25,"penalty":0,"confidence_1_to_5":5,"materiality":"High","evidence":"Cash conversion","source_id":"S03","source_type":"cross-module","source_date":"2026-09-29","as_of_date":"2026-01-31","analyst_interpretation":"Sustained conversion.","red_flag_triggered":false,"red_flag_id":"","follow_up_required":""},
{"finding_id":"A8-13","ticker":"BURL","date":"2026-09-29","agent":"accounting-forensics","section":"9","question":"Consolidation opacity","standardized_verdict":"Green","raw_value":1,"unit":"segment","current_period":"FY2025","prior_period":"FY2024 1","trend":"no disclosed churn","peer_benchmark":"No peer set","peer_verdict":"Not assessed","score":0,"max_score":20,"penalty":0,"confidence_1_to_5":3,"materiality":"Medium","evidence":"Consolidation policy","source_id":"S01","source_type":"audited filing","source_date":"2026-03-19","as_of_date":"2026-01-31","analyst_interpretation":"Stable filing-level screen.","red_flag_triggered":false,"red_flag_id":"","follow_up_required":"Recheck exhibit."},
{"finding_id":"A8-14","ticker":"BURL","date":"2026-09-29","agent":"accounting-forensics","section":"2","question":"Beneish M-score","standardized_verdict":"Amber","raw_value":-2.6207,"unit":"M-score","current_period":"FY2025","prior_period":"FY2024 inputs","trend":"1 zone component","peer_benchmark":"No peer set","peer_verdict":"Not assessed","score":2,"max_score":25,"penalty":0,"confidence_1_to_5":5,"materiality":"High","evidence":"Python from audited inputs","source_id":"S01,S02","source_type":"audited filings","source_date":"2026-03-19","as_of_date":"2026-01-31","analyst_interpretation":"Composite Green; DEPI Amber.","red_flag_triggered":false,"red_flag_id":"","follow_up_required":"Recompute FY2026."},
{"finding_id":"A8-15","ticker":"BURL","date":"2026-09-29","agent":"accounting-forensics","section":"5","question":"Revenue quality","standardized_verdict":"Amber","raw_value":0.37,"unit":"% cash-tax growth","current_period":"FY2025","prior_period":"FY2024","trend":"sales +8.79%, collections +8.77%","peer_benchmark":"No peer set","peer_verdict":"Not assessed","score":3,"max_score":15,"penalty":0,"confidence_1_to_5":4,"materiality":"High","evidence":"Sales, tax, receivables","source_id":"S01,S02","source_type":"audited filings","source_date":"2026-03-19","as_of_date":"2026-01-31","analyst_interpretation":"Tax timing needs explanation.","red_flag_triggered":false,"red_flag_id":"","follow_up_required":"Reconcile cash tax."},
{"finding_id":"A8-16","ticker":"BURL","date":"2026-09-29","agent":"accounting-forensics","section":"9","question":"Segment disclosure shifts","standardized_verdict":"Green","raw_value":1,"unit":"segment","current_period":"FY2025","prior_period":"FY2024 1","trend":"stable","peer_benchmark":"No peer set","peer_verdict":"Not assessed","score":0,"max_score":10,"penalty":0,"confidence_1_to_5":4,"materiality":"Medium","evidence":"Segment note","source_id":"S01","source_type":"audited filing","source_date":"2026-03-19","as_of_date":"2026-01-31","analyst_interpretation":"No masking redefinition.","red_flag_triggered":false,"red_flag_id":"","follow_up_required":""},
{"finding_id":"A8-17","ticker":"BURL","date":"2026-09-29","agent":"accounting-forensics","section":"3","question":"Dechow F-score","standardized_verdict":"Amber","raw_value":0.8819,"unit":"F-score","current_period":"FY2025","prior_period":"FY2024 inputs","trend":"soft assets 55.67%","peer_benchmark":"No peer set","peer_verdict":"Not assessed","score":2,"max_score":25,"penalty":0,"confidence_1_to_5":5,"materiality":"High","evidence":"Python from audited inputs","source_id":"S01,S02","source_type":"audited filings","source_date":"2026-03-19","as_of_date":"2026-01-31","analyst_interpretation":"F Green; soft assets Amber.","red_flag_triggered":false,"red_flag_id":"","follow_up_required":"Repeat test."},
{"finding_id":"A8-18","ticker":"BURL","date":"2026-09-29","agent":"accounting-forensics","section":"3","question":"Issuance in flagged year","standardized_verdict":"Green","raw_value":500.0,"unit":"USDm debt","current_period":"FY2025","prior_period":"","trend":"F Green, TATA negative","peer_benchmark":"No peer set","peer_verdict":"Not assessed","score":0,"max_score":25,"penalty":0,"confidence_1_to_5":5,"materiality":"Medium","evidence":"Term-loan note","source_id":"S01","source_type":"audited filing","source_date":"2026-03-19","as_of_date":"2026-01-31","analyst_interpretation":"No trigger.","red_flag_triggered":false,"red_flag_id":"","follow_up_required":""},
{"finding_id":"A8-19","ticker":"BURL","date":"2026-09-29","agent":"accounting-forensics","section":"4","question":"Cash authenticity","standardized_verdict":"Not Applicable (no data)","raw_value":null,"unit":"","current_period":"FY2025","prior_period":"FY2024","trend":"interest split unavailable","peer_benchmark":"No peer set","peer_verdict":"Not assessed","score":6,"max_score":15,"penalty":0,"confidence_1_to_5":2,"materiality":"High","evidence":"Interest and audit disclosures","source_id":"S01,S05","source_type":"filing/rate database","source_date":"2026-03-19","as_of_date":"2026-01-31","analyst_interpretation":"Not independently authenticated.","red_flag_triggered":false,"red_flag_id":"","follow_up_required":"Obtain interest split and confirmation basis."},
{"finding_id":"A8-20","ticker":"BURL","date":"2026-09-29","agent":"accounting-forensics","section":"10","question":"Regulator-found divergence","standardized_verdict":"Amber","raw_value":0,"unit":"attributable results","current_period":"2026-09-29","prior_period":"","trend":"coverage limited","peer_benchmark":"No peer set","peer_verdict":"Not assessed","score":2,"max_score":10,"penalty":0,"confidence_1_to_5":2,"materiality":"High","evidence":"Logged official-domain searches","source_id":"S06","source_type":"regulator web search","source_date":"2026-09-29","as_of_date":"2026-09-29","analyst_interpretation":"No hit is not clean.","red_flag_triggered":false,"red_flag_id":"","follow_up_required":"Direct SEC/court review."},
{"finding_id":"A14-01","ticker":"BURL","date":"2026-09-29","agent":"accounting-forensics","section":"11","question":"Net debt/EBITDA","standardized_verdict":"Amber","raw_value":0.68,"unit":"x strict","current_period":"FY2025","prior_period":"FY2024 0.68x","trend":"stable above Green","peer_benchmark":"No peer set","peer_verdict":"Not assessed","score":4,"max_score":15,"penalty":0,"confidence_1_to_5":4,"materiality":"High","evidence":"Debt, cash, EBITDA","source_id":"S01,S03","source_type":"filing/cross-module","source_date":"2026-03-19","as_of_date":"2026-01-31","analyst_interpretation":"Below Red, above Green.","red_flag_triggered":false,"red_flag_id":"","follow_up_required":"Confirm debt use."},
{"finding_id":"A14-02","ticker":"BURL","date":"2026-09-29","agent":"accounting-forensics","section":"11","question":"Loans and advances/assets","standardized_verdict":"Not Applicable (no data)","raw_value":null,"unit":"","current_period":"FY2025","prior_period":"FY2024","trend":"no standalone line","peer_benchmark":"No peer set","peer_verdict":"Not assessed","score":0,"max_score":15,"penalty":0,"confidence_1_to_5":2,"materiality":"Medium","evidence":"Balance sheet","source_id":"S01","source_type":"audited filing","source_date":"2026-03-19","as_of_date":"2026-01-31","analyst_interpretation":"Prepaids are not loans.","red_flag_triggered":false,"red_flag_id":"","follow_up_required":"Obtain note or nil confirmation."}
]
~~~

### forensics_battery.json

~~~json
{"computable":true,"sector_excluded":false,"m_score":-2.6207,"m_components":{"DSRI":1.0989,"GMI":0.9866,"AQI":0.9338,"SGI":1.0879,"DEPI":1.0965,"SGAI":0.9893,"LVGI":0.9882,"TATA":-0.0626},"components_in_zone":1,"f_score":0.8819,"rsst_pct_avg_assets":2.1289,"soft_assets_pct":55.6738,"d_rec_pct":0.1842,"d_inv_pct":0.6541,"issuance_flagged_year":false,"implied_cash_yield_pct":null,"risk_free_rate_pct":3.91,"risk_free_source":"FRED RIFLGFCY01NA, annual 2025 US one-year constant-maturity Treasury yield; reference only because interest line is not scope-matched","red_flag_ids":[]}
~~~

## Hard Self-Check

- [x] All 22 owned items appear in the Universal Findings Table; unavailable tests are explicit.
- [x] Beneish and Dechow were computed with Bash/Python from annual filings; no web score substituted.
- [x] The single Beneish zone component is Amber, not Red.
- [x] The financials-sector exclusion was checked and does not apply.
- [x] The period risk-free reference was sourced; the yield test is honestly not computable.
- [x] earnings/06 was consumed; the missing balance-sheet-survival input is stated.
- [x] Every net-debt number is labelled strict.
- [x] Every Amber row has a follow-up; no red flag or score-cap floor applies.
- [x] A8-20 lookup coverage is logged and labelled coverage-limited.
- [x] Technical terms are defined in place and conclusions trace to a band or data gap.
