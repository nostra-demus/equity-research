# Macro & Positioning Module Memo — COPPER

**Memo date:** 2026-08-28 · **Run root:** `commodity/runs/COPPER/` · **Source:** `99_macro-positioning-synthesis.md` (already adjudicated) · **Unit of work:** the commodity COPPER — there are no company filings in this module.

**Verdict: net macro tilt is a headwind, and this module sets no action verdict** — because macro explains **0%** of copper's **+46.63%** twelve-month move (US$4.51/lb → US$6.62/lb, +US$2.11/lb) and **100% is unattributed**, so the module cannot name what moved the price [99 §Abstract; 01 §1a].

**Standing banner (MODULE_RULES §8A), true of every number in this memo:** every figure here is **unvintaged** live-web context. No accepted immutable connector vintage exists for any series in this run, and the swarm pulse transport is dead (`PULSE-MISSING`, EPERM on the pinned `tsx` runner's IPC pipe). An unvintaged fact may explain context but **cannot fill a coverage row, cannot raise data sufficiency, and cannot lift conviction.** A reachable URL is not evidence [99 §Evidence status; 01 §0; 02 evidence-status block; 03 §0a].

---

## 1. Scores at a Glance

The synthesis publishes **no `/100` score lines of its own** for this module. It publishes status verdicts and coverage counts instead, carried here verbatim. (The one `/100` figure it mentions — supply-demand at **35/100 under a HIGH-opacity cap of 45** — belongs to a different module and is quoted only as context it stacks with [99 §Interaction 1].)

| Reading the synthesis carries | Value (verbatim) | Source |
|---|---|---|
| Net macro tilt | **Headwind** — one marginally supportive driver against three adverse ones | 99 §Net Macro Tilt; 01 §1 |
| Dominant macro driver | **US 10-year real yield, 2.36% (2026-08-28), +54bp over twelve months**, a multi-decade high — moved *against* the price | 99 §Net Macro Tilt; 01 §2 |
| Macro attribution of the +46.63% move | **0% explained, 100% residual (unattributed)** | 99 §Attribution; 01 §1a |
| Positioning attribution to price | **0% explained, 100% residual** — no coefficient linking managed-money net length to the copper price exists in this run | 02 §2 |
| Speculative crowding | **Net long +78,648 lots, 98.7th percentile of 156 weekly COT reports (~3.0 years)** — COMEX Copper #1, futures-only disaggregated, report date **2026-08-18, ten days stale** | 02 §2 |
| Cross-asset breadth | **Not assessable** — N = 0 aligned observations, no percentile, no correlation coefficient stated at all, `correlation_edges: []` | 03 §2, §4 |
| Cross-asset regime | **Not assessable** | 03 §4 |
| Conviction-eligible clusters from cross-asset | **Zero** | 03 §4 |
| Required series this module owns that are usable | **0 of 9** (engine-wide `usable = 0/22`) | 99 §Evidence status |
| Forecast horizons | **Both `not_assessable` from this module's side; no directional vote contributed to either horizon** | 99 §Conviction consequence |

**Caps applied (not optional, not averaged away):**
- **§8A unvintaged cap** — nothing in this module can raise data sufficiency or conviction.
- **§11/§12 conviction cap** from the 100% residual: a position whose driver cannot be named cannot be sized off a driver story.
- **§8 contradiction lock** — the `futures-positioning` cluster is `contradiction: true` (crowded long ↔ concentrated short squeeze) and is **never conviction-eligible**. This module does not overturn it.
- **Routing consequence:** 0/9 usable rows mechanically routes the terminal thesis to **Research More** unless an independently proven critical risk forces otherwise — and **no proven critical risk exists in this module's evidence.**

**§24 Avoid-Big-Risks filters:** the synthesis carries no §24 filter read for this module — none tripped, none recorded.

---

## 2. What This Module Found

Copper rose **46.63%** over twelve months while three of the four dominant macro drivers moved *against* it and the fourth moved almost nothing. The 10-year real yield (the yield left after expected inflation) rose **54 basis points to 2.36%**, with the 2026-07-23 10-year TIPS auction clearing **2.438%, the highest at auction for this term since October 2008**. The Fed held at **3.50%–3.75%** on 2026-07-28/29, and its only three dissents wanted a **hike**. China's fixed-asset investment ran **−6.7% y/y (Jan–Jul, from −5.7% in H1)** and property investment **−19.2% (from −18.0%)** — both getting worse. The broad trade-weighted dollar fell **1.39%**, and on the last **fully published** Federal Reserve primary observation it was **+0.02% — unchanged over eleven months** [01 §1].

**The headline is the residual, not the headwind.** No sourced sensitivity exists for copper's price response to the broad dollar, to the real yield, or to Chinese activity, and three candidate coefficients were **refused on basis grounds** rather than passed on. So the arithmetic is: **0% explained, 100% residual.** The macro lens does not merely fail to explain the rally — it makes the rally harder to explain, because the signs point the wrong way. For the dollar alone to have done it, copper's elasticity to the broad dollar would have to be about **−33.6** (a 1% fall in the dollar lifting copper ~33.6%); that is a reductio showing the story fails, not a measurement of one [01 §1a]. **This module supplies no driver story in its place.** The wire narrative about grid, EV and data-centre demand meeting constrained mine supply is a physical, location and policy story owned by other modules — and the demand orb has already recorded `copper-energy-transition-demand` as **not assessable** [99 §Net Macro Tilt].

**The single most important positioning fact is a composition fact.** Speculators sit at the **98.7th percentile** of net length (**+78,648 lots**, ≈892 kt; z = +1.71 against a mean of +31,136 and a standard deviation of 27,796; exactly one week in three years was higher, seven days earlier). But **52.8% of that extreme is the ABSENCE of shorts — gross short at the 14.7th percentile (13,449 lots) — not long accumulation**, since gross long sits only at the **87.8th percentile** (92,097 lots). The split is an accounting identity, not an estimate: long leg +22,426 lots plus short leg +25,086 lots equals the +47,512-lot excess exactly, 47.2% accumulation / 52.8% absence [02 §2]. **Every one of these figures is on the same basis and carries the same staleness:** CFTC Commitments of Traders, **Disaggregated, futures-only**, `COPPER- #1` (COMEX), dataset `72hh-3qpy`, **report date 2026-08-18, ten days stale, unvintaged** — not the futures-and-options combined basis, and predating the 2026-08-24 LME event in full.

**The single most important risk is the timing hole.** How much of the 98.7th-percentile long, the **−96,274-lot** hedger short, or the **30.3%** top-4 short concentration survived the week of 2026-08-24 is **not proven from available data.** Any read of these levels as *current* is unsupported [99 §Interaction 4].

---

## 3. The Specialists, Briefly

- **`01_commodity-macro-drivers`** — net macro tilt **headwind**, dominant driver the 10-year real yield at 2.36% (+54bp), and **0% of the +46.63% move attributed, 100% residual**, with three candidate coefficients refused on basis grounds.
- **`02_commodity-positioning-flows`** — speculators crowded at the **98.7th percentile**, but **52.8% of it is missing shorts**; physical hedgers are net **−96,274 lots** (≈ −1.09 Mt), have **doubled** their short over twelve months (−47,555 → −96,274) and **absorbed 91.9%** of the speculators' entire 53,039-lot build, with the remaining classes taking 8.1%. The one obtainable flow signal **fades**: LME investment funds cut **6,340 lots to 53,914 net long** into a near-record price (undated, secondary, different exchange, **not additive to COMEX**). `CPER` is **not assessable** — the issuer page returned labels with no values.
- **`03_commodity-cross-asset-regime`** — breadth and regime **not assessable**, **N = 0**, no correlation coefficient stated at all. The two lenses with numbers (copper/gold **0.0014234**, ≈702.6 lb per oz, +20.1%; COPX/copper **14.43**, +38.8%) are **one cluster counted once**, both basis-mismatched, and their copper leg is quoted on the tariff-squeezed COMEX contract — pricing the same ratio off the LME 3-month print (US$14,251/t = US$6.464/lb) gives **719.5 lb/oz, a +2.41% shift from nothing but the choice of exchange**.

**The most important disagreement, and how the synthesis resolved it:** liquidation risk points **both ways at once and is not averaged**. Dispersed longs (85 accounts, top-4 gross long only **16.3%** of open interest) **bleed out** with no short base obliged to buy the fall; the concentrated hedger short (top-4 gross short **30.3%, 79th percentile**; 32 accounts averaging 3,913 lots) **squeezes** — which is what fired on **2026-08-24** (cash–3M backwardation ~**US$550/t**, the highest in more than five years) and relieved on 2026-08-25/26 (~**US$248/t** after more than 20,000 t was delivered), with market-structure's formal delivery-pressure status still **`not assessable`**. The two are emitted as separate linked rows, the cluster stays `contradiction: true`, and **it must not be resolved into one direction downstream** [99 §Ownership Concentration]. Two further disagreements were settled on arithmetic, not hedged: a relay putting copper/gold at **0.00077 ("a 50-year low")** was **discarded** — it implies copper at US$3.581/lb (45.9% below the observed print) or gold at US$8,597/oz (84.8% above it); and the fading LME flow and the crowded COMEX level are **recorded as pointing opposite ways, never netted against each other**.

---

## 4. What Would Change This Read

| Trigger | What it changes |
|---|---|
| Real yields rise another **25bp** and copper rises with them | The drivers orb's own falsifier: **downgrade the macro tilt from Headwind to Neutral** [99 §Roll-Up row 1] |
| **An accepted immutable vintage of the CFTC disaggregated COT for `COPPER- #1`** (dataset `72hh-3qpy`, weekly, ≥3 years) | **The single highest-value unblock** — the one required row in this run blocked purely by the absence of a vintage, not by a licence, a paywall or a missing dataset [99 §Note to the Commodity Thesis] |
| The next weekly COT report, covering the week of 2026-08-24 | Closes the ten-day staleness hole — how much of the 98.7th-percentile long, the −96,274-lot hedger short and the 30.3% top-4 short concentration survived is currently **not proven from available data** |
| A price-history connector for copper (`copper.comex-price-history`, structurally absent) | Unblocks every cross-asset ratio and makes a regression of price on positioning possible at all. Repairing either cross-asset row **alone still yields zero ratios** — the failure is double-legged |
| A weekly regression of COPX on copper **and** on a broad equity index over **≥150 weeks** | Until it exists, miner strength (COPX **+103.47%** total return, including a 2.02% yield) is an equity fact of unknown composition, **never the metal** |
| A usable `copper-cost-incentive-range` row (owned by `commodity-cost-curve-fair-value`, currently unavailable) | Answers whether hedgers are locking in an unsustainable price or simply a good year — presently **not proven from available data** |

---

## 5. Bottom Line

- **The verdict:** macro is a **headwind** (dominant driver the 10-year real yield at **2.36%, +54bp**), the module sets **no action verdict**, and both forecast horizons are **`not_assessable`** with **no directional vote** contributed.
- **The finding, not a caveat: macro explains 0% of the +46.63% move and 100% is unattributed.** Positioning cannot be tested against price at all (the price history is structurally absent) and cross-asset has zero observations — **three lenses, three 100% residuals. The engine does not know what is carrying this price.**
- **Why it could be worse than it looks:** a **98.7th-percentile** long book with **no macro cushion underneath** and gross shorts at the **14.7th percentile**, so essentially nobody is structurally obliged to buy a fall — and the concentrated hedger short (top-4 **30.3%**) is separately squeezable. **This is a risk to the existing move, not a bearish price call and not a short signal.** A position can sit at the 99th percentile for months while the price keeps rising.
- **Why it could be better than it looks:** the crowding is **half an absence**, so the classic short-squeeze fuel on the speculative side has largely been spent rather than still being loaded; hedgers absorbed **91.9%** of the spec build, which is the textbook risk-premium configuration and **is explicitly not a direction**; and **24.51% of open interest on each side is spreading** (68,991 lots) carrying no view at all.
- **What evidence is missing:** **0 of 9** required series this module owns are usable, every figure is **unvintaged**, breadth is **absent rather than narrow** (N = 0), and the whole positioning read is **ten days stale and predates the 2026-08-24 LME event.**
- **The one thing to watch next:** an **accepted immutable vintage of the CFTC disaggregated COT for `COPPER- #1`** — and, with it, the first report that covers the week of 2026-08-24.

---

## 6. Plain-English Glossary

- **Basis point (bp)** — one hundredth of a percentage point; 54bp is 0.54 percentage points.
- **Real yield** — the yield on a bond after taking out expected inflation; the 10-year TIPS yield, here 2.36%.
- **Attribution / residual** — how much of a price move a named driver accounts for once the arithmetic is done, and how much is left unexplained. A 100% residual means nothing has been explained.
- **Elasticity / sensitivity (coefficient)** — how much one thing moves when another moves 1%; it only applies to the exact variable it was measured on.
- **Percentile** — where today's reading sits inside its own history; the 98.7th percentile means only about 1.3% of the past three years' weekly readings were higher.
- **COT (Commitments of Traders)** — the weekly CFTC report showing what each class of trader holds. **Disaggregated, futures-only** means traders are split by type and options are excluded.
- **Lot** — one futures contract; one COMEX copper contract is 25,000 lb (11.33981 t).
- **Gross long / gross short / net** — the total bought, the total sold, and the difference. A modest net can hide two large opposing books, so both are shown.
- **Open interest** — the total number of contracts outstanding; **spreading** is holding offsetting contracts in different months, which carries no view on direction.
- **Managed money / producer-merchant (hedgers)** — speculative funds, versus the physical trade that mines, ships or uses the metal.
- **Backwardation** — near-dated metal priced above forward metal, the market's signal of physical shortage (the opposite, **contango**, costs a holder money to roll a position forward).
- **Total return** — a price move plus income; COPX's +103.47% includes a 2.02% yield, so the price-only move is roughly +101%.
- **Unvintaged** — the figure was retrieved live but has no accepted frozen, timestamped copy, so it can inform context but cannot raise data sufficiency or conviction.
- **Conviction-eligible cluster** — a group of signals allowed to support a conviction call; a cluster holding contradictory directions is never eligible.
