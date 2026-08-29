# Supply — COPPER

**Decision date:** 2026-08-28. **Unit:** thousand tonnes (kt) of *contained* copper metal unless a row
says "gross concentrate weight". **Owner scope:** gross mine output, scrap/secondary output, domestic
absorption and the pre-policy bridge. Restrictions, sanctions, chokepoints and verified rerouting are
NOT applied here — they belong to `commodity-supply-security` (orb 04).

## 0. Evidence status — read this before any number below

No accepted connector vintage exists in this run. `data/COPPER/` does not exist (no user document
pool), and the pulse transport is dead (`PULSE-MISSING`, EPERM). **Every figure in this report is
UNVINTAGED live-web context.** Under MODULE_RULES §8A it may explain context but cannot raise data
sufficiency or conviction, and none of it satisfies a required semantic series.

Worse, and this is the central finding of the transparency audit in §4: I did not successfully read a
single **primary** document. Every production number below is a *secondary relay* of an ICSG, USGS,
Cochilco, INE or MINEM figure, reported by a trade publication. Direct primary retrievals were
attempted and failed:

| Primary source attempted | URL | Result |
|---|---|---|
| USGS Mineral Commodity Summaries 2026 — Copper | `pubs.usgs.gov/periodicals/mcs2026/mcs2026-copper.pdf` | HTTP 403 |
| USGS MCS 2026 interactive | `apps.usgs.gov/critical-minerals/mineral-commodities-2026.html` | HTTP 403 |
| ICSG Table 1 (world refined production and usage) | `icsg.org/wp-content/uploads/Table1.pdf` | retrieved, binary, unreadable |
| ICSG copper-market-forecast press release | `icsg.org/download/2025-10-press-release-...` | retrieved, binary, unreadable |
| IEA copper-smelter commentary | `iea.org/commentaries/copper-prices-have-hit-record-highs...` | HTTP 403 |
| Ivanhoe Mines news release (producer primary) | `ivanhoemines.com/.../kamoa-kakula-copper-production-guidance-...` | **retrieved and readable**, but superseded (see §2) |

**Required rows I own — inventory per §8A:**

| Need ID | Stable series ID | Status | As-of | Vintage ID | Exact reason unusable |
|---|---|---|---|---|---|
| `copper-mine-prepolicy-supply` | `copper.mine-prepolicy-supply` | **unusable — no_pool** | 2026-08-28 | none | No connector vintage; no `data/COPPER/`. Only unvintaged secondary relays of ICSG/USGS/Cochilco. Monthly origin-level absorption and stock-change data was not obtainable at all, so the bridge in §3 cannot close at origin level. |
| `copper-scrap-supply` | `copper.scrap-supply` | **unusable — no_pool** | 2026-08-28 | none | No connector vintage. Growth rates and a share-of-feedstock figure were relayed, but no absolute secondary tonnage, no grade split, and no numeric scrap-spread assessment were obtained. The profile requires dispersion on estimates; only one assessor (SMM) was reachable, so dispersion is not measurable. |
| `copper-concentrate-tcrc` | `copper.concentrate-tcrc` | **unusable — no_pool** | 2026-08-28 | none | No connector vintage. Benchmark and two spot prints were relayed second-hand from different dates; only one current assessor was reachable, so the profile's required dispersion is not measurable. |

---

## 1. Production Balance

Gross **mine** production (contained copper). "Latest" is the current-year estimate, "Prior" the year
before it, on the same source's basis where possible. All sources are unvintaged relays.

| Region / producer | Latest | Prior | YoY | Source, period |
|---|---|---|---|---|
| **World** | **23,500 kt (2026e)** | **23,450 kt (2025, implied)** | **+0.2%** | [Cochilco 2026 forecast, via Rio Times/SMM relays, 2026-08-11 and 2026-08-13 — UNVINTAGED] |
| World — competing estimate | 23,368 kt (2026e, derived) | 23,000 kt (2025e) | +1.6% | [ICSG April-2026 forecast growth rate via IndexBox relay, 2026-06-30, applied to USGS MCS 2026 world 2025 of 23,000 kt via INN relay, 2026-03-03 — DERIVED, mixed base] |
| Chile | 5,270 kt (2026e) | 5,411 kt (2025, derived from −2.6%) | −2.6% | [Cochilco, 2026 forecast, via Rio Times relay 2026-08-11 — UNVINTAGED] |
| Chile — H1-2026 actual | −6.6% y/y cumulative; Codelco −10% y/y | — | −6.6% | [Cochilco/INE via SMM relay, 2026-08-13 — UNVINTAGED] |
| Chile — June-2026 actual | 447,294 t (month) | — | +5.1% | [Chile INE, June 2026, via relay 2026-08 — UNVINTAGED] |
| Peru | ~2,790 kt (2026e, derived) | 2,700 kt (2025e) | +3.3% | [MINEM Q1-2026 actual 688 kt, +3.3% y/y, via relay; annualised by me — DERIVED. 2025 base: USGS MCS 2026 via INN relay, 2026-03-03] |
| DRC (Congo-Kinshasa) | 2026 country total **not published** in any source read; ICSG revised DRC *down* | 3,200 kt (2025e) | +7.0% in 2025 (from 2,990 kt in 2024) | [USGS MCS 2026 via INN relay, 2026-03-03; ICSG April-2026 forecast via IndexBox relay, 2026-06-30 — UNVINTAGED] |
| Indonesia | 710 kt (2025e) | 1,010 kt (2024) | −29.7% | [USGS MCS 2026 via INN relay, 2026-03-03 — UNVINTAGED] |
| — of which Grasberg | ~454 kt (2026 guidance, = 1.0 billion lb ÷ 2,204.62 lb/t) | ~454 kt (2025, "similar") | ~0% | [Freeport 2026 guidance via mining.com / Fastmarkets relays, 2026 — UNVINTAGED] |
| China (mine only) | 1,800 kt (2025e) | 1,840 kt (2024) | −2.2% | [USGS MCS 2026 via INN relay, 2026-03-03 — UNVINTAGED] |
| Russia | 1,300 kt (2025e) | 1,020 kt (2024) | +27.5% | [USGS MCS 2026 via INN relay, 2026-03-03 — UNVINTAGED] |
| Zambia | 940 kt (2025e) | 823 kt (2024) | +14.2% | [USGS MCS 2026 via INN relay, 2026-03-03 — UNVINTAGED] |

**The composition matters more than the total.** ICSG's Q1-2026 preliminary data splits the flat world
number into two streams moving in opposite directions:

| Mine-supply stream | Q1-2026 y/y | What it feeds |
|---|---|---|
| Copper **concentrates** (needs a smelter) | **−1.1%** | smelters → refined metal; sets treatment charges |
| **SX-EW** cathode (leached on site, never sees a smelter) | **+3.3%** | refined metal directly; relieves nothing for smelters |
| Total mine production | "basically flat" | — |

[ICSG Q1-2026 preliminary, via SMM relay, 2026-05-23 — UNVINTAGED]

**Recycling / secondary supply** (my second family — scrap-based refined metal):

| Measure | Latest | Prior | YoY | Source, period |
|---|---|---|---|---|
| World secondary refined output (from scrap) | Jan–May 2026 | Jan–May 2025 | **+5.6%** | [ICSG via Recycling Today relay, 2026-07 — UNVINTAGED] |
| World secondary refined output, May alone | May-2026 | May-2025 | +5.5% | [ICSG via Recycling Today relay, 2026-07 — UNVINTAGED] |
| Secondary share of world refined output | 17.8% (Jan–May 2026) | 17.3% (Jan–May 2025) | +0.5pp | [ICSG via Recycling Today relay, 2026-07 — UNVINTAGED] |
| World **primary** refined output | Jan–May 2026 | Jan–May 2025 | +2.4% | [ICSG via Recycling Today relay, 2026-07 — UNVINTAGED] |
| China copper-scrap imports | 1,240 kt (H1-2026) | 1,145 kt (H1-2025, derived from +8.3%) | +8.3% | [China customs via SMM relay, 2026 — UNVINTAGED] |
| Scrap share of China refined-copper feedstock | 25.2% (H1-2026) | not sourced | not measurable | [SMM relay, 2026 — UNVINTAGED] |
| Refined-minus-scrap price spread | "narrowed considerably" (June 2026) | not sourced | **no numeric assessment obtained** | [SMM relay, June 2026 — UNVINTAGED] |

**Concentrate treatment and refining charges (TC/RC)** — the fee a smelter earns for turning concentrate
into metal, quoted per dry metric tonne of concentrate. A *negative* TC means the smelter pays the miner
for the concentrate instead of being paid to process it. This is my series, and per the COPPER family
rule it is **not a second vote** for the mine disruptions in §2 — it is the price tag on the same fact.

| TC/RC measure | Level | Source, period |
|---|---|---|
| 2026 annual benchmark | **US$0/t and 0 US¢/lb** — lowest annual benchmark on record | [Antofagasta–Chinese smelter settlement, recorded January 2026, via mining.com / IEA relays — UNVINTAGED] |
| 2025 annual benchmark (comparable) | US$21.25/t | [via Fastmarkets relay, LME Week 2025 — UNVINTAGED] |
| Spot TC, end-June 2026 | **−US$126.80/t** | [via discoveryalert relay of assessor data, 2026-06-30 — UNVINTAGED] |
| Spot TC, 2026-08-21 | **−US$182.14/dmt** | [SMM imported copper-concentrate TC assessment, 2026-08-21, via relay — UNVINTAGED] |
| Dispersion across concurrent assessors | **not measurable** — only one current assessor (SMM) reachable | — |

---

## 2. Direction & Swing Factors

**Direction: total mine tonnes are FLAT (+0.2% to +1.6% for 2026, depending on the source); the
smeltable concentrate stream is FALLING (−1.1% y/y in Q1-2026); scrap-based supply is RISING (+5.6%).**
That three-way split, not the headline total, is the supply story.

- **The world total is being held up by material that does not relieve the concentrate shortage.**
  SX-EW cathode (+3.3% in Q1-2026) is leached and electro-won at the mine and never enters a smelter;
  most DRC growth is of this type. So a flat world mine number coexists with a −1.1% concentrate number,
  and smelters are bidding for feed at a spot treatment charge of −US$182.14/dmt (2026-08-21) against a
  US$0/t 2026 benchmark and US$21.25/t in 2025. [ICSG Q1-2026 via SMM relay 2026-05-23; SMM TC
  assessment 2026-08-21 — both UNVINTAGED]

- **Swing factor 1 — the Chile forecast embeds an H2 recovery that has barely been observed yet.**

  ```
  Attribution: Chile H1-2026 cumulative mine output −6.6% y/y [Cochilco/INE via SMM relay, 2026-08-13]
               × an inferred H1-2025 base of 2,706 kt (= half of the derived FY-2025 total of 5,411 kt;
                 the actual H1-2025 print was NOT sourced — INFERENCE, and the true seasonal split is
                 not 50/50)
    = −179 kt of the −141 kt (−2.6%) full-year 2026 decline that Cochilco forecasts
    → 127% of the full-year decline is already explained by the first half alone; the residual is
      +38 kt (−27%, i.e. the wrong sign). The forecast therefore REQUIRES the second half to run
      +38 kt ABOVE year-ago, a recovery that had one month of evidence when the forecast was made.
  ```

  That one month is June-2026: Chile INE total 447,294 t, **+5.1% y/y**, with Escondida at 111,400 t
  (+45.8% y/y) offsetting Codelco at 114,400 t (−4.8% y/y). [INE / Cochilco June-2026 via Rio Times
  relay, 2026-08-11 — UNVINTAGED]. The falsifier is cheap and dated: **if the July and August INE
  prints come in below year-ago, the 5,270 kt full-year figure is unreachable and Chile's decline is
  worse than −2.6%.** If they come in above year-ago, the forecast holds.

- **Swing factor 2 — Grasberg is running at roughly a third below its pre-incident plan and the
  restart has slipped.** Freeport guides Grasberg 2026 to about 1.0 billion lb of copper (~454 kt),
  "similar to 2025" and about 35% below the pre-incident estimate, after ~800,000 t of wet material
  entered the block cave on 8 September 2025 and force majeure was declared; full restart has been
  pushed out. Indonesia's country total already fell from 1,010 kt (2024) to 710 kt (2025e), −29.7%.
  [Freeport guidance and USGS MCS 2026, both via relays, 2026 — UNVINTAGED]

  **Contradiction I am not averaging away:** two relays size the 2026 Grasberg shortfall differently.
  One states a loss of ~270 kt in 2026; the other states 2026 output is ~35% below plan, which on a
  454 kt actual implies a pre-incident plan of 698 kt and a loss of **244 kt**. The 26 kt gap
  (~11%) is unresolved because neither primary document was readable. I carry the smaller,
  conservative figure (−244 kt) where a single number is needed (§4 conservative default).

- **Third factor, smaller but real — DRC's flagship mine was cut twice.** Kamoa-Kakula 2026 guidance
  is now **290–310 kt**, against **380–420 kt** guided in the primary release I *was* able to read
  directly [Ivanhoe Mines news release, 2025-12-03 — retrieved primary, now SUPERSEDED]. Midpoint to
  midpoint that is **−100 kt**. H1-2026 actual was ~135.7 kt (Q2 64,328 t), after a May-2025 seismic
  event and nine lost mining days at Kakula plus seven at Kamoa in Q2-2026 from industrial action.
  [Ivanhoe via Ecofin / SMM / MiningWeekly relays, 2026-05 to 2026-08 — UNVINTAGED]

- **The offsetting fact, stated separately rather than netted:** ICSG's Q1-2026 data shows China and
  the DRC — together 60% of world mine production — raised combined output **+9%** y/y, while the rest
  of the world **fell 1.4%**. Concentration of growth into two origins is itself a supply-security
  question (handed to orb 04, not scored here), but the tonnes are real and they are why the world
  total is flat rather than down. [ICSG Q1-2026 via SMM relay, 2026-05-23 — UNVINTAGED]

- **Scrap is the quiet swing factor and it cuts the other way.** Secondary refined output grew +5.6%
  in Jan–May 2026 against +2.4% for primary, lifting scrap's share of world refined output from 17.3%
  to 17.8%. In China, scrap reached 25.2% of refined-copper feedstock in H1-2026 as concentrate
  tightened and treatment charges went negative — i.e. smelters substituted toward scrap precisely
  because concentrate became unaffordable. India's May-2026 output rose ~30% y/y on the Adani Mundra
  refinery ramp. [ICSG / SMM via Recycling Today relays, 2026-07 — UNVINTAGED]

  **The constraint on that substitution, emitted as its own opposing fact:** the refined-minus-scrap
  price spread "narrowed considerably" in June 2026, which mechanically reduces the incentive to feed
  scrap. **No numeric spread was obtained**, so this is direction only and I will not size it.
  [SMM relay, June 2026 — UNVINTAGED]

**Attribution I refuse to complete, and why:**

```
Attribution: world concentrate mine output Q1-2026 −1.1% y/y [ICSG via SMM relay, 2026-05-23]
             against China refined output +7.4% y/y Jan–Apr 2026 [China NBS via relay, 2026]
  = an ~8.5 percentage-point gap between concentrate feed and the smelting capacity drawing on it,
    but NO elasticity of spot TC to a 1pp feed gap was sourced, on any basis
  → 0% of the −US$182.14/dmt spot TC level is arithmetically attributed here; 100% residual.
    The feed gap is the obvious candidate cause and it is NOT proven by anything in this report.
```

The residual is the finding: the negative treatment charge is consistent with the concentrate
shortfall, it is not measured against it.

---

## 3. Gross-to-Pre-Policy Exportable Bridge

kt of contained copper, 2026 estimate unless noted. "n/s" = not sourced. **No restriction, sanction,
export-control or rerouting adjustment is applied in this table** — those are orb 04's and applying
them here would double-count the tonnes.

| Origin | Gross production | + recycling/releases | + net external transfer (eliminate globally) | − domestic absorption | − stock build | Pre-policy exportable supply | Residual/gap | Source/period |
|---|---:|---:|---:|---:|---:|---:|---|---|
| Chile | 5,270 | n/s | ~0 (negligible concentrate imports — INFERENCE) | n/s | n/s | **not computable** | Residual = Chile's own smelter/refinery intake, unquantified. It is the whole difference between production and exports, so the exportable figure cannot be stated at all. Partial anchor: China imported 4,280.8 kt *gross concentrate weight* from Chile in H1-2026, −7.9% y/y (≈1,070 kt contained at an ASSUMED 25% grade — grade NOT sourced, INFERENCE) | [Cochilco 2026 forecast via relay 2026-08-11; China customs via SMM relay 2026-08-13 — UNVINTAGED] |
| Peru | ~2,790 (derived) | n/s | ~0 (INFERENCE) | n/s | n/s | **not computable** | Residual = Ilo/Southern Peru smelter intake, unquantified. Gross production itself is derived from one quarter (Q1 688 kt, +3.3%) annualised on the 2025 quarterly share | [MINEM Q1-2026 via relay; USGS 2025 base via INN relay 2026-03-03 — UNVINTAGED] |
| DRC | **2026 country total not published in any source read**; 2025 = 3,200 | n/s | ~0 (INFERENCE) | small (INFERENCE: little domestic fabrication) | n/s | **not computable** | Residual = the entire 2026 country number. Only movable piece sized: Kamoa-Kakula 290–310 kt vs 380–420 kt previously guided = −100 kt at midpoint. Most DRC output is SX-EW cathode, already refined, so it does not relieve smelters | [USGS 2025 via INN relay 2026-03-03; Ivanhoe releases/relays 2025-12-03 and 2026 — UNVINTAGED] |
| Indonesia | ~454 (Grasberg only; country total 710 in 2025) | n/s | ~0 | rising — domestic smelters commissioned, tonnage n/s | n/s | **not computable** | Residual = country total ex-Grasberg, plus domestic smelter intake. The *policy* driving domestic smelting is handed to orb 04; only the physical absorption would belong here and it is unquantified | [Freeport 2026 guidance via relays; USGS 2025 via INN relay — UNVINTAGED] |
| China | 1,800 (2025, mine only) | large, inside secondary refined below | **LARGE POSITIVE — ~14,610 kt gross concentrate weight imported in H1-2026 (derived: Chile 4,280.8 kt ÷ 29.3% share) + 1,240 kt scrap. ELIMINATED on world consolidation** | very large — refined output ~1,270 kt in July-2026 alone, second-highest month ever; +7.4% y/y Jan–Apr | n/s | **none — net importer** | China is the elimination case for §9. Its concentrate and scrap imports are Chilean, Peruvian and other origins' tonnes **already counted at origin**; they are transfers, not new world supply, and a unit does not re-enter world supply because it was traded | [China NBS / customs / SMM relays, 2026 — UNVINTAGED] |
| **WORLD (consolidated)** | **23,500** | **+5,101** (secondary refined from scrap; derived = 17.8% × world refined 2026e 28,656) | **0 by construction** — all inter-origin trade cancels | **−28,560** (world refined usage 2026e, derived) — **CROSS-REFERENCE ONLY, owned by `commodity-demand-inventory`; this is not a supply vote** | n/s for the full year. Exchange inventories rose >400 kt (+54%) in Jan–May 2026 | **+41 before stock build (derived)** | **Residual −55 kt (−0.2% of the 28,601 kt of gross world availability)** against ICSG's own stated 2026 surplus of +96 kt. The residual is small, which is a consistency check on the derivation chain, not a confirmation of the balance | [Cochilco 2026-08-11; ICSG April-2026 forecast via IndexBox relay 2026-06-30; ICSG Jan–May 2026 via Recycling Today relay 2026-07 — all UNVINTAGED] |

**How the world row was built (§15 — a total travels with its build):**

- World refined **usage** 2026e = 28,560 kt. Derived: ICSG (Oct-2025) put 2026 usage at 28.7 Mt on
  +2.1% growth → a 2025 base of 28,110 kt; ICSG (April-2026) cut 2026 growth to +1.6% → 28,110 × 1.016
  = 28,560 kt.
- World refined **production** 2026e = 28,560 + the ICSG 2026 surplus of 96 kt = **28,656 kt**.
- **Secondary** refined = 17.8% × 28,656 = **5,101 kt**; **primary** refined = 23,555 kt.
- Sanity check the bridge must pass: primary refined 23,555 kt against mine production 23,500 kt.
  These are nearly equal, as they should be — ICSG counts SX-EW cathode in *both* mine and primary
  refined production. **Do not read the near-equality as two independent sources agreeing; it is one
  quantity appearing twice.**
- Gross world availability = 23,500 (mine) + 5,101 (scrap-based) = **28,601 kt**, against derived
  refined production of 28,656 kt → **−55 kt residual**, 0.2%, inside the rounding of my own chain.
- **Not in this bridge, and unquantified:** direct-melt scrap — scrap remelted straight into products
  without passing through a refinery. It never enters the refined balance, so world *metal* supply is
  understated by an amount no source I reached puts a number on.

---

## 4. Supply Transparency Audit

These three numbers are passed to `scripts/commodity_analytical_contracts.py`. Arithmetic and dates
are shown so each can be checked.

- **Primary coverage: 0.0%** = 0 kt of current primary-source-observed production ÷ 23,500 kt world
  production.
  - *Numerator audit trail:* every production figure in §1–§3 is a secondary relay (Rio Times, SMM /
    metal.com, Recycling Today, INN, mining.com, Fastmarkets, Ecofin, IndexBox, MiningWeekly) of an
    ICSG, USGS, Cochilco, INE, MINEM, NBS or producer figure. Five direct primary retrievals failed
    (two HTTP 403, three unreadable binary PDFs) — see §0 for the URLs and results.
  - One primary retrieval **succeeded**: Ivanhoe Mines' own news release of 2025-12-03. It is excluded
    from the numerator because it is (a) superseded — its 380–420 kt 2026 guidance has since been cut
    to 290–310 kt — and (b) carries no current-period actuals. A superseded release is not a *current*
    primary observation, and Kamoa-Kakula at ~300 kt would in any case be 1.3% of world production.
  - **0.0% is below the 70% threshold, so supply opacity is HIGH and the supply-demand directional-
    conviction score is capped at 45.** That cap is driven by coverage alone; the other two inputs
    below do not trip.
- **Estimate dispersion: 0.56%** = (23,500 − 23,368) ÷ 23,434 × 100, for the world **2026** gross
  mine total.
  - max = 23,500 kt [Cochilco 2026 forecast, 2026-08-11]; min = 23,368 kt [derived: USGS MCS 2026
    world 2025 of 23,000 kt × ICSG's April-2026 growth rate of +1.6%]; median of n=2 = 23,434 kt.
  - **This figure understates real disagreement and must not be read as agreement.** The two estimates
    are not independent — both anchor on a ~23 Mt base (§16: convergence between non-independent
    reads is a coincidence to explain, not a signal). Two matched-basis alternatives, printed so the
    synthesis can choose:
    - On the world **2025 level**, two official sources state 23,000 kt [USGS MCS 2026] and 23,450 kt
      [Cochilco-implied, = 5,270 ÷ 0.974 scaling logic applied to their 2026 = 2025 × 1.002] →
      (23,450 − 23,000) ÷ 23,225 × 100 = **1.93%**.
    - On the 2026 **growth rate**, ICSG says +1.6% and Cochilco says +0.2% — a 1.4 percentage-point
      gap, an 8× relative spread on the quantity that actually decides direction.
  - None of the three (0.56% / 1.93% / the growth-rate gap expressed on the total) reaches the 15%
    dispersion threshold, so dispersion does not independently trigger the cap.
- **Release cycles late: 1.**
  - Balance-critical series: ICSG Monthly Copper Bulletin, cadence **monthly**, roughly a two-month
    publication lag. `icsg.org` (fetched 2026-08-28) lists "Monthly Copper Bulletin — August 2026" as
    released, so on a 2026-08-28 decision date the expected data month is **June 2026**. The latest
    data month evidenced anywhere I could read is **May 2026** (the Jan–May balance, relayed in July
    2026). May vs June = **1 cycle**.
  - The provider itself is on time; the lateness is in *accessible* content — the August bulletin's
    figures sit behind an unreadable/paid PDF. Reported as 1 on the conservative default (§4).
  - Other series, on cadence, 0 cycles late: Cochilco (forecast update 2026-08-11), Chile INE (June
    2026 data published by 2026-08), USGS MCS 2026 (published February 2026), MINEM (quarterly data
    relayed for Q1-2026 — but note I hold nothing newer than March for Peru, which is a hole in *my*
    coverage, not proof the provider is late).
  - 1 cycle is below the >2 threshold, so lateness does not independently trigger the cap.

**Opacity verdict: HIGH, on primary coverage of 0.0%. Score cap 45.** This is a
directional-conviction cap: it says the evidence behind whichever direction the synthesis picks is
weak. It does not mean supply is tight, loose, or anything else.

---

## 5. Gaps / low-confidence items

1. **Zero primary evidence.** Not one primary statistical or exchange document was read. Everything is
   a trade-press relay of one. Under §8A none of it lifts sufficiency. This alone should push the
   run's supply read toward `Research More`.
2. **All three required series I own are unusable** — `copper.mine-prepolicy-supply`,
   `copper.scrap-supply`, `copper.concentrate-tcrc`. Per §8A this makes both horizons
   `not_assessable` on my inputs. **Data need emitted:** a lawful ICSG monthly-bulletin route (or a
   licensed equivalent) is the single highest-value fix — it would supply the monthly mine/refined
   bridge, the secondary-production split, and the revision history in one series.
3. **The origin-level bridge does not close for any origin.** Domestic absorption — the smelter and
   refinery intake that separates what a country digs from what it can ship — was not sourced for
   Chile, Peru, DRC or Indonesia. Every "pre-policy exportable supply" cell in §3 is therefore
   *not computable*, not zero. The world row closes only because absorption at world level is refined
   usage, which I borrowed from the demand orb as a cross-reference.
4. **The DRC 2026 country total does not exist in anything I read.** DRC is ~14% of world supply and
   its 2026 number is missing outright; only one mine (Kamoa-Kakula) could be sized.
5. **Peru's 2026 figure is one quarter annualised.** 688 kt of Q1 actual scaled by the 2025 quarterly
   share. If Peru's H2 differs seasonally from 2025, the ~2,790 kt is wrong by an amount I cannot bound.
6. **Chile's H1 attribution rests on an inferred 50/50 seasonal split.** The actual H1-2025 tonnage was
   not sourced. The direction of the finding (the full-year forecast needs an H2 recovery) survives a
   fairly wide error on that split, but the 127%/−27% figures do not.
7. **The Grasberg 2026 shortfall is contested** — ~270 kt in one relay versus ~244 kt implied by the
   "35% below plan" statement in another. Carried at 244 kt (conservative).
8. **Scrap-spread is direction-only.** No numeric refined-minus-scrap spread, no grade split, no
   geography split, and no second assessor. The profile requires dispersion on scrap estimates and it
   is not measurable with one source.
9. **TC/RC dispersion is not measurable.** One current assessor (SMM, −US$182.14/dmt, 2026-08-21). The
   end-June −US$126.80/t print is a different date, so the two form a trend, not a dispersion.
10. **Direct-melt scrap is entirely absent** from the world bridge. It is real metal supply that never
    touches a refinery, and no source I reached sizes it.
11. **Grade assumption flagged:** the Chile→China concentrate figure is *gross concentrate weight*
    (4,280.8 kt). Converting to ~1,070 kt contained used an assumed 25% copper grade that no source
    provided. Do not use the contained figure as evidence; it is illustrative only.
12. **Handed off, not applied here (§9):** Indonesia's domestic-smelting and export rules, any US
    tariff or trade measure affecting where copper is delivered, Russian metal's market access, and
    DRC/Zambia export logistics. Those adjustments belong to `commodity-supply-security`. The tonnes
    in §1 and §3 above are pre-policy and must not be reduced twice.
