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
