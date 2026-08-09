# Revenue Drivers — UBER

Reporting standard: US GAAP. Reporting currency: USD, in millions unless noted. Fiscal year end: December 31 [FY25 10-K, cover page]. No `ciq_facts.json` sidecar is present in `analyses/UBER_2026-08-09/_pool_extracts/` for this run, so all figures below are this agent's own sourced read of the 10-K, 10-Q, and earnings-call filings, cross-checked against the Capital IQ exports in `data/UBER/`.

## 1. Segment Decomposition Status

Segment decomposition applied — 3 segments (Mobility, Delivery, Freight) from the business-model module's `03_segment-map.md` [analyses/UBER_2026-08-09/business-model/03_segment-map.md]. Uber is not single-segment: Mobility is 57.0% of FY2025 revenue, Delivery 33.2%, Freight 9.8% [FY25 10-K, p.57]. Segment-level revenue and profit are both disclosed, which is a strength for this decomposition; sub-segment detail (Mobility financial-partnerships/advertising revenue split; Delivery Grocery & Retail vs. core-restaurant split) is described only qualitatively and is not quantified in the filings reviewed [FY25 10-K, Note 13].

## 2. Revenue Driver Tree

| Business Type | Revenue Formula |
|---|---|
| Marketplace | GMV × take rate |
| Multi-segment | Sum of segment revenue drivers |

Uber is best modelled as a multi-segment marketplace. Company-specific formula:

**Total Revenue = Σ over segments (Gross Bookings₍segment₎ × Revenue Margin₍segment₎)**, where Gross Bookings₍segment₎ = MAPCs (monthly active platform consumers) × monthly Trips per MAPC (frequency) × average booking value per Trip, and Revenue Margin (Uber's own term for take rate, i.e. revenue ÷ Gross Bookings) is net of Driver/Merchant earnings and Driver incentives [Q2 FY26 10-Q, MD&A, p.33 — Revenue Margin defined; p.43 — Key Metrics]. Freight is a partial exception: its "Gross Bookings" figure is defined to equal Freight revenue itself, so Freight's take rate is effectively fixed at ~1.0 by definition [Q2 FY26 10-Q, MD&A, p.43 — Gross Bookings definition]. Since January 2, 2026, the UK Mobility take rate is structurally lower than before, because a regulatory change moved driver payments in certain UK markets from a cost-of-revenue line to a direct deduction from revenue [Q2 FY26 10-Q, MD&A, p.33].

## 3. Market / Share / Price / Mix Split

| Driver Bucket | Current Direction | Evidence | Importance /100 |
|---|---|---|---:|
| End-market demand | Improving | Trips grew 18% YoY and MAPCs grew 16% YoY in Q2 FY26, the fourth straight quarter of Gross Bookings growth above 20% [Q2 FY26 10-Q, MD&A, p.34; Q2 FY26 Earnings Call, CEO prepared remarks]. Both Mobility and Delivery ride on discretionary consumer spending [analyses/UBER_2026-08-09/business-model/10_external-dependency.md, "Consumer cycle" row] | 80 |
| Company market share | Improving (Delivery); Mixed (Mobility) | CFO: "we gained category position in all of our large markets" in Delivery [Q2 FY26 Earnings Call, Q&A]; in the US, insurance-cost savings reinvested into pricing drove California/L.A./S.F. trip growth to "meaningfully outpace... the rest of the country" [Q2 FY26 Earnings Call, CFO Q&A]. Against this, the segment-map flags Brazil two-wheeler share loss in Mobility to DiDi/Meituan [analyses/UBER_2026-08-09/business-model/03_segment-map.md] | 55 |
| Price / realization (take rate) | Deteriorating (Mobility, regulatory-driven); Stable-to-improving (Delivery, ad-mix-driven) | Mobility take rate (revenue ÷ Gross Bookings) fell from 30.7% (Q2 FY25: $7,288M / $23,762M) to 25.4% (Q2 FY26: $7,363M / $28,988M), a ~528bp drop, driven by the UK business-model change [Q2 FY26 10-Q, MD&A, p.40–41; computed]. Delivery take rate rose slightly, 18.9%→19.1%, helped by a $182M advertising-revenue increase [Q2 FY26 10-Q, MD&A, p.41; computed] | 70 |
| Product / customer / geography mix | Improving | Delivery (higher-growth, still lower-margin-quality than Mobility) is 33.2% of revenue and growing faster (25% vs. Mobility's 18% in FY2025) [FY25 10-K, p.57], shifting the consolidated mix toward Delivery; advertising revenue (higher-margin) rose $568M in Delivery in FY2025 alone [FY25 10-K, p.57] | 45 |
| FX translation | Modest tailwind (recent quarter); ~neutral (FY2025) | Q2 FY26 revenue grew 12% reported vs. 11% constant-currency (~+1.2pp FX tailwind) [Q2 FY26 10-Q, MD&A, p.34]. FY2025 revenue grew 18% both reported and constant-currency (~0pp effect, both rounded to the same whole number) [FY25 10-K, MD&A, p.55] | 25 |
| M&A / divestitures | Present, not yet material at consolidated level | Delivery closed an 85% stake in Trendyol GO (Türkiye) on June 17, 2025 [FY25 10-K, Note 17]; agreed to acquire Getir's Türkiye delivery business (~$435M cash) in February 2026, closed "earlier this month" per the Aug-05-2026 call, i.e. within Q3 FY26 — zero impact on the Q2 FY26 figures analysed here [FY25 10-K, Note 19; Q2 FY26 Earnings Call, Q&A]. A pending acquisition of Delivery Hero (announced; expected close H2 2027) would roughly double Uber's addressable markets to ~100, but has zero effect on any period in this report [Q2 FY26 Earnings Call, CEO/CFO remarks] | 20 (rising to High once Delivery Hero closes) |

This separates market growth from company execution: reported Delivery revenue growth (28% in Q2 FY26) is not pure organic demand — a meaningful (unquantified in this filing) share of it is the Trendyol GO acquisition still working through the year-over-year base, on top of the $182M advertising-mix tailwind [Q2 FY26 Earnings Call, CFO Q&A — "on the whole, it is a headwind to delivery reported growth on a net basis [starting Q3]... because Trendyol Go was a lot larger... than the 2 acquisitions"]. Reported Mobility revenue growth (1% in Q2 FY26) understates organic demand: it is suppressed almost entirely by a one-time regulatory revenue-recognition change in the UK, not by weaker Trip volumes (see Section 6a).

## 4. Revenue Driver Table (consolidated)

| Driver | Current Level | Direction | Magnitude | Evidence |
|---|---|---|---|---|
| Trip / Gross Bookings volume | Trips 3,867M in Q2 FY26 (+18% YoY); Gross Bookings $58.0B in Q2 FY26 (+24% reported / +22% constant-currency) | Improving | High | [Q2 FY26 10-Q, MD&A, p.34, 43]. Segment MD&A attributes GB growth in ALL THREE segments "primarily" or "due to" an increase in Trip volumes, in both FY2025 and Q2 FY26 [FY25 10-K, p.57; Q2 FY26 10-Q, p.41] |
| Take rate / regulatory revenue-recognition regime | Mobility take rate 25.4% (Q2 FY26), down ~528bp YoY | Deteriorating (Mobility, mechanical, not demand-driven) | High | UK change cut Mobility/total revenue by $1.1B in Q2 FY26 alone and $2.1B for H1 FY26 [Q2 FY26 10-Q, MD&A, p.34]. See Section 6a for the arithmetic |
| Segment mix (Delivery vs. Mobility growth gap) | Delivery 33.2% of FY25 revenue and growing 25% vs. Mobility's 18% [FY25 10-K, p.57] | Improving (mix shifting to a lower-margin-quality but faster-growing segment) | Mid | [FY25 10-K, p.57] |
| Advertising revenue (mostly Delivery) | +$568M in FY2025; +$182M in Q2 FY26 alone | Improving | Mid | [FY25 10-K, p.57; Q2 FY26 10-Q, p.41] |
| FX translation | ~+1.2pp tailwind to revenue growth in Q2 FY26; ~0pp for FY2025 | Improving (recently; historically variable) | Mid | [Q2 FY26 10-Q, MD&A, p.34; FY25 10-K, MD&A, p.55] |
| M&A (Delivery bolt-ons; pending Delivery Hero) | Trendyol GO closed Jun-2025; Getir closed Aug-2026 (Q3, not in this report's period); Delivery Hero pending, expected close H2 2027 | Improving, not yet material | Mid (Low today; High post-2027 if Delivery Hero closes) | [FY25 10-K, Note 17, Note 19; Q2 FY26 Earnings Call, Q&A] |
| Freight cycle (industrial/trucking demand) | Freight revenue +26% YoY in Q2 FY26 vs. −1% for full-year FY2025 | Improving (early recovery — see cycle-position note below) | Low at consolidated level (~9.8% of revenue); High within the segment | [Q2 FY26 10-Q, MD&A, p.41; FY25 10-K, p.57] |
| Regulatory driver-classification risk (contractor→employee) | Not currently triggered in a major market; New Zealand Supreme Court found 4 drivers were employees while logged in (Nov 2025) | Deteriorating tail risk (not a current-period driver) | High if triggered | Company states reclassification in a major market "would require us to fundamentally change our business model" [FY25 10-K, Item 1A, p.11–12] |
| Insurance-cost tailwind reinvested into pricing (US) | Insurance flagged by CFO as "becoming a tailwind this year," reinvested into fares, concentrated in California | Improving | Mid | [Q2 FY26 Earnings Call, CFO Q&A] |
| Sparse-market penetration / new products (U4B, Uber Health, Reserve) | <10% of eligible US consumers in sparse markets used Uber in the past 12 months vs. >50% in dense markets; U4B +40% YoY | Improving | Mid | [Q2 FY26 Earnings Call, CFO Q&A] |
| Autonomous-vehicle (AV) commercialization | Live in 7 cities, "on track to be live in 15 cities by year-end" 2026 | Improving, not yet material | Low today | CEO: "the numbers are small at this point" [Q2 FY26 Earnings Call, CEO Q&A] |
| Uber One membership (retention/frequency) | 46 million members as of Dec-31-2025, available in 30+ countries | Stable-to-improving (no YoY comparison disclosed in this pool) | Mid | [FY25 10-K, p.9] |

Magnitude bands per this module's convention: High = >5% revenue impact from a reasonable move; Mid = 2–5%; Low = <2%.

## 5. Revenue Drivers By Segment

### Segment: Mobility (57.0% of FY2025 revenue)

| Driver | Current Level | Direction | Magnitude | Evidence |
|---|---|---|---|---|
| Trip volumes | Mobility Gross Bookings $28,988M in Q2 FY26, +22.0% reported / +20% constant-currency YoY | Improving | High | [Q2 FY26 10-Q, MD&A, p.40–41, 43] |
| UK regulatory revenue-recognition change | −$1.1B to Mobility revenue in Q2 FY26 alone; −$2.1B for H1 FY26 | One-time step-down, not a demand change | High | [Q2 FY26 10-Q, MD&A, p.34, 40] |
| Insurance cost / pricing lever | Insurance expense rose $851M in FY2025 (up on rate per mile and miles driven); management is now reinvesting insurance savings into lower fares, concentrated in California | Improving (pricing lever, company-controlled) | Mid | [FY25 10-K, p.57; Q2 FY26 Earnings Call, CFO Q&A] |
| Airport-trip concentration | 15% of 2025 Mobility Gross Bookings came from airport trips | Stable (travel-cycle sub-exposure) | Mid | [analyses/UBER_2026-08-09/business-model/10_external-dependency.md] |
| Financial-partnerships and advertising revenue (Mobility) | Included in Mobility revenue but not quantified separately | Not proven from available data | Not assessable | [FY25 10-K, Note 13] |

### Segment: Delivery (33.2% of FY2025 revenue)

| Driver | Current Level | Direction | Magnitude | Evidence |
|---|---|---|---|---|
| Trip volumes | Delivery Gross Bookings $27,463M in Q2 FY26, +26.4% reported / +25% constant-currency YoY | Improving | High | [Q2 FY26 10-Q, MD&A, p.41, 43] |
| Advertising revenue | +$182M in Q2 FY26 alone; +$568M for FY2025 | Improving | Mid | [Q2 FY26 10-Q, p.41; FY25 10-K, p.57] |
| M&A (Trendyol GO, Getir, Careem reconsolidation) | Trendyol GO (85% stake, closed Jun-17-2025) not yet fully lapped in the Q2 FY26 YoY comparison; Getir closed Aug-2026 (Q3, not in this quarter); a net headwind to reported growth from Q3 FY26 as Trendyol GO laps | Net tailwind in Q2 FY26, becomes a net headwind from Q3 FY26 | Mid | [FY25 10-K, Note 17, Note 19; Q2 FY26 Earnings Call, CFO Q&A] |
| Category/share position | "We gained category position in all of our large markets" | Improving | Mid | [Q2 FY26 Earnings Call, CFO Q&A] |
| Pending Delivery Hero acquisition | Announced; expected close H2 2027, migration through 2029; would roughly double addressable markets | Not yet in the numbers | Currently zero; High if/when it closes | [Q2 FY26 Earnings Call, CEO/CFO remarks] |

### Segment: Freight (9.8% of FY2025 revenue) — immaterial to consolidated revenue magnitude, covered briefly

| Driver | Current Level | Direction | Magnitude | Evidence |
|---|---|---|---|---|
| Freight rate cycle | Q2 FY26 revenue +26% YoY ("increase in gross booking per trip and trip volume"), reversing FY2025's −1% ("challenging freight market cycle") | Improving — early recovery | Low at consolidated level; High within segment | [Q2 FY26 10-Q, MD&A, p.41; FY25 10-K, p.57] |

**Cycle-position read (Cycle-Position Rule):** Freight is the one segment with a clear external demand/margin cycle. FY2025 revenue fell 1% and the 10-K used explicit trough language, "challenging freight market cycle" [FY25 10-K, p.57]. That phrase does not reappear in the Q2 FY26 10-Q; instead Freight revenue rose 26% YoY on "an increase in gross booking per trip and trip volume" — both rate and volume improving together [Q2 FY26 10-Q, p.41]. This reads as an early-stage recovery off a trough, not a new steady-state — freight-rate cycles have historically been multi-year and this is one data point (a single quarter) after a prior down-year, so the current level should not be treated as a normalised run rate. Mobility and Delivery do not show comparable evidence of being at either a cyclical peak or trough: Gross Bookings growth has stayed above 20% for four consecutive quarters with no disclosed deceleration in underlying Trip volumes [Q2 FY26 10-Q, MD&A, p.34], so this is read as mid-cycle expansion, not peak froth (no valuation or capacity-utilization signal in this pool indicates a peak) and not trough (growth is accelerating, not decelerating, ex-UK — see Section 6a).

**One-time policy item, labelled non-run-rate:** The UK Mobility revenue-recognition change (effective January 2, 2026) is a one-time step-down in reported revenue, not a recurring drag that compounds further. It will continue to suppress year-over-year comparisons through Q4 FY26 (because the prior-year comparison periods predate the January 2026 change), and should mechanically drop out of the year-over-year comparison starting Q1 FY27, once both the current and prior-year quarters sit under the new regime [Q2 FY26 10-Q, MD&A, p.34 — inference on timing, not from filings]. Treat any reported Mobility/total revenue growth rate through Q4 FY26 as understating underlying demand by roughly the size of this item.

## 6. Revenue Growth Decomposition

**Table A — FY2025 annual (clean baseline, no UK distortion; the UK change took effect Jan-2-2026, after FY2025 closed).**

| Component | Contribution to Growth (pp) | Evidence |
|---|---:|---|
| Mobility (segment revenue $ change) | +10.42pp | Mobility revenue $25,087M→$29,670M (+$4,583M) / $43,978M prior-year total [FY25 10-K, p.57; computed] |
| Delivery (segment revenue $ change) | +7.95pp | Delivery revenue $13,750M→$17,248M (+$3,498M) / $43,978M [FY25 10-K, p.57; computed]. Of this, +1.29pp is the disclosed $568M advertising-revenue increase; the remaining +6.66pp tracks Delivery's 22% constant-currency Gross Bookings growth (Delivery core revenue ex-ads grew ~21.3% vs. GB growth of 22%, a ~0.7pp gap) [FY25 10-K, p.57; computed] |
| Freight (segment revenue $ change) | −0.10pp | Freight revenue $5,141M→$5,099M (−$42M) / $43,978M [FY25 10-K, p.57; computed] |
| FX | ~0pp | Reported revenue growth 18% vs. constant-currency revenue growth 18% (both disclosed to the same whole number) [FY25 10-K, MD&A, p.55] |
| M&A (Trendyol GO, within Delivery) | Not separately quantified; embedded in the Delivery row above | Trendyol GO closed Jun-17-2025, contributing ~6.5 months to FY2025 vs. 0 months to FY2024 [FY25 10-K, Note 17] |
| **Total revenue growth** | **18.27pp (18.3%)** | Revenue $43,978M→$52,017M [FY25 10-K, p.9; computed] |

Segment rows sum exactly to the reported total (10.42 + 7.95 − 0.10 = 18.27pp) because segment revenue is, by construction, the full decomposition of consolidated revenue — there is no residual at this level. The residual sits one layer down, inside each segment (see Table B and Section 6a for how far that can be pushed with disclosed data).

**Table B — Q2 FY26 quarterly (most recent quarter; distorted by the UK one-time item, which is flagged, not netted out).**

| Component | Contribution to Growth (pp) | Evidence |
|---|---:|---|
| FX | +1.17pp | Total revenue growth 12% reported vs. 11% constant-currency [Q2 FY26 10-Q, MD&A, p.34]; see derivation in Section 6a |
| UK regulatory revenue-recognition change (one-time) | −8.69pp | $1,100M revenue reduction / $12,651M prior-year total revenue [Q2 FY26 10-Q, MD&A, p.34]; see derivation in Section 6a |
| Volume + price/mix + unquantified M&A (organic, combined — not separable from this filing) | +19.69pp | Plug: Total (12.17pp) − FX (+1.17pp) − UK (−8.69pp); see Section 6a for why this cannot be split further |
| **Total revenue growth** | **12.17pp (12.2%)** | Revenue $12,651M→$14,191M [Q2 FY26 10-Q, MD&A, p.34; computed] |

## 6a. Decomposition Attribution and Residual (MODULE_RULES "Driver Attribution" / §15)

**FX (Table B, Q2 FY26):**
```
FX: reported revenue growth (12%) − constant-currency revenue growth (11%) [Q2 FY26 10-Q, MD&A, Financial and Operational Highlights table, p.34]
  = +1.17pp of the 12.17pp observed growth (12.17% computed from $12,651M→$14,191M; 11% CC as disclosed)
  → basis matches: both figures are the filing's own total-company, same-period reconciliation — no cross-basis use.
```

**UK regulatory revenue-recognition change (Table B, Q2 FY26):**
```
UK change: −$1,100M stated revenue impact, Q2 FY26 quarter alone [Q2 FY26 10-Q, MD&A, p.34]
  ÷ $12,651M prior-year (Q2 FY25) total revenue [Q2 FY26 10-Q, MD&A, p.34]
  = −8.69pp of the 12.17pp observed growth
  → basis matches: this is a company-disclosed dollar figure, not a modelled ratio, applied against the same prior-year total-revenue base used for every other row in Table B, so it is comparable across rows.
```

**Volume + price/mix + M&A (organic, combined) — the plug row:**
```
19.69pp = Total (12.17pp) − FX (+1.17pp) − UK (−8.69pp)
  → This is a residual, not an independently measured driver. Trips grew 18.3% YoY (3,268M→3,867M) [Q2 FY26 10-Q, MD&A, p.43] is the nearest available corroborating figure, but it cannot be equated to the 19.69pp on a like-for-like basis: Trips is a count metric that EXCLUDES Freight, while the 19.69pp is a revenue-dollar contribution that INCLUDES Freight — different bases (§15). The two are directionally consistent (both show demand still expanding) but this report refuses to present 19.69pp as "Volume's contribution" on the authority of an 18.3% Trips number measured on a different base.
```

**Reconciliation:** 1.17pp + (−8.69pp) + 19.69pp = **12.17pp reconciled, $0.00pp arithmetic residual** in Table B (the third row is defined as the plug, so it reconciles by construction). But the ECONOMIC content of that reconciliation is limited: only two of the three rows (FX, UK) rest on a named, independently disclosed mechanism; the third and largest row in absolute-value terms (19.69pp, versus 1.17pp and 8.69pp for the other two) is an undifferentiated bundle of volume, price, mix, and unquantified M&A. That means more than half of the gross magnitude in Table B (19.69 of the 1.17+8.69+19.69=29.55pp total gross swing) is not attributed to a specific, evidenced mechanism. This caps how precisely Section 7 can size any single organic sub-driver — it can name Volume as the *structurally* largest lever (on repeated qualitative filing language, see Section 7), but it cannot put a verified number on Volume alone from this quarter's bridge.

Table A (FY2025 annual) has no such problem: its rows are segment revenue dollars, which sum to the total by construction with zero ambiguity, and the one sub-decomposition performed inside Table A (Delivery's $568M advertising carve-out) is a disclosed dollar figure, not a modelled ratio.

## 7. The Single Biggest Revenue Driver

**Trip / Gross Bookings volume** — driven by MAPC growth (+16% YoY in Q2 FY26) and Trip frequency — is the single biggest revenue driver. It is the base multiplier that both Mobility and Delivery revenue scale from (Freight's own volume plays the same role at a smaller scale), and segment MD&A repeatedly and consistently names an "increase in Trip volumes" as the primary driver of Gross Bookings growth in ALL THREE segments, in both FY2025 and Q2 FY26 [FY25 10-K, p.57; Q2 FY26 10-Q, MD&A, p.41]. A 10–20% swing in Trip volume — up or down — would move Gross Bookings, and therefore revenue at a given take rate, by a broadly comparable order of magnitude across the whole company simultaneously; no single segment's take-rate move can do that on its own, because take rate is much closer to its structural bounds (Freight's is fixed near 1.0 by definition, and Mobility's just took the biggest evidenced move seen in this data set, ~528bp, which is close to the upper end of what a regulatory shock — not a routine pricing decision — can do). Current direction: still expanding. Trips grew 18% YoY and MAPCs grew 16% YoY in Q2 FY26, marking the fourth consecutive quarter of Gross Bookings growth above 20% [Q2 FY26 10-Q, MD&A, p.34; Q2 FY26 Earnings Call, CEO prepared remarks]. The one flag on this conclusion, stated plainly per Section 6a: this quarter's own revenue bridge could not separate Volume's dollar contribution from Price/Mix/M&A inside the 19.69pp organic bucket, so the claim above rests on the filing's repeated qualitative attribution language across two reporting periods, not on a verified pp figure from this quarter's arithmetic alone. Separately and worth flagging even though it is not the "biggest" driver by this test: take rate/regulatory policy is the biggest source of near-term SURPRISE in the reported numbers — it has already moved one quarter's revenue growth by 8.7 percentage points via a single country's tax/regulatory change, a bigger single-quarter swing than anything volume has produced on its own in this data set.
