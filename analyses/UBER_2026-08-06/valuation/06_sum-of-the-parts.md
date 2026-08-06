# Sum-of-the-Parts — UBER

**Jurisdiction / reporting basis:** US / NYSE. Reporting standard: US GAAP. Reporting currency: USD (millions, unless stated per-share). No primary 10-K/10-Q sits in `data/UBER/`; every segment and comparable figure below is a Capital IQ export (source tier 5) or a labelled web source, cited as such — never attributed to the 10-K by name, consistent with `01_price-and-capital-structure.md` and `business-model/03_segment-map.md`.

**Anchors reused from `01_price-and-capital-structure.md` (Reconciliation Gate 1 — used verbatim, not re-derived):** current price $68.18 (pool-verified, close 2026-08-05); shares for per-share fair value 2,087.980mm (LTM weighted-average diluted); net debt (strict) $9,340mm; minority interest $1,083mm; preferred $0; equity-method investments $3,773mm (Financials.xls, Balance Sheet tab, Jun-30-2026).

## 1. Segment Inventory

FY2025 figures (fiscal year ended Dec-31-2025, latest disclosed annual segment note, vendor-parsed by Capital IQ from Uber's audited segment disclosure) [Uber Technologies Inc NYSE UBER Financials.xls, Segments tab, FY2025 column].

| Segment | Revenue | EBITDA (company-defined Adjusted EBITDA) | Margin | % of Total EBITDA | Source |
|---|---:|---:|---:|---:|---|
| Mobility | $29,670mm | $7,899mm | 26.6% | 90.5% (of $8,730mm consolidated) / 69.1% (of $11,438mm pre-corporate segment pool) | Financials.xls, Segments tab |
| Delivery | $17,248mm | $3,572mm | 20.7% | 40.9% (consolidated) / 31.2% (pre-corporate) | Financials.xls, Segments tab |
| Freight | $5,099mm | -$33mm | -0.7% | -0.4% (consolidated) / -0.3% (pre-corporate) | Financials.xls, Segments tab |
| Corporate G&A and Platform R&D (unallocated) | $0 (cost center, not a revenue line) | -$2,708mm | n/a | -31.0% (consolidated) | Financials.xls, Segments tab |
| **Total** | **$52,017mm** | **$8,730mm** | **16.8%** | **100.0%** | Financials.xls, Segments tab |

**Denominator definition (required by the partial-data rule).** Two legitimate denominators exist and they read very differently: (1) **consolidated Total EBITDA net of corporate drag** ($8,730mm) — the four rows above sum to exactly 100.0% of this, but the negative $2,708mm corporate bucket mechanically inflates Mobility's apparent share to 90.5%; (2) **the pre-corporate segment-level EBITDA pool** (Mobility + Delivery + Freight = $11,438mm, before the unallocated cost is netted) — on this basis Mobility is 69.1%, Delivery 31.2%, Freight -0.3%. The second basis is the correct one for judging whether this is a "single-segment" business, because Corporate G&A/Platform R&D is a cost center, not a business segment, and using it to inflate the dominant segment's share would conflate an unrelated overhead bucket with genuine business concentration.

**Single-segment test.** On the pre-corporate basis, Mobility is 69.1% of segment profit — **below** the >85% threshold in the partial-data rule. Delivery is a real second segment: 33.2% of revenue and a meaningful, still-improving profit contributor (EBITDA margin rose from -22.4% in FY2020 to +20.7% in FY2025) [`business-model/03_segment-map.md`, §1–§2]. This is **not** a single-segment collapse case. Freight is immaterial to profit (a rounding error on consolidated EBITDA, and structurally shrinking — revenue fell from a FY2022 peak of $6,947mm to $5,099mm in FY2025) but is still carried through the SOTP rather than dropped, consistent with Reconciliation Gate 3 (no vanished bucket).

Segment revenue and EBITDA reconcile exactly to consolidated: $29,670 + $17,248 + $5,099 = $52,017mm revenue; $7,899 + $3,572 - $33 - $2,708 = $8,730mm EBITDA [`business-model/03_segment-map.md`, §1].

## 2. Segment Multiples & Comparables

**Forward-basis construction (stated once, applies to all three segments).** No segment-level consensus or forward split is published for Uber — Capital IQ's Segments tab carries FY2020–FY2025 actuals only, and no segment-level guidance or Street estimate exists in the pool [`business-model/03_segment-map.md`, §0]. To value each segment on a forward metric (Calculation Standard 10's hard rule), this agent constructs an **evidenced estimate, labelled as inference**: hold the FY2025 disclosed revenue-mix and EBITDA profit-share constant, and scale each segment (and the corporate bucket) to Uber's own **consolidated NTM figures** — NTM Revenue $62,191.86mm and NTM EBITDA $12,589.03mm [Company Comparable Analysis Uber Technologies Inc.xls, Financial Data tab, As-Of 2026-08-06]. NTM (not FY2026 calendar) is used as the scaling anchor because the peer multiples below are themselves quoted on an NTM basis — mixing an NTM peer multiple with an FY2026-calendar Uber metric would violate the "never mix bases" rule (Calculation Standard 4). *Inference, not from filings: the segment split of Uber's own NTM total is derived, not disclosed; the mix-and-profit-share-constant assumption is a simplification that does not capture segment-specific growth divergence (e.g., Delivery's Trendyol Go divestiture headwind, Freight's ongoing revenue decline) — flagged, not resolved, by this construction.*

Growth factors applied: Revenue ×1.1956 (62,191.86/52,017); EBITDA ×1.4421 (12,589.03/8,730) [same source].

| Segment | Metric Used | Multiple Applied | Named Comparable | Comparable's Multiple (NTM) | Source |
|---|---|---:|---|---:|---|
| Mobility | NTM EBITDA (derived, see above) | 12.26x | Grab Holdings Limited (NasdaqGS:GRAB) | 12.26x | Company Comparable Analysis Uber Technologies Inc.xls, Trading Multiples tab, "NTM TEV/Forward EBITDA," As-Of 2026-08-06 |
| Delivery | NTM EBITDA (derived, see above) | 20.78x | DoorDash, Inc. (NasdaqGS:DASH) | 20.78x | Same source |
| Freight | NTM Revenue (derived, see above) | ~1.03x (derived) | C.H. Robinson Worldwide, Inc. (NasdaqGS:CHRW) | 1.03x (derived) | Web: stockanalysis.com/stocks/chrw/statistics, 2026-08-06 (indicative, unverified) |
| Corporate (capitalization multiple) | NTM EBITDA (negative, derived) | 11.89x | Uber Technologies, Inc. — own consolidated multiple | 11.89x | Company Comparable Analysis Uber Technologies Inc.xls, Trading Multiples tab, "NTM TEV/Forward EBITDA," Uber row |

**Why each comparable fits (economics, not surface label):**
- **Mobility → Grab, primary.** Grab is a profitable (LTM EBITDA margin 9.2%), asset-light, multi-sided ride-hailing-plus-delivery marketplace with no owned vehicle fleet — the same network-effects, no-fleet-ownership economics as Uber Mobility, and (unlike Lyft) it is actually generating positive segment-level margins, which better reflects what a mature, scaled ride-hailing marketplace should be worth. Lyft, Inc. (NasdaqGS:LYFT) — the closer surface/geography match (pure US/Canada peer-to-peer ridesharing) — is shown as a **secondary, low-end sanity check** at 7.94x NTM EV/EBITDA: Lyft's LTM EBITDA is still slightly negative (-$6.7mm) and its NTM turn to profitability is a recent inflection, not a proven multi-year margin record like Uber Mobility's (26.6% FY2025 segment margin, up from 19.2% in FY2020) [`business-model/03_segment-map.md`, §1], so Lyft's multiple likely understates Mobility's economics. DiDi Global's 16.58x NTM multiple is **excluded from the multiple selection** — it is computed on a currently-negative LTM EBITDA base (-$564.3mm) turning to a small, speculative NTM positive ($685.97mm), making the multiple itself low-confidence [Company Comparable Analysis Uber Technologies Inc.xls, Financial Data & Trading Multiples tabs].
- **Delivery → DoorDash, primary.** DoorDash is the standard, named, matching comparable: an asset-light on-demand delivery marketplace monetizing via take rate plus advertising, competing in the same US restaurant/grocery/retail delivery category Uber Delivery serves [`business-model/03_segment-map.md`, §1]. Caution flagged in §5: DoorDash's NTM revenue growth (+22.8%, LTM $15,891mm → NTM $19,513.83mm) is faster than Uber Delivery's own recent trend, which is decelerating and carries a reported-growth headwind from the Trendyol Go divestiture [`business-model/03_segment-map.md`, §1, citing Q2 2026 transcript l.700-701] — DoorDash's growth premium multiple may not be fully earned by Uber Delivery. Grab (12.26x) is shown as the **secondary, more conservative** Delivery comp in the dispersion range, since Grab also derives meaningful revenue from food/grocery delivery.
- **Freight → C.H. Robinson, only available match.** None of the pool's named comparables (Lyft, DoorDash, DiDi, Grab, Avis, Hertz, Daiwa, Taiwan Taxi) are freight brokers; all are ride-hailing, delivery, or car-rental businesses with the wrong economics for Freight (asset-light digital brokerage connecting shippers and carriers). C.H. Robinson is the standard named comparable for an asset-light, scaled freight-brokerage marketplace and is sourced from the web since no freight-brokerage name exists in the data pool comp set. Freight's derived NTM EBITDA is negative (-$47.6mm — a near-breakeven segment that has run negative or flat-to-breakeven in 5 of the last 6 disclosed fiscal years [`business-model/03_segment-map.md`, §1]), so an EV/EBITDA multiple is not meaningful; Freight is valued on **forward EV/Sales** instead, the defensible fallback when the primary forward metric is negative. C.H. Robinson does not publish a forward EV/Sales figure directly; this agent derives ~1.03x by scaling C.H. Robinson's trailing EV/Sales (1.16x) by the ratio of its Forward P/S to trailing P/S (0.94/1.06 = 0.887) [stockanalysis.com/stocks/chrw/statistics, 2026-08-06] — **Inference, not from filings**, labelled web-sourced and unverified.
- **Corporate capitalization multiple → Uber's own consolidated NTM EV/EBITDA (11.89x).** Used to capitalize the unallocated corporate cost stream because it is an actual, observed market multiple for the whole entity (neutral, not cherry-picked from a peer) [Company Comparable Analysis Uber Technologies Inc.xls, Trading Multiples tab].

## 3. Segment Valuation

Two cases are shown because the Mobility and Delivery multiples are highly sensitive to which named comparable is used (§2). **Base** uses the primary comparable for each segment (Grab for Mobility, DoorDash for Delivery). **Low (conservative sanity check)** uses the secondary comparable for Mobility and Delivery (Lyft, Grab respectively) — Freight and the corporate capitalization multiple are held fixed in both cases (no alternate comp exists for Freight; the corporate multiple is Uber's own observed figure, not a segment-quality judgment).

### Base case

| Segment | NTM Metric Value | Multiple | Segment EV |
|---|---:|---:|---:|
| Mobility | $11,390.8mm (EBITDA) | 12.26x (Grab) | $139,651.2mm |
| Delivery | $5,151.0mm (EBITDA) | 20.78x (DoorDash) | $107,037.8mm |
| Freight | $6,096.2mm (Revenue) | 1.03x (C.H. Robinson, derived) | $6,279.1mm |
| **Gross enterprise value (sum)** | | | **$252,968.1mm** |

### Low / conservative sanity-check case

| Segment | NTM Metric Value | Multiple | Segment EV |
|---|---:|---:|---:|
| Mobility | $11,390.8mm (EBITDA) | 7.94x (Lyft) | $90,443.0mm |
| Delivery | $5,151.0mm (EBITDA) | 12.26x (Grab) | $63,151.3mm |
| Freight | $6,096.2mm (Revenue) | 1.03x (C.H. Robinson, derived) | $6,279.1mm |
| **Gross enterprise value (sum)** | | | **$159,873.4mm** |

Formula shown: Segment EV = NTM segment metric (§2 derivation) × the multiple in the row above.

## 4. Equity Bridge

Both cases share the same corporate-cost capitalization and the same net-debt/minority/equity-method bridge — only the segment EVs differ.

| Step | Base case | Low case |
|---|---:|---:|
| Gross enterprise value (sum, §3) | $252,968.1mm | $159,873.4mm |
| − Capitalized unallocated corporate costs (NTM EBITDA -$3,905.1mm × 11.89x, Uber's own multiple) | -$46,431.6mm | -$46,431.6mm |
| = Enterprise value after corporate | $206,536.5mm | $113,441.8mm |
| − Net debt (strict, from `01`) | -$9,340mm | -$9,340mm |
| − Minority interest (from `01`) | -$1,083mm | -$1,083mm |
| − Preferred | $0 | $0 |
| + Equity-method investments (Financials.xls, Balance Sheet tab, Jun-30-2026) | +$3,773mm | +$3,773mm |
| **= Equity value** | **$199,886.5mm** | **$106,791.8mm** |
| ÷ Diluted shares (from `01`) | 2,087.980mm | 2,087.980mm |
| **= SOTP value per share** | **$95.73** | **$51.15** |
| vs current price ($68.18) | +40.4% | -25.0% |

**Net-cash sign discipline:** Uber is net-debt positioned (strict basis $9,340mm), so a single "− net debt" line is used; no separate net-cash add-back applies.

**Corporate cost — not vanished.** The -$2,708mm FY2025 corporate bucket is explicitly scaled (to -$3,905.1mm NTM) and capitalized at Uber's own 11.89x multiple, then subtracted as a discrete bridge line ($46,431.6mm) — the single largest subtraction in the bridge, at 18.4% of gross EV in the base case. It is not dropped by assertion (Reconciliation Gate 3).

**Equity-method investments.** Only the $3,773mm "Equity Method Investments" balance-sheet line is added back, per `01`'s labelling. Uber separately carries $12,532mm of "Long-term Investments" (which includes a ~$4bn pre-acquisition Delivery Hero stake purchased in Q2 2026) [`01_price-and-capital-structure.md`, §4] — this larger balance is **not** added back here, consistent with `01`'s own treatment (neither netted into cash nor added elsewhere), because the pool provides no reliable current-period split of that balance into liquid vs. strategic/illiquid holdings. Flagged as an unresolved, potentially material upside (~$12.5bn, ~$6/share if added whole) not captured in this SOTP.

**Conglomerate / holding-company discount: none applied.** Uber is classified as an Operating business (not a Holding company) in the Business-Type Method Map — Mobility, Delivery, and Freight share one technology platform, one driver/courier supply network, and overlapping management, rather than being run as unrelated independent businesses. No structural holdco discount is warranted. The wide base-to-low dispersion below already captures comparable-selection risk; the pending Delivery Hero acquisition (announced on the Q2 2026 call [`business-model/03_segment-map.md`, §3]) is a separate, unquantified integration-risk flag, not a discount applied here.

## 5. SOTP Read

Using the best-matched named comparables (Grab for Mobility, DoorDash for Delivery, C.H. Robinson for Freight), the base SOTP value is **$95.73/share, 40.4% above the $68.18 price**; using the more conservative comparable pair (Lyft for Mobility, Grab for Delivery), the same construction produces **$51.15/share, 25.0% below price**. This ~$44/share, near-2x dispersion — driven almost entirely by which multiple is credited to Mobility and Delivery — means the SOTP method here **straddles the current price and cannot cleanly call the stock over- or under-valued**; it is a directional cross-check on comparable selection, not a precision target, and its combined weight (with the DCF) is capped as a minority input to the base fair value per the module's multiples-first policy.

Mobility carries the majority of gross segment value in every scenario (55-57% of gross EV, both cases) — consistent with its 69.1% share of pre-corporate segment profit (§1) — and is the segment the consolidated 11.89x multiple most under-credits if Uber Mobility's 26.6% EBITDA margin (roughly triple Grab's own 9.2% consolidated margin) genuinely deserves a peer-marketplace multiple standalone. Delivery's implied value is the single most sensitive line in this analysis: it swings from $63.2bn to $107.0bn (40-42% of gross EV either way) depending on whether Uber Delivery deserves DoorDash's high-growth premium multiple (20.78x) or Grab's more moderate multi-sided-marketplace multiple (12.26x) — given Delivery's decelerating, divestiture-affected growth versus DoorDash's own faster top line, the low-case comparable is arguably the more defensible read. Freight is immaterial in every case (2-4% of gross EV) and structurally troubled (revenue down 27% from its FY2022 peak), confirming it is not a source of hidden value the consolidated multiple is masking.
