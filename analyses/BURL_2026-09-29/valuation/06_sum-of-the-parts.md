# Sum-of-the-Parts — BURL

Burlington Stores, Inc. reports under U.S. GAAP in USD and has a fiscal year ending on the Saturday closest to January 31. It is effectively single-segment — SOTP collapses to the consolidated read. This is therefore not an independent fair-value method and is not an input to the scenario valuation. [FY2025 Form 10-K, fiscal year ended 2026-01-31, Note 1 — Segment Information; Q2 FY2026 Form 10-Q, fiscal six months ended 2026-08-01, Note 1 — Segment Reporting]

## 1. Segment Inventory

| Segment | Revenue | EBIT (or EBITDA) | Margin | % of Total EBIT | Source |
|---|---:|---:|---:|---:|---|
| U.S. off-price retail | $11,566.9m total revenue (FY2025) | Not disclosed; CODM measure is $610.2m net income | Not assessable — no segment EBIT or EBITDA is disclosed | 100.0% of reportable-segment profit | [FY2025 Form 10-K, Note 1 — Segment Information] |

The denominator is reportable-segment profit, not an inferred EBIT total. The 10-K says Burlington has one reportable segment, derives all revenue in the United States and is managed on a consolidated basis; the Q2 FY2026 filing retains that definition. [FY2025 Form 10-K, Note 1 — Segment Information; Q2 FY2026 Form 10-Q, Note 1 — Segment Reporting]

The source-bound CIQ sidecar reports one `Retail - Apparel` segment at $11,559m, 100% of revenue. That is $7.9m, or 0.07%, below the filing's $11,566.9m. The audited filing is used above; the small vendor difference does not alter the single-segment conclusion. [CIQ Financials→Segments, Revenues, 12 months ended 2026-01-31; ciq_facts.json, segments_revenue]

**Effectively single-segment — SOTP collapses to the consolidated read.** Product categories are merchandise within the same retail operation, not separate reportable businesses. A forced apparel/home/footwear breakup would require made-up revenue, cost and capital allocations.

## 2. Segment Multiples & Comparables

| Segment | Metric Used | Multiple Applied | Named Comparable | Comparable's Multiple | Source |
|---|---|---:|---|---:|---|
| U.S. off-price retail (the whole group) | $1,541.89m NTM consolidated EBITDA; no separately forecast segment metric | None — collapse path. BURL's observed NTM TEV/forward EBITDA is 13.75x, for sanity-check context only | Ross Stores (ROST); TJX Companies (TJX) | Ross 18.77x; TJX 16.62x NTM TEV/forward EBITDA | [Capital IQ Estimates, Multiples sheet, current FYE 2027; Capital IQ Comps, Financial Data and Trading Multiples, as of 2026-09-28] |

Ross is the closest national U.S. off-price peer; TJX's Marmaxx formats overlap with Burlington but the quoted TJX multiple is for the larger consolidated group. Both are economically closer than department-store or mall-specialty comparables because their core operations are off-price retail, but neither multiple is applied here. [data/BURL/Company-Comparable-Analysis-Burlington-Stores-Inc.xls, Financial Data and Trading Multiples, as of 2026-09-28; FY2025 Form 10-K, Item 1 — Competition]

The observed 13.75x versus 16.62x–18.77x is a peer-relative fact, not a breakup value. It cannot by itself establish that BURL warrants either peer multiple: BURL's LTM EBIT margin is 7.8%, below Ross's 12.7% and TJX's 12.2% on the reported vendor basis. [Capital IQ Estimates, Multiples sheet, current FYE 2027; Capital IQ Comps, Operating Statistics, as of 2026-09-28]

This sanity check stays entirely on the Capital IQ TEV convention. The vendor's $5,202.4m net-debt figure includes operating-lease liabilities, whereas the valuation module's canonical strict net debt is $1,215.8m; neither vendor TEV nor a peer multiple is carried into the bridge below. [CIQ Financials→Balance Sheet, Net Debt, Q2 2026-08-01; ciq_facts.json, net_debt_m; Q2 FY2026 Form 10-Q, pp.5, 10–13]

## 3. Segment Valuation

| Segment | Metric Value | Multiple | Segment EV |
|---|---:|---:|---:|
| U.S. off-price retail | $1,541.89m NTM consolidated EBITDA | Not applied — single-segment collapse | Not calculated |
| **Gross enterprise value (sum)** |  |  | **Not calculated** |

No segment EV is calculated because there is only one reportable business and applying a peer multiple to it would duplicate the consolidated peer valuation in `03_relative-valuation-peers`, not create a SOTP read. The reported NTM EBITDA is a Capital IQ consolidated estimate, not a company-issued segment forecast. [Capital IQ Estimates, Consensus sheet, current FYE 2027; Capital IQ Estimates, Multiples sheet, current FYE 2027]

## 4. Equity Bridge

| Step | Value |
|---|---:|
| Gross enterprise value | Not calculated — no independent SOTP EV |
| − Capitalized unallocated corporate costs | Not applicable — no segment EV is being bridged; corporate costs are already inside the sole segment's results |
| − Net debt | Not applied; a valid EV bridge would subtract $1,215.8m strict net debt once |
| − Minority / preferred | Not applied; $0.0m / $0.0m in the canonical bridge |
| + Equity-method investments | Not applied; $0.0m separately reported |
| − Conglomerate / holdco discount (if any) | Not applicable — BURL is a single operating business, not a holdco |
| **= Equity value** | **Not calculated** |
| ÷ Diluted shares | 63.896m proxy, but no equity value to divide |
| **= SOTP value per share** | **Not assessable — SOTP collapsed** |
| vs current price | Not assessable; current price is $254.69 at the 2026-09-28 NYSE close [Capital IQ Comps→Financial Data, subject row, 2026-09-28; ciq_facts.json, current_price] |

Reconciliation Gate 3: no corporate bucket is omitted. FY2025 `other segment expenses` were $2,965.3m and include store-related costs, store payroll, corporate costs, marketing and strategy, and other store and selling expenses. Those costs sit within the one reported segment; the observed consolidated NTM EBITDA sanity check is after the group's operating costs. [FY2025 Form 10-K, Note 1 — Segment Information]

The bridge convention, if an EV had existed, would use the canonical $1,215.8m strict net debt (`$1,919.5m` financial debt less `$703.7m` cash and equivalents), with no separate net-cash line. The diluted-share proxy is 63.896m. [Q2 FY2026 Form 10-Q, pp.5–6, Note 4; Valuation/01 Price & Capital Structure, Anchor Summary]

No conglomerate discount is warranted because the filing presents one operating segment, rather than a collection of separately owned businesses. This does not mean a quality or multiple discount is unwarranted; that is a consolidated peer-valuation question. [FY2025 Form 10-K, Note 1 — Segment Information]

## 5. SOTP Read

There is no valid breakup value versus the $254.69 share price because Burlington's U.S. off-price retail operation is 100% of reported revenue and reportable profit. SOTP therefore adds no independent valuation evidence and should not receive a method weight.

The only usable check is consolidated: BURL's observed 13.75x NTM EV/EBITDA is below the 16.62x TJX and 18.77x Ross readings, but the lower 7.8% LTM EBIT margin versus 12.2% and 12.7%, respectively, means this is not proof that its sole segment is being masked by a conglomerate structure. [Capital IQ Comps, Trading Multiples and Operating Statistics, as of 2026-09-28]
