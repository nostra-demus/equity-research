# Market Structure Module Memo — WHEAT

**Date:** 2026-07-12
**Verdict:** Uptrend since October 2025, but capped by the 672–688¢ ceiling; the futures curve is in unbroken contango, so any long wheat position carries an ~8–9%/yr headwind before fees just from rolling the contract forward.

---

## Scores at a Glance

This module does not carry numeric /100 scores — a commodity market-structure read is a structural map (price, curve shape, cleanest instrument), not a rated verdict. What the synthesis does carry, verbatim:

| Item | Reading (from synthesis) |
|---|---|
| Current price (CBOT ZWN26, 2026-07-10) | 632¢/bu |
| 12-month range | 492.25¢ (low, ~14 Oct 2025) to 688.25¢ (high, ~14 May 2026) |
| YoY change at 632¢ | ~+16% (inference) |
| Trend since Oct 2025 | Up (higher lows, higher highs) — but pattern is spike-and-pullback |
| Futures curve shape | Unbroken contango from Jul'26 (632¢) to Dec'27 (698.5¢) |
| Roll drag, Jul→Sep | ~−7.8%/yr for a long holder |
| Roll drag, Sep→Dec | ~−8.9%/yr for a long holder |
| WEAT all-in annual cost | ~8–9% roll drag + 1.00%/yr management fee (gross expense ratio ~3.64%/yr) |
| Managed-money position (CFTC COT, 2026-06-30) | Net short 67,561 contracts (136,663 shorts vs 69,102 longs) |
| Cleanest instrument (futures account) | CBOT ZW front-month futures |
| Cleanest instrument (retail, no futures account) | WEAT — but structurally handicapped by the ~9%+/yr all-in cost |

**Score caps applied:** None — this module does not gate a rating; it feeds the commodity thesis with structural facts.

**§24 Avoid-Big-Risks filters tripped:** None flagged by this module. The synthesis does surface one structural warning that matters for §24 in the thesis layer — a WEAT holder needs spot wheat to rise by more than ~9–10%/yr just to break even in total return, which is a structural cost, not a filter trip.

---

## What This Module Found

CBOT wheat (front-month July 2026 contract, ticker ZWN26) closed at 632¢/bushel on 2026-07-10. That is roughly 16% above the October 2025 low (492.25¢) and about 8% below the May 2026 spike high (688.25¢). The trend since October is up, but the market has been turned back every time it tested the 672–688¢ band, leaving a series of lower highs since May. The most important structural fact is that the futures curve — the prices of contracts delivering in later months — is in unbroken contango (each later-dated contract is priced higher than the nearer one) from July 2026 all the way through December 2027; the gap is 66.5¢ (10.5%) over about 17 months. For anyone holding a long position through the roll from one expiring contract to the next, this locks in a drag of roughly 8–9% per year before any fees. The single biggest driver right now is the USDA data (June 1 US wheat stocks at 920 million bushels, tighter than expected, and reduced acreage of 42.74 million acres), which is what pulled the market back up to 632¢. The single biggest risk to the current read is that the July 2026 contract expires on 14 July 2026 — two days after the run date — so any July position must roll immediately, and the market is at a roll inflection point.

---

## The Specialists, Briefly

- **Commodity triage (00) — jurisdiction & pool scan:** identified CBOT SRW wheat as the reference contract, flagged the USDA July WASDE as the highest-value forthcoming data, and noted no local `data/WHEAT/` pool exists — the run works off live public sources only.
- **Instruments (01) — instrument map:** cleanest directional instrument for a futures account is CBOT ZW front-month; for retail without a futures account, WEAT (Teucrium Wheat Fund), but with a heavy structural cost (~8–9%/yr roll drag plus ~1.00%/yr management fee; gross expense ratio ~3.64%/yr).
- **Price & curve (02) — curve shape and roll math:** curve is in unbroken contango; Jul→Sep roll annualises to about −7.8%/yr, Sep→Dec to about −8.9%/yr; WEAT's weighted average curve exposure sits about 5% above the expiring front month because it continuously buys the higher-priced deferred contract and sells the lower-priced near one.

**Reconciliation:** The synthesis flagged one price discrepancy — the triage file recorded ~611¢/bu on 2026-07-09, the curve file 632¢/bu on 2026-07-10. It adjudicated this as a one-day price move on the USDA data, not a source conflict, and used the more recent figure (632¢) throughout. No contradictions were found across the instrument, curve, and roll math.

---

## What Would Change This Read

The synthesis names specific, observable events that would move the market-structure read:

- **A close above 688¢ on volume** would confirm a breakout through the ceiling that has held since May 2026. Without that, the spike-and-pullback pattern stands.
- **The USDA July WASDE** (the monthly world supply-and-demand estimate) is the highest-value forthcoming data point and is the most likely near-term catalyst for either direction.
- **A weather shock or a crop-progress disappointment** could trigger a short-covering rally, given the large managed-money net short (67,561 contracts). The net short is a precondition, not a catalyst — it needs fresh fundamental news to fire.
- **A flip from contango into backwardation** (later contracts pricing below nearer ones) would signal a near-term physical delivery squeeze. The current shape says the market does not price one; even the tighter-than-expected June stocks did not flip the curve.

---

## Bottom Line

- The trend is up since October 2025, but capped: the market sits ~8.5% below the 688¢ spike high and has been rejected there every time.
- Better-than-it-looks case: managed money is heavily net short (67,561 contracts as of 2026-06-30, CFTC primary data) — a bullish USDA July WASDE or a weather shock could force a short-covering rally.
- Worse-than-it-looks case: the futures curve is in unbroken contango, so a long holder loses roughly 8–9% per year to roll drag alone; a WEAT holder loses that plus the ~1.00%/yr management fee, so spot wheat has to rise more than ~9–10%/yr just to break even in total return.
- Missing evidence: weather / crop progress (USDA Crop Progress, NOAA drought monitors), the USDA July WASDE, and Black Sea export flow volumes were not pulled in this run. The single highest-value forthcoming data point is the July WASDE.
- One thing to watch next: the July 2026 contract (ZWN26) expires 14 July 2026 — two days from the run date. Any July position must roll to Sep'26 (ZWU26, 640.25¢) immediately; the thesis should be stated in Sep or Dec contract terms, not the expiring July front.

---

## Plain-English Glossary

- **Front-month futures contract:** the exchange-traded contract with the nearest delivery date; it is where price discovery is tightest.
- **Contango:** a futures curve shape where contracts delivering later are priced higher than contracts delivering sooner. It means holding a long position through the roll locks in a loss.
- **Roll / roll drag:** when the near contract is about to expire, a long holder sells it and buys the next one out. If the next one is more expensive (contango), the holder pays up each roll — that recurring cost is the drag.
- **Backwardation:** the opposite curve shape — later contracts priced below nearer ones, usually a sign of a near-term physical shortage.
- **Managed-money net short (CFTC COT):** large speculators' net position, as reported weekly by the US regulator (Commitments of Traders). A net short of 67,561 contracts means shorts exceed longs by that amount.
- **Gross expense ratio (~3.64%/yr for WEAT):** the true all-in annual cost of holding the fund, including brokerage and embedded costs — much higher than the headline 1.00% management fee. It is what actually comes out of returns.
- **Basis points (bp):** hundredths of a percent; 100 bp = 1%. Used in the synthesis for margin-style comparisons.
- **USDA WASDE:** the US Department of Agriculture's monthly World Agricultural Supply and Demand Estimates — the primary official read on wheat supply, demand, and stocks.
