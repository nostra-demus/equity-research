# supply-demand Module Dossier — WHEAT

> Deterministic, lossless concatenation of every artifact in this module — the module synthesis and every specialist output, in order. Generated mechanically (no LLM rewriting), so nothing is omitted or paraphrased. This is the module's "see everything" tier; the module's decision lives in `99_*-synthesis.md` and the short read in `supply-demand_memo.md`.

- Generated: 2026-07-12T13:51:57Z
- Module folder: `supply-demand`
- Contents: 1 module synthesis + 3 specialist outputs = 4 files

## Table of Contents

- [supply-demand — module synthesis](#supply-demand-module-synthesis) — `99_supply-demand-synthesis.md`
- [supply-demand / 01_commodity-supply.md](#supply-demand-01-commodity-supply-md) — `01_commodity-supply.md`
- [supply-demand / 02_commodity-demand-inventory.md](#supply-demand-02-commodity-demand-inventory-md) — `02_commodity-demand-inventory.md`
- [supply-demand / 03_commodity-weather-seasonality.md](#supply-demand-03-commodity-weather-seasonality-md) — `03_commodity-weather-seasonality.md`


---

## supply-demand — module synthesis

_Source: `99_supply-demand-synthesis.md`_

# Supply–Demand Balance — WHEAT (module synthesis)

## Abstract

Global wheat is in a supply deficit for MY 2026/27: world production is projected at 819.1 MMT, while world total use is 823.2 MMT, implying a draw of approximately 4 MMT on beginning stocks [USDA WASDE Jul-2026, 2026-07-10]. The inventory buffer that matters — the major-exporter stocks-to-use ratio — stands at roughly 8.0%, near its tightest level since the early 2010s, and is forecast to decline further in 2026/27 as exporter ending stocks fall to ~59–62.5 MMT from ~65.2 MMT in 2025/26 [USDA WASDE Jun-2026, 2026-06-11; USDA Wheat Outlook May-2026]. The direction of balance is tightening: a 24.7 MMT production shortfall versus last year's record, broad-based across the US, EU, Australia, and Canada, is compressing an already lean export-origin buffer. The single biggest swing factor is a developing strong El Niño (Niño-3.4 at +1.2°C and rising, 81% probability of ≥ +2.0°C by Oct–Dec 2026 [NOAA/CPC ENSO Diagnostic Discussion, 2026-07-09]) that now threatens to cut Australia's 2026/27 crop below ABARES's already-reduced 26.7 MMT forecast and to inhibit US HRW planting in autumn 2026 — adding a second-season tightening risk on top of this season's damage.

---

## Balance (surplus / deficit)

**Verdict: deficit, approximately 4 MMT in MY 2026/27.**

- World production 2026/27: 819.1 MMT [USDA WASDE Jul-2026, 2026-07-10]
- World total use 2026/27: 823.2 MMT [USDA WASDE Jul-2026, 2026-07-10]
- Implied stock draw: ~4.1 MMT

This follows a near-balanced 2025/26 (record production of 843.8 MMT roughly matched elevated demand of 810.6 MMT, allowing a modest stock build), but the 2026/27 entry is unambiguously into deficit territory. The production decline is broad-based:

| Key shortfall | 2026/27 MMT | Change vs 2025/26 | Source |
|---|---|---|---|
| United States | ~41.8 | -18.4% (-9.4 MMT) | USDA WASDE Jul-2026, 2026-07-10 |
| Australia | 26.7 | -25.8% (-9.3 MMT) | ABARES Crop Report Jun-2026 |
| Argentina | 21.0 | -24.7% (-6.9 MMT) | USDA WASDE Jul-2026, 2026-07-10 |
| EU-27 | 136.0 | -5.6% (-8 MMT) | USDA WASDE Jun-2026; COCERAL Jun-2026 |
| Canada | 36.2 | -10.0% (-4 MMT) | USDA FAS Grain & Feed Annual |

Partial offsets: Russia (+5.5 MMT to 88.0 MMT), India (+3.1 MMT to 121.0 MMT), China (+1.0 MMT to 141.0 MMT). The offsets are real but do not close the gap — and both India's and China's additional output feeds their own domestic systems, not the export market.

World ending stocks are projected at 272.8 MMT for 2026/27 [USDA WASDE Jul-2026], which appears to be a recovery from 2025/26's 261.5 MMT. This is not a contradiction: the rebuilding is driven almost entirely by China and India, whose stocks are captive (not export-available). The market-relevant balance — stocks held by the eight major exporters — is tightening further.

**No licensed pool data was available** (`data/WHEAT/` is empty); all figures draw from public USDA reports and named secondary sources, labelled where unverified. The directional balance is high-confidence; the exact MMT quantum carries ±3–5 MMT uncertainty from Russia's still-ongoing harvest.

---

## Inventory buffer vs history

**Exporter buffer: historically tight and tightening further.**

The global stocks-to-use ratio of ~32–33% [ING Think, 2026, labelled unverified secondary; cross-checked vs WASDE totals] gives a misleading sense of comfort. China holds roughly 51–52% of world ending stocks (~137–140 MMT [USDA FAS / inference, labelled estimate]) but does not participate in world trade in a meaningful way. Stripping China out, the buffer that actually constrains import-dependent buyers — primarily MENA and Southeast Asia — is the major-exporter stocks-to-use ratio:

| Measure | 2025/26 | 2026/27 (proj.) | Historical context |
|---|---|---|---|
| Major-exporter ending stocks | ~65.2 MMT | ~59–62.5 MMT | Declining two consecutive years |
| Exporter STU ratio | ~8.4% | ~8.0% | Tightest since early 2010s [USDA Wheat Outlook May-2026] |
| World ending stocks | 261.5 MMT (10-yr low) | 272.8 MMT (rebuilding, but China-led) | Below 5-yr average of ~280+ MMT |

An exporter STU near 8% has historically corresponded to elevated price volatility and import stress for countries without large domestic reserves. The 2007–08 and 2010–11 wheat price spikes both occurred in periods of exporter STU compression below 10%. The current level is not as extreme as those spikes, but it is heading in the same direction, with an additional seasonal risk (El Niño) not yet reflected in current forecasts.

**One active contradiction to resolve:** The demand specialist's inventory table shows 2026/27 world ending stocks rebuilding to 272.8 MMT from 261.5 MMT, while the supply specialist describes stocks "falling to their lowest in several years." These are not the same thing: the supply file's reference to a multi-year low applies to the 2025/26 world ending stocks (261.5 MMT — a 10-year low), not 2026/27. The 2026/27 rebound to 272.8 MMT is real in the global headline number but is driven by China and India. The exporter buffer continues to tighten in 2026/27. Both specialists are correct for different sub-aggregates; this synthesis uses the exporter STU series as the market-relevant measure, consistent with both.

---

## Direction & biggest swing factor

**Direction: tightening, with a second-season downside risk.**

The balance as currently forecast (819 vs 823 MMT, ~4 MMT deficit) is a manageable but not comfortable position. The direction becomes alarming only if one or more of the following materialises:

1. **El Niño cuts Australia's 2026/27 crop below the current 26.7 MMT ABARES forecast.** The Niño-3.4 index is already at +1.2°C, and NOAA/CPC gives 81% probability of a very strong event (≥ +2.0°C) by Oct–Dec 2026 [NOAA/CPC ENSO Diagnostic Discussion, 2026-07-09]. Strong El Niño years are associated with below-median growing-season rainfall across the Australian wheatbelt. Australia's planted area is already down ~20% to 9.8 million hectares [ABARES Australian Crop Report Jun-2026]; a dry El Niño winter would compound area shortfall with yield stress, potentially pushing production toward the lower end of the 21–27 MMT range cited in the weather file or below it. Each 5 MMT shortfall vs the forecast is roughly a 10% reduction in Australia's export availability.

2. **US spring wheat (HRS) stress in the July–August critical window.** The HRW damage (~-9.4 MMT vs 2025/26) is already booked — the harvest was 59% done as of 5 July, Kansas 91% and Oklahoma 98% [USDA NASS Crop Progress, 2026-07-05]. Spring wheat was 54% headed as of 5 July [USDA NASS Crop Progress, 2026-07-05] and is now entering grain-fill — the most weather-sensitive period for the HRS crop in the Northern Plains. Any heat/drought stress through mid-August adds to an already historically low US all-wheat figure.

3. **Russia's crop coming in toward the lower estimate.** The range between USDA (88 MMT) and the high-end private estimate (Argus at 91.2 MMT [Argus, labelled estimate, 2026-07]) is ~3 MMT. A 3 MMT miss toward USDA's figure relative to private optimism is already discounted; a below-USDA outturn (< 88 MMT) would remove the single largest supply offset to NH tightness. Harvest is underway; the USDA August WASDE (2026-08-12) will carry the first survey-based number.

**The biggest swing factor is El Niño's trajectory and its impact on Australia's 2026/27 crop and the US Southern Plains HRW planting window for autumn 2026.**

El Niño is the only driver that can simultaneously extend this season's supply deficit into a second consecutive tightening year. It is already well-established, strengthening on measured indices, and its timing aligns with the next two critical supply-formation windows: Australian growing-season rainfall (now through September) and US HRW dormancy/establishment (October–December). If it unfolds as projected, 2026/27 will not be the end of the tightening cycle — the balance will enter 2027/28 with exporter stocks potentially at or below the 2025/26 trough.

---

## Reconciliation & Gaps

**Reconciled contradictions:**

1. **World ending stocks "rising" vs "tightest in years."** Resolved above: the global number rises in 2026/27 because China and India add to captive reserves. The exporter series (market-relevant) continues tightening. Both specialists were correct; the correct denominator for price inference is the exporter STU.

2. **Australia production: 26.7 MMT (supply file, ABARES) vs "21–27 MMT" range (weather file).** The 26.7 MMT is the ABARES June 2026 central forecast; the 21–27 MMT range in the weather file reflects the dispersion of outcomes under different El Niño rainfall scenarios cited by multiple secondary sources. No contradiction — the central forecast is 26.7 MMT with a left-skewed risk distribution. This synthesis uses 26.7 MMT as the base, with an explicit note that El Niño downside risk could push the crop toward or below the lower end of the range.

3. **US all-wheat: 1,536 Mbu (supply file) vs 1,543 Mbu (weather file).** The 1,543 Mbu figure in the weather file appears to be from the June 2026 WASDE; the 1,536 Mbu in the supply file is the July 2026 WASDE update [USDA WASDE Jul-2026, 2026-07-10; USDA NASS Jul 2026 Crop Production, 2026-07-10]. The July figure is more current and is used here (~41.8 MMT). The ~7 Mbu difference is immaterial to the balance conclusion.

**Remaining gaps:**

- Russia's final 2026/27 crop size (harvest in progress; August WASDE is the definitive read). This is a ±3–5 MMT uncertainty on the supply side.
- FSI vs feed split for world 2026/27 demand (USDA WASDE PDF was not extractable in readable form; FSI figure is an inference and carries a low-confidence flag).
- India export policy: a relaxation of the 2022-era export ban could add several MMT of supply; this is a policy overhang that is unresolved and not priced into current USDA export projections.
- EU sub-national crop outcomes (final results arrive August–September 2026).
- China's domestic stock levels carry a ±10–20 MMT opacity band; the global STU is affected but not the market-relevant exporter STU.

---

## Note to the Commodity Thesis

- **Global deficit of ~4 MMT in MY 2026/27**, with world production at 819.1 MMT vs consumption at 823.2 MMT [USDA WASDE Jul-2026, 2026-07-10]; the headline rebuild in world ending stocks to 272.8 MMT is misleading — it is entirely China- and India-driven; exporter stocks are tightening to ~59–62.5 MMT and exporter STU is near 8%, historically tight [USDA Wheat Outlook May-2026; USDA WASDE Jun-2026].
- **US HRW supply is at a 56-year low** — winter-wheat production fell ~27% year on year to ~1,030 Mbu; season-average US farm price raised to $6.00/bu from $5.06/bu [USDA NASS Jul 2026 Crop Production, 2026-07-10; USDA WASDE Jul-2026]; HRW damage is booked, not a speculative risk.
- **El Niño is the dominant forward risk**: developing strong (Niño-3.4 +1.2°C as of 9 Jul, 81% probability of very strong event by Oct–Dec 2026 [NOAA/CPC, 2026-07-09]) — it threatens to push Australia's crop below the already-reduced 26.7 MMT ABARES forecast and to inhibit US HRW autumn planting, which would extend the tightening cycle into 2027/28.
- **Russia is the key supply offset**: 88 MMT crop (largest since 2022/23), floating export duty at zero as of mid-July [UkrAgroConsult, 2026-07], 48 MMT export forecast [USDA WASDE Jun-2026] — Russia's competitively priced wheat caps CBOT upside; a Black Sea shipping disruption or above-USDA crop miss is the tail risk on the other side.



---

## supply-demand / 01_commodity-supply.md

_Source: `01_commodity-supply.md`_

# Supply — WHEAT

As of 2026-07-12. Marketing year (MY) 2026/27 begins June 1, 2026 for most exporters.
All volumes in million metric tons (MMT) unless noted. Prior year = MY 2025/26.

---

## 1. Production Balance

| Region / producer | Latest (MY 2026/27) | Prior (MY 2025/26) | YoY | Source, period |
|---|---|---|---|---|
| **World** | **819.1 MMT** | **843.8 MMT** | **-2.9%** | USDA WASDE, Jul-2026, 2026-07-10 |
| Russia | 88.0 MMT | ~82.5 MMT | +6.7% | USDA WASDE Jun-2026 (2026-06-11); SovEcon at 89.7 MMT [labelled estimate, 2026-07-08] |
| EU-27 | 136.0 MMT | ~144.0 MMT | -5.6% | USDA WASDE Jun-2026; COCERAL third forecast Jun-2026 (143.7 MMT, dated 2026-06) |
| China | 141.0 MMT | ~140.0 MMT | +0.7% | USDA WASDE Jul-2026, 2026-07-10 |
| India | 121.0 MMT | ~117.9 MMT | +2.6% | USDA WASDE Jul-2026; Ministry of Agriculture advance estimate, 2026-05-27 |
| United States | ~41.8 MMT (1,536 mbu) | ~51.2 MMT | -18.4% | USDA WASDE Jul-2026, 2026-07-10; USDA NASS July Crop Production, 2026-07-10 |
| Canada | 36.2 MMT | ~40.2 MMT | -10.0% | USDA FAS Grain & Feed Annual; Statistics Canada seeded area, 2026-03-05 |
| Ukraine | 23.5 MMT | ~22.0 MMT | +6.8% | USDA WASDE Jun-2026, 2026-06-11 |
| Australia | 26.7 MMT | 36.0 MMT | -25.8% | ABARES Australian Crop Report Jun-2026, 2026-06 |
| Argentina | 21.0 MMT | ~27.9 MMT | -24.7% | USDA WASDE Jul-2026, 2026-07-10 |

**World ending stocks (2026/27):** 272.8 MMT, down from ~280.3 MMT in 2025/26 (-2.7%).
[USDA WASDE Jul-2026, 2026-07-10]

**World trade (exports, 2026/27):** 211.7 MMT, down from ~223.7 MMT in 2025/26 (-5.4%).
[USDA WASDE Jul-2026, 2026-07-10]

**Stocks-to-use (world, 2026/27):** ~33.1%, down from ~34.2% in 2025/26. Major-exporter stocks-to-use (the more market-relevant buffer, excluding China's large and largely captive reserves) is tighter and declining — the supply signal that actually moves export prices.
[USDA WASDE Jun-2026, 2026-06-11; inference from stocks/use figures]

---

## 2. Direction & Swing Factors

**Direction: FALLING.** Global wheat output in MY 2026/27 is projected at 819.1 MMT, down 24.7 MMT (-2.9%) from the MY 2025/26 record of 843.8 MMT. The decline is broad-based: the United States, Australia, Argentina, EU, and Canada are all lower year on year. Russia and Ukraine are the only major exporters showing year-on-year gains. World ending stocks fall to 272.8 MMT, their lowest in several years, and global trade volumes contract by ~12 MMT. The direction is unambiguously falling relative to the prior-year record. [USDA WASDE Jul-2026, 2026-07-10]

**Swing factor 1 — US crop at a 56-year low; HRW drought damage is severe.**
US all-wheat production in MY 2026/27 is forecast at 1,536 million bushels (~41.8 MMT), the lowest since 1970/71. Hard Red Winter (HRW), the dominant US export class, is the source of the damage: yield conditions rated good-to-excellent reached only 26% in late June 2026, well below the five-year average of 43% and last year's 48%, with severe drought across the southern Plains (Kansas, Oklahoma, Texas). Winter wheat production overall fell 27% year on year to 1,030 million bushels. The US season-average farm price is projected at $6.00/bu, up from $5.06/bu last year, reflecting this tightening. [USDA NASS Jul 2026 Crop Production briefing, 2026-07-10; US Wheat Associates harvest report, week ending Jul 1 2026; USDA Crop Progress, Jun 2026]

**Swing factor 2 — Australia's crop collapsing 26%; the second consecutive shortfall limits SH-origin supply in late 2026 and early 2027.**
ABARES (Australian Bureau of Agricultural and Resource Economics and Sciences) forecasts MY 2026/27 wheat production at 26.7 MMT, down 26% from 36.0 MMT in 2025/26 and 23% below the five-year average. Area planted falls 12% to 10.9 million hectares, the smallest since 2019/20, driven by higher fertiliser costs and dry conditions in northern cropping regions. USDA's June 2026 WASDE reduced Australia's export forecast by 2.0 MMT to 24.0 MMT. Australia is the main Southern Hemisphere supplier to Asian and Middle Eastern import markets; a 26% production cut directly reduces the availability of premium white and hard wheat in Q4 2026 and Q1 2027. [ABARES Australian Crop Report Jun-2026, 2026-06; USDA WASDE Jun-2026, 2026-06-11]

**Swing factor 3 — Russia's crop is rising, but export access is quota- and duty-constrained, and the harvest is still underway.**
Russia's USDA-estimated 2026/27 crop stands at 88.0 MMT (up from ~82.5 MMT in 2025/26), and private forecasters SovEcon and Argus place the figure at 89.7 and 91.2 MMT respectively [SovEcon, labelled estimate, 2026-07-08; Argus, labelled estimate, 2026-07]. Russia set its H1 2026 grain export quota (Feb 15–Jun 30) at 20 MMT, doubled from 10 MMT in 2025, and expanded it by 5 MMT in April 2026 [Global Trade Alert, 2026-04]. The floating export duty fell to zero for the week of Jul 15–21 2026 as the indicative export price for Russian wheat fell below the duty-trigger threshold of $232.3/t — the lowest duty since the mechanism was introduced — meaning Russia can currently ship wheat freely [UkrAgroConsult, 2026-07]. Russia's USDA export forecast for MY 2026/27 is 48.0 MMT (up 2.0 MMT from the prior month). A larger, competitively priced Russian crop caps the upside to global supply tightness from the US and Australian shortfalls, but the war risk to Black Sea shipping lanes remains a structural uncertainty. [USDA WASDE Jun-2026, 2026-06-11; Russian government export-quota decrees, 2025-12 and 2026-04; UkrAgroConsult, 2026-07]

---

## 3. Gaps / Low-Confidence Items

- **Russia's final crop size is still being harvested** (as of 2026-07-12, harvest is underway). The 88 MMT USDA figure and the private estimates (89.7–91.2 MMT) diverge by up to ~3 MMT; the USDA August WASDE (scheduled 2026-08-12) will carry the first full-season survey-based estimate. The range matters: at 91 MMT Russia is closer to its record 2022/23 output and supply relief is greater.
- **EU sub-national crop conditions** are not fully resolved; COCERAL's June forecast of 143.7 MMT is directionally lower than 2025/26 but a 25 June European Commission cereals report showed mixed conditions across France, Germany, and Romania. Final EU harvest results will arrive Aug–Sep 2026.
- **Argentina's 2026/27 crop will not be planted until Oct–Nov 2026**; the USDA 21.0 MMT estimate is an early-season projection and carries wide error bars. Argentina's 2025/26 outturn of ~27.9 MMT is used as the prior-year comparator based on USDA consensus; the exact official figure was not confirmed from an Argentine government primary source in this run.
- **China's consumption vs. production dynamics** are largely opaque (China holds an estimated ~50% of world wheat stocks, but these are captive strategic reserves, not freely traded). The 141 MMT production figure comes from USDA and has not been independently corroborated by a Chinese government primary source. China's domestic stocks are not reflected in the market-clearing stocks-to-use that drives export prices.
- **India export policy**: India's 2025/26 wheat output is at a record 120.65 MMT and FCI procurement hit 29.92 MMT (highest in four years) [Business Standard, 2026-05-27; FCI press releases, 2026-05]. Whether India will relax its 2022-era wheat export restrictions is a policy overhang not resolved in this run; if India allows exports, it would add several MMT to global availability.
- **No data/WHEAT pool files were found** (`data/WHEAT/` directory is empty). All figures above draw from public web sources [labelled unverified where applicable]; no licensed data provider export was available for this run.



---

## supply-demand / 02_commodity-demand-inventory.md

_Source: `02_commodity-demand-inventory.md`_

# Demand & Inventory — WHEAT

As of: 2026-07-12. Marketing year referenced below is June/July–May unless noted.

---

## 1. Demand

| Segment | Latest (2025/26 est.) | Prior (2024/25 est.) | YoY | Source, period |
|---|---|---|---|---|
| World total use | 810.6 MMT | 797.0 MMT | +1.7% | USDA WASDE Jul-2026, 2026-07-10 |
| Food, seed & industrial (FSI) — world | ~652 MMT (est.) | ~641 MMT | ~+1.7% | USDA ERS, May 2025 Wheat Outlook (641.3 for 2024/25); Jul-2026 WASDE notes FSI raised; inferred from total less feed (labelled estimate) |
| Feed & residual — world | ~158 MMT | ~157 MMT | +0.6% | USDA WASDE Jan-2026 txt (157.1 for 2024/25 est.); raised modestly in subsequent reports on Kazakhstan, Thailand [USDA WASDE Jul-2026, 2026-07-10] |
| China domestic use (food + feed) | 152 MMT | 150 MMT | +1.3% | USDA FAS Grain & Feed Update, Beijing, Sep-2025; FY2025/26 FSI stable, feed use up |
| India domestic use (FSI + PDS distribution) | ~109 MMT | ~104 MMT | +4.8% | USDA FAS Grain & Feed Update, New Delhi; population growth + Public Distribution System (PDS) expansion; largest single FSI increase cited for 2026/27 [USDA WASDE Jul-2026] |
| 2026/27 world total use (first projection) | 823.2 MMT | 810.6 MMT (2025/26) | +1.6% | USDA WASDE Jul-2026, 2026-07-10 |

**Notes on segment definitions.** USDA's "Food, seed & industrial" (FSI) covers direct human consumption (the dominant share, roughly 560–570 MMT out of ~641 MMT globally in 2024/25), seed, and a small industrial use component. "Feed & residual" covers animal feed and non-food losses. The FSI figure above is an inference from total use minus feed — the July 2026 WASDE does not publish FSI as a standalone world total in accessible text form. China holds the largest share of world stocks and wheat consumption (~19% of world use); India is the fastest-growing FSI consumer.

### Biggest demand swing factors

1. **India FSI growth.** India's rising population and Public Distribution System wheat offtake are the single largest structural driver of FSI expansion. India's domestic use is projected to keep growing above 1% per year even at ample domestic supply levels [USDA WASDE Jul-2026, 2026-07-10].
2. **China feed use.** China's feed allocation shifts with corn-price differentials — when corn is relatively expensive, mills redirect more wheat to livestock feed. Chinese feed use is already elevated (~35 MMT in 2025/26) and represents a swing factor of several MMT that can move the global balance [USDA FAS Grain & Feed Annual, Beijing, Mar-2026].

---

## 2. Inventory / Buffer

The primary buffer measure for wheat is the **stocks-to-use ratio (STU)**. The USDA distinguishes (a) the **global STU** — which includes China's state-managed reserves (~51–52% of world ending stocks) that are not freely traded — and (b) the more market-relevant **major-exporter STU**, which reflects the stocks actually available to import-dependent countries.

| Measure | Latest | Prior year | Trend | Tight vs history? | Source, date |
|---|---|---|---|---|---|
| World ending stocks — 2025/26 | 261.5 MMT | 260.0 MMT (2024/25 est.) | Trough, ~flat | Tight — 10-year low per USDA; tightest since 2015/16 | USDA WASDE Jul-2026, 2026-07-10 |
| World ending stocks — 2026/27 (proj.) | 272.8 MMT | 261.5 MMT (2025/26) | Rising (rebuilding) | Still below 5-year avg of ~280+ MMT | USDA WASDE Jul-2026, 2026-07-10 |
| Global stocks-to-use ratio — 2025/26 | ~32–33% | ~33% (2024/25) | Mildly tightening | Broadly comfortable at the global level; misleading because China holds ~52% of stocks | ING Think, 2026 (labelled unverified secondary); cross-checked vs WASDE totals |
| Major-exporter ending stocks — 2025/26 | ~65.2 MMT | ~33.9 MMT (2024/25 est.)* | Recovering from 2024/25 trough | Remains tightly ranged; exporter STU ~8–8.4% | USDA WASDE Jun-2026; USDA WASDE Jan-2026 txt; *2024/25 figure from Jan-2026 txt |
| Major-exporter ending stocks — 2026/27 (proj.) | ~59–62.5 MMT | 65.2 MMT (2025/26) | Declining — tightening again | Tight — down 3–6 MMT YoY; nearly all major exporters tightening | USDA WASDE Jul-2026 (~59 MMT implied); USDA WASDE Jun-2026 (62.5 MMT) |
| Exporter stocks-to-use ratio — 2026/27 | ~8.0% | ~8.4% (2025/26) | Declining | Historically tight: tightest since early 2010s; key import regions (MENA, SEA) face constrained availability | USDA Wheat Outlook May-2026 (8.0%/8.4% range) |
| China ending stocks (within world total) | ~137–140 MMT | ~135 MMT | Stable / slight growth | Comfortable for China domestically but not available for world trade | USDA FAS / inference from world minus exporter stocks (labelled estimate) |

*Note: The 2024/25 major-exporter ending-stock figure of ~33.9 MMT from the January 2026 WASDE text file appears anomalously low and may reflect a different definition of "five major exporters" vs. the broader eight-exporter grouping used in monthly WASDE commentary. The June 2026 WASDE commentary cites a 65.2 MMT level for 2025/26 for the broader exporter group. Both are cited here; readers should use the 65.2 MMT (2025/26) / 62.5 MMT (2026/27 June estimate) figures for the comparable series.

### Buffer assessment

The **global STU of ~32–33% looks comfortable in isolation but is the wrong number to watch.** Because China holds roughly half of world wheat stocks and does not export meaningfully, the price-setting buffer is the **exporter STU, currently ~8%** — a level that is historically tight and has been associated with elevated price volatility. Ending stocks for the eight major exporters are forecast to fall again in 2026/27 (to ~59–62.5 MMT), extending tightness into the new crop year.

The 2025/26 world ending-stock level of 261.5 MMT is the lowest in ten years, though a production recovery in 2025/26 (843.8 MMT, a record) prevented a more severe drawdown. The 2026/27 season begins with global production already down to 819.1 MMT on crop problems across the US, EU, and Argentina — which partly offsets the rebuilding of Chinese and Indian reserve stocks.

---

## 3. Gaps / low-confidence items

1. **FSI vs feed split for world total (2025/26 and 2026/27).** The USDA July 2026 WASDE PDF tables were not extractable in readable text form. The FSI figure above (~652 MMT for 2025/26) is inferred from total use minus feed; it is consistent with the trend but carries a low-confidence flag. The USDA ERS Wheat Outlook (Jun-2026) is the source that would carry the explicit breakdown — that PDF also returned as binary.
2. **Exact exporter STU percentage.** The 8.0% / 8.4% exporter STU figures come from the May 2026 WASDE summary (CIH Hedging, labelled secondary); they have not been directly confirmed from the July WASDE text. The directional trend (declining) is confirmed from multiple WASDE commentary sources.
3. **China stock opaqueness.** Chinese government wheat stocks are not independently audited. USDA FAS estimates Chinese ending stocks based on official data and attaché reports; the margin of uncertainty is material (±10–20 MMT). This means the global STU calculation carries a China-opacity caveat.
4. **2024/25 major-exporter stock discrepancy.** Two USDA-sourced figures conflict for 2024/25 exporter stocks (~33.9 MMT from January txt vs. ~65 MMT from WASDE commentary). The discrepancy likely reflects different exporter groupings (five-exporter vs. eight-exporter). The 65 MMT series is used for trend purposes.
5. **IGC data.** The IGC Grain Market Report for July 2026 could not be accessed in full text; only summary-level figures were retrieved via web search. IGC figures are consistent directionally (global wheat stocks declining ~2% in 2026/27) but specific MMT breakdowns are not cited from IGC here.



---

## supply-demand / 03_commodity-weather-seasonality.md

_Source: `03_commodity-weather-seasonality.md`_

# Weather & Seasonality — WHEAT

**As of: 2026-07-12**

---

## 1. Is weather a driver here?

**Yes — a dominant driver.** Wheat is a field crop whose production is set largely by weather across multiple growing regions simultaneously. The WHEAT profile marks weather/seasonality as a DOMINANT lens, covering: US winter-wheat dormancy, winterkill, and the drought during grain-fill; spring-wheat heading and harvest; the Southern Hemisphere (Australia/Argentina) planting and growing season; ENSO; and harvest windows in Russia and the EU. Right now, the US hard red winter (HRW) crop has just been devastated by drought — the worst in six decades — while Australia is heading into planting under an emerging El Niño.

---

## 2. Current weather state

| Driver | State vs normal | Push on the balance | Source, date |
|---|---|---|---|
| **US Southern Plains drought (HRW)** | 63% of total US winter-wheat production area was in drought as of 9 Jun — vs 15% a year earlier. Kansas yield projected at 37 bu/acre vs 51 bu/acre in 2025. HRW production ~470–515 Mbu, down 36% yr/yr. Winter wheat rated only 26% good-to-excellent as of 5 Jul, vs 48% a year ago. | Strongly bearish for 2025/26 US supply. US all-wheat production now forecast 1,543 Mbu — lowest since 1970/71. HRW supply tightest since 1965. | [USDA Drought Monitor / USDA NASS Crop Progress, 2026-07-05]; [USDA WASDE, 2026-06-11]; [farmprogress.com, 2026-06-xx, unverified] |
| **US winter-wheat harvest pace** | 59% harvested nationwide as of 5 Jul, 8 pts ahead of last year and the 5-yr average of 51%. The early pace reflects hot, dry conditions that rushed maturity, not a healthy crop. | Harvest is largely done in the South (Oklahoma 98%, Kansas 91%); HRW output damage is already booked. Price risk shifts to whether final yields come in above/below the low-end USDA estimate. | [USDA NASS Crop Progress, 2026-07-05]; [US Wheat Associates Weekly Harvest Report, 2026-07-01] |
| **US spring wheat (HRS, Northern Plains)** | 54% headed as of 5 Jul, 4 pts behind last year but on the 5-yr average. North Dakota and Montana slightly behind; Washington well ahead (98% headed). Conditions are mixed but not stressed in the way the Southern Plains were. | Mildly neutral. Spring-wheat crop not yet harvested; the critical window is July–August. Crop is not raising a red flag at this stage. | [USDA NASS Crop Progress, 2026-07-05] |
| **Russia (Black Sea)** | Preliminary indications: winter wheat sowing for the 2026 harvest was completed on planned area; spring rainfall boosted soil moisture and satellite data indicate strong development. USDA projects 88 mmt production for 2026/27. SovEcon notes planted area declined slightly to ~26.3 mln ha from 26.9 mln ha, and planted area is shifting toward oilseeds longer-term. Harvest underway in southern regions. | Counterbalancing / bearish for price. Russia's crop is holding up near-record levels, keeping the export price cap in place and limiting the upside from US tightness. | [USDA WASDE, 2026-06-11]; [S&P Global / SovEcon, 2026-06, unverified]; [UkrAgroConsult, unverified] |
| **EU wheat** | Production forecast at ~143.7 mmt — down ~6% from the exceptional 2025 record (150.8 mmt) but not below normal. Germany: good conditions. France: June heatwave hit grain-fill in some northern regions, eroding earlier gains. Romania: on track for a historic harvest. Overall: below the 2025 record but not alarming. | Mildly bearish for price (production still large, offsets some US tightness). | [COCERAL Crop Forecast, 2026-06]; [EU Joint Research Centre, 2026-04-27] |
| **Australia (SH planting, 2026/27 crop)** | Wheat area estimated down ~20% to 9.8 mln ha (24% below 5-yr average). Production forecast at 21–27 mmt vs 35.8 mmt in the prior bumper crop (–26% to –41% depending on source). Rainfall outlook for Jun–Aug signals increased probability of below-median rainfall across the wheatbelt. Risk of El Niño-induced dry winter is the core threat. Fertilizer availability is a secondary concern. | Bearish for SH supply (the 2026/27 harvest comes in Nov–Jan). Adds to global tightness if Australia's crop undershoots current forecasts, which carry their own downside risk. | [ABARES Australian Crop Report, 2026-06]; [Rabobank, 2026-05, unverified]; [Bloomberg, 2026-06-01, unverified] |
| **Argentina (SH planting, 2026/27 crop)** | Planting ~80.9% complete on projected 6.5 mln ha as of early July. Recent mostly dry conditions have improved field conditions and accelerated sowing. Harvest forecast raised to ~20.5 mmt after expanded area. Yields forecast at 3.2 t/ha (above historical average). | Slightly supportive for SH supply — Argentina recovering from poor prior season. Modest positive offset to Australian weakness. | [USDA FAS Buenos Aires Grain and Feed Update, 2026]; [Rosario exchange via TradingView, 2026, unverified] |
| **ENSO** | El Niño developing. Niño-3.4 index at +1.2 °C (as of 9 Jul); Niño-1+2 at +2.7 °C. CPC gives 81% probability of a very strong El Niño (Niño-3.4 ≥ +2.0 °C) during Oct–Dec 2026. Persistence into early spring 2027 at 97% probability. | Bearish for Australian and Argentine crops (El Niño = increased dry risk for SH) — risk is not yet in the ground but the signal strengthens through the coming months. For the current NH crop, most damage is already done. El Niño is also associated with dryer HRW areas in the US Southern Plains in autumn/winter, which shapes the 2027 HRW planting environment. | [NOAA/CPC ENSO Diagnostic Discussion, 2026-07-09] |

---

## 3. Seasonality / calendar position

**Where we are in the crop year (Northern Hemisphere):**

- The 2025/26 US winter wheat crop is essentially in the bin. Harvest is 59% complete nationwide as of 5 July; the hard red winter (HRW) crop — the class most devastated by Plains drought — is nearly done (Kansas 91%, Oklahoma 98%). Final production damage is booked: USDA pegs all-wheat at 1,543 Mbu, the lowest since 1970/71. The market has partially priced this already; residual uncertainty is at the margin of final yield vs the USDA estimate.
- US spring wheat (hard red spring, MGEX) is in heading/early grain-fill — the most weather-sensitive window. The period from mid-July to mid-August is the critical window for the HRS crop in the Northern Plains (North Dakota, Montana, Minnesota). Any heat/drought stress here would add further tightness.
- Russia's Black Sea harvest is underway in the south, with volumes on track near 88 mmt (USDA WASDE). Russia's export-price competitiveness continues to cap CBOT upside.
- EU harvest is beginning or imminent in France and Germany (typically July); crop is below the 2025 record but not a disaster.

**Southern Hemisphere — the next major weather-sensitive window:**

- Australia: the 2026/27 winter crop is in the ground now — June/July planting window. The coming weeks through September are critical for establishment rainfall. The emerging strong El Niño (Niño-3.4 already +1.2 °C and rising) raises the risk of a dry winter/spring for the Australian wheatbelt, which in El Niño years tends to receive below-median growing-season rainfall. ABARES is already forecasting output down ~26% on current assumptions; a dry El Niño outcome could push the crop below that.
- Argentina: July–August is the tillering stage — a key fertilizer/moisture window. Planting has been progressing well, and the early outlook is constructive.

**Net calendar read:**

The 2025/26 NH crop weather damage (US drought, moderate EU decline) is largely settled; the price-relevant weather windows now are (a) US spring-wheat grain-fill in July–August and (b) Australia's growing-season rainfall through September. The El Niño signal, strengthening toward what models project as a very strong event by Oct–Dec 2026, is the overarching seasonal risk — it puts both Australia and the US Southern Plains (for the 2026/27 HRW planting in autumn) under pressure.

**Overall weather read: bearish for global supply** — the US HRW damage is severe and confirmed; Australia's crop faces rising El Niño risk; only Russia and early-stage Argentina offer partial offsets. The risk to the balance is on the supply-reduction side.
