# Disqualifier Scan — AKAM

## 1. Disqualifier Check

| # | Disqualifier | Triggered (Y/N) | Evidence |
|---|---|---|---|
| 1 | Auditor qualification or going-concern note (last 3 years) | N | PwC’s FY25 audit report gives an unqualified opinion that the FY25 and FY24 balance sheets and the FY23–FY25 statements of income and cash flows present fairly under U.S. GAAP; it also opines that internal control over financial reporting was effective. No qualification or going-concern paragraph is stated. [FY25 Form 10-K, Item 8 — Report of Independent Registered Public Accounting Firm, p.51] |
| 2 | >50% promoter / insider shares pledged | N | AKAM is a U.S. issuer, so the relevant group would be officers and directors rather than a promoter group. The FY25 Form 10-K incorporates Item 12 ownership disclosure into the 2026 proxy, which is not in the frozen pool; the CIQ facts sidecar also records the ownership export as missing. Pledged insider shares ÷ insider holdings is therefore **not assessable from available data**, rather than a measured 0%. [FY25 Form 10-K, Item 12, p.95; CIQ facts sidecar, ownership fields, retrieved 2026-09-14 — vendor data] |
| 3 | Related-party transactions >25% of revenue or expenses | N | The required Item 13 related-transaction disclosure is incorporated into the 2026 proxy, which is not in the frozen pool. Related-party sales ÷ revenue and related-party purchases/expenses ÷ total expenses are each **not assessable from available data**; no sourced fact crosses either >25% threshold. [FY25 Form 10-K, Item 13, p.95] |
| 4 | Auditor changed twice in last 3 years without disclosed reason | N | FY25 Form 10-K Item 9 states “None” for changes in and disagreements with accountants. The frozen pool does not contain the FY23 or FY24 annual filings or intervening Form 8-K disclosures, so this does not prove the full three-year history; it provides no sourced evidence of two changes without a reason. [FY25 Form 10-K, Item 9, p.93] |
| 5 | Material restatement (>5% of revenue or net income) in last 2 years | N | The FY25 10-K cover marks both whether the financial statements reflect correction of an error and whether such corrections required a Rule 10D-1 recovery analysis as negative. For FY25, restatement amount $0 ÷ revenue $4,208.175m = **0.0%**, and $0 ÷ net income $452.031m = **0.0%**. The FY24 stand-alone filing is not in the frozen pool. [FY25 Form 10-K cover; FY25 Form 10-K, Item 7 — Cash Provided by Operating Activities] |
| 6 | Active regulatory enforcement action on financial reporting | N | The FY25 10-K has no unresolved SEC staff comments and describes its legal/governmental matters as routine and incidental, with no expected material effect. The Q2 FY26 10-Q repeats that statement. Neither filing identifies an active enforcement action affecting financial reporting. [FY25 Form 10-K, Item 1B, p.25; FY25 Form 10-K, Item 3, p.27; Q2 FY26 Form 10-Q, Item 1 — Legal Proceedings, p.45] |
| 7 | >40% of revenue from single customer with no long-term contract | N | No customer accounted for 10% or more of revenue in FY23, FY24, or FY25. Thus the largest disclosed customer’s revenue share was **<10%**, well below the strict >40% test; a contract disclosure cannot change that result. [FY25 Form 10-K, Item 1 — Customers, p.7] |
| 8 | Negative operating cash flow in 3 of last 4 years (excl. growth-stage) | N | Operating cash flow was positive in all four fiscal years: FY22 $1,274.676m, FY23 $1,348.439m, FY24 $1,519.171m, and FY25 $1,518.765m. Negative-OCF years = **0 of 4**, below the 3-of-4 trigger. The FY22 vendor export reconciles to the audited FY23–FY25 figures reported in the 10-K. [Capital IQ Financials→Cash Flow, “Cash from Ops.”, FY22, retrieved 2026-09-14 — vendor export; FY25 Form 10-K, Item 7 — Cash Provided by Operating Activities] |

## 2. Triggered Disqualifiers — Detail

No disqualifier triggered.

## 3. Verdict-Lock Signal

- **Any disqualifier triggered:** N
- **If Y, names:** None
- **Action:** No verdict lock from this scan. The synthesizer should retain the disclosed-data gaps on insider pledging and related-party transactions: the relevant FY26 proxy disclosure is not in the frozen pool.

## 4. Near-Miss Signals

| # | Disqualifier | Computed ratio | Near-miss band | In band? (Y/N) |
|---|---|---:|---|---|
| 2 | Pledged shares | Not assessable: insider ownership and pledge disclosure are absent from the frozen pool | ≥40% – ≤50% | N — not assessable |
| 3 | Related-party transactions | Not assessable: Item 13 proxy disclosure is absent; neither sales/revenue nor purchases/expenses can be calculated | ≥20% – ≤25% | N — not assessable |
| 5 | Restatement | FY25: $0 ÷ $4,208.175m revenue = 0.0%; $0 ÷ $452.031m net income = 0.0%. FY24 stand-alone filing unavailable | ≥4% – ≤5% | N |
| 7 | Customer concentration | Largest disclosed customer revenue share <10% | ≥32% – ≤40% | N |
| 8 | Negative OCF years (of last 4) | 0 of 4: FY22–FY25 cash from operations was positive | exactly 2 | N |

- **Near-misses in band:** 0 of 5
- **Compounding signal:** None — fewer than 2 near-misses
