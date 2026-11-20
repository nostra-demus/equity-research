# Valuation Module — TTWO (Synthesis)

**Company:** Take-Two Interactive Software, Inc. (NasdaqGS:TTWO · NASDAQ Global Select Market · USD) · **Run date:** 2026-11-20
**Reporting standard:** US GAAP · **Currency:** USD, millions unless stated · **Fiscal year ends 31 March** ("FY2027" = Apr-2026 → Mar-2027, not a calendar year) [`FY26 10-K, cover page`].

**All nine specialists completed. No agent failed, so there is no declared-gap agent to name.** This synthesis adjudicates their outputs; it does not re-derive any number from the pool.

**Source-check status carried forward: UNCHECKED — never verified clean.** This frozen generation carries **no `numeric_reading_check`** object at any source or sheet level (string count in `GENERATION_ROOT/manifest.json` = 0), and `GENERATION_ROOT/corpus.txt` carries **no labelled extractor reading-warning annotation**. There is therefore **no literal warning token, no source/extract reference and no canonical LF-line/column span to quarantine**, and **no amount below is marked not-proven on that basis** — but a missing legacy check means **unchecked, not clean**: no warning here is not proof of accuracy, the check's pattern coverage is limited, and every Capital IQ workbook-cell figure behind this module is mechanically unverified. Each upstream specialist re-read its own value-determining figures from the frozen extract of the document that reports them, inside this frozen capability only; nothing was guessed and no frozen evidence was altered. This status is carried into the data-sufficiency read in §1 (Data quality 72, not higher) and must travel with every restatement. A reading-check gap is **not** an adverse company finding and **not** a whole-document extraction failure.

**Governance qualifiers carried, not dropped or hardened.** `management-governance/99_management-governance-synthesis.md` records **RF-OWN-004 (structurally unaligned controlling owner, CLAUDE.md §24 Filter 6) = NOT fired** — "no government control, no value-maximising parent, no sprawling unrelated conglomerate, **no controlling owner at all** (largest holder 8.68%, 99.6% float, one share one vote)" [finding 04-016] — so the Filter-6 cap on valuation attractiveness **does not bind**. Its verdict is nonetheless **"Misaligned or weak stewardship"** with **no hard disqualifier**, and **RF-MGT-005 fires at High on a live, unadjudicated matter — a conviction cap ("no rating above Watchlist"), not a gate failure**. This module lifts none of those caps and creates none.

---

## Abstract

Take-Two's blended fair value sits just below its price — USD 196 against the USD 216.61 close of 2026-11-19 — a boundary reading this synthesis resolves conservatively as modestly overvalued rather than fairly valued. The levels are bull USD 398, base USD 196, headline bear USD 68, plus a labelled 24–36 month structural floor at USD 53; the peer lens drives them at 45% of the weight. Today's price requires free cash flow to compound at 20.5% a year for nine years off a launch-year peak, which is unreachable at the consensus 3.13% long-run rate at any horizon. No cushion exists (−10.4%) and the loss to the bear case is 68.75%. Cross-method dispersion of 5.2x caps confidence.

---

## 1. Valuation Verdict

- **Verdict:** **Modestly overvalued** *(fair value 10–25% below price — a boundary call, see the note below)*
- **Base-case fair value (point, per share):** **USD 196.17** *(from `07` §2C — 12-month horizon, 188.0m diluted shares, implying 16.28x EV/NTM EBITDA and 20.50x NTM P/E)*
- **Current price:** **USD 216.61** — last close, as-of **2026-11-19**, price-state **`pool-verified`**, 1 trading day old, no staleness cap [`01` §7]. Drift note: 2026-11-19 **is the Grand Theft Auto VI release date itself**, so the anchor contains **no post-launch trading**.
- **Bull / Base / Bear fair-value levels (points):** **Bull USD 397.52 · Base USD 196.17 · Bear (`bear_cyclical`, 12-month) USD 67.68**, plus a separately labelled **`bear_structural` avoid-ruin floor of USD 52.53** on a **24–36 month** permanent-impairment path (harsher `04` variant 50.58). Four cases, four labels — the two down-legs are **not** merged [`07` §3].
- **Cross-method dispersion (football field, low–high):** **USD 63.17 – 328.44** across the valid value-producing methods — **high ÷ low = 5.20x**, a spread of **+419.9%** measured on the low end [`07` §2A].
- **Valuation attractiveness /100** *(higher = cheaper)*: **28**
- **Margin of safety /100** *(higher = better)*: **22** — the measured cushion is **−10.42%**: the price sits above the blended fair value, so **no cushion exists** [`07` §4]
- **Valuation confidence /100:** **48** *(capped at 55 by the >40% cross-method field; set below the cap for three further reasons named in §3)*
- **Downside risk /100** *(**inverted** — higher = worse)*: **82** — downside to the headline bear is **+68.75%**; to the `bear_structural` floor **+75.75%**
- **Data quality /100:** **72** *(triage verdict **Sufficient**; 30 sources / 62 tabs / zero extraction failures; reduced for the absent numeric reading check, the absent peer and sector multiple history, the absent segment EBIT, the blank Electronic Arts peer row, the empty DEF 14A stub and the mis-filed Alphabet workbook)*
- **Overall usefulness /100:** **76**
- **Dominant valuation method:** **`03_relative-valuation-peers` (45% of the base point)** — a forward, same-day (2026-11-19), one-engine peer cross-section on a set drawn from the company's own 10-K competition list, with the double-count test run and the `own margin ÷ peer margin` haircut explicitly **tested and rejected**, and with the one genuinely independent corroborating read beside it (the Electronic Arts take-private).
- **What's priced in:** free cash flow compounding at **+20.47% a year for nine years (FY2028→FY2036)** off an already-peak launch base, ending at **4,996 — 11.5x** the best annual free cash flow the company has ever produced; equivalently a flat **45.78% core operating margin**. At the consensus long-run rate of **3.13%, no horizon of any length reaches the price** (maximum attainable EV 20,893 against 41,922.7). The dual solve rules out a discount-rate explanation: the implied rate is **2.63%, 244bps BELOW the 5.07% risk-free rate** [`05` §2, §2A, §6].
- **Biggest valuation risk:** the **forward denominator, not the multiple**. **75% of the base point rests on one number** — consensus NTM EBITDA of **2,349.1**, which is **3.24x** LTM EBITDA of 724.9 and **2.23x** the company's own guided FY2027 non-GAAP EBITDA midpoint of **1,053**. At the identical 16.28x base multiple, consensus FY2027 EBITDA gives **USD 139.33** and company-guided FY2027 gives **USD 83.92** [`07` §2C, §5].

**Why the category is "Modestly overvalued" and not "Fairly valued" — the boundary is shown, not hidden.** On the price denominator the base point is **−9.43%** below the close, a hair inside the ±10% "Fairly valued" band; on the fair-value denominator the same gap is **−10.42%** (the canonical margin-of-safety measure), a hair inside "Modestly overvalued". The arithmetic straddles the line, so the tie is broken on evidence and on the conservative default (CLAUDE.md §4; MODULE_RULES Core Principle 6 — "when evidence is thin or methods conflict, default to the lower fair value and say why"): **three of the four value-producing lenses sit below the price** (peers 181.89, −16.0%; DCF 63.17, −70.8%; the collapsed single-segment read 156.27, −27.9%), and the **only** lens above it is `02`'s own-history reversion at 328.44 — whose own producer calls its 26.81x median **"a ceiling-ish base rather than a conservative one"** and states it **cannot corroborate a mispricing claim about the company whose trading record it is** [`02` §4, §6]. Add `05`: every generous lever inside this evidence base still leaves **at least 14.18% a year** of compounding to be found. The conservative reading is the honest one.

---

## 1A. Module Disconfirmation *(CLAUDE.md §8)*

- **Strongest bear point.** The priced-in requirement fails every matched base rate: **+20.47%/yr** implied FCFF growth against a **metric-matched realised −9.76%/yr** since FY2022 (three negative years inside five) and a **period-matched peak-to-peak profit growth of +0.81%/yr** (FY2021 EBITDA 757 → FY2026 788); at the company's own forward consensus rate of 3.13% the price is **unreachable at any horizon** [`05` §3, §5].
- **Strongest bull point (the steelman, and it is real).** On the forward basis the stock trades at **17.79x EV/NTM EBITDA against its own 5-year median of 26.81x (−33.6%), at the 15th percentile of its own 20-quarter band**, which on reversion implies **USD 328.44 (+51.6%)** [`02` §4]; and the single most important qualifier runs the bull's way — **no reported period contains a single dollar of GTA VI revenue**, so every bear base rate above is measured entirely pre-launch [`05` §6; `earnings/07` §4]. FY2026 was also a genuinely better year: RCS revenue +16.1%, gross margin +290bp, best-ever §15 free cash flow of 434.1, ROIC improving from −4.2% to −0.8% [`08` §6].
- **Single killer risk.** Not method validity — the **denominator**. If consensus NTM EBITDA of 2,349.1 is a launch-year peak rather than a level, the base point falls from 196.17 to **139.33** (consensus FY2027) or **83.92** (company-guided FY2027) at the *same* multiple. `08` supplies the sharpest corroboration: **the Street's own implied FY2030 EBITDA (2,448.3) sits 6.6% BELOW its FY2029 (2,622.4)** — consensus is modelling a release cycle, which by construction cannot be a re-rating [`08` §3C].
- **Disconfirming evidence already visible.** Pointing bearish: the same stock is at a **+47.9% premium** to its own 5-year median on EV/LTM EBITDA and **+131.8%** on P/Book, with both vendor FCF multiples above their own 5-year maximum [`02` §3]; Q2 FY27 net bookings **missed the company's own range** (1,601.3 vs 1,620–1,670) and RCS fell **−9%** against guided −5% [`08` §2]; TTWO's public minority price of **6.5x LTM EV/Sales is 94%** of the **6.94x** a sovereign-backed consortium paid for **outright control** of a larger, higher-margin competitor [`03` §4]. Pointing bullish: on the quality-matched five-peer forward set the premium is only **+17.5%** on EV/EBITDA, **+5.5%** on EV/Sales, and TTWO is a **7.4% discount** on forward P/E, with the highest forward growth rate (25.75%) and the highest credit rating (BBB) in the set [`03` §3b, §4].

---

## 2. Specialist Roll-Up

Claim-fidelity pass run over this table against the four failure shapes (qualifier dropped / basis dropped / build dropped / verdict hardened). Every net-debt and EV figure carries its **strict / broad / vendor** basis label; "No moat proven / eroding" stays **NOT confirmed**; "Not assessable" is never restated as "no distortion"; the 12% rerating probability keeps its **judgment** basis and sub-8-observation caveat; and the **NTM-EBITDA denominator caveat travels with every forward multiple quoted**.

| Specialist | Verdict Line | Biggest Finding |
|---|---|---|
| `00_valuation-data-triage` | **Sufficient** — four of five methods can run (`02`, `03`, `04`, `05`); SOTP cannot, because the company discloses **one** reportable segment; **no partial-data cap fires** | The **numeric reading check is ABSENT from this generation**, so every workbook-cell figure is mechanically **unchecked, not clean**; and **trailing earnings multiples are structurally unusable** (LTM EBIT −112.5, LTM diluted EPS −1.29 → LTM P/E and EV/EBIT are "NM") |
| `01_price-and-capital-structure` | Anchor set: price **USD 216.61** (last close, as-of 2026-11-19, **`pool-verified`**, 1 trading day old); market cap **40,552.3**; **EV 41,922.7 on strict cash and borrowings-only debt**; **net debt 1,370.4 — strict §15 basis** | Per-share fair value uses the company's **own disclosed 188.0m diluted count**, not the 187.1m trailing figure, **because every trailing period is a loss** so trailing "diluted" equals basic. Capital IQ's aggregates (total debt 2,911.4 **lease-inclusive**; net debt 1,237.8 **broad-cash AND lease-inclusive**; TEV 41,790.1) are **named cross-checks, never substitutes** and reconcile exactly: 1,370.4 − 524.2 + 391.6 = 1,237.8 |
| `02_multiples-own-history` | The two reads point **opposite ways and that is the finding**: **−33.6%** to its own 5-yr median EV/**NTM** EBITDA (17.79x vs 26.81x, 15th percentile) **and +47.9%** on EV/**LTM** EBITDA (52.24x vs 35.31x, 70th percentile) | **The entire gap is the denominator**: LTM EBITDA 724.9 vs NTM 2,349.1, a **3.24x step** because GTA VI released 2026-11-19. Own-NTM-median reversion implies **USD 328 (+51.6%)**; the **FY2027** window at the same 26.806x implies **USD 235 (+8.4%)**. Sector Cycle Reality Test: **Not assessable** (no sector-level multiple history in the pool) — no `RF-VAL-001`/`-002` emitted |
| `03_relative-valuation-peers` | **Premium unjustified (relative downside)** on the mechanical read: **+78.6%** to the ten-peer **NTM** EV/EBITDA median (17.79x vs 9.96x) and **+17.5%** to a quality-matched five-peer median (15.14x); base **USD 181.89**, dispersion **117.16 – 232.91** | **No margin haircut was applied to any earnings multiple** — the `own margin ÷ peer margin` formula was tested and **rejected as a double count** (it would have cut the base to ~161.0). **Electronic Arts is private** (take-private closed 2026-08-04) so the closest comparable **contributes nothing to any median**; it is used only as a transaction comp — **6.94x LTM EV/Sales vs TTWO's 6.5x**, i.e. the minority price is 94% of a control price. Relative-gap persistence and Sector Cycle Reality Test: **both Not assessable** |
| `04_intrinsic-dcf` | Base **USD 63.17/share** (WACC 8.852%, ROIC = WACC terminal, TV 41.1% of EV); grid **52.22 – 77.81**; labelled variants **50.58 (runoff) → 104.24 (upside bound)**. Intrinsic confidence **self-capped LOW-to-MODERATE** | **The price is 3.43x the base DCF**, and **no assumption set inside this evidence base — including an upside bound that adopts the Street's margins AND stops charging stock-based pay — gets within 50% of the price**. Honest qualifier: roughly **700bps of the modelled margin improvement is the mechanical run-off of Zynga acquired-intangible amortization** from the 10-K's own schedule, **not an operating gain**. No `RF-VAL-003` tag — the escalation trigger does not fire, and it fires in the opposite direction |
| `05_reverse-dcf` | **Implied expectations are aggressive on evidence, not assertion** — and that is downside, not upside | Price implies **+20.47%/yr FCFF compounding FY2028→FY2036** off an already-peak launch base, ending at **11.5x** the best-ever annual FCF, against a **metric-matched realised −9.76%/yr** and **peak-to-peak profit growth of +0.81%/yr**; at the consensus **3.13%** rate **no horizon reaches the price** (max EV 20,893 vs 41,922.7). The **dual solve rules out the discount-rate explanation**: implied rate **2.63%**, **244bps below** the risk-free rate. The one agreeing series (+20.33% nine-year EBITDA CAGR) is **named and adjudicated** as trough-to-peak on a Zynga-inflated window |
| `06_sum-of-the-parts` | **SOTP not applicable — single operating and reportable segment** [`FY26 10-K, Note 21`]; "**single-segment — SOTP collapses to the consolidated read**" | Its collapsed read (**USD 156.27** at a 13.09x NEXON/Konami midpoint) **duplicates `03` and must NOT be weighted as an independent fifth lens** — `06` instructs this itself. Its absence is **a disclosure fact, not a value signal and not a data gap**. The most valuable missing disclosure: the FY26 10-K admits **two goodwill reporting units** inside the one segment and names, sizes and attributes **neither** |
| `07_scenario-and-fair-value` | Owns all fair-value **LEVELS**: base **USD 196.17**; bull **397.52**; headline **`bear_cyclical` 67.68**; labelled 24–36 month **`bear_structural` floor 52.53**. **Margin of safety −10.42%** (no cushion); **downside-to-bear +68.75%** (inverted) | **Valuation confidence capped at 55**, because the cross-method field spans **5.2x** and **75% of the base point rests on ONE shared input** — consensus NTM EBITDA 2,349.1, a launch-year peak **3.24x** LTM and **2.23x** the company's own guided FY2027 figure. At the same 16.28x multiple, consensus FY2027 gives **USD 139.33** and company-guided FY2027 gives **USD 83.92** |
| `08_strategic-rerating` | **Bearish Derating** — a read on what the *pivot* contributes to the warranted multiple, **not a fair-value level and not a sixth method**. **Rerating Probability Score 12%**, basis **judgment** (all matching samples below ~8 observations), horizon **2026-11-19 → 2028-03-31** | **The evidenced pivot is the Zynga-era mobile / recurrent-spending shift, NOT GTA VI**, which is a denominator step-up. Revenue **+97.3%** FY2021→FY2026 delivered EBITDA **+4.1%** — an incremental EBITDA margin of **0.9%**; and **consensus's own implied FY2030 EBITDA sits 6.6% below FY2029's**. Carries forward the governance **RF-MGT-005 conviction cap** and the **"No moat proven" / "eroding (NOT confirmed)"** qualifier unhardened |

---

## 3. Reconciliation

**The dispersion is the finding, and it is not reconcilable into agreement.** The full high-to-low field of valid, value-producing methods runs **USD 63.17 (DCF) to USD 328.44 (own history)** — **5.20x**, or **+419.9%** on the low end, with the peer lens at 181.89 and the collapsed single-segment read at 156.27 in between. That is an order of magnitude above the ~40% tolerance, so **valuation confidence is capped at 55 and the explanation below does not waive the cap** (MODULE_RULES Reconciliation Gate 6).

**The disagreement is about one thing.** `02` and `03` both apply a multiple to **the same forward number** and argue only about which multiple to pay; `04` builds its own cash-flow path and reaches 63.17; `05` shows the price needs that path lifted **3.16x**. So the 5.2x field decomposes into (a) one unproven denominator and (b) a genuine, tested disagreement about the level of cash flow. Three reconciliations, each adjudicated rather than averaged:

1. **`02` (328.44) versus `03` (181.89) — an 81% gap, and these are NOT two independent reads.** Both multiply consensus NTM EBITDA of **2,349.1**. `02`'s 26.806x is a **pre-launch** multiple applied to **post-launch** earnings — a peak multiple on a peak metric, which double-counts the same launch — and `02` itself calls it "ceiling-ish" and states it cannot corroborate a mispricing claim about the company whose own trading record it is (CLAUDE.md §16). **Resolved conservatively:** `03` carries the larger weight (45% vs 30%), and `02`'s 26.806x is used as the **bull** multiple, not the base.
2. **`04` (63.17) versus the multiples lenses — tested, not dismissed.** The gap is **not** a high-WACC artefact: `04` §3A and `05` §2A both solved for the rate the price implies and got **2.63%**, which is **244bps below the 5.07% risk-free rate** and therefore not a cost of capital at all. `04`'s own WACC cleared every sanity bound (`after-tax k_d 4.42% ≤ WACC 8.85% < k_e 9.13%`; equity-premium floor 4.06pp, cleared narrowly and stated as such) and sits **above** the moat module's 8.2% figure. **Resolved:** the 63.17 is a real warning about the **level of cash flow**, so `04` is held at the **top** of its ≤ ⅓ cross-check allowance (25%), not the bottom — and it is not allowed to drag the base silently either.
3. **`06` is not a fifth method.** Its 156.27 is a peer forward-EBITDA multiple on the consolidated company — the same read `03` owns. **Zero weight**, on its own producer's instruction; counting it would manufacture false agreement.

**Sector Cycle Reality Test roll-up (MODULE_RULES → Scenario Construction & Method-Weighting Policy §3).** **Both `02` §5 and `03` §6 returned "Not assessable — no sector-level multiple history."** The pool carries only the **current** (2026-11-19) peer cross-section and no sector-index or peer-aggregate series 3–5 years back; both agents ran labelled web attempts and **both rejected them on quality grounds** (a current-only ETF level cannot measure a change over a window; aggregator figures reading ~24x for TTWO on a date the pool's own vendor prints 52.2x cannot cap a peer anchor). **Neither `RF-VAL-001` (cycle-elevated) nor `RF-VAL-002` (cycle-depressed) fired in either file**, so the **same-direction compounding trigger did not occur** and no cycle cap binds. Stated precisely, because this is the exact spot where a qualifier gets lost: **"Not assessable" means the window-change is UNMEASURED — it does not mean there is no sector distortion**, and the compounding rule's premise is therefore **untested, not cleared**. Per the Score Cap table an honestly-absent check is no cap by itself; it is recorded here so it is visible rather than silently skipped. Two things can still be said without the data: `03` notes a **12-fold forward-multiple spread inside one eleven-company industry on one day** (Ubisoft 2.20x beside Roblox 25.95x), which is itself evidence these levels are not a settled normal; and `02` notes its own 5-year window contains a stretch in which TTWO's EV/LTM EBITDA ran **17.69x → 94.37x → 52.24x**, so whether that band is a stable "normal" is **unknown, not confirmed**.

**The independence failure that actually binds is a shared DENOMINATOR, not a shared sector cycle.** `02` and `03` disagree by 81% on the per-share answer, so there is no "methods agree" claim between them to misread — but they are not two independent reads of the *level* either, because **75% of the base point multiplies one number**: consensus NTM EBITDA 2,349.1, struck on the company's **management-reporting** basis (adding back SBC 462, acquired-intangible amortization 623 and the deferred-revenue change 47 at an 18% tax rate), whose **peer counterparts' add-back bases are undisclosed** [`03` §2]. **What IS independent:** the Electronic Arts take-private (USD 210.00/share, ~USD 55bn, closed 2026-08-04) — a negotiated change-of-control price, implying **~6.94x LTM EV/Sales** against TTWO's **6.5x**. Four caveats all push one way, so it is an **upper bound**: struck on September-2025 information, carrying a control premium a minority holder does not receive, set by a sovereign fund with strategic objectives, and on a company earning roughly **double** TTWO's trailing EBITDA margin. `04` and `05` are also independent of both multiples lenses.

**Strategic rerating roll-up (`08`) — retained in full, reconciled, and not converted into a scenario weight.**

- **Three pillars.** *Execution:* **deteriorating on the pivot's own disclosed metrics** — RCS net bookings **−5.4%** in the six months to 2026-09-30 and **−8.8%** in the quarter against guidance of −5%; mobile net revenue **−11.0%** in the latest quarter and guided **down** for the year; in-game advertising, up 6.1% in FY2026, still **24.7% below FY2024**; management's own disclosed player-life floor **shortened** ("six and fifteen" → "**five** and fifteen" months) and title amortization shortened ("12 to 36" → "**9 to 36**" months). *Margin / capital:* revenue **+97.3%** FY2021→FY2026 delivered EBITDA **+4.1%** (incremental EBITDA margin **0.9%**); ROIC **negative five years running** (−4.3%, −3.1%, −4.2%, −0.8%, −1.0% LTM) against ~8.2%; accumulated goodwill impairment **5,887.3 of 6,949.2 gross**. *Legacy / disruption:* the pivot is **not being disrupted by the legacy business — it is being reversed by it on the company's own guidance** (full-game revenue +26.0% vs RCS +16.1% in FY2026; RCS guided from **78% to 65%** of FY2027 net bookings). The contradicting metrics are named in each pillar — gross margin **+290bp** in FY2026 (but **−110bp** on the like-for-like interim), RCS at **82.5%** of H1 GAAP revenue (a rising share of a **collapsed denominator**), and RCS guided **+12% in Q3 FY2027** (which the company confirms is **launch-attached Ultimate Edition add-on content**, not steady-state engagement).
- **Valuation Impact — exact qualification, verbatim: "Bearish Derating"**, with four qualifications that travel: (i) it is a read on what the **pivot** contributes to the warranted multiple, **not a fair-value level** — `07` owns the levels and `08` changes none of them and adds no independent method; (ii) it rests on the pivot's evidence, **not** the launch outcome, which is genuinely unmeasured — **no reported period contains a single dollar of GTA VI revenue**; (iii) the direction is **reinforced, not created**, by the priced-in read; (iv) the most direct single piece of evidence is **consensus's own shape** — implied FY2030 EBITDA 2,448.3 is **6.6% below** FY2029's 2,622.4.
- **Event, horizon, basis, uncertainty.** `Rerating Probability Score: 12%` — the event is **NasdaqGS:TTWO (USD) EV ÷ consensus FY2029E EBITDA rising from the 2026-11-19 baseline of 15.94x (vendor TEV 41,790.1 ÷ FY2029E EBITDA 2,622.4) to ≥ 20.0x held on three consecutive month-ends, with consensus FY2029E EBITDA at or above 2,622.4 at the outcome, AND all four FY2028 operating milestones met — M1 RCS net bookings above FY2027's, M2 mobile net revenue above FY2027's, M3 GAAP operating profit and ROIC both positive, M4 §15 FCF (CFO − total capex) at least equal to FY2027's and ≥ 700**. **Horizon 2026-11-19 → 2028-03-31 (16 months, observed monthly).** **Basis: judgment** — informed by 5 annual ROIC, 5 annual §15 FCF, 4 quarterly surprise, 6 annual guidance and 2 pivot-metric observations, **all below the ~8-observation line and none a frequency of this conjunction; not a measured frequency.** `08`'s own data sufficiency is **48/100** and its confidence **40/100**. The **88% complement** includes four paths, none automatically a derating — including path (d), **a blowout launch that lifts FY2029 estimates faster than the price, so the stock rises a long way while the multiple falls**. **This event can fail while the share price rises substantially.**
- **Reconciliation with `07`, explicit.** `07`'s base fair value of 196.17 implies EV 38,251.3, which on `08`'s fixed basis is **14.59x FY2029E EBITDA — BELOW today's 15.94x**. So `08`'s event describes the market paying roughly **37% more** per dollar of the same FY2029 earnings than `07` judges warranted. There is no disagreement about the levels: `08` changes none of them and enters no method weight. **The 12% is not a scenario probability, not a valuation-confidence score, and not authority to lift any cap.**
- **Priced-in limitation.** `08` is explicit that a positive execution read would still not become upside if already priced, and here it is worse than that: at this price `05` already demands 20.47%/yr compounding and `07` reports a **negative margin of safety**, so **there is no headroom in the price for a pivot premium that is not already demanded**. Strong execution is therefore not converted into upside anywhere in this synthesis.
- **Profit bridge — carried with its components and its residual, because it drives the conclusion.** `08` §3A states the bridge is **explicitly incomplete**: with one reportable segment whose profit measure *is* consolidated net income, **no new-business operating profit and no legacy operating profit are disclosed and none is estimated**. Known terms, FY2025 → FY2026: group GAAP operating profit **(4,391.1) → (104.2) = +4,286.9**, of which **+3,545.2** is the absent prior-year goodwill impairment and **+106.5** the absent reorganisation expense, leaving a **residual genuine operating movement of +635.2**. H1 FY2026 → H1 FY2027, with no impairment or reorganisation in either period: **(76.4) → (153.0) = −76.6** — the group got **worse** in the half closest to the launch. Tie-out with no plug: (104.2) − (76.4) + (153.0) = **(180.8)**, the LTM GAAP operating loss. **Pivot-level ROIC is "Not assessable" — not zero.**
- **What changed since the prior assessment:** **nothing to compare.** `08` §4 records this as a **first assessment** — one TTWO run root exists and no earlier `08` output exists for this issuer and listing, so there is no prior dated verdict, probability or event definition. Its original figures are recorded for a future run: baseline **15.94x**, baseline denominator **FY2029E EBITDA 2,622.4**, target **20.0x**, horizon **2028-03-31**, milestones **M1–M4**, probability **12%**, impact **Bearish Derating**.
- **Next falsifiable checkpoint with its comparable:** the **Q3 FY2027 print on or about 2027-02-09** — the first reported period containing any GTA VI revenue. Comparable: **Q3 FY2026 Net Bookings 1,757.1**. Bullish trigger: Net Bookings at or above the guided **3,350–3,500** (+90.6% to +99.2% year on year) **and** RCS **+12%** year on year as guided. Bearish trigger: Net Bookings below 3,350, or RCS below +12%, or a recoverability charge against the **2,577.3** capitalised balance. **Capable of failing — proven:** on the last two reported quarters the company **beat** its own range in Q1 FY2027 (1,385.9 vs 1,320–1,370) and **missed** it in Q2 FY2027 (1,601.3 vs 1,620–1,670). The bearish counterpart on the event's own axis is **≤ 13.0x on three consecutive month-ends with FY2029E EBITDA ≥ 2,622.4**.

**Freshness check on `08` (partial-rerun duty) — CURRENT, not stale.** `08` carries the same run date (2026-11-20) and the same frozen generation digest as every sibling in this module; it cites the same evidence cutoff (Q2 FY27 10-Q for the quarter ended 2026-09-30, the 2026-11-09 earnings release, deck and transcript, and the 2026-11-19 Capital IQ exports); and it reads `07`'s levels **verbatim** at their final published values (base 196.17, bull 397.52, `bear_cyclical` 67.68, `bear_structural` 52.53) together with `07`'s confidence cap of 55 and `05`'s 20.47% solve. No relevant new evidence and no revised upstream assumption post-dates its assessment. Its **12% event probability is therefore a current estimate on this evidence**, not history — and it remains a **judgment** figure on sub-8-observation samples. No rerun is requested and none is launched here.

**Named gaps recorded so they are visible rather than silently skipped:** (1) the **Sector Cycle Reality Test is "Not assessable" for both `02` and `03`** — neither multiples lens has a verified stable anchor; (2) **no peer-multiple history** exists, so whether the +78.6% forward premium is typical, wider or narrower than usual is unmeasurable — the more informative question this pool cannot answer; (3) **the numeric reading check is absent**, so every workbook cell behind all five lenses is **unchecked, never verified clean**; (4) **`03`'s single closest comparable (Electronic Arts) contributes no multiple** to any median; (5) **segment EBIT does not exist** (one reportable segment) and the two internal goodwill reporting units are unnamed and unsized.

---

## 4. Score Cap Application

| Cap Trigger | Applied? (Y/N) | Affected Score | Final Cap |
|---|---|---|---|
| No pool-verified price (price-state `indicative` or `none`) | **N** — price-state is **`pool-verified`**, USD 216.61 as-of 2026-11-19, 1 trading day old [`01` §7] | MoS, downside-to-bear, observed up/down, attractiveness + confidence | **Not applied.** All price-relative reads unlock; `05` was permitted to run |
| **Stale pool-verified price** (as-of > 5 trading days) | **N** — 1 calendar day ≈ 1 trading day; `01` documented a refresh attempt and found no fresher pool or user quote | Valuation confidence | **Not applied.** No dual-price presentation required |
| No consensus / forward estimates | **N** — 29-estimate consensus, NTM plus FY2027–FY2034 grid | Valuation confidence | Not applied (max 60 would have bound) |
| No peer data | **N** — 10 named peers with LTM and NTM multiples as-of 2026-11-19 (the blank Electronic Arts row is a **named weakness inside a present set**, not an absent set) | Overall usefulness | Not applied (max 70 would have bound) |
| Only one valuation method usable | **N** — four ran (`02`, `03`, `04`, `05`); three carry weight | Valuation confidence | Not applied |
| No cash flow AND DCF is only method | **N** — annual FY2017–FY2026 plus quarterly to Sep-30-2026 and LTM; DCF is one of four | Valuation confidence | Not applied |
| SOTP not possible for **multi-segment** business | **N** — TTWO is **single-segment** (`FY26 10-K, Note 21`), so this row (written for a multi-segment business) **does not bind** | Overall usefulness | Not applied |
| **Full high-to-low field of valid value-producing methods exceeds 40%** | **Y** — field is **63.17 – 328.44 = 5.20x (+419.9%)** | Valuation confidence | **max 55 — binds. Stated score 48.** The §3 explanation **does not waive it** |
| Terminal value >75% of DCF EV | **N** — base-case TV is **41.1%** of EV (persistence 51.1%, runoff 30.6%) | Valuation confidence | Not applied |
| Misaligned controlling owner (RF-OWN-004, §24 Filter 6) | **N** — **RF-OWN-004 NOT fired**; no controlling owner at all (largest holder 8.68%, 99.6% float, one share one vote) [`management-governance/99`, finding 04-016] | Valuation attractiveness | **Not applied** (max 60 and the mandatory flag would otherwise have bound). **A value-trap flag is nonetheless raised in §5 on three other grounds** |
| Sector Cycle Reality Test flags `02` and/or `03` cycle-elevated/depressed, unreconciled | **N** — both returned **"Not assessable"**; **no flag fired in either file**, so the same-direction compounding trigger did not occur | Valuation confidence (per method; combined) | **Not applied.** Recorded as a **named gap** in §3 — unmeasured, not cleared |

Most restrictive cap on valuation confidence: **55** (dispersion). Stated score **48**, set below the cap because (a) 75% of the base point rests on one unproven forward estimate, (b) neither multiples anchor is proven stable, and (c) every workbook figure is **unchecked, never verified clean**.

**Caps carried from other modules that this module does not lift:** the governance **RF-MGT-005 conviction cap ("no rating above Watchlist")** with the **"Misaligned or weak stewardship"** verdict and **no hard disqualifier**; `balance-sheet-survival`'s **"Adequate"** verdict with its "24-month refinancing resting on one unreported product cycle" qualifier (so **no distress cap** on the headline); and the **"No moat proven"** finding with trajectory **"eroding (NOT confirmed)"**, which may **not** be hardened into confirmed erosion anywhere downstream.

---

## 5. Fair-Value Summary

**(a) The levels and what drives them.** Bull **USD 397.52**, base **USD 196.17**, headline bear (`bear_cyclical`, 12-month) **USD 67.68**, with a separately labelled 24–36 month `bear_structural` avoid-ruin floor at **USD 52.53**. The single method that drives them for this company is **`03_relative-valuation-peers` at 45% of the base point** — forward, same-day, quality-matched, double-count test run, and the only lens with a genuinely independent read beside it. The base multiple of **16.28x EV/NTM EBITDA** is **+7.5%** above the quality-matched five-peer forward median of 15.14x and sits around the **15th–20th percentile** of TTWO's own 20-quarter NTM band (min 14.298x, median 26.806x, max 51.732x) — so the base is **not** built on a multiple the company has never earned; the fragility is in the metric, not the multiple.

**(b) What the price implies, and whether earnings evidence says it is achievable.** At USD 216.61 the market requires free cash flow to compound at **+20.47% a year for nine years** off a base that is already a launch-cycle peak, ending at **4,996 — 11.5x** the best annual free cash flow the company has ever produced; the same requirement expressed on margin is a flat **45.78% core operating margin (2.9x** the ten-peer median of 15.9% and **2.3x** TTWO's own best year ever), and on revenue it is **~52,045 by FY2036 — 3.8x the LTM revenue of the largest company in TTWO's own named peer set**. The earnings and business-model evidence says this is **not achievable**: metric-matched realised free cash flow has fallen at **−9.76% a year** since FY2022 with three negative years inside five; period-matched peak-to-peak profit growth is **+0.81% a year**; return on capital has been negative five years running against ~8.2%; and at the company's own forward consensus rate of **3.13% no horizon of any length reaches the price**. Every generous lever available — the Street's own margins, no charge for stock-based pay, a 1pp lower discount rate, a terminal that pays for growth the moat module says does not exist — still leaves **at least 14.18% a year** to be found. The counterweight is dated and must travel: **no reported period contains a single dollar of GTA VI revenue**, so this is a test of an expectation against history, not a measurement of a failure.

**(c) The two price-relative reads, kept separate.** **Margin of safety = −10.42%** — `(196.17 − 216.61) / 196.17`, the cushion if the base case is right, and it is **negative: no cushion exists at this price**. **Downside to bear = +68.75%** — `(216.61 − 67.68) / 216.61`, the loss if the cyclical bear plays out, an **inverted** metric where higher is worse; to the `bear_structural` floor it is **+75.75%**. Neither number is a proxy for the other, and reading the −10.42% alone as "roughly fair" would miss the entire shape of the situation.

**(d) Value-trap risk — flagged, on three grounds, and NOT on the Filter-6 cap.** TTWO is not a classic cheap-multiple trap: on the forward basis the stock is at a **premium** to its quality-matched peer median (+17.5% on NTM EV/EBITDA), not a discount, and the §24 Filter-6 trigger **did not fire**. The trap risk here runs the other way and is about the **warranted multiple being applied to an unwarranted denominator**. First, **stewardship**: RF-OWN-004 not fired, but the governance verdict is **"Misaligned or weak stewardship"** — over the five years that produced `02`'s reversion band, capital allocation netted **minus $14.6m** of free cash flow while the **share count rose 61.7%**, **book value per share fell 42.5%**, and **$6,665.1m (84.7%) of all goodwill ever recorded was written off**; a multiple earned while per-share value was being destroyed is a weak claim on the future, which is exactly why 26.806x is treated here as a **bull** multiple rather than a base. Second, **the anchor is unverified**: the Sector Cycle Reality Test is **"Not assessable"** for both multiples lenses, so a base case that "deserves" its multiple only because the whole sector currently does cannot be ruled out — **unmeasured, not cleared**. Third, and sharpest: **quality does not warrant even the modest premium on its own merits** — business quality **38/100** (cyclicality 22, competitive intensity 25, rate-of-change 35, firing the §24 Filter 5 sector/technology-cycle flag), **"No moat proven"** with trajectory **"eroding (NOT confirmed)"**, five consecutive years of return on capital below cost of capital, the second-highest leverage in the peer set (**3.6x** total debt/EBITDA against a peer median of 0.6x) and the **worst Credit Health score in the set** (Overall 4, where 1 = best, against a peer median of 2.5). Against that sit two things that must be credited or the discount is charged twice: the **highest forward growth rate in the set (25.75%)** and the **highest credit rating (BBB)**, with the forward NTM EBITDA margin of 23.71% **above** the matched sub-set median of 19.05%. They offset, and nothing in this pool sizes which wins — which is why no haircut was applied to any earnings multiple and confidence was capped instead.

---

## 6. What Would Change The Valuation Verdict?

| Current Verdict | What Would Make It Cheaper | What Would Make It More Expensive | Data Needed |
|---|---|---|---|
| **Modestly overvalued** (base USD 196.17 vs price USD 216.61; MoS −10.42%; downside-to-bear +68.75%) | **The denominator proving durable rather than a launch peak.** A Q3 FY2027 print at or above guided Net Bookings of **3,350–3,500** with RCS **+12%** year on year, **followed by** a second post-launch year that holds — which would validate consensus NTM EBITDA of 2,349.1 as a level and keep the 328.44 own-history reversion live. Also cheaper: evidence that recurrent spending is independent of the release calendar (two consecutive post-launch years of RCS bookings growth with **no** launch-attached add-on content inside the comparable); a disclosed DTC revenue line proving the margin claim; renewal of the three console licences (**39.0% of FY2026 revenue**, expiring 2027-03-31) on comparable terms; and sector-level multiple history showing the peer anchor is cycle-**depressed** rather than elevated | **The denominator breaking, or the anchor proving cycle-elevated.** Consensus FY2029E EBITDA being cut below **2,622.4**, or the Street's own FY2030 shape (already **−6.6%** versus FY2029) extending into FY2031+, would move the base point toward the **USD 139.33** (consensus FY2027) or **USD 83.92** (company-guided FY2027) readings at the same 16.28x. Also more expensive: a recoverability charge against the **2,577.3** capitalised development balance (**2,149.7 of it on unreleased titles at 2026-03-31 = 61.2% of equity**); the moat trajectory moving from **"eroding (NOT confirmed)"** to **confirmed**, which would promote the `bear_structural` floor of 52.53 to the headline down-leg; sector-level history showing the peer median is cycle-**elevated** | **One item, highest value: the Q3 FY2027 print (on or about 2027-02-09) — the first reported period containing any GTA VI revenue, read against guided GAAP revenue of 3,270–3,420 and the guided Net Bookings range of 3,350–3,500, with the Q3 FY2026 comparable of 1,757.1.** It is the only dated evidence that discriminates between a 5.2x-wide field whose whole disagreement is whether consensus NTM EBITDA of 2,349.1 is a level or a peak. Second-highest, and structural rather than dated: a **disclosed DTC revenue line or share of mobile**, which is the only way the pivot's central margin claim becomes testable at all |

---

## 7. Note To The Final Synthesizer

- **The LEVELS, verbatim, with the base point and the dominant method.** Bull **USD 397.52** · Base **USD 196.17** · `bear_cyclical` **USD 67.68** (headline, 12-month) · `bear_structural` **USD 52.53** (labelled avoid-ruin floor, **24–36 month** permanent-impairment path; harsher variant 50.58). Four cases, four labels — **adopt them verbatim; do not merge the two down-legs under a bare `bear`.** Driven by **`03_relative-valuation-peers` at 45%** of the base point (`02` 30%, `04` 25%, `06` 0%), implying **16.28x EV/NTM EBITDA** and **20.50x NTM P/E**. Bull/base/bear horizons are **12 months**; `bear_structural` is **24–36 months** — if you probability-weight it alongside the others, your weighted figure is **not a same-date comparison** and must say so.
- **What the price implies, and whether it is achievable.** **+20.47%/yr FCFF compounding for nine years** off an already-peak launch base, ending at **11.5x** the best-ever annual free cash flow; or a flat **45.78%** core operating margin; or **~52,045** of FY2036 revenue (**3.8x Nintendo's LTM revenue today**). **Not achievable on any matched base rate** — realised −9.76%/yr (metric-matched), +0.81%/yr (peak-to-peak), consensus 3.13% long-run at which **no horizon reaches the price**. The discount-rate explanation is **ruled out, not ignored**: the implied rate is **2.63%, 244bps below the risk-free rate**.
- **Strategic rerating (`08`), carried to your valuation discussion and your forecast ledger — and NOT substituted for a scenario probability.** Three-pillar result: execution **deteriorating on the pivot's own metrics** (RCS bookings −5.4% H1, mobile −11.0% in the quarter, both guided down), margin/capital **negative** (revenue +97.3% delivered EBITDA +4.1%; ROIC negative five years running; 85% of goodwill written off), legacy **reversing the pivot on the company's own guidance** (RCS 78% → 65% of FY2027 net bookings). **Valuation Impact: "Bearish Derating"** — a read on the warranted multiple, **not a fair-value level**, with no independent method and no change to any level above. **Event:** EV ÷ consensus FY2029E EBITDA rising from the **15.94x** baseline of 2026-11-19 to **≥ 20.0x** held on three consecutive month-ends with FY2029E EBITDA ≥ **2,622.4**, AND all four FY2028 milestones (M1 RCS bookings above FY2027's; M2 mobile revenue above FY2027's; M3 GAAP operating profit and ROIC both positive; M4 §15 FCF ≥ FY2027's and ≥ 700). **Horizon 2026-11-19 → 2028-03-31. Probability 12%, basis judgment** on 5/5/4/6/2-observation samples, **all below ~8 and none a frequency of this conjunction — not a measured frequency.** **Priced-in limitation:** there is no headroom in this price for a pivot premium that is not already demanded, so strong execution does not become upside. **Changes since prior assessment: none — this is a first assessment** (no earlier `08` exists for this issuer and listing); `08` is **current, not stale** (same generation, same evidence cutoff, reads `07`'s final levels verbatim). **Next falsifiable checkpoint:** the **Q3 FY2027 print, ~2027-02-09**, against the **Q3 FY2026 comparable of 1,757.1** — bullish at guided Net Bookings 3,350–3,500 with RCS +12%; bearish below 3,350, or RCS below +12%, or a charge against the 2,577.3 capitalised balance. **Read the complement carefully: this event can fail while the share price rises a long way** (path (d) — a blowout launch lifts FY2029 estimates faster than the price, so the multiple falls).
- **The two downside anchors, kept separate.** **Margin of safety −10.42%** — the cushion to the **base** case, and it is **negative: none exists**. **Downside-to-bear +68.75%** (**inverted**) to the **USD 67.68** cyclical bear; **+75.75%** to the **USD 52.53** structural floor. The structural floor sits **below** the cyclical trough, so if the moat trajectory confirms, the headline down-leg moves **down** to the reset.
- **Genuine value or value-trap risk, with the warranted-multiple reasoning.** This is **not** a cheap-multiple trap — the stock is at a **+17.5% premium** to its quality-matched peer forward median, and **RF-OWN-004 did not fire** (no controlling owner at all: largest holder 8.68%, 99.6% float, one share one vote), so **no structurally misaligned owner makes this cheapness a trap**. The trap risk is the **warranted multiple applied to an unwarranted denominator**, plus three qualifiers you must carry unhardened: the governance verdict **"Misaligned or weak stewardship"** with **no hard disqualifier** and the **RF-MGT-005 conviction cap ("no rating above Watchlist")**; **"No moat proven"** with trajectory **"eroding (NOT confirmed)"** — which must **not** be restated as confirmed erosion; and quality **38/100** with return on capital below cost of capital for five straight years, the second-highest leverage in the peer set (3.6x vs 0.6x) and the worst Credit Health score in it. Credit the other side or the discount is charged twice: **highest forward growth (25.75%)** and **highest credit rating (BBB)** in the set, and a forward EBITDA margin (23.71%) **above** the matched sub-set median (19.05%). No haircut was applied to any earnings multiple; the margin-ratio formula was tested and **rejected as a double count**.
- **Which method to trust, and which to discount, for THIS company.** **Trust `03` (peers)** — forward, same-day, one engine, quality-matched, double-count test run, with the **EA take-private as the one independent read (an upper bound: TTWO's 6.5x LTM EV/Sales is 94% of the 6.94x paid for outright control of a larger, higher-margin competitor)**. **Discount `02` (own history)** — its 26.806x is a pre-launch multiple on post-launch earnings, its own producer calls it **"ceiling-ish"**, and a record of where the market has already priced TTWO **cannot** corroborate a claim that the market is mispricing TTWO. **Do not dismiss `04`** at 63.17: the gap is proven **not** to be a discount-rate artefact, so it is a real warning about the **level** of cash flow. **Do not weight `06`** at all — single segment; its 156.27 duplicates `03`.
- **Partial-data caps and what they limit.** **The confidence cap of 55 binds** (cross-method field 5.2x / +419.9%) and is **not** waived by the §3 explanation; the stated score is **48**. **No no-price cap and no staleness cap** — the price is `pool-verified` and one trading day old, so margin of safety, downside-to-bear, observed up/down and attractiveness are **all assessable** and `05` ran. **No peer-data, no-consensus, one-method, no-cash-flow, terminal-dominance, SOTP-multi-segment or Filter-6 cap binds.** Three named gaps limit the read without capping a score: the **Sector Cycle Reality Test is "Not assessable" for BOTH `02` and `03`** (unmeasured, **not** "no distortion"), **no peer-multiple history** exists, and the **numeric reading check is absent — every workbook figure is UNCHECKED, never verified clean.**
- **Biggest missing data point (one item).** **The Q3 FY2027 print on or about 2027-02-09 — the first reported period containing any GTA VI revenue.** The entire 5.2x field is one disagreement about whether consensus NTM EBITDA of 2,349.1 is a level or a launch-year peak, and that print is the only dated evidence that settles it.
- **Explicit handoff.** The master synthesizer's **"Valuation and Peer Mispricing" section should DEFER to this synthesis.** The bull/base/bear **LEVELS above are the inputs** for your probability-weighted scenario model — **you assign the probabilities, not this module.** This module has assigned none, computed no probability-weighted return, no risk/reward, no rating and no position size. Note for your §9A Bull Case and §10 Kill Criteria: the steelman is `02`'s −33.6% forward discount to its own median (implying 328.44) and the fact that **no reported period contains a dollar of GTA VI revenue**; the kill criteria sit on the **USD 52.53 structural floor**, the **2,577.3 capitalised-content recoverability test**, and the **2027-03-31 console licence expiry covering 39.0% of FY2026 revenue**.

---

## 8. Simple Summary

- **The price is slightly above what the methods say it is worth, and there is no cushion.** Fair value USD 196 against a USD 216.61 close — a 10.4% premium of price over fair value. That is a boundary call; it was resolved the conservative way.
- **The levels: bull USD 398, base USD 196, bear USD 68** — plus a separate, worse floor of **USD 53** if the business is permanently damaged over two to three years.
- **The market is pricing cash flow growing 20.5% a year for nine years, from a peak that only just started.** The company's actual record is cash flow **falling** about 10% a year since 2022, and profit between its own cycle peaks growing under 1% a year. At the growth rate the company's own analysts forecast, **no length of forecast reaches today's price.**
- **The downside is large and measurable: a 68.75% fall to the bear case, 75.75% to the worse floor.** That is the number to look at, not the 10% premium.
- **The method that matters most is the peer comparison** (45% of the answer). The company's own trading history is the least useful here, because the multiple it would revert to was earned **before** the game launched, on a company that was destroying value per share at the time.
- **Value-trap risk: yes, but not the usual kind.** Nothing here is a cheap multiple on a misaligned owner — there is no controlling owner at all. The risk is that a reasonable multiple is being applied to a **one-off peak year of earnings**. At the same multiple on this fiscal year's consensus the answer is **USD 139**; on the company's own guidance for this fiscal year, **USD 84**.
- **A current price WAS available** — USD 216.61, from the data pool, one trading day old. So every up/down and cushion number here is real. One caveat: that close is **the launch day itself**, so it contains no trading after the game went on sale.
- **This module is useful for the master synthesizer** — it delivers four named levels, a hard read on what is priced in, and one dated test (the February 2027 quarter) that settles the whole argument. But **confidence is capped at 55** and set at 48: the methods disagree by 5.2x, three-quarters of the answer rests on one forecast number, and **no figure from the data workbooks in this run was ever mechanically verified.**

---

### `analyses/TTWO_2026-11-19/valuation/valuation_summary.json`

```json
{
  "schema_version": "1.5",
  "ticker": "TTWO",
  "as_of": "2026-11-20",
  "currency": "USD",
  "business_type": "Operating",
  "basis": "ev",
  "shares": 188.0,
  "net_debt": 1370.4,
  "net_debt_basis": "strict",
  "current_price": 216.61,
  "price_as_of": "2026-11-19",
  "price_state": "pool-verified",
  "is_developed_mega_cap": true,
  "scenarios": [
    {
      "label": "bull",
      "set_membership": "weighted",
      "forward_metric": 2839.1,
      "metric_basis": "NTM management-basis (non-GAAP) EBITDA",
      "metric_period": "NTM",
      "metric_measure": "EBITDA",
      "multiple": 26.806,
      "multiple_basis": "EV/NTM EBITDA (management basis) — 02's own 5-year NTM MEDIAN, set against a band of min 14.298x / max 51.732x",
      "multiple_kind": "applied",
      "basis": "ev",
      "bridge": {
        "net_debt": 1370.4,
        "net_debt_basis": "strict §15 (01 §7 canonical: borrowings-only debt 2,519.8 less cash & equivalents 1,149.4)",
        "minority": 0.0,
        "other": 0.0,
        "shares": 188.0,
        "source": "01_price-and-capital-structure.md §7 Anchor Summary (Q2 FY27 10-Q, Note 10 (Debt) and Balance Sheets), adopted from balance-sheet-survival/01 §7"
      },
      "level": 397.52,
      "drivers": "12-month horizon. GTA VI sells through +10% above the guided launch-quarter midpoint, sustained across the NTM window, converting at the company's own guided incremental rate of $0.4946 of EBIT per $1 of revenue; the +130bps gross-margin reversion lands; recurrent consumer spending beats guided-flat by +4pp; and the market pays TTWO its own 5-year average forward multiple again. NOTE: 397.52 sits above the highest of 29 analyst price targets (330.00; mean 283.93).",
      "derivation": {
        "model": "ev_bridge",
        "ev": 76104.3,
        "net_debt": 1370.4,
        "net_debt_basis": "strict §15 (01 canonical)",
        "minority": 0.0,
        "other": 0.0,
        "shares": 188.0,
        "source": "07_scenario-and-fair-value.md §3 executed snippet (python3 s07.py, executed 2026-11-20)"
      },
      "source": "07_scenario-and-fair-value.md §3 scenario table; multiple from 02_multiples-own-history.md §2A (NTM band, n=20, 2021-12-31 to 2026-09-30)"
    },
    {
      "label": "base",
      "set_membership": "weighted",
      "forward_metric": 2349.09,
      "metric_basis": "NTM management-basis (non-GAAP) EBITDA — consensus",
      "metric_period": "NTM",
      "metric_measure": "EBITDA",
      "multiple": 16.2831,
      "multiple_basis": "EV/NTM EBITDA (management basis) — the implied multiple of the §1 weighted method blend (02 30% / 03 45% / 04 25%), published as 16.28x; +7.5% vs 03's quality-matched five-peer median 15.14x and −39.3% vs 02's own-history median 26.806x",
      "multiple_kind": "implied",
      "basis": "ev",
      "secondary_multiples": [
        {
          "value": 20.5,
          "basis": "NTM P/E (on NTM diluted EPS 9.569)",
          "note": "cross-check only; 07 §2C"
        }
      ],
      "bridge": {
        "net_debt": 1370.4,
        "net_debt_basis": "strict §15 (01 §7 canonical: borrowings-only debt 2,519.8 less cash & equivalents 1,149.4)",
        "minority": 0.0,
        "other": 0.0,
        "shares": 188.0,
        "source": "01_price-and-capital-structure.md §7 Anchor Summary (Q2 FY27 10-Q, Note 10 (Debt) and Balance Sheets), adopted from balance-sheet-survival/01 §7"
      },
      "level": 196.17,
      "drivers": "12-month horizon. Consensus NTM EBITDA of 2,349.1 is delivered — which already requires the launch quarter to carry 120.9% of the whole year's guided Net Bookings growth while the other three quarters are guided to shrink by 288.9 in aggregate — and the market pays a forward multiple a touch above a quality-matched peer median rather than reverting to TTWO's own pre-launch average. DENOMINATOR CAVEAT that travels with this level: 2,349.1 is 3.24x LTM EBITDA (724.9) and 2.23x the company's own guided FY2027 non-GAAP EBITDA midpoint (1,053); at this same 16.28x, consensus FY2027 EBITDA gives 139.33/sh and company-guided FY2027 gives 83.92/sh.",
      "derivation": {
        "model": "ev_bridge",
        "ev": 38251.3,
        "net_debt": 1370.4,
        "net_debt_basis": "strict §15 (01 canonical)",
        "minority": 0.0,
        "other": 0.0,
        "shares": 188.0,
        "source": "07_scenario-and-fair-value.md §3 executed snippet (python3 s07.py, executed 2026-11-20)"
      },
      "source": "07_scenario-and-fair-value.md §1 weighted blend and §2C; NTM EBITDA from Capital IQ Estimates → Multiples (NTM), As-Of 2026-11-19"
    },
    {
      "label": "bear_cyclical",
      "set_membership": "weighted",
      "forward_metric": 985.8,
      "metric_basis": "NTM management-basis (non-GAAP) EBITDA — the FY2025 prior-downturn margin, bridged from its reported 6.71% to a management basis of 12.44% by adding back FY2025 SBC of 324.0, then applied to this case's FORWARD revenue of 7,925.1 (NTM revenue 9,906.3 less 20%). This is a FORWARD (NTM) case: a prior-trough MARGIN re-based onto a forward denominator, not a trough-period metric.",
      "metric_period": "NTM",
      "metric_measure": "EBITDA",
      "multiple": 14.298,
      "multiple_basis": "EV/NTM EBITDA (management basis) — 02's own 5-year NTM MINIMUM, set 2022-06-30",
      "multiple_kind": "applied",
      "basis": "ev",
      "bridge": {
        "net_debt": 1370.4,
        "net_debt_basis": "strict §15 (01 §7 canonical: borrowings-only debt 2,519.8 less cash & equivalents 1,149.4)",
        "minority": 0.0,
        "other": 0.0,
        "shares": 188.0,
        "source": "01_price-and-capital-structure.md §7 Anchor Summary (Q2 FY27 10-Q, Note 10 (Debt) and Balance Sheets), adopted from balance-sheet-survival/01 §7"
      },
      "level": 67.68,
      "drivers": "12-month horizon; the HEADLINE bear. The launch undersells: revenue −20% against the guided midpoint (earnings/07's own bear move on its top variable), and the four mechanical links fire together because they are one event — the straight-line amortisation floor keeps charging when revenue does not arrive; the recoverability test trips against the 2,577.3 carried capitalised balance (2,149.7 of it on unreleased titles at 2026-03-31 = 61.2% of equity); the GTA VI Ultimate Edition add-on content driving the guided recurrent-spending rise does not convert; and ~$96m of SBC still lands in Q3 cost of revenue regardless, with Q3 operating expenses guided +21% YoY on launch marketing already committed. Sanity: 985.8 is 1.40x the prior trough's own management-basis absolute EBITDA of 704.0 — severe but not deeper than the cited history.",
      "derivation": {
        "model": "ev_bridge",
        "ev": 14094.5,
        "net_debt": 1370.4,
        "net_debt_basis": "strict §15 (01 canonical)",
        "minority": 0.0,
        "other": 0.0,
        "shares": 188.0,
        "source": "07_scenario-and-fair-value.md §3 executed snippet (python3 s07.py, executed 2026-11-20)"
      },
      "source": "07_scenario-and-fair-value.md §3 scenario table and the prior-downturn re-basing table; multiple from 02_multiples-own-history.md §2A (NTM band minimum)"
    },
    {
      "label": "bear_structural",
      "set_membership": "weighted",
      "forward_metric": null,
      "metric_basis": "Reset base — 04's impaired declining-perpetuity FCFF path: terminal EBIT margin faded to 8.0% with g = 0.0% nominal (zero-to-negative real) on a non-recovering revenue base. A permanently lower normalized margin, NOT a forward EBITDA multiple. 24–36 month horizon.",
      "metric_period": "mid_cycle",
      "metric_measure": "FCF",
      "multiple": null,
      "multiple_basis": null,
      "multiple_kind": "implied",
      "basis": "ev",
      "secondary_multiples": [
        {
          "value": 4.78749,
          "basis": "EV/NTM EBITDA (management basis) — translation of the impaired EV onto the weighted set's own axis (11,246.3 ÷ 2,349.1)",
          "note": "A TRANSLATION DEVICE, not a claim the market would pay it: the reset's whole point is that the 2,349.1 level does not persist. Below 02's 5-yr NTM minimum of 14.298x and inside the distressed end of the live peer cross-section (Ubisoft 2.20x, Playtika 3.67x, tinyBuild 7.37x). 07 §3."
        },
        {
          "value": 4.65,
          "basis": "implied exit TEV/FY2037 EBITDA (on FY2037 EBITDA of 1,657.6)",
          "note": "04 §5 runoff terminal, cross-check only"
        }
      ],
      "bridge": {
        "net_debt": 1370.4,
        "net_debt_basis": "strict §15 (01 §7 canonical: borrowings-only debt 2,519.8 less cash & equivalents 1,149.4)",
        "minority": 0.0,
        "other": 0.0,
        "shares": 188.0,
        "source": "01_price-and-capital-structure.md §7 Anchor Summary (Q2 FY27 10-Q, Note 10 (Debt) and Balance Sheets), adopted from balance-sheet-survival/01 §7"
      },
      "level": 52.53,
      "drivers": "24–36 MONTH horizon — a permanent-impairment path, not the 12-month bear; 07 carries it as the labelled avoid-ruin floor for §24 / Kill Criteria while the HEADLINE bear stays bear_cyclical at 67.68. Marked weighted here so that, if the master prices the floor (as committed runs normally do at 10–20%), it is not a weighted bear hidden from the basis gate; it carries no probability from this module. What must be true: the 'eroding (NOT confirmed)' moat read CONFIRMS — share loss to a new equilibrium in free-to-play mobile (50.1% of FY26 revenue, barriers the filing itself calls 'relatively low'), terminal-value fade, and continuing permanent capital destruction ($5,887.3m accumulated goodwill impairment of $6,949.2m gross, taken for 'industry conditions and changes in our strategies'; two disclosed unit lifetimes both shortened in the latest filing). Harsher 04 variant (margin fade from FY2035 rather than the terminal only): 50.58/sh. The floor sits BELOW the cyclical trough, so if the trajectory confirms the headline down-leg moves down to the reset.",
      "derivation": {
        "model": "ev_bridge",
        "ev": 11246.3,
        "net_debt": 1370.4,
        "net_debt_basis": "strict §15 (01 canonical)",
        "minority": 0.0,
        "other": 0.0,
        "shares": 188.0,
        "stated_drivers": [
          {
            "label": "terminal EBIT margin (runoff)",
            "value": 0.08,
            "note": "impaired-FCFF DCF input — 04 §5; its per-year mapping to this EV is recorded only as the single runoff EV, so it is display-only provenance, not a lever"
          },
          {
            "label": "terminal growth g, nominal",
            "value": 0.0,
            "note": "zero-to-negative real (below ~2.5% US expected inflation); at g = −1.0% nominal 04 reports the terminal falling to 6,917 and the per-share value to 48.1 — display-only"
          },
          {
            "label": "WACC",
            "value": 0.088521,
            "note": "04 §3 — also sits inside the PV factors, whose sensitivity 04 did not record per scenario; display-only"
          },
          {
            "label": "terminal value as % of EV",
            "value": 0.306,
            "note": "04 §5 runoff variant — display-only"
          }
        ],
        "source": "07_scenario-and-fair-value.md §3 'bear_structural' bridge and executed snippet (python3 s07.py, 2026-11-20); impaired EV from 04_intrinsic-dcf.md §5–§6 runoff terminal"
      },
      "source": "07_scenario-and-fair-value.md §3 scenario table and 'bear_structural' bridge; 04_intrinsic-dcf.md §5 runoff terminal and §6 variant table"
    }
  ],
  "cross_metric_reconciliation": "bear_structural is the only weighted case built on a different MEASURE and PERIOD from the other three (04's impaired mid-cycle FCFF path over 24–36 months, versus NTM management-basis EBITDA over 12 months), so 07 publishes the bridge rather than leaving it implied: the impaired enterprise value of 11,246.3 expressed on the weighted set's own axis is 11,246.3 ÷ NTM EBITDA 2,349.1 = 4.79x EV/NTM EBITDA — below 02's 5-year NTM minimum of 14.298x and inside the distressed end of the live peer cross-section. Read it as a translation device only: the reset's premise is that the 2,349.1 level does not persist. One further definition difference travels with it — 04 CHARGES stock-based compensation inside EBIT while the management-basis NTM measure ADDS IT BACK (462 guided for FY2027), which is why the two axes are not interchangeable without this bridge. [07_scenario-and-fair-value.md §3 'bear_structural — the explicit structural-reset bridge'; 04_intrinsic-dcf.md §1 and §5]",
  "methods": {
    "own_history": 328.44,
    "peers": 181.89,
    "dcf": 63.17,
    "sotp": 156.27
  },
  "method_weights": {
    "own_history": 0.30,
    "peers": 0.45,
    "dcf": 0.25,
    "sotp": 0.0
  },
  "method_basis": {
    "own_history": "NTM",
    "peers": "NTM",
    "dcf": "FY+1",
    "sotp": "NTM"
  },
  "method_weight_exception": null,
  "discount_rate": {
    "rf": 0.0507,
    "erp": 0.0441,
    "beta": 0.92,
    "cost_of_equity": 0.091272,
    "wacc": 0.088521,
    "after_tax_kd": 0.04424
  },
  "peers_internals": {
    "metric_name": "NTM EV/EBITDA (management-basis NTM EBITDA 2,349.09), bridged at strict net debt 1,370.4 over 188.0m diluted shares",
    "median_multiple": 15.14,
    "applied_multiple": 15.14,
    "discount_pct": 0,
    "anchors": [
      {
        "multiple": 9.96,
        "value": 117.16,
        "label": "full ten-peer NTM EV/EBITDA median"
      },
      {
        "multiple": 12.44,
        "value": 148.15,
        "label": "full ten-peer mean"
      },
      {
        "multiple": 15.14,
        "value": 181.89,
        "label": "quality-matched five-peer median — BASE CASE (= methods.peers)"
      },
      {
        "multiple": 17.25,
        "value": 208.25,
        "label": "quality-matched five-peer mean"
      }
    ],
    "source": "03_relative-valuation-peers.md §5 implied-value table (Capital IQ Comps → Trading Multiples and → Financial Data, As-Of 2026-11-19; equity bridge at 01 §7's canonical strict net debt 1,370.4 and 188.0m diluted shares). discount_pct is 0 because NO quality haircut was applied to any earnings-based multiple: the own-margin ÷ peer-margin formula was tested and rejected as a double count (03 §5 ledger), and the move from 9.96x to 15.14x is a change of COMPARABLE SET on ex-ante criteria, not an adjustment to a multiple. Electronic Arts, the closest comparable, is private (take-private closed 2026-08-04) and contributes no multiple to either median."
  },
  "notes": "OMITTED BY REPRODUCE-OR-OMIT, with reasons. (1) dcf_grid: 04 §7 publishes TWO grids and neither is emittable faithfully. Grid A's base cell DOES equal methods.dcf (63.17) but its second axis is the terminal operating MARGIN, not terminal growth — the base terminal is TV = NOPAT/WACC with terminal ROIC = WACC, which is mathematically g-invariant, so growth is inert by construction. Grid B is a true WACC x terminal-growth grid but is run on the PERSISTENCE terminal, whose base cell is 77.56, not methods.dcf. Emitting Grid A with margins labelled as growth would misrepresent the axis; emitting Grid B would fail the reproduce anchor. Omitted rather than bent. (2) sotp_segments / sotp_bridge: omitted — TTWO is a SINGLE-SEGMENT company (FY26 10-K, Note 21) and 06 returned 'single-segment — SOTP collapses to the consolidated read' with zero weight on its own instruction; methods.sotp of 156.27 is recorded in the football field for transparency only (13.09x NEXON/Konami midpoint x NTM EBITDA 2,349.09, bridged at strict net debt 1,370.4 over 188.0m shares) and carries 0.0 weight because it duplicates methods.peers. SOURCE-CHECK STATUS: this frozen generation carries NO numeric_reading_check at any source or sheet level and corpus.txt carries no labelled extractor reading-warning annotation, so every Capital IQ workbook cell behind every lever above is mechanically UNCHECKED — never verified clean. No literal warning token, source/extract reference or LF-line/column span exists to quarantine, and no amount is marked not-proven on that basis. NO SCENARIO PROBABILITIES are written here: the master synthesizer owns probabilities, probability-weighted returns, risk/reward, the rating and position sizing (MODULE_RULES Scope). Horizons differ across cases — bull/base/bear_cyclical are 12-month; bear_structural is 24–36 month — so any probability-weighted figure mixing them is not a same-date comparison and must say so."
}
```
