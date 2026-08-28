# Supply–Demand Module Memo — COPPER

**Verdict: NOT ESTABLISHED for full-year 2026. Realised year-to-date: surplus.** — the same reported ICSG release gives a **+96 kt surplus** headline and, from its own reported growth rates, an implied **−125 kt deficit**: 221 kt apart with **opposite signs**, so no full-year sign may be published [orb 02 §1.4b].

**Memo date:** 2026-08-28 · **Run root:** `commodity/runs/COPPER/` · **Unit:** thousand tonnes (kt) of contained/refined copper metal.

> **Read this first.** `data/COPPER/` does not exist and no accepted connector vintage exists anywhere in this run. **Every figure below is unvintaged live-web context inherited from the four specialists.** Under MODULE_RULES §8A it may explain the situation but **cannot raise data sufficiency or conviction**. Not one primary document was successfully read (five primary retrievals failed: 2× HTTP 403, 3× unreadable binary PDF); every production figure is a trade-press relay of an ICSG / USGS / Cochilco / INE / MINEM figure.

---

## Scores at a Glance

*Higher-is-worse (inverted) rows are labelled. The one score below is a confidence measure, not a market call.*

| Item | Reading (verbatim from the synthesis) |
|---|---|
| **Supply–demand directional-conviction score** | **35/100** (raw 35, deterministic opacity **HIGH**, cap 45, reason "primary coverage below 70%"). §12 band: **weak (21–40)** |
| **Score convention — do not misread** | Higher = **stronger evidence for the separately stated balance direction**. It does **not** mean bullish, tight, or well-supplied. A well-proven surplus and a well-proven deficit could both score highly; this scores low because the direction is contradicted by its own source |
| **Score cap applied** | **45** (deterministic, opacity HIGH). **It does not bind** — raw 35 already sits below it. A cap can only reduce a score, never raise one |
| Measured primary-source production coverage | **0.0%** (0 kt of current primary-observed production ÷ 23,500 kt world production) |
| Estimate dispersion | **0.56%** (n=2) — **must not be read as agreement**; both estimates anchor on a ~23 Mt base and are not independent. Matched-basis alternatives: 1.93% on the 2025 level; **1.4pp on the 2026 growth rate (8× relative spread)** on the quantity that decides direction |
| Release cycles late (inverted — higher is worse) | **1** (below the >2 trigger, so it does not independently trigger the cap) |
| Required semantic series owned by this module | **All eight unusable** (§8A) — see the specialist lines below |
| Globally accessible supply | **NOT ASSESSABLE** — the pre-policy exportable base does not exist this run |
| §24 Avoid-Big-Risks read | **Killer risk present but TWO-SIDED; NO PROVEN CRITICAL RISK established** (orb 04). Under §11 **nothing in this module may be used to force `Avoid`**. Clean families are recorded as **"none found", NOT "proved zero"** (maritime chokepoints, CBAM); OPEC+-style managed supply and biofuel mandates are structurally inapplicable |
| Mechanical consequence upstream | **`Research More`** (from `not_assessable` coverage) — the terminal thesis owns that call |

---

## What This Module Found

The full-year 2026 balance direction is **not proven from available data**, and the module refuses to publish a sign. The reason is not a derivation error: orb 02's method check reproduces 2025 to within 35 kt (+213 kt derived vs +178 kt reported), so the 221 kt gap in 2026 is an inconsistency **in the reported figures themselves**. `copper.refined-balance` is recorded **unusable**, not carried at +96 kt.

What *is* observable is that the **realised** part of 2026 ran a surplus, on two partly independent reads: Q1-2026 printed **+396 kt** (386 kt seasonally adjusted), roughly 2.9× the +135 kt of Q1-2025 [ICSG Q1-2026 prelim via SMM, 2026-05-23 — UNVINTAGED]; and visible three-exchange stock rose **+401 kt** from end-2025 (744.1 kt) to end-May-2026 (1,145.0 kt). Setting a 3-month flow against a 5-month stock change is a period mismatch (§15), so the surplus is established only as the **same order of magnitude** as the visible build — a coarse finding, stated as coarse.

The supply story is a three-way split, and it must travel whole: total mine tonnes are **FLAT** (+0.2% Cochilco / +1.6% ICSG for 2026) **while the smeltable concentrate stream is FALLING** (−1.1% y/y, Q1-2026) **and SX-EW cathode (+3.3%) and scrap-based refined output (+5.6%, Jan–May) are RISING**. This is **not** "copper supply is falling" — the world total is held up by material that never enters a smelter. Spot treatment charges of **−US$182.14/dmt** (2026-08-21), against a **US$0/t** 2026 benchmark and US$21.25/t in 2025, are *consistent with* that concentrate shortfall but are **not measured against it**: no elasticity was sourced, so **0% is arithmetically attributed and 100% is residual**.

The buffer is **comfortable in aggregate and thin where it has to clear — the same metal in the wrong place.** The **~968.4 kt** visible three-exchange total is **LME 235.6 kt total (2026-08-27) + COMEX registered+eligible 676.1 kt (2026-08-25) + SHFE warrant 56.7 kt (2026-08-19)** — an **approximation** across 8 days (24 for the COMEX split) and three non-fungible grade regimes. That equals **12.3 days** of world use, **+30.1%** against end-2025, with LME total at the **46th percentile of 19 years — mid-range, not tight**. But **69.8%** sits in COMEX/US warehouses behind the Section 232 cathode question, leaving **3.7 days ex-US** (LME total + SHFE warrant = 292.3 kt) and an **LME on-warrant** (genuinely deliverable) slice of **107.05 kt = 1.4 days that fell 35.8% in one week**, with **50.52% of LME stock already cancelled** — earmarked to exit, not deliverable (2026-08-21).

The single biggest swing factor is **not weather** (orb 03: not a driver, neutral) — it is the **overdue US Section 232 determination on refined copper**, an undated binary that can move ~740 kt of US-located metal between "accessible to the world" and "trapped inside a border" **without changing a single tonne of production**. The exposure is **location, not quantity**.

The most fragile conclusion here is the ex-US tightness read: **China bonded and LME off-warrant stocks are NOT MEASURED and are explicitly not assumed to be zero**, so every cover figure is a **lower bound**. Bonded articles reachable this run spanned 55.5 kt to 219.8 kt — a factor of four — and could not be dated to 2026, so they were excluded.

---

## The Specialists, Briefly

- **Orb 01 — commodity supply.** Total mine tonnes flat (world 23,500 kt 2026e), concentrate falling, SX-EW and scrap rising; **zero primary documents read**; every origin's pre-policy exportable cell is **`not computable`, not zero** (domestic absorption unsourced for Chile, Peru, DRC, Indonesia). Three series unusable — `mine-prepolicy-supply`, `scrap-supply`, `concentrate-tcrc`.
- **Orb 02 — demand & inventory.** Found and published the 221 kt balance contradiction; demand decelerating (**+0.8% realised Q1** against a **+1.6%** full-year forecast already cut from +2.1%, needing ~**+1.9%** over the remaining nine months). Four series unavailable, including `refined-balance` and the whole `energy-transition-demand` bridge.
- **Orb 03 — weather & seasonality.** **Not a driver, neutral.** Copper is "NOT a weather commodity". Owns no required series and correctly asserts no tonnage; explicitly declined the circulating "~1.6 Mt of capacity at suspension risk" figure as unsourced.
- **Orb 04 — supply security.** Section 232 refined determination is the killer risk; the loud headlines restrict almost no copper (DRC concentrate ban ≈ **0.36% of world mined copper**, inference; Indonesia's ban changes export **form**; Russian metal is **exchange-ineligible, not lost production**). Its series is **FAILED**; primary coverage **0% across every row** of its bridge.

**The most important disagreement, and its resolution.** The aggregate buffer looks comfortable while the accessible buffer looks thin. The synthesis does **not** net them: four figures in its own tables — LME at the 46th percentile, stock +30.1% YTD, LME +77 kt y/y, and the +396 kt Q1 surplus — are **all true and none is overturned**. They say the *world* is not short of copper; they do not address *where* the metal is. A tonne in a COMEX vault behind a prospective 15–30% import duty is not available to a European or Chinese buyer at the LME price. Carried as **two linked rows, not averaged**.

---

## What Would Change This Read

| Trigger (dated and capable of failing, §17) | What it would change |
|---|---|
| **Section 232 bull flip:** a Federal Register proclamation imposing a refined-copper duty **≥15% effective on or before 2027-01-01**. Market-implied odds **14.6%** for 15% by Jan-2027; **37%** for 30% by Jan-2028 [FXStreet summary of Société Générale, 2026-08-10 — broker research, verdict-stripped, UNVINTAGED] | US-located metal becomes structurally trapped; confirms the location risk |
| **Section 232 bear flip:** a published determination **not** to impose a duty, or **2027-01-01** passing with none in force | Frees US metal to move — this is the stated falsifier for the "thin accessible buffer" read. Implies the COMEX–LME spread falling ~**US$497/t (~91%)** from **US$547/t** (2026-08-26) toward the **~US$50/t** implied long-run average |
| **Chile's required H2 recovery:** 5,270 kt needs H2 **+38 kt above year-ago** after H1 ran **−6.6% y/y**; evidence is **one month** (INE June-2026, 447,294 t, +5.1% y/y) | *Falsifier:* **July and August INE prints below year-ago make 5,270 kt unreachable** |
| **Demand:** the year must run ~**+1.9%** over nine months against **+0.8%** realised in Q1 | Would settle whether the +1.6% forecast holds |
| **El Niño — probabilistic, unrealised, two-sided.** NOAA CPC Advisory (2026-08-13): July Niño-3.4 **+1.4°C**, **>90%** chance of a very strong event into NH winter 2026-27; window **Dec-2026 – Mar-2027**, overlapping the **6 Feb 2027** Lunar New Year demand trough | Heavy Andean rain would interrupt mine output (price-positive); above-normal Chilean rain would ease the water constraint on concentrators (price-negative). Escalation trigger: a **named, dated suspension of more than ~two weeks at a top-10 asset**, sourced to the operator or COCHILCO. **Tonnage belongs to orb 01 — do not double-count** |
| Other dated calendar items | **2026-12-31** Cobre Panamá decision window; **2027-01-01** recommended duty start; **2027-12-31** expiry of the June-2026 modification window; **2028-01-01** recommended step to 30% |
| **Single highest-value data need** | A **lawful ICSG monthly-bulletin route** (or licensed equivalent) giving world refined production, usage and balance **in tonnes with revisions retained** — it would fix the balance sign, the monthly bridge and the secondary-production split in one series. Second: **LME / COMEX / SHFE warrant-status warehouse history**, ≥5 years weekly, plus a China bonded-zone stock series |

---

## Bottom Line

- **The 2026 balance direction is not established and this memo does not pick one.** +96 kt reported surplus vs −125 kt implied deficit, 221 kt apart with opposite signs. The realised year-to-date period ran a surplus (Q1 +396 kt); those are two different statements and are not collapsed into one.
- **Biggest reason it could be better than it looks:** the world is not short of copper on the aggregate reads — 12.3 days of visible cover, +30.1% YTD, LME total at the 46th percentile of 19 years — and bonded/off-warrant metal is unmeasured, so every cover figure is a **lower bound**.
- **Biggest reason it could be worse than it looks:** only **1.4 days** of LME on-warrant (deliverable) metal, down **35.8% in one week**, with **50.52%** of LME stock already cancelled, and **69.8%** of the visible total sitting inside the US border.
- **Missing evidence dominates the score.** Primary coverage **0.0%**, zero primary documents read, **all eight** required series unusable, globally accessible supply **`not assessable`**, the origin bridge closes for **no origin**, and direct-melt scrap is absent from the bridge entirely.
- **The policy read stays two-sided.** The Section 232 refined determination is a killer risk in the §24 survival-tail sense — a large, sudden, undated repricing that can fire in **either** direction — and **no proven critical risk is established**. Nothing here forces `Avoid`.
- **Watch next:** the July and August Chile INE prints (a cheap, dated falsifier), and the Federal Register for any refined-copper determination — **59 days overdue as of 2026-08-28, with no new date set**.

---

## Plain-English Glossary

*Terms used in this memo, in order of first appearance. No new numbers or claims.*

- **kt / surplus / deficit** — kt is a thousand tonnes of copper metal. A surplus means more metal was produced than used in the period; a deficit, the reverse.
- **ICSG** — the International Copper Study Group, the body that publishes the world copper production, usage and balance figures.
- **Unvintaged / secondary relay** — the number was read off a trade-press article rather than the original document, and it carries no verified date-stamped data pull behind it.
- **Concentrate / smeltable stream** — the part-processed rock that must go through a smelter to become metal. **SX-EW** cathode skips the smelter entirely, which is why the total can be flat while the smelter feed falls.
- **Treatment charge (TC/RC, US$/dmt)** — the fee a smelter charges a miner to process concentrate. When it goes negative, smelters are paying for feed rather than being paid to process it.
- **Three-exchange visible stock** — copper sitting in the warehouses of the LME (London), COMEX (US) and SHFE (Shanghai) exchanges, and therefore countable.
- **On-warrant / cancelled / registered / eligible / warrant** — warrant status says whether the metal can actually be delivered against a contract. **On-warrant** (LME) and **registered** (COMEX) metal is deliverable; **cancelled** warrants are earmarked to leave the warehouse and are not deliverable; **eligible** metal sits in an approved vault but is not warranted. These are never added into one number.
- **Bonded / off-warrant stock** — metal held outside the exchange system (notably in Chinese bonded zones). Real metal, not counted here, and explicitly not assumed to be zero.
- **Days of world use / stocks-to-use** — how many days the world could run on the stock on hand at current usage (~78.6 kt/day).
- **Section 232** — the US trade-law process that can impose an import duty; here, a pending decision on whether refined copper is taxed at the US border.
- **Backwardation** — the market paying more for metal now than for metal later, a sign of near-term scarcity (LME cash–3M ~US$248–254/t, cited from the market-structure orb but **not** voted as a supply-demand signal).
- **COMEX–LME spread** — the price gap between US-located and London-located copper; it widens when the market expects a US import duty.
