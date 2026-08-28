# Independent Scenario Pack — COPPER

**Run date:** 2026-08-28 · **Run root:** `commodity/runs/COPPER/` · **Orb:** `commodity-scenario-engine` (layer 3, `commodity-thesis` module) · **Binding rules:** `.claude/agents/commodity/MODULE_RULES.md` §10 (independent distribution before action), §11 (dual-horizon forecast and mechanical action), §8A (coverage gate), §4a (driver attribution); root `CLAUDE.md` §§3–5, 8, 9, 10 (span and conjunction checks), 15, 16, 21.

> **Headline: BOTH horizons are `not_assessable`, and that is this orb's deliverable, not its failure.** No probability, no price target, no expected implementable return, no risk/reward and no classification is published for either the tactical or the strategic horizon. What is published instead is (a) the exact reason each horizon fails, (b) the causal states that a future run with data would have to price, and (c) the four return components that *are* computable, kept strictly separate from the price component that is not.
>
> **Evidence status, stated before any number (§8A).** `data/COPPER/` does not exist. No accepted connector vintage exists anywhere in this run; coverage is frozen at **usable = 0 / 22**; the swarm pulse quote transport is dead (`PULSE-MISSING`, EPERM on the pinned `tsx` runner's IPC pipe). **Every figure below is UNVINTAGED live-web context or arithmetic on it.** It may explain the situation; it cannot fill a coverage row, cannot raise data sufficiency, and cannot lift conviction.
>
> **What I did not do.** I did not reconstruct a return distribution from remembered or approximate copper price levels to fill the envelope the volatility orb could not measure. `03_commodity-volatility-distribution.md` §4a is explicit and I obey it: *"the absence of a bound is not a licence to pick one."* No file in this run is cited as the basis for a numeric price case, because no numeric price case is made.

**Implementable expression: named, because the return components differ by venue and cannot be stated without it.**

| Leg | Instrument | Roll treatment | Collateral | Fees | FX |
|---|---|---|---|---|---|
| **Global view** | **LME Copper Grade A, 3-month** (US$/tonne, 25 t lot, physically settled) | Dated-prompt rolls; cash–3M **backwardation +US$248/t (2026-08-26) ≈ +6.9%/yr to a rolled long**; the orb's own forward band is **+5% to +9%/yr**, mean-reverting by construction | US 3-month T-bill **3.79%** (2026-08-26) on posted margin | Broker commission + LME fees — **NOT OBTAINED** | USD-quoted; **0.00% for a USD-funded book**. Non-USD book: `not assessable` (no funding currency specified, no forward points obtained) |
| **US-delivered / tariff view** | **COMEX `HG` front month** (US¢/lb) | Front-chain **contango ≈ −6.1%/yr to a rolled long** (Sep-26 → Dec-26 +1.524%/92d; Sep-26 → Mar-27 +3.056%/182d). **Sign contested** by two unvintaged quotes implying steep backwardation (≈ −31%/yr, a roll *gain*); §4 conservative default applied — the cost stands for a long, the gain is not banked | Same 3.79% | Direct futures brokerage **NOT OBTAINED**. `CPER` wrapper **0.88%–1.06%/yr** (conservative default: the higher figure) | Same |
| **Not the expression** | `COPX` / `ICOP` / `FCX` | Miner equities are a **levered confirmation, not the metal** (profile rule). There is **no physically-backed copper vehicle** — every listed route pays a roll or takes equity risk | — | — | — |

*Sources for this block: `../market-structure/99_market-structure-synthesis.md` §Curve & carry, §Instruments; `../market-structure/01_commodity-instruments.md`; `../market-structure/02_commodity-price-curve.md` §3a–§3d, §5 — all UNVINTAGED.*

**The venue split is not a footnote — it is roughly 13 percentage points a year of carry on the same metal.** An LME-rolled long and a COMEX-rolled long, both flat on price, do not earn the same return. Any horizon that could be classified would have to be classified **twice, once per venue**, and no orb in this run may state an implementable return without naming the venue first.

---

## 1. Market-implied starting point

**Same current investable price used for both horizons. The two venue prints are two days apart and are NOT averaged — they are different instruments.**

| Reading | Level | As-of | Source / status |
|---|---:|---|---|
| COMEX `HG` front month | **US$6.62/lb** (≈ US$14,595/t) | 2026-08-28 | [Web: TradingEconomics — **UNVINTAGED**, secondary]; `copper.current-price` is **MISSING** (`PULSE-MISSING`) |
| LME Copper Grade A 3-month | **US$14,251/t** (≈ US$6.464/lb) | 2026-08-26 | [Web: wire summary — **UNVINTAGED**]; date **not matched** to the COMEX leg |
| 12-month change (COMEX front) | **+46.63%** (implied US$4.5147/lb a year ago) | to 2026-08-28 | [TradingEconomics — UNVINTAGED] |
| Distance below reported all-time high | ~3% (high US$6.83/lb, Aug-2026) | 2026-08 | `../market-structure/99` |

**What the market appears to expect, read off prices rather than asserted.** Five separate implied statements, each with the assumption it rests on:

1. **New-mine capital costs have inflated ~4.0%–7.6% a year since April 2024**, or the incentive anchor is wrong. The LME leg sits **+9.6% to +18.8%** above the US$12,000–13,000/t incentive band; the COMEX leg **+12.3% to +21.6%** above US$5.44–5.90/lb [`02_commodity-cost-curve-fair-value.md` §4a].
2. **No cost support is anywhere near this price.** At US$6.62/lb a disclosed high-cost producer earns **43%–47%** over its own published AISC (First Quantum US$3.50–3.80/lb, 2026-04-28, PRIMARY) and **58%–83%** over reachable net cash costs [ibid. §4b].
3. **London prices scarcity now; the US prices a term premium later.** LME cash–3M backwardation implies a **convenience yield ≈ 12.2%/yr** — London pays ~12% a year for metal today rather than in three months. COMEX contango prices **US-delivered** metal higher forward, into an undated Section 232 decision [`../market-structure/99` §Curve].
4. **A location premium of +US$547/t (+3.8%) gross** sits on the COMEX leg over LME-3M (dates mismatched by ~2 months; freight, duty and VAT not deducted — it is a gross spread, not "the arb").
5. **One bank's model reads that premium as ~14.6% odds of a 15% duty by 2027-01-01 and 37% of a 30% duty by 2028-01-01** [FXStreet/CNBC/Bloomberg relays of Société Générale — UNVINTAGED, verdict-stripped]. **This is a model output, not a market print**, and under root §10 it is judgment, not a measured frequency. It is carried as an opposing fact and is **not** netted against the risk.

**And the fact that governs everything below: the move has no owner.** The +46.63% twelve-month rise is **~0% explained and ~100% residual** on the market-structure basis (the tariff premium is roughly where it was a year ago, so it explains ≈ +US$0.00/lb of +US$2.11/lb), and **10.0% explained / 90.0% residual** at the *upper bound* of a cost-push story (Codelco direct C1 +21.1 ¢/lb × 1.0 assumed pass-through). Macro explains 0% and pushed the other way (10y real yield **2.36%, +54bp** to a multi-decade high). **Three lenses, three ~100% residuals.** A price whose driver cannot be named cannot have its scenarios anchored on that driver.

---

## 2. Tactical forecast (30–92 days; default 60)

**Status: `not_assessable`.**

**Exact reason (one):** the empirical return envelope this horizon must be spanned against does not exist — `copper.comex-price-history` is **structurally absent** (no price-history connector exists in the registry for any commodity), giving **N = 0 non-overlapping outcomes against the §10 floor of 30** and **0 of 3 required point-in-time regimes** at every tactical grid point, so the mandatory span audit fails before any case can be sized.

**Horizon: 64 calendar days → target date 2026-10-31.** Departure from the 60-day default is catalyst-cited, and the citation is named: the **ICSG biannual autumn-2026 forecast round, window late September → end-October 2026**, is the highest-impact window-dated item in the calendar and the only release that can resolve the **221 kt balance contradiction** (+96 kt reported surplus vs −125 kt implied deficit, opposite signs); its two-way trigger has **fired in both directions across the last two rounds** [`01_commodity-catalysts.md`]. At the 60-day default (2026-10-27) the window's tail is not contained. Also inside 64 days: **LME Week 2026-10-19** and the 2027 benchmark TC/RC talk; the start of the **miner Q3 window (~2026-10-14)**; **FOMC 2026-10-27/28**; **NBS PMI 2026-09-30 and 2026-10-31**. Band check: 64 days sits inside the 30–92-day tactical band — **pass**. Grid check: 64 is **not** an exact grid point, so **conservative bracketing between the 60-day and 75-day tactical grid points** is invoked, both inside the same band; **no cross-gap interpolation** — the 92-to-182-day gap is never crossed. The bracketing is well-formed and it brackets **two empty cells**.

**No scenario table is published, because publishing one would be the fabrication §10 forbids.** What follows is a **causal-state inventory**, not a distribution: no probability is assigned, nothing is weighted, and it may not be carried forward as a scenario set.

| Case (causal state) | Probability | Price target / return | Roll | Collateral | Fees | FX | Implementable return | Causal chain | Conditions / joint basis | Falsifier |
|---|---:|---:|---:|---:|---:|---:|---:|---|---|---|
| **Bear — squeeze relief plus a crowded long with no fuel left** | `not_assessable` | `not_assessable` | see §2a | see §2a | see §2a | see §2a | `not_assessable` (price leg absent) | The 2026-08-24 London delivery stress is already relieving: >20,000 t delivered in on 2026-08-25 (largest one-day on-warrant build since April), on-warrant **+~63 kt over three days (>50%)**, and cash–3M lost **55–68% in two to three sessions** (~US$550/t → US$248/t). Meanwhile speculators sit at the **98.7th percentile of 156 weekly COT reports (+78,648 lots)** of which **52.8% is the *absence* of shorts** (gross short 14.7th pct) — i.e. the short-covering fuel is largely spent — and physical hedgers absorbed **91.9%** of the entire 53,039-lot twelve-month build | **Four independent conditions — see the conjunction audit in §2b. This case must be decomposed, not priced as one.** | On-warrant recovers above **166.8 kt** *and* cash–3M flips to contango (the calendar's own two-way trigger); or COT net length prints a new high above **+79,027 lots** |
| **Base — no variant thesis pays; carry does the work** | `not_assessable` | `not_assessable` | see §2a | see §2a | see §2a | see §2a | `not_assessable` (price leg absent) | Price stays inside its current premium to the incentive anchor and none of the two-way binaries resolves inside 64 days. **Then the return is decided entirely by venue carry, not by copper:** at an unchanged price a COMEX-rolled long loses ~0.6% over 64 days while an LME-rolled long gains ~1.9% (§2a). The incentive-price gap is **descriptive only** at this horizon — greenfield copper takes 10–20 years from sanction, so it has **no catalyst inside 64 days** | **One condition** (current curve shape persists) — but that condition's **COMEX sign is contested by a second source**, so even the single-condition base cannot be stated at conviction | The COMEX chain resolves to backwardation on a vintaged quote (which flips the roll component's sign, ~+13pp/yr swing); or a Section 232 determination lands inside the window |
| **Bull — the one measured pinch-point, single-condition** | `not_assessable` | `not_assessable` | see §2a | see §2a | see §2a | see §2a | `not_assessable` (price leg absent) | **LME on-warrant stock 107.05 kt on 2026-08-27 = 1.4 days of world use**, after a **−35.8%** draw in one week from 166.775 kt, with **50.52% of LME stock already cancelled** and **ex-US cover 3.7 days** against 69.8% of the 968.4 kt visible total stranded in US warehouses. A further **−26.5%** draw takes on-warrant below **78.7 kt = one day of world use**; the preceding week's draw was larger than that, so it is reachable and not automatic | **One condition, one date-proven daily series** (LME warehouse report, 09:00 London, every business day). Deliberately built from the single most powerful driver, **not** the conjunction of every favourable fact | On-warrant back above 166.8 kt with cash–3M in contango; or >20 kt/day deliveries continuing |
| **Killer-risk overlay (two-sided, sits across all three)** | `not_assessable` | **`not_assessable` — identified in kind, unmeasured in magnitude** | — | — | — | — | `not_assessable` | The overdue **US Section 232 refined-copper determination**, due 2026-06-30, **59 days late, no replacement date published**. Duty imposed → ~740 kt of US metal trapped behind a 15–30% border charge, bullish ex-US; duty refused → that metal frees to the seaborne market, bearish ex-US. Reported single-session precedent 2025-07-30/31: **19% / 20% / 22% — three unverified secondary sources that disagree, N = 1, no direction** | **Undated. Cannot be placed inside a 64-day window at all** — see §2c, which is the tactical horizon's sharpest structural problem | A Federal Register proclamation imposing ≥15% effective on or before 2027-01-01 (bull leg); a published determination not to impose (bear leg) |

### 2a. Return components at 64 days — four of five are computable, and they are kept apart from the fifth

**This is a CARRY table, not an expected return.** No price leg is forecast anywhere, so nothing here may be summed into an implementable return. Arithmetic shown so it can be checked; all inputs UNVINTAGED, none conviction-eligible.

| Component | LME-rolled (Grade A 3-month) | COMEX-rolled (`HG` front, direct) | COMEX-rolled (`CPER` wrapper) |
|---|---:|---:|---:|
| **Price** | **`not_assessable`** | **`not_assessable`** | **`not_assessable`** |
| Roll | **+1.210%** (6.9 × 64/365); band **+0.877% to +1.578%** (5%–9%/yr) | **−1.070%** (6.10 × 64/365) — **sign contested**; conservative default applied | −1.070%, **and `CPER` sits in deferred months (Dec-26, May-27), so the Sep→Dec front roll is not its actual roll** |
| Collateral | **+0.664%** (3.79 × 64/365) | +0.664% | +0.664% |
| Fees | **NOT OBTAINED** (broker + LME) | **NOT OBTAINED** (brokerage) | **−0.154% to −0.186%** (0.88%–1.06% × 64/365) |
| FX | **0.000%** (USD book); non-USD book `not assessable` | 0.000% | 0.000% |
| **Sum of the four non-price components** | **+1.874%** (band +1.541% to +2.242%), **before unobtained fees** | **−0.406%**, **before unobtained fees** | **−0.560% to −0.592%** |

**The finding in this table: at an unchanged price the two venues differ by 2.28 percentage points over 64 days, direct-versus-direct and before fees on either side.** That is the same metal, the same 64 days, and the venue choice is larger than most of the price moves a routine data print produces. It is also why "implementable return" is meaningless in this run without a named venue.

### 2b. Conjunction audit — tactical

Root §10 requires an N-condition case to be justified against that conjunction or decomposed. The bear case above needs **four independent things** and is therefore decomposed here; the bull needs **one**.

| Case | Independent conditions | Count | Treatment |
|---|---|---:|---|
| Bear | (i) London delivery stress keeps relieving; (ii) ICSG autumn round raises rather than cuts the surplus; (iii) the 98.7th-pct long actually unwinds rather than sitting; (iv) the tariff binary resolves *against* a duty inside 64 days | **4** | **DECOMPOSE.** Each deserves its own case; (ii) and (iv) have independently proven two-way triggers |
| Base | (i) current curve shape persists | **1** | Stands — but its COMEX sign is contested by a second source |
| Bull | (i) LME on-warrant draws a further −26.5% to below 78.7 kt | **1** | Stands. Built from the single most powerful driver, not a conjunction |

**The audit cannot be completed, and that is a second independent failure.** Decomposition is only half the requirement; the other half is a **joint-probability basis**, which needs a probability for each condition. Every candidate probability in this run is either judgment or one bank's model output (14.6% / 37%) — under root §10 neither is a measured frequency, and the base rate that would supply one is `not assessable` (N = 0 price observations). **So a four-condition bear could not be fairly compared against a one-condition bull even if the price bounds existed.** Comparing them anyway is exactly the artefact §10 exists to prevent.

### 2c. The tactical horizon's sharpest structural problem — the killer risk has no date inside it

The Section 232 determination is **undated**. Its only dated backstop is the **recommended effective date 2027-01-01 = 126 days out** (my arithmetic, 2026-08-28 → 2027-01-01). **126 days falls inside the 92-to-182-day gap** that §11 does not cover and that §10 forbids interpolating across.

- It is **62 days beyond** the tactical horizon (2026-10-31) and **62 days short** of the strategic floor (182 days = 2027-02-26).
- So the largest identified event in the whole run has its only proven date in the one window neither horizon can reach, while the event itself can fire on **any** day — including inside the tactical window, undated.
- **Consequence, stated plainly:** even with a full price history, the tactical killer-risk case would have to be built on an undated binary of unmeasured magnitude. §10 requires the killer-risk outcome to cover the mapped tail/event bound; that bound is `not_assessable` in magnitude and `undated` in timing. **Two independent ways to fail the same test.**

### Tactical arithmetic and classification

- **Weighted price / roll / collateral / fees / FX / implementable return: `not_assessable` on all six.** No probabilities are assigned, so no weighting is performed. The four non-price components are printed **unweighted, per venue, in §2a** and must be read there.
- **Loss probability: `not_assessable`** (no probability mass exists). **Worst downside: `not_assessable`** (the US$3.00–4.00/lb cost band is a *medium-run marginal-supply statement*, explicitly **not** a 64-day level, and the volatility orb's tail bound does not exist). **Risk/reward: `not_assessable`** — and specifically **not** `unbounded`, which is only available when a real distribution has no losing case.
- **Duration-matched cash hurdle: 0.665% over 64 days** = US 3-month Treasury bill **3.79%/yr × 64/365** [Web: TradingEconomics, 2026-08-26 — **UNVINTAGED**]. Duration match: the 91-day bill against a 64-day horizon is the closest instrument obtained; **no 2-month bill quote was obtained**, so the match is approximate and labelled.
- **Classification: `not_assessable`.** The mechanical test (`positive` / `mixed` / `negative`) requires an expected implementable return, a risk/reward and a loss probability. None of the three exists. **The classification is refused, not defaulted to `mixed`.**
- **Confidence: forecast confidence 0/100** (no forecast is published). Confidence in the `not_assessable` determination itself: **88/100** — the blocking condition was verified independently at decision time (pulse EPERM reproduced; connector registry inspected, 27 connectors, no price-history connector for any commodity; `required_series_coverage.json` frozen at usable 0/22).
- **Catalysts (dated, inside 64 days):** LME daily warehouse report (every business day, 09:00 London — the only date-proven high-frequency read of the one measured constraint); CFTC COT every Friday 15:30 ET; ICSG monthly ~2026-09-21 and ~2026-10-21; **ICSG autumn forecast window late-Sept → end-Oct**; China NBS activity ~2026-09-15 and mid-October; NBS PMI 2026-08-31 / 09-30 / 10-31; US CPI 2026-09-11; FOMC 2026-09-15/16 and 2026-10-27/28; LME Week 2026-10-19; miner Q3 window opens ~2026-10-14. **Undated and excluded from the horizon: Section 232.**
- **Falsifiers of this `not_assessable` verdict (what would make the horizon assessable):** a lawful point-in-time daily close history for COMEX `HG` front month, continuous back-adjusted, with source identity and an accepted immutable vintage, **≥3 years** for the tactical grid — plus vintaged regime labels for at least three of the seven listed regimes. Restoring the pulse alone does **not** clear this: the pulse returns one quote, and one quote is not a return series.

---

## 3. Strategic forecast (182–548 days; default 365)

**Status: `not_assessable`.**

**Exact reason (one):** the same structural absence bites harder at this horizon — **N = 0 non-overlapping outcomes against the §10 floor of 30 and 0 of 3 required regimes at every strategic grid point**, and the strategic grid additionally needs **≥10 years** of history for a credible three-regime split, so no matching-regime P10/P90 bound exists for a case to reach.

**Horizon: 365 calendar days → target date 2027-08-28.** The §11 default is used, and the reason it is used is itself evidence: **no citable catalyst supports an alternate strategic date.** The one dated backstop that matters (Section 232 effective 2027-01-01) sits at **126 days — inside the forbidden 92-to-182-day gap**, so it cannot set a strategic horizon. The 2028-01-01 escalation date (30% duty) is **491 days**, inside the 182–548 band, but it is **conditional on a duty first being imposed** — using it as the horizon would smuggle a two-condition conjunction into the horizon definition itself. Rejected on those grounds. Band check: 365 sits inside 182–548 — **pass**. Grid check: 365 is an **exact grid point**, so bracketing is **not applicable**, not skipped. **No cross-gap interpolation.** Inside 365 days: Cobre Panamá decision (on or before **2026-12-31**), Section 232 effective backstop (**2027-01-01**), ICSG spring-2027 round, four FOMC meetings, and the full 2027 benchmark TC/RC settlement.

**No scenario table is published. Causal-state inventory only — probabilities, targets and expected returns are all refused. Nothing below reuses a tactical probability, target or component, because none exists.**

| Case (causal state) | Probability | Price target / return | Roll | Collateral | Fees | FX | Implementable return | Causal chain | Conditions / joint basis | Falsifier |
|---|---:|---:|---:|---:|---:|---:|---:|---|---|---|
| **Bear — the fast supply channels respond to a 43–47% AISC margin** | `not_assessable` | `not_assessable` | see §3a | see §3a | see §3a | see §3a | `not_assessable` (price leg absent) | The reversion channel that can act inside twelve months is **scrap, restarts and substitution — not new mines.** Already dated and live: scrap-based refined output **+5.6% Jan–May-2026**, scrap share of world refined output **17.3% → 17.8%**, China's scrap feedstock share **25.2% H1-2026**; **Cobre Panamá decision window 2026-12-31** (~350 kt/yr idled); named realised aluminium substitution (Ferrari, BMW, EV makers, Daikin, Jun–Jul 2026) with **Cu/Al at 4.2–4.3 against an indicative 3.5–4.0 trigger** — i.e. the substitution ceiling appears to sit *beneath* this market. Realised Q1-2026 balance was a **+396 kt surplus, ~2.9× Q1-2025**; ICSG spring-2026 put 2027 at **+377 kt surplus** | **Three independent conditions** (scrap keeps growing; a restart lands; substitution converts to lost tonnes) — decomposed in §3b. **None is sized in tonnes** | The refined-minus-scrap spread narrowing further (reported "narrowed considerably" June-2026, **direction only, unsized**), which mechanically *reduces* the incentive to feed scrap; a Cobre Panamá deferral or refusal; the Cu/Al ratio falling below ~4.0 |
| **Base — the anchors do not bind, and the driver stays unnamed** | `not_assessable` | `not_assessable` | see §3a | see §3a | see §3a | see §3a | `not_assessable` (price leg absent) | This is the market-implied case and it is uncomfortable: the incentive-price anchor is a **decade-scale** statement (10–20 years from sanction to full production) and therefore says almost nothing about a 365-day price, while the cost floor sits **39.6%–54.7% below** the market. So the base case is *the anchors are silent* — and the thing actually carrying the price is **~100% residual across three independent lenses**. **A base case whose driver cannot be named cannot be forecast, only observed** | **One condition** (no anchor binds within 365 days) — well supported mechanically, and it is precisely the condition that makes the horizon unforecastable rather than forecastable-as-flat | A published, dated, production-weighted cost curve or a rebuilt incentive price that moves an anchor to within reach of the market; or the residual finally attributed to a measured driver |
| **Bull — a proven deficit against 3.7 days of ex-US cover** | `not_assessable` | `not_assessable` | see §3a | see §3a | see §3a | see §3a | `not_assessable` (price leg absent) | The single most powerful upside driver, taken alone: **ex-US cover is 3.7 days and LME on-warrant cover 1.4 days**, against total mine tonnes flat and the concentrate stream **−1.1% y/y**, with Grasberg still ramping from a September-2025 force majeure (pre-incident rates not before 2027) and Cobre Panamá idle since November 2023. If the balance is genuinely in deficit, that buffer is where it shows | **One condition — a proven deficit — but its evidence is self-contradictory:** the same ICSG release gives **+96 kt surplus** as a headline and **−125 kt deficit** from its own reported growth rates, **221 kt apart with opposite signs**, and measured primary-source production coverage is **0.0%** (HIGH opacity, score capped 45) | The ICSG autumn or spring round confirming a cumulative surplus above +600 kt; globally accessible supply proving larger than the visible-stock split implies |
| **Killer-risk overlay (two-sided)** | `not_assessable` | **`not_assessable` in magnitude; DATED at 2027-01-01 for this horizon only** | — | — | — | — | `not_assessable` | Section 232 resolves inside 365 days one way or the other. The **bear leg is partially computable** and §3c does that arithmetic: a no-duty outcome requires the COMEX–LME spread to fall ~**US$497/t (~91%)** from US$547/t toward a ~US$50/t long-run average. The **bull leg** (duty imposed) traps ~740 kt behind a 15–30% charge | **One condition each side, but they are mutually exclusive outcomes of one event** — so they are two cases, never one, and cannot both be counted as support | A Federal Register proclamation (bull leg); a published determination not to impose, or 2027-01-01 passing with no duty in force (bear leg) |

### 3a. Return components at 365 days — same discipline, computed independently of the tactical figures

| Component | LME-rolled (Grade A 3-month) | COMEX-rolled (`HG` front, direct) | COMEX-rolled (`CPER` wrapper) |
|---|---:|---:|---:|
| **Price** | **`not_assessable`** | **`not_assessable`** | **`not_assessable`** |
| Roll | **+6.90%**; band **+5.00% to +9.00%** (the +US$248/t spread is a five-year extreme that already gave back ~half in two sessions; +8.7%/yr at ~$175/t, +5.1%/yr at ~$45/t) | **−6.10%** — **sign contested**; conservative default applied | −6.10%, and **not `CPER`'s actual deferred-month roll** |
| Collateral | **+3.79%** | +3.79% | +3.79% |
| Fees | **NOT OBTAINED** | **NOT OBTAINED** | **−0.88% to −1.06%** |
| FX | **0.00%** (USD book); non-USD book `not assessable` | 0.00% | 0.00% |
| **Sum of the four non-price components** | **+10.69%** (band +8.79% to +12.79%), **before unobtained fees** | **−2.31%**, **before unobtained fees** | **−3.19% to −3.37%** |

**Plain English, and it is the most usable number in this pack: a COMEX-rolled long needs copper to rise roughly 3% over a year just to break even, while an LME-rolled long is paid roughly 9%–13% to hold the same metal.** Both figures are unvintaged, the COMEX sign is contested, and the LME roll mean-reverts by construction — so neither may be banked. They are printed because the components are the part of the return this run *can* decompose, and hiding them behind the missing price leg would be its own dishonesty.

### 3b. Conjunction audit — strategic

| Case | Independent conditions | Count | Treatment |
|---|---|---:|---|
| Bear | (i) scrap supply keeps growing; (ii) a restart (Cobre Panamá) lands with a shipment date; (iii) substitution converts into measured lost tonnes | **3** | **DECOMPOSE.** (i) is already realised and dated; (ii) is a window-dated political decision; (iii) has a 12–36-month design-cycle lag and **zero tonnes sourced**. They do not move together and must not be priced as one case |
| Base | (i) no anchor binds within 365 days | **1** | Stands |
| Bull | (i) a proven deficit | **1** | Stands as a single condition, but the evidence for it is internally contradictory by 221 kt with opposite signs |
| Killer risk | duty imposed / duty refused | **1 each** | Two mutually exclusive cases, never summed |

**Same completion failure as the tactical audit, for the same reason:** decomposition is possible, a joint-probability basis is not — no per-condition probability in this run rises above judgment, and the base rate is `not assessable`.

### 3c. Driver attribution on the killer risk's bear leg (mandatory §4a form)

```
Attribution: COMEX-over-LME gross location basis +US$547/t (+3.8% of US$14,595/t)
  × 1.0 full-unwind — an ASSUMED-BOUND basis, NOT a measured event elasticity
    (no cost-to-price or event elasticity was sourced on any basis)
  [`../market-structure/02_commodity-price-curve.md` §4, spread as of 2026-08-25/26 — UNVINTAGED,
   dates mismatched by ~2 months; freight, duty and VAT not deducted]
  = −3.8% (−US$547/t) against the reported 19% / 20% / 22% single-session precedent of
    2025-07-30/31 [ING Think 2025-07-31; SunSirs 2025-08; secondary trade commentary,
    accessed 2026-08-28 — all unverified secondary, N = 1, sources disagree by 3pp]
  → 17.3% to 20.0% explained, 80.0% to 82.7% residual (unattributed).
```

**The residual is the finding.** Today's *visible* location basis is 3.8%. Unwinding all of it explains at most a fifth of the 2025 precedent. So either that session embedded far more than the visible basis (in 2025 the premium ahead of the exclusion was materially larger than 3.8%), or the secondary magnitudes are wrong — **and this run cannot tell which.** Two consequences, both binding: **(a) the 3.8% figure is not a tail bound** and must not be published as the killer-risk downside; **(b) the 19–22% precedent is not one either** — three sources that cannot agree within three percentage points on an N = 1 event cannot fix a 10th or 90th percentile. **The killer risk stays identified in kind and unmeasured in magnitude.**

### Strategic arithmetic and classification

- **Weighted price / roll / collateral / fees / FX / implementable return: `not_assessable` on all six.** No probabilities assigned; no weighting performed. Non-price components are printed unweighted, per venue, in §3a. **These figures are computed independently of §2a and share no probability, no target and no weighting with it.**
- **Loss probability: `not_assessable`. Worst downside: `not_assessable`. Risk/reward: `not_assessable`** (again: **not** `unbounded`).
- **Duration-matched cash hurdle: `not_assessable` — and this is a second, independent failure worth naming.** No 12-month US Treasury bill or 1-year note quote was obtained anywhere in this run. The only rate held is the **3-month bill at 3.79%** (2026-08-26, UNVINTAGED), which over 365 days gives **3.79%** *only if* the bill is rolled four times at an unchanged rate — an assumption, not a quote, and a **duration mismatch** on its face. It is carried as a labelled proxy, never as the hurdle. **So even if returns existed, the strategic classification could not be computed against a matched hurdle.**
- **Classification: `not_assessable`.** Refused, not defaulted.
- **Confidence: forecast confidence 0/100.** Confidence in the `not_assessable` determination: **88/100** (same verified basis as tactical, plus the additional ≥10-year history requirement the strategic grid imposes).
- **Catalysts (dated, inside 365 days):** Cobre Panamá government decision on or before **2026-12-31**; **Section 232 recommended effective date 2027-01-01**; 2027 benchmark TC/RC settlement around LME Week 2026-10-19; ICSG autumn-2026 and spring-2027 rounds; FOMC 2026-09, 10, 12 and through 2027; DRC concentrate-ban transition ~2026-09-29 (**small: ≈0.36% of world mined copper — do not inflate it**); 2028-01-01 escalation date **excluded** as conditional.
- **Falsifiers of this `not_assessable` verdict:** a lawful point-in-time COMEX `HG` close history of **≥10 years** with an accepted immutable vintage, **plus** ≥3 vintaged point-in-time regime labels (balance labelled from the vintage published *at* each date, never from today's restated ICSG numbers), **plus** a duration-matched 12-month cash instrument quote.

---

## 4. Separate span audits

| Horizon | Test | Required bound | Scenario bound | Pass/fail | Evidence |
|---|---|---:|---:|---|---|
| Tactical 64d | Bear reaches the matching-regime **P10** at the mapped grid point | **DOES NOT EXIST** (N = 0 vs floor 30; 0 of 3 regimes) | none published | **FAIL** | `03_commodity-volatility-distribution.md` §1, §2, §4 |
| Tactical 64d | Bull reaches the matching-regime **P90** | **DOES NOT EXIST** | none published | **FAIL** | ibid. |
| Tactical 64d | Killer-risk case covers the mapped **tail/event** bound | **DOES NOT EXIST** in magnitude; **UNDATED** in timing | none published | **FAIL ×2** | ibid. §3, §3a; §2c above |
| Tactical 64d | Exact-grid or same-band conservative bracketing | 60d and 75d grid points, same band | bracketing well-formed | **PASS (mapping only)** | A correct pointer into two empty cells is still an empty answer |
| Tactical 64d | No cross-gap (92→182) interpolation | not crossed | not crossed | **PASS** | The gap was never approached |
| Tactical 64d | Root §10 **span check** — "what single print moves this 10%+, and which case contains it?" | The Section 232 determination, reported at 19–22% in one session | **no case contains it** | **FAIL** | §2c, §3c |
| Tactical 64d | Root §10 **conjunction check** — joint basis for multi-condition cases | joint probability per condition | **decomposed but not priceable** | **FAIL** | §2b |
| Strategic 365d | Bear reaches the matching-regime **P10** | **DOES NOT EXIST** (N = 0; 0 of 3 regimes; ≥10y history also absent) | none published | **FAIL** | `03` §1, §2, §4 |
| Strategic 365d | Bull reaches the matching-regime **P90** | **DOES NOT EXIST** | none published | **FAIL** | ibid. |
| Strategic 365d | Killer-risk case covers the **tail/event** bound | **DOES NOT EXIST** in magnitude (dated 2027-01-01) | none published | **FAIL** | §3c |
| Strategic 365d | Exact grid point | 365d is exact; bracketing **not applicable** | n/a | **PASS (mapping only)** | `03` §4 |
| Strategic 365d | No cross-gap interpolation | not crossed | not crossed | **PASS** | — |
| Strategic 365d | Root §10 span check | same event class | **no case contains it** | **FAIL** | §3c |
| Strategic 365d | Root §10 conjunction check | joint probability per condition | **decomposed but not priceable** | **FAIL** | §3b |
| Both | Duration-matched cash hurdle exists | tactical: 3M bill (approximate match, obtained); strategic: 12M instrument | strategic **not obtained** | **Tactical PASS (labelled approximate) / Strategic FAIL** | §2 and §3 classification blocks |

**Verdict: the span audit FAILS at both horizons, on multiple independent tests each.** Under §10 a failed span audit makes the distribution `not_assessable`.

---

## 5. Arithmetic audit

- **Tactical probability total: n/a — no probabilities assigned.** Strategic probability total: **n/a — no probabilities assigned.** Neither sums to 100% because neither exists; a set that summed to 100% here would be arithmetic wrapped around nothing, which is precisely the defect root §10's span check exists to catch ("the math summed to 100% and reconciled perfectly. It spanned nothing").
- **Each case implementable return = price + roll + collateral + fees + FX.** The identity holds and is unbroken — but **price is `not_assessable` in every case**, so every implementable return is `not_assessable`. The other four components are printed unweighted and per venue (§2a, §3a) and are never summed into a return.
- **Each horizon expected implementable return = Σ(p × implementable return): `not_assessable`** at both horizons, because both factors are absent.
- **Checkable arithmetic that IS performed here** (all inputs unvintaged; none conviction-eligible):
  - 6.90 × 64/365 = **1.210**; 6.10 × 64/365 = **1.070**; 3.79 × 64/365 = **0.664**; 1.06 × 64/365 = **0.186**; 0.88 × 64/365 = **0.154**.
  - LME 64d non-price sum: +1.210 + 0.664 = **+1.874**. COMEX direct 64d: −1.070 + 0.664 = **−0.406**. Venue gap: 1.874 − (−0.406) = **2.280pp over 64 days**.
  - LME 365d: +6.90 + 3.79 = **+10.69**. COMEX direct 365d: −6.10 + 3.79 = **−2.31**. `CPER`: −2.31 − 0.88 = **−3.19**; −2.31 − 1.06 = **−3.37**.
  - Section 232 backstop: 2026-08-28 → 2027-01-01 = **126 days**; tactical horizon ends 2026-10-31 (**64 days**); strategic floor 182 days = **2027-02-26**. 126 lies strictly between 92 and 182.
  - Attribution residual: 3.8 ÷ 19 = **20.0%**; 3.8 ÷ 22 = **17.3%** → residual **80.0%–82.7%**.
- **No blended expected return is calculated or displayed anywhere in this file.** The two horizons never share a number: separate horizons, separate dates, separate carry tables, separate hurdles, separate confidences, separate falsifiers.

---

## 6. Contradictions and model risk

**Preserved as uncertainty, never averaged (root §3).**

1. **COMEX curve sign.** Contango ≈ −6.1%/yr (TradingView chain, internally monotonic) versus two quotes implying steep backwardation ≈ −31%/yr — a **roll *gain*, the opposite sign**, a ~13pp/yr swing on the largest computable component in this pack. Aggravating detail: the figure **6.7270** appears both as the Dec-26 contract price and as a 2026-08-25 spot record print. **§4 conservative default applied: the cost stands for a long; the gain is not banked.** Formally `not assessable for conviction`.
2. **Balance direction.** **+96 kt reported surplus vs −125 kt implied deficit from the same release's own growth rates — 221 kt apart, opposite signs.** Realised Q1-2026 was **+396 kt surplus (~2.9× Q1-2025)**; ICSG spring-2026 forecast 2027 at **+377 kt surplus**, having replaced an autumn-2025 forecast of **−150 kt deficit for 2026**. The same body has swung 246 kt between consecutive rounds. **The bull case's single condition rests on a series that contradicts itself.**
3. **Venue carry split.** LME backwardation and COMEX contango on the same metal. **Not a contradiction to net out — a location-and-delivery-date split**, and the signal sidecar records the `curve-carry` cluster as `contradiction: true`, never conviction-eligible. Both carried; neither averaged.
4. **The killer risk's magnitude.** Three unverified secondary sources give 19% / 20% / 22% for one session, N = 1, two-sided; today's visible location basis explains only **17.3%–20.0%** of that (§3c). **Identified in kind, unmeasured in magnitude, undated in timing.** Under §11 it is **not a proven critical risk**, and every upstream module says so explicitly — so nothing here may force `Avoid`.
5. **Anchor disagreement, and both anchors fail the §16 stability test.** The cost floor (US$3.00–4.00/lb) and the incentive price (US$5.44–5.90/lb) sit **US$1.44–2.90/lb apart** and measure different things; they are **not independent reads** (both broker/vendor-derived, both struck inside the 2024–26 bull run, both moving with the same inputs), so their coexistence is **not** corroboration. The canonical incentive quote is **28 months stale**; the cost floor's own direction is **contested** (Codelco C1 **+10.0% y/y** and FQM guidance raised **+9.6%**, both PRIMARY, against a Wood Mackenzie relay of **−13.2%** whose vendor source was never reached). And most reachable cash costs are **net of by-product credits struck at record gold and molybdenum** — **if gold falls, the copper cost floor rises mechanically** (Freeport's disclosed ±US$0.03/lb per ±US$100/oz gold; gold at US$3,000/oz adds ~US$0.30/lb, ~17%, with no tonne of mining changed).
6. **Positioning is stale and internally split.** COT as of **2026-08-18, ten days stale**, and it **predates the 2026-08-24 LME event in full**. 98.7th-percentile net long, but **52.8% of that extreme is the absence of shorts**, and hedgers absorbed **91.9%** of the twelve-month build. Breadth is `not_assessable` (N = 0 aligned observations). The cluster is `contradiction: true`.
7. **Model risk, named:** this pack's only computable arithmetic is carry, and carry is a **second-order** term against a price leg that moved **+46.63% in twelve months with ~100% of it unattributed across three independent lenses**. Anyone reading the −2.31%/+10.69% annual carry figures as if they were the decision is making a category error. **The price leg dominates, and the price leg is exactly what this run cannot bound.**

**What would change the distribution — one item, ranked.** A **lawful point-in-time daily close history for COMEX `HG` front month, continuous back-adjusted, with source identity and an accepted immutable vintage: ≥3 years for the tactical grid, ≥10 years for the strategic grid and a credible three-regime split.** Nothing else unblocks this orb: the pulse returns one quote, and one quote is not a return series. Second (and only second): vintaged point-in-time regime labels — LME cash–3M spread history, visible inventory with warrant status preserved, and an ICSG balance series retaining its **publication vintages** rather than today's restatements.

---

## Scenario hand-off

**For the terminal `commodity-thesis` synthesis. It must carry this pack forward or explicitly downgrade it; it may not silently replace these verdicts with a friendlier distribution, and there is no distribution here to narrow.**

| Field | Tactical | Strategic |
|---|---|---|
| Exact horizon | **64 calendar days → 2026-10-31** (ICSG autumn-2026 window; bracketed 60d/75d grid, same band) | **365 calendar days → 2027-08-28** (§11 default; no citable alternate — the only dated backstop, 2027-01-01, sits at 126 days inside the forbidden 92–182 gap) |
| Status | **`not_assessable`** | **`not_assessable`** |
| Exact reason (one each) | Empirical envelope structurally absent: **N = 0 non-overlapping outcomes vs a §10 floor of 30, 0 of 3 regimes** at every tactical grid point → span audit fails before any case can be sized | Same absence, plus the strategic grid's **≥10-year / three-regime** requirement → **no matching-regime P10/P90 bound exists for a case to reach** |
| Classification | **`not_assessable`** — refused, not defaulted to `mixed` | **`not_assessable`** — refused, not defaulted to `mixed` |
| Cases | Bear (4 conditions, decomposed) / Base (1) / Bull (1) / two-sided killer-risk overlay — **causal states only, NOT a scenario set** | Bear (3, decomposed) / Base (1) / Bull (1) / two-sided killer-risk overlay — **causal states only** |
| Probabilities | **None assigned.** No total, because no set exists | **None assigned** |
| Component returns | Price `not_assessable`; non-price sum **LME +1.874% / COMEX direct −0.406% / `CPER` −0.560% to −0.592%** over 64 days, fees unobtained on both direct legs | Price `not_assessable`; non-price sum **LME +10.69% (band +8.79% to +12.79%) / COMEX direct −2.31% / `CPER` −3.19% to −3.37%** over 365 days |
| Targets | **None published.** The US$3.00–4.00/lb cost band is a medium-run marginal-supply statement, **not** a 64-day or 365-day level, and the bull anchor (US$6.08–6.62/lb) is **anchor exhaustion, not an upside target** | Same |
| Expected implementable return / loss probability / worst downside / risk-reward | **All four `not_assessable`.** Risk/reward is **not** `unbounded` | **All four `not_assessable`** |
| Cash hurdle | **0.665% over 64 days** (US 3M bill 3.79%, 2026-08-26, UNVINTAGED; approximate duration match — no 2-month quote obtained) | **`not_assessable` — no 12-month instrument quote obtained anywhere in this run.** A rolled 3M bill is carried only as a labelled duration-mismatched proxy (3.79%) |
| Confidence | Forecast **0/100**; determination **88/100** | Forecast **0/100**; determination **88/100** |
| Catalysts | LME daily warehouse report (the one to watch); COT Fridays; ICSG monthly ~09-21 / ~10-21 and the **autumn round late-Sept → end-Oct**; China activity ~09-15; PMI 08-31 / 09-30 / 10-31; CPI 09-11; FOMC 09-15/16 and 10-27/28; LME Week 10-19; miner Q3 from ~10-14 | Cobre Panamá by **2026-12-31**; Section 232 effective backstop **2027-01-01**; 2027 TC/RC settlement; ICSG autumn-2026 and spring-2027; DRC transition ~2026-09-29 (**≈0.36% of world mined copper**) |
| Falsifiers of the `not_assessable` verdict | ≥3 years of vintaged point-in-time COMEX `HG` closes **plus** ≥3 vintaged regime labels | ≥10 years of the same **plus** ≥3 vintaged regime labels **plus** a duration-matched 12-month cash quote |
| Audit verdicts | Span **FAIL** (P10, P90, tail — 3 independent fails, tail failing twice); root §10 span check **FAIL**; conjunction check **FAIL** (decomposed but not priceable); grid mapping **PASS**; no cross-gap interpolation **PASS** | Span **FAIL** (P10, P90, tail); root §10 span check **FAIL**; conjunction check **FAIL**; grid mapping **PASS**; no cross-gap interpolation **PASS**; cash hurdle **FAIL** |

**Mechanical implication under §11, stated and stopped.** Both horizons are `not_assessable`. Under §11 any `not_assessable` horizon mechanically produces **`Research More`** unless a proven critical risk with a cited source forces `Avoid`. **No proven critical risk exists anywhere in this run** — market-structure, supply-demand (orb 04 verbatim: killer-risk present but two-sided, **no proven critical risk established**), macro-positioning and the cost-curve orb all say so explicitly. Target exposure therefore maps to **`null`**; `forecast_confidence` is the lower of the two horizon confidences, which is **0** for the forecast itself. **This orb writes no action verdict. The terminal synthesis applies the two-by-two matrix and owns the call.**

**Three things the terminal synthesis may not do with this file.** (1) It may not treat the causal-state inventories in §2 and §3 as a scenario set — they carry no probabilities by design, and attaching some downstream would manufacture the distribution §10 forbids. (2) It may not present the carry tables (§2a, §3a) as expected returns — they are four of five components with the dominant one missing. (3) It may not adopt any driver story — tariff, deficit, electrification or cost-push — that this run's arithmetic does not carry: the move is ~100% residual on the market-structure basis and 90% residual at the *upper bound* of a cost-push story. **Whatever is holding copper up, this engine cannot name it, and a position whose driver cannot be named cannot be defended when it moves against you.**
