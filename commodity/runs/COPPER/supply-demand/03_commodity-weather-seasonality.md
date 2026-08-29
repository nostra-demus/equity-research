# Weather & Seasonality — COPPER

**Run:** commodity/runs/COPPER/ · **As-of:** 2026-08-28 · **Owner orb:** `commodity-weather-seasonality` · **Signal family:** `weather-seasonality`

**Evidence status (binding, §8A):** no accepted connector vintages exist in this run, `data/COPPER/` does not exist, and the swarm pulse transport is dead (`PULSE-MISSING`, EPERM). Every fact below is **unvintaged live-web context**, labelled with source and as-of date. A reachable URL is not evidence. **Nothing in this report can raise data sufficiency or conviction**, and nothing here is conviction-eligible.

---

## 1. Is weather a driver here?

**No.** The profile is explicit: copper is *"NOT a weather commodity (mild China seasonality only — keep short)"* [`frameworks/commodity/COMMODITY_PROFILES.md`, §COPPER]. Copper has no growing season, no crop year, and no harvest — it is a mined metal whose balance is set by mine supply, scrap, and industrial demand. There is no monsoon, ENSO-crop, or degree-day lens to apply here, and this orb does not manufacture one.

Two narrow exceptions genuinely exist and are covered below, both scoped as **risk to the balance, not a driver of it**:
- **mild Chinese consumption seasonality** (the Lunar New Year shutdown and the autumn fabricator pick-up); and
- **short-lived physical-operations weather** in the Andes (storms halting individual mines) plus **water availability** in northern Chile.

**Ownership boundary (§8, one fact one owner).** Mine tonnes — output, disruptions, water and permit constraints, TC/RCs — are owned by `commodity-supply` (orb 01). This report flags the weather *risk* and hands the tonnage bridge to that orb. **No tonnage estimate is asserted here and no second vote is cast for the same tonnes.** Trucking-route disruption in the DRC rainy season (roughly Nov–Apr) is likewise a routing question owned by `commodity-supply-security`, noted only so it is not lost.

One lens deliberately **not** applied: the profile assigns hydro-power (Yunnan) to **aluminium**, not copper, and copper smelting is far less power-intensive per tonne than aluminium smelting. There is no copper-specific hydrology-to-smelting lens in this profile, so none is used.

---

## 2. Current weather state (narrow exceptions only — not a driver vote)

| Driver | State vs normal | Push on the balance | Source, date |
|---|---|---|---|
| **ENSO signal (probabilistic, §7)** | **El Niño Advisory.** July Niño-3.4 anomaly **+1.4°C**; synopsis: *"El Niño is strengthening, with a greater than 90% chance of a very strong event during the Northern Hemisphere fall and winter 2026-27"*; **69%** chance the Oct–Dec 2026 season exceeds **+2.5°C** | **Two-sided and unrealised.** Raises the *probability* of heavy Andean rain/flood events in Dec 2026–Mar 2027 (would interrupt mine output → price-positive) while above-normal Chilean precipitation would *ease* the water constraint on concentrators (→ price-negative). Neither is measured. Label: probabilistic outlook, not a settled fact | NOAA CPC ENSO Diagnostic Discussion, issued **2026-08-13** (retrieved 2026-08-28, unvintaged) |
| **Chile austral-winter storms (realised, and closed)** | Severe winter storms hit central Chile in **July 2026**. Antofagasta's **Los Pelambres** ran an orderly shutdown of roughly **five days** and **restarted 23 July 2026**, reporting no injuries and no significant damage to equipment or essential infrastructure; the company **reaffirmed its full-year production guidance**, i.e. no material impact on planned output | **Neutral as of 2026-08-28 — the episode is over and was reversed.** It is a demonstration of the exposure, not a standing constraint. Any residual tonnage question belongs to `commodity-supply` | Antofagasta plc operational update via secondary reporting (Proactive / Yahoo Finance / TipRanks), retrieved **2026-08-28**, unverified |
| **Northern Chile water availability (structural, slow-moving)** | Chile's ~15-year drought is the long-running constraint. **COCHILCO (2024):** desalinated or reused water already meets **~40%** of northern-mining water demand, up from **25% in 2020**, projected above **65% by 2032**. Los Pelambres' ~US$2bn desalination plant has run since March 2024 at 400 litres/second, with a doubling to 800 l/s targeted for 2027 | **Declining sensitivity.** Each point of seawater substitution mechanically cuts how much Chilean copper output depends on continental rainfall — this is the main reason the weather lens is weak for copper and getting weaker. It is a *supply-cost and permitting* fact owned by `commodity-supply`; recorded here only to justify "not a driver" with evidence rather than assertion | COCHILCO 2024 figures via secondary summary (IDRA / mining-technology), retrieved **2026-08-28**, unverified |

**Declined claim.** Secondary web sources circulate a figure of "~1.6 Mt of annual copper capacity simultaneously at suspension risk" from the July 2026 Chilean storms. It is a **tonnage** claim, it is owned by `commodity-supply`, and its only traceable sources are low-quality secondary blogs. It is **not used** and must not be carried forward from this report.

---

## 3. Seasonality / calendar position

**Where we are (2026-08-28).** Copper has no crop calendar, so the only calendar that matters is the Chinese consumption year and the austral weather year.

- **China demand calendar — entering the seasonal upswing.** Chinese fabricator activity (wire, tube, foil) is weighted to construction and typically picks up in the autumn; we sit just before that Q4 restocking window. The next scheduled demand *trough* is the **Lunar New Year shutdown**, which in 2027 falls on **6 February 2027** — plants typically close for one to two weeks and SHFE stocks build across the holiday, as they did around the **17 February 2026** holiday [secondary trade reporting, retrieved 2026-08-28, unverified]. **The amplitude of this pattern is not measured in this run** — no ICSG refined balance, no SMM/SHFE monthly series and no accepted vintage is reachable — so the calendar position is directional context only, not a sized effect.
- **Austral weather calendar — leaving one window, approaching the next.** The central-Chile frontal-storm season (roughly May–Sep) that produced the July 2026 shutdowns is ending. The next weather-sensitive window is the **altiplano / "Bolivian winter" rain-and-snow season, roughly December 2026 – March 2027**, which affects the high-elevation (3,000–4,500 m) northern Chilean and Peruvian operations, together with coastal Peruvian rainfall and landslide risk to access roads and port logistics.
- **The two windows overlap, and that matters.** The forecast **peak of this El Niño (Oct–Dec 2026 onward)** lands on the same Dec–Mar altiplano window as the **6 February 2027 Lunar New Year demand trough**. A weather-driven supply interruption arriving inside a soft-demand fortnight would have a smaller price effect than the same interruption in a restocking month. This is a timing observation, not a forecast.

**Verdict for this lens: not a driver.** Weather and seasonality do not currently push copper in either direction with any measurable force. The honest read is **neutral**, with one dated, probabilistic, unrealised risk (a very strong El Niño into the Dec–Mar Andean window) that this orb flags to `commodity-supply` rather than prices itself.

**What would change this.** A named, dated mine suspension of more than roughly two weeks at a top-10 asset during the Dec 2026–Mar 2027 window, sourced to the operator or to COCHILCO, would move this lens from "not a driver" to a live risk — and even then the tonnage vote stays with `commodity-supply`.
