# Sum-of-the-Parts — SMPL

**Collapse note (read first):** SMPL reports **one GAAP reportable segment** (ASC 280) — the Chief Operating Decision Maker (the CEO) reviews only consolidated net income, with no brand-level profit metric reviewed or disclosed [FY25 10-K, Note 15 (Segment and Customer Information); `business-model/03_segment-map.md` §1]. By the GAAP segment test alone, that is 100% of EBIT concentrated in one reportable segment — mechanically far past the partial-data rule's 85% threshold. Internally, management runs three brands (Quest, Atkins, OWYN) and discloses brand-level **revenue**, but explicitly discloses **no** brand-level profit, EBIT, EBITDA, or margin for any of the three — "Profit Share... Not disclosed" for every row [`business-model/03_segment-map.md` §1, Table]. Even judged at the brand level (where no single brand exceeds 85% of revenue), a genuine brand-by-brand SOTP cannot be built because the second required input — a segment EBIT or EBITDA to multiply — simply does not exist in the filings. Per the sum-of-the-parts agent's own partial-data rule: **"Effectively single-segment — SOTP collapses to the consolidated read."** This report therefore does not, and cannot, produce a quantified brand-by-brand breakup. What follows is (a) the required brand revenue inventory with the profit gap stated explicitly, and (b) the collapsed single-"segment" (consolidated) valuation sanity check, run on a forward EV/EBITDA basis against a named, economics-matched comparable — which is the only SOTP-shaped exercise the data will support.

Because the collapse point is the whole consolidated company, this method's output is arithmetically close to (and should be read alongside, not stacked independently on top of) the peer-relative-valuation method in `03_peer-multiples.md`. It corroborates rather than adds a genuinely independent data point — flagged here for `07`'s triangulation.

## 1. Segment Inventory

Reporting currency: USD (millions). Reporting standard: US GAAP. Fiscal year ends the last Saturday in August (FY2025 ended Aug 30, 2025).

| Segment (brand) | Revenue (FY25) | EBIT / EBITDA | Margin | % of Total EBIT | Source |
|---|---:|---:|---:|---:|---|
| Quest | $863.6m (59.5%) | Not disclosed | Not disclosed | N/A — no brand EBIT disclosed | FY25 10-K, Note 15; `business-model/03_segment-map.md` |
| Atkins | $420.8m (29.0%) | Not disclosed | Not disclosed | N/A — no brand EBIT disclosed | Same |
| OWYN | $137.0m (9.4%) | Not disclosed | Not disclosed | N/A — no brand EBIT disclosed | Same |
| International / unallocated | $29.5m (2.0%) | Not disclosed | Not disclosed | N/A — no brand EBIT disclosed | Same |
| **Consolidated (the one GAAP reportable segment)** | **$1,450.9m (100%)** | **GAAP EBIT $156.9m / GAAP EBITDA $177.9m (FY25); Adjusted EBITDA $278.2m (FY25, company non-GAAP)** | GAAP EBIT margin 10.8%; Adj. EBITDA margin 19.2% (FY25) | **100% by construction (the only EBIT the company discloses)** | FY25 10-K, Income Statement & MD&A reconciliation; `earnings/01_historical-financials.md` §1, §4 |

**"% of Total EBIT" denominator, defined:** because SMPL discloses EBIT/EBITDA only at the consolidated level, the 100% row above is not a segment "share" in the usual SOTP sense — it is the entire disclosed profit pool. There is no separate unallocated-corporate bucket sitting outside the brands: the consolidated GAAP and Adjusted EBITDA figures already net every cost the company incurs (COGS, SG&A, corporate overhead, brand-specific marketing) across all three brands and International in one number. This satisfies Reconciliation Gate 3 (no vanished bucket) on the collapse path — nothing is dropped by assertion, because there is nothing left outside the one number being valued.

## 2. Segment Multiples & Comparables

Only one row is possible given the collapse — the "segment" being valued is the whole consolidated company.

| Segment | Metric Used | Multiple Applied | Named Comparable | Comparable's Multiple | Source |
|---|---|---:|---|---:|---|
| Consolidated (collapsed) | NTM Adjusted EBITDA ≈ $217.78M (Capital IQ consensus, calendarized NTM; company's own FY2026E Adjusted EBITDA guidance is $220–225M, corroborating the same basis) | 8.39x (base case) | **BellRing Brands, Inc. (NYSE: BRBR)** | NTM TEV/Forward EBITDA 8.39x | `TheSimplyGoodFoodsCompanyNasdaqCMSMPLEstimatesReport.xls`, Consensus tab (NTM EBITDA, guidance cross-check); `Company Comparable Analysis The Simply Good Foods Company.xls`, Trading Multiples tab, as-of 2026-07-24 (BRBR NTM TEV/EBITDA) |

**Period basis stated:** forward (NTM), both metric and multiple — not trailing. LTM GAAP EBITDA is not usable here regardless of period-matching, because it is negative on an impairment-distorted basis (−$213.1M LTM per `earnings/01_historical-financials.md` §2); the NTM Adjusted EBITDA figure avoids that distortion and is cross-checked directly to the company's own forward guidance range.

**Why BellRing is the matching comparable, not just the nearest ticker:** BRBR is the single closest economic match in the peer set — a branded, outsourced-manufacturing, RTD-protein-shake-and-bar business (Premier Protein, Dymatize) sold through the identical club/mass/drug/e-commerce retail channels SMPL uses, directly overlapping Quest's bar/RTD lines and Atkins'/OWYN's RTD shakes [`business-model/08_competitive-map.md` §2, Competitor A]. It is not matched on ticker proximity or sector label alone — the other nine names in the CIQ comp set are real packaged-food companies but sit on different economics: Conagra (CAG), Campbell's (CPB), Kraft Heinz (KHC) are diversified multi-category packaged-food conglomerates several times SMPL's scale with different growth/margin structures; Freshpet (FRPT) is a premium, capital-intensive, refrigerated pet-food grower on a much higher multiple (12.89x NTM EV/EBITDA) reflecting a different growth category; Utz (UTZ) is a capital-heavier salty-snack manufacturer; Hain Celestial (HAIN) is closer in *decline profile* (a struggling "healthy" branded portfolio, similar in spirit to Atkins' own trajectory) but sells a different product set (organic/natural grocery, not protein nutrition) — it is used below only as the low end of a sanity range, not the primary comparable.

**Dispersion (not a weighted method, a labelled range):** using the same NTM Adjusted EBITDA base against the low end of the comparable range (HAIN, 6.79x — a declining-brand analogue) and a higher end (peer group median across all 10 names, 8.72x) brackets the base case. This is shown as dispersion only, per the "point value with separate dispersion" requirement — it is not three independently-derived scenarios.

| Case | Multiple | Comparable basis |
|---|---:|---|
| Low | 6.79x | HAIN NTM TEV/EBITDA — declining-brand analogue, not a category match |
| **Base** | **8.39x** | **BRBR NTM TEV/EBITDA — best economics match** |
| High | 8.72x | Peer group median (10 names), as-of 2026-07-24 |

## 3. Segment Valuation

| Segment | Metric Value | Multiple | Segment EV |
|---|---:|---:|---:|
| Consolidated (collapsed) — Low | $217.78M | 6.79x | $1,478.7M |
| **Consolidated (collapsed) — Base** | **$217.78M** | **8.39x** | **$1,827.2M** |
| Consolidated (collapsed) — High | $217.78M | 8.72x | $1,899.0M |
| **Gross enterprise value (sum) — Base** | | | **$1,827.2M** |

There is only one line to sum because there is only one disclosed profit pool.

## 4. Equity Bridge

| Step | Low | Base | High |
|---|---:|---:|---:|
| Gross enterprise value | $1,478.7M | $1,827.2M | $1,899.0M |
| − Capitalized unallocated corporate costs | $0 (already netted inside the single consolidated EBITDA figure — see §1 Gate-3 note; no separate bucket exists to capitalize) | $0 | $0 |
| − Net debt (strict basis: total debt $448.46M − cash $123.88M, as of May-30-2026) | ($324.58M) | ($324.58M) | ($324.58M) |
| − Minority / preferred | $0 (none disclosed) | $0 | $0 |
| + Equity-method investments | $0 (none disclosed) | $0 | $0 |
| − Conglomerate / holdco discount | $0 — see note below | $0 | $0 |
| **= Equity value** | **$1,154.1M** | **$1,502.6M** | **$1,574.5M** |
| ÷ Diluted shares (fully diluted, TSM) | 89,934,884 | 89,934,884 | 89,934,884 |
| **= SOTP value per share** | **$12.83** | **$16.71** | **$17.51** |
| vs current price ($11.33, close Aug-04-2026) | +13.2% | +47.5% | +54.6% |

Net debt, share count, and the EV bridge components are carried forward unchanged from `01_price-and-capital-structure.md` §4–§5 (net debt $324.58M, fully diluted shares 89,934,884). SMPL is net-debt (not net-cash), so only the single "− net debt" line applies; no add-back is needed and none is shown, avoiding the double-count `01` warns against.

**Conglomerate / holdco discount: none applied.** SMPL is not a legal holding company and holds no minority stakes in the three brands — Quest, Atkins, and OWYN are wholly-owned operating brands inside one corporate and legal structure, not separately listed or partially-owned subsidiaries. A structural holdco discount (the kind applied when a listed parent trades below the sum of its publicly-tradeable stakes) has no mechanism to apply here. What this collapse genuinely cannot do is quantify a **brand-mix** discount or premium — i.e., whether the market is under- or over-pricing Quest's growth against Atkins' decline — because no brand-level profit exists to isolate that effect. That gap is stated as a qualitative limitation in §5, not papered over with an invented multiplier.

## 5. SOTP Read

A genuine sum-of-the-parts cannot be built for SMPL: it is one GAAP reportable segment with brand-level revenue but zero brand-level profit disclosure, so there is no second input (a brand EBIT) to multiply by a brand-specific comparable. What collapses out instead is a consolidated forward-multiple sanity check: applying BellRing Brands' NTM EV/EBITDA of 8.39x (the closest economics match — same RTD-protein-and-bar category, same retail channels) to SMPL's own NTM Adjusted EBITDA of $217.78M implies roughly $16.71/share against the $11.33 close, with a $12.83–$17.51 range depending on which peer multiple is used — all of it above the current price. That gap says the market is pricing SMPL meaningfully below where a directly comparable branded-nutrition peer trades on the same forward earnings base, not that any one brand is "masked" — the filings give no way to say whether that discount belongs to Quest, Atkins, or OWYN specifically. Qualitatively, and only qualitatively (per `business-model/03_segment-map.md` and `08_competitive-map.md`), Quest is the brand management calls the "most important growth engine" (59.5% of FY25 revenue, rising to 63.7% of nine-month FY2026 revenue) while Atkins is in clear structural decline (FY25 net sales −14.5%, a $60.9M brand intangible impairment, FQ3 FY26 retail takeaway −24.6% y/y) and OWYN is a newly acquired, explicitly lower-margin brand still integrating through a disclosed FY26 product-quality issue — so the qualitative read is that Quest is very likely doing the heavy lifting inside a consolidated multiple that a shrinking Atkins and a still-integrating OWYN are dragging down, but this cannot be sized in dollars or turned into a quantified per-brand value without a profit disclosure SMPL does not provide.

**Method status for `07`:** treat this as a labelled sanity check that corroborates the peer-relative-valuation method (`03`), not as an independent SOTP data point — since the collapse point is the consolidated company, this method and peer relative valuation are mechanically the same calculation on largely the same inputs, and should not both be counted as separate legs of a triangulation.
