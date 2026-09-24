# Sum-of-the-Parts — V

Visa is a U.S. GAAP operating company that reports in USD and has a September fiscal year-end. Amounts are USD millions except per-share figures. This is a **collapsed SOTP**: Visa reports one Payment Services segment, so a breakup would merely restate the consolidated valuation. The direct-peer check below is a sanity check only, not an independent method for `07_scenario-and-fair-value`.

## 1. Segment Inventory

| Segment | Revenue | EBIT (or EBITDA) | Margin | % of Total EBIT | Source |
|---|---:|---:|---:|---:|---|
| Payment Services | $40,000 FY25 | $23,994 FY25 consolidated GAAP EBIT; not separately disclosed segment EBIT | 60.0% | 100.0% of consolidated GAAP EBIT (sole reportable segment) | [Visa FY2025 Form 10-K, Consolidated Statements of Operations, p. 60; Note 14, p. 87] |

The denominator is consolidated GAAP EBIT, used as a proxy because Payment Services is the only reportable segment and Visa does not disclose a segment profit-and-loss statement below the consolidated level. The CIQ facts sidecar's `segments_revenue` fact is present and reports Payment Services revenue of $40,000m (100%) for the year ended 2025-09-30, consistent with the filing. [Visa FY2025 Form 10-K, Note 14, p. 87; CIQ Financials→Segments (Revenues, latest annual column), 12 months ended 2025-09-30 — vendor export; `ciq_facts.json`, `segments_revenue`]

**Effectively single-segment — SOTP collapses to the consolidated read.** U.S./international disclosures and service, data-processing, international-transaction and other revenue are geographic or revenue-category views, not separate businesses to value. [Visa FY2025 Form 10-K, Item 1, pp. 5–6; Note 14, pp. 87–88; Visa Q3 FY2026 Form 10-Q, Note 10, p. 19]

## 2. Segment Multiples & Comparables

| Segment | Metric Used | Multiple Applied | Named Comparable | Comparable's Multiple | Source |
|---|---|---:|---|---:|---|
| Payment Services | NTM vendor-defined EBITDA: $34,971.48m | 19.475x (shown as 19.48x) | Mastercard (MA) | 20.50x NTM EV/EBITDA | [data/V/Company Comparable Analysis Visa Inc.xls — Financial Data and Trading Multiples, 2026-08-17; Capital IQ vendor export] |

Mastercard is the closest listed comparable because both are global branded payment networks that authorize, clear and settle transactions, with similarly asset-light network economics; American Express has issuer-and-lender economics, so it is not used for an EV/EBITDA check. [Visa FY2025 Form 10-K, Competition, p. 17; analyses/V_2026-09-23/business-model/08_competitive-map.md, Section 2]

The applied 19.475x is Mastercard's 20.50x NTM EV/EBITDA less a 5% judgmental adjustment for Visa's lower vendor long-term EPS-growth field (13.5% versus 16.6%) and regulatory exposure. It is not a margin haircut: Visa's own EBITDA already contains its margin. *Inference, not from filings.* [data/V/Company Comparable Analysis Visa Inc.xls — Operating Statistics and Trading Multiples, 2026-08-17; Visa FY2025 Form 10-K, Government Regulation and Note 20 (Legal Matters)]

The forward metric is a Capital IQ NTM vendor estimate, not Visa-reported EBITDA; Visa does not report EBITDA. The frozen estimate workbook is at least 43 days old at the run date, so this is a dated forward check rather than a fresh consensus read. [Capital IQ Estimates→Recent Changes, 2026-08-10 to 2026-08-11; analyses/V_2026-09-23/earnings/04_guidance-consensus.md, Section 1]

## 3. Segment Valuation

| Segment | Metric Value | Multiple | Segment EV |
|---|---:|---:|---:|
| Payment Services — collapsed single segment, NTM EBITDA | $34,971.48 | 19.475x | $681,069.6 |
| **Gross enterprise value (sum)** |  |  | **$681,069.6** |

`$681,069.6m = $34,971.48m × 19.475x`. This is the dominant-segment multiple sanity check. There is no separate SOTP dispersion range: the only clean, quantified same-economics comparator in the frozen export is Mastercard, so a wider range would require unsupported multiples. [data/V/Company Comparable Analysis Visa Inc.xls — Financial Data and Trading Multiples, 2026-08-17; analyses/V_2026-09-23/business-model/08_competitive-map.md, Sections 1–2]

## 4. Equity Bridge

| Step | Value |
|---|---:|
| Gross enterprise value | $681,069.6 |
| − Capitalized unallocated corporate costs | $0 — no separately reported corporate/unallocated bucket; the single-company NTM EBITDA metric has no such separately added-back cost |
| − Net debt | ($11,499.0) strict basis |
| − Minority / preferred | ($514.0) preferred equity; no separately reported NCI |
| + Equity-method investments | $0 — none separately disclosed for EV treatment |
| − Conglomerate / holdco discount (if any) | $0 — one operating business, not a holding-company structure |
| **= Equity value** | **$669,056.6** |
| ÷ Diluted shares | 1,898.0m |
| **= SOTP value per share** | **$352.51** |
| vs current price | ($11.64), or (3.2%) versus $364.15 pool close on 2026-08-17 |

`$669,056.6m = $681,069.6m − $11,499.0m − $514.0m`; `$352.51 = $669,056.6m ÷ 1,898.0m`. Net debt is deducted once on the strict basis; there is no separate net-cash add-back. The $11,499m strict net-debt figure, $514m preferred-equity figure and 1,898m diluted-share count are the canonical `01` anchors. [Visa Q3 FY2026 Form 10-Q, Consolidated Balance Sheets, pp. 4, 14, 17–18; Notes 8, 11 and 12; analyses/V_2026-09-23/valuation/01_price-and-capital-structure.md, Anchor Summary]

No conglomerate discount is warranted because there is no separately valued collection of operating businesses. The $0 corporate-cost line does not make a bucket vanish: Visa reports no corporate/unallocated segment, and the single-company NTM EBITDA metric has no separately identified corporate amount to add back or capitalize. [Visa FY2025 Form 10-K, Note 14, p. 87; Visa Q3 FY2026 Form 10-Q, Note 10, p. 19]

The $364.15 price is pool-verified, but 26 U.S. trading days stale at the run date; the CIQ facts sidecar's present `current_price` fact gives the same $364.15, sourced to Capital IQ's 2026-08-17 subject-row close. The freshest unverified web cross-check was $361.52 on 2026-09-23, which remains $9.01 (2.5%) above the sanity-check value and does not replace the pool anchor. [CIQ Comps→Financial Data `Day Close Price Latest`, 2026-08-17; `ciq_facts.json`, `current_price`; analyses/V_2026-09-23/valuation/01_price-and-capital-structure.md, Sections 1 and 7]

## 5. SOTP Read

Payment Services carries all of Visa's reported-segment value. The collapsed NTM EV/EBITDA check gives $352.51 per share, $11.64 (3.2%) below the stale $364.15 pool price; no high-value or low-value segment is being hidden by a consolidated multiple.

This is not a separate fair-value method to weight beside the consolidated peer EV/EBITDA result: it uses the same whole-company forward EBITDA and the same Mastercard comparator. Its useful finding is the absence of a breakup opportunity, not a distinct valuation conclusion.
