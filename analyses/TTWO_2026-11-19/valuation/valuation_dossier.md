# valuation Module Dossier — TTWO

> Deterministic, lossless concatenation of every artifact in this module — the module synthesis and every specialist output, in order. Generated mechanically (no LLM rewriting), so nothing is omitted or paraphrased. This is the module's "see everything" tier; the module's decision lives in `99_*-synthesis.md` and the short read in `valuation_memo.md`.

- Generated: 2026-11-20T10:52:34Z
- Module folder: `valuation`
- Contents: 1 module synthesis + 9 specialist outputs = 10 files

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
- [valuation / 08_strategic-rerating.md](#valuation-08-strategic-rerating-md) — `08_strategic-rerating.md`


---

## valuation — module synthesis

_Source: `99_valuation-synthesis.md`_

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



---

## valuation / 00_valuation-data-triage.md

_Source: `00_valuation-data-triage.md`_

# Valuation Data Triage — TTWO

**Evidence binding (frozen chain).** This run is bound to a supervisor-verified frozen evidence capability. The complete quartet was present and verified before any read: `NOSTRA_FROZEN_POOL_DATA_PATH`, `NOSTRA_FROZEN_POOL_OUT_DIR`, `NOSTRA_FROZEN_POOL_GENERATION=0af638492ecb0521db2676c79d75e6940c7227bb9f192567527b8a57eb43203d`, `NOSTRA_FROZEN_EVIDENCE_ROOT`. `DATA_PATH` is the frozen evidence root only; `data/TTWO/` is a citation label, not a readable path. Every manifest, corpus, CIQ-facts, relationships, and extract read resolved inside that one generation. The pool extractor was NOT run; the live pool and the original `_pool_extracts/` tree were not read.

**Manifest totals (verbatim):** `{"sources": 30, "workbooks": 19, "tabs": 62, "extracts_written": 73, "failures": 0}`. Zero sources carry `fail`, `fallback-text`, `missing-dependency`, or `gdrive-pointer` status — no document in this pool is in an extraction-failure state, so no source is counted as missing on extraction grounds (fix F03). `vision_mode: false`, `offline_extraction_complete: true`.

**Numeric reading check — ABSENT from this generation (unchecked, not clean).** This manifest carries NO `numeric_reading_check` object at any source or sheet level (`manifest.json` string count for the token `numeric_reading_check` = 0), and the corpus carries no labelled extractor reading-warning annotations. Per the module's evidence rule, **a missing legacy check means unchecked, not verified** — no warning here is not proof of accuracy. There is therefore no literal warning token, no source/extract reference, and no LF-line/column span to carry forward, and no amount is marked not-proven on that basis. Downstream agents must treat every number lifted from a workbook cell as mechanically unverified by the pattern check, and must verify any value-determining amount against the original source **inside this frozen capability only** — never by guessing a corrected figure and never by altering frozen evidence.

**Period dating method (fix F23).** Every raw file in the frozen capability carries the filesystem timestamp `2026-11-20 12:46` — that is the freeze/sync stamp of the capability, not a document date. The "Last Modified" column below is therefore deliberately NOT used as a recency signal; the "Period Covered" column is parsed from INSIDE each document (fiscal-year / period-end / "As-Of Date:" lines) and is the only recency basis used in this report.

**External data:** no `external/` directory exists in this pool (`raw/TTWO/` contains 30 files, none under `external/`, and no manifest row carries `external: true` or a `provenance` object). No `## 1A. External Data` table is rendered, and no sufficiency judgement here rests on external research.

---

## 1. File Inventory

Every one of the 30 sources is listed, and every one of the 62 workbook tabs is its own row (73 inventory rows = 11 non-workbook extracts + 62 tabs), reconciled against `<GENERATION_ROOT>/manifest.json`. No workbook appears as a single opaque row. Sizes are the raw-file sizes for documents and `rows × cols` for tabs.

| Filename | Type | Period Covered | Last Modified | Valuation Relevance |
|---|---|---|---|---|
| `10K_2025_26_0001628280-26-037434.pdf` (1.96 MB) | Annual filing (10-K) | FY ended **Mar-31-2026** ("For the fiscal year ended March 31, 2026") | — (freeze stamp only; see note) | **High** |
| `10K_2024_25_0001628280-25-026694.pdf` (2.87 MB) | Annual filing (10-K), prior year | FY ended **Mar-31-2025** | — | **High** |
| `10Q_2Q_0001628280-26-072254.pdf` (1.02 MB) | Quarterly filing (10-Q) | Quarter ended **Sep-30-2026** (Q2 FY27) | — | **High** |
| `10Q_1Q_0001628280-26-054870.pdf` (0.55 MB) | Quarterly filing (10-Q) | Quarter ended **Jun-30-2026** (Q1 FY27) | — | **High** |
| `TTWO 2Q27 Earnings Release FINAL.pdf` (0.30 MB) | Earnings release | Q2 FY27 (Sep-30-2026), released Nov-2026 | — | High |
| `TTWO 1Q27 Earnings Release FINAL 8-6-2026.pdf` (0.25 MB) | Earnings release | Q1 FY27 (Jun-30-2026), released Aug-06-2026 | — | High |
| `Take-Two_Interactive_2Q FY27 FINAL.pdf` (0.87 MB) | Investor deck | Q2 FY27 (Sep-30-2026) | — | Medium |
| `Take-Two_Interactive_1Q FY27 FINAL.pdf` (0.90 MB) | Investor deck | Q1 FY27 (Jun-30-2026) | — | Medium |
| `Take-Two Interactive Software, Inc., Q2 2027 Earnings Call, Nov 09, 2026.rtf` (0.29 MB) | Transcript | Call **Nov-09-2026** (Q2 FY27) | — | High |
| `Take-Two Interactive Software, Inc., Q1 2027 Earnings Call, Aug 07, 2026.rtf` (0.30 MB) | Transcript | Call **Aug-07-2026** (Q1 FY27) | — | Medium |
| `Take Two Interactive Software Inc NasdaqGS TTWO Public Company Profile.rtf` (0.27 MB) | Company profile (CIQ) | Profile, no internal as-of line | — | Low |
| **Financials_Annual.xls** → `Key Stats` (91×13) | Capital-IQ financial export | Annual columns Mar-31-2017 → Mar-31-2026 | — | High |
| **Financials_Annual.xls** → `Income Statement` (119×12) | Income statement | FY2017 → FY2026 (USD m, reported) | — | **High** |
| **Financials_Annual.xls** → `Balance Sheet` (97×12) | Capital structure | FY2017 → FY2026 | — | **High** |
| **Financials_Annual.xls** → `Cash Flow` (74×12) | Cash flow statement | FY2017 → FY2026 | — | **High** |
| **Financials_Annual.xls** → `Multiples` (90×42) | Multiples export | **Quarterly** closes 2017-03-31 → current (40 columns) | — | **High** |
| **Financials_Annual.xls** → `Historical Capitalization` (39×43) | Historical market cap / TEV | Quarterly series to current | — | High |
| **Financials_Annual.xls** → `Capital Structure Summary` (99×23) | Capital structure | FY2017 → FY2026 | — | **High** |
| **Financials_Annual.xls** → `Capital Structure Details` (38×10) | Debt detail by instrument | As-reported block, latest **May-22-2026** | — | **High** |
| **Financials_Annual.xls** → `Ratios` (161×12) | Ratios (incl. ROIC) | FY2017 → FY2026 | — | High |
| **Financials_Annual.xls** → `Supplemental` (67×11) | Supplemental (capex, SBC) | FY2017 → FY2026 | — | High |
| **Financials_Annual.xls** → `Segments` (76×11) | Segment / geographic revenue | Latest annual col **Mar-31-2026** | — | Medium |
| **Financials_Annual.xls** → `Industry Specific` (15×6) | Industry metrics | Sparse (20 cells) | — | Low |
| **Financials_Annual.xls** → `Pension OPEB` (21×11) | Pension / OPEB | FY2017 → FY2026, sparse (65 cells) | — | Low |
| **Financials_Quarterly.xls** → `Key Stats` (91×13) | Capital-IQ financial export | Quarterly to Sep-30-2026 | — | High |
| **Financials_Quarterly.xls** → `Income Statement` (116×43) | Income statement (LTM base) | Jun-30-2016 → **Sep-30-2026** + LTM | — | **High** |
| **Financials_Quarterly.xls** → `Balance Sheet` (98×43) | Capital structure | Jun-30-2016 → **Sep-30-2026** | — | **High** |
| **Financials_Quarterly.xls** → `Cash Flow` (73×43) | Cash flow statement | Jun-30-2016 → **Sep-30-2026** + LTM | — | **High** |
| **Financials_Quarterly.xls** → `Multiples` (91×42) | Multiples export | Quarterly closes 2017-03-31 → current | — | **High** |
| **Financials_Quarterly.xls** → `Historical Capitalization` (39×43) | Historical market cap / TEV | Jun-30-2016 → current | — | High |
| **Financials_Quarterly.xls** → `Capital Structure Summary` (74×85) | Capital structure | Jun-30-2016 → Sep-30-2026 | — | **High** |
| **Financials_Quarterly.xls** → `Capital Structure Details` (38×10) | Debt detail by instrument | Latest as-reported **Nov-09-2026** | — | **High** |
| **Financials_Quarterly.xls** → `Ratios` (161×43) | Ratios | Jun-30-2016 → Sep-30-2026 | — | High |
| **Financials_Quarterly.xls** → `Supplemental` (35×43) | Supplemental (capex) | Jun-30-2016 → Sep-30-2026 | — | High |
| **Financials_Quarterly.xls** → `Segments` (72×43) | Segment / geographic revenue | Quarterly to Sep-30-2026 | — | Medium |
| **Financials_Quarterly.xls** → `Industry Specific` (15×6) | Industry metrics | Sparse (20 cells) | — | Low |
| **Financials_Quarterly.xls** → `Pension OPEB` (15×6) | Pension / OPEB | Sparse (20 cells) | — | Low |
| **EstimatesReport.xls** → `Consensus` (604×123) | Consensus / estimate export | Current FY end **Mar-31-2027**; FQ3-27 release Feb-09-2027; target price + LT growth | — | **High** |
| **EstimatesReport.xls** → `Guidance` (198×117) | Company guidance history | To FY2027 | — | **High** |
| **EstimatesReport.xls** → `Multiples` (34×7) | Forward multiples export | **NTM, FY2027–FY2034, CY2026–CY2033** (US GAAP, dilution: basic) | — | **High** |
| **EstimatesReport.xls** → `Trends` (303×21) | Estimate trends | To FY2027+ | — | High |
| **EstimatesReport.xls** → `Revisions` (467×21) | Estimate revisions breadth | Last-month FY2027 | — | High |
| **EstimatesReport.xls** → `Recent Changes` (265×10) | Broker estimate changes | Recent, to Nov-2026 | — | Medium |
| **EstimatesReport.xls** → `Surprise` (311×113) | Beat/miss history | FY2022 → FY2026 | — | Medium |
| **Company Comparable Analysis.xls** → `Financial Data` (50×17) | Peer comps + **current price** | **As-Of Date: 2026-11-19**; LTM filing date 2026-11-09 | — | **High** |
| **Company Comparable Analysis.xls** → `Trading Multiples` (50×9) | Peer / comps export | As-Of **2026-11-19**; 10 peers + subject, LTM & NTM | — | **High** |
| **Company Comparable Analysis.xls** → `Implied Valuation` (69×9) | Comps-implied valuation | As-Of **2026-11-19**; EV→equity→per-share bridge | — | **High** |
| **Company Comparable Analysis.xls** → `Operating Statistics` (50×13) | Peer operating stats | As-Of 2026-11-19 | — | High |
| **Company Comparable Analysis.xls** → `Business Description` (44×3) | Peer descriptions | As-Of 2026-11-19 | — | Medium |
| **Company Comparable Analysis.xls** → `Credit Health Panel` (48×10) | Peer credit health | As-Of 2026-11-19 | — | Medium |
| **Company Comparable Analysis.xls** → `Valuation Chart` (32×2) | Chart stub (11 cells) | As-Of 2026-11-19 | — | Low |
| **Company Comparable Analysis.xls** → `Disclaimer` (26×1) | Disclaimer | — | — | Low |
| **Credit Health Panel.xls** → `Summary` (46×11) | Credit health | Latest panel | — | Medium |
| **Credit Health Panel.xls** → `Financials` (40×13) | Credit financials | Latest panel | — | Medium |
| **Credit Health Panel.xls** → `Operational Metrics Charts` (21×19) | Chart stub (13 cells) | — | — | Low |
| **Credit Health Panel.xls** → `Solvency Metrics Charts` (18×19) | Chart stub (8 cells) | — | — | Low |
| **Credit Health Panel.xls** → `Liquidity Metrics Charts` (15×19) | Chart stub (6 cells) | — | — | Low |
| **Credit Health Panel.xls** → `Disclaimer` (26×1) | Disclaimer | — | — | Low |
| **Short_Interest_Charting Excel Export Nov-19-2026.xls** → `Chart 1 with Data` (284×2) | Positioning / short interest | Series to **Nov-19-2026** | — | Medium |
| **Short_Interest_Charting ….xls** → `Attributions` (45×1) | Attribution notes | Nov-19-2026 | — | Low |
| **Public Ownership Insider Trading.xls** → `Insider Trading` (5058×11) | Ownership / insider trades | Full history to **Oct-05-2026** | — | Medium |
| **Public Ownership History.xls** → `History` (1835×6) | Institutional ownership | Quarterly to **Sep-30-2026** | — | Medium |
| **Board Members.xls** → `Board Members` (28×25) | Governance | Current roster | — | Low |
| **Professionals.xls** → `Professionals` (24×24) | Management roster | Current | — | Low |
| **Auditors.xls** → `Auditors` (75×6) | Auditor history | Historical | — | Low |
| **Customers.xls** → `Customers` (30×8) | Customer relationships | Recently disclosed, to Sep-2026 | — | Low |
| **Suppliers.xls** → `Suppliers` (28×8) | Supplier relationships | Latest **Sep-30-2026** | — | Low |
| **Strategic Alliances.xls** → `Strategic Alliances` (22×7) | Alliances | Latest **Apr-15-2025** | — | Low |
| **Investment Analysis Direct Investments.xls** → `Direct Investments` (173×21) | Investments / M&A history | From **Jan-08-2008** | — | Low |
| **Investment Analysis Co Investors.xls** → `Co-Investors` (90×3) | Co-investors | Historical | — | Low |
| **Events Calendar.xls** → `Events Calendar` (16×3) | Catalyst calendar | Latest entry **Nov-06-2026** | — | Medium |
| **Take-Two_Interactive_Software_Inc_-_Form_DEF_14A(Jul-27-2026).xls** → `No Data` (4×4, 1 cell) | Proxy export — **empty stub** | Filing dated **Jul-27-2026**; literal content: *"This filing has no tabular data to export."* | — | Low |
| **Alphabet Inc NasdaqGS GOOGL Key Developments.xls** → `Key Developments` (520×7) | **Off-subject file** — entity is `Alphabet Inc`, not TTWO | Events to **Nov-18-2026** | — | **Low / not TTWO** |

**Two inventory notes that are not failures but must be visible:**
1. The **DEF 14A export is a successfully-extracted empty stub** (`status: ok`, 1 populated cell, literal text *"This filing has no tabular data to export."*). It is not an extraction failure and not a Drive pointer stub — the proxy simply carried no tabular data for this CIQ export. The proxy's substance is not needed for valuation (governance read belongs to the management-governance module, which ran and has its own proxy evidence).
2. The **Alphabet / GOOGL Key Developments workbook is mis-filed into this pool** (manifest `entities` resolves it to `Alphabet Inc`). It is listed for completeness and carries no weight in any TTWO valuation input.

---

## 1A. Jurisdiction & Reporting Regime

| Item | Detected Value | Evidence |
|---|---|---|
| Primary listing country / exchange | **United States — NasdaqGS, ticker TTWO**; incorporated in Delaware; HQ 110 West 44th Street, New York | FY26 10-K, cover page (Commission file 001-34003; "Delaware"); `Capital IQ Comps → Trading Multiples` header "NasdaqGS:TTWO", as of 2026-11-19 |
| Filing regime (US SEC / India SEBI-LODR / UK / Other) | **US SEC** — domestic filer: Form 10-K annual, Form 10-Q quarterly, DEF 14A proxy. No local-equivalent substitution needed | FY26 10-K cover ("FORM 10-K … Pursuant to Section 13 or 15(d)"); Q2 FY27 10-Q cover |
| Reporting standard (US GAAP / IFRS / Ind AS) | **US GAAP** | `Capital IQ Estimates → Multiples`, header "Acctg. Standard: US GAAP"; `Capital IQ Estimates → Consensus`, same header line |
| Reporting currency (and scale) | **USD**; CIQ exports in USD millions ("Currency: Reported Currency; Units: S; In Millions; USD"); `ciq_facts.json` `currency: "USD"` | `Financials_Annual → Income Statement` units line; `ciq_facts.json` |
| Fiscal-year end | **31 March.** FY2026 = year ended Mar-31-2026; current fiscal year FY2027 ends **Mar-31-2027**. A "FY27" figure is therefore an Apr-2026→Mar-2027 year, NOT a calendar year — do not read FY and CY columns interchangeably | FY26 10-K cover ("fiscal year ended March 31, 2026"); `Estimates → Multiples` header "Current Fiscal Year End: Mar-31-2027" (which also prints separate FY and CY multiple rows) |
| Document language(s) | **English** for all 30 sources. No non-English document in this pool, so no translation step and no language-related gap arises | All extracts read in English |
| Interim reporting basis (§27) | **Standalone quarter** (US 10-Q). Next interim filing = FQ3 FY27, earnings release dated **Feb-09-2027** per the consensus export. Vendor "next quarter" estimates are already on the standalone basis the company files — no cumulative-stub restatement needed here | Q2 FY27 10-Q ("quarterly period ended September 30, 2026"); `Estimates → Consensus` header "FQ3 2027 Earnings Release Date: Feb-09-2027" |

This is a US / US-GAAP / USD issuer, so the module's US form names (10-K, 10-Q, DEF 14A) are the actual local documents. No US form is marked "missing" on a jurisdiction technicality.

---

## 2. Most Recent Sources

Age in months is measured from the **period-end parsed inside the document** to the run date 2026-11-20.

| Source Type | Filename | Period / As-of | Age (months) |
|---|---|---|---|
| Annual filing | `10K_2025_26_0001628280-26-037434.pdf` | FY ended Mar-31-2026 | ~7.7 |
| Quarterly filing | `10Q_2Q_0001628280-26-072254.pdf` | Quarter ended Sep-30-2026 | ~1.7 |
| Capital structure / balance sheet | `Financials_Quarterly.xls → Balance Sheet` / `Capital Structure Summary` / `Capital Structure Details` (latest as-reported Nov-09-2026); filing source = Q2 FY27 10-Q | Sep-30-2026 | ~1.7 |
| Consensus / estimate export | `EstimatesReport.xls → Consensus` (+ `Guidance`, `Trends`, `Revisions`) | Current FY end Mar-31-2027; FY2027–FY2034 estimates live | ~0 (current) |
| Multiples export | `Financials_Quarterly.xls → Multiples` and `Financials_Annual.xls → Multiples`; forward set in `EstimatesReport.xls → Multiples` | Quarterly closes 2017-03-31 → latest close 2026-11-18 (39 historical + current) | ~0.1 |
| Peer / comps export | `Company Comparable Analysis.xls → Trading Multiples` / `Financial Data` / `Implied Valuation` | As-Of Date 2026-11-19 | ~0.03 (1 day) |
| Current price (IBKR / Capital IQ) | `Company Comparable Analysis.xls → Financial Data`, "Day Close Price Latest" = **USD 216.61** | As-of **2026-11-19** | ~0.03 (1 day) |
| Cash flow statement | `Financials_Quarterly.xls → Cash Flow` (LTM Sep-30-2026); filing source = Q2 FY27 10-Q; annual in `Financials_Annual.xls → Cash Flow` | Sep-30-2026 (LTM) / FY Mar-31-2026 | ~1.7 |
| Segment data | `Financials_Annual.xls → Segments`; FY26 10-K Note 21 | Mar-31-2026 — **one operating and reportable segment**; geography split available (US 59% / International 41%) | ~7.7 |

---

## 3. Valuation Usability Check

| Requirement | Available? (Y/N) | Source | Why It Matters |
|---|---|---|---|
| Current price | **Y** — USD **216.61**, as-of 2026-11-19, **pool-verified and fresh** (1 calendar day before the run date; well inside the 5-trading-day staleness line, so no staleness cap) | `Capital IQ Comps → Financial Data`, "Day Close Price Latest", As-Of 2026-11-19; corroborated by `ciq_facts.json → current_price` = 216.61 | Anchor for market cap, EV, multiples, margin of safety |
| Diluted share count | **Y** — cover-page count **187,213,488** shares outstanding net of treasury as of Oct-26-2026; CIQ "Shares Outstanding Latest" 187.2m as-of 2026-11-19 (the two tie). Note: diluted = basic in the loss-making trailing periods (basic and diluted loss per share are printed as one line) | Q2 FY27 10-Q, cover page; `Capital IQ Comps → Financial Data`; `ciq_facts.json → shares_outstanding_m` = 187.2 | Needed for market cap and per-share fair value |
| Dilution data (options/RSUs/convertibles) | **Y** — RSU issuance/forfeiture and net-share-settlement lines in the equity statement and cash flow; **2026 Convertible Notes** with only **USD 29.4m** principal outstanding at Mar-31-2026, maturing **Dec-15-2026**, no regular interest, no accretion. Caveat: CIQ multiples/estimates tabs are on a **"Dilution: Basic"** basis — a labelled basis difference `01` must reconcile | FY26 10-K, Convertible Notes note; Q2 FY27 10-Q, statements of stockholders' equity and cash flows; `Estimates → Multiples` and `Financials → Multiples` headers ("Dilution: Basic") | Needed for fully diluted per-share fair value |
| Business type track (Operating / Financial / REIT / Commodity / Holding co.) | **Y — OPERATING company** (interactive-entertainment publisher), **single operating and reportable segment**. Not a financial, REIT, commodity or holding company. Per the Business-Type Method Map: FCFF DCF + reverse-DCF as intrinsic, EV/EBITDA, EV/EBIT, P/E, FCF yield as multiples | FY26 10-K: *"We have one operating and reportable segment. See Note 21"*; `ciq_facts.json → segments_revenue`: "Sale of Software Titles 6,656 (100%)" | Determines which valuation methods are valid |
| Total debt, cash, minority/preferred | **Y** — total debt 2,911.4m and net debt 1,237.8m on the CIQ vendor basis at Sep-30-2026; cash & ST investments 1,673.6m; **preferred equity and minority interest both nil**. Dated maturity ladder available (2026: 30; 2027: 600; 2028: 800; 2029: 300; 2032: 500; 2034: 300; nearest 2026-12-15; all fixed-rate) | `ciq_facts.json → total_debt_m / net_debt_m / debt_maturity_wall`; `Capital IQ Comps → Implied Valuation` bridge rows; `Financials_Quarterly → Capital Structure Details` | Needed for the enterprise-value bridge |
| Income statement (LTM or FY) | **Y** — LTM to Sep-30-2026: revenue 6,409.7m, EBITDA 724.9m, **EBIT −112.5m**, **diluted EPS −1.29**; FY2026 (Mar-31-2026): revenue 6,656m, EBITDA 788m. Annual series FY2017→FY2026 and quarterly series Jun-2016→Sep-2026 both complete | `ciq_facts.json → ltm_ebitda_m / multi_year_trajectory`; `Capital IQ Comps → Financial Data`; `Financials_Annual/Quarterly → Income Statement` | Earnings/EBITDA base for multiples and DCF |
| Cash flow statement | **Y** — LTM cash from operations 367.1m; CIQ "Levered Free Cash Flow" 787.6m is an **after-interest vendor definition, NOT the §15 `CFO − capex` FCF** and must be rebuilt, not quoted. Capex available in the Supplemental tabs and in the 10-K/10-Q cash flow statements | `ciq_facts.json → ltm_ocf_m / levered_fcf_m` (whose own source_ref carries that warning); `Financials_Quarterly → Cash Flow`; Q2 FY27 10-Q cash flow statement | FCF base for DCF and FCF yield |
| Forward estimates (consensus) | **Y** — 29 analyst target prices (mean USD 283.93 / median 289.00, high/low 330.00/170.00, s.d. 26.18); recommendation Buy (1.21); NTM EPS 9.61 and NTM EBITDA 2,349.1m; forward multiple grid NTM and FY2027→FY2034 / CY2026→CY2033; revisions breadth FY27 EPS 9↑/2↓ vs revenue 6↑/9↓ last month | `Estimates → Consensus`; `Estimates → Multiples`; `Capital IQ Comps → Implied Valuation`; `ciq_facts.json → consensus_view / eps_revisions / revenue_revisions` | NTM/FY multiples and DCF near-term path |
| Historical multiple data | **Y** — 39 historical quarterly closes plus the current close (2017-03-31 → 2026-11-18) across TEV/Revenue, TEV/EBITDA, TEV/EBIT, P/E, P/BV, with Average/High/Low/Close per quarter. Current TEV/LTM EBITDA 52.2x sits at the 74th percentile of a 17.5–94.4x range (median 38.0x) | `Financials_Quarterly → Multiples`; `Financials_Annual → Multiples`; `ciq_facts.json → ev_ebitda_current_x / ev_ebitda_percentile / range_position` | Own-history re-rating read |
| Peer / comps data | **Y** — 10 named peers with LTM and NTM multiples as-of 2026-11-19: Roblox, Electronic Arts, Playtika, Nintendo, PLAYSTUDIOS, 37 Interactive, NEXON, Ubisoft, Konami, tinyBuild. Peer TEV/EBITDA median 13.0x (high 16.7 / low 4.0); NTM TEV/EBITDA median 9.96x; NTM P/E median 21.17x. **Caveat: the Electronic Arts row is entirely blank (all dashes)** — the single closest comparable contributes no multiple | `Capital IQ Comps → Trading Multiples`, As-Of 2026-11-19; `ciq_facts.json → peer_ev_ebitda` | Relative valuation and SOTP segment multiples |
| Segment-level revenue & EBIT | **Partial → N for EBIT.** Revenue disaggregation exists (one reportable segment = 100% "Sale of Software Titles"; geography US 3,940m / International 2,716m for FY2026), but there is **no segment-level EBIT** because the company discloses **one** segment. This is a disclosure fact, not an extraction gap | FY26 10-K, Note 21 and Item 1; `Financials_Annual → Segments`; `ciq_facts.json → segments_revenue / geographic` | Sum-of-the-parts |
| Dividend / buyback data | **Y** — **no dividend ever paid** and none expected ("We have never declared or paid cash dividends … We do not expect to declare or pay any cash dividends in the foreseeable future"); a share-repurchase programme exists, with 11.7m shares repurchased under it as of Sep-30-2026 and 10.0m remaining authorised | FY26 10-K, "Dividend Policy"; Q2 FY27 10-Q, repurchase-programme disclosure | Shareholder-yield read |

---

## 4. Cross-Module Availability

All four upstream modules completed in this run root (`analyses/TTWO_2026-11-19/`), checked against the actual filesystem.

| Cross-Module Output | Available? (Y/N) |
|---|---|
| `business-model/03_segment-map.md` | **Y** |
| `business-model/08_competitive-map.md` | **Y** |
| `business-model/07_business-quality.md` | **Y** |
| `business-model/09_moat.md` | **Y** |
| `business-model/10_external-dependency.md` | **Y** |
| `earnings/01_historical-financials.md` | **Y** |
| `earnings/04_guidance-consensus.md` | **Y** |
| `earnings/03_margin-drivers.md` | **Y** |
| `earnings/07_earnings-sensitivity.md` | **Y** |
| `earnings/06_earnings-quality.md` | **Y** |

Also present and directly load-bearing for this module (Cross-Module Inputs section of `MODULE_RULES.md`):

| Additional cross-module output | Available? | What it binds |
|---|---|---|
| `balance-sheet-survival/01_capital-structure-and-leverage.md` | **Y** | **Canonical net debt.** It reports gross borrowings 2,519.8m less cash 1,149.4m = **net debt 1,370.4m on the strict §15 basis**. The CIQ vendor figure is 1,237.8m (and CIQ total debt 2,911.4m includes leases). Per the Anchor-consistency gate, `01_price-and-capital-structure` must adopt the **filing-based 1,370.4m strict** figure as canonical, show the vendor figure beside it, and explain the gap (lease inclusion and investment netting) — not silently substitute either one. |
| `balance-sheet-survival/99_balance-sheet-survival-synthesis.md` | **Y** | Solvency verdict **"Adequate"** — **no distress cap** on the headline (CLAUDE.md §18). |
| `management-governance/04_ownership-and-insider-behavior.md` and `99_management-governance-synthesis.md` | **Y** | **RF-OWN-004 (structurally unaligned controlling owner, §24 Filter 6) = N — NOT fired** (recorded verbatim in the synthesis cap table). The §24 Filter 6 value-trap cap on valuation attractiveness therefore **does not bind**. The governance verdict is nonetheless *"Misaligned or weak stewardship"* with no hard disqualifier — a qualifier the valuation agents must carry, not drop. |

---

## 5. Partial-Data Flags

| Missing Data | Applies? (Y/N) | Affected Agents | Cap Applied |
|---|---|---|---|
| No current price | **N** — USD 216.61 as-of 2026-11-19 is pool-verified and 1 day old | 01, 05, 07, 99 | **None.** Price-state = `pool-verified`, fresh. Margin of safety and downside-to-bear both unlock; no staleness cap (as-of is inside 5 trading days) |
| No consensus / forward estimates | **N** — 29-estimate consensus, NTM and FY2027–FY2034 grid | 02, 03, 04, 05 | None |
| No peer data | **N** — 10 peers with LTM and NTM multiples as-of 2026-11-19 | 03, 06 | None. (The blank Electronic Arts row is a named weakness inside a present peer set, not an absent peer set — `03` must say so rather than treat the median as unaffected) |
| No segment-level data | **N for the data, Y for the consequence** — revenue and geography are disclosed; segment EBIT does not exist because there is **one** reportable segment | 06 | **SOTP not possible — but as a single-segment structure, not a data gap.** Per the Segment/SOTP rule, `06` returns *"single-segment — SOTP collapses to the consolidated read"*. The Score-Cap row "SOTP not possible **for a multi-segment business** → usefulness max 80" does **NOT** bind, because TTWO is not multi-segment |
| No balance sheet / capital structure | **N** — balance sheet to Sep-30-2026, dated maturity ladder, nil preferred and nil minority | 01, 04, 06 | None |
| No cash flow statement | **N** — annual FY2017→FY2026 and quarterly to Sep-30-2026 plus LTM | 04 | None |

**Additional conditions that are not in the six-row table but WILL shape the module — flagged here so no downstream agent discovers them late:**

- **The trailing earnings base is negative, so trailing earnings multiples are unusable.** LTM EBIT is **−112.5m** and LTM diluted EPS is **−1.29**, which is why the comps export prints TTWO's LTM TEV/EBIT and LTM P/E as "NM" (not meaningful). All earnings-multiple work (`02`, `03`) must run on a **forward (NTM / FY27+)** basis, with the period basis labelled on every figure; a trailing P/E or EV/EBIT for TTWO cannot be computed at all, let alone compared to a peer median. Revenue and EBITDA multiples remain computable on both bases.
- **Sector-level multiple history is not in this pool.** The peer workbook carries only current (2026-11-19) peer multiples — no peer-group or sector-index multiple history 3–5 years back. The company's **own** 10-year multiple history IS present, so `02` can inspect its own window, but neither `02` nor `03` can source the sector's own re-rating over that window from the pool. Per the Score-Cap table this is **no cap by itself** (an honestly-absent check is not a defect), but `02`/`03` must write *"Not assessable — no sector-level multiple history"* rather than assume the anchor is stable, and `99` must record the gap in its Reconciliation so it is visible rather than silently skipped.
- **Numeric reading check absent (see header).** Every workbook-cell figure in this module is mechanically unverified. Any value-determining amount must be checked against the original source inside this frozen capability before it carries a fair-value conclusion.
- **Two basis traps already visible in the pool:** (a) CIQ "Levered Free Cash Flow" 787.6m is after interest and is **not** §15 FCF — `04` must rebuild `CFO − capex` from the filings; (b) CIQ multiples and estimates tabs are on a **"Dilution: Basic"** basis while per-share fair value must use a fully diluted count — `01` states both once and every agent reuses them.

---

## 6A. Method Readiness Matrix

| Method | Ready? (Y/N) | Blocking Missing Inputs | Notes |
|---|---|---|---|
| Own-history multiples (`02`) | **Y** | None for revenue/EBITDA. Trailing P/E and EV/EBIT are structurally NM (negative LTM EBIT/EPS) | 39 historical quarterly closes + current, 2017-03-31 → 2026-11-18. Current TEV/LTM EBITDA 52.2x = 74th percentile of 17.5–94.4x (median 38.0x). Must carry the LTM-vs-NTM basis label on any multiple lifted from this band, and must write "Not assessable" on the sector-cycle check |
| Peer relative valuation (`03`) | **Y** | None. Weakness, not a blocker: the Electronic Arts row is blank | 10 peers, As-Of 2026-11-19. Peer TEV/EBITDA median 13.0x vs TTWO 52.2x; NTM TEV/EBITDA median 9.96x vs TTWO 17.79x; NTM P/E median 21.17x vs TTWO 22.54x. The comps workbook's own `Implied Valuation` tab already publishes a peer-implied per-share bridge to reconcile against |
| Intrinsic DCF — Operating FCFF (`04`) | **Y** | None | Income statement, cash flow and balance sheet all present on both annual and quarterly bases; capex in the Supplemental tabs and the filings. §15 FCF must be rebuilt as `CFO − capex` (LTM CFO 367.1m), not taken from the vendor's levered-FCF line. Cost-of-Capital Reality Test is runnable: search the 10-K for a disclosed impairment / lease / pension discount rate and prove scope before using one |
| Reverse DCF (`05`) | **Y** | None — requires `04`'s WACC and normalised FCF base, and a pool-verified price, which exists (216.61) | Must invert `04`'s own model, not re-derive an independent WACC. With LTM EBIT negative and NTM EBITDA 2,349.1m, the "what's priced in" read turns on the forward ramp, and the reverse-DCF is the main defence against a reverse-engineered discount rate |
| SOTP (`06`) | **N** | Segment EBIT does not exist — **one** operating and reportable segment (FY26 10-K Note 21) | Not a data gap and not a guessing opportunity. `06` returns the single-segment note ("SOTP collapses to the consolidated read"); it must not manufacture a breakup from the US/International geography split, which has no segment EBIT behind it |

---

## 6. Sufficiency Verdict

- **Verdict:** **Sufficient**
- **Reason:** A complete earnings and cash-flow base (income statement and cash flow, annual FY2017–FY2026 and quarterly through Sep-30-2026), full capital-structure data (balance sheet, dated maturity ladder, nil preferred and nil minority), forward-looking and relative inputs (a 29-estimate consensus with an NTM/FY2027–FY2034 multiple grid, plus a 10-peer comps export), and a pool-verified current price of USD 216.61 as-of 2026-11-19 are all present, with zero extraction failures across 30 sources and 62 tabs.
- **Methods that can run:** own-history multiples (`02`), peer relative valuation (`03`), intrinsic FCFF DCF (`04`), reverse-DCF (`05`). **Four** of the five methods — comfortably above the two-method triangulation bar. SOTP (`06`) cannot run, because the company discloses one reportable segment.
- **Active partial-data caps:** none of the six partial-data rows fires, so no partial-data cap binds. Three verdict-adjacent caps are explicitly tested and recorded as **not binding**: the no-price cap (price is pool-verified and 1 day old), the price-staleness cap (as-of is inside 5 trading days), and the §24 Filter 6 unaligned-owner cap (RF-OWN-004 = N in `management-governance/99`). The "SOTP not possible" usefulness cap does not bind either, because it is written for a multi-segment business and TTWO is single-segment.
- **Critical missing items:** none that blocks a method. Four conditions must nonetheless travel forward with every downstream read, and the first two are the ones most likely to produce a wrong number: (1) **trailing earnings multiples are structurally unusable** — LTM EBIT −112.5m and LTM diluted EPS −1.29 make LTM P/E and EV/EBIT not meaningful, so the earnings-multiple work must be forward-based with the period basis labelled every time; (2) **the numeric reading check is absent from this generation**, so every workbook-cell figure is mechanically unverified and any value-determining amount needs a source check inside the frozen capability; (3) **no sector-level multiple history exists in the pool**, so the Sector Cycle Reality Test is "Not assessable" for both `02` and `03` and must be recorded as a named gap rather than assumed stable; (4) **the canonical net-debt figure is the filing-based strict 1,370.4m** from `balance-sheet-survival/01`, not the CIQ vendor 1,237.8m — `01` adopts the former, shows the latter beside it, and explains the lease / investment-netting gap.



---

## valuation / 01_price-and-capital-structure.md

_Source: `01_price-and-capital-structure.md`_

# Price & Capital Structure — TTWO

**Company:** Take-Two Interactive Software, Inc. (NasdaqGS:TTWO) · **Run date:** 2026-11-20
**Reporting standard:** US GAAP · **Reporting currency:** USD, in millions unless stated · **Fiscal year ends 31 March** (so "FY2026" = year ended 2026-03-31; the latest balance sheet is the quarter ended **2026-09-30**, which is Q2 of FY2027). Jurisdiction: US SEC domestic filer — Form 10-K, Form 10-Q, DEF 14A are the actual local documents [`FY26 10-K, cover page`; `Q2 FY27 10-Q, cover page`].

**Source-check status carried forward: UNCHECKED, not verified clean.** This frozen generation carries **no `numeric_reading_check`** object at any source or sheet level, and `GENERATION_ROOT/corpus.txt` carries no labelled extractor reading-warning annotation. There is therefore no literal warning token, no source/extract reference and no LF-line/column span to quarantine, and **no amount below is marked not-proven on that basis** — but a missing check means **unchecked, not clean**, so every workbook-cell figure is mechanically unverified by the pattern check. The duty that transfers: **every anchor number in this report was read directly from the frozen extract of the document that reports it.** Filing figures come from `10Q_2Q_0001628280-26-072254` (Q2 FY27 10-Q), `10K_2025_26_0001628280-26-037434` (FY26 10-K) and `TTWO 2Q27 Earnings Release FINAL` (2026-11-09); Capital IQ workbook tabs are used only as a vendor read to reconcile against, never as the authority for a filing's own number (CLAUDE.md §5). Every restating layer must carry this qualifier forward.

**Cross-module inputs used.** `balance-sheet-survival/01_capital-structure-and-leverage.md` (present in this run root) supplies the **canonical, filing-debt-note-based** gross-debt and net-debt figures adopted below. `earnings/01_historical-financials.md` (present) is used as an independent cross-check on net debt and share count. `00_valuation-data-triage.md` supplies the inventory, the jurisdiction read and the active caps.

---

## 1. Current Price

| Field | Value | Source | As-of Date |
|---|---|---|---|
| **Decision line** (ticker · venue · currency) | **NasdaqGS:TTWO · NASDAQ Global Select Market · USD** — Common Stock, $0.01 par value | `FY26 10-K, cover page`, "Securities registered pursuant to Section 12(b)": Common Stock $0.01 par / trading symbol TTWO / NASDAQ Global Select Market; "Securities registered pursuant to Section 12(g): None" | 2026-03-31 (registration), unchanged at `Q2 FY27 10-Q, cover page` |
| Current price | **USD 216.61** | `Capital IQ Comps → Financial Data`, subject row, "Day Close Price Latest"; pinned by `ciq_facts.json → current_price` = 216.61 | **2026-11-19** (export "As-Of Date: 2026-11-19") |
| Currency | **USD** | `Capital IQ Comps → Financial Data`, "Currency: US Dollar"; `ciq_facts.json → currency` = USD | 2026-11-19 |
| Price basis | **Last close** ("Day Close Price Latest"), not an intraday or indicative quote | `Capital IQ Comps → Financial Data` | 2026-11-19 |

**Single listed line — no cross-line issue.** The 10-K cover page registers exactly one class of security under Section 12(b) (Common Stock, $0.01 par, symbol TTWO, NASDAQ Global Select Market) and states "Securities registered pursuant to Section 12(g) of the Act: None" [`FY26 10-K, cover page`; identical at `FY25 10-K, cover page` and `Q2 FY27 10-Q, cover page`]. No second share class, no dual listing, no ADR or GDR line appears anywhere in this pool. So there is no premium/discount table to build, no FX date or rate to carry, and no ADR ratio to apply: every fair value, margin of safety and downside figure produced downstream belongs to **NasdaqGS:TTWO in USD**, the line a reader can actually buy.

**Second, independent pool read of the same price — they agree to 0.01%.** `Capital IQ Financials_Quarterly → Multiples` carries a separate current column dated **2026-11-18** with P/BV close of **11.038053**. Book value per share at 2026-09-30 is 3,673.6 ÷ 187.213488 = **19.6225**, so that column implies a price of 11.038053 × 19.6225 = **USD 216.59** — against the comps export's 216.61, a gap of 2 cents (0.01%). Two different workbooks in the pool therefore pin the same close. This also tells us what the "as-of 2026-11-19" label means in practice: it is the last close on or about **2026-11-18/19**, pulled on 2026-11-19.

**Price staleness — quantitative.** Age = run date 2026-11-20 − quote as-of 2026-11-19 = **1 calendar day ≈ 1 trading day**. That is well inside the 5-trading-day line, so the **staleness Score-Cap does not bind** and no refresh is required. Refresh attempt, stated for the record: the pool was checked for a fresher quote — the latest price-bearing columns in the pool are the comps export (2026-11-19) and the multiples current column (2026-11-18), and the short-interest export runs to 2026-11-19; **there is no fresher pool or user-provided quote**, and a web quote is neither needed nor permitted here because a pool source covers the same fact (MODULE_RULES Source Hierarchy, special rule for current price).

**One drift risk downstream must carry, which is not a staleness cap.** The anchor's as-of date (2026-11-19) is **the Grand Theft Auto VI release date itself** — "Rockstar Games will release Grand Theft Auto VI on November 19, 2026" [`Q2 FY27 10-Q, Item 1A Risk Factors` and `Item 2 MD&A`]. The paired multiples column is dated 2026-11-18, the day before. So the anchor is an at-or-just-before-launch close and contains **no post-launch trading**. For a company whose own filings say "Grand Theft Auto product releases may affect our financial performance on a quarterly and annual basis" [same source], that is a real reason the live price may have moved since. It is recorded as a dated-evidence limitation, not a reason to downgrade the price-state: the price **is** from the pool, it **is** one trading day old, and it stays `pool-verified`.

---

## 2. Share Count

| Field | Value | Source |
|---|---:|---|
| Basic shares outstanding (as-of 2026-10-26) | **187,213,488** (187.2m) | `Q2 FY27 10-Q, cover page`: "As of October 26, 2026, there were 187,213,488 shares of the Registrant's Common Stock outstanding, net of treasury stock" |
| Shares issued / treasury / outstanding at 2026-09-30 | 210.9 issued − 23.7 treasury = **187.2 outstanding** | `Q2 FY27 10-Q, Condensed Consolidated Balance Sheets` (common stock line and treasury-stock line) |
| Diluted weighted-average shares, Q2 FY27 (3 months to 2026-09-30) | **187.1** — basic *and* diluted are the same line, because the period is a net loss | `Q2 FY27 10-Q, Note 11 (Loss per Share)`: "Weighted average shares outstanding—basic 187.1 … Basic and diluted loss per share $(0.29)" |
| Diluted weighted-average shares, H1 FY27 (6 months to 2026-09-30) | **186.7** (same basic = diluted reason) | `Q2 FY27 10-Q, Note 11 (Loss per Share)` |
| Diluted weighted-average shares, FY2026 | **183.9** (basic = diluted; net loss year) | `FY26 10-K, Note 12 (Loss per Share)` |
| Options / RSU **dilutive increment** excluded as antidilutive, H1 FY27 | **1.1** from share-based awards | `Q2 FY27 10-Q, Note 11`: "For the six months ended September 30, 2026, we had 1.1 potentially dilutive shares from share-based awards … excluded due to the net loss for the period" (0.8 for the three months) |
| Convertibles / potential shares, H1 FY27 | **0.1** from the 2026 Convertible Notes | `Q2 FY27 10-Q, Note 11`, same sentence |
| **Unvested RSUs outstanding (the full overhang, not the dilutive increment)** | **8.1 at 2026-03-31** = 2.9 time-based + 1.1 market-based + 4.1 performance-based. Roll-forward to 2026-09-30: 8.1 + 1.9 granted − 1.6 vested − 0.2 forfeited = **8.2 (engine-computed)** | `FY26 10-K, Note 16 (Stock-Based Compensation)` — three separate non-vested RSU activity tables, each captioned "presented at 100% of target number of shares that may potentially vest"; H1 FY27 activity from `Q2 FY27 10-Q, Note 11` |
| Stock options outstanding | **None.** The phrase "stock options outstanding" appears zero times in this pool; the equity plans grant restricted stock units, not options (Black-Scholes is used only for ESPP purchase rights) | Direct read of `FY26 10-K, Note 16 (Stock-Based Compensation)`; corpus string count = 0 |
| ESPP capacity (authorised, not outstanding) | 9.0 shares may be issued under the 2017 Global ESPP; **~7.2 remained available** at 2026-03-31 | `FY26 10-K, Note 16 — Employee Stock Purchase Plans` |
| **Fully diluted shares — company-disclosed** | **188.0** | `TTWO 2Q27 Earnings Release FINAL, 2026-11-09`: "Share count used to calculate management reporting diluted net income per share is 188.0 million" |
| **Fully diluted shares — engine TSM / if-converted build (cross-check)** | **188.4** = 187.213488 cover-page + 1.1 share-based-award increment + 0.1 convertible | My arithmetic from the two filing sources in the rows above |
| **Share count used for market cap** | **187.213488** (187.2m) | `Q2 FY27 10-Q, cover page`, as-of 2026-10-26 — the most recent point-in-time "as of" count, per Fully Diluted Equity Rule 1. Independently confirmed by `CIQ Financials_Quarterly → Historical Capitalization`, "Shares Out." = 187.213488 at pricing date 2026-11-09, and by `ciq_facts.json → shares_outstanding_m` = 187.2 |
| **Share count used for per-share fair value** | **188.0** | The company's **own disclosed diluted count** for its management-reporting diluted EPS [`TTWO 2Q27 Earnings Release, 2026-11-09`]. Chosen over the engine's 188.4 build because it is disclosed rather than derived, and it is struck on a **profitable** earnings basis — which is the basis every forward per-share fair value downstream will use. The two differ by 0.4 shares (0.2%) |

### Share Count Reconciliation Table

| Step | Shares (m) | Basis |
|---|---:|---|
| Basic shares outstanding, net of treasury (2026-10-26) | 187.2 | `Q2 FY27 10-Q, cover page` |
| + Options/RSU dilutive increment (treasury-stock method, as computed by the company) | +1.1 | `Q2 FY27 10-Q, Note 11` (H1 FY27, excluded only because the period was a loss) |
| + Convertible notes, if-converted | +0.1 | `Q2 FY27 10-Q, Note 11` |
| **= Fully diluted shares (engine build)** | **188.4** | My arithmetic |
| *= Fully diluted shares (company-disclosed; CANONICAL for per-share fair value)* | **188.0** | `TTWO 2Q27 Earnings Release, 2026-11-09` |
| *Memo — maximum RSU overhang if every unvested unit vested in full* | *195.4* (187.2 + 8.2 + 0.1) | Not a diluted count; an outer bound (see below) |

**Three things about the share count that must travel downstream.**

1. **Basic equals diluted in every reported trailing period, and that is a loss artefact, not an absence of dilution.** "We incurred a net loss … therefore, the diluted weighted average shares outstanding excludes the effect of unvested common stock equivalents because their effect would be antidilutive" [`Q2 FY27 10-Q, Note 11`; identically at `FY26 10-K, Note 12`]. The moment the company prints a profit — which its own FY2027 guidance of GAAP diluted EPS $0.57–0.75 contemplates [`TTWO 2Q27 Earnings Release, Outlook for Fiscal Year 2027`] — the 1.1 + 0.1 comes back in. Using the trailing "diluted" count as if it were a fully diluted count would understate shares.
2. **The gap between the dilutive increment (1.1) and the total unvested RSU overhang (8.2) is large and is explained, not hidden.** Only time-based unvested units feed the treasury-stock increment; market-based units (1.1 at 2026-03-31, vesting on relative total shareholder return against the NASDAQ 100) and performance-based units (4.1 at 2026-03-31, tied to performance metrics on certain titles) are contingently issuable and stay out of the diluted count until their conditions are met [`FY26 10-K, Note 16`]. If every unvested unit ultimately vested, the count would be ~195.4m — **4.4% above** the 187.2m used for market cap. That is an outer bound on future dilution, **not** a share count to value on; it is recorded so a reader can size the overhang.
3. **A labelled basis difference in the vendor exports.** `CIQ Financials_Quarterly → Multiples`, `CIQ Financials_Annual → Multiples`, `CIQ Financials → Historical Capitalization` and `CIQ Estimates → Multiples` all carry the header line **"Dilution: Basic"**. So every vendor multiple and every vendor forward EPS in this pool — including NTM EPS of 9.61 [`Capital IQ Comps → Financial Data`] — is struck on a **basic** share count, while per-share fair value here is struck on **188.0 fully diluted**. The two are not interchangeable; the difference is 0.4% on the per-share figure and downstream agents must state which basis they are on.

---

## 3. Market Capitalization

`Market cap = share count × current price`

> 187,213,488 shares × USD 216.61 = **USD 40,552,313,636** = **USD 40,552.3m**

Both inputs are sourced and dated: the count from `Q2 FY27 10-Q, cover page` (as-of 2026-10-26), the price from `Capital IQ Comps → Financial Data` (as-of 2026-11-19).

**Tie-out:** `Capital IQ Comps → Financial Data` independently reports "Market Capitalization Latest" for the subject row as **40,552.3** — my arithmetic reproduces the vendor's figure to the decimal, which confirms the vendor is using the same 187.213488 count and the same 216.61 price. No plug, no residual.

For reference, on the **fully diluted 188.0** count the equity value at the same price is 188.0 × 216.61 = **40,722.7m** (+0.4%). Market cap stays on the point-in-time count (40,552.3m) per Fully Diluted Equity Rule 1; the 40,722.7m figure is shown only so a reader can see the size of the dilution step.

---

## 4. Enterprise Value Bridge

All balance-sheet components as of **2026-09-30**, USD millions.

| Component | Amount | Source |
|---|---:|---|
| Market capitalization | **40,552.3** | §3 above: 187.213488 × 216.61 |
| + Total debt (short + long term) — **canonical, filing debt note, carrying value** | **+2,519.8** | 629.2 short-term debt, net + 1,890.6 long-term debt, net [`Q2 FY27 10-Q, Condensed Consolidated Balance Sheets`]; composition from `Q2 FY27 10-Q, Note 10 (Debt)`. Adopted verbatim from `balance-sheet-survival/01`, §7 Leverage Anchor Summary |
| + Minority / non-controlling interest | **+0.0 (nil)** | No non-controlling interest line exists on the balance sheet; `CIQ Financials_Quarterly → Historical Capitalization` prints "+ Total Minority Interest" as "–" for every quarter including the latest; `Capital IQ Comps → Financial Data` prints "LTM Minority Interest" as "–" for the subject row |
| + Preferred equity | **+0.0 (nil)** | "Preferred stock, $0.01 par value, 5.0 shares authorized; **no shares issued and outstanding** at September 30, 2026 and March 31, 2026" [`Q2 FY27 10-Q, Condensed Consolidated Balance Sheets`]; vendor agrees ("+ Pref. Equity" = "–") |
| + Operating lease liabilities | **not added (+0.0)** — see note below | 391.6 at 2026-09-30 (66.9 current + 324.7 non-current) [`Q2 FY27 10-Q, Condensed Consolidated Balance Sheets`] |
| + Underfunded pension / other long-term obligations | **not added (+0.0)** — see note below | `FY26 10-K, Note 14 — Employee Savings Plans`; `CIQ Financials_Annual/_Quarterly → Pension OPEB` (header-only, no defined-benefit rows) |
| − Cash & equivalents | **−1,149.4** | `Q2 FY27 10-Q, Condensed Consolidated Balance Sheets` |
| − Short-term investments | **not deducted (−0.0)** — see cash-quality note | 524.2 at 2026-09-30 [`Q2 FY27 10-Q, Note 5 (Short-Term Investments)`] |
| − Restricted cash | **not deducted (−0.0)**, and must stay out | 15.0 current + 68.0 long-term = 83.0 [`Q2 FY27 10-Q, Condensed Consolidated Balance Sheets`] |
| − Equity-method investments | **not deducted (−0.0)** | **None disclosed.** No equity-method investment line or note appears anywhere in the FY26 10-K or the Q2 FY27 10-Q; `CIQ Financials_Quarterly → Historical Capitalization` also prints "− Long Term Marketable Securities" as "–" for every quarter |
| **= Enterprise value (EV) — CANONICAL** | **= 41,922.7** | 40,552.3 + 2,519.8 + 0 + 0 − 1,149.4 = **41,922.7**. No plug, no estimated component |

### The three EV variants, each labelled — and the reconciliation to the vendor's figure

| EV basis | Value | Build |
|---|---:|---|
| **EV (canonical) — §15 strict cash, borrowings-only debt** | **41,922.7** | 40,552.3 + 2,519.8 − 1,149.4 |
| EV (broad cash) — also nets the 524.2 of liquid short-term investments | 41,398.5 | 41,922.7 − 524.2 |
| EV (lease-inclusive debt, strict cash) — the IFRS-16-equivalent debt view | 42,314.3 | 40,552.3 + 2,911.4 − 1,149.4 |
| *EV (vendor) — Capital IQ "Total Enterprise Value Latest"* | *41,790.1* | 40,552.3 + vendor net debt 1,237.8 [`Capital IQ Comps → Financial Data`, subject row, As-Of 2026-11-19] |

**The vendor EV reconciles to the canonical EV exactly, with no residual:**

> canonical 41,922.7 − short-term investments 524.2 + operating-lease liabilities 391.6 = **41,790.1** ✔

So the vendor's EV is **broad on the cash side AND lease-inclusive on the debt side** — two departures from §15 in one number. The vendor's own build confirms it: `CIQ Financials_Quarterly → Historical Capitalization` prints the latest TEV as market cap − "Cash & Short Term Investments" 1,673.6 + "Total Debt" 2,911.4. The CIQ figure is **named and shown, never silently preferred**, and it is **not** the canonical figure here.

**Canonical debt source (CLAUDE.md §4, §15; MODULE_RULES Reconciliation Gate 1).** `balance-sheet-survival/01_capital-structure-and-leverage.md` ran in this run root and designated **gross debt 2,519.8 (borrowings only, balance-sheet carrying value)** built directly from `Q2 FY27 10-Q, Note 10 (Debt)` and tied line-for-line to the balance sheet (629.2 + 1,890.6 = 2,519.8, no residual). That is the figure used above. The data-vendor aggregate this agent also holds — `ciq_facts.json → total_debt_m` = **2,911.4** [`CIQ Financials → Balance Sheet` 'Total Debt', FQ2 Sep-30-2026] — is **390–392 higher, and the gap is entirely operating-lease liabilities the company's own debt note does not classify as debt**: 2,519.8 + 391.6 = 2,911.4 exactly. Under US GAAP those leases sit on separate "Lease liabilities" lines and are outside both the debt line and the borrowings-maturity table [`Q2 FY27 10-Q, Condensed Consolidated Balance Sheets`; `FY26 10-K, Note 13 (Leases)`]. The vendor figure is retained above only as a labelled cross-check and as the lease-inclusive variant.

**Adjustments deliberately NOT made, and why.**
- **Operating leases (391.6) not added to the canonical bridge.** This is a US-GAAP issuer, so leases are not borrowings in the filing's own debt note, and the company has **no finance or capital leases at all** — the phrase "finance lease" appears zero times in the FY26 10-K [direct read, confirmed in `balance-sheet-survival/01` §1]. The lease-inclusive EV (42,314.3) is published above so an agent that wants the IFRS-16-equivalent view can use it with its label. Lease terms, for context: weighted-average remaining term 7.14 years, weighted-average discount rate 4.74% [`FY26 10-K, Note 13 (Leases)`].
- **Pension underfunding not added.** No funded status, projected benefit obligation or plan assets are presented anywhere in the filing; the disclosure is a US 401(k) defined-contribution plan plus "various pension plans for our non-U.S. employees, some of which are required by local laws", with employer contributions across all plans of 55.1 in FY2026 [`FY26 10-K, Note 14 — Employee Savings Plans`]. Both vendor Pension-OPEB tabs are header-only. Honest qualifier: a small defined-benefit element **cannot be ruled out** from this pool — it is **not disclosed**, not proven absent. Nothing is added, and nothing is assumed away.
- **Non-current software development royalties (72.1) not added.** A trade-type obligation, not interest-bearing debt [`Q2 FY27 10-Q, Condensed Consolidated Balance Sheets`]. Named so a reader can see it was considered.
- **Contingent claims / minimum contractual commitments not added.** FY26 minimum contractual commitments total 740.1 [`FY26 10-K, Note 14`]; these are off-balance-sheet commitments adjudicated in `balance-sheet-survival/05`, not EV bridge items.
- **The undrawn revolver is not an EV item.** 997.9 available of a 1,000.0 committed unsecured facility, nil drawn, $2.1 of letters of credit, maturing 2030-05-19 [`Q2 FY27 10-Q, Note 10 (Debt) — Credit Agreement`]. Undrawn capacity is liquidity, not debt.

**Cash quality — only real operating cash is netted, and the test is shown rather than assumed.** Three items were examined before anything was netted:

| Item | Amount | Netted in canonical EV? | Reason |
|---|---:|---|---|
| Cash & cash equivalents | 1,149.4 | **Yes** | Operating cash and genuine equivalents, unrestricted [`Q2 FY27 10-Q, Balance Sheets`] |
| Short-term investments | 524.2 | **No** (shown as the broad variant) | They **pass** a quality test — "primarily consisted of **bank time deposits with maturities greater than 90 days**", carried at **amortized cost with zero unrealized gain or loss**, unrestricted, and not a financial-subsidiary portfolio [`Q2 FY27 10-Q, Note 5 (Short-Term Investments)` and `Item 2 MD&A`]. They are **not** long-tenor mark-to-market securities. They are excluded anyway because **§15 strict is the default and `balance-sheet-survival/01` designated the strict figure canonical** (Reconciliation Gate 1) — and because the company itself classifies them outside cash equivalents. The broad EV of 41,398.5 is a legitimate alternative read, published with its label |
| Restricted cash | 83.0 (15.0 + 68.0) | **No, and it must stay out** | "primarily related to **dedicated accounts limited to the payment of certain internal royalty obligations**" [`FY26 10-K, Note 1 — Cash and Cash Equivalents`]. Netting it would understate EV and flatter net debt |

One concentration to carry, not a netting adjustment: **945.0 of the 1,149.4 of cash & equivalents (82.2%) is held outside the United States by foreign subsidiaries.** The company describes it as "dispersed across various locations around the world… such dispersion meets the business and liquidity needs of our foreign affiliates", and discloses **no** repatriation restriction, dividend blocker or regulatory block [`Q2 FY27 10-Q, Item 2 MD&A — Financial Condition`]. It is netted in full because no legal barrier is disclosed; inventing a haircut would be inference presented as fact. What is **not** disclosed is how much of the 945.0 could move to the US, in what time, at what tax cost — recorded as "Not disclosed in the data pool".

---

## 5. Net Debt & Leverage Snapshot

As of **2026-09-30**, USD millions.

| Metric | Value | Source |
|---|---:|---|
| Total debt (canonical — §4 above) | **2,519.8** | 629.2 + 1,890.6 [`Q2 FY27 10-Q, Condensed Consolidated Balance Sheets`; composition `Note 10 (Debt)`]. Face value 2,529.8 [`Q2 FY27 10-Q, Note 10` maturities table]. Adopted from `balance-sheet-survival/01` §7 |
| Cash & equivalents | **1,149.4** | `Q2 FY27 10-Q, Condensed Consolidated Balance Sheets` |
| **Net debt (strict, §15: total debt − cash & equivalents) — CANONICAL** | **1,370.4** | 2,519.8 − 1,149.4. Designated canonical by `balance-sheet-survival/01` §7; reached independently by `earnings/01` §2 (same 1,370.4) |
| − Liquid short-term investments (if netted) | (524.2) | `Q2 FY27 10-Q, Note 5 (Short-Term Investments)` — bank time deposits >90 days, amortized cost |
| **Net debt (broad, incl. investments — shown, not canonical)** | **846.2** | 1,370.4 − 524.2. **Never present this as bare "net debt"** |
| *Net debt (vendor basis — broad on cash AND lease-inclusive on debt)* | *1,237.8* | `ciq_facts.json → net_debt_m` [`CIQ Financials → Balance Sheet` 'Net Debt', FQ2 Sep-30-2026]. Reconciles exactly: 1,370.4 − 524.2 + 391.6 = 1,237.8 ✔ |
| Net debt / latest EBITDA — **reported (GAAP)** | **Not meaningful** | There is **no GAAP EBITDA**: the LTM GAAP operating result is a **loss of (180.8)** [`balance-sheet-survival/01` §5a bridge from `FY26 10-K` and `Q2 FY27 10-Q` statements of operations]. A negative denominator produces no usable ratio |
| Net debt / latest EBITDA — **adjusted, company-defined LTM EBITDA 677.6** | **2.02x** | 1,370.4 ÷ 677.6. EBITDA base from `balance-sheet-survival/01` §5a (company's own published non-GAAP definition; the FY2026 component is an engine-computed build from `FY26 10-K` lines because the company publishes no FY2026 full-year EBITDA in this pool) |
| Net debt / latest EBITDA — **adjusted, vendor LTM EBITDA 724.9** | **1.89x** | 1,370.4 ÷ 724.9 [`ciq_facts.json → ltm_ebitda_m`, `CIQ Financials → Income Statement` LTM Sep-30-2026] |
| Net debt / **mid-cycle** EBITDA 565.3 (five-year average FY2022–FY2026) | **2.42x** | 1,370.4 ÷ 565.3 [`balance-sheet-survival/01` §5a (C)] |
| Net debt / **company-guided FY2027** EBITDA 1,053 midpoint | **1.30x** | 1,370.4 ÷ 1,053. A **company forecast**, not a reported period [`TTWO 2Q27 Earnings Release, 2026-11-09, Outlook`] |

The **strict** row is the §15 default and the figure the Anchor Summary carries forward. The broad row is shown because the 524.2 of short-term investments genuinely exists and is genuinely liquid — but it is labelled broad everywhere it appears and is never called strict. Two caveats must travel with every multiple above: **(a) every one of them rests on a non-GAAP EBITDA**, because GAAP operating profit is negative on both the latest full year and the LTM; **(b) the latest LTM window sits *between* game launches and *before* the GTA VI release of 2026-11-19**, so for this business the peak lies ahead rather than behind — 1.30x is a guidance-built floor, 2.42x the own-five-year-average central estimate, 1.89–2.02x the latest realised reading.

---

## 6. Per-Share Reference Values

All on the **187.213488** share count (the market-cap count), at **2026-09-30** balance-sheet values.

| Metric | Per Share | Source |
|---|---:|---|
| Book value per share | **USD 19.62** | Total stockholders' equity 3,673.6 ÷ 187.213488 [`Q2 FY27 10-Q, Condensed Consolidated Balance Sheets`] |
| Tangible book value per share — excluding goodwill and other intangibles | **USD 6.78** | (3,673.6 − goodwill 1,060.2 − other intangibles, net 1,344.3) = 1,269.1 ÷ 187.213488 [`Q2 FY27 10-Q, Balance Sheets`] |
| Tangible book value per share — **also** excluding capitalised software development costs (the vendor's basis) | **USD (6.55)** — negative | (1,269.1 − software development costs and licenses, net of current portion 2,494.9) = (1,225.8) ÷ 187.213488 = **(6.55)** [`Q2 FY27 10-Q, Balance Sheets`]. **This reproduces `Capital IQ Comps → Financial Data` "LTM Tangible Book Value/Share" of (6.55) for the subject row exactly** — which identifies what the vendor is doing and removes an apparent conflict with the 6.78 figure above. Two definitions, both named |
| Net debt per share — **strict** basis | **USD 7.32** net debt | 1,370.4 ÷ 187.213488 |
| Net debt per share — **broad** basis (memo) | USD 4.52 net debt | 846.2 ÷ 187.213488 |
| Net cash per share | **None — the company is net debt on both bases** | Strict 1,370.4 and broad 846.2 are both positive net debt [§5] |

Why the two tangible-book definitions matter and neither is wrong: 2,494.9 of non-current **capitalised software development costs** — nearly 27% of total assets — is the balance sheet's largest single asset [`Q2 FY27 10-Q, Balance Sheets`]. Whether it is "tangible" is a definitional choice, and the vendor's choice (exclude it) flips tangible book per share from +6.78 to −6.55. Any downstream P/B or P/TBV work must say which of the two it is on.

---

## 6A. Distribution Basis

**Not applicable — no yield is quoted anywhere in this run, and none may be.** The company has **never paid a dividend and does not expect to**: "We have never declared or paid cash dividends. We currently anticipate that all future earnings will be retained to finance the growth of our business" [`FY26 10-K, Item 5 — Dividend Policy`; identically at `FY25 10-K, Item 5`]. There is therefore no trailing or forward distribution, no ex-date or record date, and no gross-vs-net withholding question. Shareholder return runs through buybacks only, and even that is currently dormant: the Board has authorised repurchases of up to 21.7 shares, of which **11.7 have been repurchased in the past and 10.0 remain available**, with **no shares repurchased** in Q1 or Q2 of FY27 [`Q2 FY27 10-Q, Item 2 MD&A` and `Item 5`]. Downstream agents must not quote a dividend yield of any kind for TTWO.

---

## 7. Anchor Summary (canonical numbers for downstream agents)

**Use these verbatim (MODULE_RULES Reconciliation Gate 1 — Anchor consistency). Carry every label with every number.** USD, millions, US GAAP; balance-sheet items as of **2026-09-30**; price as of **2026-11-19**.

| Anchor | Canonical value | Label that must travel with it |
|---|---:|---|
| **Current price** | **USD 216.61** | Last close, **as-of 2026-11-19**, **pool-verified** [`Capital IQ Comps → Financial Data` "Day Close Price Latest"; pinned by `ciq_facts.json → current_price`]. Corroborated independently inside the pool by `CIQ Financials_Quarterly → Multiples` (2026-11-18 column, P/BV 11.038053 × BVPS 19.6225 = 216.59 — a 0.01% gap). **1 trading day old; no staleness cap.** Drift note: this is an at-or-just-before-GTA-VI-launch close (release date 2026-11-19 per `Q2 FY27 10-Q`) and contains no post-launch trading |
| **Price-state** | **`pool-verified`** | The canonical tag `05`/`07`/`99` read. **All price-relative reads unlock**: margin of safety, downside-to-bear, observed up/down and valuation attractiveness are **assessable**; `05` (reverse-DCF) **can run**. The no-price Score-Cap row does **not** bind |
| **Currency** | **USD** | US GAAP; fiscal year ends 31 March; "FY2027" = Apr-2026→Mar-2027, **not** a calendar year. No FX conversion anywhere in this module — no cross-currency rate or date to carry |
| **Decision line** | **NasdaqGS:TTWO · NASDAQ Global Select Market · USD** | **Single listed line.** One class registered under §12(b); §12(g) "None"; no second class, no dual listing, no ADR/GDR in this pool [`FY26 10-K, cover page`] |
| **Shares (market cap)** | **187.213488** (187.2m) | Cover-page count net of treasury, **as-of 2026-10-26** [`Q2 FY27 10-Q, cover page`]. Confirmed by `CIQ Financials_Quarterly → Historical Capitalization` "Shares Out." 187.213488 and `ciq_facts.json → shares_outstanding_m` 187.2 |
| **Shares (per-share fair value)** | **188.0** | **Company-disclosed fully diluted count** for management-reporting diluted EPS [`TTWO 2Q27 Earnings Release, 2026-11-09`]. Engine TSM/if-converted build = 188.4 (187.2 + 1.1 awards + 0.1 convertible), a 0.2% difference. **Limitation:** trailing GAAP "diluted" = basic (187.1 / 186.7 / 183.9) only because every trailing period is a loss and the increments are antidilutive — not because dilution is absent. **Maximum RSU overhang bound: 195.4** if all 8.2 unvested units vested (+4.4%); that is a bound, not a valuation count |
| **Market cap** | **40,552.3** | 187.213488 × 216.61. Reproduces `Capital IQ Comps → Financial Data` "Market Capitalization Latest" = 40,552.3 to the decimal. On the 188.0 fully diluted count the equity value is 40,722.7 (+0.4%) |
| **Total debt** | **2,519.8** | **Borrowings only, balance-sheet carrying value**, from the **filing's own debt note** (629.2 + 1,890.6) [`Q2 FY27 10-Q, Balance Sheets` and `Note 10 (Debt)`]. Face value 2,529.8. **Operating leases (391.6) are NOT in this figure.** Lease-inclusive variant 2,911.4 |
| **Net debt** | **1,370.4** | **Strict §15 basis: total debt (carrying) − cash & equivalents only** (2,519.8 − 1,149.4). **Adopted verbatim from `balance-sheet-survival/01_capital-structure-and-leverage.md` §7**, which built it from the filing's debt note; `earnings/01` §2 reaches the same 1,370.4 independently. Broad basis (also netting the 524.2 of short-term investments) = **846.2** — show only with that label. Switching basis mid-module requires an explicit one-line reason |
| **Enterprise value (EV)** | **41,922.7** | 40,552.3 + 2,519.8 + 0 minority + 0 preferred − 1,149.4 cash. No plug. Variants, each labelled: broad-cash **41,398.5**; lease-inclusive-debt **42,314.3**; **vendor TEV 41,790.1** |
| Minority interest · Preferred equity | **Nil · Nil** | No non-controlling interest line on the balance sheet; preferred stock 5.0 shares authorised, **none issued or outstanding** [`Q2 FY27 10-Q, Balance Sheets`]; vendor prints both as "–" |
| Equity-method investments | **None disclosed** | No equity-method line or note in either filing; vendor "− Long Term Marketable Securities" = "–" |
| **Per-share references** | BVPS **19.62** · TBVPS **6.78** (excl. goodwill + intangibles) / **(6.55)** (also excl. capitalised software dev costs — the vendor basis) · net debt/share **7.32** strict (4.52 broad) | On 187.213488 shares, 2026-09-30 book values. The (6.55) reproduces the vendor's own TBV/share exactly — two definitions, both named |
| **Distribution basis** | **None quoted — no dividend ever paid, none expected** | `FY26 10-K, Item 5 — Dividend Policy`. **No dividend yield may be quoted for TTWO anywhere in this run.** Buyback: 21.7 authorised, 11.7 done, 10.0 remaining, **nil repurchased in H1 FY27** [`Q2 FY27 10-Q, Items 2 and 5`] |

### The vendor-versus-filing reconciliation, stated here so it travels with the number

`balance-sheet-survival/01` ran in this run root and its filing-based figure **is** the canonical net debt above. This agent also holds the Capital IQ aggregates, and they differ — named here, not buried in §4/§5:

- **Vendor total debt 2,911.4 vs canonical 2,519.8.** The entire 391.6 gap is **operating-lease liabilities** the company's own debt note does not classify as debt (2,519.8 + 391.6 = 2,911.4 exactly). Under US GAAP those leases sit on separate balance-sheet lines, outside the debt line and outside the borrowings-maturity table.
- **Vendor net debt 1,237.8 vs canonical 1,370.4.** Reconciles with no residual: **1,370.4 − 524.2 short-term investments + 391.6 leases = 1,237.8** ✔. The vendor figure is **broad on the cash side AND lease-inclusive on the debt side** — two departures from §15 in one number.
- **Vendor EV 41,790.1 vs canonical 41,922.7.** Same two differences: **41,922.7 − 524.2 + 391.6 = 41,790.1** ✔.

In all three cases the vendor and the filing **do not conflict — they are different definitions, and both are named.** The filing-based figures are canonical (CLAUDE.md §4: filings beat vendor exports); the vendor figures are retained as labelled cross-checks and must never be swapped in silently.

### Anchor Block (copy-forward)

- **Decision line:** NasdaqGS:TTWO · NASDAQ Global Select Market · USD — every downstream fair value, margin of safety, downside-to-bear and yield is on THIS line. **Single listed line** (one §12(b) class; §12(g) None).
- **Other listed lines:** `None`
- **Price:** USD 216.61 (as-of 2026-11-19, last close)
- **Price-state:** `pool-verified` — the canonical tag `05`/`07`/`99` read. 1 trading day old; no staleness cap; no no-price cap.
- **Currency:** USD (US GAAP; FY ends 31 March; no FX conversion in this module)
- **Distribution basis:** none quoted — **no dividend ever paid and none expected**; no amount, no ex-date, nothing available to a buyer; no withholding or depositary-fee question arises. Do not quote a yield for TTWO.
- **Shares (market cap):** 187,213,488 (`Q2 FY27 10-Q, cover page`, as-of 2026-10-26)
- **Shares (per-share fair value):** 188.0m (`TTWO 2Q27 Earnings Release, 2026-11-09` — company-disclosed diluted count). Limitation: trailing GAAP diluted = basic because every trailing period is a loss; maximum RSU overhang bound 195.4m (+4.4%).
- **Market cap:** USD 40,552.3m
- **Net debt:** USD 1,370.4m — **strict §15 basis** (total debt 2,519.8 − cash & equivalents 1,149.4). **Reconciled against `balance-sheet-survival/01`'s canonical filing-based figure: they agree exactly** (it is the same figure, adopted verbatim), and `earnings/01` reaches it independently. Broad basis 846.2 (label required). Vendor basis 1,237.8 (broad + lease-inclusive) reconciles exactly and is not interchangeable.
- **EV:** USD 41,922.7m (strict cash, borrowings-only debt). Variants: 41,398.5 broad-cash · 42,314.3 lease-inclusive-debt · 41,790.1 vendor.
- **Key caveats:** (1) **Source-check status UNCHECKED, not clean** — this generation carries no `numeric_reading_check`, so every workbook-cell figure is mechanically unverified; each anchor above was read directly from the frozen extract of the filing that reports it, and the vendor tabs were used only to reconcile. (2) **Vendor exports are on a "Dilution: Basic" basis** (`CIQ Multiples`, `Historical Capitalization`, `Estimates → Multiples`) while per-share fair value here is on 188.0 fully diluted — state the basis on every per-share figure. (3) **Every leverage multiple rests on a non-GAAP EBITDA**; GAAP operating profit is an LTM loss of (180.8), so net-debt/EBITDA on a reported basis is Not meaningful. (4) **The price anchor is an at-launch close** — GTA VI released 2026-11-19, the anchor's own as-of date — so it contains no post-launch trading. (5) **Tangible book per share has two live definitions** (+6.78 and −6.55); name which one is in use. (6) **Pension:** no defined-benefit funded status is disclosed anywhere in the pool, so nothing is added to the bridge — not disclosed, not proven absent. (7) **82.2% of cash & equivalents (945.0) sits offshore**, with no disclosed restriction; netted in full, flagged as a concentration.



---

## valuation / 02_multiples-own-history.md

_Source: `02_multiples-own-history.md`_

# Multiples — Own History — TTWO

**Company:** Take-Two Interactive Software, Inc. (NasdaqGS:TTWO) · **Run date:** 2026-11-20
**Reporting currency:** USD, millions unless stated · **Reporting standard:** US GAAP · **Fiscal year ends 31 March** (so "FY2027" = Apr-2026 → Mar-2027, not a calendar year) [`FY26 10-K, cover page`].

**Anchors adopted verbatim from `01_price-and-capital-structure.md` §7 — not rebuilt.** Price **USD 216.61** (last close, as-of **2026-11-19**, price-state `pool-verified`); shares for market cap **187,213,488**; shares for per-share fair value **188.0m** (the company's own disclosed diluted count, used because every trailing period is a loss so trailing GAAP "diluted" equals basic); market cap **40,552.3**; **canonical EV 41,922.7** (strict cash, borrowings-only debt); **canonical strict net debt 1,370.4**.

**Source-check status carried forward: UNCHECKED, not verified clean.** This frozen generation carries **no `numeric_reading_check`** object at any source or sheet level, and `GENERATION_ROOT/corpus.txt` carries no labelled extractor reading-warning annotation. There is therefore **no literal warning token, no source/extract reference and no LF-line/column span to quarantine**, and **no amount below is marked not-proven on that basis**. But a missing check means **unchecked, not clean**: every figure below that comes from a Capital IQ workbook cell — which is most of the multiple history, because a traded-multiple time series exists nowhere else in this pool — is **mechanically unverified by the pattern check**. Where a figure was value-determining I re-derived it from a second cell inside the same frozen capability and show the tie-out. Every restating layer must carry this qualifier forward.

**Two conditions from `00_valuation-data-triage.md` that bind this report:**
1. **The trailing earnings base is negative.** LTM EBIT is **−112.5** and LTM diluted EPS is **−1.29** [`Capital IQ Comps → Financial Data`, subject row, As-Of 2026-11-19]. So LTM P/E and LTM EV/EBIT print **"NM"** and cannot be computed at all — the earnings-multiple work below runs on a **forward (NTM / FY27+)** basis and says so on every line.
2. **No sector-level multiple history exists in this pool** — see §5. The Sector Cycle Reality Test is recorded as **Not assessable**, not skipped.

**Governance qualifier carried, not dropped.** `management-governance/99_management-governance-synthesis.md` records **RF-OWN-004 (structurally unaligned controlling owner, CLAUDE.md §24 Filter 6) = NOT fired**, so the Filter-6 value-trap cap does **not** bind here. But its verdict is **"Misaligned or weak stewardship"** — "five years of capital allocation netted minus $14.6m of free cash flow while the share count rose 61.7%, book value per share fell 42.5%, and $6,665.1m — 84.7% of all goodwill ever recorded — was written off" [`management-governance/99_management-governance-synthesis.md` §1]. That is a **warranted-multiple** argument and it reappears in §3 and §6.

---

## 1. Current Multiples

Business type is **Operating** (an interactive-entertainment publisher, one operating and reportable segment) [`FY26 10-K, Note 21`], so per the Business-Type Method Map the valid set is **EV/EBITDA, EV/EBIT, P/E and an FCF yield**. P/Book is shown as secondary context only — for an operating publisher it is not a primary multiple, and TTWO's book value is distorted by $6,665.1m of cumulative goodwill write-offs. Dividend yield is **not applicable and may not be quoted**.

| Multiple | Basis (LTM / NTM / FY) | Metric Value | Current Multiple | Source |
|---|---|---:|---:|---|
| **P / E** | **NTM** (consensus) | NTM EPS **9.61** | **22.54x** (vendor, basic dilution) · 22.63x on 188.0 diluted | `Capital IQ Estimates → Multiples`, "NTM" Price/Earnings = 22.5412 (header "Dilution: Basic"); ties to 216.61 ÷ 9.61 [`Capital IQ Comps → Financial Data`, NTM EPS] |
| P / E | LTM | LTM diluted EPS **−1.29** | **NM** — negative base | `Capital IQ Comps → Financial Data`, subject row prints LTM P/E as "NM" |
| **EV / EBITDA** | **NTM** | NTM EBITDA **2,349.1** | **17.79x** (vendor TEV 41,790.1) · **17.85x** on canonical EV 41,922.7 | `Capital IQ Estimates → Multiples`, NTM TEV/EBITDA = 17.7899. Metric re-derived inside the frozen capability: 41,790.1 ÷ 17.7899 = 2,349.1 ✔ (agrees with the triage's NTM EBITDA) |
| EV / EBITDA | LTM | vendor multiples-tab EBITDA **≈800.0** vs income-statement LTM EBITDA **724.9** — see the flag below | **52.24x** (vendor tab, internally consistent) · **57.83x** if canonical EV ÷ 724.9 | `Capital IQ Financials_Quarterly → Multiples`, TEV/LTM EBITDA Close, 2026-11-18 column = 52.2409; pinned by `ciq_facts.json → ev_ebitda_current_x` = 52.2. Income-statement base from `ciq_facts.json → ltm_ebitda_m` = 724.9 |
| **EV / EBIT** | **NTM** | NTM EBIT **2,240.6** | **18.65x** (vendor TEV) · **18.71x** on canonical EV | `Capital IQ Estimates → Multiples`, NTM TEV/EBIT = 18.6513; metric re-derived 41,790.1 ÷ 18.6513 = 2,240.6 |
| EV / EBIT | LTM | LTM EBIT **−112.5** | **NM** — negative base | `Capital IQ Comps → Financial Data`, subject row prints LTM TEV/EBIT as "NM"; same row NM from the 2023-06-30 column onward in `Capital IQ Financials_Quarterly → Multiples` |
| **EV / Sales** | **NTM** | NTM revenue **9,906.3** | **4.22x** (vendor TEV) · **4.23x** canonical EV | `Capital IQ Estimates → Multiples`, NTM TEV/REV = 4.2185; metric re-derived 41,790.1 ÷ 4.2185 = 9,906.3 |
| EV / Sales | LTM | LTM revenue **6,409.7** | **6.52x** (vendor TEV) · **6.54x** canonical EV | `Capital IQ Financials_Quarterly → Multiples`, TEV/LTM Revenue Close 2026-11-18 = 6.5198. Tie-out: 6.5198 × 6,409.7 = **41,790.0**, which reproduces the vendor TEV of 41,790.1 — this is how I pinned which EV the whole vendor band is built on |
| **P / Book** (secondary) | LTM (book at 2026-09-30) | BVPS **19.62** | **11.04x** | `Capital IQ Financials_Quarterly → Multiples`, P/BV Close 2026-11-18 = 11.0381; reproduced as 216.61 ÷ 19.6225 = 11.039 using `01` §6's BVPS |
| P / Tangible Book | LTM | TBVPS **(6.55)** on the vendor definition | **NM** — negative base | `01` §6 (two live definitions: +6.78 excluding goodwill and intangibles, (6.55) also excluding capitalised software development costs — the vendor basis, which reproduces the comps export exactly) |
| **FCF yield / P / FCF** | **LTM, §15 basis (`CFO − capex`)** | FCF **62.6** = CFO 367.1 − capex 304.5 | **FCF yield 0.15%** · P/FCF **648x** | My build from `Capital IQ Financials_Quarterly → Cash Flow`, four quarters to Sep-30-2026: CFO 305.2 + 235.4 − 168.8 − 4.7 = **367.1** (ties `ciq_facts.json → ltm_ocf_m` = 367.1 ✔); capex 77.5 + 44.3 + 40.8 + 141.9 = **304.5**. Formula: FCF = CFO − total capex, capex at absolute value |
| *Memo — vendor-defined FCF multiples (NOT §15 FCF)* | LTM | vendor levered FCF **787.6**; vendor unlevered FCF **872.2** | Market cap / levered FCF **51.49x**; TEV / unlevered FCF **47.90x** | `Capital IQ Financials_Quarterly → Multiples`, 2026-11-18 Close; `ciq_facts.json → levered_fcf_m` = 787.6, whose own source_ref warns it is "LEVERED FCF (after interest), NOT the §15 CFO−capex FCF". Shown only because these are the only FCF series with a history |
| **Dividend yield** | — | **None** | **Not applicable — and not quotable** | "We have never declared or paid cash dividends… We do not expect to declare or pay any cash dividends in the foreseeable future" [`FY26 10-K, Item 5 — Dividend Policy`]. `01` §6A instructs that no dividend yield may be quoted for TTWO anywhere in this run |

**A vendor-internal EBITDA basis gap I must flag rather than override (CLAUDE.md §15 matched-basis; the frozen-generation reconcile rule).** `ciq_facts.json → ev_ebitda_current_x` = **52.2x** is the authoritative read of the workbook's own TEV/LTM EBITDA line and I adopt it as such. But the multiples tab's own arithmetic implies an LTM EBITDA of **41,790.1 ÷ 52.2409 = 799.9 ≈ 800.0**, while `ciq_facts.json → ltm_ebitda_m` reports **724.9** from the income statement (my own sum of the four reported quarters — 182.2 + 257.7 + 216.5 + 75.9 — is **732.3**, within 1.0% of 724.9). The multiples tab therefore runs on an EBITDA roughly **10.4% above** the income statement's, and **the pool does not disclose why**. Consequence, stated plainly: the LTM EBITDA band in §2 and its 52.2x "current" reading are internally consistent **with each other** and so the percentile work on them is valid, but that 52.2x is **not** interchangeable with a multiple rebuilt from the canonical EV and the income-statement EBITDA (**57.83x**). Both are shown; neither is silently preferred; the gap is unresolved from this pool.

**Basis labels that travel with every number above.** (a) All vendor multiples and the vendor's NTM EPS are struck on **"Dilution: Basic"** [header line in `Capital IQ Financials_Quarterly → Multiples` and `Capital IQ Estimates → Multiples`], while per-share fair value in §4 is struck on **188.0 fully diluted** — on 188.0 shares the NTM EPS is 9.57 and the P/E 22.63x, a 0.4% difference. (b) Every vendor **TEV** here is **41,790.1**, which `01` §4 proved is **broad on the cash side and lease-inclusive on the debt side** (41,922.7 − 524.2 short-term investments + 391.6 operating leases = 41,790.1 ✔). The canonical EV is 41,922.7; the two differ by 0.3%, so the choice is immaterial to the percentile reads but is labelled everywhere.

---

## 2. Historical Multiple Bands (3–5 years)

**The observation set, stated so a reader can rebuild it.** The series is the **Close** row of `Capital IQ Financials_Quarterly → Multiples` — 40 columns, of which the first **39 are settled quarter-end closes** (2017-03-31 → 2026-09-30) and the 40th (**2026-11-18**) is a market date, not a period end. **The 2026-11-18 column is the "Current" column and is never a member of the historical distribution.** Both halves of every rank percentile below are scoped to the historical set only. The 5-year window used as the primary band is the **20 quarter-end closes from 2021-12-31 to 2026-09-30**; the full 39-close window (9.6 years) is shown beside it because the instruction is a 3–5-year band and the 5-year window happens to contain both of the company's regime shifts, so the longer window is the base-rate check on the shorter one. A 3-year window (12 closes, 2023-12-29 → 2026-09-30) is reported in prose where it changes the read.

**Rank percentile** = `count(historical observations ≤ current) / count(historical observations)`. **Range position** = `(current − min) / (max − min)`. These are different statistics and neither is labelled as the other; where the word *percentile* appears in prose below it always means the rank percentile.

### 2A. NTM-basis bands — the admissible set

The historical NTM closes come from the same quarterly multiples tab; the **current** NTM figure comes from `Capital IQ Estimates → Multiples` because the quarterly tab's NTM rows are blank ("-") in the 2026-11-18 column. Both are Capital IQ, both NTM, both "Dilution: Basic", both on the same vendor TEV — so the basis matches and the statistics are comparable. Internal consistency check on the current column: 216.61 ÷ 9.61 = 22.54 = the estimates tab's own NTM P/E ✔.

| Multiple | Basis | Observations (n, window) | Min | Mean | Median | Max | Current | Rank percentile | Range position |
|---|---|---|---:|---:|---:|---:|---:|---:|---:|
| EV / Sales | **NTM band vs NTM current** | 20, 2021-12-31 → 2026-09-30 | 2.735 | 4.930 | 4.939 | 7.842 | **4.219** | **25.0%** | 29.1% |
| EV / Sales | NTM | 39, 2017-03-31 → 2026-09-30 | 2.169 | 4.738 | 4.507 | 7.842 | 4.219 | 25.6% | 36.1% |
| **EV / EBITDA** | **NTM band vs NTM current** | **20, 2021-12-31 → 2026-09-30** | **14.298** | **27.778** | **26.806** | **51.732** | **17.790** | **15.0%** | **9.3%** |
| EV / EBITDA | NTM | 39, 2017-03-31 → 2026-09-30 | 9.836 | 23.992 | 21.859 | 51.732 | 17.790 | 28.2% | 19.0% |
| EV / EBIT | **NTM band vs NTM current** | 20, 2021-12-31 → 2026-09-30 | 14.121 | 31.987 | 29.650 | 69.435 | **18.651** | **20.0%** | 8.2% |
| EV / EBIT | NTM | 39, 2017-03-31 → 2026-09-30 | 10.459 | 26.990 | 23.982 | 69.435 | 18.651 | 28.2% | 13.9% |
| P / E | **NTM band vs NTM current** | 20, 2021-12-31 → 2026-09-30 | 21.404 | 41.487 | 37.836 | 89.862 | **22.541** | **10.0%** | 1.7% |
| P / E | NTM | 39, 2017-03-31 → 2026-09-30 | 15.835 | 36.431 | 31.972 | 89.862 | 22.541 | 12.8% | 9.1% |

### 2B. LTM-basis bands — cross-check only, not the `07` anchor

| Multiple | Basis | Observations (n, window) | Min | Mean | Median | Max | Current | Rank percentile | Range position |
|---|---|---|---:|---:|---:|---:|---:|---:|---:|
| EV / Sales | LTM band vs LTM current | 20, 2021-12-31 → 2026-09-30 | 4.547 | 5.934 | 5.540 | 8.472 | **6.520** | **75.0%** | 50.3% |
| EV / Sales | LTM | 39, 2017-03-31 → 2026-09-30 | 2.860 | 5.455 | 5.317 | 8.472 | 6.520 | 82.1% | 65.2% |
| **EV / EBITDA** | LTM band vs LTM current (both on the vendor tab's ~800 EBITDA basis — see §1 flag) | 20, 2021-12-31 → 2026-09-30 | 17.616 | 43.173 | 35.314 | 94.373 | **52.241** | **70.0%** | 45.1% |
| EV / EBITDA | LTM | **39, 2017-03-31 → 2026-09-30** | **17.543** | **40.849** | **37.983** | **94.373** | **52.241** | **74.4%** | 45.2% |
| P / Book | LTM | 20, 2021-12-31 → 2026-09-30 | 1.849 | 6.754 | 4.761 | 20.119 | **11.038** | **80.0%** | 50.3% |
| P / Book | LTM | 39, 2017-03-31 → 2026-09-30 | 1.849 | 6.816 | 6.241 | 20.119 | 11.038 | 89.7% | 50.3% |
| *EV / unlevered FCF (vendor definition, not §15)* | LTM | 20, 2021-12-31 → 2026-09-30 | 14.479 | 26.802 | 28.560 | 41.167 | **47.903** | **100.0%** | **125.2%** |
| *Market cap / levered FCF (vendor definition, after interest, not §15)* | LTM | 20, 2021-12-31 → 2026-09-30 | 12.994 | 27.504 | 30.977 | 42.193 | **51.490** | **100.0%** | **131.8%** |
| EV / EBIT | LTM | **n = 5** usable of 20 (15 NM from 2023-03-31 on) | 21.619 | — | — | 86.737 | **NM** | **not assessable** | **not assessable** |
| P / E | LTM | **n = 4** usable of 20 (16 NM from 2022-12-30 on) | 34.068 | — | — | 81.791 | **NM** | **not assessable** | **not assessable** |

**The two bottom rows are not a thin-data accident, they are the company's accounting reality.** TTWO has reported a GAAP operating loss in every fiscal year from FY2023 to FY2026 and in the LTM to Sep-30-2026 [`ciq_facts.json → multi_year_trajectory`, ROIC −4.3% / −3.1% / −4.2% / −0.8% / −1.0%]. With fewer than ~8 usable observations, both statistic columns read **"not assessable"** rather than a confident number off a four- or five-point series, and the current value is NM in any case. **No trailing P/E or trailing EV/EBIT reversion target exists for TTWO** — not as a weak one, as none at all.

**Why the two statistic columns disagree so much on the FCF rows, and what that means.** On the vendor FCF multiples the **range position exceeds 100%** (125.2% and 131.8%) — the current reading sits **above the 5-year maximum**, so "where it sits between the extremes" has no meaning inside the band and the rank percentile is a flat 100%. Reported as they fall out; not smoothed. Over the full 39-close window the same two rows show range positions of only 24.1% and 27.1%, because a single 2018 outlier (TEV/unlevered FCF of 173.7x at 2018-09-28) stretches the maximum — the textbook case of a range position being read as a frequency when it is not one. Both numbers are shown on both windows precisely so neither can be mistaken for the other.

### Admissibility for `07`

- **The NTM band (§2A) IS admissible as a `07` scenario anchor.** Band and current are on the same basis (NTM vs NTM), n = 20, and the window is settled quarter-ends. It carries the caveats in §3–§4 and the UNCHECKED source-check status, but it is value-producing and comparable, so `07` may take its base, bull and bear EV/NTM-EBITDA multiples from it — base near the median **26.81x**, bull toward the upper band (the 5-year max is **51.73x**, set at 2025-06-30), bear toward the lower band (the 5-year min is **14.30x**, set at 2022-06-30). Carry the **NTM** label with any multiple lifted: a number from this band applied to an LTM metric is not "the low end of the historical range", it is a different statistic wearing that sentence.
- **The LTM band (§2B) is NOT admissible as the `07` scenario anchor, and this is an explicit disowning, not a cap.** The reason is a basis defect, not cycle distortion: `07` builds every case as *forward metric × multiple* (Scenario Construction §2), and an LTM multiple cannot be applied to a forward metric. It is made worse by two things specific to TTWO — the LTM denominators for EBIT and EPS are **negative**, so two of the four earnings multiples do not exist on this basis at all; and the LTM EBITDA band runs on a vendor EBITDA ~10.4% above the income statement's (§1 flag). **`07` should take its multiple from the NTM band in §2A**, cross-referenced against the peer-derived forward multiples in `03_relative-valuation-peers`. The LTM band stays in this report as what it is: the record of where the market has actually paid for this company's trailing results, which is a useful sanity check and is not a fair-value input.

---

## 3. Re-Rating / De-Rating Read

**The two reads point in opposite directions, and that is the finding — not a contradiction to average away.** On the **NTM** basis the stock sits at a **discount to its own 5-year history**: EV/NTM EBITDA **17.79x vs a 5-year mean of 27.78x (−36.0%) and median 26.81x (−33.6%)**, at the **15th rank percentile** of its own 20-quarter band; P/NTM EPS **22.54x vs mean 41.49x (−45.7%) and median 37.84x (−40.4%)**, at the **10th percentile**; EV/NTM EBIT **18.65x vs mean 31.99x (−41.7%)**. On the **LTM** basis the same stock sits at a **premium**: EV/LTM EBITDA **52.24x vs a 5-year median of 35.31x (+47.9%)** and mean 43.17x (+21.0%), at the **70th percentile**; EV/LTM sales **6.52x vs median 5.54x (+17.7%)**, 75th percentile; P/Book **11.04x vs median 4.76x (+131.8%)**, 80th percentile; and both vendor FCF multiples are **above their own 5-year maximum**. All percentages are computed as `(current − reference) / reference` with the reference being the historical mean or median, never the current multiple.

**The whole gap is the denominator, not the price.** Price is near its own high and the trailing base is at a trough: LTM EBITDA is **724.9** while NTM EBITDA is **2,349.1** — a **3.24x step-up** in the forward metric with no corresponding step in the share price. The cause is dated and documented: **Grand Theft Auto VI released on 2026-11-19** — the anchor price's own as-of date — and the LTM window to Sep-30-2026 is the pre-launch gap between Borderlands 4 (September 2025) and that launch, with Q2 FY27 net bookings down 18% year on year [`Q2 FY27 10-Q, Item 1A and Item 2 MD&A`; `business-model/09_moat.md` §2, which labels the latest window a **trough**, not a peak]. So the honest sentence is: **the stock has re-rated UP hard on every trailing measure over the last two years** (EV/LTM EBITDA ran 17.69x at 2024-03-28 → 94.37x at 2025-06-30 → 52.24x now; P/Book 2.98x → 20.12x → 11.04x) **and the apparent discount exists only on a forward window that contains a full year of a game that went on sale yesterday.**

**One sanity check that sizes how much of the "discount" is the choice of forward window.** On the **current fiscal year** — FY2027, which contains only about 4.5 months of GTA VI — the vendor's own forward grid prints **TEV/EBITDA of 24.69x** [`Capital IQ Estimates → Multiples`, FY 2027 row], i.e. roughly **−7.9% versus the 5-year NTM median of 26.81x** rather than −33.6%. **Basis caveat, and it is load-bearing: a fiscal-year multiple is not an NTM multiple, so no rank percentile or range position is reported for it** — it is a labelled bracket, not a band member. Read together, the two forward windows say the discount to own history is roughly −8% on this fiscal year and roughly −34% on the next twelve months, and the difference is entirely how much GTA VI the denominator is allowed to contain.

---

## 4. Implied Value from Reversion

Formulas, shown so every number can be reproduced. For EV-based multiples: `implied TEV = reversion multiple × NTM metric`; `implied equity = implied TEV − net debt`; `implied price = implied equity ÷ 188.0 fully diluted shares`. For P/E: `implied price = reversion multiple × NTM EPS`.

**One deliberate, stated basis choice (MODULE_RULES Reconciliation Gate 1 allows a basis switch with an explicit one-line reason).** The band's multiples are built on the **vendor TEV** (broad cash, lease-inclusive debt), so the matched-basis bridge subtracts the **matching vendor net debt of 1,237.8**, not the canonical strict 1,370.4 — subtracting a strict net debt from a broad-basis TEV would be exactly the mismatched ratio §15 bans. The difference is immaterial and is shown anyway: using the canonical strict 1,370.4 lowers every per-share figure below by **(1,370.4 − 1,237.8) ÷ 188.0 = USD 0.71**, i.e. 0.3% of the price.

| Multiple | Reversion Target (mean / median) | Implied EV or Equity | Implied Price/Share | vs Current Price |
|---|---:|---:|---:|---:|
| **EV / NTM EBITDA** (metric 2,349.1) | **median 26.806x** | TEV 62,985.1 → equity 61,747.3 | **USD 328.44** | **+51.6%** |
| EV / NTM EBITDA | mean 27.778x | TEV 65,250.1 → equity 64,012.3 | USD 340.49 | +57.2% |
| EV / NTM EBIT (metric 2,240.6) | median 29.650x | TEV 66,439.6 → equity 65,201.8 | USD 346.82 | +60.1% |
| EV / NTM EBIT | mean 31.987x | TEV 71,683.0 → equity 70,445.2 | USD 374.71 | +73.0% |
| EV / NTM Sales (metric 9,906.3) | median 4.941x | TEV 48,951.1 → equity 47,713.3 | USD 253.79 | +17.2% |
| EV / NTM Sales | mean 4.930x | TEV 48,828.2 → equity 47,590.4 | USD 253.14 | +16.9% |
| P / NTM EPS (metric 9.61, basic-dilution vendor basis) | median 37.841x | equity value per share direct | USD 363.63 | +67.9% |
| P / NTM EPS | mean 41.487x | equity value per share direct | USD 398.65 | +84.0% |

**ONE base-case implied value (the point `07` weights):** **USD 328 per share**, being the **own-5-year-MEDIAN EV/NTM-EBITDA multiple of 26.806x applied to NTM EBITDA of 2,349.1**, bridged at the matched vendor net debt and divided by 188.0 fully diluted shares. EV/NTM EBITDA is named as the most reliable multiple here for three reasons: it is the only forward earnings measure with a positive denominator **and** a complete 20-quarter same-basis band; it is the multiple `ciq_facts.json` independently tracks for this company; and it avoids both the negative-EBIT problem and the revenue multiple's blindness to margin.

**The dispersion across the multiples used — its separate exhibit, not the point:** **USD 253 to USD 364** on the own-median targets (EV/NTM Sales at the bottom, P/NTM EPS at the top), a high-to-low field of **43.3%** measured on the low end. That spread is wide enough to matter: `99` should note it, because MODULE_RULES caps valuation confidence at 55 when the field of valid value-producing **methods** exceeds 40%, and this is a 43.3% field inside a single method.

**The reversion assumption, stated and then tested rather than assumed.** Every number in this table assumes **the warranted multiple has not structurally changed** — that the market should pay for post-GTA-VI forward earnings what it paid, on average, for pre-GTA-VI forward earnings. Four pieces of evidence bear on whether that holds, and they do not all run the same way:

- **For reversion:** the forward earnings are not a one-year spike in consensus's view. The vendor's forward grid implies EBITDA of 1,692.8 (FY2027) → 2,458.9 (FY2028) → 2,622.4 (FY2029) → 3,590.8 (FY2034) [`Capital IQ Estimates → Multiples`, TEV/EBITDA rows at the fixed vendor TEV], so the NTM 2,349.1 is **below** the out-year path, not above it. Company guidance supports the near end: FY27 net bookings of **$8,000–8,200m against FY26's $6,721m** [`Q2 FY27 investor deck, 2026-11-09, slides 5 and 8`, via `business-model/09_moat.md` §4]. **Label: these are vendor estimates and company guidance, not facts.**
- **Against reversion — delivery.** The company **missed its own most recent quarterly guidance**: Q2 FY27 net bookings of $1,601.3m against guidance of $1,620–1,670m, and recurrent consumer spending fell 9% against a guided 5% decline [`earnings/04_guidance-consensus.md` §; `Q2 FY27 earnings call transcript, 2026-11-09, prepared remarks`].
- **Against reversion — structure.** All three console publisher licences (Sony and both Microsoft agreements), covering **39.0% of FY26 revenue**, expire **2027-03-31**, and loot-box rulemaking in six jurisdictions points at the **78.1% of FY26 net revenue** that is in-game monetisation [`business-model/09_moat.md` §; `business-model/10_external-dependency.md` §1].
- **Against reversion — stewardship.** Over the five years inside this very band the share count rose **61.7%**, book value per share fell **42.5%**, and $6,665.1m of goodwill was written off [`management-governance/99_management-governance-synthesis.md` §1]. A multiple earned while per-share value was being destroyed is a weak claim on the future, and this is the specific reason §6 does not present reversion to the old mean as a clean base case.

**Denominator sensitivity, because the choice of forward window drives more of the answer than the choice of multiple.** Holding the own-5-year-median multiple fixed at 26.806x and changing only the EBITDA base: FY2027's 1,692.8 implies **USD 235** per share (+8.4%); NTM's 2,349.1 implies **USD 328** (+51.6%); FY2029's 2,622.4 implies **USD 367** (+69.6%). The multiple is not what is doing the work.

**On independence (CLAUDE.md §16).** Nothing in this section can corroborate a claim that the market is mispricing TTWO. These bands are a record of where the market has already priced this company. If `03`'s peer-derived read agrees with the USD 328 point, `07` must explain why that agreement is independent before leaning on it.

---

## 5. Sector Cycle Reality Test

**Not assessable — no sector-level multiple history.** The pool carries **no** sector-index or peer-aggregate multiple history: the peer workbook holds only **current** (As-Of 2026-11-19) multiples for the 10 named peers, with no 3–5-year peer-group or sector-index series anywhere in the 62 extracted tabs [`Capital IQ Comps → Trading Multiples`; confirmed as a named gap in `00_valuation-data-triage.md` §5]. A labelled web attempt was made and did **not** clear this module's citation bar, so it is recorded and **not used as an anchor**: a search returned only a **current** sector-proxy level (VanEck Video Gaming and eSports ETF, ESPO, P/E 27.36 as of late October 2026 — *web-sourced 2026-11-20, indicative, unverified*) with no same-basis level from 3–5 years ago, and secondary aggregator pages offering "15–20x EV/NTM EBITDA in 2021" against "21.8x 2026E for AAA publishers" (*web-sourced 2026-11-20, undated methodology, unverified, not a reputable primary market-data source*). A **current-only** sector level cannot measure a change over the window, and an undated secondary estimate is not a basis on which to fire a flag that mechanically caps a score. So the window-change is genuinely unmeasured here.

**Consequence, applied exactly as the rules require.** **No flag fires** — neither `RF-VAL-001` (cycle-elevated) nor `RF-VAL-002` (cycle-depressed) is emitted, because firing one on evidence this thin would be fabricating a correction. Per the Score Cap table, an honestly-absent check is **no cap by itself**, but `99` must record the gap in its Reconciliation so it is visible rather than silently skipped. And the absence must be read with §2's own warning: the 5-year window inside this band contains a 2024–2025 stretch in which TTWO's own EV/LTM EBITDA ran from 17.69x to 94.37x, so whether that band is a stable "normal" is **unknown**, not confirmed — the band is used in §4 because it is the best evidence available, not because it has been shown to be cycle-neutral.

---

## 6. Own-History Read

**Blunt version.** On the forward basis `07` has to use, TTWO trades at **17.79x EV/NTM EBITDA, a 33.6% discount to its own 5-year median of 26.81x and at the 15th percentile of its own 20-quarter range** — and reverting to that median implies **USD 328 per share, +51.6% on the USD 216.61 close of 2026-11-19**. On every trailing basis the same stock trades at a **premium** to its own history (EV/LTM EBITDA +47.9% to its 5-year median, P/Book +131.8%, both vendor FCF multiples above their own 5-year maximum), and the entire difference is that the forward denominator is 3.24x the trailing one because Grand Theft Auto VI went on sale on 2026-11-19 — the anchor price's own date, so the anchor contains **no post-launch trading**.

**The single biggest caveat: the discount is a bet on the denominator, not a mispriced multiple — and the warranted multiple has plausibly fallen.** The reversion target assumes the market should pay its pre-launch average multiple on post-launch earnings it has not yet seen one quarter of. The company missed its own guidance last quarter (net bookings $1,601.3m vs $1,620–1,670m; RCS −9% vs guided −5%), 39.0% of FY26 revenue sits under console licences that expire 2027-03-31, 78.1% of FY26 net revenue is the in-game monetisation that six jurisdictions are writing rules about, and the five years that produced this band also produced a 61.7% rise in the share count, a 42.5% fall in book value per share, and $6,665.1m of goodwill write-offs under a management team the governance module calls **"misaligned or weak stewardship"** (RF-OWN-004 not fired, so no Filter-6 cap binds — but the qualifier stands). Reverting to the old mean is therefore **not** a clean floor, and `07` should treat 26.81x as a ceiling-ish base rather than a conservative one.

**And the band itself is not proven stable.** §5 could not source any sector-level multiple history, so whether this 5-year window sat inside a sector-wide re-rating is **Not assessable** — not "no". Combined with the UNCHECKED source-check status on every workbook cell behind these series, this method's output is a defensible best read, not a verified one, and it cannot corroborate a mispricing claim about the very company whose own trading record it is.



---

## valuation / 03_relative-valuation-peers.md

_Source: `03_relative-valuation-peers.md`_

# Relative Valuation — Peers — TTWO

**Company:** Take-Two Interactive Software, Inc. (NasdaqGS:TTWO) · **Run date:** 2026-11-20
**Reporting standard:** US GAAP · **Currency:** USD, millions unless stated · **Fiscal year ends 31 March** ("FY2027" = Apr-2026 → Mar-2027, not a calendar year).

**Anchor adopted verbatim from `01_price-and-capital-structure.md` §7 (MODULE_RULES Reconciliation Gate 1 — not rebuilt here):** price **USD 216.61**, last close, as-of **2026-11-19**, price-state `pool-verified`; shares for market cap **187,213,488**; shares for per-share fair value **188.0m** (the company's own disclosed diluted count, `TTWO 2Q27 Earnings Release, 2026-11-09`, used because every trailing GAAP period is a loss so trailing "diluted" equals basic); market cap **40,552.3**; **net debt 1,370.4 — strict §15 basis** (total debt 2,519.8 carrying value, borrowings only, less cash & equivalents 1,149.4); **canonical EV 41,922.7**; vendor TEV **41,790.1** (broad on cash, lease-inclusive on debt). No dividend has ever been paid and none is expected, so **no dividend yield is quoted anywhere below** [`FY26 10-K, Item 5 — Dividend Policy`].

**Three conditions bind every number in this report and must travel with any restatement.**

1. **Source-check status: UNCHECKED, not verified clean.** This frozen generation carries **no `numeric_reading_check`** object at any source or sheet level, and `GENERATION_ROOT/corpus.txt` carries no labelled extractor reading-warning annotation. There is therefore no literal warning token, no source/extract reference and no LF-line/column span to quarantine, and **no amount below is marked not-proven on that basis** — but a missing check means **unchecked, not clean**. Every peer figure here is a workbook cell that is mechanically unverified by the pattern check. Each is reproduced from the frozen extract of the tab that reports it, and every multiple used in a value conclusion has been recomputed from its own stated numerator and denominator inside this frozen capability (the recomputations are shown).
2. **The trailing earnings base is negative, so trailing earnings multiples cannot be compared at all.** LTM EBIT is **−112.5** and LTM diluted EPS is **−1.29**, which is why the comps export prints TTWO's LTM TEV/EBIT and LTM P/E as "NM" [`Capital IQ Comps → Financial Data` and `→ Trading Multiples`, As-Of 2026-11-19]. All earnings-multiple work below therefore runs on a **forward NTM** basis and says so on every line. The LTM revenue and LTM EBITDA multiples are computable and are shown, but they are measured inside a stated pre-launch trough — Grand Theft Auto VI released on **2026-11-19**, the anchor's own as-of date [`Q2 FY27 10-Q, Item 1A and Item 2`] — so they are reported as context, not as the comparison that decides anything.
3. **No peer-multiple history and no sector-level multiple history exist in this pool.** The comps workbook carries only the current (2026-11-19) cross-section. So the relative-gap-over-time read (§3) and the Sector Cycle Reality Test (§6) are each **Not assessable**, recorded as named gaps rather than assumed stable.

---

## 1. Peer Set

**Source of the set: `business-model/08_competitive-map.md` (cross-module input, present in this run root), cross-checked against the company's own 10-K competition disclosure and against the pool's Capital IQ comp set.** The set is **not self-selected** — no partial-data cap for a self-selected peer set applies.

Take-Two names its competitors twice in its own FY26 10-K, in the same list both times: **Electronic Arts, Embracer Group, Epic Games, Playrix, Playtika, Roblox, Savvy Games, Tencent and Ubisoft** as publisher rivals, plus **Sony, Microsoft and Nintendo** "for the sale of interactive entertainment software", plus **Apple, Google and Microsoft** in mobile [`FY26 10-K, Item 1 — Competition`; `FY26 10-K, Item 1A`]. The pool's Capital IQ comp set contains ten peers, five of which appear in that 10-K list.

| Peer | Ticker | Why Comparable | Source of Inclusion |
|---|---|---|---|
| Electronic Arts Inc. | **No longer listed** (delisted) | The closest structural twin: a licensed-sports-plus-owned-IP publisher across console, PC and mobile. EA SPORTS FC / Madden / NHL / UFC / F1 / PGA TOUR sit directly against NBA 2K, WWE 2K and PGA TOUR 2K — same model, same annual cadence, same third-party licence cost. LTM revenue **7,846** vs TTWO **6,409.7** | Named **first** in `FY26 10-K, Item 1 — Competition`; `CIQ Comps → Business Description`, As-Of 2026-11-19; `business-model/08_competitive-map.md §2, Competitor A` |
| Roblox Corporation | NYSE:RBLX | Competes for the exact revenue line TTWO depends on most — in-experience spending, the same economics as TTWO's recurrent consumer spending (78.1% of FY26 revenue). Closest peer by revenue: LTM **5,897.6** = 92% of TTWO's, same LTM window (to 2026-09-30) | Named in `FY26 10-K, Item 1 — Competition`; `CIQ Comps → Business Description`; `08_competitive-map.md §2, Competitor B` |
| Nintendo Co., Ltd. | TSE:7974 | Named by TTWO as a competitor "for the sale of interactive entertainment software". Largest in the set (LTM revenue **13,684.5**) and a first-party publisher of owned IP — but it is also the **platform owner**, so part of its multiple prices hardware and a console install base TTWO does not have | `FY26 10-K, Item 1 — Competition`; `CIQ Comps → Business Description`; `08_competitive-map.md §2A` |
| Playtika Holding Corp. | NasdaqGS:PLTK | Direct rival to Zynga in mobile free-to-play, same genres and channels. LTM revenue **2,828.4** = 85% of TTWO's FY26 mobile revenue of 3,333.0, the half of TTWO that mobile represents (50.1% of FY26 revenue) | `FY26 10-K, Item 1 — Competition`; `CIQ Comps → Business Description`; `08_competitive-map.md §2, Competitor C` |
| Ubisoft Entertainment SA | ENXTPA:UBI | Named by TTWO. A premium console/PC publisher on the same platforms — the second-closest business model to Rockstar/2K after EA. LTM revenue **1,530.4** | `FY26 10-K, Item 1 — Competition`; `CIQ Comps → Business Description`; `08_competitive-map.md §2A` |
| Konami Group Corporation | TSE:9766 | Owned-IP console/mobile publisher with a licensed-sports franchise (eFootball). Not in the 10-K list; in the comp set. LTM revenue **3,621.6** — but ~a third of the group is arcade, gaming machines and sports facilities, which TTWO has nothing like | `CIQ Comps → Business Description`, As-Of 2026-11-19; `08_competitive-map.md §2A` |
| NEXON Co., Ltd. | TSE:3659 | PC-online, mobile and console publisher of owned IP running live-service monetisation — the model TTWO's recurrent consumer spending uses. LTM revenue **3,360.9** | `CIQ Comps → Business Description`; `08_competitive-map.md §2A` |
| 37 Interactive Entertainment | SZSE:002555 | Mobile and web game developer/publisher, China-centred. LTM revenue **2,229.5**, comparable in size to TTWO's mobile arm | `CIQ Comps → Business Description`; `08_competitive-map.md §2A` |
| PLAYSTUDIOS, Inc. | NasdaqCM:MYPS | Mobile free-to-play social-casino publisher — same genre as part of Zynga, but LTM revenue **217.7** is 3.4% of TTWO's | `CIQ Comps → Business Description`; `08_competitive-map.md §2A` |
| tinyBuild, Inc. | AIM:TBLD | PC/console indie publisher. LTM revenue **38.6** is 0.6% of TTWO's | `CIQ Comps → Business Description`; `08_competitive-map.md §2A` |

### Two set-level facts that change how the median must be read

**(a) The single closest comparable has no public multiples — Electronic Arts is private.** Every price-dependent cell in EA's row is blank: no day-close price, no shares outstanding, no market capitalisation, and all eight trading multiples are dashes, while all nine other peers are populated [`CIQ Comps → Financial Data` and `→ Trading Multiples`, As-Of 2026-11-19]. EA's LTM *financials* are still present (revenue 7,846, EBITDA 1,726, EBIT 1,405, diluted EPS 4.28, LTM window to 2026-06-30), and its S&P issuer credit rating has moved to **BB−** against TTWO's **BBB** [`CIQ Comps → Credit Health Panel`, As-Of 2026-11-19]. The cause is outside the pool: EA was taken private at **USD 210.00 per share in an all-cash deal of about USD 55 billion** by Saudi Arabia's Public Investment Fund, Silver Lake and Affinity Partners, announced 2025-09-29 and **closed 2026-08-04**, with about USD 20bn of committed debt financing [`Web: cnbc.com, 2025-09-29; hollywoodreporter.com, 2025-09-29; acquiry.com and tech-insider.org, Aug-2026 — web-sourced as of 2026-11-20, unverified`; corroborated inside the pool by the blank vendor price cells and the BB− rating consistent with a leveraged capital structure; `08_competitive-map.md §2` reaches the same conclusion]. **This is the named weakness the triage required me to surface rather than absorb: the one peer whose business most resembles TTWO's contributes nothing to any median below.** It is instead used in §4 as a **transaction comparable**, which is the one genuinely independent corroborating read this module has.

**(b) Private and un-comparable peers named by TTWO but absent from the comp set — no multiples exist for them in this pool and none are guessed:** Embracer Group, Epic Games, Playrix, Savvy Games, Tencent, Sony, Microsoft, Apple, Google [`FY26 10-K, Item 1 — Competition`]. Epic Games, Playrix and Savvy Games are private; Tencent, Sony, Microsoft, Apple and Google are listed but are conglomerates for which a group multiple would price businesses that have nothing to do with game publishing. Tencent is also, on TTWO's own disclosure, simultaneously a competitor and the partner through which TTWO sells NBA 2K Online in China [`FY26 10-K, Item 1`], so a clean competitive multiple is not derivable for it either.

---

## 2. Peer Multiples & Operating Stats

**All peer and subject multiples below are from one source computed by one engine on one date — `Capital IQ Comps → Trading Multiples`, As-Of Date 2026-11-19 — so the cross-sectional comparison is internally consistent.** Operating stats are `Capital IQ Comps → Operating Statistics`, same As-Of date. Both are **tier-5 vendor exports, not filings**: they are the vendor's normalised read of each peer's accounts, not that peer's audited statements. Three basis facts carry with the whole table: **(i)** each peer's "LTM" window ends on a different date (Ubisoft 2026-03-31 through NEXON 2026-11-10; TTWO 2026-09-30) [`CIQ Comps → Credit Health Panel`, "LTM Period Ending"]; **(ii)** non-USD peers are "converted at today's spot rate" by the vendor, so a Japanese, Chinese, French or UK peer's multiple carries an unstated FX translation; **(iii)** the vendor TEV used in the peer numerator is **broad on cash and lease-inclusive on debt**, which is why TTWO's row uses vendor TEV 41,790.1 here for apples-to-apples comparison while every equity bridge in §5 uses the canonical filing-based strict net debt of 1,370.4 (Reconciliation Gate 1). The two differ by 0.32% at the EV line.

| Company | LTM EV/Sales | LTM EV/EBITDA | LTM EV/EBIT | LTM P/E | LTM P/TangBV | **NTM EV/Sales** | **NTM EV/EBITDA** | **NTM P/E** | LTM Rev Growth | LTM EBITDA Margin | ROIC | LTM Total Debt/EBITDA | Credit (1=best) · S&P | 5-yr Beta | Data As-of |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|---:|---|
| **TTWO (subject)** | **6.5** | **52.2** | **NM** | **NM** | **NM** | **4.22** | **17.79** | **22.54** | **+3.1%** | **11.3%** | **n/a** | **3.6x** | **4 · BBB** | **0.92** | 2026-11-19 |
| Roblox | 5.5 | NM | NM | NM | NM | 4.34 | 25.95 | NM | +32.1% | −13.0% | n/a | NM | 3 · BBB− | 1.53 | 2026-11-19 |
| **Electronic Arts** | **–** | **–** | **–** | **–** | **–** | **–** | **–** | **–** | +5.0% | 22.0% | n/a | 1.0x | 2 · BB− | – | 2026-11-19 (private) |
| Playtika | 1.0 | 4.0 | 5.4 | NM | NM | 1.06 | 3.67 | 3.62 | +3.7% | 24.5% | n/a | 3.5x | 4 · BB− | 1.02 | 2026-11-19 |
| Nintendo | 4.0 | 16.0 | 16.6 | 24.2 | 3.6 | 4.00 | 25.24 | 32.04 | +25.2% | 20.7% | n/a | – | 1 · NR | 0.22 | 2026-11-19 |
| PLAYSTUDIOS | NM | NM | NM | NM | 0.6 | NM | NM | NM | −12.0% | 6.7% | n/a | 0.2x | 2 · – | 1.03 | 2026-11-19 |
| 37 Interactive | 1.9 | 13.0 | 13.6 | 16.1 | 3.1 | 1.69 | 8.88 | 12.00 | −10.2% | 14.5% | n/a | 2.0x | 3 · – | 0.84 | 2026-11-19 |
| NEXON | 3.1 | 10.9 | 11.9 | 18.3 | 3.5 | 3.11 | 11.04 | 21.19 | +24.1% | 29.1% | n/a | 0.2x | 2 · – | 0.65 | 2026-11-19 |
| Ubisoft | 0.7 | NM | NM | NM | 23.7 | 0.64 | 2.20 | NM | −21.8% | −81.5% | n/a | NM | 4 · – | −0.16 | 2026-11-19 |
| Konami | 6.7 | 16.7 | 19.9 | 31.4 | 7.4 | 5.99 | 15.14 | 27.49 | +24.8% | 39.6% | n/a | 0.2x | 1 · NR | 0.38 | 2026-11-19 |
| tinyBuild | 1.4 | NM | NM | NM | 98.1 | 1.03 | 7.37 | 21.15 | +25.8% | −12.4% | n/a | NM | 3 · – | −0.45 | 2026-11-19 |
| **Peer median (full set)** | **2.5** | **13.0** | **13.6** | **21.3** | **3.6** | **2.40** | **9.96** | **21.17** | **+14.6%** | **17.6%** | **n/a** | **0.6x** | **2.5** | **0.65** | 2026-11-19 |
| *Peer mean (full set)* | *3.0* | *12.1* | *13.5* | *22.5* | *20.0* | *2.73* | *12.44* | *19.58* | *+9.7%* | *5.0%* | *n/a* | *1.2x* | *—* | *0.56* | 2026-11-19 |
| *Peer high / low (full set)* | *6.7 / 0.7* | *16.7 / 4.0* | *19.9 / 5.4* | *31.4 / 16.1* | *98.1 / 0.6* | *5.99 / 0.64* | *25.95 / 2.20* | *32.04 / 3.62* | *+32.1 / −21.8%* | *39.6 / −81.5%* | *n/a* | *3.5 / 0.2x* | *—* | *1.53 / −0.45* | 2026-11-19 |

Inverted columns, flagged per CLAUDE.md §12: **LTM Total Debt/EBITDA** (higher = worse) and **Credit** (the Credit Health Panel scale runs 1 = best to 4 = worst, so higher = worse). "NM" is the vendor's own not-meaningful tag, produced by a negative or near-zero denominator. "–" is a blank cell.

**Columns that cannot be populated, stated rather than guessed:**
- **ROIC — no peer return-on-capital, ROCE or ROE column exists anywhere in this pool**, for any peer, in either direction. `08_competitive-map.md §2A` reaches the same conclusion and `09_moat.md §3` records it as a named gap. So a "TTWO earns more (or less) than peers on capital" claim is **not evidenceable here** and is not made. TTWO's *own* return on capital is available and is used in §4 as absolute evidence, not as a peer comparison.
- **FCF yield — no peer cash-flow or capex line exists in the comps export**, so no peer FCF yield can be computed on a matched basis. The column is therefore omitted from the table rather than filled with a web-scraped mix of definitions. No web substitute was used because a per-peer FCF yield assembled from ten different unverified sources on ten different definitions would be worse evidence than its absence.
- **Dividend yield — not quoted.** TTWO has never paid a dividend and does not expect to [`FY26 10-K, Item 5`], so the comparison has no subject side.
- **P/TangBV for TTWO is NM** because tangible book value per share is **negative** on the vendor's definition (−6.55, which also excludes the 2,494.9 of capitalised software development costs) [`01` §6, which reproduces the vendor figure exactly]. A positive figure of +6.78 exists on the narrower goodwill-and-intangibles-only definition. Neither is usable for a peer comparison: the peer P/TangBV column runs from 0.6x to 98.1x — a 163-fold spread that reflects differences in how much development cost each company capitalises, not differences in value. **This multiple is excluded from all value work below.**

### Two recomputations that matter, both done inside the frozen capability

**(1) The vendor's own LTM EV/EBITDA for TTWO does not tie to its own LTM EBITDA, and the correction widens the premium.** The Trading Multiples tab prints TTWO's LTM TEV/EBITDA as **52.2x**. Recomputing it from the two figures the vendor itself publishes on the adjacent tab: vendor TEV 41,790.1 ÷ LTM EBITDA 724.9 = **57.65x**; on the canonical EV of 41,922.7 it is **57.83x** [`CIQ Comps → Financial Data`, As-Of 2026-11-19; `01` §4]. The published 52.2x implies an EBITDA denominator of 41,790.1 ÷ 52.240907 = **800.0**, and 52.240907 is the exact close figure in the final (2026-11-18) column of `CIQ Financials_Quarterly → Multiples`, "TEV/LTM EBITDA". So the two tabs use different EBITDA denominators (800.0 vs 724.9) for the same company on the same date — a roughly 10% internal basis gap inside one workbook, which the absent `numeric_reading_check` could not have caught. **Consequence, stated conservatively: the published 52.2x is the figure used in the comparison table for consistency with how the peer column was computed, and the recomputed 57.6–57.8x is shown alongside. The correction makes TTWO's trailing premium larger, not smaller, so nothing below depends on which is used.**

**(2) TTWO's forward consensus stack is internally consistent — and it is on the company's management-reporting (non-GAAP) basis, not GAAP.** From `CIQ Estimates → Multiples` (header: "Acctg. Standard: US GAAP", "**Dilution: Basic**") at vendor TEV 41,790.1 and price 216.61: NTM revenue 9,906.3, NTM EBITDA 2,349.1, NTM EBIT 2,240.6, NTM EPS 9.61. The implied NTM depreciation and amortisation is 2,349.1 − 2,240.6 = **108.5** — against an actual LTM D&A of 837.4 (LTM EBITDA 724.9 less LTM EBIT −112.5) and FY27 guided amortisation of acquired intangibles alone of 572 + 51 = **623** [`TTWO 2Q27 Earnings Release, 2026-11-09, Outlook for Fiscal Year 2027`]. The stack reconciles exactly on the company's own management basis: (NTM EBIT 2,240.6 − interest 29) × (1 − 0.18 management tax rate) ÷ 187.2 basic shares = **9.69**, against the 9.61 printed. The same test at the full-year level: consensus FY2027 EPS is 216.61 ÷ 31.4207 = **6.89**, while the company's **GAAP** FY27 diluted EPS guidance is **$0.57 to $0.75**; rebuilding guidance onto the management basis — pretax midpoint 223.5 + change in deferred net revenue 47 + stock-based compensation 462 + amortisation of acquired intangibles 623 + other 3 = 1,358.5, taxed at the stated 18%, over the guided 189.5m shares — gives **5.88**, i.e. consensus sits about 17% above management-basis guidance rather than nine times above GAAP guidance. Consensus FY27 EBITDA of 41,790.1 ÷ 24.6871 = **1,692.8** against management-basis guided EBITDA of 1,053 + 47 + 462 + 3 = **1,565**, about 8% above. *(My arithmetic, from the sources cited.)*

**Why this is a comparability limitation and not a curiosity.** TTWO's NTM EBITDA of 2,349.1 and NTM EPS of 9.61 are struck on a basis that adds back stock-based compensation (462 in FY27), amortisation of acquired intangibles (623), and the change in deferred net revenue (47), and applies an 18% management tax rate. **Whether each peer's Capital IQ consensus carries equivalent add-backs is not disclosed anywhere in this pool and is not knowable from it.** CIQ consensus is built from contributing analysts' own definitions, which differ by company. So the forward comparison below is the best available and the only forward comparison possible — but it is not a proven like-for-like, and that uncertainty is carried into the confidence statement in §7 rather than dropped. *Inference, not from filings*, for the add-back identification; the arithmetic above is from the cited sources.

---

## 3. Premium / Discount to Peer Median

`premium / (discount) = (company multiple − peer median) ÷ peer median`. Positive = premium. All of these are **price multiples**, not yields, so higher = premium throughout; no yield metric appears in this table, so the yield sign-inversion does not arise here (and the one yield that might have — dividend yield — does not exist for TTWO).

### 3a. Against the full ten-peer median

| Multiple | Basis | Company | Peer Median | Premium / (Discount) |
|---|---|---:|---:|---:|
| EV/Sales | LTM | 6.5 | 2.5 | **+160.0%** |
| EV/EBITDA | LTM | 52.2 *(57.6–57.8 recomputed)* | 13.0 | **+301.5%** *(+344.9% recomputed)* |
| EV/EBIT | LTM | **NM** — LTM EBIT is −112.5 | 13.6 | **Not computable** |
| P/E | LTM | **NM** — LTM diluted EPS is −1.29 | 21.3 | **Not computable** |
| P/TangBV | LTM | **NM** — tangible book is negative (−6.55/share) | 3.6 | **Not computable, and excluded** (peer spread 0.6–98.1x) |
| **EV/Sales** | **NTM** | **4.22** | **2.40** | **+75.8%** |
| **EV/EBITDA** | **NTM** | **17.79** | **9.96** | **+78.6%** |
| **P/E** | **NTM** | **22.54** | **21.17** | **+6.5%** |
| FCF yield | — | *no peer data in pool* | — | **Not assessable** |
| Dividend yield | — | *none paid, none expected* | — | **Not applicable** |

### 3b. Against a quality-matched sub-set median — the exclusions are stated before the result

The ten-peer median is dragged by four names whose multiples price something other than a going-concern game publisher of TTWO's type. Exclusion criteria, set out before the numbers are looked at:

| Excluded | Why excluded | Its NTM EV/EBITDA |
|---|---|---:|
| Ubisoft | **Distressed.** LTM EBITDA margin −81.5%, revenue −21.8%, no LTM EBITDA or EBIT multiple computable. A 2.2x forward multiple prices a turnaround, not an operating comparable | 2.20 |
| Playtika | **Controlled and negative-equity.** Operates "as a subsidiary of Playtika Holding UK II Limited"; total debt/capital 116.7% because shareholders' equity is negative; debt/EBITDA 3.5x; S&P BB−. Its 3.62x forward P/E reflects control and leverage, not the business | 3.67 |
| tinyBuild | **Scale.** LTM revenue 38.6 = 0.6% of TTWO's; market capitalisation 56.8 | 7.37 |
| PLAYSTUDIOS | **Scale and not computable.** LTM revenue 217.7 = 3.4% of TTWO's; market capitalisation 59.4; negative LTM EBIT; NTM EV/EBITDA and NTM P/E both NM | NM |

Retained (five): **Roblox, Nintendo, 37 Interactive, NEXON, Konami**. Electronic Arts is retained as a transaction comparable only (§4), because it has no public multiples.

| Multiple | Basis | Company | Sub-set median (n) | Premium / (Discount) | Sub-set mean | Sub-set range |
|---|---|---:|---:|---:|---:|---:|
| **EV/EBITDA** | **NTM** | **17.79** | **15.14** (n=5) | **+17.5%** | 17.25 | 8.88 – 25.95 |
| **EV/Sales** | **NTM** | **4.22** | **4.00** (n=5) | **+5.5%** | 3.83 | 1.69 – 5.99 |
| **P/E** | **NTM** | **22.54** | **24.34** (n=4; Roblox NM) | **(7.4%) — a discount** | 23.18 | 12.00 – 32.04 |

**Both medians are published, and the honest framing is stated plainly: all four excluded names carry low multiples, so the sub-set median is higher by construction.** That is the point of showing both rather than choosing one silently. Two facts argue the sub-set is not one-sidedly assembled: the two **highest** multiples in the whole forward set (Roblox 25.95x, Nintendo 25.24x) are both retained, and the lowest-multiple retained name (37 Interactive, 8.88x, with revenue falling 10.2%) is kept even though dropping it would raise the median further. Every implied value in §5 is run off **both** medians, and the spread between them is the dominant source of dispersion in this method.

**Is the gap typical or unusual? — Not assessable.** This pool contains only the current peer cross-section; there is **no peer-group or peer-level multiple history** in the comps workbook, on any multiple, for any date before 2026-11-19 [`CIQ Comps → Trading Multiples`, which carries a single As-Of column; confirmed as a named gap in `00_valuation-data-triage.md` §5]. So whether TTWO's current +78.6% forward EV/EBITDA premium to the ten-peer median is in line with, wider than, or narrower than its typical relationship to these same peers over the past three years **cannot be measured and is not guessed**. This is the distinct and more informative question — a persistent premium is usually structural and already priced, whereas a newly-widened one is the actual signal — and it is the one question this pool cannot answer. It is **not** substituted with TTWO's own absolute multiple history, which is a different statistic and belongs to `02_multiples-own-history`.

---

## 4. Is the Gap Warranted?

**On the quality evidence, TTWO does not deserve a premium to this peer group, and the headline conclusion is: the premium is unjustified (relative downside) — but the size of the unjustified premium is far smaller than the ten-peer median suggests, and on one forward multiple it is not a premium at all.**

The quality case against a premium is specific and cited. `business-model/07_business-quality.md` scores aggregate quality **38/100 (Weak)**, with cyclicality 22, competitive intensity 25, margin stability 30 and industry rate-of-change 35 — the last of which triggers the CLAUDE.md §24 Filter 5 flag that this is a sector / technology-cycle bet. `business-model/09_moat.md` returns **"No moat proven"** with trajectory **eroding (not confirmed)**, because return on capital is below cost of capital on every basis tested: **−0.7% through-cycle (5-year) ROIC and −2.2% LTM against a ~8.2% cost of capital**, a gap of 890 to 1,040 basis points, with the conclusion surviving the full 7.8–9.1% sensitivity range. The permanent capital destruction is on the balance sheet: **5,887.3 of accumulated goodwill impairment against 6,949.2 of gross goodwill — about 85% of all goodwill the company ever recorded — taken explicitly for "industry conditions and changes in our strategies"** [`FY26 10-K, Note 9, pp.83–84`]. On leverage TTWO is the second-worst in the set: **total debt/EBITDA 3.6x against a peer median of 0.6x**, and the Credit Health Panel scores it **Overall 4** (1 = best) against a peer median of 2.5, with Liquidity 4 [`CIQ Comps → Operating Statistics` and `→ Credit Health Panel`, As-Of 2026-11-19]. Its 5-year beta of 0.92 is above the peer median 0.65. Governance adds a qualifier rather than a cap: the management-governance synthesis verdict is "Misaligned or weak stewardship" with **no** hard disqualifier and **RF-OWN-004 not fired**, so the §24 Filter 6 value-trap cap does not bind [`00_valuation-data-triage.md` §4].

**Two things genuinely argue the other way, and both must be credited or the discount gets charged twice.** First, **growth**: TTWO's NTM long-term EPS growth rate is **25.75%**, the highest figure in the whole set, against a peer median of 10.05% — though only three peers disclose one (Nintendo 10.05%, NEXON 6.29%, Konami 24.61%), so the median rests on three observations and is judgment informed by a three-observation sample, not a measured distribution [`CIQ Comps → Operating Statistics`, "NTM LT EPS Growth Rate"]. Growth beyond the next twelve months is **not** in an NTM denominator, so this is a legitimate reason for a forward-multiple premium. Second, **credit standing**: TTWO's S&P issuer rating of **BBB** is the highest in the set — above Roblox (BBB−), Playtika (BB−) and EA post-buyout (BB−), with Nintendo and Konami unrated. Third, and decisively for the double-count test in §5: on the **forward** numbers TTWO's margin is **above** the matched sub-set, not below. NTM EBITDA margin: TTWO 2,349.1 ÷ 9,906.3 = **23.71%**, against Roblox 16.71%, Nintendo 15.85%, 37 Interactive 19.05%, NEXON 28.15%, Konami 39.57% — a sub-set median of **19.05%**. The −920bp gross-margin and −1,770bp EBIT-margin gaps that `07_business-quality.md` measured are **LTM** gaps, measured inside a pre-launch trough; they do not describe the forward period any peer multiple is being applied to.

**The one independent corroborating read — a transaction comp, not another market multiple.** CLAUDE.md §16 requires that convergence only counts between methods with different input sets. The EA take-private is exactly that: a negotiated change-of-control price for the closest business in the set, set by a buyer consortium rather than by the same daily market that sets the peer multiples. Combining the web-sourced deal value with EA's own figures in this pool: implied EV ≈ 55,000 − EA LTM net cash 533 = **54,467**; against EA LTM revenue 7,846 that is **6.94x EV/Sales**; against LTM EBITDA 1,726, **31.56x**; against LTM EBIT 1,405, **38.77x**; and $210.00 ÷ LTM diluted EPS 4.28 is a **49.1x P/E** [deal terms `Web: cnbc.com / hollywoodreporter.com, 2025-09-29; closing acquiry.com / tech-insider.org, Aug-2026 — web-sourced as of 2026-11-20, unverified`; EA financials `CIQ Comps → Financial Data`, LTM to 2026-06-30 — tier-5 vendor export; the division is my arithmetic]. Four caveats sit on it, all of which push the same way — it is an **upper bound**: the price was struck on September-2025 information while the LTM window used here ends June-2026; a change-of-control price contains a control premium a minority public holder does not receive; the buyer was a sovereign fund with strategic as well as financial objectives; and EA's LTM EBITDA margin of 22.0% is roughly double TTWO's LTM 11.3%, so the same EV/Sales multiple buys twice the profit at EA. **What it tells us anyway, and it is the single most useful number in this report: TTWO's current LTM EV/Sales of 6.5x is 94% of the 6.94x that a sovereign-backed consortium paid for outright control of a larger, higher-margin, better-capitalised competitor.** TTWO's public minority price already sits within 6% of a control price for its closest comparable.

**Verdict: the premium is unjustified (relative downside) — with the magnitude dependent on which peer median is treated as the reference, which is why the dispersion in §5 is wide.** Against the full ten-peer median the forward EV/EBITDA premium is +78.6% and no quality evidence in this run supports it: no moat proven, return on capital below cost of capital for five consecutive years, quality 38/100, the highest leverage and the worst credit-health score in the set. Against the quality-matched sub-set the premium is only +17.5% on forward EV/EBITDA and +5.5% on forward EV/Sales, and on forward P/E TTWO is 7.4% **below** the sub-set median — a gap that TTWO's highest-in-set growth rate and highest-in-set credit rating plausibly cover, while its leverage and absent moat argue the other way. The two offset, and no evidence in this pool sizes which wins. Note what the forward denominator already is: **a Grand Theft Auto VI launch-year number** (NTM revenue 9,906.3 is 54.6% above LTM 6,409.7; NTM EBITDA 2,349.1 is 224% above LTM 724.9). The forward multiple is therefore already being applied to peak-cycle earnings while peers' forward metrics are ordinary-year numbers — a mismatch that makes TTWO's 17.79x forward EV/EBITDA look lower against the 15.14x sub-set median than a like-for-like comparison would, and that no multiple adjustment can fix, because it lives in the metric, not the multiple.

---

## 5. Implied Value from Peer Multiples

**Basis discipline (MODULE_RULES Calculation Standard 4).** Every forward peer multiple is applied to a **forward (NTM)** company metric and every trailing multiple to a trailing one — never crossed. TTWO's trailing earnings multiples do not exist (LTM EBIT −112.5, LTM diluted EPS −1.29), so **no trailing earnings-based implied value is produced at all** and none is faked from a forward number. The equity bridge uses the **canonical filing-based strict net debt of 1,370.4** and the **188.0m** per-share count from `01` §7, not the vendor's own bridge; the one-line reason for the difference is Reconciliation Gate 1 (the filing-based figure is canonical when `balance-sheet-survival/01` produced one in the same run root). The vendor's own `Implied Valuation` tab uses net debt 1,237.8 (broad cash, lease-inclusive debt) and 187.21 shares, which produces per-share figures roughly 0.8% higher; both are shown where they differ materially.

`Implied EV = peer multiple × TTWO NTM metric` → `Implied equity = Implied EV − 1,370.4` → `Implied price = Implied equity ÷ 188.0`. For P/E the multiple applies directly to earnings per share, with no net-debt bridge; TTWO's NTM EPS of 9.61 is on the vendor's **basic** count, so it is restated to the 188.0m diluted count used everywhere else: net income 9.61 × 187.2 = 1,799.0, ÷ 188.0 = **9.569** diluted.

| Multiple | Basis | Applied Peer Multiple | Company Metric | Implied EV / Equity | Implied Price/Share | vs Current Price 216.61 |
|---|---|---:|---:|---|---:|---:|
| **EV/EBITDA — BASE CASE** | NTM → NTM | **15.14x** (quality-matched sub-set median, n=5, unadjusted) | NTM EBITDA 2,349.09 | EV 35,565.2 → Eq 34,194.8 | **181.89** | **−16.0%** |
| EV/EBITDA | NTM → NTM | 9.96x (full ten-peer median) | NTM EBITDA 2,349.09 | EV 23,396.9 → Eq 22,026.5 | 117.16 | −45.9% |
| EV/EBITDA | NTM → NTM | 12.44x (full-set mean) | NTM EBITDA 2,349.09 | EV 29,222.7 → Eq 27,852.3 | 148.15 | −31.6% |
| EV/EBITDA | NTM → NTM | 17.25x (sub-set mean) | NTM EBITDA 2,349.09 | EV 40,521.8 → Eq 39,151.4 | 208.25 | −3.9% |
| EV/Sales | NTM → NTM | 4.00x (sub-set median) | NTM revenue 9,906.32 | EV 39,625.3 → Eq 38,254.9 | 203.48 | −6.1% |
| EV/Sales | NTM → NTM | 2.40x (full-set median) | NTM revenue 9,906.32 | EV 23,775.2 → Eq 22,404.8 | 119.17 | −45.0% |
| *EV/Sales, margin-scaled* | NTM → NTM | *4.98x = 4.00 × (23.71% ÷ 19.05%)* | NTM revenue 9,906.32 | *EV 49,318.4 → Eq 47,948.0* | *255.04* | *+17.7%* |
| P/E | NTM → NTM | 24.34x (sub-set median, n=4) | NTM diluted EPS 9.569 | — (direct equity multiple) | 232.91 | +7.5% |
| P/E | NTM → NTM | 21.17x (full-set median) | NTM diluted EPS 9.569 | — | 202.58 | −6.5% |
| **Memo — sanity check on the bridge** | NTM → NTM | 17.79x (TTWO's **own** current multiple) | NTM EBITDA 2,349.09 | EV 41,790.3 → Eq 40,419.9 | 215.00 | −0.7% |
| *Memo — transaction comp (upper bound)* | LTM → LTM | *6.94x EV/Sales (EA take-private)* | *LTM revenue 6,409.7* | *EV 44,483.3 → Eq 43,112.9* | *229.32* | *+5.9%* |

The memo row is the bridge's own check: applying TTWO's own current forward multiple to its own forward metric returns 215.00 against the observed 216.61 — a 0.7% gap, which is exactly the canonical-versus-vendor net debt difference (132.6) plus the 188.0-versus-187.2 share-count difference. The bridge has no plug.

**Base case (the point `07` weights): USD 181.89 per share**, from the quality-matched sub-set median forward EV/EBITDA of 15.14x applied to NTM EBITDA of 2,349.09, bridged at canonical strict net debt 1,370.4 over 188.0m diluted shares. That is **−16.0%** against the price of 216.61 as-of 2026-11-19.

**Dispersion, shown separately and it is wide: USD 117.16 to USD 232.91** across the three usable multiples and both peer-median definitions — a 99% spread from low to high. Narrower bands within it: **181.89 to 232.91** using only the quality-matched sub-set across all three multiples, and **117.16 to 202.58** using only the full ten-peer median. **The dominant driver of that dispersion is not the choice of multiple — it is the choice of comparable set**, which is a judgment this pool cannot settle because it holds no peer-multiple history against which to test which set has historically tracked TTWO.

### Quality-adjustment ledger — the DOUBLE-COUNT TEST (CLAUDE.md §16), run on every multiple used

| Multiple adjusted | Peer median | Adjusted to | Gap already in the denominator? | What the extra adjustment pays for | How it was sized |
|---|---:|---:|---|---|---|
| **EV/EBITDA (NTM)** — base case | 9.96x full set / **15.14x sub-set** | **15.14x — no adjustment applied to the multiple** | **YES** — EV/EBITDA is earnings-based. Applying any peer multiple to TTWO's own NTM EBITDA of 2,349.09 has already priced TTWO's own profitability once | **Nothing.** No haircut and no premium applied | **Not sized — deliberately not applied.** The move from 9.96x to 15.14x is a change of **comparable set** (four distressed / controlled / micro-cap names excluded on criteria stated ex-ante in §3b), **not** an adjustment to a multiple. Two legitimate non-denominator adjustments were identified and judged to offset: a **premium** for growth the denominator does not carry (NTM LT EPS growth 25.75% vs a three-observation peer median of 10.05%) and for the set's highest credit rating (BBB); against a **discount** for durability and risk the denominator also does not carry (no moat proven, five consecutive years of ROIC below cost of capital, 3.6x debt/EBITDA vs peer median 0.6x, worst Credit Health score in the set at 4). No evidence in this pool sizes either side, so neither is applied and confidence is capped instead (§7) |
| EV/Sales (NTM) | 2.40x full set / 4.00x sub-set | 4.00x unadjusted **(base)**; 4.98x shown as a labelled sensitivity only | **NO** — revenue is margin-blind, so a profitability adjustment is legitimate **here and only here** | On this multiple a margin adjustment would be a **premium, not a haircut**: TTWO's NTM EBITDA margin of 23.71% is **above** the sub-set median of 19.05% | 4.00 × (23.71% ÷ 19.05%) = **4.98x** → 255.04/share. **Kept out of the base case** for a stated reason: 23.71% is a Grand-Theft-Auto-VI-launch-year margin while the peer denominators are ordinary-year margins, so scaling by it capitalises a one-year peak. Shown so the reader can see the direction the only legitimate margin adjustment actually points |
| P/E (NTM) | 21.17x full set / 24.34x sub-set | Both shown unadjusted | **YES** — earnings-based; TTWO's own forward earnings already carry its own profitability | **Nothing.** No haircut applied | Not sized — deliberately not applied, same reasoning as EV/EBITDA. The separate limitation on this multiple is **basis**, not quality: TTWO's NTM EPS is demonstrably on the company's management-reporting basis (§2, recomputation 2), and whether each peer's consensus EPS carries the same add-backs is undisclosed. That is a comparability gap, not a quality gap, and it is handled by capping confidence rather than by moving the multiple |
| P/TangBV (LTM) | 3.6x | **Not used at all** | NO — book value is return-blind, so an adjustment would be legitimate in principle | n/a | **Excluded.** TTWO's tangible book is negative (−6.55/share), so the multiple is NM for the subject, and the peer column spans 0.6x to 98.1x — a 163-fold spread driven by differing development-cost capitalisation, not by value. No value is derived from it |
| EV/EBIT, P/E (LTM) | 13.6x, 21.3x | **Not used at all** | — | n/a | **Not computable.** LTM EBIT is −112.5 and LTM diluted EPS is −1.29. No trailing earnings multiple is produced, and no forward metric is substituted into a trailing multiple |

**The specific error this ledger exists to prevent, named so it is auditable.** The margin-ratio haircut would have been easy to write here and would have been wrong twice over. `07_business-quality.md` measures TTWO's LTM EBIT margin at −1.8% against a peer median of +15.9%, and its LTM gross margin at 57.7% against 66.9%. Pushing either of those ratios through an earnings multiple — `15.14x × (57.7% ÷ 66.9%) = 13.06x`, or any variant of it — is the double count in its purest form: the peer multiple is already being applied to **TTWO's own** EBITDA, which already embeds TTWO's own margin, so the shortfall would be charged a second time and the base case would fall from 181.89 to roughly 161.0 per share, a knowable 11.5% of value destroyed by arithmetic rather than by evidence. **That formula is not used anywhere in this report.** It would also have been directionally wrong on the forward period actually being valued, where TTWO's 23.71% NTM EBITDA margin sits *above* the 19.05% sub-set median.

**Financial cross-check (bank / insurer dual-read): not applicable.** TTWO is an **Operating** company — an interactive-entertainment publisher with one operating and reportable segment [`FY26 10-K, Note 21`; `00_valuation-data-triage.md` §3]. Per the Business-Type Method Map, EV-based multiples and forward P/E are the valid primary multiples; P/tangible book, ROTE and the `P/TBV = P/E × ROTE` identity are financial-issuer tools and are not used. The P/TangBV column is excluded on its own merits above, not merely as inapplicable.

**Independence check on the one convergence that appears (CLAUDE.md §16).** The sub-set mean read (208.25) and the EA transaction comp (229.32) both land within about 6% of the current price, and the sub-set median base case (181.89) sits 16% below it. **Only the EA read is independent evidence**, because its input set is a negotiated change-of-control price rather than the same daily market quotation that sets every peer multiple here — and even that read is an upper bound for the four reasons listed in §4. `02_multiples-own-history` runs in the same layer as this agent and was not read; if its band lands near 181.89, **that would be a coincidence to explain, not corroboration**, because `02` measures where the market has already priced TTWO and therefore cannot confirm a claim about whether the market is pricing TTWO correctly. The three peer-multiple reads here are also **not** three independent methods: they share one vendor engine, one as-of date, one comparable set and one forward-estimate stack, so their agreement carries far less weight than three separate rows imply.

---

## 6. Sector Cycle Reality Test

**Not assessable — no sector-level multiple history.** The peer-group aggregate multiple over the last 3–5 years cannot be sourced: `CIQ Comps → Trading Multiples` carries a **single As-Of column (2026-11-19)** and no historical series for any peer on any multiple, and no sector index or ETF multiple series exists anywhere in this pool [confirmed as a named gap in `00_valuation-data-triage.md` §5: *"The peer workbook carries only current (2026-11-19) peer multiples — no peer-group or sector-index multiple history 3–5 years back"*]. **A web attempt was made and its output was rejected on quality grounds, which is recorded rather than hidden:** a search for peer and sector EV/EBITDA levels 3–5 years ago returned only retail aggregator pages (gurufocus, multiples.vc, financecharts, marketscreener) with no primary citation, no stated multiple definition, and figures internally inconsistent with the pool's own vendor data — the same search's TTWO reading of roughly 24x for November 2026 contradicts the pool's 52.2x published and 57.6x recomputed for the same date. Figures that cannot be reconciled with a tier-5 export on the same company on the same day cannot be the basis for a mechanical cap on a peer anchor, so **no cycle-elevated or cycle-depressed flag is fired and no `RF-VAL-001` / `RF-VAL-002` tag is emitted.**

Per the Score Cap Rules this honest absence **carries no cap by itself** ("an honestly-absent check is not a defect"), **but it is a named gap that `99_valuation-synthesis` must record in its Reconciliation so it is visible rather than silently skipped**, and if `02_multiples-own-history` also returns "Not assessable" on the same test — which the triage anticipates it will, for the same reason — then neither multiples method has a verified stable anchor, and the compounding rule's premise (two same-direction flags) is untested rather than cleared. What can be said without the data is a limit, not a finding: **the peer median of 9.96x forward EV/EBITDA, and the sub-set median of 15.14x, are both single-day snapshots of a sector that has visibly repriced within this very comp set** — Nintendo and Roblox at ~25x forward EBITDA sit beside Ubisoft at 2.2x and Playtika at 3.67x. A 12-fold spread inside one eleven-company industry on one day is itself evidence that these levels are not a settled "normal", even though the direction and size of the sector's own re-rating cannot be measured here.

---

## 7. Relative Read

**On the mechanical ten-peer median TTWO carries a +78.6% premium on forward EV/EBITDA (17.79x against 9.96x) and +75.8% on forward EV/Sales, while its forward P/E premium is only +6.5% and every trailing earnings multiple is not computable because LTM EBIT is −112.5 and LTM diluted EPS is −1.29. That premium is not warranted by anything in this run's quality evidence — no moat proven, return on capital below cost of capital for five straight years (−0.7% through-cycle, −2.2% LTM, against ~8.2%), business quality 38/100, the second-highest leverage in the set at 3.6x debt/EBITDA against a peer median of 0.6x, and the worst Credit Health score in the set — so the honest verdict on the mechanical read is: premium unjustified, relative downside.** But most of that headline premium is an artefact of comp-set composition: once four distressed, controlled or micro-cap names are excluded on criteria stated in advance, the forward EV/EBITDA premium falls to **+17.5%**, forward EV/Sales to **+5.5%**, and forward P/E becomes a **7.4% discount** — a gap TTWO's highest-in-set forward growth rate (25.75%) and highest-in-set credit rating (BBB) plausibly cover, while its missing moat and its leverage argue the other way, with nothing in this pool to size which wins.

**The implied value: a base-case point of USD 181.89 per share** (quality-matched sub-set median forward EV/EBITDA of 15.14x on NTM EBITDA of 2,349.09, bridged at canonical strict net debt 1,370.4 over 188.0m diluted shares), **−16.0%** against the 216.61 close of 2026-11-19, **with a separate and wide dispersion of USD 117.16 to USD 232.91** whose dominant driver is the choice of comparable set rather than the choice of multiple. No quality haircut was applied to any earnings-based multiple, and the margin-ratio formula that would have cut the base case to roughly 161.0 per share was tested and rejected as a double count — the only multiple where a margin adjustment is legitimate (EV/Sales) points *up*, not down, because TTWO's forward EBITDA margin of 23.71% is above the matched sub-set median of 19.05%.

**Three limits must travel with this read, and the first is the one that matters most.** First, **the peer-median anchor's stability is Not assessable** (§6) — no peer-group or sector multiple history exists in this pool and the web substitute was rejected as unreconcilable — so being "+17.5% above a matched peer median" is not the same statement as being fairly priced: it is a position relative to a one-day snapshot of a sector whose own forward multiples span 2.2x to 25.95x, and if `02`'s own-history band is also flagged or also returns "Not assessable", the two multiples methods do not between them establish a verified anchor at all. Second, **the forward denominator is a launch-year peak** — NTM revenue is 54.6% above LTM and NTM EBITDA 224% above it, measured against peers' ordinary-year forward metrics, which flatters TTWO's forward multiples in a way no multiple adjustment can correct. Third, **the one genuinely independent read is a transaction comp and it is an upper bound**: Electronic Arts, the closest business in the set, was taken private at USD 210.00 per share / about USD 55bn, closing 2026-08-04, which works out to roughly **6.94x LTM EV/Sales** — and TTWO's public minority price today is **6.5x**, or 94% of what a sovereign-backed consortium paid for outright control of a larger competitor earning twice TTWO's trailing EBITDA margin. **Source-check status remains UNCHECKED, not clean**, and the forward comparison is not a proven like-for-like because TTWO's consensus stack is demonstrably on its own management-reporting basis while each peer's consensus basis is undisclosed; both qualifiers must be carried, not dropped.



---

## valuation / 04_intrinsic-dcf.md

_Source: `04_intrinsic-dcf.md`_

# Intrinsic DCF — TTWO

**Company:** Take-Two Interactive Software, Inc. (NasdaqGS:TTWO) · **Run date:** 2026-11-20
**Reporting standard:** US GAAP · **Reporting currency:** USD, millions unless stated · **Fiscal year ends 31 March** ("FY2027" = 1 Apr 2026 → 31 Mar 2027, not a calendar year) [`FY26 10-K, cover page`; `Q2 FY27 10-Q, cover page`].
**Valuation date for discounting:** **2026-09-30** — the balance-sheet date behind the canonical net-debt anchor. Price anchor is 2026-11-19 (a 7-week gap, inherited from `01`).

**Business-type gate applied.** `00_valuation-data-triage` §3 classifies TTWO as an **OPERATING** company (interactive-entertainment publisher, **one** operating and reportable segment) — not a financial, REIT, commodity producer or holding company [`FY26 10-K, Note 21`]. Per the Business-Type Method Map an **FCFF DCF plus an EV→equity bridge is the valid intrinsic method**, so that is what is built below. One overlay binds hard: `business-model/07_business-quality.md` scores **cyclicality 22/100** and `10_external-dependency.md`/`09_moat.md` both describe a release-slate cycle, so the **Cyclicality Gate** applies — the FCF base and the terminal margin are normalized mid-cycle figures, benchmarked in §5 against peer-normal **and** the company's own prior-trough, never a single peak or trough year.

**Source-check status carried forward: UNCHECKED, not verified clean.** This frozen generation carries **no `numeric_reading_check`** at any source or sheet level and the corpus carries no labelled extractor reading-warning annotation. There is therefore **no literal warning token, no source/extract reference and no LF-line/column span to quarantine, and no amount below is marked not-proven on that basis** — but a missing check means **unchecked, not clean**. Every value-determining figure in this report was read directly from the frozen extract of the document that reports it: the FY26 10-K (`10K_2025_26_0001628280-26-037434`), the Q2 FY27 10-Q (`10Q_2Q_0001628280-26-072254`) and the 2026-11-09 earnings release. Capital IQ workbook tabs are used only where the filings do not disclose the line (the long-dated estimate series, the beta, peer margins), and are labelled as the tier-5 vendor exports they are. Every restating layer must carry this qualifier forward.

**Cross-module inputs used.** `valuation/00` (triage, caps), `valuation/01` (price, shares, net debt, EV — adopted verbatim), `earnings/01_historical-financials` (FCF, capex, working-capital base), `earnings/04_guidance-consensus` (FY2027 guidance and consensus, with the Net-Bookings-vs-GAAP and management-basis-vs-GAAP bridges already proven there), `earnings/03_margin-drivers`, `earnings/06_earnings-quality`, `earnings/07_earnings-sensitivity`, `business-model/07_business-quality` (through-cycle anchors, rate-of-change 35), `business-model/09_moat` (the canonical 21.0% normalized tax rate, the 8.2% CAPM cross-check, the "No moat proven" verdict and the eroding-but-unconfirmed trajectory), `business-model/10_external-dependency` (cyclicality).

---

## 1. FCF Base & Normalizations

**The base is FORWARD, not trailing, and this is forced by the data, not chosen.** The trailing earnings base is negative — LTM EBIT **−112.5** on the vendor read and **−180.8** derived from the filings, LTM diluted EPS **−1.29**, LTM §15 FCF (CFO − total capex) only **62.6** (367.1 − 304.5) [`CIQ Financials_Quarterly → Income Statement / Cash Flow`, LTM Sep-30-2026; `earnings/01` §2]. A DCF cannot be grown off a negative or near-zero base. The explicit forecast therefore starts from **FY2027 (year ending 2027-03-31) on the company's own 2026-11-09 guidance**, with the already-reported half (H1 FY27) stripped out so nothing is double-counted (§4).

**Base year = FY2027. Reporting currency = USD, millions.**

| Item | Base-Year Value (FY2027) | Normalization Applied | Source |
|---|---:|---|---|
| Revenue (GAAP total net revenue) | **8,080.0** | Guidance midpoint of $7,980–8,180m. **Not** the Net Bookings range ($8,000–8,200m) and **not** the consensus Net-Bookings figure of 8,554.7 — basis labelled, bases not mixed | `TTWO 2Q27 Earnings Release, 2026-11-09, "Outlook for Fiscal Year 2027"` |
| EBIT (GAAP income from operations) | **252.5** | Built from the guidance table's own midpoints: 8,080.0 − cost of revenue 3,739.5 − operating expenses 4,088.0 = **252.5**. Management's caveat carried: "the individual components … may not foot to the totals" | same release, Outlook table |
| Normalized effective tax rate | **21.0%** | **Reconciled to the canonical cross-module rate.** `business-model/09_moat.md` §3 published **21.0%** as the normalized structural rate and instructed this DCF to use it. Reported FY26 effective rate was **(50.8)%** — a single-year distortion. What was stripped (quoted from the moat build): the full valuation allowance on US net deferred tax assets, the **$45.7** software-development tax-credit benefit (+1.2% in the rate reconciliation), the foreign-earnings effect (−0.5%), and goodwill-impairment-related non-deductible items; state and local tax net of federal benefit adds +0.4%, so 21.4% is the fuller structural rate and **21.0% is used**. The moat ROIC and this DCF therefore do **not** diverge on the tax rate | `FY26 10-K, Note — Income Taxes (rate reconciliation)`; `business-model/09_moat.md` §3 Build 1 |
| NOPAT | **199.5** | 252.5 × (1 − 0.21) | arithmetic, §4 snippet |
| Stock-based compensation | **charged, NOT added back (−462 inside EBIT)** | SBC is a real cost of paying employees (§15: no silent use of management-adjusted numbers). The company's own FY2027 outlook implies **$462m** of SBC in the GAAP-to-management bridge; H1 FY27 actual was **176.0**. The vendor's "EBITDA" and "EPS Normalized" consensus fields **add SBC back** (`earnings/04` proved both bridges to the cent) — those are management-basis figures and are **not** used as cash | `TTWO 2Q27 Earnings Release, 2026-11-09, p.2` (outlook bridge); `Q2 FY27 10-Q, Condensed Consolidated Statements of Cash Flows (six months)` |
| Acquired-intangible amortization | **604.6 (added back as non-cash)** | Taken from the filing's **own forward schedule**, not extrapolated: FY2027 604.6, FY2028 554.1, FY2029 205.2, FY2030 111.5, FY2031 38.2 | `FY26 10-K, Note 9 (Goodwill and Intangible Assets, Net), p.85 — "Estimated future amortization of intangible assets"` |
| Content (software development) cash spend | **888.8 = 11.0% of revenue** | The largest discretionary spend and it sits **inside** operating cash flow, not capex: 688.9 (FY26), 691.6 (FY25), 603.4 (FY24) = 10.4% / 12.3% / 11.3% of revenue. Held at 11.0%, inside the observed band | `FY26 10-K, Consolidated Statements of Cash Flows`; `Q2 FY27 10-Q, Statements of Cash Flows` (H1 FY27 actual 372.4) |
| Content amortization | **606.0 = 7.5% of revenue (added back as non-cash)** | FY26 actual 385.9 (5.8% of revenue); H1 FY27 actual **190.8**. Steps up because **$2,149.7m of capitalized cost relates to titles not yet released** at 2026-03-31 and begins amortizing on release over "9 to 36 months" | `FY26 10-K, Note 7, p.83`; `FY26 10-K, Note 1 — Software Development Costs`; `Q2 FY27 10-Q, Statements of Cash Flows` |
| Fixed capex | **290.0** | Company point guidance ("approximately $290m"). FY26 actual 190.2 (= purchases of fixed assets 162.8 + asset acquisitions 27.4); consensus 281.8 with a median of exactly 290 | `TTWO 2Q27 Earnings Release, Outlook`; `earnings/01` §1; `CIQ Estimates → Consensus` |
| Net working capital | **−888.8 = −11.0% of revenue** (negative-WC business) | Actual NWC at 2026-09-30 = **−701.1** (−10.9% of LTM revenue). Ratio **held at the latest observed level** rather than reverted to the more-negative five-year history (FY2022 −31.2%, FY2023 −22.9%, FY2024 −19.7%, FY2025 −18.3%, FY2026 −18.9%) — reverting would manufacture a large one-off cash release. Build in §2 | `Q2 FY27 10-Q, Condensed Consolidated Balance Sheets`; `CIQ Financials_Annual → Balance Sheet` |
| **FY2027 FCFF (full year, modelled)** | **613.9** | §4 identity | executed snippet, §4 |
| **Normalized mid-cycle FCFF (the figure `05` inverts)** | **≈ 1,036–1,185** (FY2032–FY2036 band; FY2036 **1,036.2**) | The FY2027 base is a *transition* year (H1 was a pre-launch trough, H2 the GTA VI launch). The mid-cycle normalized FCFF is the FY2032+ level, where acquired-intangible amortization has run off and content amortization equals content spend | §4 |

**Normalizations deliberately NOT made, named so they are visible.**
- **Goodwill and intangible impairments are excluded from the forecast** — $5,887.3m of accumulated goodwill impairment against $6,949.2m of gross goodwill, plus $577.4m (FY24) and $465.3m (FY23) of Developed Game Technology impairments and $77.5m / $109.9m of software-development-cost impairments [`FY26 10-K, Notes 7 and 9, pp.83–85`]. They are non-cash and not forecast; they are, however, the evidence behind the §5 runoff terminal, not an argument for ignoring the past.
- **The vendor's "Levered Free Cash Flow" of 787.6 is not used anywhere.** It is an after-interest vendor construction, not §15 FCF [`ciq_facts.json → levered_fcf_m`, whose own `source_ref` carries that warning].
- **No working-capital reversion credit, no SBC add-back, no management-basis EBITDA.** Each would raise the answer; each is refused with a reason.

---

## 2. Forecast Assumptions

Ten-year explicit forecast, FY2027 → FY2036. Every cell is labelled **G** = company-guided, **C** = consensus/vendor-derived, **F** = filing-disclosed schedule, **A** = analyst assumption (mine, not company-guided).

| Assumption | FY2027 | FY2028 | FY2029 | FY2030 | FY2031 | FY2032 | FY2033 | FY2034 | FY2035 | FY2036 | Terminal | Source / Basis |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| Revenue growth % | — (base) | **+5.66** | +3.13 | +3.13 | +3.13 | +3.13 | +3.13 | +3.13 | +2.50 | +2.50 | **+3.00** | FY2027 level **G**; FY2028 **C** (consensus FY28/FY27 = 9,039.05/8,554.69); FY2029–34 **C** (the consensus FY2028→FY2034 CAGR, 3.13%); FY2035–36 **A** fade |
| Revenue (USD m) | 8,080.0 | 8,537.5 | 8,804.7 | 9,080.3 | 9,364.5 | 9,657.6 | 9,959.9 | 10,271.7 | 10,528.4 | 10,791.7 | — | as above |
| Core operating margin % (EBIT **before** acquired-intangible amortization) | **10.61** | 17.50 | 18.00 | 16.50 | 15.00 | 14.00 | 13.50 | 13.00 | 12.75 | **12.50** | **12.50** | FY2027 **G** (derived: (252.5+604.6)/8,080); FY2028–29 **A**, set *below* the consensus-implied level (see note); FY2030–36 **A** fade to the normalized mid-cycle level benchmarked in §5 |
| Acquired-intangible amortization (USD m) | **604.6** | **554.1** | **205.2** | **111.5** | **38.2** | 23.5 | 23.5 | 23.5 | 23.5 | 23.5 | 23.5 | FY2027–31 **F** — the 10-K's own schedule; FY2032+ **A** (the 117.6 residual of the 1,631.2 net book value spread over five years, the long-lived IP and branding balances) |
| **EBIT margin % (GAAP)** | **3.13** | 11.01 | 15.67 | 15.27 | 14.59 | 13.76 | 13.26 | 12.77 | 12.53 | **12.28** | **12.25** | core less acquired-intangible amortization. FY2027 reproduces the guidance EBIT of 252.5 |
| Tax rate % (normalized) | 21.0 | 21.0 | 21.0 | 21.0 | 21.0 | 21.0 | 21.0 | 21.0 | 21.0 | 21.0 | **21.0** | **F/cross-module** — reconciled to `business-model/09_moat.md` §3 (§1 above) |
| Depreciation & amortization line, % of revenue | 2.41 | 2.41 | 2.41 | 2.41 | 2.41 | 2.41 | 2.41 | 2.41 | 2.41 | 2.41 | 2.41 | **A** anchored on H1 FY27 actual 96.3 annualized to ~195 (and FY26 166.4 = 2.50%, FY25 2.73%, FY24 2.53%) |
| Content amortization, % of revenue | 7.50 | 9.00 | 10.00 | 10.50 | 11.00 | 11.00 | 11.00 | 11.00 | 11.00 | 11.00 | 11.00 | **A** — rises to equal cash spend by FY2031 (steady state), because the 2,149.7 of unreleased capitalized cost starts amortizing on release over 9–36 months **F** |
| Content cash spend, % of revenue | 11.00 | 11.00 | 11.00 | 11.00 | 11.00 | 11.00 | 11.00 | 11.00 | 11.00 | 11.00 | 11.00 | **A** inside the FY2024–FY2026 observed band of 10.4–12.3% |
| Fixed capex, % of revenue | **3.59** (=290 **G**) | 3.00 | 3.00 | 3.00 | 3.00 | 3.00 | 3.00 | 3.00 | 3.00 | 3.00 | 3.00 | FY2027 **G**; FY2028+ **A**, between FY26 actual 2.86% and FY27 guided 3.59% |
| **Net working capital, % of revenue** | **−11.0** | −11.0 | −11.0 | −11.0 | −11.0 | −11.0 | −11.0 | −11.0 | −11.0 | −11.0 | −11.0 | **A** — held at the latest observed ratio (−10.9% at 2026-09-30) |

**Why FY2028–FY2029 core margin is set below the Street's own implied level, not above it.** Restating the consensus to my revenue base: FY2029 management-basis EBITDA of 2,622.4 on the vendor's 9,210.8 of revenue scales to ~2,506 on my 8,804.7; stripping SBC (~5.7% of revenue ≈ 502), the depreciation line (~220) and the filing's acquired-intangible amortization (205.2) leaves a consensus-implied **GAAP EBIT margin near 17.9%**, i.e. a core margin near 20.4% [`CIQ Estimates → Multiples`, TEV/EBITDA grid at the vendor TEV of 41,790.1; `earnings/04` §1A for the management-basis bridge]. My FY2029 core of **18.00%** is ~240bps **below** that. The DCF is therefore not built on a more optimistic operating case than the Street's; it is built on a slightly more cautious one.

**The long-dated consensus is thin and its jaggedness is not imported as a point forecast.** Inverting the vendor's forward TEV/REV grid at its own TEV of 41,790.1 gives revenue of 8,554.7 (FY27), 9,039.1, 9,210.8, 9,698.4, **9,086.3 (FY31, a fall)**, 9,440.1, **10,685.5 (FY33, +13.2%)**, 10,874.3 (FY34) [`CIQ Estimates → Multiples`]. The FY2032–FY2034 rows carry **only** TEV/REV and TEV/EBITDA (no EPS, no PEG), which means very few contributors. Using that saw-tooth as a point path would be false precision, so the smoothed FY2028→FY2034 CAGR of **3.13%** is used instead and lands on the same FY2034 level by construction. The jagged path is printed here so a reader can see what was smoothed.

**Working capital scales with revenue — and the sign matters more here than the level.** TTWO is a **negative-working-capital** business: unearned (deferred) revenue of 1,017.1 plus payables 207.7, accrued expenses 747.4 and other current liabilities 276.5 exceed receivables 780.8, inventory 34.1, prepaid 647.1 and other current assets 85.6, so NWC at 2026-09-30 is **−701.1** [`Q2 FY27 10-Q, Condensed Consolidated Balance Sheets`]. Holding the ratio at −11.0% while revenue grows makes NWC **more negative every year**, which **releases** cash and **ADDS** to FCF — the per-year effect and its sign are printed in §4 and read off the modelled ΔNWC, not inferred from the direction of growth. The alternative driver — days-of-sales from `earnings/06_earnings-quality` — was checked and is not usable as the primary driver here, because the dominant working-capital line is **deferred revenue**, which has no days-of-sales analogue (the company's own disclosed service period is "generally between five and fifteen months depending on the software product" [`FY26 10-K, Note 1 — Revenue Recognition, p.76`]); the percentage-of-revenue driver is used and labelled instead.

---

## 3. Discount Rate (WACC)

| Component | Value | Source |
|---|---:|---|
| Risk-free rate | **5.07%** | **Web-sourced, labelled unverified:** US 10-year Treasury yield, **2026-11-19** (5.06–5.08% across the sources; 5.07% on 2026-11-18) [`Web: US 10-year Treasury yield, 2026-11-19 (indicative, unverified)`]. **Why not the pool figure:** the pool's only risk-free rate is the company's own **3.8%/3.9%** Monte Carlo input for FY2026 market-based RSUs, struck on a **2.8-year** expected service period as of March 2026 [`FY26 10-K, Note 16 — Market-Based Awards`], and SOFR of ~3.91% at 2026-09-30 [`Q2 FY27 10-Q, Note 10`]. Neither is a long-horizon rate at the valuation date; a perpetual DCF needs the 10-year tenor |
| Equity-risk premium | **4.41%** | **Web-sourced, labelled unverified:** Damodaran implied ERP for the S&P 500, trailing-twelve-month with adjusted payout, **as of 2026-11-01** (the same data set shows 3.39%–5.81% across its five methods) [`Web: Damodaran implied equity risk premium, 2026-11-01 (indicative, unverified)`]. **No ERP figure exists anywhere in this pool** |
| Beta | **0.92** | `CIQ Comps → Operating Statistics`, subject row, **"5 Year Beta"**, As-Of **2026-11-19** — tier-5 vendor export. **Window:** 5 years. **Reference index: not stated in the export** — a named gap, not an assumption. Peer betas in the same column run −0.45 to 1.53, median 0.65 |
| **Cost of equity (CAPM)** | **9.13%** | 5.07% + 0.92 × 4.41% = **9.1272%** |
| Pre-tax cost of debt | **5.60%** | The company's own **longest-dated coupon**: 5.600% Senior Notes due June 12, 2034 [`Q2 FY27 10-Q, Note 10 (Debt)`]. **Market cross-check:** those notes were carried at 300.0 face against a Level-2 fair value of **289.6** at 2026-09-30 — below par, so the market yield is *above* the coupon, roughly **6.05%** on a ~7.7-year bond. Substituting 6.05% lifts the WACC by only **2bp** (debt is 5.85% of capital), so 5.60% is used and the higher figure noted |
| Tax rate (debt shield) | **21.0%** | The **same** normalized rate as NOPAT (§1) — the moat module's canonical figure |
| After-tax cost of debt | **4.42%** | 5.60% × (1 − 0.21) = 4.424% |
| Equity / debt weights (market value) | **94.15% / 5.85%** | Equity = market cap **40,552.3** [`valuation/01` §3]; debt = canonical **2,519.8**, borrowings only at carrying value from the filing's own debt note [`valuation/01` §7; `Q2 FY27 10-Q, Note 10`]. Debt carrying value is used as a proxy for market value — the Level-2 fair values sit within ~3% of face. Weights sum to 1.0000 |
| Preferred | **nil** | Preferred stock 5.0 shares authorised, **none issued or outstanding** [`Q2 FY27 10-Q, Balance Sheets`] — so no `w_p·k_p` term |
| **WACC** | **8.85%** | formula below |

**Formula, applied by the executed snippet in §4, not eyeballed:**
`WACC = w_e·k_e + w_d·k_d·(1 − t)` = `0.9415 × 9.1272% + 0.0585 × 5.60% × (1 − 0.21)` = `8.593% + 0.259%` = **8.852%**. No preferred term (none exists).

**Sanity bounds — all printed and all cleared (MODULE_RULES Gate 4).**
- **Arithmetic band:** after-tax `k_d` **4.42%** ≤ **WACC 8.85%** < `k_e` **9.13%** ✔. The WACC sits strictly below the CAPM cost of equity, as it must for a firm carrying debt.
- **High-side bound:** `rf + 1.4 × ERP` = 5.07% + 6.17% = **11.24%**. `k_e` of 9.13% is well below it (β 0.92 < 1.4) ✔ — no unjustified high rate is being applied to a large-cap.
- **Low-side floor 1 — equity-risk-premium floor:** `k_e − rf` = 9.13% − 5.07% = **4.06pp ≥ ~4pp** ✔. It clears **narrowly**, which is a function of a sourced 4.41% ERP and a beta below 1.0; stated rather than glossed.
- **Low-side floor 2 — beta floor and source discipline:** TTWO is a cyclical business on this engine's own read (cyclicality **22/100**, release-slate plus consumer-discretionary plus console-hardware cycles stacked [`business-model/07_business-quality.md` §1]), so the floor applies. The raw vendor beta of **0.92** is **above** the ~0.8 artefact line, so no floor is imposed and no re-levering is needed. Source, window and index are stated above, including that the reference index is **not disclosed** in the export. Because of that gap, the §7 grid is run at WACC ±1pp, which spans an equivalent beta range of roughly **0.69 to 1.15**.
- **Low-side floor 3 — country / single-market risk:** **no country-risk premium is added, and that is a deliberate stated choice, not an omission.** Cash flows are USD-reported and geographically spread — US 3,940m / International 2,716m of FY2026 revenue (59% / 41%) across developed markets plus a China exposure that the filings never size [`FY26 10-K, MD&A, p.44`; `ciq_facts.json → geographic`]. The reporting currency is a reserve currency and the issuer is a Delaware-incorporated US domestic filer, so a sovereign-spread adjustment would be adding a premium the cash flows do not carry.

**Override discipline: no analyst override was applied.** The number used (8.85%) is the mechanically computed blend. **Cross-check against the moat module's cost of capital (Gate 4):** `business-model/09_moat.md` §3 Build 3 published a labelled CAPM WACC of **8.2%** (rf 3.9%, β 0.92, ERP 5.0% judgment, after-tax `k_d` 4.3%, weights 93.3%/6.7% on the lease-inclusive debt figure), sensitised to 7.8%–9.1%. The gap to my 8.85% is **0.65pp — well inside the ~2pp divergence trigger**, so no grid spanning both rates is required. The difference is fully explained and runs in two directions: my risk-free rate is **+117bp** higher (a current 10-year Treasury at 5.07% versus the company's March-2026, 2.8-year stock-comp input of 3.9%), partly offset by an ERP **−59bp** lower (a sourced 4.41% versus a 5.0% judgment figure), plus a slightly different debt weight (2,519.8 borrowings-only versus the vendor's lease-inclusive 2,911.4). **My rate is the higher of the two**, so this DCF is not resting on a lower cost of capital than the moat test did.

## 3A. Cost-of-Capital Reality Test (mandatory — CLAUDE.md §16, MODULE_RULES Gate 4)

**The filings were searched for a disclosed discount rate. One reference and one number exist, and neither is scope-matched to the listed group.** The FY26 10-K states that goodwill impairment testing uses *"risk-adjusted discount rates based on our weighted average cost of capital"* and names "discount rate" among the assumptions audited as a critical audit matter — **but the numeric rate is nowhere in the filings** [`FY26 10-K, Critical Accounting Policies — Goodwill`; `FY26 10-K, Note 9, pp.83–85`; `FY25 10-K, Report of Independent Registered Public Accounting Firm — Critical Audit Matter`]. The only disclosed numeric rate is the **weighted-average operating-lease discount rate of 4.74%** (FY2026; 4.75% FY2025, 4.56% FY2024), on a weighted-average remaining lease term of 7.14 years [`FY26 10-K, Note 13 (Leases)`]. Scope test on that rate: **valuation object** = lease liabilities (an obligation), not the listed group; **geography/currency** = mixed, USD-reported; **tax basis** = pre-tax; **method** = incremental **borrowing** rate, not a cost of equity or a WACC. It fails three of the five matches, so it is a **labelled sensitivity comparator only** and can never anchor the group valuation.

| Reference | Rate | Source (cited per §5) | Gap vs model WACC |
|---|---:|---|---:|
| Model WACC (CAPM build, §3) | **8.85%** | this agent | — |
| Scope-matched group discount rate | **Group discount rate not disclosed** | `FY26 10-K, Critical Accounting Policies — Goodwill` and `Note 9` reference a WACC-based rate but state no number; `FY25 10-K, Critical Audit Matter` likewise. No group cost of equity or WACC appears anywhere in this pool | **n/a — none exists** |
| Other disclosed rate (**comparator only**) | 4.74% | `FY26 10-K, Note 13 (Leases)` — weighted-average **operating-lease** discount rate. Object: lease obligations. Currency: USD-reported, mixed geography. Basis: pre-tax. Method: incremental **borrowing** rate. **Fails the five-way scope match; cannot trigger a re-run** | model is **+4.11pp above** it (a WACC should sit above a secured-obligation borrowing rate) |
| Market-implied rate | **≈ 2.63%** | `05_reverse-dcf` runs **after** this agent and will invert this exact model; the read available now is the discount rate that sets this model's own FCFF path equal to the canonical EV of **41,922.7** [`valuation/01` §7] — solved in the §4 snippet at **2.63%** | model is **+6.22pp ABOVE** the market-implied rate |
| Company's own trailing FCF yield / earnings yield | FCF yield **0.15%**; earnings yield **−0.59%** (negative) | FCF yield = LTM §15 FCF 62.6 ÷ market cap 40,552.3 [`earnings/01` §2; `valuation/01` §3]; earnings yield = LTM net income (240.5) ÷ 40,552.3 [`CIQ Financials_Quarterly → Income Statement`, LTM Sep-30-2026] | model is **+8.70pp / +9.44pp above** both |
| Peer / industry cost of capital | **Not assessable** | No ROIC, ROCE, ROE, WACC or cost-of-capital column exists for any of the ten peers in this pool [`business-model/09_moat.md` §3; `business-model/08_competitive-map.md` §5, gap 2]. Electronic Arts, the closest comparable, was taken private on 2026-08-04 and no longer files | — |

**Escalation branch: none taken — the trigger does not fire, and it fires in the opposite direction from the one §16 guards against.** Both trigger conditions were tested explicitly. (i) *"More than ~3pp below a scope-matched company-disclosed rate"* — **cannot fire**: no scope-matched group rate exists, and the one disclosed rate (4.74% lease borrowing rate) is a mismatched obligation rate that the rule itself bars from triggering a re-run; the model sits 4.11pp **above** it in any case. (ii) *"Below ~two-thirds of the market-implied rate"* — **does not fire**: the market-implied rate on this model's own cash-flow path is **2.63%**, so the model WACC is **3.4x** the market-implied rate, not below two-thirds of it. The model rate is also 8.70pp above the company's trailing FCF yield and 9.44pp above a negative earnings yield. **No `RF-VAL-003` tag is emitted, because emitting one when the trigger has not fired would be a false cap.** The finding this test actually produces is the reverse of the usual defect: the gap between price and intrinsic value here is **not** a low-discount-rate artefact — at the current price the market is implicitly discounting this cash-flow path at a rate **below the 10-year Treasury**, which means it is pricing materially larger cash flows than this model carries (the §4 snippet shows a uniform **3.16x** scale-up of the modelled FCFF would be needed to reach the market EV at the model WACC). Testing that hypothesis against the earnings evidence is `05_reverse-dcf`'s job, and it should start there.

---

## 4. Free Cash Flow Forecast & Discounting

**Identity used (Gate 1, second form — stated once and not mixed):**
`FCFF = NOPAT + D&A − capex − ΔNWC`, where for this business **D&A** = the P&L depreciation-and-amortization line **+** acquired-intangible amortization **+** content (software development) amortization, and **capex** = fixed capex **+** content cash spend. SBC is **not** added back — it is charged inside EBIT and left there. Interest is excluded (this is an unlevered flow discounted at the WACC).

**Discounting convention: mid-year (t − 0.5 equivalent), measured from 2026-09-30.** Because FY2027 is half-reported, the convention lands exactly: FY2028 spans Apr-2027→Mar-2028, so its midpoint (2027-09-30) is **exactly 1.00 year** from the valuation date, FY2029's is 2.00, and so on; the H2 FY2027 stub (Oct-2026→Mar-2027) has its midpoint at **t = 0.25**. The terminal value, struck at the end of FY2036 (2036-03-31), is discounted at **t = 9.50**. End-of-year discounting is **not** used.

**H1 FY2027 is already reported and is stripped out, so nothing is double-counted.** The Sep-30-2026 balance sheet (which supplies the net-debt anchor) already contains that half's cash. On the same identity, using the filings:

| H1 FY2027 (6 months to 2026-09-30) | Value | Source |
|---|---:|---|
| EBIT (GAAP, six months) | (153.0) | `Q2 FY27 10-Q, Condensed Consolidated Statements of Operations` (six-month column) |
| NOPAT at 21.0% | (120.9) | arithmetic |
| + Depreciation & amortization line | 96.3 | `Q2 FY27 10-Q, Statements of Operations` (six months) |
| + Acquired-intangible amortization | 313.5 | Q1 168.4 + Q2 145.1 [`TTWO 1Q27 Earnings Release, p.2`; `TTWO 2Q27 Earnings Release, p.2` — the management-basis bridges] |
| + Content amortization and impairment | 190.8 | `Q2 FY27 10-Q, Statements of Cash Flows` (six months) |
| − Content cash spend | (372.4) | same |
| − Fixed capex | (182.7) | `earnings/01` §2, tied to the filing |
| − ΔNWC cash effect (NWC **rose** from −1,255.6 to −701.1, so it **absorbed** 554.5) | (554.5) | `Q2 FY27 10-Q, Balance Sheets`; `CIQ Financials_Annual → Balance Sheet` (Mar-31-2026) |
| **= H1 FY2027 FCFF on the identity** | **(629.9)** | snippet below |

*Reconciliation of that stub to the cash record, with the residual named rather than hidden:* reported H1 FY27 CFO was **(173.5)** and capex **182.7**, so §15 FCF was **(356.2)**; unlevering it (+17.4 of after-tax net interest expense) gives (338.8); charging the 176.0 of SBC that CFO adds back gives **(514.8)**. The identity's (629.9) is **115.1 lower**, and the gap is accounted for by two named items the identity does not model: the **43.6** of non-cash asset writedowns and title impairments sitting inside H1 EBIT (43.4 in Q1 on an abandoned third-party title, 0.2 in Q2) [`TTWO 1Q27 Earnings Release, p.2`; `earnings/01` §3], and the difference between the **normalized 21.0%** tax charge and the much larger tax **benefit** actually recorded against an H1 pre-tax loss (the Q2 quarter alone carried a 57.9 benefit) [`Q2 FY27 10-Q, Results of Operations`]. Neither recurs in the forecast.

| Period | Revenue | EBIT | NOPAT | D&A (total) | Capex (total) | ΔNWC cash effect | FCFF | Discount factor | PV of FCFF |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| FY2027 (full year, modelled) | 8,080.0 | 252.5 | 199.5 | 1,405.6 | 1,178.8 | **+187.7 (release)** | 613.9 | — | — |
| *less* H1 FY2027 (reported) | *3,030.9* | *(153.0)* | *(120.9)* | *600.6* | *555.1* | *(554.5) (absorbed)* | *(629.9)* | — | — |
| **H2 FY2027 (Yr-1 stub)** | 5,049.1 | 405.5 | 320.3 | 805.0 | 623.7 | **+742.2 (release)** | **1,243.8** | 0.9790 | **1,217.7** |
| FY2028 | 8,537.5 | 940.0 | 742.6 | 1,528.5 | 1,195.2 | **+50.3 (release)** | 1,126.1 | 0.9187 | 1,034.5 |
| FY2029 | 8,804.7 | 1,379.6 | 1,089.9 | 1,298.2 | 1,232.6 | **+29.4 (release)** | 1,184.8 | 0.8440 | 999.9 |
| FY2030 | 9,080.3 | 1,386.7 | 1,095.5 | 1,284.0 | 1,271.2 | **+30.3 (release)** | 1,138.6 | 0.7753 | 882.8 |
| FY2031 | 9,364.5 | 1,366.5 | 1,079.5 | 1,294.3 | 1,311.0 | **+31.3 (release)** | 1,094.0 | 0.7123 | 779.2 |
| FY2032 | 9,657.6 | 1,328.6 | 1,049.6 | 1,318.8 | 1,352.0 | **+32.2 (release)** | 1,048.6 | 0.6544 | 686.2 |
| FY2033 | 9,959.9 | 1,321.1 | 1,043.7 | 1,359.4 | 1,394.4 | **+33.3 (release)** | 1,041.9 | 0.6011 | 626.4 |
| FY2034 | 10,271.7 | 1,311.8 | 1,036.3 | 1,401.3 | 1,438.0 | **+34.3 (release)** | 1,033.8 | 0.5523 | 570.9 |
| FY2035 | 10,528.4 | 1,318.9 | 1,041.9 | 1,435.7 | 1,474.0 | **+28.2 (release)** | 1,031.9 | 0.5073 | 523.5 |
| FY2036 | 10,791.7 | 1,325.5 | 1,047.1 | 1,471.0 | 1,510.8 | **+29.0 (release)** | 1,036.2 | 0.4661 | 483.0 |

**Sum of PV of explicit FCFF (H2 FY2027 → FY2036): 7,804.2.**

**Working-capital sign check, done explicitly rather than assumed.** This is a negative-working-capital business and the ratio is **held** at −11.0%, so revenue growth drives modelled NWC *more negative* every year — `ΔNWC = NWC_t − NWC_{t−1}` is negative in all ten forecast years (−50.3, −29.4, −30.3, −31.3, −32.2, −33.3, −34.3, −28.2, −29.0 from FY2028 on), which is a cash **release** and therefore **ADDS** to FCFF. The sign is read off those modelled ΔNWC figures, not off the direction of growth. The sanity test the rule prescribes is passed: revenue is growing, the ratio is held at a negative-WC company, and the working-capital line is **adding to** FCFF — if it were cutting FCFF, the sign would be inverted. The one year where the effect is large (+742.2 in the H2 FY2027 stub) is **not** a growth release: it is the H1 absorption of 554.5 reversing out of a half-year that has already happened, plus the FY2027 growth release of 187.7 — the arithmetic is printed in the table above so the reader can see which part is which. Note the direction of the modelled drift is **conservative**: the ratio is held at the *least* negative level in six years (−10.9% latest versus −18.9% FY2026 and −31.2% FY2022), so the model takes **less** working-capital funding than the company's own history would support.

```bash
$ python3 dcf.py   # executed 2026-11-20
WACC BLEND
  w_e=0.9415  w_d=0.0585  sum=1.0000
  k_e = 0.0507 + 0.92*0.0441 = 0.091272  (9.13%)
  k_d pre-tax 5.60%  after-tax = 5.60%*(1-0.21) = 4.424%
  WACC = 0.9415*0.091272 + 0.0585*0.044240 = 0.088521  (8.852%)
  GATE: after-tax kd 4.42% <= WACC 8.85% < k_e 9.13%  -> True
  high-side bound rf+1.4*ERP = 11.24%  k_e below it -> True
  low-side floor  k_e - rf = 4.06pp  (>= ~4pp) -> True

FORECAST  (USD m; wc_cash + = NWC falls/more negative = cash released = ADDS to FCF)
yr           rev  core%   acqAm     EBIT  EBIT%    NOPAT     D&A    cAmo   cSpend   capex      NWC    dNWC  wcCash     FCFF
FY2027    8080.0  10.61   604.6    252.5   3.13    199.5   195.0   606.0    888.8   290.0   -888.8  -187.7   187.7    613.9
FY2028    8537.5  17.50   554.1    940.0  11.01    742.6   206.0   768.4    939.1   256.1   -939.1   -50.3    50.3   1126.1
FY2029    8804.7  18.00   205.2   1379.6  15.67   1089.9   212.5   880.5    968.5   264.1   -968.5   -29.4    29.4   1184.8
FY2030    9080.3  16.50   111.5   1386.7  15.27   1095.5   219.1   953.4    998.8   272.4   -998.8   -30.3    30.3   1138.6
FY2031    9364.5  15.00    38.2   1366.5  14.59   1079.5   226.0  1030.1   1030.1   280.9  -1030.1   -31.3    31.3   1094.0
FY2032    9657.6  14.00    23.5   1328.6  13.76   1049.6   233.0  1062.3   1062.3   289.7  -1062.3   -32.2    32.2   1048.6
FY2033    9959.9  13.50    23.5   1321.1  13.26   1043.7   240.3  1095.6   1095.6   298.8  -1095.6   -33.3    33.3   1041.9
FY2034   10271.7  13.00    23.5   1311.8  12.77   1036.3   247.9  1129.9   1129.9   308.1  -1129.9   -34.3    34.3   1033.8
FY2035   10528.4  12.75    23.5   1318.9  12.53   1041.9   254.1  1158.1   1158.1   315.9  -1158.1   -28.2    28.2   1031.9
FY2036   10791.7  12.50    23.5   1325.5  12.28   1047.1   260.4  1187.1   1187.1   323.7  -1187.1   -29.0    29.0   1036.2

H1 FY2027 ACTUAL on the same identity (6m to 2026-09-30)
  NOPAT -120.9 + D&A 96.3 + acq.amort 313.5 + contentAmort 190.8 - contentSpend 372.4 - capex 182.7 + wcCash -554.5 = -629.9
  (cash cross-check: CFO -173.5 - capex 182.7 = -356.2; unlever +17.4 net int a/t = -338.8; charge SBC -176.0 = -514.8; residual vs identity = -115.1)
  H2 FY2027 stub FCFF = FY2027 full 613.9 - H1 -629.9 = 1243.8

DISCOUNTING  mid-year convention; t measured from 2026-09-30
period          t      FCFF       DF        PV
H2 FY2027    0.25    1243.8   0.9790    1217.7
FY2028       1.00    1126.1   0.9187    1034.5
FY2029       2.00    1184.8   0.8440     999.9
FY2030       3.00    1138.6   0.7753     882.8
FY2031       4.00    1094.0   0.7123     779.2
FY2032       5.00    1048.6   0.6544     686.2
FY2033       6.00    1041.9   0.6011     626.4
FY2034       7.00    1033.8   0.5523     570.9
FY2035       8.00    1031.9   0.5073     523.5
FY2036       9.00    1036.2   0.4661     483.0
  SUM PV of explicit FCFF = 7804.2

TERMINAL VALUE   (end of FY2036 = 2036-03-31 = t 9.50 from 2026-09-30)
  BASE  ROIC=WACC  TV=NOPAT37/WACC         TV   12183.9  PV(TV)   5443.0  EV   13247.2  TV%EV  41.1%
  PERSIST Gordon on FCFF g=3.0%            TV   18238.1  PV(TV)   8147.6  EV   15951.9  TV%EV  51.1%
  RUNOFF  EBIT mgn 8.0%, g=0.0% nominal    TV    7704.8  PV(TV)   3442.0  EV   11246.3  TV%EV  30.6%
  NOPAT_FY2037 = EBIT36 1325.5 x 1.03 x (1-0.21) = 1078.5
  FCFF_FY2037  = 1036.2 x 1.03 = 1067.3 ; WACC-g = 5.85pp
  exit-multiple cross-check: FY2037 EBITDA 1657.6; base TV/EBITDA = 7.35x ; persist = 11.00x ; runoff = 4.65x

EV -> EQUITY -> PER SHARE
  BASE (ROIC=WACC terminal)          EV   13247.2  -netdebt 1370.4 -> equity   11876.8  /188.0 =   63.17/sh  vs price 216.61 =  -70.8%  TV%EV 41.1%
  PERSISTENCE terminal               EV   15951.9  -netdebt 1370.4 -> equity   14581.5  /188.0 =   77.56/sh  vs price 216.61 =  -64.2%  TV%EV 51.1%
  RUNOFF terminal (bear input)       EV   11246.3  -netdebt 1370.4 -> equity    9875.9  /188.0 =   52.53/sh  vs price 216.61 =  -75.7%  TV%EV 30.6%

GATE 2 financeable growth (FY2036)
  capex total 1510.8 - D&A total 1471.0 + dNWC -29.0 = reinvestment 10.9
  reinvestment rate = 10.9/1047.1 = 1.04%
  implied g = ROIC x rr ; at ROIC=WACC 8.85% -> 0.09%  vs modeled gT 3.0%
  BASE terminal is g-invariant: NOPAT*(1-g/ROIC)/(WACC-g) with ROIC=WACC == NOPAT/WACC for any g
```

```bash
$ python3 imp.py   # executed 2026-11-20 -- market-implied discount rate on this same path
Discount rate that makes this model's FCFF path equal the market EV of 41922.7: 2.63%
  (model WACC 8.85%; 10-yr UST 5.07%)  EV at that rate = 41922.7
  EV at model WACC = 13247.2; uniform FCFF/NOPAT multiple needed to reach market EV = 3.16x
  LTM FCF yield = 62.6/40552.3 = 0.15%  ; LTM earnings yield = -240.5/40552.3 = -0.59%
  model FY2029 FCFF yield on market cap = 2.92%
```

---

## 5. Terminal Value

**Method and formula, written out.**

- **Gordon growth:** `TV = FCFF_{n+1} / (WACC − g) = FCFF_n × (1 + g) / (WACC − g)`, where `FCFF_{n+1}` is the first cash flow *after* the explicit period (FY2037) and `g` is the perpetual nominal growth rate. `WACC − g` must stay comfortably positive — at **8.85% − 3.00% = 5.85pp** the gap is wide, and the worst corner of the §7 grid (WACC −1pp, g +0.5pp) still leaves **4.35pp**, so no cell approaches the divide-by-near-zero zone. **No grid cell is NM.** This is confirmed, printed in §7, and not assumed.
- **Base terminal actually used — the no-excess-return form:** `TV = NOPAT_{n+1} × (1 − g / ROIC_terminal) / (WACC − g)` with **`ROIC_terminal = WACC`**, which collapses algebraically to **`TV = NOPAT_{n+1} / WACC`** for *any* `g`. That is the whole point: with terminal ROIC equal to the cost of capital, growth creates **no** value, so no perpetual excess return is being underwritten.
- **Exit multiple cross-check:** `TV = terminal metric × exit multiple`, run in reverse — the Gordon TV is converted back into the EV/EBITDA a mature version of this business would be worth.

**Why the base terminal carries no perpetual excess return — the §5(a) trigger, with its upstream row cited.** `business-model/09_moat.md` §5 returns **"No moat proven"** — specifically the *"moat in structure, not economics"* case: four moat sources present (brand 60, scale 35, technology/IP 48, network effects 38), **none reaching the 61–80 "strong" band**, and the economic test failing on every basis (five-year through-cycle ROIC **−0.7%** against an ~8.2% WACC, −890bps; LTM **−2.2%**, −1,040bps; even the most generous ten-year reading of **+4.2%** is 400bps short) [`business-model/09_moat.md` §3–§5]. Per the rule, the base terminal therefore **fades terminal ROIC to the cost of capital and sets `g` at ~nominal growth with no moat premium**. This is a **fade, not a decline** — the base case still assumes the franchise survives and earns its cost of capital in perpetuity.

| Terminal variant | Formula and inputs | Terminal value (undiscounted) | PV of terminal value | Resulting EV | **TV as % of EV** | Implied exit TEV/EBITDA |
|---|---|---:|---:|---:|---:|---:|
| **BASE — ROIC = WACC, no excess return** (§5(a) trigger: "No moat proven") | `NOPAT_FY2037 / WACC` = (1,325.5 × 1.03 × 0.79) / 0.08852 = 1,078.5 / 0.08852 | **12,183.9** | **5,443.0** | **13,247.2** | **41.1%** | **7.35x** |
| Persistence — Gordon on FY2036 FCFF, g = 3.0% (assumes the FY2036 cash margin and its ~1% reinvestment rate persist, i.e. terminal ROIC **above** WACC) | 1,036.2 × 1.03 / (0.08852 − 0.03) | 18,238.1 | 8,147.6 | 15,951.9 | 51.1% | 11.00x |
| **RUNOFF / declining perpetuity** (§5(b) trigger — **the bear input, not the base**) | terminal EBIT margin faded to **8.0%** from FY2035, `g = 0.0% nominal` (below US expected inflation of ~2.5%, i.e. **negative real**, trending negative) | 7,704.8 | 3,442.0 | 11,246.3 | 30.6% | 4.65x |

**Terminal value is 41.1% of EV on the base case — well below the 75% terminal-dominance line, so no low-confidence terminal flag arises** (the persistence variant is 51.1%, the runoff 30.6%; none approaches 75%). That is unusual for a DCF and it is a genuine strength of this one: the answer is driven by the explicit ten-year cash flows, not by the perpetuity.

**Exit-multiple cross-check, both directions.** The base Gordon TV implies an exit **TEV/EBITDA of 7.35x** on FY2037 EBITDA of 1,657.6. Against the pool's peer set as of 2026-11-19 that is **below** the ten-peer LTM median of **13.0x** and below the NTM median of **9.96x** [`CIQ Comps → Trading Multiples`, As-Of 2026-11-19]. For a mature, no-moat-proven, hit-driven publisher earning exactly its cost of capital, an exit multiple a third below the peer NTM median is a sane rather than a heroic landing point — and the cross-check runs the right way (it does not require the market to pay *more* than peers at maturity). The persistence variant's implied 11.00x sits just above the peer NTM median, which is the clearest way to see what that variant is assuming: that the terminal business still earns a return above its cost of capital. The moat verdict does not support it, so it is shown and not used as the base.

**Terminal margin benchmarked against peer-normal AND the company's own prior-trough — the Cyclicality Gate, not "below the recent peak".** The terminal normalized operating margin is **12.50% core / 12.25% GAAP EBIT**. Where that sits:

| Anchor | Value | Source |
|---|---:|---|
| **Peer-normal EBIT margin** (ten-peer median) | **+15.9%** | `CIQ Comps → Operating Statistics`, As-Of 2026-11-19, via `business-model/09_moat.md` §3 and `08_competitive-map.md` §2A — tier-5 vendor export, mixed LTM windows |
| **Company's own prior-trough**, on the same core basis (operating margin before acquired-intangible amortization and before goodwill impairment) | **+3.2% (FY2024), +1.4% (FY2025)** — average ~2.3% | `FY26 10-K / FY25 10-K, Consolidated Statements of Operations`; `FY26 10-K, Note 9` amortization table (FY2024 1,418.9; FY2025 922.6) and `Note 9` goodwill impairments (2,342.1 FY2024; 3,545.2 FY2025) |
| Company's own prior-trough on the vendor's reported operating-income basis | **−10.2% (FY2024), −9.2% (FY2025)** | `CIQ Financials_Annual → Income Statement` (operating income −544.8 / −520.7) — vendor basis, goodwill impairment excluded |
| **Company's own prior-peak** | **+19.8% (FY2021), +15.6% (FY2022)** — pre-Zynga, minimal acquired-intangible amortization | `CIQ Financials_Annual → Income Statement` (668.5 / 3,372.8; 545.0 / 3,504.8) |
| Forward cycle **peak** implied by consensus (FY2029) | **~17.9% GAAP EBIT / ~20.4% core** | derived in §2 from `CIQ Estimates → Multiples` and the `earnings/04` management-basis bridge |
| Through-cycle EBITDA margin anchor | **~12%** (ten-year average EBITDA 471.8 on average revenue 3,919.8) | `business-model/07_business-quality.md` §4 |

So the terminal sits **340bps below peer-normal**, **310bps below the company's own last pre-Zynga peak**, **570bps below the forward consensus peak**, and about **58% of the way from its own prior-trough (~2.3% core) to its own prior-peak (19.8%)**. It is **not** set at or near the peak, and it is **not** set merely "below the recent peak" — both required anchors are named and cited. The honest qualifier: the terminal relies on a **filing-disclosed, mechanical** improvement — acquired-intangible amortization falling from 604.6 (7.5% of revenue) in FY2027 to 38.2 (0.4%) by FY2031 per the 10-K's own schedule — so roughly **700bps of the margin path requires no operating improvement at all**. That is the quantified bridge between TTWO's dismal realised through-cycle operating margin (~1.0% over ten years on the vendor's ex-impairment basis) and a 12.25% terminal.

**The structural-decline / runoff terminal — §5(b), both triggers fired, cited.** Two independent upstream rows fire the second trigger: (i) `business-model/09_moat.md` §5 records the moat trajectory as **"eroding (not confirmed)"** — three panel rows support erosion (EBITDA margin −730 to −780bps, operating margin −1,720 to −1,840bps with the sign flipped, ROIC-versus-WACC spread down ~1,120bps and crossed from above to below), with the decisive structural fact being **$5,887.3m of accumulated goodwill impairment against $6,949.2m of gross goodwill (~85% of all goodwill ever recorded)** written off because of *"industry conditions and changes in our strategies"*, plus **two disclosed unit lifetimes that both shortened in the latest filing** (player service period "six and fifteen" → **"five and fifteen"** months; title amortization "12 to 36" → **"9 to 36"** months) [`FY26 10-K, Notes 1, 7 and 9`]; and (ii) `business-model/07_business-quality.md` §1 scores **industry rate-of-change / disruption 35 (≤40)** and fires RF-BQ-005. The runoff terminal therefore carries a nominal `g` of **0.0%** — at or below US expected inflation of roughly 2.5%, i.e. **zero-to-negative real growth, trending negative** — stated on the **same nominal basis** as the rest of the model (no real rate is introduced into a nominal model; at `g = −1.0%` nominal the terminal falls further to 6,917 and the per-share value to **48.1**), together with an explicit fade of the terminal operating margin to a **lower, non-recovering 8.0%**, roughly midway between the 12.25% base terminal and the company's own ~2.3% prior-trough core margin.

**The runoff terminal does not replace the base.** This module publishes **one** base intrinsic value (63.17/share, §6). The runoff value of **50.58/share** (with the fade running from FY2035; **52.53** if the fade is applied to the terminal only) is the **structural-impairment input** for `07_scenario-and-fair-value`'s structural-reset bear leg and for the master synthesizer's §24 Filter 5 / Kill Criteria read. The horizon differs and must travel with it: the base is a through-cycle intrinsic level; the runoff describes a **24–36 month** permanent-impairment path. The single next data point that discriminates between them is already dated — **Q3 FY2027, the first full quarter with Grand Theft Auto VI on sale, releasing on or about 2027-02-09** [`CIQ Estimates → Consensus` header, "FQ3 2027 Earnings Release Date: Feb-09-2027"; `business-model/09_moat.md` §5].

**Growth must be financeable — Gate 2, run and resolved rather than flagged and left.** In FY2036, total capex (fixed 323.7 + content 1,187.1 = 1,510.8) less total D&A (1,471.0) plus ΔNWC (−29.0, a release) gives reinvestment of just **10.9**, a reinvestment rate of **1.04%** of NOPAT. At a terminal ROIC equal to the WACC, implied financeable growth is therefore **0.09%** against a modelled terminal `g` of **3.00%** — a gap of **2.91pp**, well above the ~1.5pp teeth threshold. **The gap is quantified and neutralised, not left standing:** the base terminal is `NOPAT/WACC`, which is **mathematically identical for every value of `g`** once terminal ROIC equals the WACC, so the base terminal **assigns zero value to the un-financeable growth** — it is exactly a zero-growth capitalization of normalized NOPAT. The 3.00% `g` is carried only as a label on the NOPAT roll-forward and cannot inflate the terminal. The variant where `g` *does* bite (persistence, +14.39/share) is published beside the base and is explicitly the one the moat verdict does not support. Intrinsic confidence is nonetheless capped for this reason among others (§8).

**ROIC drift (Gate 3).** Terminal ROIC is set **equal to** the WACC, with no persistence of excess returns. That is the conservative end of the gate and it is evidence-based rather than imposed: `business-model/09_moat.md` §4 concludes the company **"earns a return on capital below its cost of capital"** on every basis tested, so there is no upstream moat or quality evidence that would support persistent excess returns. Labelled: the fade of the *path* ROIC toward the WACC over FY2030–FY2036 is **inference, not from filings**, derived from the moat and business-quality outputs cited above.

---

## 6. DCF Output

**Base case — ROIC = WACC terminal.** Bridge uses `01`'s anchors verbatim: **strict §15 net debt of 1,370.4** (total debt 2,519.8 borrowings-only at carrying value, less cash & equivalents 1,149.4), nil minority, nil preferred, and the company's own disclosed diluted count of **188.0m** (not the 187.1m trailing figure, because every trailing period is a loss and the 1.1 + 0.1 of increments are excluded only as antidilutive) [`valuation/01` §7].

| Step | Value (USD m) |
|---|---:|
| PV of explicit FCFF (H2 FY2027 → FY2036, mid-year, WACC 8.852%) | **7,804.2** |
| + PV of terminal value (t = 9.50) | **5,443.0** |
| **= Enterprise value** | **13,247.2** |
| − Net debt (strict §15 basis, 2026-09-30) | **(1,370.4)** |
| − Minority interest | **(0.0) — nil** |
| − Preferred equity | **(0.0) — nil** |
| + Equity-method investments | **+0.0 — none disclosed** |
| **= Equity value** | **11,876.8** |
| ÷ Diluted shares (company-disclosed) | **188.0m** |
| **= Intrinsic value per share** | **USD 63.17** |
| vs current price (USD 216.61, as-of 2026-11-19, pool-verified) | **−70.8%** — the price is **3.43x** the base DCF value |

**The four labelled variants, so the reader can see the full span and judge whether the base is the outlier.**

| Variant | What changes | Per share | vs price | Price ÷ DCF |
|---|---|---:|---:|---:|
| **BASE** | ROIC = WACC terminal; SBC charged; terminal core margin 12.50% | **63.17** | −70.8% | 3.43x |
| Persistence terminal | Gordon on FY2036 FCFF at g = 3.0% (terminal ROIC above WACC — not supported by the moat verdict) | 77.56 | −64.2% | 2.79x |
| **Runoff (bear input)** | terminal operating margin faded to 8.0% from FY2035, g = 0.0% nominal | **50.58** | −76.7% | 4.28x |
| **Upside bound** | **SBC not charged at all** (added back exactly as CFO does, +5.7% of revenue a year) **AND** operating margins held at the consensus-implied level (core 19.0–20.4% fading to 17.5%) | **104.24** | −51.9% | 2.08x |

**Read the upside bound carefully, because it is the most important row in this report.** It is deliberately built to be as generous as the evidence allows — it adopts the Street's own operating case *and* stops charging stock-based pay as a cost — and it still lands at **104.24/share, 51.9% below the price**. There is no assumption set inside the evidence in this pool at which a discounted-cash-flow value reaches 216.61. At the model WACC, a **uniform 3.16x** scale-up of every modelled FCFF would be required to reach the canonical EV of 41,922.7; equivalently, the market is discounting this cash-flow path at **2.63%**, below the 10-year Treasury. Either this model's cash flows are far too low, or the price embeds expectations that no cash-flow path in this evidence base supports. Adjudicating that is `05_reverse-dcf`'s job — and per MODULE_RULES Scenario Construction §1 this DCF is a **cross-check** for an operating company that has a usable forward metric and both an own-history and a peer multiple set, so its combined weight with `06` in `07`'s base point is capped at a minority (≈ ≤ ⅓). `07` must reconcile this gap explicitly under Reconciliation Gate 6 rather than let the DCF silently drag the base down; the full high-to-low field across valid methods will exceed 40%, which triggers the valuation-confidence cap of 55 in `99`.

---

## 7. Sensitivity Grid (per-share intrinsic value, USD)

**Grid A — the base dispersion exhibit.** WACC across columns, the terminal normalized operating margin down rows (the base terminal is `NOPAT/WACC`, so terminal `g` is mathematically inert in it — see §5 — and the margin is the live second axis). Base cell in bold.

| | WACC 7.85% (−1pp) | **WACC 8.85%** | WACC 9.85% (+1pp) |
|---|---:|---:|---:|
| Terminal margin 14.50% (+2pp) | 77.81 | 68.54 | 61.19 |
| **Terminal margin 12.50% (base)** | 71.31 | **63.17** | 56.71 |
| Terminal margin 10.50% (−2pp) | 64.80 | 57.81 | 52.22 |

**Dispersion around the base point: USD 52.22 – 77.81 per share.** The WACC ±1pp band spans an equivalent beta range of roughly **0.69 to 1.15**, which is the practical answer to the undisclosed reference index behind the vendor's 0.92 beta.

**Grid B — the module's required WACC × terminal-growth form**, run on the persistence terminal so that `g` is live. Every cell's `WACC − g` gap is printed beneath it; **no cell is at or within 0.5pp of zero, so no cell is NM / invalid.**

| | WACC 7.85% (−1pp) | WACC 8.85% | WACC 9.85% (+1pp) |
|---|---:|---:|---:|
| g = 3.50% (+0.5pp) | 99.60 | 81.84 | 69.64 |
| *WACC − g (pp)* | *4.35* | *5.35* | *6.35* |
| g = 3.00% (base g) | 92.74 | **77.56** | 66.79 |
| *WACC − g (pp)* | *4.85* | *5.85* | *6.85* |
| g = 2.50% (−0.5pp) | 87.15 | 73.96 | 64.33 |
| *WACC − g (pp)* | *5.35* | *6.35* | *7.35* |

Even the most favourable corner of either grid — WACC 7.85%, g 3.50%, with a terminal that assumes persistent excess returns the moat module says do not exist — reaches **99.60/share, 54% below the price**.

---

## 8. Intrinsic Read

**The base-case intrinsic value is USD 63 per share** (63.17 exactly, on 188.0m diluted shares, an 8.85% WACC and a terminal that pays nothing for growth), with a sensitivity dispersion of **USD 52 to 78** and a labelled variant span of **USD 51 (runoff) to USD 104 (an upside bound that both adopts the Street's operating case and stops charging stock-based pay)**. Against the pool-verified price of **USD 216.61** (as-of 2026-11-19), that base point is **70.8% lower**, and the stark fact is that **no assumption set inside this evidence base — including the deliberately generous upside bound — produces a discounted-cash-flow value within 50% of the price**; reaching it would need a uniform **3.16x** lift to every modelled free cash flow, or a discount rate of **2.63%**, below the 10-year Treasury.

**The single assumption the answer is most sensitive to is the normalized mid-cycle operating margin, not the discount rate.** ±2pp on the terminal margin moves the base by about **−5 to +5 per share** while ±1pp on the WACC moves it by about **−6 to +8**; but the *level* question dominates both — the whole gap between the 63 base and the 104 upside bound is (a) whether the roughly **5.7% of revenue** of stock-based compensation is a real cost (it is, §15) and (b) whether the FY2029 consensus-implied core margin near **20.4%** is a through-cycle level or a GTA VI launch-cycle peak. The Cyclicality Gate says it is a peak: the company's own realised ten-year operating margin on the vendor's ex-impairment basis is about **1.0%**, its prior-trough core margin about **2.3%**, and roughly **700bps** of the modelled improvement is the mechanical run-off of Zynga acquired-intangible amortization from the 10-K's own schedule rather than any operating gain.

**Confidence in this intrinsic read: LOW-to-MODERATE, capped, and the reasons are named.** Three bind: (1) the FY2027 base is **forward and company-guided, not trailing**, because the trailing base is negative (LTM EBIT −112.5 / −180.8, LTM §15 FCF 62.6), and the FY2029+ path is substantially **my own assumption** rather than company-guided — the thin-coverage consensus series was smoothed, not adopted as a point forecast; (2) the **Gate-2 financeable-growth gap of 2.91pp** was neutralised by making the terminal `g`-invariant rather than bridged with evidence, which is the conservative resolution but still a resolution-by-construction; (3) the **numeric reading check is absent from this generation**, so every workbook-cell figure here is mechanically unverified — each value-determining number was re-read from the frozen extract of the filing that reports it, but "unchecked" is not "clean". No partial-data cap from MODULE_RULES fires on the data itself (the cash flow statement, the balance sheet and forward estimates are all present), and terminal value at **41.1% of EV** is far below the 75% terminal-dominance line, so that cap does not bind either.

**Canonical handoff to `05_reverse-dcf` (MODULE_RULES DCF standard 9).** Invert **this** model — do not re-derive a WACC or use a different base. The fixed inputs are: **WACC 8.852%** (k_e 9.1272%, after-tax k_d 4.424%, weights 94.15% / 5.85%, normalized tax 21.0%); **horizon** ten years from 2026-09-30 (H2 FY2027 stub at t = 0.25, then FY2028–FY2036 at t = 1.00–9.00, terminal at t = 9.50); **mid-year discounting**; **terminal `g` 3.00% with terminal ROIC = WACC**; **normalized FCF base** = the FY2032–FY2036 band of **1,036–1,049** (FY2036 1,036.2), with the FY2027 full-year figure of **613.9** and the H2 FY2027 stub of **1,243.8** as the near-term anchors; and the bridge items **net debt 1,370.4 strict / 188.0m diluted shares**. The first hypothesis `05` should test is the one §3A already partly answers: the price-to-value gap here is **not** a low-discount-rate artefact, so `05` must solve for the growth-and-margin combination the 216.61 price requires and judge it against `earnings/04`'s evidence that FY2027 consensus already sits **5.6% above the midpoint and 4.3% above the top** of management's own reiterated Net Bookings range.



---

## valuation / 05_reverse-dcf.md

_Source: `05_reverse-dcf.md`_

# Reverse DCF — What's Priced In — TTWO

**Company:** Take-Two Interactive Software, Inc. (NasdaqGS:TTWO) · **Run date:** 2026-11-20
**Reporting standard:** US GAAP · **Currency:** USD, millions unless stated · **Fiscal year ends 31 March** ("FY2027" = 1 Apr 2026 → 31 Mar 2027, not a calendar year) [`FY26 10-K, cover page`; `Q2 FY27 10-Q, cover page`].
**Valuation date for discounting:** **2026-09-30** (inherited from `04`). Price anchor 2026-11-19.

**What this agent does, in one line.** `04_intrinsic-dcf` forecast cash flows forward and got USD 63.17 a share against a price of 216.61. This agent runs the identical model **backwards**: it holds `04`'s discount rate, horizon, discounting convention, terminal form and normalized cash-flow base fixed, and solves for the growth and margin **the price itself requires**. It produces no fair value. A reverse-DCF ("what's priced in") is only meaningful as the exact inverse of the forward DCF, so nothing here is re-derived.

**Price-state gate passed.** `01` §7 tags the price-state **`pool-verified`** (USD 216.61, last close, as-of 2026-11-19, 1 trading day old, no staleness cap). The reverse-DCF is therefore permitted to run. One dated limitation travels with the anchor and is not a cap: 2026-11-19 is **the Grand Theft Auto VI release date itself**, so the close contains no post-launch trading [`Q2 FY27 10-Q, Item 1A and Item 2`].

**Source-check status carried forward: UNCHECKED, not verified clean.** This frozen generation carries **no `numeric_reading_check`** object at any source or sheet level, and `GENERATION_ROOT/corpus.txt` carries no labelled extractor reading-warning annotation. There is therefore **no literal warning token, no source/extract reference and no LF-line/column span to quarantine, and no amount below is marked not-proven on that basis** — but a missing check means **unchecked, not clean**, so every workbook-cell figure used here is mechanically unverified by the pattern check. Every value-determining number was read from the frozen extract of the document that reports it, or taken verbatim from an upstream sibling that did the same. Every restating layer must carry this qualifier forward.

**Upstream inputs used.** `valuation/01_price-and-capital-structure` (price, shares, net debt, EV — adopted verbatim), `valuation/04_intrinsic-dcf` (WACC, normalized FCF base, terminal growth, horizon, discounting convention — **inverted, not re-derived**), `valuation/02` and `03` (context on the trailing-vs-forward denominator), `earnings/01_historical-financials` (the realised cash-flow and profit series that supply the base rates), `earnings/07_earnings-sensitivity` (the achievable ranges and the one-variable concentration), `business-model/07_business-quality` (the through-cycle anchor and the explicit warning that FY27–FY28 prints this cycle's peak), `business-model/09_moat` ("No moat proven" — the durability of any implied advantage period).

**The arithmetic below was produced by an executed Python solver, not by hand.** The commands and the roots they returned are reproduced in §5. Backing growth out of a price is a nonlinear root-find, and this number *is* the engine's entire "what's priced in" read.

---

## 1. Inputs

| Input | Value | Source |
|---|---:|---|
| Current price | **USD 216.61** (last close, as-of 2026-11-19, `pool-verified`) | from `01` §7 [`Capital IQ Comps → Financial Data` "Day Close Price Latest"; pinned by `ciq_facts.json → current_price`] |
| Market capitalization | **40,552.3** | from `01` §3 (187,213,488 × 216.61) |
| Net debt (strict §15: borrowings-only debt 2,519.8 − cash & equivalents 1,149.4) | **1,370.4** | from `01` §7, adopted from `balance-sheet-survival/01` [`Q2 FY27 10-Q, Note 10 (Debt)` and `Balance Sheets`] |
| Diluted shares (per-share basis) | **188.0m** | from `01` §7 — the company's own disclosed diluted count [`TTWO 2Q27 Earnings Release, 2026-11-09`] |
| **Enterprise value — the target the solver must hit** | **41,922.7** | from `01` §7 (strict cash, borrowings-only debt). No plug |
| **FCF base — normalized, forward** | **FY2028 FCFF 1,125.9**; normalized mid-cycle FY2032–FY2036 band **1,036–1,049**; near-term anchors FY2027 full-year **613.7** and H2 FY2027 stub **1,243.6** | from `04` §1 and §4 (my rebuild reproduces 04's 1,126.1 / 613.9 / 1,243.8 to 0.02%) |
| **Discount rate (WACC) used** | **8.852%** — used verbatim, not re-derived | from `04` §3: `k_e` 9.1272% (rf 5.07% web-sourced + β 0.92 × ERP 4.41% web-sourced), after-tax `k_d` 4.424% (5.60% coupon × (1 − 0.21)), weights 94.15% / 5.85% |
| Normalized tax rate | **21.0%** | from `04` §1, reconciled to `business-model/09_moat.md` §3 |
| **Forecast horizon** | **10 years** — H2 FY2027 stub at t = 0.25, FY2028–FY2036 at t = 1.00–9.00, terminal struck at t = 9.50 | from `04` §4 |
| Discounting convention | **Mid-year** (t − 0.5 equivalent), measured from 2026-09-30 | from `04` §4 |
| Terminal form and growth | **`TV = NOPAT_FY2037 / WACC`** (terminal ROIC = WACC, so growth creates no value), with the **`g` = 3.00%** label rolling NOPAT forward one year | from `04` §5 |
| Business type | **Operating** (single operating and reportable segment) → invert the FCFF / EV model, not a DDM or residual-income model | `00_valuation-data-triage` §3; `FY26 10-K, Note 21`; MODULE_RULES Business-Type Method Map |
| Reference point: `04`'s forward answer | **EV 13,245.3** (04: 13,247.2) → **USD 63.16/share** (04: 63.17) | my rebuild, §5 Step 0 — the model is reproduced before it is inverted |

**Why the base is forward and not trailing, stated so the reader can see the choice.** The trailing earnings base is **negative**: LTM EBIT −112.5 (vendor) / −180.8 (filing-derived), LTM diluted EPS −1.29, and LTM §15 FCF of only 62.6 (CFO 367.1 − total capex 304.5) [`earnings/01` §2; `CIQ Financials_Quarterly → Income Statement / Cash Flow`, LTM Sep-30-2026]. You cannot compound a price off a negative or near-zero base — any trailing-anchored implied-growth number would be arithmetic noise. The base used is therefore **`04`'s forward, company-guided FY2027 and its modelled FY2028 level**, and every implied figure below is labelled with the base it was struck on.

**Tie-out before inversion (the test that this really is the same model).** Rebuilding `04`'s assumptions from §2 of that report — revenue path, the 10-K's own acquired-intangible amortization schedule, D&A 2.41% of revenue, content amortization 7.5%→11.0%, content cash spend 11.0%, fixed capex, net working capital held at −11.0% off the actual −701.1 at 2026-09-30, tax 21.0% — reproduces the FCFF path, the H2 FY2027 stub of 1,243.6, PV of explicit flows 7,802.3, PV of terminal 5,443.0, EV **13,245.3** and **63.16/share**, against `04`'s 1,243.8 / 7,804.2 / 5,443.0 / 13,247.2 / 63.17. The 0.014% gap is `04`'s displayed rounding on the D&A lines. **Same model, same rate, same base, same convention.**

---

## 2. Implied Expectations

**What was held fixed:** the discount rate (8.852%), the 10-year horizon and its exact `t` schedule, the mid-year convention, the terminal form (`NOPAT/WACC`, terminal ROIC = WACC) and its 3.00% roll-forward, the 21.0% tax rate, the bridge (net debt 1,370.4 strict, nil minority, nil preferred, 188.0m shares), **and the already-reported H1 FY2027 (−629.9 of FCFF, a fact, not an expectation)**. The H2 FY2027 stub of 1,243.6 is also held fixed, because it is the company's own guidance for a half-year that was two-thirds of the way through when the anchor price was struck.

**What was solved for:** in each row, the single named variable that makes the present value equal today's enterprise value of 41,922.7.

| What the Price Implies | Solved Value |
|---|---:|
| **Implied FCFF CAGR over the horizon** — the constant annual growth rate of free cash flow to the firm, FY2028 → FY2036, off `04`'s own modelled FY2028 FCFF of 1,125.9, terminal struck on the same form | **+20.47% a year for 9 years** |
| ↳ the FCFF path that implies (USD m, FY2028 → FY2036) | 1,126 · 1,356 · 1,634 · 1,969 · 2,372 · 2,857 · 3,442 · 4,147 · **4,996** |
| ↳ implied FY2036 FCFF versus `04`'s modelled FY2036 FCFF of 1,036 | **4.82x** |
| ↳ terminal value at the solved point, as a share of EV | **62.6%** (vs 41.1% in `04`'s base) |
| **Implied steady-state core EBIT margin** — one flat operating margin before acquired-intangible amortization, FY2028 → terminal, holding `04`'s revenue path and every capex / working-capital / amortization ratio fixed | **45.78% core / 45.56% GAAP EBIT** |
| ↳ implied FY2036 EBIT on `04`'s consensus-derived revenue of 10,791.7 | **4,917** |
| **Implied years of above-GDP growth (fade model)** — FCFF grows at a stated rate `H` for `N` years, then the terminal is struck; solve for `N` | see the three cases below |
| ↳ at `H` = **3.13%** (the consensus FY2028→FY2034 revenue CAGR `04` §2 actually used) | **No finite horizon reaches the price.** Maximum EV as `N` → ∞ is **20,893** — half the market's 41,922.7 |
| ↳ at `H` = **7.56%** (TTWO's own post-Zynga revenue CAGR, FY2023 → FY2026) | **40 years** of uninterrupted above-GDP growth |
| ↳ at `H` = **17.40%** (TTWO's own FY2022 → FY2026 revenue CAGR, which embeds the Zynga acquisition) | **10 years** |
| **Implied revenue trajectory** — the implied FY2036 FCFF converted back to revenue at `04`'s own fixed FY2036 FCFF-to-revenue conversion of **9.60%** (margin and cash conversion held, per the market-ceiling rule) | **FY2036 revenue ≈ 52,045**, an implied revenue CAGR of **23.00%** from the guided FY2027 base of 8,080 |

**Read the three solves together, because they are three descriptions of one requirement.** They are not independent findings. The price needs `04`'s cash-flow path lifted by a factor that rises to 4.8x by FY2036 — expressed as growth that is 20.5% a year, expressed as margin that is a flat 45.8%, expressed as revenue that is 52bn. Each is the same gap measured on a different axis, and `04` §3A already named its size from the other direction: a **uniform 3.16x** lift to every modelled free cash flow at the model WACC.

**One thing the solve reveals that `04`'s forward run did not.** At the implied growth rate the terminal value rises to **62.6% of EV**, from 41.1% in `04`'s base. So the price is not only asking for more cash flow — it is asking for a much larger share of the value to sit beyond FY2036, in the perpetuity. That is why the terminal-`g` robustness in §4 is run rather than skipped.

---

## 2A. Implied Discount Rate — the dual solve

A DCF is one equation with two unknowns: the cash flows and the rate. §2 held the rate and solved for growth. This is the mirror: hold `04`'s own base-case cash flows verbatim and solve for the rate.

| Solve | Held fixed | Solved value |
|---|---|---:|
| **Implied discount rate at `04`'s base-case cash flows** | `04`'s FCFF path FY2027–FY2036 verbatim, the H1 FY2027 strip-out, terminal `g` 3.00%, 10-year horizon, mid-year convention, target EV 41,922.7 | **2.63%** |
| `04`'s model WACC (for comparison) | — | **8.852%** |
| **Ratio (implied ÷ model)** | — | **0.297x** (the model rate is **3.37x** the implied rate) |
| Memo — the 10-year US Treasury used as `04`'s risk-free rate | — | 5.07% [`Web: US 10-year Treasury yield, 2026-11-19 (indicative, unverified)`] |

**Reported into `04` §3A, and it reconciles exactly.** `04` §3A already carries the market-implied rate as **≈ 2.63%**, solved in its own §4 snippet; my independent re-solve returns **2.6321%**. The two agree. `04`'s Cost-of-Capital Reality Test escalation did not fire and **no `RF-VAL-003` tag is emitted here either** — the trigger is "model WACC **below** ~two-thirds of the market-implied rate", and the model rate is 3.37x the implied rate, the opposite direction.

**Which way it cuts — both readings stated, one chosen on evidence.** The ratio does **not** exceed ~1.5x; it is 0.297x, so the "market is pricing an unprecedented collapse" failure mode this test guards against cannot arise here. The extreme ratio runs the other way, and the two readings are these:

- **Reading A — the cash flows are wrong (the model's are too low).** The market is pricing cash flows far above `04`'s path. Tested against the company's own history and the earnings evidence in §3 below. **This is the live reading**, and sizing it is exactly what §2 did.
- **Reading B — the rate is wrong (the model discounts too cheaply).** For Reading B to explain the gap, the *true* cost of capital would have to be **2.63%** — **244 basis points BELOW the 5.07% risk-free rate** the model is built on. An equity cost of capital below the government bond is not a cost of capital; it is an arithmetic impossibility for a listed, levered, cyclical equity. Three further checks rule it out: (i) `04`'s WACC **cleared every low-side floor** — the equity-risk-premium floor at `k_e − rf` = 4.06pp (narrowly, and stated as such), the beta floor with a raw vendor beta of 0.92 above the ~0.8 artefact line, and a deliberate, reasoned no-country-risk choice for a USD-reporting Delaware filer [`04` §3]; (ii) the model rate sits **4.11pp ABOVE** the only numeric discount rate the company itself discloses anywhere in this pool, the 4.74% weighted-average operating-lease rate [`FY26 10-K, Note 13 (Leases)`] — and even that comparator is a pre-tax incremental **borrowing** rate on lease obligations, which fails the scope match and is below where a WACC belongs; (iii) no scope-matched group discount rate exists in the pool at all — the FY26 10-K references "risk-adjusted discount rates based on our weighted average cost of capital" for goodwill testing but states **no number** [`FY26 10-K, Critical Accounting Policies — Goodwill`; `Note 9`].

**So Reading B is rejected on evidence, not by default.** The gap between `04`'s value and the price is a **cash-flow-expectations gap**, not a discount-rate artefact. That is the same conclusion `04` §3A reached, now confirmed from the inverse direction — and it is the reason this module's whole job is to size and test those expectations rather than argue about the rate.

---

## 3. Implied vs Achievable

**The base-rate matching comes first, because this is where a reverse-DCF read on a mid-release-cycle publisher goes wrong (CLAUDE.md §9).** The claim being tested is a **forward cash-flow (profit) growth** claim, at **group** level, compounding **from an FY2028 base that is itself a launch-cycle peak**. So the base rate must match on all three: metric (profit/cash flow, not revenue), level (group — and here the pool forces that, see below), and period (peak-to-peak, not trough-to-peak, and weighting recent realised periods above a decade-old average).

**On level, the decomposition the rule asks for cannot be performed, and that is a disclosed fact rather than a shortcut.** TTWO has **one** operating and reportable segment [`FY26 10-K, Note 21`], which is why `06_sum-of-the-parts` returned "not applicable". The driver of the claim is a single title: `earnings/07` §4 establishes that the guided Q3 FY2027 step-up of **+1,667.9** of Net Bookings is **120.9% of the entire year's guided growth** — the other three quarters shrink by 288.9 in aggregate — but also that **"GTA VI's own share of the 1,667.9 is not disclosed anywhere in the pool"**, and no Q3 FY26 filing exists from which to derive the prior-year recurrent-spending base. The engine can size the quarter and cannot size the title inside it. So the test runs at group level with that limitation named, not at a title level the disclosure does not support.

| Implied Requirement | Company History (metric-, level- and period-matched) | Earnings-Module Evidence | Achievable? |
|---|---|---|---|
| **Implied FCFF CAGR = +20.47% a year for 9 years, FY2028 → FY2036, off an FY2028 base of 1,125.9** | **Metric-matched (§15 FCF = CFO − total capex), the closest match to the claim:** FY2022 99.4 → FY2023 **(203.1)** → FY2024 **(185.2)** → FY2025 **(234.9)** → FY2026 434.1 → **LTM Sep-26 62.6**. Three of the last five years were **negative**, so no multi-year CAGR is computable through the middle of the series. The only computable full-span rate, FY2022 → LTM Sep-2026, is **−9.76% a year** [`earnings/01` §1–§2] | `earnings/07` §7 scores earnings volatility **78/100 (inverted — higher = worse)**: on the one comparable metric the top variable is 2.4x the second and up to 4.0x it at the fixed-cost bound, and EBIT margin swings from −7.8% actual to +14.4% guided on the same cost base in consecutive quarters. `earnings/07` §6 shows the downside coefficient is **1.0x to 2.0x** the upside coefficient, because the content-amortization policy charges at the **greater of** revenue-proportional or straight-line over 9–36 months | **No** |
| **Implied steady-state core EBIT margin = 45.78% (45.56% GAAP)** | Own prior **peak** 19.8% (FY2021, pre-Zynga); own prior **trough** core ~2.3% (FY2024 3.2% / FY2025 1.4%); ten-year realised operating margin ≈ **1.0%** on the vendor's ex-impairment basis; `04`'s base terminal **12.50%** [`04` §5, each anchor cited there] | Peer-normal EBIT margin, ten-peer median: **+15.9%**; the highest LTM **EBITDA** margin anywhere in the peer set is Konami's 39.6% [`CIQ Comps → Operating Statistics` / `→ Trading Multiples`, As-Of 2026-11-19, via `03` §2]. The implied **EBIT** margin of 45.6% is **2.9x** peer-normal and **2.3x** the company's own best year ever | **No** |
| **Implied years of above-GDP growth** | At the consensus growth rate `04` actually used (3.13%), **no horizon of any length reaches the price** — the maximum attainable EV is 20,893, **50.1%** of the market's 41,922.7. At the company's own post-Zynga organic revenue CAGR of 7.56%, the price needs **40 consecutive years** | `business-model/09_moat.md` §5 returns **"No moat proven"** — four moat sources present, **none** reaching the 61–80 "strong" band, and the economic test failing on every basis (five-year through-cycle ROIC −0.7% against ~8.2% WACC; LTM −2.2%). ROIC has been negative **five years running**: −4.3%, −3.1%, −4.2%, −0.8%, −1.0% LTM [`ciq_facts.json → multi_year_trajectory`]. A 40-year advantage period requires a moat the moat module could not evidence for one year | **No** |
| **Implied FY2036 FCFF = 4,996** | **11.5x** the company's best-ever annual §15 FCF (434.1, FY2026) and **80x** the LTM figure of 62.6 [`earnings/01` §1–§2] | `earnings/07` §6 asymmetry 2: impairment is a step, not a slope — **2,149.7** of capitalised cost related to **unreleased** titles at 2026-03-31, equal to **61.2%** of total stockholders' equity, against a carried balance of 2,577.3 at 2026-09-30, with 43.6 already charged in H1 FY27 | **No** |

**Adjudicating the number that disagrees, by name (CLAUDE.md §3).** There **is** a series in the engine's own data that comes out at almost exactly the implied rate, and it must be named rather than left out: the company's **nine-year EBITDA CAGR from FY2017 to FY2026 is +20.33%** (149 → 788) [`ciq_facts.json → multi_year_trajectory` (`CIQ Financials → Income Statement`), tier-5 vendor export]. Against an implied 20.47%, that is a gap of **+0.14pp** — on its face, the price looks like it is asking for exactly what the company has done for nine years. Three reasons it does not rescue the verdict, each testable:

1. **Period mismatch — it is a trough-to-peak measurement being used to test a peak-to-peak claim.** FY2017 EBITDA of 149 was an 8% margin on revenue of 1,780, struck between the GTA V tail and the Red Dead Redemption 2 launch. The forward claim starts in **FY2028**, which this engine's own business-quality read says will print this cycle's **peak**: *"Grand Theft Auto VI launched November 19, 2026, and FY27–FY28 will print this cycle's peak. A peak-year ROIC or margin off that launch is not the through-cycle level any more than today's −1.0% is"* [`business-model/07_business-quality.md` §4]. The period-matched base rate for compounding **from one cycle peak** is **peak-to-peak**: FY2021 EBITDA 757 → FY2026 788 = **+0.81% a year over five years**. That is the comparable, and it is 19.66pp below the implied rate.
2. **Metric mismatch — EBITDA is the wrong unit for this company's cash flow.** EBITDA excludes the single largest discretionary cash cost in the business: software development spend of **688.9** in FY2026, which sits **inside** operating cash flow and not in capex [`FY26 10-K, Consolidated Statements of Cash Flows`, p.66; `earnings/01` §1]. It also excludes stock-based compensation, guided at **462** for FY2027 (5.72% of guided revenue, +51.3% above FY2026's 305.3 actual) [`TTWO 2Q27 Earnings Release, 2026-11-09, Outlook`]. On the metric that actually matches the claim, the realised four-and-a-half-year rate is **−9.76% a year**.
3. **Level / inorganic mismatch.** The FY2017→FY2026 window contains the **Zynga acquisition** (FY2023), which alone took revenue from 3,504.8 to 5,349.9 in one year. Strip it and the company's own organic revenue CAGR, FY2023 → FY2026, is **7.56%** — the rate at which the price needs 40 years.

So the agreeing number is real, is named, and is a trough-to-peak EBITDA measurement on an acquisition-inflated window. It does not overturn the verdict; it is the clearest illustration of why the unit of the base rate has to match the unit of the claim.

**One further check that runs in the price's favour, and it still does not get there.** The market may reasonably be pricing consensus rather than `04`'s model. Consensus is on the company's **management-reporting** basis — it adds back stock-based compensation (462), acquired-intangible amortization (623) and the change in deferred net revenue (47), and applies an 18% tax rate [`03` §2, which reconciles the stack to the cent]. `04`'s **upside bound** is built precisely to adopt that view: it stops charging stock-based pay altogether and lifts core margins to the consensus-implied 19.0–20.4%, producing an FY2028 FCFF of **1,611.5** and a value of 104.24/share. Solving the implied growth off **that** generous base still returns **+14.18% a year for nine years** — against a peak-to-peak realised rate of 0.81% and a consensus long-run rate of 3.13%. The conclusion does not depend on charging stock-based compensation.

**Judgement, in four sentences.** At USD 216.61 the market's implied expectations are **aggressive**, and not marginally so. The price requires free cash flow to compound at **20.5% a year for nine years off an already-elevated launch-cycle base**, or a flat **45.8% operating margin** — against a company whose realised free cash flow has fallen at **9.8% a year** since FY2022, whose profit between cycle peaks grew **0.81% a year**, whose return on capital has been negative five years running, and whose own forward consensus carries a long-run revenue growth rate of **3.13%**. The requirement survives none of the generous adjustments available inside this evidence base: at consensus growth the price is **unreachable at any horizon**, and even adopting the Street's margins and refusing to charge stock-based pay leaves 14.2% a year to be found. The single most important qualifier runs the other way and must travel: **no reported period contains a single dollar of GTA VI revenue** [`earnings/07` §4] — the engine is testing an expectation about an unshipped-until-the-anchor-date title against history, which is the only test available and is not the same as proof the expectation is wrong.

**Market-ceiling sanity check (one-directional — it can only raise the bar).** TTWO is an operating business, so the test applies, and the implied FCFF growth has been converted to an implied **revenue** trajectory first: holding `04`'s own FY2036 FCFF-to-revenue conversion of **9.60%** fixed, the implied FY2036 FCFF of 4,996 requires revenue of about **52,045** — an implied revenue CAGR of **23.00%** from the guided FY2027 base of 8,080, against `04`'s consensus-derived FY2036 revenue of 10,791.7 (**4.8x**).

**Honest limitation on sizing the market, stated rather than papered over.** **No addressable-market, category-revenue or industry-size figure exists anywhere in this data pool** — not in the 10-K, not in the 10-Q, not in any Capital IQ tab. Market size is a low-tier input (CLAUDE.md §4) and inventing a TAM would be worse than omitting the check. What the pool *does* contain is a defensible **proxy scale**: the LTM revenue of the ten companies in TTWO's own named peer set [`CIQ Comps → Financial Data`, As-Of 2026-11-19, via `03` §1], which sums to **41,255.2**; with TTWO's own 6,409.7 that is a **47,664.9** eleven-company revenue pool, of which TTWO is **13.4%** today. The implied 52,045 is **109% of that entire pool** and would take TTWO's share to **55.8%** with peers held flat. Two qualifiers travel with that figure, and the second is the one to rely on: (i) the proxy **understates** the category, because TTWO also names Tencent, Sony, Microsoft, Nintendo, Apple, Google, Epic Games, Playrix, Savvy Games and Embracer as competitors and no game-publishing revenue line is derivable for the conglomerates or the private firms [`FY26 10-K, Item 1 — Competition`], so the "109% of the pool" share is an upper bound on the required share, not a measurement; (ii) the robust statement needs no TAM at all — **the implied FY2036 revenue of 52,045 is 3.8x the LTM revenue of the single largest company in TTWO's own named peer set** (Nintendo, 13,684.5), meaning the price requires Take-Two to become, within ten years, nearly four times the size Nintendo is today. **On market-ceiling grounds the implied expectation is flagged aggressive / unachievable regardless of the company's own history.** This check has only raised the bar; it justifies no upside and lifts no fair value.

---

## 4. Robustness

**(a) Discount rate ±1pp, with the FCF base held at `04`'s own FY2028 level of 1,125.9.**

| Discount Rate | Implied FCFF CAGR to Justify Price |
|---|---:|
| WACC −1pp (7.852%) | **17.79%** |
| **WACC (8.852%, `04`'s rate)** | **20.47%** |
| WACC +1pp (9.852%) | **23.02%** |

**(b) FCF base low / base / high, with the discount rate held at 8.852%. All three anchors come from `04`; none is invented here.**

| FY2028 FCFF anchor | What it is | Implied FCFF CAGR |
|---|---|---:|
| **LOW — 613.7** | `04`'s **FY2027 full-year modelled FCFF** on the company's own 2026-11-09 guidance — i.e. the FY2028 operating step-up does not happen at all [`04` §1, §4] | **31.38%** |
| **BASE — 1,125.9** | `04`'s modelled FY2028 FCFF (core margin 17.50%, set ~240bps **below** the Street's own implied level) [`04` §2] | **20.47%** |
| **HIGH — 1,611.5** | `04`'s **upside bound**: stock-based pay not charged at all (+5.7% of revenue pre-tax) **and** core margin at the consensus-implied 19.0% [`04` §6] | **14.18%** |

**(c) Terminal `g` ±0.5pp — run because terminal value is 62.6% of EV at the solved point, above the ~60% line.**

| Terminal `g` | Implied FCFF CAGR, `04`'s BASE terminal form (`TV = NOPAT/WACC`; `g` only rolls NOPAT forward one year) | Implied FCFF CAGR, `04`'s PERSISTENCE terminal (Gordon on FCFF, where `g` is live in the denominator) |
|---|---:|---:|
| 2.50% (−0.5pp) | 20.53% | 16.82% |
| **3.00% (`04`'s `g`)** | **20.47%** | 15.80% |
| 3.50% (+0.5pp) | 20.42% | 14.69% |

**How to read (c), because the two columns say different things and both are true.** In `04`'s **base** terminal, terminal ROIC is set equal to the WACC, so `TV = NOPAT/WACC` and growth creates no value — `g` is **mathematically almost inert**, moving the implied rate by 0.06pp across the whole ±0.5pp band. That is a genuine strength of the inversion: the headline 20.47% is not a terminal-growth artefact. The second column shows what happens if the terminal is instead struck on `04`'s **persistence** variant, which assumes terminal ROIC **above** the cost of capital — the implied requirement falls to 14.7–16.8%. `business-model/09_moat.md` §5 returns "No moat proven" and five straight years of negative ROIC, so that variant is **not** supported and is shown as a labelled cross-check, exactly as `04` treats it. Even on it, the implied rate remains roughly **18x** the company's realised peak-to-peak profit growth of 0.81% a year.

**The dominant input is the FCF BASE, not the discount rate — and the margin is wide.** A ±1pp move in the discount rate shifts the implied growth by **5.23pp**; the FCF-base band shifts it by **17.20pp**, **3.3x** as much. Terminal `g` is third by a wide distance (0.11pp on the faithful base form). This matches every prior output that examined it: the answer is set by what you think the normalized cash-flow level is, not by what you discount it at. And it is the reason the §2A dual solve matters — the price's disagreement with `04` is a disagreement about the **level of cash flow**, which §2 sizes, not about the rate, which §2A rules out.

**What does NOT move the verdict.** Every cell in every panel above — the most generous being a 7.852% discount rate, the Street's own margins, no charge for stock-based pay, and a terminal that pays for growth the moat module says does not exist — requires free cash flow to compound at **at least 14.18% a year for nine years**. The company's realised rate on the metric-matched series is **−9.76% a year**, its peak-to-peak profit growth is **+0.81% a year**, and its own forward consensus carries **3.13%**.

---

## 5. Executed Solver — commands and roots

Run on 2026-11-20. The model is rebuilt from `04`'s §2 assumption table, tied out against `04`'s published output, and only then inverted. Bisection is used in place of `scipy.optimize.brentq` (scipy is not installed in this environment); it is a bracketed root-find on the same monotone functions, converged to 1e-12.

```
$ python3 rev.py   # executed 2026-11-20
STEP 0  reproduce 04
  FY2027..FY2036 FCFF: 613.7 1125.9 1184.5 1138.4 1093.7 1048.3 1041.6 1033.5 1031.5 1035.9
  H2 FY27 stub 1243.6  PVexplicit 7802.3  PV(TV) 5443.0  EV 13245.3  (04: 1243.8 / 7804.2 / 5443.0 / 13247.2)
  TV%EV 41.1%  equity 11874.9  /188.0 = 63.16/sh
  terminal mechanics: NOPAT36/FCFF36 = 1.01082 -> TV = FCFF_last x 1.03 x 1.01082 / WACC

STEP 1  PRIMARY SOLVE -- implied FCFF CAGR
  held fixed: WACC 8.852%, 10-yr horizon, mid-year DF, terminal = NOPAT/WACC form,
              H2 FY2027 stub 1243.6 (company-guided, H1 reported stripped),
              bridge net debt 1370.4 / 188.0m shares, target EV 41922.7
  solved for: the constant annual growth rate of FCFF, FY2028 -> FY2036,
              off 04's own modelled FY2028 FCFF of 1125.9
  ROOT: implied FCFF CAGR = 20.47%  (EV check 41922.7 vs target 41922.7)
  implied FCFF path FY2028..FY2036: 1126 1356 1634 1969 2372 2857 3442 4147 4996
  PVexplicit 15670  PV(TV) 26253  TV%EV 62.6%
  implied FY2036 FCFF 4996 vs 04 modelled 1036 = 4.82x
  04's FY2036 FCFF/revenue conversion = 9.60%
  -> implied FY2036 REVENUE at that fixed conversion = 52,045
     (vs 04/consensus FY2036 revenue 10,791.7; implied rev CAGR FY2027->FY2036 = 23.00%)

STEP 2  SECONDARY SOLVE A -- implied uniform steady-state CORE operating margin
  ROOT: implied flat core margin = 45.78%   (EV check 41922.7)
        implied GAAP EBIT margin in FY2036 = 45.56%
        implied FY2036 EBIT = 4,917 on revenue 10,791.7
  anchors (04 §5): peer-normal EBIT 15.9% | own prior peak 19.8% (FY2021) | consensus fwd peak core 20.4%
                   own prior-trough core ~2.3% | 04 base terminal core 12.50%

STEP 3  SECONDARY SOLVE B -- implied years of above-GDP growth (fade model)
  at H=3.13% (consensus FY28->FY34 revenue CAGR): NO finite horizon reaches the price.
      Max EV as N->inf = 20,893 vs target 41,922.7
  at H=7.56% (own post-Zynga revenue CAGR FY23->FY26): N = 40.0 years of growth needed
  at H=17.40% (own FY22->FY26 revenue CAGR, Zynga-inflated): N = 10.0 years

STEP 4  §2A DUAL SOLVE -- implied discount rate on 04's OWN base-case cash flows
  ROOT: implied discount rate = 2.63%  (EV check 41,922.7)
  model WACC 8.852%  ->  ratio implied/model = 0.297x   (model is 3.37x the implied rate)
  vs 10-yr UST 5.07%: implied rate is -2.44pp vs the risk-free rate
  04 §3A reported 2.63% -> reconciles

STEP 5  ROBUSTNESS
  FCF-base band for the FY2028 anchor (all from 04):
    LOW    613.7  = 04's FY2027 full-year modelled FCFF (company-guided; no FY28 margin step-up)
    BASE  1125.9  = 04's modelled FY2028 FCFF
    HIGH  1611.5  = 04's upside bound (SBC not charged, +5.7% of revenue; core margin 19.0%)
  (a) discount rate +/-1pp, FCF base at 04's BASE
    WACC -1pp  7.852%: implied FCFF CAGR =  17.79%
    WACC       8.852%: implied FCFF CAGR =  20.47%
    WACC +1pp  9.852%: implied FCFF CAGR =  23.02%
  (b) FCF base low / base / high, discount rate at 8.852%
    FY2028 FCFF LOW  613.7: implied FCFF CAGR =  31.38%
    FY2028 FCFF BASE 1125.9: implied FCFF CAGR =  20.47%
    FY2028 FCFF HIGH 1611.5: implied FCFF CAGR =  14.18%
  (c) terminal g +/-0.5pp  (TV is 62.6% of EV at the solved point, >60% -> required)
    terminal g 2.5% (04 base form, TV=NOPAT/WACC): implied CAGR =  20.53%
    terminal g 3.0% (04 base form, TV=NOPAT/WACC): implied CAGR =  20.47%
    terminal g 3.5% (04 base form, TV=NOPAT/WACC): implied CAGR =  20.42%
    cross-check on 04's PERSISTENCE (Gordon) terminal, where g is live in the denominator:
      terminal g 2.5% Gordon-on-FCFF: implied CAGR =  16.82%
      terminal g 3.0% Gordon-on-FCFF: implied CAGR =  15.80%
      terminal g 3.5% Gordon-on-FCFF: implied CAGR =  14.69%
  SWING: discount-rate +/-1pp moves the implied CAGR by 5.23pp;
         the FCF-base band moves it by 17.20pp  -> the BASE dominates by 3.3x

STEP 6  MARKET-CEILING INPUTS
  sum of the ten listed/named peers' LTM revenue = 41,255.2; + TTWO LTM 6,409.7 = 47,664.9
  implied FY2036 revenue (from STEP 1) = 52,045
    = 109% of that 11-company revenue pool
    = 3.8x the largest company in the peer set (Nintendo LTM 13,684.5)
    = 4.8x 04's consensus-derived FY2036 revenue of 10,791.7
    implied TTWO share of the pool rises from 13.4% today to 55.8% (peers held flat)

BASE RATES (period- and metric-matched)
  sec15 FCF: FY2022 99.4 / FY2023 (203.1) / FY2024 (185.2) / FY2025 (234.9) / FY2026 434.1 / LTM 62.6
    FY2022 -> LTM Sep-26 (4.5y)      = -9.76%/yr   [the metric-matched base rate]
    no multi-year CAGR computable through FY2023-FY2025: three negative years
  EBITDA FY2021 757 -> FY2026 788 PEAK-to-PEAK = +0.81%/yr over 5y   [the period-matched base rate]
  EBITDA FY2017 149 -> FY2026 788 (9y)         = +20.33%/yr          [the number that AGREES - adjudicated in §3]
  revenue FY2023 5349.9 -> FY2026 6656.4       = +7.56%/yr   (post-Zynga, organic)
  revenue FY2022 3504.8 -> FY2026 6656.4       = +17.39%/yr  (Zynga-inflated)
  consensus FY2028 -> FY2034 revenue CAGR      = +3.13%      (04 §2)
  04 modelled FCFF FY2028 1125.9 -> FY2036 1035.9 = -1.04%/yr
  implied 20.47% vs peak-to-peak 0.81%  -> gap +19.66pp
  implied flat core margin 45.78% vs peer-normal EBIT 15.9% -> 2.9x ; vs own peak 19.8% -> 2.3x
  implied FY2036 FCFF 4996 vs best-ever FCF 434.1 -> 11.5x ; vs LTM 62.6 -> 80x
```

---

## 6. What's-Priced-In Read

**At USD 216.61 (as-of 2026-11-19, pool-verified), the market is pricing free cash flow to compound at 20.5% a year for nine years — FY2028 to FY2036 — off a base that is already a launch-cycle peak, ending at 4,996 of annual free cash flow, 11.5x the most the company has ever generated in a year.** Expressed on the margin axis the same requirement is a flat **45.8% operating margin**, which is 2.9x the ten-peer median of 15.9% and 2.3x TTWO's own best year ever; expressed on the revenue axis it is **52bn of revenue by FY2036**, nearly four times the size of the largest company in Take-Two's own named peer set today.

**That is aggressive, on evidence rather than assertion.** The metric-matched base rate — the company's own §15 free cash flow — has fallen at **9.8% a year** since FY2022 with three negative years inside the series; the period-matched base rate for compounding out of a cycle peak is **peak-to-peak profit growth of 0.81% a year** (FY2021 EBITDA 757 → FY2026 788); its own forward consensus carries a long-run revenue growth rate of **3.13%**, at which **no horizon of any length** reaches the price (maximum attainable EV 20,893, half the market's 41,922.7); return on capital has been negative five years running and the moat module returns **"No moat proven"**, which is the opposite of the 40-year advantage period the price needs at the company's own organic growth rate. Every generous lever available inside this evidence base was pulled — the Street's own margins, no charge for stock-based pay, a 1pp lower discount rate, a terminal that pays for growth — and the requirement never falls below **14.2% a year**.

**Which way this cuts, and the one qualifier that must travel with it.** Implied expectations sit far above what the company's record can plausibly deliver, and that is **downside**, not upside. The honest counterweight is dated and specific: **no reported period contains a single dollar of Grand Theft Auto VI revenue** — the title released on 2026-11-19, the anchor price's own date — so this is a test of an expectation against history, not a measurement of a failure. The first number that discriminates is already scheduled: the **Q3 FY2027 print on or about 2027-02-09**, the first full quarter with GTA VI on sale, against guided GAAP revenue of 3,270–3,420 and cost of revenue of 1,649–1,732 [`TTWO 2Q27 Earnings Release, 2026-11-09`; `CIQ Estimates → Consensus` header]. A print at the top of that range still leaves roughly 14–20% annual compounding to be found for nine years; it is what would have to happen **repeatedly** for a decade, not once, that the price is asking for.

---

## 7. Self-Check

- **Price and EV match `01`** (216.61 / 41,922.7) and `01`'s price-state is **`pool-verified`** — the partial-data stop did not apply and is recorded as tested.
- **The discount rate (8.852%), normalized FCF base (FY2028 1,125.9; mid-cycle 1,036–1,049), terminal growth (3.00% with terminal ROIC = WACC), horizon (10 years, H2 FY27 stub at t = 0.25 → terminal at t = 9.50) and discounting convention (mid-year from 2026-09-30) are taken from `04_intrinsic-dcf` verbatim.** Nothing was re-derived. The rebuild reproduces `04`'s EV (13,245.3 vs 13,247.2) and per-share value (63.16 vs 63.17) before inverting, so the two reports are the same model read in two directions. No "unreconciled" flag is required.
- **The discount rate is stated explicitly with its basis** (§1), including that its risk-free rate and ERP are web-sourced and labelled unverified in `04`.
- **Every solve states what was held fixed and what was solved for** (§2 preamble, §2A table, §5 snippet headers).
- **Implied expectations are compared to the company's actual history on a metric-, level- and period-matched basis** (§3), and the one series that agrees with the implied figure — the +20.33% nine-year EBITDA CAGR — is **named and adjudicated** rather than omitted (CLAUDE.md §3, §9).
- **The achievable / stretch / no judgement is evidence-backed:** every row cites a realised series, a peer figure or an upstream module row.
- **Robustness is shown across BOTH the discount rate AND the FCF base, plus terminal `g` ±0.5pp** (required because terminal value reaches 62.6% of EV at the solved point), **with the dominant input named** — the FCF base, by 3.3x.
- **The primary solve and all robustness re-solves were produced by an executed Bash/Python solver**, with the commands and the roots shown verbatim in §5 (fix F11). Nothing was hand-computed.
- **§2A dual solve run:** implied discount rate **2.63%** (executed, root shown), ratio to `04`'s model WACC **0.297x**, reconciled against `04` §3A's own 2.63% figure. The ratio does **not** exceed ~1.5x — it is extreme in the opposite direction — so that branch does not fire; **both readings are stated anyway and Reading B (the rate is wrong) is rejected on evidence**, because it would require a cost of capital 244bps below the risk-free rate, because `04`'s WACC cleared every low-side floor, and because the model rate sits 4.11pp above the only numeric rate the company discloses. No `RF-VAL-003` tag is emitted, and emitting one would be a false cap.
- **Business-type gate honoured:** TTWO is an Operating company (single reportable segment), so the FCFF / EV model was inverted — not a DDM or residual-income model.
- **Market-ceiling check run, one-directional, and it raised the bar.** The implied FCF growth was converted to an implied revenue trajectory first (holding `04`'s 9.60% FY2036 conversion fixed). No TAM was invented: the pool contains no market-size figure, which is stated, and the peer-revenue proxy is published with its understatement limitation. The robust finding rests on the 3.8x-Nintendo comparison, which needs no TAM.
- **Scope respected:** no fair value, no scenario probability, no probability-weighted target, no risk/reward, no rating, no position size. This module measures what is priced in; `07_scenario-and-fair-value` owns the levels and the master synthesizer owns the bet.
- **Source-check status (UNCHECKED, not clean) carried forward** in the header and must travel with any restatement.
- **No banned phrases.** "Aggressive" is used only alongside the solved numbers and the base rates it is measured against; no yield is quoted anywhere (TTWO has never paid a dividend and none is expected [`FY26 10-K, Item 5`]).



---

## valuation / 06_sum-of-the-parts.md

_Source: `06_sum-of-the-parts.md`_

# Sum-of-the-Parts — TTWO

**Company:** Take-Two Interactive Software, Inc. (NasdaqGS:TTWO) · **Run date:** 2026-11-20
**Reporting standard:** US GAAP · **Reporting currency:** USD, millions unless stated · **Fiscal year ends 31 March** ("FY2026" = year ended 2026-03-31; latest balance sheet 2026-09-30 = Q2 of FY2027). Jurisdiction: US SEC domestic filer — Form 10-K and Form 10-Q are the actual local documents [`FY26 10-K, cover page`; `Q2 FY27 10-Q, cover page`].

**Headline verdict of this agent, stated before any table so it cannot be mistaken for a breakup value: a sum-of-the-parts cannot be built for Take-Two, because Take-Two has only one part.** The company reports **one operating and reportable segment**, its segment measure of profit **is** consolidated net income (loss), and its segment assets **are** consolidated total assets [`FY26 10-K, Note 21 (Segment Reporting and Geographic Information), p.102`]. Per MODULE_RULES "Segment / SOTP Rule" and this agent's own partial-data rule, **SOTP collapses to the consolidated read**. What follows is that collapse, plus one labelled forward multiple sanity check — **not** a breakup value, and **not** a weighted method for `07`.

**Source-check status carried forward: UNCHECKED, not verified clean.** This frozen generation carries **no `numeric_reading_check`** object at any source or sheet level (my own string count of `GENERATION_ROOT/manifest.json` for the token `numeric_reading_check` = **0**), and `GENERATION_ROOT/corpus.txt` carries no labelled extractor reading-warning annotation. There is therefore **no literal warning token, no source/extract reference and no canonical LF-line/column span to quarantine**, and no amount below is marked not-proven on that basis — but a missing legacy check means **unchecked, not clean**: no warning here is not proof of accuracy. Every filing figure below was read directly from the frozen extract of the document that reports it (`10K_2025_26_0001628280-26-037434`, `10Q_2Q_0001628280-26-072254`, `TTWO 2Q27 Earnings Release FINAL`); Capital IQ workbook tabs are used as the tier-5 vendor read they are, never as the authority for a filing's own number (CLAUDE.md §5). Every restating layer must carry this qualifier forward.

**Anchor adopted verbatim from `01_price-and-capital-structure.md` §7 (Reconciliation Gate 1 — Anchor consistency), not rebuilt:** price **USD 216.61** (last close, as-of **2026-11-19**, `pool-verified`, 1 trading day old, no staleness cap); shares for per-share work **188.0m** (the company's own disclosed fully diluted count, chosen in `01` over the 187.1m trailing figure because every trailing period is a loss and the trailing "diluted" count is basic by antidilution); market cap **40,552.3**; total debt **2,519.8** (borrowings only, filing debt note); **net debt 1,370.4 — strict §15 basis, canonical**; EV **41,922.7**; minority and preferred **nil**; equity-method investments **none disclosed**. Drift note carried from `01`: the price anchor is an at-or-just-before-launch close — Grand Theft Auto VI released **2026-11-19**, the anchor's own as-of date — so it contains no post-launch trading [`Q2 FY27 10-Q, Item 1A and Item 2`].

**Cross-module inputs used.** `business-model/03_segment-map.md` (present — single-segment finding, revenue cuts, the two unnamed goodwill reporting units); `business-model/08_competitive-map.md` (present — named peers and their economics); `00_valuation-data-triage.md` (present — inventory, caps, the negative trailing base). `earnings/01_historical-financials.md` is present but not load-bearing here, because there is no segment EBIT detail for it to supply.

---

## 0. Adjudication of the triage's "SOTP not possible" finding

The invocation asked me to reach my own sourced conclusion rather than inherit `00`'s. I did, and I reach the same conclusion by a different route — with one correction of emphasis.

| Question | My own sourced answer | Evidence |
|---|---|---|
| How many reportable segments does TTWO disclose? | **One.** "We have one operating and reportable segment. Our operations involve similar products and customers worldwide." | `FY26 10-K, Note 21, p.102` — read directly in the frozen extract at line 5297; the same sentence also appears in Item 1 at line 386 ("We have one operating and reportable segment. See Note 21") |
| Is that stable, or a one-year presentation? | **Stable and repeated in the latest interim filing.** The identical sentence appears in the Q2 FY27 10-Q segment note | `Q2 FY27 10-Q, Note 14 (Segment Reporting and Geographic Information)` — read directly, frozen extract line 1011 |
| Does the vendor export agree? | **Yes, across ten annual columns.** One business segment, "Sale of Software Titles", equal to total revenue, gross profit, operating profit, interest expense, net profit before tax and tax in **every** column FY2017→FY2026 (FY26: revenue 6,656.4 = total 6,656.4; operating profit before tax −104.2 = total −104.2) | `CIQ Financials_Annual → Segments`, retrieved 2026-11-19 — **tier-5 vendor export, not a filing** |
| Is there segment-level EBIT below the consolidated total? | **No.** The segment measure of profit *is* consolidated net income (loss): "Our CODM uses consolidated net income (loss) — supplemented by sales information by product category, major product title, and platform — for the purpose of evaluating performance and allocating resources" | `FY26 10-K, Note 21, p.102` |
| Is there an unallocated / corporate bucket to capitalize? | **No — and this is the load-bearing point for Gate 3 (below).** "All significant expense categories are presented on our Consolidated Statements of Operations… The measure of segment assets is reported on the Consolidated Balance Sheet as Total assets." The note's "other segment items" are depreciation and amortization, business reorganization, interest and other net, and the tax line — all already inside the consolidated statements | `FY26 10-K, Note 21, p.102` |
| So: data gap, or disclosure fact? | **Disclosure fact.** Nothing failed to extract: the manifest reports `{"sources": 30, "workbooks": 19, "tabs": 62, "extracts_written": 73, "failures": 0}`. The segment note exists, is readable, and says there is one segment. Recording this as "missing segment data" would be a bad-extraction error (CLAUDE.md §20); recording it as a reason to invent segments would be worse | `GENERATION_ROOT/manifest.json` (read directly) |

**Where I agree with `00`:** SOTP cannot run as a valuation method, and the Score-Cap row *"SOTP not possible for a **multi-segment** business → overall usefulness max 80"* does **not** bind, because that cap is written for a multi-segment business and TTWO is not one. **Where I correct the emphasis:** "SOTP not possible" is the wrong label for a single-segment company, because it reads like a data failure. The correct label, and the one this report carries, is the module's own: **"single-segment — SOTP collapses to the consolidated read."** `99` should record it that way.

**One disclosure that proves an internal economic split exists — and still does not license a breakup.** The FY26 10-K states: "A reporting unit is defined as an operating segment or one level below an operating segment. We have determined that we operate in **two reporting units**, which are components of our operating segment" [`FY26 10-K, Critical Accounting Policies and Estimates — Goodwill`]. One of those two units absorbed goodwill impairments of **3,545.2 (FY25)** and **2,342.1 (FY24)** and was down to **570.0** of goodwill at 2026-03-31; group net goodwill is **1,061.9** against gross 6,949.2 and accumulated impairments 5,887.3 [`FY26 10-K, Note 9 (Goodwill and Intangible Assets, Net), pp.83–84`]. So the company tells a reader that two different economic businesses sit inside its one reported segment — and then discloses **neither unit's name, nor its revenue, nor its profit, nor its assets**. A SOTP built on that would be two unnamed boxes with invented metrics and invented multiples. **Attaching either unit to a label (Rockstar Games / 2K / Zynga) would be inference, not from filings — so it is not done here**, and no multiple is applied to anything derived from it. This is the single most valuable *missing* disclosure for a SOTP on TTWO, and it is named rather than filled in.

---

## 1. Segment Inventory

Reporting currency **USD, millions**, US GAAP. No inverted columns in this table.

**Denominator definition, stated before the percentages so a corporate cost cannot hide behind them:** "% of Total EBIT" below is **reportable-segment EBIT**, which for TTWO is **arithmetically identical to total consolidated EBIT**, because the segment note's own profit measure is the consolidated result and there is **no unallocated / corporate bucket at all** [`FY26 10-K, Note 21, p.102`]. There is therefore no gap between "sums to 100% of reportable EBIT" and "100% of total EBIT net of corporate drag", and no segment share can exceed 100%. `business-model/03_segment-map.md` reaches the same conclusion ("There is no 'Other' or 'Corporate' bucket at all — with one segment there is nothing to bucket, so the >10% 'Other' test is not applicable rather than passed").

| Segment | Revenue | EBIT (or EBITDA) | Margin | % of Total EBIT | Source |
|---|---:|---:|---:|---:|---|
| **Sale of software titles** — the sole operating and reportable segment (Rockstar Games, 2K and Zynga labels; console, PC and mobile; full-game sales plus continuing in-game spending) | **6,656.4** (FY2026, year ended 2026-03-31) | **EBIT −104.2** (loss from operations) | **(1.5)%** — the filing's own printed operating margin | **100.0%** | `FY26 10-K, Note 21, p.102` (one segment); `FY26 10-K, MD&A — Consolidated Statements of Operations table, p.43` (revenue 6,656.4; loss from operations (104.2) / (1.5)%) — both read directly in the frozen extract |
| *Same segment, latest trailing twelve months (2026-09-30) — vendor read* | *6,409.7* | *EBIT **−112.5***; EBITDA *724.9* | *EBIT (1.8)%* | *100.0%* | `CIQ Comps → Financial Data`, subject row, As-Of 2026-11-19 — **tier-5 vendor export**; pinned by `ciq_facts.json → ltm_ebitda_m` |
| Unallocated / corporate bucket | **None exists** | **None exists** | — | **0.0%** | `FY26 10-K, Note 21, p.102`: all significant expense categories are on the consolidated statements of operations; segment assets = consolidated total assets |
| **Consolidated total** | **6,656.4** (FY26) / 6,409.7 (LTM) | **−104.2** (FY26) / −112.5 (LTM) | (1.5)% / (1.8)% | **100.0%** | Reconciles with **no residual**: one segment = the consolidated total, in all ten annual vendor columns FY2017→FY2026 and in the filing |

**Partial-data rule applied here, as this agent's mandate requires.** One segment carries **100%** of EBIT — far above the >85% single-segment threshold — and the EBIT it carries is a **loss**. So: **"Effectively single-segment — SOTP collapses to the consolidated read."** No pseudo-segments are manufactured. Reconciliation Gate 3 (SOTP ties to consolidated; no vanished bucket) is satisfied on the collapse path **by the metric, not by assertion** — see §4.

### 1A. What the company does disclose instead — and why none of it can carry a multiple

These are real, audited disaggregations of the **same single segment**. Each sums independently to 6,656.4 (100.0%) for FY2026. **Every one of them carries revenue only. Not one carries profit, EBITDA, capital employed or assets.** They are listed so a reader can see exactly what exists, and exactly why no multiple is applied to any of them.

| Disclosed cut (NOT a segment) | FY26 revenue | Share | Profit disclosed? | Could a multiple be applied? |
|---|---:|---:|---|---|
| By content — recurrent consumer spending (virtual currency, add-on content, in-game purchases, in-game advertising) | 5,196.6 | 78.1% | **No** | **No** — no profit metric, and no like-for-like forward comparable at this cut |
| By content — full game and other | 1,459.8 | 21.9% | **No** | **No** |
| By platform — Mobile | 3,333.0 | 50.1% | **No.** Only a direction: mobile "generally generates a lower gross margin percentage than our Console or PC revenue" because platform fees run through cost of revenue — **the size of the gap is not disclosed** | **No** |
| By platform — Console | 2,597.3 | 39.0% | **No** | **No** |
| By platform — PC and other | 726.1 | 10.9% | **No** | **No** |
| By channel — Digital online | 6,459.7 | 97.0% | **No** | **No** |
| By channel — Physical retail and other | 196.7 | 3.0% | **No** | **No** |
| By geography — United States | 3,940.4 | 59.2% | **No** (only fixed assets by location: US 274.5 / International 170.9) | **No** |
| By geography — International | 2,716.0 | 40.8% | **No** | **No** |

Sources: content, platform and channel — `FY26 10-K, MD&A, p.44`; geography and fixed assets by location — `FY26 10-K, Note 21, p.102` (read directly in the frozen extract: United States 3,940.4 / International 2,716.0 / total 6,656.4; fixed assets net US 274.5 / International 170.9 / total 445.4); mobile gross-margin direction — `Q2 FY27 10-Q, MD&A — Trends and Factors Affecting our Business, p.23`.

**The refusal is deliberate and it is the correct answer, not a shortcut.** A SOTP needs a segment metric *and* a matched comparable multiple. Here the metric does not exist at any cut: putting an EV/Sales multiple on "Mobile 3,333.0" against a mobile peer and on "Console 2,597.3" against a console peer would be a breakup built on two numbers the company has never earned a profit on separately, bridged with a group net-debt figure that belongs to neither. That is the pseudo-segment failure this agent is written to prevent. **It is not done, and no number in this report rests on it.**

---

## 2. Segment Multiples & Comparables

**There is one segment, so there is one multiple — and this table is therefore a dominant-segment sanity check, not a SOTP comparables table.** Period basis is stated on every row, as required. The forward basis **is** structurable (a consensus NTM EBITDA exists and forward peer multiples exist), so nothing here rests on trailing earnings — which matters, because TTWO's trailing earnings base is **negative**: LTM EBIT **−112.5** and LTM diluted EPS **−1.29**, which is exactly why the comps export prints TTWO's LTM TEV/EBIT and LTM P/E as "NM" [`CIQ Comps → Trading Multiples`, As-Of 2026-11-19 — vendor export]. A trailing-earnings breakup for TTWO is not merely discouraged by MODULE_RULES Calculation Standard 10; it is **arithmetically impossible**.

| Segment | Metric Used | Multiple Applied | Named Comparable | Comparable's Multiple | Source |
|---|---|---:|---|---:|---|
| **Sale of software titles** (sole segment) — **floor anchor** | **NTM EBITDA 2,349.09** (next twelve months, consensus; period basis **NTM**) | **9.96x** (NTM) | **Peer-set median, 10 named peers** — Roblox, Playtika, Nintendo, PLAYSTUDIOS, 37 Interactive, NEXON, Ubisoft, Konami, tinyBuild (+ Electronic Arts, blank) | **9.96x** NTM TEV/forward EBITDA (median; mean 12.44x, high 25.95x, low 2.20x) | `CIQ Comps → Trading Multiples` and `→ Financial Data`, As-Of **2026-11-19** — **tier-5 vendor export, unverified**; NTM EBITDA pinned in `CIQ Comps → Implied Valuation`, subject row |
| **Same segment — lower economics-matched anchor** | **NTM EBITDA 2,349.09** (basis **NTM**) | **11.04x** (NTM) | **NEXON Co., Ltd. (TSE:3659)** | **11.04x** NTM TEV/forward EBITDA | `CIQ Comps → Trading Multiples`, As-Of 2026-11-19 — vendor export |
| **Same segment — upper economics-matched anchor** | **NTM EBITDA 2,349.09** (basis **NTM**) | **15.14x** (NTM) | **Konami Group Corporation (TSE:9766)** | **15.14x** NTM TEV/forward EBITDA | `CIQ Comps → Trading Multiples`, As-Of 2026-11-19 — vendor export |
| *Memo — what the market itself is paying* | *NTM EBITDA 2,349.09 (basis **NTM**)* | ***17.85x*** | *TTWO at the 216.61 anchor, on `01`'s canonical EV 41,922.7* | *17.79x on the vendor's own TEV of 41,790.1 — the two differ only by the vendor's broad-cash / lease-inclusive basis* | *41,922.7 ÷ 2,349.09 = 17.846x (my arithmetic); vendor's 17.79x from `CIQ Comps → Trading Multiples`, subject row* |

### Why these comparables fit the segment's economics (one clause each, as required)

- **NEXON (11.04x) fits** because it is an owned-IP publisher whose money comes mainly from **continuing in-game spending** across PC, mobile and console with capital tied up in game development rather than plant — the same economics as Take-Two's segment, where recurrent consumer spending was **78.1% of FY26 revenue** and **81% of Q2 FY27 net bookings** [`FY26 10-K, MD&A, p.44`; `Q2 FY27 earnings release (2026-11-09), p.1`], and where capitalised software development costs and licences of **2,346.3** dwarf net fixed assets of **445.4** [`FY26 10-K, Note 7, p.83`; `FY26 10-K, Note 21, p.102`]. NEXON's LTM EBITDA margin is 29.1% [`CIQ Comps → Operating Statistics`, As-Of 2026-11-19 — vendor export].
- **Konami (15.14x) fits** on IP ownership and on the same full-game-plus-live-service split across console and mobile, with annualised sports franchises against Take-Two's NBA 2K and WWE 2K; **stated caveat** — Konami also runs amusement and gaming (arcade, pachinko) businesses Take-Two does not have, and earns a 39.6% LTM EBITDA margin against Take-Two's 11.3%, so it is the **upper** anchor rather than the central one [`CIQ Comps → Operating Statistics`, As-Of 2026-11-19 — vendor export].
- **The 10-peer median (9.96x) is used as the floor anchor**, not the central one, because the set is deliberately wide (2.20x to 25.95x) and contains four businesses whose economics do not match Take-Two's at all (below).

### Comparables deliberately excluded, with the economic reason — matching economics, not labels

- **Electronic Arts — the closest structural twin, and no multiple exists for it.** Every price, share-count, market-cap and multiple cell in the vendor export is blank for EA while all nine other peers are populated [`CIQ Comps → Financial Data` and `→ Trading Multiples`, As-Of 2026-11-19 — vendor export]. `business-model/08_competitive-map.md` records the cause as EA's take-private on 2026-08-04 (web-sourced and labelled unverified there, corroborated inside the pool only by the blank cells). **This is the single biggest weakness in the comparable set**: the one peer that is a licensed-sports-plus-owned-IP publisher across console, PC and mobile at Take-Two's scale (LTM revenue 7,846.0 vs 6,409.7) contributes **no** multiple. Named, not papered over.
- **Nintendo (NTM 25.24x) excluded** — a **hardware platform owner**. It *collects* platform fees; Take-Two *pays* them, which is the stated reason Take-Two's mobile revenue carries a lower gross margin [`Q2 FY27 10-Q, MD&A, p.23`]. First-party console economics are not third-party publisher economics; using Nintendo's multiple here would be matching on the surface label "video games".
- **Roblox (NTM 25.95x) excluded** — a user-generated-content platform with free access, LTM EBITDA margin **−13.0%** and LTM revenue growth **+32.1%**. A multiple that embeds 32% growth and negative margins is not a read on a publisher guiding to flat recurrent consumer spending [`CIQ Comps → Operating Statistics`, As-Of 2026-11-19 — vendor export; `Q2 FY27 investor deck (2026-11-09), p.8`].
- **Playtika (NTM 3.67x) excluded as an anchor** — mobile-only free-to-play, a controlled subsidiary of Playtika Holding UK II Limited, total debt/EBITDA 3.5x and **negative shareholders' equity** (total debt/capital 116.7%). Its 3.67x prices a capital structure and an ownership arrangement Take-Two does not have [`CIQ Comps → Financial Data` and `→ Operating Statistics`, As-Of 2026-11-19 — vendor export].
- **Ubisoft (NTM 2.20x) excluded as an anchor** — a third-party console publisher mid-restructuring, LTM EBITDA margin **−81.5%** and LTM revenue **−21.8%**. Its forward multiple is a recovery artefact off a collapsed base, not a going-concern publisher anchor [`CIQ Comps → Operating Statistics`, As-Of 2026-11-19 — vendor export].
- **37 Interactive (8.88x), PLAYSTUDIOS (NM), tinyBuild (7.37x)** — kept inside the median but not used as named anchors: the first is a China-domestic mobile publisher with revenue falling 10.2%, the latter two are sub-250m-revenue businesses, 1/26th and 1/166th of Take-Two's revenue respectively [`CIQ Comps → Financial Data`, As-Of 2026-11-19 — vendor export].

**Two basis warnings that travel with every multiple above.**
1. **All peer multiples are struck on the vendor's own TEV basis** (broad on cash, lease-inclusive on debt), which `01` reconciled exactly for TTWO: 41,922.7 − 524.2 short-term investments + 391.6 operating leases = 41,790.1. My bridge in §4 uses `01`'s **canonical strict net debt 1,370.4** per Reconciliation Gate 1. Size of that inconsistency, quantified rather than waved past: using the vendor net-debt basis (1,237.8) instead would raise every per-share figure below by **132.6 ÷ 188.0 = USD 0.71**. It is not material to the conclusion, and it is disclosed.
2. **Sector-level multiple history is not in this pool.** The peer workbook carries only current (2026-11-19) peer multiples; there is no peer-group or sector-index multiple history 3–5 years back. The Sector Cycle Reality Test is therefore **"Not assessable — no sector-level multiple history"** for the peer anchor used here. That is a named gap, not an assumption that 9.96x / 11.04x / 15.14x are stable through-cycle levels.

---

## 3. Segment Valuation

**This is the collapsed consolidated read — one segment, one multiple. It is a labelled forward sanity check, not a breakup value, and it must never be quoted as one.** Formula on every row: `segment EV = NTM EBITDA × NTM TEV/EBITDA multiple`.

| Segment | Metric Value | Multiple | Segment EV |
|---|---:|---:|---:|
| Sale of software titles — at the **peer-median floor** anchor (NTM) | 2,349.09 | 9.96x | **23,397.0** |
| Sale of software titles — at **NEXON** (NTM) | 2,349.09 | 11.04x | **25,934.0** |
| **Sale of software titles — base point: midpoint of the two economics-matched anchors (NEXON 11.04x / Konami 15.14x)** | **2,349.09** | **13.09x** | **30,749.6** |
| Sale of software titles — at **Konami** (NTM) | 2,349.09 | 15.14x | **35,565.2** |
| Unallocated / corporate bucket | **none exists** (see §1 and §4) | — | **0.0** |
| **Gross enterprise value (sum) — base point** | **2,349.09** | **13.09x** | **= 30,749.6** |
| *Gross enterprise value — dispersion from the multiple alone* | *2,349.09* | *9.96x – 15.14x* | *23,397.0 – 35,565.2* |

**The sum is trivially a sum: one segment plus a zero corporate bucket.** Gate 3 tie-out: the metric used (consolidated NTM EBITDA) and the segment metric are the **same number by the filing's own definition**, so segment EV = gross EV with no residual and nothing unallocated left over.

**Tie-out against the pool's own independent arithmetic.** `CIQ Comps → Implied Valuation` publishes its own peer-median NTM EBITDA implied EV of **23,397.01** — my 9.96x row reproduces it to the decimal (9.96 × 2,349.09 = 23,397.0), which confirms I am reading the same metric and the same multiple the vendor is [`CIQ Comps → Implied Valuation`, As-Of 2026-11-19 — vendor export].

**One forward-base warning that `03`, `04` and `07` must adjudicate, flagged here because it sits inside my own denominator.** Consensus **NTM EBITDA of 2,349.09** is more than double the company's **own guided FY2027 non-GAAP EBITDA of 1,024–1,082** (midpoint **1,053**) [`TTWO 2Q27 Earnings Release, 2026-11-09, Outlook for Fiscal Year Ending March 31, 2027`]. Most of that is calendar, not disagreement: NTM runs roughly Dec-2026→Nov-2027 and contains a **full** post-Grand-Theft-Auto-VI year, while FY2027 (Apr-2026→Mar-2027) contains only about four and a half months of it (release date 2026-11-19). But not all of it is calendar — the same consensus grid implies **FY2027 revenue of about 8,554** (41,790.1 ÷ 4.88505 = 8,554.0) against company-guided GAAP net revenue of **7,980–8,180** and net bookings of **8,000–8,200**, i.e. consensus sits **above the top of guidance on the current year** [`CIQ Estimates → Multiples`, FY2027 row; `TTWO 2Q27 Earnings Release, Outlook`]. **Consequence, stated plainly: the NTM base used above is a launch-peak base running ahead of the company's own current-year guidance, so the per-share figures in §4 are, if anything, generous.** Reconciling consensus to guidance is `03`/`04`'s job, not this agent's; it is flagged, not resolved, and the §4 output carries the qualifier.

---

## 4. Equity Bridge

At the **base point** multiple of 13.09x (the midpoint of the two economics-matched forward anchors). USD millions except per-share. Every component is `01`'s canonical figure, adopted verbatim.

| Step | Value |
|---|---:|
| Gross enterprise value (2,349.09 NTM EBITDA × 13.09x) | **30,749.6** |
| − Capitalized unallocated corporate costs | **0.0** — **none exist, and this is shown rather than asserted** (see the test below) |
| − Net debt (**strict §15 basis — canonical**: total debt 2,519.8 − cash & equivalents 1,149.4) | **−1,370.4** |
| − Minority / preferred | **0.0** (both nil — no non-controlling-interest line; preferred stock 5.0 shares authorised, **none issued or outstanding**) |
| + Equity-method investments | **0.0** (**none disclosed** — no equity-method line or note in either filing) |
| − Conglomerate / holdco discount | **0.0** (none applied — reason stated below) |
| **= Equity value** | **= 29,379.2** |
| ÷ Diluted shares | **÷ 188.0** |
| **= Collapsed consolidated read, per share (NOT a SOTP breakup value)** | **= USD 156.27** |
| vs current price | **USD 216.61** (as-of 2026-11-19, pool-verified) — the read sits **27.9% below** the price: (216.61 − 156.27) ÷ 216.61 |

Sources for the bridge lines: net debt, minority, preferred, equity-method and shares all from `01_price-and-capital-structure.md` §7 Anchor Summary, which built them from `Q2 FY27 10-Q, Condensed Consolidated Balance Sheets` and `Note 10 (Debt)` and adopted `balance-sheet-survival/01`'s filing-based figure as canonical. **No basis is switched mid-module**: strict net debt is used on every row, and the broad figure (846.2) and vendor figure (1,237.8) are not substituted anywhere.

### Dispersion from the multiple alone (shown separately, so the base point is not false precision)

| Anchor | Multiple (NTM) | Gross EV | − Net debt (strict) | Equity value | ÷ 188.0 | Per share | vs price 216.61 |
|---|---:|---:|---:|---:|---:|---:|---:|
| Peer-set median (floor) | 9.96x | 23,397.0 | −1,370.4 | 22,026.6 | 188.0 | **117.16** | −45.9% |
| NEXON | 11.04x | 25,934.0 | −1,370.4 | 24,563.6 | 188.0 | **130.66** | −39.7% |
| **Base point (NEXON/Konami midpoint)** | **13.09x** | **30,749.6** | **−1,370.4** | **29,379.2** | **188.0** | **156.27** | **−27.9%** |
| Peer-set mean | 12.44x | 29,222.7 | −1,370.4 | 27,852.3 | 188.0 | **148.15** | −31.6% |
| Konami | 15.14x | 35,565.2 | −1,370.4 | 34,194.8 | 188.0 | **181.89** | −16.0% |
| *Memo — the multiple the price itself pays* | *17.85x* | *41,922.7* | *−1,370.4* | *40,552.3* | *187.2 (market-cap count)* | *216.61* | *0.0% by construction* |

**Base case is the point (USD 156.27); the 117.16–181.89 band is the multiple-driven dispersion, not a second "case".** Scenario probabilities, weighted returns and the final fair-value levels belong to `07` and to the master synthesizer, not to this agent.

**Cross-check against the pool's own bridge:** `CIQ Comps → Implied Valuation` publishes a peer-median NTM-EBITDA implied price of **118.36** per share. Mine at the same 9.96x is **117.16**. The whole 1.20 gap is two labelled basis differences and no third thing: the vendor divides by **187.21** shares and bridges on **+ cash & short-term investments 1,673.6 − total debt 2,911.4** (i.e. broad cash and lease-inclusive debt, net 1,237.8), while I divide by **188.0** and bridge on **strict net debt 1,370.4** per Gate 1. Both are named; mine is the canonical one for this run.

### Gate 3 — the corporate bucket is netted, not dropped (and this holds on the collapse path)

My own partial-data rule is explicit that a corporate / unallocable cost bucket may not be dropped by assertion even when SOTP collapses. The test, done rather than claimed:

- **The company discloses no unallocated bucket to begin with:** "All significant expense categories are presented on our Consolidated Statements of Operations… The measure of segment assets is reported on the Consolidated Balance Sheet as Total assets" [`FY26 10-K, Note 21, p.102`]. The vendor export agrees in all ten annual columns — segment operating profit before tax equals total operating profit before tax, every year [`CIQ Financials_Annual → Segments` — vendor export].
- **The metric I applied the multiple to already nets every corporate cost.** NTM EBITDA of 2,349.09 is a **consolidated** consensus figure, so group overheads, corporate general and administrative expense and business-reorganization costs are **inside the denominator before the multiple is applied**. The route taken is therefore the first of the two my rule permits — *apply the multiple to a metric that already nets the corporate drag, and say so explicitly* — and this sentence is that explicit statement.
- **Nothing is capitalized and subtracted, because doing so would charge the same cost twice.** Subtracting a capitalized corporate-cost figure on top of a consolidated EBITDA base would double-count. The line in the bridge is 0.0 for that reason, stated rather than left blank.

### Conglomerate / holding-company discount: **none applied**, and why none is warranted

Four tests, each answered from evidence:

1. **Structure.** One operating and reportable segment, managed on a consolidated basis by the CEO as Chief Operating Decision Maker [`FY26 10-K, Note 21, p.102`]. There is no holding-company-over-listed-subsidiaries structure to discount — the Business-Type Method Map classifies TTWO as an **Operating** company, not a Holding company, so SOTP is not even the primary method here (`00_valuation-data-triage` §3, confirmed by my own read of the segment note).
2. **Unrelated diversification (CLAUDE.md §24, Filter 4/6).** None visible: "Our operations involve similar products and customers worldwide" [`FY26 10-K, Note 21, p.102`].
3. **Minority / cross-holding leakage.** Minority interest **nil**, preferred **nil**, equity-method investments **none disclosed** [`Q2 FY27 10-Q, Condensed Consolidated Balance Sheets`; `01` §4]. There is no look-through layer for a discount to compensate for.
4. **Misaligned controlling owner (CLAUDE.md §24, Filter 6).** **RF-OWN-004 did not fire** — recorded verbatim in `management-governance/99_management-governance-synthesis.md`'s cap table, per `00_valuation-data-triage` §4. So the value-trap cap does not bind, and a holdco-style discount cannot be justified on ownership grounds. **Qualifier carried forward, not dropped:** that module's overall verdict is nonetheless *"Misaligned or weak stewardship"* with **no hard disqualifier**. That is a governance read for `07`/`99` to weigh; it is **not** a conglomerate discount and is not applied as one here.

**Applying a discount with no structural reason would be a number with no basis.** None is applied. Zero is a decision, and the four tests above are the reason.

---

## 5. SOTP Read

**Take-Two has no parts to sum, so there is no breakup value — and that is the finding, not a gap.** The company reports **one operating and reportable segment** carrying **100%** of revenue and **100%** of the result, with its segment profit measure defined as consolidated net income (loss) and its segment assets defined as consolidated total assets [`FY26 10-K, Note 21, p.102`, read directly in the frozen extract; repeated at `Q2 FY27 10-Q, Note 14`; corroborated in all ten annual columns of `CIQ Financials_Annual → Segments`]. The one segment that exists **carries all of the value by definition and all of the losses too** — FY26 loss from operations **(104.2)** and LTM EBIT **−112.5**. So the "which segment carries the value" question has an arithmetically forced answer, and the far more useful answer is the one the filings refuse to give: the FY26 10-K admits Take-Two runs **two goodwill reporting units** inside that one segment, one of which absorbed **5,887.3** of cumulative goodwill impairment and is down to **570.0** of remaining goodwill — and then names neither, sizes neither, and gives neither a revenue or profit line [`FY26 10-K, Critical Accounting Policies — Goodwill`; `FY26 10-K, Note 9, pp.83–84`]. **A real segment is being masked here, but it is masked by the disclosure, not by a consolidated multiple** — which is the opposite of the condition SOTP exists to fix, and the reason the honest output is a collapse rather than a breakup.

**On the collapsed consolidated read, and labelled as a cross-check rather than a method:** valuing the single segment on a **forward** basis — consensus **NTM EBITDA 2,349.09** against the two forward comparables whose economics actually match an owned-IP publisher earning mostly from continuing in-game spending (**NEXON 11.04x**, **Konami 15.14x**, midpoint 13.09x) — gives a base point of **USD 156.27 per share** (dispersion **117.16–181.89** across the peer median to Konami), against the pool-verified price of **USD 216.61** as-of 2026-11-19. The price itself pays **17.85x** NTM EBITDA on `01`'s canonical EV of 41,922.7 — above every anchor in my matched set and above the peer median of 9.96x by **79%**. Two qualifiers must travel with that figure or it should not be quoted: the NTM base is a **launch-peak** base that already runs **above** the company's own FY2027 guidance (consensus-implied FY27 revenue ~8,554 vs guided 7,980–8,180), so the read is generous rather than harsh; and the peer anchors carry **no sector-level multiple history** in this pool, so the Sector Cycle Reality Test on them is **"Not assessable"**.

**What `07` should and should not do with this file.** **Do not weight it.** This collapsed read is not an independent method — it is a peer forward-EBITDA multiple applied to the consolidated company, which is precisely what `03_relative-valuation-peers` owns. Carrying it as a separate weighted method would count one read twice and manufacture false agreement, which CLAUDE.md §16's independence test forbids. **SOTP contributes zero weight to the base point**, and the correct one-line entry for `99`'s method table is: *"SOTP — not applicable; single-segment company (`FY26 10-K, Note 21`); collapsed to the consolidated read; no independent weight."* Use the §3/§4 numbers only as a reconciliation check on `03`, and note for the record that `00`'s "SOTP not possible" wording should be restated as **"single-segment — SOTP collapses to the consolidated read"**, because the first reads like a data failure and the second is what the filing actually says.

---

## Self-Check

| Check | Status |
|---|---|
| Segment inventory reconciles to consolidated revenue/EBIT; unallocated bucket named | **Pass.** One segment = consolidated total, FY26 and LTM, in filing and in all ten vendor columns; no residual. Unallocated bucket named and shown to be **nil by the filing's own definition**, not by assertion |
| Single-segment collapse applied rather than a forced breakup | **Pass.** 100% of EBIT in one segment (>85% threshold); no pseudo-segments built from platform / content / channel / geography cuts, and the refusal is reasoned in §1A |
| Every segment multiple cites a NAMED comparable; none fabricated | **Pass.** NEXON (TSE:3659) 11.04x, Konami (TSE:9766) 15.14x, 10-peer median 9.96x — all from `CIQ Comps → Trading Multiples`, As-Of 2026-11-19 |
| Forward metric × forward multiple; period basis stated per segment | **Pass.** NTM EBITDA 2,349.09 × NTM TEV/forward EBITDA, basis labelled **NTM** on every row. No trailing base used anywhere — trailing is structurally impossible (LTM EBIT −112.5, LTM diluted EPS −1.29) |
| Comparables matched to economics, not labels, with a one-clause reason | **Pass.** Reasons given for NEXON and Konami; Nintendo, Roblox, Playtika, Ubisoft and three sub-scale names excluded with the economic reason; EA named as the closest twin with no multiple available |
| Forward basis structurable? | **Yes** — consensus NTM EBITDA and forward peer multiples both exist, so the "not structurable on a forward basis — excluded" branch does not apply. The output is nonetheless **not** fed to `07` as a weighted method, because it duplicates `03` rather than adding an independent read |
| Web-sourced comparable multiples labelled unverified | **Pass — none used.** Every multiple is from the pool's Capital IQ comps export, labelled **tier-5 vendor export** and mechanically unverified (no `numeric_reading_check` in this generation). No web source was consulted for any multiple |
| Equity bridge uses `01`'s anchors; net-debt sign discipline; corporate drag not dropped | **Pass.** Strict canonical net debt **1,370.4 subtracted once**; company is **net debt on both bases**, so no net-cash add-back arises and no double-count is possible; corporate drag shown to be already netted inside the consolidated NTM EBITDA metric (Gate 3 satisfied on the collapse path); per-share on `01`'s **188.0** count |
| Conglomerate discount disclosed with a reason, or its absence justified | **Pass.** None applied; four structural tests shown in §4, including RF-OWN-004 = not fired, with the *"misaligned or weak stewardship"* qualifier carried forward rather than dropped |
| The read identifies which segment carries the value | **Pass** — forced by arithmetic (one segment), and the more useful finding (two unnamed, unsized reporting units) is named instead |
| Base case is a point; dispersion shown separately | **Pass.** Point **156.27**; dispersion **117.16–181.89** shown as a separate table and labelled multiple-driven |
| Banned phrases | **Pass.** No "cheap", "expensive", "undervalued", "overvalued", "attractive valuation", "trading at a discount", "significant upside", "limited downside", "re-rating opportunity", "strong fundamentals", "well positioned" or "best-in-class" appears unpaired with a cited number; every premium/discount is stated as a percentage against a named method |
| Out-of-scope work | **None performed.** No scenario probabilities, no probability-weighted target, no risk/reward, no rating, no position size — those belong to `07` and the master synthesizer |



---

## valuation / 07_scenario-and-fair-value.md

_Source: `07_scenario-and-fair-value.md`_

# Scenario & Fair Value — TTWO

**Company:** Take-Two Interactive Software, Inc. (NasdaqGS:TTWO) · **Run date:** 2026-11-20
**Reporting standard:** US GAAP · **Currency:** USD, millions unless stated · **Fiscal year ends 31 March** ("FY2027" = Apr-2026 → Mar-2027, not a calendar year) [`FY26 10-K, cover page`].

**Anchors adopted verbatim from `01_price-and-capital-structure.md` §7 — not rebuilt (MODULE_RULES Reconciliation Gate 1).** Price **USD 216.61** (last close, as-of **2026-11-19**, price-state **`pool-verified`**, 1 trading day old, **no staleness cap** — so no dual-price presentation is required and none is shown); shares for per-share fair value **188.0m** (the company's own disclosed diluted count, used because every trailing GAAP period is a loss and the trailing 187.1m "diluted" figure is basic by antidilution); market cap **40,552.3**; **canonical strict §15 net debt 1,370.4** (borrowings-only debt 2,519.8 less cash & equivalents 1,149.4); **canonical EV 41,922.7**; minority and preferred nil. No dividend has ever been paid and none is expected, so **no yield is quoted anywhere below** [`FY26 10-K, Item 5 — Dividend Policy`].

**Drift note that travels with the anchor, and it shapes this whole report.** 2026-11-19 is **the Grand Theft Auto VI release date itself**, so the anchor close contains **no post-launch trading** [`Q2 FY27 10-Q, Item 1A and Item 2 MD&A`]. The early-sell-through outcome is live in both directions and is the reason the bull and bear levels below are far apart.

**Source-check status carried forward: UNCHECKED, not verified clean.** This frozen generation carries **no `numeric_reading_check`** object at any source or sheet level (string count in `GENERATION_ROOT/manifest.json` = 0), and `GENERATION_ROOT/corpus.txt` carries no labelled extractor reading-warning annotation. There is therefore **no literal warning token, no source/extract reference and no canonical LF-line/column span to quarantine**, and **no amount below is marked not-proven on that basis**. But a missing legacy check means **unchecked, not clean** — no warning is not proof of accuracy. Every method value below is taken verbatim from the sibling that produced it, each of which re-read its value-determining figures from the frozen extract of the document that reports them; every workbook-cell figure remains mechanically unverified by the pattern check. Every restating layer must carry this qualifier forward.

**Two triage conditions bind every number here.** (1) **The trailing earnings base is negative** — LTM EBIT **−112.5**, LTM diluted EPS **−1.29** — so trailing P/E and trailing EV/EBIT do not exist for TTWO at all, and **every earnings-multiple level below is forward (NTM) and labelled as such** [`00_valuation-data-triage.md` §5; `Capital IQ Comps → Financial Data`, As-Of 2026-11-19]. (2) **Sector-level multiple history is absent from the pool**, so the Sector Cycle Reality Test is **"Not assessable"** for both `02` and `03` — see §2.

---

## 1. Method Summary

| Method | Fair / Implied Value (per share) | Confidence | Weight | Why This Weight |
|---|---:|---|---:|---|
| Own-history multiples (`02`) | **USD 328.44** — own 5-yr MEDIAN EV/NTM EBITDA **26.806x** × NTM EBITDA 2,349.1, bridged at the matched vendor net debt, ÷ 188.0 [`02` §4] | **Low-to-Moderate** | **30%** | Value-producing and admissible: `02` §2 states the **NTM band IS admissible** as a `07` anchor (n = 20 settled quarter-ends, band and current both NTM, same vendor TEV basis) and explicitly **disowns its LTM band** for a basis defect. Weighted below `03` for three stated reasons: (a) its own producer calls 26.81x "a **ceiling-ish base rather than a conservative one**" [`02` §6]; (b) **it cannot corroborate a mispricing claim about the very company whose trading record it is** (CLAUDE.md §16) [`02` §4]; (c) the **window choice, not the multiple, drives the answer** — the same 26.806x on consensus FY2027 EBITDA gives USD 235 (+8.4%), on NTM gives USD 328 (+51.6%) [`02` §4] |
| Relative / peers (`03`) | **USD 181.89** — quality-matched five-peer median NTM EV/EBITDA **15.14x** × NTM EBITDA 2,349.09, bridged at canonical strict net debt 1,370.4, ÷ 188.0 [`03` §5] | **Low-to-Moderate** | **45%** | The **largest single weight** and the most reliable lens for this company: a forward, same-day (2026-11-19), one-engine cross-section against a peer set sourced from `business-model/08_competitive-map.md` and the company's own 10-K competition list, with the double-count test run and the margin-ratio haircut explicitly **refused** [`03` §5 ledger]. It is also the only method with a genuinely **independent** corroborating read beside it (the EA take-private, §2). Not higher, because its dispersion is 117.16–232.91 and the dominant driver is the choice of comparable set, which the pool cannot settle |
| Intrinsic DCF (`04`) | **USD 63.17** — FCFF DCF, WACC 8.852%, ROIC = WACC terminal; grid 52.22–77.81; labelled variants 50.58 (runoff) → 104.24 (upside bound) [`04` §6–§7] | **Low-to-Moderate (self-capped)** | **25%** | **Capped at the cross-check allowance** (MODULE_RULES Scenario Construction §1): TTWO is an **Operating** company with a usable forward metric and both an own-history and a peer multiple set, so `04` + `06` combined may not exceed ≈ ⅓ of the base point. `06` is zero (below), so `04` takes the whole allowance at 25%. Taken at the top of the allowance rather than the bottom because its disagreement is **not** a discount-rate artefact — `04` §3A and `05` §2A both prove the gap is a cash-flow-level gap, and `04`'s own WACC cleared every sanity bound and sits **above** the moat module's 8.2% |
| Reverse-DCF (`05`) | *(implied, not a value — price implies **+20.47%/yr** FCFF compounding FY2028→FY2036; implied flat core EBIT margin **45.78%**; at consensus long-run growth of 3.13% **no horizon reaches the price**, max EV 20,893 vs 41,922.7)* [`05` §2, §5] | High on the arithmetic (executed solver), Medium on the judgement | **n/a** | Cross-check, never a weighted value. It informs **which lens to trust**: it rules out the discount-rate explanation (dual solve → implied rate **2.63%**, **244bps BELOW** the 5.07% risk-free rate), so the price–value gap is a disagreement about the **level of cash flow** |
| Sum-of-the-parts (`06`) | **Not applicable** — single operating and reportable segment [`FY26 10-K, Note 21`]. Its collapsed consolidated read (USD 156.27) is a peer forward-EBITDA multiple on the consolidated company | n/a | **0%** | **Zero-weighted, and `06` itself instructs it.** "Do not weight it… SOTP contributes zero weight to the base point" — it is the same read `03` owns, and carrying it separately would count one read twice [`06` §5]. It appears in the §2 football field for transparency only |

**Weights sum to 100% across the value-producing, type-valid methods.** Per the Business-Type Method Map, TTWO is an **Operating** company, so the valid set is `02` / `03` / `04` / `06`; `06` is excluded as collapsed-and-duplicative on its own producer's instruction, leaving `02` + `03` + `04`. Reverse-DCF is a cross-check, not a weighted input.

**Multiples-first rule applied and satisfied:** `02` + `03` carry **75%** — the majority — and `04` is held to **25%**, inside the ≈ ≤ ⅓ cross-check cap. The low DCF is **not** allowed to drag the base silently: §2 reconciles the gap explicitly (Reconciliation Gate 6).

**The published base point equals the mechanically-weighted blend — there is no silent re-anchor.** 0.30 × 328.44 + 0.45 × 181.89 + 0.25 × 63.17 = 98.53 + 81.85 + 15.79 = **196.17**.

---

## 2. Triangulation & Reconciliation

### 2A. Method football field — the honest cross-method spread, not pre-blended

| Method | Value / Range | Confidence | Weight | Why this weight |
|---|---:|---|---:|---|
| Own-history multiples (`02`, NTM basis) | **328.44** point; own-median dispersion across multiples **253 – 364** [`02` §4] | Low-to-Moderate | 30% | NTM band admissible (n = 20, same basis); LTM band disowned by its producer; 26.81x called ceiling-ish; cannot corroborate a mispricing claim |
| Relative / peers (`03`, NTM basis) | **181.89** point; dispersion **117.16 – 232.91** [`03` §5] | Low-to-Moderate | 45% | Forward, same-day, quality-matched, double-count test run; one independent transaction comp beside it |
| Intrinsic DCF (`04`) | **63.17** point; grid **52.22 – 77.81**; variants **50.58 – 104.24** [`04` §6–§7] | Low-to-Moderate (self-capped) | 25% | Cross-check cap; disagreement proven not to be a discount-rate artefact |
| Sum-of-the-parts (`06`) | *156.27 (collapsed consolidated read — shown, not weighted)* | n/a | **0%** | Single segment; duplicates `03` [`06` §5] |
| *Reverse-DCF (`05`)* | *no value — price implies +20.47%/yr FCFF for 9 years* | — | n/a | Cross-check |
| **Full high-to-low field of valid, value-producing methods** | **63.17 – 328.44** | — | — | **high ÷ low = 5.20x; spread on the low end = +419.9%** |

**The headline finding is the dispersion itself, and it is the largest this module can produce.** The field spans **5.2x**, or **+419.9%** measured on the low end — vastly above the ~40% tolerance. Per MODULE_RULES Reconciliation Gate 6 and the Score Cap table, **valuation confidence is capped at 55**, and the cap applies **even though the prose below explains the disagreement**. Explanation does not make the dispersion disappear.

### 2B. Sector cycle distortion — and the independence test that matters more here

**Sector Cycle Reality Test: "Not assessable" in BOTH methods, so neither flag fires and neither anchor is proven stable.** `02` §5 and `03` §6 both searched the pool and both found no sector-index or peer-aggregate multiple history — the comps workbook carries a **single As-Of column (2026-11-19)** and no 3–5-year peer series on any multiple. Both ran labelled web attempts and both **rejected** them on quality grounds (`02`: a current-only ETF level cannot measure a change over a window; `03`: aggregator figures that read ~24x for TTWO on a date the pool's own vendor prints 52.2x cannot cap a peer anchor). **Neither `RF-VAL-001` (cycle-elevated) nor `RF-VAL-002` (cycle-depressed) is emitted by either file**, so the compounding cap does not fire mechanically and firing it here would be fabricating a correction. Per the Score Cap table an honestly-absent check is **no cap by itself** — but it is a **named gap** `99` must record: the premise of the compounding rule is **untested, not cleared**, and neither multiples method has a verified stable anchor. `03` adds the one thing that can be said without the data: a **12-fold forward-multiple spread inside one eleven-company industry on one day** (Ubisoft 2.20x beside Roblox 25.95x) is itself evidence that these levels are not a settled normal.

**The independence failure that actually binds is a shared DENOMINATOR, not a shared sector cycle (CLAUDE.md §16).** `02` and `03` disagree by 81% on the per-share answer, so there is no "methods agree" claim to make between them — but they are **not** two independent reads of the level either, because both apply a multiple to the **same single number**: consensus NTM EBITDA of **2,349.1**. That number is **3.24x LTM EBITDA of 724.9**, **38.8% above** consensus FY2027 EBITDA of 1,692.8, and **2.23x** the company's own guided FY2027 non-GAAP EBITDA midpoint of **1,053** [`02` §3; `03` §2; `06` §3; `01` §5]. It is a **launch-year peak** denominator measured against peers' ordinary-year forward metrics, and `03` §4 is explicit that no multiple adjustment can fix it "because it lives in the metric, not the multiple." So the most value-determining input in 75% of the base point is one unproven forward estimate, struck on the company's own **management-reporting** basis (adding back SBC 462, acquired-intangible amortisation 623 and the deferred-revenue change 47, at an 18% tax rate), whose peer counterparts' add-back bases are **undisclosed** [`03` §2].

**What IS independent, and it is the single most useful cross-read in this module.** The **Electronic Arts take-private** — USD 210.00 per share, about USD 55bn, closing 2026-08-04 — is a negotiated change-of-control price set by a buyer consortium rather than by the daily market that sets every peer multiple, so it is genuine independent evidence. It implies about **6.94x LTM EV/Sales** for a larger, higher-margin, better-capitalised competitor; TTWO's public minority price today is **6.5x**, i.e. **94% of a control price for its closest comparable** [`03` §4; deal terms web-sourced 2026-11-20, unverified; EA financials `CIQ Comps → Financial Data`, tier-5]. Four caveats all push one way — it is an **upper bound**. `04` and `05` are also independent of both multiples methods (a cash-flow model and its inverse share no input with a traded multiple), and `04`'s own WACC cleared every sanity bound and sits **above** the moat module's 8.2% figure.

### 2C. Base-case fair value — the point, and the reconciliation behind it

> **Base-case fair value: USD 196 per share (196.17 exactly), a point on 188.0m diluted shares and a 12-month convergence horizon.** Implied enterprise value **38,251.3**; implied **16.28x EV/NTM EBITDA** and **20.50x NTM P/E** (NTM diluted EPS 9.569).

**The reconciliation, in five sentences.** The field is 5.2x wide and the whole of it is a disagreement about **one thing**: whether consensus NTM EBITDA of 2,349.1 is a durable level or a launch-year peak — `02` and `03` assume it durable and argue only about which multiple to pay, while `04` builds its own cash-flow path and reaches 63.17 and `05` shows the price needs that path lifted **3.16x**. I trust **`03` most** for this company, because it is forward, same-day, quality-matched, has its double-count test run, and has one independent transaction comp bracketing it — and I trust **`02` least of the two multiples lenses**, because its 26.81x median is a pre-launch multiple being applied to post-launch earnings (a peak multiple on a peak metric, which double-counts the same launch), because its own producer calls that multiple ceiling-ish, and because a record of where the market has already priced TTWO cannot tell us whether the market is pricing TTWO correctly. The DCF is **not** averaged in as a quiet drag and it is **not** dismissed as a high-WACC artefact: `04` §3A and `05` §2A both tested and **rejected** the discount-rate explanation (the implied rate is 2.63%, 244bps below the risk-free rate — not a cost of capital), so the 63.17 is a **real warning about the level of cash flow**, which is exactly why it is held at the top of its ≤ ⅓ allowance rather than the bottom. The resulting 196.17 is therefore a fair value **on a launch-year denominator**: the same 16.28x multiple on consensus FY2027 EBITDA of 1,692.8 gives **USD 139.33**, and on the company's own guided FY2027 non-GAAP EBITDA of 1,053 gives **USD 83.92** — so the base point's defensibility rests entirely on the NTM window being the right one. Confidence is capped at **55** by the dispersion rule regardless of how well this paragraph explains it.

---

## 3. Bull / Base / Bear Fair-Value Levels

**One weighted set, one basis.** The three cases on the 12-month horizon (`bull`, `base`, `bear_cyclical`) are all built on the **SAME earnings period** (next twelve months, roughly Dec-2026 → Nov-2027) and the **SAME measure** (**management-reporting / non-GAAP EBITDA**, the basis consensus NTM EBITDA is struck on — SBC, acquired-intangible amortisation and the deferred-revenue change added back, per `03` §2's reconciliation). `metric_period` = NTM; `metric_measure` = management-basis EBITDA. The fourth case, **`bear_structural`**, is the single named exception: it is labelled exactly `bear_structural`, carries a **24–36 month** horizon stated in its rationale, and declares its own basis and its cross-measure reconciliation below.

**Multiple-source discipline.** Every case multiple is taken from a method that **carried weight**, on the **matching basis**. `02`'s **NTM** band is the source for the bull and bear multiples — `02` §2 explicitly rules that band **admissible** as a `07` anchor and explicitly **disowns its LTM band**, so no number is lifted from a disowned band and no NTM multiple is applied to an LTM metric. **No Sector Cycle flag fired** on `02` (its test returned "Not assessable"), so no flag caveat is owed on these rows; the unverified-anchor gap is recorded in §2B instead.

| Case | Fair Value / Share (point) | Forward Metric (EBITDA, management basis) | Multiple | Horizon | What Must Be True (operating drivers) |
|---|---:|---:|---:|---|---|
| **Bull** | **USD 397.52** (+83.5% vs price) | **NTM EBITDA 2,839.1** (+20.9% vs consensus 2,349.1) = 2,349.1 + 0.494619 × (NTM revenue 9,906.3 × +10%) | **26.806x** EV/NTM EBITDA — `02`'s **own 5-year NTM MEDIAN** [`02` §2A] | **12 months** (to ~Nov-2027) | GTA VI sells through **+10% above** the guided launch-quarter midpoint, sustained across the NTM window, converting at the company's own guided Q3 incremental rate of **$0.4946 of EBIT per $1 of revenue** [`earnings/07` §2 row 1 and its printed coefficient derivation]; the gross-margin reversion (+130bps, worth +105.0 of EBIT) lands; recurrent consumer spending beats guided-flat by **+4pp** (+209.7 of Net Bookings) [`earnings/07` rows 2–3]; and the market pays TTWO its **own 5-year average** forward multiple again. **Expansion, not mania:** 26.806x is the band's **median**, not its max (51.73x), yet `02` §6 calls it "ceiling-ish" — so this is the top of the evidenced range, not a new high |
| **Base** | **USD 196.17** (−9.4% vs price) | **NTM EBITDA 2,349.09** (consensus) [`CIQ Estimates → Multiples`, NTM] | **16.28x** EV/NTM EBITDA — the implied multiple of the §1 weighted blend; sits between `03`'s quality-matched peer median **15.14x** (+7.5%) and far below `02`'s own-history median 26.81x (−39.3%), at roughly the **15th–20th** percentile of `02`'s own 20-quarter NTM band (min 14.30x / max 51.73x) | **12 months** | Consensus NTM EBITDA is delivered — which already requires the launch quarter to carry **120.9%** of the whole year's guided Net Bookings growth, with the other three quarters guided to **shrink** by 288.9 in aggregate [`earnings/07` §4] — and the market pays a forward multiple a touch above a quality-matched peer median rather than reverting to TTWO's own pre-launch average |
| **Bear — `bear_cyclical`** | **USD 67.68** (−68.8% vs price) | **NTM EBITDA 985.8** (42.0% of consensus) = bear revenue 7,925.1 (NTM revenue −20%) × the **prior-trough margin re-based onto this case's basis, 12.44%** | **14.298x** EV/NTM EBITDA — `02`'s **own 5-year NTM MINIMUM**, set 2022-06-30 [`02` §2A] | **12 months** | The launch undersells: revenue **−20%** against the guided midpoint, which is `earnings/07`'s own bear move on row 1 — and the four mechanical links fire together, because they are one event (the straight-line amortisation floor keeps charging when revenue does not arrive; the recoverability test trips against the **2,577.3** carried balance, of which 2,149.7 related to **unreleased** titles at 2026-03-31 = 61.2% of equity; the GTA VI Ultimate Edition add-on content that drives the guided recurrent-spending rise does not convert; and **$96m** of SBC still lands in Q3 cost of revenue regardless, with Q3 operating expenses guided **+21% YoY** on launch marketing already committed) [`earnings/07` §5, §6] |
| **`bear_structural` — the avoid-ruin floor, NOT the headline bear** | **USD 52.53** (−75.7% vs price); harsher variant **50.58** | **Reset base:** `04`'s impaired declining-perpetuity path — terminal EBIT margin faded to **8.0%**, `g` = **0.0% nominal** (zero-to-negative real), i.e. a permanently lower normalized margin on a non-recovering revenue base [`04` §5] | **Impaired (de-rated) terminal multiple:** implied exit **4.65x** TEV/EBITDA on FY2037 EBITDA of 1,657.6 [`04` §5]. Cross-metric translation onto this set's own axis: impaired EV ÷ NTM EBITDA 2,349.1 = **4.79x** | **24–36 months** (stated per `04` §5: "the runoff describes a **24–36 month** permanent-impairment path") | The erosion read **confirms**: share loss to a new equilibrium in free-to-play mobile (50.1% of FY26 revenue, barriers to entry the filing itself calls "relatively low"), terminal-value fade, and the permanent capital destruction already on the balance sheet continuing — **$5,887.3m of accumulated goodwill impairment against $6,949.2m of gross goodwill (~85% of all goodwill ever recorded)**, taken for *"industry conditions and changes in our strategies"*, plus **two disclosed unit lifetimes that both shortened in the latest filing** (player service period "six and fifteen" → "five and fifteen" months; title amortisation "12 to 36" → "9 to 36" months) [`FY26 10-K, Notes 1, 7 and 9, pp.83–85`; `business-model/09_moat.md` §5] |

**Symmetry check, printed rather than claimed.** Bull multiple **26.806x ≥** base **16.28x ≥** bear **14.298x**; within each case the metric and the multiple move the **same** direction (bull +20.9% metric with an expanded multiple; bear −58.0% metric with a compressed multiple). There is no fake asymmetry: the bull does use a near-ceiling multiple, and the bear is correspondingly built to a **cited prior-downturn trough**, not a mild dip off the peak.

### The prior-downturn trough, re-based onto this case's forward denominator — arithmetic shown

The cyclicality gate binds: `business-model/07_business-quality.md` scores **cyclicality 22/100** and its §4 states plainly that *"Grand Theft Auto VI launched November 19, 2026, and FY27–FY28 will print this cycle's peak."* So the bear must reach a real trough, cited, and then be **translated** onto this case's basis before it enters the weighted set.

| Step | Figure | Source / basis |
|---|---:|---|
| Prior-downturn year | **FY2025** (year to 2025-03-31) — the cycle trough: absolute EBITDA fell to **380** from 757 (FY2021) before recovering to 788 (FY2026) | `business-model/07_business-quality.md` §1, from `ciq_facts.json → multi_year_trajectory` (`CIQ Financials → Income Statement`) — tier-5 vendor export |
| FY2025 revenue (derived, shown) | **5,660** = vendor operating income **−520.7** ÷ its stated **−9.2%** margin | `04` §5 terminal-margin anchor table, from `CIQ Financials_Annual → Income Statement` |
| Prior-trough EBITDA margin, **REPORTED (vendor) basis** | **6.71%** = 380 ÷ 5,660 | arithmetic, executed snippet below |
| **Accounting-definition bridge — reported → management basis** (the basis this weighted set uses) | **+ stock-based compensation 324.0** (FY2025 actual). Acquired-intangible amortisation is already inside D&A and so is added back on **both** bases — it is not double-added. The deferred-revenue change is a Net-Bookings adjustment and is **not** applied to a historical reported margin, because no FY2025 figure for it is disclosed in this pool; its omission makes the bridge **conservative** (it would raise the trough margin further) | `earnings/07` §2 row 6 (SBC series FY23 317.8 / FY24 335.6 / **FY25 324.0** / FY26 305.3); `03` §2 recomputation 2 for the add-back identification |
| **Prior-trough EBITDA margin, MANAGEMENT basis** | **12.44%** = (380 + 324.0) ÷ 5,660 → absolute **704.0** | arithmetic |
| Bear revenue (this case's forward denominator) | **7,925.1** = NTM revenue 9,906.3 × (1 − 20%) — `earnings/07` row 1's own bear move size | `earnings/07` §2 row 1 |
| **Re-based bear NTM EBITDA** | **985.8** = 7,925.1 × 12.44% | arithmetic |
| Not-deeper-than-history check | 985.8 is **1.40x** the prior trough's own management-basis absolute EBITDA of 704.0, on 40% more revenue at the **same** margin — severe but **not** a trough the history does not support | arithmetic |

**Why this re-basing matters and is not a softening.** Dropping FY2025's absolute EBITDA of 380 beside a forward normalized base of 2,349.1 would have reported an 84% fall, of which a large part is pure arithmetic — a different revenue base and a different accounting definition. Re-basing on the **margin** and then bridging the **definition** isolates the genuine downturn: the honest bear metric is **985.8 (42.0% of consensus)**, not 380 (16.2%). The severity is not what is being adjusted — the **basis** is. This is an EV-level metric, so interest, tax and the share count enter through the case's own EV→equity bridge (`− net debt 1,370.4 ÷ 188.0`, the same strict §15 convention every case above uses) rather than through a per-share rebuild.

### `bear_structural` — the explicit structural-reset bridge, and which case it becomes

**The trigger fired twice.** `business-model/09_moat.md` §5 returns **"No moat proven"** (four moat sources present, none reaching the 61–80 strong band; the economic test failing on every basis — five-year through-cycle ROIC **−0.7%** and LTM **−2.2%** against an ~8.2% cost of capital, a gap of 890–1,040bps, surviving the full 7.8–9.1% sensitivity range), and `business-model/07_business-quality.md` §1 scores **industry rate-of-change / disruption 35 (≤ ~40)**, firing **RF-BQ-005** and the CLAUDE.md §24 Filter 5 flag.

**The bridge, matched to what the reset method produces.** The reset value is an **enterprise value** — `04`'s impaired FCFF DCF with its declining-perpetuity terminal, which is the business-type-appropriate method for an Operating company (not a forced EBITDA × multiple, and not a financial's DDM or a REIT's NAV). So net debt is subtracted **before** dividing:

> impaired EV **11,246.3** − `01`'s canonical strict net debt **1,370.4** = equity **9,875.9** ÷ **188.0** shares = **USD 52.53 per share**

That reconciles to `04` §6's own published runoff figure of **52.53** exactly, and `04`'s harsher variant (the margin fade running from FY2035 rather than the terminal only) gives **50.58**. The **cross-measure reconciliation** `bear_structural` owes, because it changes measure as well as period: the impaired EV expressed on this set's own axis is **11,246.3 ÷ 2,349.1 = 4.79x EV/NTM EBITDA** — below `02`'s 5-year NTM minimum of 14.30x and inside the distressed end of the live peer cross-section (Ubisoft 2.20x, Playtika 3.67x, tinyBuild 7.37x) [`02` §2A; `03` §2]. Read that translation for what it is: the reset's whole point is that the 2,349.1 level does **not** persist, so 4.79x is a translation device, not a claim the market would pay it. One further definition difference travels with the bridge: `04` **charges** SBC inside EBIT while the management-basis NTM measure **adds it back** [`04` §1], which is one reason the two axes are not interchangeable without this reconciliation.

**Which case it becomes — graduated, and the demotion is justified rather than assumed.** The moat trajectory is **"eroding (NOT confirmed)"**, stated in those words: *"this is an eroding-but-unconfirmed read, not confirmed erosion, and it must not be carried into a scenario driver or a kill criterion as though it were settled"* [`business-model/09_moat.md` §5]. Confirmed erosion is therefore **absent**, so the worse-of rule does **not** promote the reset to the headline Bear. The bare **No-moat** demotion is permitted here only because the precondition holds: `04_intrinsic-dcf` **is** in the weighted blend (25%) and its base case **does** fade terminal ROIC to the cost of capital with no perpetual excess return (`TV = NOPAT/WACC`, `04` §5) — so a weighted method already prices the lost excess return, and the reset is not dropping to a non-headline floor while no method carries it. The disruption-flag trip routes to the avoid-ruin floor in any case.

> **So: the headline Bear is the cyclical trough at USD 67.68 (12-month). The structural reset of USD 52.53 is carried as the labelled avoid-ruin floor for §24 / Kill Criteria (24–36 month permanent-impairment path).** Note that the floor sits **BELOW** the cyclical trough (52.53 < 67.68), so if the trajectory confirms, the headline down-leg moves down to the reset — and the discriminating data point is already dated: **Q3 FY2027, the first full quarter with GTA VI on sale, releasing on or about 2027-02-09** [`CIQ Estimates → Consensus` header; `business-model/09_moat.md` §5].

**Span check (CLAUDE.md §10), asked and answered.** What single piece of news could move this 10%+? The GTA VI sell-through read in the Q3 FY2027 print on 2027-02-09 — the title went on sale on the anchor price's own date and **no reported period contains a single dollar of it** [`earnings/07` §4]. The bull contains the beat (+10% revenue at the disclosed incremental margin, plus the own-history multiple returning), and the bear contains the miss (−20% revenue at a prior-trough margin and the band's own minimum multiple). The levels span **67.68 to 397.52** — a 5.9x range on a company whose own EV/LTM EBITDA ran 17.69x → 94.37x → 52.24x in two years [`02` §3] and whose earnings-volatility score is **78/100 (inverted — higher = worse)** [`earnings/07` §7]. **One limit stated rather than buried:** the bull level of 397.52 sits **above the highest of 29 analyst target prices (330.00; mean 283.93, low 170.00)** [`CIQ Estimates → Consensus`]. Those are 12-month price targets, not fair values, and are not an independent method — but a bull that clears all 29 is the outer edge of what this evidence admits, and it is published as such.

**No probabilities, no weighted target, no risk/reward, no rating, no position size are assigned here — those belong to the master synthesizer (CLAUDE.md §10, §22; MODULE_RULES Scope).**

### Executed snippet — every level, bridge and price-relative metric

```bash
$ python3 s07.py   # executed 2026-11-20
WEIGHTS sum = 1.0
contributions: 02 98.53 | 03 81.85 | 04 15.79
BASE POINT (mechanical weighted blend) = 196.17 /sh
football field 63.17 - 328.44 ; high/low = 5.20x ; spread on low end = +419.9%

BASE  EV 38251.3  implied EV/NTM EBITDA 16.28x  implied NTM P/E 20.50x
BULL  metric 2839.1 (+20.9%)  x 26.806x -> EV 76104.3 -> 397.52 /sh (+83.5% vs price)

prior trough FY2025: rev 5660  EBITDA(reported) 380 = 6.71% margin
  + SBC 324.0  -> EBITDA(management basis) 704.0 = 12.44% margin  [definition bridge]
BEAR_CYCLICAL rev 7925.1 x 12.44% = EBITDA 985.8 (42.0% of consensus NTM)
  x 14.298x -> EV 14094.5 -> 67.68 /sh (-68.8% vs price)
  sanity: absolute EBITDA 985.8 vs prior-trough management-basis 704.0 -> 1.40x (not deeper than history)

BEAR_STRUCTURAL (EV-based): impaired EV 11246.3 - net debt 1370.4 = equity 9875.9 / 188.0 = 52.53 /sh (-75.7%)
  cross-metric translation: impaired EV / NTM EBITDA = 4.79x  (vs 02 5-yr NTM min 14.30x, peer NTM low 2.20x)
  harsher 04 variant (fade from FY2035) = 50.58 /sh

PRICE-RELATIVE (price 216.61, pool-verified 2026-11-19)
  implied upside to base = (base - price)/price      = -9.43%
  MARGIN OF SAFETY       = (base - price)/base       = -10.42%  (cushion; negative = none)
  DOWNSIDE TO BEAR       = (price - bear)/price      = +68.75%  (INVERTED: higher = worse)
  downside to structural floor = (price - 52.53)/price = +75.75%
  memo: base 16.28x on consensus FY2027 EBITDA (02 §4 / 03 §2) 1692.8 -> 139.33 /sh
  memo: base 16.28x on company-guided FY27 non-GAAP EBITDA (01 §5) 1053.0 -> 83.92 /sh
```

---

## 4. Margin of Safety & Downside (two separate metrics)

Price-state is **`pool-verified`** and **1 trading day old** [`01` §7], so both price-relative metrics unlock and neither the no-price cap nor the staleness cap binds. No dual-price presentation is required because the anchor is not stale.

| Metric | Value |
|---|---:|
| Current price (last close, as-of 2026-11-19, pool-verified) | **USD 216.61** |
| Base-case fair value (point, 12-month) | **USD 196.17** |
| Bear-case fair value — `bear_cyclical` (headline, 12-month) | **USD 67.68** |
| *Memo — `bear_structural` avoid-ruin floor (24–36 month)* | *USD 52.53* |
| Implied upside to base case = (base FV − price) / price (%) | **−9.43%** |
| **Margin of safety** = (base FV − price) / base FV — the cushion (%) | **−10.42%** — **negative: there is no cushion at this price** |
| **Downside to bear** = (price − bear FV) / price — *inverted: higher = worse* (%) | **+68.75%** |
| *Memo — downside to the structural floor = (price − 52.53) / price* | *+75.75% (inverted)* |

**These are two different numbers and neither is a proxy for the other.** The margin of safety is the discount of price to the **base** case and it is **negative** — the price sits **above** the blended fair value, so no cushion exists. The downside to bear is the loss if the **bear** case plays out and it is **+68.75%** on an inverted scale where higher is worse. Reading the −10.42% as "roughly fair" without the +68.75% beside it would miss the entire shape of this situation.

---

## 5. Warranted-Multiple Check

**The base point implies 16.28x EV/NTM EBITDA and 20.50x NTM P/E, and on the quality evidence that is at the generous end of what this business warrants — but it does not require a multiple the company has never earned.** Against the quality-matched five-peer forward median of **15.14x** it is a **+7.5%** premium, and against `02`'s own 20-quarter NTM band (min 14.30x, median 26.81x, max 51.73x) it sits around the 15th–20th percentile — so the base is **not** built on an unprecedented multiple. What argues against even that modest premium is specific and cited: business quality **38/100 (Weak)** with cyclicality 22, competitive intensity 25 and rate-of-change 35; **"No moat proven"** with return on capital below cost of capital for five consecutive years (ROIC −4.3%, −3.1%, −4.2%, −0.8%, −1.0% LTM against ~8.2%); the second-highest leverage in the peer set at **3.6x total debt/EBITDA against a peer median of 0.6x**; and the **worst Credit Health score in the set (Overall 4, where 1 = best, against a peer median of 2.5)** [`business-model/07_business-quality.md` §1; `09_moat.md` §3–§5; `CIQ Comps → Operating Statistics` and `→ Credit Health Panel`, As-Of 2026-11-19]. What argues for it, and must be credited or the discount is charged twice: TTWO's **NTM long-term EPS growth of 25.75% is the highest in the set** (against a three-observation peer median of 10.05%) and its **S&P BBB is the highest rating in the set**, while on the **forward** period being valued its NTM EBITDA margin of 23.71% sits **above** the matched sub-set median of 19.05% [`03` §4].

**Value-trap risk is flagged, on three grounds, none of which is the Filter-6 cap.** First, **RF-OWN-004 did NOT fire**, so the §24 Filter 6 unaligned-owner cap does **not** bind — but the governance verdict it sits inside is *"Misaligned or weak stewardship"*, evidenced by five years in which capital allocation netted **minus $14.6m** of free cash flow while the share count rose **61.7%**, book value per share fell **42.5%**, and **$6,665.1m — 84.7% of all goodwill ever recorded — was written off** [`management-governance/99_management-governance-synthesis.md` §1, carried verbatim by `02` §0 and `06` §4]. A multiple earned while per-share value was being destroyed is a weak claim on the future, and it is the specific reason reverting to 26.81x is treated here as a **bull** multiple rather than a base. Second, **§2B's Sector Cycle Reality Test is "Not assessable" for both multiples methods**, so I cannot confirm the warranted multiple is not itself sitting inside a cycle-elevated sector — a base case that "deserves" its multiple only because the whole sector currently does is not a durable warranted multiple, and here that question is **unmeasured, not cleared**. Third, and the sharpest: the warranted multiple is being applied to a **launch-peak denominator**. At the same 16.28x, consensus FY2027 EBITDA gives **USD 139.33** and the company's own guided FY2027 non-GAAP EBITDA gives **USD 83.92** — so the base point is defensible on the multiple and fragile on the metric, which is the reverse of the usual value-trap shape and no less dangerous.

---

## 6. Fair-Value Read

**Base-case fair value is USD 196 per share on a 12-month horizon — USD 196.17 exactly, implying 16.28x EV/NTM EBITDA and 20.50x NTM P/E on 188.0m diluted shares — against a pool-verified close of USD 216.61 as-of 2026-11-19, with bull at USD 397.52 and the headline bear (`bear_cyclical`) at USD 67.68, plus a labelled 24–36 month structural-reset avoid-ruin floor at USD 52.53.** The **margin of safety is −10.42%** (the price is above the blended fair value, so no cushion exists) and the **downside to bear is +68.75%** (inverted — higher is worse); the two are different metrics and both are stated because reading either alone misses the shape.

**`03_relative-valuation-peers` drives the answer at 45% of the weight** — a forward, same-day, quality-matched peer cross-section with its double-count test run and one genuinely independent corroborating read beside it (the EA take-private at ~6.94x LTM EV/Sales, against TTWO's own 6.5x, which means the public minority price already sits at **94% of a control price for the closest comparable**). `02`'s own-history lens is weighted below it at 30% because its 26.81x median is a pre-launch multiple applied to post-launch earnings, its producer calls it ceiling-ish, and a record of where the market already priced TTWO cannot tell you whether the market is pricing TTWO correctly. `04`'s DCF at 63.17 is held at the top of its ≤ ⅓ cross-check allowance (25%) rather than dismissed, because `04` §3A and `05` §2A both tested and rejected the discount-rate explanation — the price only reconciles at **2.63%**, which is 244bps **below** the risk-free rate and therefore not a cost of capital at all.

**The single biggest swing factor between bull and bear is one thing with one date: Grand Theft Auto VI sell-through, read in the Q3 FY2027 print on or about 2027-02-09.** The guided launch quarter is **120.9%** of the whole year's guided Net Bookings growth, the other three quarters are guided to shrink by 288.9 in aggregate, no reported period contains a single dollar of the title, and the downside coefficient is **1.0x to 2.0x** the upside one because the amortisation policy charges at the **greater of** revenue-proportional or straight-line while **$2,577.3m** of capitalised development cost sits exposed to the recoverability test [`earnings/07` §4–§6]. **And the honest limit on all of it:** the cross-method field spans **5.2x (+419.9% on the low end)**, which caps valuation confidence at **55** no matter how well §2 explains it; neither multiples method has a verified stable anchor because the Sector Cycle Reality Test is **"Not assessable"** in both; 75% of the base point rests on **one** unproven forward estimate (NTM EBITDA 2,349.1) struck on a management-reporting basis whose peer counterparts' bases are undisclosed; and the source-check status for every workbook figure behind all of it remains **UNCHECKED, not clean**.



---

## valuation / 08_strategic-rerating.md

_Source: `08_strategic-rerating.md`_

# Strategic Rerating — TTWO

**Company:** Take-Two Interactive Software, Inc. (NasdaqGS:TTWO) · **Run date:** 2026-11-20
**Reporting standard:** US GAAP · **Currency:** USD, millions unless stated · **Fiscal year ends 31 March** ("FY2027" = Apr-2026 → Mar-2027, not a calendar year) [`FY26 10-K, cover page`].

**Anchors adopted verbatim from `01_price-and-capital-structure.md` §7 — not rebuilt (MODULE_RULES Reconciliation Gate 1).** Price **USD 216.61** (last close, as-of **2026-11-19**, price-state **`pool-verified`**, 1 trading day old, no staleness cap); shares for per-share work **188.0m** (the company's own disclosed diluted count, used because every trailing GAAP period is a loss so trailing "diluted" equals basic); market cap **40,552.3**; **canonical strict §15 net debt 1,370.4**; **canonical EV 41,922.7**; vendor TEV **41,790.1** (broad on cash, lease-inclusive on debt). No dividend has ever been paid and none is expected, so no yield is quoted anywhere below [`FY26 10-K, Item 5 — Dividend Policy`].

**Source-check status carried forward: UNCHECKED, not verified clean.** This frozen generation carries **no `numeric_reading_check`** object at any source or sheet level (string count in `GENERATION_ROOT/manifest.json` = 0), and `GENERATION_ROOT/corpus.txt` carries no labelled extractor reading-warning annotation. There is therefore **no literal warning token, no source/extract reference and no canonical LF-line/column span to quarantine**, and **no amount below is marked not-proven on that basis**. But a missing legacy check means **unchecked, not clean** — no warning is not proof of accuracy. Every filing figure below was read from the frozen extract of the document that reports it; every Capital IQ workbook cell remains mechanically unverified by the pattern check, and the two value-determining vendor cells (the forward multiple grid and the quarterly multiple series) were re-derived from their own printed numerator and denominator inside this frozen capability, with the arithmetic shown. Every restating layer must carry this qualifier forward.

**Two triage conditions bind every number here.** (1) **The trailing earnings base is negative** — LTM EBIT **−112.5**, LTM diluted EPS **−1.29** [`Capital IQ Comps → Financial Data`, As-Of 2026-11-19] — so no trailing P/E or trailing EV/EBIT exists, the exact price identity for positive EPS may not be applied (see §3), and every multiple below is **forward and labelled**. (2) **Sector-level multiple history is absent from the pool**, so the Sector Cycle Reality Test is **"Not assessable"** in both `02` §5 and `03` §6; neither `RF-VAL-001` nor `RF-VAL-002` fired, and that gap travels with every multiple used here — the reference levels are the best available, **not proven stable**.

**Governance qualifier carried, not dropped.** `management-governance/99_management-governance-synthesis.md` records **no hard disqualifier** and **RF-OWN-004 not fired** (so the §24 Filter 6 value-trap cap does not bind), but its verdict is **"Misaligned or weak stewardship"**, and **RF-MGT-005 fires at High on a live, unadjudicated matter — a conviction cap, not a gate failure**, carrying "no rating above Watchlist". Its §24 Filter 2 test records **one year of delivered inflection** against the two-to-three years of proven operating improvement the filter demands (**RF-MGT-004 tested and not fired**) [`management-governance/99`, §1 and finding 01-018]. This module lifts none of those caps.

---

## 1. Pivot & observable event

**Applicability: a strategic pivot IS evidenced — and it is NOT the Grand Theft Auto VI launch.** Two things are happening at once in this company and the whole report depends on keeping them apart.

- **The pivot.** Take-Two bought Zynga (closing in FY2023) and turned itself from a console release house into a company whose largest platform is mobile and whose largest revenue line is continuing in-game spending rather than game launches. The claimed change in business economics is on the face of the filings: **mobile is 50.1% of FY2026 net revenue** and **recurrent consumer spending ("RCS" — virtual currency, add-on content, in-game purchases and in-game advertising) is 78.1%**, rising to **82.5% of GAAP net revenue in the six months to 2026-09-30** [`FY26 10-K, Item 7 MD&A, p.44`; `Q2 FY27 10-Q, MD&A, p.24`]. Inside that sits a second, narrower and more specific margin claim: the **direct-to-consumer ("DTC") commerce platform**, which sells mobile in-game items outside the Apple and Google stores and therefore outside their platform fees — "we are also continuing to expand our direct-to-consumer efforts more meaningfully across our mobile portfolio **to enhance profitability**" [`FY26 10-K, Item 7 MD&A, p.44`; repeated verbatim at `Q2 FY27 10-Q, MD&A, p.23`], and on the call, "there is no doubt that our direct-to-consumer business has had **a material effect positive on our margins** in the Mobile business" [`Q1 FY27 earnings call, 2026-08-07, Q&A (Zelnick)`]. Management's own equity plans run on the pivot's metric: performance-based restricted stock units are measured on **recurrent consumer spending net bookings** [`FY26 10-K, Exhibit — form of performance-based RSU award agreement`].
- **Not the pivot.** Grand Theft Auto VI released on **2026-11-19**, the anchor price's own date [`Q2 FY27 10-Q, Item 1A and Item 2 MD&A`]. That is an ordinary — if unusually large — release-cycle step-up in the **denominator**, not a change in the multiple. The arithmetic is unambiguous: consensus **NTM EBITDA of 2,349.1 is 3.24x LTM EBITDA of 724.9** and **2.23x** the company's own guided FY2027 non-GAAP EBITDA midpoint of 1,053 [`02` §3; `01` §5]. Treating that step-up as evidence of a rerating would be the exact error this module exists to prevent.

**No quantified original milestone exists for the pivot, and that is a disclosure fact, not an oversight on my part.** The pool contains no Zynga deal model, no synergy target and no DTC target. The acquisition language in the filings is forward-looking boilerplate — "the possibility that the combined company would not achieve the expected benefits, including any anticipated operating and product synergies" [`FY26 10-K, Item 1A Risk Factors`] — and the strategy section sets no number at all: "a key component of our strategy is to build a portfolio and forward pipeline of commercially successful franchises… we provide continuous recurrent consumer spending offerings" [`FY26 10-K, Item 1 — Strategy`]. On the DTC claim management declines to quantify by name: "we don't talk about the actual percentage, and **we don't talk about our goals in terms of the percentage of our business**" [`Q1 FY27 earnings call, 2026-08-07, Q&A (Zelnick)`]. The one dated, named programme in the pool — the **"2024 Plan"** cost reduction programme, "largely completed as of March 31, 2025" — discloses its **costs** (106.5 in FY2025, 104.6 in FY2024, 14.6 in FY2023 = **225.7**) and **no savings target and no delivered saving** [`FY25 10-K, Note 21 (Business Reorganization), p.104`]. So promises-versus-delivery can be tested on **outcomes**, never against a number management put in writing. Where a milestone column below reads "none quantified", that is the finding.

### The event this report assigns a probability to

| Element | Definition |
|---|---|
| **Issuer / tradable line** | Take-Two Interactive Software, Inc. — **NasdaqGS:TTWO · NASDAQ Global Select Market · USD**. Single listed line; one class under §12(b), §12(g) "None" [`FY26 10-K, cover page`; `01` §1] |
| **Baseline date** | **2026-11-19** (the price anchor's own as-of date; the forward multiple grid carries the same As-Of) |
| **Multiple and denominator basis** | **EV ÷ consensus FY2029E EBITDA** — a **fixed future fiscal year** (FY2029 = the year ending 2029-03-31, i.e. Apr-2028 → Mar-2029), struck on the **vendor TEV** and the **vendor consensus** for that same fiscal year, i.e. the same engine on both sides of the ratio |
| **Baseline multiple** | **15.94x** — printed as 15.9360526 at `Capital IQ Estimates → Multiples`, "FY 2029" TEV/EBITDA, As-Of 2026-11-19. Re-derived inside the frozen capability: vendor TEV 41,790.1 ÷ 15.9360526 = **FY2029E EBITDA 2,622.4**; on the canonical EV of 41,922.7 the same multiple is **15.99x** (a 0.3% difference, labelled, immaterial to the test) |
| **Target multiple** | **≥ 20.0x** on that same basis, **held on at least three consecutive month-end observations** |
| **Anti-shrinking-denominator condition** | At the outcome observation, **consensus FY2029E EBITDA must be at or above its baseline 2,622.4**. A multiple that reaches 20x because the estimate was cut is a derating wearing a rerating's number, and does not count |
| **Operating-quality milestones (all four required)** | **M1** FY2028 RCS **net bookings** above FY2027's. **M2** FY2028 **mobile net revenue** above FY2027's. **M3** FY2028 **GAAP operating profit positive and ROIC positive** (the pivot's own capital base is not disclosed, so this is the group-level stand-in — see §2). **M4** FY2028 **§15 free cash flow (CFO − total capex) at least equal to FY2027's and at least 700** — i.e. the launch-year cash level is *sustained* into the following year |
| **Horizon** | Baseline 2026-11-19 → **2028-03-31** (16 months). The window contains Q3 FY2027 through Q4 FY2028 — the launch quarter and the first full post-launch year — so the recurring-economics claim becomes observable inside it |
| **Observation source / frequency** | `Capital IQ Estimates → Multiples` (FY2029 TEV/EBITDA row) and `Capital IQ Financials_Quarterly → Multiples` (Close series), **monthly**; milestones from the FY2028 Form 10-K and the four FY2028 Form 10-Qs |
| **Success / failure test** | **Success** = the 20.0x threshold held for three consecutive month-ends with the denominator condition satisfied **AND** all four milestones met by 2028-03-31. Anything else is failure of this event, which **includes partial success and delay** and does **not** automatically mean derating |

**Why the denominator is a fixed fiscal year and not NTM — this is the load-bearing basis choice, and the pool proves it is necessary.** On the NTM basis the same company's multiple has just fallen by more than a third with no rerating event whatsoever: `Capital IQ Financials_Quarterly → Multiples`, "TEV/NTM EBITDA" **Close**, reads **27.645x at 2026-06-30 → 19.371x at 2026-09-30**, and the estimates tab prints **17.790x** on 2026-11-19 — **−35.7%** in under five months, because the twelve-month window rolled onto the GTA VI launch year. An NTM-basis threshold would have been *cleared* at 2026-03-31 (23.382x) and 2026-06-30 (27.645x) and *failed* now, measuring nothing but the calendar. A fixed-period denominator holds the earnings constant so that a change in the multiple is a change in what the market will pay per dollar of the **same** post-launch earnings — which is what "rerating" means.

**Why 20.0x, derived rather than asserted.** TTWO's quality-matched five-peer forward median is **15.14x** (Konami; set = Roblox, Nintendo, 37 Interactive, NEXON, Konami, after four named exclusions) and TTWO already sits **above** it on both the NTM (17.79x, +17.5%) and FY2029 (15.94x, +5.3%) bases [`03` §3b]. The two peers whose economics most resemble a *proven* durable live-service model trade at **25.24x (Nintendo)** and **25.95x (Roblox)** forward [`03` §2]. If the pivot were proven, the warranted level would sit between the matched median and those two: the midpoint of 15.14x and 25.24x is **20.19x ≈ 20.0x**. Two cross-checks: 20.0x sits inside TTWO's own 20-quarter forward band (min 14.298x, median 26.806x, max 51.732x) so it is not a multiple the company has never earned — **basis caveat, load-bearing: that band is struck on NTM, not on a fixed fiscal year, so it brackets the target rather than setting it** [`02` §2A]; and 20.0x × 2,622.4 = EV 52,447.2 − net debt 1,370.4 = equity 51,076.8 ÷ 188.0 = **USD 271.69 per share, +25.4% on the 216.61 close**, below the mean of 29 analyst targets (283.93) and well below the high (330.00) [`ciq_facts.json → consensus_view`; `CIQ Estimates → Consensus`]. Those targets are 12-month price targets, not fair values, and are not a method.

**Reconciliation with `07`, stated here and not buried.** `07`'s base fair value of **USD 196.17** implies EV 38,251.3, which on this report's own fixed basis is **38,251.3 ÷ 2,622.4 = 14.59x** FY2029E EBITDA — **below** today's 15.94x. So the event defined above describes the market paying a multiple roughly **37% above the level `07` judges warranted**. That is a deliberate feature of a rerating test, not a competing valuation: **`07` owns the fair-value levels and this module changes none of them.** If the event occurred, it would mean the market had re-rated past `07`'s warranted multiple — which is information for the master synthesizer, not a new fair value.

---

## 2. Three-pillar evidence board

All "same-period prior year" cells are the same period a year earlier on the same reporting basis (CLAUDE.md §17). RCS and Net Bookings figures are the company's own operational metric; GAAP revenue figures are GAAP. The two are never mixed in one row.

| Pillar | Metric / scope / period | Same-period prior year | Latest | Original milestone | Bull evidence | Bear evidence / gaps | Source | Winning side |
|---|---|---:|---:|---|---|---|---|---|
| **1 Execution** | RCS **GAAP net revenue**, group, FY | 4,474.6 (FY2025) | **5,196.6 (FY2026), +16.1%** | None quantified | The pivot's revenue line grew 16.1% and is 78.1% of the company | FY2027 guidance puts RCS **flat** and at **65% of net bookings vs 78% in FY2026** — the share goes into reverse | `FY26 10-K, MD&A p.44`; `Q2 FY27 investor deck, 2026-11-09, pp.5 and 8` | **Mixed** |
| **1** | RCS **net bookings**, group, **six months to 30 Sep** | 2,611.8 (H1 FY2026) | **2,471.5 (H1 FY2027), −5.4%** | None quantified; the quarter's own guidance was **RCS −5%** | — | Delivered **−9%** against guided −5%; the quarter's bookings also missed the company's own range (1,601.3 vs 1,620–1,670) | `TTWO 2Q27 Earnings Release, 2026-11-09, Net Bookings by content table`; `Q2 FY27 earnings call, 2026-11-09, prepared remarks (Goldstein)` | **Bear** |
| **1** | RCS net bookings, **quarter to 30 Sep** | 1,428.3 (Q2 FY2026) | **1,302.1 (Q2 FY2027), −8.8%** | Guided −5% | — | Attributed by name to NBA 2K; total net bookings −18% | same release, same table | **Bear** |
| **1** | **Mobile** net revenue, group, FY | 2,942.0 (FY2025) | **3,333.0 (FY2026), +13.3%** | None quantified | Mobile is the largest platform at 50.1% of revenue | FY2027 guidance assumes **mobile down** "as Color Block Jam laps and several mature Zynga titles moderate" | `FY26 10-K, MD&A p.44`; `Q2 FY27 investor deck, p.8` | **Mixed** |
| **1** | Mobile net revenue, **quarter to 30 Sep** | 821.6 (Q2 FY2026, derived: 731.1 + the disclosed 90.5 fall) | **731.1 (Q2 FY2027), −11.0%** | None quantified | — | The pivot's own platform shrank 11.0% in the latest reported quarter; mobile is 49.3% of H1 revenue, down from 50.1% for FY2026 | `Q2 FY27 10-Q, MD&A, p.24` | **Bear** |
| **1** | **In-game advertising** revenue, group, FY | 466.1 (FY2025) | **494.3 (FY2026), +6.1%** | None quantified | Grew 6.1%; "our advertising business improved sequentially as we successfully attract new partners and increase ad yields" | Still **24.7% below FY2024's 656.1** — two years after the decline, the line has not recovered | `FY26 10-K, Consolidated Statements of Operations` (Game / Advertising split); `Q2 FY27 earnings call, prepared remarks` | **Mixed** |
| **1** | **DTC channel revenue, share of mobile, and growth rate** | **Not proven from available data** | **Not proven from available data** | **None — management declines to set one** | "A durable and expanding engine for net bookings growth and long-term profitability"; "we are seeing growth there" | **No size, no share, no growth rate, no target anywhere in the pool.** "We don't talk about the actual percentage, and we don't talk about our goals in terms of the percentage of our business" | `Q2 FY27 earnings call, prepared remarks`; `Q1 FY27 earnings call, 2026-08-07, Q&A (Zelnick)` | **Unknown** |
| **1** | Paying players / monthly or daily actives / ARPU / cohort retention | **Not disclosed** | **Not disclosed** | None | One title datapoint: NBA 2K26 average daily actives **+15%** | RCS for that title grew only **+7%** on +15% actives → **spend per active fell ~7%** (*inference, not from filings*: 1.07 ÷ 1.15 − 1). Three of the seven sector KPIs that would let an outsider model this business are absent | `Q1 FY27 earnings call, prepared remarks`; `business-model/04_unit-economics.md` §2; `earnings/02_revenue-drivers.md` §71 | **Bear (on the one datapoint) / Unknown (on the group)** |
| **1** | Disclosed **user life** (management's own estimate of how long a player lasts) | "**six** and fifteen months" (FY2025 10-K) | "**five** and fifteen months" (FY2026 10-K, repeated in Q2 FY27) | None | — | The bottom of management's own estimated player life **shortened by a month**; title amortisation range shortened from "12 to 36" to "**9 to 36**" months. Both are shorter lives for the recurring asset the pivot is built on | `FY26 10-K, Note 2 — Estimated Service Period`; `FY25 10-K, Note 2`; `FY26 10-K, Note 1`; `Q2 FY27 10-Q, MD&A p.24` | **Bear** |
| **1** | Promises vs delivery — annual Net Bookings guidance | 6 of 6 kept, FY2021–FY2026 | **Q2 FY2027: first miss of its own quarterly range in the set** | The company's own guided ranges | Six straight years of hitting its own final annual top-line target | Beat magnitude collapsing: management-basis EPS surprise +48.2% → +42.9% → +6.1% → +3.1%; GAAP diluted EPS guidance kept in **1 of 4** years; GTA VI slipped ~13–14 months across two revisions | `management-governance/99`, finding 01-001/01-018; `earnings/04_guidance-consensus.md` §6 | **Mixed** |
| **2 Margin / capital** | Group **gross margin**, FY | 54.3% (FY2025) | **57.2% (FY2026), +290bp** | None quantified | The largest single improvement in the pivot's financial quality | Reverses on the like-for-like interim: **57.6% for H1 FY2027 vs 58.7% a year earlier, −110bp**; and management attributes the lower FY2027 full-year gross-margin guidance to "**the mix of the business**" | `FY26 10-K, MD&A p.43`; `Q2 FY27 10-Q, MD&A p.29`; `Q2 FY27 earnings call, Q&A (Goldstein)` | **Mixed** |
| **2** | **Mobile vs console/PC gross-margin gap** (the pivot's central margin question) | **Not disclosed** | **Not disclosed** | None | — | Only a direction is given: mobile "generally generates a lower gross margin percentage than our Console or PC revenue" because Apple/Google platform fees sit in cost of revenue. **The size of the gap and the platform-fee rate are nowhere in the pool** | `Q2 FY27 10-Q, MD&A p.23`; `FY26 10-K, MD&A p.44` | **Unknown** |
| **2** | **DTC margin uplift** — the pivot's own stated profitability claim | **Not proven from available data** | **Not proven from available data** | None | "A material effect positive on our margins in the Mobile business" (management, unquantified) | An adjective with no number, from a transcript (tier 6), about a channel whose size is withheld. **Not proven from available data** | `Q1 FY27 earnings call, Q&A (Zelnick)` | **Unknown** |
| **2** | **Revenue vs EBITDA since the pre-pivot peak** (FY2021 → FY2026) | Revenue 3,373 · EBITDA 757 · EBITDA margin 22.4% (FY2021) | **Revenue 6,656 (+97.3%) · EBITDA 788 (+4.1%) · margin 11.8%** | None quantified | Absolute EBITDA is not lower | Revenue **doubled** while EBITDA rose **4.1%** — an incremental EBITDA margin of **31 ÷ 3,283 = 0.9%**. The pivot roughly halved the EBITDA margin. **Tier-5 vendor export, mechanically unchecked** | `ciq_facts.json → multi_year_trajectory` and `→ margin_trend` (`CIQ Financials → Income Statement`) | **Bear** |
| **2** | **Group ROIC**, FY | −4.2% (FY2025) | **−0.8% (FY2026); −1.0% LTM to Sep-2026** | None quantified | Improving: −4.3% → −3.1% → −4.2% → −0.8% → −1.0% | **Negative five years running**, against a ~8.2% cost of capital — a gap of 890–1,040bp that survives the full 7.8–9.1% sensitivity range. Pre-pivot the same series ran +6.0% to +13.4%. Tier-5 vendor export | `ciq_facts.json → multi_year_trajectory` (`CIQ Financials → Ratios`); `business-model/09_moat.md` §3 and §5 | **Bear** |
| **2** | **Segment / pivot-level ROIC and segment profit** | **Not assessable** | **Not assessable** | None | — | **One operating and reportable segment**; the segment measure of profit *is* consolidated net income and segment assets *are* consolidated total assets, so no capital base exists for the new business. The filing discloses **two unnamed goodwill reporting units** and withholds their identity, revenue and profit. **Segment ROIC is Not assessable — it is not zero** | `FY26 10-K, Note 21, p.102`; `FY26 10-K, Critical Accounting Policies — Goodwill`; `business-model/03_segment-map.md` §1C, §3 | **Unknown (structurally)** |
| **2** | **§15 free cash flow** (CFO − total capex), FY | (234.9) (FY2025) | **434.1 (FY2026); 62.6 LTM to Sep-2026** | None quantified | FY2026 was the best year on record on this definition | FY2022 99.4 → FY2023 (203.1) → FY2024 (185.2) → FY2025 (234.9) → FY2026 434.1 → LTM 62.6: **three negative years inside five**, and the only computable full-span rate is **−9.76% a year** | `earnings/01_historical-financials.md` §1–§2; `05` §5 base-rate block | **Bear** |
| **2** | **Stock-based compensation** and share count | SBC 324.0 (FY2025) | **305.3 (FY2026); guided 462 for FY2027, +51.3%** | None quantified | FY2026 SBC fell 5.8% | FY2027 guidance lifts SBC to **5.72% of guided revenue**; over the five years inside the pivot the **share count rose 61.7%**, book value per share fell 42.5%, and capital allocation netted **minus 14.6** of free cash flow | `TTWO 2Q27 Earnings Release, Outlook for FY2027`; `management-governance/99` §1 | **Bear** |
| **2** | **Capitalised content at risk** | 1,815.0 unreleased (31 Mar 2025) | **2,149.7 unreleased of 2,346.3 total (31 Mar 2026), 91.6%; 2,577.3 carried at 30 Sep 2026** | None | The spend is building FY2027+ revenue, so FY2024–FY2026 comparisons are conservative-biased against the company | The unreleased book grew **18.4%** year on year and equals **61.2% of total stockholders' equity**; 43.6 already charged in H1 FY2027; the amortisation policy charges at the **greater of** revenue-proportional or straight-line | `FY26 10-K, Note 7, p.83`; `Q2 FY27 10-Q`; `earnings/07_earnings-sensitivity.md` §6 | **Bear (risk)** |
| **2** | **Audited verdict on the capital the pivot consumed** | Gross goodwill 6,949.2 | **Accumulated impairment 5,887.3 — about 85% of all goodwill ever recorded**; net goodwill 1,061.9 | None | No impairment was taken in FY2026 | Charges of 3,545.2 (FY2025) and 2,342.1 (FY2024) against **one** reporting unit, for "a reduction in the forecasted performance of the reporting unit due to **industry conditions and changes in our strategies for games within the reporting unit**"; that unit's remaining goodwill is **570.0**. `management-governance/99` puts the cumulative write-off at **6,665.1 = 84.7% of all goodwill ever recorded** | `FY26 10-K, Note 9, pp.83–84`; `FY26 10-K, Critical Accounting Policies — Goodwill`; `management-governance/99` §1 | **Bear** |
| **2** | **Funding of the ramp / runway** | — | **31.0 months** gross-obligations; **19.4 months** in-hand; covenant 3.75x at **1.07x / 1.73x**; verdict **Adequate** | None | Zero of the first 19.4 months needs free cash flow to appear; 100% fixed-rate, unsecured, one maintenance covenant, 997.9 undrawn revolver | **56.5% of principal matures inside 24 months**, covered 1.17x by cash and deposits; paying it from liquidity leaves ~244.2 against LTM FCF of 62.6; the covenant breaks near a **46%** EBITDA fall; **no finite runway if FY2027 guidance lands** on the gross-obligations basis | `balance-sheet-survival/99` §1 and §5(c)–(d) | **Mixed** |
| **2** | **"2024 Plan" cost programme** — delivery against promise | Costs 104.6 (FY2024) | **106.5 (FY2025); "largely completed as of March 31, 2025"** | **No savings target disclosed** | The programme was completed on the stated timetable | **225.7 of cost incurred across FY2023–FY2025 and not one disclosed dollar of saving.** Delivered benefit: **Not proven from available data** | `FY25 10-K, Note 21 (Business Reorganization), p.104` | **Unknown** |
| **3 Legacy / friction** | **"Legacy" full-game-and-other revenue**, FY | 1,159.0 (FY2025) | **1,459.8 (FY2026), +26.0%** | — | — (this row runs against the pivot) | The business the pivot was supposed to de-emphasise **grew faster than the pivot** in FY2026 (+26.0% vs RCS +16.1%), and console revenue grew **+23.7%** (2,099.1 → 2,597.3) | `FY26 10-K, MD&A p.44` | **Bear (for the pivot thesis)** |
| **3** | Full-game-and-other revenue, **six months to 30 Sep** | 745.6 (H1 FY2026) | **530.9 (H1 FY2027), −28.8%** | — | The fall is a release-slate gap, not displacement — GTA VI shipped after the period | Shows how much of the *rising RCS share* is arithmetic: the denominator collapsed | `TTWO 2Q27 Earnings Release, Net revenue by content table` | **Mixed** |
| **3** | **Mix direction, forward** | RCS 78% of FY2026 net bookings | **Guided to 65% of FY2027 net bookings** | — | — | The company's own guidance moves the centre of gravity **back** toward console full-game sales — the pivot's direction reverses in the very year the market is paying for | `Q2 FY27 investor deck, pp.5 and 8`; `business-model/03_segment-map.md` §2 | **Bear (for the pivot thesis)** |
| **3** | **Platform-owner dependence** (the friction DTC is meant to cut) | Five largest customers 81.0% of FY2025 revenue | **80.6% of FY2026 revenue, with Apple, Sony, Google and Microsoft each above 10%** | None | DTC exists and is growing (unquantified) | Apple and Google "generally have the discretion to set the amounts of their platform fees… at their sole discretion"; the **fee rate is nowhere in the pool**. Concentration has barely moved | `FY26 10-K, Item 1 — Sales`; `FY26 10-K, MD&A p.44` | **Bear** |
| **3** | **Console licence renewal** | — | All three console publisher licences (Sony and both Microsoft agreements), covering **39.0% of FY2026 revenue**, expire **2027-03-31** | — | Renewal is routine in practice | Inside the event's own horizon, and unresolved in the pool | `business-model/09_moat.md` §; carried by `02` §4 | **Bear (risk)** |
| **3** | **Regulatory friction on the pivot's revenue line** | — | Loot-box rulemaking in **six jurisdictions** against the **78.1% of FY2026 net revenue** that is in-game monetisation | — | No rule has yet changed a reported number | The exposure is the pivot's own revenue base, not the legacy one | `business-model/10_external-dependency.md` §1, via `02` §4 | **Bear (risk)** |
| **3** | **Competitive friction in free-to-play mobile** | — | 50.1% of FY2026 revenue sits on a platform the filing itself describes as having **"relatively low"** barriers to entry; Color Block Jam "down double digits versus its peak quarter" | — | — | Decay in the pivot's newest hit is already visible, and the moat module returns **"No moat proven"** with trajectory **"eroding (NOT confirmed)"** — carried with that exact qualifier | `FY26 10-K, Item 1A`; `Q2 FY27 earnings call, prepared remarks`; `business-model/09_moat.md` §5 | **Bear** |
| **3** | **Cannibalisation type** | — | GTA VI **Ultimate Edition add-on content is allocated to RCS** and "can be purchased separately" | — | This is self-cannibalisation that **preserves** customer lifetime value — launch spend captured inside the recurring line | It also means part of the guided RCS "inflection" is **launch-attached, not steady-state engagement** — the pivot metric is flattered by the release it is supposed to be independent of. The mobile decline, by contrast, is displacement: the player is lost | `earnings/02_revenue-drivers.md` §88; `Q2 FY27 earnings call, Q&A (Goldstein)` | **Mixed** |

### Pillar 1 — one cited finding, and the contradicting metrics named

**The pivot's own revenue metrics are deteriorating in the latest reported period, and the metric that looks best is an arithmetic artefact.** RCS net bookings fell **5.4%** in the six months to 2026-09-30 (2,471.5 against 2,611.8) and **8.8%** in the quarter (1,302.1 against 1,428.3), against the company's own guidance of a 5% decline [`TTWO 2Q27 Earnings Release, 2026-11-09, Net Bookings by content table`; `Q2 FY27 earnings call, prepared remarks (Goldstein)`]. **The number that disagrees, by name:** RCS rose to **82.5% of GAAP net revenue** in that same half-year from 77% a year earlier (2,500.0 of 3,030.9 against 2,532.0 of 3,277.6), and RCS GAAP revenue grew **16.1%** in FY2026 — both read as pivot strength. They do not overturn the finding for two reasons that are arithmetic, not judgement: (i) the *share* rose because the **denominator collapsed** — full-game-and-other revenue fell 28.8% (745.6 → 530.9) as the release slate emptied before GTA VI, so a rising share of a falling total is not growth; and (ii) GAAP RCS revenue is recognised **over the expected service period** while bookings are billed in the period, so bookings lead revenue — the −5.4% bookings figure is the newer information and the +16.1% FY2026 revenue figure is the older one. The honest statement is that the pivot's forward-looking metric is falling while its backward-looking metric is still rising.

### Pillar 2 — one cited finding, and the contradicting metric named

**On the capital the pivot consumed, the return is negative and has been for five consecutive years, and the audited accounts have already written off roughly 85% of the goodwill that created it.** ROIC ran −4.3%, −3.1%, −4.2%, −0.8% and −1.0% (LTM) against a cost of capital of about 8.2% [`ciq_facts.json → multi_year_trajectory`, tier-5 vendor export; `business-model/09_moat.md` §3], and accumulated goodwill impairment stands at **5,887.3 of 6,949.2 gross**, taken for "industry conditions and **changes in our strategies for games within the reporting unit**" [`FY26 10-K, Note 9, pp.83–84`]. The scale read is as stark: revenue **+97.3%** from FY2021 to FY2026 (3,373 → 6,656) delivered EBITDA **+4.1%** (757 → 788), an incremental EBITDA margin of **0.9%**. **The number that disagrees, by name:** group gross margin improved **290 basis points** in FY2026 (54.3% → 57.2%), and the sales-linked cost ratio fell 205bp — genuine, audited improvement [`FY26 10-K, MD&A p.43`; `business-model/04_unit-economics.md` §2]. It does not establish durable unit improvement, for three cited reasons: the same measure **fell 110bp** on the like-for-like interim (57.6% H1 FY2027 vs 58.7%); management attributes the lower FY2027 full-year gross-margin guidance to "the mix of the business" [`Q2 FY27 earnings call, Q&A (Goldstein)`]; and FY2027 stock-based compensation is guided **+51.3%** to 462, which sits below the gross-margin line and more than offsets it. **The pivot-level test cannot be run at all:** with one reportable segment whose profit measure *is* consolidated net income, **segment ROIC is Not assessable — not zero** [`FY26 10-K, Note 21, p.102`].

### Pillar 3 — one cited finding, and the contradicting metric named

**The pivot is not being disrupted by the legacy business; it is being reversed by it, on the company's own guidance.** Full-game-and-other revenue grew **26.0%** in FY2026 against RCS's 16.1%, console revenue grew **23.7%**, and FY2027 guidance moves RCS from **78% of net bookings to 65%** while assuming **mobile down** [`FY26 10-K, MD&A p.44`; `Q2 FY27 investor deck, pp.5 and 8`]. **The number that disagrees, by name:** RCS is guided **+12% year on year in Q3 FY2027** — an inflection in the pivot's own metric [`Q2 FY27 earnings call, prepared remarks (Goldstein)`]. It is adjudicated rather than dismissed: the company confirms that **GTA VI: Ultimate Edition add-on content is allocated to recurrent consumer spending** and is the stated reason RCS for the GTA series is guided up [`earnings/02_revenue-drivers.md` §88; `Q2 FY27 earnings call, Q&A (Dessouky / Goldstein)`]. So the inflection is **launch-attached**, not evidence that in-game spending has become independent of the release calendar — which is precisely the claim the pivot has to prove. It is self-cannibalisation that preserves customer lifetime value, and it is good for cash; it is not proof of recurring economics.

---

## 3. Net economic value & priced-in test

### 3A. The profit bridge — explicitly incomplete, with the known terms shown

The bridge this module is asked for is `Δ new-business operating profit + Δ legacy operating profit − Δ unallocated/transition cost = Δ group operating profit + residual`. **It cannot be completed from this evidence**, and the reason is a disclosure fact: Take-Two has **one** operating and reportable segment, its segment measure of profit **is** consolidated net income, its segment assets **are** consolidated total assets, and the three labels (Rockstar, 2K, Zynga) and the two internal goodwill reporting units are never given revenue or profit [`FY26 10-K, Note 21, p.102`; `FY26 10-K, Critical Accounting Policies — Goodwill`]. There is therefore **no disclosed new-business operating profit and no disclosed legacy operating profit**, and none is estimated here. The known terms:

| Term | FY2025 → FY2026 | H1 FY2026 → H1 FY2027 |
|---|---:|---:|
| Group GAAP operating profit | (4,391.1) → **(104.2)**, i.e. **+4,286.9** | (76.4) → **(153.0)**, i.e. **−76.6** |
| of which: goodwill impairment absent in the later year | **+3,545.2** | nil in both periods |
| of which: business-reorganisation expense absent in the later year | **+106.5** | nil in both periods |
| **Residual — the genuine operating movement** | **+635.2** | **−76.6** |
| New-business (mobile / RCS / DTC) operating profit | **Not disclosed** | **Not disclosed** |
| Legacy (console full-game) operating profit | **Not disclosed** | **Not disclosed** |
| Unallocated / transition cost | **No "Other" or "Corporate" bucket exists** — with one segment there is nothing to bucket | same |

Sources: `FY26 10-K, MD&A p.43`; `FY25 10-K, Note 21, p.104`; `Q2 FY27 10-Q, Condensed Consolidated Statements of Operations`. The LTM tie-out holds with no plug: **(104.2) − (76.4) + (153.0) = (180.8)**, which is the LTM GAAP operating loss `balance-sheet-survival/01` §5a reports independently. Organic, acquisition and reclassification effects are not separable below the group line in this disclosure; the FY2025→FY2026 improvement is mostly the **absence of a prior-year charge**, not new profit, and in the **latest** half-year — the one closest to the launch, with no impairment or reorganisation in either period — group operating profit got **worse by 76.6**. Cannibalisation is not subtracted anywhere, because legacy profit is not disclosed and so cannot be double-counted.

### 3B. Cash and capital burden against the runway

The pivot's ramp is funded, with one dependency named. Committed liquidity is **2,671.5** and the conservative gross-obligations runway is **31.0 months** (19.4 months on in-hand cash and deposits alone, before the revolver and before any cash generation); **56.5% of debt principal falls due inside 24 months**, covered 1.17x by cash plus liquid deposits; the single maintenance covenant (3.75x maximum Leverage Ratio) sits at **1.07x on full contractual netting / 1.73x on the conservative cash-only case** and breaks at about a **46%** EBITDA decline; the module's verdict is **Adequate**, explicitly "with the 24-month refinancing resting on one unreported product cycle" [`balance-sheet-survival/99` §1, §5(c)–(d)]. Two qualifiers travel: **82.2% of cash (945.0) sits offshore** with an unquantified repatriation tax, and the **peak intra-quarter working-capital need is not disclosed**, so every runway figure is the **upper** end of its case. Execution delay matters mechanically here: GTA VI already slipped roughly **13–14 months across two revisions** [`management-governance/99`, finding 01-001], and on the gross-obligations basis there is **no finite runway if FY2027 guidance lands** — i.e. the funding plan is a balance-sheet fact for about 19 months and a launch-conversion bet after that.

### 3C. Attainable multiple against `05`'s expectations and `07`'s levels

| Read | Figure | What it says about a pivot-earned rerating |
|---|---:|---|
| Price-implied requirement (`05` §2) | **+20.47% a year FCFF compounding, FY2028→FY2036**, off an already-peak launch base, ending at **4,996 — 11.5x** the company's best-ever annual §15 FCF; or a flat **45.78%** core operating margin | The multiple is not the thing being asked for: the **cash-flow level** is. There is no room above this price for a pivot premium that is not already demanded |
| Metric- and period-matched base rates (`05` §3, §5) | §15 FCF **−9.76% a year** since FY2022 (three negative years inside five); peak-to-peak EBITDA growth **+0.81% a year** (FY2021 757 → FY2026 788); consensus long-run revenue growth **3.13%**, at which **no horizon of any length reaches the price** | The pivot has not produced the compounding the price already assumes |
| **Consensus's own forward shape** | Implied consensus EBITDA, derived inside the frozen capability from vendor TEV 41,790.1 ÷ each printed multiple: FY2027 **1,692.8** → FY2028 **2,458.9** → FY2029 **2,622.4** → FY2030 **2,448.3** → FY2031 **2,587.6** → FY2032 **2,826.2** | **The Street itself models FY2030 EBITDA 6.6% BELOW FY2029's.** Consensus is pricing a release cycle, not a re-rated recurring business — the single most direct piece of evidence on this module's question [`Capital IQ Estimates → Multiples`, As-Of 2026-11-19] |
| Today's fixed-period multiple | **15.94x** EV ÷ FY2029E EBITDA (15.99x on canonical EV) | Already **+5.3%** above the quality-matched five-peer forward median of 15.14x |
| `07`'s base fair value, translated onto this basis | EV 38,251.3 ÷ 2,622.4 = **14.59x** | `07` judges the warranted multiple to be **below** today's — the opposite of a rerating in progress |
| Event threshold | **20.0x** → USD **271.69** per share (+25.4%) | Requires the market to pay ~37% more per dollar of the same FY2029 earnings than `07` judges warranted |
| Margin of safety at the price (`07` §4) | **−10.42%** (no cushion); downside to the headline bear **+68.75%** (inverted — higher is worse) | A rerating bet is being placed from a position with no cushion |

### 3D. Sector, mix and denominator effects — separated

- **Sector:** **Not assessable.** No sector-index or peer-aggregate multiple history exists in the pool, so whether these reference levels sit inside a sector-wide re-rating is unmeasured. Neither `RF-VAL-001` nor `RF-VAL-002` fired, and firing one here would fabricate a correction [`02` §5; `03` §6]. **A sector rally is not issuer-specific proof, and the absence of this check is carried, not cleared.**
- **Mix:** `06_sum-of-the-parts` returned **not applicable** — single segment [`FY26 10-K, Note 21`], so the group multiple **cannot** be decomposed into segment weights and segment re-ratings. The only mix read the disclosure supports is the revenue cuts: mobile 51.4% → 52.2% → 50.1% of revenue (FY2024→FY2026) and 49.3% in H1 FY2027; RCS 78.8% → 79.4% → 78.1% → 82.5%, guided to **65% of FY2027 net bookings**. Mix effects and segment re-rating are therefore **not separable** here, and this module claims no second valuation method.
- **Denominator:** this is where essentially all of the observed multiple movement lives. On the NTM basis TTWO's EV/EBITDA went **27.645x (2026-06-30) → 19.371x (2026-09-30) → 17.790x (2026-11-19)**, −35.7%, with no rerating event — purely the window rolling onto the launch year [`Capital IQ Financials_Quarterly → Multiples`, TEV/NTM EBITDA Close; `Capital IQ Estimates → Multiples`]. On the trailing basis it went the other way: **54.581x → 47.304x → 52.241x**. Two multiples on the same company on the same dates moving in opposite directions is the definition of a denominator effect.
- **The exact price identity is NOT applied, by rule.** `price_change = (1 + EPS_change) × (1 + PE_change) − 1` requires positive EPS. LTM diluted EPS is **−1.29** and every trailing period is a loss [`01` §2; `Capital IQ Comps → Financial Data`], so the identity would be meaningless and no interaction or residual is printed. The multiple series above is shown in its place, and it proves causation of nothing on its own.

---

## 4. What changed

**First assessment / no comparable prior assessment available.** `analyses/` contains exactly one TTWO run root (`TTWO_2026-11-19`), and no earlier `08_strategic-rerating` output exists for this issuer and listing. There is therefore no previous dated verdict, no previous probability and no previous event definition to compare against, and nothing in any historical analysis has been read as current evidence or altered.

For the next assessment, the following are recorded as this assessment's **original** figures, so that a later run can show evidence change separately from changed judgement: baseline multiple **15.94x** (EV ÷ consensus FY2029E EBITDA, vendor basis, 2026-11-19); baseline denominator **FY2029E EBITDA 2,622.4**; target **20.0x**; horizon **2028-03-31**; milestones **M1–M4** exactly as defined in §1; probability **12%**; valuation impact **Bearish Derating**. If a future run finds the threshold already met, it must report it as **already achieved** against this original target and may not quietly raise it.

---

## 5. Next checkpoints & disconfirmation

Each threshold states its comparable, the arithmetic for any part of the period not yet reported, and what it would have done on the last two reported periods. **Proposed monitoring is not a scheduled job** — nothing here launches recurring work, and a new filing, call or material news requires a new admitted assessment through the existing intake flow.

| Date | Checkpoint | Comparable (same period, prior year, same basis) | Bullish trigger | Bearish trigger | Capable of failing? What it would have done on the last two reported periods |
|---|---|---|---|---|---|
| **~2027-02-09** | **Q3 FY2027 print** — the first reported period containing any GTA VI revenue | Q3 FY2026 Net Bookings **1,757.1**; Q3 FY2026 RCS share not disclosed, so the RCS test is run at the half-year level in the next row | Net Bookings at or above the guided **3,350–3,500** (+90.6% to +99.2% YoY) **and** RCS **+12% YoY** as guided | Net Bookings below 3,350, or RCS below +12%, or a recoverability charge against the **2,577.3** capitalised balance | **Yes.** On the last two reported quarters the company **beat** its own range in Q1 FY2027 (1,385.9 vs 1,320–1,370) and **missed** it in Q2 FY2027 (1,601.3 vs 1,620–1,670) — the test discriminates |
| **~2027-05** | **FY2027 full year: the RCS-flat promise** | FY2026 RCS net bookings **≈5,242.4** (78% of 6,721.0) [`Q2 FY27 investor deck, p.8`] | FY2027 RCS net bookings at or above ~5,242 (flat, as guided) | Below ~5,242 | **Yes, and the remaining-period arithmetic is the whole point.** H1 FY2027 RCS bookings were **2,471.5**, so flat for the year needs **H2 of 5,242.4 − 2,471.5 = 2,770.9** against H2 FY2026's **2,630.6** — i.e. **+5.3% in H2 after −5.4% in H1**. On the last two reported half-years this test would have **failed** (H1 FY2027 −5.4%) and **passed** (H1 FY2026, when RCS was still growing) |
| **~2027-05** | **M4 precursor — FY2027 cash** | FY2026 §15 FCF **434.1** (the best year on record on this definition), against guided FY2027 operating cash flow of "over 1,000" and guided capex of about 290 | FY2027 §15 FCF of at least **710** (guided CFO over 1,000 less the ~290 guided capex) | FY2027 §15 FCF below 434.1 — i.e. the biggest launch in the company's history fails to beat the pre-launch year | **Yes.** On the last two reported full years this test would have **failed** on FY2025 ((234.9)) and **passed** on FY2026 (434.1) |
| **2027-03-31** | **Console licence expiry** — Sony and both Microsoft agreements, covering **39.0% of FY2026 revenue** | n/a (a contractual date, not a period) | Renewal disclosed on comparable terms | Non-renewal, or renewal on disclosed worse economics | **Yes** — binary and dated, inside the event horizon |
| **Monthly to 2028-03-31** | **The event's own multiple** | Baseline **15.94x** (2026-11-19), same vendor basis both sides | ≥ **20.0x** on three consecutive month-ends with FY2029E EBITDA ≥ 2,622.4 | ≤ **13.0x** on three consecutive month-ends with FY2029E EBITDA ≥ 2,622.4 (a derating on unchanged earnings) | **Yes.** Today's reading is 15.94x, so the bullish trigger **fails now**. On the comparable-but-different NTM basis the same 20x line would have been **cleared** at 2026-03-31 (23.382x) and 2026-06-30 (27.645x) and **failed** at 2026-09-30 (19.371x) — which is exactly why the fixed-period basis is used. **Limitation stated: a historical series for the fixed-FY2029 multiple does not exist in this pool** (the estimates grid is a single 2026-11-19 snapshot), so the threshold cannot be backtested on its own basis and the NTM series is shown as the nearest available proxy |
| **~2027-08 and ~2028-05** | **M2 — mobile** | FY2027 mobile net revenue (to be reported); FY2026 was **3,333.0**, H1 FY2027 **1,493.4**, Q2 FY2027 **−11.0% YoY**, FY2027 guided **down** | FY2028 mobile net revenue above FY2027's | FY2028 mobile below FY2027's | **Yes.** On the last two reported periods this test would have **passed** on FY2026 (+13.3%) and **failed** on Q2 FY2027 (−11.0%) |
| **Any filing** | **DTC disclosure** — the single highest-value missing item for this module | None exists | The company discloses DTC revenue or its share of mobile, enabling a real Pillar-2 test | Continued refusal to quantify | **Yes**, and it is currently failing: management has stated it will not disclose the percentage or its goals |

**The single killer risk.** Not the launch — the **comparable after it**. The pivot's claim is that in-game spending has made revenue recurring and independent of the release calendar. The evidence runs the other way: RCS bookings fell 5.4% in the latest half-year, the guided RCS inflection is **launch-attached add-on content** by the company's own confirmation, **consensus's own FY2030 EBITDA sits 6.6% below FY2029's**, `04` models free cash flow declining after FY2029, and **2,577.3 of capitalised content** faces a recoverability test that charges at the **greater of** revenue-proportional or straight-line. If GTA VI is a success and FY2029 earnings are then followed by an FY2030 decline, the market will have paid for a cycle and the multiple on normalised earnings will compress rather than expand — the pivot's failure and the stock's good year can happen in the same eighteen months.

**Data that would change the view.** In order of value: (1) **a disclosed DTC revenue line or share of mobile**, which is the only way the pivot's central margin claim becomes testable at all; (2) **the mobile-versus-console gross-margin gap in basis points**; (3) **any segment or reporting-unit profit and capital disclosure** — naming the two goodwill reporting units and giving their revenue, profit and assets would make segment ROIC assessable and could overturn Pillar 2 in either direction; (4) **paying players, ARPU and cohort retention**, absent entirely today; (5) **two consecutive post-launch years of RCS bookings growth with no launch-attached add-on content inside the comparable**; (6) a **numeric_reading_check** on this generation, which would move every vendor cell above from unchecked to checked.

---

## 6. Assessment

**Execution direction — deteriorating on the pivot's own disclosed metrics, with the launch outcome unmeasured.** The pivot's forward metric (RCS net bookings) fell **5.4%** in the latest reported half-year against guidance of −5%; its largest platform (mobile) fell **11.0%** in the latest quarter and is guided down for the year; its advertising line, up 6.1% in FY2026, remains **24.7% below FY2024**; management's own estimates of how long a player and a title last both **shortened** in the latest filing; and the company's own FY2027 guidance moves the recurring share of bookings **down**, from 78% to 65%. Against that, FY2026 was a genuinely better year — RCS revenue +16.1%, gross margin +290bp, the best §15 free cash flow on record (434.1), and ROIC improving from −4.2% to −0.8% — which is **one** year of improvement where `management-governance/99`'s §24 Filter 2 test requires two to three, and which it records as exactly that: one year of delivered inflection, **RF-MGT-004 tested and not fired**. A slick plan and a long-tenured team are not evidence of inflection; the disclosed delivery record is six-for-six on annual top-line targets, one-of-four on GAAP EPS, and a first miss of its own quarterly range last quarter.

**Valuation Impact: Bearish Derating**, with four qualifications that must travel with it. (i) It is a read on what the **pivot** contributes to the warranted multiple, **not a fair-value level** — `07` owns the levels (base **USD 196.17**, bull 397.52, headline `bear_cyclical` 67.68, labelled 24–36 month `bear_structural` floor 52.53) and this module changes none of them and adds no independent method. (ii) It rests on the pivot's evidence, **not** on the launch outcome, which is genuinely unmeasured: **no reported period contains a single dollar of GTA VI revenue** [`earnings/07` §4], so this is a test of an expectation against history and not a measurement of failure. (iii) The direction is reinforced, not created, by the priced-in read: at this price `05` requires **20.47% a year** FCFF compounding for nine years off a peak base against a metric-matched realised **−9.76% a year**, and `07` reports a **negative margin of safety (−10.42%)** — so there is no headroom in the price for a pivot premium that is not already demanded. (iv) The most direct single piece of evidence is consensus's own shape: the Street's implied **FY2030 EBITDA (2,448.3) sits 6.6% below its FY2029 (2,622.4)** — the market is paying for a release cycle, which by construction cannot be a rerating.

**Data sufficiency: 48 / 100 (weak — caps the opinion).** What exists is strong: two 10-Ks, two 10-Qs, two full transcripts, two earnings releases and decks, and a complete Capital IQ estimates export, all inside one frozen generation. What is missing is precisely the pivot's own economics: **DTC size, share and growth (withheld by name); the mobile-versus-console margin gap; any segment profit, segment assets or reporting-unit identity; players, ARPU and cohort retention; the Apple/Google platform-fee rate; peer ROIC; peer and sector multiple history**. Add the pool-level gaps carried from triage — an **empty DEF 14A** stub, **no TTWO material-event (8-K) feed at all** (the Key Developments export in the pool resolves to Alphabet Inc.), and **no `numeric_reading_check`**, so every workbook cell is mechanically unchecked and must never be described as verified clean.

**Confidence: 40 / 100 (low)**, and stated separately from sufficiency because they measure different things. Sufficiency is about what evidence exists; confidence is about how firmly this conclusion follows from it. It is low for three reasons: the pivot's financial-quality pillar is **Not assessable at the pivot level** and is being judged at group level by necessity; the deciding variable (GTA VI sell-through and, more importantly, the year *after* it) is unobserved; and the reference multiples carry an unverified-anchor gap because the Sector Cycle Reality Test is "Not assessable" in both `02` and `03`.

**Probability basis, uncertainty, prior and updates.** The basis is **judgment**, informed by small samples and labelled as such — not a measured frequency. The matching samples available are **five** annual ROIC observations, **five** annual §15 FCF observations, **four** quarterly surprise observations, **six** annual guidance observations, and **two** reported periods of the pivot metric at its current reading. All are below the roughly-eight-observation line, and none is a frequency of the conjunction this event defines, which has **never** been observed for this issuer on this basis. The prior was set by the base rates: a company whose return on capital has been negative five years running, whose profit between cycle peaks grew 0.81% a year, and whose own forward consensus declines after FY2029 should rarely earn a 25% multiple expansion on unchanged post-launch earnings. Three updates moved it: **down** for the H1 FY2027 RCS bookings decline and the Q2 guidance miss; **down** for the consensus FY2030 shape and the FY2028 estimate cuts (revenue −2.6%, EBITDA −2.0% last month [`earnings/04` §7]); **up, modestly**, for FY2026's genuine gross-margin and free-cash-flow improvement and for the fact that the launch is unmeasured and pre-orders were described as "tracking far in excess of our initial expectations" — an input the engine cannot verify and which is not quantified anywhere in the pool.

**The complement, spelled out so it is not misread.** The **88%** is the probability that this specific conjunction is **not** met by 2028-03-31. It includes four distinct paths, none of which is automatically a derating: (a) the multiple expands but one or more of M1–M4 misses; (b) all four milestones are met but the multiple does not expand because the outcome was already priced — the explicitly "well-executed but priced-in" case; (c) FY2029 consensus EBITDA is **cut**, so the anti-shrinking-denominator condition fails even if the printed multiple rises; and (d) **the large-upside path**: a blowout launch lifts FY2029 estimates faster than the price, the stock rises substantially, and the multiple therefore **falls**. Path (d) matters for the handoff — **this event can fail while the share price rises a long way**, because it tests multiple expansion on a held denominator, not total return. Partial success and delay are failures of this event and nothing more.

**Limits the module and master must retain.** The event definition, horizon, baseline multiple (15.94x), baseline denominator (FY2029E EBITDA 2,622.4), target (20.0x) and the four original milestones travel together or not at all. `07`'s **valuation confidence cap of 55** (cross-method field 5.2x) stands and this score lifts it; so do the governance **RF-MGT-005** conviction cap ("no rating above Watchlist") and the "Misaligned or weak stewardship" verdict with **no hard disqualifier and RF-OWN-004 not fired**; so does `balance-sheet-survival`'s **Adequate** verdict with its "24-month refinancing resting on one unreported product cycle" qualifier; so does the **"No moat proven"** finding with trajectory **"eroding (NOT confirmed)"**, which may not be hardened into confirmed erosion. The **UNCHECKED, not clean** source-check status attaches to every vendor figure used above. This is an assessment on the supplied frozen evidence, not a monitor: the next filing requires a new admitted assessment. No scenario probability, no probability-weighted target, no risk/reward, no rating and no position size is produced here — those belong to the master synthesizer (CLAUDE.md §10, §22; MODULE_RULES Scope).

`Rerating Probability Score: 12% | Event: NasdaqGS:TTWO (USD) EV ÷ consensus FY2029E EBITDA rises from the 2026-11-19 baseline of 15.94x (vendor TEV 41,790.1 ÷ FY2029E EBITDA 2,622.4) to ≥ 20.0x held on three consecutive month-ends, with consensus FY2029E EBITDA at or above 2,622.4 at the outcome, AND all four FY2028 operating milestones met — M1 RCS net bookings above FY2027's, M2 mobile net revenue above FY2027's, M3 GAAP operating profit and ROIC both positive, M4 §15 FCF (CFO − total capex) at least equal to FY2027's and ≥ 700 | Horizon: 2026-11-19 → 2028-03-31 (16 months, observed monthly) | Basis: judgment — informed by 5 annual ROIC, 5 annual §15 FCF, 4 quarterly surprise, 6 annual guidance and 2 pivot-metric observations, all below the ~8-observation line and none a frequency of this conjunction; not a measured frequency`
