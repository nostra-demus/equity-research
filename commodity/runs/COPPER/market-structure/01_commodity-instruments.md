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
