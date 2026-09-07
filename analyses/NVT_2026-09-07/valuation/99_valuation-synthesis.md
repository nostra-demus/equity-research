# Valuation Module — NVT (Synthesis)

## Abstract

nVent trades above any fair value this module can defend. The base case of USD 128.24 a share sits 17.8% below the fresher USD 156.03 quote and 25.1% below the stale USD 171.16 pool anchor, so the conservative reading is taken. The bull, base and bear levels of 198.88 / 128.24 / 77.23 are driven by peer multiples that are not in the data pool and whose median sits inside a sector that has re-rated roughly 43%. Today's price needs free cash flow to compound at about 20.4% a year for nine and a half years against the 8.6% the consensus-fed model delivers. There is no cushion: margin of safety is minus 21.7%, and the bear level is 50.5% lower.

---

## 1. Valuation Verdict

- **Verdict:** **Materially overvalued**
- **Base-case fair value (point, per share):** **USD 128.24** *(from `07` §2D — 22.23x NTM EPS of $5.77)*
- **Current price:** **USD 171.16**, last close **2026-08-12**, price-state **`pool-verified`** but **stale by 26 calendar days ≈ 17–19 trading days**. Corroborated indicative refresh **USD 156.03**, close **2026-09-04**, web-sourced and unverified — a **−8.84%** drift. **Every price-relative read below is shown at both prices and leads with the fresher one** (`01` §7; MODULE_RULES → Price freshness).
- **Bull / Base / Bear fair-value levels (points):** **bull USD 198.88** · **base USD 128.24** · **bear_cyclical USD 77.23** (the headline bear, 12-month horizon) · **bear_structural USD 69.92** (the §24 avoid-ruin floor, 24–36 month horizon — a separate case, not a second name for the bear)
- **Cross-method dispersion (football field, low–high):** **USD 76.30 – USD 152.16** across the valid value-producing methods (`04` DCF, `03` peers, `06` SOTP) — a spread of **99.4% of the low value**. Widest single-method sub-ranges: `04` grids $62.70–$95.26; `03` $116.15–$144.17; `06` $127.83–$176.49.
- **Valuation attractiveness /100** *(higher = cheaper)*: **22**
- **Margin of safety /100** *(higher = better)*: **12** — the raw metric is **−21.7%** at $156.03 and **−33.5%** at $171.16 *(inline staleness flag: the anchor's as-of date is 2026-08-12)*. Negative means the price sits above base fair value, so there is no cushion at all.
- **Valuation confidence /100:** **45** *(hard cap 55 applies and is not exceeded — see §4)*
- **Downside risk /100** *(**inverted — higher = WORSE**)*: **78** — downside to `bear_cyclical` is **+50.5%** at $156.03 and **+54.9%** at $171.16; to the `bear_structural` floor, **+55.2%** / **+59.2%**.
- **Data quality /100:** **58** *(from `00` — verdict **Partial**)*
- **Overall usefulness /100:** **68** *(hard cap 70 applies — no peer multiples in the pool)*
- **Dominant valuation method:** **`04_intrinsic-dcf`** is the method I trust most for this company, because it is the only read built on filing-grade cash flows (LTM CFO from continuing operations $772.8m − capex $112.9m + after-tax interest $58.4m) and discounted at 10.22%, which is +0.22pp **above** the 10.0% weighted-average cost of capital nVent itself discloses and applies to every reporting unit [`FY24 10-K, MD&A — Critical Accounting Estimates, p.32`]. It is corroborated to within 1.5% by a completely independent input set — the 11.5x forward EBITDA that management itself just agreed to pay for Maverick Power ($77.41 applied to nVent). **`03_relative-valuation-peers` carries the weight (67%) because the multiples-first hard rule requires it, not because it is the better lens** — those are two different statements and the gap between them is the whole reconciliation.
- **What's priced in:** at **$156.03** the market requires free cash flow to compound at **+20.4% a year for nine and a half years** ($718m → $3.8bn) and revenue to reach **$25.7–28.7bn** (5–6x today's $4.8bn); at **$171.16**, **+21.8%** and $28.5–31.9bn. Reconciling today's price to `04`'s own cash flows instead needs a **6.21% discount rate** — 3.79pp below the company's own disclosed rate. `04`'s consensus-fed forecast delivers **8.6%**. Verdict from `05`: **aggressive — not achievable on duration**.
- **Biggest valuation risk:** the base point rests two-thirds on a peer set that **does not exist in the data pool** (every peer multiple web-sourced on one date from one provider) and whose median is itself **cycle-elevated** — so if the industrials multiple normalises, the peer median and the base fair value fall together, without nVent having to disappoint on its own numbers.

---

## 1A. Module Disconfirmation *(CLAUDE.md §8)*

- **Strongest bear point:** the two reads built on genuinely independent input sets converge and sit **45% below the base point** — `04`'s DCF at **$76.30** on filed cash flows and the company's own disclosed 10.0% cost of capital, and the **$77.41** implied by the 11.5x forward EBITDA management itself just paid for Maverick Power [`nVent news release, 2026-08-24`]. The three multiples reads that sit at $141–$152 all draw on one web-sourced peer set inside one re-rated sector.
- **Strongest bull point (the steelman, and it is real):** nVent's three-year consensus revenue growth of **23.05%** is roughly **twice** the peer median of 11.48%, at essentially the **same EBITDA margin** (21.71% vs 21.95%) and **less than half** the leverage (1.51x vs 3.07x) [`03` §2]. Mix-weighted segment-profit growth was **+62.9% in H1 FY26** and group free cash flow compounded at **33.6%** FY2022–FY2025 — so the *rate* the price demands has actually been cleared; only the *duration* has never been tested [`05` §3.1]. On top of that, the bull level of $198.88 uses a 30.0x multiple that is roughly where the stock traded on the anchor date (29.66x), not a new high, and Maverick Power was struck at **11.5x against nVent's own ~21.4x** — accretive on the company's own disclosure and inside no published level.
- **Single killer risk (method validity):** the base point is a **weighted blend of methods that disagree by 99.4%**. A DCF at $76.30 and a SOTP at $152.16 are not two estimates of one number — they are two different claims about what this company is. Any base point between them is arithmetic, not a measurement, and `07` says so in terms.
- **Disconfirming evidence already visible:** `02`'s own-history read **contradicts the premium finding on one row** — P/LTM EPS at 47.52x is 11.9% *below* its own median — though that denominator carries the discontinued-operations distortion, and four other rows point the other way [`02` §3]. `03`'s provider computes nVent's ROIC at **11.93%, above** the peer median, while Capital IQ computes **9.54%** and `08_competitive-map` concludes nVent earns less than every named peer [`03` §2]. `06`'s high case at **$176.49** sits above both prices. And `02` §4 names a genuine bullish structural-change argument: infrastructure went from 45% of FY2025 sales to **58.1% of H1 FY26**, leverage halved from 3.00x to 1.15x, and the old mean may simply be the wrong target.

---

## 2. Specialist Roll-Up

| Specialist | Verdict Line | Biggest Finding |
|---|---|---|
| `00_valuation-data-triage` | **Partial.** Four-plus methods can run; caps declared: overall usefulness max 70 (no peer multiples), valuation confidence max 60 (price ~18–19 trading days stale) | The **Maverick Power acquisition (2026-08-24, $1.75bn + up to $550m earnout) post-dates every vendor export** (estimates to 2026-08-07, price/multiples to 2026-08-12) and the Jun-30-2026 balance sheet — consensus, the EV bridge and the price anchor are all **pre-deal**. The FY2025 10-K is also absent from the pool |
| `01_price-and-capital-structure` | Anchor **USD 171.16** (`pool-verified`, close 2026-08-12, stale); indicative refresh **USD 156.03** (2026-09-04, −8.84%); market cap 27,703.6; **EV 28,940.0**; **net debt 1,236.4 strict §15**; 164.2m fully diluted | The canonical debt is the **filing debt-note basis $1,492.4m**, adopted from `balance-sheet-survival/01` — the Capital IQ aggregate of 1,632.9 differs by **exactly $140.5m of operating leases**, reconciled, so all three modules stand on one number. Tangible book is **negative $482.7m**, so no tangible-book floor method exists |
| `02_multiples-own-history` | **Premium of 13–21% to its own six-quarter mean/median on EV/EBITDA; no base point published** — §4 is marked illustrative-only | The own-history window is **~1.5 years (six quarterly closes)**, not the 3–5 years the method needs, and it sits **entirely inside a sector-wide re-rating** (S&P 500 Industrials forward P/E ~16.0x late-2022 → ~25.5x, about +59%). **`RF-VAL-001` fired — cycle-elevated.** Both halves of every EV/EBITDA figure sit at a high: a peak multiple on a peak denominator |
| `03_relative-valuation-peers` | **Premium on every measurable multiple** (+22.6% forward P/E at $156.03; +34.5% at $171.16). Warranted forward P/E **24.5x → USD 141.37** | The premium is **partly** deserved — twice the peer growth at the same margin and half the leverage — but the growth earns a through-cycle return on capital of **8.10% against a ~10.0% cost of capital**. **`RF-VAL-001` fired.** The genuinely independent read: the **Maverick transaction at 11.5x forward EBITDA implies $77.41**, i.e. the public market pays ~1.7–1.9x the private market for the same growth |
| `04_intrinsic-dcf` | **USD 76.30 per share** — 55.4% below $171.16, 51.1% below $156.03. Grids $62.70–$95.26; structural-runoff terminal $69.92 | The WACC of **10.22%** is reality-tested and sits **+0.22pp above nVent's own disclosed 10.0% group rate**, so no `RF-VAL-003` escalation. Terminal value is only **45.6% of EV** — no terminal-dominance cap. The terminal was **rebuilt** to charge the full financeable reinvestment (29.4% of NOPAT), costing ~$14.4/share rather than flagging a 2.24pp Gate-2 gap and carrying on. Even a 15x exit multiple on FY2035 EBITDA reaches only **$120.88** |
| `05_reverse-dcf` | **Aggressive.** Price implies **+21.80% FCFF CAGR for 9.5 years** at $171.16, **+20.39%** at $156.03; implied discount rate **6.21% / 6.53%** | **The margin door is shut outright** — justifying the price on profitability needs a steady-state EBITDA margin near **64%** against an own best-ever of 22.4% and peer-normal operating margin of 20.7%. So it can only be volume: nVent must reach **~0.95x Eaton's entire current group revenue** within nine years, against a rival whose Electrical Americas backlog alone ($15.3bn) is six times nVent's whole order book ($2.5bn). The binding constraint is **duration, not rate** |
| `06_sum-of-the-parts` | **USD 152.16 per share** (range $127.83–$176.49) — 11.1% below $171.16, 2.5% below $156.03. **Self-declared low-confidence** | The consolidated multiple is **not hiding** a data-centre business inside a dull industrial — the opposite: at $171.16 the price already requires **30.0x** for Systems Protection, within 8% of pure-play Vertiv's 32.6x. Systems Protection carries **77.8%** of gross EV. Sector Cycle Reality Test: **"Not assessable — no sector-level multiple history"** for these comparables |
| `07_scenario-and-fair-value` | **Base USD 128.24**; bull **198.88** / `bear_cyclical` **77.23** / `bear_structural` **69.92**. MoS **−21.7%** at $156.03, **−33.5%** at $171.16. **Valuation confidence capped 55** | The full method field is **$76.30–$152.16, a 99.4% spread — and that disagreement is the finding, not a nuisance to average away**. `02` and `03` fired `RF-VAL-001` in the **same direction**, so their agreement is **one sector cycle counted twice**, while the two independent reads ($76.30, $77.41) converge to within 1.5% **45% below the base point** |

All eight upstream outputs were present and complete. **No failed orbs to declare.**

---

## 3. Reconciliation

**Lead with the disagreement, because it is 99.4% wide.** The valid value-producing methods run from **`04`'s DCF at $76.30** to **`06`'s SOTP at $152.16**, with **`03`'s peers at $141.37** in between. That is a spread of 99.4% of the low value — two and a half times the 40% tolerance in Reconciliation Gate 6. **Valuation confidence is therefore capped at 55, and the explanation below does not waive that cap.**

| Disagreement | Value each produced | Reconciled view |
|---|---|---|
| DCF vs SOTP | $76.30 vs $152.16 | They are not two estimates of one number. `04` refuses to capitalise any return above the cost of capital into perpetuity, for a company whose own filings disclose a 10.0% WACC and whose through-cycle return on capital is 8.10%. `06` applies today's data-centre comparable multiples (Vertiv 32.6x, Hubbell 18.6x) to FY2026E segment profit. **The whole gap is the terminal, not the next three years:** `04` takes consensus revenue and margin unchanged to FY2030 — a near-doubling — and still lands at $76.30 |
| DCF vs peers | $76.30 vs $141.37 | Same root cause. `03`'s own quality-adjustment ledger already halves its evidenced growth premium (+5 turns → +2.44 turns) precisely because the growth does not earn its cost of capital. `04` charges that fact in full through the terminal; `03` charges half of it once, in a multiple |
| SOTP vs peers | $152.16 vs $141.37 | **This apparent agreement is not corroboration.** Both draw their comparable multiples from the **same provider on the same date (2026-09-07)**, and `06`'s primary comparable (Vertiv) is `03`'s self-selected peer. One input set, expressed twice |
| Own-history vs peers | no point vs $141.37 | `02` withheld its own base point as illustrative-only (six quarterly closes inside one upswing). Its most reliable marker ($145.94 on TEV/NTM EBITDA median) lands close to `03` — but **a multiple taken from the company's own trading history can never corroborate a claim about whether the market is mispricing that company** (CLAUDE.md §16) |
| DCF vs the private market | $76.30 vs $77.41 | **This is the only genuine corroboration in the run.** Two completely different input sets — filed cash flows discounted at the company's own disclosed rate, and an arm's-length price this management just agreed for the same data-centre power growth exposure at the same ~21.7% EBITDA margin — land **1.5% apart**, and 45% below the base point |

**Which method I trust most for this company, and why:** **`04_intrinsic-dcf`**, corroborated by the Maverick private-market comparable. It is the only read built entirely on filing-grade cash flows and a company-disclosed, scope-matched cost of capital, its terminal was rebuilt to be financeable rather than flagged and carried, and it survived the WACC gates on both sides (after-tax k_d 4.13% ≤ WACC 10.22% < k_e 10.54%; all three low-side floors and the high-side ceiling). I discount `06` (its own author instructs it be kept inside the minority cross-check weight; five stated limits) and I treat the `03`/`06` agreement as one read, not two. **The base point of $128.24 is where the multiples-first policy's weights land — it is not a claim that nVent is worth roughly halfway between its cash flows and its comparables.** `07` published it under that policy and capped confidence rather than swapping lenses, which is the correct handling; the risk around it is asymmetric and runs **downward**.

### Sector Cycle Reality Test roll-up *(MODULE_RULES → Scenario Construction §3)*

| Specialist | Reality Test result | Tag |
|---|---|---|
| `02_multiples-own-history` | **Cycle-elevated.** S&P 500 Industrials forward P/E ~16.0x (late 2022) → ~25.5x, about **+59%**, same direction as nVent's premium to its own mean [`Web: Yardeni Research QuickTakes, retrieved 2026-09-07 — indicative, unverified`] | **`RF-VAL-001` fired** |
| `03_relative-valuation-peers` | **Cycle-elevated.** Industrials forward P/E ~24.25–24.5x vs a ~17.0x 25-year average (**+43%**); Eaton EV/EBITDA 17.06x (2021) → 27.14x (**+59%**), Hubbell **+16%** [`Web: stock-analysis-on.net / valueinvesting.io / siblisresearch.com / macromicro.me, retrieved 2026-09-07 — unverified`] | **`RF-VAL-001` fired** |
| `06_sum-of-the-parts` | **"Not assessable — no sector-level multiple history"** for its comparables. Recorded as an honest absence, not skipped. It carries a live warning: Vertiv's own EV/EBITDA moved 30.1x → 37.0x inside eight months | — |

**Both `02` and `03` flagged the SAME direction, so the compounding rule binds and is stated plainly: their apparent agreement is one shared sector cycle counted twice, not independent corroboration.** The combined base-case valuation confidence cap of **55** applies for exactly this reason — this is the case that cap exists for. Note also that **no sector-level multiple history existed anywhere in the data pool**; both flags rest on web-sourced, unverified references, and `06`'s check could not be run at all. That gap is recorded here rather than left invisible.

---

## 4. Score Cap Application

| Cap Trigger | Applied? (Y/N) | Affected Score | Final Cap |
|---|---|---|---|
| No pool-verified price (price-state `indicative` or `none`) | **N** — `01` tags the price-state **`pool-verified`** ($171.16, as-of date confirmed by the export itself) | MoS, downside-to-bear, observed up/down, attractiveness + confidence | **Does not bind.** Margin of safety, downside-to-bear, observed up/down and attractiveness all remain **assessable** |
| **Stale pool-verified price** (as-of known, >15 trading days) | **Y** — 26 calendar days ≈ 17–19 trading days; refresh attempted, no fresher pool quote exists; corroborated indicative $156.03 carried alongside, −8.84% drift | Valuation confidence | **max 60**; mandatory inline staleness flag and dual-price presentation on every price-relative read (applied throughout §1 and §5) |
| No consensus / forward estimates | **N** — full consensus set FY2026E–FY2030E, 15–17 estimates | Valuation confidence | — |
| No peer data | **Y** — `ciq_facts.json` `peer_ev_ebitda: missing`; every peer multiple in `03` and `06` is web-sourced 2026-09-07, unverified | Overall usefulness | **max 70** (scored 68) |
| Only one valuation method usable | **N** — `03`, `04`, `06` all produced values; `05` produced the priced-in read | Valuation confidence | — |
| No cash flow AND DCF is only method | **N** — cash flow statement present (LTM CFO $690.6m / continuing $772.8m) | Valuation confidence | — |
| SOTP not possible for multi-segment | **N** — `06` ran in full on a forward FY2026E basis and cleared the forward-basis hard rule | Overall usefulness | — |
| **Full high-to-low field of valid value-producing methods exceeds 40%** | **Y** — **$76.30–$152.16 = 99.4%** of the low value | Valuation confidence | **max 55.** The reconciliation in §3 does **not** waive it |
| Terminal value >75% of DCF EV | **N** — 45.6% of EV in `04`'s forward model (60.6% at `05`'s price-implied solve, which is a fact about the price, not about `04`) | Valuation confidence | — |
| Misaligned controlling owner (RF-OWN-004, §24 Filter 6) | **N** — `management-governance/04_ownership-and-insider-behavior.md` tested all three unaligned structures and excluded each; `99_management-governance-synthesis.md` records **"RF-OWN-004 not triggered"** [findings 04-026, 05-038] | Valuation attractiveness | **Does not bind.** No owner-driven value-trap flag and no attractiveness cap flow from ownership |
| **Sector Cycle Reality Test flags `02` and/or `03` cycle-elevated/depressed, unreconciled** | **Y — BOTH, same direction** | Valuation confidence | **max 60 per method; max 55 combined** (compounding rule) |

**Most restrictive applies: valuation confidence capped at 55.** The score published in §1 is **45**, below the cap — the genuine confidence here is lower than the cap requires, because the 99.4% field, the absent peer multiples, the 1.5-year own-history window, the stale anchor and the pre-Maverick basis all compound.

**One cap that is NOT applied, and the reason is stated so it is not inherited by mistake:** no language or translation cap arises. All 15 pool sources are in English (`00` §1A), and in any case a non-English filing is not a data gap (CLAUDE.md §27). No upstream module logged one.

---

## 5. Fair-Value Summary

**(a) The levels and what drives them.** Bull **$198.88**, base **$128.24**, `bear_cyclical` **$77.23**, with a separate `bear_structural` floor at **$69.92** on a 24–36 month horizon. The single method that drives the base point is **`03_relative-valuation-peers` at 67% weight** — required by the multiples-first hard rule because nVent is an operating company with a usable forward metric (NTM EPS $5.77, reconciled to the cent across two independent providers) — with `04`'s DCF at 22% and `06`'s SOTP at 11%, exactly at the ≤⅓ cross-check cap. That weighting is policy-compliant, and it is also the weakest foundation in the run: **`03`'s peer multiples are not in the data pool at all.**

**(b) What the price implies, and whether it is achievable.** At $156.03 the market needs free cash flow to compound at **20.4% a year for nine and a half consecutive years**, taking it from $718m to $3.8bn, and revenue to reach $25.7–28.7bn — five to six times today's $4.8bn, or about **0.95x Eaton's entire current group revenue**. The earnings and business-model evidence says the *rate* has been cleared (mix-weighted segment profit +62.9% in H1 FY26; group FCF +33.6% FY2022–FY2025) but the *duration* never has: the record is three years long, it ends at a documented cycle peak, organic orders have already decelerated from about +40% to "low double digits", and backlog has slipped from $2.6bn to $2.5bn. The margin route is closed outright — the price would need a steady-state EBITDA margin near **64%** against an own best-ever of 22.4%. `05`'s verdict is **aggressive; not achievable on duration**, and I adopt it.

**(c) The two price-relative reads, kept separate.** **Margin of safety** (the cushion, `(base FV − price) / base FV`) is **−21.7%** at $156.03 and **−33.5%** at $171.16 *(inline staleness flag: anchor as-of 2026-08-12, ~17–19 trading days old, −8.84% drift to the fresher quote)*. Negative means the price is **above** base fair value — there is no cushion at all, not a thin one. **Downside to bear** (the loss if `bear_cyclical` plays out, `(price − bear FV) / price`, **inverted — higher is worse**) is **+50.5%** and **+54.9%**. To the avoid-ruin floor of $69.92 it is **+55.2%** / **+59.2%**. These are two different numbers and neither substitutes for the other.

**(d) Value-trap risk — one trigger fires, one does not, and the one that fires is not the usual one.** The **ownership** trigger does **not** fire: RF-OWN-004 was tested on all three structures and excluded, so persistent cheapness under a misaligned owner is not the risk here — and the market is not pricing this name cheaply in any case (EV/LTM EBITDA 26.2x, P/LTM EPS 47.5x). The **sector-cycle** trigger **does** fire, and it is the mirror-image trap: the warranted multiple that "justifies" the base case is itself cycle-elevated. The peer median of 22.06x sits roughly 43% above its own 25-year average and Eaton's EV/EBITDA is up 59% since 2021, so **the base fair value only deserves its multiple because the whole sector currently does**. If the industrials multiple normalises, the peer median and the base point fall together — nVent does not have to disappoint on its own numbers for the downside case to arrive. Underneath it sits the quality evidence: business quality **41/100**, cyclicality **30/100**, industry rate-of-change **40/100** (§24 Filter 5 tripped, `RF-BQ-005`), through-cycle return on capital **8.10% against a 10.0% disclosed cost of capital**, 58.1% of H1 FY26 sales in one vertical and 85.0% in one region. That is not a business that has earned the right to a durable premium multiple; it is a business currently being paid one.

---

## 6. What Would Change The Valuation Verdict?

| Current Verdict | What Would Make It Cheaper | What Would Make It More Expensive | Data Needed |
|---|---|---|---|
| **Materially overvalued** (base FV $128.24 vs $156.03 indicative / $171.16 pool anchor) | (1) A **Q3 FY2026 print on 2026-10-30** showing backlog back **above $2.6bn** with organic orders out of "low double digits" — that lifts the forward metric toward the bull's $6.63 and validates the multiple, and it is the single event that moves this stock 10%+. (2) Evidence that the through-cycle return on capital clears the 10.0% cost of capital rather than sitting at 8.10% — that would let `04`'s terminal carry an excess return and lift the DCF from $76.30 toward the $80–$93 cells. (3) **Maverick Power closing accretively**: struck at ~11.5x forward EBITDA against nVent's ~21.4x, it sits inside **no** published level and is directionally value-additive. (4) A genuine peer-multiples export showing the group median above the web-sourced 22.06x | (1) The sector multiple normalising toward its own 25-year average — the peer median falls and the base point falls with it, with no company-specific bad news required. (2) **Backlog below $2.4bn with gross margin under 37.0%** at the 30-Oct-2026 print, which `09_moat.md` names as the erosion threshold and which flips the headline bear from cyclical to structural. (3) The liquid-cooling or 800-volt DC architecture settling against nVent's product set — that converts a cycle into share loss and makes `bear_structural` at $69.92 the live case, not the floor. (4) Pro-forma leverage moving from 1.15x to ~2.43x on Maverick debt, taking nVent from the least-levered end of its peer set to about its median and removing a real part of the warranted premium | **The single highest-value next data request: a Capital IQ / Bloomberg peer-comps export with forward multiples for ETN, HUBB, LR, ABBN, ATKR, FPS and VRT, plus that peer group's own multiple history over 3–5 years.** It would replace the web-sourced peer set that carries 67% of the base point AND allow the Sector Cycle Reality Test to be run on matched data rather than on unverified web references. Second: a **post-2026-08-24 price and post-deal consensus**, which would re-anchor everything and fold Maverick in. Third: the **FY2025 10-K**, which is absent from the pool |

---

## 7. Note To The Final Synthesizer

- **The levels are: bull $198.88 · base $128.24 · `bear_cyclical` $77.23 · `bear_structural` $69.92.** Adopt those four labels verbatim — `bear_cyclical` (12-month) and `bear_structural` (24–36 month) are **two derived cases with different horizons**, not one case with two names, and the module deliberately did not merge them. The base point is a policy-weighted blend (`03` 67% / `04` 22% / `06` 11%) and the risk around it is **asymmetric to the downside**.
- **What the price implies and whether it is achievable:** 20.4–21.8% free-cash-flow growth every year for nine and a half years, off a base both `earnings/01` and `01` flag as a cycle peak, against 8.6% from the consensus-fed model. The margin route is arithmetically impossible (needs ~64% steady-state EBITDA margin); the volume route needs nVent to reach ~0.95x Eaton's entire group revenue in nine years. **Not achievable on duration.**
- **The cushion and the downside anchor are two different numbers.** Margin of safety **−21.7%** at $156.03 / **−33.5%** at $171.16 — there is **no** cushion, the price is above base fair value. Downside to the bear-case value of **$77.23** is **+50.5% / +54.9%** (inverted). The avoid-ruin floor is **$69.92**.
- **Value trap: yes, but not the owner kind.** **RF-OWN-004 is NOT triggered** — `management-governance/04` tested government control, listed-subsidiary-of-a-parent, and sprawling-conglomerate structures and excluded all three; the governance synthesis confirms it. The trap here is the **warranted multiple**: 22.23x is only defensible because the peer median (22.06x) is itself ~43% above its 25-year average. A business scoring 41/100 on quality, 30/100 on cyclicality and 40/100 on rate of change, earning 8.10% against a 10.0% cost of capital, has not earned a durable premium multiple. Note the residual alignment risk runs the *other* way from the usual: with no controlling owner and sub-1% insider ownership, **nobody at this company has a personal balance-sheet reason to care about the share price**, and the pay-design test could not be run because the proxy is absent.
- **Which method to trust, and which to discount for THIS company:** trust **`04`'s DCF ($76.30)**, corroborated to within 1.5% by the **Maverick private-market comp ($77.41)** — the only two genuinely independent reads. Discount **`06`'s SOTP ($152.16)** (self-declared low-confidence, five stated limits) and treat **`03` ($141.37) and `06` as one read**, because their comparables come from the same provider on the same date. **`02` produced no fair-value input at all** and is zero-weighted — do not resurrect its $145.94 marker as a corroborating number.
- **Caps applied and what they limit:** *stale pool-verified price* (17–19 trading days, −8.84% drift) → confidence max 60, dual-price presentation mandatory; *no peer data* → overall usefulness max 70; *99.4% cross-method field* → confidence max 55; *`RF-VAL-001` fired in `02` AND `03` in the same direction* → combined confidence max 55. **Most restrictive: 55; published at 45.** No no-price cap: the price is `pool-verified`, so margin of safety, downside-to-bear, observed up/down and attractiveness are all assessable.
- **Declared data limitation that must travel to the thesis: everything here is pre-Maverick-Power.** The $1.75bn cash acquisition plus up to $550m earnout (announced **2026-08-24**, ~$700m target 2026 revenue, close expected Q4 2026, funded from cash and new debt) post-dates the price anchor (2026-08-12), the entire consensus set (to 2026-08-07) and the 30-Jun-2026 balance sheet. **The EV bridge, all four fair-value levels, the DCF and the reverse-DCF are all pre-deal on both the cash-flow and the debt side, consistently.** Directionally it is multiple-accretive (11.5x vs nVent's ~21.4x) and it would take net debt per share from **$7.53 to roughly $18.2** on `balance-sheet-survival/01`'s labelled pro-forma of ~$2,986.4m / ~2.43x (*Inference, not from filings*). `earnings/07` records the EPS effect as **"not quantifiable"** — margin, intangible amortisation and the cash-versus-debt funding split are all undisclosed. Do not fold it into a level.
- **Biggest missing data point (one item):** a **Capital IQ / Bloomberg peer-comps export with forward multiples and 3–5 years of peer-multiple history**. It carries 67% of the base point today on web-sourced numbers and it is the only way to test the Sector Cycle flag on matched data.
- **Explicit handoff:** the master synthesizer's **"Valuation and Peer Mispricing" section should defer to this synthesis**. The bull / base / `bear_cyclical` / `bear_structural` **LEVELS** above are the inputs for the master's probability-weighted scenario model. **This module assigns no probabilities, computes no probability-weighted return or risk/reward, issues no rating and sizes no position** — the master owns all of that. Two things the master must handle: the case set mixes **materially different horizons** (12-month cases against a 24–36 month structural reset), so any probability-weighted figure is **not a same-date comparison** and must say so; and the **span check** is satisfied by a single dated event — the **Q3 FY2026 print on 2026-10-30** — which sits on the bull side of the bull case and the bear side of the bear.

---

## 8. Simple Summary

- **The stock costs more than it is worth on this module's numbers.** Base fair value is **$128.24** a share, against $156.03 (fresher, 2026-09-04) and $171.16 (the pool anchor, 2026-08-12) — **17.8% and 25.1% above** fair value.
- **The levels: bull $198.88 · base $128.24 · bear (cyclical) $77.23 · structural floor $69.92.** The methods themselves run from **$76.30 to $152.16** — a 99.4% spread, which is the single most important fact in this report.
- **What the market is pricing:** free cash flow growing about **20–22% a year for nine and a half years**, and revenue reaching roughly the size of Eaton's entire company. The model fed by consensus produces **8.6%**.
- **Where the downside is:** a fall of **50.5%** to the bear level of **$77.23**, and **55.2%** to the $69.92 structural floor. There is **no** cushion — the margin of safety is negative at both prices.
- **The method that matters most here is the cash-flow model ($76.30)**, because it is the only one built on filed cash and the company's own 10.0% cost of capital — and the price management itself just paid for Maverick Power says almost exactly the same thing (**$77.41**). Two independent reads, 1.5% apart, 45% below the base.
- **Value-trap risk: yes, from the sector, not the owner.** No misaligned controlling owner exists (RF-OWN-004 not triggered). The trap is that the multiple justifying the base case is itself sitting about 43% above its own long-run average — the sector can de-rate without nVent doing anything wrong.
- **A current price was available** ($171.16, pool-verified) but it is **17–19 trading days old and 8.84% above the latest quote**, and it pre-dates the $1.75bn Maverick Power deal. Every price-relative number is shown at both prices. **The key gap is the missing peer-multiples export**, which carries two-thirds of the base point on web-sourced numbers.
- **This module is useful to the master synthesizer (68/100)**, mainly because it produces four clean, price-independent levels, a hard read on what the price requires, and an honest statement that its own methods disagree by 99.4%.

---

## Machine-readable sidecar — `analyses/NVT_2026-09-07/valuation/valuation_summary.json`

```json
{
  "schema_version": "1.4",
  "ticker": "NVT",
  "as_of": "2026-09-07",
  "currency": "USD",
  "business_type": "Operating",
  "basis": "equity",
  "shares": 164.2,
  "net_debt": 1236.4,
  "net_debt_basis": "strict",
  "current_price": 171.16,
  "price_as_of": "2026-08-12",
  "price_state": "pool-verified",
  "indicative_price": 156.03,
  "indicative_price_as_of": "2026-09-04",
  "indicative_price_note": "Web-sourced, corroborated by two independent sources, unverified - NOT the anchor. Pool anchor is stale by ~17-19 trading days (-8.84% drift). 01_price-and-capital-structure.md SS1 and SS7.",
  "is_developed_mega_cap": true,
  "scenarios": [
    {
      "label": "bull",
      "level": 198.88,
      "forward_metric": 6.63,
      "metric_basis": "NTM",
      "multiple": 30.0,
      "multiple_basis": "NTM P/E on adjusted diluted EPS",
      "multiple_kind": "applied",
      "basis": "equity",
      "source": "07_scenario-and-fair-value.md SS3 scenario table and SS3A block D",
      "drivers": "NTM revenue $6,519.6m (data-centre revenue +20%, +$400m on the guided >$2.0bn base) x adjusted return on sales 22.5% (30% incremental conversion); backlog back above $2.6bn and organic orders out of 'low double digits' at the 2026-10-30 Q3 print; implied GAAP EBITDA margin 23.5%. Multiple is roughly the anchor-date traded level (29.66x), below the observed six-quarter high of 38.16x."
    },
    {
      "label": "base",
      "level": 128.24,
      "forward_metric": 5.77,
      "metric_basis": "NTM",
      "multiple": 22.23,
      "multiple_basis": "NTM P/E on consensus adjusted diluted EPS",
      "multiple_kind": "implied",
      "basis": "equity",
      "secondary_multiples": [
        {
          "value": 16.39,
          "basis": "EV/NTM EBITDA (NTM EBITDA $1,359.8m)",
          "note": "cross-check only; current 21.39x, own-history NTM band 12.40-27.23x"
        }
      ],
      "source": "07_scenario-and-fair-value.md SS2D weighted point and SS3 scenario table",
      "drivers": "Weighted blend of the value-producing methods (03 peers 67% x $141.37 + 04 DCF 22% x $76.30 + 06 SOTP 11% x $152.16 = $128.24); the 22.23x multiple is DERIVED from that point, not assumed, and sits essentially at the current peer median of 22.06x. Requires consensus to deliver (FY2026 revenue at the +37-39% guided midpoint, adjusted EPS $5.00-5.10; FY2027 consensus $6,368.6m) while the +2.44-turn growth premium is competed away. Implied GAAP EBITDA margin 22.2%, at the LTM level."
    },
    {
      "label": "bear_cyclical",
      "level": 77.23,
      "forward_metric": 4.29,
      "metric_basis": "NTM",
      "multiple": 18.0,
      "multiple_basis": "NTM P/E on adjusted diluted EPS",
      "multiple_kind": "applied",
      "basis": "equity",
      "source": "07_scenario-and-fair-value.md SS3 scenario table and SS3A block D",
      "drivers": "12-month cyclical trough (the HEADLINE bear). NTM revenue $5,719.6m (data-centre revenue -20%, -$400m) x adjusted return on sales 17.0%; backlog keeps falling through the 2026-10-30 and Feb-2027 prints while three committed Minnesota plants enlarge the fixed base, reversing the fixed-overhead absorption that was 109% of the Q2 FY26 margin gain. Implied GAAP EBITDA margin 18.14%, 0.94pp above the documented FY2022 trough of 17.2%. Multiple compressed toward, not to, the observed six-quarter minimum of 14.87x."
    },
    {
      "label": "bear_structural",
      "level": 69.92,
      "forward_metric": null,
      "metric_basis": null,
      "multiple": null,
      "multiple_basis": null,
      "multiple_kind": null,
      "basis": "ev",
      "source": "07_scenario-and-fair-value.md SS3 and SS3A block F; 04_intrinsic-dcf.md SS5 runoff terminal",
      "drivers": "24-36 month permanent-impairment path, carried as the CLAUDE.md SS24 avoid-ruin floor, NOT the 12-month bear. Liquid-cooling architecture or the 800-volt DC rack standard settles against nVent's product set and the growth vertical becomes a share loss rather than a cycle. Impaired-DCF enterprise value, not a multiple.",
      "derivation": {
        "model": "ev_bridge",
        "ev": 12716.8,
        "net_debt": 1236.4,
        "net_debt_basis": "strict (CLAUDE.md SS15; 01_price-and-capital-structure.md canonical, total debt 1,492.4 filing debt-note basis less cash 256.0)",
        "minority": 0.0,
        "other": 0.0,
        "shares": 164.2,
        "source": "04_intrinsic-dcf.md SS5 executed runoff snippet ('EV 12716.8 ; equity 11480.4 ; $69.92/sh'); bridged in 07_scenario-and-fair-value.md SS3A block F",
        "stated_drivers": [
          {
            "label": "terminal EBITDA margin (non-recovering)",
            "value": 0.175,
            "note": "the company's own FY2022 trough level (17.2%); impaired-DCF input - its per-year mapping to EV is not tabulated by the orb"
          },
          {
            "label": "terminal nominal growth",
            "value": 0.0,
            "note": "approximately -2.3% real, i.e. permanent real shrinkage; impaired-DCF input - mapping to EV not tabulated"
          },
          {
            "label": "terminal value as % of EV",
            "value": 0.411,
            "note": "recorded by 04 SS5; display-only provenance"
          }
        ]
      }
    }
  ],
  "methods": {
    "own_history": null,
    "peers": 141.37,
    "dcf": 76.3,
    "sotp": 152.16
  },
  "method_weights": {
    "own_history": 0.0,
    "peers": 0.67,
    "dcf": 0.22,
    "sotp": 0.11
  },
  "method_basis": {
    "own_history": null,
    "peers": "NTM",
    "dcf": "FY+1",
    "sotp": "FY+1"
  },
  "method_notes": "own_history is null and zero-weighted because 02_multiples-own-history.md SS4 declares its own output 'ILLUSTRATIVE ONLY - NOT A FAIR-VALUE INPUT FOR 07' (six quarterly closes, ~1.5 years). peers = warranted forward P/E 24.5x x NTM EPS $5.77. dcf = 04's forward FCFF model, valuation date 30-Jun-2026, explicit H2-2026 stub through FY2035 then terminal - forward basis throughout, NOT trailing. sotp = FY2026E segment income x forward comparable multiples (06 cleared the forward-basis hard rule; a trailing build was explicitly refused). No method carries base-point weight on a trailing period. Multiples-first policy holds: peers 0.67 majority, dcf+sotp combined exactly 0.33 at the <=1/3 cross-check cap, so no method_weight_exception is required.",
  "method_weight_exception": null,
  "discount_rate": {
    "rf": 0.0479,
    "erp": 0.0423,
    "beta": 1.36,
    "cost_of_equity": 0.105428,
    "wacc": 0.102152,
    "after_tax_kd": 0.04134
  },
  "dcf_grid": {
    "wacc": [0.0922, 0.1022, 0.1122],
    "growth": [0.025, 0.03, 0.035],
    "values": [
      [87.66, 76.11, 67.17],
      [88.39, 76.3, 67.07],
      [89.21, 76.48, 66.94]
    ],
    "base": {
      "wacc": 0.1022,
      "growth": 0.03
    },
    "source": "04_intrinsic-dcf.md SS7 required WACC x terminal-growth sensitivity grid (terminal ROIC held at 10.22%, terminal EBITDA margin 20.0%)"
  },
  "sotp_segments": [
    {
      "segment": "Systems Protection",
      "metric_name": "FY2026E reportable segment income (EBIT-type, before the corporate pool)",
      "metric": 888.9,
      "multiple": 26.0,
      "comp": "Vertiv Holdings Co (NYSE:VRT) at 32.6x forward EV / FY2026E adjusted operating profit; 26.0x is a ~20% discount pricing the ~third of the segment that is not data centres",
      "source": "06_sum-of-the-parts.md SS2 and SS3"
    },
    {
      "segment": "Electrical Connections",
      "metric_name": "FY2026E reportable segment income (EBIT-type, before the corporate pool)",
      "metric": 388.2,
      "multiple": 17.0,
      "comp": "Hubbell Incorporated (NYSE:HUBB) at 18.6x forward EV / FY2026E adjusted operating profit; ~9% discount for margin trajectory, not level",
      "source": "06_sum-of-the-parts.md SS2 and SS3"
    },
    {
      "segment": "Enterprise and other (unallocated corporate cost pool)",
      "metric_name": "FY2026E corporate cost, capitalized at the blended segment multiple",
      "metric": -150.0,
      "multiple": 23.26,
      "comp": null,
      "source": "06_sum-of-the-parts.md SS4 equity bridge - capitalized, never dropped (Reconciliation Gate 3)"
    }
  ],
  "sotp_bridge": {
    "net_debt": 1236.4,
    "minority": 0.0,
    "other": 0.0,
    "source": "06_sum-of-the-parts.md SS4; net debt strict CLAUDE.md SS15 basis, 01_price-and-capital-structure.md canonical figure (total debt 1,492.4 less cash 256.0). No conglomerate/holdco discount applied."
  },
  "peers_internals": {
    "metric_name": "NTM P/E applied to consensus NTM EPS of $5.77",
    "median_multiple": 22.06,
    "applied_multiple": 24.5,
    "discount_pct": -11.1,
    "anchors": [
      {
        "multiple": 24.5,
        "value": 141.37,
        "label": "warranted forward P/E - the base case (peer median +2.44 turns: an evidenced ~5-turn growth premium halved because the growth does not earn its cost of capital)"
      },
      {
        "multiple": 22.06,
        "value": 127.29,
        "label": "seven-peer median forward P/E, unadjusted"
      }
    ],
    "source": "03_relative-valuation-peers.md SS5A dispersion table and SS5B base case; peer multiples web-sourced 2026-09-07, unverified (no comps export in the pool)"
  },
  "caps_applied": {
    "stale_pool_verified_price": "valuation confidence max 60 (anchor 2026-08-12, ~17-19 trading days, -8.84% drift)",
    "no_peer_data": "overall usefulness max 70",
    "cross_method_field_over_40pct": "valuation confidence max 55 (field $76.30-$152.16 = 99.4% of the low)",
    "sector_cycle_compounding": "valuation confidence max 55 (RF-VAL-001 fired in BOTH 02 and 03, same direction)",
    "most_restrictive_confidence_cap": 55,
    "published_valuation_confidence": 45,
    "rf_own_004_unaligned_owner": "NOT triggered - no attractiveness cap from ownership"
  },
  "declared_limitations": "All levels, the EV bridge, the DCF, the reverse-DCF and every consensus mark are PRE-MAVERICK-POWER: the $1.75bn cash acquisition plus up to $550m earnout (~$700m target 2026 revenue, close expected Q4 2026, cash-and-new-debt funded) was announced 2026-08-24, after the price anchor (2026-08-12), the consensus set (to 2026-08-07) and the 30-Jun-2026 balance sheet. The FY2025 10-K is absent from the pool. No peer-multiple data exists in the pool. Own-history multiple window is ~1.5 years."
}
```
