# Accounting Forensics — NU

## 0. Sector Gate & Inputs

| Item | Detail | Source |
|---|---|---|
| Sector (from triage 00) | Financials: digital bank / regulated financial institution; reports under IFRS. | [Governance triage, 2026-08-30, Sector & jurisdiction] |
| Financials overlay applied? (bank/NBFC/insurer → battery invalid) | Yes. Beneish M-score, Dechow F-score, working-capital, inventory, CFO/EBITDA and generic cash-yield tests are not valid for a deposit-funded lender. Tested expected credit loss (ECL), tax, policy/perimeter, related lending and regulator evidence instead. | [Management-governance MODULE_RULES.md, Financials overlay] |
| Years of audited annual history in pool | Four FY22–FY25 Form 20-F annual filings are available; FY24 and FY25 used for the comparable annual read. | [Data pool manifest, accessed 2026-08-30] |
| earnings/06 baseline present? | Yes; its lender-specific quality read was used as a cross-check. | [earnings/06_earnings-quality.md, 2026-08-30] |
| balance-sheet-survival/01 debt stack present? | No. balance-sheet-survival/01_capital-structure-and-leverage.md cross-module input not available — proceeding on this module's own read of the data pool. | [Cross-module path check, 2026-08-30] |
| Battery computable? (needs 2 consecutive annual filings) | Two filings exist, but the generic battery is sector-invalid, so it is deliberately not computed. | [Management-governance MODULE_RULES.md, Financials overlay] |

CIQ facts sidecar reconciliation: LTM CFO was US$-10,304.8m and vendor net debt US$-9,274.2m; the latter is a vendor basis that may net investments. This report uses reported cash and borrowings for a limited strict-basis check, not the vendor figure. [CIQ Financials→Cash Flow “Cash from Ops.”, LTM Jun-30-2026; CIQ Financials→Balance Sheet “Net Debt”, Jun-30-2026 — vendor basis] The relationship export covers only recently disclosed relationships and is not a complete supplier/customer or related-party population. [relationships.json, scope_notes, 2026-08-30]

## 1. Battery Inputs (two consecutive audited annual filings — every number cited, verbatim per §5)

| Input line item | FY24 | FY25 | Evidence |
|---|---:|---:|---|
| Revenue | US$11,517.0m | US$15,774.8m | [FY25 Form 20-F, Consolidated statement of profit or loss] |
| Credit card receivables, net (financials replacement for trade receivables) | US$12,259.3m | US$18,267.9m | [FY25 Form 20-F, Note 13 (Credit card receivables)] |
| Loans, net (financials replacement for inventory/working capital) | US$5,321.9m | US$9,421.5m | [FY25 Form 20-F, Note 14 (Loans)] |
| Total ECL allowance | Not re-derived for the generic battery | US$5,022.0m | FY25 gross credit-card and loan book less stated net balances; overlay uses the FY25-to-H1 FY26 ECL trend. [FY25 Form 20-F, Notes 13–14; H1 FY26 Interim Report, credit-asset notes] |
| Total assets | US$49,931.2m | US$74,894.0m | [FY25 Form 20-F, Consolidated statement of financial position] |
| D&A | US$77.1m | US$98.0m | [FY25 Form 20-F, Consolidated statement of cash flows] |
| Borrowings and financing | US$1,730.4m | US$4,398.2m | [FY25 Form 20-F, Consolidated statement of financial position] |
| Deposits | US$28,855.1m | US$41,925.1m | [FY25 Form 20-F, Consolidated statement of financial position] |
| CFO (cash from operations) | US$2,399.0m | US$3,500.5m | [FY25 Form 20-F, Consolidated statement of cash flows] |
| Net income | US$1,972.0m | US$2,871.7m | [FY25 Form 20-F, Consolidated statement of profit or loss] |
| Cash and cash equivalents | US$9,185.7m | US$15,003.6m | [FY25 Form 20-F, Note 11 (Cash and cash equivalents)] |
| Cash taxes paid | US$1,262.5m | US$1,641.7m | [FY25 Form 20-F, Consolidated statement of cash flows] |
| Securities issued during FY25 | Not identified as an issuance-led earnings-support signal in the annual financial statements. | — | [FY25 Form 20-F, Consolidated statements of changes in equity and cash flows] |

FY24 gross-book components are not re-derived here because the financials overlay relies on the disclosed FY25-to-H1 FY26 ECL trend, not a generic annual accrual formula.

## 2. Beneish M-Score (A8-14) — computed with python3, computation shown

Not applicable (sector): the Beneish M-score is a non-financial manipulation-screening model. Nu’s core assets and liabilities are credit receivables, loans, deposits and ECL allowances; applying sales/receivables, gross-margin, inventory and leverage components would produce a misleading score. [Management-governance MODULE_RULES.md, Financials overlay]

## 3. Dechow F-Score & Accrual Battery (A8-17, A8-18) — computed with python3, computation shown

Not applicable (sector): the Dechow F-score and RSST accruals battery are non-financial accounting-risk models and have the same limitation. No F-score, TATA or issuance-in-a-flagged-year conclusion is asserted. [Management-governance MODULE_RULES.md, Financials overlay]

## 4. Cash Authenticity (A8-19)

| Test | Value | Band | Verdict | Evidence |
|---|---:|---|---|---|
| Interest income ÷ average cash & deposits (implied yield) | Not computed | Generic yield test invalid for a lender whose cash includes central-bank balances, reverse repos and deposits. | Not Applicable (sector) | [FY25 Form 20-F, Note 11; Management-governance MODULE_RULES.md, Financials overlay] |
| Period risk-free rate (instrument, source, date) | Not run | Not applicable to the invalid generic yield test. | Not Applicable (sector) | [Management-governance MODULE_RULES.md, Financials overlay] |
| Cash held in company's own name at major banks? | Cash consists of bank balances, central-bank deposits, reverse repos and short-term investments; bank counterparties are not named in the note. | No third-party custody flag, but named-bank evidence is absent. | Insufficient Data | [FY25 Form 20-F, Note 11] |
| Auditor obtained independent bank confirmations? | Auditor reported an unqualified opinion and ICFR effectiveness; the public report does not disclose confirmation procedures. | Audit opinion is not evidence of a specific procedure. | Insufficient Data | [FY25 Form 20-F, Independent auditor’s report] |

## 5. Revenue Quality (A8-15)

| Cross-check | FY24 | FY25 | Band | Verdict | Evidence |
|---|---:|---:|---|---|---|
| Revenue growth vs cash-taxes-paid growth | Revenue US$11,517.0m; cash taxes US$1,262.5m | Revenue US$15,774.8m (+37.0%); cash taxes US$1,641.7m (+30.0%) | No “revenue up / cash tax flat” signal. | Green | [FY25 Form 20-F, Consolidated profit or loss and cash flows] |
| Collections proxy (revenue − Δreceivables) vs revenue | Not meaningful for interest/fee revenue at a lender. | Not meaningful. | Generic test invalid. | Not Applicable (sector) | [Management-governance MODULE_RULES.md, Financials overlay] |
| Unbilled revenue + contract assets, % of revenue | Not a material disclosed lender revenue construct. | Not a material disclosed lender revenue construct. | Generic test invalid. | Not Applicable (sector) | [FY25 Form 20-F, revenue and financial-instrument notes] |
| Order book: contractually binding or MOU-paper? | Not a relevant lending revenue model metric. | Not a relevant lending revenue model metric. | Generic test invalid. | Not Applicable (sector) | [Management-governance MODULE_RULES.md, Financials overlay] |

## 6. Accrual & Conversion Baseline (A8-01, A8-11, A8-12) — figures from earnings/06 where present

| Test | Raw value | Green band | Red band | Trend (3–5y) | Verdict | Evidence |
|---|---:|---|---|---|---|---|
| A8-01 — CFO/PAT | Not a valid lender quality ratio; FY25 CFO US$3,500.5m and PAT US$2,871.7m are funding/credit-cycle sensitive. | — | — | Not used | Not Applicable (sector) | [FY25 Form 20-F, cash flows and profit or loss; earnings/06] |
| A8-11 — cash EPS / accounting EPS | Not applicable to a lender under the overlay. | — | — | Not used | Not Applicable (sector) | [Management-governance MODULE_RULES.md, Financials overlay] |
| A8-12 — CFO/EBITDA | EBITDA is not a decision-useful lender measure. | — | — | Not used | Not Applicable (sector) | [Management-governance MODULE_RULES.md, Financials overlay] |

## 7. Balance-Sheet Hygiene (A8-02, A8-03, A8-04, A8-06)

| Test | Raw value | Green band | Red band | Trend | Verdict | Evidence |
|---|---:|---|---|---|---|---|
| A8-02 — working-capital days | Lender model; deposits and credit assets replace operating working capital. | — | — | Not used | Not Applicable (sector) | [Management-governance MODULE_RULES.md, Financials overlay] |
| A8-03 — receivables aged >6 months | Credit-card ECL US$3,528.0m and loans ECL US$1,494.0m at FY25; delinquency/ECL disclosures exist. | Overlay uses ECL, not trade-receivable ageing. | — | ECL ratio assessed below | Not Applicable (sector) | [FY25 Form 20-F, Notes 13–14] |
| A8-04 — expense capitalization | PPE US$27.6m and intangibles US$601.7m, versus total assets US$74,894.0m. | Low intangible/PPE share; no identified earnings-led capitalization change. | — | Intangibles rose from US$347.6m but remain 0.8% of assets. | Green | [FY25 Form 20-F, Consolidated financial position; Notes 17–18] |
| A8-06 — goodwill vs net worth; impairment history | Goodwill US$409.4m / equity US$11,321.6m = 3.6%. | Modest versus equity. | — | Goodwill fell from US$414.3m. | Green | [FY25 Form 20-F, Consolidated financial position; Note 18] |

## 8. P&L Quality (A8-05, A8-08, A8-09, A8-10)

| Test | Raw value | Green band | Red band | Trend | Verdict | Evidence |
|---|---:|---|---|---|---|---|
| A8-05 — exceptionals frequency; other income % of PBT | Other income US$130.0m / PBT US$3,868.4m = 3.4%. | Below one-third PBT; composition still needs ordinary monitoring. | — | 2.0% in FY24. | Green | [FY25 Form 20-F, Consolidated profit or loss] |
| A8-08 — depreciation charge vs asset base | D&A US$98.0m; PPE US$27.6m and intangibles US$601.7m. | No unexplained decline. | — | D&A rose from US$77.1m. | Green | [FY25 Form 20-F, cash flows; Notes 17–18] |
| A8-09 — provisioning adequacy | Total ECL / gross card and loan book: 15.37% FY25; 16.86% at 2026-06-30, +149bp. No provision release is funding earnings. | No release-led earnings signal. | Red if releases fund income. | Risk reserve intensity rose. | Amber | [FY25 Form 20-F, Notes 13–14; H1 FY26 Interim Report, Notes on credit receivables and loans] |
| A8-10 — effective tax rate vs statutory | FY25 ETR 25.77% vs 40.0% theoretical; H1 FY26 11.78% vs 42.5% theoretical, with US$991.0m deferred-tax benefit. | Reconciliation disclosed, but H1 rate is unusually low. | Persistently unexplained low rate. | FY24 ETR 29.45%. | Amber | [FY25 Form 20-F, Note 25 (Income taxes); H1 FY26 Interim Report, Note 19 (Income taxes)] |

## 9. Policy, Estimate & Perimeter Stability (A8-07, A8-13, A8-16)

| Test | Finding | Green band | Red band | Verdict | Evidence |
|---|---|---|---|---|---|
| A8-07 — policy / estimate / year-end changes | Nu introduced a managerial P&L in Q4 FY25 and states the presentation preserves net income, cash generation and capital. This is a comparability change to track, not identified as a GAAP profit lift. | Stable or fully explained. | Profit-boosting change. | Amber | [FY25 Form 20-F, Item 5, p.158] |
| A8-13 — consolidation perimeter | No evidence in the annual/interim disclosure reviewed of engineered deconsolidation or unexplained entity churn. | Changes explained. | Weak units deconsolidated / entities engineered below thresholds. | Green | [FY25 Form 20-F, Note 2 (Basis of consolidation); H1 FY26 Interim Report, Note 2] |
| A8-16 — segment / geography disclosure shifts | Managerial P&L presentation changes visibility; disclosed reason is management reporting, not a redefinition intended to conceal a deteriorating segment. | Stable or visibility-improving. | Redefinition around deterioration. | Amber | [FY25 Form 20-F, Item 5, p.158] |

## 10. Regulator-Found Divergence (A8-20) — swept per frameworks/GOVERNANCE_DATABASES.md

| Check | Finding | Red band | Verdict | Evidence |
|---|---|---|---|---|
| Regulator inspection divergence vs reported numbers | No material accounting-restatement, inspection-divergence or directed-forensic-audit result was located in the SEC, CVM and BCB searches recorded below. The BCB records two old late capital-abroad-declaration fines: R$25,000 (2020 decision) and R$12,500 (2021 decision). These are compliance-timeliness matters, not a reported-number divergence. Search coverage is not proof of absence. | Any material divergence above local threshold. | Amber | [Banco Central do Brasil, Decision 1005/2020, 2020-12-08; Banco Central do Brasil, Decision 930/2021, 2021-11-24; Sweep Log] |
| Lender- or regulator-directed forensic audit | Not located in the sources searched; no categorical “none” assertion. | Any (RF-ACC-005). | Green | [Sweep Log, 2026-08-30] |

## 11. Leverage & Advances Hygiene (A14-01, A14-02) — debt stack from balance-sheet-survival/01 where present

| Test | Raw value (basis labeled per §15) | Green band | Red band | Trend | Verdict | Evidence |
|---|---:|---|---|---|---|---|
| A14-01 — net debt / EBITDA (governance lens) | Not applicable: debt/EBITDA is invalid for financials. Limited strict-basis check at 2026-06-30: cash US$13,551.6m less borrowings US$4,682.3m = US$8,869.4m net cash; excludes reverse repos, leases and other funding liabilities. | — | — | — | Not Applicable (sector) | [H1 FY26 Interim Report, Consolidated financial position] |
| A14-02 — loans & advances % of total assets | Related-party credit is disclosed as ordinary-course to directors, board members, employees and close family on similar terms, but the amount is not quantified. | <2%, ordinary-course. | >5% / parties that never repay. | Not assessable. | Insufficient Data | [FY25 Form 20-F, Note 28 (Related parties)] |

## 12. Forensics Read

The non-financial Beneish and Dechow batteries are not valid for Nu, so no M- or F-score is asserted. The financials overlay finds no provision release funding profit, no material goodwill or capitalization problem, and no located regulator-found accounting divergence; FY25 cash taxes rose 30.0% while revenue rose 37.0%. The worst measured signal is credit-risk intensity: ECL rose from 15.37% of gross card and loan credit at FY25 to 16.86% at 2026-06-30 (+149bp), while H1 FY26 CFO was US$-1,242.0m versus US$1,932.5m net income. That is a lender credit-growth/funding warning, not evidence of manipulation; the low H1 ETR and new managerial P&L need the next audited disclosure to confirm durability and comparability.

## Sweep Log

| Database | Query | Date | Results | Attributed? (identifier used) | Coverage note |
|---|---|---|---:|---|---|
| SEC enforcement / filings | site:sec.gov/enforcement-litigation “Nu Holdings”; accounting/restatement/forensic terms | 2026-08-30 | 0 material accounting action located | Nu Holdings Ltd. | Search result coverage only; a no-result is not proof of absence. |
| CVM | site:gov.br/cvm “Nu Holdings” OR “Nu Pagamentos” | 2026-08-30 | 0 material accounting action located | Nu Holdings / Nu Pagamentos | Search result coverage only; Portuguese index coverage may be incomplete. |
| Banco Central do Brasil | “Nu Pagamentos” penalidade OR fiscalização OR auditoria | 2026-08-30 | 2 historic declaration-timeliness decisions; no reported-number divergence located | Nu Pagamentos S.A. | Official BCB electronic gazette searched; decisions are not forensic-audit findings. |
| Period risk-free rate | Not run: generic cash-yield test is invalid for this financial institution | 2026-08-30 | N/A | N/A | Required-period-rate sweep not applicable under the financials overlay. |

## Universal Findings Table

| Finding ID | Section | Question / Test | Standardized Verdict | Raw Value | Unit | Current Period | Prior Period | Trend | Peer Benchmark | Peer Verdict | Score | Max Score | Penalty | Confidence 1–5 | Materiality | Evidence | As-of Date | Analyst Interpretation | Red Flag Triggered? | Red Flag ID | Follow-up Required |
|---|---|---|---|---|---|---|---|---|---|---|---:|---:|---:|---:|---|---|---|---|---|---|---|
| A8-01 | 6 | CFO/PAT | Not Applicable (sector) | N/A | ratio | FY25 | FY24 | N/A | Financials overlay | N/A | 0 | 25 | 0 | 5 | High | [FY25 Form 20-F, cash flows] | 2025-12-31 | Funding-sensitive lender metric invalid. | No | — | No |
| A8-02 | 7 | Working-capital days | Not Applicable (sector) | N/A | days | FY25 | FY24 | N/A | Financials overlay | N/A | 0 | 20 | 0 | 5 | Medium | [MODULE_RULES, Financials overlay] | 2025-12-31 | Deposits/credit assets replace operating WC. | No | — | No |
| A8-03 | 7 | Receivables ageing | Not Applicable (sector) | N/A | — | FY25 | FY24 | N/A | ECL overlay | N/A | 0 | 20 | 0 | 5 | High | [FY25 Form 20-F, Notes 13–14] | 2025-12-31 | Evaluated through ECL, not trade ageing. | No | — | No |
| A8-04 | 7 | Expense capitalization | Green | 0.84 | % assets | FY25 | FY24 | Intangibles up but small | N/A | N/A | 1 | 20 | 0 | 4 | Medium | [FY25 Form 20-F, Notes 17–18] | 2025-12-31 | PPE plus intangibles remain small versus assets. | No | — | No |
| A8-05 | 8 | Other income / PBT | Green | 3.36 | % | FY25 | 2.00% | Up | <10% | Green | 1 | 10 | 0 | 5 | Medium | [FY25 Form 20-F, profit or loss] | 2025-12-31 | Far below one-third red band. | No | — | No |
| A8-06 | 7 | Goodwill / equity | Green | 3.62 | % | FY25 | 5.42% | Down | Modest | Green | 1 | 20 | 0 | 5 | Medium | [FY25 Form 20-F, Note 18] | 2025-12-31 | Modest balance, no serial impairment signal. | No | — | No |
| A8-07 | 9 | Policy/estimate change | Amber | Managerial P&L introduced | — | Q4 FY25 | N/A | New | Stable/explained | Amber | 4 | 10 | 0 | 4 | Medium | [FY25 Form 20-F, Item 5 p.158] | 2025-12-31 | Explanation disclosed; next annual comparison needed. | No | — | Yes |
| A8-08 | 8 | D&A vs asset base | Green | 98.0 | US$m | FY25 | 77.1 | Rising | Tracks assets | Green | 1 | 10 | 0 | 4 | Medium | [FY25 Form 20-F, cash flows] | 2025-12-31 | No unexplained depreciation reduction. | No | — | No |
| A8-09 | 8 | ECL adequacy | Amber | 16.86 | % gross credit | H1 FY26 | 15.37% | +149bp | Stable/adequate | Amber | 7 | 10 | 0 | 5 | High | [FY25 Form 20-F, Notes 13–14; H1 FY26 Interim Report, Notes credit assets] | 2026-06-30 | ECL rose; no release-led profit, but credit risk needs monitoring. | No | — | Yes |
| A8-10 | 8 | Effective tax rate | Amber | 11.78 | % | H1 FY26 | FY25 25.77% | Down | Fully explained | Amber | 6 | 10 | 0 | 5 | High | [H1 FY26 Interim Report, Note 19] | 2026-06-30 | Low rate reconciled to deferred-tax benefit; durability unproven. | No | — | Yes |
| A8-11 | 6 | Cash EPS/accounting EPS | Not Applicable (sector) | N/A | ratio | FY25 | FY24 | N/A | Financials overlay | N/A | 0 | 25 | 0 | 5 | Medium | [MODULE_RULES, Financials overlay] | 2025-12-31 | Generic cash conversion invalid. | No | — | No |
| A8-12 | 6 | CFO/EBITDA | Not Applicable (sector) | N/A | ratio | FY25 | FY24 | N/A | Financials overlay | N/A | 0 | 25 | 0 | 5 | Medium | [MODULE_RULES, Financials overlay] | 2025-12-31 | EBITDA not decision-useful for a lender. | No | — | No |
| A8-13 | 9 | Consolidation perimeter | Green | No adverse evidence located | — | FY25/H1 FY26 | FY24 | Stable | Explained changes | Green | 1 | 20 | 0 | 3 | Medium | [FY25 Form 20-F, Note 2; H1 FY26 Interim Report, Note 2] | 2026-06-30 | Coverage limited to reviewed filings. | No | — | No |
| A8-14 | 2 | Beneish M-score | Not Applicable (sector) | N/A | score | FY25 | FY24 | N/A | Financials overlay | N/A | 0 | 25 | 0 | 5 | High | [MODULE_RULES, Financials overlay] | 2025-12-31 | Do not force a non-financial model. | No | — | No |
| A8-15 | 5 | Revenue vs cash taxes | Green | +37.0 vs +30.0 | % growth | FY25 | FY24 | Both rise | Revenue up/cash tax flat = red | Green | 1 | 15 | 0 | 5 | High | [FY25 Form 20-F, profit or loss/cash flows] | 2025-12-31 | No paper-revenue signal in this check. | No | — | No |
| A8-16 | 9 | Segment/geography shifts | Amber | Managerial P&L | — | Q4 FY25 | N/A | New | Visibility-improving | Amber | 4 | 10 | 0 | 4 | Medium | [FY25 Form 20-F, Item 5 p.158] | 2025-12-31 | Track comparability through FY26. | No | — | Yes |
| A8-17 | 3 | Dechow F-score | Not Applicable (sector) | N/A | score | FY25 | FY24 | N/A | Financials overlay | N/A | 0 | 25 | 0 | 5 | High | [MODULE_RULES, Financials overlay] | 2025-12-31 | Do not force a non-financial model. | No | — | No |
| A8-18 | 3 | Issuance in flagged year | Not Applicable (sector) | N/A | — | FY25 | FY24 | N/A | Battery invalid | N/A | 0 | 25 | 0 | 5 | Medium | [MODULE_RULES, Financials overlay] | 2025-12-31 | No F/TATA flag exists. | No | — | No |
| A8-19 | 4 | Cash authenticity | Insufficient Data | Bank names/confirmations not public | — | FY25 | FY24 | N/A | Confirmation evidence | N/A | 6 | 15 | 0 | 4 | High | [FY25 Form 20-F, Note 11; auditor report] | 2025-12-31 | Cash categories disclosed; procedure/counterparty evidence unavailable. | No | — | Yes |
| A8-20 | 10 | Regulator-found divergence | Amber | 2 historical declaration fines | count | 2026 sweep | N/A | Historical | No divergence | Amber | 4 | 10 | 0 | 4 | High | [BCB Decisions 1005/2020, 930/2021; Sweep Log] | 2026-08-30 | No located accounting divergence, but compliance history warrants monitoring. | No | — | Yes |
| A14-01 | 11 | Net debt/EBITDA | Not Applicable (sector) | N/A | turns | H1 FY26 | FY25 | N/A | Financials overlay | N/A | 0 | 15 | 0 | 5 | High | [H1 FY26 Interim Report, financial position] | 2026-06-30 | Strict net cash US$8,869.4m is a limited check only. | No | — | No |
| A14-02 | 11 | Related loans/advances / assets | Insufficient Data | Not quantified | % assets | FY25 | FY24 | N/A | <2% / red >5% | N/A | 1 | 15 | 0 | 4 | High | [FY25 Form 20-F, Note 28] | 2025-12-31 | Terms described as ordinary-course, amount not disclosed. | No | — | Yes |

## Accounting-Forensics Risk Score (INVERTED — higher = WORSE; flag this in every table that carries it)

| Component | Score | Max Score | Evidence |
|---|---:|---:|---|
| Accrual battery — Beneish + Dechow (A8-01, A8-11, A8-12, A8-14, A8-17, A8-18) | 6 | 25 | Financials overlay substitutes ECL and funding-quality review; ECL ratio rose +149bp. |
| Cash authenticity (A8-19) | 6 | 15 | Cash categories are disclosed; named-bank and confirmation procedure evidence is absent. |
| Revenue quality (A8-15) | 1 | 15 | FY25 revenue +37.0%; cash taxes +30.0%, not flat. |
| Balance-sheet hygiene — WC creep, receivables ageing, capitalization, goodwill, consolidation (A8-02, A8-03, A8-04, A8-06, A8-13) | 3 | 20 | Small goodwill/intangibles and no adverse perimeter evidence in reviewed filings. |
| P&L quality & policy stability (A8-05, A8-07, A8-08, A8-09, A8-10, A8-16, A8-20) | 10 | 10 | ECL rise, unusually low H1 ETR, presentation change and historical reporting-timeliness fines. |
| Leverage & advances hygiene (A14-01, A14-02) | 3 | 15 | Related-party credit amount undisclosed; generic leverage ratio invalid. |
| Total | 29 | 100 | No red trigger; score is an overlay-based risk assessment, not a generic-battery score. |

No RF-ACC-001, RF-ACC-002, RF-ACC-004, RF-ACC-005, RF-FIN-001, RF-FIN-002 or RF-FIN-004 trigger was evidenced. No score floor applies.

## Source Log

| Source ID | Source Type | Filename / Filing | Period | Page / Section | Date | Confidence 1–5 | Used For |
|---|---|---|---|---|---|---:|---|
| S1 | Audited annual filing | Nu Holdings Ltd. Form 20-F | FY25 | Consolidated financial statements; Notes 2, 11, 13, 14, 17, 18, 25, 28 | 2026-04-08 | 5 | Revenue, CFO, cash taxes, credit assets/ECL, cash, goodwill, tax, related parties |
| S2 | Interim filing | Nu Holdings Ltd. Interim Report | H1 FY26 ended 2026-06-30 | Financial statements; credit assets and income-tax notes | 2026-08-14 | 4 | H1 CFO, ECL ratio, tax rate, strict-basis cash check |
| S3 | Cross-module analysis | earnings/06_earnings-quality.md | NU run | Quality baseline | 2026-08-30 | 3 | Overlay cross-check |
| S4 | Vendor workbook sidecar | ciq_facts.json | LTM Jun-30-2026 | LTM CFO and net debt fields | 2026-08-30 | 4 | Sidecar reconciliation only |
| S5 | Vendor relationship sidecar | relationships.json | Recent disclosures | scope_notes | 2026-08-30 | 3 | Scope limitation; no RPT inference |
| S6 | Regulator | Banco Central do Brasil Decision 1005/2020 | 2020 | Electronic Gazette | 2020-12-08 | 5 | R$25,000 late-declaration fine |
| S7 | Regulator | Banco Central do Brasil Decision 930/2021 | 2021 | Electronic Gazette | 2021-11-24 | 5 | R$12,500 late-declaration fine |

## Machine-Readable Findings

```json
[
  {
    "ticker": "NU",
    "date": "2026-08-30",
    "agent": "accounting-forensics",
    "evidence": "See Universal Findings Table and cited source.",
    "finding_id": "A8-01",
    "section": "6",
    "question": "CFO/PAT",
    "standardized_verdict": "Not Applicable (sector)",
    "raw_value": null,
    "unit": "ratio",
    "current_period": "FY25",
    "prior_period": "FY24",
    "trend": "N/A",
    "peer_benchmark": "Financials overlay",
    "peer_verdict": "N/A",
    "score": 0,
    "max_score": 25,
    "penalty": 0,
    "confidence_1_to_5": 5,
    "materiality": "High",
    "analyst_interpretation": "Funding-sensitive lender metric invalid.",
    "source_id": "S1",
    "source_type": "Audited annual filing",
    "source_date": "2026-04-08",
    "as_of_date": "2025-12-31",
    "red_flag_triggered": false,
    "red_flag_id": "",
    "follow_up_required": "No"
  },
  {
    "ticker": "NU",
    "date": "2026-08-30",
    "agent": "accounting-forensics",
    "evidence": "See Universal Findings Table and cited source.",
    "finding_id": "A8-02",
    "section": "7",
    "question": "Working-capital days",
    "standardized_verdict": "Not Applicable (sector)",
    "raw_value": null,
    "unit": "days",
    "current_period": "FY25",
    "prior_period": "FY24",
    "trend": "N/A",
    "peer_benchmark": "Financials overlay",
    "peer_verdict": "N/A",
    "score": 0,
    "max_score": 20,
    "penalty": 0,
    "confidence_1_to_5": 5,
    "materiality": "Medium",
    "analyst_interpretation": "Deposits and credit assets replace operating working capital.",
    "source_id": "S1",
    "source_type": "Audited annual filing",
    "source_date": "2026-04-08",
    "as_of_date": "2025-12-31",
    "red_flag_triggered": false,
    "red_flag_id": "",
    "follow_up_required": "No"
  },
  {
    "ticker": "NU",
    "date": "2026-08-30",
    "agent": "accounting-forensics",
    "evidence": "See Universal Findings Table and cited source.",
    "finding_id": "A8-03",
    "section": "7",
    "question": "Receivables ageing",
    "standardized_verdict": "Not Applicable (sector)",
    "raw_value": null,
    "unit": "",
    "current_period": "FY25",
    "prior_period": "FY24",
    "trend": "N/A",
    "peer_benchmark": "ECL overlay",
    "peer_verdict": "N/A",
    "score": 0,
    "max_score": 20,
    "penalty": 0,
    "confidence_1_to_5": 5,
    "materiality": "High",
    "analyst_interpretation": "Evaluated through ECL, not trade receivable ageing.",
    "source_id": "S1",
    "source_type": "Audited annual filing",
    "source_date": "2026-04-08",
    "as_of_date": "2025-12-31",
    "red_flag_triggered": false,
    "red_flag_id": "",
    "follow_up_required": "No"
  },
  {
    "ticker": "NU",
    "date": "2026-08-30",
    "agent": "accounting-forensics",
    "evidence": "See Universal Findings Table and cited source.",
    "finding_id": "A8-04",
    "section": "7",
    "question": "Expense capitalization",
    "standardized_verdict": "Green",
    "raw_value": 0.84,
    "unit": "% assets",
    "current_period": "FY25",
    "prior_period": "FY24",
    "trend": "Intangibles up but small",
    "peer_benchmark": "No peer set — relative governance not assessed.",
    "peer_verdict": "N/A",
    "score": 1,
    "max_score": 20,
    "penalty": 0,
    "confidence_1_to_5": 4,
    "materiality": "Medium",
    "analyst_interpretation": "PPE plus intangibles remain small versus assets.",
    "source_id": "S1",
    "source_type": "Audited annual filing",
    "source_date": "2026-04-08",
    "as_of_date": "2025-12-31",
    "red_flag_triggered": false,
    "red_flag_id": "",
    "follow_up_required": "No"
  },
  {
    "ticker": "NU",
    "date": "2026-08-30",
    "agent": "accounting-forensics",
    "evidence": "See Universal Findings Table and cited source.",
    "finding_id": "A8-05",
    "section": "8",
    "question": "Other income / PBT",
    "standardized_verdict": "Green",
    "raw_value": 3.36,
    "unit": "%",
    "current_period": "FY25",
    "prior_period": "FY24",
    "trend": "Up",
    "peer_benchmark": "<10%",
    "peer_verdict": "Green",
    "score": 1,
    "max_score": 10,
    "penalty": 0,
    "confidence_1_to_5": 5,
    "materiality": "Medium",
    "analyst_interpretation": "Far below the one-third PBT red band.",
    "source_id": "S1",
    "source_type": "Audited annual filing",
    "source_date": "2026-04-08",
    "as_of_date": "2025-12-31",
    "red_flag_triggered": false,
    "red_flag_id": "",
    "follow_up_required": "No"
  },
  {
    "ticker": "NU",
    "date": "2026-08-30",
    "agent": "accounting-forensics",
    "evidence": "See Universal Findings Table and cited source.",
    "finding_id": "A8-06",
    "section": "7",
    "question": "Goodwill / equity",
    "standardized_verdict": "Green",
    "raw_value": 3.62,
    "unit": "%",
    "current_period": "FY25",
    "prior_period": "FY24",
    "trend": "Down",
    "peer_benchmark": "Modest",
    "peer_verdict": "Green",
    "score": 1,
    "max_score": 20,
    "penalty": 0,
    "confidence_1_to_5": 5,
    "materiality": "Medium",
    "analyst_interpretation": "Modest balance; no serial impairment signal.",
    "source_id": "S1",
    "source_type": "Audited annual filing",
    "source_date": "2026-04-08",
    "as_of_date": "2025-12-31",
    "red_flag_triggered": false,
    "red_flag_id": "",
    "follow_up_required": "No"
  },
  {
    "ticker": "NU",
    "date": "2026-08-30",
    "agent": "accounting-forensics",
    "evidence": "See Universal Findings Table and cited source.",
    "finding_id": "A8-07",
    "section": "9",
    "question": "Policy / estimate change",
    "standardized_verdict": "Amber",
    "raw_value": "Managerial P&L introduced",
    "unit": "",
    "current_period": "Q4 FY25",
    "prior_period": "N/A",
    "trend": "New",
    "peer_benchmark": "Stable/explained",
    "peer_verdict": "Amber",
    "score": 4,
    "max_score": 10,
    "penalty": 0,
    "confidence_1_to_5": 4,
    "materiality": "Medium",
    "analyst_interpretation": "Disclosed explanation; confirm comparability in the next annual report.",
    "source_id": "S1",
    "source_type": "Audited annual filing",
    "source_date": "2026-04-08",
    "as_of_date": "2025-12-31",
    "red_flag_triggered": false,
    "red_flag_id": "",
    "follow_up_required": "Yes — reconcile FY26 managerial P&L to statutory presentation."
  },
  {
    "ticker": "NU",
    "date": "2026-08-30",
    "agent": "accounting-forensics",
    "evidence": "See Universal Findings Table and cited source.",
    "finding_id": "A8-08",
    "section": "8",
    "question": "D&A vs asset base",
    "standardized_verdict": "Green",
    "raw_value": 98,
    "unit": "US$m",
    "current_period": "FY25",
    "prior_period": "FY24",
    "trend": "Rising",
    "peer_benchmark": "Tracks asset base",
    "peer_verdict": "Green",
    "score": 1,
    "max_score": 10,
    "penalty": 0,
    "confidence_1_to_5": 4,
    "materiality": "Medium",
    "analyst_interpretation": "No unexplained depreciation decline.",
    "source_id": "S1",
    "source_type": "Audited annual filing",
    "source_date": "2026-04-08",
    "as_of_date": "2025-12-31",
    "red_flag_triggered": false,
    "red_flag_id": "",
    "follow_up_required": "No"
  },
  {
    "ticker": "NU",
    "date": "2026-08-30",
    "agent": "accounting-forensics",
    "evidence": "See Universal Findings Table and cited source.",
    "finding_id": "A8-09",
    "section": "8",
    "question": "ECL adequacy",
    "standardized_verdict": "Amber",
    "raw_value": 16.86,
    "unit": "% gross credit",
    "current_period": "H1 FY26",
    "prior_period": "FY25 15.37%",
    "trend": "+149bp",
    "peer_benchmark": "Stable/adequate",
    "peer_verdict": "Amber",
    "score": 7,
    "max_score": 10,
    "penalty": 0,
    "confidence_1_to_5": 5,
    "materiality": "High",
    "analyst_interpretation": "Reserve intensity increased; no evidence that releases funded earnings.",
    "source_id": "S2",
    "source_type": "Interim filing",
    "source_date": "2026-08-14",
    "as_of_date": "2026-06-30",
    "red_flag_triggered": false,
    "red_flag_id": "",
    "follow_up_required": "Yes — test ECL, delinquency and charge-off trend next quarter."
  },
  {
    "ticker": "NU",
    "date": "2026-08-30",
    "agent": "accounting-forensics",
    "evidence": "See Universal Findings Table and cited source.",
    "finding_id": "A8-10",
    "section": "8",
    "question": "Effective tax rate",
    "standardized_verdict": "Amber",
    "raw_value": 11.78,
    "unit": "%",
    "current_period": "H1 FY26",
    "prior_period": "FY25 25.77%",
    "trend": "Down",
    "peer_benchmark": "Fully explained",
    "peer_verdict": "Amber",
    "score": 6,
    "max_score": 10,
    "penalty": 0,
    "confidence_1_to_5": 5,
    "materiality": "High",
    "analyst_interpretation": "Reconciled to deferred-tax benefit; persistence is not proven.",
    "source_id": "S2",
    "source_type": "Interim filing",
    "source_date": "2026-08-14",
    "as_of_date": "2026-06-30",
    "red_flag_triggered": false,
    "red_flag_id": "",
    "follow_up_required": "Yes — obtain FY26 tax reconciliation and deferred-tax roll-forward."
  },
  {
    "ticker": "NU",
    "date": "2026-08-30",
    "agent": "accounting-forensics",
    "evidence": "See Universal Findings Table and cited source.",
    "finding_id": "A8-11",
    "section": "6",
    "question": "Cash EPS / accounting EPS",
    "standardized_verdict": "Not Applicable (sector)",
    "raw_value": null,
    "unit": "ratio",
    "current_period": "FY25",
    "prior_period": "FY24",
    "trend": "N/A",
    "peer_benchmark": "Financials overlay",
    "peer_verdict": "N/A",
    "score": 0,
    "max_score": 25,
    "penalty": 0,
    "confidence_1_to_5": 5,
    "materiality": "Medium",
    "analyst_interpretation": "Generic cash conversion invalid.",
    "source_id": "S3",
    "source_type": "Cross-module analysis",
    "source_date": "2026-08-30",
    "as_of_date": "2025-12-31",
    "red_flag_triggered": false,
    "red_flag_id": "",
    "follow_up_required": "No"
  },
  {
    "ticker": "NU",
    "date": "2026-08-30",
    "agent": "accounting-forensics",
    "evidence": "See Universal Findings Table and cited source.",
    "finding_id": "A8-12",
    "section": "6",
    "question": "CFO / EBITDA",
    "standardized_verdict": "Not Applicable (sector)",
    "raw_value": null,
    "unit": "ratio",
    "current_period": "FY25",
    "prior_period": "FY24",
    "trend": "N/A",
    "peer_benchmark": "Financials overlay",
    "peer_verdict": "N/A",
    "score": 0,
    "max_score": 25,
    "penalty": 0,
    "confidence_1_to_5": 5,
    "materiality": "Medium",
    "analyst_interpretation": "EBITDA is not decision-useful for a lender.",
    "source_id": "S3",
    "source_type": "Cross-module analysis",
    "source_date": "2026-08-30",
    "as_of_date": "2025-12-31",
    "red_flag_triggered": false,
    "red_flag_id": "",
    "follow_up_required": "No"
  },
  {
    "ticker": "NU",
    "date": "2026-08-30",
    "agent": "accounting-forensics",
    "evidence": "See Universal Findings Table and cited source.",
    "finding_id": "A8-13",
    "section": "9",
    "question": "Consolidation perimeter",
    "standardized_verdict": "Green",
    "raw_value": "No adverse evidence located",
    "unit": "",
    "current_period": "FY25/H1 FY26",
    "prior_period": "FY24",
    "trend": "Stable",
    "peer_benchmark": "Explained changes",
    "peer_verdict": "Green",
    "score": 1,
    "max_score": 20,
    "penalty": 0,
    "confidence_1_to_5": 3,
    "materiality": "Medium",
    "analyst_interpretation": "Reviewed filings show no engineered deconsolidation signal; evidence is limited.",
    "source_id": "S1",
    "source_type": "Audited annual filing",
    "source_date": "2026-04-08",
    "as_of_date": "2026-06-30",
    "red_flag_triggered": false,
    "red_flag_id": "",
    "follow_up_required": "No"
  },
  {
    "ticker": "NU",
    "date": "2026-08-30",
    "agent": "accounting-forensics",
    "evidence": "See Universal Findings Table and cited source.",
    "finding_id": "A8-14",
    "section": "2",
    "question": "Beneish M-score",
    "standardized_verdict": "Not Applicable (sector)",
    "raw_value": null,
    "unit": "score",
    "current_period": "FY25",
    "prior_period": "FY24",
    "trend": "N/A",
    "peer_benchmark": "Financials overlay",
    "peer_verdict": "N/A",
    "score": 0,
    "max_score": 25,
    "penalty": 0,
    "confidence_1_to_5": 5,
    "materiality": "High",
    "analyst_interpretation": "Do not force a non-financial model on a lender.",
    "source_id": "S3",
    "source_type": "Cross-module analysis",
    "source_date": "2026-08-30",
    "as_of_date": "2025-12-31",
    "red_flag_triggered": false,
    "red_flag_id": "",
    "follow_up_required": "No"
  },
  {
    "ticker": "NU",
    "date": "2026-08-30",
    "agent": "accounting-forensics",
    "evidence": "See Universal Findings Table and cited source.",
    "finding_id": "A8-15",
    "section": "5",
    "question": "Revenue versus cash taxes",
    "standardized_verdict": "Green",
    "raw_value": "+37.0% revenue; +30.0% cash taxes",
    "unit": "% growth",
    "current_period": "FY25",
    "prior_period": "FY24",
    "trend": "Both rise",
    "peer_benchmark": "Revenue up/cash tax flat = red",
    "peer_verdict": "Green",
    "score": 1,
    "max_score": 15,
    "penalty": 0,
    "confidence_1_to_5": 5,
    "materiality": "High",
    "analyst_interpretation": "No paper-revenue signal in this check.",
    "source_id": "S1",
    "source_type": "Audited annual filing",
    "source_date": "2026-04-08",
    "as_of_date": "2025-12-31",
    "red_flag_triggered": false,
    "red_flag_id": "",
    "follow_up_required": "No"
  },
  {
    "ticker": "NU",
    "date": "2026-08-30",
    "agent": "accounting-forensics",
    "evidence": "See Universal Findings Table and cited source.",
    "finding_id": "A8-16",
    "section": "9",
    "question": "Segment/geography disclosure shift",
    "standardized_verdict": "Amber",
    "raw_value": "Managerial P&L",
    "unit": "",
    "current_period": "Q4 FY25",
    "prior_period": "N/A",
    "trend": "New",
    "peer_benchmark": "Visibility improving",
    "peer_verdict": "Amber",
    "score": 4,
    "max_score": 10,
    "penalty": 0,
    "confidence_1_to_5": 4,
    "materiality": "Medium",
    "analyst_interpretation": "Track statutory/managerial comparability through FY26.",
    "source_id": "S1",
    "source_type": "Audited annual filing",
    "source_date": "2026-04-08",
    "as_of_date": "2025-12-31",
    "red_flag_triggered": false,
    "red_flag_id": "",
    "follow_up_required": "Yes — reconcile each new presentation line to prior disclosure."
  },
  {
    "ticker": "NU",
    "date": "2026-08-30",
    "agent": "accounting-forensics",
    "evidence": "See Universal Findings Table and cited source.",
    "finding_id": "A8-17",
    "section": "3",
    "question": "Dechow F-score",
    "standardized_verdict": "Not Applicable (sector)",
    "raw_value": null,
    "unit": "score",
    "current_period": "FY25",
    "prior_period": "FY24",
    "trend": "N/A",
    "peer_benchmark": "Financials overlay",
    "peer_verdict": "N/A",
    "score": 0,
    "max_score": 25,
    "penalty": 0,
    "confidence_1_to_5": 5,
    "materiality": "High",
    "analyst_interpretation": "Do not force a non-financial model on a lender.",
    "source_id": "S3",
    "source_type": "Cross-module analysis",
    "source_date": "2026-08-30",
    "as_of_date": "2025-12-31",
    "red_flag_triggered": false,
    "red_flag_id": "",
    "follow_up_required": "No"
  },
  {
    "ticker": "NU",
    "date": "2026-08-30",
    "agent": "accounting-forensics",
    "evidence": "See Universal Findings Table and cited source.",
    "finding_id": "A8-18",
    "section": "3",
    "question": "Issuance in flagged year",
    "standardized_verdict": "Not Applicable (sector)",
    "raw_value": null,
    "unit": "",
    "current_period": "FY25",
    "prior_period": "FY24",
    "trend": "N/A",
    "peer_benchmark": "Battery invalid",
    "peer_verdict": "N/A",
    "score": 0,
    "max_score": 25,
    "penalty": 0,
    "confidence_1_to_5": 5,
    "materiality": "Medium",
    "analyst_interpretation": "No F-score/TATA flag exists under the sector exclusion.",
    "source_id": "S3",
    "source_type": "Cross-module analysis",
    "source_date": "2026-08-30",
    "as_of_date": "2025-12-31",
    "red_flag_triggered": false,
    "red_flag_id": "",
    "follow_up_required": "No"
  },
  {
    "ticker": "NU",
    "date": "2026-08-30",
    "agent": "accounting-forensics",
    "evidence": "See Universal Findings Table and cited source.",
    "finding_id": "A8-19",
    "section": "4",
    "question": "Cash authenticity",
    "standardized_verdict": "Insufficient Data",
    "raw_value": "Bank names and confirmation procedures not public",
    "unit": "",
    "current_period": "FY25",
    "prior_period": "FY24",
    "trend": "N/A",
    "peer_benchmark": "Confirmation evidence",
    "peer_verdict": "N/A",
    "score": 6,
    "max_score": 15,
    "penalty": 0,
    "confidence_1_to_5": 4,
    "materiality": "High",
    "analyst_interpretation": "Cash categories are disclosed but named-counterparty and procedure evidence is unavailable.",
    "source_id": "S1",
    "source_type": "Audited annual filing",
    "source_date": "2026-04-08",
    "as_of_date": "2025-12-31",
    "red_flag_triggered": false,
    "red_flag_id": "",
    "follow_up_required": "Yes — seek counterparty concentration and confirmation evidence."
  },
  {
    "ticker": "NU",
    "date": "2026-08-30",
    "agent": "accounting-forensics",
    "evidence": "See Universal Findings Table and cited source.",
    "finding_id": "A8-20",
    "section": "10",
    "question": "Regulator-found divergence",
    "standardized_verdict": "Amber",
    "raw_value": 2,
    "unit": "historic compliance decisions",
    "current_period": "2026 sweep",
    "prior_period": "N/A",
    "trend": "Historical",
    "peer_benchmark": "No reported-number divergence",
    "peer_verdict": "Amber",
    "score": 4,
    "max_score": 10,
    "penalty": 0,
    "confidence_1_to_5": 4,
    "materiality": "High",
    "analyst_interpretation": "No located accounting divergence; historic declaration-timeliness decisions require monitoring.",
    "source_id": "S6/S7",
    "source_type": "Regulator",
    "source_date": "2021-11-24",
    "as_of_date": "2026-08-30",
    "red_flag_triggered": false,
    "red_flag_id": "",
    "follow_up_required": "Yes — rerun SEC/CVM/BCB enforcement sweep before next annual review."
  },
  {
    "ticker": "NU",
    "date": "2026-08-30",
    "agent": "accounting-forensics",
    "evidence": "See Universal Findings Table and cited source.",
    "finding_id": "A14-01",
    "section": "11",
    "question": "Net debt / EBITDA",
    "standardized_verdict": "Not Applicable (sector)",
    "raw_value": null,
    "unit": "turns",
    "current_period": "H1 FY26",
    "prior_period": "FY25",
    "trend": "N/A",
    "peer_benchmark": "Financials overlay",
    "peer_verdict": "N/A",
    "score": 0,
    "max_score": 15,
    "penalty": 0,
    "confidence_1_to_5": 5,
    "materiality": "High",
    "analyst_interpretation": "Strict net cash US$8,869.4m is a limited balance-sheet check, not debt/EBITDA.",
    "source_id": "S2",
    "source_type": "Interim filing",
    "source_date": "2026-08-14",
    "as_of_date": "2026-06-30",
    "red_flag_triggered": false,
    "red_flag_id": "",
    "follow_up_required": "No"
  },
  {
    "ticker": "NU",
    "date": "2026-08-30",
    "agent": "accounting-forensics",
    "evidence": "See Universal Findings Table and cited source.",
    "finding_id": "A14-02",
    "section": "11",
    "question": "Related loans / advances / assets",
    "standardized_verdict": "Insufficient Data",
    "raw_value": "Not quantified",
    "unit": "% assets",
    "current_period": "FY25",
    "prior_period": "FY24",
    "trend": "N/A",
    "peer_benchmark": "<2% / red >5%",
    "peer_verdict": "N/A",
    "score": 1,
    "max_score": 15,
    "penalty": 0,
    "confidence_1_to_5": 4,
    "materiality": "High",
    "analyst_interpretation": "Terms are described as ordinary-course but the amount is not disclosed.",
    "source_id": "S1",
    "source_type": "Audited annual filing",
    "source_date": "2026-04-08",
    "as_of_date": "2025-12-31",
    "red_flag_triggered": false,
    "red_flag_id": "",
    "follow_up_required": "Yes — obtain quantified related-party credit exposure."
  }
]
```

```json forensics_battery.json
{
  "computable": false,
  "sector_excluded": true,
  "m_score": null,
  "m_components": {
    "DSRI": null,
    "GMI": null,
    "AQI": null,
    "SGI": null,
    "DEPI": null,
    "SGAI": null,
    "LVGI": null,
    "TATA": null
  },
  "components_in_zone": 0,
  "f_score": null,
  "rsst_pct_avg_assets": null,
  "soft_assets_pct": null,
  "d_rec_pct": null,
  "d_inv_pct": null,
  "issuance_flagged_year": false,
  "implied_cash_yield_pct": null,
  "risk_free_rate_pct": null,
  "risk_free_source": "Not run — generic yield test is sector-invalid for a financial institution.",
  "red_flag_ids": []
}
```
