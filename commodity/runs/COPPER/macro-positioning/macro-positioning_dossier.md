# macro-positioning Module Dossier — COPPER

> Deterministic, lossless concatenation of every artifact in this module — the module synthesis and every specialist output, in order. Generated mechanically (no LLM rewriting), so nothing is omitted or paraphrased. This is the module's "see everything" tier; the module's decision lives in `99_*-synthesis.md` and the short read in `macro-positioning_memo.md`.

- Generated: 2026-08-28T14:03:31Z
- Module folder: `macro-positioning`
- Contents: 1 module synthesis + 3 specialist outputs = 4 files

## Table of Contents

- [macro-positioning — module synthesis](#macro-positioning-module-synthesis) — `99_macro-positioning-synthesis.md`
- [macro-positioning / 01_commodity-macro-drivers.md](#macro-positioning-01-commodity-macro-drivers-md) — `01_commodity-macro-drivers.md`
- [macro-positioning / 02_commodity-positioning-flows.md](#macro-positioning-02-commodity-positioning-flows-md) — `02_commodity-positioning-flows.md`
- [macro-positioning / 03_commodity-cross-asset-regime.md](#macro-positioning-03-commodity-cross-asset-regime-md) — `03_commodity-cross-asset-regime.md`


---

## macro-positioning — module synthesis

_Source: `99_macro-positioning-synthesis.md`_

# Macro & Positioning — COPPER (module synthesis)

**Run date:** 2026-08-28 · **Run root:** `commodity/runs/COPPER/` · **Module:** `macro-positioning` · **Inputs:** `01_commodity-macro-drivers.md`, `02_commodity-positioning-flows.md`, `03_commodity-cross-asset-regime.md` (each with a `.signals.json` sidecar) · **Rules:** root `CLAUDE.md` (§3, §5, §11, §12, §15) + `.claude/agents/commodity/MODULE_RULES.md` (§2, §3, §4a, §6, §8, §8A) + `frameworks/commodity/COMMODITY_PROFILES.md` §`## COPPER`.

This module adjudicates macro, positioning and cross-asset breadth. It sets **no action verdict** — that belongs to the terminal `commodity-thesis` module.

## Abstract

Net macro is a **headwind**, and its dominant driver is the **US 10-year real yield at 2.36% (2026-08-28), up 54 basis points over twelve months to a multi-decade high** — a driver that moved *against* the price [01 §1, §2]. The more important finding is what the macro lens could not do: copper's **+46.63% twelve-month move (US$4.51/lb → US$6.62/lb, +US$2.11/lb) is 0% explained and 100% residual** by every macro driver the profile calls dominant, because no sourced copper/USD or copper/real-yield sensitivity exists and three candidate coefficients were refused on basis grounds [01 §1a]. Three of the four dominant drivers moved adversely (real yields +54bp, a Fed hold at 3.50–3.75% whose only three dissents wanted a *hike*, China fixed-asset investment −6.7% and property −19.2%, both worsening), while the broad trade-weighted dollar fell just 1.39% — and +0.02%, effectively nothing, on the last fully published Federal Reserve primary observation [01 §1]. Against that, speculators sit **crowded long at the 98.7th percentile of 156 weekly COT reports (~3.0 years, COMEX Copper #1 futures-only disaggregated, report date 2026-08-18, ten days stale)** — but **52.8% of that extreme is the absence of shorts (gross short at the 14.7th percentile), not long accumulation (gross long at the 87.8th percentile)**, and physical hedgers absorbed **91.9%** of the speculators' entire 53,039-lot twelve-month build [02 §2, §3]. Cross-asset breadth is **not assessable** — zero aligned observations, no percentile, no measured correlation — so nothing independently confirms or contradicts the move [03 §2, §4]. Every figure in this module is unvintaged live-web context and **cannot raise data sufficiency or conviction** (§8A); **0 of 9 required series this module owns are usable**.

---

## Evidence status & required-series coverage (§8A)

**Every number below is unvintaged.** No accepted immutable connector vintage exists for any series in this run, and the swarm pulse transport is dead (`PULSE-MISSING`, EPERM on the pinned `tsx` runner's IPC pipe) [01 §0; 02 evidence-status block; 03 §0a]. Under MODULE_RULES §8A an unvintaged live-web fact may explain context but **cannot fill a coverage row, cannot raise sufficiency, and cannot lift conviction**. A reachable URL is not evidence; a retrieved-but-unvintaged series is context only.

| Required series (module-owned) | Owner orb | Status | Checklist consequence |
|---|---|---|---|
| `macro.broad-usd-index` | macro-drivers | **missing** — connector declared, no eligible vintage at decision time | Not proven from available data |
| `macro.us-10y-real-yield` | macro-drivers | **unavailable** — no connector claims this shared series; borrowing the Gold-bound one would be silent substitution | Not proven from available data |
| `macro.china-industrial-activity` | macro-drivers | **unavailable** — no connector at all; the profile's dominant copper demand lens | Not proven from available data |
| `macro.global-activity-demand-proxy` | macro-drivers | **unavailable** — no primary global series, no licensed PMI with source identity | Not proven from available data |
| `copper.managed-money-positioning` | positioning-flows | **manual — unusable**; 156 weekly reports + current report genuinely retrieved from the CFTC public API, but no vintage, and the freshness leg fails on its own terms (2026-08-18, ten days stale) | Not proven from available data (measured on a real history, still non-conviction) |
| `copper.lme-investment-fund-positioning` | positioning-flows | **unavailable** — one secondary number in a broker comment piece that does not state its COTR report date; ≥3-year history does not exist in this run | Not proven from available data |
| `copper.etf-flows` | positioning-flows | **unavailable** — the lawful USCF issuer page returned field labels with no populated values | Not proven from available data |
| `copper.gold-price-history` | cross-asset-regime | **unavailable** — no price-history connector exists for any commodity in the 27-connector registry | Not proven from available data |
| `copper.miner-equity-history` | cross-asset-regime | **unavailable** — no equity transport exists in this swarm at all | Not proven from available data |
| `copper.comex-price-history` *(dependency, owned by `commodity-price-curve`)* | price-curve | **structurally absent** — every cross-asset ratio needs this leg, so repairing either owned row alone still yields zero ratios | Not proven from available data |

**0 of 9 owned rows usable.** Consistent with the engine-wide `usable = 0/22`. Under §8A this makes both forecast horizons `not_assessable` from this module's side and mechanically routes the terminal thesis to `Research More` unless an independently proven critical risk forces otherwise — and **no proven critical risk exists in this module's evidence.**

---

## Net Macro Tilt & dominant driver

**Net macro tilt: headwind.** One marginally supportive driver against three adverse ones [01 §1].

| Driver (macro-owned) | 12-month move / level | Sign versus the +46.63% price move | Source, date |
|---|---|---|---|
| Broad US dollar (Fed nominal broad, trade-weighted, Jan-2-2006 = 100) | 120.5758 (Aug-2025) → 118.90 (Aug-2026 relay) = **−1.39%**; but on the last **fully published Fed primary** observation, Jul-2026 120.5970 vs Aug-2025 120.5758 = **+0.02% — unchanged over eleven months** | Same direction (helpful) but tiny; nil on the published primary | [Federal Reserve H.10 monthly nominal broad dollar index, rel. 2026-08-03 — unvintaged]; [TradingEconomics relay of the Fed series, Aug-2026, accessed 2026-08-28 — unvintaged, secondary] |
| **US 10-year real yield** (10y TIPS — the yield after expected inflation) | **2.36% (2026-08-28), +54bp** from ~1.82%; the 2026-07-23 10-year TIPS auction cleared **2.438%, the highest at auction for this term since October 2008** | **Adverse** | [TradingEconomics 10y TIPS yield, 2026-08-28 — unvintaged, secondary]; [Tipswatch auction report, 2026-07-23 — unvintaged, secondary] |
| Fed rates policy | Held **3.50%–3.75%** at the 2026-07-28/29 FOMC; nine for the hold, **three dissents preferring a 25bp increase** | **Adverse to mildly opposing** — the opposing fact is carried, not averaged: the dollar softened into Jackson Hole on expectations of eventual cuts | [Federal Reserve, FOMC minutes 28–29 July 2026 — unvintaged]; [Vantage Markets DXY commentary, 2026-08-24 — unvintaged, secondary] |
| China industrial activity (**a demand INPUT, not proof of copper demand** without a primary end-use or refined-balance series) | Industrial output **+4.5% y/y July 2026** (from +5.3%); fixed-asset investment **−6.7% y/y Jan–Jul** (from −5.7% in H1); **property investment −19.2%** (from −18.0%); infrastructure −3.6% (from −2.4%); manufacturing investment −1.7% (from −1.2%); retail sales +0.6% | **Adverse, and deteriorating in the latest print** | [National Bureau of Statistics of China, July 2026 activity data rel. 2026-08-17, via Reuters/CNBC relay — unvintaged, secondary] |
| Global activity proxy | **Not assessable.** Partial single-country stand-in only: S&P Global US flash manufacturing PMI **53.2 in August 2026**, down from 53.9 and below a 53.9 expectation — expanding but decelerating for a third month; a US flash reading is **not** the required global series and is not promoted into one | Not assessable | [S&P Global US Flash Manufacturing PMI, Aug 2026 — unvintaged, secondary] |
| Producer FX (Chile, CLP) | USD/CLP ≈ **913.67 (2026-08-28)**, peso stronger by **5.02%** over twelve months; 52-week range 850.90–983.38 | **Cannot vote** — the CLP is a copper-linked currency, so its strength is largely an *effect* of the rally; using it as a cause would be circular | [Investing.com / valutafx USD-CLP quotes, 2026-08-28 — unvintaged, secondary] |

**The dominant driver is the 10-year real yield**, for the reason the drivers orb gave and which this module accepts: it is the only macro-owned driver that is both at a multi-decade extreme and pointing the wrong way for the price; the broad dollar has done essentially nothing over eleven published months, and China activity is barred by the profile's own family rule from being converted into a copper-demand vote without a primary end-use or refined-balance series — and that series is unusable [01 §2; profile §COPPER family rules; `../supply-demand/02_commodity-demand-inventory.signals.json`].

### Attribution — carried forward verbatim, residual included (MODULE_RULES §4a, root §15)

These are the drivers orb's own attribution blocks, reproduced without compression. They are the module's headline, not a caveat.

```
Attribution: Fed nominal BROAD trade-weighted USD index −1.39%
             (120.5758 Aug-2025 → 118.9028 Aug-2026) [Federal Reserve H.10 monthly, rel. 2026-08-03,
             + TradingEconomics relay for the Aug-2026 stub, 2026-08-28 — both unvintaged]
  × NO SOURCED SENSITIVITY EXISTS for copper's price response to the broad trade-weighted dollar
  = not computable, in US$/lb or in per cent, of the +US$2.11/lb (+46.63%) observed
  → 0% explained, 100% residual (unattributed). Nothing is attributed to the dollar.
```

```
Attribution: US 10y REAL yield +54bp (≈1.82% → 2.36%, 12m to 2026-08-28)
             [TradingEconomics 10y TIPS yield, 2026-08-28 — unvintaged, secondary]
  × NO SOURCED SENSITIVITY EXISTS for copper's price response to the 10y real yield
  = not computable, of the +US$2.11/lb (+46.63%) observed
  → 0% explained. The sign is ADVERSE: real yields ROSE across a window in which copper ROSE,
    so on the transmission mechanism named above this driver SUBTRACTED from the move.
    Residual is therefore at least 100% (unattributed), and plausibly more than 100%.
```

```
Attribution: China fixed-asset investment −6.7% y/y (Jan–Jul 2026, from −5.7% in H1);
             property investment −19.2% (from −18.0%); industrial output +4.5% y/y (from +5.3%)
             [NBS China, released 2026-08-17, via Reuters/CNBC relay — unvintaged, secondary]
  × NO SOURCED SENSITIVITY EXISTS linking Chinese activity to the copper price, and the profile's
    own family rule bars treating China activity as proof of copper demand without a primary
    end-use or refined-balance series (the demand orb found the ICSG 2026 balance unusable)
  = not computable, of the +US$2.11/lb (+46.63%) observed
  → 0% explained. The sign is ADVERSE and DETERIORATING: the dominant demand lens weakened
    across the window in which the price rose 46.63%. Residual at least 100% (unattributed).
```

**Total attributed by macro: 0%. Residual: 100% (unattributed)** [01 §1a summary table].

**Three coefficients were refused rather than passed on, and the refusals travel with the finding** [01 §1a]:
1. A "cross-border demand elasticity of −0.8 to −1.2" — refused on two basis failures: it is an elasticity of demand *quantity* to effective price, not of *price* to the dollar, and it is measured against an effective-price change, not a trade-weighted-index change.
2. "A 15% DXY decline coincided with a 167% copper rise, 2008–2011" — refused: one non-overlapping episode (N = 1) is co-movement, not a coefficient, and it is measured on **DXY, a six-currency bilateral basket roughly 58% weighted to the euro — not the Fed's broad trade-weighted index**. A sensitivity carries its basis like a currency figure carries its FX rate.
3. Current DXY levels (98.55 on 2026-08-22, above 99 later that week) — context only; DXY is a different index from the required `macro.broad-usd-index` row and is not substituted for it.

Positioning ran the same refusal on its own side: **no coefficient linking managed-money net length to the copper price exists in this run**, because `copper.comex-price-history` is structurally absent, so no regression of price on positioning is possible — **0% explained, 100% residual**, and no claim that speculative buying "drove" the rally is made anywhere in this module [02 §2].

**A basis warning printed once so no downstream layer re-crosses it:** the US 10-year *nominal* yield is 4.69% (2026-08-28), the *real* yield 2.36%, an implied 10-year breakeven of ≈2.33 percentage points (derived arithmetic, both legs unvintaged). **Nominal, real and breakeven are three different bases.** Any future coefficient applies only to the variable it was measured on [01 §1a].

**What this means, stated plainly and not softened.** Copper rose 46.63% while three of the four dominant macro drivers moved against it and the fourth moved 1.39%. **This module does not know what moved the price.** The macro lens does not merely fail to explain the rally — it makes the rally harder to explain. For the dollar alone to have produced the move, copper's elasticity to the broad trade-weighted dollar would have to be **46.63 ÷ 1.3875 ≈ −33.6** (a 1% fall in the broad dollar lifting copper about 33.6%); that is a reductio showing the dollar story fails, not a measurement of one, and no sourced copper/dollar relationship anywhere near that magnitude was found [01 §1a]. Under §11/§12 this **caps conviction** and belongs in the risk summary. The wire narrative about grid, EV and data-centre demand meeting constrained mine supply, and metal pulled into US warehouses ahead of a possible 2027 refined tariff, is a **physical, location and policy story owned by `commodity-supply`, `commodity-demand-inventory` and `commodity-supply-security`, on their evidence** — and the demand orb has already recorded `copper-energy-transition-demand` as **not assessable**. It is named here only to say where the residual is *not* explained. No unquantified "energy transition" or "electrification" explanation is offered as a substitute (MODULE_RULES §6).

---

## Positioning & Flows (crowded? confirming?)

**Basis, stated once and carried on every figure below:** CFTC Commitments of Traders, **Disaggregated, FUTURES-ONLY**, `COPPER- #1 — COMMODITY EXCHANGE INC.` (COMEX), dataset `72hh-3qpy`, **report date 2026-08-18**, retrieved live 2026-08-28, unvintaged. Unit is **lots**; one COMEX Copper contract is 25,000 lb = 11.33981 t, so every tonnage below is the positioning orb's conversion. **This is not the futures-and-options combined basis** — options delta is excluded, and what a combined reading would show is **not proven from available data** [02 §1].

**Yes, speculators are crowded — and the build behind it must not be compressed.**

| Measure (2026-08-18, COMEX Copper #1, futures-only) | Level | Placement in its own 156-week (~3.0y) window |
|---|---:|---|
| Managed-money **net** length | **+78,648 lots** (≈ 892 kt) | **98.7th percentile** — 154 of 156 weeks below; **z = +1.71** (mean +31,136, standard deviation 27,796); window min −43,928, max +79,027. **Exactly one week in three years was higher, and it was seven days earlier (2026-08-11)** |
| Managed-money **gross long** | 92,097 lots (≈ 1.04 Mt) | **87.8th percentile** (137 of 156 below); +52,205 (+130.9%) over twelve months |
| Managed-money **gross short** | **13,449 lots** | **14.7th percentile** (23 of 156 below) — near the bottom of its own range; −834 (−5.8%) over twelve months |
| Long : short ratio | **6.85 : 1** | — |
| Managed-money net as a share of total open interest | **27.93%** | 13.13% twelve months ago; the speculative footprint more than doubled as a share of a book that itself grew 44.3% |
| Total open interest | 281,563 lots (≈ 3.19 Mt) | +86,483 (+44.3%) over twelve months |

Percentiles are computed server-side by the CFTC API as (count of weekly reports strictly below the current value) ÷ 156, with ties excluded from the "below" count — so each is a **lower bound** on rank [02 §2].

**The decomposition, carried intact — this is a materially different fact from record long accumulation:**

```
Attribution: managed-money net length +78,648 lots vs its own 156-week mean of +31,136 lots
  — COMEX Copper #1, FUTURES-ONLY disaggregated basis, in LOTS (not tonnes, not dollars)
  [CFTC public API 72hh-3qpy, report 2026-08-18, retrieved 2026-08-28 — UNVINTAGED]
  = long leg (92,097 − 69,671 mean long) = +22,426 lots
  + short leg (38,535 mean short − 13,449 actual short) = +25,086 lots
  = +47,512 lots of the +47,512-lot excess observed
  → 100% explained, 0% residual — 47.2% long accumulation, 52.8% short-side ABSENCE.
    This is an accounting identity, not an estimated sensitivity, so it carries no coefficient basis risk.
```

Two consequences run in opposite directions and both are real: (a) with gross shorts at the 14.7th percentile there is **almost no short base left to squeeze**, so the fuel that powers the last leg of a rally has largely been spent; (b) a crowded long book with no offsetting shorts has **nobody structurally obliged to buy a fall**, which makes an unwind cleaner and faster. **Neither statement is a direction on its own** [02 §2].

**Hedgers are heavily short and pressing, not covering.** Producer / merchant / processor / user net **−96,274 lots** (28,940 long vs 125,214 short, ≈ −1.09 Mt) — the **8.3rd percentile of net, i.e. only 13 of 156 weeks were more short (≈92nd percentile of shortness)**, against a window mean of −57,772. Over twelve months the net short **doubled** (−47,555 → −96,274, a change of −48,719 lots) while the price rose 46.63%. Week-on-week covering of +1,243 lots is a rounding error against that, not a turn [02 §3].

```
Attribution: managed-money net length +53,039 lots over 12 months (+25,609 on 2025-08-19 → +78,648 on 2026-08-18)
  — COMEX Copper #1, FUTURES-ONLY disaggregated basis, in LOTS
  [CFTC public API 72hh-3qpy, reports 2025-08-19 and 2026-08-18, retrieved 2026-08-28 — UNVINTAGED]
  = producer/merchant net −48,719 lots (−47,555 → −96,274), absorbing 91.9%
  + swaps, other reportables and non-reportables combined −4,320 lots, absorbing 8.1%
  = −53,039 lots of the +53,039 lots observed
  → 100% explained, 0% residual. Identity (the four class nets sum to zero by construction),
    not an estimated sensitivity.
```

**The physical trade sold forward into the whole rally and the speculator is carrying it.** That is the textbook risk-premium configuration, and it cuts two ways: hedgers selling at these levels are the natural sellers a physically short market produces, *and* they are the people who know their own cost curve. **Whether they are hedging into a price they think is unsustainable or simply locking in a good year is a cost-curve question owned by `commodity-cost-curve-fair-value`, whose `copper-cost-incentive-range` row is unavailable — not proven from available data** [02 §3].

**Flows are not confirming; the one obtainable flow signal is a fade.**

| Vehicle | Reading | Confirming / fading |
|---|---|---|
| **LME investment funds** (LME COTR) | **53,914 lots net long, cut by 6,340 lots on the week** — ending a two-week run of increases despite higher prices; length reduced into a price within ~3% of a reported all-time high | **Fading.** Weak evidence: undated (the source does not state the COTR report date), secondary, different exchange and different trader taxonomy from the COMEX book, and **not additive to COMEX** [ING commodities team via FXStreet, published 2026-08-19 — unvintaged secondary] |
| **`CPER`** (US Copper Index Fund) | **Not available.** The lawful USCF issuer page returned "Shares Outstanding", "Total Net Assets" and "NAV" as labels **with no populated values** | **Not assessable.** Third-party aggregator figures conflict with each other (US$732m total AUM as of 2026-08-24 versus ">US$760m in copper futures **plus** an equal cash-collateral leg"), so under §4's conservative default neither was adopted |
| `COPX` / `ICOP` / `FCX` (miner equities) | Deliberately excluded from flows | The profile is explicit that miners are a **levered confirmation, not the metal**; equity-fund flows are not copper flows |

Two structural limits stand even if CPER were resolved: **CPER's own COMEX futures already sit inside the open interest above, so adding it to a COT class total would double-count the same lots** (the arithmetic is never performed), and CPER holds **deferred** months (its August 2026 components included Dec-26 and May-27), so a creation is a bid for deferred copper, not for the Sep-26 contract the headline price quotes [02 §4].

**Official-sector activity is referenced, never counted as positioning.** State strategic stockpiling is copper's analogue of central-bank buying — China's Nonferrous Metals Industry Association publicly called for more copper in national strategic reserves [Bloomberg headline via search summary, 2026-02-03 — unvintaged], and one secondary source estimates the US strategic stockpile has passed 1 Mt (treated as unreliable, because it may restate the ~676 kt already sitting in COMEX warehouses). **SRB timing and tonnage are confidential and unpublished; the activity is unquantified in tonnes from every source reachable.** It is causally owned by `commodity-demand-inventory` as a demand/inventory fact, it appears in no positioning table, and it is in no row of the positioning sidecar [02 §5; `../supply-demand/02_commodity-demand-inventory.md` §1.6].

---

## Ownership Concentration & Liquidation Risk

All rows: CFTC COT disaggregated, futures-only, COMEX Copper #1, report **2026-08-18**, retrieved 2026-08-28 — unvintaged; percentiles over the same 156-week window [02 §5].

| Concentration measure | Long side | Short side |
|---|---:|---:|
| Gross position of largest **4** traders, % of open interest | **16.3%** | **30.3%** — the **79th percentile** of the 156-week window (124 of 156 weeks below; ties excluded, so a lower bound) |
| Gross position of largest **8** traders, % of open interest | 25.8% | 43.5% |
| **Net** position of largest 4 traders, % of open interest | 15.7% | 28.2% |
| Traders in the class | 85 managed-money longs, averaging **1,083 lots** each | 32 producer/merchant shorts, averaging **3,913 lots** each |
| Total reporting traders | **279** | |

**Gross versus net, because a modest net can hide two large opposing books.** Managed money's 92,097 gross long against 13,449 gross short nets to 78,648 — **this class is genuinely one-way (6.85:1), not a large two-sided book**. The hedger class is its mirror image (28,940 versus 125,214). And **24.51% of open interest on each side is spreading** (68,991 lots: managed money 25,262 + swaps 8,658 + other 35,071) — **a quarter of the book is calendar structure carrying no directional view and must not be read as either side's conviction.** Swap dealers are effectively flat (+6,134 net on a 98,116-lot gross book), and **who is on the other side of those swaps is not observable and is not inferred** — the orb's own largest blind spot [02 §1, §3, §5].

**Liquidation risk is two-sided, and the two sides are structurally different — they are not averaged.**
- **The long side is crowded but dispersed.** 85 accounts, top-4 gross long only 16.3% of open interest. A dispersed crowd at the 98.7th percentile does not need one big holder to fail; it **bleeds out**, because each account's stop is hit by the same move and there is essentially no short base (14.7th percentile) obliged to buy the fall.
- **The short side is smaller but far more concentrated, and therefore squeezable.** Top-4 gross short **30.3%** (79th percentile of its own three years), top-8 43.5%, 32 hedger accounts averaging 3,913 lots each. **That is exactly the structure that produced the LME event of 2026-08-24** — roughly half of remaining LME stock earmarked for withdrawal, cash–3M backwardation (near-dated metal priced above forward metal, the market's signal of physical shortage) reported at **~US$550/t, the highest in more than five years** — before more than **20,000 t** was delivered on 2026-08-25 and the spread collapsed to **~US$248/t**. Those figures are unvintaged secondary, and the market-structure orb's **formal status for delivery pressure is `not assessable`** [`../market-structure/99_market-structure-synthesis.md`].
- **The two risks contradict each other and are emitted as separate, linked rows** (`copper-managed-money-net-length-crowded` ↔ `copper-short-side-concentration-squeeze-risk`). A cluster holding both directions is `contradiction: true` under §8 and is **never conviction-eligible** — which is the correct machine outcome here, and this module does not overturn it.
- **Dealer gamma is not available.** The futures-only report carries no option open interest, and inferring dealer gamma from bare option open interest is out of scope and was not done.

---

## Cross-Asset Regime & Independent Breadth

**Breadth: `not assessable`. Regime: `not assessable`. Independent conviction-eligible clusters: zero.** This is not "narrow" and not "weak" — it is absent [03 §4].

**The failure is double-legged, and that is why it cannot be fixed one row at a time.** Both required series this orb owns (`copper.gold-price-history`, `copper.miner-equity-history`) are unavailable, and **every ratio also needs the `copper.comex-price-history` leg, which is structurally absent** — `.claude/connectors/` holds 27 connectors and none is a price-history connector for any commodity or equity; `data/COPPER/` does not exist; the pulse is a quote-only transport and is dead (EPERM, reproduced 2026-08-28). **N = 0 aligned observations** against a ≥5-year percentile floor and a ≥150-week / ≥3-year correlation floor. No percentile was computed, **no correlation coefficient was stated at all**, and `correlation_edges: []` [03 §0, §2].

**Independent clusters, not raw rows.** The dashboard carries two lenses with numbers. They are **one cluster counted once**, for two reasons that stack: (1) **shared component** — copper/gold and COPX/copper both contain the COMEX copper leg, so a move in copper alone moves both, and they merge automatically without any correlation being measured; (2) the **profile's own family rule** — "Cross-asset ratios are computed from the declared price histories and count once under the correlation-cluster rule." Building copper/oil, copper/BCOM or copper/equities from undeclared series would have added rows without adding one independent read, and the orb refused to do it [03 §2]. **This module carries the count forward as one unvintaged context cluster, zero conviction-eligible — not two votes.**

**What the unvintaged context says, with its basis failures attached:**

| Lens | Level and 12-month read | Why it is context, not evidence |
|---|---|---|
| **Copper / gold** | **0.0014234** (≈ 702.6 lb of copper per oz of gold), from US$6.62/lb ÷ US$4,650.90/oz; twelve-month change **≈ +20.1%** | **Inference, basis-mismatched.** The legs carry different as-of dates (2026-08-28 versus "early August 2026") and different instrument bases (continuous front-month futures versus spot). It is a **decomposition, not an attribution**: 1.4663 ÷ 1.2210 − 1 = +20.09%, of which **0% of copper's own +46.63% is thereby explained** |
| **COPX / copper** | **14.43** COPX units per US$/lb, from US$95.54 ÷ US$6.62; miner-over-metal **≈ +38.8%**; COPX outright +103.47% twelve-month **total return** (includes a 2.02% yield), at 91.4% of its 52-week range (48.50–99.99) | **Inference, basis-mismatched and numerically unbounded.** Strip the dividend and the price-only miner move falls to roughly +101%; charge the copper long its roll and the metal's *implementable* return falls below +46.63% — but the roll sign is contested (the price-curve orb measured ≈+6.05%/yr contango on one contract chain while two other unvintaged sources implied backwardation, i.e. a roll gain). One correction narrows the gap, the other widens it |

**The strongest competing explanation is venue distortion, not the cycle, and it is not averaged away.** The copper leg of every ratio is quoted on the **tariff-squeezed COMEX contract**: the rally is reported as a shortage of metal *outside* the United States, created by US buyers pulling cathode across the Atlantic and Pacific ahead of a possible 2027 refined-copper tariff, with **COMEX stocks at a record above 675,000 t after 46 consecutive daily builds while LME stocks fell to 214,550 t, −14% since 2026-07-31** [mining.com / wire summaries, 2026-08-26 — unvintaged]. **A copper/gold ratio built on COMEX is then partly a US import-premium ratio, not a global cycle ratio — a location problem wearing the costume of a demand signal.** The arithmetic proves the point: computed on the LME 3-month print instead (US$14,251/t = US$6.464/lb), the same gold quote gives **719.5 lb per oz rather than 702.6 — a +2.41% shift from nothing but the choice of exchange** [03 §1, §3b].

**Miner strength is a levered confirmation at best, and here it is not even that.** COPX's ~2× move is equally consistent with equity-market beta and an unrelated re-rating, with basket composition (COPX holds diversified producers whose revenue includes gold, silver, moly and cobalt by-products — and with gold itself +22.1%, part of COPX's move is a *gold* equity move), with operating leverage (a magnifier of the metal, not independent evidence of it), and with creation flows into a single-theme fund. **Until a weekly regression of COPX on copper *and* on a broad equity index over ≥150 weeks exists, miner strength is not producer confirmation of copper — it is an equity fact of unknown composition** [03 §3b]. It is never counted as the metal.

**One flatly contradictory claim was discarded on arithmetic, not hedged and not averaged in.** A relay stating copper/gold at **0.00077 as-of 2026-07-29, a "50-year low"**, fails its own arithmetic: 0.00077 × US$4,650.90 implies copper at **US$3.581/lb, 45.9% below** the US$6.62 print observed a month later; inverted, US$6.62 ÷ 0.00077 implies gold at **US$8,597/oz, 84.8% above** the observed quote. It is recorded as a separate sidecar row linked by `contradicts` to the +20.1% context row [03 §3b]. **That two secondary sources in the same week disagree by roughly 2× is itself the reason an unvintaged ratio cannot be given a percentile.**

---

## Interaction / timing risk

The three reads interact, and the interaction is worse than any of them alone.

1. **A large move with no owner.** Macro explains 0% of +46.63% and pushed the other way; positioning cannot be tested against price at all because the price history is structurally absent; cross-asset can confirm nothing because it has zero observations. **Three independent lenses, three 100% residuals.** Stacked on market-structure's own independent ~100%-residual result and its `not_assessable` distribution at all ten horizons, and on supply-demand's balance direction **not established** (35/100 under a HIGH-opacity cap of 45), **the engine does not know what is carrying this price.** A position whose driver cannot be named cannot be sized off a driver story, and it cannot be defended when it moves against you, because you will not know whether the reason has changed.
2. **No macro cushion under a crowded long.** The long book sits at the **98.7th percentile** while the real yield sits at a multi-decade high and has risen 54bp across the same window. If whatever physical or policy force is actually carrying the price fades, **there is no macro support underneath it** — and, because gross shorts are at the **14.7th percentile**, there is essentially no short base structurally obliged to buy the fall. **This is a risk to the existing move, not a bearish price call and not a short signal.** A position can sit at the 99th percentile for months while the price keeps rising; the percentile says how much room there is for the *marginal* buyer, not what the price will do.
3. **The crowding is half an absence, and that changes what to expect from it.** Because **52.8%** of the extreme is shorts who are not there rather than longs who piled in (gross long is only at the 87.8th percentile), the classic short-squeeze fuel on the *speculative* side has largely been spent — the next 5% is harder to source than the last. The squeeze risk that remains sits on the **concentrated hedger short** (top-4 gross short 30.3%, 79th percentile), which is a different mechanism with a different trigger, and which is exactly what fired on 2026-08-24 and relieved on 2026-08-25/26.
4. **The timing hole is the single largest one in this module.** The entire positioning read is dated **2026-08-18 — ten days stale — and predates the 2026-08-24 LME squeeze and its 2026-08-25/26 relief in full.** How much of the 98.7th-percentile long, the −96,274-lot hedger short, or the 30.3% top-4 short concentration survived that week is **not proven from available data.** Any read of these levels as *current* is unsupported.
5. **Miners and ratios cannot rescue the read.** The one direction-carrying flow signal obtainable (LME investment funds cutting 6,340 lots to 53,914 into a near-record price) **fades rather than confirms**, and it is undated, secondary and on a different exchange; the ETF leg is not assessable; and the two ratio lenses are one cluster counted once whose copper leg is quoted on the most venue-distorted contract available. **Nothing in this module independently confirms the move.**

**Conviction consequence (§8A, §11, §12):** every figure here is unvintaged; **0 of 9 owned required series are usable**; the `futures-positioning` cluster is `contradiction: true` and never conviction-eligible; the cross-asset orb contributes **zero** conviction-eligible clusters and **zero** correlation edges. This module raises no horizon above `not_assessable` and **contributes no directional vote to either forecast horizon.**

---

## Specialist Roll-Up — claim-fidelity pass (root §3)

One explicit pass over every claim this synthesis carries upward, against the four failure shapes.

| Carried claim | Qualifier kept? | Basis kept? | Build kept? | Verdict not hardened? |
|---|---|---|---|---|
| Net macro headwind; dominant driver the 10y real yield at 2.36%, +54bp | Yes — "unvintaged", "cannot raise sufficiency", and the drivers orb's own falsifier (if real yields rise another 25bp and copper rises with them, downgrade Headwind to Neutral) are retained | Yes — **real** yield, not nominal (4.69%) and not breakeven (≈2.33pp); the ban on crossing bases is reprinted | Yes — 1.82% → 2.36% and the 2.438% auction print are shown | Yes — stated as an adverse-signed driver explaining **0%**, never as "real yields are pressuring copper" |
| +46.63% move is 0% explained / 100% residual | Yes — named as the module headline, not a closing caveat | Yes — all three refused coefficients are carried with the exact reason (demand-quantity elasticity; N=1 DXY episode on a bilateral basket; DXY ≠ broad index) | Yes — all three `Attribution:` blocks reproduced verbatim, plus the −33.6 reductio | Yes — no driver story is asserted; "energy transition"/"electrification" is explicitly refused as a substitute (MODULE_RULES §6) |
| Broad dollar −1.39% | Yes — the **+0.02% over eleven months** on the last fully published Fed primary is carried in the same sentence every time | Yes — Fed nominal **broad trade-weighted** index, Jan-2-2006 = 100, not DXY | Yes — 120.5758 → 118.90 (relay) and 120.5758 → 120.5970 (primary) both shown | Yes — "marginally supportive", never "a weak dollar is lifting copper" |
| China activity adverse | Yes — "a demand **input**, not proof of copper demand" without a primary end-use or refined-balance series, which is unusable | Yes — NBS release 2026-08-17, via secondary relay, unvintaged | Yes — output +4.5% (from +5.3%), FAI −6.7% (from −5.7%), property −19.2% (from −18.0%), infra and manufacturing shown | Yes — no China-demand vote is cast; it explains 0% |
| Copper base price US$4.51/lb | Yes — labelled the **price-curve orb's own inference** (6.62 ÷ 1.4663), **not a printed 52-week low** | Yes — COMEX front-month, US$/lb, price basis, roll excluded | Yes — the division is shown | Yes |
| Managed money crowded at the 98.7th percentile | Yes — **ten days stale (report 2026-08-18)**, unvintaged, and predating the 2026-08-24 LME event, on every appearance | Yes — **COMEX Copper #1, futures-only disaggregated, in lots**; the combined basis is explicitly not proven | Yes — 154/156 weeks below, z = +1.71, mean +31,136, sd 27,796, window max +79,027 on 2026-08-11 | Yes — "a mean-reversion and liquidation risk to the existing move, **not** a bearish price call and **not** a short signal" |
| 52.8% of the extreme is absence of shorts | Yes — never compressed to "record spec long" | Yes — accounting identity in lots, no coefficient basis risk | Yes — the full +22,426 / +25,086 = +47,512 decomposition is reproduced verbatim | Yes — both consequences (no short fuel left; no natural bid under a fall) are carried, and neither is called a direction |
| Hedgers absorbed 91.9% of the spec build | Yes — the cost-curve question (are they hedging an unsustainable price or locking in a good year?) is retained as **not proven from available data** | Yes — same COT basis, in lots; class nets sum to zero by construction | Yes — −48,719 of −53,039, with the 8.1% remainder shown | Yes — "textbook risk-premium configuration", explicitly **not** a direction |
| Flows are fading | Yes — undated COTR, secondary, different exchange and taxonomy, **not additive to COMEX**, weak evidence | Yes — LME investment funds, lots | Yes — 53,914 net long, −6,340 w/w | Yes — recorded as pointing the opposite way to the COMEX level; the two are **not** netted against each other |
| Short-side concentration is squeezable | Yes — the LME event figures are unvintaged secondary and market-structure's formal delivery-pressure status is **`not assessable`** | Yes — gross top-4 as % of open interest, 79th percentile, ties excluded (lower bound) | Yes — 30.3% top-4, 43.5% top-8, 32 accounts at 3,913 lots avg | Yes — emitted as the **contradicting** row to the crowded-long risk; cluster stays `contradiction: true`, never conviction-eligible |
| Cross-asset breadth not assessable | Yes — "not narrow, not weak — absent"; N = 0; no coefficient stated at all | Yes — the double-legged failure (both owned rows **and** the shared `copper.comex-price-history` leg) is kept | Yes — the venue arithmetic (702.6 vs 719.5 lb/oz, +2.41%) and the discarded relay's arithmetic are both shown | Yes — counted as **one** cluster, zero conviction-eligible; miners never promoted to the metal |
| Official-sector stockpiling | Yes — unquantified in tonnes from every source reachable; the US >1 Mt estimate flagged unreliable (may restate COMEX warehouse metal) | Yes — a demand/inventory fact owned by `commodity-demand-inventory` | Yes — the NFMIA call and the contested US estimate are both named | Yes — referenced, **never counted as positioning evidence**, in no table and no sidecar row |

---

## Note to the Commodity Thesis

- **Carry the residual as the finding, not as a caveat.** Macro explains **0%** of copper's +46.63% twelve-month move and **100% is unattributed**, with three of the four dominant drivers moving against the price (real yields +54bp to 2.36%, a hold at 3.50–3.75% whose only dissents wanted a hike, China FAI −6.7% and property −19.2% both worsening) and the fourth moving 1.39% — +0.02% on the last fully published Fed primary observation. **This module cannot name what moved the price.** Under §11/§12 that caps conviction and belongs in the thesis risk summary. Do not let an unquantified electrification or data-centre narrative fill the gap: the causal owner (`commodity-demand-inventory`) has recorded `copper-energy-transition-demand` as **not assessable**.
- **Crowding is a risk to the move, not a direction — and it is half an absence.** Managed money is net long **78,648 lots at the 98.7th percentile of 156 weekly reports (~3.0y, COMEX Copper #1 futures-only disaggregated, report date 2026-08-18, ten days stale, unvintaged)**, but **52.8% of that extreme is gross short at the 14.7th percentile, not long accumulation (gross long only 87.8th)**. Read it as: little short fuel left for further upside, **and** essentially no natural bid under a fall — with no macro cushion beneath either, since the macro-owned drivers point down. It is not a short signal.
- **Liquidation risk is two-sided and must not be averaged.** Dispersed longs (85 accounts, top-4 gross long 16.3% of open interest) bleed out; the concentrated hedger short (top-4 gross short **30.3%**, 79th percentile; 32 accounts averaging 3,913 lots) squeezes — which is what fired on 2026-08-24 (backwardation ~US$550/t) and relieved on 2026-08-25/26 (~US$248/t after >20,000 t delivered). The signal cluster is `contradiction: true` and is **never conviction-eligible**; do not resolve it into one direction downstream. Note also that **24.51% of open interest on each side is spreading** and carries no view.
- **Nothing independently confirms the move — breadth is absent, not narrow.** Zero aligned observations, no percentile, no correlation edge (`correlation_edges: []`), and the two ratio lenses are **one cluster counted once** whose copper leg is quoted on the tariff-squeezed COMEX contract (COMEX stocks at a record >675,000 t while LME fell to 214,550 t; venue choice alone shifts the ratio 2.41%). Miner strength (COPX +103.47% total return) is a levered equity fact of unknown composition, **never the metal**. **0 of 9 required series this module owns are usable; every figure is unvintaged and cannot raise sufficiency or conviction, and the whole positioning read predates the 2026-08-24 LME event.** The single highest-value unblock is an accepted immutable vintage of the CFTC disaggregated COT for `COPPER- #1` (dataset `72hh-3qpy`, weekly, ≥3 years) — the one required row in this run blocked purely by the absence of a vintage rather than by a licence, a paywall or a missing dataset.



---

## macro-positioning / 01_commodity-macro-drivers.md

_Source: `01_commodity-macro-drivers.md`_

# Macro Drivers — COPPER

**Run date:** 2026-08-28 · **Run root:** `commodity/runs/COPPER/` · **Orb:** `commodity-macro-drivers` · **Rules:** root `CLAUDE.md` (§3, §5, §15) + `.claude/agents/commodity/MODULE_RULES.md` (§2, §3, §4a, §8, §8A) + `frameworks/commodity/COMMODITY_PROFILES.md` §`## COPPER`.

## 0. Evidence status, stated before any number (MODULE_RULES §8A)

**Zero of the four required semantic series this orb owns is usable.** No accepted connector vintage exists for any of them, and the swarm pulse transport is dead (`PULSE-MISSING`, EPERM on the pinned `tsx` runner's IPC pipe) [`../market-structure/00_commodity-triage.md` §3]. **Every level printed below is unvintaged live-web context labelled with its source and as-of date. Under §8A none of it can raise data sufficiency or conviction, none of it fills a coverage row, and none of it supports a rated call.** A reachable URL is not evidence. No WILTW or report-derived assertion is used anywhere in this file.

| Need ID | Stable series ID | Status | As-of | Retrieval / vintage ID | Exact reason unusable |
|---|---|---|---|---|---|
| `macro-broad-usd-index` | `macro.broad-usd-index` | **missing** | — | none | Connector `federal-reserve-broad-usd` exists and claims the shared semantic series, but **no eligible immutable vintage was knowable at decision time**. A connector declaration is not data |
| `macro-us-10y-real-yield` | `macro.us-10y-real-yield` | **unavailable** | — | none | **No connector claims this shared series.** `treasury-real-yields-gold` exists but is bound to the Gold profile, not to this semantic ID; borrowing it would be a silent substitution §8A forbids |
| `macro-china-industrial-activity` | `macro.china-industrial-activity` | **unavailable** | — | none | No connector claims this series. **The single most damaging gap for copper** — China is the dominant demand lens in the profile |
| `macro-global-activity-demand-proxy` | `macro.global-activity-demand-proxy` | **unavailable** | — | none | No connector claims this series. No primary global industrial-production/trade series and no licensed PMI feed with source identity is wired |

**Causal-ownership boundaries observed here (§8 — one fact, one causal owner).** Real yields, the broad USD, rates policy and producer FX are mine and are scored below. I emit **no** signal for: realised refined/end-use demand, inventories or official-sector stockpiling (`commodity-demand-inventory`); mine supply, disruptions, TC/RCs or scrap (`commodity-supply`); tariffs, export bans, sanctions, chokepoints and rerouting (`commodity-supply-security`); COT/LME-COTR positioning or `CPER` flows (`commodity-positioning-flows`); relative ratios (`commodity-cross-asset-regime`). The profile lists "mine-supply disruptions" inside its macro-lens sentence; **the causal owner is `commodity-supply`, and I do not duplicate it.**

**China and global activity are discussed in prose below but are deliberately NOT emitted as signal rows.** None of this orb's declared `signal_families` (`real-yields`, `broad-usd`, `rates-policy`, `producer-fx`, `energy-linkage`, `geopolitical-risk`) covers an activity/end-use-demand fact, and inventing a family to carry them would break the one-fact-one-owner compiler contract. The profile's own family rule points the same way: **China activity is a demand INPUT, not proof of copper demand** without a primary end-use or refined-balance series — and the demand orb has recorded that the ICSG 2026 refined balance failed internal reconciliation and is unusable [`../supply-demand/02_commodity-demand-inventory.signals.json`, `copper-refined-balance-2026-fails-internal-reconciliation`].

---

## 1. Driver Scorecard

| Driver | Current level / trend | Supportive / Neutral / Headwind | Why | Source, date |
|---|---|---|---|---|
| **Broad US dollar** (Fed nominal broad, trade-weighted, Jan-2-2006 = 100) | **118.90 (Aug-2026 relay)** vs **120.5758 (Aug-2025)** = **−1.39% over twelve months**. But on the last **fully published Fed primary** observation, Jul-2026 = **120.5970** vs Aug-2025 **120.5758** = **+0.02% — unchanged over eleven months**. Well below the Jan-2025 peak of 128.8369 | **Supportive, but only marginally** | Copper is priced in USD, so a cheaper dollar mechanically raises the price a non-US buyer can pay. **−1.39% is a small move**, and 11 of the 12 months contributed nothing — the entire decline sits in the single unpublished August stub | Monthly primary: [Federal Reserve H.10 monthly nominal broad dollar index, release dated 2026-08-03 — unvintaged]. Aug-2026 figure: [TradingEconomics relay of the Fed series, as-of Aug-2026, accessed 2026-08-28 — unvintaged, secondary] |
| **US 10-year real yield** (10y TIPS) | **2.36% (2026-08-28)**, **+0.54pp (+54bp) over twelve months** from ~1.82%. Cross-check 2.34% on 2026-08-26. The 2026-07-23 10-year TIPS auction cleared at **2.438% — the highest at auction for this term since October 2008** | **Headwind** | Higher real rates raise the carry cost of financing physical inventory and of sanctioning new capacity, and tighten financial conditions for the construction and grid spending copper is consumed by. The level is at a multi-decade high **and it rose across the exact window in which copper rallied 46.63%** — the driver moved against the price | [TradingEconomics US 10-year TIPS yield, as-of 2026-08-28 — unvintaged, secondary]; [ConvexTrade 10-year real yield, 2026-08-26 — unvintaged, secondary]; [Tipswatch, auction report 2026-07-23 — unvintaged, secondary] |
| **Fed rates policy** | Target range held at **3.50%–3.75%** at the 2026-07-28/29 FOMC; nine members for the hold, **three dissents preferring a 25bp INCREASE**. Market commentary reads a "9–3 Fed split" and prices eventual easing | **Headwind (with an opposing fact, below)** | A hold whose only dissents want to hike is a hawkish-leaning hold, not a pause on the way down. That keeps the real-rate headwind in place. **The opposing fact is carried, not averaged:** the dollar softened into Jackson Hole on expectations of eventual cuts, which is the transmission channel that would help copper | [Federal Reserve, FOMC minutes 28–29 July 2026 — unvintaged]; [Vantage Markets DXY commentary, 2026-08-24 — unvintaged, secondary] |
| **China industrial activity** (demand INPUT, not proof of copper demand) | Industrial output **+4.5% y/y in July 2026**, decelerating from **+5.3%** in June and missing a +4.8% poll. Fixed-asset investment **−6.7% y/y Jan–Jul**, worse than **−5.7%** in H1. **Property investment −19.2%**, from −18.0%. Infrastructure −3.6% (from −2.4%), manufacturing investment −1.7% (from −1.2%). Retail sales +0.6% | **Headwind** | Every construction- and investment-linked line the profile names — property, grid-adjacent infrastructure, manufacturing capex — is contracting and **the contraction accelerated in the latest print**. This is the profile's dominant copper demand lens, and it is deteriorating | [National Bureau of Statistics of China, July 2026 activity data released 2026-08-17, via Reuters/CNBC relay — unvintaged, secondary] |
| **Global activity proxy** | **Not assessable.** No primary global industrial-production/trade series and no licensed global PMI with source identity was obtainable. Partial single-country stand-in only: **S&P Global US Manufacturing PMI flash 53.2 in August 2026**, down from 53.9 and below a 53.9 expectation — expanding but decelerating for a third month | **Not assessable** (the US stand-in alone is Neutral) | The required row is `macro.global-activity-demand-proxy`; a single-country US flash reading is **not** that series and I do not promote it into one. Above 50 means US factories are still growing, but one country's flash PMI cannot stand for global copper-consuming activity | [S&P Global US Flash Manufacturing PMI, August 2026 — unvintaged, secondary]; required global series `unavailable` |
| **Producer FX (Chile — CLP)** | **USD/CLP ≈ 913.67 (2026-08-28)**, the peso **stronger by 5.02% over twelve months**; 52-week range 850.90–983.38 | **Neutral — and it cannot carry a causal vote** | A stronger producer currency raises Chilean miners' local cost base measured in USD, which is mildly cost-supportive for price. **But the CLP is a copper-linked currency: its strength is largely an EFFECT of the copper rally, not a cause.** Using it to explain that rally would be circular, so it is recorded and not scored as a driver | [Investing.com / valutafx USD-CLP quotes, 2026-08-28 — unvintaged, secondary] |
| **Energy-transition structural bid** | **Not scored by this orb.** The quantified grid/EV/data-centre demand bridge is the required series `copper-energy-transition-demand`, owned by `commodity-demand-inventory` — which recorded it **not assessable** | **Not scored here (context only)** | The profile lists it under macro lenses, but §8 gives the tonnage to the demand orb, and that orb declared it unmeasured. Emitting a bullish energy-transition vote here would be the same fact voting twice, off a base the causal owner says it cannot measure | [`../supply-demand/02_commodity-demand-inventory.signals.json`, `copper-energy-transition-demand-not-assessable`] |
| **Geopolitical / trade-policy risk** | **Not scored by this orb.** For copper the channel is a physical-flow restriction (Section 232, DRC/Indonesia export rules, Panama), which is `commodity-supply-security`'s jurisdiction | **Not scored here (context only)** | Gold's safe-haven lens does not transfer: copper has no monetary-hedge bid, so a geopolitical event reaches copper only by restricting metal. That is a proven-physical-restriction question, and the causal owner has already emitted 16 rows on it | [`../supply-demand/04_commodity-supply-security.signals.json`] |

**Net macro: headwind.** One marginally supportive driver (a broad dollar down 1.39%, and unchanged on the last fully published primary observation) against a 54bp rise in real yields to a multi-decade high, a hawkish-leaning Fed hold, and an accelerating contraction in Chinese fixed investment.

---

## 1a. Attribution of the recent move (§15 / MODULE_RULES §4a)

**The move being explained:** COMEX front-month copper **US$6.62/lb on 2026-08-28, +46.63% over twelve months** — an implied base of **US$4.51/lb** and a move of **+US$2.11/lb** [`../market-structure/02_commodity-price-curve.md` §1; TradingEconomics, unvintaged]. Carry the upstream qualifier: **the US$4.51/lb base is the price-curve orb's own inference (6.62 ÷ 1.4663), not a printed 52-week low.** The market-structure module already found this move **~0% explained, ~100% residual** by anything it could source [`../market-structure/99_market-structure-synthesis.md`].

### Attribution 1 — broad US dollar (the profile's named macro driver)

```
Attribution: Fed nominal BROAD trade-weighted USD index −1.39%
             (120.5758 Aug-2025 → 118.9028 Aug-2026) [Federal Reserve H.10 monthly, rel. 2026-08-03,
             + TradingEconomics relay for the Aug-2026 stub, 2026-08-28 — both unvintaged]
  × NO SOURCED SENSITIVITY EXISTS for copper's price response to the broad trade-weighted dollar
  = not computable, in US$/lb or in per cent, of the +US$2.11/lb (+46.63%) observed
  → 0% explained, 100% residual (unattributed). Nothing is attributed to the dollar.
```

**Why nothing is attributed, and what I refused.** Three candidate coefficients surfaced and **all three fail the basis test, so none was applied:**

1. A "cross-border demand elasticity of −0.8 to −1.2" [discoveryalert.com.au, 2026 — unvintaged, secondary]. **Refused: wrong basis in two ways.** It is an elasticity of demand *quantity* with respect to effective price — not a sensitivity of *price* to the dollar — and it is measured against an effective-price change, not a trade-weighted-index change. Substituting it would be the exact defect §4a exists for.
2. "A 15% DXY decline coincided with a 167% copper rise, 2008–2011" [same source]. **Refused:** a single non-overlapping historical episode (N = 1) is a co-movement, not a coefficient, and it is measured on **DXY — a six-currency bilateral basket roughly 58% weighted to the euro — not the Fed's broad trade-weighted index.** A sensitivity carries its basis like a figure carries its FX rate; a DXY-measured relationship may not be applied to a broad-index move.
3. Current DXY readings (98.55 on 2026-08-22, its lowest since May; above 99 later that week) [Vantage Markets, 2026-08-24 — unvintaged]. **Recorded as context only.** DXY is a different index from the required `macro.broad-usd-index` row and is **not** substituted for it.

**The reductio, which is arithmetic and not an attribution.** Inverting the observed numbers: for the dollar alone to have produced the move, copper's elasticity to the broad trade-weighted dollar would have to be **46.63 ÷ 1.3875 ≈ −33.6** — a 1% fall in the broad dollar lifting copper about 33.6%. That is the coefficient the claim would *require*; **no sourced coefficient exists to compare it against, and no published copper/dollar relationship this orb could find is remotely near that magnitude.** This is a reason to reject a dollar-driven story, not a measurement of one.

### Attribution 2 — US 10-year real yield

```
Attribution: US 10y REAL yield +54bp (≈1.82% → 2.36%, 12m to 2026-08-28)
             [TradingEconomics 10y TIPS yield, 2026-08-28 — unvintaged, secondary]
  × NO SOURCED SENSITIVITY EXISTS for copper's price response to the 10y real yield
  = not computable, of the +US$2.11/lb (+46.63%) observed
  → 0% explained. The sign is ADVERSE: real yields ROSE across a window in which copper ROSE,
    so on the transmission mechanism named above this driver SUBTRACTED from the move.
    Residual is therefore at least 100% (unattributed), and plausibly more than 100%.
```

**Basis warning, printed so no downstream orb re-crosses it.** The US 10-year **nominal** yield is **4.69% (2026-08-28)** and the real yield is **2.36%**, an implied 10-year breakeven of **≈2.33pp** (my arithmetic, labelled derived, both legs unvintaged). **Nominal, real and breakeven are three different bases.** Any future coefficient must be applied only to the variable it was measured on; using a nominal-yield sensitivity on a real-yield change — the precise failure §15's worked example records — is banned here.

### Attribution 3 — China industrial activity

```
Attribution: China fixed-asset investment −6.7% y/y (Jan–Jul 2026, from −5.7% in H1);
             property investment −19.2% (from −18.0%); industrial output +4.5% y/y (from +5.3%)
             [NBS China, released 2026-08-17, via Reuters/CNBC relay — unvintaged, secondary]
  × NO SOURCED SENSITIVITY EXISTS linking Chinese activity to the copper price, and the profile's
    own family rule bars treating China activity as proof of copper demand without a primary
    end-use or refined-balance series (the demand orb found the ICSG 2026 balance unusable)
  = not computable, of the +US$2.11/lb (+46.63%) observed
  → 0% explained. The sign is ADVERSE and DETERIORATING: the dominant demand lens weakened
    across the window in which the price rose 46.63%. Residual at least 100% (unattributed).
```

### Attribution summary — the residual IS the finding

| Driver I own | 12-month move | Sign vs the +46.63% price move | Share of the move explained |
|---|---|---|---:|
| Broad trade-weighted USD | −1.39% | Same direction (helpful) but tiny; +0.02% (nil) on the last fully published primary point | **0%** — no sourced sensitivity |
| US 10y real yield | +54bp, to a multi-decade high | **Adverse** | **0%** |
| Fed policy rate | Held 3.50–3.75%, three hike dissents | **Adverse to mildly opposing** | **0%** |
| China fixed investment / property | −6.7% / −19.2%, both worsening | **Adverse** | **0%** |
| Producer FX (CLP) | Peso +5.02% | Endogenous to copper — circular, cannot vote | **0%** |
| **Total attributed by macro** | | | **0% — 100% residual (unattributed)** |

**Read this as the finding, not as a hedge.** Copper rose 46.63% while three of the four macro drivers the profile calls dominant moved *against* it and the fourth moved 1.39%. **The macro lens does not merely fail to explain the rally — it makes the rally harder to explain, not easier.** Stacked on market-structure's independent ~100%-residual result, the engine does not know what moved this price. Under §11/§12 and MODULE_RULES §4a that **caps conviction** and belongs in the risk summary: any COPPER thesis in this run rests on a driver story that neither this orb nor the market-structure orb can evidence. The wire narrative — AI/data-centre and grid demand meeting constrained mine supply, plus metal pulled into US warehouses ahead of a possible 2027 refined tariff — is a **physical, location and policy story owned by `commodity-supply`, `commodity-demand-inventory` and `commodity-supply-security`, on their evidence, not mine.** It is named here only to say where the residual is *not* explained by macro.

---

## 2. The driver that matters most now

**The US 10-year real yield, at 2.36% and up 54bp over the year — because it is the only driver I own that is both at a multi-decade extreme and pointing the wrong way for the price.** The broad dollar has done essentially nothing (+0.02% on the last fully published Fed primary observation over eleven months), so it cannot be what matters. China activity is deteriorating but the profile forbids converting it into a copper-demand vote without a primary end-use or refined-balance series, and that series is unusable. Real yields are the live, measurable, macro-owned variable through which copper's inventory-financing cost and its construction/grid demand are actually squeezed — and copper has so far ignored them completely, which is precisely why they matter: **a 46.63% rally that is running against a multi-decade-high real rate has no macro cushion under it if the physical story that is actually carrying it fades.**

**What would flip it.**
- **Flips to Supportive:** the 10-year real yield falling back through roughly **2.00%** (a ~36bp decline, the level it traded near in April 2026) on a Fed that starts cutting rather than holding — i.e. the three July hike dissents reversing to a cut majority. Watch the next FOMC statement and the next 10-year TIPS auction result against the 2.438% cleared on 2026-07-23.
- **Flips harder to Headwind:** real yields pushing above **2.50%** (roughly the July auction level plus 6bp), or the Fed actually delivering the hike three members already wanted at the July meeting.
- **What would make it stop mattering:** a usable `copper-refined-balance` or `copper-energy-transition-demand` vintage proving the rally is a physical-deficit event. Until one exists, the macro headwind is the only quantified force acting on the price, and it points down.

**Falsifier for this orb's own read (§8, root §8):** if the 10-year real yield rises another 25bp and copper rises with it again, the real-rate transmission channel described here is not operating on copper in this regime, and this scorecard's Headwind mark should be downgraded to Neutral rather than defended.

**Single highest-value next data request from this orb (§22):** an accepted immutable vintage for **`macro.china-industrial-activity`** — the only required row I own that has *no connector at all* and that the profile names the dominant copper demand lens. `macro.broad-usd-index` already has a declared connector needing only an eligible vintage; the China row needs to be built from nothing, and without it the largest macro input to copper stays a prose relay that can never lift sufficiency.



---

## macro-positioning / 02_commodity-positioning-flows.md

_Source: `02_commodity-positioning-flows.md`_

# Positioning & Flows — COPPER

**Run date:** 2026-08-28 · **Run root:** `commodity/runs/COPPER/` · **Rules:** root `CLAUDE.md` + `.claude/agents/commodity/MODULE_RULES.md` + `frameworks/commodity/COMMODITY_PROFILES.md` §`## COPPER` (lines 318–389).

> **Evidence status, stated before any number (MODULE_RULES §8A).** **No accepted connector vintage exists for any series in this run, and the swarm pulse transport is dead (`PULSE-MISSING`, EPERM)** [`market-structure/00_commodity-triage.md` §3; 0 of 22 required series usable engine-wide]. Every figure below is **unvintaged**: either a live retrieval from the CFTC public API made at decision time, or arithmetic on it, or a dated secondary web report. Under §8A this material **may explain context but cannot raise sufficiency or conviction, and cannot fill a required coverage row.** Of the **three** required rows this orb owns, **0 are usable** (ledger in §1a). Nothing here is a recommendation to buy, size or hold anything, and this orb sets **no action verdict** — positioning is a risk and timing overlay, not a fundamental.
>
> **One thing IS different from the sibling orbs, and it should be said plainly:** the CFTC public API was not merely *reachable* — **156 weekly observations plus the current report were actually retrieved**, and the report's own class positions reconcile to open interest to the lot on both sides (§1). So the percentiles below are measured on a real history, not asserted. They still carry no vintage, so they still cannot lift conviction. A reachable URL is not evidence; a retrieved-but-unvintaged series is evidence of *context only*.

---

## 1. Ownership Map & Perimeter

**Report, unit and perimeter, stated once and carried everywhere below.** Source is the **CFTC Commitments of Traders, Disaggregated, FUTURES-ONLY** report for **`COPPER- #1 — COMMODITY EXCHANGE INC.`** (COMEX), dataset `72hh-3qpy` on the CFTC public API, **report date 2026-08-18**, retrieved live 2026-08-28. Unit is **lots (contracts)**; one COMEX Copper contract is **25,000 lb = 11.33981 t**, so tonnage figures below are my conversion, labelled.

**Basis note that must travel (§4a).** This is the **futures-only** basis, as the COPPER profile requires (`copper-managed-money-positioning`: "Copper #1 futures-only disaggregated report"). It is **not** the futures-and-options **combined** basis. Options delta is excluded, so every level and percentile here is a futures-only statistic and is not interchangeable with a combined-basis figure. **I did not retrieve the combined report, so what a combined reading would show is not proven from available data.**

| Holder class | Observable vehicle/report | Gross long | Gross short | Net / holdings | Share of OI (long / short) | Overlap or blind spot | Source/date |
|---|---|---:|---:|---:|---:|---|---|
| **Managed money** (the speculator) | CFTC COT disaggregated, futures-only, COPPER- #1 | **92,097** | **13,449** | **+78,648** (≈ **892 kt**, my conversion) | 32.71% / 4.78% | 85 long traders vs 17 short traders — the short side is a handful of accounts. Options excluded (futures-only basis) | [CFTC public API `72hh-3qpy`, report 2026-08-18, retrieved 2026-08-28 — UNVINTAGED] |
| **Producer / merchant / processor / user** (the physical hedger) | Same report | 28,940 | **125,214** (≈ **1.42 Mt**) | **−96,274** (≈ −1.09 Mt) | 10.28% / **44.47%** | 32 short traders hold 125,214 lots — avg **3,913 lots each**. Identity of individual hedgers is never disclosed and is not inferred here | Same |
| **Swap dealers** | Same report | 52,125 | 45,991 | +6,134 | 18.51% / 16.33% | **Largest blind spot.** These are dealer books hedging OTC swaps; **the ultimate client is not observable** and must not be read as "index money" or as anyone else. Nearly flat net on a large gross book | Same |
| **Other reportables** | Same report | 19,302 | 18,202 | +1,100 | 6.86% / 6.46% | Reportable but unclassified — a mixed bucket, no identity inference | Same |
| **Non-reportable** (below CFTC thresholds) | Same report (residual) | 20,108 | 9,716 | +10,392 | 7.14% / 3.45% | Identity structurally unobservable by construction | Same |
| **Spreading positions** (MM 25,262 + swap 8,658 + other 35,071) | Same report | 68,991 | 68,991 | 0 by definition | **24.51% of OI on each side** | Carries **no** net directional view. A quarter of this book is calendar structure, not opinion, and must not be counted as either side | Same |
| **ETF / ETC — `CPER`** (US Copper Index Fund) | USCF issuer fund page | n/a | n/a | **Not available** — shares outstanding and total net assets not published in a machine-readable form on the issuer page retrieved | n/a | Even if resolved, **CPER's own COMEX futures sit inside the open interest above — adding CPER to COT would double-count.** And CPER holds **deferred** months (Aug-2026 components included Dec-26 and May-27), so it is not a front-month vote [`market-structure/01_commodity-instruments.md` §2] | [USCF `uscfinvestments.com/cper`, retrieved 2026-08-28 — page returned field labels with no populated values] |
| **LME investment funds** | LME Commitments of Traders Report (COTR) | Not obtained | Not obtained | **53,914 lots net long, cut by 6,340 on the week** (≈ 1.35 Mt at the standard 25 t lot — conversion is inference; the LME contract spec was not retrieved) | Not obtained | **Not additive to COMEX and not date-alignable**: different exchange, different trader taxonomy, different report date — and the source **does not state the COTR report date at all.** A single fund can be long LME, long COMEX and long CPER at once | [ING commodities team via FXStreet, published 2026-08-19 — UNVINTAGED secondary, COTR report date not stated] |
| **Official institutions** (state stockpiles) | **Referenced, not counted here** | — | — | **Unquantified in tonnes from every source reachable** | — | Causally owned by `commodity-demand-inventory`; see §5 | [`supply-demand/02_commodity-demand-inventory.md` §1.6] |

**The report balances exactly, and that is a real check, not a formality.** Long side: 92,097 + 25,262 + 28,940 + 52,125 + 8,658 + 19,302 + 35,071 = **261,455** reportable, + 20,108 non-reportable = **281,563 = open interest**. Short side: 13,449 + 25,262 + 125,214 + 45,991 + 8,658 + 18,202 + 35,071 = **271,847** reportable, + 9,716 = **281,563 = open interest**. The five class nets also sum to zero: +78,648 − 96,274 + 6,134 + 1,100 + 10,392 = **0**. Total open interest of 281,563 lots is ≈ **3.19 Mt** of copper claims (my conversion).

**Two perimeter facts that limit everything below.**
1. **The COT reading is 10 days stale against the decision date.** The most recent report available on the CFTC API at retrieval is **2026-08-18**; the 2026-08-25 report was not present. The market-structure orb documents an LME delivery squeeze peaking **2026-08-24** and breaking on **2026-08-25/26** [`market-structure/99` — Physical Basis & Delivery Pressure]. **My entire positioning read predates that event.** This is the single most important caveat in this report.
2. **Options are out of scope and dealer gamma is NOT inferred.** The futures-only report carries no option open interest, and inferring dealer gamma from bare option OI is explicitly forbidden (§3, agent scope). **Dealer gamma for copper: not available.**

### 1a. Required-series ledger (MODULE_RULES §8A) — the three rows this orb owns

| Need ID | Stable series ID | Status | As-of | Retrieval / vintage ID | Exact reason when unusable |
|---|---|---|---|---|---|
| `copper-managed-money-positioning` | `copper.managed-money-positioning` | **manual — UNUSABLE** | 2026-08-18 (156 weekly obs from 2023-08-28) | `unvintaged:cftc-public-api-72hh-3qpy-copper-1-futures-only-disaggregated:2026-08-18` | **Two independent reasons.** (a) **No accepted connector vintage** — retrieved live from the CFTC public API at decision time; §8A says a reachable URL or a successful live run is not evidence, so this cannot fill the row. (b) **Freshness leg fails on its own terms** — the profile requires "a current COMEX COT observation"; the newest report on the API at retrieval is 2026-08-18, ten days before the decision date, and it predates the 2026-08-24 LME squeeze. The **≥3-year history leg is satisfied in substance** (156 weekly reports, ~3.0 years) but cannot be accepted without a vintage |
| `copper-lme-investment-fund-positioning` | `copper.lme-investment-fund-positioning` | **unavailable** | Not stated by the source | `unvintaged:ing-via-fxstreet-lme-cotr-summary:2026-08-19` | The LME COTR is an entitled exchange publication with no lawful machine route reachable here, and **no licence was worked around.** What exists is a **single secondary-reported number** (53,914 lots, −6,340 w/w) in a broker comment piece that **does not give the COTR report date** — so it cannot be date-aligned with anything. The required **≥3 years of LME investment-fund history does not exist in this run at all**, so **no LME percentile or z-score is computable, and none is printed** |
| `copper-etf-flows` | `copper.etf-flows` | **unavailable** | 2026-08-28 (attempted) | `unvintaged:uscf-cper-issuer-page-no-published-values:2026-08-28` | Profile policy is **lawful issuer publications only.** The USCF CPER fund page was retrieved and returned the field labels ("Shares Outstanding", "Total Net Assets", "NAV") **with no populated values** — the figures are rendered client-side and were not obtainable. Third-party aggregator figures exist but are **not issuer publications** and **conflict with each other** (§4 below), so they cannot substitute. **No daily/weekly CPER shares or holdings series was obtained** |

**0 of 3 owned rows usable.** Consistent with the engine-wide `usable=0/22`.

---

## 2. Speculative Positioning (CFTC COT — futures-only disaggregated, as the COPPER profile requires)

**How the percentile is measured, stated before the number (this is what turns a level into a crowding claim).** Window = the **156 weekly COT reports dated on or after 2023-08-28 through 2026-08-18** (~3.0 years), the same contract and the same futures-only basis throughout. **Percentile = (count of weekly reports strictly below the current value) ÷ 156**, computed server-side by the CFTC API, not estimated. Ties are excluded from the "below" count, so each percentile is a **lower bound** on rank. The z-score uses the population standard deviation over the same 156 reports, and the current observation is inside the window.

| Measure | Latest (2026-08-18) | Percentile / z-score vs the 156-week (~3.0y) window | Change | Source, date |
|---|---|---|---|---|
| **Managed-money NET length** | **+78,648 lots** (≈ 892 kt) | **98.7th percentile** — 154 of 156 weeks below. **z = +1.71** (mean +31,136, sd 27,796). Window min −43,928, max **+79,027**. **Exactly one week in three years was higher, and it was seven days earlier (2026-08-11).** | **w/w −379 lots**; 2-week **+2,890** (from +75,758 on 2026-08-04); **12-month +53,039** (from +25,609 on 2025-08-19, **+207%**) | [CFTC public API `72hh-3qpy`, report 2026-08-18, retrieved 2026-08-28 — UNVINTAGED] |
| Managed-money **GROSS LONG** | 92,097 lots (≈ 1.04 Mt) | **87.8th percentile** (137 of 156 below) | w/w −1,814; 12-month **+52,205 (+130.9%)** | Same |
| Managed-money **GROSS SHORT** | **13,449 lots** | **14.7th percentile** (23 of 156 below) — near the bottom of its own range | w/w −1,435; 12-month −834 (−5.8%) | Same |
| Long : short ratio | **6.85 : 1** | — | — | Same (my arithmetic) |
| MM net as a share of total OI | **27.93%** | — | 13.13% twelve months ago (25,609 / 195,080) — the spec footprint **more than doubled as a share of a book that itself grew 44.3%** | Same (my arithmetic) |
| Total open interest | 281,563 lots (≈ 3.19 Mt) | — | w/w −15,484; 12-month +86,483 (**+44.3%**) | Same |
| Number of MM traders | 85 long / 17 short | — | — | Same |

**§4a — the crowding is only about half a long build. Decomposed, with the arithmetic printed:**

```
Attribution: managed-money net length +78,648 lots vs its own 156-week mean of +31,136 lots
  — COMEX Copper #1, FUTURES-ONLY disaggregated basis, in LOTS (not tonnes, not dollars)
  [CFTC public API 72hh-3qpy, report 2026-08-18, retrieved 2026-08-28 — UNVINTAGED]
  = long leg (92,097 − 69,671 mean long) = +22,426 lots
  + short leg (38,535 mean short − 13,449 actual short) = +25,086 lots
  = +47,512 lots of the +47,512-lot excess observed
  → 100% explained, 0% residual — 47.2% long accumulation, 52.8% short-side ABSENCE.
    This is an accounting identity, not an estimated sensitivity, so it carries no coefficient basis risk.
```

**What that decomposition changes about the read, and it is not cosmetic.** A net long at the 98.7th percentile *sounds* like one-way spec buying. It is not: **more than half the excess is shorts who are not there** (gross short at the 14.7th percentile) rather than longs who piled in (gross long at the 87.8th percentile). Two consequences run in opposite directions and both are real. (a) There is **almost no short base left to squeeze** — the fuel that powers the last leg of a rally has largely been spent, which is a reason the *next* 5% is harder than the last. (b) A crowded long book with no offsetting shorts has **nobody structurally obliged to buy a fall**, which makes an unwind cleaner and faster. Neither statement is a direction on its own.

**§4a — does positioning explain the price? The honest answer is that it cannot be computed here, and the refusal is the finding:**

```
Attribution: COMEX front-month copper +46.63% over 12 months (+US$2.11/lb to US$6.62/lb)
  [market-structure `02` §1, TradingEconomics 2026-08-28 — UNVINTAGED; the price is that orb's fact, not mine]
  × sensitivity of the copper price to managed-money net length — NO SUCH COEFFICIENT EXISTS IN THIS RUN
  = not computable: 0 US¢/lb of the +US$2.11/lb (+46.63%) move observed can be attributed to positioning
  → 0% explained, 100% residual (unattributed). `copper.comex-price-history` is STRUCTURALLY ABSENT
    (no price-history connector exists for any commodity in the 27-connector registry
    [market-structure `03` §0]), so no regression of price on positioning is possible, and no
    published copper price/positioning elasticity was retrieved. Any claim that speculative buying
    "drove" this rally is unsupported and is NOT made here. This orb's series moved with the price;
    that is co-movement, not causation, and I do not have the history to test even the co-movement.
```

**Placement, carried with its qualifier.** Managed money is **crowded long at the 98.7th percentile of three years, one week off a three-year record, on an unvintaged and ten-day-stale reading.** That is a **mean-reversion and liquidation risk to the existing move — not a bearish price call and not a short signal.** A position can sit at the 99th percentile for months while the price keeps rising; the percentile says how much room there is for the *marginal* buyer, not what the price will do.

---

## 3. Hedger Side (CFTC disaggregated) — the risk-premium leg

The commodity risk premium is the compensation speculators earn for absorbing hedgers' positions. A managed-money-only read misses which way the physical side is leaning, so it is reported here with the same percentile discipline.

| Leg | Latest net (2026-08-18) | Percentile vs the same 156-week window | Lean (short / covering) | Source, date |
|---|---|---|---|---|
| **Producer / merchant / processor / user (commercial hedger)** | **−96,274 lots** (28,940 long vs 125,214 short; ≈ **−1.09 Mt** net short) | **8.3rd percentile of net** — only **13 of 156 weeks** were more short. Equivalently, **~92nd percentile of shortness**, against a window mean of −57,772 | **Heavily short, and pressing.** 12-month change **−48,719 lots**: the net short **doubled** (−47,555 → −96,274) while the price rose 46.63%. Week-on-week they covered a token **+1,243 lots** (long −1,910, short −3,153) — a rounding error against a 48,719-lot annual build, not a turn | [CFTC public API `72hh-3qpy`, report 2026-08-18, retrieved 2026-08-28 — UNVINTAGED] |
| **Swap dealers** | **+6,134 lots** (52,125 long / 45,991 short, + 8,658 spreading) | Not computed — a near-flat net on a large gross book carries little information as a percentile | **Effectively flat.** A 98,116-lot gross book nets to +6,134. **Who is on the other side of these swaps is not observable and is not inferred** | Same |
| **Other reportables** | **+1,100 lots** (19,302 / 18,202, + 35,071 spreading) | Not computed | Flat. Note the 35,071 spreading lots — this bucket is heavily calendar-structured, not directional | Same |
| **Non-reportables** | **+10,392 lots** (20,108 / 9,716) | Not computed | Small net long | Same |

**§4a — who actually took the other side of the speculators, as an exact identity:**

```
Attribution: managed-money net length +53,039 lots over 12 months (+25,609 on 2025-08-19 → +78,648 on 2026-08-18)
  — COMEX Copper #1, FUTURES-ONLY disaggregated basis, in LOTS
  [CFTC public API 72hh-3qpy, reports 2025-08-19 and 2026-08-18, retrieved 2026-08-28 — UNVINTAGED]
  = producer/merchant net −48,719 lots (−47,555 → −96,274), absorbing 91.9%
  + swaps, other reportables and non-reportables combined −4,320 lots, absorbing 8.1%
  = −53,039 lots of the +53,039 lots observed
  → 100% explained, 0% residual. Identity (the four class nets sum to zero by construction),
    not an estimated sensitivity.
```

**Read this leg plainly.** **The physical trade sold forward into the whole rally, and the speculator is the one carrying it.** Producers and merchants supplied **92% of the paper** that let managed money build a 53,039-lot net long over twelve months. That is the textbook risk-premium configuration — and it cuts two ways, which is why it is not a direction: hedgers selling at these levels are the natural sellers a physically tight market produces, *and* they are also the people who know their own cost curve. **What this orb cannot say is whether they are hedging into a price they think is unsustainable or simply locking in a good year — that is a cost-curve question owned by `commodity-cost-curve-fair-value`, whose `copper-cost-incentive-range` row is unavailable.** Not proven from available data.

---

## 4. Investment Flows (ETF/ETC)

| Vehicle | Holdings / shares | Recent trend | Confirming / fading | Source, date |
|---|---|---|---|---|
| **`CPER`** (US Copper Index Fund) — the only sizeable US-listed copper *futures* vehicle | **Not available.** Issuer page returned the labels "Shares Outstanding", "Total Net Assets" and "NAV" **with no populated values** | **Not assessable** | **Not assessable** | [USCF `uscfinvestments.com/cper`, retrieved 2026-08-28 — lawful issuer route, no published values returned] |
| `CPER` — third-party aggregator figures, **context only, NOT the required series** | AUM **US$732m as of 2026-08-24**; separately ">US$760m in copper futures and an equal amount of cash collateral" (Aug-2026); one-year fund flow "+US$367.29m" | Direction implied is **inflow** | **Cannot be used.** The two AUM descriptions **do not reconcile** (US$732m total vs >US$760m of futures *plus* an equal cash leg), so under §4's conservative default neither is adopted | [Aggregator summaries retrieved via search, 2026-08-28 — UNVINTAGED, not issuer publications, mutually inconsistent] |
| **`COPX` / `ICOP` / `FCX`** (miner equities) | **Deliberately excluded** | — | — | The profile is explicit that miners are a **levered confirmation, not the metal**; equity-fund flows are not copper flows and are not counted here [`COMMODITY_PROFILES.md` §COPPER] |
| **LME investment funds** (COTR) — reported here because it is the closest thing to an investor-flow read that was obtainable | **53,914 lots net long**, **cut by 6,340 lots on the week** — ending a two-week run of increases **despite higher prices** | **Reducing** | **Fading, not confirming** — length was cut into a near-record price | [ING commodities team via FXStreet, published 2026-08-19 — UNVINTAGED secondary; **COTR report date not stated by the source**] |

**Three limits on this section, all material.**
1. **The required `copper-etf-flows` row is unavailable, and I mark it unavailable rather than substitute.** A non-issuer aggregator number is not a lawful issuer publication under the profile's own source policy, and the two aggregator descriptions contradict each other.
2. **Even a resolved CPER inflow would not confirm the front-month move.** CPER holds **deferred** COMEX months — its August components included **Dec-26 and May-27** — so a CPER creation is a bid for deferred copper, not for the Sep-26 contract the headline price quotes [`market-structure/01_commodity-instruments.md` §2, `99` Instruments].
3. **CPER's futures are already inside the COT open interest.** Adding an ETF holdings number to a COT class total would double-count the same lots. The ownership map in §1 flags this; the arithmetic is never performed.

**Net flow read: the one directional flow signal obtainable is a FADE.** LME investment funds cut net length by 6,340 lots into a price sitting within ~3% of a reported all-time high. It is undated, secondary, and covers a different exchange and taxonomy from the COMEX book — **so it is weak evidence, and it points the opposite way to the COMEX net-long level.** Both are recorded; neither is netted against the other.

---

## 5. Concentration & Read

**Concentration, from the report's own published ratios — no holder identity is inferred anywhere.**

| Concentration measure (2026-08-18) | Long side | Short side | Placement |
|---|---:|---:|---|
| Gross position of largest **4** traders, % of OI | **16.3%** | **30.3%** | Short-side top-4 at the **79th percentile** of the 156-week window (124 of 156 weeks below 30.3%; ties excluded, so this is a lower bound) |
| Gross position of largest **8** traders, % of OI | **25.8%** | **43.5%** | — |
| **Net** position of largest 4 traders, % of OI | 15.7% | 28.2% | — |
| Traders in the class | 85 managed-money longs (avg **1,083 lots** each) | 32 producer/merchant shorts (avg **3,913 lots** each) | — |
| Total reporting traders | **279** | | — |

[All rows: CFTC public API `72hh-3qpy`, report 2026-08-18, retrieved 2026-08-28 — UNVINTAGED. Percentile computed server-side over the same 156-week window defined in §2.]

**Gross versus net crowding.** A modest net can hide two large opposing gross books, so both are stated: managed money's 92,097 gross long against 13,449 gross short nets to 78,648 — **this class is genuinely one-way, not a large two-sided book** (6.85:1). The hedger class is the mirror image (28,940 vs 125,214). And **24.51% of open interest on each side is spreading** — a quarter of the book has no directional opinion at all and must not be read as either side's conviction.

**Liquidation risk is two-sided, and the two sides are structurally different.**
- **The long side is crowded but dispersed** — 85 managed-money accounts, top-4 gross long only 16.3% of OI. A dispersed crowd at the 98.7th percentile does not need a single big holder to fail; it **bleeds out**, because each account's stop is hit by the same move and there is essentially no short base (14.7th percentile) obliged to buy the fall.
- **The short side is smaller but far more concentrated** — top-4 gross short **30.3%** (79th percentile of its own three years), top-8 **43.5%**, and 32 producer/merchant accounts averaging 3,913 lots each. **That is a squeezable structure**, and it is exactly the structure that produced the LME event of 2026-08-24 (roughly half of remaining LME stock earmarked for withdrawal; cash–3M backwardation to ~US$550/t, reported as the highest in more than five years) before more than 20,000 t was delivered on 2026-08-25 and the spread collapsed to ~US$248/t [`market-structure/99` — Physical Basis & Delivery Pressure; all figures unvintaged secondary, and that orb's formal status for delivery pressure is `not assessable`].
- **The two risks contradict each other and are not averaged.** They are emitted as separate, linked rows in the sidecar (`copper-managed-money-net-length-crowded` ↔ `copper-short-side-concentration-squeeze-risk`). A cluster holding both directions is `contradiction: true` under §8 and is never conviction-eligible — which is the correct machine outcome here.

**The direct answers to this orb's question.**

- **Are speculators crowded, and at which percentile?** **Yes — managed money is net long 78,648 lots, the 98.7th percentile of the 156 weekly COT reports from 2023-08-28 to 2026-08-18 (~3.0 years), z = +1.71, with exactly one higher week in three years and that week only seven days earlier.** But **more than half of that extreme (52.8%) is the absence of shorts (14.7th percentile gross short), not long accumulation (87.8th percentile gross long)** — so there is little short fuel left for further upside, and little natural bid under a fall.
- **Which way do hedgers lean?** **Producers and merchants are heavily short and pressing, not covering: −96,274 lots, only 13 of 156 weeks more short (~92nd percentile of shortness), and the net short doubled over twelve months while the price rose 46.63%.** They absorbed **91.9%** of managed money's entire 12-month net-long build. Week-on-week covering of +1,243 lots does not change that.
- **Are flows confirming?** **The one obtainable flow signal is fading, and the ETF leg is not assessable.** LME investment funds cut net length 6,340 lots to 53,914 into a near-record price [ING via FXStreet, 2026-08-19 — undated COTR, secondary]. CPER shares and holdings are **unavailable** from any lawful issuer publication, and would not be a front-month confirmation in any case (deferred months).
- **Is ownership concentrated enough to create liquidation risk?** **Yes, on the short side more than the long side** — top-4 gross short 30.3% of OI (79th percentile) versus 16.3% long, with 32 hedger accounts averaging 3,913 lots each. Squeeze risk sits with the concentrated shorts; grind-down risk sits with the dispersed longs.
- **The contrarian risk, stated plainly.** The COMEX copper book is the most one-sided it has been in three years — a 98.7th-percentile speculative long facing a ~92nd-percentile hedger short. **That is a fragile configuration, and it is a risk to the existing move, not a forecast that the move ends.** The single largest hole in this read is timing: **the reading is from 2026-08-18 and predates the 2026-08-24 LME squeeze and its 2026-08-25/26 relief entirely**, so how much of this positioning survived that week is **not proven from available data**.

**Official-institution reference — explicitly excluded from this orb's vote (§8, causal ownership).** State strategic stockpiling is copper's analogue of central-bank buying: China's Nonferrous Metals Industry Association publicly called for more copper in national strategic reserves [Bloomberg headline via search summary, 2026-02-03 — unvintaged], and one secondary source estimates the US strategic copper stockpile has passed 1 Mt [trade-press summary, accessed 2026-08-28 — unvintaged, and treated as unreliable because it may restate the ~676 kt already sitting in COMEX warehouses]. **SRB timing and tonnage are confidential and unpublished; the activity is unquantified in tonnes from every source reachable** [`supply-demand/02_commodity-demand-inventory.md` §1.6]. **This is a cross-reference only. It is owned by `commodity-demand-inventory`, it is NOT a positioning vote, it is not counted in any table above, and it appears in no row of this orb's signal sidecar.**

**Sufficiency and routing.** Every figure in this report is unvintaged and **cannot raise sufficiency or conviction** (§8A). **0 of 3 owned required rows are usable.** All 8 sidecar rows carry `unvintaged:` provenance tokens with empty `source_vintage_refs`; **zero rows are conviction-eligible**, and the `futures-positioning` cluster is `contradiction: true` by construction. **This orb sets no action verdict** — positioning is a risk and timing overlay. Per MODULE_RULES §8A an unusable required row makes both horizons `not_assessable`, which mechanically produces **`Research More`** at the terminal module unless an independently proven critical risk forces `Avoid`; **no such proven critical risk exists in this orb's evidence.**

**Single highest-value next data request for this orb (§22), one item:** an **accepted, immutable connector vintage of the CFTC disaggregated COT for `COPPER- #1` (dataset `72hh-3qpy`), weekly, ≥3 years, refreshed on the Friday release schedule.** The series is lawfully and freely available at the primary regulator's public API and was fully retrieved here — **it is the one required row in this entire run that is blocked purely by the absence of a vintage, not by a licence, a paywall or a missing dataset.** It is therefore the cheapest coverage row in the profile to fix.



---

## macro-positioning / 03_commodity-cross-asset-regime.md

_Source: `03_commodity-cross-asset-regime.md`_

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
