# Revenue Drivers — ORCL

All figures USD millions unless stated. Fiscal year ends May 31 (FY2026 = year ended May-31-2026). Reporting standard: US GAAP. Latest reported quarter: FQ4 FY2026 (Jun-10-2026 press release/call); next release FQ1 FY2027 due 2026-09-04 (not yet reported).

## 1. Segment Decomposition Status

Segment decomposition applied — business-model `03_segment-map.md` is available and used [`analyses/ORCL_2026-08-14/business-model/03_segment-map.md`]. Oracle reports three ASC 280 operating segments — Cloud and Software, Hardware, Services — but Cloud and Software alone is 86.9% of FY26 revenue ($58,530M of $67,357M) and 90.7% of FY26 segment profit [FY26 10-K, Note 13 (Segment Information), p.100], clearing the module's >85%-from-one-segment bar. So this report gives full driver tables for all three segments (Section 5) but treats Oracle as, in substance, a single-segment company for the purpose of naming "the" biggest driver (Section 7) — and within Cloud and Software itself, MD&A discloses a finer offering-level split (cloud applications / cloud infrastructure / software license / software support) that is the real locus of the story and is used throughout this report [FY26 10-K, Item 7 MD&A, "Revenues by Offerings," p.45].

## 2. Revenue Driver Tree

| Business Type | Revenue Formula |
|---|---|
| Multi-segment (SaaS-hybrid + hardware + services) | Sum of segment revenue drivers |

Oracle's own formula, stated per offering [`business-model/02_business-identity.md`, Section 2; FY26 10-K, Item 1 Business, p.1-4]:
- Cloud infrastructure (OCI/IaaS): revenue = compute & storage capacity delivered (GPUs, gigawatts) × usage/contracted rate.
- Cloud applications (SaaS): revenue = subscribing customers × modules/seats × subscription price, recognized ratably over 1–5-year contracts.
- Software license + support: revenue = new licenses sold up front + installed base × support renewal rate (~1-year contracts, priced as a % of the license fee).
- Hardware: units sold × price, plus hardware support priced as a % of the hardware fee.
- Services: consulting/customer-success hours or fixed-fee engagements billed.

Company-specific one-line formula: **Total revenue = (cloud infrastructure capacity × contracted rate) + (SaaS seats × subscription price) + (installed-base software renewals + new license sales) + hardware units × price + services hours billed** — of which cloud infrastructure is now the fastest-growing and most capital-intensive line, and is currently supply- (not demand-) constrained (Section 7).

## 3. Market / Share / Price / Mix Split

| Driver Bucket | Current Direction | Evidence | Importance /100 |
|---|---|---|---:|
| End-market demand | Improving, strongly — AI infrastructure and enterprise cloud migration demand is the dominant swing factor; total Remaining Performance Obligations (RPO, i.e. contracted-but-unrecognized revenue — a forward order book) rose from $138B to $638B, +363% YoY, "primarily attributable to certain significant cloud contracts" [FY26 10-K, Item 7 MD&A, p.55; Q4 FY26 transcript, CFO Maxson] | +$500bn RPO increase in one year, concentrated in named large AI-infrastructure customers (AMD, Meta, NVIDIA, OpenAI, TikTok, xAI and others) [Key Developments, 2026-02-02] | 90 |
| Company market share | Mixed by sub-market — gaining share off a small base in cloud infrastructure (Oracle ~3% of global cloud-infra spend vs AWS 28%/Azure 21%/Google Cloud 14%, but Oracle's 77% FY26 infra revenue growth and 363% RPO growth outpace AWS's 20–37% and approach Google Cloud's ~63%); likely losing relative share in cloud applications (Oracle SaaS +11% vs SAP cloud/backlog growth of 22–27%) [`business-model/08_competitive-map.md` §3-4, citing Web: Synergy Research Group, 2026 (unverified, dated)] | Third-party/web-sourced, dated and labelled unverified per source hierarchy — directional only | 55 |
| Price / realization | Not separately disclosed for cloud infrastructure (no unit price or ASP metric published); for software support, USD growth (+1%) roughly equals installed-base retention with flat-to-slightly-negative constant-currency pricing (-1% CC) [FY26 10-K, Item 7 MD&A, "Revenues by Offerings," p.45] | Software support $19,804M (+1% USD / -1% CC) vs $19,523M FY25 | 20 |
| Product / customer / geography mix | Improving toward cloud, deteriorating for legacy license — cloud (apps+infra) rose from 43% to 51% of total company revenue in one year; software license fell -9% (-10% CC) [FY26 10-K, Item 7 MD&A, p.38, p.45]. Geographically, the Americas contributed 88% of FY26 constant-currency revenue growth vs EMEA 5% and Asia Pacific 7% [`business-model/02_business-identity.md` §1, citing FY26 10-K Item 7, p.41 area] — a US-concentration mix shift, consistent with AI-datacenter siting | Cloud share of revenue 43%→51% YoY; Americas 88% of CC growth | 75 |
| FX translation | Small net tailwind — FY26 total revenue grew 17% USD vs 16% constant currency (CC), i.e. roughly +1pp of the +17.3% reported growth came from currency translation, not underlying activity [Q4 FY26 investor deck, slide 4, "FY 2026 Financial Highlights"] | 17% USD / 16% CD | 10 |
| M&A / divestitures | None disclosed as revenue-affecting in FY26 — the Cerner acquisition (closed June 2022) is fully lapped in the base period and no new consolidated acquisition or divestiture is disclosed in the FY26 10-K MD&A revenue discussion. (The $2.7bn Ampere Computing gain in FQ2 FY26 was a gain on sale of an equity investment, booked below the operating line — it is a non-operating item, not a revenue-line divestiture, per `01_historical-financials.md` §3 note) | [FY26 10-K, Item 7 MD&A revenue discussion; `01_historical-financials.md`] | 0 |

This confirms growth is overwhelmingly organic and demand-led (not FX- or M&A-driven): FX added only ~1pp of the +17.3% FY26 revenue growth, and there is no acquisition contribution to flag as inorganic. The growth is real activity — end-market demand and product mix shift toward cloud infrastructure — not currency or deal-driven, so it is fair to describe the current setup as organic demand growth, subject to the customer-concentration caveat in Section 7.

## 4. Revenue Driver Table (consolidated)

| Driver | Current Level | Direction | Magnitude | Evidence |
|---|---|---|---|---|
| Cloud infrastructure (OCI/IaaS) capacity & bookings | $18,101M FY26 revenue (+77% USD / +75% CC); Q4 FY26 alone +93% YoY to $5.8B | Improving | High | [FY26 10-K, Item 7 MD&A, "Revenues by Offerings," p.45; Q4 FY26 investor deck, slide 4] |
| Remaining Performance Obligations (RPO) / forward order book | $638B total RPO (+363% YoY); +$85B added in Q4 FY26 alone; 12% expected to convert to revenue in next 12 months (~$76.6B implied cRPO), 34% in months 13-36, 34% in months 37-60, remainder thereafter | Improving | High | [FY26 10-K, Item 7 MD&A, p.55; Note 1; Q4 FY26 transcript, CFO Maxson prepared remarks; Q4 FY26 investor deck, slide 8] |
| Data-center / GPU capacity (supply-side constraint) | +1.2GW incremental DC capacity added in FY26; 97.5% AI-infrastructure utilization; 98% of AI datacenter capacity already contracted | Improving, but the binding constraint on growth is now supply (power + GPU availability), not demand | High | [Q4 FY26 investor deck, slide 7; Q4 FY26 transcript, CEO Magouyrk prepared remarks] |
| Cloud applications (SaaS) | $15,888M FY26 revenue (+11% USD / +10% CC) | Stable-to-improving, but decelerating relative to cloud infrastructure and trailing SAP's cloud/backlog growth (22-27%) | Mid | [FY26 10-K, Item 7 MD&A, p.45; `business-model/08_competitive-map.md` §3] |
| Software license (on-premise, new sales) | $4,737M FY26 revenue (-9% USD / -10% CC) | Deteriorating | Low | [FY26 10-K, Item 7 MD&A, p.45] |
| Software support (installed-base renewals) | $19,804M FY26 revenue (+1% USD / -1% CC) | Stable (flat, FX-driven headline) | Mid | [FY26 10-K, Item 7 MD&A, p.45] |
| Customer/counterparty concentration within RPO | 4 customers contracted >$8B each in Q4 FY26 alone; named large counterparties include AMD, Meta, NVIDIA, OpenAI, TikTok, xAI [Q4 FY26 transcript, CEO Magouyrk; Key Developments, 2026-02-02] | Deteriorating as a risk factor even while adding revenue — a pullback by any one of these names could reverse a High-magnitude portion of forward revenue | High | [`business-model/10_external-dependency.md` §1, "Industrial cycle"] |
| Geographic mix (US vs international) | US revenue $32,075M→$39,835M FY25→FY26 (+24.2%) vs UK/Germany/Japan/Other Countries combined +9.0% blended [CIQ Financials_Annual.xls, Segments tab, Geographic Segments] | Improving (US), Stable (international) | Mid | [CIQ Financials_Annual.xls, Segments tab] |
| FX translation | +1pp of FY26's +17.3% reported revenue growth (17% USD vs 16% CC) | Stable/modest tailwind, direction not controlled by the company | Low | [Q4 FY26 investor deck, slide 4] |
| Hardware | $3,084M FY26 revenue (+5.0%), shrinking-to-flat multi-year base, cannibalized by OCI migration | Deteriorating (structurally, long-run) though FY26 ticked up | Low | [CIQ Financials_Annual.xls, Segments tab; FY26 10-K, Item 7 MD&A, "Hardware Business," p.40] |
| Services | $5,743M FY26 revenue (+9.7%), thinnest margin of the three segments, largely a follow-on of cloud/software/hardware sales | Stable | Low | [CIQ Financials_Annual.xls, Segments tab; FY26 10-K, Item 7 MD&A, "Services Business," p.41] |

Magnitude bands per this report's own scale: High >5% of total revenue impact from a reasonable move, Mid 2-5%, Low <2%.

## 5. Revenue Drivers By Segment

### Segment: Cloud and Software (86.9% of FY26 revenue, $58,530M)

| Driver | Current Level | Direction | Magnitude | Evidence |
|---|---|---|---|---|
| Cloud infrastructure (OCI) capacity delivered | +1.2GW added FY26; guided to add "close to 1GW next quarter" alone | Improving | High | [Q4 FY26 investor deck, slide 8-9] |
| Cloud infrastructure contracted rate / bookings mix | "Majority of Q4 RPO via Bring-Your-Own-Hardware or Pre-pay," contractual margins "maintaining and improving" per management | Improving (per management characterization; not independently verifiable from filings) | High | [Q4 FY26 investor deck, slide 7 — management's own characterization, not an audited figure] |
| SaaS seat/subscription growth | Cloud applications +11% USD / +10% CC | Stable | Mid | [FY26 10-K, Item 7 MD&A, p.45] |
| Software license new-sales volume | -9% USD / -10% CC, customers migrating to cloud | Deteriorating | Low | [FY26 10-K, Item 7 MD&A, p.45] |
| Software support renewal base | +1% USD / -1% CC | Stable | Mid | [FY26 10-K, Item 7 MD&A, p.45] |

### Segment: Hardware (4.6% of FY26 revenue, $3,084M)

| Driver | Current Level | Direction | Magnitude | Evidence |
|---|---|---|---|---|
| Engineered Systems / server / storage unit sales | $3,084M FY26 (+5.0% YoY), down from $4,152M in FY2017 on a 9-year view | Stable near-term, Deteriorating long-run | Low | [CIQ Financials_Annual.xls, Segments tab] |
| Cannibalization from OCI | 10-K names "customer demand for competing offerings, including cloud infrastructure offerings" as a direct risk | Deteriorating (structural headwind) | Low | [FY26 10-K, Item 7 MD&A, "Hardware Business," p.40] |

### Segment: Services (8.5% of FY26 revenue, $5,743M)

| Driver | Current Level | Direction | Magnitude | Evidence |
|---|---|---|---|---|
| Consulting/customer-success billings | $5,743M FY26 (+9.7% YoY) | Improving, but the 10-K itself frames this segment as a follow-on of the other three, not an independent growth engine | Low | [CIQ Financials_Annual.xls, Segments tab; FY26 10-K, Item 7 MD&A, "Services Business," p.41] |
| Customer IT discretionary spend | 10-K names "personnel reductions in our customers' IT departments" and "tighter controls over customer discretionary spending" as revenue drivers | Mixed/uncertain | Low | [FY26 10-K, Item 7 MD&A, "Services Business," p.41] |

## 6. Revenue Growth Decomposition

FY26 vs FY25 total revenue growth: $67,357M − $57,399M = $9,958M, or +17.3% [`01_historical-financials.md` §1; CIQ Financials_Annual.xls, Segments tab]. Oracle does not disclose a separate volume × price split for any offering (no unit price/ASP metric for cloud infrastructure, no seat count for SaaS, no unit count for hardware) — the decomposition below therefore uses the product-line ("mix") breakdown that IS fully disclosed, with FX shown separately at the total-company level. This is a data limitation stated explicitly, per Section 6a below.

| Component | Contribution to Growth (pp) | Evidence |
|---|---:|---|
| Volume (units/capacity) | Not separately disclosed. Best available proxy: +1.2GW incremental data-center capacity added FY26, 98% of AI datacenter capacity already contracted — consistent with capacity-gated (volume-led), not price-led, growth in the largest-growing line. Inference, not from filings. | [Q4 FY26 investor deck, slide 7] |
| Price | Not separately disclosed for cloud infrastructure or SaaS. Software support's roughly flat CC growth (-1%) implies renewal pricing is close to flat on the legacy book. Inference, not from filings. | [FY26 10-K, Item 7 MD&A, p.45] |
| Mix (product-line shift, dollar-actual basis) | Cloud infrastructure +13.71pp; Cloud applications +2.82pp; Software support +0.49pp; Software license -0.81pp; Hardware +0.26pp; Services +0.89pp | See Section 6a for the derivation of each figure |
| FX | ~+1pp | 17% USD vs 16% CC total revenue growth [Q4 FY26 investor deck, slide 4] |
| Acquisitions / divestitures | 0pp — none disclosed as revenue-affecting in FY26 | [FY26 10-K, Item 7 MD&A revenue discussion] |
| Other / residual | ~0pp (see reconciliation, Section 6a) | — |
| **Total revenue growth** | **+17.3pp (actual reported)** | [`01_historical-financials.md` §1] |

## 6a. Decomposition Attribution and Residual (MODULE_RULES "Driver Attribution" / §15)

```
Cloud infrastructure: ($18,101M − $10,234M) / $57,399M (FY25 revenue base)
  = $7,867M / $57,399M = 13.71pp of the 17.3pp observed total-company growth
  → Basis: FY25 total-company revenue as the denominator (dollar-actual, not constant-currency).
    Matches the Total row's own basis (Section 6 uses reported/actual dollars throughout). No mismatch.

Cloud applications: ($15,888M − $14,272M) / $57,399M
  = $1,616M / $57,399M = 2.82pp

Software support: ($19,804M − $19,523M) / $57,399M
  = $281M / $57,399M = 0.49pp

Software license: ($4,737M − $5,201M) / $57,399M
  = −$464M / $57,399M = −0.81pp

Hardware: ($3,084M − $2,936M) / $57,399M
  = $148M / $57,399M = 0.26pp

Services: ($5,743M − $5,233M) / $57,399M
  = $510M / $57,399M = 0.89pp
```

Sum of the six product-line/segment components: 13.71 + 2.82 + 0.49 − 0.81 + 0.26 + 0.89 = **17.36pp**, against the stated Total revenue growth of **17.35pp** (exact = $9,958M/$57,399M = 17.348%). **Reconciled to within 0.02pp (rounding only) — residual is effectively zero.** This is expected and not a coincidence: unlike a volume × price sensitivity applied across a basis it wasn't measured on, this decomposition sums Oracle's own disclosed FY26-vs-FY25 offering-level dollar figures, which by construction add up to the disclosed total. The genuine gap in this decomposition is NOT the arithmetic (it reconciles exactly) — it is that the components are product-line dollars, not true volume/price factors. Oracle discloses no compute-unit count, no per-unit contracted rate, and no SaaS seat count that would let this report split "cloud infrastructure +13.71pp" further into "more capacity delivered" vs "higher price per unit of capacity." That split is Not proven from available data; the capacity evidence in the Volume row above (98% of DC capacity contracted, +1.2GW added) supports a capacity-led (not price-led) read but does not quantify it. FX (+1pp) is measured at the total-company level (17% USD vs 16% CC) and is not double-counted against the dollar-actual product-line figures above, because those product-line dollar deltas are themselves USD-actual (i.e., FX-inclusive) — the +1pp FX figure sits alongside the product-line breakdown as a separate lens on the SAME $9,958M of growth, not an additive component on top of it. Reader note: do not sum the Mix components (17.36pp) and the FX row (+1pp) together — that would double count, since the disclosed FY26/FY25 dollar deltas used for Mix already embed FX.

## 7. The Single Biggest Revenue Driver

**Cloud infrastructure (OCI/IaaS) capacity conversion from the RPO backlog** is the single biggest driver of Oracle's next 3-12 months of revenue. The arithmetic in Section 6a supports this without qualification: cloud infrastructure alone cleared 13.71pp of the 17.35pp FY26 total revenue growth — 79% of the observed increase, comfortably above the "roughly half" bar this report requires before naming a single biggest driver, and the decomposition reconciles with essentially zero residual. A 10-20% swing in how fast the $638B RPO backlog converts to revenue — up if data-center capacity comes online faster than the 98%-contracted, 97.5%-utilized current state implies, down if any of the concentrated large AI-infrastructure counterparties (four customers contracted >$8B each in Q4 FY26 alone; named names include AMD, Meta, NVIDIA, OpenAI, TikTok, xAI) pulls back — would move total revenue by roughly the same order of magnitude, given cloud infrastructure is now $18.1B of $67.4B total revenue and growing at 77%. The current direction is Improving and supply-constrained (not demand-constrained): management states 98% of AI datacenter capacity is already contracted and GPU/AI-infrastructure utilization sits at 97.5% [Q4 FY26 investor deck, slide 7], meaning the near-term ceiling on this driver is how fast Oracle can build (power, GPUs, data-center shells), not whether customers want more. This is explicitly a non-run-rate read: FY26's 77% cloud-infrastructure growth and 363% RPO growth are the early-to-mid phase of a discrete AI-infrastructure buildout cycle, well above Oracle's own 5-year historical revenue CAGR (~10-12%, per `01_historical-financials.md` §1), and management's own long-term outlook (31% revenue CAGR FY25-FY30, per Q4 FY26 investor deck slide 15) implies deceleration from FY26's pace over the guided window, not a continuation of it. Per the module's Cycle-Position Rule, the reader should treat FY26's growth rate as a peak-of-cycle-adjacent input into any forward model, not a steady-state baseline, and should weight the customer-concentration risk (Section 4) as the primary way this driver could reverse.

