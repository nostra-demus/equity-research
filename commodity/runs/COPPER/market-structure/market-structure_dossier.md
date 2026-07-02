# market-structure Module Dossier — COPPER

> Deterministic, lossless concatenation of every artifact in this module — the module synthesis and every specialist output, in order. Generated mechanically (no LLM rewriting), so nothing is omitted or paraphrased. This is the module's "see everything" tier; the module's decision lives in `99_*-synthesis.md` and the short read in `market-structure_memo.md`.

- Generated: 2026-07-02T15:41:17Z
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

# Market Structure — COPPER (module synthesis)

## Abstract

LME Copper Grade A sits at approximately $13,202/t (~613¢/lb COMEX) as of 2026-07-02 — up roughly 30–38% from a year ago but about 9% below the January 29, 2026 all-time record of $14,527.50/t, and down more than 6% from the early-June 2026 high. The near-term trend is a softening consolidation within a wide $12,000–$14,500/t range, with no clear directional breakout. The futures curve has shifted into contango — both the COMEX HG term structure (front-to-Dec '26 premium ~$0.15/lb) and the LME cash-to-3M spread (cash trailing 3M by roughly $36–$94/t) — imposing an estimated roll drag of approximately −5% annualised on a rolled long, on top of CPER's ~0.97% annual fee, for a total holding cost of roughly 6% per year relative to spot in a flat market. For direct, liquid, low-cost copper exposure, COMEX HG front-month futures remain the cleanest instrument; CPER is the practical alternative where futures access is unavailable, but the long-run gap vs spot (≈21 percentage points since inception) is structural and not trivial.

---

## Price & Trend

**Current level:** LME Cash ~$13,202/t (~613¢/lb) as of 2026-07-02. [Westmetall citing LME cash settle, 2026-07-02, unverified web; TradingEconomics COMEX, 2026-07-01, unverified web] COMEX front-month (HGN26 / Jul '26) quoted near $6.13/lb, consistent with the LME reference at the prevailing LME–COMEX arb. [TradingEconomics / COMEX, 2026-07-01, unverified web]

**Year-on-year move:** Up roughly 30–38% from the July 2025 LME range of $9,535–$10,120/t. [Zamak.us LME 2025 data, unverified web]

**52-week range:** $9,535/t (August 2025 low) to $14,527.50/t (January 29, 2026 record high). [Zamak.us LME 2025; Bloomberg / Benchmark Minerals citing LME, 2026-01-29, unverified web] Current price sits at roughly 66% of the 52-week range — near the middle of the band, not at extremes. [02_commodity-price-curve.md]

**Trend narrative:** The 12-month direction is sharply higher, but the intra-2026 pattern is a series of sharp peaks then reversals:
- The January 29, 2026 all-time record ($14,527.50/t) was driven by US tariff-front-running, mine disruptions, and speculative buying.
- A pullback through April 2026 brought the monthly average to $12,499/t — the lowest of 2026 — as tariff uncertainty weighed.
- A second surge through late May (touching $14,097/t on May 29) faded as the June 30 US tariff-decision date passed.
- As of July 2, 2026, copper sits in a consolidating range with the immediate cluster at $13,300–$13,400/t as the near-term pivot. [02_commodity-price-curve.md]

**Key technical references (for context; not fundamentals):**
- Range floor: $12,147/t (April 2, 2026 LME cycle low; the "tariff washout" support). [Zamak.us LME monthly data, 2026-04, unverified web]
- Near-term pivot: $13,371/t (LME 3M close, June 24, 2026). [TradingKey citing LME close, 2026-06-24, unverified web]
- 200-day moving average: ~$12,800/t LME-equivalent / ~$5.81/lb COMEX. Current price is roughly 5–6% above this level — supportive but the cushion has narrowed. The 50-day MA (~$13,967/t) now sits above current price, confirming near-term softening. [Barchart COMEX HGU26 technical data, 2026-07, unverified web]

**Bottom line on trend:** Medium-term uptrend (30–38% YoY) intact but the price is consolidating well below its January and May peaks. Near-term direction is soft. No new leg up is proven from available data.

---

## Futures Curve / Term Structure

### COMEX HG curve (US¢/lb, as of 2026-07-02)

| Contract | Price (¢/lb) | $/t (LME-equivalent) | Source |
|---|---|---|---|
| Jul '26 (HGN26) — front | ~613¢ | ~$13,517/t | TradingEconomics / COMEX, 2026-07-01 [unverified web] |
| Sep '26 (HGU26) | ~618¢ | ~$13,627/t | Google Finance HGU26, 2026-07-02 [unverified web] |
| Dec '26 (HGZ26) | ~628¢ | ~$13,848/t | Web aggregate citing Google Finance HGZ26, 2026-07 [unverified web] |
| Mar '27 (HGH27) | ~643¢ | ~$14,178/t | Web aggregate citing CME / Google Finance HGH27, 2026-07 [unverified web] |

[02_commodity-price-curve.md]

### LME cash-to-3M spread (as of 2026-07-02)

Cash minus 3M: approximately −$36/t to −$94/t (bid: −$93.51; trade: −$36.01). **Shape: contango.** [MetalRadar citing LME, 2026-07-02, unverified web]

### Curve interpretation

**The curve is in contango.** This is a meaningful change from the first half of 2026, when the LME cash-to-3M spread intermittently moved into deep backwardation as metal was pulled toward the US ahead of tariff deadlines (the spread hit +$345/t backwardation on 2026-06-23). [SMM/metal.com citing LME, 2026-06-23, unverified web]

The contango is consistent with the current supply picture: COMEX warehouse inventories stand at a record ~652,000 t, and three-exchange visible stocks (LME + COMEX + SHFE combined) exceeded 1 million tonnes — the highest level since 2004. [02_commodity-price-curve.md] Ample near-term availability outside the US (a product of tariff-driven US inventory build) has removed the prompt tightness that characterised mid-2026, and the futures market is pricing normal cost of carry.

**Roll drag, quantified:** Front-to-Sep (2-month hop): ~$0.05/lb premium, annualised drag ≈ −4.9%. Front-to-Dec (5-month hop): ~$0.15/lb premium, annualised drag ≈ −5.9%. Central estimate: **approximately −5% annualised roll cost** for a mechanically rolled long position. [02_commodity-price-curve.md]

**Implication for CPER:** CPER's SummerHaven smart-roll methodology reduces but does not eliminate this cost. Add the ~0.97% annual fee: total drag on a flat-price copper holding via CPER is roughly **−6% per year** relative to spot. The long-run evidence confirms this: since inception, spot copper has outperformed CPER by approximately 21 percentage points cumulatively. [SEC 424B3 prospectus, CPER, 2026; 24/7 Wall St. citing CPER returns, 2026-04-04, unverified]

**Watch for the flip:** If new US tariffs on refined copper trigger a fresh wave of frontloading, the prompt LME market could tighten and the spread could narrow toward backwardation. That scenario would reduce roll drag and improve the economics of a rolled long. The Goldman Sachs scenario cited in `02_commodity-price-curve.md` — phased 15%/30% US tariffs in Jan 2027 / Jan 2028 — is the primary trigger to watch. [02_commodity-price-curve.md]

---

## Instruments & Cleanest Exposure

### Instrument map

| Instrument | Type | Key cost / drag | Main divergence from LME spot |
|---|---|---|---|
| LME Copper Cash / 3M forward | Direct spot / prompt (LME ring member access required) | Brokerage only | IS the benchmark. Delivery-point and warrant charges may vary slightly. |
| COMEX HG front-month futures | Exchange futures (financially/physically settled) | Roll cost (explicit, ~−5% annualised in current contango); exchange fees ~$1–2/contract retail | LME–COMEX arb basis (typically $50–200/t; can blow out on tariff shocks). |
| COMEX E-mini QC / Micro MHC | Smaller futures (cash settled) | Same roll and basis as HG | 1/4 and 1/10 contract size vs HG; suited to smaller positions. |
| CPER (US Copper Index Fund) | Futures-based ETF (COMEX) | ~0.97% p.a. fee + smart-roll drag (≈21 pp long-run gap vs spot) | COMEX-benchmarked (not LME); monthly rebalance; K-1 tax form. |
| COPX (Global X Copper Miners ETF) | Equity ETF (~46 mining equities) | 0.65% p.a. | NOT the metal: adds operating leverage, equity beta, balance-sheet risk, by-product noise. A 10% copper move can mean 20–30%+ in COPX. |
| FCX (Freeport-McMoRan) | Single-stock equity miner | N/A (equity) | ~75% copper revenue; adds gold (~1.6 mn oz/yr), molybdenum, Indonesia political risk, Grasberg operational risk, management/capex cycle. [FCX Q1 2025 earnings release, 2025-04-23] |
| SHFE Copper (CU) | Futures (RMB/t, physically settled) | None at contract level | Not directly accessible to non-PRC entities. Reflects China domestic price, VAT (~13%), import duty, and CNY/USD FX. |

[01_commodity-instruments.md]

### Cleanest instrument

**COMEX HG front-month futures** is the cleanest expression of a copper price view for a non-LME-ring-member:
- Liquidity: ~147,500 contracts open interest, ~42,600 contracts average daily volume (mid-2026). [Web: CNBC/TradingView citing CME data, 2026, unverified] Front month (HGU26 / Sep '26) is the most liquid single expiry.
- Roll cost: explicit and under the investor's control. Currently at a drag in contango — the investor can manage this by choosing roll timing and contract.
- Fee: zero management fee; exchange fees only.
- Basis note: for a portfolio benchmarked to LME Cash, COMEX HG carries a LME–COMEX basis risk. LME 3M forward (via an LME ring member) is the purer benchmark hedge; COMEX HG is the practical liquid alternative for most US-based portfolios.

**CPER** is appropriate when direct futures access or margin is unavailable, or when 1099 rather than K-1 tax treatment is needed — at the structural cost of the ~0.97% fee and roll-tracking drag. In the current contango, total holding cost is approximately 6% annualised vs spot. The long-run gap of ~21 percentage points vs spot since inception is a material consideration for multi-year holds.

**COPX and FCX** are suitable only if the thesis is specifically about copper mining equities, not the metal. Both add substantial equity-market beta and operating leverage on top of the commodity signal — they do not express a pure copper price view.

[01_commodity-instruments.md, §4]

---

## Reconciliation & Gaps

### Price-level reconciliation

The triage file (00) stated a benchmark spot of $13,170/t as of 2026-07-01. The price-curve file (02) gives $13,202/t as of 2026-07-02. The $32/t difference ($13,202 − $13,170) is fully explained by the one-day time difference and normal intraday/daily price movement; there is no contradiction. Per MODULE_RULES §2, the exchange/official figure is preferred: both are web sources citing LME official prices; the price-curve file's more recent date ($13,202/t, 2026-07-02) is used in this synthesis.

### COMEX front-month label

The triage file does not specify a COMEX contract price. The instruments file (01) references mid-2026 open interest without a specific price. The price-curve file (02) provides the COMEX HG curve with Jul '26 front-month at ~$6.13/lb (~$13,517/t LME-equivalent). No contradiction across files; the price-curve file is the primary source for curve levels.

### Backwardation vs contango: apparent timeline conflict

The instruments file (01) mentions the LME cash-to-3M spread hitting +$345/t backwardation on 2026-06-23, alongside a separate mention of ~$64/t backwardation on 2026-07-16 (a future date in the filing, possibly a forward-looking estimate or a typo — the July 16 date has not arrived as of 2026-07-02). The price-curve file (02) — the dedicated price-structure specialist — reports the spread as −$36 to −$94/t contango as of 2026-07-02. These are consistent: the LME spread was briefly in backwardation on or around June 23, 2026, and has since moved back into contango by July 2, 2026. The July 16 reference in the instruments file is treated as unverified and forward-looking; it does not affect the current curve read. **Current shape: contango.** The price-curve specialist's observation is used as authoritative for today's curve.

### ICSG balance (from triage)

The triage file (00) cites an ICSG projection of a 2026 refined copper surplus of ~96,000 mt, revised from a prior 150,000 mt deficit. This supply/demand balance is NOT repeated or contradicted by the instruments or price-curve files — those files address price and instruments. The ICSG balance is noted here as background; it is the domain of the supply/demand module and should be carried forward by the thesis module.

### Missing data

- **Exact COMEX settle prices for deferred contracts:** Sep, Dec '26, and Mar '27 prices are web-aggregated Google Finance quotes (unverified). Exact CME Group settlement prices should be confirmed before any roll-timing decision. Confidence: medium.
- **LME cash-to-3M spread:** sourced from MetalRadar (unverified web, specialist metals source). The direction (contango) is confirmed by consistency with COMEX curve and inventory conditions. Exact spread level should be confirmed against LME official settlement data.
- **LME warehouse stocks (daily series):** the triage file noted these are reachable but not fully fetched. The data quality note in the price-curve file references a three-exchange total above 1 million tonnes — a directionally significant figure — but exact LME lot counts are not from primary LME warehouse reports in these files.
- **SHFE price:** not fetched; denominated in RMB and not accessible to non-PRC investors directly. The LME–SHFE arb is unreported in the specialist files.
- **CFTC COT positioning detail:** mentioned in the triage file (managed-money net long ~66,547 contracts as of 2026-06-23) but not carried into the price or instruments files. The full positioning read is a dedicated module input.

---

## Note to the Commodity Thesis

- **Curve is in contango, ~−5% annualised roll drag on any rolled long copper position (CPER or direct COMEX HG rolling).** Add CPER's ~0.97% annual fee for a total drag of roughly 6% per year vs spot in a flat market. A copper price view via CPER needs roughly 6% of annual price appreciation just to break even — this should be a hard input into the expected-return calculation.

- **The metal has cooled from its twin 2026 peaks ($14,527/t in January, ~$14,097/t in late May) and now sits in a wide consolidation range (~$12,000–$14,500/t), with the 50-day MA above the current price.** Near-term price direction is soft; there is no confirmed new leg up from available data. Any bullish thesis must address what catalyst closes the $1,300/t gap to the record high.

- **The ICSG projects a 2026 refined copper surplus of ~96,000 mt** (triage file, 00, citing ICSG mid-2026 forecast) — a swing from a previously projected deficit. This is a fundamental headwind to a pure bull thesis and must be adjudicated against any demand-side or supply-disruption argument the other modules surface.

- **For instrument selection:** COMEX HG front-month futures is the cleanest expression if direct futures access is available. CPER is the practical fallback (0.97% fee + roll drag; issues K-1; ~21 pp long-run gap vs spot). COPX and FCX are equity plays, not commodity plays — using them as a copper substitute adds operating leverage and equity-market beta that are not in the commodity thesis.



---

## market-structure / 00_commodity-triage.md

_Source: `00_commodity-triage.md`_

# Commodity Triage — COPPER

## 1. Identity

| Item | Value | Source |
|---|---|---|
| Benchmark / grade | LME Copper Grade A (USD/tonne) — global benchmark; COMEX HG (US¢/lb); SHFE (RMB/tonne, China) | COMMODITY_PROFILES.md ## COPPER |
| Quote unit + currency | USD per tonne (LME); also express in US¢/lb (COMEX); track LME–COMEX and LME–SHFE arbs | COMMODITY_PROFILES.md ## COPPER |
| Primary exchange(s) | LME (London Metal Exchange); COMEX (CME Group); SHFE (Shanghai Futures Exchange) | COMMODITY_PROFILES.md ## COPPER |
| Applicable lenses (from profile) | Market structure (LME cash–3M spread, warehouse stocks, TC/RCs); Supply/demand (mine supply, scrap, ICSG balances); Macro drivers (China demand, USD, real rates, electrification); Positioning/flows (COMEX COT, LME COTR, CPER flows); Valuation (90th-pct mine cost floor + incentive price) | COMMODITY_PROFILES.md ## COPPER |

## 2. Instruments (from profile)

| Instrument / ticker | Type (futures/ETF/spot/equity proxy) | Exposure | Notes |
|---|---|---|---|
| `CPER` (US Copper Index Fund) | ETF (futures-based) | Direct copper via COMEX futures + roll | Tracks COMEX copper; carries roll drag |
| LME Copper (Cash / 3-Month) | Futures / spot | Direct physical-market benchmark | The global price setter; cash–3M spread is the tightness signal |
| COMEX `HG` futures | Futures | US curve expression | US¢/lb quote; carries roll |
| `COPX` (Global X Copper Miners ETF) | Equity proxy | Miner equities | Levered proxy — not the metal; own operating risk on top |
| `FCX` (Freeport-McMoRan) and diversified peers | Equity proxy | Individual miner | Levered, equity-risk proxy; not the commodity directly |

## 3. Data Reachability

| Lens | Primary source checked | Found? | As-of date |
|---|---|---|---|
| Benchmark price (LME spot) | LME via web (metalcharts.org / zamak.us citing LME) | Yes — $13,170/t | 2026-07-01 |
| Supply/demand balance | ICSG (International Copper Study Group) via icsg.org / recyclingtoday.com | Yes — ICSG projects 2026 refined copper surplus of ~96,000 mt (revised from prior 150,000 mt deficit) | 2026 forecast (published mid-2026) |
| Positioning (CFTC COT) | CFTC.gov via indexbox.io COT report summary | Yes — COMEX HG managed-money net long ~66,547 contracts (82,442 long, 15,895 short) | 2026-06-23 |
| Warehouse stocks / market structure | LME, COMEX, SHFE weekly stocks (to be fetched by dedicated agents) | Reachable — LME/SHFE publish weekly; not fully fetched at this triage stage | — |
| Macro drivers | FRED, China PMI, DXY — all reachable via standard public sources | Reachable | — |

## 4. Local pool (data/COPPER/)

- None — directory does not exist. Running on live public sources only.

## 5. Sufficiency Verdict

- **Verdict:** Sufficient
- **Reason:** COPPER has a full profile section; a current LME benchmark price ($13,170/t as of 2026-07-01) is confirmed from LME-sourced data, and both a primary supply/demand source (ICSG 2026 balance) and CFTC COT positioning data (June 23, 2026) are reachable and recently dated.
- **Missing (if Partial/Insufficient):** None — all five profile-mandated lenses have reachable primary sources; warehouse-stock granularity (LME/COMEX/SHFE weekly series) is routine and will be fetched by downstream agents.



---

## market-structure / 01_commodity-instruments.md

_Source: `01_commodity-instruments.md`_

# Instruments & Exposure Map — COPPER

## 1. Benchmark & Contract

**Benchmark grade:** LME Copper Grade A — electrolytic copper cathode, minimum 99.9935% purity, deliverable in LME-registered warehouses globally.

**Quote unit / currency:**
- LME: USD per metric tonne ($/t). Front-month reference: LME Cash (spot) and the 3-month forward prompt.
- COMEX: US cents per pound (¢/lb). 1 $/t ≈ 0.4536 ¢/lb; equivalently 1 ¢/lb ≈ $22.05/t.
- SHFE: RMB (yuan) per tonne.

**Spot reference as of 2026-07-01:** LME Cash ~$13,170/t (~597 ¢/lb). [Web: metalcharts.org citing LME official prices, 2026-07-01, indicative / unverified]

**Front-month contract + tick:**
- LME Cash–3M: The LME does not trade fixed-month contracts in the conventional sense; instead, it offers daily prompt dates out to 3 months and monthly 3rd-Wednesday prompts out to 63 months. The key liquid references are the **Cash price** and the **3-month (3M) forward**. Minimum tick: $0.50/t ($12.50 per lot of 25 t) on LME Select; $0.01/t on inter-office telephone trades. [LME contract specifications, 2026]
- COMEX HG: 25,000 lb per contract; tick = $0.0005/lb = $12.50 per contract. Monthly contracts out to 15 months ahead; most open interest concentrates in the front two or three months. [CME Group, COMEX Copper Contract Specs, 2026]
- SHFE: 5 tonnes per lot; RMB/tonne. [SHFE contract specifications, 2026]

---

## 2. Instrument Map

| Instrument | Type | Exchange | Tracks | Fee | Main divergence from spot | Source |
|---|---|---|---|---|---|---|
| LME Copper Grade A Cash | Physical-delivery spot / prompt | LME (London) | Physical copper spot — the global price benchmark | None (direct; brokerage only) | IS the benchmark; warehouse location premium / discount and LME warrant charges may differ slightly from a specific delivery point | [LME contract specifications, 2026] |
| LME Copper 3-Month forward | Rolling forward contract | LME (London) | Copper price 3 months forward; cash–3M spread signals physical tightness | None at contract level (brokerage only) | Cash–3M spread: in contango (3M > Cash) you pay a roll cost; in backwardation (Cash > 3M) you earn a roll gain. Recent: Cash–3M hit +$345/t backwardation on 2026-06-23; 2026-07-16 backwardation ~$64/t | [SMM/metal.com citing LME, 2026-06-23 and 2026-07-16, unverified] |
| COMEX HG futures (front month) | Futures (financially/physically settled) | COMEX/CME (New York) | US copper curve; tracks LME but in ¢/lb; subject to LME–COMEX arb | None at contract level (brokerage/margin only) | LME–COMEX arb (typically $50–200/t spread, can blow out on tariff/logistics shocks); own roll cost when rolling from front month | [CME Group COMEX Copper Specs, 2026] |
| COMEX E-mini Copper (QC) | Mini-futures (cash settled) | COMEX/CME | COMEX HG copper curve at 1/4 size (6,250 lb) | None at contract level | Same roll and LME–COMEX basis as HG; cash settlement eliminates physical delivery | [CME Group E-mini Copper, 2026] |
| COMEX Micro Copper (MHC) | Micro-futures (cash settled) | COMEX/CME | COMEX HG copper at 1/10 size (2,500 lb) | None at contract level | Same basis and roll as HG; suited to smaller accounts | [CME Group Micro Copper, 2026] |
| SHFE Copper (CU) | Futures (physically settled) | SHFE (Shanghai) | Chinese domestic copper price in RMB/t; reflects SHFE warehouse stocks, China VAT, and import duty | None at contract level | LME–SHFE spread ("arb window") reflects import parity, FX (CNY/USD), VAT (~13%), and duties; SHFE price is not directly accessible to non-Chinese entities without a PRC account | [SHFE contract specifications, 2026] |
| CPER (US Copper Index Fund) | Futures-based ETF (commodity pool) | NYSE Arca | SummerHaven Copper Index Total Return (SCITR): 1–3 COMEX HG futures contracts selected monthly by a rules-based momentum/carry signal to minimise contango drag | ~0.97% p.a. total expense ratio | (1) Futures roll drag vs spot: smart roll reduces but does not eliminate contango cost — since inception spot copper +64.87% vs CPER +43.84% (≈21 percentage-point long-run gap). (2) Monthly rebalancing introduces tracking variance vs any single contract. (3) Issues K-1 tax form (not 1099). (4) AUM ~$740–$805 mn (2026); moderate liquidity | [SEC 424B3 prospectus, CPER, 2026; 24/7 Wall St. citing CPER since-inception returns, 2026-04-04, unverified] |
| COPX (Global X Copper Miners ETF) | Equity ETF | NYSE Arca | Solactive Global Copper Miners Total Return Index (~46 copper mining equities globally) | 0.65% p.a. | NOT the metal: tracks miner equities. Adds equity-market beta, individual operating leverage, balance-sheet risk, management risk, and gold/moly by-product noise. Top holdings as of 2026: Lundin Mining 6.1%, Glencore 6.0%, Sumitomo Metal Mining 6.0%, KGHM 5.8%, Freeport-McMoRan (FCX) 5.1%. A 10% copper-price move can translate to a 20–30%+ move in COPX (operating leverage), in either direction. AUM: large (6-month net AUM change +$2.5 bn) | [SEC Form 497K, Global X Copper Miners ETF, 2026; Yahoo Finance holdings, 2026, unverified] |
| FCX (Freeport-McMoRan Inc.) | Single-stock equity (copper miner) | NYSE | FCX's own net copper production (~4.0 bn lb/year in 2025); also produces gold (~1.6 mn oz) and molybdenum | N/A (equity; normal brokerage) | Layered divergence from copper price: (1) operating leverage (high fixed costs); (2) gold and moly revenues ~23% of 2025 revenue; (3) 2025 Grasberg mud-rush disruption reduced output; (4) individual governance, capex cycle, and Indonesia political risk; (5) equity-market beta. Copper revenue ≈75% of 2025 total | [FCX 8-K, FY2025 results; FCX Q1 2025 earnings release, 2025-04-23] |

---

## 3. Portfolio Instrument → Underlying

| Held instrument | Mechanism (what it holds) | Fee | How it can diverge from the commodity |
|---|---|---|---|
| **CPER** (US Copper Index Fund) | Holds 1–3 COMEX HG copper futures contracts selected monthly by the SummerHaven Copper Index (SCITR). The index applies rules-based momentum and carry signals to pick which contracts on the COMEX curve (currently Sep 26, Dec 26, Mar 27 as of June 2026) to hold, aiming to roll into contracts showing backwardation or least contango. Collateral is parked in T-bills. Issues K-1. | ~0.97% p.a. total expense ratio (management fee + ops). [Web: multiple sources; most recent SEC 10-Q FY2026 filing references this range, unverified exact figure pending 10-Q retrieval] | **(1) Roll drag:** even with smart-roll methodology, contango periods impose a negative roll yield — the fund buys a more expensive deferred contract and the premium erodes as that contract approaches expiry. Over the period since inception, spot copper outperformed CPER by approximately 21 percentage points cumulatively (spot +64.87%, CPER +43.84%). **(2) Expense drag:** the 0.97% annual fee accrues daily and compounds against returns. **(3) Curve position risk:** the monthly rebalance picks 1–3 contracts; if the index switches from front to deferred during a sudden backwardation spike, CPER can underperform a direct front-month position. **(4) K-1 tax complexity** may deter some holders around year-end, affecting price/NAV. **(5) Basis to LME spot:** CPER tracks the COMEX HG curve, not the LME; in periods of LME–COMEX arb dislocation (e.g., US import-tariff threat periods in 2025–2026), CPER's NAV can diverge materially from the LME benchmark that most market observers quote. |

Note: If the portfolio holds **COPX** or **FCX** as copper proxies, these track miner equities, not the metal directly. Both add a substantial equity-market and operating-leverage layer on top of the copper price signal — see row 7–8 of the Instrument Map above.

---

## 4. Cleanest Expression

**Cleanest expression of a copper price view:** A **direct COMEX HG futures position** (front or near-term deferred month) is the most precise, liquid, and lowest-cost instrument for expressing a copper price view.

- **Liquidity:** COMEX HG carries ~147,500 contracts open interest and ~42,600 contracts daily volume as of mid-2026. [Web: CNBC/TradingView citing CME data, 2026, unverified] The front-month (currently Sep 2026 = HGU26) is the most liquid single expiry.
- **Roll cost:** You bear the explicit roll yield — positive in backwardation (as prevailing through June–July 2026), negative in contango. The roll is transparent and under your own control (you choose when and where on the curve to roll).
- **Fee:** Zero management fee; exchange fees only (~$1–2/contract round-turn retail, lower institutional).
- **LME benchmark:** For a portfolio benchmarked to the LME Cash price, note the persistent LME–COMEX arb (typically $50–200/t; expanded dramatically on US tariff fears in 2025). If the benchmark is LME-quoted, HG futures carry a basis risk. In that case, LME 3M forward (accessed through an LME ring member) is the purest hedge. For most US-based portfolios, COMEX HG is the practical liquid instrument.
- **CPER vs HG direct:** CPER is appropriate when (a) futures margin/account structure is not available, or (b) tax treatment as a security (rather than 60/40 futures tax) is needed — at the cost of a ~0.97% annual fee drag and residual roll tracking error vs spot. The long-run cost is measurable (≈21 pp since inception) and structural.
- **COPX / FCX:** Only suitable if the thesis is specifically about copper mining equities (not the metal); adds equity beta, company-specific, and multiple-expansion/contraction risk that is not in the commodity thesis.

**Bottom line:** COMEX HG front-month futures for a direct commodity view; CPER if direct futures access is unavailable; COPX/FCX only as an explicitly equity/leverage play.

---

## 5. Sources

- [CPER prospectus (SEC 424B3), United States Commodity Index Funds Trust, 2026](https://www.sec.gov/Archives/edgar/data/0001479247/000207187626000122/i26205_cper-424b3.htm)
- [USCF Investments — CPER fund page](https://www.uscfinvestments.com/cper)
- [CME Group — COMEX Copper Contract Specifications, 2026](https://www.cmegroup.com/markets/metals/base/copper.contractSpecs.html)
- [CME Group — Micro Copper Futures (MHC)](https://www.cmegroup.com/markets/metals/base/micro-copper.html)
- [LME Copper Contract Specifications](https://www.lme.com/en/metals/non-ferrous/lme-copper/contract-specifications)
- [SHFE Copper Contract Specifications](https://tsite.shfe.com.cn/eng/market/futures/metal/cu/)
- [Global X Copper Miners ETF (COPX) — SEC Form 497K, 2026](https://www.sec.gov/Archives/edgar/data/0001432353/000143235326000197/a497kcopperminers.htm)
- [FCX Q1 2025 Earnings Release (8-K), Freeport-McMoRan, 2025-04-23](https://mms.businesswire.com/media/20250423627211/en/2447940/1/FCX_250424_1Q_2025_Earnings_Release.pdf)
- [24/7 Wall St. — "CPER Returned 138% Over 10 Years, But Copper Miners Left It in the Dust", 2026-04-04 (unverified)](https://247wallst.com/investing/2026/04/04/cper-returned-138-over-10-years-but-copper-miners-left-it-in-the-dust/)
- [SMM/metal.com — LME cash-3M copper spread data, 2026-06-23 and 2026-07-16 (unverified)](https://news.metal.com/newscontent/103265539/lme-cash-3m-metal-spreads-and-open-interest-movements-on-april-7)
- [metalcharts.org — LME Copper spot price, 2026-07-01 (unverified)](https://metalcharts.org/lme-copper-price)
- [Seeking Alpha — "CPER: Understanding The Structure And Suitability Of This Commodity ETF" (unverified)](https://seekingalpha.com/article/4858531-cper-understanding-the-structure-and-suitability-of-this-commodity-etf)



---

## market-structure / 02_commodity-price-curve.md

_Source: `02_commodity-price-curve.md`_

# Price Trend & Term Structure — COPPER

As of 2026-07-02. Benchmark: LME Copper Grade A (USD/tonne); also expressed in COMEX HG (US¢/lb).

---

## 1. Price Now & Trend

| Horizon | Level (LME $/t) | Level (COMEX ¢/lb) | Change | Source |
|---|---|---|---|---|
| Spot / front-month | $13,202/t | ~613¢/lb | — | Westmetall citing LME cash settle, 2026-07-02; TradingEconomics COMEX, 2026-07-01 [unverified web] |
| 1 month ago | ~$13,966/t peak (May); ~$13,819/t on June 1 | ~650¢/lb | −6.1% from June 1; −5.5% from June peak | Westmetall / Zamak.us LME daily data, 2026-06-01 [unverified web] |
| 3 months ago | ~$12,499/t (April 2026 avg) | ~549¢/lb avg | +5.6% vs April average | Zamak.us LME monthly average, 2026-04 [unverified web] |
| 6 months ago | ~$13,085/t (January 2026 avg) | ~575¢/lb avg | +0.9% vs January average | Zamak.us LME monthly average, 2026-01 [unverified web] |
| 12 months ago | ~$9,535–10,120/t (July 2025 range) | ~432–459¢/lb | +~30–38% YoY | Zamak.us LME 2025 data [unverified web] |
| 52-week range | $9,535/t (Aug 2025 low) — $14,527/t (Jan 29, 2026 record high) | ~432¢/lb — ~671¢/lb | Current sits at ~66% of the 52-week range | Zamak.us LME 2025; Bloomberg / Benchmark Minerals citing LME, 2026-01-29 [unverified web] |

**Trend read.** Copper has risen sharply over the past 12 months — up roughly 30–38% in LME terms — but the move has not been smooth. The metal broke its all-time record on January 29, 2026, when the LME three-month price hit $14,527.50/t, driven by a combination of US tariff-front-running, mine disruptions, and speculative buying. The rally then ran out of steam. By April 2026, prices had pulled back to an average of $12,499/t (the lowest monthly average of 2026), as tariff uncertainty and global macro pressure weighed. A second surge through May and June — the LME touched $14,097/t on May 29 — gave way again as the US June 30 tariff-decision date passed. As of July 2, 2026, the metal sits at approximately $13,202/t: well above its year-ago level but roughly $1,300/t — about 9% — below the all-time peak, and down more than 6% from the most recent June 1 reference point. The dominant recent direction is a softening from the early-2026 and late-May highs, with the market consolidating in a wide $12,000–$14,500/t band.

---

## 2. Technical Levels (chart context, not fundamentals)

**Level 1 — $12,147/t ($5.51/lb COMEX): April 2026 cycle low / tariff-floor support.**
This is the lowest LME close of 2026 (April 2, 2026), reached when market participants feared trade-war demand destruction after the April 2 US tariff announcement. The level has since been retested and held; it functions as the range floor and is widely cited by metals desks as the "tariff washout" support. A break below here would put the 2025 lows (~$9,535/t) back in view over a longer time horizon. [Zamak.us LME monthly data, 2026-04 — unverified web]

**Level 2 — $13,371/t: the June 24 LME close / near-term reference.**
The LME three-month contract closed at exactly $13,371/t on June 24, 2026 — the most recently cited daily close from a primary-sourced report — just as the US Section 232 tariff deadline generated intraday volatility. This level acts as a short-term pivot: the price has been oscillating around it in late June and early July. Market commentary treats $13,300–$13,400/t as the immediate support/resistance cluster for the current range. [TradingKey citing LME close, 2026-06-24 — unverified web]

**Level 3 — 200-day moving average (~$5.81/lb / ~$12,800/t on COMEX HG Sep '26).**
The 200-day moving average for COMEX HG (Sep '26 contract, as reported by Barchart) stands at ~$5.81/lb, equivalent to roughly $12,800/t on an LME basis. This level served as the price floor in the April 2026 sell-off and is broadly watched by technical traders as the line separating the ongoing bull-market structure from a cyclical breakdown. As of early July 2026, the front-month is trading roughly 5–6% above this average, which is supportive but no longer the wide cushion it provided in mid-2025. The 50-day MA (~$6.34/lb / ~$13,967/t) is now above the current price, confirming the near-term softening. [Barchart COMEX HGU26 technical data, 2026-07 — unverified web]

---

## 3. Futures Curve / Term Structure

### COMEX HG curve (US¢/lb), as of July 2, 2026

| Contract | Approx. price (US¢/lb) | Approx. price ($/t LME-equivalent) | Source |
|---|---|---|---|
| Jul '26 (HGN26) — front | ~$6.13/lb | ~$13,517/t | TradingEconomics / COMEX, 2026-07-01 [unverified web]; Google Finance HGU26 range $6.12–$6.23 |
| Sep '26 (HGU26) | ~$6.18/lb | ~$13,627/t | Google Finance HGU26, 2026-07-02 [unverified web] |
| Dec '26 (HGZ26) | ~$6.28/lb | ~$13,848/t | Web search aggregate citing Google Finance HGZ26, 2026-07 [unverified web] |
| Mar '27 (HGH27) | ~$6.43/lb | ~$14,178/t | Web search aggregate citing CME/Google Finance HGH27, 2026-07 [unverified web] |

Note: Deferred-contract prices above are drawn from web-aggregated Google Finance quotes (unverified). The front-month $6.13/lb is consistent with multiple sources (TradingEconomics, TradingKey, CNBC @HG.1) and is used as the anchor.

### LME cash-to-3-month spread, as of July 2, 2026

| Spread | Level | Shape | Source |
|---|---|---|---|
| LME cash minus 3-month | ~−$36 to −$94/t (bid: −$93.51; trade: −$36.01) | Contango (cash below 3-month) | MetalRadar citing LME, 2026-07-02 [unverified web] |

**Shape: contango.** Both the COMEX curve and the LME cash-to-3-month spread are in contango as of July 2, 2026. On COMEX, the front month (~613¢/lb) is priced roughly $0.05/lb below Sep '26 and ~$0.15/lb below Dec '26, with Mar '27 at a ~$0.30/lb premium to the front. On LME, the cash price sits $36–94/t below the three-month forward (the wide bid-ask range is normal for the LME spread market). This is a distinct shift from the January–early June 2026 period, when LME spreads intermittently moved into backwardation as front-end metal was drawn toward the US ahead of tariff deadlines.

**Annualised roll yield (COMEX, indicative).** Front (~613¢) vs Dec '26 (~628¢, 5 months out): the premium is ~$0.15/lb over 5 months, implying an annualised roll COST of approximately ($0.15 ÷ $6.13) × (12 ÷ 5) ≈ **−5.9% per year** for a rolled long who mechanically rolls from front to the next liquid month. Using the shorter front-to-Sep hop ($0.05/lb over 2 months): annualised drag ≈ ($0.05 ÷ $6.13) × (12 ÷ 2) ≈ **−4.9% per year**. A reasonable central estimate for the current roll drag is **approximately −5% annualised**. This is labelled a cost because a long who rolls is selling the lower-priced front and buying the higher-priced deferred — they give up the spread on each roll.

**What the curve structure implies.**

Contango at this point of the copper price cycle — with COMEX inventories at a record ~652,000 t and three-exchange visible stocks above 1 million tonnes for the first time since 2004 — is consistent with the supply picture. The concentration of metal inside the US (tariff front-running) has left ample near-term global availability outside the US, and the futures market is pricing in normal cost-of-carry (storage and financing). This is not what a genuinely tight physical market looks like: true tightness, as seen in mid-2025 when the LME cash-to-3M spread briefly moved into deep backwardation, produces a front-end premium. The current contango signals that the near-term ex-US market is adequately supplied and that the tariff-driven inventory surge has temporarily resolved the prompt tightness that existed earlier in 2026.

For a rolled long — including a holder of CPER, which tracks COMEX copper via the SummerHaven roll methodology — contango is a headwind. At a roughly −5% annualised roll drag (plus CPER's 1.06% expense ratio), the total cost of holding a rolled copper position is approximately 6% per year relative to the spot price, in a flat-price environment. The price must rise by at least that amount annually just to break even on the position, which is why CPER has consistently underperformed the LME spot copper price over multi-year periods when the curve is in contango.

**Watch: return to backwardation.** If the US imposes the phased 15%/30% tariff on refined copper (Jan 2027/Jan 2028) — the Goldman Sachs base case that drives their $13,735/t year-end LME forecast — a new wave of frontloading could tighten the LME prompt market and flip the spread back toward backwardation or at least narrow the contango materially. That would reduce or eliminate the roll drag and change the economics of a rolled long.

---

## Data Quality Notes

- Front-month LME spot ($13,202/t, July 2): sourced from Westmetall daily table citing LME; consistent with TradingKey's June 24 close of $13,371/t (−1.2% move over 6 trading days is plausible). Confidence: high.
- COMEX deferred prices (Sep, Dec '26, Mar '27): sourced from web search aggregating Google Finance quotes (unverified). The directional read (contango, rising curve) is consistent across multiple web sources and with the LME spread data. Exact settle prices should be confirmed against CME Group settlement data. Confidence: medium.
- LME cash-to-3M spread (−$36 to −$94/t): sourced from MetalRadar (bid/ask/trade for the spread) — unverified web but a specialist metals data source. The direction (contango) is consistent with COMEX curve and inventory conditions. Confidence: medium.
- 52-week prices: July 2025 LME range sourced from Zamak.us citing LME; record high ($14,527.50/t, Jan 29, 2026) cited by Bloomberg and Benchmark Minerals — unverified web but consistent across multiple reputable sources. Confidence: high for direction; medium for exact daily levels.
- Moving averages: Barchart COMEX HGU26 technical page, 2026-07 — unverified web. Confidence: medium.
