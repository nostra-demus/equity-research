# Business Identity — ORCL

## 1. What The Company Actually Does

Oracle sells the computing and software that other organizations run their operations on. It has three businesses: cloud and software (87% of FY2026 revenue), hardware (5%), and services (8%) [FY26 10-K, Item 7 Business Overview, p.40-41]. The cloud and software business is itself two things bolted together — cloud infrastructure (Oracle Cloud Infrastructure, or OCI, which rents out computing power, storage and networking, increasingly to train and run AI models) and cloud/on-premise applications (finance, HR, supply-chain and customer-management software, sold as Oracle Fusion, NetSuite, and industry-specific suites) [FY26 10-K, Item 1 Business, p.1-4]. Customers are businesses of all sizes, government agencies, and educational institutions, bought either directly through Oracle's sales force or through partner resellers [FY26 10-K, Item 1 Business, p.2]. Geographically the business is concentrated in the Americas, which contributed 88% of Oracle's constant-currency revenue growth in FY2026, with EMEA and Asia Pacific contributing 5% and 7% respectively [FY26 10-K, Item 7, p.41 area]. The problem customers pay Oracle to solve is running mission-critical databases and business applications reliably, and — increasingly — getting the raw computing capacity (GPUs and data-center space) needed to train and deploy AI models without building that infrastructure themselves [FY26 10-K, Item 1 Business, p.1; Q4 FY26 earnings call, CEO Clay Magouyrk prepared remarks].

## 2. How The Company Makes Money

Oracle runs several distinct revenue formulas under one roof:

- **Cloud infrastructure (OCI / IaaS):** `Revenue = compute & storage capacity delivered (GPUs, gigawatts) × usage or contracted rate`. FY2026 Cloud Infrastructure revenue was $18.1 billion, up 77% [Q4FY26 Earnings Press Release, p.1].
- **Cloud applications (SaaS):** `Revenue = subscribing customers × modules/seats × subscription price`, recognized ratably over one-to-five-year contracts. FY2026 Cloud Applications revenue was $15.9 billion, up 11% [Q4FY26 Earnings Press Release, p.1].
- **On-premise software license + support:** `Revenue = new licenses sold (recognized up front) + installed base × support renewal rate (~one-year contracts, priced as a % of the license fee)`. FY2026 software revenue (license + support combined) was $24.5 billion, down 1% as customers migrate to cloud [Q4FY26 Earnings Press Release, p.1; FY26 10-K, Item 1 Business, p.2].
- **Hardware:** `Revenue = units of Engineered Systems/servers/storage sold × price, plus hardware support priced as a % of the hardware fee`. FY2026 hardware revenue was $3.1 billion, up 5% [Q4FY26 Earnings Press Release, p.1].
- **Services:** `Revenue = consulting/customer-success hours or fixed-fee engagements billed`, generally lower-margin than the other businesses. FY2026 services revenue was $5.7 billion, up 10% [Q4FY26 Earnings Press Release, p.1].

Total FY2026 revenue was $67.4 billion, up 17% [Q4FY26 Earnings Press Release, p.1]. Volume is now driven overwhelmingly by AI infrastructure demand: Oracle's Remaining Performance Obligations (RPO — contracted, not-yet-recognized revenue, a forward order book) jumped from $138 billion to $638 billion year over year, up 363%, mostly from large AI infrastructure contracts where customers prepaid or supplied their own GPUs [FY26 10-K, Note 1 / p.22532 area; Q4FY26 Earnings Press Release, p.2]. Price is set by long-term contracted rates on cloud infrastructure and by list pricing/discounting on software; margin is driven by the mix shift toward lower-gross-margin, capital-intensive infrastructure revenue (management flagged a ~5-point full-year gross-margin step-down in FY2026 from data-center ramp-up) [Q4 FY26 earnings call, CFO Hilary Maxson prepared remarks] and by the multi-year lag between building data-center capacity and that capacity earning its full contracted revenue.

## 3. Business Type Classification

Enterprise software and database incumbent pivoting into a capital-intensive AI cloud-infrastructure (IaaS) supplier, funded by a record forward order book.

## 3a. Sector Overlay & Required-KPI Checklist

Business type maps closest to the **SaaS / subscription software** row in `frameworks/SECTOR_OVERLAYS.md`, recognizing that Oracle is a hybrid (cloud subscription + legacy perpetual license + hardware + services) rather than a pure-play SaaS company — the required KPIs are checked against the data pool as follows:

| Required KPI | Status | Evidence |
|---|---|---|
| Total RPO | Present | $638 billion at May 31, 2026, up from $138 billion [FY26 10-K, Note 1; Q4FY26 Earnings Press Release, p.2] |
| cRPO (current/next-12-month RPO) | Present (approximated) | Management stated 12% of RPO is expected to be recognized in the next 12 months (~$76.6bn implied) and 34% in months 13-36 [Q4 FY26 earnings call, CFO prepared remarks] — not a GAAP-defined cRPO line item, so treat as management-disclosed approximation |
| Net retention (NRR) / gross retention | **Absent** | Not disclosed in the 10-K, press release, or earnings call in this pool; Oracle does not publish a subscription net-retention metric |
| Billings | **Absent** | Not disclosed as a discrete line; must be inferred from revenue + change in deferred revenue, which is a calculation for a downstream agent, not a reported figure |
| ARR & growth | Partial | Cloud revenue ($34.0bn, +39%) is reported and RPO gives forward visibility, but no explicit annual-recurring-revenue figure is disclosed [Q4FY26 Earnings Press Release, p.1] |
| Subscription vs. services/license mix | Present | Cloud $34.0bn / Software $24.5bn / Services $5.7bn / Hardware $3.1bn of $67.4bn total [Q4FY26 Earnings Press Release, p.1] |
| Stock-based comp as % of revenue (GAAP vs. non-GAAP gap) | Present | SBC is broken out by segment and expense line in the 10-K notes; GAAP vs. non-GAAP EPS reconciliation shown ($5.83 GAAP vs. $7.63 non-GAAP FY2026 EPS) [FY26 10-K, Notes to Financial Statements, Stock-Based Compensation; Q4FY26 Earnings Press Release, p.1] |
| Rule-of-40 (growth + margin) | Calculable | Revenue growth 17% + non-GAAP operating margin ~43% ($28.9bn/$67.4bn) comfortably clears 40, though this blends a high-margin software base with a currently lower-margin, capital-heavy infrastructure build-out [Q4FY26 Earnings Press Release, p.1] |

**Data gap flagged:** net retention and discrete billings are absent from this pool and are not standard Oracle disclosures — downstream earnings/valuation agents should treat cloud revenue growth and RPO growth as the best available substitutes, not as equivalents, and should not assume a retention rate without a disclosed figure.

**Sector red flags to watch (per the SaaS overlay):** SBC dilution masked by non-GAAP profitability — Oracle's non-GAAP EPS ($7.63) is 31% above GAAP EPS ($5.83), so the gap is real and must be shown, not netted away [Q4FY26 Earnings Press Release, p.1]; RPO/bookings quality — a large share of the FY2026 RPO increase is prepaid or customer-supplied-hardware AI contracts ($75 billion of the $638 billion RPO), which is a different risk profile from software-subscription bookings and should not be read as pure recurring-software backlog [Q4FY26 Earnings Press Release, p.2].

**Valuation norm:** FCFF DCF on GAAP free cash flow (charging SBC) and EV/NTM-revenue or EV/RPO against growth, per the SaaS overlay — but note Oracle's FY2026 free cash flow was **negative $23.7 billion** on $32.0 billion of operating cash flow against roughly $48 billion of net capex outlay, driven by the AI data-center build [Q4FY26 Earnings Press Release, p.2; Q4 FY26 earnings call, CFO prepared remarks], so a standard FCFF read must reconcile this capex-driven cash burn rather than average it into a steady-state multiple.

## 4. What Drives Variance

The single biggest driver of revenue and margin swings right now is the pace and mix of AI infrastructure (OCI) build-out: cloud infrastructure revenue grew 77% for the year and 93% in Q4 alone, while gross margin stepped down about 5 points because new data-center capacity is expensed as it comes online but only earns its full contracted revenue over time [Q4FY26 Earnings Press Release, p.1; Q4 FY26 earnings call, CFO prepared remarks]. Volume is set less by organic customer growth than by the timing of a small number of very large AI infrastructure contracts (management cited four customers contracting for more than $8 billion each in a single quarter) [Q4 FY26 earnings call, CEO Clay Magouyrk prepared remarks], which makes quarter-to-quarter results lumpy. Price/margin in the legacy software business is comparatively stable (support renewal rates, software license pricing), so mix — how fast infrastructure grows relative to the higher-margin software base — is the key swing factor for consolidated margins, alongside foreign-currency movement (constant-currency growth ran about 1 point below reported-currency growth in FY2026) [Q4FY26 Earnings Press Release, p.1 area].
