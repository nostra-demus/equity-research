# Business Identity — AMZN

## 1. What The Company Actually Does

Amazon.com, Inc. is a US-listed company (Nasdaq: AMZN, incorporated in Delaware, reporting under US GAAP) that operates across three reportable segments: North America retail, International retail, and Amazon Web Services (AWS). In its retail segments, it sells physical goods to consumers both directly (first-party, where Amazon holds inventory) and through a marketplace (third-party, where independent sellers list and often fulfill their own orders), with third-party units representing 61% of worldwide paid units in Q4 2025. It also charges those third-party sellers for fulfillment, storage, shipping services, advertising, and a range of other tools, meaning the marketplace is simultaneously a sales channel and a fee-generating services platform. Prime membership, priced at a flat annual or monthly fee, bundles fast shipping, video streaming, music, and other benefits — it is the primary mechanism for locking in repeat purchasing behavior, and Prime members spend materially more than non-members. AWS sells on-demand cloud computing — compute instances, storage, databases, analytics, machine learning infrastructure, and AI services — to companies of every size, governments, and start-ups around the world. Advertising, sold against Amazon's own retail properties and increasingly across streaming via Prime Video, is the fourth material revenue pool, generating $17.2 billion in Q1 2026 alone (+22% year-over-year). [FY2025 Annual Report (CEO Letter), Apr-09-2026; FY2024 10-K, Item 1 Business, p.3; Q1 2026 Earnings Call transcript, prepared remarks, Apr 29, 2026]

## 2. How The Company Makes Money

Amazon has four distinct revenue formulas operating simultaneously:

**1. Retail — first-party (1P) product sales**
`Revenue = units sold × average selling price`
Amazon buys inventory, marks it up, and sells directly to consumers. Margin is driven by purchasing scale, category mix, and fulfillment cost per unit. [FY2024 10-K, Item 1, p.3]

**2. Third-party (3P) seller services**
`Revenue = GMV flowing through marketplace × take rate (referral fee % + fulfillment fee + advertising + other services)`
Amazon is not the seller of record here; it earns fees. In Q4 2025, third-party units were 61% of worldwide paid units. Take rates vary by category. The key driver is gross merchandise volume (GMV) through the marketplace — volume is driven by selection breadth, delivery speed, and Prime member traffic. [Q4 2025 Earnings Call, CFO prepared remarks, Feb 05, 2026]

**3. AWS (cloud and AI infrastructure)**
`Revenue = compute/storage/AI service consumption × price per unit consumed`
Customers pay as they consume — there are no upfront license fees. Revenue is driven by the number of workloads migrated to the cloud, the size of those workloads, and the incremental AI services layered on top. AWS reached a $150 billion annualized revenue run rate in Q1 2026 (+28% year-over-year), with the AI services revenue run rate alone exceeding $15 billion. [Q1 2026 Earnings Call, CEO and CFO prepared remarks, Apr 29, 2026]

**4. Advertising**
`Revenue = ad impressions / clicks × price per impression/click`
Amazon sells sponsored product listings and display/video ads against its massive retail shopping intent signal and, increasingly, Prime Video viewership (315 million average monthly ad-supported viewers globally in Q4 2025). Advertising generated $17.2B in Q1 2026. [Q4 2025 Earnings Call, CFO prepared remarks, Feb 05, 2026; Q1 2026 Earnings Call, CEO prepared remarks, Apr 29, 2026]

**What drives volume, price, and margin:** Volume in retail is driven by Prime membership conversion and delivery speed (same-day/next-day capability is cited repeatedly as the primary factor lifting order completion rates). Price in retail is managed to be low — Amazon has been the lowest-priced online US retailer for eight consecutive years (Profitero data cited in FY2024 Annual Report). Margin is driven overwhelmingly by the mix shift toward higher-margin revenue lines: AWS had approximately $37.6B in quarterly revenue at high operating margins, while the retail segments, particularly International, run much thinner. In Q1 2026, the consolidated operating margin reached 13.1% — management characterized this as the highest ever — compared to 10.8% for full-year 2025. The structural margin expansion story is AWS growing faster than retail and advertising growing faster than both. [FY2025 Annual Report (CEO Letter), Apr-09-2026; Q1 2026 Earnings Call, CFO prepared remarks, Apr 29, 2026]

## 3. Business Type Classification

"Multi-engine platform conglomerate: asset-heavy retail and logistics operator cross-subsidized by a high-margin cloud infrastructure business, with an embedded high-growth advertising network monetizing captive consumer attention."

## 3a. Sector Overlay & Required-KPI Checklist

Amazon does not fit cleanly into any single row in `SECTOR_OVERLAYS.md`. It spans retail, a cloud/SaaS-adjacent infrastructure business (AWS), and a digital advertising platform. The closest partial matches are **Retail** and a **Generic operating company** for the consolidated entity; AWS specifically shares characteristics with cloud/infrastructure subscription software. The analysis below applies each relevant overlay to the segment it governs.

**Retail overlay (North America and International segments)**

| Required KPI | Present / Absent in data pool |
|---|---|
| Same-store sales growth (SSSG) | Absent — not disclosed by Amazon in the standard retail format; proxy is "units grew 15% YoY" (Q1 2026) and "worldwide paid units grew 12% YoY" (Q4 2025) |
| Sales per sq ft | Absent — not disclosed |
| Gross margin | Present — directionally: overall consolidated gross margin can be inferred from segment operating income; not broken out by retail segment explicitly in the pool |
| Inventory turns | Absent — not in pool |
| Store count and unit economics (Whole Foods) | Partially present — 550 WFM stores noted; individual store unit economics not in pool |
| Online mix | Present — third-party unit mix 61% (Q4 2025); online-vs-physical split implicit in segment structure |

Sector red flags for retail: SSSG negative while store count grows — not triggered (units growing). Inventory bloat/markdown risk — cannot assess without inventory turns. Margin given to traffic — partially visible; operating margin improving.

**SaaS / cloud infrastructure overlay (AWS segment)**

AWS is consumption-based, not a seat-based SaaS model. It shares some SaaS characteristics but differs on the billing model. The SaaS overlay KPIs are applied directionally:

| Required KPI | Present / Absent in data pool |
|---|---|
| ARR & growth | Present — $150B annualized run rate, +28% YoY (Q1 2026) |
| Billings / backlog (equivalent: committed revenue) | Partially present — "$225B in revenue commitments for Trainium" noted (Q1 2026 call); full RPO/cRPO not in pool |
| Net retention / expansion rate | Absent — not disclosed |
| SBC as % of revenue (GAAP vs non-GAAP gap) | Absent from pool — SBC disclosed in consolidated filings but AWS-specific SBC not broken out |
| Rule-of-40 | Cannot compute without AWS-specific free cash flow |
| Segment operating margin | Present — AWS operating margin implied from segment figures; Q1 2026 AWS revenue $37.6B; AWS is Amazon's highest-margin segment, though exact AWS operating margin % is not in the earnings call text read |

Absent required KPIs flagged as data gaps: net retention/expansion rate, cRPO/total RPO, SBC-to-revenue for AWS specifically. These cap the AWS-specific quality read — the business cannot be fully assessed as a cloud infrastructure compounder without them.

**Advertising (no dedicated overlay row)**
No sector overlay for digital advertising — generic read applies. Key metrics present: revenue ($17.2B Q1 2026, $21.3B Q4 2025), growth rate (+22% YoY). Attribution to impressions/CPMs not in pool.

**Valuation norm from overlays:**
- Retail segments: EV/EBITDA and FCFF DCF on unit economics
- AWS: given the scale and consumption model, closest to FCFF DCF; EV/revenue and EV/EBITDA vs growth are also applicable; a pure SaaS EV/NTM-revenue multiple is less appropriate given the infrastructure capex intensity
- Consolidated: a sum-of-the-parts (SOTP) approach is the correct frame, not a single-multiple read

Sector red flags relevant here:
- Fast-changing industry filter (CLAUDE.md §24, filter 5): AWS and advertising are in fast-changing technology markets where winners are hard to predict in advance. This is noted but not a trip — Amazon is a current clear leader in cloud infrastructure, not a speculative entrant.
- Serial acquirer filter (§24, filter 4): Not triggered on available evidence — Amazon's major acquisitions (Whole Foods, MGM, iRobot attempted but abandoned) are selective, not serial debt-funded deal-making.

## 4. What Drives Variance

When Amazon's consolidated revenue or margins move, the most likely cause is AWS growth rate and margin, since AWS now generates revenue at a $150B annualized run rate and operates at structurally higher margins than either retail segment — a 1-percentage-point change in AWS growth has an outsized effect on consolidated operating income. For the retail segments, variance is driven primarily by unit volume (tied to Prime membership growth and delivery speed), fulfillment cost per unit (the single largest retail cost line, affected by labor, robotics, and network efficiency), and FX (the International segment is material at $162B in FY2025 and exposed to currency moves). Advertising revenue, growing at 22% year-over-year, is increasingly a swing factor for profitability because it drops through at very high incremental margins. Capex intensity — guided at approximately $200 billion for 2026, predominantly for AWS data centers, chips, and networking — compresses near-term free cash flow (FCF fell from $38B to $11B in FY2025) even as it funds long-term revenue capacity; the gap between operating income growth and FCF generation will remain the key investor debate until AWS capacity monetization catches up to spend. [FY2025 Annual Report (CEO Letter), Apr-09-2026; Q4 2025 Earnings Call, CEO and CFO prepared remarks, Feb 05, 2026; Q1 2026 Earnings Call, CFO prepared remarks, Apr 29, 2026]
