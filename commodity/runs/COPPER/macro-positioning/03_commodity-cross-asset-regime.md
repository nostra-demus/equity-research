# Cross-Asset Regime & Breadth — COPPER

**Run date:** 2026-08-28 · **Run root:** `commodity/runs/COPPER/` · **Owner orb:** `commodity-cross-asset-regime` · **Governing rules:** `.claude/agents/commodity/MODULE_RULES.md` §8 (signal-evidence contract, one fact one owner), §8A (profile coverage is a decision gate), §4a (driver attribution) · **Profile:** `frameworks/commodity/COMMODITY_PROFILES.md` §`## COPPER` (lines 318–389).

**Headline verdict: the cross-asset regime read for COPPER is `not assessable`, and the confirmation breadth is `not assessable` — not "narrow", not "weak", absent.** Both required semantic series this orb owns are structurally unavailable, and so is the copper leg every one of my ratios needs. A ratio needs two aligned point-in-time close histories. This engine has zero of them, for any commodity and for any equity. I have therefore built no ratio history, computed no percentile, and measured no correlation.

What follows is a coverage ledger, a small amount of explicitly **unvintaged** live-web context with the arithmetic done on it in the open, and a plain statement of what that context can and cannot support. Per §8A none of it raises sufficiency or conviction. **A ratio is not a fair value, and an unmeasurable ratio is not a hedged one — it is no evidence at all.**

---

## 0. Required-series coverage ledger (§8A) — and why the Gold five-lens set does not apply here

### 0a. The two rows I own

| Need ID | Stable series ID | Status | As-of | Retrieval / vintage ID | Exact reason when unusable |
|---|---|---|---|---|---|
| `copper-gold-price-history` | `copper.gold-price-history` | **unavailable** | none | none | No lawful point-in-time Gold `@GC.1` close history is reachable. `.claude/connectors/` holds 27 connectors and **none is a price-history connector for any commodity** — the Gold-named entries (`bls-cpi-gold`, `treasury-real-yields-gold`, `wgc-official-gold-reserves`, `ishares-iau-gold-holdings`, `lbma-gold-vault-clearing`, `cme-gold-inventory-deliveries`, `usgs-gold-mine-supply`, `cftc-cot-gold`) are CPI, real-yield, reserves, holdings, vault, inventory, mine-supply and positioning series, not price histories. `data/COPPER/` does not exist. The swarm pulse is a **current-quote** transport only — `frameworks/commodity/pulse_sources.json` states in its own header that it "supplies SYMBOLS, quote units, and COT market-name substrings ONLY" against a CNBC `restQuote` endpoint — and it is dead in this environment anyway (`EPERM` on the pinned `tsx` runner's IPC pipe; **reproduced by me at decision time, 2026-08-28**) |
| `copper-miner-equity-history` | `copper.miner-equity-history` | **unavailable** | none | none | No split-adjusted COPX history is reachable, and the failure is worse than for gold: **there is no equity transport in this swarm at all.** `pulse_sources.json` carries twelve commodity futures symbols and not one equity ticker, so even a healthy pulse would return nothing for COPX. No connector claims the series; no file in the tree holds it |

### 0b. The failure is double, and that matters

Both of my lenses are **ratios**, and every one of them divides by, or into, COMEX copper. That leg is `copper.comex-price-history`, owned by `commodity-price-curve`, and the volatility orb established in this same run that it is **structurally absent, not stale** [`03_commodity-volatility-distribution.md`, 2026-08-28 — independently re-verified by me]. So:

- copper/gold needs **both** `copper.comex-price-history` and `copper.gold-price-history`. Neither exists. Repairing gold alone fixes nothing.
- COPX/copper needs **both** `copper.miner-equity-history` and `copper.comex-price-history`. Neither exists. Repairing COPX alone fixes nothing.

This is the single most useful thing this orb can hand to the data-request queue: **my rows cannot be unblocked one at a time.** A gold history with no copper history is still zero ratios.

### 0c. Gold's five required lenses — not applicable, and what replaces them

My standing instruction adjudicates five lenses for the Gold family (Gold/CPI, Gold/equities, miners/Gold, silver/Gold, silver-miner confirmation) and directs that for any other family I use **only profile-declared equivalents**. The COPPER profile declares exactly three price histories — `copper.comex-price-history`, `copper.gold-price-history`, `copper.miner-equity-history` — so the lawful lens set here is exactly two ratios.

| Gold lens | COPPER equivalent | Declared by the profile? | Status |
|---|---|---|---|
| Gold/CPI (purchasing power) | none declared for copper. The inflation-adjusted level read was already emitted by `commodity-price-curve` under its own `real-price-regime` family | No | **Not built.** Building it here would be a second vote on a fact another orb already owns (§8) |
| Gold/equities (defensive leadership) | none declared | No | **Not built** — no declared equity-index history |
| Miners/Gold | **COPX / COMEX copper** | **Yes** (`copper.miner-equity-history`) | **Not assessable** — both legs absent |
| Silver/Gold (breadth within the complex) | **COMEX copper / gold** — copper's declared cross-metal cycle ratio | **Yes** (`copper.gold-price-history`) | **Not assessable** — both legs absent |
| Silver miners (higher-beta confirmation) | none declared — no second producer basket | No | **Not built** |

Copper/oil, copper versus broad commodity or industrial-metals indices, and copper versus equities are **not declared price histories for this profile.** I did not construct them from undeclared or remembered series. That refusal is deliberate: the profile's family rule already says these ratios "count once under the correlation-cluster rule", so manufacturing three more undeclared rows would have added rows without adding a single independent read.

---

## 1. Relative dashboard

**Inputs, stated before the table (workflow step 2).** Every cell below that carries a number is **unvintaged secondary web context**, drawn from *different sources on different as-of dates*, and therefore fails the aligned-timestamp requirement this section is supposed to enforce. The return basis is mixed and is labelled per row. Nothing here is a measurement in the §8A sense.

- **Copper leg:** COMEX `HG` front month (Sep-26), **US$6.62/lb**, price basis, roll excluded [Web: TradingEconomics copper page, as-of 2026-08-28 — unvintaged, unverified, single secondary source; relayed via `02_commodity-price-curve.md`].
- **Gold leg:** **US$4,650.90/oz** at 07:43 ET [Web: Yahoo Finance, as-of 2026-08-28 — unvintaged, unverified]. The same page gives Dec-26 futures **$4,656** at the open and **$4,608** at 06:30 ET — a **$48/oz (1.0%) intraday spread across three quotes in one article**, and a spot-vs-December-futures basis mix. A separate source gives **$4,615/oz** as-of 2026-08-26 [Web: Fortune, 2026-08-26 — unvintaged].
- **Miner leg:** **COPX US$95.54** as-of 2026-08-27 [Web: stockanalysis.com COPX page — unvintaged, unverified]. The instrument is the **Global X Copper Miners ETF**: a basket of listed producers, expense ratio 0.65%, dividend yield 2.02%, 52-week range 48.50–99.99. It carries operating leverage, hedge books, jurisdictional risk, index-construction rules and equity-market beta on top of copper. **It is not the metal.**

| Lens | Current | 1m | 3m | 12m | Percentile/z-score | Regime read | Source vintages |
|---|---:|---:|---:|---:|---:|---|---|
| **Copper / gold** (COMEX front US$/lb ÷ gold US$/oz) | **0.0014234** — i.e. **~702.6 lb of copper per oz of gold**. My arithmetic: 6.62 ÷ 4,650.90 | **n/a** — no dated gold 1m change from a source I will cite; copper 1m is +5.43% but a one-legged change is not a ratio change | **n/a** — copper 3m "not sourced" in `02_commodity-price-curve.md`; gold 3m not sourced | **≈ +20.1%** (inference, basis-mismatched — see §3a attribution) | **not assessable — N = 0 observations** against a ≥5-year floor | **not assessable.** A single cross-sourced level with no history has no position in its own distribution | `unvintaged:tradingeconomics-copper-page:2026-08-28`; `unvintaged:yahoo-finance-gold-price-today:2026-08-28`; cross-check `unvintaged:metalcharts-gold-copper-ratio:2026-08-28` |
| **COPX / copper** (miner basket ÷ metal) | **14.43 COPX units per US$/lb** — my arithmetic: 95.54 ÷ 6.62. A scale-free construction only; the level itself has no economic meaning without its own history | **n/a** — no dated COPX 1m change sourced | **n/a** | **≈ +38.8%** miner-over-metal (inference, basis-mismatched — see §3a) | **not assessable — N = 0** | **not assessable** | `unvintaged:stockanalysis-copx:2026-08-27`; `unvintaged:tradingeconomics-copper-page:2026-08-28` |
| **COPX outright** (context for the row above, not a second lens) | **US$95.54**, i.e. **91.4% of its own 52-week range** — my arithmetic: (95.54 − 48.50) ÷ (99.99 − 48.50) = 47.04 ÷ 51.49 | n/a | n/a | **+103.47% total return** (includes dividends) | **not a percentile.** A position in a 52-week high-low band is a *range position*; it says nothing about how often the ratio has sat there | Context only | `unvintaged:stockanalysis-copx:2026-08-27` |
| Copper / broad commodity index | — | — | — | — | — | **not built** — no declared price history; BCOM/BCOMIN levels found in search were undated or pre-2026 and are not cited | none |
| Copper / oil; copper / equities | — | — | — | — | — | **not built** — not profile-declared for COPPER | none |

**Venue choice alone moves the ratio, which is why the level cannot be read.** Computed on the LME 3-month print instead of COMEX — US$14,251/tonne = US$6.464/lb [Web: wire summary, 2026-08-26 — unvintaged] — the same gold quote gives **719.5 lb per oz** rather than 702.6, a **+2.41%** difference ((719.51 − 702.55) ÷ 702.55) from nothing but the choice of exchange. Any "extreme" or "cheap" read on a copper/gold level that does not first fix the venue, the currency, the unit and the timestamp is reading its own construction choices.

---

## 2. Confirmation breadth

**Breadth verdict: not assessable. Zero independent confirmation clusters. One unvintaged context cluster, counted once.**

**Raw rows versus independent clusters.** The dashboard has two lenses with numbers. They are **not two votes**, for two separate reasons that stack:

1. **Shared component, automatic merge.** Copper/gold and COPX/copper both contain the COMEX copper leg. A move in copper alone moves both, in opposite directions arithmetically. Under the shared-component rule they cluster automatically without any correlation being measured.
2. **Profile rule.** The COPPER family rule is explicit: "Cross-asset ratios are computed from the declared price histories and **count once** under the correlation-cluster rule." Copper/gold, copper/oil, copper against broad commodity indices and miner-equity leadership are largely **one relative-cycle read**. I count it once. Had I also built copper/oil and copper/BCOM from undeclared series, the count would still have been one.

**Correlation edges emitted: zero.** The merge floor is ≥3 years and ≥150 weekly observations. I have **N = 0** weekly observations of every series involved, so I can state no coefficient at all — not a weak one, not an approximate one. A remembered or assumed miner beta would be a fabricated coefficient wearing this orb's authority, which is the precise failure §8's correlation rule exists to prevent.

**What each related market does, honestly labelled:**

| Related market | Confirms / diverges / unavailable | On what basis |
|---|---|---|
| Gold | **Unavailable as evidence.** As unvintaged context, copper (+46.63% 12m) outran gold (+22.1% 12m) — cyclical-over-defensive leadership *if* the two figures were comparable, which §3a shows they are not | No aligned history; the two legs carry different as-of dates and different instrument bases |
| Copper miner equities (COPX) | **Unavailable as evidence.** As unvintaged context, COPX (+103.47% 12m total return) roughly doubled the metal's move — directionally consistent with a levered producer basket in a metal up-cycle, and equally consistent with an equity-market re-rating that has nothing to do with copper | No aligned history; total-return versus price-only basis mismatch; no measured beta |
| Diversified miners (FCX and peers) | **Not built** | Not a declared series for this profile; a second producer basket would add a row, not an independent read |
| Broad commodity / industrial-metals indices | **Unavailable** | Not declared; no dated 2026 level or return I am willing to cite |
| Oil, broad equities | **Not built** | Not declared for COPPER |

**Independent-cluster count for the compiler: 0 conviction-eligible.** Every row I emit is non-conviction by construction (`unvintaged:` provenance, empty `source_vintage_refs`). This orb contributes no vote to either forecast horizon.

---

## 3. Competing explanations

Each divergence below is stated with the strongest **non-copper** explanation and the exact evidence that would separate the two. Where a competing explanation is owned by another orb, I name the owner and do **not** re-vote it (§8).

### 3a. Attribution arithmetic, in the required form (§4a)

Two claims in section 1 look like attributions. Both are printed here so the residual is visible rather than implied.

```
Attribution: COMEX copper front-month +46.63% over 12m [Web: TradingEconomics, as-of 2026-08-28 — unvintaged, price basis, roll excluded]
             × COPX-to-copper beta — UNMEASURED, no basis (requires ≥150 aligned weekly observations; N = 0)
  = no modelled COPX move can be produced at all, against the +103.47% 12m total return observed
    [Web: stockanalysis.com COPX, as-of 2026-08-27 — unvintaged, total-return basis including a 2.02% yield]
  → 0% explained, 100% residual (unattributed).
```

```
Attribution: gold +22.1% over 12m [Web: secondary relay, "early August 2026" as-of — unvintaged, spot basis]
             taken as the denominator of copper's +46.63% [as above — front-month futures basis]
  = ratio decomposition 1.4663 ÷ 1.2210 − 1 = +20.09% change in copper/gold over 12m
  → BASIS MISMATCH: the two legs carry different as-of dates (2026-08-28 vs "early August 2026") and different
    instrument bases (continuous front-month futures vs spot), so this is inference, not a measurement. And it is a
    DECOMPOSITION, not an attribution: 0% of copper's own +46.63% is thereby explained; 100% remains unattributed
    by this orb. The price-curve orb reached the same residual independently.
```

The +38.8% miner-over-metal figure in section 1 carries the same defect and is corrected in **both** directions, which is why I will not put a bound on it: strip COPX's ~2.0% dividend yield and the price-only miner move falls to roughly +101%; charge the copper long its roll and the metal's *implementable* return falls below +46.63% (the price-curve orb measured **≈ +6.05%/yr contango** on one contract chain, while two other unvintaged sources implied steep **backwardation**, i.e. a roll **gain** — the sign is contested). One correction narrows the gap, the other widens it, and I cannot measure either. **The honest output is that the miner-versus-metal gap is directionally positive and numerically unbounded.**

### 3b. Divergence-by-divergence

| Divergence | Strongest non-copper explanation | Evidence that would separate them |
|---|---|---|
| **Copper/gold ratio up ~20% over 12m** — reads as cyclical leadership over the defensive metal | **The copper leg is measured on a tariff-distorted contract.** The rally is reported as a shortage of metal *outside* the United States, created by US buyers pulling cathode across the Atlantic and Pacific ahead of a possible 2027 refined-copper tariff — with COMEX stocks at a record above 675,000 t after 46 consecutive daily builds while LME stocks fell to 214,550 t, −14% since 2026-07-31 [Web: mining.com / wire summaries, 2026-08-26 — unvintaged]. A copper/gold ratio built on **COMEX** is then partly a **US import-premium** ratio, not a global cycle ratio. This is a location problem wearing the costume of a demand signal | The LME–COMEX arb net of FX, freight and duty (`copper.regional-arbitrage`, `commodity-price-curve`, **unavailable**), plus the same ratio rebuilt on LME Grade A. Section 1 already shows the venue choice alone shifts the level 2.41% |
| Same divergence, **denominator side** | **Gold's own drivers moved the denominator.** Real yields and the broad USD are `commodity-macro-drivers`; official-sector buying is demand/inventory; ETF flows are positioning. A ratio can rise because the denominator fell for reasons that have nothing to do with copper | Aligned point-in-time histories for both legs, so the ratio's move can be decomposed into each leg's contribution. **I do not restate those macro facts here** — naming them as a cause would be the same fact voting twice (§8) |
| **COPX up ~2× the metal** — reads as producer economics confirming the price | **(a) Equity beta and an unrelated equity-market re-rating.** One relay attributes copper-complex strength to "AI infrastructure" demand narratives — an equity-market theme that lifts mining equities without any copper tonne changing hands. **(b) Basket composition:** COPX holds diversified producers whose revenue includes gold, silver, moly and cobalt by-products; with gold itself +22.1%, part of COPX's move is a *gold* equity move. **(c) Operating leverage** is real but is a magnifier of the metal, not independent evidence of it. **(d) Deal and jurisdiction events** in the basket. **(e) Index/ETF creation flows** into a single-theme fund | A weekly regression of COPX on copper *and* on a broad equity index over ≥150 weeks, which separates metal beta from market beta; plus COPX's holdings and revenue-by-metal breakdown to size the gold contamination. Neither is available. **Until then, miner strength is not producer confirmation of copper — it is an equity fact of unknown composition** |
| **The "copper/gold at 50-year lows" claim found in search** | **It fails its own arithmetic and is rejected, not hedged.** A relay states the ratio is at 0.00077 as-of 2026-07-29, below 2008 (0.00110) and 2020 (0.00084). Check it: 0.00077 × $4,650.90 implies copper at **$3.581/lb**, **45.9% below** the $6.62 observed a month later; inverted, $6.62 ÷ 0.00077 implies gold at **$8,597/oz**, **84.8% above** the observed quote. The same summary simultaneously says "gold has surged past $4,100/oz" while another source that day says $4,650.90. The relay does not state its convention (US$/lb vs US$/tonne over US$/oz), and under no convention does it reconcile with the dated prints | Nothing further is needed — the claim is internally inconsistent with its own period's prices, so it is **discarded, not averaged in.** It is recorded in the sidecar as a separate row linked by `contradicts` to the +20.1% context row, per §8's rule that opposing facts stay separate. **This is exactly why an unvintaged ratio cannot be given a percentile: the same week's secondary sources disagree with each other by ~2×** |

---

## 4. Regime verdict

**Breadth: `not assessable`. Regime: `not assessable`. Conviction contribution: zero.**

- **Not broad confirmation.** Nothing is confirmed. Two unvintaged context reads point the same way (copper leading gold; miners leading copper), and under both the shared-component rule and the COPPER profile's own family rule they are **one relative-cycle cluster counted once** — never two votes. One cluster of unvintaged context is not breadth.
- **Not a contradiction either.** I found no divergence measured to evidence standard. The one flatly contradictory item (the "50-year low" relay) is discarded on arithmetic, not carried as a bearish read.
- **Exact reason, identical for every row I own:** no lawful point-in-time close history exists for `copper.gold-price-history`, for `copper.miner-equity-history`, or for the `copper.comex-price-history` leg that both ratios require. N = 0 aligned observations against a ≥5-year percentile floor and a ≥150-week correlation floor. `.claude/connectors/` contains no price-history connector for any commodity or equity; `data/COPPER/` does not exist; the pulse is a quote-only transport and is dead (`EPERM`, reproduced 2026-08-28).
- **§8A consequence I honour and do not argue with:** two required semantic series remain unusable, both horizons are therefore `not_assessable` from this orb's side, and the deterministic contract mechanically produces **`Research More`** at the terminal thesis unless an independently proven critical risk forces `Avoid`. Nothing in this report converts unvintaged context into a directional call.
- **What I did not do, and would have been easy:** I did not reconstruct copper/gold or COPX/copper histories from remembered levels; I did not compute a percentile from a single cross-sourced quote; I did not assume a miner beta; I did not build copper/oil or copper/BCOM from undeclared series to make the breadth count look larger; and I did not re-state real yields, the dollar, COT positioning or ETF flows as a second causal vote for a ratio (§8 — those belong to `commodity-macro-drivers` and `commodity-positioning-flows`).
- **The one qualitative statement the context does support**, and it is a caution rather than a signal: the copper leg of every ratio here is quoted on the venue that a possible 2027 US refined-copper tariff has distorted most. **Any future run that repairs the price histories must rebuild these ratios on LME Grade A as well as COMEX and report both**, because a COMEX-only copper/gold ratio in this regime measures a US import premium at least as much as it measures the global cycle.
- **Single highest-value unblocking request from this orb:** lawful point-in-time daily close histories, with source identity and accepted immutable vintages, delivered **as a set, not one at a time** — COMEX `HG` front-month continuous back-adjusted, LME Copper Grade A cash and 3M, `@GC.1` gold, and split-adjusted COPX — of at least 5 years for percentiles and 3 years / 150 weeks for any correlation edge.

**On the sidecar.** Eight rows are written to `03_commodity-cross-asset-regime.signals.json` across the three families this orb declares (`real-assets-regime`, `related-market-breadth`, `producer-confirmation`). Every row carries an explicit `unvintaged:` or `missing:` provenance token with `source_vintage_refs: []`, every row is `conviction_eligible: false`, and `correlation_edges` is **empty** because I measured no coefficient. No `statistical` row is emitted, because no statistic was computed — and the committed registry `frameworks/commodity/validated_signals.json` currently holds `"results": []`, so any statistical row from any orb in this engine would be `contextual` regardless.
