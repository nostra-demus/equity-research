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
