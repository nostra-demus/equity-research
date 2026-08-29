# Supply–Demand Balance — COPPER (module synthesis)

**Run date:** 2026-08-28 · **Run root:** `commodity/runs/COPPER/` · **Unit:** thousand tonnes (kt) of contained/refined copper metal unless a row says "gross concentrate weight" · **Inputs:** `01_commodity-supply.md`, `02_commodity-demand-inventory.md`, `03_commodity-weather-seasonality.md`, `04_commodity-supply-security.md` (all four present, each with a `.signals.json` sidecar) · **Rules:** root `CLAUDE.md`, `.claude/agents/commodity/MODULE_RULES.md` §§2–4a, 8, 8A, 9; `frameworks/commodity/COMMODITY_PROFILES.md` §`## COPPER`.

> **Evidence status, stated before any number (MODULE_RULES §8A).** `data/COPPER/` does not exist, no accepted connector vintage exists anywhere in this run, and the pulse transport is dead (`PULSE-MISSING`, EPERM). **Every figure in this synthesis is unvintaged live-web context inherited from the four specialists, carrying their source and as-of date.** Under §8A it may explain the situation but **cannot raise data sufficiency or conviction**, and none of it fills a required coverage row. Orb 01 additionally reports that **not one primary document was successfully read** (five primary retrievals failed: 2× HTTP 403, 3× unreadable binary PDF); every production figure below is a trade-press relay of an ICSG / USGS / Cochilco / INE / MINEM figure. All **eight** required semantic series owned by this module are unusable — see §Supply Opacity and §Reconciliation & Gaps.

---

## Abstract

The full-year 2026 copper balance direction is **not established**: the same reported ICSG release gives a **+96 kt surplus** headline and, from its own reported +0.4% production / +1.6% usage growth rates, an implied **−125 kt deficit** — a 221 kt contradiction whose two readings point in **opposite directions** [orb 02 §1.4b]. What *is* observable is that the **realised** part of 2026 ran a surplus (Q1-2026 **+396 kt**, 386 kt seasonally adjusted for Chinese bonded stock change, against +135 kt in Q1-2025), and that surplus landed in visible metal (three-exchange stock **+401 kt** end-2025 → end-May-2026). The buffer is **comfortable in aggregate and thin where it has to clear**: ~**968.4 kt** visible three-exchange stock = **12.3 days** of world use and **+30.1% YTD**, with LME total at the **46th percentile of 19 years** — but **69.8%** of it sits in COMEX/US warehouses behind the Section 232 cathode question, leaving **3.7 days ex-US** and an LME on-warrant slice of **1.4 days** that fell **35.8% in one week**. The biggest swing factor is **not weather** (orb 03: not a driver, neutral) — it is the **overdue US Section 232 determination on refined copper**, an undated binary that can move ~740 kt of US-located metal between "accessible to the world" and "trapped inside a border" without changing a single tonne of production. Supply opacity is **HIGH on measured primary-source production coverage of 0.0%**; the deterministic cap is 45 and the raw directional-conviction score of 35 already sits below it.

---

## Balance (surplus / deficit)

**Verdict: NOT ESTABLISHED for full-year 2026. Realised year-to-date: surplus.** These are two different statements and I am not collapsing them into one.

| Reading | 2026 figure | Direction | Basis | Source |
|---|---:|---|---|---|
| ICSG reported headline forecast | **+96 kt** | **Surplus** | reported balance, as relayed | [ICSG via IndexBox, pub. 2026-06-30 — UNVINTAGED, secondary] |
| ICSG's own reported growth rates, compounded | **−125 kt** | **Deficit** | +0.4% production / +1.6% usage on 2025 bases of ~28.44 Mt / ~28.22 Mt; orb 02's arithmetic | [orb 02 §1.4b, from ICSG Factbook 2025 + ICSG via IndexBox 2026-06-30] |
| Gap between the two | **221 kt** | **Opposite signs** | — | — |
| ICSG Oct-2025 vintage (superseded) | −150 kt | Deficit | prior forecast round | [ICSG 2025-10-08 via Mining Weekly / SMM — UNVINTAGED] |
| ICSG realised, Q1-2026 preliminary | **+396 kt in Q1 alone** (386 kt seasonally adjusted) | **Surplus** | 3-month realised flow; Q1-2025 was +135 kt | [ICSG Q1-2026 prelim via SMM, 2026-05-23 — UNVINTAGED] |
| Vendor cross-read, for contrast only | ~+490 kt (April view) → **−640 kt deficit *outside the US*** (June view) | Both | tier-5 vendor estimate, not an official balance | [Goldman Sachs via trade-press summary, accessed 2026-08-28 — UNVINTAGED] |

**Why I refuse to publish a full-year sign.** Orb 02's method check is what makes this a real inconsistency rather than a derivation error: the same arithmetic applied to 2025 returns +213 kt against ICSG's reported +178 kt — a 35 kt gap, i.e. the method is sound to within rounding of the base levels, so the 221 kt gap in 2026 is an inconsistency in the reported figures themselves. Under §5 I may not cite a number the source does not support, and here two numbers from one reported release contradict each other by more than twice the headline. Conservative default (§4): **the 2026 balance direction is not proven from available data.** `copper.refined-balance` is recorded **unusable**, not carried at +96 kt.

**What survives that refusal, and is worth carrying.** Two partly independent observations both say the *realised* period was in surplus:

1. The realised Q1-2026 print (+396 kt) is ~4× the entire full-year forecast (+96 kt), and ~2.9× the +135 kt of Q1-2025.
2. Visible three-exchange stock rose **+401 kt** from end-2025 (744.1 kt) to end-May-2026 (1,145.0 kt), and is still **+30.1%** against end-2025 at 968.4 kt on 2026-08-27/25/19 timestamps.

Orb 02 prints the matched-basis caveat and I keep it: setting a 3-month flow against a 5-month stock change is a **period mismatch** (§15), so the "99% of the surplus is visible" reading is *not* available. What the arithmetic does establish is that the visible build is the **same order of magnitude** as the reported surplus — the surplus is landing in visible exchange stock rather than disappearing into unmeasured inventory. That is a coarse finding, and it is stated as coarse.

**The arithmetic the forward year has to clear, printed so it can fail (§17).**

- **Balance:** +96 kt full-year minus +396 kt already realised in Q1 implies **−300 kt over April–December** — a ~165 kt/month swing from a +132 kt/month Q1 surplus to a −33 kt/month deficit. *Limit on this:* orb 02 could not establish whether the +96 kt forecast was struck **before or after** the 2026-05-23 Q1 release (the article carrying it published 2026-06-30). If the forecast predates the Q1 data, the −300 kt implication is a vintage-mixing artefact, not a finding. **Suggestive, not binding.**
- **Demand:** world apparent usage grew **+0.8% y/y realised in Q1-2026** against a **+1.6%** full-year forecast that was itself cut from +2.1%. For the year to land at +1.6%, the remaining nine months must run ~**+1.9%** ((1.6 × 12 − 0.8 × 3) ÷ 9 = 1.87%) — more than twice the realised Q1 rate. Segment sum-check reconciles: China 58% × 1.9% = 1.10pp + RoW 42% × 1.3% = 0.55pp = **1.65%** vs the reported 1.6%.
- **Supply:** Chile's 2026 forecast of 5,270 kt (−2.6%) requires H2 to run **+38 kt above year-ago** after H1 ran **−6.6% y/y cumulative** (Codelco −10%). Orb 01's attribution shows H1 alone already accounts for **127%** of the full-year decline, leaving a residual of the **wrong sign**. Evidence for the required H2 recovery: **one month** — Chile INE June-2026 at 447,294 t, +5.1% y/y (Escondida 111,400 t, +45.8%, offsetting Codelco 114,400 t, −4.8%). Falsifier is cheap and dated: **if July and August INE prints come in below year-ago, 5,270 kt is unreachable.**

**The compound supply finding, carried whole (§3 — not hardened).** Total mine tonnes are **FLAT** (+0.2% Cochilco / +1.6% ICSG for 2026) **while the smeltable concentrate stream is FALLING** (−1.1% y/y, Q1-2026) **and SX-EW cathode (+3.3%) and scrap-based refined output (+5.6%, Jan–May) are RISING**. That three-way split is the supply story. It is **not** "copper supply is falling" — the world total is being held up by material that never enters a smelter, which is why a flat mine number coexists with a negative concentrate number and a spot treatment charge of **−US$182.14/dmt** (2026-08-21) against a **US$0/t** 2026 benchmark and US$21.25/t in 2025. Per the profile's family rule, TC/RC is the **price tag on the same mine-supply fact, not a second vote** for it, and orb 01 refuses the attribution outright: no elasticity of spot TC to a 1pp feed gap was sourced on any basis, so **0% of the −US$182.14/dmt level is arithmetically attributed and 100% is residual**. The negative treatment charge is *consistent with* the concentrate shortfall; it is not measured against it.

---

## Gross Production → Globally Accessible Supply Bridge

**One bridge, kt of contained/refined copper, 2026 estimate, with a visible residual. Ownership is adjudicated: orb 01 owns production, recycling and domestic absorption; orb 04 owns restrictions, sanctions, chokepoints and rerouting. Nothing is deducted twice.**

### Origin level — pre-policy exportable supply

| Origin | Gross production | + recycling | + net external transfer (eliminated on consolidation) | − domestic absorption | − stock build | = Pre-policy exportable | Residual named |
|---|---:|---:|---|---:|---:|---|---|
| Chile | 5,270 | n/s | ~0 (negligible concentrate imports — INFERENCE) | **n/s** | n/s | **not computable** | Chile's own smelter/refinery intake — the whole difference between production and exports. Partial anchor only: China imported 4,280.8 kt *gross concentrate weight* from Chile in H1-2026, −7.9% y/y (a contained conversion would need a grade nobody sourced — do not use it) |
| Peru | ~2,790 (derived: Q1 688 kt, +3.3%, annualised) | n/s | ~0 (INFERENCE) | **n/s** | n/s | **not computable** | Ilo / Southern Peru smelter intake, unquantified |
| DRC | **2026 country total not published in any source read** (2025 = 3,200) | n/s | ~0 (INFERENCE) | small (INFERENCE) | n/s | **not computable** | The entire 2026 country number. Only movable piece sized: Kamoa-Kakula 290–310 kt vs 380–420 kt previously guided = **−100 kt** at midpoint |
| Indonesia | ~454 (Grasberg only; country total 710 in 2025) | n/s | ~0 | rising (domestic smelters commissioned, tonnage n/s) | n/s | **not computable** | Country total ex-Grasberg, plus domestic smelter intake |
| China | 1,800 (2025, mine only) | large, inside secondary refined below | **LARGE POSITIVE and ELIMINATED**: ~14,610 kt gross concentrate weight imported H1-2026 (derived) + 1,240 kt scrap | very large (refined output ~1,270 kt in July-2026 alone; +7.4% y/y Jan–Apr) | n/s | **none — net importer** | The elimination case (below) |

**Every origin's pre-policy exportable cell is `not computable`, not zero.** Domestic absorption — the smelter and refinery intake that separates what a country digs from what it can ship — was not sourced for Chile, Peru, the DRC or Indonesia. [orb 01 §3, §5.3]

### World consolidation — the transfers cancel

| Line | kt | Note |
|---|---:|---|
| World gross mine production 2026e | **23,500** | [Cochilco 2026 forecast via Rio Times / SMM relays, 2026-08-11 / 2026-08-13 — UNVINTAGED]. Competing estimate 23,368 kt (derived: USGS MCS 2026 world 2025 of 23,000 kt × ICSG April-2026 +1.6%) |
| + recycling / releases (scrap-based **secondary refined**) | **+5,101** | Derived = 17.8% (secondary share, Jan–May 2026) × derived world refined production 28,656 [ICSG via Recycling Today relay, 2026-07 — UNVINTAGED] |
| + net imports / exports | **0 by construction** | All inter-origin trade cancels (§9) |
| = **Gross world availability** | **28,601** | 23,500 + 5,101 |
| − world absorption (refined usage 2026e) | **−28,560** | Derived: ICSG Oct-2025 2026 usage 28.7 Mt on +2.1% → 2025 base 28,110 kt; ICSG April-2026 cut growth to +1.6% → 28,110 × 1.016. **Cross-reference only — owned by `commodity-demand-inventory`; this is not a supply vote** |
| = balance before stock build | **+41** | Derived |
| − world stock build | **not sourced for the full year** | Visible-only proxy: three-exchange stock +224.3 kt YTD (968.4 − 744.1); +401 kt end-2025 → end-May-2026. This is a **partial** proxy — bonded and off-warrant are NOT MEASURED and explicitly not set to zero |
| **Residual against derived refined production (28,656)** | **−55 kt (−0.2%)** | A consistency check on my own derivation chain. **It is not a confirmation of the balance** — the balance it is checked against fails its own component reconciliation by 221 kt |
| − restricted / sanctioned volume | **upper bound ~75 kt/yr; net deduction not measurable** | DRC concentrate only (see below) |
| − physically stranded volume | **none verified** | See below |
| + verified rerouting reaching an unrestricted buyer | **none** | See below |
| = **GLOBALLY ACCESSIBLE SUPPLY** | **NOT ASSESSABLE** | Orb 04's bridge total is `not assessable` in every column; the pre-policy base it must net against does not exist |

**Carried honestly, per orb 04's own finding: the pre-policy exportable base does not exist this run, so the bridge total is `not_assessable`. I am not assembling a total I cannot source.** Orb 04 recorded `copper.supply-restrictions-routing` as **FAILED**, refused to publish a "% of world supply" for any row lacking a sourced denominator, and reported primary-source coverage of **0% across every row of its bridge**.

### The policy layer, row by row — what is deducted and what is refused

| Item | Deduction taken | Why |
|---|---|---|
| **DRC concentrate export ban** (joint ministerial order 2026-06-29, immediate) | **Upper bound ~75 kt/yr contained Cu; net deduction not measurable** | Q1-2026 DRC exports: 53,926 t concentrate containing **18,863 t** copper metal, alongside **696,725 t** of cathode; ×4 ≈ 75 kt/yr. Concentrate blocked at the border can be smelted domestically and leave as **cathode**, which is unrestricted — a **change of product form inside the same country, not a rerouted cargo**. Share arithmetic (INFERENCE): 0.026 × 0.14 ≈ **0.36% of world mined copper**. The headline "DRC bans copper exports" is a ban on roughly a third of one percent, not on ~14% |
| **Russian copper** (OFAC 2024-04-12, effective 2024-04-13; LME/CME warranting ineligibility; US import ban) | **ZERO** | **Exchange delivery ineligibility is not lost production (§9).** The metal is produced and sold; it cannot become a Western warrant. Rerouting to non-sanctioning buyers is the reported mechanism but **no tonnage, destination, discount, transport-delay or settlement/insurance evidence was obtained**, so no rerouting is credited either. The correct read is a **relocation of deliverable stock away from LME/COMEX**, not a reduction in world supply |
| **Indonesia concentrate export ban** (downstreaming; no PTFI concentrate exported since end-2024) | **ZERO** | The Indonesian tonnes actually missing in 2026 are missing because of the **Grasberg incident** — a *production* fact owned by orb 01, already in the 23,500 kt line. The policy changes the **form** in which metal leaves (cathode from domestic smelters), not the quantity |
| **US Section 232 semis tariff** (Proclamation 10962, 50% on semis from 2025-08-01; June-2026 full-customs-value modification, window to 2027-12-31) | **ZERO refined tonnes** | Cathode, ore, concentrate, matte, anode and scrap are **exempt**. It taxes fabricated goods |
| **US-located metal pulled in ahead of the pending refined decision** | **ZERO — conditionally stranded, not stranded** | **>200,000 t** landed in July 2026 (largest month in IHS Markit shipping data back to 2014); **>740,000 t** combined COMEX+LME; **110,860 t** in private US port storage. This metal is **legally free to move today**. It becomes structurally trapped only **if** a refined duty lands. No re-export cost, destination, discount or delay evidence exists, so it is **not credited as accessible to ex-US buyers** either. This is a **location** risk created by policy, not a quantity loss |
| **Cobre Panamá** (idle since Nov-2023 by court ruling) | **ZERO** in the policy layer | Lost **production**, owned by orb 01. Deducting it here would double-count. Stockpile processing has restarted: 2.1 Mt ore for ~3,200 t contained Cu by end-June 2026 |

### Double-counting rejected, by name (§9)

1. **China's imported concentrate and scrap** (~14,610 kt gross concentrate weight + 1,240 kt scrap, H1-2026) are Chilean, Peruvian and other origins' tonnes **already counted at origin**. They are transfers and cancel on consolidation. **A produced unit does not re-enter world supply because it was traded.**
2. **SX-EW cathode is counted by ICSG in BOTH mine production and primary refined production.** Orb 01's sanity check — primary refined 23,555 kt against mine 23,500 kt — is **one quantity appearing twice, not two independent sources agreeing.** Read as corroboration it would be a §16 "the methods agree" failure.
3. **Grasberg and Cobre Panamá** appear in orb 04's register as policy/legal *causes* with a **zero** deduction, because the tonnes are production facts owned by orb 01.
4. **Russian metal** is not deducted as lost production (exchange ineligibility ≠ lost tonnes) and not credited as rerouted (no verified destination/discount/delay/settlement evidence). Zero on both sides.
5. **The "US strategic stockpile >1 Mt" claim** is not treated as incremental demand: it sits uncomfortably close to the 676.1 kt already counted in COMEX warehouses and the source does not define whether it means a government reserve, exchange stock, or all US-located metal. Conservative default (§4) — excluded.
6. **TC/RC** is the price tag on the concentrate shortfall, **not a second vote** for the same mine disruption (profile family rule).
7. **Section 232 appears in two orbs and votes once:** orb 02 uses it only to explain the **location** of inventory (its row); orb 04 owns it as a **policy** item. It is cross-referenced, not double-voted.
8. **El Niño tonnage** is handed to orb 01 and asserted nowhere — orb 03 explicitly declined the circulating "~1.6 Mt of annual capacity at suspension risk" figure as a tonnage claim it does not own, sourced only to low-quality secondary blogs.

**Not in this bridge and unquantified:** **direct-melt scrap** — scrap remelted straight into products without passing through a refinery. It never enters the refined balance, so world *metal* supply is understated by an amount no source reached puts a number on.

---

## Inventory buffer vs history

**The aggregate buffer is comfortable. The accessible buffer is not. They are the same metal in the wrong place.**

**The ~968.4 kt total travels with its build (§15), and with its warrant-status basis (profile family rule — on-warrant, cancelled and bonded/off-exchange are never one number):**

| Component | kt | Warrant-status basis | As-of |
|---|---:|---|---|
| LME — total stock | **235.6** | total (on-warrant + cancelled) | 2026-08-27 |
| — of which LME **cancelled warrants** (earmarked to exit) | **121.4** = 50.52% of a then-total of ~240.3 kt | cancelled — **not deliverable** | 2026-08-21 |
| — of which LME **on-warrant / available** | **107.05** | **the genuinely deliverable slice** | 2026-08-27 |
| COMEX — registered + eligible | **676.1** (745,277 short tons × 0.90718474) | total | 2026-08-25 |
| — of which COMEX **registered** (warranted, deliverable) | **415.5** (63.7% of total) | registered | **2026-08-03** (22 days staler than the total above) |
| — of which COMEX **eligible** (in an approved vault, **not** warranted) | **236.6** | eligible — not warranted | 2026-08-03 |
| SHFE — **warrant** stock | **56.7** | warrant | 2026-08-19 |
| SHFE — weekly **warehouse** stock (a *different* measure) | 70.1 | warehouse — **24% / 13.4 kt apart from the warrant figure; two definitions, not a reconciliation** | week 32, mid-Aug 2026 |
| China **bonded-zone** stocks | **NOT MEASURED** | — | — |
| LME **off-warrant** stocks | **NOT MEASURED** | — | — |
| **Combined three-exchange visible total** | **~968.4** | **approximation** — timestamps span 8 days (24 for the COMEX split); COMEX Grade 1, LME Grade A and SHFE VAT/bonded tonnes are **not fungible** | — |

**Cover, and where it sits against history:**

| Slice | kt | Stocks-to-use | Days of world use | Vs history |
|---|---:|---:|---:|---|
| All visible three-exchange | **968.4** | **3.38%** | **12.3** | **Comfortable.** +30.1% vs end-2025 (744.1 kt); −15.4% vs end-May-2026 (1,145.0 kt) |
| On-warrant / deliverable only (LME 107.05 + COMEX registered 415.5 + SHFE warrant 56.7) | 579.3 | 2.02% | 7.4 | Mixed-timestamp; a fresher-COMEX check gives ~594.4 kt / 7.6 days — same conclusion |
| **Ex-US** (LME total + SHFE warrant) | **292.3** | **1.02%** | **3.7** | **Thin** |
| LME total alone | 235.6 | 0.82% | 3.0 | **46th percentile of the 19-year record — mid-range, NOT tight.** +77 kt over 12 months. The drain *rate* is extreme (among the fastest ~18-week draws since 2008, bottom 6%); the *level* is ordinary |
| **LME on-warrant alone** | **107.05** | **0.37%** | **1.4** | **Tight — and fell 35.8% in one week** (from 166.775 kt on 2026-08-20). No percentile exists for this sub-series, so it is placed by change, not by rank |

Denominator: world refined usage ~28.67 Mt for 2026 (derived) = 551.4 kt/week = **78.6 kt/day**. A ±1pp error in usage growth moves the cover figures ~1% and changes no conclusion.

**Adjudicating the numbers that disagree, by name (§3).** The "accessible buffer is thin" read is contradicted by four figures in this module's own tables: LME total at the **46th percentile** of 19 years; combined visible stock **+30.1% YTD**; LME stock **+77 kt y/y**; and a realised **Q1-2026 surplus of +396 kt**, ~2.9× Q1-2025. **None of these is overturned.** They are all true and they say the *world* is not short of copper. What they do not address is *where* the metal is: a tonne in a COMEX vault behind a prospective 15–30% import duty is not available to a European or Chinese buyer at the LME price. The two readings answer different questions and are carried as two linked rows, not netted.

**Corroboration from outside this module, cited but not voted:** the LME cash–3M spread is in backwardation of ~US$248/t [market-structure orb, 2026-08-26] / ~US$254/t [thevaultreport, 2026-08-27] — the market paying up for metal *now* is what a 1.4-day deliverable buffer looks like, not what a 46th-percentile total looks like. That spread is `commodity-price-curve`'s and is **not** emitted as a supply-demand signal.

**The fragility that must travel with the ex-US read.** Bonded and off-warrant material is **NOT MEASURED and explicitly not assumed to be zero** (§9). Every cover figure above is therefore a **lower bound on the true global buffer**. Chinese bonded stocks alone have historically run in the tens to low hundreds of kt — plausibly the same order as the entire ex-US visible buffer. **The ex-US tightness read is the most fragile conclusion in this module**, and orb 02 flags it as such rather than defending it. The demonstrated dispersion supporting that opacity finding: SMM bonded articles reachable this run returned figures spanning 55.5 kt and 219.8 kt — a factor of four — and could not be pinned to 2026, so they were excluded entirely.

---

## Direction & biggest swing factor

**Direction of the physical setup (not a price call):** total mine tonnes flat, the smeltable concentrate stream falling, SX-EW and scrap rising; demand decelerating and running below its own already-cut forecast; a visible buffer that is mid-range in total and thin in the fraction that can actually be delivered outside the US. The full-year balance sign is not established.

**Biggest swing factor: the overdue US Section 232 determination on REFINED copper — a location binary, not a production one.** It is the only live item that can move ~740 kt of visible metal between "available to the world" and "trapped inside a border" without changing a single tonne of output, and it is the reason 69.8% of the world's visible copper is sitting in one country. Weather is explicitly **not** the swing factor here: orb 03's verdict is **not a driver, neutral**, with the profile stating copper is "NOT a weather commodity".

Runners-up, in order, each with its dated falsifier:

1. **Chile's required H2 recovery.** The 5,270 kt forecast needs H2 **+38 kt above year-ago** after H1 ran −6.6% y/y. Evidence: one month (June-2026, +5.1% y/y). *Falsifier:* July and August INE prints below year-ago.
2. **China's real (not apparent) offtake.** China is ~58% of world usage and the whole +1.6% forecast hinges on its +1.9%. ICSG's own two prints disagree by definition and window — Q1-2026 apparent demand *ex* bonded/unreported stock change was "basically flat" (~0%); Jan–Apr-2026 apparent demand was **+2.4%**. Those are not a straight contradiction (the bonded adjustment is exactly the difference) but **they cannot both be used**, and the profile's family rule bars converting China activity into a copper-demand verdict without a primary end-use or refined-balance series — neither of which this module holds.
3. **Scrap substitution, which cuts against tightness.** Secondary refined output +5.6% (Jan–May) against +2.4% for primary lifted scrap's share of world refined output from 17.3% to 17.8%; China's scrap share of refined feedstock reached 25.2% in H1-2026 as treatment charges went negative. **The opposing fact, stated separately rather than netted:** the refined-minus-scrap price spread "narrowed considerably" in June 2026, which mechanically reduces the incentive to feed scrap — **direction only, no numeric spread obtained, so it is not sized.**
4. **El Niño — probabilistic, unrealised, two-sided, and not double-counted.** NOAA CPC El Niño Advisory (issued 2026-08-13): July Niño-3.4 anomaly **+1.4°C**, **>90%** chance of a very strong event through NH fall/winter 2026-27, **69%** chance the Oct–Dec season exceeds +2.5°C. For copper this raises the *probability* of heavy Andean rain/flood interrupting mine output (price-positive) **while** above-normal Chilean precipitation would ease the water constraint on concentrators (price-negative). Neither is measured; the tonnage vote stays with orb 01. Window: **Dec-2026 – Mar-2027**, overlapping the **6 Feb 2027** Lunar New Year demand trough. Orb 03's escalation trigger: a named, dated suspension of more than ~two weeks at a top-10 asset in that window, sourced to the operator or COCHILCO.

---

## Policy killer risk (from 04_commodity-supply-security)

**Entry:** the **pending US Section 232 determination on REFINED copper**. The 2025-06-30 Commerce report recommended a phased universal duty of **15% from 2027-01-01** and **30% from 2028-01-01**. Proclamation 10962 required Commerce to give the President a copper-market update **by 2026-06-30**.

**Expiry: NONE — it is undated and open.** The deadline was **missed** and **no new ruling date has been set**; as of 2026-08-28 it is **59 days overdue**.

**Flip triggers (both written so they can fail, §17):**
- **Bull flip (price-supportive for US-located metal):** a Federal Register proclamation imposing a refined-copper duty of **≥15% with an effective date on or before 2027-01-01**. *Comparable:* the 0% duty on refined cathode in force since 2025-08-01. *Can it fail?* Yes — nothing has been published, and a market-implied read put the odds at **14.6%** for a 15% duty by Jan-2027, **37%** for a 30% duty by Jan-2028 [FXStreet summary of Société Générale, 2026-08-10 — broker research, verdict-stripped per MODULE_RULES §2, UNVINTAGED].
- **Bear flip (price-negative for the US leg):** a published determination **not** to impose a refined duty, **or** 2027-01-01 arriving with no duty in force. *Implied arithmetic:* the COMEX–LME spread would have to fall from **US$547/t** (2026-08-26, price-curve orb) toward the **~US$50/t** implied long-run average — about **−US$497/t, ~91%** of the current spread. Separately the >740,000 t of US-located metal becomes an ex-US overhang **only to the extent it can be economically re-exported**, which is **not established** — no re-export cost, destination, discount or delay evidence was obtained.

**Why it dominates:** it is the only register entry that can move the **benchmark grade itself**. Every other measure taxes fabricated goods, restricts a *form* of copper, restricts an *exchange's* delivery list, or moves metal between locations. And it is already carrying enormous positioning: the COMEX-over-LME premium was **19.2 US¢/lb** in mid-August 2026, described as ~8.4× its 2005–2025 average (my arithmetic on orb 04's figures: 0.192 × 2,204.62 = **US$423/t**; the implied long-run average 19.2 ÷ 8.4 = 2.29 US¢/lb = **US$50/t**). The price-curve orb independently measured the same spread at **+US$547/t (+3.8%)** on 2026-08-26 — **these two are not equal and are not averaged**; they are different dates on different legs (COMEX front vs LME 3M) and both are unvintaged.

**The qualifier that must not be dropped: this is a killer risk in the §24 survival-tail sense — a large, sudden, undated repricing that can fire in EITHER direction — and orb 04 states explicitly that NO PROVEN CRITICAL RISK is established.** Under §11 only a genuinely proven critical risk with a cited source could force `Avoid` instead of the `Research More` the run's `not_assessable` coverage otherwise mandates. **Nothing in this module supplies that, and nothing here should be used to force `Avoid`.**

**The loud headlines restrict almost no copper — this is a LOCATION risk, not a quantity risk.** DRC's concentrate export ban covers ~75 kt/yr contained (~**0.36%** of world mined copper, inference); Indonesia's ban changes export **form**; Russian metal is **exchange-ineligible rather than lost production**.

**Other dated items for the catalyst calendar:** **2026-12-31** (Panama / Cobre Panamá decision window); **2027-01-01** (recommended refined-duty start; also the US scrap 25% domestic-sales and input-material 25%→30%→40% schedule); **2027-12-31** (expiry of the June-2026 Section 232 modification window); **2028-01-01** (recommended step to 30%). Registered but **stale (13 months)** and carried as a recurrence risk, not a live disruption: **Peru mining-corridor blockades** tied to the REINFO regime (Las Bambas >320,000 t Cu in 2024, Antapaccay, Constancia 99,000 t) — blockades lifted, current REINFO deadline not sourced.

**Clean families, not force-filled (§24 — a clean register is a valid result):** OPEC+/managed supply (no copper cartel); maritime chokepoints — **"none found", NOT "proved zero"** (no free-source flow share obtained); carbon-border adjustment — **"none found", not proof of absence** (the CBAM Annex I text was not retrieved); biofuel/blending mandates (structurally inapplicable).

---

## Supply Opacity & Score Cap

- **Raw supply-demand directional-conviction score: 35/100** (higher = stronger evidence for the **separately stated** balance direction; **the sign is separate**). This score does **not** mean bullish, tight, or well-supplied. A well-proven surplus and a well-proven deficit could both score highly; this one scores low because the direction itself is contradicted by its own source.

  *Explained from evidence rows.* **Upward:** the realised period has two partly independent surplus reads — Q1-2026 +396 kt (386 kt seasonally adjusted) [ICSG Q1 prelim via SMM, 2026-05-23] and a +401 kt visible three-exchange build end-2025 → end-May-2026 [orb 02 §2.1]; the demand segment sum-check reconciles (1.65% vs 1.6%); orb 01's world-bridge residual closes at −55 kt (−0.2%). **Downward, and decisive:** the full-year balance fails its own component reconciliation by **221 kt with opposite signs** (+96 kt reported vs −125 kt implied) [orb 02 §1.4b]; **zero primary documents were read** and every production figure is a trade-press relay [orb 01 §0, §4]; **all eight required series owned by this module are unusable**; the origin bridge closes for **no origin**; globally accessible supply is **not assessable**; and the ex-US tightness read rests on an unmeasured bonded/off-warrant denominator. 35 sits in §12's "weak" band (21–40), which is the honest placement.
- **Primary coverage / estimate dispersion / release cycles late: 0.0% / 0.56% / 1.**
  - **Coverage 0.0%** = 0 kt of current primary-source-observed production ÷ 23,500 kt world production. Five direct primary retrievals failed (USGS MCS 2026 copper chapter HTTP 403; USGS MCS interactive HTTP 403; ICSG Table 1 unreadable binary; ICSG forecast press release unreadable binary; IEA commentary HTTP 403). One primary retrieval succeeded — Ivanhoe Mines' news release of 2025-12-03 — and is **excluded** because it is superseded (380–420 kt cut to 290–310 kt) and carries no current-period actuals; Kamoa-Kakula at ~300 kt would in any case be 1.3% of world production.
  - **Dispersion 0.56%** = (23,500 − 23,368) ÷ 23,434, world 2026 gross mine total, n=2. **This figure must not be read as agreement:** the two estimates both anchor on a ~23 Mt base and are therefore not independent (§16). Matched-basis alternatives, printed: on the world **2025 level**, 23,000 kt [USGS MCS 2026] vs 23,450 kt [Cochilco-implied] = **1.93%**; on the 2026 **growth rate**, ICSG +1.6% vs Cochilco +0.2% — a **1.4pp gap, an 8× relative spread on the quantity that decides direction**. None of the three reaches the 15% threshold, so dispersion does not independently trigger the cap.
  - **Release cycles late: 1.** ICSG Monthly Copper Bulletin, monthly cadence, ~two-month publication lag; on a 2026-08-28 decision date the expected data month is June-2026 and the latest readable data month is **May-2026**. The provider is on time; the lateness is in *accessible* content (the August bulletin sits behind an unreadable/paid PDF). Reported as 1 on the conservative default. Below the >2 threshold, so it does not independently trigger the cap.
- **Deterministic opacity result: HIGH; cap 45; final supply-demand score 35/100.** The cap does not bind here — the raw score is already below it. **The cap can only reduce a score; it can never raise one.**
- **Reasons copied from `commodity_analytical_contracts.py`:**

```json
{"capped_score": 35.0, "estimate_dispersion_pct": 0.56, "level": "high", "primary_coverage_pct": 0.0, "raw_score": 35.0, "reasons": ["primary coverage below 70%"], "release_cycles_late": 1.0, "score_cap": 45}
```

Orb 02 independently reached the same high-opacity conclusion from its own inputs (zero accepted vintages; demonstrated dispersion well above 15% on bonded-stock estimates, the SHFE warrant-vs-warehouse definitions, and the 221 kt balance failure) and recorded the inputs rather than applying the cap itself. The cap is applied once, here.

---

## Reconciliation & Gaps

### Contradictions reconciled, not averaged

| Contradiction | Resolution |
|---|---|
| ICSG **+96 kt surplus** vs its own rates implying **−125 kt deficit** (221 kt, opposite signs) | **Neither published as the balance.** Orb 02's method check (2025: +213 kt derived vs +178 kt reported, a 35 kt gap) shows the method is sound, so the 2026 gap is a real inconsistency in the reported figures. Conservative default (§4): direction **not proven from available data**; `copper.refined-balance` marked unusable |
| Comfortable aggregate buffer vs thin accessible buffer | **Both true; they answer different questions.** Carried as two linked rows. The aggregate wins if the Section 232 question is resolved in a way that frees US metal to move — that is the stated falsifier |
| World mine estimate **23,500 kt (+0.2%, Cochilco)** vs **23,368 kt (+1.6%, ICSG-derived)** | Both printed. The level gap is trivial (0.56%); the **growth-rate gap (1.4pp, 8× relative) is the material disagreement** and it is on the quantity that decides direction. Not averaged |
| Grasberg 2026 shortfall **~270 kt** vs **~244 kt** (implied by "35% below plan" on 454 kt actual) | Carried at **−244 kt**, the smaller/conservative figure (§4). The 26 kt (~11%) gap is unresolved because neither primary document was readable |
| China Q1-2026 apparent demand **"basically flat"** (ex bonded) vs Jan–Apr **+2.4%** | Different windows and different definitions — the bonded adjustment is exactly the difference. **Not a straight contradiction, but they cannot both be used.** Emitted as two linked opposing rows |
| COMEX–LME spread **US$423/t** (from 19.2 US¢/lb, mid-Aug) vs **US$547/t** (2026-08-26, price-curve orb) | **Not averaged.** Different dates, different legs (COMEX front vs LME 3M), both unvintaged |
| SHFE **warrant 56.7 kt** vs **weekly warehouse 70.1 kt** (24% apart) | Two different definitions, not a reconciliation. Warrant figure used in the buffer; the gap is evidence for the opacity finding |
| "US strategic stockpile >1 Mt" | Excluded as incremental demand — may wholly or partly restate the 676.1 kt already counted at COMEX; source does not define its scope (§4) |

### Claim-fidelity pass over the roll-up (CLAUDE.md §3 — four failure shapes, checked explicitly)

| Failure shape | Check | Result |
|---|---|---|
| **Qualifier dropped** | Is "concentrate stream falling **while total tonnes flat**" kept as the compound finding? | **Yes.** Stated as a three-way split (flat total / −1.1% concentrate / +3.3% SX-EW / +5.6% scrap-based refined) in the Abstract, the Balance section and the Direction section. **Nowhere hardened to "supply falling."** |
| **Basis dropped** | Does every stock figure carry its warrant-status basis? | **Yes.** The buffer table is a decomposition by on-warrant / cancelled / registered / eligible / warrant / warehouse / bonded-unmeasured / off-warrant-unmeasured. The combined total is labelled an **approximation** with its timestamp spread (8 days, 24 for the COMEX split) and its non-fungible grade regimes on every appearance |
| **Build dropped** | Does the 968.4 kt total travel with its itemised components? | **Yes.** LME 235.6 (2026-08-27) + COMEX 676.1 (2026-08-25) + SHFE warrant 56.7 (2026-08-19), each printed with its warrant status and as-of date, wherever the total is quoted. Same for the 28,601 kt gross world availability (23,500 + 5,101, with the 5,101 derivation shown) |
| **Verdict hardened** | Is orb 04's "killer-risk present but two-sided; **no proven critical risk**" preserved? | **Yes.** Stated verbatim in the Policy killer risk section with the explicit §11 consequence: nothing here forces `Avoid`. Also checked: the balance is **not** hardened to a surplus or a deficit; the El Niño signal is **not** hardened from probabilistic to realised; "none found" on chokepoints and CBAM is **not** hardened to "proved zero"; the DRC ban is **not** hardened from ~0.36% to ~14% |

### Required-series ledger — all eight owned by this module are unusable (§8A)

| Need ID | Series | Owner | Status | Reason |
|---|---|---|---|---|
| `copper-mine-prepolicy-supply` | `copper.mine-prepolicy-supply` | orb 01 | **unusable — no_pool** | No connector vintage; no `data/COPPER/`. Only unvintaged secondary relays. Monthly origin-level absorption and stock-change data not obtainable at all |
| `copper-scrap-supply` | `copper.scrap-supply` | orb 01 | **unusable — no_pool** | Growth rates only; no absolute secondary tonnage, no grade or geography split, no numeric scrap-spread. One assessor reachable → required dispersion not measurable |
| `copper-concentrate-tcrc` | `copper.concentrate-tcrc` | orb 01 | **unusable — no_pool** | Benchmark and two spot prints relayed second-hand from different dates; one current assessor (SMM) → dispersion not measurable |
| `copper-visible-inventory` | `copper.visible-inventory` | orb 02 | **unavailable** | No connector; no ≥5-year weekly warrant-status history. Single-date secondary readings across 8 timestamps |
| `copper-inventory-accessibility-opacity` | `copper.inventory-accessibility-opacity` | orb 02 | **unavailable** | No primary off-warrant / bonded / off-exchange disclosure; SMM bonded articles could not be dated to 2026 and were excluded. Hidden stocks explicitly **not** set to zero |
| `copper-refined-balance` | `copper.refined-balance` | orb 02 | **unavailable** | Only secondary reporting of ICSG, failing internal reconciliation by **221 kt** with opposite signs; revisions not retained |
| `copper-energy-transition-demand` | `copper.energy-transition-demand` | orb 02 | **unavailable** | No primary deployment volumes (GW, EV units) and no primary intensity coefficients (t Cu/GW, t Cu/vehicle). A bridge needs both legs; neither is held |
| `copper-supply-restrictions-routing` | `copper.supply-restrictions-routing` | orb 04 | **UNUSABLE — FAILED** (`missing:copper.supply-restrictions-routing:no-primary-vintage`) | No accepted vintage; no primary government/customs tonnage series retrievable (USGS MCS 2026 HTTP 403). §1/§3 restriction facts are unvintaged secondary context and do **not** satisfy the row |

Orb 03 (`commodity-weather-seasonality`) owns no required series and correctly asserts no tonnage.

### Checklist items that are "Not proven from available data"

1. **Globally accessible supply** — `not_assessable`; the pre-policy exportable base does not exist.
2. **Origin-level pre-policy exportable supply** — `not computable` for Chile, Peru, the DRC and Indonesia (domestic absorption not sourced for any of them). **Not zero.**
3. **The full-year 2026 refined balance direction** — two candidate readings, opposite signs.
4. **The DRC 2026 country production total** — ~14% of world supply, published in nothing read this run. Only Kamoa-Kakula could be sized (290–310 kt vs 380–420 kt previously guided; **−100 kt** at midpoint).
5. **Peru's 2026 figure** — one quarter (Q1 688 kt) annualised on the 2025 quarterly share; error not boundable.
6. **Chile's H1 attribution** — rests on an **inferred** 50/50 seasonal split (H1-2025 actual not sourced). The direction survives a wide error on that split; the 127% / −27% figures do not.
7. **The true global buffer** — bonded and off-warrant material unmeasured; every cover figure is a **lower bound**.
8. **The energy-transition demand bridge** — copper's whole strategic case is unmeasured by this module. Not a footnote: **the strategic horizon has no quantified demand driver here.** (And it would be a *decomposition* of the 28.67 Mt refined usage, never an addition to it.)
9. **Restricted / stranded / rerouted tonnage** — restricted claimed only as an upper bound (~75 kt/yr DRC contained); stranded **none**; rerouting **none verified**.
10. **Direct-melt scrap** — absent from the world bridge entirely; real metal supply that never touches a refinery and that no reachable source sizes.
11. **State stockpiling** (China NFSRA / SRB, US) — directionally supportive, **unquantified in tonnes by construction** (timing and quantity officially confidential).
12. **Scrap-spread, TC/RC dispersion, and the Grasberg shortfall** — direction-only, not measurable, and contested by 26 kt respectively.
13. **Maritime chokepoint exposure and CBAM coverage** — **"none found", not "proved zero"**; neither the flow-share data nor the CBAM Annex I text was retrieved.

**Single highest-value data need:** a **lawful ICSG monthly-bulletin route** (or a licensed equivalent) delivering world refined production, usage and balance **in tonnes with revisions retained**. It would fix the balance sign, the monthly mine/refined bridge and the secondary-production split in one series. Second: **LME / COMEX / SHFE warrant-status warehouse history**, ≥5 years weekly, plus a China bonded-zone stock series.

---

## Note to the Commodity Thesis

- **Balance: not established for full-year 2026 — the reported ICSG surplus (+96 kt) and its own reported growth rates (−125 kt implied) disagree by 221 kt with OPPOSITE signs, so no sign may be published.** What is observable: the realised period ran a surplus (Q1-2026 +396 kt, ~2.9× Q1-2025), and it landed in visible metal (+401 kt three-exchange build end-2025 → end-May-2026). Supply is **flat in total tonnes while the smeltable concentrate stream falls (−1.1% y/y Q1-26) and SX-EW (+3.3%) and scrap-based refined (+5.6%) rise** — do not restate this as "supply falling". Demand is decelerating: +0.8% realised Q1 against a +1.6% full-year forecast already cut from +2.1%, needing ~+1.9% over nine months to hold.
- **Buffer (carry this shape, not a single number): comfortable in aggregate, thin where it clears.** ~968.4 kt visible three-exchange = **12.3 days** of world use, **+30.1% YTD**, LME total at the **46th percentile of 19 years** — mid-range, not tight. But **69.8% sits in COMEX/US warehouses** behind the Section 232 cathode question, leaving **3.7 days ex-US** and an LME **on-warrant** slice of **1.4 days that fell 35.8% in one week**, with **50.52% of LME stock already cancelled** (2026-08-21). The 968.4 kt total is **LME 235.6 (2026-08-27) + COMEX registered+eligible 676.1 (2026-08-25) + SHFE warrant 56.7 (2026-08-19)** — an approximation across 8 days and three non-fungible grade regimes. **China bonded and LME off-warrant stocks are NOT MEASURED and are not assumed zero, so every cover figure is a lower bound and the ex-US tightness read is the module's most fragile conclusion.**
- **Policy killer risk for §8: the overdue US Section 232 determination on REFINED copper. EXPIRY: NONE — undated and open; the 2026-06-30 deadline was missed and is 59 days overdue with no new date.** Flip triggers: **bull** = a Federal Register proclamation imposing ≥15% with an effective date on or before 2027-01-01 (market-implied odds 14.6% for 15% by Jan-2027; 37% for 30% by Jan-2028); **bear** = a published determination not to impose a duty, or 2027-01-01 passing with no duty in force (which would require the COMEX–LME spread to fall ~US$497/t, ~91%, from US$547/t toward the ~US$50/t long-run average). **Carry the qualifier intact: killer-risk present but TWO-SIDED, and orb 04 establishes NO PROVEN CRITICAL RISK — under §11 nothing in this module may be used to force `Avoid`.** The loud headlines restrict almost no copper: DRC's concentrate ban ≈ **0.36% of world mined copper**, Indonesia's ban changes export **form**, Russian metal is **exchange-ineligible, not lost production**. The exposure is **location**, not quantity.
- **Score and coverage: final supply-demand directional-conviction score 35/100** (raw 35, deterministic opacity **HIGH**, cap 45, reason "primary coverage below 70%"). This measures **confidence in the separately stated balance direction — it is not a bullishness or a tightness reading.** Inputs: measured primary-source production coverage **0.0%** (zero primary documents read; five retrievals failed), dispersion 0.56% (which understates the real 1.4pp growth-rate disagreement), lateness 1 cycle. **All eight required semantic series owned by this module are unusable**, every figure is unvintaged live-web context that cannot lift sufficiency (§8A), the origin bridge closes for no origin, and **globally accessible supply is `not_assessable`** — the mechanical consequence upstream is `Research More`, and the terminal thesis owns that call.
- **Weather is NOT the swing factor here** (orb 03: not a driver, neutral). The one dated weather item to carry is probabilistic and two-sided: NOAA CPC El Niño Advisory (2026-08-13), July Niño-3.4 **+1.4°C**, **>90%** chance of a very strong event into NH winter 2026-27, window **Dec-2026 – Mar-2027**, overlapping the **6 Feb 2027** Lunar New Year demand trough. Heavy Andean rain would interrupt mine output (price-positive) while above-normal Chilean precipitation would ease the water constraint on concentrators (price-negative). **Unrealised, unsized, and its tonnage belongs to orb 01 — do not double-count it.**
