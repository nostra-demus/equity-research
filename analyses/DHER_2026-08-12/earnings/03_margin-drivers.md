# Margin Drivers — DHER

Reporting standard: IFRS as adopted by the EU, reporting currency EUR (€) [FY24 Annual Report]. No audited FY2025 Annual Report exists in this pool — FY2025 figures below come from the verbatim FY2025 earnings-call transcript (management-stated) and the Capital IQ (CIQ) workbook export, cross-checked against each other; this is flagged wherever the FY2025 figure cannot be reconciled to an audited line item, consistent with `01_historical-financials.md`.

**Sector overlay (step 3b):** No row in `frameworks/SECTOR_OVERLAYS.md` matches "on-demand delivery marketplace converting into an owned-inventory quick-commerce retailer" cleanly. The nearest analogue is the **Retail / consumer** row, but the business-model module's own check (`business-model/02_business-identity.md` §3a) found it a poor fit — DHER does not disclose a single retail-style gross margin or inventory turns for its Dmarts business, and same-store-sales-style metrics exist only as GMV like-for-like growth. **No sector overlay cleanly applies — the generic cost stack is used, supplemented with the company's own primary KPI grammar (GMV, Total Segment Revenue, Adjusted EBITDA, Adjusted EBITDA margin), since that fits the actual business better than a generic retail read** — consistent with the business-identity module's own conclusion.

## 1. Segment Decomposition Status

`business-model/03_segment-map.md` exists and is used. DHER is **not** single-segment: it reports five segments (Asia, MENA, Europe, Americas, Integrated Verticals), and MENA — the profit-dominant segment — is only 68.3% of FY2024 Group Adjusted EBITDA and 27.6% of Total Segment Revenue, well below the 85% single-segment threshold [Segment Map §2; FY24 Annual Report, "Key Figures," p.4]. Full segment-level P&L (revenue and Adjusted EBITDA) is disclosed and used below.

**Data-vintage flag carried forward from the segment-map:** the FY2024 segment figures are audited (FY24 Annual Report). No FY2025 audited annual report or segment note exists in this pool — the FY2025 segment figures used in Sections 6–7 come from a Capital IQ workbook export tied to the Mar-26-2026 FY2025 earnings call (Tier 5/6, unaudited), flagged everywhere they are used [Delivery Hero SE XTRA DHER Financials.xls, Segments tab, Dec-31-2025 column].

## 2. Cost Stack

Generic cost stack applies (no sector-overlay match — see above), adapted to DHER's actual disclosed cost lines. Two vintages are used because the granular cost-of-sales breakdown is disclosed only in the audited FY2024 Annual Report — no equivalent FY2025 breakdown exists in this pool.

| Cost Line | % of Revenue | Direction | Evidence | Margin Risk |
|---|---:|---|---|---|
| **Total Cost of Sales (COGS)** | FY2025: 75.6% (CIQ) / FY2024: 72.9% (audited) | Rising (worsening gross margin) | CIQ Income Statement tab; FY24 AR, Consolidated Statement of Profit or Loss, p.107 | High — largest cost block, 3 of 4 last years rising as % of revenue |
| — of which Delivery expenses (external riders + own fleet) | FY2024: 49.0% of revenue, 67.2% of COGS (up from 64.5% FY2023) | Rising | FY24 AR, Note 15/2 "Cost of Sales," p.109 | High — single largest line; no disclosed pass-through mechanism (§3) |
| — of which Dmarts cost of goods (merchandise sold, net of rebates) | FY2024: 16.2% of revenue | Roughly flat as % of revenue | FY24 AR, Note 15/2, p.182 | Mid — inventory-heavy, still loss-making at segment level (§6) |
| — of which Payment-service fees | FY2024: 3.7% of revenue (down from 4.3% FY2023) | Falling (scale economies) | FY24 AR, Note 15/2, p.182 | Low |
| — of which Server hosting | FY2024: 1.2% of revenue (down from 1.3% FY2023) | Falling | FY24 AR, Note 15/2, p.182 | Low |
| — of which Picker cost (Dmarts) | FY2024: 0.9% of revenue (up from 0.9% FY2023) | Roughly flat | FY24 AR, Note 15/2, p.182 | Low |
| Labor (group total) | Not disclosed as a single group figure | Not assessable | Personnel costs are split across functional lines: IT personnel €441.0m FY2024 (down from €500.8m); G&A personnel €593.0m FY2024 (down from €625.4m) — "Not proven from available data" as a single group labor total | Mid — embedded mainly in Delivery expenses (rider pay) and functional opex |
| Freight / logistics | Covered under Delivery expenses above — DHER *is* the logistics network (riders largely freelance/third-party) | Rising | FY24 AR, p.109; Value Chain §2 | High (see Delivery expenses row) |
| Energy / fuel | Not disclosed as a quantified P&L line — only qualitative reference to fuel vouchers as a rider-retention perk | Not assessable | `business-model/10_external-dependency.md` §1 | Low-Mid, unquantified |
| SG&A — Marketing + IT + G&A (audited, FY2024 basis) | FY2024: Marketing 11.8% + IT 4.3% + G&A 14.7% = 30.8% of revenue (down from 14.7%+5.9%+17.6%=38.2% FY2023) | Falling (leverage) | FY24 AR, "Results of Operations," p.108–109 | Mid — improving, but FY2024 G&A includes a €225.5m antitrust-provision allocation (one-off), so the underlying decline is smaller than the headline |
| SG&A — CIQ single bucket (FY2025, **different categorization, not directly comparable to the audited FY2024 functional split above**) | FY2025: 23.5% of revenue (CIQ "Selling General & Admin Exp.") vs FY2024: 30.5% on the same CIQ basis | Falling, large magnitude | CIQ Income Statement tab | Flagged — CIQ's own FY2024 SG&A figure (30.5%) does not match the audited AR's Marketing+IT+G&A sum (30.8%, close by coincidence) or its individual G&A line (14.7% audited vs CIQ's own implied ~18.7% G&A share) precisely; treated as directional only, not decomposed line-by-line (§7a basis rule) |
| R&D (CIQ supplemental line, not a separate AR P&L line) | FY2025: 2.8% of revenue vs FY2024: 3.4% | Falling | CIQ Income Statement tab, Supplemental Operating Expense Items | Low — embedded within IT/G&A in the audited AR presentation |
| D&A (cash-flow-statement basis, consistent across both years) | FY2025: 2.6% of revenue vs FY2024: 3.1% | Falling | CIQ Cash Flow tab; FY24 AR, p.108–109 ("Depreciation, amortization and impairment expenses decreased by 20.6%") | Low-Mid — tailwind for EBIT margin |
| Stock-based compensation (non-cash, excluded from Adjusted EBITDA) | FY2025: 1.6% of revenue (€224.1m) vs FY2024: 1.4% (€171.1m) | Rising | FY2025 Earnings Call, CFO remarks: "Share-based compensation increased to EUR 224 million... we expect it to remain broadly stable" | Mid — widens the Adjusted-vs-reported EBITDA gap (earnings-quality flag, see `06`) |
| Interest expense (below operating line, shown for completeness) | FY2025: 2.7% of revenue (€382.1m) vs FY2024: 2.6% (€316.9m) | Rising | CIQ Income Statement tab | Low-Mid — non-operating, but relevant to net-margin/FCF |

## 3. Gross Margin → EBITDA Margin → EBIT Margin Walk

| Margin Level | FY2025 | FY2024 | Change bps | Main Reason | Evidence |
|---|---:|---:|---:|---|---|
| Gross margin | 24.4% | 27.1% | **-266bps** | COGS grew faster than revenue (+18.5% vs +14.4%), driven mainly by the continued own-delivery mix shift raising delivery-expense share of COGS (mechanism confirmed for FY2024 vs FY2023 in §7; FY2025 vs FY2024 line-item breakdown not disclosed — data gap, see §7) | CIQ Income Statement tab; `01_historical-financials.md` §1 |
| EBITDA margin (Adjusted, company-defined) | 6.4% | 5.6% | **+79bps** | Segment margin-rate improvement (Americas, Integrated Verticals) outweighing Asia's competitive-driven margin decline — see §7 segment bridge. Pace of expansion has decelerated sharply vs prior years (+814bps FY22, +800bps FY23, +308bps FY24, +79bps FY25 YoY — see `01` §6) | FY2025 Earnings Call, CFO remarks: "Adjusted EBITDA grew by a strong 30%... reaching EUR 903 million" |
| EBITDA margin (reported/GAAP, CIQ line) | 2.2% | -0.2% | **+237bps** | Large swing driven mostly by one-off items normalizing (FY2024's reported figure was depressed by the Uber-breakup-fee-related reconciliation swing and a smaller goodwill impairment than FY2025's own impairment) — a quality flag, not a clean operating signal (see `06_earnings-quality`) | CIQ Income Statement tab; `01_historical-financials.md` §4 |
| EBIT margin (Operating Income) | 0.7% | -2.1% | **+280bps** | First positive statutory operating result in five years, driven by declining D&A (-53bps of revenue) and normalizing one-off items, partly offset by the -266bps gross-margin compression above | CIQ Income Statement tab |

**Pass-through lag, stated explicitly:** DHER has **no disclosed contractual mechanism** tying commission or delivery-fee rates to rider-cost inflation. `business-model/06_value-chain.md` §2 states plainly: "The filing does not describe any contractual pass-through mechanism, escalator, or indexed-pricing clause tying commission or delivery-fee rates to rider cost inflation." Where a cost shock is regulatory rather than commercial, the company has **absorbed it, not passed it through** — the Europe segment's FY2024 Adjusted EBITDA miss versus the Group's own guided range was explicitly attributed to "additional expenses recognized for rider-related reclassification risks in Italy" [FY24 AR, p.4, p.106]. The only demonstrated lever that behaves like a price increase is discount/voucher pull-back (vouchers fell from 8.1% to 6.9% of Total Segment Revenue FY2024 while GMV still grew) [FY24 AR, p.109]. There is effectively **no lag to measure because there is no pass-through mechanism at all** — cost increases are managed through mix shift (own delivery capturing the fee) and voucher discipline, not price.

## 4. Margin Walk — Which Margin Level Matters Most?

**Adjusted EBITDA margin is the most useful metric for this business**, for three reasons. First, it is what management actually guides to and what the Street tracks most closely — `04_guidance-consensus.md` confirms Adjusted EBITDA is the sole headline non-GAAP profitability metric DHER publishes guidance on (FY2026: €910m–€960m), and consensus is built around it. Second, gross margin is structurally distorted by an accounting mix effect that has nothing to do with underlying profitability: shifting revenue toward the Dmarts/Integrated Verticals segment (where DHER is "principal" and recognizes close to the full sale price) mechanically compresses reported gross margin relative to the commission-based marketplace segments, even when the shift is economically positive — the FY24 Annual Report itself attributes the FY2024 gross-margin decline explicitly to "higher own delivery volumes and the increasing Integrated Verticals share" [FY24 AR, p.108], a mix effect, not an efficiency signal. Third, EBIT margin, while now marginally positive, is still whipsawed by non-cash impairments and legal/antitrust provisions that swing by hundreds of millions of euros year to year (§3) — too noisy to read as a clean quarter-to-quarter signal. Adjusted EBITDA margin strips these distortions out, at the cost of being a company-defined, not-fully-audited-for-FY2025 metric — a real earnings-quality caveat that `06_earnings-quality` should examine, not a reason to prefer a noisier GAAP line here.

## 5. Margin Driver Table (consolidated)

| Driver | Impact on Margins | Direction | Magnitude | Evidence |
|---|---|---|---|---|
| Own-delivery mix shift (78% of group orders FY2025, up from 67% FY2024) | Adds the delivery fee to revenue (tailwind for revenue/take-rate) but raises delivery-expense share of COGS (headwind for gross margin) — net effect on Adjusted EBITDA margin ambiguous, historically net positive but decelerating | Mixed / Headwind on gross margin specifically | High — drove the entire -288bps of COGS/revenue-ratio increase in FY2024 vs FY2023 (§7) | FY2025 Earnings Call, prepared remarks; FY24 AR, p.108–109 |
| Segment mix shift toward MENA (highest-margin segment, 13.5% Adj. EBITDA/segment revenue FY2025, ~60.5% of segment Adj. EBITDA) | Tailwind — MENA both grows and improves margin | Tailwind | High | CIQ Segments tab, Dec-31-2025; Segment Map §2 |
| Integrated Verticals (Dmarts) reaching near-breakeven (-3.6% FY2024 → +0.1% FY2025 segment margin) | Tailwind — single largest positive margin-rate contributor to the FY2025 Adjusted EBITDA increase | Tailwind | High — contributed ~€119m of the ~€150m group margin-rate effect (§7) | CIQ Segments tab; Q1 2026 Trading Statement Call ("we will remain on slight positive EBITDA, while still reinvesting") |
| Asia competitive intensity (GMV -7.7% FY2024; Adj. EBITDA margin -192bps FY2025) | Headwind — the only segment where margin is actively eroding | Headwind | Mid-High — Asia is ~29% of segment revenue | FY24 AR, p.4, p.105–106; CIQ Segments tab |
| Rider employment-reclassification regulation (Spain, Italy; contingent liability €440m–€770m in Spain alone) | Headwind — hits the largest cost line (delivery expenses, 93.7% freelance/third-party) with no pass-through mechanism | Headwind | High if it spreads beyond Spain/Italy — already realized in Europe's FY2024 EBITDA miss | Value Chain §5; FY24 AR, p.126–128, p.203–204 |
| Voucher/discount discipline (vouchers 8.1%→6.9% of Total Segment Revenue FY2024; vendor-funded deals +8pp YoY in Saudi Arabia vs DH-funded discounts) | Tailwind — a demonstrated, controllable lever | Tailwind | Mid | FY24 AR, p.109; Q1 2026 Trading Statement Call |
| Advertising / AdTech revenue (nearing €1.5bn run-rate) | Tailwind — high-margin layer growing faster than the base business; explicitly framed by management as reducing "reliance on commission alone" | Tailwind | Mid-High (Inference on margin rate — no disclosed AdTech-specific margin %) | FY2025 Earnings Call, prepared remarks |
| Stock-based compensation (+31% YoY to €224.1m FY2025, management says "broadly stable" going forward) | Headwind on reported EBITDA/EBIT (excluded from Adjusted EBITDA) | Headwind (reported basis only) | Mid | FY2025 Earnings Call, CFO remarks |
| FX (USD, KRW devaluation vs EUR) | Headwind flagged for FY2026 revenue/GMV comparability; disclosed monetary-exposure sensitivity is modest at group P&L level (10% USD/EUR move = €26.8m, ~0.19% of FY2025 revenue) but does **not** cover full income-statement translation of the ~85% of revenue earned outside the eurozone | Headwind | Mid — disclosed sensitivity is Low, but translation exposure is understated by that sensitivity (see `10_external-dependency.md` §2) | FY2025 Earnings Call, prepared remarks; `10_external-dependency.md` §2 |
| FY2026 stepped-up investment (customer loyalty in MENA/South Korea, Integrated Verticals) | Headwind to near-term Adjusted EBITDA margin *expansion pace* — see §9 for the demand-side counter-read | Headwind (near-term) / Unknown (net, pending §9) | Mid-High — explicitly named by management as the reason FY2026 guidance is not simply extrapolated growth | FY2025 Earnings Call, prepared remarks: "we increase our investments in customer loyalty... as well as investments in integrated verticals" |
| D&A declining as % of revenue | Tailwind for EBIT margin | Tailwind | Low-Mid (-53bps FY2025 vs FY2024) | CIQ Cash Flow tab |
| One-off legal/antitrust/impairment items (management adjustments) | Volatile — swung from -€511.9m (FY2024) to -€147m (FY2025) on the Adjusted-EBITDA-to-EBT bridge | Tailwind in FY2025 relative to FY2024, but inherently unpredictable | Mid-High on reported (not Adjusted) profit measures | FY2025 Earnings Call, CFO remarks; CIQ Segments tab reconciliation |

## 6. Margin Drivers By Segment

FY2025 figures below are sourced from the CIQ Segments tab (Tier 5, tied to the Mar-26-2026 FY2025 earnings call, Tier 6) — **unaudited**, no FY2025 audited segment note exists in this pool. FY2024 figures are audited.

### Segment: MENA (26.6% of FY2025 Total Segment Revenue)

| Driver | Impact | Direction | Magnitude | Evidence |
|---|---|---|---|---|
| Subscription penetration (up to 61% of GMV in Saudi Arabia) | Reduces discount spend, supports margin | Tailwind | High | Q1 2026 Trading Statement Call |
| Category-share defense vs. a discount-heavy new entrant (Saudi Arabia, entered Sep-2024) without matching discounts | Margin preserved via loyalty/product, not price war | Tailwind | High — segment margin held at 13.5% FY2025 vs 13.4% FY2024, essentially flat despite the competitive entry | Q1 2026 Trading Statement Call: "growth has accelerated since the annualization of Keeta's market entry and margin impact has been limited" |
| Iran-conflict-driven "eat-at-home" demand spike in Saudi Arabia (Mar-2026) | One-time revenue/mix boost — **flagged non-run-rate** per the Cycle-Position Rule | Tailwind, but explicitly temporary | Low-Mid — management states KSA GMV growth was already >20% before the conflict, so the underlying trend does not depend on it | Q1 2026 Trading Statement Call |
| Stepped-up FY2026 loyalty/quick-commerce investment | Near-term margin-rate headwind, offset by accelerating GMV/order growth (see §9) | Mixed | Mid-High | FY2025 Earnings Call; Q1 2026 Trading Statement Call |

### Segment: Asia (29.1% of FY2025 Total Segment Revenue, largest by revenue)

| Driver | Impact | Direction | Magnitude | Evidence |
|---|---|---|---|---|
| Competitive intensity in "certain regions" | GMV fell 7.7% FY2024; Adj. EBITDA margin fell to 7.5% FY2025 from 9.5% FY2024, a -192bps decline | Headwind | High — the only segment with an outright margin decline in the latest period | FY24 AR, p.4, p.105–106; CIQ Segments tab |
| South Korea operating-model rebuild ("completely rebuilt the Korean operating model over the last 2 years") | Returned to positive order/GMV growth in Q1 2026 after investment; still a drag historically | Tailwind (emerging), Headwind (historically) | Mid | Q1 2026 Trading Statement Call |
| Own-delivery rollout in Asia (+12pp to 77% of segment orders) | Same mixed gross-margin-vs-take-rate effect as group-level (§5) | Mixed | Mid | Q1 2026 Trading Statement Call |

### Segment: Integrated Verticals / Dmarts (21.0% of FY2025 Total Segment Revenue)

| Driver | Impact | Direction | Magnitude | Evidence |
|---|---|---|---|---|
| Store rationalization (fewer, more profitable Dmarts locations) plus order-per-store growth (~30% revenue growth on "just a marginal increase in number of stores") | Operating leverage — orders per store rising is "very healthy for economics" per management | Tailwind | High — segment swung from -3.6% to +0.1% Adj. EBITDA margin FY2024→FY2025, the largest single margin-rate improvement in the group (§7) | FY2025 Earnings Call, Q&A |
| Still not commercially breakeven at scale; management guides only to "slight positive EBITDA" while continuing to reinvest | Caps near-term upside from this segment | Neutral-to-Tailwind, capped | Mid | Q1 2026 Trading Statement Call |

### Segment: Europe (16.4% of FY2025 Total Segment Revenue)

| Driver | Impact | Direction | Magnitude | Evidence |
|---|---|---|---|---|
| Rider employment-model transition in Spain (Glovo, employment-based from mid-2025) | One-off transition costs depressed H1 2025; segment "ended up around breakeven in the fourth quarter as planned" | Headwind (transitory) → improving | High while transition was live | FY2025 Earnings Call, Q&A |
| Italy rider-reclassification legal risk, unresolved | Contingent future headwind if a broader employment mandate follows | Headwind (contingent) | Unknown magnitude — no employment-model shift currently expected per management ("there is no discussions at this point in time that we will move to employment model") | FY2025 Earnings Call, Q&A |

### Segment: Americas (7.0% of FY2025 Total Segment Revenue, smallest)

| Driver | Impact | Direction | Magnitude | Evidence |
|---|---|---|---|---|
| Segment turned solidly profitable (1.1% FY2024 → 9.5% FY2025 Adj. EBITDA margin, +836bps) | Tailwind — second-largest positive margin-rate contributor to the group bridge after Integrated Verticals | Tailwind | High for a small segment (7% of revenue) | CIQ Segments tab; Segment Map §1 |
| Argentina IAS 29 hyperinflation accounting | Distorts comparability of reported growth/margin | Headwind on comparability, not necessarily on cash economics | Low-Mid | Segment Map §1 |

## 7. Margin Bridge — Latest Period

Two separate, fully reconciled bridges are shown because the data available at each granularity differs. **A full FY2025-vs-FY2024 gross-margin cost-of-sales-line bridge is not possible from available disclosure** — no audited FY2025 Annual Report or cost-of-sales note exists in this pool, so the -266bps FY2025 gross-margin change (§3) cannot be decomposed into delivery/Dmarts/payment/hosting/picker lines the way FY2024 vs FY2023 can. This is stated as a data gap, not estimated.

### 7a-i. Gross margin bridge, FY2024 vs FY2023 (audited — the most granular bridge the pool supports)

| Cost-of-sales line | FY2024 % of revenue | FY2023 % of revenue | Change (bps of revenue) | Direction |
|---|---:|---:|---:|---|
| Delivery expenses | 48.98% | 45.22% | **-376bps** (worsens gross margin) | Headwind |
| Dmarts cost of goods | 16.21% | 16.12% | -9bps | Headwind (small) |
| Payment-service fees | 3.74% | 4.33% | +59bps | Tailwind |
| Server hosting | 1.16% | 1.29% | +13bps | Tailwind |
| Picker cost | 0.93% | 0.88% | -5bps | Headwind (small) |
| Other cost of sales | 1.90% | 2.25% | +35bps | Tailwind |
| **Total COGS/revenue change** | 72.92% | 70.11% | **-282bps** (sum of components: -376-9+59+13-5+35 = -283bps) | — |
| **Stated Total gross margin change** | | | **-282bps** | Reconciled — **1bps residual**, immaterial |

### 7a-ii. Adjusted EBITDA € bridge, FY2025 vs FY2024, by segment (CIQ Segments tab, both years — consistent basis)

Group Adjusted EBITDA (segment sum) rose from €692.6m (FY2024) to €902.8m (FY2025), a change of **+€210.2m**, decomposed per segment into a volume effect (revenue growth at the prior year's margin) and a margin-rate effect (this year's margin applied to this year's revenue, net of the volume effect):

| Segment | Volume effect (€m) | Margin-rate effect (€m) | Total ΔEBITDA (€m) | Actual ΔEBITDA (€m) |
|---|---:|---:|---:|---:|
| MENA | +67.8 | +5.4 | +73.2 | +73.1 |
| Asia | +32.7 | -84.8 | -52.1 | -52.0 |
| Europe | -24.2 | +22.0 | -2.2 | -2.2 |
| Americas | +1.3 | +88.4 | +89.7 | +89.7 |
| Integrated Verticals | -17.5 | +119.0 | +101.5 | +101.6 |
| **Total** | **+60.1** | **+150.0** | **+210.1** | **+210.2** |

**Reconciliation: 210.1 of 210.2 = fully reconciled, ~0.1m residual, immaterial.** The finding: **71% of the Adjusted EBITDA increase came from margin-rate improvement, not revenue growth** (+150.0m margin-rate vs +60.1m volume) — driven overwhelmingly by Integrated Verticals (+119.0m) and Americas (+88.4m), almost entirely offset on the negative side by Asia (-84.8m).

**Basis note (§7a rule):** this segment bridge is built on Total Segment Revenue (€15,184.3m FY2025 / €13,141.0m FY2024), not the IFRS Revenue used for the headline Adjusted EBITDA/Revenue margin in §3 (€14,059.6m / €12,294.7m). On the Total-Segment-Revenue basis, group Adjusted EBITDA margin moved 902.8/15,184.3=5.95% vs 692.6/13,141.0=5.27%, a change of **+68bps** — this does **not** exactly equal the headline +79bps (§3, computed on IFRS Revenue). The **11bps gap is the residual from the basis difference**: Total Segment Revenue grew faster than IFRS Revenue in FY2025 (+15.6% vs +14.4%) because the voucher/reconciliation-effects gap between the two bases widened (from -€846.3m to -€1,124.7m) — this is stated explicitly rather than treating the two bases as interchangeable.

## 7a. Bridge Attribution and Residual

**Gross margin bridge (FY2024 vs FY2023):**
```
Delivery expenses: (48.98% - 45.22%) of revenue = 3.76pp = 376bps
  Basis: audited FY2024 Annual Report cost-of-sales note, both years on the same revenue-denominator basis
  = 376bps of the 282bps observed gross-margin decline (this single line, on its own, is larger than the
    total decline — offset by Payment fees +59bps, Server hosting +13bps, Other COGS +35bps)
  → basis matches, both years drawn from the same audited note
Sum of all six cost-of-sales-line components = -283bps vs stated Total -282bps
  → 1bps residual, reconciled
```

**Adjusted EBITDA € bridge (FY2025 vs FY2024, segment level):**
```
Integrated Verticals margin-rate effect: €3,189.0m (FY2025 segment revenue) × (0.09% - (-3.64%))
  = €3,189.0m × 3.733% = €119.0m
  Basis: CIQ Segments tab, both years on the same (Total Segment Revenue, per-segment) basis
  = €119.0m of the €210.2m total group Adjusted EBITDA increase (57% of the total, the single largest
    component)
  → basis matches (same source, same denominator convention, both years)
Sum of volume + margin-rate effects across all five segments = €210.1m vs stated actual €210.2m
  → €0.1m residual, immaterial, reconciled
On the margin-percentage read (not the € read): segment-revenue-basis margin change (+68bps) vs
  IFRS-revenue-basis headline margin change (+79bps, §3) — an 11bps gap from the two bases growing at
  different rates (Total Segment Revenue +15.6% vs IFRS Revenue +14.4%) — this gap is NOT applied silently;
  it is named here as a basis-mismatch residual, not folded into either figure.
```

Both bridges reconcile with residuals under 2bps / €0.1m — small enough that a "biggest driver" claim in §8 can be made with confidence for each respective period, subject to the explicit caveat that the two bridges cover **different periods** (FY2024-vs-FY2023 for the gross-margin line-item bridge; FY2025-vs-FY2024 for the Adjusted-EBITDA segment bridge) because the pool does not support the same granularity in both years.

## 8. The Single Biggest Margin Driver

**Rider employment-classification regulation, applied to a cost line DHER cannot currently price around.** Delivery expenses are 67.2% of cost of sales and ~49% of revenue (FY2024, audited) [FY24 AR, p.109], and 93.7% of that spend runs through external/freelance riders, not DHER's own employed fleet [Value Chain §2]. There is no disclosed contractual mechanism to pass a rider-cost increase through to commission or delivery-fee pricing (§3) — when a reclassification-driven cost shock hit Europe in FY2024, the company absorbed it rather than pricing around it, missing its own guided Adjusted EBITDA range as a direct result [FY24 AR, p.4, p.106]. The disclosed contingent liability for the Spain courier-fleet reclassification alone is €440.0m–€770.0m [FY24 AR, p.203–204], and a comparable outcome in Italy (or any of the several jurisdictions where legislation is "shifting, evolving" per management's own Q&A comment) would hit the *same* cost line group-wide, not one segment in isolation — unlike Asia's competitive-margin erosion (§6), which is contained to a single segment and has shown some evidence of being manageable (Saudi Arabia's response to a discount-heavy entrant, §6). A stress illustration using the §7a-i basis: a 5% rider-cost increase applied to the ~49%-of-revenue delivery-expense line, with no offsetting price action (consistent with the demonstrated absence of a pass-through mechanism), would be roughly 49% × 5% ≈ 245bps of revenue — a High-magnitude move on the primary margin metric (§4), larger than any single driver identified in §5 or §7 except the delivery-expense mix-shift effect itself. **Current direction: contained but not resolved** — Italy's reclassification risk is unresolved ("we will come back with more information, when there is something to say" — FY2025 Earnings Call, Q&A), and the EU Platform Work Directive gives member states 24 months to transpose new rules DHER itself flags as a source of "additional obligations for platforms and an increased risk regarding the reclassification of workers" [`10_external-dependency.md` §1].

## 9. Investment Spend — Both Signs

FY2026 opex investment (customer loyalty programs in MENA and South Korea, continued Integrated Verticals build-out) is running well above the prior steady state — management explicitly named it as the reason Adjusted EBITDA margin *expansion pace* is guided to slow sharply (from +308bps FY2024 to a guided-implied lower rate for FY2026, continuing the deceleration already visible: +814bps→+800bps→+308bps→+79bps YoY, FY2021–FY2025 per `01_historical-financials.md` §6). Capex itself grew a more modest +16.6% FY2025 vs FY2024 (€325.8m vs €279.5m, broad capex measure) or +23% on the CIQ narrow PP&E-only measure (€171.0m vs €139.1m) — not an extreme step-change — but the qualitative commentary is explicit that this is a deliberate, named investment cycle, so both signs are scored below.

| Reading | What it would show | Evidence here |
|---|---|---|
| Spend as a future COST | Increased loyalty/subscription-funding and Dmarts investment lowers near-term Adjusted EBITDA margin *expansion pace* even as absolute Adjusted EBITDA still grows; management explicitly cited this as the reason the FY2026 guide isn't a simple extrapolation of FY2025's growth rate | FY2025 Earnings Call, prepared remarks: "we increase our investments in customer loyalty in key markets, including MENA and South Korea as well as investments in integrated verticals" — flagged as an FY2026 EBITDA-guidance driver |
| Spend as a DEMAND signal | Group order growth accelerated to 10% in Q1 2026 from 9% in Q4 2025; GMV growth accelerated to 8.8% like-for-like from 7.9%; South Korea "returned to positive order and GMV growth" after two years of rebuild investment; management raised its own confidence to the **upper half** of the FY2026 EBITDA range only 35 days after setting it, explicitly because of "positive results from investments in MENA, Asia and Quick Commerce" | Q1 2026 Trading Statement Call, prepared remarks and Q&A (UBS exchange: "why don't we see... a step change in economics... what's changed over the last 35 days" → management: "we have seen very positive results in Korea... very good results also in Middle East... we feel confident that we are going to land in the higher end of the range") |

**Current read:** the evidence favors the **demand-signal reading as the dominant one, not merely the cost reading**. Management did not merely absorb higher near-term investment against flat or slower growth — it raised its own guidance confidence toward the top of the FY2026 range specifically citing early returns from the same investment 35 days after guidance was set, and Q1 2026 order/GMV growth accelerated across MENA, Asia (South Korea specifically), and Quick Commerce simultaneously. The single observable that would flip this read: **if the FQ2 2026 print (scheduled 2026-08-27, per `04_guidance-consensus.md` §1) shows GMV/order growth decelerating from Q1's pace while the elevated investment continues** — that would indicate the spend is not converting to demand and the cost reading should dominate instead. As of this report, no such deceleration is visible in the data reviewed.

**Cycle-position note (§ Cycle-Position Rule):** DHER's Adjusted EBITDA margin is in an early-stage structural ramp, not a cyclical peak — it turned positive only in FY2023 (2.6%) and has expanded every year since to 6.4% in FY2025, with no prior profitability cycle in this company's history to compare against (Adjusted EBITDA/GMV margin: 0.6% FY2023 → 1.4% FY2024) [`01_historical-financials.md` §1; FY24 AR, p.4]. The one identified one-time tailwind in the current data — Saudi Arabia's "extra high single-digit growth" in March 2026, attributed by management to a shift toward eat-at-home consumption during the Iran conflict — is explicitly non-run-rate and should not be extrapolated into FY2026 MENA margin or growth expectations, though management states KSA GMV growth was already above 20% before the conflict began [Q1 2026 Trading Statement Call].
