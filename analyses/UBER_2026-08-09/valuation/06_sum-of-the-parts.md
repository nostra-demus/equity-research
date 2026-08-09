# Sum-of-the-Parts — UBER

**Reporting standard:** US GAAP. **Reporting currency:** USD, in millions except per-share figures. Uber Technologies, Inc. is a US SEC filer (NYSE: UBER); no local-equivalent substitution is needed. All figures are drawn from the FY25 10-K (filed 2026-02-13) and the Q2 FY26 10-Q (filed 2026-08-05) unless otherwise cited [FY25 10-K, cover page; Q2 FY26 10-Q, cover page].

Uber is **not** effectively single-segment — Mobility is the dominant segment (57.0% of FY25 revenue, 69.1% of FY25 segment-level Adjusted EBITDA) but Delivery is material on both measures (33.2% / 31.2%) [upstream: `business-model/03_segment-map.md`, citing FY25 10-K, Note 13, p.8421–8613]. A full three-segment SOTP is run below; the partial-data single-segment collapse does not apply.

**Anchor reuse (Reconciliation Gate 1).** Price $68.18 (2026-08-06, pool-verified last close), diluted shares 2,050.225mm (Q2 FY26 diluted weighted-average, GAAP TSM + if-converted), net debt $9,340mm (strict basis: total debt $14,731mm − cash & ST investments $5,391mm), minority interest $1,083mm, preferred $0, equity-method investments $3,773mm (Delivery Hero $3,502mm + Careem $147mm + other $124mm, sitting inside Long-Term Investments and NOT netted in `01`'s canonical EV) — all taken verbatim from `01_price-and-capital-structure.md`, Sections 2, 4, 7.

## 1. Segment Inventory

Figures below are **FY2025 (audited, year ended Dec-31-2025)** on **Segment Adjusted EBITDA**, the measure the company used for that year. This is the trailing/audited anchor for Section 1 only — it is **not** the forward metric used to value the segments in Sections 2–3 (see the basis-change note below).

| Segment | Revenue | Adjusted EBITDA | Margin | % of Total Segment EBITDA | Source |
|---|---:|---:|---:|---:|---|
| Mobility | $29,670M | $7,899M | 26.6% | 69.1% | FY25 10-K, p.8421–8577 |
| Delivery | $17,248M | $3,572M | 20.7% | 31.2% | FY25 10-K, p.8446–8591 |
| Freight | $5,099M | -$33M | -0.6% | -0.3% | FY25 10-K, p.8465–8613 |
| **Segment-level total** | **$52,017M** | **$11,438M** | **22.0%** | **100.0%** | FY25 10-K, p.8484–8620 |
| Corporate G&A and Platform R&D (unallocated) | — | -$2,708M | — | (23.7% of segment total) | FY25 10-K, p.8620–8667 |
| **Consolidated Adjusted EBITDA** | | **$8,730M** | | | FY25 10-K, p.8620–8667 |

Reporting currency USD; reporting standard US GAAP. **Denominator for "% of Total Segment EBITDA"**: the sum of the three reportable segments' Adjusted EBITDA ($11,438M), which is how the company itself presents the reconciliation — this is *before* the unallocated Corporate G&A / Platform R&D bucket ($2,708M, 23.7% of segment-level total), which is disclosed separately and is not dropped [FY25 10-K, p.8620–8667]. Freight's -0.3% is a small negative share, not an error — a loss-making segment mechanically produces a negative share of a positive segment-level total.

**Basis-change flag (do not blend).** Beginning Q1 FY26, Uber replaced Segment Adjusted EBITDA with **Segment Operating Income** as its segment performance measure, and recast prior periods to the new basis; Segment Operating Income is a genuinely different (EBIT-type, post-D&A/SBC-allocation) measure, not a relabeling [Q2 FY26 10-Q, Note 10, p.14216–14221]. FY25 Adjusted EBITDA (Section 1, above) is therefore **not** blended with the FY26 Segment Operating Income figures used as the forward valuation metric in Sections 2–3 below — the two bases are kept separate throughout this report, per the upstream segment-map's own warning [`business-model/03_segment-map.md`, §3].

## 2. Segment Multiples & Comparables

**Forward metric basis (stated once, applies to all three segments):** FY26E figures below are **not** a consensus estimate (no segment-level consensus exists in the data pool or via CIQ) — they are the company's own **audited six-months-ended Jun-30-2026 (H1 FY26) Segment Operating Income and revenue, annualized (×2)** [Q2 FY26 10-Q, Note 10, p.15434–15462 (six-month segment table): Mobility Segment Operating Income $4,244M, Delivery $2,016M, Freight -$54M; revenue Mobility $14,161M, Delivery $10,313M, Freight $2,920M, per `business-model/03_segment-map.md` citing the same 10-Q pages]. Annualizing a half-year actual is **inference, not from filings** for the doubling step itself, though the underlying H1 figures are audited/filed. This is labelled **"FY26E (annualized H1 FY26 actual)"** throughout — a forward-year proxy, not a trailing-year multiple base, satisfying the Calculation Standard 10 forward-basis requirement in the absence of segment consensus.

Uber's Segment Operating Income is already net of D&A (an EBIT-type measure), and Uber's consolidated D&A run-rate is small (~1.4% of revenue: H1 FY26 D&A $372M ÷ H1 FY26 revenue $27,394M [Capital IQ Financials_Quarterly, Income Statement tab]) — so using it as a close proxy for segment EBITDA, matched against comparables' NTM EV/EBITDA multiples, understates true segment EBITDA only slightly and makes the resulting valuation mildly **conservative**, not inflated.

| Segment | Metric Used (period basis) | Multiple Applied | Named Comparable | Comparable's Multiple (period basis) | Source |
|---|---|---:|---|---:|---|
| Mobility | FY26E Segment Operating Income, used as a segment-EBITDA proxy (annualized H1 FY26) | 7.94x | **Lyft, Inc. (NasdaqGS:LYFT)** | NTM TEV/Forward EBITDA 7.94x | Capital IQ Comparable Analysis export, Trading Multiples tab, as-of 2026-08-06 |
| Delivery | FY26E Segment Operating Income, used as a segment-EBITDA proxy (annualized H1 FY26) | 20.78x | **DoorDash, Inc. (NasdaqGS:DASH)** | NTM TEV/Forward EBITDA 20.78x | Capital IQ Comparable Analysis export, Trading Multiples tab, as-of 2026-08-06 |
| Freight | FY26E segment revenue (annualized H1 FY26) | 1.13x | **C.H. Robinson Worldwide, Inc. (NasdaqGS:CHRW)** | **LTM (trailing)** EV/Revenue 1.13x — flagged, see note | Web: stockanalysis.com, CHRW statistics page, as of 2026-08-08 (indicative, unverified) |

**Why each comparable fits (business economics, not surface label):**
- **Lyft** is Uber's own named ridesharing competitor [FY25 10-K, Item 1, "Competitive Environment," p.5] and, per the upstream competitive map, "the closest same-business, same-geography peer" — a US/Canada peer-to-peer rideshare marketplace on the same asset-light driver-supply model as Mobility [`business-model/08_competitive-map.md`, §2].
- **DoorDash** is a same-model, multi-brand (DoorDash/Wolt/Deliveroo) asset-light delivery marketplace connecting merchants, consumers and couriers — the direct structural analog to Uber's Delivery segment, including the same international-expansion-via-acquisition pattern Uber is now pursuing with Delivery Hero [Capital IQ Comparable Analysis export, Business Description tab].
- **C.H. Robinson** is a non-asset-based (does not own trucks) freight brokerage connecting shippers and carriers — the correct economic match for Uber Freight's marketplace/brokerage model, as distinct from an asset-heavy trucking-fleet owner (e.g., J.B. Hunt) that the CIQ comp set does not even include here.

**Freight basis flag.** No forward (NTM) EV/Revenue or EV/EBITDA multiple for C.H. Robinson was available from the sources consulted (web search and a direct statistics-page fetch both returned only trailing figures); the trailing 1.13x above is used and explicitly flagged as **trailing**, not forward, per Calculation Standard 10's fallback allowance. Freight is loss-making at the segment level (FY26E Segment Operating Income -$108M annualized), so an EV/EBITDA multiple cannot be applied to it at all — EV/Revenue is the only usable metric. Freight is ~4% of gross segment EV below and does not drive the SOTP conclusion; a 3-year-average CHRW EV/Revenue of 0.8x (a lower alternative, same web source class, unverified) would cut the Freight segment value to ~$4,672M from $6,599M — a ~$1.9bn swing, immaterial to the total.

**Cross-comp dispersion (secondary comps, named but weaker fit).** Two other named-competitor comps in the pool produce a materially different multiple and are shown as bounds, not the base case:
- **DiDi Global (OTCPK:DIDI.Y)** — named as a Mobility competitor in the FY25 10-K, but per the competitive map "only a partial competitor in practice" (China-dominant; overlaps Uber mainly in LatAm) [`business-model/08_competitive-map.md`, §2]. NTM TEV/Forward EBITDA 16.58x, versus an LTM EBITDA that is currently **negative** (-$564.3M) — the forward multiple rests on a consensus swing to profitability that has not yet happened, a materially more speculative anchor than Lyft's [Capital IQ Comparable Analysis export, Trading Multiples & Financial Data tabs, as-of 2026-08-06].
- **Grab Holdings (NasdaqGS:GRAB)** — a Southeast Asia super-app (ride-hail + delivery + fintech blend), not individually named as a Mobility or Delivery competitor in Uber's own 10-K competitive-environment disclosure, but present in Uber's own CIQ comp set. NTM TEV/Forward EBITDA 12.26x [Capital IQ Comparable Analysis export, Trading Multiples tab, as-of 2026-08-06].

## 3. Segment Valuation

All figures $mm. `Segment EV = FY26E metric × multiple.`

| Segment | Metric Value (FY26E) | Multiple | Segment EV |
|---|---:|---:|---:|
| Mobility | $8,488 (Segment Operating Income, annualized H1 FY26: $4,244 × 2) | 7.94x (Lyft) | $67,395 |
| Delivery | $4,032 (Segment Operating Income, annualized H1 FY26: $2,016 × 2) | 20.78x (DoorDash) | $83,785 |
| Freight | $5,840 (Revenue, annualized H1 FY26: $2,920 × 2) | 1.13x (C.H. Robinson, trailing) | $6,599 |
| **Gross enterprise value (sum)** | | | **$157,779** |

**Dispersion (secondary comps, not the base case):**

| Scenario | Mobility comp | Delivery comp | Gross EV |
|---|---|---|---:|
| Low | Lyft 7.94x ($67,395) | Grab 12.26x ($49,432) | $123,426 |
| **Base** | **Lyft 7.94x ($67,395)** | **DoorDash 20.78x ($83,785)** | **$157,779** |
| High | DiDi 16.58x ($140,731) | DoorDash 20.78x ($83,785) | $231,115 |

(Freight held at $6,599 in all three scenarios — see §2 for its own small sensitivity to the CHRW multiple choice.)

**Reconciliation to consolidated (Gate 3 — no vanished bucket).** FY26E segment-level total Operating Income (annualized H1 FY26 actual) is $12,412M (= $8,488 + $4,032 − $108). Consolidated GAAP Income from Operations for the same H1 FY26 base period was $3,813M [Capital IQ Financials_Quarterly, Income Statement tab; ties to the 10-Q's own six-month segment-note reconciliation, see below]. The **named, line-itemized** reconciling bucket for the six months ended Jun-30-2026, none of it vanished, is [Q2 FY26 10-Q, Note 10, p.15470–15579]:

| Reconciling item (H1 FY26 actual) | $mm |
|---|---:|
| Corporate G&A and Platform R&D | -2,180 |
| Amortization of acquired intangible assets | -120 |
| Legal, non-income tax, and regulatory reserve changes and settlements | -12 |
| Goodwill and asset impairments / loss on sale of assets | -4 |
| Acquisition, financing and divestitures related expenses | -56 |
| Loss on lease arrangement, net | -5 |
| Restructuring and related charges | -16 |
| **Total reconciling items** | **-2,393** |
| = Consolidated Income from Operations, H1 FY26 | **3,813** |

$6,206 (segment total) − $2,393 (reconciling items) = $3,813 ✓ ties exactly to the CIQ-sourced consolidated figure. This is a real, filed reconciliation, not a plug.

## 4. Equity Bridge

**Capitalizing the unallocated corporate bucket (not dropped by assertion — Gate 3).** The reconciling bucket above splits into (a) the recurring, ongoing **"Corporate G&A and Platform R&D"** line — the closest analog to what a segment-based valuation should treat as a permanent negative-earnings drag on group value — and (b) smaller, more episodic items (acquired-intangible amortization, legal/regulatory settlements, impairments, M&A/financing costs, a lease loss, restructuring). These are capitalized differently:

- **Core Corporate G&A and Platform R&D**: $2,180M (H1 FY26) → annualized (×2) = $4,360M. Capitalized as a **perpetual** drag at Uber's own **NTM TEV/Forward EBITDA multiple of 11.89x** [Capital IQ Comparable Analysis export, Trading Multiples tab, as-of 2026-08-06] — the same logic as valuing a segment's EBITDA, applied symmetrically to a negative EBITDA-equivalent: `$4,360M × 11.89x = $51,840M`.
- **Other reconciling items**: $213M (H1 FY26) → annualized (×2) = $426M. Treated as a **single-year cash charge** (1x, not capitalized as a perpetuity) given their episodic nature (M&A/restructuring/legal/impairment/lease items are not expected to recur at this exact level every year): `$426M × 1x = $426M`.
- **Total capitalized unallocated corporate cost: $51,840M + $426M = $52,266M.**

| Step | Value ($mm) |
|---|---:|
| Gross enterprise value (sum of segment EVs, base case) | 157,779 |
| − Capitalized unallocated corporate costs (core $51,840 + episodic $426) | (52,266) |
| = Core operating EV | 105,513 |
| − Net debt (strict basis, per `01`) | (9,340) |
| − Minority interest (per `01`; preferred = $0) | (1,083) |
| + Equity-method investments (Delivery Hero $3,502 + Careem $147 + other $124, per `01`) | 3,773 |
| − Conglomerate / holdco discount | 0 (none applied — see below) |
| **= Equity value** | **98,863** |
| ÷ Diluted shares (per `01`) | 2,050.225mm |
| **= SOTP value per share (base case)** | **$48.22** |
| vs current price ($68.18, 2026-08-06) | **-29.3%** (SOTP base is below price) |

**Dispersion carried through the same bridge** (identical corporate/debt/minority/equity-method deductions of $58,916M applied to the low/high gross EVs from §3):

| Scenario | Gross EV | Equity value | Per share |
|---|---:|---:|---:|
| Low (Delivery on Grab) | 123,426 | 64,510 | $31.46 |
| **Base (Lyft / DoorDash / C.H. Robinson)** | **157,779** | **98,863** | **$48.22** |
| High (Mobility on DiDi) | 231,115 | 172,199 | $83.99 |

**No net cash / net debt double-count.** Uber is net-debt, not net-cash, on the strict basis used by `01` ($9,340M net debt); a single "− net debt" line is used above with no offsetting add-back, so the net-cash sign-discipline rule does not apply here.

**Conglomerate / holding-company discount: none applied.** Uber's three segments are not a diversified holding company of unrelated, arm's-length businesses assembled through M&A — they share a single consumer app, a single driver/courier marketplace supply pool (drivers who complete Mobility trips are frequently the same population Uber recruits for Delivery in many markets), a single technology platform, and centralized capital allocation under one operating team [FY25 10-K, Item 1, business description]. That is a genuine operating synergy case against a discount, not a governance-style conglomerate structure the §24 Filter-4/6 lens would flag; no discount is warranted or applied.

## 5. SOTP Read

The base-case breakup value is **$48.22/share**, about **29% below** the current price of $68.18 (2026-08-06) — but the cross-comp dispersion is wide ($31.46 low to $83.99 high), and the current price sits comfortably inside that range, closer to the high end than the base. **Delivery, not Mobility, carries the largest share of gross segment value in the base case** ($83.8bn of $157.8bn, 53%) even though it generates roughly half of Mobility's forward operating income ($4.0bn vs. $8.5bn) — because the market prices its closest peer, DoorDash, at 20.78x forward EBITDA versus Lyft's 7.94x for Mobility's peer, a nearly 3x gap in what a dollar of forward delivery-platform earnings is worth versus a dollar of forward ride-hailing earnings. A reader anchored on ride-hailing as "the Uber story" is at risk of undercrediting Delivery. Two caveats cut the other way and explain why the SOTP base sits below price rather than above it: first, both Mobility (≈30% FY26E operating margin) and Delivery (≈19.5% FY26E operating margin) run materially more profitable than the raw peer multiples' own businesses (Lyft near breakeven at the EBIT/EBITDA line, DoorDash's own LTM EBIT margin ≈5.5%) — applying the peers' raw multiples without a quality premium is conservative by construction and likely understates the segments; second, the capitalized unallocated corporate-cost bucket ($52.3bn) is large enough on its own to swing the per-share result by roughly $25, and it is a real, filed, line-itemized cost (not an assumption) that a segment-only view must net out in full.

