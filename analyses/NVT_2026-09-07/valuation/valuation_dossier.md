# valuation Module Dossier — NVT

> Deterministic, lossless concatenation of every artifact in this module — the module synthesis and every specialist output, in order. Generated mechanically (no LLM rewriting), so nothing is omitted or paraphrased. This is the module's "see everything" tier; the module's decision lives in `99_*-synthesis.md` and the short read in `valuation_memo.md`.

- Generated: 2026-09-07T15:00:45Z
- Module folder: `valuation`
- Contents: 1 module synthesis + 8 specialist outputs = 9 files

## Table of Contents

- [valuation — module synthesis](#valuation-module-synthesis) — `99_valuation-synthesis.md`
- [valuation / 00_valuation-data-triage.md](#valuation-00-valuation-data-triage-md) — `00_valuation-data-triage.md`
- [valuation / 01_price-and-capital-structure.md](#valuation-01-price-and-capital-structure-md) — `01_price-and-capital-structure.md`
- [valuation / 02_multiples-own-history.md](#valuation-02-multiples-own-history-md) — `02_multiples-own-history.md`
- [valuation / 03_relative-valuation-peers.md](#valuation-03-relative-valuation-peers-md) — `03_relative-valuation-peers.md`
- [valuation / 04_intrinsic-dcf.md](#valuation-04-intrinsic-dcf-md) — `04_intrinsic-dcf.md`
- [valuation / 05_reverse-dcf.md](#valuation-05-reverse-dcf-md) — `05_reverse-dcf.md`
- [valuation / 06_sum-of-the-parts.md](#valuation-06-sum-of-the-parts-md) — `06_sum-of-the-parts.md`
- [valuation / 07_scenario-and-fair-value.md](#valuation-07-scenario-and-fair-value-md) — `07_scenario-and-fair-value.md`


---

## valuation — module synthesis

_Source: `99_valuation-synthesis.md`_

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



---

## valuation / 00_valuation-data-triage.md

_Source: `00_valuation-data-triage.md`_

# Valuation Data Triage — NVT

Evidence binding: frozen. `DATA_PATH` = `NOSTRA_FROZEN_EVIDENCE_ROOT` (cited logically as `data/NVT/`); all reads resolved through the bound generation `6db3284…1aecd1e6`. The extractor was not re-run and no live `data/NVT/` or `_pool_extracts/` path was read. Manifest totals: 15 sources, 2 workbooks, 20 tabs, 33 extracts written, **0 failures** — no source is in a `fail` / `fallback-text` / `missing-dependency` state, and there are no Drive pointer stubs.

## 1. File Inventory

"Period Covered" is parsed from INSIDE each document (period-end / "as of" / fiscal-year line), never from a file timestamp. Workbook tabs are listed as their own rows (parent file + sheet + rows×cols).

| Filename | Type | Period Covered | Last Modified | Valuation Relevance |
|---|---|---|---|---|
| `nVent Electric plc, 2025.pdf` | Annual filing — **Form 10-K, fiscal year ended December 31, 2024** | FY2024 (Dec-31-2024) | not used (frozen pool; sync date is not evidence) | High |
| `nVent Electric plc, Q2 2026.pdf` | Quarterly filing — Form 10-Q | Quarterly period ended June 30, 2026 | not used | High |
| `nVent Electric plc, Q1 2026.pdf` | Quarterly filing — Form 10-Q | Quarterly period ended March 31, 2026 | not used | High |
| `nVent Electric plc, 2026.pdf` | Quarterly filing — Form 10-Q (**duplicate of the Q1 2026 10-Q**; same cover, "On March 31, 2026, 161,720,452 shares … outstanding") | Quarterly period ended March 31, 2026 | not used | Medium (duplicate) |
| `nVent Electric plc, 2026 rev.pdf` | **Form 11-K** — employee retirement-savings plan annual report (NOT the FY2025 10-K) | Plan fiscal year ended December 31, 2025 | not used | Low |
| `nVent Electric plc, Q2 2026 Earnings Call, Jul 31, 2026.pdf` | Transcript | Q2 2026, call dated Jul 31, 2026 | not used | Medium |
| `nVent Electric plc, Q1 2026 Earnings Call, May 01, 2026.pdf` | Transcript | Q1 2026, call dated May 1, 2026 | not used | Medium |
| `nVent Electric plc, Q1 2026 ppt.pdf` | Investor deck (earnings presentation) | Q1 2026, dated May 1, 2026 | not used | Medium |
| `2026-William-Blair-Conference-nVent-NVT-Presentation.pdf` | Investor deck (conference) | Dated June 3, 2026 | not used | Medium |
| `nVent-to-Acquire-Maverick-Power-2026.pdf` | Material-event press release — $1.75bn acquisition + up to $550m earnout, close expected Q4 2026, funded from cash on hand + new debt | Dated **2026-08-24** | not used | **High** (post-dates every vendor export) |
| `nVent Electric plc NYSE NVT Competitors.rtf` | Peer/comps — CIQ named-competitor list with LTM revenue only (no multiples) | LTM dates to Jun-30-2026 | not used | Medium |
| `nVent Electric plc NYSE NVT Products.rtf` | Other — CIQ product list | undated product catalogue | not used | Low |
| `nVent Electric plc NYSE NVT Strategic Alliances.rtf` | Other — CIQ alliances list | undated | not used | Low |
| `nVent Electric plc NYSE NVT Financials.xls` → **Key Stats** (91×9) | Multiples export + **current price / capitalization** — Share Price 171.16, Shares Out. 161.857939m, Market Cap 27,703.6m, TEV 29,080.5m | FY2022A–FY2025A, LTM Jun-30-2026, FY2026E–FY2028E; pricing as of 2026-08-12 | not used | High |
| `…Financials.xls` → **Income Statement** (108×7) | Income statement | FY2021–FY2025 + LTM Jun-30-2026 | not used | High |
| `…Financials.xls` → **Balance Sheet** (94×7) | Capital structure — Cash 256.0, Total Debt 1,632.9, Net Debt 1,376.9, Common Equity 3,986.9 | Dec-31-2023 → **Jun-30-2026** | not used | High |
| `…Financials.xls` → **Cash Flow** (76×7) | Cash flow statement — capex, dividends, buybacks | FY2021–FY2025 + LTM Jun-30-2026 | not used | High |
| `…Financials.xls` → **Multiples** (91×9) | Multiples export — TEV/LTM & NTM EBITDA/EBIT/Revenue, P/E, P/BV (High/Low/Avg/Close) | Quarterly closes 2025-03-31 → **2026-08-12** (7 columns, last = current) | High |
| `…Financials.xls` → **Historical Capitalization** (39×7) | Capital structure history | Pricing as of 2025-05-02 → 2026-07-31 | not used | Medium |
| `…Financials.xls` → **Capital Structure Summary** (99×7) | Debt composition | FY2024, FY2025, 3 months Jun-30-2026 | not used | High |
| `…Financials.xls` → **Capital Structure Details** (40×10) | Debt maturities / fixed-floating | FY2025 (Dec-31-2025) as-reported | not used | Medium |
| `…Financials.xls` → **Ratios** (161×7) | Returns / leverage ratios (ROIC) | FY2021–FY2025 + LTM Jun-30-2026 | not used | Medium |
| `…Financials.xls` → **Supplemental** (74×7) | Supplemental items | FY2020–FY2025 (+LTM) | not used | Low |
| `…Financials.xls` → **Industry Specific** (15×6) | Industry items (sparse, 20 cells) | n/a | not used | Low |
| `…Financials.xls` → **Pension OPEB** (243×7) | Pension / OPEB (discount-rate cross-check) | FY2020–FY2025 (+LTM) | not used | Low |
| `…Financials.xls` → **Segments** (84×7) | Segment data — revenue, operating profit, assets, D&A by segment | FY2020–**FY2025 (Dec-31-2025)**, annual only | not used | High |
| `nVentElectricplcNYSENVTEstimatesReport.xls` → **Consensus** (462×41) | Consensus estimates — Revenue/EBITDA/EPS FY2026E–FY2030E, target price mean 202.13 (15 estimates), Last Close 171.16 | Current FY end Dec-31-2026; FQ3 2026 release Oct-30-2026 | not used | High |
| `…EstimatesReport.xls` → **Guidance** (179×41) | Company guidance vs consensus | FQ3 2018 → FY 2026 | not used | High |
| `…EstimatesReport.xls` → **Multiples** (23×7) | Forward multiples export — NTM and FY2026E–FY2030E TEV/EBITDA, TEV/EBIT, P/E, P/BV | NTM / FY2026E–FY2030E | not used | High |
| `…EstimatesReport.xls` → **Recent Changes** (265×10) | Estimate revisions (dates to **2026-08-07** — dates the export) | to 2026-08-07 | not used | Medium |
| `…EstimatesReport.xls` → **Revisions** (467×12) | Revision breadth | last-month breadth, FY2026 | not used | Medium |
| `…EstimatesReport.xls` → **Surprise** (219×35) | Beat/miss history | FY2021–FY2025 | not used | Medium |
| `…EstimatesReport.xls` → **Trends** (300×16) | Estimate trend | to FY2026 | not used | Medium |

No `external/` directory exists in this pool, so there is no `## 1A. External Data` table and no external document moved any conclusion below.

Two inventory notes that matter downstream:
1. **The FY2025 10-K is not in the pool.** The only 10-K present covers **FY2024**. FY2025 annual figures exist only inside the Capital IQ workbook (a §4 tier-5 vendor export) and inside the FY2025 comparatives of the 2026 10-Qs. Cite them accordingly — never as "FY2025 10-K".
2. **The Maverick Power acquisition (announced 2026-08-24, $1.75bn + up to $550m earnout, target 2026 revenue ~$700m, close expected Q4 2026, funded from cash on hand and new debt) post-dates every vendor export** (estimates as of 2026-08-07, price/multiples as of 2026-08-12) and the Jun-30-2026 balance sheet. Consensus, the EV bridge, and the price anchor are all **pre-deal**.

## 1A. Jurisdiction & Reporting Regime

| Item | Detected Value | Evidence |
|---|---|---|
| Primary listing country / exchange | United States — NYSE, ticker NVT (company incorporated in **Ireland**; principal executive offices London, United Kingdom) | `FY24 10-K, cover page` ("Ireland … Commission file number 001-38265"); `Q2 FY26 10-Q, cover page` |
| Filing regime (US SEC / India SEBI-LODR / UK / Other) | **US SEC** — Forms 10-K / 10-Q / 11-K | `FY24 10-K, cover`; `Q2 FY26 10-Q, cover`; `FY25 Form 11-K, cover` |
| Reporting standard (US GAAP / IFRS / Ind AS) | **US GAAP** | `Capital IQ Estimates export → Multiples tab` ("Acctg. Standard: US GAAP"); `Q2 FY26 10-Q, condensed consolidated financial statements` |
| Reporting currency (and scale) | **USD**, presented in millions (per-share in dollars) | `Capital IQ Financials export → Income Statement` ("In Millions of the reported currency"); `Q2 FY26 10-Q, income statement` |
| Fiscal-year end | **December 31** (FY2026 ends Dec-31-2026) | `FY24 10-K, cover` ("For the Fiscal Year Ended December 31, 2024"); `Capital IQ Estimates export → Consensus` ("Current Fiscal Year End: Dec-31-2026") |
| Document language(s) | English (all 15 sources) | pool manifest, generation `6db3284…` |

US form names are correct here because this **is** a US SEC filer — no local-equivalent substitution is needed (CLAUDE.md §27).

## 2. Most Recent Sources

| Source Type | Filename | Period / As-of | Age (months) |
|---|---|---|---|
| Annual filing | `nVent Electric plc, 2025.pdf` (Form 10-K) | FY ended Dec-31-2024 | ~20.2 |
| Quarterly filing | `nVent Electric plc, Q2 2026.pdf` (Form 10-Q) | Quarter ended Jun-30-2026 | ~2.2 |
| Capital structure / balance sheet | `nVent Electric plc NYSE NVT Financials.xls` → Balance Sheet; and `Q2 2026 10-Q` balance sheet | As of Jun-30-2026 | ~2.2 |
| Consensus / estimate export | `nVentElectricplcNYSENVTEstimatesReport.xls` → Consensus / Trends / Revisions | Export as of ~2026-08-07 (latest revision date) | ~1.0 |
| Multiples export | `…Financials.xls` → Multiples; `…EstimatesReport.xls` → Multiples | Closes to 2026-08-12; NTM/FY2026E–FY2030E | ~0.9 |
| Peer / comps export | `nVent Electric plc NYSE NVT Competitors.rtf` — **names + LTM revenue only, no peer multiples** | LTM dates to Jun-30-2026 | ~2.2 |
| Current price (IBKR / Capital IQ) | `…Financials.xls` → Key Stats, Current Capitalization — **USD 171.16** (Shares Out. 161.857939m; corroborated by Estimates → Consensus "Latest Price/Last Close 170.70/171.16") | Close **2026-08-12** | ~0.9 (26 calendar days ≈ **18–19 trading days**) |
| Cash flow statement | `…Financials.xls` → Cash Flow; and `Q2 2026 10-Q` cash flow statement | FY2021–FY2025 + LTM Jun-30-2026 | ~2.2 |
| Segment data | `…Financials.xls` → Segments; `Q2 2026 10-Q` segment note | Annual to Dec-31-2025 (workbook); quarterly in the 10-Q | ~8.2 (annual) |

## 3. Valuation Usability Check

| Requirement | Available? (Y/N) | Source | Why It Matters |
|---|---|---|---|
| Current price | **Y (stale)** | `Capital IQ Financials export → Key Stats, Current Capitalization, close 2026-08-12` — USD 171.16 | Anchor for market cap, EV, multiples, margin of safety |
| Diluted share count | Y | `Q2 FY26 10-Q, income statement` — weighted-average diluted 164.1m; shares outstanding at Jun-30-2026 = 161,857,939 (`Q2 FY26 10-Q, cover`) | Needed for market cap and per-share fair value |
| Dilution data (options/RSUs/convertibles) | Y | `Q2 FY26 10-Q, EPS note` ("Dilutive impact of stock options, restricted stock units…", plus anti-dilutive options excluded); `Q2 FY26 10-Q, Note 14 (Share-Based Compensation)` | Needed for fully diluted per-share fair value |
| Business type track (Operating / Financial / REIT / Commodity / Holding co.) | Y — **Operating company** (electrical connection and protection products; two reportable segments) | `FY24 10-K, Item 1`; `Capital IQ Financials export → Segments` | Determines which valuation methods are valid → FCFF DCF + reverse-DCF primary intrinsic; EV/EBITDA, EV/EBIT, P/E, FCF yield primary multiples |
| Total debt, cash, minority/preferred | Y | `Capital IQ Financials export → Balance Sheet` (Jun-30-2026): Cash & ST investments 256.0, Total Debt 1,632.9; `→ Key Stats`: Pref. Equity "–", Total Minority Interest "–" | Needed for the enterprise-value bridge |
| Income statement (LTM or FY) | Y | `Capital IQ Financials export → Income Statement` (FY2021–FY2025 + LTM Jun-30-2026); `Q1/Q2 FY26 10-Q` | Earnings/EBITDA base for multiples and DCF |
| Cash flow statement | Y | `Capital IQ Financials export → Cash Flow` (capex 112.9 LTM; CFO 690.6 LTM per `ciq_facts.json`); `Q2 FY26 10-Q, cash flow statement` | FCF base for DCF and FCF yield |
| Forward estimates (consensus) | Y | `Capital IQ Estimates export → Consensus` — Revenue/EBITDA/EPS FY2026E–FY2030E, 15 brokers, target price mean 202.13 / median 200.00; `→ Multiples` NTM and FY2026E–FY2030E | NTM/FY multiples and DCF near-term path |
| Historical multiple data | **Y, but short window** | `Capital IQ Financials export → Multiples` — only **7 quarterly close columns** (2025-03-31 → 2026-08-12), i.e. ~1.5 years, not the 3–5 years the own-history method wants | Own-history re-rating read |
| Peer / comps data | **N (names only)** | `nVent Electric plc NYSE NVT Competitors.rtf` gives named peers (ABB, Eaton, Atkore, 3M, Forgent Power Solutions and others) with LTM revenue; **no peer multiples, no comps export** — `ciq_facts.json` `peer_ev_ebitda: missing` ("CIQ 'comps' export not found for NVT") | Relative valuation and SOTP segment multiples |
| Segment-level revenue & EBIT | Y (trailing) | `Capital IQ Financials export → Segments` — FY2025: Systems Protection revenue 2,592.9 / operating profit 537.0; Electrical Connections 1,300.2 / 372.6; unallocated corporate −123.8 and unallocated intangible amortization −147.1 | Sum-of-the-parts |
| Dividend / buyback data | Y | `Capital IQ Financials export → Cash Flow` — LTM common dividends paid 132.9, repurchases 58.0; `Q2 FY26 10-Q` — cash dividends 0.21/share in Q2 2026 | Shareholder-yield read |

## 4. Cross-Module Availability

| Cross-Module Output | Available? (Y/N) |
|---|---|
| business-model/03_segment-map.md | Y |
| business-model/08_competitive-map.md | Y |
| business-model/07_business-quality.md | Y |
| business-model/09_moat.md | Y |
| business-model/10_external-dependency.md | Y |
| earnings/01_historical-financials.md | Y |
| earnings/04_guidance-consensus.md | Y |
| earnings/03_margin-drivers.md | Y |
| earnings/07_earnings-sensitivity.md | Y |
| earnings/06_earnings-quality.md | Y |

Also present in this run root and required by the module's Cross-Module Inputs rules: `balance-sheet-survival/01_capital-structure-and-leverage.md` (the **canonical** filing-based gross/net-debt figure `01` must adopt ahead of the CIQ vendor aggregate), the rest of `balance-sheet-survival/` (00, 02–06, 99), the full `management-governance/` module (00–12, 99 — read `04_ownership-and-insider-behavior.md` and `99` for any RF-OWN-004 unaligned-owner flag), and `competitive-intel/`.

## 5. Partial-Data Flags

| Missing Data | Applies? (Y/N) | Affected Agents | Cap Applied |
|---|---|---|---|
| No current price | **N** — a pool-verified price exists (USD 171.16, close 2026-08-12), but it is **stale** | 01, 05, 07, 99 | The no-price cap does **not** bind; margin of safety and downside-to-bear remain assessable. The **stale pool-verified price** cap binds instead: as-of is ~18–19 trading days before the run date (>15), so **valuation confidence max 60**, `01` must document a refresh attempt, and the price-relative reads carry a mandatory inline staleness flag |
| No consensus / forward estimates | N | 02, 03, 04, 05 | none |
| No peer data | **Y** — peer *multiples* absent; only a named-competitor list with LTM revenue | 03, 06 | **Overall usefulness max 70**; `03` runs on own history unless peer multiples are web-sourced and labelled unverified; `06` segment multiples must be justified from named comparables or marked low-confidence |
| No segment-level data | N — two reportable segments with revenue, operating profit, assets and D&A | 06 | none, but **no forward (NTM/FY+1) segment estimates exist in the pool**, so `06` must apply the forward-basis hard rule and suppress rather than publish a trailing-earnings breakup as a weighted method |
| No balance sheet / capital structure | N | 01, 04, 06 | none |
| No cash flow statement | N | 04 | none |

Two further caps flagged for the synthesizer, from evidence rather than absence:
- **Short own-history multiple window.** The Multiples tab carries only ~7 quarterly closes (<8 quarters ≈ 2 years). `ciq_facts.json` `range_position` itself reads "LOW-CONFIDENCE (6 closes <8q ≈2y) — floor read unreliable". `02` must state this limitation rather than present a 3–5 year band it does not have.
- **Sector Cycle Reality Test inputs are not in the pool.** No sector index / ETF proxy multiple history and no peer-group historical multiples exist here. Unless web-sourced and labelled, `02` and `03` must state *"Not assessable — no sector-level multiple history"*. That honest absence carries no cap by itself, but `99` must record the gap in its Reconciliation rather than skip it silently.

## 6A. Method Readiness Matrix

| Method | Ready? (Y/N) | Blocking Missing Inputs | Notes |
|---|---|---|---|
| Own-history multiples | **Y (limited)** | 3–5 year multiple history; sector-cycle reference | Multiples tab has TEV/LTM & NTM EBITDA/EBIT/Revenue, P/E, P/BV (High/Low/Avg/Close) but only 2025-03-31 → 2026-08-12. Current TEV/LTM EBITDA 26.2x vs a 6-close range of 15.4–30.3x (median 23.2x) — a short, upward-trending window, so the band is a weak anchor |
| Peer relative valuation | **Partial** | Peer multiples / comps export | Named peers exist (`Competitors.rtf`, plus `business-model/08_competitive-map.md`) but no peer valuation data in the pool. Either web-source peer multiples (labelled unverified, dated) or run on own history and flag it |
| Intrinsic DCF (Operating FCFF) | **Y** | Risk-free rate, ERP, beta (not in pool — web-sourced and dated) | Full inputs present: CFO and capex (LTM CFO 690.6, capex 112.9), D&A, effective tax rate 22.4% H1-2026 (`Q2 FY26 10-Q, MD&A`), consensus path to FY2030. For the mandatory Cost-of-Capital Reality Test, the pool contains a company-disclosed rate: **"We utilized a 10.0% discount rate for each reporting unit"** in the goodwill impairment test (`FY24 10-K, Critical Accounting Estimates`) — a **reporting-unit** rate, so `04` must run the scope test before treating it as a group anchor; lease incremental borrowing rates and pension discount rates are also disclosed (`FY24 10-K, lease note`; `→ Pension OPEB` tab) |
| Reverse DCF | **Y** | — | A pool-verified price exists, so "what's priced in" is computable; it must invert `04`'s own WACC, horizon, terminal g and normalized FCF base, and the answer must be flagged as being priced **before** the Maverick announcement |
| SOTP | **Y (trailing only, likely suppressed)** | Forward segment metrics; segment comparables' multiples | Two segments with FY2025 revenue, operating profit, assets and D&A, plus named unallocated buckets (corporate −123.8, intangible amortization −147.1) that must not vanish. But with no forward segment estimates and no peer multiples in the pool, the forward-basis hard rule likely forces "not structurable on a forward basis"; any trailing build is a labelled sanity check only, never a weighted method |

## 6. Sufficiency Verdict

- **Verdict:** Partial
- **Reason:** The earnings base (income statement and cash flow), the capital structure (Jun-30-2026 balance sheet), consensus estimates to FY2030, segment data and a pool-verified price are all present, so at least four valuation methods can run — but the pool holds **no peer valuation multiples**, the price anchor is **~18–19 trading days stale and pre-dates the announced $1.75bn Maverick Power acquisition**, and the own-history multiple window is only ~1.5 years.
- **Methods that can run:** own-history multiples (short window, low-confidence band), peer relative valuation (only if peer multiples are web-sourced and labelled unverified — otherwise own-history only), intrinsic FCFF DCF, reverse-DCF, and SOTP (trailing basis; forward basis likely not structurable).
- **Active partial-data caps:**
  - No peer data → **overall usefulness max 70**; `03` and `06` must flag the substitution.
  - Stale pool-verified price (close 2026-08-12, ~18–19 trading days before 2026-09-07, >15) → **valuation confidence max 60**; `01` must attempt a refresh, and `07`/`99` must carry an inline staleness flag with the as-of date on every price-relative read.
  - Sector Cycle Reality Test inputs absent → no cap by itself, but `02`/`03` must state "Not assessable — no sector-level multiple history" and `99` must record the gap.
- **Critical missing items:**
  - Peer multiples / Capital IQ comps export (`ciq_facts.json`: `peer_ev_ebitda`, `shares_outstanding_m`, `current_price` all `missing` — "CIQ 'comps' export not found for NVT"). Note the price and share count ARE recoverable from the Financials → Key Stats tab (171.16; 161.857939m) and from the Q2 10-Q cover (161,857,939 shares); the sidecar gap is a parser scope limit, not a data gap. The peer multiples genuinely are absent.
  - **FY2025 10-K.** The only annual filing in the pool is the FY2024 10-K; FY2025 annual figures are available only from the Capital IQ workbook (tier-5 vendor) and the 10-Q comparatives. Do not cite FY2025 numbers to a filing that is not here.
  - A **post-2026-08-24 price and post-deal consensus.** Every vendor input pre-dates the Maverick Power announcement, so the EV bridge, the forward estimates and the reverse-DCF all describe a pre-deal nVent.
  - Own multiple history longer than ~7 quarterly closes.



---

## valuation / 01_price-and-capital-structure.md

_Source: `01_price-and-capital-structure.md`_

# Price & Capital Structure — NVT

Evidence binding: frozen. `DATA_PATH` = `NOSTRA_FROZEN_EVIDENCE_ROOT` (cited logically as `data/NVT/`); every read resolved through the bound generation `6db32848…1aecd1e6`. No live `data/NVT/` or `_pool_extracts/` path was read.

Jurisdiction and regime (from `00_valuation-data-triage`, §1A): **US SEC filer** (Forms 10-K / 10-Q), **US GAAP**, reporting currency **USD in millions**, fiscal year ends **31 December**. The issuer is incorporated in Ireland with executive offices in London, but it files US forms and lists on the NYSE — US form names are correct here, no local-equivalent substitution needed (CLAUDE.md §27).

---

## 1. Current Price

| Field | Value | Source | As-of Date |
|---|---|---|---|
| **Decision line** (ticker · venue · currency) | **NVT · New York Stock Exchange · USD** — Ordinary Shares, nominal value $0.01 per share | `Q2 FY26 10-Q, cover page` ("Securities registered pursuant to Section 12(b): Ordinary Shares … NVT … New York Stock Exchange") | 30-Jun-2026 filing |
| Current price (**canonical anchor**) | **USD 171.16** | `Capital IQ Financials export → Key Stats, Current Capitalization` (Share Price 171.16); the same close ties exactly to `→ Multiples`, final column, TEV/LTM EBITDA Close 26.2436x and P/LTM EPS Close 47.5188x | **Close 2026-08-12** |
| Currency | USD | `Capital IQ Financials export → Key Stats` ("Currency: USD"); `Q2 FY26 10-Q` financial statements | — |
| Price basis (last close / intraday / indicative) | **Last close, pool-sourced, as-of date CONFIRMED by the export itself** | The `→ Multiples` tab's final column is headed `2026-08-12` and its Close values reproduce the Key Stats current-capitalization multiples to six decimals — so the workbook timestamps the quote; this is not a download date | 2026-08-12 |
| Refresh quote (**indicative, not the anchor**) | **USD 156.03** — corroborated by two independent web sources at the same figure (0.0% divergence) | `Web: stockanalysis.com quote page, retrieved 2026-09-07` ("Last close $156.03, as of September 4, 2026, 4:00 PM EDT"); corroborated by `Web: investing.com NVT page, retrieved 2026-09-07` ($156.03, "Closed 04/09") | Close **2026-09-04** |

**Single listed line — no cross-line issue.** nVent Electric plc has one class of ordinary shares registered under Section 12(b), trading as NVT on the NYSE in USD [`Q2 FY26 10-Q, cover page`]. There is no second share class, no dual A/H listing, no ADR and no GDR, so there is no ratio to apply, no FX conversion, and no cross-line premium/discount to reconcile. Every fair value, margin of safety, downside-to-bear and yield in this run is denominated in this line.

| Listed line | Ticker · venue | Currency | Price | As-of | Premium / (discount) vs decision line, same-currency | Notes for a holder of this line |
|---|---|---|---:|---|---:|---|
| Ordinary Shares $0.01 par (the decision line) | NVT · NYSE | USD | 171.16 | 2026-08-12 | — (is the decision line) | Only listed line |
| — | — | — | — | — | — | No other listed line exists |

### Price staleness (quantitative)

- Anchor as-of: **2026-08-12 close**. Run date: **2026-09-07**.
- Age = **26 calendar days**. In trading days: 26 × 5/7 ≈ **18.6**; counted directly (13 Aug through 4 Sep, with 7 Sep a US market holiday) = **17 trading days**. Either method exceeds the **15-trading-day** tier.
- **Refresh attempted, and here is the result.** No fresher price exists anywhere in the data pool — the pool holds exactly two price marks, both from Capital IQ, and both pre-date the run: `Financials → Key Stats / Multiples` at 171.16 (2026-08-12) and `Estimates → Consensus` "Latest Price/Last Close Price 170.70/171.16" (export dated to ~2026-08-07 by its own Recent-Changes tab). A web refresh returned **USD 156.03 as of the 2026-09-04 close**, confirmed at the identical figure by two independent sources. Per MODULE_RULES ("Price freshness — re-anchor, don't just cap", clause 1), an indicative web quote does **not** replace a pool quote as the anchor: **the pool price of 171.16 remains the `pool-verified` anchor**, and the fresh quote is carried alongside, labelled `Indicative price, web-sourced as of 2026-09-04 close, not from data pool — unverified`.
- **The drift is material and must not be buried.** 156.03 vs 171.16 is **−8.84%** — enough to move every margin-of-safety and downside-to-bear read by roughly nine percentage points. Per MODULE_RULES clause 2, **`07` and `99` must present the price-relative reads at BOTH prices, each labelled with its price and as-of date, and lead with the fresher read.** Both bridges are built in §3 and §4 below so no downstream agent has to re-derive them.
- **Cap handed forward:** stale `pool-verified` price, as-of known and > 15 trading days ⇒ **valuation confidence max 60** at `99`, and a mandatory inline staleness flag (stating the 2026-08-12 as-of date and the drift risk) on every price-relative read in `07` and `99` (MODULE_RULES → Score-Cap rules). This is the staleness cap, **not** the no-price cap: margin of safety and downside-to-bear remain assessable.
- **One sequencing fact downstream agents need.** The anchor (2026-08-12) and every consensus mark in this pool (to 2026-08-07) **pre-date** the Maverick Power acquisition announced **2026-08-24** ($1.75bn cash plus up to $550m earnout, close expected Q4 2026, funded from cash on hand and new debt) [`nVent news release, 2026-08-24`]. The indicative refresh quote (2026-09-04) **post-dates** it. Stating this is a data fact about what each price knew, not a valuation judgment.

**Vendor-export internal inconsistency (data-quality note, not a defect in the anchor).** The Estimates workbook carries three different price marks at once: "Latest Price" 170.70, "Last Close Price" 171.16, and a "Potential Upside/Diff. from Target Price" of 22.74% / 37.44 against a mean target of 202.13 — which back-solves to a price of **164.69** (202.13 − 37.44 = 164.69; 37.44 ÷ 164.69 = 22.73%), a price mark neither of the other two fields uses [`Capital IQ Estimates export → Consensus, Market Summary block`]. The Estimates workbook's fields were therefore refreshed at different moments. The Financials workbook's 171.16 is preferred as the anchor because its as-of date is explicitly carried in the Multiples tab's column header and its multiples reconcile to it exactly.

---

## 2. Share Count

| Field | Value | Source |
|---|---:|---|
| Basic shares outstanding (as-of 30-Jun-2026) | **161,857,939** (161.858m) | `Q2 FY26 10-Q, cover page` ("On June 30, 2026, 161,857,939 shares of the registrant's common stock were outstanding") |
| Basic shares outstanding — vendor cross-check | 161.857939m | `Capital IQ Financials export → Key Stats, Current Capitalization` (Shares Out.) — agrees to the share |
| Basic weighted-average shares (Q2 2026 / H1 2026) | 161.8m / 161.8m | `Q2 FY26 10-Q, Note 4 (Earnings Per Share)` |
| Diluted weighted-average shares (Q2 2026 / H1 2026) | **164.1m / 164.1m** | `Q2 FY26 10-Q, Note 4 (Earnings Per Share)` |
| Options/RSUs/PSUs — dilutive increment (company's own treasury-stock-method calculation) | **+2.3m** (Q2 2026; +2.3m H1 2026) | `Q2 FY26 10-Q, Note 4` ("Dilutive impact of stock options, restricted stock units and performance share units") |
| Anti-dilutive options excluded | 0.2m (Q2 2026) | `Q2 FY26 10-Q, Note 4` |
| Convertibles / potential shares | **None.** The debt note lists only a revolving credit facility, a term loan and three tranches of fixed-rate senior notes — no convertible instrument | `Q2 FY26 10-Q, Note 10 (Debt)` |
| **Fully diluted shares (TSM + if-converted)** | **164.2m** = 161.858m period-end basic outstanding + 2.3m company-computed TSM dilutive increment; no converts to add | derived from `Q2 FY26 10-Q, cover page` + `Note 4` |
| **Share count used for market cap** | **161.858m** (period-end shares outstanding) | MODULE_RULES → Fully Diluted Equity Rules 1: market cap uses the most recent "as of" outstanding count, not a period weighted-average |
| **Share count used for per-share fair value** | **164.2m** (fully diluted) | MODULE_RULES → Fully Diluted Equity Rules 2: options/RSUs/PSUs via the treasury stock method, using the company's own disclosed dilutive increment |

**Share Count Reconciliation Table**

| Step | Shares (m) | Source |
|---|---:|---|
| Basic shares outstanding, 30-Jun-2026 | 161.858 | `Q2 FY26 10-Q, cover page` |
| + Options / RSUs / PSUs (treasury stock method, company-computed) | 2.300 | `Q2 FY26 10-Q, Note 4` |
| + Convertibles (if-converted) | 0.000 | none exist — `Q2 FY26 10-Q, Note 10` |
| **= Fully diluted shares** | **164.158 ≈ 164.2** | derived |

**The basic-to-diluted gap is small: 2.3m shares, or 1.42% of the basic count.** It is not material enough to change a valuation verdict, but the per-share fair value must still divide by 164.2m, not 161.9m, or every per-share level is overstated by ~1.4%. The company's own diluted weighted-average (164.1m) sits 0.1m below the 164.2m fully diluted count because the weighted average is measured over a period while the outstanding count is a point in time; either is defensible and the difference is 0.06%. This report uses **164.2m** for per-share fair value and states it once so every downstream agent reuses it (MODULE_RULES → Reconciliation Gate 4).

**One forward-looking share-count fact, flagged not modelled.** On 2026-05-16 the Board authorised repurchases of up to **$500.0m** of ordinary shares; the authorisation began 2026-07-23 and expires 2029-07-22 [`Q2 FY26 10-Q, Note 12` block covering share repurchase]. LTM repurchases through 30-Jun-2026 were $58.0m [`Capital IQ Financials export → Cash Flow`, LTM Jun-30-2026]. No buyback beyond the balance-sheet date is reflected in any count above, and none is assumed.

---

## 3. Market Capitalization

`Market cap = shares outstanding × price`

**Canonical (pool-verified anchor, 2026-08-12 close):**

`161.857939m × USD 171.16 = USD 27,703.6m`

Tie-out: `Capital IQ Financials export → Key Stats` reports Market Capitalization **27,703.604839**. This report's arithmetic reproduces it exactly, so the vendor's read and this agent's read agree to the cent.

**At the indicative refresh price (web-sourced, 2026-09-04 close — labelled, not the anchor):**

`161.857939m × USD 156.03 = USD 25,254.7m`

Cross-check: the web source's own displayed market cap of $25.25bn matches this arithmetic, and its shares-outstanding figure of 161.86m matches the 10-Q cover page — corroboration that the web quote is on the same share base, not a different one [`Web: stockanalysis.com quote page, retrieved 2026-09-07`].

Difference between the two market caps: **−$2,448.9m (−8.84%)**.

---

## 4. Enterprise Value Bridge

`EV = market cap + total debt + minority interest + preferred equity − cash & equivalents − short-term investments`

**Canonical bridge — at the pool-verified anchor price of USD 171.16 (2026-08-12), balance sheet as of 30-Jun-2026, USD millions:**

| Component | Amount | Source |
|---|---:|---|
| Market capitalization | 27,703.6 | §3 above: 161.857939m × 171.16 [`Capital IQ Financials export → Key Stats`, close 2026-08-12] |
| + Total debt (short + long term) — **canonical, filing debt-note basis** | **1,492.4** | `Q2 FY26 10-Q, Note 10 (Debt)`, "Total debt 1,492.4" (carrying value net of $7.6m issuance costs/discounts on $1,500.0m principal). Ties to the balance sheet: current maturities and short-term borrowings 13.8 + long-term debt 1,478.6 = 1,492.4 [`Q2 FY26 10-Q, Condensed Consolidated Balance Sheets`]. Adopted from `balance-sheet-survival/01_capital-structure-and-leverage.md`, Leverage Anchor Summary |
| + Minority / non-controlling interest | **0.0** | `Q2 FY26 10-Q, Condensed Consolidated Balance Sheets` — the equity section is ordinary shares 1.6 + additional paid-in capital 2,035.4 + retained earnings 1,977.7 + accumulated other comprehensive loss (27.8) = total equity 3,986.9, with **no** non-controlling-interest line; corroborated by `Capital IQ Financials export → Key Stats` ("Total Minority Interest –") |
| + Preferred equity | **0.0** | `Q2 FY26 10-Q, Condensed Consolidated Balance Sheets` — no preferred line; corroborated by `Capital IQ Financials export → Key Stats` ("Pref. Equity –") |
| + Operating lease liabilities (optional adjustment — **NOT taken in the canonical bridge**) | (140.5) | `Q2 FY26 10-Q, lease note`: current operating lease liabilities 33.0 + non-current 107.5 = 140.5. Shown as a labelled variant below, not in the canonical line |
| + Underfunded pension / other long-term obligations (**NOT taken**) | (133.3) | `Q2 FY26 10-Q, Condensed Consolidated Balance Sheets`, "Pension and other post-retirement compensation and benefits 133.3" — see the not-made-adjustments note below |
| − Cash & equivalents | **(256.0)** | `Q2 FY26 10-Q, Condensed Consolidated Balance Sheets`, "Cash and cash equivalents 256.0" |
| − Short-term investments | **(0.0)** | None on the balance sheet; `Capital IQ Financials export → Balance Sheet` reports "Cash & Short Term Investments 256.0", i.e. all cash and no investments |
| − Long-term marketable securities | **(0.0)** | `Capital IQ Financials export → Key Stats` ("Long Term Marketable Securities –") |
| − Equity-method investments | **(0.0)** | No equity-method investment line appears on the balance sheet; other non-current assets are 224.6 and are not identified as equity-method holdings [`Q2 FY26 10-Q, Condensed Consolidated Balance Sheets`] |
| **= Enterprise value (EV) — canonical** | **28,940.0** | 27,703.6 + 1,492.4 + 0.0 + 0.0 − 256.0 − 0.0. No plug (MODULE_RULES → Reconciliation Gate 2) |

**Bridge at the indicative refresh price (USD 156.03, 2026-09-04 close — labelled, not the anchor):**

`25,254.7 + 1,492.4 + 0.0 + 0.0 − 256.0 = **USD 26,491.1m**`

**Lease-inclusive variant, for comparability with the vendor's TEV only:**

`28,940.0 + 140.5 operating lease liabilities = **29,080.5**` — which reproduces `Capital IQ Financials export → Key Stats`, "Total Enterprise Value (TEV) 29,080.504839", to the cent. Use this figure **only** when reading a Capital IQ multiple that was itself computed on TEV (for example the TEV/LTM EBITDA of 26.24x); do not mix it with the canonical 28,940.0.

### Canonical debt source and the vendor reconciliation (CLAUDE.md §15, MODULE_RULES → Cross-Module Inputs)

`balance-sheet-survival/01_capital-structure-and-leverage.md` ran in this run root, and its Leverage Anchor Summary designates **gross debt of $1,492.4m on the filing debt-note basis** as canonical. That figure is used above. This agent also holds a data-vendor aggregate — `ciq_facts.json` `total_debt_m` = **1,632.9** [`CIQ Financials → Balance Sheet 'Total Debt'`] — and it is **not** silently preferred. **The gap is exactly $140.5m, and it is entirely operating-lease liabilities**: 1,492.4 debt-note total + 33.0 current operating lease liabilities + 107.5 non-current operating lease liabilities = 1,632.9 [`Q2 FY26 10-Q, lease note` and `Note 10`]. This is a definitional difference, not a misread of the workbook — the sidecar's read of the vendor file is accepted as accurate, and the §4 source hierarchy decides which SOURCE wins: the filing's own debt note. The same reconciliation is carried in `earnings/01_historical-financials.md` §1 and in `balance-sheet-survival/01` §7, so all three modules now stand on one number.

### Cash quality — what is netted, and what is flagged

Only genuine operating cash is netted. All $256.0m is "Cash and cash equivalents" on the face of the balance sheet; there are **no** short-term investments, **no** financial-subsidiary investment portfolio, **no** margin balances and **no** long-tenor mark-to-market securities to strip out, so the vendor's "Cash & Short Term Investments 256.0" and the filing's cash line are the same money. Nothing was adopted uncritically.

**But $79.6m of that $256.0m — 31.1% — is not freely movable.** In the company's own words: "*we had $256.0 million of cash on hand, of which $79.6 million is held in certain countries in which the ability to repatriate is limited due to local regulations or significant potential tax consequences*" [`Q2 FY26 10-Q, MD&A, Liquidity and Capital Resources`]. The comparable a year and a half earlier was $53.2m of $131.2m (40.5%) [`FY24 10-K, MD&A, Liquidity and Capital Resources`]. Netting that trapped balance against holding-company debt assumes free movement the filing explicitly qualifies. Two consequences, both stated rather than buried:

- **EV both ways.** Canonical EV nets the full $256.0m: **28,940.0**. Netting only the $176.4m of freely usable cash gives **29,019.6** (+79.6). **The canonical figure is 28,940.0** — the strict §15 basis nets cash and equivalents as reported, and the trapped balance is a real asset of the group even if it is costly to move; the conservative variant is the one to reach for in a stress case, and `balance-sheet-survival/03_liquidity-runway` and `/06_downside-stress-test` own that read.
- The revolving credit facility's undrawn $600.0m capacity [`Q2 FY26 10-Q, Note 10`] is **liquidity, not cash**, and is nowhere in this bridge.

### Adjustments NOT made, and why

- **Operating leases ($140.5m) are not added to debt.** Under US GAAP the company's own debt note excludes them, and CLAUDE.md §4 puts the filing above the vendor aggregate. The lease-inclusive variant is shown above (29,080.5) so any vendor-computed TEV multiple stays comparable.
- **Finance leases (~$17.8m, per `balance-sheet-survival/01`) are not added.** Immaterial at 0.06% of EV.
- **Underfunded pension and other post-retirement benefits ($133.3m) are not added.** This is the balance-sheet liability, not a measured funding shortfall on a valuation basis, and the pool has no FY2025 10-K pension note to size it properly (the only 10-K in the pool is FY2024). Adding it would raise EV by 0.46%. Flagged, not taken.
- **Deferred tax liabilities ($232.0m) are not added.** Standard practice excludes them from EV; they are not a claim with a fixed maturity.
- **The Maverick Power acquisition is NOT in this bridge, and must not be quietly folded in.** Announced 2026-08-24 for $1.75bn cash plus up to $550m of earnout, close expected Q4 2026, funded from cash on hand and new debt [`nVent news release, 2026-08-24`]. It had not closed as of the run date, it is not on the 30-Jun-2026 balance sheet, and the anchor price pre-dates the announcement. `balance-sheet-survival/01` publishes a **labelled pro-forma** net debt of ~$2,986.4m and pro-forma net leverage of ~2.43x (reported EBITDA basis) for it — that figure is pro-forma arithmetic on an undisclosed financing mix, is explicitly *"Inference, not from filings"*, and may be used only with that label attached. **The canonical EV above is pre-deal.**

---

## 5. Net Debt & Leverage Snapshot

| Metric | Value | Source |
|---|---:|---|
| Total debt (canonical — §4 above) | **1,492.4** | `Q2 FY26 10-Q, Note 10 (Debt)`; adopted from `balance-sheet-survival/01`, Leverage Anchor Summary |
| Cash & equivalents | **256.0** | `Q2 FY26 10-Q, Condensed Consolidated Balance Sheets` |
| **Net debt (strict, §15: total debt − cash & equivalents) — CANONICAL** | **1,236.4** | 1,492.4 − 256.0. Matches `balance-sheet-survival/01` §7 and `earnings/01_historical-financials.md` §2 exactly |
| − Liquid short-term investments (if netted) | **0.0** | nVent holds none [`Q2 FY26 10-Q` balance sheet; `Capital IQ Financials export → Balance Sheet`] |
| **Net debt (broad, incl. investments)** | **1,236.4 — identical to strict** | With zero short-term investments the broad and strict bases coincide. Stated so no downstream agent invents a difference |
| *Memo:* net debt — conservative variant, excluding the $79.6m of trapped cash | 1,316.0 | 1,492.4 − 176.4. Basis: strict, on freely usable cash only. `balance-sheet-survival/03` and `/06` use this |
| *Memo:* net debt — Capital IQ vendor variant (**do not headline**) | 1,376.9 | `ciq_facts.json` `net_debt_m`; lease-inclusive basis: 1,492.4 + 140.5 leases − 256.0 = 1,376.9, reconciled exactly |
| Net debt / latest EBITDA — **reported (GAAP-derived) LTM EBITDA** | **1.15x** | 1,236.4 ÷ 1,074.6. EBITDA from `ciq_facts.json` `ltm_ebitda_m` [`CIQ Financials → Income Statement 'EBITDA', LTM 12 months Jun-30-2026`] — a tier-5 vendor figure, cited as such |
| Net debt / latest EBITDA — **company-adjusted LTM EBITDA** | **1.16x** | 1,236.4 ÷ 1,061.5, per `balance-sheet-survival/01` §7 (that agent computed the Q2 FY26 component from the 10-Q's own tables; carry its caveat) |
| Net debt / **mid-cycle (normalised) EBITDA** | **1.43x** | 1,236.4 ÷ 863.6, where 863.6 is the three-year average of reported EBITDA (FY2024 675.6, FY2025 840.5, LTM 1,074.6) per `balance-sheet-survival/01` §7. A labelled normalisation, not a forecast |

**Basis discipline (CLAUDE.md §15).** The **strict** row is the §15 default and is the figure the Anchor Summary carries forward. Because there are no short-term investments, the broad basis is arithmetically identical here — which removes the usual trap, but the label is still stated every time. The vendor's 1,376.9 is a **lease-inclusive** figure and is never to be labelled "strict".

**Cycle caveat that must travel with every leverage figure above.** Both the reported ($1,074.6m) and adjusted ($1,061.5m) LTM EBITDA bases sit at a **cyclical peak** — LTM revenue of $4,834m is 24% above FY2025's $3,893m and 61% above FY2024's $3,006m [`Capital IQ Financials export → Key Stats`]. Quoting 1.15x without the 1.43x mid-cycle counterpart understates the leverage a downturn would reveal. This is `balance-sheet-survival/01`'s caveat and it is propagated here verbatim rather than dropped in transit (CLAUDE.md §3).

---

## 6. Per-Share Reference Values

All per-share figures below divide by the **fully diluted count of 164.2m** (the per-share fair-value count fixed in §2), so they are directly comparable with every per-share fair value downstream.

| Metric | Per Share | Source |
|---|---:|---|
| Book value per share | **USD 24.28** | Total equity 3,986.9 ÷ 164.2m [`Q2 FY26 10-Q, Condensed Consolidated Balance Sheets`]. On the 161.858m basic count it is USD 24.63 |
| Tangible book value per share | **USD (2.94) — negative** | (Total equity 3,986.9 − goodwill 2,676.3 − intangibles, net 1,793.3) = (482.7) ÷ 164.2m [`Q2 FY26 10-Q, Condensed Consolidated Balance Sheets`]. Corroborated qualitatively by `Capital IQ Financials export → Key Stats`, which reports Price/Tangible BV as "NM" |
| Net debt per share (strict, §15 basis) | **USD 7.53 of net debt** | Net debt 1,236.4 ÷ 164.2m. nVent is **not** net cash |
| *Memo:* price-to-book at the anchor price | 7.05x | 171.16 ÷ 24.28. Vendor cross-check: `Capital IQ Financials export → Key Stats` P/BV 6.95x, computed on the basic count (171.16 ÷ 24.63) — the 0.10x gap is purely the share-count basis, not a data disagreement |

**Tangible book value is negative by $482.7m, and that is a structural fact about this balance sheet, not a rounding artefact.** Goodwill ($2,676.3m) and intangibles ($1,793.3m) together are $4,469.6m against total equity of $3,986.9m — the product of an acquisition programme that spent roughly $1,120m (FY2023), $678m (FY2024) and $976m (FY2025) [`earnings/01_historical-financials.md` §5]. Any downstream method that would use tangible book as a floor (P/TBV, a liquidation-style anchor) **cannot run on this company**; that is why the vendor reports P/Tangible BV as "NM" in every column. This is an observation about which methods are available, not a valuation judgment.

---

## 6A. Distribution Basis

nVent pays a quarterly cash dividend, and a shareholder-yield read is contemplated in the valuation triage (`00_valuation-data-triage` §3), so the basis is fixed here once and used verbatim downstream.

| Field | Value | Source |
|---|---|---|
| Yield basis (trailing / forward-declared / forward-estimated) | **Both stated. Trailing** = $0.82 per share actually paid in the twelve months to 30-Jun-2026. **Forward-declared run-rate** = $0.84 per share ($0.21 × 4), which is a run-rate extrapolation of the latest declared quarterly rate, **not** a declared annual amount | Trailing: H1-2026 cash dividends paid per ordinary share $0.42 [`Q2 FY26 10-Q, income statement`], plus $0.20 + $0.20 for the two 2025 payment quarters [`FY24 10-K, subsequent-events dividend note`; `Q1 FY26 10-Q, dividend note`]. Cross-check: LTM common dividends paid $132.9m ÷ ~161.9m shares = $0.821 [`Capital IQ Financials export → Cash Flow`, LTM Jun-30-2026] |
| Amount per share and the period it covers | **$0.21 per ordinary share** for the quarter; declared 2026-05-16, paid 2026-08-07 | `Q2 FY26 10-Q, Note 12 (Dividends payable)`: "On May 16, 2026, the Board of Directors declared a quarterly cash dividend of $0.21 per ordinary share payable on August 7, 2026" |
| Ex-date and record date of the most recent distribution | **Record date: 2026-07-24** (close of business). **Ex-date: not disclosed in the data pool** — the filing states the record date only | `Q2 FY26 10-Q, Note 12 (Dividends payable)` |
| Is the next distribution still available to a buyer today? (Y / N) | **N.** The record date of 2026-07-24 has passed and the dividend was paid on 2026-08-07 — a buyer on 2026-09-07 does not receive it. The next declaration (a board action expected around Q3-2026) **is not in this data pool**, so no forward distribution is confirmed as available | `Q2 FY26 10-Q, Note 12`; pool inventory per `00_valuation-data-triage` §1 |
| Gross or net (withholding; depositary fee) | **Gross.** The shares are ordinary shares listed directly on the NYSE — **not an ADR or GDR — so there is no depositary fee and no ratio adjustment** [`Q2 FY26 10-Q, cover page`]. The issuer is Irish-incorporated [`Q2 FY26 10-Q, cover page`], so Irish dividend withholding may apply to some holders, but **the withholding rate and any exemption are not disclosed anywhere in this data pool — Not assessable from the pool.** Do not assert a net yield |
| Yield on the **decision line** at the decision-line price | **Trailing: 0.48%** (0.82 ÷ 171.16). **Forward-declared run-rate: 0.49%** (0.84 ÷ 171.16). At the indicative 2026-09-04 refresh price of 156.03: trailing **0.53%**, run-rate **0.54%** — labelled indicative, not the anchor | derived from the rows above |

**The plain reading: at roughly half a percent, the dividend is not a material part of the return on this line, and the most recent one is already gone.** Its record date passed on 2026-07-24, so it is not income available to a buyer today and must never be presented as a reason to own the stock (CLAUDE.md §16). Any yield quoted downstream must carry the basis (trailing vs forward-declared run-rate), the price and its as-of date, and the gross label.

---

## 7. Anchor Summary (canonical numbers for downstream agents)

**Use these verbatim (MODULE_RULES → Reconciliation Gate 1). Any departure must state its own basis and its reason on the same line.**

- **Reporting currency:** **USD, millions** (per-share in dollars). US GAAP. Fiscal year ends 31 December. Balance-sheet date **30-Jun-2026**.
- **Current price (canonical anchor):** **USD 171.16**, last close **2026-08-12**, **pool-verified** with the as-of date confirmed by the export itself.
- **Price staleness:** **26 calendar days ≈ 17–19 trading days** — beyond the 15-trading-day tier. **Refresh attempted:** no fresher pool quote exists; a corroborated web quote of **USD 156.03 (close 2026-09-04, two independent sources at the identical figure)** was found and is carried as *indicative, web-sourced, not from data pool — unverified*. It does **not** replace the anchor. **The drift is −8.84%**, so `07` and `99` must show every price-relative read at BOTH prices, lead with the fresher one, and carry an inline staleness flag naming the 2026-08-12 as-of date. **Cap: valuation confidence max 60.**
- **Share count used for market cap:** **161.858m** (161,857,939 shares outstanding at 30-Jun-2026) [`Q2 FY26 10-Q, cover page`].
- **Share count used for per-share fair value:** **164.2m fully diluted** = 161.858m + 2.3m options/RSUs/PSUs on the company's own treasury-stock-method calculation; no convertibles exist [`Q2 FY26 10-Q, Note 4` and `Note 10`]. No limitation — the dilution data needed is disclosed.
- **Market cap:** **USD 27,703.6m** at the anchor price. At the indicative 2026-09-04 quote: **USD 25,254.7m** (labelled).
- **Net debt:** **USD 1,236.4m — strict §15 basis** (total debt 1,492.4 − cash 256.0). **Broad basis is identical** (no short-term investments). **This is `balance-sheet-survival/01_capital-structure-and-leverage.md`'s canonical filing-based figure, adopted here, and it agrees with `earnings/01_historical-financials.md` — all three modules stand on one number.**
- **Reconciliation carried forward with the number (not buried in §4/§5):** the Capital IQ vendor aggregate is total debt **1,632.9** / net debt **1,376.9** [`ciq_facts.json`]. **The entire $140.5m gap is operating-lease liabilities** (33.0 current + 107.5 non-current) that the company's own debt note does not classify as debt. The vendor read is accurate for the vendor's own basis; the filing wins under CLAUDE.md §4. Never label 1,376.9 "strict".
- **Enterprise value (EV):** **USD 28,940.0m** at the anchor price (= 27,703.6 + 1,492.4 + 0.0 minority + 0.0 preferred − 256.0 cash). At the indicative 2026-09-04 quote: **USD 26,491.1m** (labelled). **Lease-inclusive variant for reading vendor TEV multiples only: 29,080.5** (ties Capital IQ TEV exactly).
- **Leverage:** net debt / LTM reported EBITDA **1.15x**; / company-adjusted EBITDA **1.16x**; / mid-cycle normalised EBITDA **1.43x**. Both LTM bases are at a **cyclical peak** — quote the mid-cycle figure alongside.
- **Per share (on 164.2m):** book value **USD 24.28**; tangible book value **USD (2.94) — negative**, so no tangible-book floor method is available; net debt **USD 7.53** per share.
- **Pre-deal warning that must travel with every number above:** the anchor price, the consensus set, and this balance sheet all **pre-date the Maverick Power acquisition announced 2026-08-24** ($1.75bn cash + up to $550m earnout, close expected Q4 2026, cash-and-new-debt funded) [`nVent news release, 2026-08-24`]. The EV bridge is **pre-deal**. `balance-sheet-survival/01`'s pro-forma net debt of ~$2,986.4m / ~2.43x is *Inference, not from filings* and may only be used with that label.

### Anchor Block (copy-forward)

- Decision line: **NVT · New York Stock Exchange · USD** (Ordinary Shares, $0.01 nominal) — every downstream fair value, margin of safety, and yield is on THIS line. **Single listed line.**
- Other listed lines: **None** — no second class, no dual listing, no ADR/GDR; no FX conversion and no ratio adjustment apply.
- Price: **USD 171.16** (as-of **2026-08-12 close**, basis: last close, pool-sourced with the as-of date confirmed by the export). Indicative refresh carried alongside: **USD 156.03** (2026-09-04 close, web-sourced, corroborated by two independent sources, **unverified — not the anchor**), a **−8.84%** drift.
- Price-state: **`pool-verified`** — the canonical tag `05`/`07`/`99` read. The no-price cap does **NOT** bind: reverse-DCF (`05`) can run, and margin of safety, downside-to-bear, observed up/down and valuation attractiveness all remain assessable. The **staleness** cap binds instead: valuation confidence **max 60**, with a mandatory inline staleness flag and dual-price presentation in `07`/`99`.
- Currency: **USD** (millions; per-share in dollars). US GAAP, FY ends 31 December.
- Distribution basis: **trailing $0.82/share (12 months to 30-Jun-2026) and forward-declared run-rate $0.84/share ($0.21 × 4)** — most recent distribution $0.21/share, ex-date not disclosed in the pool, **record date 2026-07-24**, **still available to a buyer today: N** (record date passed, paid 2026-08-07), **gross** (no depositary fee — direct NYSE ordinary listing; Irish withholding treatment not disclosed in the pool). Yield on the decision line: **0.48% trailing / 0.49% run-rate at $171.16**.
- Shares (market cap): **161,857,939 (161.858m)** [`Q2 FY26 10-Q, cover page`, as of 30-Jun-2026].
- Shares (per-share fair value): **164.2m fully diluted** [`Q2 FY26 10-Q, Note 4` — 161.858m + 2.3m TSM increment; no convertibles per `Note 10`]. No limitation.
- Market cap: **USD 27,703.6m** at $171.16 · **USD 25,254.7m** at the indicative $156.03.
- Net debt: **USD 1,236.4m — strict §15 basis** (broad basis identical; no short-term investments). Source: `Q2 FY26 10-Q, Note 10` + balance sheet, adopted from `balance-sheet-survival/01`'s canonical filing-based figure — **reconciled and in agreement**. Vendor variant 1,376.9 differs solely by $140.5m of operating leases; do not headline it and never label it "strict".
- EV: **USD 28,940.0m** at $171.16 · **USD 26,491.1m** at the indicative $156.03 · **USD 29,080.5m** lease-inclusive (vendor-TEV-comparable only).
- Key caveats: (1) **price is 26 calendar days / ~17–19 trading days stale** — confidence cap 60, dual-price presentation mandatory; (2) **every input here is pre-Maverick-Power** (announced 2026-08-24, $1.75bn + up to $550m earnout, unclosed); (3) **$79.6m of the $256.0m of cash cannot be readily repatriated** — conservative net debt is 1,316.0; (4) **LTM EBITDA is at a cyclical peak** — carry the 1.43x mid-cycle leverage alongside the 1.15x; (5) **tangible book value is negative ($482.7m)** — no tangible-book floor method is available; (6) the FY2025 10-K is absent from the pool, so no FY2025 figure may be cited to an FY2025 filing.

No valuation judgment is made in this report. Whether $171.16 (or $156.03) is the right price for this company is `02`–`07`'s work, and the rating is the master synthesizer's.



---

## valuation / 02_multiples-own-history.md

_Source: `02_multiples-own-history.md`_

# Multiples — Own History — NVT

**Evidence binding: frozen.** All reads resolved through the bound generation `6db32848…1aecd1e6` (`manifest.json`, `ciq_facts.json`, per-tab extracts). Live `data/NVT/` and `_pool_extracts/` were not read; `data/NVT/` is a citation label only. Web sources are used for ONE input only — the sector-level multiple history required by the Sector Cycle Reality Test (§5) — and are labelled and dated there.

**Reporting basis.** US GAAP, **USD in millions** except per-share. Fiscal year ends 31 December. Business type from `00_valuation-data-triage` §3: **Operating company** — so under the Business-Type Method Map, EV-based multiples (EV/EBITDA, EV/EBIT, EV/Sales), P/E and FCF yield are the valid set. **P/tangible book is not available and is not shown**: tangible book value is **negative $482.7m** (equity 3,986.9 − goodwill 2,676.3 − intangibles 1,793.3), which is why Capital IQ prints "NM" in every column of that row [`01_price-and-capital-structure.md` §6; `Capital IQ Financials export → Multiples`].

**Anchors used verbatim from `01_price-and-capital-structure.md` §7 (MODULE_RULES → Reconciliation Gate 1).** Price **USD 171.16** (close **2026-08-12**, pool-verified, **stale by ~17–19 trading days**); indicative refresh **USD 156.03** (close 2026-09-04, web-sourced, unverified, **−8.84%**); shares for market cap **161.858m**; shares for per-share fair value **164.2m fully diluted**; market cap **USD 27,703.6m**; **canonical EV USD 28,940.0m**; lease-inclusive **TEV USD 29,080.5m** (used ONLY when reading a Capital IQ multiple that was itself computed on TEV); net debt **USD 1,236.4m strict §15 basis** (lease-inclusive vendor variant 1,376.9). No departure from any of these figures is made anywhere below.

---

## 1. Current Multiples

Metric base is the **LTM period 12 months ended 30-Jun-2026** [`Capital IQ Financials export → Income Statement` and `→ Cash Flow`, LTM column]. All figures are **reported (GAAP-derived) vendor figures, not company-adjusted**, except the one row explicitly marked normalized. Forward figures are **consensus mean estimates**, labelled NTM or FY.

| Multiple | Basis (LTM / NTM / FY) | Metric Value | Current Multiple | Source |
|---|---|---:|---:|---|
| **P / E** | LTM, reported diluted EPS excl. extraordinary items | EPS **$3.602** | **47.5x** | 171.16 ÷ 3.601945. `Capital IQ Financials export → Key Stats` (Diluted EPS Excl. Extra, LTM Jun-30-2026). Vendor's own P/LTM EPS Close 47.5188x — ties |
| P / E | **NTM**, consensus | implied NTM EPS **$5.77** | **29.7x** | `Capital IQ Estimates export → Multiples`, NTM Price/Earnings 29.6612x (on the same 171.16 price); implied EPS = 171.16 ÷ 29.6612 |
| P / E | **FY2026E** consensus | EPS **$5.113** | **33.5x** | `Capital IQ Estimates export → Multiples`, FY 2026 P/E 33.4754x; EPS from `→ Key Stats` FY2026E |
| P / E | **FY2027E** consensus | EPS **$6.433** | **26.6x** | `Capital IQ Estimates export → Multiples`, FY 2027 P/E 26.6057x |
| **EV / EBITDA** | LTM, reported | EBITDA **1,074.6** | **26.9x** | 28,940.0 ÷ 1,074.6. EBITDA from `ciq_facts.json` `ltm_ebitda_m` = 1,074.6 [`CIQ Financials → Income Statement 'EBITDA', LTM Jun-30-2026`]. **Vendor's own TEV/LTM EBITDA Close = 26.24x** (`ciq_facts.json` `ev_ebitda_current_x` 26.2) — see the reconciliation note below |
| EV / EBITDA | **NTM**, consensus | implied NTM EBITDA **~1,359.8** | **21.4x** | `Capital IQ Estimates export → Multiples`, NTM TEV/EBITDA 21.3865x (TEV basis); ties exactly to `Financials → Multiples`, TEV/NTM EBITDA Close 2026-08-12 |
| **EV / EBIT** | LTM, reported | EBIT **842.7** | **34.3x** | 28,940.0 ÷ 842.7. Vendor TEV/LTM EBIT Close 34.5087x on TEV 29,080.5 — ties exactly (29,080.5 ÷ 842.7 = 34.51) |
| EV / EBIT | **NTM**, consensus | — | **23.0x** | `Capital IQ Estimates export → Multiples`, NTM TEV/EBIT 23.0219x |
| **EV / Sales** | LTM, reported | Revenue **4,834.0** | **5.99x** | 28,940.0 ÷ 4,834.0. Vendor TEV/LTM Revenue Close 6.0158x on TEV — ties exactly |
| EV / Sales | **NTM**, consensus | — | **4.88x** | `Capital IQ Estimates export → Multiples`, NTM TEV/REV 4.8825x |
| **P / Book** | LTM (balance sheet 30-Jun-2026) | BVPS **$24.28** (equity 3,986.9 ÷ 164.2m) | **7.05x** | `01` §6. Vendor P/BV 6.9487x is the same number on the 161.858m basic count — a share-count basis difference, not a data disagreement |
| P / Tangible Book | — | **negative ($2.94)/share** | **not meaningful** | `01` §6. No tangible-book floor method exists for this company |
| **P / FCF** (and FCF yield) | LTM, §15 basis: FCF = CFO − total capex | FCF **577.7** = 690.6 − 112.9 | **48.0x → FCF yield 2.09%** | `Capital IQ Financials export → Cash Flow`, LTM Jun-30-2026 (Cash from Ops. 690.6; Capital Expenditure −112.9). Market cap 27,703.6 ÷ 577.7. *Do not confuse with the vendor's "Levered Free Cash Flow" 468.2, which is after interest* |
| **Dividend yield** | **Trailing**, gross | $0.82/share paid in the 12 months to 30-Jun-2026 | **0.48%** | `01` §6A. Forward-declared run-rate $0.84 → 0.49%. **The most recent dividend's record date (2026-07-24) has already passed** — this is not income available to a buyer today (CLAUDE.md §16) |

**Reconciliation note the reader needs (CLAUDE.md §5).** My EV/LTM EBITDA of **26.9x** and Capital IQ's own **26.24x** are not the same arithmetic. Two differences, both stated rather than smoothed: (a) I use the canonical EV of 28,940.0, the vendor uses TEV 29,080.5 (which adds the $140.5m of operating leases); (b) more importantly, **the vendor's multiples engine is not using the EBITDA its own Income Statement tab displays** — 29,080.5 ÷ 26.243574 back-solves to an EBITDA of **1,108.1**, against the 1,074.6 printed on the Income Statement and carried in `ciq_facts.json`. The EBIT and revenue multiples tie to six decimals on the same TEV, so the gap is confined to the EBITDA line. Per the run instruction, `ciq_facts.json`'s **26.2** is accepted as the authoritative READ of that workbook and is used unchanged for every band comparison in §2 (matched basis: the whole historical series is computed on the vendor's own convention). My 26.9x is the same company on the filing-consistent EV and the vendor's stated EBITDA. **The 0.7x gap moves nothing in the read below** — both sit in the same part of the range.

**At the indicative refresh price of $156.03 (2026-09-04, web-sourced, unverified — not the anchor):** P/LTM EPS 43.3x, EV/LTM EBITDA 24.5x (26,491.1 ÷ 1,074.6), EV/LTM EBIT 31.4x, EV/LTM Sales 5.48x, P/B 6.43x, trailing dividend yield 0.53%. Every band position in §2 is roughly one-tenth of the range lower at that price; the direction of the read does not change.

---

## 2. Historical Multiple Bands (3–5 years)

### PARTIAL DATA — the 3–5 year band does not exist for this company in this pool

The Capital IQ Multiples tab carries **seven quarterly columns only: 2025-03-31 through 2026-06-30, plus the current column dated 2026-08-12** [`Capital IQ Financials export → Multiples`, tab header "For Quarter Ending"]. That is **six completed quarters ≈ 1.5 years of history** — not the three-to-five years the own-history method is built on. `ciq_facts.json` `range_position` says the same thing in the vendor sidecar's own words: *"LOW-CONFIDENCE (6 closes <8q ≈2y) — floor read unreliable"*. `00_valuation-data-triage` §5 flagged it in advance.

**Consequence, applied (system partial-data rule).** A "mean" computed off six quarters is not a through-cycle anchor, it is a three-point average of one upswing. **No mean/median reversion target is offered as a point or a tight range, and nothing in §4 is a fair-value input for `07`.** What follows is a *directional* read of where the current multiple sits inside a short, one-directional window — and the observed min/max, which `07` may legitimately use as the evidenced outer bounds for its bull and bear multiples (Scenario Construction §2), since those are actual traded levels rather than a derived central tendency.

**Definitions used in every band table below**, so a reader can reproduce each number:
- **Min** = the lowest quarterly *Low* across the six history quarters (an actual intraperiod traded level).
- **Max** = the highest quarterly *High* across the six.
- **Mean** = the simple mean of the six quarterly *Average* values.
- **Median** = the median of the six quarterly *Close* values (this is the basis `ciq_facts.json` uses, so the two reconcile).
- **Current** = the *Close* in the 2026-08-12 column — the same date as the price anchor.
- **Percentile of range** = `(current − min) ÷ (max − min)`, on the Low-to-High basis.
- All rows are Capital IQ's own **TEV** basis (lease-inclusive), so the series is internally consistent; do not mix these with the canonical EV of 28,940.0 without the note in §1.

### 2A. Trailing (LTM) multiples — history window 2025-03-31 → 2026-06-30

| Multiple | Min | Mean | Median | Max | Current | Percentile of Range |
|---|---:|---:|---:|---:|---:|---:|
| P / LTM EPS | 18.35x | 50.25x | 53.96x | 69.36x | **47.52x** | **57%** |
| P / LTM **Normalized** EPS | 27.89x | 50.88x | 54.87x | 77.29x | **58.52x** | **62%** |
| TEV / LTM EBITDA | 13.67x | 21.65x | 23.19x | 32.74x | **26.24x** | **66%** |
| TEV / LTM EBIT | 18.12x | 29.45x | 32.01x | 44.71x | **34.51x** | **62%** |
| TEV / LTM Revenue | 3.19x | 4.88x | 5.17x | 7.24x | **6.02x** | **70%** |
| P / Book Value | 2.30x | 4.40x | 4.52x | 7.85x | **6.95x** | **84%** |

Source for every cell: `Capital IQ Financials export → Multiples`, quarterly High / Low / Average / Close rows, columns 2025-03-31 through 2026-08-12.

**Cross-check against the sidecar.** `ciq_facts.json` `ev_ebitda_percentile` = **0.833**. That is a different, equally valid definition — the *rank* of the current close among the six historical closes (26.24x is above five of six → 5/6 = 83.3%) — not a position within the min-to-max range. Both are reported so neither is mistaken for the other: **rank percentile 83%, range percentile 66%.** The close-only range `ciq_facts.json` quotes (15.4–30.3x, median 23.2x) reproduces exactly from the Close row; my wider 13.67–32.74x band adds the intraperiod highs and lows, which are real traded levels and a fairer statement of what the stock has actually changed hands at.

### 2B. Forward (NTM) multiples — same window, and the more reliable of the two

| Multiple | Min | Mean | Median | Max | Current | Percentile of Range |
|---|---:|---:|---:|---:|---:|---:|
| P / NTM EPS | 14.87x | 25.82x | 26.66x | 38.16x | **29.66x** | **64%** |
| TEV / NTM EBITDA | 12.40x | 18.43x | 18.64x | 27.23x | **21.39x** | **61%** |
| TEV / NTM EBIT | 13.46x | 20.11x | 20.59x | 29.13x | **23.02x** | **61%** |
| TEV / NTM Revenue | 2.82x | 4.19x | 4.26x | 6.06x | **4.88x** | **68%** |

Source: same tab, TEV/NTM and P/NTM rows. The current column ties exactly to the separate `Capital IQ Estimates export → Multiples` NTM row (21.3865x EBITDA, 29.6612x P/E), which is an independent confirmation that the two workbooks are on the same price and the same estimate set.

**Why the forward band deserves more weight than the trailing band here.** The trailing denominators moved violently over this very window for reasons unrelated to how the market prices the company: LTM revenue went from $3,006.1m (FY2024) to $3,893.1m (FY2025) to **$4,834.0m** (LTM Jun-2026), and LTM net income swung from $331.8m to $710.2m to $598.3m as a **$1,584.5m divestiture inflow** and discontinued operations ran through the accounts [`Capital IQ Financials export → Income Statement` and `→ Cash Flow`, Net Cash From Discontinued Ops. and Other Investing Activities, FY2025]. That is why P/LTM EPS ranges from **18.35x to 69.36x** in six quarters — a 3.8-fold swing in a multiple is a statement about the denominator, not about sentiment. The NTM series is not clean either, but it is measured against a forward estimate that was being revised in the same direction the price was moving, so it is the less distorted of the two.

---

## 3. Re-Rating / De-Rating Read

**The stock has re-rated up, and it did so on top of a rising denominator — both halves of the multiple moved the same way.** Take the three most reliable rows. On **TEV/LTM EBITDA**, the current 26.24x sits **+21.2% above its own six-quarter mean of 21.65x** and **+13.2% above its own median close of 23.19x** [(26.2436 − 21.6495) ÷ 21.6495; (26.2436 − 23.1885) ÷ 23.1885]. On **TEV/NTM EBITDA** it is **+16.0% above the mean (18.43x)** and **+14.8% above the median (18.64x)**. On **P/NTM EPS**, 29.66x is **+14.9% above the mean (25.82x)** and **+11.3% above the median (26.66x)**. The one row pointing the other way is **P/LTM EPS at 47.52x, which is −5.4% below its own mean and −11.9% below its own median** — and that row is the least trustworthy of the set, because its denominator contains the discontinued-operations distortion described in §2B. I name it here rather than leave it out (CLAUDE.md §3): the contradicting metric exists, it is a trailing-earnings artefact, and it does not overturn the premium read that four independent forward and trailing rows agree on.

**The scale of the move, stated plainly.** The TEV/LTM EBITDA close went **15.39x (Q1 2025) → 30.25x (Q2 2026) → 26.24x (12-Aug-2026)** — the multiple itself is up roughly **70%** from the start of the window, while LTM EBITDA over broadly the same span rose from $675.6m (FY2024) to $1,074.6m, up **59%** [`Capital IQ Financials export → Income Statement`]. Price × multiple compounding in the same direction is why market cap roughly tripled.

**The most likely reason, with evidence, is mix shift into one end market — not a general cycle turn in nVent's old business.** Infrastructure went from 12% of sales at the 2018 spin to 45% in 2025 to **58.1% of H1 FY26 net sales** [`Q2 FY26 10-Q, Note 2, p.9`; `Q2 FY26 transcript, prepared remarks`], and roughly **94% of Q2 FY26 organic growth came from that single vertical** [`business-model/10_external-dependency.md` §4]. Data-centre sales are guided above $2bn, more than 37% of company sales. The industrial vertical — 32% of 2025 sales — grew only low single digits organically in Q2 FY26 [`June 2026 William Blair deck, slide 4`; `Q2 FY26 transcript`]. So the market is paying an AI-infrastructure multiple for a company whose non-data-centre two-thirds is growing at low single digits. Leverage is not the explanation: net debt/EBITDA is **1.15x strict** today [`01` §5], down from 3.00x at FY2024 [`management-governance/99` §rejector filters], so the re-rating is not a de-gearing story.

---

## 4. Implied Value from Reversion

> **ILLUSTRATIVE ONLY — NOT A FAIR-VALUE INPUT FOR `07`.** The own-history window is **~1.5 years (six quarterly closes)**, well under the ~3-year minimum. A "mean" or "median" struck off six points inside one continuous upswing is not a through-cycle warranted multiple; presenting a point target off it would be false precision of exactly the kind the partial-data rule exists to stop. **No base-case point is named and none should be inferred.** The table below exists so a reader can see the arithmetic and the dispersion, and so `07` can see how far the levels move on a reversion assumption it should *not* adopt.

**Convention (stated once, used in every row).** These are Capital IQ TEV-basis multiples, so `implied TEV = multiple × metric`, then `implied equity = TEV − lease-inclusive net debt 1,376.9` (the matched basis for a TEV multiple — NOT the strict $1,236.4m, and this is the explicit one-line reason required by Reconciliation Gate 1), then `÷ 164.2m fully diluted shares`. Equity-basis multiples (P/E, P/B) are applied straight to the per-share metric.

**Trailing basis (least reliable — see §2B):**

| Multiple | Reversion Target (mean / median) | Implied EV or Equity | Implied Price/Share | vs Current Price ($171.16 / $156.03) |
|---|---:|---:|---:|---:|
| TEV / LTM EBITDA (metric 1,074.6) | mean 21.65x | TEV 23,264 → equity 21,887 | **$133.30** | −22.1% / −14.6% |
| TEV / LTM EBITDA | median 23.19x | TEV 24,918 → equity 23,542 | **$143.37** | −16.2% / −8.1% |
| TEV / LTM EBIT (metric 842.7) | mean 29.45x | TEV 24,818 → equity 23,441 | **$142.76** | −16.6% / −8.5% |
| TEV / LTM EBIT | median 32.01x | TEV 26,977 → equity 25,600 | **$155.91** | −8.9% / −0.1% |
| TEV / LTM Revenue (metric 4,834.0) | median 5.17x | TEV 24,986 → equity 23,609 | **$143.79** | −16.0% / −7.8% |
| P / LTM Normalized EPS (metric $2.925) | median 54.87x | equity, per share | **$160.47** | −6.2% / +2.8% |
| P / LTM EPS (metric $3.602) | median 53.96x | equity, per share | **$194.36** | +13.5% / +24.6% |
| P / Book (metric $24.28) | median 4.52x | equity, per share | **$109.82** | −35.8% / −29.6% |

**Forward (NTM) basis — the same exercise on the less-distorted denominator:**

| Multiple | Reversion Target (mean / median) | Implied EV or Equity | Implied Price/Share | vs Current Price ($171.16 / $156.03) |
|---|---:|---:|---:|---:|
| TEV / NTM EBITDA (metric ~1,359.8) | mean 18.43x | TEV 25,059 → equity 23,682 | **$144.23** | −15.7% / −7.6% |
| TEV / NTM EBITDA | median 18.64x | TEV 25,341 → equity 23,964 | **$145.94** | −14.7% / −6.5% |
| P / NTM EPS (metric $5.771) | mean 25.82x | equity, per share | **$148.97** | −13.0% / −4.5% |
| P / NTM EPS | median 26.66x | equity, per share | **$153.81** | −10.1% / −1.4% |

**Base-case point: NOT PRODUCED.** Per the partial-data rule the own-median-implied value on the most reliable multiple (TEV/NTM EBITDA, $145.94) is shown above but is **explicitly withheld as a base-case fair-value input**; it is a directional marker only.

**Dispersion, shown separately as the exhibit.** Across the median-reversion rows the illustrative implied values run **$109.82 (P/Book) to $194.36 (P/LTM EPS)** — a high-to-low field of **77%** of the low value. Dropping the two rows this business type makes meaningless or distorted (P/Book, because $4,469.6m of the $3,986.9m equity base is goodwill and intangibles; and P/LTM EPS, for the discontinued-operations reason in §2B), the remaining five cluster **$143.37 to $160.47** — a 12% field. That tightness is not corroboration: all five are drawn from the same six quarters of the same stock, so they are one read expressed five ways, not five independent reads (CLAUDE.md §16 independence check).

**The reversion assumption, tested rather than assumed.** Reverting to the own mean or median assumes the multiple this company *warrants* has not structurally changed since early 2025. **The evidence says it has changed, and the direction of the change is genuinely ambiguous — which is precisely why no point is published here:**
- *Arguing the warranted multiple is genuinely higher now:* the revenue mix moved from 12% infrastructure at spin to 58.1% of H1 FY26 [`Q2 FY26 10-Q, Note 2, p.9`]; return on capital rose from ~6.3% (FY2023–FY2024) to **9.5% LTM** and EBITDA margin from 19.7% to 22.2% [`Capital IQ Financials export → Ratios`, tier-5 vendor]; net leverage fell from 3.00x to 1.15x [`01` §5]; and the Thermal Management divestiture removed a slower business.
- *Arguing it has not, or should be lower:* `business-model/07_business-quality.md` scores the aggregate at **41/100**, with **cyclicality at 30/100 — its lowest row** — and states that today's 9.5% return is roughly **1.5x** the ~6.4% pre-boom level, "driven by volume running ahead of installed capacity during a build-out"; `09_moat.md` explicitly labels the LTM figure a **cycle peak** and refuses to use it raw. `business-model/07` §4 records the §24 Filter 5 trip: *"this is a sector / technology-cycle bet, not a durable compounder"*, with the CEO's own words that liquid cooling is "maybe it's now 10% to 15% of cooling in data centers" and the 800-volt rack architecture still unsettled [`Q2 FY26 transcript, Q&A`]. **A peak multiple applied to a peak denominator is the double-count this method is most exposed to**, and both halves of every EV/EBITDA figure above sit at a high.

**Two further reasons every number in this section is pre-dated, not wrong but incomplete.** (1) The anchor price (2026-08-12) and the entire consensus set (to 2026-08-07) **pre-date the Maverick Power acquisition announced 2026-08-24** — $1.75bn cash plus up to $550m earnout, ~$700m of target 2026 revenue, close expected Q4 2026, cash-and-new-debt funded [`nVent news release, 2026-08-24`]. Every multiple above is a **pre-deal** multiple. (2) The price is **~17–19 trading days stale** and the indicative refresh is 8.84% lower, which is why the "vs current price" column is shown at both prices throughout (`01` §1, MODULE_RULES → Price freshness).

---

## 5. Sector Cycle Reality Test

**The sector re-rated hard over the same window, in the SAME direction as nVent's own premium — the own-history band is flagged cycle-elevated.** No sector-level multiple history exists anywhere in the data pool (`00_valuation-data-triage` §5 flagged this in advance; `ciq_facts.json` `peer_ev_ebitda` is `missing`), so the reference was web-sourced and is labelled unverified: **the S&P 500 Industrials sector's forward P/E rose from roughly 16.0x in late 2022 to roughly 25.5x currently — about +59%** — with the sector "repriced as a structural play on AI, onshoring, and domestic capacity investment" [`Web: Yardeni Research QuickTakes, "INDUSTRIALS: Earnings & P/E Multiples Boosted By Booming AI, Onshoring & Defense Spending", retrieved 2026-09-07 — indicative, unverified`]. A corroborating price-level read: the US Heavy Electrical Equipment industry "gained 223% over the past year" as of 2026-04-10 [`Web: Simply Wall St, US Heavy Electrical Equipment industry page, retrieved 2026-09-07 — indicative, unverified`]. **+59% is more than double the ~25% materiality threshold, and it runs the same way as nVent's +13% to +21% premium to its own mean/median — so the trigger fires.**

**Honest statement of the window mismatch.** The sector series runs late-2022 → 2026; nVent's own band runs only 2025-03 → 2026-08. The two windows are not identical, and the sector figure is web-sourced rather than a matched Capital IQ series. What can be said with confidence is the thing that matters: **nVent's entire 1.5-year multiple history sits INSIDE one continuous sector-wide re-rating run, so its "own mean" is a snapshot of the sector's boom level, not a through-cycle normal.** That is the exact failure mode CLAUDE.md §16 describes — anchoring on the bubble's own level and calling it reversion. Per MODULE_RULES → Score Cap Rules, **this method's confidence contribution is capped at 60**, and `99` must check whether `03_relative-valuation-peers` fires the same flag (the compounding rule caps the combined base-case valuation confidence at 55 if it does).

RF-VAL-001: own-history band cycle-elevated — S&P 500 Industrials forward P/E ~16.0x (late 2022) → ~25.5x (current), roughly +59%, same direction as NVT's premium to its own mean [Web: Yardeni Research QuickTakes, retrieved 2026-09-07, indicative/unverified]

---

## 6. Own-History Read

**nVent trades at a 13–21% premium to its own six-quarter mean and median on EV/EBITDA (26.24x LTM against a 21.65x mean and 23.19x median; 21.39x NTM against 18.43x / 18.64x), sitting at roughly the 61st–66th percentile of its own observed range and above five of its own six quarterly closes — but that "own history" is 1.5 years long, so it is a marker, not an anchor.** Reverting to that mean or median would imply an illustrative $133–$146 per share on EV/EBITDA and $149–$154 on P/NTM EPS, against $171.16 (2026-08-12 anchor) or $156.03 (indicative 2026-09-04) — and **none of those numbers is offered to `07` as a fair-value input**, because a mean computed off six quarters inside one uninterrupted upswing cannot tell you what this company deserves through a cycle.

**The single biggest caveat is a double-count risk running in the bearish direction, and a structural-change risk running in the bullish one — they do not cancel, they compound the uncertainty.** Every EV/EBITDA figure above puts a near-peak multiple on a near-peak denominator: LTM EBITDA of $1,074.6m is 59% above FY2024, return on capital at 9.5% is ~1.5x the ~6.4% pre-boom level, and `business-model/07_business-quality.md` scores cyclicality **30/100** while `09_moat.md` labels the LTM figure a cycle peak and refuses to capitalise it. Against that, the business genuinely is not the same company it was in early 2025 — infrastructure went from 45% of FY2025 sales to 58.1% of H1 FY26, leverage halved, and $1.75bn of Maverick Power lands in Q4 2026 — so the *old* mean is not obviously the right target either. Reverting to the old mean is not warranted, and neither is assuming the new level is the new normal.

**§5's flag travels with that conclusion: the own-history band is cycle-elevated and must not be presented as a clean floor.** nVent's whole multiple history sits inside a sector-wide re-rating (S&P 500 Industrials forward P/E ~16.0x → ~25.5x), so the band's bottom end — 13.67x TEV/LTM EBITDA — is a level from inside the boom, not a downside anchor tested against a downturn. On the §24 Filter 6 ownership test there is no offsetting structural discount to worry about: `management-governance/04_ownership-and-insider-behavior.md` tested all three unaligned structures and **RF-OWN-004 is not triggered**, so no value-trap-from-owner caveat applies here and no shareholder-friendliness cap flows to this method.

---

**Partial data (declared):** own multiple history is ~1.5 years (six quarterly closes) against the 3–5 years the method requires → no mean/median reversion target published as a fair-value input; §4 is illustrative-only. Sector-level multiple history absent from the pool → web-sourced, labelled unverified, and **RF-VAL-001 fired** → this method's confidence contribution capped at 60. Price anchor stale (~17–19 trading days) and pre-dates the Maverick Power announcement → every price-relative figure shown at both $171.16 and the indicative $156.03.

**Out-of-scope items not produced here (correctly owned elsewhere):** peer comparison → `03_relative-valuation-peers`; cash-flow value → `04_intrinsic-dcf`; the bull/base/bear levels and the final fair value → `07_scenario-and-fair-value`; probabilities, risk/reward and the rating → the master synthesizer.



---

## valuation / 03_relative-valuation-peers.md

_Source: `03_relative-valuation-peers.md`_

# Relative Valuation — Peers — NVT

Evidence binding: frozen. Pool reads resolved only through the bound generation `6db32848…1aecd1e6`; `data/NVT/…` is a citation label, not a live path. Regime (from `00_valuation-data-triage` §1A and `01_price-and-capital-structure`): **US SEC filer**, **US GAAP**, **USD in millions**, fiscal year ends **31 December**. Business type: **Operating company** — so the Business-Type Method Map's operating multiples apply (EV/EBITDA, EV/EBIT, P/E, EV/Sales, FCF yield). P/tangible book is **unusable on this company**: tangible book value per share is **negative USD (2.94)** and the vendor reports Price/Tangible BV as "NM" [`01_price-and-capital-structure` §6; `Capital IQ Financials export → Key Stats`].

**Read this before anything else — the peer multiples in this report are not in the data pool.** `00_valuation-data-triage` §5 records it plainly: the pool holds a Capital IQ **Competitors** export with names and last-twelve-month revenue only, and `ciq_facts.json` marks `peer_ev_ebitda` **missing** ("CIQ 'comps' export not found for NVT"). **Every peer multiple below is web-sourced on 2026-09-07 and is unverified.** Per the module's Partial-Data table this triggers **overall usefulness max 70**, and the Sector Cycle flag in §6 adds its own cap. What follows is a real relative-valuation read, not a substitute for a comps export.

---

## 1. Peer Set

**Where the names came from.** `business-model/08_competitive-map.md` is available and was used, and its own warning is carried forward verbatim: **nVent names no competitor anywhere in its own filings** — the FY24 10-K's Competition section and competition risk factor are entirely generic [`business-model/08_competitive-map.md`, header; FY24 10-K, Item 1 — Competition, p.2]. Every name is therefore sourced from the pool's tier-5 Capital IQ Competitors export, whose disclosing documents are *other companies'* filings. `08` also applied a filter this report re-uses: rows tagged to **Raychem Corporation** describe the heat-tracing business nVent **sold on 2025-01-30**, and rows tagged to **ERICO International** map to the smaller Electrical Connections segment. Only rows where `Company = nVent Electric plc (NYSE:NVT)` are used.

| Peer | Ticker | Why Comparable | Source of Inclusion |
|---|---|---|---|
| Eaton Corporation plc | NYSE:ETN | The most directly matched **segment** rival: Electrical Americas sells power distribution and electrical infrastructure into the same data-centre and utility end markets as nVent's Systems Protection (72.5% of revenue). LTM revenue $30,026m — 6.2x nVent, so it fails a ~5x scale screen, but `08` carries its economics in full for exactly this reason | CIQ Competitors export (NVT), disclosing document Forgent Power Solutions 2026 Form 424B4; `business-model/08_competitive-map.md` §2e |
| Hubbell Incorporated | NYSE:HUBB | Nearest public peer on **scale and geography**: enclosures, connectors, grounding and utility power equipment; LTM revenue $6,223.6m = 1.29x nVent; predominantly United States, as nVent is (Americas 81% of FY2025 revenue) | CIQ Competitors export (NVT), disclosing document Atkore 2025 Form 10-K; `08` §2 Competitor B |
| Legrand SA | ENXTPA:LR | Most similar business **shape**: enclosures + cable management + power distribution + a named data-centre solutions business (26% of Legrand's 2025 sales). LTM revenue $11,665.1m = 2.41x nVent. Named by **Legrand's own document**, the stronger of the two disclosure directions | CIQ Competitors export (NVT), disclosing document "Legrand SA - Form Doc"; `08` §2 Competitor C |
| ABB Ltd | SWX:ABBN | Electrification segment competes across switchgear, enclosures, cabling systems and distribution automation. LTM revenue $35,752m = 7.4x nVent — fails the scale screen, included for the multiple read only | CIQ Competitors export (NVT), disclosing document Atkore 2025 Form 10-K; `08` §2e |
| Atkore Inc. | NYSE:ATKR | Conduit, cable management and metal framing — overlaps **Electrical Connections** rather than the dominant segment. LTM revenue $2,933.7m = 0.61x nVent. Included as the low-growth, commodity-ish end of the set | CIQ Competitors export (NVT), disclosing document Atkore 2025 Form 10-K; `08` §2e |
| Forgent Power Solutions, Inc. | NYSE:FPS | Switchgear, eHouses and power skids for data centres — a direct rival to the **Maverick Power** business nVent has agreed to buy but does not yet own. LTM revenue $1,196.0m = 0.25x nVent; recently listed, so no multi-year record | CIQ Competitors export (NVT), disclosing document Forgent Power Solutions 2026 Form 424B4; `08` §2e |
| Vertiv Holdings Co | NYSE:VRT | **Self-selected — NOT in the CIQ export and not named by nVent.** Added because `08` §5 flags the exact hole this fills: *"No pure-play data-centre cooling or thermal-management specialist appears in the sourced competitor list at all, even though liquid cooling is the capacity nVent is building three Minnesota plants for."* Vertiv is the listed pure-play in data-centre power and thermal management; it is the only growth-matched public comparable in the set (29.1% vs nVent's 23.1% three-year revenue growth forecast) | **Self-selected by this agent**, on `08` §5's stated gap. Flagged as such in every use below |

**Private peers with no public multiples — named, not guessed.** These are real competitors that **cannot be put in the comp table** because no listed price exists:
- **Rittal GmbH & Co. KG** — `08` calls it "the closest product-for-product rival to Systems Protection's enclosure-and-cooling core, and the one whose economics cannot be tested at all, because it is private." LTM revenue $1,756.3m; parent Friedhelm Loh Group reported €3.2bn 2025 revenue. **No margin, no return on capital, no multiple is public. Nothing is assumed for it.**
- **Hitachi Energy AG** ($2,686.4m LTM) — a subsidiary of Hitachi, no standalone multiple.
- **Zekelman Industries, Dura-Line, Haydon, Ge-Prolec, ASC Engineered Solutions, Southwire** — all private or subsidiaries; no multiples.

**Named in the export but excluded, with the reason.** **Mitsubishi Corporation** ($124,828m — a Japanese trading house, not an electrical-hardware rival), **Nucor** ($36,101m — a steelmaker, i.e. an *input supplier* to nVent), **WEG S.A.** ($7,763.8m — motors and drives, limited overlap with the dominant segment), and **Hammond Manufacturing** (TSX:HMM.A, $217.8m — public, but 0.045x nVent's revenue, roughly 22x smaller, so its multiple carries no information for a $25bn company). `08` also documents that the export prints Southwire's LTM revenue as **$7.13m** (Southwire is a multi-billion-dollar cable maker) and carries a **Jun-30-2018** LTM date for Zekelman — errors that cap confidence in the source itself.

---

## 2. Peer Multiples & Operating Stats

**Every figure in this table is web-sourced from one provider on one date, so the bases match across rows.** Source for every cell unless stated: `Web: stockanalysis.com statistics page for each ticker, retrieved 2026-09-07 — unverified`. Bases: **P/E (fwd)** is next-twelve-month (NTM) consensus earnings, on the normalized/adjusted basis; **trailing P/E, EV/EBITDA, EV/EBIT, EV/Sales, FCF yield, EBITDA margin, ROIC and Debt/EBITDA** are last-twelve-month (LTM); **revenue growth** is the provider's three-year forward consensus forecast. Enterprise value on this provider's basis is **lease-inclusive** for nVent (its $26.63bn = $26,491.1m equity-plus-net-debt bridge from `01` **plus** the $140.5m of operating lease liabilities, to the decimal) — that basis is used consistently on both sides of every ratio in §5.

| Company | P/E (fwd, NTM) | P/E (trailing) | EV/EBITDA | EV/EBIT | EV/Sales | FCF Yield | Rev Growth (3Y fcst) | EBITDA Margin | ROIC | Debt/EBITDA | Data As-of |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| **NVT** (at USD 156.03) | **27.04** | **43.32** | **25.37** | **32.57** | **5.51** | **2.29%** | **23.05%** | **21.71%** | **11.93%** | **1.51** | 2026-09-07 |
| *NVT (at the pool anchor USD 171.16)* | *29.66* | *47.52* | *27.70* | *35.57* | *6.02* | *2.09%* | *23.05%* | *21.71%* | *11.93%* | *1.51* | *2026-08-12* |
| Eaton (ETN) | 27.31 | 41.83 | 27.14 | 33.03 | 6.00 | 2.47% | 13.36% | 22.11% | 10.61% | 3.07 | 2026-09-07 |
| Hubbell (HUBB) | 21.23 | 27.27 | 19.47 | 23.04 | 4.74 | 3.70% | 11.36% | 24.35% | 13.60% | 3.56 | 2026-09-07 |
| Legrand (ENXTPA:LR) | 22.06 | 28.37 | 18.43 | 22.44 | 4.23 | 3.63% | 11.48% | 21.95% | 10.99% | 3.33 | 2026-09-07 |
| ABB (SWX:ABBN) | 20.61 | 35.38 | 23.85 | 28.15 | 4.99 | 2.79% | 11.32% | ~20.0% | 25.12% | 1.22 | 2026-09-07 |
| Atkore (ATKR) | 15.19 | n/a (negative) | 12.75 | 20.62 | 1.27 | 1.82% | 4.29% | 9.98% | 10.06% | 3.04 | 2026-09-07 |
| Forgent Power (FPS) | 31.11 | 559.23 | 61.80 | 102.73 | 8.49 | −1.02% | 55.81% | 13.74% | 6.70% | 3.75 | 2026-09-07 |
| Vertiv (VRT) — *self-selected* | 35.80 | 63.49 | 40.40 | 47.23 | 9.43 | 2.71% | 29.11% | 23.34% | 37.58% | 1.19 | 2026-09-07 |
| **Peer median (7 peers)** | **22.06** | **38.61** | **23.85** | **28.15** | **4.99** | **2.71%** | **11.48%** | **21.95%** | **10.99%** | **3.07** | 2026-09-07 |
| *Peer mean (7 peers)* | *24.76* | *125.93* | *29.12* | *39.61* | *5.59* | *2.30%* | *19.53%* | *19.92%* | *16.38%* | *2.74* | 2026-09-07 |
| **Core-three median** (ETN, HUBB, LR) | **22.06** | **28.37** | **19.47** | **23.04** | **4.74** | **3.63%** | **11.48%** | **22.11%** | **10.99%** | **3.33** | 2026-09-07 |

Medians are computed, not eyeballed. Worked example on the multiple that carries the base case — forward P/E, seven peers sorted: 15.19, 20.61, 21.23, **22.06**, 27.31, 31.11, 35.80 → the fourth value is the median, **22.06x**. The trailing-P/E **mean** of 125.93x is meaningless (Forgent Power's 559.23x dominates it) and is shown only to demonstrate why the **median** is used everywhere below. Atkore's trailing P/E is unavailable because its trailing earnings are negative.

**NVT's own figures reconcile to the pool, which is the check that makes the peer column usable.** The provider's NVT forward P/E of 27.04x at $156.03 implies NTM earnings per share of $5.77 (156.03 ÷ 27.04). Capital IQ's own NTM P/E of **29.6612x** at the pool anchor of $171.16 implies **the same $5.77** (171.16 ÷ 29.6612 = 5.7705) [`Capital IQ Estimates export → Multiples`, NTM]. Two independent providers land on an identical NTM earnings base, which is what lets a web-sourced peer multiple be applied to a pool-sourced company metric. One definitional gap is stated rather than smoothed: the provider's LTM EBITDA for nVent is **$1,050.3m**, against Capital IQ's **$1,074.6m** [`ciq_facts.json`, `ltm_ebitda_m`] — a 2.3% difference in EBITDA definition. §5 applies the peer EV/EBITDA to the **provider's** $1,050.3m so both sides of the ratio sit on one basis, and shows the Capital IQ variant beside it.

**One disagreement inside the data, named (CLAUDE.md §3).** This provider computes nVent's ROIC at **11.93%**, *above* the peer median of 10.99%. Capital IQ computes it at **9.54%** LTM, and `business-model/08_competitive-map.md` §2d uses that figure to conclude nVent earns **less** than every named peer on every sourced measure [`Capital IQ Financials export → Ratios`]. Both are third-party calculations on undisclosed definitions and neither is a filed number. Two things settle it without picking a winner: (a) whichever is right, it is a **cycle-peak** figure — nVent's own return on capital ran 6.7% / 6.2% / 6.3% / 6.3% / 7.2% in FY2021–FY2025 and `business-model/09_moat.md` §3 puts the through-cycle level at **8.10% computed / 6.49% vendor against a ~10.0% cost of capital**; and (b) the peer ROICs in the table are on the same cycle, so the *comparison* is less distorted than the level. Nothing below rests on nVent's ROIC being above the peer median.

---

## 3. Premium / Discount to Peer Median

`premium/(discount) = (company multiple − peer median) / peer median`, divided by the **peer median**. **Yields invert:** for FCF yield the sign is flipped — nVent's yield sits *below* the peer median, meaning a buyer pays more for each dollar of free cash flow, which reads as a **premium**, not a discount.

**At the fresher indicative price of USD 156.03 (2026-09-04 close; the price on which the whole provider table is computed — this is the internally consistent read and it leads):**

| Multiple | Company (NVT) | Peer Median (7) | Premium / (Discount) | vs Core-Three Median | Premium / (Discount) |
|---|---:|---:|---:|---:|---:|
| P/E (forward, NTM) | 27.04 | 22.06 | **+22.6%** | 22.06 | **+22.6%** |
| P/E (trailing) | 43.32 | 38.61 | **+12.2%** | 28.37 | **+52.7%** |
| EV/EBITDA (LTM) | 25.37 | 23.85 | **+6.4%** | 19.47 | **+30.3%** |
| EV/EBIT (LTM) | 32.57 | 28.15 | **+15.7%** | 23.04 | **+41.4%** |
| EV/Sales (LTM) | 5.51 | 4.99 | **+10.4%** | 4.74 | **+16.2%** |
| FCF yield (LTM) — *yield, sign flipped* | 2.29% | 2.71% | **+15.5% premium** (yield 15.5% below median) | 3.63% | **+36.9% premium** |

**At the pool-verified anchor of USD 171.16 (close 2026-08-12 — the canonical anchor from `01`, and it is 26 calendar days / ~17–19 trading days stale):** every nVent multiple is 9.70% higher (171.16 ÷ 156.03), so every premium widens:

| Multiple | Company at $171.16 | Peer Median (7) | Premium |
|---|---:|---:|---:|
| P/E (forward, NTM) | 29.66 | 22.06 | **+34.5%** |
| EV/EBITDA (LTM) | 27.70 | 23.85 | **+16.1%** |
| EV/EBIT (LTM) | 35.57 | 28.15 | **+26.4%** |
| EV/Sales (LTM) | 6.02 | 4.99 | **+20.6%** |
| FCF yield (LTM) — *sign flipped* | 2.09% | 2.71% | **+22.9% premium** |

**Inline staleness flag, mandatory (`01` §7):** the anchor's as-of date is **2026-08-12**, 26 calendar days before this run, and the drift to the corroborated 2026-09-04 quote is **−8.84%**. Both columns are shown; the fresher one leads. Note also that the anchor **pre-dates the 2026-08-24 Maverick Power announcement** while the peer prices and the $156.03 quote **post-date** it.

**One correction the trailing EV/EBITDA premium needs.** The +6.4% EV/EBITDA premium is the smallest number in the table and it is the most misleading, because nVent's LTM EBITDA sits at a **cycle peak**: LTM revenue of $4,834m is 24% above FY2025's $3,893m and 61% above FY2024's $3,006m [`01_price-and-capital-structure` §5, propagating `balance-sheet-survival/01`]. On the mid-cycle normalised EBITDA of **$863.6m** that `01` §5 carries (the three-year average of reported EBITDA), nVent's lease-inclusive EV of $26,631.6m at $156.03 is **30.8x**, a **+29.2%** premium to the same 23.85x peer median rather than +6.4%. This is a labelled sensitivity, not a substitution: the peers' own EBITDA is cycle-elevated too, so the honest statement is that the low trailing EV/EBITDA premium is an artefact of a peak denominator on both sides and should not be read as nVent being close to peer parity.

**Is the gap typical or unusual? — Not assessable on a matched basis.** The pool contains **no peer multiple history at all** (`peer_ev_ebitda` is `missing` in `ciq_facts.json`), and nVent's own multiple history in the pool is only **six quarterly closes from 2025-03-31**, which `ciq_facts.json` itself labels *"LOW-CONFIDENCE (6 closes <8q ≈2y) — floor read unreliable."* A three-year relationship between nVent and these peers cannot be constructed from what exists, and it is **not** invented here. The partial read that *can* be stated, and its limits: over the ~18 months the pool covers, nVent's own TEV/LTM EBITDA moved from a six-close range of 15.4–30.3x (median 23.2x) to 26.2x at the anchor — the upper part of its own short window — while Eaton's EV/EBITDA went from 24.99x (2025) to 27.14x and Hubbell's from a 5-year average of ~18.06x to 19.47x [`Web: stock-analysis-on.net and valueinvesting.io historical EV/EBITDA pages for ETN and HUBB, retrieved 2026-09-07 — unverified`]. Both nVent and its peers re-rated upward together over that window, so nothing in it isolates a *newly widened* nVent-specific gap. **Verdict on this row: Not assessable — no matched peer-multiple history.**

---

## 4. Is the Gap Warranted?

**Partly, and not by as much as the price is charging.** The case *for* a premium is real and evidenced: nVent's three-year consensus revenue growth forecast of **23.05%** is roughly **twice** the peer median of 11.48%, its EBITDA margin of 21.71% is essentially **at** the peer median of 21.95%, and its leverage of 1.51x debt/EBITDA is **less than half** the peer median of 3.07x — a company growing twice as fast with the same margin and half the leverage should not trade at the median. The case *against* is that the growth is a cycle, not a franchise: `business-model/09_moat.md` returns a through-cycle return on capital of **8.10% against a ~10.0% cost of capital**, so growth is being funded at a return that does not clear what the money costs, and its verdict is a moat "in structure, not economics"; `business-model/07_business-quality.md` scores the aggregate at **41/100** with cyclicality at **30/100** (its lowest row) and industry rate-of-change at **40/100**, tripping CLAUDE.md §24 Filter 5 and flagging the thesis as a sector / technology-cycle bet; and the concentration behind the growth is extreme — **58.1%** of H1 FY26 sales in one vertical, **85.0%** in one region, with only **4.7%** of FY2024 sales on contracts of a year or more [Q2 FY26 10-Q, Note 2, p.8–9; FY24 10-K, Note 2, p.53]. Eaton, the closest segment rival, carries a **$15.3bn** backlog against nVent's entire group backlog of **$2.5bn**, and earns a 29.9% segment operating margin in Electrical Americas against Systems Protection's 22.9% return on sales [`business-model/08_competitive-map.md` §3 and §2d]. **Conclusion: the premium is partly warranted — a growth premium is deserved, but the premium currently paid is larger than the evidence supports, so on the portion above roughly 24–25x forward earnings it is unjustified (relative downside).**

---

## 5. Implied Value from Peer Multiples

**Basis matching, stated once.** Forward peer multiples are applied to nVent's **NTM** metric; trailing peer multiples to nVent's **LTM** metric. Where the metric is the provider's own (EBITDA, EBIT, revenue, FCF), the provider's nVent figure is used on both sides of the ratio so the bases match (§15). **Equity bridge and its one-line reason for departing from `01`'s canonical figure:** the peer enterprise values are **lease-inclusive**, so the bridge below subtracts nVent's **lease-inclusive net debt of $1,376.9m** rather than `01`'s canonical **strict** net debt of $1,236.4m — the $140.5m difference is exactly operating lease liabilities, reconciled in `01` §4, and using the strict figure against a lease-inclusive multiple would mismatch the two sides. Per-share divides by **164.2m fully diluted shares** [`01` §2]. Every "vs current price" column uses the fresher **USD 156.03**; the anchor comparison is given beneath.

**A. Dispersion across multiples — peer median applied UNADJUSTED**

| Multiple | Applied Peer Multiple | Company Metric (basis) | Implied EV or Equity | Implied Price/Share | vs $156.03 |
|---|---:|---|---:|---:|---:|
| P/E (forward, NTM) | 22.06x | NTM EPS **$5.77** (consensus; CIQ NTM P/E ÷ anchor price, corroborated by the provider) | equity $22.7bn | **$127.29** | −18.4% |
| P/E (trailing) | 38.61x | LTM diluted EPS excl. extra **$3.602** [`CIQ Financials → Key Stats`] | equity $22.8bn | **$138.99** | −10.9% |
| EV/EBITDA (LTM) | 23.85x | LTM EBITDA **$1,050.3m** (provider basis) | EV $25,049.7m | **$144.17** | −7.6% |
| EV/EBIT (LTM) | 28.15x | LTM EBIT **$817.7m** (provider basis) | EV $23,018.3m | **$131.80** | −15.5% |
| EV/Sales (LTM) | 4.99x | LTM revenue **$4,838.1m** (provider basis) | EV $24,142.1m | **$138.64** | −11.1% |
| FCF yield (LTM) | 2.71% | LTM FCF **$578.3m** (provider; ties to §15 CFO $690.6m − capex $112.9m = $577.7m, a 0.1% gap) | equity $21,339.5m | **$129.96** | −16.7% |

Worked example so the arithmetic is reproducible — EV/EBITDA row: `23.85 × 1,050.3 = 25,049.7` enterprise value; `25,049.7 − 1,376.9 lease-inclusive net debt = 23,672.8` equity; `23,672.8 ÷ 164.2m = $144.17`. On Capital IQ's EBITDA of $1,074.6m the same multiple gives $147.70 — a 2.4% difference, shown so the definitional gap is visible rather than buried.

**Dispersion at the unadjusted peer median: $127.29 – $144.17**, a high-to-low field of **13.3%** — comfortably inside the 40% cross-method tolerance. Using the **core-three median** (Eaton, Hubbell, Legrand — the three closest businesses, stripping out ABB's scale, Atkore's different economics and the two high-growth names) the EV/EBITDA read falls to `19.47 × 1,050.3 = 20,449.3 − 1,376.9 = 19,072.4 ÷ 164.2 = **$116.15**`, which widens the full field to **$116.15 – $144.17 (24.1%)** — still inside tolerance, and a labelled sensitivity rather than the headline.

**B. Base case — ONE point, on the named primary multiple**

**Primary multiple: forward (NTM) P/E.** It is the best-evidenced basis available here: the pool carries a full consensus set with 16 contributors on FY2026 adjusted EPS [`earnings/04_guidance-consensus.md` §1], all peer forward P/Es come from one provider on one date and one NTM basis, and the module's Scenario Construction policy §1 makes multiples primary for an operating company that has forward estimates.

> **Base-case implied value: USD 141.37 per share** = warranted forward P/E of **24.5x** × NTM EPS of **$5.77**.
> Against the fresher price of $156.03: **−9.4%**. Against the stale pool anchor of $171.16: **−17.4%**.
> Separate dispersion (see A): **$127.29 – $144.17** on the seven-peer median, widening to **$116.15 – $144.17** if the core-three median is used.

**Quality-adjustment ledger (required — this is the double-count gate)**

| Multiple adjusted | Peer median | Adjusted to | Gap already in the denominator? | What the extra adjustment pays for | How it was sized |
|---|---:|---:|---|---|---|
| **P/E (forward, NTM)** — the base case | 22.06x | **24.5x** (+11.1%) | **Yes** for profitability — nVent's EBITDA margin (21.71%) is essentially **at** the peer median (21.95%), so there is no margin gap to charge in either direction, and any margin difference is already inside the NTM EPS being multiplied. **No** for growth *beyond* the NTM window — the NTM denominator carries only the next twelve months, not years two and three | A **net premium**, built from two named, opposing adjustments: **(+)** forward growth roughly **2x** the peer median (23.05% vs 11.48% three-year consensus) that the NTM denominator does not carry; **(−)** an offset for the **durability and return** of that growth: through-cycle return on capital of **8.10% against a ~10.0% cost of capital** [`business-model/09_moat.md` §3], cyclicality **30/100** and rate-of-change **40/100** [`07_business-quality.md`], 58.1% of sales in one vertical and 85.0% in one region, and a $2.5bn backlog against Eaton's $15.3bn | The **growth premium is sized off the peer set's own observed pricing, not invented**: across the eight names the market clears ~20.6–22.1x forward at ~11.3–11.5% growth (ABB, Hubbell, Legrand), ~27.3x at 13.4% (Eaton), ~35.8x at 29.1% (Vertiv) — so the full step from 11.5% to 23.1% growth is worth roughly **+5 P/E turns** in this set. That premium is then **halved to ~+2.5 turns** because the growth is not proven to earn its cost of capital and sits in one vertical on one cycle. `22.06 + 2.44 = 24.5x`. **Not** derived from any margin ratio |
| EV/EBITDA, EV/EBIT, P/E (trailing), FCF yield | as in A | **unadjusted** | **Yes** — each is an earnings- or cash-based multiple; every profitability difference is already inside the denominator being multiplied | Nothing. No separate reason survives that is not already priced in the base case | No adjustment applied — the peer median is used as-is and nVent's own metric does the work it already does |
| EV/Sales | 4.99x | **unadjusted** | **No** — revenue is margin-blind, so a margin haircut *would* be legitimate here | Nothing, because there is no margin gap: nVent's EBITDA margin is 21.71% against a peer median of 21.95%, a 24-basis-point difference. **The one multiple where a margin haircut is allowed is the one where the evidence does not support one** | Not applied |

**The double-count test in plain terms.** The single most common way this module goes wrong is multiplying a peer multiple by a margin ratio — `22.06 × (21.71% ÷ 21.95%)` — and calling the result quality-adjusted. That is banned (CLAUDE.md §16), and here it would also be nearly a no-op, which is the tell: nVent's weakness against these peers is **not** its margin. It is the durability and the return on capital behind the margin, and that is charged once, explicitly, by halving an evidenced growth premium — never by scaling the multiple with a profitability ratio.

**Financial cross-check:** not applicable. nVent is an operating company, not a bank or insurer [`00_valuation-data-triage` §3]. P/tangible book cannot run in any case — tangible book value per share is negative USD (2.94) [`01` §6].

**An independent cross-check that is genuinely independent — the transaction comp.** On 2026-08-24 nVent agreed to buy **Maverick Power** for **$1.75bn** plus up to $550m of earnout, and the company states the price is *"approximately 11.5 times anticipated 2026 adjusted EBITDA"*, or ~10.5x adjusted for the present value of expected tax benefits [`nVent news release, 2026-08-24`]. Maverick is a North American data-centre power distribution business with ~$700m of estimated 2026 revenue — implying about **$152m of EBITDA and a 21.7% EBITDA margin**, essentially identical to nVent's own 21.71%. This is a **private-market clearing price for the same end-market growth exposure, negotiated at arm's length by this company's own management**, and it rests on a completely different input set from any public multiple — so unlike the readings in §3 it is real corroboration, not a coincidence. It says the private market paid **11.5x forward EBITDA** for data-centre power growth while the public market pays nVent roughly **19.6x NTM enterprise value to EBITDA** at $156.03 (21.39x at the anchor) [`Capital IQ Estimates export → Multiples`, NTM]. Applied literally to nVent's FY2026E EBITDA of $1,225.0m the transaction multiple implies `11.5 × 1,225.0 = 14,087.5 − 1,376.9 = 12,710.6 ÷ 164.2 = **$77.41**` per share — which is **not** offered as a fair value, because a mid-size private asset and a $25bn listed compounder do not clear at the same multiple. It is offered as the size of the gap: the public market is paying roughly **1.7–1.9x** the private market's price for the same growth. Read the other way, the deal is multiple-accretive for nVent, which is a point in management's favour on this transaction and does not change the relative-value read on the stock.

---

## 6. Sector Cycle Reality Test

**The peer-median anchor is cycle-elevated, and the evidence is quantitative.** The peer group's own multiples have re-rated sharply over the reference window: **Eaton's EV/EBITDA went from 17.06x (2021) to 27.14x today, +59%**, and **Hubbell's from a 16.79x 2021 peak to 19.47x, +16%** [`Web: stock-analysis-on.net EV/EBITDA history pages for ETN and HUBB, and valueinvesting.io, retrieved 2026-09-07 — unverified`]. At the sector level the **S&P 500 Industrials forward P/E stands at ~24.25–24.5 (September 2026) against a 25-year average of ~17.0 — roughly +43%** [`Web: sector forward-P/E aggregators (siblisresearch.com, macromicro.me, yardeni.com sector forward P/E pages), retrieved 2026-09-07 — unverified`], with the re-rating explicitly attributed to the AI data-centre build-out and grid investment — the same driver as nVent's own growth. Both moves exceed the ~25% materiality threshold and both run in the **same direction as this report's finding** (nVent at a premium to the peer median), which is exactly the compounding condition the rule exists to catch: a stock priced at a premium to a group that has itself re-rated ~40–60% is not being measured against a stable anchor. **This method's confidence contribution is capped accordingly (Score Cap Rules), and the finding must not be read as "the peer median is what normal looks like."**

`RF-VAL-001: peer-median anchor cycle-elevated — S&P 500 Industrials forward P/E ~24.25–24.5 (Sep-2026) vs ~17.0 25-year average (+43%), and peer EV/EBITDA re-rated +59% (Eaton, 17.06x 2021 → 27.14x) and +16% (Hubbell, 16.79x 2021 → 19.47x); web-sourced 2026-09-07, unverified`

**Compounding note for `07` and `99` (Scenario Construction §3).** `02_multiples-own-history` had not been written at the time of this run, so its flag cannot be read here. Two instructions travel forward: (1) nVent's own multiple history in the pool is only ~1.5 years and sits **entirely inside** this same sector re-rating, so if `02` flags its band cycle-elevated as well, the two flags are **one distorted read counted twice**, not two agreeing methods — the combined base-case valuation confidence cap of **55** then applies; (2) if this report's adjusted 24.5x multiple happens to land near `02`'s own-history band, that convergence is **not** independent corroboration (CLAUDE.md §16) — `02` measures where the market has already priced this stock, so it cannot confirm a claim about whether the market is pricing it correctly. The Maverick transaction comp in §5, which uses a different input set entirely, is the only genuinely independent read this module produced.

---

## 7. Relative Read

**nVent trades at a premium to its peers on every multiple that can be measured — +22.6% on forward earnings, +15.7% on EV/EBIT, +10.4% on EV/Sales and +15.5% on free-cash-flow yield at the fresher $156.03, and +34.5% / +26.4% / +20.6% / +22.9% at the stale $171.16 pool anchor.** Part of that premium is deserved: the company is forecast to grow revenue at roughly twice the peer median with the same EBITDA margin and less than half the leverage. The rest is not, because the growth is a single-vertical, single-region capital-spending wave earning a through-cycle return on capital of ~8.1% against a ~10.0% cost of capital, behind a $2.5bn backlog where Eaton has $15.3bn — so the warranted forward multiple is roughly **24.5x**, not the ~27x (or ~29.7x at the anchor) the market pays. **Base-case peer-implied value USD 141.37 per share (24.5x × $5.77 NTM EPS), with a dispersion of $127.29–$144.17 across the six multiples at the unadjusted seven-peer median, widening to $116.15–$144.17 on the three closest peers alone.**

**Two things must travel with that number.** First, **§6 flagged the peer-median anchor cycle-elevated** — the industrials sector's forward P/E is ~43% above its own 25-year average and Eaton's EV/EBITDA is up 59% since 2021 — so being priced against this peer group is not the same as being fairly valued; if the sector de-rates, both the peer median and the implied value above fall together. Second, everything here is **pre-Maverick on the earnings line and post-Maverick on the price line**: the $5.77 NTM earnings base excludes the $1.75bn acquisition's ~$700m of revenue and excludes the new debt that funds it, and the pro-forma leverage of ~2.43x would move nVent from the least-levered end of this peer set to roughly its median [`balance-sheet-survival/01`, labelled inference]. **Confidence in this module is capped twice over — no peer multiples in the pool (overall usefulness max 70) and the cycle-elevated peer anchor — and the numbers should be handed to `07` with both caps attached.**



---

## valuation / 04_intrinsic-dcf.md

_Source: `04_intrinsic-dcf.md`_

# Intrinsic DCF — NVT

**Evidence binding: frozen.** Every read resolved through the bound generation `6db32848…1aecd1e6`. Live `data/NVT/` and `_pool_extracts/` were not read; `data/NVT/…` is a citation label only.

**Regime, standard, currency (from `00_valuation-data-triage` §1A).** US SEC domestic filer (Irish-incorporated, NYSE-listed). **US GAAP. Reporting currency USD, in millions; per-share in dollars. Fiscal year ends 31 December.** The discount rate and the terminal growth rate below are both USD-denominated and matched to the US economy.

**Business-type gate (MODULE_RULES → Business-Type Method Map).** `00_valuation-data-triage` §3 classifies nVent as an **Operating company** (electrical connection and protection products, two reportable segments) [`FY24 10-K, Item 1`]. So the method is an **FCFF discounted-cash-flow model with an EV → equity bridge** — the standard route on that map. Two overlays apply and are carried through the whole model rather than mentioned and dropped:
- **Cyclicality overlay.** `business-model/10_external-dependency.md` §4 scores external dependency **60/100 (inverted — higher is worse)** and classifies the business "Partly externally driven", with roughly 94% of Q2 FY26 organic growth from one vertical (data centres). `earnings/01_historical-financials.md` §2 and `01_price-and-capital-structure` §5 both flag the latest twelve months as a **cycle peak**. The Cyclicality Gate therefore binds: the terminal margin is a **normalized mid-cycle** figure benchmarked against peer-normal and the company's own prior trough (§5), never the recent peak.
- **No-moat overlay.** `business-model/09_moat.md` §5 returns **"No moat proven — a moat in structure, not in economics"**, trajectory **stable**. Under this agent's §5 rule that forces a base terminal carrying **no perpetual excess return**.

**Two things this DCF deliberately excludes, stated once so they travel.**
1. **The Maverick Power acquisition is not in the model.** Announced 2026-08-24 — $1.75bn cash plus up to $550m earn-out, target 2026 revenue about $700m, close expected Q4 2026, funded from cash on hand and new debt [`nVent news release, 2026-08-24`]. It post-dates every consensus mark (to 2026-08-07) and the 30-Jun-2026 balance sheet. The forecast revenue is therefore **pre-deal** and the net debt in the equity bridge is **pre-deal** — consistent on both sides, per `01_price-and-capital-structure` §4. Folding the revenue in without the debt would be the error.
2. **No unannounced future M&A is modelled**, and no cash is charged for it. nVent has spent about $1,120m (FY2023), $678m (FY2024) and $976m (FY2025) on acquisitions [`earnings/01_historical-financials.md` §6]. The forecast below is an organic-plus-already-closed-deals path. This is stated because it is a real limitation on how the terminal is read, not a modelling nicety.

---

## 1. FCF Base & Normalizations

**Base year: the twelve months ended 30-Jun-2026 (LTM).** Reporting currency **USD, millions**, US GAAP.

**FCF definition used (CLAUDE.md §15).** `FCF = CFO − total capex`. Because this is an enterprise-level (FCFF) model discounted at a weighted-average cost of capital, the base is stated **twice**: the §15 FCF, and the **unlevered** FCFF that adds back after-tax interest — the FCFF is what the model actually discounts. Both are shown so neither is mistaken for the other. *(Plain meaning: CFO is the cash the operations generate; capex is the cash spent on plant and equipment; FCFF is what is left for **all** providers of capital — lenders and shareholders together — before interest is paid.)*

| Item | Base-Year Value (LTM to 30-Jun-2026) | Normalization Applied | Source |
|---|---:|---|---|
| Revenue | 4,834.0 | None. Ties to the vendor LTM column and to FY2025 3,893.1 − H1'25 1,772.4 + H1'26 2,713.3 | `Capital IQ Financials export → Income Statement`, LTM 12m Jun-30-2026 (tier-5 vendor); `Q2 FY26 10-Q, statements of operations` |
| CFO — **as reported** (total, incl. discontinued ops) | 690.6 | — | `Capital IQ Financials export → Cash Flow`, LTM 12m Jun-30-2026 |
| CFO — **continuing operations (used)** | **772.8** | **Removed the −$82.2m operating cash *outflow* of discontinued operations** that sits inside the reported total (largely Thermal Management disposal taxes). 690.6 − (−82.2) = 772.8 | `Capital IQ Financials export → Cash Flow` ("Net Cash From Discontinued Ops. −82.2"); derivation carried from `earnings/01_historical-financials.md` §2 |
| Capex | **112.9** | None. Independently rebuilt as FY2025 93.3 − H1'25 38.0 + H1'26 57.6 and it **ties exactly** to the vendor LTM capex | `Q2 FY26 10-Q, statements of cash flows`; `Capital IQ Financials export → Cash Flow` |
| **FCF (§15: CFO − capex)** | **659.9** | 772.8 − 112.9 | derived |
| + After-tax interest add-back (to reach unlevered FCFF) | +58.4 | LTM interest expense 74.9 × (1 − 0.220 normalized tax rate) | `Capital IQ Financials export → Income Statement`, LTM interest expense 74.9 |
| **= FCFF base (unlevered, the model's base)** | **718.3** | — | derived |
| *Memo:* vendor "Levered Free Cash Flow" | 468.2 | **Not used.** A different vendor definition (after interest and other items) — `ciq_facts.json` itself flags it as "NOT the §15 CFO−capex FCF" | `ciq_facts.json` `levered_fcf_m` |
| *Memo:* vendor "Unlevered Free Cash Flow" | 515.0 | **Not used.** Another vendor definition; the §15 build above is preferred and is reconcilable line by line | `Capital IQ Financials export → Cash Flow` |
| Company's own FCF definition | adds back proceeds from sale of property and equipment | Immaterial in H1 FY26 (nil proceeds); stated so the two are never mixed | `Q1 FY26 earnings presentation, 1-May-2026, slide 17` |

**Normalized effective tax rate: 22.0% — and this DCF reconciles to the moat module's canonical rate rather than deriving its own.** `business-model/09_moat.md` §3 published a normalized structural rate of **22.0%** as the anchor this agent must tie to, and it is used verbatim for NOPAT here and in the WACC debt shield. What was stripped, in that module's words and re-stated with its qualifiers intact: **(a)** FY2024's $92.8m non-cash charge establishing valuation allowances on deferred tax assets, which pushed the reported rate to 43.9%; **(b)** FY2023's roughly $174m deferred foreign tax benefit from a Swiss intangible step-up, which produced a negative reported rate; **(c)** the pre-2024 reported rates of 12.8–14.9%, which are structurally unrepeatable because the OECD Pillar II 15% global minimum tax took effect 1 January 2024 [`FY24 10-K, MD&A — Provision (benefit) for income taxes, p.24`; `FY24 10-K, Item 1A — tax risk factor`; `Capital IQ Financials export → Income Statement`, Effective Tax Rate %]. What remains — FY2025 at 22.1% and LTM Jun-2026 at 22.2% — is the post-Pillar-II structural rate. **The moat ROIC and this DCF therefore stand on one tax rate; they do not diverge.**

**The base is a cycle peak, and it is not treated as a perpetuity base.** LTM revenue of $4,834.0m is **+46.2%** on the prior twelve months and 24% above the whole of FY2025 [`earnings/01_historical-financials.md` §2]. Vendor ROIC of 9.5% LTM is about **1.5x** the roughly 6.4% pre-boom level [`business-model/07_business-quality.md` §4, via `09_moat.md` §3]. Nothing in this model capitalises the LTM level. The forecast starts from consensus, fades, and lands on a mid-cycle terminal margin benchmarked in §5.

---

## 2. Forecast Assumptions

**Horizon:** ten periods — a **stub half-year (H2 FY2026)** plus **FY2027 to FY2035** — then a terminal value. A ten-year explicit period is used deliberately: with revenue compounding at 13–17% in the near years, a five-year model would push the whole growth wave into the terminal value, which is the fastest way to a terminal-dominated, low-confidence answer.

**Valuation date: 30-Jun-2026** — the balance-sheet date, so the net debt in the §6 bridge is the same date as the cash flows. This is stated because it is a real (small) conservatism: the run date is 2026-09-07, 69 days later, so **not rolling the value forward understates it by about 1.9%** at the WACC below. That roll-forward is **not** taken.

| Assumption | H2-26 | FY2027 | FY2028 | FY2029 | FY2030 | FY2031 | FY2032 | FY2033 | FY2034 | FY2035 | Terminal | Source / Basis |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| Revenue (USD m) | 2,722.0 | 6,368.6 | 7,215.7 | 7,904.3 | 8,696.5 | 9,392.2 | 10,002.7 | 10,552.9 | 11,027.7 | 11,413.7 | 11,756.1 | FY2026–FY2030 **consensus**; FY2031–35 **analyst assumption** |
| Revenue growth % | — | +17.2% | +13.3% | +9.5% | +10.0% | +8.0% | +6.5% | +5.5% | +4.5% | +3.5% | **+3.0%** | as above |
| EBITDA margin % (GAAP-derived) | 21.6% | 22.5% | 22.8% | 22.8% | 22.5% | 22.0% | 21.5% | 21.0% | 20.5% | 20.0% | **20.0%** | FY26–28 **consensus-derived**; FY29 onward **analyst assumption** (fade) |
| Tax rate % | 22.0 | 22.0 | 22.0 | 22.0 | 22.0 | 22.0 | 22.0 | 22.0 | 22.0 | 22.0 | 22.0 | **cross-module canonical** — `09_moat.md` §3 |
| Capex (% of revenue) | 2.39% | 2.6% | 2.6% | 2.6% | 2.6% | 2.4% | 2.4% | 2.4% | 2.4% | 2.4% | 2.4% | FY2026 **company-guided**; rest **analyst assumption** |
| Δ Working capital | NWC held at **13.0% of revenue** (revenue-linked driver — see below) | | | | | | | | | | | **analyst assumption**, calibrated to FY2025 year-end |

**Label on every line, as required.**

| Assumption | Label | Evidence |
|---|---|---|
| FY2026 revenue 5,435.3 | **Company-guided, corroborated by consensus.** Guidance implies $5,333.55–5,411.41m (mid 5,372.5); consensus is 5,435.3 (16 of 17 estimates), 0.44% above the guidance high end | `Q2 FY26 transcript, prepared remarks` (+37–39% reported sales growth); `Capital IQ Estimates export → Consensus`, FY2026 revenue; `→ Guidance`, guidance date 2026-07-31 |
| FY2027 6,368.6 / FY2028 7,215.7 | **Consensus** — 17 and 10 estimates | `Capital IQ Estimates export → Consensus`, Fiscal Years block |
| FY2029 7,904.3 / FY2030 8,696.5 | **Consensus, but thin — 3 and 2 estimates only.** Standard deviation on the FY2030 revenue line is $659.5m on a $8,696.5m mean. Used, and flagged as thin | `Capital IQ Estimates export → Consensus`, Fiscal Years block, "No. of Estimates" rows |
| FY2031–FY2035 growth fade 8.0% → 3.5% | **Analyst assumption, not company-guided.** A straight glide from the last consensus year to the terminal rate. No company statement supports growth beyond FY2026 | this agent |
| FY2026 EBITDA margin 22.1% (full year; 21.6% for the H2 stub) | **Consensus-derived.** Consensus adjusted EBITDA 1,225.0 less roughly $25m of recurring acquisition and restructuring costs the company itself adds back = a GAAP-derived $1,200m, i.e. 22.1%. The H2 stub is that full-year figure less the H1 actual of $612.8m (operating income 195.7 + 300.7, plus D&A 57.9 + 58.5) | `Capital IQ Estimates export → Consensus`, FY2026 EBITDA; `Q1/Q2 FY26 10-Q, statements of operations and cash flows` via `earnings/01_historical-financials.md` §3–§4 |
| FY2027 22.5% / FY2028 22.8% | **Consensus-derived** (adjusted EBITDA margin 22.94% / 23.23% less ~0.4pp of recurring add-backs) | `Capital IQ Estimates export → Consensus` |
| FY2029–FY2035 margin fade 22.8% → 20.0% | **Analyst assumption.** Consensus reaches only FY2030 and does so on 1–2 EBITDA estimates. The fade is the Cyclicality Gate applied: it walks the margin off the forecast peak to the mid-cycle level benchmarked in §5 | this agent; benchmarks in §5 |
| Tax 22.0% | **Cross-module canonical** — see §1 | `business-model/09_moat.md` §3 |
| FY2026 capex $130m | **Company-guided** — "about $130 million", up roughly 40% year on year | `Q2 FY26 transcript, prepared remarks`; `Capital IQ Estimates export → Guidance`, Capital Expenditure FY2026 = −130 |
| FY2027–FY2030 capex 2.6% of revenue | **Analyst assumption**, stepped up from the 2.4% five-year norm to carry the announced capacity build — three liquid-cooling plants committed | `business-model/07_business-quality.md` §1 (rate-of-change row, citing `Q2 FY26 transcript`); history: capex/revenue 2.46% FY2023, 2.46% FY2024, 2.40% FY2025 [`Capital IQ Financials export → Cash Flow` and `→ Income Statement`] |
| FY2031–FY2035 capex 2.4% of revenue | **Analyst assumption** — reversion to the company's own five-year norm once the build-out is absorbed | as above |
| Terminal growth 3.0% | **Analyst assumption.** Below long-run US nominal GDP (roughly 4.0–4.5%: about 2% real plus 2–2.5% inflation) and well below the 4.79% risk-free rate. No moat premium is embedded — see §5 | this agent; risk-free rate per §3 |

### Working capital scales with revenue — the driver, and the sign

**Driver used: net working capital held at 13.0% of revenue.** Net working capital here = (receivables including contract assets + inventory + prepaid + other current assets) − (payables + accrued expenses + unearned revenue + other current liabilities); cash, debt, lease liabilities and current tax payable are excluded. All balances are taken from one consistent source so the ratio is measured the same way in every period.

| Date | NWC (USD m) | Revenue basis | NWC / revenue |
|---|---:|---|---:|
| 31-Dec-2025 | 499.8 | FY2025 3,893.1 | **12.84%** |
| 30-Jun-2026 | 726.7 | LTM 4,834.0 | 15.03% |

Source for both: `Capital IQ Financials export → Balance Sheet`, columns Dec-31-2025 and Jun-30-2026 (tier-5 vendor export, consistent basis). FY2023 and FY2024 are **not** used as anchors because both balance sheets carry assets and liabilities held for sale from the Thermal Management divestiture inside "other current assets / liabilities" [`earnings/01_historical-financials.md` §1, footnote ʰ] — using them would measure a divestiture, not working capital.

**Why 13.0% and not 15.0%.** nVent's working capital is seasonal: it builds in the first half and releases in the second. In FY2025, 76% of the year's operating cash arrived in H2, and working capital released about $129.7m in H2 after consuming $153.2m in H1 [`earnings/06_earnings-quality.md` §2]. The 30-Jun-2026 reading of 15.03% is therefore a mid-year peak, not the run-rate. The **year-end** reading (12.84%) is the right anchor, and 13.0% is that figure rounded.

**This is a positive-working-capital business, so growth ABSORBS cash — and the modelled ΔNWC confirms the sign year by year.** The cash conversion cycle is **+76.4 days** (DSO 73.2 + DIO 62.6 − DPO 59.4, LTM Jun-2026) [`earnings/06_earnings-quality.md` §3]. That is the opposite of a negative-working-capital distributor: here rising revenue makes NWC rise, which **consumes** cash and **subtracts** from FCF. The one exception in the model is the H2-2026 stub, where NWC falls from the mid-year peak of 726.7 to a year-end 706.6 — a **release of $20.1m that ADDS to FCF**. The sign in every year of §4 is read off the actual modelled `ΔNWC = NWC_t − NWC_{t−1}`, not from a fixed column convention, and the direction check passes: NWC rising ⇒ FCF cut; NWC falling ⇒ FCF lifted.

**Cross-check against the filings, and the conservatism it exposes.** The model's implied full-year FY2026 working-capital absorption is 706.6 − 499.8 = **$206.8m**, against **$218.4m** actually consumed in H1 FY26 on the filed basis [`Q2 FY26 10-Q, statements of cash flows`, via `earnings/06_earnings-quality.md` §2]. So the model implies a broadly flat H2 on working capital. The company's own FY2026 guidance of 90–95% free-cash-flow conversion implies a **much larger** H2 release: at the guidance midpoint that is roughly $768m of company-defined FCF, or about $820m of FCFF, against this model's $678m — a gap of about **$141m, essentially all of it working capital**. `earnings/06_earnings-quality.md` §2 calls that conversion target "demanding but not out of line with the company's own recent shape… a live test, not yet a failure". **This model does not grant the company's implied release.** That is a deliberate, stated conservatism; adopting it would raise the FY2026 cash flow by about $141m and the per-share value by roughly $0.8.

---

## 3. Discount Rate (WACC)

*(Plain meaning: the WACC — weighted-average cost of capital — is the blended annual return the company's lenders and shareholders together require. It is the rate future cash is discounted at, and it is the single most value-determining input in this report.)*

| Component | Value | Source |
|---|---:|---|
| Risk-free rate (rf) | **4.79%** | US 10-year Treasury yield. `Web: tradingeconomics.com US 10-Year government bond yield, retrieved 2026-09-07` (4.79% at the 2026-09-04 close, unchanged 2026-09-07) — **web-sourced, dated, unverified**; not in the data pool |
| Equity-risk premium (ERP) | **4.23%** | Damodaran implied ERP for US equities at the start of 2026, over the 10-year Treasury. `Web: aswathdamodaran.substack.com, "Data Update 2 for 2026", retrieved 2026-09-07` — **web-sourced, dated, unverified**; not in the data pool |
| Beta (equity, 5-year monthly, vs S&P 500) | **1.36** | `Web: finance.yahoo.com/quote/NVT, Beta (5Y Monthly), retrieved 2026-09-07` — **web-sourced, dated, unverified**; not in the data pool |
| **Cost of equity (k_e) = rf + β × ERP** | **10.54%** | 4.79% + 1.36 × 4.23% — computed, see snippet in §4 |
| Pre-tax cost of debt (k_d) | **5.30%** | Blend of (a) the **embedded** weighted-average coupon of **4.62%** — term loan 4.903% on $268.2m, 4.550% notes $500m, 2.750% notes $300m, 5.650% notes $500m [`Q2 FY26 10-Q, Note 10 (Debt)`] — and (b) the **marginal** market rate: ICE BofA BBB US Corporate index effective yield **5.59%** for August 2026 [`Web: tradingeconomics.com / FRED BAMLC0A4CBBBEY, retrieved 2026-09-07` — web-sourced, unverified]. 5.30% sits between the two because the cheapest tranche (2.750%, due 2031) reprices toward market as it matures and the company has said it will fund Maverick Power with new debt |
| Tax rate (t) — the debt shield | **22.0%** | Same normalized rate as NOPAT — `business-model/09_moat.md` §3 (see §1) |
| After-tax cost of debt = k_d × (1 − t) | **4.13%** | 5.30% × 0.78 |
| Equity weight (w_e) / debt weight (w_d) | **94.89% / 5.11%** | Market value of equity = market cap **27,703.6** at the pool-verified anchor price of $171.16 (close 2026-08-12); debt at carrying value **1,492.4** (filing debt-note basis) — both taken verbatim from `01_price-and-capital-structure` §7 Anchor Block. Debt is investment-grade and carried near par, so book is used as a market-value proxy; stated, not assumed silently. Weights sum to 1.000000 |
| **WACC** | **10.22%** | `0.948883 × 10.5428% + 0.051117 × 4.1340% = 10.2152%` — produced by the executed snippet in §4, not assembled by hand |

**Formula, pinned:** `WACC = w_e·k_e + w_d·k_d·(1 − t)`. There is **no preferred equity and no minority interest** on this balance sheet [`Q2 FY26 10-Q, Condensed Consolidated Balance Sheets`; `Capital IQ Financials export → Key Stats`, "Pref. Equity –", "Total Minority Interest –"], so no `w_p·k_p` term exists. `k_e` is the CAPM cost of equity; `k_d` is the pre-tax cost of debt; `(1 − t)` is the debt tax shield — interest is tax-deductible, so debt costs the company less than its coupon.

**No analyst override was applied.** The used WACC **is** the mechanically-computed WACC, 10.22%. Nothing was adjusted by judgment, so the ±1.5pp override discipline is not engaged.

**Sanity bounds — checked and cleared (MODULE_RULES Economic Consistency Gate 4).**

| Test | Requirement | Result |
|---|---|---|
| Arithmetic band | `after-tax k_d ≤ WACC < k_e` | **4.13% ≤ 10.22% < 10.54% — PASSES.** The WACC sits strictly below the cost of equity, as it must for a firm carrying debt |
| High-side ceiling (developed-market large-cap) | `k_e` not materially above `rf + 1.4 × ERP` | `rf + 1.4 × ERP = 10.71%`; `k_e = 10.54%` — **below the ceiling.** The beta of 1.36 is the actual sourced 5-year monthly figure, not an assumption, and is under 1.4 |
| **Low-side floor 1 — equity-risk-premium floor** | `k_e − rf ≥ ~4pp` | **5.75pp — PASSES.** This is a genuine equity cost of capital, not a bond yield with a garnish |
| **Low-side floor 2 — beta floor** | `β ≥ ~0.8` for a cyclical / commodity-input / price-competed business | **1.36 — PASSES, with source, window and index stated:** 5-year monthly beta against the S&P 500, `Web: finance.yahoo.com/quote/NVT, retrieved 2026-09-07`. No flooring or re-levering was needed. The figure is consistent with the business: `10_external-dependency.md` scores external dependency 60/100 (inverted) and the copper/steel/resin input exposure and price competition are documented there |
| **Low-side floor 3 — country / single-market risk** | State a country-risk premium, or state the omission deliberately | **No country-risk premium is added, and that is a deliberate stated choice.** Cash flows are 81% Americas, 15% EMEA, 4% Asia-Pacific [`ciq_facts.json` `geographic`, 12 months Dec-31-2025], the reporting and cash-flow currency is USD (a reserve currency), and the risk-free rate used is the US Treasury. There is no emerging-market or non-reserve-currency concentration to price |
| Terminal `g` vs nominal growth | `g` ≤ long-run nominal GDP for the currency's economy | **3.0% vs roughly 4.0–4.5% US nominal GDP — PASSES**, and `g` is also well below the 4.79% risk-free rate |

**Cross-check against the moat module's cost of capital (Gate 4).** `business-model/09_moat.md` §3 runs its economic-moat test at the **10.0%** rate nVent discloses. This model's 10.22% is **0.22pp above** it — far inside the 2pp divergence trigger, so no spanning grid is required. The two modules stand on the same cost of capital, and the §7 grid spans 9.22%–11.22%, which contains both.

---

## 3A. Cost-of-Capital Reality Test (mandatory — CLAUDE.md §16, MODULE_RULES Gate 4)

**The filings were searched for disclosed discount rates, and each was scope-tested before use.** Three exist in this pool. Only one clears the five-way match (valuation object, cash-flow geography, currency, pre-/post-tax basis, method).

| Reference | Rate | Source (cited per §5) | Gap vs model WACC |
|---|---:|---|---:|
| **Model WACC (CAPM build, §3)** | **10.22%** | this agent, §3 | — |
| **Scope-matched group discount rate** | **10.00%** | `FY24 10-K, MD&A — Critical Accounting Estimates, Goodwill and indefinite-lived intangibles, p.32`: *"Discount rate assumptions for each reporting unit take into consideration our assessment of risks inherent in the future cash flows of the respective reporting unit and **our weighted-average cost of capital**. We utilized a **10.0% discount rate for each reporting unit**…"* | model is **+0.22pp above** |
| Other disclosed rate — lease incremental borrowing rate (**comparator only**) | 5.1% operating / 6.0% finance | `FY24 10-K, lease note` — weighted-average discount rate on lease liabilities, 31-Dec-2024 | −5.1pp / −4.2pp |
| Other disclosed rate — pension obligation discount rate (**comparator only**) | 1.00%–5.39% (2024 range) | `FY24 10-K, pension note — Discount rates` | −9.2pp to −4.8pp |
| Market-implied rate | **Not yet available** | `05_reverse-dcf` runs **after** this agent (MODULE_RULES → Execution Layers) and inverts this model — reconcile there | n/a |
| Company's own trailing FCF yield | 1.69% levered / 2.38% on the §15 basis | Levered FCF 468.2 ÷ market cap 27,703.6 [`ciq_facts.json` `levered_fcf_m`; `01_price-and-capital-structure` §3]; §15 FCF 659.9 ÷ 27,703.6 [`earnings/01_historical-financials.md` §2] | −8.5pp / −7.8pp |
| Company's own trailing earnings yield | 2.10% | 1 ÷ P/LTM EPS 47.5x [`ciq_facts.json` `pe_ltm_current_x`; `Capital IQ Financials export → Multiples`, Close 2026-08-12] | −8.1pp |
| Peer / industry cost of capital | **Not evidenced.** No peer WACC exists in this pool (`ciq_facts.json` `peer_ev_ebitda: missing` — "CIQ 'comps' export not found") | — | — |

**Why the 10.0% clears the scope test where a normal impairment rate would not.** A CGU or reporting-unit rate is usually a comparator only. This one is different, and the reason is on the face of the disclosure: **the same single rate is applied to *every* reporting unit**, so it spans the whole consolidated group rather than one carved-out unit. The cash flows it discounts are the group's own operating cash flows in **USD**, the same currency as this model; it is an **after-tax** rate applied to after-tax cash flows, the same basis as this model; and the company names it **its weighted-average cost of capital**, the same method. Five-way match. **One limitation, stated not hidden:** it is the **FY2024** rate, because the FY2025 10-K is absent from this pool [`00_valuation-data-triage` §6]. Management's own capital-allocation hurdle — *"Target ROIC > WACC in 3 years"* [`Q1 FY26 earnings presentation, 2026-05-01, slide 9`] — corroborates that the company runs to this rate.

**The lease and pension rates are comparators only and cannot anchor this valuation.** The lease rate is a *collateralized borrowing* rate, not a cost of capital; the pension rate is an *obligation settlement* rate matched to high-quality fixed-income instruments. Both fail the method match, and the pension rate additionally spans multiple currencies and plan geographies. Neither may trigger a re-run of the DCF.

**Escalation: the trigger did NOT fire.** The model WACC of 10.22% is **above**, not below, the scope-matched group rate of 10.00% — the gap is +0.22pp, nowhere near the "more than ~3pp below" threshold. The market-implied rate is not yet computable because `05_reverse-dcf` runs after this agent; there is therefore no "below two-thirds of the market-implied rate" test to fail here, and `05` is instructed to reconcile against this rate rather than re-derive one. Because no escalation branch was taken, **no `RF-VAL-003` tag is emitted** — the tag is mandatory only when the trigger fires, and it did not.

**On the low trailing yields — tested, not assumed away.** nVent's own trailing free-cash-flow yield (1.69–2.38%) and earnings yield (2.10%) sit roughly 8pp *below* the model WACC. Under §16 the first hypothesis when a model rate sits far below outside reads is that the model rate is wrong — but here the model rate is far *above* those yields, which is the opposite configuration. The low yields are what a market pricing rapid growth looks like, not evidence of a 2% cost of capital; `09_moat.md` §3 reaches the same conclusion on the same two numbers. No adjustment is made.

---

## 4. Free Cash Flow Forecast & Discounting

**FCFF identity used (MODULE_RULES Gate 1, option b):** `FCFF = NOPAT + D&A − capex − ΔNWC`, where `NOPAT = EBIT × (1 − 22.0%)` and `EBIT = EBITDA − D&A`. This definition is used consistently and is never mixed with the `CFO − capex` route; the two are **reconciled** on the base year in §1 and again at the foot of this section. *(Plain meaning: NOPAT is operating profit after tax but before any interest; D&A — depreciation and amortisation — is added back because it is a bookkeeping charge, not cash leaving the business.)*

**Discounting convention: mid-year (t − 0.5), the default.** Cash arrives across the year, not on 31 December, so each year is discounted from its mid-point. From the 30-Jun-2026 valuation date, FY2027's mid-point (30-Jun-2027) is exactly **t = 1.0**, FY2028's is **t = 2.0**, and so on; the H2-2026 stub's mid-point (30-Sep-2026) is **t = 0.25**. The terminal value is a value as at 31-Dec-2035 and is discounted at **t = 9.5**. No end-of-year discounting is used anywhere.

**D&A is modelled in two parts, because they behave differently.** *Depreciation* is 1.5–1.6% of revenue and tracks the capex cycle. *Intangible amortisation* from past acquisitions runs off on a schedule — $150m in FY2026 falling to $85m by FY2035 — against the $1,793.3m of net intangibles on the 30-Jun-2026 balance sheet [`Q2 FY26 10-Q, Condensed Consolidated Balance Sheets`]. Amortisation is added back in full (it is non-cash) but its run-off is *not* replaced by new capex, because no future acquisitions are modelled.

```
$ python3 dcf3.py
Yr             Rev   EBITDA     EBIT    NOPAT     D&A   Capex     dNWC     FCFF     DF       PV
H2-2026     2722.0    588.4    474.8    370.3   113.6    72.4    -20.1    431.7 0.9760    421.3
FY2027      6368.6   1432.9   1187.4    926.2   245.5   165.6    121.3    884.8 0.9073    802.8
FY2028      7215.7   1645.2   1384.7   1080.1   260.5   187.6    110.1   1042.8 0.8232    858.5
FY2029      7904.3   1802.2   1535.7   1197.9   266.5   205.5     89.5   1169.3 0.7469    873.4
FY2030      8696.5   1956.7   1682.6   1312.4   274.1   226.1    103.0   1257.5 0.6777    852.2
FY2031      9392.2   2066.3   1791.0   1397.0   275.3   225.4     90.4   1356.4 0.6149    834.0
FY2032     10002.7   2150.6   1875.5   1462.9   275.0   240.1     79.4   1418.5 0.5579    791.4
FY2033     10552.9   2216.1   1942.3   1515.0   273.8   253.3     71.5   1464.0 0.5062    741.1
FY2034     11027.7   2260.7   1989.2   1551.6   271.4   264.7     61.7   1496.7 0.4593    687.4
FY2035     11413.7   2282.7   2015.1   1571.8   267.6   273.9     50.2   1515.3 0.4167    631.4
SUM PV explicit FCFF = 7493.4
```

**Sum of the present values of the explicit forecast free cash flows: USD 7,493.4m.**

**Working-capital sign check, per year, done explicitly.**

| Year | Modelled ΔNWC | Direction of NWC | Cash effect | Effect on FCFF |
|---|---:|---|---|---|
| H2-2026 | **−20.1** | falls (mid-year peak releases into year-end) | **release** | **ADDS +20.1** |
| FY2027 | +121.3 | rises | absorbs | subtracts 121.3 |
| FY2028 | +110.1 | rises | absorbs | subtracts 110.1 |
| FY2029 | +89.5 | rises | absorbs | subtracts 89.5 |
| FY2030 | +103.0 | rises | absorbs | subtracts 103.0 |
| FY2031 | +90.4 | rises | absorbs | subtracts 90.4 |
| FY2032 | +79.4 | rises | absorbs | subtracts 79.4 |
| FY2033 | +71.5 | rises | absorbs | subtracts 71.5 |
| FY2034 | +61.7 | rises | absorbs | subtracts 61.7 |
| FY2035 | +50.2 | rises | absorbs | subtracts 50.2 |

The direction matches the business: with a cash conversion cycle of **+76.4 days**, a growing nVent ties up more cash each year, so the working-capital line **cuts** FCFF in every growth year. That is the correct sign for a positive-working-capital company and is not inverted. The single release is the H2-2026 seasonal unwind, and it correctly **adds**.

**WACC blend — executed, not eyeballed.**

```
$ python3 dcf.py
=== WACC BLEND (formula: w_e*k_e + w_d*k_d*(1-t)) ===
k_e (CAPM) = 0.0479 + 1.36*0.0423 = 0.105428  -> 10.54%
k_d pre-tax 5.30% ; after-tax = 4.134%
w_e = 0.948883 (94.89%) ; w_d = 0.051117 (5.11%) ; sum = 1.000000
WACC = 0.948883*0.105428 + 0.051117*0.041340 = 0.102152 -> 10.22%
GATE: after-tax k_d 4.13% <= WACC 10.22% < k_e 10.54% ? True
FLOOR: k_e - rf = 5.75pp (need >= ~4pp); beta 1.36 (need >= 0.8)
HIGH-SIDE CEILING: rf + 1.4*ERP = 10.71%  vs k_e 10.54%
```

**Reconciliation of the two FCFF routes on the base year (Gate 1 — the definitions must tie).**

```
$ python3 dcf3.py  (tail)
FY2026 model FCFF = H1 actual FCFF + H2 model:
  H1 CFO 278.7 - capex 57.6 + after-tax interest 25.7 = 246.8 ; H2 model 431.7 ; FY2026 total 678.5
Company FY2026 guide implies FCFF ~= 0.925*830.7 + 0.78*65.9 = 819.8  (gap vs model = 141.3)
LTM Jun-26 actual FCFF = CFO 772.8 - capex 112.9 + after-tax interest 58.4 = 718.3
```

The filed H1 FY2026 cash flow statement plus this model's H2 gives **$678.5m** of FY2026 FCFF, against **$718.3m** actually delivered in the LTM to 30-Jun-2026 and **$819.8m** implied by the company's own 90–95% conversion guidance. The model therefore sits **below both** the trailing actual and the guidance — the working-capital conservatism explained in §2, quantified at about $141m.

---

## 5. Terminal Value

**Method: Gordon growth, with the terminal return on capital pinned to the cost of capital.**

**Formula, written out rather than applied from memory:**

`TV = FCFF_{n+1} / (WACC − g)`, where `FCFF_{n+1} = NOPAT_{n+1} × (1 − g / ROIC_terminal)`

The `(1 − g / ROIC)` term is the **reinvestment charge** — growth is not free, and a company growing at `g` while earning `ROIC` must plough back `g / ROIC` of its after-tax operating profit to fund it. Setting `ROIC_terminal = WACC` collapses the whole expression to `TV = NOPAT_{n+1} / WACC` — the identity that says a business earning exactly its cost of capital creates **no value from growth**. That is precisely what "no perpetual excess return" means, and the model prints both forms and confirms they agree to the dollar.

**`WACC − g` is comfortably positive: 10.2152% − 3.0% = 7.22pp.** Nowhere near the 1–2pp convergence zone where the denominator collapses and the terminal value explodes. Across the entire §7 grid the smallest gap is 9.22% − 3.5% = **5.72pp**, so **no grid cell is NM or invalid** and none needs suppressing.

**Terminal assumptions and the base result.**

```
$ python3 dcf3.py
=== BASE TERMINAL (Gordon, terminal ROIC = WACC -> no perpetual excess return) ===
Rev_T 11756.1 @ EBITDA margin 20.0% ; D&A=capex 2.4% ; EBIT_T 2069.1 (17.6% margin) ; NOPAT_T 1613.9
reinvestment = g/ROIC = 0.03/0.102152 = 29.4% ; FCFF_n+1 = 1613.9*(1-0.2937) = 1139.9
TV = 1139.9/(0.102152-0.03) = 15798.8   [identity check NOPAT/WACC = 15798.8]
PV(TV) @ t=9.5 = 6270.9 ; EV = 7493.4+6270.9 = 13764.3 ; TV%EV = 45.6%
EV 13764.3 - net debt 1236.4 - MI 0 - pref 0 = equity 12527.9 ; /164.2m = $76.30/sh
Implied exit EV/EBITDA on FY2035 EBITDA 2282.7 = 6.92x
vs price 171.16 -> -55.4% ; vs 156.03 -> -51.1%
```

- **Terminal value (undiscounted): USD 15,798.8m**
- **PV of terminal value: USD 6,270.9m**
- **Terminal value as % of total EV: 45.6%** — comfortably **below the 75% terminal-dominance flag**. The ten-year explicit horizon is what keeps it there; on a five-year horizon the same assumptions would put more than three-quarters of the value in the terminal and trip the low-confidence cap.

### The mid-cycle terminal margin — benchmarked against peer-normal AND the company's own prior trough (Cyclicality Gate)

The terminal EBITDA margin of **20.0%** implies a terminal **EBIT margin of 17.6%**. It is not set by "below the recent peak"; it is placed inside a cited range with both anchors named.

| Anchor | Level | Source |
|---|---:|---|
| **Peer-normal (upper anchor)** | Hubbell **20.7%** group GAAP operating margin (22.7% adjusted); Legrand **20.7%** adjusted operating margin | `business-model/09_moat.md` §2 peer table, inherited from `08_competitive-map.md` §2d (Hubbell FY2025 results release, 2026-02-03; Legrand FY2025 results release, 2026-02-12 — company releases, unverified web copies) |
| **Company's own prior trough (lower anchor)** | FY2022 EBIT margin **13.5%** on the filing basis (**16.2%** on the Capital IQ basis; the gap is a $58.5m pension-income classification, itemised in `earnings/01` §1); FY2022 EBITDA margin **17.2%** | `earnings/01_historical-financials.md` §1; `Capital IQ Financials export → Income Statement` |
| **Company's own recent normal** | EBIT margin 17.3% (FY2023), 17.5% (FY2024), 15.8% (FY2025); EBITDA margin 21.6% / 22.4% / 21.2% | `earnings/01_historical-financials.md` §1 |
| **Recent / forecast peak — rejected as a terminal** | Q2 FY26 GAAP operating margin **20.4%**; LTM EBITDA margin **22.2%**; the model's own FY2028–29 forecast peak **22.8%** | `Q2 FY26 10-Q, MD&A`; `ciq_facts.json` `margin_trend`; §2 above |
| **Terminal set here** | **EBIT 17.6% / EBITDA 20.0%** | **Between the anchors:** about 3.1pp below peer-normal EBIT, about 1.4–4.1pp above the company's own prior-trough EBIT, and roughly at its own FY2023–FY2024 normal — while sitting 2.8pp of EBITDA margin **below** the forecast peak |

`earnings/01` and `01_price-and-capital-structure` both flag the latest period as a cycle peak, so a terminal at or near that peak is rejected outright. The evidence supports a mid-cycle placement, not a trough: the pre-boom EBITDA margin was 21.2–22.4% in FY2023–FY2025 and only 17.2% in FY2022, a year distorted by the pension classification. Placing the terminal at 20.0% is a real haircut without imposing a trough the history does not support.

### Financeable-growth cross-check (MODULE_RULES Gate 2) — run, and it drives the terminal design

```
$ python3 dcf3.py
=== FINANCEABLE-GROWTH CROSS-CHECK (Gate 2) ===
IC(total, 30-Jun-26)=5479.3 ; tangible IC=1307.4
cum capex 2114.6 ; cum D&A 2523.4 ; cum intangible amort ~1320.0 ; cum depreciation ~1203.4
implied net PP&E FY2035 1491.8 (13.1% of revenue, vs 12.0% today)
implied NWC FY2035 1483.8 ; tangible IC FY2035 2975.6 (26.1% of revenue vs 27.0% today)
ROIC on tangible IC FY2035 = 52.8% ; on tangible IC + goodwill/intangibles held flat = 21.1%
FY2035 reinvestment rate (capex-D&A+dNWC)/NOPAT = 3.6%
implied g = ROIC(incl goodwill) x reinvestment = 0.76%  vs modelled terminal g 3.0%
TERMINAL reinvestment charged = 29.4% at ROIC_T 10.22% -> implied g 3.00% = modelled g 3.0% (CONSISTENT by construction)
```

**Read this in two halves, because they say different things.**

- **The explicit period is financeable on tangible capital.** Cumulative capex of $2,114.6m against roughly $1,203.4m of depreciation leaves net property, plant and equipment at about 13.1% of revenue in FY2035 against 12.0% today, and working capital is held at 13.0% throughout. Tangible invested capital ends at 26.1% of revenue against 27.0% today. The forecast does not conjure revenue out of no capital.
- **A conventional terminal would have FAILED Gate 2, so it was not used.** Setting terminal capex equal to D&A — the usual shortcut — charges reinvestment of only **3.6% of NOPAT**, which at the company's own returns finances growth of about **0.76%**, against a modelled 3.0%. That is a **2.24pp gap and no bridge**, well past the 1.5pp trigger. Rather than flag it and carry on, the terminal was **rebuilt** to charge the full reinvestment `g / ROIC = 29.4%` of NOPAT. The modelled `g` and the financeable `g` are now equal by construction. That rebuild costs about **$14.4/share** against the shortcut version, and taking that cost is the point of the gate.

**Terminal ROIC drift (Gate 3), and why there is no persistence premium.** `business-model/09_moat.md` §5 returns **"No moat proven — a moat in structure, not in economics"**: through-cycle return on capital of **8.10%** (FY2022–FY2025, computed NOPAT basis at the same 22.0% tax rate) against the company's own **10.0%** disclosed cost of capital — a gap of about −190bps — clearing the rate only in the peak LTM year, only on the more generous of two measurement bases. No evidence supports persistent excess returns, so terminal ROIC is set **equal to the WACC**. That is the §5(a) requirement applied literally: **a fade to the cost of capital with no moat premium, not a decline.**

### Structural-decline / runoff terminal (avoid-ruin, CLAUDE.md §24 Filter 5)

**Which trigger fired, and on what row.** Both limbs of the §5 rule engage, and they do different things:

- **Limb (a) — "No moat proven".** `business-model/09_moat.md` §5. This is an *unproven*, not a *decaying*, franchise. It is handled **inside the base case above**: terminal ROIC faded to the cost of capital, terminal `g` at 3.0% with no moat premium. **A fade, not a runoff.**
- **Limb (b) — rate-of-change / disruption ≤ 40.** `business-model/07_business-quality.md` §1 scores **industry rate-of-change 40/100**, tripping CLAUDE.md §24 Filter 5 and emitting `RF-BQ-005`. The cited evidence: liquid cooling is "maybe it's now 10% to 15% of cooling in data centers", the 800-volt DC rack architecture is unsettled, and chip roadmaps are being rewritten out to 2030 [`Q2 FY26 transcript, Q&A`], while 100% of the growth and 100% of the incremental capital sit in that fast-changing part. **This limb requires a declining-perpetuity terminal to be built and shown beside the base.**

```
$ python3 dcf3.py
=== RUNOFF / STRUCTURAL-DECLINE TERMINAL (bear input; nominal g 0.0% = negative real) ===
Rev_T 11413.7 @ 17.5% EBITDA margin ; NOPAT_T 1344.3 ; TV = 13159.9 ; PV(TV)=5223.5
EV 12716.8 ; equity 11480.4 ; $69.92/sh ; TV%EV 41.1% ; exit x 5.76x
```

| Terminal | Nominal `g` | Real `g` | Terminal EBITDA margin | TV | PV(TV) | EV | **Per share** |
|---|---:|---:|---:|---:|---:|---:|---:|
| **Base — fade to cost of capital (§5(a))** | **+3.0%** | about +0.7% | 20.0% (mid-cycle) | 15,798.8 | 6,270.9 | 13,764.3 | **$76.30** |
| **Runoff / structural decline (§5(b), the BEAR input)** | **0.0%** | about **−2.3%** | **17.5%**, non-recovering | 13,159.9 | 5,223.5 | 12,716.8 | **$69.92** |

**The runoff is stated on the same nominal basis as the rest of this model — no real rate is smuggled in.** US expected inflation is roughly 2.3%, so a **0.0% nominal** terminal growth rate is a **negative real** growth rate of about −2.3% a year in perpetuity: the franchise shrinks in real terms forever. The terminal EBITDA margin is faded to **17.5%**, at the company's own FY2022 trough level (17.2%) and roughly 3pp below peer-normal, and it does **not** recover.

**This runoff does NOT replace the base.** `04` publishes **one** base intrinsic value — **$76.30** — and the runoff at **$69.92** sits beside it as the structural-impairment input that `07_scenario-and-fair-value` may use to build a `bear_structural` case and that the master synthesizer reads for its §24 / Kill Criteria work. It is the equity-side counterpart to the balance-sheet-survival module's debt-solvency test.

### Exit-multiple cross-check (the second lens on the terminal)

```
$ python3 dcf3.py
=== EXIT-MULTIPLE CROSS-CHECK (TV = FY2035 EBITDA x multiple) ===
   6.9x -> TV  15750.9 ; PV(TV)   6251.9 ; EV   13745.3 ; $  76.18/sh
   9.0x -> TV  20544.7 ; PV(TV)   8154.6 ; EV   15648.0 ; $  87.77/sh
  12.0x -> TV  27392.9 ; PV(TV)  10872.9 ; EV   18366.2 ; $ 104.32/sh
  15.0x -> TV  34241.1 ; PV(TV)  13591.1 ; EV   21084.4 ; $ 120.88/sh
```

**The two lenses are cross-read, in both directions, as the rule requires.** The Gordon terminal implies an exit multiple of **6.92x** FY2035 EBITDA. That is low against where nVent trades today (TEV/LTM EBITDA **26.2x**, on a short 6-close range of 15.4–30.3x with a median of 23.2x [`ciq_facts.json` `range_position`]) and low against where mature electrical-equipment peers typically trade. **Neither number is wrong — the gap between them IS the finding**, and it is exactly the arithmetic of a no-excess-return terminal: a business earning precisely its 10.2% cost of capital is worth `NOPAT ÷ WACC`, which on a 69% NOPAT-to-EBITDA conversion is about 6.8x EBITDA, whatever multiple the market is paying today. Read the other way: **even a 15.0x exit multiple — a mature-industrial multiple, well above the implied 6.9x and still far below today's 26.2x — produces only $120.88 a share**, still 22.5% below the fresher indicative price of $156.03. The terminal assumption is not what closes the gap to the market price.

---

## 6. DCF Output

Bridge components taken **verbatim** from `01_price-and-capital-structure` §7 Anchor Block (MODULE_RULES → Reconciliation Gate 1). No component is re-derived and none is substituted.

| Step | Value (USD m unless stated) |
|---|---:|
| PV of explicit FCFs (H2-2026 → FY2035, mid-year convention) | **7,493.4** |
| + PV of terminal value (Gordon, terminal ROIC = WACC, g = 3.0%, discounted at t = 9.5) | **6,270.9** |
| **= Enterprise value** | **13,764.3** |
| − Net debt (**strict §15 basis**; broad basis identical — no short-term investments) | **(1,236.4)** |
| − Minority / non-controlling interest | (0.0) |
| − Preferred equity | (0.0) |
| + Equity-method investments | 0.0 |
| **= Equity value** | **12,527.9** |
| ÷ Diluted shares (fully diluted, `01` §2: 161.858m + 2.3m treasury-stock-method increment; no convertibles) | **164.2m** |
| **= Intrinsic value per share** | **USD 76.30** |
| vs current price — **pool-verified anchor USD 171.16 (close 2026-08-12)** | **−55.4%** |
| vs current price — **indicative refresh USD 156.03 (close 2026-09-04, web-sourced, unverified)** | **−51.1%** |

**Anchor-consistency statement.** Net debt of **1,236.4** is `01`'s canonical strict-basis figure (total debt 1,492.4 on the filing debt-note basis, less cash 256.0), which is itself `balance-sheet-survival/01_capital-structure-and-leverage.md`'s filing-verified number. The Capital IQ vendor figure of 1,376.9 is **not** used; the entire $140.5m difference is operating-lease liabilities, and the filing wins under CLAUDE.md §4. Share count 164.2m is `01`'s per-share fair-value count. Nothing here diverges from `01`.

**Price staleness carried forward.** `01` tags the price-state **`pool-verified`** but flags the anchor as **26 calendar days / about 17–19 trading days stale**, with a corroborated indicative refresh at **$156.03** (a −8.84% drift) and a **valuation-confidence cap of 60**. Both price comparisons are shown above, and the fresher one is stated. **The fair-value level of $76.30 is price-independent and does not move when the anchor is re-anchored** — only the percentage comparisons do.

---

## 7. Sensitivity Grid (per-share intrinsic value)

**Required grid — WACC across columns, terminal growth down rows.** Terminal ROIC is held at 10.22% (the base cost of capital) as a property of the business rather than of the discount rate; the terminal EBITDA margin stays at 20.0%.

| | WACC 9.22% | **WACC 10.22%** | WACC 11.22% |
|---|---:|---:|---:|
| g +0.5% (3.5%) | 89.21 | 76.48 | 66.94 |
| **g 3.0% (base)** | 88.39 | **76.30** | 67.07 |
| g −0.5% (2.5%) | 87.66 | 76.11 | 67.17 |

**Grid guard:** the smallest `WACC − g` in the table is 9.22% − 3.5% = **5.72pp**. No cell is at or near zero, so **no cell is NM or invalid** and every figure is a real number.

**Read the flatness down the rows — it is a finding, not a bug.** Moving terminal growth by a full percentage point moves the value by under $1.60 a share at the base WACC. That is the direct consequence of the no-excess-return terminal: when a business earns exactly its cost of capital, **growth creates no value**, so the terminal value collapses to `NOPAT ÷ WACC` and barely responds to `g`. Almost all the dispersion in this DCF comes from the **discount rate** and from the **terminal profitability**, not from growth. Two supplementary grids show where the value actually moves.

**Supplementary grid A — WACC × terminal return on capital** (the live swing factor; 13.6% is the peer level from Hubbell/Legrand, 9.0% is roughly nVent's own recent clean-year return):

| ROIC_terminal | WACC 9.22% | **WACC 10.22%** | WACC 11.22% |
|---|---:|---:|---:|
| 13.6% (peer level) | 93.39 | 80.25 | 70.26 |
| 12.0% | 91.38 | 78.66 | 68.98 |
| **10.22% = WACC (base)** | 88.39 | **76.30** | 67.07 |
| 9.0% (nVent's own FY2025 clean-year level) | 85.67 | 74.15 | 65.34 |

**Supplementary grid B — WACC × terminal EBITDA margin** (the Cyclicality Gate swing; 22.5% is the forecast peak, 17.5% is the FY2022 trough):

| Terminal EBITDA margin | WACC 9.22% | **WACC 10.22%** | WACC 11.22% |
|---|---:|---:|---:|
| 22.5% (at the forecast peak — rejected as a base) | 95.26 | 81.72 | 71.45 |
| 21.5% | 92.51 | 79.55 | 69.70 |
| **20.0% (base, mid-cycle)** | 88.39 | **76.30** | 67.07 |
| 18.5% | 84.27 | 73.04 | 64.45 |
| 17.5% (own FY2022 trough level) | 81.52 | 70.87 | 62.70 |

**The full dispersion across all three grids is $62.70 to $95.26.** Every cell in every grid sits below both the $171.16 anchor and the $156.03 indicative price.

---

## 8. Intrinsic Read

**On discounted cash flow, nVent is worth $76.30 a share — the single base-case point — against a pool-verified anchor price of $171.16 (close 2026-08-12) and a fresher indicative $156.03 (close 2026-09-04), i.e. 55.4% and 51.1% below.** The sensitivity grids put the dispersion around that point at **$66.94–$89.21** on the required WACC-by-growth grid and **$62.70–$95.26** across the wider WACC-by-terminal-ROIC and WACC-by-margin grids; the structural-decline terminal required by the rate-of-change trigger gives **$69.92** as the bear input, and even a 15x exit multiple on FY2035 EBITDA reaches only **$120.88** — no cell anywhere in this model touches the traded price.

**The single assumption the answer is most sensitive to is not growth — it is the terminal return on capital, and behind it the discount rate.** Moving terminal growth a full percentage point moves the value by under $1.60 a share, because the base terminal pins return on capital to the cost of capital, and a business earning exactly its cost of capital creates no value by growing. Move that terminal return to the peer level of 13.6% and the value goes to $80.25; move the WACC down a point and it goes to $88.39. Both together reach $93.39 — still 40% below the fresher price.

**The gap between $76 and $156 is the whole story of this stock, and it is a disagreement about the terminal, not about the next three years.** This model takes consensus revenue and margin unchanged through FY2030 — a business almost doubling in five years — and still lands at less than half the price, because it refuses to capitalise a return above the cost of capital into perpetuity for a company whose own filings disclose a 10.0% weighted-average cost of capital and whose through-cycle return on capital is 8.1%. `05_reverse-dcf` inverts exactly this model, at this WACC (10.22%) and this normalized FCFF base ($718.3m LTM), and will name what the market is assuming instead.

---

### Confidence and limitations carried to `07` and `99`

- **Terminal value is 45.6% of enterprise value** — below the 75% terminal-dominance flag, so no terminal-dominance cap arises from this agent. The exit-multiple second lens is nonetheless provided in §5.
- **A cash flow statement exists and forward estimates exist**, so neither the "proxied FCF" nor the "no consensus" partial-data cap applies to this agent.
- **Genuine limitations, stated:** (1) the **FY2025 Form 10-K is absent from this pool**, so FY2025 annual figures used above are Capital IQ vendor or company-deck sourced and are cited as such, never to a filing; (2) **FY2029 and FY2030 consensus rests on 3 and 2 estimates**, and FY2031–FY2035 is entirely this agent's assumption; (3) the company's disclosed 10.0% cost of capital is the **FY2024** rate, for the same reason as (1); (4) the risk-free rate, equity-risk premium, beta and BBB index yield are **web-sourced, dated and unverified** — none is in the data pool; (5) the model is **pre-Maverick-Power on both the cash-flow and the debt side**, and (6) the value is struck as at **30-Jun-2026**, about 1.9% below what a roll-forward to the 2026-09-07 run date would give.
- **`01`'s price-staleness cap of 60 on valuation confidence** travels with every price comparison in this report.



---

## valuation / 05_reverse-dcf.md

_Source: `05_reverse-dcf.md`_

# Reverse DCF — What's Priced In — NVT

**Evidence binding: frozen.** Every read resolved through the bound generation `6db32848…1aecd1e6`. Live `data/NVT/` and `_pool_extracts/` were not read; `data/NVT/…` is a citation label only.

**Regime.** US SEC domestic filer (Irish-incorporated, NYSE-listed). **US GAAP. Reporting currency USD, in millions; per-share in dollars. Fiscal year ends 31 December.** [`00_valuation-data-triage` §1A]

**Price-state gate — passed.** `01_price-and-capital-structure` §7 tags the price-state **`pool-verified`** ($171.16, close 2026-08-12, as-of date confirmed by the export itself). The no-price partial-data rule does **not** bind, so this agent runs. The **staleness** cap does bind (26 calendar days / ~17–19 trading days), so every implied-expectations read below is run and reported at **BOTH** prices — the pool-verified anchor of **$171.16** and the corroborated indicative refresh of **$156.03** (close 2026-09-04, web-sourced, two independent sources at the identical figure, **unverified — not the anchor**) — with the fresher read led on in §5.

**This agent inverts `04_intrinsic-dcf`, it does not rebuild it.** The discount rate, the normalized cash-flow base, the terminal growth rate, the horizon, the discounting convention and the terminal-return treatment are all taken from `04` **verbatim**. Nothing is re-derived. That is the point: a reverse-DCF is only meaningful as the exact inverse of the forward model (MODULE_RULES → Calculation Standard 9), and using a different rate or a different (un-normalized, peak-inflated) base would let the two agents reach opposite verdicts on the same stock.

*(Plain meaning of what follows: a normal discounted-cash-flow model starts with a forecast and produces a value. This one runs the machine backwards — it starts with the traded price and asks what forecast you would have to believe to justify paying it.)*

---

## 1. Inputs

| Input | Value | Source |
|---|---:|---|
| Current price — **pool-verified anchor** | **USD 171.16** (close 2026-08-12) | `01_price-and-capital-structure` §7 Anchor Block |
| Current price — **indicative refresh** (labelled, not the anchor) | **USD 156.03** (close 2026-09-04, web-sourced, unverified) | `01` §1 and §7 |
| Enterprise value at the anchor | **USD 28,940.0m** | `01` §4 (market cap 27,703.6 + total debt 1,492.4 + 0 minority + 0 preferred − cash 256.0) |
| Enterprise value at the indicative refresh | **USD 26,491.1m** | `01` §4 |
| Net debt (strict §15; broad basis identical — no short-term investments) | **USD 1,236.4m** | `01` §7, adopted from `balance-sheet-survival/01` |
| Fully diluted shares | **164.2m** | `01` §2 (161.858m + 2.3m treasury-stock-method increment; no convertibles) |
| **FCFF base (unlevered, the model's base)** | **USD 718.3m** — LTM to 30-Jun-2026 | `04_intrinsic-dcf` §1. Build: CFO continuing ops 772.8 − capex 112.9 = §15 FCF 659.9, + after-tax interest 58.4 |
| **Discount rate (WACC) used** | **10.2152%** (reported 10.22%) | `04` §3, taken verbatim. Components: rf 4.79% + β 1.36 × ERP 4.23% = k_e 10.54%; after-tax k_d 4.13%; weights 94.89% / 5.11%. Gate check `4.13% ≤ 10.22% < 10.54%` passes; all three low-side floors pass; the company's own disclosed group WACC is **10.0%** [`FY24 10-K, MD&A — Critical Accounting Estimates, p.32`] |
| **Terminal growth `g`** | **3.0%** | `04` §2 and §5 |
| **Terminal return on capital** | **= WACC (no perpetual excess return)** — `09_moat.md` returns "No moat proven" | `04` §5 |
| **Forecast horizon** | **10 periods** — H2-2026 stub + FY2027 → FY2035, then terminal | `04` §2 |
| **Discounting convention** | **Mid-year**, valuation date 30-Jun-2026: stub at t = 0.25, FY2027 at t = 1.0 … FY2035 at t = 9.0, terminal at t = 9.5 | `04` §4 |

**Replication check — the inversion engine reproduces `04` before it is used to solve anything.** Fed `04`'s own printed FCFF path, the engine below returns EV **13,764.3** against `04` §6's **13,764.3**, and reproduces `04` §7's grid at **$76.30 / $76.48 / $76.11 / $67.03 / $67.13** per share against `04`'s **$76.30 / $76.48 / $76.11 / $67.07 / $67.17**. The two 9.22%-WACC cells tie to $88.32 vs `04`'s $88.39 — a 0.08% gap from `04` recomputing terminal NOPAT off its full revenue-and-margin model rather than scaling it. Everything below therefore runs on the same machine that produced `04`'s answer, not a lookalike.

```
$ python3 rdcf3.py
== REPLICATION of 04 §6 and §7 grid (must tie) ==
   WACC 10.22% g 3.0% -> $ 76.30/sh   04 prints $ 76.30  OK
   WACC 10.22% g 3.5% -> $ 76.48/sh   04 prints $ 76.48  OK
   WACC 10.22% g 2.5% -> $ 76.11/sh   04 prints $ 76.11  OK
   WACC  9.22% g 3.0% -> $ 88.32/sh   04 prints $ 88.39  (0.08% — see note)
   WACC 11.22% g 3.0% -> $ 67.03/sh   04 prints $ 67.07  OK
```

**One fact that must travel with every number below (carried from `01` §7 and `04`).** The anchor price, the whole consensus set (to 2026-08-07) and the 30-Jun-2026 balance sheet all **pre-date the Maverick Power acquisition announced 2026-08-24** ($1.75bn cash plus up to $550m earn-out, target 2026 revenue about $700m, close expected Q4 2026, cash-and-new-debt funded) [`nVent news release, 2026-08-24`]. The indicative $156.03 quote **post-dates** it. Both the cash flows and the debt in this inversion are pre-deal, consistently on both sides.

---

## 2. Implied Expectations

**Held fixed:** the discount rate (10.2152%), the normalized FCFF base ($718.3m), the terminal growth rate (3.0%), the terminal return on capital (= WACC), the ten-period horizon, the mid-year discounting convention, net debt and the share count — every one of them `04`'s or `01`'s figure, unchanged.
**Solved for:** the constant annual FCFF growth rate over the ten periods that makes the present value of the cash flows equal today's enterprise value.

```
$ python3 rdcf3.py
== §2 PRIMARY SOLVE ==
   $171.16 pool anchor   EV= 28940.0  implied FCFF CAGR=21.801%  FY2035 FCFF= 4238.0  TV%EV=60.6%
   $156.03 indicative    EV= 26491.1  implied FCFF CAGR=20.389%  FY2035 FCFF= 3815.7  TV%EV=59.6%
   04 FV $76.30          EV= 13764.3  implied FCFF CAGR= 9.983%  FY2035 FCFF= 1691.4  TV%EV=50.9%

== §2 SECONDARY - implied years of above-GDP growth (terminal applied at year N) ==
   at 12.5% p.a. -> $171.16: N =  19.9 yrs
   at 12.5% p.a. -> $156.03: N =  18.0 yrs
   at 17.2% p.a. -> $171.16: N =  12.2 yrs
   at 17.2% p.a. -> $156.03: N =  11.2 yrs

== §2 SECONDARY - implied terminal EBITDA margin (linear on 04 grid B, WACC 10.22%) ==
    slope = 2.170 $/sh per pp of terminal EBITDA margin
    $171.16: required terminal EBITDA margin =   63.7%
    $156.03: required terminal EBITDA margin =   56.7%
```

| What the Price Implies | Solved value at **$171.16** (pool anchor) | Solved value at **$156.03** (indicative) |
|---|---:|---:|
| **Implied FCFF CAGR over the 10-period horizon** (primary solve) | **+21.80% a year** | **+20.39% a year** |
| Implied FY2035 free cash flow to the firm | **USD 4,238.0m** (5.9x the $718.3m base) | **USD 3,815.7m** (5.3x the base) |
| Implied years of above-GDP growth at **12.5%** a year (the consensus revenue CAGR FY2026→FY2030), then straight to the 3.0% terminal | **19.9 years** | **18.0 years** |
| Implied years of above-GDP growth at **17.2%** a year (the FY2027 consensus revenue growth rate), then straight to the 3.0% terminal | **12.2 years** | **11.2 years** |
| Implied steady-state EBITDA margin, holding `04`'s revenue path fixed *(linear extrapolation off `04` §7 grid B — well outside the grid, so read it as a direction, not a point)* | **≈ 63.7%** (implied EBIT margin ≈ 61.3%) | **≈ 56.7%** (implied EBIT margin ≈ 54.3%) |
| *Memo:* the same solve at `04`'s own fair value of $76.30 | +9.98% a year | — |
| *Memo:* the FCFF CAGR `04`'s own consensus-based forecast actually delivers ($718.3m → $1,515.3m over 9 years) | **+8.6% a year** | — |

**The plain reading of the primary solve.** At $171.16 the market is paying for nVent's free cash flow to compound at **21.8% a year for nine and a half years** — from $718m to $4.2bn — and then to grow forever at 3% earning exactly its cost of capital. `04`'s own model, which takes consensus revenue and margin unchanged all the way to FY2030, delivers **8.6%**. The price therefore requires roughly **two and a half times** the cash-flow growth that the consensus-fed forward model produces.

**The margin solve is the sharper of the two, and it is worth stating plainly.** Holding `04`'s consensus revenue path fixed, no achievable margin can bridge the gap: the price needs a steady-state EBITDA margin near **64%** against `04`'s mid-cycle 20.0%, the model's own forecast peak of 22.8%, and a peer-normal operating margin of 20.7% at Hubbell and Legrand [`business-model/09_moat.md` §2]. That is not a stretch assumption, it is an impossible one — which means **the price cannot be explained by margin at all; it can only be explained by volume**, i.e. by the business becoming far larger than consensus models. That is what §3's market-ceiling test then interrogates.

**The fade solve says the same thing in the language of duration.** For the price to work at a 12.5% growth rate — the rate consensus itself models for FY2026→FY2030 — that rate has to persist for **twenty years**, not four. Even at FY2027's +17.2% it has to persist for **twelve years**. Against a business `business-model/09_moat.md` scores as **"No moat proven"**, with a through-cycle return on capital of **8.10% against its own disclosed 10.0% cost of capital**, and an industry rate-of-change score of **40/100** (CLAUDE.md §24 Filter 5, tag `RF-BQ-005`), a twelve-to-twenty-year advantage period has no evidenced support anywhere in this run.

---

## 2A. Implied Discount Rate — the dual solve

**Held fixed:** `04`'s literal base-case cash-flow path — the ten printed FCFF figures and the terminal cash flow of $1,139.9m (= terminal NOPAT 1,613.9 × the 29.4% reinvestment charge) — plus terminal `g` of 3.0%, the ten-period horizon and the mid-year convention.
**Solved for:** the discount rate that makes the present value of those cash flows equal today's enterprise value.

```
$ python3 rdcf3.py
== §2A DUAL SOLVE: implied discount rate, 04's literal cash flows held fixed (TV cash flow 1139.9) ==
   $171.16: implied discount rate =  6.210%   ratio to model WACC 10.215% = 0.608x
   $156.03: implied discount rate =  6.529%   ratio to model WACC 10.215% = 0.639x
```

| Solve | Held fixed | Solved value |
|---|---|---:|
| Implied discount rate at `04`'s base-case cash flows — at **$171.16** | `04`'s FCFF path, terminal cash flow 1,139.9, `g` 3.0%, 10 periods, mid-year | **6.210%** |
| Implied discount rate at `04`'s base-case cash flows — at **$156.03** | same | **6.529%** |
| `04`'s model WACC, for comparison | — | **10.215%** |
| **Ratio (implied ÷ model)** | — | **0.608x** at $171.16 · **0.639x** at $156.03 |

**Reported into `04` §3A.** `04`'s Cost-of-Capital Reality Test table left the "Market-implied rate" row as *"Not yet available — `05` runs after this agent"*. **That row's value is 6.21% at the pool anchor and 6.53% at the indicative refresh.** This agent does not edit `04`; the figure is published here for `07` and the master synthesizer to carry. **`04`'s escalation trigger does not fire on it:** the trigger is a model WACC *below ~two-thirds of* the market-implied rate — two-thirds of 6.21% is 4.14%, and `04`'s 10.22% sits far **above** it. No `RF-VAL-003` tag arises from this reconciliation.

**Which way it cuts — both readings stated, one chosen on evidence.** The ratio is **0.61x**, not above 1.5x, so this is the mirror of the usual failure: the market is not pricing a collapse, it is pricing an expansion. Both readings still have to be put on the table.

- **Reading A — the cash flows are wrong (the market expects far more cash than `04` models).** Test: `04`'s path already carries consensus revenue and margin unchanged through FY2030 — a business going from $3,893m (FY2025) to $8,697m (FY2030), a near-doubling in five years — and *still* lands at $76.30. So the market is assuming something well beyond consensus, not merely a different reading of it. nVent's own record supports a *period* of much faster growth: FCF compounded at 33.6% FY2022→FY2025 and LTM revenue is +46.2% year on year [`earnings/01_historical-financials.md` §1–§2]. What the record does not support is that rate for nine straight years off an already-peak base — see §3.
- **Reading B — the rate is wrong (`04` discounts too dearly).** Test: `04`'s WACC **passed all three low-side floors** (equity-risk-premium spread 5.75pp ≥ 4pp; sourced beta 1.36 ≥ 0.8; country-risk omission deliberate and reasoned) **and it passes the high-side ceiling** (k_e 10.54% below rf + 1.4 × ERP = 10.71%). Critically, it sits **+0.22pp ABOVE the company's own disclosed weighted-average cost of capital of 10.0%** — the rate nVent applies to *every* reporting unit in its own goodwill test [`FY24 10-K, MD&A, p.32`] — not below it. **Reading B is therefore NOT the default here**, because the condition that would make it the default (a model WACC that failed a floor, or that sits far below the company's own disclosed rate) is not met. To justify $171.16 on `04`'s cash flows the discount rate would have to fall to **6.21%** — **3.79pp below the company's own audited-file number**, and only 1.42pp above the 4.79% US 10-year Treasury, which fails `04`'s own equity-risk-premium floor by a wide margin.

**Verdict on the dual solve: Reading A.** The evidence points at the cash flows, not the rate. The market is not applying a 6.2% cost of capital to nVent; it is applying something near a normal cost of capital to a far larger stream of future cash than either consensus or `04` contains. That is the expectation §3 tests.

---

## 3. Implied vs Achievable

### 3.1 The base rate must match the claim's metric, level and period (CLAUDE.md §9)

The claim being tested is **forward free-cash-flow growth**, at **group level**, over **nine and a half years**. nVent's segment mix has shifted violently — Systems Protection went from **60.7% of revenue and 53.2% of segment income (FY2024, audited)** to **72.5% and 70.0% (H1 FY26)** [`business-model/03_segment-map.md` §1] — so the consolidated blend is arithmetically the wrong yardstick: it is weighted down by the slower part. The base rate is therefore **decomposed by segment and re-aggregated at current weights**, and said so.

```
$ python3 base_rates.py
SEGMENT INCOME growth  FY24->FY25 : SP +33.2%  EC +5.1%
SEGMENT INCOME growth  H1FY26 YoY : SP +86.7%  EC +7.5%
RE-AGGREGATED at CURRENT profit weights (SP 70.0% / EC 30.0%):
  FY24->FY25 segment-income base rate = 24.8%
  H1 FY26 YoY segment-income base rate = 62.9%
  [consolidated blend for contrast] FY24->FY25 total segment income = +20.1%
```

| Segment | Weight used (H1 FY26 segment income) | Segment-income growth FY2024→FY2025 | Segment-income growth H1 FY26 YoY | Source |
|---|---:|---:|---:|---|
| Systems Protection | 70.0% | **+33.2%** (403.1 → 537.0) | **+86.7%** (241.7 → 451.3) | `FY24 10-K, Note 15, p.70`; `Capital IQ Segments tab, Dec-31-2025` (tier-5 vendor); `Q2 FY26 10-Q, Note 13, p.20` and `MD&A p.29` |
| Electrical Connections | 30.0% | **+5.1%** (354.5 → 372.6) | **+7.5%** (180.1 → 193.6) | same |
| **Re-aggregated at current weights** | 100.0% | **+24.8%** | **+62.9%** | derived |
| *Consolidated blend, for contrast (the wrong yardstick)* | — | *+20.1%* | — | derived |

Two things follow, and they pull in opposite directions — both are stated rather than averaged away.

1. **On the correct §9 basis, the implied 21.8% is INSIDE the recent realised record, not outside it.** Mix-weighted segment-profit growth was +24.8% (FY24→FY25) and +62.9% (H1 FY26). Group FCF compounded at **33.6%** FY2022→FY2025 and **24.8%** FY2023→FY2025. Group EBIT compounded at **25.9%** on the filing basis (19.5% on the Capital IQ basis, which reclassifies a $58.5m pension item) [`earnings/01_historical-financials.md` §1]. Had this agent tested a forward *cash-flow* claim against the consolidated *revenue* CAGR of 19.3%, it would have called 21.8% "aggressive versus history" — and that would have been the wrong metric at the wrong level, exactly the error §9 exists to stop.
2. **The period is where it breaks, and the period is not a technicality.** Every one of those base rates is a **one- to three-year** realised rate measured **into a cycle peak** — LTM revenue is +46.2% year on year and both `earnings/01` §2 and `01` §5 flag the latest twelve months as a peak. The price does not require 21.8% for one year or three. It requires **21.8% every year for nine and a half years, compounding off that peak**, taking FCFF from $718m to $4.2bn. No period in nVent's own record, on any metric, at any level, is that long.

### 3.2 The judgement table

| Implied Requirement | Company History (metric-, level- and period-matched) | Earnings-Module Evidence | Achievable? |
|---|---|---|---|
| **FCFF CAGR of +21.8% for 9.5 years** ($718m → $4,238m) | Mix-weighted segment-profit growth +24.8% (FY24→FY25) and +62.9% (H1 FY26); group FCF CAGR 33.6% (FY22→FY25), 24.8% (FY23→FY25). **The RATE has been beaten. The DURATION has never been tested** — the record is three years long and ends at a peak | `earnings/07` §2 row 1: organic **orders decelerated from ~40% to "low double digits"** and backlog fell **$2.6bn → $2.5bn**; the ±20% data-centre move is a ±$0.473 EPS swing on a $5.05 base. `earnings/04` consensus itself fades revenue growth to +8–10% by FY2029–30 | **No** — on duration, not on rate |
| **12–20 years of above-GDP growth** (12.2 yrs at 17.2%, 19.9 yrs at 12.5%) | No disclosed market share; the only advantage-period evidence is `09_moat.md`: **"No moat proven"**, through-cycle ROIC **8.10% vs a 10.0% disclosed cost of capital**, moat sources capped at 45/100, all occupied by every named rival | `business-model/07_business-quality.md` §1: industry rate-of-change **40/100**, tripping §24 Filter 5 — liquid cooling is "10% to 15% of cooling in data centers", 800-volt DC architecture unsettled, chip roadmaps rewritten to 2030 [`Q2 FY26 transcript, Q&A`]. Backlog visibility is ~six quarters, given on a call, never in a filing | **No** |
| **Steady-state EBITDA margin ≈ 63.7%** (EBIT ≈ 61.3%) | Own record: EBITDA margin 17.2% (FY2022) → 22.4% (FY2024) → 21.2% (FY2025) → 22.2% (LTM). Own best-ever is 22.4% | Peer-normal operating margin **20.7%** at both Hubbell and Legrand [`09_moat.md` §2]. `04` §7 grid B: even the forecast peak of 22.5% gives only $81.72/sh | **No** — not a stretch, an impossibility |
| **FCFF/revenue conversion held at the LTM 14.86%** while revenue multiplies 5.9x | LTM cash conversion (CFO ÷ EBITDA) is **64.3%**, down from 77.0% five years ago and from a FY2024 peak of 95.2% [`09_moat.md` §5 panel] | `earnings/06` §2–§3: cash conversion cycle **+76.4 days** and lengthening; NWC rose $219.7m in H1 FY26. Growth *absorbs* cash here — `04` §2 charges NWC at 13.0% of revenue for exactly this reason | **Stretch at best** — and it makes the revenue requirement in §3.3 larger, not smaller |

**The four-sentence judgement.** The market's implied expectations at $171.16 are **aggressive**, and the binding constraint is duration rather than rate: nVent has grown mix-weighted segment profit at 24.8–62.9% and group free cash flow at 24.8–33.6%, so a 21.8% *rate* is well inside what it has actually done — but it has done it for three years, off a low base, into a peak, and the price needs nine and a half consecutive years of it starting from that peak. The evidence that the run continues is already weakening in the company's own disclosures: organic orders decelerated from about +40% to "low double digits" and backlog fell sequentially from $2.6bn to $2.5bn [`Q1` and `Q2 FY26 transcripts, prepared remarks`], while consensus itself fades revenue growth to +8–10% by FY2029–30 [`Capital IQ Estimates → Consensus`]. The margin route is closed outright — the price needs a ~64% steady-state EBITDA margin against an own best-ever of 22.4% and a peer-normal operating margin of 20.7% — so the entire expectation rests on volume. And the durability evidence for a twelve-to-twenty-year run of that volume does not exist: `09_moat.md` returns "No moat proven" with a through-cycle return on capital of 8.10% against the company's own disclosed 10.0% cost of capital, in an industry scored 40/100 on rate of change.

### 3.3 Market-ceiling sanity check (one-directional — it can only raise the bar)

nVent is an **Operating** business [`00_valuation-data-triage` §3], so the revenue-size test applies. The primary solve produced an implied *cash-flow* CAGR, so it is converted to the implied **revenue** trajectory first, holding the free-cash-flow conversion fixed at `04`'s own figures.

```
$ python3 rdcf2.py  (market-ceiling block)
    $171.16: FY2035 FCFF  4238.1 @ conv LTM 14.86% (718.3/4834.0)  -> revenue $ 28521.2m ; CAGR from LTM 4834.0 over 9.0y = 21.80%
    $171.16: FY2035 FCFF  4238.1 @ conv 13.28% (1515.3/11413.7)    -> revenue $ 31922.3m ; CAGR = 23.34%
    $156.03: FY2035 FCFF  3815.7 @ conv LTM 14.86%                 -> revenue $ 25678.9m ; CAGR = 20.39%
    $156.03: FY2035 FCFF  3815.7 @ conv 13.28%                     -> revenue $ 28741.1m ; CAGR = 21.91%
```

| Conversion held fixed | Implied FY2035 revenue at **$171.16** | at **$156.03** | Implied revenue CAGR from LTM $4,834m |
|---|---:|---:|---:|
| FCFF/revenue **14.86%** (the LTM base: 718.3 ÷ 4,834.0) — the friendlier assumption | **USD 28,521m** | USD 25,679m | 21.8% / 20.4% |
| FCFF/revenue **13.28%** (`04`'s own FY2035 model conversion: 1,515.3 ÷ 11,413.7) | USD 31,922m | USD 28,741m | 23.3% / 21.9% |

**No credible addressable-market figure exists, and it is not invented.** `business-model/08_competitive-map.md` §2 states it outright: *"No HHI, no top-four share and no market-size figure exists in the pool or was sourced… anyone needing it must buy a market study."* The strict market-share test is therefore **Not assessable**, and no TAM is fabricated to fill the hole (CLAUDE.md §4 — market size is a low-tier input; say so rather than invent one). What is run instead is the **defensible scale proxy the rule permits — category revenue of the named competitors**, which is sourced.

| Scale reference | Revenue | Implied NVT FY2035 of $28,521m as a multiple | Source |
|---|---:|---:|---|
| ABB | $35,752m | 0.80x | `CIQ Competitors export (NVT), retrieved 2026-09-07` — tier-5 vendor, via `08_competitive-map.md` §2 |
| Eaton (group) | $30,000m | **0.95x** | same |
| Legrand | $11,700m | 2.44x | same |
| Hubbell (LTM) | $6,200m | 4.60x | same |
| **nVent (LTM Jun-2026)** | **$4,834m** | **5.90x its own current size** | `Capital IQ Financials export → Income Statement`, LTM 12m Jun-30-2026 |

**What the proxy says, and it only makes the bar higher.** To justify $171.16, nVent must reach roughly the **entire current group revenue of Eaton** — 0.95x — and about **0.8x ABB's**, from a base that is today one-sixth of Eaton's and one-seventh of ABB's, inside nine years. It must do so while those firms compete for the same demand and are not standing still: Eaton's Electrical Americas backlog was **$15.3bn** at end-2025 against nVent's **entire group** backlog of **$2.5bn**, and Eaton's twelve-month rolling orders in that unit were **up 41%** [`Eaton FY2025 release, 2026-02` and `Eaton Q2 2026 release, 2026-07-30` — company releases, unverified web copies, via `08_competitive-map.md` §2]. No named peer has ever moved from nVent's current scale to Eaton's inside a decade. **This check therefore flags the implied expectation as aggressive on market-ceiling grounds independently of nVent's own history** — which is the one direction it is allowed to move the answer. It cannot and does not justify any upside.

---

## 4. Robustness

```
$ python3 rdcf3.py
== §4a ROBUSTNESS - discount rate ==
   WACC  9.22% -> $171.16: 19.216%   $156.03: 17.844%
   WACC 10.22% -> $171.16: 21.801%   $156.03: 20.389%
   WACC 11.22% -> $171.16: 24.216%   $156.03: 22.766%
== §4b ROBUSTNESS - FCFF base (all three from 04 §1/§4) ==
   low 678.5    -> $171.16: 22.714%   $156.03: 21.299%
   base 718.3   -> $171.16: 21.801%   $156.03: 20.389%
   high 819.8   -> $171.16: 19.691%   $156.03: 18.283%
== §4c ROBUSTNESS - terminal g +/-0.5% ==
   g_T 2.5% -> $171.16: 21.848%   $156.03: 20.435%
   g_T 3.0% -> $171.16: 21.801%   $156.03: 20.389%
   g_T 3.5% -> $171.16: 21.754%   $156.03: 20.342%
```

**(a) Discount rate.**

| Discount Rate | Implied FCFF CAGR at **$171.16** | at **$156.03** |
|---|---:|---:|
| WACC −1% (9.22%) | 19.22% | 17.84% |
| **WACC (10.2152%)** | **21.80%** | **20.39%** |
| WACC +1% (11.22%) | 24.22% | 22.77% |

**(b) FCFF base — the three figures `04` itself derived; none is invented here.**

| FCFF base | Where it comes from | Implied FCFF CAGR at **$171.16** | at **$156.03** |
|---|---|---:|---:|
| Low — **678.5** | `04` §4: filed H1 FY26 actual + `04`'s conservative H2 model (the working-capital conservatism) | 22.71% | 21.30% |
| **Base — 718.3** | `04` §1: normalized LTM FCFF to 30-Jun-2026 | **21.80%** | **20.39%** |
| High — **819.8** | `04` §4: implied by the company's own 90–95% free-cash-flow conversion guidance | 19.69% | 18.28% |

**(c) Terminal growth ±0.5% — required, because the terminal is 60.6% of EV at the implied solve.** At the price-implied growth rate the terminal value is **60.6%** of enterprise value at $171.16 (59.6% at $156.03), above the ~60% trigger, so `g` is varied even though `04`'s own base sat at 45.6%.

| Terminal `g` | Implied FCFF CAGR at **$171.16** | at **$156.03** |
|---|---:|---:|
| 2.5% | 21.85% | 20.44% |
| **3.0% (base)** | **21.80%** | **20.39%** |
| 3.5% | 21.75% | 20.34% |

**Which input dominates: the discount rate, and by a wide margin — and this is the reverse of the usual pattern, so it is named rather than assumed.** Across the bands tested the swing in implied growth is **5.00pp** for WACC ±1%, **3.02pp** across the full FCFF-base band ($678.5m to $819.8m, a −5.5%/+14.1% span), and **0.10pp** for terminal `g` ±0.5%. The reason is structural, not a quirk: `04` pins terminal return on capital to the cost of capital, so the terminal value is `NOPAT ÷ WACC` and the whole valuation scales with `1/WACC` — while for the same reason growth creates no value in the terminal, which is why `g` barely moves anything (the identical flatness `04` §7 found down its own rows). **Two things survive every cell of every table above.** First, the implied growth never falls below **17.8%** anywhere — even at the friendliest combination (lowest discount rate, highest cash-flow base, at the fresher price) it is 18.3%, still more than double `04`'s modelled 8.6%. Second, `g` is not where the argument lives: anyone who wants to defend this price by nudging terminal growth is moving a lever worth a tenth of a percentage point.

---

## 5. What's-Priced-In Read

**Leading with the fresher price, as `01` §7 requires.** At **$156.03** (close 2026-09-04, indicative and web-sourced — the pool-verified anchor of $171.16 is 26 calendar days / ~17–19 trading days stale), the market is pricing nVent's free cash flow to compound at **20.4% a year for nine and a half years** — from $718m to $3.8bn — and revenue to reach roughly **$25.7–28.7bn**, five to six times today's $4.8bn. At the stale pool anchor of **$171.16** the requirement is **21.8% a year** and revenue of **$28.5–31.9bn**. That is **aggressive**, and the reason is duration rather than rate: mix-weighted segment profit grew 24.8% (FY24→FY25) and 62.9% (H1 FY26) and group free cash flow compounded at 33.6% over FY2022–FY2025, so nVent has cleared this *rate* — but only for three years, off a small base, into a cycle peak, and the price needs nine and a half consecutive years of it starting from that peak, while its own organic orders have already decelerated from ~+40% to "low double digits" and backlog has slipped from $2.6bn to $2.5bn.

**The margin door is shut and the market-size door is narrow, which leaves nothing to absorb a disappointment.** To justify the price on profitability instead of volume would need a steady-state EBITDA margin near **64%** against an own best-ever of 22.4% and a peer-normal operating margin of 20.7% — impossible, not merely demanding. To justify it on volume, nVent must reach about **0.95x Eaton's entire current group revenue** within nine years, against a rival whose Electrical Americas backlog alone is six times nVent's whole order book and whose orders in that unit are growing 41%. And the durability evidence for a twelve-to-twenty-year advantage period is absent: `09_moat.md` returns **"No moat proven"** with a through-cycle return on capital of 8.10% against the company's own disclosed 10.0% cost of capital, in an industry scored 40/100 on rate of change.

**The expectations embedded in this price sit above what the evidence in this run supports the company delivering, and that is downside, not upside.** The gap is not marginal: the price needs **20.4–21.8%** cash-flow growth where `04`'s consensus-fed model produces **8.6%**, and the dual solve says the same thing from the other side — reconciling today's price to `04`'s own cash flows takes a **6.21% discount rate**, 3.79pp below the weighted-average cost of capital nVent discloses in its own goodwill test and only 1.42pp above the US 10-year Treasury. This module produces no fair-value level and no rating; `07_scenario-and-fair-value` owns the levels and the master synthesizer owns the bet.

---

### What travels forward to `07` and `99`

- **Market-implied discount rate for `04` §3A's open row: 6.210% at $171.16, 6.529% at $156.03** (ratio 0.608x / 0.639x to the 10.215% model WACC). **`04`'s escalation trigger does not fire** — the model WACC is far above two-thirds of the market-implied rate, so **no `RF-VAL-003` tag arises.** This agent did not edit `04`; carry the figure from here.
- **Implied FCFF CAGR: 21.80% at the pool anchor, 20.39% at the indicative refresh.** Robust range across every sensitivity cell: **17.84% – 24.22%**. The dominant input is the **discount rate** (5.00pp swing), not the cash-flow base (3.02pp) and emphatically not terminal `g` (0.10pp).
- **Terminal value is 60.6% of EV at the price-implied solve** (vs 45.6% in `04`'s forward model) — above the ~60% line, so the `g` sensitivity was run and is shown.
- **Verdict: aggressive.** Achievability is "No" on duration, "No" on the moat/advantage period, "No" on margin, and flagged on market-ceiling grounds by the peer-scale proxy.
- **Limitations, stated:** (1) the strict addressable-market test is **Not assessable** — no market-size figure exists in the pool and none was invented; a peer-revenue scale proxy was used instead and can only raise the bar, never lower it; (2) the implied-margin figure is a **linear extrapolation far outside `04` §7 grid B** and is a direction, not a point; (3) everything here is **pre-Maverick-Power** on both the cash-flow and the debt side, consistent with `04` and `01`; (4) `01`'s **price-staleness cap of 60** on valuation confidence travels with every read above; (5) the FY2025 10-K is absent from the pool, so FY2025 figures are vendor- or deck-sourced and cited as such; (6) the risk-free rate, ERP and beta inside `04`'s WACC are web-sourced, dated and unverified.



---

## valuation / 06_sum-of-the-parts.md

_Source: `06_sum-of-the-parts.md`_

# Sum-of-the-Parts — NVT

**Evidence binding: frozen.** Every pool read resolved through the bound generation `6db32848…1aecd1e6` (`manifest.json`, per-tab extracts, `ciq_facts.json`). Live `data/NVT/` and `_pool_extracts/` were not read; `data/NVT/…` is a citation label only.

**Regime, standard, currency (CLAUDE.md §27).** US SEC domestic filer (Forms 10-K / 10-Q), **US GAAP**, reporting currency **USD in millions** (per-share in dollars), fiscal year ends **31 December** [`Q2 FY26 10-Q, cover page`; `00_valuation-data-triage`, §1A]. The issuer is Irish-incorporated but files US forms and lists on the NYSE, so US form names are the correct local names here. No FX conversion is used anywhere in this report except where a euro-reporting comparable is explicitly excluded for that reason.

**Anchors adopted verbatim from `01_price-and-capital-structure` (Reconciliation Gate 1).** Price **USD 171.16** (pool-verified, close **2026-08-12**, ~17–19 trading days stale, confidence cap 60) with the corroborated indicative refresh **USD 156.03** (close 2026-09-04, web-sourced, unverified) carried alongside; **net debt USD 1,236.4m — strict §15 basis** (total debt 1,492.4 − cash 256.0), broad basis identical (no short-term investments); **minority 0.0, preferred 0.0, equity-method investments 0.0**; per-share fair-value share count **164.2m fully diluted**. No figure below departs from those.

**This SOTP is pre-Maverick-Power, deliberately.** The Maverick Power acquisition ($1.75bn cash plus up to $550m earn-out, ~$700m estimated 2026 revenue, close expected Q4 2026) was announced 2026-08-24, has not closed, and is not on the 30-Jun-2026 balance sheet [`nVent-to-Acquire-Maverick-Power-2026.pdf`, press release 2026-08-24]. `01`'s bridge is pre-deal, so this one is too. A labelled sensitivity is in §4.

---

## 1. Segment Inventory

nVent has **two reportable segments** and no unallocated-revenue bucket — every dollar of sales is assigned to a segment [`Q2 FY26 10-Q, Note 13, p.19–20`]. It is **not** single-segment: Electrical Connections is 27.5% of revenue and 30.0% of reportable segment income in H1 FY26, well inside the >85% single-segment test [`business-model/03_segment-map.md`, §2]. The SOTP therefore runs in full.

**What the profit measure is.** "Reportable segment income" is nVent's own segment profit measure: operating income including some corporate-overhead allocations but **excluding** intangible amortization, acquisition and integration costs, restructuring, mark-to-market and other unusual items, and — new in 2026 — IEEPA tariff reimbursements [`Q2 FY26 10-Q, Note 13, p.19–21`]. It is an EBIT-type measure struck **before** the corporate cost pool. It is not an operating margin and is not used as one.

**The "% of total EBIT" denominator is stated so no share can silently exceed 100%.** Two denominators are shown: (a) **reportable segment income**, which sums to 100% across the two segments by construction and excludes the corporate pool; and (b) **adjusted EBIT after the corporate pool** (segment income − Enterprise-and-other), which is the profit an owner of the whole company actually gets before intangible amortization. Both are given, and the corporate bucket is shown as its own line with a negative share — it is never dropped.

### 1A. Reported history (the base the forward build starts from)

| Segment | Revenue | Segment income (EBIT-type) | Margin | % of reportable segment income | % of adjusted EBIT (after corporate) | Source |
|---|---:|---:|---:|---:|---:|---|
| **H1 FY26 (six months to 30-Jun-2026, unaudited filing)** | | | | | | |
| Systems Protection | 1,966.9 | 451.3 | 22.9% | 70.0% | 79.0% | `Q2 FY26 10-Q, Note 13, p.20`; margin `MD&A, p.29` |
| Electrical Connections | 746.4 | 193.6 | 25.9% | 30.0% | 33.9% | `Q2 FY26 10-Q, Note 13, p.20`; margin `MD&A, p.30` |
| *Enterprise and other* (cost pool, **not a segment**) | — | (73.7) | n/a | (11.4)% | (12.9)% | `Q2 FY26 10-Q, Note 13, p.21` |
| **= Reportable segment income** | **2,713.3** | **644.9** | 23.8% | **100.0%** | — | `Q2 FY26 10-Q, Note 13, p.20` |
| **= Adjusted EBIT after corporate** | | **571.2** | 21.1% | — | **100.0%** | 644.9 − 73.7, derived |
| *Memo:* unallocated intangible amortization | — | (82.2) | — | (12.7)% | (14.4)% | `Q2 FY26 10-Q, Note 13, p.21` |
| **FY2025 (Capital IQ vendor export — tier 5, NOT a filing)** | | | | | | |
| Systems Protection | 2,592.9 | 537.0 | 20.7% | 59.0% | 68.3% | `Capital IQ Financials export → Segments`, 12m Dec-31-2025 column |
| Electrical Connections | 1,300.2 | 372.6 | 28.7% | 41.0% | 47.4% | same |
| *Enterprise and other* | — | (123.8) | n/a | (13.6)% | (15.7)% | same |
| **= Reportable segment income** | **3,893.1** | **909.6** | 23.4% | **100.0%** | — | same |
| **= Adjusted EBIT after corporate** | | **785.8** | 20.2% | — | **100.0%** | 909.6 − 123.8, derived |
| *Memo:* unallocated intangible amortization | — | (147.1) | — | (16.2)% | (18.7)% | same |
| **FY2024 (audited — the only audited annual segment note in the pool)** | | | | | | |
| Systems Protection (then *Enclosures*) | 1,823.3 | 403.1 | 22.1% | 53.2% | 61.8% | `FY24 10-K, Note 15, p.70`; margin `Item 7 MD&A, p.25` |
| Electrical Connections (then *EF&S*) | 1,182.8 | 354.5 | 30.0% | 46.8% | 54.4% | `FY24 10-K, Note 15, p.70`; margin `Item 7 MD&A, p.27` |
| *Enterprise and other* | — | (105.6) | n/a | (13.9)% | (16.2)% | `FY24 10-K, Note 15, p.70` |
| **= Reportable segment income** | **3,006.1** | **757.6** | 25.2% | **100.0%** | — | `FY24 10-K, Note 15, p.70` |

**Reconciliation to consolidated (Reconciliation Gate 3 — the segment figures must tie, and the corporate bucket may not vanish).** H1 FY26: segment revenue 1,966.9 + 746.4 = **2,713.3**, which is exactly consolidated net sales for the six months [`Q2 FY26 10-Q, condensed consolidated statements of operations`]. Segment income 451.3 + 193.6 = 644.9, less Enterprise and other (73.7), less intangible amortization (82.2), plus IEEPA tariff reimbursements 25.8, and after the remaining reconciling items, ties to income before tax of 458.9 [`Q2 FY26 10-Q, Note 13, p.21`]. **The corporate pool is carried explicitly through every step below and is capitalized and subtracted in §4 — it is not assumed away.**

**Evidence-quality note that travels with the FY2025 row.** The FY2025 10-K is **absent from the data pool**, so every FY2025 segment figure here is a **tier-5 Capital IQ vendor read**, never cited to a filing [`business-model/03_segment-map.md`, §1]. The vendor's basis was verified: for FY2024 it reports 403.1 / 354.5, identical to the audited 10-K segment note, so the FY2025 column is on the same measure [`business-model/03_segment-map.md`, §1 reconciliation].

### 1B. The forward basis actually used (MODULE_RULES Calculation Standard 10 — forward basis, hard rule)

**Every segment below is valued on FY2026E, not on the last audited year.** FY2024 is the last audited segment note and FY2025 is the last full year; both are trailing and both would badly misvalue a segment growing at 49.6% (Systems Protection). No segment-level consensus exists — the company gives **no segment-level revenue or margin guidance** [`earnings/04_guidance-consensus.md`, §2] — so the forward segment metric is **built from H1 FY26 filed actuals plus an H2 FY26 estimate anchored on management's own group guidance**, and then reconciled back to that guidance. The build and its tie-out are shown in full so a reader can reproduce it.

**Period basis, stated per segment:** Systems Protection **FY2026E**; Electrical Connections **FY2026E**; corporate pool **FY2026E**. FY2026E is the furthest-forward basis with an evidenced segment-level estimate; it is the company's *current* guided fiscal year, of which H1 is reported and H2 estimated. A true NTM window (Q4-26 through Q3-27) would sit **above** FY2026E on a business guided to +37–39% reported sales growth, so using FY2026E is the conservative choice, and that is why it is used rather than annualising the H1 run-rate.

**Step 1 — the group envelope comes from management, not from this agent.** FY2026 guided reported sales growth +37% to +39% on FY2025 revenue of 3,893.1 gives **$5,333.6–5,411.4m, midpoint $5,372.5m**; guided adjusted EPS **$5.00–5.10** [`Q2 FY26 transcript, 2026-07-31, prepared remarks`; corroborated by `Capital IQ Estimates export → Guidance`, FY 2026, guidance date 2026-07-31]. H1 FY26 actual revenue was **2,713.3** [`Q2 FY26 10-Q`], so **implied H2 FY26 revenue = 5,372.5 − 2,713.3 = 2,659.2**.

**Step 2 — split H2 between the segments.** H1 FY25 comparatives are recoverable from the filed growth decomposition: Systems Protection H1 FY25 revenue **1,140.2** (H1 FY26 1,966.9 at +72.5%; independently confirmed by the vertical note, infrastructure 510.5 of 1,140.2 = 44.8%) and Electrical Connections H1 FY25 **632.0** (746.4 at +18.1% = organic 13.1 + acquisition 3.7 + currency 1.3) [`Q2 FY26 10-Q, MD&A, p.29–30` and `Note 2, p.9`]. Against the FY2025 vendor totals that leaves **H2 FY25: Systems Protection 1,452.7, Electrical Connections 668.2**. Holding Electrical Connections at **+12.0%** in H2 (below its +18.1% H1 rate, because the acquisition contribution lapses and its organic rate is mid-teens) gives EC H2 FY26E **748.4**, and Systems Protection takes the residual **1,910.8 (+31.5%)**. Group H2 growth is then +25.4%, which is *lower* than the Q3 guide of +32–35% precisely because management's own FY guide implies a Q4 step-down to about +17% — the shape `earnings/04` isolated and flagged as the single unresolved question in the setup [`earnings/04_guidance-consensus.md`, §3]. *Inference, not from filings — the segment split of guided H2 revenue is this agent's arithmetic on filed H1 actuals and guided group totals.*

**Step 3 — segment margins.** Systems Protection held at its **H1 FY26 margin of 22.9%** for H2 (H2 FY25 was 20.3%, so this embeds +2.6 points year on year and is consistent with management's guided "mid-20s incrementals in the second half") [`Q2 FY26 10-Q, MD&A, p.29`; `Q2 FY26 transcript, Q&A (CFO Corona)`]. Electrical Connections held at **26.0%** for H2 against 28.8% in H2 FY25 — i.e. the year-on-year margin erosion the filing attributes to tariff and raw-material inflation, growth investment and unfavourable mix is assumed to continue at roughly its H1 pace, not to reverse [`Q2 FY26 10-Q, MD&A, p.30`].

| Segment (FY2026E, forward basis) | Revenue | Segment income (EBIT-type) | Margin | % of reportable segment income | % of adjusted EBIT (after corporate) | Basis / source |
|---|---:|---:|---:|---:|---:|---|
| **Systems Protection** | **3,877.7** (+49.6% vs FY25) | **888.9** | 22.9% | **69.6%** | **78.9%** | H1 actual 1,966.9 / 451.3 [`Q2 FY26 10-Q, Note 13, p.20`] + H2E 1,910.8 at 22.9% |
| **Electrical Connections** | **1,494.8** (+15.0% vs FY25) | **388.2** | 26.0% | **30.4%** | **34.4%** | H1 actual 746.4 / 193.6 [`Q2 FY26 10-Q, Note 13, p.20`] + H2E 748.4 at 26.0% |
| *Enterprise and other* (corporate cost pool) | — | **(150.0)** | n/a | **(11.7)%** | **(13.3)%** | H1 actual (73.7) [`Q2 FY26 10-Q, Note 13, p.21`] annualised; FY25 was (123.8) [vendor] |
| **= Reportable segment income (FY2026E)** | **5,372.5** | **1,277.1** | 23.8% | **100.0%** | — | sums to the guidance midpoint revenue exactly |
| **= Adjusted EBIT after corporate (FY2026E)** | | **1,127.1** | 21.0% | — | **100.0%** | 1,277.1 − 150.0 |
| *Memo:* unallocated intangible amortization (FY2026E) | — | **(165.0)** | — | — | — | H1 actual (82.2) annualised [`Q2 FY26 10-Q, Note 13, p.21`]; FY25 (147.1) [vendor] |

**The forward build ties to management's own guidance — this is the check that makes it usable.** Take FY2026E adjusted EBIT of **1,127.1**, subtract guided interest expense of **~65.0** [`Capital IQ Estimates export → Guidance`, Interest Expense FY 2026, guidance date 2026-05-01], and tax at the company's own **22.4% H1 FY26 effective rate** [`Q2 FY26 10-Q, MD&A effective-tax-rate table`]: `(1,127.1 − 65.0) × (1 − 0.224) = 824.2`. Divided by 164.1m diluted weighted-average shares [`Q2 FY26 10-Q, Note 4`] that is **adjusted EPS of $5.02**, inside management's guided **$5.00–5.10** and just below the midpoint. The segment build is therefore not free-floating: it reproduces the company's own guided earnings from the bottom up. Using the Street's FY2026 revenue of 5,435.3 instead of the guidance midpoint would add ~$62.8m of sales and, at roughly 25% incremental margin, ~$15.7m of segment income — about +0.5% on gross enterprise value, or ~$2 per share. The conservative (guidance-midpoint) build is the one used.

---

## 2. Segment Multiples & Comparables

**The multiple basis, stated once and used for both segments: forward EV ÷ FY2026E adjusted operating profit.** Each comparable's multiple is computed as its **current enterprise value divided by its own FY2026 guided or consensus adjusted operating profit** — a forward multiple applied to a forward metric, on the same basis, as the hard rule requires. Adjusted operating profit is the right line to compare because, like nVent's segment income, each comparable's adjusted operating profit is struck **before** acquired-intangible amortization — so the amortization treatment matches on both sides of the multiple and is not silently double-charged.

**One basis difference must be named.** A comparable's adjusted operating profit is **after** its own corporate costs, while nVent's segment income is **before** the Enterprise-and-other pool. Applying a peer multiple to a before-corporate metric therefore overstates value unless the corporate pool is separately capitalized and deducted — which is exactly what §4 does, at the same blended multiple. Algebraically that is identical to applying the peer multiple to an after-corporate metric, so the two sides stay consistent and Reconciliation Gate 3 holds.

**No peer multiples exist in the data pool.** `ciq_facts.json` reports `peer_ev_ebitda` as **missing** ("CIQ 'comps' export not found for NVT — pull it"), and the pool's Capital IQ Competitors export carries LTM revenue only, with no valuation columns [`nVent-Electric-plc-NYSE-NVT-Competitors.txt`, header block]. Every comparable multiple below is therefore **web-sourced and unverified**, dated, and flagged as such. This triggers the MODULE_RULES "no peer data" partial-data rule for `06`: segment multiples are justified from web comparables and the whole SOTP is marked **low-confidence** on that ground.

| Segment | Metric used (period basis) | Multiple applied | Named comparable | Comparable's multiple | Source |
|---|---|---:|---|---:|---|
| **Systems Protection** | FY2026E segment income **888.9** (**FY2026E — forward**, guidance-anchored, H1 filed + H2 estimated) | **26.0x** (range 22.0–30.0x) | **Vertiv Holdings Co (NYSE:VRT)** — primary | **32.6x** forward EV ÷ FY2026E adjusted operating profit | EV $108.23bn [`Web: stockanalysis.com VRT statistics, retrieved 2026-09-07, price/data as of 2026-09-04 close — indicative, unverified`] ÷ FY2026 guided adjusted operating profit $3,325m [`Vertiv Q2 2026 results release, 2026-07-29 — company release, unverified web copy`] |
| | | | *Secondary bracket:* **Eaton Corporation plc (NYSE:ETN)** | forward P/E **27.3x**; trailing EV/EBITDA **27.1x** | `Web: stockanalysis.com ETN statistics, retrieved 2026-09-07 (as of 2026-09-04 close) — indicative, unverified`. Used as a directional bracket only — Eaton's guided "segment margin" is a pre-corporate measure, so its EV/EBIT is not on the same basis and is not used to set the multiple |
| **Electrical Connections** | FY2026E segment income **388.2** (**FY2026E — forward**, guidance-anchored, H1 filed + H2 estimated) | **17.0x** (range 14.5–19.5x) | **Hubbell Incorporated (NYSE:HUBB)** — primary | **18.6x** forward EV ÷ FY2026E adjusted operating profit | EV $29.50bn [`Web: stockanalysis.com HUBB statistics, retrieved 2026-09-07 (as of 2026-09-04 close) — indicative, unverified`] ÷ FY2026E adjusted operating profit ≈ $1,590m, derived from guided sales growth +16–18% on FY2025 net sales $5,844.6m and guided adjusted operating margin 23.1–23.4% [`Hubbell Q2 2026 results release, 2026-07-28 — company release, unverified web copy`; FY2025 sales per `business-model/08_competitive-map.md`, Competitor B] |
| | | | *Floor context:* **Atkore Inc. (NYSE:ATKR)** | **10.7x** EV ÷ FY2026E adjusted EBITDA (EV $3.73bn ÷ $350m midpoint) | `Web: stockanalysis.com ATKR statistics, retrieved 2026-09-07`; guidance $340–360m [`Atkore Q2 FY2026 results release — company release, unverified web copy`]. **Not used to set the multiple**: Atkore has agreed to be acquired by Prysmian, so its price is a takeout mark, and its PVC-conduit/steel economics are commodity-price-driven in a way Electrical Connections' branded connector and fastening lines are not |
| *Enterprise and other* (corporate) | FY2026E cost **(150.0)** (**FY2026E — forward**) | **23.26x** (the blended segment multiple) | n/a — capitalized at the same rate the segments are valued at, so the deduction is internally consistent | — | derived in §4 |

**Why each comparable matches the segment's economics, not its label.**

- **Systems Protection ← Vertiv.** Both sell engineered power distribution and thermal management (air and liquid cooling) into the same data-centre build cycle, on an order-driven, project-lumpy revenue model, at similar profitability and similar capital intensity: Systems Protection's FY2026E margin is **22.9%** against Vertiv's guided FY2026 adjusted operating margin of **23.8%**, and Systems Protection's capex is **2.0% of sales** (40.1 on 1,966.9 in H1 FY26) [`Q2 FY26 10-Q, Note 13, p.20 and p.22`; `Vertiv Q2 2026 results release, 2026-07-29`]. Infrastructure — mostly data centres and power utilities — is **65.5%** of the segment's H1 FY26 sales, up from 44.8% a year earlier [`Q2 FY26 10-Q, Note 2, p.9`]. That is the closest listed economic match available; the closest *product* match, **Rittal**, is private and has no disclosed income statement at all, so it cannot supply a multiple [`business-model/08_competitive-map.md`, Competitor A].
- **The 26.0x is a discount to Vertiv, and the reason is a mix fact, not a margin haircut.** About a third of Systems Protection is *not* data centres — industrial is 534.0 and commercial/residential 143.6 of H1 FY26 sales — and those verticals were "each flattish" while infrastructure more than doubled [`Q2 FY26 10-Q, Note 2, p.9`; `Q2 FY26 transcript, prepared remarks`]. A ~20% discount to a pure-play prices that mix. Note what is deliberately **not** done: no profitability haircut is applied on top, because this is an earnings-based multiple and the segment's own earnings are already in the denominator (CLAUDE.md §16, no double-charging a quality gap).
- **Electrical Connections ← Hubbell.** Both are US-centric suppliers of electrical connectors, grounding, fastening and cable-management components sold through electrical distributors into commercial, residential and industrial construction, on short-cycle, seasonal demand and low capital intensity (EC capex 1.7% of sales, 12.8 on 746.4) [`Q2 FY26 10-Q, Note 13, p.22`; `MD&A, p.30`; `business-model/08_competitive-map.md`, Competitor B]. Americas is 81% of nVent group revenue and 85% of EC's H1 FY26 sales (634.6 of 746.4), matching Hubbell's US weighting [`Q2 FY26 10-Q, Note 2, p.8`; `ciq_facts.json`, `geographic`].
- **The 17.0x is a modest discount to Hubbell's 18.6x, and the reason is trajectory, not level.** EC's FY2026E margin of 26.0% is *above* Hubbell's guided group adjusted operating margin of ~23.25%, so no profitability discount is warranted. What the denominator does **not** carry is direction: EC's segment margin has fallen for four reported half-years — 31.1% (FY23) → 30.0% (FY24) → 28.7% (FY25, vendor) → 25.9% (H1 FY26), i.e. **−2.6 points year on year** — against Hubbell expanding 40–70bp in FY2026 [`FY24 10-K, MD&A, p.27`; `Capital IQ Financials export → Segments`; `Q2 FY26 10-Q, MD&A, p.30`; `Hubbell Q2 2026 results release, 2026-07-28`]. A ~9% multiple discount sizes that durability gap. That is a permitted reason under §16 (something the denominator does not carry), not a mechanical `own margin ÷ peer margin` haircut.

**Sector Cycle Reality Test — honest absence.** No sector-level multiple history (a sector index / ETF proxy, or the peer group's own aggregate multiple 3–5 years ago) could be sourced for these comparables in this run. Per the Scenario Construction §3 "honest absence" clause this is recorded as **"Not assessable — no sector-level multiple history"** rather than assumed stable. It matters here: Vertiv's own EV/EBITDA has moved from 30.1x (Jan-2026) to 37.0x (late Aug-2026) inside eight months [`Web: valueinvesting.io / stockanalysis.com VRT pages, retrieved 2026-09-07 — indicative, unverified`], which is a live warning that the anchor multiple for Systems Protection sits inside a fast-moving data-centre re-rating and is not a stable reference point.

---

## 3. Segment Valuation

Formula, applied identically to both segments: `segment EV = FY2026E segment income × forward multiple`.

| Segment | Metric value (FY2026E) | Multiple | Segment EV | % of gross EV |
|---|---:|---:|---:|---:|
| Systems Protection | 888.9 | 26.0x | **23,111.4** | 77.8% |
| Electrical Connections | 388.2 | 17.0x | **6,599.4** | 22.2% |
| **Gross enterprise value (sum)** | **1,277.1** | **23.26x** (blended, derived: 29,710.8 ÷ 1,277.1) | **29,710.8** | 100.0% |

**Dispersion, shown separately from the point (Core Principle 5 — no false precision, and no fake mid-band either).**

| Case | Systems Protection multiple | Electrical Connections multiple | Gross EV | Blended multiple |
|---|---:|---:|---:|---:|
| Low | 22.0x | 14.5x | 25,184.7 | 19.72x |
| **Base (the point)** | **26.0x** | **17.0x** | **29,710.8** | **23.26x** |
| High | 30.0x | 19.5x | 34,236.9 | 26.81x |

The low case puts Systems Protection at a **32% discount** to Vertiv's 32.6x and Electrical Connections at a **22% discount** to Hubbell's 18.6x; the high case puts Systems Protection **8% below** Vertiv and Electrical Connections **5% above** Hubbell. Neither end assumes a multiple outside the range the named comparables actually trade at today.

---

## 4. Equity Bridge

All per-share figures divide by **164.2m fully diluted shares** (`01`, §2 — the per-share fair-value count), never the 161.858m market-cap count.

| Step | Base | Low | High |
|---|---:|---:|---:|
| Gross enterprise value (§3) | 29,710.8 | 25,184.7 | 34,236.9 |
| − Capitalized unallocated corporate costs (FY2026E $150.0m × the blended segment multiple) | (3,489.6) | (2,958.0) | (4,021.5) |
| − Net debt (**strict §15 basis**, `01` canonical: total debt 1,492.4 − cash 256.0) | (1,236.4) | (1,236.4) | (1,236.4) |
| − Minority / preferred | 0.0 | 0.0 | 0.0 |
| + Equity-method investments | 0.0 | 0.0 | 0.0 |
| − Conglomerate / holdco discount | 0.0 | 0.0 | 0.0 |
| **= Equity value** | **24,984.8** | **20,990.3** | **28,979.0** |
| ÷ Diluted shares (m) | 164.2 | 164.2 | 164.2 |
| **= SOTP value per share** | **USD 152.16** | **USD 127.83** | **USD 176.49** |
| vs current price — **pool-verified anchor USD 171.16 (close 2026-08-12; ~17–19 trading days stale)** | **−11.1%** | −25.3% | +3.1% |
| vs current price — **indicative refresh USD 156.03 (close 2026-09-04, web-sourced, unverified)** | **−2.5%** | −18.1% | +13.1% |

**Net-cash sign discipline.** nVent is **not** net cash: net debt is a **positive $1,236.4m on the strict §15 basis**, so it appears once, as a single deduction. There is no add-back line anywhere in this bridge and no second netting of the same balance. `01`'s cash-quality test was applied and inherited: all $256.0m is genuine cash and equivalents with no financial-subsidiary portfolio and no short-term investments, so the strict and broad bases coincide — but **$79.6m (31.1%) sits in countries where repatriation is limited by local regulation or tax cost** [`Q2 FY26 10-Q, MD&A, Liquidity and Capital Resources`]. On the conservative variant that nets only the $176.4m of freely usable cash, net debt is 1,316.0 and the base SOTP falls to **USD 151.68** (−$0.48/share). That is a rounding-scale difference and does not change the read.

**The corporate bucket is capitalized, not dropped (Reconciliation Gate 3).** Enterprise-and-other is a recurring cost of **$150.0m in FY2026E** (H1 actual $73.7m annualised; FY2025 $123.8m; FY2024 $105.6m), equal to **11.7% of reportable segment income** [`Q2 FY26 10-Q, Note 13, p.21`; `FY24 10-K, Note 15, p.70`; vendor for FY2025]. It is capitalized at the same blended multiple the segments are valued at, which makes the deduction exactly equivalent to applying the peer multiples to an after-corporate profit — the basis the comparables themselves are struck on. It is never assumed away.

**No conglomerate or holding-company discount is applied, and here is why.** nVent is not a holding company under the Business-Type Method Map — it is an **Operating** business with two related electrical-products segments that share channel (electrical distributors), geography (Americas 81% of revenue), manufacturing footprint and management, run under one set of centrally managed functions [`Q2 FY26 10-Q, Note 13, p.19`; `ciq_facts.json`, `geographic`]. There is no listed subsidiary, no cross-holding structure, no unrelated diversification, and no controlling shareholder whose interests diverge from minorities (CLAUDE.md §24, Filter 6 — no RF-OWN-004 trigger is carried into this module). A breakup discount would be an assertion, not a measurement, so none is taken. What *is* flagged instead is the opposite risk: the two segments are converging on the same end market, so the diversification a discount would normally price is shrinking, not growing.

**Adjustments deliberately not made, each with its reason.**

- **Intangible amortization ($165.0m FY2026E) is not deducted, because both sides of the multiple exclude it.** nVent's segment income excludes it and so do Vertiv's and Hubbell's adjusted operating profit, so charging it here would price it once on nVent and not at all on the comparables. It is nonetheless a real cost of an acquisition programme that spent roughly $1,120m (FY2023), $678m (FY2024) and $976m (FY2025) [`earnings/01_historical-financials.md`, §5]. **Labelled sensitivity, not applied:** deducting FY2026E amortization at the blended 23.26x would remove $3,838m of enterprise value, or **$23.37 per share**, taking the base SOTP to **$128.79**. Anyone who believes acquired intangibles are a recurring economic cost rather than an accounting artefact should read the base at that level.
- **Operating leases ($140.5m) are not added to debt** — `01`'s canonical debt is the filing debt-note basis, and the comparables' enterprise values as sourced are on their own vendors' conventions. Adding them would cut the base SOTP by $0.86/share.
- **Maverick Power is excluded.** The acquisition ($1.75bn cash plus up to $550m earn-out, ~$700m estimated 2026 revenue, expected to close Q4 2026, funded with cash and new debt) had not closed at the run date and is not in `01`'s bridge [`nVent-to-Acquire-Maverick-Power-2026.pdf`, 2026-08-24]. **Labelled sensitivity, *inference — not from filings*:** the precedent is that the Electrical Products Group's enclosure, switchgear and bus-system assets went "predominantly within our Systems Protection reporting segment" [`Q2 FY26 10-Q, MD&A, p.24`], so Maverick most likely lands in Systems Protection. The deal discloses revenue (~$700m) but **no segment income or margin**, so no defensible segment metric can be built for it — under the "suppress rather than guess" rule it is **excluded from the SOTP entirely** rather than valued on an invented margin. Directionally: at the base 26.0x, the $1.75bn headline price would be value-neutral only if Maverick contributes about $67m of segment income (a 9.6% margin on $700m of revenue) and value-additive above that — but that is an arithmetic identity, not a forecast, and the pool contains nothing to test it against.

---

## 5. SOTP Read

**The breakup value is USD 152.16 per share (dispersion USD 127.83–176.49 across the multiple range), which is 11.1% below the stale pool anchor of $171.16 and 2.5% below the fresher indicative quote of $156.03 — so on defensible peer multiples the parts are worth roughly what the whole is quoted at, not more.** This SOTP does not uncover hidden value; the honest finding is that at the fresher price the market and the sum of the parts are within a few percent of each other, and at the stale August price the market was ahead of the parts by about a ninth.

**Systems Protection carries the value, and it is not close: $23,111m of the $29,711m gross enterprise value, or 77.8%, and about $124 of the $152 per-share base** — from a segment that was 53.2% of segment income as recently as the FY2024 audited note. Electrical Connections, which earns the **higher** margin (26.0% FY2026E against 22.9%), contributes only 22.2% of the value, because it is growing at 15% against 49.6% and its margin has fallen for four reported half-years running.

**No segment is being masked by the consolidated multiple — the opposite is happening, and that is the finding.** At the anchor price of $171.16 the consolidated company trades at **25.7x** FY2026E adjusted EBIT (EV 28,940.0 ÷ 1,127.1); at the indicative $156.03 it trades at **23.5x** (EV 26,491.1 ÷ 1,127.1). Solve backwards for what Systems Protection must be worth to justify each, holding Electrical Connections at Hubbell's-discount 17.0x and capitalizing corporate at the blended rate: the anchor price requires **30.0x** for Systems Protection — within 8% of pure-play Vertiv's 32.6x — while the fresher price requires **26.8x**, an 18% discount to Vertiv. In plain terms, the consolidated multiple is not hiding a data-centre business inside a dull industrial; it is already paying close to a data-centre pure-play multiple for 70% of the profit, and the entire question for this stock is whether Systems Protection deserves to be priced within touching distance of Vertiv while a third of its sales sit in flat industrial and commercial end markets and its order book is, in management's own word, "lumpy" [`Q2 FY26 transcript, prepared remarks`].

**Confidence, stated plainly.** This SOTP is **low-confidence** and should be weighted as a cross-check, not as a base-case anchor: (a) no peer multiples exist in the data pool, so every comparable multiple is web-sourced and unverified (MODULE_RULES partial-data "no peer data" rule for `06`); (b) no segment-level consensus or guidance exists, so the FY2026E segment split of guided H2 revenue is this agent's inference, disclosed and reconciled to guided EPS within $0.03 but still an inference; (c) the FY2025 segment comparatives are a tier-5 vendor read because the FY2025 10-K is absent from the pool; (d) the Systems Protection multiple sits inside a data-centre re-rating whose stability could not be tested (Sector Cycle Reality Test — Not assessable); and (e) the price anchor is ~17–19 trading days stale with an 8.84% drift, which is why both price-relative reads are published side by side above. Under the Scenario Construction policy, nVent is an Operating company with a usable forward metric, so `07` should keep `06` inside the minority cross-check weight, not elevate it.

**Out-of-scope guardrail.** No scenario probabilities, probability-weighted target, risk/reward, position size or rating is produced here — those belong to `07_scenario-and-fair-value` and the master synthesizer.



---

## valuation / 07_scenario-and-fair-value.md

_Source: `07_scenario-and-fair-value.md`_

# Scenario & Fair Value — NVT

**Evidence binding: frozen.** Every pool read resolved through the bound generation `6db32848…1aecd1e6`; `data/NVT/…` is a citation label only. Live `data/NVT/` and `_pool_extracts/` were not read. This agent consumes `00`–`06` and does not re-run any method.

**Regime and anchors, taken verbatim from `01_price-and-capital-structure` §7 (MODULE_RULES → Reconciliation Gate 1).** US SEC filer, **US GAAP**, **USD in millions** (per-share in dollars), fiscal year ends 31 December. Price-state **`pool-verified`**: **USD 171.16**, close **2026-08-12**, **stale by 26 calendar days ≈ 17–19 trading days**; corroborated indicative refresh **USD 156.03**, close **2026-09-04**, web-sourced and unverified, a **−8.84%** drift. Net debt **USD 1,236.4m — strict §15 basis** (broad identical; no short-term investments). Fully diluted shares for per-share fair value **164.2m**. Canonical EV **USD 28,940.0m** at the anchor.

**Three facts govern every number below and are stated once so they travel.**
1. **The price anchor is stale.** Every price-relative read is published at **both** prices, each labelled with its price and as-of date, leading with the fresher one (MODULE_RULES → Price freshness). The fair-value **levels** are price-independent and do not move when the anchor is re-anchored.
2. **Everything is pre-Maverick-Power.** The $1.75bn cash acquisition (plus up to $550m earn-out, ~$700m of target 2026 revenue, close expected Q4 2026, funded from cash on hand and new debt) was announced **2026-08-24** [`nVent news release, 2026-08-24`] — after the price anchor (2026-08-12), after the whole consensus set (to 2026-08-07) and after the 30-Jun-2026 balance sheet. Cash flows and debt are pre-deal on both sides, consistently.
3. **Both multiples methods flagged their reference point cycle-elevated.** `02` and `03` each emitted `RF-VAL-001`, in the **same direction**. Their agreement is not corroboration — see §2.

---

## 1. Method Summary

| Method | Fair / Implied Value (per share) | Confidence | Weight | Why This Weight |
|---|---:|---|---:|---|
| Own-history multiples (`02`) | **No base point published** — `02` §4 is marked *"ILLUSTRATIVE ONLY — NOT A FAIR-VALUE INPUT FOR `07`"*; the illustrative median-reversion markers run $109.82–$194.36, and the most reliable single marker (TEV/NTM EBITDA median) is $145.94 | **Low** — window is ~1.5 years (six quarterly closes) against the 3–5 years the method needs; `ciq_facts.json` itself calls the read *"LOW-CONFIDENCE (6 closes <8q ≈2y)"*; `RF-VAL-001` fired (cycle-elevated), method confidence capped 60 | **0%** | **Zero-weighted because its own producer declared it non-value-producing.** A mean struck off six quarters inside one continuous upswing is not a through-cycle warranted multiple. It stays in the football field (§2) for transparency and supplies the **evidenced multiple bounds** for §3 (actual traded levels, which `02` §2 explicitly permits `07` to use) — but it does not enter the base point |
| Relative / peers (`03`) | **$141.37** = warranted forward P/E **24.5x** × NTM EPS **$5.77** | **Mixed** — no peer multiples exist in the pool (`ciq_facts.json` `peer_ev_ebitda: missing`), so every peer multiple is web-sourced 2026-09-07 and unverified (overall usefulness max 70); `RF-VAL-001` fired (peer anchor cycle-elevated) | **67%** | **Multiples-first (Scenario Construction §1).** nVent is an Operating company with a usable forward metric — NTM EPS $5.77, reconciled across two independent providers to the cent [`Capital IQ Estimates → Multiples`, NTM P/E 29.6612x ÷ $171.16; `Web: stockanalysis.com`, 27.04x ÷ $156.03] — so the multiples methods carry the majority. With `02` zero-weighted, `03` carries that majority alone. That concentration is itself a limitation and is why confidence is capped at 55 |
| Intrinsic DCF (`04`) | **$76.30** (grid dispersion $62.70–$95.26; structural-runoff terminal $69.92) | **Good on construction, capped by inputs** — terminal value only 45.6% of EV (no terminal-dominance cap); WACC 10.22% reality-tested and sits **+0.22pp above** the company's own disclosed 10.0% group rate [`FY24 10-K, MD&A — Critical Accounting Estimates, p.32`]; no `RF-VAL-003` escalation; but rf/ERP/beta are web-sourced and FY2031–35 is the agent's own fade | **22%** | Cross-check per Scenario Construction §1, which caps `04`+`06` **combined** at ≈ ⅓. It gets the larger half of that budget because it is the **only method built on filing-grade cash flows and the company's own disclosed cost of capital**, and because its terminal fades ROIC to WACC — which is what allows the No-moat structural reset to be demoted to a §24 floor rather than becoming the headline bear (see §3) |
| Reverse-DCF (`05`) | *(implied, not a value)* — price implies **+21.80%** FCFF CAGR for 9.5 years at $171.16, **+20.39%** at $156.03; implied discount rate **6.21% / 6.53%** against a 10.22% model WACC and a 10.0% company-disclosed rate | **Good** — inverts `04`'s own machine and replicates `04` §6/§7 to the cent | **n/a** | Cross-check, never a weighted input. It informs whether the base case is achievable — and its verdict is **"aggressive, not achievable on duration"** |
| Sum-of-the-parts (`06`) | **$152.16** (range $127.83–$176.49) | **Low — self-declared** | **11%** | Value-producing (it cleared the forward-basis hard rule: FY2026E segment metrics × forward comparable multiples), so it is not zero-weighted — but its own author instructs *"`07` should keep `06` inside the minority cross-check weight, not elevate it."* Five stated limits: web-sourced comparables, an inferred H2 segment split, tier-5 FY2025 comparatives, an untestable data-centre re-rating, and the stale anchor |

**Weights sum to 100% across the value-producing, business-type-valid set (03, 04, 06).** nVent is an **Operating** company, so the Business-Type Method Map's operating methods apply and none is invalid by type. `02` is excluded on its producer's own illustrative-only declaration. `05` is a cross-check by construction. The **combined cross-check weight (04 + 06) is exactly 33%**, at the ≈ ≤ ⅓ cap; no stated reason elevates either above it (nVent is not a holding company, and SOTP is not primary here).

---

## 2. Triangulation & Reconciliation

### 2A. The method football field — the honest cross-method spread, not narrowed

| Method | Value / Range | Confidence | Weight | Why this weight |
|---|---:|---|---:|---|
| `02` own-history multiples | **no point**; illustrative markers $109.82 – $194.36; five-row cluster $143.37 – $160.47; best single marker $145.94 | Low (1.5-yr window; `RF-VAL-001`) | 0% | Producer-declared illustrative-only |
| `03` peers | **$141.37**; dispersion $127.29 – $144.17 (7-peer median), widening to $116.15 – $144.17 on the core three | Mixed (all peer multiples web-sourced; `RF-VAL-001`) | 67% | Multiples-first majority, carried alone |
| `04` intrinsic DCF | **$76.30**; grids $62.70 – $95.26; 15x exit-multiple ceiling $120.88 | Good construction, web-sourced rate inputs | 22% | Cross-check cap; the only filing-grade cash-flow read |
| `06` SOTP | **$152.16**; range $127.83 – $176.49 | Low (self-declared) | 11% | Minority cross-check, per its own instruction |
| *Memo:* `03`'s Maverick transaction comp | *$77.41 (11.5x forward EBITDA on FY2026E), offered as a gap-size read, not a fair value* | — | 0% | The one genuinely independent input set |
| **Full high-to-low field, valid value-producing methods** | **$76.30 – $152.16** | — | — | **Spread = 99.4% of the low value (49.9% of the high)** |

> **HEADLINE FINDING: the methods disagree by 99.4%, and that disagreement is the finding.** MODULE_RULES Reconciliation Gate 6 and the Score-Cap table both bind: **valuation confidence is capped at 55**, and the cap is **not waived because the prose below explains the gap**. A DCF at $76.30 and a SOTP at $152.16 are not two estimates of one number; they are two different claims about what nVent is.

### 2B. Sector cycle distortion — one distorted read counted twice, named

**Both `02` and `03` fired `RF-VAL-001` in the same direction (cycle-elevated).** `02` §5: nVent's entire 1.5-year multiple history sits inside a sector-wide re-rating — S&P 500 Industrials forward P/E roughly **16.0x (late 2022) → 25.5x**, about **+59%** [`Web: Yardeni Research QuickTakes, retrieved 2026-09-07 — indicative, unverified`]. `03` §6: the peer-median anchor is elevated on the same driver — industrials forward P/E ~24.25–24.5x against a ~17.0x 25-year average (**+43%**), with Eaton's EV/EBITDA up **+59%** since 2021 (17.06x → 27.14x) and Hubbell's **+16%** [`Web: stock-analysis-on.net / valueinvesting.io / siblisresearch.com / macromicro.me, retrieved 2026-09-07 — unverified`].

**Stated plainly: `02`'s own-history band and `03`'s peer median are not two independent corroborating reads. They are the same sector cycle counted twice.** The compounding rule (Scenario Construction §3) therefore applies and the **combined base-case valuation confidence is capped at 55** — and the multiples-first majority weight is **not** applied on autopilot: it is applied because the hard rule requires it for an Operating company with estimates, while confidence in the resulting point is cut to the cap and said so here. Two further, independent reasons that concentration is uncomfortable: **`03`'s peer multiples are not in the data pool at all** (every one is web-sourced on a single date from a single provider), and **`06`'s comparables come from the same provider on the same date**, so `03` and `06`'s apparent agreement at $141–$152 is a third instance of the same non-independence, not confirmation.

### 2C. What IS independent — and it lands 45% lower

Two reads in this run rest on genuinely different input sets from the public-multiple cluster, and they converge to within **1.5%** of each other:

- **`04`'s intrinsic DCF: $76.30**, built on filed cash flows (LTM CFO from continuing operations $772.8m − capex $112.9m + after-tax interest $58.4m = FCFF base $718.3m) and discounted at 10.22%, which is **+0.22pp above the 10.0% weighted-average cost of capital nVent itself discloses and applies to every reporting unit** in its own goodwill test [`FY24 10-K, MD&A, p.32`].
- **`03`'s Maverick transaction comparable: $77.41**, the arm's-length private-market clearing price this company's own management just agreed — *"approximately 11.5 times anticipated 2026 adjusted EBITDA"* — for the same data-centre power growth exposure, at essentially the same EBITDA margin (~21.7% vs nVent's 21.71%) [`nVent news release, 2026-08-24`].

### 2D. Base-case fair value — the single point, and the reconciliation judgement behind it

> **Base-case fair value: USD 128.24 per share.** `0.67 × 141.37 + 0.22 × 76.30 + 0.11 × 152.16 = 128.24` — the mechanically-weighted blend of §1's weights, produced by the executed snippet in §3, **not** re-anchored afterwards. It implies **22.23x** NTM EPS of $5.77 (`128.24 ÷ 5.77`), or **16.4x** EV/NTM EBITDA (`(128.24 × 164.2 + 1,236.4) ÷ 1,359.8`).

**The lens I trust most for this company is `04`, and the lens that carries the weight is `03` — those are not the same statement, and the gap between them is the reconciliation.** The hard multiples-first rule (Scenario Construction §1) makes `03` the majority for an Operating company with a usable forward metric, so the published base is anchored there and pulled down by the cross-checks; I do **not** get to swap lenses because I prefer the DCF. What I do instead is refuse to let the arithmetic imply that the truth sits in the middle: **$128.24 is where the policy's weights land, not a claim that nVent is worth roughly halfway between its cash flows and its comps.** The three multiples reads ($145.94 illustrative, $141.37, $152.16) share one web-sourced peer set inside one cycle-elevated sector, while the two independent reads ($76.30, $77.41) sit 45% lower — so the risk in the base point is asymmetric and runs downward. `05` says the same thing from the price side: to pay $156.03 you must believe free cash flow compounds at **20.4% for nine and a half consecutive years** off a base that both `earnings/01` and `01` flag as a cycle peak, against the **8.6%** `04`'s own consensus-fed forecast delivers, while organic orders have already decelerated from ~+40% to "low double digits" and backlog has slipped $2.6bn → $2.5bn [`Q1`/`Q2 FY26 transcripts, prepared remarks`]. No lens swap and no conservative override was applied to the published point; the honest response to the 99.4% dispersion is the confidence cap of 55, stated here rather than absorbed.

---

## 3. Bull / Base / Bear Fair-Value Levels

**Every case is one derived LEVEL (a point) built as `forward metric × multiple`, on one common forward period — NTM, roughly Q4-2026 through Q3-2027.** NTM revenue is `0.25 × FY2026E guided 5,372.5 + 0.75 × FY2027E consensus 6,368.6 = $6,119.6m`. Earnings per share is built as `(revenue × adjusted return on sales − $65.0m guided interest) × (1 − 22.4% effective tax) ÷ 164.1m diluted shares` [`Q2 FY26 10-Q, income-tax note` and `Note 4`; `Capital IQ Estimates → Guidance`, interest expense FY2026]. **The base build reproduces consensus:** `6,119.6 × 21.1% = 1,291.2`; `(1,291.2 − 65.0) × 0.776 ÷ 164.1 = $5.80`, against the consensus NTM EPS of **$5.77** — a 0.5% gap, so the machine is calibrated before it is used. **Horizon: 12 months to 2026-09-07 + 1 year**, for all three cases; the structural reset below carries a different, longer horizon and says so.

| Case | Fair Value / Share (point) | Forward Metric (NTM adj. diluted EPS) | Multiple | Horizon | What Must Be True (operating drivers) |
|---|---:|---:|---:|---|---|
| **bull** | **USD 198.88** | **$6.63** — NTM revenue $6,519.6m (data-centre revenue **+20%**, i.e. +$400m on the guided >$2.0bn base) × adjusted ROS **22.5%** (30% incremental conversion — management's own former target) | **30.0x** NTM P/E | 12 months | Data-centre order intake re-accelerates: backlog back above **$2.6bn** and organic orders back out of "low double digits" at the **30-Oct-2026** Q3 print; Blaine 1 and Blaine 2 capacity absorbed at 30% incrementals; tariff and copper cost recovered at or above the measured 58% offset. Implied GAAP EBITDA margin **23.5%**, just above `04`'s forecast peak of 22.8% and the LTM 22.2% |
| **base** | **USD 128.24** | **$5.77** — consensus NTM EPS; NTM revenue $6,119.6m × adjusted ROS **21.1%** (the guided FY2026 level) | **22.23x** NTM P/E *(derived from §2D's weighted point, not assumed)* | 12 months | Consensus delivers: FY2026 revenue at the +37–39% guided midpoint and adjusted EPS $5.00–5.10, FY2027 at the 17-estimate consensus of $6,368.6m; cost inflation recovered at the measured **58%** H1 FY26 offset; the multiple settles at roughly the current peer median (22.06x) as the growth premium `03` sizes at +2.44 turns is competed away. Implied GAAP EBITDA margin **22.2%**, at the LTM level |
| **bear_cyclical** *(the headline bear)* | **USD 77.23** | **$4.29** — NTM revenue $5,719.6m (data-centre revenue **−20%**, −$400m) × adjusted ROS **17.0%** | **18.0x** NTM P/E | 12 months | Backlog keeps falling through the 30-Oct-2026 and Feb-2027 prints; the ~$2.5bn backlog (≈47% of guided FY2026 revenue) runs off faster than it is replaced while three committed Minnesota plants enlarge the fixed base; operating deleverage reverses the absorption gain. Implied GAAP EBITDA margin **18.1%** |
| **bear_structural** *(NOT the headline — the §24 avoid-ruin floor)* | **USD 69.92** | impaired terminal: `04` §5 runoff — terminal EBITDA margin **17.5%** (the FY2022 trough level, non-recovering) at **0.0% nominal** terminal growth (≈ **−2.3% real**, i.e. permanent real shrinkage) | *not a multiple* — impaired-DCF enterprise value $12,716.8m | **24–36 months** | Liquid-cooling architecture or the 800-volt DC rack standard settles against nVent's product set; the growth vertical becomes a share loss rather than a cycle. Permanent impairment, not a recoverable trough |

### 3A. The arithmetic, executed

```
$ python3 fv.py
== B. WEIGHTED BASE POINT (multiples-first: 03 majority; 04+06 combined <= 1/3) ==
  weights sum = 1.00 ; cross-check (04+06) = 0.33
    03 peers    141.37 x 0.67 =  94.718
    04 DCF       76.30 x 0.22 =  16.786
    06 SOTP     152.16 x 0.11 =  16.738
  WEIGHTED BASE FAIR VALUE = $128.24/sh
== C. FORWARD METRIC BUILD (common period = NTM, ~Q4-26 to Q3-27) ==
  NTM revenue = 0.25*5372.5 + 0.75*6368.6 = 6119.6
  BASE  rev 6119.6 x ROS 21.1% -> adj op 1291.2 -> EPS $5.80  (consensus NTM EPS $5.77 -> gap +0.5%)
  BULL  rev 6519.6 x ROS 22.5% -> adj op 1466.9 -> EPS $6.63  (+14.9% vs base metric)
  BEAR  rev 5719.6 x ROS 17.0% -> adj op  972.3 -> EPS $4.29  (-25.6% vs base metric)
== D. CASE LEVELS = forward metric x multiple ==
  BASE multiple implied by the weighted point = 128.24 / 5.77 = 22.23x
  BULL  6.63 x 30.0x = $198.88
  BASE  5.77 x 22.23x = $128.24
  BEAR  4.29 x 18.0x = $77.23
  ordering check: bull mult 30.0 >= base 22.23 >= bear 18.0 ? True
  metric ordering: 6.63 >= 5.77 >= 4.29 ? True
== E. IMPLIED EV/NTM EBITDA SANITY (NTM EBITDA 1359.8 per 02 s1) ==
  bull $ 198.88 -> EV 33892.6 -> 24.92x   base $ 128.24 -> EV 22293.7 -> 16.39x   bear $ 77.23 -> EV 13917.7 -> 10.24x
  (current 21.39x; own-history NTM band 12.40-27.23x, mean 18.43x)
== F. STRUCTURAL-RESET / AVOID-RUIN FLOOR (EV-based; 04 s5 runoff terminal) ==
  impaired EV 12716.8 - canonical STRICT net debt 1236.4 = equity 11480.4
  / 164.2m fully diluted = $69.92/sh   (net debt subtracted BEFORE dividing)
  worse-of test: cyclical trough $77.23 vs structural reset $69.92 -> worse = $69.92
== I. SYMMETRY / FAKE-ASYMMETRY CHECK vs 02's own-history P/NTM EPS band ==
  02 band: min 14.87 / mean 25.82 / median 26.66 / current 29.66 / max 38.16
  bull travel toward max = (30.0-22.23)/(38.16-22.23) = 48.8% of the way
  bear travel toward min = (22.23-18.0)/(22.23-14.87) = 57.4% of the way
```

```
$ python3 margin_basis.py     # s15 matched-basis check on the case margins
BULL: rev 6519.6 | adj op 1466.9 = adj ROS 22.50% | GAAP EBITDA 1531.9 = 23.50%
BASE: rev 6119.6 | adj op 1291.2 = adj ROS 21.10% | GAAP EBITDA 1356.2 = 22.16%
BEAR: rev 5719.6 | adj op  972.3 = adj ROS 17.00% | GAAP EBITDA 1037.3 = 18.14%
Benchmarks (matched GAAP EBITDA-margin basis, earnings/01 s1):
  FY2022 (own prior trough) 17.2% | FY2023 21.6% | FY2024 22.4% | FY2025 21.2% | LTM Jun-26 22.2%
  04 s5 mid-cycle terminal 20.0% ; 04 s5 runoff/structural terminal 17.5%
```

### 3B. Where the multiples come from — anchored to `02`'s evidenced band, not invented

`02` withheld its mean/median as a fair-value input but explicitly permits `07` to use its **observed min/max as evidenced outer bounds**, "since those are actual traded levels rather than a derived central tendency." On **P / NTM EPS** the six-quarter band is **min 14.87x · mean 25.82x · median 26.66x · current 29.66x · max 38.16x**.

- **Bull 30.0x** — roughly where the stock actually traded on the anchor date (29.66x), below the observed high of 38.16x. The bull is "the August multiple holds while earnings beat," not a new high. Implied EV/NTM EBITDA of **24.9x** sits inside the observed 12.40–27.23x NTM band.
- **Base 22.23x** — derived from §2D's weighted point, not assumed. It is **below** the own-history mean, median and current level, and essentially **at the current peer median of 22.06x**. It is inside the observed range (above the 14.87x min), so the base does not require a multiple this company has never traded at.
- **Bear 18.0x** — compressed toward, but not to, the observed min of 14.87x; roughly the low-growth end of the current peer set (Atkore 15.19x, ABB 20.61x, Hubbell 21.23x). Implied EV/NTM EBITDA of **10.2x** is below the observed 12.40x floor, which is deliberate: `02` §6 warns that band's bottom "is a level from inside the boom, not a downside anchor tested against a downturn."

**Fake-asymmetry check, run and passed.** The band is right-skewed (base to max = 15.93 turns; base to min = 7.36 turns). The bull travels **48.8%** of the way to the observed maximum; the bear travels **57.4%** of the way to the observed minimum. The bear moves the larger fraction of its own side, so the set is not a peak-metric-and-peak-multiple bull against a mild-haircut bear.

### 3C. The bear is a true through-cycle trough, and here is the prior-downturn evidence

**nVent has under one full standalone cycle.** It was spun out in 2018, and the pool contains **no organic revenue decline at all** in the post-divestiture record — `earnings/07` §2 states it outright: *"there is no organic-revenue decline in the post-divestiture record to measure a down-volume response against."* FY2022's apparent −6.8% revenue fall is an artefact of Thermal Management moving to discontinued operations and is marked NM [`earnings/01_historical-financials.md` §1, basis break 1].

**So the trough is anchored on the company's own worst reported margin year, named and cited: FY2022 — GAAP EBITDA margin 17.2%, GAAP EBIT margin 13.5%, revenue $2,295.1m** [`earnings/01_historical-financials.md` §1]. The bear above lands at an implied **GAAP EBITDA margin of 18.14%** — **0.94pp above** that documented trough and **1.4pp below** `04`'s benchmarked mid-cycle terminal of 20.0%. That is a real trough placement, not a mild dip off the peak, and it is not deeper than the history supports.

**The upstream sensitivity band was deliberately widened, and the reason is on the record.** `earnings/07` builds its ±20% data-centre move on a ±25% incremental conversion rate — but its own §6 says that rate **understates a down-volume decremental**, because it was measured on *rising* volume against a fixed base being deliberately enlarged (three Minnesota liquid-cooling plants; FY2026 capex guided ~$130m, up ~40%; D&A ~$230m), and because **109% of the Q2 FY26 operating-margin gain was fixed-overhead absorption** — SG&A fell 452.8bps while gross margin fell 67.9bps. `earnings/07`'s compound bear on its two largest variables is **−$1.02 of FY2026 EPS (−20.2%)**; this bear runs **−25.6%** on the NTM metric, reaching the FY2022 margin level rather than stopping at the sensitivity band's edge. Said explicitly, as required.

### 3D. Which case the structural reset becomes — the graduated rule, applied

**The trigger fired on two limbs.** `business-model/09_moat.md` §5 returns **"No moat proven — a moat in structure, not in economics"** (through-cycle ROIC **8.10%** against the company's own disclosed **10.0%** cost of capital), and `business-model/07_business-quality.md` §1 scores **industry rate-of-change 40/100**, at the ≤ ~40 disruption threshold, emitting `RF-BQ-005`.

**But the moat trajectory is `STABLE`, not eroding** — `09_moat.md` §5 states it in terms: *"the panel is split 4–3, so neither 'widening' nor 'eroding' is confirmed"*, and *"'erosion' must not be carried downstream as confirmed."* Under the graduated rule the structural reset is the headline Bear **only on a confirmed eroding trajectory**. It is not confirmed here. So:

- **The headline bear is `bear_cyclical` at $77.23** (12-month horizon).
- **`bear_structural` at $69.92 is carried to §24 / Kill Criteria as the labelled avoid-ruin floor** — the multi-year (24–36 month) permanent-impairment path, not the 12-month bear.

**The demotion is licensed, and the licence is checked rather than assumed.** A bare No-moat reset may only be demoted if a weighted method already prices the lost excess return. It does: **`04` is in the blend at 22% weight and its base terminal pins ROIC to WACC** — `04` §5, *"terminal ROIC is set equal to the WACC… a fade to the cost of capital with no moat premium"*, which costs about $14.4/share against the conventional shortcut terminal. So the No-moat economics are inside the published base point, not floating unpriced. The **worse-of** test is run and recorded regardless: the cyclical trough ($77.23) is **above** the structural reset ($69.92), so nothing is being hidden by the billing — both levels are published, both carry their own bridge, and both reach the master synthesizer under their own labels.

**Bridge discipline on `bear_structural` (the two cases do not share a convention, and that is stated).** `bear_cyclical` is an equity-multiple case: `NTM EPS × P/E` is already an equity value, so no net debt is subtracted. `bear_structural` is **enterprise-value based** (`04` §5's impaired-DCF EV of $12,716.8m), so it is bridged with `01`'s **canonical strict §15 net debt of $1,236.4m, subtracted BEFORE dividing**: `(12,716.8 − 1,236.4) ÷ 164.2m = $69.92`. Net debt is deducted once, on the one case that needs it.

### 3E. Span check and conjunction check (CLAUDE.md §10)

**Span check — what single piece of news could move this 10%+, and which case contains it?** The **Q3 FY2026 results on 30-Oct-2026**, and specifically two lines read together: organic order growth against the "low double digits" print, and group backlog against the $2.5bn at 30-Jun-2026. `09_moat.md` §5 names the exact thresholds: backlog above **$2.6bn** with gross margin recovering above 37.9% flips the read to widening; backlog below **$2.4bn** with gross margin under 37.0% flips it to eroding. The vertical grew **+115.6%** year on year in Q2 FY26 while orders decelerated from ~40% — this is a binary the stock can move far more than 10% on. **The bull case contains the re-acceleration** (+27.5% from $156.03, +16.2% from $171.16); **`bear_cyclical` contains the failure** (−50.5% / −54.9%). A second, dated event — the **Maverick Power close in Q4 2026** — is inside no case at all and is flagged in §3F. The set spans.

**Conjunction check — is either case a stack of independent conditions?** No, and this is deliberate. The bull needs three things (volume +20%, 30% incremental conversion, multiple to 30.0x) but they are **not independent**: `earnings/07` §5 states variables 1 and 2 are *"multiplicative by construction"*, and the multiple follows the beat. The bear needs the mirror three, and `earnings/07` §6 shows the margin collapse follows **mechanically** from the volume miss because 109% of the margin gain is fixed-overhead absorption. **One condition — whether the data-centre order book re-accelerates or keeps decelerating — drives all three rows in each case, symmetrically.** Neither side is built from a conjunction the other is spared.

### 3F. Maverick Power sits outside every level above — stated, not folded in

All four levels are pre-deal on both the earnings and the debt side, consistently. Two directional facts, neither quantified into a level because the pool cannot support it: (1) the deal was struck at **~11.5x anticipated 2026 adjusted EBITDA** against nVent's own **~21.4x NTM EV/EBITDA** at the anchor, so it is multiple-accretive on the company's own disclosure; (2) it adds roughly $1.75bn of debt — `balance-sheet-survival/01`'s labelled pro-forma net debt of **~$2,986.4m / ~2.43x** (*Inference, not from filings*) would take net debt per share from **$7.53** to roughly **$18.2** and move nVent from the least-levered end of its peer set to about its median. `earnings/07` rank 7 records the EPS effect as **"not quantifiable"** — Maverick's margin, its intangible amortisation and its cash-versus-debt funding split are all undisclosed. Inventing a number here would be exactly the failure the suppress-rather-than-guess rule exists to stop.

**No probabilities are assigned to any case.** That is the master synthesizer's work (MODULE_RULES → Scope; CLAUDE.md §10, §22).

---

## 4. Margin of Safety & Downside (two separate metrics)

**Mandatory inline staleness flag (`01` §7).** The pool-verified anchor's as-of date is **2026-08-12**, 26 calendar days / ~17–19 trading days before this run, and the corroborated 2026-09-04 quote is **8.84% lower** — enough to move every row below by roughly nine points. **Both prices are shown; the fresher read leads.** The fair-value levels themselves are price-independent, so anyone can re-anchor in one step: returns are `(level − price) ÷ price`.

**Read at the FRESHER price — USD 156.03, close 2026-09-04 (web-sourced, corroborated by two independent sources, unverified — *not* the anchor):**

| Metric | Value |
|---|---:|
| Current price | **USD 156.03** *(indicative, 2026-09-04)* |
| Base-case fair value (point) | **USD 128.24** |
| Bear-case fair value (`bear_cyclical`, the headline bear) | **USD 77.23** |
| Bull-case fair value | USD 198.88 |
| Implied upside to base case = (base FV − price) / price | **−17.8%** |
| **Margin of safety** = (base FV − price) / base FV — the cushion | **−21.7%** *(negative: there is no cushion — price sits above base fair value)* |
| **Downside to bear** = (price − bear FV) / price — ***inverted: higher = worse*** | **+50.5%** |
| *Memo:* upside to bull = (bull FV − price) / price | +27.5% |
| *Memo:* downside to the §24 avoid-ruin floor ($69.92, 24–36 months) — *inverted* | +55.2% |

**Read at the POOL-VERIFIED ANCHOR — USD 171.16, close 2026-08-12 (STALE ~17–19 trading days):**

| Metric | Value |
|---|---:|
| Current price | **USD 171.16** *(pool-verified, 2026-08-12 — stale)* |
| Base-case fair value (point) | **USD 128.24** |
| Bear-case fair value (`bear_cyclical`) | **USD 77.23** |
| Bull-case fair value | USD 198.88 |
| Implied upside to base case = (base FV − price) / price | **−25.1%** |
| **Margin of safety** = (base FV − price) / base FV — the cushion | **−33.5%** *(negative — no cushion)* |
| **Downside to bear** = (price − bear FV) / price — ***inverted: higher = worse*** | **+54.9%** |
| *Memo:* upside to bull = (bull FV − price) / price | +6.5% |
| *Memo:* downside to the §24 avoid-ruin floor ($69.92) — *inverted* | +59.2% |

**These are two different numbers and neither is a proxy for the other.** Margin of safety is the discount of price to the **base** fair value — here it is **negative at both prices**, meaning the price is above base fair value and there is no cushion at all, not a small one. Downside-to-bear is the loss if the bear case plays out; it is an **inverted** metric and at **+50.5% / +54.9%** it is the larger number by a wide margin. The price-state is `pool-verified`, so both metrics are assessable; the **staleness** cap (valuation confidence max 60) binds, and the wider **99.4% cross-method dispersion** cap (max 55) and the **same-direction `RF-VAL-001` compounding** cap (max 55) bind harder. **Most restrictive applies: valuation confidence 55.**

---

## 5. Warranted-Multiple Check

**The base case implies 22.23x forward earnings — a multiple nVent has traded at inside its own observed window and one the current peer median (22.06x) sits on, so the base does not require a re-rating this business has never earned.** What it does require is that the growth premium `03` sizes at +2.44 P/E turns is competed away rather than sustained, which is what the evidence supports: through-cycle return on capital of **8.10% against the company's own disclosed 10.0% cost of capital** [`business-model/09_moat.md` §3], a business-quality aggregate of **41/100** with cyclicality **30/100** and rate-of-change **40/100** [`business-model/07_business-quality.md` §1], **58.1%** of H1 FY26 sales in one vertical and **85.0%** in one region, and a $2.5bn group backlog against Eaton's $15.3bn in one segment alone. **Upside from here does not require a heroic multiple — the bull's 30.0x is roughly the anchor-date level — it requires the data-centre volume to hold, which is a different and larger bet than a re-rating.**

**Value-trap flag — one trigger fires and one does not.** The **ownership** trigger does **not**: `management-governance/04_ownership-and-insider-behavior.md` tested all three unaligned-owner structures and **RF-OWN-004 is not triggered**, so no owner-driven value-trap caveat applies and no shareholder-friendliness cap flows through (carried from `02` §6). The **sector-cycle** trigger **does**: §2B's Reality Test found the warranted multiple itself sits inside a cycle-elevated sector — the peer median that "justifies" 22.23x is itself ~43% above its own 25-year average, and Eaton's EV/EBITDA is up 59% since 2021. **A base case that deserves its multiple only because the whole sector currently does is not a durable warranted multiple**, and if the sector de-rates, the peer median and the base point fall together. That is a real value-trap risk in the specific sense that matters here: the downside case does not need nVent to disappoint on its own terms, only for the sector's multiple to normalise.

---

## 6. Fair-Value Read

**Base-case fair value is USD 128.24 a share (22.23x NTM earnings of $5.77), with a bull level of USD 198.88 (30.0x × $6.63) and a headline bear — `bear_cyclical` — of USD 77.23 (18.0x × $4.29); a separate 24–36 month structural-reset floor of USD 69.92 is carried to §24 as the avoid-ruin level, not as the 12-month bear.** Against the fresher indicative price of $156.03 (close 2026-09-04) the **margin of safety is −21.7%** — the price is above base fair value, so there is no cushion — while the **downside to bear is +50.5%** (inverted: higher is worse); at the stale pool anchor of $171.16 (close 2026-08-12) those become **−33.5%** and **+54.9%**.

**The method that drives the answer is `03_relative-valuation-peers`, and that is a weaker foundation than the weight suggests — which is the honest headline.** The multiples-first rule hands `03` a 67% weight because nVent is an Operating company with a usable forward metric; but `02` withheld its own base point as illustrative-only, `03`'s peer multiples are not in the data pool at all, and `02` and `03` both flagged their reference point cycle-elevated in the same direction, so their agreement is one distorted read counted twice rather than two corroborating ones. Meanwhile the two genuinely independent reads — `04`'s DCF at the company's own disclosed 10.0% cost of capital ($76.30) and the 11.5x private-market price management itself just paid for Maverick ($77.41) — converge to within 1.5% of each other, **45% below the base point**. The full cross-method field runs **$76.30 to $152.16, a 99.4% spread**, which caps valuation confidence at 55 whatever the prose says.

**The single biggest swing factor between bull and bear is one thing, not three: whether data-centre order intake re-accelerates or keeps decelerating, first testable at the Q3 FY2026 print on 30-Oct-2026.** It moves volume, the incremental conversion rate and the multiple together in the same direction — `earnings/07` shows variables 1 and 2 are multiplicative and that 109% of the latest margin gain is fixed-overhead absorption on volume that is already showing a book-to-bill near 0.93x against backlog down $2.6bn → $2.5bn. **Everything above is pre-Maverick-Power**, a $1.75bn deal that closes outside all four levels and is directionally multiple-accretive on nVent's own 11.5x disclosure while roughly tripling net debt per share.

---

**Partial data (declared):** no peer multiples in the pool → `03`'s and `06`'s comparables are web-sourced and unverified (overall usefulness max 70); own multiple history is ~1.5 years → `02` produced no fair-value input and is zero-weighted, so the multiples-first majority rests on `03` alone; price anchor stale ~17–19 trading days with an 8.84% drift → every price-relative read shown at both prices with an inline staleness flag; full high-to-low method field 99.4% → **valuation confidence capped at 55**; `RF-VAL-001` fired in `02` **and** `03` in the same direction → compounding rule, combined base-case confidence capped at **55**. Most restrictive applies: **55**.

**Out-of-scope items not produced here (correctly owned elsewhere):** scenario probabilities, the probability-weighted target price, expected return, risk/reward, the Buy/Sell rating and position sizing all belong to the **master synthesizer** (MODULE_RULES → Scope and Boundary; CLAUDE.md §10, §18, §22). This report produces fair-value **levels** and the margin of safety, and stops there.
