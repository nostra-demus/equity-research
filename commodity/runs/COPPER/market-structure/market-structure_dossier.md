# market-structure Module Dossier — COPPER

> Deterministic, lossless concatenation of every artifact in this module — the module synthesis and every specialist output, in order. Generated mechanically (no LLM rewriting), so nothing is omitted or paraphrased. This is the module's "see everything" tier; the module's decision lives in `99_*-synthesis.md` and the short read in `market-structure_memo.md`.

- Generated: 2026-08-28T13:34:13Z
- Module folder: `market-structure`
- Contents: 1 module synthesis + 4 specialist outputs = 5 files

## Table of Contents

- [market-structure — module synthesis](#market-structure-module-synthesis) — `99_market-structure-synthesis.md`
- [market-structure / 00_commodity-triage.md](#market-structure-00-commodity-triage-md) — `00_commodity-triage.md`
- [market-structure / 01_commodity-instruments.md](#market-structure-01-commodity-instruments-md) — `01_commodity-instruments.md`
- [market-structure / 02_commodity-price-curve.md](#market-structure-02-commodity-price-curve-md) — `02_commodity-price-curve.md`
- [market-structure / 03_commodity-volatility-distribution.md](#market-structure-03-commodity-volatility-distribution-md) — `03_commodity-volatility-distribution.md`


---

## market-structure — module synthesis

_Source: `99_market-structure-synthesis.md`_

# Market Structure — COPPER (module synthesis)

**Run date:** 2026-08-28 · **Run root:** `commodity/runs/COPPER/` · **Inputs adjudicated:** `00_commodity-triage.md`, `01_commodity-instruments.md`, `02_commodity-price-curve.md` (+ 11-row `.signals.json`), `03_commodity-volatility-distribution.md` (+ 2-row `.signals.json`) — all four present, none failed to produce a report · **Rules:** root `CLAUDE.md` + `.claude/agents/commodity/MODULE_RULES.md` + `frameworks/commodity/COMMODITY_PROFILES.md` §`## COPPER` (lines 318–389).

> **Evidence status, stated before any number (MODULE_RULES §8A).** **Every figure in this module is unvintaged live-web context or arithmetic on it.** The sibling triage records **0 of 22 required semantic series usable** and the swarm pulse quote transport dead (`PULSE-MISSING`, EPERM on the pinned `tsx` runner's IPC pipe) [`00_commodity-triage.md` §3]. Of the four required rows this module owns, **0 of 4** are usable. All 13 signal rows emitted across the two sidecars carry explicit `unvintaged:` or `missing:` provenance tokens with empty `source_vintage_refs`; **not one row is conviction-eligible.** Under §8A this material may explain context but **cannot raise sufficiency or conviction**, cannot fill a coverage row, and cannot support a rated call. Nothing below is a recommendation to buy, size, or hold anything.

---

## Abstract

Copper trades around **US$6.62/lb on COMEX front month (2026-08-28)**, up **+46.63% over twelve months** and roughly 3% below a reported all-time high of US$6.83/lb — but the price-curve orb's own attribution arithmetic finds that twelve-month move **~0% explained and ~100% residual (unattributed)** by anything this module can measure [`02` §1, §4]. The single most decision-relevant structural fact is a **venue split in the carry**: LME cash–3M is in **backwardation (+US$248/t, 2026-08-26, ≈ +6.9%/yr to a roller)** while the COMEX chain reads **contango (≈ −6.1%/yr to a roller)** — roughly **13 percentage points a year of carry difference on the same metal**, with venue currently a bigger decision than direction [`02` §3a, §3b, §5]. The mechanically cleanest expressions are **LME Copper Grade A 3-month for a global view** and **COMEX `HG` front month for a US-delivered/tariff view**; there is **no physically-backed copper vehicle at all**, so every listed route pays either a roll or equity risk, and `CPER` is a 0.88%–1.06% fee wrapper that sits in **deferred** COMEX months and therefore does not track the front contract [`01` §2, §3, §4]. The empirical risk distribution is **`not_assessable` at all ten forecast horizons** — N = 0 non-overlapping outcomes against the §10 floor of 30, and 0 of 3 required regimes — because no lawful point-in-time copper price history exists anywhere in this engine [`03` §0–§4].

---

## Price & Trend

| Reading | Level | Basis / as-of | Source |
|---|---|---|---|
| COMEX `HG` front month | **US$6.62/lb** (= 662 US¢/lb) | 2026-08-28, +0.45% on the day | `02` §1 [Web: TradingEconomics — unvintaged, unverified, single secondary source] |
| LME Copper Grade A, **3-month** | **US$14,251/tonne** (= US$6.464/lb by `02`'s conversion) | 2026-08-26, +0.4% on the day | `02` §1 [Web: NaturalNews summarising wire copy — unvintaged, secondary] |
| LME **cash**, implied | ≈ US$14,499/tonne | `02`'s own arithmetic: 3M 14,251 + cash premium 248 — **inference, not an LME official cash settlement** | `02` §1 |
| 1-month change | +5.43% | to 2026-08-28 | `02` §1 [TradingEconomics — unvintaged] |
| 3- and 6-month change | **not sourced** | `02` refused to estimate; one summary placing a ~$6.71/lb record in "May 2026" contradicted the dated 2026-08-12 record and was dropped | `02` §1 |
| 12-month change | **+46.63%** | to 2026-08-28 | `02` §1 [TradingEconomics — unvintaged] |
| 52-week high | US$6.83/lb, described as the all-time high (August 2026) | price sits ~3% below it | `02` §1 |
| 52-week low | **not printed by any source** — implied ≈ US$4.51/lb (6.62 ÷ 1.4663) | `02`'s inference, not a printed low | `02` §1 |
| Real (inflation-adjusted) placement | **Top of its own ~5-year range, roughly the 100th percentile** — ~10% above the deflated 2021 peak (US$6.03/lb in Aug-2026 dollars), ~21% above the deflated 2024 peak (US$5.47/lb), ~77% above the deflated 2022 low (US$3.74/lb) | Deflator: US CPI +3.4% y/y July 2026 [BLS via CNBC, 2026-08-12 — unvintaged] plus `02`'s **own estimated** prior-year rates (~8% for 2021→22, ~2.9–3.2%/yr after) — labelled inference in the source file | `02` §5 |

**Trend read, carried with its qualifier.** Copper is in a mature uptrend near record levels, with dated record prints on both venues in the last three weeks (COMEX US$6.7140/lb on 2026-08-12 and US$6.7270/lb on 2026-08-25; an LME 3-month record close of US$14,201/tonne on 2026-08-25) [`02` §1, wire summaries — unvintaged]. **The qualifier is the finding, not a footnote:** `02`'s own driver-attribution line shows the US tariff premium is a *level* roughly where it was twelve months ago, so it explains **≈ +$0.00/lb of the +$2.11/lb (+46.63%) move — ~0% explained, ~100% residual (unattributed)** [`02` §4]. The wire reporting attributes the rally to a shortage of copper *outside* the United States created by US buyers pulling metal ahead of a possible 2027 refined-copper tariff — but that is a location story `02` explicitly could not verify, because the refined-balance series that would settle it (`copper-refined-balance`) is `unavailable` and belongs to a module that did not run here. **This synthesis carries the residual, not a driver story: the twelve-month move is essentially unexplained by anything this module holds, and that caps conviction rather than decorating it.**

The real-price placement is a statement about where the price sits in its own distribution — **not** a forecast, **not** a short signal, and **not** a fair value. The structural anchor that would carry fair value (the 90th-percentile mine cash-cost floor plus the new-mine incentive price, `copper-cost-incentive-range`) is `unavailable` [`00` §3; `02` §5]. A commodity can sit at a real high for years if the incentive price has risen under it, and **nothing in this module tells us whether it has: Not proven from available data.**

---

## Futures Curve / Term Structure

**The two venues are in opposite carry regimes, and this is not a contradiction to average away — it is the module's central structural finding.**

**COMEX `HG` — contango** (each deferred month above the one in front, monotonically out to 2031). `02`'s arithmetic, shown so it can be checked: Sep-26 6.6260 → Dec-26 6.7270 = +1.524% over 92 days ×(365/92) = **+6.05%/yr**; Sep-26 → Mar-27 6.8285 = +3.056% over 182 days ×(365/182) = **+6.13%/yr**. **Roll yield to a rolled long ≈ −6.1%/yr** — contango is a cost, because the long sells the cheaper near contract and buys the dearer far one at every roll [`02` §3a; Web: TradingView COMEX-HG1! chain, session close 2026-08-27 — unvintaged, unverified].

**This sign is contested and I am carrying the contest, not the conclusion.** Two other unvintaged sources put December-2026 copper at **US$6.017/lb** and **US$6.18/lb**, which against a ~US$6.63 front would be steep *backwardation* (≈ −9% over three months, ≈ −31%/yr) — a large roll **gain**, the opposite sign [`02` §3a]. `02` judged the TradingView chain internally coherent and the conflicting quotes not, but recorded that "smells like a scrape artefact" is not evidence. I add one corroborating worry the upstream file raised in a different section: the figure **6.7270** appears both as the Dec-26 contract price and as a spot record print dated 2026-08-25 [`02` §2, §3a] — the same number doing two jobs is itself a reason to distrust the chain. **Under §4's conservative default the carry cost wins for a long: do not bank a roll gain a second source contradicts.** Formally, COMEX curve shape is **not assessable for conviction** (`copper-comex-price-history` and `copper-lme-cash-three-month-curve` both unusable).

**LME cash–3M — backwardation**, the profile's designated tightness read, and it is doing the opposite of COMEX [`02` §3b, all rows unvintaged wire summaries]:

| As-of | LME cash − 3M | Annualised roll yield to a long (`02`'s arithmetic) |
|---|---:|---:|
| ~2026-08-11 | +US$45/t | ≈ +1.3%/yr |
| ~2026-08-24 (intraday peak) | ≈ +US$550/t — "highest in more than five years" | ≈ +14.9%/yr |
| 2026-08-24 (a reported print) | +US$434/t — "highest since October 2021" | ≈ +11.9%/yr |
| after the ~20kt delivery | ≈ +US$175/t | ≈ +4.9%/yr |
| **2026-08-26 (latest found)** | **+US$248/t** | **≈ +6.9%/yr** — (248 ÷ 14,499) × (365/91) |

**Carry in its own history, by reported rank only.** The peak was roughly the **99th percentile of a five-year window** — placed by *reported rank* ("highest since October 2021", "highest in more than five years"), **not** by a distribution this engine holds. Today's ~US$248/t is about **45% of the peak** and about **5.5×** the US$45/t level of two weeks earlier, and the spread lost roughly **55–68% of its value in two to three sessions**. `02` printed no z-score and I print none: `copper.lme-cash-three-month-curve` is `unavailable`, so no spread history and no standard deviation exists — **anyone quoting a z-score for copper carry in this run is making it up** [`02` §3c].

**Does storage pay? Split by venue** [`02` §3d]. Financing is sourced (US 3-month Treasury bill **3.79%**, 2026-08-26 [TradingEconomics — unvintaged]); **storage + insurance ≈ 1.5%/yr is `02`'s labelled estimate, not sourced**, so both verdicts inherit that uncertainty. Full carry ≈ **5.3%/yr**.
- **LME — cash-and-carry does not pay, by a wide margin.** Buying cash at ~US$14,499/t and selling the 3-month at US$14,251/t locks in **−US$248/t** and then pays ~US$191/t of carry over the quarter — about **−US$439/t per quarter ≈ −12.1%/yr**. Rearranged, the **implied convenience yield ≈ 12.2%/yr** (`y = 3.79% + 1.5% + 6.86%`). London is paying roughly 12% a year for metal *now* rather than in three months.
- **COMEX — cash-and-carry roughly pays, marginally.** Contango +6.05%/yr against ≈5.3%/yr full carry leaves ≈ **+0.75%/yr** to a storer, i.e. an implied convenience yield near zero to slightly negative. `02` labelled this **directional, not decided**, given the quote conflict and the estimated storage leg, and I carry that label.

**What the split means.** LME backwardation prices scarcity of metal a buyer can touch in London/Asia **today**; COMEX contango prices a term premium for **US-delivered** metal after a possible January-2027 tariff. Location and delivery date are doing the work, exactly as the profile's family rule warns. The signal sidecar makes the same point mechanically: the `curve-carry` cluster holds one bullish row (LME backwardation, `driver`, 0.5) and two bearish rows (COMEX contango roll cost, `risk`, 0.45; LME carry five-year-extreme flattening, `risk`, 0.4) — **a cluster with both directions is `contradiction: true` under §8 and is never conviction-eligible.**

---

## Physical Basis & Delivery Pressure

| Measure | Latest | Placement | Direction | Source |
|---|---:|---|---|---|
| **True aligned physical basis** (physical assessment − deliverable futures) | **Not computable** | — | — | No lawful physical assessment aligned on grade, location, delivery date, currency and unit is reachable; `copper-regional-arbitrage` `unavailable`; no licence worked around [`02` §4] |
| LME cash − LME 3M (near-dated basis, same grade and venue) | **+US$248/t** backwardation | ~99th pct at the 2026-08-24 peak by reported rank | Flattening hard | `02` §4 [wire summary, 2026-08-26 — unvintaged] |
| **COMEX front − LME 3M** (regional premium, **partially aligned**) | ≈ **+US$547/t (+3.8%)** — 6.7125/lb × 2,204.62 = $14,798/t less $14,251/t | "levels not seen since last autumn", i.e. ~12-month high **by report, not by a distribution held** | Widening into the tariff decision | `02` §4, COMEX close 2026-08-25 vs LME 3M 2026-08-26 — **not date-matched** |
| COMEX Dec-26 − LME 3M (better date alignment) | ≈ +US$579/t (+4.1%) | — | — | `02` §4; still not date-matched |
| **Yangshan / China import premium** (LME-basis, CIF Shanghai) | EQ copper late-Aug arrival **US$75/t**; Sept arrival **US$75–85/t**; registered B/L Aug arrival **US$110–120/t** | Below its own recent range — reported to have peaked last year | Weakening; SHFE/LME ratio deteriorating | `02` §4 [SMM Yangshan spot commentary, Aug-2026 — vendor assessment, unvintaged, unverified] |

**The +US$547/t venue spread is a gross spread, not "the arb".** `02` states plainly what is and is not matched: grades differ (COMEX Grade 1 electrolytic vs LME Grade A — economically comparable but **different brand lists and warehouse eligibility**); locations differ (US-warehouse-linked vs a global network — and that location gap **is** the signal, not noise to net out); the delivery dates are **mismatched by roughly two months** (COMEX Sep-26 front against a rolling LME 3-month prompt, which never align exactly); currency needs no adjustment on this leg (both USD) but the SHFE leg is **not additive** (RMB, VAT, separate bonded regime) and was not converted; and **freight, duty and VAT are not deducted**. Calling it "the arb" would overstate it [`02` §4].

**Delivery pressure — `stressed`, relieving, and formally `not assessable` for conviction** [`02` §4]. The dated evidence: roughly **half of remaining LME stock was already earmarked for withdrawal** at the height of the squeeze, with **51,400 t** of fresh withdrawal orders on 2026-08-24 and **65,400 t** earmarked over recent days; then Trafigura and others delivered **more than 20,000 t** into LME warehouses on 2026-08-25 (the largest one-day on-warrant build since April), and **on-warrant stock rose ~63kt over three days, a >50% increase**. `02`'s assessed read is that the London prompt was under genuine delivery stress through 2026-08-24 and that the stress was substantially relieved within two sessions. **The formal status is `not assessable` because every input is unvintaged secondary reporting and the warrant-status series that would evidence it is `unavailable`** — I carry that status, not the narrative alone. No emergency exchange rule, lending-guidance intervention or EFP dislocation was reported in the material found; **absence of a report is not proof of absence.**

**Accessible-inventory cross-check — a cross-reference, not a second causal vote.** Inventory levels are owned by `commodity-demand-inventory`, and both of its rows (`copper-visible-inventory`, `copper-inventory-accessibility-opacity`) are `unavailable` [`00` §3]; that module did not run in this layer. As context only, the stock trajectory reported alongside the curve is: **LME warehouse stock 204,975 t, down from 249,850 t in late July and 389,425 t in late May** (the 42-session decline reported as the longest since 2014), against **COMEX stock at a record ~675,185 t after 46 consecutive daily increases** [`02` §4 — unvintaged wire summaries]. That geographic split is *directionally consistent* with the venue carry split — a shrinking London buffer alongside backwardation, a record US buffer alongside contango — but **consistency is not evidence, and I do not convert it into an inventory signal.** Two limits bind here: (a) MODULE_RULES §9 forbids inferring off-warrant, bonded and off-exchange material as zero, and the accessibility row is unmeasured, so **how much of the ~675,185 t of US metal is actually accessible to a non-US buyer is Not proven from available data** — which is precisely the question the tariff basis turns on; (b) the triage separately logged an unverified social-media claim of ~940kt combined stocks with COMEX at ~666kt, and explicitly ruled it **not usable** [`00` §3b] — I do not lean on it and note only that it points the same way as the wire figures without corroborating them.

---

## Volatility, Drawdowns, Event Gaps & Required Scenario Span

**The empirical return distribution for COPPER is `not_assessable` at every one of the ten forecast-grid horizons — absent, not thin.** N = **0 non-overlapping outcomes** against the §10 floor of **30**, at all ten grid points plus the 1-day and 1-week diagnostics; realised volatility, skew, drawdown and time-to-recovery are `n/a` for the same single reason [`03` §1].

**The blockage is structural, and the distinction matters for the repair.** `03` verified three things independently at decision time: the pulse transport fails `EPERM` on the `tsx` IPC pipe (reproducing `00`'s `PULSE-MISSING`); a healthy pulse would return **one current quote**, not a return history, so the pulse outage is the *smaller* of two problems; and the connector registry holds 27 connectors of which **none is a price-history connector for any commodity**, with `data/COPPER/` non-existent and no `@HG` history file anywhere in the tree. **`copper.comex-price-history` is therefore structurally absent, not merely stale or temporarily unreachable** [`03` §0]. `03` explicitly refused two shortcuts that would have produced a plausible-looking table: reconstructing returns from remembered price levels (the `bad extraction` / `bad math` pair, root §20), and substituting overlapping daily windows to manufacture N above 30.

**Regime-conditioned distribution: 0 of the minimum 3 comparable regimes**, across all seven copper-relevant regime states (LME curve state, visible-inventory state, broad USD, China industrial activity, US 10y real yield, US trade-policy state, refined-balance state). **Two independent failures stack**: there is no return series to split, *and* there are no point-in-time regime labels to split it by — repairing only one still leaves the section not assessable [`03` §2]. `03` also flags for any future run that ICSG balances are **revised**, so a balance regime must be labelled from the vintage published *at* each historical date or the conditional distribution learns the answer before the question.

**Event-gap ledger: eight classes, N = 0 measured gaps in every one** (ICSG balance/forecast; exchange weekly stocks; China activity + PMI; CFTC COT; major-miner quarterly production; unscheduled mine disruption; **US trade-policy/tariff decisions**; exchange disruption/delivery-eligibility events). They are kept as eight separate rows on purpose — pooling a weekly warehouse print with a tariff ruling would understate the policy tail and overstate routine-release volatility [`03` §3].

### Required scenario-span envelope — carried forward exactly

| Horizon | Empirical bear bound | Empirical bull bound | Tail/event lower | Tail/event upper | Status |
|---|---:|---:|---:|---:|---|
| Tactical 30 / 45 / **60 (§11 default)** / 75 / 92 days | n/a | n/a | n/a | n/a | **not assessable** |
| Strategic 182 / 273 / **365 (§11 default)** / 456 / 548 days | n/a | n/a | n/a | n/a | **not assessable** |

Exact reason, identical for all ten rows: **no lawful point-in-time price history for the declared instrument; N = 0 non-overlapping outcomes against a §10 floor of 30; 0 comparable regimes against a floor of 3** [`03` §4]. The catalyst-horizon mapping is well-formed (both defaults are exact grid points; no bracketing invoked; no cross-gap interpolation) — but as `03` puts it, **a correct pointer into an empty table is still an empty answer.**

**The tail class is identified in kind and unmeasured in magnitude — and those are different statements, both of which travel forward.** Secondary reporting describes a single-session COMEX collapse on 2025-07-30/31 when a US tariff decision excluded refined cathode against wide expectations, with the magnitude **disagreeing across three sources: 19% [ING Think, 2025-07-31], 20% [SunSirs, 2025-08], 22% [secondary trade commentary, accessed 2026-08-28] — all unverified secondary** [`03` §3a]. `03` set three binding limits I carry unchanged: **it is not a tail bound** (sources that cannot agree within three percentage points cannot fix a 10th/90th percentile); **N = 1 is not a distribution**; and **it carries no direction** (the 2025 gap was down because the ruling landed softer than positioning expected; a harder ruling gaps the other way). Separately, one bank's model reads the current COMEX premium as implying roughly a **14.6%** chance of a 15% tariff by January 2027 and **37%** of a 30% duty by January 2028 [`01` §2 and `03` §3a, FXStreet/CNBC/Bloomberg summaries of Société Générale — unverified secondary, broker research, verdict-stripped; **a model output, not a market print**].

**Binding instruction to the scenario engine and the terminal thesis, carried verbatim in force** [`03` §4a]: there is **no empirical bound for a scenario set to clear**, so a scenario set published for COPPER in this run cannot pass the span audit; **the absence of a bound is not a licence to pick one** — an asserted envelope (say ±15% at 60 days) would be a fabricated bound wearing this orb's authority, and this file may not be cited as its basis; and **the killer-risk case is identified in kind (a live, unscheduled, binary US refined-copper tariff ruling) but `not assessable` in magnitude.** What the unvintaged context legitimately establishes is qualitative and worth keeping: any COPPER scenario set spanning only ordinary volatility would fail root §10's span check on its face — **the engine simply cannot say by how much.**

---

## Instruments & Cleanest Exposure

**The structural fact that constrains every choice: there is no physically-backed copper vehicle.** `01`'s survey of US-listed products found none — copper's bulk makes vaulting uneconomic — so **every listed copper instrument is either a futures vehicle (roll + fee) or an equity vehicle (operating + equity risk). There is no fee-only, roll-free way to hold copper.** `01` labelled this "none found", **not** proof that none exists; I carry that qualifier [`01` §2].

| Route | What it actually is | Cost | The wedge against the metal |
|---|---|---|---|
| **LME Copper Grade A, 3-month** (US$/tonne, 25 t lot, physically settled) | The global benchmark the physical trade prices off; free of the US tariff basis | Broker commission + LME fees — **not obtained** | Prompt-date rolls (LME trades **dated prompts**, not a simple front month); needs an LME-member broker and margin. Carry direction is knowable only from an unvintaged spread |
| **COMEX `HG` front month** (US¢/lb, 25,000 lb, US$12.50 tick) | US-delivered refined copper; screen-tradable and transparent | Broker commission + exchange fees — not obtained | Carries the **Section 232 location basis**. That is a feature only if the tariff *is* the view; otherwise it is uncompensated policy risk inside the trade |
| **`CPER`** US Copper Index Fund | An exchange-traded **commodity pool** (futures fund), **not physical**, tracking the SummerHaven index of **one or three** COMEX contracts reselected monthly | **0.88%** stated (0.65% mgmt + 0.23% other) per the 424B3 dated 2026-04-24; aggregators say **~0.97%–1.06%** all-in — **conflict unresolved; §4's conservative reading is the higher figure** | **Not front-month** (August components included **Dec-26** and **May-27**), so it tracks neither `@HG.1` nor the LME 3-month; **±10% tracking tolerance** over 30 valuation days; US-location basis; K-1 partnership tax admin (**not verified against the prospectus tax section**) |
| **`CPXR`** / 2× copper ETPs | Daily-reset leveraged futures | Not obtained | **The reset is the divergence** — over any period longer than a day the return is not 2× the copper move. A trading tool, not an exposure |
| **`COPA`** / ETCs | Issuer **debt security** delivering futures total return via collateralised swaps | 0.98% (2× version) | Roll + fee **plus issuer/counterparty credit** — mitigated by daily-marked collateral in segregated accounts, **not eliminated** |
| **`COPX`** (US$8.69bn AUM, 40 miners, top-5 = 26.33% combined) / **`ICOP`** / **`FCX`** | **Equities** | 0.65% / 0.47% / n/a | **Not the metal.** Operating leverage (`01`'s arithmetic: at ~US$6.59/lb against ~US$1.90/lb producer cash cost, a 1% copper move is ~**1.41%** of cash margin — and that is a **floor** on the leverage, ignoring fixed costs, tax, capex and the equity multiple), plus non-copper revenue (BHP, Teck earn from iron ore, coal, zinc) and plain equity risk |

**Cleanest expression — mechanisms, not an action** [`01` §4]. For a view on **global** copper, **LME Grade A 3-month** is mechanically cleanest: it is the contract the profile's tightness lens is defined on and it carries no US tariff basis — but **the carry you would pay or earn is formally unknown before you take the position**, since `copper-lme-cash-three-month-curve` is `unavailable`. For a view on **US-delivered copper or on the tariff itself**, **COMEX `HG` front month**. If futures are unavailable to the account, **`CPER` with eyes open** — the only sizeable US-listed vehicle holding copper futures rather than mining equities (~1.3m shares/day, US$732m–872m AUM [Web, 2026 — unvintaged]), but the *least clean* futures route: roughly a percent a year of fee plus deferred-month basis risk. **`COPX` / `ICOP` / `FCX` are not expressions of a copper view** — the profile is explicit that miners are a **levered confirmation, not the metal**, and if the thesis is "copper goes up", the miners can still fall. `FCX` deserves its own warning: its reported copper cash cost of **~US$1.90/lb is stated on assumptions of US$4,000/oz gold and US$30.00/lb molybdenum, with ±US$0.03/lb of copper cost per ±US$100/oz gold** — so a gold move alone changes FCX's copper cost line with copper unchanged [`01` §3].

**One evidence limit on this whole section:** two attempts to read primary SEC filings (CPER's 424B3 and FCX's Form 8-K exhibits) returned **HTTP 403**, so the fee, component, guidance and sensitivity figures above are cited to the **secondary summaries actually read** and are **not verified against EDGAR** [`01` header, §2, §3].

---

## Reconciliation & Gaps

**Contradictions resolved, not averaged.**

1. **COMEX curve sign — contango (−6.1%/yr) vs implied steep backwardation (≈ −31%/yr, a roll gain).** Not reconcilable on the evidence held: the TradingView chain is internally coherent and monotonic, the two conflicting December-2026 quotes (US$6.017 and US$6.18/lb) are not, and the same 6.7270 figure appears as both the Dec-26 contract price and a 2026-08-25 spot record print. **§4 conservative default applied: the carry cost stands for a long; the roll gain is not banked.** Formal status remains **not assessable for conviction** [`02` §3a].
2. **LME vs COMEX carry direction.** **Not a contradiction — a venue and delivery-date split**, adjudicated as such: LME backwardation prices metal touchable today in London/Asia; COMEX contango prices US-delivered metal after a possible January-2027 tariff. Both are carried; neither is netted [`02` §3b].
3. **Front-month price, US$6.59/lb (2026-08-27) vs US$6.62/lb (2026-08-28).** Same series, different as-of dates, both unvintaged TradingEconomics reads — **not a conflict**. The decision-date figure **US$6.62/lb (2026-08-28)** governs this module. Neither is an exchange print, so §4's "prefer the exchange/official figure" **cannot be applied — there is no official figure to prefer.** The one-day difference does not change `01`'s ~1.41× cash-margin leverage floor materially (at 6.62 it is ~1.40× — my arithmetic, inference).
4. **CPER fee, 0.88% (prospectus via secondary summary) vs ~0.97%–1.06% (aggregators).** Unresolved; **§4 conservative reading applied — the higher figure is used in the carry build below** [`01` §3].
5. **An internal inconsistency in `02` I must name rather than pass on silently (§3).** `02` §1 reports "an LME 3-month record close of $14,201/tonne on 2026-08-25 ... against a prior LME record of $14,527.50/tonne" — a "record" **below** the prior record, which cannot both be true as stated (most likely an intraday-vs-close mix or a scrape artefact, but that is inference). Separately, §1's all-time high of **US$6.83/lb** sits above the §2 "record prints" of 6.7140 and 6.7270, and §4's regional-premium leg uses a 2026-08-25 COMEX close of **6.7125/lb** where §2 gives **6.7270** for the same date. **Consequence:** the record-level and premium figures are carried as approximate context only; no level above is used as a threshold, trigger or bound.

**Named failed or unusable inputs — their checklist items are "Not proven from available data" (§11/§22).** All four specialist reports were produced; **no upstream file is missing.** What failed is the data beneath them:

| Unusable input | Status / exact reason | What is therefore not proven |
|---|---|---|
| `copper.current-price` | **missing — `PULSE-MISSING`**; `refresh-swarm-pulse.sh` fails `EPERM` on the `tsx` IPC pipe, reproduced independently by `03` at decision time | No vintaged anchor for the curve, the arb, the cost-floor comparison, or any return calculation |
| `copper.comex-price-history` | **unavailable — structurally absent**; no price-history connector exists for any commodity in the 27-connector registry | The entire empirical distribution, volatility, skew, drawdowns, event gaps and scenario span |
| `copper.lme-cash-three-month-curve` | **unavailable**; no connector, no licensed LME feed with exact prompt dates | The profile's headline tightness lens as *evidence*; any z-score or percentile for copper carry |
| `copper.regional-arbitrage` | **unavailable** | The true aligned LME–COMEX–SHFE arb net of FX, tax and freight; the +US$547/t figure is a **gross** venue spread |
| `copper-visible-inventory`, `copper-inventory-accessibility-opacity` (other module) | **unavailable**; §9 forbids inferring hidden stocks as zero | How much visible metal is **accessible**; the geographic-split story stays context, not evidence |
| `copper-refined-balance`, `macro-china-industrial-activity` and 16 further required rows | **unavailable / missing** [`00` §5] | Whether the rally reflects a global deficit or a location dislocation — the question the trend read turns on |
| CPER 424B3 and FCX 8-K exhibits on `sec.gov` | **HTTP 403** — primary filings unreachable | Every instrument fee, component, guidance and sensitivity figure is secondary-summary sourced, unverified against EDGAR |

### Claim-fidelity pass over the specialist roll-up (CLAUDE.md §3)

One explicit pass, checking every carried claim against the four failure shapes:

| Carried claim | Qualifier kept? | Basis kept? | Build kept? | Verdict hardened? |
|---|---|---|---|---|
| +46.63% 12-month move | Yes — carried **with** its ~100%-unattributed residual as the finding, never softened into a tariff or deficit driver story | Yes — COMEX front month, unvintaged TradingEconomics, 2026-08-28 | Yes — +$2.11/lb of a $6.62 price; attribution arithmetic reprinted | No |
| COMEX roll ≈ −6.1%/yr | Yes — "contested by a second source by sign", "not assessable for conviction" | Yes — **COMEX-rolled**, Sep-26→Dec-26 and Sep-26→Mar-27 | Yes — both percentage and annualisation shown | No |
| LME roll ≈ +6.9%/yr | Yes — "five-year extreme, already gave back ~half in two sessions, mean-reverting by construction" | Yes — **LME cash–3M**, 2026-08-26 | Yes — (248 ÷ 14,499) × (365/91) shown | No |
| Delivery pressure "stressed, relieving" | Yes — **`not assessable` for conviction**, every input unvintaged secondary | Yes — LME warrants and on-warrant rebuild | Yes — 51,400 t / 65,400 t / >20,000 t / ~63kt shown | No |
| Carry percentile ~99th | Yes — "by **reported rank**, not a distribution held"; **no z-score printed** | Yes — LME cash–3M, five-year window | Yes — the two rank claims quoted | No |
| Real price at ~100th percentile | Yes — "a placement, **not** a forecast, **not** a short signal, **not** a fair value"; deflator partly `02`'s own estimate | Yes — deflated to Aug-2026 dollars | Yes — all three reference points shown | No |
| Cash-and-carry verdicts | Yes — storage leg is an **estimate**, COMEX read is "directional, not decided" | Yes — venue-split, financing sourced separately | Yes — full decomposition shown | No |
| Distribution `not_assessable` | Yes — "absent, not thin"; structural, not stale | Yes — N=0 vs floor 30; 0 of 3 regimes | Yes — all ten horizons listed | No |
| Tariff event gap 19%/20%/22% | Yes — **not a tail bound, N=1, no direction**; three disagreeing unverified secondary sources | Yes — single-session COMEX, 2025-07-30/31 | Yes — all three figures and their sources shown | No |
| 14.6% / 37% tariff probabilities | Yes — **one bank's model output, not a market print**; verdict-stripped broker research | Yes — implied by the COMEX–LME premium | Yes — both dates and duty levels shown | No |
| CPER fee 0.88%–1.06% | Yes — conflict unresolved, conservative (higher) figure used | Yes — prospectus-via-secondary vs aggregators | Yes — 0.65% + 0.23% build shown | No |
| Miner leverage ~1.4× | Yes — a **floor**, my/`01`'s arithmetic, inference | Yes — cash margin, not share price | Yes — 6.62 ÷ 4.72 shown | No |

**Module verdict block.**
- **Module read: Partial — structure described, nothing evidenced.** The venue-split carry, the delivery-pressure sequence and the instrument map are legible and internally consistent; **none of it is vintaged.**
- **§8A applied explicitly: every figure in this module is unvintaged live-web context and therefore cannot raise sufficiency or conviction.** All 13 sidecar rows carry `unvintaged:`/`missing:` tokens with empty `source_vintage_refs`; **zero conviction-eligible rows.** Two clusters (`curve-carry`, `delivery-pressure`) hold both bullish and bearish rows and are `contradiction: true` under §8, so they are never conviction-eligible even if vintages were restored today.
- **Data-sufficiency score: 10 / 100** — root §11 band **0–29, "insufficient — refuse to rate"**. Basis: 0 of 22 required semantic series usable engine-wide, 0 of 4 owned by this module, no vintaged price anchor, no price history at all.
- **Market-structure directional-conviction score: capped at 0 / 100 and reported as `not assessable`.** Note the §9 convention: this is a directional-conviction score — it measures strength of evidence for a stated direction, never bullishness. No score above the cap may be derived from anything in this module.
- **Constraint that travels to the terminal module (MODULE_RULES §10 and §11):** a `not_assessable` distribution forces **`Research More`** unless an independently proven critical risk with a cited source forces `Avoid`. No such proven critical risk exists in this module's evidence — the tariff class is identified but unmeasured. **This module issues no action verdict; the terminal `commodity-thesis` module routes.**
- **Single highest-value next data request (§22), reconciled between the two orbs that asked for different things:** `00` asked for the pulse quote transport; `03` showed that repair returns **one quote** and still leaves the distribution empty. **The binding request is `03`'s: a lawful point-in-time daily close history for COMEX Copper `HG` front month, continuous back-adjusted, with source identity and an accepted immutable vintage — at least 3 years for the tactical grid and 10 years for the strategic grid and a three-regime split.** The pulse repair is the necessary second item, not the first.

---

## Note to the Commodity Thesis

- **Roll-adjusted expected-return contribution (~12-month, horizons matched) — reconciled here, because both inputs exist only at this layer.** The two upstream files do **not** state the same thing, and the reconciliation is that **`01` refuses to name a roll-drag number at all**: it records CPER's roll-drag **sign and size as `not assessable` this run**, saying explicitly that any claim CPER "suffers contango drag" today would be invented [`01` §3]. `02` supplies venue-split carry figures from unvintaged quotes. The stricter read wins (§4/§23): **the roll-adjusted expected return is `not assessable` for conviction.** The numbers below are visible, non-conviction context, and every one is **carry only — no price leg is forecast anywhere in this module**, so this is a *carry contribution*, not an expected return:
  - **COMEX-rolled (the venue a US-listed long actually holds):** roll **−6.1%/yr** (contango) + collateral **+3.79%/yr** (US 3M bill, 2026-08-26) = **≈ −2.3%/yr net carry** [`02` §5]; less CPER's fee of **0.88%–1.06%** [`01` §3] → **≈ −3.2% to −3.4%/yr before any price move** (my arithmetic, inference). Plain English: **a COMEX-rolled long needs copper to rise roughly 3% a year just to break even.** Two qualifiers that must travel with it — the contango sign is **contradicted by a second unvintaged source**, and **CPER sits in deferred months (Dec-26, May-27), so the Sep→Dec front roll above is not CPER's actual roll** [`01` §2].
  - **LME-rolled:** roll **+6.9%/yr** (backwardation at +US$248/t, 2026-08-26) + **3.79%** = **≈ +10.7%/yr net carry**; but that spread is a **five-year extreme that already gave back roughly half its value in two sessions**, so `02`'s own forward-looking band is **+5% to +9%/yr**, mean-reverting by construction (+8.7%/yr at ~$175/t, +5.1%/yr at ~$45/t) [`02` §5].
  - **The gap is ~13 percentage points a year on identical metal. For a portfolio, the venue of the exposure is currently a larger decision than the direction of the price** — and **the conservative case for a long is the COMEX bleed, not the LME pay** [`02` §5].
- **The 12-month move is ~100% unattributed, and that is the finding, not a caveat.** +46.63% over twelve months; the US tariff premium is a **level roughly where it was a year ago**, so it explains ≈ +$0.00/lb of the +$2.11/lb move — **~0% explained, ~100% residual** [`02` §4]. A separate attribution line shows the LME backwardation collapsed from ~$550/t to ~$248/t (−55%) **while the outright price rose 0.4% to a record** — 0% of the price move explained by the carry collapse, and the exact configuration in which a spot-price win and a total-return loss coexist. **The terminal thesis must not adopt any driver story — tariff, deficit, or electrification — that this module's arithmetic does not carry.** Whether the rally is a global deficit or a location dislocation is **Not proven from available data**: `copper-refined-balance` and `macro-china-industrial-activity` are both unavailable.
- **The scenario-span envelope is `not_assessable` at all ten horizons** — N = 0 non-overlapping outcomes against the §10 floor of 30, 0 of 3 regimes, no lawful point-in-time price history anywhere in the engine (structurally absent, not stale) [`03`]. **There is no empirical bound for any scenario set to clear, and the absence of a bound is not a licence to pick one.** The killer risk is **identified in kind — a live, unscheduled, binary US refined-copper tariff ruling whose single-session realised magnitude secondary sources put at 19% / 20% / 22% (three disagreeing unverified sources, N = 1, two-sided)** — and **`not assessable` in magnitude.** Carry both statements; they are different. Any COPPER scenario set spanning only ordinary volatility fails root §10's span check on its face.
- **Sufficiency and routing.** Every figure in this module is unvintaged and **cannot raise sufficiency or conviction** (§8A); data sufficiency **10/100** (§11 "refuse to rate" band); directional conviction capped at **not assessable**. Per MODULE_RULES §10/§11 a `not_assessable` distribution mechanically forces **`Research More`** unless an independently proven critical risk forces `Avoid` — **and no proven critical risk exists in this module's evidence.** The exposure mechanics if a future run does clear the bar: **LME 3-month for a global view, COMEX `HG` for a US-delivered/tariff view, `CPER` only as a fee-and-basis wrapper, and never `COPX`/`FCX` as the copper position** — there is **no physically-backed copper vehicle**, so every route pays a roll or takes equity risk [`01` §2, §4].



---

## market-structure / 00_commodity-triage.md

_Source: `00_commodity-triage.md`_

# Commodity Triage — COPPER

**Run date:** 2026-08-28 · **Run root:** `commodity/runs/COPPER/` · **Profile section read:** `frameworks/commodity/COMMODITY_PROFILES.md` §`## COPPER` (lines 318–389) and its structured twin `frameworks/commodity/profiles/COPPER.json` (22 declared requirements).

COPPER **is** a recognised commodity in this engine: the profile section exists and is complete (benchmark, units, exchanges, lenses, instruments, priority sources, recurring reports, and a 22-row binding `Required semantic series` table). Identity is not the problem in this run. Data provenance is.

---

## 1. Identity

| Item | Value | Source |
|---|---|---|
| Benchmark / grade | LME Copper Grade A (USD/tonne) — the global benchmark. COMEX HG (US¢/lb) and SHFE (RMB/tonne, China) are the other two legs; the profile requires tracking the LME–COMEX and LME–SHFE arbs rather than treating any one as "the" price | `COMMODITY_PROFILES.md` §COPPER |
| Quote unit + currency | USD per tonne (LME) primary; also give US¢/lb (COMEX). SHFE quotes RMB/tonne | `COMMODITY_PROFILES.md` §COPPER |
| Primary exchange(s) | LME; COMEX (CME); SHFE | `COMMODITY_PROFILES.md` §COPPER |
| Business type / classification | Base / industrial metal — a mine-supply vs industrial-demand balance; "Dr Copper" macro barometer plus a structural electrification bid. Classify `Commodity-conditional` (macro-cyclical + structural demand) | `COMMODITY_PROFILES.md` §COPPER |
| Applicable lenses (from profile) | (1) **Market structure** — LME cash–3M spread (backwardation = tightness), LME/COMEX/SHFE warehouse stocks, TC/RCs as a concentrate-tightness tell. (2) **Supply/demand** — mine supply (Chile/Peru/DRC), disruptions (strikes, ore grades, water/permits), scrap, demand from construction/grid/EV, China (ICSG balances), stocks-to-consumption. (3) **Weather/seasonality — NOT applicable**; mild China seasonality only, keep short. (4) **Macro drivers (dominant)** — China property + stimulus + grid spend, global PMIs, the US dollar, real rates, the energy-transition bid, mine-supply disruptions. (5) **Positioning/flows** — COMEX managed-money net length (CFTC COT), LME COTR, `CPER` ETF flows. (6) **Valuation / fair value** — 90th-percentile mine cash-cost floor plus the new-mine incentive price, as a range | `COMMODITY_PROFILES.md` §COPPER |
| Family-specific physical rules in force | Align grade, warehouse eligibility, currency, unit and timestamp before comparing LME/COMEX/SHFE. Never add exchange stocks without separating on-warrant, cancelled-warrant and bonded/off-exchange material. TC/RC evidence belongs to `commodity-supply` and is not a second vote for the same mine disruption. China activity is a demand *input*, not proof of copper demand absent a primary end-use or refined-balance series | `COMMODITY_PROFILES.md` §COPPER |

---

## 2. Instruments (from profile)

| Instrument / ticker | Type | Exposure | Notes |
|---|---|---|---|
| LME Copper Grade A | Exchange futures/forwards (USD/tonne) | Direct — the global physical benchmark | Prompt-date structure, not a simple front month; cash–3M spread is the tightness read. Carries roll |
| COMEX Copper `HG` | Exchange futures (US¢/lb, CME) | Direct | The pulse transport symbol is `@HG.1` (front month). Carries roll. US-warehouse-linked, so it can decouple from LME on tariff/arb dynamics |
| SHFE Copper | Exchange futures (RMB/tonne) | Direct, China-domestic | Separate currency, VAT and bonded-stock regime; not directly additive to LME/COMEX |
| `CPER` (US Copper Index Fund) | ETF | Indirect — tracks COMEX copper futures + roll | Fees and roll drag: `CPER` is not spot copper (MODULE_RULES §4) |
| `COPX` | Miner-equity ETF | **Levered proxy, not the metal** | Profile is explicit: miners are a levered confirmation, carrying equity, cost and jurisdiction risk of their own |
| `FCX` and diversified-miner peers | Single-stock equity | Equity-risk proxy | Own operating leverage; not a clean copper expression |

---

## 3. Data Reachability

Statuses below are the **machine-verified** output of `scripts/commodity_profile_coverage.py`, run at a decision-time cutoff of `2026-08-28T23:59:59Z` against a scratch run-root (so as not to write into this run — the binding coverage compile happens after all orbs finish, per MODULE_RULES §8A). Result: **`complete=false`, `usable=0/22`**, digest `sha256:3e651827eb45731d3000ab9e9e88e4308483a28a2649ef934a7325c92b11b77d`.

Read that number carefully: **zero of twenty-two required semantic series carry an accepted, current, immutable vintage.** Per MODULE_RULES §8A a connector declaration, a reachable URL or a successful historical run is *not* evidence.

| Need ID / shared route | Stable series ID | Owner orb | Status | As-of | Vintage / source identity | Gap reason |
|---|---|---|---|---|---|---|
| `copper-managed-money-positioning` | `copper.managed-money-positioning` | commodity-positioning-flows | **missing** | — | none | Connector `cftc-cot-copper` exists and claims this series (`dataset_id cftc.disaggregated-cot-futures-only`, host `publicreporting.cftc.gov`), but **no eligible immutable vintage was knowable at decision time**. Declaration ≠ data |
| `copper-lme-investment-fund-positioning` | `copper.lme-investment-fund-positioning` | commodity-positioning-flows | **unavailable** | — | none | No connector claims this series. Only `lme-cotr-aluminium` exists; there is no copper LME COTR connector. Profile permits "manual or unavailable" — it is unavailable |
| `copper-etf-flows` | `copper.etf-flows` | commodity-positioning-flows | **unavailable** | — | none | No connector claims this series; no lawful `CPER` issuer-holdings feed wired |
| `macro-broad-usd-index` | `macro.broad-usd-index` | commodity-macro-drivers | **missing** | — | none | Connector `federal-reserve-broad-usd` exists and claims the shared series, but no eligible immutable vintage was knowable at decision time |
| `macro-china-industrial-activity` | `macro.china-industrial-activity` | commodity-macro-drivers | **unavailable** | — | none | No connector claims this series. This is the single most damaging gap for copper — China is the dominant demand lens |
| `macro-global-activity-demand-proxy` | `macro.global-activity-demand-proxy` | commodity-macro-drivers | **unavailable** | — | none | No connector claims this series |
| `macro-us-10y-real-yield` | `macro.us-10y-real-yield` | commodity-macro-drivers | **unavailable** | — | none | No connector claims this series. `treasury-real-yields-gold` exists but is bound to the Gold profile, not to this shared semantic ID |
| `copper-current-price` (shared route: swarm pulse `@HG.1`) | `copper.current-price` | commodity-price-curve | **missing — `PULSE-MISSING`** | — | none | `bash scripts/refresh-swarm-pulse.sh commodity COPPER` fails in this environment: `Error: listen EPERM: operation not permitted /tmp/claude-501/tsx-501/40718.pipe` — the pinned `tsx` runner cannot open its IPC pipe under the sandbox. Coverage gate reports "pulse quote snapshot is absent". **No pulse vintage has been fabricated.** See the unvintaged anchor below |
| `copper-comex-price-history` (shared route `@HG.1`) | `copper.comex-price-history` | commodity-price-curve | **unavailable** | — | none | Declared shared market history is absent or ambiguous — no continuous back-adjusted `@HG.1` history resolved |
| `copper-gold-price-history` (shared route `@GC.1`) | `copper.gold-price-history` | commodity-cross-asset-regime | **unavailable** | — | none | Declared shared market history is absent or ambiguous. Blocks the copper/gold ratio |
| `copper-miner-equity-history` (shared route `COPX`) | `copper.miner-equity-history` | commodity-cross-asset-regime | **unavailable** | — | none | Declared shared market history is absent or ambiguous |
| `copper-lme-cash-three-month-curve` | `copper.lme-cash-three-month-curve` | commodity-price-curve | **unavailable** | — | none | No connector claims this series; no licensed LME feed with exact prompt dates. Kills the primary market-structure (backwardation) read |
| `copper-visible-inventory` | `copper.visible-inventory` | commodity-demand-inventory | **unavailable** | — | none | No connector claims this series. No LME/COMEX/SHFE warrant-status stock history is wired |
| `copper-inventory-accessibility-opacity` | `copper.inventory-accessibility-opacity` | commodity-demand-inventory | **unavailable** | — | none | No connector claims this series. Off-warrant / bonded / off-exchange material is unmeasured — §9 forbids inferring hidden stocks as zero, so this forces an opacity cap downstream |
| `copper-regional-arbitrage` | `copper.regional-arbitrage` | commodity-price-curve | **unavailable** | — | none | No connector claims this series; the LME–COMEX–SHFE arb net of FX/tax/freight cannot be computed |
| `copper-concentrate-tcrc` | `copper.concentrate-tcrc` | commodity-supply | **unavailable** | — | none | No connector claims this series; no primary/licensed TC/RC assessment |
| `copper-mine-prepolicy-supply` | `copper.mine-prepolicy-supply` | commodity-supply | **unavailable** | — | none | No connector claims this series. `usgs-gold-mine-supply` exists but is Gold-bound; there is no ICSG/USGS copper mine-supply connector |
| `copper-supply-restrictions-routing` | `copper.supply-restrictions-routing` | commodity-supply-security | **unavailable** | — | none | No connector claims this series |
| `copper-refined-balance` | `copper.refined-balance` | commodity-demand-inventory | **unavailable** | — | none | No connector claims this series. No ICSG monthly balance is wired — the core supply/demand row is empty |
| `copper-scrap-supply` | `copper.scrap-supply` | commodity-supply | **unavailable** | — | none | No connector claims this series |
| `copper-energy-transition-demand` | `copper.energy-transition-demand` | commodity-demand-inventory | **unavailable** | — | none | No connector claims this series |
| `copper-cost-incentive-range` | `copper.cost-incentive-range` | commodity-cost-curve-fair-value | **unavailable** | — | none | No connector claims this series; the cost-floor / incentive-price anchor has no data |

### 3a. Source-liveness check (distinguishes `no_pool` from source disappearance)

Because every required row lacked an accepted vintage, one light reachability pass was run to establish *why*. The finding is that the priority primary sources are **alive and publishing** — the failure is a wiring/provenance failure in this environment, not the disappearance of the underlying sources.

| Priority source (profile) | Reachable / publishing? | Evidence (dated) |
|---|---|---|
| CFTC COT (COMEX Copper) | Yes — publishing on schedule | Latest weekly report dated 2026-08-18, released 2026-08-21 [Web: IndexBox COT summary, 2026-08-21 — unverified] |
| LME | Yes — official prices and warehouse/stock report pages live | [Web: lme.com "LME Copper" and "Warehouse and stock reports", accessed 2026-08-28 — unverified] |
| COMEX / CME | Yes — copper product page and daily settlements live | [Web: cmegroup.com copper overview, accessed 2026-08-28 — unverified] |
| SHFE | Yes — warrant/inventory data published and mirrored by aggregators | [Web: aggregator SHFE copper warehouse series, accessed 2026-08-28 — unverified] |
| ICSG | Yes — forecast releases published | ICSG Oct-2025 forecast (2025 surplus ~178kt, 2026 deficit ~150kt) subsequently **reversed** to a ~96kt 2026 *surplus* on 1.6% usage growth and higher secondary output [Web: mining/trade press summaries of ICSG releases, accessed 2026-08-28 — unverified, secondary] |
| Cochilco | Not tested this pass — no required row is uniquely owned by it | — |
| Wood Mackenzie / CRU | Licensed; not accessible in this environment | Profile requires them "dated, labelled"; no licence wired |

**Every fact in this sub-table is unvintaged live-web context.** Under MODULE_RULES §8A it may explain the situation but **cannot raise sufficiency or conviction**, and it does not turn any row above from `unavailable`/`missing` into usable.

### 3b. Unvintaged price anchor (context only — NOT the `copper-current-price` row)

Since the pulse transport is dead in this environment, the only price reference available is unvintaged web context. Recorded so downstream orbs know the order of magnitude, explicitly **not** as coverage:

- **COMEX Copper front month: ~US$6.59/lb, as of 2026-08-27** (reported down ~0.18% on the day) [Web: TradingEconomics copper page, as-of 2026-08-27, accessed 2026-08-28 — **unvintaged, unverified, single secondary source**]. Note the profile's own unit convention: the COMEX contract is conventionally quoted in US¢/lb, i.e. ~659 US¢/lb.
- **Tonne equivalent — my own arithmetic, labelled inference, not an LME print:** 6.59 USD/lb × 2,204.62 lb/tonne ≈ **US$14,530/tonne**. This is a *conversion of a COMEX futures quote*, not an LME Copper Grade A cash or 3-month settlement. The two are different contracts, and the LME–COMEX arb is precisely one of the things this profile requires us to measure rather than assume away. **Do not cite this figure as an LME price.**
- **Inventories — recorded with a health warning:** the only reading surfaced was a social-media post claiming combined LME+SHFE+COMEX stocks of ~940kt with COMEX at a record ~666kt and LME+SHFE at ~274kt, on pre-tariff US stockpiling [Web: X/Twitter post, mid-Aug 2026 — **unverified social-media source, low tier, not usable**]. It is logged only as a signpost that the geographic split may be extreme; it is **not** evidence, it violates nothing only because no orb may lean on it, and `copper-visible-inventory` remains `unavailable`.

If that ~US$6.59/lb level is even roughly right, copper is trading far above its historical range, which raises rather than lowers the cost of running this analysis on unvintaged data: a large move is exactly the condition under which a stale or wrong anchor does the most damage.

---

## 4. Local pool (`data/COPPER/`)

- **The directory does not exist.** `data/` contains ALUMINIUM, COCOA, COFFEE, CORN, SOYBEAN, SUGAR, WHEAT and equity subjects — but no `COPPER`.
- **Accepted external vintages (`data/COPPER/external/<provider>/` with `.source.json` sidecars passing MODULE_RULES §8A): none.**
- **Supplementary user notes (tier 9, dated, lower-tier per §4): none.**
- Per the run brief this absence is expected and is **not**, by itself, an Insufficient trigger. A private document pool is supplementary; the binding gate is the profile's required-series table, which is failing for its own separate reason (no accepted connector/shared-route vintages).
- No WILTW or report-derived material was used. Those are method-transfer material only and are forbidden as runtime evidence (§8A).

---

## 5. Sufficiency Verdict

- **Verdict:** Partial
- **Reason:** COPPER has a complete profile section — benchmark, units, exchanges, lenses, instruments and a 22-row required-series table — and its priority primary sources (CFTC, LME, COMEX, SHFE, ICSG) are demonstrably alive and publishing, so discovery can proceed; but **0 of 22 required semantic series carry an accepted current vintage** and the pulse quote transport is dead (`PULSE-MISSING`), so no rated terminal forecast is permitted.
- **Consequence the downstream orbs must honour:** under MODULE_RULES §8A, required rows that remain unusable make **both horizons `not_assessable`**, and §11's deterministic forecast contract then mechanically produces **`Research More`** — unless an independently proven critical risk forces `Avoid`. Orbs may run and may report unvintaged context clearly labelled as such; they may not convert any of it into conviction, a rated call, or a filled coverage row. No orb may substitute a weaker source silently for a missing required row (§8A): mark it failed/not-assessable and emit the data need.

**Missing (every gap, with its owner):**

- **`commodity-price-curve`** — `copper-current-price` (`PULSE-MISSING`, EPERM on the tsx IPC pipe); `copper-comex-price-history`; `copper-lme-cash-three-month-curve` (kills the cash–3M backwardation read, the profile's headline market-structure lens); `copper-regional-arbitrage` (kills the LME–COMEX–SHFE arb the profile explicitly requires).
- **`commodity-demand-inventory`** — `copper-refined-balance` (no ICSG balance: the core supply/demand row is empty); `copper-visible-inventory` (no warrant-status exchange stocks); `copper-inventory-accessibility-opacity` (off-warrant/bonded material unmeasured — §9 forbids treating hidden stocks as zero, so an opacity cap applies downstream); `copper-energy-transition-demand`.
- **`commodity-supply`** — `copper-mine-prepolicy-supply` (no ICSG/USGS copper connector); `copper-concentrate-tcrc`; `copper-scrap-supply`.
- **`commodity-supply-security`** — `copper-supply-restrictions-routing`.
- **`commodity-positioning-flows`** — `copper-managed-money-positioning` (connector `cftc-cot-copper` is declared and its source is publishing as of 2026-08-18, but no immutable vintage was knowable at decision time); `copper-lme-investment-fund-positioning`; `copper-etf-flows`.
- **`commodity-macro-drivers`** — `macro-china-industrial-activity` (the dominant demand lens for copper, entirely absent); `macro-global-activity-demand-proxy`; `macro-broad-usd-index` (connector declared, no eligible vintage); `macro-us-10y-real-yield`.
- **`commodity-cross-asset-regime`** — `copper-gold-price-history`; `copper-miner-equity-history`.
- **`commodity-cost-curve-fair-value`** — `copper-cost-incentive-range` (no cost floor, no incentive price, so no structural valuation anchor).

**Single highest-value next data request (§22):** restore the swarm pulse quote transport for `@HG.1` outside the sandbox (or supply an accepted vintage for `copper.current-price`). Without a vintaged current price there is no anchor for the curve, the arb, the cost-floor comparison, or any return calculation, and every other repair is worth less until it exists.



---

## market-structure / 01_commodity-instruments.md

_Source: `01_commodity-instruments.md`_

# Instruments & Exposure Map — COPPER

**Run date:** 2026-08-28 · **Run root:** `commodity/runs/COPPER/` · **Profile read:** `frameworks/commodity/COMMODITY_PROFILES.md` §`## COPPER` (lines 318–389) · **Sibling read:** `commodity/runs/COPPER/market-structure/00_commodity-triage.md` (verdict **Partial**).

**Evidence status — read before any number below.** This orb carries **no accepted connector vintage**. The swarm pulse quote transport (`@HG.1`) could not be refreshed in this environment (`PULSE-MISSING`, EPERM), and the sibling triage records **0 of 22 required semantic series usable**. Every figure in this report is either (a) an exchange/issuer/prospectus specification retrieved from live public web, dated and labelled unverified, or (b) my own arithmetic, labelled inference. Under MODULE_RULES §8A this material **may explain context but cannot raise sufficiency or conviction**, cannot fill a coverage row, and cannot support a rated call. Nothing here is a recommendation to buy, size, or hold anything.

Two attempts to read primary SEC filings directly (CPER's 424B3 and FCX's Form 8-K exhibits on `sec.gov`) returned **HTTP 403**, so filing-sourced figures below are cited to the **secondary summary I actually read**, per §5 (cite the source the number came from), and are flagged as not verified against EDGAR.

---

## 1. Benchmark & Contract

**The benchmark is LME Copper Grade A, quoted in US dollars per tonne.** It is the global physical reference; COMEX `HG` (US cents per pound) and SHFE `cu` (RMB per tonne) are the other two legs, and the profile requires the LME–COMEX and LME–SHFE arbs to be *measured*, not assumed away [`COMMODITY_PROFILES.md` §COPPER].

| Contract | Quote unit / currency | Lot | Tick | Grade / settlement | Source |
|---|---|---|---|---|---|
| LME Copper Grade A (code `CA`) | **US$ per tonne** | 25 tonnes | Not obtained this run | Grade A, min 99.9935% Cu; physically settled. Key legs: **Cash** (spot, T+2) and **3-month** — the 3-month is the quoted benchmark | [Web: lme.com "LME Copper" / contract-specifications pages, accessed 2026-08-28 — unverified] |
| COMEX Copper `HG` (CME) | **US cents per pound** (commonly written US$/lb) | 25,000 lb | US$0.0005/lb = **US$12.50 per contract** | Grade 1 electrolytic copper; physical delivery into US-approved warehouses | [Web: cmegroup.com copper contract specs and broker spec sheets, accessed 2026-08-28 — unverified] |
| SHFE Copper `cu` | **RMB per tonne** | 5 tonnes traded (delivery unit 25 tonnes per warrant) | RMB 10/tonne | Min 99.95% Cu cathode; delivery into SHFE-approved Chinese warehouses; 12 delivery months | [Web: shfe.com.cn English contract pages and Barchart spec pages, accessed 2026-08-28 — unverified] |

**Structural point the unit table hides.** LME is not a simple front-month market: it trades on **prompt dates** (daily out to 3 months, then weekly and monthly), so "the LME price" must always be named — cash, 3-month, or a dated prompt. COMEX and SHFE are conventional listed-month futures. The three are **different grades in different warehouse systems in different currencies**, so their prices are not interchangeable and their stocks are not additive without separating on-warrant, cancelled-warrant and bonded material [`COMMODITY_PROFILES.md` §COPPER, family-specific physical rules].

**Price anchor — context only, not coverage.** COMEX front-month copper at roughly **US$6.59/lb (≈ 659 US¢/lb), as of 2026-08-27** [Web: TradingEconomics copper page, as-of 2026-08-27, accessed 2026-08-28 — **unvintaged, unverified, single secondary source**]. **No LME print was obtained this run.** My own arithmetic converts that COMEX quote to ≈ US$14,530/tonne (6.59 × 2,204.62) — this is *inference from a COMEX futures quote*, **not an LME Grade A price**, and must never be cited as one. The gap between the two is precisely the arb the profile requires us to measure, and it is unmeasured this run (`copper-regional-arbitrage`: unavailable).

---

## 2. Instrument Map

Inverted-risk note: none of the columns below is a score. "Main divergence" states the mechanism by which the instrument's return separates from the metal's return.

| Instrument | Type | Exchange | Tracks | Fee | Main divergence from spot | Source |
|---|---|---|---|---|---|---|
| **LME Copper Grade A** | Exchange future/forward, physically settled | LME | Global benchmark refined copper, US$/tonne, on a named prompt date | Broker commission + LME fees (not obtained) | **Roll / carry** between prompt dates (cash–3M spread; backwardation = carry earned, contango = carry paid). Requires an LME-member broker; margin and financing costs. **Direction of carry is `not assessable` this run** — `copper-lme-cash-three-month-curve` is unavailable | [Web: lme.com, accessed 2026-08-28 — unverified] + triage §3 |
| **COMEX Copper `HG`** | Exchange future, physically settled in the US | COMEX (CME) | **US-delivered** refined copper, US¢/lb | Broker commission + exchange fees (not obtained) | **Roll** between listed months, plus a **US-location/tariff basis**: HG prices metal inside the US customs border, so it can decouple from LME on Section 232 policy. SocGen puts the long-run COMEX-over-LME bias at only ~**US$33/tonne** with a spread mean-reversion half-life of ~**3.5 days**, and reads the current premium as implying a **14.6%** chance of a 15% refined-copper tariff by Jan-2027 and **37%** of a 30% duty by Jan-2028 [FXStreet summary of Société Générale, 2026-08-10 — unverified secondary, broker research, verdict-stripped per §2] | [Web: cmegroup.com, accessed 2026-08-28 — unverified] |
| **SHFE Copper `cu`** | Exchange future, physically settled in China | SHFE | China-domestic refined copper, RMB/tonne | Not obtained | Separate **currency (RMB), VAT and bonded-stock regime**; capital-account access limits for non-Chinese investors. Not directly additive to, or arbitrageable against, LME/COMEX without FX, tax and freight adjustments | [Web: shfe.com.cn, accessed 2026-08-28 — unverified] |
| **`CPER`** United States Copper Index Fund | Exchange-traded **commodity pool** (futures fund), NOT physical | NYSE Arca | The **SummerHaven Copper Index Total Return (SCITR)** — a portfolio of **either one or three eligible COMEX copper futures contracts**, reselected **monthly** by quantitative formulas | **0.88%** total (0.65% management + 0.23% other) per the fee table in the 424B3 prospectus dated **2026-04-24**; third-party aggregators report a higher all-in **~0.97%–1.06%** | (1) **Not front-month:** the August benchmark components listed by the sponsor were Copper Future **Dec-26**, **Mar-26** *(shown verbatim; this month label looks inconsistent with a forward roll set and was not reconcilable)* and **May-27** — i.e. CPER can sit in **deferred** contracts and therefore does **not** track `@HG.1`. (2) **Roll:** the prospectus states that in contango the fund "would be selling less expensive contracts and buying more expensive ones", a "significant negative impact"; backwardation helps. (3) **Tracking tolerance is wide** — ±10% average daily percentage change over any 30 successive valuation days. (4) COMEX-only, so it carries the same **US tariff/location basis** as HG. (5) Fees compound daily against the index | [CPER 424B3 prospectus, 2026-04-24 — read via StockTitan filing summary, accessed 2026-08-28; **not verified against EDGAR (sec.gov returned 403)**]; components from [Web: uscfinvestments.com/cper, accessed 2026-08-28 — unverified]; higher expense figures from [Web: ETF aggregators, accessed 2026-08-28 — unverified] |
| **`CPXR`** USCF Daily Target 2X Copper Index ETF | **Leveraged, daily-reset** futures ETF | US listed | 200% of the **daily** performance of a copper futures index; launched 2025-01-21 | Not obtained | **Daily reset makes it path-dependent**: over any holding period longer than one day the return is not 2× the copper move, and in a choppy tape it decays. A trading tool, not an exposure | [Web: fund/aggregator pages, accessed 2026-08-28 — unverified] |
| **`COPA`** WisdomTree Copper (and its 2× sibling) | **ETC** — a collateralised debt security, not a fund | European exchanges (UCITS-eligible) | Total return on copper futures, delivered through **swaps** | 2× version 0.98% p.a.; unleveraged COPA fee not obtained | **Counterparty/credit risk is the distinguishing feature**: an ETC is an obligation of the issuer, not a fund holding assets. WisdomTree states swap-counterparty obligations are collateralised, marked to market daily, in segregated accounts at BNY Mellon — that mitigates the risk, it does not remove it. Plus roll and fee drag | [Web: wisdomtree.com COPA/COPB product pages and justETF, accessed 2026-08-28 — unverified issuer/aggregator pages] |
| **`COPX`** Global X Copper Miners ETF | **Equity** ETF | NYSE Arca | **Solactive Global Copper Miners Total Return Index** — 40 mining equities; AUM **US$8.69bn**, top-5 = HudBay 5.79%, First Quantum 5.23%, Teck-B 5.21%, BHP 5.09%, Southern Copper 5.01% (**26.33% combined — my arithmetic**), all as of **2026-08-27**; inception 2010-04-19 | **0.65%** | **Not the metal.** Three separate wedges: (a) **operating leverage** — miners' profits move by a multiple of the copper price (see §3 arithmetic); (b) **not pure copper** — BHP and Teck earn materially from iron ore, coal and zinc, so part of the index's return is a different commodity; (c) **equity risk** — cost inflation, grade decline, strikes, permits, jurisdiction/expropriation, balance sheets, and an equity multiple that re-rates independently of copper | [Web: globalxetfs.com/funds/copx, as-of 2026-08-27, accessed 2026-08-28 — unverified issuer page] |
| **`ICOP`** iShares Copper and Metals Mining ETF | **Equity** ETF | US listed | STOXX Global Copper **and Metals** Mining Index | **0.47%** | Same three equity wedges as COPX, and the index is explicitly broader than copper ("and metals mining"), so the non-copper share of the return is larger, not smaller | [Web: iShares/aggregator pages, accessed 2026-08-28 — unverified] |
| **`FCX`** Freeport-McMoRan | Single-stock **equity** | NYSE | One company's copper, gold and molybdenum output plus its balance sheet | n/a (no fee; taxes/spread apply) | Levered, co-product, single-asset-risk. See §3 | [Web summaries of FCX Q1/Q2-2026 results releases (Form 8-K Ex.99.1), accessed 2026-08-28 — unverified secondary, **not verified against EDGAR (403)**] |

**Structural gap worth naming: there is no physical copper vehicle.** Gold has GLD/SGOL holding allocated bullion; **this survey of US-listed copper products found no physically-backed copper ETF**. Copper's bulk (a tonne is worth roughly one thousandth of a tonne of gold per unit weight) makes vaulting uneconomic. The consequence is unavoidable: *every* listed copper instrument is either a **futures** vehicle (roll + fee) or an **equity** vehicle (operating + equity risk). There is no fee-only, roll-free way to hold copper. [Survey of the instruments above, accessed 2026-08-28 — treat as "none found", **not** as proof that none exists.]

---

## 3. Portfolio Instrument → Underlying

The portfolio holds **instruments**, not copper. This table translates each to what it actually is. No portfolio position in any of these was supplied to this run; the table covers the instruments the profile names.

| Held instrument | Mechanism (what it holds) | Fee | How it can diverge from the commodity |
|---|---|---|---|
| **`CPER`** | A commodity pool holding **one or three COMEX copper futures contracts**, reselected monthly by the SummerHaven rules; not physical copper, and not necessarily the front month (August components included **Dec-26** and **May-27**) | **0.88%** stated (0.65% mgmt + 0.23% other) [424B3, 2026-04-24, via secondary summary]; aggregators say **~0.97%–1.06%** all-in — **conflict unresolved; the conservative reading (§4) is the higher figure** | 1) **Roll.** Contango costs, backwardation pays. **Sign and size are `not assessable` this run** — no curve vintage exists, so any claim that CPER "suffers contango drag" today would be invented. 2) **Wrong contract for the profile's own price series.** Sitting in deferred months means CPER neither tracks `@HG.1` nor the LME 3-month; a curve-shape change alone moves CPER against spot. 3) **US-location basis.** COMEX-only, so it embeds the Section 232 tariff premium: it is exposure to *US-delivered* copper, not global copper. In the 2025 tariff episode the COMEX benchmark traded a premium of over 30% to LME against a five-year average under 1% [Web: trade-press summaries, accessed 2026-08-28 — unverified secondary; the year attribution in the retrieved summary was ambiguous and was **not** confirmed against a primary exchange print]. 4) **Tracking tolerance** of ±10% average daily percentage change over 30 valuation days is wide by fund standards. 5) **Tax/admin:** an exchange-traded commodity pool of this type is generally taxed as a partnership (Schedule K-1, not a 1099) — **not verified against the prospectus tax section this run**. 6) **Scale:** average net assets **US$228.3m** for the year to 2025-12-31 [424B3 via secondary summary]; aggregators put 2026 AUM at **US$732m–US$872m** and volume ~1.3m shares/day [Web, accessed 2026-08-28 — unverified] |
| **`COPX`** | 40 listed **mining equities** tracking the Solactive Global Copper Miners TR Index; **US$8.69bn** AUM, ~4.4m shares/day, as of 2026-08-27 | **0.65%** | **A levered, impure, equity-risk proxy — never read it as copper.** Sized: with copper near **US$6.59/lb** (2026-08-27, unverified) and a producer cash cost near **US$1.90/lb**, the cash margin is ~US$4.69/lb, so a **1% copper move is roughly a 1.41% move in cash margin** (6.59 ÷ 4.69 = **1.41×** — *my arithmetic, inference*). That 1.41× is a **floor** on the leverage, not the whole of it: it ignores fixed costs below the cash-cost line, tax, capex, and the equity multiple, which re-rates on its own. Against it run three wedges the metal does not have — non-copper revenue (BHP, Teck), company/jurisdiction risk, and general equity beta |
| **`FCX`** | One company's mines. 2026 guidance: **~3.1bn lb** copper sales; consolidated unit **net cash cost ~US$1.90/lb**, stated on assumptions of **US$4,000/oz gold** and **US$30.00/lb molybdenum**; sensitivity **±US$0.03/lb of copper cost per ±US$100/oz gold** and per **±US$2/lb moly**; management frames a **US$0.10/lb copper move as ~US$150m** of 2026 operating cash flow against an **US$8.3bn** base at US$6 copper; Grasberg at **0.8bn lb** with full capacity **delayed to late 2027** | n/a | **It is not a copper instrument; it is an equity whose copper cost line depends on the gold price.** A gold move alone changes FCX's reported copper cash cost through the by-product credit, with copper unchanged. Add single-asset concentration (the Grasberg delay is company-specific, not a copper fact), tax and royalty regimes, capital allocation, and the equity multiple. Cash-flow leverage from management's own figures: US$150m on US$8.3bn is **1.8% of operating cash flow per US$0.10/lb**, i.e. ~**1.19% per 1% copper move at US$6** (*my arithmetic, inference*) — but that is cash flow, not the share price, which moves by more because the multiple moves too. **All FCX figures here are web summaries of the Q1/Q2-2026 results releases, unverified, not read against EDGAR (403).** |
| **`CPXR`** / leveraged copper ETPs | Daily-reset 2× futures exposure | Not obtained | **The reset is the divergence.** Over anything longer than one day the return is not 2× the copper move; volatility erodes it. Never treat it as "copper with more size" |
| **`COPA`** / ETCs | Issuer **debt security** delivering copper-futures total return via collateralised swaps | 0.98% (2× version) | Roll + fee, **plus issuer/counterparty credit** — mitigated by daily-marked collateral in segregated accounts at BNY Mellon, not eliminated |

---

## 4. Cleanest Expression

**Mechanically cleanest, by what the view actually is** — this names mechanisms, not an action. Per the sibling triage and MODULE_RULES §8A, with 0/22 required series usable and `PULSE-MISSING`, this run cannot support a rated call on any of them.

1. **A view on *global* copper → LME Copper Grade A, 3-month, US$/tonne.** It is the benchmark the physical trade prices off, it is the contract the profile's tightness lens (cash–3M spread) is defined on, and it is free of the US tariff basis. Cost: you need an LME-member broker, margin, and you must manage prompt-date rolls. **Constraint this run:** the LME cash–3M curve is `unavailable`, so the carry you would be paying or earning is unknown — you cannot price the roll before you take the position.
2. **A view on *US-delivered* copper, or on the tariff itself → COMEX `HG` front month.** Screen-tradable, transparent (25,000 lb, US$12.50 tick), and it is the contract that carries the Section 232 basis. That basis is a feature only if the tariff *is* your view; if it is not, it is uncompensated policy risk sitting inside the trade. SocGen's read that the spread mean-reverts on a ~3.5-day half-life to a ~US$33/tonne bias says the tariff premium is the persistent part and the noise around it is fast [FXStreet summary of Société Générale, 2026-08-10 — unverified secondary].
3. **If futures are not available to the account → `CPER`, with eyes open.** It is the only sizeable US-listed vehicle that holds copper futures rather than mining equities, and it is liquid enough (~1.3m shares/day, US$732m–872m AUM [Web, 2026, unverified]). But it is the *least clean* futures expression: **0.88%–1.06% fee**, an unknown roll, deferred-month positioning that means it does not track the front month, a ±10% tracking tolerance, a US-location basis, and K-1 tax admin. Between CPER and HG, the fund is a convenience wrapper that costs roughly a percent a year plus basis risk.
4. **`COPX` / `ICOP` / `FCX` are not expressions of a copper view.** They are levered equity bets on copper *plus* company execution, cost inflation, jurisdiction and a re-rating multiple, and in COPX's case partly on iron ore and coal. The profile is explicit that miners are a **levered confirmation, not the metal**. Use them to confirm a copper signal, never as the copper position — and if the thesis is "copper goes up", the miners can still fall.
5. **Do not use `CPXR` or 2× ETCs for exposure.** Daily reset makes the holding-period return unknowable in advance.

**The honest summary.** There is no clean, cheap, roll-free way to own copper: no physical vehicle exists, so the choice is *pay the roll* (futures/CPER) or *take equity risk* (COPX/FCX). And this run cannot tell you which side of the roll you would be on, because the curve series is unavailable and the pulse quote is missing. That is a data need, not a view.



---

## market-structure / 02_commodity-price-curve.md

_Source: `02_commodity-price-curve.md`_

# Price Trend & Term Structure — COPPER

**Run date:** 2026-08-28 · **Run root:** `commodity/runs/COPPER/` · **Profile read:** `frameworks/commodity/COMMODITY_PROFILES.md` §`## COPPER` (lines 318–389) · **Rules:** root `CLAUDE.md` + `.claude/agents/commodity/MODULE_RULES.md` · **Sibling read:** `commodity/runs/COPPER/market-structure/00_commodity-triage.md` (verdict **Partial**).

**Benchmark and units (profile-binding).** LME Copper Grade A, **USD per tonne**, is the global benchmark. COMEX `HG` is **US¢/lb** (quoted here as USD/lb for readability). SHFE is **RMB/tonne**. These are three different contracts with different grades, warehouse eligibility, delivery locations and prompt-date conventions — the profile requires them to be *aligned* before comparison, never treated as one price. Conversion used throughout: **1 tonne = 2,204.62 lb**.

---

## 0. Evidence status before anything else (MODULE_RULES §8A)

**Zero of the four required semantic series this orb owns carries an accepted, current, immutable vintage.** Everything below is therefore either (a) **unvintaged live-web context**, which per §8A may explain the situation but **cannot raise sufficiency or conviction**, or (b) **my own arithmetic on that context**, labelled inference. No pulse vintage has been fabricated and no scraped quote is presented as one.

| Need ID | Stable series ID | Status | As-of | Vintage / retrieval ID | Exact reason unusable |
|---|---|---|---|---|---|
| `copper-current-price` | `copper.current-price` | **missing — `PULSE-MISSING`** | — | none | The swarm pulse quote transport for `@HG.1` could not be refreshed in this environment (`EPERM` on the pinned `tsx` runner's IPC pipe under the sandbox). Coverage gate reports the pulse quote snapshot absent. An unvintaged web anchor is recorded in §1 and is explicitly **not** this row |
| `copper-comex-price-history` | `copper.comex-price-history` | **unavailable** | — | none | No continuous back-adjusted `@HG.1` close history resolved from the declared lawful shared market route; the shared history is absent or ambiguous |
| `copper-lme-cash-three-month-curve` | `copper.lme-cash-three-month-curve` | **unavailable** | — | none | No connector claims this series and no licensed LME feed with exact prompt dates is wired. This kills the profile's headline market-structure lens (cash–3M backwardation) as *evidence*; §3 below reports it only as unvintaged web context |
| `copper-regional-arbitrage` | `copper.regional-arbitrage` | **unavailable** | — | none | No connector claims this series. The LME–COMEX–SHFE arb net of FX, tax and freight cannot be computed to evidence standard; §4 gives an unvintaged, partially-aligned approximation and names what is missing |

**Consequence I must honour and do not argue with:** these unusable required rows make both forecast horizons `not_assessable`, and MODULE_RULES §11's deterministic contract mechanically produces **`Research More`** at the terminal thesis unless a proven critical risk forces `Avoid`. Nothing in this report converts unvintaged context into a rated call, and I have not substituted a weaker source silently for any missing required row.

**One conflict is material enough to flag at the top.** Two mutually exclusive readings of the COMEX curve exist in the unvintaged material (§3). Under §4's conservative default I do **not** credit a rolled long with the favourable one.

---

## 1. Price Now & Trend

| Horizon | Level | Change | Source |
|---|---|---|---|
| **Spot / front (COMEX `HG` front month)** | **US$6.62/lb** (= 662 US¢/lb; ≈ US$14,594/tonne by my own conversion, **not** an LME print) | +0.45% on the day | [Web: TradingEconomics copper page, as-of **2026-08-28** — **unvintaged, unverified, single secondary source**] |
| **Front (LME Copper Grade A, 3-month)** | **US$14,251/tonne** (= US$6.464/lb by my conversion) | +0.4% on the day; prior close US$14,201/t was the highest ever close | [Web: NaturalNews summarising wire copy, as-of **2026-08-26** — unvintaged, unverified, secondary] |
| **LME cash (implied)** | **≈ US$14,499/tonne** — *my arithmetic:* 3M 14,251 + cash premium 248 | — | Inference from the two figures above; **not** an LME official cash settlement |
| 1 month | +5.43% | — | [Web: TradingEconomics, as-of 2026-08-28 — unvintaged] |
| 3 months | **not sourced** | — | No dated 3-month change found from a source I am willing to cite. Not estimated |
| 6 months | **not sourced** | — | Same. One search summary placed a ~$6.71/lb record in "May 2026", which contradicts the dated 2026-08-12 record print below; unresolved, so not used |
| 12 months | **+46.63%** | — | [Web: TradingEconomics, as-of 2026-08-28 — unvintaged] |
| 52-week range | High **US$6.83/lb** (August 2026, described as the all-time high). Low **not printed by any source I found**; *implied* ≈ US$4.51/lb — my arithmetic: 6.62 ÷ 1.4663 | — | High: [Web: TradingEconomics, as-of 2026-08-28 — unvintaged]. Low: inference, not a printed low |

**Trend read.** Copper is in a strong, mature uptrend and is sitting within about 3% of an all-time high. The metal is up roughly 47% over twelve months and about 5% in the last month alone, and the last three weeks have produced a run of record prints on both venues: a COMEX September record of $6.7140/lb on 2026-08-12, a fresh $6.7270/lb on 2026-08-25, and an LME 3-month record close of $14,201/tonne on 2026-08-25 with a $14,343/tonne intraday high, against a prior LME record of $14,527.50/tonne [Web: wire summaries, dated 2026-08-25 to 2026-08-27 — unvintaged, unverified]. The important qualifier, and it is the whole story of this run: the wire reporting attributes the rally to **a shortage of copper available outside the United States** created by US buyers pulling metal across the Atlantic and Pacific ahead of a possible 2027 refined-copper tariff — **not** to a proven global deficit. That is a location problem, and a location problem shows up in the curve and the basis, which is what the rest of this report measures. It is also a claim I cannot verify: the refined-balance series that would settle it (`copper-refined-balance`) belongs to `commodity-demand-inventory` and is `unavailable`.

---

## 2. Technical Levels (chart context, not fundamentals)

These are **chart levels the market is actually quoting** — reference points for where orders sit, not statements about what copper is worth. None of them is a valuation input, and none should be read as one.

- **US$6.83/lb (COMEX) — overhead resistance / the all-time high.** Described as the all-time high set in August 2026 [Web: TradingEconomics, as-of 2026-08-28 — unvintaged]. Chart level only.
- **US$6.71–6.73/lb (COMEX) — the breakout shelf, now the first support/pivot.** Two dated record prints, $6.7140 on 2026-08-12 and $6.7270 on 2026-08-25, sit here [Web: wire summaries, 2026-08-14 and 2026-08-27 — unvintaged]. Price has since traded back below it, so it is currently resistance-turned-pivot rather than support.
- **US$6.55/lb (COMEX) — the watched pullback low.** Price fell below $6.55 on 2026-08-13 after the first record, and has held above it since [Web: wire summary, as-of 2026-08-14 — unvintaged].
- **US$14,000/tonne (LME) — the round-number line the London market is watching.** It appears by name in current commentary framing ("can keep copper above $14,000"), which is what makes it a watched level; the round number, not any fundamental, is why [Web: trade commentary, accessed 2026-08-28 — unvintaged, unverified].
- **Moving averages: not stated.** I found no dated, sourceable value for a widely-watched moving average (50-day, 200-day) on either venue. I am not inventing one. This is a gap, not a level.

---

## 3. Futures Curve / Term Structure

### 3a. COMEX `HG` — the vehicle a US-listed rolled long actually holds

| Contract | Price (USD/lb) | Expiry | Source |
|---|---|---|---|
| HGQ2026 (Aug-26) | 6.5945 | 2026-08-27 | [Web: TradingView COMEX-HG1! contracts page, session close, accessed 2026-08-28 — **unvintaged, unverified**] |
| **HGU2026 (Sep-26) — front for a long on 2026-08-28** | **6.6260** | 2026-09-28 | same |
| HGV2026 (Oct-26) | 6.6650 | 2026-10-28 | same |
| HGX2026 (Nov-26) | 6.6995 | 2026-11-25 | same |
| HGZ2026 (Dec-26) | 6.7270 | 2026-12-29 | same |
| HGF2027 (Jan-27) | 6.7330 | 2027-01-27 | same |
| HGH2027 (Mar-27) | 6.8285 | 2027-03-29 | same |
| 2031 far month | ≈ 7.84 | 2031 | same |

**Shape: contango** (each deferred month above the one in front of it, monotonically, out to 2031).

**Annualised roll yield, my own arithmetic, both tenors, so the reader can check it:**
- Sep-26 → Dec-26: (6.7270 − 6.6260) ÷ 6.6260 = **+1.524%** over 92 days → ×(365/92) = **+6.05%/yr contango**.
- Sep-26 → Mar-27: (6.8285 − 6.6260) ÷ 6.6260 = **+3.056%** over 182 days → ×(365/182) = **+6.13%/yr contango**.
- **Roll yield to a rolled long ≈ −6.1%/yr.** Contango is a cost: the long sells the cheaper near contract and buys the dearer far one every roll.

**This number is contested and I am flagging it rather than smoothing it.** Two other unvintaged quote sources give December-2026 copper at **$6.017/lb** and **$6.18/lb**, which against a $6.63 front would be *steep backwardation* (roughly −9% over three months, ≈ −31%/yr, i.e. a large roll **gain** to a long) — the opposite sign. The TradingView chain is internally coherent (monotonic, consistent with the front-month level, consistent with a partially-priced January-2027 US tariff lifting deferred US-delivered prices) and the conflicting quotes are not; one of them also happens to equal a figure reported as an intraday *September* record, which smells like a scrape artefact. But "smells like" is not evidence. **Under §4 the conservative reading for a long wins: assume the carry cost, do not bank a roll gain that a second source contradicts.** The COMEX curve shape is formally **not assessable for conviction** (`copper-comex-price-history` unavailable, `copper-lme-cash-three-month-curve` unavailable).

### 3b. LME — the physical benchmark, and it is doing the opposite

The LME cash–3M spread is the profile's designated tightness read. As unvintaged context only:

| Date (as-of) | LME cash − 3M | Annualised roll yield to a long (my arithmetic) | Source |
|---|---:|---:|---|
| ~2026-08-11 | **+US$45/t** (backwardation) | ≈ +1.3%/yr | [Web: wire summary, accessed 2026-08-28 — unvintaged] |
| ~2026-08-24 (intraday peak) | **≈ +US$550/t** — "highest in more than five years" | ≈ +14.9%/yr | [Web: wire summary, dated 2026-08-25 — unvintaged] |
| 2026-08-24 (a reported print) | **+US$434/t** — "highest since October 2021" | ≈ +11.9%/yr | [Web: wire summary, dated 2026-08-25 — unvintaged] |
| after the 20kt delivery | **≈ +US$175/t** | ≈ +4.9%/yr | [Web: OilPrice/ING summary, dated ~2026-08-26 — unvintaged] |
| 2026-08-26 (latest found) | **+US$248/t** | **≈ +6.9%/yr** — (248 ÷ 14,499) × (365/91) | [Web: NaturalNews summarising wire copy, 2026-08-26 — unvintaged] |

**Shape: backwardation** — cash above 3-month, which is the classic near-term-tightness signal and **pays** a holder who rolls, the mirror image of the COMEX picture.

**What the split implies.** Same metal, two venues, opposite carry, and this is not a contradiction to be averaged: **LME backwardation prices scarcity of metal you can touch in London/Asia today; COMEX contango prices a term premium for US-delivered metal after a possible January-2027 tariff.** Location and delivery date are doing the work, exactly as the profile's family rule warns. The practical consequence for a portfolio is large and is stated in §5: the *venue* of the exposure changes the annual carry by roughly 13 percentage points on identical metal.

### 3c. Carry placed in its own history

- **Peak: roughly the 99th percentile of a five-year window.** $434/t was reported as the highest since October 2021 (≈ 4.9 years) and ~$550/t as the highest in more than five years [Web: wire summaries, 2026-08-25 — unvintaged]. Placement by *reported rank*, not by a distribution I hold.
- **Today (~$248/t): elevated but well off the extreme** — roughly 5.5× the $45/t level of about two weeks earlier, and about 45% of the peak.
- **Direction: violently flattening.** The spread lost roughly 55–68% of its value in two to three sessions.
- **A true z-score is not computable and I am not printing one.** `copper.lme-cash-three-month-curve` is `unavailable`, so I hold no spread history and no standard deviation. Anyone quoting a z-score for copper carry in this run is making it up.

### 3d. Cash-and-carry verdict: does storage pay?

Decomposition of the front–deferred spread into cost of carry versus implied convenience yield. **Financing is sourced; storage and insurance are my labelled estimates** — LME and CME warehouse rent schedules are published but I could not retrieve a citable dated rate in this environment, so the storage leg is an estimate and the verdicts below inherit that uncertainty.

- **Financing:** US 3-month Treasury bill **3.79%** on 2026-08-26 [Web: TradingEconomics US 3-month bill yield, as-of 2026-08-26 — unvintaged].
- **Storage + insurance (ESTIMATE, not sourced):** ~US$0.55/tonne/day rent ≈ US$201/t/yr ≈ **1.4%** of a $14,499/t cash price, plus ~0.15% insurance → **≈ 1.5%/yr**.
- **Full cost of carry ≈ 5.3%/yr** (3.79% + 1.5%), of which only the financing leg is sourced.

**LME — cash-and-carry does NOT pay, by a wide margin.** Buying cash metal at ~$14,499/t and selling the 3-month at $14,251/t locks in a **−$248/t** spread and then pays roughly **$191/t** of carry over the quarter (5.3%/yr × 0.25 × $14,499) — a loss of about **$439/t per quarter**, ≈ **−12.1%/yr**. Rearranged, the **implied convenience yield ≈ 12.2%/yr**: `y = r + u − (F/S − 1) = 3.79% + 1.5% + 6.86% ≈ 12.2%/yr`. The London market is paying roughly 12% a year for the privilege of having the metal *now* rather than in three months. That is the near-dated basis the profile asks for (LME cash–3M), and it is the single most informative number in this report.

**COMEX — cash-and-carry roughly pays, marginally.** Contango of **+6.05%/yr** against an estimated full carry of **≈5.3%/yr** leaves about **+0.75%/yr** to a storer, i.e. an implied convenience yield of roughly **zero to slightly negative**. That is internally consistent with COMEX warehouse stocks at a record ~675,185 tonnes after 46 consecutive daily increases [Web: wire summary, accessed 2026-08-28 — unvintaged]: metal sits in US sheds because the curve just about funds it *and* because it carries tariff optionality. Given the §3a quote conflict and the estimated storage leg, treat this as **directional, not decided**.

---

## 4. Physical Basis, Regional Premiums & Delivery Pressure

| Measure | Latest | Own-history placement | Direction | Source/date |
|---|---:|---:|---|---|
| **Aligned physical assessment − deliverable futures (true basis)** | **Not computable** | — | — | No lawful physical assessment aligned on grade, location, delivery date, currency and unit is reachable here. `copper-regional-arbitrage` is `unavailable`. Restricted benchmark data stays manual/unavailable; no licence has been worked around |
| LME cash − LME 3M (near-dated basis, same grade/venue) | **+US$248/t** (backwardation) | ~99th pct at the 2026-08-24 peak; still ~5.5× the level of two weeks earlier | Flattening hard | [Web: wire summary, 2026-08-26 — unvintaged] |
| **COMEX front − LME 3M (regional premium, PARTIALLY aligned)** | **≈ +US$547/t (+3.8%)** — my arithmetic: COMEX 6.7125/lb × 2,204.62 = $14,798/t, less LME 3M $14,251/t | Described as "levels not seen since last autumn" — i.e. roughly a 12-month high, by report, not by a distribution I hold | Widening into the tariff decision | COMEX close 2026-08-25 and LME 3M 2026-08-26 [Web: wire summaries — unvintaged] |
| **COMEX Dec-26 − LME 3M (better date alignment)** | ≈ +US$579/t (+4.1%) — 6.7270/lb × 2,204.62 = $14,830/t vs $14,251/t | — | — | Same sources; **still not date-matched** (see alignment note) |
| **Yangshan / China import premium (LME-basis, CIF Shanghai)** | EQ copper arriving late Aug **US$75/t**; Sept arrival **US$75–85/t**; registered B/L Aug arrival **US$110–120/t** | Below its own recent range — reported to have peaked last year and traded materially lower since | Weakening; SHFE/LME price ratio deteriorating | [Web: SMM Yangshan copper spot commentary, August 2026 — vendor assessment, unvintaged, unverified] |
| **Accessible physical inventory** | **Cross-reference, not my vote** | — | — | Owned by `commodity-demand-inventory` (`copper-visible-inventory`, `copper-inventory-accessibility-opacity`), both `unavailable`. I emit no inventory signal |

### Basis alignment — what is and is not matched

Stating this plainly because a number that does not align these terms **is not basis**:
- **Grade:** COMEX Grade 1 electrolytic cathode vs LME Copper Grade A — economically comparable but **different brand lists and different warehouse eligibility**. Not identical.
- **Location:** COMEX = US-warehouse-linked; LME = a global warehouse network. This is precisely the axis the tariff trade is exploiting, so the location gap *is* the signal, not noise to be netted out.
- **Delivery date:** COMEX front (Sep-26) against an LME **3-month** prompt is a **date mismatch of roughly two months**. The Dec-26 line above narrows it, but LME's rolling 3-month prompt and COMEX's fixed expiry calendar never align exactly.
- **Currency:** both USD — no FX adjustment needed on this leg. The SHFE leg (RMB/tonne, plus VAT and a separate bonded regime) is **not** additive and I have not converted it; the Yangshan premium above is already quoted on an LME basis in USD/t, which is why it is usable and the SHFE outright is not.
- **Unit:** all converted at 2,204.62 lb/tonne, shown inline every time.
- **Freight, duty and VAT:** **not deducted.** The $547/t figure is therefore a *gross* venue spread, not the net arbitrage the profile requires. Trans-Pacific/Atlantic freight and any duty would consume part of it. Calling it "the arb" would overstate it.

### Delivery pressure and accessible inventory

Reported as **delivery-pressure evidence only** — warrant mechanics, deliveries and load-outs. The inventory *level* is `commodity-demand-inventory`'s causal row and I am not emitting a second inventory vote.

- **Cancelled warrants / load-out intent:** roughly **half of remaining LME stock was already earmarked for withdrawal** at the height of the squeeze, with **51,400 tonnes** of fresh withdrawal orders on 2026-08-24 and **65,400 tonnes** earmarked over recent days [Web: wire summaries, 2026-08-25 to 2026-08-27 — unvintaged].
- **Deliveries in:** Trafigura and others delivered **more than 20,000 tonnes** into LME warehouses on 2026-08-25, the largest one-day on-warrant build since April; **on-warrant stock rose ~63kt over three days, a >50% increase** [Web: wire summaries — unvintaged].
- **Stock trajectory (context, owned elsewhere):** LME warehouse stock 204,975 t, down from 249,850 t in late July and 389,425 t in late May; the 42-session decline was reported as the longest since 2014. COMEX stock at a record ~675,185 t after 46 consecutive daily increases [Web: wire summaries — unvintaged].
- **No emergency exchange rule, lending-guidance intervention or EFP dislocation was reported** in the material I found. Absence of a report is not proof of absence.

**Delivery-pressure verdict: `stressed`, relieving — but formally `not assessable` for conviction.** The assessed read: the LME prompt was under genuine delivery stress through 2026-08-24 (a five-year-extreme backwardation, a longest-since-2014 stock drawdown, and half of remaining warrants cancelled is a squeeze on any reasonable definition), and that stress was substantially relieved within two sessions by ~20kt of deliveries and a >50% on-warrant rebuild. The formal status is `not assessable` because every input above is unvintaged secondary reporting and the warrant-status series that would evidence it is `unavailable`.

### Driver attribution (MODULE_RULES §4a)

Two claims in circulation deserve the arithmetic, and both fail the adjective their tellers attach to them.

```
Attribution: US tariff premium (COMEX front − LME 3M) change over 12m
  ≈ +$0.248/lb today ($547/t ÷ 2,204.62), against a premium described as being back at
  "levels not seen since last autumn" — i.e. a comparable ~4% premium ~12 months ago
  [Web: wire summary, 2026-08-27 — unvintaged; basis = COMEX-front-vs-LME-3M level, NOT date-matched]
  = a CHANGE of ≈ +$0.00/lb of the +$2.11/lb (+46.63%) 12-month move observed
  → ~0% explained, ~100% residual (unattributed).
```
The US tariff premium is a **level, not the 12-month driver**. If the premium is roughly where it was a year ago, it cannot account for a 47% rise; non-US copper went up on its own, for reasons this orb does not own and which the blocked macro, supply and balance rows cannot currently supply. Anyone writing "the tariff explains the rally" is asserting a cause their own numbers do not carry. The honest statement is that **the 12-month move is essentially unexplained by anything in this report**, and that caps conviction rather than decorating it.

```
Attribution: LME cash–3M backwardation collapse, ~$550/t → ~$248/t (−$302/t, −55%)
  × the outright LME 3M price change over the same sessions [Web: wire summaries, 2026-08-25/26 — unvintaged]
  = the outright price rose +0.4% to a record $14,251/t while the spread halved
  → 0% of the outright move is explained by the carry collapse; the two moved in opposite directions.
```
The tightness premium drained out of the *spread* without leaving the *price*. That matters for a rolled long: the part of the return that was being paid by carry disappeared while the flat price did not fall, which is the exact configuration in which a spot-price win and a total-return loss can coexist.

---

## 5. Value & Roll-Adjusted Return

### Real (deflated) price versus its own ~5-year range — a value line, not a forecast

Deflator: **US CPI, +3.4% year on year in July 2026** [Web: CNBC/BLS CPI report, 2026-08-12 — unvintaged], with prior-year rates taken at roughly 8% (2021→22) and ~2.9–3.2%/yr thereafter — **my estimate, labelled inference**; no vintaged CPI series is wired for this run.

| Reference point | Nominal | In August-2026 dollars (my arithmetic) |
|---|---:|---:|
| 5-year low, ~late July 2022 | ≈ US$3.30/lb | × ~1.133 → **≈ US$3.74/lb** |
| May-2021 peak | US$4.90/lb | × ~1.230 → **≈ US$6.03/lb** |
| May-2024 peak | US$5.11/lb | × ~1.071 → **≈ US$5.47/lb** |
| **Today (2026-08-28)** | **US$6.62/lb** | **US$6.62/lb** |

[Nominal history: Web: INN / TradingEconomics copper price history, accessed 2026-08-28 — unvintaged, unverified.]

**Value line: RICH versus its own real five-year history — at or very near the top, roughly the 100th percentile.** Today's price exceeds every prior five-year peak *after* adjusting for inflation: about 10% above the deflated 2021 peak, about 21% above the deflated 2024 peak, and roughly 77% above the deflated 2022 low. This is a statement about where the price sits in its own distribution. It is **not** a forecast, **not** a short signal, and **not** a fair-value estimate — the structural anchor that would carry fair value (the 90th-percentile mine cash-cost floor plus the new-mine incentive price, `copper-cost-incentive-range`) is `unavailable` and belongs to `commodity-cost-curve-fair-value`. A commodity can sit at a real high for years when the incentive price has moved up under it; nothing here tells us whether it has.

### Roll-adjusted expected-return contribution (~12-month horizon, horizons matched)

**No forward price view is produced here.** This orb describes the price and the curve; it does not forecast the price leg, and the macro/supply/balance orbs that would are blocked by `unavailable` required rows. So what follows is the **carry alone** — roll yield plus collateral — over a matched **annualised (~12-month)** horizon. I have deliberately **not** added the trailing +5.43% one-month or +46.63% twelve-month spot moves to an annual roll yield: those are realised history on a different basis, and adding them would be exactly the horizon-mixing the rule forbids.

| Rolled long, ~12 months | Price leg | Roll yield | Collateral (3M bill) | **Net carry** |
|---|---:|---:|---:|---:|
| **COMEX `HG` / US-listed rolled vehicle** | not forecast here | **−6.1%/yr** (contango, §3a) | +3.79%/yr | **≈ −2.3%/yr** |
| **LME-rolled long, at the 2026-08-26 spread** | not forecast here | **+6.9%/yr** (backwardation) | +3.79%/yr | **≈ +10.7%/yr** |
| LME-rolled, at the ~$175/t level | not forecast here | +4.9%/yr | +3.79%/yr | ≈ +8.7%/yr |
| LME-rolled, back at the ~$45/t level of ~2026-08-11 | not forecast here | +1.3%/yr | +3.79%/yr | ≈ +5.1%/yr |

Fund fees, tracking error and FX are excluded and are not mine to quantify — the instruments orb runs in this same layer, its output is not guaranteed present on a fresh run, and **the market-structure synthesis owns the reconciliation of these figures against the instruments roll-drag.** I am not reaching into it.

**Does carry pay a long or bleed it? It depends entirely on the venue, and that is the finding.**
- On **COMEX**, carry **bleeds**: roughly **−2.3%/yr** net of collateral, before any fund fee. A rolled long needs the spot price to rise about 2.3% a year just to break even, and more than that after fees. This is the mechanism by which a correct bullish call on copper gets booked as a loss.
- On the **LME**, carry **pays**: up to about **+10.7%/yr** at the 2026-08-26 spread. But that spread is a **five-year extreme that already gave back roughly half its value in two sessions**, so the forward-looking figure is closer to the +5% to +9% band than to +10.7%, and it is mean-reverting by construction.
- **The gap between the two is ~13 percentage points a year on identical metal.** For a portfolio, the choice of venue is currently a larger decision than the direction of the price.

**Conservative posture, and it is the one I recommend carrying forward.** The COMEX roll figure rests on a quote chain a second source contradicts by sign; the LME roll figure rests on a spread at a five-year extreme that is collapsing in real time. Neither is vintaged. So the roll-adjusted return should be treated as **not assessable for conviction**, with the numbers above as visible, non-conviction context — and the asymmetry noted: the *conservative* case for a long is the COMEX bleed, not the LME pay.

---

## Self-check

- Spot/front price carries a date and source — **yes**, and is explicitly labelled unvintaged and marked as *not* satisfying `copper-current-price` (`PULSE-MISSING`).
- Curve shape classified with a quantified roll yield, carry placed vs its own history — **yes** (COMEX contango −6.1%/yr; LME backwardation +6.9%/yr; peak ≈99th pct of 5 years, flattening), with the sign conflict on COMEX disclosed rather than smoothed, and no fabricated z-score.
- Cash-and-carry / convenience-yield verdict explicit — **yes**: LME storage does **not** pay (≈ −12.1%/yr; implied convenience yield ≈ 12.2%/yr); COMEX storage marginally **does** (≈ +0.75%/yr). Financing sourced; storage/insurance labelled estimates.
- Physical basis aligns grade/location/date/unit; regional premiums and delivery pressure placed vs history — **yes**, with the true aligned basis stated as **not computable** and freight/duty explicitly not deducted from the venue spread.
- Accessible inventory referenced, not duplicated — **yes**; cross-referenced to `commodity-demand-inventory`, no inventory signal emitted.
- Real (deflated) value line and a named roll-adjusted return stated — **yes**; reconciliation against the instruments orb left to the market-structure synthesis.
- Technical levels labelled as chart context — **yes**; no moving average invented where none was sourceable.



---

## market-structure / 03_commodity-volatility-distribution.md

_Source: `03_commodity-volatility-distribution.md`_

# Volatility Distribution & Scenario Span — COPPER

**Run date:** 2026-08-28 · **Run root:** `commodity/runs/COPPER/` · **Owner orb:** `commodity-volatility-distribution` · **Governing rule:** `.claude/agents/commodity/MODULE_RULES.md` §10 (independent distribution before action), §8/§8A (evidence contract and coverage gate) · **Profile:** `frameworks/commodity/COMMODITY_PROFILES.md` §`## COPPER` (lines 318–389).

**Headline verdict: the empirical return distribution for COPPER is `not_assessable` at every one of the ten forecast-grid horizons.** Not "thin", not "low confidence" — absent. There is no lawful point-in-time price history for COMEX copper reachable from this engine, so there is no return series from which a percentile, a realised volatility, a skew, a drawdown or an event-gap distribution could be computed. Under §10 that makes the distribution `not_assessable` and the downstream action `Research More`, unless an independently proven critical risk forces `Avoid`.

This is a valid, expected result in this run, and it is stated here so that the scenario-engine orb cannot quietly adopt a narrower, friendlier envelope in its place. **A missing distribution is not permission to invent one.**

---

## 0. Return instrument, roll treatment and window — declared before any number

Per the self-check, the instrument must be explicit even when the data is absent, so that a later run with real vintages reproduces exactly the same construction.

| Item | What this orb would have used | Status now |
|---|---|---|
| Intended return instrument | **COMEX Copper `HG` front-month futures, continuous back-adjusted (`@HG.1`)**, quoted **US¢/lb** — the profile's declared shared market history for `copper.comex-price-history`, and the same investable benchmark the `commodity-price-curve` orb is bound to | **Unavailable** |
| Profile benchmark (different instrument) | **LME Copper Grade A, USD/tonne** — the global physical benchmark named by the profile. A different contract, different warehouse regime, different currency unit | **Unavailable** (`copper.lme-cash-three-month-curve`, `copper.regional-arbitrage` both unavailable) |
| Roll treatment | Continuous back-adjusted futures; roll return kept visible and never merged into spot return (§4: "an ETF/ETC has fees and roll drag — CANE is not raw sugar") | Cannot be applied — no series |
| Vehicle returns (`CPER`) | Would be reported separately as vehicle total return, never spliced into the futures series | Unavailable; no lawful `CPER` history wired |
| Splice policy | **No splicing.** COMEX `HG` and LME Grade A are not one series. The profile explicitly requires the LME–COMEX arb to be *measured*, and unvintaged context below suggests that arb is at or near a historical extreme — which is exactly the condition under which splicing the two would manufacture false returns | Enforced by refusal |
| Sample window | Would be the longest lawful point-in-time history available, stated with its as-of and source identity | **None — window length is zero observations** |
| Trading-day convention | Would be stated (COMEX calendar; calendar-day grid horizons mapped onto exchange sessions) | Not applicable — no sessions to map |

### Why the history is absent — verified in this run, not inherited

Three independent checks, all run at decision time:

1. **Pulse quote transport is dead.** `bash scripts/refresh-swarm-pulse.sh commodity COPPER` fails with `Error: listen EPERM: operation not permitted /tmp/claude-501/tsx-501/41552.pipe` — the pinned `tsx` runner cannot open its IPC pipe under this sandbox. This reproduces the `PULSE-MISSING` finding recorded by the triage orb [`00_commodity-triage.md`, 2026-08-28]. Verified independently by me, 2026-08-28.
2. **Even a healthy pulse would not have solved this.** `frameworks/commodity/pulse_sources.json` states its own scope in its header note: it "supplies SYMBOLS, quote units, and COT market-name substrings ONLY", against a CNBC `restQuote` endpoint. That is a **current quote** transport. One quote is not a return history. So the pulse outage is not the binding constraint here — it is the smaller of two problems.
3. **No price-history route exists anywhere in the engine.** The connector registry `.claude/connectors/` holds 27 connectors; **none of them is a price-history connector for any commodity** (the metals/ags entries are CFTC COT positioning, inventory, production, holdings and macro connectors). The strings `price-history` / `price_history` appear in exactly two files in the whole repository — this agent's own prompt and `02_commodity-price-curve.md` — i.e. only in prompts asking for the series, never in anything that supplies it. `data/COPPER/` does not exist, and no `@HG` history file exists anywhere in the tree.

**Conclusion: `copper.comex-price-history` is structurally absent, not merely stale or temporarily unreachable.** Restoring the pulse would return a single price, and would still leave this orb with zero return observations.

---

## 1. Unconditional distribution

Every cell below is `n/a` for the same single reason: **N = 0 non-overlapping outcomes, because the underlying return series does not exist.** The §10 floor is 30 non-overlapping outcomes per horizon; the actual count is zero at all ten grid points.

| Horizon | N non-overlap | P5 | P10 | Median | P90 | P95 | Realised vol | Skew | Max drawdown |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1-day diagnostic | 0 | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a |
| 1-week diagnostic | 0 | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a |
| 30 days | 0 | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a |
| 45 days | 0 | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a |
| 60 days | 0 | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a |
| 75 days | 0 | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a |
| 92 days | 0 | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a |
| 182 days | 0 | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a |
| 273 days | 0 | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a |
| 365 days | 0 | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a |
| 456 days | 0 | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a |
| 548 days | 0 | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a |

**P25/P75 and time-to-recovery** are likewise `n/a` at every horizon and are omitted from the table only to keep it readable — they fail for the identical reason.

Two things I explicitly did **not** do, because both are forbidden and both would have produced a plausible-looking table:

- I did not reconstruct returns from remembered or approximate COMEX price levels. Prices recalled from training rather than read from a dated source are not a point-in-time series; percentiles computed off them would carry no as-of, no source identity and no vintage, and would be indistinguishable in the output from real ones. That is the `bad extraction` / `bad math` failure pair in root §20.
- I did not substitute overlapping daily windows to manufacture an N above 30. Overlapping windows share the same underlying days, so they are not independent outcomes; §10's threshold counts **non-overlapping** outcomes, and workflow step 7 bans the substitution by name.

---

## 2. Regime-conditioned distribution

The profile's copper-relevant regime states, and whether each could be labelled **point-in-time** (i.e. using only what was knowable at each historical date, never a later revision):

| Regime known at the time | Horizon | N | P10 | Median | P90 | Drawdown | Assessment |
|---|---|---:|---:|---:|---:|---:|---|
| LME cash–3M curve state (backwardation vs contango) | all 10 grid points | 0 | n/a | n/a | n/a | n/a | **not assessable** — `copper.lme-cash-three-month-curve` unavailable; no exact prompt-date history, so no regime label exists at any date, and no return series to condition |
| Visible-inventory state (LME/COMEX/SHFE on-warrant vs cancelled) | all 10 | 0 | n/a | n/a | n/a | n/a | **not assessable** — `copper.visible-inventory` unavailable; §9 also forbids inferring off-warrant/bonded material as zero, so even a partial stock series could not label the regime |
| Broad-USD direction | all 10 | 0 | n/a | n/a | n/a | n/a | **not assessable** — `macro.broad-usd-index` has a declared connector (`federal-reserve-broad-usd`) but **no eligible immutable vintage at decision time**; a declaration is not data (§8A) |
| China industrial-activity state | all 10 | 0 | n/a | n/a | n/a | n/a | **not assessable** — `macro.china-industrial-activity` unavailable, no connector claims it. This is copper's dominant demand lens, so it is the most damaging regime gap |
| US 10y real-yield state | all 10 | 0 | n/a | n/a | n/a | n/a | **not assessable** — `macro.us-10y-real-yield` unavailable; `treasury-real-yields-gold` exists but is bound to the Gold profile, not to this shared semantic ID. Reusing it here would be a silent substitution (§8A) |
| US trade-policy / tariff state | all 10 | 0 | n/a | n/a | n/a | n/a | **not assessable** — `copper.supply-restrictions-routing` unavailable. Policy dates are also the single hardest regime to label point-in-time, because the market's *expectation* of a ruling, not the ruling itself, is the state variable |
| Refined-balance state (surplus vs deficit) | all 10 | 0 | n/a | n/a | n/a | n/a | **not assessable** — `copper.refined-balance` unavailable; and ICSG balances are **revised**, so a full-sample balance label applied to an earlier date would be exactly the look-ahead §10/workflow-step-3 bans |

**Regime count achieved: 0 of the minimum 3 comparable regimes.** Two separate failures stack here and it matters that they are separate: (a) there is no return series to split, and (b) there are no vintaged regime labels to split it by. Fixing only one of the two would still leave this section `not assessable`.

The last row is worth stating plainly for the downstream orbs: copper's own balance history is a revised series. Even in a future run with a full ICSG feed, the balance regime must be labelled from the vintage that was published **at** each historical date, not from today's restated numbers — otherwise the conditional distribution learns the answer before the question.

---

## 3. Event-gap ledger

No ledger can be built. Every event class below has **N = 0 measured gaps**, because measuring a gap requires the close-to-open or close-to-close price series that section 0 established does not exist. The classes are listed anyway, from the profile's own recurring-report list, so the gap is specific rather than a blanket shrug — and so a later run knows exactly which distributions to build separately.

| Event class | N | Worst down | Worst up | P10/P90 | Source/date range |
|---|---:|---:|---:|---:|---|
| ICSG monthly balance + biannual forecast | 0 | n/a | n/a | n/a | none — `copper.refined-balance` unavailable; no price series to measure a response against |
| LME / COMEX / SHFE weekly warehouse stocks | 0 | n/a | n/a | n/a | none — `copper.visible-inventory` unavailable |
| China monthly activity + PMI | 0 | n/a | n/a | n/a | none — `macro.china-industrial-activity` unavailable |
| CFTC COT (COMEX copper positioning) | 0 | n/a | n/a | n/a | none — connector `cftc-cot-copper` declared, source publishing, but no eligible immutable vintage at decision time |
| Major-miner quarterly production | 0 | n/a | n/a | n/a | none — `copper.mine-prepolicy-supply` unavailable |
| Mine disruption / strike / grade / water-permit shocks (unscheduled) | 0 | n/a | n/a | n/a | none — `copper.supply-restrictions-routing` unavailable |
| **US trade-policy / tariff decisions (unscheduled)** | 0 | n/a | n/a | n/a | none vintaged — see the unvintaged note below, which is **not** a measurement |
| Exchange disruption / delivery-eligibility events | 0 | n/a | n/a | n/a | none |

These classes are listed as **eight separate rows on purpose.** Workflow step 4 forbids pooling unlike events into one false distribution, and copper is a commodity where that error would be severe: a weekly warehouse-stock print and a tariff ruling do not belong in the same response distribution, and pooling them would understate the tariff tail while overstating routine-release volatility.

### 3a. Unvintaged event context — labelled, and explicitly NOT a tail bound

Per §8A an unvintaged live-web fact may explain context but cannot raise sufficiency or conviction. Recorded here only so the scenario engine does not mistake "no measured tail" for "no tail":

- Secondary reporting describes a single-session COMEX copper collapse on **2025-07-30/31**, when a US tariff decision excluded refined copper cathode against wide expectations that it would be included. The reported magnitude **disagrees across sources: "19% — the biggest intraday fall on record" [Web: ING Think, 2025-07-31 — unverified, secondary], "plummeted 20% in a single day" [Web: SunSirs commodity news, 2025-08 — unverified, secondary], and "plunged 22%" [Web: secondary trade commentary, accessed 2026-08-28 — unverified, secondary].**
- More recent secondary reporting describes an active, still-undecided US Commerce ruling on refined copper, with the COMEX–LME differential at or near a historical high and a bank estimate that the premium implies roughly a 14.6% chance of a 15% tariff in January 2027 and a 37% chance of a 30% duty in January 2028 [Web: CNBC, 2026-08-14 and Bloomberg, 2026-08-05 — unverified, secondary; the probabilities are one bank's model output, not a market print].

**Three limits on how the above may be used, and they are binding:**

1. **It is not a tail bound and must not be entered into section 4.** A tail bound under §10 is a matching-regime 5th/95th percentile or a *measured* event gap from a lawful point-in-time series. A magnitude recalled by news aggregators that cannot agree with itself within three percentage points is neither. The dispersion is the tell: if I cannot establish whether the worst observed down-gap was 19% or 22%, I certainly cannot establish the 10th and 90th percentiles of the class.
2. **N = 1 anyway.** Even taken at face value, a single event is not a distribution. There is no basis to say whether that session was a 1-in-5-year or a 1-in-30-year draw.
3. **It carries no direction.** The 2025 gap was down because the ruling came in softer than positioning expected. A ruling that lands harder than positioning expects gaps the other way. This orb does not vote on which; it records only that the class is two-sided and large.

What this context legitimately establishes — and the reason it is worth writing down at all — is a **qualitative** statement: copper currently carries a live, unscheduled, binary policy-event class whose realised single-session magnitude is reported in the high teens to low twenties of percent. Any scenario set built for copper that spans only ordinary volatility would fail root §10's span check on its face. The engine cannot say by how much it would fail, because it cannot measure the bound.

---

## 4. Mandatory scenario-span envelope

| Horizon | Empirical bear bound | Empirical bull bound | Tail/event lower | Tail/event upper | Status |
|---|---:|---:|---:|---:|---|
| Tactical — 30 days | n/a | n/a | n/a | n/a | **not assessable** |
| Tactical — 45 days | n/a | n/a | n/a | n/a | **not assessable** |
| **Tactical — 60 days (§11 default)** | n/a | n/a | n/a | n/a | **not assessable** |
| Tactical — 75 days | n/a | n/a | n/a | n/a | **not assessable** |
| Tactical — 92 days | n/a | n/a | n/a | n/a | **not assessable** |
| Strategic — 182 days | n/a | n/a | n/a | n/a | **not assessable** |
| Strategic — 273 days | n/a | n/a | n/a | n/a | **not assessable** |
| **Strategic — 365 days (§11 default)** | n/a | n/a | n/a | n/a | **not assessable** |
| Strategic — 456 days | n/a | n/a | n/a | n/a | **not assessable** |
| Strategic — 548 days | n/a | n/a | n/a | n/a | **not assessable** |

Exact reason, identical for all ten rows: **no lawful point-in-time price history for the declared instrument; N = 0 non-overlapping outcomes against a §10 floor of 30; 0 comparable regimes against a floor of 3.**

- **Exact catalyst-horizon mapping: tactical 60 days and strategic 365 days** — the §11 defaults, used because no orb in this run has produced a cited catalyst-driven horizon (the catalyst-bearing series — ICSG release dates, COT, China activity, the Commerce ruling — are all unavailable or unvintaged). **Both defaults are exact grid points**, so no bracketing is invoked; bracketing between adjacent grid points is **not applicable**, not skipped. **Same-band check: pass** — 60 days sits inside the tactical 30–92 band and 365 days inside the strategic 182–548 band. **No cross-gap interpolation performed:** the 92-to-182-day gap was never crossed, and could not have been, since both endpoints are empty.
- The mapping is therefore well-formed and the arithmetic of the mapping is sound. It maps onto empty grid points. **A correct pointer into an empty table is still an empty answer** — this is stated so no downstream reader mistakes "mapping: pass" for "span: available".
- **No driver-attribution claim is made anywhere in this report,** so §4a's attribution line is not applicable. This orb explains no move, because it measures no move.

### 4a. Instruction to the scenario-engine orb

Under §10 the scenario engine constructs bear/base/bull independently and the terminal synthesis may make a disclosed conservative downgrade but may not substitute a narrower or more favourable distribution. With this envelope empty, that rule resolves as follows:

- **There is no empirical bound for a scenario set to clear.** A scenario set published for COPPER in this run cannot pass the span audit, because the audit's reference bounds do not exist. Per §10 a failed span audit makes the distribution `not_assessable` and the action `Research More`.
- **The absence of a bound is not a licence to pick one.** A scenario set that cites no bound and simply asserts, say, ±15% at 60 days would be a fabricated envelope wearing the authority of this orb. If the scenario engine produces numeric cases, it must state that they rest on judgment with zero empirical support from this orb, and it may not cite this file as their basis.
- **The killer-risk case cannot be sized here.** §10 requires the killer-risk case to cover the relevant tail/event gap. The relevant class is identified (US refined-copper tariff ruling, section 3a) but its gap is unmeasured. So the killer-risk case is `not assessable` in magnitude while being **identified** in kind — those are different statements and the synthesis must carry both.

---

## 5. Gaps and non-assessable slices

**Every slice this orb owns is non-assessable.** Listed with its exact blocking reason and its owning need ID, so each is separately repairable:

| Slice | Status | Blocking need ID(s) | Exact reason |
|---|---|---|---|
| Unconditional distribution (all 10 grid points + 1d/1w) | `not_assessable` | `copper-comex-price-history` | No lawful point-in-time close history; N = 0 vs a floor of 30 non-overlapping outcomes |
| Realised volatility, skew | `not_assessable` | `copper-comex-price-history` | Same — no return series |
| Drawdown and time-to-recovery | `not_assessable` | `copper-comex-price-history` | Same — a peak-to-trough path requires the path |
| Regime-conditioned distribution | `not_assessable` | `copper-lme-cash-three-month-curve`, `copper-visible-inventory`, `macro-broad-usd-index`, `macro-china-industrial-activity`, `macro-us-10y-real-yield`, `copper-refined-balance` | Two independent failures: no series to split, and no point-in-time regime labels to split it by. 0 of 3 required regimes |
| Event-gap ledger (8 classes) | `not_assessable` | all of the above plus `copper-supply-restrictions-routing`, `copper-mine-prepolicy-supply`, `copper-managed-money-positioning` | No price series against which to measure a response; no vintaged event calendar |
| Scenario-span envelope (bear / bull / tail bounds) | `not_assessable` | derived from the above | Bounds are defined as matching-regime percentiles, which do not exist |
| Current-price anchor | `PULSE-MISSING` | `copper-current-price` | `refresh-swarm-pulse.sh` fails EPERM on the tsx IPC pipe — reproduced by me at decision time, 2026-08-28 |

**A note on which repair actually unblocks this orb.** The triage orb named the pulse quote transport as the single highest-value next data request, and for the price-curve and cost-floor comparisons that is right. **For this orb it is not sufficient.** The pulse returns one current quote; this orb needs a multi-year point-in-time close series, and the connector registry contains no price-history connector at all. So the specific unblocking request from this orb is: **a lawful point-in-time daily close history for COMEX Copper `HG` front-month, continuous back-adjusted, with source identity and an accepted immutable vintage, of at least 3 years for the tactical grid and at least 10 years for the strategic grid and for a credible three-regime split.** Without it, this orb returns `not_assessable` in any future run no matter how many other rows are repaired.

**On the sidecar.** Two rows are emitted to `03_commodity-volatility-distribution.signals.json`, both `neutral` in direction, both non-conviction, both carrying explicit `unvintaged:` provenance tokens with empty `source_vintage_refs`: one `volatility-regime` `context` row recording that the distribution is not assessable, and one `tail-risk` `risk` row recording that an identified but unmeasured policy-event tail class exists. Per this orb's role, neither can create a directional vote — volatility evidence is `risk` or `context`, never a second bullish or bearish opinion. **No `statistical` row is emitted,** because no statistic was computed; and it is worth noting that the committed registry `frameworks/commodity/validated_signals.json` currently holds `"results": []`, so any statistical row from any orb in this engine would in any case be `contextual`, never validated.

**On what a reader should take from this report.** The honest finding is narrow and worth keeping narrow: this engine cannot presently say what range of outcomes copper produces, and therefore cannot police the width of anyone's scenario set. It can say that copper carries at least one live binary policy-event class whose single-session magnitude secondary sources put in the high teens to low twenties of percent — which is a reason for the downstream orbs to treat any narrow scenario set with suspicion, and is not a reason to hold any view about direction.
