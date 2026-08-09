# Disqualifier Scan — UBER

## 1. Disqualifier Check

| # | Disqualifier | Triggered (Y/N) | Evidence |
|---|---|---|---|
| 1 | Auditor qualification or going-concern note (last 3 years) | N | PwC's opinion states financial statements "present fairly, in all material respects" and that Uber "maintained, in all material respects, effective internal control over financial reporting" for FY2025, with no going-concern paragraph and no qualification [FY25 10-K, Report of Independent Registered Public Accounting Firm, p. ~10607-10610]. No qualified opinion or going-concern language found in the FY2025, FY2024, or FY2023 audit opinions covered by this filing (the report opines on "each of the three years in the period ended December 31, 2025") [FY25 10-K, same section]. |
| 2 | >50% promoter / insider shares pledged | N | Uber has no promoter/controlling-shareholder block (widely-held public float); the relevant control group is insiders (officers + directors). Uber's own insider-trading policy states: "Hedging, Pledging and Lending Prohibited. You are prohibited from hedging, pledging and lending Company securities in any transaction, including by entering into any short sales, swaps, options, puts, calls, forward contracts or any other similar derivatives transaction." [FY25 10-K, Insider Trading Policy exhibit/section, p. ~36240-36245]. The only "pledge" language found relates to Uber's own Aurora Class A common stock pledged as collateral for its 2028 Exchangeable Senior Notes — a corporate financing pledge of an investment asset, not a promoter/insider equity pledge [FY25 10-K, Note 8 area, p. ~18289]. No disclosed insider share pledging found. |
| 3 | Related-party transactions >25% of revenue or expenses | N | Disclosed related-party relationships (Lime convertible note; Careem Technologies equity-method investment, ~42% stake, initial carrying value $300mm; Moove term loan, $384mm receivable at Dec-31-2025; former Freight Series A preferred investor) are balance-sheet investment/financing positions, not recurring related-party sales or purchases run through revenue or operating expense [FY25 10-K, Notes 6/15/16, p. ~18224-20560, ~31490-31700]. FY2025 revenue was $52,017 million [Uber Financials_Annual, Income Statement tab, Dec-31-2025 column]. No related-party sales or purchases line is disclosed as material to revenue or total expenses; the largest single related-party balance ($384mm Moove loan) is 0.7% of FY2025 revenue — far below the 25% threshold on either side of the test. |
| 4 | Auditor changed twice in last 3 years without disclosed reason | N | "We have served as the Company's auditor since 2014." — PricewaterhouseCoopers LLP [FY25 10-K, Report of Independent Registered Public Accounting Firm, p. 10793]. Same auditor (PwC) for the entire look-back period and well beyond; no auditor change. |
| 5 | Material restatement (>5% of revenue or net income) in last 2 years | N | No restatement of prior-period financial statements is disclosed. The only "restat" hits in the filing are boilerplate references to the "amended and restated certificate of incorporation," "amended and restated bylaws," and a clawback-policy checkbox item confirming no Item 402(w) recovery-analysis restatement occurred [FY25 10-K, cover-page checkboxes and corporate-governance sections, p. 441, 4799-4958]. CIQ annual cash-flow tab shows "Restatement Type: NC" (no change) for FY2022-FY2024 and "O" (original)/"P" (preliminary) for the two most recent columns, consistent with no restatement [Uber Financials_Annual, Cash Flow tab, row 95]. |
| 6 | Active regulatory enforcement action on financial reporting | N | Disclosed regulatory matters are data-privacy/security related, not financial-reporting related: a 2018 FTC consent decree on privacy practices (through 2038), a 2022 DOJ non-prosecution agreement over the 2016 data breach, and 2018-2022 state-AG and European DPA settlements/fines [FY25 10-K, Risk Factors, p. 4348]. No SEC investigation, subpoena, cease-and-desist, or enforcement action tied to Uber's financial statements or internal controls over financial reporting was found in the pool. Management-governance module's `red_flags.csv` lists litigation/disclosure-quality items (MDL verdicts, a shareholder derivative suit) but none is an active SEC/financial-reporting enforcement action [management-governance/red_flags.csv]. |
| 7 | >40% of revenue from single customer with no long-term contract | N | Uber's revenue is generated from a large, diversified base of individual riders, eaters, and Delivery/Freight shippers across Mobility, Delivery, and Freight segments — not a single named customer. No customer-concentration disclosure of this kind appears in the 10-K or the CIQ Customers export; the CIQ Customers.rtf file lists commercial partners/relationships, not a revenue-concentrated single payer [Uber Technologies Inc NYSE UBER Customers.rtf]. Not proven from available data that any single customer exceeds a material share of revenue, let alone 40%. |
| 8 | Negative operating cash flow in 3 of last 4 years (excl. growth-stage) | N | Cash from Operations for the last 4 fiscal years: FY2022 $642mm, FY2023 $3,585mm, FY2024 $7,137mm, FY2025 $10,099mm — positive in all four years [Uber Financials_Annual, Cash Flow tab, "Cash from Ops." row, FY2022-FY2025 columns]. LTM through Jun-30-2026 is $10,424mm, also positive [same source, LTM column]. |

## 2. Triggered Disqualifiers — Detail

No disqualifier triggered.

## 3. Verdict-Lock Signal

- **Any disqualifier triggered:** N
- **If Y, names:** N/A
- **Action:** No hard disqualifier found in the data pool. The synthesizer is not required to lock the final verdict on this basis; other modules' scores (business quality, moat, governance, balance sheet) govern the final rating.

**Integrity note (CLAUDE.md §24 Filter 1, cross-reference):** The management-governance module's `red_flags.csv` records soft/unproven adverse signal that is relevant context but does not meet the hard, proven-fraud bar for a lock here: (1) `RF-DISC-001` — discontinuation of the consolidated Adjusted-EBITDA-to-GAAP reconciliation starting Q1 FY2026 alongside continued guidance-beat claims, flagged as a disclosure-candor issue, not a proven misstatement; (2) an unadjudicated shareholder derivative lawsuit (filed Jul-23-2026, N.D. Cal.) naming the CEO, Chairman, all sitting directors, and two former CFOs, alleging the board ignored an internal ML safety-incident risk model, with disclosed incident counts diverging from an alleged internal total — confidence rated 2/5, unadjudicated [management-governance/red_flags.csv, `UNREGISTERED-BOARD-OVERSIGHT`]. Neither item is proven fraud or a proven enforcement action on financial reporting; both are routed to management-governance (already captured there) to cap conviction and are not treated as a hard disqualifier-scan trigger.

RF-DISQ-001 (multiple sub-threshold disqualifier near-misses) — NOT emitted; see Section 4 (0 of 5 quantitative disqualifiers fall in their near-miss band).

## 4. Near-Miss Signals

| # | Disqualifier | Computed ratio | Near-miss band | In band? (Y/N) |
|---|---|---:|---|---|
| 2 | Pledged shares | 0% (pledging of insider shares contractually prohibited by company policy) | ≥40% – ≤50% | N |
| 3 | Related-party transactions | ~0.7% (largest single related-party balance, $384mm Moove loan, ÷ FY2025 revenue $52,017mm); no disclosed related-party sales/purchases line at all | ≥20% – ≤25% | N |
| 5 | Restatement | 0% (no restatement disclosed; CIQ tab shows "Restatement Type: NC" for FY2022-FY2024) | ≥4% – ≤5% | N |
| 7 | Customer concentration | Not proven from available data / no single-customer concentration disclosed (consumer-diversified revenue base) | ≥32% – ≤40% | N |
| 8 | Negative OCF years (of last 4) | 0 of 4 (FY2022-FY2025 all positive: $642mm / $3,585mm / $7,137mm / $10,099mm) | exactly 2 | N |

- **Near-misses in band:** 0 of 5
- **Compounding signal:** None — fewer than 2 near-misses
