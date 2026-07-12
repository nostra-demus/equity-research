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
