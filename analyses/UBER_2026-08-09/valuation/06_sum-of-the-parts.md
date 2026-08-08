# Sum-of-the-Parts — UBER

Reporting standard: US GAAP. Reporting currency: USD (millions, except per-share figures). Fiscal year end: December 31. Listing: NYSE:UBER (US SEC filer) [FY25 10-K cover page]. All anchor figures (price $68.18 as of 2026-08-06, diluted shares ~2,056.327M, net debt $9,340M broad-basis canonical, EV $149,684.7M) are taken verbatim from `01_price-and-capital-structure.md` per Reconciliation Gate 1.

Uber is **not** effectively single-segment: Mobility is 57.0% of FY25 revenue and 69.1% of FY25 total segment Adjusted EBITDA [`business-model/03_segment-map.md`, citing FY25 10-K, Note 13, p.112–114] — below the 85% collapse threshold. Delivery is a real, growing second engine (31.2% of segment profit); Freight is currently a small loss-maker. A full three-segment SOTP is required and runs below; the material unallocated Corporate G&A / Platform R&D bucket is capitalized and subtracted in the bridge, not dropped (Reconciliation Gate 3).

## 1. Segment Inventory

Figures are FY2025 (year ended Dec-31-2025), the latest audited annual period, under the company's discontinued-but-last-clean "Segment Adjusted EBITDA" basis [FY25 10-K, Note 13, p.112–114]. "% of Total Segment EBITDA" is computed against the sum of the three reportable segments only ($11,438M), which sums to 100% by construction; the unallocated Corporate G&A / Platform R&D bucket sits below that line and is shown separately so it cannot silently inflate any segment's share above 100%.

| Segment | Revenue (FY25) | Adjusted EBITDA (FY25) | Margin | % of Total Segment EBITDA | Source |
|---|---:|---:|---:|---:|---|
| Mobility | $29,670M | $7,899M | 26.6% | 69.1% | FY25 10-K, Note 13, p.114 |
| Delivery | $17,248M | $3,572M | 20.7% | 31.2% | FY25 10-K, Note 13, p.114 |
| Freight | $5,099M | -$33M | -0.6% | -0.3% | FY25 10-K, Note 13, p.114 |
| **Total reportable segments** | **$52,017M** | **$11,438M** | **22.0%** | **100.0%** | FY25 10-K, Note 13 |
| Corporate G&A & Platform R&D (unallocated, not a segment) | — | -$2,708M | — | -23.7% of total segment EBITDA | FY25 10-K, Note 13, p.113 |
| **Consolidated Adjusted EBITDA** | **$52,017M** | **$8,730M** | **16.8%** | — | FY25 10-K, Note 13 |

Revenue reconciles exactly to consolidated revenue with no "Other" bucket [`business-model/03_segment-map.md`]. **Metric-basis break:** beginning Q1 FY26, Uber discontinued "Segment Adjusted EBITDA" and replaced it with "Segment Operating Income," a different (lower) profit measure that nets stock-based compensation and depreciation within segment costs rather than adding them back; FY2026-and-later segment figures are not directly comparable to the FY25 table above on a margin-for-margin basis [Q2 FY26 10-Q, Note 10: "Beginning in the first quarter of 2026, we changed our segment operating performance measure from Segment Adjusted EBITDA to Segment Operating Income"]. Section 2 addresses this directly in building the forward metric.

**Vendor data-quality flag:** the CIQ `Financials_Quarterly.xls` "Segments" tab's "Operating Profit Before Tax" row mislabels its Jun-30-2026 column — it repeats the Q2 **FY25** recast comparative ($1,729M / $766M / -$26M for Mobility/Delivery/Freight) rather than the actual Q2 **FY26** figures. This agent uses the primary 10-Q Note 10 tables directly (verified against the filing text) rather than that CIQ column, per the source hierarchy (§4/§5) — filings beat vendor exports, and a vendor number is never cited under a filing's name.

## 2. Segment Multiples & Comparables

**Forward metric construction (Inference, not from filings, built from filed inputs).** No segment-level consensus exists (confirmed: `earnings/04_guidance-consensus.md` has no segment split), so a forward metric is built directly from the primary filing:
1. H1 FY26 actual Segment Operating Income, annualized ×2 [Q2 FY26 10-Q, Note 10, "Six Months Ended June 30, 2026" table: Mobility $4,244M, Delivery $2,016M, Freight -$54M] → Mobility $8,488M, Delivery $4,032M, Freight -$108M.
2. Add back a pro-rata D&A allocation to convert this EBIT-like measure to an EBITDA-equivalent matching the CIQ-standardized basis the peer multiples below are quoted on (CIQ "EBITDA" = GAAP operating income + D&A, confirmed by back-solving Uber's own LTM EV/EBITDA of 19.2x against EV $149,684.7M → implied EBITDA ≈$7,796M, close to the LTM $7,474M CIQ figure in `01` — i.e., CIQ's peer EBITDA multiples are NOT the company's SBC-adjusted "Adjusted EBITDA," so no SBC add-back is needed, only D&A). FY25 D&A was $719M on $52,017M revenue (1.38% of revenue) [`earnings/01_historical-financials.md`, citing FY25 10-K Adjusted EBITDA reconciliation]. Applied to FY26E revenue (below) → ≈$800M FY26E D&A, allocated pro-rata by segment revenue share.
3. FY26E segment revenue is built by taking H1 FY26 actual revenue [Q2 FY26 10-Q, Note 10] and adding an implied H2 FY26E (= consensus FY2026E total revenue $57,834.88M [`earnings/04_guidance-consensus.md`, Consensus tab] − H1 FY26 actual $27,394M), split across segments using the H1 FY26 revenue mix.

| Segment | FY26E Revenue | FY26E Segment Op. Income (H1 annualized) | + D&A add-back | = FY26E EBITDA-equivalent |
|---|---:|---:|---:|---:|
| Mobility | $29,899M | $8,488M | $413M | $8,901M |
| Delivery | $21,774M | $4,032M | $301M | $4,333M |
| Freight | $6,165M | -$108M | $85M | -$23M |
| **Total** | **$57,838M** | **$12,412M** | **$799M** | **$13,211M** |

Freight's FY26E EBITDA-equivalent is essentially zero (-$23M) — too close to breakeven for an EV/EBITDA multiple to be meaningful (multiplying a near-zero base produces a near-zero or sign-flipping result regardless of the multiple chosen), so Freight is valued on **EV/Revenue** instead, flagged explicitly below.

| Segment | Metric Used (period basis) | Multiple Applied | Named Comparable | Comparable's Multiple | Why It Fits | Source |
|---|---|---:|---|---:|---|---|
| Mobility | FY26E EBITDA-equivalent, $8,901M (current FY, ~5 months remaining) | 7.94x (base) / 16.58x (high dispersion) | Lyft, Inc. (base) / DiDi Global Inc. (high) | Lyft NTM TEV/Fwd EBITDA 7.94x; DiDi NTM TEV/Fwd EBITDA 16.58x | Lyft is `business-model/08_competitive-map.md`'s own-named "closest same-business, same-geography peer" — same asset-light US/Canada rideshare marketplace, no owned fleet — used as the conservative base per Core Principle 6 (default to the lower value when comps conflict); DiDi is a larger-scale global rideshare marketplace with comparable economics, shown as the high-end cross-check since Uber Mobility's ~30% margin and market-leading scale clearly exceed Lyft's near-breakeven profile | Capital IQ Comps export, Trading Multiples tab, as of 2026-08-06 |
| Delivery | FY26E EBITDA-equivalent, $4,333M (current FY, ~5 months remaining) | 20.78x | DoorDash, Inc. | NTM TEV/Fwd EBITDA 20.78x | Direct, same-geography US food/grocery delivery marketplace, named as a Delivery competitor in Uber's own FY25 10-K, asset-light (couriers own vehicles, matching Uber's model) — the single cleanest match in the pool, no second comp needed | Capital IQ Comps export, Trading Multiples tab, as of 2026-08-06 |
| Freight | FY26E revenue, $6,165M (current FY, ~5 months remaining) | 0.51x (base) / 1.17x (high) | RXO, Inc. (base) / C.H. Robinson Worldwide (high) | RXO EV/Sales ≈0.51x; CHRW EV/Sales 1.17x | RXO is an asset-light truckload freight brokerage with no owned trucking fleet — the closest economic match to Uber Freight's own description ("digital marketplace connecting Shippers and Carriers... Uber owns no trucking fleet" [`business-model/03_segment-map.md`]) — used as the base; C.H. Robinson is a larger, more diversified, higher-margin logistics broker, shown as the high-end cross-check | Web: stockanalysis.com / MarketScreener, RXO EV/Sales, 2026 snapshot (indicative, unverified, no precise as-of date found — labelled); Web: stockanalysis.com, CHRW EV/Sales as of 2026-08-04 (indicative, unverified) |

**Freight comparable limitation, flagged per triage:** no freight-brokerage peer exists in the pool's 10-name Capital IQ comp set (`00_valuation-data-triage.md` flagged this directly); RXO and C.H. Robinson are sourced from the web, dated, and labelled unverified per the source hierarchy. Both web multiples are effectively current/LTM snapshots, not a strict NTM figure (no forward EV/Sales was found for either), so there is a mild period-basis mismatch applying a current-ish multiple to a FY26E revenue base — flagged, not corrected, given no better forward freight-broker multiple is available.

## 3. Segment Valuation

`Segment EV = FY26E metric × multiple`. Base case uses the conservative comparable named above for each segment (Lyft for Mobility, RXO for Freight); the high-dispersion case swaps in the named alternative comp.

| Segment | Metric Value | Multiple (base) | Segment EV (base) | Multiple (high) | Segment EV (high) |
|---|---:|---:|---:|---:|---:|
| Mobility | $8,901M | 7.94x (Lyft) | $70,674M | 16.58x (DiDi) | $147,579M |
| Delivery | $4,333M | 20.78x (DoorDash) | $90,040M | 20.78x (DoorDash) | $90,040M |
| Freight | $6,165M (revenue) | 0.51x (RXO) | $3,144M | 1.17x (CHRW) | $7,213M |
| **Gross enterprise value (sum)** | | | **$163,858M** | | **$244,832M** |

For context (not part of the bridge): the base-case gross segment EV ($163,858M) sits about 9.5% above Uber's current actual EV ($149,684.7M, per `01`) *before* any deduction for corporate overhead — the corporate-cost capitalization in Section 4 is what brings the SOTP-derived figure back down.

## 4. Equity Bridge

Corporate G&A / Platform R&D is a permanent cost drag on all three segments and cannot be dropped (Reconciliation Gate 3). It is capitalized as a perpetuity at Uber's own consolidated NTM EV/EBITDA multiple (11.89x [Capital IQ Comps export, Trading Multiples tab, Uber row, as of 2026-08-06]) — the only directly observable market multiple available for this purpose, used as a stated modeling choice, not a segment-specific comparable. FY26E corporate cost is built the same way as the segment metrics: H1 FY26 actual (-$2,180M) [Q2 FY26 10-Q, Note 10] annualized ×2 = -$4,360M. Capitalized value = $4,360M × 11.89x = $51,840M.

Uber is net debt (not net cash) on both bases per `01`, so only a single "− net debt" line is needed — no add-back double-count risk. Per `01`, $12,532M of long-term investments (mostly mark-to-market minority equity stakes in Aurora, Grab, Didi, Delivery Hero (pre-equity-method portion), Joby, and others) and $3,773M of equity-method investments (predominantly Uber's enlarged Delivery Hero stake, reclassified from Mar-31 to Jun-30-2026) are **not** netted in `01`'s EV bridge and are separate, genuinely non-operating financial assets outside the three operating segments — `01` explicitly flags that "downstream DCF/SOTP agents should consider whether to value this portfolio separately." They are added back here as a single combined line.

| Step | Value ($M) |
|---|---:|
| Gross enterprise value (base case, Section 3) | 163,858 |
| − Capitalized unallocated corporate costs ($4,360M FY26E × 11.89x) | (51,840) |
| = Adjusted EV | 112,018 |
| − Net debt (broad basis, canonical per `01`) | (9,340) |
| − Minority / non-controlling interest | (1,083) |
| − Preferred equity | 0 |
| + Equity-method & other minority investments (Aurora/Grab/Didi/Delivery Hero/Joby stakes) | 16,305 |
| **= Equity value (base case)** | **117,900** |
| ÷ Diluted shares (per `01`) | 2,056.327M |
| **= SOTP value per share (base case)** | **$57.34** |
| vs current price ($68.18, 2026-08-06) | -15.9% (SOTP base sits below price) |

**High-dispersion case** (Mobility on DiDi 16.58x, Freight on C.H. Robinson 1.17x, all other bridge lines unchanged): Gross EV $244,832M → Adjusted EV $192,992M → −net debt $183,652M → −minority $182,569M → +investments $198,874M → **$96.71/share**, +41.9% above price.

**No conglomerate/holding-company discount is applied.** Uber is a single integrated technology platform with shared engineering, marketing, and payments infrastructure and a cross-segment loyalty program (Uber One spans Mobility and Delivery) — not a diversified collection of unrelated businesses under a value-maximizing-elsewhere parent (no RF-OWN-004 flag from the governance module for this ticker). A structural holdco discount is not warranted here; the wide base-to-high dispersion above already reflects genuine comparable-selection uncertainty, not a discount that should be layered on top of it.

**Not reflected in this bridge:** the pending Delivery Hero acquisition (~$14.8B implied equity value, funded partly by a new €14.2B bridge credit facility signed 2026-07-16, expected to close H2 2027) is a material subsequent event not yet in the Jun-30-2026 balance sheet [`01_price-and-capital-structure.md`]. If it closes, it would materially enlarge the Delivery segment and add meaningfully to net debt — a forward catalyst/risk to flag, not to model into a base case that has not closed and remains subject to regulatory clearance.

## 5. SOTP Read

The base case (using Lyft — the competitive-map's own "closest same-business, same-geography" Mobility peer, and RXO — the closest asset-light freight-brokerage peer) values Uber at **$57.34/share, 15.9% below** the $68.18 current price; a high-dispersion case built on the alternative named comparables (DiDi for Mobility, C.H. Robinson for Freight) reaches **$96.71/share, 41.9% above** price. That $57–$97 range is not false precision — it is the real, cited disagreement between named peers on how to price Mobility specifically, and the base case (per Core Principle 6) is the more conservative, lower one.

**Which segment carries the value depends entirely on the Mobility comp.** In the conservative base case, Delivery — not Mobility — carries the larger share of gross segment EV ($90.0B of $163.9B, 55%, vs Mobility's $70.7B, 43%) purely because DoorDash's 20.78x forward multiple is more than double Lyft's 7.94x, even though Mobility generates more than double Delivery's FY26E profit ($8.9B vs $4.3B). Flip to the DiDi-anchored high case and Mobility dominates instead (60% of gross EV). Freight is a rounding error either way (under 3% of gross EV, consistent with `03_segment-map.md`'s own read of Freight as "a profit drag, not a contributor").

The single largest number in this entire SOTP is not a segment at all: capitalizing Uber's ~$4.4B annualized unallocated corporate overhead at the company's own 11.89x blended multiple subtracts **$51.8B** — roughly a third of the company's entire current market cap ($139.3B, per `01`) — reminding that a consolidated read of Uber already prices in a large, permanent corporate-cost tax on whatever the segments are worth individually.

