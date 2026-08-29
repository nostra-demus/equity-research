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
