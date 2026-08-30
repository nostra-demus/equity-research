# Commodity Profiles

The per-commodity reference the commodity swarm reads. Each `## <COMMODITY>` section names the
benchmark and quote convention, the instruments (incl. any portfolio-held vehicle), **which lenses
apply** (so agents don't force a monsoon read onto gold or a real-yield read onto sugar), the priority
primary sources, and the recurring reports that become catalysts. It carries NO live prices or
estimates — those are fetched and cited by the agents at run time (§3/§5). Adding a new commodity =
adding a section here; no code change (this is how the swarm stays commodity-agnostic).

The section heading MUST be `## <COMMODITY>` where `<COMMODITY>` is the uppercase run subject
(e.g. `## GOLD`, `## SUGAR`) — the `/commodity:*` commands grep for exactly this.

---

## GOLD

- **Benchmark / grade:** LBMA Gold Price (London, USD/troy oz); COMEX front-month future for the US curve.
- **Quote unit + currency:** USD per troy ounce (also track INR/10g for the India lens).
- **Primary exchanges:** COMEX (CME Group), LBMA (OTC), MCX (India).
- **Business type:** monetary / store-of-value metal — priced by macro and flows more than by a
  consumption balance. Classify the thesis `Commodity-conditional` (macro-conditional in practice).

**Applicable lenses (apply ONLY these):**
- Market structure: spot vs COMEX curve (gold is usually mild contango = the cost of carry).
- Supply/demand: mine supply + recycling (supply) vs jewellery / physical investment (bars, coins) /
  technology / **official-sector (central-bank) buying** (demand). The buffer is above-ground and
  accessible physical stocks, not a tight stocks-to-use measure like an agricultural commodity.
- Weather/seasonality: NOT a weather commodity. Mild seasonality only — India festival/wedding demand
  (roughly Q3–Q4), Chinese New Year, Q1 restocking. Keep it short.
- Macro drivers (the dominant lens): **10y real yields (TIPS)** — gold is a zero-coupon asset, so falling
  real yields help and rising ones hurt; **broad trade-weighted US dollar** — priced in USD, a weaker USD helps;
  policy rates; **geopolitical / safe-haven risk**. Central-bank buying is demand, not a second macro vote.
- Positioning/flows: **COMEX managed-money net length (CFTC COT)**; **gold-ETF holdings** (total known
  tonnes; GLD/IAU flows).
- Valuation/fair value: no cash-flow DCF. Anchor to the real-yield relationship, the USD, and long-run
  real-price ranges; treat "fair value" as a range implied by real yields, not a point.

**Instruments (portfolio + expression):**
- `GLD` (SPDR Gold Shares) and `IAU` / `SGOL` — physically-backed bullion trusts; track spot less a fee
  (~0.17–0.40%/yr); minimal roll drag. `GLD` is the liquid US proxy.
- COMEX `GC` futures — the curve + institutional expression; carries roll.
- Gold-miner equities (`GDX`) are a LEVERED, equity-risk proxy — not the metal; note the difference.

**Priority sources:** World Gold Council (Gold Demand Trends, central-bank stats), LBMA, CME/COMEX,
CFTC COT, BLS (CPI-U), FRED (DFII10 real yield), US Treasury (TIPS), Federal Reserve broad USD data and rate path.

**Recurring reports (catalysts):** FOMC decisions + dot plot; US CPI / PCE; WGC quarterly Gold Demand
Trends; weekly CFTC COT (Fridays); monthly central-bank purchase data; US jobs report.

**Causal signal ownership (one fact, one owner):** official-sector / central-bank activity →
`commodity-demand-inventory`; ETF holdings and flows → `commodity-positioning-flows`; real yields and
the broad USD → `commodity-macro-drivers`; relative ratios → the cross-asset-regime orb when present.

**Required semantic series (profile-owned; connector IDs are deliberately absent):**

| Need ID | Stable series ID | Owner orb | Required history / freshness | Lawful source policy |
|---|---|---|---|---|
| `gold-managed-money-positioning` | `gold.managed-money-positioning` | commodity-positioning-flows | weekly; ≥1 current COT observation | CFTC public API |
| `gold-real-yields` | `gold.us-treasury-real-yields` | commodity-macro-drivers | daily; ≥3 years for validation | US Treasury XML |
| `macro-broad-usd-index` | `macro.broad-usd-index` | commodity-macro-drivers | daily; ≥3 years for validation | shared Federal Reserve/FRED public CSV semantic series |
| `gold-consumer-price-index` | `gold.consumer-price-index` | commodity-cross-asset-regime | monthly; ≥10 years for real-price regimes | BLS public API; non-seasonally-adjusted CPI-U; point-in-time use is limited to already-retrieved connector vintages |
| `gold-equity-index-history` | `gold.equity-index-history` | commodity-cross-asset-regime | weekly; ≥3 years for Gold/equities regimes | lawful shared market history with source identity; broad US equity benchmark |
| `gold-miner-equity-history` | `gold.miner-equity-history` | commodity-cross-asset-regime | weekly; ≥3 years for miners/Gold confirmation | lawful shared market history with source identity; `GDX` or equivalent declared proxy |
| `gold-silver-price-history` | `gold.silver-price-history` | commodity-cross-asset-regime | weekly; ≥3 years for silver/Gold confirmation | lawful shared market history with source identity; physical silver or declared bullion proxy |
| `gold-silver-miner-history` | `gold.silver-miner-history` | commodity-cross-asset-regime | weekly; ≥3 years for silver-miner confirmation | lawful shared market history with source identity; `SIL` or equivalent declared proxy |
| `gold-comex-inventory-deliveries` | `gold.comex-inventory-deliveries` | commodity-demand-inventory | daily; current registered/eligible stocks and delivery notices | CME official report only; manual if no stable lawful machine route |
| `gold-lbma-vault-clearing` | `gold.lbma-vault-clearing` | commodity-demand-inventory | monthly; vault and clearing releases | public LBMA vault/clearing statistics only; never the licensed price benchmark |
| `gold-official-reserve-changes` | `gold.official-reserve-changes` | commodity-demand-inventory | monthly; reported purchases/sales with reporting lag | IMF/central-bank data or the WGC workbook compiled from them; preserve WGC adjustments |
| `gold-mine-supply` | `gold.mine-supply` | commodity-supply-security | annual world and country production | USGS public-domain release |
| `gold-issuer-etf-holdings` | `gold.issuer-etf-holdings` | commodity-positioning-flows | daily; issuer-reported tonnes/ounces and shares | lawful issuer download/page only |
| `gold-current-price` | `gold.current-price` | commodity-price-curve | current front-month futures quote | reuse the swarm pulse quote transport (`@GC.1`); label it futures, never cash/spot; no connector clone |
| `gold-market-price-history` | `gold.market-price-history` | commodity-price-curve | point-in-time close history with source identity | reuse `data/_market/<provider>/` and `scripts/market_prices.py`; other orbs consume the owner's evidence; if no lawful feed exists, unavailable |
| `gold-futures-curve` | `gold.futures-curve` | commodity-price-curve | current multi-tenor COMEX settlement curve | lawful CME route with licence/source identity; otherwise manual or unavailable |
| `gold-cash-spot-price` | `gold.cash-spot-price` | commodity-price-curve | current deliverable cash/spot assessment aligned to COMEX grade, location, date and unit | lawful primary/licensed cash assessment; LBMA benchmark only with an existing licence; otherwise unavailable |
| `gold-cash-futures-basis` | `gold.cash-futures-basis` | commodity-price-curve | cash/spot minus deliverable nearby futures, as % of futures, with aligned timestamps | deterministic derivation from cash-spot and futures-curve vintages; no independent vote |
| `gold-regional-physical-premiums` | `gold.regional-physical-premiums` | commodity-price-curve | current observable premiums with region and quote basis | primary exchange/trade-body publication where lawful; otherwise manual or unavailable |

**Availability is evidence, not configuration.** Declaring a required row does not lift sufficiency. A
row is usable only when its semantic series has a current, validated vintage. Manual/unavailable rows
remain visible gaps and can force `Research More`. The LBMA Gold Price history is not a permissible
fallback: it requires an appropriate licence, so the engine records absence instead of scraping it.

---

## SUGAR

- **Benchmark / grade:** ICE No. 11 (world raw sugar, US¢/lb) is the global benchmark; ICE No. 5 (London
  white/refined, USD/t) for the white premium; India domestic ex-mill (₹/quintal) for the India lens.
- **Quote unit + currency:** US cents per pound (ICE #11). Always also give the absolute + the white premium.
- **Primary exchanges:** ICE (New York #11, London #5), MCX/NCDEX (India).
- **Business type:** agricultural soft — a genuine production/consumption balance driven by weather,
  cane-to-ethanol diversion, and export policy. Classify the thesis `Commodity-conditional`.

**Applicable lenses (apply ONLY these):**
- Market structure: ICE #11 curve (backwardation = near-term tightness; contango = ample supply and roll
  drag on a long ETF); the #11↔#5 white premium.
- Cross-asset regime: crude/sugar as one ethanol-parity confirmation cluster; it cannot also cast the
  physical mill-allocation vote.
- Supply/demand: production by Brazil (Centre-South), India, Thailand, EU (supply) vs food + ethanol
  demand; the balance is a **global surplus/deficit** and **stocks-to-use ratio** (the key buffer).
- Weather/seasonality (a DOMINANT lens): **India monsoon** (IMD rainfall vs the long-period average,
  reservoir levels — drives Indian cane), **Brazil Centre-South** cane weather + harvest pace (UNICA
  bi-weekly), and the **ENSO (El Niño / La Niña)** signal. Harvest calendars: Brazil C-S ~Apr–Nov,
  India/Thailand ~Oct–Apr.
- Supply security: dated export quotas/bans, biofuel mandates and verified rerouting through the
  accessible-supply bridge.
- Macro drivers: the broad **US dollar**, producer FX (BRL, INR, THB) and non-policy freight/input costs.
- Positioning/flows: **ICE #11 managed-money net length (CFTC COT)**; sugar-ETF shares outstanding.
- Valuation/fair value: cost-of-production floors (Brazil C-S cash cost) and the ethanol-parity price
  as a soft floor/ceiling; treat as a range.

**Instruments (portfolio + expression):**
- `CANE` (Teucrium Sugar Fund) — **the portfolio-held vehicle.** Holds ICE #11 raw-sugar futures spread
  across the 2nd/3rd/next-year contracts (to soften roll); expense ratio ~1.0%/yr. It tracks the FUTURES
  curve, not spot — in contango it bleeds roll yield, so it can lag a spot rally. Translate any CANE view
  back to ICE #11 + the current curve shape.
- `SGG` and other sugar ETNs — carry issuer credit risk (ETN, not a fund).
- ICE `SB` (#11) futures — the direct expression; carries roll.

**Priority sources:** USDA (WASDE, Sugar & Sweeteners Outlook, FAS attaché reports), ISO (International
Sugar Organization), UNICA (Brazil C-S bi-weekly), Conab (Brazil crop), India Ministry of Agriculture /
ISMA, IMD (monsoon), ICE (prices/curve), CFTC COT, EIA (crude/ethanol).

**Recurring reports (catalysts):** USDA WASDE (monthly) + semi-annual Sugar & Sweeteners Outlook; UNICA
Centre-South bi-weekly cane/sugar/ethanol data; Conab crop surveys; India monsoon onset + progress
bulletins (IMD, Jun–Sep) and export-policy notifications; weekly CFTC COT; ISO quarterly market outlook.

**Family-specific physical-market rules:** align raw/white sugar, crop year, polarization, location, unit,
currency and contract month before comparing prices. `commodity-demand-inventory` owns observed mill cane
allocation and realised food/ethanol use; `commodity-supply-security` owns mandates, export quotas/bans and
routing, so policy cannot cast a second physical vote. Weather must be yield-weighted and stage-aligned.
Production and the global balance share bridge inputs but cannot duplicate one output signal. Low origin
coverage, stale mill data or conflicting estimates trigger the supply-opacity cap.

**Required semantic series (profile-owned; connector IDs are deliberately absent):**

| Need ID | Stable series ID | Owner orb | Required history / freshness | Lawful source policy |
|---|---|---|---|---|
| `sugar-managed-money-positioning` | `sugar.managed-money-positioning` | commodity-positioning-flows | weekly; ≥3 years and current ICE Sugar No. 11 COT observation | CFTC public API; exact SUGAR NO. 11 futures-only disaggregated contract |
| `sugar-fund-etn-flows` | `sugar.fund-etn-flows` | commodity-positioning-flows | weekly current lawful CANE fund shares/AUM and observable listed sugar-ETN issuance or flows | issuer/sponsor primary holdings and share/notes data only; if lawful history is unavailable mark manual or unavailable, never infer flows from price |
| `climate-enso-oni` | `climate.enso.oni` | commodity-weather-seasonality | monthly; ≥30 years of dated ONI history | NOAA CPC observed ONI only; it cannot substitute for regional weather or a probabilistic outlook |
| `macro-broad-usd-index` | `macro.broad-usd-index` | commodity-macro-drivers | daily; ≥3 years for sugar/USD regimes | reuse one Federal Reserve/FRED semantic series; no commodity-specific clone |
| `sugar-trade-fx` | `sugar.trade-fx` | commodity-macro-drivers | daily; ≥3 years of producer BRL/INR/THB against USD | primary central-bank or lawful market history with exact FX bases and roles |
| `sugar-current-price` | `sugar.current-price` | commodity-price-curve | current front-month ICE Sugar No. 11 quote | reuse swarm pulse quote transport (`@SB.1`); label US¢/lb futures |
| `sugar-price-history` | `sugar.price-history` | commodity-price-curve | point-in-time ICE No. 11 close history with source identity | reuse lawful shared market history for `@SB.1`; continuous back-adjusted futures |
| `sugar-crude-price-history` | `sugar.crude-price-history` | commodity-cross-asset-regime | point-in-time WTI history aligned to sugar | reuse lawful `@CL.1` history; crude is one ethanol-parity confirmation, not physical cane allocation |
| `sugar-ice-forward-curve` | `sugar.ice-forward-curve` | commodity-price-curve | current No. 11 old/new-crop settlements with ≥3 years of snapshots | lawful ICE settlements with exact contracts; otherwise unavailable |
| `sugar-white-premium` | `sugar.white-premium` | commodity-price-curve | current aligned No. 11/No. 5 white premium net of conversion and freight | lawful ICE prices with exact contract months and units |
| `sugar-regional-physical-basis` | `sugar.regional-physical-basis` | commodity-price-curve | current Brazil/India/Thailand raw-sugar physical basis aligned by grade, location, unit, FX and contract month | primary producer/market authority or licensed lawful quotations; otherwise manual or unavailable |
| `sugar-ice-delivery-pressure` | `sugar.ice-delivery-pressure` | commodity-price-curve | current ICE No. 11 delivery notices, load-out queue and concentration by delivery point | lawful ICE delivery notices; preserve report date and contract identity, otherwise unavailable |
| `sugar-accessible-physical-inventory` | `sugar.accessible-physical-inventory` | commodity-demand-inventory | current exchange-deliverable and independently accessible raw-sugar inventory by location | primary exchange/warehouse/market-authority reports; do not treat national stocks as globally accessible |
| `sugar-global-balance-stocks-use` | `sugar.global-balance-stocks-use` | commodity-demand-inventory | monthly/quarterly; ≥10 years of global balance and accessible stocks-to-use | USDA/ISO primary releases with country coverage, revisions and inaccessible stocks separated |
| `sugar-brazil-mill-allocation` | `sugar.brazil-mill-allocation` | commodity-demand-inventory | bi-weekly current cane crush, sugar mix and ethanol output | UNICA primary releases; physical allocation owns the demand/supply split and policy cannot duplicate it |
| `sugar-weather-phenology` | `sugar.weather-phenology` | commodity-weather-seasonality | current plus ≥30 years of yield-weighted India/Brazil/Thailand weather aligned to crop stage | primary meteorological observations/forecasts with geography, run time and expiry |
| `sugar-production` | `sugar.production` | commodity-supply | current cane area, yield, recovery and sugar output by major origin with dispersion | CONAB/USDA/national primary crop releases; do not recount mill allocation |
| `sugar-physical-demand` | `sugar.physical-demand` | commodity-demand-inventory | current food use, ethanol offtake and destination imports | primary customs/industry data; separate realised use from mandates and announced purchases |
| `sugar-policy-routing` | `sugar.policy-routing` | commodity-supply-security | current dated export quotas/bans, biofuel mandates and verified rerouting | primary government/customs evidence with effective date and expiry; bridge to globally accessible supply |
| `sugar-cost-ethanol-parity-range` | `sugar.cost-ethanol-parity-range` | commodity-cost-curve | current marginal cash-cost and ethanol/export-parity range | primary farm/mill costs and lawful energy/FX inputs; separate observed price, model range and market expectation |

Declaring these rows does not make them usable. CFTC, ONI, USD and a quote cannot replace the physical
balance, mill allocation, crop-stage weather or accessible-export bridge. Missing required physical evidence
keeps both horizons not assessable and forces Research More.

---

## CRUDE-OIL

- **Benchmark / grade:** ICE Brent (North Sea, USD/bbl) — the global waterborne benchmark; NYMEX WTI
  (CME, Cushing OK, USD/bbl) — the US benchmark. Always track the Brent–WTI spread.
- **Quote unit + currency:** USD per barrel (bbl). Give both Brent and WTI and the spread between them.
- **Primary exchanges:** ICE (Brent), NYMEX / CME (WTI), DME (Oman), MCX (India).
- **Business type:** energy commodity — a genuine production/consumption balance set by OPEC+ policy, US
  shale, and the global demand cycle. Classify the thesis `Commodity-conditional` (macro-cyclical).

**Applicable lenses (apply ONLY these):**
- Market structure: the Brent and WTI curves (backwardation = near-term tightness; contango = ample
  supply and roll drag on a long ETF); the **Brent–WTI spread**; refinery **crack spreads** as a demand tell.
- Supply/demand: OPEC+ quotas + compliance, US shale output, non-OPEC supply vs global demand
  (IEA/OPEC/EIA balances); OECD + US commercial inventories and the SPR; days-of-cover as the buffer.
- Weather/seasonality: NOT a growing-season commodity, but note US summer **driving season** (gasoline),
  winter heating, and **hurricane** risk to Gulf of Mexico output/refining. Keep to those.
- Macro drivers (dominant): global growth / PMIs (demand), the **US dollar**, **OPEC+ decisions**,
  **geopolitical supply risk** (Middle East, Russia sanctions), US shale breakevens, China demand.
- Positioning/flows: NYMEX + ICE **managed-money net length (CFTC / ICE COT)**; crude-ETF flows (USO/BNO).
- Valuation/fair value: no cash-flow DCF. Anchor to the marginal (US shale breakeven) cost floor and the
  demand-destruction ceiling; treat "fair value" as a range.

**Instruments (portfolio + expression):**
- `USO` (front-month WTI) and `BNO` (Brent) — heavy **roll drag** in contango; `DBO`/`USL` spread across
  months to soften it. They track the FUTURES curve, not spot — translate any view back to Brent/WTI + curve.
- `CL` (NYMEX WTI) / `BZ` (ICE Brent) futures — the direct expression; carries roll.
- Energy-equity proxies (`XLE`, `XOP`) are LEVERED, equity-risk proxies — not the barrel.

**Priority sources:** EIA (Weekly Petroleum Status Report, Short-Term Energy Outlook), IEA (Oil Market
Report), OPEC (Monthly Oil Market Report + meeting communiqués), Baker Hughes rig count, CFTC COT, CME/ICE.

**Recurring reports (catalysts):** EIA weekly inventories (Wed) + monthly STEO; IEA and OPEC monthly
reports; **OPEC+ ministerial meetings**; API weekly (Tue); Baker Hughes rig count (Fri); weekly CFTC COT.

**Family-specific physical-market rules:** US inventory is one observable part of a global barrel
balance, never a proxy for the whole balance. Bridge OPEC+ production and compliance, non-OPEC supply,
refinery runs, trade rerouting, sanctions/restrictions, domestic absorption and stock changes before
claiming globally accessible surplus or deficit. Align cash grade, delivery location and timestamp to the
nearby future before computing basis. Treat a curve move without cash/physical confirmation as market
structure evidence, not proof of a shortage. A global supply conclusion inherits the supply-opacity cap
when primary coverage, estimate dispersion or release lags fail the common commodity thresholds.

**Causal signal ownership (one fact, one owner):** CFTC managed-money positioning →
`commodity-positioning-flows`; EIA commercial/SPR stocks → `commodity-demand-inventory`; physical
production and accessible-supply bridges → `commodity-supply-security`; curves, basis, Brent–WTI and
crack spreads → `commodity-price-curve`; broad growth/USD inputs → `commodity-macro-drivers`.

**Required semantic series (profile-owned; connector IDs are deliberately absent):**

| Need ID | Stable series ID | Owner orb | Required history / freshness | Lawful source policy |
|---|---|---|---|---|
| `crude-oil-managed-money-positioning` | `crude-oil.managed-money-positioning` | commodity-positioning-flows | weekly; ≥3 years and current COT observation | CFTC public API; WTI futures-only disaggregated report |
| `crude-oil-ice-managed-money-positioning` | `crude-oil.ice-managed-money-positioning` | commodity-positioning-flows | weekly; ≥3 years and current ICE Brent COT observation | lawful ICE COT route with source identity; otherwise unavailable |
| `crude-oil-etf-flows` | `crude-oil.etf-flows` | commodity-positioning-flows | daily/weekly USO and BNO issuer shares or holdings | lawful issuer publications only; otherwise unavailable |
| `crude-oil-us-inventory-buffer` | `crude-oil.us-inventory-buffer` | commodity-demand-inventory | weekly; ≥3 years of commercial and SPR crude stocks | EIA public API v2; retain revised vintages |
| `crude-oil-oecd-global-inventory-days-cover` | `crude-oil.oecd-global-inventory-days-cover` | commodity-demand-inventory | monthly OECD/global inventory level and days-cover history | primary EIA/IEA/OECD stock levels and demand denominator; reference but do not duplicate the US inventory series |
| `crude-oil-refinery-throughput-product-demand` | `crude-oil.refinery-throughput-product-demand` | commodity-demand-inventory | weekly; ≥3 years of refinery throughput and major-product supplied | EIA primary weekly petroleum series; retain revised vintages and do not infer global demand from US data alone |
| `macro-broad-usd-index` | `macro.broad-usd-index` | commodity-macro-drivers | daily; ≥3 years for oil/USD regimes | reuse one Federal Reserve/FRED semantic series across commodity profiles; no commodity-specific clone |
| `macro-global-activity-demand-proxy` | `macro.global-activity-demand-proxy` | commodity-macro-drivers | monthly; ≥10 years with release vintage | primary global industrial-production/trade series or licensed PMI with source identity; unavailable otherwise |
| `crude-oil-current-price` | `crude-oil.current-price` | commodity-price-curve | current front-month WTI futures quote | reuse the swarm pulse quote transport (`@CL.1`); label it futures; no connector clone |
| `crude-oil-wti-price-history` | `crude-oil.wti-price-history` | commodity-price-curve | point-in-time WTI close history with source identity | reuse lawful shared market history for `@CL.1`; continuous back-adjusted futures |
| `crude-oil-brent-price-history` | `crude-oil.brent-price-history` | commodity-price-curve | point-in-time Brent close history with source identity | reuse lawful shared market history for `@BZ.1`; unavailable if no licensed feed exists |
| `crude-oil-futures-curve` | `crude-oil.futures-curve` | commodity-price-curve | current multi-tenor WTI settlement curve | lawful CME route with licence/source identity; otherwise manual or unavailable |
| `crude-oil-cash-price` | `crude-oil.cash-price` | commodity-price-curve | current deliverable WTI cash assessment aligned to Cushing grade, date and unit | lawful primary/licensed cash assessment; otherwise unavailable |
| `crude-oil-cash-futures-basis` | `crude-oil.cash-futures-basis` | commodity-price-curve | cash minus deliverable nearby future, as % of futures, with aligned timestamps | deterministic derivation from cash-price and futures-curve vintages; no independent vote |
| `crude-oil-brent-wti-spread` | `crude-oil.brent-wti-spread` | commodity-price-curve | current aligned Brent minus WTI spread and history | lawful exchange/market route with both legs and source identity; otherwise unavailable |
| `crude-oil-crack-spreads` | `crude-oil.crack-spreads` | commodity-price-curve | current 3-2-1 or declared refinery crack with aligned legs | lawful exchange settlements; otherwise manual or unavailable |
| `crude-oil-opec-policy` | `crude-oil.opec-policy` | commodity-supply-security | latest quotas, voluntary cuts and observed compliance | OPEC communiqués plus cited primary production data; manual if no stable lawful route |
| `crude-oil-demand-stock-change` | `crude-oil.demand-stock-change` | commodity-demand-inventory | current monthly demand and stock-change bridge | EIA/IEA/OPEC primary demand and stock releases with estimate identity; reference but do not duplicate supply-security production evidence |
| `crude-oil-accessible-supply` | `crude-oil.accessible-supply` | commodity-supply-security | monthly gross-to-accessible supply bridge | primary production, domestic absorption, sanctions/restrictions and rerouting evidence; otherwise unavailable |
| `crude-oil-marginal-supply-cost` | `crude-oil.marginal-supply-cost` | commodity-cost-curve-fair-value | current marginal shale/incremental barrel cost range with vintage | primary producer disclosures and government drilling/productivity data; third-party estimates stay contextual |

Declaring these rows does not make them usable. Missing licensed cash, curve, demand/stock-change or OPEC
inputs remain visible gaps and can force `Research More`; US inventory alone cannot lift global supply
sufficiency.

---

## NATURAL-GAS

- **Benchmark / grade:** NYMEX Henry Hub (Louisiana, USD/MMBtu) — the US benchmark; ICE TTF (Netherlands,
  EUR/MWh) — the European benchmark; Platts JKM — Asian LNG. US vs Europe/Asia are distinct markets linked by LNG.
- **Quote unit + currency:** USD per MMBtu (Henry Hub). Give TTF (EUR/MWh) and the trans-Atlantic LNG arb.
- **Primary exchanges:** NYMEX / CME (Henry Hub), ICE (TTF, NBP).
- **Business type:** energy commodity — highly seasonal and storage-driven, regionally split
  (pipeline-constrained US vs LNG-linked global). Classify the thesis `Commodity-conditional`.

**Applicable lenses (apply ONLY these):**
- Market structure: the Henry Hub curve (a steep **seasonal** shape — winter premium); the TTF curve; the
  trans-Atlantic LNG arb.
- Supply/demand: US dry-gas production, LNG export feedgas, power-burn + heating demand; **EIA weekly
  storage vs the 5-year band** (the key buffer).
- Weather/seasonality (DOMINANT): **heating-degree-days** (winter) and **cooling-degree-days** (summer
  power burn); injection season (Apr–Oct) vs withdrawal (Nov–Mar); polar-vortex / heat-wave risk.
- Macro drivers: LNG export-capacity ramp, European storage + Russian-flow situation, coal-to-gas
  switching, weather-driven power demand.
- Positioning/flows: NYMEX **managed-money net length (CFTC COT)**; UNG flows.
- Valuation/fair value: coal-switching + producer-breakeven range; storage-implied; a range.

**Instruments (portfolio + expression):**
- `UNG` (front-month Henry Hub) — **severe roll drag / decay** in contango; a notorious long-term
  value-destroyer. `BOIL`/`KOLD` are leveraged and decay faster. Translate any UNG view to the HH curve.
- `NG` (NYMEX) futures — the direct expression; carries roll.
- Gas-producer equities are a LEVERED equity-risk proxy — not the molecule.

**Priority sources:** EIA (Weekly Natural Gas Storage Report, STEO, Natural Gas Weekly), NOAA / CPC
weather (HDD/CDD forecasts), CFTC COT, CME/ICE.

**Recurring reports (catalysts):** **EIA weekly storage (Thu 10:30 ET)** — the single biggest scheduled
mover; EIA STEO monthly; NOAA 6–10 / 8–14 day + seasonal outlooks; weekly CFTC COT.

**Family-specific physical-market rules:** Henry Hub, TTF and JKM are regional prices, not interchangeable
spot quotes. Any arbitrage must deduct liquefaction, shipping, boil-off, regasification and capacity limits,
with units and FX aligned. Judge storage against a weather-normalised injection/withdrawal expectation and
the five-year seasonal band, not the absolute stock level alone. Separate dry-gas production, pipeline
flows, LNG feedgas, power burn and residential/commercial weather demand; a single cold or hot forecast is
a scenario input until realised degree days and storage confirm it.

**Causal signal ownership (one fact, one owner):** CFTC managed-money positioning →
`commodity-positioning-flows`; EIA storage and realised injections/withdrawals →
`commodity-demand-inventory`; LNG feedgas/export demand → `commodity-demand-inventory`; production and
infrastructure constraints → `commodity-supply-security`;
degree days → `commodity-weather-seasonality`; curves, cash basis and regional arbitrage →
`commodity-price-curve`.

**Required semantic series (profile-owned; connector IDs are deliberately absent):**

| Need ID | Stable series ID | Owner orb | Required history / freshness | Lawful source policy |
|---|---|---|---|---|
| `natural-gas-managed-money-positioning` | `natural-gas.managed-money-positioning` | commodity-positioning-flows | weekly; ≥3 years and current COT observation | CFTC public API; Henry Hub futures-only disaggregated report |
| `natural-gas-etf-flows` | `natural-gas.etf-flows` | commodity-positioning-flows | daily/weekly UNG issuer shares or holdings | lawful issuer publications only; otherwise unavailable |
| `natural-gas-lower48-storage` | `natural-gas.lower48-storage` | commodity-demand-inventory | weekly; ≥5 full years of Lower 48 working gas for the seasonal band | EIA public API v2; retain revised vintages |
| `natural-gas-current-price` | `natural-gas.current-price` | commodity-price-curve | current front-month Henry Hub futures quote | reuse the swarm pulse quote transport (`@NG.1`); label it futures; no connector clone |
| `natural-gas-market-price-history` | `natural-gas.market-price-history` | commodity-price-curve | point-in-time Henry Hub close history with source identity | reuse lawful shared market history for `@NG.1`; continuous back-adjusted futures |
| `natural-gas-futures-curve` | `natural-gas.futures-curve` | commodity-price-curve | current multi-tenor Henry Hub settlement curve | lawful CME route with licence/source identity; otherwise manual or unavailable |
| `natural-gas-cash-price` | `natural-gas.cash-price` | commodity-price-curve | current deliverable Henry Hub cash assessment aligned by date and unit | lawful primary/licensed cash assessment; otherwise unavailable |
| `natural-gas-cash-futures-basis` | `natural-gas.cash-futures-basis` | commodity-price-curve | cash minus deliverable nearby future, as % of futures, with aligned timestamps | deterministic derivation from cash-price and futures-curve vintages; no independent vote |
| `natural-gas-dry-production` | `natural-gas.dry-production` | commodity-supply-security | current daily/weekly dry production and upstream/pipeline production outages | EIA plus primary pipeline releases where lawful; otherwise unavailable |
| `natural-gas-lng-feedgas-demand` | `natural-gas.lng-feedgas-demand` | commodity-demand-inventory | current daily/weekly LNG feedgas and realised export demand | EIA plus primary pipeline flow releases where lawful; otherwise unavailable |
| `natural-gas-lng-export-capacity-availability` | `natural-gas.lng-export-capacity-availability` | commodity-supply-security | current liquefaction capacity, commissioning and terminal availability/outages | EIA/DOE/FERC and primary terminal notices; otherwise unavailable |
| `natural-gas-sector-demand` | `natural-gas.sector-demand` | commodity-demand-inventory | current power burn, residential/commercial and industrial demand, weather-normalised | EIA primary sector-consumption data with weather vintage; otherwise unavailable |
| `natural-gas-europe-storage-balance` | `natural-gas.europe-storage-balance` | commodity-demand-inventory | current European storage level, capacity fill and seasonal comparison | primary/industry-body storage data with lawful access and vintage; otherwise unavailable |
| `natural-gas-russian-pipeline-availability` | `natural-gas.russian-pipeline-availability` | commodity-supply-security | current Russian pipeline capacity, nominations and restriction status into Europe | primary pipeline/operator and official restriction data; otherwise unavailable |
| `natural-gas-weather-degree-days` | `natural-gas.weather-degree-days` | commodity-weather-seasonality | realised and forecast HDD/CDD with vintage and normal | NOAA/CPC primary releases; forecasts must be frozen by retrieval time |
| `natural-gas-regional-lng-arbitrage` | `natural-gas.regional-lng-arbitrage` | commodity-price-curve | aligned Henry Hub, TTF and JKM netback after physical costs | lawful exchange/licensed prices and cited transport assumptions; otherwise unavailable |
| `natural-gas-cost-switching-range` | `natural-gas.cost-switching-range` | commodity-cost-curve-fair-value | current producer-breakeven and coal-to-gas switching range | primary producer cost disclosures and government utility-fuel data; estimate methods and dispersion required |

Declaring these rows does not make them usable. Missing cash, curve, weather, production/LNG or regional
price rights remain explicit gaps; the engine must not scrape them or infer them from Henry Hub alone.

---

## COPPER

- **Benchmark / grade:** LME Copper Grade A (USD/tonne) — the global benchmark; COMEX HG (US¢/lb); SHFE
  (RMB/tonne, China). Track the LME–COMEX and LME–SHFE arbs.
- **Quote unit + currency:** USD per tonne (LME); also give US¢/lb (COMEX).
- **Primary exchanges:** LME, COMEX (CME), SHFE.
- **Business type:** base / industrial metal — a mine-supply vs industrial-demand balance; "Dr Copper"
  macro barometer plus a structural electrification bid. Classify `Commodity-conditional` (macro-cyclical + structural demand).

**Applicable lenses (apply ONLY these):**
- Market structure: the LME **cash–3M spread** (backwardation = tightness); **LME/COMEX/SHFE warehouse
  stocks** (the visible buffer); treatment/refining charges (**TC/RCs**) as a concentrate-tightness tell.
- Supply/demand: mine supply (Chile/Peru/DRC) and disruptions (strikes, ore grades, water/permits), scrap;
  demand from construction, the grid, EV/electrification, China (ICSG balances); stocks-to-consumption.
- Weather/seasonality: NOT a weather commodity (mild China seasonality only — keep short).
- Macro drivers (dominant): China property + stimulus + grid spend, global PMIs, the **US dollar**, real
  rates, the **energy-transition** structural bid, mine-supply disruptions.
- Positioning/flows: COMEX **managed-money net length (CFTC COT)**; LME COTR; copper-ETF (`CPER`) flows.
- Valuation/fair value: the 90th-percentile mine cash-cost floor + the **incentive price** (needed to
  sanction new mines) as a structural anchor; a range.

**Instruments (portfolio + expression):**
- `CPER` (US Copper Index Fund) — tracks COMEX copper futures + roll. `COPX` = miner equities, a LEVERED
  proxy, not the metal.
- LME / COMEX (`HG`) futures — the direct expression; carries roll.
- Diversified miners (`FCX` and peers) are equity-risk proxies with their own operating leverage.

**Priority sources:** ICSG (International Copper Study Group), LME, COMEX, SHFE, Chile's Cochilco,
Wood Mackenzie / CRU (dated, labelled), CFTC COT.

**Recurring reports (catalysts):** ICSG monthly + biannual forecast; LME/COMEX/SHFE weekly stocks; China
monthly activity + PMI; major-miner quarterly production; CFTC COT.

**Family-specific physical-market rules:** align grade, warehouse eligibility, currency, unit and timestamp
before comparing LME, COMEX and SHFE. Never add exchange stocks without separating on-warrant,
cancelled-warrant and bonded/off-exchange material. TC/RC evidence belongs to `commodity-supply` and is
not a second vote for the same mine disruption. `commodity-supply` builds the pre-policy bridge from mine
and scrap output through domestic absorption and stock change; `commodity-supply-security` then applies
restrictions, sanctions, chokepoints and verified rerouting without duplicating those tonnes. China activity
is a demand input, not proof of copper demand without a primary end-use or refined-balance series.
Cross-asset ratios are computed from the declared price histories and count once under the correlation-cluster rule.

**Required semantic series (profile-owned; connector IDs are deliberately absent):**

| Need ID | Stable series ID | Owner orb | Required history / freshness | Lawful source policy |
|---|---|---|---|---|
| `copper-managed-money-positioning` | `copper.managed-money-positioning` | commodity-positioning-flows | weekly; ≥3 years and current COMEX COT observation | CFTC public API; Copper #1 futures-only disaggregated report |
| `copper-lme-investment-fund-positioning` | `copper.lme-investment-fund-positioning` | commodity-positioning-flows | weekly; ≥3 years of LME investment-fund positioning | lawful LME COTR publication or licensed feed; otherwise manual or unavailable |
| `copper-etf-flows` | `copper.etf-flows` | commodity-positioning-flows | daily/weekly CPER issuer shares or holdings | lawful issuer publications only; otherwise unavailable |
| `macro-broad-usd-index` | `macro.broad-usd-index` | commodity-macro-drivers | daily; ≥3 years for copper/USD regimes | reuse one Federal Reserve/FRED semantic series across commodity profiles; no commodity-specific clone |
| `macro-china-industrial-activity` | `macro.china-industrial-activity` | commodity-macro-drivers | monthly; ≥10 years with release vintage | primary official industrial production, fixed-asset investment and property completions; licensed PMI stays contextual |
| `macro-global-activity-demand-proxy` | `macro.global-activity-demand-proxy` | commodity-macro-drivers | monthly; ≥10 years with release vintage | primary global industrial-production/trade series or licensed PMI with source identity; unavailable otherwise |
| `macro-us-10y-real-yield` | `macro.us-10y-real-yield` | commodity-macro-drivers | daily; ≥3 years for real-rate regime validation | primary US Treasury or Federal Reserve/FRED series with release vintage; reuse one semantic series across profiles |
| `copper-current-price` | `copper.current-price` | commodity-price-curve | current front-month COMEX Copper futures quote | reuse the swarm pulse quote transport (`@HG.1`); label it USD/lb futures; no connector clone |
| `copper-comex-price-history` | `copper.comex-price-history` | commodity-price-curve | point-in-time COMEX Copper close history with source identity | reuse lawful shared market history for `@HG.1`; continuous back-adjusted futures |
| `copper-gold-price-history` | `copper.gold-price-history` | commodity-cross-asset-regime | point-in-time Gold close history aligned to copper | reuse lawful shared market history for `@GC.1`; continuous back-adjusted futures |
| `copper-miner-equity-history` | `copper.miner-equity-history` | commodity-cross-asset-regime | split-adjusted COPX history aligned to copper | lawful shared equity history; miners are a levered confirmation, not the metal |
| `copper-lme-cash-three-month-curve` | `copper.lme-cash-three-month-curve` | commodity-price-curve | current LME cash and 3-month prices plus spread history | lawful LME publication or licensed feed with exact prompt dates; otherwise manual or unavailable |
| `copper-visible-inventory` | `copper.visible-inventory` | commodity-demand-inventory | weekly; ≥5 years of LME, COMEX and SHFE eligible stocks | primary exchange warehouse reports; preserve warrant status and do not infer hidden stocks |
| `copper-inventory-accessibility-opacity` | `copper.inventory-accessibility-opacity` | commodity-demand-inventory | current off-warrant, bonded and off-exchange inventory evidence with estimate dispersion | primary warehouse/customs disclosures or licensed estimates; never infer hidden stocks as zero and apply opacity caps when coverage is weak |
| `copper-regional-arbitrage` | `copper.regional-arbitrage` | commodity-price-curve | aligned LME, COMEX and SHFE prices net of FX, tax and freight | lawful exchange/licensed prices with cited conversion assumptions; otherwise unavailable |
| `copper-concentrate-tcrc` | `copper.concentrate-tcrc` | commodity-supply | current spot and benchmark TC/RC with dispersion | primary smelter/miner contract disclosures or licensed assessment; otherwise unavailable |
| `copper-mine-prepolicy-supply` | `copper.mine-prepolicy-supply` | commodity-supply | monthly gross mine and scrap output bridge through domestic absorption and stock change | ICSG/USGS and producer/customs disclosures with disruptions and revisions retained; exclude restrictions and rerouting from this row |
| `copper-supply-restrictions-routing` | `copper.supply-restrictions-routing` | commodity-supply-security | current restricted, sanctioned or stranded tonnage and verified rerouting bridge | primary government, customs and producer evidence; start from the pre-policy bridge and do not recount production |
| `copper-refined-balance` | `copper.refined-balance` | commodity-demand-inventory | monthly refined production, use and stock-change bridge | ICSG or equivalent primary balance with revisions retained; otherwise unavailable |
| `copper-scrap-supply` | `copper.scrap-supply` | commodity-supply | current secondary supply and scrap-spread evidence | primary customs/industry data with grade and geography; estimates require dispersion |
| `copper-energy-transition-demand` | `copper.energy-transition-demand` | commodity-demand-inventory | current grid, EV and renewable copper demand bridge | primary deployment and intensity data; avoid double counting inside the refined balance |
| `copper-cost-incentive-range` | `copper.cost-incentive-range` | commodity-cost-curve-fair-value | current 90th-percentile cash cost and new-mine incentive range | primary producer studies and lawful cost data; observed price, implied range and market expectation stay separate |

Declaring these rows does not make them usable. Missing LME/SHFE rights, visible-stock breadth, TC/RC,
China demand or accessible-supply evidence remains explicit and forces incomplete coverage rather than a
COMEX-only global conclusion.

---

## ALUMINIUM

- **Benchmark / grade:** LME Aluminium (USD/tonne) high-grade primary; SHFE (China). Plus the regional
  **physical premiums** (US Midwest, European duty-paid) — a separate, material cost layer on top of LME.
- **Quote unit + currency:** USD per tonne; always add the regional physical premium.
- **Primary exchanges:** LME, SHFE, COMEX.
- **Business type:** base metal — energy-intensive (power is ~40% of cost — "congealed electricity"),
  with a China supply-cap dynamic. Classify the thesis `Commodity-conditional`.

**Applicable lenses (apply ONLY these):**
- Market structure: the LME cash–3M spread; **LME/SHFE stocks** + off-warrant/hidden stocks; the
  **regional premium** (Midwest, European duty-paid).
- Supply/demand: primary smelter output (China's capacity cap, power curtailments, Russia/sanctions
  metal), alumina/bauxite feed; demand from transport/packaging/construction; stocks.
- Weather/seasonality: NOT weather-driven; hydro-power availability (Yunnan) affects Chinese smelting —
  note only that.
- Macro drivers (dominant): **power / energy prices** (the swing cost), China's supply cap + property, the
  US dollar, sanctions on Russian metal, the decarbonization / green-premium.
- Positioning/flows: LME COTR; SHFE positioning.
- Valuation/fair value: the marginal (power-driven) smelter cash cost as the floor; a range.

**Instruments (portfolio + expression):**
- LME Aluminium futures — the direct expression. There is **no deep US aluminium ETF**; ETNs are thin and
  carry issuer credit risk, so exposure is usually via LME or producer equities (levered).

**Priority sources:** IAI (International Aluminium Institute), LME, SHFE, CRU / Harbor (dated), CFTC / LME COTR.

**Recurring reports (catalysts):** IAI monthly production; LME/SHFE weekly stocks; China output data;
premium assessments (Platts/Fastmarkets).

**Family-specific physical-market rules:** keep the LME benchmark separate from Midwest and European
physical premiums. Align alloy/grade, duty status, delivery location, currency and timestamp before any
regional comparison. Separate on-warrant, cancelled-warrant, off-warrant and bonded stocks; visible LME
stocks are not global inventory. Treat bauxite, alumina, power and smelter output as successive causal
stages owned by `commodity-supply`, not four independent votes. That orb builds the pre-policy bridge;
`commodity-supply-security` alone applies sanctions, trade restrictions, financing chokepoints and verified
rerouting without recounting output. A dead or stale `@ALI.1` quote is missing data and can never be replaced
by a remembered report price.

**Required semantic series (profile-owned; connector IDs are deliberately absent):**

| Need ID | Stable series ID | Owner orb | Required history / freshness | Lawful source policy |
|---|---|---|---|---|
| `aluminium-lme-investment-fund-positioning` | `aluminium.investment-fund-positioning` | commodity-positioning-flows | weekly; ≥3 years of LME investment-fund positioning | lawful LME COTR publication; manual ingest if licence terms prohibit automation |
| `aluminium-shfe-positioning` | `aluminium.shfe-positioning` | commodity-positioning-flows | weekly; ≥3 years of observable SHFE positioning | primary exchange publication or licensed feed; otherwise unavailable |
| `macro-broad-usd-index` | `macro.broad-usd-index` | commodity-macro-drivers | daily; ≥3 years for aluminium/USD regimes | reuse one Federal Reserve/FRED semantic series across commodity profiles; no commodity-specific clone |
| `macro-china-industrial-activity` | `macro.china-industrial-activity` | commodity-macro-drivers | monthly; ≥10 years with release vintage | primary official industrial production, fixed-asset investment and property completions; licensed PMI stays contextual |
| `macro-global-activity-demand-proxy` | `macro.global-activity-demand-proxy` | commodity-macro-drivers | monthly; ≥10 years with release vintage | primary global industrial-production/trade series or licensed PMI with source identity; unavailable otherwise |
| `macro-us-10y-real-yield` | `macro.us-10y-real-yield` | commodity-macro-drivers | daily; ≥3 years for real-rate regime validation | primary US Treasury or Federal Reserve/FRED series with release vintage; reuse one semantic series across profiles |
| `aluminium-current-price` | `aluminium.current-price` | commodity-price-curve | current front-month aluminium futures quote | reuse the swarm pulse route (`@ALI.1`) only if live and correctly identified; stale/dead contracts are unavailable |
| `aluminium-market-price-history` | `aluminium.market-price-history` | commodity-price-curve | point-in-time aluminium close history with source identity | reuse lawful shared market history for `@ALI.1` only when the contract identity is live and continuous |
| `aluminium-copper-price-history` | `aluminium.copper-price-history` | commodity-cross-asset-regime | point-in-time COMEX Copper close history aligned to aluminium | reuse lawful shared market history for `@HG.1`; copper/aluminium is one relative-cycle cluster |
| `aluminium-producer-equity-history` | `aluminium.producer-equity-history` | commodity-cross-asset-regime | split-adjusted Alcoa history aligned to aluminium | lawful shared equity history; one producer is a levered confirmation and never substitutes for the metal |
| `aluminium-lme-cash-three-month-curve` | `aluminium.lme-cash-three-month-curve` | commodity-price-curve | current LME cash and 3-month prices plus spread history | lawful LME publication or licensed feed with exact prompt dates; otherwise manual or unavailable |
| `aluminium-visible-inventory` | `aluminium.visible-inventory` | commodity-demand-inventory | weekly; ≥5 years of LME and SHFE eligible stocks | primary exchange warehouse reports; preserve warrant/bonded status and do not infer hidden stocks |
| `aluminium-inventory-accessibility-opacity` | `aluminium.inventory-accessibility-opacity` | commodity-demand-inventory | current cancelled-warrant, off-warrant, bonded and off-exchange inventory evidence with estimate dispersion | primary warehouse/customs disclosures or licensed estimates; never infer hidden stocks as zero and apply opacity caps when coverage is weak |
| `aluminium-regional-premiums` | `aluminium.regional-premiums` | commodity-price-curve | current Midwest and European duty-paid physical premiums | licensed assessment with grade, duty and delivery basis; otherwise unavailable |
| `aluminium-lme-shfe-arbitrage` | `aluminium.lme-shfe-arbitrage` | commodity-price-curve | aligned LME and SHFE prices net of FX, VAT, duty and freight | lawful exchange/licensed prices with cited conversion assumptions; otherwise unavailable |
| `aluminium-primary-production` | `aluminium.primary-production` | commodity-supply | monthly; ≥3 years of world and China primary output | IAI entitled publication; manual ingest only under current terms, retain revised vintages |
| `aluminium-china-capacity-power` | `aluminium.china-capacity-power` | commodity-supply | current capacity-cap, hydro and curtailment evidence | primary Chinese central/provincial, grid and producer releases; news scans are contextual only |
| `aluminium-bauxite-alumina` | `aluminium.bauxite-alumina` | commodity-supply | monthly bauxite, alumina and refinery-disruption bridge | USGS/customs/producer primary data with geography; restrictions belong only in the supply-security bridge |
| `aluminium-energy-input-cost` | `aluminium.energy-input-cost` | commodity-cost-curve-fair-value | current regional power and carbon cost curve for smelters | primary tariff, fuel and carbon-market data; state assumptions and dispersion |
| `aluminium-prepolicy-supply` | `aluminium.prepolicy-supply` | commodity-supply | monthly gross primary and secondary output bridge through domestic absorption and stock change | primary IAI, customs and producer evidence with revisions retained; exclude restrictions and rerouting from this row |
| `aluminium-supply-restrictions-routing` | `aluminium.supply-restrictions-routing` | commodity-supply-security | current restricted, sanctioned or stranded metal and verified rerouting bridge | primary government, customs and producer evidence; start from the pre-policy bridge and do not recount production |
| `aluminium-end-use-demand` | `aluminium.end-use-demand` | commodity-demand-inventory | monthly transport, packaging and construction demand plus stock change | primary end-use and trade data; do not infer world demand from China output alone |
| `aluminium-scrap-supply` | `aluminium.scrap-supply` | commodity-supply | current secondary production and scrap-spread evidence | primary customs/industry data with alloy and geography; estimates require dispersion |
| `aluminium-marginal-smelter-cost` | `aluminium.marginal-smelter-cost` | commodity-cost-curve-fair-value | current marginal smelter cash-cost range | primary producer disclosures and lawful power/alumina inputs; separate observed price, model range and market expectation |

Declaring these rows does not make them usable. Missing live benchmark prices, LME/SHFE stocks, regional
premium rights, China capacity evidence or accessible-supply bridges stays explicit and forces Research More.

---

## WHEAT

- **Benchmark / grade:** CBOT SRW (soft red winter, US¢/bushel) — the common reference; KC HRW (hard red
  winter, protein); MGEX HRS (spring). Plus **Black Sea (Russian FOB)** as the export price-setter and
  Euronext MATIF (milling wheat, EUR/t).
- **Quote unit + currency:** US cents per bushel (CBOT); give the absolute and note the Black Sea FOB level.
- **Primary exchanges:** CBOT (CME), KC, MGEX, Euronext MATIF, plus Russian / Black Sea physical.
- **Business type:** grain — a production/consumption balance with a large **export-geopolitics**
  component (Black Sea). Classify the thesis `Commodity-conditional`.

**Applicable lenses (apply ONLY these):**
- Market structure: the CBOT curve; the SRW–HRW–spring **spreads** (protein/quality); the
  CBOT–MATIF–Black Sea spreads.
- Cross-asset regime: the wheat/corn ratio as one relative-demand confirmation cluster; it cannot also
  vote in market structure.
- Supply/demand: global production (Russia, EU, US, Canada, Australia, Ukraine, Argentina) vs food/feed;
  USDA WASDE + IGC world balance; **major-exporter stocks-to-use** (matters more than China's stockpile).
- Weather/seasonality (DOMINANT): NH winter-wheat dormancy/**winterkill**, spring planting, the SH
  (Australia/Argentina) crop; drought monitors; harvest windows.
- Supply security: dated Black Sea war/logistics constraints, export bans, taxes/quotas and verified
  rerouting through the accessible-supply bridge.
- Macro drivers: the broad **US dollar**, exporter FX (RUB, EUR, AUD, CAD, ARS) and non-policy
  energy/fertilizer input-cost context.
- Positioning/flows: CBOT **managed-money net length (CFTC COT)**; WEAT flows.
- Valuation/fair value: cost-of-production + export-parity; a range.

**Instruments (portfolio + expression):**
- `WEAT` (Teucrium Wheat) — holds CBOT SRW contracts spread across months (softer roll); tracks the
  futures curve, not spot. `ZW` (CBOT) futures = the direct expression; KC/MGEX for protein plays.

**Priority sources:** USDA (WASDE, Crop Progress, Grain Stocks, Export Sales), IGC, FAO AMIS, Russian /
UkrAgroConsult trade data (dated, labelled), CFTC COT.

**Recurring reports (catalysts):** USDA WASDE (monthly), Crop Progress (weekly in season), Grain Stocks +
Prospective Plantings (quarterly / spring), weekly Export Sales; IGC Grain Market Report; CFTC COT.

**Family-specific physical-market rules:** keep old-crop and new-crop contracts separate and align crop
year, grade, protein, location, currency, unit and timestamp before comparing prices or balances. Weather
evidence must be yield-weighted to the growing region and matched to the crop's live phenological stage;
a seasonal forecast is a probability distribution, never realised yield. The WASDE balance belongs to
`commodity-demand-inventory`; acreage, yield and production belong to `commodity-supply`, and the same
USDA production number cannot vote twice. `commodity-supply-security` alone owns export bans, taxes,
war/logistics chokepoints and verified rerouting. Major-exporter stocks matter separately from inaccessible
stockpiles, and low country coverage or stale estimates trigger the supply-opacity cap.

**Required semantic series (profile-owned; connector IDs are deliberately absent):**

| Need ID | Stable series ID | Owner orb | Required history / freshness | Lawful source policy |
|---|---|---|---|---|
| `wheat-managed-money-positioning` | `wheat.managed-money-positioning` | commodity-positioning-flows | weekly; ≥3 years and current CBOT SRW COT observation | CFTC public API; exact WHEAT-SRW futures-only disaggregated contract |
| `wheat-etf-flows` | `wheat.etf-flows` | commodity-positioning-flows | daily/weekly WEAT issuer shares or holdings | lawful issuer publications only; otherwise unavailable |
| `climate-enso-oni` | `climate.enso.oni` | commodity-weather-seasonality | monthly; ≥30 years of dated ONI history | NOAA CPC official ONI; ENSO is context and cannot substitute for crop-region weather |
| `macro-broad-usd-index` | `macro.broad-usd-index` | commodity-macro-drivers | daily; ≥3 years for grain/USD regimes | reuse one Federal Reserve/FRED semantic series across commodity profiles; no commodity-specific clone |
| `wheat-exporter-fx` | `wheat.exporter-fx` | commodity-macro-drivers | daily; ≥3 years of RUB, EUR, AUD, CAD and ARS against USD | primary central-bank or lawful market history with exact FX bases; otherwise unavailable |
| `wheat-current-price` | `wheat.current-price` | commodity-price-curve | current front-month CBOT SRW Wheat futures quote | reuse the swarm pulse quote transport (`@W.1`); label it US¢/bu futures; no connector clone |
| `wheat-cbot-price-history` | `wheat.cbot-price-history` | commodity-price-curve | point-in-time CBOT SRW close history with source identity | reuse lawful shared market history for `@W.1`; continuous back-adjusted futures |
| `wheat-corn-price-history` | `wheat.corn-price-history` | commodity-cross-asset-regime | point-in-time CBOT Corn close history aligned to wheat | reuse lawful shared market history for `@C.1`; the wheat/corn ratio is one relative-demand cluster |
| `wheat-cbot-forward-curve` | `wheat.cbot-forward-curve` | commodity-price-curve | current old-crop/new-crop CBOT settlements with ≥3 years of curve snapshots | CME official or licensed settlements with exact contracts; otherwise unavailable |
| `wheat-protein-quality-spreads` | `wheat.protein-quality-spreads` | commodity-price-curve | current SRW, HRW and HRS prices with grade and protein basis | lawful CME/MGEX or licensed prices; never compare unaligned grades |
| `wheat-export-parity` | `wheat.export-parity` | commodity-price-curve | current CBOT, MATIF and Black Sea export prices net of FX and freight | lawful exchange and primary export quotations; Black Sea estimates require source dispersion |
| `grains-usda-wasde-balance` | `grains.usda-wasde-balance` | commodity-demand-inventory | monthly; current point-in-time US and world supply/use tables | USDA WAOB official XML; revisions retained; production cells are bridge inputs and cannot cast a second demand vote |
| `wheat-major-exporter-stocks-use` | `wheat.major-exporter-stocks-use` | commodity-demand-inventory | monthly; ≥10 years of major-exporter ending stocks and use | USDA/IGC primary balance with China and inaccessible stocks shown separately; otherwise unavailable |
| `wheat-crop-progress-condition` | `wheat.crop-progress-condition` | commodity-weather-seasonality | weekly in season; ≥10 years by class and state/region | USDA NASS and equivalent primary crop reports with release vintage; otherwise unavailable |
| `wheat-weather-phenology` | `wheat.weather-phenology` | commodity-weather-seasonality | current plus ≥30 years of daily yield-weighted weather aligned to live crop stage | primary meteorological observations/forecasts with geography, model run and expiry; otherwise unavailable |
| `wheat-acreage-yield-production` | `wheat.acreage-yield-production` | commodity-supply | current acreage, yield and output by major origin with estimate dispersion | USDA, Statistics Canada, ABARES, EU and other primary crop releases; do not duplicate WASDE balance signals |
| `wheat-export-sales-shipments` | `wheat.export-sales-shipments` | commodity-demand-inventory | weekly; ≥5 market years of sales, reductions/adjustments and shipments by destination | USDA FAS primary data; use the non-overlapping All Wheat total and separate gross sales, net sales and physical shipment |
| `wheat-major-origin-shipments` | `wheat.major-origin-shipments` | commodity-demand-inventory | monthly; ≥5 years of realised wheat shipments from Russia, the EU, Canada, Australia and Argentina | primary customs, port or official trade data by origin, destination and wheat HS code; keep missing origins explicit and never substitute USDA U.S. sales or forecast balances |
| `wheat-supply-restrictions-routing` | `wheat.supply-restrictions-routing` | commodity-supply-security | current export bans/taxes, Black Sea capacity and verified rerouting | primary government, customs and port evidence; start from pre-policy supply and do not recount production |
| `wheat-cost-export-parity-range` | `wheat.cost-export-parity-range` | commodity-cost-curve | current farm cash-cost and marginal export-parity range | primary farm budgets/input prices and lawful freight/FX; separate observed price, model range and market expectation |

Declaring these rows does not make them usable. A current CBOT quote, CFTC row and WASDE table cannot
stand in for crop-stage weather, exporter stocks, physical export parity or accessible Black Sea supply;
any missing required series keeps both horizons not assessable and forces Research More.

---

## CORN

- **Benchmark / grade:** CBOT Corn (US¢/bushel) — the global benchmark.
- **Quote unit + currency:** US cents per bushel (CBOT).
- **Primary exchanges:** CBOT (CME), DCE (China), plus Brazil / Argentina physical.
- **Business type:** grain — the largest US crop; feed + ethanol + export demand; tightly linked to
  soybeans (acreage competition) and energy (ethanol). Classify the thesis `Commodity-conditional`.

**Applicable lenses (apply ONLY these):**
- Market structure: the CBOT old-crop/new-crop curve, local basis and implementable corn–ethanol/DDG
  processing margins.
- Cross-asset regime: the corn/soybean ratio (acreage confirmation) and corn/crude breadth; each is one
  clustered confirmation and cannot vote in market structure or physical ethanol demand.
- Supply/demand: US + Brazil (safrinha second crop) + Argentina + Ukraine production vs feed/ethanol/export;
  USDA WASDE; ending stocks + stocks-to-use.
- Weather/seasonality (DOMINANT): US Corn Belt planting (Apr–May), **pollination (July — the critical
  weather window)**, harvest; Brazil safrinha weather; drought monitor; ENSO.
- Supply security: dated biofuel mandates/credits, export restrictions, port constraints and verified
  rerouting through the accessible-supply bridge.
- Macro drivers: the broad **US dollar**, producer FX (BRL, ARS, UAH) and non-policy fertilizer/input-cost
  context.
- Positioning/flows: CBOT **managed-money net length (CFTC COT)**; CORN flows.
- Valuation/fair value: cost-of-production + ethanol/feed value; a range.

**Instruments (portfolio + expression):**
- `CORN` (Teucrium Corn) — CBOT corn contracts spread across months; tracks the curve. `ZC` (CBOT)
  futures = the direct expression.

**Priority sources:** USDA (WASDE, Crop Progress, Grain Stocks, Prospective Plantings, Export Sales),
CONAB (Brazil), CFTC COT, EIA (ethanol).

**Recurring reports (catalysts):** USDA WASDE (monthly), Crop Progress (weekly), Grain Stocks +
Prospective Plantings + Acreage (Mar/Jun), weekly Export Sales; CFTC COT.

**Family-specific physical-market rules:** separate old-crop from new-crop and US from Brazil safrinha and
Argentina crop years. Align grade, delivery location, currency, unit and timestamp before computing basis or
export parity. Weather must be yield-weighted and matched to planting, pollination or grain fill; an ENSO
label is not a yield forecast. The WASDE balance belongs to `commodity-demand-inventory`; acreage, yield
and production belong to `commodity-supply`. Ethanol demand is counted once from physical grind/output,
not again from crude correlation or policy headlines. `commodity-supply-security` owns biofuel mandates
and credits, export restrictions, logistics and rerouting, while low origin coverage triggers the
supply-opacity cap.

**Required semantic series (profile-owned; connector IDs are deliberately absent):**

| Need ID | Stable series ID | Owner orb | Required history / freshness | Lawful source policy |
|---|---|---|---|---|
| `corn-managed-money-positioning` | `corn.managed-money-positioning` | commodity-positioning-flows | weekly; ≥3 years and current CBOT Corn COT observation | CFTC public API; exact CORN futures-only disaggregated contract |
| `corn-etf-flows` | `corn.etf-flows` | commodity-positioning-flows | daily/weekly CORN issuer shares or holdings | lawful issuer publications only; otherwise unavailable |
| `climate-enso-oni` | `climate.enso.oni` | commodity-weather-seasonality | monthly; ≥30 years of dated ONI history | NOAA CPC official ONI; ENSO is context and cannot substitute for crop-region weather |
| `macro-broad-usd-index` | `macro.broad-usd-index` | commodity-macro-drivers | daily; ≥3 years for grain/USD regimes | reuse one Federal Reserve/FRED semantic series across commodity profiles; no commodity-specific clone |
| `corn-exporter-fx` | `corn.exporter-fx` | commodity-macro-drivers | daily; ≥3 years of BRL, ARS and UAH against USD | primary central-bank or lawful market history with exact FX bases; otherwise unavailable |
| `corn-current-price` | `corn.current-price` | commodity-price-curve | current front-month CBOT Corn futures quote | reuse the swarm pulse quote transport (`@C.1`); label it US¢/bu futures; no connector clone |
| `corn-cbot-price-history` | `corn.cbot-price-history` | commodity-price-curve | point-in-time CBOT Corn close history with source identity | reuse lawful shared market history for `@C.1`; continuous back-adjusted futures |
| `corn-soybeans-price-history` | `corn.soybeans-price-history` | commodity-cross-asset-regime | point-in-time CBOT Soybeans close history aligned to corn | reuse lawful shared market history for `@S.1`; the corn/soybean ratio is one acreage cluster |
| `corn-crude-price-history` | `corn.crude-price-history` | commodity-cross-asset-regime | point-in-time WTI close history aligned to corn | reuse lawful shared market history for `@CL.1`; crude is an ethanol-demand confirmation, not corn itself |
| `corn-cbot-forward-curve` | `corn.cbot-forward-curve` | commodity-price-curve | current old-crop/new-crop CBOT settlements with ≥3 years of curve snapshots | CME official or licensed settlements with exact contracts; otherwise unavailable |
| `corn-local-basis-export-parity` | `corn.local-basis-export-parity` | commodity-price-curve | current US interior/Gulf, Brazil and Argentina basis net of FX and freight | primary AMS/customs/port data or licensed assessments with location and grade; otherwise unavailable |
| `grains-usda-wasde-balance` | `grains.usda-wasde-balance` | commodity-demand-inventory | monthly; current point-in-time US and world supply/use tables | USDA WAOB official XML; revisions retained; production cells are bridge inputs and cannot cast a second demand vote |
| `corn-stocks-use` | `corn.stocks-use` | commodity-demand-inventory | quarterly/monthly; ≥10 years of on-farm/off-farm stocks and stocks-to-use | USDA NASS/WASDE primary data; reconcile quarterly stocks to the balance and preserve revisions |
| `corn-crop-progress-condition` | `corn.crop-progress-condition` | commodity-weather-seasonality | weekly in season; ≥10 years by state | USDA NASS and equivalent primary crop reports with release vintage; otherwise unavailable |
| `corn-weather-phenology` | `corn.weather-phenology` | commodity-weather-seasonality | current plus ≥30 years of daily yield-weighted weather aligned to planting/pollination/grain fill | primary meteorological observations/forecasts with geography, model run and expiry; otherwise unavailable |
| `corn-acreage-yield-production` | `corn.acreage-yield-production` | commodity-supply | current US, Brazil, Argentina and Ukraine acreage/yield/output with dispersion | USDA, CONAB and other primary crop releases; do not duplicate WASDE balance signals |
| `corn-export-sales-china-demand` | `corn.export-sales-china-demand` | commodity-demand-inventory | weekly; ≥5 market years of sales, reductions/adjustments and shipments by destination | USDA FAS primary data; preserve China as a destination and separate gross sales, net sales and physical shipment |
| `corn-ethanol-demand` | `corn.ethanol-demand` | commodity-demand-inventory | weekly/monthly physical ethanol output, stocks and corn grind plus margin inputs | EIA/USDA primary data; policy or crude-price moves are context and cannot replace physical grind |
| `corn-biofuel-policy` | `corn.biofuel-policy` | commodity-supply-security | current dated mandates, credits and blend-rule changes | primary regulator publications with effective date and expiry; policy cannot cast a physical-demand vote |
| `corn-supply-restrictions-routing` | `corn.supply-restrictions-routing` | commodity-supply-security | current export restrictions, port capacity and verified rerouting | primary government, customs and port evidence; start from pre-policy supply and do not recount production |
| `corn-cost-value-range` | `corn.cost-value-range` | commodity-cost-curve | current marginal farm cash-cost and feed/ethanol/export-parity range | primary farm budgets/input prices and lawful physical values; separate observed price, model range and market expectation |

Declaring these rows does not make them usable. US weather or stocks alone cannot establish the global
balance, and a crude-price correlation cannot manufacture ethanol demand. Missing physical basis, crop-stage
weather or major-origin production keeps both horizons not assessable and forces Research More.

---

## SOYBEANS

- **Benchmark / grade:** CBOT Soybeans (US¢/bushel); plus the products — soybean **meal** (USD/short ton)
  and soybean **oil** (US¢/lb) — and the **board crush** spread.
- **Quote unit + currency:** US cents per bushel; track meal, oil, and the crush spread.
- **Primary exchanges:** CBOT (CME), DCE (China), Brazil / Argentina physical.
- **Business type:** oilseed — dominated by China import demand and South American supply; crush economics
  (meal for feed, oil for food/biodiesel). Classify the thesis `Commodity-conditional`.

**Applicable lenses (apply ONLY these):**
- Market structure: the CBOT old-crop/new-crop curve, export basis and the implementable **board crush**
  using aligned bean, meal and oil contract months.
- Cross-asset regime: the soybean/corn acreage ratio and meal/oil breadth confirmations; correlated product
  legs remain one crush cluster and cannot also vote in market structure.
- Supply/demand: US + Brazil + Argentina production vs China imports + domestic crush; USDA WASDE;
  stocks-to-use (Brazil is now the swing supplier).
- Weather/seasonality (DOMINANT): US growing season (**Aug pod-fill** the key window), Brazil (Nov–Mar) +
  Argentina weather; ENSO (La Niña = SA drought risk).
- Supply security: dated biofuel mandates/credits, tariffs, export taxes, port constraints and verified
  rerouting through the accessible-supply bridge.
- Macro drivers: the broad **US dollar**, producer/importer FX (BRL, ARS, CNY) and non-policy input-cost
  context.
- Positioning/flows: CBOT **managed-money net length (CFTC COT)**; SOYB flows.
- Valuation/fair value: cost-of-production + crush value; a range.

**Instruments (portfolio + expression):**
- `SOYB` (Teucrium Soybean) — CBOT soybean contracts spread across months. `ZS` (beans), `ZM` (meal),
  `ZL` (oil) futures = the direct expressions.

**Priority sources:** USDA (WASDE, Crop Progress, Export Sales, Grain Stocks), CONAB (Brazil),
Rosario / Buenos Aires grain exchanges (Argentina), CFTC COT.

**Recurring reports (catalysts):** USDA WASDE (monthly), weekly Export Sales (watch the China cadence),
Crop Progress; CONAB monthly; CFTC COT.

**Family-specific physical-market rules:** separate old-crop/new-crop and US, Brazil and Argentina crop
years. Align beans, meal and oil contract months, conversion yields, currency and units before computing the
board crush; meal and oil are joint products, not two independent soybean-demand votes. Weather evidence
must be yield-weighted and matched to planting, flowering and pod fill. The WASDE balance belongs to
`commodity-demand-inventory`; acreage, yield and production belong to `commodity-supply`. China purchase
announcements are not shipments, and `commodity-supply-security` alone owns biofuel mandates/credits,
tariffs, export taxes, logistics and verified rerouting. Low origin coverage triggers the supply-opacity cap.

**Required semantic series (profile-owned; connector IDs are deliberately absent):**

| Need ID | Stable series ID | Owner orb | Required history / freshness | Lawful source policy |
|---|---|---|---|---|
| `soybeans-managed-money-positioning` | `soybeans.managed-money-positioning` | commodity-positioning-flows | weekly; ≥3 years and current CBOT Soybeans COT observation | CFTC public API; exact SOYBEANS futures-only disaggregated contract |
| `soybeans-etf-flows` | `soybeans.etf-flows` | commodity-positioning-flows | daily/weekly SOYB issuer shares or holdings | lawful issuer publications only; otherwise unavailable |
| `climate-enso-oni` | `climate.enso.oni` | commodity-weather-seasonality | monthly; ≥30 years of dated ONI history | NOAA CPC official ONI; ENSO is context and cannot substitute for crop-region weather |
| `macro-broad-usd-index` | `macro.broad-usd-index` | commodity-macro-drivers | daily; ≥3 years for grain/USD regimes | reuse one Federal Reserve/FRED semantic series across commodity profiles; no commodity-specific clone |
| `soybeans-trade-fx` | `soybeans.trade-fx` | commodity-macro-drivers | daily; ≥3 years of producer BRL/ARS and importer CNY against USD | primary central-bank or lawful market history with exact FX bases and roles; otherwise unavailable |
| `soybeans-current-price` | `soybeans.current-price` | commodity-price-curve | current front-month CBOT Soybeans futures quote | reuse the swarm pulse quote transport (`@S.1`); label it US¢/bu futures; no connector clone |
| `soybeans-cbot-price-history` | `soybeans.cbot-price-history` | commodity-price-curve | point-in-time CBOT Soybeans close history with source identity | reuse lawful shared market history for `@S.1`; continuous back-adjusted futures |
| `soybeans-corn-price-history` | `soybeans.corn-price-history` | commodity-cross-asset-regime | point-in-time CBOT Corn close history aligned to soybeans | reuse lawful shared market history for `@C.1`; the soybean/corn ratio is one acreage cluster |
| `soybeans-meal-price-history` | `soybeans.meal-price-history` | commodity-cross-asset-regime | point-in-time CBOT Soybean Meal close history aligned to beans | reuse lawful shared market history for `@SM.1`; meal is one crush-product confirmation |
| `soybeans-oil-price-history` | `soybeans.oil-price-history` | commodity-cross-asset-regime | point-in-time CBOT Soybean Oil close history aligned to beans | reuse lawful shared market history for `@BO.1`; oil is one crush-product confirmation |
| `soybeans-cbot-forward-curve` | `soybeans.cbot-forward-curve` | commodity-price-curve | current old-crop/new-crop CBOT settlements with ≥3 years of curve snapshots | CME official or licensed settlements with exact contracts; otherwise unavailable |
| `soybeans-board-crush` | `soybeans.board-crush` | commodity-price-curve | current and historical bean/meal/oil crush using aligned contract months | lawful CME settlements with stated conversion yields and fees; reject mismatched months |
| `soybeans-export-basis-parity` | `soybeans.export-basis-parity` | commodity-price-curve | current US Gulf, Brazil and Argentina basis net of FX, taxes and freight | primary customs/port data or licensed assessments with location and grade; otherwise unavailable |
| `grains-usda-wasde-balance` | `grains.usda-wasde-balance` | commodity-demand-inventory | monthly; current point-in-time US and world supply/use tables | USDA WAOB official XML; revisions retained; production cells are bridge inputs and cannot cast a second demand vote |
| `soybeans-stocks-use` | `soybeans.stocks-use` | commodity-demand-inventory | monthly; ≥10 years of US, world and major-exporter ending stocks and stocks-to-use | USDA primary balances with inaccessible China stocks separated and revisions retained; otherwise unavailable |
| `soybeans-crop-progress-condition` | `soybeans.crop-progress-condition` | commodity-weather-seasonality | weekly in season; ≥10 years by state/region | USDA NASS and equivalent primary crop reports with release vintage; otherwise unavailable |
| `soybeans-weather-phenology` | `soybeans.weather-phenology` | commodity-weather-seasonality | current plus ≥30 years of daily yield-weighted weather aligned to flowering/pod fill | primary meteorological observations/forecasts with geography, model run and expiry; otherwise unavailable |
| `soybeans-acreage-yield-production` | `soybeans.acreage-yield-production` | commodity-supply | current US, Brazil and Argentina acreage/yield/output with dispersion | USDA, CONAB and other primary crop releases; do not duplicate WASDE balance signals |
| `soybeans-us-export-sales-shipments` | `soybeans.us-export-sales-shipments` | commodity-demand-inventory | weekly; ≥5 market years of US sales, reductions/adjustments and shipments by destination | USDA FAS primary data; preserve China as a destination and separate gross sales, net sales and physical shipment |
| `soybeans-china-import-arrivals` | `soybeans.china-import-arrivals` | commodity-demand-inventory | monthly/current China customs arrivals by origin | primary Chinese customs data; US sales and announced purchases cannot substitute for arrival |
| `soybeans-crush-product-stocks` | `soybeans.crush-product-stocks` | commodity-demand-inventory | monthly physical crush, meal/oil output and product stocks | USDA NASS/EIA and primary industry releases; reconcile joint-product yields and avoid double counting |
| `soybeans-biofuel-physical-use` | `soybeans.biofuel-physical-use` | commodity-demand-inventory | monthly realised soybean-oil biofuel use and feedstock share | EIA/USDA primary physical-use data; mandates and credits cannot cast this demand vote |
| `soybeans-biofuel-policy` | `soybeans.biofuel-policy` | commodity-supply-security | current dated mandates, credits and blend-rule changes | primary regulator publications with effective date and expiry; policy cannot cast a physical-demand vote |
| `soybeans-supply-restrictions-routing` | `soybeans.supply-restrictions-routing` | commodity-supply-security | current tariffs/export taxes, port constraints and verified rerouting | primary government, customs and port evidence; start from pre-policy supply and do not recount production |
| `soybeans-cost-crush-value-range` | `soybeans.cost-crush-value-range` | commodity-cost-curve | current marginal farm cash-cost and crush/export-parity range | primary farm budgets/input prices and lawful product values; separate observed price, model range and market expectation |

Declaring these rows does not make them usable. A CBOT quote, ONI state and WASDE table cannot replace
crop-stage weather, South American production, China arrivals or a contract-aligned crush. Missing required
physical evidence keeps both horizons not assessable and forces Research More.

---

## COFFEE

- **Benchmark / grade:** ICE Arabica ("Coffee C", US¢/lb, New York); ICE Robusta (USD/tonne, London).
  Track the Arabica–Robusta spread.
- **Quote unit + currency:** US cents per pound (Arabica C).
- **Primary exchanges:** ICE (NY Arabica, London Robusta), B3 (Brazil).
- **Business type:** agricultural soft — supply dominated by Brazil (Arabica) and Vietnam (Robusta); a
  weather + biennial-bearing cycle plus export FX. Classify the thesis `Commodity-conditional`.

**Applicable lenses (apply ONLY these):**
- Market structure: the ICE Arabica curve and delivery/quality basis.
- Cross-asset regime: the unit/FX-aligned **Arabica–Robusta spread** as one substitution cluster.
- Supply/demand: Brazil + Vietnam + Colombia production (the biennial "on/off" cycle) vs global
  consumption; ICO balance; certified stocks.
- Weather/seasonality (DOMINANT): **Brazil frost (May–Aug)** and drought at flowering (Sep–Oct), Vietnam
  monsoon; the biennial-bearing year.
- Supply security: dated EUDR/compliance rules, port constraints and verified rerouting.
- Macro drivers: the broad **US dollar**, producer FX (BRL, VND, COP) and non-policy freight/input costs.
- Positioning/flows: ICE Arabica **managed-money net length (CFTC COT)**; JO ETN flows.
- Valuation/fair value: Brazilian cash cost + export-parity; a range.

**Instruments (portfolio + expression):**
- `JO` (iPath Coffee ETN — carries **issuer credit risk**; tracks ICE Arabica futures + roll). `KC` (ICE
  Arabica), `RC` (Robusta) futures = the direct expressions.

**Priority sources:** ICO (International Coffee Organization), CONAB + Cecafé (Brazil), USDA FAS, Vietnam
GSO, ICE, CFTC COT, INMET (Brazil weather).

**Recurring reports (catalysts):** USDA FAS semi-annual coffee reports; CONAB Brazil crop surveys; Cecafé
monthly exports; ICO monthly report; the Brazil frost season (May–Aug); CFTC COT.

**Family-specific physical-market rules:** align Arabica/Robusta grade, defects, location, unit, FX and
contract month before computing spreads. Certified ICE stock is an accessible buffer, not total inventory.
Weather must be yield-weighted and tied to flowering, cherry development, frost or harvest. The production
orb owns crop output and the biennial cycle; demand/inventory owns exports, consumption and certified stocks;
supply security alone owns EUDR/compliance and routing. Low country coverage or stale estimates trigger the
supply-opacity cap.

**Required semantic series (profile-owned; connector IDs are deliberately absent):**

| Need ID | Stable series ID | Owner orb | Required history / freshness | Lawful source policy |
|---|---|---|---|---|
| `coffee-managed-money-positioning` | `coffee.managed-money-positioning` | commodity-positioning-flows | weekly; ≥3 years and current ICE Coffee C COT observation | CFTC public API; exact COFFEE C futures-only disaggregated contract |
| `coffee-fund-etn-flows` | `coffee.fund-etn-flows` | commodity-positioning-flows | weekly current lawful JO and other listed coffee-vehicle notes/shares, AUM and observable flows | issuer/sponsor primary data only; if lawful history is unavailable mark manual or unavailable, never infer flows from price |
| `climate-enso-oni` | `climate.enso.oni` | commodity-weather-seasonality | monthly; ≥30 years of dated ONI history | NOAA CPC observed ONI only; it cannot substitute for regional weather or a probabilistic outlook |
| `macro-broad-usd-index` | `macro.broad-usd-index` | commodity-macro-drivers | daily; ≥3 years for coffee/USD regimes | reuse one Federal Reserve/FRED semantic series; no commodity-specific clone |
| `coffee-trade-fx` | `coffee.trade-fx` | commodity-macro-drivers | daily; ≥3 years of producer BRL/VND/COP against USD | primary central-bank or lawful market history with exact FX bases and roles |
| `coffee-current-price` | `coffee.current-price` | commodity-price-curve | current front-month ICE Coffee C quote | reuse swarm pulse quote transport (`@KC.1`); label US¢/lb futures |
| `coffee-price-history` | `coffee.price-history` | commodity-price-curve | point-in-time ICE Coffee C close history with source identity | reuse lawful shared market history for `@KC.1`; continuous back-adjusted futures |
| `coffee-ice-forward-curve` | `coffee.ice-forward-curve` | commodity-price-curve | current Coffee C settlements with ≥3 years of curve snapshots | lawful ICE settlements with exact contracts; otherwise unavailable |
| `coffee-arabica-robusta-spread` | `coffee.arabica-robusta-spread` | commodity-cross-asset-regime | daily; ≥3 years of unit/FX-aligned Arabica-Robusta spread history and a current observation | lawful ICE prices; one substitution cluster after conversion to a common unit |
| `coffee-delivery-quality-basis` | `coffee.delivery-quality-basis` | commodity-price-curve | current Coffee C physical basis by deliverable grade, origin and location | lawful ICE/primary trade quotations with grade, defects, location, unit and contract month; otherwise unavailable |
| `coffee-delivery-pressure` | `coffee.delivery-pressure` | commodity-price-curve | current ICE Coffee C delivery notices, pending grading and load-out pressure by location | lawful ICE delivery/warehouse reports with contract and report date; otherwise unavailable |
| `coffee-certified-stocks` | `coffee.certified-stocks` | commodity-demand-inventory | daily current ICE certified stocks by grade/location and pending grading | lawful ICE warehouse reports; preserve revisions and never infer off-exchange stocks |
| `coffee-global-balance` | `coffee.global-balance` | commodity-demand-inventory | quarterly/semiannual; ≥10 years of production, consumption and stocks | ICO/USDA primary balances with vintage and Arabica/Robusta split |
| `coffee-export-shipments` | `coffee.export-shipments` | commodity-demand-inventory | monthly current Brazil/Vietnam/Colombia shipments by destination | Cecafe/national customs/ICO primary data; announced sales cannot replace shipment |
| `coffee-weather-phenology` | `coffee.weather-phenology` | commodity-weather-seasonality | current plus ≥30 years of yield-weighted frost/drought/monsoon weather aligned to crop stage | primary meteorological observations/forecasts with geography, run time and expiry |
| `coffee-production-cycle` | `coffee.production-cycle` | commodity-supply | current area, yield, tree age and biennial-cycle output by major origin with dispersion | CONAB/USDA/national primary crop releases; distinguish observed crop from forecast |
| `coffee-policy-routing` | `coffee.policy-routing` | commodity-supply-security | current EUDR/compliance, port constraints and verified rerouting | primary regulator/customs/port evidence with effective date and expiry |
| `coffee-cost-export-parity-range` | `coffee.cost-export-parity-range` | commodity-cost-curve | current marginal farm cash-cost and export-parity range | primary farm budgets and lawful freight/FX; separate observed price, model range and market expectation |

Declaring these rows does not make them usable. CFTC, ONI, USD and a quote cannot replace certified-stock,
crop-stage weather, export shipment or major-origin crop evidence. Missing required physical evidence keeps
both horizons not assessable and forces Research More.

---

## COCOA

- **Benchmark / grade:** ICE US Cocoa (USD/tonne, New York) and ICE London Cocoa (GBP/tonne). West Africa
  (Ivory Coast + Ghana) sets ~60% of world supply.
- **Quote unit + currency:** USD per tonne (NY); give the NY–London spread.
- **Primary exchanges:** ICE (New York, London).
- **Business type:** agricultural soft — highly concentrated supply (Ivory Coast + Ghana ~60%), driven by
  disease, weather, and aging trees; a recent structural deficit. Classify the thesis `Commodity-conditional`.

**Applicable lenses (apply ONLY these):**
- Market structure: the ICE US curve and delivery/quality basis.
- Cross-asset regime: the FX/unit-aligned NY–London spread as one regional-quality confirmation cluster.
- Supply/demand: Ivory Coast + Ghana + Ecuador + Nigeria production (**port arrivals** the key tell),
  disease (swollen shoot, black pod), tree age; demand = **grindings** (Europe/Asia/N. America); the deficit/surplus.
- Weather/seasonality (DOMINANT): West Africa main crop (Oct–Mar) + mid crop (Apr–Sep); **Harmattan** dry
  season (Dec–Feb); rainfall + disease pressure.
- Supply security: dated Ivory Coast/Ghana farmgate and Living Income Differential rules, export controls
  and verified rerouting.
- Macro drivers: the broad **US dollar**, GBP/USD and producer GHS/XOF currency context.
- Positioning/flows: ICE **managed-money net length (CFTC COT)**; NIB ETN flows.
- Valuation/fair value: farmgate + replacement economics; a range (recent prices sit far above historical
  cost — deficit-driven, label it as such).

**Instruments (portfolio + expression):**
- `NIB` (iPath Cocoa ETN — **issuer credit risk**). `CC` (ICE US), `C` (London) futures = the direct expressions.

**Priority sources:** ICCO (International Cocoa Organization), Ivory Coast Conseil du Café-Cacao + Ghana
Cocobod, port-arrivals data, ICE, CFTC COT.

**Recurring reports (catalysts):** ICCO quarterly bulletin + supply/demand estimates; Ivory Coast weekly
port arrivals; quarterly grindings (ECA Europe, NCA N. America, Asia); the Harmattan season (Dec–Feb); CFTC COT.

**Family-specific physical-market rules:** align NY/London grade, delivery location, unit, GBP/USD and
contract month before comparing prices. Port arrivals are realised flow, not the crop itself; production owns
crop output while demand/inventory owns arrivals, grindings and accessible stocks. Weather/disease evidence
must be regional and crop-stage specific. Supply security alone owns farmgate/LID rules, export controls and
routing. High concentration and uncertain farm surveys feed the supply-opacity cap rather than false precision.

**Required semantic series (profile-owned; connector IDs are deliberately absent):**

| Need ID | Stable series ID | Owner orb | Required history / freshness | Lawful source policy |
|---|---|---|---|---|
| `cocoa-managed-money-positioning` | `cocoa.managed-money-positioning` | commodity-positioning-flows | weekly; ≥3 years and current ICE Cocoa COT observation | CFTC public API; exact COCOA futures-only disaggregated contract |
| `cocoa-fund-etn-flows` | `cocoa.fund-etn-flows` | commodity-positioning-flows | weekly current lawful NIB and other listed cocoa-vehicle notes/shares, AUM and observable flows | issuer/sponsor primary data only; if lawful history is unavailable mark manual or unavailable, never infer flows from price |
| `climate-enso-oni` | `climate.enso.oni` | commodity-weather-seasonality | monthly; ≥30 years of dated ONI history | NOAA CPC observed ONI only; it cannot substitute for West African weather |
| `macro-broad-usd-index` | `macro.broad-usd-index` | commodity-macro-drivers | daily; ≥3 years for cocoa/USD regimes | reuse one Federal Reserve/FRED semantic series; no commodity-specific clone |
| `cocoa-trade-fx` | `cocoa.trade-fx` | commodity-macro-drivers | daily; ≥3 years of GBP/USD and producer GHS/XOF roles | primary central-bank or lawful market history; note XOF peg and exact bases |
| `cocoa-current-price` | `cocoa.current-price` | commodity-price-curve | current front-month ICE US Cocoa quote | reuse swarm pulse quote transport (`@CC.1`); label USD/t futures |
| `cocoa-price-history` | `cocoa.price-history` | commodity-price-curve | point-in-time ICE US Cocoa close history with source identity | reuse lawful shared market history for `@CC.1`; continuous back-adjusted futures |
| `cocoa-ice-forward-curve` | `cocoa.ice-forward-curve` | commodity-price-curve | current ICE US settlements with ≥3 years of curve snapshots | lawful ICE settlements with exact contracts; otherwise unavailable |
| `cocoa-ny-london-spread` | `cocoa.ny-london-spread` | commodity-cross-asset-regime | daily; ≥3 years of FX/unit-aligned NY-London spread history and a current observation | lawful ICE prices; one regional-quality cluster after GBP/USD conversion |
| `cocoa-delivery-quality-basis` | `cocoa.delivery-quality-basis` | commodity-price-curve | current ICE cocoa physical basis by deliverable grade, origin and location | lawful ICE/primary trade quotations with grade, location, unit, FX and contract month; otherwise unavailable |
| `cocoa-delivery-pressure` | `cocoa.delivery-pressure` | commodity-price-curve | current ICE cocoa delivery notices and load-out pressure by location | lawful ICE delivery/warehouse reports with contract and report date; otherwise unavailable |
| `cocoa-certified-stocks` | `cocoa.certified-stocks` | commodity-demand-inventory | daily current exchange stocks by location/grade | lawful ICE warehouse reports; do not infer off-exchange inventories |
| `cocoa-stocks-grindings` | `cocoa.stocks-grindings` | commodity-demand-inventory | quarterly; ≥10 years of stocks-to-grindings and regional grindings | ICCO/ECA/NCA/CAA primary releases with revisions and region coverage |
| `cocoa-port-arrivals` | `cocoa.port-arrivals` | commodity-demand-inventory | weekly current Ivory Coast/Ghana arrivals and exports | primary regulator/port/customs data; distinguish arrivals from crop forecast |
| `cocoa-weather-phenology` | `cocoa.weather-phenology` | commodity-weather-seasonality | current plus ≥30 years of yield-weighted rainfall and Harmattan weather aligned to crop stage | primary meteorological observations/forecasts with geography, run time and expiry |
| `cocoa-disease-pressure` | `cocoa.disease-pressure` | commodity-weather-seasonality | current regional swollen-shoot, black-pod and other material disease incidence with affected area | primary crop regulator/agronomic surveillance with geography, observation date and expiry; weather cannot substitute |
| `cocoa-production` | `cocoa.production` | commodity-supply | current area, yield, tree age and output by major origin with dispersion | ICCO/national regulator/USDA primary releases; disease adjustments must be explicit |
| `cocoa-farmgate-policy-routing` | `cocoa.farmgate-policy-routing` | commodity-supply-security | current dated farmgate/LID rules, export controls and verified rerouting | Conseil du Cafe-Cacao/Cocobod/government/customs evidence with effective date and expiry |
| `cocoa-cost-replacement-range` | `cocoa.cost-replacement-range` | commodity-cost-curve | current farmgate, rehabilitation and replacement-economics range | primary farm/regulator costs; separate observed price, deficit premium, model range and market expectation |

Declaring these rows does not make them usable. CFTC, ONI, USD and a quote cannot replace port arrivals,
grindings, certified stocks, crop-stage weather or disease-adjusted supply. Missing required physical evidence
keeps both horizons not assessable and forces Research More.

---

## COTTON

- **Benchmark / grade:** ICE Cotton No. 2 (US¢/lb, New York); plus the China (Zhengzhou / CZCE) price and
  the Cotlook A Index (the world physical price).
- **Quote unit + currency:** US cents per pound (ICE #2).
- **Primary exchanges:** ICE (New York), CZCE (China).
- **Business type:** agricultural soft / fibre — production (US, India, China, Brazil) vs textile-mill
  demand (China/Asia); tied to the apparel/consumer cycle and polyester (crude) substitution.
  Classify the thesis `Commodity-conditional`.

**Applicable lenses (apply ONLY these):**
- Market structure: the ICE curve and **ICE–Cotlook A basis** aligned by grade and delivery location.
- Cross-asset regime: crude/polyester substitution as one confirmation cluster, not physical cotton demand.
- Supply/demand: US + India + China + Brazil production vs mill use + China imports/reserve policy;
  USDA WASDE; stocks-to-use (**China's reserve** is the big swing).
- Weather/seasonality (DOMINANT): US (Texas / West) planting + drought, India monsoon, harvest; ENSO.
- Supply security: dated China reserve/import policy, farm support, restrictions and verified rerouting.
- Macro drivers: the broad **US dollar**, global activity and producer/importer FX (INR, BRL, CNY).
- Positioning/flows: ICE **managed-money net length (CFTC COT)**; BAL ETN flows.
- Valuation/fair value: cost-of-production + the polyester-substitution ceiling; a range.

**Instruments (portfolio + expression):**
- `BAL` (iPath Cotton ETN — **issuer credit risk**). `CT` (ICE #2) futures = the direct expression.

**Priority sources:** USDA (WASDE, Cotton: World Markets & Trade, Export Sales), Cotlook, ICAC
(International Cotton Advisory Committee), CFTC COT.

**Recurring reports (catalysts):** USDA WASDE (monthly) + weekly Export Sales; ICAC monthly; the Cotlook A
Index (daily); US Crop Progress; CFTC COT.

**Family-specific physical-market rules:** align grade, staple, location, bale/weight unit, FX and crop year
before comparing ICE, Cotlook or China prices. China reserve stocks remain separate from accessible stocks.
Production owns area/abandonment/yield/output; demand/inventory owns mill use, shipments and the balance;
supply security owns reserve/import policy, support and routing. Weather must be yield-weighted and aligned to
planting, boll development and harvest. Polyester/crude is one cross-asset confirmation, not cotton demand.

**Required semantic series (profile-owned; connector IDs are deliberately absent):**

| Need ID | Stable series ID | Owner orb | Required history / freshness | Lawful source policy |
|---|---|---|---|---|
| `cotton-managed-money-positioning` | `cotton.managed-money-positioning` | commodity-positioning-flows | weekly; ≥3 years and current ICE Cotton No. 2 COT observation | CFTC public API; exact COTTON NO. 2 futures-only disaggregated contract |
| `cotton-fund-etn-flows` | `cotton.fund-etn-flows` | commodity-positioning-flows | weekly current lawful BAL and other listed cotton-vehicle notes/shares, AUM and observable flows | issuer/sponsor primary data only; if lawful history is unavailable mark manual or unavailable, never infer flows from price |
| `climate-enso-oni` | `climate.enso.oni` | commodity-weather-seasonality | monthly; ≥30 years of dated ONI history | NOAA CPC observed ONI only; it cannot substitute for regional crop weather |
| `macro-broad-usd-index` | `macro.broad-usd-index` | commodity-macro-drivers | daily; ≥3 years for cotton/USD regimes | reuse one Federal Reserve/FRED semantic series; no commodity-specific clone |
| `macro-global-activity-demand-proxy` | `macro.global-activity-demand-proxy` | commodity-macro-drivers | monthly; ≥10 years with release vintage | primary global industrial-production/trade series; licensed PMI remains contextual |
| `cotton-trade-fx` | `cotton.trade-fx` | commodity-macro-drivers | daily; ≥3 years of producer/importer INR/BRL/CNY against USD | primary central-bank or lawful market history with exact bases and roles |
| `cotton-current-price` | `cotton.current-price` | commodity-price-curve | current front-month ICE Cotton No. 2 quote | reuse swarm pulse quote transport (`@CT.1`); label US¢/lb futures |
| `cotton-price-history` | `cotton.price-history` | commodity-price-curve | point-in-time ICE Cotton No. 2 close history with source identity | reuse lawful shared market history for `@CT.1`; continuous back-adjusted futures |
| `cotton-crude-price-history` | `cotton.crude-price-history` | commodity-cross-asset-regime | point-in-time WTI history aligned to cotton | reuse lawful `@CL.1` history; crude/polyester is one substitution confirmation |
| `cotton-ice-forward-curve` | `cotton.ice-forward-curve` | commodity-price-curve | current old/new-crop settlements with ≥3 years of curve snapshots | lawful ICE settlements with exact contracts; otherwise unavailable |
| `cotton-physical-basis` | `cotton.physical-basis` | commodity-price-curve | current ICE-Cotlook A-China basis aligned by grade/unit/FX | lawful Cotlook/exchange/primary quotations; licensed data remains manual or unavailable |
| `cotton-delivery-pressure` | `cotton.delivery-pressure` | commodity-price-curve | current ICE Cotton No. 2 delivery notices and load-out pressure by certified location | lawful ICE delivery/warehouse reports with contract and report date; otherwise unavailable |
| `cotton-certified-stocks` | `cotton.certified-stocks` | commodity-demand-inventory | current ICE certified cotton stocks by grade and location | lawful ICE warehouse reports; preserve revisions and do not infer non-certified inventory |
| `cotton-global-balance-stocks-use` | `cotton.global-balance-stocks-use` | commodity-demand-inventory | monthly; ≥10 years of world balance and stocks-to-use with China reserve separated | USDA official cotton balance with release vintage and revisions |
| `cotton-export-shipments` | `cotton.export-shipments` | commodity-demand-inventory | weekly; ≥5 market years of US upland and Pima sales, reductions/adjustments and shipments by destination | USDA FAS primary data; keep upland and Pima identified and separate gross sales, net sales and physical shipment |
| `cotton-mill-use` | `cotton.mill-use` | commodity-demand-inventory | monthly current physical mill use by major consuming country | USDA, ICAC and national primary data; orders, exports and polyester prices cannot substitute for realised mill consumption |
| `cotton-weather-phenology` | `cotton.weather-phenology` | commodity-weather-seasonality | current plus ≥30 years of yield-weighted weather aligned to planting, squaring, boll and harvest stages | primary meteorological observations/forecasts with geography, run time and expiry |
| `cotton-crop-progress` | `cotton.crop-progress` | commodity-weather-seasonality | weekly; ≥10 years of regional planting, condition, boll and harvest progress with current observation | USDA/national primary crop-progress reports aligned by region and crop year; weather cannot substitute |
| `cotton-production` | `cotton.production` | commodity-supply | current area, abandonment, yield and output by major origin with dispersion | USDA/India/China/Brazil primary releases; do not duplicate balance production |
| `cotton-policy-routing` | `cotton.policy-routing` | commodity-supply-security | current dated China reserve/import policy, farm support, restrictions and verified rerouting | primary regulator/government/customs evidence with effective date and expiry |
| `cotton-cost-substitution-range` | `cotton.cost-substitution-range` | commodity-cost-curve | current marginal farm cost and polyester-substitution range | primary farm budgets and lawful polyester/energy/FX inputs; separate observed price, model range and market expectation |

Declaring these rows does not make them usable. CFTC, ONI, USD and a quote cannot replace the cotton
balance, China reserve split, crop-stage weather, physical basis or mill-use evidence. Missing required
physical evidence keeps both horizons not assessable and forces Research More.
