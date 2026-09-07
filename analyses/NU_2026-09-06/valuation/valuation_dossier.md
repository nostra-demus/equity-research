# valuation Module Dossier — NU

> Deterministic, lossless concatenation of every artifact in this module — the module synthesis and every specialist output, in order. Generated mechanically (no LLM rewriting), so nothing is omitted or paraphrased. This is the module's "see everything" tier; the module's decision lives in `99_*-synthesis.md` and the short read in `valuation_memo.md`.

- Generated: 2026-09-07T10:45:36Z
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

# Valuation Module — NU (Synthesis)

## Abstract

Nu Holdings trades above every fair value this module can defend: the triangulated base of USD 13.73 sits below both price anchors, leaving no cushion at USD 14.30 and less at USD 15.37. The bull, base and bear levels are USD 19.59 / 13.73 / 7.98, with a separate structural-reset floor of USD 5.76, driven mainly by the peer route at two-thirds weight. Today's price requires a permanent 22.1% return on equity, roughly what the best Brazilian incumbent earns, which three and a half profitable years cannot prove. Downside to the cyclical bear is 48%. Verdict: modestly overvalued, with de-rating rather than value-trap risk.

## 1. Valuation Verdict

- **Verdict:** **Modestly overvalued** *(base fair value 10.7% below the fresher corroborated quote of USD 15.37; 4.0% below the stale pool anchor of USD 14.30, which on its own would read "fairly valued" — the levels are USD 19.59 / 13.73 / 7.98 and the category is set on the fresher read per the MODULE_RULES re-anchor rule and the CLAUDE.md §4 conservative default)*
- **Base-case fair value (point, per share):** **USD 13.73** — 14.15x NTM EPS of USD 0.97 and 5.49x tangible book of USD 2.50 [`07` §2]
- **Current price — both anchors published, as `01` requires:**
  - **USD 14.30**, 2026-08-28 close — **`pool-verified`**, corroborated across three Capital IQ exports, **stale by 5 exact trading sessions (6.4 on the ×5/7 conversion)** [`01` §1/§7]
  - **USD 15.37**, 2026-09-04 close — *indicative, web-sourced, not from the data pool, unverified*, corroborated by two independent sources agreeing exactly, **+7.48%** above the anchor [`01` §1]
- **Bull / Base / Bear fair-value levels (points):** **Bull USD 19.59 · Base USD 13.73 · Bear-cyclical USD 7.98 (12-month) · Bear-structural USD 5.76 (24–36 month, avoid-ruin floor)** [`07` §3, §3A]
- **Cross-method dispersion (football field, low–high):** **USD 10.36 – 14.73** across the valid, value-producing methods (`06` 10.36 → `04` 11.71 → `03` 14.73) — a **42.2%** field on the low. `02`'s illustrative reversion field of USD 17.84 – 22.01 is excluded from this measure because its own producer says it is not a fair-value input. Within `03` alone, two peer-anchored routes disagree by roughly **2×** (USD 14.73 against USD 7–9)
- **Valuation attractiveness /100** *(higher = cheaper)*: **32**
- **Margin of safety /100** *(higher = better)*: **22** — the cushion is **negative at both prices**: −11.9% at USD 15.37, −4.2% at USD 14.30
- **Valuation confidence /100:** **52** *(capped at 55 — see §4)*
- **Downside risk /100** *(**inverted — higher = worse**)*: **68** — downside-to-bear 48.1% at USD 15.37 / 44.2% at USD 14.30; 62.5% / 59.7% to the structural floor
- **Data quality /100:** **78** — zero extraction failures across 115 sources, full consensus strip, ten named peers, five 20-Fs; held down by no sector/peer multiple history and a 20-month own-multiple window [`00` §6]
- **Overall usefulness /100:** **72**
- **Dominant valuation method:** `03`'s peer route (67% weight) — the only method resting on an independent, forward, matched-basis evidence set (ten named LatAm financials on the identical 2026-08-29 Capital IQ basis), with `04`'s residual-income model at the capped cross-check third. For a Financial the Method Map bars an FCFF DCF, EV multiples and the EV bridge as a value, so this pair is the whole valid weighted set.
- **What's priced in:** a **permanent 22.08% return on equity** — 9.08pp above the 13.0% cost of equity, forever — or 7.68 more years of the FY2028 peak 35.53% return then nothing; at USD 14.30 the model reproduces the price only on the **top of the Street's earnings range** (USD 14.65) [`05` §2, §5].
- **Biggest valuation risk:** 40.4% of trailing profit is a self-reversing non-cash deferred-tax credit — restated on cash-backed net income of USD 2,148.5m the current P/E is **32.7x**, above `02`'s own 27.65x band mean, so the apparent de-rating may be the market correctly refusing to pay a growth multiple for a tax item.

## 1A. Module Disconfirmation

- **Strongest bear point.** The cleanest single test inverts the "it has de-rated" story: on the earnings module's cash-backed net income of USD 2,148.5m, NU trades at **32.7x** earnings, *above* the 27.65x mean of its own 20-month band, not 30% below it — because 40.4% of trailing net income to the parent (USD 1,458.6m of USD 3,607.1m) is a non-cash deferred-tax credit whose fuel exists only while the loan book grows fast, and sequential FX-neutral portfolio growth has more than halved (+11% → +7% → +5%) [`02` §3/§4, citing `earnings/06_earnings-quality.md`].
- **Strongest bull point (the steelman).** NU leads its entire comparable set on both variables that set a bank's multiple: forward return on tangible equity **38.8%** against a 23.1% peer median and above the highest peer (BTG Pactual 36.2%), and long-term EPS growth **33.98%** against 13.17% and above the highest peer (Inter & Co 32.30%), on a measured cost advantage graded 78/100 — ~85% lower cost to serve, 14,314 customers per employee against an incumbent average of 1,234 [`03` §2/§4, citing FY2025 20-F, Item 4.B]. Loan-loss coverage is **building** (15.37% → 16.86% of gross credit assets in six months), not being released [`02` §4]. If the growth differential survives five years rather than four, `03`'s own warranted multiple gives USD 17.44 and the bull level is USD 19.59.
- **Single killer risk (method validity / load-bearing assumption).** The base point is 67% one method whose anchor is flagged **cycle-elevated (RF-VAL-001)** and which contains an unresolved ~2× internal disagreement, and 33% a model where ~47% of the value comes from a **self-built ten-year fade** benchmarked against a **one-broker** strip (1/1 estimates). Neither leg is robust on its own; the base is the blend of two capped reads, not a corroborated convergence.
- **Disconfirming evidence already visible.** Yes, on both sides and it is named rather than averaged: `04`'s own 13.0% cost of equity sits **below** management's disclosed 16.51% Brazilian rate translated to USD (13.98–14.54%), so if that rate is wrong it is wrong on the low side and `04`'s USD 11.71 would fall further; against that, `04`'s earnings path already runs **above** the Street's long-range strip in six of seven comparable years, so its low answer is not a pessimistic-forecast artefact [`04` §3A, §4].

## 2. Specialist Roll-Up

| Specialist | Verdict Line | Biggest Finding |
|---|---|---|
| `00_valuation-data-triage` | **Sufficient** — 115 sources, 48 workbooks, 109 tabs, 174 extracts, **0 failures**; no partial-data row fires | NU is a **Financial (bank)** on the Method Map, so an FCFF DCF, EV multiples and the EV bridge as a value are all invalid; four methods can still run |
| `01_price-and-capital-structure` | Price-state **`pool-verified`** at USD 14.30 (2026-08-28), stale by 5 exact trading sessions, with a corroborated fresher indicative **USD 15.37** (2026-09-04, +7.48%) | Both share classes count for market cap (4,830.7m); using Class A alone would understate it by **21.2%**. Net cash USD 7,744.6m (strict) is a bank's working liquidity inside regulated subsidiaries — not spare corporate cash, and not netted into any fair value |
| `02_multiples-own-history` | Every valid multiple sits in the bottom fifth of its own band — **but the band is 20 months, not 3–5 years, and the reversion values are illustrative-only, NOT a fair-value input for `07`** | Restated on cash-backed net income of USD 2,148.5m the current P/E is **32.7x — ABOVE the band's own 27.65x mean**, inverting the apparent discount. §24 Filter 6 recorded as confirmed negative |
| `03_relative-valuation-peers` | Base **USD 14.73** (warranted NTM P/E 15.18x × NTM EPS 0.97); dispersion USD 12.10 – 17.44; **peer-median anchor flagged cycle-elevated, `RF-VAL-001`, confidence capped 60** | The market is paying for roughly **3.8 years** (USD 14.30) or **4.3 years** (USD 15.37) of NU's growth differential. Hands forward an **unresolved ~2× disagreement**: the peer-implied 16.5% cost-of-equity route gives **USD 7–9**, about half the base |
| `04_intrinsic-dcf` (residual income) | Base **USD 11.71** as of 2026-08-28 — **18.1% below** the anchor price, 23.8% below the fresher quote; grid USD 6.31 – 17.76 | Not terminal-dominated (terminal = 15.3% of value) and **not** a pessimistic forecast — its EPS path runs above the Street's long-range strip in six of seven years. Structural runoff terminal gives **USD 5.76** |
| `05_reverse-dcf` | Price implies a **permanent 22.08% ROE** (23.64% at USD 15.37), or 7.68 more years of the peak 35.53% return then nothing. **Aggressive** | At USD 14.30 the model reproduces the price only on the **top of the Street's FY2026–28 range** (USD 14.65) — the mean forecast is not what is being paid for. Implied cost of equity 11.58%, below management's own 13.98–14.54% USD-translated rate |
| `06_sum-of-the-parts` | **SOTP does not exist** — one reportable segment (Banking = 100% of revenue and pre-tax profit, tying to consolidated to the third decimal). Collapsed value USD 10.36, field USD 6.31 – 11.61 | **Zero-weighted by its own producer**: arithmetically the same construction as `03` (same NTM EPS 0.97, same 2026-08-29 comp set) — one read counted twice. Nothing is masked; the payments comp trades at the set's *lowest* multiple |
| `07_scenario-and-fair-value` | Base **USD 13.73** = 0.67 × 14.73 + 0.33 × 11.71; Bull **19.59**, Bear-cyclical **7.98**, Bear-structural **5.76**. Margin of safety **negative at both prices** | Both evidenced downside routes land near USD 8 independently (`03`'s cost-of-equity relation at USD 7–9; Street-low metric × 10.50x at USD 7.98) — carried as the bear, not smoothed into the base |

## 3. Reconciliation

**The high-to-low field of valid, value-producing methods is USD 10.36 → USD 14.73 = 42.2% of the low, and that exceeds the 40% gate.** `07` measured 25.8% on the weighted pair (`04` → `03`) and disclosed the 42.2% figure beside it. I adjudicate to the wider number: MODULE_RULES Reconciliation Gate 6 and this agent's own self-check require the **full** field of valid value-producing methods, "never a hand-picked weighted pair." `06`'s USD 10.36 is a valid method for a Financial (a forward P/E on NTM EPS) that produced a value; it carries **zero weight for non-independence, not for invalidity**, so it belongs in the dispersion measure. **Gate 6 therefore fires and valuation confidence is capped at 55.** `02` is excluded from the field on its producer's explicit instruction that its reversion values are illustrative-only.

**Disagreement 1 — `03` USD 14.73 against `04` USD 11.71 (a 25.8% gap).** Reconciled, not averaged: `04`'s 13.0% cost of equity sits **below** the company's own disclosed Brazilian cost of equity of 16.51% translated to USD (13.98–14.54%) and **above** the 11.58% the market implies, so if the rate is wrong at all it is wrong on the low side — which would make `04`'s value *lower*, not higher [`04` §3A]. `07` therefore let `04` pull the base down by its full capped third rather than discounting it as a high-discount-rate artefact. I agree with that treatment.

**Disagreement 2 — the ~2× split *inside* `03` (USD 14.73 against USD 7–9), the largest single uncertainty in the module.** The growth-differential route implicitly holds return on tangible equity near 38.8% for four years; consensus itself does not model that, implying return on book essentially flat at 26.9% / 26.9% / 27.9% for FY2026–28. The excess-return route, run at the ~16.5% cost of equity the peer group prices at — independently corroborated by NU's own disclosed 16.51% — gives USD 7–9. `03` refused to average them and so do I: the base stays at the peer-multiple route, and the USD 7–9 marker is carried as an evidenced downside anchor that lands on top of `07`'s independently derived cyclical bear of USD 7.98. **Two independent routes agreeing near USD 8 is the most robust convergence anywhere in this module — and it is on the downside.**

**Disagreement 3 — `02` says the stock is at the bottom of its own range; `05` says the price embeds best-incumbent economics forever.** Reconciled by `02` itself: on cash-backed earnings the current P/E is 32.7x, above its own band mean. The two are not in conflict once the earnings denominator is put on a cash basis.

**Sector Cycle Reality Test roll-up (MODULE_RULES Scenario Construction §3).**
- **`03` FLAGGED its peer-median anchor cycle-elevated and emitted `RF-VAL-001`** — the Brazilian bank proxy re-rated roughly **+47% to +60% over three years** (Itaú price/book ~1.08–1.40 in 2023 → ~1.98 early 2026; Bradesco ~0.77 → ~1.13; web-sourced macrotrends/gurufocus/ycharts, read 2026-09-06, unverified). Its confidence contribution is capped at 60.
- **`02` ran the same check and did NOT flag** — it found the sector sat *above* its own three-year average while NU fell to the bottom fifth of its own range, i.e. the **opposite** direction, with magnitudes (+14.5%, +18.0%) below the ~25% materiality line. No tag emitted. `02` marked the check "directionally sound but not window-matched," not "Not assessable."
- **The two flags are NOT same-direction, so the mechanical combined-55 cap does not fire — and the honest reading is worse than the mechanical one, not better.** What the two tests together show is **one company de-rating inside a sector that re-rated**. `02`'s entire 20-month window sits *inside* that sector up-move, so a "below its own history" read from `02` is anchored on a window that never contained a settled level. `02` can never corroborate `03` here; the base point rests on **one** cycle-flagged multiples read plus one independent intrinsic model, not on two agreeing multiples reads (CLAUDE.md §16 independence check). The wider dispersion cap (55) binds anyway and is the tighter of the two.
- **Named gap, recorded so it is visible rather than silently skipped (`00` §6):** the pool contains **no sector-level or peer-level multiple history** — the own-multiple export spans six quarters and the peer export is a single-date snapshot. Both agents had to reach outside the pool for the check; both labelled the substitute as web-sourced and unverified.

## 4. Score Cap Application

| Cap Trigger | Applied? (Y/N) | Affected Score | Final Cap |
|---|---|---|---|
| No pool-verified price (price-state `indicative` or `none`) | **N** | MoS, downside-to-bear, observed up/down, attractiveness + confidence | Does not fire — `01` tags the price-state **`pool-verified`** (USD 14.30, 2026-08-28, dated and corroborated). All price-relative reads unlock |
| **Stale pool-verified price** (>5 trading days; 5 exact sessions / 6.4 on the ×5/7 conversion — the two counts straddle the line, conservative read taken) | **Y** | Valuation confidence | **max 70**; mandatory inline staleness flag carried on both price-relative reads, which are published at **both** prices with the fresher leading |
| No consensus / forward estimates | **N** | Valuation confidence | Full strip present — FY2026E–FY2033E, NTM EPS 0.97, forward book value per share, 16/16 estimates on FY2026E and FY2027E |
| No peer data | **N** | Overall usefulness | Ten named LatAm financial peers with LTM P/E, NTM P/E and P/TangBV, as-of 2026-08-29 |
| Only one valuation method usable | **N** | Valuation confidence | Four ran; two are weighted, two are producer-zero-weighted |
| No cash flow AND DCF is only method | **N** | Valuation confidence | Cash flow present; and for a Financial the intrinsic lens is residual income, not an FCFF DCF |
| SOTP not possible for multi-segment | **N** | Overall usefulness | Not a multi-segment business — one reportable segment, so the cap does not bind (`00` §5) |
| **Full high-to-low field of valid value-producing methods exceeds 40%** | **Y** | Valuation confidence | **max 55.** Field = `06` USD 10.36 → `03` USD 14.73 = **42.2%**. Measured on the full valid value-producing set, not the weighted pair; the explanation in §3 does not waive the cap |
| Terminal value >75% of DCF EV | **N** | Valuation confidence | Terminal is **15.3%** of `04`'s value; book 23.7%, explicit residual income 61.0% |
| Misaligned controlling owner (RF-OWN-004, §24 Filter 6) | **N** | Valuation attractiveness | **Adjudicated, not merely restated.** `04_ownership-and-insider-behavior` finding 04-021 tested all three named structures at confidence 5 — state-owned shares 0.03%, one reported segment = 100% of revenue, NU is the **top** holding company, not a listed subsidiary of a value-maximising parent — and `99_management-governance-synthesis` §C accepts it in full: **RF-OWN-004 NOT emitted, no value-trap note flows to valuation.** I accept that. The controller's USD ~13.0bn stake moves one-for-one with the Class A price. The 20:1 dual class, the 74.4%-votes-on-18.6%-economics wedge and the founder veto are real, but they are an **entrenchment** problem priced by that module under governance risk and shareholder friendliness (50/100) — pricing them again as a valuation discount would charge the same fact twice. **No attractiveness cap, no ownership discount taken** |
| Sector Cycle Reality Test flags `02` and/or `03` cycle-elevated/depressed, unreconciled | **Y (partial)** | Valuation confidence | `03` fired `RF-VAL-001` → **max 60 on that method's contribution**. `02` fired nothing and the two are **not** same-direction, so the combined-55 compounding cap does not fire mechanically (§3 states why the honest reading is nonetheless worse) |

**Most restrictive applied: valuation confidence max 55** (dispersion gate) — tighter than the 70 staleness cap and the 60 single-method cycle cap. **Stated confidence: 52**, earned below the cap rather than pinned to it.

## 5. Fair-Value Summary

**(a) The levels and what drives them.** Bull **USD 19.59**, base **USD 13.73**, cyclical bear **USD 7.98** on a 12-month horizon, with a separate structural-reset floor of **USD 5.76** on a 24–36 month horizon that is a different point in time and must not be blended with the others. The base is `03`'s peer route at 67% (warranted NTM P/E of 15.18x on NTM EPS of USD 0.97, the premium sized to the growth differential alone with a printed double-count ledger) pulled down by `04`'s residual-income model at its capped 33%. For a bank this pair is the whole valid weighted set — an FCFF DCF, EV multiples and the EV bridge as a value are barred by the Method Map, and `01` shows why: NU's "enterprise value" omits USD 60.9bn of deposits and payables to network, about 74% of the bank's liabilities.

**(b) What the price implies, and whether it is achievable.** At USD 14.30 the price requires a **permanent 22.08% return on equity** — 6.13pp above the six-bank Brazil/LatAm median of 15.95% and only 2.2pp below Itaú, the best-run large incumbent — or 7.68 more years of the FY2028 peak 35.53% return followed by nothing. At USD 15.37 it requires 23.64%, essentially Itaú's 24.3% today. The business-model evidence says this is a stretch rather than a plan: the profitable record is three and a half years old, contains **no Brazilian consumer downturn** at anything like the current book size, sits on a book that is **92% unsecured** with 90+ day non-performing loans at **6.9% and rising 35bp in the quarter**, and runs in an industry the quality module scores **38/100 on rate of change**, tripping CLAUDE.md §24 Filter 5. The sharpest single framing is `05`'s: at USD 14.30 the model reproduces the price only on the **top of the Street's FY2026–FY2028 earnings range** (USD 14.65) with no improvement to the terminal — the mean forecast is not what is being paid for.

**(c) Margin of safety and downside-to-bear, as two separate reads.** **Margin of safety** — the discount of price to the *base* fair value — is **−11.9% at USD 15.37** and **−4.2% at USD 14.30**: negative at both, meaning there is no cushion because the shares trade above the triangulated base. **Downside-to-bear** — the loss if the bear plays out, an **inverted** metric where higher is worse — is **48.1%** at USD 15.37 and **44.2%** at USD 14.30 to the cyclical bear of USD 7.98, and **62.5% / 59.7%** to the structural floor of USD 5.76. These are different numbers and neither substitutes for the other. The 7.48% price drift alone moves the margin of safety from −4.2% to −11.9%, which is why both are published.

**(d) Value-trap risk — the honest answer is that this is the opposite problem.** A value trap is a low multiple the business does not deserve to re-rate from. NU is not on a low multiple by any comparison available: it trades at a **90.9% premium** to the peer median on forward earnings and **216.7%** on tangible book, and `06` confirms there is no second business inside the company for that premium to hide in. Three tests, adjudicated: (i) **unaligned owner — negative**, per §4 above; no ownership discount is warranted and none is taken. (ii) **The apparent cheapness against its own history is not real**: `02`'s 20-month band is not a cycle, its reversion values are illustrative-only, and restating on cash-backed net income of USD 2,148.5m puts the current P/E at **32.7x, above that band's own mean** — 40.4% of trailing profit is a self-reversing non-cash deferred-tax credit, and a market refusing to pay a growth multiple for a tax item is not mispricing the stock. (iii) **The warranted multiple is partly borrowed from a cycle**: `03`'s peer median is flagged cycle-elevated (`RF-VAL-001`) after a 47–60% three-year sector re-rate, so a base case that deserves its multiple partly because the whole sector currently does is not a durable warranted multiple. **The risk here is de-rating on an earnings base that is 40% tax credit, not stagnation at a cheap multiple.**

## 6. What Would Change The Valuation Verdict?

| Current Verdict | What Would Make It Cheaper | What Would Make It More Expensive | Data Needed |
|---|---|---|---|
| **Modestly overvalued** (base USD 13.73 vs USD 15.37 / USD 14.30) | Delivery at or near the **top of the Street's FY2027–28 range** (EPS 1.30 / 1.77 against a 1.11 / 1.46 mean) — that alone takes `04`'s model to USD 14.65 and drops the implied terminal return to 17.52%, below what `04` already assumes. Evidence the growth differential survives **five** years rather than four (Mexico as a full bank since 2026-08-06, Colombia scaling) lifts `03`'s warranted multiple to 17.97x and the level to USD 17.44. A **falling effective tax rate** toward management's 15–20% guide against the 27.4% consensus embeds (worth roughly 10–12% of FY2026 earnings). Evidence the deferred-tax credit is durable rather than self-reversing | The **cash-backed** earnings read holding — trailing profit stays ~40% deferred-tax credit while FX-neutral portfolio growth keeps halving (+11% → +7% → +5%), so the 32.7x cash P/E is the real one. A Brazilian consumer downturn on a 92%-unsecured book with 90+ day NPLs already 6.9% and rising. The **enacted CSLL step-ups** (payment institutions 9%→12%→15% from 2028; credit companies 17.5%→20%). The Brazilian bank sector giving back its 47–60% three-year re-rate, which pulls `03`'s anchor down directly. A cost of equity nearer management's own 16.51% (13.98–14.54% in USD), which takes `04` to USD 9.70–10.70 | **(1) A refreshed pool-verified price** — the anchor is 5–6 trading days stale and the drift alone moved the margin of safety by 7.7pp. **(2) FY2027–FY2028 EPS conviction** — the Street's FY2027 range is USD 0.77 to 1.30, a 69% spread across 16 estimates, and the whole disagreement sits there. **(3) Peer multiple HISTORY** (a 3–5 year peer-median series) to resolve `RF-VAL-001`. **(4) A longer own-multiple pull** — the export stops at 2025-03-31 though NU has traded since Dec-2021. **(5) Peer 2Q26 filings** so peer returns can be cited at tier 1–2 rather than a tier-5 vendor snapshot |

## 7. Note To The Final Synthesizer

- **The levels, and the method behind them.** Bull **USD 19.59** / Base **USD 13.73** / Bear-cyclical **USD 7.98** (all 12-month, to 2027-09-06) plus a separate **`bear_structural` USD 5.76** on a **24–36 month** horizon. These are four labelled cases, not three — the two down-legs are different cases with different horizons and must not be merged under one "bear" label. The base is 67% `03`'s peer route (warranted NTM P/E 15.18x × NTM EPS 0.97) and 33% `04`'s residual-income model; `02` and `06` are zero-weighted on their own producers' explicit instructions.
- **What the price implies and whether it is achievable.** A **permanent 22.1% return on equity** (23.6% at USD 15.37), or 7.7 more years of the peak 35.5% return then nothing. That is 6.1pp above the six-bank peer median and 2.2pp below the best-run large incumbent, from a lender whose book is 92% unsecured and which has never met a downturn. The price already equals what the model produces on the **top** of the Street's earnings range. Read as **aggressive, not impossible**.
- **Margin of safety and downside-to-bear are two different numbers.** Margin of safety **−11.9%** (USD 15.37) / **−4.2%** (USD 14.30) — no cushion at either price. Downside-to-bear **48.1% / 44.2%** to USD 7.98 (inverted: higher is worse), and **62.5% / 59.7%** to the USD 5.76 structural floor. The downside anchor to carry is **USD 7.98**, reached independently by two routes.
- **Genuine value or value trap?** Neither — **it is not cheap, so it cannot be a value trap.** NU trades at a 90.9% forward-earnings premium and a 216.7% tangible-book premium to its peer median. The premium is warranted **in kind** (38.8% forward return on tangible equity against 23.1%; 34% growth against 13%; a measured 78/100 cost advantage) but **not proven in size** — the market is paying for ~3.8–4.3 years of the growth differential and three and a half years of profitable history cannot settle it. **No structurally misaligned controlling owner: RF-OWN-004 was tested by the management-governance module across all three named structures and returned negative (0.03% state-owned, one segment = 100% of revenue, top holding company), with an explicit instruction that no value-trap note flows here. I accept it and take no ownership discount** — the founder's ~USD 13.0bn stake moves one-for-one with the Class A price. The 20:1 dual class and the 74.4%-votes-on-18.6%-economics wedge are an entrenchment risk already priced by that module; do not charge them twice.
- **Which method to trust, and which to discount, for THIS company.** Trust `03` (peers) as the primary lens — but at capped confidence, because its anchor is cycle-elevated and it contains an unresolved ~2× split. Trust `05` (reverse-DCF) most for the *direction* of the read: it is the sharpest, most testable line in the module. Treat `04` as a real warning, not a high-rate artefact — its rate is already below management's own. **Discount `02` entirely** as a fair-value input (20-month window, producer-labelled illustrative-only, and its own cash-backed restatement inverts its read to 32.7x, ABOVE its band mean). **Discount `06` entirely** as a method — it is `03`'s arithmetic run twice.
- **Caps applied and what they limit.** A **pool-verified price exists**, so margin of safety, downside-to-bear, observed up/down and attractiveness all unlock — none is "Not assessable." Two caps bind: **price staleness** (5–6 trading days, confidence max 70) and, tighter, the **>40% cross-method dispersion gate** (42.2% field → **confidence max 55**; stated 52). `03`'s `RF-VAL-001` caps that method's own contribution at 60. Net effect: the fair-value **levels** are usable, the **confidence** in them is mid-band, and the price-relative reads carry a mandatory staleness flag and are published at both prices.
- **Biggest missing data point (one item).** **A 3–5 year peer-median multiple series for the LatAm bank set** (or the same for NU itself back to Dec-2021). It is the single input that would resolve `RF-VAL-001`, tell us whether the 91% premium is normal or extreme for this company, and give `02`'s band a real cycle — three of this module's four biggest limitations trace to its absence. A refreshed pool-verified price is the cheaper second request.
- **Explicit handoff.** The master synthesizer's "Valuation and Peer Mispricing" section should **defer to this synthesis**. The four fair-value **levels** above — `bull` 19.59, `base` 13.73, `bear_cyclical` 7.98, `bear_structural` 5.76, with their labels and horizons — are the inputs for the master's probability-weighted scenario model. **This module assigns no probabilities, computes no probability-weighted return or risk/reward, issues no rating and sizes no position — the master owns all of that.** Note for the master's §8 weighting: the case set mixes a 12-month horizon with a 24–36 month one, so any probability-weighted figure across all four is not a same-date comparison and must say so. Also note that balance-sheet-survival `01` and the catalyst module did **not** run in this chain — nothing here should be read as covering leverage adequacy or dated catalysts.

## 8. Simple Summary

- **Not cheap — the price is above fair value on both anchors.** Base fair value USD 13.73 against USD 15.37 (fresher, unverified) and USD 14.30 (pool-verified, 5–6 trading days stale). That is 10.7% and 4.0% of overpayment respectively.
- **The levels: bull USD 19.59, base USD 13.73, cyclical bear USD 7.98, plus a structural-reset floor of USD 5.76 on a longer 24–36 month clock.**
- **What the market is pricing in:** that Nu earns 22% on shareholders' money forever — roughly what the best big Brazilian bank earns today — or holds its record 35% return for another 7.7 years and then nothing. The price already assumes the best earnings forecast on the Street.
- **Where the downside is:** a 44–48% fall to the cyclical bear of USD 7.98, and 60–63% to USD 5.76 if a Brazilian consumer downturn hits a book that is 92% unsecured with 6.9% of loans already 90+ days late. Two independent methods land near USD 8.
- **Which method matters most:** the peer comparison (67% of the base), cross-checked by the reverse-DCF, which is the clearest single test. Ignore the own-history multiples entirely — the window is 20 months and its own producer says the numbers are illustrative.
- **Not a value trap — the opposite risk.** It is not cheap to begin with (91% above peers on forward earnings), the controlling owner is properly aligned, and the danger is the multiple falling because 40% of last year's profit was a one-off tax credit, not a cheap stock staying cheap.
- **A current price WAS available** and it is pool-verified — but it is 5–6 trading days old and the stock moved +7.5% since. A refreshed price is the cheap fix; the real gap is peer multiple history.
- **Useful for the master synthesizer:** yes. Four levels, a clear priced-in read, a downside anchor confirmed twice, and every cap stated. Confidence in those levels is mid-band (52/100), not high.



---

## valuation / 00_valuation-data-triage.md

_Source: `00_valuation-data-triage.md`_

# Valuation Data Triage — NU

**Evidence binding.** Frozen-evidence quartet complete and verified: `NOSTRA_FROZEN_EVIDENCE_ROOT`, `NOSTRA_FROZEN_POOL_DATA_PATH`, `NOSTRA_FROZEN_POOL_OUT_DIR`, `NOSTRA_FROZEN_POOL_GENERATION` all present and mutually consistent. `GENERATION_ROOT` = `<NOSTRA_FROZEN_POOL_OUT_DIR>/.extract-generations/f9081efa6e33b60af52e2eeb6b01c69e96872dbe70c60d9111ef0a504509f2be`. All manifest, corpus, CIQ-facts, relationships and per-tab extract reads resolved inside that exact generation. The extractor was NOT re-run and live `data/NU/` was NOT read; `data/NU/` below is a citation label only.

**Manifest totals (verbatim).** 115 sources · 48 workbooks · 109 tabs · 174 extracts written · **0 failures**. Status counts: `ok` 113, `in-place` 2. No source carries `fail`, `fallback-text`, `missing-dependency`, or `gdrive-pointer`. There is therefore **no extraction-failure gap to charge against sufficiency (fix F03)**.

**External data.** No `external/` subfolder exists in the pool and no manifest row carries `external: true`. Section 1A-External is therefore omitted as empty, and no external document influenced the verdict.

## 1. File Inventory

Every source is listed, and **every workbook tab is its own row** (parent file → tab name, rows×cols), reconciled against `GENERATION_ROOT/manifest.json`. No workbook appears as a single opaque row. **176 inventory rows** (67 non-workbook sources + 109 tabs).

Period Covered is parsed from INSIDE each document (period-end / "as of" / fiscal-year lines). Filesystem mtime is deliberately NOT used as a date — for this Drive-synced pool every file carries the same sync timestamp (2026-09-07 15:24), which would make an old re-synced export read as current (fix F23). The fourth column therefore reports the manifest extraction status instead.

| Filename (→ tab) | Type | Period Covered (from inside the document) | Last Modified → Extraction Status (F23: sync mtime not used) | Valuation Relevance |
|---|---|---|---|---|
| 99The_Expectant_Father__th_Edition_.torrent | Other (unrelated non-financial file) | n/a — unrelated non-financial file | in-place | Low |
| Charting Excel Export Aug-29-2026 2_02 PM.xls → tab: Chart 1 with Data (284×2) | Other (unlabeled daily series to 2026-08-28) | Daily series to 2026-08-28; exported Aug-29-2026 | ok (tab extracted) | Low |
| Charting Excel Export Aug-29-2026 2_02 PM.xls → tab: Attributions (45×1) | Other (unlabeled daily series to 2026-08-28) | Daily series to 2026-08-28; exported Aug-29-2026 | ok (tab extracted) | Low |
| Company Comparable Analysis Nu Holdings Ltd .xls → tab: Financial Data (50×17) | Peer / comps export + current-price source | Comps as-of 2026-08-29 (LTM Jun-30-2026 / NTM) | ok (tab extracted) | High |
| Company Comparable Analysis Nu Holdings Ltd .xls → tab: Trading Multiples (50×9) | Peer / comps export | Comps as-of 2026-08-29 (LTM Jun-30-2026 / NTM) | ok (tab extracted) | High |
| Company Comparable Analysis Nu Holdings Ltd .xls → tab: Operating Statistics (50×13) | Peer / comps export | Comps as-of 2026-08-29 (LTM Jun-30-2026 / NTM) | ok (tab extracted) | Medium |
| Company Comparable Analysis Nu Holdings Ltd .xls → tab: Business Description (44×3) | Peer / comps export | Comps as-of 2026-08-29 (LTM Jun-30-2026 / NTM) | ok (tab extracted) | Low |
| Company Comparable Analysis Nu Holdings Ltd .xls → tab: Implied Valuation (69×9) | Peer / comps export | Comps as-of 2026-08-29 (LTM Jun-30-2026 / NTM) | ok (tab extracted) | High |
| Company Comparable Analysis Nu Holdings Ltd .xls → tab: Valuation Chart (32×2) | Peer / comps export | Comps as-of 2026-08-29 (LTM Jun-30-2026 / NTM) | ok (tab extracted) | Low |
| Interactive_Brokers_Consolidated_Tax_Report_FY2025-26.xlsx → tab: IBKR - Tax Summary (24×8) | Other (personal broker/tax statement — not company data) | Indian FY2025-26 personal tax/broker statement (to 2026-03-31) | ok (tab extracted) | Low |
| Interactive_Brokers_Consolidated_Tax_Report_FY2025-26.xlsx → tab: IBKR - Consolidated Events (37×17) | Other (personal broker/tax statement — not company data) | Indian FY2025-26 personal tax/broker statement (to 2026-03-31) | ok (tab extracted) | Low |
| Interactive_Brokers_Consolidated_Tax_Report_FY2025-26.xlsx → tab: IBKR - Capital Gains Detail (6×25) | Other (personal broker/tax statement — not company data) | Indian FY2025-26 personal tax/broker statement (to 2026-03-31) | ok (tab extracted) | Low |
| Interactive_Brokers_Consolidated_Tax_Report_FY2025-26.xlsx → tab: IBKR - Income and Taxes (35×15) | Other (personal broker/tax statement — not company data) | Indian FY2025-26 personal tax/broker statement (to 2026-03-31) | ok (tab extracted) | Low |
| Interactive_Brokers_Consolidated_Tax_Report_FY2025-26.xlsx → tab: IBKR - Closing Holdings (4×17) | Other (personal broker/tax statement — not company data) | Indian FY2025-26 personal tax/broker statement (to 2026-03-31) | ok (tab extracted) | Low |
| Interactive_Brokers_Consolidated_Tax_Report_FY2025-26.xlsx → tab: IBKR - Performance Summary (4×15) | Other (personal broker/tax statement — not company data) | Indian FY2025-26 personal tax/broker statement (to 2026-03-31) | ok (tab extracted) | Low |
| Interactive_Brokers_Consolidated_Tax_Report_FY2025-26.xlsx → tab: IBKR - Cash Report (4×5) | Other (personal broker/tax statement — not company data) | Indian FY2025-26 personal tax/broker statement (to 2026-03-31) | ok (tab extracted) | Low |
| Interactive_Brokers_Consolidated_Tax_Report_FY2025-26.xlsx → tab: IBKR - SBI FX Rates (5×10) | Other (personal broker/tax statement — not company data) | Indian FY2025-26 personal tax/broker statement (to 2026-03-31) | ok (tab extracted) | Low |
| Interactive_Brokers_Consolidated_Tax_Report_FY2025-26.xlsx → tab: Audit & Reconciliation (24×8) | Other (personal broker/tax statement — not company data) | Indian FY2025-26 personal tax/broker statement (to 2026-03-31) | ok (tab extracted) | Low |
| Interactive_Brokers_Consolidated_Tax_Report_FY2025-26.xlsx → tab: Source Statement Tables (1037×27) | Other (personal broker/tax statement — not company data) | Indian FY2025-26 personal tax/broker statement (to 2026-03-31) | ok (tab extracted) | Low |
| Interactive_Brokers_Consolidated_Tax_Report_FY2025-26.xlsx → tab: IBKR - Unmapped Numeric Rows (1136×8) | Other (personal broker/tax statement — not company data) | Indian FY2025-26 personal tax/broker statement (to 2026-03-31) | ok (tab extracted) | Low |
| Interactive_Brokers_Consolidated_Tax_Report_FY2025-26.xlsx → tab: IBKR - Source Totals (60×7) | Other (personal broker/tax statement — not company data) | Indian FY2025-26 personal tax/broker statement (to 2026-03-31) | ok (tab extracted) | Low |
| Interactive_Brokers_Consolidated_Tax_Report_FY2025-26.xlsx → tab: Source Statement Text (2122×4) | Other (personal broker/tax statement — not company data) | Indian FY2025-26 personal tax/broker statement (to 2026-03-31) | ok (tab extracted) | Low |
| Interactive_Brokers_Consolidated_Tax_Report_FY2025-26.xlsx → tab: README - IBKR Report (12×2) | Other (personal broker/tax statement — not company data) | Indian FY2025-26 personal tax/broker statement (to 2026-03-31) | ok (tab extracted) | Low |
| Interactive_Brokers_Consolidated_Tax_Report_FY2025-26.xlsx → tab: LTCG (146×18) | Other (personal broker/tax statement — not company data) | Indian FY2025-26 personal tax/broker statement (to 2026-03-31) | ok (tab extracted) | Low |
| Interactive_Brokers_Consolidated_Tax_Report_FY2025-26.xlsx → tab: STCG (163×20) | Other (personal broker/tax statement — not company data) | Indian FY2025-26 personal tax/broker statement (to 2026-03-31) | ok (tab extracted) | Low |
| Interactive_Brokers_Consolidated_Tax_Report_FY2025-26.xlsx → tab: F&O (51×10) | Other (personal broker/tax statement — not company data) | Indian FY2025-26 personal tax/broker statement (to 2026-03-31) | ok (tab extracted) | Low |
| Interactive_Brokers_Consolidated_Tax_Report_FY2025-26.xlsx → tab: Intraday (46×12) | Other (personal broker/tax statement — not company data) | Indian FY2025-26 personal tax/broker statement (to 2026-03-31) | ok (tab extracted) | Low |
| Interactive_Brokers_Consolidated_Tax_Report_FY2025-26.xlsx → tab: Dividend (68×10) | Other (personal broker/tax statement — not company data) | Indian FY2025-26 personal tax/broker statement (to 2026-03-31) | ok (tab extracted) | Low |
| Interactive_Brokers_Consolidated_Tax_Report_FY2025-26.xlsx → tab: Interest (19×5) | Other (personal broker/tax statement — not company data) | Indian FY2025-26 personal tax/broker statement (to 2026-03-31) | ok (tab extracted) | Low |
| Interactive_Brokers_Consolidated_Tax_Report_FY2025-26.xlsx → tab: Bonds & SGB (25×12) | Other (personal broker/tax statement — not company data) | Indian FY2025-26 personal tax/broker statement (to 2026-03-31) | ok (tab extracted) | Low |
| Interactive_Brokers_Consolidated_Tax_Report_FY2025-26.xlsx → tab: Schedule FA (41×13) | Other (personal broker/tax statement — not company data) | Indian FY2025-26 personal tax/broker statement (to 2026-03-31) | ok (tab extracted) | Low |
| Interactive_Brokers_Consolidated_Tax_Report_FY2025-26.xlsx → tab: Schedule FSI (33×10) | Other (personal broker/tax statement — not company data) | Indian FY2025-26 personal tax/broker statement (to 2026-03-31) | ok (tab extracted) | Low |
| Interactive_Brokers_Consolidated_Tax_Report_FY2025-26.xlsx → tab: Form 67 (27×13) | Other (personal broker/tax statement — not company data) | Indian FY2025-26 personal tax/broker statement (to 2026-03-31) | ok (tab extracted) | Low |
| Interactive_Brokers_Consolidated_Tax_Report_FY2025-26.xlsx → tab: Schedule TR (28×8) | Other (personal broker/tax statement — not company data) | Indian FY2025-26 personal tax/broker statement (to 2026-03-31) | ok (tab extracted) | Low |
| Interactive_Brokers_FY2025-26_CA_Audit_Note.txt | Other (personal broker/tax statement — not company data) | Indian FY2025-26 personal tax/broker statement (to 2026-03-31) | in-place | Low |
| NU_Holdings_Deep_Dive_15_Page_Memo_30_Aug_2026.pdf | User note (prior in-house memo) | Authored 30-Aug-2026; reference price $14.30 (28-Aug close) | ok, 24,731 chars | Medium |
| Nu Holdings Ltd NYSE NU Analyst Coverage (1).xls → tab: Analyst Coverage (41×6) | Consensus / estimate export (coverage roster) | Coverage roster as-of ~Aug-2026 | ok (tab extracted) | Medium |
| Nu Holdings Ltd NYSE NU Analyst Coverage.xls → tab: Analyst Coverage (41×6) | Consensus / estimate export (coverage roster) | Coverage roster as-of ~Aug-2026 | ok (tab extracted) | Medium |
| Nu Holdings Ltd NYSE NU Auditors.xls → tab: Auditors (18×5) | Governance data | as-of ~Aug-2026 (CIQ export) | ok (tab extracted) | Low |
| Nu Holdings Ltd NYSE NU Board Members.xls → tab: Board Members (28×25) | Governance data | as-of ~Aug-2026 (CIQ export) | ok (tab extracted) | Low |
| Nu Holdings Ltd NYSE NU Committees.xls → tab: Committees (35×2) | Governance data | as-of ~Aug-2026 (CIQ export) | ok (tab extracted) | Low |
| Nu Holdings Ltd NYSE NU Comparable M A Transactions (1).xls → tab: Comparable M A Transactions (17×9) | Peer / comps export (M&A comparables) | as-of ~Aug-2026 (CIQ export) | ok (tab extracted) | Medium |
| Nu Holdings Ltd NYSE NU Comparable M A Transactions.xls → tab: Comparable M A Transactions (17×9) | Peer / comps export (M&A comparables) | as-of ~Aug-2026 (CIQ export) | ok (tab extracted) | Medium |
| Nu Holdings Ltd NYSE NU Competitors.xls → tab: Competitors (89×8) | Peer / comps export (named competitors) | as-of ~Aug-2026 (CIQ export) | ok (tab extracted) | Medium |
| Nu Holdings Ltd NYSE NU Corporate Timeline.xls → tab: Corporate Timeline (51×4) | Company events | Company events through ~Aug-2026 | ok (tab extracted) | Low |
| Nu Holdings Ltd NYSE NU Customers.xls → tab: Customers (16×8) | Value-chain export | as-of ~Aug-2026 (CIQ export) | ok (tab extracted) | Low |
| Nu Holdings Ltd NYSE NU Equity Listings.rtf | Listing / tradable-line data | as-of ~Aug-2026 (CIQ export) | ok, 1,678 chars | Medium |
| Nu Holdings Ltd NYSE NU Equity Listings.xls → tab: Equity Listings (25×11) | Listing / tradable-line data | as-of ~Aug-2026 (CIQ export) | ok (tab extracted) | Medium |
| Nu Holdings Ltd NYSE NU Events Calendar.xls → tab: Events Calendar (27×3) | Catalyst / reporting calendar | Events incl. FQ3 2026 release Nov-12-2026 | ok (tab extracted) | Medium |
| Nu Holdings Ltd NYSE NU Financials Balance Sheet.xls → tab: Balance Sheet (89×7) | Capital-structure data (bank-template balance sheet) | FY2021–FY2025 annual + LTM/as-of Jun-30-2026 | ok (tab extracted) | High |
| Nu Holdings Ltd NYSE NU Financials Capital Structure Details.xls → tab: Capital Structure Details (29×10) | Capital-structure data | FY2021–FY2025 annual + LTM/as-of Jun-30-2026 | ok (tab extracted) | High |
| Nu Holdings Ltd NYSE NU Financials Capital Structure Summary.xls → tab: Capital Structure Summary (60×7) | Capital-structure data | FY2021–FY2025 annual + LTM/as-of Jun-30-2026 | ok (tab extracted) | High |
| Nu Holdings Ltd NYSE NU Financials Cash Flow.xls → tab: Cash Flow (72×7) | Cash flow data | FY2021–FY2025 annual + LTM/as-of Jun-30-2026 | ok (tab extracted) | High |
| Nu Holdings Ltd NYSE NU Financials Historical Capitalization.xls → tab: Historical Capitalization (38×7) | Capital-structure data | Quarterly 2025-03-31 → 2026-06-30 | ok (tab extracted) | High |
| Nu Holdings Ltd NYSE NU Financials Income Statement.xls → tab: Income Statement (94×7) | Income statement | FY2021–FY2025 annual + LTM/as-of Jun-30-2026 | ok (tab extracted) | High |
| Nu Holdings Ltd NYSE NU Financials Industry Specific.xls → tab: Industry Specific (68×7) | Bank operating metrics (industry-specific) | FY2021–FY2025 annual + LTM/as-of Jun-30-2026 | ok (tab extracted) | Medium |
| Nu Holdings Ltd NYSE NU Financials Key Stats.xls → tab: Key Stats (80×9) | Income statement + capital-structure summary | FY2022A–FY2025A, LTM Jun-30-2026, FY2026E–FY2028E | ok (tab extracted) | High |
| Nu Holdings Ltd NYSE NU Financials Multiples (1).xls → tab: Multiples (61×9) | Multiples export (own history) | Quarterly 2025-03-31 → 2026-08-28 | ok (tab extracted) | High |
| Nu Holdings Ltd NYSE NU Financials Multiples.xls → tab: Multiples (60×9) | Multiples export (own history) | Quarterly 2025-03-31 → 2026-08-28 | ok (tab extracted) | High |
| Nu Holdings Ltd NYSE NU Financials Ratios.xls → tab: Ratios (149×7) | Capital-structure data / ratios | FY2021–FY2025 annual + LTM/as-of Jun-30-2026 | ok (tab extracted) | Medium |
| Nu Holdings Ltd NYSE NU Financials Segments (1).xls → tab: Segments (77×7) | Segment data | Annual FY2020–FY2025 (Dec-31-2025 latest) | ok (tab extracted) | High |
| Nu Holdings Ltd NYSE NU Financials Segments.xls → tab: Segments (77×7) | Segment data | Annual FY2020–FY2025 (Dec-31-2025 latest) | ok (tab extracted) | High |
| Nu Holdings Ltd NYSE NU Financials Supplemental.xls → tab: Supplemental (50×7) | Supplemental financial data | FY2021–FY2025 annual + LTM/as-of Jun-30-2026 | ok (tab extracted) | Medium |
| Nu Holdings Ltd NYSE NU Financials.xls → tab: Key Stats (85×9) | Income statement + capital-structure summary | FY2021–FY2025 annual + LTM/as-of Jun-30-2026 | ok (tab extracted) | High |
| Nu Holdings Ltd NYSE NU Financials.xls → tab: Income Statement (94×7) | Income statement | FY2021–FY2025 annual + LTM/as-of Jun-30-2026 | ok (tab extracted) | High |
| Nu Holdings Ltd NYSE NU Financials.xls → tab: Balance Sheet (89×7) | Capital-structure data (bank-template balance sheet) | FY2021–FY2025 annual + LTM/as-of Jun-30-2026 | ok (tab extracted) | High |
| Nu Holdings Ltd NYSE NU Financials.xls → tab: Cash Flow (72×7) | Cash flow data | FY2021–FY2025 annual + LTM/as-of Jun-30-2026 | ok (tab extracted) | High |
| Nu Holdings Ltd NYSE NU Financials.xls → tab: Multiples (61×9) | Multiples export (own history) | FY2021–FY2025 annual + LTM/as-of Jun-30-2026 | ok (tab extracted) | High |
| Nu Holdings Ltd NYSE NU Financials.xls → tab: Historical Capitalization (38×7) | Capital-structure data | FY2021–FY2025 annual + LTM/as-of Jun-30-2026 | ok (tab extracted) | High |
| Nu Holdings Ltd NYSE NU Financials.xls → tab: Capital Structure Summary (60×7) | Capital-structure data | FY2021–FY2025 annual + LTM/as-of Jun-30-2026 | ok (tab extracted) | High |
| Nu Holdings Ltd NYSE NU Financials.xls → tab: Capital Structure Details (33×10) | Capital-structure data | FY2021–FY2025 annual + LTM/as-of Jun-30-2026 | ok (tab extracted) | High |
| Nu Holdings Ltd NYSE NU Financials.xls → tab: Ratios (149×7) | Capital-structure data / ratios | FY2021–FY2025 annual + LTM/as-of Jun-30-2026 | ok (tab extracted) | Medium |
| Nu Holdings Ltd NYSE NU Financials.xls → tab: Supplemental (50×7) | Supplemental financial data | FY2021–FY2025 annual + LTM/as-of Jun-30-2026 | ok (tab extracted) | Medium |
| Nu Holdings Ltd NYSE NU Financials.xls → tab: Industry Specific (68×7) | Bank operating metrics (industry-specific) | FY2021–FY2025 annual + LTM/as-of Jun-30-2026 | ok (tab extracted) | Medium |
| Nu Holdings Ltd NYSE NU Financials.xls → tab: Pension OPEB (15×6) | Other (pension/OPEB) | FY2021–FY2025 annual + LTM/as-of Jun-30-2026 | ok (tab extracted) | Low |
| Nu Holdings Ltd NYSE NU Financials.xls → tab: Segments (77×7) | Segment data | FY2021–FY2025 annual + LTM/as-of Jun-30-2026 | ok (tab extracted) | High |
| Nu Holdings Ltd NYSE NU Fixed Income S P Global Ratings.xls → tab: S P Global Ratings (20×8) | Capital-structure data (debt securities / ratings) | Debt securities / S&P ratings as-of ~Aug-2026 | ok (tab extracted) | Medium |
| Nu Holdings Ltd NYSE NU Fixed Income Securities Summary.xls → tab: Securities Summary (2299×24) | Capital-structure data (debt securities / ratings) | Debt securities / S&P ratings as-of ~Aug-2026 | ok (tab extracted) | Medium |
| Nu Holdings Ltd NYSE NU Industry Classifications.rtf | Business description | as-of ~Aug-2026 (CIQ export) | ok, 910 chars | Low |
| Nu Holdings Ltd NYSE NU Investment Analysis Co Investors.xls → tab: Co-Investors (53×3) | Investments / co-investors | as-of ~Aug-2026 (CIQ export) | ok (tab extracted) | Low |
| Nu Holdings Ltd NYSE NU Investment Analysis Direct Investments.xls → tab: Direct Investments (55×21) | Investments / co-investors | as-of ~Aug-2026 (CIQ export) | ok (tab extracted) | Low |
| Nu Holdings Ltd NYSE NU Key Developments.rtf | Company events | Company events through ~Aug-2026 | ok, 29,094 chars | Low |
| Nu Holdings Ltd NYSE NU Long Business Description.rtf | Business description | as-of ~Aug-2026 (CIQ export) | ok, 36,428 chars | Low |
| Nu Holdings Ltd NYSE NU Private Ownership.rtf | Ownership / share-count context | as-of ~Aug-2026 (CIQ export) | ok, 6,018 chars | Medium |
| Nu Holdings Ltd NYSE NU Products.xls → tab: Products (31×5) | Business description | as-of ~Aug-2026 (CIQ export) | ok (tab extracted) | Low |
| Nu Holdings Ltd NYSE NU Professionals.xls → tab: Professionals (29×24) | Governance data | as-of ~Aug-2026 (CIQ export) | ok (tab extracted) | Low |
| Nu Holdings Ltd NYSE NU Public Company Profile.rtf | Business description | as-of ~Aug-2026 (CIQ export) | ok, 18,760 chars | Low |
| Nu Holdings Ltd NYSE NU Public Ownership Crossholdings.xls → tab: Crossholdings (1840×7) | Ownership / share-count context | Holdings to 2026-06-30; insider events to 2026-08-26 | ok (tab extracted) | Medium |
| Nu Holdings Ltd NYSE NU Public Ownership Detailed.xls → tab: Detailed (1346×15) | Ownership / share-count context | Holdings to 2026-06-30; insider events to 2026-08-26 | ok (tab extracted) | Medium |
| Nu Holdings Ltd NYSE NU Public Ownership History.xls → tab: History (1499×5) | Ownership / share-count context | Holdings to 2026-06-30; insider events to 2026-08-26 | ok (tab extracted) | Medium |
| Nu Holdings Ltd NYSE NU Public Ownership Insider Trading.xls → tab: Insider Trading (46×11) | Ownership / share-count context | Holdings to 2026-06-30; insider events to 2026-08-26 | ok (tab extracted) | Medium |
| Nu Holdings Ltd NYSE NU Public Ownership Summary.rtf | Ownership / share-count context | Holdings to 2026-06-30; insider events to 2026-08-26 | ok, 4,445 chars | Medium |
| Nu Holdings Ltd NYSE NU Strategic Alliances.xls → tab: Strategic Alliances (25×7) | Value-chain export | as-of ~Aug-2026 (CIQ export) | ok (tab extracted) | Low |
| Nu Holdings Ltd NYSE NU Suppliers.xls → tab: Suppliers (25×8) | Value-chain export | as-of ~Aug-2026 (CIQ export) | ok (tab extracted) | Low |
| Nu Holdings Ltd NYSE NU Takeover Defenses.xls → tab: Corporate Governance (48×4) | Governance data | as-of ~Aug-2026 (CIQ export) | ok (tab extracted) | Low |
| Nu Holdings Ltd NYSE NU Takeover Defenses.xls → tab: Takeover Defenses (26×4) | Governance data | as-of ~Aug-2026 (CIQ export) | ok (tab extracted) | Low |
| Nu Holdings Ltd NYSE NU Takeover Defenses.xls → tab: Compare Defenses (36×8) | Governance data | as-of ~Aug-2026 (CIQ export) | ok (tab extracted) | Low |
| Nu Holdings Ltd. (NYSE_NU) Corporate Structure Tree.xls → tab: Nu Holdings Ltd NYSENU Corpor (53×17) | Group structure (subsidiaries / minority interest) | as-of ~Aug-2026 (CIQ export) | ok (tab extracted) | Medium |
| Nu Holdings Ltd. (NYSE_NU) Corporate Structure Tree.xls → tab: Filtered Count (22×4) | Group structure (subsidiaries / minority interest) | as-of ~Aug-2026 (CIQ export) | ok (tab extracted) | Medium |
| Nu Holdings Ltd. (NYSE_NU) Corporate Structure Tree.xls → tab: Aggregates (22×4) | Group structure (subsidiaries / minority interest) | as-of ~Aug-2026 (CIQ export) | ok (tab extracted) | Medium |
| Nu Holdings Ltd. Form 20-F filed on Apr-08-2026.pdf | Annual filing (SEC Form 20-F, IFRS) | FY2025 (ended Dec-31-2025); filed Apr-08-2026 | ok, 6,115 chars | High |
| NuHoldingsLtdNYSENUEstimatesReport.xls → tab: Consensus (397×30) | Consensus / estimate export | Consensus as-of ~2026-08-29; FY2026E–FY2033E; CFYE Dec-31-2026 | ok (tab extracted) | High |
| NuHoldingsLtdNYSENUEstimatesReport.xls → tab: Recent Changes (265×10) | Consensus / estimate export | Consensus as-of ~2026-08-29; FY2026E–FY2033E; CFYE Dec-31-2026 | ok (tab extracted) | Medium |
| NuHoldingsLtdNYSENUEstimatesReport.xls → tab: Multiples (26×5) | Multiples export (forward, consensus-based) | Consensus as-of ~2026-08-29; FY2026E–FY2033E; CFYE Dec-31-2026 | ok (tab extracted) | High |
| NuHoldingsLtdNYSENUEstimatesReport.xls → tab: Surprise (200×20) | Consensus / estimate export | Consensus as-of ~2026-08-29; FY2026E–FY2033E; CFYE Dec-31-2026 | ok (tab extracted) | Medium |
| NuHoldingsLtdNYSENUEstimatesReport.xls → tab: Trends (238×21) | Consensus / estimate export | Consensus as-of ~2026-08-29; FY2026E–FY2033E; CFYE Dec-31-2026 | ok (tab extracted) | High |
| NuHoldingsLtdNYSENUEstimatesReport.xls → tab: Revisions (357×17) | Consensus / estimate export | Consensus as-of ~2026-08-29; FY2026E–FY2033E; CFYE Dec-31-2026 | ok (tab extracted) | High |
| Nu_Holdings_Ltd_-_Form_20-F(Apr-08-2026).doc | Annual filing (SEC Form 20-F, IFRS) | FY2025 (ended Dec-31-2025); filed Apr-08-2026 | ok, 1,573,413 chars | High |
| Nu_Holdings_Ltd_-_Form_20-F(Apr-08-2026).pdf | Annual filing (SEC Form 20-F, IFRS) | FY2025 (ended Dec-31-2025); filed Apr-08-2026 | ok, 1,671,934 chars | High |
| Nu_Holdings_Ltd_-_Form_20-F(Apr-16-2025).doc | Annual filing (SEC Form 20-F, IFRS) | FY2024 (ended Dec-31-2024); filed Apr-16-2025 | ok, 1,790,450 chars | High |
| Nu_Holdings_Ltd_-_Form_20-F(Apr-16-2025).pdf | Annual filing (SEC Form 20-F, IFRS) | FY2024 (ended Dec-31-2024); filed Apr-16-2025 | ok, 2,378,433 chars | High |
| Nu_Holdings_Ltd_-_Form_20-F(Apr-19-2024).pdf | Annual filing (SEC Form 20-F, IFRS) | FY2023 (ended Dec-31-2023); filed Apr-19-2024 | ok, 2,312,327 chars | High |
| Nu_Holdings_Ltd_-_Form_20-F(Apr-20-2023).pdf | Annual filing (SEC Form 20-F, IFRS) | FY2022 (ended Dec-31-2022); filed Apr-20-2023 | ok, 2,168,186 chars | High |
| Nu_Holdings_Ltd_-_Form_20-F(Apr-21-2022).pdf | Annual filing (SEC Form 20-F, IFRS) | FY2021 (ended Dec-31-2021); filed Apr-21-2022 | ok, 3,354,372 chars | High |
| Transaction Summary M A Private Placements.xls → tab: M A Private Placements (25×14) | Capital-markets transaction history | as-of ~Aug-2026 (CIQ export) | ok (tab extracted) | Medium |
| Transaction Summary Public Offerings.xls → tab: Public Offerings (15×8) | Capital-markets transaction history | as-of ~Aug-2026 (CIQ export) | ok (tab extracted) | Medium |
| U21257060_20260331_20260331.pdf | Other (personal broker/tax statement — not company data) | Indian FY2025-26 personal tax/broker statement (to 2026-03-31) | ok, 77,975 chars | Low |
| consolidated_tax_report_2025-26.xlsx → tab: LTCG (146×18) | Other (personal broker/tax statement — not company data) | Indian FY2025-26 personal tax/broker statement (to 2026-03-31) | ok (tab extracted) | Low |
| consolidated_tax_report_2025-26.xlsx → tab: STCG (163×20) | Other (personal broker/tax statement — not company data) | Indian FY2025-26 personal tax/broker statement (to 2026-03-31) | ok (tab extracted) | Low |
| consolidated_tax_report_2025-26.xlsx → tab: F&O (51×10) | Other (personal broker/tax statement — not company data) | Indian FY2025-26 personal tax/broker statement (to 2026-03-31) | ok (tab extracted) | Low |
| consolidated_tax_report_2025-26.xlsx → tab: Intraday (46×12) | Other (personal broker/tax statement — not company data) | Indian FY2025-26 personal tax/broker statement (to 2026-03-31) | ok (tab extracted) | Low |
| consolidated_tax_report_2025-26.xlsx → tab: Dividend (68×10) | Other (personal broker/tax statement — not company data) | Indian FY2025-26 personal tax/broker statement (to 2026-03-31) | ok (tab extracted) | Low |
| consolidated_tax_report_2025-26.xlsx → tab: Interest (19×5) | Other (personal broker/tax statement — not company data) | Indian FY2025-26 personal tax/broker statement (to 2026-03-31) | ok (tab extracted) | Low |
| consolidated_tax_report_2025-26.xlsx → tab: Bonds & SGB (25×12) | Other (personal broker/tax statement — not company data) | Indian FY2025-26 personal tax/broker statement (to 2026-03-31) | ok (tab extracted) | Low |
| consolidated_tax_report_2025-26.xlsx → tab: Schedule FA (41×13) | Other (personal broker/tax statement — not company data) | Indian FY2025-26 personal tax/broker statement (to 2026-03-31) | ok (tab extracted) | Low |
| consolidated_tax_report_2025-26.xlsx → tab: Schedule FSI (33×10) | Other (personal broker/tax statement — not company data) | Indian FY2025-26 personal tax/broker statement (to 2026-03-31) | ok (tab extracted) | Low |
| consolidated_tax_report_2025-26.xlsx → tab: Form 67 (27×13) | Other (personal broker/tax statement — not company data) | Indian FY2025-26 personal tax/broker statement (to 2026-03-31) | ok (tab extracted) | Low |
| consolidated_tax_report_2025-26.xlsx → tab: Schedule TR (28×8) | Other (personal broker/tax statement — not company data) | Indian FY2025-26 personal tax/broker statement (to 2026-03-31) | ok (tab extracted) | Low |
| Nu_Holdings_Ltd_-_(Aug-13-2026).pdf | Quarterly filing (earnings release) | Q2 2026 earnings release (Jun-30-2026); Aug-13-2026 | ok, 108,767 chars | High |
| Nu_Holdings_Ltd_-_(Aug-19-2025).pdf | Other (BDR depositary notice, Portuguese) | BDR notice re Q2 2025; dated 19-ago-2025 | ok, 360 chars | Low |
| Nu_Holdings_Ltd_-_Form_20-F(Apr-08-2026).pdf | Annual filing (SEC Form 20-F, IFRS) | FY2025 (ended Dec-31-2025); filed Apr-08-2026 | ok, 1,671,934 chars | High |
| Nu_Holdings_Ltd_-_Form_Annual_Report(Feb-26-2026).pdf | Other | as-of ~Aug-2026 (CIQ export) | ok, 371,517 chars | Low |
| Nu_Holdings_Ltd_-_Form_Interim_Report(Aug-14-2026).pdf | Other | as-of ~Aug-2026 (CIQ export) | ok, 297,047 chars | Low |
| Nu_Holdings_Ltd_-_Form_Interim_Report(Aug-20-2026).pdf | Other | as-of ~Aug-2026 (CIQ export) | ok, 341 chars | Low |
| Nu_Holdings_Ltd_-_Form_Interim_Report(May-14-2026).pdf | Other | as-of ~Aug-2026 (CIQ export) | ok, 274,519 chars | Low |
| Nu_Holdings_Ltd_-_Form_Interim_Report(May-15-2026).pdf | Other | as-of ~Aug-2026 (CIQ export) | ok, 274,519 chars | Low |
| Nu_Holdings_Ltd_-_Form_Interim_Report(May-20-2026).pdf | Other | as-of ~Aug-2026 (CIQ export) | ok, 342 chars | Low |
| Nu_Holdings_Ltd_-_Form_Interim_Report(Nov-17-2025).pdf | Other | as-of ~Aug-2026 (CIQ export) | ok, 340 chars | Low |
| Nu_Holdings_Ltd_-_Form_Preliminary_Interim_Report(Aug-13-2026).pdf | Other | as-of ~Aug-2026 (CIQ export) | ok, 108,767 chars | Low |
| Nu_Holdings_Ltd_-_Form_Preliminary_Interim_Report(Feb-25-2026).pdf | Other | as-of ~Aug-2026 (CIQ export) | ok, 117,921 chars | Low |
| Nu_Holdings_Ltd_-_Form_Preliminary_Interim_Report(May-14-2026).pdf | Other | as-of ~Aug-2026 (CIQ export) | ok, 33,504 chars | Low |
| Nu_Holdings_Ltd_-_Form_Preliminary_Interim_Report(Nov-13-2025).pdf | Other | as-of ~Aug-2026 (CIQ export) | ok, 126,011 chars | Low |
| Nu_Holdings_Ltd_-_(Aug-13-2026).pdf | Quarterly filing (earnings release) | Q2 2026 earnings release (Jun-30-2026); Aug-13-2026 | ok, 108,767 chars | High |
| Nu_Holdings_Ltd_-_(Aug-19-2025).pdf | Other (BDR depositary notice, Portuguese) | BDR notice re Q2 2025; dated 19-ago-2025 | ok, 360 chars | Low |
| Nu_Holdings_Ltd_-_Form_20-F(Apr-08-2026).pdf | Annual filing (SEC Form 20-F, IFRS) | FY2025 (ended Dec-31-2025); filed Apr-08-2026 | ok, 1,671,934 chars | High |
| Nu_Holdings_Ltd_-_Form_Annual_Report(Feb-26-2026).pdf | Other | as-of ~Aug-2026 (CIQ export) | ok, 371,517 chars | Low |
| Nu_Holdings_Ltd_-_Form_Interim_Report(Aug-14-2026).pdf | Other | as-of ~Aug-2026 (CIQ export) | ok, 297,047 chars | Low |
| Nu_Holdings_Ltd_-_Form_Interim_Report(Aug-20-2026).pdf | Other | as-of ~Aug-2026 (CIQ export) | ok, 341 chars | Low |
| Nu_Holdings_Ltd_-_Form_Interim_Report(May-14-2026).pdf | Other | as-of ~Aug-2026 (CIQ export) | ok, 274,519 chars | Low |
| Nu_Holdings_Ltd_-_Form_Interim_Report(May-15-2026).pdf | Other | as-of ~Aug-2026 (CIQ export) | ok, 274,519 chars | Low |
| Nu_Holdings_Ltd_-_Form_Interim_Report(May-20-2026).pdf | Other | as-of ~Aug-2026 (CIQ export) | ok, 342 chars | Low |
| Nu_Holdings_Ltd_-_Form_Interim_Report(Nov-17-2025).pdf | Other | as-of ~Aug-2026 (CIQ export) | ok, 340 chars | Low |
| Nu_Holdings_Ltd_-_Form_Preliminary_Interim_Report(Aug-13-2026).pdf | Other | as-of ~Aug-2026 (CIQ export) | ok, 108,767 chars | Low |
| Nu_Holdings_Ltd_-_Form_Preliminary_Interim_Report(Feb-25-2026).pdf | Other | as-of ~Aug-2026 (CIQ export) | ok, 117,921 chars | Low |
| Nu_Holdings_Ltd_-_Form_Preliminary_Interim_Report(May-14-2026).pdf | Other | as-of ~Aug-2026 (CIQ export) | ok, 33,504 chars | Low |
| Nu_Holdings_Ltd_-_Form_Preliminary_Interim_Report(Nov-13-2025).pdf | Other | as-of ~Aug-2026 (CIQ export) | ok, 126,011 chars | Low |
| Nu Holdings Ltd. - ShareholderAnalyst Call.pdf | Transcript | undated shareholder/analyst call | ok, 11,239 chars | Medium |
| Nu Holdings Ltd., Q1 2022 Earnings Call, May 16, 2022.pdf | Transcript | Q1 2022 call, May 16, 2022 | ok, 87,978 chars | Medium |
| Nu Holdings Ltd., Q1 2023 Earnings Call, May 15, 2023.pdf | Transcript | Q1 2023 call, May 15, 2023 | ok, 92,253 chars | Medium |
| Nu Holdings Ltd., Q1 2024 Earnings Call, May 14, 2024.pdf | Transcript | Q1 2024 call, May 14, 2024 | ok, 88,138 chars | Medium |
| Nu Holdings Ltd., Q1 2025 Earnings Call, May 13, 2025.pdf | Transcript | Q1 2025 call, May 13, 2025 | ok, 62,884 chars | Medium |
| Nu Holdings Ltd., Q1 2026 Earnings Call, May 14, 2026.pdf | Transcript | Q1 2026 call, May 14, 2026 | ok, 67,336 chars | Medium |
| Nu Holdings Ltd., Q2 2022 Earnings Call, Aug 15, 2022.pdf | Transcript | Q2 2022 call, Aug 15, 2022 | ok, 90,039 chars | Medium |
| Nu Holdings Ltd., Q2 2023 Earnings Call, Aug 15, 2023.pdf | Transcript | Q2 2023 call, Aug 15, 2023 | ok, 88,530 chars | Medium |
| Nu Holdings Ltd., Q2 2024 Earnings Call, Aug 13, 2024.pdf | Transcript | Q2 2024 call, Aug 13, 2024 | ok, 71,851 chars | Medium |
| Nu Holdings Ltd., Q2 2025 Earnings Call, Aug 14, 2025.pdf | Transcript | Q2 2025 call, Aug 14, 2025 | ok, 62,750 chars | Medium |
| Nu Holdings Ltd., Q2 2026 Earnings Call, Aug 13, 2026.pdf | Transcript | Q2 2026 call, Aug 13, 2026 | ok, 68,453 chars | Medium |
| Nu Holdings Ltd., Q3 2022 Earnings Call, Nov 14, 2022.pdf | Transcript | Q3 2022 call, Nov 14, 2022 | ok, 88,154 chars | Medium |
| Nu Holdings Ltd., Q3 2023 Earnings Call, Nov 14, 2023.pdf | Transcript | Q3 2023 call, Nov 14, 2023 | ok, 85,421 chars | Medium |
| Nu Holdings Ltd., Q3 2024 Earnings Call, Nov 13, 2024.pdf | Transcript | Q3 2024 call, Nov 13, 2024 | ok, 73,393 chars | Medium |
| Nu Holdings Ltd., Q3 2025 Earnings Call, Nov 13, 2025.pdf | Transcript | Q3 2025 call, Nov 13, 2025 | ok, 64,333 chars | Medium |
| Nu Holdings Ltd., Q4 2021 Earnings Call, Feb 22, 2022.pdf | Transcript | Q4 2021 call, Feb 22, 2022 | ok, 85,745 chars | Medium |
| Nu Holdings Ltd., Q4 2022 Earnings Call, Feb 14, 2023.pdf | Transcript | Q4 2022 call, Feb 14, 2023 | ok, 82,774 chars | Medium |
| Nu Holdings Ltd., Q4 2023 Earnings Call, Feb 22, 2024.pdf | Transcript | Q4 2023 call, Feb 22, 2024 | ok, 90,725 chars | Medium |
| Nu Holdings Ltd., Q4 2024 Earnings Call, Feb 20, 2025.pdf | Transcript | Q4 2024 call, Feb 20, 2025 | ok, 83,661 chars | Medium |
| Nu Holdings Ltd., Q4 2025 Earnings Call, Feb 25, 2026.pdf | Transcript | Q4 2025 call, Feb 25, 2026 | ok, 67,805 chars | Medium |

**Duplicate-copy note (not a gap).** The pool carries the same filings three times over (root, `Filings/`, `Filings 2/`) and several CIQ exports twice (`... (1).xls`). The manifest's `conflicts` block names seven duplicated CIQ sheets (Balance Sheet, Capital Structure Summary, Cash Flow, Income Statement, Multiples, Ratios, Segments). Duplicates do not add evidence; `01` must pick one copy per statement and say which, so the same number does not enter the module twice under two filenames.

**Non-company files in the pool.** `99The_Expectant_Father__th_Edition_.torrent`, `U21257060_20260331_20260331.pdf`, `Interactive_Brokers_Consolidated_Tax_Report_FY2025-26.xlsx` (25 tabs), `consolidated_tax_report_2025-26.xlsx` (11 tabs) and `Interactive_Brokers_FY2025-26_CA_Audit_Note.txt` are the user's own personal broker and Indian income-tax records, not Nu Holdings data. They extracted cleanly but carry **no** valuation content for this issuer. In particular, **the IBKR files here are a personal tax pack, not a price screenshot** — the current price in this run comes from Capital IQ, not from IBKR.

## 1A. Jurisdiction & Reporting Regime

| Item | Detected Value | Evidence |
|---|---|---|
| Primary listing country / exchange | United States — New York Stock Exchange, ticker **NU** (Class A ordinary shares). Secondary line: Brazilian BDR **BOVESPA:ROXO34**, 1 share per BDR, quoted in BRL | FY2025 20-F, cover page ("New York Stock Exchange"); FY2025 20-F, Item 4 ("listed on the New York Stock Exchange (\"NYSE\") under the symbol 'NU'"); Capital IQ Estimates export → Consensus tab, Market Summary (NYSE:NU / BOVESPA:ROXO34 (GDR), Common Shares Per ADR = 1) |
| Filing regime | **US SEC — foreign private issuer.** Annual report on Form 20-F; quarterly results furnished as earnings releases plus IAS 34 interim condensed financials. Not a 10-K/10-Q filer, so the absence of those forms is **not** a data gap (CLAUDE.md §27) | FY2025 20-F, cover page (Form 20-F, Annual Report pursuant to Section 13 or 15(d)); Q2 2026 interim, auditor's review report |
| Reporting standard | **IFRS Accounting Standards as issued by the IASB** (interim statements under IAS 34). Not US GAAP — the 20-F cover box for "International Financial Reporting Standards as issued by the IASB" is checked | FY2025 20-F, cover page and Note 2; Q2 2026 Interim Report (Aug-14-2026), KPMG review report ("in accordance with IAS 34") |
| Reporting currency (and scale) | **US dollar (USD)**, presentation currency; books and records maintained in USD. CIQ exports state USD throughout. Functional currencies of the operating subsidiaries are the Brazilian real, Mexican peso and Colombian peso — so **every fair-value read carries FX translation risk that is not visible in the USD headline** (§15/§27) | FY2025 20-F, Item 3 ("We maintain our books and records in U.S. dollars, which is the presentation currency"); FY2025 20-F, Note 2.a ("The functional currency of our Brazilian, Mexican and Colombian operating entities … is the Brazilian real, the Mexican peso and the Colombian peso") |
| Fiscal-year end | **31 December.** FY2025 = 12 months ended Dec-31-2025. Current fiscal year end Dec-31-2026 | FY2025 20-F, Item 5 ("fiscal year ended on December 31 of that calendar year"); Capital IQ Estimates export → Multiples tab ("Current Fiscal Year End: Dec-31-2026") |
| Document language(s) | **English** for all filings, transcripts, and CIQ exports. **Portuguese** for four short Banco Bradesco BDR depositary notices (Aug-19-2025, Nov-17-2025, May-20-2026, Aug-20-2026). Per CLAUDE.md §27 the Portuguese documents are **present, not missing** — they are read and translated (each says the referenced quarterly release is available at a linked address). No data-quality or sufficiency score is reduced for language | Nu_Holdings_Ltd_-_Form_Interim_Report(Aug-20-2026).pdf ("São Paulo, 20 de agosto de 2026… Banco Bradesco S.A., na qualidade de depositário e emissor do programa de BDR Nível I Patrocinado") |

**Consequences downstream (CLAUDE.md §27, MODULE_RULES Jurisdiction-Aware Sourcing).** Cite the local-equivalent documents: the **Form 20-F** is the audited-annual tier, the **IAS 34 Interim Condensed Consolidated Financial Statements** are the interim tier, and the **earnings release / Preliminary Interim Report** is the material-event tier. Do NOT mark 10-K, 10-Q, 8-K, DEF 14A or Form 4 "missing" — this issuer does not file them.

**Tradable-line rule (CLAUDE.md §16).** All valuation output belongs to **NYSE:NU, Class A ordinary shares, quoted in USD**. The BDR line BOVESPA:ROXO34 (BRL 12.33 close, 2 estimates, mean target BRL 3.56 in USD terms per the export's own currency label — a mismatch `01` must resolve before quoting it) is a different instrument and must not carry this module's fair value. There are **two share classes**: 3,833,072,934 Class A and 1,022,600,698 Class B as of Dec-31-2025, Class B convertible 1:1 into Class A and carrying 74.3% of voting power [FY2025 20-F, Item 3.D / Item 7]. Only Class A is listed. `01` must state which count it uses for market cap (total 4,830.7m shares vs Class A 3,808.1m) — the CIQ Key Stats tab shows both, and using the Class A count alone would understate market capitalisation by roughly 21%.

## 2. Most Recent Sources

Ages are measured to the run date, 2026-09-06, from the period-end or as-of date INSIDE each document.

| Source Type | Filename | Period / As-of | Age (months) |
|---|---|---|---|
| Annual filing | `Nu_Holdings_Ltd_-_Form_20-F(Apr-08-2026).pdf` (also `.doc`, and duplicated under `Filings/` and `Filings 2/`) | FY2025, year ended Dec-31-2025; filed Apr-08-2026 | 8.2 (period end) / 5.0 (filing date) |
| Quarterly filing | `Nu_Holdings_Ltd_-_Form_Interim_Report(Aug-14-2026).pdf` — IAS 34 interim condensed consolidated financials, KPMG-reviewed | 3m and 6m ended Jun-30-2026 | 2.2 |
| Quarterly filing (earnings release) | `Nu_Holdings_Ltd_-_Form_Preliminary_Interim_Report(Aug-13-2026).pdf` (= `Nu_Holdings_Ltd_-_(Aug-13-2026).pdf`) | Q2 2026 results, released Aug-13-2026 | 0.8 |
| Capital structure / balance sheet | `Nu Holdings Ltd NYSE NU Financials Balance Sheet.xls` → tab `Balance Sheet` (bank template); plus `… Capital Structure Summary`, `… Capital Structure Details`, `… Historical Capitalization`; primary source = Q2 2026 Interim Report statement of financial position | As of Jun-30-2026 (annual columns back to Dec-31-2021) | 2.2 |
| Consensus / estimate export | `NuHoldingsLtdNYSENUEstimatesReport.xls` → tabs `Consensus` (397×30), `Trends`, `Revisions`, `Recent Changes`, `Surprise` | Consensus as-of ~2026-08-29; estimates FY2026E–FY2033E; 22 target-price contributors | ~0.3 |
| Multiples export (own history) | `Nu Holdings Ltd NYSE NU Financials Multiples.xls` → tab `Multiples`; forward set in `NuHoldingsLtdNYSENUEstimatesReport.xls` → tab `Multiples` | Quarterly closes 2025-03-31 → **2026-08-28** (P/E, P/BV, P/TangBV, Mkt Cap/Revenue) | ~0.3 |
| Peer / comps export | `Company Comparable Analysis Nu Holdings Ltd .xls` → tabs `Trading Multiples`, `Implied Valuation`, `Financial Data`, `Operating Statistics` | As-Of Date 2026-08-29; 10 named peers + subject | ~0.3 |
| Current price (IBKR / Capital IQ) | `Company Comparable Analysis Nu Holdings Ltd .xls` → tab `Financial Data` ("Day Close Price Latest", subject row) — corroborated by `NuHoldingsLtdNYSENUEstimatesReport.xls` → tab `Consensus` ("Latest Price/Last Close Price 14.30/14.30") | **USD 14.30**, as-of 2026-08-29 (28-Aug-2026 close; 2026-08-29 was a Saturday) | ~0.3 (≈5–6 trading days — see the staleness note below) |
| Cash flow statement | `Nu Holdings Ltd NYSE NU Financials Cash Flow.xls` → tab `Cash Flow` (bank template); primary source = Q2 2026 Interim Report statement of cash flows | FY2021–FY2025 annual + LTM 12m ended Jun-30-2026 | 2.2 |
| Segment data | `Nu Holdings Ltd NYSE NU Financials Segments.xls` → tab `Segments` (business + geographic) | Annual FY2020–FY2025, latest column Dec-31-2025 | 8.2 |

**Price note for `01` (do not skip).** Two Capital IQ price reads exist in the same pool and they disagree: **USD 14.30** (comps `Financial Data` tab and Estimates `Consensus` tab, both explicitly as-of 2026-08-29 / 28-Aug close) and **USD 14.88** (`Financials Key Stats` tab, "Current Capitalization → Share Price", **undated in the export**). `01` must adopt the dated 14.30 as the pool-verified anchor, state the 14.88 divergence in one line, and tag the price-state. The user memo `NU_Holdings_Deep_Dive_15_Page_Memo_30_Aug_2026.pdf` independently records "$14.30 · 28 AUG CLOSE", which corroborates the date, not the level.

**Staleness.** The anchor's as-of date (28-Aug-2026 close) sits about **5–6 trading days** before the run date of 2026-09-06 — right at the ">5 trading days" line in the MODULE_RULES staleness Score-Cap. `01` must count the trading days explicitly against that threshold, document a refresh attempt, and apply the **valuation-confidence max 70** cap if the count exceeds five. This triage does not pre-apply that cap; it flags it as a live decision `01` owns.

## 3. Valuation Usability Check

| Requirement | Available? (Y/N) | Source | Why It Matters |
|---|---|---|---|
| Current price | **Y** | USD 14.30 as-of 2026-08-29 (28-Aug close) — `Company Comparable Analysis Nu Holdings Ltd .xls` → `Financial Data`; corroborated by Estimates → `Consensus` Market Summary. 52-week range 18.98 / 11.20 | Anchor for market cap, margin of safety, downside-to-bear. Pool-verified, so the price-relative reads unlock |
| Diluted share count | **Y** | Basic weighted-average 4,857,131 thousand and a diluted weighted-average line, Q2 2026 Interim Report, Note 9; shares outstanding 4,830.7m as-of 2026-08-29 (CIQ comps `Financial Data`); Class A / Class B split in FY2025 20-F | Market cap and per-share fair value. Note the two-class structure and the outstanding-vs-weighted-average distinction |
| Dilution data (options/RSUs/convertibles) | **Y** | Q2 2026 Interim Report, Note 9 (treasury-stock method stated explicitly) and Note 10 (SOP stock options and RSUs); FY2025 20-F, Omnibus Incentive Plan / SOP (pool capped at 5% of ordinary shares fully diluted) | Fully diluted per-share fair value and the Share Count Reconciliation Table |
| Business type track | **Y — FINANCIAL (bank)** | Capital IQ balance sheet and cash flow both use the **Bank** template; segment disclosure is a single "Banking" segment; regulated operating subsidiaries Nu Pagamentos / Nu Financeira (FY2025 20-F, Note 1) | Decides which methods are valid. **Per the Business-Type Method Map, EV-based multiples, an FCFF DCF, and the EV bridge as a value are NOT valid here** — value equity directly |
| Total debt, cash, minority/preferred | **Y** | Total debt USD 5,896.7m and cash & equivalents USD 10,455.2m (CIQ `Balance Sheet`, as-of Jun-30-2026; `ciq_facts.json` `total_debt_m` = 5,896.7, `status: present`); minority interest USD 2.05m and preferred nil (comps `Implied Valuation`); total equity USD 13,251,721 thousand (Q2 2026 Interim, statement of financial position) | EV bridge (informational only for a bank) and, more importantly, the equity and tangible-book base the valuation actually runs on |
| Income statement (LTM or FY) | **Y** | LTM 12m ended Jun-30-2026: revenue USD 8,442.1m, net income USD 3,607.1m, diluted EPS USD 0.734 (CIQ `Key Stats`); FY2025 audited in the 20-F; H1 2026 in the interim | Earnings base for P/E, residual income, and the forward metric in every scenario |
| Cash flow statement | **Y** | CIQ `Cash Flow` tab (bank template, FY2021–LTM Jun-30-2026) and the Q2 2026 Interim statement of cash flows | Present — but read with care: LTM cash from operations is **−USD 10,304.8m** (`ciq_facts.json` `ltm_ocf_m`, `status: present`) because a growing bank's loan book and deposits run through operating cash flow. This is **not** a distress signal and **not** an FCF base |
| Forward estimates (consensus) | **Y** | Estimates → `Consensus`: mean target USD 18.78 / median 19.00 (22 contributors), NTM EPS 0.97, FY2026E EPS 0.8482, FY2027E 1.11006, FY2028E 1.45953, **forward Book Value/Share FY2026E 3.15 rising through the strip**, LT growth mean 34.0%; Estimates → `Multiples`: NTM P/E 14.76×, FY2027 P/E 12.88×, FY2026 P/BV 4.54× | NTM/FY multiples, the forward metric in each scenario, and the book-value path a residual-income model needs |
| Historical multiple data | **Y (short window — flagged)** | `Financials Multiples` tab: quarterly Average/High/Low/Close for P/LTM EPS, P/NTM EPS, P/BV, P/TangBV, Mkt Cap/Revenue — but only **2025-03-31 → 2026-08-28 (six quarters)** | Own-history re-rating read. **Six quarters is not the 3–5 year band `02` normally uses** — see the Sector Cycle note below |
| Peer / comps data | **Y** | Comps `Trading Multiples`: 10 named peers (Itaú, Bradesco, Banco do Brasil, Santander Brasil, BTG Pactual, Banorte, Grupo Cibest, PagSeguro, Inter & Co, Credicorp) with LTM P/E, P/TangBV and NTM P/E; medians P/E 8.5×, P/TangBV 1.8×, NTM P/E 7.73×, vs subject 19.5× / 5.7× / 14.76×. Also `Nu Holdings Ltd NYSE NU Competitors.xls` (89 rows) and two M&A-comparables exports | Relative valuation — the primary peer method for a bank is P/E and P/tangible book, both present |
| Segment-level revenue & EBIT | **Y — but single-segment** | `Segments` tab: **Banking USD 6,991m = 100% of FY2025 revenue**, with segment interest expense, pre-tax profit and tax. Geographic split Brazil 11,038 (91%) / Mexico 808 (7%) / Other 237 (2%) [`ciq_facts.json` `segments_revenue`, `geographic`, both `status: present`] | Segment data exists, so this is not a data gap — but with one reportable segment a genuine sum-of-the-parts breakup does not exist. The geographic split is a sanity-check lens, not a segment P&L |
| Dividend / buyback data | **Y** | Dividend per share **NA in every year** and Total Dividends Paid "–" across FY2021–LTM Jun-2026 (CIQ `Ratios`, `Cash Flow`); **Repurchase of Common Stock −USD 500.4m** in LTM 12m to Jun-30-2026 (CIQ `Cash Flow`) | Shareholder-yield read. Zero dividend means a dividend-discount model must be built on distributable earnings, not on paid dividends; the buyback is the only cash return so far |

## 4. Cross-Module Availability

Checked against the actual filesystem at `analyses/NU_2026-09-06/`.

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

**Additional modules present in this run root.**
- `management-governance/` — complete (00 through 99, including `04_ownership-and-insider-behavior.md` and `99_management-governance-synthesis.md`). Available for the §24 Filter 6 / RF-OWN-004 unaligned-owner read, which matters here because the founder-CEO holds 74.3% of voting power through Class B shares.
- `balance-sheet-survival/` — **only `00_solvency-data-triage.md` exists. `01_capital-structure-and-leverage.md` is NOT available.** So `01_price-and-capital-structure` has no filing-based canonical net-debt figure to inherit and must build total debt from the Q2 2026 interim / 20-F debt notes directly, per the Cross-Module Inputs rule. It must say so rather than default silently to the CIQ vendor aggregate.
- `catalyst/` and `competitive-intel/` also exist in the run root (not valuation inputs).

**A caution on the vendor net-debt figure.** `ciq_facts.json` reports `net_debt_m` = **−9,274.2** (i.e. net cash) on the CIQ vendor basis, and its own `source_ref` warns the basis "may net short-term/liquid investments; confirm vs the strict total-debt−cash basis, §15". For a bank this figure is close to meaningless as a valuation input. `01` must label the basis inline and treat the EV bridge as informational only.

## 5. Partial-Data Flags

| Missing Data | Applies? (Y/N) | Affected Agents | Cap Applied |
|---|---|---|---|
| No current price | **N** | 01, 05, 07, 99 | None. A pool-verified, dated price exists (USD 14.30, as-of 2026-08-29). Margin of safety and downside-to-bear both unlock. `01` must still check the ≈5–6 trading-day staleness against the ">5 trading days → valuation confidence max 70" threshold |
| No consensus / forward estimates | **N** | 02, 03, 04, 05 | None. Full consensus strip incl. forward EPS, revenue and book value per share |
| No peer data | **N** | 03, 06 | None. 10 named peers with P/E and P/TangBV |
| No segment-level data | **N** | 06 | None — segment data exists. But it is a **single** reportable segment (Banking 100%), so `06` returns the "single-segment — SOTP collapses to the consolidated read" note per the Segment/SOTP Rule. The "SOTP not possible for a multi-segment business" cap does **not** bind, because this is not a multi-segment business |
| No balance sheet / capital structure | **N** | 01, 04, 06 | None. Bank-template balance sheet plus the audited/reviewed statement of financial position |
| No cash flow statement | **N** | 04 | None. Present in both the CIQ export and the interim filing |

**Caps that will bind anyway (not from the six rows above).** None are triggered by missing data. Two conditions must nonetheless be carried forward, because they are method-validity and reference-window facts rather than absent inputs:

1. **Sector Cycle Reality Test — likely "Not assessable" for both `02` and `03`.** The pool contains **no sector-level or peer-level multiple history**: the own-history multiple export spans six quarters (2025-03-31 → 2026-08-28), and the peer export is a single-date snapshot (2026-08-29) with no historical peer medians. Under the Score-Cap table, an honestly-absent check carries **no cap by itself**, but `02` and `03` must each write *"Not assessable — no sector-level multiple history"* rather than assume the anchor is stable, and `99` must record the gap in its Reconciliation so it is visible rather than silently skipped. `02` must additionally state plainly that its reference band is six quarters, not the 3–5 years the method assumes.
2. **Prior-memo contamination risk.** `NU_Holdings_Deep_Dive_15_Page_Memo_30_Aug_2026.pdf` is a user note (§4 tier 9) that already contains a probability-weighted target (USD 17.11), scenario probabilities, exit P/E multiples and a trade score. Those are **outputs, not evidence**, and two of them (scenario probabilities, probability-weighted target) belong to the master synthesizer, not to this module. Downstream agents may cite the memo for a fact it sources, but must not adopt its target, its multiples, or its case weights as an input — that would be marking the engine's own homework.

## 6A. Method Readiness Matrix

Method validity is set by the Business-Type Method Map for a **Financial (bank)** issuer: value equity directly, discount at the cost of equity, use P/E and P/tangible-book, and do **not** use EV-based multiples, an FCFF DCF, or the EV bridge as a value.

| Method | Ready? (Y/N) | Blocking Missing Inputs | Notes |
|---|---|---|---|
| Own-history multiples | **Y** | None | P/LTM EPS, P/NTM EPS, P/BV, P/TangBV with quarterly Average/High/Low/Close, 2025-03-31 → 2026-08-28. **Window is six quarters, not 3–5 years** — the company only listed in Dec-2021 and the export goes no further back. `02` states the short window, states "Not assessable" on the sector-cycle check, and does not present a six-quarter band as a settled "normal" |
| Peer relative valuation | **Y** | None | 10 named LatAm financial peers, LTM P/E and P/TangBV plus NTM P/E, as-of 2026-08-29. Subject 19.5× LTM P/E and 5.7× P/TangBV against peer medians of 8.5× and 1.8× — a large premium `03` must test as *warranted or not* (NU's growth and returns vs incumbent banks), never asserted either way. Peer set is a single-date snapshot with no peer multiple history |
| Intrinsic DCF (Operating FCFF) | **N — method-invalid, not data-blocked** | n/a | An FCFF DCF is explicitly excluded for a Financial by the Business-Type Method Map. LTM cash from operations is −USD 10,304.8m because loan-book and deposit growth flow through operating cash flow, so an "FCF base" here would be an artefact. **`04` runs a dividend-discount or residual-income / excess-return-on-equity model instead**, discounting at the cost of equity. Inputs for that are present: forward EPS and forward book value per share (Estimates `Consensus`), equity USD 13.25bn, and the return-on-equity series in CIQ `Ratios` |
| Reverse DCF | **Y** | None | Runs off `04`'s model, not a fresh one. `05` inverts the SAME residual-income / DDM at USD 14.30 and solves for the implied growth in earnings and book value. Note for the cost-of-capital reality test: the pool carries an S&P Global Ratings export and a Fixed Income Securities Summary (2,299 rows) for the cost-of-debt and credit read, and the operating cash flows are Brazilian real / Mexican peso — so a country-risk premium is **required**, not optional (WACC sanity bounds, emerging-market floor) |
| SOTP | **N** | Not a missing input — the company reports one segment | Banking = 100% of FY2025 revenue and of pre-tax profit. `06` returns the "single-segment — SOTP collapses to the consolidated read" note and does not fabricate a breakup. The Brazil 91% / Mexico 7% / Other 2% geographic split may be used as a labelled sanity check only; there is no segment EBIT by geography and no matched forward comparable per geography, so a geographic SOTP would be exactly the "trailing base × mismatched multiple" the rules forbid |

## 6. Sufficiency Verdict

- **Verdict: Sufficient**
- **Reason:** the pool carries a complete earnings and cash-flow base, a full bank-template capital structure, a dated pool-verified current price, a full consensus estimate strip (including forward book value per share), an own-history multiple series and a 10-name peer comps export — with **zero extraction failures** — so four independent valuation methods can run.
- **Methods that can run:** own-history multiples (`02`), peer relative valuation (`03`), intrinsic equity valuation via residual-income / dividend-discount on the cost of equity (`04` — replacing the FCFF DCF, which is invalid for a bank), and reverse-DCF inverting that same model (`05`). SOTP (`06`) does not apply: one reportable segment.
- **Active partial-data caps:** none — no row in the Partial-Data table fires.
- **Critical missing items:** none that block the module. Four items must nonetheless be carried into the downstream work as stated limitations, not as silent assumptions:
  - **No sector-level or peer-level multiple history.** `02` and `03` each write "Not assessable — no sector-level multiple history"; `99` records the gap in its Reconciliation. No cap by itself, but neither method's level may be treated as a stable anchor.
  - **Own-history multiple window is six quarters (2025-03-31 → 2026-08-28), not 3–5 years.** `02` must say so in its own report.
  - **`balance-sheet-survival/01_capital-structure-and-leverage.md` has not been produced in this run root.** `01` builds total debt from the Q2 2026 interim and FY2025 20-F debt notes directly and states that it did, rather than inheriting a figure that does not exist or defaulting to the CIQ vendor aggregate.
  - **Price staleness is at the threshold (≈5–6 trading days).** `01` counts the trading days explicitly, documents a refresh attempt, and applies the valuation-confidence max 70 cap if the count exceeds five.



---

## valuation / 01_price-and-capital-structure.md

_Source: `01_price-and-capital-structure.md`_

# Price & Capital Structure — NU

**Scope note.** This agent fixes the anchor numbers only: price, share count, market capitalisation, the enterprise-value bridge, net debt, and per-share reference values. It makes no valuation judgement — no multiple, no peer comparison, no fair value. Those belong to `02`–`07`.

**Reporting basis.** IFRS Accounting Standards as issued by the IASB (interim statements under IAS 34); presentation currency **US dollar (USD)**; fiscal year ends 31 December [FY2025 20-F, cover page and Note 2; Q2 2026 Interim Report (Aug-14-2026), KPMG review report]. Nu Holdings is a US-listed **foreign private issuer** filing Form 20-F, so the absence of a 10-K / 10-Q / 8-K / DEF 14A is not a data gap (CLAUDE.md §27).

**Business type — read this before using the EV bridge.** The `00` triage classifies NU as a **Financial (bank)**. Under the MODULE_RULES Business-Type Method Map, EV-based multiples, an FCFF DCF, and **the EV bridge as a value** are all invalid for this issuer. Section 4 below is therefore built for completeness and cross-checking only, and is labelled informational throughout. The base a valuation actually runs on here is **equity**: book value, tangible book value, and earnings.

**Cross-module note.** `balance-sheet-survival/01_capital-structure-and-leverage.md` was **not produced in this run root** (only `00_solvency-data-triage.md` exists). There is therefore no inherited filing-based canonical net-debt figure. Per the Cross-Module Inputs rule, this agent builds total debt **directly from the Q2 2026 interim filing's own notes** (Note 24 borrowings, Note 21 repurchase agreements, and the lease-liability line) rather than adopting the Capital IQ vendor aggregate, and states the reconciliation in §4 and §7. `earnings/01_historical-financials.md` is available and was used as a cross-check.

**Duplicate-copy note.** The pool carries several Capital IQ exports twice and the filings three times. One copy of each has been used: the Q2 2026 interim financials from `Nu_Holdings_Ltd_-_Form_Interim_Report(Aug-14-2026).pdf`, and the CIQ balance sheet from `Nu Holdings Ltd NYSE NU Financials Balance Sheet.xls` → tab `Balance Sheet`. No figure enters this report twice under two filenames.

---

## 1. Current Price

| Field | Value | Source | As-of Date |
|---|---|---|---|
| **Decision line** (ticker · venue · currency) | **NYSE:NU · New York Stock Exchange · USD** — Class A Ordinary Shares (not an ADR, so no depositary fee) | `Nu Holdings Ltd NYSE NU Equity Listings.xls` → tab `Equity Listings` (primary listing, shown in bold); FY2025 20-F, Item 4 | 2026-08-28 |
| Current price (anchor) | **USD 14.30** | `Company Comparable Analysis Nu Holdings Ltd .xls` → tab `Financial Data`, subject row "Day Close Price Latest"; corroborated by `NuHoldingsLtdNYSENUEstimatesReport.xls` → tab `Consensus`, Market Summary ("Latest Price/Last Close Price 14.30/14.30") and by `… Equity Listings` → `Last Close Price 14.3`, Trade Date 2026-08-28 | 2026-08-28 close (export as-of 2026-08-29) |
| Currency | US dollar (USD) | `… Equity Listings`, Currency column | 2026-08-28 |
| Price basis | **Last close** — pool-sourced, exchange close, date disclosed inside the export | `… Equity Listings`, Trade Date field | 2026-08-28 |
| Fresher indicative quote (context only) | USD 15.37 — *Indicative price, web-sourced as of 2026-09-04, not from data pool — unverified* | Web: stockanalysis.com quote page and investing.com historical-data page, both read 2026-09-06, both reporting a 2026-09-04 close of USD 15.37 (agree exactly, within the ~1% corroboration test) | 2026-09-04 close |

**Why the as-of date is real, not a download date.** The Capital IQ `Equity Listings` export carries its own `Trade Date` field of 2026-08-28 for every line, and the comps workbook carries `As-Of Date: 2026-08-29`. The price's own as-of is therefore disclosed, not inferred from a file timestamp. Price-state is **`pool-verified`**.

**The 14.88 divergence — named, not adopted.** A second Capital IQ read of USD **14.88** sits in `Nu Holdings Ltd NYSE NU Financials Key Stats.xls` → tab `Key Stats`, "Current Capitalization → Share Price". That figure is **undated in the export** — it carries no trade date and matches none of the dated prices in the pool (the `Historical Capitalization` tab prices the Jun-30-2026 balance sheet at USD 13.93 as of 2026-08-13). The dated USD 14.30 is adopted as the anchor; USD 14.88 is recorded here as an undated vendor divergence of +4.1% and is **not** used anywhere downstream. Anyone finding a market cap of USD 71,880.6m in the Key Stats tab is looking at the 14.88 figure, not this module's anchor.

**Price staleness — counted, refreshed, and handed to `99`.**
- Anchor as-of: 2026-08-28 (Friday close). Run date: 2026-09-06 (Sunday). Calendar age **9 days**.
- Exact count of trading sessions since the anchor close: **5** (Aug 31, Sep 1, Sep 2, Sep 3, Sep 4).
- The MODULE_RULES conversion (`calendar days × 5/7`) gives **6.4 trading days**.
- The two counts straddle the ">5 trading days" line. Per CLAUDE.md §4 (use the more conservative interpretation when readings conflict), treat the anchor as **stale**: `99` applies **valuation confidence max 70**. It does *not* reach the >15-trading-day tier.
- **Refresh attempted, and it succeeded on an indicative basis.** No fresher price exists anywhere in the data pool — the Key Stats 14.88 is undated and so cannot serve as a refresh, and the IBKR files in this pool are the user's personal Indian tax pack, not a price screenshot. A web refresh was then attempted and returned **USD 15.37 at the 2026-09-04 close**, reported identically by two independent sources (stockanalysis.com and investing.com). That is **+7.48%** above the pool anchor.
- **Consequence for `07` and `99` (Price freshness — re-anchor, don't just cap).** The pool price stays the `pool-verified` anchor, but the drift is material. `07` and `99` must present margin of safety and downside-to-bear **at both prices** — USD 14.30 (pool-verified, 2026-08-28) and USD 15.37 (indicative, web-sourced, 2026-09-04) — each labelled, leading with the fresher read. The fair-value **levels** are price-independent, so re-anchoring is a one-step recomputation: return = `(level − price) / price`.

### Other listed lines

Nu Holdings has **nine active listings** across seven venues. All are the same economic Class A ordinary share, reached through different wrappers. Every line below is priced at the **2026-08-28** close — the same date as the decision-line anchor — except Boerse Muenchen (2026-08-27).

| Listed line | Ticker · venue | Currency | Price | As-of | Ratio to 1 ordinary share | Price per ordinary share, own currency | Premium / (discount) vs decision line, same-currency | Notes for a holder of this line |
|---|---|---|---:|---|---|---:|---:|---|
| Class A ordinary (decision line) | NYSE:NU · New York Stock Exchange | USD | 14.30 | 2026-08-28 | 1:1 | USD 14.30 | — | 3-month average volume 76.82m shares — by far the deepest line. 52-week range 18.98 / 11.20 |
| CEDEAR (USD-settled) | BASE:NUD · Buenos Aires | **USD** | 7.51 | 2026-08-28 | 2 CEDEARs = 1 ordinary | **USD 15.02** | **+5.03%** | **The only cross-line gap measurable with no FX assumption.** Same currency, same date. 3-month average volume 0.09m — thin |
| BDR Level I | BOVESPA:ROXO34 · São Paulo | BRL | 12.33 | 2026-08-28 | 6 BDRs = 1 ordinary | BRL 73.98 | Not computable — no sourced FX (see below) | Depositary Banco Bradesco S.A.; a BDR carries a depositary fee and Brazilian tax treatment the NYSE line does not. 3-month average volume 7.11m BDRs |
| CEDEAR (ARS-settled) | BASE:NU · Buenos Aires | ARS | 11,500 | 2026-08-28 | 2 CEDEARs = 1 ordinary | ARS 23,000 | Not computable — no sourced FX | Argentine capital-control and implied-FX effects sit inside this price. Volume 0.63m |
| Class A ordinary | BVC:NUCO · Bolsa de Valores de Colombia | COP | 46,200 | 2026-08-28 | 1:1 | COP 46,200 | Not computable — no sourced FX | Volume 0.09m — thin |
| Class A ordinary | BMV:NU N · Bolsa Mexicana de Valores | MXN | 243.68 | 2026-08-28 | 1:1 | MXN 243.68 | Not computable — no sourced FX | Volume 0.03m — thin |
| Class A ordinary | BIT:1NUH · Borsa Italiana | EUR | 12.45 | 2026-08-28 | 1:1 | EUR 12.45 | Not computable — no sourced FX | 3-month average volume reported as 0 |
| Class A ordinary | DB:M1Z · Deutsche Boerse | EUR | 12.32 | 2026-08-28 | 1:1 | EUR 12.32 | Not computable — no sourced FX | 3-month average volume reported as 0 |
| Class A ordinary | MUN:M1Z · Boerse Muenchen | EUR | 12.79 | **2026-08-27** | 1:1 | EUR 12.79 | Not computable — no sourced FX | Different (older) trade date and 3-month average volume 0 — a stale, illiquid print, not a tradable gap |

Source for the whole table: `Nu Holdings Ltd NYSE NU Equity Listings.xls` → tab `Equity Listings` (exchange, ticker, security name carrying the ratio, currency, trade date, last close, 52-week range, 3-month average volume).

**Why NYSE:NU is the decision line.** It is Capital IQ's flagged primary listing, it is the ordinary share itself rather than a depositary receipt, it is quoted in the company's own reporting currency (USD), and its 3-month average volume of 76.82m shares is roughly ten times the next-deepest line. Every fair value, margin of safety, downside-to-bear, and yield produced by this module belongs to **this** line and to no other.

**FX limitation, stated honestly.** The data pool contains **no dated USD cross-rates for BRL, ARS, COP, MXN or EUR** on 2026-08-28. (The only FX table in the pool — `Interactive_Brokers_Consolidated_Tax_Report_FY2025-26.xlsx` → tab `IBKR - SBI FX Rates` — is an INR-based table for the Indian tax year to 2026-03-31 and is useless here.) A same-currency premium/discount for the non-USD lines is therefore **not computable from pool evidence**, and rather than import an unverified web rate for six lines this report states the **implied parity cross-rate** each line would need for zero gap, and lets the reader judge plausibility:

| Line | Price per ordinary share | Implied parity rate vs USD 14.30 | Read |
|---|---:|---:|---|
| BOVESPA:ROXO34 | BRL 73.98 | **5.17 BRL/USD** | A plausible BRL/USD level. This also **resolves the ratio conflict** the `00` triage flagged: the CIQ Consensus Market Summary field "Common Shares Per ADR = 1" for ROXO34 cannot be right — at 1:1 the implied rate would be 0.86 BRL/USD, which is absurd. The `Equity Listings` security name "BDR EACH 6 REPR 1 ORD SHS" is the correct ratio, and **6:1 is what this module uses.** |
| BASE:NU | ARS 23,000 | 1,608 ARS/USD | Plausible order of magnitude for a CEDEAR-implied Argentine rate |
| BVC:NUCO | COP 46,200 | 3,231 COP/USD | Plausible COP/USD level |
| BMV:NU N | MXN 243.68 | 17.04 MXN/USD | Plausible MXN/USD level |
| BIT:1NUH | EUR 12.45 | 0.871 EUR/USD (≈ 1.149 USD/EUR) | The two liquid-listed European lines imply rates 1.1% apart — internally consistent, so no material gap is evidenced |
| DB:M1Z | EUR 12.32 | 0.862 EUR/USD (≈ 1.161 USD/EUR) | as above |
| MUN:M1Z | EUR 12.79 | 0.894 EUR/USD (≈ 1.118 USD/EUR) | Implies a ~2.7% gap vs DB:M1Z, but the print is a day older with zero reported volume — a stale mark, not a tradable difference |

**The one material cross-line fact.** `BASE:NUD` (the USD-settled Argentine CEDEAR) prices the ordinary share at **USD 15.02 against USD 14.30 on the NYSE on the same day — a +5.0% premium, with no FX assumption anywhere in the comparison.** That is a real, tradable difference in what a holder of that line paid. It is a capital-control / cross-border-access premium on a line with 0.09m average daily volume, **not** evidence about fair value, and nothing in this module's fair value transfers to it.

**A second CIQ units defect, named so nobody uses it.** The Estimates `Consensus` tab reports a `BOVESPA:ROXO34` mean target price of **3.56** under a header reading "(USD)", while the same block reports the ROXO34 price as **12.33** in "Brazilian Real". Those two numbers are not on the same basis, and Capital IQ's own "Potential Upside" cell for ROXO34 is blank ("-/-") — the vendor did not compute it either. **The ROXO34 target price is unusable as published and must not be quoted by any downstream agent.** The NYSE:NU consensus target (mean USD 18.78 / median USD 19.00, 22 contributors) is the only target on a clean basis, and it belongs to `03`/`07`, not to this agent.

---

## 2. Share Count

| Field | Value | Source |
|---|---:|---|
| Class A ordinary shares issued and outstanding (net of treasury), as of Jun-30-2026 | 3,808,087,961 | Q2 2026 Interim Report (Aug-14-2026), Note 31 (Equity), share roll-forward |
| Class B ordinary shares issued and outstanding, as of Jun-30-2026 | 1,022,600,698 | Q2 2026 Interim Report, Note 31 |
| **Total ordinary shares outstanding, as of Jun-30-2026** | **4,830,688,659** (4,830.7m) | Q2 2026 Interim Report, Note 31; independently matched by CIQ `Balance Sheet` → "Total Shares Out. on Filing Date" 4,830.688659m and by comps `Financial Data` → "Shares Outstanding Latest" 4,830.7m |
| Treasury shares held (Class A), Jun-30-2026 | 40,659,600 (already deducted above) | Q2 2026 Interim Report, Note 31(a) and 31(e)(i) |
| Basic weighted-average shares, Q2 2026 | 4,857,131 thousand (4,857.1m) | Q2 2026 Interim Report, Note 9 |
| **Diluted weighted-average shares, Q2 2026** | **4,904,837 thousand (4,904.8m)** | Q2 2026 Interim Report, Note 9 |
| Diluted weighted-average shares, H1 2026 | 4,908,841 thousand (4,908.8m) | Q2 2026 Interim Report, Note 9 |
| Dilutive adjustment, Q2 2026 — share-based payment (SOPs + RSUs) | +44,667 thousand | Q2 2026 Interim Report, Note 9 |
| Dilutive adjustment, Q2 2026 — business acquisition contingent shares | +3,039 thousand | Q2 2026 Interim Report, Note 9 |
| Antidilutive instruments **excluded** from the diluted count, Q2 2026 | 14,675 thousand (26,050 thousand for H1) | Q2 2026 Interim Report, Note 9 |
| Authorised and unissued shares reserved for share-based payments | 228,167,482 | Q2 2026 Interim Report, Note 31 |
| Convertibles / other potential shares | **None.** No convertible debt exists. Class B converts 1:1 into Class A and is already counted in the 4,830.7m total | FY2025 20-F, Item 7 / Item 10 (Class B convertible one-for-one); Q2 2026 Interim Report, Note 24 (borrowings are financial bills and a margin loan facility — no convertible instrument) |
| **Fully diluted shares (TSM + if-converted), point-in-time** | **4,878,395 thousand (4,878.4m)** | Build shown below |
| **Share count used for market cap** | **4,830,688,659 (4,830.7m)** — point-in-time shares outstanding | Q2 2026 Interim Report, Note 31 |
| **Share count used for per-share fair value** | **4,878,395 thousand (4,878.4m)** — fully diluted | Build shown below |

### Share Count Reconciliation Table

| Step | Shares (thousands) | Basis |
|---|---:|---|
| Class A ordinary outstanding, Jun-30-2026 (net of 40,659,600 treasury) | 3,808,088 | Interim Note 31 |
| + Class B ordinary outstanding, Jun-30-2026 (convertible 1:1 into Class A) | 1,022,601 | Interim Note 31 |
| **= Total shares outstanding — used for market cap** | **4,830,689** | |
| + Options / RSUs, treasury-stock method (the Q2 2026 dilutive increment the company itself computed) | 44,667 | Interim Note 9 |
| + Business-acquisition contingent shares | 3,039 | Interim Note 9 |
| + Convertible securities, if-converted | 0 | No convertibles outstanding |
| **= Fully diluted shares — used for per-share fair value** | **4,878,395** | |
| *Memo: antidilutive instruments not included* | *14,675* | *Interim Note 9 — excluded because they are antidilutive at the current price* |

**Why both counts, and which does what.** Market capitalisation multiplies the shares that actually exist today (4,830.7m) by today's price — this is the MODULE_RULES Fully Diluted Equity Rule 1, and it reproduces the vendor market cap exactly (§3). Per-share fair value divides by the fully diluted count (4,878.4m), because a fair value is a claim per share after the options and RSUs already granted are settled. The gap between the two is **47.7m shares, or 0.99%** — under 1%, so it does not move any per-share figure by more than about a cent. This is a genuinely low-dilution share base for a company whose employee incentive plan is entirely share-settled.

**Both share classes are counted, and this matters by 21%.** Only Class A is listed; Class B is unlisted, holds 74.3% of voting power, and is convertible one-for-one into Class A [FY2025 20-F, Item 3.D / Item 7]. Because Class B has identical economic rights and converts 1:1, market capitalisation is computed on the **total** 4,830.7m, not on the 3,808.1m Class A alone. Capital IQ does the same, pricing both classes at the Class A price [`Key Stats` → Current Capitalization, "+ Class B Ordinary Shares Shares Out 1,022.600698 × Class B Ordinary Shares Share Price"]. **Using the Class A count alone would understate market capitalisation by 21.2%** (3,808.1 / 4,830.7 − 1). Any downstream agent quoting a market cap near USD 54.5bn has made this error.

**Weighted-average versus point-in-time.** The basic weighted average for Q2 2026 (4,857.1m) is *above* the Jun-30-2026 outstanding count (4,830.7m) because the company bought back 40.7m Class A shares during the quarter. Trailing per-share metrics (LTM diluted EPS of USD 0.734, CIQ `Key Stats`) are computed on weighted-average counts and should not be mixed with the point-in-time counts used for market cap and fair value.

---

## 3. Market Capitalization

`Market cap = shares outstanding × current price`

**At the pool-verified anchor (USD 14.30, 2026-08-28 close):**

`4,830,688,659 × USD 14.30 = USD 69,078.8m` (USD 69.08bn)

This ties exactly to the vendor's own figure — comps `Financial Data`, subject row "Market Capitalization Latest" = 69,078.8 — which is a clean check that the share count and price used here are the same two numbers Capital IQ used.

**At the fresher indicative quote (USD 15.37, 2026-09-04 close, web-sourced, unverified):**

`4,830,688,659 × USD 15.37 = USD 74,247.7m` (USD 74.25bn) — **+7.48%** versus the anchor.

*Memo only, not the market cap:* on the fully diluted count, `4,878,395 thousand × USD 14.30 = USD 69,761.1m`. This is shown so downstream agents can see the size of the dilution effect (+USD 682m, +0.99%); the market cap figure to use is **USD 69,078.8m**.

**Undated vendor alternative, for reference only:** the CIQ `Key Stats` tab shows Market Capitalization 71,880.6m at its undated share price of 14.88. Not adopted (§1).

---

## 4. Enterprise Value Bridge

> **INFORMATIONAL ONLY — do not use this EV as a value.** NU is a Financial (bank). Under the MODULE_RULES Business-Type Method Map, EV-based multiples and the EV bridge as a value are invalid for this issuer, and no downstream agent may build an EV/EBITDA, EV/EBIT or EV/Sales read on it. The reason is visible in the bridge itself: it excludes **deposits of USD 45,328.4m** and **payables to network of USD 15,541.7m**, which together are USD 60.9bn of the bank's actual funding [Q2 2026 Interim Report, statement of financial position, Notes 22 and 23]. An "enterprise value" that ignores 74% of a bank's liabilities is an arithmetic exercise, not an economic quantity. It is built here because the Report Structure requires it and because the component parts (debt, cash, minority interest, associates) are themselves needed for §5 and §6.

All balance-sheet components are as of **Jun-30-2026**, from the KPMG-reviewed IAS 34 interim statements.

| Component | Amount (USD m) | Source |
|---|---:|---|
| Market capitalization (at USD 14.30) | 69,078.8 | §3 above |
| + Total debt (canonical, filing-built — see build below) | 5,807.0 | Q2 2026 Interim Report: Note 24 (borrowings and financing) + Note 21 (repurchase agreements) + balance-sheet lease liabilities |
| + Minority / non-controlling interest | 2.1 | Q2 2026 Interim Report, statement of financial position, "Equity attributable to non-controlling interests" 2,051 thousand |
| + Preferred equity | 0.0 | Q2 2026 Interim Report — no preferred class in the equity statement; CIQ `Key Stats` "Book Value of Pref. Equity" = "–"; comps `Financial Data` "LTM Total Pref. Equity" = "–" |
| + Operating lease liabilities | *already inside total debt (66.4)* | Q2 2026 Interim Report, balance sheet "Lease liabilities" 66,433 thousand |
| + Underfunded pension / other long-term obligations | 0.0 | CIQ `Nu Holdings Ltd NYSE NU Financials.xls` → tab `Pension OPEB` carries no funded-status figures; no defined-benefit obligation is disclosed in the interim statements |
| − Cash & equivalents | (13,551.6) | Q2 2026 Interim Report, Note 11 (Cash and Cash Equivalents), 13,551,611 thousand |
| − Equity-method investments (investments in associates) | (93.0) | Q2 2026 Interim Report, statement of financial position, "Investments in associates" 93,004 thousand |
| **= Enterprise value (informational only)** | **61,243.3** | 69,078.8 + 5,807.0 + 2.1 + 0.0 − 13,551.6 − 93.0 |

At the fresher indicative price of USD 15.37 the same bridge gives **USD 66,412.2m**. No plug is used; every line is sourced and the arithmetic is shown.

### Total debt — built from the filing, with the vendor gap named

| Build | Amount (USD m) | Source |
|---|---:|---|
| Borrowings and financing (the company's own debt note) | 4,682.3 | Q2 2026 Interim Report, **Note 24** — financial bills 2,814.3 + margin loan credit facility 1,867.9 = 4,682,252 thousand |
| + Repurchase agreements (secured wholesale funding) | 1,058.3 | Q2 2026 Interim Report, **Note 21**, 1,058,343 thousand |
| + Lease liabilities | 66.4 | Q2 2026 Interim Report, balance sheet, 66,433 thousand |
| **= Total debt (canonical for this run)** | **5,807.0** | |
| *Memo: debt-note-only figure (Note 24 alone)* | *4,682.3* | *The narrowest defensible definition — what the company itself labels "borrowings and financing"* |
| *Memo: Capital IQ vendor "Total Debt"* | *5,896.7* | *CIQ `Balance Sheet`, as-of Jun-30-2026; `ciq_facts.json` `total_debt_m` = 5,896.7, status `present`* |

**Reconciliation of the vendor figure — the gap is named, not silently dropped.** The Capital IQ aggregate of **USD 5,896.7m** exceeds the filing-built canonical figure of **USD 5,807.0m** by exactly **USD 89.7m**, which is the interim balance sheet's **derivative financial liabilities** (89,659 thousand, Note 20). Capital IQ folds derivative liabilities into its "Short-term Borrowings" line (1,148.002 = repurchase agreements 1,058.343 + derivatives 89.659). Derivatives are hedging instruments carried at fair value, not borrowed money, so they are excluded from the canonical debt figure here. The reconciliation is exact and leaves no residual:

`4,682.252 (Note 24) + 1,058.343 (Note 21) + 66.433 (leases) + 89.659 (derivatives) = 5,896.687 = CIQ Total Debt`

I hold the vendor figure and I am **not** using it in the bridge; the filing-built 5,807.0 is canonical (CLAUDE.md §4 — filings beat vendor exports). This is a 1.5% difference and changes nothing material, but the basis is stated so no downstream agent has to guess which number it inherited.

**`ciq_facts.json` reconciliation.** The sidecar reports `total_debt_m` = 5,896.7 (`present`) and `net_debt_m` = −9,274.2 (`present`, with its own warning that the basis "may net short-term/liquid investments"). Both are correctly read from the workbook; this agent's figures differ only by the two definitional choices named above (derivatives excluded from debt; short-term investments excluded from cash), and both are labelled. This is a definition gap, not a misread.

### Cash quality — what is netted, and what is deliberately not

**Netted (USD 13,551.6m).** The filing's own "Cash and cash equivalents" line, whose four components are all genuine IAS 7 equivalents with original maturities of three months or less [Q2 2026 Interim Report, Note 11]:

| Component | USD m | Comment |
|---|---:|---|
| Deposits at central banks | 7,741.9 | Held by the Brazilian, Colombian and Mexican subsidiaries. In Brazil remunerated at 100% of the CDI rate with **daily maturity** — liquid, not term-locked |
| Reverse repurchase agreements | 3,096.4 | Overnight, collateralised by Mexican and Colombian government bonds |
| Bank balances | 2,101.7 | |
| Short-term investments | 611.6 | Mainly USD, fixed-rate, averaging 3.6% |
| **Total** | **13,551.6** | |

**Deliberately NOT netted:**

| Excluded item | USD m | Why |
|---|---:|---|
| Compulsory and other deposits at central banks | 9,149.1 | **Restricted.** Regulatory reserve requirements; the filing classifies these inside financial assets at amortised cost, not cash [Interim, Note 15]. Capital IQ also holds them out of cash, labelling them "Restricted Cash". Netting these would flatter net cash by 68% |
| Securities at FVOCI | 14,046.8 | Long-tenor mark-to-market portfolio [Interim, Note 12] |
| Securities at amortised cost | 3,776.5 | [Interim, Note 12] |
| Securities at FVTPL | 1,358.0 | Mark-to-market through profit or loss [Interim, Note 12] |
| Derivatives (asset side) | 115.3 | [Interim, Note 20] |

**The vendor's cash definition is not adopted.** Capital IQ shows "Cash And Equivalents" of **10,455.2m** — USD 3,096.4m below the filing's own figure, exactly the reverse-repurchase-agreement leg, which the vendor reclassifies out of cash. It separately shows "Total Cash & ST Investments" of **15,170.8m**, i.e. USD 1,619.2m *above* the filing's cash line, by adding a slice of the securities book. Neither is used as "cash & equivalents" here: the filing's own USD 13,551.6m is (CLAUDE.md §5 — cite the source the number came from, and prefer the filing where it carries its own figure for the same line item).

**The real cash-quality caveat is location, not liquidity.** These balances are genuinely liquid, but they sit inside **regulated banking subsidiaries** — Nu Pagamentos and Nu Financeira in Brazil and their Mexican and Colombian equivalents — whose ability to upstream cash to the Cayman holding company is limited by local capital and regulatory rules. The 20-F says this plainly: the holding company "is a holding company with no material assets other than the ownership interests in our subsidiaries, and we are therefore dependent upon the results of operations of and, in turn, the payments, dividends and distributions from, our subsidiaries," and notes the risk of "legal restrictions on dividend distributions by our local [subsidiaries]" [FY2025 20-F, Item 3.D risk factors]. So the net cash in §5 is not free corporate cash available to a holder — it is a bank's working liquidity, most of which is required to run the bank.

### Adjustments deliberately NOT made

| Adjustment | Made? | Why |
|---|---|---|
| Operating lease liabilities capitalised separately | No — already included | Under IFRS 16 the USD 66.4m lease liability is already on the balance sheet and already inside total debt. No off-balance-sheet lease add-back exists |
| Underfunded pension / OPEB | No | No defined-benefit obligation disclosed; the CIQ `Pension OPEB` tab is empty of funded-status figures |
| Deposits (USD 45,328.4m) and payables to network (USD 15,541.7m) | **No** | These are a bank's operating funding, not debt. Excluding them is the standard convention **and is precisely why this EV figure is meaningless as a value for this issuer** |
| Deferred tax assets (USD 3,649.1m) | No | Not a claim on or a source of enterprise value; relevant to book value, not to the bridge |
| Provisions and contingent liabilities (USD 44.3m) | No | Immaterial at 0.06% of market cap [Interim, Note 25] |
| Non-controlling-interest reclassification | Flagged, not adjusted | NCI fell from USD 30.6m at Dec-31-2025 to **USD 2.1m** at Jun-30-2026, because the portion relating to investment-fund quotas (USD 26.4m) was reclassified into a liability line, "Obligations for quotas of investment funds" [Interim, statement of financial position and Note 2 accounting-policy paragraph]. This shrinks the NCI add-back in the bridge by USD 26.4m. At 0.04% of market cap it changes nothing, but the reason for the year-on-year drop is stated so nobody reads it as a disposal |

---

## 5. Net Debt & Leverage Snapshot

All figures as of Jun-30-2026, USD millions.

| Metric | Value | Source |
|---|---:|---|
| Total debt (canonical — §4 above) | 5,807.0 | Q2 2026 Interim Report, Notes 24 + 21 + lease liabilities |
| Cash & equivalents | 13,551.6 | Q2 2026 Interim Report, Note 11 |
| **Net debt (strict, §15: total debt − cash & equivalents)** | **(7,744.6) — i.e. NET CASH of USD 7,744.6m** | `5,807.0 − 13,551.6 = −7,744.6` |
| *Variant: strict basis on the debt-note-only debt figure* | *(8,869.4) — net cash USD 8,869.4m* | *`4,682.3 − 13,551.6 = −8,869.4`. Shown because "total debt" for a bank is definitionally contestable; the canonical figure above is the conservative (larger-debt) one* |
| − Liquid short-term investments (if netted) | not netted in the canonical figure | The securities portfolios are held out of cash (§4) |
| **Net debt (broad, incl. short-term investments — shown for reconciliation only, NOT canonical)** | **(9,274.2) — net cash USD 9,274.2m, BROAD BASIS** | CIQ `Balance Sheet` "Net Debt"; `ciq_facts.json` `net_debt_m` = −9,274.2. Build: CIQ total debt 5,896.7 − CIQ "Total Cash & ST Investments" 15,170.8 = −9,274.2 [CIQ `Capital Structure Summary`, Jun-30-2026 column] |
| Net debt / latest EBITDA | **Not applicable** | NU reports on Capital IQ's **Bank** template, which has no EBITDA line: `ciq_facts.json` `ltm_ebitda_m` = `unknown` ("Income Statement sheet has no 'EBITDA' row") and `net_debt_ebitda_x` = `unknown`. EBITDA is not a meaningful measure for a bank, where interest is revenue and cost of revenue, not a financing item |

**Basis discipline (CLAUDE.md §15).** The canonical figure carried into §7 is the **strict** basis: **net cash of USD 7,744.6m**. The vendor's −9,274.2 is a **broad** figure (it nets short-term investments on top of a wider debt definition) and is USD 1,529.6m more favourable. It is shown only so the two can be reconciled; it is **not** labelled strict, and no downstream agent should quote it as such. Where a downstream equity bridge needs a different definition it must say so in one line, per the Anchor consistency rule — silent substitution is not allowed.

**A net-cash figure is the wrong leverage read for this business — use these instead.** For a bank, net debt says almost nothing: the balance sheet is funded by USD 45.3bn of customer deposits and USD 15.5bn of payables to network, neither of which is "debt", and the asset side is a loan book, not plant. The measures that actually describe leverage here:

| Bank leverage metric | Value | Calculation / source |
|---|---:|---|
| Total equity / total assets | **16.0%** | `13,251.7 / 82,753.4` [Q2 2026 Interim, statement of financial position] |
| Tangible common equity / total assets | **14.6%** | `12,093.2 / 82,753.4` (tangible common equity built in §6) |
| Tier 1 capital ratio | **13.4%** | CIQ `Historical Capitalization`, Jun-30-2026 column (Tier 1 capital USD 4,785.8m) |
| Total capital ratio | **15.7%** | CIQ `Historical Capitalization`, Jun-30-2026 column (total capital USD 5,597.6m) |
| Gross loans / deposits | **88.8%** | `40,274.6 / 45,328.4` [CIQ `Balance Sheet` gross loans; Interim Note 22 deposits] |
| Net loans / deposits | **74.3%** | `33,661.7 / 45,328.4` |
| Total borrowings + repos / total funding (deposits + payables to network + borrowings + repos) | **8.7%** | `5,740.6 / 66,610.7` — wholesale borrowing is a small slice of how this bank is funded [Interim, Note 22/23/24/21] |
| Debt maturity profile | Nearest borrowings mature Jul-2026; financial bills run to Jun-2029; margin loan facility to Jun-2027. **No financial restrictive covenants**; Nu Holdings guarantees none of the borrowings | Q2 2026 Interim Report, Note 24 and its Covenants / Guarantees paragraphs |

These belong to the balance-sheet-survival module, which has not run its `01` in this run root; they are recorded here so the valuation module is not left with a meaningless net-cash figure as its only leverage read.

---

## 6. Per-Share Reference Values

Two columns are given because the two share counts serve different purposes (§2). **Downstream per-share fair values divide by the fully diluted count.**

| Metric | Per share — on shares outstanding (4,830.689m) | Per share — on fully diluted (4,878.395m) | Absolute (USD m) | Source |
|---|---:|---:|---:|---|
| Book value per share | **USD 2.74** | **USD 2.72** | Equity attributable to shareholders of the parent: 13,249.7 | Q2 2026 Interim Report, statement of financial position; matches CIQ `Balance Sheet` "Book Value/Share" 2.74 |
| Tangible book value per share | **USD 2.50** | **USD 2.48** | Tangible common equity: 12,093.2 | `13,249.7 − goodwill 409.4 − other intangibles 747.1 = 12,093.2` [Q2 2026 Interim Report, Note 19]; matches CIQ `Balance Sheet` "Tangible Book Value/Share" 2.50 and comps `Financial Data` "LTM Tangible Book Value/Share" 2.5 |
| Net cash per share (strict basis) | **USD 1.60** | **USD 1.59** | Net cash 7,744.6 | §5 above — but read the caution below |
| *Memo: total equity incl. NCI per share* | *USD 2.74* | *USD 2.72* | *13,251.7* | *NCI of 2.1 is immaterial* |

Arithmetic shown: `13,249.670 / 4,830.689 = 2.743`; `12,093.198 / 4,830.689 = 2.503`; `7,744.583 / 4,830.689 = 1.603`. On the fully diluted count: `13,249.670 / 4,878.395 = 2.716`; `12,093.198 / 4,878.395 = 2.479`; `7,744.583 / 4,878.395 = 1.588`.

**Caution on net cash per share.** The USD 1.60 figure must **not** be treated as spare cash backing the share price. As §4 sets out, this is a bank's working liquidity held inside regulated subsidiaries whose capacity to upstream it is legally constrained, and the same balance sheet carries USD 60.9bn of deposits and network payables against it. It is shown because the Report Structure requires it, and it is capped with this warning so no downstream agent nets it off a fair value.

**Book value is the base that matters here.** For a Financial issuer the Method Map points at P/E and P/tangible book. The tangible book anchor for this run is **USD 2.50 per share on the outstanding count / USD 2.48 fully diluted**, and the forward book-value path (FY2026E book value per share of 3.15, rising through the strip) is in the Estimates `Consensus` tab for `04` to use.

---

## 6A. Distribution Basis

| Field | Value | Source |
|---|---|---|
| Yield basis | **None — no dividend or distribution exists.** No trailing yield, no forward yield | CIQ `Ratios` and `Cash Flow`: dividend per share reported "NA" in every year FY2021–FY2025 and total dividends paid "–" across FY2021–LTM Jun-30-2026 |
| Amount per share and period covered | USD 0.00; no distribution has ever been declared | As above |
| Ex-date and record date of most recent distribution | None — no distribution has occurred | As above |
| Is the next distribution still available to a buyer today? | **N/A — there is none, and the company says one may not come.** "We may not pay any cash dividends in the foreseeable future… There is no assurance that future dividends will be paid" [FY2025 20-F, Item 3.D]. As a Cayman Islands company there is "no minimum mandatory dividend payable to our shareholders and no established periodicity" | FY2025 20-F, Item 3.D |
| Gross or net (withholding / depositary fee) | Not applicable on the decision line. NYSE:NU is an **ordinary share**, not an ADR, so no depositary fee applies. The BDR and CEDEAR lines would carry depositary fees and local tax treatment, but there is no distribution for them to be charged against | `… Equity Listings` (Security Type "Common Stock", Security Name "Class A Ordinary Shares") |
| Yield on the decision line at the decision-line price | **0.00%** | 0 / 14.30 |

**Any downstream agent quoting a dividend yield for NU is quoting a number that does not exist. The yield is zero.**

**The only cash return is the buyback, and here is its basis.** On 3 June 2026 the board approved a repurchase programme of **up to USD 1.0bn** of Class A ordinary shares, running from 4 June 2026 to 3 June 2027. Through 30 June 2026 the company repurchased **40,659,600 Class A shares for USD 500.4m** (an average of about USD 12.31 per share), leaving **USD 499.6m** available [Q2 2026 Interim Report, Note 31(e)(i)]. If any downstream agent quotes a buyback yield, the basis is: USD 500.4m executed over roughly four weeks against a market cap of USD 69,078.8m = **0.72% of market cap executed to date**, or **1.45% annualised if the full USD 1.0bn programme is completed within its twelve-month window** — the latter being a programme authorisation, not a commitment ("The program does not obligate the Company to acquire any specific number of shares"). Do not present the authorisation as a realised return.

---

## 7. Anchor Summary (canonical numbers for downstream agents)

Use these numbers verbatim. Where an agent must depart from one, it must say so in one line and give the reason (MODULE_RULES Reconciliation Gate 1).

| Anchor | Value | Basis / caveat |
|---|---|---|
| **Decision line** | NYSE:NU · New York Stock Exchange · USD (Class A Ordinary Shares) | All fair value, margin of safety, downside-to-bear and yield belong to this line only |
| **Current price (anchor)** | **USD 14.30**, 2026-08-28 close | Pool-verified, dated, corroborated across three CIQ exports |
| **Price-state** | **`pool-verified`** | Margin of safety, downside-to-bear, observed up/down and valuation attractiveness all **unlock**. The no-price Score-Cap row does **not** fire |
| **Staleness** | 5 exact trading sessions / 6.4 on the ×5/7 conversion | Straddles the ">5 trading days" line; the conservative read applies → **`99`: valuation confidence max 70**. Refresh attempted and documented |
| **Fresher indicative price** | **USD 15.37**, 2026-09-04 close — *web-sourced, not from data pool, unverified*, corroborated by two independent sources agreeing exactly | **+7.48%** above the anchor. `07`/`99` must show the price-relative reads at BOTH prices, leading with the fresher one (Price freshness — re-anchor, don't just cap) |
| **Currency** | **USD** (presentation currency). IFRS as issued by the IASB. Fiscal year ends 31 December | Subsidiary functional currencies are BRL, MXN and COP — every USD fair value carries FX translation risk not visible in the headline [FY2025 20-F, Note 2.a] |
| **Shares (market cap)** | **4,830,688,659** (4,830.7m) — total Class A 3,808,087,961 + Class B 1,022,600,698, Jun-30-2026 | Q2 2026 Interim Report, Note 31. **Both classes**; the Class A count alone understates market cap by 21.2% |
| **Shares (per-share fair value)** | **4,878,395 thousand** (4,878.4m) fully diluted | Outstanding + 44,667k options/RSUs on the treasury-stock method + 3,039k acquisition shares [Interim, Note 9]. No convertibles. Dilution is 0.99% |
| **Market cap** | **USD 69,078.8m** at USD 14.30 (USD 74,247.7m at USD 15.37) | Ties exactly to CIQ comps `Financial Data` |
| **Total debt (canonical)** | **USD 5,807.0m** | Built from the filing: Note 24 borrowings 4,682.3 + Note 21 repos 1,058.3 + leases 66.4 |
| **Net debt (canonical)** | **NET CASH of USD 7,744.6m — STRICT basis (total debt − cash & equivalents)** | `5,807.0 − 13,551.6`. **A net-cash figure is a weak leverage read for a bank** — use equity/assets 16.0%, tangible common equity/assets 14.6%, Tier 1 13.4%, total capital 15.7%, gross loans/deposits 88.8% |
| **Cash & equivalents** | **USD 13,551.6m** | The filing's own Note 11 figure — not the vendor's 10,455.2 and not the vendor's cash-plus-investments 15,170.8 |
| **Enterprise value** | **USD 61,243.3m at USD 14.30 — INFORMATIONAL ONLY, INVALID AS A VALUE** | Financial (bank): the Method Map bars EV multiples and the EV bridge as a value. The bridge omits USD 60.9bn of deposits and network payables |
| **Book value per share** | **USD 2.74** outstanding / **USD 2.72** fully diluted | Equity attributable to parent USD 13,249.7m, Jun-30-2026 |
| **Tangible book value per share** | **USD 2.50** outstanding / **USD 2.48** fully diluted | Tangible common equity USD 12,093.2m |
| **Distribution basis** | **None quoted — dividend yield is 0.00%.** Only cash return is a USD 1.0bn buyback authorisation (USD 500.4m executed to Jun-30-2026, USD 499.6m remaining) | No dividend has ever been paid and the 20-F says none may come |

**`balance-sheet-survival/01` did not run in this run root.** There is no inherited filing-based canonical net-debt figure. This agent therefore built total debt directly from the Q2 2026 interim filing's own notes.

**Vendor reconciliation, carried in the Anchor Summary so it travels with the number.** This agent also holds the Capital IQ aggregates and does **not** use them. (a) Vendor "Total Debt" of USD 5,896.7m exceeds the filing-built USD 5,807.0m by exactly USD 89.7m, which is derivative financial liabilities [Interim, Note 20] — hedging instruments, not borrowed money. (b) Vendor "Net Debt" of −USD 9,274.2m is a **broad** figure (it also nets USD 1,619.2m of short-term investments into cash) and is USD 1,529.6m more favourable than the strict figure above; it must never be quoted as "strict". (c) Vendor "Cash And Equivalents" of USD 10,455.2m is USD 3,096.4m *below* the filing's own cash line because the vendor reclassifies reverse repurchase agreements out of cash. The filing wins on all three (CLAUDE.md §4).

### Anchor Block (copy-forward)

- **Decision line:** NYSE:NU · New York Stock Exchange · USD (Class A Ordinary Shares) — every downstream fair value, margin of safety, and yield is on THIS line
- **Other listed lines:** BOVESPA:ROXO34 (BRL, BDR 6:1, premium/discount not computable — no sourced FX in pool); BASE:NUD (USD CEDEAR 2:1, **+5.03%** vs decision line, same currency, same date 2026-08-28, no FX needed); BASE:NU (ARS CEDEAR 2:1, not computable); BVC:NUCO (COP, not computable); BMV:NU N (MXN, not computable); BIT:1NUH (EUR, not computable); DB:M1Z (EUR, not computable); MUN:M1Z (EUR, 2026-08-27, zero volume — stale mark). No sourced FX rate for 2026-08-28 exists in the data pool, so only the USD-denominated CEDEAR gap is measurable
- **Price:** USD 14.30 (2026-08-28 close, last close). Fresher indicative: USD 15.37 (2026-09-04 close, web-sourced, unverified, +7.48%)
- **Price-state:** **`pool-verified`** — margin of safety, downside-to-bear, observed up/down and valuation attractiveness all unlock. Stale by 5 exact trading sessions / 6.4 on the ×5/7 conversion → conservative read applies the staleness cap: **valuation confidence max 70**
- **Currency:** USD (IFRS as issued by the IASB; FY ends 31 December; subsidiary functional currencies BRL / MXN / COP)
- **Distribution basis:** **none quoted** — dividend per share USD 0.00, no distribution ever declared, no ex-date or record date, still available to a buyer today: N/A (none exists), gross = net = zero. Decision-line dividend yield **0.00%**. Buyback: USD 1.0bn authorisation to 2027-06-03, USD 500.4m executed to 2026-06-30
- **Shares (market cap):** 4,830,688,659 [Q2 2026 Interim Report, Note 31 — Class A 3,808,087,961 + Class B 1,022,600,698]
- **Shares (per-share fair value):** 4,878,395 thousand fully diluted [Interim Note 9 treasury-stock method increment applied to the Jun-30-2026 outstanding count; no convertibles; 14,675 thousand antidilutive instruments excluded]
- **Market cap:** USD 69,078.8m at USD 14.30 (USD 74,247.7m at USD 15.37)
- **Net debt:** **NET CASH USD 7,744.6m — STRICT basis** (total debt USD 5,807.0m − cash & equivalents USD 13,551.6m), both built from the Q2 2026 interim filing's own notes. `balance-sheet-survival/01` did **not** run, so no canonical cross-module figure existed to inherit. Reconciled against the CIQ vendor figure of −USD 9,274.2m (**broad** basis): they do **not** agree, and the USD 1,529.6m gap is explained in full (derivatives added to debt; short-term investments netted into cash). Caution: net cash is a weak leverage measure for a bank — use equity/assets 16.0%, tangible common equity/assets 14.6%, Tier 1 13.4%, total capital 15.7%
- **EV:** USD 61,243.3m at USD 14.30 — **informational only; invalid as a value for a Financial (bank)**. No EV-based multiple may be built on it
- **Key caveats:** (1) price stale by 5–6 trading days with a corroborated +7.48% drift to USD 15.37 — present price-relative reads at both prices; (2) EV and net debt are informational for a bank — value equity directly on book, tangible book and earnings; (3) both share classes count for market cap, Class A alone understates it by 21.2%; (4) net cash sits inside regulated subsidiaries and is not free corporate cash; (5) the undated CIQ price of USD 14.88 and the CIQ net debt of −USD 9,274.2m are both rejected here with reasons — do not re-import them; (6) the CIQ ROXO34 target of 3.56 carries a currency-unit defect and is unusable



---

## valuation / 02_multiples-own-history.md

_Source: `02_multiples-own-history.md`_

# Multiples — Own History — NU

**Scope note.** This agent judges NU against **itself over time** only. No peer comparison (that is `03`), no cash-flow model (that is `04`), no final fair value (that is `07`).

**Reporting currency: US dollar (USD).** IFRS Accounting Standards as issued by the IASB; fiscal year ends 31 December [FY2025 Form 20-F, cover page and Note 2].

**Anchor numbers — taken verbatim from `01_price-and-capital-structure.md` §7.** Price **USD 14.30** (2026-08-28 close, pool-verified); shares for market cap **4,830,688,659**; market cap **USD 69,078.8m**; shares for per-share fair value **4,878,395 thousand** fully diluted; book value attributable to the parent **USD 13,249.67m** (BVPS 2.74 outstanding / 2.72 diluted); tangible common equity **USD 12,093.198m** (TBVPS 2.50 / 2.48); dividend **zero**. The fresher indicative quote of **USD 15.37** (2026-09-04 close, web-sourced, unverified, +7.48%) is carried alongside where it changes a read. No anchor is departed from anywhere in this report.

**Business type governs the multiple set.** `00_valuation-data-triage` classifies NU as a **Financial (bank)**. Under the MODULE_RULES Business-Type Method Map, **EV/EBITDA, EV/EBIT and EV/Sales are invalid for this issuer and are not computed** — `01` shows why in one line: its enterprise-value bridge excludes USD 45,328.4m of deposits and USD 15,541.7m of payables to network, i.e. USD 60.9bn of the bank's actual funding. The valid set is **P/E, P/book, P/tangible book**, with price-to-pre-tax-earnings and price-to-revenue as secondary reads. Capital IQ itself reports no EBITDA line for NU (`ciq_facts.json` `ltm_ebitda_m` = `unknown`, note: "Income Statement sheet has no 'EBITDA' row"), and `ev_ebitda_current_x`, `ev_ebitda_percentile` and `range_position` are all `unknown` for the same reason — the sidecar and the Method Map agree.

**Duplicate-copy note.** The pool carries the Capital IQ multiples history three times (`Nu Holdings Ltd NYSE NU Financials Multiples.xls`, `… Multiples (1).xls`, and the `Multiples` tab inside `Nu Holdings Ltd NYSE NU Financials.xls`). All three are **byte-identical in content** — same seven period columns, same figures. One copy is cited throughout: `Nu Holdings Ltd NYSE NU Financials Multiples.xls` → tab `Multiples`. No number enters this report twice under two filenames.

---

## 1. Current Multiples

All at the pool-verified anchor price of **USD 14.30, 2026-08-28 close**. Every figure below is the Capital IQ **Close** value for the period ending 2026-08-28, which is computed on that same USD 14.30 price — verified three ways: `14.30 / 19.480457 = 0.73407` = the reported LTM diluted EPS of 0.734069; `14.30 / 5.213629 = 2.7428` = the reported BVPS of 2.74; `14.30 / 5.712208 = 2.5034` = the reported TBVPS of 2.50. So the multiples export and this module's anchor are on the **same price**, not two different ones.

| Multiple | Basis (LTM / NTM / FY) | Metric Value | Current Multiple | Source |
|---|---|---:|---:|---|
| **P / E (reported diluted EPS excl. extraordinary)** | **LTM**, 12m to Jun-30-2026 | EPS USD **0.734069** | **19.48x** | `Nu Holdings Ltd NYSE NU Financials Multiples.xls` → `Multiples`, "P/LTM EPS" Close, period 2026-08-28; EPS from `… Financials Key Stats.xls` → `Key Stats`. Cross-checked against `ciq_facts.json` `pe_ltm_current_x` = **19.5**, status `present` — agrees |
| **P / E (consensus)** | **NTM** (next twelve months from 2026-08-28) | EPS USD **0.9686** (derived: 14.30 / 14.763576) | **14.76x** | `… Financials Multiples.xls` → `Multiples`, "P/NTM EPS" Close; identical figure in `NuHoldingsLtdNYSENUEstimatesReport.xls` → `Multiples`, NTM Price/Earnings 14.7635762956845 |
| P / E (consensus) | **FY2026E** | EPS USD 0.8482 | **16.86x** | `NuHoldingsLtdNYSENUEstimatesReport.xls` → `Multiples`, FY 2026 Price/Earnings; EPS from `… Key Stats.xls` |
| P / E (consensus) | **FY2027E** | EPS USD 1.11006 | **12.88x** | Same export, FY 2027 |
| P / E (**normalized** EPS, CIQ definition) | **LTM** | — | **25.66x** | `… Financials Multiples.xls` → `Multiples`, "P/LTM Normalized EPS" Close |
| **P / Book value** | **LTM / point-in-time** Jun-30-2026 | BVPS USD **2.7428** (equity to parent 13,249.67m) | **5.21x** | `… Financials Multiples.xls` → `Multiples`, "P/BV" Close; equity from Q2 2026 Interim Report (Aug-14-2026), statement of financial position |
| **P / Tangible book value** | **LTM / point-in-time** Jun-30-2026 | TBVPS USD **2.5034** (tangible common equity 12,093.198m) | **5.71x** | `… Financials Multiples.xls` → `Multiples`, "P/Tangible BV" Close; build in `01` §6 (13,249.7 − goodwill 409.4 − other intangibles 747.1) |
| P / Book (consensus) | **FY2026E** | BVPS USD 3.1477 (derived: 14.30 / 4.54297) | **4.54x** | `NuHoldingsLtdNYSENUEstimatesReport.xls` → `Multiples`, FY 2026 P/BV |
| Market cap / pre-tax earnings (EBT excl. unusual) | **LTM**, 12m to Jun-30-2026 | EBT USD **4,384.603m** | **15.75x** | `… Financials Multiples.xls` → `Multiples`, "Market Cap/LTM EBT Excl. Unusual Items" Close; EBT from `… Key Stats.xls` |
| Market cap / revenue (**CIQ net-revenue basis**) | **LTM**, 12m to Jun-30-2026 | Revenue USD **8,442.068m** | **8.18x** | `… Financials Multiples.xls` → `Multiples`, "Market Cap/LTM Total Revenue" Close |
| P / FCF, FCF yield | **Not computed — not meaningful for a bank** | — | — | LTM cash from operations is **−USD 10,304.8m** on the vendor basis and **−USD 1,381.6m** on the company basis, because a growing lender's loan book and deposits run through operating cash flow [`ciq_facts.json` `ltm_ocf_m`, status `present`; `earnings/01_historical-financials.md`, both bases labelled]. `ciq_facts.json` `levered_fcf_m` = `unknown`. Free cash flow is not an earnings base for this issuer |
| **Dividend yield** | — | USD **0.00** per share | **0.00%** | No dividend has ever been declared; dividend per share reported "NA" in every year FY2021–FY2025 and total dividends paid "–" across FY2021–LTM Jun-30-2026 [`Nu Holdings Ltd NYSE NU Financials Ratios.xls` → `Ratios`; `… Cash Flow.xls` → `Cash Flow`]. "We may not pay any cash dividends in the foreseeable future" [FY2025 Form 20-F, Item 3.D] |
| EV / EBITDA, EV / EBIT, EV / Sales | **Dropped — invalid for a Financial (bank)** | — | — | MODULE_RULES Business-Type Method Map; `01` §4 (the EV bridge omits USD 60.9bn of deposits and network payables); `ciq_facts.json` `ltm_ebitda_m` = `unknown` |

**Two vendor traps named so nobody re-imports them.**

1. **The `Key Stats` multiples are priced at USD 14.88, not at the anchor.** That tab's "Valuation Multiples based on Current Capitalization" block shows P/Diluted EPS LTM **20.27x**, P/BV **5.43x**, Price/Tang BV **5.94x**, Market Cap/Revenue **8.51x**, Market Cap/EBT **16.39x** — every one of them computed on the **undated USD 14.88** share price that `01` §1 rejected. Scaling by `14.30 / 14.88 = 0.96102` reproduces this report's figures exactly (20.270574 × 0.96102 = 19.48; 5.943892 × 0.96102 = 5.71). **Use the 14.30-based figures in the table above; the Key Stats block is +4.1% high on every multiple.**
2. **Market cap / revenue is not comparable between its LTM and NTM forms — they are on two different revenue definitions.** CIQ's "Market Cap/LTM Total Revenue" of 8.18x uses a **net** revenue of USD 8,442.1m, while its "Market Cap/NTM Total Revenues" of 2.72x is built on consensus revenue of roughly USD 25,400m — which sits on the company's **gross** revenue basis (the earnings module's TTM revenue on the company basis is USD 19,340.0m against the same vendor's 8,442.1m [`earnings/01_historical-financials.md`; `earnings/99_earnings-synthesis.md` §2], and consensus FY2026E revenue is 22,908.0m [`… Key Stats.xls`]). A "de-rating" from 8.18x to 2.72x is an accounting-basis change, not a valuation change. **The NTM revenue multiple is excluded from every band and every implied value in this report.**

---

## 2. Historical Multiple Bands — and the window is 20 months, not 3–5 years

**Partial-data flag, stated before the table.** The only multiple time series in the data pool is the Capital IQ `Multiples` export, and it covers **seven period columns from 2025-03-31 to 2026-08-28 — about 20 months (roughly 1.7 years), not the 3–5 years this agent is supposed to use.** Six columns are full quarters and the seventh is a two-month stub (2026-07-01 to 2026-08-28). Each column's Average / High / Low is computed by Capital IQ from **every trading day inside that period** ("Average multiples are calculated using positive close values on each trading day within the frequency periods selected"), so the band below rests on roughly 415 daily observations — it is not three data points. But 415 daily observations inside 20 months still only observe 20 months.

**This is a data-pull gap, not a short listing history.** NU has been listed on the NYSE since December 2021 [FY2021 Form 20-F, filed Apr-21-2022], so roughly 4.7 years of trading history exists — the pool's export simply was not pulled back that far. FY2022, FY2023 and FY2024 are **unobserved here**, and the pool contains no other multiple series to fill them (the `Charting Excel Export Aug-29-2026` file is an unlabelled daily series running ~0.027–0.030 with no metric name, and is not a multiple).

**Consequence, applied in full (Partial-Data Rule).** Because the observed own history is shorter than ~3 years, the reversion table in §4 is **illustrative only and is NOT a fair-value input for `07_scenario-and-fair-value`.** The band itself IS still handed to `07` — MODULE_RULES Scenario Construction §2 needs an evidenced upper and lower multiple to bound the bull and bear cases — but it is handed over labelled as a **20-month, not-full-cycle** band.

**Method.** *Min* = the lowest daily Low in any period. *Max* = the highest daily High in any period. *Mean* = the unweighted average of the seven period Averages. *Median* = the median of the same seven period Averages. *Current* = the Close for the period ending 2026-08-28 (i.e. at USD 14.30). *Percentile of range* = `(current − min) / (max − min)`, i.e. where today sits inside the full observed daily High–Low envelope. Time-weighting the mean by month length (3,3,3,3,3,3,2) rather than treating the two-month stub as a full period moves the P/E mean from 27.65x to 27.98x and the P/tangible-book mean from 7.44x to 7.51x — under 1.5% in both cases, so the unweighted figures are used.

Source for the entire table: `Nu Holdings Ltd NYSE NU Financials Multiples.xls` → tab `Multiples`, seven period columns 2025-03-31 through 2026-08-28 (Capital IQ, data as of 2026-08-28; export as-of 2026-08-29).

| Multiple | Min | Mean | Median | Max | Current | Percentile of Range |
|---|---:|---:|---:|---:|---:|---:|
| **P / LTM EPS** | 17.90x | 27.65x | 29.98x | 38.28x | **19.48x** | **7.8%** |
| **P / NTM EPS** | 12.90x | 20.07x | 21.70x | 26.90x | **14.76x** | **13.3%** |
| **P / Book value** | 4.48x | 6.73x | 7.14x | 8.77x | **5.21x** | **17.1%** |
| **P / Tangible book value** | 4.91x | 7.44x | 7.91x | 9.79x | **5.71x** | **16.4%** |
| Market cap / LTM pre-tax earnings (EBT) | 14.00x | 19.85x | 21.26x | 25.91x | **15.75x** | **14.7%** |
| Market cap / LTM revenue (CIQ net basis) | 7.43x | 10.64x | 10.57x | 14.29x | **8.18x** | **11.0%** |
| ~~EV / EBITDA~~, ~~EV / EBIT~~, ~~EV / Sales~~ | — | — | — | — | — | Invalid for a Financial — not computed |

**What the band is for.** These min / mean / median / max figures are the evidenced envelope `07` should stay inside when it sets its **bull** multiple (toward the upper band) and its **bear** multiple (toward the lower band), so the scenario multiples remain inside a multiple this company has actually traded at. Two warnings travel with them: (a) the envelope is 20 months, so the true full-cycle low is almost certainly **below** the 4.48x P/B / 12.90x forward-P/E floor shown here, and (b) the upper end (38.28x LTM P/E, 9.79x tangible book) was set in Q1-2025 and Q1-2026, both of which sit inside a single directional move rather than across a cycle.

---

## 3. Re-Rating / De-Rating Read

**The stock has de-rated hard, and it sits near the bottom of everything it has traded at in the last 20 months.** On the three most reliable multiples for a bank: forward P/E of **14.76x is 26.4% below its own 20-month mean of 20.07x and 31.9% below the median of 21.70x**; price-to-tangible-book of **5.71x is 23.2% below its own mean of 7.44x and 27.8% below the median of 7.91x**; price-to-book of **5.21x is 22.6% below the mean of 6.73x and 27.0% below the median of 7.14x**. On trailing P/E the gap is widest — 19.48x against a 27.65x mean, a **29.6% discount**, at the **7.8th percentile** of the observed daily range. Every one of the six valid multiples sits in the bottom fifth of its own 20-month envelope; not one of them is above its own mean.

**The mechanical reason is that earnings ran away from the price, not that the price collapsed.** Over the same window the share price went USD 13.14 (May-2025) → 15.59 (Nov-2025) → 16.65 (Feb-2026) → 12.19 (May-2026) → 13.93 (Aug-2026) → 14.30 [`Nu Holdings Ltd NYSE NU Financials Historical Capitalization.xls` → `Historical Capitalization`, plus the anchor], while LTM diluted EPS went USD 0.4034 (FY2024) → 0.5846 (FY2025) → **0.7341** (LTM Jun-2026), up 82.0% [`… Financials Key Stats.xls` → `Key Stats`], and book value per share went from USD 1.784 (8,607.909m over 4,824.407m shares, Mar-2025) to USD 2.743, up 53.8% [`… Historical Capitalization`]. A price that is roughly flat over a period in which the denominator grows 54–82% produces exactly this de-rate arithmetically. Growth is decelerating, not stopping — consensus still models EPS +45.1% in FY2026E and +30.9% in FY2027E [`… Key Stats.xls`].

**But there is a real, cited reason the warranted multiple may have fallen, and it is the earnings base itself.** The earnings module found that **40.4% of trailing-twelve-month net income to the parent — USD 1,458.6m of USD 3,607.1m — is a non-cash deferred tax credit**, that cash tax paid of USD 2,108.1m is 2.7x the profit-and-loss charge of USD 774.6m, and that its lead measure is **cash-backed net income of USD 2,148.5m** [`earnings/06_earnings-quality.md`; `earnings/99_earnings-synthesis.md` §2]. It also found that of the 187 basis points of net-margin expansion in Q2'26, the tax line contributed +300.2bp while every operating component together was **−112.0bp, with pre-tax margin down 155bp year on year** [`earnings/03_margin-drivers.md` §7B; Q2 2026 Interim Report, Statements of Income and Note 30]. **Restate today's P/E on cash-backed earnings and the "discount" inverts: cash-backed EPS = 0.734069 × (2,148.5 / 3,607.1) = USD 0.4372, so the current P/E is 14.30 / 0.4372 = 32.7x — ABOVE the 27.65x mean of the reported-EPS band, not 30% below it.** That single line is the most important number in this report.

---

## 4. Implied Value from Reversion — ILLUSTRATIVE ONLY, not a fair-value input for `07`

> **Read this before the table.** The own history observed here is **20 months**, not 3–5 years (§2). Under the Partial-Data Rule the figures below are a **directional, illustrative read of where the stock sits inside its own short range** — they are **not** a fair-value point or range for `07_scenario-and-fair-value` to weight, and no base-case fair value is designated from them. `07` should take the **band** from §2 to bound its bull and bear multiples, and take its base-case level from a method with a longer or independent evidence base.

Per-share values are `own multiple × aggregate metric ÷ 4,878,395 thousand fully diluted shares` for the balance-sheet and pre-tax multiples, and `own multiple × per-share earnings` for the two P/E lines (whose denominator is already a diluted per-share figure, on a weighted-average count of 4,904.8m that is slightly **above** the fully diluted point count — so those two lines are, if anything, marginally conservative). Aggregate metrics: book value USD 13,249.670m; tangible common equity USD 12,093.198m; LTM EBT USD 4,384.603m; LTM net revenue USD 8,442.068m [Q2 2026 Interim Report, statement of financial position; `… Financials Key Stats.xls`].

| Multiple | Reversion Target (mean / median) | Implied Equity Value (USD m) | Implied Price/Share (USD) | vs Current Price 14.30 | vs Fresher 15.37 |
|---|---:|---:|---:|---:|---:|
| P / Tangible book value | **mean 7.44x** | 89,942 | **18.44** | +28.9% | +19.9% |
| P / Tangible book value | **median 7.91x** | 95,634 | **19.60** | +37.1% | +27.5% |
| P / Book value | mean 6.73x | 89,197 | **18.28** | +27.8% | +18.9% |
| P / Book value | median 7.14x | 94,630 | **19.40** | +35.7% | +26.2% |
| P / NTM EPS | mean 20.07x | — (per-share build) | **19.44** | +35.9% | +26.5% |
| P / NTM EPS | median 21.70x | — (per-share build) | **21.01** | +46.9% | +36.7% |
| P / LTM EPS | mean 27.65x | — (per-share build) | **20.30** | +42.0% | +32.1% |
| P / LTM EPS | median 29.98x | — (per-share build) | **22.01** | +53.9% | +43.2% |
| Market cap / LTM pre-tax earnings | mean 19.85x | 87,051 | **17.84** | +24.8% | +16.1% |
| Market cap / LTM pre-tax earnings | median 21.26x | 93,215 | **19.11** | +33.6% | +24.3% |
| Market cap / LTM revenue (net basis) | mean 10.64x | 89,848 | **18.42** | +28.8% | +19.8% |
| Market cap / LTM revenue (net basis) | median 10.57x | 89,206 | **18.29** | +27.9% | +19.0% |

**The illustrative reference point, named.** Had this been a 3–5 year band, the designated base point would be the **own-MEDIAN price-to-tangible-book multiple of 7.91x, giving USD 19.60 per share** — tangible book is the most defensible denominator here because it is an audited balance-sheet number (USD 12,093.198m, built line by line in `01` §6) rather than an estimate, and it does not carry the deferred-tax distortion that sits inside the earnings denominators (§3). **It is named, and it is illustrative only.**

**Dispersion across the multiples used, as its separate exhibit.** The full high-to-low field is **USD 17.84 to USD 22.01** — a spread of 23.4% of the low. On the median basis alone the field is USD 18.29 to USD 22.01. The two earnings-based reversions sit at the top of the field precisely because the earnings denominator has grown fastest, which is the same fact that §3 flags as the least durable.

**The reversion assumption, stated explicitly, and it does not clearly hold.** Every figure above assumes the multiple NU deserves has not structurally changed since 2025. Three pieces of evidence say it may have:
- **The earnings base is lower quality than it was.** 40.4% of trailing net income is a self-reversing non-cash deferred tax credit whose fuel — provision build outrunning tax-deductible write-offs — only exists while the loan book grows fast, and sequential FX-neutral portfolio growth has more than halved (+11% → +7% → +5% quarter on quarter) [`earnings/06_earnings-quality.md`; `earnings/99_earnings-synthesis.md` §1A, citing Q2'26 Earnings Presentation slide 13]. A market that discounts that credit is not mispricing the stock; it is refusing to pay a growth multiple for a tax item.
- **Operating margin is going the other way.** Pre-tax margin fell 155bp year on year while reported net margin rose 187bp — the whole improvement is below the operating lines [`earnings/03_margin-drivers.md` §7B]. A falling pre-tax margin is a normal reason for a multiple to compress.
- **The currency exposure is unhedged and large.** On the company's own 17.8% BRL shock, roughly USD 1.05bn — 29% of trailing net income — is at risk, against an exposure management states it decided not to hedge [`earnings/99_earnings-synthesis.md` §1, citing FY2025 Form 20-F, Items 3.D and 11].

Against those, the operating engine is genuinely still running: constant-currency revenue +34.02%, ARPAC +22% FX-neutral for a sixth consecutive quarter, customers 123m → 139m, and loan-loss coverage **building** from 15.37% to 16.86% of gross credit assets in six months rather than being released [`earnings/99_earnings-synthesis.md` §1A, citing Q2'26 interim statements Note 7 and the Q2'26 presentation]. So the case that some of this de-rate is unwarranted is real. It is not proven from this module's evidence, and reverting all the way to a 20-month mean set during a faster-growth, higher-tax-credit period is not underwritten here.

---

## 5. Sector Cycle Reality Test

**Check run, partially matched, and the flag does NOT fire.** The data pool contains **no historical peer or sector multiple series** — the comps workbook (`Company Comparable Analysis Nu Holdings Ltd .xls` → `Trading Multiples`, As-Of 2026-08-29) gives only **current** peer multiples for the ten-name LatAm bank set (P/diluted EPS LTM: mean 9.3x, median 8.5x; P/tangible book LTM: mean 1.9x, median 1.8x; NTM forward P/E: mean 7.59x, median 7.73x), with no history behind them. Sector history was therefore web-sourced and is labelled: **the Brazilian banks industry traded at a price/earnings ratio of about 8.7x as of 2026-03-29, ABOVE its own three-year average of about 7.6x (+14.5%)** [Web: Simply Wall St, Brazilian (BOVESPA) financials / banks market pages, read 2026-09-06 — indicative, unverified], and **Itaú Unibanco's price-to-book of about 2.02x in January 2026 stood roughly 18.0% ABOVE its own three-year average of 1.71x** [Web: GuruFocus ITUB P/B page, data as of 2026-01-08 — indicative, unverified]. **Both sector reads move in the OPPOSITE direction to NU's own de-rating finding — the sector sat above its own historical average while NU fell to the bottom fifth of its own range — and both magnitudes (+14.5%, +18.0%) are below the ~25% materiality threshold. The trigger therefore requires a same-direction move of more than ~25%, and neither condition is met. No cycle-elevated / cycle-depressed flag is raised, and no `RF-VAL-001` / `RF-VAL-002` tag is emitted.** The honest limitation: the web sources measure against three-year averages, not against this report's exact 2025-01 to 2026-08 window, so the check is **directionally sound but not window-matched** — it rules out the "NU's mean is just the sector bubble" hypothesis rather than proving the band is stable. The larger threat to this band is **not** a sector cycle at all: it is that the band is only 20 months long (§2) and that the earnings denominator inside it is 40.4% deferred-tax credit (§3). Those are named separately and are not cured by this test.

---

## 6. Own-History Read

**NU trades at 14.76x forward earnings and 5.71x tangible book — 26.4% and 23.2% below its own 20-month means, in the bottom fifth of everything it has traded at since January 2025 — and reverting to those means would imply roughly USD 18.3 to USD 22.0 per share against USD 14.30 (USD 15.37 on the fresher indicative quote), which is +25% to +54%.** That entire range is **illustrative only**: the observed history is 20 months, not the 3–5 years a reversion target needs, because the Capital IQ multiples export was pulled only back to 2025-03-31 even though the stock has traded since December 2021 — so no base-case fair value is handed to `07` from this method, only the band that bounds its bull and bear multiples.

**The single biggest caveat: the de-rate may be deserved, and the cleanest test says it is.** Forty percent of trailing net income is a non-cash deferred tax credit that reverses as loan growth slows, pre-tax margin fell 155bp year on year while the reported net margin rose, and restating today's price against the earnings module's cash-backed net income of USD 2,148.5m puts the current price/earnings at **32.7x — above, not 30% below, the 27.65x mean of the band this report just built**. Reverting to the old mean assumes the market will again pay a growth multiple on an earnings line the market appears to be discounting; that is not proven here.

**On ownership (§24 Filter 6 — this module owns the read).** The management-governance module tested it and it is **negative**: state-owned shares 0.03%, one reported segment at 100% of revenue, and Nu is the top holding company rather than a listed subsidiary of a value-maximising parent — **`RF-OWN-004` is NOT emitted and no value-trap note flows to valuation** [`management-governance/04_ownership-and-insider-behavior.md` §4, finding 04-021; `management-governance/99_management-governance-synthesis.md` §C and the cap table]. So the persistent-cheapness-under-a-misaligned-owner trap does not apply, and no ownership-based discount is taken here. Separately and for the record, the governance module still reads shareholder rights as weak (20:1 dual class, 74.4% of votes on 18.6% of the economics, founder veto over dividends and M&A) — that is priced by that module under governance risk, not as a valuation discount by this one.

**Sector cycle:** tested and not flagged (§5) — the Brazilian bank sector sat *above* its own three-year average while NU de-rated, which is the opposite direction to the trigger, so this band is not flagged as cycle-elevated. It is flagged as **too short**, which is a different and, here, a bigger problem.



---

## valuation / 03_relative-valuation-peers.md

_Source: `03_relative-valuation-peers.md`_

# Relative Valuation — Peers — NU

**Scope note.** This agent answers one question: how large is NU's premium or discount to its comparable set, is that gap warranted, and what value do peer multiples imply. It does not judge NU against its own trading history (that is `02_multiples-own-history`), does not build a cash-flow model (`04`), and does not set the final fair value (`07`).

**Business type governs the method set.** `00_valuation-data-triage` classifies NU as a **Financial (bank)**. Under the MODULE_RULES Business-Type Method Map, **EV-based multiples (EV/EBITDA, EV/EBIT, EV/Sales) and the enterprise-value bridge as a value are invalid for this issuer**, and `01_price-and-capital-structure` labels its EV of USD 61,243.3m "informational only, invalid as a value" because it omits USD 60.9bn of deposits and payables to network. The valid peer multiples here are **P/E (trailing and forward), P/tangible book (P/TBV), and return on tangible equity (ROTE)**. The EV columns in the report template are therefore omitted rather than filled with numbers that mean nothing for a bank.

**Anchors used verbatim from `01`.** Decision line **NYSE:NU · USD (Class A ordinary shares)**. Price **USD 14.30** (2026-08-28 close, pool-verified, stale by 5 exact trading sessions), with a fresher indicative quote of **USD 15.37** (2026-09-04 close, web-sourced, unverified, +7.48%). Shares for market cap 4,830,688,659; shares for per-share fair value 4,878,395 thousand fully diluted. Tangible book value per share **USD 2.50** (outstanding) / **USD 2.48** (fully diluted). Market cap USD 69,078.8m. Dividend yield **0.00% — no dividend has ever been paid**. No figure below departs from those anchors.

**Reporting basis.** IFRS as issued by the IASB, USD presentation currency, fiscal year ends 31 December `[FY2025 Form 20-F, cover page and Note 2]`. Every peer figure is Capital IQ's own USD translation at its stated spot rate `[Company Comparable Analysis Nu Holdings Ltd .xls → tab Trading Multiples, "Values converted at today's spot rate", As-Of Date 2026-08-29]`.

**Not used as evidence.** `data/NU/NU_Holdings_Deep_Dive_15_Page_Memo_30_Aug_2026.pdf` is a prior engine output carrying its own target price, exit multiples and scenario weights. Per the `00` triage caveat it is a §4 tier-9 user note; it was not read for, and did not inform, any number here.

---

## 1. Peer Set

**Where the set came from.** `business-model/08_competitive-map.md` is available and was read. It builds its peer list from NU's own annual filing, which names its competitors directly:

> "Our main competitors in the Brazilian consumer credit space include Itaú Unibanco S.A., Banco Bradesco S.A., Banco Santander (Brasil) S.A., Caixa Econômica Federal and Banco do Brasil S.A. In the Brazilian investment segment… Banco BTG Pactual S.A., Banco Inter S.A., Banco C6 S.A. and XP Inc. In the Brazilian payments space… MercadoPago Instituição de Pagamento Ltda., PicPay Instituição de Pagamento S.A., PagSeguro Digital Ltd. and StoneCo Ltd."
> `[FY2025 Form 20-F, Item 3.D Risk Factors, pp.107–108]`

The multiples set below is the ten-name comparable set inside the pool's own Capital IQ workbook `[Company Comparable Analysis Nu Holdings Ltd .xls → tab Trading Multiples, As-Of Date 2026-08-29]`. **The set is therefore NOT self-selected** — but it is also not identical to NU's own named list, and the two differences are stated rather than hidden.

| Peer | Ticker | Why Comparable | Source of Inclusion |
|---|---|---|---|
| Itaú Unibanco Holding S.A. | BOVESPA:ITUB4 | Brazilian consumer credit — NU's dominant business (91.4% of FY2025 Note-34 revenue is Brazil). Largest private incumbent, LTM revenue USD 27,593.8m = 3.3× NU | Named by NU `[FY2025 20-F, Item 3.D, pp.107–108]`; in CIQ comp set |
| Banco Bradesco S.A. | BOVESPA:BBDC4 | Brazilian mass-market retail — the incumbent whose customer base overlaps NU's target segment most directly. LTM revenue USD 17,909.9m = 2.1× NU | Named by NU `[FY2025 20-F, Item 3.D]`; in CIQ comp set |
| Banco do Brasil S.A. | BOVESPA:BBAS3 | Brazilian consumer credit at scale; state-controlled, so its multiple carries an owner discount NU does not | Named by NU `[FY2025 20-F, Item 3.D]`; in CIQ comp set |
| Banco Santander (Brasil) S.A. | BOVESPA:SANB11 | Brazilian consumer credit; LTM revenue USD 9,271.3m — the closest peer to NU on scale (USD 8,442.1m) | Named by NU `[FY2025 20-F, Item 3.D]`; in CIQ comp set |
| Banco BTG Pactual S.A. | BOVESPA:BPAC11 | Brazilian investment/wholesale-tilted bank; named by NU in the investment segment, not consumer credit — partial overlap only | Named by NU `[FY2025 20-F, Item 3.D]`; in CIQ comp set |
| Inter & Co, Inc. | NasdaqGS:INTR | The same branchless digital-bank model in Brazil at roughly one-seventh NU's revenue — the closest same-model rival | Named by NU as Banco Inter S.A. `[FY2025 20-F, Item 3.D]`; in CIQ comp set |
| PagSeguro Digital Ltd. | NYSE:PAGS | Brazilian payments plus a lending arm; the only comp-set member CIQ prices on a non-bank template (it is the sole source of the set's EV multiples) | Named by NU `[FY2025 20-F, Item 3.D]`; in CIQ comp set |
| Grupo Financiero Banorte, S.A.B. de C.V. | BMV:GFNORTE O | Mexican incumbent — NU's second market (7% of FY2025 Note-34 revenue; Mexican banking licence granted, began operating as a bank 6 Aug 2026) | Named by NU `[Capital IQ Competitors export, row sourced to "Nu Holdings Ltd. (NYSE:NU) 2026 Form 20-F"]`; in CIQ comp set |
| Grupo Cibest S.A. | BVC:CIBEST | Colombian incumbent (Bancolombia's holding company) — NU's third market, 1.7m customers at Dec-2025. Same end-market, but **NU does not name it** | Capital IQ relevancy score only — not in NU's filing and not in the CIQ Competitors export |
| Credicorp Ltd. | NYSE:BAP | Andean financial group. **Weakest inclusion in the set: Peru, where NU has no operations, and NU does not name it anywhere** | Capital IQ relevancy score only — not in NU's filing and not in the CIQ Competitors export |

**Two composition gaps, stated because they move the medians.**

1. **Two publicly-listed companies NU names itself are missing from the comp set: XP Inc. (NasdaqGS:XP) and StoneCo Ltd. (NasdaqGS:STNE)**, both sourced in the CIQ Competitors export to NU's own 2026 Form 20-F `[Capital IQ Competitors export, rows "XP Inc." and "StoneCo Ltd.", Company = Nu Holdings Ltd. (NYSE:NU), Entity = Self]`. Their multiples are not in this pool and were not imported, so the medians below exclude them. This is a named limitation, not an assumption that they would not move the answer.
2. **Two companies in the comp set are Capital IQ's additions, not NU's** — Grupo Cibest and Credicorp. Section 5 shows the sensitivity of the implied value to removing them.

**Private / unlisted competitors that cannot be compared — flagged, not guessed.** NU names four rivals with no public equity and therefore no multiple: **Caixa Econômica Federal** (state-owned, unlisted; LTM revenue USD 14,819.3m to 31 Mar 2026), **Banco C6 S.A.** (unlisted; USD 2,743.5m to 31 Dec 2024 — stale), **PicPay Instituição de Pagamento S.A.** (unlisted; USD 1,214.2m to 31 Dec 2022 — four years stale), and **Mercado Pago Instituição de Pagamento Ltda** (a MercadoLibre subsidiary; USD 512.1m to 31 Dec 2023 — stale) `[Capital IQ Competitors export, as-of Aug-2026]`. Caixa is the second-largest lender to Brazilian consumers by the filing's own account and its absence from any multiple median is a real hole in the peer picture. No multiple is estimated for any of them.

**No peer filing is in the data pool.** The pool is NU-only. Every peer figure below is a §4 tier-5 vendor export or a dated web read, labelled at each use. Resolution: add the 2Q26 results filings of ITUB4, BBDC4, BBAS3 and INTR so peer returns can be cited at tier 1–2.

---

## 2. Peer Multiples & Operating Stats

All figures from `[Company Comparable Analysis Nu Holdings Ltd .xls → tabs Trading Multiples, Operating Statistics and Financial Data, Capital IQ, USD, As-Of Date 2026-08-29]` — a §4 tier-5 vendor export, **data as of 2026-08-29 for every row**. LTM = last twelve months as filed (peer LTM income-statement filing dates run 21 Apr 2026 to 15 Aug 2026; NU's is 13 Aug 2026). NTM = next twelve months on Capital IQ consensus.

**Forward ROTE and P/TBV are my arithmetic on the vendor's own per-share cells**, computed identically for every company so the set is matched-basis: `forward ROTE = NTM EPS ÷ LTM tangible book value per share`; `P/TBV = day close price ÷ LTM tangible book value per share`. Both use the **same** current tangible book, so the identity `P/TBV = forward P/E × forward ROTE` holds exactly for every row — it is checked in §5.

| Company | LTM P/E | NTM P/E | P/TBV | Forward ROTE (derived) | LTM rev growth | LTM net income growth | NTM LT EPS growth | LTM net income margin | 5-yr beta | Data as-of |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| **Nu Holdings Ltd. (NYSE:NU)** | **19.5** | **14.76** | **5.7** | **38.8%** | **44.33%** | **56.83%** | **33.98%** | **42.73%** | **0.94** | 2026-08-29 |
| Banco Santander (Brasil) | 8.1 | 7.61 | 1.2 | 15.7% | 8.47% | 17.97% | n/a | 28.66% | 0.18 | 2026-08-29 |
| Grupo Fin. Banorte | 8.8 | 8.17 | 2.4 | 29.5% | 7.67% | 2.95% | 7.02% | 41.78% | 0.13 | 2026-08-29 |
| Banco BTG Pactual | 14.3 | 9.39 | 3.4 | 36.2% | 22.28% | 35.70% | 17.60% | 39.80% | 0.32 | 2026-08-29 |
| Banco Bradesco | 7.4 | 6.08 | 1.1 | 18.6% | 6.23% | 17.55% | 16.21% | 26.07% | 0.23 | 2026-08-29 |
| Banco do Brasil | 7.0 | 5.14 | 0.7 | 13.1% | −19.89% | −31.50% | 16.40% | 21.83% | 0.23 | 2026-08-29 |
| Itaú Unibanco | 9.3 | 8.16 | 2.3 | 27.5% | 6.63% | 9.30% | 9.76% | 32.58% | 0.16 | 2026-08-29 |
| Grupo Cibest | 10.6 | 7.84 | 2.3 | 29.1% | 16.67% | −33.08% | 12.06% | 17.57% | 0.44 | 2026-08-29 |
| PagSeguro Digital | 6.1 | 5.03 | 1.1 | 21.6% | 2.56% | −1.87% | 9.08% | 10.86% | 1.28 | 2026-08-29 |
| Inter & Co | 8.1 | 6.51 | 1.4 | 21.0% | 25.42% | 36.35% | 32.30% | 22.92% | 0.96 | 2026-08-29 |
| Credicorp | 13.6 | 11.97 | 3.0 | 24.6% | 13.70% | 17.93% | 13.17% | 33.10% | 0.86 | 2026-08-29 |
| **Peer median (n=10)** | **8.5** | **7.73** | **1.8** | **23.1%** | **8.07%** | **13.43%** | **13.17%** (n=9) | **27.37%** | **0.28** | 2026-08-29 |
| **Peer mean (n=10)** | **9.3** | **7.59** | **1.9** | **23.7%** | **8.97%** | **7.13%** | **14.84%** (n=9) | **27.52%** | **0.48** | 2026-08-29 |

**The medians are computed, not eyeballed.** Sorting the ten NTM P/E values (5.03, 5.14, 6.08, 6.51, 7.61, 7.84, 8.16, 8.17, 9.39, 11.97) gives a median of `(7.61 + 7.84) / 2 = 7.725`, which reproduces Capital IQ's own printed median of 7.73. The same check reproduces the vendor's LTM P/E median (8.5), P/TBV median (1.8), growth median (13.17%) and margin median (27.37%). My derived forward-ROTE median of 23.11% reconciles with the vendor's own medians through the identity: `7.73 × 23.11% = 1.787 ≈ 1.8`, the printed P/TBV median. Nothing in this table is a vendor number under a filing's name.

**Metrics deliberately not shown, with the reason:**
- **EV/EBITDA, EV/EBIT, EV/Sales** — invalid for a bank (Method Map). Capital IQ prints them for exactly one comp-set member, PagSeguro (0.7× / 1.4× / 1.7×), and then reports that single company's figure as the "median" of the whole set. **Any median built from one observation is not a median**, and §5 rejects the implied values Capital IQ derives from it.
- **FCF yield** — not meaningful here. NU's LTM cash from operations is **−USD 10,304.8m** because a growing bank's loan book and deposits run through operating cash flow `[ciq_facts.json, ltm_ocf_m, status present]`. That is not distress and it is not a free-cash-flow base.
- **Net debt / EBITDA** — the Capital IQ bank template has no EBITDA row at all `[ciq_facts.json, ltm_ebitda_m = unknown]`. `01` records equity/assets 16.0%, tangible common equity/assets 14.6%, Tier 1 13.4% and gross loans/deposits 88.8% as the leverage reads that actually describe this business; peer equivalents are not in the pool.
- **Dividend yield** — NU's is **0.00%**, no distribution has ever been declared `[01 §6A; FY2025 20-F, Item 3.D]`. Peer dividend data is not in this pool and was not imported.

**Two basis warnings that must travel with these numbers.**

1. **"Revenue" and "net income margin" are on Capital IQ's bank template, which is revenue *after* interest expense and loan-loss provisions.** All eleven companies sit on that same template, so the margins are matched-basis **against each other** — but they are not the filing's own revenue. On NU's own Note-34 base the FY2025 net margin was **23.8%** (net income USD 2,871.7m ÷ Note-34 revenue USD 12,083.8m), not 42.7% `[FY2025 20-F, Item 5; Note 34(b), p.F-97; carried from 08_competitive-map §2]`. The 42.73% figure may be compared to the 27.37% peer median and to nothing else.
2. **The betas are not measured on a common basis.** NU's 0.94 is a US-listed line against a US index; the Brazilian and Mexican peers' 0.13–0.44 are local lines against local indices `[08_competitive-map / 09_moat §3, which flags the same mismatch]`. NU is **not** three times riskier than Itaú on this evidence. The beta column is shown because the template asks for it and is not used to size anything below.

---

## 3. Premium / Discount to Peer Median

Formula, stated once: `premium/(discount) = (company multiple − peer median) / peer median`. Positive = premium (NU costs more per unit of the same thing). The denominator is the peer median, never NU's own multiple. **No yield metric appears in this table** — NU's dividend yield is zero and free-cash-flow yield is not meaningful for a bank — so the yield sign-inversion rule does not bite here. It is stated anyway so no downstream agent applies the price-multiple sign rule to a yield: for a yield, a figure *above* the peer median means **cheaper**, i.e. a discount.

| Multiple | NU | Peer Median | Premium / (Discount) |
|---|---:|---:|---:|
| **NTM forward P/E** (primary) | 14.76× | 7.73× | **+90.9%** |
| LTM P/E (diluted, before extraordinaries) | 19.5× | 8.5× | **+129.4%** |
| P/tangible book (current price ÷ LTM TBVPS) | 5.7× | 1.8× | **+216.7%** |
| *Driver: forward ROTE (NTM EPS ÷ LTM TBVPS)* | *38.8%* | *23.1%* | *+67.9%* |
| *Driver: NTM long-term EPS growth* | *33.98%* | *13.17%* | *+158.0%* |
| *Driver: LTM revenue growth* | *44.33%* | *8.07%* | *+449.3%* |
| *Driver: LTM net income margin (vendor bank basis)* | *42.73%* | *27.37%* | *+56.1%* |

At the fresher indicative quote of **USD 15.37** the same three price multiples become 15.85× NTM P/E (**+105.0%**), 21.0× LTM P/E (**+146.6%**) and 6.15× P/TBV (**+241.5%**). Every premium widens; the direction of the finding does not change.

**Arithmetic that matters for §5.** The P/TBV premium is not a third independent fact — it is the product of the other two: `1.909 (forward P/E premium factor) × 1.679 (forward ROTE premium factor) = 3.205`, i.e. +220%, which is the +216.7% P/TBV premium within rounding. So **NU's entire tangible-book premium decomposes cleanly into "the market pays more per dollar of forward earnings" times "NU earns more per dollar of tangible book."** Any adjustment applied to both multiples separately double-counts one of those two factors.

### Is the gap typical or unusual?

**Not assessable on the precise measure.** The pool contains **no peer multiple history** — the comps workbook is a single-date snapshot (As-Of 2026-08-29) with no historical peer medians, and no peer filing is in the pool `[00_valuation-data-triage §5, item 1]`. A three-year series of "NU's premium to the peer median" therefore cannot be computed from this evidence, and I have not invented one.

**What can be said, at a lower evidence tier and labelled as such.** Both legs of the gap moved in the *same* direction over the last six quarters, which means the premium narrowed:

- **NU's own leg fell hard.** NU's quarter-close P/TangBV ran **7.17 → 8.53 → 8.94 → 8.48 → 6.79 → 5.66 → 5.71** from Q1'25 to the 2026-08-28 close, and its P/NTM EPS ran **19.66 → 24.04 → 23.95 → 21.18 → 17.05 → 15.05 → 14.76** `[Nu Holdings Ltd NYSE NU Financials Multiples.xls → tab Multiples, quarterly Close row, 2025-03-31 to 2026-08-28]`. NU's tangible-book multiple is down **36%** from its Sep-2025 close and its forward P/E down **38%**.
- **The peer leg rose.** Itaú's price-to-book went from roughly 1.80 (Sep-2025) to about 1.98–2.00 (Jan-2026), and Bradesco's from a 2024 average of 0.75 to about 1.13 (Jan-2026) `[Web: macrotrends.net / gurufocus.com P/B history pages for ITUB and BBD, read 2026-09-06 — web-sourced, unverified, and on a **price-to-book** basis, not price-to-tangible-book]`.

Both legs point one way, so the honest statement is: **the premium is narrower than it was a year ago, and the narrowing came from both sides at once.** This is a directional read from two named peers on a mismatched basis (P/B against NU's P/TBV), not a measured peer-median gap series. It does not establish what NU's "typical" premium is, because there is no multi-year peer series and NU's own multiple series is only six quarters long — the company listed in December 2021 and the export goes no further back `[00_valuation-data-triage §6A]`. **The relative-gap-over-time check therefore stands as Not assessable on the required measure, with the directional read above offered at its own tier.**

---

## 4. Is the Gap Warranted?

**Partly — a large premium is warranted, and it is smaller than the one on offer at the forward-P/E level once the growth differential is given a finite life.**

NU earns more and grows faster than every listed name in the set, and by wide margins that are measured, not asserted: forward return on tangible equity **38.8% against a 23.1% peer median**, long-term EPS growth **33.98% against 13.17%**, LTM revenue growth **44.33% against 8.07%**, all on the identical Capital IQ basis as of 2026-08-29. `business-model/09_moat.md` grades the cost advantage **78/100** and measures it — about 85% lower cost to serve, 14,314 customers per employee against incumbents' 1,234, a Net Promoter Score of 64 against an incumbent average of 43 that delivers 71% of new Brazilian customers with no acquisition spend at a cost to acquire of USD 7.4 `[FY2025 20-F, Item 4.B; Item 5, p.157]`. A business with those numbers should not trade at 7.73× forward earnings and 1.8× tangible book. Charging NU the peer median unadjusted is the error Capital IQ's own workbook makes, and §5 rejects it.

**But three pieces of evidence cap how large the warranted premium is, and each is a limit on *durability*, not on the current level of returns.** First, the moat verdict is **Narrow, not Strong**, and durability is *explicitly discounted*: `07_business-quality` scores industry rate-of-change **38/100**, tripping the fast-changing-industry filter (CLAUDE.md §24, Filter 5), because Pix, open finance, the card price cap, the capital regime and the virtual-asset regime were each rewritten inside six years `[09_moat §5; 07_business-quality §4]`. Second, **the whole profitable record is three and a half years long and sits entirely inside one benign credit environment** — Brazilian unemployment fell from 6.2% to 5.1% across it, the book is 92% unsecured, and 90+ day non-performing loans were 6.9% at Q2'26 and rising 35bp in the quarter; `07_business-quality` states plainly that "30%+ ROE [is] a peak-of-favourable-conditions number, not a normalised one" `[FY2025 20-F, Item 5 macroeconomic indicators; Q2'26 deck, pp.13, 17; 07_business-quality §3]`. Third, **the growth is capital-constrained**: Tier 1 fell **16.2% → 14.4% → 13.4%** across FY2024, FY2025 and 30 Jun 2026 because 37% FX-neutral portfolio growth outruns even a ~31% return on equity `[FY2025 20-F capital-management note; Q2'26 Interim Report, Note 33(a), p.42]`, and the Brazilian card purchase-volume share gain has decelerated from +2.9pp and +2.3pp to **+0.3pp and +0.5pp** in the last two years `[FY2025 20-F, Item 5, p.164, per ABECS]`.

Two further asymmetries against NU, both cited: **regulatory dependence scores 20/100** — the price of 38% of revenue is capped by Law 14,690/2023, interchange is capped at 0.7%/0.5% by BCB Res. 246, and one rule change cut a product's originations "by about 50% to 60%" `[07_business-quality §1; Q4 2025 earnings call, 25 Feb 2026]` — and **91% of revenue is a single country**, against peers that are either diversified (Credicorp, Banorte, Cibest) or state-backed (Banco do Brasil, whose 0.7× tangible book is partly an owner discount NU does not carry).

**Conclusion: the premium is warranted in kind but not proven in size.** A premium to the peer median is clearly deserved on returns and growth. What the evidence does *not* establish is how many years the growth differential survives — and that is the entire question, because §5 shows the answer moves the implied value by USD 5 a share across a three-to-five-year window the evidence bounds but cannot resolve. At USD 14.30 the market is paying for roughly **3.8 years** of the current differential; at USD 15.37, roughly **4.3 years**. Both sit inside the window. So the honest verdict is: **premium is warranted, but the current price sits at the upper half of what the peer evidence supports, and the case for it rests on a growth runway that three and a half years of data cannot yet prove.**

---

## 5. Implied Value from Peer Multiples

**Basis discipline.** Every application below is like-for-like: a **forward (NTM)** peer multiple applied to NU's **forward (NTM)** metric, a **trailing (LTM)** peer multiple to NU's **trailing (LTM)** metric, a **current** P/TBV to **current** tangible book. NU's NTM EPS is **USD 0.97** and LTM diluted EPS **USD 0.734** `[Company Comparable Analysis → Financial Data; Nu Holdings Ltd NYSE NU Financials Key Stats.xls → tab Key Stats]`; tangible book value per share is **USD 2.50** on the outstanding count `[01 §6]`. Per-share implied values divide by the fully diluted count of 4,878,395 thousand where an equity value is built; where a multiple is applied directly to a per-share metric the result is already per-share, and the dilution effect is 0.99% (USD ~0.15 at these levels) — stated, not buried.

### How the warranted multiple was built

**Primary multiple: NTM forward P/E.** It is the Method Map's primary multiple for a Financial, all ten peers carry it, and it is on the same forward basis as NU's own.

**Sizing method — the growth differential, given a finite life.** Two banks with the same discount rate and the same terminal multiple at year N differ in today's forward P/E by exactly the compounded ratio of their earnings growth over those N years:

`warranted P/E(NU) = peer median P/E × [(1 + g_NU) / (1 + g_peer)]^N`
`= 7.73 × [(1.3398) / (1.1317)]^N = 7.73 × 1.18388^N`

with `g_NU = 33.98%` and `g_peer = 13.17%`, both the Capital IQ NTM long-term EPS growth rates as of 2026-08-29. This charges the premium to **growth**, which is not in the P/E denominator — and deliberately **not** to NU's higher return on tangible equity, which already is (see the double-count ledger below).

| N (years the differential survives) | Warranted NTM P/E | Implied price/share | vs USD 14.30 | vs USD 15.37 |
|---:|---:|---:|---:|---:|
| 3 | 12.83× | **USD 12.44** | −13.0% | −19.1% |
| **4 (base)** | **15.18×** | **USD 14.73** | **+3.0%** | **−4.2%** |
| 5 | 17.97× | **USD 17.44** | +22.0% | +13.5% |

**Why the base is N = 4 and why the window is 3 to 5.** The lower bound is three years because that is the length of NU's entire profitable record (FY2023 to H1'26) and the period over which the moat module says the advantage is actually evidenced; the upper bound is five because the consensus strip carries the growth that far and beyond `[Capital IQ Estimates → Consensus and Multiples tabs, FY2026E–FY2033E]`. The evidence **bounds** the window and does not resolve a point inside it — the durability discount (Filter 5), the three-and-a-half-year record, the decelerating card-share gain and the falling Tier 1 ratio all argue for the short end; the measured 78/100 cost advantage, the Mexican banking licence (operating since 6 Aug 2026) and Colombia growing from 0.8m to 1.7m customers in two years argue for the long end. Taking the midpoint of a window I cannot narrow is the honest choice, and **the inability to narrow it is itself the reason this method's confidence is capped** rather than a detail to bury.

**What the current price implies, solved directly.** At USD 14.30 the forward P/E is 14.76×; `ln(14.76 / 7.73) ÷ ln(1.18388) = 3.83 years`. At USD 15.37 the forward P/E is 15.85× and the answer is **4.25 years**. This is the single most useful, testable number in this module: **the market is paying for roughly four years of NU's current growth differential over its peers, and no more.**

### Implied values across the valid multiples

| Multiple | Applied peer multiple | NU metric (same basis) | Implied price/share | vs USD 14.30 | vs USD 15.37 |
|---|---:|---|---:|---:|---:|
| **NTM forward P/E — warranted, N=4 (BASE)** | **15.18×** | NTM EPS USD 0.97 | **USD 14.73** | **+3.0%** | **−4.2%** |
| NTM forward P/E — warranted, N=3 | 12.83× | NTM EPS USD 0.97 | USD 12.44 | −13.0% | −19.1% |
| NTM forward P/E — warranted, N=5 | 17.97× | NTM EPS USD 0.97 | USD 17.44 | +22.0% | +13.5% |
| P/tangible book — warranted (restated from the base, see ledger) | 5.89× | TBVPS USD 2.50 | USD 14.73 | +3.0% | −4.2% |
| *Sensitivity: base on the 8 NU-named peers only* | *12.47×* | *NTM EPS USD 0.97* | *USD 12.10* | *−15.4%* | *−21.3%* |
| *Sensitivity: base ex-Credicorp (9 peers)* | *14.45×* | *NTM EPS USD 0.97* | *USD 14.02* | *−2.0%* | *−8.8%* |
| **Rejected — NTM P/E at peer parity** | 7.73× | NTM EPS USD 0.97 | USD 7.50 | −47.6% | −51.2% |
| **Rejected — LTM P/E at peer parity** | 8.5× | LTM diluted EPS USD 0.734 | USD 6.24 | −56.4% | −59.4% |
| **Rejected — P/TBV at peer parity** | 1.807× | TBVPS USD 2.50 | USD 4.52 | −68.4% | −70.6% |
| **Rejected — Capital IQ's own EV-based reads** | 0.7× LTM EV/Rev; 0.6× NTM EV/Rev | LTM rev 8,442.1m; NTM rev 25,401.3m | USD 3.10 / USD 5.07 | — | — |

**Base-case point: USD 14.73 per share** — the warranted peer forward P/E of 15.18× applied to NU's NTM EPS of USD 0.97.
**Dispersion across the peer-multiple constructions: USD 12.10 – USD 17.44.** The spread is 44% of the low, so **MODULE_RULES Reconciliation Gate 6 is live for this method taken alone** and its confidence is capped accordingly.

**Why the four "rejected" rows are rejected, by name.** The peer-parity rows apply the peer median unadjusted, which asserts that NU's 38.8% forward return on tangible book and 34% growth are worth nothing. The P/TBV parity row (USD 4.52) is the worst of them and it is **Capital IQ's own published output** `[Company Comparable Analysis → tab Implied Valuation, "= Implied Price per Share", Median column]`: applying a return-blind multiple to a company whose entire advantage is its return on that book charges NU for having a *small* book relative to its earnings — the exact mirror of a margin double-count. It implies a forward P/E of `4.52 ÷ 0.97 = 4.66×`, which is below every company in the comp set. The two EV-based rows are invalid by business type twice over: EV multiples do not apply to a bank, and Capital IQ's "median" for them is a single observation (PagSeguro), not a median at all.

### Quality-adjustment ledger (DOUBLE-COUNT TEST gate)

| Multiple adjusted | Peer median | Adjusted to | Gap already in the denominator? | What the extra adjustment pays for | How it was sized |
|---|---:|---:|---|---|---|
| **NTM forward P/E** | 7.73× | **15.18×** | **YES** — the denominator is NU's own forward EPS, which already carries its higher return on tangible equity (38.8% vs a 23.1% peer median) and its higher net income margin (42.7% vs 27.4%). Those gaps are paid for once, by the metric | **Growth only** — four years of the evidenced forward EPS growth differential (NU 33.98% vs peer median 13.17% NTM long-term EPS growth) before convergence to the peer multiple. **Not** the return gap, **not** the margin gap | `7.73 × [(1.3398)/(1.1317)]^4 = 7.73 × 1.9641 = 15.18×`. The window N = 3–5 is bounded by the three-and-a-half-year profitable record at the low end and the consensus strip at the high end |
| **P/tangible book** | 1.807× | **5.89×** | **NO** — tangible book is return-blind. A book-based multiple carries no information about what NU earns on that book, so a premium sized off the return gap is legitimate here and only here | NU's forward return on tangible equity of 38.8% against the 23.1% peer median, **plus** the same growth differential | **By the identity, not independently:** `warranted P/TBV = warranted forward P/E × forward ROTE = 15.18 × 0.388 = 5.89×`. **This is the P/E result restated in book terms, not a second read** — see the independence note below |

**The test, applied out loud.** The failure mode this gate exists to catch is applying a peer multiple to the company's own weaker metric and then haircutting the multiple as well for the same weakness. NU is the mirror case: its metric is *stronger* than peers', so the risk here is the opposite — **charging the return gap twice on the upside**. If I had taken the peer forward P/E, marked it up for growth AND marked it up again for the 68% ROTE advantage, I would have double-counted, because the ROTE advantage is precisely what makes NU's EPS large relative to its book and is therefore already inside the P/E denominator. It is not. The forward-P/E premium is sized by growth alone; the return advantage enters exactly once, on the P/TBV line, where the denominator is blind to it. No adjustment anywhere in this module is derived as `own margin ÷ peer margin` or as `own ROTE ÷ peer ROTE` applied to an earnings multiple.

**Independence note (CLAUDE.md §16).** The P/TBV implied value of USD 14.73 is **the same number as the P/E implied value, by construction**, because `P/TBV ≡ P/E × ROTE` on a common tangible-book base. It is a consistency check on the arithmetic, **not** a second corroborating method, and `07` must not weight it as one. There is exactly one peer-anchored value in this module, and it is USD 14.73.

### Financial cross-check (required for a bank)

Same forward period throughout: NTM EPS USD 0.97 and current tangible book value per share USD 2.50, so `forward ROTE = 0.97 / 2.50 = 38.80%` in every row. Identity: `P/TBV = forward P/E × forward ROTE`.

| Case / implied value | TBVPS (current, USD) | P/TBV | Forward EPS (NTM, USD) | Implied forward P/E | Forward ROTE | Identity check |
|---|---:|---:|---:|---:|---:|---|
| **Base — warranted N=4: USD 14.73** | 2.50 | **5.89×** | 0.97 | **15.18×** | 38.80% | 15.18 × 0.3880 = 5.89 ✓ |
| Low — warranted N=3: USD 12.44 | 2.50 | 4.98× | 0.97 | 12.83× | 38.80% | 12.83 × 0.3880 = 4.98 ✓ |
| High — warranted N=5: USD 17.44 | 2.50 | 6.98× | 0.97 | 17.97× | 38.80% | 17.97 × 0.3880 = 6.97 ✓ |
| NU-named-8 sensitivity: USD 12.10 | 2.50 | 4.84× | 0.97 | 12.47× | 38.80% | 12.47 × 0.3880 = 4.84 ✓ |
| Memo — current price USD 14.30 | 2.50 | 5.72× | 0.97 | 14.76× | 38.80% | 14.76 × 0.3880 = 5.73 ✓ |
| Memo — indicative price USD 15.37 | 2.50 | 6.15× | 0.97 | 15.85× | 38.80% | 15.85 × 0.3880 = 6.15 ✓ |
| Memo — peer median | 4.73 (median) | 1.79× | — | 7.73× | 23.11% | 7.73 × 0.2311 = 1.79 ✓ |
| Rejected — CIQ P/TBV parity: USD 4.52 | 2.50 | 1.81× | 0.97 | **4.66×** | 38.80% | 4.66 × 0.3880 = 1.81 ✓ — arithmetically consistent and economically absurd |

The identity reconciles in every row within rounding.

**The peer-set maximum is not a ceiling, and the base deliberately exceeds it.** The highest P/TBV in the comp set is 3.4× (BTG Pactual) and the highest forward P/E is 11.97× (Credicorp). The base case sits above both, on evidence rather than by construction: NU's forward return on tangible equity of 38.8% is **above the highest peer** (BTG Pactual, 36.2%) and its long-term EPS growth of 33.98% is **above the highest peer** (Inter & Co, 32.30%). A company that leads the set on both of the two variables that set a bank's multiple cannot be capped at the set's maximum without a separately evidenced economic ceiling, and none exists in this pool. What DOES limit the base is the durability window in the ledger — the number of years the differential survives — not the peer high.

### The cross-check that disagrees, stated rather than averaged away

A second peer-anchored route, built on the cost of capital the peer group itself prices at, lands materially lower and is reported here because MODULE_RULES requires cross-method disagreement to be reconciled or the confidence capped, never split silently.

The peer median trades at 1.787× tangible book on a 23.11% forward return on tangible equity, with peer USD revenue growth of ~8%. Inverting the perpetuity relation `P/TBV = (ROTE − g) / (k − g)` gives an implied cost of equity of `k = 0.08 + (0.2311 − 0.08)/1.787 = 16.5%`. That figure is **independently corroborated from NU's own filings**: `09_moat §3` records the company's disclosed Brazilian cost of equity as **16.51%**. Applying the same relation to NU with a terminal return on tangible equity of 25% (above the 23.1% peer median, reflecting the measured cost advantage, below the current 30–39% that upstream calls a peak-of-favourable-conditions number) and terminal growth of 10% gives a warranted terminal P/TBV of `(0.25 − 0.10)/(0.165 − 0.10) = 2.31×`. Rolled forward on the consensus tangible-book path (FY2028E book value per share of 5.23 less USD 0.24 per share of goodwill and intangibles ≈ 4.99 tangible) and discounted back at 16.5%, that route produces roughly **USD 7 – 9 per share**.

**The two peer-anchored routes disagree by roughly 2×, and the reason is identifiable.** The growth-differential route implicitly holds NU's return on tangible equity near its current level for four years — because it grows EPS at 34% off an unchanged book base. Consensus itself does not model that: the Capital IQ strip implies return on book essentially flat at **26.9% (FY2026E), 26.9% (FY2027E), 27.9% (FY2028E)**, not 35%+ `[Capital IQ Estimates → Multiples tab, P/E and P/BV by fiscal year, and Consensus tab EPS]`. So the base case above is the **generous** of the two peer-anchored reads. I am not averaging them, and I am not moving the base point: the base is the peer-multiple method this module owns, the excess-return route is a model that properly belongs to `04_intrinsic-dcf`, and the gap between them is handed to `07` as the single largest uncertainty in the relative read. **`07` should treat USD 7–9 as an evidenced downside marker from a peer-anchored discount rate, not as noise.**

---

## 6. Sector Cycle Reality Test

The peer median in §2 is a snapshot dated 2026-08-29, not a stable "normal" level, and **the sector it is drawn from has re-rated upward materially over the reference window**. The pool contains no sector-level or peer-level multiple history `[00_valuation-data-triage §5]`, so the check was run on a web-sourced proxy: the price-to-book history of the two largest peers in the set, Itaú Unibanco and Banco Bradesco. Itaú's price-to-book ran roughly **0.90–1.05 across 2021–2022 and 1.08–1.40 across 2023, against about 1.98–2.00 in early 2026** — up roughly **60% versus its 2023 level** and roughly **90–100% versus 2021–22**. Bradesco's ran **0.77 (2023 average) and 0.75 (2024 average) against about 1.13 in early 2026** — up roughly **47%** versus 2023, though still below its 2021 level of about 1.42 `[Web: macrotrends.net "Banco Bradesco SA Price to Book Ratio" and gurufocus.com / ycharts.com "ITUB PB Ratio" history pages, both read 2026-09-06 — web-sourced, unverified]`. Over the **three-year** window both proxies are more than 25% above their own level, in the **same upward direction** as this stock's premium finding, which is the MODULE_RULES trigger. Over the **five-year** window the two disagree (Itaú up, Bradesco down), and that disagreement is stated rather than resolved in the flag's favour. Three limitations travel with this: the proxy is two named peers rather than a sector index or the full peer-group aggregate; it is on a **price-to-book** basis while §2 uses **price-to-tangible-book**; and it is web-sourced, so it sits at §4 tier 10 against the tier-5 comps workbook. **The peer-median anchor is therefore flagged cycle-elevated and this method's confidence contribution is capped at 60 per the Score Cap Rules.** Being at a 91% premium to a peer median that has itself re-rated ~50–60% in three years is a different statement from being at a 91% premium to a settled level.

RF-VAL-001: peer-median anchor cycle-elevated — Brazilian bank proxy (ITUB price/book ~1.08–1.40 in 2023 → ~1.98 in early 2026, +60%; BBDC ~0.77 in 2023 → ~1.13 in early 2026, +47%), web-sourced macrotrends/gurufocus/ycharts P/B history read 2026-09-06, unverified

**Note for `99` on the compounding rule.** `02_multiples-own-history` is expected to report **"Not assessable"** on this same check, because its own reference window is only six quarters (2025-03-31 to 2026-08-28) and no sector history sits in the pool `[00_valuation-data-triage §5, item 1]`. If `02` instead flags its band, the direction will be **opposite** to this one — NU's own P/TangBV close fell from 8.94 to 5.71 over that window while the peer proxies rose — so `02` will likely read "below its own recent band" while `03` reads "premium to a peer group that has itself re-rated." **Those are not two agreeing methods and the compounding cap should not be applied mechanically on the assumption that they are.** They are one company de-rating inside a sector that re-rated, and `99` should say so. Worth stating plainly: `02`'s entire six-quarter window sits *inside* the sector's up-move documented above, so a "cheap versus its own history" read from `02` would be anchored on a window that never contained a normal level — that is a coincidence for `99` to explain, not corroboration for either side.

---

## 7. Relative Read

**NU trades at a 90.9% premium to the peer median on forward earnings (14.76× against 7.73×) and a 216.7% premium on tangible book (5.7× against 1.8×), and a large premium is warranted — it out-earns and out-grows every listed name in the set, at a 38.8% forward return on tangible equity against a 23.1% median and 34% long-term EPS growth against 13%.** The peer-multiple method puts the base-case value at **USD 14.73 per share** (the warranted forward P/E of 15.18× × NTM EPS of USD 0.97), with dispersion of **USD 12.10 – USD 17.44** across the peer-set and durability constructions — essentially level with the pool anchor of USD 14.30 (+3.0%) and 4.2% below the fresher indicative quote of USD 15.37. **The entire result turns on one unresolved number: how many years NU's growth differential survives. The market is paying for about 3.8 years at USD 14.30 and 4.3 years at USD 15.37, and three and a half years of profitable history cannot settle whether that is right.**

Two warnings for `07`, neither of which should be smoothed away. First, **the peer-median anchor is flagged cycle-elevated (§6)**: the Brazilian bank proxy re-rated roughly 47–60% over three years, so being priced at a premium to this median is not the same as being fairly valued against a settled level — and `02`'s own-history band, if it reads NU as below its recent range, is measured inside that same sector up-move and is a coincidence to explain, not independent corroboration. Second, **a second peer-anchored route — the excess-return relation run at the ~16.5% cost of equity the peer group itself prices at, which independently matches NU's own disclosed 16.51% Brazilian cost of equity — supports roughly USD 7 – 9 per share**, about half the base. That gap is not averaged out here; it is handed forward as the largest single uncertainty in the relative read, and it is why this method's confidence contribution is capped.



---

## valuation / 04_intrinsic-dcf.md

_Source: `04_intrinsic-dcf.md`_

# Intrinsic Value — Residual Income (Excess Return on Equity) — NU

**Method gate applied first (MODULE_RULES Business-Type Method Map — Hard Rule).** `00_valuation-data-triage` classifies Nu Holdings as a **Financial (bank)**: Capital IQ balance-sheet and cash-flow templates are the Bank template, the single reportable segment is "Banking", and the regulated operating subsidiaries are Nu Pagamentos and Nu Financeira [FY2025 Form 20-F, Note 1; `00_valuation-data-triage` §3]. **An FCFF DCF and an EV bridge are therefore invalid here and are not built.** LTM cash from operations of −USD 10,304.8m is loan-book and deposit growth running through operating cash flow, not distress [`ciq_facts.json` `ltm_ocf_m`, status `present`]; a "free cash flow" base built on it would be an artefact. This report values **equity directly** with a **residual-income (excess return on equity) model discounted at the cost of equity**, and cross-checks it against a dividend-equivalent read. Every discipline the DCF agent normally carries is kept: every assumption sourced or labelled, the terminal value disclosed as a share of total value, a sensitivity grid, and a bridge to per-share.

**Reporting basis.** IFRS Accounting Standards as issued by the IASB (interim statements under IAS 34); presentation currency **US dollar (USD)**; fiscal year ends 31 December [FY2025 Form 20-F, cover page and Note 2; Q2 2026 Interim Report (Aug-14-2026), KPMG review report]. Nu Holdings is a US-listed foreign private issuer filing Form 20-F — the absence of a 10-K / 10-Q is not a data gap (CLAUDE.md §27). The subsidiaries' functional currencies are the Brazilian real, Mexican peso and Colombian peso [FY2025 20-F, Note 2.a], so **the model is built in USD and the discount rate is a USD cost of equity carrying an explicit country-risk premium** — a BRL rate may not be applied to a USD cash-flow stream without a stated conversion (§15, §27).

**Anchors inherited verbatim from `01_price-and-capital-structure` §7.** Decision line NYSE:NU · USD. Price **USD 14.30** (2026-08-28 close, pool-verified) with a fresher indicative quote of **USD 15.37** (2026-09-04, web-sourced, unverified, +7.48%). Shares for per-share fair value: **4,878,395 thousand fully diluted**. Equity attributable to the parent **USD 13,249.670m**, book value per share **USD 2.716** fully diluted, tangible book **USD 2.479** fully diluted, all as of Jun-30-2026. **No net-debt bridge is used** — for a Financial the EV bridge is informational only, and `01` says so on its face.

**Prior in-house memo not used.** `NU_Holdings_Deep_Dive_15_Page_Memo_30_Aug_2026.pdf` is a §4 tier-9 user note carrying its own target price and scenario weights. It informed nothing here.

---

## 1. Earnings & Book-Value Base and Normalizations

*(This section replaces "FCF Base & Normalizations". A residual-income model is anchored on opening book value and forward earnings, not on free cash flow.)*

**Base date: 30 June 2026. Reporting currency: USD. Reporting standard: IFRS as issued by the IASB.**

| Item | Base-Year Value | Normalization Applied | Source |
|---|---:|---|---|
| Equity attributable to shareholders of the parent (the residual-income capital base, `B0`) | USD 13,249.670m | **None.** Used as filed. Non-controlling interests of USD 2.051m are excluded because the model values the parent's claim only | Q2 2026 Interim Report (Aug-14-2026), statement of financial position; carried verbatim from `01` §6 |
| Fully diluted shares (per-share divisor) | 4,878,395 thousand | Outstanding 4,830,689k + 44,667k options/RSUs on the treasury-stock method + 3,039k acquisition shares; 14,675k antidilutive instruments excluded; no convertibles | `01` §2 Share Count Reconciliation, built from Q2 2026 Interim Report, Note 9 and Note 31 |
| **Opening book value per share `B0`** | **USD 2.716** | `13,249.670 ÷ 4,878.395` | arithmetic on the two rows above |
| H1 2026 actual diluted EPS (the reported stub inside FY2026) | USD 0.3936 | None — as filed | Q2 2026 Interim Report, statements of income, six-month period ended 30-Jun-2026 |
| LTM diluted EPS (context only, not the forecast base) | USD 0.7348 | None | CIQ `Key Stats`, LTM to Jun-30-2026 — vendor export |
| LTM ROE on average equity (context) | 31.63% | Computed on average equity, not the company's peak-quarter annualised 33% headline | CIQ `Ratios` export, FY2021–LTM Jun-30-2026 — vendor export; corroborated by `business-model/09_moat.md` §3 arithmetic |
| **Normalized effective tax rate — cross-orb anchor** | **~26%** | The moat module published a canonical normalized structural rate of **~26%** (the FY2025 audited full-year rate, stripping the H1'26 distortions: USD 280.8m rate-differential effect, USD 108.8m interest on capital, a USD 28.4m one-off CSLL deferred-tax remeasurement, USD 253.6m of credits and incentives). It states the rate is a **floor**, because the enacted CSLL step-ups push it up (payment institutions 9%→12% in 2026–27→15% from 2028; SCFIs 17.5%→20%) | `business-model/09_moat.md` §3, citing Q2 FY26 Interim Report income-tax reconciliation, items (i)–(iii) |

**Tax reconciliation to the moat module, as the rules require.** This model does not build NOPAT — residual income runs on **after-tax** earnings, so the tax rate enters through the EPS strip rather than through a separate line. The reconciliation is therefore a check on what the EPS strip already embeds: consensus embeds an **FY2026 effective tax rate of 27.41%** and an implied **H2 2026 rate of 30.2%**, against management's own "for modelling purposes" guide of 15–20% and an 11.78% rate actually filed for H1 2026 [`earnings/04_guidance-consensus.md` §3 and §5, from `Capital IQ Estimates→Consensus` and the Q2'26 interim statements]. **The earnings base used below is therefore taxed at or above the moat module's ~26% normalized anchor, not below it** — the divergence runs in the conservative direction and no adjustment is made. If management's 15–20% guide proves right, this model understates earnings by roughly 10–12% at the FY2026 level [`earnings/04` §7 arithmetic]; that upside is deliberately left out of the base.

**Normalizations deliberately NOT made, and why.**

| Candidate normalization | Applied? | Reason |
|---|---|---|
| Strip the 40.4% of TTM net income that is a non-cash deferred-tax credit | **No** | `earnings/06_earnings-quality.md` measures it; but the forecast below runs on consensus EPS, which is a forward series and does not carry that trailing item. Removing it from a base I do not use would double-count |
| Normalize the LTM 31.63% ROE down to a through-cycle level in the base year | **No, in the base year — Yes, in the forecast** | A residual-income model does not need a normalized starting return; it needs a normalized *terminal* return. The peak-of-cycle warning from `business-model/07_business-quality.md` §4 ("treat 30%+ ROE as a peak-of-favourable-conditions number") is applied in §2 as the fade path and the terminal ROE, which is where it belongs |
| Adjust book value for the buyback | **No — but flagged as a modelling limitation** | The company repurchased 40.66m Class A shares for USD 500.4m to 30-Jun-2026, an average of ~USD 12.31/share against a book value of USD 2.72 [Q2 2026 Interim Report, Note 31(e)(i)]. Repurchases far above book **reduce** book value per share. The clean-surplus roll-forward in §4 holds the share count fixed, which slightly **overstates** future book value per share. The direction of the error is known and stated; it is small relative to the sensitivity grid |
| Adjust for FX translation reserves breaking clean surplus | **No — flagged** | With BRL/MXN/COP functional currencies, translation moves equity through other comprehensive income, so clean surplus (`ΔB = EPS − DPS`) is an approximation. §4 shows the modelled book path ties to the consensus book-value-per-share strip within 0.7% at FY2026 and 0.3% at FY2027, which is the evidence that the approximation holds over the near term |

---

## 2. Forecast Assumptions

Two explicit phases, then a terminal. **Every cell is labelled company-guided, consensus, peer-derived, or analyst assumption.**

### Phase 1 — consensus period (H2 2026 → FY2028)

| Assumption | H2 2026 | FY2027 | FY2028 | Source / Basis |
|---|---:|---:|---:|---|
| Diluted EPS (USD) | **0.4546** | **1.11006** | **1.45953** | **Consensus.** `Capital IQ Estimates→Consensus`, Fiscal Years block, mean, as-of 2026-08-29 (FY2026 0.8482, 16/16 estimates; FY2027 16/16; FY2028 12/12). H2'26 = FY2026E 0.8482 − H1'26 actual diluted 0.3936 [Q2 2026 Interim Report, six months to 30-Jun-2026] |
| Dividend per share (USD) | **0.00** | **0.1725** | **0.23** | **Consensus.** Same tab, DPS row (7/7 and 8/8 estimates). NU has never paid a dividend and the 20-F says one may not come [FY2025 20-F, Item 3.D; `01` §6A] — the consensus DPS is the Street's assumption, not a company statement |
| Implied ROE on opening book | 33.5% | 35.0% | **35.5%** | **Derived** from the two rows above. Capital IQ's own ROE consensus for the same years is 31.49% / 31.06% / 32.03% [`Estimates→Consensus`, ROE % row] — lower because the vendor uses *average* equity while this model uses *opening* book on a fast-growing base. The two are consistent, not in conflict |
| Effective tax rate embedded | 30.2% (implied) | n/a (inside EPS) | n/a (inside EPS) | **Consensus**, derived in `earnings/04` §3. Above the ~26% moat-module normalized anchor — see §1 |
| Efficiency ratio (context, not a model input) | ~20% FY2026 | — | — | **Company-guided**, reiterated twice: *"we continue to expect the efficiency ratio for the full year to average about 20%"* [Q2 2026 earnings call, Aug-13-2026, prepared remarks] |

### Phase 2 — fade period (FY2029 → FY2038, 10 years) — **analyst assumption, not company-guided**

| Assumption | Path | Source / Basis |
|---|---|---|
| Return on opening book | **Fades linearly from 35.5% (FY2028) to 18.0% (FY2038)** | **Analyst assumption.** Chosen rather than extending the vendor strip because `Capital IQ Estimates→Consensus` carries only **1/1 estimate** for FY2029–FY2035 — a single broker's long-range model, not a consensus. Cross-check in §4 shows this fade produces EPS **above** that single-broker strip in FY2029–FY2034 and 2.1% below it in FY2035, so it is not a conservative earnings path |
| Payout ratio | **Rises linearly from 25% (FY2029) to 83.3% (FY2038)** | **Analyst assumption**, set so the terminal retention is exactly consistent with terminal growth (`1 − g/ROE = 1 − 3.0/18.0 = 83.3%`). The single-broker strip's own payout ramps 33% (FY2029) → 38% (FY2033), so this path is in the same region and then goes further, as a maturing bank must |
| Book value per share | **Clean surplus: `B_t = B_{t−1} + EPS_t − DPS_t`** | Required by the residual-income identity. Tie-out to the consensus book-value strip shown in §4 |
| Share count | **Held at 4,878,395 thousand** | **Analyst assumption**, with the buyback limitation stated in §1 |

### Terminal (FY2039 onward)

| Assumption | Base | Source / Basis |
|---|---:|---|
| Terminal return on equity | **18.0%** | **Analyst assumption, benchmarked — see the Cyclicality Gate below** |
| Terminal growth `g` (USD nominal) | **3.0%** | **Analyst assumption.** Long-run USD-nominal growth for a Brazil-centred lender ≈ Brazilian real GDP growth (2.3% in 2025, 3.4% in 2024 [FY2025 20-F, Item 5 macroeconomic indicators]) + US inflation (~2.0%, the Fed's stated target), i.e. ~4.0–4.5% at purchasing-power parity. **3.0% is deliberately set below that**, because `business-model/09_moat.md` records the annual Brazilian card-share increment collapsing from +2.9pp and +2.3pp to **+0.3pp and +0.5pp**, with 62% of Brazilian adults already customers |
| Terminal payout | **83.3%** | `1 − g/ROE`; makes the terminal internally financeable (Gate 2, checked in §5) |

**Working-capital driver: not applicable, and this is a statement of fact, not an omission.** A bank has no trade working capital. The economic equivalent — the growth in the loan book and the deposits that fund it — is already inside the ROE and retention path above: book value grows only by retained earnings, and the loan book grows with it. There is no working-capital line, no ΔNWC term, and no sign convention to check, because the FCFF identity is not used in this model.

### Cyclicality Gate — terminal ROE benchmarked against peer-normal AND prior-trough (MODULE_RULES Gate 6)

`business-model/10_external-dependency.md` scores external dependency 57/100 (inverted), and `business-model/07_business-quality.md` scores cyclicality **30/100** (weak — high cyclicality) on a book that is 92% unsecured [Q2'26 investor deck, p.13 — managerial basis]. The terminal return is therefore benchmarked, not set "below the recent peak":

| Anchor | Value | Citation |
|---|---:|---|
| **Company's current level (a labelled cycle peak — rejected as a terminal)** | 31.63% LTM ROE / 29.2% return on tangible book | CIQ `Ratios` export, LTM Jun-30-2026 — vendor export; `business-model/09_moat.md` §3 records the CFO calling the Q2'26 33% ROE "a record" |
| **Peer-normal — best large incumbent** | Itaú Unibanco **24.3%** return on tangible book | `Capital IQ Comps → Financial Data`, as-of 2026-08-29 — vendor export, via `business-model/09_moat.md` §4 |
| **Peer-normal — median of the six listed Brazilian/LatAm banks with disclosed returns** | **~15.95%** (Itaú 24.3, BTG 23.7, Inter 16.7, Bradesco 15.2, Santander Brasil 14.7, Banco do Brasil 9.6) | same source |
| **Prior-trough anchor (a)** — weakest listed comparable in the same set | Banco do Brasil **9.6%** return on tangible book | same source |
| **Prior-trough anchor (b)** — NU's own loss-inclusive five-year average ROE | **12.40%** (FY2021 −6.78%, FY2022 −7.81%, FY2023 18.24%, FY2024 28.07%, FY2025 30.28%) | CIQ `Ratios` export, via `business-model/09_moat.md` §3 |
| **Terminal ROE used (base)** | **18.0%** | Sits **above** both trough anchors (9.6% and 12.4%) and above the peer median (15.95%), **below** the best incumbent (24.3%) and far below the company's own peak (31.6%) |

**Why NU's own prior trough is not the whole answer, stated rather than glossed.** `business-model/09_moat.md` §3 is explicit that FY2021–FY2022 were "a scaling business emerging from start-up losses, **not** a credit cycle", and that **no Brazilian consumer downturn exists inside the profitable record at anything like the current book size**. So the 12.40% five-year average is a *young-company* trough, not a *downturn* trough, and the industry anchor (Banco do Brasil 9.6%) is carried alongside it for that reason. The base terminal of 18.0% is a judgment that the measured cost advantage — ~85% lower cost to serve, 14,314 customers per employee against an incumbent average of 1,234 [FY2025 20-F, Item 4.B] — survives a downturn in a diminished form. A case in which it does not is built in §5 as the runoff terminal.

---

## 3. Discount Rate — Cost of Equity (there is no WACC in this model)

**Why there is no WACC.** For a Financial the Method Map requires the equity to be valued directly at the **cost of equity**. A bank's debt and deposits are raw material, not a financing choice sitting alongside equity: deposits of USD 45,328.4m and payables to network of USD 15,541.7m are 74% of Nu's liabilities and are excluded from any EV bridge [`01` §4]. Blending a cost of debt into a "WACC" here would be a category error. **The `after-tax k_d ≤ WACC < k_e` bound in MODULE_RULES Gate 4 is therefore not applicable** — not waived, but structurally absent, because only one leg of the blend exists. The equivalent bound that *is* applied is the low-side floor set below.

| Component | Value | Source |
|---|---:|---|
| Risk-free rate (USD, 10-year US Treasury) | **4.79%** | **Web-sourced, labelled:** US 10-year Treasury note yield, 4.79% on 2026-09-04 [Web: tradingeconomics.com, US 10-Year Government Bond Yield, read 2026-09-06 — indicative, unverified]. A USD risk-free rate is used because the model, the reporting currency and the price are all USD |
| Mature-market equity-risk premium | **4.23%** | **Web-sourced, labelled:** Damodaran mature-market implied ERP, January 2026 [Web: pages.stern.nyu.edu/~adamodar country risk premium dataset, read 2026-09-06 — indicative, unverified] |
| Country-risk premium (Brazil) | **3.24%** | **Web-sourced, labelled:** Damodaran Brazil country risk premium, January 2026 [same source]. **Required, not optional** — 91.3% of geographically-attributed revenue is Brazilian [FY2025 20-F, Note 34(b)]. Applied at 100% weight rather than blended, because Colombia's CRP is higher and Mexico's only modestly lower, and the 9% non-Brazil weight cannot move the blend by more than roughly 0.1pp |
| Beta | **0.94** | `Capital IQ Comps → Operating Statistics`, "5 Year Beta", as-of 2026-08-29 — vendor export. **Window:** five years. **Reference index:** the US-listed NYSE:NU line against a US index, which is the correct pairing for a USD risk-free rate and a US mature-market ERP |
| **Cost of equity `k_e` — computed (CAPM)** | **12.01%** | `k_e = rf + β × ERP_mature + CRP = 4.79% + 0.94 × 4.23% + 3.24%` |
| *Cross-check, single-premium form* | *12.07%* | *`4.79% + 0.94 × 7.74%`, using Damodaran's Brazil total ERP of 7.74% (July 2026 update) — the two constructions agree to 6bp* |
| **Cost of equity `k_e` — USED in the base model** | **13.00%** | **Analyst override of +0.99pp, justified below and inside the ±1.5pp discipline** |

**Formula, pinned (this is an equity-direct model, so there is no `w_e·k_e + w_d·k_d·(1−t)` blend to assemble).** `k_e = risk-free rate + beta × mature-market equity-risk premium + country-risk premium`. Plain meaning: what a shareholder should demand for owning this equity — the return on a safe US government bond, plus extra for owning shares at all, scaled by how much this share moves with the market, plus extra again for the political and currency risk of earning nearly all the money in Brazil. The computed figure was produced by the executed snippet in §4, not assembled by hand.

**The +0.99pp override, in one sentence.** The computed 12.01% is raised to **13.00%** because the company's own disclosed Brazilian cost of equity of 16.51%, translated onto this model's USD basis, lands at **13.98%–14.54%** (§3A), and because the two upstream quality reads that bear on the discount rate both point the same way — `business-model/07_business-quality.md` scores cyclicality **30** and industry rate-of-change **38** (tripping CLAUDE.md §24 Filter 5), and `business-model/09_moat.md` returns **Narrow moat** with an explicit instruction that "the durability period assumed in any DCF should be short". Both the computed and the used figures are shown, the override is 0.99pp (inside the ±1.5pp cap), and the §7 grid runs the model at the un-overridden 11.5% as well as at the higher comparators.

**Beta cross-check against the low-side floor.** The Brazilian-listed peers in the same export show betas of 0.13–0.44 (Itaú 0.16, Bradesco 0.23, Banco do Brasil 0.23, Santander Brasil 0.18, BTG 0.32, Banorte 0.13, Cibest 0.44). Those are **local-index measurement artefacts** and are not used. The four **US-listed** LatAm financial comparables — Inter & Co 0.96, Credicorp 0.86, PagSeguro 1.28, and NU itself 0.94 — cluster around 0.95 and are the matched-basis set [`Capital IQ Comps → Operating Statistics`, as-of 2026-08-29]. Beta 0.94 is therefore sourced, matched-basis, and above the ~0.8 floor; no flooring or re-levering is needed, and both readings are shown.

### Low-side floors — printed and cleared (MODULE_RULES Gate 4)

| Floor | Test | Result |
|---|---|---|
| `k_e − rf ≥ ~4pp` | `13.00% − 4.79% = 8.21pp` (on the computed rate: `12.01% − 4.79% = 7.22pp`) | **Cleared** on both |
| Beta ≥ ~0.8 for a cyclical / competitively-priced business, with source, window and index stated | 0.94; Capital IQ 5-year beta; NYSE:NU line vs a US index; corroborated by three US-listed LatAm financial peers at 0.86–1.28 | **Cleared** — no flooring required |
| Country-risk premium stated, or its omission deliberately stated | Brazil CRP **3.24%** applied at 100% weight; 91.3% of revenue is Brazilian | **Cleared** — stated and applied, not omitted |

### High-side check
Not applicable in the developed-market mega-cap sense (`k_e ≤ rf + 1.4 × ERP` is a test for a low-risk developed-market issuer). For completeness: `4.79% + 1.4 × 4.23% = 10.71%` — this issuer sits above it, and the reason is the explicit, cited country-risk premium of 3.24%, not an unexplained beta.

---

## 3A. Cost-of-Capital Reality Test (mandatory — CLAUDE.md §16, MODULE_RULES Gate 4)

**The filings were searched for disclosed discount rates. One exists, and its scope is proved before it is used.**

| Reference | Rate | Source (cited per §5) | Gap vs model `k_e` (13.00%) |
|---|---:|---|---:|
| Model cost of equity (CAPM build, §3) | 12.01% computed / **13.00% used** | this agent, §3 | — |
| **Scope-matched group discount rate** | **Group discount rate not disclosed** | Nu Holdings discloses no group-level cost of equity or WACC in the FY2025 20-F or the Q2 2026 interim statements. The only rate in the filings is the CGU rate in the row below | — |
| Other disclosed rate — **comparator only** | **16.51% (BRL basis)** → **13.98%–14.54% translated to USD** | FY2025 Form 20-F, Consolidated Financial Statements, Note 3(b) — Impairment of goodwill: *"The discount rate used was the cost of equity for business in Brazil"*, applied to the **Investments activities CGU** (carrying amount USD 567m, goodwill USD 348m), with a 3.69% perpetual growth rate described as "the currently expected long term inflation rate for Brazil". **Scope record: object = named CGU, not the listed group; geography = Brazil (matches, 91.3% of revenue); currency = BRL (mismatch with this USD model); basis = post-tax value-in-use; method = cost of equity (matches).** Three of five match, so this is a **labelled sensitivity comparator, never the base rate** | **model is 0.98–1.54pp below** (USD-matched basis); 3.51pp below on the raw BRL basis, which is a currency mismatch, not a like-for-like gap |
| Market-implied rate | **11.58%** | Solved here by inverting this same model at the pool-verified price of USD 14.30 (arithmetic in §4). `05_reverse-dcf` runs after this agent and owns the formal read — reconcile there | model is **1.42pp ABOVE** the market-implied rate |
| Company's own trailing earnings yield / forward earnings yield | **5.14%** trailing; **7.76%** forward | LTM diluted EPS USD 0.7348 ÷ 14.30 [CIQ `Key Stats`, LTM Jun-30-2026 — vendor export; `01` §1]; FY2027E EPS USD 1.11006 ÷ 14.30 [`Capital IQ Estimates→Consensus`]. **A free-cash-flow yield is not computable and not meaningful** — LTM CFO is −USD 10,304.8m by construction for a growing bank | model is 5.2–7.9pp above — as it must be, since an earnings yield is not a required return |
| Peer / industry cost of capital, if evidenced | **No independent peer cost of capital is evidenced in the pool.** The nearest read is the moat module's own independent CAPM cross-check: **18.8%–20.6% on a BRL basis** → **16.22%–18.56% translated to USD** | `business-model/09_moat.md` §3, "Independent group cross-check — CAPM, *inference, not from filings*": Brazilian nominal risk-free rate 15.00% (the Selic policy rate at the annual-report date), beta 0.94, ERP 4–6pp judgment | model is **3.2pp–5.6pp below** |

**Currency conversion shown, because a BRL rate cannot be compared to a USD rate without it (§15).** `k_e(USD) = (1 + k_e(BRL)) × (1 + US inflation) / (1 + Brazil inflation) − 1`, at Brazil IPCA of **4.26%** for 2025 [FY2025 20-F, Item 3.D: *"Brazil recorded inflation of 4.26% in 2025, 4.83% in 2024, and 4.62% in 2023"*] and US inflation of 2.0%–2.5%:
- 16.51% BRL → `1.1651 × 1.020 / 1.0426 − 1 = 13.98%` … `1.1651 × 1.025 / 1.0426 − 1 = 14.54%`
- 18.8% BRL → 16.22%–16.79%; 20.6% BRL → 17.99%–18.56%

**Escalation branch taken: NONE — the trigger does not fire.** Stated in one line, with the arithmetic: (a) there is **no scope-matched group rate**, so branch (b) is unavailable by rule, and the only disclosed rate is a CGU rate that misses on object and currency; (b) on the currency-matched basis the model rate sits **0.98–1.54pp below** that comparator, well inside the ~3pp threshold; and (c) the market-implied rate is **11.58%**, so the model rate is **above** it, not below two-thirds of it. **No `RF-VAL-003` tag is emitted, because no branch was triggered.** Recording the non-firing explicitly, so it is visible rather than silently skipped: had the un-overridden CAPM rate of 12.01% been published as the base, the currency-matched gap to the disclosed comparator would have been 1.97–2.53pp — still inside the threshold, but close enough that the +0.99pp override in §3 is the honest response rather than a cosmetic one.

**The one divergence that DOES bind, and what is done about it (MODULE_RULES WACC-override discipline, final clause).** The moat module's independent cost-of-capital inference translates to **16.22%–18.56% in USD**, which is **3.2–5.6pp above** the 13.00% used here — more than the ~2pp tolerance. **The §7 grid is therefore run spanning both rates (11.5% → 16.5%) rather than asserting one.** The source of the divergence is named rather than averaged away: the moat module built its BRL rate off the **Selic policy rate of 15.00%**, a deliberately restrictive short-term policy setting [FY2025 20-F, Item 3.D], used as a perpetual risk-free rate. A cyclically-restrictive overnight policy rate is not a long-horizon risk-free rate, and the company's own valuation team did not use one either — its disclosed Brazilian cost of equity is 16.51%, i.e. **1.51pp above the Selic**, not 4–6pp above it. That is why this model does not adopt 16–18%; it is also why the grid is run out to 16.5% so the reader can see what that view is worth.

---

## 4. Residual-Income Forecast & Discounting

**The model, written out.** Residual income is the profit left after charging the shareholders' capital at its own cost: `RI_t = EPS_t − k_e × B_{t−1} = (ROE_t − k_e) × B_{t−1}`. Value per share = **opening book + the present value of every future year's residual income + the present value of the terminal residual-income stream**. If the company only ever earned exactly its cost of equity, the value would be book value and nothing more; everything above book in the table below is excess return.

**Discounting convention: mid-year (t − 0.5), as the default requires.** Cash flows and earnings accrue through the year, so each period is discounted from its midpoint. The half-year stub (H2 2026) is discounted at 0.25 years and carries a **half-year** capital charge (`k_e × 0.5 × B`). The terminal value is a stock at the horizon date and is discounted at the full 12.5 years, not mid-year. **The valuation date is 30 June 2026** (the last audited/reviewed balance sheet), and the result is then accreted forward at `k_e` to the price date of 2026-08-28 (0.164 years) so it is comparable to the price anchor.

| Year | Opening book `B(t−1)` | Diluted EPS | ROE on opening book | Capital charge `k_e × B(t−1)` | Residual income | Discount factor (mid-year) | PV of RI |
|---|---:|---:|---:|---:|---:|---:|---:|
| H2 2026 (stub) | 2.7160 | 0.4546 | 33.5%¹ | 0.1765 | 0.2781 | 0.9699 | 0.2697 |
| FY2027 | 3.1706 | 1.1101 | 35.0% | 0.4122 | 0.6979 | 0.8850 | 0.6176 |
| FY2028 | 4.1081 | 1.4595 | 35.5% | 0.5341 | 0.9255 | 0.7831 | 0.7248 |
| FY2029 | 5.3377 | 1.8028 | 33.8% | 0.6939 | 1.1089 | 0.6931 | 0.7685 |
| FY2030 | 6.5846 | 2.1086 | 32.0% | 0.8560 | 1.2526 | 0.6133 | 0.7682 |
| FY2031 | 7.9201 | 2.3974 | 30.3% | 1.0296 | 1.3678 | 0.5428 | 0.7424 |
| FY2032 | 9.2985 | 2.6517 | 28.5% | 1.2088 | 1.4428 | 0.4803 | 0.6930 |
| FY2033 | 10.6686 | 2.8553 | 26.8% | 1.3869 | 1.4684 | 0.4251 | 0.6242 |
| FY2034 | 11.9773 | 2.9957 | 25.0% | 1.5571 | 1.4386 | 0.3762 | 0.5412 |
| FY2035 | 13.1755 | 3.0644 | 23.3% | 1.7128 | 1.3516 | 0.3329 | 0.4499 |
| FY2036 | 14.2225 | 3.0586 | 21.5% | 1.8489 | 1.2097 | 0.2946 | 0.3564 |
| FY2037 | 15.0891 | 2.9805 | 19.8% | 1.9616 | 1.0189 | 0.2607 | 0.2656 |
| FY2038 | 15.7598 | 2.8368 | 18.0% | 2.0488 | 0.7880 | 0.2307 | 0.1818 |

¹ Annualised: `0.4546 ÷ (2.7160 × 0.5)`. All figures USD per fully diluted share.

**Sum of the present value of explicit residual income: USD 7.0033 per share.**

**Tie-out of the modelled book path to the consensus book-value strip (the clean-surplus check).** Modelled BVPS at FY2026 year-end is **3.1706** against a consensus mean of **3.14772** (+0.7%); at FY2027 year-end **4.1081** against **4.12174** (−0.3%); at FY2028 year-end **5.3377** against **5.22645** (+2.1%) [`Capital IQ Estimates→Consensus`, Book Value / Share row, 9/9, 9/9 and 7/7 estimates]. The approximation holds.

**Tie-out of the fade EPS path against the single-broker long strip (evidence the fade is not conservative).** Modelled EPS vs `Capital IQ Estimates→Consensus` FY2029–FY2035 (1/1 estimate each): FY2029 1.803 vs 1.730 (+4.2%), FY2030 2.109 vs 1.950 (+8.1%), FY2031 2.397 vs 2.170 (+10.5%), FY2032 2.652 vs 2.400 (+10.5%), FY2033 2.855 vs 2.630 (+8.6%), FY2034 2.996 vs 2.880 (+4.0%), FY2035 3.064 vs 3.130 (−2.1%). **The base case sits above the Street's own long-range earnings path in six of seven years.** The gap to the price is therefore not produced by a pessimistic earnings forecast.

**Executed command and raw output — the base case, the terminal value, the per-share bridge, the CAPM build and the financeable-growth check.** Nothing in this report is mental arithmetic.

```
$ python3 snip.py
k_e=0.130  B0=2.7160  PV(RI)=7.0033  B_T=16.2326  TV=8.1163  PV(TV)=1.7615
Value/sh 2026-06-30 = 11.4807 ; accreted to 2026-08-28 = 11.7132 ; TV share = 15.3%
CAPM k_e = 4.79% + 0.94x4.23% + 3.24% = 12.006%
financeable g = ROE x retention = 0.180 x 0.1667 = 0.0300
```

The script that produced it, in full (it is the model — a reader can re-run it and reproduce every number above):

```python
ke,B0,g,tR,F = 0.130, 13249.670/4878.395, 0.030, 0.180, 10
cons=[(0.5,0.8482-0.3936,0.0),(1.0,1.11006,0.1725),(1.0,1.45953,0.23)]
B,t,pv = B0,0.0,0.0
for d,e,dv in cons:
    pv += (e-ke*d*B)/(1+ke)**(t+d/2); B += e-dv; t += d
r0 = 1.45953/4.1081; p0, pT = 0.25, 1-g/tR
for i in range(1,F+1):
    w=i/F; roe=r0+(tR-r0)*w; pay=p0+(pT-p0)*w
    pv += (roe-ke)*B/(1+ke)**(t+0.5); B += roe*B*(1-pay); t += 1
tv=(tR-ke)*B/(ke-g); pvtv=tv/(1+ke)**t; V=B0+pv+pvtv
```

**Market-implied cost of equity, solved on the same model (feeds §3A and hands the formal read to `05`).** Holding the identical earnings path, terminal ROE of 18.0% and terminal `g` of 3.0%, and solving for the `k_e` that reproduces the pool-verified price of USD 14.30, gives **11.58%** (bisection over 80 iterations, same script). At the fresher indicative price of USD 15.37 the implied rate is lower still.

---

## 5. Terminal Value

**Method and formula, written out rather than applied from memory.**

`TV_T = RI_{T+1} / (k_e − g)`, where `RI_{T+1} = (ROE_terminal − k_e) × B_T` is the first year of excess return *after* the explicit forecast and `g` is its perpetual growth rate. `k_e − g` must stay comfortably positive: as `g` approaches `k_e` the denominator collapses and the terminal value runs away to infinity.

- `B_T` (book value per share at end-FY2038): **USD 16.2326**
- `RI_{T+1} = (18.0% − 13.0%) × 16.2326 = USD 0.8116`
- `k_e − g = 13.0% − 3.0% = 10.0pp` — a wide, safe gap; no grid cell in §7 comes anywhere near convergence (the narrowest cell is `11.5% − 4.0% = 7.5pp`), so **no cell is NM/invalid** and none is reported as a number it does not deserve.
- **Terminal value (undiscounted): USD 8.1163 per share**
- **PV of terminal value: USD 1.7615 per share** (discount factor 0.2170 at 12.5 years)
- **Terminal value as a share of total value: 15.3%** — far below the 75% escalation line. **This model is not terminal-dominated.** Book value contributes 23.7% and the explicit residual-income stream 61.0%. That is the structural advantage of a residual-income model over a cash-flow DCF for a bank: most of the answer sits in numbers that already exist or are forecast by 12–16 analysts, not in a perpetuity.

**Exit-multiple cross-check of the terminal, both ways.** The terminal implies a price-to-book at the horizon of `1 + (ROE − k_e)/(k_e − g) = 1 + (18% − 13%)/(13% − 3%) = **1.50×** book`. For a mature bank earning 18% on equity against a 13% cost of equity that is a sane exit level — it sits **below** the current peer median price-to-tangible-book of **1.8×** [`Capital IQ Comps → Trading Multiples`, medians, as-of 2026-08-29] and far below NU's own 5.7× today. Read the other way, applying the 1.8× peer median to `B_T` would raise the terminal value by about 20% and the total value by about 3%. The two readings agree that the terminal is not where this valuation is decided.

**Financeable-growth cross-check (Gate 2, adapted to a bank).** For a lender, growth must be funded by retained earnings if the capital ratios are to hold: `g = ROE × retention rate`. Terminal: `18.0% × (1 − 83.3%) = 18.0% × 16.67% = **3.00%**` — **exactly** the modelled terminal `g`, by construction. Gap: **0.0pp**, well inside the ~1.5pp tolerance. This is not a coincidence dressed up as a check; the terminal payout was *derived* from `1 − g/ROE` precisely so the terminal cannot assume growth the balance sheet cannot fund. The check that matters is that the resulting payout (83.3%) is achievable, and it is — a mature bank growing at 3% and earning 18% can pay out five-sixths of its earnings. The near-term path is the tighter constraint, and it is a real one: `business-model/07_business-quality.md` records Tier 1 falling **16.2% → 14.4% → 13.4%** over eighteen months and CET1 **14.7% → 13.0% → 11.9%** while paying no dividend, because 37% FX-neutral portfolio growth outruns even a ~31% return on equity [FY2025 20-F capital-management note; Q2 FY26 Interim Report, Note 33(a)]. The consensus payout of 0% / 15.5% / 15.8% in FY2026–FY2028 is what makes the near-term path financeable, and it is consensus, not an assumption of mine.

**ROIC-drift rule (Gate 3), stated.** The terminal return trends toward but does not reach the cost of equity: 18.0% against a 13.0% `k_e`, a persistent excess of 500bp. That persistence is an **inference**, and it is cited: `business-model/09_moat.md` returns **Narrow moat** with four evidenced sources — cost advantage 78/100, brand 72, scale 68, distribution 60 — and a measured ~85% lower cost to serve. The same file discounts durability because `07_business-quality.md` scores rate-of-change 38. A 500bp perpetual excess is the middle of those two facts, not a reading of either alone.

### Structural-decline / runoff terminal (avoid-ruin, CLAUDE.md §24 Filter 5) — **the trigger fired**

**Which trigger, and the row it comes from.** Trigger (a) — "No moat proven" — did **not** fire: `business-model/09_moat.md` §5 returns **Narrow moat**, i.e. a moat that is proven and narrow, with a **stable** trajectory, and that file states expressly that its verdict "is **not** an erosion signal for the permanent-impairment / declining-perpetuity trigger". **Trigger (b) fired on its second leg:** `business-model/07_business-quality.md` §1 scores **industry rate-of-change / disruption risk at 38 — weak, ≤ 40**, and tags **RF-BQ-005 (fast-changing industry)**. A declining-perpetuity terminal is therefore mandatory and is built below.

**How it is built, on the same nominal USD basis as the rest of the model (no real rate is smuggled in).** Excess returns fade far faster and then go negative: ROE fades from 35.5% (FY2028) to **12.0%** by FY2033 — **below** the 13.0% cost of equity, i.e. the franchise ends up destroying value on new capital — and terminal `g` is set at **1.5% nominal USD**, at or below expected US inflation of ~2.0%, which is a **negative real** growth rate stated in nominal terms as required.

| Year | Opening book | EPS | ROE | Residual income | PV of RI |
|---|---:|---:|---:|---:|---:|
| H2 2026 | 2.7160 | 0.4546 | 33.5% | 0.2781 | 0.2697 |
| FY2027 | 3.1706 | 1.1101 | 35.0% | 0.6979 | 0.6176 |
| FY2028 | 4.1081 | 1.4595 | 35.5% | 0.9255 | 0.7248 |
| FY2029 | 5.3377 | 1.6452 | 30.8% | 0.9513 | 0.6593 |
| FY2030 | 6.3659 | 1.6626 | 26.1% | 0.8350 | 0.5121 |
| FY2031 | 7.1972 | 1.5410 | 21.4% | 0.6054 | 0.3286 |
| FY2032 | 7.7751 | 1.2989 | 16.7% | 0.2881 | 0.1384 |
| FY2033 | 8.0998 | 0.9720 | 12.0% | **(0.0810)** | (0.0344) |

- PV of explicit residual income: **USD 3.2160**; `B_T` = **USD 8.2213**; `RI_{T+1} = (12.0% − 13.0%) × 8.2213 = −USD 0.0822`; `TV = −0.0822 / (13.0% − 1.5%) = −USD 0.7149`; **PV of terminal value = −USD 0.2859** (a *negative* terminal — the model is paying to hold a franchise that earns below its cost of capital).
- **Runoff value: USD 5.6462 at 2026-06-30, USD 5.76 accreted to 2026-08-28.**

**What this number is and is not.** It is **not** the base case and it does not replace it — `04` publishes one base intrinsic value (§6) and shows the runoff beside it. It is the **structural-impairment input** that `07_scenario-and-fair-value` should carry as its structural-reset bear leg (a 24–36 month path, distinct from any cyclical trough), and that the master synthesizer should read against CLAUDE.md §24 and the Kill Criteria. In plain terms: if a Brazilian consumer downturn arrives on a book that is 92% unsecured and 6.9% already 90+ days past due, while the enacted CSLL step-ups lift the tax rate and the statutory card-interest cap holds the price of 38% of revenue, **the equity is worth roughly USD 5.76 — about 60% below the pool-verified price.** That is the down-leg this model can measure, and it is measurable precisely because the moat module was honest that no Brazilian consumer downturn exists inside NU's profitable record.

---

## 6. Model Output — equity-direct (there is NO enterprise-value bridge)

> **No EV → equity bridge is built, and this is a rule, not an omission.** For a Financial the Method Map bars the EV bridge as a value, and `01` §4 shows why: an enterprise value for NU excludes USD 45,328.4m of deposits and USD 15,541.7m of payables to network — USD 60.9bn, roughly 74% of the bank's liabilities. The residual-income model values the **equity** directly, so the bridge is: book value + present value of excess returns = equity value per share. There is no net debt to subtract, no minority to deduct (NCI is USD 2.1m and is already excluded from the parent-only book), and no preferred (none exists) [`01` §4].

| Step | Value (USD per fully diluted share) |
|---|---:|
| Opening book value per share (Jun-30-2026, equity attributable to parent ÷ 4,878.395m) | **2.7160** |
| + PV of explicit residual income, H2 2026 → FY2038 (mid-year discounting at 13.0%) | **7.0033** |
| + PV of terminal residual income (Gordon form, `g` = 3.0%) | **1.7615** |
| **= Intrinsic equity value per share, as of 2026-06-30** | **11.4807** |
| × accretion to 2026-08-28 at `k_e` (0.164 years) | ×1.0203 |
| **= Intrinsic equity value per share, as of 2026-08-28 (the price date)** | **USD 11.71** |
| − Minority interest | 0.00 — already excluded (parent-only book; NCI USD 2.1m) |
| − Preferred equity | 0.00 — none exists [`01` §4] |
| Memo: total equity value implied | `11.71 × 4,878.395m = USD 57,124m` |
| **vs current price (pool-verified anchor, 2026-08-28)** | **USD 14.30 — the model value is 18.1% BELOW the price** |
| **vs fresher indicative price (2026-09-04, web-sourced, unverified)** | **USD 15.37 — the model value is 23.8% below** |

**Implied multiples at the base value, as a sanity read.** USD 11.71 is **4.31×** the fully diluted book value of USD 2.716, **4.72×** tangible book of USD 2.479, and **10.55×** FY2027 consensus EPS of USD 1.11006. The price of USD 14.30 is 5.27× book, 5.77× tangible book and 12.88× FY2027 EPS. So this model does not say the shares should trade near book — it says they should trade at a **high** multiple of book, just a lower one than today's.

**Where the value comes from — the honest decomposition.** 23.7% of the value is book value that already exists; 61.0% is the present value of excess returns over the next 12.5 years, of which the three genuine-consensus years (H2 2026–FY2028) contribute 1.61 of the 7.00, i.e. **14.0% of total value**; and 15.3% is the terminal. The largest single block — roughly 47% of the total — is the **self-built fade from FY2029 to FY2038**, which is an analyst assumption benchmarked against a one-broker strip. That is where a reader should push back first.

---

## 7. Sensitivity Grid (intrinsic value per fully diluted share, USD, as of 2026-08-28)

The two most value-determining inputs in a residual-income model are the **cost of equity** and the **terminal return on equity** — not the terminal growth rate, which barely moves the answer here because the terminal is only 15.3% of value. Both grids are shown. Columns span the full range demanded by §3A: the un-overridden CAPM build (11.5%, rounded down from 12.01% to give the low column real width), the base (13.0%), the currency-translated company-disclosed comparator (14.5%), and the moat module's independent inference translated to USD (16.5%).

**Primary grid — cost of equity × terminal ROE (terminal `g` held at 3.0%)**

| Terminal ROE | `k_e` 11.5% | **`k_e` 13.0% (base)** | `k_e` 14.5% | `k_e` 16.5% |
|---|---:|---:|---:|---:|
| 22% (bull terminal) | 17.76 | 14.25 | 11.71 | 9.27 |
| 20% | 16.10 | 12.96 | 10.69 | 8.50 |
| **18% (base)** | 14.48 | **11.71** | 9.70 | 7.76 |
| 16% (≈ peer median 15.95%) | 12.91 | 10.50 | 8.74 | 7.02 |
| 14% (near NU's own loss-inclusive 5-yr average of 12.4%) | 11.38 | 9.31 | 7.79 | 6.31 |

**Secondary grid — cost of equity × terminal growth (terminal ROE held at 18.0%)**

| Terminal `g` | `k_e` 11.5% | **`k_e` 13.0% (base)** | `k_e` 14.5% | `k_e` 16.5% |
|---|---:|---:|---:|---:|
| 4.0% | 15.26 | 12.13 | 9.92 | — |
| 3.5% | 14.85 | 11.91 | 9.81 | — |
| **3.0% (base)** | 14.48 | **11.71** | 9.70 | 7.76 |
| 2.5% | 14.15 | 11.53 | 9.61 | — |
| 2.0% | 13.85 | 11.37 | 9.52 | — |

**No cell is NM or invalid.** The narrowest `k_e − g` gap in either grid is 7.5pp (11.5% − 4.0%), nowhere near the convergence zone where a Gordon denominator blows up.

**Read of the grid in one line each.** Moving the cost of equity by 1.5pp moves the value by roughly USD 2.4–2.8 (about 21–24%); moving terminal ROE by 2pp moves it by roughly USD 1.2–1.6 (about 11–13%); moving terminal `g` by a full percentage point moves it by about USD 0.35 (3%). **The cost of equity is the dominant assumption, and terminal growth is nearly irrelevant.** The whole grid spans **USD 6.31 to USD 17.76**; the price of USD 14.30 is cleared only in the top-left region — `k_e` at or below about 11.6% with a terminal ROE at or above 18%, or a terminal ROE of 22% at a 13.0% cost of equity.

**Two additional labelled points, so the reader can see the effect of the §3 override and of the §5 trigger:**
- At the **un-overridden CAPM rate of 12.01%** with the same base assumptions: **USD 13.45** — 5.9% below the price.
- **Bull terminal** (terminal ROE 22%, `g` 3.5%, `k_e` 13.0%): **USD 14.58** — roughly at the price.
- **Runoff / structural-impairment terminal** (§5): **USD 5.76** — 59.7% below the price.

---

## 8. Intrinsic Read

**Base-case intrinsic value: USD 11.71 per fully diluted share** (as of 2026-08-28), against a pool-verified price of USD 14.30 — the model sits **18.1% below the price**, and 23.8% below the fresher indicative quote of USD 15.37. The sensitivity grid disperses that point over **USD 6.31 to USD 17.76**, with the labelled structural-impairment runoff at USD 5.76; the price is cleared only where the cost of equity is 11.6% or lower *and* the terminal return on equity holds at 18% or better. This is not a pessimistic-earnings result — the model's own earnings path runs **above** the Street's long-range strip in six of the seven years where a comparison exists, and it accepts the full consensus EPS of USD 0.85 / 1.11 / 1.46 for FY2026–FY2028 taxed at a rate above the moat module's ~26% normalized anchor.

**The single assumption it is most sensitive to is the cost of equity**, which moves the value by about 22% per 1.5 percentage points and is the reason the answer sits where it does: 13.0% is a **USD** rate carrying an explicit 3.24% Brazil country-risk premium, and it is bracketed on one side by the pure CAPM build of 12.01% (value USD 13.45) and on the other by the company's own disclosed Brazilian cost of equity of 16.51%, which translates to 13.98–14.54% in USD (value USD 9.70–10.7). The second-order assumption is the terminal return on equity of 18%, benchmarked above the six-bank peer median of 15.95% and both trough anchors (Banco do Brasil 9.6%, NU's own loss-inclusive five-year average 12.40%) but well below NU's current, explicitly peak, 31.6%.

**Confidence and caveats carried forward to `07` and `99`.** (1) Roughly 47% of the base value comes from a **self-built ten-year fade**, because the vendor's FY2029–FY2035 strip is a single broker's model (1/1 estimates) and is not a consensus — that is the first place to push back. (2) The moat module's independent cost-of-capital inference translates to 16.22–18.56% in USD, more than 2pp above the rate used, so the grid is run out to 16.5% rather than one rate being asserted; the divergence is explained (a restrictive 15.00% Selic policy rate used as a perpetual risk-free rate) but not resolved. (3) `01`'s price-staleness cap (valuation confidence max 70) travels with the price-relative reads above, not with the fair-value level, which is price-independent. (4) The clean-surplus roll-forward holds the share count fixed and therefore slightly overstates future book value per share, because the buyback is executing at roughly 4.5× book. **This model is `05_reverse-dcf`'s canonical input: cost of equity 13.00%, opening book USD 2.716, the consensus EPS strip above, terminal ROE 18.0%, terminal `g` 3.0%, mid-year discounting — `05` inverts these, it does not re-derive them.**



---

## valuation / 05_reverse-dcf.md

_Source: `05_reverse-dcf.md`_

# Reverse DCF — What's Priced In — NU

**Method gate, applied before anything else (MODULE_RULES Business-Type Method Map — Hard Rule).** `00_valuation-data-triage` §3 classifies Nu Holdings as a **Financial (bank)**, so an FCFF (free-cash-flow-to-the-firm) construction and an enterprise-value bridge are invalid for this issuer, and `01` §4 labels its EV bridge informational only. A "reverse-DCF solving for free-cash-flow growth" is therefore not the right question here and is **not** built: LTM cash from operations is **−US$10,304.8m** because a growing bank's loan book and deposits run through operating cash flow [`ciq_facts.json` `ltm_ocf_m`, status `present`]. This report **inverts the equity-direct residual-income model `04_intrinsic-dcf` built** — same cost of equity, same opening book, same consensus earnings strip, same terminal growth, same horizon, same mid-year discounting — and asks what the *price* requires on that identical basis.

**Price-state check (MODULE_RULES Partial-Data rule).** `01` §7 tags the price-state **`pool-verified`** (US$14.30, 2026-08-28 close, corroborated across three Capital IQ exports). This agent may therefore run. `01` also records the anchor as stale by 5 exact trading sessions with a corroborated fresher indicative quote of **US$15.37** (2026-09-04, web-sourced, unverified, +7.48%), and instructs downstream agents to show price-relative reads at **both** prices. Every solve below is run at both and labelled.

**Nothing here is hand-computed.** Every number in §2, §2A and §4 came out of an executed Python solver (bisection root-find), and the commands, the script and the raw roots are printed in §2B (fix F11).

---

## 1. Inputs

Every input is taken **verbatim from `04_intrinsic-dcf`** (MODULE_RULES Calculation Standard 9 — the reverse-DCF must invert the SAME model). Nothing was re-derived here. `04` §8 states this explicitly: *"This model is `05_reverse-dcf`'s canonical input: cost of equity 13.00%, opening book USD 2.716, the consensus EPS strip above, terminal ROE 18.0%, terminal `g` 3.0%, mid-year discounting — `05` inverts these, it does not re-derive them."*

| Input | Value | Source |
|---|---:|---|
| Current price (anchor) | **US$14.30** (2026-08-28 close) | from `01` §1/§7 — price-state `pool-verified` |
| Fresher indicative price | **US$15.37** (2026-09-04 close) | from `01` §1 — *web-sourced, not from data pool, unverified*, +7.48% |
| Enterprise value | **Not used — invalid for a Financial.** `01` §4 gives US$61,243.3m and labels it informational only; it omits US$60.9bn of deposits and payables to network | from `01` §4/§7 |
| Market capitalisation solved against | **US$69,078.8m** at US$14.30 (US$74,247.7m at US$15.37) | from `01` §3 |
| Fully diluted shares (per-share divisor) | 4,878,395 thousand | from `01` §2 |
| **Base for the solve — opening book value per share `B0`** | **US$2.7160** (equity attributable to parent US$13,249.670m ÷ 4,878.395m, Jun-30-2026) | from `04` §1, built on Q2 2026 Interim Report (Aug-14-2026), statement of financial position |
| **Base for the solve — normalized earnings strip** | H2 2026 **US$0.4546**, FY2027 **US$1.11006**, FY2028 **US$1.45953** diluted EPS; dividends 0.00 / 0.1725 / 0.23 | from `04` §2 — `Capital IQ Estimates→Consensus`, EPS (GAAP) mean, as-of 2026-08-29 (16/16, 16/16, 12/12 estimates); H2'26 = FY2026E 0.8482 − H1'26 actual 0.3936 [Q2 2026 Interim Report, six months to 30-Jun-2026] |
| **Discount rate used — cost of equity `k_e`** | **13.00%** (CAPM build 12.01% = 4.79% risk-free + 0.94 × 4.23% mature-market equity-risk premium + 3.24% Brazil country-risk premium, then a stated +0.99pp analyst override) | from `04` §3. **There is no WACC in this model** — for a Financial the Method Map requires the equity to be valued directly at the cost of equity, so the `after-tax k_d ≤ WACC < k_e` bound is structurally absent, not waived |
| Terminal growth `g` | **3.0%** (USD nominal) | from `04` §2 |
| Forecast horizon | **12.5 years** — H2 2026 stub + FY2027–FY2028 consensus + a 10-year fade FY2029–FY2038, then a Gordon terminal | from `04` §2/§4 |
| Discounting convention | **Mid-year (t − 0.5)**; stub at 0.25 yrs with a half-year capital charge; terminal discounted at the full 12.5 yrs; value accreted from 2026-06-30 to the price date at `k_e` | from `04` §4 |
| Terminal return on equity (the thing `04` assumed and this agent solves for) | 04's base assumption **18.0%** | from `04` §2 |

**Tie-out, printed before any solve is trusted.** Re-running `04`'s model with these inputs reproduces its published output to the fourth decimal: value/share **11.7130** (04 publishes 11.71), present value of explicit residual income **7.0032** (04: 7.0033), present value of the terminal **1.7615** (04: 1.7615), terminal book value per share **16.2324** (04: 16.2326). The two models are the same model. Raw output in §2B.

---

## 2. Implied Expectations

**What was held fixed, and what was solved for — stated exactly.** Held fixed: the cost of equity at 13.00%, the opening book of US$2.716, the full consensus earnings and dividend strip through FY2028, terminal growth of 3.0%, the 12.5-year horizon, the mid-year convention, and the shape of the fade (a straight line from the FY2028 return of 35.53% on opening book to the terminal return, with the payout ratio rising in step and pinned to `1 − g/ROE` at the end so the terminal is self-funding). **Solved for: the terminal return on equity — the steady-state profit the company earns on each dollar of shareholders' money once growth has normalised — that makes the model's value equal today's price.** That is the residual-income model's exact analogue of "implied growth" in a cash-flow DCF: in this model form, value above book comes only from earning more than the cost of equity, so the price is a statement about how much excess return, for how long.

| What the price implies | Solved value at **US$14.30** (pool-verified) | Solved value at **US$15.37** (indicative) |
|---|---:|---:|
| **Implied terminal (steady-state) return on equity** — the primary solve | **22.08%** | **23.64%** |
| Implied excess return over the 13.0% cost of equity, in perpetuity | **+9.08pp** | **+10.64pp** |
| Implied earnings CAGR, FY2028 → FY2038 (derived from that solve) | **9.39%** | **10.28%** |
| Implied earnings CAGR, FY2026 → FY2038 (12 years, off the consensus FY2026E of 0.8482) | **12.75%** | **13.51%** |
| Implied FY2038 diluted EPS | **US$3.5813** (net income US$17,471m) | **US$3.8827** (US$18,941m) |
| Implied exit price-to-book at the FY2038 horizon `1 + (ROE − k_e)/(k_e − g)` | **1.91×** | **2.06×** |
| Terminal value as a share of total value at the solved point | **23.5%** | **26.0%** |
| **Secondary solve — implied years of above-normal returns (fade removed):** how many years the company must hold its FY2028 return of **35.53%** flat, with **zero** excess return in every year after, to justify the price | **7.68 years** (to FY2036) | **8.20 years** (to FY2037) |
| *Memo: the same secondary solve run against `04`'s own base value of US$11.71* | *6.23 years* | — |

**Reading the two solves together.** They are two ways of saying the same thing. Either NU settles into a **permanent 22.1% return on equity** — roughly 900 basis points above what it costs to raise that equity, forever — or it keeps earning its current, explicitly peak, ~35% return for **another 7.7 years** and then earns exactly its cost of equity and nothing more. The price does not distinguish between them; both are the same present value.

**A third thing the price implies, and the most concrete one.** Run `04`'s model unchanged — 13.0% cost of equity, 18.0% terminal return, 3.0% terminal growth — but swap the consensus mean earnings strip for the **top of the analysts' range** (FY2026 0.91 / FY2027 1.30 / FY2028 1.77 [`Capital IQ Estimates→Consensus`, EPS (GAAP) High row, as-of 2026-08-29]). The value is **US$14.65**, just above the price. **In plain terms: at US$14.30 the market is paying for the best earnings forecast on the Street, with no downgrade to `04`'s long-run terminal assumptions.**

### 2A. Implied Discount Rate — the dual solve

The §2 solve holds the discount rate fixed and asks what return the price needs. This is the mirror: hold `04`'s **own base-case earnings path** fixed (terminal return 18.0%, terminal `g` 3.0%, same horizon, same convention) and solve for the discount rate that makes the present value equal the price.

| Solve | Held fixed | Solved value |
|---|---|---:|
| Implied cost of equity at `04`'s base-case cash flows — **at US$14.30** | `04`'s EPS path, terminal ROE 18.0%, `g` 3.0%, 12.5-yr horizon, mid-year | **11.58%** |
| Implied cost of equity — **at US$15.37** | same | **11.12%** |
| `04`'s model cost of equity (for comparison) | — | **13.00%** (CAPM build 12.01%) |
| **Ratio (implied ÷ model), at US$14.30** | — | **0.891×** |
| **Ratio (implied ÷ model), at US$15.37** | — | **0.856×** |

**Reported into `04` §3A, and it agrees.** `04` §3A already carries the market-implied rate of **11.58%** in its Cost-of-Capital Reality Test table and records that the model rate sits **1.42pp above** it. This agent re-solved it independently on the same model and reproduces **11.5825%** — the two agree to two decimal places. `04`'s escalation logic is therefore confirmed, not overturned: the trigger requires the model rate to sit **below ~two-thirds of** the market-implied rate, and here it sits **above** it, so **no escalation branch fires and no `RF-VAL-003` tag is due.**

**Which way it cuts — both readings stated, as the rule requires.** The ratio is **below 1.0**, not above 1.5, so the "market is pricing an unprecedented collapse" failure mode is not in play. The disagreement runs the other way, and it still has two readings:

- **Reading A — the cash flows are wrong (too low).** The market expects more profit than `04` modelled. That is the §2 solve restated: the market needs a terminal return of 22.1% where `04` assumed 18.0%. Tested against the evidence in §3 below, this requires NU to hold, permanently, a return close to what the single best-run large Brazilian incumbent earns today.
- **Reading B — the rate is wrong (too high).** The market accepts a lower required return than 13.0%. This is the weaker of the two, and the reason is specific: **11.58% is 2.40–2.96pp below the cost of equity Nu Holdings' own management uses**, once translated onto this model's USD basis. The FY2025 20-F discloses a Brazilian cost of equity of **16.51%** in its goodwill-impairment test [FY2025 Form 20-F, Consolidated Financial Statements, Note 3(b)], which `04` §3A translates to **13.98%–14.54% in USD** at Brazil's disclosed 4.26% IPCA inflation. So the market's implied required return is below both the model's rate *and* management's own. Reading B would have to argue the company itself over-discounts Brazilian risk.

**Default reading and why.** MODULE_RULES makes Reading B the default only where the model rate **failed a low-side floor** or sits **far below** the company's own disclosed rate. Neither holds: `04` §3 prints all three low-side floors as cleared (equity-risk premium over the risk-free rate 8.21pp against a ~4pp floor; beta 0.94 against a ~0.8 floor, sourced, matched-basis, corroborated by three US-listed Latin American financial peers at 0.86–1.28; a stated 3.24% Brazil country-risk premium), and the model rate sits **0.98–1.54pp below** the currency-matched company comparator, well inside the ~3pp threshold. **Reading A is therefore taken: this is a statement about expected profit, not about the discount rate.** One honest qualifier travels with that: if anything, the *company's own* disclosed rate suggests 13.0% is a touch **low**, which would make the implied expectations in §2 harder still, not easier — the robustness table in §4 shows what that does.

### 2B. Executed solver — commands, script and raw roots (fix F11)

```
$ python3 solve.py
TIE-OUT 04 base: ke=13.0% tROE=18.0% -> V=11.7130 (04 says 11.71); PV(RI)=7.0032 (7.0033); PV(TV)=1.7615 (1.7615); B_T=16.2324 (16.2326); fade-start ROE=35.5277%
SOLVE1 pool 14.30: implied terminal ROE = 22.0798%  check V=14.3000  TVshare=23.5%  B_T=16.706 implied exit P/B=1.91x
SOLVE1 indic 15.37: implied terminal ROE = 23.6420%  check V=15.3700  TVshare=26.0%  B_T=16.916 implied exit P/B=2.06x

$ python3 solve2.py
SOLVE2 04 base (tROE 18.0%): FY2038 EPS=2.8367; FY2028->FY2038 EPS CAGR=6.87%; FY2026->FY2038 CAGR=10.58%
SOLVE2 price 14.30 (tROE 22.08%): FY2038 EPS=3.5813; FY2028->FY2038 EPS CAGR=9.39%; FY2026->FY2038 CAGR=12.75%
SOLVE2 price 15.37 (tROE 23.64%): FY2038 EPS=3.8827; FY2028->FY2038 EPS CAGR=10.28%; FY2026->FY2038 CAGR=13.51%
SOLVE3 pool 14.30: implied years of excess return at the FY2028 peak ROE of 35.53% = 7.68 yrs (check V=14.3000)
SOLVE3 indic 15.37: implied years of excess return at the FY2028 peak ROE of 35.53% = 8.20 yrs (check V=15.3700)
SOLVE3 04 base value 11.71: implied years of excess return at the FY2028 peak ROE of 35.53% = 6.23 yrs (check V=11.7100)
SOLVE2A pool 14.30: implied cost of equity = 11.5825%  (04 model ke = 13.00%; ratio 0.891x)  check V=14.3000
SOLVE2A indic 15.37: implied cost of equity = 11.1247%  (04 model ke = 13.00%; ratio 0.856x)  check V=15.3700
ROB-A ke=12.0%: implied terminal ROE @14.30 = 19.16% ; @15.37 = 20.54% ; base-case value @tROE18% = 13.45
ROB-A ke=13.0%: implied terminal ROE @14.30 = 22.08% ; @15.37 = 23.64% ; base-case value @tROE18% = 11.71
ROB-A ke=14.0%: implied terminal ROE @14.30 = 25.20% ; @15.37 = 26.94% ; base-case value @tROE18% = 10.31
ROB-B LOW  (Street low 0.75/0.77/1.170): base-case value @tROE18% = 9.24 ; implied terminal ROE to reach 14.30 = 27.47%
ROB-B BASE (Street mean 0.848/1.110/1.460): base-case value @tROE18% = 11.71 ; implied terminal ROE to reach 14.30 = 22.08%
ROB-B HIGH (Street high 0.91/1.30/1.77): base-case value @tROE18% = 14.65 ; implied terminal ROE to reach 14.30 = 17.52%
ROB-C terminal g=2.5%: implied terminal ROE @14.30 = 22.56% ; base value @tROE18% = 11.53
ROB-C terminal g=3.0%: implied terminal ROE @14.30 = 22.08% ; base value @tROE18% = 11.71
ROB-C terminal g=3.5%: implied terminal ROE @14.30 = 21.59% ; base value @tROE18% = 11.91
```

The model function, in full — it is `04`'s script with the solved variable freed and a bisection root-find wrapped around it, so a reader can re-run it and reproduce every root above:

```python
B0 = 13249.670/4878.395                                   # 04 s1: opening book/share, Jun-30-2026
CONS_BASE = [(0.5,0.8482-0.3936,0.0),(1.0,1.11006,0.1725),(1.0,1.45953,0.23)]   # 04 s2 consensus strip
F, ACC_0828, ACC_0904 = 10, 0.164, 0.164+7/365            # 04 s4 fade length and accretion to each price date

def model(ke, tR, g=0.030, cons=CONS_BASE, fade=F, p0=0.25, acc=ACC_0828):
    B, t, pv = B0, 0.0, 0.0
    for d, e, dv in cons:                                  # consensus phase, mid-year, half-year capital charge on the stub
        pv += (e - ke*d*B)/(1+ke)**(t+d/2); B += e - dv; t += d
    r0 = cons[2][1]/(B0 + sum(e-dv for _,e,dv in cons[:2]))   # FY2028 return on opening book = 35.5277%
    pT = 1 - g/tR                                          # terminal payout pinned so growth is self-funded
    for i in range(1, fade+1):                             # linear fade of return and payout, FY2029-FY2038
        w = i/fade; roe = r0 + (tR-r0)*w; pay = p0 + (pT-p0)*w
        pv += (roe-ke)*B/(1+ke)**(t+0.5); B += roe*B*(1-pay); t += 1
    tv = (tR-ke)*B/(ke-g); pvtv = tv/(1+ke)**t             # Gordon terminal on residual income, full-year discount
    return (B0 + pv + pvtv)*(1+ke)**acc                    # accreted from 2026-06-30 to the price date

def brentq(f, a, b, xtol=1e-10):                           # bisection (scipy unavailable in this sandbox)
    fa, fb = f(a), f(b); assert fa*fb < 0, "no sign change"
    for _ in range(300):
        m = (a+b)/2; fm = f(m)
        if fa*fm <= 0: b, fb = m, fm
        else: a, fa = m, fm
        if b-a < xtol: break
    return (a+b)/2

root = brentq(lambda tR: model(0.130, tR, acc=ACC_0828) - 14.30, 0.131, 0.60)   # -> 0.220798
```

---

## 3. Implied vs Achievable

**Base-rate discipline first (CLAUDE.md §9), because the obvious comparison here is the wrong one.** The claim being tested is a **terminal, steady-state return on equity** and a **decade-long mature earnings CAGR**. NU's headline history — net income to parent of **−165.0 → −364.6 → 1,030.6 → 1,972.1 → 2,868.9** US$m across FY2021–FY2025, i.e. **+91.4% in FY2024 and +45.5% in FY2025**, and **+56.8%** in the twelve months to Jun-30-2026 [`earnings/01_historical-financials.md` §1 and §2] — is **not** the matched base rate for either claim. Those are the growth rates of a company emerging from start-up losses on a small base; the unit, the level and the period all differ from a mature-decade claim. `business-model/09_moat.md` §3 says so directly: FY2021–FY2022 were *"a scaling business emerging from start-up losses, **not** a credit cycle"*. Using that history to bless the implied number would be exactly the metric/level/period mismatch §9 exists to stop. The matched base rates are set out row by row below.

| Implied requirement | Company history (matched unit / level / period) | Earnings- and business-module evidence | Achievable? |
|---|---|---|---|
| **Terminal return on equity of 22.08%, in perpetuity** (23.64% at US$15.37) | NU's own returns: LTM **31.63%** on average equity, but the CFO called the Q2'26 33% figure *"a record"*; FY2023 18.24%, FY2024 28.07%, FY2025 30.28%; loss-inclusive five-year average **12.40%** [CIQ `Ratios` export, FY2021–LTM Jun-30-2026 — vendor export, via `business-model/09_moat.md` §3]. Peer-matched, same metric, same period: Itaú Unibanco **24.3%** return on tangible book; six-bank Brazil/LatAm median **15.95%**; Banco do Brasil **9.6%** [`Capital IQ Comps → Financial Data`, as-of 2026-08-29 — vendor export] | The implied 22.08% is **6.13pp above the six-bank peer median** and **2.2pp below the single best incumbent**. `business-model/09_moat.md` returns **Narrow moat**, trajectory **stable**, with the cost advantage measured (an ~85% lower cost to serve; 14,314 customers per employee against an incumbent average of 1,234 [FY2025 20-F, Item 4.B]) but explicitly discounted for durability. Three named pressures push the other way: the book is **92% unsecured** with 90+ day non-performing loans at **6.9%**, up 35bp in the quarter; the enacted CSLL tax step-ups (payment institutions 9%→12%→15% from 2028; credit companies 17.5%→20%) raise the tax rate mechanically; and the price of the largest revenue line is capped by Law 14,690/2023 [`business-model/09_moat.md` §5; `earnings/07_earnings-sensitivity.md` §2a] | **Stretch** — requires NU to earn, permanently, roughly what the best-run large incumbent earns today |
| **Earnings CAGR of 9.39% from FY2028 to FY2038** | Matched-period base rate: the only long-range earnings path in the pool is a **single broker's** strip (1/1 estimate per year) — FY2029 1.73 rising to FY2035 3.13, a **10.39%** CAGR FY2029→FY2035 and **11.51%** from FY2028 [`Capital IQ Estimates→Consensus`, EPS (GAAP), as-of 2026-08-29]. Street consensus long-term growth is **33.98%** (3/3 estimates, range 42.00%/29.95%) — a 3–5 year rate, not a mature-decade rate, and not comparable | The implied **CAGR** is slightly *below* the broker strip's, but that is the wrong test on its own — value depends on **levels**, and the implied earnings **level** runs above that strip in **every** overlapping year: FY2029 **+5.5%**, FY2030 +11.0%, FY2031 +15.4%, FY2032 +17.7%, FY2033 **+18.2%**, FY2034 +16.0%, FY2035 +12.2%. `04` §4 had already shown its *own* base path sitting above the strip in six of seven years; the price requires more still | **Stretch** — the level, not the growth rate, is the binding constraint |
| **7.68 more years of the FY2028 peak return (35.53%), with zero excess return thereafter** | The profitable record is **three and a half years old** and contains **no Brazilian consumer downturn at anything like the current book size** [`business-model/09_moat.md` §3]. Every profitable year ran with Brazilian unemployment falling to 5.1% | `business-model/07_business-quality.md` scores cyclicality **30/100** and industry rate-of-change **38/100**, tripping the fast-changing-industry filter (CLAUDE.md §24, Filter 5, tag RF-BQ-005); `09_moat.md` instructs that *"the durability period assumed in any DCF should be short"*. `earnings/07_earnings-sensitivity.md` scores earnings volatility **66/100 (inverted: higher = worse)** — three variables can each move net income by more than 13% in a year: credit cost (±US$530–583m), BRL/USD (+US$394m / −US$578m) and the tax rate (+US$257m / −US$549m at the bound) — while **40.4% of the last twelve months' reported profit is a non-cash deferred-tax credit** [`earnings/06_earnings-quality.md`, via `07` §7] | **No** — a 7.7-year peak-return runway is directly contradicted by the module that scored the industry's rate of change |

**The judgement, in four sentences.** At US$14.30 the market's expectations are **aggressive**, and the sharpest way to see it is that the price is roughly what `04`'s model produces on the **top of the analysts' earnings range** (US$14.65) with no improvement to the long-run terminal — so the mean forecast is not what is being paid for. The implied steady-state return of **22.08%** sits 6.13pp above the median of the six listed Brazilian and Latin American banks and just 2.2pp below Itaú, meaning the market is underwriting NU to settle permanently at best-incumbent profitability on a loan book that is 92% unsecured and has never met a downturn. The one honest counterweight, stated rather than buried: NU's **realised** profit growth has beaten this kind of expectation repeatedly and recently — net income up **56.8%** in the twelve months to Jun-30-2026 and **+66.5% year-on-year in Q2'26** [`earnings/01_historical-financials.md` §2/§3] — so a reader who believes the fade should start later than FY2029 gets a materially different answer, and the sensitivity that matters most is the one in §4 on the earnings base. But the implied number is a **terminal** return, and no amount of near-term beat rate settles what NU earns in 2038.

**Market-ceiling sanity check — substituted, not forced (one-directional: it can only raise the bar).** NU is a Financial taken through an equity-direct model, so a revenue-share-of-TAM test is not meaningful and is **not** run. The appropriate scale substitute is the **profit pool**. Management's own estimate is that Nu holds about **"7% market share of that profit pool"** in Brazil against a roughly **US$100bn** gross pool [Q2 FY26 earnings call transcript, 13 Aug 2026, Q&A — CLAUDE.md §4 tier-6, an internal management estimate, not an audited or third-party figure], and the FY2025 20-F separately puts group share at *"approximately 5% of SAM"* [FY2025 20-F, Item 4.B, p.20 — internal estimate]. The implied FY2038 profit of **US$17,471m is 4.84× the LTM net income of US$3,607.1m**; growing the pool at the model's own 3.0% USD nominal terminal rate over 12.5 years (a factor of 1.447×) gives an implied share of `7.0% × 4.84 ÷ 1.447 =` **about 23% of the Brazilian profit pool**, against 7% today (25% at US$15.37; 19% on `04`'s own base case). **This raises the bar but is not a kill signal:** a ~23% share is roughly the level the single largest incumbent plausibly occupies today, so it is a share a peer has held rather than one no peer has ever held. Two caveats that cut in opposite directions and are stated rather than netted: NU also earns in Mexico and Colombia, so part of the implied profit sits **outside** the Brazilian pool and the true required Brazilian share is lower than 23%; and the 3.0% USD pool-growth assumption is the model's own terminal rate, not a sourced market forecast — market size is a low-tier input (CLAUDE.md §4) and this check is presented as an order-of-magnitude test, not a measurement. **The check does not lift the implied expectations toward "achievable"; nothing in it may be read as upside.**

---

## 4. Robustness

**A. Sensitivity to the discount rate** (holding the earnings base, terminal `g` and horizon fixed):

| Cost of equity | Implied terminal ROE to justify **US$14.30** | Implied terminal ROE to justify **US$15.37** | `04` base-case value at its own 18.0% terminal ROE |
|---|---:|---:|---:|
| `k_e` − 1pp = **12.0%** | **19.16%** | 20.54% | US$13.45 |
| **`k_e` = 13.0% (base)** | **22.08%** | 23.64% | US$11.71 |
| `k_e` + 1pp = **14.0%** | **25.20%** | 26.94% | US$10.31 |

*Span across ±1pp on the rate: 6.04pp of implied terminal ROE.* The 12.0% row is close to `04`'s un-overridden CAPM build of 12.01%, and its base-case value of US$13.45 matches `04` §7's own labelled point exactly.

**B. Sensitivity to the earnings base — the larger swing factor.** The band is not invented here: it is the **high and low of the same analyst estimates `04` used for its mean** [`Capital IQ Estimates→Consensus`, EPS (GAAP) High and Low rows, as-of 2026-08-29].

| Earnings base (FY2026 / FY2027 / FY2028 diluted EPS) | `04` model value at its own 18.0% terminal ROE | Implied terminal ROE to justify **US$14.30** |
|---|---:|---:|
| **Low** — Street low 0.75 / 0.77 / 1.170 | US$9.24 | **27.47%** |
| **Base** — Street mean 0.8482 / 1.11006 / 1.45953 | US$11.71 | **22.08%** |
| **High** — Street high 0.91 / 1.30 / 1.77 | US$14.65 | **17.52%** |

*Span across the analysts' own range: **9.95pp** of implied terminal ROE.*

**Which input dominates, named.** **The earnings base, not the discount rate.** The full analyst range moves the implied terminal return by **9.95pp** (17.52% → 27.47%) against **6.04pp** for a ±1pp move in the cost of equity — roughly 1.6× the swing. The finding inside that is the one worth carrying: on the **low** end of the Street's own range the price needs a **27.47%** perpetual return, above Itaú's 24.3% and within striking distance of NU's own record peak; on the **high** end it needs only **17.52%**, marginally *below* `04`'s 18.0% assumption. The whole disagreement about NU's valuation sits in FY2027–FY2028 earnings, which the Street itself cannot agree on — its FY2027 range is 0.77 to 1.30, a **69% spread** around a mean of 1.11 with a standard deviation of 0.12215 across 16 estimates.

**C. Terminal growth ±0.5pp — shown, though not required.** Terminal value is **23.5%** of total value at the solved point (26.0% at US$15.37), far below the ~60% line that would make this mandatory, so the model is **not terminal-dominated**. Run anyway, it confirms that: `g` = 2.5% → implied terminal ROE 22.56%; `g` = 3.0% → 22.08%; `g` = 3.5% → 21.59%. A full percentage point on terminal growth moves the implied return by less than 1pp, which is why `04` called terminal growth *"nearly irrelevant"* in this model form and why the two tables above are where the argument actually lives.

---

## 5. What's-Priced-In Read

At **US$14.30** (2026-08-28, pool-verified), the market is pricing Nu Holdings to earn a **permanent 22.1% return on shareholders' equity** — about **9.1 percentage points more than the 13.0% it costs to raise that equity, forever** — or, equivalently, to hold its current record ~35% return for another **7.7 years** and then earn nothing above its cost of capital ever again. At the fresher indicative **US$15.37** (2026-09-04, web-sourced, unverified) the requirement rises to **23.6%**, essentially the **24.3%** that Itaú Unibanco — the best-returning large Brazilian incumbent — earns today.

That is **aggressive**, on three pieces of evidence. First, the implied return sits **6.13pp above the median of the six listed Brazilian and Latin American banks (15.95%)** and demands best-incumbent economics in perpetuity from a lender whose book is **92% unsecured**, whose 90+ day non-performing ratio is **6.9% and rising**, and whose entire profitable record — three and a half years — contains no Brazilian consumer downturn. Second, the price is roughly what `04`'s own model produces on the **top of the analysts' earnings range (US$14.65)**, so the mean forecast is not what is being paid for; the implied earnings **level** runs 5.5%–18.2% above the only long-range broker path in the pool in every year it can be compared. Third, the required **7.7-year runway of peak returns** is contradicted by the engine's own modules, which score the industry's rate of change at **38/100** and instruct that any assumed durability period be short.

Set against `04`'s base value of **US$11.71**, today's price embeds **US$2.59 per share (18.1%) of expectation the model does not carry** — and US$3.66 (23.8%) at the fresher quote. The market's implied cost of equity of **11.58%** is meanwhile **2.40–2.96pp below the cost of equity NU's own management uses to value a Brazilian business in its impairment test** (16.51% BRL, 13.98–14.54% translated to USD). Both readings point the same way: this is priced for the fade to start later and end higher than either `04` or management's own valuation inputs assume. If NU delivers the top of the Street's FY2027–FY2028 range, the price is fair on `04`'s unchanged terminal; if it delivers the mean, the price already contains the whole of a best-incumbent steady state, and there is no cushion left in it.

---

## Self-check against the module rules

- Price and share count match `01` §7 verbatim; price-state is **`pool-verified`**, so the agent may run. Both the pool anchor and the fresher indicative quote are carried through every solve, labelled (`01`'s re-anchor rule).
- The cost of equity (13.00%), the base (opening book US$2.716 + the consensus EPS strip), terminal growth (3.0%), horizon (12.5 yrs) and convention (mid-year) are taken from `04_intrinsic-dcf` **verbatim**; nothing was re-derived. The tie-out in §1 reproduces `04`'s published value to four decimals.
- The equity-direct residual-income form is used because the Business-Type Method Map bars an FCFF/EV reverse-DCF for a Financial.
- Every root in §2, §2A and §4 came from an executed bisection solver; commands, script and raw output are printed in §2B.
- The §2A dual solve was run, compared to `04`'s rate as a ratio (0.891× / 0.856×), reported into `04` §3A where it already appears at 11.58%, and both readings are stated with the evidence for choosing Reading A.
- Robustness spans the discount rate **and** the earnings base (and terminal `g`, though the 23.5% terminal share does not require it), with the earnings base named as dominant.
- Base rates are matched to the claim's unit; the mismatched consolidated start-up-phase growth history is named and explicitly rejected as the wrong yardstick.
- No scenario probabilities, no probability-weighted target, no rating, no position size — those belong to `07` and the master synthesizer.



---

## valuation / 06_sum-of-the-parts.md

_Source: `06_sum-of-the-parts.md`_

# Sum-of-the-Parts — NU

**Verdict up front: SOTP does not exist for this company.** Nu Holdings reports **one** operating and reportable segment — Banking, meaning the whole Group, 100% of revenue and 100% of pre-tax profit — and the company states this itself: *"The CODM considers the whole Group as a single operating and reportable segment."* `[FY25 Form 20-F (filed 8 Apr 2026), Note 34 (Segment information), p.F-97; restated verbatim in Q2 FY26 Interim Report (14 Aug 2026), Note 34, p.43]` Per the MODULE_RULES Segment / SOTP Rule and this agent's partial-data rule, **SOTP collapses to the consolidated read**. I am not manufacturing a breakup.

**Reporting basis.** IFRS Accounting Standards as issued by the IASB (interim under IAS 34); presentation currency **US dollars (USD)**, filings presented in thousands; fiscal year ends **31 December**; US SEC foreign private issuer, so the annual filing is Form 20-F, not a 10-K `[FY25 Form 20-F, cover page and Note 2]`. All figures below are USD unless stated.

**Business type governs the method.** The `00` triage classifies NU as a **Financial (bank)**. Under the Business-Type Method Map, **EV-based multiples, an FCFF DCF, and the EV bridge as a value are invalid here** — value equity directly. So the "gross enterprise value" line the report structure normally carries is replaced below by an equity-level value, and the substitution is stated rather than assumed. `01`'s own enterprise-value figure of USD 61,243.3m is labelled informational-only for exactly this reason (it omits USD 60.9bn of deposits and payables to network).

**Upstream inputs read.** `00_valuation-data-triage.md`, `01_price-and-capital-structure.md`, `business-model/03_segment-map.md`, `business-model/08_competitive-map.md`. Anchors are taken from `01` verbatim: price **USD 14.30** (2026-08-28 close, pool-verified); fresher indicative **USD 15.37** (2026-09-04, web-sourced, unverified, +7.48%); shares for per-share fair value **4,878,395 thousand** fully diluted; net debt **NET CASH USD 7,744.6m, strict basis**. No anchor is substituted.

**Not used as evidence.** `data/NU/NU_Holdings_Deep_Dive_15_Page_Memo_30_Aug_2026.pdf` is a prior engine output carrying its own target and case weights (§4 tier-9 user note). It was not read for and did not inform any number here.

---

## 1. Segment Inventory

**Reporting currency: USD.** Figures are USD millions on the Capital IQ bank-template basis (which for a bank reports "Total Revenue" *after* interest expense and loan-loss provisions), cross-checked to the filing.

**Denominator definition (so no share can exceed 100% unexplained).** The "% of Total EBIT" column below uses **reportable-segment pre-tax profit** as the denominator. For NU that denominator is *identical to* consolidated pre-tax profit, because the single segment is the whole group. There is therefore **no corporate / unallocable bucket to net off** — the two are the same number, and I show the tie-out.

| Segment | Revenue (FY2025) | Pre-tax profit (FY2025) | Margin | % of Total pre-tax profit | Source |
|---|---:|---:|---:|---:|---|
| Banking (the whole Group) | 6,991.2 | 3,868.4 | 55.3% | **100.0%** | `Capital IQ Financials → Segments export (NU), Business Segments, FY2025 column, filing date 2026-02-25 — vendor export` |
| Corporate / unallocated | **none exists** | **none exists** | — | 0.0% | Same export — the segment table has no reconciling line; segment totals equal group totals exactly |
| **Total (= consolidated)** | **6,991.2** | **3,868.4** | 55.3% | **100.0%** | `Capital IQ Financials → Income Statement export (NU), FY2025: Total Revenue 6,991.185; EBT Incl. Unusual Items 3,868.419 — vendor export` |

**Reconciliation Gate 3 — the bucket that could vanish, and why it cannot here.** Segment revenue 6,991.185 equals consolidated Total Revenue 6,991.185, and segment Net Profit Before Tax 3,868.419 equals consolidated EBT 3,868.419, to the third decimal `[Capital IQ Financials → Segments and Income Statement exports (NU), FY2025 columns — vendor export]`. The same holds for tax (996.747) and net profit after tax (2,868.892). **Zero residual.** Corporate cost is not dropped by assertion — it is already inside the single segment's own profit line, and the forward metric used in §3 (consensus earnings per share) is a consolidated, after-tax, after-all-corporate-cost, attributable-to-shareholders number. There is nothing left to capitalize and subtract.

**A definitional note carried from upstream, not flattened.** The vendor's FY2025 revenue of USD 6,991.2m and the 20-F's own Note-34 revenue base of USD 12,083.8m are **both correct on their own basis** and are not interchangeable: the vendor figure is after interest expense (4,578.7) and expected credit losses (4,204.9); the Note-34 base is a gross customer-facing revenue definition `[business-model/03_segment-map.md §1a; FY25 Form 20-F, Note 34(b), p.F-97]`. The segment share is 100% on either basis, so the choice does not move this report's conclusion.

**Latest period, same conclusion.** LTM to 30 Jun 2026: Total Revenue 8,442.1, EBT 4,384.6, net income 3,607.1, diluted EPS 0.734069 `[Capital IQ Financials → Income Statement export (NU), LTM Jun-30-2026 column — vendor export]`. The single-segment disclosure is repeated word-for-word in the Q2 FY26 interim `[Q2 FY26 Interim Report (14 Aug 2026), Note 34, p.43]`.

### 1b. Disclosed splits — a labelled cross-check, NOT a reportable-segment SOTP

The filing discloses geography and product/income type as **disaggregation**, not as segments. **Profit is not disclosed for either.** `[FY25 Form 20-F, Note 34(b) and Note 6, pp.F-97, F-30–F-31]`

| Disclosed split | FY2025 revenue share (Note-34 base) | H1 FY2026 share | Profit disclosed? | Forward estimate available? |
|---|---:|---:|---|---|
| Brazil | 91.4% (11,038.3) | 90.9% (7,576.9) | **No** | **No** |
| Mexico | 6.7% (808.1) | 7.2% (603.6) | **No** | **No** |
| Other countries (incl. Colombia, US) | 2.0% (237.3) | 1.8% (152.8) | **No** | **No** |
| Interest — personal loans | 39.6% (4,784.3) | 40.0% (3,337.3) | **No** | **No** |
| Interest — credit card | 38.0% (4,597.8) | 40.3% (3,361.6) | **No** | **No** |
| Credit & prepaid card income (interchange) | 14.2% (1,720.3) | 12.3% (1,021.2) | **No** | **No** |
| Late fees / other receivables / other fees / insurance | 8.1% (981.5) | 7.3% (613.2) | **No** | **No** |

`[FY25 Form 20-F, Note 34(b) and Note 6(a)/6(b), pp.F-97, F-30–F-31; Q2 FY26 Interim Report (14 Aug 2026), Note 34(b) and Note 6, pp.43, 16]`

**Two reasons this split cannot become a SOTP, stated plainly.**
1. **No profit by country or product, at all** — so any "segment EBIT" would be invented from a revenue share. `business-model/03_segment-map.md §3` is explicit that downstream agents must treat segment-level profitability as *Not disclosed* and must not construct it from revenue shares. I do not.
2. **The revenue base itself is incomplete.** Note 34's base excludes treasury income — USD 3,691.0m, or **23.4% of the group's USD 15,774.7m of total interest and fee income in FY2025** (20.5% in H1'26) `[FY25 Form 20-F, Note 6(a) and Note 34(b), pp.F-30, F-97]`. So roughly a fifth to a quarter of what the group earns sits nowhere in the geographic table.

**Where the regulatory capital sits — a third lens, with its basis mismatch named.** At 30 Jun 2026 the three regulated operating entities held Brazil USD 5,597.6m (90.2%), Mexico USD 427.6m (6.9%) and Colombia USD 179.7m (2.9%) of USD 6,204.9m total `[Q2 FY26 Interim Report (14 Aug 2026), Note 33(a)(b)(c), pp.42–43]`. **This is not a value allocation and must not be used as one:** regulatory capital is a prudential measure at named subsidiaries, while group equity attributable to shareholders is USD 13,249.7m `[Q2 FY26 Interim Report, statement of financial position]` — the three regulated entities' regulatory capital is only **46.8%** of group equity (`6,204.9 / 13,249.7`). Different measurement, different scope, so the two may not be treated as one share (§15 matched-basis rule). It corroborates direction only: Brazil carries ~90% of the business on every disclosed lens available (revenue 91.4%, regulatory capital 90.2%, deposits 80.2% of USD 45.3bn `[Q2 FY26 earnings call transcript, 13 Aug 2026, prepared remarks]`).

---

## 2. Segment Multiples & Comparables

**Because there is one segment, there is one multiple — and it is the consolidated multiple.** This section is the dominant-segment sanity check the partial-data rule permits. It is **not** an independent valuation method (see §5).

**Period basis: NTM (next twelve months) for every line.** No trailing multiple is used as a value input.

| Segment | Metric used | Multiple applied | Named comparable | Comparable's multiple | Source |
|---|---|---:|---|---:|---|
| Banking (= whole Group) | **NTM consensus EPS USD 0.97** (GAAP, IFRS basis; FY2026E 0.8482 on 16 estimates and FY2027E 1.11006 on 16 estimates bracket it) | **10.68× NTM P/E** (base point — the midpoint of the two closest-economics anchors below) | **Banco BTG Pactual S.A. (BOVESPA:BPAC11)** — closest match on the economics that set a bank's multiple: forward return on tangible book **36.2%** vs NU's **38.8%**, the nearest in the whole set | **9.39× NTM P/E** | `Capital IQ Estimates export → Consensus tab (NYSE:NU), as-of 2026-08-29`; `Capital IQ Comps → Trading Multiples and Financial Data (Nu Holdings comp set), As-Of Date 2026-08-29, USD — vendor export`; return arithmetic mine |
| — upper anchor | same | 11.97× | **Credicorp Ltd. (NYSE:BAP)** — the highest-rated financial in the set, a LatAm multi-country banking group with a 24.6% forward return on tangible book; it marks what this peer group will pay for a high-return LatAm financial | 11.97× | `Capital IQ Comps → Trading Multiples, 2026-08-29 — vendor export` |
| — same-business-model anchor | same | 6.51× | **Inter & Co, Inc. (NasdaqGS:INTR)** — the only branchless, digital-only Brazilian retail bank in the set: identical distribution model, same country, same regulator | 6.51× | `Capital IQ Comps → Trading Multiples, 2026-08-29 — vendor export` |
| — peer-median reference (**mismatched — see below**) | same | 7.73× | Peer median of the 10-name LatAm financial set (Itaú 8.16×, Santander Brasil 7.61×, Grupo Cibest 7.84×, Banorte 8.17×, Bradesco 6.08×, Banco do Brasil 5.14×, BTG 9.39×, Credicorp 11.97×, Inter 6.51×, PagSeguro 5.03×) | 7.73× | `Capital IQ Comps → Trading Multiples, Summary Statistics, 2026-08-29 — vendor export` |

**Why BTG Pactual fits, in one clause.** A bank's multiple is set by the return it earns on its tangible equity and by how fast it can grow that equity; BTG is the only name in the set within 3 percentage points of NU on that return (36.2% vs 38.8%), which is the economic property that matters, not the surface label of "investment bank vs consumer lender."

**Why the peer median does NOT fit, with the numbers.** All eleven companies are measured on the identical two vendor fields (NTM EPS ÷ LTM tangible book value per share), so this is matched-basis:

| | Nu Holdings | BTG Pactual | Credicorp | Itaú | Inter & Co | Peer median (10) |
|---|---:|---:|---:|---:|---:|---:|
| Forward return on tangible book (NTM EPS ÷ LTM TBVPS) | **38.8%** | 36.2% | 24.6% | 27.5% | 21.0% | **23.1%** |
| EPS change, LTM → NTM | **+32.9%** | +52.8% | +11.3% | +13.6% | +25.8% | **+22.8%** |
| NTM forward P/E | 14.76× | 9.39× | 11.97× | 8.16× | 6.51× | **7.73×** |
| P/tangible book, LTM | 5.7× | 3.4× | 3.0× | 2.3× | 1.4× | **1.8×** |

Source for every cell: `Capital IQ Comps → Trading Multiples and Financial Data (Nu Holdings comp set), As-Of Date 2026-08-29, USD — vendor export`; the return and EPS-change ratios are my arithmetic on those two vendor fields. NU earns **1.68× the peer-median forward return on tangible book** (38.8% / 23.1%) and its market price sits at **3.17× the peer-median tangible-book multiple** (5.7× / 1.8×). Applying a 7.73× median built mostly from branch-based incumbents earning 13–19% returns to a business earning 38.8% is the "comparable matched to the surface label, not the economics" defect the rules forbid — so the median is shown as a reference point and **not** used as the base multiple. Adjudicating whether NU's premium over that median is warranted is `03`'s job, not mine.

**Honest limitation.** **No named comparable in this pool matches NU on both return and growth.** BTG matches the return but is a different business; Inter matches the business model at roughly half the return (21.0%) and one-seventh the revenue (USD 1,279.1m vs 8,442.1m). The base multiple is therefore an anchored judgement across two named comps, not a measured comparable — *Inference from named comparables, not from filings.*

---

## 3. Segment Valuation

Formula for every row: `NTM EPS × NTM forward P/E = value per share`; `value per share × fully diluted shares (4,878,395 thousand, from 01) = equity value`.

Implied NTM attributable net income, for the bridge: `USD 0.97 × 4,878.395m = USD 4,731.9m` (derived from consensus EPS and `01`'s share count — *inference, not a consensus line item*).

| Segment | Metric value (NTM) | Multiple | Value per share | Equity value (USD m) |
|---|---:|---:|---:|---:|
| Banking (= whole Group) — **base point** | EPS USD 0.97 | **10.68×** | **USD 10.36** | **50,536.7** |
| — at Credicorp's 11.97× (upper named anchor) | EPS USD 0.97 | 11.97× | USD 11.61 | 56,638.3 |
| — at BTG Pactual's 9.39× (return-matched anchor) | EPS USD 0.97 | 9.39× | USD 9.11 | 44,432.2 |
| — at Inter & Co's 6.51× (model-matched anchor) | EPS USD 0.97 | 6.51× | USD 6.31 | 30,795.6 |
| — at the peer median 7.73× (**mismatched reference, not a value**) | EPS USD 0.97 | 7.73× | USD 7.50 | 36,578.3 |
| *Memo — the market's own mark today* | EPS USD 0.97 | *14.76×* | *USD 14.32 ≈ price* | *69,860.4* |
| **"Gross enterprise value (sum)" line — NOT APPLICABLE** | — | — | — | **Replaced by the equity value above.** NU is a Financial (bank): the Method Map bars EV-based multiples and the EV bridge as a value. `01`'s EV of USD 61,243.3m is informational only and omits USD 60.9bn of deposits and payables to network |

Arithmetic shown: `0.97 × 10.68 = 10.360`; `10.360 × 4,878.395 = 50,540` (50,536.7 on unrounded 10.3596). `0.97 × 11.97 = 11.6109`; `0.97 × 9.39 = 9.1083`; `0.97 × 6.51 = 6.3147`; `0.97 × 7.73 = 7.4981`; `0.97 × 14.76 = 14.317`.

**Base point USD 10.36; dispersion across the named comparables USD 6.31–11.61.** The dispersion is the multiple field, shown separately from the point, not folded into a fake mid-band.

---

## 4. Equity Bridge

Because the single segment IS the consolidated group and the metric is already an equity-level, per-share, after-tax number, most bridge lines are structurally zero. **Every one is shown with its reason rather than dropped.**

| Step | Value (USD m) | Why |
|---|---:|---|
| Gross enterprise value | **Not applicable** | Financial (bank) — Method Map bars EV as a value. The single-segment equity value below replaces it |
| Single-segment equity value (NTM EPS × 10.68× × 4,878.395m shares) | **50,536.7** | §3 |
| − Capitalized unallocated corporate costs | **0.0** | **Not dropped by assertion — there is nothing to capitalize.** The segment table has no reconciling line and segment pre-tax profit equals consolidated EBT exactly (3,868.419 = 3,868.419, FY2025). The NTM EPS metric is consolidated, after all corporate cost, after tax, and attributable to shareholders — the corporate drag is **already netted inside the metric** (Reconciliation Gate 3 satisfied on the collapse path) |
| − Net debt | **0.0 — deliberately not deducted** | `01`'s canonical figure is **NET CASH of USD 7,744.6m, strict basis** (total debt 5,807.0 − cash & equivalents 13,551.6). It is **neither deducted nor added back**, and that is the correct treatment, not an omission: a price-to-earnings value is already an equity value, and the earnings it capitalises are struck *after* the interest cost of that debt and *including* the income on that cash. Adding the net cash back would count the same balance twice (the net-cash sign-discipline rule). `01`'s own cash-quality test reinforces it — this is a bank's working liquidity sitting inside regulated subsidiaries whose ability to upstream it is legally limited, not spare corporate cash `[FY2025 20-F, Item 3.D risk factors; Q2 FY26 Interim Report, Note 11]` |
| − Minority / preferred | **0.0** | Non-controlling interests are **USD 2.1m**, 0.03% of book equity, and preferred equity is nil `[Q2 FY26 Interim Report, statement of financial position]`. Consensus EPS is an attributable-to-shareholders measure, so NCI is already excluded from the numerator; deducting again would double-count |
| + Equity-method investments | **0.0** | Investments in associates are **USD 93.0m**, 0.13% of market cap `[Q2 FY26 Interim Report, statement of financial position]`. Under IFRS the share of associates' profit is already inside consolidated net income and therefore inside the EPS metric — adding the carrying value on top would double-count |
| − Conglomerate / holding-company discount | **0.0 — none applied** | Reason: there is no conglomerate to discount. One reportable segment, one business, no unrelated diversification, and NU is the **top** holding company, not a listed subsidiary of a value-maximising parent. The management-governance module tested §24 Filter 6 explicitly and **RF-OWN-004 was NOT emitted**, with the instruction that **no value-trap note flows to valuation** `[analyses/NU_2026-09-06/management-governance/04_ownership-and-insider-behavior.md, finding 04-021; 99_management-governance-synthesis.md §C]`. Two real qualifiers are recorded rather than converted into an unsourced discount: (a) the Cayman holdco has no material assets other than its subsidiaries and depends on their distributions, which are subject to local capital rules `[FY2025 20-F, Item 3.D]`; (b) the 20:1 dual-class structure gives the founder 74.3% of votes on ~18.6% of the economics `[FY2025 20-F, Item 7.A, pp.203–204]`. Both are priced by the governance module under governance risk and shareholder friendliness; putting a number on them here would price the same fact twice |
| **= Equity value** | **50,536.7** | No plug; every line above is zero with a stated reason |
| ÷ Diluted shares | **4,878,395 thousand** | `01` Anchor Summary — fully diluted (outstanding 4,830,689k + 44,667k options/RSUs on the treasury-stock method + 3,039k acquisition shares; no convertibles) `[Q2 FY26 Interim Report, Notes 31 and 9]` |
| **= SOTP (collapsed) value per share** | **USD 10.36** | Dispersion across named comparables **USD 6.31 – 11.61** |
| vs current price — pool-verified | **USD 14.30** (2026-08-28 close) | Collapsed value is **27.6% below** the anchor price: `(10.36 − 14.30) / 14.30` |
| vs current price — fresher indicative | **USD 15.37** (2026-09-04 close, web-sourced, unverified, +7.48% above the anchor) | Collapsed value is **32.6% below** the fresher price: `(10.36 − 15.37) / 15.37` |

**No conglomerate or holding-company discount is applied, and the reason is stated above: there is no conglomerate.** A discount for the trapped-cash and dual-class facts is deliberately not taken here to avoid double-pricing findings the governance module already owns.

**Note on what these percentages are and are not.** They are the gap between a *sanity-check* multiple read and the price. They are **not** a margin of safety and **not** a downside-to-bear — those two are separate, defined metrics that belong to `07`, computed off `07`'s own base and bear levels. Do not lift the −27.6% into either slot.

---

## 5. SOTP Read

**There is no sum of the parts here — there is one part.** Banking is 100% of revenue and 100% of pre-tax profit, the company says so in its own segment note, and the segment figures tie to the consolidated income statement to the third decimal with zero unallocated bucket. The Brazil / Mexico / Other split (91.4% / 6.7% / 2.0% of FY2025 Note-34 revenue) and the product split (loans and card interest 77.6%, interchange 14.2%) are disclosure lenses with **no profit disclosed for any line and no forward estimate for any line**, so a geographic or product breakup is **not structurable on a forward basis — excluded**, and no trailing-earnings version of it appears here even as a cross-check, because there is no trailing segment profit to build one from.

**Brazil carries the value, on every disclosed lens — and that is a concentration finding, not a SOTP finding.** Revenue 91.4%, regulatory capital 90.2%, deposits 80.2%. Mexico is the fastest-changing piece (6.7% → 7.2% of revenue, and it became a full multiple bank on 6 Aug 2026 `[Q2 FY26 Interim Report, Note 35, p.44]`), but at ~7% of revenue with no disclosed profit it cannot be a hidden value pocket of any size, and management's claim that Mexican revenue per active customer is USD 12.3 against USD 5.6 in Brazil is an unsupported transcript statement that must not be converted into a profit share `[Q2 FY26 earnings call transcript, 13 Aug 2026, prepared remarks; qualifier carried from business-model/03_segment-map.md §3]`.

**The core SOTP question — is a high-value business masked by a low-value one? — answers "no", and the disclosed splits point the *other* way.** If anything were being masked it would be the interchange/payments piece, and the only listed payments comparable in the set, PagSeguro Digital (NYSE:PAGS), trades at the **lowest** forward P/E of all eleven names (5.03× vs the lending comps' 6.08–11.97×) `[Capital IQ Comps → Trading Multiples, 2026-08-29 — vendor export]`. Splitting the lender from the payments arm would lower the blended multiple, not raise it. The consolidated multiple is hiding nothing.

**The one thing `07` must take from this module.** This collapsed value is **not an independent method and must not be weighted as one.** It is arithmetically the same construction as `03`'s peer relative valuation — the same NTM EPS, the same 2026-08-29 Capital IQ comp set — so counting it alongside `03` would be one read counted twice, exactly the "the methods agree only if the methods are independent" trap (CLAUDE.md §16). SOTP contributes **zero weight** to the fair-value triangulation for NU. What it does contribute is the finding itself: **at USD 14.30 the market is paying 14.76× NTM earnings for a single Brazilian consumer-credit book, against 5.03–11.97× for every named LatAm financial comparable — a 91% premium to the peer median 7.73× and a 23% premium to the highest-rated name in the set — and there is no second business inside the company for that premium to be hiding in.** Whether the premium is warranted by the 38.8% forward return on tangible book and 32.9% forward earnings growth is `03`'s and `07`'s call, not mine.

---

### Self-check

- Segment inventory reconciles to consolidated revenue and pre-tax profit exactly (6,991.185 and 3,868.419, zero residual); the unallocated bucket is named as non-existent and proven, not assumed.
- Single-segment collapse applied correctly per the Segment / SOTP Rule; no spurious breakup constructed.
- Every multiple cites a named comparable (BTG Pactual, Credicorp, Inter & Co, plus the full 10-name median); none fabricated.
- Every value is on a **forward (NTM)** metric × a **forward (NTM)** comparable multiple, with the period basis stated; no trailing base is used as a value input.
- Comparables matched to economics (forward return on tangible book, forward earnings growth) with the reason stated, and the mismatched peer median explicitly excluded from the base multiple.
- Geographic and product splits marked **"not structurable on a forward basis — excluded"**; no trailing breakup fed forward.
- Vendor comp multiples are labelled as a Capital IQ export with the 2026-08-29 as-of date; the base multiple is labelled inference.
- Equity bridge uses `01`'s fully diluted count of 4,878,395 thousand; net cash is **neither deducted nor added back**, with the reason (no double-count); the corporate drag is shown to be already netted in the metric, not dropped.
- Conglomerate discount: none applied, with the reason and the RF-OWN-004 negative test cited.
- The read names Brazil as carrying the value and states plainly that nothing is masked.
- Output is a base-case point (USD 10.36) with the multiple dispersion (USD 6.31–11.61) shown separately.



---

## valuation / 07_scenario-and-fair-value.md

_Source: `07_scenario-and-fair-value.md`_

# Scenario & Fair Value — NU

**Scope note.** This agent reconciles `02`–`06` into one base-case fair-value POINT and the bull / base / bear fair-value LEVELS around it. It assigns no probabilities, computes no probability-weighted return, no risk/reward, no rating and no position size — those belong to the master synthesizer. It re-runs no method; every method value below is lifted from its producer.

**Anchors used verbatim from `01_price-and-capital-structure` §7.** Decision line **NYSE:NU · New York Stock Exchange · USD** (Class A ordinary shares, not an ADR). Price anchor **USD 14.30** (2026-08-28 close, price-state **`pool-verified`**), with a fresher corroborated indicative quote of **USD 15.37** (2026-09-04 close, web-sourced, unverified, +7.48%). Shares for per-share fair value **4,878,395 thousand** fully diluted. Tangible book value per share **USD 2.50** (LTM, Jun-30-2026). Dividend yield **0.00%** — no distribution has ever been declared. Net cash USD 7,744.6m (strict basis) is **not** netted into any fair value below: it is a bank's working liquidity inside regulated subsidiaries, and every method here is already an equity-level value.

**Business type governs which methods may be weighted.** `00_valuation-data-triage` classifies NU as a **Financial (bank)**. Under the MODULE_RULES Business-Type Method Map the valid set is **P/E, P/tangible book, and a residual-income (excess-return-on-equity) model discounted at the cost of equity**. EV/EBITDA, EV/EBIT, EV/Sales, an FCFF DCF and the EV bridge as a value are invalid for this issuer and appear nowhere below.

**Reporting basis.** IFRS Accounting Standards as issued by the IASB; presentation currency **USD**; fiscal year ends 31 December [FY2025 Form 20-F, cover page and Note 2]. Nu Holdings is a US-listed foreign private issuer filing Form 20-F — the absence of a 10-K / 10-Q is not a data gap (CLAUDE.md §27).

**All arithmetic below was produced by an executed Python snippet** (command, script and raw output printed in §7). Nothing here is mental arithmetic.

---

## 1. Method Summary

| Method | Fair / Implied Value (per share) | Confidence | Weight | Why This Weight |
|---|---:|---|---:|---|
| Own-history multiples (`02`) | **Excluded — not a fair-value input.** Reversion field USD 17.84 – 22.01 is labelled illustrative-only by its own producer | Low | **0%** | `02` §4 states in its own header that its observed history is **20 months, not 3–5 years**, that the figures are "illustrative only and NOT a fair-value input for `07`", and that it hands forward only the **band** to bound the bull/bear multiples. Zero-weighted for exactly that reason. Two further reasons reinforce it and are not averaged away: (a) restating today's price on the earnings module's cash-backed net income of USD 2,148.5m puts the current P/E at **32.7x — ABOVE the band's own 27.65x mean, not 30% below it** [`02` §3, citing `earnings/06_earnings-quality.md`]; (b) `03` §6 shows `02`'s entire 20-month window sits **inside** a Brazilian bank sector up-move, so a "below its own history" read from `02` is a window that never contained a normal level |
| Relative / peers (`03`) | **USD 14.73** — warranted NTM P/E 15.18x × NTM EPS USD 0.97 | Medium, **capped at 60** (RF-VAL-001) | **67%** | The only method on this list with an independent, forward, matched-basis evidence set: ten named LatAm financial comparables, all on the identical Capital IQ NTM basis as of 2026-08-29, applied to a forward metric with a growth premium sized explicitly and a printed double-count ledger. Under Method-Weighting Policy §1 (multiples-first for an operating-style issuer with usable forward estimates) `02` and `03` together carry the majority weight; with `02` zero-weighted, **`03` carries it alone**. Capped, not trusted flat: its peer-median anchor is flagged **cycle-elevated (RF-VAL-001)**, and it hands forward a ~2× internal disagreement (§2) |
| Intrinsic — residual income (`04`) | **USD 11.71** (as of 2026-08-28) | Medium | **33%** | The cross-check cap (≈ ≤ ⅓ combined for `04`+`06`) binds here, and `06` takes none of it. `04` is the only method that values NU on its own economics rather than on someone else's multiple, it is **not terminal-dominated** (terminal value is 15.3% of value), and its earnings path runs **above** the Street's own long-range strip in six of seven comparable years — so its low answer is not a pessimistic-forecast artefact. Held to a cross-check weight because ~47% of its value comes from a self-built ten-year fade benchmarked against a **one-broker** strip (1/1 estimates), which `04` §8 names as the first place to push back |
| Reverse-DCF (`05`) | *(implied, not a value)* — price implies a **permanent 22.08% return on equity**, or 7.68 more years of the FY2028 peak 35.53% return then nothing | Medium–High | **n/a** | Cross-check only, never weighted. It informs whether the base case is achievable, and its answer is the sharpest single line in the module: at USD 14.30 the model reproduces the price only on the **top of the Street's earnings range** (USD 14.65), so the mean forecast is not what is being paid for |
| Sum-of-the-parts (`06`) | USD 10.36 (collapsed single-segment) | n/a | **0%** | **Zero-weight instructed by its own producer.** NU reports **one** segment — Banking, 100% of revenue and 100% of pre-tax profit, tying to consolidated to the third decimal — and `06` §5 states its collapsed value "is **not** an independent method and must not be weighted as one… arithmetically the same construction as `03`" (same NTM EPS USD 0.97, same 2026-08-29 Capital IQ comp set). Weighting it beside `03` would be one read counted twice (CLAUDE.md §16). It stays in the football field for transparency |

**Weights sum to 100% across the two methods that are value-producing AND valid for a Financial.** For a bank the Method Map makes the DDM / residual-income value the intrinsic lens (not an EV-based DCF, not an EV SOTP) and P/E and P/tangible book the multiples lens — that is exactly the `03` + `04` pair above. `02` and `06` are excluded by their own producers' instructions, not by my judgement. Reverse-DCF is a cross-check, not a weighted input.

**Multiples-first, applied and stated.** NU is an operating-style issuer with a usable forward metric (NTM EPS USD 0.97, 16/16 analyst estimates behind FY2026E and FY2027E) and a peer multiple set, so the multiples method carries the majority (67%) and the intrinsic model is capped at the cross-check third (33%). The reconciliation of the resulting drag is done out loud in §2 — not averaged in silently.

---

## 2. Triangulation & Reconciliation

### The method football field — the honest cross-method spread

Shown at its true high-to-low, not narrowed and not pre-blended into a mid-band wearing a scenario label.

| Method | Value / its own range | Confidence | Weight | Why this weight |
|---|---:|---|---:|---|
| Relative / peers (`03`) | **USD 14.73** *(own dispersion USD 12.10 – 17.44 across the durability window N=3–5 and peer-set constructions; plus a separate peer-anchored cost-of-equity route at **USD 7 – 9**)* | Medium, capped 60 | 67% | Only independent forward, matched-basis peer evidence; cycle-elevated anchor caps it |
| Intrinsic residual income (`04`) | **USD 11.71** *(sensitivity grid USD 6.31 – 17.76; labelled structural runoff USD 5.76)* | Medium | 33% | Values the equity on its own economics; capped as a cross-check for the self-built fade |
| Sum-of-the-parts (`06`) | USD 10.36 *(named-comparable field USD 6.31 – 11.61)* | n/a | **0%** | Same construction as `03` — one read counted twice |
| Own-history multiples (`02`) | USD 17.84 – 22.01 | Low | **0%** | Producer-labelled illustrative-only; 20-month window; cash-backed-earnings restatement inverts the read |
| Reverse-DCF (`05`) | *implied expectations, not a value* | Medium–High | n/a | Cross-check |

**The >40% test, run on the correct set.** Across the **valid, value-producing, weighted** methods the field is **USD 11.71 → USD 14.73 = 25.8% of the low**. MODULE_RULES Reconciliation Gate 6 (>40%) therefore **does not fire on the method points**. Two things must be said beside that rather than hidden behind it: including the zero-weighted `06` sanity check the field is **42.2%**, and *within* `03` alone the peer-multiple route (USD 14.73) and the peer-implied cost-of-equity route (USD 7–9) disagree by roughly **2×** — `03` capped its own confidence for that and refused to average it, and I do not average it either. It is carried into the bear case in §3, where it belongs.

**Sector cycle distortion — and why the compounding rule does NOT fire, which is itself the finding.**
- `03` §6 flags its peer-median anchor **cycle-elevated** and emits **`RF-VAL-001`**: the Brazilian bank proxy re-rated roughly **+47% to +60% over three years** (Itaú price/book ~1.08–1.40 in 2023 → ~1.98 in early 2026; Bradesco ~0.77 → ~1.13) [Web: macrotrends / gurufocus / ycharts P/B history, read 2026-09-06 — unverified]. Its contribution is capped at 60.
- `02` §5 ran the same test, found the sector moved in the **opposite** direction to its own de-rating finding and below the ~25% materiality line, and emitted **no tag**.
- **The two flags are therefore NOT same-direction, so the combined 55 cap does not fire mechanically — but the honest reading is worse than a mechanical cap, not better.** What the two tests together show is **one company de-rating inside a sector that re-rated**. That is precisely why `02` can never corroborate `03` here: `02`'s entire 20-month "own history" sits *inside* the sector's up-move, so "cheap versus its own history" is anchored on a window that never contained a settled level. Independence check applied (CLAUDE.md §16): the base point rests on **one** cycle-flagged multiples read (`03`) plus one independent intrinsic model (`04`), not on two agreeing multiples reads. **Recommended cap for `99`: valuation confidence no higher than 60** — the tighter of `03`'s RF-VAL-001 cap (60) and `01`'s price-staleness cap (70).

### The base-case fair value — a single POINT

`Base = 0.67 × USD 14.73 (03) + 0.33 × USD 11.71 (04) = USD 13.7334` → **base-case fair value USD 13.73 per share**, which is **14.15x NTM EPS of USD 0.97** and **5.49x tangible book of USD 2.50**. This is the mechanically-weighted blend, published without a silent re-anchor: no lens swap, no discretionary shading. The two evidenced downside markers that argue for a lower number — `03`'s USD 7–9 cost-of-equity route and `04`'s USD 5.76 structural runoff — are carried as the **bear case and the avoid-ruin floor** in §3, not smuggled into the base point.

**Reconciling the disagreement, in five sentences.** The lens I trust most for NU is `03`'s peer route, because it is the only method resting on an independent, forward, matched-basis evidence set — ten named LatAm financials on the identical 2026-08-29 vendor basis, with the premium sized to the growth differential alone and the return differential deliberately left out of the earnings multiple so it is not charged twice. **The gap to `04`'s USD 11.71 is a real warning, not a high-discount-rate artefact, and that is why I let it pull the base down by its full capped third**: `04`'s 13.00% cost of equity sits **below** the company's own disclosed Brazilian cost of equity of 16.51% once translated to USD (13.98–14.54%), and **above** the 11.58% the market itself implies — so if the rate is wrong at all it is wrong on the low side, which would make `04`'s value lower still, not higher [`04` §3A, citing FY2025 Form 20-F, Note 3(b)]. The single most important reconciling fact is `05`'s: at USD 14.30 the model reproduces the price only on the **top of the Street's FY2026–FY2028 earnings range** (USD 14.65) with no improvement to the terminal, so the price already contains the best forecast on the Street and the mean forecast is not what is being paid for. Against that, the operating engine is genuinely still running — constant-currency revenue +34.02%, forward return on tangible equity 38.8% against a 23.1% peer median, loan-loss coverage **building** from 15.37% to 16.86% of gross credit assets in six months rather than being released — which is why the base sits near the price rather than near the USD 7–9 marker [`02` §4; `03` §2]. **The one number that most threatens this base point is `02`'s: restated on the earnings module's cash-backed net income of USD 2,148.5m, today's price is 32.7x earnings, above `02`'s own band mean — 40.4% of trailing profit is a non-cash deferred-tax credit, and a market that refuses to pay a growth multiple for a tax item is not mispricing the stock.**

---

## 3. Bull / Base / Bear Fair-Value Levels

Each case is a **single derived fair-value LEVEL — a point, not a range** — built as **(forward metric × multiple)** off one coherent assumption set. The bull-to-bear spread is the range; the cross-method dispersion is the §2 football field. **Horizon: 12 months to 2027-09-06** for Bull, Base and `bear_cyclical`. The separate `bear_structural` case in §3A runs on a **24–36 month** horizon and is not the same point in time — do not blend the two silently.

**Forward-metric basis, stated once.** All three cases use an **NTM (next-twelve-month) diluted EPS** built on the same blend Capital IQ's own NTM figure implies: `NTM = 0.5402 × FY2026E + 0.4598 × FY2027E` (which reproduces the vendor's NTM EPS of 0.9686 exactly from FY2026E 0.8482 and FY2027E 1.11006). Bull applies that blend to the **Street high** (0.91 / 1.30), bear to the **Street low** (0.75 / 0.77) — the high and low of the *same* analyst estimates whose mean sets the base [`Capital IQ Estimates → Consensus`, EPS (GAAP) High / Mean / Low rows, as-of 2026-08-29; ranges reproduced in `05` §4].

| Case | Fair Value / Share (point) | Forward Metric (NTM diluted EPS) | Multiple (NTM P/E) | Horizon | What Must Be True (operating drivers) |
|---|---:|---:|---:|---|---|
| **Bull** | **USD 19.59** | USD 1.09 (Street high) | **17.97x** | 12m, to 2027-09-06 | Credit cost improves ~100bp to 9.5% (**+USD 530.2m / +USD 0.108 EPS**); the BRL repeats its +12.14% average-rate move (**+USD 394.1m / +USD 0.080**); the effective tax rate holds near the 11.8% H1'26 filed level rather than reverting to the 30.2% consensus embeds (**+USD 257.4m / +USD 0.052**); efficiency ratio holds at the 17.6% Q1'26 print (**+USD 258.6m**). Multiple expands to 17.97x — `03`'s warranted level if the growth differential survives **5** years rather than 4, i.e. the Mexican bank licence (operating since 2026-08-06) and Colombia scaling deliver [`earnings/07` §2; `03` §5] |
| **Base** | **USD 13.73** | USD 0.97 (Street mean) | **14.15x** | 12m, to 2027-09-06 | Consensus delivers: FY2026E EPS 0.8482 (16/16 estimates) and FY2027E 1.11006 (16/16); forward return on tangible equity holds near 38.8%; the growth differential over peers survives roughly **4** years, which is close to the ~3.8–4.3 years the market is already paying for. No re-rating and no de-rating — the multiple sits at 14.15x against today's 14.76x |
| **Bear (cyclical)** | **USD 7.98** | USD 0.76 (Street low) | **10.50x** | 12m, to 2027-09-06 | See the through-cycle build below |
| *Bear (structural reset) — §3A, different horizon* | *USD 5.76* | *n/a — equity-direct residual income* | *implied 1.50x book at the horizon collapses to a negative terminal* | *24–36m* | *Avoid-ruin floor, not the 12-month bear* |

### Financial scenario gate — one forward period, both axes printed, identity reconciled

Same basis in every row: NTM diluted EPS over the **current** tangible book value per share of USD 2.50 (Jun-30-2026, `01` §6), which is the identical construction `03` §5 published, so the numbers tie to their source. Identity: `P/TBV = forward P/E × forward ROTE`.

| Case | Forward TBVPS (USD) | Applied / implied P/TBV | Forward EPS (NTM, USD) | Implied forward P/E | Forward ROTE | Identity check |
|---|---:|---:|---:|---:|---:|---|
| **Bull — USD 19.59** | 2.50 | **7.835x** | 1.09 | **17.97x** | **43.60%** | 17.97 × 0.4360 = 7.835 ✓ |
| **Base — USD 13.73** | 2.50 | **5.492x** | 0.97 | **14.15x** | **38.80%** | 14.15 × 0.3880 = 5.492 ✓ |
| **Bear (cyclical) — USD 7.98** | 2.50 | **3.192x** | 0.76 | **10.50x** | **30.40%** | 10.50 × 0.3040 = 3.192 ✓ |
| *Memo — price USD 15.37 (indicative)* | 2.50 | 6.148x | 0.97 | 15.85x | 38.80% | 15.85 × 0.3880 = 6.150 ✓ |
| *Memo — price USD 14.30 (pool anchor)* | 2.50 | 5.720x | 0.97 | 14.76x | 38.80% | 14.76 × 0.3880 = 5.726 ✓ |
| *Memo — peer median* | 4.73 | 1.79x | — | 7.73x | 23.11% | 7.73 × 0.2311 = 1.79 ✓ |

**Limitation stated, not buried.** Holding TBVPS at the current USD 2.50 across all three cases keeps the identity exact and matched-basis (it is what `03` did, and departing from `01`'s anchor would break the anchor-consistency rule). It does understate the bull's book accumulation and overstate the bear's — the *direction* of that error is known and it is small over a 12-month horizon against a base that grows book by roughly USD 0.45 a year on consensus.

**The peer-set maximum is not imposed as a ceiling.** The bull's 17.97x forward P/E sits **above** the highest multiple in the comp set (Credicorp 11.97x) and its 7.835x P/TBV above the highest (BTG Pactual 3.4x). That is deliberate and evidenced, not construction: NU's forward return on tangible equity of 38.8% is above the highest peer (BTG 36.2%) and its long-term EPS growth of 33.98% above the highest peer (Inter & Co 32.30%), so a company that leads the set on both variables that set a bank's multiple cannot be capped at the set's maximum without a separately evidenced economic ceiling, and none exists in this pool [`03` §5]. What limits the bull is the **durability window**, which is why 17.97x is `03`'s own N=5 upper bound and not a number invented above it.

**Multiple symmetry check, printed.** Bear **10.50x** ≤ Base **14.15x** ≤ Bull **17.97x**, and within each case the metric moves the same direction as the multiple (bull: EPS 1.09 up **and** multiple up; bear: EPS 0.76 down **and** multiple down). Anchoring to `02`'s handed-forward 20-month P/NTM-EPS band (min **12.90x**, mean 20.07x, median 21.70x, max 26.90x, current 14.76x): the base and bull both sit **inside** the band, the bull comfortably below its mean. The **bear at 10.50x sits deliberately below the band's 12.90x floor**, and the reason is cited rather than invented — see immediately below.

### The bear case reaches a cited through-cycle trough, not a mild dip off the peak

NU is flagged high-cyclicality: `business-model/07_business-quality.md` scores cyclicality **30/100** on a book that is **92% unsecured**, and `business-model/09_moat.md` §3 states plainly that **no Brazilian consumer downturn exists inside NU's profitable record at anything like the current book size** — the whole profitable record is three and a half years long and ran with Brazilian unemployment falling from 6.2% to 5.1% [`03` §4; `04` §2]. The company is a young entity with less than one standalone cycle, so the trough anchors are **named external and predecessor anchors**, exactly as the rule requires:

| Trough anchor | Level | Source |
|---|---:|---|
| Weakest listed comparable in the same LatAm bank set — the industry prior-downturn proxy | **Banco do Brasil 9.6%** return on tangible book | `Capital IQ Comps → Financial Data`, as-of 2026-08-29, via `04` §2 |
| Six-bank Brazil/LatAm peer-normal median | **15.95%** return on tangible book | same |
| NU's own loss-inclusive five-year average ROE (a *young-company* trough, explicitly **not** a credit-cycle trough) | **12.40%** (FY2021 −6.78%, FY2022 −7.81%, FY2023 18.24%, FY2024 28.07%, FY2025 30.28%) | CIQ `Ratios` export, via `04` §2 |
| Peer-anchored cost-of-equity route — the second evidenced downside marker | **USD 7 – 9 per share** | `03` §5, inverting `P/TBV = (ROTE − g)/(k − g)` at the ~16.5% cost of equity the peer group itself prices at, independently corroborated by NU's own disclosed Brazilian cost of equity of **16.51%** [FY2025 Form 20-F, Note 3(b)] |

**Why the bear multiple goes below `02`'s observed floor, and why that is evidence-based rather than invented.** `02` §2 says so itself: *"the true full-cycle low is almost certainly **below** the 4.48x P/B / 12.90x forward-P/E floor shown here"*, because the 20-month window contains no downturn. **10.50x is not a number I made up** — it is the region of `06`'s own named-comparable base multiple (10.68x, the midpoint of BTG Pactual's 9.39x and Credicorp's 11.97x, the two closest-economics LatAm bank comps), and it still leaves NU at a **36% premium to the 7.73x peer median** rather than at parity. In plain terms the bear says: in a Brazilian consumer downturn NU keeps a real premium to its peers, but a much smaller one than the 91% on offer today.

**Why the bear metric is the Street low, and that it is a genuine downturn rather than a shading.** NTM EPS of USD 0.76 is **−22% below** the consensus mean, built from the analysts' own FY2027 low of 0.77 against a mean of 1.11 (a 69% range across 16 estimates). It maps onto `earnings/07`'s own compounding adverse case: credit cost +110bp to Q1'26's own 11.6% level (**−USD 583.3m / −USD 0.1188 EPS**), the BRL at the company's own disclosed 17.8% shock (**−USD 577.9m / −USD 0.1177**), and the effective tax rate reverting to the 30.2% consensus embeds (**−USD 549.4m / −USD 0.1119** at the zero-mitigation bound; −USD 302.2m at the measured 45% realised offset). `earnings/07` §5(a) states these three **compound rather than offset** — a depreciating real is met by a higher Selic, which raises both funding cost and household debt service — so a reader adding them is not double-counting. The upstream sensitivity range was built on the last ~6 quarters, all upcycle, so the bear is widened past that window to the cited industry trough anchors above rather than stopping at a mild dip. **The two independent routes to the bear agree: USD 7.98 from (Street-low metric × comp-anchored compressed multiple) and USD 7–9 from the peer-implied cost-of-equity relation.**

### 3A. `bear_structural` — the avoid-ruin floor (a separate case, 24–36 month horizon)

**Which trigger fired, and on what row.** The *eroding-moat* leg did **not** fire: `business-model/09_moat.md` §5 returns **Narrow moat, trajectory stable**, and states expressly that its verdict "is **not** an erosion signal for the permanent-impairment trigger". The **disruption leg fired**: `business-model/07_business-quality.md` §1 scores **industry rate-of-change / disruption risk at 38 — at or below the ~40 threshold — and tags RF-BQ-005 (fast-changing industry, CLAUDE.md §24 Filter 5)**, because Pix, open finance, the card price cap, the capital regime and the virtual-asset regime were each rewritten inside six years [`03` §4; `04` §5].

**Billing, per the graduated rule.** The trigger fired as a **disruption flag on an otherwise intact moat (Narrow, stable)**, not on a confirmed eroding trajectory. The headline Bear therefore stays at the **cyclical through-cycle trough of USD 7.98** for the 12-month horizon, and the structural reset is carried here and to §24 / Kill Criteria as the labelled **avoid-ruin floor** — the multi-year permanent-impairment scenario, not the 12-month bear. (The demotion condition is satisfied twice over: `04_intrinsic-dcf` **is** in the weighted blend at 33%, so a method carrying the excess-return fade is priced in.)

**Method — business-type-appropriate, and the bridge shown.** NU is a **Financial**, so the reset is an **impaired residual-income / excess-return model**, not an EBITDA × multiple forced onto a bank. Impaired driver, named: return on equity fades from 35.5% (FY2028) to **12.0% by FY2033 — below the 13.0% cost of equity**, i.e. the franchise ends up destroying value on new capital, with terminal growth cut to **1.5% nominal USD** (a negative real rate). The economic reason is cited, not asserted: a Brazilian consumer downturn on a book that is 92% unsecured with 90+ day non-performing loans already at 6.9% and rising 35bp in the quarter, while the enacted CSLL step-ups lift the tax rate (payment institutions 9%→12%→15% from 2028; credit companies 17.5%→20%) and Law 14,690/2023 caps the price of the largest revenue line [`04` §5; `05` §3].

```
$ python3 nu07.py   (extract — full script and output in §7)
structural reset: book 2.7160 + PV(RI) 3.2160 + PV(TV) -0.2859 = 5.6461 @2026-06-30 ; accreted x1.0203 = 5.7607
  equity-based (residual income) -> already net of debt: NO net-debt subtraction.
  equity value = 5.76 x 4878.395m = USD 28,103m
```

**Bridge discipline, stated because getting it wrong is the recurring defect.** This reset produces an **equity value** (a residual-income model values the shareholders' claim directly), so it is **already net of debt** and is divided by the fully diluted share count with **no net-debt subtraction**. Subtracting `01`'s net cash of USD 7,744.6m — or adding it back — would double-count the same balance and misstate the floor. That is also why `06` deducted zero net debt on its own equity-multiple build. **`bear_structural` = USD 5.76 per share**, 62.5% below the fresher quote and 59.7% below the pool anchor.

**No probabilities are assigned to any case above — that is the master synthesizer's job.**

---

## 4. Margin of Safety & Downside (two separate metrics)

`01` tags the price-state **`pool-verified`**, so both metrics unlock. `01` also records the anchor as stale by 5 exact trading sessions (6.4 on the ×5/7 conversion) with a corroborated fresher quote **+7.48%** above it, and instructs that both reads be shown, **leading with the fresher one**.

### Lead read — at USD 15.37 (2026-09-04 close; web-sourced, unverified, indicative)

| Metric | Value |
|---|---:|
| Current price | **USD 15.37** *(indicative, web-sourced 2026-09-04 — carried alongside the pool anchor, not in place of it)* |
| Base-case fair value (point) | **USD 13.73** |
| Bear-case fair value (cyclical, 12m) | **USD 7.98** |
| Bull-case fair value (12m) | USD 19.59 |
| Implied upside to base case = (base FV − price) / price | **−10.7%** |
| **Margin of safety** = (base FV − price) / base FV — the cushion | **−11.9%** *(negative: no cushion — price is above base fair value)* |
| **Downside to bear** = (price − bear FV) / price — *inverted: higher = worse* | **48.1%** |
| *Memo: downside to the `bear_structural` avoid-ruin floor of USD 5.76 (24–36m)* | *62.5%* |
| *Memo: upside to bull* | *+27.5%* |

### Anchor read — at USD 14.30 (2026-08-28 close; pool-verified, stale by 5–6 trading days)

| Metric | Value |
|---|---:|
| Current price | **USD 14.30** *(pool-verified; staleness cap → `99` valuation confidence max 70)* |
| Base-case fair value (point) | **USD 13.73** |
| Bear-case fair value (cyclical, 12m) | **USD 7.98** |
| Implied upside to base case = (base FV − price) / price | **−4.0%** |
| **Margin of safety** = (base FV − price) / base FV — the cushion | **−4.2%** *(negative: no cushion)* |
| **Downside to bear** = (price − bear FV) / price — *inverted: higher = worse* | **44.2%** |
| *Memo: downside to the `bear_structural` avoid-ruin floor of USD 5.76 (24–36m)* | *59.7%* |
| *Memo: upside to bull* | *+37.0%* |

**These are two different numbers and neither is a proxy for the other.** Margin of safety is the discount of price to the **base** fair value — here it is **negative at both prices**, meaning there is no cushion: the shares trade above the triangulated base. Downside-to-bear is the loss if the bear case plays out — **44–48%**, an inverted metric where higher is worse. **Mandatory staleness flag:** the anchor's as-of date is 2026-08-28 and the fresher corroborated quote is 7.48% higher, which alone moves the margin of safety from −4.2% to −11.9% — the drift is material and the fresher read leads.

**The fair-value levels are price-independent**, so anyone can re-anchor in one step: `return = (level − price) / price`, with levels **Bull USD 19.59 / Base USD 13.73 / Bear-cyclical USD 7.98 / Bear-structural USD 5.76**.

---

## 5. Warranted-Multiple Check

**The base case implies 14.15x forward earnings and 5.49x tangible book, and NU does warrant a large premium — but the multiple it is asked to hold is one that only works if the growth differential lasts about four more years, and three and a half years of profitable history cannot settle that.** The premium is warranted **in kind** on measured evidence: forward return on tangible equity of 38.8% against a 23.1% peer median, long-term EPS growth of 33.98% against 13.17%, a cost advantage graded 78/100 with an ~85% lower cost to serve and 14,314 customers per employee against an incumbent average of 1,234 [`03` §4, citing FY2025 20-F, Item 4.B]. It is **not proven in size**: `03` measures that the market is already paying for ~3.8 years of that differential at USD 14.30 and ~4.3 years at USD 15.37, and `05` measures the same fact from the other side — the price requires a **permanent 22.08% return on equity**, 6.13pp above the six-bank peer median and only 2.2pp below Itaú, the best-run large incumbent, from a lender whose book is 92% unsecured and which has never met a downturn.

**Value-trap risk — three tests, two negative and one live.** (i) **Unaligned owner (RF-OWN-004, §24 Filter 6): NOT flagged.** The management-governance module tested it and returned negative — state-owned shares 0.03%, one reported segment, NU is the top holding company rather than a listed subsidiary of a value-maximising parent, with the explicit instruction that no value-trap note flows to valuation [`management-governance/04_ownership-and-insider-behavior.md` finding 04-021; `99` §C, via `02` §6 and `06` §4]. No ownership discount is taken. (ii) **The Sector Cycle Reality Test IS live and it cuts against the base multiple**: `03`'s warranted multiple is built off a peer median flagged **cycle-elevated (RF-VAL-001)** — a Brazilian bank sector that has re-rated 47–60% in three years — so a base case that "deserves" its multiple partly because the whole sector currently does is **not a durable warranted multiple**, and that is why `03`'s contribution is capped at 60 rather than taken at face. (iii) **The cleanest single test says the current multiple may already be too high, not too low**: restating price on the earnings module's cash-backed net income of USD 2,148.5m gives a P/E of **32.7x**, above `02`'s own 27.65x band mean, because 40.4% of trailing profit is a self-reversing non-cash deferred-tax credit whose fuel exists only while the loan book grows fast — and sequential FX-neutral portfolio growth has more than halved (+11% → +7% → +5%) [`02` §3/§4, citing `earnings/06_earnings-quality.md`].

---

## 6. Fair-Value Read

**Base-case fair value is USD 13.73 per share — 14.15x forward earnings and 5.49x tangible book — with bull USD 19.59, cyclical bear USD 7.98 (12-month), and a separate structural-reset avoid-ruin floor of USD 5.76 on a 24–36 month horizon.** Against the fresher indicative quote of USD 15.37 (2026-09-04) the **margin of safety is −11.9% — there is no cushion, the shares trade above the triangulated base — while downside-to-bear is 48.1% (inverted: higher is worse)**; at the stale pool-verified anchor of USD 14.30 the same two numbers are **−4.2% and 44.2%**. The answer is driven by `03`'s peer route at 67% (the only independent, forward, matched-basis evidence set for a bank, capped at 60 confidence because its peer-median anchor is flagged cycle-elevated) pulled down by `04`'s residual-income model at its capped 33% — a drag I let through rather than averaging away, because `04`'s 13.0% cost of equity is already **below** management's own disclosed 16.51% Brazilian rate translated to USD, so if that rate is wrong it is wrong on the low side.

**The single biggest swing factor between bull and bear is how long NU's growth differential over its peers survives — and the sharpest way to see it is that the whole disagreement sits in FY2027–FY2028 earnings, which the Street itself cannot agree on (its FY2027 range is USD 0.77 to 1.30, a 69% spread around a 1.11 mean across 16 estimates).** `05` frames the same swing as a bar: at USD 14.30 the market is already paying roughly what the model produces on the **top** of that range (USD 14.65), so the mean forecast is not what is being paid for. Two evidenced downside markers, from independent routes, both land near USD 8 — `03`'s peer-implied 16.5% cost-of-equity relation at USD 7–9, and the Street-low metric on a comp-anchored 10.50x multiple at USD 7.98 — and they are carried as the bear rather than smoothed into the base.

---

## 7. Executed arithmetic — command, script and raw output

Every number in §1–§6 came out of this snippet; nothing was computed by hand.

```
$ python3 nu07.py
weights sum = 1.00
weighted base point = 0.67x14.73 + 0.33x11.71 = 13.7334  -> USD 13.73
method-point field 11.71 - 14.73 = 25.8% of low  (Gate 6 fires >40%)
incl. 06 sanity-check 10.36 - 14.73 = 42.2%
NTM blend implied by CIQ: 0.5402 x FY2026E + 0.4598 x FY2027E = 0.9686
bull NTM EPS = 1.0893 -> 1.09 ; bear NTM EPS = 0.7592 -> 0.76

multiples  bear 10.50x <= base 14.15x <= bull 17.97x   symmetric=True
Bull           EPS 1.09 x 17.97x = USD  19.59 | ROTE 43.60% | P/TBV 7.835x | identity P/E x ROTE = 7.835 OK
Base           EPS 0.97 x 14.15x = USD  13.73 | ROTE 38.80% | P/TBV 5.492x | identity P/E x ROTE = 5.492 OK
Bear_cyclical  EPS 0.76 x 10.50x = USD   7.98 | ROTE 30.40% | P/TBV 3.192x | identity P/E x ROTE = 3.192 OK

structural reset: book 2.716 + PV(RI) 3.216 + PV(TV) -0.2859 = 5.6461 @2026-06-30 ; accreted x1.0203 = 5.7607
  equity-based (residual income) -> already net of debt: NO net-debt subtraction. equity value = 5.76 x 4878.395m = USD 28,103m

@ USD 15.37 (2026-09-04, web-sourced indicative - LEAD)
  implied upside to base = (13.73-15.37)/15.37 = -10.7%
  MARGIN OF SAFETY       = (13.73-15.37)/13.73 = -11.9%
  DOWNSIDE TO BEAR (inv) = (15.37-7.98)/15.37 = +48.1%
  downside to reset floor= (15.37-5.76)/15.37 = +62.5%
  upside to bull         = (19.59-15.37)/15.37 = +27.5%

@ USD 14.30 (2026-08-28, pool-verified anchor)
  implied upside to base = (13.73-14.3)/14.3 = -4.0%
  MARGIN OF SAFETY       = (13.73-14.3)/13.73 = -4.2%
  DOWNSIDE TO BEAR (inv) = (14.3-7.98)/14.3 = +44.2%
  downside to reset floor= (14.3-5.76)/14.3 = +59.7%
  upside to bull         = (19.59-14.3)/14.3 = +37.0%
```

The script, in full, so a reader can re-run it:

```python
P_POOL, P_FRESH = 14.30, 15.37          # 01 s7
SH_FD = 4878.395                         # 01 s7, millions, fully diluted
TBVPS = 2.50                             # 01 s6, LTM tangible book/share - same base 03 used
V03, V04, V06 = 14.73, 11.71, 10.36      # 03 s5 base ; 04 s6 ; 06 s4 (zero-weight)
W03, W04 = 0.67, 0.33                    # 03 majority (multiples-first) ; 04 capped cross-check <= 1/3
base = round(W03*V03 + W04*V04, 2)

FY26, FY27, NTM = 0.8482, 1.11006, 0.9686          # 02 s1 / 04 s2 consensus mean
w27 = (NTM-FY26)/(FY27-FY26); w26 = 1-w27          # reproduces CIQ's own NTM blend
E_bull = round(w26*0.91 + w27*1.30, 2)             # 05 s4 ROB-B Street HIGH
E_bear = round(w26*0.75 + w27*0.77, 2)             # 05 s4 ROB-B Street LOW
E_base = 0.97                                       # 03/06 NTM EPS
M_base, M_bull, M_bear = base/E_base, 17.97, 10.50  # 03 s5 N=5 ; 06 s2 named-comp region
# identity check for every case: P/TBV == (E*M)/TBVPS == M * (E/TBVPS)

B0, PV_RI, PV_TV, ACC = 2.7160, 3.2160, -0.2859, 1.0203   # 04 s5 runoff / s6 accretion
RESET = round((B0 + PV_RI + PV_TV) * ACC, 2)              # equity value - no net-debt bridge

# margin of safety = (base - P)/base   ;   downside to bear = (P - bear)/P
```

---

## Self-check against the module rules

- Every method value and confidence is lifted from `02`–`06`; nothing re-derived.
- Weights (67% / 33%) sum to 100% across the two value-producing, business-type-valid methods; `02` and `06` are zero-weighted on their own producers' explicit instructions and shown in the football field for transparency. The published base point **is** the mechanical blend — no silent re-anchor, no undisclosed lens swap.
- Reverse-DCF used as a cross-check only, never weighted.
- The >40% test run on the full high-to-low set of **valid, value-producing** methods (11.71 → 14.73 = 25.8%): Gate 6 does not fire on the method points; the 42.2% field including the zero-weighted `06`, and `03`'s ~2× internal disagreement, are both stated rather than hidden, and the confidence cap of 60 is recommended regardless.
- Bull / base / bear are each a single derived LEVEL, dated (12-month; `bear_structural` 24–36 month, stated in prose), tied to `earnings/07` operating drivers. No probabilities, no probability-weighted target, no risk/reward, no rating, no position size.
- Every case prints BOTH a forward metric and a multiple; bear 10.50x ≤ base 14.15x ≤ bull 17.97x, with metric and multiple moving the same direction in each case; base and bull anchored inside `02`'s handed-forward 20-month band, and the bear's excursion below its 12.90x floor cited to `02`'s own statement that the true full-cycle low sits below it.
- Financial gate: one forward period, TBVPS / P/TBV / forward EPS / implied forward P/E / forward ROTE printed in every row, identity reconciled; the peer-set maximum is deliberately exceeded on evidence, not capped by construction.
- `02`'s and `03`'s Sector Cycle Reality Test sections both read: `03` fired `RF-VAL-001` (cycle-elevated, cap 60); `02` fired nothing; the flags are **not** same-direction, so the mechanical compounding cap does not fire — and the reason (`02`'s whole window sits inside the sector's up-move, so it cannot corroborate `03`) is stated as the finding.
- Margin of safety `(base − price)/base` and downside-to-bear `(price − bear)/price` computed as two separate metrics, at BOTH prices, leading with the fresher, with the staleness flag inline.
- Structural-reset trigger fired on the disruption leg (`07_business-quality` rate-of-change 38 ≤ 40) with an **intact** moat (`09_moat`: Narrow, stable) → headline Bear stays the cyclical trough; the reset is carried as the labelled avoid-ruin floor, computed by executed snippet on the business-type-appropriate method (impaired residual income, **not** an EBITDA multiple forced on a bank), **already equity — no net-debt subtraction**.
- No banned phrases; every adjective paired with a cited number.
