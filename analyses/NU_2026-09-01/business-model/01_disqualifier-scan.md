# Disqualifier Scan — NU

## 1. Disqualifier Check

| # | Disqualifier | Triggered (Y/N) | Evidence |
|---|---|---|---|
| 1 | Auditor qualification or going-concern note (last 3 years) | N | KPMG’s audit covers the three years ended 2025 and states that the consolidated statements present fairly in all material respects; it also opines that internal control over financial reporting was effective. No qualified opinion or going-concern note is stated. [FY2025 Form 20-F, Report of Independent Registered Public Accounting Firm, F-2] |
| 2 | >50% promoter / insider shares pledged | N | NU does not disclose a promoter group; the relevant group is insiders. Item 7.A attributes 903,124,498 Class B shares (88.3% of that class) to founder/CEO David Vélez and says the listed holders have sole voting and investment power, but does not disclose a pledged-share numerator. `pledged shares ÷ relevant insider holding = not assessable` (not a reported 0%) versus the `>50%` threshold. No hard trigger is evidenced. [FY2025 Form 20-F, Item 7.A, Major Shareholders] |
| 3 | Related-party transactions >25% of revenue or expenses | N | Note 28 says intercompany transactions are eliminated and lists a US$0.926m other-related-party liability in 2025; it does not disclose related-party sales or purchases. `RPT sales ÷ revenue = not assessable` and `RPT purchases ÷ total expenses = not assessable`, each against `>25%`. The disclosed liability is not a sales or expense numerator, so a crossing is not proven. [FY2025 Form 20-F, Note 28, Related parties] |
| 4 | Auditor changed twice in last 3 years without disclosed reason | N | KPMG Auditores Independentes Ltda. is the stated independent auditor for FY2025 and FY2024; the prior Form 20-F states the same auditor for FY2024 and FY2023. This gives `0` auditor changes across FY2023–FY2025, below the trigger of two changes without a disclosed reason. [FY2025 Form 20-F, Item 16.C, Principal Accountant Fees and Services; FY2024 Form 20-F, Item 16.C, Principal Accountant Fees and Services] |
| 5 | Material restatement (>5% of revenue or net income) in last 2 years | N | The FY2025 cover disclosure marks financial-statement error correction as false, and Item 6.F says NU was not required to prepare an accounting restatement during or after the last completed fiscal year. The FY2024 filing’s retrospective crypto accounting-policy change is described as adoption of SAB 122, not an error correction. `|restatement amount| ÷ revenue` and `÷ |net income| = 0% on the disclosed-restatement basis`, versus `>5%`; no qualifying restatement is disclosed. [FY2025 Form 20-F, cover disclosure and Item 6.F; FY2024 Form 20-F, Report of Independent Registered Public Accounting Firm, Change in accounting method—Crypto Assets] |
| 6 | Active regulatory enforcement action on financial reporting | N | The filing describes ordinary-course civil, labor, tax, and consumer proceedings, including the 123 Milhas and Colombian GMF matters; it does not identify an active SEC, BCB, CNBV, SFC, or other regulator enforcement action affecting NU’s financial reporting. No hard, named enforcement fact was found in the available filings. [FY2025 Form 20-F, Item 8.A, Legal Proceedings] |
| 7 | >40% of revenue from single customer with no long-term contract | N | NU states that no single customer represented 10% or more of Group revenue in FY2025, FY2024, or FY2023. `largest single customer revenue ÷ total revenue <10%`, below the `>40%` threshold; the contract condition cannot change that result. [FY2025 Form 20-F, Note 34, Segment information] |
| 8 | Negative operating cash flow in 3 of last 4 years (excl. growth-stage) | N | Audited annual cash from operations was positive in each of FY2022–FY2025: US$755.6m, US$1,266.2m, US$2,399.0m, and US$3,500.5m. Thus `negative OCF years = 0 of 4`, versus a 3-of-4 trigger. The CIQ sidecar separately reports LTM cash from operations of negative US$10,304.8m to 2026-06-30; that is a later rolling period, not one of the four audited annual observations, and is not comparable to the annual test. [FY2025 Form 20-F, Consolidated Statements of Cash Flows, F-14; FY2024 Form 20-F, Consolidated Statements of Cash Flows, F-15; CIQ Financials→Cash Flow ‘Cash from Ops.’ [LTM 12 months Jun-30-2026] — CIQ vendor export] |

## 2. Triggered Disqualifiers — Detail

No disqualifier triggered.

## 3. Verdict-Lock Signal

- **Any disqualifier triggered:** N
- **If Y, names:** None
- **Action:** If Y, the synthesizer will lock the final verdict at "Low-quality business — avoid deeper work" regardless of other scores. No lock applies from this scan.

## 4. Near-Miss Signals

| # | Disqualifier | Computed ratio | Near-miss band | In band? (Y/N) |
|---|---|---:|---|---|
| 2 | Pledged shares | Not assessable — no pledged-share numerator disclosed | ≥40% – ≤50% | N |
| 3 | Related-party transactions | Not assessable — no RPT sales or purchases disclosed | ≥20% – ≤25% | N |
| 5 | Restatement | 0% on the disclosed-restatement basis | ≥4% – ≤5% | N |
| 7 | Customer concentration | <10% | ≥32% – ≤40% | N |
| 8 | Negative OCF years (of last 4) | 0 of 4 | exactly 2 | N |

- **Near-misses in band:** 0 of 5
- **Compounding signal:** None — fewer than 2 near-misses
