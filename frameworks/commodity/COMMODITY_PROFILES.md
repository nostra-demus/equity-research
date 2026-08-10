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
- Supply/demand: production by Brazil (Centre-South), India, Thailand, EU (supply) vs food + ethanol
  demand; the balance is a **global surplus/deficit** and **stocks-to-use ratio** (the key buffer).
- Weather/seasonality (a DOMINANT lens): **India monsoon** (IMD rainfall vs the long-period average,
  reservoir levels — drives Indian cane), **Brazil Centre-South** cane weather + harvest pace (UNICA
  bi-weekly), and the **ENSO (El Niño / La Niña)** signal. Harvest calendars: Brazil C-S ~Apr–Nov,
  India/Thailand ~Oct–Apr.
- Macro drivers: **crude oil / ethanol parity** — Brazilian mills flex cane between sugar and ethanol
  with crude + domestic gasoline, so energy prices move sugar supply; **export policy** (India export
  quotas/bans, Thailand); **Brazilian real (BRL)** — a weak BRL pushes Brazil to export more sugar.
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
- Supply/demand: global production (Russia, EU, US, Canada, Australia, Ukraine, Argentina) vs food/feed;
  USDA WASDE + IGC world balance; **major-exporter stocks-to-use** (matters more than China's stockpile).
- Weather/seasonality (DOMINANT): NH winter-wheat dormancy/**winterkill**, spring planting, the SH
  (Australia/Argentina) crop; drought monitors; harvest windows.
- Macro drivers: **Black Sea export policy + war risk** (Russia/Ukraine), export taxes/quotas, exporter FX
  (RUB, AUD), energy/fertilizer costs.
- Positioning/flows: CBOT **managed-money net length (CFTC COT)**; WEAT flows.
- Valuation/fair value: cost-of-production + export-parity; a range.

**Instruments (portfolio + expression):**
- `WEAT` (Teucrium Wheat) — holds CBOT SRW contracts spread across months (softer roll); tracks the
  futures curve, not spot. `ZW` (CBOT) futures = the direct expression; KC/MGEX for protein plays.

**Priority sources:** USDA (WASDE, Crop Progress, Grain Stocks, Export Sales), IGC, FAO AMIS, Russian /
UkrAgroConsult trade data (dated, labelled), CFTC COT.

**Recurring reports (catalysts):** USDA WASDE (monthly), Crop Progress (weekly in season), Grain Stocks +
Prospective Plantings (quarterly / spring), weekly Export Sales; IGC Grain Market Report; CFTC COT.

---

## CORN

- **Benchmark / grade:** CBOT Corn (US¢/bushel) — the global benchmark.
- **Quote unit + currency:** US cents per bushel (CBOT).
- **Primary exchanges:** CBOT (CME), DCE (China), plus Brazil / Argentina physical.
- **Business type:** grain — the largest US crop; feed + ethanol + export demand; tightly linked to
  soybeans (acreage competition) and energy (ethanol). Classify the thesis `Commodity-conditional`.

**Applicable lenses (apply ONLY these):**
- Market structure: the CBOT curve; the **corn–soybean ratio** (acreage signal); the corn–ethanol + DDG margins.
- Supply/demand: US + Brazil (safrinha second crop) + Argentina + Ukraine production vs feed/ethanol/export;
  USDA WASDE; ending stocks + stocks-to-use.
- Weather/seasonality (DOMINANT): US Corn Belt planting (Apr–May), **pollination (July — the critical
  weather window)**, harvest; Brazil safrinha weather; drought monitor; ENSO.
- Macro drivers: **ethanol / energy policy + crude** (ethanol parity), China demand, export competition +
  FX (BRL, ARS), fertilizer cost.
- Positioning/flows: CBOT **managed-money net length (CFTC COT)**; CORN flows.
- Valuation/fair value: cost-of-production + ethanol/feed value; a range.

**Instruments (portfolio + expression):**
- `CORN` (Teucrium Corn) — CBOT corn contracts spread across months; tracks the curve. `ZC` (CBOT)
  futures = the direct expression.

**Priority sources:** USDA (WASDE, Crop Progress, Grain Stocks, Prospective Plantings, Export Sales),
CONAB (Brazil), CFTC COT, EIA (ethanol).

**Recurring reports (catalysts):** USDA WASDE (monthly), Crop Progress (weekly), Grain Stocks +
Prospective Plantings + Acreage (Mar/Jun), weekly Export Sales; CFTC COT.

---

## SOYBEANS

- **Benchmark / grade:** CBOT Soybeans (US¢/bushel); plus the products — soybean **meal** (USD/short ton)
  and soybean **oil** (US¢/lb) — and the **board crush** spread.
- **Quote unit + currency:** US cents per bushel; track meal, oil, and the crush spread.
- **Primary exchanges:** CBOT (CME), DCE (China), Brazil / Argentina physical.
- **Business type:** oilseed — dominated by China import demand and South American supply; crush economics
  (meal for feed, oil for food/biodiesel). Classify the thesis `Commodity-conditional`.

**Applicable lenses (apply ONLY these):**
- Market structure: the CBOT curve; the **board crush** spread; bean oil's biofuel bid; the soy–corn ratio.
- Supply/demand: US + Brazil + Argentina production vs China imports + domestic crush; USDA WASDE;
  stocks-to-use (Brazil is now the swing supplier).
- Weather/seasonality (DOMINANT): US growing season (**Aug pod-fill** the key window), Brazil (Nov–Mar) +
  Argentina weather; ENSO (La Niña = SA drought risk).
- Macro drivers: **China demand + trade policy / tariffs**, biodiesel / renewable-diesel policy (bean
  oil), BRL/ARS FX, Argentine export taxes.
- Positioning/flows: CBOT **managed-money net length (CFTC COT)**; SOYB flows.
- Valuation/fair value: cost-of-production + crush value; a range.

**Instruments (portfolio + expression):**
- `SOYB` (Teucrium Soybean) — CBOT soybean contracts spread across months. `ZS` (beans), `ZM` (meal),
  `ZL` (oil) futures = the direct expressions.

**Priority sources:** USDA (WASDE, Crop Progress, Export Sales, Grain Stocks), CONAB (Brazil),
Rosario / Buenos Aires grain exchanges (Argentina), CFTC COT.

**Recurring reports (catalysts):** USDA WASDE (monthly), weekly Export Sales (watch the China cadence),
Crop Progress; CONAB monthly; CFTC COT.

---

## COFFEE

- **Benchmark / grade:** ICE Arabica ("Coffee C", US¢/lb, New York); ICE Robusta (USD/tonne, London).
  Track the Arabica–Robusta spread.
- **Quote unit + currency:** US cents per pound (Arabica C).
- **Primary exchanges:** ICE (NY Arabica, London Robusta), B3 (Brazil).
- **Business type:** agricultural soft — supply dominated by Brazil (Arabica) and Vietnam (Robusta); a
  weather + biennial-bearing cycle plus export FX. Classify the thesis `Commodity-conditional`.

**Applicable lenses (apply ONLY these):**
- Market structure: the ICE Arabica curve; the **Arabica–Robusta spread** (substitution); **certified
  exchange stocks** (the buffer).
- Supply/demand: Brazil + Vietnam + Colombia production (the biennial "on/off" cycle) vs global
  consumption; ICO balance; certified stocks.
- Weather/seasonality (DOMINANT): **Brazil frost (May–Aug)** and drought at flowering (Sep–Oct), Vietnam
  monsoon; the biennial-bearing year.
- Macro drivers: the **Brazilian real (BRL — a weak BRL pushes Brazil to sell)**, Vietnam dong, freight,
  the EU deforestation regulation (EUDR).
- Positioning/flows: ICE Arabica **managed-money net length (CFTC COT)**; JO ETN flows.
- Valuation/fair value: Brazilian cash cost + export-parity; a range.

**Instruments (portfolio + expression):**
- `JO` (iPath Coffee ETN — carries **issuer credit risk**; tracks ICE Arabica futures + roll). `KC` (ICE
  Arabica), `RC` (Robusta) futures = the direct expressions.

**Priority sources:** ICO (International Coffee Organization), CONAB + Cecafé (Brazil), USDA FAS, Vietnam
GSO, ICE, CFTC COT, INMET (Brazil weather).

**Recurring reports (catalysts):** USDA FAS semi-annual coffee reports; CONAB Brazil crop surveys; Cecafé
monthly exports; ICO monthly report; the Brazil frost season (May–Aug); CFTC COT.

---

## COCOA

- **Benchmark / grade:** ICE US Cocoa (USD/tonne, New York) and ICE London Cocoa (GBP/tonne). West Africa
  (Ivory Coast + Ghana) sets ~60% of world supply.
- **Quote unit + currency:** USD per tonne (NY); give the NY–London spread.
- **Primary exchanges:** ICE (New York, London).
- **Business type:** agricultural soft — highly concentrated supply (Ivory Coast + Ghana ~60%), driven by
  disease, weather, and aging trees; a recent structural deficit. Classify the thesis `Commodity-conditional`.

**Applicable lenses (apply ONLY these):**
- Market structure: the ICE curve (deep backwardation in the recent deficit); the NY–London spread;
  **exchange (certified) stocks + the stocks-to-grindings ratio** (the buffer).
- Supply/demand: Ivory Coast + Ghana + Ecuador + Nigeria production (**port arrivals** the key tell),
  disease (swollen shoot, black pod), tree age; demand = **grindings** (Europe/Asia/N. America); the deficit/surplus.
- Weather/seasonality (DOMINANT): West Africa main crop (Oct–Mar) + mid crop (Apr–Sep); **Harmattan** dry
  season (Dec–Feb); rainfall + disease pressure.
- Macro drivers: Ivory Coast / Ghana farmgate pricing + the **Living Income Differential**, GBP/USD
  (NY–London), the grinding-demand cycle.
- Positioning/flows: ICE **managed-money net length (CFTC COT)**; NIB ETN flows.
- Valuation/fair value: farmgate + replacement economics; a range (recent prices sit far above historical
  cost — deficit-driven, label it as such).

**Instruments (portfolio + expression):**
- `NIB` (iPath Cocoa ETN — **issuer credit risk**). `CC` (ICE US), `C` (London) futures = the direct expressions.

**Priority sources:** ICCO (International Cocoa Organization), Ivory Coast Conseil du Café-Cacao + Ghana
Cocobod, port-arrivals data, ICE, CFTC COT.

**Recurring reports (catalysts):** ICCO quarterly bulletin + supply/demand estimates; Ivory Coast weekly
port arrivals; quarterly grindings (ECA Europe, NCA N. America, Asia); the Harmattan season (Dec–Feb); CFTC COT.

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
- Market structure: the ICE curve; the **ICE–Cotlook A basis**; certified stocks.
- Supply/demand: US + India + China + Brazil production vs mill use + China imports/reserve policy;
  USDA WASDE; stocks-to-use (**China's reserve** is the big swing).
- Weather/seasonality (DOMINANT): US (Texas / West) planting + drought, India monsoon, harvest; ENSO.
- Macro drivers: **apparel / consumer demand + global growth**, China reserve + import policy,
  polyester/crude substitution, INR/BRL FX, US farm support.
- Positioning/flows: ICE **managed-money net length (CFTC COT)**; BAL ETN flows.
- Valuation/fair value: cost-of-production + the polyester-substitution ceiling; a range.

**Instruments (portfolio + expression):**
- `BAL` (iPath Cotton ETN — **issuer credit risk**). `CT` (ICE #2) futures = the direct expression.

**Priority sources:** USDA (WASDE, Cotton: World Markets & Trade, Export Sales), Cotlook, ICAC
(International Cotton Advisory Committee), CFTC COT.

**Recurring reports (catalysts):** USDA WASDE (monthly) + weekly Export Sales; ICAC monthly; the Cotlook A
Index (daily); US Crop Progress; CFTC COT.
