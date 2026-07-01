# Commodity Triage — GOLD

> **Test fixture — illustrative figures, not live research.** Committed so the cockpit's chat-over-dossier and the commodity swarm tests are demonstrable without spending a live run.

## 1. Identity
| Item | Value | Source |
|---|---|---|
| Benchmark / grade | LBMA Gold Price (London), COMEX front-month | COMMODITY_PROFILES.md ## GOLD |
| Quote unit + currency | USD per troy ounce | profile |
| Primary exchange(s) | COMEX (CME), LBMA OTC, MCX | profile |
| Applicable lenses (from profile) | real yields, USD, CB buying, ETF flows, geopolitics, positioning, technicals | profile |

## 2. Instruments (from profile)
| Instrument / ticker | Type | Exposure | Notes |
|---|---|---|---|
| GLD | physical bullion trust | spot gold less ~0.40%/yr fee | liquid US proxy |
| GC (COMEX) | future | curve / institutional | roll |
| GDX | miner equity ETF | levered equity proxy | not the metal |

## 3. Data Reachability
| Lens | Primary source checked | Found? | As-of date |
|---|---|---|---|
| Price | LBMA / COMEX settle | Yes (illustrative) | 2026-06-30 |
| CB buying | World Gold Council | Yes (illustrative) | Q1-2026 |
| Real yields | FRED DFII10 | Yes (illustrative) | 2026-06-30 |

## 4. Local pool (data/GOLD/)
- none — running on live public sources.

## 5. Sufficiency Verdict
- **Verdict:** Sufficient
- **Reason:** GOLD has a profile section and current benchmark + macro/positioning sources are reachable.
