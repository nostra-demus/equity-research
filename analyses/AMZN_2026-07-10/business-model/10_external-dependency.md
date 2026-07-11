# External Dependency Check — AMZN

> **Score direction: HIGHER = WORSE** (more dangerous external dependence)

## 1. Dependency Table

| External Variable | Dependency Level | Why It Matters | Evidence |
|---|---|---|---|
| FX | Mid | International segment is 22% of consolidated revenue ($142.9B in FY2024). FX reduced net sales by $2.3B in FY2024 and reduced International net sales by $1.8B. Q1 2026 results were boosted by a $2.9B FX tailwind. Management explicitly tracks and discloses FX-neutral growth alongside reported growth. Intercompany balance remeasurement creates P&L volatility beyond top-line translation. | FY2024 10-K, Item 7, p.24 (FX effect table); Item 7A, p.32; Q1 2026 earnings call, CFO prepared remarks (Apr 29, 2026) |
| Interest rates | Low-Mid | Long-term debt of $58.0B face value at December 31, 2024 is fixed-rate, so rising rates do not change cash interest costs immediately. However, the $84.4B investment portfolio (money market funds and marketable debt securities) earns variable rates — higher rates lift interest income ($4.7B in FY2024 vs. $2.9B in FY2023). AWS capex financing plans also reference market conditions. Impact is indirect and partially self-hedging: higher rates hurt borrowing cost optionality but help investment income on a large cash pile. | FY2024 10-K, Item 7A, p.31 (interest rate sensitivity table); MD&A interest income discussion, p.27 |
| Government policy / tariffs | Mid-High | Risk Factors explicitly name trade protection measures, export duties, quotas, custom duties, and tariffs as material risks. China-based sellers account for significant portions of third-party seller revenues; tariff changes on Chinese-origin goods directly affect seller economics and could suppress marketplace GMV. AWS government contracts are subject to procurement regulations and can be terminated at will. The 10-K cites India's foreign ownership restrictions on retail as an active structural constraint. Q1 2026 call noted tariff and trade policies among key uncertainty factors. | FY2024 10-K, Item 1A, p.7 (international risks); p.10 (fluctuation factors list — "tariff policy changes"); Q1 2026 earnings call, forward-looking caveat (Apr 29, 2026) |
| Regulation | High | Amazon faces active regulatory investigations across antitrust (FTC, state AGs, EU), privacy (GDPR, US state laws), AI/data regulation, digital-services laws, and consumer protection in every major geography it operates. The 10-K devotes a full risk section to evolving government regulation and names open FTC investigations into fulfillment network practices and Prime, EU Digital Markets Act gatekeeper designation, and global minimum tax changes. Regulatory outcomes are binary and uncontrollable by management. | FY2024 10-K, Item 1A, pp.14–16 (Government Regulation, Legal and Regulatory Risks); FY2024 10-K, p.16 (tax controversies including Indian tax authority assertion on cloud fees) |
| Consumer cycle | Mid | Retail segment (North America + International = 83% of revenue) is partially cyclical. Demand softening due to recessionary fears or inflation is explicitly cited as a risk. However, Amazon's scale, Prime membership stickiness, and everyday-essentials mix (grocery now the #2 US grocer by gross sales) dampen cyclicality vs. a pure-discretionary retailer. AWS revenue (~17% of consolidated) is relatively sticky — enterprise cloud workloads don't switch off in a downturn. Advertising (~$56B annualized run rate) is more cyclical: advertisers cut budgets faster than consumers stop buying. | FY2024 10-K, Item 1A, p.8 ("global economic conditions such as recessionary fears or rising inflation"); MD&A Overview, p.24 |
| Freight / logistics rates | Mid | Shipping costs were $95.8B in FY2024 (roughly 15% of net sales), the single largest variable cost line. Amazon has partially internalized this by building its own delivery network (AMZL), reducing reliance on UPS/FedEx, but the 10-K still names limited shipping company relationships as a risk. Fuel prices are embedded in freight costs. The company mitigates through scale, route optimization, and robotics but cannot fully escape macro freight-rate moves. | FY2024 10-K, Item 1A, p.10 ("availability of and increases in the prices of transportation including fuel"); MD&A Cost of Sales, p.25 ($95.8B shipping costs cited) |
| Weather / climate | Low-Mid | Extreme weather is cited as a risk factor that can disrupt fulfillment and delivery operations and has potential to affect consumer demand. Climate-related regulations also add compliance costs. These are real but secondary risks — a single storm disrupts operations temporarily; Amazon has multi-node redundancy in its fulfillment and data center networks. | FY2024 10-K, Item 1A, p.10 ("natural or human-caused disasters including extreme weather as a result of climate change"); p.11 (system interruptions section) |
| Geopolitics | Mid | The 10-K names geopolitical events, war, terrorism, and China-specific political conditions as operating risks. Amazon Leo (LEO satellite network) involves spectrum rights and regulatory approvals across sovereign governments. AWS hosts classified government data — political relations between the US and other countries affect which customers can use which services. China-seller dependency on the marketplace adds supply-chain geopolitical exposure. | FY2024 10-K, Item 1A, p.7 (international operations risks list — "geopolitical events including war and terrorism"); p.8 (China-specific regulatory risk); 2025 Annual Report shareholder letter (geopolitical and military conflict cited) |
| Industrial / enterprise cycle | Low-Mid | AWS growth is driven by enterprise IT spending decisions. While cloud adoption is a structural trend, enterprise budget freezes in a severe downturn would slow new workload migrations and optimization spend. The Q4 2025 and Q1 2026 results show 24–28% AWS growth with management noting demand outstrips current supply — suggesting the variable today is supply (a management lever) more than demand (an external variable). Long-term customer contracts partially lock in revenue. | Q1 2026 earnings call, CEO prepared remarks (AWS $150B annualized run rate, growth 28% YoY); FY2025 annual report shareholder letter |

**Variables dropped:** Commodity prices (energy is embedded in freight/data center costs and not separately material as a direct P&L line); no meaningful direct commodity exposure (Amazon does not produce or process raw materials).

---

## 2. Sensitivity, If Disclosed

Amazon publishes explicit sensitivity figures in Item 7A of the FY2024 10-K (fiscal year ended December 31, 2024):

| Variable | Basis | Sensitivity Disclosed |
|---|---|---|
| FX — foreign funds | Balance of foreign-denominated cash/equivalents/marketable securities of $25.5B at Dec 31, 2024 | 5% adverse move: −$1.3B decline; 10% adverse: −$2.6B; 20% adverse: −$5.1B |
| FX — intercompany balances | Foreign-denominated intercompany balances at Dec 31, 2024 | 5% adverse: −$305M loss; 10% adverse: −$605M; 20% adverse: −$1.2B (recorded in "Other income (expense), net") |
| FX — revenue (disclosed separately in MD&A) | FY2024 reported net sales $637.96B | FX reduced reported net sales by $2.335B in FY2024 vs. prior-year rates (exchange rate effect column) |
| Interest rates | $84.7B in cash equivalents and marketable debt securities | Qualitative: fixed-rate portfolio — market value fluctuates with rates but P&L impact only on forced sales; no point sensitivity published for a specific rate move |

*Source: FY2024 10-K, Item 7A, pp.31–32; MD&A "Effect of Foreign Exchange Rates" table, p.29.*

---

## 3. Classification

**Partly externally driven** — material exposure but real management levers (pricing, hedging, mix).

Amazon has meaningful FX, regulatory, tariff, and consumer-cycle exposure across its retail and international operations. These are real external variables that management cannot fully control. However, across its three segments — North America retail, AWS, and Advertising — management has substantial pricing power, a partially internalized logistics network, an expanding proprietary chip portfolio (reducing third-party GPU dependency), long-term enterprise contracts in AWS, and Prime membership stickiness. The mix is shifting toward higher-margin, less cyclical, and more company-controlled revenue streams (AWS and Advertising together were ~38% of revenue but ~64% of operating income in FY2024). This tilt materially reduces external dependency relative to Amazon's retail-only past, but the retail base and international segment keep the classification clearly in the "partly externally driven" camp rather than "company-controlled."

---

## 4. External Dependency Risk Score

**32 / 100** (higher = worse)

Amazon's external dependency is real but well below average for a company of its revenue mix. The score of 32 reflects:

- FX is quantifiable, partially mitigated by natural hedges (international costs also in local currency), and disclosed with precision. It dents revenue ($2.3B in FY2024) but does not threaten the business.
- Regulation is the most structural risk — active FTC/EU investigations are binary and management cannot fully control outcomes — but this is an ongoing risk that markets are pricing, not an acute shock today.
- Tariff and trade policy risk is elevated and currently live (China-seller exposure, Q1 2026 call mentioned tariff uncertainty) but the impact flows through seller economics, not Amazon's own cost of goods directly.
- The consumer cycle matters for retail but AWS and Advertising provide meaningful insulation.
- No material commodity pass-through, no energy-price leverage, no weather-driven revenue.
- Long-term debt is fixed-rate; rate moves primarily affect investment income (a benefit when rates are high).

This places AMZN in the 21–40 band: partly externally driven, with hedgeable or actively managed exposures.

---

## 5. The Single Biggest Lever

**Regulation** — a 20% adverse shift in regulatory outcomes (structural remedies from FTC/EU investigations, forced unbundling of Prime benefits from marketplace, or a material digital-services tax across key markets) would do more cumulative damage than any FX move, tariff, or consumer-cycle downturn, because it would strike the flywheel linkages — Prime, Marketplace, and AWS — that generate the company's operating leverage and above-average margins.
