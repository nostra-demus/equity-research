# Disqualifier Scan — UBER

## 1. Disqualifier Check

| # | Disqualifier | Triggered (Y/N) | Evidence |
|---|---|---|---|
| 1 | Auditor qualification or going-concern note (last 3 years) | N | PwC's opinion on the FY25 10-K states: "the consolidated financial statements... present fairly, in all material respects... in conformity with [US GAAP]... the Company maintained, in all material respects, effective internal control over financial reporting" — unqualified, no going-concern language, ICFR effective [FY25 10-K, p. Item 8, Report of Independent Registered Public Accounting Firm]. Same unqualified form covers FY23–FY25 (the three years the opinion speaks to) [FY25 10-K, Item 8]. No material weakness disclosed in Item 9A [FY25 10-K, Item 9A]. |
| 2 | >50% promoter / insider shares pledged | N | Uber has no promoter/controlling shareholder group (widely held, 1,207 holders of record as of Feb 10, 2026) [FY25 10-K, Item 5, p.5289]. Uber's Insider Trading Policy explicitly prohibits insiders from pledging company stock: "You are prohibited from hedging, pledging and lending Company securities in any transaction..." [FY25 10-K, Exhibit — Insider Trading Policy, p.36240–36245]. No pledge disclosure exists because none is permitted or reported. (Detailed % beneficial ownership by officer/director sits in the 2026 Proxy Statement, incorporated by reference and not in this data pool — but the pledge question is answered directly by the policy prohibition, so this is not a data gap for this test.) |
| 3 | Related-party transactions >25% of revenue or expenses | N | Disclosed related parties are minority-stake operating partners, not transacting counterparties at scale: a $384 million term loan (an asset, i.e. loan receivable) to Moove as of Dec 31, 2025, with related-party liabilities "not material" [FY25 10-K, Note — Related Party Transactions, p.31526–31534]; a Lime convertible note receivable [FY25 10-K, p.18296]; and a minority stake in Careem Technologies retained after the 2023 e& transaction [FY25 10-K, p.20538]. $384M term loan ÷ FY25 revenue of $52,017 million = 0.7% — nowhere near the 25% threshold on either the revenue or expense side. No related-party sales or purchases of a scale approaching 25% of expenses are disclosed. |
| 4 | Auditor changed twice in last 3 years without disclosed reason | N | PwC has been Uber's auditor continuously since 2014: "We have served as the Company's auditor since 2014" [FY25 10-K, Item 8, Report of Independent Registered Public Accounting Firm, p.10793]. Zero auditor changes in the last 3 years, let alone two. |
| 5 | Material restatement (>5% of revenue or net income) in last 2 years | N | No restatement disclosed. The 10-K cover-page checkbox for "error corrections that are restatements" is present as a standard form item but nothing in the filing text, cash-flow statement, or footnotes describes an actual restatement of prior-period financials [FY25 10-K, cover page item, p.441; Item 8 financial statements]. FY24/FY25 net income ($10,053M / $9,579M LTM) [Capital IQ, Financials_Annual — Income Statement] show no restated comparatives versus the FY24 10-K's own prior-year figures. |
| 6 | Active regulatory enforcement action on financial reporting | N | Item 3 Legal Proceedings references Note 14 (Commitments and Contingencies) for material legal matters: Driver Classification and State Unemployment Taxes — both labor/tax matters, not accounting or financial-reporting enforcement [FY25 10-K, Item 3, p.5211–5245]. Historical FTC (2018 privacy consent decree, expires 2038) and DOJ (2022 non-prosecution agreement re: 2016 data breach) actions relate to data privacy/security, not financial reporting [FY25 10-K, p.4348]. No SEC enforcement action, accounting fraud charge, or ICFR material-weakness finding is disclosed anywhere in the 10-K or either FY26 10-Q. |
| 7 | >40% of revenue from single customer with no long-term contract | N | Uber's revenue derives from millions of individual Mobility riders and Delivery consumers plus a large, fragmented base of restaurant/retail merchants — the filing's own risk factors and the Capital IQ customer-relationship list show a wide roster of merchant partners (Apple, Aeon, Carrefour, Brinker, etc.), none disclosed as a revenue-concentration risk [Uber NYSE:UBER Customers export, Capital IQ]. The 10-K's "Concentration of Credit Risk" note addresses cash/investment counterparty risk, not customer revenue concentration, and states no material losses from any such concentration [FY25 10-K, Item 8, Note — Concentration of Credit Risk, p.16252–16257]. No single-customer revenue concentration is disclosed because the business model structurally has none. |
| 8 | Negative operating cash flow in 3 of last 4 years (excl. growth-stage) | N | Operating cash flow (Cash from Operations) for FY2022–FY2025: $642M, $3,585M, $7,137M, $10,099M — all four years positive [Capital IQ, Financials_Annual — Cash Flow, row "Cash from Ops."]. Zero negative years in the most recent 4, let alone 3. |

## 2. Triggered Disqualifiers — Detail

No disqualifier triggered.

## 3. Verdict-Lock Signal

- **Any disqualifier triggered:** N
- **If Y, names:** N/A
- **Action:** No verdict lock applies from this scan. The synthesizer is free to weigh business quality, moat, and other module scores on their own merits.

**Non-lock note on integrity (soft signal, routed per CLAUDE.md §24 Filter 1):** Uber's driver-classification litigation (Item 3, Note 14) and historical data-privacy enforcement (2018 FTC consent decree, 2022 DOJ non-prosecution agreement re: the 2016 breach) are disclosed, resolved-or-ongoing legal/regulatory matters, not proven fraud or defrauding of stakeholders by the controller or senior management, and none touch financial-reporting integrity. They do not meet the hard evidence bar for a #6 or §13 lock. Flagged here for routing to the management-governance module (track-record and candor agents) as context, not as a score-capping trigger from this agent.

## 4. Near-Miss Signals

| # | Disqualifier | Computed ratio | Near-miss band | In band? (Y/N) |
|---|---|---:|---|---|
| 2 | Pledged shares | Not applicable — no promoter/control group exists; insider pledging is contractually prohibited [FY25 10-K, Insider Trading Policy] | ≥40% – ≤50% | N |
| 3 | Related-party transactions | 0.7% (Moove term loan $384M ÷ FY25 revenue $52,017M); related-party liabilities disclosed as "not material" | ≥20% – ≤25% | N |
| 5 | Restatement | 0% — no restatement disclosed in the filing period | ≥4% – ≤5% | N |
| 7 | Customer concentration | Not material / not disclosed — diversified consumer and merchant base, no single-customer concentration reported | ≥32% – ≤40% | N |
| 8 | Negative OCF years (of last 4) | 0 of 4 (FY2022–FY2025 all positive: $642M, $3,585M, $7,137M, $10,099M) | exactly 2 | N |

- **Near-misses in band:** 0 of 5
- **Compounding signal:** None — fewer than 2 near-misses
