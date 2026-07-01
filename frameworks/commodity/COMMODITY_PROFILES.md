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
