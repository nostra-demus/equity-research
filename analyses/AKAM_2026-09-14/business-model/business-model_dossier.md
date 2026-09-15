# business-model Module Dossier — AKAM

> Deterministic, lossless concatenation of every artifact in this module — the module synthesis and every specialist output, in order. Generated mechanically (no LLM rewriting), so nothing is omitted or paraphrased. This is the module's "see everything" tier; the module's decision lives in `99_*-synthesis.md` and the short read in `business-model_memo.md`.

- Generated: 2026-09-14T06:14:23Z
- Module folder: `business-model`
- Contents: 1 module synthesis + 13 specialist outputs = 14 files

## Table of Contents

- [business-model — module synthesis](#business-model-module-synthesis) — `99_business-model-synthesis.md`
- [business-model / 00_data-triage.md](#business-model-00-data-triage-md) — `00_data-triage.md`
- [business-model / 01_disqualifier-scan.md](#business-model-01-disqualifier-scan-md) — `01_disqualifier-scan.md`
- [business-model / 02_business-identity.md](#business-model-02-business-identity-md) — `02_business-identity.md`
- [business-model / 03_segment-map.md](#business-model-03-segment-map-md) — `03_segment-map.md`
- [business-model / 04_unit-economics.md](#business-model-04-unit-economics-md) — `04_unit-economics.md`
- [business-model / 05_customer-geography.md](#business-model-05-customer-geography-md) — `05_customer-geography.md`
- [business-model / 06_value-chain.md](#business-model-06-value-chain-md) — `06_value-chain.md`
- [business-model / 07_business-quality.md](#business-model-07-business-quality-md) — `07_business-quality.md`
- [business-model / 08_competitive-map.md](#business-model-08-competitive-map-md) — `08_competitive-map.md`
- [business-model / 09_moat.md](#business-model-09-moat-md) — `09_moat.md`
- [business-model / 10_external-dependency.md](#business-model-10-external-dependency-md) — `10_external-dependency.md`
- [business-model / 11_capital-allocation-governance.md](#business-model-11-capital-allocation-governance-md) — `11_capital-allocation-governance.md`
- [business-model / 12_red-flags-sweep.md](#business-model-12-red-flags-sweep-md) — `12_red-flags-sweep.md`


---

## business-model — module synthesis

_Source: `99_business-model-synthesis.md`_

# Business Model Reality Check — AKAM (Synthesis)

## Abstract

Akamai sells security, cloud infrastructure, and content-delivery services over a distributed network. [FY25 Form 10-K, Item 1, pp.3–5] It makes money from contracts and usage, with Security contributing 55.0% of Q2 2026 revenue. [Q2 2026 Form 10-Q, Note 11, p.23] Its clearest advantage is more than 4,300 edge points of presence across over 130 countries. [FY25 Form 10-K, Item 1, p.3] Its main weakness is worsening economics: Q2 GAAP gross margin fell 330 basis points to 55.8%, while solution-level profit remains undisclosed. [Q2 2026 Form 10-Q, pp.5, 25] No automatic disqualifier triggered, but rapid industry change and debt-funded cloud expansion limit confidence; the verdict is average and requires a separate valuation test before deeper work.

## 1. First-Pass Verdict

### Automatic Disqualifier Check

| # | Disqualifier | Triggered (Y/N) | Source |
|---|---|---|---|
| 1 | Auditor qualification or going-concern note (last 3 years) | N | PwC gave unqualified FY25 financial-statement and internal-control opinions, with no going-concern paragraph. [FY25 Form 10-K, Item 8, p.51] |
| 2 | >50% promoter / insider shares pledged | N | No trigger is established, but the test is not assessable because the incorporated 2026 proxy and CIQ ownership export are absent. [FY25 Form 10-K, Item 12, p.95; CIQ facts sidecar, ownership fields, retrieved 2026-09-14 — vendor data] |
| 3 | Related-party transactions >25% of revenue or expenses | N | No sourced fact crosses the threshold, but both ratios are not assessable because the incorporated 2026 proxy is absent. [FY25 Form 10-K, Item 13, p.95] |
| 4 | Auditor changed twice in last 3 years without disclosed reason | N | Item 9 reports no current change or disagreement; the pool lacks the full three-year filing and 8-K history, so this is not proof of the complete period. [FY25 Form 10-K, Item 9, p.93] |
| 5 | Material restatement (>5% of revenue or net income) in last 2 years | N | The FY25 filing reports no correction or recovery analysis; FY25 restatement amount was $0, or 0.0% of both $4,208.175m revenue and $452.031m net income. The standalone FY24 filing is absent. [FY25 Form 10-K, cover; Item 7] |
| 6 | Active regulatory enforcement action on financial reporting | N | Neither the FY25 filing nor Q2 FY26 filing identifies such an action; the FY25 filing reports no unresolved SEC staff comments. [FY25 Form 10-K, Items 1B and 3, pp.25, 27; Q2 FY26 Form 10-Q, Item 1, p.45] |
| 7 | >40% of revenue from single customer with no long-term contract | N | No customer accounted for 10% or more of revenue in FY23–FY25. [FY25 Form 10-K, Item 1, p.7] |
| 8 | Negative operating cash flow in 3 of last 4 years (excl. growth-stage) | N | Cash from operations was positive in all four years: $1,274.676m FY22, $1,348.439m FY23, $1,519.171m FY24, and $1,518.765m FY25. [CIQ Financials→Cash Flow, FY22, retrieved 2026-09-14 — vendor export; FY25 Form 10-K, Item 7] |

No automatic disqualifier triggered. The missing proxy limits the insider-pledge and related-party tests; an absence of evidence is not a measured zero.

### Verdict

- **Verdict:** Average business — worth deeper work only if valuation is cheap
- **Disqualifier triggered:** N — none
- **Business clarity /100:** 72 — the products, revenue lines, and contract/usage model are understandable, but solution-level profit, capital employed, and capital spending are not disclosed. [FY25 Form 10-K, Item 1, pp.3–5; Q2 2026 Form 10-Q, Note 14, p.25]
- **Business quality /100:** 48 — contracted recurrence and a broad customer base are offset by weaker renewal pricing, falling margins, capital intensity, and rapid industry change. The 65-point fast-changing-industry cap applies but does not reduce the already-lower score. [Q2 2026 Form 10-Q, MD&A—Revenue and Expenses; Risk Factors—AI]
- **Moat /100:** 80 for the strongest possible moat source, distribution; this is not an overall moat score, and no clear economic moat is proven. [FY25 Form 10-K, Item 1, p.3]
- **External dependency risk /100 (higher = worse):** 55 — data-centre capacity, power, hardware supply, regulation, and customer IT budgets matter, with only partly measured mitigation. [Q2 2026 Form 10-Q, pp.32, 43, 45–47, 52]
- **Capital allocation & governance /100:** 45 — audit hygiene is clean in the available filings, but debt, cloud spending, buybacks, and unproven acquisition returns weigh on the result. [FY25 Form 10-K, pp.51–52; Q2 2026 Form 10-Q, Note 7, pp.17–20; Statements of Cash Flows, p.7]
- **Data quality /100:** 80 — all 16 frozen raw files extracted successfully and primary filings run through Q2 2026, but the 2026 proxy, full ownership history, category economics, and customer-cohort metrics are missing. [FY25 Form 10-K, cover; Q2 2026 Form 10-Q, cover]
- **Overall usefulness /100:** 68 — the module identifies the mix shift and the main risks, but cannot prove unit value creation or solution-level returns.
- **Business type:** Global cloud-security, edge/cloud-infrastructure, and content-delivery service provider with contracted and usage-based revenue. [FY25 Form 10-K, Item 1, pp.3–5; Item 7—Revenue]
- **Biggest business-model risk:** Debt-funded cloud capacity fails to earn sufficient returns while delivery renewal prices and group margins keep falling. [Q2 2026 Form 10-Q, pp.30–32; Note 7, pp.17–20]

Capital allocation score capped at 50/100 due to the $3.500bn May 2026 convertible-note issue, which increased CIQ total debt on its lease-equivalent-inclusive basis by 64.6%, from $5.675bn at FY25 to $9.339bn at June 30, 2026. The comparison is six months rather than a full year, but it already exceeds the cap's 50% materiality bar; the underlying 45/100 score therefore remains unchanged. [CIQ Financials→Balance Sheet, FY25 and Jun. 30, 2026 — vendor export; Q2 2026 Form 10-Q, Note 7, pp.17–20]

- **Rejector Filter 1 — Crooks / integrity:** Not tripped. No proven fraud or financial-reporting enforcement action appears in the available evidence; no cap applied. [FY25 Form 10-K, Items 1B, 3 and 8, pp.25, 27, 51]
- **Rejector Filter 4 — Serial acquirers:** Not tripped. Acquisition-pattern severity was 55, below the 70 trigger, and debt-funded deals near or above Akamai's own value were not established; no filter cap applied. [CIQ Financials→Cash Flow, FY21–FY25 — vendor export; Q2 2026 Form 10-Q, Note 6]
- **Rejector Filter 5 — Fast-changing industry:** Tripped. The 35/100 rate-of-change read caps Business quality at 65 and requires treatment as a sector / technology-cycle bet rather than a durable compounder; the reported Business quality score was already lower at 48. [Q2 2026 Form 10-Q, Risk Factors—AI]

RF-BQ-005 (fast-changing industry: rate-of-change ≤40)

### Module Disconfirmation

- **Strongest bear point:** Profit economics have weakened: gross margin fell from 63.3% in FY21 to 57.5% LTM June 2026, EBIT margin from 23.3% to 11.9%, and CIQ ROIC from 7.0% to 2.7%. [CIQ Financials→Income Statement and Ratios, FY21–LTM Jun. 2026 — vendor export]
- **Strongest bull point:** Remaining performance obligations were $7.6bn at June 30, 2026, supporting contracted visibility, although that figure excludes uncommitted usage and anticipated renewals. [Q2 2026 Form 10-Q, Note 11, p.23]
- **Single killer risk:** The $3.500bn May 2026 note issue funds a cloud build whose category profit and capital returns are not disclosed; failure to convert that spending into recurring cash could leave a larger balance sheet with lower returns. [Q2 2026 Form 10-Q, Notes 7 and 14, pp.17–20, 25]
- **Disconfirming evidence already visible:** CFO-to-EBITDA cash conversion rose from 117.7% in FY21 to 134.0% LTM June 2026 even as margins and ROIC fell; this contradicts a blanket erosion claim, but does not prove stronger pricing or returns on new capital. [CIQ Financials→Income Statement, Cash Flow and Ratios, FY21–LTM Jun. 2026 — vendor export]

## 2. Specialist Roll-Up

| Specialist | Verdict Line | Biggest Finding |
|---|---|---|
| data-triage | **Sufficient.** | All 16 frozen raw files extracted successfully; the pool includes an FY25 10-K and Q2 2026 10-Q, but no proxy. [FY25 Form 10-K, cover; Q2 2026 Form 10-Q, cover] |
| disqualifier-scan | **No disqualifier triggered.** | Customer share was below 10% and operating cash flow was positive in four of four years, while pledge and related-party tests remain not assessable. [FY25 Form 10-K, Item 1, p.7; Item 7; Item 13, p.95] |
| business-identity | **Global cloud-security, edge/cloud-infrastructure, and delivery provider with contracted and usage-based revenue.** | Security grew 10% to $604.4m in Q2 2026 while Delivery and other cloud applications fell 6% to $395.9m. [Q2 2026 Form 10-Q, p.30] |
| segment-map | **Security is the dominant economic category; profit dominance is not assessable.** | Security supplied 55.0% of Q2 revenue, but Akamai reports only one operating segment and no category profit. [Q2 2026 Form 10-Q, Notes 11 and 14, pp.23, 25] |
| unit-economics | **Unclear.** | Revenue, contribution margin, acquisition cost, and lifetime are not disclosed per Security customer; Q2 group gross margin fell 331 basis points. [Q2 2026 Form 10-Q, pp.5, 23, 25] |
| customer-geography | **Customer concentration is not indicated; geography is concentrated.** | No customer reached 10%, but the U.S. supplied 51% of FY25 revenue without disclosed contract coverage for that pool. [FY25 Form 10-K, pp.7, 32] |
| value-chain | **Mixed economic control.** | Delivery renewals faced lower prices while co-location, bandwidth, and network-build costs rose; company-wide realized cost recovery cannot be calculated. [FY25 Form 10-K, pp.28–29; Q2 2026 Form 10-Q, pp.30–32] |
| business-quality | **48/100 — Mixed/Average.** | Contract recurrence is offset by realized renewal-price pressure, a 330-basis-point Q2 gross-margin fall, capital intensity, and rapid technology change. [Q2 2026 Form 10-Q, MD&A—Revenue and Expenses; Risk Factors—AI] |
| competitive-map | **Position versus peers is not disclosed.** | Cloudflare, Fortinet, and Fastly overlap with Security, but no matched market-share or peer-return series is available. [CIQ Company Comparable Analysis, Business Description and Operating Statistics sheets, 2026-09-14 — vendor export] |
| moat | **No moat proven — trajectory eroding on profit economics, not confirmed across every metric.** | Distribution scored strongest, but margins and ROIC fell while cash conversion improved, so the qualified erosion call survives only on profit economics. [FY25 Form 10-K, Item 1, p.3; CIQ Financials, FY21–LTM Jun. 2026 — vendor export] |
| external-dependency | **Partly externally driven.** | Capacity, power, and server/memory inputs are the main exposure; Q2 cost of revenue rose 14% while revenue rose 5%, with external inflation not isolated. [Q2 2026 Form 10-Q, p.32] |
| capital-allocation-governance | **Capital allocation concerns.** | $3.500bn of new convertibles lifted filed principal to $7.640bn while H1 strict FCF was $221.174m versus $615.744m of buybacks. [Q2 2026 Form 10-Q, Note 7, pp.17–20; Statements of Cash Flows, p.7; Note 9] |
| red-flags-sweep | **Execution and earnings-comparability issue, not a governance breach.** | Three restructurings totalled $135.326m—$20.668m FY23 + $63.398m FY24 + $51.260m FY25—and recent actions included product exits and asset impairments; the total is not all impairment. [FY25 Form 10-K, Note 10, pp.74–75] |

## 3. Reconciliation

| Issue | Specialist Reads | Reconciled View |
|---|---|---|
| Remaining performance obligations | Business-quality said remaining term, committed revenue, and RPO were not disclosed; moat reported $7.6bn of RPO. | Use the filing-backed $7.6bn at June 30, 2026, while retaining its exclusions for uncommitted usage and anticipated renewals. It supports contracted visibility but is not total future revenue. [Q2 2026 Form 10-Q, Note 11, p.23] |
| Capital intensity by solution | Segment-map relayed management's description of Security as requiring little capital spending; business-quality called the group capital-heavy. | Group capital intensity is proven: H1 capital spending was $417.600m, or 19.2% of revenue. Security-specific intensity remains not proven because category capital spending is not disclosed; management's statement is a lower-tier characterization. [Q2 2026 Form 10-Q, Statements of Cash Flows; Note 14, p.25; Citi Global TMT Conference, 2026-09-09, management discussion] |
| Gross-margin figures | Unit-economics and business-quality cited 55.8% for Q2 2026; moat cited 57.5% LTM June 2026. | No factual conflict: these are different period bases. Use 55.8% for the quarter and 57.5% for the trailing 12 months, never interchangeably. [Q2 2026 Form 10-Q, p.5; CIQ Financials→Ratios, LTM Jun. 2026 — vendor export] |
| Moat trajectory | Margin and ROIC series point down, while CFO/EBITDA rose 16.3 percentage points. | Describe erosion only in profit economics, not as confirmed across every measure. Better cash conversion is a real contradiction, but it does not establish pricing power or a return above cost of capital. [CIQ Financials→Income Statement, Cash Flow and Ratios, FY21–LTM Jun. 2026 — vendor export] |

## 4. Note To The Final Synthesizer

- **Strongest business-model positive:** The more-than-4,300-point edge network spans over 130 countries, and $7.6bn of RPO provides contracted visibility subject to exclusions for uncommitted usage and renewals. [FY25 Form 10-K, Item 1, p.3; Q2 2026 Form 10-Q, Note 11, p.23]
- **Strongest business-model negative:** Group profit economics are moving the wrong way: gross margin fell from 63.3% in FY21 to 57.5% LTM June 2026 and CIQ ROIC from 7.0% to 2.7%, while category profit remains undisclosed. [CIQ Financials→Income Statement and Ratios, FY21–LTM Jun. 2026 — vendor export; Q2 2026 Form 10-Q, Note 14, p.25]
- **Most important segment:** Security contributed $604.436m, or 55.0%, of Q2 2026 revenue and grew 10% year on year; its profit share is not disclosed. [Q2 2026 Form 10-Q, Notes 11 and 14, pp.23, 25; MD&A—Revenue, p.30]
- **Cleanest unit-economics read:** None can be derived. Akamai does not disclose Security customer count, revenue per customer, direct service cost, contribution margin, acquisition cost, or retention/lifetime. [Q2 2026 Form 10-Q, Notes 4, 11 and 14, pp.15–16, 23, 25]
- **Peer position:** Akamai's LTM gross margin of 57.5% trails Cloudflare at 72.6%, Fortinet at 80.2%, and Fastly at 61.5%; its 11.9% EBIT margin sits below Fortinet but above loss-making Cloudflare and Fastly. Peer ROIC is unavailable, and Akamai's own 2.7% ROIC cannot be compared with an undisclosed cost of capital. [CIQ Company Comparable Analysis, Operating Statistics, 2026-09-14 — vendor export; CIQ Financials→Ratios, LTM Jun. 2026 — vendor export]
- **Main external dependency:** Cloud expansion depends on third-party data-centre space, power, servers, and memory. Q2 cost of revenue rose 14% against 5% revenue growth, but the filing does not separate external inflation from Akamai's own capacity build. [Q2 2026 Form 10-Q, pp.31–32, 52]
- **Most important capital-allocation signal:** The $3.500bn May convertible issue lifted principal to $7.640bn to support cloud spending, while H1 strict FCF was $221.174m—$638.774m CFO less $246.613m property/equipment and $170.987m capitalized software—versus $615.744m of buybacks. [Q2 2026 Form 10-Q, Note 7, pp.17–20; Statements of Cash Flows, p.7; Note 9]
- **Automatic disqualifier:** None triggered. Keep the missing-proxy limitation attached to insider pledging and related-party transactions. [FY25 Form 10-K, Items 12–13, p.95]
- **Rejector filters:** Crooks/integrity and serial-acquirer filters did not trip. Fast-changing industry did trip, imposing a Business quality ceiling of 65 and classification as a sector / technology-cycle bet; the underlying quality score is already below that ceiling. [Q2 2026 Form 10-Q, Risk Factors—AI]
- **RF-BQ-005 (fast-changing industry: rate-of-change ≤40)**
- **Red flag — repeated product retirements:** FY23–FY25 restructuring actions totalled $135.326m, built from $20.668m + $63.398m + $51.260m. The FY24 and FY25 actions included ending solutions and impairing internal-use software and acquired technology/customer intangibles, but the total also includes severance and other costs and is not all impairment. [FY25 Form 10-K, Note 10, pp.74–75]
- **Red flag — tax comparability:** H1 2026's effective tax rate fell to 16.4% from 30.3%. Applying 30.3% to the roughly $221.4m pre-tax base implied by the rounded current rate produces about $67.1m of tax, or roughly $30.8m more; this is an inference from rounded reported rates, not an undisclosed accounting item or forecast. [Q2 2026 Form 10-Q, Note 12; MD&A—Provision for Income Taxes, p.35]
- **Biggest missing data point:** A Security customer-cohort table linking new and renewed revenue, direct service cost, retention/lifetime, and commissions; without it, incremental value creation cannot be tested.
- **Deeper-work decision:** Continue only if a separate valuation case compensates for average quality. Move toward high quality only with year-on-year gross-margin improvement, stable renewal pricing, and disclosed category returns; move toward low quality if cloud debt and capital spending produce more product retirements, impairments, or further ROIC decline. [Q2 2026 Form 10-Q, pp.30–32; FY25 Form 10-K, Note 10, pp.74–75]

## 5. Simple Summary

- Akamai protects and delivers internet applications and also sells cloud computing. [FY25 Form 10-K, Item 1, pp.3–5]
- Customers pay through contracts and usage; most contracts run for one year or longer. [FY25 Form 10-K, Item 7—Revenue]
- Whether a new Security customer creates value is not proven because customer-level revenue, cost, retention, and acquisition spending are missing. [Q2 2026 Form 10-Q, Notes 4, 11 and 14, pp.15–16, 23, 25]
- Security matters most: it was 55.0% of Q2 revenue and grew 10%. [Q2 2026 Form 10-Q, pp.23, 30]
- The network footprint is hard to copy quickly, but lower renewal prices, weaker margins, and low ROIC mean no clear economic moat is proven. [FY25 Form 10-K, pp.3, 29; CIQ Financials→Ratios, LTM Jun. 2026 — vendor export]
- Cloud growth depends on data-centre space, power, servers, and memory that Akamai does not fully control. [Q2 2026 Form 10-Q, pp.32, 52]
- Capital allocation is a concern: debt and cloud spending rose while acquisition returns remain unproven. [Q2 2026 Form 10-Q, Notes 6–7, pp.16–20]
- It deserves deeper work only after valuation, and only with explicit tests for margin recovery and returns on the cloud build.



---

## business-model / 00_data-triage.md

_Source: `00_data-triage.md`_

# Data Triage — AKAM

## 1. File Inventory

The frozen generation manifest lists 16 raw files and marks every one `ok`; there are no `fail`, `fallback-text`, `missing-dependency`, or Drive-pointer entries. `Last Modified` below is the frozen-copy timestamp, not evidence dating; periods and as-of dates are taken from inside each source. No `external/` files are in the bound pool. The relationship graph is present but has zero source exports and zero relationships, so it adds no inventory row or sufficiency evidence.

| Filename | Type | Period Covered | Last Modified | Notes |
|---|---|---|---|---|
| 23cab413-4bd3-4055-8415-e3e81559c003.pdf | Other — official earnings release | Q2 2026, ended Jun. 30, 2026 | 2026-09-14 10:54 IST | 249,025 bytes; internal heading identifies the Aug. 6, 2026 Q2 results release. |
| 6b47a3ae-7484-4682-b959-73a68a8842b5.pdf | Other — supplemental financial information | Q2 2026, ended Jun. 30, 2026 | 2026-09-14 10:54 IST | 348,218 bytes; internal title: unaudited supplemental financial information. |
| 8201ec17-6108-433f-bfdb-2ac3555bf343.pdf | Other — official earnings release | Q1 2026, ended Mar. 31, 2026 | 2026-09-14 10:54 IST | 216,796 bytes; internal heading identifies the May 7, 2026 Q1 results release. |
| 825b8027-5dc8-4664-8e3a-9bb6544bb003.pdf | Other — supplemental financial information | Q1 2026, ended Mar. 31, 2026 | 2026-09-14 10:54 IST | 124,715 bytes; internal title: unaudited supplemental financial information. |
| Akamai Technologies, Inc., 2025.pdf | Annual filing | FY2025, ended Dec. 31, 2025 | 2026-09-14 10:55 IST | 54,960,133 bytes; Form 10-K. |
| Akamai Technologies, Inc., Q1 2026.pdf | Quarterly filing | Q1 2026, ended Mar. 31, 2026 | 2026-09-14 10:55 IST | 652,586 bytes; Form 10-Q. |
| Akamai Technologies, Inc., Q2 2026.pdf | Quarterly filing | Q2 2026, ended Jun. 30, 2026 | 2026-09-14 10:55 IST | 692,339 bytes; Form 10-Q. |
| Akamai Technologies, Inc., Q1 2026 Earnings Call, May 07, 2026.pdf | Earnings transcript | Q1 2026 call, May 7, 2026 | 2026-09-14 10:55 IST | 409,707 bytes; S&P Global Market Intelligence transcript. |
| Akamai Technologies, Inc., Q2 2026 Earnings Call, Aug 06, 2026.pdf | Earnings transcript | Q2 2026 call, Aug. 6, 2026 | 2026-09-14 10:55 IST | 388,985 bytes; S&P Global Market Intelligence transcript. |
| Akamai Technologies, Inc. Presents at Citi’s 2026 Global TMT Conference, Sep-09-2026 02_35 PM.pdf | Transcript — conference presentation/Q&A | Sep. 9, 2026 | 2026-09-14 10:54 IST | 147,870 bytes; S&P Global Market Intelligence company-conference transcript. |
| Akamai Technologies, Inc. Presents at Goldman Sachs Communacopia + Technology Conference 2026, Sep-09-2026 02_25 PM.pdf | Transcript — conference presentation/Q&A | Sep. 9, 2026 | 2026-09-14 10:54 IST | 153,784 bytes; S&P Global Market Intelligence company-conference transcript. |
| Akamai Technologies Inc NasdaqGS AKAM Financials.xls — Key Stats | Data export | FY2022–FY2025 actual; LTM Jun. 30, 2026; FY2026–FY2028 estimates | 2026-09-14 10:54 IST | 217,098-byte parent workbook; 91×9; Capital IQ financials. |
| Akamai Technologies Inc NasdaqGS AKAM Financials.xls — Income Statement | Data export | FY2022–FY2025 actual; LTM Jun. 30, 2026; FY2026–FY2028 estimates | 2026-09-14 10:54 IST | Parent workbook; 120×7; USD millions. |
| Akamai Technologies Inc NasdaqGS AKAM Financials.xls — Balance Sheet | Data export | FY2022–FY2025 actual; LTM Jun. 30, 2026; FY2026–FY2028 estimates | 2026-09-14 10:54 IST | Parent workbook; 89×7; USD millions. |
| Akamai Technologies Inc NasdaqGS AKAM Financials.xls — Cash Flow | Data export | FY2022–FY2025 actual; LTM Jun. 30, 2026; FY2026–FY2028 estimates | 2026-09-14 10:54 IST | Parent workbook; 72×7; USD millions. |
| Akamai Technologies Inc NasdaqGS AKAM Financials.xls — Multiples | Data export | FY2022–FY2025 actual; LTM Jun. 30, 2026; FY2026–FY2028 estimates | 2026-09-14 10:54 IST | Parent workbook; 91×9. |
| Akamai Technologies Inc NasdaqGS AKAM Financials.xls — Historical Capitalization | Data export | FY2022–FY2025 actual; LTM Jun. 30, 2026; FY2026–FY2028 estimates | 2026-09-14 10:54 IST | Parent workbook; 39×7; USD millions. |
| Akamai Technologies Inc NasdaqGS AKAM Financials.xls — Capital Structure Summary | Data export | FY2022–FY2025 actual; LTM Jun. 30, 2026; FY2026–FY2028 estimates | 2026-09-14 10:54 IST | Parent workbook; 87×7; USD millions. |
| Akamai Technologies Inc NasdaqGS AKAM Financials.xls — Capital Structure Details | Data export | FY2022–FY2025 actual; LTM Jun. 30, 2026; FY2026–FY2028 estimates | 2026-09-14 10:54 IST | Parent workbook; 35×10; USD millions. |
| Akamai Technologies Inc NasdaqGS AKAM Financials.xls — Ratios | Data export | FY2022–FY2025 actual; LTM Jun. 30, 2026; FY2026–FY2028 estimates | 2026-09-14 10:54 IST | Parent workbook; 161×7. |
| Akamai Technologies Inc NasdaqGS AKAM Financials.xls — Supplemental | Data export | FY2022–FY2025 actual; LTM Jun. 30, 2026; FY2026–FY2028 estimates | 2026-09-14 10:54 IST | Parent workbook; 64×7; USD millions. |
| Akamai Technologies Inc NasdaqGS AKAM Financials.xls — Industry Specific | Data export | FY2022–FY2025 actual; LTM Jun. 30, 2026; FY2026–FY2028 estimates | 2026-09-14 10:54 IST | Parent workbook; 15×6. |
| Akamai Technologies Inc NasdaqGS AKAM Financials.xls — Pension OPEB | Data export | FY2022–FY2025 actual; LTM Jun. 30, 2026; FY2026–FY2028 estimates | 2026-09-14 10:54 IST | Parent workbook; 21×7; USD millions. |
| Akamai Technologies Inc NasdaqGS AKAM Financials.xls — Segments | Data export | FY2022–FY2025 actual; LTM Jun. 30, 2026; FY2026–FY2028 estimates | 2026-09-14 10:54 IST | Parent workbook; 72×7; USD millions. |
| AkamaiTechnologies,IncNasdaqGSAKAMEstimatesReport.xls — Consensus | Data export | Current FY ending Dec. 31, 2026; forward estimates | 2026-09-14 10:55 IST | 7,902,545-byte parent workbook; 529×121; Capital IQ estimates. |
| AkamaiTechnologies,IncNasdaqGSAKAMEstimatesReport.xls — Recent Changes | Data export | Current FY ending Dec. 31, 2026; forward estimates | 2026-09-14 10:55 IST | Parent workbook; 265×10. |
| AkamaiTechnologies,IncNasdaqGSAKAMEstimatesReport.xls — Guidance | Data export | Current FY ending Dec. 31, 2026; forward estimates | 2026-09-14 10:55 IST | Parent workbook; 142×89; Q3 2026 earnings release date shown as Nov. 3, 2026. |
| AkamaiTechnologies,IncNasdaqGSAKAMEstimatesReport.xls — Multiples | Data export | Current FY ending Dec. 31, 2026; forward estimates | 2026-09-14 10:55 IST | Parent workbook; 26×7. |
| AkamaiTechnologies,IncNasdaqGSAKAMEstimatesReport.xls — Surprise | Data export | Current FY ending Dec. 31, 2026; historical and forward estimates | 2026-09-14 10:55 IST | Parent workbook; 263×111. |
| AkamaiTechnologies,IncNasdaqGSAKAMEstimatesReport.xls — Trends | Data export | Current FY ending Dec. 31, 2026; forward estimates | 2026-09-14 10:55 IST | Parent workbook; 303×21. |
| AkamaiTechnologies,IncNasdaqGSAKAMEstimatesReport.xls — Revisions | Data export | Current FY ending Dec. 31, 2026; forward estimates | 2026-09-14 10:55 IST | Parent workbook; 467×21. |
| Company Comparable Analysis Akamai Technologies Inc.xls — Financial Data | Data export | As of Sep. 14, 2026; LTM and NTM fields | 2026-09-14 10:55 IST | 159,238-byte parent workbook; 50×17; Capital IQ comparables. |
| Company Comparable Analysis Akamai Technologies Inc.xls — Trading Multiples | Data export | As of Sep. 14, 2026; LTM and NTM fields | 2026-09-14 10:55 IST | Parent workbook; 50×9. |
| Company Comparable Analysis Akamai Technologies Inc.xls — Operating Statistics | Data export | As of Sep. 14, 2026; LTM and NTM fields | 2026-09-14 10:55 IST | Parent workbook; 50×13. |
| Company Comparable Analysis Akamai Technologies Inc.xls — Business Description | Data export | As of Sep. 14, 2026 | 2026-09-14 10:55 IST | Parent workbook; 44×3. |
| Company Comparable Analysis Akamai Technologies Inc.xls — Implied Valuation | Data export | As of Sep. 14, 2026; LTM and NTM fields | 2026-09-14 10:55 IST | Parent workbook; 69×9. |
| Company Comparable Analysis Akamai Technologies Inc.xls — Valuation Chart | Data export | As of Sep. 14, 2026 | 2026-09-14 10:55 IST | Parent workbook; 32×2. |
| Company Comparable Analysis Akamai Technologies Inc.xls — Credit Health Panel | Data export | As of Sep. 14, 2026; LTM fields | 2026-09-14 10:55 IST | Parent workbook; 48×10. |
| Company Comparable Analysis Akamai Technologies Inc.xls — Disclaimer | Data export | As of Sep. 14, 2026 | 2026-09-14 10:55 IST | Parent workbook; 26×1. |
| Supplemental Financial Information, 1st Quarter 2026.xlsx — Disclaimer | Data export | Q1 2026, ended Mar. 31, 2026 | 2026-09-14 10:55 IST | 37,861-byte parent workbook; 33×1. |
| Supplemental Financial Information, 1st Quarter 2026.xlsx — Supplemental Metrics | Data export | Q1 2026, ended Mar. 31, 2026 | 2026-09-14 10:55 IST | Parent workbook; 61×8; unaudited, USD thousands. |
| Supplemental Financial Information, 1st Quarter 2026.xlsx — Supplemental Revenue | Data export | Q1 2026, ended Mar. 31, 2026 | 2026-09-14 10:55 IST | Parent workbook; 46×8; unaudited, USD thousands. |
| Supplemental Financial Information, 1st Quarter 2026.xlsx — GAAP to Non-GAAP Reconciliation | Data export | Q1 2026, ended Mar. 31, 2026 | 2026-09-14 10:55 IST | Parent workbook; 126×8; unaudited, USD thousands. |
| Supplemental Financial Information, 1st Quarter 2026.xlsx — Non-GAAP Definitions | Data export | Q1 2026, ended Mar. 31, 2026 | 2026-09-14 10:55 IST | Parent workbook; 63×1. |
| Supplemental Financial Information, 2nd Quarter 2026.xlsx — Disclaimer | Data export | Q2 2026, ended Jun. 30, 2026 | 2026-09-14 10:55 IST | 40,832-byte parent workbook; 9×1. |
| Supplemental Financial Information, 2nd Quarter 2026.xlsx — Supplemental Metrics | Data export | Q2 2026, ended Jun. 30, 2026 | 2026-09-14 10:55 IST | Parent workbook; 61×10; unaudited, USD thousands. |
| Supplemental Financial Information, 2nd Quarter 2026.xlsx — Supplemental Revenue | Data export | Q2 2026, ended Jun. 30, 2026 | 2026-09-14 10:55 IST | Parent workbook; 46×10; unaudited, USD thousands. |
| Supplemental Financial Information, 2nd Quarter 2026.xlsx — GAAP to Non-GAAP Reconciliation | Data export | Q2 2026, ended Jun. 30, 2026 | 2026-09-14 10:55 IST | Parent workbook; 126×10; unaudited, USD thousands. |
| Supplemental Financial Information, 2nd Quarter 2026.xlsx — Non-GAAP Definitions | Data export | Q2 2026, ended Jun. 30, 2026 | 2026-09-14 10:55 IST | Parent workbook; 63×1. |

## 2. Most Recent Sources

| Source Type | Filename | Period | Age (months) |
|---|---|---|---|
| Annual filing | Akamai Technologies, Inc., 2025.pdf | FY2025, ended Dec. 31, 2025 | 8.5 |
| Quarterly filing | Akamai Technologies, Inc., Q2 2026.pdf | Q2 2026, ended Jun. 30, 2026 | 2.5 |
| Earnings transcript | Akamai Technologies, Inc., Q2 2026 Earnings Call, Aug 06, 2026.pdf | Q2 2026 call, Aug. 6, 2026 | 1.3 |
| Investor deck | Not in pool | Not assessable | Not assessable |
| Data export | Company Comparable Analysis Akamai Technologies Inc.xls | As of Sep. 14, 2026 | 0.0 |

## 2A. Filing Regime

| Item | Detected Value | Evidence |
|---|---|---|
| Primary listing country | United States | AKAM common stock is listed on Nasdaq Global Select Market. [FY2025 Form 10-K, cover] |
| Filing regime (US SEC / India SEBI-LODR / UK / Other) | US SEC | The annual filing is Form 10-K and the Q1/Q2 2026 interim filings are Forms 10-Q. [FY2025 Form 10-K, cover; Q2 2026 Form 10-Q, cover] |
| Reporting standard (US GAAP / IFRS / Ind AS) | US GAAP | The Q2 supplemental financial information identifies results prepared under generally accepted accounting principles in the United States. [Q2 2026 Supplemental Financial Information, p.1] |
| Reporting currency + fiscal-year end | USD; fiscal year ends Dec. 31 | The 10-K covers the fiscal year ended Dec. 31, 2025; the Capital IQ estimates workbook states current fiscal year end Dec. 31, 2026 and reports AKAM in USD. [FY2025 Form 10-K, cover; CIQ Estimates Consensus export, current-fiscal-year header] |
| Document language(s) | English | The FY2025 Form 10-K and Q2 2026 Form 10-Q are English-language SEC filings. [FY2025 Form 10-K, cover; Q2 2026 Form 10-Q, cover] |

## 3. Sufficiency Verdict

- **Verdict:** Sufficient
- **Reason:** The pool contains an audited annual filing for FY2025 (8.5 months old) and a Q2 2026 Form 10-Q (2.5 months old), plus a Q2 earnings transcript and official supplemental materials; all 16 manifest sources extracted successfully. [FY2025 Form 10-K, cover; Q2 2026 Form 10-Q, cover; Q2 2026 Earnings Call transcript, Aug. 6, 2026]



---

## business-model / 01_disqualifier-scan.md

_Source: `01_disqualifier-scan.md`_

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



---

## business-model / 02_business-identity.md

_Source: `02_business-identity.md`_

# Business Identity — AKAM

## 1. What The Company Actually Does

Akamai sells internet infrastructure services to global enterprises: it protects applications and networks from attacks, supplies cloud compute and related services, and delivers web, mobile, media, software, and game traffic over the internet. [FY2025 Form 10-K, Item 1, pp. 3–5] Its customers pay to keep their applications available, secure, and responsive for users in many locations, rather than build and operate all of that infrastructure themselves. [FY2025 Form 10-K, Item 1, pp. 3–5] The service runs on Akamai's own distributed network, which at December 31, 2025 included more than 4,300 edge points of presence in over 130 countries and roughly 700 cities. [FY2025 Form 10-K, Item 1, p. 3] The company reports three core offerings—security, cloud computing, and delivery—and also sells professional and managed support. [FY2025 Form 10-K, Item 1, pp. 3–5] In the latest quarter, it reported these revenue lines as security, delivery and other cloud applications, and cloud infrastructure services. [Q2 2026 Form 10-Q, p. 30]

## 2. How The Company Makes Money

**Core model:** `Revenue = contracted service commitments + usage above commitments (traffic and cloud usage) × unit price + professional and managed-support fees.` *Inference, not from filings; this expresses Akamai's disclosed contract, usage, traffic, and service model.* [FY2025 Form 10-K, Item 7 — Revenue]

- **Security:** `customer contracts and renewals × commitment price + protected application, API, network, and traffic usage × applicable price + managed-security fees.` *Inference, not from filings.* [FY2025 Form 10-K, Item 1, pp. 3–4; Item 7 — Revenue]
- **Cloud infrastructure:** `compute + storage + networking consumption × applicable price + platform and partner-service fees.` *Inference, not from filings.* [FY2025 Form 10-K, Item 1, p. 4; Item 7 — Revenue]
- **Delivery and other cloud applications:** `content, application, and media traffic delivered × contracted or usage price + related service fees.` *Inference, not from filings.* [FY2025 Form 10-K, Item 1, p. 5; Item 7 — Revenue]

Akamai says it primarily sells services through customer contracts of one year or longer, which form a base level of revenue; the disclosed services include security, content/application/software delivery, cloud computing, and professional services. [FY2025 Form 10-K, Item 7 — Revenue] Volume is driven by new customers, cross-selling, renewal outcomes, cloud-service usage, and network traffic; price is set and reset through contracts and renewals, where competitive pressure can lower some delivery and security prices. [FY2025 Form 10-K, Item 7 — Revenue] Margin is mainly shaped by the mix of these services and direct network costs, including bandwidth, co-location space and energy, network build-out, and depreciation from infrastructure investment. [FY2025 Form 10-K, Item 7 — Expenses]

## 3. Business Type Classification

Global cloud-security, edge/cloud-infrastructure, and content-delivery service provider with contracted and usage-based revenue. [FY2025 Form 10-K, Item 1, pp. 3–5; Item 7 — Revenue]

## 3a. Sector Overlay & Required-KPI Checklist

*No sector overlay for global cloud-security, edge/cloud-infrastructure, and content-delivery services — generic read.* The default volume/price/mix approach applies because the company sells a mixed set of security, infrastructure, and delivery services rather than one of the listed overlay business types. *Inference, not from filings.* [FY2025 Form 10-K, Item 1, pp. 3–5]

## 4. What Drives Variance

Revenue moves with renewal pricing, customer adoption and cross-selling, variable traffic, cloud usage, and the timing of one-time events and large renewals. [FY2025 Form 10-K, Item 7 — Revenue] In Q2 2026, security revenue rose 10% year on year to $604.4 million and cloud infrastructure services rose 39% to $99.3 million, while delivery and other cloud applications fell 6% to $395.9 million; the filing attributes the decline to lower renewal pricing and customer cost optimization that reduced traffic. [Q2 2026 Form 10-Q, p. 30] Margins can fall while the company builds cloud capacity because co-location, bandwidth, network equipment depreciation, and supporting-service costs rise before that capacity is fully used. [FY2025 Form 10-K, Item 7 — Expenses]



---

## business-model / 03_segment-map.md

_Source: `03_segment-map.md`_

# Segment Map — AKAM

## 1. Segment Table

AKAM is a single US-GAAP operating and reportable segment, but it publishes three revenue solution categories. The table maps those economic categories using the latest reported quarter, Q2 2026, in USD. The company does not publish costs, operating profit, or assets by solution category, so category profit shares and margins are not disclosed.

| Segment | What It Does | Revenue Share | Profit Share | Margin Quality | Capital Intensity | Cyclicality | Main Risk |
|---|---|---:|---:|---|---|---|---|
| Security | Protects infrastructure, websites, applications, APIs, networks, and users. | 55.0% ($604.436m ÷ $1,099.682m) [Q2 2026 10-Q, Note 11 (Revenue from Contracts with Customers), p.23] | Not disclosed | Not disclosed; no solution-level cost or profit is reported. [Q2 2026 10-Q, Note 14 (Segment Information), p.25] | Low — management characterised security as a developer-led business without much capital expenditure; solution-level capital expenditure is not disclosed. [Citi 2026 Global TMT Conference, 2026-09-09, management discussion] | Mid — inference, not from filings; renewal pricing and traffic levels can affect revenue. [Q2 2026 10-Q, Risk Factors] | Competition and renewal pricing, plus the need to keep pace with changing threats and products. [Q2 2026 10-Q, Risk Factors] |
| Delivery and other cloud applications | Media delivery plus web and mobile performance, together with other cloud applications. | 36.0% ($395.927m ÷ $1,099.682m) [Q2 2026 10-Q, Note 11 (Revenue from Contracts with Customers), p.23] | Not disclosed | Not disclosed; no solution-level cost or profit is reported. [Q2 2026 10-Q, Note 14 (Segment Information), p.25] | Not disclosed; network costs are disclosed only for the consolidated segment. [Q2 2026 10-Q, Note 14 (Segment Information), p.25] | High — inference, not from filings; the company identifies content-traffic fluctuations, customer cost optimisation, DIY initiatives, and multi-provider sourcing as revenue drivers. [Q2 2026 10-Q, MD&A—Revenue, p.30; Risk Factors] | Downward renewal pricing and traffic moving to DIY or other providers. [Q2 2026 10-Q, MD&A—Revenue, p.30] |
| Cloud infrastructure services (CIS) | Compute, storage, EdgeWorkers, and partner solutions running on Akamai's compute platform. | 9.0% ($99.319m ÷ $1,099.682m) [Q2 2026 10-Q, Note 11 (Revenue from Contracts with Customers), p.23] | Not disclosed | Not disclosed; no solution-level cost or profit is reported. [Q2 2026 10-Q, Note 14 (Segment Information), p.25] | High — management said CIS requires capital expenditure to build the business; category-level capital expenditure is not reported. [Citi 2026 Global TMT Conference, 2026-09-09, management discussion] | Not disclosed; the filing provides no category-level cycle or utilisation measure. | Capacity-investment and customer-adoption execution risk — inference, not from filings, based on the disclosed need for CIS capital expenditure. [Citi 2026 Global TMT Conference, 2026-09-09, management discussion] |

The three revenue shares total 100.0% before rounding. Their Q2 2026 revenue changes were +10% for Security, -6% for Delivery and other cloud applications, and +39% for CIS. [Q2 2026 10-Q, MD&A—Revenue, p.30]

## 2. Dominant Segment

Security is the dominant economic category by revenue: $604.436 million, or 55.0% of Q2 2026 revenue. It is the largest published solution category, ahead of Delivery and other cloud applications at 36.0% and CIS at 9.0%. [Q2 2026 10-Q, Note 11 (Revenue from Contracts with Customers), p.23]

Profit dominance is not assessable. AKAM's chief operating decision-maker receives consolidated net income and the company does not accumulate discrete financial information for its solution categories. Formally, AKAM is therefore a single reportable segment (100% of reported revenue), but it is not a single economic revenue category: no published category exceeds 85%. [Q2 2026 10-Q, Note 14 (Segment Information), p.25]

## 3. Segment Disclosure Quality

Disclosure is adequate for revenue mix but not for category economics. FY25 reported Security, Delivery, and Cloud Computing; from Q1 2026, AKAM began separately reporting CIS and combined Delivery with other cloud applications, while recasting prior periods. The change makes the new CIS series usable from the recast history, but FY25's former standalone Delivery figure is not directly comparable with the new Delivery-and-other-cloud-applications category. [FY25 10-K, MD&A—Revenue, p.31; Q2 2026 10-Q, Note 11, p.23]

There is no Corporate or Other reportable segment. However, the combined Delivery-and-other-cloud-applications line contains $95.362 million of "other cloud applications" in Q2 2026, 8.7% of total revenue, so the 36.0% combined line is not pure delivery. [Supplemental Financial Information, 2nd Quarter 2026, Supplemental Revenue sheet] AKAM reports in USD under US GAAP, but only one operating-segment profit and asset view; category margins, profit shares, capital employed, and capital expenditure are not disclosed. [Q2 2026 10-Q, Note 1 (Basis of Presentation), p.10; Note 14, p.25]

Reconciliation check: the deterministic CIQ fact reports FY25 "Providing Cloud Services" revenue of $4.208 billion, 100% of total revenue. This agrees with the $4.208 billion total in the filing's one-segment table; the filing, not the vendor label, is used for the reportable-segment conclusion. [CIQ Financials→Segments (Revenues, latest annual column) — vendor basis; FY25 10-K, Note 21 (Segment and Geographic Information), p.92]

## 4. Citations

- FY25 Form 10-K (year ended 2025-12-31): MD&A—Revenue, p.31; Note 16, p.83; Note 21, p.92.
- Q2 2026 Form 10-Q (three and six months ended 2026-06-30): Note 1, p.10; Note 11, p.23; Note 14, p.25; MD&A—Revenue, p.30; Risk Factors.
- Supplemental Financial Information, 2nd Quarter 2026, Supplemental Revenue sheet (unaudited): revenue category amounts, recast history, and subcategory detail.
- Citi 2026 Global TMT Conference, 2026-09-09, management discussion: management's category-capital-intensity characterisation. This is a transcript, not a filing.



---

## business-model / 04_unit-economics.md

_Source: `04_unit-economics.md`_

# Unit Economics — AKAM

## 1. Natural Unit

AKAM reports in USD under US GAAP. The natural economic unit for Security is an enterprise customer contract that protects a customer's infrastructure, websites, applications, APIs, networks, and users. Security was the dominant published economic category at $604.436 million, or 55.0% of Q2 2026 revenue. [Q2 2026 Form 10-Q, Note 1, p.10; Note 11, p.23]

Secondary units are delivery traffic under customer contracts and cloud-infrastructure capacity commitments; their economics differ and are not used in the table below.

## 2. Unit Economics Table

| Unit Economic | Value | Period | Direction vs Prior Year (Improving / Stable / Deteriorating / Unknown) | Evidence |
|---|---|---|---|---|
| Revenue per unit | Not disclosed. Security revenue was $604.436m, but AKAM does not disclose the number of Security customers or revenue per Security customer. | Q2 2026 | Unknown | [Q2 2026 Form 10-Q, Note 11, p.23] |
| Gross margin per unit | Not disclosed. Consolidated GAAP gross margin was 55.8%: $613.750m gross profit / $1.099682bn revenue. This is not a Security margin. | Q2 2026 | Deteriorating for the consolidated measure: 55.8% versus 59.1% in Q2 2025, down 331 basis points; Security direction is unknown. | [Q2 2026 Form 10-Q, Condensed Consolidated Statements of Income, p.5] |
| Contribution margin per unit (after variable costs) | Not disclosed. AKAM provides no Security-category cost of revenue, direct service cost, or contribution margin. | Q2 2026 | Unknown | [Q2 2026 Form 10-Q, Note 14 (Segment Information), p.25] |
| Cost to acquire / build the unit | Not disclosed per unit. AKAM capitalized $24.728m of commissions and incentives in Q2 2026, an aggregate measure rather than customer-acquisition cost. | Q2 2026 | Unknown: the aggregate capitalized amount was up 39% from $17.783m, but the filing gives neither new-customer count nor contract-value mix. | [Q2 2026 Form 10-Q, Note 4 (Incremental Costs to Obtain a Contract with a Customer), pp.15–16] |
| Payback period or unit lifetime | No payback period is disclosed. The company uses an expected customer-arrangement life of about four years to amortize certain commissions; this is a company-wide accounting estimate, not a Security-customer lifetime. | FY25 | Unknown | [FY25 Form 10-K, Significant Accounting Policies—Incremental Costs to Obtain a Contract with a Customer, pp.60–61] |

## 3. Value Creation Read

**Verdict: Unclear.** Security revenue rose 10% year on year to $604.436m, but category revenue alone does not show that an incremental Security customer contract creates value. [Q2 2026 Form 10-Q, Note 11, p.23; MD&A—Revenue, p.30] The consolidated GAAP gross-margin decline to 55.8% from 59.1% could reflect mix and costs outside Security, because category costs are not disclosed; it therefore neither proves nor disproves a deterioration in the Security unit. [Q2 2026 Form 10-Q, Condensed Consolidated Statements of Income, p.5; Note 14, p.25] The required test—Security customer contribution margin multiplied by customer lifetime against incremental sales cost—cannot be performed; the highest-value missing disclosure is a Security customer-cohort table linking new and renewed revenue, direct service cost, retention/lifetime, and commissions.

## 4. Sensitivity

Realised Security renewal price per customer would most change the read if it moved 20%, because it changes recurring contract revenue while some commissions and incentives are paid up front when arrangements are signed, renewed, or upgraded. AKAM says pricing at renewals affects revenue and that some Security and Delivery customer prices have declined in recent years because of competition, partly offset by upselling; it does not quantify Security retention, realised price, or direct cost, so the 20% effect and historical volatility cannot be calculated. [Q2 2026 Form 10-Q, MD&A—Revenue, pp.27–28; FY25 Form 10-K, Significant Accounting Policies—Incremental Costs to Obtain a Contract with a Customer, pp.60–61]



---

## business-model / 05_customer-geography.md

_Source: `05_customer-geography.md`_

# Customer And Geography Map — AKAM

## 1. Customer Map

| Customer Type | Importance (% of revenue if disclosed) | Long-term Contract? (Y/N/Not disclosed) | Evidence | Risk |
|---|---|---|---|---|
| Global enterprise customers, including named commercial examples such as Adobe, Airbnb, Comcast, eBay, Fidelity Investments, Sony Interactive Entertainment and Telefónica | Not disclosed by customer or customer type. No customer was 10% or more of FY23, FY24, or FY25 revenue. | Y, generally: Akamai says it primarily sells under contracts with terms of one year or longer. Individual terms and renewal exposure are not disclosed. | [FY25 10-K, p.7; Q2 FY26 10-Q, p.27] | Some delivery and security customers have accepted lower prices at renewal; media and gaming customers have also reduced traffic through cost optimisation. Most agreements have service-level commitments, and failure can result in credits or termination. [Q2 FY26 10-Q, pp.27–28; FY25 10-K, p.13] |
| U.S. public-sector customers, including the Departments of Defense, Labor, Transportation and Treasury | Public-sector revenue is not separately disclosed. Less than 10% of total FY23–FY25 revenue came from federal contracts or subcontracts terminable at the federal government's election. | Not disclosed. The disclosed terminable federal-contract subset can be ended at the government's election. | [FY25 10-K, p.7] | The disclosed at-will federal subset is small on the reported basis, but renewal and termination rights make it less secure than the general one-year-or-longer contract description. |
| Unnamed leading U.S.-based robotics technology company — cloud infrastructure services | Revenue share not disclosed. Management disclosed a four-year, $600 million GPU-services deal and said it should not have a material FY26 revenue impact, with full ramp expected in 2027. The $600 million is total contract value, not annual revenue, so it is not converted into a revenue percentage. | Y — four-year deal. | [Q2 FY26 earnings call, 2026-08-06, prepared remarks] | This is a prospective large-customer dependency once ramped; its current and future revenue share, renewal terms and customer identity are not disclosed. |

## 2. Geography Map

| Geography | % of Revenue | Trend (Growing / Stable / Declining / Unknown) | Evidence | Risk |
|---|---:|---|---|---|
| U.S. | 51% in FY25 | Growing in dollars: $2.139 billion, up 3% in FY25. The share eased from 52% in FY24 to 51%; it was 50% in H1 FY26, when U.S. revenue grew 4% year on year. | [FY25 10-K, p.32; Q2 FY26 10-Q, p.31] | It is the only disclosed geography above 50% of FY25 revenue. The filing does not disclose the duration or committed value of U.S. revenue specifically. |
| International | 49% in FY25 | Growing: $2.069 billion, up 8% in FY25; H1 FY26 revenue was up 8% year on year. No country outside the U.S. was 10% or more of revenue in FY23–FY25 or H1 FY26. | [FY25 10-K, p.32; Q2 FY26 10-Q, p.31] | Revenue translated into USD is exposed to foreign-exchange movements; international operations also face local regulation, geopolitical conditions and cross-border data-transfer constraints. [FY25 10-K, p.49] |

## 3. Concentration Flags

| Concentration Flag | Triggered (Y/N) | Evidence |
|---|---|---|
| One customer >20% of revenue | N | No customer accounted for 10% or more of total revenue in FY23, FY24 or FY25. [FY25 10-K, p.7] |
| Top 3 customers >40% of revenue | N | Because every individual customer was below 10% of FY23–FY25 revenue, the three largest together were below 30%, which is below the 40% trigger. [FY25 10-K, p.7] |
| One geography >50% of revenue | Y | U.S. revenue was $2.139 billion, or 51% of FY25 revenue. [FY25 10-K, p.32] |
| One customer or geography >30% with no long-term contract disclosed | Y | U.S. revenue was 51% in FY25. Akamai describes its customer contracts generally as terms of one year or longer, but does not disclose the contract duration, committed revenue or renewal coverage of the U.S. revenue pool; the geographic concentration therefore is not shown to be contractually secured. [FY25 10-K, p.32; Q2 FY26 10-Q, p.27] |

## 4. Read

Customer concentration is not indicated: no customer reached even 10% of FY23–FY25 revenue, although the filing does not disclose customer-level shares below that threshold. Geography is the concentration to carry forward: the U.S. supplied 51% of FY25 revenue, before easing to 50% in H1 FY26; international revenue is broad enough that no non-U.S. country reached 10%. Akamai says it primarily sells on contracts of one year or longer, but it does not tie term or committed revenue to the U.S. pool, so this geographic share should not be treated as contractually secured. The single biggest dependency is U.S. customer demand, which generated 51% of FY25 revenue. [FY25 10-K, pp.7, 32; Q2 FY26 10-Q, pp.27, 31]



---

## business-model / 06_value-chain.md

_Source: `06_value-chain.md`_

# Value Chain Position — AKAM

## 1. Stages Occupied

| Value Chain Stage | Company Role (1 sentence) | Bargaining Power vs Upstream | Bargaining Power vs Downstream | Evidence |
|---|---|---|---|---|
| Distributed internet platform / service provider | Akamai buys network capacity, co-location space, power and server equipment, then operates a global edge network to sell security, delivery and cloud services to enterprises. | Mid | Mid | Its network had more than 4,300 edge points of presence in over 130 countries at December 31, 2025, but it depends on third-party telecom providers and co-location facilities for bandwidth and server space. [FY2025 Form 10-K, Item 1, p. 3; Item 1A, pp. 16–17] |
| Cybersecurity service provider | It sells application, API, network and other security services through contracts and renewals, with professional and managed support around those services. | Mid | Mid | Security revenue was $604.4m in Q2 2026, up 10% year on year, but the filing says competitive pressure has affected certain security-renewal prices. [Q2 2026 Form 10-Q, p. 30; FY2025 Form 10-K, Item 1A, pp. 10–11] |
| Cloud-infrastructure service provider | It turns leased and owned compute, networking and data-centre capacity into contracted and usage-based cloud infrastructure services. | Mid | Mid | Cloud infrastructure services revenue was $99.3m in Q2 2026, up 39%, while cost growth reflects co-location, bandwidth, network build-out and partner costs. [Q2 2026 Form 10-Q, pp. 30–32] |
| Content and application delivery service provider | It delivers customer web, media, game and application traffic over its network under contracted commitments and usage above those commitments. | Mid | Weak | Delivery and other cloud-applications revenue fell 6% year on year in Q2 2026, driven by lower renewal pricing; management also cited customer cost optimisation that reduced traffic. [Q2 2026 Form 10-Q, p. 30] |

## 2. Input Cost Pass-Through

| Axis | What it asks | Verdict | Evidence |
|---|---|---|---|
| **Contractual pass-through** | Is there an escalator, indexed-pricing, or cost-plus clause that moves price automatically? | **Partial.** The filing says typical customer contracts state a committed price, minimum usage and the rate for usage above that minimum, but it does not disclose a general cost-plus or indexed-pricing clause. In Q2, the CFO said that large cloud-infrastructure-services (CIS) contracts can contain annual escalators and mechanisms for changes in hardware, memory, labour and power costs. The CIS revenue share covered by those mechanisms is not disclosed. | [FY2025 Form 10-K, Note 2 — Revenue Recognition, pp. 63–64; Q2 2026 earnings call, CFO Q&A] |
| **Realised recovery** | Of a given input-cost increase, how much did the company actually recover — through price, mix, hedging, re-sourcing, or a cost programme? | **Not computable from the pool.** Akamai does not disclose a gross pre-mitigation input-cost shock and the matched margin impact needed for the required calculation. The Q2 cost-of-revenue increase is a blended result of capacity build-out, partner costs, staffing, depreciation and compensation, not a clean input-inflation measure. | [Q2 2026 Form 10-Q, pp. 31–32] |

Company-wide realised recovery cannot therefore be calculated as `1 − observed margin impact ÷ gross pre-mitigation impact`. The right conclusion is not “no pass-through.” The filing gives evidence of two different mechanisms. First, **cost absorption**: FY2025 bandwidth fees fell $40.2m, or 17%, to $192.9m as Akamai improved vendor-renewal pricing and network efficiency; it also reduced third-party cloud costs by migrating work onto its own compute platform. [FY2025 Form 10-K, Item 7, pp. 29, 33] Second, **price pass-through in a subset of CIS deals**: the CFO said in August 2026 that follow-on CIS orders can be marked up when new hardware costs more and that large contracts generally include mechanisms to consider memory or hardware-price movements. This is management commentary, not a disclosed measured recovery rate. [Q2 2026 earnings call, CFO Q&A]

The residual cost exposure remains material. In Q2 2026, cost of revenue increased 14% to $485.9m while revenue grew 5% to $1.100bn, so cost of revenue rose to 44% of revenue from 41%. Co-location cost rose 14% to $99.5m, bandwidth fees 17% to $53.5m, and network build-out/supporting services 28% to $74.4m. The filing attributes the increases partly to platform investment and partner costs, and says hyperscaler-driven co-location, server and memory price increases are raising costs; this 300-basis-point change is not a measure of pass-through because the disclosed cost lines combine both price and capacity/mix effects. [Q2 2026 Form 10-Q, pp. 31–32]

**Supplier / input concentration.** Akamai discloses no largest-supplier or top-three purchase share, and identifies no single-source input; that dependency is **not disclosed**, not zero. It has long-term bandwidth agreements with network and internet-service providers and purchase orders that may include minimum commitments. Its material exposure is to input categories—transmission capacity, co-location space and power, servers and memory—rather than to a named supplier in the available pool. Those inputs can be scarce because large cloud providers have priority access to capacity and power. [FY2025 Form 10-K, Item 1A, pp. 16–17; Item 7, p. 46]

## 3. Customer Pricing Power

Pricing power is uneven by product. In FY2025, Akamai said prices paid by some delivery and security customers had declined at renewal because of competition; it partly offset the revenue effect by upselling additional services, seeking multi-year terms, and changing charges to keep traffic volumes, unit prices and higher input costs aligned. [FY2025 Form 10-K, Item 7, pp. 28–29] The latest explicit action is adverse: Q2 2026 delivery and other cloud-applications revenue fell 6% to $395.9m because of lower renewal pricing, while customer cost optimisation reduced traffic. The filing does not separate the price effect from the traffic effect, so the volume reaction to the price change is not assessable. [Q2 2026 Form 10-Q, p. 30] This contrasts with security revenue, which grew 10% to $604.4m, and CIS, which grew 39% to $99.3m; those growth rates do not by themselves prove pricing power. [Q2 2026 Form 10-Q, p. 30]

Customer concentration reduces single-account bargaining leverage but does not remove usage risk. No customer exceeded 10% of FY2025, FY2024 or FY2023 revenue. The contrary and more granular risk disclosure is that Akamai relies on some larger customers for a significant part of its traffic; a large social-media customer’s DIY optimisation reduced network traffic and revenue in 2024 and may continue to do so. Both facts can be true: the company has no reportable 10% customer while large accounts can still materially affect variable usage and renewal discussions. [FY2025 Form 10-K, Item 1, p. 7; Q2 2026 Form 10-Q, Item 1A]

## 4. Economic Control Verdict

**Mixed.** Akamai has a large installed network, contracted revenue and no disclosed 10%-plus customer, which gives it some negotiating room. But it does not set terms uniformly: delivery renewals have required lower prices, and capacity expansion depends on co-location, power, bandwidth and server inputs whose cost and availability are affected by hyperscalers. The stronger CIS contract mechanisms are limited to an undisclosed subset of business and do not establish company-wide economic control. [FY2025 Form 10-K, Item 7, pp. 28–29; Q2 2026 Form 10-Q, pp. 30–32]

## 5. The Single Biggest Bargaining Risk

**Supply side:** securing sufficient co-location space and power, plus servers and memory, at economic terms as CIS expands; the filing says hyperscaler demand is already increasing those input costs. [Q2 2026 Form 10-Q, p. 32]



---

## business-model / 07_business-quality.md

_Source: `07_business-quality.md`_

# Business Quality — AKAM

No sector overlay for global cloud-security, edge/cloud-infrastructure, and content-delivery services — generic 11-factor scoring applies. [FY2025 Form 10-K, Item 1, pp. 3–5]

## 1. Quality Factor Table

| Quality Factor | Score /100 | Evidence | Comment |
|---|---:|---|---|
| Pricing power *(higher = better)* | 43 | Some delivery and security customers have accepted lower prices at renewal because of competition; AKAM is seeking multi-year renewal terms that better reflect hyperscaler-driven cost increases and traffic volumes. [Q2 2026 Form 10-Q, MD&A—Revenue] | Contracts provide a negotiating point, but realized renewal-price pressure means pricing power is mixed rather than established. |
| Repeat / recurring revenue *(higher = better)* | 73 | AKAM primarily sells services under contracts of one year or longer, which it says provide a consistent base of revenue. [Q2 2026 Form 10-Q, MD&A—Revenue, p.26] | Good contractual recurrence. Remaining term, committed revenue and RPO are not disclosed, so the coverage cannot be measured. |
| Customer stickiness *(higher = better)* | 68 | No customer accounted for 10% or more of FY23–FY25 revenue; contracts are generally one year or longer. [FY2025 Form 10-K, p.7; Q2 2026 Form 10-Q, MD&A—Revenue, p.26] | Broad customer exposure and embedded services support retention, but delivery customers can optimize traffic, use multiple providers, or move toward pay-as-you-go models. [Q2 2026 Form 10-Q, Risk Factors—Customers and Revenue] |
| Margin stability *(higher = better)* | 35 | Q2 2026 gross margin was 55.8%: $613.750m gross profit ($1,099.682m revenue minus $485.932m cost of revenue) ÷ $1,099.682m revenue, versus 59.1% in Q2 2025 ($616.959m ÷ $1,043.494m). [Q2 2026 Form 10-Q, Consolidated Statements of Income] CIQ’s mechanically parsed financial workbook likewise shows gross margin falling from 63% in FY21 to 57% LTM June 2026 and EBITDA margin from 34% to 25%. [CIQ Financials→Income Statement, margin trend through LTM June 30, 2026 — vendor export] | The 330bp year-on-year gross-margin fall and multi-year vendor trend outweigh the fact that revenue is growing. |
| Capital intensity *(low intensity = high score)* | 40 | H1 2026 total capital expenditure was $417.600m: $246.613m property and equipment plus $170.987m capitalized internal-use software; this was 19.2% of $2,173.292m H1 revenue and compared with $638.774m CFO. [Q2 2026 Form 10-Q, Consolidated Statements of Cash Flows] AKAM says capex has risen and is expected to continue rising for cloud infrastructure, AI capabilities and network capacity. [Q2 2026 Form 10-Q, Risk Factors—Indebtedness and Capital Expenditures] | The legacy network is capital-heavy, and the CIS expansion increases that burden. Security may be less capital-intensive, but solution-level capex is not disclosed. |
| Competitive intensity *(low intensity = high score)* | 32 | AKAM says renewal prices for some delivery and security customers have declined because of competition, and its costs are affected by hyperscaler market dynamics. [Q2 2026 Form 10-Q, MD&A—Revenue and Expenses] | Competition is already visible in realized price rather than only risk-factor language; upselling mitigates some effect but does not prove durable pricing. |
| Industry rate-of-change / disruption risk *(low rate-of-change = high score)* | 35 | AKAM has entered direct AI inferencing at the edge, where it faces established and emerging AI-infrastructure competitors; the filing calls AI technology and its regulatory environment rapidly evolving. [Q2 2026 Form 10-Q, Risk Factors—AI] | The security, cloud and edge competitive set is changing fast. The small but rapidly growing CIS category adds execution risk rather than a settled long-run advantage. |
| Regulatory dependence *(low dependence = high score)* | 53 | Privacy, data-transfer, cloud-sovereignty, content-liability, security, sanctions and export-control rules can affect revenues, costs and customer relationships. [Q2 2026 Form 10-Q, Risk Factors—Legal and Regulatory Risks, pp. 56–58] | Regulation is material to a global internet-infrastructure provider, but the pool does not show a direct price-setting regime or a lost operating licence. |
| Commodity dependence *(low dependence = high score)* | 76 | AKAM is not a commodity producer or price-taker. Its input exposure is to co-location capacity, bandwidth, energy, servers and memory; the filing reports hyperscaler-driven increases in co-location, server and memory costs. [Q2 2026 Form 10-Q, MD&A—Expenses] | Low direct commodity dependence, with meaningful infrastructure-input cost exposure that belongs in margin monitoring. |
| Cyclicality *(low cyclicality = high score)* | 48 | One-year-or-longer contracts support a revenue base, but traffic varies with customer optimization, macro conditions, software and gaming releases, holidays, and large media events. [Q2 2026 Form 10-Q, MD&A—Revenue] Delivery and other cloud applications revenue fell 6% year on year in Q2 2026. [Q2 2026 Form 10-Q, Note 11, p.23] | Less cyclical than an ad-funded media business, but usage-based delivery demand and renewal budgets leave a meaningful cycle. |
| Disclosure quality *(higher = better)* | 58 | AKAM reports in USD under US GAAP and provides three solution-category revenue lines, but it is one reportable segment and does not disclose solution-category profit, assets, capital employed or capital expenditure. [Q2 2026 Form 10-Q, Note 1, p.10; Note 14, p.25] | The filings are usable, but category economics and contract-coverage measures needed to test the growth mix are not disclosed. |

## 2. Aggregate Quality Score

**48 /100 — Mixed/Average.**

The aggregate weights revenue durability at 40% (pricing power 15%, recurring revenue 15%, stickiness 10%), unit economics and reinvestment at 37% (margin stability 15%, capital intensity 10%, competitive intensity 12%), industry rate-of-change at 12%, and regulation, commodity inputs, cyclicality and disclosure at the remaining 11%. Contracted revenue and a broad customer base lift the score, but realized renewal-price pressure, declining margins, rising infrastructure spend and the fast-changing AI/cloud market set the result.

## 3. Strongest Factor & Weakest Factor

| | Factor | Score | Why |
|---|---|---:|---|
| Strongest | Repeat / recurring revenue | 73 | AKAM primarily sells on contracts of one year or longer, giving a base level of revenue; the undisclosed RPO and remaining-term profile prevent a higher score. [Q2 2026 Form 10-Q, MD&A—Revenue, p.26] |
| Weakest | Competitive intensity | 32 | Some security and delivery customers have renewed at lower prices because of competition; this is observed pressure on revenue, not merely a theoretical risk. [Q2 2026 Form 10-Q, MD&A—Revenue] |

## 4. Read

Akamai is a contracted enterprise-infrastructure business with a useful recurring base, but current evidence does not support treating it as a durable compounder: Security was 55.0% of Q2 2026 revenue and grew 10%, cloud infrastructure services were 9.0% and grew 39%, while Delivery and other cloud applications were 36.0% and fell 6%; solution-category profit is not disclosed. [Q2 2026 Form 10-Q, Note 11, p.23; Note 14, p.25] Renewal-price pressure and capacity costs have coincided with a gross-margin fall from 59.1% in Q2 2025 to 55.8% in Q2 2026, so gross margin and renewal pricing are the single quality factor to watch over the next 24 months. [Q2 2026 Form 10-Q, Consolidated Statements of Income; MD&A—Revenue and Expenses] The industry rate-of-change score of 35 means this looks closer to a sector / technology-cycle bet than a durable compounder. The reported margin is not at a cyclical peak; it has fallen, so no peak-margin adjustment is used.

RF-BQ-005 (fast-changing industry: rate-of-change ≤40)



---

## business-model / 08_competitive-map.md

_Source: `08_competitive-map.md`_

# Competitive Map — AKAM

## 1. Dominant Segment

Security is Akamai's largest published solution category: $604.436 million, or 55.0% of Q2 2026 revenue. It covers web application firewall (WAF), API security, bot management, DDoS protection and related network-security products. [Q2 2026 Form 10-Q, Note 11 (Revenue from Contracts with Customers), p.23; FY2025 Form 10-K, Item 1, pp.3–4]

## 2. Named Competitors

### Competitor A — Cloudflare

- **Ticker / listing:** NYSE: NET. [CIQ Company Comparable Analysis, Business Description sheet, 2026-09-14 — vendor export]
- **Where they compete:** Cloudflare sells WAF, bot management, DDoS mitigation and API security, as well as content delivery, application performance and network-security products. These overlap directly with Akamai's Security category and parts of its delivery offering. [CIQ Company Comparable Analysis, Business Description sheet, 2026-09-14 — vendor export; FY2025 Form 10-K, Item 1, pp.3–5]
- **Scale:** LTM revenue of $2.512 billion; the latest income-statement filing date in the comparable workbook is 2026-08-06. [CIQ Company Comparable Analysis, Financial Data sheet, 2026-09-14 — vendor export]
- **Profitability / return on capital:** LTM EBITDA margin was -0.1% and LTM EBIT margin was -7.8%. ROIC and ROE are not supplied for Cloudflare in the available peer workbook and were not independently verified from a peer filing in this evidence pool. [CIQ Company Comparable Analysis, Operating Statistics sheet, 2026-09-14 — vendor export]
- **Source named in:** Capital IQ's default AKAM comparable set and the corresponding Cloudflare business description. Akamai's FY2025 10-K describes the overlapping competitor types but does not name individual vendors. [CIQ Company Comparable Analysis, Business Description sheet, 2026-09-14 — vendor export; FY2025 Form 10-K, Item 1—Competition, p.8]
- **One-line read:** The closest broad platform rival in the available peer set: it pairs application security with performance and content-delivery services on one network.

### Competitor B — Fortinet

- **Ticker / listing:** NasdaqGS: FTNT. [CIQ Company Comparable Analysis, Business Description sheet, 2026-09-14 — vendor export]
- **Where they compete:** Fortinet offers web application firewalls, cloud and cloud-native application protection, secure web gateway, zero-trust access and network-security products. This overlaps with Akamai's WAF, API, DDoS and network-security work, though the available sources do not establish a like-for-like global delivery-network comparison. [CIQ Company Comparable Analysis, Business Description sheet, 2026-09-14 — vendor export; FY2025 Form 10-K, Item 1, pp.3–4]
- **Scale:** LTM revenue of $7.527 billion; the latest income-statement filing date in the comparable workbook is 2026-07-30. [CIQ Company Comparable Analysis, Financial Data sheet, 2026-09-14 — vendor export]
- **Profitability / return on capital:** LTM EBITDA margin was 34.5% and LTM EBIT margin was 32.4%. ROIC and ROE are not supplied for Fortinet in the available peer workbook and were not independently verified from a peer filing in this evidence pool. [CIQ Company Comparable Analysis, Operating Statistics sheet, 2026-09-14 — vendor export]
- **Source named in:** Capital IQ's default AKAM comparable set and the corresponding Fortinet business description. Akamai's FY2025 10-K says its security products compete with hardware and software providers but does not name individual vendors. [CIQ Company Comparable Analysis, Business Description sheet, 2026-09-14 — vendor export; FY2025 Form 10-K, Item 1—Competition, p.8]
- **One-line read:** A much larger security-and-networking vendor whose application and cloud-security products make it a credible enterprise-security rival, rather than a pure content-delivery peer.

### Competitor C — Fastly

- **Ticker / listing:** NasdaqGS: FSLY. [CIQ Company Comparable Analysis, Business Description sheet, 2026-09-14 — vendor export]
- **Where they compete:** Fastly's edge-cloud platform combines CDN and application delivery with DDoS protection, next-generation WAF, bot management, API protection and account-takeover protection. That is a direct product overlap with Akamai's edge security and delivery products. [CIQ Company Comparable Analysis, Business Description sheet, 2026-09-14 — vendor export; FY2025 Form 10-K, Item 1, pp.3–5]
- **Scale:** LTM revenue of $687.2 million; the latest income-statement filing date in the comparable workbook is 2026-08-05. [CIQ Company Comparable Analysis, Financial Data sheet, 2026-09-14 — vendor export]
- **Profitability / return on capital:** LTM EBITDA margin was -5.6% and LTM EBIT margin was -12.0%. ROIC and ROE are not supplied for Fastly in the available peer workbook and were not independently verified from a peer filing in this evidence pool. [CIQ Company Comparable Analysis, Operating Statistics sheet, 2026-09-14 — vendor export]
- **Source named in:** Capital IQ's default AKAM comparable set and the corresponding Fastly business description. Akamai's FY2025 10-K says it competes in content delivery, security and cloud-computing solutions, without naming individual vendors. [CIQ Company Comparable Analysis, Business Description sheet, 2026-09-14 — vendor export; FY2025 Form 10-K, Item 1—Competition, p.8]
- **One-line read:** A smaller but directly overlapping edge-security and CDN competitor; its reported losses make it a different economic model from Fortinet, not evidence about Akamai's own category margin.

## 3. Competitive Position

**Position vs peers: Not disclosed.** Akamai does not publish a market-share series for Security, and the evidence pool has no matched Security-market denominator or peer market-share series. Security revenue rose 10% year on year to $604.436 million in Q2 2026, but revenue growth alone cannot show whether Akamai gained, held, or lost share. [Q2 2026 Form 10-Q, Note 11 (Revenue from Contracts with Customers), p.23] Akamai also warns that customers can use multi-vendor policies or build their own solutions, so a category revenue trend is not a clean share proxy. [FY2025 Form 10-K, Item 1A—Risk Factors, p.12]

## 4. Competitive Shape

**Fragmented, multi-layered competitive field — inference, not a measured concentration result.** Akamai says competitors range from startups with a discrete product to large technology and telecommunications companies, across content delivery, hosting, security and cloud computing; its filing also identifies customer self-build and multi-vendor use as alternatives. [FY2025 Form 10-K, Item 1—Competition, p.8; Item 1A—Risk Factors, pp.12–13] The Capital IQ default AKAM peer set displays ten non-Akamai companies, including the three named above, but it is a relevance-selected vendor list rather than market-share evidence. [CIQ Company Comparable Analysis, Business Description sheet, 2026-09-14 — vendor export] No HHI or top-N share data is available, so the report cannot support a numerical concentration claim.

## 5. Caveat

Akamai's own filing does not name individual competitors, and the frozen pool contains neither a security-market share study nor peer filings with ROIC/ROE figures. The named competitors therefore come from Capital IQ's vendor peer set, cross-checked against its product descriptions and Akamai's disclosure of the product categories it competes in. A same-market, dated WAAP/API/DDoS market-share source plus peer annual filings would resolve the concentration, share-position and peer-return gaps.



---

## business-model / 09_moat.md

_Source: `09_moat.md`_

# Moat — AKAM

## 1. Named Competitors

- **Cloudflare (NYSE: NET):** a direct edge-security, application-performance and content-delivery platform competitor. [CIQ Company Comparable Analysis, Business Description sheet, 2026-09-14 — vendor export]
- **Fortinet (NasdaqGS: FTNT):** an enterprise-security competitor with overlapping web-application firewall, cloud-security and zero-trust products, though the available evidence does not establish a like-for-like delivery-network comparison. [CIQ Company Comparable Analysis, Business Description sheet, 2026-09-14 — vendor export]
- **Fastly (NasdaqGS: FSLY):** a smaller edge-cloud competitor spanning CDN, WAF, bot management, DDoS and API protection. [CIQ Company Comparable Analysis, Business Description sheet, 2026-09-14 — vendor export]

## 2. Moat Sources

| Possible Moat | Present? (Y/N) | Evidence | Strength /100 |
|---|---|---|---:|
| Brand | N | The record does not disclose a measurable brand premium; instead, prices paid by some delivery and security customers have declined at renewal because of competition. [FY2025 Form 10-K, Item 7—MD&A, p.29] | 20 |
| Cost advantage | N | Akamai has improved bandwidth-provider pricing and network efficiency, but it reports rising co-location, server and memory costs and expects further cost-of-revenue growth. Savings in one input are not proof of a durable unit-cost lead. [FY2025 Form 10-K, Item 7—MD&A, pp.29–33; Q2 2026 Form 10-Q, MD&A—Cost of Revenue, p.32] | 25 |
| Distribution | Y | At 31 December 2025, Akamai had more than 4,300 edge points of presence in more than 130 countries and about 700 cities, connected to roughly 1,200 network partners. That footprint can improve latency, availability and local delivery. [FY2025 Form 10-K, Item 1—Business, p.3] | 80 |
| Scale | Y | The same global footprint gives Akamai traffic and attack-pattern visibility, and its own competition disclosure names massive distribution and network availability as purchase criteria. It remains costly to operate: the company is adding capacity before some locations are fully used. [FY2025 Form 10-K, Item 1—Business, p.3; Item 1—Competition, p.8; Item 7—MD&A, p.29] | 75 |
| Technology / IP | Y | Akamai owned or exclusively licensed more than 560 U.S. technology patents at 31 December 2025, alongside trade-secret, copyright and contractual protections. The patent portfolio is helpful, but the company says the market changes rapidly and it competes on continuing innovation as well as IP. [FY2025 Form 10-K, Item 1—Intellectual Property, p.9; Item 1—Competition, p.8] | 55 |
| Licenses / regulation | N | No exclusive operating licence or regulatory permission that prevents the named rivals from offering competing services is disclosed. Regulations are presented as compliance costs and constraints, not a protected right. [FY2025 Form 10-K, Item 1—Government Regulation, pp.8–9] | 0 |
| Network effects | N | A larger network supplies operational insight, but the filing does not show that each additional customer raises the product value for other customers or locks them in. This is scale, not a proven network effect. [FY2025 Form 10-K, Item 1—Business, p.3] | 25 |
| Switching costs | Y | Most service revenue is recognized over time under current non-cancellable contracts; remaining performance obligations were $7.6 billion at 30 June 2026, although this excludes uncommitted usage and anticipated renewals. Multi-year contracting and technical integration imply some switching friction, but the company also describes customer optimization and lower renewal prices. [Q2 2026 Form 10-Q, Note 11—Revenue from Contracts with Customers, p.23; FY2025 Form 10-K, Item 7—MD&A, p.29] | 55 |
| Natural resource access | N | No scarce natural-resource right is part of the disclosed business model. [FY2025 Form 10-K, Item 1—Business, pp.3–5] | 0 |
| Location advantage | Y | Edge placement close to users can reduce latency and improve delivery performance. It is an advantage of the distributed network, not exclusive ownership of locations: Akamai depends on network partners and third-party co-location capacity. [FY2025 Form 10-K, Item 1—Business, p.3; Q2 2026 Form 10-Q, Risk Factors—Capacity, co-location and equipment, p.52] | 45 |

The strongest advantages are structural distribution and scale, not a demonstrated ability to hold price or returns. No clear economic moat is proven from available data.

## 3. Competitive Economics

| Company / Competitor | Gross Margin | EBIT Margin | Return on capital (ROIC, or ROE for financials) | Period | Source |
|---|---:|---:|---:|---|---|
| Akamai | 57.5% | 11.9% | 2.7% ROIC | LTM to 30 Jun. 2026 | [CIQ Financials→Ratios, LTM Jun. 2026 — vendor export; source-bound fact `multi_year_trajectory`, status: present] |
| Cloudflare | 72.6% | -7.8% | Not disclosed | LTM; latest income-statement filing 6 Aug. 2026 | [CIQ Company Comparable Analysis, Operating Statistics and Financial Data sheets, 2026-09-14 — vendor export] |
| Fortinet | 80.2% | 32.4% | Not disclosed | LTM; latest income-statement filing 30 Jul. 2026 | [CIQ Company Comparable Analysis, Operating Statistics and Financial Data sheets, 2026-09-14 — vendor export] |
| Fastly | 61.5% | -12.0% | Not disclosed | LTM; latest income-statement filing 5 Aug. 2026 | [CIQ Company Comparable Analysis, Operating Statistics and Financial Data sheets, 2026-09-14 — vendor export] |

**Return on capital Not assessable against cost of capital:** **4.9% mean CIQ ROIC through FY2021–LTM June 2026, and 2.7% LTM ROIC, versus cost of capital not determinable from available data** — [CIQ Financials→Ratios; source-bound fact `multi_year_trajectory`, status: present — vendor export].

The frozen 10-K and 10-Q do not disclose a group WACC or cost of equity, and the frozen evidence gives neither a risk-free-rate nor equity-risk-premium source for a reproducible CAPM estimate. A convertible-note coupon or a CGU/lease comparator would not be the listed group's WACC, so neither is substituted. The economic-moat test is therefore **Not assessable**, not a reason to manufacture a spread.

There is no management-disclosed group ROIC/ROCE headline in the available filings to cross-check. As a check on the vendor series, I calculate LTM NOPAT (after-tax operating profit) as $417.3 million = $515.2 million LTM EBIT × (1 − 19%). The 19% tax rate is an inference, not from filings: it is the 18.7% arithmetic average of FY2022–FY2025 reported effective tax rates, rounded, and avoids carrying through the H1 2026 16.4% rate, which the company says benefited from excess stock-compensation tax benefits, a state-credit valuation-allowance change and higher R&D-credit benefits. [CIQ Financials→Income Statement, FY2022–FY2025 and LTM June 2026 — vendor export; Q2 2026 Form 10-Q, Note 12—Income Taxes, p.24]

On a gross-capital basis, average CIQ total debt (including lease-equivalent debt in the export) plus equity was $12.370 billion: ($5.675bn debt + $4.977bn equity at FY2025, plus $9.339bn debt + $4.749bn equity at 30 June 2026) ÷ 2. The resulting 3.4% ROIC is $417.3m ÷ $12.370bn. On a broad net-capital basis that also subtracts cash and marketable securities, the denominator is $10.099 billion and the result is 4.1%; this is not strict net debt because it nets investments as well as cash. Both are above the CIQ-reported 2.7% LTM ROIC, a material 0.7–1.4 percentage-point divergence whose vendor capital definition cannot be reconciled from the export. I use the lower 2.7% figure and its 4.9% six-period average for the conservative through-cycle read. [CIQ Financials→Balance Sheet and Income Statement, FY2025 and 30 Jun. 2026 — vendor export]

## 4. Where The Company Sits

**Relative to peers:** Insufficient data to compare the full named peer set on capital efficiency because none of the three peer ROIC/ROE figures is disclosed in the available peer workbook. On disclosed margins, Akamai is at the **bottom** of the three on gross margin and at the **median** on EBIT margin: it is below Fortinet but above loss-making Cloudflare and Fastly. [CIQ Company Comparable Analysis, Operating Statistics sheet, 2026-09-14 — vendor export]

**Absolute (the economic moat test):** the company earns a return on capital **Not assessable against its cost of capital** (2.7% LTM ROIC; 4.9% mean FY2021–LTM ROIC; WACC not determinable). That prevents peer-relative comparisons from being treated as economic-moat proof. [CIQ Financials→Ratios, FY2021–LTM June 2026 — vendor export]

## 5. Moat Verdict

**No moat proven — trajectory eroding (on profit economics; not confirmed across every metric).** Akamai's strongest advantage is its distributed network and scale (80/100), but the evidence does not show that this advantage defends customer pricing, margin or capital returns. The five-year durability test is whether the company can turn Security and cloud-infrastructure growth into sustained gross-margin and ROIC improvement while holding customer renewal pricing; solution-category profit and capital employed are not disclosed, so this cannot yet be tested directly. [FY2025 Form 10-K, Item 1—Business and Competition, pp.3, 8; Q2 2026 Form 10-Q, Note 14—Segments, p.25]

The fast-changing-industry filter applies: the upstream business-quality work assigned a 35/100 rate-of-change / disruption score, based on the company's entry into AI inferencing and its disclosure that AI technology and regulation evolve rapidly. That reduces the period over which distribution or IP can be underwritten. [Business Quality — AKAM, §1; Q2 2026 Form 10-Q, Risk Factors—AI]

**Trajectory evidence panel**

| Metric (same 3–5 year window) | Start | Latest | Direction | Supports / contradicts the stated trajectory |
|---|---:|---:|---|---|
| Gross margin | 63.3% (FY2021) | 57.5% (LTM Jun. 2026) | Down 588 bps | Supports erosion |
| EBITDA margin | 34.5% (FY2021) | 25.0% (LTM Jun. 2026) | Down 951 bps | Supports erosion |
| EBIT or operating margin | 23.3% (FY2021) | 11.9% (LTM Jun. 2026) | Down 1,140 bps | Supports erosion |
| Return on capital (ROIC / ROCE) vs cost of capital | 7.0% ROIC; WACC not disclosed | 2.7% ROIC; WACC not disclosed | ROIC down 430 bps; spread not assessable | Supports erosion in return; cannot establish the economic spread |
| Market share (or the closest disclosed volume/position proxy) | Not disclosed | Not disclosed | Not assessable | Neither; Security revenue growth is not a market-share measure |
| Cash conversion (CFO ÷ EBITDA) | 117.7% (FY2021) | 134.0% (LTM Jun. 2026) | Up 16.3 percentage points | Contradicts erosion |
| Pricing / realised price or mix | Quantified 3–5 year price series not disclosed | Some delivery and security renewal prices declined; Q2 Delivery revenue fell partly from downward renewal pricing | Negative, but not quantified over the full window | Supports erosion, with limited precision |

The margin and return rows point down: gross margin fell from 63.3% to 57.5%, EBITDA margin from 34.5% to 25.0%, EBIT margin from 23.3% to 11.9%, and vendor ROIC from 7.0% to 2.7%. The 16.3-point rise in CFO/EBITDA is the material contradiction; it shows cash conversion improved even as accounting margins and return on capital fell, so it cannot be ignored. It does not overturn the trajectory call because cash conversion is a cash-flow conversion ratio rather than evidence that the network earns a higher price or return on incremental capital; however, absent a market-share series and a quantified multi-year price series, the report does not call erosion confirmed across all measures. [CIQ Financials→Income Statement, Cash Flow and Ratios, FY2021–LTM June 2026 — vendor export; FY2025 Form 10-K, Item 7—MD&A, p.29; Q2 2026 Form 10-Q, MD&A—Revenue, p.30]

The single next data point that would flip this read is a year-on-year improvement in consolidated gross margin in the next Q3 2026 Form 10-Q, alongside a disclosure that renewal pricing has stopped declining. The next Q3 filing is the relevant evidence event; its exact filing date is not established in the frozen data.



---

## business-model / 10_external-dependency.md

_Source: `10_external-dependency.md`_

# External Dependency Check — AKAM

## 1. Dependency Table

| External Variable | Dependency Level (Low / Mid / High) | Why It Matters | Evidence |
|---|---|---|---|
| Commodity prices | Low | Akamai does not disclose a direct commodity-price sensitivity. Energy and server-component costs matter, but they are better captured in the data-centre-capacity row below; treating them as a commodity pass-through would overstate the evidence. | [Q2 2026 Form 10-Q, Item 2—Global Economic Conditions and Cost of Revenue, pp. 31–32] |
| Interest rates | Low | Direct financial-rate exposure is limited: its $7.64bn convertible notes carry fixed rates and the two variable-rate credit facilities had no borrowings at 30 June 2026. Rates can still affect customers' IT budgets, which is included in the enterprise-spending row. | [Q2 2026 Form 10-Q, Item 3—Interest Rate Risk, p. 43] |
| FX | Low | International revenue was 50% of Q2 revenue ($549.3m of $1,099.7m), but a hypothetical 10% move in the US dollar was not material to the interim financial statements. Akamai uses short-term currency forwards for transaction remeasurement; related six-month gains and losses were immaterial. Reported Q2 revenue was reduced by $1.1m from FX, while the six-month comparison benefited by $17.5m. | [Q2 2026 Form 10-Q, Item 2—Revenue by geography, p. 31; Item 3—Foreign Currency Risk, p. 43] |
| Freight / logistics rates | Low | No separately quantified freight-rate exposure is disclosed. Logistics disruption matters indirectly because the company must source and deploy global server equipment, but the filing gives no freight-cost sensitivity. | [Q2 2026 Form 10-Q, Risk Factors—Capacity, co-location and equipment, p. 52] |
| Data-centre capacity, power, and server/memory supply | High | Akamai depends on third-party bandwidth, co-location space and power, and on server equipment. Hyperscaler-led demand, energy costs, component prices, data-centre space and power availability are outside management's control. Q2 co-location cost rose 14% year on year to $99.5m, bandwidth fees 17% to $53.5m and network build-out/support 28% to $74.4m; total cost of revenue rose 14% while revenue rose 5%. The filing attributes part of this increase to Akamai's own build-out and partner programme, so these figures do not isolate external inflation. | [Q2 2026 Form 10-Q, Item 2—Cost of Revenue, p. 32; Risk Factors—Capacity, co-location and equipment, p. 52] |
| Government policy | Mid | Tariffs, export controls, sanctions and digital-sovereignty rules can raise hardware costs, disrupt supply, restrict cross-border services or reduce customers' purchasing power. The pool does not quantify a current revenue or cost effect. | [Q2 2026 Form 10-Q, Risk Factors Summary and Global Conditions, pp. 45–47] |
| Regulation | High | Data-transfer restrictions, data localization, cloud sovereignty, content rules and AI/cloud regulation can require local infrastructure, product changes or compliance work, and can restrict service in particular markets. The filing identifies possible effects but does not quantify them, so the level reflects breadth of exposure rather than a measured financial impact. | [FY2025 Form 10-K, Risk Factors—Other regulatory developments, pp. 21–22; Q2 2026 Form 10-Q, Risk Factors Summary, p. 45] |
| Weather | Low | Weather can increase the cost of powering and cooling hardware and natural disasters can disrupt utility, telecommunications and data-centre infrastructure. The distributed network provides some operational mitigation, but no realised weather impact or sensitivity is disclosed. | [FY2025 Form 10-K, Risk Factors—Global climate change and other disruptions, p. 59; Q2 2026 Form 10-Q, Risk Factors—Capacity, co-location and equipment, p. 52] |
| Geopolitics | Mid | Conflict can disrupt energy, cables, transport, supplier inputs and third-party co-location sites. About 6% of employees are in Israel. Akamai says its distributed architecture can route traffic around local disruption, but it still relies on third-party infrastructure in affected regions. | [Q2 2026 Form 10-Q, Risk Factors—Global conditions, pp. 46–47] |
| Consumer cycle | Mid | Akamai is mainly enterprise-facing, but consumer-facing media and gaming traffic feeds the Delivery and other cloud applications line. That line was $395.9m, or 36.0% of Q2 revenue ($395.9m / $1,099.7m), and fell 6% year on year; management cited contract-renewal pricing and customers' cost optimization as contributors. | [Q2 2026 Form 10-Q, Item 2—Results of Operations, pp. 30–31] |
| Enterprise IT-spending cycle | Mid | Economic stress can prompt customers to defer IT spending, renegotiate contracts, lengthen purchasing cycles, optimize traffic or use do-it-yourself alternatives. These are external demand pressures, although product mix, pricing and customer retention remain management levers. | [Q2 2026 Form 10-Q, Risk Factors—Global conditions, pp. 46–47] |

## 1A. Named Policy & Subsidy Register — current status as of 2026-09-14

No subsidy, tax incentive, tariff schedule or replacement scheme is used as a quantified driver above. The named mandate below is included because the regulation assessment relies on it. The frozen pool has no post-August-2026 primary regulator update, so it cannot establish its status on the run date.

| Programme (local name + English) | Status as of 2026-09-14 | Terms in the reference period | Terms NOW (or successor programme) | Change, quantified | Stated end date? | Source + date |
|---|---|---|---|---|---|---|
| European Union Artificial Intelligence Act (AI Act) | Status not established from available sources | The 10-K states that EU implementation began 1 August 2024 and that significant provisions were scheduled for August 2026; for high-risk systems, it describes potential obligations on data quality, transparency and human oversight, with possible fines for non-compliance. | Not established from the frozen evidence. No EU authority release dated after the scheduled August 2026 provisions is in the pool, and no successor programme is identified. | Not established from available sources; no current terms or successor terms are quantified in the pool. | No end date stated in the cited filing. | [FY2025 Form 10-K, filed 2026-02-20, Risk Factors—Other regulatory developments, p. 22] |

## 2. Sensitivity, If Disclosed

| Variable | Disclosed sensitivity / mitigation | Evidence |
|---|---|---|
| Interest rates | A uniform 100-basis-point increase from 30 June 2026 would reduce the fair value of available-for-sale securities by about $25.8m. Fixed-rate convertible notes do not create economic interest-rate exposure; no variable-rate credit borrowings were outstanding. | [Q2 2026 Form 10-Q, Item 3—Interest Rate Risk, p. 43] |
| FX | A hypothetical 10% strengthening or weakening of the US dollar versus relevant currencies would not materially affect the interim financial statements. Short-term forwards offset remeasurement on certain non-functional-currency assets and liabilities; six-month transaction gains/losses from those forwards were immaterial. | [Q2 2026 Form 10-Q, Item 3—Foreign Currency Risk, p. 43] |

## 3. Classification

**Partly externally driven.** Outcomes are materially exposed to data-centre capacity, power, server and memory availability, global regulation and customer IT budgets. Yet this is not a pure pass-through business: Akamai can improve network efficiency, negotiate bandwidth pricing, use multi-year customer contracts, route traffic across its distributed network and change product mix. Management reports that it has improved bandwidth-provider pricing and network efficiency, but also says it is experiencing higher co-location, server and memory prices from hyperscaler market dynamics. [Q2 2026 Form 10-Q, Item 2—Expenses, pp. 31–32; Risk Factors—Global conditions, pp. 46–47]

## 4. External Dependency Risk Score

**55 / 100 — INVERTED: higher = worse.** This is material external exposure with mixed mitigation. The score is held below the “mostly externally driven” range because the rate and direct FX sensitivities disclosed are limited and operating levers exist. It remains in the middle band because capacity, power and hardware availability are core inputs to the expanding cloud infrastructure service, and the Q2 filing shows cost growth materially ahead of revenue growth without quantifying how much is external price pressure versus Akamai’s own expansion spend. [Q2 2026 Form 10-Q, Item 2—Cost of Revenue, p. 32; Item 3—Market Risk, p. 43]

## 5. The Single Biggest Lever

**Data-centre capacity, power and server/memory input prices:** *Inference, not from filings* — a 20% adverse rise in these inputs, or an equivalent capacity shortfall, would likely do the most damage because it can raise costs and limit network expansion; Akamai does not disclose a dollar profit sensitivity for that shock. [Q2 2026 Form 10-Q, Risk Factors—Capacity, co-location and equipment, p. 52]



---

## business-model / 11_capital-allocation-governance.md

_Source: `11_capital-allocation-governance.md`_

# Capital Allocation & Governance — AKAM

## 1. Signal Table

Severity is INVERTED — higher score = worse.

| Signal | Observation | Evidence | Severity /100 *(higher = worse)* |
|---|---|---:|---:|
| Acquisition pattern (frequency, size, integration outcomes; serial-acquirer + opportunity cost — Filter 4) | FY21–FY25 cash acquisitions totalled $2,066.3m ($598.8m + $872.1m + $106.2m + $434.1m + $55.1m), and Akamai disclosed a further $205.0m cash acquisition of LayerX in July 2026; integration returns and an opportunity-cost comparison are not proven from available data. | [CIQ Financials → Cash Flow, FY21–FY25 — vendor export; Q2 2026 10-Q, Note 6 (Acquisition)] | 55 |
| Net share count trajectory (buybacks minus issuance, dilution) | Shares outstanding fell from 144.711m at December 31, 2025 to 143.591m at June 30, 2026 after 4.998m repurchases exceeded 3.693m employee/purchase-plan issuances and 0.186m 401(k) reissues, while basic weighted-average shares fell 1.3% YoY to 144.965m. | [Q2 2026 10-Q, Statements of Income, p.5; Statements of Stockholders’ Equity, pp.9–12] | 25 |
| Dividend policy & coverage | Akamai has never paid or declared a cash dividend and does not expect one in the foreseeable future, using buybacks rather than a recurring cash distribution. | [FY25 10-K, Item 5; Risk Factors, “Because we currently do not intend to pay dividends”] | 15 |
| Capex intensity vs depreciation (growth vs maintenance) | H1 2026 cash capital spend was $417.600m ($246.613m property and equipment + $170.987m capitalized internal-use software), 1.13× $369.288m depreciation and amortization, and the May note issue was designated partly for accelerated cloud-infrastructure capex. | [Q2 2026 10-Q, Statements of Cash Flows, p.7; Note 7 (Debt), pp.17–20] | 65 |
| Debt level and trajectory (absolute + vs EBITDA) | At June 30, filed convertible-note principal was $7.640bn while CIQ’s total-debt basis was $9.339bn; CIQ’s broad net debt was $4.723bn and 4.37× LTM EBITDA after netting cash and investments, whereas strict vendor-basis total debt less filing cash was $7.859bn ($9.339bn − $1.480bn). | [Q2 2026 10-Q, Balance Sheet, pp.3–4; Note 7 (Debt), pp.17–20; CIQ Financials → Balance Sheet and Income Statement, LTM Jun-30-2026 — vendor export] | 75 |
| Related-party transactions | A related-party conclusion is not proven from available data because the FY25 10-K incorporates a 2026 proxy not in the frozen pool and the admitted CIQ relationships graph has no source or relationship rows. | [FY25 10-K, Item 13; relationships.json, 2026-09-14 (0 source and relationship rows)] | 40 |
| Insider / promoter ownership and changes | Insider and beneficial-ownership changes are not proven from available data because the CIQ ownership export is missing and the incorporated 2026 proxy is not in the frozen pool. | [ciq_facts.json, “insider_net_activity” and “top_institutional_holders” marked missing; FY25 10-K, Items 12–13] | 45 |
| Promoter share pledging *(if applicable, e.g. Indian listings)* | Not applicable: AKAM is a U.S. Nasdaq-listed issuer, not a promoter-led Indian listing. | [FY25 10-K, cover page] | 0 |
| Auditor history (changes, qualifications, key audit matters) | PricewaterhouseCoopers has been Akamai’s auditor since 1998 and gave unqualified FY25 financial-statement and internal-control opinions, with revenue recognition as the critical audit matter. | [FY25 10-K, Report of Independent Registered Public Accounting Firm, pp.51–52] | 10 |
| Restatements / accounting policy changes | The FY25 10-K cover reports no correction of previously issued financial statements and no related incentive-compensation recovery analysis; a broader historic restatement review is not proven from available data. | [FY25 10-K, cover page] | 10 |
| Off-balance-sheet items | Operating-lease liabilities were $1.776bn ($0.370bn current + $1.406bn long-term) at June 30, while the company reports unlimited theoretical indemnity exposure but no material cost or accrual to date and does not book purchase commitments before goods or services are received. | [Q2 2026 10-Q, Balance Sheet, p.4; FY25 10-K, Note 12 (Leases), pp.79–80; Note 13 (Commitments and Contingencies), pp.81–82] | 50 |
| Working capital trend (receivable days, inventory days, cash conversion) | CIQ’s average days sales outstanding fell from 70.4 in 2021 to 66.0 in 2025 but rose to 73.1 in LTM June 2026, as filed receivables reached $953.445m and consumed $171.804m of H1 operating cash; inventory days and cash-conversion-cycle metrics are not applicable in the vendor’s service-business data. | [CIQ Financials → Ratios, FY21–FY25 and LTM Jun-30-2026 — vendor export; Q2 2026 10-Q, Note 3 (Accounts Receivable); Statements of Cash Flows, p.7] | 55 |
| Senior management turnover (CEO, CFO, board chair in last 3 years) | CEO F. Thomson Leighton and CFO Edward McGowan signed both the FY25 10-K and Q2 2026 10-Q, but a complete three-year CEO, CFO and board-chair turnover record is not proven from the frozen pool. | [FY25 10-K, Signatures; Q2 2026 10-Q, cover page and Signatures] | 25 |

## 2. Classification

**Capital allocation concerns.** Akamai reports in USD under U.S. GAAP. The proven governance record is comparatively clean: PwC has audited the company since 1998, gave an unqualified FY25 opinion on the financial statements and internal controls, and the FY25 filing does not identify a current-period restatement. Those facts do not offset the capital-allocation concern from $3.5bn of new May 2026 convertibles for accelerated cloud investment, a $7.640bn convertible-note principal balance, and buybacks larger than H1 operating free cash flow. [FY25 10-K, cover page and Report of Independent Registered Public Accounting Firm, pp.51–52; Q2 2026 10-Q, Note 7 (Debt), pp.17–20; Statements of Cash Flows, p.7]

## 3. Most Material Signal

Debt level and trajectory is the most material signal. In May 2026, Akamai issued $3.500bn of new 2030 and 2032 convertible notes to support accelerated cloud-infrastructure spending; by June 30, its five convertible issues had $7.640bn of principal outstanding. H1 operating free cash flow on the required strict basis was $221.174m, built as $638.774m cash from operations less $246.613m property-and-equipment purchases and $170.987m capitalized internal-use software, versus $615.744m of share repurchases. The new notes have zero coupons, but the core test is whether cloud investment generates enough recurring cash to limit further balance-sheet expansion. If it does not, the debt severity should rise and the classification would worsen. [Q2 2026 10-Q, Note 7 (Debt), pp.17–20; Statements of Cash Flows, p.7; Note 9 (Stockholders’ Equity)]

## 4. Capital Allocation Score /100

**45/100 — higher = better.** This is the inverse of a 55/100 weighted severity, with debt, cloud capex and acquisition pattern carrying the most weight. The serial-acquirer cap was **not** applied: the acquisition-pattern severity is 55, below the required 70 threshold, and the available evidence does not establish debt-funded acquisitions near or above Akamai’s own value. The score remains below a standard-professional-management reading because the high debt and investment burden are already visible, while acquisition returns, related-party detail and complete ownership history are not proven from available data.



---

## business-model / 12_red-flags-sweep.md

_Source: `12_red-flags-sweep.md`_

# Red Flags Sweep — AKAM

## 1. Already Covered Upstream

| Upstream Agent | Flag Already Surfaced |
|---|---|
| disqualifier-scan | No formal disqualifier. The frozen pool lacks the incorporated 2026 proxy, so insider-share pledging and related-party-transaction tests are not assessable. [01_disqualifier-scan, §§1–4] |
| segment-map | AKAM reports one operating segment and does not disclose solution-category profit, assets, capital employed, or capital expenditure; the changed 2026 category presentation also limits delivery-series comparability. [03_segment-map, §3] |
| customer-geography | U.S. revenue was 51% of FY25 revenue without disclosed committed duration for that geographic pool; the prospective four-year, $600m CIS contract has undisclosed annual revenue and customer share. [05_customer-geography, §§1–4] |
| business-quality | Renewal-price pressure, a 330bp year-on-year Q2 gross-margin decline, higher infrastructure spending, and fast technology change lower the quality read. [07_business-quality, §§1–4] |
| external-dependency | Data-centre capacity, power, server and memory inputs, regulation, and enterprise IT demand materially affect results. [10_external-dependency, §§1–5] |
| capital-allocation-governance | High convertible-note debt, cloud-investment capex, acquisition execution, lease obligations, and weaker working-capital conversion are already flagged; ownership and related-party detail remain unavailable. [11_capital-allocation-governance, §§1–4] |

## 2. New Red Flags

| Red Flag | Why It Matters | Evidence | Severity /100 *(higher = worse)* |
|---|---|---|---:|
| Repeat product retirements and associated restructuring / asset impairment | AKAM recorded three successive company-wide restructuring actions: $20.668m in FY23, $63.398m in FY24, and $51.260m in FY25 — $135.326m in total. The FY24 and FY25 actions included ending certain solutions, headcount reductions, and impairments of capitalized internal-use software and acquired technology/customer intangibles. Not every charge was an impairment, but repeated retirements mean the return on earlier product and acquisition investment must be tested as cloud infrastructure spend rises. This is a disclosed execution and reinvestment risk, not evidence of aggressive accounting. | [FY25 Form 10-K, FY23–FY25, Note 10 (Restructuring), pp.74–75; Q2 2026 Form 10-Q, H1 2026, Note 8 (Restructuring), p.21] | 55 |
| Tax-rate benefit makes H1 2026 net-income growth less comparable | The H1 effective income-tax rate fell to 16.4% from 30.3%. AKAM attributes the lower rate mainly to excess stock-compensation tax benefit, a state-credit valuation-allowance change, and higher R&D-credit benefit. On the filing's current H1 tax base, $36.302m tax provision ÷ 16.4% implies about $221.4m pre-tax income; applying 30.3% gives roughly $67.1m tax expense, or about $30.8m more. This is an inference using rounded reported rates, not a forecast. It is a comparability risk rather than an undisclosed one-off or an accounting-practice finding. | [Q2 2026 Form 10-Q, H1 2026, Note 12 (Income Taxes); Q2 2026 Form 10-Q, H1 2026, MD&A—Provision for Income Taxes, p.35] | 45 |

## 3. Most Severe New Flag

The most severe new flag is repeat product retirements and related restructuring / asset impairment (55/100). The $135.326m total is built from the three disclosed company actions — $20.668m in FY23 + $63.398m in FY24 + $51.260m in FY25 — and cannot be read as $135.326m of impairments because each action also included severance and other costs. Still, two recent actions explicitly ended solutions and impaired prior technology, customer-intangible, and internal-use-software investment. The synthesizer should test whether future cloud spending produces durable category economics before treating current investment as value-creating. [FY25 Form 10-K, FY23–FY25, Note 10 (Restructuring), pp.74–75]

## 4. Cross-Cutting Patterns

The new flags point to an earnings-quality and execution issue, not a governance breach: the company is retiring parts of its prior product and asset base while shifting capital toward cloud infrastructure. In combination with the upstream debt, capex, and margin findings, the key monitoring question is whether the new spending avoids further solution retirements and asset write-downs. The H1 tax benefit can improve reported net income while this operating test remains unresolved. [FY25 Form 10-K, FY23–FY25, Note 10 (Restructuring), pp.74–75; Q2 2026 Form 10-Q, H1 2026, Note 12 (Income Taxes)]
