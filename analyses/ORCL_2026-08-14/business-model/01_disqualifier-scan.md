# Disqualifier Scan — ORCL

## 1. Disqualifier Check

| # | Disqualifier | Triggered (Y/N) | Evidence |
|---|---|---|---|
| 1 | Auditor qualification or going-concern note (last 3 years) | N | Ernst & Young LLP's Report of Independent Registered Public Accounting Firm covers the consolidated balance sheets as of May-31-2026 and May-31-2025, and the statements of operations, comprehensive income, stockholders' equity, and cash flows "for each of the three years in the period ended May 31, 2026" (i.e. FY2024–FY2026), and states EY's report "expressed an unqualified opinion thereon" — no going-concern language anywhere in the opinion or ICFR opinion (also unqualified/effective) [FY26 10-K, Item 8, Report of Independent Registered Public Accounting Firm]. |
| 2 | >50% promoter / insider shares pledged | N | Oracle has no "promoter" structure; the only insider with any pledged shares is Founder/Executive Chair/CTO Lawrence Ellison. As of Sep-19-2025 he had pledged 346,000,000 shares against personal indebtedness, out of his total beneficial ownership of 1,158,232,353 shares (40.6% of shares outstanding) — 346,000,000 ÷ 1,158,232,353 = **29.9%** of his own holding, below the >50% threshold. The proxy states explicitly "No other executive officer or director...holds shares...pledged" [FY25 DEF 14A (filed Sep-26-2025), "Review of Pledging Arrangements" p.16031 / beneficial-ownership table p.18431]. |
| 3 | Related-party transactions >25% of revenue or expenses | N | "Total related person transaction revenues were approximately 0.02% of our total revenues. Total related person operating expenses were approximately 0.04% of our total operating expenses in fiscal 2025." [FY25 DEF 14A, Certain Relationships and Related Transactions, p.39587]. Both figures are orders of magnitude below the 25% threshold. |
| 4 | Auditor changed twice in last 3 years without disclosed reason | N | 10-K Item 9, "Changes In and Disagreements with Accountants on Accounting and Financial Disclosure" states "None." Ernst & Young LLP signed both the ICFR opinion and the financial-statement opinion for FY2026, consistent with the multi-year EY signature blocks found elsewhere in the filing — no auditor change disclosed [FY26 10-K, Item 9]. |
| 5 | Material restatement (>5% of revenue or net income) in last 2 years | N | No restatement of FY2025 or FY2026 results is disclosed. Item 9 confirms no accounting disagreements. The only "Restated" labels in the data pool sit on the CIQ vendor cash-flow tab against FY2017/FY2018 (outside the 2-year window and a CapIQ template artifact, not a company-announced restatement) [FY26 10-K, Item 9; Oracle Corporation NYSE ORCL Financials_Annual.xls — Cash Flow tab, FY2017/FY2018 columns]. Not proven from available data — no restatement amount exists to compute a ratio. |
| 6 | Active regulatory enforcement action on financial reporting | N | No SEC investigation, subpoena, or enforcement action is disclosed anywhere in the 10-K or Key Developments feed. There IS a private securities class action (not a regulator enforcement action) filed Feb-3-2026 in the U.S. District Court for the District of Delaware against Oracle, its CTO, its two co-CEOs, two other executives, and one board member, alleging false/misleading statements about the Oracle Cloud Infrastructure business; a scheduling order sets an amended complaint deadline of Jul-14-2026 and a company response by Sep-16-2026 [FY26 10-K, Item 1A "Risk Factors" p.7328 and Note 15, "Securities Class Action Regarding Oracle Cloud Infrastructure" p.88195-88200]. This is an unproven allegation via private litigation, not a government enforcement action, and is not a hard trigger under this test — see integrity note below. |
| 7 | >40% of revenue from single customer with no long-term contract | N | "No single customer accounted for 10% or more of our total revenues in fiscal 2026, 2025 or 2024." [FY26 10-K, Notes to Consolidated Financial Statements, "Concentration of Credit Risk" section, p.42092]. Far below the 40% threshold and the 32–40% near-miss band. |
| 8 | Negative operating cash flow in 3 of last 4 years (excl. growth-stage) | N | Cash from operations was positive in all of the last four fiscal years: FY2023 $17,165M, FY2024 $18,673M, FY2025 $20,821M, FY2026 $31,977M — 0 of 4 years negative [Oracle Corporation NYSE ORCL Financials_Annual.xls — Cash Flow tab, "Cash from Ops." row, FY2023–FY2026 columns]. |

## 2. Triggered Disqualifiers — Detail

No disqualifier triggered.

**Note on the securities class action (routed per CLAUDE.md §24 Filter 1 / Integrity note, not a hard lock):** The Feb-2026 Delaware federal securities class action alleging misleading statements about Oracle Cloud Infrastructure names Oracle's CTO, both co-CEOs, two other executives, and a director as defendants [FY26 10-K, Note 15, p.88195-88200]. This is a specific, sourced, but unproven allegation — no regulator (SEC) has brought an enforcement action, no court has found liability, and the case is still at the scheduling stage. Under CLAUDE.md §27/§24 this does not meet the bar for disqualifier #6 (which requires an "active regulatory enforcement action") or for the §13/§24 hard fraud lock (which requires proven fraud). It is flagged here and routed to the management-governance module (track-record and candor agents), where it should lower confidence and cap conviction rather than lock the verdict.

## 3. Verdict-Lock Signal

- **Any disqualifier triggered:** N
- **If Y, names:** N/A
- **Action:** No hard disqualifier found in the data pool. The synthesizer should NOT apply the "Low-quality business — avoid deeper work" lock on the basis of this scan. The unresolved securities class action (see Section 2 note) should still be carried forward to management-governance and the master synthesis disconfirmation section (CLAUDE.md §8) as an open, unproven risk.

## 4. Near-Miss Signals

| # | Disqualifier | Computed ratio | Near-miss band | In band? (Y/N) |
|---|---|---:|---|---|
| 2 | Pledged shares | 346,000,000 ÷ 1,158,232,353 = 29.9% (Ellison pledge ÷ Ellison's own holding) | ≥40% – ≤50% | N |
| 3 | Related-party transactions | 0.02% of revenue / 0.04% of operating expenses (FY2025) | ≥20% – ≤25% | N |
| 5 | Restatement | Not applicable — no restatement disclosed, no ratio computable | ≥4% – ≤5% | N |
| 7 | Customer concentration | <10% (largest single customer, FY2024–FY2026) | ≥32% – ≤40% | N |
| 8 | Negative OCF years (of last 4) | 0 of 4 | exactly 2 | N |

- **Near-misses in band:** 0 of 5
- **Compounding signal:** None — fewer than 2 near-misses
