# Disqualifier Scan — GOOGL

## 1. Disqualifier Check

| # | Disqualifier | Triggered (Y/N) | Evidence |
|---|---|---|---|
| 1 | Auditor qualification or going-concern note (last 3 years) | N | EY’s FY25 opinion states that the FY23–FY25 consolidated financial statements present fairly in accordance with U.S. GAAP; the audit of FY25 internal control was unqualified. The CIQ auditor export records EY as unqualified for Alphabet itself in FY23, FY24, and FY25. [Alphabet FY25 Form 10-K, Item 8—Report of Independent Registered Public Accounting Firm; CIQ Auditors export, FY2023–FY2025 Alphabet Inc. self rows—vendor export] |
| 2 | >50% promoter / insider shares pledged | N | Not proven from available data. Alphabet has no promoter group; the relevant test is pledged shares of officers and directors divided by their holdings. The available ownership export lists holdings but not pledged shares, and no pledge disclosure was located in the available filings. The ratio cannot be calculated. [CIQ Public Ownership Summary, as of 2026-06-30—vendor export; Alphabet FY25 Form 10-K, Part III Item 12] |
| 3 | Related-party transactions >25% of revenue or expenses | N | The Q3 FY26 10-Q discloses a related-party commercial agreement with Crux AI and $16.8bn of remaining performance obligations, which are contractual amounts not yet recognized as revenue. It does not disclose related-party sales or purchases/expenses for the test period, so neither `RPT sales ÷ revenue` nor `RPT purchases ÷ expenses` can be calculated. The $16.8bn backlog must not be used as revenue. [Alphabet Q3 FY26 Form 10-Q, Note 2—Revenue Backlog; Note 3—Crux AI investment] |
| 4 | Auditor changed twice in last 3 years without disclosed reason | N | EY has served as Alphabet’s auditor since 1999. The CIQ export also records EY for Alphabet itself in FY23, FY24, and FY25, so there were zero changes in the three-year test window. [Alphabet FY25 Form 10-K, Item 8—Report of Independent Registered Public Accounting Firm; CIQ Auditors export, FY2023–FY2025 Alphabet Inc. self rows—vendor export] |
| 5 | Material restatement (>5% of revenue or net income) in last 2 years | N | Both FY24 and FY25 annual-report cover pages mark “correction of an error to previously issued financial statements” as false and mark the related restatement-recovery question as false. Restatement amount is therefore $0 for the disclosed annual checks: `$0 ÷ revenue = 0.0%` and `$0 ÷ |net income| = 0.0%`, below the strictly greater-than 5% threshold. [Alphabet FY24 Form 10-K, cover page; Alphabet FY25 Form 10-K, cover page] |
| 6 | Active regulatory enforcement action on financial reporting | N | Alphabet discloses active competition, privacy, and other regulatory matters, including significant accrued legal and regulatory fines, but the filing does not identify an SEC, PCAOB, or other action directed at its financial reporting. Management and EY concluded FY25 financial-reporting controls were effective; the Q3 FY26 10-Q reports no material change in those controls. This does not reduce the significance of the disclosed operating-regulation cases. [Alphabet FY25 Form 10-K, Note 10—Legal Matters; Item 9A—Controls and Procedures; Alphabet Q3 FY26 Form 10-Q, Item 4—Controls and Procedures] |
| 7 | >40% of revenue from single customer with no long-term contract | N | No individual customer or affiliated-customer group represented more than 10% of revenue in each of FY23, FY24, and FY25. The largest disclosed customer concentration is therefore `<10%`, below the 40% trigger; contract duration does not change that result. [Alphabet FY25 Form 10-K, Note 2—Revenue Recognition / Concentration of Credit Risk] |
| 8 | Negative operating cash flow in 3 of last 4 years (excl. growth-stage) | N | Operating cash flow was positive in all four years: FY22 $91.495bn, FY23 $101.746bn, FY24 $125.299bn, and FY25 $164.713bn; negative years = `0 ÷ 4`, versus a trigger of 3 or 4. [Alphabet FY24 Form 10-K, Consolidated Statements of Cash Flows; Alphabet FY25 Form 10-K, Consolidated Statements of Cash Flows] |

## 2. Triggered Disqualifiers — Detail

No hard disqualifier triggered from available evidence.

## 3. Verdict-Lock Signal

- **Any disqualifier triggered:** N
- **If Y, names:** None
- **Action:** No verdict lock applied.

## 4. Near-Miss Signals

| # | Disqualifier | Computed ratio | Near-miss band | In band? (Y/N) |
|---|---|---:|---|---|
| 2 | Pledged shares | Not assessable: pledged shares and total officer/director holdings are not disclosed in the available data. [CIQ Public Ownership Summary, as of 2026-06-30—vendor export] | ≥40% – ≤50% | N (not assessable) |
| 3 | Related-party transactions | Not assessable: $16.8bn is unrecognized Crux AI revenue backlog, not related-party sales or expenses; no valid threshold ratio can be formed. [Alphabet Q3 FY26 Form 10-Q, Note 2—Revenue Backlog] | ≥20% – ≤25% | N (not assessable) |
| 5 | Restatement | 0.0% of revenue and 0.0% of absolute net income: no FY24 or FY25 correction/restatement was flagged. [Alphabet FY24 Form 10-K, cover page; Alphabet FY25 Form 10-K, cover page] | ≥4% – ≤5% | N |
| 7 | Customer concentration | `<10.0%` of revenue for the largest individual customer or affiliated group. [Alphabet FY25 Form 10-K, Note 2—Revenue Recognition / Concentration of Credit Risk] | ≥32% – ≤40% | N |
| 8 | Negative OCF years (of last 4) | `0 of 4` years: FY22–FY25 operating cash flow was positive each year. [Alphabet FY24 Form 10-K, Consolidated Statements of Cash Flows; Alphabet FY25 Form 10-K, Consolidated Statements of Cash Flows] | exactly 2 | N |

- **Near-misses in band:** 0 of 5; rows 2 and 3 are not assessable because the required numerator and denominator are not disclosed.
- **Compounding signal:** None — fewer than 2 near-misses
