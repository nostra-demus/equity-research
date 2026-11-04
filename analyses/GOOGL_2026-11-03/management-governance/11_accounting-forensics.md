# Accounting Forensics — GOOGL

## 0. Sector Gate & Inputs

| Item | Detail | Source |
|---|---|---|
| Sector (from triage 00) | Communications / internet-platform business; not a bank, NBFC, or insurer. | [management-governance/00_triage.md, GOOGL, Sector & structure, 2026-11-03] |
| Financials overlay applied? | No. The standard manufacturing/corporate forensic battery is applicable. | [management-governance/00_triage.md, GOOGL, Sector & structure, 2026-11-03] |
| Years of audited annual history in pool | FY2023 comparative balance-sheet data and FY2024–FY2025 audited annual reports. | [FY2024 Annual Report, pp.52–56]; [FY2025 Annual Report, pp.47–51] |
| earnings/06 baseline present? | Yes; used for CFO/PAT, cash-EPS and CFO/EBITDA rather than recomputing those series. | [earnings/06_earnings-quality.md, GOOGL, §§1.1–1.2, 2026-11-03] |
| balance-sheet-survival/01 debt stack present? | Yes; used for the latest strict net-debt/EBITDA governance check. | [balance-sheet-survival/01_capital-structure-and-leverage.md, GOOGL, §§1–2, 2026-11-03] |
| Battery computable? | Beneish M-score: yes, from FY2024 and FY2025. Dechow F-score: no—the filings do not separately disclose inventory, an input to the model. | [FY2024 Annual Report, p.52]; [FY2025 Annual Report, pp.47, 52–57] |

All figures are USD millions unless stated otherwise. “CFO” means cash flow from operations, the cash produced by ordinary operations. “M-score” is Beneish’s accounting-manipulation screen; a more negative number is cleaner. “F-score” is Dechow’s probability-based screen, where 1.00 is an average company.

## 1. Battery Inputs (two consecutive audited annual filings — every number cited, verbatim per §5)

| Input line item | FY2024 | FY2025 | Evidence |
|---|---:|---:|---|
| Revenue | 350,018 | 402,836 | [FY2024 Annual Report, p.53]; [FY2025 Annual Report, p.48] |
| Trade receivables, net | 52,340 | 62,886 | [FY2024 Annual Report, p.52]; [FY2025 Annual Report, p.47] |
| Cost of goods sold | 146,306 | 162,535 | [FY2024 Annual Report, p.53]; [FY2025 Annual Report, p.48] |
| Current assets | 163,711 | 206,038 | [FY2024 Annual Report, p.52]; [FY2025 Annual Report, p.47] |
| Net PP&E | 171,036 | 246,597 | [FY2024 Annual Report, p.52]; [FY2025 Annual Report, p.47] |
| Marketable securities | 37,982 | 68,687 | [FY2024 Annual Report, p.52]; [FY2025 Annual Report, p.47] |
| Total assets | 450,256 | 595,281 | [FY2024 Annual Report, p.52]; [FY2025 Annual Report, p.47] |
| Depreciation and amortization | 15,311 | 21,136 | [FY2024 Annual Report, p.56]; [FY2025 Annual Report, p.51] |
| Sales and general & administrative expense | 41,996 | 50,175 | [FY2024 Annual Report, p.53]; [FY2025 Annual Report, p.48] |
| Long-term debt | 10,883 | 46,547 | [FY2024 Annual Report, p.52]; [FY2025 Annual Report, p.47] |
| Current liabilities | 89,122 | 102,745 | [FY2024 Annual Report, p.52]; [FY2025 Annual Report, p.47] |
| CFO | 125,299 | 164,713 | [FY2024 Annual Report, p.56]; [FY2025 Annual Report, p.51] |
| Net income from continuing operations | 100,118 | 132,170 | [FY2024 Annual Report, p.53]; [FY2025 Annual Report, p.48] |
| Inventory | Not separately disclosed | Not separately disclosed | [FY2024 Annual Report, p.52]; [FY2025 Annual Report, p.47] |
| Cash, cash equivalents and marketable securities | 95,657 | 126,843 | [FY2024 Annual Report, p.52]; [FY2025 Annual Report, pp.47, 55] |
| Interest income | 4,482 | 4,337 | [FY2024 Annual Report, p.75]; [FY2025 Annual Report, p.75] |
| Cash taxes paid | 27,353 | 21,526 | [FY2024 Annual Report, p.56]; [FY2025 Annual Report, p.51] |
| Securities issued during FY2025 | — | 64,564 debt proceeds; no equity issuance used in the battery | [FY2025 Annual Report, p.51] |

## 2. Beneish M-Score (A8-14) — computed with python3, computation shown

The Python calculation used the cited FY2024/FY2025 lines above and the published eight-variable formula. Gross margin is (revenue − cost of revenues) / revenue; the FY2025 accrual term is (net income − CFO) / total assets.

| Component | Value FY2025 | Non-manipulator mean | Manipulator zone | Verdict |
|---|---:|---:|---|---|
| DSRI (receivables outrunning sales) | 1.044 | 1.031 | ≥1.465 | Green |
| GMI (gross margin deteriorating) | 0.976 | 1.014 | ≥1.193 | Green |
| AQI (asset quality softening) | 0.722 | 1.039 | ≥1.254 | Green |
| SGI (sales growth pressure) | 1.151 | 1.134 | ≥1.607 | Green |
| DEPI (depreciation rate slowing) | 1.041 | 1.001 | ≥1.077 | Green |
| SGAI (overhead vs sales) | 1.038 | 1.054 | Not banded; negative M-score weight | Green |
| LVGI (leverage rising) | 1.129 | 1.037 | ≥1.111 | Amber |
| TATA (accruals vs assets) | −5.467% | 1.8% | ≥3.1% | Green |

M = −4.84 + 0.920×1.043956 + 0.528×0.975661 + 0.404×0.721565 + 0.892×1.150901 + 0.115×1.040783 − 0.172×1.038106 − 0.327×1.129152 + 4.679×(−0.054668) = **−2.730**.

| Composite / rule | Value | Green band | Amber band | Red band | Verdict |
|---|---:|---|---|---|---|
| M-score | −2.730 | < −2.22 and no component in zone | −2.22 to −1.78 | > −1.78 | Amber — composite is Green, but LVGI is one manipulator-zone component |
| Components in manipulator zone | 1 of 7 banded | 0 | 1–2; composite decides | ≥3 | Amber — single-zone rule; no RF-ACC-001 |

The one weak component is a balance-sheet fact, not a cash-accrual signal: debt and current liabilities grew faster than total assets while Alphabet funded AI infrastructure. It merits a leverage follow-up, but it does not overturn a low M-score or the negative accrual term.

## 3. Dechow F-Score & Accrual Battery (A8-17, A8-18) — computed with python3, computation shown

The complete F-score is **not computable**. Dechow requires change in inventory; neither audited balance sheet separately reports inventory. Treating undisclosed inventory as zero would manufacture a result. This is a data limitation, not evidence that inventory is nil.

| Test | Value | Green band | Red band | Verdict | Evidence |
|---|---:|---|---|---|---|
| Dechow F-score (1.00 = average company) | Not computable; inventory input absent | <1.00 | ≥1.85 | Insufficient Data | [FY2024 Annual Report, p.52]; [FY2025 Annual Report, p.47] |
| RSST accruals / average assets | Not reported because the full operating/financing classification needed for RSST is not a disclosed line item | ≤3% | ≥10% | Insufficient Data | [FY2025 Annual Report, pp.47, 52–57] |
| Soft assets % of total assets | 53.4%, using total assets less cash equivalents and net PP&E | <50% | >65% and rising | Amber — above green band, but down from 56.8% in FY2024 and below red band | [FY2024 Annual Report, p.52]; [FY2025 Annual Report, p.47] |
| Δ receivables / average assets | 2.02% | <2% | ≥5% without an acquisition | Amber — marginally above green band, below red band | [FY2024 Annual Report, p.52]; [FY2025 Annual Report, p.47] |
| Δ inventory / average assets | Not computable | <2% | ≥5% without an acquisition | Insufficient Data | [FY2024 Annual Report, p.52]; [FY2025 Annual Report, p.47] |
| A8-18 — issuance in a flagged year | $64.564bn debt proceeds, but M-score is Green and TATA is −5.467% | None while flagged | Issued while F ≥1.85 or TATA ≥3.1% | Green — no RF-ACC-004 | [FY2025 Annual Report, pp.51, 47–48] |

## 4. Cash Authenticity (A8-19)

| Test | Value | Band | Verdict | Evidence |
|---|---:|---|---|---|
| Interest income ÷ average cash and deposits (implied yield) | 3.898% = $4.337bn ÷ (($95.657bn + $126.843bn) ÷ 2) | Compare with period-matched risk-free rate | Green | [FY2024 Annual Report, pp.52, 75]; [FY2025 Annual Report, pp.47, 55, 75] |
| Period risk-free rate (instrument, source, date) | 3.91%; U.S. 1-year Treasury constant-maturity annual observation for 2025 | Period-matched benchmark | Green | [Federal Reserve Board H.15, RIFLGFCY01.N.A, FY2025 annual observation, accessed 2026-11-03 (web, unverified)] |
| Gap | −0.012 percentage points (about −1bp) | Green within about 150bp; Red if yield <50% of risk-free on material cash | Green | Calculated from the two rows above |
| Cash held in company’s own name at major banks? | Not proven from available data; the filing describes eligible investment holdings, not account-title/custody evidence | Red only for trust/third-party custody | Insufficient Data | [FY2025 Annual Report, pp.54–55] |
| Auditor obtained independent bank confirmations? | Not proven from available data; the audit report describes reasonable assurance, not its individual confirmation procedures | Red if confirmations were not independently obtained | Insufficient Data | [FY2025 Annual Report, pp.44–46] |

The reported return is economically plausible against FY2025 Treasury rates. That supports cash authenticity, but it cannot prove legal title or bank-confirmation procedures from a public audit report.

## 5. Revenue Quality (A8-15)

| Cross-check | FY2024 | FY2025 | Band | Verdict | Evidence |
|---|---:|---:|---|---|---|
| Revenue growth vs cash-taxes-paid growth | Revenue $350.018bn; cash taxes $27.353bn | Revenue $402.836bn (+15.1%); cash taxes $21.526bn (−21.3%) | Red if revenue grows while cash taxes are flat without explanation | Amber — cash taxes fell, but the tax provision rose to $26.656bn and the rate bridge is disclosed; timing cannot be fully separated from the public cash-flow statement | [FY2024 Annual Report, pp.53, 56]; [FY2025 Annual Report, pp.48, 51, 85–87] |
| Collections proxy (revenue − Δ receivables) vs revenue | $345.642bn; 98.75% | $392.290bn; 97.38% | Red if collections are flat while revenue grows | Green — proxy increased $46.648bn, though conversion eased 137bp | [FY2024 Annual Report, pp.52–53]; [FY2025 Annual Report, pp.47–48] |
| Unbilled revenue + contract assets, % of revenue | Not separately quantified | Not separately quantified; receivables include services performed before the right to invoice | Green <10%; Red >25% | Insufficient Data | [FY2025 Annual Report, p.57] |
| Order book: contractually binding or MOU-paper? | N/A | $242.8bn remaining performance obligations in customer contracts, excludes cancellable contracts and contracts with original duration of one year or less | Red if non-binding MOUs are presented as demand | Green — disclosed as contractual commitments, not an MOU pipeline | [FY2025 Annual Report, p.60] |

## 6. Accrual & Conversion Baseline (A8-01, A8-11, A8-12) — figures from earnings/06 where present

| Test | Raw value | Green band | Red band | Trend (3–5y) | Verdict | Evidence |
|---|---:|---|---|---|---|---|
| A8-01 — CFO/PAT | FY2023 137.9%; FY2024 125.2%; FY2025 124.6% | ≥0.8 sustained | <0.6, especially persistent | Down from FY2023 but remains well above 1.0 | Green | [earnings/06_earnings-quality.md, GOOGL, §1.1, 2026-11-03] |
| A8-11 — cash EPS / accounting EPS | FY2023 1.38×; FY2024 1.25×; FY2025 1.25× | About 1.0 | <0.7 | Stable at 1.25× in FY2024–FY2025 | Green | [earnings/06_earnings-quality.md, GOOGL, §1.1, 2026-11-03] |
| A8-12 — CFO/EBITDA | FY2023 105.7%; FY2024 98.1%; FY2025 109.7% | ≥0.7 | <0.5 sustained | Improved in FY2025 | Green | [earnings/06_earnings-quality.md, GOOGL, §1.1, 2026-11-03] |

## 7. Balance-Sheet Hygiene (A8-02, A8-03, A8-04, A8-06)

| Test | Raw value | Green band | Red band | Trend | Verdict | Evidence |
|---|---:|---|---|---|---|---|
| A8-02 — working-capital days | Current assets less current liabilities: $74.589bn / 77.8 days in FY2024; $103.293bn / 93.6 days in FY2025 (+20.3%) | Stable or negative | >20% rise with no disclosed model change | Mechanical red-band growth is driven primarily by $31.186bn more cash and marketable securities, not an identified receivables build | Amber — operational DSO was stable at 52.3 to 52.2 days, but the aggregate measure warrants monitoring | [FY2024 Annual Report, p.52]; [FY2025 Annual Report, p.47]; [earnings/06_earnings-quality.md, GOOGL, §1.2, 2026-11-03] |
| A8-03 — receivables aged >6 months | Net receivables $52.340bn to $62.886bn (+20.1%) vs revenue +15.1%; no aging ladder disclosed; DSO 52.3 to 52.2 days | Minimal, stable, dispersed | Aging rises sharply or is related-party concentrated | Closing receivables outgrew revenue, but DSO was stable | Amber — no evidence of the RF-FIN-002 aging/concentration condition | [FY2024 Annual Report, p.52]; [FY2025 Annual Report, pp.47, 57]; [earnings/06_earnings-quality.md, GOOGL, §1.2, 2026-11-03] |
| A8-04 — expense capitalization | Internal-use software capitalization is not material; pre-technological-feasibility software development is expensed | Conservative and disclosed | Capitalized development/interest rises | No profit-boosting capitalization identified | Green | [FY2025 Annual Report, pp.54, 57] |
| A8-06 — goodwill vs net worth; impairment history | Goodwill $31.885bn / equity $325.084bn = 9.8% in FY2024; $33.380bn / $415.265bn = 8.0% in FY2025; no material impairments disclosed | Modest and tested | Goodwill > net worth or serial impairments | Ratio fell 177bp | Green | [FY2024 Annual Report, p.52]; [FY2025 Annual Report, pp.47, 84] |

## 8. P&L Quality (A8-05, A8-08, A8-09, A8-10)

| Test | Raw value | Green band | Red band | Trend | Verdict | Evidence |
|---|---:|---|---|---|---|---|
| A8-05 — exceptionals frequency; other income % of PBT | Other income and expense was 1.7% of PBT in FY2023, 6.2% in FY2024, and 18.8% ($29.787bn / $158.826bn) in FY2025; FY2025 included a $24.080bn net gain on equity securities | Rare; <10% or clearly treasury | Recurrent “one-offs,” or >⅓ of PBT | Materially higher in FY2025 | Amber — well below the red band but earnings are more exposed to marked-to-market gains | [FY2025 Annual Report, pp.48, 75]; [FY2024 Annual Report, pp.53, 75] |
| A8-08 — depreciation charge vs asset base | D&A $11.946bn, $15.311bn, $21.136bn in FY2023–FY2025; net PP&E also grew from $134.345bn to $171.036bn to $246.597bn | Charge tracks asset base | Large unexplained charge drop | Charge rose with the asset base | Green | [FY2024 Annual Report, pp.52, 56]; [FY2025 Annual Report, pp.47, 51] |
| A8-09 — provisioning adequacy | Allowance for doubtful accounts $0.879bn / net AR $52.340bn = 1.68% in FY2024; $0.924bn / $62.886bn = 1.47% in FY2025 | Coverage stable versus history and peers | Releases fund earnings | Coverage fell 21bp while receivables rose | Amber — no disclosed reserve release, but monitor the lower coverage ratio | [FY2024 Annual Report, pp.52, 73]; [FY2025 Annual Report, pp.47, 73, 94] |
| A8-10 — effective tax rate vs statutory | Effective tax rate 16.4% in FY2024 and 16.8% in FY2025 versus 21% U.S. federal statutory; FY2025 bridge identifies FDII −2.5pp, tax credits −2.4pp, stock-based compensation −1.6pp and other items | Near statutory or fully explained | Persistently far below, unexplained | Rate increased 40bp and reconciliation is specific | Green | [FY2024 Annual Report, p.86]; [FY2025 Annual Report, pp.85–87] |

## 9. Policy, Estimate & Perimeter Stability (A8-07, A8-13, A8-16)

| Test | Finding | Green band | Red band | Verdict | Evidence |
|---|---|---|---|---|---|
| A8-07 — policy / estimate / year-end changes | FY2025 policy note describes normal adoption of new standards; no fiscal-year-end change or material profit-boosting policy change identified. | Stable | Profit-boosting changes or year-end change muddying comparability | Green | [FY2025 Annual Report, pp.52–57] |
| A8-13 — consolidation perimeter | Alphabet consolidates controlled subsidiaries and variable-interest entities where it is primary beneficiary; intercompany balances are eliminated. No disclosed weak-unit deconsolidation or engineered associate treatment identified. | Stable and explained | Entity churn or weak units deconsolidated | Green | [FY2025 Annual Report, pp.52–54] |
| A8-16 — segment / geography disclosure shifts | Google Services, Google Cloud and Other Bets remain reportable segments; no segment merger was disclosed alongside a deterioration. | Stable or visibility-improving | Segments merged/redefined when a key segment deteriorates | Green | [FY2025 Annual Report, p.88] |

## 10. Regulator-Found Divergence (A8-20) — swept per frameworks/GOVERNANCE_DATABASES.md

| Check | Finding | Red band | Verdict | Evidence |
|---|---|---|---|---|
| Regulator inspection divergence vs reported numbers | The documented SEC web searches did not identify an Alphabet/Google accounting-enforcement release or a regulator-required restatement in the returned results. A 2019 SEC correspondence result was an extension request, not a finding of accounting divergence. The search is not a complete regulator-history database. | Any material divergence | Insufficient Data — coverage-limited; no RF-ACC-005 | [SEC search results, queries logged below, 2026-11-03 (web, unverified)] |
| Lender- or regulator-directed forensic audit | No Alphabet/Google directed forensic audit was identified in the documented SEC web search. Absence cannot be asserted beyond this coverage. | Any directed forensic audit | Insufficient Data — coverage-limited; no RF-ACC-005 | [SEC search results, queries logged below, 2026-11-03 (web, unverified)] |

## 11. Leverage & Advances Hygiene (A14-01, A14-02) — debt stack from balance-sheet-survival/01 where present

| Test | Raw value (basis labeled per §15) | Green band | Red band | Trend | Verdict | Evidence |
|---|---:|---|---|---|---|---|
| A14-01 — net debt / EBITDA (governance lens) | Strict net debt $73.489bn, including finance leases, / LTM EBITDA $185.516bn = 0.40× | Net cash or <0.5× | >3×, or leverage rising to fund promoter objectives | Strict leverage rose as financing was used for AI infrastructure, but remains below 0.5× | Green | [balance-sheet-survival/01_capital-structure-and-leverage.md, GOOGL, §1, 2026-11-03]; [CIQ Financials, LTM EBITDA 12 months Sep-30-2026, ciq_facts.json source_ref, 2026-11-03] |
| A14-02 — loans & advances % of total assets | Not separately disclosed; no loans-and-advances line was found in FY2025 balance sheet or the supplied debt-stack output. | <2%, ordinary-course | >5%, rising, or advanced to non-repaying parties | Not assessable | Not Applicable (no data) | [FY2025 Annual Report, pp.47, 52–57]; [balance-sheet-survival/01_capital-structure-and-leverage.md, GOOGL, §§1–2, 2026-11-03] |

## 12. Forensics Read

The computable battery is reassuring: FY2025 Beneish M-score is −2.730, below the −2.22 Green cutoff, and CFO was 124.6% of reported profit. The single worst measured signal is leverage growth (LVGI 1.129), which rhymes with a debt-funded-investment risk rather than an accrual-manipulation pattern; it is not enough for a red flag. Cash appears economically real because its 3.90% implied yield matches the FY2025 1-year Treasury rate of 3.91%, but public documents do not prove bank-account title or audit confirmations. A rational minority holder should treat the books as low apparent manipulation risk, while demanding the next annual filing disclose enough inventory/operating-asset data to complete Dechow’s F-score and monitoring receivables coverage and investment gains.

## Sweep Log

| Database | Query | Date | Results | Attributed? (identifier used) | Coverage note |
|---|---|---:|---:|---|---|
| U.S. SEC web search | site:sec.gov/litigation/accounting-auditing Alphabet Inc Google AAER | 2026-11-03 | 0 directly attributable AAER results returned | No | Search-result coverage only; not a complete historical enforcement database |
| U.S. SEC web search | site:sec.gov Alphabet Inc “Accounting and Auditing Enforcement Release” | 2026-11-03 | 0 directly attributable results returned | No | Search-result coverage only |
| U.S. SEC web search | site:sec.gov Alphabet Inc “forensic audit” | 2026-11-03 | 0 directly attributable results returned | No | Search-result coverage only |
| U.S. SEC comment letters | site:sec.gov Alphabet Inc “comment letter” 10-K | 2026-11-03 | 1 2019 correspondence extension result; no accounting-divergence conclusion in returned item | No | Does not establish absence of later or other correspondence |
| Federal Reserve Board H.15 | RIFLGFCY01.N.A, 1-year Treasury constant maturity annual rate | 2026-11-03 | FY2025: 3.91% | N/A | Period-matched annual web observation; used only as cash-yield benchmark |

## Universal Findings Table

| Finding ID | Section | Question / Test | Standardized Verdict | Raw Value | Unit | Current Period | Prior Period | Trend | Peer Benchmark | Peer Verdict | Score | Max Score | Penalty | Confidence 1–5 | Materiality | Evidence | As-of Date | Analyst Interpretation | Red Flag Triggered? | Red Flag ID | Follow-up Required |
|---|---|---|---|---:|---|---|---|---|---|---|---:|---:|---:|---:|---|---|---|---|---|---|---|
| 11-001 | A8 | A8-01 — CFO/PAT | Green | 124.6 | % | FY2025 | 125.2% | Stable | No peer set | Not assessed | 0 | 25 | 0 | 5 | High | [earnings/06_earnings-quality.md, §1.1] | 2026-11-03 | Cash profit exceeds accounting profit. | No | — | — |
| 11-002 | A8 | A8-02 — working-capital days | Amber | 93.6 | days | FY2025 | 77.8 days | +20.3% | No peer set | Not assessed | 2 | 20 | 0 | 4 | Medium | [FY2024 Annual Report, p.52]; [FY2025 Annual Report, p.47] | 2026-11-03 | Increase reflects cash/securities, while DSO is stable. | No | — | Explain FY2026 liquid-asset and operating-WC movements separately. |
| 11-003 | A8 | A8-03 — receivables aged >6 months | Amber | 62,886 | USD m | FY2025 | 52,340 | +20.1% vs revenue +15.1% | No peer set | Not assessed | 2 | 20 | 0 | 4 | Medium | [FY2025 Annual Report, pp.47,57]; [earnings/06_earnings-quality.md, §1.2] | 2026-11-03 | No aging ladder; stable DSO softens the signal. | No | — | Request aging and customer-concentration disclosure. |
| 11-004 | A8 | A8-04 — expense capitalization | Green | Not material | policy | FY2025 | FY2024 | Stable | No peer set | Not assessed | 0 | 20 | 0 | 5 | Medium | [FY2025 Annual Report, pp.54,57] | 2026-11-03 | Internal-use software capitalization is not material. | No | — | — |
| 11-005 | A8 | A8-05 — other income / PBT | Amber | 18.8 | % | FY2025 | 6.2% | Rising | No peer set | Not assessed | 2 | 10 | 0 | 5 | Medium | [FY2025 Annual Report, pp.48,75] | 2026-11-03 | Equity-security gains lift reported income but are disclosed. | No | — | Separate operating profit from investment gains in forecasts. |
| 11-006 | A8 | A8-06 — goodwill / equity | Green | 8.0 | % | FY2025 | 9.8% | Improving | No peer set | Not assessed | 0 | 20 | 0 | 5 | Medium | [FY2025 Annual Report, pp.47,84] | 2026-11-03 | Low and falling goodwill burden; no material impairment pattern. | No | — | — |
| 11-007 | A8 | A8-07 — policy / estimate / year-end changes | Green | 0 | material changes identified | FY2025 | FY2024 | Stable | No peer set | Not assessed | 0 | 10 | 0 | 4 | Medium | [FY2025 Annual Report, pp.52–57] | 2026-11-03 | No identified profit-boosting policy or fiscal-year change. | No | — | — |
| 11-008 | A8 | A8-08 — depreciation versus asset base | Green | 21,136 | USD m | FY2025 | 15,311 | Rising with PP&E | No peer set | Not assessed | 0 | 10 | 0 | 5 | Medium | [FY2025 Annual Report, pp.47,51] | 2026-11-03 | Depreciation rose with PP&E. | No | — | — |
| 11-009 | A8 | A8-09 — provisioning adequacy | Amber | 1.47 | % of net AR | FY2025 | 1.68% | −21bp | No peer set | Not assessed | 1 | 10 | 0 | 4 | Medium | [FY2025 Annual Report, pp.47,73,94] | 2026-11-03 | No reserve release, but allowance coverage fell. | No | — | Track allowance and charge-offs against receivables growth. |
| 11-010 | A8 | A8-10 — effective tax rate | Green | 16.8 | % | FY2025 | 16.4% | +40bp | U.S. statutory 21% | Explained | 0 | 10 | 0 | 5 | Medium | [FY2025 Annual Report, pp.85–87] | 2026-11-03 | Below statutory rate but reconciled by named items. | No | — | — |
| 11-011 | A8 | A8-11 — cash EPS / accounting EPS | Green | 1.25 | x | FY2025 | 1.25x | Stable | No peer set | Not assessed | 0 | 25 | 0 | 5 | High | [earnings/06_earnings-quality.md, §1.1] | 2026-11-03 | Cash EPS exceeds accounting EPS. | No | — | — |
| 11-012 | A8 | A8-12 — CFO/EBITDA | Green | 109.7 | % | FY2025 | 98.1% | Improving | No peer set | Not assessed | 0 | 25 | 0 | 5 | High | [earnings/06_earnings-quality.md, §1.1] | 2026-11-03 | Cash conversion of EBITDA is high. | No | — | — |
| 11-013 | A8 | A8-13 — consolidation perimeter | Green | 0 | adverse changes identified | FY2025 | FY2024 | Stable | No peer set | Not assessed | 0 | 20 | 0 | 4 | Medium | [FY2025 Annual Report, pp.52–54] | 2026-11-03 | Consolidation policy and elimination practice disclosed. | No | — | — |
| 11-014 | A8 | A8-14 — Beneish M-score | Amber | −2.730 | score | FY2025 | N/A | One LVGI zone | M Green <−2.22 | Green composite | 1 | 25 | 0 | 5 | High | [FY2024 Annual Report, pp.52–56]; [FY2025 Annual Report, pp.47–51] | 2026-11-03 | Composite clears Green; one leverage component is Amber. | No | — | Monitor debt growth against asset growth. |
| 11-015 | A8 | A8-15 — revenue quality | Amber | 97.38 | collections proxy % revenue | FY2025 | 98.75% | −137bp | No peer set | Not assessed | 4 | 15 | 0 | 4 | High | [FY2025 Annual Report, pp.47–48,51,57,60] | 2026-11-03 | Collections grew, but cash taxes fell and contract assets are not quantified. | No | — | Request unbilled-revenue/contract-asset amount. |
| 11-016 | A8 | A8-16 — segment disclosure shifts | Green | 3 | reportable segments | FY2025 | 3 | Stable | No peer set | Not assessed | 0 | 10 | 0 | 5 | Medium | [FY2025 Annual Report, p.88] | 2026-11-03 | No deterioration-timed segment merger identified. | No | — | — |
| 11-017 | A8 | A8-17 — Dechow F-score / accrual battery | Insufficient Data | N/A | score | FY2025 | FY2024 | N/A | F <1 Green | Not assessed | 3 | 25 | 0 | 5 | High | [FY2024 Annual Report, p.52]; [FY2025 Annual Report, p.47] | 2026-11-03 | Inventory is undisclosed; a complete F-score would be fabricated. | No | — | Complete F-score only if inventory or equivalent input is disclosed. |
| 11-018 | A8 | A8-18 — issuance in flagged year | Green | 64,564 | USD m debt proceeds | FY2025 | N/A | New debt | No issue while flagged | Green | 0 | 25 | 0 | 5 | Medium | [FY2025 Annual Report, p.51] | 2026-11-03 | Debt issued, but no flagged M/TATA condition. | No | — | — |
| 11-019 | A8 | A8-19 — cash authenticity | Amber | 3.898 | implied yield % | FY2025 | N/A | Within −1bp of risk-free | 3.91% 1Y UST | In line | 2 | 15 | 0 | 3 | High | [FY2025 Annual Report, pp.44–46,47,55,75]; [Federal Reserve Board H.15, 2025 annual, web] | 2026-11-03 | Yield is plausible; legal title and confirmation procedures are not public. | No | — | Check audited-bank confirmation evidence if it becomes available. |
| 11-020 | A8 | A8-20 — regulator-found divergence | Insufficient Data | 0 | identified eligible events | 2026-11-03 sweep | N/A | Coverage-limited | U.S. SEC | Not assessed | 0 | 10 | 0 | 2 | High | [SEC search sweep log, 2026-11-03] | 2026-11-03 | No result in logged searches is not proof of no event. | No | — | Re-run against a complete SEC enforcement/comment-letter corpus. |
| 11-021 | A14 | A14-01 — strict net debt / EBITDA | Green | 0.40 | x | LTM Sep-2026 | FY2025 net cash before recent borrowing | Rising leverage | <0.5x | Green | 2 | 15 | 0 | 4 | High | [balance-sheet-survival/01_capital-structure-and-leverage.md, §1]; [CIQ Financials, LTM EBITDA Sep-30-2026] | 2026-11-03 | Strict leverage is below Green threshold despite financing growth. | No | — | Monitor debt funding and strict leverage as capex rises. |
| 11-022 | A14 | A14-02 — loans & advances / assets | Not Applicable | N/A | % | FY2025 | FY2024 | Not assessable | <2% | Not assessed | 0 | 15 | 0 | 4 | Medium | [FY2025 Annual Report, pp.47,52–57] | 2026-11-03 | No separately disclosed loans-and-advances balance. | No | — | Seek a footnote or ledger with the balance and counterparties. |

## Accounting-Forensics Risk Score (INVERTED — higher = WORSE)

| Component | Score | Max Score | Evidence |
|---|---:|---:|---|
| Accrual battery — Beneish + Dechow (A8-01, A8-11, A8-12, A8-14, A8-17, A8-18) | 4 | 25 | M-score −2.730 and cash conversion are clear; F-score cannot be completed because inventory is undisclosed. |
| Cash authenticity (A8-19) | 2 | 15 | Implied yield 3.898% versus 3.91% risk-free; public sources do not prove account title or confirmations. |
| Revenue quality (A8-15) | 4 | 15 | Collections proxy rose with revenue, but cash taxes fell and contract assets are not quantified. |
| Balance-sheet hygiene — WC creep, receivables ageing, capitalization, goodwill, consolidation (A8-02, A8-03, A8-04, A8-06, A8-13) | 6 | 20 | Operating DSO stable; aggregate WC days and receivables outgrew revenue, while policy/goodwill/perimeter checks are clean. |
| P&L quality & policy stability (A8-05, A8-07, A8-08, A8-09, A8-10, A8-16, A8-20) | 5 | 10 | Investment gains raised other income; allowance coverage eased; regulator sweep is coverage-limited. |
| Leverage & advances hygiene (A14-01, A14-02) | 2 | 15 | Strict net debt/EBITDA 0.40×; loans/advances balance is not separately disclosed. |
| **Total** | **23** | **100** | **No battery/cash-authenticity risk floor applies.** |

## Source Log

| Source ID | Source Type | Filename / Filing | Period | Page / Section | Date | Confidence 1–5 | Used For |
|---|---|---|---|---|---|---:|---|
| S1 | Audited filing | Alphabet FY2025 Annual Report | FY2025 | pp.44–60, 71–75, 84–88, 94 | FY ended 2025-12-31 | 5 | Financial statements, cash, revenue, debt, policies, goodwill, taxes, segments |
| S2 | Audited filing | Alphabet FY2024 Annual Report | FY2024 | pp.52–56, 75, 86 | FY ended 2024-12-31 | 5 | Comparative financial statements, cash flow, tax and other income |
| S3 | Cross-module analysis | earnings/06_earnings-quality.md | FY2023–FY2025 | §§1.1–1.2 | 2026-11-03 | 4 | CFO/PAT, cash EPS, CFO/EBITDA, DSO |
| S4 | Cross-module analysis | balance-sheet-survival/01_capital-structure-and-leverage.md | LTM Sep-2026 | §§1–2 | 2026-11-03 | 4 | Strict net debt and leverage context |
| S5 | Tier-5 vendor sidecar | ciq_facts.json — CIQ Financials | LTM Sep-2026 | ltm_ebitda_m source_ref | 2026-11-03 | 4 | $185.516bn LTM EBITDA used with S4 |
| S6 | Official data webpage | Federal Reserve Board H.15 | FY2025 | RIFLGFCY01.N.A | accessed 2026-11-03 | 2 | Period-matched 1-year Treasury rate |
| S7 | Official regulator web search | U.S. SEC | Historical | Search queries in Sweep Log | accessed 2026-11-03 | 2 | Coverage-limited A8-20 sweep |

## Machine-Readable Findings

```json
[
  {"finding_id":"11-001","ticker":"GOOGL","date":"2026-11-03","agent":"accounting-forensics","section":"A8","question":"A8-01 CFO/PAT","standardized_verdict":"Green","raw_value":124.6,"unit":"%","current_period":"FY2025","prior_period":"125.2%","trend":"Stable","peer_benchmark":"No peer set","peer_verdict":"Not assessed","score":0,"max_score":25,"penalty":0,"confidence_1_to_5":5,"materiality":"High","evidence":"[earnings/06_earnings-quality.md, §1.1]","source_id":"S3","source_type":"Cross-module analysis","source_date":"2026-11-03","as_of_date":"2026-11-03","analyst_interpretation":"Cash profit exceeds accounting profit.","red_flag_triggered":false,"red_flag_id":"","follow_up_required":""},
  {"finding_id":"11-002","ticker":"GOOGL","date":"2026-11-03","agent":"accounting-forensics","section":"A8","question":"A8-02 working-capital days","standardized_verdict":"Amber","raw_value":93.6,"unit":"days","current_period":"FY2025","prior_period":"77.8 days","trend":"+20.3%","peer_benchmark":"No peer set","peer_verdict":"Not assessed","score":2,"max_score":20,"penalty":0,"confidence_1_to_5":4,"materiality":"Medium","evidence":"[FY2024 Annual Report, p.52]; [FY2025 Annual Report, p.47]","source_id":"S1/S2","source_type":"Audited filing","source_date":"FY2025","as_of_date":"2026-11-03","analyst_interpretation":"Cash and securities drove most aggregate working-capital growth.","red_flag_triggered":false,"red_flag_id":"","follow_up_required":"Explain FY2026 operating-WC movements separately."},
  {"finding_id":"11-003","ticker":"GOOGL","date":"2026-11-03","agent":"accounting-forensics","section":"A8","question":"A8-03 receivables aging","standardized_verdict":"Amber","raw_value":62886,"unit":"USD m","current_period":"FY2025","prior_period":"52340","trend":"+20.1%","peer_benchmark":"No peer set","peer_verdict":"Not assessed","score":2,"max_score":20,"penalty":0,"confidence_1_to_5":4,"materiality":"Medium","evidence":"[FY2025 Annual Report, pp.47,57]; [earnings/06_earnings-quality.md, §1.2]","source_id":"S1/S3","source_type":"Audited filing / cross-module","source_date":"FY2025","as_of_date":"2026-11-03","analyst_interpretation":"Stable DSO offsets, but does not eliminate, receivables growth concern.","red_flag_triggered":false,"red_flag_id":"","follow_up_required":"Request aging and customer concentration."},
  {"finding_id":"11-004","ticker":"GOOGL","date":"2026-11-03","agent":"accounting-forensics","section":"A8","question":"A8-04 expense capitalization","standardized_verdict":"Green","raw_value":null,"unit":"policy","current_period":"FY2025","prior_period":"FY2024","trend":"Stable","peer_benchmark":"No peer set","peer_verdict":"Not assessed","score":0,"max_score":20,"penalty":0,"confidence_1_to_5":5,"materiality":"Medium","evidence":"[FY2025 Annual Report, pp.54,57]","source_id":"S1","source_type":"Audited filing","source_date":"FY2025","as_of_date":"2026-11-03","analyst_interpretation":"Internal-use software capitalization is not material.","red_flag_triggered":false,"red_flag_id":"","follow_up_required":""},
  {"finding_id":"11-005","ticker":"GOOGL","date":"2026-11-03","agent":"accounting-forensics","section":"A8","question":"A8-05 other income/PBT","standardized_verdict":"Amber","raw_value":18.8,"unit":"%","current_period":"FY2025","prior_period":"6.2%","trend":"Rising","peer_benchmark":"No peer set","peer_verdict":"Not assessed","score":2,"max_score":10,"penalty":0,"confidence_1_to_5":5,"materiality":"Medium","evidence":"[FY2025 Annual Report, pp.48,75]","source_id":"S1","source_type":"Audited filing","source_date":"FY2025","as_of_date":"2026-11-03","analyst_interpretation":"Equity-security gains are material but disclosed.","red_flag_triggered":false,"red_flag_id":"","follow_up_required":"Separate operating profit from investment gains."},
  {"finding_id":"11-006","ticker":"GOOGL","date":"2026-11-03","agent":"accounting-forensics","section":"A8","question":"A8-06 goodwill/equity","standardized_verdict":"Green","raw_value":8.0,"unit":"%","current_period":"FY2025","prior_period":"9.8%","trend":"Improving","peer_benchmark":"No peer set","peer_verdict":"Not assessed","score":0,"max_score":20,"penalty":0,"confidence_1_to_5":5,"materiality":"Medium","evidence":"[FY2025 Annual Report, pp.47,84]","source_id":"S1","source_type":"Audited filing","source_date":"FY2025","as_of_date":"2026-11-03","analyst_interpretation":"Goodwill is modest relative to equity.","red_flag_triggered":false,"red_flag_id":"","follow_up_required":""},
  {"finding_id":"11-007","ticker":"GOOGL","date":"2026-11-03","agent":"accounting-forensics","section":"A8","question":"A8-07 policy stability","standardized_verdict":"Green","raw_value":0,"unit":"material adverse changes","current_period":"FY2025","prior_period":"FY2024","trend":"Stable","peer_benchmark":"No peer set","peer_verdict":"Not assessed","score":0,"max_score":10,"penalty":0,"confidence_1_to_5":4,"materiality":"Medium","evidence":"[FY2025 Annual Report, pp.52–57]","source_id":"S1","source_type":"Audited filing","source_date":"FY2025","as_of_date":"2026-11-03","analyst_interpretation":"No material profit-boosting accounting change identified.","red_flag_triggered":false,"red_flag_id":"","follow_up_required":""},
  {"finding_id":"11-008","ticker":"GOOGL","date":"2026-11-03","agent":"accounting-forensics","section":"A8","question":"A8-08 depreciation versus asset base","standardized_verdict":"Green","raw_value":21136,"unit":"USD m","current_period":"FY2025","prior_period":"15311","trend":"Rising with PP&E","peer_benchmark":"No peer set","peer_verdict":"Not assessed","score":0,"max_score":10,"penalty":0,"confidence_1_to_5":5,"materiality":"Medium","evidence":"[FY2025 Annual Report, pp.47,51]","source_id":"S1","source_type":"Audited filing","source_date":"FY2025","as_of_date":"2026-11-03","analyst_interpretation":"Depreciation tracked the growing asset base.","red_flag_triggered":false,"red_flag_id":"","follow_up_required":""},
  {"finding_id":"11-009","ticker":"GOOGL","date":"2026-11-03","agent":"accounting-forensics","section":"A8","question":"A8-09 provisioning","standardized_verdict":"Amber","raw_value":1.47,"unit":"% of net AR","current_period":"FY2025","prior_period":"1.68%","trend":"-21bp","peer_benchmark":"No peer set","peer_verdict":"Not assessed","score":1,"max_score":10,"penalty":0,"confidence_1_to_5":4,"materiality":"Medium","evidence":"[FY2025 Annual Report, pp.47,73,94]","source_id":"S1","source_type":"Audited filing","source_date":"FY2025","as_of_date":"2026-11-03","analyst_interpretation":"Coverage eased without a disclosed reserve release.","red_flag_triggered":false,"red_flag_id":"","follow_up_required":"Track allowance and charge-offs."},
  {"finding_id":"11-010","ticker":"GOOGL","date":"2026-11-03","agent":"accounting-forensics","section":"A8","question":"A8-10 effective tax rate","standardized_verdict":"Green","raw_value":16.8,"unit":"%","current_period":"FY2025","prior_period":"16.4%","trend":"+40bp","peer_benchmark":"U.S. statutory 21%","peer_verdict":"Explained","score":0,"max_score":10,"penalty":0,"confidence_1_to_5":5,"materiality":"Medium","evidence":"[FY2025 Annual Report, pp.85–87]","source_id":"S1","source_type":"Audited filing","source_date":"FY2025","as_of_date":"2026-11-03","analyst_interpretation":"Below statutory but fully reconciled.","red_flag_triggered":false,"red_flag_id":"","follow_up_required":""},
  {"finding_id":"11-011","ticker":"GOOGL","date":"2026-11-03","agent":"accounting-forensics","section":"A8","question":"A8-11 cash EPS/accounting EPS","standardized_verdict":"Green","raw_value":1.25,"unit":"x","current_period":"FY2025","prior_period":"1.25x","trend":"Stable","peer_benchmark":"No peer set","peer_verdict":"Not assessed","score":0,"max_score":25,"penalty":0,"confidence_1_to_5":5,"materiality":"High","evidence":"[earnings/06_earnings-quality.md, §1.1]","source_id":"S3","source_type":"Cross-module analysis","source_date":"2026-11-03","as_of_date":"2026-11-03","analyst_interpretation":"Cash EPS exceeds accounting EPS.","red_flag_triggered":false,"red_flag_id":"","follow_up_required":""},
  {"finding_id":"11-012","ticker":"GOOGL","date":"2026-11-03","agent":"accounting-forensics","section":"A8","question":"A8-12 CFO/EBITDA","standardized_verdict":"Green","raw_value":109.7,"unit":"%","current_period":"FY2025","prior_period":"98.1%","trend":"Improving","peer_benchmark":"No peer set","peer_verdict":"Not assessed","score":0,"max_score":25,"penalty":0,"confidence_1_to_5":5,"materiality":"High","evidence":"[earnings/06_earnings-quality.md, §1.1]","source_id":"S3","source_type":"Cross-module analysis","source_date":"2026-11-03","as_of_date":"2026-11-03","analyst_interpretation":"Cash conversion improved.","red_flag_triggered":false,"red_flag_id":"","follow_up_required":""},
  {"finding_id":"11-013","ticker":"GOOGL","date":"2026-11-03","agent":"accounting-forensics","section":"A8","question":"A8-13 consolidation perimeter","standardized_verdict":"Green","raw_value":0,"unit":"adverse changes identified","current_period":"FY2025","prior_period":"FY2024","trend":"Stable","peer_benchmark":"No peer set","peer_verdict":"Not assessed","score":0,"max_score":20,"penalty":0,"confidence_1_to_5":4,"materiality":"Medium","evidence":"[FY2025 Annual Report, pp.52–54]","source_id":"S1","source_type":"Audited filing","source_date":"FY2025","as_of_date":"2026-11-03","analyst_interpretation":"No disclosed perimeter-engineering signal.","red_flag_triggered":false,"red_flag_id":"","follow_up_required":""},
  {"finding_id":"11-014","ticker":"GOOGL","date":"2026-11-03","agent":"accounting-forensics","section":"A8","question":"A8-14 Beneish M-score","standardized_verdict":"Amber","raw_value":-2.73,"unit":"score","current_period":"FY2025","prior_period":"N/A","trend":"One LVGI zone","peer_benchmark":"M Green < -2.22","peer_verdict":"Green composite","score":1,"max_score":25,"penalty":0,"confidence_1_to_5":5,"materiality":"High","evidence":"[FY2024 Annual Report, pp.52–56]; [FY2025 Annual Report, pp.47–51]","source_id":"S1/S2","source_type":"Audited filing","source_date":"FY2025","as_of_date":"2026-11-03","analyst_interpretation":"Composite clears Green; one leverage component is in zone.","red_flag_triggered":false,"red_flag_id":"","follow_up_required":"Monitor debt growth."},
  {"finding_id":"11-015","ticker":"GOOGL","date":"2026-11-03","agent":"accounting-forensics","section":"A8","question":"A8-15 revenue quality","standardized_verdict":"Amber","raw_value":97.38,"unit":"collections proxy % revenue","current_period":"FY2025","prior_period":"98.75%","trend":"-137bp","peer_benchmark":"No peer set","peer_verdict":"Not assessed","score":4,"max_score":15,"penalty":0,"confidence_1_to_5":4,"materiality":"High","evidence":"[FY2025 Annual Report, pp.47–48,51,57,60]","source_id":"S1","source_type":"Audited filing","source_date":"FY2025","as_of_date":"2026-11-03","analyst_interpretation":"Collections rise, but taxes decline and contract assets are unquantified.","red_flag_triggered":false,"red_flag_id":"","follow_up_required":"Request contract-asset disclosure."},
  {"finding_id":"11-016","ticker":"GOOGL","date":"2026-11-03","agent":"accounting-forensics","section":"A8","question":"A8-16 segment disclosure","standardized_verdict":"Green","raw_value":3,"unit":"reportable segments","current_period":"FY2025","prior_period":"3","trend":"Stable","peer_benchmark":"No peer set","peer_verdict":"Not assessed","score":0,"max_score":10,"penalty":0,"confidence_1_to_5":5,"materiality":"Medium","evidence":"[FY2025 Annual Report, p.88]","source_id":"S1","source_type":"Audited filing","source_date":"FY2025","as_of_date":"2026-11-03","analyst_interpretation":"No concealment by segment merger identified.","red_flag_triggered":false,"red_flag_id":"","follow_up_required":""},
  {"finding_id":"11-017","ticker":"GOOGL","date":"2026-11-03","agent":"accounting-forensics","section":"A8","question":"A8-17 Dechow F-score","standardized_verdict":"Insufficient Data","raw_value":null,"unit":"score","current_period":"FY2025","prior_period":"FY2024","trend":"Not computable","peer_benchmark":"F <1 Green","peer_verdict":"Not assessed","score":3,"max_score":25,"penalty":0,"confidence_1_to_5":5,"materiality":"High","evidence":"[FY2024 Annual Report, p.52]; [FY2025 Annual Report, p.47]","source_id":"S1/S2","source_type":"Audited filing","source_date":"FY2025","as_of_date":"2026-11-03","analyst_interpretation":"Inventory input absent; no composite was imputed.","red_flag_triggered":false,"red_flag_id":"","follow_up_required":"Complete only with a disclosed inventory input."},
  {"finding_id":"11-018","ticker":"GOOGL","date":"2026-11-03","agent":"accounting-forensics","section":"A8","question":"A8-18 issuance in flagged year","standardized_verdict":"Green","raw_value":64564,"unit":"USD m debt proceeds","current_period":"FY2025","prior_period":"N/A","trend":"New debt","peer_benchmark":"No issue while flagged","peer_verdict":"Green","score":0,"max_score":25,"penalty":0,"confidence_1_to_5":5,"materiality":"Medium","evidence":"[FY2025 Annual Report, p.51]","source_id":"S1","source_type":"Audited filing","source_date":"FY2025","as_of_date":"2026-11-03","analyst_interpretation":"No M/TATA flagged condition accompanies issuance.","red_flag_triggered":false,"red_flag_id":"","follow_up_required":""},
  {"finding_id":"11-019","ticker":"GOOGL","date":"2026-11-03","agent":"accounting-forensics","section":"A8","question":"A8-19 cash authenticity","standardized_verdict":"Amber","raw_value":3.898,"unit":"implied yield %","current_period":"FY2025","prior_period":"N/A","trend":"Within -1bp of risk-free","peer_benchmark":"3.91% 1Y Treasury","peer_verdict":"In line","score":2,"max_score":15,"penalty":0,"confidence_1_to_5":3,"materiality":"High","evidence":"[FY2025 Annual Report, pp.44–46,47,55,75]; [Federal Reserve Board H.15, 2025 annual]","source_id":"S1/S6","source_type":"Audited filing / official web data","source_date":"2026-11-03","as_of_date":"2026-11-03","analyst_interpretation":"Yield is plausible but custody and confirmations are not public.","red_flag_triggered":false,"red_flag_id":"","follow_up_required":"Check confirmation/title evidence if available."},
  {"finding_id":"11-020","ticker":"GOOGL","date":"2026-11-03","agent":"accounting-forensics","section":"A8","question":"A8-20 regulator-found divergence","standardized_verdict":"Insufficient Data","raw_value":0,"unit":"identified eligible events","current_period":"2026-11-03 sweep","prior_period":"N/A","trend":"Coverage-limited","peer_benchmark":"U.S. SEC","peer_verdict":"Not assessed","score":0,"max_score":10,"penalty":0,"confidence_1_to_5":2,"materiality":"High","evidence":"[SEC search sweep log, 2026-11-03]","source_id":"S7","source_type":"Official regulator web search","source_date":"2026-11-03","as_of_date":"2026-11-03","analyst_interpretation":"No result is not proof of absence.","red_flag_triggered":false,"red_flag_id":"","follow_up_required":"Use complete enforcement/comment-letter corpus."},
  {"finding_id":"11-021","ticker":"GOOGL","date":"2026-11-03","agent":"accounting-forensics","section":"A14","question":"A14-01 strict net debt/EBITDA","standardized_verdict":"Green","raw_value":0.4,"unit":"x","current_period":"LTM Sep-2026","prior_period":"FY2025 net cash before borrowing","trend":"Rising leverage","peer_benchmark":"<0.5x","peer_verdict":"Green","score":2,"max_score":15,"penalty":0,"confidence_1_to_5":4,"materiality":"High","evidence":"[balance-sheet-survival/01_capital-structure-and-leverage.md, §1]; [CIQ Financials, LTM EBITDA Sep-30-2026]","source_id":"S4/S5","source_type":"Cross-module / vendor sidecar","source_date":"2026-11-03","as_of_date":"2026-11-03","analyst_interpretation":"Strict leverage remains below threshold.","red_flag_triggered":false,"red_flag_id":"","follow_up_required":"Monitor capex debt funding."},
  {"finding_id":"11-022","ticker":"GOOGL","date":"2026-11-03","agent":"accounting-forensics","section":"A14","question":"A14-02 loans and advances/assets","standardized_verdict":"Not Applicable","raw_value":null,"unit":"%","current_period":"FY2025","prior_period":"FY2024","trend":"Not assessable","peer_benchmark":"<2%","peer_verdict":"Not assessed","score":0,"max_score":15,"penalty":0,"confidence_1_to_5":4,"materiality":"Medium","evidence":"[FY2025 Annual Report, pp.47,52–57]","source_id":"S1","source_type":"Audited filing","source_date":"FY2025","as_of_date":"2026-11-03","analyst_interpretation":"No separately disclosed loans-and-advances balance.","red_flag_triggered":false,"red_flag_id":"","follow_up_required":"Seek footnote or ledger balance."}
]
```

### forensics_battery.json

```json
{
  "computable": false,
  "sector_excluded": false,
  "m_score": -2.730185,
  "m_components": {"DSRI":1.043956,"GMI":0.975661,"AQI":0.721565,"SGI":1.150901,"DEPI":1.040783,"SGAI":1.038106,"LVGI":1.129152,"TATA":-0.054668},
  "components_in_zone": 1,
  "f_score": null,
  "rsst_pct_avg_assets": null,
  "soft_assets_pct": 53.4,
  "d_rec_pct": 2.02,
  "d_inv_pct": null,
  "issuance_flagged_year": false,
  "implied_cash_yield_pct": 3.898,
  "risk_free_rate_pct": 3.91,
  "risk_free_source": "Federal Reserve Board H.15, RIFLGFCY01.N.A, FY2025 annual observation, accessed 2026-11-03 (web, unverified)",
  "red_flag_ids": []
}
```

## Self-Check

- [x] Every owned item A8-01 through A8-20 and A14-01 through A14-02 appears in the Universal Findings Table.
- [x] Beneish was calculated from two audited annual filings with cited inputs; Dechow was not faked where a required inventory input is absent.
- [x] One Beneish component in the manipulator zone is Amber, not Red.
- [x] The non-financial sector gate was applied.
- [x] The implied cash yield uses the FY2025 annual 1-year Treasury rate, not today’s rate.
- [x] earnings/06 conversion figures and balance-sheet-survival/01 debt stack were consumed.
- [x] The net-debt figure is labelled strict; CIQ’s LTM EBITDA is separately cited to its sidecar source.
- [x] Every Amber/Insufficient Data row has a follow-up. No Red flag or score floor applies.
- [x] A8-20 is coverage-limited and each lookup is in the Sweep Log.
