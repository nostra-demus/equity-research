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
- Market structure: spot vs COMEX curve (gold is usually mild contango = the cost of carry); ETF holdings.
- Supply/demand: mine supply + recycling (supply) vs jewellery / investment (bars, coins, ETFs) /
  technology / **official-sector (central-bank) buying** (demand). The buffer is above-ground stocks +
  ETF tonnes, not a tight stocks-to-use like an ag.
- Weather/seasonality: NOT a weather commodity. Mild seasonality only — India festival/wedding demand
  (roughly Q3–Q4), Chinese New Year, Q1 restocking. Keep it short.
- Macro drivers (the dominant lens): **10y real yields (TIPS)** — gold is a zero-coupon asset, so falling
  real yields help and rising ones hurt; **US dollar (DXY)** — priced in USD, a weaker USD helps;
  policy rates; **central-bank buying** (structural official demand); **geopolitical / safe-haven risk**.
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
CFTC COT, FRED (DFII10 real yield, DXY), US Treasury (TIPS), Fed (rate path).

**Recurring reports (catalysts):** FOMC decisions + dot plot; US CPI / PCE; WGC quarterly Gold Demand
Trends; weekly CFTC COT (Fridays); monthly central-bank purchase data; US jobs report.

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
