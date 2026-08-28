# Market Structure Module Memo — COPPER

**Memo date:** 2026-08-28 · **Run root:** `commodity/runs/COPPER/` · **Source:** `99_market-structure-synthesis.md` (this memo condenses that file and adds nothing to it)

**Verdict: Partial — structure described, nothing evidenced.** The shape of the copper market is legible — the two exchanges are in opposite carry regimes, and the list of ways to own copper is clear — but **not one figure in the module is vintaged** (none has a fixed, checkable "as of" record behind it), so none of it can support a rated call.

**Read this first.** Every number below is unvintaged live-web context or arithmetic on it. The sibling triage records **0 of 22 required data series usable**, and **0 of the 4** series this module owns. All **13** signal rows across the two sidecars carry `unvintaged:` or `missing:` tags with empty source references — **zero are conviction-eligible**. Under the module's §8A rule this material may explain context but cannot raise data sufficiency or conviction, and nothing here is a recommendation to buy, size, or hold anything.

---

## 1. Scores at a Glance

| Score | Value | Band / status | Basis carried by the synthesis |
|---|---|---|---|
| **Data sufficiency** | **10 / 100** | Root §11 band 0–29: **"insufficient — refuse to rate"** | 0 of 22 required series usable engine-wide; 0 of 4 owned by this module; no vintaged price anchor; no price history at all |
| **Market-structure directional conviction** | **capped at 0 / 100**, reported as **`not assessable`** | Capped, not scored | Measures strength of evidence for a stated direction — **never bullishness** (module §9 convention). No score above the cap may be derived from anything in this module |

**Caps applied** (all carried from the synthesis, none loosened here):
- **§8A cap** — every figure is unvintaged live-web context, so nothing in this module can raise sufficiency or conviction.
- **§8 contradiction cap** — two signal clusters (`curve-carry`, `delivery-pressure`) hold both bullish and bearish rows, so both are `contradiction: true` and are never conviction-eligible even if the vintages were restored today.
- **§4 conservative default** — applied twice: the COMEX carry **cost** stands for a long (the contradicting roll *gain* is not banked), and the **higher** CPER fee is used where sources conflict.
- **Routing constraint (MODULE_RULES §10/§11)** — a `not_assessable` risk distribution mechanically forces **`Research More`** unless an independently proven critical risk with a cited source forces `Avoid`. No such proven critical risk exists in this module's evidence. **This module issues no action verdict; the terminal `commodity-thesis` module routes.**

**§24 Avoid-Big-Risks filters:** the synthesis carries no §24 filter trip — **none tripped** in this module.

---

## 2. What This Module Found

Copper trades at **US$6.62/lb on COMEX front month (2026-08-28)**, up **+46.63% over twelve months** and roughly 3% below a reported all-time high of US$6.83/lb [`02` §1, TradingEconomics — unvintaged]. The module's own attribution arithmetic finds that twelve-month move **~0% explained and ~100% residual (unattributed)**: the US tariff premium is a *level* roughly where it was a year ago, so it accounts for about **+$0.00/lb of the +$2.11/lb** rise [`02` §4]. **That residual is the finding, not a caveat** — the terminal thesis must not adopt a tariff, deficit, or electrification driver story this module's arithmetic does not carry. Whether the rally is a global shortage or a location dislocation is **Not proven from available data**.

The most decision-relevant structural fact is a **split in the carry between the two exchanges** (carry = what it costs, or pays, to hold the position through time rather than the price move itself). LME cash-versus-3-month is in **backwardation** — near metal dearer than later metal — at **+US$248/t (2026-08-26), worth about +6.9%/yr to a holder who keeps rolling the position forward**. The COMEX chain reads the opposite, **contango** — later metal dearer — at about **−6.1%/yr** to the same roller [`02` §3a, §3b]. That is roughly **13 percentage points a year of difference on the same metal**, so **which venue you hold is currently a bigger decision than which way you think the price goes**. The conservative case for a long is the COMEX bleed, not the LME pay: a COMEX-rolled long nets about **−2.3%/yr** (roll −6.1% plus collateral interest +3.79%), or **≈ −3.2% to −3.4%/yr after CPER's 0.88%–1.06% fee** — copper has to rise roughly 3% a year just to break even [`02` §5; `01` §3].

The biggest risk is one this module can name but cannot size. The empirical risk distribution is **`not_assessable` at all ten forecast horizons** — **N = 0** non-overlapping outcomes against a floor of **30**, and **0 of 3** required regimes — because no lawful point-in-time copper price history exists anywhere in this engine (structurally absent, not merely stale: none of the 27 connectors is a price-history connector for any commodity) [`03` §0–§4]. The killer risk is **identified in kind** — a live, unscheduled, yes/no US refined-copper tariff ruling, whose single-session realised move in 2025-07-30/31 is put at **19% / 20% / 22%** by three disagreeing unverified secondary sources — and **`not assessable` in magnitude**. That is **not a tail bound** (N = 1, and it carries no direction: the 2025 gap was down because the ruling landed softer than expected; a harder ruling gaps the other way) [`03` §3a]. **There is no empirical bound for a scenario set to clear, and the absence of a bound is not a licence to pick one.**

On instruments, the constraining fact is that **there is no physically-backed copper vehicle** — copper's bulk makes vaulting uneconomic, so every listed route pays either a roll or takes equity risk [`01` §2].

---

## 3. The Specialists, Briefly

- **`00_commodity-triage`** — the data floor collapsed before analysis began: 0 of 22 required series usable, the swarm pulse quote transport dead (`PULSE-MISSING`, an EPERM permission failure on the pinned `tsx` runner's IPC pipe).
- **`01_commodity-instruments`** — no physically-backed copper vehicle found ("none found", not proof none exists). Cleanest mechanical expressions: **LME Copper Grade A 3-month** for a global view, **COMEX `HG` front month** for a US-delivered/tariff view. **`CPER`** is a futures pool charging **0.88%–1.06%** that sat in **deferred** months (Dec-26, May-27) with a **±10% tracking tolerance**, so it tracks neither the COMEX front contract nor the LME 3-month. **`COPX` / `ICOP` / `FCX` are not the metal** — a 1% copper move is about **1.41%** of miner cash margin, and that is a *floor* on the leverage, before fixed costs, tax, capex, the equity multiple, and non-copper revenue.
- **`02_commodity-price-curve`** — the venue carry split above; LME **cash-and-carry does not pay** (about **−US$439/t per quarter ≈ −12.1%/yr**, implying a convenience yield near **12.2%/yr** — London paying to have metal now); COMEX cash-and-carry **roughly pays, marginally** (**≈ +0.75%/yr**, labelled directional, not decided). The **+US$547/t (+3.8%) COMEX-over-LME spread is a gross venue spread, not "the arb"** — grades, locations, and delivery dates are mismatched, and freight, duty, and VAT are not deducted.
- **`03_commodity-volatility-distribution`** — the distribution is **absent, not thin**, at all ten horizons; **eight event-gap classes, N = 0 measured gaps in each**; it refused the two shortcuts (rebuilding returns from remembered prices; using overlapping windows to manufacture N above 30) that would have produced a plausible-looking table.

**The disagreement that matters, and how the synthesis resolved it.** The COMEX curve **sign** is contested: the TradingView chain gives contango (**−6.1%/yr** roll cost), while two other unvintaged sources put December-2026 at **US$6.017/lb** and **US$6.18/lb**, which against a ~US$6.63 front would be steep *backwardation* (≈ **−31%/yr**, a large roll **gain** — the opposite sign). Neither read is verified, and the figure **6.7270** appears both as the Dec-26 contract price and as a 2026-08-25 spot record print, which is its own reason to distrust the chain. **Resolution carried unchanged: §4's conservative default applies — the carry cost stands for a long, the roll gain is not banked, and the COMEX curve shape is formally `not assessable` for conviction.** Separately, the LME-versus-COMEX carry difference is **not** a contradiction — it is a venue and delivery-date split (metal touchable in London/Asia today versus US-delivered metal after a possible January-2027 tariff) and both are carried, neither netted.

---

## 4. What Would Change This Read

The synthesis lists no upgrade/downgrade trigger table — because with a `not_assessable` distribution there is nothing to trigger against. What it does name is the repair list, in its own priority order:

| What would change the read | Why it is binding, per the synthesis |
|---|---|
| **A lawful point-in-time daily close history for COMEX Copper `HG` front month** — continuous back-adjusted, with source identity and an accepted immutable vintage; **at least 3 years** for the tactical grid and **10 years** for the strategic grid and a three-regime split | The **single highest-value next data request (§22)**. It is the only item that can lift the distribution off `not_assessable`, and with it the scenario span, volatility, drawdowns, and event gaps |
| Repair of the **pulse quote transport** (`PULSE-MISSING`, EPERM on the `tsx` IPC pipe) | **The necessary second item, not the first** — a healthy pulse returns *one current quote*, not a return history, so fixing it alone still leaves the distribution empty |
| `copper.lme-cash-three-month-curve` becoming available | Without it the profile's headline tightness lens is not evidence, and **no z-score or percentile for copper carry exists — anyone quoting one in this run is making it up** |
| `copper-refined-balance` and `macro-china-industrial-activity` becoming available | They settle the open question the trend read turns on: global deficit versus location dislocation |
| `copper-visible-inventory` / `copper-inventory-accessibility-opacity` (other module) becoming available | How much of the record **~675,185 t** of COMEX stock is actually reachable by a non-US buyer is the question the tariff basis turns on, and §9 forbids inferring hidden stocks as zero |
| Primary filings becoming readable (CPER 424B3, FCX 8-K exhibits returned **HTTP 403**) | Every instrument fee, component, guidance, and sensitivity figure is secondary-summary sourced and unverified against EDGAR |
| An **independently proven critical risk with a cited source** | The only condition under which the routing constraint moves off `Research More` toward `Avoid`. No such proven risk exists in this module's evidence |

---

## 5. Bottom Line

- **The verdict is "Partial — structure described, nothing evidenced."** Data sufficiency **10/100** (refuse-to-rate band); directional conviction **capped at 0/100, `not assessable`**. This module issues no action verdict; the routing constraint it hands forward is **`Research More`**.
- **Better than it looks:** the structural map is legible and internally consistent — the venue carry split, the delivery-pressure sequence, and the instrument list would be genuinely usable if a vintaged price history arrived. Every one of the four specialist reports was produced; **no upstream file is missing.** What failed is the data beneath them.
- **Worse than it looks:** the **+46.63%** twelve-month move is **~100% unexplained** by anything this module holds, and the killer risk — a binary US refined-copper tariff ruling — is identified in kind but unmeasured. Any COPPER scenario set spanning only ordinary volatility **fails root §10's span check on its face**, and the engine cannot say by how much. Record-level and premium figures inside `02` are internally inconsistent (a "record" LME close of $14,201/t quoted below a prior record of $14,527.50/t; 6.7125 vs 6.7270 for the same date), so **no level in this module may be used as a threshold, trigger, or bound.**
- **What is missing:** a lawful point-in-time price history (structurally absent — no price-history connector exists for any commodity), the pulse quote anchor, the LME curve series, the refined balance, and the inventory-accessibility read. That is why the real-price placement — top of its own ~5-year range, roughly the **100th percentile**, ~10% above the deflated 2021 peak of US$6.03/lb — is **a placement, not a forecast, not a short signal, and not a fair value**: the incentive-price anchor that would carry fair value is unavailable, and whether it has risen underneath the price is **Not proven from available data**.
- **The one thing to watch next:** the **LME cash–3M spread**. It hit roughly the 99th percentile of a five-year window **by reported rank only**, then gave back **55–68% in two to three sessions** to **+US$248/t** after more than **20,000 t** was delivered into LME warehouses — mean-reverting by construction, and the whole **13-point-a-year** venue gap sits on it.

---

## 6. Plain-English Glossary

- **Vintaged / unvintaged** — a vintaged figure has a fixed, checkable record of what it was and when. An unvintaged one is a live web read nobody can reproduce later; it can explain context but cannot support a rating.
- **Carry** — what holding a position costs or pays over time, separate from any price move.
- **Backwardation** — metal for delivery now is dearer than metal for delivery later; a holder rolling the position forward gains.
- **Contango** — metal for delivery later is dearer than now; a holder rolling forward loses, because they sell the cheaper near contract and buy the dearer far one at each roll.
- **Roll / roll yield** — moving an expiring futures position into a later month, and the gain or loss that move creates.
- **Cash-and-carry** — buying the metal now, storing it, and selling a future against it. It "pays" only if the price gap beats financing plus storage.
- **Convenience yield** — what the market is implicitly paying for having the metal in hand today rather than later.
- **Basis / regional premium** — the price gap between two versions of the same metal (different grade, place, or delivery date).
- **Not assessable / `not_assessable`** — the engine cannot measure it from data it lawfully holds; this is a refusal, not a zero and not a neutral reading.
- **Non-overlapping outcomes (N)** — independent historical episodes used to build a risk distribution. N = 0 against a floor of 30 means there is no distribution at all.
- **Scenario span** — the requirement that a set of scenarios actually covers the outcomes that could happen, not merely that its probabilities add to 100%.
- **Tail bound** — the extreme high/low edge of a distribution. One disputed event is not one.
- **Directional conviction score** — strength of evidence for a stated direction. It is not a measure of bullishness.
