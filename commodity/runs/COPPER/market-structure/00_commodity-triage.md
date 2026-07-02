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
