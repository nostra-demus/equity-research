# market-structure Module Dossier — WHEAT

> Deterministic, lossless concatenation of every artifact in this module — the module synthesis and every specialist output, in order. Generated mechanically (no LLM rewriting), so nothing is omitted or paraphrased. This is the module's "see everything" tier; the module's decision lives in `99_*-synthesis.md` and the short read in `market-structure_memo.md`.

- Generated: 2026-07-12T13:51:57Z
- Module folder: `market-structure`
- Contents: 1 module synthesis + 3 specialist outputs = 4 files

## Table of Contents

- [market-structure — module synthesis](#market-structure-module-synthesis) — `99_market-structure-synthesis.md`
- [market-structure / 00_commodity-triage.md](#market-structure-00-commodity-triage-md) — `00_commodity-triage.md`
- [market-structure / 01_commodity-instruments.md](#market-structure-01-commodity-instruments-md) — `01_commodity-instruments.md`
- [market-structure / 02_commodity-price-curve.md](#market-structure-02-commodity-price-curve-md) — `02_commodity-price-curve.md`


---

## market-structure — module synthesis

_Source: `99_market-structure-synthesis.md`_

# Market Structure — WHEAT (module synthesis)

## Abstract

CBOT SRW wheat (front-month ZWN26) stood at 632¢/bu on 2026-07-10, roughly 16% above its October 2025 multi-year trough of 492.25¢ and approximately 8% below the 52-week spike high of 688.25¢ reached on 14 May 2026. The trend since October 2025 is up — higher lows and higher highs — but the market has a spike-and-pullback structure and has not managed a sustained close above the 672–688¢ resistance ceiling. The futures curve is in unbroken contango from Jul'26 (632¢) through Dec'27 (698.5¢), implying roughly −8 to −9% annualised roll drag for a long holder, which is the dominant cost consideration for any deferred or ETF exposure. The cleanest directional instrument is CBOT ZW front-month futures; for a futures-account-free holder, WEAT (Teucrium Wheat Fund) carries the same direction but at a meaningful all-in annual cost that requires the spot price to outrun the contango drag by a significant margin to generate a positive total return.

---

## Price & Trend

**Current level:** CBOT ZW July 2026 (ZWN26) settled at 632¢/bu on 2026-07-10. [Web: Farmbucks / Barchart, 2026-07-10, labelled unverified]

**12-month range:** 492.25¢ (52-wk low, ~14 Oct 2025) to 688.25¢ (52-wk high, ~14 May 2026). [Web: Barchart 52-week range, labelled unverified]

**Trend path:**
- Mid-Jan 2026: ~546–565¢/bu [Web: Feb 25, 2026 cite at 565¢; labelled unverified]
- 14 May 2026: 688.25¢ spike high (roughly +40% off the Oct trough in seven months) [Web: Barchart, labelled unverified]
- Mid-Jun 2026: pullback to ~598–605¢ [Web: Barchart settle data, labelled unverified]
- 10 Jul 2026: recovery to 632¢, driven by USDA June 1 US wheat stocks of 920 million bushels (tighter than expected) and reduced acreage of 42.74 million acres [00_commodity-triage.md; Web: labelled unverified]

**Overall direction:** Up since October 2025. The year-over-year gain implied at 632¢ is roughly +16% (derived from the +15.96% YoY figure — labelled inference, 02_commodity-price-curve.md). However, the spike high has been turned back every time it was tested in the 672–688¢ band, leaving a series of lower highs since May. The current 632¢ sits inside the near-term support band of 629–643¢ (Sep contract basis, Price Group Grains Report, 2026-07-06, labelled unverified) and the July contract expires on 14 July 2026, so the market is at a roll inflection point.

**Positioning context:** Managed money was net short 67,561 contracts as of 2026-06-30 (136,663 shorts vs 69,102 longs). [CFTC Disaggregated COT, 2026-07-06 — primary/official] This is a structurally bearish position by large speculators, which in the past has acted as a potential source of short-covering rallies if fundamentals surprise to the upside. However, a large net short is not by itself a catalyst — it is a precondition.

**Dominant chart constraint:** The 50-month declining moving average and the 672–688¢ prior-spike ceiling are the two structural overhead caps. A close above 688¢ on volume would be needed to call a confirmed breakout. [Web: Barchart, circa Jul 2026, labelled unverified]

---

## Futures Curve / Term Structure

**Full curve as of 2026-07-10** [Web: Farmbucks / Barchart, 2026-07-10, labelled unverified]:

| Contract | Price (US¢/bu) |
|---|---|
| Jul'26 (ZWN26) — expires Jul 14 | 632.00 |
| Sep'26 (ZWU26) | 640.25 |
| Dec'26 (ZWZ26) | 654.50 |
| Mar'27 (ZWH27) | 666.25 |
| May'27 (ZWK27) | 672.75 |
| Jul'27 (ZWN27) | 675.25 |
| Sep'27 (ZWU27) | 684.25 |
| Dec'27 (ZWZ27) | 698.50 |

**Shape:** Unbroken contango from front to back. Jul'26 to Dec'27 spans 66.5¢/bu, or +10.5% over approximately 17 months.

**Roll drag quantified:**
- Jul→Sep roll (imminent): Sep at 640.25¢ is 8.25¢/bu (+1.30%) above Jul; annualised to approximately −7.8%/yr for a long holder. [02_commodity-price-curve.md]
- Sep→Dec roll (next relevant window): Dec at 654.50¢ is 14.25¢/bu (+2.22%) above Sep; annualised to approximately −8.9%/yr. [02_commodity-price-curve.md]

**What contango signals here:** Storage economics are in equilibrium. The market is paying a premium for deferred delivery that covers warehousing and financing costs — a sign that the market does not price a near-term physical delivery squeeze. The USDA June 1 US wheat stocks of 920 million bushels, while described as tighter than expected, have not been tight enough to flip the curve into backwardation. Normal (historically typical) shape for wheat given deep storage infrastructure.

**WEAT-specific roll impact:** WEAT holds roughly 35% in the 2nd-to-expire (Sep'26 at 640.25¢), 30% in the 3rd-to-expire (Dec'26 at 654.50¢), and 35% in the next-December contract (Dec'27 at 698.50¢). Its weighted average curve exposure is approximately 664–665¢ — already ~5% above the expiring front month. The fund continuously buys higher-priced deferred and sells lower-priced near contracts, locking in a drag of approximately 8–9%/yr before the 1.00%/yr management fee (gross expense ratio ~3.64%/yr including brokerage and embedded costs). A WEAT holder needs spot wheat to rise by more than the ~9% annualised contango drag plus fees just to break even in total return. [02_commodity-price-curve.md; 01_commodity-instruments.md; Teucrium SEC 10-Q FY2026 Q1, labelled at data-vendor tier]

---

## Instruments & Cleanest Exposure

**Instrument map summary** (from 01_commodity-instruments.md):

| Instrument | Type | Best for | Key cost / divergence |
|---|---|---|---|
| ZW (CBOT SRW futures) | Exchange futures | Directional view, tightest bid/ask | Roll at each expiry; delivery basis vs Black Sea/MATIF |
| MZW (Micro CBOT SRW) | Exchange futures (1/5th size) | Smaller allocations, precise sizing | Same economics as ZW; less liquid |
| KW (KC HRW) | Exchange futures | Protein/quality premium play | SRW–HRW spread fluctuates; lower OI than ZW |
| MW / HRS (MGEX) | Exchange futures | Spring-wheat / protein premium | Spring premium widens in drought; thinner than ZW |
| EBM (MATIF Milling Wheat) | Exchange futures, EUR/tonne | EU / Black Sea export-market view | FX (EUR/USD) + EU–US export-parity arb |
| WEAT (Teucrium Wheat Fund) | Futures-based ETF | Retail / long-only, no futures account | ~0.62% net (3.64% gross) fee + contango roll drag ~8–9%/yr |
| Black Sea FOB physical | OTC physical | Not accessible for portfolio; monitoring only | Global price-setter for export trade |

**Cleanest instrument:**

- **For a directional wheat thesis with a futures account: CBOT ZW front-month futures.** Highest open interest (~215,000 contracts as of 2026-07-12, web, unverified), tightest spreads, maximum price discovery, and roll cost is transparent and controllable. [01_commodity-instruments.md; CME Group, web, 2026-07-12, labelled unverified]

- **For a retail / long-only allocation without a futures account: WEAT**, but the all-in annual cost (roll drag ~8–9% + management fee 1.00%) is a material structural handicap. The ~3.64% gross expense ratio — which captures the real all-in cost — is far higher than the headline 0.62% net figure. [01_commodity-instruments.md; ainvest.com, May 2026; Teucrium SEC 10-Q FY2026]

- **For a protein/quality or regional view:** KC KW (HRW) for protein premium, MGEX MW/HRS for spring wheat, MATIF EBM for European/Black Sea export dynamics — each is an independent price series, not a substitute for the other. [01_commodity-instruments.md]

---

## Reconciliation & Gaps

**Price figure discrepancy — adjudicated:**
The triage file (00_commodity-triage.md) records CBOT July 2026 wheat at ~611¢/bu as of 2026-07-09. The price-curve file (02_commodity-price-curve.md) records 632¢/bu as of 2026-07-10 — one trading day later, sourced from Farmbucks/Barchart. Both sources are labelled unverified web. The ~21¢ difference is consistent with the market's documented re-acceleration in early July on the USDA stocks/acreage data. The more recent figure (632¢/bu, 2026-07-10) is used throughout this synthesis as the current reference, per the preference for the more recent observation when both are web/unverified. This is not a source-quality conflict — it is a one-day price move.

**Russian FOB Black Sea:**
The triage file identifies Black Sea data as "not pulled at triage." The instruments file records Russian 12.5% protein FOB NTT at ~$237–242/tonne for July–August loading. [Web: Agriguruonline / Fastmarkets, June–July 2026, labelled unverified] This figure is used in the instruments file only and is noted for reference but carries no further reconciliation issue.

**Missing data noted:**
- Weather / crop progress (USDA Crop Progress, NOAA drought monitors): not pulled in any file. The triage file flags these as available from named primary sources. Their absence does not block the market-structure read but is a gap for a supply/demand thesis.
- USDA July WASDE: described in the triage as "expected imminently" as of 2026-07-09. Not yet reflected in any file. The July WASDE print is the highest-value forthcoming data point for the wheat thesis.
- Black Sea export flow volumes (UkrAgroConsult / trade data): not pulled. Identified as available but not checked.
- No local `data/WHEAT/` pool exists: the run operates entirely on live public sources. No pool data was available to cross-check any figure.

**No contradictions within the instrument or curve files** were found. All three files are internally consistent on the contango shape, the WEAT structure (three-contract deferred allocation, gross expense drag), and the cleanest instrument verdict (ZW for futures accounts, WEAT for retail).

---

## Note to the Commodity Thesis

- **Curve is in unbroken contango, with an annualised roll drag of approximately −8 to −9%/yr** on a ZW long roll; a WEAT long faces this drag compounded by a ~1.00%/yr management fee (gross all-in ~3.64%/yr). Any long thesis must show that the expected spot price move over the holding horizon exceeds roughly 9–10% annualised just to break even in total return on WEAT. On a ZW roll the drag is the same economically but is transparent and separately manageable.

- **Managed money is net short 67,561 contracts** (as of 2026-06-30, CFTC COT — primary). This is a large speculative short position that could unwind rapidly if the USDA July WASDE or crop-progress data disappoint on supply. It is a precondition for a short-covering rally, not a catalyst by itself.

- **The 688¢ spike high is unbroken overhead resistance.** At 632¢/bu (2026-07-10), the market is approximately 8.5% below that ceiling. A thesis requiring a move through 688¢ must identify the catalyst — most likely the July WASDE (highest-value forthcoming data point) or a weather shock — rather than assuming the prior resistance gives way without fresh fundamental support.

- **The July 2026 ZW contract expires 14 July 2026** — two days from the run date. Any position in ZWN26 must roll immediately. The first active contract post-roll is ZWU26 (Sep'26, 640.25¢). The thesis should be stated in Sep or Dec contract terms, not the expiring July front.



---

## market-structure / 00_commodity-triage.md

_Source: `00_commodity-triage.md`_

# Commodity Triage — WHEAT

## 1. Identity

| Item | Value | Source |
|---|---|---|
| Benchmark / grade | CBOT SRW (soft red winter, US¢/bushel) — the common reference; KC HRW (hard red winter, protein); MGEX HRS (spring); Black Sea Russian FOB as the export price-setter; Euronext MATIF (milling wheat, EUR/t) | COMMODITY_PROFILES.md ## WHEAT |
| Quote unit + currency | US cents per bushel (CBOT); note the Black Sea FOB level alongside | COMMODITY_PROFILES.md ## WHEAT |
| Primary exchange(s) | CBOT (CME), Kansas City (KC), MGEX, Euronext MATIF; plus Russian/Black Sea physical | COMMODITY_PROFILES.md ## WHEAT |
| Applicable lenses (from profile) | Market structure (CBOT curve; SRW–HRW–spring spreads; CBOT–MATIF–Black Sea spreads); Supply/demand (global production vs food/feed; USDA WASDE; major-exporter stocks-to-use); Weather/seasonality (DOMINANT — NH winter-wheat dormancy/winterkill, spring planting, SH crop, drought monitors, harvest windows); Macro drivers (Black Sea export policy + war risk, export taxes/quotas, exporter FX); Positioning/flows (CBOT managed-money net length via CFTC COT; WEAT flows); Valuation/fair value (cost-of-production + export-parity range) | COMMODITY_PROFILES.md ## WHEAT |

## 2. Instruments (from profile)

| Instrument / ticker | Type | Exposure | Notes |
|---|---|---|---|
| `WEAT` (Teucrium Wheat) | ETF (futures-based) | CBOT SRW wheat curve exposure | Holds contracts spread across months to soften roll; tracks the futures curve, not spot; in contango it bleeds roll yield and can lag a spot rally |
| `ZW` (CBOT) | Futures | SRW wheat — the direct expression | Carries roll; front-month and deferred contracts available |
| KC HRW futures | Futures | Hard red winter wheat (protein) | Protein/quality premium play; separate contract from CBOT SRW |
| MGEX HRS futures | Futures | Hard red spring wheat | Spring-wheat production and quality exposure |
| Euronext MATIF | Futures | Milling wheat, EUR/t | European/export-market lens; CBOT–MATIF spread is a key arb |

## 3. Data Reachability

| Lens | Primary source checked | Found? | As-of date |
|---|---|---|---|
| Benchmark price (CBOT SRW front-month) | Barchart.com / exchange-reported ZW futures price | Yes — CBOT July 2026 wheat futures ~611 US¢/bushel | 2026-07-09 (web: Barchart, labelled unverified) |
| Supply/demand balance (USDA WASDE) | USDA WASDE — monthly global wheat supply/demand balance; market attention confirmed on the July report | Yes — July WASDE expected imminently; June 1 US wheat stocks of 920 million bushels and 42.740 million acres reported | 2026-07-09 (web, unverified; USDA.gov is the primary source) |
| Positioning (CFTC COT — managed money) | CFTC Disaggregated Commitments of Traders (ag futures) | Yes — managed money net short 67,561 contracts (136,663 shorts vs 69,102 longs) as of 2026-06-30 | 2026-07-06 (CFTC COT report, primary/official) |
| Weather/seasonality | USDA Crop Progress (weekly in season) and NOAA/drought monitors — not pulled at triage stage | Not checked at triage; identified as available from named primary source | — |
| Black Sea / geopolitics | Russian/UkrAgroConsult trade data; web sources | Not pulled at triage; identified as available from named secondary sources | — |

## 4. Local pool (data/WHEAT/)

None — `data/WHEAT/` does not exist in the repository. Running entirely on live public sources.

## 5. Sufficiency Verdict

- **Verdict:** Sufficient
- **Reason:** WHEAT has a full profile section in COMMODITY_PROFILES.md; a current benchmark price (CBOT SRW ~611 US¢/bushel as of 2026-07-09) is reachable from exchange-reported data; the primary positioning source (CFTC COT, 2026-07-06) is confirmed reachable and contains a specific managed-money figure; and the USDA WASDE — the key supply/demand source — is an active monthly release with the most recent data confirmed available.
- **Missing (if Partial/Insufficient):** None blocking. Weather/seasonality (Crop Progress, drought monitors) and Black Sea trade flow data were not pulled at triage but are named primary/secondary sources confirmed to be actively published and accessible.



---

## market-structure / 01_commodity-instruments.md

_Source: `01_commodity-instruments.md`_

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



---

## market-structure / 02_commodity-price-curve.md

_Source: `02_commodity-price-curve.md`_

# Price Trend & Term Structure — WHEAT

## 1. Price Now & Trend

| Horizon | Level (US¢/bu, CBOT SRW front month) | Change | Source |
|---|---|---|---|
| Spot / front (ZWN26, Jul'26) | 632.00 ¢/bu | — | Web: Farmbucks / Barchart, 2026-07-10, labelled unverified |
| ~1 month ago (mid-Jun'26) | ~598–605 ¢/bu | +~4–5% | Web: Barchart settle data, Jun 11 Sep contract 598.25¢; recent close cited ~605¾¢ — labelled unverified |
| ~3 months ago (mid-Apr'26) | ~580–590 ¢/bu (est.) | +~7–8% | Inference from rally trajectory: May 14 peak 688.25¢ after ascending from ~565¢ in Feb; labelled inference |
| ~6 months ago (mid-Jan'26) | ~546–565 ¢/bu | +~12–16% | Web: Feb 25, 2026 cited at 565¢/bu; early 2026 trend — labelled unverified |
| ~12 months ago (mid-Jul'25) | ~545 ¢/bu (implied) | +~16% | Derived from +15.96% YoY figure at 632¢ — labelled inference |
| 52-wk low | 492.25 ¢/bu (~Oct 14, 2025) | — | Web: Barchart 52-week range — labelled unverified |
| 52-wk high | 688.25 ¢/bu (~May 14, 2026) | — | Web: Barchart 52-week range — labelled unverified |

**Trend read.** CBOT SRW wheat has recovered substantially from its multi-year low of ~492¢/bu reached in mid-October 2025. The move from that trough to the May 14, 2026 spike high of 688.25¢/bu — a gain of roughly 40% in seven months — was the dominant feature of the past year. Since that spike, the market has given back meaningful ground: prices pulled back to roughly 560–610¢/bu through June, then re-accelerated in early July on tighter-than-expected USDA June 1 US wheat stocks (920 million bushels) and a reduced acreage reading of 42.74 million acres, pushing the front month back to 632¢/bu on July 10. The overall direction since October 2025 has been up — higher lows, higher highs — but the market sits roughly 8% below its 52-week peak, and the short-term pattern shows a spike-and-pullback structure that has not yet been resolved with a sustained close above the 672–688¢ resistance zone.

---

## 2. Technical Levels (chart context, not fundamentals)

- **Resistance zone 672–688 ¢/bu.** The May 14, 2026 spike high of 688.25¢ and the cluster of failed recovery attempts in the 672–688¢ band mark the clearest chart ceiling. Every re-test of this zone since May has been turned back, leaving a series of lower highs. Traders widely reference 688¢ as the level a sustained close above would be needed to confirm breakout rather than bull-trap. [Web: Barchart / trader analysis, labelled unverified, circa Jun–Jul 2026]

- **Support cluster 629–643 ¢/bu (Sep contract basis).** The Price Group grains report (Jul 6, 2026) cited Chicago September wheat support at 643, 635, and 629¢. The equivalent front-month (Jul) level near 632¢ sits inside this band, meaning the current price is testing its own near-term support floor as the July contract approaches its Jul 14, 2026 expiration. [Web: Price Group Grains Report, 2026-07-06, labelled unverified]

- **50-day moving average (~668 ¢/bu, KC September basis).** AgMarket.Net (Jul 9, 2026) cited the 50-day moving average for Kansas City September wheat at 668.5¢ and the 20-day at 638.25¢. While these are KC HRW levels (not CBOT SRW), they are widely watched by the same audience and give an approximate band: the 20-day acts as near-term support and the 50-day as overhead resistance. [Web: AgMarket.Net, 2026-07-09, labelled unverified]

- **50-month moving average (longer-term resistance).** Market commentary (Barchart, circa Jul 2026) notes that CBOT SRW wheat closed a recent month against resistance from its declining 50-month moving average. This is a slower-moving constraint on any sustained multi-month rally — the level was advancing in 2024 when wheat last closed above it; now it is declining, making any break above it structurally harder to hold. [Web: Barchart, 2026-07, labelled unverified]

---

## 3. Futures Curve / Term Structure

| Contract | Price (US¢/bu) | Source |
|---|---|---|
| Jul'26 (ZWN26) — front, expires Jul 14 | 632.00 | Web: Farmbucks, 2026-07-10, labelled unverified |
| Sep'26 (ZWU26) | 640.25 | Web: Farmbucks / Barchart, 2026-07-10, labelled unverified |
| Dec'26 (ZWZ26) | 654.50 | Web: Farmbucks, 2026-07-10, labelled unverified |
| Mar'27 (ZWH27) | 666.25 | Web: Farmbucks, 2026-07-10, labelled unverified |
| May'27 (ZWK27) | 672.75 | Web: Farmbucks, 2026-07-10, labelled unverified |
| Jul'27 (ZWN27) | 675.25 | Web: Farmbucks, 2026-07-10, labelled unverified |
| Sep'27 (ZWU27) | 684.25 | Web: Farmbucks, 2026-07-10, labelled unverified |
| Dec'27 (ZWZ27) | 698.50 | Web: Farmbucks, 2026-07-10, labelled unverified |

**Shape: contango throughout.** Every deferred contract prices above the next-nearer contract — the curve slopes upward continuously from 632¢ (Jul'26) to 698.5¢ (Dec'27), a span of 66.5¢/bu or +10.5% over roughly 17 months.

**Annualised roll yield (headline — Sep vs Jul, the imminent roll):** Sep'26 at 640.25¢ is 8.25¢/bu above the expiring Jul'26 contract at 632¢. That is a +1.30% premium over the 2-month roll window, annualised to **approximately −7.8% per year** for a long holder who rolls. Using the Sep→Dec roll (the next-most relevant window for WEAT): Dec'26 at 654.50¢ is 14.25¢/bu above Sep'26 at 640.25¢ — +2.22% over 3 months, annualised to approximately **−8.9% per year**.

**What this means for tightness and roll economics.** Contango in wheat reflects a market that sees adequate forward supply: storers are willing to hold grain because they can sell deferred futures at a premium that covers warehousing and financing costs. This is the normal (historically typical) shape for wheat, which has deep and well-developed storage infrastructure. It does not signal near-term physical tightness — if the market were genuinely tight at the front, front-month prices would be bid above deferred, flipping the curve into backwardation. The current shape says the market believes the recent tightness in US inventories (June 1 stocks of 920 million bushels below expectations) has not escalated into a delivery squeeze.

For **WEAT** (Teucrium Wheat ETF), the contango drag is material and ongoing. WEAT holds roughly 35% in the 2nd-to-expire contract (Sep'26 at 640.25¢), 30% in the 3rd-to-expire (Dec'26 at 654.50¢), and 35% in the next-December contract (Dec'27 at 698.50¢). Its weighted average curve exposure is approximately 664–665 ¢/bu — already 5% above the expiring front month. As the fund rolls contracts, it continuously buys the higher-priced deferred month and sells the lower-priced near month, locking in a loss that accumulates at approximately 8–9% per year before the expense ratio (1.0%/yr) is even counted. A holder of WEAT can be right that spot wheat prices are rising and still underperform the spot price move because the roll drag eats into NAV. In a market where the spot price rises by less than the annualised contango (roughly 9% threshold), the WEAT holder loses money in total return even if the spot price climbs modestly.
