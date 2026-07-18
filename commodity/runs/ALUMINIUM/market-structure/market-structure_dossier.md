# market-structure Module Dossier — ALUMINIUM

> Deterministic, lossless concatenation of every artifact in this module — the module synthesis and every specialist output, in order. Generated mechanically (no LLM rewriting), so nothing is omitted or paraphrased. This is the module's "see everything" tier; the module's decision lives in `99_*-synthesis.md` and the short read in `market-structure_memo.md`.

- Generated: 2026-07-18T17:48:55Z
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

# Market Structure — ALUMINIUM (module synthesis)

## Abstract
LME aluminium cash last settled USD 3,154.00/tonne (2026-07-17) [`02_commodity-price-curve.md`, Westmetall LME cash settlement feed, 2026-07-17], consolidating in the low-USD-3,000s after round-tripping from a four-year high of USD 3,855/tonne (2026-06-02, Iran/Gulf-smelter and Hormuz-shipping crisis premium) back down roughly 18% to a four-month low near USD 3,085/tonne in early July, before stabilising [`02_commodity-price-curve.md`]. The 12-month trend is still up (+21–22% vs Jul-2025), but the last one to three months are a sharp unwind, not a fresh leg higher. The curve sits in mild backwardation — cash USD 7.50/tonne above the 3-month (+0.95% annualised roll pickup) [`02_commodity-price-curve.md`] — a fraction of the ~USD 59/tonne inversion seen at the May 2026 peak of the crisis, consistent with LME warehouse stocks still down roughly one-third from ~420,000 t in January 2026 to ~284,600 t by 2026-07-15 [`00_commodity-triage.md`]. LME Aluminium futures (3-month) remain the cleanest, fee-free, no-credit-risk expression of a pure price view, with COMEX ALI a close US-listed alternative (99.86% settlement correlation to LME) [`01_commodity-instruments.md`]; a holder rolling long exposure today is modestly paid to roll rather than penalized, but the pickup is thin and does not signal acute near-term tightness the way the May curve did.

## Price & Trend
- Current: LME cash USD 3,154.00/tonne (2026-07-17); LME 3-month USD 3,146.50/tonne (2026-07-17) [`02_commodity-price-curve.md`, Westmetall].
- Trend: spiked to a 4-year high of USD 3,855/tonne on 2026-06-02 on Iranian attacks on Gulf smelters and a US-ordered blockade through the Strait of Hormuz hitting an already-thin warehouse buffer [`02_commodity-price-curve.md`, AlCircle 2026-06-02]. Since unwound ~18% to a 4-month low near USD 3,085/tonne in early July, now stabilising near USD 3,150/tonne — almost exactly the mid-January 2026 level (USD 3,147.00/tonne) [`02_commodity-price-curve.md`].
- 12-month change: +21–22% vs Jul-2025 (~USD 2,580–2,604/tonne) [`02_commodity-price-curve.md`, Great China Metal report].
- 52-week range: USD 2,544.22–3,855.00/tonne; current price ~46% above the low, ~18% below the high [`02_commodity-price-curve.md`, aggregated web, low date unverified].
- Chart context (not fundamental): resistance ~USD 3,149–3,200/tonne; support ~USD 3,021–3,085/tonne; 50-day MA above 200-day MA with spot above both (textbook uptrend signature); weekly RSI 55–70 (momentum without exhaustion) — all reputable web, dated, unverified [`02_commodity-price-curve.md`].
- Read: consolidation after a geopolitical spike-and-unwind, not a trending market right now.

## Futures Curve / Term Structure
- Shape: mild backwardation. Cash USD 3,154.00/tonne vs 3-month USD 3,146.50/tonne (2026-07-17), a USD 7.50/tonne front premium, annualising to roughly +0.95% [`02_commodity-price-curve.md`].
- Corroboration: cross-check prints from 2026-07-15 (cash USD 3,153.00/tonne bid, 3-month Asian Reference Price USD 3,150.00/tonne) show the same modest front-end premium [`02_commodity-price-curve.md`, discoveryalert.com.au].
- Deeper curve points (15-month, 27-month LME contracts) were not retrievable from public sources reached this pass (LME.com request blocked) — a genuine gap, not evidence the rest of the curve is flat [`02_commodity-price-curve.md`].
- Context: this is a far smaller inversion than the ~USD 59/tonne cash-over-3-month spread reported at the May 2026 crisis peak — the widest since February 2022 — which would annualise to roughly 6–7% [`02_commodity-price-curve.md`, discoveryalert.com.au, unverified vs an LME settlement print].
- Roll implication: backwardation pays a long holder to roll forward (sell pricier cash/front, buy cheaper deferred) — the opposite of contango roll drag. Consistent with the stock drawdown (opening stocks down from ~420,000 t, Jan-2026, to ~284,600 t, 2026-07-15) [`00_commodity-triage.md`]. But at +0.95% annualised, the pickup is thin; the curve has mostly normalised back toward flat and is not flagging acute near-term tightness today.

## Instruments & Cleanest Exposure
- Benchmark: LME Aluminium (high-grade primary, min. 99.7% purity), USD/tonne, the global reference; SHFE is the secondary China-onshore benchmark in RMB/tonne [`01_commodity-instruments.md`].
- Cleanest direct expression: LME Aluminium futures (3-month or a specific prompt date) — exchange fees and roll cost only, no management fee, no issuer credit risk, and the cash–3M spread and stock/warrant data are themselves live, trackable signals [`01_commodity-instruments.md`]. COMEX ALI (25 mt lot, USD/tonne) is a close US-listed physically-settled alternative with 99.86% settlement correlation to LME 3M since the 2019 warehouse globalisation [`01_commodity-instruments.md`, CME Group].
- If the view is specifically on the US tariff/Midwest-premium dynamic rather than the global metal price, the CME Aluminum MW U.S. Transaction Premium (Platts) futures (AUP) isolates that layer directly — it does not move with the LME base price at all [`01_commodity-instruments.md`].
- Fallback routes only: iPath Series B Bloomberg Aluminum Subindex TR ETN (JJU) — an unsecured Barclays Bank PLC debt note, not a fund, carrying issuer credit risk plus fixed-schedule single-contract roll exposure (currently a mild backwardation tailwind, per the curve read above, rather than a drag) and thin secondary liquidity [`01_commodity-instruments.md`]; and producer equities (Alcoa, Century Aluminum, Norsk Hydro, Rio Tinto, South32, Chalco, RUSAL, Hindalco) — operationally levered proxies dominated by power-cost structure (~40% of smelting cost), hedging books, and (for RUSAL) sanctions exposure, which can move the equity opposite to the LME price [`01_commodity-instruments.md`]. Neither is a clean 1:1 proxy for the metal.
- The regional physical premium (US Midwest — Platts; European duty-paid — Fastmarkets MB) is a separate, additive layer on top of the LME base price, itself now listed and futures-tradable via AUP [`01_commodity-instruments.md`].

## Reconciliation & Gaps
- **Price print timing, not a contradiction.** The triage and instruments files both cite LME cash USD 3,138.00/tonne as of 2026-07-13; the price-curve file has the more recent USD 3,154.00/tonne print (2026-07-17). Per source hierarchy (prefer the most current official exchange print), the price-curve file's 2026-07-17 figure is the one to carry forward — the two are consistent with a market that dipped further to a four-month low in early July and has since stabilised, not a data conflict.
- **Stock-drawdown figures are close but not identical.** Triage cites opening stocks 284,600 t (2026-07-15), down from 286,225 t (2026-07-14), with a cumulative drawdown from ~420,000 t (Jan-2026) to ~289,225 t by 2026-07-10; the price-curve file cites the same ~420,000 t starting point falling to ~284,600 t by 2026-07-15. These are sequential daily prints from the same drawdown, not conflicting series — no reconciliation needed beyond noting the daily granularity.
- **Gap: full LME curve beyond 3-month.** Neither the instruments nor the price-curve file could retrieve 15-month/27-month LME prices (LME.com blocked the request). The backwardation read above is confirmed only for cash-vs-3-month; whether backwardation persists further out the curve is unconfirmed.
- **Gap: Midwest premium figure is stale relative to today's price.** The instruments file's "premium equals ~63% of the LME base price" calculation pairs a 2025-12-15 Platts Midwest premium (90 cents/lb) with a 2026-07-13 LME cash price — a seven-month gap between the two data points. This ratio should not be read as current; a fresh Midwest premium print is needed before citing that relationship as live.
- **Gap: supply/demand and positioning data not yet pulled.** Per the triage, IAI production/China smelter-cap data and LME COTR/SHFE positioning were named as reachable but not queried in this market-structure pass — these belong to other lenses/modules in the swarm, not a hole in this synthesis, but the thesis module should confirm they were picked up elsewhere before relying on a full picture.

## Note to the Commodity Thesis
- Curve is in mild backwardation (cash ~USD 7.50/tonne over 3-month, +0.95% annualised as of 2026-07-17) — a long futures position is modestly paid to roll, not penalised by roll drag, but this is a thin pickup, an order of magnitude below the ~6–7% annualised implied by May 2026's crisis-level ~USD 59/tonne inversion [`02_commodity-price-curve.md`].
- Price is consolidating in the low-USD-3,000s after a geopolitical-crisis spike to a 4-year high (USD 3,855/tonne, 2026-06-02) unwound ~18%; treat the 12-month +21–22% uptrend and the 1–3 month sharp reversal as two separate signals, not one trend.
- LME warehouse stocks are still down roughly one-third from January 2026 levels (~420,000 t to ~284,600 t, 2026-07-15) — a tight physical buffer that underpins the backwardation, even though the curve's inversion has mostly normalised.
- Cleanest exposure is LME Aluminium futures (or COMEX ALI as a close US-listed alternative); if the thesis is really about the US tariff/Midwest-premium story rather than the global metal price, that is a distinct, separately tradable instrument (AUP) and should be named as such rather than blended into an LME-price call. The ETN (JJU, Barclays credit risk) and producer equities are fallback-only, not 1:1 proxies.



---

## market-structure / 00_commodity-triage.md

_Source: `00_commodity-triage.md`_

# Commodity Triage — ALUMINIUM

## 1. Identity
| Item | Value | Source |
|---|---|---|
| Benchmark / grade | LME Aluminium (high-grade primary, USD/tonne); SHFE (China) as the secondary regional benchmark | `frameworks/commodity/COMMODITY_PROFILES.md`, ## ALUMINIUM |
| Quote unit + currency | USD per tonne (LME) — always add the regional physical premium (US Midwest, European duty-paid) on top | `frameworks/commodity/COMMODITY_PROFILES.md`, ## ALUMINIUM |
| Primary exchange(s) | LME, SHFE, COMEX | `frameworks/commodity/COMMODITY_PROFILES.md`, ## ALUMINIUM |
| Applicable lenses (from profile) | Market structure (LME cash–3M spread, LME/SHFE stocks + off-warrant, regional premium); Supply/demand (China smelter cap, power curtailments, Russia/sanctions metal, alumina/bauxite feed, transport/packaging/construction demand); Macro (power/energy prices as swing cost, China supply cap + property, USD, sanctions, decarbonization/green premium); Positioning/flows (LME COTR, SHFE positioning); Valuation (marginal power-driven smelter cash cost as floor). Weather/seasonality explicitly NOT a driver (only Yunnan hydro-power note) | `frameworks/commodity/COMMODITY_PROFILES.md`, ## ALUMINIUM |

## 2. Instruments (from profile)
| Instrument / ticker | Type (futures/ETF/spot/equity proxy) | Exposure | Notes |
|---|---|---|---|
| LME Aluminium futures | Futures | Direct primary-aluminium exposure | The direct expression per the profile |
| Aluminium ETNs (unnamed, thin) | ETN | Indirect, exchange-traded | Profile flags: "no deep US aluminium ETF"; ETNs are thin and carry issuer credit risk |
| Producer equities | Equity proxy (levered) | Indirect, operationally levered | Profile's fallback route when direct futures access is unavailable |

## 3. Data Reachability
| Lens | Primary source checked | Found? | As-of date |
|---|---|---|---|
| Benchmark price (market structure) | LME Aluminium cash settlement (via LME-linked and market-data reporting, e.g. westmetall.com LME feed and LME.com official-price pages) | Yes — cash bid USD 3,138/tonne (2026-07-13), down from USD 3,155.50/tonne (2026-07-10); USD 3,104.50/tonne (2026-07-06) | 2026-07-13 |
| Market structure — LME stocks/warrants | LME warehouse and queue data (lme.com "Warehouse company stocks and queue data") | Yes — opening stocks 284,600 t (2026-07-15), down from 286,225 t (2026-07-14); live warrants 246,300 t, cancelled warrants 36,800 t (2026-07-15); cumulative ~31% inventory drawdown from ~420,000 t in January 2026 to ~289,225 t by 2026-07-10 | 2026-07-15 |
| Supply/demand — China output / IAI | Not directly queried this pass (only the price/stocks check was done, per the triage's single-check mandate); IAI monthly production and China smelter-cap data are named in the profile as reachable, standard, recurring official releases | Not checked today (in scope for the market-structure/supply-demand agents, not for triage) | — |
| Positioning — LME COTR / SHFE | Not directly queried this pass | Not checked today | — |

## 4. Local pool (data/ALUMINIUM/)
- data/ALUMINIUM/ does not exist for this run — running entirely on live public primary sources (LME, SHFE, IAI, CFTC/LME COTR as named in the profile).

## 5. Sufficiency Verdict
- **Verdict:** Sufficient
- **Reason:** ALUMINIUM has a full profile section (benchmark, quote unit, lenses, instruments, priority sources) and today's reachability check confirmed a current LME cash price (2026-07-13/07-15) plus current LME warehouse-stock/warrant data (a named market-structure lens) from primary/exchange-linked sources.
- **Missing (if Partial/Insufficient):** N/A — supply/demand (IAI production) and positioning (LME COTR/SHFE) sources were not queried in this single triage check but are standard recurring official releases named in the profile; downstream market-structure and supply-demand agents should confirm them directly.



---

## market-structure / 01_commodity-instruments.md

_Source: `01_commodity-instruments.md`_

# Instruments & Exposure Map — ALUMINIUM

## 1. Benchmark & Contract
- **Benchmark grade:** LME Aluminium — high-grade primary aluminium (min. 99.7% purity), the global reference price. SHFE Aluminium is the secondary regional benchmark for onshore China metal [`frameworks/commodity/COMMODITY_PROFILES.md`, ## ALUMINIUM].
- **Quote unit / currency:** USD per tonne on LME (cash settled 2026-07-13: USD 3,138/tonne) [LME official price / westmetall.com LME feed, cited in `commodity/runs/ALUMINIUM/market-structure/00_commodity-triage.md`, 2026-07-13]. SHFE quotes in RMB/tonne.
- **Front-month / benchmark contract:** LME Aluminium futures — lot size 25 tonnes, quoted USD/tonne, tick $0.50/tonne (Ring/LMEselect outright) or $0.01/tonne (inter-office and carry trades) [LME, "Contract specifications - LME Aluminium," lme.com, accessed 2026-07-18].
- **Critical structural point:** the LME price is NOT the delivered cost of metal anywhere in the world — it is the base layer. A **regional physical premium** (US Midwest — Platts; European duty-paid — Fastmarkets MB) sits on top and is priced, tracked, and in the US even futures-tradable, separately from the LME contract itself [LME, "LME Aluminium premiums," lme.com, accessed 2026-07-18; S&P Global Platts, "Aluminum US Midwest Premium reaches 90 cents/lb for the first time," 2025-12-15 (Web, dated)].

## 2. Instrument Map

| Instrument | Type | Exchange | Tracks | Fee | Main divergence from spot | Source |
|---|---|---|---|---|---|---|
| LME Aluminium futures (3M / cash / futures curve) | Futures, physically deliverable | LME | LME high-grade primary aluminium price (the direct global benchmark) | Exchange fees + roll cost only; no management fee | Cash–3M spread (contango/backwardation) reflects financing cost and warehouse-queue dynamics, not "spot" in the retail sense; delivery is via LME-registered warehouse warrant, not open-market metal | LME, "Contract specifications - LME Aluminium," accessed 2026-07-18 |
| SHFE Aluminium futures | Futures, physically deliverable | SHFE (China) | Onshore China primary aluminium price, RMB/tonne | Exchange fees | Prices a China-specific, capital-controlled, tariff/VAT-adjusted market; SHFE–LME arbitrage spread is itself a tracked signal, not a direct substitute for the global benchmark | SHFE contract rules, shfe.com.cn, accessed 2026-07-18 (Web, dated) |
| CME/COMEX Aluminum futures (ALI) | Futures, physically deliverable | COMEX (CME Group) | Global (post-2019 "globalized") aluminium price; 99.86% settlement correlation with LME since the 2019 addition of European/Asian warehouses | Exchange fees | A US-listed, physically-delivered alternative to LME with its own warehouse network — small basis vs LME persists; contract size 25 metric tonnes, tick $0.25/tonne ($6.25/tick) | CME Group, "Aluminum Futures Contract Specs" and "CME Group Aluminum Correlation and Differential to LME 3m Aluminum," cmegroup.com, accessed 2026-07-18 |
| CME Aluminum MW U.S. Transaction Premium (Platts) futures (AUP) | Futures (swap-based, cash-settled) | COMEX (CME Group) | The **US Midwest physical premium** only (i.e., the delivered-duty-paid add-on over LME, not the LME base price itself) | Exchange fees | This is a pure premium instrument — it does not move with the LME base price at all; it isolates the freight/duty/local-supply layer that has surged on US tariffs on Canadian primary aluminium (Midwest premium reached 90 cents/lb, Dec-2025, vs a multi-year historical range far below that) | CME Group, "Aluminum MW U.S. Transaction Premium Platts (25MT) Futures (AUP)," cmegroup.com, accessed 2026-07-18; S&P Global Platts, 2025-12-15 (Web, dated) |
| iPath Series B Bloomberg Aluminum Subindex Total Return ETN (JJU) | Exchange-traded note (unsecured debt, not a fund) | NYSE Arca | Bloomberg Aluminum Subindex Total Return — a single, rolled LME aluminium futures position | Investor fee historically 0.75%/yr per the 2010–2011 prospectus (Barclays FWP filings); more recent third-party trackers cite ~0.45% net expense ratio — figure not independently confirmed from a current prospectus this pass, flag as unverified | (a) Issuer credit risk: JJU is an unsecured debt obligation of Barclays Bank PLC — a JJU holder is exposed to Barclays' solvency, not just aluminium price; (b) roll yield: the index rolls a single futures contract on a fixed schedule, so the ETN incurs contango drag (or backwardation gain) independent of the spot move; (c) thin liquidity — the profile flags "no deep US aluminium ETF" and ETNs as thin | Barclays Bank PLC, Form FWP prospectus supplements, SEC EDGAR, 2010-2011 (fee terms); iPath/Barclays iPath product page (index tracked); `frameworks/commodity/COMMODITY_PROFILES.md`, ## ALUMINIUM (liquidity/credit-risk flag) |
| Producer equities — e.g., Alcoa (AA), Century Aluminum (CENX), Norsk Hydro (NHYDY/NHY.OL), Rio Tinto (RIO), South32, Aluminum Corporation of China (Chalco), United Company RUSAL, Hindalco Industries | Equity (levered operating proxy) | NYSE/Oslo Børs/HKEX/Moscow Exchange/BSE-NSE, per name | The producer's operating leverage to aluminium and, for integrated names, alumina/bauxite margins as well | N/A (equity, no wrapper fee; ongoing operating/financial leverage instead) | Company-specific factors dominate: power-cost structure (hydro vs coal vs grid, since power is ~40% of smelting cost), hedging book, balance-sheet leverage, sanctions exposure (RUSAL), and county/regulatory risk swamp the pure metal-price signal; equity can diverge sharply from spot aluminium in either direction | `frameworks/commodity/COMMODITY_PROFILES.md`, ## ALUMINIUM (power = ~40% of cost; China supply-cap dynamic); WebSearch company profiles, accessed 2026-07-18 (Web, dated) |
| Regional premium price assessments (not directly tradable as a listed cash instrument outside the AUP/European premium futures above) — Platts US Midwest, Fastmarkets MB European duty-paid | Price assessment / index (also the settlement reference for LME's own listed premium contracts) | Reported via S&P Global Platts / Fastmarkets; settled via LME's "Aluminium Premium Duty Paid" listed contracts | The delivered, duty-paid physical premium over LME cash in each region | Assessment subscription cost only (not an investable fee) | This is the layer that actually determines a real-world buyer's landed cost; it can move independently of and by a larger magnitude than the LME base price (Midwest premium at 90 cents/lb by 2025-12-15, driven by 50% US tariffs on Canadian primary aluminium, versus LME cash of USD 3,138/tonne, or ~$1.42/lb, on 2026-07-13 — i.e., the premium alone is currently equivalent to roughly 63% of the LME base metal price) | LME, "LME Aluminium Premium Duty Paid US Midwest (Platts)" and "...Duty Paid European (Fastmarkets MB)," lme.com, accessed 2026-07-18; S&P Global Platts, 2025-12-15 (Web, dated) |

## 3. Portfolio Instrument → Underlying

There is no confirmation in this run of a specific ALUMINIUM position currently held in the portfolio; the profile itself states there is **no deep US aluminium ETF**, so the realistic candidates for a held instrument are the ETN or a producer equity. Both are translated below.

| Held instrument | Mechanism (what it holds) | Fee | How it can diverge from the commodity |
|---|---|---|---|
| iPath Series B Bloomberg Aluminum Subindex TR ETN (JJU) | Not a fund — a senior unsecured debt note issued by Barclays Bank PLC. Barclays promises to pay a return linked to the Bloomberg Aluminum Subindex Total Return, which itself rolls a single LME aluminium futures contract on a fixed monthly schedule. The note holds no physical metal and no segregated futures position — it is a bank IOU | ~0.75%/yr investor fee per original prospectus terms (2010-2011 Barclays FWP filings); some current third-party ETF trackers cite ~0.45% net expense ratio, not independently confirmed from a current prospectus this pass | (1) Barclays counterparty/credit risk — if Barclays' credit deteriorates or it defaults, JJU can lose value with no relation to the aluminium price at all; (2) roll cost/gain — the fixed-schedule single-contract roll captures the LME cash–3M curve shape (currently a live, tracked market-structure input per the triage), so the ETN return diverges from a hypothetical spot-aluminium return by the accumulated contango drag or backwardation gain; (3) thin secondary-market liquidity (flagged in the profile) can widen bid/ask versus NAV | Barclays Bank PLC, Form FWP, SEC EDGAR, 2010-2011; `frameworks/commodity/COMMODITY_PROFILES.md`, ## ALUMINIUM |
| Producer equity (e.g., Alcoa AA, Century Aluminum CENX, Norsk Hydro, Rio Tinto) | Ownership of an operating company that mines bauxite, refines alumina, and/or smelts primary aluminium; revenue is a function of aluminium price times the company's own volume, net of its own power/input costs and hedges | N/A — no wrapper fee, but full equity risk (dilution, balance-sheet leverage, capital allocation) | The single largest divergence driver named in the profile: power cost is ~40% of smelting cost ("congealed electricity"), so a producer's margin — and the equity — can move opposite to the LME price if its own power cost (hydro contract, grid tariff, coal cost) moves more. Add: China supply-cap policy exposure (for Chalco), sanctions exposure (for RUSAL), and general operating/financial leverage that amplifies both up- and down-moves versus a 1:1 metal-price instrument | `frameworks/commodity/COMMODITY_PROFILES.md`, ## ALUMINIUM |

## 4. Cleanest Expression
- **LME Aluminium futures (3-month or a specific prompt date)** remain the cleanest, most liquid, most direct expression of a pure aluminium-price view: no management fee, no issuer credit risk, and the cash–3M spread and stock/warrant data are themselves live, trackable market-structure signals (opening stocks 284,600 t, live warrants 246,300 t, cancelled warrants 36,800 t as of 2026-07-15) [`commodity/runs/ALUMINIUM/market-structure/00_commodity-triage.md`, 2026-07-15]. COMEX ALI is a close, physically-settled US-listed alternative with 99.86% settlement correlation to LME [CME Group, "CME Group Aluminum Correlation and Differential to LME 3m Aluminum," accessed 2026-07-18].
- If the specific view is on the **US tariff/Midwest-premium dynamic** rather than the global metal price, the cleanest instrument is the CME Aluminum MW U.S. Transaction Premium (Platts) futures (AUP), which isolates that layer directly rather than blending it with the LME base move.
- The ETN (JJU) and producer equities are the fallback routes the profile itself flags — acceptable only with the credit-risk (ETN) or operating-leverage (equity) caveats above made explicit; neither is a clean 1:1 proxy for the LME price.



---

## market-structure / 02_commodity-price-curve.md

_Source: `02_commodity-price-curve.md`_

# Price Trend & Term Structure — ALUMINIUM

## 1. Price Now & Trend
| Horizon | Level | Change | Source |
|---|---|---|---|
| Spot / front (LME cash settlement) | USD 3,154.00/tonne (2026-07-17) | — | [Westmetall LME cash settlement feed, 2026-07-17] |
| 1m ago (2026-06-17) | USD 3,405.50/tonne | -7.4% | [Westmetall LME cash settlement feed, 2026-06-17] |
| 3m ago (2026-04-17) | USD 3,660.00/tonne | -13.8% | [Westmetall LME cash settlement feed, 2026-04-17] |
| 6m ago (2026-01-16, nearest available print) | USD 3,147.00/tonne | +0.2% | [Westmetall LME cash settlement feed, 2026-01-16] |
| 12m ago (Jul-2025, month open/close) | ~USD 2,604/tonne (opened Jul-2025); month closed USD 2,580/tonne | +21.1% (vs Jul-1-25 open) / +22.2% (vs Jul-25 close) | [Great China Metal, "Aluminum Price Analysis Report: July 2025", pub. 2025] |
| 52-wk range | Low USD 2,544.22/tonne (exact date not confirmed in sources checked); High USD 3,855.00/tonne (2026-06-02, cash bid/offer) | Current price is ~46% up from the 52-wk low and ~18% below the 52-wk high | [AlCircle, "Aluminium price hits four-year high at $3,855/t", 2026-06-02 (high); aggregated 52-wk range via web search, unverified low date] |

- **Trend read.** Aluminium spiked to a four-year high of USD 3,855/tonne on 2 June 2026 [AlCircle, 2026-06-02] after Iranian attacks on Gulf smelters and a US-ordered blockade of shipping through the Strait of Hormuz hit an already-thin LME warehouse buffer (stocks had been falling through the first half of 2026) [Westmetall/discoveryalert reporting, 2026-06]. That geopolitical premium has since unwound hard: the price gave back roughly 18% from the June peak over six weeks, touching a four-month low near USD 3,085/tonne in early July before stabilizing [discoveryalert.com.au, reputable web, dated, 2026-07], and now sits at USD 3,154/tonne (2026-07-17) — almost exactly where it traded back in mid-January 2026 (USD 3,147/tonne). Read plainly: the 12-month trend is still up (+21–22%), driven by the 2026 tightness narrative building since late 2025, but the last one to three months are a sharp round-trip down from an acute crisis spike, not a fresh leg higher. The market is currently consolidating, not trending, in the low-USD-3,000s.

## 2. Technical Levels (chart context, not fundamentals)
- **Resistance ~USD 3,149–3,200/tonne** — the market has repeatedly failed to convincingly reclaim USD 3,200/tonne since the June sell-off began, keeping chart-watchers cautious on whether this is a correction or a genuine trend reversal; a narrower near-term resistance at USD 3,149/tonne was flagged mid-July, with a breakout eyed toward USD 3,205/tonne [Reuters via TradingView, reputable web, dated mid-July 2026, unverified; discoveryalert.com.au, 2026-07]. This is a chart level, not a fundamental value estimate.
- **Support ~USD 3,021–3,085/tonne** — the four-month low near USD 3,085/tonne (early July 2026) is the level chart-watchers are using to judge whether the worst of the sell-off is over; price has since stabilized in a USD 3,021–3,061/tonne zone on pullbacks [discoveryalert.com.au, reputable web, dated, 2026-07]. Chart context only.
- **Moving averages** — as of mid-July reporting, the 50-day moving average sits above the 200-day moving average with spot trading above both, the textbook chart signature of an established uptrend on a longer look-back even as the metal round-trips within it; weekly RSI is reported in the 55–70 zone, read by chartists as showing momentum without exhaustion [TradingView/Investing.com technical summaries, reputable web, dated, 2026-07, unverified]. None of this is a fundamental valuation signal.

## 3. Futures Curve / Term Structure
| Contract | Price | Source |
|---|---|---|
| LME cash | USD 3,154.00/tonne | [Westmetall LME cash settlement, 2026-07-17] |
| LME 3-month | USD 3,146.50/tonne | [Westmetall LME 3-month feed, 2026-07-17] |
| LME cash (2026-07-15, cross-check) | USD 3,153.00/tonne bid | [discoveryalert.com.au reporting LME data, 2026-07-15] |
| LME 3-month Asian Reference Price (2026-07-15, cross-check) | USD 3,150.00/tonne | [discoveryalert.com.au reporting LME data, 2026-07-15] |

- **Shape: mild backwardation.** Cash trades USD 7.50/tonne above the 3-month (USD 3,154.00 vs USD 3,146.50, 2026-07-17) [Westmetall, 2026-07-17]. **Annualised roll yield: +0.95%** — calculated as (cash − 3m) / 3m × (12/3 months) × 100 = (7.50/3146.50) × 4 × 100 ≈ 0.95%. Deeper points on the curve (15-month, 27-month LME contracts) could not be retrieved from public sources reached today (LME.com blocked the request; only cash and 3-month prints were obtainable) — this is a gap in the curve read, not a claim that the rest of the curve is flat.
- **Context — this is a sharply narrowed version of a much bigger recent inversion.** In May 2026, at the height of the Hormuz-related supply scare, the cash-to-3-month spread reportedly widened to about USD 59/tonne in favour of spot — the highest premium for immediate delivery since February 2022 (Russia's invasion of Ukraine) — versus a normal contango of roughly USD 20–40/tonne for this metal [discoveryalert.com.au, reputable web reporting on LME data, dated, unverified — not independently confirmed against an LME settlement print]. That would annualise to roughly 6–7% at prevailing price levels, an order of magnitude larger than today's ~1%.
- **What it implies.** Backwardation (front above deferred) is the market paying up for metal it can get its hands on now rather than in three months — consistent with the LME warehouse-stock drawdown already on record (opening stocks down from ~420,000 t in January 2026 to ~284,600 t by 2026-07-15, per the market-structure triage [00_commodity-triage.md, 2026-07-15]). A holder who is long and rolls the position forward in backwardation is paid to roll (sells the pricier cash/front, buys the cheaper deferred), the opposite of the contango roll-drag that erodes returns in commodity ETFs like CANE. But the current +0.95% annualised roll pickup is thin — the market has mostly normalised back toward flat after the May squeeze, so today's curve is not signalling acute near-term tightness the way it was two months ago; it is signalling a market that cooled off from a crisis premium but has not swung back into the outright contango that would flag ample near-term supply.
