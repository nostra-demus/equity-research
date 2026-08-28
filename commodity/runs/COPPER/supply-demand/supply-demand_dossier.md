# supply-demand Module Dossier — COPPER

> Deterministic, lossless concatenation of every artifact in this module — the module synthesis and every specialist output, in order. Generated mechanically (no LLM rewriting), so nothing is omitted or paraphrased. This is the module's "see everything" tier; the module's decision lives in `99_*-synthesis.md` and the short read in `supply-demand_memo.md`.

- Generated: 2026-08-28T13:58:18Z
- Module folder: `supply-demand`
- Contents: 1 module synthesis + 4 specialist outputs = 5 files

## Table of Contents

- [supply-demand — module synthesis](#supply-demand-module-synthesis) — `99_supply-demand-synthesis.md`
- [supply-demand / 01_commodity-supply.md](#supply-demand-01-commodity-supply-md) — `01_commodity-supply.md`
- [supply-demand / 02_commodity-demand-inventory.md](#supply-demand-02-commodity-demand-inventory-md) — `02_commodity-demand-inventory.md`
- [supply-demand / 03_commodity-weather-seasonality.md](#supply-demand-03-commodity-weather-seasonality-md) — `03_commodity-weather-seasonality.md`
- [supply-demand / 04_commodity-supply-security.md](#supply-demand-04-commodity-supply-security-md) — `04_commodity-supply-security.md`


---

## supply-demand — module synthesis

_Source: `99_supply-demand-synthesis.md`_

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



---

## supply-demand / 01_commodity-supply.md

_Source: `01_commodity-supply.md`_

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



---

## supply-demand / 02_commodity-demand-inventory.md

_Source: `02_commodity-demand-inventory.md`_

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



---

## supply-demand / 03_commodity-weather-seasonality.md

_Source: `03_commodity-weather-seasonality.md`_

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



---

## supply-demand / 04_commodity-supply-security.md

_Source: `04_commodity-supply-security.md`_

# Supply Security & Policy Register — COPPER

**Run date:** 2026-08-28 · **Run root:** `commodity/runs/COPPER/` · **Profile read:** `frameworks/commodity/COMMODITY_PROFILES.md` §`## COPPER` (lines 318–389) · **Rules read:** `CLAUDE.md`, `.claude/agents/commodity/MODULE_RULES.md` (§8, §8A, §9) · **Sibling read:** `commodity/runs/COPPER/market-structure/01_commodity-instruments.md`, `.../02_commodity-price-curve.signals.json`.

**Evidence status — read before any number below.** This orb carries **no accepted connector vintage**. The swarm pulse quote transport is dead (`PULSE-MISSING`, EPERM) and the sibling triage records **0 of 22 required semantic series usable**. Every figure below is (a) a live public web fact, dated and labelled **UNVINTAGED / unverified**, or (b) my own arithmetic, labelled **inference**. Under MODULE_RULES §8A this material **may explain context but cannot raise sufficiency or conviction**, cannot fill a coverage row, and cannot support a rated call. Four attempts to read primary documents directly — the USGS *Mineral Commodity Summaries 2026* copper chapter (`pubs.usgs.gov`), two trade-press primaries and CNBC — returned **HTTP 403**, so several figures are cited to the **secondary summary I actually read** (§5: cite the source the number came from), and are flagged as not verified against the primary.

**No proven critical risk is established by this orb.** Under MODULE_RULES §11 a proven, cited, critical risk is the only thing that can force `Avoid` instead of the `Research More` the run's `not_assessable` distribution otherwise mandates. The dominant policy item here (§2) is an **undated two-sided binary**, not a proven one-way threat to capital: it can reprice copper hard in *either* direction. **Nothing in this report should be used to force `Avoid`.**

**Required-series record (MODULE_RULES §8A).**

| Need ID | Stable series ID | Owner orb | Status | As-of | Retrieval / vintage ID | Exact reason if unusable |
|---|---|---|---|---|---|---|
| `copper-supply-restrictions-routing` | `copper.supply-restrictions-routing` | commodity-supply-security (this orb) | **UNUSABLE — failed** | 2026-08-28 | none (`missing:copper.supply-restrictions-routing:no-primary-vintage`) | No accepted connector vintage exists in this run and no primary government/customs tonnage series was retrievable (USGS MCS 2026 copper chapter HTTP 403). The restriction and rerouting facts in §1 and §3 are unvintaged secondary web evidence with as-of dates; they are visible context and explicitly do **not** satisfy this row. |
| `copper-mine-prepolicy-supply` | `copper.mine-prepolicy-supply` | commodity-supply (orb 01) | **UNUSABLE — not produced this run** | n/a | none | Orb 01's output does not exist in `commodity/runs/COPPER/supply-demand/`. The pre-policy exportable base that §9 requires my bridge to start from is therefore absent; §3 restates a labelled, sourced substitute base and refuses to derive percentage shares off an unsourced denominator. |

---

## 1. Register (live + scheduled only)

Scores are for the **copper price**: *Supportive* = pushes price up, *Neutral* = no clear net price effect (or it changes the *form* or *location* of metal rather than the quantity), *Killer-risk* = capable of a large, sudden move, in the sense of §24 (the survival tail), not necessarily a move down.

| Family | Entry | Effective | Expiry | Commodities hit | Score | Bull trigger | Bear trigger | Source, date |
|---|---|---|---|---|---|---|---|---|
| Trade restriction (tariff) | **US Section 232, Proclamation 10962** — 50% duty on **semi-finished** copper products (pipe, wire, rod, sheet, tube) and copper-intensive derivatives. **Refined cathode, ore, concentrate, matte, anode and scrap are exempt.** | 2025-08-01 (proclamation signed 2025-07-30) | Open-ended | Copper semis / derivatives; **not** refined cathode | **Neutral** for global refined copper — it taxes *fabricated goods*, and removes **zero** refined tonnes from world supply. Supportive only for US-delivered fabricated product | Scope widened to cover refined cathode (see next row) | Formal revocation, or a court striking the Section 232 action down | [Federal Register, "Adjusting Imports of Copper Into the United States", doc. 2025-14893, published 2025-08-05; Proclamation 10962 signed 2025-07-30 — UNVINTAGED, read via search result text] |
| Trade restriction (tariff) | **June-2026 modification** — tariffs assessed on the **full customs value** rather than a "artificially low foreign price"; products containing **≤15%** steel/aluminium/copper fall out of Section 232 scope | 2026-06-08 (proclamation signed 2026-06-01). *A second secondary source instead dates a full-value 50%-on-semis / 25%-on-derivatives regime to **2026-04-06**, with 10% where ≥95% of the metal is US-sourced. **The two dates conflict and I did not resolve them against the Federal Register**; §4 conservative reading = the tariff is in force at 50% on semis on both readings* | **2027-12-31** (the modification window is stated as running through that date) | Copper semis / derivatives | **Neutral** for the metal; the dated expiry is a scheduled catalyst | Renewal at a higher rate or a lower content threshold | Lapse at 2027-12-31 without renewal | [Crane Worldwide / Troutman Pepper Locke / Peacock Tariff Consulting summaries of the 2026-06-01 proclamation, accessed 2026-08-28; conflicting 2026-04-06 dating from a separate secondary summary — both UNVINTAGED, unverified] |
| Trade restriction (tariff) — **KILLER RISK** | **Pending Section 232 determination on REFINED copper.** The 2025-06-30 Commerce report recommended a phased universal duty of **15% from 2027-01-01** and **30% from 2028-01-01**. Proclamation 10962 required Commerce to give the President a copper-market update **by 2026-06-30** so he could decide. **The deadline was missed and no new ruling date has been set** | Decision **overdue since 2026-06-30** (59 days as of 2026-08-28 — my arithmetic) | **None — undated and open** | Refined copper cathode (the benchmark grade itself) | A Federal Register proclamation imposing a refined duty of **≥15% with an effective date on or before 2027-01-01** | A published determination **not** to impose a refined duty, **or** 2027-01-01 passing with no duty in force | [Federal Register doc. 2025-14893 (recommendation text), 2025-08-05; ING THINK, 2026-06-12; tradingpedia, 2026-08-10 ("White House missed the June 30, 2026 deadline and has not set a new ruling date") — UNVINTAGED, unverified] |
| Export restriction | **US copper scrap export licensing + domestic-sales requirement.** Proclamation 10962 authorised Commerce to require **25% of high-quality US copper scrap** to be sold domestically, plus an **export-licensing** requirement; input materials (ore, concentrate, matte, cathode, anode) **25% in 2027 → 30% in 2028 → 40% in 2029** | Authorised 2025-07-30; **scheduled from 2027**. No implementing Commerce rule was sourced this run | Open-ended once implemented | US copper scrap and copper input materials | Commerce publishes the export-licensing rule with a 2027 start — removes US scrap feed from the seaborne (largely Chinese) market | Rule abandoned, delayed past 2027, or written with wide exemptions | [White House fact sheet, 2025-07-30; Recycling Today; Congress.gov CRS IN12614 — all UNVINTAGED, read via search result text] |
| Export restriction / resource nationalism | **DRC bans exports of copper AND cobalt concentrates.** Joint ministerial order signed **2026-06-29**, immediate effect. One-year export **waivers** permitted "in strategic circumstances"; three-month transition to a new by-product tax regime | 2026-06-29, immediate | Open-ended (waivers up to one year) | Copper concentrate, cobalt concentrate | Extension of the ban to **cathode**, or refusal of waivers to the large operators | Broad waivers issued, or the order suspended (this is the **fourth** iteration of the same policy — 2013, 2019, 2023, 2026 — and the earlier ones did not hold) | [The Oregon Group, published 2026-08-06, reporting the 2026-06-29 order; corroborated by TRT Afrika / Rio Times summaries — UNVINTAGED, unverified] |
| Export restriction (quota) | **DRC cobalt export quota** — 2026 ceiling **96,600 t** contained cobalt, of which **9,600 t** is a strategic quota controlled by the regulator ARECOMS; quota regime running since October 2025 | Oct-2025; 2026 ceiling in force | Annual ceiling, renewed yearly | **Cobalt** (a co-product of DRC copper mines) | Quota cut for 2027 tight enough to make copper-cobalt mines throttle mill throughput | Quota raised or waivers widened | [The Oregon Group, 2026-08-06 — UNVINTAGED] |
| Resource nationalism / downstreaming | **Indonesia concentrate-export ban (downstreaming policy).** PT Freeport Indonesia has exported **no** copper concentrate since its last permit expired at end-2024. The 2025 precedent — a ~**1.27 Mt** concentrate export quota granted with a **higher export duty as a penalty** for the Gresik/Manyar smelter delay — shows the ban is discretionary, not absolute | Permit lapsed end-2024/Jan-2025; ban open-ended | Open-ended | Copper concentrate (Indonesian origin) | Indonesia holds the line while its smelters are impaired, stranding refined output that would otherwise have shipped as concentrate | A new 1.27 Mt-scale export permit — concentrate re-enters the seaborne market and relieves smelter feed tightness | [MINING.COM summaries of the Indonesian ministry decisions and Freeport permit history, accessed 2026-08-28; Kpler, 2025-10-01 (force majeure and permit-expiry context) — UNVINTAGED, unverified] |
| Sanctions | **Russian copper: exchange ineligibility + US import ban.** OFAC determinations **2024-04-12**, effective **2024-04-13**: LME and CME may not accept Russian-origin copper **produced on or after 2024-04-13**; US import of Russian-origin copper prohibited except metal produced **before** that date. The LME states **no Russian-origin copper has been warranted at an LME-listed EU warehouse for over a year**; from **2026-02-25** it requires origin attestations (that requirement is written for Russian *aluminium* in EU warehouses) | 2024-04-13 | Open-ended | Copper, aluminium, nickel | Extension to a full EU/UK **import** ban on Russian refined copper, or secondary sanctions on the buyers who now take it | Sanctions relief in a Russia–Ukraine settlement, allowing re-warranting | [LME notice 24/171 "Warranting and Trading of Russian Metal on the LME", 2024-04; LME "Sanctions and tariffs" page; OFAC FAQ 1168; Baker McKenzie / Steptoe / Cassidy Levy Kent client alerts — read via search result text, UNVINTAGED, unverified] |
| Resource nationalism / permitting | **Cobre Panamá (First Quantum) — mine idle since Nov-2023** after Panama's Supreme Court ruled its concession law unconstitutional. In 2026 the government is weighing a **state mining company taking a 35–40% stake**, or a lease model, with a decision expected **before end-2026**; President Mulino said the decision would be communicated publicly this year | Closure 2023-11; restart decision pending | **2026-12-31** (stated decision window) | Copper concentrate (Panamanian origin) | Decision to keep the mine closed, or a nationalisation structure First Quantum will not accept | Restart approval — adds a large block of concentrate back to the seaborne market. **Preparations are already running:** by end-June 2026 FQM had processed **2.1 Mt** of stockpiled ore for ~**3,200 t** contained copper, with a first shipment expected, and added ~**1,000** employees | [MINING.COM / Northern Miner / Newsroom Panama / SMM summaries, accessed 2026-08-28 — UNVINTAGED, unverified. **The mine's annual capacity was not sourced this run**, so its share of world supply is `not measurable` here] |
| Strategic reserve | **China state stockpiling.** The National Food and Strategic Reserves Administration (formerly the State Reserve Bureau) plans to add **copper**, cobalt, nickel and lithium to state reserves; it has made price inquiries and bid for metal. In Feb-2026 the state-backed metals industry body publicly called for **more copper** in the strategic stockpile | Programme reported 2025-03-21; call to expand 2026-02-03 | Open-ended | Copper (and other battery/industrial metals) | A confirmed SRB purchase tender — a buyer that is price-insensitive by mandate | The same agency **selling** reserves into a price spike, which is its historical playbook | [Bloomberg via MINING.COM, 2025-03-21; Bloomberg, 2026-02-03 — UNVINTAGED, unverified. **Timing and quantity are officially confidential**, so this entry is unquantifiable by construction] |
| Trade policy (demand/feed) | **China: export tax rebate on copper products cancelled** (from Dec-2024) **and import duties cut to zero** — refined copper 2%→0%, copper scrap 1.5%→0%, effective **2025-01-01**; high-purity scrap reclassified out of "solid waste" under GB/T 38471-2019 | Dec-2024 / 2025-01-01 | Open-ended | Refined copper, copper scrap, copper semis | Reversal of the scrap-import liberalisation (would tighten Chinese feed) | Further liberalisation — H1-2026 China copper scrap imports were **1.24 Mt, +8.3% y/y**, i.e. the channel is widening, which eases feed tightness | [Bloomberg Tax; Fastmarkets; Project Blue; Recycling Today (H1-2026 scrap figure) — read via search result text, UNVINTAGED, unverified] |
| Critical-mineral designation | **Copper added to the US Critical Minerals List** — USGS final 2025 list published **2025-11-07**, 60 minerals, copper included for the first time | 2025-11-07 | Open-ended (list reviewed periodically) | Copper | The designation is the statutory hook for further trade, permitting and stockpile action — it makes the refined-tariff path easier, not harder | Removal at the next list review | [US Department of the Interior press release and USGS 2025 list, 2025-11-07, via Recycling Today / MINING.COM / Brownstein summaries — UNVINTAGED, unverified] |
| Trade-flow disruption (inland corridor) | **Peru mining-corridor blockades tied to the REINFO informal-mining regime.** In 2025 blockades in Chumbivilcas interrupted concentrate trucking from MMG's **Las Bambas** (>320,000 t copper in 2024), Glencore's **Antapaccay** and Hudbay's **Constancia** (99,000 t). Blockades were lifted; the government then removed **50,565** miners from the REINFO register, leaving **31,560** | Episode dated 2025-06/2025-07; **currently lifted** | **Expiry not established this run** — I could not source the current REINFO deadline or any live 2026 blockade | Copper concentrate (Peruvian origin) | A new corridor blockade around the next REINFO deadline — on-site production continues but concentrate cannot reach port | Formalisation deal, or the corridor staying open through the next deadline | [MINING.COM / MiningWeekly, 2025-07-02; mining-technology.com; MINING.COM on the REINFO removals — UNVINTAGED, unverified. **This entry is STALE (13 months) and is registered as a recurrence risk, not as a live disruption**] |

---

## 2. Policy killer risk (for the §8 disconfirmation list)

**The single highest-magnitude entry is the overdue US Section 232 determination on REFINED copper.** It dominates every other item in this register for three reasons, and it is genuinely two-sided.

**1. It is the only entry that can move the benchmark grade itself.** Every other trade measure here taxes fabricated goods (semis), restricts a *form* of copper (concentrate), restricts an *exchange's* delivery list (Russian metal), or moves metal between locations. A universal duty on refined cathode prices the world's deliverable grade at the US border and permanently splits the COMEX and LME markets.

**2. It is already carrying an enormous amount of positioning, and the position is undated.** The COMEX-over-LME premium was **19.2 US¢/lb** in mid-August 2026, described as **~8.4×** its 2005–2025 average. *My arithmetic:* 0.192 × 2,204.62 = **US$423/t**, and 19.2 ÷ 8.4 = 2.29 US¢/lb = **US$50/t** as the implied long-run average. The sibling price-curve orb independently measured the same spread at **+US$547/t (+3.8%)** on 2026-08-26 — the two are not equal and I am **not** averaging them; they are different dates on different legs (COMEX front vs LME 3M), and both are unvintaged. For scale, the same spread peaked near **US$2,937/t** in late July 2025 and was about **US$400/t** in early June 2026. Behind that spread sits the physical positioning: **more than 200,000 t** of copper arrived in the US in **July 2026**, the largest month in IHS Markit shipping data back to 2014; combined COMEX and LME inventories exceed **740,000 t**, with a further **110,860 t** in private US port storage. [Bloomberg, 2026-08-03; tradingpedia, 2026-08-10; sibling orb `02_commodity-price-curve.signals.json`, 2026-08-26 — all UNVINTAGED.]

**3. It has no date.** Proclamation 10962 fixed **2026-06-30** as the day Commerce had to report so the President could decide. That day passed **59 days ago** (2026-06-30 → 2026-08-28, my arithmetic) with no proclamation and no new deadline. An undated binary with this much money leaning on it is precisely the §24 survival tail: the repricing arrives overnight, and the holder does not get to choose the day.

**The dated flip, written so it can fail (§17).**

- **Bull flip (price-supportive, US-located metal):** a Federal Register proclamation imposing a refined-copper duty of **≥15% with an effective date on or before 2027-01-01**. *Comparable:* the status quo since 2025-08-01, which is a **0%** duty on refined cathode. *Can it fail?* Yes — as of 2026-08-28 nothing has been published, and a market-implied read put the odds of exactly this at **14.6%** for a 15% duty by Jan-2027 (rising to **37%** for a 30% duty by Jan-2028) [FXStreet summary of Société Générale, 2026-08-10 — broker research, verdict-stripped per MODULE_RULES §2, UNVINTAGED]. That is a genuine test, not a rubber stamp.
- **Bear flip (price-negative for the US leg):** a published determination **not** to impose a refined duty, **or** 2027-01-01 arriving with no duty in force. *Comparable:* the same 0% status quo. *What it implies, with the arithmetic shown:* the COMEX–LME spread would have to fall from **US$547/t (2026-08-26)** toward the **~US$50/t** implied long-run average — a fall of about **US$497/t, or ~91%** of the current spread (my arithmetic). Separately, the **>740,000 t** of US-located metal becomes an ex-US overhang **only to the extent it can be economically re-exported**, which is not established here (see §3).

**Honest limit on this call.** This is a **two-sided** binary, not a one-way threat. It is therefore *not* the "proven critical risk with a cited source" that MODULE_RULES §11 requires to force `Avoid`. It is a killer risk in the §24 sense — a large, sudden, undated repricing — and it belongs in the disconfirmation list on both sides.

---

## 3. Pre-Policy to Globally Accessible Supply Bridge

**The base this bridge is supposed to start from does not exist this run.** MODULE_RULES §9 requires me to start from `commodity-supply`'s pre-policy exportable figure. Orb 01 produced no output in this run and `copper.mine-prepolicy-supply` is unusable, so **there is no pre-policy exportable base to net against, and I will not invent one.** I therefore report each restriction in **absolute tonnes of contained copper**, and I refuse to publish a "% of world supply" for any row where the denominator is not sourced. Where a share *is* computable from two cited figures, I print the arithmetic and label it inference.

**What I have deliberately NOT deducted, to avoid double-counting production (§9):** Cobre Panamá's lost output (offline since Nov-2023) and Grasberg's lost output (force majeure Sept-2025, phased restart from Q2-2026, pre-incident rates not before 2027) are **production** facts owned by `commodity-supply`. They appear in §1 as policy/legal *causes* with a **zero** deduction in this bridge.

| Origin/route | Pre-policy exportable | − restricted/sanctioned | − stranded | + verified rerouting | Globally accessible | Coverage / dispersion / timing | Source/date |
|---|---:|---:|---:|---:|---:|---|---|
| **DRC — concentrate stream** | Q1-2026 exports: **53,926 t** of concentrate containing **18,863 t** copper metal (alongside **696,725 t** of cathode). Annualised ≈ **75 kt/yr** contained Cu (my arithmetic, ×4) | **Up to 18,863 t/quarter** legally prohibited from 2026-06-29 | **Not measurable.** Domestic smelting capacity exists (Kamoa-Kakula: 500 kt/yr, running at ~60% in Q1-2026) but the order's stated purpose is to force local power and smelting fixes, which implies a shortfall | **Form-change, not a reroute.** Concentrate blocked at the border can be smelted domestically and exported as **cathode**, which is unrestricted. That is a change of product form inside the same country, not a rerouted cargo, and it carries no destination discount or transport-delay penalty | **Net deduction: not measurable; upper bound ~75 kt/yr contained Cu** if none of it is absorbed domestically | Primary coverage **0%** (no customs vintage; single secondary source). Dispersion **not measurable** (one estimate only). Timing: order signed 2026-06-29, reported 2026-08-06 — 38-day reporting lag | [The Oregon Group, 2026-08-06 — UNVINTAGED, unverified] |
| **DRC — share arithmetic (inference)** | — | — | — | — | Concentrate was **2.6%** of copper in DRC reported export streams (Q1-2026); DRC is **~14%** of world **mined** copper (2025). *My arithmetic:* 0.026 × 0.14 ≈ **0.36%** of world mined copper. **Inference, not a filing.** The headline "DRC bans copper exports" is therefore **not** a ban on the ~14% — it is a ban on roughly a third of one percent | | | | Both inputs from the same single secondary source, so this share inherits **0% primary coverage** and cannot be cross-checked | [The Oregon Group, 2026-08-06] |
| **Russia — refined copper** | **Not sourced this run** | Post-2024-04-13 Russian production is **ineligible for LME/COMEX warranting** and **banned from US import** | **Zero production is stranded by this.** Exchange delivery ineligibility is **not** lost production (§9). The metal is produced and sold; it simply cannot become a Western warrant | Rerouting to non-sanctioning buyers is the well-reported mechanism, but **I obtained no tonnage, destination, discount, transport-delay or settlement/insurance evidence**, so it is **not verified rerouting** and I claim none | **No deduction taken.** The correct read is a **relocation of deliverable stock away from the LME/COMEX systems**, not a reduction in world supply | Primary coverage **0%** for tonnage (LME/OFAC notices establish the *rule*, not the *volume*). Dispersion **not measurable**. Timing: rule effective 2024-04-13, i.e. 2.4 years of accumulated effect that this run cannot size | [LME notice 24/171, 2024-04; OFAC determinations 2024-04-12; LME "Sanctions and tariffs" page — UNVINTAGED] |
| **US — Section 232 semis tariff (in force)** | n/a | **Zero refined tonnes restricted.** Cathode, ore, concentrate, matte, anode and scrap are exempt | Zero | n/a | **No change to globally accessible refined supply** | Primary coverage **0%** (Federal Register text read via search-result summary, not fetched) | [FR doc. 2025-14893, 2025-08-05] |
| **US — metal pulled in ahead of the pending refined decision** | n/a | Zero (no duty on cathode today) | **Conditionally stranded, not stranded.** **>200,000 t** landed in July 2026 (record since 2014); **>740,000 t** in combined COMEX+LME stock; **110,860 t** in private US port storage. This metal is legally free to move **today** | **No verified rerouting claimed.** For any of this to return to a non-US buyer it must clear freight back out of the US at a workable spread; **I have no re-export cost, destination, discount or delay evidence**, so I do not credit it as accessible to ex-US buyers | **Accessible today; becomes structurally trapped inside the US border if a refined duty lands.** This is a **location** risk created by policy, not a quantity loss | Primary coverage **0%**; the inventory series itself (`copper.visible-inventory`) is owned by `commodity-demand-inventory` and is **unavailable** — quoted here as policy context only, not re-voted as an inventory signal (§8, one fact one owner). Dispersion **not measurable**. Timing: July-2026 flow, reported 2026-08-03 | [Bloomberg, 2026-08-03; tradingpedia, 2026-08-10 — UNVINTAGED] |
| **Indonesia — concentrate** | **Not sourced this run** (2025 precedent quota was ~1.27 Mt of *concentrate*, not contained metal) | Concentrate exports prohibited under the downstreaming policy; **no exports since the permit lapsed at end-2024** | **Zero incremental deduction here.** The Indonesian tonnes actually missing from the market in 2026 are missing because of the **Grasberg incident** (a production fact owned by orb 01), not because of the export rule | The policy's intent is that the same copper leaves as **cathode** from domestic smelters — again a form-change, not a reroute. Whether that actually happened is a smelter-throughput question this run cannot answer | **No deduction taken** | Primary coverage **0%**. Dispersion **not measurable**. Timing: permit lapsed end-2024, i.e. 20 months of policy in force that this run cannot size | [MINING.COM permit-history summaries; Kpler, 2025-10-01 — UNVINTAGED] |
| **Panama — Cobre Panamá** | **Not sourced this run** (annual capacity not obtained) | Mine idle by court ruling since 2023-11 | **This is lost production, owned by orb 01 — zero deduction taken here** to avoid double-counting | Stockpile processing has restarted: **2.1 Mt** ore processed for ~**3,200 t** contained copper by end-June 2026, first shipment expected | **No deduction taken** | Primary coverage **0%**. Dispersion **not measurable**. Timing: restart decision expected before **2026-12-31** | [Northern Miner / SMM / Newsroom Panama summaries, accessed 2026-08-28 — UNVINTAGED] |
| **BRIDGE TOTAL** | **Not assessable** | **Not assessable** | **Not assessable** | **None verified** | **Not assessable** | **Primary-source coverage across every row: 0%.** Estimate dispersion: **not measurable** (single source per row — a single estimate has no dispersion, and a fabricated one would be worse than the gap). Release timing: the one hard schedule in this register, the **2026-06-30** Section 232 report, is **59 days late** | — |

**Reconciliation check (§9, no double-counting).** Restricted volume claimed: DRC concentrate only, upper bound ~75 kt/yr contained Cu. Stranded volume claimed: **none**. Rerouting credited: **none**. Every other item in §1 is either (a) a tax on fabricated goods, (b) an exchange-eligibility or import rule that relocates deliverable metal without destroying it, (c) a change in the *form* in which metal is exported, or (d) a production fact belonging to `commodity-supply`. **No tonne is counted twice across the sanctions, chokepoint and exchange-rule families, because only one family produced a countable tonne at all.**

**Net policy tilt: killer-risk present, but two-sided.** The register's live *quantity* restrictions are small and measurable only as an upper bound (~75 kt/yr of DRC contained copper). The register's live *price* risk is large, undated and can fire in either direction (the refined Section 232 decision). Those are different statements and I am not netting them into one adjective.

---

## 4. Clean families

Of the seven policy families this orb sweeps, the following are **not live for copper** and were not force-filled (§24 — a clean register is a valid result):

- **OPEC+ / managed supply — CLEAN.** There is no producer cartel setting copper quotas. Chile's Codelco and the Chilean state operate under a royalty and permitting regime (Ley 21.591, in force since 2024-01-01) that raises the cost of new supply, but no country or group sets a copper production ceiling. [SMM analysis of Chile/Peru policy; Chambers *Mining 2026 — Chile*, accessed 2026-08-28 — UNVINTAGED.]
- **Chokepoint disruption (Hormuz / Suez–Red Sea / Panama Canal / Black Sea) — CLEAN, with an honest caveat.** Copper's main seaborne routes run Chile/Peru → Asia across the open Pacific, and DRC's metal moves overland to Durban, Dar es Salaam or the Lobito corridor. **I obtained no free-source flow share (IMF PortWatch or equivalent) for copper through any named maritime chokepoint this run**, so the correct label is **"none found", not "proved zero"**. The two live *inland* logistics constraints — the Peru mining corridor and the DRC border/rail routes — are registered in §1 rather than hidden here.
- **Carbon-border adjustment — CLEAN, with the same caveat.** No carbon-border measure covering copper was found in this sweep. The EU CBAM's adopted goods list does not, on the evidence I retrieved, include copper. **I did not retrieve the CBAM Annex I text this run**, so this is "none found", not proof of absence, and any 2026 CBAM extension review is an unchecked watch item.
- **Biofuel / blending mandate stack — CLEAN and structurally inapplicable.** Copper is not a feedstock for any fuel-blending mandate. This family exists for the energy and agricultural commodities and does not apply here.

The three families that **are** live for copper — trade restriction/tariff, export restriction and resource nationalism, and sanctions — carry ten of the twelve register entries above, plus one strategic-reserve entry (China, unquantifiable by design) and one critical-mineral designation.

---

**Handoff.** Dated entries for the catalyst calendar: **2026-12-31** (Panama decision window), **2027-01-01** (recommended refined-copper duty start date and the US scrap/input domestic-sales start), **2027-12-31** (expiry of the June-2026 Section 232 modification window), **2028-01-01** (recommended step to 30%), plus one **undated** item — the overdue refined-copper determination, which is the killer risk for the §8 disconfirmation list and, being undated, cannot be calendared at all.
