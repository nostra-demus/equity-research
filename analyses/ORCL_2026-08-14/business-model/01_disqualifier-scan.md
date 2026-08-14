# Disqualifier Scan — ORCL

## 1. Disqualifier Check

| # | Disqualifier | Triggered (Y/N) | Evidence |
|---|---|---|---|
| 1 | Auditor qualification or going-concern note (last 3 years) | N | Ernst & Young LLP's Report of Independent Registered Public Accounting Firm states the FY26, FY25 and FY24 consolidated financial statements "present fairly, in all material respects" and expresses an unqualified opinion on both the financial statements and internal control over financial reporting (ICFR), with no going-concern language [FY26 10-K, Part IV Item 15, "Report of Independent Registered Public Accounting Firm"]. |
| 2 | >50% promoter / insider shares pledged | N | Oracle has no promoter group; the relevant control-adjacent group is insiders/directors (incl. Executive Chair Lawrence J. Ellison). The 10-K's Insider Trading Policy states: "the Pledging Policy prohibits applicable employees from holding Oracle securities in a margin account or otherwise pledging Oracle securities as collateral for a loan" (limited exceptions only) [FY26 10-K, Exhibit — Insider Trading Policy, "Margin Accounts and Pledging Oracle Securities"]. No pledge disclosure of any kind found in the pool (Ownership Summary, Ownership History, or Insider Trading workbooks) [Oracle Corporation NYSE ORCL Public Ownership Summary.rtf; Public Ownership History.xls; Public Ownership Insider Trading.xls — no "pledge" hits]. Computed ratio: not measurable / effectively 0%, well under the 50% threshold. |
| 3 | Related-party transactions >25% of revenue or expenses | N | The only related-party disclosure in the audited financials identifies equity-method investees as related parties under ASC 850, with no revenue or expense transaction dollar amounts disclosed against them [FY26 10-K, Notes to Consolidated Financial Statements, "Related Party Disclosures"]. Item 13 ("Certain Relationships and Related Transactions") is incorporated by reference from the 2026 Proxy Statement, which is not in this data pool [FY26 10-K, Item 13]. No related-party sales or purchases figure is disclosed in the pool to compute a ratio against FY26 revenue ($66,674mn per the annual Income Statement tab context) or total expenses — computed ratio: not disclosed / not material based on the absence of any transaction line item in the audited note itself (a US 10-K's related-party note is required to disclose material RPTs; its silence on transaction amounts is itself evidence none crossed materiality). |
| 4 | Auditor changed twice in last 3 years without disclosed reason | N | "We have served as the Company's auditor since 2002" — Ernst & Young LLP has been the sole auditor for over two decades, no change in the review period [FY26 10-K, Part IV Item 15, auditor signature block, p. near line 24095]. |
| 5 | Material restatement (>5% of revenue or net income) in last 2 years | N | No restatement of FY26 or FY25 results found. The CIQ annual Cash-Flow tab's "Restatement Type" column shows "RS" (restated) only for the FY2017 and FY2018 columns (a decade-old restatement, likely tied to a since-superseded revenue-recognition standard adoption, outside the last-2-years window) and "NC"/"O" (not changed / original) for FY2019 through FY2026 [Oracle Corporation NYSE ORCL Financials_Annual.xls — Cash Flow tab, row "Restatement Type"]. The 10-K cover page's "Indicate by check mark whether any of those error corrections are restatements..." (Item 405/recovery-analysis checkbox) shows no triggered restatement for FY26 [FY26 10-K, cover page, Rule 10D-1 checkbox]. |
| 6 | Active regulatory enforcement action on financial reporting | N | No SEC (or other regulator) enforcement action, investigation, subpoena, or consent decree against Oracle is disclosed. Two disclosed litigations are private civil suits, not regulatory enforcement: (a) a Netherlands GDPR privacy class action (unrelated to financial reporting) and (b) a securities class action filed Feb 3, 2026 in the U.S. District Court for the District of Delaware by an alleged shareholder, alleging false/misleading statements about the cloud-infrastructure business — this is private litigation, not a regulator action, is still at the pre-motion-to-dismiss stage, and the company states it does not expect a material impact [FY26 10-K, Part I Item 3 / Part IV Note 15, "Legal Proceedings — Securities Class Action Regarding Oracle Cloud Infrastructure"]. This private suit is noted as a governance/disconfirmation-evidence item for other modules, not a #6 trigger, since it is not a regulator enforcement action. |
| 7 | >40% of revenue from single customer with no long-term contract | N | "No single customer accounted for 10% or more of our total revenues in fiscal 2026, 2025 or 2024" [FY26 10-K, Notes to Consolidated Financial Statements, credit-risk/concentration disclosure]. Computed ratio: largest customer <10% of revenue, far under the 40% threshold. |
| 8 | Negative operating cash flow in 3 of last 4 years (excl. growth-stage) | N | Cash from operations was positive in each of the last 4 fiscal years: FY2023 $17,165mn, FY2024 $18,673mn, FY2025 $20,821mn, FY2026 $31,977mn [Oracle Corporation NYSE ORCL Financials_Annual.xls — Cash Flow tab, row "Cash from Ops."]. Note for context (not a #8 trigger, since the test is operating cash flow, not free cash flow): FY2026 Levered Free Cash Flow was -$24,537mn and Unlevered Free Cash Flow was -$21,662mn because capital expenditure spiked to -$55,663mn (AI/cloud data-center buildout) [same tab, rows "Levered/Unlevered Free Cash Flow", "Capital Expenditure"] — this is a disclosed growth-capex narrative (data-center capacity build for cloud/AI demand), not a disqualifying operating cash flow problem. |

## 2. Triggered Disqualifiers — Detail

No disqualifier triggered.

## 3. Verdict-Lock Signal

- **Any disqualifier triggered:** N
- **If Y, names:** N/A
- **Action:** No verdict lock applies from this scan. The synthesizer is not required to cap the final verdict at "Low-quality business — avoid deeper work" on disqualifier-scan grounds.

Note (soft-signal routing, not a lock): a private securities class action alleging misleading statements about Oracle's cloud-infrastructure business, filed Feb 3, 2026 (U.S. District Court, District of Delaware), is unresolved and pre-motion-to-dismiss as of the FY26 10-K date [FY26 10-K, Note 15, "Legal Proceedings — Securities Class Action Regarding Oracle Cloud Infrastructure"]. This is an unproven allegation, not a regulator enforcement action or proven fraud, so it does not trip the #6 lock or the CLAUDE.md §24 Filter 1 integrity gate. It is flagged here for routing to the management-governance module (track-record / candor agents) per CLAUDE.md §24 Filter 1, where it should lower confidence pending resolution rather than cap this module's verdict.

## 4. Near-Miss Signals

| # | Disqualifier | Computed ratio | Near-miss band | In band? (Y/N) |
|---|---|---:|---|---|
| 2 | Pledged shares | ~0% (pledging prohibited by policy; no disclosed pledge) | ≥40% – ≤50% | N |
| 3 | Related-party transactions | Not disclosed / no material RPT line item in the audited note (effectively immaterial vs. FY26 revenue $66,674mn) | ≥20% – ≤25% | N |
| 5 | Restatement | 0% (no restatement in FY25 or FY26; last restatement flagged was FY2017/FY2018) | ≥4% – ≤5% | N |
| 7 | Customer concentration | <10% (largest single customer, per 10-K disclosure) | ≥32% – ≤40% | N |
| 8 | Negative OCF years (of last 4) | 0 of 4 (all four years positive) | exactly 2 | N |

- **Near-misses in band:** 0 of 5
- **Compounding signal:** None — fewer than 2 near-misses
