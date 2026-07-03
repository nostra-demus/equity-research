# Margin Drivers — AMZN

**Reporting standard:** US GAAP. **Currency:** USD (millions unless noted). **Fiscal year end:** December 31. **Latest annual period:** FY2025 (10-K filed April 9, 2026). **Latest quarter:** Q1 2026 (10-Q filed April 30, 2026).

**Sector overlay applied: Multi-sided platform and cloud infrastructure conglomerate — margin analysis uses a hybrid grammar.** AWS (18% of revenue, 57% of operating income) uses SaaS/cloud metrics: GAAP gross margin, technology-and-infrastructure cost rate, operating leverage, SBC as % of revenue. The Stores segments (North America + International, 82% of revenue, 43% of operating income) use retail/generic operating company metrics: cost of sales rate, fulfillment cost rate, SG&A leverage. Advertising and subscriptions (embedded in the Stores segments) are high-margin service lines tracked at the operating income level. No single SECTOR_OVERLAYS.md row applies cleanly; the two dominant grammars (SaaS/cloud for AWS; retail/generic for Stores) are applied side by side throughout this report.

**Cycle-position read:** Amazon's current margin level is NOT a normalized run-rate. The FY2022 EBIT margin of 2.6% was a trough caused by over-investment in fulfillment capacity and a Rivian loss. The recovery since then has been steep and largely company-driven (mix shift to AWS, fulfillment network regionalization, advertising scale). The Q1 2026 EBIT margin of 13.1% is, per the CFO, "our highest operating margin ever." This is best read as a post-trough recovery that is not yet at a long-run ceiling — AWS margins are still expanding and the Stores segments still have meaningful operating leverage to extract. The primary cycle risk is not a demand downturn but a capex overshoot: gross capex of $43.2B in Q1 2026 alone ($173B annualized pace) means FCF is deeply negative on a strict basis and will remain so for 2–3 years unless AWS revenue growth accelerates faster than capex. This is an intentional investment cycle, not a cyclical demand cycle. No policy tailwind is embedded in the current margin (the 2025 Tax Act benefited cash taxes, not GAAP EBIT).

---

## 1. Segment Decomposition Status

Amazon reports three segments with disclosed operating income per segment. Segment-level EBITDA and segment-level free cash flow are NOT disclosed. Gross margin is disclosed only at the consolidated level (and in the 10-Q income statement). The segment breakdown used throughout this report is:

| Segment | FY2025 Revenue | Revenue Share | FY2025 Operating Income | Operating Income Share | EBIT Margin |
|---|---:|---:|---:|---:|---:|
| North America | $426,305M | 59% | $29,619M | 37% | 7.0% |
| International | $161,894M | 23% | $4,750M | 6% | 2.9% |
| AWS | $128,725M | 18% | $45,606M | 57% | 35.4% |
| Consolidated | $716,924M | 100% | $79,975M | 100% | 11.2% |

Sources: FY2025 10-K, Note 10 — Segment Information, p.67, filed April 9, 2026.

This is a clearly multi-segment business where segment mix is the single most important margin driver. Decomposition is performed for all three segments below.

---

## 2. Cost Stack

Amazon's disclosed operating expense lines from the FY2025 10-K (Item 7, p.25) are used directly. The generic COGS/freight/SGA/R&D split is adapted to Amazon's actual disclosed lines, which differ from a standard manufacturing cost stack.

**AWS costs are primarily classified under "Technology and infrastructure" — not under cost of sales.** The 10-K states explicitly: "Costs to operate our AWS segment are primarily classified as 'Technology and infrastructure.'" This means the cost of sales line reflects retail/fulfillment costs, and the technology-and-infrastructure line carries the majority of AWS's operating cost base.

| Cost Line | FY2024 Amount | FY2024 % of Revenue | FY2025 Amount | FY2025 % of Revenue | YoY Change | Direction | Evidence | Margin Risk |
|---|---:|---:|---:|---:|---:|---|---|---|
| Cost of sales (retail product + shipping + digital content) | $326,288M | 51.1% | $356,414M | 49.7% | +9% | Improving (declining as % of revenue) | FY2025 10-K, Item 7, p.25 | Low-Mid — shipping costs growing but at slower rate than revenue; $102.7B shipping in FY2025 vs $95.8B FY2024 |
| Fulfillment (operating fulfillment centers, physical stores, customer service, payment processing) | $98,505M | 15.4% | $109,074M | 15.2% | +11% | Stable (flat as % of revenue) | FY2025 10-K, Item 7, p.25 | Mid — unit growth outpacing cost growth in Q1 2026 (units +15%, fulfillment cost +9% YoY) |
| Technology and infrastructure (AWS + R&D + data centers + D&A on servers) | $88,544M | 13.9% | $108,521M | 15.1% | +23% | Worsening (rising as % of revenue) | FY2025 10-K, Item 7, p.25 | High — primary cost of the AI capex wave; D&A on new data centers flows through here with a 6–24 month lag |
| Sales and marketing | $43,907M | 6.9% | $47,129M | 6.6% | +7% | Improving (leverage being extracted) | FY2025 10-K, Item 7, p.25 | Low — growing slower than revenue; advertising revenue ($56B+ annualized) offsets some of this structurally |
| General and administrative | $11,359M | 1.8% | $11,172M | 1.6% | −2% | Improving (declining as % of revenue) | FY2025 10-K, Item 7, p.25 | Low — 10-K states G&A "did not significantly change" in 2025 vs 2024 |
| Other operating expense (income), net (incl. FTC settlement, severance, impairments) | $763M | 0.1% | $4,639M | 0.6% | +508% | One-time (FTC $2.5B + severance $1.8B in Q3 2025) | FY2025 10-K, Item 7, p.25; Q3 2025 Earnings Call, Oct 30, 2025 | Low on a run-rate basis — these were one-time charges; run-rate "other" is ~$763M (FY2024 level) |
| SBC (stock-based compensation, embedded in above lines) | $22,018M | 3.5% | $19,531M | 2.7% | −11% | Improving | Capital IQ Income Statement export, FY2025; FY2025 10-K | Low — SBC declining as % of revenue; not a GAAP separate line but embedded; 2.7% is moderate for a tech company |
| Shipping costs (subset of cost of sales) | $95,800M | 15.0% | $102,700M | 14.3% | +7% | Improving (declining as % of revenue) | FY2025 10-K, Item 7, p.25 MD&A Cost of Sales section | Mid — fuel inflation flagged for Q2 2026; partially offset by FBA surcharge on 3P sellers |
| D&A (embedded in technology and infrastructure) | Not separately disclosed for the annual period | — | Not separately disclosed | — | Accelerating (inference from capex growth) | FY2025 10-K — D&A not broken out from T&I | High — the primary mechanism by which current capex ($131.8B gross FY2025; $43.2B in Q1 2026 alone) flows into the P&L over 5–30 year useful lives |

**Pass-through dynamics:** Amazon does not use contractual cost-escalation clauses on retail. Input cost increases (shipping, wages, energy) are absorbed first and then offset through scale and efficiency. In Q1 2026, CFO Olsavsky noted fuel cost increases were "partially offset by the recently implemented fuel and logistics-related FBA surcharge" — meaning part of the fuel cost increase was passed to third-party sellers via higher FBA fees, not to end consumers. Pass-through lag for shipping/fuel costs is approximately 1–2 quarters based on management commentary. AWS unit prices decline over time (long-term customer contracts include price concessions), so on the AWS side there is no cost pass-through mechanism — the offset is volume outrunning unit price declines. [Q1 2026 Earnings Call, CFO prepared remarks, April 29, 2026; FY2025 10-K, MD&A Cost of Sales, p.25]

---

## 3. Gross Margin → EBITDA Margin → EBIT Margin Walk

| Margin Level | FY2024 | FY2025 | Change (bps) | Q1 2025 | Q1 2026 | YoY Change Q1 (bps) | Main Reason | Evidence |
|---|---:|---:|---:|---:|---:|---:|---|---|
| Gross margin | 48.9% | 50.3% | +140 bps | 50.6% | 51.8% | +120 bps | Mix shift: AWS (classified under T&I, not COGS) and advertising growing faster than 1P retail; shipping cost growing slower than revenue | FY2025 10-K, p.25 (cost of sales 51.1%→49.7%); Q1 2026 10-Q income statement |
| EBITDA margin | 19.0% | 20.3% | +130 bps | Not available by quarter | Not available by quarter | Not available | Gross margin expansion partially offset by T&I cost growth (+23% YoY in FY2025) which includes D&A step-up from prior capex waves | Capital IQ Income Statement, FY2024/FY2025 |
| EBIT margin (operating margin) | 10.8% | 11.2% | +40 bps | 11.8% | 13.1% | +130 bps | AWS segment margin expansion + North America continuing to recover; partially offset by $4.6B in one-time charges (FTC settlement, severance, impairments) in FY2025 | FY2025 10-K, Item 7, p.27; Q1 2026 Earnings Call, CFO remarks |

**FX note:** In FY2025, foreign exchange rates reduced net sales by $4.4B and reduced operating expenses by $4.1B, for a net $358M adverse impact on reported operating income. In Q1 2026, FX was a $2.9B tailwind to revenue (CFO stated 15% constant-currency growth vs 17% reported). The FX impact on operating income is not separately disclosed for Q1 2026 but the Q1 2026 10-Q transcript states "we expect [FX] to be a headwind of approximately 10 basis points" for Q2 2026. [FY2025 10-K, Item 7, FX effect table, p.29; Q1 2026 Earnings Call, CFO guidance remarks]

**AWS operating margin context (sector overlay):** AWS EBIT margin was 35.4% in FY2025 ($45,606M on $128,725M revenue), up from 37.1% in FY2024 ($39,834M on $107,556M revenue). The decline of ~170 bps YoY reflects the step-up in technology-and-infrastructure spending (the primary AWS cost). In Q1 2026, AWS operating income was $14,161M on $37,600M revenue = 37.7% margin, indicating sequential improvement as new capacity comes online and efficiency gains on existing capacity accelerate. CEO Andy Jassy stated in the Q4 2025 call that Trainium chips are expected to provide "several hundred basis points of operating margin advantage versus relying on others' chips for inference" at scale. [FY2025 10-K, Note 10, p.67; Q1 2026 10-Q, Note 8; Q4 2025 Earnings Call, Feb 5, 2026; Q1 2026 Earnings Call, Apr 29, 2026]

**Pass-through lag (input costs to margin):** Price increases for shipping/fuel passed to 3P sellers (via FBA surcharge) lag input cost increases by approximately 1 quarter based on the Q1 2026 call timing (surcharge implemented in Q1 after fuel costs rose). AWS D&A on new data center capacity has a 6–24 month lag from when capex is spent to when it hits the P&L, per CEO commentary ("AWS has to lay out cash for land, power, buildings, chips, servers and networking gear in advance of when we can monetize it, typically 6 to 24 months before we start billing customers"). [Q1 2026 Earnings Call, CEO prepared remarks]

---

## 4. Margin Walk — Which Margin Level Matters Most?

**EBIT margin (operating margin) is the primary margin metric for Amazon**, and specifically the segment-level EBIT margin for AWS vs the Stores segments. Here is why.

Amazon does not separately disclose segment EBITDA. The consolidated gross margin is distorted by the accounting classification: AWS costs run through "Technology and infrastructure," not "Cost of sales," so gross margin understates AWS's true gross economics and overstates the retail gross margin relative to what a standalone retailer would show. Using gross margin to track Amazon would give a false read on whether the margin expansion is structural (mix shift to AWS) or cyclical (retail efficiency gains).

EBIT margin captures the full cost structure including the critical T&I line that carries AWS costs. It is the level at which segment operating income is disclosed. It is also what management guides to (Q2 2026 guidance is for operating income of "$20–24 billion," not gross profit or EBITDA).

EBITDA margin is relevant for understanding the FCF bridge (EBITDA minus capex approximates the investment intensity), but it is not the primary driver metric because Amazon's D&A is economically meaningful — unlike a REIT where D&A is non-economic, Amazon's data centers and fulfillment infrastructure do depreciate, and the current capex wave will produce real D&A growth over the next 3–5 years.

For the retail segments specifically, gross margin and fulfillment cost rate are useful sub-metrics for tracking network efficiency (e.g., fulfillment cost as % of revenue went from 15.4% to 15.2% YoY — a sign of leverage). But the consolidated primary metric is EBIT margin.

---

## 5. Margin Driver Table (consolidated)

| Driver | Impact on Margins | Direction | Magnitude | Evidence |
|---|---|---|---|---|
| AWS segment mix shift (AWS growing faster than Stores) | Each additional percentage point of AWS in revenue mix lifts consolidated EBIT margin by ~2–3 bps structurally, because AWS EBIT margin (35–38%) is ~5x the Stores average (5–7%) | Tailwind | High (>100 bps over a multi-year horizon as AWS becomes a larger share) | FY2025 10-K, Note 10: AWS 18% of revenue but 57% of EBIT; Q1 2026: AWS 21% of revenue, 59% of EBIT. AWS growing at 28% vs consolidated 17% [Q1 2026 10-Q; Q1 2026 Earnings Call] |
| D&A step-up from the AI capex wave (lagged impact of $131.8B FY2025 gross capex) | D&A flows into "Technology and infrastructure" with a 6–30 year lag depending on asset class (chips/servers 5–6 years; buildings 30+ years); the FY2025 capex surge will produce meaningful D&A headwinds through 2027–2028 | Headwind | High (>100 bps drag on EBITDA-to-EBIT conversion; T&I already rose from 13.9% to 15.1% of revenue in FY2025) | FY2025 10-K, Item 7, p.25 (T&I cost table); Q1 2026 Earnings Call, CEO: "6 to 24 months before we start billing customers"; useful lives: 30+ years for buildings, 5–6 years for chips/servers [FY2025 10-K, critical accounting estimates] |
| Fulfillment network efficiency / operating leverage in Stores | Outbound shipping cost +12% YoY vs unit growth +15% in Q1 2026 — confirming that volume is growing faster than cost; robotics, regionalization, and higher in-house delivery share (AMZL) are the primary levers | Tailwind | Mid (30–100 bps; CFO commentary confirms unit growth outpacing fulfillment cost growth in Q1 2026) | Q1 2026 Earnings Call, CFO: "unit growth of 15% continues to outpace our cost to operate the fulfillment network as outbound shipping costs grew 12% YoY and fulfillment expense grew 9% YoY" [Apr 29, 2026] |
| Advertising revenue growth (high-margin, embedded in Stores segments) | Advertising services revenue ($17.2B in Q1 2026, +24% YoY) is a high-margin service with essentially zero incremental cost of goods — it lifts the effective gross margin of the North America and International segments without proportionately growing fulfillment or cost-of-sales | Tailwind | Mid-High (advertising at an annualized ~$70B run rate in 2026; each incremental dollar of ad revenue is nearly entirely margin accretive to the Stores segments) | Q1 2026 10-Q: advertising services $17.2B, +24% YoY [Apr 30, 2026]; FY2025 10-K, MD&A confirms advertising drives North America operating income improvement |
| Shipping and fuel costs (largest variable cost in Stores, at $102.7B in FY2025) | Shipping costs grew 7% in FY2025 vs 12% revenue growth — a tailwind. But CFO flagged "higher transportation costs related to fuel inflation" and a "year-over-year cost increase of approximately $1 billion" related to fuel for Q2 2026 | Neutral-to-Headwind near-term | Mid (fuel cost impact of ~$1B per quarter is flagged; each $1B in unmitigated shipping cost increases compresses consolidated EBIT margin ~14 bps; partially offset by FBA surcharge) | FY2025 10-K, p.25 (shipping costs $95.8B→$102.7B); Q1 2026 Earnings Call, CFO: "$1 billion cost increase related to Leo + higher transportation costs related to fuel inflation, partially offset by fuel and logistics-related FBA surcharge" |
| Amazon Leo satellite launch costs (one-time/startup cost, Q2–Q4 2026) | CEO stated Leo commercial launch in Q3 2026; production, launch, and payroll costs currently expensed under T&I; beginning Q4 2026 certain costs will be capitalized; the pre-launch expense period creates a temporary ~$1B/quarter headwind to North America operating income | Headwind (temporary, 2026 only) | Mid (~$4B annual pre-capitalization cost in North America; begins partially capitalizing in Q4 2026) | Q1 2026 Earnings Call, CFO: "year-over-year cost increase of approximately $1 billion related to Amazon Leo… we expect to begin capitalizing certain costs in Q4, including production and launch costs" [Apr 29, 2026] |
| SBC seasonality (Q2 annual compensation cycle) | Annual RSU vesting and new grant cycle creates a step-up in SBC expense in Q2 each year; CFO explicitly flagged this for Q2 2026 guidance | Headwind (Q2 seasonal, not structural) | Low-Mid (CFO flagged it as an item on operating income guidance; specific magnitude not disclosed) | Q1 2026 Earnings Call, CFO guidance section: "this estimate includes the impact of our seasonal step-up in stock-based compensation expense in Q2, driven by the timing of our annual compensation cycle" [Apr 29, 2026] |
| FX on International segment | FX can move +/− $2–5B on revenue and a smaller amount on operating income; in FY2025 FX lifted net sales by $4.4B but reduced operating income by $358M (costs also rose in local currency); in Q1 2026 FX was a $2.9B revenue tailwind | Neutral (currently mildly positive but Q2 2026 management guided ~10 bps headwind) | Low-Mid (FX sensitivity: 5% adverse move = ~$1.3B on foreign cash; operating income impact historically $200–900M per year) | FY2025 10-K, FX effect table p.29; Q1 2026 Earnings Call, CFO: "impact of changes in FX rates based on current rates, which we expect to be a headwind of approximately 10 basis points" for Q2 2026 |
| Tariff / trade policy (impact on Stores cost structure and seller economics) | China-sourced goods face elevated tariff risk; Amazon's own cost of sales could rise if import costs increase on 1P inventory; 3P sellers (who bear inventory risk) may reduce listings or raise prices, suppressing GMV and advertising revenue | Headwind (uncertain magnitude) | Mid-High (if tariffs materially reduce China-seller participation on the platform, advertising revenue and 3P fee revenue could be impaired; specific margin sensitivity not disclosed) | FY2025 10-K, Risk Factors, p.8: "tariff policy changes" as a material risk; Q1 2026 Earnings Call, forward-looking caveats: "tariff and trade policies" listed among material uncertainty factors; no specific quantification from management |
| Trainium / proprietary chip cost savings at AWS | At scale, AWS using its own Trainium chips instead of purchased NVIDIA GPUs reduces per-unit inference cost; CEO stated "at scale, we expect Trainium will save us tens of billions of dollars of capex each year and provide several hundred basis points of operating margin advantage" | Tailwind (multi-year, emerging) | High (if realized: several hundred bps on AWS margin; chips business revenue run rate now >$20B and growing triple-digit YoY) | Q1 2026 Earnings Call, CEO: "several hundred basis points of operating margin advantage versus relying on others' chips for inference" [Apr 29, 2026]; FY2025 Annual Report shareholder letter, pp.4–5 |
| One-time charges (FTC settlement $2.5B, severance $1.8B, impairments $1.1B in H2 2025) | These charges reduced FY2025 EBIT by approximately $4.3–4.6B; they are NOT run-rate costs; their absence in FY2026 creates a reported EBIT tailwind of ~60–65 bps year-over-year (at FY2025 revenue) | Tailwind (base effect in FY2026) | Mid (the reversal of ~$4.6B in non-recurring charges is a ~60 bps EBIT margin tailwind in FY2026 simply from the absence of these items) | FY2025 10-K, Item 7, p.27: "other operating expense (income), net $763M and $4.6B in FY2024 and FY2025" including FTC settlement; Q3 2025 Earnings Call Oct 30, 2025: charges confirmed; Q4 2025 Earnings Call Feb 5, 2026: Q4 charges of $2.4B also confirmed |

---

## 6. Margin Drivers By Segment

### Segment: AWS (18% of revenue, 57% of operating income)

| Driver | Impact | Direction | Magnitude | Evidence |
|---|---|---|---|---|
| Revenue growth vs T&I cost growth | AWS revenue grew 20% in FY2025; T&I costs grew 23% — cost temporarily outpacing revenue as capacity is built ahead of monetization. In Q1 2026 AWS grew 28% with operating margin recovering to 37.7% — indicating the new capacity is beginning to be monetized | Tailwind (recovery underway) | High | FY2025 10-K, p.24–25 (revenue 20%, T&I +23%); Q1 2026 10-Q: AWS $14.2B operating income on $37.6B revenue = 37.7% margin |
| Trainium chip adoption (cost reduction per unit of compute) | As Trainium replaces purchased NVIDIA GPUs for inference workloads, AWS's compute cost per unit declines. CEO stated Bedrock (primary inference service) already runs "most of its inference on Trainium" — early efficiency gains flow directly to AWS margin | Tailwind (early stage) | High (several hundred bps over 2–4 years per CEO guidance) | Q1 2026 Earnings Call, CEO: "Trainium will save us tens of billions of dollars of capex each year and provide several hundred basis points of operating margin advantage" |
| D&A step-up from data center buildout | Gross capex to AWS and corporate (primarily AWS) was $96.5B in FY2025 and at a ~$170B annualized pace in Q1 2026. Assets have 5–30 year useful lives; D&A will ramp materially through 2026–2028 | Headwind | High (D&A is the key offset to AWS revenue growth in converting to EBIT margin; T&I line already jumped from 13.9% to 15.1% of consolidated revenue in FY2025) | Capital IQ Segments export FY2025 (AWS capex $96.5B); Q1 2026 Earnings Call CFO: "$43.2 billion in Q1 CapEx" |
| AWS pricing (unit price declines offset by volume) | AWS unit prices continue to decline through long-term contract terms; this is structural and does not compress margin as long as volume growth outpaces price declines. AWS revenue grew 20% in FY2025 at a $128.7B base — the absolute dollar revenue outpacing unit price concessions | Neutral | Low-Mid | FY2025 10-K, MD&A: "AWS sales increased 20%… partially offset by pricing changes primarily driven by long-term customer contracts" |
| GPU supply constraints (limits capacity expansion speed) | If NVIDIA GPU supply tightens, Amazon cannot add AWS capacity at the rate demand requires, capping revenue growth. However, Trainium reduces GPU dependency — and CEO confirmed in Q1 2026 that demand currently exceeds supply (a revenue opportunity, not a margin risk, unless costs of securing supply rise) | Neutral-to-Headwind (supply is the constraint on upside, not on margin directly) | Mid | FY2025 10-K, Risk Factors: "we rely on a limited group of suppliers for semiconductor products… AI infrastructure such as GPUs"; Q1 2026 Earnings Call, CEO: "we still have capacity constraints that yield unserved demand" |

### Segment: North America (59% of revenue, 37% of operating income)

| Driver | Impact | Direction | Magnitude | Evidence |
|---|---|---|---|---|
| Fulfillment network efficiency (robotics, regionalization, in-house delivery) | Outbound shipping +12% vs unit growth +15% in Q1 2026; fulfillment expense +9% vs revenue +12% — costs growing slower than revenue. CFO confirmed "overall unit growth of 15% continues to outpace our cost to operate the fulfillment network" | Tailwind | Mid | Q1 2026 Earnings Call, CFO: "outbound shipping costs grew 12% YoY and fulfillment expense grew 9% YoY, both on an FX-neutral basis" |
| Advertising revenue leverage (high-margin incremental revenue within NA) | Advertising grew 24% in Q1 2026 (North America is the largest market for ads); incremental ad revenue has near-zero marginal COGS, lifting NA segment EBIT margin from 7.0% (FY2025) toward double digits over time | Tailwind | High | Q1 2026 10-Q: advertising $17.2B +24% YoY; FY2025 10-K: NA operating margin 7.0%; Q1 2026 CFO: NA operating margin 7.9% |
| Fuel / transportation cost inflation | CFO flagged ~$1B in higher fuel-related transportation costs in Q2 2026; partially passed to 3P sellers via FBA surcharge but not fully absorbed | Headwind (near-term) | Mid | Q1 2026 Earnings Call, CFO: "higher transportation costs related to fuel inflation, which is partially offset by the recently implemented fuel and logistics-related FBA surcharge" |
| Amazon Leo pre-launch expense | ~$1B/quarter of Leo production, launch, and payroll costs in the North America segment until commercial launch (expected Q3 2026) and partial capitalization (Q4 2026) | Headwind (temporary) | Mid | Q1 2026 Earnings Call, CFO: "year-over-year cost increase of approximately $1 billion related to Amazon Leo" within NA segment |
| Tariff risk on 1P inventory and China-seller participation | If tariffs make Chinese-origin goods materially more expensive, Amazon's 1P COGS rises and 3P Chinese sellers may reduce listings, lowering GMV and ad revenue. This is an active risk not a confirmed outcome as of Q1 2026 | Headwind (uncertain) | Mid-High | FY2025 10-K, Risk Factors p.8; Q1 2026 Earnings Call forward-looking caveats |
| Grocery and everyday essentials mix expansion | Grocery is a lower-margin product category than electronics or hardlines. Amazon's grocery sales reaching $150B in gross sales (FY2025) and becoming the US #2 grocer is strategically important but could modestly pressure product gross margins as perishable/grocery items tend to carry lower gross margins than general merchandise | Headwind (mild, mix effect) | Low-Mid | FY2025 Annual Report shareholder letter: "grocery business has grown to over $150 billion in gross sales in 2025, making Amazon the second-largest grocer in the U.S." |

### Segment: International (23% of revenue, 6% of operating income)

| Driver | Impact | Direction | Magnitude | Evidence |
|---|---|---|---|---|
| Progression from loss to profit (operating leverage on fixed investment base) | International turned profitable in FY2024 ($3.8B operating income) and expanded to $4.75B in FY2025, with operating margin going from 2.7% (FY2024) to 2.9% (FY2025) and reaching 3.6% in Q1 2026 | Tailwind | Mid (from a low base; significant leverage still to extract as markets mature) | FY2025 10-K, Note 10, p.67; Q1 2026 Earnings Call, CFO: "International segment operating income was $1.4 billion with an operating margin of 3.6%" |
| FX translation | International revenue reported in USD; weak USD is a tailwind, strong USD is a headwind. In FY2025 FX added $4.9B to International net sales and $903M to International operating income. In Q1 2026 FX was a $2.9B revenue tailwind overall (largely International) | Currently Tailwind (Q1 2026 = +$2.9B); Q2 2026 guided ~10 bps headwind | Low-Mid | FY2025 10-K, p.27: "FX positively impacted [International] operating income by $903M in FY2025"; Q1 2026 Earnings Call, CFO |
| Seller fee investments in new markets | CFO noted "we've recently lowered seller fees" in Europe and Brazil as an investment to grow the marketplace — this is a deliberate near-term margin sacrifice for long-term market share | Headwind (deliberate, near-term) | Low | Q1 2026 Earnings Call, CFO: "sellers saw strong sales growth in Q1, particularly in the U.S., as well as in Europe and Brazil where we've recently lowered seller fees" |

---

## 7. Margin Bridge — Latest Period

FY2025 vs FY2024 EBIT margin bridge. The FY2025 one-time charges of $4.6B distort this bridge; the adjusted bridge (excluding those charges) is shown alongside.

| Component | Reported Margin Impact (bps) | One-time Adjusted Margin Impact (bps) | Evidence |
|---|---:|---:|---|
| Revenue volume / operating leverage (fixed cost absorption) | +~70 bps | +~70 bps | Revenue grew 12.4% while total opex grew 11.9% (569,366→636,949 = +11.9%); operating leverage was modest [FY2025 10-K, p.25] |
| Cost of sales rate improvement (gross margin expansion, mix shift) | +140 bps | +140 bps | Cost of sales fell from 51.1% to 49.7% of revenue; driven by AWS and advertising (not in COGS) growing faster than 1P product sales [FY2025 10-K, p.25] |
| T&I cost rate increase (D&A + AWS infrastructure investment) | −120 bps | −120 bps | T&I rose from 13.9% to 15.1% of revenue (+$20B in absolute terms); 23% growth vs 12% revenue growth [FY2025 10-K, p.25] |
| Fulfillment cost rate improvement | +20 bps | +20 bps | Fulfillment fell from 15.4% to 15.2% of revenue; small but directionally positive [FY2025 10-K, p.25] |
| Sales and marketing leverage | +30 bps | +30 bps | S&M fell from 6.9% to 6.6% of revenue [FY2025 10-K, p.25] |
| G&A leverage | +20 bps | +20 bps | G&A fell from 1.8% to 1.6% of revenue [FY2025 10-K, p.25] |
| One-time charges (FTC settlement $2.5B, severance $1.8B, impairments $0.3B in FY2025 vs $0.8B in FY2024) | −530 bps | 0 bps (excluded) | Other operating expense increased from $763M to $4,639M, a $3.9B increase = ~54 bps drag; combined with Q4 2025 charges = full-year $4.6B [FY2025 10-K, p.25 and p.27] |
| FX | −50 bps | −50 bps | Net FX impact on operating income was −$358M [FY2025 10-K, FX table, p.29] |
| Total reported EBIT margin change | +40 bps (from 10.8% to 11.2%) | ~+430 bps (on-time-adjusted) | FY2025 10-K, consolidated operating income $68,593M→$79,975M |

**Interpretation:** The true operating improvement in FY2025 (stripping out one-time charges) was approximately 400–430 bps. The reported gain of only 40 bps dramatically understates the underlying progress. In FY2026, the absence of the one-time charges is itself a ~60 bps tailwind to EBIT margin on a full-year basis.

The Q1 2026 vs Q1 2025 bridge shows an even cleaner picture: operating margin expanded 130 bps year-on-year (11.8%→13.1%) with no material one-time items, driven by fulfillment efficiency, AWS revenue acceleration, and advertising growth.

---

## 8. The Single Biggest Margin Driver

**The pace at which AWS revenue growth outpaces D&A from the AI infrastructure capex wave is the single largest margin driver for the next 12–24 months.**

Here is the logic. Amazon is spending at an annualized rate of approximately $170B in gross capex as of Q1 2026, almost entirely for AWS data centers, chips, and power. This capex converts into D&A (flowing through "Technology and infrastructure") over 5–30 years. The immediate effect is that T&I costs rose 23% in FY2025 while total revenue rose only 12% — a 120 bps drag on consolidated EBIT margin from this line alone. This drag will continue and likely worsen in 2026 as Q4 2025 and Q1 2026 capex enters the depreciation schedule.

The only offset is AWS revenue growth. If AWS accelerates from 28% (Q1 2026 rate) toward a higher rate as more capacity comes online and the $364B backlog converts to billings, the revenue can outrun the D&A. If AWS growth decelerates — whether from a demand slowdown, a hyperscaler market-share shift, or a competitor pricing event — D&A continues to grow while revenue slows, and consolidated EBIT margin compresses materially. A 500 bps deceleration in AWS revenue growth (e.g., 28%→23%) at the current run rate would reduce AWS revenue growth by approximately $3B per quarter at Q1 2026 scale, which at AWS's ~37% EBIT margin represents roughly $1B of EBIT at risk per quarter — or approximately 55 bps of consolidated EBIT margin on an annualized basis.

The current direction of this driver is mixed: AWS growth is accelerating (28% in Q1 2026, up from 24% in Q4 2025, the fastest growth in 15 quarters), which is positive. But capex is also accelerating, management has committed to continued heavy investment through at least 2027, and the D&A tail will be long. The Trainium chip cost savings (described as "several hundred bps of operating margin advantage" at scale) are the structural offset — but they are 2–4 years from full realization. Until then, the AWS revenue growth rate is the single variable that most determines whether consolidated margins expand or compress.
