# Margin Drivers — HAIER (Haier Smart Home Co., Ltd., SHSE: 600690 / SEHK: 6690)

**Currency / standard:** RMB (CNY) millions unless stated otherwise, FY ends Dec-31. Cost-structure and by-product figures below are China ASBE (CAS), A-share basis — this is the only basis on which the company discloses a cost-of-sales breakdown by input line (raw materials / labor / depreciation / energy / other) and by product. IFRS (H-share) figures are used only where explicitly labelled and cross-checked. No `ciq_facts.json` sidecar exists for this ticker, consistent with `01_historical-financials.md`.

**Data limitation carried forward from `01_historical-financials.md`:** no probative call-derived commentary source exists (only two ~7-year-stale 2019 transcripts), so all narrative colour below is drawn from filings' MD&A, not a call. Chinese CAS quarterly filings disclose gross margin narratively only for the standalone latest quarter and cumulative year-to-date — EBITDA and a full quarterly income statement are never disclosed at the discrete-quarter level. This caps how finely the margin walk can be shown intra-year; flagged in place, not silently left blank.

---

## 0. Sector Overlay Status

**No sector overlay for multi-brand global home-appliance manufacturer — generic cost stack applies.** `frameworks/SECTOR_OVERLAYS.md` has no row matching "multi-brand, acquisition-built global appliance manufacturer" — it is not a bank/insurer/REIT, commodity/oil & gas producer, SaaS business, store-based retailer, telecom, asset manager, or pharma company, confirmed at business-model `02_business-identity.md` §3a. The generic operating-company candidate list (raw materials, labor, freight, energy, SG&A, R&D, D&A, mix, one-offs) governs Sections 2–7 below.

---

## 1. Segment Decomposition Status

Business-model `03_segment-map.md` is available and used. Haier is **not** a single-segment company (no segment exceeds 85% of revenue or profit) — it reports 5 IFRS/CAS segments (Refrigerators/Freezers, Kitchen Appliances, Air Solutions, Home Laundry Care, Household Water Solutions) plus an "Other Business" catch-all (channel distribution, equipment parts, small appliances, logistics), 41.7% revenue / 43.4% profit share in the dominant Food Storage & Cooking combination [`analyses/HAIER_2026-08-13/business-model/03_segment-map.md`, §2]. Segment-level **gross margin** by product line is disclosed in the FY2025 Annual Report's own by-product cost-analysis table (revenue, cost of sales, gross margin %, and each figure's YoY change, both FY2025 and FY2024) [FY2025 Annual Report (SSE, CAS), Mar-26-2026, p.42, "分产品情况" (By-Product Analysis)], and segment **operating profit before tax** is disclosed in Note 11(1). This is materially deeper than a revenue-only segment note, so full segment-level margin decomposition is performed below (Sections 5–7). Geography-level gross margin (domestic vs overseas) is also disclosed on the same page and used as a second, cross-checking cut. What is **not** disclosed: a geography-by-segment matrix (e.g., how much of Air Solutions' margin comes from China vs overseas) [`03_segment-map.md`, §3] and unit volumes / ASP by segment [`02_business-identity.md`, §3a] — so the bridge below decomposes margin by product and by region, but cannot separate a segment's margin move into volume vs price within that segment.

---

## 2. Cost Stack

Figures are FY2025 vs FY2024, CAS basis. The "raw materials / labor / depreciation / energy / other" split below is disclosed by the company **only for the five core appliance product segments' combined cost of sales** (RMB185,255.24mn of the RMB220,515.59mn total product-level cost base — i.e., it excludes the "Other Business" channel-distribution/equipment-parts segment, RMB35,260.35mn of cost, which is not broken out by input line) [FY2025 Annual Report (SSE, CAS), Mar-26-2026, p.42, "成本分析表" (Cost Analysis Table)]. This basis is named explicitly because it is used again in Section 7's bridge.

| Cost Line | % of Appliance-Segment Cost of Sales (FY2025 / FY2024) | Direction | Evidence | Margin Risk |
|---|---:|---|---|---|
| Raw materials (steel, aluminium, copper, plastics/foam) | 84.0% / 82.0% | **Headwind** — $ grew +7.46% YoY (RMB155,542.0mn vs RMB144,742.1mn), nearly double the appliance segments' own +3.77% revenue growth, and its cost-mix share rose 2.0pp | [FY2025 Annual Report (SSE, CAS), p.42; also cross-referenced at p.23, p.58 item 3 and `business-model/06_value-chain.md` §2] | **High** — single largest cost line by far; company runs a commodity-futures hedging policy and supplier "volume-price betting" but its own MD&A states these tools did not fully offset Q4 2025 copper/bulk-material inflation |
| Labor | 6.6% / 6.5% | Mild headwind — $ grew +6.97% YoY, above segment revenue growth | [Same table, p.42] | Low |
| Freight / logistics | Not disclosed as a standalone line — embedded within Selling Expenses ("物流仓储费," logistics/warehousing, is named as one of three components of selling expense alongside compensation and advertising) | Not separately assessable | [FY2025 Annual Report (SSE, CAS), p.42, Note 50: "本公司销售费用主要为薪酬费用、物流仓储费、广告促销费等"] | Not assessable standalone — see Selling Expense row below |
| Energy | 0.4% / 0.4% | Neutral — $ grew +6.17% YoY but the line is too small (0.4% of cost base) to move margin materially | [Same table, p.42] | Low (<30bps even on a large percentage move) |
| SG&A — Selling expenses | 11.2% of total revenue / 11.8% (ratio improved 0.55pp; company states "0.6 percentage points") | **Tailwind** — domestic unified-warehouse ("TC") logistics/marketing efficiency, overseas retail-innovation efficiency | [FY2025 Annual Report (SSE, CAS), p.24, item (2); computed 33,877.8/302,346.8 vs 33,608.8/286,015.3] | Mid |
| SG&A — Admin expenses | 4.6% of total revenue / 4.3% (ratio worsened 0.31pp; company states "0.3 percentage points") | **Headwind** — Q4 one-time European org-efficiency restructuring costs plus emerging-market org-building investment offset digital-efficiency gains | [FY2025 Annual Report (SSE, CAS), p.24, item (3); computed 13,762.5/302,346.8 vs 12,135.0/286,015.3] | Mid |
| R&D | 3.34% of total revenue / 3.77% (ratio improved 0.43pp, computed — not separately called out as a numbered item in the FY2025 MD&A narrative, which only itemises selling/admin/finance ratios) | Tailwind — R&D $ fell 6.26% YoY (RMB10,095.9mn vs RMB10,769.9mn) while revenue grew 5.71% | [FY2025 Annual Report (SSE, CAS), p.28, Note 52; computed] | Low-Mid |
| D&A — production/COGS-embedded | 1.8% of appliance-segment cost of sales / 1.7% (ratio worsened; $ grew +12.66% YoY, more than 3x the +3.77% appliance-segment revenue growth) | **Headwind (narrow but real)** — linked to the Air Solutions segment's asset base near-doubling FY24→FY25 (RMB32,729mn→RMB57,700mn, +76%) from the CCR/Carrier commercial-refrigeration and Kwikot acquisitions [`business-model/03_segment-map.md`, segment table] | [FY2025 Annual Report (SSE, CAS), p.42] | Low (10bps of total revenue — see Section 7) |
| D&A — total company (CapIQ-derived, EBITDA-EBIT bridge) | 1.88% of total revenue / 2.14% (this measure IMPROVED — total D&A fell 7.3% YoY, RMB5,676.6mn vs RMB6,125.6mn) | Tailwind on this broader basis — **contradicts the narrower COGS-embedded D&A line above; both are shown because they answer different questions and use different bases** (production D&A only, vs all D&A including opex-embedded, per CapIQ's standard construct) | [CapIQ export, Financials.xls, computed from historical-financials §1 EBITDA/EBIT figures] | Flagged — basis conflict, not resolved from this pool |
| Interest / Finance expense | -0.02% of revenue (net gain) / +0.34% (net expense) — ratio improved 0.36pp | Tailwind, but **not structural** — driven by Euro (and other currency) appreciation increasing FX gains, not by lower borrowing costs; reversed to a 1.0% net-expense ratio in Q1 2026 (RMB appreciation causing FX losses instead) | [FY2025 Annual Report (SSE, CAS), p.24, item (4); Q1 2026 Report (HKEX), p.5, item 4] | Mid — swings with FX direction, not a repeatable cost saving |

---

## 3. Gross Margin → EBITDA Margin → EBIT Margin Walk

| Margin Level | FY2025 | FY2024 | Change bps | Main Reason | Evidence |
|---|---:|---:|---:|---|---|
| Gross margin (company-stated, total revenue basis) | 26.7% | 27.8% | **-110bps** | Q4 2025 copper/bulk-material cost rises plus intensifying China price competition (average selling price falling faster than the company's own cost-reduction program could offset); overseas, cost-program gains offset by high tariffs | [FY2025 Annual Report (SSE, CAS), p.24, item (1)] — full arithmetic bridge in Section 7 |
| EBITDA margin (CapIQ-derived) | 8.78% | 9.80% | **-102bps** | Roughly tracks the gross-margin decline; SG&A ratio improvements (selling -55bps) were largely offset by admin-ratio deterioration (+31bps), leaving net opex-line effects close to neutral at this level | [`01_historical-financials.md`, §1] |
| EBIT margin (CapIQ-derived) | 6.90% | 7.66% | **-76bps** | Smaller decline than EBITDA margin because CapIQ's total-D&A line (all D&A, not just COGS-embedded) fell as a % of revenue (2.14%→1.88%) — a basis different from the COGS-embedded D&A row in Section 2, which rose. **A full bps reconciliation between the company's own "Operating Profit" formula (Revenue − Cost of Revenue − Taxes/Surcharges − Selling/Admin/R&D + Impairments) and CapIQ's EBIT construct is not possible from this pool — the two use different D&A and impairment treatments, and this gap is not resolved here** | [`01_historical-financials.md`, §1; Q1 2026 Report (HKEX), p.3, footnote 1 (Operating Profit formula)] |

**Pass-through lag:** business-model `06_value-chain.md` states plainly that Haier has **no** disclosed escalator, indexed-pricing, or cost-plus clause with any customer — input-cost increases are managed financially (commodity hedging, "volume-price betting" with suppliers) and operationally (cost-reduction programs), not passed through via price [`business-model/06_value-chain.md`, §2]. The evidence this buffer is incomplete is direct and repeats across two consecutive periods: FY2025 gross margin fell 110bps because "Q4 copper and other bulk-material rises… offset" the cost-reduction gains [FY2025 Annual Report (SSE, CAS), p.24], and Q1 2026 gross margin fell a further 10bps for the same stated reason in overseas markets ("the positive impact from global supply-chain layout and extreme cost optimization was offset by high tariffs and rising bulk material prices") [Q1 2026 Report (HKEX), p.5]. There is no evidence of even a lagged pass-through mechanism — cost increases have been absorbed, not recovered, in both periods measured.

---

## 4. Margin Walk — Which Margin Level Matters Most?

**Gross margin is the most useful level to track Haier at, and it is also the only one with enough disclosure granularity to actually track.** The company discloses gross margin at product-segment level (5 categories + Other Business), at region level (China vs overseas), and — narratively — at the standalone-quarter level, all with the underlying revenue/cost drivers named [FY2025 Annual Report (SSE, CAS), p.42; Q1 2026 Report (HKEX), p.4]. EBITDA, by contrast, is **never disclosed by the company at any interim frequency** — it is a CapIQ-derived construct only available annually — and EBIT/operating-profit is disclosed only at the consolidated annual and (via a company-defined formula) standalone-quarter level, with no segment split. Because raw materials are 84% of the dominant cost line and gross margin is where 100% of the company's own MD&A commentary on margin drivers is concentrated (Section 3), gross margin is the primary tracked metric for this manufacturer — a capital-light services business would look to gross margin for a different reason (thin fixed-cost base); here it is because gross margin is where the disclosed evidence actually lives.

---

## 5. Margin Driver Table (consolidated)

| Driver | Impact on Margins | Direction | Magnitude | Evidence |
|---|---|---|---|---|
| Raw-material commodity costs (steel, aluminium, copper, plastics/foam) | Largest single cost line at 84% of appliance-segment cost of sales; grew 7.46% YoY, nearly double appliance-segment revenue growth (3.77%) | **Headwind** | **High** (see Section 7: -178bps of total revenue before mitigation) | [FY2025 Annual Report (SSE, CAS), p.42, p.58 item 3] |
| Company cost-reduction program ("极致成本战略") | Standardizes material codes, coordinates global procurement; the FY2025 "Other" cost-of-sales line fell -19.46% YoY, offsetting most (but not all) of the raw-material drag | **Tailwind** (partially offsetting) | High, but **not guaranteed to repeat** — magnitude of the offset is itself variable year to year and is a management lever, not a structural cost advantage | [Same table, p.42; MD&A p.23 "极致成本战略"] |
| China domestic price competition | Company's own MD&A directly names "intensifying domestic competition" as accelerating the industry-wide fall in average selling price, on top of rising input costs | **Headwind** | Mid-High — domestic (China) segment gross margin fell 103bps in FY2025 (28.81% vs 29.84% implied prior year) | [FY2025 Annual Report (SSE, CAS), p.24, item (1); computed region GM, Section 7] |
| US tariffs on China-linked appliance imports | Explicitly named as offsetting overseas cost-program gains in both FY2025 and Q1 2026; management expects the impact to "gradually ease in 2026" as supply-chain restructuring completes — **this is a forward-looking management claim, not yet observed** | **Headwind, uncertain duration** | Mid — not separately quantified in RMB or bps anywhere in the pool | [FY2025 Annual Report (SSE, CAS), p.24, p.5 (2026 outlook); Q1 2026 Report (HKEX), p.5] |
| Segment mix (shift toward "Other Business" channel-distribution/equipment segment) | Other Business grew revenue +19.93% YoY (fastest of all six product lines) but carries the thinnest margin (9.34%, vs 22–41% for the five appliance segments); its revenue share rose from 11.4% to 12.9% of the product-level base | **Headwind** | Mid (-33bps, Section 7) | Computed from [FY2025 Annual Report (SSE, CAS), p.42] |
| Geographic mix (shift toward overseas) | Overseas revenue grew 8.15% vs domestic 3.05%, and overseas gross margin (24.58%) sits below domestic (28.81%) — overseas revenue share rose from ~50.2% to 51.4% | **Headwind** | Mid — directionally consistent with, not additive to, the product-mix effect above (two cuts of the same total change) | Computed from [FY2025 Annual Report (SSE, CAS), p.42] |
| Premiumization (Casarte mix within brand portfolio) | Casarte's Refinement/Radiance premium series rose from 30% to 43% of Casarte's own retail sales in one year; the mass-market Haier-brand "bundle" package rose from 17% to 25% | Directionally a tailwind on blended ASP, but **the company's own gross margin still fell** — premium-mix gains were not enough to offset the price war | **Low-Mid** (real, but the company itself states it was not enough to move the headline number) | [Q1 2026 Report (HKEX), p.3; `business-model/06_value-chain.md`, §3] |
| SG&A leverage (selling expense ratio) | Selling expense ratio improved 55bps FY2025 (domestic warehouse/logistics efficiency, overseas retail-channel efficiency); improved a further 100bps in Q1 2026 | **Tailwind** | Mid (30–100bps range) | [FY2025 Annual Report (SSE, CAS), p.24, item (2); Q1 2026 Report (HKEX), p.5, item 1] |
| Admin expense ratio | Worsened 31bps FY2025 (Q4 one-off European restructuring costs, emerging-market org-building spend); worsened a further 80bps in Q1 2026 (company attributes this partly to the Q1 revenue decline itself, i.e., de-leveraging on lower volume, plus AI/HVAC/overseas platform investment) | **Headwind** | Mid | [FY2025 Annual Report (SSE, CAS), p.24, item (3); Q1 2026 Report (HKEX), p.5, item 2] |
| FX translation / hedging gains | Finance-expense ratio improved 36bps in FY2025 on Euro appreciation; this **reversed** to a 130bps deterioration in Q1 2026 on RMB appreciation | **Neutral-to-Unknown, direction-dependent** | Low-Mid — under 1.5% of net profit per the company's own disclosed ±5% FX sensitivity table [`business-model/10_external-dependency.md`, §2] | [FY2025 Annual Report (SSE, CAS), p.24, item (4); Q1 2026 Report (HKEX), p.5, item 4] |
| China trade-in subsidy fade / high base | Subsidy (15% of price, capped RMB1,500/unit) was a demand driver in 2024–2025 whose effect faded through H2 2025; management's own 2026 outlook flags a "high base" pressuring 2026 industry growth — this is a **volume/mix**, not a direct cost, driver, but it interacts with fixed-cost absorption (see Cycle Position, Section 8) | **Headwind for FY2026**, labelled non-run-rate for the FY2024/H1-2025 period it boosted | Mid-High at the group level (China ≈48% of revenue) | [`business-model/10_external-dependency.md`, §1 (Government policy row); FY2025 Annual Report (SSE, CAS), p.3, p.20-21] |

---

## 6. Margin Drivers By Segment

### Segment: Refrigerators/Freezers (27.9% of FY2025 revenue)

| Driver | Impact | Direction | Magnitude | Evidence |
|---|---|---|---|---|
| Raw-material cost inflation (shared group-level exposure) | Segment gross margin fell 62bps (30.15% vs 30.77% implied FY2024), the smallest decline of the five appliance segments | Headwind | Low-Mid | [FY2025 Annual Report (SSE, CAS), p.42] |
| China domestic replacement-demand resilience | China offline refrigerator market share 47.7% cushions volume even as the broader property/subsidy cycle softens | Tailwind (volume, not margin directly) | Mid | [`business-model/03_segment-map.md`, segment table] |
| Segment profit margin (post-SG&A) | 7.2% FY2025, up from 5.5% (FY2022) — the segment's operating-level margin has structurally improved even as gross margin compressed this year, implying opex leverage below the gross-margin line | Tailwind (multi-year) | Mid | [`business-model/03_segment-map.md`, segment table] |

### Segment: Kitchen Appliances (13.7% of FY2025 revenue)

| Driver | Impact | Direction | Magnitude | Evidence |
|---|---|---|---|---|
| Raw-material / input costs | Gross margin fell 77bps (28.57% vs 29.34% implied FY2024) | Headwind | Low-Mid | [FY2025 Annual Report (SSE, CAS), p.42] |
| Same domestic housing-linked demand pattern as refrigerators | Volume driver, real-estate-linked softness | Headwind (volume) | Mid | [`business-model/03_segment-map.md`, segment table] |

### Segment: Air Solutions (17.9% of FY2025 revenue)

| Driver | Impact | Direction | Magnitude | Evidence |
|---|---|---|---|---|
| Raw-material / input costs plus a price-war-exposed, fragmented China central-air-conditioning market | Gross margin fell 143bps (22.44% vs 23.87% implied FY2024) — the **largest single-segment margin decline** of the six product lines | Headwind | **High** | [FY2025 Annual Report (SSE, CAS), p.42] |
| China central-air-conditioning market contraction (-7.4% FY2025, attributed to the real-estate downturn hitting fitted-project shipments) | Volume/fixed-cost-absorption headwind on top of the margin decline | Headwind | High | [`business-model/03_segment-map.md`, segment table, citing FY2025 Annual Report (SSE, CAS), Business Review, p.19] |
| CCR/Carrier commercial-refrigeration and Kwikot acquisitions — segment assets nearly doubled FY24→FY25 (RMB32,729mn→RMB57,700mn, +76%) against only 9.55% segment revenue growth | Depreciation step-up embedded in this segment specifically (matches the group-level COGS-embedded D&A rise in Section 2); guidance (FY2026) is for CCR "high single-digit revenue growth, and further improvement in operating margin" — **qualitative, no bps figure, unverified against a segment-level consensus** | Headwind now (D&A), possible tailwind later (guided margin improvement) | Mid | [`business-model/03_segment-map.md`, segment table; `04_guidance-consensus.md`, §2] |

### Segment: Home Laundry Care Solutions (21.6% of FY2025 revenue)

| Driver | Impact | Direction | Magnitude | Evidence |
|---|---|---|---|---|
| Raw-material / input costs | Gross margin fell 47bps (30.90% vs 31.38% implied FY2024) — the **smallest decline** of the five core appliance segments | Headwind, but comparatively mild | Low | [FY2025 Annual Report (SSE, CAS), p.42] |
| China replacement-demand resilience (47.4% offline share) plus best-in-class segment profit margin (10.1%, up from 8.9% FY2022) | The segment with the strongest margin trend in the portfolio | Tailwind | Mid | [`business-model/03_segment-map.md`, segment table] |

### Segment: Household Water Solutions (5.9% of FY2025 revenue)

| Driver | Impact | Direction | Magnitude | Evidence |
|---|---|---|---|---|
| Raw-material / input costs, against the fastest revenue growth (+10.94%) of the five appliance segments | Gross margin fell 94bps (40.68% vs 41.62% implied FY2024) despite fast growth — margin compressed even as volume/mix (premiumization toward whole-house water systems) improved | Headwind | Mid | [FY2025 Annual Report (SSE, CAS), p.42] |
| Real-estate-linked demand pressure, company-stated as "notably pressured" ("明显承压") | Volume headwind on the industry as a whole | Headwind | Mid | [`business-model/03_segment-map.md`, segment table] |

### Segment: Other Business (13.0% of FY2025 revenue)

| Driver | Impact | Direction | Magnitude | Evidence |
|---|---|---|---|---|
| Fastest-growing segment (+19.93% revenue) but structurally thin-margin (9.34% gross margin, the only segment with margin BELOW 20%) | Its own margin improved 49bps YoY, but its outsized growth relative to the higher-margin appliance segments drags the **consolidated** blend down through mix (quantified in Section 7) | Mixed — tailwind at its own level, headwind at the consolidated level | Mid (mix effect, Section 7: -33bps at consolidated level) | [FY2025 Annual Report (SSE, CAS), p.42] |

---

## 7. Margin Bridge — Latest Period (FY2025 vs FY2024, Gross Margin)

**Basis note (must be read before the table):** the company's own headline figure is a **-110bps** decline in gross margin, 26.7% (FY2025) vs 27.8% (FY2024), on **total consolidated revenue** (RMB302,346.8mn) [FY2025 Annual Report (SSE, CAS), p.24, item (1)]. The bridge below is built from the company's own by-product cost-analysis table, which is disclosed on a narrower **"main business revenue"** base (RMB300,581.68mn FY2025 — the sum of the six named product/business lines, excluding a small non-core "other operating revenue" residual of ~RMB1.77bn) [FY2025 Annual Report (SSE, CAS), p.42]. Prior-year (FY2024) absolute revenue and cost figures for each product line are **back-calculated** from the company's own disclosed FY2025-vs-FY2024 YoY growth rates (given to two decimal places), which introduces small rounding error — this is labelled *Inference, not from filings* for the FY2024 absolute figures only (the FY2025 absolutes and all growth-rate percentages are directly filed).

| Component | Margin Impact (bps, of total revenue) | Derivation | Evidence |
|---|---:|---|---|
| Raw materials (appliance segments) | **-178.0** | Actual FY2025 raw-material cost RMB155,542.0mn vs a counterfactual RMB150,192.0mn (FY2024's RMB144,742.1mn grown at the appliance segments' own +3.77% revenue growth) = RMB5,350.0mn of "excess" cost growth ÷ FY2025 appliance revenue (RMB261,689.0mn) × appliance revenue's 87.06% weight in total revenue | [FY2025 Annual Report (SSE, CAS), p.42]; computed by this agent |
| Labor (appliance segments) | -12.2 | Same method: RMB12,218.9mn actual vs RMB11,852.5mn counterfactual = RMB366.4mn excess | [Same source]; computed |
| Depreciation, COGS-embedded (appliance segments) | -8.8 | RMB3,364.3mn actual vs RMB3,098.8mn counterfactual = RMB265.6mn excess (Air Solutions capacity build, Section 2) | [Same source]; computed |
| Energy (appliance segments) | -0.5 | RMB748.9mn actual vs RMB731.9mn counterfactual = RMB17.0mn excess | [Same source]; computed |
| Cost-reduction program / other cost items (appliance segments) | **+128.4** | RMB13,381.0mn actual vs RMB17,239.5mn counterfactual (this line fell in absolute terms, -19.46% YoY) = RMB3,858.5mn of cost AVOIDED relative to the revenue-scaled counterfactual | [Same source]; computed |
| *Appliance-segment subtotal (within-segment effect)* | *-71.1* | Sum of the five rows above; reconciles to the appliance-only gross margin change of -81.7bps × its 87.06% weight in total revenue | Computed, cross-checked two ways |
| Other Business segment's own margin change | +6.3 | Other Business gross margin improved 49bps (9.34% vs 8.85% implied FY2024) × its 12.94% weight in total revenue | [FY2025 Annual Report (SSE, CAS), p.42]; computed |
| Mix (product mix: shift toward lower-margin Other Business segment) | -32.7 | Other Business revenue share rose from 11.40% to 12.94% (+1.54pp) × the ~21pp gross-margin GAP between Other Business (8.85%) and the appliance blend (30.03%) it displaced, using FY2024 margins as the mix-effect weight (standard shift-share method) | Computed by this agent from [FY2025 Annual Report (SSE, CAS), p.42] |
| **Subtotal (product-segment basis, "main business revenue")** | **-97.5** | Sum of all rows above | Computed; **cross-checked exactly via shift-share decomposition (within-segment -64.9bps + mix -32.7bps = -97.5bps, matching a direct total-margin recomputation to 0.0bps)** |
| Residual (scope: "main business revenue" base vs total consolidated revenue; rounding in back-solved FY2024 absolutes from 2-decimal disclosed growth rates) | -12.5 | -110bps (company-stated, total-revenue basis) minus -97.5bps (this agent's product-segment-basis computation) | Quantified gap, not rounded away |
| **Total margin change (company-stated)** | **-110.0** | [FY2025 Annual Report (SSE, CAS), p.24, item (1)] | |

**What this bridge does NOT separate:** volume vs price within each product segment (no unit/ASP disclosure — `business-model/02_business-identity.md` §3a data-gap flag), and tariff-specific cost (tariffs are blended into the raw-material/other-cost lines by product, not separately geography-tagged in this table — the region-level cut below is the closest available proxy).

**Cross-check — region-level cut of the same total change (not additive to the table above, a second view of the identical underlying revenue base):** domestic (China) gross margin fell 103bps (28.81% vs implied 29.84% FY2024) on +3.05% revenue growth; overseas gross margin fell 82bps (24.58% vs implied 25.40% FY2024) on +8.15% revenue growth — the faster-growing overseas business also has the lower margin, reinforcing the mix-driven headwind identified in the product-segment cut, but computed independently, so it is presented as corroboration, not summed into the -110bps total a second time. [FY2025 Annual Report (SSE, CAS), p.42]; computed.

---

## 7a. Bridge Attribution and Residual

```
Raw materials (appliance segments): 7.46% actual cost growth vs 3.77% appliance-segment revenue growth
  = (155,542.0 − 144,742.1×1.0377) / 261,689.0 × (261,689.0/300,581.68)
  = 5,350.0mn excess cost ÷ 300,581.68mn total-revenue base = 178.0bps of the -110bps observed change
  → basis: FY2025 vs FY2024 by-product cost-analysis table, "main business revenue" base, CAS filing —
    same basis used throughout Section 7, no cross-basis application

Cost-reduction / other cost line (appliance segments): -19.46% actual cost change vs +3.77% revenue growth
  = (16,613.9×1.0377 − 13,381.0) / 300,581.68 = 128.4bps of OFFSET against the -110bps observed change
  → same basis as above

Mix (Other Business share +1.54pp × ~21pp margin gap to the appliance blend, at FY2024 margins)
  = 0.0154 × (8.85% − 30.03%) ≈ -32.7bps of the -110bps observed change
  → basis: shift-share decomposition using FY2024 margins as weights (standard method); refused to apply
    FY2025 margins to FY2024 weights, which would double-count the within-segment effect already
    captured in the rows above
```

Reconciliation: sum of components (-178.0 -12.2 -8.8 -0.5 +128.4 +6.3 -32.7 = **-97.5bps**) vs the company's stated Total (-110.0bps) = **97.5bps reconciled, 12.5bps residual** (11.4% of the total observed change). The residual is attributed to (a) the ~0.6% scope gap between "main business revenue" (the bridge's base) and total consolidated revenue (the company's headline base), and (b) compounding rounding from using 2-decimal disclosed growth rates to back-solve FY2024 absolute revenue/cost figures. This residual is small enough that it does not change which driver is largest (raw materials, by a wide margin), but it is reported here rather than folded into any other row.

---

## 8. The Single Biggest Margin Driver

**Raw-material commodity cost inflation** (steel, aluminium, copper, plastics/foam) is the single biggest driver if it moves adversely again. The bridge above shows it at **-178bps of total revenue before mitigation** — on its own, larger than the entire -110bps observed gross-margin decline. Its current direction is a headwind: the company's own MD&A attributes FY2025's margin compression specifically to "Q4 rises in copper and other bulk materials" [FY2025 Annual Report (SSE, CAS), p.24], and 84% of the appliance segments' cost of sales is now raw materials (up from 82%) — the highest weight in the disclosed history. **The adjective must match the number here:** raw material cost growth alone would have been the dominant story, but it was roughly 72% offset in FY2025 by the company's own cost-reduction program (+128bps) — an offset that is a management lever, not a structural cost advantage, and is not guaranteed to repeat at the same magnitude every year. If that program's effectiveness reverts even partway toward its FY2023/FY2024 pace while commodity prices keep rising at the FY2025 rate, the net raw-material drag (currently netting to roughly -50bps after mitigation, per the bridge above) could widen materially. This is consistent with, and reconfirms, business-model `10_external-dependency.md`'s own conclusion that commodity prices are "the single biggest lever" in Haier's external-dependency profile [`10_external-dependency.md`, §5].

---

## 9. Investment Spend — Both Signs

**Not triggered as a primary theme — capex is not running above its own history.** FY2025 capex (RMB8,851.6mn) sits below the FY2023 peak (RMB10,541.6mn) and below FY2024 (RMB10,080.1mn); the five-year capex trend (FY21 RMB7,372.4mn → FY22 RMB8,209.8mn → FY23 RMB10,541.6mn → FY24 RMB10,080.1mn → FY25 RMB8,851.6mn) is a decline off a FY2023 peak, not a wave running above history [`01_historical-financials.md`, §1]. Q1 2026 capex was RMB2.246bn, in line with a normal quarterly run rate [Q1 2026 Report (HKEX), p.5, §VI].

The one related item worth flagging briefly, because it sits inside the margin bridge above: the **Air Solutions segment's asset base nearly doubled** FY24→FY25 (RMB32,729mn→RMB57,700mn, +76%) against only 9.55% segment revenue growth — but this is **M&A-driven** (the CCR/Carrier commercial-refrigeration and Kwikot acquisitions closing in the period), not organic capex ahead of demand, so it does not fit the two-sided "capex as cost vs capex as demand signal" framework this section is built for. It shows up in Section 2/6/7 as a COGS-embedded depreciation headwind (-8.8bps of total revenue), and the one forward-looking demand-side counterpart is management's FY2026 guidance for CCR: "high single-digit revenue growth, and further improvement in operating margin" [`04_guidance-consensus.md`, §2] — qualitative, no bps figure, and not verifiable against a segment-level consensus in this pool. Per the self-check rule, both signs are stated: the cost side is measured and reconciled (Section 7); the demand side is a management claim, unverified.

---

## 10. Cycle Position (Cycle-Position Rule)

Haier sits **past its FY2024 margin and revenue-growth peak, mid-way through a decelerating phase, with a named one-time policy tailwind now fading.** Evidence:

- **Margin peak already passed.** EBITDA margin peaked at 9.80% in FY2024 and fell to 8.78% in FY2025 (-102bps); EBIT margin peaked at 7.66% in FY2024 and fell to 6.90% in FY2025 (-76bps) [`01_historical-financials.md`, §1]. Both margin lines inflect downward in the same year.
- **Revenue growth is decelerating, not accelerating.** +12.57% (FY2023, the strongest year) → +4.31% (FY2024) → +5.71% (FY2025) → +1.25% (CapIQ LTM-vs-LTM to Mar-2026) → an outright -6.86% YoY decline in the standalone Q1 2026 quarter [`01_historical-financials.md`, §6].
- **A named, one-time policy tailwind is fading, and management labels it so itself.** China's national appliance trade-in subsidy (15% of price, capped RMB1,500/unit) supported 2024/H1-2025 demand; the company's own FY2026 outlook states plainly that industry growth "is expected to face pressure" under "the high base" the subsidy years created [`business-model/10_external-dependency.md`, §1, Government Policy row]. This is labelled **non-run-rate** for the period it boosted (FY2024–H1 2025) — the FY2024 margin peak should not be read as Haier's normalized run-rate.
- **Q1 2026's specific weakness is a named, dated, one-time regional shock layered on the deceleration, not evidence the whole business inflected negative.** Management attributes the quarter's profit decline explicitly to North American blizzards (industry volume -10%) and a YoY tariff-cost increase, stating "excluding North America, operating profit grew over 10%" [Q1 2026 Report (HKEX), p.2] — a company claim, not independently verified or reconciled to a segment P&L in this report, but directly relevant: it should not be read as the base-rate run-rate for the rest of FY2026.
- **Reconciliation with `10_external-dependency.md`:** that module scores external dependency 52/100 (mixed exposure, material but not extreme) and separately flags commodities, government subsidy policy, tariffs/geopolitics, and consumer cycle as simultaneously "High" [`10_external-dependency.md`, §3–4]. This agent's read agrees — the cycle position described here (past-peak, decelerating, with a fading policy tailwind) is consistent with, not divergent from, that assessment.

---

## Data Sufficiency & Limitations Summary

- **No verbatim transcript or sell-side proxy exists** for any period after 2019 — all commentary above is MD&A/filing narrative, not call color. Per the module's partial-data rule, this caps earnings clarity module-wide (see `00_earnings-data-triage.md`).
- **No unit-volume or ASP disclosure by segment** — the bridge in Section 7 nets price and volume together inside each segment's "revenue growth" figure; it cannot separate a segment's margin move into a price effect vs a volume/utilization effect.
- **No quarterly EBITDA or full quarterly income statement** — the margin walk (Section 3) and driver tables are annual-frequency for anything below gross margin; only gross margin itself has any within-year granularity (narrative, not tabulated, for interior quarters).
- **The 12.5bps bridge residual (Section 7a) is real and disclosed, not rounded away** — it does not change the ranking of drivers but is a genuine gap between the product-segment-level cost-analysis table and the company's consolidated headline figure.

---

## Citations

[1] FY2025 Annual Report (A-share/CAS), "海尔智家股份有限公司2025年年度报告," filed 2026-03-26 — `Haier_Smart_Home_Co_Ltd_-_Form_Annual_Report(Mar-26-2026).pdf`, pp.22-24, 28, 42, 58
[2] Q1 2026 Report (H-share/IFRS presentation, CAS financials), filed 2026-04-27 — `Haier_Smart_Home_Co_Ltd_-_Form_Interim_Report(Apr-27-2026).pdf`, pp.2-5
[3] `analyses/HAIER_2026-08-13/earnings/01_historical-financials.md` (upstream baseline)
[4] `analyses/HAIER_2026-08-13/earnings/04_guidance-consensus.md` (CCR FY2026 guidance, cross-referenced)
[5] `analyses/HAIER_2026-08-13/business-model/02_business-identity.md` (sector overlay determination, §3a)
[6] `analyses/HAIER_2026-08-13/business-model/03_segment-map.md` (segment structure, disclosure quality)
[7] `analyses/HAIER_2026-08-13/business-model/06_value-chain.md` (pass-through, bargaining power)
[8] `analyses/HAIER_2026-08-13/business-model/10_external-dependency.md` (commodity/tariff/subsidy dependency, cycle-position cross-check)
[9] CapIQ export, "Haier Smart Home Co Ltd SHSE 600690 Financials.xls" — Income Statement/Key Stats tabs, data as of 2026-08-13 (EBITDA/EBIT margin series only, per historical-financials)
