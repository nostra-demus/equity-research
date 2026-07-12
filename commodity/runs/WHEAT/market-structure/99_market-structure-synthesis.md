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
