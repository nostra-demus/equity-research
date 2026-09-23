# Accounting Forensics — V

All amounts are USD millions unless stated. Visa Inc. is a U.S. GAAP payment-network company with a September fiscal year-end, not a bank, NBFC, or insurer. The balance-sheet comparison is FY25 versus FY24; the income statement and cash-flow statement also contain FY23. `earnings/06` and `balance-sheet-survival/01` were present and have been consumed.

## 0. Sector Gate & Inputs

| Item | Detail | Source |
|---|---|---|
| Sector (from triage 00) | Payments / Payment Services; U.S. GAAP, USD, September year-end | [business-model/00_data-triage, §2A; Visa FY25 Form 10-K, cover and Note 1] |
| Financials overlay applied? (bank/NBFC/insurer → battery invalid) | No — Visa operates one Payment Services segment, not a lender or insurer. | [Visa FY25 Form 10-K, Note 21 — Segment Information] |
| Years of audited annual history in pool | FY23–FY25 operations and CFO; FY24–FY25 audited balance sheets. | [Visa FY25 Form 10-K, pp.59–65] |
| earnings/06 baseline present? | Yes — consumed; its FY23–FY25 CFO/GAAP-derived EBITDA read is 94.6%, 81.0%, and 91.5%. | [earnings/06_earnings-quality, §1] |
| balance-sheet-survival/01 debt stack present? | Yes — consumed; FY25 net debt is $8,007 strict basis and net-debt/GAAP-derived EBITDA is 0.32x. | [balance-sheet-survival/01_capital-structure-and-leverage, §§6–7] |
| Battery computable? (needs 2 consecutive annual filings) | Beneish: yes, from audited FY24/FY25 comparative columns. Dechow composite: no — the pool has no FY23 balance-sheet date, required for prior-year cash-sales and ROA changes. | [Visa FY25 Form 10-K, pp.59–65] |

## 1. Battery Inputs (two consecutive audited annual filings — every number cited, verbatim per §5)

| Input line item | FY24 | FY25 | Evidence |
|---|---:|---:|---|
| Revenue | $35,926 | $40,000 | [Visa FY25 Form 10-K, Consolidated Statements of Operations, p.60] |
| Trade receivables | $2,561 | $3,126 | [Visa FY25 Form 10-K, Consolidated Balance Sheets, p.59] |
| Cost of goods sold / gross margin | $778 network-and-processing expense proxy / 97.83% | $894 network-and-processing expense proxy / 97.77% | Visa does not report COGS or gross profit; the audited network-and-processing line is used solely as the consistently named direct-cost proxy: `(revenue − network and processing) / revenue`. [Visa FY25 Form 10-K, p.60] |
| Current assets | $34,033 | $37,766 | [Visa FY25 Form 10-K, p.59] |
| Net PP&E | $3,824 | $4,236 | [Visa FY25 Form 10-K, p.59] |
| Securities / non-current investments | $5,745 ($3,200 current + $2,545 non-current) | $2,832 ($1,833 current + $999 non-current) | [Visa FY25 Form 10-K, p.59] |
| Total assets | $94,511 | $99,627 | [Visa FY25 Form 10-K, p.59] |
| Depreciation & amortization | $1,034 | $1,220 | [Visa FY25 Form 10-K, pp.60, 65] |
| SG&A | $10,057 | $11,330 | Build: personnel + marketing + professional fees + G&A; excludes network/processing, D&A, and litigation. [Visa FY25 Form 10-K, p.60] |
| Long-term debt | $20,836 | $19,602 | [Visa FY25 Form 10-K, p.59] |
| Current liabilities | $26,517 | $35,048 | [Visa FY25 Form 10-K, p.59] |
| CFO (cash from operations) | $19,950 | $23,059 | [Visa FY25 Form 10-K, Consolidated Statements of Cash Flows, p.65] |
| Net income from continuing operations | $19,743 | $20,058 | Visa reports consolidated net income and no discontinued operations; this is therefore the continuing-operations input. [Visa FY25 Form 10-K, p.60] |
| Inventory | Not separately reported | Not separately reported | Visa's primary statements contain no inventory balance or matched COGS line. [Visa FY25 Form 10-K, pp.59–60] |
| Cash & bank deposits | $11,975 cash and equivalents | $17,164 cash and equivalents | [Visa FY25 Form 10-K, p.59] |
| Interest income | Not separately disclosed; mixed investment-income line is $962 | Not separately disclosed; mixed investment-income line is $789 | Interest is included in “investment income (expense) and other”; it cannot be scope-matched to cash/deposits. [Visa FY25 Form 10-K, p.60; Note 1] |
| Cash taxes paid | Not separately disclosed in the admitted primary cash-flow statement | Not separately disclosed in the admitted primary cash-flow statement | Do not substitute tax provision for cash tax. [Visa FY25 Form 10-K, pp.60, 65] |
| Securities issued during FY25 (equity/debt/convertible/QIP) | — | $3,924 senior-note proceeds; $396 stock issued under equity plans | [Visa FY25 Form 10-K, p.65] |

## 2. Beneish M-Score (A8-14) — computation shown

The M-score is a screening model for patterns common in manipulated accounts; it is not proof of fraud. The calculation was executed from the audited inputs above in the shell. The environment's `python3` launcher was unavailable, so the identical stated formula was evaluated with the available local calculator; no web M-score was used.

| Component | Value FY25 | Non-manipulator mean | Manipulator zone | Verdict |
|---|---:|---:|---|---|
| DSRI (receivables outrunning sales) | 1.096 | 1.031 | ≥1.465 | Green |
| GMI (gross margin deteriorating) | 1.001 | 1.014 | ≥1.193 | Green |
| AQI (asset quality softening) | 1.021 | 1.039 | ≥1.254 | Green |
| SGI (sales growth pressure) | 1.113 | 1.134 | ≥1.607 | Green |
| DEPI (depreciation rate slowing) | 0.952 | 1.001 | ≥1.077 | Green |
| SGAI (overhead vs sales) | 1.012 | 1.054 | not banded (negative weight in M) | Neutral |
| LVGI (leverage rising) | 1.095 | 1.037 | ≥1.111 | Green |
| TATA (accruals vs assets) | (3.012%) | 0.018 | ≥3.1% | Green |

Calculation: `DSRI=(3,126/40,000)/(2,561/35,926)=1.096`; `GMI=(1−778/35,926)/(1−894/40,000)=1.001`; `AQI=[1−(37,766+4,236+2,832)/99,627]/[1−(34,033+3,824+5,745)/94,511]=1.021`; `SGI=40,000/35,926=1.113`; `DEPI=[1,034/(1,034+3,824)]/[1,220/(1,220+4,236)]=0.952`; `SGAI=(11,330/40,000)/(10,057/35,926)=1.012`; `LVGI=[(19,602+35,048)/99,627]/[(20,836+26,517)/94,511]=1.095`; `TATA=(20,058−23,059)/99,627=−3.012%`. [Visa FY25 Form 10-K, pp.59–65]

Composite: `M = −4.84 + 0.920·1.096 + 0.528·1.001 + 0.404·1.021 + 0.892·1.113 + 0.115·0.952 − 0.172·1.012 − 0.327·1.095 + 4.679·(−0.03012) = −2.461`.

| Composite / rule | Value | Green band | Amber band | Red band | Verdict |
|---|---:|---|---|---|---|
| M-score | -2.461 | < -2.22, no component in zone | -2.22 to -1.78 | > -1.78 | Green |
| Components in manipulator zone | 0 of 7 banded | 0 | 1–2 | ≥3 | Green |

## 3. Dechow F-Score & Accrual Battery (A8-17, A8-18)

The F-score is a model scaled so 1.00 is the average-company misstatement risk. It cannot be calculated honestly: the FY25 10-K provides FY25/FY24 balance sheets but no FY23 balance sheet, so both `ΔCASH_SALES` and `ΔROA` lack their required t−2 inputs. No opening balance was approximated.

| Test | Value | Green band | Red band | Verdict | Evidence |
|---|---:|---|---|---|---|
| Dechow F-score (1.00 = average company) | Not computable (t−2 balance sheet unavailable) | <1.00 | ≥1.85 | Insufficient Data | [Visa FY25 Form 10-K, pp.59–65] |
| RSST accruals / average assets | Not computed — balance-sheet classification inputs and full F model unavailable | ≤3% | ≥10% | Insufficient Data | [Visa FY25 Form 10-K, p.59] |
| Soft assets % of total assets | 57.84% = `(99,627−4,236−37,766)/99,627` | <50% | >65% and rising | Amber | [Visa FY25 Form 10-K, p.59] |
| Δ receivables / average assets | 0.58% = `(3,126−2,561)/97,069` | <2% | ≥5% | Green | [Visa FY25 Form 10-K, p.59] |
| Δ inventory / average assets | Not computable — inventory not separately reported | <2% | ≥5% | Insufficient Data | [Visa FY25 Form 10-K, pp.59–60] |
| A8-18 — issuance in a flagged year | $3,924 debt plus $396 equity-plan proceeds; neither M nor TATA was flagged (`M=-2.461`, `TATA=-3.012%`) | none while flagged | issued while F ≥1.85 or TATA ≥3.1% | Green | [Visa FY25 Form 10-K, p.65; Section 2] |

## 4. Cash Authenticity (A8-19)

| Test | Value | Band | Verdict | Evidence |
|---|---:|---|---|---|
| Interest income ÷ average cash & deposits (implied yield) | Not computable — the reported $789m FY25 investment-income-and-other line is mixed; it includes more than cash/deposit interest. | Scope-matched numerator required | Insufficient Data | [Visa FY25 Form 10-K, p.60; Note 1] |
| Period risk-free rate (instrument, source, date) | 4.08% FY25 average of monthly 1-year U.S. Treasury constant-maturity yields, Oct-2024 through Sep-2025 | Comparator only; not used without yield numerator | N/A to verdict | [Web: Federal Reserve H.15 / FRED GS1, monthly observations, accessed 2026-09-23 (unverified)] |
| Gap | Not computable | Green within ~150bp; Red yield <50% of risk-free on material cash | Insufficient Data | Same as above |
| Cash held in company's own name at major banks? | Not proven from available data. The filing separately reports $17,164m cash and equivalents and $2,990m restricted U.S. litigation escrow; it does not provide named-bank custody evidence. | Red: held in trust / third-party custody | Insufficient Data | [Visa FY25 Form 10-K, p.59; Note 1] |
| Auditor obtained independent bank confirmations? | Not proven from the audit report. The report describes audit and ICFR procedures but does not state a bank-confirmation procedure. | Red: confirmations not independently obtained | Insufficient Data | [Visa FY25 Form 10-K, Auditor’s Report, pp.56–58] |

## 5. Revenue Quality (A8-15)

| Cross-check | FY24 | FY25 | Band | Verdict | Evidence |
|---|---:|---:|---|---|---|
| Revenue growth vs cash-taxes-paid growth | Cash taxes not separately disclosed | Revenue +11.3%; cash taxes not separately disclosed | Red only if revenue grows while taxes and collections are flat | Insufficient Data | [Visa FY25 Form 10-K, pp.60, 65] |
| Collections proxy (revenue − Δreceivables) vs revenue | t−2 receivables unavailable | $39,435, or 98.6% of revenue = $40,000 − ($3,126−$2,561) | Red if collections flat while revenue grows | Green for FY25; trend not assessable | [Visa FY25 Form 10-K, pp.59–60] |
| Unbilled revenue + contract assets, % of revenue | Not separately disclosed | Not separately disclosed | Green <10%; Red >25% | Insufficient Data | [Visa FY25 Form 10-K, pp.59–60; Note 1] |
| Order book: contractually binding or MOU-paper? | Not applicable to the transaction-network revenue model; no order-book measure is presented. | Same | Red: non-binding MOUs presented as demand | Not Applicable | [Visa FY25 Form 10-K, Note 1 — Revenue Recognition] |

## 6. Accrual & Conversion Baseline (A8-01, A8-11, A8-12) — figures from earnings/06 where present

| Test | Raw value | Green band | Red band | Trend (3–5y) | Verdict | Evidence |
|---|---:|---|---|---|---|---|
| A8-01 — CFO/PAT | FY23 1.20x; FY24 1.01x; FY25 1.15x | ≥0.8 sustained | <0.6 | Stable above 1.0x | Green | [earnings/06_earnings-quality, §§1–2; Visa FY25 Form 10-K, pp.60, 65] |
| A8-11 — cash EPS / accounting EPS | FY25 1.15x CFO/PAT proxy on the same diluted-share basis | ≈1 | <0.7 | FY23–FY25: 1.20x, 1.01x, 1.15x | Green | [earnings/06_earnings-quality, §1; Visa FY25 Form 10-K, pp.60, 65] |
| A8-12 — CFO/EBITDA | FY23 94.6%; FY24 81.0%; FY25 91.5% | ≥0.7 | <0.5 sustained | Volatile, but no sub-70% year | Green | [earnings/06_earnings-quality, §1] |

## 7. Balance-Sheet Hygiene (A8-02, A8-03, A8-04, A8-06)

| Test | Raw value | Green band | Red band | Trend | Verdict | Evidence |
|---|---:|---|---|---|---|---|
| A8-02 — working-capital days | Accounts-receivable days 26.0 to 28.5 (+2.5 days; +9.6%) | stable or negative | rising >20% without disclosed model change | Deteriorating, below Red threshold | Amber | [earnings/06_earnings-quality, §3; Visa FY25 Form 10-K, pp.59–60] |
| A8-03 — receivables aged >6 months | No ageing ladder or past-due concentration disclosed in admitted filing | minimal, stable, dispersed | sharply rising or related-party concentrated | Not assessable | Insufficient Data | [Visa FY25 Form 10-K, pp.59–60; Note 1] |
| A8-04 — expense capitalization | Net property, equipment and technology/revenue: 10.6% in both FY24 and FY25; client-incentive assets/revenue: 18.2% and 18.3% | conservative, disclosed, stable rate | rising capitalization | Stable | Green | [earnings/06_earnings-quality, §6; Visa FY25 Form 10-K, p.59] |
| A8-06 — goodwill vs net worth; impairment history | $19,879 / $37,909 = 52.4%; goodwill rose $938m, alongside $946m Featurespace consideration; no impairment disclosed | modest and tested | goodwill > net worth or serial impairments | Higher, but below net worth | Green | [Visa FY25 Form 10-K, p.59; Note 2 — Acquisitions] |

## 8. P&L Quality (A8-05, A8-08, A8-09, A8-10)

| Test | Raw value | Green band | Red band | Trend | Verdict | Evidence |
|---|---:|---|---|---|---|---|
| A8-05 — exceptionals frequency; other income % of PBT | Other income $789 / $24,194 PBT = 3.3%; litigation provision was $927m, $462m, then $2,562m in FY23–FY25 and is excluded from Visa’s adjusted series | rare; <10% of PBT or clearly treasury | “one-offs” yearly or other income >⅓ PBT | Provision recurs and rose sharply | Amber | [Visa FY25 Form 10-K, pp.42–44, 60] |
| A8-08 — depreciation charge vs asset base | D&A $1,034 to $1,220 (+18.0%); net PP&E $3,824 to $4,236 (+10.8%) | charge tracks base | unexplained large drop | No drop | Green | [Visa FY25 Form 10-K, pp.59–60, 65] |
| A8-09 — provisioning adequacy | FY25 litigation provision $2,562m; year-end accrued litigation $3,033m | coverage stable | releases funding earnings | Increased charge, not a release; estimation risk remains | Amber | [Visa FY25 Form 10-K, p.59; Note 20 — Legal Matters] |
| A8-10 — effective tax rate vs statutory | 17.10% FY25 = $4,136/$24,194; Singapore incentive cut tax by $453m, versus $419m FY24 and $468m FY23 | near statutory or fully explained | persistently far below, unexplained | Stable and explained | Green | [Visa FY25 Form 10-K, p.60; Note 19 — Income Taxes] |

## 9. Policy, Estimate & Perimeter Stability (A8-07, A8-13, A8-16)

| Test | Finding | Green band | Red band | Verdict | Evidence |
|---|---|---|---|---|---|
| A8-07 — policy / estimate / year-end changes | No profit-boosting policy or fiscal-year-end change identified. FY25 adoption of ASU 2023-07 added segment disclosures; the internal-use-software ASU is not effective until FY29. | stable | profit-boosting changes or FY-end change | Green | [Visa FY25 Form 10-K, Note 1 — Accounting Pronouncements] |
| A8-13 — consolidation perimeter | Featurespace was acquired in FY25 for $946m. No evidence in the filing of frequent entity churn or weak-unit deconsolidation. | stable, changes explained | churn / engineered deconsolidation | Green | [Visa FY25 Form 10-K, Note 2 — Acquisitions] |
| A8-16 — segment / geography disclosure shifts | One Payment Services segment remains; ASU 2023-07 increased disclosure rather than merging a deteriorating segment. | stable or visibility-improving | merger/redefinition masking deterioration | Green | [Visa FY25 Form 10-K, Note 21 — Segment Information; Note 1] |

## 10. Regulator-Found Divergence (A8-20) — swept per frameworks/GOVERNANCE_DATABASES.md

| Check | Finding | Red band | Verdict | Evidence |
|---|---|---|---|---|
| Regulator inspection divergence vs reported numbers | No issuer-attributed accounting-enforcement or restatement result was returned by the limited SEC AAER/EDGAR web searches logged below. This is not a complete enforcement clearance. | any material local-regulator divergence | Insufficient Data — coverage-limited | [Web: SEC AAER index and issuer-attributed searches, 2026-09-23 (unverified)] |
| Lender- or regulator-directed forensic audit | No issuer-attributed result returned by the same limited searches; not a complete U.S. federal/state enforcement sweep. | any (RF-ACC-005) | Insufficient Data — coverage-limited | [Web: SEC AAER index and issuer-attributed searches, 2026-09-23 (unverified)] |

## 11. Leverage & Advances Hygiene (A14-01, A14-02) — debt stack from balance-sheet-survival/01 where present

| Test | Raw value (basis labeled per §15) | Green band | Red band | Trend | Verdict | Evidence |
|---|---:|---|---|---|---|---|
| A14-01 — net debt / EBITDA (governance lens) | $8,007 strict net debt / $25,214 GAAP-derived EBITDA = 0.32x | net cash or <0.5x | >3x or promoter objectives | FY24 0.36x → FY25 0.32x | Green | [balance-sheet-survival/01_capital-structure-and-leverage, §§6–7; Visa FY25 Form 10-K, pp.59–60, 65] |
| A14-02 — loans & advances % of total assets | Not separately disclosed; balance sheet has $2,679m prepaid/other current assets and $3,944m other assets, which cannot be recast as loans/advances. | <2%, ordinary-course | >5%, rising, or non-repayment | Not assessable | Insufficient Data | [Visa FY25 Form 10-K, p.59] |

## 12. Forensics Read

The computed Beneish M-score is **-2.461**, Green, with zero components in the manipulator zone; FY25 cash also exceeded reported profit (`CFO/PAT 1.15x`) and EBITDA conversion was 91.5%. The most relevant watch item is ordinary receivables: they rose 22.1% while revenue rose 11.3%, taking DSO from 26.0 to 28.5 days — an Amber collections signal, not evidence of paper revenue because the FY25 collections proxy still equalled 98.6% of revenue. The Dechow F-score and cash-yield confirmation tests are not computable from the admitted inputs, so a rational minority holder should treat the books as low measured manipulation risk, not as fully cleared.

## Sweep Log

| Database | Query | Date | Results | Attributed? (identifier used) | Coverage note |
|---|---|---|---:|---|---|
| SEC Accounting and Auditing Enforcement Releases / web | `Visa Inc. accounting enforcement AAER restatement forensic audit` | 2026-09-23 | 0 issuer-attributed hits | Yes — Visa Inc., CIK 0001403161 | Search results included unrelated issuers; this is a search-index check, not a complete historical enforcement database export. |
| SEC enforcement / EDGAR web | `Visa Inc. Accounting and Auditing Enforcement Release`; `Visa Inc. forensic audit OR restatement` | 2026-09-23 | 0 issuer-attributed hits | Yes — Visa Inc., CIK 0001403161 | Limited issuer-attributed web search; state/federal court and all historic SEC records were not exhaustively queried. |
| Federal Reserve H.15 / FRED GS1 | 1-year Treasury constant-maturity monthly yields, Oct-2024 to Sep-2025 | 2026-09-23 | 12 observations; 4.08% arithmetic mean | Not applicable | Used only as the FY25 cash-yield comparator; the company-side interest numerator is mixed and yield is not computed. |

## Universal Findings Table

| Finding ID | Section | Question / Test | Standardized Verdict | Raw Value | Unit | Current Period | Prior Period | Trend | Peer Benchmark | Peer Verdict | Score | Max Score | Penalty | Confidence 1–5 | Materiality | Evidence | As-of Date | Analyst Interpretation | Red Flag Triggered? | Red Flag ID | Follow-up Required |
|---|---|---|---|---:|---|---|---|---|---|---|---:|---:|---:|---:|---|---|---|---|---|---|---|
| 11-001 | 6 | A8-01 — CFO/PAT | Green | 1.15 | x | FY25 | 1.01x FY24 | Improving | No peer set | Not assessed | 0 | 5 | 0 | 5 | High | [earnings/06, §1] | 2026-09-23 | Cash confirms reported profit over three years. | No | — | — |
| 11-002 | 7 | A8-02 — working-capital days creep | Amber | 28.5 | days | FY25 | 26.0 FY24 | Deteriorating | No peer set | Not assessed | 3 | 4 | 0 | 5 | Medium | [earnings/06, §3] | 2026-09-23 | DSO rose 9.6%, below the >20% Red band. | No | — | Test FY26 DSO and ageing against FY25. |
| 11-003 | 7 | A8-03 — receivables aged >6 months | Insufficient Data | N/A | ageing data | FY25 | FY24 | Not assessable | No peer set | Not assessed | 0 | 3 | 0 | 4 | Medium | [Visa FY25 Form 10-K, pp.59–60] | 2026-09-23 | No ageing ladder or concentration disclosure was located. | No | — | Obtain ageing / allowance detail. |
| 11-004 | 7 | A8-04 — expense capitalization | Green | 10.6 | % of revenue, net PP&E | FY25 | 10.6% FY24 | Stable | No peer set | Not assessed | 0 | 3 | 0 | 5 | Medium | [earnings/06, §6] | 2026-09-23 | Capitalized PP&E and client-incentive asset ratios were stable. | No | — | — |
| 11-005 | 8 | A8-05 — recurring exceptionals & other income | Amber | 3.3 | % other income / PBT | FY25 | litigation provision $462m FY24 | Deteriorating | No peer set | Not assessed | 2 | 3 | 0 | 5 | Medium | [Visa FY25 Form 10-K, pp.42–44, 60] | 2026-09-23 | Other income is modest, but litigation exclusions recur and FY25 provision was $2,562m. | No | — | Reconcile future adjusted earnings to litigation accrual and cash payments. |
| 11-006 | 7 | A8-06 — goodwill build-up & impairment | Green | 52.4 | % of net worth | FY25 | 48.4% FY24 | Rising | No peer set | Not assessed | 1 | 3 | 0 | 5 | Medium | [Visa FY25 Form 10-K, p.59; Note 2] | 2026-09-23 | Below the >100% Red band; increase aligns with a disclosed acquisition. | No | — | Monitor acquisition integration and impairment tests. |
| 11-007 | 9 | A8-07 — policy / estimate / year-end changes | Green | 0 | identified profit-boosting changes | FY25 | FY24 | Stable | No peer set | Not assessed | 0 | 3 | 0 | 4 | Medium | [Visa FY25 Form 10-K, Note 1] | 2026-09-23 | Disclosure-enhancement adoption was not a profit-recognition change. | No | — | — |
| 11-008 | 8 | A8-08 — depreciation rate consistency | Green | 18.0 | % D&A growth | FY25 | FY24 | Rising with assets | No peer set | Not assessed | 0 | 2 | 0 | 5 | Low | [Visa FY25 Form 10-K, pp.59–60,65] | 2026-09-23 | No unexplained D&A reduction. | No | — | — |
| 11-009 | 8 | A8-09 — provisioning adequacy | Amber | 3,033 | accrued litigation | FY25 | 1,727 FY24 | Rising | No peer set | Not assessed | 1 | 3 | 0 | 4 | High | [Visa FY25 Form 10-K, p.59; Note 20] | 2026-09-23 | A larger charge rather than reserve release; litigation estimate remains material. | No | — | Compare provision, payments, and revised estimates in FY26. |
| 11-010 | 8 | A8-10 — effective tax rate | Green | 17.10 | % | FY25 | 17.45% FY24 | Stable | No peer set | Not assessed | 0 | 3 | 0 | 5 | Medium | [Visa FY25 Form 10-K, p.60; Note 19] | 2026-09-23 | Rate is explained by disclosed Singapore incentive, not an unexplained low tax charge. | No | — | — |
| 11-011 | 6 | A8-11 — cash EPS / accounting EPS | Green | 1.15 | x proxy | FY25 | 1.01x FY24 | Improving | No peer set | Not assessed | 0 | 2 | 0 | 5 | High | [earnings/06, §1] | 2026-09-23 | CFO/PAT proxy on same diluted-share basis clears the 0.7x Red band. | No | — | — |
| 11-012 | 6 | A8-12 — CFO/EBITDA | Green | 91.5 | % | FY25 | 81.0% FY24 | Improving | No peer set | Not assessed | 0 | 3 | 0 | 5 | High | [earnings/06, §1] | 2026-09-23 | All three years exceed the 70% reference. | No | — | — |
| 11-013 | 9 | A8-13 — consolidation perimeter | Green | 1 | disclosed FY25 acquisition | FY25 | FY24 | Explained | No peer set | Not assessed | 0 | 3 | 0 | 4 | Medium | [Visa FY25 Form 10-K, Note 2] | 2026-09-23 | No evidence of frequent churn or deconsolidation. | No | — | — |
| 11-014 | 2 | A8-14 — Beneish M-score | Green | -2.461 | score | FY25 | FY24 inputs | Stable | Published Green band | In line | 0 | 5 | 0 | 5 | High | [Visa FY25 Form 10-K, pp.59–65] | 2026-09-23 | Zero component zones and Green composite. | No | — | — |
| 11-015 | 5 | A8-15 — revenue-quality cross-checks | Amber | 98.6 | % FY25 collections proxy / revenue | FY25 | t−1 trend unavailable | Mixed | No peer set | Not assessed | 3 | 15 | 0 | 4 | High | [Visa FY25 Form 10-K, pp.59–60] | 2026-09-23 | FY25 collection proxy is supportive; cash-tax and contract-asset tests are unavailable. | No | — | Obtain cash-tax and contract-asset detail. |
| 11-016 | 9 | A8-16 — segment / geography disclosure shifts | Green | 1 | reportable segment | FY25 | FY24 | Stable / fuller disclosure | No peer set | Not assessed | 0 | 3 | 0 | 4 | Medium | [Visa FY25 Form 10-K, Notes 1 and 21] | 2026-09-23 | One segment remains and ASU 2023-07 added disclosure. | No | — | — |
| 11-017 | 3 | A8-17 — Dechow F-score & accrual battery | Insufficient Data | N/A | F-score | FY25 | FY24 | Not computable | Published model | Not assessed | 2 | 5 | 0 | 5 | High | [Visa FY25 Form 10-K, pp.59–65] | 2026-09-23 | No FY23 balance sheet for Δcash sales and ΔROA; no composite approximated. | No | — | Obtain FY24 10-K / FY23 balance sheet. |
| 11-018 | 3 | A8-18 — issuance in a flagged year | Green | 4,320 | $m securities proceeds | FY25 | N/A | Issued, but unflagged | No peer set | Not assessed | 0 | 2 | 0 | 5 | Medium | [Visa FY25 Form 10-K, p.65; Section 2] | 2026-09-23 | Senior notes and equity-plan proceeds occurred with Green M and negative TATA. | No | — | — |
| 11-019 | 4 | A8-19 — cash authenticity | Insufficient Data | N/A | implied yield | FY25 | FY24 | Not computable | 4.08% FY25 UST rate | Not assessed | 3 | 15 | 0 | 4 | High | [Visa FY25 Form 10-K, p.60; Note 1; Auditor’s Report] | 2026-09-23 | Interest numerator is mixed and bank-confirmation basis not disclosed. | No | — | Obtain bank/deposit interest and confirmation evidence. |
| 11-020 | 10 | A8-20 — regulator-found divergence | Insufficient Data | 0 | issuer-attributed web hits | Through 2026-09-23 | N/A | Coverage-limited | SEC AAER / EDGAR search | Not assessed | 0 | 2 | 0 | 2 | High | [Web: SEC searches, 2026-09-23 (unverified)] | 2026-09-23 | Limited searches returned no issuer-attributed hit; this is not clearance. | No | — | Run a complete regulator/court enforcement sweep. |
| 11-021 | 11 | A14-01 — net debt / EBITDA governance lens | Green | 0.32 | x, strict basis | FY25 | 0.36x FY24 | Improving | <0.5x Green band | In line | 0 | 10 | 0 | 5 | High | [balance-sheet-survival/01, §§6–7] | 2026-09-23 | Low leverage; filing shows debt issuance alongside buybacks, not promoter objectives. | No | — | — |
| 11-022 | 11 | A14-02 — loans & advances % total assets | Insufficient Data | N/A | loans / advances | FY25 | FY24 | Not assessable | <2% Green band | Not assessed | 0 | 5 | 0 | 4 | Medium | [Visa FY25 Form 10-K, p.59] | 2026-09-23 | Other-assets lines cannot be relabelled as loans or advances. | No | — | Obtain note-level loans/advances detail. |

## Accounting-Forensics Risk Score (INVERTED — higher = WORSE)

| Component | Score | Max Score | Evidence |
|---|---:|---:|---|
| Accrual battery — Beneish + Dechow (A8-01, A8-11, A8-12, A8-14, A8-17, A8-18) | 2 | 25 | Green M-score and conversion; Dechow F unavailable because t−2 balance sheet is absent. |
| Cash authenticity (A8-19) | 3 | 15 | Yield numerator and confirmation procedure not disclosed; no cash-authenticity failure established. |
| Revenue quality (A8-15) | 3 | 15 | FY25 collections proxy is 98.6% of revenue, but cash-tax and contract-asset tests are unavailable. |
| Balance-sheet hygiene — WC creep, receivables ageing, capitalization, goodwill, consolidation (A8-02, A8-03, A8-04, A8-06, A8-13) | 4 | 20 | DSO rose 9.6%; ageing unavailable; capitalization stable and goodwill below net worth. |
| P&L quality & policy stability (A8-05, A8-07, A8-08, A8-09, A8-10, A8-16, A8-20) | 3 | 10 | Recurring litigation adjustment and estimate sensitivity; policies/tax/segment signals clear; regulator sweep limited. |
| Leverage & advances hygiene (A14-01, A14-02) | 0 | 15 | 0.32x strict net debt/EBITDA; loans-and-advances data unavailable rather than presumed clean. |
| Total | 15 | 100 | Low measured manipulation risk, capped in confidence by F-score, cash-authenticity, loans/advances, and regulator-sweep gaps. |

No battery-red or cash-authenticity-red score floor applies. The score is not a full clearance: unavailable tests remain unavailable.

## Source Log

| Source ID | Source Type | Filename / Filing | Period | Page / Section | Date | Confidence 1–5 | Used For |
|---|---|---|---|---|---|---:|---|
| S01 | Audited annual filing | `data/V/Visa_Inc_-_Form_10-K(Nov-06-2025).doc` | FY23–FY25 | pp.59–65; Notes 1, 2, 19–21; Auditor’s Report pp.56–58 | 2025-11-06 | 5 | Battery inputs, M-score, revenue, balance-sheet, tax, policy, issuance, cash-authenticity read |
| S02 | Cross-module filing-based analysis | `analyses/V_2026-09-23/earnings/06_earnings-quality.md` | FY23–FY25 | §§1–3, 6 | 2026-09-23 | 4 | CFO/PAT, cash EPS proxy, CFO/EBITDA, DSO and capitalization baseline |
| S03 | Cross-module debt-stack analysis | `analyses/V_2026-09-23/balance-sheet-survival/01_capital-structure-and-leverage.md` | FY24–FY25 | §§6–7 | 2026-09-23 | 4 | Strict net debt and leverage basis |
| S04 | Cross-module data triage | `analyses/V_2026-09-23/business-model/00_data-triage.md` | Current run | §2A | 2026-09-23 | 4 | Jurisdiction, reporting standard, sector context |
| S05 | Official rate source accessed on web | Federal Reserve H.15 / FRED GS1 | Oct-2024–Sep-2025 | 1-year Treasury constant-maturity monthly table | 2026-09-23 | 2 | FY25 risk-free comparator; web-labelled unverified per source policy |
| S06 | Official regulator site accessed on web | SEC AAER index and EDGAR issuer searches | Through 2026-09-23 | Queries in Sweep Log | 2026-09-23 | 2 | Limited A8-20 regulator-divergence and forensic-audit sweep |

## Machine-Readable Findings

```json
[
  {"finding_id":"11-001","ticker":"V","date":"2026-09-23","agent":"accounting-forensics","section":"Accrual & Conversion","question":"A8-01 — CFO/PAT","standardized_verdict":"Green","raw_value":1.15,"unit":"x","current_period":"FY25","prior_period":"1.01x FY24","trend":"Improving","peer_benchmark":"No peer set","peer_verdict":"Not assessed","score":0,"max_score":5,"penalty":0,"confidence_1_to_5":5,"materiality":"High","evidence":"[earnings/06, §1]","source_id":"S02","source_type":"Cross-module filing-based analysis","source_date":"2026-09-23","as_of_date":"2026-09-23","analyst_interpretation":"Cash confirms profit.","red_flag_triggered":false,"red_flag_id":"","follow_up_required":""},
  {"finding_id":"11-002","ticker":"V","date":"2026-09-23","agent":"accounting-forensics","section":"Balance-sheet hygiene","question":"A8-02 — working-capital days creep","standardized_verdict":"Amber","raw_value":28.5,"unit":"days","current_period":"FY25","prior_period":"26.0 FY24","trend":"Deteriorating","peer_benchmark":"No peer set","peer_verdict":"Not assessed","score":3,"max_score":4,"penalty":0,"confidence_1_to_5":5,"materiality":"Medium","evidence":"[earnings/06, §3]","source_id":"S02","source_type":"Cross-module filing-based analysis","source_date":"2026-09-23","as_of_date":"2026-09-23","analyst_interpretation":"DSO rose 9.6%, below Red threshold.","red_flag_triggered":false,"red_flag_id":"","follow_up_required":"Test FY26 DSO and ageing."},
  {"finding_id":"11-003","ticker":"V","date":"2026-09-23","agent":"accounting-forensics","section":"Balance-sheet hygiene","question":"A8-03 — receivables aged >6 months","standardized_verdict":"Insufficient Data","raw_value":null,"unit":"ageing data","current_period":"FY25","prior_period":"FY24","trend":"Not assessable","peer_benchmark":"No peer set","peer_verdict":"Not assessed","score":0,"max_score":3,"penalty":0,"confidence_1_to_5":4,"materiality":"Medium","evidence":"[Visa FY25 Form 10-K, pp.59–60]","source_id":"S01","source_type":"Audited annual filing","source_date":"2025-11-06","as_of_date":"2026-09-23","analyst_interpretation":"No ageing ladder located.","red_flag_triggered":false,"red_flag_id":"","follow_up_required":"Obtain ageing detail."},
  {"finding_id":"11-004","ticker":"V","date":"2026-09-23","agent":"accounting-forensics","section":"Balance-sheet hygiene","question":"A8-04 — expense capitalization","standardized_verdict":"Green","raw_value":10.6,"unit":"% revenue, net PP&E","current_period":"FY25","prior_period":"10.6% FY24","trend":"Stable","peer_benchmark":"No peer set","peer_verdict":"Not assessed","score":0,"max_score":3,"penalty":0,"confidence_1_to_5":5,"materiality":"Medium","evidence":"[earnings/06, §6]","source_id":"S02","source_type":"Cross-module filing-based analysis","source_date":"2026-09-23","as_of_date":"2026-09-23","analyst_interpretation":"Capitalization ratio was stable.","red_flag_triggered":false,"red_flag_id":"","follow_up_required":""},
  {"finding_id":"11-005","ticker":"V","date":"2026-09-23","agent":"accounting-forensics","section":"P&L quality","question":"A8-05 — recurring exceptionals & other income","standardized_verdict":"Amber","raw_value":3.3,"unit":"% other income/PBT","current_period":"FY25","prior_period":"FY24 litigation provision $462m","trend":"Deteriorating","peer_benchmark":"No peer set","peer_verdict":"Not assessed","score":2,"max_score":3,"penalty":0,"confidence_1_to_5":5,"materiality":"Medium","evidence":"[Visa FY25 Form 10-K, pp.42–44,60]","source_id":"S01","source_type":"Audited annual filing","source_date":"2025-11-06","as_of_date":"2026-09-23","analyst_interpretation":"Litigation exclusions recur; other income is modest.","red_flag_triggered":false,"red_flag_id":"","follow_up_required":"Reconcile adjusted earnings to litigation cash."},
  {"finding_id":"11-006","ticker":"V","date":"2026-09-23","agent":"accounting-forensics","section":"Balance-sheet hygiene","question":"A8-06 — goodwill build-up & impairment","standardized_verdict":"Green","raw_value":52.4,"unit":"% net worth","current_period":"FY25","prior_period":"48.4% FY24","trend":"Rising","peer_benchmark":"No peer set","peer_verdict":"Not assessed","score":1,"max_score":3,"penalty":0,"confidence_1_to_5":5,"materiality":"Medium","evidence":"[Visa FY25 Form 10-K, p.59; Note 2]","source_id":"S01","source_type":"Audited annual filing","source_date":"2025-11-06","as_of_date":"2026-09-23","analyst_interpretation":"Below net worth and acquisition-explained.","red_flag_triggered":false,"red_flag_id":"","follow_up_required":"Monitor impairment."},
  {"finding_id":"11-007","ticker":"V","date":"2026-09-23","agent":"accounting-forensics","section":"Policy stability","question":"A8-07 — policy / estimate / year-end changes","standardized_verdict":"Green","raw_value":0,"unit":"identified profit-boosting changes","current_period":"FY25","prior_period":"FY24","trend":"Stable","peer_benchmark":"No peer set","peer_verdict":"Not assessed","score":0,"max_score":3,"penalty":0,"confidence_1_to_5":4,"materiality":"Medium","evidence":"[Visa FY25 Form 10-K, Note 1]","source_id":"S01","source_type":"Audited annual filing","source_date":"2025-11-06","as_of_date":"2026-09-23","analyst_interpretation":"No adverse policy change identified.","red_flag_triggered":false,"red_flag_id":"","follow_up_required":""},
  {"finding_id":"11-008","ticker":"V","date":"2026-09-23","agent":"accounting-forensics","section":"P&L quality","question":"A8-08 — depreciation rate consistency","standardized_verdict":"Green","raw_value":18.0,"unit":"% D&A growth","current_period":"FY25","prior_period":"FY24","trend":"Rising with assets","peer_benchmark":"No peer set","peer_verdict":"Not assessed","score":0,"max_score":2,"penalty":0,"confidence_1_to_5":5,"materiality":"Low","evidence":"[Visa FY25 Form 10-K, pp.59–60,65]","source_id":"S01","source_type":"Audited annual filing","source_date":"2025-11-06","as_of_date":"2026-09-23","analyst_interpretation":"No unexplained charge reduction.","red_flag_triggered":false,"red_flag_id":"","follow_up_required":""},
  {"finding_id":"11-009","ticker":"V","date":"2026-09-23","agent":"accounting-forensics","section":"P&L quality","question":"A8-09 — provisioning adequacy","standardized_verdict":"Amber","raw_value":3033,"unit":"$m accrued litigation","current_period":"FY25","prior_period":"1727 FY24","trend":"Rising","peer_benchmark":"No peer set","peer_verdict":"Not assessed","score":1,"max_score":3,"penalty":0,"confidence_1_to_5":4,"materiality":"High","evidence":"[Visa FY25 Form 10-K, p.59; Note 20]","source_id":"S01","source_type":"Audited annual filing","source_date":"2025-11-06","as_of_date":"2026-09-23","analyst_interpretation":"Increase is a charge, not a release, but remains estimate-sensitive.","red_flag_triggered":false,"red_flag_id":"","follow_up_required":"Compare future payments and estimates."},
  {"finding_id":"11-010","ticker":"V","date":"2026-09-23","agent":"accounting-forensics","section":"P&L quality","question":"A8-10 — effective tax rate","standardized_verdict":"Green","raw_value":17.1,"unit":"%","current_period":"FY25","prior_period":"17.4% FY24","trend":"Stable","peer_benchmark":"No peer set","peer_verdict":"Not assessed","score":0,"max_score":3,"penalty":0,"confidence_1_to_5":5,"materiality":"Medium","evidence":"[Visa FY25 Form 10-K, p.60; Note 19]","source_id":"S01","source_type":"Audited annual filing","source_date":"2025-11-06","as_of_date":"2026-09-23","analyst_interpretation":"Tax incentive explains rate.","red_flag_triggered":false,"red_flag_id":"","follow_up_required":""},
  {"finding_id":"11-011","ticker":"V","date":"2026-09-23","agent":"accounting-forensics","section":"Accrual & Conversion","question":"A8-11 — cash EPS / accounting EPS","standardized_verdict":"Green","raw_value":1.15,"unit":"x proxy","current_period":"FY25","prior_period":"1.01x FY24","trend":"Improving","peer_benchmark":"No peer set","peer_verdict":"Not assessed","score":0,"max_score":2,"penalty":0,"confidence_1_to_5":5,"materiality":"High","evidence":"[earnings/06, §1]","source_id":"S02","source_type":"Cross-module filing-based analysis","source_date":"2026-09-23","as_of_date":"2026-09-23","analyst_interpretation":"Same diluted-share-basis CFO/PAT proxy clears Red band.","red_flag_triggered":false,"red_flag_id":"","follow_up_required":""},
  {"finding_id":"11-012","ticker":"V","date":"2026-09-23","agent":"accounting-forensics","section":"Accrual & Conversion","question":"A8-12 — CFO/EBITDA","standardized_verdict":"Green","raw_value":91.5,"unit":"%","current_period":"FY25","prior_period":"81.0% FY24","trend":"Improving","peer_benchmark":"No peer set","peer_verdict":"Not assessed","score":0,"max_score":3,"penalty":0,"confidence_1_to_5":5,"materiality":"High","evidence":"[earnings/06, §1]","source_id":"S02","source_type":"Cross-module filing-based analysis","source_date":"2026-09-23","as_of_date":"2026-09-23","analyst_interpretation":"No annual conversion breach.","red_flag_triggered":false,"red_flag_id":"","follow_up_required":""},
  {"finding_id":"11-013","ticker":"V","date":"2026-09-23","agent":"accounting-forensics","section":"Policy stability","question":"A8-13 — consolidation perimeter","standardized_verdict":"Green","raw_value":1,"unit":"disclosed FY25 acquisition","current_period":"FY25","prior_period":"FY24","trend":"Explained","peer_benchmark":"No peer set","peer_verdict":"Not assessed","score":0,"max_score":3,"penalty":0,"confidence_1_to_5":4,"materiality":"Medium","evidence":"[Visa FY25 Form 10-K, Note 2]","source_id":"S01","source_type":"Audited annual filing","source_date":"2025-11-06","as_of_date":"2026-09-23","analyst_interpretation":"No entity churn signal.","red_flag_triggered":false,"red_flag_id":"","follow_up_required":""},
  {"finding_id":"11-014","ticker":"V","date":"2026-09-23","agent":"accounting-forensics","section":"Beneish battery","question":"A8-14 — Beneish M-score","standardized_verdict":"Green","raw_value":-2.461,"unit":"score","current_period":"FY25","prior_period":"FY24 inputs","trend":"Stable","peer_benchmark":"M < -2.22","peer_verdict":"In line","score":0,"max_score":5,"penalty":0,"confidence_1_to_5":5,"materiality":"High","evidence":"[Visa FY25 Form 10-K, pp.59–65]","source_id":"S01","source_type":"Audited annual filing","source_date":"2025-11-06","as_of_date":"2026-09-23","analyst_interpretation":"Zero component zones.","red_flag_triggered":false,"red_flag_id":"","follow_up_required":""},
  {"finding_id":"11-015","ticker":"V","date":"2026-09-23","agent":"accounting-forensics","section":"Revenue quality","question":"A8-15 — revenue-quality cross-checks","standardized_verdict":"Amber","raw_value":98.6,"unit":"% FY25 collections proxy/revenue","current_period":"FY25","prior_period":"t-1 trend unavailable","trend":"Mixed","peer_benchmark":"No peer set","peer_verdict":"Not assessed","score":3,"max_score":15,"penalty":0,"confidence_1_to_5":4,"materiality":"High","evidence":"[Visa FY25 Form 10-K, pp.59–60]","source_id":"S01","source_type":"Audited annual filing","source_date":"2025-11-06","as_of_date":"2026-09-23","analyst_interpretation":"Collections support FY25, while cash taxes and contract assets are missing.","red_flag_triggered":false,"red_flag_id":"","follow_up_required":"Obtain cash-tax and contract-asset detail."},
  {"finding_id":"11-016","ticker":"V","date":"2026-09-23","agent":"accounting-forensics","section":"Policy stability","question":"A8-16 — segment / geography disclosure shifts","standardized_verdict":"Green","raw_value":1,"unit":"reportable segment","current_period":"FY25","prior_period":"FY24","trend":"Stable / more disclosure","peer_benchmark":"No peer set","peer_verdict":"Not assessed","score":0,"max_score":3,"penalty":0,"confidence_1_to_5":4,"materiality":"Medium","evidence":"[Visa FY25 Form 10-K, Notes 1 and 21]","source_id":"S01","source_type":"Audited annual filing","source_date":"2025-11-06","as_of_date":"2026-09-23","analyst_interpretation":"No segment-masking signal.","red_flag_triggered":false,"red_flag_id":"","follow_up_required":""},
  {"finding_id":"11-017","ticker":"V","date":"2026-09-23","agent":"accounting-forensics","section":"Dechow battery","question":"A8-17 — Dechow F-score & accrual battery","standardized_verdict":"Insufficient Data","raw_value":null,"unit":"F-score","current_period":"FY25","prior_period":"FY24","trend":"Not computable","peer_benchmark":"F < 1.00","peer_verdict":"Not assessed","score":2,"max_score":5,"penalty":0,"confidence_1_to_5":5,"materiality":"High","evidence":"[Visa FY25 Form 10-K, pp.59–65]","source_id":"S01","source_type":"Audited annual filing","source_date":"2025-11-06","as_of_date":"2026-09-23","analyst_interpretation":"t-2 balance sheet unavailable; composite not approximated.","red_flag_triggered":false,"red_flag_id":"","follow_up_required":"Obtain FY24 10-K."},
  {"finding_id":"11-018","ticker":"V","date":"2026-09-23","agent":"accounting-forensics","section":"Dechow battery","question":"A8-18 — issuance in a flagged year","standardized_verdict":"Green","raw_value":4320,"unit":"$m securities proceeds","current_period":"FY25","prior_period":"N/A","trend":"Issued, unflagged","peer_benchmark":"No peer set","peer_verdict":"Not assessed","score":0,"max_score":2,"penalty":0,"confidence_1_to_5":5,"materiality":"Medium","evidence":"[Visa FY25 Form 10-K, p.65; Section 2]","source_id":"S01","source_type":"Audited annual filing","source_date":"2025-11-06","as_of_date":"2026-09-23","analyst_interpretation":"M Green and TATA negative.","red_flag_triggered":false,"red_flag_id":"","follow_up_required":""},
  {"finding_id":"11-019","ticker":"V","date":"2026-09-23","agent":"accounting-forensics","section":"Cash authenticity","question":"A8-19 — cash authenticity","standardized_verdict":"Insufficient Data","raw_value":null,"unit":"implied cash yield","current_period":"FY25","prior_period":"FY24","trend":"Not computable","peer_benchmark":"4.08% FY25 UST","peer_verdict":"Not assessed","score":3,"max_score":15,"penalty":0,"confidence_1_to_5":4,"materiality":"High","evidence":"[Visa FY25 Form 10-K, p.60; Note 1; Auditor’s Report]","source_id":"S01","source_type":"Audited annual filing","source_date":"2025-11-06","as_of_date":"2026-09-23","analyst_interpretation":"Mixed interest line and no disclosed confirmation procedure.","red_flag_triggered":false,"red_flag_id":"","follow_up_required":"Obtain deposit interest and confirmation evidence."},
  {"finding_id":"11-020","ticker":"V","date":"2026-09-23","agent":"accounting-forensics","section":"Regulator divergence","question":"A8-20 — regulator-found divergence","standardized_verdict":"Insufficient Data","raw_value":0,"unit":"issuer-attributed web hits","current_period":"Through 2026-09-23","prior_period":"N/A","trend":"Coverage-limited","peer_benchmark":"SEC AAER/EDGAR","peer_verdict":"Not assessed","score":0,"max_score":2,"penalty":0,"confidence_1_to_5":2,"materiality":"High","evidence":"[Web: SEC searches, 2026-09-23 (unverified)]","source_id":"S06","source_type":"Official regulator site accessed on web","source_date":"2026-09-23","as_of_date":"2026-09-23","analyst_interpretation":"No issuer hit returned; not enforcement clearance.","red_flag_triggered":false,"red_flag_id":"","follow_up_required":"Complete regulator/court sweep."},
  {"finding_id":"11-021","ticker":"V","date":"2026-09-23","agent":"accounting-forensics","section":"Leverage hygiene","question":"A14-01 — net debt / EBITDA governance lens","standardized_verdict":"Green","raw_value":0.32,"unit":"x strict basis","current_period":"FY25","prior_period":"0.36x FY24","trend":"Improving","peer_benchmark":"<0.5x","peer_verdict":"In line","score":0,"max_score":10,"penalty":0,"confidence_1_to_5":5,"materiality":"High","evidence":"[balance-sheet-survival/01, §§6–7]","source_id":"S03","source_type":"Cross-module debt-stack analysis","source_date":"2026-09-23","as_of_date":"2026-09-23","analyst_interpretation":"Low strict-basis leverage.","red_flag_triggered":false,"red_flag_id":"","follow_up_required":""},
  {"finding_id":"11-022","ticker":"V","date":"2026-09-23","agent":"accounting-forensics","section":"Advances hygiene","question":"A14-02 — loans & advances % total assets","standardized_verdict":"Insufficient Data","raw_value":null,"unit":"loans/advances","current_period":"FY25","prior_period":"FY24","trend":"Not assessable","peer_benchmark":"<2%","peer_verdict":"Not assessed","score":0,"max_score":5,"penalty":0,"confidence_1_to_5":4,"materiality":"Medium","evidence":"[Visa FY25 Form 10-K, p.59]","source_id":"S01","source_type":"Audited annual filing","source_date":"2025-11-06","as_of_date":"2026-09-23","analyst_interpretation":"Other-assets lines cannot be treated as loans.","red_flag_triggered":false,"red_flag_id":"","follow_up_required":"Obtain note-level loans/advances detail."}
]
```

### forensics_battery.json

```json
{"computable":true,"sector_excluded":false,"m_score":-2.461,"m_components":{"DSRI":1.096,"GMI":1.001,"AQI":1.021,"SGI":1.113,"DEPI":0.952,"SGAI":1.012,"LVGI":1.095,"TATA":-0.03012},"components_in_zone":0,"f_score":null,"rsst_pct_avg_assets":null,"soft_assets_pct":57.84,"d_rec_pct":0.58,"d_inv_pct":null,"issuance_flagged_year":false,"implied_cash_yield_pct":null,"risk_free_rate_pct":4.08,"risk_free_source":"Federal Reserve H.15 / FRED GS1 monthly FY25 average, accessed 2026-09-23","red_flag_ids":[]}
```

## Hard Self-Check

- [x] All A8-01–A8-20 and A14-01–A14-02 items appear in the Universal Findings Table.
- [x] Beneish M-score was calculated from audited comparative filing inputs; no web score was substituted.
- [x] Dechow F-score is marked not computable rather than fabricated without a t−2 balance sheet.
- [x] Cash yield uses the fiscal-period risk-free comparator but is not calculated from a mixed interest line.
- [x] Every Amber or Insufficient Data item identifies the missing fact or follow-up.
- [x] All net-debt figures are labelled strict basis.
- [x] Regulator searches are logged as coverage-limited, not treated as a clean sweep.
