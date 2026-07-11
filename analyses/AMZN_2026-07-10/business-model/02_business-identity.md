# Business Identity — AMZN

## 1. What The Company Actually Does

Amazon.com, Inc. is a US-based company (listed on NASDAQ, fiscal year ending December 31, reporting under US GAAP in USD) that runs three economically distinct businesses under one roof: a consumer marketplace, a third-party commerce infrastructure, and a cloud computing platform. On the consumer side, it sells goods directly to shoppers — from books and electronics to groceries — through its online store and physical stores (principally Whole Foods Market), and it holds customers in a paid membership called Amazon Prime that bundles fast shipping, streaming video, and music for an annual or monthly fee. Alongside its own product inventory, Amazon lets third-party merchants sell on its platform and charges them commissions, fulfillment fees, and shipping fees in exchange — this is the "marketplace" layer that sits on top of the retail infrastructure. The advertising business exploits the same shopper attention: sellers and vendors pay Amazon for sponsored ads and display placements to reach buyers who are already in a buying mindset. Separately, Amazon Web Services (AWS) rents computing infrastructure — servers, storage, databases, AI tools, and thousands of ancillary services — to businesses and governments on a pay-as-you-go basis; customers pay for what they use, with no long-term ownership of the hardware. Geography spans the United States (the largest market), Germany, the United Kingdom, Japan, and a growing rest-of-world footprint. [FY2025 10-K, filed Apr 9, 2026; FY2024 10-K, filed Feb 6, 2025]

## 2. How The Company Makes Money

Amazon reports five distinct revenue lines plus AWS. Each has a different economic formula:

**Online stores** (first-party product sales, recorded gross):
`Revenue = units sold × average selling price`
The company buys inventory, marks it up (or down), and sells direct. [Q1 2026 10-Q, Apr 30, 2026, footnote (1)] FY2025 full-year revenue from this line was implicitly the largest single item within North America and International segments. In Q1 2026, online stores generated $64.3 billion, up from $57.4 billion in Q1 2025. [Q1 2026 10-Q, Apr 30, 2026]

**Physical stores** (Whole Foods and Amazon Fresh):
`Revenue = store count × sales per store`
In Q1 2026, physical stores generated $5.8 billion, up from $5.5 billion in Q1 2025. [Q1 2026 10-Q, Apr 30, 2026]

**Third-party seller services** (marketplace commissions and fulfillment fees):
`Revenue = GMV × take rate + fulfillment fees per unit`
Amazon does not disclose GMV, so take rate cannot be computed directly. In Q1 2026, this line generated $41.6 billion, up from $36.5 billion in Q1 2025. Margins on this stream are structurally higher than first-party sales because Amazon bears no inventory risk. [Q1 2026 10-Q, Apr 30, 2026]

**Advertising services**:
`Revenue = impressions × price per impression (sponsored ads, display, video)`
Advertising is high-margin and entirely dependent on shopper traffic on the platform. In Q1 2026, advertising generated $17.2 billion, up from $13.9 billion in Q1 2025 — a 24% increase. [Q1 2026 10-Q, Apr 30, 2026]

**Subscription services** (Prime membership fees plus digital content subscriptions):
`Revenue = Prime subscribers × annual or monthly fee + add-on digital subscriptions`
In Q1 2026, subscription services generated $13.4 billion, up from $11.7 billion in Q1 2025. [Q1 2026 10-Q, Apr 30, 2026]

**AWS (Amazon Web Services)**:
`Revenue = compute + storage + database usage × per-unit price (pay-as-you-go)`
AWS is the profit engine. In Q1 2026, AWS generated $37.6 billion, up from $29.3 billion in Q1 2025 — 28% year-over-year growth. AWS annualized revenue run rate reached $150 billion as of Q1 2026. [Q1 2026 earnings call, Andy Jassy prepared remarks, Apr 29, 2026] AWS operating income for FY2025 was $45.6 billion on $128.7 billion of revenue, versus North America operating income of $29.6 billion on $426.3 billion and International operating income of $4.8 billion on $161.9 billion. [Capital IQ Segments export, FY2025 data, sourced from FY2025 10-K filed Feb 6, 2026]

What drives volume: on the retail side, Prime membership penetration, delivery speed, and breadth of selection. On AWS, enterprise cloud migration and AI workload adoption. What drives price: AWS unit prices have historically declined as Amazon passes efficiency gains to customers, but volume more than offsets this; retail average selling price is shaped by mix between categories. What drives margin: AWS operating margins (roughly 35% in FY2025) are structurally higher than retail (North America ~7%, International ~3%), so the mix shift toward AWS disproportionately lifts the consolidated operating margin — from 6.4% in FY2024 to 10.8%, and rising further. [FY2024 Annual Report (shareholder letter), Andy Jassy, Apr 2025]

## 3. Business Type Classification

Multi-sided platform and cloud infrastructure conglomerate: a consumer marketplace at scale (low-margin, high-volume) cross-subsidized by and increasingly overshadowed in profit terms by a dominant cloud compute business (high-margin, usage-based), with an embedded high-margin advertising network and subscription annuity layered on top.

## 3a. Sector Overlay & Required-KPI Checklist

The §3 classification does not map cleanly to a single row in `frameworks/SECTOR_OVERLAYS.md`. Amazon spans retail, SaaS/cloud, and advertising — each of which has its own overlay. The closest single overlay is **Retail / consumer** for the Stores business and the framework's generic **SaaS / subscription software** logic partially applies to AWS. Below, the most relevant required KPIs are assessed for each economic layer.

**AWS layer (closest match: SaaS / subscription software)**

| Required KPI | Present / Absent | Note |
|---|---|---|
| ARR / annualized run rate | **Present** | $150B annualized run rate as of Q1 2026 [Q1 2026 earnings call, Apr 29, 2026] |
| ARR growth rate | **Present** | 28% YoY in Q1 2026; 24% in Q4 2025 [Q1 2026 earnings call; Q4 2025 earnings call] |
| cRPO / RPO (committed backlog) | **Absent from pool** | AWS does not disclose cRPO/RPO in the 10-K or 10-Q; "revenue backlog" is not separately disclosed; customer commitments referenced qualitatively (e.g. OpenAI >$100B, Trainium $225B+) but not as an audited cRPO figure [FY2025 Annual Report; Q1 2026 earnings call] |
| Net retention / NRR | **Absent** | Not disclosed |
| Billings | **Absent** | Not disclosed |
| SBC as % of revenue | **Present** | SBC expense $19.5B in FY2025 on $716.9B revenue = 2.7%; $22.0B in FY2024. [Capital IQ Supplemental export, FY2025; Capital IQ Income Statement export, FY2025] |
| Rule-of-40 (AWS-level) | **Partial** | AWS growth ~28% + operating margin ~35% = ~63 (well above 40); operating margin is derivable from segment data [Capital IQ Segments export, FY2025] |

Data gap flagged: cRPO / RPO and net retention rate are absent. For AWS this limits the forward-demand read; qualitative management commentary partially substitutes but does not carry the same evidentiary weight. This gap is carried forward to the synthesis.

**Retail / Stores layer (Retail / consumer overlay)**

| Required KPI | Present / Absent | Note |
|---|---|---|
| Same-store sales growth (SSSG) | **Absent** | Amazon does not report SSSG for physical stores; Whole Foods SSSG is not separately disclosed |
| Sales per sq ft (physical stores) | **Absent** | Not disclosed |
| Gross margin (retail) | **Partial** | Consolidated gross margin available ($360.5B gross profit on $637.9B revenue in FY2024 = ~56.5%); segment-level gross margin not broken out [Capital IQ Income Statement export, FY2024] |
| Inventory turns | **Absent** | Not separately disclosed in the data pool extracts available |
| Online mix | **Present** | Q1 2026 online stores $64.3B vs physical $5.8B = ~92% online [Q1 2026 10-Q] |
| Third-party seller mix | **Present** | Third-party $41.6B vs online stores $64.3B in Q1 2026 [Q1 2026 10-Q] |

Data gaps flagged: SSSG for physical stores and sales per sq ft are absent. Inventory turns are absent. These are standard retail health metrics; their absence limits the physical-store read. These gaps are carried to the synthesis.

**Sector-specific red flags to monitor (per overlay):**
- SaaS/AWS: ARR growth deceleration while revenue holds (not currently evident — growth accelerating); SBC dilution masking profitability (SBC is 2.7% of revenue, moderate; GAAP vs non-GAAP gap should be tracked).
- Retail: negative SSSG while expanding physical store count (not assessable — SSSG absent); inventory bloat / markdown risk (not assessable — inventory turns absent).

**Valuation norm for downstream agents:**
- AWS layer: FCFF DCF on GAAP FCF (charge SBC); EV/NTM-revenue and reverse-DCF on implied growth rate.
- Retail + advertising + subscription layer: EV/EBITDA and FCFF DCF.
- Consolidated: sum-of-the-parts (SOTP) is the most defensible approach given the structural profitability divergence between AWS and the Stores segments.

## 4. What Drives Variance

When consolidated revenue moves, the primary driver in the near term is AWS volume growth (usage per existing customer plus new customer onboarding), since AWS grows ~28% on a $150B annualized base and contributes the majority of operating income. Retail revenue variance is driven mainly by order volume (shaped by Prime membership depth and delivery speed), with advertising growing proportionally to retail traffic — advertising grew 24% in Q1 2026 even as retail grew more modestly. Margin variance at the consolidated level is almost entirely a function of AWS mix: each incremental dollar of AWS revenue drops to operating income at roughly 35% versus the Stores segments at 5–7%, so any acceleration or deceleration in AWS growth produces an outsized swing in group operating income. FX is a meaningful secondary driver for the International segment (the 10-Q noted $2.9 billion favorable FX impact on Q1 2026 reported revenue versus the 15% constant-currency growth rate of 17% reported). [Q1 2026 earnings call, Apr 29, 2026; Q1 2026 10-Q, Apr 30, 2026]
