# supply-demand Module Dossier — ALUMINIUM

> Deterministic, lossless concatenation of every artifact in this module — the module synthesis and every specialist output, in order. Generated mechanically (no LLM rewriting), so nothing is omitted or paraphrased. This is the module's "see everything" tier; the module's decision lives in `99_*-synthesis.md` and the short read in `supply-demand_memo.md`.

- Generated: 2026-07-18T17:48:55Z
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

# Supply–Demand Balance — ALUMINIUM (module synthesis)

## Abstract
The primary-aluminium market (the metal made from raw ore, as opposed to recycled/secondary metal) tipped into deficit in 2025 and the exchange-visible buffer is now tight: LME registered warehouse stock (metal sitting in exchange-approved sheds, available to deliver against a contract) fell about 32% since January 2026 to roughly 284,600 t on 2026-07-15 — its first sub-300,000 t reading since 2022 — with the market pricing near-term scarcity through backwardation (cash price above the 3-month price) [01, IAI/AlCircle data; 02, LME stocks via Trading Economics/dated aggregators, 2026-07-17]. World primary supply grew only 1.06% in 2025, the slowest rate in five years, because China's largest producer bloc is running into its own 45 Mt/year self-imposed cap and the Gulf region went backward [01, IAI data, pub. 2026-01-26]. Demand grew faster (~2.4% in 2025 on vendor estimates, ~2.7% forecast for 2026), driven by Europe's electric-vehicle aluminium intensity even as China's construction and solar-linked demand stayed weak [02, Precedence Research/GMInsights vendor estimates; AlCircle, 2026-07]. The direction is tight-and-tightening on the exchange side, normalizing-but-still-elevated on the China physical side, with the single biggest near-term swing factor being the seasonal transition of China's Yunnan hydropower smelting region from its current wet-season (high-output, bearish-for-price) state into its November 2026 dry season, which has historically forced curtailments of up to ~400,000 t right when the buffer already has little room [03, Weather & Seasonality module; AlCircle/Fastmarkets Yunnan coverage].

## Balance (surplus / deficit)
- **World primary production, 2025: 73.78 Mt, up 1.06% YoY from 73.01 Mt — the slowest growth rate in five years** [01, IAI data via AlCircle, pub. 2026-01-26]. China alone produced 45.02 Mt (60% of world output, +2.4% YoY), already above its own long-standing 45 Mt/year policy ceiling, with smelters reported running ~3% over rated nameplate capacity without formally breaching the cap [01, China NBS data via AlCircle/Mysteel; AlCircle "45MT cap in name only," 2026]. The GCC bloc (roughly 9% of world output) posted its lowest volume since 2020 even as its largest single producer, Emirates Global Aluminium, grew cast-metal sales 3.3% to 2.83 Mt — implying the other Gulf producers (Saudi Ma'aden, Bahrain's Alba, Oman's Sohar, not broken out in the supply specialist's pull) fell by more than EGA's gain, a genuine tension in the regional read rather than a contradiction to average away [01, IAI/EGA data].
- **Demand, 2025: total world consumption (primary plus secondary/recycled metal) an estimated ~104.0 Mt, up 2.4% from 101.6 Mt in 2024, forecast to reach ~106.8 Mt in 2026 (+2.7%)** — vendor estimates (Precedence Research/GMInsights), not an official IAI or CRU print, and explicitly unverified [02, vendor market reports, pub. 2026]. **These consumption totals include secondary (recycled) metal and are not directly comparable to the 73.78 Mt primary-only production figure above** — the specialists did not supply a matched primary-vs-primary balance, so the tonnage gap between the two tables should not be read as "the deficit." China's own apparent electrolytic-aluminium consumption was 46.65 Mt in full-year 2025 (+2.89% YoY), and it remains more than 55% of world demand — the single largest swing weight in the whole balance [02, SMM/Mysteel data via AlCircle, pub. 2026].
- **The deficit estimates that matter are third-party primary-metal balances, and they disagree by an order of magnitude depending on vintage.** ING's December 2025 estimate put the 2025 deficit at ~100kt, widening to ~200kt in its 2026 base case (up to ~600kt if South32's Mozal smelter closure is not reversed) [01, ING THINK, pub. 2025-12-08]. By 2026-07-14, ING had revised its 2026 deficit estimate up to ~1.2 Mt, closer to CRU's independent ~1.4 Mt estimate, citing slower-than-expected Middle East supply recovery [02, ING THINK, revised 2026-07-14]. **Reconciliation: the July 2026 revision supersedes the December 2025 estimate on recency (§4 conservative-and-current default), and it is now directionally corroborated by an independent vendor (CRU) rather than resting on ING alone** — but both remain vendor forecasts, not an official balance-body figure (no IAI/USDA-equivalent published aluminium stocks-to-use or balance series exists), so the ~1.2–1.4 Mt figure should be read as "likely" (60–75% confidence band, per the probability discipline) rather than a settled number.
- **Net balance read: the market is in deficit in 2025 and 2026, with the size of that deficit still being revised upward by the vendors covering it, not downward.** This is a directional finding (deficit, widening) more than a precise-tonnage one, given the primary/total mismatch above and the vendor-only sourcing of the deficit figures themselves.

## Inventory buffer vs history
- **LME registered stock is at a multi-year low and still falling.** ~284,600 t on 2026-07-15, down from ~420,000 t in January 2026 (about -32% year-to-date), the first sub-300,000 t reading since 2022, against a recent-cycle history of LME aluminium stocks running well above 300,000–1,000,000+ t [02, LME stocks via Trading Economics/dated aggregators, 2026-07-17 — unverified against LME's own site, which returned an HTTP 403 on direct fetch]. The cash price traded above the 3-month price (backwardation) as of 2026-07-15 (~USD 3,153/t cash vs ~USD 3,150/t 3-month), a live signal of near-term physical scarcity rather than a stale one [02, dated market-report aggregators, 2026-07-15].
- **China's off-exchange social inventory (metal sitting in trader/consumer warehouses, tracked by SMM/Mysteel — not the same measure as SHFE's own exchange-warrant stock) is destocking fast but from an elevated base.** It fell from a 2026 peak of 1.465 Mt in early May to ~1.02–1.08 Mt by mid-July (a ~380–400kt drawdown in about ten weeks), but that mid-July level is still well above the ~782,000 t seen at end-January 2026 [02, AlCircle citing SMM/Mysteel, dated 2026-07-09/07-16]. **This reads as a seasonal unwind of an H1 build, not yet a multi-year-low condition** — the opposite tightness signal from the LME side, and the two should not be averaged into one buffer number.
- **SHFE's own exchange-warehouse stock (China's on-exchange equivalent to LME registered stock) could not be confirmed to a current date.** The only figure found (478,354 t) is tagged to mid-April 2026 ("week 16") and is roughly three months stale by 2026-07-18 [02, MacroMicro, week-16-2026]. This is a genuine gap, not a claim, and it means the China exchange-visible buffer cannot be placed vs history with the same confidence as the LME read.
- **Overall buffer verdict: tight and still tightening on the exchange-visible (LME) side; normalizing but not yet tight on the China physical (social-inventory) side; not assessable on the China exchange (SHFE) side.** No formal aluminium stocks-to-use ratio exists (unlike grains) — the buffer read rests on exchange stock levels and the cash/3-month spread as the standard base-metal proxies, which carry less precision than a formal ratio.

## Direction & biggest swing factor
- **Structural supply direction: growth is decelerating, not reversing, and the constraint is now visibly binding rather than theoretical.** China's 45 Mt/year cap — "current policy signals suggest [it stays] through at least 2027" [01, Discovery Alert/AlCircle] — means almost all incremental world primary growth must now come from outside China, a slower and higher-cost base. Layered on top: Guinea's bauxite-export disruption (roughly 32% of world bauxite supply, with EGA's Guinea Alumina Corporation licence terminated outright and a further export-control framework due in June 2026) and Alcoa's permanent closure of the 2.2 Mt/year Kwinana alumina refinery are squeezing the alumina/bauxite feedstock that smelters need, independent of primary-metal capacity itself [01, EGA H1 2025 results; Bloomberg, 2026-05-25; Alcoa/S&P Global, 2025-10-02]. Two discrete European-relevant outages — South32's Mozal smelter (Mozambique, care-and-maintenance from ~2026-03-15) and Century Aluminum's Nordural Grundartangi smelter (Iceland, running at roughly one-third capacity since an October 2025 equipment failure) — are the specific reason the European physical market is expected to stay tight through 2026 [01, South32/Fastmarkets reporting, 2025–2026].
- **Demand direction: growing overall (~2.4–2.7% per vendor estimates) but diverging sharply by region.** Europe's EV-driven aluminium intensity is a genuine tailwind (Q1 2026 battery-EV sales +36%, ~42% of Q1 aluminium consumption in that segment), but this is being offset by weaker China and US EV volumes (China EV sales -21%, US -9% in the same quarter) [02, AlCircle, 2026 Q1 data]. China's own domestic demand — construction/property and solar, historically large consumers — stayed weak through H1 2026 even as China's exports and production held up (a "weak domestic, strong external" split), and because China is more than 55% of world demand, this is the single largest demand-side swing risk in the balance [02, AlCircle, "China aluminium market H1 2026 review," 2026-07].
- **The single biggest swing factor for the balance over the next two to three quarters is the Yunnan wet-to-dry season transition, expected from around November 2026.** Yunnan's roughly 5 Mt/year of hydro-powered smelting capacity (over 10% of China's total) is currently in its wet season, running at or near an all-time-high daily output rate (~129,000 t/day in April 2026) on cheap, plentiful hydropower — a mildly bearish, supply-adding condition right now [03, SMM cost/output data, 2026-06]. Past dry seasons (roughly November–April) have forced curtailments of up to ~400,000 t when reservoirs and provincial power-rationing directives bite [03, AlCircle/Fastmarkets Yunnan coverage]. If the coming dry season repeats that pattern, it would remove supply at precisely the moment the exchange-visible buffer (LME stock) is already at a multi-year low and the market is already estimated in deficit — compounding rather than offsetting the existing tightness. No curtailment signal is visible yet as of 2026-07-18; this is a forward-looking, dated risk window (roughly November 2026 onward), not a current condition — labelled as such per the module's weather-forecast discipline (§7 MODULE_RULES: state the observed condition, not a settled forecast).
- **Runner-up swing factor:** whether China's regulators approve the pending exemption of renewable-powered (hydro/wind/solar) smelters from the 45 Mt cap. If approved, this could add primary capacity and loosen the single biggest structural supply constraint identified above; it is unresolved as of this writing [01, AlCircle, "45MT cap in name only," 2026].

## Reconciliation & Gaps
- **Deficit-size contradiction (ING Dec-2025 ~100–600kt vs ING/CRU Jul-2026 ~1.2–1.4 Mt): resolved by recency, not averaging.** The July 2026 figures supersede the December 2025 estimate and are cross-corroborated by an independent vendor (CRU); both remain unofficial vendor forecasts (no official aluminium balance body exists), so treat the ~1.2–1.4 Mt 2026 deficit as "likely" (60–75% confidence band) rather than certain.
- **Primary-supply vs total-consumption unit mismatch:** the 73.78 Mt world primary-production figure and the ~104.0 Mt total-consumption figure (which includes secondary/recycled metal) are not on the same basis. Do not subtract one from the other to infer a deficit tonnage — the specialists did not supply a matched primary-vs-primary series, and this synthesis has not invented one.
- **GCC regional output:** IAI's qualitative "lowest volume since 2020" for the whole bloc sits alongside EGA's own +3.3% growth. Both are accurate for what they measure (bloc-wide vs one producer); the implication is that non-EGA Gulf producers fell more than EGA grew — flagged as an inference, not confirmed by a broken-out regional figure.
- **China buffer read:** LME stock (tight, multi-year low) and China's social inventory (destocking but still above its end-January level) point in different directions on "how tight is the buffer." Both are held separately above rather than blended into one number, per §3 core-truth (do not average away contradictions).
- **Gaps carried forward unresolved:** no confirmed current-dated SHFE exchange stock figure (stale by ~3 months); no official IAI/CRU world-consumption print (vendor-only); no single official 2025 India production total; no confirmed China H1 2026 consumption figure (inferred from production/export/inventory data, not directly cited).

## Note to the Commodity Thesis
- Global primary-aluminium balance is in **deficit** in 2025 and 2026 (vendor estimates now converging near ~1.2–1.4 Mt for 2026, up from an earlier ~200–600kt estimate), while the exchange-visible buffer (LME stock) is at its **tightest level since 2022** and still falling, with the market pricing that scarcity through backwardation.
- China's off-exchange inventory is still destocking from an elevated build and the China on-exchange (SHFE) buffer could not be confirmed current — the "how tight" read is exchange-side tight, China-physical-side merely normalizing.
- The single biggest near-term swing factor is the **Yunnan wet-to-dry season transition (~November 2026)**: a repeat of past dry-season curtailments (up to ~400,000 t) would hit supply exactly when the buffer already has little room; China's own construction/solar demand weakness is the largest demand-side swing risk given China is >55% of world consumption.
- Two structural supply constraints reinforce the deficit independent of weather: China's 45 Mt/year production cap (likely held through 2027) and the Guinea bauxite/Alcoa Kwinana alumina squeeze — both keep incremental supply growth slow and costly even before any Yunnan dry-season curtailment.



---

## supply-demand / 01_commodity-supply.md

_Source: `01_commodity-supply.md`_

# Supply — ALUMINIUM

## 1. Production Balance

Primary aluminium, world + the producers that move the balance. Figures are calendar-year unless noted.

| Region / producer | Latest (2025) | Prior (2024) | YoY | Source, period |
|---|---|---|---|---|
| World (primary aluminium) | 73.78 Mt | 73.01 Mt | +1.06% (5-year-low growth rate) | [IAI data via AlCircle, "World primary aluminium production growth hits 5-year low in 2025," pub. 2026-01-26] |
| China (primary aluminium) | 45.02 Mt | ~43.97 Mt (implied) | +2.4% | [China NBS data via AlCircle/Mysteel, pub. 2026-01-19/20] |
| Russia — Rusal (primary aluminium) | 3.918 Mt | 3.992 Mt | −1.9% | [Rusal FY2025 results via TASS, reported 2026-03] |
| GCC — Emirates Global Aluminium, cast-metal sales (proxy for the Gulf, ~9% of world output) | 2.83 Mt | 2.74 Mt | +3.3% | [EGA FY2025 results/H1 2025 release, media.ega.ae] |
| GCC region overall (IAI classification, qualitative) | "lowest volume since 2020" | — | Down, direction only — no exact tonnage obtained | [IAI data via AlCircle, pub. 2026-01-26] |
| India (primary aluminium, low-confidence — no official 2025 total located) | ~4.2–4.3 Mt (estimate, not from a single official 2025 print) | 4.15 Mt (2023: 4.13 Mt) | Roughly flat to slightly up (inference from capacity data, not a filed total) | [SEAISI, "India's aluminium growth story," citing 2024 figure; Vedanta/Hindalco/NALCO capacity disclosures — inference for 2025] |

Note on the China figure: 45.02 Mt in 2025 is *above* China's own long-standing 45 Mt/year self-imposed production ceiling — smelters are reported to run ~3% above rated nameplate capacity without formally breaching the policy [AlCircle, "45MT cap in name only," and Discovery Alert summary of NBS data, 2026].

The World and China rows sit on the official IAI/NBS balance (Tier-1 for this module, §2 MODULE_RULES). The Rusal and EGA rows are company-reported production/sales, not an official national balance — the best available cited figures for those two balance-moving producers. The India row is flagged low-confidence: no single official 2025 total (IAI, NBS-equivalent, or JPC) was located in this pass; treat it as a gap, not a claim.

## 2. Direction & Swing Factors

**Direction: supply growth is decelerating, not reversing — and the ceiling is now visibly binding.** World primary output rose only 1.06% in 2025, the slowest growth rate in five years, entirely because the largest producer has hit its self-imposed cap and the next-largest bloc (GCC) went backward. ING estimates this leaves the global market in a ~100kt deficit in 2025, widening to ~200kt in 2026 in its base case (up to ~600kt if the Mozal smelter closure referenced below is not reversed) [ING THINK, "Aluminium deficit will support prices in 2026," pub. 2025-12-08]. Chinese net exports are down 700kt year-to-date per the same source, tightening the market outside China specifically.

- **China's 45 Mt/year smelter cap is now the single biggest structural constraint on world supply.** China produced 45.02 Mt in 2025 (60% of world output), already above the nominal 45 Mt ceiling policy first imposed in 2017 [NBS data via AlCircle, pub. 2026-01-19; Discovery Alert, 2026]. With the cap "current policy signals suggest [maintained] through at least 2027" [Discovery Alert / AlCircle], almost all incremental world primary growth now has to come from outside China — a slower, higher-cost base. The one live variable: a policy debate on whether renewable-powered (hydro/wind/solar) smelters should be exempted from the cap, which could add capacity if it goes through, but this is not yet decided [AlCircle, "45MT cap in name only," 2026].

- **Alumina/bauxite feedstock is being squeezed from two directions at once.** Guinea supplies roughly 32% of world bauxite; its government suspended bauxite exports from EGA's Guinea Alumina Corporation (GAC) and Compagnie des Bauxites de Guinée (CBG) through H1 2025, then terminated GAC's mining licence outright — which EGA calls expropriation — cutting EGA's own Al Taweelah alumina output to 1.14 Mt in H1 2025 from 1.22 Mt in H1 2024 and forcing a $687m asset write-down [EGA H1 2025 results release, media.ega.ae]. Guinea is separately finalizing a broader export-control framework due to be unveiled in June 2026 [Bloomberg, 2026-05-25]. At the same time, Alcoa has permanently closed its Kwinana alumina refinery in Australia, removing about 2.2 Mt/year of alumina refining capacity from the market [Alcoa press release, 2025; S&P Global, 2025-10-02]. Together these have already pushed alumina prices up sharply and squeeze smelter cash margins even where primary metal capacity itself is unconstrained [Seeking Alpha summary of alumina price moves, 2026].

- **Discrete smelter outages are tightening supply specifically in Europe through 2026.** South32's Mozal smelter in Mozambique (Africa's second-largest, and one of Europe's two most important supply sources) is being placed on care and maintenance around 15 March 2026 after a power-supply agreement with Mozambican and South African utilities collapsed; South32 has not procured the alumina needed to run it past that date, and expects only ~240kt of attributable output in its FY2026 (July 2025–June 2026) [South32/Mining Weekly/AlCircle reporting, 2025-08 to 2026-03]. Century Aluminum's Nordural Grundartangi smelter in Iceland has run at roughly one-third of capacity since an electrical-equipment failure knocked out one of its two potlines on 2025-10-21 [Fastmarkets, "Green aluminium deficit looms in Europe," 2026]. Combined, these two outages are the main reason the European physical market is expected to stay tight through 2026, separate from the China-cap and Guinea stories.

## 3. Gaps / low-confidence items

- No single official 2025 full-year India production total (IAI-equivalent or a government statistical release) was located in this pass; the ~4.2–4.3 Mt figure is an inference from 2024 data (4.15 Mt) plus producer capacity disclosures, not a filed number. Flag as a genuine data gap, not a claim.
- GCC-region 2025 output is described only directionally by IAI ("lowest volume since 2020"); no exact regional tonnage was located, so the EGA company figure (+3.3%) is used as a partial proxy and may not represent the bloc (Saudi Ma'aden, Bahrain's Alba, Oman's Sohar are not separately broken out here).
- The Rusal and EGA production/sales figures are company self-reported, not an independent official balance — treated as Tier-4/5 evidence per §2 of MODULE_RULES, one notch below the IAI/NBS rows.
- Whether China's renewable-powered-smelter exemption debate resolves in 2026 is unresolved and could move the China supply ceiling; not yet decided as of this writing.



---

## supply-demand / 02_commodity-demand-inventory.md

_Source: `02_commodity-demand-inventory.md`_

# Demand & Inventory — ALUMINIUM

## 1. Demand

| Segment | Latest | Prior | YoY | Source, period |
|---|---|---|---|---|
| World, total consumption (primary + secondary) | ~104.0 Mt (2025, provisional) | 101.6 Mt (2024) | +2.4% | [Precedence Research / GMInsights aluminium market report, 2025 provisional, pub. 2026 — vendor estimate, unverified] |
| World, 2026 forecast | ~106.8 Mt (2026F) | 104.0 Mt (2025) | +2.7% (forecast) | [Precedence Research / GMInsights aluminium market report, 2026 outlook, pub. 2026 — vendor estimate, unverified] |
| China, apparent electrolytic aluminium consumption | 46.65 Mt (full-year 2025) | ~45.35 Mt (2024, implied) | +2.89% | [SMM/Mysteel data via AlCircle press release, FY2025, pub. 2026 — dated web, vendor-sourced] |
| China, H1 2026 signal (production proxy, demand not separately disclosed) | Total production growth ~3.5% Jan–May 2026 y/y | Jan–May 2025 | +3.5% (production, not consumption) | [AlCircle, "China aluminium market H1 2026 review and H2 outlook," 2026-07 — dated web, unverified] |
| China aluminium semis exports (external demand pull) | 1.435 Mt (Jan–May 2026) | Jan–May 2025 | +13.7% | [AlCircle, "China aluminium market H1 2026 review," 2026-07 — dated web, unverified] |
| Global primary production (supply-side reference for scale) | 6.37 Mt/month (record, July, most recent full IAI print found) | June (prior month) | +3.2% m/m, +2.5% y/y | [IAI monthly primary aluminium production release, most recent month found, pub. date not verified in this pull] |
| End-use split — Transport | ~35% of global consumption | n/a | n/a | [Precedence Research aluminium market report, 2026 — vendor estimate, unverified] |
| End-use split — Construction | ~32% of global consumption | n/a | n/a | [Precedence Research / Fortune Business Insights aluminium market report, 2026 — vendor estimate, unverified] |
| End-use split — Packaging | ~16% of global consumption | n/a | n/a | [Precedence Research / GMInsights aluminium market report, 2026 — vendor estimate, unverified] |
| End-use split — Electrical, machinery, other (residual) | ~17% of global consumption | n/a | n/a | [Derived residual from the three segments above — inference, not from filings] |

**Biggest demand swing factors:**
1. **EV lightweighting momentum is diverging by region.** Europe's battery-EV (BEV) sales rose ~36% in Q1 2026 and BEVs now account for ~42% of Q1 2026 aluminium consumption in that segment, while China's EV sales fell ~21% and the US market shrank ~9% in the same quarter — a structural aluminium-intensity tailwind (EVs use ~25–40% more aluminium per vehicle than combustion vehicles) is being offset by weaker unit volumes in the two largest markets. [AlCircle, "Europe's 36% BEV surge...", 2026 Q1 data, pub. 2026 — dated web, unverified]
2. **China's domestic construction/property demand stayed weak through H1 2026 even as exports and production held up** ("weak domestic, strong external" divergence), with the solar sector — traditionally a large aluminium consumer — now facing grid-integration bottlenecks and a slower pace of new project investment. This is the single largest swing risk to global demand given China is >55% of world consumption. [AlCircle, "China aluminium market H1 2026 review and H2 outlook," 2026-07 — dated web, unverified]

## 2. Inventory / Buffer

| Measure | Latest | Trend | Tight vs history? | Source, date |
|---|---|---|---|---|
| LME registered warehouse stocks | ~284,600 t (2026-07-15) | Down from ~420,000 t in Jan 2026 (~-32% YTD); fell below 300,000 t for the first time since 2022 | **Tight** — multi-year low; historical LME aluminium stocks have typically run well above 300,000–1,000,000+ t in recent cycles | [LME stocks data via Trading Economics / Reuters-sourced market reports, 2026-07-17 — dated web, cross-checked against a second dated source, unverified against LME's own site (403 on direct fetch)] |
| LME cash–3M spread | Backwardation — cash ~USD 3,153/t vs 3M ~USD 3,150/t (2026-07-15); an earlier May-2026 print showed cash at a ~USD 91.5/t premium to 3M | Persistent backwardation through H1 2026 as registered stocks fell | **Tight** — backwardation signals near-term physical scarcity | [LME cash/3M price data via dated market-report aggregators, 2026-07-15 — dated web, unverified] |
| China aluminium ingot social inventory (SMM/Mysteel-tracked, major consumption regions — off-exchange, not the same measure as SHFE warrant stock) | ~1.02–1.08 Mt (week of 2026-07-13 to -17; two dated prints: 1.078 Mt on 2026-07-09, then a further ~54,000 t w/w draw reported mid-week after) | Destocking from a 2026 peak of 1.465 Mt in early May to ~1.02–1.08 Mt by mid-July — a ~380–400 kt drawdown over ~10 weeks | **Mixed** — falling fast, but the absolute level is still well above the ~782,000 t seen at end-January 2026, i.e. this is a seasonal unwind of an H1 build, not yet a multi-year low | [AlCircle press releases citing SMM/Mysteel China aluminium ingot social inventory, dated 2026-07-09 and 2026-07-16/17 — dated web, vendor-sourced, unverified] |
| SHFE exchange warehouse stocks | Not confirmed to a current date — most specific figure found (478,354 t) is tagged "week 16" (mid-April 2026) and is likely stale by three months | Directionally, Chinese destocking commentary (above) implies SHFE registered stock has also been drawing down through Q2–Q3, but no dated July 2026 SHFE print was retrieved | **Not assessable from this pull** — flagged as a gap (see §3) | [MacroMicro, SHFE Aluminium Warehouse Stock series, week-16-2026 reading — dated web, stale, low confidence] |
| Global "days of consumption" / stocks-to-use equivalent | Not published as a formal ratio for aluminium (no official body issues an aluminium stocks-to-use series analogous to USDA grain data) | n/a | n/a — the LME + China social-inventory reads above are the best available buffer proxies | Not proven from available data |

**Net read:** the two hardest, most current numbers — LME registered stock at a post-2022 low and a live cash-over-3M backwardation — point to a **tight** exchange-visible buffer. The Chinese social-inventory measure is destocking quickly but from an elevated H1 build, so it reads as normalizing rather than critically tight. Combined with market commentary of a 2026 global deficit (CRU ~1.4 Mt; ING revised to ~1.2 Mt as of 2026-07-14 on faster-than-expected Middle East supply recovery), the overall buffer is best characterized as **tight and still tightening on the exchange-visible side**, with the Chinese physical market providing a partial offsetting cushion. [ING THINK, "Aluminium deficit will support prices in 2026," revised 2026-07-14 — dated web, unverified against ING's own primary publication]

## 3. Gaps / low-confidence items

- **No current-dated SHFE exchange warehouse stock figure was retrieved.** The only specific number found (478,354 t) is tagged to mid-April 2026 ("week 16") and should not be treated as a July 2026 reading. A direct pull from `shfe.com.cn` Weekly Data would resolve this.
- **Direct LME.com fetch returned HTTP 403**, so the LME stock and cash/3M figures above are triangulated from two independent dated secondary aggregators (Trading Economics, a market-report aggregator) rather than the exchange's own page — labelled unverified per the source hierarchy; both agree on the sub-300,000 t level and the backwardation direction, which raises confidence somewhat, but neither is the primary LME data feed.
- **World consumption figures (101.6 / 104.0 / 106.8 Mt) come from paid market-research vendors** (Precedence Research, GMInsights), not from IAI's own published demand series — IAI's site (fetched directly) publishes methodology but the specific current monthly/annual demand print could not be extracted from this pull. These vendor totals should be treated as directional, not exact — the true IAI/CRU figure may differ.
- **China's H1 2026 apparent consumption growth rate (as opposed to production growth) was not found as a single disclosed number** — the H1 read here is inferred from production growth (+3.5% Jan–May), export growth (+13.7%), and the social-inventory swing, which is an inference chain, not a directly cited consumption figure.
- **End-use segment shares (transport 35% / construction 32% / packaging 16%) are generic vendor market-sizing splits**, not IAI's own official end-use breakdown, and the residual "electrical/other" line is a derived plug, not a cited figure.
- **No official aluminium stocks-to-use ratio exists** (unlike grains); the buffer read here relies on exchange stock levels and the cash/3M spread as proxies, which is standard practice for base metals but should not be read with the same precision as a formal stocks-to-use number.



---

## supply-demand / 03_commodity-weather-seasonality.md

_Source: `03_commodity-weather-seasonality.md`_

# Weather & Seasonality — ALUMINIUM

## 1. Is weather a driver here?
- No, not directly. Aluminium is a smelted industrial metal — the profile confirms weather is NOT a
  material driver of the LME price. The one indirect channel is **hydro-power availability in China's
  Yunnan province**, which feeds ~5 million tonnes/year of primary smelting capacity (>10% of China's
  total) and swings with Yunnan's wet/dry season cycle [frameworks/commodity/COMMODITY_PROFILES.md,
  ## ALUMINIUM]. There is no monsoon, ENSO, or crop-calendar analysis applicable to this commodity —
  the dominant movers are power/energy cost, China's supply cap, the US dollar, and Russia-sanctions
  metal (macro lens, covered elsewhere in this run).

## 2. Current weather state (if a driver)
| Driver | State vs normal | Push on the balance | Source, date |
|---|---|---|---|
| Yunnan hydropower (wet season) | Rainy season arrived on schedule; hydropower prices in Yunnan/Sichuan fell, pushing China's industry-average tax-inclusive full smelting cost down ~0.8% MoM / ~4.2% YoY in June; SMM assessed 100% of China's operating aluminium capacity as profitable in June | Mildly bearish for the balance — cheap, plentiful power supports smelters running near full capacity/output, adding supply rather than restricting it | [SMM (Shanghai Metals Market), aluminium cost report, 2026-06] |
| Yunnan output run-rate | Chinese daily primary output hit an all-time high of ~129,000 t/day in April 2026 as improved hydropower reserves allowed Yunnan smelters to ramp; no curtailment reported through the current wet-season window | Bearish — supply near capacity ceiling, not power-constrained right now | [Mining.com / SMM coverage of Yunnan ramp-up, 2026 data through Apr-2026] |
| ENSO / drought risk | No active drought signal reported for Yunnan reservoirs in the current (June–July) wet-season readings found | Neutral for now — the relevant risk (a dry-season power shortfall) is a Q4/Q1 event, not a current one | [SMM Yunnan operation-status coverage, 2026] |

Note: none of these are met-agency releases (IMD/NOAA-equivalent) in the way sugar or coffee would
cite; Yunnan hydro conditions are tracked through Chinese metals-market trade press (SMM/Fastmarkets/
AlCircle) reporting on provincial power-dispatch and reservoir status, which is the best available
proxy for this indirect channel.

## 3. Seasonality / calendar position
- China's Yunnan smelting sector runs on a **wet season (roughly May–October): full/near-full output on
  cheap hydropower** vs **dry season (roughly November–April): historical power-rationing risk, with past
  dry seasons forcing output cuts of up to ~400,000 tonnes** [AlCircle, Yunnan dry-season output-cut
  coverage; Fastmarkets, Yunnan power-rationing coverage]. As of 2026-07-18 the region sits mid-wet-season,
  so this channel is currently a non-issue and mildly supply-supportive (more metal, not less).
- **Next weather-sensitive window:** the transition into the 2026/27 dry season, roughly November 2026
  onward, when reservoir drawdown and provincial power-rationing directives (if any) would be the signal
  to watch for a renewed Yunnan curtailment risk to the supply side of the balance. Nothing in that
  direction is visible yet from current wet-season data.
- No material construction/auto demand seasonality distinct enough to flag beyond the profile's macro
  lens (China property, transport/packaging demand) — those are covered in the supply/demand module,
  not here.
