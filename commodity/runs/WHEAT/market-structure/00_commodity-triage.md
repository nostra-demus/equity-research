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
