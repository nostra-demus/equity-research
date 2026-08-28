# commodity-thesis Module Dossier — COPPER

> Deterministic, lossless concatenation of every artifact in this module — the module synthesis and every specialist output, in order. Generated mechanically (no LLM rewriting), so nothing is omitted or paraphrased. This is the module's "see everything" tier; the module's decision lives in `99_*-synthesis.md` and the short read in `commodity-thesis_memo.md`.

- Generated: 2026-08-28T14:37:26Z
- Module folder: `commodity-thesis`
- Contents: 1 module synthesis + 3 specialist outputs = 4 files

## Table of Contents

- [commodity-thesis — module synthesis](#commodity-thesis-module-synthesis) — `99_commodity-thesis-synthesis.md`
- [commodity-thesis / 01_commodity-catalysts.md](#commodity-thesis-01-commodity-catalysts-md) — `01_commodity-catalysts.md`
- [commodity-thesis / 02_commodity-cost-curve-fair-value.md](#commodity-thesis-02-commodity-cost-curve-fair-value-md) — `02_commodity-cost-curve-fair-value.md`
- [commodity-thesis / 03_commodity-scenario-engine.md](#commodity-thesis-03-commodity-scenario-engine-md) — `03_commodity-scenario-engine.md`


---

## commodity-thesis — module synthesis

_Source: `99_commodity-thesis-synthesis.md`_

# COPPER — Commodity Dossier

**Run date:** 2026-08-28 · **Run root:** `commodity/runs/COPPER/` · **Terminal adjudicator:** `commodity-thesis-synthesis` (there is no master synthesizer after this file) · **Rules:** root `CLAUDE.md`, `.claude/agents/commodity/MODULE_RULES.md` §§4a, 5, 6, 8, 8A, 9, 10, 11, `frameworks/commodity/COMMODITY_PROFILES.md` §`## COPPER`.

> **Evidence status, stated before any number (MODULE_RULES §8A).** `data/COPPER/` does not exist. The frozen coverage artifact `required_series_coverage.json` (decision-time cutoff **2026-08-28T14:03:47Z**, `sha256:561edc04…84fe7`) records **0 of 22 required semantic series usable**. The swarm pulse quote transport is dead (`PULSE-MISSING`; `scripts/refresh-swarm-pulse.sh` fails `EPERM` on the pinned `tsx` runner's IPC pipe), so `copper.current-price` is **missing** and there is **no vintaged price anchor anywhere in this run**. `signal_evidence.json` compiles 114 rows into 27 independent clusters with **0 conviction-eligible**. **Every figure below is unvintaged live-web context or arithmetic on it.** Under §8A it may explain the situation; it cannot fill a coverage row, cannot raise data sufficiency, and cannot lift conviction. Nothing here is a recommendation to buy, sell, size or hold anything.

---

## 1. Snapshot

| Field | Reading |
|---|---|
| **Action** | **Research More** |
| **Target exposure** | **`null` risk units** (no exposure is sized) |
| **Forecast confidence** | **0 / 100** (the lower of two horizon confidences, both 0) |
| **Tactical classification** | **`not_assessable`** — 64 days → **2026-10-31** |
| **Strategic classification** | **`not_assessable`** — 365 days → **2027-08-28** |
| **Thesis type (§14)** | **Commodity-conditional** — conviction capped accordingly |
| **Freshness** | Coverage artifact frozen 2026-08-28T14:03:47Z; positioning read is **10 days stale** (COT report 2026-08-18); COMEX stock split is **22 days staler** than the COMEX total it sits inside |
| **Benchmark** | LME Copper Grade A 3-month (US$/tonne) is the profile's global benchmark; **COMEX `HG` front month (US$/lb)** is the price the coverage row `copper.current-price` names and the leg every return figure here is anchored on. The two are different instruments and are never averaged |
| **Current price** | **~US$6.62/lb COMEX front month, 2026-08-28 — explicitly UNVINTAGED**, a secondary web quote, not an exchange settlement [Web: TradingEconomics, 2026-08-28 — unvintaged, unverified]. LME Grade A 3-month **US$14,251/t (≈US$6.464/lb), 2026-08-26**, a different date and a different instrument. **The machine record carries `current_price.value: null`**, because the required `copper.current-price` row is unresolved and inventing a vintage would be a fabrication |
| **Curve shape** | **Venue-split, and the split is the finding.** LME cash–3M **backwardation +US$248/t (2026-08-26) ≈ +6.9%/yr to a rolled long**; COMEX front chain **contango ≈ −6.1%/yr to a rolled long**, and that COMEX **sign is contested** by two other unvintaged quotes implying steep backwardation. **~13 percentage points a year of carry difference on the same metal.** §4 conservative default applied: the cost stands for a long; the roll gain is not banked. Formal status: `not assessable for conviction` |
| **Net balance** | **NOT ESTABLISHED for full-year 2026.** The same reported ICSG release gives **+96 kt surplus** as a headline and **−125 kt deficit** from its own reported +0.4% production / +1.6% usage growth rates — **221 kt apart, opposite signs**. What *is* observable is that the **realised** part of 2026 ran a surplus (Q1-2026 **+396 kt**, 386 kt seasonally adjusted, ~2.9× Q1-2025's +135 kt) and that it landed in visible metal (+401 kt three-exchange build, end-2025 → end-May-2026) |
| **Net macro** | **Headwind.** Dominant driver: **US 10-year real yield 2.36% (2026-08-28), +54bp over twelve months to a multi-decade high** — a driver that moved *against* the price. Three of four dominant drivers moved adversely; the fourth (broad trade-weighted dollar) moved −1.39%, and **+0.02% over eleven months on the last fully published Federal Reserve primary observation** |
| **Positioning** | **Crowded long — but the extreme is half an absence.** Managed money net **+78,648 lots** at the **98.7th percentile of 156 weekly COT reports** (~3.0 years, COMEX Copper #1, **futures-only disaggregated**, report date **2026-08-18, ten days stale**); **52.8% of that extreme is the absence of shorts** (gross short 13,449 lots, **14.7th percentile**), not long accumulation (gross long only 87.8th percentile). Physical hedgers absorbed **91.9%** of the entire 53,039-lot twelve-month build |
| **Fair-value band** | Bear **US$3.00–4.00/lb** / base **US$5.44–5.90/lb** / bull **US$6.08–6.62/lb** — all anchor-grade bands; the bull row is **anchor exhaustion, explicitly NOT an upside target**. **Both anchors fail the §16 stability test** |
| **Margin of safety** | **NEGATIVE.** Price is a **+12.3% to +21.6% premium** to base fair value on the COMEX leg (+9.6% to +18.8% on LME); downside to the floor is **−39.6% to −54.7%** (COMEX) / **−38.1% to −53.6%** (LME) |
| **Supply-demand directional-conviction score** | **35 / 100** (raw 35; deterministic opacity **HIGH**; cap **45**, which does not bind because the raw score is already below it) |
| **Data sufficiency** | Market structure **10/100**, cost curve **22/100** — both inside root §11's **0–29 "insufficient — refuse to rate"** band |

---

## 2. Thesis Summary

**The plain-English position: copper has risen 46.63% in twelve months and this engine cannot name what caused it, cannot bound what it does next, and cannot verify a single one of the 22 series its own profile says it needs. That is the thesis.**

Three independent lenses each ran the driver arithmetic and each landed on a residual near 100%:

```
Attribution: US tariff location premium, 12m change ≈ 0 (the COMEX-over-LME premium is a LEVEL
             roughly where it was twelve months ago) [market-structure `02` §4 — UNVINTAGED]
  = ≈ +US$0.00/lb of the +US$2.11/lb (+46.63%) observed
  → ~0% explained, ~100% residual (unattributed).
```

```
Attribution: US 10y REAL yield +54bp (1.82% → 2.36%) × NO SOURCED SENSITIVITY EXISTS for copper's
             response to the 10y real yield [macro-positioning `01` §1a — UNVINTAGED]
  = not computable, of the +US$2.11/lb (+46.63%) observed
  → 0% explained. The SIGN IS ADVERSE — real yields rose across a window in which copper rose —
    so residual is at least 100%, and plausibly more.
```

```
Attribution: marginal-producer cash cost +21.1 US¢/lb y/y (Codelco direct C1 231.8¢ Q1-2026 vs
             210.7¢ Q1-2025) × 1.0 pass-through — an ASSUMED-BOUND basis, NOT a measured
             cost-to-price elasticity [Codelco Q1-2026, 2026-05-29 — secondary relay]
  = +US$0.211/lb of the +US$2.11/lb (+46.63%) observed
  → 10.0% explained at the MAXIMUM a cost-push story could claim, 90.0% residual.
```

**The residual is the finding, not a caveat.** A cost-push story explains at most a tenth of the move; macro explains none of it and pushed the other way; the tariff premium explains none of it. Three lenses, three residuals near 100%, each computed on a *different* basis. Under §11/§12 that caps conviction, and it belongs in the risk summary rather than in a closing hedge. It also has a practical consequence: **a position whose driver cannot be named cannot be defended when it moves against you, because you will not know whether the reason has changed.**

The physical picture is genuinely two-sided and the two sides answer different questions. The **aggregate** buffer is ordinary: ~968.4 kt of visible three-exchange stock = **12.3 days** of world use, **+30.1%** against end-2025, with LME total stock at the **46th percentile of a 19-year record** — mid-range, not tight, and up 77 kt over twelve months. The **accessible** buffer is thin: **69.8%** of that metal sits in COMEX/US warehouses behind an unresolved US border question, leaving **3.7 days ex-US** and an **LME on-warrant slice of 1.4 days that fell 35.8% in a single week**, with **50.52% of LME stock already cancelled** (2026-08-21). Both readings are true; neither is netted. And the ex-US read is the most fragile conclusion in the whole run, because China bonded and LME off-warrant stocks are **NOT MEASURED and explicitly not assumed to be zero** — every cover figure above is a **lower bound**.

**Is there a variant perception (§7)?** No — and saying so is the point. There is **no proven variant perception here.** The engine cannot show it knows something the market does not, because it cannot measure what the market is doing: no lawful copper price history exists anywhere in this engine (0 of 27 connectors is a price-history connector for any commodity), so there is no return distribution, no percentile, no correlation and no base rate. What the run does hold is one honest, uncomfortable observation the market appears to be pricing against: at US$6.62/lb a **disclosed high-cost producer earns a 43%–47% margin over its own published all-in sustaining cost** (First Quantum US$3.50–3.80/lb, 2026-04-28, **primary document, read**). Whatever is holding copper up, it is not the cost curve. That is a reason to withhold conviction, not a reason to be short.

---

## 3. Fair Value & Margin of Safety (§16 / §18)

**Bear / base / bull fair value, anchor-grade labels kept** [`02_commodity-cost-curve-fair-value.md` §3]:

| Case | Fair value | Anchor that sets it | Grade and what it is not |
|---|---:|---|---|
| **Bear** | **US$3.00 – 4.00/lb** (US$6,614 – 8,818/t) | Low end = the 90th percentile of **C1 cash cost INCLUDING sustaining capital** [Bernstein via Investing.com, 2025-09-04 — broker research, verdict-stripped, ~12 months stale]. High end = a **disclosed AISC** for a high-cost producer [First Quantum Q1-2026, 2026-04-28, **PRIMARY, read**] | **Anchor-grade BAND, not a percentile.** The vendor-ranked production-weighted cost curve was **not reached** (three HTTP 403s). A statement about where marginal supply stops covering all-in cost over the medium run — **not a target and not a forecast** |
| **Base** | **US$5.44 – 5.90/lb** (US$12,000 – 13,000/t) | The **new-mine incentive price** [BlackRock 2024-04-25; Citic 2026; Deutsche Bank 2026] | **Anchor-grade band but an assertion with no published build.** The canonical quote is **28 months stale**; the orb's own capital-intensity cross-check leaves an unexplained implied capital charge of US$5,900–7,700/t (5.9×–7.7× the undiscounted figure). A **10–20-year** supply-response statement, not a 12-month target |
| **Bull** | **US$6.08 – 6.62/lb** (US$13,400 – 14,595/t) | **Anchor exhaustion** — the substitution-trigger top in ratio terms, and the observed price itself | **Explicitly NOT an upside target.** It is the statement that the highest anchor this framework can build **sits at or below where the market already trades**. Above US$6.62/lb the orb has no anchor at all, and upside beyond the observed price is **`not assessable`** |

**Margin of safety — two numbers, and both are stated against the observed price's own venue.**

| Leg | Premium / discount to **base** fair value | Downside to the **floor** |
|---|---:|---:|
| **COMEX front month** (US$6.62/lb, 2026-08-28, unvintaged) | **+12.3% to +21.6% PREMIUM** | **−39.6% to −54.7%** |
| **LME Grade A 3-month** (US$14,251/t, 2026-08-26, unvintaged) | **+9.6% to +18.8% PREMIUM** | **−38.1% to −53.6%** |

**The margin of safety is NEGATIVE on the profile's own valuation lens, on both venues.** Stated the way §21 requires rather than as a bare adjective: *the price sits 10%–22% above the level at which analysts say new mines get sanctioned, and 38%–55% above the level at which the highest-cost tenth of supply stops covering its all-in sustaining cost.*

**Four qualifiers travel with those two numbers and none is optional.**

1. **Both anchors FAIL the §16 stability test, in different ways.** Every reachable incentive-price quote was struck **between early-2024 and 2026 — entirely inside the copper bull run**; no trough-vintage (2015–16, pre-2021) quote was reached anywhere, so sector-level history for the anchor is **`Not assessable`**. And the cost floor's own **direction is contested**: Codelco direct C1 **+10.0% y/y** and First Quantum guidance raised **+9.6%** (both **primary, read**) against a Wood Mackenzie relay of **−13.2%** whose vendor source was **never reached**.
2. **Most reachable cash costs are NET of by-product credits struck at record gold and molybdenum.** Freeport's own disclosed sensitivity is **±US$0.03/lb of copper cash cost per ±US$100/oz gold**, off a US$4,000/oz assumption. Gold at US$3,000/oz adds ~US$0.30/lb — a ~17% rise on a ~US$1.75/lb base **with not one tonne of mining changed**. Plain English: **if gold falls, the copper cost floor rises mechanically**, which would shrink the downside-to-floor figure above without the price moving at all.
3. **The base rate for any reversion is `not assessable`.** N = 0 lawful copper price observations against the §10 floor of 30. The engine cannot say how often copper has reverted from a premium of this size, because it holds zero copper price observations.
4. **Neither number may size a position, and neither forces an action.** A negative margin of safety measured on unvintaged, cycle-unstable anchors may not be used to force a `Trim` or a short, exactly as it may not be used to force a `Buy`.

**Roll-adjusted view — does the exposure earn or bleed carry?** It depends entirely on the venue, and the venue is currently a larger decision than the direction of the price.

| Over 365 days, at an unchanged price | Roll | Collateral | Fee | Non-price sum |
|---|---:|---:|---:|---:|
| **LME-rolled** (Grade A 3-month) | **+6.90%** (band +5.00% to +9.00%) | +3.79% | not obtained | **+10.69%** (band +8.79% to +12.79%) |
| **COMEX-rolled** (`HG` front, direct) | **−6.10%** — **sign contested** | +3.79% | not obtained | **−2.31%** |
| **COMEX-rolled via `CPER`** | −6.10%, and **not `CPER`'s actual deferred-month roll** | +3.79% | −0.88% to −1.06% | **−3.19% to −3.37%** |

**Plain English: a COMEX-rolled long needs copper to rise roughly 3% over a year just to break even, while an LME-rolled long is paid roughly 9%–13% to hold the same metal.** Neither figure may be banked — every input is unvintaged, the COMEX sign is contested by a second source, and the LME backwardation is a **five-year extreme that already gave back roughly half its value in two sessions** (~US$550/t on 2026-08-24 → ~US$248/t on 2026-08-26) and mean-reverts by construction. **This is the exact configuration in which a bullish spot call and a losing total return coexist**: on 2026-08-25/26 the LME backwardation collapsed 55% while the outright price rose 0.4% to a record. Note also that **there is no physically-backed copper vehicle** — every listed route pays a roll or takes equity risk — and `COPX` / `ICOP` / `FCX` are **not expressions of a copper view**: the profile is explicit that miners are a levered confirmation, not the metal.

---

## 3b. Tactical Forecast — 64 days; target date **2026-10-31** (§10 / MODULE_RULES §11)

**Status: `not_assessable`** — the empirical return envelope this horizon must be spanned against does not exist: `copper.comex-price-history` is **structurally absent** (no price-history connector exists in the 27-connector registry for any commodity), giving **N = 0 non-overlapping outcomes against the §10 floor of 30** and **0 of 3 required point-in-time regimes** at every tactical grid point, so the mandatory span audit fails before any case can be sized.

| Case | Probability | Target | Price return | Roll | Collateral | Fees | FX | Implementable return | Conditions / joint basis | Falsified if |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---|---|
| — | **none assigned** | **none published** | `not_assessable` | see below | see below | see below | see below | `not_assessable` | **No scenario set exists.** The independent pack published a *causal-state inventory* only (bear 4 conditions decomposed / base 1 / bull 1 / two-sided killer-risk overlay) and assigned no probabilities by design | — |

**Horizon choice, carried from the independent pack.** 64 days departs from the 60-day default on a cited catalyst: the **ICSG biannual autumn-2026 forecast round, window late September → end-October 2026**, the only release that can resolve the 221 kt balance contradiction, whose two-way trigger has fired in **both** directions across the last two rounds. At the 60-day default the window's tail is not contained. Band check: 64 sits inside 30–92 — **pass**. Grid check: 64 is not an exact grid point, so **conservative bracketing between the 60-day and 75-day grid points** (same band, no cross-gap interpolation) applies. **The bracketing is well-formed and it brackets two empty cells.**

- **Weighted price / roll / collateral / fees / FX / implementable return: `not_assessable` on all six.** No probabilities were assigned, so no weighting was performed. The four computable non-price components are printed **unweighted, per venue** and are a **carry table, not an expected return**: over 64 days, **LME-rolled +1.874%** (roll +1.210% + collateral +0.664%, band +1.541% to +2.242%, before unobtained fees) / **COMEX direct −0.406%** (roll −1.070% + collateral +0.664%, before unobtained fees) / **`CPER` −0.560% to −0.592%**. **The venue gap is 2.280 percentage points over 64 days on the same metal.**
- **Loss probability: `not_assessable`** (no probability mass exists). **Worst downside: `not_assessable`** — the US$3.00–4.00/lb cost band is a medium-run marginal-supply statement, explicitly **not** a 64-day level. **Risk/reward: `not_assessable`** — and specifically **not** `unbounded`, which is only available when a real distribution has no losing case.
- **Duration-matched cash hurdle: 0.665% over 64 days** = US 3-month Treasury bill **3.79%/yr × 64/365** [Web: TradingEconomics, 2026-08-26 — unvintaged]. The 91-day bill against a 64-day horizon is the closest instrument obtained; **no 2-month quote was obtained**, so the match is approximate and labelled.
- **Classification: `not_assessable`; confidence 0 / 100.** The mechanical test needs an expected implementable return, a risk/reward and a loss probability. None of the three exists. **The classification is refused, not defaulted to `mixed`.** Confidence in the `not_assessable` determination itself is 88/100 — the blocking condition was verified independently at decision time.
- **Catalysts (dated, inside 64 days):** LME daily warehouse report (every business day, 09:00 London — the only date-proven high-frequency read of the one measured constraint); CFTC COT every Friday 15:30 ET; ICSG monthly ~2026-09-21 and ~2026-10-21; **ICSG autumn forecast window late-Sept → end-Oct**; China NBS activity ~2026-09-15; NBS PMI 2026-08-31 / 09-30 / 10-31; US CPI 2026-09-11; FOMC 2026-09-15/16 and 2026-10-27/28; LME Week 2026-10-19; miner Q3 window opens ~2026-10-14. **Undated and therefore excluded from the horizon: Section 232.**
- **Falsifiers of this `not_assessable` verdict:** a lawful point-in-time daily close history for COMEX `HG` front month, continuous back-adjusted, with source identity and an accepted immutable vintage, **≥3 years**, plus vintaged point-in-time labels for at least three regimes. **Restoring the pulse alone does not clear this: the pulse returns one quote, and one quote is not a return series.**
- **Independent span/conjunction audit: FAIL, on multiple independent tests.** Bear-to-P10 **FAIL**; bull-to-P90 **FAIL**; killer-risk case to the tail/event bound **FAIL twice** (unmeasured in magnitude *and* undated in timing); root §10 span check **FAIL** (the one print that moves this 10%+ — the Section 232 determination, reported at 19–22% in one session — is in no case); root §10 conjunction check **FAIL** (cases decomposed but not priceable, because no per-condition probability in this run rises above judgment). Grid mapping **PASS**; no cross-gap interpolation **PASS**. **Empirical bounds used: none exist.**

---

## 3c. Strategic Forecast — 365 days; target date **2027-08-28** (§10 / MODULE_RULES §11)

**Status: `not_assessable`** — the same structural absence bites harder here: **N = 0 non-overlapping outcomes against the §10 floor of 30 and 0 of 3 required regimes at every strategic grid point**, and the strategic grid additionally needs **≥10 years** of history for a credible three-regime split, so **no matching-regime P10/P90 bound exists for a case to reach**.

| Case | Probability | Target | Price return | Roll | Collateral | Fees | FX | Implementable return | Conditions / joint basis | Falsified if |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---|---|
| — | **none assigned** | **none published** | `not_assessable` | see below | see below | see below | see below | `not_assessable` | **No scenario set exists.** Causal-state inventory only (bear 3 conditions decomposed / base 1 / bull 1 / two-sided killer-risk overlay), independently authored, sharing no probability, target or component with the tactical horizon | — |

**Horizon choice.** The §11 default of 365 days is used, and the reason is itself evidence: **no citable catalyst supports an alternate strategic date.** The only dated backstop that matters — the Section 232 recommended effective date **2027-01-01** — sits at **126 days**, strictly inside the **92-to-182-day gap** §11 does not cover and §10 forbids interpolating across. The 2028-01-01 escalation to 30% sits at 491 days, inside the band, but is **conditional on a duty first being imposed**, so using it would smuggle a two-condition conjunction into the horizon definition itself. Rejected on those grounds. Grid check: 365 is an **exact grid point**, so bracketing is not applicable. No cross-gap interpolation.

- **Weighted price / roll / collateral / fees / FX / implementable return: `not_assessable` on all six**, computed independently of the tactical figures and sharing no number with them. Non-price components, unweighted and per venue, over 365 days: **LME-rolled +10.69%** (band +8.79% to +12.79%) / **COMEX direct −2.31%** / **`CPER` −3.19% to −3.37%**, fees unobtained on both direct legs.
- **Loss probability / worst downside / risk-reward: all three `not_assessable`.** Again: **not** `unbounded`.
- **Duration-matched cash hurdle: `not_assessable`, and this is a second independent failure.** **No 12-month US Treasury bill or 1-year note quote was obtained anywhere in this run.** The only rate held is the 3-month bill at 3.79%, which gives 3.79% over 365 days *only if* rolled four times at an unchanged rate — an assumption, not a quote, and a duration mismatch on its face. It is carried as a labelled proxy, never as the hurdle. **So even if returns existed, the strategic classification could not be computed against a matched hurdle.**
- **Classification: `not_assessable`; confidence 0 / 100.** Refused, not defaulted. Confidence in the determination itself: 88/100.
- **Catalysts (dated, inside 365 days):** Cobre Panamá government decision on or before **2026-12-31** (~350 kt/yr idled since November 2023); **Section 232 recommended effective date 2027-01-01**; the 2027 benchmark TC/RC settlement around LME Week 2026-10-19; ICSG autumn-2026 and spring-2027 rounds; FOMC 2026-09, -10, -12 and through 2027; the DRC concentrate-ban transition ~2026-09-29 (**≈0.36% of world mined copper — do not inflate it**). The 2028-01-01 escalation is **excluded as conditional**.
- **Falsifiers of this `not_assessable` verdict:** ≥10 years of vintaged point-in-time COMEX `HG` closes, **plus** ≥3 vintaged point-in-time regime labels (a balance regime labelled from the vintage published *at* each historical date, never from today's restated ICSG numbers), **plus** a duration-matched 12-month cash instrument quote.
- **Independent span/conjunction audit: FAIL.** Bear-to-P10 **FAIL**; bull-to-P90 **FAIL**; killer-risk case to the tail/event bound **FAIL**; root §10 span check **FAIL**; conjunction check **FAIL**; cash hurdle **FAIL**. Grid mapping **PASS**; no cross-gap interpolation **PASS**. **Empirical bounds used: none exist.**

**Adjudication of the pack (§10 / §5).** I consumed `03_commodity-scenario-engine.md` as written and made **no change to it** — no status, horizon, target date, component, hurdle, audit result, classification or confidence was altered. There was **no disclosed conservative downgrade to make**, because a `not_assessable` verdict cannot be lowered further, and there was **no distribution to narrow**. Three things I did not do, because the pack forbids them and §10 forbids them: I did not treat its causal-state inventories as a scenario set; I did not present its carry tables as expected returns; and I did not adopt any driver story — tariff, deficit, electrification or cost-push — that this run's own arithmetic does not carry. **No expected return is blended across the two horizons anywhere in this file.**

---

## 4. Risk Summary

**Strongest bear case.** The market is paying a **43%–47% margin over a disclosed high-cost producer's own published all-in sustaining cost**, and the supply channels that can respond inside twelve months — scrap, restarts and substitution — are already visible and dated: scrap-based refined output **+5.6% (Jan–May 2026)**, scrap's share of world refined output **17.3% → 17.8%**, China's scrap share of refined feedstock **25.2% in H1-2026**; a **Cobre Panamá decision window closing 2026-12-31** on ~350 kt/yr of idled capacity; and named, realised aluminium substitution (Ferrari, BMW, EV makers, Daikin, Jun–Jul 2026) with the copper/aluminium ratio at **4.2–4.3 against an indicative 3.5–4.0 trigger band** — i.e. the substitution ceiling appears to sit *beneath* this market. Meanwhile the realised balance evidence points to surplus (Q1-2026 **+396 kt**, ~2.9× Q1-2025), the buffer is **+30.1% YTD**, and the crowded long book has **essentially no short base obliged to buy a fall** (gross short at the 14.7th percentile). **None of this is sized in tonnes, and the base rate for all of it is `not assessable`** — which is why it is the strongest bear case available and still not a short signal.

**Single killer risk — the supply-security policy killer risk, carried forward whole.** The **pending US Section 232 determination on REFINED copper**. The 2025-06-30 Commerce report recommended a phased universal duty of **15% from 2027-01-01** and **30% from 2028-01-01**; Proclamation 10962 required Commerce to give the President a copper-market update **by 2026-06-30**.

- **Expiry: NONE — undated and open.** The deadline was **missed** and **no replacement date has been set**; as of 2026-08-28 it is **59 days overdue**. The only dated backstop is the recommended effective date **2027-01-01 = 126 days out**, which falls in the one window neither forecast horizon can legally reach.
- **Flip trigger, bull leg (price-supportive for US-located metal):** a Federal Register proclamation imposing a refined-copper duty of **≥15% with an effective date on or before 2027-01-01**. Comparable: the 0% Section 232 duty on refined cathode in force since 2025-08-01. Opposing fact, carried and not netted: one bank's model reads the COMEX premium as **14.6%** odds of a 15% duty by 2027-01-01 and **37%** of 30% by 2028-01-01 [FXStreet summary of Société Générale, 2026-08-10 — broker research, verdict-stripped, **a model output, not a market print**].
- **Flip trigger, bear leg (price-negative for the ex-US leg):** a published determination **not** to impose, **or** 2027-01-01 arriving with no duty in force. Implied arithmetic: the COMEX–LME spread would have to fall from **US$547/t** toward the **~US$50/t** implied long-run average — about **−US$497/t, ~91%** of the current spread.
- **Why it dominates:** it is the only live item that can move **~740 kt** of US-located metal between "available to the world" and "trapped inside a border" **without changing a single tonne of production**, against 3.7 days of ex-US cover and 1.4 days of LME on-warrant cover. It is a **location** risk, not a quantity risk. The loud headlines restrict almost no copper: the DRC concentrate ban covers ~75 kt/yr contained ≈ **0.36% of world mined copper**, Indonesia's ban changes export **form**, and Russian metal is **exchange-ineligible rather than lost production**.
- **The qualifier that must not be dropped: this is a killer risk in the §24 survival-tail sense — a large, sudden, undated repricing that can fire in EITHER direction — and the supply-security orb states explicitly that NO PROVEN CRITICAL RISK is established.** Its magnitude is unmeasured: three unverified secondary sources put the 2025-07-30/31 single-session precedent at **19% / 20% / 22%**, disagreeing by three percentage points on an **N = 1** event that carried **no direction** (it gapped down because the ruling landed *softer* than positioning expected; a harder ruling gaps the other way). Today's visible location basis of 3.8% explains only **17.3%–20.0%** of that precedent, leaving **80.0%–82.7% residual**. **Identified in kind, unmeasured in magnitude, undated in timing — so nothing here may be used to force `Avoid`.**

**Other risks carried, not averaged.** (a) **The move has no owner** — three lenses, three residuals near 100%, and the engine does not know what is carrying this price. (b) **No macro cushion under a crowded long** — the 98.7th-percentile net long sits against a multi-decade-high real yield that rose 54bp across the same window, and with gross shorts at the 14.7th percentile there is essentially no natural bid under a fall. (c) **Two-sided liquidation risk** — dispersed longs (85 accounts, top-4 gross long 16.3% of open interest) bleed out, while the concentrated hedger short (top-4 gross short **30.3%**, 79th percentile; 32 accounts averaging 3,913 lots) squeezes, which is exactly what fired on 2026-08-24 and relieved on 2026-08-25/26. Note that **24.51% of open interest on each side is spreading** and carries no directional view. (d) **The timing hole** — the entire positioning read is dated **2026-08-18** and **predates the 2026-08-24 LME event in full**; how much of it survived that week is not proven from available data. (e) **El Niño is probabilistic, unrealised and two-sided** — NOAA CPC Advisory 2026-08-13, July Niño-3.4 **+1.4°C**, >90% chance of a very strong event into NH winter 2026-27, window Dec-2026 – Mar-2027; heavy Andean rain would interrupt mine output (price-positive) while above-normal Chilean precipitation would ease the water constraint on concentrators (price-negative). Weather is **not** the swing factor for copper.

**What would flip the view or force a downgrade.**

- **Toward assessable at all:** a lawful point-in-time COMEX `HG` close history with an accepted immutable vintage (≥3 years tactical, ≥10 years strategic) plus ≥3 vintaged regime labels. Until then both horizons stay `not_assessable` and the action stays `Research More`.
- **Toward a proven bear:** the ICSG autumn-2026 round confirming a cumulative surplus above **+600 kt** (which needs Q2-2026 alone to add more than +204 kt on top of Q1's +396 kt); LME on-warrant recovering **above 166.8 kt** *and* cash–3M flipping to contango; a published determination not to impose a refined duty.
- **Toward a proven bull:** LME on-warrant closing **below 78.7 kt** on any daily report (one day of world use — a further **−26.5%** draw, where last week's was **−35.8%**, so reachable but not automatic) together with cash–3M wider than US$550/t; the next cumulative ICSG year-to-date balance printing a **deficit** (a demanding bar: Q2 alone would have to run at least −396 kt); a Federal Register proclamation imposing ≥15% effective on or before 2027-01-01.
- **Toward `Avoid`:** a genuinely proven critical risk with a cited source. **None exists in this run**, and four separate orbs say so explicitly. An undated two-sided binary is not one.

---

## 4b. Independent Evidence Clusters

| Measure | Count |
|---|---:|
| Raw signal rows | **114** |
| Independent clusters (aggregated by median strength, not counted as raw rows) | **27** |
| **Conviction-eligible clusters** | **0** |
| Clusters flagged `contradiction: true` | **14** |
| Statistical rows still contextual (failed or not yet cleared validation) | **6** |
| Compiler coverage | **complete** — all 11 expected orbs emitted a sidecar, no missing owners, no issues |

**Zero conviction-eligible clusters is the finding, and it is mechanical, not editorial.** Every one of the 114 rows carries an explicit `unvintaged:` or `missing:` provenance token with an empty `source_vintage_refs` array, so no row can clear §8's conviction gate. **This is why no material conclusion in this dossier is linked to a cluster ID and a source-vintage ID: no `sha256:` source vintage exists anywhere in this run to link to.** That is stated rather than papered over, and it is exactly why both horizons are `not_assessable`.

**The 14 contradictory clusters, preserved with both directions showing — never netted into a false neutral.** The decision-relevant ones:

| Cluster | Median strength | Both directions, kept apart |
|---|---:|---|
| `copper-deliverable-onwarrant-buffer-thin` | 0.50 | **Thin:** LME on-warrant 107.05 kt = 1.4 days, −35.8% in a week; ex-US 3.7 days. **Not thin:** LME total at the 46th percentile of 19 years, visible stock +30.1% YTD, +77 kt y/y. Both true; they answer different questions |
| `copper-comex-curve-contango-roll-cost` | 0.45 | **Cost:** COMEX contango ≈ −6.1%/yr to a long. **Gain:** two unvintaged quotes implying steep backwardation ≈ −31%/yr, the opposite sign. §4 conservative default: the cost stands |
| `copper-lme-delivery-pressure-squeeze` | 0.45 | **Stress:** 51,400 t of fresh withdrawal orders 2026-08-24, ~half of remaining LME stock earmarked. **Relief:** >20,000 t delivered 2026-08-25, on-warrant +~63 kt over three days |
| `copper-chile-h2-recovery-first-print` | 0.45 | **Recovering:** Chile INE June-2026 +5.1% y/y. **Not recovering:** H1 ran −6.6% y/y cumulative, and H1 alone accounts for 127% of the full-year forecast decline — a residual of the wrong sign |
| `copper-cot-observation-predates-lme-squeeze` | 0.30 | **Crowded long** (98.7th pct) versus **squeezable concentrated hedger short** (top-4 gross short 30.3%, 79th pct). Two opposite liquidation mechanisms, both real |
| `copper-all-in-cost-floor-band` | 0.30 | **Rising floor** (Codelco C1 +10.0% y/y, FQM guidance +9.6%, both primary) versus **falling floor** (Wood Mackenzie relay −13.2%, vendor source never reached) |
| `copper-china-jan-apr-2026-apparent-demand-growth` | 0.375 | China Q1-2026 apparent demand **"basically flat"** ex-bonded versus Jan–Apr **+2.4%**. Different windows and definitions — they cannot both be used |
| `copper-cross-asset-breadth-single-cluster-uncountable` | 0.05 | Copper/gold and COPX/copper are **one cluster counted once** (shared COMEX copper leg), not two votes; one relay's 0.00077 "50-year low" claim fails its own arithmetic by 46%–85% and is kept as a linked contradicting row |

**Four clusters read 0.00 median strength and say so plainly** — `copper-return-distribution-not-assessable`, `copper-physical-basis-not-assessable`, `copper-cper-etf-flows-not-assessable`, `copper-relative-real-asset-regime-not-assessable`. These are absences that were measured and recorded, not gaps papered over.

---

## 4c. Required Semantic-Series Coverage

**Machine artifact, frozen and hash-linked — not prose reconciliation.** `required_series_coverage.json`, decision-time cutoff **2026-08-28T14:03:47Z**, `generated_at` **2026-08-28T14:03:47Z**, digest **`sha256:561edc04dd9a481d592d1c7f565df16c1691f8230548f1f0e6b16a2668784fe7`**. **`required_count` 22 · `usable_count` 0 · `complete` false.** Every one of the 22 rows below is copied from that artifact verbatim. **Not one is `usable`, so BOTH horizons are `not_assessable` and the mechanical action is `Research More`.** No declaration, reachable URL, successful historical run or file without an accepted provenance vintage earns credit here.

| # | Need ID | Stable series ID | Owner orb | Status | As-of | Vintage / source identity | Exact gap reason | Material horizon affected |
|---:|---|---|---|---|---|---|---|---|
| 1 | `copper-managed-money-positioning` | `copper.managed-money-positioning` | commodity-positioning-flows | **missing** | — | vintage `null`; dataset `cftc.disaggregated-cot-futures-only`; connector `cftc-cot-copper`; provider CFTC | no eligible immutable vintage was knowable at decision time | Both — the crowding read is context only, and it is 10 days stale |
| 2 | `copper-lme-investment-fund-positioning` | `copper.lme-investment-fund-positioning` | commodity-positioning-flows | **unavailable** | — | no dataset, connector or provider | no connector claims the profile-owned series | Both — the one flow signal obtainable is undated and on a different exchange |
| 3 | `copper-etf-flows` | `copper.etf-flows` | commodity-positioning-flows | **unavailable** | — | no dataset, connector or provider | no connector claims the profile-owned series | Both — `CPER` flows `not assessable`; issuer page returned labels with no values |
| 4 | `macro-broad-usd-index` | `macro.broad-usd-index` | commodity-macro-drivers | **missing** | — | vintage `null`; dataset `fred.dtwexbgs`; connector `federal-reserve-broad-usd`; provider FRED | no eligible immutable vintage was knowable at decision time | Both — no copper/USD sensitivity; 0% of the move attributed |
| 5 | `macro-china-industrial-activity` | `macro.china-industrial-activity` | commodity-macro-drivers | **unavailable** | — | none | no connector claims the profile-owned series | Both — the profile's dominant demand lens cannot vote |
| 6 | `macro-global-activity-demand-proxy` | `macro.global-activity-demand-proxy` | commodity-macro-drivers | **unavailable** | — | none | no connector claims the profile-owned series | Both — a US flash PMI is not the required global series |
| 7 | `macro-us-10y-real-yield` | `macro.us-10y-real-yield` | commodity-macro-drivers | **unavailable** | — | none | no connector claims the profile-owned series | Both — the dominant adverse driver is unvintaged context |
| 8 | `copper-current-price` | `copper.current-price` | commodity-price-curve | **missing** | — | none | **pulse quote snapshot is absent** (`PULSE-MISSING`, EPERM on the `tsx` IPC pipe) | Both — forces `current_price.value: null`; no vintaged anchor for any return |
| 9 | `copper-comex-price-history` | `copper.comex-price-history` | commodity-price-curve | **unavailable** | — | none | declared shared market history is absent or ambiguous | Both — **the single largest cap**: N=0 vs a floor of 30 at all ten grid points |
| 10 | `copper-gold-price-history` | `copper.gold-price-history` | commodity-cross-asset-regime | **unavailable** | — | none | declared shared market history is absent or ambiguous | Both — breadth absent, not narrow |
| 11 | `copper-miner-equity-history` | `copper.miner-equity-history` | commodity-cross-asset-regime | **unavailable** | — | none | declared shared market history is absent or ambiguous | Both — miner strength stays an equity fact of unknown composition |
| 12 | `copper-lme-cash-three-month-curve` | `copper.lme-cash-three-month-curve` | commodity-price-curve | **unavailable** | — | none | no connector claims the profile-owned series | Both — no spread history, so no z-score or percentile for copper carry exists |
| 13 | `copper-visible-inventory` | `copper.visible-inventory` | commodity-demand-inventory | **unavailable** | — | none | no connector claims the profile-owned series | Both — the buffer read rests on single-date secondary readings across 8 timestamps |
| 14 | `copper-inventory-accessibility-opacity` | `copper.inventory-accessibility-opacity` | commodity-demand-inventory | **unavailable** | — | none | no connector claims the profile-owned series | Both — bonded and off-warrant material unmeasured; every cover figure is a lower bound |
| 15 | `copper-regional-arbitrage` | `copper.regional-arbitrage` | commodity-price-curve | **unavailable** | — | none | no connector claims the profile-owned series | Both — the +US$547/t figure is a **gross** venue spread, not "the arb" |
| 16 | `copper-concentrate-tcrc` | `copper.concentrate-tcrc` | commodity-supply | **unavailable** | — | none | no connector claims the profile-owned series | Both — one assessor reachable, so dispersion is not measurable |
| 17 | `copper-mine-prepolicy-supply` | `copper.mine-prepolicy-supply` | commodity-supply | **unavailable** | — | none | no connector claims the profile-owned series | Both — the origin bridge closes for **no origin** |
| 18 | `copper-supply-restrictions-routing` | `copper.supply-restrictions-routing` | commodity-supply-security | **unavailable** | — | none | no connector claims the profile-owned series | Both — globally accessible supply is `not_assessable` |
| 19 | `copper-refined-balance` | `copper.refined-balance` | commodity-demand-inventory | **unavailable** | — | none | no connector claims the profile-owned series | Both — the 2026 balance direction is not established (221 kt, opposite signs) |
| 20 | `copper-scrap-supply` | `copper.scrap-supply` | commodity-supply | **unavailable** | — | none | no connector claims the profile-owned series | Strategic — the fastest reversion channel is unsized |
| 21 | `copper-energy-transition-demand` | `copper.energy-transition-demand` | commodity-demand-inventory | **unavailable** | — | none | no connector claims the profile-owned series | Strategic — copper's whole structural demand case is unmeasured |
| 22 | `copper-cost-incentive-range` | `copper.cost-incentive-range` | commodity-cost-curve-fair-value | **unavailable** | — | none | no connector claims the profile-owned series | Both — both fair-value anchors are bands from an unweighted producer sample plus broker relays |

---

## 5. Relative — are we in the right commodity?

**The honest answer: `not assessable`, and the reason is structural rather than about copper.**

The engine tracks twelve commodity profiles (GOLD, SUGAR, CRUDE-OIL, NATURAL-GAS, COPPER, ALUMINIUM, WHEAT, CORN, SOYBEANS, COFFEE, COCOA, COTTON). Only three others have a decision record on disk, and all three are stale by more than a month against this decision date: **ALUMINIUM `Research More`, 2026-07-18 (41 days old)**; **GOLD `Hold`, 2026-07-03 (56 days)**; **WHEAT `Research More`, 2026-07-12 (47 days)**. All three predate this run's coverage gate and its dual-horizon contract, so they cannot be ranked against COPPER's coverage result without comparing two different measurement bases (§15 matched basis). **They are named as context, not used as a ranking.**

**What can be said, and it is the useful part.** The blocker that stops COPPER is **engine-wide, not copper-specific**: the connector registry holds **27 connectors and not one is a price-history connector for any commodity**, and no equity-history transport exists in this swarm at all. Switching the exposure to another tracked commodity would run into the same missing return history, the same absent regime labels, and the same failed span audit. **So "are we in the right commodity?" cannot be answered by moving to a different one — it can only be answered by fixing the shared price-history transport.** Until that exists, copper's relative attractiveness against gold, aluminium or wheat is **not proven from available data**, and any ranking published here would be judgment wearing a table's clothes.

One comparative observation that survives on its own evidence, offered without a rank: copper is the only one of the four where the *venue of the exposure is currently a larger decision than the direction of the price* — roughly **13 percentage points a year of carry difference on identical metal** between an LME-rolled and a COMEX-rolled long. That is a portfolio-construction fact about how copper is held, not a claim that copper is better or worse than anything else.

---

## 6. Action Discipline

- **Action: Research More**
- **Target exposure: `null` risk units.**
- **Tactical / strategic classifications:** `not_assessable` / `not_assessable`. **Mechanical matrix cell: none — the two-by-two matrix is never reached.**

**Why this cell applies.** Under MODULE_RULES §11 the two-by-two matrix only runs when *both* horizons are assessable; **any `not_assessable` horizon mechanically produces `Research More` unless a proven critical risk with a cited source forces `Avoid`.** Both horizons here are `not_assessable`, and they are so for two independent reasons that each suffice on their own: the frozen coverage artifact records **0 of 22 required semantic series usable**, which forces both horizons by contract; and the independently authored scenario pack failed its own span audit at both horizons on multiple separate tests before any action existed. On the override: **`critical_risk_override.applied` is `false`.** No proven critical risk exists anywhere in this run — the supply-security orb states it in terms ("killer-risk present but two-sided; **no proven critical risk** established"), and market-structure, macro-positioning, the cost-curve orb, the catalyst calendar and the scenario engine each independently say the same. The Section 232 binary is **undated, unmeasured in magnitude, and two-sided** — under §17 an undated catalyst must not lift the rating in either direction, and under §11 it cannot force `Avoid`. **`Research More` is therefore derived, not chosen, and `scripts/commodity_forecast_contract.py` is the authority that confirms it. No discretionary upgrade is available, and none is taken.** Note explicitly that a **negative margin of safety on unvintaged, cycle-unstable anchors does not force a `Trim` or a short either** — the discipline runs in both directions.

**Data sufficiency and conviction, capped.** Root §11 places market structure at **10/100** and the cost-curve orb at **22/100**, both inside the **0–29 "insufficient — refuse to rate"** band. The supply-demand directional-conviction score is **35/100** (raw 35, opacity **HIGH** on measured primary-source production coverage of **0.0%**, deterministic cap **45** — the cap does not bind because the raw score is already below it, and a cap can only reduce a score, never raise one; and it measures confidence in the *separately stated* balance direction, not bullishness or tightness). Macro-positioning reports **0 of 9 owned series usable** and contributes no directional vote. **Conviction is capped as `Commodity-conditional` (§14):** this is a thesis about drivers the portfolio does not control — an undated US border decision, a Chinese demand cycle, a real-yield regime — and three independent lenses each failed to attribute the price move at all. **Final confidence: 0/100.**

**Calibration feedback (§18 twin, WORKFLOW step 4).** Source: `commodity/performance/2026-08-28_calibration_summary.json` (the latest dated on or before the decision date). **Status: `pre_data`; haircut 0 points; no slice flagged; no error-taxonomy category flagged.** The summary's verdict is *"Pre-data — 0 of 10 decisive headline calls needed before hit rate means anything"*; `calibration_by_commodity["COPPER"]` reads **`"insufficient (N=0; floor 5)"`**, below its own floor, so the hit-rate trigger contributes nothing for this commodity; and `error_taxonomy_distribution` is **empty `{}`**, so no category is currently leading at count ≥ 2 and the error-taxonomy trigger has nothing to check. Both checks ran and both are recorded. **Calibration was not used to raise confidence and could not have been** — a clean or absent track record is not evidence for this call.

---

## Routing

Action: Research More
Thesis type: Commodity-conditional



---

## commodity-thesis / 01_commodity-catalysts.md

_Source: `01_commodity-catalysts.md`_

# Upcoming Reports & Events — COPPER

**Run date:** 2026-08-28 · **Run root:** `commodity/runs/COPPER/` · **Orb:** `commodity-catalysts` (layer 1, `commodity-thesis` module) · **Window covered:** 2026-08-28 → 2026-12-31 (next ~4 months) · **Rules:** root `CLAUDE.md` §17 (catalyst discipline), §5, §15, §21, §27; `.claude/agents/commodity/MODULE_RULES.md` §§2–4, 6, 8, 8A; `frameworks/commodity/COMMODITY_PROFILES.md` §`## COPPER`.

**This orb sets no action verdict.** It builds the dated calendar and nothing else. The verdict belongs to `99_commodity-thesis-synthesis`.

---

## Evidence status, stated before any date (MODULE_RULES §8A)

`data/COPPER/` does not exist. **No accepted connector vintage exists anywhere in this run**, and the swarm pulse transport is dead (`PULSE-MISSING`, EPERM). Every date, every level and every comparable below is **unvintaged live-web context**, carrying its source and as-of date. Under §8A it may explain the situation but **cannot fill a required-series coverage row, cannot raise data sufficiency, and cannot lift conviction**. A reachable URL is not evidence. WILTW and report-derived assertions are forbidden as runtime evidence and none are used here.

Two further limits that shape what follows:

1. **No required semantic series in the COPPER profile owns a catalyst calendar.** So this orb fills no coverage row and repairs no gap. Its output is a schedule, not a measurement.
2. **Several dates below are pattern-derived, not published.** Where a body publishes on a recurring cadence but has not published the specific forward date, the "Timing proven?" column says so in those words. §17 forbids me from hardening a pattern into a calendar entry.

---

## Catalyst Calendar

Inverted-score warning: none of these rows carries a score. Where a trigger threshold is numeric, the **comparable** is the same period a year earlier **on the same reporting basis**, or the row says explicitly that no such comparable was obtained (§17).

| Event | Date / window | Why it matters | Bullish trigger | Bearish trigger | Timing proven? | Source |
|---|---|---|---|---|---|---|
| **CFTC Commitments of Traders — COMEX `COPPER- #1`, disaggregated, futures-only** | **Every Friday 15:30 ET**, data as of the prior Tuesday. Next: **2026-08-28 15:30 ET** (Tuesday 2026-08-25 data), then 09-04, 09-11, 09-18, 09-25, 10-02 … weekly through 2026-12-31 | The whole positioning read in this run is dated **2026-08-18 — ten days stale** — and predates the 2026-08-24 LME squeeze in full. Today's print is the **first observation that contains that week**. Managed money sits at the **98.7th percentile of 156 weekly reports (+78,648 lots)**, and **52.8% of that extreme is the absence of shorts** (gross short 13,449 lots, 14.7th percentile), not long buying | Net length prints **above +79,027 lots** — the 156-week window maximum, set 2026-08-11 — i.e. a new three-year record | Net length falls **by 10,000 lots or more week-on-week** (−12.7% of the current +78,648), or below the 156-week mean of **+31,136 lots** | **Proven.** Fixed statutory cadence — Friday 15:30 ET, prior-Tuesday data | [CFTC Commitments of Traders release schedule, accessed 2026-08-28 — UNVINTAGED]; levels from [`../macro-positioning/99_macro-positioning-synthesis.md` §Positioning, COT report date 2026-08-18 — UNVINTAGED] |
| **LME daily warehouse stock report (on-warrant / cancelled split)** | **Every LME business day, 09:00 London.** Next: 2026-08-28. Continuous through 2026-12-31 | This is the series that measures the run's single measured pinch-point: LME **on-warrant stock 107.05 kt on 2026-08-27 = 1.4 days of world use**, after falling **35.8% in one week** from 166.775 kt (2026-08-20), with **50.52% of LME stock already cancelled** (2026-08-21). Ex-US cover is **3.7 days**; 69.8% of the 968.4 kt visible total sits in US warehouses | LME on-warrant closes **below 78.7 kt on any daily report** — one day of world use, at the 78.7 kt/day rate implied by 968.4 kt = 12.3 days — **together with** LME cash–3M backwardation wider than **US$550/t** (the 2026-08-24 level) | LME on-warrant recovers **above 166.8 kt** (its 2026-08-20 level, i.e. the draw fully reversed) **and** cash–3M flips to contango | **Proven.** Daily 09:00 London publication | [LME warehouse and stocks reports / publication schedule, accessed 2026-08-28 — UNVINTAGED]; levels from [`../supply-demand/99_supply-demand-synthesis.md` §Buffer — UNVINTAGED] |
| **SHFE weekly warehouse stocks** | **Every Friday** that is a Chinese working day, after the 15:00 CST close. Next: 2026-08-28. **Suspended over Golden Week 2026-10-01 → 10-07** | The China leg of the visible buffer. This run holds **SHFE warrant 56.7 kt (2026-08-19)** against a **weekly warehouse figure of 70.1 kt (week 32)** — **24% apart, two different definitions, not a reconciliation** | No numeric trigger is supportable — see the note below the table | No numeric trigger is supportable — see the note below the table | **Proven** for the cadence; the definitional basis is **not** resolved | [SHFE warehouse stocks published each Friday, accessed 2026-08-28 — UNVINTAGED] |
| **COMEX daily copper warehouse stocks (registered / eligible)** | **Every CME business day.** Continuous through 2026-12-31 | 676.1 kt registered + eligible on 2026-08-25 is **69.8% of all visible copper**, and it is the metal whose accessibility the Section 232 question decides | Registered + eligible COMEX stock **falls below 500 kt** (−26.0% from 676.1 kt), i.e. US-held metal starts leaving for the seaborne market | Registered + eligible **rises above 750 kt** (+10.9%), i.e. the US keeps pulling metal in | **Proven** cadence. **The threshold is weak**: no year-earlier COMEX figure on the same registered+eligible basis was obtained this run, so these two levels are anchored on the current print alone, not on a comparable | [`../supply-demand/99_supply-demand-synthesis.md` §Buffer, COMEX 676.1 kt as of 2026-08-25 — UNVINTAGED] |
| **ICSG monthly press release + Copper Bulletin** | **Monthly, day-of-month clustered around the 20th–22nd.** Latest listed: **2026-08-21**. Next expected ~2026-09-21, ~2026-10-21, ~2026-11-20 | The only **official** world refined balance. This run could not establish the 2026 balance sign at all: the same reported ICSG release gives **+96 kt surplus** as a headline and **−125 kt deficit** from its own reported +0.4% production / +1.6% usage growth rates — a **221 kt contradiction pointing opposite ways** | The next **cumulative** year-to-date world refined balance prints a **deficit (below zero)** | Cumulative Jan–Jun 2026 balance prints **above +600 kt surplus** | **Recurrence proven; exact date NOT published.** ICSG lists releases after the fact and publishes no forward calendar. Pattern-derived | [ICSG press-releases listing, latest entry 2026-08-21, accessed 2026-08-28 — UNVINTAGED]; balance figures from [`../supply-demand/99_supply-demand-synthesis.md` §Balance — UNVINTAGED] |
| **ICSG biannual forecast — autumn 2026 round** | **Window: late September → end-October 2026.** Prior rounds: spring **2026-04-23** ("Copper Market Forecast 2026-2027"); autumn **2025-10-08 / Oct-2025**; autumn **2024-09-26** | This is the release that either resolves or repeats the +96 kt / −125 kt contradiction, **and** it sets the first revision to the 2027 number. The spring-2026 round put **2026 at +96 kt surplus and 2027 at +377 kt surplus**, having replaced an autumn-2025 forecast of **−150 kt deficit for 2026** | The 2027 balance is cut from **+377 kt to below zero** — a swing of more than 377 kt on the same body, same forecast horizon, same basis | The 2027 surplus is raised **above +377 kt**, or the 2026 balance is revised further into surplus **above +96 kt** | **Window proven, exact date NOT published.** Two of the last three autumn rounds landed in early-to-late October, one on 2024-09-26 | [ICSG press-releases listing (2026-04-23, 2025-10, 2024-09-26), accessed 2026-08-28 — UNVINTAGED]; 2026/2027 figures relayed via [Mining Weekly 2025-10-08; IndexBox, pub. 2026-06-30 — UNVINTAGED, secondary] |
| **China monthly activity data (NBS): industrial output, fixed-asset investment, property** | **Mid-month.** Next expected **2026-09-15** (August data), then mid-October (September + Q3 GDP), mid-November, mid-December | The profile calls China property + grid spend a **dominant** copper driver. Latest readings in this run: **fixed-asset investment −6.7%** and **property −19.2%**, both **year-to-date year-on-year** and both worsening. Note the basis trap (§27): NBS FAI is a **cumulative year-to-date** rate, **not** a standalone-month rate — a standalone-month comparison is the wrong comparable | FAI year-to-date y/y improves to **better than −4.0%** *and* property to **better than −15.0%** — the first genuine deceleration of the decline | FAI year-to-date y/y **worse than −7.5%**, or property **worse than −20.5%** | **Cadence proven** (NBS publishes an annual release calendar); **the exact 2026-09 date was NOT read this run** — stats.gov.cn refused the connection (ECONNREFUSED). 2026-09-15 is derived from the year-earlier equivalent release | [NBS Regular Press Release Calendar 2026 exists but was unreadable this run; the 2025-09-15 equivalent release is the pattern source — accessed 2026-08-28, UNVINTAGED]; levels from [`../macro-positioning/99_macro-positioning-synthesis.md` §Macro — UNVINTAGED] |
| **China manufacturing PMI — NBS official, then RatingDog/Caixin** | NBS: **last day of each month** — 2026-08-31, 2026-09-30, **2026-10-31 (a Saturday — weekend handling not resolved this run)**, 2026-11-30, 2026-12-31. RatingDog/Caixin: first business day following | The profile's global-activity read. `macro.global-activity-demand-proxy` is **unavailable** in this run, so PMI is the only activity signal that will exist at all | NBS manufacturing PMI prints **above 50.0** (expansion) in **two consecutive months** | NBS manufacturing PMI prints **below 49.0** | **Proven** cadence (fixed last-day-of-month publication) | [NBS PMI published on the last day of each month, accessed 2026-08-28 — UNVINTAGED] |
| **Major-miner Q3-2026 production reports** | **Window: ~2026-10-14 → 2026-11-05.** Antofagasta Q3 production report ~late October (Q3-2025 landed **2025-10-23**). Freeport-McMoRan Q3 results **October 2026 — two secondary sources conflict, 2026-10-15 vs 2026-10-22** | Mine supply is the profile's supply lens, and two of the largest swing assets are impaired: **Grasberg** is still ramping from the September-2025 force majeure (pre-incident rates not before 2027) and **Cobre Panama has been idle since November 2023** | **Antofagasta cuts FY2026 group copper guidance below the current 625 kt floor** | **Antofagasta raises the FY2026 range above the current 655 kt ceiling**, or confirms the top of it | **Vague — pattern-derived.** Neither company had published its Q3-2026 date as of 2026-08-28; the two Freeport dates in circulation are secondary and **disagree by a week** | Antofagasta guidance history: **650–700 kt at the Q2-2026 production report (2026-07-14)**, cut to **625–655 kt at the 2026 half-year results** [Antofagasta plc investor news, accessed 2026-08-28 — UNVINTAGED]; Freeport date conflict [TipRanks 2026-10-15 vs secondary 2026-10-22, accessed 2026-08-28 — UNVINTAGED] |
| **FOMC decisions** | **2026-09-15/16** (with Summary of Economic Projections), **2026-10-27/28** (no SEP), **2026-12-08/09** (with SEP). Decision 14:00 ET on day two | The run's dominant **adverse** macro driver is the **US 10-year real yield at 2.36% (2026-08-28), +54bp over twelve months to a multi-decade high**. The last decision **held at 3.50–3.75%**, and its only three dissents wanted a **hike** | A **cut below 3.50–3.75%**, or a September/December SEP median that lowers the 2027 dot — **and** the 10-year real yield falling **below 2.00%** (−36bp from 2.36%) within ten business days | A **hike above 3.75%**, or the 10-year real yield rising **above 2.60%** (+24bp) | **Proven.** Federal Reserve tentative schedule for 2025–2026 | [Federal Reserve FOMC tentative meeting schedule, accessed 2026-08-28 — UNVINTAGED]; rate and yield levels from [`../macro-positioning/99_macro-positioning-synthesis.md` §Macro — UNVINTAGED] |
| **US CPI** | **2026-09-11, 08:30 ET** (August data). Later 2026 dates follow the second-week pattern but were **NOT confirmed this run** | The input that moves the real yield above | Core CPI slows enough to pull the 10-year real yield below 2.00% (same threshold as the FOMC row — deliberately the same, so the two rows cannot vote twice) | Core CPI accelerates and the 10-year real yield rises above 2.60% | **Proven for 2026-09-11**; **vague** for later prints | [US CPI release schedule, next print 2026-09-11 08:30 ET, accessed 2026-08-28 — UNVINTAGED] |
| **LME Week 2026 — and the 2027 benchmark TC/RC talk around it** | **Week of 2026-10-19.** LME Metals Seminar **Monday 2026-10-19**, QEII Centre, Westminster; LME Dinner the Tuesday | The annual window in which smelters and miners settle the **2027 benchmark treatment/refining charges** — the profile's concentrate-tightness tell — and in which the sell side publishes its 2027 balances | The 2027 benchmark TC/RC settles **below** the 2026 benchmark (smelters paid less to treat concentrate = concentrate scarcer) | The 2027 benchmark settles **above** the 2026 benchmark | **Date proven** for LME Week. **The TC/RC settlement itself has no published date** and may land outside the week | [LME Week 2026, week of 19 October, seminar Monday 19 October, accessed 2026-08-28 — UNVINTAGED] |
| **China National Day / Golden Week** | **2026-10-01 → 2026-10-07** (seven days). Make-up working days **Sunday 2026-09-20** and **Saturday 2026-10-10** | SHFE is shut for the statutory holiday, so the weekly China stock series has a hole in it, and physical offtake pauses. The profile is explicit that copper is **not** a weather commodity and that China seasonality is **mild** — this row is kept short on purpose and must not be inflated | No numeric trigger is supportable — see the note below the table | No numeric trigger is supportable — see the note below the table | **Proven.** State Council 2026 holiday notice, as relayed | [China 2026 public holiday schedule / State Council notice, accessed 2026-08-28 — UNVINTAGED, secondary] |
| **US Section 232 determination on REFINED copper** | **NO DATE. Overdue by 59 days.** The Commerce update to the President was due **2026-06-30** under Proclamation 10962 (signed 2025-07-30; Federal Register doc 2025-14893, published 2025-08-05). 2026-06-30 → 2026-08-28 = **59 days** (my arithmetic). **No replacement date has been published.** The only dated backstop is the recommended effective date, **2027-01-01 — 126 days out** | The dominant swing factor in the whole run, and it changes **no** tonne of production. It decides whether **~740 kt** of US-located metal (69.8% of the 968.4 kt visible total) is accessible to the world or trapped behind a border, against **3.7 days of ex-US cover** and **1.4 days of LME on-warrant cover**. Recommended terms: **15% from 2027-01-01, 30% from 2028-01-01** | A **Federal Register proclamation imposing a refined-copper duty of at least 15%, effective on or before 2027-01-01** — bullish for the **ex-US** price specifically | A **published determination not to impose**, or **2027-01-01 arriving with no refined duty in force** — bearish for the **ex-US** price specifically | **Existence proven. Timing VAGUE — genuinely undated.** See the section below: this is **not a directional catalyst** and under §17 it must not lift the rating either way | [Proclamation 10962 / Federal Register 2025-14893, 2025-08-05; Congressional Research Service IN12614 and Pillsbury/White & Case summaries confirming the 2026-06-30 deadline and its lapse, accessed 2026-08-28 — UNVINTAGED]. Opposing market-implied read, carried separately: **14.6% chance the 15% takes effect 2027-01-01, 37% for 30% by 2028-01-01** [broker research via FXStreet, 2026-08-10 — UNVINTAGED, verdict-stripped] |
| **Cobre Panama — Panamanian government decision** | **Window: on or before 2026-12-31.** The government is weighing a state stake of 35–40% or a lease model; President Mulino said the decision would be communicated publicly this year | The mine has been idle since **November 2023** (Supreme Court ruling that the concession law was unconstitutional). By **end-June 2026** First Quantum had processed 2.1 Mt of stockpiled ore for about **3,200 t of contained copper** — a token volume that evidences intent, not restored supply | The decision is **deferred past 2026-12-31**, or restart is refused — the mine stays out | A **restart agreement with a named concentrate-shipment date**, or shipments exceeding **3,200 t of contained copper** in a subsequent reported quarter | **Vague — window only, politically set, no calendared date** | [`../supply-demand/04_commodity-supply-security.md` and its sidecar; Northern Miner / SMM relays, accessed 2026-08-28 — UNVINTAGED] |
| **DRC copper-concentrate export ban — three-month transition to the new by-product tax regime** | **Window: ~2026-09-29**, three months from the joint ministerial order signed **2026-06-29** (immediate effect). **No published implementing date was obtained** | Small, and printed so it cannot be inflated: Q1-2026 DRC exports were **696,725 t of cathode versus 53,926 t of concentrate containing 18,863 t of copper metal** = concentrate is **2.6%** of copper in reported export streams; annualised upper bound **~75 kt/yr contained Cu**; 0.026 × 0.14 (DRC share of world mined copper, 2025) ≈ **0.36% of world mined copper**, not the 14% a headline implies | **Extension to cathode**, or waivers **refused** to the large operators | **Broad waivers or suspension** of the order | **Vague.** The order's signing date is proven; the transition end is inferred from "three months" and no implementing date was published | [`../supply-demand/04_commodity-supply-security.md`; Oregon Group relay 2026-08-06 — UNVINTAGED] |

### Why three rows carry no numeric trigger

§17 requires every numeric trigger to name the comparable it is measured against and to be capable of failing. Three rows cannot meet that bar, so they get no number rather than a fake one:

- **SHFE weekly stocks.** The two available figures — warrant 56.7 kt (2026-08-19) and weekly warehouse 70.1 kt (week 32) — are **24% apart because they are different definitions**, and **no year-earlier figure on either basis was obtained**. A threshold I cannot measure the same way twice cannot be tested (§15 matched basis).
- **China Golden Week.** The comparable would be SHFE warrant stock on the Friday before the holiday against the same point a year earlier. That year-earlier point does not exist in this run.
- **China PMI (partially).** The 50.0 line is definitionally fixed and basis-independent, so the trigger stands — but **the last two PMI prints were not obtained this run**, so I cannot show what the trigger would have done on them. That makes it a **weak** trigger and it is labelled as such.

---

## Trigger back-tests — what each threshold would have done on the last two reported periods (§17)

A trigger the status quo already satisfies is a rubber stamp. Every row above is tested here against the last two reported periods on the same basis. Where the test cannot be run, that is stated instead of assumed.

| Trigger | Last two reported periods, same basis | Would it have fired? | Verdict |
|---|---|---|---|
| COT net long **above +79,027 lots** / **−10,000 lots week-on-week** | +79,027 lots (2026-08-11), +78,648 lots (2026-08-18); week-on-week change **−379 lots** | **No, and no.** −379 lots is far inside the ±10,000 band; +78,648 did not exceed +79,027 | **Capable of failing — passes.** Year-earlier comparable on the identical basis: **+25,609 lots (2025-08-19)**, so the twelve-month build is +53,039 lots |
| LME on-warrant **below 78.7 kt** | 166.775 kt (2026-08-20), 107.05 kt (2026-08-27) | **No.** Both above the threshold | **Capable of failing — passes.** Arithmetic on what it demands: from 107.05 kt a further **−26.5%** draw is needed; the preceding week's draw was **−35.8%**, so one more week at that pace clears it. Reachable, not automatic |
| LME on-warrant **above 166.8 kt** | 166.775 kt (2026-08-20), 107.05 kt (2026-08-27) | **No.** 166.775 does not exceed 166.8; 107.05 fails outright | **Capable of failing — passes**, but by a hair on the first period. Read it as a strict inequality |
| COMEX registered+eligible **below 500 kt / above 750 kt** | 676.1 kt (2026-08-25). **The second period was not obtained** | **No** on the one period available | **Weak.** One-period test only, and no year-earlier comparable exists. Flagged in the table |
| ICSG cumulative balance **prints a deficit** | Q1-2026 **+396 kt** surplus; Q1-2025 **+135 kt** surplus | **No, twice** | **Capable of failing — passes, and it is a high bar.** For Jan–Jun 2026 to reach zero from +396 kt at Q1, **Q2-2026 alone must have run a deficit of at least −396 kt**. For Jan–Sep to reach zero, Q2+Q3 combined must total at least −396 kt. This is a demanding trigger, not a low one — say so before treating a deficit print as confirmation |
| ICSG cumulative balance **above +600 kt** for Jan–Jun 2026 | Q1-2026 +396 kt; Q1-2025 +135 kt | **No, twice** | **Capable of failing — passes.** It requires Q2-2026 to add **more than +204 kt** on top of Q1's +396 kt (600 − 396 = 204) |
| ICSG autumn forecast: **2027 balance cut below zero** / **raised above +377 kt** | Autumn-2025 round: 2026 = **−150 kt deficit**. Spring-2026 round: 2026 = **+96 kt**, 2027 = **+377 kt** | **Both sides have fired in the last two rounds** — the deficit side in autumn-2025, the surplus side in spring-2026 | **The strongest two-way test on the calendar.** This body has demonstrably swung 246 kt between consecutive rounds |
| China FAI **better than −4.0%** / **worse than −7.5%**; property **better than −15.0%** / **worse than −20.5%** | Latest print: FAI **−6.7%**, property **−19.2%**, both year-to-date y/y. **The prior period's exact figures were not obtained this run** | **No** on the latest print — both sit inside the bands | **Capable of failing on the latest period; the two-period back-test is INCOMPLETE.** Recorded as a gap, not papered over |
| NBS PMI **above 50.0 twice** / **below 49.0** | **Not obtained** | **Cannot be tested** | **Weak trigger.** Labelled as such in the table |
| Antofagasta FY2026 guidance **below 625 kt** / **above 655 kt** | **650–700 kt** at the Q2-2026 production report (2026-07-14), then **625–655 kt** at the 2026 half-year results | The cut direction **has fired once** in the last two prints; the raise direction has not | **Capable of failing — passes, and demonstrably two-way.** **Gap:** H1-2026 actual tonnage was not obtained, so I cannot compute what 625–655 kt implies for the unreported H2 run-rate. That arithmetic is owed and is not invented here |
| FOMC: cut below 3.50–3.75% / hike above 3.75%; real yield below 2.00% / above 2.60% | Last decision: **held at 3.50–3.75%**, with three dissents **for a hike**. Real yield **2.36%** on 2026-08-28, **+54bp** over twelve months | **Neither fired.** The hold satisfies neither side, and 2.36% sits between 2.00% and 2.60% | **Capable of failing — passes.** But see the attribution warning below: this tests the **driver**, not a copper price outcome |
| Section 232: **a proclamation imposing ≥15% on refined** / **a determination not to impose** | 2025-07-30 proclamation (**exempted** refined cathode); 2026-06-30 deadline **missed** | **Neither fired, twice.** Nothing has been published as of 2026-08-28 | **Capable of failing — passes.** The status quo (0% Section 232 duty on refined cathode since 2025-08-01) satisfies neither trigger |
| Cobre Panama: **deferral / refusal** vs **restart with a shipment date or >3,200 t** | No decision made; **~3,200 t of contained copper** processed from stockpile by end-June 2026 | **Neither fired.** The status quo satisfies neither side | **Capable of failing — passes** |
| DRC ban: **extension to cathode** vs **broad waivers or suspension** | This is the **fourth** iteration of the same policy (2013, 2019, 2023, 2026); the earlier three did not hold | The **bearish (lapse) side has effectively fired three times out of three previous rounds** | **Capable of failing — passes.** The base rate says the ban lapses; the trigger is set so that outcome is visible rather than assumed away |

---

## The undated binary — US Section 232 on refined copper

**Existence: proven. Timing: vague, and genuinely undated.** The Commerce update to the President was due **2026-06-30** under Proclamation 10962; as of **2026-08-28** it is **59 days late** and **no replacement date has been published**. I am not manufacturing one. The only date in the file is the **recommended effective date of 2027-01-01** — that is a deadline by which the question resolves one way or the other, not a decision date, and it sits **126 days out**, outside the 60-day tactical window (which ends 2026-10-27) and inside the 365-day strategic window.

**It is not a directional catalyst, and this is the point.** It is a two-sided binary that moves no tonne of production:

- **Duty imposed** → ~740 kt of US-located metal is trapped behind a 15–30% border charge. That is **bullish for the ex-US price** (3.7 days of ex-US cover, 1.4 days of LME on-warrant cover) and simply confirms the premium US buyers are already paying.
- **Duty not imposed** → that same metal is free to move back toward the seaborne market. That is **bearish for the ex-US price** and collapses the COMEX-over-LME premium.

The two outcomes point in opposite directions with comparable force, and the run holds **no measured probability** for either — only an unvintaged, verdict-stripped market-implied read of **14.6%** for the 15% taking effect on 2027-01-01, which is carried as an opposing fact and is **not netted** against the risk. Under **§17** an undated catalyst does not support conviction and **must not lift the rating in either direction**. Under MODULE_RULES §11 it is **not a proven critical risk** and must not be used to force `Avoid` either. It belongs in the risk register and the scenario span, not in the action verdict.

---

## The attribution warning that binds every macro row above

The macro module measured that copper's **+46.63% twelve-month move (US$4.51/lb → US$6.62/lb, +US$2.11/lb) is 0% explained and 100% residual** by every driver the profile calls dominant, because no sourced copper/USD or copper/real-yield sensitivity exists and three candidate coefficients were refused on basis grounds.

**Consequence for this calendar:** the FOMC and CPI rows test whether the **driver** moves. They carry **no coefficient onto the copper price**, so no expected price move may be inferred from them, and no adjective ("supportive", "would drive prices") may be attached. Applying an unsourced or wrong-basis sensitivity here is precisely the defect MODULE_RULES §4a exists to prevent.

---

## The one to watch

**The LME daily warehouse stock report — next print 2026-08-28, 09:00 London, and every LME business day after that.**

Three reasons it wins the slot:

1. **It is the only fully date-proven, high-frequency reading of the constraint this run actually measured as binding.** LME on-warrant stock is **107.05 kt = 1.4 days of world use** and fell **35.8% in a single week**. Everything else on the calendar with comparable importance is either window-dated (ICSG autumn round), pattern-dated (miner Q3 reports) or undated (Section 232).
2. **It is where a Section 232 resolution shows up first, in physical form.** Whichever way that binary lands, metal moves — and the LME on-warrant line is the first published series that registers it, days or weeks before any official balance does.
3. **Its triggers are genuinely two-way and neither is currently satisfied.** Below 78.7 kt needs a further −26.5% draw (last week's was −35.8%, so it is reachable); above 166.8 kt needs the whole draw reversed. Both failed on each of the last two reported days.

**Runner-up on impact, disqualified on timing:** the **ICSG autumn-2026 forecast round (window: late September → end-October)** is the single highest-impact item on the calendar, because it is the only thing that can resolve the **221 kt contradiction** (+96 kt reported surplus versus −125 kt implied deficit) that stopped this run from establishing a balance direction at all — and its two-way trigger has demonstrably fired in **both** directions across the last two rounds. It loses the slot only because ICSG publishes no forward date.

**Disqualified outright from this slot:** the **Section 232 refined-copper determination**. It is the largest event in the file by impact and it has **no date**. §17 is explicit — a catalyst with no date does not support conviction, and naming it "the one to watch" would smuggle an undated binary into the rating through the back door.

**Near-tie for first place, same day:** today's **CFTC COT print (2026-08-28, 15:30 ET)** is the first observation containing the 2026-08-24 LME squeeze week, and the entire positioning read in this run is ten days stale and predates it. It is a gauge of crowding, not a price driver — which is why it is second, not first.

---

## Data needs this calendar could not fill

1. **A published ICSG forward release calendar** (monthly bulletin dates and the autumn forecast date). Three of the highest-impact rows are pattern-derived because none exists in the public record read this run.
2. **A confirmed Freeport-McMoRan Q3-2026 date from the company's own investor-relations calendar.** Two secondary sources disagree by a week (2026-10-15 vs 2026-10-22).
3. **The 2026 benchmark TC/RC level**, so the LME Week row has a comparable instead of a direction only.
4. **A year-earlier COMEX registered+eligible stock figure and a year-earlier SHFE warrant figure**, so those two thresholds can be set against a comparable rather than against today's print.
5. **The prior-period China FAI and property figures, and the last two NBS PMI prints**, so those triggers can complete their two-period back-test.
6. **Antofagasta H1-2026 actual group copper tonnage**, so the 625–655 kt FY guidance can be converted into an implied H2 run-rate.



---

## commodity-thesis / 02_commodity-cost-curve-fair-value.md

_Source: `02_commodity-cost-curve-fair-value.md`_

# Cost Curve & Fair Value — COPPER

**Run date:** 2026-08-28 · **Run root:** `commodity/runs/COPPER/` · **Owner orb:** `commodity-cost-curve` · **Required series owned:** `copper-cost-incentive-range` / `copper.cost-incentive-range` · **Profile anchor (binding):** `frameworks/commodity/COMMODITY_PROFILES.md` §`## COPPER` — *"the 90th-percentile mine cash-cost floor + the **incentive price** (needed to sanction new mines) as a structural anchor; a range."* · **Rules:** root `CLAUDE.md` §§3–5, 9, 11, 15, 16, 21 + `.claude/agents/commodity/MODULE_RULES.md` §§2–4a, 8, 8A.

> **Evidence status, stated before any number (MODULE_RULES §8A).** `data/COPPER/` does not exist, no accepted connector vintage exists anywhere in this run, and the pulse quote transport is dead (`PULSE-MISSING`, EPERM). **The required series this orb owns — `copper.cost-incentive-range` — is UNUSABLE.** Every figure below is unvintaged live-web context carrying its own source and as-of date. Under §8A it may explain the situation but **cannot raise data sufficiency or conviction**, cannot fill a coverage row, and cannot support a rated call.
>
> **What is different about this orb, stated without overclaiming it.** Unlike the upstream modules (measured primary-source coverage 0.0%), **five primary issuer documents were read directly this run** — Capstone Copper's 2026 guidance, First Quantum's 2026–2028 guidance and Q1-2026 results, and Antofagasta's Q2-2026 Production Report and 2026 Half Year Results. That is genuine primary cost evidence and it is why the cost anchor is a real *band* rather than an assertion. **It still does not lift sufficiency**, because the series has no accepted vintage, and because **no vendor-ranked percentile cost curve was reached at all** (Wood Mackenzie, CRU and S&P Global Market Intelligence are paywalled; three direct retrievals returned HTTP 403).
>
> **Nothing below is a price forecast.** A cash-cost floor is a statement about *marginal supply behaviour* — the level below which the highest-cost producers stop covering cash and supply self-corrects. It is not a target, not a prediction, and price is under no obligation to visit it.

---

## Abstract

Copper's observed COMEX front month at **US$6.62/lb (≈ US$14,595/t, 2026-08-28)** sits **above every anchor the profile's own valuation lens can construct**. Against the incentive price that is supposed to sanction new mines — **US$12,000–13,000/t (US$5.44–5.90/lb)** — the LME benchmark at **US$14,251/t** trades at a **+9.6% to +18.8% premium**, and the COMEX leg at a **+12.3% to +21.6% premium**. Against the medium-run all-in floor band of **US$3.00–4.00/lb**, the downside is **−40% to −55%** on COMEX. Against a disclosed high-cost producer's own audited-basis all-in sustaining cost (First Quantum, **US$3.50–3.80/lb**, 2026-04-28), today's price carries a **43%–47% margin**; against reachable *net* cash costs it carries **58%–83%**. **Margin of safety on the profile's own valuation lens is negative on both venues.** Three limits bind the read and none is a footnote: (1) the incentive-price anchor is an **assertion, not a build** — its best-known quote is **28 months stale** (BlackRock, 2024-04-25) and my own capital-intensity cross-check cannot reconstruct it, leaving an unexplained implied capital charge of ~US$5,900–7,700/t; (2) the cost anchor's own **direction is contested** — Codelco's direct C1 rose **+10.0% y/y** and First Quantum raised 2026 C1 guidance **+9.6%** mid-year, while a Wood Mackenzie relay says industry C1+sustaining **fell 13.2%** in 2025; and (3) most reachable cash costs are **net of by-product credits struck at record gold (US$4,000–4,300/oz) and molybdenum**, so the floor is itself distorted by *another* commodity's bull market. **The base rate for any reversion is `not assessable`** — market-structure `03` established N = 0 lawful price observations against a floor of 30.

---

## 1. Observed Market Price (not model output)

**This section contains market prints only. Not one number here is a model output, an anchor, or a fair value.**

| Spot/front/strip | Level (unit) | Contract / date | Source |
|---|---:|---|---|
| COMEX `HG` **front month** | **US$6.62/lb** (= 662 US¢/lb; **≈ US$14,595/t** at 2,204.62 lb/t — my conversion, arithmetic shown) | Sep-2026 front, **2026-08-28** | [Web: TradingEconomics copper page, 2026-08-28 — **UNVINTAGED**, unverified, secondary] via `market-structure/99` §Price & Trend |
| LME Copper Grade A, **3-month** (the profile's global benchmark) | **US$14,251/tonne** (**≈ US$6.464/lb** — my conversion) | 3-month prompt, **2026-08-26** | [Web: wire summary, 2026-08-26 — **UNVINTAGED**, secondary] via `market-structure/99` |
| LME **cash**, implied | ≈ US$14,499/t | 3M 14,251 + cash premium 248 — **inference, not an LME cash settlement** | `market-structure/99` |
| 12-month change (COMEX front) | **+46.63%** — implies a 12-months-ago price of **US$4.5147/lb ≈ US$9,955/t** (6.62 ÷ 1.4663 — my arithmetic, **inference**, not a printed level) | to 2026-08-28 | [TradingEconomics — UNVINTAGED] |
| 52-week / all-time high, as reported | US$6.83/lb (Aug-2026) | price ≈ 3% below it | `market-structure/99` |

**Three qualifiers travel with the observed price and may not be dropped.**

1. **`copper.current-price` is MISSING** (`PULSE-MISSING`, EPERM on the pinned `tsx` runner's IPC pipe). There is **no vintaged price anchor** in this run. The US$6.62/lb figure is a secondary web quote and is not an exchange settlement.
2. **The two venues are different instruments and I do not average them.** COMEX carries a **US Section 232 location basis** (the gross COMEX-front-over-LME-3M spread is **≈ +US$547/t, +3.8%**, 2026-08-25/26, *not date-matched*); LME does not. Every fair-value comparison below is therefore run **twice**, once per venue.
3. **The dates are not matched to each other** (COMEX 2026-08-28, LME 2026-08-26) and neither is matched to the anchor dates (Jan–Aug 2026 producer guidance; Sep-2025 broker cost curve; Apr-2024 incentive quote). I state the mismatch rather than quietly netting it.

---

## 2. Model Anchor Levels (profile-relevant only)

**The COPPER profile marks exactly two anchors relevant: the ~90th-percentile mine cash-cost floor, and the new-mine incentive price. Those are built first and they set the band. A substitution row is carried below them as clearly-labelled context only — it is NOT a profile-named anchor for copper and it does not set any end of the fair-value band.**

**Basis discipline (§15, binding on every row).** *C1 cash cost*, *C1 before by-product credits*, *C1 net of by-product credits*, *C1 + sustaining capital*, and *AISC (all-in sustaining cost)* are **five different numbers**, and companies use the same word "C1" for at least two of them. They are never compared as one series. Every level below carries its own basis.

### 2a. Floor 1 — cash cost, from primary producer disclosures (anchor-grade BAND)

| Producer | **Basis, stated exactly** | 2026 level (US$/lb) | ≈ US$/t | Source, date | Retrieval |
|---|---|---:|---:|---|---|
| Antofagasta | cash cost **BEFORE** by-product credits, FY26 guidance | **2.40 – 2.60** | 5,291 – 5,732 | Q2 2026 Production Report, **2026-07-15** | **PRIMARY, read** |
| Antofagasta | **NET** cash cost (after by-product credits), FY26 guidance | **1.15 – 1.35** | 2,535 – 2,976 | Q2 2026 Production Report, **2026-07-15** | **PRIMARY, read** |
| Antofagasta | **NET** cash cost, H1-2026 **realised**, −8% y/y | **1.22** | 2,690 | 2026 Half Year Results, **2026-08-13** | **PRIMARY, read** |
| Capstone Copper | **C1** cash cost per **payable** lb, FY26 guidance (net of by-products; assumes Au US$4,300/oz, Ag US$55/oz, Mo US$20/lb, CLP 875) | **2.45 – 2.75** | 5,401 – 6,063 | 2026 Guidance, **2026-02-17** | **PRIMARY, read** |
| First Quantum | **C1**, FY26 guidance (raised from 1.95–2.20 on 2026-01-15) | **2.15 – 2.40** | 4,740 – 5,291 | Q1 2026 Results, **2026-04-28** | **PRIMARY, read** |
| Codelco | **direct C1** cash cost, Q1-2026 (vs 210.7 ¢/lb Q1-2025) | **2.318** | 5,110 | Q1 2026 Operational & Financial Report, **2026-05-29** | **secondary relay — primary PDF returned unreadable binary (852.9 KB)** |
| Freeport-McMoRan | consolidated unit **NET** cash cost, 2026 average estimate (struck on Au US$4,000/oz, Mo US$30.00/lb; **±US$0.03/lb per ±US$100/oz gold**) | **~1.75** (`market-structure/01` carried ~1.90) | ~3,858 | 4Q-2025 8-K exhibit, **relayed** | **secondary — sec.gov HTTP 403** |
| 2025 realised cross-section, 8 producers, **mixed bases** | net cash cost / C1 net / unit cash cost / total unit cost | **0.58 – 2.67** | 1,279 – 5,886 | compilation of company filings, pub. **2026-05-14** | secondary compilation |

**What this band is, and what it is not.**
- **It IS:** an **anchor-grade band** for the *cash* cost of copper production, built from five directly-read primary producer disclosures plus two relays. The **net-of-by-product** cash-cost band across the reachable 2026 disclosures runs **≈ US$1.15 – 2.75/lb (US$2,535 – 6,063/t)**, with the **upper end (US$2.30 – 2.75/lb, ≈ US$5,100 – 6,100/t)** the best available proxy for a **high-cost producer's cash cost**.
- **It is NOT a 90th percentile of world production.** A percentile is a *production-weighted rank* of the whole ~23,500 kt world cost curve. What I have is an **unweighted convenience sample of five to eight listed producers** — which under-samples Chinese, Kazakh, Russian, Zambian and DRC tonnes entirely, and over-samples large-cap disclosure. **Calling the top of this band "the 90th percentile" would be a fabrication and I do not make the claim.**
- **The vendor-ranked curve was NOT reached.** Wood Mackenzie's *Global copper mine cost curve* and *cost summary* reports and S&P Global Market Intelligence's *Mine cost outlook 2026* and *Copper and Gold Market Outlook 2026* are paywalled; direct retrievals returned **HTTP 403** (spglobal.com ×2). This is a **gap, not a guess** (§11).

### 2b. Floor 2 — ~90th-percentile all-in / sustaining cost (anchor-grade BAND)

| Anchor | Level | **Basis, stated exactly** | Grade | What it means | Source, date |
|---|---:|---|---|---|---|
| Broker cost-curve read | **≈ US$6,700/t = US$3.04/lb** | **90th percentile of C1 cash cost INCLUDING sustaining capital expenditure** — *not* AISC, *not* bare C1 | anchor-grade, **~12 months stale**, broker research (verdict-stripped, MODULE_RULES §2 tier 5) | the level Bernstein identifies as a floor supporting price | [Bernstein via Investing.com, article **2025-09-04** — UNVINTAGED secondary relay] |
| Disclosed high-cost producer **AISC** | **US$3.50 – 3.80/lb = US$7,716 – 8,378/t** (raised from 3.25–3.55 on 2026-01-15) | **AISC** — C1 **plus** sustaining capital, corporate G&A, royalties and sustaining exploration | anchor-grade, **PRIMARY, read** | what one genuinely high-cost operator must earn to keep going without shrinking | [First Quantum Q1 2026 Results, **2026-04-28**] |
| Circulating 90th-pct AISC claim | "~US$4/lb is in the realm of the 90th-percentile AISC" | **AISC** | **low-grade secondary blog, undated in the material read** — carried for range only, **not relied on** | — | [aheadoftheherd relay, accessed 2026-08-28] |
| Industry-average C1 + sustaining | 183 US¢/lb (**a mean, not a percentile**) | C1 + sustaining capital, world average | secondary relay of a paywalled vendor | see the contested-direction finding in §2d | [Wood Mackenzie relay, June-2026 reference — UNVINTAGED] |

**The C1→AISC wedge, measured rather than assumed.** First Quantum discloses both on the same date and the same basis: **AISC − C1 = US$1.35 – 1.40/lb** (3.50−2.15 to 3.80−2.40). That single primary disclosure is what makes the two floors separable rather than a muddle, and it is why Bernstein's US$3.04/lb (C1+sustaining) and FQM's US$3.50–3.80/lb (AISC) are **consistent, not contradictory** — AISC is definitionally the larger number.

> **FLOOR 2, ANCHOR-GRADE BAND: US$3.00 – 4.00/lb (US$6,614 – 8,818/t).**
> Low end = the 90th-percentile **C1 + sustaining capital** read (Bernstein, 2025-09-04). High end = a disclosed **AISC** for a high-cost producer (First Quantum, 2026-04-28), corroborated in range by the low-grade ~US$4/lb AISC claim.
> **This is a band, deliberately. A single percentile figure cannot be published because the vendor-ranked curve was not reached.** It is a statement about where marginal supply stops covering its all-in cost — **not a target and not a forecast.**

### 2c. Upper anchor — the new-mine incentive price (anchor-grade BAND, and STALE)

| Source | Level | ≈ US$/lb | Date struck | Grade |
|---|---:|---:|---|---|
| BlackRock World Mining Fund (Olivia Markham) — the canonical quote | **US$12,000/t** | 5.44 | **2024-04-25** — **28 months stale** | asset-manager assertion; MINING.COM primary relay **HTTP 403**, sourced via Mining Weekly headline |
| Citic Securities | **> US$12,000/t** average needed **in 2026** to support new mine investment | > 5.44 | 2026 relay, **undated in the material read** | broker assertion, verdict-stripped |
| Deutsche Bank Research | **US$13,000/t** for high-cost, deep-earth projects; "incentive-driven pricing regime" | 5.90 | 2026 relay | broker assertion, verdict-stripped |
| Prior vintage, for drift measurement | **~US$11,000/t** quoted as the incentive price against a then-spot of ~US$8,200/t | 4.99 | **early 2024** | secondary relay |
| Capital intensity, the one build input reachable | **~US$30,000 of capex per tonne of ANNUAL capacity** on recently built projects | — | secondary relay, undated | secondary |

> **INCENTIVE ANCHOR, ANCHOR-GRADE BAND: US$12,000 – 13,000/t (US$5.44 – 5.90/lb).**
> Above it, new supply is invited. Below it, future supply starves.

**§15 — this aggregate does NOT travel with its build, and that is a finding.** A reader cannot rebuild US$12,000–13,000/t from anything published. My own cross-check, shown so it can be checked and rejected:

```
Undiscounted full-cycle check (INFERENCE — my arithmetic on one secondary capital-intensity figure)
  capex               US$30,000 per tonne of ANNUAL capacity
  ÷ mine life         30 years  ← MY ASSUMPTION, NOT SOURCED (20 yrs → US$1,500/t; 40 yrs → US$750/t)
  = capital charge    US$1,000 per tonne of LIFETIME metal
  + upper-band net cash cost   US$5,300 – 6,100/t   (§2a)
  = undiscounted full-cycle    US$6,300 – 7,100/t
Implied by the asserted band:  US$12,000 − 6,100 = 5,900  …  US$13,000 − 5,300 = 7,700
  → an implied capital charge of US$5,900 – 7,700/t, i.e. 5.9× to 7.7× the undiscounted figure.
```

That 5.9×–7.7× gap is the discount rate, the risk premium, the permitting and build delay, the grade profile and the tax/royalty regime — **none of which was sourced**. So: the incentive band is carried as an **assertion supported by no published build**, and the confidence attaching to it is capped accordingly. It is not discarded — it is the profile's named anchor and it is the only forward-supply anchor available — but it is not treated as evidence of the same strength as a producer's own filed cost guidance.

### 2d. §16 anchor-stability test — is the anchor itself cycle-distorted?

**Root §16 requires this before either anchor is used as a floor or a corroborating read. Both anchors fail the stability test in different ways, and the honest answer on the sector-history question is `Not assessable`.**

**(i) The incentive-price anchor has drifted upward, and every quote was struck inside the same bull run.**

| Date struck | Incentive price | Spot at the time | Anchor vs 2024 | Spot vs 2024 |
|---|---:|---:|---:|---:|
| early 2024 | ~US$11,000/t | ~US$8,200/t | — | — |
| **2024-04-25** | **US$12,000/t** | — | +9.1% | — |
| 2026 (relays) | **US$12,000 – 13,000/t** | US$14,251/t (LME 3M) | +9.1% to +18.2% | **+73.8%** |

The anchor rose **+9% to +18%** while the spot rose **~+74%** over the same span. Two readings follow and both matter: the anchor is **not** simply tracking price (mildly reassuring), **and** the gap between price and anchor has widened enormously (the finding). **But every reachable incentive-price quote was struck between early-2024 and 2026 — entirely inside the 2024–2026 copper bull market. No trough-vintage incentive price (2015–2016, or pre-2021) was reached anywhere.** Under §16, an anchor whose whole reference window sits inside one cycle cannot be shown to be a stable reference point. **Sector-level history for this anchor: `Not assessable`.**

**(ii) The cost-floor anchor's own DIRECTION is contested — two reachable readings point opposite ways, and I name both rather than averaging (§3).**

| Rising | Falling |
|---|---|
| **Codelco direct C1 231.8 ¢/lb Q1-2026 vs 210.7 ¢/lb Q1-2025 = +10.0% y/y** — driven by CLP appreciation and lower production, partly offset by higher moly credits [Codelco Q1-2026, 2026-05-29, relay] | **Industry C1 + sustaining capex fell ~13.2% y/y in 2025 to 183 ¢/lb** [Wood Mackenzie relay, June-2026 reference — the vendor source itself was NOT reached] |
| **First Quantum raised FY26 C1 guidance from US$1.95–2.20 to US$2.15–2.40/lb** (midpoint 2.075 → 2.275, **+9.6%**) and **AISC from US$3.25–3.55 to US$3.50–3.80/lb** (midpoint 3.40 → 3.65, **+7.4%**) between 2026-01-15 and 2026-04-28 [both PRIMARY, read] | **Antofagasta net cash cost fell 8% y/y to US$1.22/lb in H1-2026** [PRIMARY, 2026-08-13] — **but see (iii): this is a NET figure** |
| Capstone: 2026 C1 "expected to increase compared to 2025 primarily driven by modest inflation" [PRIMARY, 2026-02-17] | S&P Global (paywalled, relayed): "cost inflation has **reset the long-term incentive price higher**" — which cuts the *other* way, toward a rising anchor |

**Resolution (§4 conservative default):** the direction of the industry cost floor is **not established**. Note the one asymmetry that decides how to use it: the *falling* reading comes from a **vendor source that was not reached**, while the *rising* readings come from **primary documents that were read**. That does not settle it — the vendor figure is production-weighted and world-wide, the producer figures are not — but it means the falling read cannot be leaned on.

**(iii) The most important distortion: most reachable cash costs are NET of by-product credits struck at record gold and molybdenum prices.** Antofagasta's net cash cost fell 8% "through operational efficiency **and strong by-product credits**"; Capstone's C1 assumes **gold US$4,300/oz, silver US$55/oz, moly US$20/lb**; First Quantum's assumes **gold US$4,000/oz**; Freeport's assumes **gold US$4,000/oz and moly US$30.00/lb** and discloses the sensitivity explicitly:

```
Freeport disclosed sensitivity, applied (INFERENCE — applies to FCX's OWN cost line only, not to the industry):
  ±US$0.03/lb of copper net cash cost per ±US$100/oz gold, off a US$4,000/oz assumption.
  Gold at US$3,000/oz (−US$1,000) → +US$0.30/lb on FCX's copper net cash cost
  = a ~17% rise on a ~US$1.75/lb base, with NOT ONE TONNE of mining having changed.
```

**Plain English: a large part of the copper "cost floor" is currently being paid for by the gold and molybdenum bull markets. If gold falls, the copper cash-cost floor rises mechanically.** This is exactly the §16 failure mode — an anchor that is itself moving with the cycle it is supposed to measure against. It is also why the **gross** (before-by-product-credit) figure matters: Antofagasta's own gross cash cost is **US$2.40–2.60/lb**, roughly **double** its US$1.15–1.35/lb net figure. **Both are printed above and neither is used alone.**

### 2e. Substitution — CONTEXT ONLY, not a profile anchor for copper

**The COPPER profile does not name a demand-destruction or substitution anchor. This row therefore sets NO end of the fair-value band and casts no fair-value vote. It is carried because the observed evidence is loud and dated, and because ignoring it would be dishonest.**

| Reading | Level | Date | Source |
|---|---:|---|---|
| Copper / aluminium price ratio, record | **4.3** | Jan-2026 | [Reuters Factbox relay, 2026-06-30 — UNVINTAGED secondary] |
| Copper / aluminium ratio, latest reachable | **~4.2** | end-Jun-2026 | same |
| Indicative substitution trigger ratio | **3.5 – 4.0** — explicitly *"an indicative signal, not a rule"* | 2026 | [industry relay, accessed 2026-08-28] |
| Realised substitution, named | Ferrari, BMW and EV makers moving to more **aluminium wiring**; Daikin in air-conditioning | Jun–Jul 2026 | [Reuters Factbox relay 2026-06-30; Forbes 2026-07-07 — secondary] |
| Material cost saving, aluminium vs copper cable >50 mm² | 40 – 55% | 2026 | [trade relay — secondary, unverified] |
| **Tonnes of copper demand actually lost to substitution** | **NOT SOURCED — no number obtained from any source** | — | — |

**The substitution ceiling is NOT computable as a price level this run, and I refuse to invent one.** A parity level requires an aluminium price aligned on date, venue and unit; the one relay that quotes an aluminium level is **internally inconsistent** (it labels "US$3,000–3,200 per metric ton on the LME" as the *copper* price, which is impossible against a US$14,251/t copper print), so it cannot be used. What the evidence does support, stated in **ratio space only** where the inputs are consistent:

> At ~4.2–4.3, the copper/aluminium ratio is already **5% to 23% above the top of the indicative 3.5–4.0 substitution-trigger band** (4.2 ÷ 4.0 = 1.05; 4.3 ÷ 3.5 = 1.23), and substitution is reported as **realised, by name, not prospective**. **The substitution ceiling is not above this market — it appears to sit beneath it.** Unsized, unvintaged, and not a profile anchor: context, not a vote.

---

## 3. Model-Implied Fair-Value Band

**A range, never a single number (§16). Each end is tied to a named anchor and carries that anchor's basis and grade.**

| Case | Fair value (US$/lb) | Fair value (US$/t) | Set by which anchor | Model / window | Uncertainty & validation status |
|---|---:|---:|---|---|---|
| **Bear** | **3.00 – 4.00** | **6,614 – 8,818** | **Floor 2** — ~90th-pct **C1 + sustaining capital** at the low end (Bernstein, 2025-09-04); disclosed **AISC** for a high-cost producer at the high end (First Quantum, 2026-04-28) | cost-curve floor; medium-run (multi-year), not a 60- or 365-day level | **Anchor-grade BAND, not a percentile.** Vendor-ranked curve not reached (HTTP 403 ×3). Low end ~12 months stale and broker-sourced. **Not validated; not validatable — no lawful price history exists to test it against (N = 0).** |
| **Base** | **5.44 – 5.90** | **12,000 – 13,000** | **The incentive price** — the level that sanctions new mine supply (BlackRock 2024-04-25; Citic 2026; Deutsche Bank 2026) | mid-cycle structural anchor; **10–20-year supply-response horizon**, NOT a 12-month target | **Anchor-grade band but an ASSERTION WITHOUT A BUILD** (§2c: implied capital charge 5.9×–7.7× the undiscounted check, unexplained). Canonical quote **28 months stale**. Every quote struck inside the 2024–26 bull run → **§16 stability `Not assessable`.** |
| **Bull** | **6.08 – 6.62** | **13,400 – 14,595** | **The point where this framework's anchors are EXHAUSTED** — the substitution-trigger top in ratio terms, and the observed price itself | not an upside target; a statement that **the highest anchor the cost/incentive lens can construct sits at or below where the market already trades** | **The honest answer, not a level.** Above US$6.62/lb this orb has **no anchor at all**: the profile names no demand-destruction anchor for copper, the substitution ceiling appears to be already breached, and the empirical distribution is `not_assessable` (market-structure `03`: N = 0 vs a floor of 30). **Upside beyond the observed price is `not assessable` from this orb.** |

**How to read the bull row, because it is unusual and it matters.** A commodity's downside anchor is its cost curve; its upside anchor is the price at which buyers switch or stop buying. For copper, the profile names only the two cost/incentive anchors, and the one substitution reading available says the switching level has **already** been passed. **So the model does not produce a bull target — it produces the statement that it has run out of anchors below the market.** Publishing an invented bull level would be exactly the fabricated bound that market-structure `03` forbids ("the absence of a bound is not a licence to pick one"). I do not publish one.

**Cross-method disagreement, not averaged (§16).** The cost floor (US$3.00–4.00/lb) and the incentive price (US$5.44–5.90/lb) are **US$1.44–2.90/lb apart**, and that is not an error — they measure different things: one is where existing supply stops covering all-in cost, the other is where new supply gets built. **They are also not independent reads.** Both are broker/vendor-derived at their headline level, both were struck inside the same 2024–2026 window, and both move with the same inputs (energy, ore grade, FX, royalties, capital-goods inflation). Under §16, **treating their coexistence as "the methods agree" would be a corroboration error, and I do not treat it as one.**

---

## 4. Reverse Read — what the market appears to expect

**This is `market-implied expectation`. It is not consensus, it is not a forecast, and it is not fact.**

### 4a. Inverted through the incentive-price anchor

```
LME 3M observed    US$14,251/t  (2026-08-26, unvintaged)
Incentive anchor   US$12,000 – 13,000/t
Premium            14,251 − 13,000 = +US$1,251/t = +9.6%
                   14,251 − 12,000 = +US$2,251/t = +18.8%

COMEX front observed  US$6.62/lb (≈US$14,595/t, 2026-08-28)
Premium            6.62 ÷ 5.8967 − 1 = +12.3%
                   6.62 ÷ 5.4431 − 1 = +21.6%
```

**Required capital-cost inflation, solved in the same model.** For the LME price to sit merely *at* the incentive price rather than above it, the anchor must have risen since it was struck:

```
14,251 ÷ 12,000 = 1.1876 over 2024-04-25 → 2026-08-26 = 2.335 years
  → 1.1876^(1/2.335) = +7.6% per year, compounded
14,251 ÷ 13,000 = 1.0962 over the same span
  → +4.0% per year, compounded
```

> **Market-implied expectation (A): new-mine capital costs have inflated at roughly 4.0% to 7.6% a year since April 2024.**
> **Indicative cross-check, with its basis mismatch named:** First Quantum embeds **2.5% a year of compounding US-dollar inflation** in its own 2027–28 cost guidance [FQM, 2026-01-15, PRIMARY]. The market-implied rate is therefore **1.6× to 3.0×** what a producer actually books forward. **Basis caveat, and it is material: FQM's 2.5% is OPERATING-cost inflation; the market-implied figure is CAPITAL-cost inflation. These are different series and mining capital-goods inflation has historically run above operating inflation.** The comparison is **indicative, not matched (§15)** — it does not disprove the market-implied rate, it shows what would have to be true.

### 4b. Inverted through the cost floor — the margin the price is handing producers

| Against | Basis | Margin at US$6.62/lb (COMEX) | Arithmetic |
|---|---|---:|---|
| Reachable **net** cash cost, low end (US$1.15/lb) | net of by-product credits | **82.6%** | (6.62 − 1.15) ÷ 6.62 |
| Reachable **net** cash cost, high end (US$2.75/lb) | net of by-product credits | **58.5%** | (6.62 − 2.75) ÷ 6.62 |
| Antofagasta **gross** cash cost (US$2.60/lb) | **before** by-product credits | **60.7%** | (6.62 − 2.60) ÷ 6.62 |
| **First Quantum disclosed AISC (US$3.80/lb)** | **all-in sustaining** | **42.6%** | (6.62 − 3.80) ÷ 6.62 |
| **First Quantum disclosed AISC (US$3.50/lb)** | **all-in sustaining** | **47.1%** | (6.62 − 3.50) ÷ 6.62 |

> **Market-implied expectation (B): even the reachable HIGH-cost producer is earning a 43%–47% margin over its own disclosed all-in sustaining cost.** In plain English: at this price essentially no reachable copper mine on earth is losing money, and the highest-cost one we can see is comfortably profitable after sustaining capital, royalties and corporate costs. **There is no cost support anywhere near this price.** A cost floor 40–55% below the market cannot be the thing holding the market up.

### 4c. The model cannot uniquely invert price to ONE assumption — so I state the SET

The observed price is consistent with **at least four** different underlying assumptions, and nothing in this run separates them. I list them rather than choosing:

1. **The incentive price is understated** — real new-mine capital inflation of 4.0–7.6%/yr since April-2024 (§4a). *Status:* not verifiable; no capital-cost index reached.
2. **A deficit deep enough that price must ration demand ABOVE the incentive price**, because new supply cannot arrive in time. *Status:* **unevidenced.** The supply-demand module records the full-year 2026 balance direction as **NOT ESTABLISHED** (+96 kt reported vs −125 kt implied by the same release's own growth rates — a 221 kt gap with **opposite signs**), and the realised Q1-2026 print was a **surplus of +396 kt**.
3. **A location premium, not a global scarcity premium.** The COMEX leg carries a **+US$547/t (+3.8%)** gross premium over LME-3M into an undated US Section 232 refined-copper decision, and **69.8% of the world's visible copper sits in COMEX/US warehouses**. *Status:* removing the tariff basis from the COMEX leg **still leaves the LME leg US$1,251–2,251/t above the incentive band**, so location cannot be the whole answer — but it is not sized.
4. **The incentive-price anchor simply does not bind at either forecast horizon.** New mines take 10–20 years from sanction to full production. An anchor about decade-scale supply says almost nothing about a 60-day or 365-day price. *Status:* this is the mechanically strongest of the four and it is developed in §5.

**No single assumption is chosen. The set is the answer.**

### 4d. Driver attribution, in the mandatory form (§4a / root §15)

**Claim tested: can the rise in the cost floor explain the price move?**

```
Attribution: marginal-producer cash cost +21.1 US¢/lb y/y (Codelco direct C1 231.8 ¢/lb Q1-2026
  vs 210.7 ¢/lb Q1-2025) × 1.0 pass-through — an ASSUMED-BOUND basis, NOT a measured
  cost-to-price elasticity (no elasticity was sourced on any basis)
  [Codelco Q1-2026 Operational & Financial Report, 2026-05-29 — secondary relay; primary PDF unreadable]
  = +US$0.211/lb of the +US$2.11/lb (+46.63%) 12-month move observed on COMEX front month
  → 10.0% explained at the MAXIMUM a cost-push story could claim, 90.0% residual (unattributed).
```

**The residual is the finding, not a caveat.** Even granting a cost-push story the most generous possible assumption — that every cent of cost inflation passes straight into price — **90% of copper's 12-month move remains unexplained by the cost curve.** This is an independent confirmation of the market-structure orb's finding (~100% residual on the tariff-premium basis), reached on a different basis. **No adjective above "explains a tenth of" is available for a cost-push explanation of this rally.**

**Claim NOT made, and refused in the same form:**

```
Attribution: incentive-price anchor +US$1,000/t (BlackRock US$12,000/t 2024-04-25 → Deutsche Bank
  relay US$13,000/t 2026) × 1.0 anchor-to-price identity — an ASSUMED IDENTITY on a ~28-MONTH basis,
  not a measured sensitivity
  = +US$1,000/t against a +US$4,640/t (+46.63%) 12-month move (US$9,955/t implied → US$14,595/t, COMEX-derived)
  → PERIOD MISMATCH — REFUSED. A 28-month anchor drift cannot be used to explain a 12-month price move
    (§15: a base rate must match the claim's period). Even taken at face value it is 21.6% explained,
    78.4% residual. THE CLAIM IS NOT MADE.
```

---

## 5. Mean-Reversion Evidence Test

**A gap alone is not a trade.** Each gap below is tested for a mechanism, the evidence that would show it working, a dated catalyst window, a base rate, and a falsifier.

| Observed-vs-model gap | Closing mechanism | Evidence required | Catalyst window | Base rate | Falsifier | Status |
|---|---|---|---|---|---|---|
| **A. Price +9.6% to +21.6% above the incentive band** (US$12,000–13,000/t) | New mine supply gets sanctioned and eventually arrives, capping price | Project sanctioning announcements; capex-guidance increases; new feasibility studies moving to construction | **None inside either forecast horizon.** Greenfield copper takes **10–20 years** from sanction to full production; the profile's own supply lens shows total mine tonnes **flat** and the concentrate stream **falling −1.1% y/y** | **`Not assessable`** — no lawful point-in-time copper price history exists in this engine (market-structure `03`: N = 0 non-overlapping outcomes vs a §10 floor of 30; 0 of 3 regimes). I cannot say how often copper has reverted from a >15% premium to incentive | The incentive price is genuinely ≥US$14,251/t today (needs 4.0–7.6%/yr capital inflation, §4a); or a proven multi-year deficit | **DESCRIPTIVE ONLY.** Mechanism exists but **has no catalyst inside 60 days or 365 days**. Under my own rule this anchor **cannot lift or lower conviction at either horizon** — it is a decade-scale statement |
| **B. Price 43%–47% above a disclosed high-cost producer's AISC; 58%–83% above net cash cost** | Supply responds through the **fast** channels, not new mines: **scrap**, **restarts of idled capacity**, and **higher-cost tonnes being pushed** | Rising secondary/scrap refined output; a Cobre Panamá restart; producers raising throughput guidance; falling scrap discount | **Already visible and dated.** Scrap-based refined output **+5.6% Jan–May-2026**, scrap share of world refined output **17.3% → 17.8%**, China's scrap share of refined feedstock **25.2% in H1-2026**; **Cobre Panamá decision window 2026-12-31** (~350 kt/yr of idled capacity); next producer cost/guidance prints **Oct–Nov 2026 (Q3 results)** | **`Not assessable`** — same reason as A. **However** the supply-demand module supplies a *quantity* base rate that is not price history: the realised Q1-2026 balance was a **surplus of +396 kt**, ~2.9× Q1-2025 | The refined-minus-scrap spread narrowing further (already reported to have "narrowed considerably" in June-2026, **direction only, unsized**), which mechanically **reduces** the incentive to feed scrap; or a sanctioned US refined tariff that structurally splits the market | **LIVE MECHANISM, DATED CATALYST, NO BASE RATE.** This is the strongest reversion channel and the only one that can act inside 12 months. Confidence capped by the missing base rate |
| **C. Cu/Al ratio 4.2–4.3 vs an indicative 3.5–4.0 trigger — the substitution ceiling appears already breached** | Buyers switch to aluminium and thrift copper out of designs, destroying demand at the margin | **Tonnes** of copper demand lost to substitution — **not sourced from any source this run** | Design cycles: **12–36 months** from a switch decision to realised volume loss. Named realised switches already reported Jun–Jul 2026 (Ferrari, BMW, EV makers, Daikin) | **`Not assessable`** — no price history, and no historical substitution-elasticity series reached | The ratio falling back below ~4.0; or substitution proving reversible (aluminium's conductivity and connector penalties make some switches sticky and some temporary — **not established either way**) | **CONTEXT ONLY.** Real, named, dated, and **unsized**. **Not a profile anchor for copper** and it sets no band end. It is the reason the bull row in §3 has no anchor above it |

**What the table says as a whole.** The framework's own anchors give a **decade-scale** reason the price is high (A, descriptive only) and a **12-month-scale** reason it could fall (B, live), and **no base rate for either**, because this engine holds zero lawful copper price observations. **A wide gap plus a live mechanism plus no base rate is a reason to cap confidence, not a reason to be short.**

---

## 6. Margin of Safety

**Two separate numbers, run twice because the two venues are different instruments (§2 of the observed-price section).**

### On the LME 3-month leg — the profile's designated global benchmark, no US tariff basis
*Observed US$14,251/t (US$6.464/lb), 2026-08-26, unvintaged*

- **Premium to the base fair value (incentive price):** **+9.6% to +18.8%** (14,251 ÷ 13,000 − 1; 14,251 ÷ 12,000 − 1). **A premium, not a discount — the margin of safety on this anchor is NEGATIVE.**
- **Downside to the floor (bear / ~90th-pct all-in band, US$6,614–8,818/t):** **−38.1% to −53.6%** (8,818 ÷ 14,251 − 1; 6,614 ÷ 14,251 − 1).

### On the COMEX front-month leg — carries the Section 232 location basis
*Observed US$6.62/lb (≈US$14,595/t), 2026-08-28, unvintaged*

- **Premium to the base fair value (incentive price, US$5.44–5.90/lb):** **+12.3% to +21.6%**.
- **Downside to the floor (bear band, US$3.00–4.00/lb):** **−39.6% to −54.7%**.

**Four qualifiers, all binding.**

1. **The downside-to-floor number is NOT a price forecast and NOT a target.** It is the distance to a level defined by *marginal supply behaviour* on a **C1-plus-sustaining and AISC basis**. Price is under no obligation to go there, and a cost floor only binds over the medium run — and only if the cost anchor itself does not fall (§2d(iii): if gold retreats, the net cash-cost floor **rises**, which would *shrink* this distance without price moving).
2. **The premium to base is measured against an anchor that is 28 months stale at its canonical quote and has no published build.** A different, better-sourced incentive price could close some or all of it. That is the single highest-value data need (§7).
3. **Neither number may be used to size a position.** Every input is unvintaged (§8A); `copper.cost-incentive-range` is UNUSABLE; and the empirical distribution these numbers would have to be sized against is `not_assessable` at all ten horizons.
4. **Current price is present but unvintaged**, so the margin of safety is *computable* rather than "Not assessable" (§11) — but it inherits the price's own provenance. It is not an exchange settlement.

---

## 7. Sufficiency & Grade

### 7a. Required-series ledger (MODULE_RULES §8A) — the one row this orb owns

| Field | Value |
|---|---|
| **Need ID** | `copper-cost-incentive-range` |
| **Stable series ID** | `copper.cost-incentive-range` |
| **Owner orb** | `commodity-cost-curve` |
| **Status** | **UNUSABLE — `no_pool` / no accepted vintage** |
| **As-of** | 2026-08-28 |
| **Retrieval / vintage ID** | `missing:copper.cost-incentive-range:no-primary-vintage` — **no `sha256:` vintage; `source_vintage_refs` = []** |
| **Exact reason** | `data/COPPER/` does not exist; no connector vintage exists in this run; the pulse transport is dead (`PULSE-MISSING`, EPERM). The **vendor-ranked percentile cost curve required to state a true 90th percentile is paywalled and was not reached**: S&P Global *Mine cost outlook 2026* **HTTP 403**, S&P Global *Copper and Gold Market Outlook 2026* **HTTP 403**, Wood Mackenzie *Global copper mine cost curve* / *cost summary* paywalled (not attempted past the landing page). Additional failures: MINING.COM BlackRock incentive-price article **HTTP 403**, SEC EDGAR FCX 4Q-2025 8-K exhibit **HTTP 403**, LME Insight substitution article **HTTP 403**, **Codelco Q1-2026 Operational & Financial Report PDF unreadable binary** (852.9 KB, extraction failed — the same failure mode the supply orb logged). |
| **Consequence** | Both anchors are published as **anchor-grade BANDS from an unweighted producer sample plus broker relays**, never as a percentile. Under §8A none of it raises sufficiency or conviction. |

**Primary documents successfully read this run — five, listed so the claim can be checked:**

1. Capstone Copper, *2026 Guidance*, **2026-02-17** — C1 US$2.45–2.75/lb, production 200–230 kt, by-product price assumptions disclosed.
2. First Quantum Minerals, *2025 Preliminary Production and 2026–2028 Guidance*, **2026-01-15** — C1 and AISC for 2026/27/28, Au US$4,000/oz and 2.5%/yr inflation assumptions disclosed.
3. First Quantum Minerals, *Q1 2026 Results*, **2026-04-28** — C1 raised to US$2.15–2.40/lb, AISC raised to US$3.50–3.80/lb, realised copper price US$5.16/lb.
4. Antofagasta plc, *Q2 2026 Production Report*, **2026-07-15** — FY26 cash cost before by-product credits US$2.40–2.60/lb; net US$1.15–1.35/lb.
5. Antofagasta plc, *2026 Half Year Results*, **2026-08-13** — H1-26 net cash cost US$1.22/lb, −8% y/y.

### 7b. Anchor grade — reached, band-only, or missing

| Anchor | Reached? | Grade | Effect on the band |
|---|---|---|---|
| Cash-cost floor (Floor 1) | **Yes** — 5 primary producer disclosures + 2 relays | **anchor-grade BAND**, US$1.15–2.75/lb net (US$2.40–2.60/lb gross, Antofagasta) | Supports Floor 2 but does not set a band end on its own |
| ~90th-percentile all-in floor (Floor 2) | **BAND ONLY** — the true percentile was **not reached** | **anchor-grade BAND**, US$3.00–4.00/lb; low end broker-sourced and ~12 months stale | **Sets the bear end** |
| Incentive price | **BAND ONLY** — assertions, **no published build** | **anchor-grade BAND**, US$12,000–13,000/t; canonical quote **28 months stale** | **Sets the base** |
| Demand-destruction / substitution ceiling | **Not a profile anchor for copper**; not computable as a price level (no consistent aluminium price obtained) | context only, ratio space only | **Sets no band end**; explains why the bull row has no anchor |
| Sector-level history for either anchor (§16 stability) | **NO** | — | **`Not assessable`** — anchor stability cannot be shown; confidence capped |

### 7c. Scores and caps

- **Data sufficiency: 22 / 100** — root §11 band **0–29, "insufficient — refuse to rate"**. Basis: the one required series this orb owns is **unusable**; no accepted vintage exists; the vendor-ranked cost curve was not reached; the observed price itself is unvintaged (`copper.current-price` MISSING). The score is above the run's other modules (market-structure 10/100) **only** because five primary producer documents were read directly — and §8A bars even that from lifting it further.
- **Fair-value confidence: CAPPED at LOW / CONTEXTUAL.** Explicit reasons, each independently sufficient: (a) the required series is unusable and every input is unvintaged (§8A); (b) the base anchor is a **28-month-stale assertion with no reconstructable build** (§15); (c) the bear anchor is a **band, not a percentile**, because the ranked curve is paywalled; (d) **§16 anchor stability is `Not assessable`** — every incentive-price quote sits inside the 2024–26 bull run, and the cost floor's own direction is contested by two reachable readings; (e) the **base rate for any mean reversion is `not assessable`** (N = 0 price observations vs a floor of 30).
- **This orb issues NO `Action:` verdict.** Under MODULE_RULES §5 and §11 that belongs to the terminal `commodity-thesis` synthesis. Nothing here constitutes a proven critical risk, so **nothing here may be used to force `Avoid`** — and equally, **a negative margin of safety on an unvintaged, cycle-unstable anchor may not be used to force a `Trim` or a short.** The run's `not_assessable` distribution and unusable coverage mechanically produce **`Research More`**, and this orb does not disturb that.
- **Single highest-value next data request (§22) — one item.** A **lawful, dated, production-weighted copper mine cost curve with percentile ranks on a stated basis (C1, C1 + sustaining, and AISC shown separately), covering at least the 2015–2016 trough and the 2021 and 2024–26 peaks.** One series fixes four things at once: it replaces the band with a real 90th percentile, it supplies the multi-cycle history §16 demands for the stability test, it settles the contested direction of the cost floor, and it gives the incentive price a build instead of an assertion. Second, and only second: a producer-disclosed or feasibility-study-derived **incentive price with its capex, IRR hurdle, mine life and grade profile published**, so the US$12,000–13,000/t band can be rebuilt rather than quoted.

---

## Note to the Commodity Thesis

- **Fair-value band: bear US$3.00–4.00/lb (US$6,614–8,818/t), base US$5.44–5.90/lb (US$12,000–13,000/t), bull US$6.08–6.62/lb (US$13,400–14,595/t).** Carry the bull row **with its qualifier or not at all**: it is **not an upside target**, it is the statement that **the highest anchor this framework can build sits at or below where the market already trades**, and that upside beyond the observed price is **`not assessable`** from cost/incentive economics.
- **Margin of safety is NEGATIVE on the profile's own valuation lens, on both venues.** LME 3M: **+9.6% to +18.8% premium** to base, **−38.1% to −53.6%** to the floor. COMEX front: **+12.3% to +21.6% premium** to base, **−39.6% to −54.7%** to the floor. **Do not restate this as "copper is expensive"** (MODULE_RULES §6 bans the bare adjective) — restate it as: *the price is 10–22% above the level analysts say sanctions new mines, and 40–55% above the level at which the highest-cost tenth of supply stops covering its all-in sustaining cost.*
- **The single most decision-relevant number: at US$6.62/lb, a disclosed high-cost producer earns a 43%–47% margin over its OWN published all-in sustaining cost** (First Quantum AISC US$3.50–3.80/lb, 2026-04-28, PRIMARY), and 58%–83% over reachable net cash costs. **There is no cost support anywhere near this price.** Whatever is holding copper up, it is not the cost curve.
- **The cost floor cannot explain the rally, and the arithmetic is printed:** granting a cost-push story a **1.0 pass-through upper bound**, Codelco's +21.1 ¢/lb C1 rise explains **+US$0.211/lb of the +US$2.11/lb move — 10.0% explained, 90.0% residual (unattributed)**. This independently corroborates market-structure's ~100% residual on a *different* basis. **The terminal thesis must not adopt a cost-inflation driver story; this orb's arithmetic does not carry one.**
- **Both anchors are cycle-suspect and §16 stability is `Not assessable`.** Every incentive-price quote reachable was struck **inside the 2024–2026 bull run**; the canonical one is **28 months stale**. The cost floor's direction is **contested** (Codelco C1 **+10.0% y/y** and FQM guidance raised **+9.6%**, both PRIMARY, against a Wood Mackenzie relay of **−13.2%** whose vendor source was **not reached**). And most reachable cash costs are **net of by-product credits struck at record gold (US$4,000–4,300/oz) and molybdenum** — **if gold falls, the copper cost floor rises mechanically** (Freeport's own disclosed sensitivity: ±US$0.03/lb per ±US$100/oz gold, so gold at US$3,000/oz adds ~US$0.30/lb, ~17%, with no change in mining).
- **The reversion channel that can act inside 12 months is scrap and substitution — NOT new mines.** New mine supply has a 10–20-year lead and **no catalyst inside either forecast horizon**, so the incentive-price gap is **descriptive only at both 60 and 365 days**. What is already live and dated: scrap-based refined output **+5.6% Jan–May-2026**, scrap share **17.3% → 17.8%**, China's scrap feedstock share **25.2% H1-2026**; the **Cobre Panamá decision window 2026-12-31** (~350 kt/yr idled); named realised aluminium substitution (Ferrari, BMW, EV makers, Daikin, Jun–Jul 2026) with the Cu/Al ratio at **4.2–4.3 against an indicative 3.5–4.0 trigger**. **None of it is sized in tonnes, and the base rate for all of it is `not assessable`.**
- **Sufficiency and routing.** `copper.cost-incentive-range` is **UNUSABLE**; data sufficiency **22/100** (§11 refuse-to-rate band); fair-value confidence **capped at low/contextual**. Five primary producer documents were read — a genuine improvement on the run's 0.0% primary coverage — and **under §8A not one of them lifts sufficiency or conviction.** This orb issues no `Action:`; it establishes **no proven critical risk**, so it may not be used to force `Avoid`, and its negative margin of safety may not be used to force a `Trim` or a short on unvintaged, cycle-unstable anchors. The run's mechanical outcome remains **`Research More`**.



---

## commodity-thesis / 03_commodity-scenario-engine.md

_Source: `03_commodity-scenario-engine.md`_

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
