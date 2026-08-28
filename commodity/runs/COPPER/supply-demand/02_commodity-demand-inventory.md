# Demand & Inventory — COPPER

**Run date:** 2026-08-28 · **Run root:** `commodity/runs/COPPER/` · **Orb:** `commodity-demand-inventory` (dossier points 4 and 5)
**Profile read:** `frameworks/commodity/COMMODITY_PROFILES.md` §`## COPPER` (lines 318–389) · **Rules:** `.claude/agents/commodity/MODULE_RULES.md` §§2–4a, 8, 8A, 9 and root `CLAUDE.md`.

> **Evidence status, stated before any number is read (MODULE_RULES §8A).** All four required semantic
> series this orb owns — `copper.visible-inventory`, `copper.inventory-accessibility-opacity`,
> `copper.refined-balance`, `copper.energy-transition-demand` — are **unusable**. No accepted connector
> vintage exists anywhere in this run (0 of 22 required rows usable, per `00_commodity-triage.md`), and
> the swarm pulse transport is dead (`PULSE-MISSING`, EPERM). **Every figure below is unvintaged live-web
> context, labelled with its source and as-of date.** Under §8A it may explain the situation but it
> **cannot raise sufficiency or conviction**, and it does not fill a coverage row. Nothing here is
> report-derived or WILTW-derived; those are forbidden as runtime evidence.
>
> A second, separate warning specific to this orb: almost every ICSG figure reachable in this environment
> is **secondary reporting of ICSG**, not the ICSG release itself. Where the secondary reports disagree
> with each other, §3 requires me to name the disagreement rather than average it — see §1.4 below, where
> the headline 2026 balance fails to reconcile with its own reported components by 221 kt.

---

## 1. Demand

### 1.1 The table

Levels marked *(derived)* are my own arithmetic — ICSG 2024 actual levels compounded by reported growth
rates — and are **inference, not a filed ICSG level**. Growth rates are as reported.

| Segment | Latest | Prior | YoY | Source, period |
|---|---|---|---|---|
| **World refined usage — level** | ~28.67 Mt (2026F, *derived*) | ~28.22 Mt (2025E, *derived*) | **+1.6%** (ICSG forecast) | [ICSG 2026/2027 forecast via IndexBox, pub. 2026-06-30 — unvintaged]; base 27.4 Mt (2024 actual) [ICSG World Copper Factbook 2025, data year 2024 — unvintaged] |
| World refined usage — **realised, Q1-2026** | **+0.8% y/y** (apparent usage) | Q1-2025 | **+0.8%** | [ICSG Q1-2026 preliminary via SMM, pub. 2026-05-23 — unvintaged] |
| **China** (~58% of world usage, 2024) | +1.9% (2026F) | — | +1.9% | [ICSG forecast via IndexBox, 2026-06-30]; 58% share [ICSG Factbook 2025, data year 2024] |
| China — **realised, Q1-2026**, apparent demand **ex bonded/unreported stock change** | **"basically flat"** (~0%) | Q1-2025 | ~0% | [ICSG Q1-2026 preliminary via SMM, 2026-05-23 — unvintaged] |
| China — realised, **Jan–Apr 2026** apparent demand | **+2.4%** | Jan–Apr 2025 | +2.4% | [ICSG data via Crux Investor summary, accessed 2026-08-28 — unvintaged, secondary] |
| China — refined **production**, Jan–Apr 2026 (context; supply is not my row) | +7.4% | — | +7.4% | [ICSG data via Crux Investor summary, 2026-08-28 — unvintaged] |
| China — net refined **imports**, Jan–Apr 2026 | **−25%** | — | −25% | [ICSG data via Crux Investor summary, 2026-08-28 — unvintaged] |
| **Rest of world** (~42% of usage) | +1.3% (2026F) | — | +1.3% | [ICSG forecast via IndexBox, 2026-06-30 — unvintaged] |
| World refined usage — 2027F | +2.0% | +1.6% (2026F) | — | [ICSG forecast via IndexBox, 2026-06-30 — unvintaged] |
| **Energy-transition end-use** (grid / EV / renewables) — the bridge | **NOT ASSESSABLE** | — | — | Required row `copper.energy-transition-demand` unusable; no primary deployment × intensity data reachable. See §1.5 |
| **Official / state-sector stockpiling** (China SRB, US strategic stockpile) | **Unquantified** | — | — | Tonnages are confidential or estimate-only. See §1.6 |

**Segment sum-check (SELF-CHECK: do the segments sum sensibly?).** China 58% × 1.9% = 1.10pp; rest of
world 42% × 1.3% = 0.55pp; **total 1.65%** against the reported world figure of **1.6%**. The parts
reconcile to the whole within rounding. This is the one place in this report where the ICSG-sourced
numbers are internally consistent.

### 1.2 What the demand side actually says

The demand picture is **weak and getting weaker, and the weakness is concentrated in China**:

- The forecast was **cut**: world usage growth for 2026 went from **+2.1% to +1.6%** [ICSG, via IndexBox
  2026-06-30 vs the ICSG Oct-2025 forecast reported by Mining Weekly, 2025-10-08 — both unvintaged].
- The realised print is **worse than the cut forecast**: Q1-2026 apparent usage grew **+0.8%** — half the
  full-year rate ICSG is carrying [ICSG Q1-2026 via SMM, 2026-05-23]. For the full year to land at +1.6%,
  the remaining nine months must run at roughly **+1.9%** (arithmetic: (1.6 × 12 − 0.8 × 3) / 9 = 1.87%),
  i.e. more than twice the realised Q1 rate. That is the falsifiable bar, and it is not a low one.
- **China's contribution is the swing factor and it is contested by ICSG's own two prints.** Q1-2026
  China apparent demand *excluding* bonded/unreported stock change was "basically flat"; Jan–Apr-2026
  China apparent demand was +2.4%. Those are different windows and different definitions (the bonded
  adjustment is exactly the difference), so they are not a straight contradiction — but they cannot both
  be used, and I am emitting them as two linked, opposing signal rows rather than netting them.

**The two biggest demand swing factors:**

1. **China's real (not apparent) offtake.** China is ~58% of world usage and the entire forecast hinges
   on its +1.9%. "Apparent demand" = production + net imports − reported stock change; it silently
   absorbs any bonded-warehouse or unreported inventory move, which for China is large and unmeasured.
   The profile's binding family rule is explicit: **China activity is a demand input, not proof of copper
   demand without a primary end-use or refined-balance series.** I hold neither with an accepted vintage,
   so I cannot convert China's numbers into a demand verdict.
2. **US tariff-driven restocking, which is inventory relocation, not consumption.** US refined imports
   roughly doubled and ~500 kt was shipped into US warehouses ahead of a possible cathode duty
   [trade-press summaries of Section 232 status, accessed 2026-08-28 — unvintaged, secondary]. This
   inflates apparent US demand while consuming nothing. It is the single largest source of contamination
   in the 2026 demand series, and it is why the **location** of inventory (§2.3) matters more this year
   than the total.

### 1.3 The refined balance — what it is reported to be

| Vintage of the estimate | 2025 | 2026 | 2027 | Source |
|---|---|---|---|---|
| ICSG Oct-2025 forecast | **+178 kt surplus** | **−150 kt deficit** | — | [ICSG forecast, 2025-10-08, via Mining Weekly / SMM — unvintaged] |
| ICSG 2026 forecast (as reported end-June 2026) | — | **+96 kt surplus** | **+377 kt surplus** | [ICSG via IndexBox, pub. 2026-06-30 — unvintaged] |
| ICSG realised, Q1-2026 preliminary | — | **+396 kt surplus in Q1 alone** (386 kt seasonally adjusted for Chinese bonded stock change); Q1-2025 was +135 kt | — | [ICSG Q1-2026 preliminary via SMM, pub. 2026-05-23 — unvintaged] |
| Vendor, for contrast (tier 5, dated, labelled) | — | ~+490 kt global surplus (April view) revised to a **−640 kt deficit *outside the US*** (June view) | — | [Goldman Sachs view via trade-press summary, accessed 2026-08-28 — unvintaged vendor estimate, not an official balance] |

Two things follow immediately, and both are arithmetic rather than opinion:

- **Q1 alone (+396 kt) is four times the full-year forecast (+96 kt).** Taken together they imply
  **96 − 396 = −300 kt** for April–December 2026: a **300 kt deficit over nine months (≈ −33 kt/month)
  after a Q1 that ran a +132 kt/month surplus**. That is a ~165 kt/month swing in the balance. It may
  happen — the tariff pull into the US is exactly the mechanism that would do it — but it is a heroic
  requirement, and it is the cleanest falsifier this orb can hand downstream. **Caveat that limits how
  hard this can be pushed:** I could not establish from any reachable source whether the +96 kt forecast
  was struck *before or after* the Q1 print (the ICSG forecast-meeting date is not stated in the
  secondary reports; the article carrying it was published 2026-06-30, after the 2026-05-23 Q1 release).
  If the forecast predates the Q1 data, the −300 kt implication is an artefact of mixing vintages, not a
  finding. I record the ambiguity rather than pick the reading that makes the point sharper.
- **The +96 kt headline does not reconcile with its own reported components.** See §1.4.

### 1.4 Driver attribution (MODULE_RULES §4a — arithmetic printed, residual named)

**(a) What drove the 246 kt swing in the 2026 balance forecast?**

```
Attribution: ICSG 2026 world refined USAGE growth cut −0.5pp (2.1% → 1.6%)
  × a 2025 usage base of ~28.22 Mt — APPARENT-USAGE basis (ICSG's own definition, which
  absorbs Chinese bonded/unreported stock change) [ICSG forecast via IndexBox, 2026-06-30]
  = +141 kt to the balance, of the +246 kt swing observed (−150 kt deficit → +96 kt surplus)
  → 57% explained, 43% residual (unattributed).
```

The 43% residual is the reported lift in **secondary (scrap-based) refined output**, given only as growth
rates (+6% forecast for 2026; +5.6% y/y realised in the first five months) and never converted into
tonnes by any source reachable here [ICSG via Recycling Today, accessed 2026-08-28 — unvintaged]. So the
demand cut **accounts for most of** the revision — the printed 57% clears the ~50% bar §4a sets for that
adjective — but a meaningful minority of the swing is a supply-side effect I cannot size, and scrap
supply is `commodity-supply`'s row, not mine.

**(b) Does the reported balance reconcile with the reported growth rates? No — by 221 kt.**

```
Attribution: ICSG 2026 refined PRODUCTION growth +0.4% and USAGE growth +1.6%
  × 2025 base levels of ~28.44 Mt production and ~28.22 Mt usage — my own arithmetic,
  compounding ICSG 2024 actuals (27.5 Mt production / 27.4 Mt usage) by the reported
  2025 growth rates (+3.4% / +3.0%) [ICSG Factbook 2025 + ICSG forecast via IndexBox, 2026-06-30]
  = an implied 2026 balance of 28.55 − 28.67 = −125 kt, a DEFICIT
  → 0% explained. The implied −125 kt and the reported +96 kt headline disagree by 221 kt and
    cannot both be right. Method check: the same arithmetic on 2025 gives +213 kt against ICSG's
    reported +178 kt — a 35 kt gap, i.e. the method itself is sound to within rounding of the base
    levels, so the 221 kt gap in 2026 is a real inconsistency in the reported figures, not my method.
```

**This is why `copper.refined-balance` is marked unusable rather than carried at +96 kt.** Under §5 I may
only cite a number the source actually supports; here two numbers from the same reported release
contradict each other by more than twice the headline itself. Either the +0.4% production growth or the
+96 kt balance is misreported in the secondary chain, and I cannot tell which without the primary ICSG
release. The conservative reading (§4) is that **the 2026 balance direction is not established** — and
note that the two candidate readings point in *opposite directions* (a +96 kt surplus vs a −125 kt
deficit), so this is not a question of magnitude.

**(c) Is the reported surplus actually showing up in inventory?**

```
Attribution: ICSG world refined surplus Q1-2026 +396 kt × 1.0 (a surplus must accrue
  one-for-one into stock somewhere) — 3-MONTH FLOW basis [ICSG Q1-2026 via SMM, 2026-05-23]
  = +396 kt of the +401 kt three-exchange visible stock build from end-2025 to end-May-2026 observed
  → PERIOD MISMATCH (§15 matched basis): a 3-month flow set against a 5-month stock change.
    At face value 99%; on a matched basis the April–May surplus is not sourced, so the true
    share is UNKNOWN. What the arithmetic does establish is that the visible build is the same
    order of magnitude as the reported surplus — so the surplus is landing in VISIBLE exchange
    stocks, not disappearing into unmeasured inventory. That is a genuine, if coarse, finding.
```

### 1.5 Energy-transition demand — the required row, and why it is empty

`copper.energy-transition-demand` requires a **grid + EV + renewable copper demand bridge built from
primary deployment and intensity data**, and the profile explicitly forbids double-counting it inside the
refined balance. What is reachable here is **not that**:

- Intensity ratios only, from promotional and secondary sources: an EV uses ~3–4× the copper of a
  combustion car; renewables need ~2.5–7× more copper than fossil generation depending on onshore vs
  offshore wind [trade/asset-manager summaries citing IEA, accessed 2026-08-28 — unvintaged, secondary].
- **Scenario projections, not current demand:** clean-energy uses reaching ~50–61% of copper demand by
  **2040** under more ambitious IEA scenarios [IEA critical-minerals material via secondary summaries,
  accessed 2026-08-28 — unvintaged]. A 2040 scenario share is not a 2026 consumption figure and cannot be
  put in the demand table.
- **No primary deployment volumes** (GW of grid/solar/wind commissioned, EV units built) × **no primary
  intensity coefficients** (tonnes of copper per GW, per vehicle) were obtainable. Without both legs there
  is no bridge, only an adjective.

**Double-counting rule honoured:** ICSG's world refined usage (~28.67 Mt derived for 2026) **already
contains** every tonne of grid, EV and renewable copper. Any energy-transition tonnage, if it existed
here, would be a *decomposition* of that number, never an addition to it. Nothing in §1.1 is grossed up
for electrification.

**The honest read:** the structural electrification bid is the profile's stated strategic thesis for
copper, and this orb **cannot currently measure it at all**. That is a first-order gap, not a footnote —
it means the strategic horizon has no quantified demand driver from this orb.

### 1.6 Official / state-sector activity

For a monetary metal this family would be central-bank buying. Copper's analogue is **state strategic
stockpiling**, and it is almost entirely opaque:

- **China.** The China Nonferrous Metals Industry Association publicly called for **more** copper in
  national strategic stockpiles and for state-owned producers to build commercial inventories, after a
  price rally in early February 2026 [Bloomberg headline via search summary, 2026-02-03 — unvintaged,
  headline-level only]. Copper (with cobalt, nickel, lithium) is named in state reserve expansion plans.
  **But: SRB purchase timing and tonnage are treated as confidential and are not published.** No tonnage
  can be cited, and inferring one would violate §9's ban on assuming hidden stocks.
- **United States.** One secondary source estimates the US strategic copper stockpile has passed
  **1 million tonnes**, "the largest national reserve outside China" [trade-press summary, accessed
  2026-08-28 — unvintaged, secondary]. **I treat this as unreliable and emit it as a contradicting row.**
  A 1 Mt "US stockpile" sits uncomfortably close to the ~676 kt already counted in COMEX warehouses plus
  private trader inventory; the source does not define whether it means a government reserve, exchange
  stocks, or all US-located metal. Read as a *government* reserve it is new demand; read as *all US
  metal* it double-counts §2's visible stocks. **Under §4's conservative default I do not treat it as
  incremental demand.**

**Net:** official-sector activity is directionally a demand *support* for copper, but it is **unquantified
in tonnes from every source reachable here** and cannot carry weight in either horizon.

---

## 2. Inventory / Buffer

### 2.1 The buffer, decomposed by warrant status — never as one total

**The binding COPPER family rule:** *never add exchange stocks without separating on-warrant,
cancelled-warrant and bonded/off-exchange material; align grade, warehouse eligibility, currency, unit
and timestamp before comparing LME, COMEX and SHFE.* Accordingly the table below is a **decomposition**,
and the totals row carries its own health warnings.

Unit conversion used throughout: **1 short ton = 0.90718474 tonnes** (COMEX reports short tons; LME and
SHFE report tonnes). Grade caveat: COMEX Grade 1 and LME Grade A run **different brand/eligibility
lists**, and SHFE stocks sit inside a separate VAT/bonded regime — these are *not* fungible tonnes, and
adding them is an approximation I am labelling as such rather than a true global inventory.

| Measure | Latest | Trend | Tight vs history? | Source, date |
|---|---|---|---|---|
| **LME — total stock** | **235.6 kt** | **−10.2% over 30 days**; off a 2026 peak of 402.6 kt; **+77 kt over 12 months** | **NO — 46th percentile of the 19-year record.** Mid-range, not tight. Drain *rate* is extreme (among the fastest ~18-week draws since 2008, bottom 6%) but the *level* is ordinary | [thevaultreport LME copper daily warehouse report, 2026-08-27 — unvintaged, secondary] |
| LME — **cancelled warrants** (earmarked to exit) | **121.4 kt = 50.52% of total** (total then ~240.3 kt) | +73.45% in a single day on 2026-08-21; cancelled ratio +21.19pp | Extreme. Half the LME stock is spoken for | [SMM LME warrant commentary, 2026-08-21 — unvintaged] |
| **LME — on-warrant / available** (the genuinely deliverable slice) | **107.05 kt** | **−35.8% in one week** (from 166.775 kt on 2026-08-20) | **YES — tight.** No percentile is available for this sub-series, so I place it by change, not by rank | [Reuters via Business Recorder, Thursday 2026-08-27 — unvintaged, secondary] |
| **COMEX — registered + eligible (total)** | **745,277 short tons = 676.1 kt** | Rising; +5.7% over the 30 days to 2026-08-03 | **NO — reported at/near record.** Built from ~80 kt to ~650 kt during the tariff front-run | [thevaultreport / CME-derived, 2026-08-25 — unvintaged, secondary] |
| COMEX — **registered** (warranted, deliverable) | **458.0 k st = 415.5 kt** (63.7% of total) | Rising | Ample | [thevaultreport COMEX copper, **2026-08-03** — unvintaged; note the 22-day staleness vs the total above] |
| COMEX — **eligible** (in an approved vault, **not** warranted) | **260.8 k st = 236.6 kt** | Rising | — | [thevaultreport COMEX copper, 2026-08-03 — unvintaged] |
| **SHFE — warrant stock** | **56.7 kt** | Falling (58.121 kt on 2026-08-18 → 56.698 kt on 2026-08-19) | Low, but not placed against history — no percentile sourced | [CEIC/SHFE daily warrant report, 2026-08-19 — unvintaged] |
| SHFE — weekly warehouse stock (a **different** measure) | 70.1 kt (week 32, mid-Aug 2026) | — | — | [SMM/MacroMicro SHFE weekly series, week 32 2026 — unvintaged]. **Dispersion of ~13.4 kt (24%) against the warrant figure — two different definitions, not a reconciliation** |
| China **bonded-zone** stocks | **NOT MEASURED** | — | — | Required row `copper.inventory-accessibility-opacity` unusable. Reachable SMM bonded articles could not be pinned to 2026 with confidence and are excluded. **Not assumed to be zero** (§9) |
| LME **off-warrant** stocks | **NOT MEASURED** | — | — | Same row; no LME off-warrant report obtained. **Not assumed to be zero** |
| **Combined three-exchange visible total** *(approximation — see caveats)* | **~968.4 kt** | **+30.1% vs end-2025** (744.1 kt); **−15.4% vs end-May-2026** (1,145.0 kt) | **NO — comfortable and rebuilt.** Still ~30% above where the year started | LME 2026-08-27 + COMEX 2026-08-25 + SHFE warrant 2026-08-19; end-May and end-2025 from [ICSG-linked summary, accessed 2026-08-28 — unvintaged]. **Timestamps span 8 days; grades and eligibility regimes differ** |

### 2.2 The buffer expressed as cover — the decision-relevant number

Denominator: world refined usage **~28.67 Mt for 2026** (*derived*: 27.4 Mt 2024 actual × 1.03 × 1.016) →
**551.4 kt per week / 78.6 kt per day**. The denominator is derived from a forecast growth rate, so it
carries the same unvintaged label as everything else; a ±1pp error in usage growth moves these cover
figures by ~1%, which does not change any of the conclusions below.

| Slice of the buffer | Tonnes | Stocks-to-use (annual) | Days of world consumption |
|---|---:|---:|---:|
| **All visible three-exchange stock** | 968.4 kt | **3.38%** | **12.3 days** |
| **On-warrant / deliverable only** (LME 107.05 + COMEX registered 415.5 + SHFE warrant 56.7) | 579.3 kt | **2.02%** | **7.4 days** |
| **Ex-US** (LME total + SHFE warrant) | 292.3 kt | **1.02%** | **3.7 days** |
| LME total alone (the global benchmark's own buffer) | 235.6 kt | 0.82% | 3.0 days |
| **LME on-warrant alone** | 107.05 kt | 0.37% | **1.4 days** |

The on-warrant row mixes a 2026-08-03 COMEX registered figure with 2026-08-27 LME and 2026-08-19 SHFE
figures. Applying the 63.7% registered ratio to the fresher 2026-08-25 COMEX total instead gives ~430.6 kt
and an on-warrant total of ~594.4 kt (7.6 days) — but that is a **stale ratio applied to a fresh level**,
which is inference, so I show the directly-sourced version in the table and this one only as a check. The
conclusion is identical either way.

### 2.3 Is the buffer tight or comfortable? Both — and that is the finding

**The aggregate buffer is comfortable. The accessible buffer is not. They are the same metal in the wrong
place.**

- **Comfortable, on the aggregate:** visible three-exchange stock is **~968 kt, up 30.1% since end-2025**,
  and the LME sits at the **46th percentile of its own 19-year history** — the middle of the range, not a
  shortage. Twelve months ago LME stock was ~77 kt *lower* than today. Anyone describing the copper
  inventory position as depleted is not describing the total.
- **Tight, on what is actually deliverable:** **69.8%** of that visible stock (676.1 / 968.4 kt) sits in
  **COMEX / US warehouses**, drawn there by the Section 232 tariff threat on refined cathode. Outside the
  US there are **292.3 kt — 3.7 days of world consumption**. The LME's own deliverable slice is
  **107.05 kt, 1.4 days**, and it **halved in a single week**. Half of what remains on the LME is already
  cancelled (121.4 kt on 2026-08-21), and those cancellations are reported to be concentrated in US and
  Asian free-trade-zone warehouses with the metal likely headed *into* the US — so the ex-US buffer is
  set to shrink further from an already thin base.
- **The cross-module tell is consistent with the accessible read, not the aggregate read.** The LME
  cash–3M spread is in backwardation of ~US$248/t [market-structure orb, 2026-08-26] / ~US$254/t
  [thevaultreport, 2026-08-27] — the market is paying up for metal *now*, which is what a 1.4-day
  deliverable buffer looks like, not what a 46th-percentile total stock looks like. **I do not own that
  spread and do not emit it as my signal**; it belongs to `commodity-price-curve` and is cited here only
  as corroboration of my accessibility read.

**Adjudicating the number that disagrees, by name (§3).** My "accessible buffer is tight" read is
contradicted by four figures in my own tables: LME total stock at the **46th percentile** of 19 years;
combined visible stock **+30.1% year-to-date**; LME stock **+77 kt year-on-year**; and a realised
**Q1-2026 refined surplus of +396 kt, nearly three times** the +135 kt of Q1-2025. None of these is
overturned by my read — they are all true, and they say the *world* is not short of copper. What they do
not address is *where* the metal is: a tonne in a COMEX vault behind a prospective 15–30% import duty is
not available to a European or Chinese buyer at the LME price. The two readings are compatible because
they answer different questions, and I am emitting them as **two separate, explicitly linked signal rows
rather than one netted view**. If the tariff question is resolved in a way that frees US metal to move,
the aggregate read wins and the tightness disappears quickly — that is the falsifier.

### 2.4 Inventory accessibility and opacity (§9 treatment — applied, not described)

The required row `copper.inventory-accessibility-opacity` is **unusable**, and this is not a formality:

- **China bonded-zone stocks: unmeasured.** ICSG itself considers this material enough to publish a
  *seasonally adjusted* Q1 balance (386 kt) alongside the headline (396 kt) specifically to strip Chinese
  bonded/unreported inventory change — a 10 kt adjustment in Q1, but the underlying bonded *stock* level
  is not in my hands at all. I found SMM bonded-zone articles but **could not pin them to 2026 with
  confidence** (search returned figures spanning several years — one showing 55.5 kt, another 219.8 kt,
  which differ by a factor of four), so I have **excluded them entirely** rather than cite a possibly
  stale number. That dispersion is itself the evidence for the opacity finding.
- **LME off-warrant stocks: unmeasured.** No off-warrant report obtained.
- **Estimate dispersion is demonstrable, not asserted.** Within the figures I *could* source: SHFE warrant
  56.7 kt vs SHFE weekly warehouse 70.1 kt (**24% apart**, different definitions); a "US strategic
  stockpile >1 Mt" claim that may wholly or partly restate the 676 kt already counted at COMEX; and the
  refined-balance headline failing its own component reconciliation by 221 kt (§1.4b).
- **§9 is honoured explicitly: hidden stocks are NOT inferred to be zero.** Every cover figure in §2.2 is
  a **lower bound on the true global buffer**. The true number is 968.4 kt *plus* an unmeasured quantity
  of bonded, off-warrant and off-exchange material. Since Chinese bonded stocks alone have historically
  run in the tens to low hundreds of kt, the unmeasured tail is plausibly of the same order as the entire
  ex-US visible buffer — which means **the ex-US tightness read is the most fragile conclusion in this
  report**, and I am flagging it as such rather than defending it.
- **Consequence:** high opacity on the buffer. Under §9 the supply-demand synthesis must pass this to
  `scripts/commodity_analytical_contracts.py`; on the inputs available (primary-source coverage
  effectively 0% — zero accepted vintages — and demonstrated dispersion well above 15%), this is a
  **high-opacity** case, which **caps the supply-demand directional-conviction score at 45**. That cap is
  the synthesis's to apply; I record the inputs that trigger it.

---

## 3. Gaps / low-confidence items

### 3.1 Required-row coverage ledger (MODULE_RULES §8A — the rows this orb owns)

| Need ID | Stable series ID | Status | As-of | Retrieval / vintage ID | Exact reason unusable |
|---|---|---|---|---|---|
| `copper-visible-inventory` | `copper.visible-inventory` | **unavailable** | — | none | No connector claims this series. No LME/COMEX/SHFE **warrant-status** stock history is wired, and the profile requires ≥5 years weekly with warrant status preserved. What I hold instead: single-date secondary web readings spanning 8 different timestamps, no history, no warrant split at LME beyond one dated commentary. Cannot satisfy the row |
| `copper-inventory-accessibility-opacity` | `copper.inventory-accessibility-opacity` | **unavailable** | — | none | No connector claims this series. No primary warehouse/customs disclosure of off-warrant, bonded or off-exchange material obtained; the SMM bonded articles reachable could not be dated to 2026 and were excluded. Opacity treatment applied per §9 (§2.4); hidden stocks explicitly not set to zero |
| `copper-refined-balance` | `copper.refined-balance` | **unavailable** | — | none | No ICSG connector is wired. Only **secondary reporting of ICSG** is reachable, and it **fails internal reconciliation by 221 kt** (§1.4b): the reported +96 kt 2026 surplus and the reported +0.4% production / +1.6% usage growth rates imply a −125 kt deficit. Two mutually exclusive directions from one release. Per §5 I may not publish either as the balance. Revisions are also not retained anywhere, as the row requires |
| `copper-energy-transition-demand` | `copper.energy-transition-demand` | **unavailable** | — | none | No connector claims this series. **No primary deployment data** (GW commissioned, EV units) and **no primary intensity coefficients** (t Cu/GW, t Cu/vehicle) reachable — only ratio-of-ratios colour and 2040 scenario shares. A bridge needs both legs; neither is held |

**Data needs emitted (§8A: mark failed and emit the need; never substitute a weaker source silently):**
an ICSG monthly-bulletin route (world refined production/usage/balance in **tonnes**, with revisions
retained); LME, COMEX and SHFE **warrant-status** warehouse history with ≥5 years weekly; a China
bonded-zone stock series; and a primary deployment × intensity dataset for grid/EV/renewable copper.

### 3.2 Low-confidence items, ranked by how much damage they do

1. **The 2026 refined balance direction is unresolved, and the two candidate readings point opposite
   ways** (+96 kt surplus vs −125 kt implied deficit). This is the single most consequential gap in the
   module: the sign of the balance is the input the thesis most needs, and I cannot supply it.
2. **The ex-US tightness read rests on an unmeasured denominator.** 3.7 days of ex-US cover is a *lower
   bound* — add unmeasured bonded and off-warrant metal and the tightness could largely evaporate (§2.4).
3. **Timestamp misalignment inside the combined total.** LME 2026-08-27, COMEX 2026-08-25, SHFE
   2026-08-19, and COMEX's registered/eligible split only as of 2026-08-03 — an 8-to-24 day spread in a
   week when LME on-warrant moved 36%. The ~968 kt total is indicative, not a measurement.
4. **Grade and eligibility are not truly aligned.** COMEX Grade 1, LME Grade A and SHFE (VAT/bonded
   regime) tonnes are added in §2.2 as an approximation, contrary to the strict reading of the family
   rule. I do it explicitly and label it rather than silently; a reader should treat the combined total as
   a scale indicator only.
5. **Whether the +96 kt forecast pre- or post-dates the Q1 +396 kt print is unknown**, which is what makes
   the "−300 kt implied for Apr–Dec" arithmetic (§1.3) suggestive rather than binding.
6. **China's demand is measured only as "apparent" demand**, which absorbs unmeasured bonded stock change
   — and the profile's own family rule bars converting China activity into a copper-demand verdict without
   a primary end-use or refined-balance series. I hold neither.
7. **State stockpiling is directionally supportive and entirely unquantified**; the one tonnage claim
   available (US >1 Mt) may double-count COMEX visible stocks and is treated as non-incremental (§4).
8. **The structural electrification thesis — copper's whole strategic case — is unmeasured by this orb.**

### 3.3 What this orb does NOT own, and did not emit

Per the profile's causal-ownership rule and §8 (one fact, one owner): **ETF holdings and flows (`CPER`)
are `commodity-positioning-flows`' — no ETF flow signal is emitted here.** TC/RCs, mine and scrap supply
are `commodity-supply`'s. Tariffs, sanctions and rerouting are `commodity-supply-security`'s — the
Section 232 material above is used only to explain the *location* of inventory, which is my row, and is
cross-referenced rather than voted. The LME cash–3M spread and the COMEX–LME arb are
`commodity-price-curve`'s. China industrial activity and the USD are `commodity-macro-drivers`'.

### 3.4 Bottom line for the synthesis

**Demand:** decelerating and running below its own forecast — world apparent usage +0.8% realised in
Q1-2026 against a +1.6% full-year forecast that was itself cut from +2.1%, requiring ~+1.9% over the
remaining nine months to hold. **Buffer:** ~968 kt visible, **12.3 days** of world consumption, **up
30.1% year-to-date**, with LME at the **46th percentile** of 19 years — *comfortable in aggregate*. But
**69.8% of it is trapped in US warehouses**, leaving **3.7 days ex-US** and an LME deliverable slice of
**1.4 days** that halved in a week — *tight where it has to clear*. **Neither reading can carry conviction:
all four required series are unusable, opacity is high (§9 cap 45), and the refined balance contradicts
itself by 221 kt.** Both horizons are `not_assessable` from this orb; the mechanical consequence under
§8A/§11 is **`Research More`**.
