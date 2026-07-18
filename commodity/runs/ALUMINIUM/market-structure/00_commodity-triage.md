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
