# Instruments & Exposure Map — WHEAT

## 1. Benchmark & Contract

- **Benchmark grades:** CBOT Soft Red Winter (SRW) wheat is the common global reference; KC Hard Red Winter (HRW) carries a protein premium; MGEX Hard Red Spring (HRS) is the spring-wheat benchmark. Russian FOB Black Sea (Novorossiysk-Taman-Tuapse, USD/tonne) is the export price-setter that anchors world trade flows; Euronext MATIF Milling Wheat No. 2 (EBM, EUR/tonne) is the European-milling benchmark.
- **Quote unit / currency:** US cents per bushel (US¢/bu) for CBOT ZW and KC KW; USD/tonne for Black Sea FOB and MATIF EBM.
- **Front-month contract (CBOT ZW):** Contract size 5,000 bushels; minimum tick $0.0025/bu ($12.50/contract); contract months Mar / May / Jul / Sep / Dec; settlement by physical delivery of SRW wheat at approved Chicago-area warehouses. [CME Group, CBOT ZW Contract Specs; Lune Trading ZW specs page, 2026-07-12 (web, unverified)]
- **Reference price (triage):** CBOT July 2026 ZW front-month ~611 US¢/bu; Russian 12.5% protein FOB NTT ~$237–242/tonne for July–August loading. [Barchart.com, 2026-07-09 (web, unverified); Agriguruonline / Fastmarkets, June–July 2026 (web, unverified)]

---

## 2. Instrument Map

| Instrument | Type | Exchange | Tracks | Fee / Cost | Main divergence from spot | Source |
|---|---|---|---|---|---|---|
| `ZW` — CBOT SRW Wheat futures (front-month) | Exchange-traded futures | CBOT (CME Group) | Spot SRW wheat delivery price at Chicago-area warehouses | Exchange fees + margin opportunity cost; no management fee | Contango / backwardation relative to cash. Roll cost incurred at each expiry (buy deferred, sell front). Delivery-location basis vs cash markets. Most liquid wheat futures globally. | [CME Group CBOT ZW specs, 2026; Barchart.com, 2026-07-12] |
| `KW` — KC HRW Wheat futures | Exchange-traded futures | CME (Kansas City) | Hard red winter wheat (protein); No. 2 HRW at par, No. 1 at +1.5¢ premium | Exchange fees + margin opportunity cost | Protein/quality premium over SRW. SRW–HRW spread fluctuates with US crop composition. Lower open interest than ZW. | [CME Group KC HRW Wheat specs, 2026-07-12 (web, unverified)] |
| `MW` / `HRS` — MGEX / CME Hard Red Spring Wheat futures | Exchange-traded futures | MGEX (now part of CME Group ecosystem) | Hard red spring wheat (highest protein, primarily North Dakota/Montana) | Exchange fees + margin opportunity cost | Spring-wheat protein/quality premium over SRW. The "spring premium" widens in drought years. Thin relative to ZW front. | [CME Group HRS Wheat specs, 2026-07-12 (web, unverified)] |
| `EBM` — Euronext MATIF Milling Wheat No. 2 | Exchange-traded futures | Euronext Paris (MATIF) | EU-origin No. 2 milling wheat, EUR/tonne; delivery at Rouen/Dunkirk/La Pallice | Exchange fees + margin opportunity cost; quoted in EUR | CBOT–MATIF spread tracks the EU–US export-parity arb and EUR/USD FX. Key for EU/Black Sea export-market positioning. 50-tonne contract lots; months Sep/Dec/Mar/May. | [Euronext MATIF contract specs, July 2024; Barchart.com EBM profile, 2026-07-12] |
| Black Sea Russian FOB (physical) | Physical/OTC spot | OTC (Novorossiysk-Taman-Tuapse) | Russian milling wheat (12.5% and 11.5% protein grades), FOB Black Sea ports, USD/tonne | Shipping freight, handling, insurance; no exchange fee | The global price-setter for wheat export flows. Not directly tradeable by retail/ETF investors; tracked via assessment services (Platts/Argus/Fastmarkets). Tracks supply/logistics/export-tax decisions by Russia, not US crop fundamentals. | [Fastmarkets / Agriguruonline, June–July 2026 (web, unverified)] |
| `WEAT` — Teucrium Wheat Fund | Futures-based ETF | NYSE Arca | CBOT SRW wheat futures curve — holds three deferred contracts, not front-month | Net expense ratio ~0.62%/yr (gross ~3.64%/yr incl. embedded futures costs); stated management fee 1.00%/yr | Tracks the futures curve, not spot or front-month. Multi-month spread structure (35% 2nd-to-expire / 30% 3rd-to-expire / 35% next-Dec-after-3rd-to-expire) deliberately avoids the near front. In contango, all deferred holders bleed roll yield relative to spot. In backwardation, they benefit. NAV can diverge from spot wheat price by the cumulative roll carry over the holding period. AUM ~$302M (May 2026). | [Teucrium WEAT fund data, SEC 10-Q FY2026 (Q1 ended 2026-03-31); companiesmarketcap.com expense ratio July 2026; ainvest.com WEAT overview; Sorafutures (1.00% mgmt fee)] |
| `MZW` — Micro CBOT SRW Wheat futures | Exchange-traded futures (micro) | CBOT (CME Group) | CBOT SRW wheat, 1/5th contract size (1,000 bu) | Exchange fees + margin | Identical to ZW in economic terms; one-fifth the notional size. Lower margin requirement. Useful for smaller allocations or precise sizing. Less liquid than ZW. | [CME Group, web, 2026-07-12 (unverified)] |

---

## 3. Portfolio Instrument → Underlying

| Held instrument | Mechanism (what it holds) | Fee | How it can diverge from the commodity |
|---|---|---|---|
| `WEAT` (Teucrium Wheat Fund) | Holds three CBOT SRW wheat futures contracts across deferred months: 35% in the 2nd-to-expire contract, 30% in the 3rd-to-expire contract, and 35% in the CBOT December contract expiring in the year after the 3rd-to-expire. The remaining assets (~49% of net assets as of 31 March 2026) are held in US Treasury money-market instruments as margin collateral. Physical wheat is never held. [Teucrium SEC 10-Q FY2026; first-search result citing contract breakdown] | Net expense ratio ~0.62%/yr (filed most-recently-available figure, July 2026); stated management fee 1.00%/yr of average net assets; gross expense ratio ~3.64%/yr includes brokerage commissions, custody, and other fund operating costs embedded in the futures positions. [companiesmarketcap.com, July 2026; ainvest.com; Sorafutures (web, unverified)] | **Four channels of divergence from physical wheat (spot):** (1) **Roll yield drag/gain:** in a normally-sloped (contango) wheat curve, rolling from a cheaper near contract into a more expensive deferred contract costs the fund the spread, creating a drag relative to spot. In backwardation the roll adds yield. Wheat can move between the two regimes within a single crop year. (2) **Three-contract spread:** WEAT's deferred weighting means it tracks 2nd–Dec deferred contracts, not the front-month or spot. A sharp move in nearby wheat driven by a short-term supply event (frost, export ban) may show up in the front-month ZW before it propagates out to deferred contracts WEAT holds, causing WEAT to lag. (3) **Fee drag:** the ~0.62% net (or 1.00% stated management) fee compounds annually. (4) **Currency:** WEAT is USD-denominated; no FX conversion. No tracking error from currency for USD holders, but non-USD investors face FX risk. |

---

## 4. Cleanest Expression

- **Cleanest for a directional wheat view: CBOT ZW front-month futures.** ZW is the world's most actively traded wheat benchmark (~215,000 contracts total open interest as of 2026), with the tightest bid-ask and maximum price discovery. A roll is required at each expiry (typically 5–10 days before First Notice Day), but the roll cost is transparent and controllable. Exposure is to SRW delivery at Chicago, not global spot, so a basis adjustment is needed to compare to Black Sea or MATIF prices. [CME Group ZW volume/open interest, 2026-07-12 (web, unverified)]

- **Cleanest for a retail / long-only portfolio holding without a futures account: WEAT.** It eliminates the mechanics of rolling but substitutes a 0.62% net fee (1.00% management), embedded roll costs wrapped inside the gross expense ratio (~3.64%), and deferred-curve exposure that can lag front-month moves. AUM ~$302M gives reasonable liquidity for ETF-level trading. [ainvest.com, May 2026; Teucrium SEC 10-Q 2026]

- **For a protein/quality play:** KC KW (HRW) or MGEX MW/CME HRS futures target specific wheat classes where the protein premium widens in tight supply or drought. These are less liquid than ZW.

- **For a European / export-market view:** MATIF EBM (Milling Wheat No. 2) is the right instrument; it prices in EUR/tonne and reflects Black Sea–EU arb dynamics, not US domestic crop fundamentals.

- **Biggest caveat on WEAT vs ZW:** the gross expense ratio of ~3.64%/yr — which incorporates the real all-in cost of holding a futures ETF — is a significant structural drag that does not show up in the headline 0.62% net figure. Over a multi-year hold in a persistently contangoed wheat curve, the cumulative roll cost plus the management fee can materially erode returns relative to the price appreciation of physical wheat or the front-month futures. [ainvest.com; first web-search result for WEAT expense ratio]

---

## 5. Sources

- [CME Group — Chicago SRW Wheat Futures Contract Specs (ZW)](https://www.cmegroup.com/markets/agriculture/grains/wheat.contractSpecs.html), accessed 2026-07-12 (web, unverified)
- [CME Group — KC HRW Wheat Futures Contract Specs](https://www.cmegroup.com/markets/agriculture/grains/kc-wheat.contractSpecs.html), accessed 2026-07-12 (web, unverified)
- [CME Group — Hard Red Spring Wheat Futures Specs](https://www.cmegroup.com/markets/agriculture/grains/hard-red-spring-wheat/specs), accessed 2026-07-12 (web, unverified)
- [Euronext MATIF — Milling Wheat No. 2 Futures technical specifications](https://live.euronext.com/sites/default/files/documentation/contract-specifications/Technical%20specifications%20of%20the%20Milling%20Wheat%20NO.2%20Futures%20July%202024.pdf), July 2024
- [Lune Trading — CBOT ZW Futures Specifications](https://lunefi.com/tools/futures/zw), accessed 2026-07-12 (web, unverified)
- [Teucrium Commodity Trust — Form 10-Q FY2026 (Q1 ended 2026-03-31)](https://www.sec.gov/Archives/edgar/data/0001471824/000143774926016164/weat20260331_10q.htm) — primary SEC filing; contract allocation and net-asset figures cited from first-pass web search summary (direct HTTP 403 on fetch; cited at data-vendor tier — labelled)
- [Teucrium WEAT fund page — roll schedule and fund description](https://teucrium.com/weat), accessed 2026-07-12 (web, unverified)
- [ainvest.com — WEAT AUM $301.69M as of May 2026](https://www.ainvest.com/etfs/ARCA-WEAT/), accessed 2026-07-12 (web, unverified)
- [companiesmarketcap.com — WEAT expense ratio 0.62% as of July 2026](https://companiesmarketcap.com/teucrium-wheat-fund/expense-ratio/), accessed 2026-07-12 (web, unverified)
- [Sorafutures — Teucrium Wheat Fund 1.00% management fee (historical prospectus disclosure)](https://www.sorafutures.com/archives/43181), accessed 2026-07-12 (web, unverified)
- [Fastmarkets / Agriguruonline — Russian wheat FOB NTT prices July 2026](https://agriguruonline.com/news/russian-wheat-fob-prices-slip-as-global-futures-sell-off-weakens-demand-and-exports-slow), accessed 2026-07-12 (web, unverified)
- [Barchart.com — CBOT ZW July 2026 front-month ~611 US¢/bu](https://www.barchart.com/futures/quotes/ZWN26), 2026-07-09 (web, unverified)
- [CME Group — CBOT ZW open interest ~215,550 contracts](https://www.cmegroup.com/markets/agriculture/grains/wheat.volume.html), 2026-07-12 (web, unverified)
- COMMODITY_PROFILES.md `## WHEAT` section — instrument list and lens definitions (primary profile; read at run start)
- commodity/runs/WHEAT/market-structure/00_commodity-triage.md — triage data-reachability table and CFTC COT managed-money positioning figure
