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
