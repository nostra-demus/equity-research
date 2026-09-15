# Accounting Forensics — AKAM

All amounts are USD millions unless stated otherwise. Akamai is a U.S. GAAP cybersecurity and cloud-services issuer with a 31 December year-end; it is not a bank, NBFC, or insurer, so the normal accrual batteries apply. This report uses the frozen evidence set only. The FY2025 10-K contains audited FY2025/FY2024 balance-sheet comparatives and FY2023–FY2025 income and cash-flow comparatives; the source-bound Capital IQ workbook supplies the FY2023 balance-sheet date needed solely for the Dechow opening-balance arithmetic.

## 0. Sector Gate & Inputs

| Item | Detail | Source |
|---|---|---|
| Sector (from triage 00) | Cybersecurity and cloud computing; IT/cloud-services overlay is relevant to contract assets and customer concentration. | [Governance Data Triage, §5A, 2026-09-14] |
| Financials overlay applied? (bank/NBFC/insurer → battery invalid) | No — operating company; Beneish and Dechow are valid. | [FY2025 Form 10-K (data/AKAM/Akamai Technologies, Inc., 2025.pdf), Item 1 and p.53] |
| Years of audited annual history in pool | Three income/cash-flow years (FY2023–FY2025) and two audited balance-sheet dates (FY2024–FY2025). | [FY2025 Form 10-K, pp.53–56] |
| earnings/06 baseline present? | Yes — consumed for CFO/PAT and CFO/EBITDA; no baseline figures were recomputed. | [Earnings Quality — AKAM, §§1–3, 2026-09-14] |
| balance-sheet-survival/01 debt stack present? | Yes — consumed for the strict-basis current leverage result. | [Capital Structure & Leverage — AKAM, §§4–7, 2026-09-14] |
| Battery computable? (needs 2 consecutive annual filings) | Yes. Beneish uses the two audited comparative years. Dechow's FY2023 opening balance-sheet inputs are from the frozen source-bound CIQ workbook because a separate FY2024 10-K is not in the pool. | [FY2025 Form 10-K, pp.53–56; Capital IQ Financials workbook (data/AKAM/Akamai Technologies Inc NasdaqGS AKAM Financials.xls), Balance Sheet, FY2023–FY2025] |

## 1. Battery Inputs (two consecutive audited annual filings — every number cited, verbatim per §5)

| Input line item | FY2024 | FY2025 | Evidence |
|---|---:|---:|---|
| Revenue | 3,991.168 | 4,208.175 | [FY2025 Form 10-K, p.54] |
| Trade receivables (net) | 727.687 | 793.666 | [FY2025 Form 10-K, p.53; Note 4, p.68] |
| Cost of revenue / gross margin | 1,620.793 / 59.39% | 1,727.513 / 58.95% | [FY2025 Form 10-K, p.54; gross margin calculated from cited rows] |
| Current assets | 2,578.097 | 2,286.680 | [FY2025 Form 10-K, p.53] |
| Net PP&E | 1,995.071 | 2,333.462 | [FY2025 Form 10-K, p.53; Note 6, p.69] |
| Securities / non-current investments | 1,354.468 = 1,078.876 current + 275.592 non-current marketable securities | 989.530 = 256.302 current + 733.228 non-current marketable securities | [FY2025 Form 10-K, p.53] |
| Total assets | 10,368.785 | 11,479.643 | [FY2025 Form 10-K, p.53] |
| Depreciation used for DEPI (PP&E and internal-use software) | 556.0 | 597.5 | [FY2025 Form 10-K, Note 6, p.69] |
| SG&A (sales and marketing + G&A) | 1,178.566 | 1,231.041 | [FY2025 Form 10-K, p.54] |
| Long-term debt / convertible notes | 2,396.695 | 4,105.355 | [FY2025 Form 10-K, p.53; Note 11, pp.75–77] |
| Current liabilities | 2,091.323 | 967.518 | [FY2025 Form 10-K, p.53] |
| CFO (cash from operations) | 1,519.171 | 1,518.765 | [FY2025 Form 10-K, p.55] |
| Net income from continuing operations | 504.918 | 452.031 | [FY2025 Form 10-K, p.54] |
| Inventory | No balance reported | No balance reported | [FY2025 Form 10-K, p.53] |
| Cash & bank deposits / equivalents | 517.707 | 930.231 | [FY2025 Form 10-K, p.53] |
| Interest income | 100.280 interest and marketable-securities income, net — mixed line | 70.808 interest and marketable-securities income, net — mixed line | [FY2025 Form 10-K, p.54; Item 7—Interest and marketable securities income, net, p.37] |
| Cash taxes paid | 136.322 | 143.546 | [FY2025 Form 10-K, Note 15—Income Taxes, p.90] |
| Securities issued during FY2025 (equity/debt/convertible/QIP) | — | 1,725.0 principal of 2033 convertible senior notes | [FY2025 Form 10-K, Note 11, p.75; Statements of Cash Flows, p.56] |

The FY2025 filing is the source for all FY2024/FY2025 audited inputs above. Where the Dechow model needs FY2023 balance-sheet inputs, the frozen CIQ workbook supplies total assets $9,900.037m, current assets $1,804.855m, cash $489.468m, short-term investments $374.971m, long-term investments $1,450.954m, receivables $724.302m, current liabilities $836.038m, and long-term debt $3,538.229m. These are cited as vendor values, not relabelled as filing figures. [Capital IQ Financials workbook, Balance Sheet, FY2023 column — vendor basis, frozen 2026-09-14]

## 2. Beneish M-Score (A8-14) — computed with Python 3.12, computation shown

The Beneish M-score is a statistical screen for earnings-manipulation patterns, not a fraud finding. Calculation used the audited input table and `M = −4.84 + 0.920·DSRI + 0.528·GMI + 0.404·AQI + 0.892·SGI + 0.115·DEPI − 0.172·SGAI − 0.327·LVGI + 4.679·TATA`.

| Component | Value FY2025 | Non-manipulator mean | Manipulator zone | Verdict |
|---|---:|---:|---|---|
| DSRI (receivables outrunning sales) | 1.034 | 1.031 | ≥1.465 | Green |
| GMI (gross margin deteriorating) | 1.007 | 1.014 | ≥1.193 | Green |
| AQI (asset quality softening) | 1.194 | 1.039 | ≥1.254 | Green |
| SGI (sales growth pressure) | 1.054 | 1.134 | ≥1.607 | Green |
| DEPI (depreciation rate slowing) | 1.069 | 1.001 | ≥1.077 | Green |
| SGAI (overhead vs sales) | 0.991 | 1.054 | not banded (negative weight in M) | Green |
| LVGI (leverage rising) | 1.021 | 1.037 | ≥1.111 | Green |
| TATA (accruals vs assets) | −0.093 | 0.018 | ≥0.031 | Green |

`M = −4.84 + 0.920(1.034) + 0.528(1.007) + 0.404(1.194) + 0.892(1.054) + 0.115(1.069) − 0.172(0.991) − 0.327(1.021) + 4.679(−0.093) = −2.750`.

| Composite / rule | Value | Green band | Amber band | Red band | Verdict |
|---|---:|---|---|---|---|
| M-score | −2.750 | < −2.22, no component in zone | −2.22 to −1.78 (re-check drivers) | > −1.78 | Green |
| Components in manipulator zone | 0 of 7 banded | 0 | 1–2 (Amber — the composite decides) | ≥3 | Green |

## 3. Dechow F-Score & Accrual Battery (A8-17, A8-18) — computed with Python 3.12, computation shown

The Dechow F-score is a misstatement-probability screen where 1.00 is the average-company level. Using the model definitions, average FY2024/FY2025 assets are $10,924.214m. RSST accruals — balance-sheet accruals across working capital, non-current operations and financing — are −2.870%: working capital moved $39.307m to $132.629m, non-current operating assets $6,512.686m to $7,030.336m, and net financial assets $(2,191.343)m to $(3,115.825)m. Cash sales are $4,142.196m in FY2025 and $3,987.783m in FY2024; the FY2024 figure uses the frozen FY2023 receivables comparative. `pred = −5.4398`, probability = 0.4322%, and `F = 0.004322 / 0.0037 = 1.168`.

| Test | Value | Green band | Red band | Verdict | Evidence |
|---|---:|---|---|---|---|
| Dechow F-score (1.00 = average company) | 1.168 | <1.00 | ≥1.85 (substantial; ≥2.45 high) | Amber | [FY2025 Form 10-K, pp.53–56; Capital IQ Financials workbook, Balance Sheet FY2023] |
| RSST accruals / average assets | −2.87% | ≤3% | ≥10% | Green | [FY2025 Form 10-K, p.53; Capital IQ Financials workbook, Balance Sheet FY2023; calculation shown above] |
| Soft assets % of total assets | 71.57%; down from 75.72% | <50% | >65% and rising | Amber — high but falling | [FY2025 Form 10-K, p.53; calculation from cited rows] |
| Δ receivables / average assets | 0.60% | <2% | ≥5% with no acquisition explaining it | Green | [FY2025 Form 10-K, pp.53–54; calculation] |
| Δ inventory / average assets | 0.00% (no inventory line reported) | <2% | ≥5% with no acquisition explaining it | Green | [FY2025 Form 10-K, p.53] |
| A8-18 — issuance in a flagged year | $1.725bn convertible issuance; F <1.85 and TATA −9.29% | none while flagged; self-funded | issued while F ≥1.85 or TATA ≥0.031 (RF-ACC-004) | Green — issuance was not in an accrual-flagged year | [FY2025 Form 10-K, pp.54–56; Note 11, p.75] |

The F-score is Amber because soft assets are 71.57% of assets, not because accruals, receivables, inventory or the composite cleared a red band. The asset-mix figure is high but fell 415 basis points year on year, so it does not meet the stated “high and rising” red condition. No RF-ACC-001 or RF-ACC-004 is triggered.

## 4. Cash Authenticity (A8-19)

| Test | Value | Band | Verdict | Evidence |
|---|---:|---|---|---|
| Interest income ÷ average cash & deposits (implied yield) | Not computable — the filed $70.808m line is net interest on invested cash and marketable securities plus mutual-fund income/loss tied to deferred compensation; it cannot be scope-matched to cash/deposits alone. | Do not divide a mixed line by cash. | Insufficient Data | [FY2025 Form 10-K, Item 7—Interest and marketable securities income, net, p.37] |
| Period risk-free rate (instrument, source, date) | 3.91% — U.S. 1-year Treasury constant-maturity, FY2025 annual average. | Comparator only; yield numerator is mixed. | Not applied | [Web: Federal Reserve/ALFRED RIFLGFCY01NA, 2025 annual observation, accessed 2026-09-14] |
| Gap | Not computable. | Green within ~150bp; Red implied <50% of risk-free on a material pile. | Insufficient Data | [FY2025 Form 10-K, p.37; Web: Federal Reserve/ALFRED RIFLGFCY01NA, 2025 annual observation] |
| Cash held in company's own name at major banks? | Yes: cash equivalents are cash in bank deposit accounts and short-term liquid investments; the company says it keeps the majority with major institutions. | Red: “held in trust” / third-party custody. | Green on the disclosed custody prong | [FY2025 Form 10-K, Note 2, pp.63–64] |
| Auditor obtained independent bank confirmations? | Not disclosed in the auditor’s report or cash note reviewed. | Red: confirmations not independently obtained. | Insufficient Data — absence of disclosed confirmation procedure is not a failure finding. | [FY2025 Form 10-K, Auditor’s Report, pp.50–52; Note 2, pp.63–64] |

## 5. Revenue Quality (A8-15)

| Cross-check | FY2024 | FY2025 | Band | Verdict | Evidence |
|---|---:|---:|---|---|---|
| Revenue growth vs cash-taxes-paid growth | Revenue 3,991.168; cash taxes 136.322 | Revenue 4,208.175 (+5.44%); cash taxes 143.546 (+5.30%) | Red: revenue grows, cash taxes flat | Green — cash taxes moved almost in line with revenue | [FY2025 Form 10-K, p.54; Note 15, p.90] |
| Collections proxy (revenue − Δreceivables) vs revenue | 3,987.783; 99.91% of revenue | 4,142.196; 98.43% of revenue (+3.87%) | Red: collections flat while revenue grows | Green — collections grew, though less quickly than revenue | [FY2025 Form 10-K, pp.53–54; Capital IQ Financials workbook, Balance Sheet FY2023; calculation] |
| Unbilled revenue + contract assets, % of revenue | Unbilled AR 222.281; 5.57% | Unbilled AR 223.458; 5.31% | Green <10%; Red >25% or mark-to-model | Green — the filing gives unbilled AR, not a separate contract-asset line; this is therefore the disclosed proxy rather than a claim of zero contract assets | [FY2025 Form 10-K, Note 4, p.68; p.54] |
| Order book: contractually binding or MOU-paper? | Remaining-performance-obligation balance not separately provided in this prior-year comparison | $5.2bn RPOs; excludes usage without a committed contract and anticipated renewals | Red: non-binding MOUs presented as demand | Green — filed amount is future committed revenue under current customer contracts, with its exclusions stated | [FY2025 Form 10-K, Note 16—Revenue, p.83] |

## 6. Accrual & Conversion Baseline (A8-01, A8-11, A8-12) — figures from earnings/06 where present

| Test | Raw value | Green band | Red band | Trend (3–5y) | Verdict | Evidence |
|---|---:|---|---|---|---|---|
| A8-01 — CFO/PAT | 2.46x / 3.01x / 3.36x in FY2023/FY2024/FY2025 | ≥0.8 sustained | <0.6, esp. persistent (RF-FIN-001) | Cash conversion remained above profit in all three years. | Green | [Earnings Quality — AKAM, §§1–2, 2026-09-14] |
| A8-11 — cash EPS / accounting EPS | 2.46x / 3.01x / 3.36x; cash EPS of $8.68/$9.84/$10.33 versus GAAP diluted EPS of $3.52/$3.27/$3.07 | ≈1 | <0.7 | Above 1 throughout; the ratio matches CFO/PAT because the same diluted-share denominator is used. | Green, with SBC qualifier | [FY2025 Form 10-K, pp.54–55; calculation from stated rows] |
| A8-12 — CFO/EBITDA | 111.6% / 128.5% / 119.1% | ≥0.7 | <0.5 sustained | High and stable. | Green | [Earnings Quality — AKAM, §1, 2026-09-14] |

The upstream baseline’s important qualifier remains: FY2025 CFO adds back $459.4m of stock-based compensation (SBC), a non-cash employee cost. High cash conversion confirms reported earnings cash flow; it does not make adjusted earnings a per-share economic measure. [Earnings Quality — AKAM, §§2 and 10, 2026-09-14]

## 7. Balance-Sheet Hygiene (A8-02, A8-03, A8-04, A8-06)

| Test | Raw value | Green band | Red band | Trend | Verdict | Evidence |
|---|---:|---|---|---|---|---|
| A8-02 — working-capital days | Cash-conversion cycle 33.9 / 37.2 / 42.4 days in FY2023/FY2024/FY2025; FY2025 DSO 68.8 days vs 66.5. | stable or negative | rising >20% with no disclosed model change | CCC is +25.1% over two years, but FY2025’s year-on-year DSO increase is 3.4% and below the 20% trigger. | Amber | [Earnings Quality — AKAM, §3, 2026-09-14] |
| A8-03 — receivables aged >6 months | No ageing ladder disclosed. One customer exceeded 10% of FY2025 AR; none did in FY2024. | minimal, stable, dispersed | rising sharply or related-party concentrated (RF-FIN-002) | Ageing and related-party concentration not disclosed. | Insufficient Data | [FY2025 Form 10-K, Note 2, pp.63–64; Note 4, p.68] |
| A8-04 — expense capitalization | Capitalized internal-use software was 311.714 (7.41% of revenue) vs 294.834 (7.39%); capitalized SBC was 123.4 (2.93%) vs 105.3 (2.64%). | conservative, disclosed, stable rate | capitalized development/interest rising vs peers or own history | Total software capitalization was stable as a percentage of revenue, but capitalized SBC rose 29.8% and 29bp of revenue. | Amber | [FY2025 Form 10-K, pp.55, 69] |
| A8-06 — goodwill vs net worth; impairment history | Goodwill 3,206.525 / equity 4,977.371 = 64.4%; FY2024 64.6%. | modest, genuinely tested | goodwill > net worth, or serial impairments (RF-FIN-004) | Below net worth and stable. The disclosed 2024/2025 write-offs include equipment, software and acquired-intangible assets, not goodwill. | Green | [FY2025 Form 10-K, pp.53, 69, 74–75] |

The FY2025 10-K states capitalized SBC of $123.4m. That is $8.6m above the $114.8m amount stated in the upstream earnings-quality report; the primary filing controls this report’s capitalization calculation. [FY2025 Form 10-K, p.69; Earnings Quality — AKAM, §6, 2026-09-14]

## 8. P&L Quality (A8-05, A8-08, A8-09, A8-10)

| Test | Raw value | Green band | Red band | Trend | Verdict | Evidence |
|---|---:|---|---|---|---|---|
| A8-05 — exceptionals frequency; other income % of PBT | Restructuring charges 56.643 / 95.441 / 58.051 in FY2023–FY2025; FY2025 interest and marketable-securities income 70.808 / PBT 602.405 = 11.8%. | rare; <10% of PBT or clearly treasury | “one-offs” yearly, or other income >⅓ of PBT | Restructuring has appeared each year. Interest income is identifiable treasury income and below one-third of PBT. | Red — recurring “one-off” pattern | [FY2025 Form 10-K, pp.54, 74–75] |
| A8-08 — depreciation charge vs asset base | PPE/internal-software D&A 556.0 → 597.5 (+7.5%); net PPE 1,995.071 → 2,333.462 (+16.96%). | charge tracks the base | unexplained large drop on a stable base | Charge increased; no unexplained drop. | Green | [FY2025 Form 10-K, pp.53, 69] |
| A8-09 — provisioning adequacy | AR allowance 3.522 (0.48% of net AR) → 7.706 (0.97%); charges to operating income 6.954 → 16.109. | coverage stable vs history and peers | releases funding reported earnings | Reserve increased rather than released to support earnings. | Green | [FY2025 Form 10-K, Note 4, p.68] |
| A8-10 — effective tax rate vs statutory | FY2023 16.3%; FY2024 14.0%; FY2025 25.0% against 21.0% U.S. federal rate. | near statutory or fully explained | persistently far below, unexplained | The statutory reconciliation identifies Swiss-rate differences, credits, SBC and transfer pricing; FY2025 is above statutory. | Green — monitor H1 FY2026’s separately disclosed 16.4% discrete-benefit rate | [FY2025 Form 10-K, Note 15, pp.87–89; Q2 FY2026 Form 10-Q, Note 12, p.24] |

## 9. Policy, Estimate & Perimeter Stability (A8-07, A8-13, A8-16)

| Test | Finding | Green band | Red band | Verdict | Evidence |
|---|---|---|---|---|---|
| A8-07 — policy / estimate / year-end changes | FY2025 adopted a tax-disclosure presentation standard; no material policy, estimate, fiscal-year-end or ICFR change was identified. | stable | profit-boosting changes, or an FY-end change muddying comparability | Green | [FY2025 Form 10-K, Note 2, pp.61–64; Item 9A, p.94] |
| A8-13 — consolidation perimeter | Consolidated accounts include wholly owned subsidiaries and eliminate intercompany items; acquisitions are disclosed, with no weak-unit deconsolidation identified. | stable, changes explained | entity churn, weak units deconsolidated, associates engineered below thresholds | Green | [FY2025 Form 10-K, Note 1, p.61; Note 8—Acquisitions, pp.71–73] |
| A8-16 — segment / geography disclosure shifts | One operating and reportable segment in FY2023–FY2025; three solution-category revenue lines remain visible. | stable or visibility-improving | segments merged/redefined exactly when one deteriorates | Green | [FY2025 Form 10-K, Note 21—Segment and Geographic Information, pp.92–93] |

## 10. Regulator-Found Divergence (A8-20) — swept per frameworks/GOVERNANCE_DATABASES.md

| Check | Finding | Red band | Verdict | Evidence |
|---|---|---|---|---|
| Regulator inspection divergence vs reported numbers | The focused SEC sweep found no filing or SEC search result establishing a restatement of Akamai’s reported financial-statement numbers. It did find a 2016 SEC FCPA non-prosecution agreement concerning 2012–2015 books-and-records and internal-accounting-control failures at Akamai-China. The agreement says improper gifts and entertainment were recorded as legitimate expenses; it does not identify a financial-statement restatement. | any material regulator-found divergence | Amber — historical control failure; no sourced restatement finding in this focused accounting sweep | [SEC Non-Prosecution Agreement, 2016-06-07, pp.1, 7–8] |
| Lender- or regulator-directed forensic audit | No lender- or regulator-directed forensic audit found in the focused SEC/EDGAR searches. The 2016 NPA records that Akamai conducted and shared its own investigation and audits of Chinese channel partners; that is not a regulator-directed forensic audit. | any (RF-ACC-005) | Green on the defined test, with historical NPA follow-up retained | [SEC Non-Prosecution Agreement, 2016-06-07, pp.7–8] |

The historical NPA is routed to the regulatory specialist as an enforcement/integrity matter. It does not meet the narrower A8-20 red condition on the evidence reviewed because no restated reported numbers or directed forensic audit was identified; RF-ACC-005 is not triggered in this accounting-forensics report.

## 11. Leverage & Advances Hygiene (A14-01, A14-02) — debt stack from balance-sheet-survival/01 where present

| Test | Raw value (basis labeled per §15) | Green band | Red band | Trend | Verdict | Evidence |
|---|---:|---|---|---|---|---|
| A14-01 — net debt / EBITDA (governance lens) | 5.14x at Q2 FY2026: strict net debt $6,082.6m = debt $7,562.8m − cash $1,480.3m, divided by $1,184.1m LTM GAAP-derived EBITDA. | net cash or <0.5× (§24 Filter 3: net cash = strategic asset) | >3×, or leverage rising to fund promoter objectives | 2.49x at FY2025 → 5.14x at Q2 FY2026. The May 2026 note issuance funded cloud-infrastructure capex and corporate purposes, not a disclosed promoter objective. | Red — level exceeds 3×; no registry code is assigned to A14-01 leverage alone | [Capital Structure & Leverage — AKAM, §§4–7, 2026-09-14; Q2 FY2026 Form 10-Q, pp.3–5, Note 7, pp.17–20] |
| A14-02 — loans & advances % of total assets | Not disclosed as a separate balance-sheet asset. The cash-flow statement does not report loans originated/sold, but that does not establish an ending loans-and-advances balance. | <2%, ordinary-course | >5%, rising, or advanced to parties that never repay | Not assessable. | Insufficient Data | [FY2025 Form 10-K, pp.53, 55–56; Capital IQ Financials workbook, Cash Flow, FY2023–FY2025] |

CIQ sidecar reconciliation: the mechanically parsed vendor reads are total debt $9,339.0m, net debt $4,722.7m, LTM EBITDA $1,079.9m and net debt/EBITDA 4.37x. Those are present and authoritative for the workbook’s own basis, but not substitutes for strict leverage: the vendor debt includes $1,776.2m of operating-lease liabilities and its net-debt figure nets cash plus marketable securities. [ciq_facts.json, `total_debt_m`, `net_debt_m`, `ltm_ebitda_m`, `net_debt_ebitda_x`, present; Capital Structure & Leverage — AKAM, §4, 2026-09-14]

## 12. Forensics Read

The measured manipulation screens are not red: Beneish M is −2.750 with zero component-zone hits, and Dechow F is 1.168, below the 1.85 substantial-misstatement threshold. The closest measured concern is the 71.57% soft-asset share that makes the F-score Amber, although it fell from 75.72%; cash authenticity cannot be confirmed by a yield test because the disclosed interest line is mixed. A rational minority holder should treat the books as cash-backed on the reported CFO measures, but not treat management’s adjusted profit as equivalent to economic earnings while recurring restructuring, rising capitalized SBC and strict leverage of 5.14x remain open risks.

## Sweep Log

| Database | Query | Date | Results | Attributed? (identifier used) | Coverage note |
|---|---|---|---:|---|---|
| SEC.gov / EDGAR full-text and enforcement search | `Akamai Technologies accounting enforcement AAER`; `Akamai Technologies forensic audit`; `Akamai Technologies restatement SEC enforcement` | 2026-09-14 | 1 relevant historical SEC NPA; no sourced restatement or directed-forensic-audit result | Yes — Akamai Technologies, Inc.; CIK 0001086222 | Focused A8-20 coverage only; historic NPA read in full and classified by its actual facts. |
| SEC Enforcement | Akamai Technologies, Inc. NPA dated 2016-06-07 | 2026-09-14 | 1 | Yes — Akamai Technologies, Inc. | Books-and-records/internal-controls matter; no financial-statement restatement stated. |
| Federal Reserve/ALFRED | `RIFLGFCY01NA`, 2025 annual observation | 2026-09-14 | 1 | Yes — 1-year U.S. Treasury constant-maturity series | Period risk-free comparator only; used because the cash-yield numerator was not computable. |

## Universal Findings Table

| Finding ID | Section | Question / Test | Standardized Verdict | Raw Value | Unit | Current Period | Prior Period | Trend | Peer Benchmark | Peer Verdict | Score | Max Score | Penalty | Confidence 1–5 | Materiality | Evidence | As-of Date | Analyst Interpretation | Red Flag Triggered? | Red Flag ID | Follow-up Required |
|---|---|---|---|---:|---|---|---|---|---|---|---:|---:|---:|---:|---|---|---|---|---|---|---|
| 11-001 | 6 | A8-01 — CFO / PAT | Green | 3.36 | x | FY2025 | 3.01 FY2024 | Improving | No peer set — relative governance not assessed | Not assessed | 0 | 3 | 0 | 5 | High | [Earnings Quality — AKAM, §§1–2] | 2025-12-31 | Cash exceeds GAAP profit; no RF-FIN-001. | No | — | — |
| 11-002 | 7 | A8-02 — working-capital days creep | Amber | 42.4 | days | FY2025 | 37.2 FY2024 | Rising; 33.9 FY2023 | No peer set — relative governance not assessed | Not assessed | 3 | 5 | 3 | 4 | Medium | [Earnings Quality — AKAM, §3] | 2025-12-31 | CCC is 25.1% above FY2023 but FY2025 DSO rose only 3.4% YoY. | No | — | Test FY2026 DSO, DPO and CCC against the same basis. |
| 11-003 | 7 | A8-03 — receivables aged >6 months | Insufficient Data | null | — | FY2025 | FY2024 | Ageing unavailable | No peer set — relative governance not assessed | Not assessed | 1 | 4 | 1 | 4 | Medium | [FY2025 Form 10-K, Note 2, pp.63–64; Note 4, p.68] | 2025-12-31 | One customer is >10% of AR, but age and related-party data are absent. | No | — | Obtain an AR ageing and top-customer concentration schedule. |
| 11-004 | 7 | A8-04 — expense capitalization | Amber | 2.93 | % revenue, capitalized SBC | FY2025 | 2.64 FY2024 | Rising | No peer set — relative governance not assessed | Not assessed | 2 | 4 | 2 | 5 | Medium | [FY2025 Form 10-K, pp.55, 69] | 2025-12-31 | Total software capitalization/revenue is stable, but capitalized SBC rose. | No | — | Separate growth from maintenance software and explain the rise in capitalized SBC. |
| 11-005 | 8 | A8-05 — recurring exceptionals & other income | Red | 58.051 | USDm restructuring | FY2025 | 95.441 FY2024; 56.643 FY2023 | Recurring | No peer set — relative governance not assessed | Not assessed | 4 | 4 | 4 | 5 | High | [FY2025 Form 10-K, pp.54, 74–75] | 2025-12-31 | A new restructuring charge appears in each completed year; treasury interest is not the problem. | Yes | RF-DISC-002 | Reconcile FY2026 restructuring and all related add-backs to a credible end-state. |
| 11-006 | 7 | A8-06 — goodwill build-up & impairment | Green | 64.4 | % of equity | FY2025 | 64.6% FY2024 | Stable | No peer set — relative governance not assessed | Not assessed | 0 | 4 | 0 | 5 | High | [FY2025 Form 10-K, pp.53, 69, 74–75] | 2025-12-31 | Goodwill is below equity; no goodwill impairment identified. | No | — | Monitor impairment testing if cloud investments or acquired-product write-offs grow. |
| 11-007 | 9 | A8-07 — policy / estimate / year-end changes | Green | 0 | material profit-boosting changes identified | FY2025 | FY2024 | Stable | No peer set — relative governance not assessed | Not assessed | 0 | 1 | 0 | 5 | Medium | [FY2025 Form 10-K, Note 2, pp.61–64; Item 9A, p.94] | 2025-12-31 | The tax-disclosure adoption is presentation, not a sourced earnings-policy change. | No | — | — |
| 11-008 | 8 | A8-08 — depreciation rate consistency | Green | 597.5 | USDm PPE/internal-software D&A | FY2025 | 556.0 FY2024 | Rising with asset base | No peer set — relative governance not assessed | Not assessed | 0 | 1 | 0 | 5 | Medium | [FY2025 Form 10-K, pp.53, 69] | 2025-12-31 | No unexplained depreciation reduction. | No | — | — |
| 11-009 | 8 | A8-09 — provisioning adequacy | Green | 0.97 | % AR allowance | FY2025 | 0.48% FY2024 | Reserve increased | No peer set — relative governance not assessed | Not assessed | 0 | 1 | 0 | 5 | Medium | [FY2025 Form 10-K, Note 4, p.68] | 2025-12-31 | Provision charges increased; no release financed reported profit. | No | — | — |
| 11-010 | 8 | A8-10 — effective tax-rate anomaly | Green | 25.0 | % ETR | FY2025 | 14.0% FY2024 | Normalised toward/above statutory | No peer set — relative governance not assessed | Not assessed | 0 | 1 | 0 | 5 | Medium | [FY2025 Form 10-K, Note 15, pp.87–89] | 2025-12-31 | Multi-year rate differences are reconciled; H1 FY2026 tax benefit needs monitoring. | No | — | — |
| 11-011 | 6 | A8-11 — cash EPS / accounting EPS | Green | 3.36 | x | FY2025 | 3.01x FY2024 | Improving | No peer set — relative governance not assessed | Not assessed | 0 | 3 | 0 | 5 | High | [FY2025 Form 10-K, pp.54–55; calculation] | 2025-12-31 | Same conclusion as CFO/PAT; SBC caveat remains. | No | — | — |
| 11-012 | 6 | A8-12 — CFO / EBITDA | Green | 119.1 | % | FY2025 | 128.5% FY2024 | High, stable | No peer set — relative governance not assessed | Not assessed | 0 | 3 | 0 | 5 | High | [Earnings Quality — AKAM, §1] | 2025-12-31 | Cash conversion clears the green band. | No | — | — |
| 11-013 | 9 | A8-13 — consolidation opacity | Green | 1 | reportable segment | FY2025 | FY2024 | Stable | No peer set — relative governance not assessed | Not assessed | 1 | 3 | 1 | 4 | Medium | [FY2025 Form 10-K, Note 1, p.61; Note 8, pp.71–73] | 2025-12-31 | Acquisitions are disclosed; no weak-unit deconsolidation found. | No | — | — |
| 11-014 | 2 | A8-14 — Beneish M-score | Green | -2.750 | score | FY2025 | FY2024 | 0 zone components | No peer set — relative governance not assessed | Not assessed | 0 | 7 | 0 | 5 | High | [FY2025 Form 10-K, pp.53–56, 69; computation in §2] | 2025-12-31 | No Beneish manipulation pattern. | No | — | — |
| 11-015 | 5 | A8-15 — revenue-quality cross-checks | Green | 5.31 | % revenue unbilled AR | FY2025 | 5.57% FY2024 | Improving | No peer set — relative governance not assessed | Not assessed | 1 | 15 | 1 | 5 | High | [FY2025 Form 10-K, pp.54, 68, 83, 90] | 2025-12-31 | Taxes and collections grew; filed RPO is committed, with exclusions disclosed. | No | — | — |
| 11-016 | 9 | A8-16 — segment / geography disclosure shifts | Green | 1 | reportable segment | FY2025 | FY2024 | Stable | No peer set — relative governance not assessed | Not assessed | 0 | 1 | 0 | 5 | Medium | [FY2025 Form 10-K, Note 21, pp.92–93] | 2025-12-31 | No deterioration-hiding segment change identified. | No | — | — |
| 11-017 | 3 | A8-17 — Dechow F-score & accrual battery | Amber | 1.168 | score | FY2025 | FY2024 | Soft assets falling but remain 71.57% | No peer set — relative governance not assessed | Not assessed | 5 | 7 | 5 | 4 | High | [FY2025 Form 10-K, pp.53–56; CIQ FY2023 Balance Sheet; computation in §3] | 2025-12-31 | Composite is below red; high soft assets prevent Green. | No | — | Recompute after FY2026 and test whether soft assets resume rising. |
| 11-018 | 3 | A8-18 — issuance in an accrual-flagged year | Green | 1,725.0 | USDm notes | FY2025 | — | Issued, but no F/TATA flag | No peer set — relative governance not assessed | Not assessed | 0 | 2 | 0 | 5 | High | [FY2025 Form 10-K, p.56; Note 11, p.75] | 2025-12-31 | Convertible issue does not meet RF-ACC-004 prerequisites. | No | — | — |
| 11-019 | 4 | A8-19 — cash authenticity | Insufficient Data | null | yield | FY2025 | FY2024 | Mixed interest line | No peer set — relative governance not assessed | Not assessed | 5 | 15 | 5 | 4 | High | [FY2025 Form 10-K, pp.37, 50–52, 63–64] | 2025-12-31 | Cash location is disclosed but cash-only interest yield and audit confirmation basis are not. | No | — | Request cash/deposit interest by asset class and confirmation procedure. |
| 11-020 | 10 | A8-20 — regulator-found divergence | Amber | 1 | historic NPA | 2016 NPA | 2012–2015 conduct | Historical, not a sourced restatement | No peer set — relative governance not assessed | Not assessed | 2 | 2 | 2 | 5 | High | [SEC Non-Prosecution Agreement, 2016-06-07, pp.1, 7–8; Sweep Log] | 2026-09-14 | SEC found books-and-controls failures; no sourced restatement/directed forensic audit. | No | — | Regulatory specialist to establish closure and any later recurrence. |
| 11-021 | 11 | A14-01 — net debt / EBITDA (governance lens) | Red | 5.14 | x, strict basis | Q2 FY2026 | 2.49x FY2025 | Rising sharply | No peer set — relative governance not assessed | Not assessed | 12 | 12 | 12 | 5 | High | [Capital Structure & Leverage — AKAM, §§4–7; Q2 FY2026 Form 10-Q, pp.3–5] | 2026-06-30 | The level breaches the >3x band; the stated use is cloud capex, not a promoter purpose. | No | No canonical registry ID assigned | Test cash conversion, capex and debt reduction against FY2026 leverage. |
| 11-022 | 11 | A14-02 — loans & advances level | Insufficient Data | null | % assets | FY2025 | FY2024 | Not assessable | No peer set — relative governance not assessed | Not assessed | 1 | 3 | 1 | 4 | Medium | [FY2025 Form 10-K, pp.53, 55–56] | 2025-12-31 | No separate loans-and-advances asset disclosure. | No | — | Obtain a balance-sheet schedule separating loans, advances and ordinary prepaid costs. |

## Accounting-Forensics Risk Score (INVERTED — higher = WORSE)

| Component | Score | Max Score | Evidence |
|---|---:|---:|---|
| Accrual battery — Beneish + Dechow (A8-01, A8-11, A8-12, A8-14, A8-17, A8-18) | 5 | 25 | Green M and cash conversion; Amber F solely from 71.57% soft assets. |
| Cash authenticity (A8-19) | 5 | 15 | Cash-in-own-name disclosure is positive; yield and confirmation prongs are not computable. |
| Revenue quality (A8-15) | 1 | 15 | Cash taxes and collections rose, unbilled AR is 5.31% of revenue, and RPOs are committed. |
| Balance-sheet hygiene — WC creep, receivables ageing, capitalization, goodwill, consolidation (A8-02, A8-03, A8-04, A8-06, A8-13) | 8 | 20 | CCC and capitalized SBC are Amber; ageing is unavailable; goodwill/perimeter are green. |
| P&L quality & policy stability (A8-05, A8-07, A8-08, A8-09, A8-10, A8-16, A8-20) | 6 | 10 | Annual restructuring is Red; historic SEC control failure is Amber; other tests are green. |
| Leverage & advances hygiene (A14-01, A14-02) | 13 | 15 | Strict leverage is 5.14x; loans/advances are not separately disclosed. |
| **Total** | **38** | **100** | **Mixed forensics risk; no battery-red or cash-authenticity-red score floor applies.** |

Score-cap note for synthesis: neither a Beneish/Dechow red condition nor a cash-authenticity failure is present, so the 70 accounting-forensics-risk / 60 governance-risk floor does not apply. The A14-01 leverage Red still must be carried to synthesis; it is not averaged away.

## Source Log

| Source ID | Source Type | Filename / Filing | Period | Page / Section | Date | Confidence 1–5 | Used For |
|---|---|---|---|---|---|---:|---|
| S1 | Audited filing | FY2025 Form 10-K (data/AKAM/Akamai Technologies, Inc., 2025.pdf) | FY2023–FY2025 | Consolidated statements, pp.53–56 | 2026-02-20 | 5 | Battery inputs, M-score, cash conversion, revenue quality |
| S2 | Audited filing | FY2025 Form 10-K | FY2025 | Notes 2, 4, 6, 10–11, 15–16, 21; pp.63–93 | 2026-02-20 | 5 | Cash custody, AR, capitalization, restructuring, debt, tax, contracts, segments |
| S3 | Cross-module analytical input | Earnings Quality — AKAM | FY2023–FY2025 | §§1–3, 10 | 2026-09-14 | 4 | Consumed CFO/PAT, CFO/EBITDA, working-capital baseline |
| S4 | Cross-module analytical input | Capital Structure & Leverage — AKAM | Q2 FY2026 | §§4–7 | 2026-09-14 | 4 | Strict-basis leverage and CIQ reconciliation |
| S5 | Company interim filing | Q2 FY2026 Form 10-Q (data/AKAM/Akamai Technologies, Inc., Q2 2026.pdf) | Q2 FY2026 | Balance sheets pp.3–4; income p.5; Note 7 pp.17–20 | 2026-08-07 | 5 | Latest debt, cash, leverage, and H1 tax-monitor reference |
| S6 | Vendor workbook | Capital IQ Financials (data/AKAM/Akamai Technologies Inc NasdaqGS AKAM Financials.xls) | FY2023–FY2025 | Balance Sheet, Cash Flow | frozen 2026-09-14 | 4 | FY2023 Dechow opening balance and designated vendor cross-checks |
| S7 | Deterministic facts sidecar | ciq_facts.json | LTM 2026-06-30 | `total_debt_m`, `net_debt_m`, `ltm_ebitda_m`, `net_debt_ebitda_x` | frozen 2026-09-14 | 4 | Authoritative vendor-basis read and basis reconciliation |
| S8 | Official macro data, web lookup | Federal Reserve/ALFRED RIFLGFCY01NA | FY2025 | Annual 1-year Treasury constant maturity | accessed 2026-09-14 | 4 | Period risk-free comparator |
| S9 | Regulator release | SEC Non-Prosecution Agreement — Akamai Technologies, Inc. | 2012–2015 conduct | pp.1, 7–8 | 2016-06-07 | 5 | A8-20 focused historic control/divergence review |

## Machine-Readable Findings

```json
[
  {"finding_id":"11-001","ticker":"AKAM","date":"2026-09-14","agent":"accounting-forensics","section":"6","question":"A8-01 — CFO / PAT","standardized_verdict":"Green","raw_value":3.36,"unit":"x","current_period":"FY2025","prior_period":"3.01x FY2024","trend":"Improving","peer_benchmark":"No peer set","peer_verdict":"Not assessed","score":0,"max_score":3,"penalty":0,"confidence_1_to_5":5,"materiality":"High","evidence":"[Earnings Quality — AKAM, §§1–2]","source_id":"S3","source_type":"cross-module","source_date":"2026-09-14","as_of_date":"2025-12-31","analyst_interpretation":"CFO exceeds PAT; no RF-FIN-001.","red_flag_triggered":false,"red_flag_id":"","follow_up_required":""},
  {"finding_id":"11-002","ticker":"AKAM","date":"2026-09-14","agent":"accounting-forensics","section":"7","question":"A8-02 — working-capital days creep","standardized_verdict":"Amber","raw_value":42.4,"unit":"days","current_period":"FY2025","prior_period":"37.2 FY2024","trend":"Rising","peer_benchmark":"No peer set","peer_verdict":"Not assessed","score":3,"max_score":5,"penalty":3,"confidence_1_to_5":4,"materiality":"Medium","evidence":"[Earnings Quality — AKAM, §3]","source_id":"S3","source_type":"cross-module","source_date":"2026-09-14","as_of_date":"2025-12-31","analyst_interpretation":"CCC is 25.1% above FY2023 but FY2025 DSO is only 3.4% higher YoY.","red_flag_triggered":false,"red_flag_id":"","follow_up_required":"Test FY2026 DSO, DPO and CCC on the same basis."},
  {"finding_id":"11-003","ticker":"AKAM","date":"2026-09-14","agent":"accounting-forensics","section":"7","question":"A8-03 — receivables aged >6 months","standardized_verdict":"Insufficient Data","raw_value":null,"unit":"","current_period":"FY2025","prior_period":"FY2024","trend":"Ageing unavailable","peer_benchmark":"No peer set","peer_verdict":"Not assessed","score":1,"max_score":4,"penalty":1,"confidence_1_to_5":4,"materiality":"Medium","evidence":"[FY2025 Form 10-K, Note 2, pp.63–64; Note 4, p.68]","source_id":"S2","source_type":"audited filing","source_date":"2026-02-20","as_of_date":"2025-12-31","analyst_interpretation":"No ageing ladder; one customer exceeds 10% of AR.","red_flag_triggered":false,"red_flag_id":"","follow_up_required":"Obtain AR ageing and top-customer schedule."},
  {"finding_id":"11-004","ticker":"AKAM","date":"2026-09-14","agent":"accounting-forensics","section":"7","question":"A8-04 — expense capitalization","standardized_verdict":"Amber","raw_value":2.93,"unit":"% revenue capitalized SBC","current_period":"FY2025","prior_period":"2.64% FY2024","trend":"Rising","peer_benchmark":"No peer set","peer_verdict":"Not assessed","score":2,"max_score":4,"penalty":2,"confidence_1_to_5":5,"materiality":"Medium","evidence":"[FY2025 Form 10-K, pp.55, 69]","source_id":"S1/S2","source_type":"audited filing","source_date":"2026-02-20","as_of_date":"2025-12-31","analyst_interpretation":"Total software capitalization/revenue is stable, but capitalized SBC increased.","red_flag_triggered":false,"red_flag_id":"","follow_up_required":"Separate growth from maintenance software and explain capitalized SBC."},
  {"finding_id":"11-005","ticker":"AKAM","date":"2026-09-14","agent":"accounting-forensics","section":"8","question":"A8-05 — recurring exceptionals & other income","standardized_verdict":"Red","raw_value":58.051,"unit":"USDm restructuring","current_period":"FY2025","prior_period":"95.441 FY2024; 56.643 FY2023","trend":"Recurring","peer_benchmark":"No peer set","peer_verdict":"Not assessed","score":4,"max_score":4,"penalty":4,"confidence_1_to_5":5,"materiality":"High","evidence":"[FY2025 Form 10-K, pp.54, 74–75]","source_id":"S1/S2","source_type":"audited filing","source_date":"2026-02-20","as_of_date":"2025-12-31","analyst_interpretation":"Restructuring appears in every completed year.","red_flag_triggered":true,"red_flag_id":"RF-DISC-002","follow_up_required":"Reconcile FY2026 restructuring and all add-backs to a credible end-state."},
  {"finding_id":"11-006","ticker":"AKAM","date":"2026-09-14","agent":"accounting-forensics","section":"7","question":"A8-06 — goodwill build-up & impairment","standardized_verdict":"Green","raw_value":64.4,"unit":"% equity","current_period":"FY2025","prior_period":"64.6% FY2024","trend":"Stable","peer_benchmark":"No peer set","peer_verdict":"Not assessed","score":0,"max_score":4,"penalty":0,"confidence_1_to_5":5,"materiality":"High","evidence":"[FY2025 Form 10-K, pp.53, 69, 74–75]","source_id":"S1/S2","source_type":"audited filing","source_date":"2026-02-20","as_of_date":"2025-12-31","analyst_interpretation":"Goodwill is below equity and no goodwill impairment is identified.","red_flag_triggered":false,"red_flag_id":"","follow_up_required":""},
  {"finding_id":"11-007","ticker":"AKAM","date":"2026-09-14","agent":"accounting-forensics","section":"9","question":"A8-07 — policy / estimate / year-end changes","standardized_verdict":"Green","raw_value":0,"unit":"material changes identified","current_period":"FY2025","prior_period":"FY2024","trend":"Stable","peer_benchmark":"No peer set","peer_verdict":"Not assessed","score":0,"max_score":1,"penalty":0,"confidence_1_to_5":5,"materiality":"Medium","evidence":"[FY2025 Form 10-K, Note 2, pp.61–64; Item 9A, p.94]","source_id":"S2","source_type":"audited filing","source_date":"2026-02-20","as_of_date":"2025-12-31","analyst_interpretation":"No profit-boosting change sourced.","red_flag_triggered":false,"red_flag_id":"","follow_up_required":""},
  {"finding_id":"11-008","ticker":"AKAM","date":"2026-09-14","agent":"accounting-forensics","section":"8","question":"A8-08 — depreciation rate consistency","standardized_verdict":"Green","raw_value":597.5,"unit":"USDm PPE/internal-software D&A","current_period":"FY2025","prior_period":"556.0 FY2024","trend":"Rising with asset base","peer_benchmark":"No peer set","peer_verdict":"Not assessed","score":0,"max_score":1,"penalty":0,"confidence_1_to_5":5,"materiality":"Medium","evidence":"[FY2025 Form 10-K, pp.53, 69]","source_id":"S1/S2","source_type":"audited filing","source_date":"2026-02-20","as_of_date":"2025-12-31","analyst_interpretation":"No unexplained charge reduction.","red_flag_triggered":false,"red_flag_id":"","follow_up_required":""},
  {"finding_id":"11-009","ticker":"AKAM","date":"2026-09-14","agent":"accounting-forensics","section":"8","question":"A8-09 — provisioning adequacy","standardized_verdict":"Green","raw_value":0.97,"unit":"% AR allowance","current_period":"FY2025","prior_period":"0.48% FY2024","trend":"Reserve increased","peer_benchmark":"No peer set","peer_verdict":"Not assessed","score":0,"max_score":1,"penalty":0,"confidence_1_to_5":5,"materiality":"Medium","evidence":"[FY2025 Form 10-K, Note 4, p.68]","source_id":"S2","source_type":"audited filing","source_date":"2026-02-20","as_of_date":"2025-12-31","analyst_interpretation":"No provision release financed earnings.","red_flag_triggered":false,"red_flag_id":"","follow_up_required":""},
  {"finding_id":"11-010","ticker":"AKAM","date":"2026-09-14","agent":"accounting-forensics","section":"8","question":"A8-10 — effective tax-rate anomaly","standardized_verdict":"Green","raw_value":25.0,"unit":"% ETR","current_period":"FY2025","prior_period":"14.0% FY2024","trend":"Normalised","peer_benchmark":"No peer set","peer_verdict":"Not assessed","score":0,"max_score":1,"penalty":0,"confidence_1_to_5":5,"materiality":"Medium","evidence":"[FY2025 Form 10-K, Note 15, pp.87–89]","source_id":"S2","source_type":"audited filing","source_date":"2026-02-20","as_of_date":"2025-12-31","analyst_interpretation":"Annual rates are reconciled; H1 FY2026 tax benefit is a monitor.","red_flag_triggered":false,"red_flag_id":"","follow_up_required":""},
  {"finding_id":"11-011","ticker":"AKAM","date":"2026-09-14","agent":"accounting-forensics","section":"6","question":"A8-11 — cash EPS / accounting EPS","standardized_verdict":"Green","raw_value":3.36,"unit":"x","current_period":"FY2025","prior_period":"3.01x FY2024","trend":"Improving","peer_benchmark":"No peer set","peer_verdict":"Not assessed","score":0,"max_score":3,"penalty":0,"confidence_1_to_5":5,"materiality":"High","evidence":"[FY2025 Form 10-K, pp.54–55; calculation]","source_id":"S1","source_type":"audited filing","source_date":"2026-02-20","as_of_date":"2025-12-31","analyst_interpretation":"Cash EPS materially exceeds GAAP EPS; SBC caveat remains.","red_flag_triggered":false,"red_flag_id":"","follow_up_required":""},
  {"finding_id":"11-012","ticker":"AKAM","date":"2026-09-14","agent":"accounting-forensics","section":"6","question":"A8-12 — CFO / EBITDA","standardized_verdict":"Green","raw_value":119.1,"unit":"%","current_period":"FY2025","prior_period":"128.5% FY2024","trend":"High, stable","peer_benchmark":"No peer set","peer_verdict":"Not assessed","score":0,"max_score":3,"penalty":0,"confidence_1_to_5":5,"materiality":"High","evidence":"[Earnings Quality — AKAM, §1]","source_id":"S3","source_type":"cross-module","source_date":"2026-09-14","as_of_date":"2025-12-31","analyst_interpretation":"CFO/EBITDA clears the green band.","red_flag_triggered":false,"red_flag_id":"","follow_up_required":""},
  {"finding_id":"11-013","ticker":"AKAM","date":"2026-09-14","agent":"accounting-forensics","section":"9","question":"A8-13 — consolidation opacity","standardized_verdict":"Green","raw_value":1,"unit":"reportable segment","current_period":"FY2025","prior_period":"FY2024","trend":"Stable","peer_benchmark":"No peer set","peer_verdict":"Not assessed","score":1,"max_score":3,"penalty":1,"confidence_1_to_5":4,"materiality":"Medium","evidence":"[FY2025 Form 10-K, Note 1, p.61; Note 8, pp.71–73]","source_id":"S2","source_type":"audited filing","source_date":"2026-02-20","as_of_date":"2025-12-31","analyst_interpretation":"Acquisitions are explained; no weak-unit deconsolidation found.","red_flag_triggered":false,"red_flag_id":"","follow_up_required":""},
  {"finding_id":"11-014","ticker":"AKAM","date":"2026-09-14","agent":"accounting-forensics","section":"2","question":"A8-14 — Beneish M-score","standardized_verdict":"Green","raw_value":-2.75,"unit":"score","current_period":"FY2025","prior_period":"FY2024","trend":"0 component-zone hits","peer_benchmark":"No peer set","peer_verdict":"Not assessed","score":0,"max_score":7,"penalty":0,"confidence_1_to_5":5,"materiality":"High","evidence":"[FY2025 Form 10-K, pp.53–56, 69; computation in §2]","source_id":"S1/S2","source_type":"audited filing","source_date":"2026-02-20","as_of_date":"2025-12-31","analyst_interpretation":"No Beneish manipulation pattern.","red_flag_triggered":false,"red_flag_id":"","follow_up_required":""},
  {"finding_id":"11-015","ticker":"AKAM","date":"2026-09-14","agent":"accounting-forensics","section":"5","question":"A8-15 — revenue-quality cross-checks","standardized_verdict":"Green","raw_value":5.31,"unit":"% revenue unbilled AR","current_period":"FY2025","prior_period":"5.57% FY2024","trend":"Improving","peer_benchmark":"No peer set","peer_verdict":"Not assessed","score":1,"max_score":15,"penalty":1,"confidence_1_to_5":5,"materiality":"High","evidence":"[FY2025 Form 10-K, pp.54, 68, 83, 90]","source_id":"S1/S2","source_type":"audited filing","source_date":"2026-02-20","as_of_date":"2025-12-31","analyst_interpretation":"Taxes and collections rose; RPOs are committed revenue with exclusions stated.","red_flag_triggered":false,"red_flag_id":"","follow_up_required":""},
  {"finding_id":"11-016","ticker":"AKAM","date":"2026-09-14","agent":"accounting-forensics","section":"9","question":"A8-16 — segment / geography disclosure shifts","standardized_verdict":"Green","raw_value":1,"unit":"reportable segment","current_period":"FY2025","prior_period":"FY2024","trend":"Stable","peer_benchmark":"No peer set","peer_verdict":"Not assessed","score":0,"max_score":1,"penalty":0,"confidence_1_to_5":5,"materiality":"Medium","evidence":"[FY2025 Form 10-K, Note 21, pp.92–93]","source_id":"S2","source_type":"audited filing","source_date":"2026-02-20","as_of_date":"2025-12-31","analyst_interpretation":"No concealment-oriented segment change found.","red_flag_triggered":false,"red_flag_id":"","follow_up_required":""},
  {"finding_id":"11-017","ticker":"AKAM","date":"2026-09-14","agent":"accounting-forensics","section":"3","question":"A8-17 — Dechow F-score & accrual battery","standardized_verdict":"Amber","raw_value":1.168,"unit":"score","current_period":"FY2025","prior_period":"FY2024","trend":"Soft assets falling but remain high","peer_benchmark":"No peer set","peer_verdict":"Not assessed","score":5,"max_score":7,"penalty":5,"confidence_1_to_5":4,"materiality":"High","evidence":"[FY2025 Form 10-K, pp.53–56; CIQ FY2023 Balance Sheet; computation in §3]","source_id":"S1/S6","source_type":"audited filing plus vendor","source_date":"2026-02-20 / frozen 2026-09-14","as_of_date":"2025-12-31","analyst_interpretation":"Below F-score red band; 71.57% soft assets prevents Green.","red_flag_triggered":false,"red_flag_id":"","follow_up_required":"Recompute after FY2026 and test soft-assets direction."},
  {"finding_id":"11-018","ticker":"AKAM","date":"2026-09-14","agent":"accounting-forensics","section":"3","question":"A8-18 — issuance in an accrual-flagged year","standardized_verdict":"Green","raw_value":1725.0,"unit":"USDm notes","current_period":"FY2025","prior_period":"","trend":"Issued but not flagged-year issuance","peer_benchmark":"No peer set","peer_verdict":"Not assessed","score":0,"max_score":2,"penalty":0,"confidence_1_to_5":5,"materiality":"High","evidence":"[FY2025 Form 10-K, p.56; Note 11, p.75]","source_id":"S1/S2","source_type":"audited filing","source_date":"2026-02-20","as_of_date":"2025-12-31","analyst_interpretation":"F <1.85 and TATA is negative; RF-ACC-004 does not fire.","red_flag_triggered":false,"red_flag_id":"","follow_up_required":""},
  {"finding_id":"11-019","ticker":"AKAM","date":"2026-09-14","agent":"accounting-forensics","section":"4","question":"A8-19 — cash authenticity","standardized_verdict":"Insufficient Data","raw_value":null,"unit":"yield","current_period":"FY2025","prior_period":"FY2024","trend":"Mixed interest line","peer_benchmark":"No peer set","peer_verdict":"Not assessed","score":5,"max_score":15,"penalty":5,"confidence_1_to_5":4,"materiality":"High","evidence":"[FY2025 Form 10-K, pp.37, 50–52, 63–64]","source_id":"S1/S2","source_type":"audited filing","source_date":"2026-02-20","as_of_date":"2025-12-31","analyst_interpretation":"Cash custody is disclosed; yield and confirmation prongs cannot be verified.","red_flag_triggered":false,"red_flag_id":"","follow_up_required":"Request cash/deposit interest and confirmation procedure."},
  {"finding_id":"11-020","ticker":"AKAM","date":"2026-09-14","agent":"accounting-forensics","section":"10","question":"A8-20 — regulator-found divergence","standardized_verdict":"Amber","raw_value":1,"unit":"historic SEC NPA","current_period":"2016 NPA","prior_period":"2012–2015 conduct","trend":"Historical","peer_benchmark":"No peer set","peer_verdict":"Not assessed","score":2,"max_score":2,"penalty":2,"confidence_1_to_5":5,"materiality":"High","evidence":"[SEC NPA, 2016-06-07, pp.1, 7–8; Sweep Log]","source_id":"S9","source_type":"regulator release","source_date":"2016-06-07","as_of_date":"2026-09-14","analyst_interpretation":"Control and books failures were found, but no sourced restatement/directed audit.","red_flag_triggered":false,"red_flag_id":"","follow_up_required":"Regulatory specialist to establish closure and recurrence."},
  {"finding_id":"11-021","ticker":"AKAM","date":"2026-09-14","agent":"accounting-forensics","section":"11","question":"A14-01 — net debt / EBITDA (governance lens)","standardized_verdict":"Red","raw_value":5.14,"unit":"x strict net debt / LTM GAAP-derived EBITDA","current_period":"Q2 FY2026","prior_period":"2.49x FY2025","trend":"Rising sharply","peer_benchmark":"No peer set","peer_verdict":"Not assessed","score":12,"max_score":12,"penalty":12,"confidence_1_to_5":5,"materiality":"High","evidence":"[Capital Structure & Leverage — AKAM, §§4–7; Q2 FY2026 Form 10-Q, pp.3–5]","source_id":"S4/S5","source_type":"cross-module plus interim filing","source_date":"2026-09-14 / 2026-08-07","as_of_date":"2026-06-30","analyst_interpretation":"Exceeds the 3x band; use is cloud capex, not a disclosed promoter objective.","red_flag_triggered":false,"red_flag_id":"","follow_up_required":"Test cash conversion, capex and debt reduction against FY2026 leverage."},
  {"finding_id":"11-022","ticker":"AKAM","date":"2026-09-14","agent":"accounting-forensics","section":"11","question":"A14-02 — loans & advances level","standardized_verdict":"Insufficient Data","raw_value":null,"unit":"% assets","current_period":"FY2025","prior_period":"FY2024","trend":"Not assessable","peer_benchmark":"No peer set","peer_verdict":"Not assessed","score":1,"max_score":3,"penalty":1,"confidence_1_to_5":4,"materiality":"Medium","evidence":"[FY2025 Form 10-K, pp.53, 55–56]","source_id":"S1","source_type":"audited filing","source_date":"2026-02-20","as_of_date":"2025-12-31","analyst_interpretation":"No separate loans-and-advances asset disclosure.","red_flag_triggered":false,"red_flag_id":"","follow_up_required":"Obtain loans/advances schedule."}
]
```

### forensics_battery.json

```json
{
  "computable": true,
  "sector_excluded": false,
  "m_score": -2.75,
  "m_components": {"DSRI": 1.0344, "GMI": 1.0075, "AQI": 1.1938, "SGI": 1.0544, "DEPI": 1.0691, "SGAI": 0.9907, "LVGI": 1.0209, "TATA": -0.0929},
  "components_in_zone": 0,
  "f_score": 1.168,
  "rsst_pct_avg_assets": -2.8699,
  "soft_assets_pct": 71.5697,
  "d_rec_pct": 0.6040,
  "d_inv_pct": 0.0,
  "issuance_flagged_year": false,
  "implied_cash_yield_pct": null,
  "risk_free_rate_pct": 3.91,
  "risk_free_source": "Federal Reserve/ALFRED RIFLGFCY01NA, FY2025 annual 1-year Treasury constant maturity, accessed 2026-09-14",
  "red_flag_ids": ["RF-DISC-002"]
}
```

## Hard Self-Check

- [x] All 22 owned A8/A14 items are in the Universal Findings Table.
- [x] Beneish and Dechow were computed from the frozen audited comparative data, with the FY2023 vendor opening balance explicitly labelled.
- [x] No single component was treated as a battery Red; no component is in the Beneish manipulator zone.
- [x] The non-financials sector gate was applied.
- [x] The period, rather than current, risk-free rate is cited; the yield test is not fabricated from a mixed interest line.
- [x] The earnings/06 baseline was consumed and its SBC qualifier retained.
- [x] Every net-debt figure is labelled strict or vendor/broad basis.
- [x] Amber/Red rows have a follow-up; the battery and cash-authenticity score floors do not apply.
- [x] The regulator conclusion is tied to the Sweep Log and retains the 2016 NPA qualifier.
