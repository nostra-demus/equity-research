# Sum-of-the-Parts — DHER (Delivery Hero SE)

**Reporting basis:** IFRS as adopted by the EU, reporting currency EUR, fiscal year ending 31 December. Delivery Hero reports five reportable segments — four regional online-marketplace ("platform") segments (MENA, Asia, Europe, Americas) plus one cross-regional operating-model segment (Integrated Verticals, the own-warehouse "Dmarts" quick-commerce business) [FY24 Annual Report, Combined Management Report, Note A.3 "Segments", p.100]. MENA is 68.3% of FY2024 Group Adjusted EBITDA — well under the 85% single-segment threshold — so this is a genuinely multi-segment business and SOTP is run in full, not collapsed [`business-model/03_segment-map.md` §2].

**Price context (carried from `01_price-and-capital-structure.md`, mandatory on every comparison below):** the current price of €37.20 (2026-08-07, pool-verified, Capital IQ) is **deal-contaminated** by Uber Technologies' pending acquisition offer for Delivery Hero, announced 2026-07-16. The stock has more than doubled from €15.73 (2026-03-26, pre-announcement). No fixed offer price was found in the pool. Every "vs current price" comparison in this report is therefore a read on deal-completion odds and assumed terms, not a clean standalone-fundamentals comparison — this is flagged inline wherever the comparison appears. Separately, ~€2,588.4m of convertible bonds (~23% of market cap) carry unquantified dilution risk: conversion prices were not found in the pool, so the per-share figures below use the basic/latest share count (303,744,978) per `01`'s Anchor Block and do **not** net this dilution in. If conversion strikes sit below the SOTP values derived here, actual per-share value would be somewhat lower than shown.

---

## 1. Segment Inventory

Primary basis: FY2024 (audited, Delivery Hero SE Annual Report, published 2025-04-25 — the most recent Tier-1 segment disclosure in the pool). "% of Total EBIT" denominator = the sum of the five reportable segments' Adjusted EBITDA, which by construction totals 100% (the segment-sum ties to Group Adjusted EBITDA almost exactly: €692.6m segment-sum vs. €692.5m Group-reported, a rounding difference) [FY24 AR, "Key Figures" p.4].

| Segment | Revenue (Total Segment Revenue basis) | Adj. EBITDA | Margin | % of Total (Segment) EBIT | Source |
|---|---:|---:|---:|---:|---|
| MENA | €3,527.8m | €472.9m | 13.4% | 68.3% | FY24 AR, "Key Figures" p.4 |
| Asia | €4,071.9m | €385.1m | 9.5% | 55.6% | FY24 AR, "Key Figures" p.4 |
| Integrated Verticals | €2,709.8m | −€98.7m | −3.6% | −14.3% | FY24 AR, "Key Figures" p.4 |
| Europe | €1,891.9m | −€77.0m | −4.1% | −11.1% | FY24 AR, "Key Figures" p.4 |
| Americas | €939.6m | €10.3m | 1.1% | 1.5% | FY24 AR, "Key Figures" p.4 |
| **Sum** | **€13,141.0m** (102.7% of Total Segment Revenue €12,796.4m — the 2.7pt excess is a disclosed −€344.5m intersegment-consolidation adjustment, not an error) | **€692.6m** (≈100% of Group Adj. EBITDA €692.5m) | — | **100.0%** | FY24 AR, p.4 "Notes" |

**FY2025 directional cross-check (unaudited, Tier 5 — Capital IQ, not the primary basis):** MENA Adj. EBITDA €546.0m (60.5% of the €902.8m segment-sum, ties to Company-reported Adjusted EBITDA €903m), Asia €333.1m (36.9%, down y/y — the only segment where Adj. EBITDA fell), Europe −€79.2m, Americas €100.0m (a sharp swing from €10.3m in FY2024), Integrated Verticals €2.9m (first year in positive territory) [`Delivery Hero SE XTRA DHER Financials.xls, Segments tab, Dec-31-2025 column`]. This widens MENA's dominance further and is used as the base year for the FY2026E forward metrics in Section 3 below, per this module's forward-basis hard rule.

**The unallocated bucket does not vanish (Reconciliation Gate 3).** Below segment Adjusted EBITDA sits a large, named, centralized reconciling item: "Unallocated Management Adjustments" (−€511.9m FY2024 / −€146.7m FY2025) plus "Unallocated Expenses for Share-Based Compensation" (−€171.1m FY2024 / −€224.1m FY2025) — together −€683.0m (FY2024) and −€370.8m (FY2025) [`Delivery Hero SE XTRA DHER Financials.xls, Segments tab`; FY24 AR, p.107]. This bucket is the reason the Group's audited IFRS operating result was a loss of −€341.3m in FY2024 despite €692.5m of segment Adjusted EBITDA [FY24 AR, p.107]. It is carried forward, capitalized and subtracted, in the Section 4 equity bridge — it is not dropped.

**Minority-interest note carried forward:** the MENA segment consolidates 100% of talabat's results even though DHER holds only an 80% economic interest following talabat's December 2024 Dubai Financial Market listing [FY24 AR, p.106; `business-model/03_segment-map.md` §1]. This is addressed explicitly in Section 4 — it materially changes the equity bridge and is the single largest data-quality finding in this report.

---

## 2. Segment Multiples & Comparables

Every segment is valued on a **forward** metric — FY2026E — because DHER discloses no analyst consensus at the segment level (only Group-level consensus exists in the pool: `earnings/04_guidance-consensus.md`). FY2026E segment metrics are therefore built from a stated, evidence-anchored method (Section 3), not fabricated, and every multiple below cites a named, forward-basis comparable.

| Segment | Metric Used (period basis) | Multiple Applied | Named Comparable | Comparable's Multiple | Source |
|---|---|---:|---|---:|---|
| MENA | FY2026E Adj. EBITDA (forward) | 12.0x EV/EBITDA | Talabat Holding plc (DFM:TALABAT) | ~12.0x FY2026-guidance-implied EV/EBITDA (EV €5,433.3m ÷ FY2026 guided Adj. EBITDA midpoint €454.2m$^{1}$) | Web-sourced, unverified: stockanalysis.com Talabat statistics, accessed 2026-08-12 (EV, market cap); Talabat FY2026 Adj. EBITDA guidance $510m–$540m per market-data aggregator search, 2026 (unverified) |
| Asia | FY2026E Adj. EBITDA (forward) | 14.2x EV/EBITDA (45% discount to comp) | Meituan (SEHK:3690) | 25.83x NTM TEV/Forward EBITDA | `Company Comparable Analysis Delivery Hero SE.xls, Trading Multiples tab`, as of 2026-08-10 (in-pool, Capital IQ) |
| Europe | FY2026E Revenue (forward) | 1.2x EV/Revenue (deal multiple, undiscounted) | DoorDash's acquisition of Deliveroo plc (announced 2025-05-06, closed 2025-10-02) | 1.2x implied EV/Revenue (EV ~£2.4bn ÷ Deliveroo FY2024 revenue ~£2.0bn) | Web-sourced, unverified: DoorDash IR press release "DoorDash Announces Agreement to Acquire Deliveroo," 2025-05-06 |
| Americas | FY2026E Revenue (forward) | 1.8x EV/Revenue (10% discount to comp) | Swiggy Limited (NSEI:SWIGGY) | 1.98x NTM TEV/Forward Total Revenue | `Company Comparable Analysis Delivery Hero SE.xls, Trading Multiples tab`, as of 2026-08-10 (in-pool, Capital IQ) |
| Integrated Verticals | FY2026E Revenue (forward) | 0.95x EV/Revenue (64% discount to comp) | Eternal Limited / Zomato-Blinkit (NSEI:ETERNAL) | 2.62x NTM TEV/Forward Total Revenue | `Company Comparable Analysis Delivery Hero SE.xls, Trading Multiples tab`, as of 2026-08-10 (in-pool, Capital IQ) |

$^{1}$ Talabat FY2026 guided Adj. EBITDA midpoint $525m converted at EUR/USD ~1.156 (per `01`'s own cross-check rate) = €454.2m; Talabat's own EV of AED 23.07bn converted via AED/USD peg 3.6725 then EUR/USD 1.156 = €5,433.3m.

**Why each comparable matches the segment's economics, not just its label (Hard Rule):**
- **MENA — Talabat.** This is close to a direct match, not an analogy: talabat *is* the core of DHER's MENA segment (the segment map notes MENA "is run almost entirely through talabat" [`business-model/08_competitive-map.md` §1]). Talabat's own FY2026-guidance-implied multiple (~12.0x) is used un-discounted. Cross-check: talabat's guided Adj. EBITDA (€454.2m) is smaller than DHER's disclosed MENA segment Adj. EBITDA (€546.0m FY2025), consistent with MENA also including Yemeksepeti (Türkiye) and hyperinflation-accounting effects — a reasonable, not exact, reconciliation.
- **Asia — Meituan.** Meituan combines commission-based food-delivery marketplace economics with an expanding instant-retail/quick-commerce business — the same mix as DHER's Asia segment (foodpanda + Baemin/Woowa). It is NOT chosen for its "delivery" surface label alone; the match is the marketplace-plus-instant-retail structure. But DHER's Asia segment is explicitly **losing share** — GMV fell −7.7% in FY2024 "driven by rising competition," with Adjusted EBITDA "flat year-over-year... due to the effects of the competitive environment" [FY24 AR, p.105–106; `business-model/08_competitive-map.md` §3] — versus Meituan's continued growth leadership in a much larger home market. A 45% discount to Meituan's multiple is applied for this reason. (Grab Holdings, a closer geographic match for Southeast Asia, trades even richer — 33.2x LTM EV/EBITDA, web-sourced, stockanalysis.com, 2026-08-12 — so it does not lower the range; it confirms Asia food-delivery/quick-commerce peers as a group carry a growth premium DHER's Asia segment has not earned on its own recent trend.)
- **Europe — the DoorDash/Deliveroo transaction.** This is a real, market-clearing acquisition price for a European on-demand food-delivery marketplace operating in the same countries as DHER's Europe segment (UK, Ireland, France, Italy, Belgium, plus Gulf overlap) — stronger evidence than a trading multiple, because it is what a real, informed buyer (DoorDash, itself a comp in `business-model/08_competitive-map.md`) actually paid. Limitation, stated: the 1.2x multiple was set on Deliveroo's trailing (FY2024) revenue, not a forward figure; applying it to DHER's FY2026E Europe revenue is the best available like-for-like basis but is not a purely forward-on-forward comparison.
- **Americas — Swiggy.** Swiggy is a food-delivery-plus-quick-commerce (Instamart) marketplace in a large emerging market, still not consistently profitable at group level (NTM EBITDA is NM/negative) — a reasonably matched maturity and margin stage to PedidosYa/Americas, which only turned Adjusted EBITDA-positive in H2 2024 and remains thin (1.1% FY2024 margin). A modest 10% discount reflects Americas' smaller scale.
- **Integrated Verticals — Eternal/Blinkit.** This is the one segment where DHER holds inventory and operates its own warehouses (a "principal" model, buying and reselling stock) rather than the commission-based marketplace model of the other four segments [`business-model/03_segment-map.md`]. Eternal's Blinkit business is the closest public match on that structural basis — a principal-model quick-commerce operator, not a marketplace. **A large discount (64%) is applied, and this is a explicit methodology flag, not a rounding choice:** because Integrated Verticals is a principal (inventory-owning) business, its revenue includes a pass-through cost-of-goods component that a commission-based marketplace's revenue does not — applying a marketplace-calibrated revenue multiple at face value would overstate its value. Blinkit is also the clear category leader in its home market; DHER's Dmarts network (800 stores across 48 countries, per the FY2025 earnings call) is comparatively fragmented. Even after the discount, this segment carries the **lowest-confidence** valuation in this report (Section 5).

**Web-sourced multiples are labelled unverified per this module's source hierarchy** — Talabat's EV/guidance figures and the DoorDash/Deliveroo transaction terms are dated, web-sourced inputs used only because no equivalent figure exists in the data pool; the in-pool Capital IQ Trading Multiples tab figures (Meituan, Swiggy, Eternal) are Tier 5 vendor data, not web-sourced.

---

## 3. Segment Valuation

**FY2026E metric construction (labelled inference where it departs from a directly-disclosed figure):**
- **Revenue:** FY2025 (Tier 5) segment revenue grown at the Group consensus FY2026E revenue growth rate (+11.3%, €15,653.2m ÷ €14,059.6m, `DeliveryHeroSEXTRADHEREstimatesReport.xls, Consensus tab`) applied uniformly across segments, since no segment-level revenue consensus exists in the pool. **Inference, not from filings.**
- **Adjusted EBITDA (MENA, Asia, Americas, Integrated Verticals):** built from management's own qualitative FY2026 segment commentary on the FY2025 earnings call (2026-03-26) — MENA and Asia guided to "flattish levels of adjusted EBITDA... at constant currency" (analyst question, confirmed by management's response pattern); Integrated Verticals to "remain on slight positive EBITDA, while still reinvesting"; Americas assumed to continue building on its H2 2025 turn to profitability [`Delivery Hero SE, 2025 Earnings Call, Mar 26 2026`, Q&A]. These qualitative directions are translated into FY2026E point estimates and then scaled (factor 0.9294) so the four segments sum to the Group's own Street-consensus FY2026E Adjusted EBITDA of €951.8m (`earnings/04_guidance-consensus.md` §3) — this scaling is the reconciliation step required by Reconciliation Gate 3. **Inference, not from filings**, anchored to a real qualitative disclosure and a real consensus total.
- **Adjusted EBITDA (Europe):** management indicated Europe reached "around breakeven" in Q4 2025 following the Spain rider-model transition, "continuing to work on... improving the operational performance" [same source]. FY2026E is set at €0m (breakeven), an inference from the Q4 2025 run-rate, given no full-year number was given. Because this base is near zero, Europe is valued on Revenue (Section 2), not EBITDA, to avoid a small-denominator distortion.

| Segment | FY2026E Metric | Metric Value | Multiple | Segment EV | Formula |
|---|---|---:|---:|---:|---|
| MENA | Adj. EBITDA | €507.5m | 12.0x | **€6,090.0m** | 507.5 × 12.0 |
| Asia | Adj. EBITDA | €309.6m | 14.2x | **€4,396.3m** | 309.6 × 14.2 |
| Europe | Revenue | €2,768.2m | 1.2x | **€3,321.8m** | 2,768.2 × 1.2 |
| Americas | Revenue | €1,177.5m | 1.8x | **€2,119.5m** | 1,177.5 × 1.8 |
| Integrated Verticals | Revenue | €3,550.6m | 0.95x | **€3,373.1m** | 3,550.6 × 0.95 |
| **Gross enterprise value (sum)** | | | | **€19,300.7m** | Sum of above |

For reference, the underlying FY2026E revenue figures by segment (before the EBITDA-basis segments' figures are dropped from the value calc) are: Asia €4,918.6m, MENA €4,491.0m, Europe €2,768.2m, Americas €1,177.5m, Integrated Verticals €3,550.6m.

---

## 4. Equity Bridge

**Two items in this bridge are non-standard and are each explained rather than dropped in silently (Reconciliation Gate 3):**

**(a) Capitalized unallocated corporate costs.** The "Unallocated Management Adjustments" and "Unallocated Expenses for Share-Based Compensation" lines identified in Section 1 have run at −€395.2m (FY2023), −€683.0m (FY2024), and −€370.8m (FY2025) — a 3-year average of **€483.0m/year** [`Delivery Hero SE XTRA DHER Financials.xls, Segments tab`]. This is treated as a persistent, real economic cost (SBC is a genuine dilution cost to shareholders; the "management adjustments" bucket has recurred every year at a scale too large and too consistent to treat as one-off, despite management's own "adjusted" framing) and is capitalized as a perpetuity at an assumed 10% capitalization rate (**Inference, not from filings** — no DHER-specific WACC was computed within this agent's scope; 8%–12% sensitivity is shown in Section 5): €483.0m ÷ 10% = **−€4,830.0m**. This is the single largest bridge item — larger than net debt — and is the main reason this SOTP's segment-EV sum cannot be read at face value.

**(b) Minority interest — fair-value basis, not book value.** `01`'s EV bridge carries minority interest at its balance-sheet figure, €154.2m. That figure is not used here because the MENA segment valuation in Section 3 prices **100% of talabat's economics** at talabat's own market multiple, while DHER owns only 80% of talabat following its December 2024 Dubai listing [`business-model/03_segment-map.md` §1]. The correct SOTP treatment is to subtract the public 20% stake's **fair value**, not its balance-sheet carrying value, or the MENA segment value is overstated by ignoring a stake DHER does not own. Talabat's own market cap is AED 25.62bn (≈€6,034.9m at AED/USD 3.6725 and EUR/USD 1.156, both web-sourced, stockanalysis.com, 2026-08-12); 20% of that is **€1,207.0m** — roughly 7.8x larger than the €154.2m book figure. This departs from `01`'s headline minority-interest figure for a stated, segment-specific reason (Reconciliation Gate 1 permits this with an explicit one-line reason): the SOTP methodology requires netting the minority claim on the specific asset being valued at its own market price, and the size of the gap (€1,207.0m vs. €154.2m) is itself a material finding, not a rounding adjustment.

**(c) Conglomerate/complexity discount — 8%, base case.** DHER is not a passive holding company (Business-Type Method Map treats it as Operating, not Holding), so the typical 15–30% holdco discount is not applied wholesale. But a smaller discount is warranted: the group carries a large, opaque unallocated corporate-cost bucket (item a) that is not attributable to any one segment, and it spans five segments at very different maturities — from a 68%-profit-share MENA cash generator to Integrated Verticals, which the company itself says has not yet reached breakeven. An 8% discount is applied to the base case, reflecting this execution and disclosure complexity, not a passive-holdco penalty.

| Step | Value (€m) | Formula / Source |
|---|---:|---|
| Gross enterprise value | 19,300.7 | Section 3 sum |
| − Capitalized unallocated corporate costs | (4,830.0) | €483.0m ÷ 10% cap rate, see (a) above |
| − Net debt | (2,512.8) | `01_price-and-capital-structure.md` §5, strict basis (total debt €4,625.5m − cash €2,112.7m, FY2025) |
| − Minority interest (fair value, talabat 20%) | (1,207.0) | See (b) above; departs from `01`'s book figure (€154.2m) with the stated segment-specific reason |
| + Equity-method investments | 9.8 | `01_price-and-capital-structure.md` §4 (immaterial, FY2025) |
| Subtotal | 10,760.7 | |
| − Conglomerate / complexity discount (8%) | (860.9) | See (c) above |
| **= Equity value** | **9,899.8** | |
| ÷ Diluted shares | 303,744,978 | `01_price-and-capital-structure.md` Anchor Block (basic/latest, best available — fully diluted count not computable; convertible-bond overhang not netted, see header) |
| **= SOTP value per share** | **€32.59** | 9,899.8m ÷ 303,744,978 |
| vs current price (€37.20, deal-contaminated) | **−12.4%** | (32.59 − 37.20) / 37.20 |
| vs pre-announcement price (€15.73, 2026-03-26) | **+107.2%** | (32.59 − 15.73) / 15.73 |

**Net debt is a deduction, not an add-back** — DHER carries net debt, not net cash (€2,512.8m net debt, strict basis, per `01`), so no sign-discipline conflict arises here.

**Cross-method dispersion — the low/high sensitivity is wide and is shown, not hidden.** The two largest swing factors are (i) how much discount to apply to the Asia and Integrated Verticals comparables, and (ii) the corporate-cost capitalization rate. Holding net debt, equity-method investments, and the fair-value minority-interest adjustment fixed (these are facts, not estimates), and varying only the segment-multiple discounts and the capitalization rate:

| Case | Key assumption changes vs. base | Equity Value (€m) | Per Share | vs Current Price (€37.20) |
|---|---|---:|---:|---:|
| **Low** | MENA 10.0x (talabat's own recent LTM range); Asia 10.3x (60% Meituan discount); Europe 0.9x; Americas 1.5x (25% disc.); Integrated Verticals 0.55x (79% disc.); cap rate 8% (→ −€6,037.5m corp-cost drag); conglomerate discount 15% | 4,017.9 | **€13.23** | −64.4% |
| **Base** | As above (Section 3–4) | 9,899.8 | **€32.59** | −12.4% |
| **High** | MENA 12.0x (unchanged — a tight direct comp); Asia 19.4x (25% Meituan discount); Europe 1.6x; Americas 1.98x (no discount); Integrated Verticals 1.7x (35% disc.); cap rate 12% (→ −€4,025.0m corp-cost drag); no conglomerate discount | 17,157.8 | **€56.49** | +51.9% |

This is a genuinely wide range — not false precision, and not a typo. It reflects real uncertainty concentrated in two places: (1) how much of Meituan's/Grab's Asia growth premium and Eternal's Blinkit-leadership premium DHER's own, weaker-positioned Asia and Integrated Verticals segments deserve, and (2) how persistent — and therefore how heavily to capitalize — the ~€483m/year unallocated corporate-cost bucket really is. The **base case (€32.59) is the point estimate this report stands behind**; the range is the disclosed dispersion, per this module's no-false-precision standard.

---

## 5. SOTP Read

The base-case breakup value, €32.59/share, sits about 12% **below** the current €37.20 price — but that price is deal-contaminated by Uber's pending offer (announced 2026-07-16, `01_price-and-capital-structure.md` §1), so this is not evidence DHER is overvalued on fundamentals; it is evidence the current price embeds a takeover premium this standalone-fundamentals SOTP does not attempt to price. Against the €15.73 pre-announcement price, the same base case is **more than double** (+107%) — the more useful read of the two, since it compares like with like (fundamentals vs. fundamentals).

**MENA (talabat) carries the value.** Even after subtracting the fair-value 20% public minority stake DHER does not own (€1,207.0m — 7.8x the €154.2m book figure `01` carries), MENA's segment EV (€6,090.0m) is the largest single contributor and is valued almost 1:1 off talabat's own market price, the tightest and most direct comparable in this report. This is not a hidden segment the consolidated multiple is masking — talabat is separately listed and its value is visible — but the SOTP does surface that the market-implied 20% minority claim (€1,207.0m) is materially larger than the balance-sheet minority-interest figure most readers would default to, which is a real, quantified finding this analysis adds.

**What the consolidated read is more likely to be masking is the unallocated corporate-cost bucket, not a segment.** Capitalizing the persistent ~€483m/year "Unallocated Management Adjustments + SBC" drag (Section 4a) subtracts €4,830.0m at the base 10% cap rate — larger than net debt, and larger than four of the five segments' individual EVs. This is easy to miss because it does not appear as a distinct segment line: a reader who simply sums segment Adjusted EBITDA (which nearly exactly equals Group Adjusted EBITDA, €902.8m FY2025 vs. reported €903m) can be misled into thinking nothing sits below the segment table, when in fact a cost bucket nearly as large as MENA's entire segment EBITDA does.

Sources: `analyses/DHER_2026-08-12/valuation/01_price-and-capital-structure.md`; `analyses/DHER_2026-08-12/business-model/03_segment-map.md`; `analyses/DHER_2026-08-12/business-model/08_competitive-map.md`; `analyses/DHER_2026-08-12/earnings/04_guidance-consensus.md`; `_pool_extracts/Delivery-Hero-SE-XTRA-DHER-Financials__Segments.txt`; `_pool_extracts/Company-Comparable-Analysis-Delivery-Hero-SE__Trading-Multiples.txt`; `_pool_extracts/DeliveryHeroSEXTRADHEREstimatesReport__Consensus.txt`; `_pool_extracts/Delivery-Hero-SE-2025-Earnings-Call-Mar-26-2026.txt`; web-sourced (labelled unverified throughout): stockanalysis.com (Talabat Holding, Grab Holdings statistics, accessed 2026-08-12), DoorDash IR press release on the Deliveroo acquisition (2025-05-06).
