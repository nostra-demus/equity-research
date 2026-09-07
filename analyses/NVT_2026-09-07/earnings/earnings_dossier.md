# earnings Module Dossier — NVT

> Deterministic, lossless concatenation of every artifact in this module — the module synthesis and every specialist output, in order. Generated mechanically (no LLM rewriting), so nothing is omitted or paraphrased. This is the module's "see everything" tier; the module's decision lives in `99_*-synthesis.md` and the short read in `earnings_memo.md`.

- Generated: 2026-09-07T04:02:31Z
- Module folder: `earnings`
- Contents: 1 module synthesis + 9 specialist outputs = 10 files

## Table of Contents

- [earnings — module synthesis](#earnings-module-synthesis) — `99_earnings-synthesis.md`
- [earnings / 00_earnings-data-triage.md](#earnings-00-earnings-data-triage-md) — `00_earnings-data-triage.md`
- [earnings / 01_historical-financials.md](#earnings-01-historical-financials-md) — `01_historical-financials.md`
- [earnings / 02_revenue-drivers.md](#earnings-02-revenue-drivers-md) — `02_revenue-drivers.md`
- [earnings / 03_margin-drivers.md](#earnings-03-margin-drivers-md) — `03_margin-drivers.md`
- [earnings / 04_guidance-consensus.md](#earnings-04-guidance-consensus-md) — `04_guidance-consensus.md`
- [earnings / 05_beat-miss-setup.md](#earnings-05-beat-miss-setup-md) — `05_beat-miss-setup.md`
- [earnings / 06_earnings-quality.md](#earnings-06-earnings-quality-md) — `06_earnings-quality.md`
- [earnings / 07_earnings-sensitivity.md](#earnings-07-earnings-sensitivity-md) — `07_earnings-sensitivity.md`
- [earnings / 08_earnings-red-flags.md](#earnings-08-earnings-red-flags-md) — `08_earnings-red-flags.md`


---

## earnings — module synthesis

_Source: `99_earnings-synthesis.md`_

# Earnings Module — NVT (Synthesis)

**Company:** nVent Electric plc (NYSE: NVT). **Regime:** US SEC domestic filer (Irish-incorporated, London head office) — Form 10-K / 10-Q. **Standard:** US GAAP. **Currency:** USD, in millions except per-share. **Fiscal year ends 31 December.** [`00_earnings-data-triage.md`, §0]

**Evidence binding: frozen.** Every upstream read resolved through generation `6db32848…1aecd1e6`. Live `data/NVT/` was not read; `data/NVT/…` is a citation label only. This agent consumed the nine sibling specialist outputs and did not re-do specialist-level work on the raw pool.

**Standing basis caveat carried into every FY2025 figure below.** There is **no FY2025 Form 10-K in this pool.** The latest audited annual filing is the FY2024 10-K (20.2 months old). FY2025 full-year income-statement, cash-flow and segment figures are **tier-5 Capital IQ vendor data, as of ~12-Aug-2026**, and are never cited under a filing's name (CLAUDE.md §5). The 31-Dec-2025 balance sheet and debt note ARE filing-grade, as the comparative column in the two 10-Qs.

**All 15 pool sources are in English.** No language-based gap exists and none is recorded (CLAUDE.md §27).

---

## Abstract

nVent's delivered earnings are accelerating hard — revenue up 52.8% and adjusted EPS up 68.6% in the June quarter — but the only forward-looking demand series has turned. One vertical, infrastructure, produced 93.1% of every extra dollar of that growth, and organic orders fell from about 40% to low double digits while backlog slipped from $2.6bn to $2.5bn. Consensus sits just above the guided high end for the September quarter and 5.3% above the guidance-implied December quarter. The biggest risk is that the whole margin gain is overhead absorption: run-rate gross margin fell 243 basis points once a one-off $25.8m tariff refund is removed. Mixed earnings setup — accelerating sales, a turning order book.

---

## 1. Earnings Verdict

- **Verdict: Mixed earnings setup** — conflicting signals across revenue (delivered sales accelerating, forward orders decelerating), margins (adjusted operating margin at an eight-quarter high, run-rate gross margin down 243bps) and horizon (a beatable next quarter inside a decelerating 3–12 month picture).
- **Earnings quality /100: 68** *(higher = better)* — carried down from `06`'s **74** by explicit judgment, not by cap. Two verified facts `06` did not have in front of it: the measure that excludes the acquisition amortisation is also the measure used to set incentive-compensation targets [`Q2 FY26 10-Q, Note 13, p.19–20`, via `08` §2.7], and the FY2023 Luxembourg deferred-tax benefit was reversed within twelve months [`FY24 10-K, Item 7 MD&A — Provision (benefit) for income taxes`, via `08` §2.7]. The cash behind the earnings is real and that is why the score stays in the 61–80 band.
- **Consensus setup /100 (higher = more beatable): 48** — `04`'s "Bar is fair" verdict, weighted across the module's own 3–12 month scope rather than the next print alone. The Q3 bar is mildly beatable (+0.72% above the guided adjusted-EPS high end); the Q4 bar is not (+5.32% revenue and **+6.4% adjusted EPS** above the guidance-implied path, on the corrected matched basis — see §3), revision breadth is 100% one-sided with no bear cohort left, and a ~$700m-revenue acquisition sits in no estimate in this pool.
- **Earnings volatility /100 (INVERTED — higher = WORSE): 72** — raised from `07`'s **68** on `08`'s own review point, which this synthesis upholds: `07` states its bear case is a **bound**, not a central estimate, because the pool contains no organic-revenue decline since the divestiture against which a down-volume decremental could be measured. A published downside that is explicitly a floor on the damage understates volatility.
- **Next-quarter setup: Favors beat — for the standalone Q3 FY2026 print only** (three months ended 30-Sep-2026, expected release 30-Oct-2026). This label does not extend to Q4 or to the module's own 3–12 month window; see §3, adjudication (i).
- **Biggest earnings driver (one line):** data-centre capital spending read through the **infrastructure vertical** — that vertical (data centres **and** power utilities) added $473.2m in Q2 FY26, which is 49.1pp of the 52.8pp of observed growth, i.e. **93.1% of every incremental dollar**, on a **total** (organic + acquired + FX) basis computed on the prior-year quarter base of $963.1m [`Q2 FY26 10-Q, Note 2, p.9`, arithmetic at `02` §6a].
- **Biggest earnings risk (one line):** the same driver's leading indicator has already turned — organic orders ~40% → "low double digits", backlog $2.6bn → $2.5bn after growing sequentially in Q1, implied Q2 book-to-bill ~0.93x (honest range 0.86–1.00x) from ~1.2x — while 109% of the Q2 operating-margin gain is fixed-overhead absorption on that same volume, against a fixed base being deliberately enlarged by three committed Minnesota plants.
- **Red-flag agent's Severity Verdict, reported verbatim and not softened: "Critical concerns"** [`08_earnings-red-flags.md`, §5] — 1 Critical, 22 High, 29 Medium, 9 Low (58 triggered + 3 unclear). `08` states this is the *"should be downgraded"* arm of that definition, not the *"unreliable"* arm: the pool is sufficient, the bridges reconcile, and the cash is real; what is wrong is the verdict category the module was heading toward. This synthesis adopts `08`'s recommended category rather than overriding it, so no conflict arises under §3.

---

## 1A. Module Disconfirmation *(CLAUDE.md §8)*

- **Strongest bear point.** The only forward-looking demand series in the entire pool has reversed direction. Backlog **grew** "low-double digits sequentially to $2.6 billion" in Q1 FY26 and **fell** to $2.5bn in Q2, while organic orders decelerated from ~40% to "low double digits" against 46.9% organic sales — in the same quarter management said it "worked hard in Q2 to really execute on that backlog" [`Q1 FY26 transcript, prepared remarks`; `Q2 FY26 transcript, prepared remarks and Q&A`]. The direction change is not a rounding artefact even where the single-quarter magnitude sits inside the transcripts' own $0.1bn rounding.
- **Strongest bull point (the steelman).** Backlog of $2.5bn is roughly **47% of guided FY2026 revenue**, so the next two quarters are largely pre-sold; the Q3 consensus bar of $1,427.27m is **3.0% BELOW** the $1,471.3m just delivered and the $1.3899 adjusted-EPS bar is 4.1% below Q2's $1.45; and the company cleared its own guidance high end by **+17.2%** and **+26.1%** in the last two quarters [`04` §6; `05` §1]. Revenue does not have to grow sequentially to beat — it only has to avoid falling 3%.
- **Single killer risk.** Operating deleverage. The +416.7bps Q2 operating-margin gain decomposes with no residual into gross −67.9bps, SG&A +452.8bps, R&D +31.8bps — **SG&A alone is 109% of the move**, and ex-intangible-amortisation it still falls 359bps [`Q2 FY26 10-Q, MD&A p.26 and p.28`]. That is fixed overhead spread across organic sales up 46.9%. It reverses on the way down, and the **decremental rate is not measurable from this pool**, so the published downside is a floor, not a central estimate.
- **Disconfirming evidence already visible.** Three items, all inside the module's own tables: run-rate gross margin fell **243bps** ex the $25.8m IEEPA refund, not the reported 70bps; the Q4 consensus sits +5.32% (revenue) and +6.4% (adjusted EPS) above the guidance-implied path with no acquisition or currency help behind it; and `02` §4a and `03` §10 independently place the latest quarter **at or very near a cyclical peak**, not on a normalised run-rate.

---

## 2. Specialist Roll-Up

Claim-fidelity note (CLAUDE.md §3): every cell below was checked against the four failure shapes — qualifier dropped, basis dropped, build dropped, verdict hardened. Where the short form could not hold the qualifier, the longer form is quoted.

| Specialist | Verdict Line | Biggest Finding |
|---|---|---|
| **earnings-data-triage** (`00`) | **Sufficient.** 15 sources, 20 workbook tabs, 33 extracts, **0 extraction failures**; no MODULE_RULES score cap binds on this pool | **No FY2025 Form 10-K.** The latest audited annual filing is FY2024 (20.2 months old); FY2025 full-year income-statement, cash-flow and segment figures are **tier-5 Capital IQ vendor data as of ~12-Aug-2026** and must never be cited under a filing's name. The 31-Dec-2025 balance sheet IS filing-grade |
| **historical-financials** (`01`) | Revenue growth **accelerating and sharply**; margins **volatile at the gross line, inflecting up at the EBITDA line**; two basis breaks govern every table | TTM revenue to 30-Jun-2026 **$4,834.0m, +46.2%** on the prior TTM of $3,306.6m — **"This is not all organic"**: the company's own reconciliation splits Q1 FY26's 53.5% into 34.4pp organic, 2.1pp currency and 17.0pp acquisitions. Q2 FY26 gross margin **−70bps YoY, as filed**, flagged in the same report as carrying "roughly $25m of tariff reimbursements … that the margin-drivers agent must size before treating the Q2 gross margin as run-rate" |
| **revenue-drivers** (`02`) | Single biggest driver is **data-centre capital spending read through the infrastructure vertical**; its **direction is genuinely two-handed** — accelerating on delivered sales, deteriorating on the order book | Infrastructure added $473.2m = **49.1pp of the 52.8pp of growth = 93.1% of every incremental dollar**, on a **total (not organic-only)** basis, on the prior-year-quarter base of $963.1m. Bridge reconciles: organic 46.9 + acquisitions 5.4 + FX 0.5 = 52.8pp, residual **$0.1m = 0.01pp**. `RF-EARN-001: revenue decomposition reconciled — explained 52.8pp, residual 0.0pp, total 52.8pp` |
| **margin-drivers** (`03`) | Single biggest margin driver is **volume-driven operating leverage on SG&A**; latest period sits **at or very near a cyclical PEAK** and is not a normalised run-rate | Q2 gross margin **ex the $25.8m IEEPA one-off fell 243bps**, not the reported 68bps — and adjusted EBITDA margin still rose, so "the divergence is wider, not narrower, than the headline numbers suggest." Bridge: **explained +141.7bps against a −209.6bps residual** — roughly three times as much of the gross-margin move is unattributed as attributed, which is why `03` names its biggest driver off the **operating**-margin bridge (which ties to the cent), not off the gross bridge. `RF-EARN-002: margin bridge reconciled — explained 141.7bps, residual -209.6bps, total -67.9bps` |
| **guidance-consensus** (`04`) | **Bar is fair.** Not low (consensus sits above the guided high end on five lines; zero downward revisions in three months); not high (the gaps are a fraction of the last two beats) | The stretch is not evenly spread: **~1.4% sits in Q3 and 5.3% in Q4.** Guidance-implied Q4 revenue $1,252.09m against Street $1,318.67m = **+5.32%**. Two guidance raises in five months lifted the FY26 adjusted-EPS midpoint +25.5% (4.075 → 5.05); the revision jump (4.61 → 5.11, +10.8% in the final month) is **catch-up to the 31-Jul raise, not independent upgrades** |
| **beat-miss-setup** (`05`) | **"Setup favors beat" — for the standalone Q3 FY2026 print.** `05`'s own text: "The miss risk is real but sits in Q4 and in the FY guidance, not in the Q3 number" | The Q3 bar **embeds a sequential decline**: revenue $1,427.27m is 3.0% below Q2's $1,471.3m and adjusted EPS $1.3899 is 4.1% below Q2's $1.45. Beat base rate carries its own basis label: the directly relevant record (actual vs the company's own guidance high end, +17.2% and +26.1%) is **two observations inside one demand upswing — judgment, not a measured frequency** |
| **earnings-quality** (`06`) | **74 / 100** — "mostly clean but some working capital or adjustment noise." Cash-flow data present, so the no-cash-flow max-45 cap does **not** bind | CFO/EBITDA **69.1% → 73.3% → 74.4% → 78.7% → 73.0%** on a matched continuing-operations basis; cash conversion cycle 15.5 days shorter than FY2023. The wedge, not the cash, is the concern: adjusted EPS ran **28.8% above** GAAP continuing EPS in FY2025 and **87% of the $169.0m add-back is acquisition intangible amortisation** ($147.1m FY2025, $165.2m LTM, rising every year). **Neither `RF-EQ-001` nor `RF-EQ-002` was emitted** — see §8 |
| **earnings-sensitivity** (`07`) | **68 / 100 — INVERTED (higher = WORSE)**; "high volatility — multiple variables with large impact." Volatility-confidence cap does not formally bind (company-disclosed per-unit rates exist) | A ±20% move in the >$2.0bn of guided data-centre sales is ±$400m of revenue → at the company's own mid-20s incremental rate, ±$100m of adjusted operating income → **±$0.473 of adjusted EPS = ±9.4% of the $5.05 guided base** — larger than variables 3 to 7 combined ($0.239). Cost mitigation is **measured, not assumed**: realised offset 40% (Q1) → 79% (Q2), **58% for H1 FY26**; the zero-mitigation figure is shown beside it and labelled a **bound** |
| **earnings-red-flags** (`08`) | **Severity verdict: "Critical concerns"** — 1 Critical, 22 High, 29 Medium, 9 Low. Stated by `08` as the "should be downgraded" arm, not the "unreliable" arm | **The verdict category should be "Mixed earnings setup", not "Earnings accelerating"**, and `05`'s beat read "is correct and must be re-labelled when it travels" — it is a standalone-Q3 conclusion inside a 3–12 month module. Plus three corrections to siblings, verified against the frozen corpus: the Maverick EBITDA multiple, the mixed-basis Q4 EPS stretch, and the missing FY2024 Luxembourg valuation-allowance reversal (all adjudicated in §3) |

**Claim-fidelity pass — four failure shapes, checked explicitly:**
- **Qualifier dropped.** One real instance, and this synthesis corrects it rather than repeating it: the framing "93.1% of every incremental Q2 dollar came from **AI data-centre demand**" drops two qualifiers `02` §6a states explicitly. The 93.1% is the **infrastructure vertical**, which contains **power utilities as well as data centres**, and the vertical contributions are **total** (organic + acquired + FX), so they may not be compared with the organic-only 46.9pp line. The data-centre-only figure (">$2 billion in 2026") is a **transcript number with no filed equivalent**. Both qualifiers travel with the claim everywhere in this report (`08` red flags 27 and 52).
- **Basis dropped.** Three checked. Net debt carries its **strict / broad** label inline every time (§6). The three EBITDA figures for Q2 FY26 (GAAP-derived $359.2m, company adjusted $340.1m, vendor adjusted $338.1m) are never mixed and every gap is itemised upstream. The Q4 EPS gap was mixed-basis in `05` and is corrected in §3.
- **Build dropped.** The two bridges travel with their residuals, not just their named drivers: revenue 52.8pp explained with a 0.01pp residual; margin **+141.7bps explained against a −209.6bps residual**, which is the finding, not a caveat.
- **Verdict hardened.** Two guarded against. `05`'s "Setup favors beat" is carried only with its horizon attached. `06`'s 74/100 is carried as re-examined and marked down, not as "the wedge was tested and cleared."

---

## 3. Reconciliation

Five live disagreements, adjudicated by name. None is averaged away.

**(i) `05` "Setup favors beat" versus `02`/`07`/`08` on the turning order book — reconciled by HORIZON, and both sides survive on their own.**
`05` §8 reads the next standalone Q3 print as favouring a beat. `08` §1 argues that is a correct standalone-Q3 read that does not carry to the module verdict, which it puts at "Mixed earnings setup" because the only forward-looking demand series has turned. **Ruling: `08` is right, and `05` is not wrong.** Three facts decide it. First, Q3 is largely already sold — $2.5bn of backlog is roughly 47% of guided FY2026 revenue, and the Q3 bar is 3.0% *below* the quarter just delivered; orders lead sales by more than one quarter in a project business converting out of a book that size, so a Q2 book-to-bill of ~0.93x is not a Q3 revenue statement. Second, the order turn is a **Q4-and-beyond** statement, and the *direction* reversed (backlog grew low-double-digits sequentially in Q1, fell in Q2), which is not a rounding artefact even though a $0.1bn move sits inside the transcripts' own rounding. Third, **the module's scope is 3–12 months, not one quarter** [MODULE_RULES, Scope] — and across that window the acquisition contribution goes to zero from Q3, currency turns to an implied −$15.9m H2 drag, the Q4 bar sits +5.32% above the guide-implied path, run-rate gross margin is down 243bps, and two agents independently place the quarter at or near a cyclical peak. **Resolution: module verdict = Mixed earnings setup; next-quarter setup = Favors beat, standalone Q3 FY2026 only.** The horizon label is part of the claim.

**(ii) `01` gross margin −70bps versus `03` −243bps — `03` is the like-for-like read; `01`'s figure is the correct as-filed number and keeps its label.**
Q2 FY26 reported gross margin fell **67.9bps** (the 10-Q states "(0.7) pts"), which is what `01` §3 reports. That figure **includes a $25.8m IEEPA tariff reimbursement worth +175.4bps** that the company itself excludes from segment income and from adjusted operating income [`Q2 FY26 10-Q, Note 13, p.21`]. Q2 FY25 contained no comparable credit, so comparing a period that includes a one-off refund against a period that does not is **not like-for-like**. **Ruling: the like-for-like, run-rate change is −243bps and the run-rate gross margin is 36.17%, not 37.93%.** `01`'s −70bps stays in circulation as the as-filed number and must never travel without the label "reported, flattered by a one-off the company itself excludes from its own adjusted profit." Any terminal margin, bear case or leverage denominator built downstream uses **36.17%**. Note that `01` itself flagged this and instructed the margin agent to size it — this is a division of labour that worked, not a specialist error.

**(iii) `08`'s correction (a) — Maverick Power's EBITDA IS partially derivable; `07`'s "not quantifiable" was right on EPS and wrong on margin.**
`07` §2 row 5 records the Maverick EPS impact as "not quantifiable" and gives as one reason that "Maverick's own margin is not disclosed." `08` verified against the frozen corpus that the release states the effective enterprise-value multiple is "approximately **11.5 times anticipated 2026 adjusted EBITDA**" on the $1.75bn purchase price [`nVent press release, "nVent to Acquire Maverick Power", 24-Aug-2026`]. **Ruling: `08` is correct on the margin and `07` is correct on the EPS.** Checking `08`'s arithmetic: $1,750m ÷ 11.5 = **~$152m of anticipated 2026 adjusted EBITDA**; on the release's own ~$700m of estimated 2026 revenue that is an implied margin of **~21.7%** — close to nVent's own 21–23%. Three qualifiers travel with that figure and are not dropped: it is *derived from the release's own disclosed multiple, inference, not a company-stated margin*; "anticipated 2026 adjusted EBITDA" is **company language about an uncompleted deal**, not an audited number; and it is measured on the *acquired company's* full-year 2026, not on nVent's ownership period. **The EPS effect remains genuinely not quantifiable** — the cash-versus-new-debt funding split and the deal's own intangible amortisation are both undisclosed, so the interest drag and the amortisation charge cannot be sized. This is a §20 bad-extraction gap in `07`, of limited consequence: a partial sizing was available and unused, but the conclusion `07` drew from it was correct.

**(iv) `08`'s correction (b) — the Q4 adjusted-EPS stretch is +6.4%, not +3.3%; `05` applied two vendor panels inconsistently across two metrics.**
`05` §4 derived Q4 adjusted EPS of $1.183 by subtracting from the **FY consensus line** ($5.11301 − $2.54 H1 actual − $1.3899 Q3 bar), giving +3.3% above the guide-implied $1.145 — while taking Q4 **revenue** from the vendor's own **FQ4 quarterly line** ($1,318.67m). `08` read the vendor's own **FQ4 2026 EPS Normalized figure of $1.21859** directly from the frozen extract, noting the same row's actuals tie exactly to $1.09 (Q1'26) and $1.45 (Q2'26). **Ruling: `08` is correct.** On a consistent vendor-quarterly basis the stretch is $1.21859 vs $1.145 = **+6.4%** — roughly double `05`'s figure, and consistent with the +5.32% revenue gap it should resemble, whereas +3.3% was not. This is a CLAUDE.md §15 matched-basis defect: `05` §4 *correctly flagged* the FY-panel-versus-quarterly-panel gap ($5,435.31m FY versus $5,459.24m summed, a $23.9m / 0.44% difference from different analyst sets) and then applied the two bases inconsistently across the two metrics. **The +6.4% figure is what travels; +3.3% is superseded.** Nothing else in `05` depends on it — the verdict rests on the Q3 sequential-decline bar, not on the Q4 EPS gap.

**(v) `08`'s correction (c) — `06` records the FY2023 Luxembourg deferred-tax benefit but not its reversal; upheld, with one boundary stated.**
`06` §5 names an FY2023 tax *credit* of $84.4m on $375.3m of pre-tax income, "driven by a **$174.0m deferred foreign tax benefit**", classifies it "Genuine but very large", and separately notes FY2024 then ran at a 43.9% effective rate. It does **not** record the mechanism. `08` verified directly against `FY24 10-K, Item 7 MD&A — Provision (benefit) for income taxes` that FY2023 carried "$93.2 million of non-cash benefit… for the recognition of deferred tax assets related to tax-deductible statutory losses in Luxembourg", and that FY2024 recorded "**$92.8 million of non-cash expense**… related to the establishment of valuation allowances on deferred tax assets… **initially established in 2023**." **Ruling: `08` is correct and the finding is upheld.** 99.6% of a "more likely than not" recognition judgment was written off within twelve months, which is a materially stronger accounting-quality signal than "genuine but very large." **Boundary stated rather than assumed:** `08`'s $93.2m Luxembourg item and `06`'s $174.0m total deferred foreign tax benefit are two different figures, and **neither report establishes whether the $93.2m sits inside the $174.0m** — this synthesis does not assert that it does. Effect on the *current* setup is limited (FY2025 22.1%, H1 FY26 22.4% are normal rates); the damage is to any multi-year EPS or return series drawn through FY2023, and it is one of the two reasons earnings quality is marked down from 74 to 68 in §1.

**Two further conflicts, carried but not re-litigated (both correctly adjudicated upstream by `08`):**
- **Receivable days — three series in circulation.** `06` §3's matched-basis method (DSO on annualised latest-quarter revenue: 57.4 → 59.3 → 60.1 days) is the §15-correct one for a company that acquired $97.7m of receivables mid-period, and it dissolves the reported +13.2% FY2025 flag. But `06` **caps its own confidence** because no 30-Jun-2025 balance sheet exists in this pool, against `business-model/11_capital-allocation-governance`'s 61.6 → 76.1 days scored at severity 40. **The flag is REDUCED, not CLEARED**, and must not travel as "no concern."
- **`03` §9 reads the capacity spend as a demand signal (closer to a booking than an expense) while `07` §6 reads the same deliberately enlarged fixed base as the largest asymmetry in the setup.** Both are correct and they name the **same flip observable** — organic order growth versus organic sales growth. `03` describes today (capex intensity flat at 2.42% vs 2.40%, D&A ratio down 106bps, backlog 3.3x its level 18 months ago, management naming supply not demand as the binding constraint); `07` describes the failure path. Keep both sentences together; neither cancels the other.

---

## 4. Score Cap Application

| Cap Trigger | Applied? (Y/N) | Affected Score | Final Cap |
|---|---|---|---|
| No consensus / estimate data | **N** | Consensus setup | Not applied. Consensus, Guidance, Surprise, Trends, Revisions and Recent Changes tabs all extracted `ok`; latest broker revision **7-Aug-2026 postdates the 31-Jul-2026 Q2 print**, so the export is not stale either [`00` §5; `04` §1] |
| No cash flow statement | **N** | Earnings quality | Not applied. Audited FY2022–FY2024 statements of cash flows, filed H1 FY25 and H1 FY26 condensed statements, plus the vendor LTM column [`06`, header note] |
| No revision history | **N** | Consensus setup | Not applied. `CIQ Estimates→Recent Changes` (broker-level, latest 7-Aug-2026), `→Revisions` (breadth) and `→Trends` (90/60/30-day path) all present [`04` §4, §5] |
| No verbatim transcript AND no sell-side proxy | **N** | Earnings clarity | Not applied. **Two verbatim transcripts**: Q1 FY26 (FactSet Corrected Transcript, 1-May-2026) and Q2 FY26 (S&P Global / CIQ, 31-Jul-2026). Tone and candor ARE assessable |
| Transcript role filled ONLY by a sell-side proxy (no verbatim) | **N** | Earnings clarity | Not applied. No sell-side proxy was used and none is needed |
| Only inferred sensitivities | **N** | Earnings volatility confidence | Not applied — but **narrowly**. Company-disclosed per-unit rates exist (FY24 Item 7A interest-rate ±$8.7m/100bp and currency ±$13.6m; the mid-20s incremental rate; the ~$100m tariff guide), so the cap does not formally bind. **However, neither disclosed coefficient touches a top-three variable, and the dominant variable's move size is inferred** — `07` reflects this row by row, and it is why volatility is scored 72 rather than 68 |
| *(additional)* No quarterly data | **N** | Earnings clarity | Not applied. Two 10-Qs plus quarterly actuals to FQ2 2026 |
| *(additional)* No segment-level P&L for a multi-segment business | **N** | Earnings clarity | Not applied. The 10-Q segment note discloses net sales, **cost of goods sold**, SG&A, R&D and segment income by segment — stronger disclosure than most industrials give, and it is what lets `03`'s bridge reconcile |
| *(additional)* Conflicting sources not reconcilable | **N** | Overall usefulness | Not applied. Every conflict named in `08` §2.9 is reconcilable and reconciled; two are calibration gaps, not factual conflicts. The max-65 cap does not bind |

**No named MODULE_RULES hard cap binds on this pool.** That is `00` §5's finding, `08` §6 independently instructs the synthesis not to invent one, and this agent does not.

**Cap earned from the "Critical concerns" severity verdict — stated explicitly rather than absorbed.** MODULE_RULES' score-cap table has no red-flag-severity row, and CLAUDE.md §13's hard rating cap is written for a **critical governance, solvency, accounting, fraud or going-concern** flag. `08`'s single Critical flag (#1, the turning leading demand indicator) is a **demand / cycle-position** flag, not one of those five categories, so §13's hard rating cap does **not** fire and this module must not pretend it did. What the verdict does earn, under CLAUDE.md §12 ("one critical red flag can cap the whole thesis") and §23 (the stricter rule wins), is applied here as **three explicit, labelled discretionary constraints**:

1. **Verdict lock.** The module verdict is locked out of "Earnings accelerating" and "Earnings stable" for the 3–12 month window. This is the binding constraint and it is why the verdict is Mixed.
2. **Discretionary haircut to earnings quality: 74 → 68.** Reason given in §1 and §3(v): two verified facts `06` did not have (the excluding measure sets incentive-compensation targets; the FY2023 recognition judgment reversed within twelve months). Labelled discretionary — not a MODULE_RULES cap.
3. **Discretionary uplift to earnings volatility (inverted, higher = worse): 68 → 72.** Reason: `07`'s own statement that its bear case is a bound and the down-volume decremental is not measurable from this pool.

**Earnings clarity is scored 62/100 with no cap applied, and the reason is stated rather than capped away** (`08` §6 makes exactly this point): the single largest driver — the order book — **is disclosed in no filing, at any level, in any period**, existing only as two rounded group-level transcript figures; and the largest forward event (Maverick Power, ~$700m of estimated 2026 revenue, expected to close inside the guided Q4) sits outside both the guidance and every estimate in this pool. That is a genuine modelling gap even though it triggers no named cap.

**Score summary (module scores, MODULE_RULES bands):**

| Score | Value | Direction | Basis |
|---|---:|---|---|
| Earnings clarity | **62** | higher = better | No cap binds; the order book is unfiled and Maverick is unpriced |
| Earnings quality | **68** | higher = better | `06`'s 74 minus an explicit, labelled discretionary haircut |
| Consensus setup | **48** | **higher = more beatable** (NOT inverted) | Q3 beatable, Q4 stretched, positioning 100% one-sided |
| Earnings volatility | **72** | **INVERTED — higher = WORSE** | `07`'s 68 plus an explicit, labelled discretionary uplift |
| Data quality | **74** | higher = better | 0 extraction failures, but no FY2025 10-K and no filed order series |
| Overall usefulness | **76** | higher = better | Conflicts all reconciled; the max-65 cap does not bind |

---

## 5. Earnings Setup Summary

### Revenue Setup

The reported trajectory is **not sustainable as printed**, and the gap is arithmetic rather than opinion: of Q2's 52.8pp of growth, **5.4pp was bought and 0.5pp was currency** — for the half-year the gap is wider still, 53.1pp reported against **41.2pp organic**, an **11.9pp** difference. The Electrical Products Group anniversaried on **1-May-2026**, so its contribution goes to roughly zero from Q3, and management's own FY guide implies **−$15.9m of non-organic revenue across H2** (a small currency drag and no acquisition help) — which is also the arithmetic proof that Maverick Power sits outside the FY2026 guide. Everything from Q3 must therefore be earned organically. **The single factor that would flip the direction is the relationship between organic order growth and organic sales growth**: in Q2 orders grew "low double digits" while organic sales grew 46.9%, so the book is being consumed faster than it is replaced, and the moment newly built Blaine capacity comes online against orders that have not recovered, the revenue line follows the order line rather than the backlog. One offsetting item cuts the other way and is not in any number here: a Maverick close inside Q4 adds roughly **$175m of FY2026 revenue (+3.3% of the guided midpoint)** for a reason unrelated to demand.

### Margin Setup

Current margins are **at a cyclical peak on the operating line and at a cyclical trough on the factory line at the same time**, and reading only one of them inverts the picture. Adjusted return on sales of 21.9% and adjusted EBITDA margin of 23.0% are the highest of the eight quarters in the pool — but they are earned on overhead absorption, not manufacturing economics, and management has already capped the mechanism by guiding **"mid-20s incrementals"** for H2 and confirming the pre-divestiture 30% return-on-sales figure is no longer the target. **The driver that takes the largest bite if it moves adversely is data-centre / infrastructure volume**: a 20% fall in the >$2.0bn of guided data-centre sales is −$400m of revenue, which at the company's own mid-20s incremental rate is −$100m of adjusted operating income and **−$0.473 of adjusted EPS, 9.4% of the guided base** — and `07` labels that a **bound, not a central estimate**, because the decremental rate on falling volume cannot be measured from this pool. On protection: nVent has **no contractual pass-through** — no escalator, no index-linked price, no raw-material surcharge, and fixed-price project bids — and **no commodity hedging programme is disclosed anywhere in the pool**. But "no contractual pass-through" is a fact about contracts, not a measurement: the **realised** recovery of input inflation ran **40% (Q1 FY26) → 79% (Q2 FY26), 58% for H1**, computed from filed gross margins against management's own inflation dollars. The company is a price-taker on paper and a partial recoverer in practice, with a one-to-two-quarter lag — and the 2023–24 record shows the price is handed back when cost pressure eases (group price +5.5% in 2023, **−0.2% in 2024**).

### Quality Check

The single largest gap between reported and economic earnings is **acquisition intangible amortisation** — $147.1m in FY2025, $165.2m over the last twelve months, rising in every year on record (50.3 / 69.5 / 94.7 / 147.1) on $2.77bn of deals in three years. In dollars it is **widening**; as a percentage of reported profit it is **narrowing** (the adjusted-versus-GAAP wedge fell from 28.8% in FY2025 to 17.1% in H1 FY26) only because reported earnings grew faster than the add-back, not because the charge shrank — and Maverick Power will enlarge it again. The adjustments are **not genuinely one-time**: four categories (intangible amortisation, acquisition transaction and integration costs, restructuring and other, and the Q4 pension remeasurement) appear in **every single year on record**, so the "adjusted" label is doing structural work, not one-off work — and the same excluding measure is the one used to **set incentive-compensation targets**, which means rising segment income is not independent confirmation that the acquisition programme is working. **To model normalised earnings for next year, start from GAAP continuing operations and add back only what is genuinely non-recurring** — which, on this evidence, is close to nothing on the operating line. The company's adjusted line is more conservative than most US industrials in two respects worth keeping (stock-based compensation of $37.5m FY2025 stays *inside* adjusted earnings, and nVent *removed* a $25.8m GAAP benefit from its own Q2 adjusted numbers, publishing H1 adjusted EBITDA **below** GAAP-derived EBITDA) — but the amortisation exclusion is the one that compounds, and it is the recurring price of the engine driving the growth.

### Consensus Bar

To beat the current bar by a material margin, the company needs two things at once, and only the first is easy: **revenue merely has to avoid a 3.0% sequential fall** (the Q3 bar is $1,427.27m against $1,471.3m just delivered), but **the EPS bar needs incremental margins of roughly 26%** — above both the "mid-20s" management guides for H2 and the **24.1%** actually delivered in Q2. So a revenue beat with in-line incrementals produces a smaller EPS beat than the last two quarters imply. **The bar is most likely set incorrectly in Q4, and set too high**: consensus Q4 revenue is +5.32% and consensus Q4 adjusted EPS **+6.4%** (matched vendor-quarterly basis, per §3(iv)) above what the company's own FY and Q3 guidance imply, and that gap has to be closed with no acquisition and no currency help. The Q3 number, by contrast, may be marginally too low. **Essentially all of the recent consensus move is anchored to one thing that can reverse**: FY2026 adjusted EPS moved 4.58 → 4.59 → 4.61 over two months and then **4.61 → 5.11 (+10.8%) in the final month**, i.e. the Street catching up to the 31-Jul-2026 guidance raise, which itself rests on the AI data-centre capital-spending cycle. That is a mechanical restatement of management's own guide, not independent confirmation — and with **zero downward revisions on revenue, EBITDA or adjusted EPS across FY2026, FY2027 and FQ3 2026 over three months and 15 Buy ratings of 18 opinions**, there is no bearish cohort left to convert. None of the consensus contains Maverick Power (revision cut-off 7-Aug-2026, deal announced 24-Aug-2026).

---

## 5b. Leverage & Capital Structure

**Trigger test, run explicitly.** Trigger A (net debt / adjusted EBITDA > 3.0x at the most recent period-end): **does not fire** — at 30-Jun-2026 net debt was **$1,236.4m on the strict basis** (total debt $1,492.4m from the company's own debt note, which contains **no lease liabilities**, less cash $256.0m) = **1.16x** TTM adjusted EBITDA of $1,061.5m. On Capital IQ's **broad basis** (lease-inclusive: total debt $1,632.9m, net debt $1,376.9m) the same balance sheet gives **1.28x**; the $140.5m gap is exactly the lease liabilities and reconciles to the cent. Trigger B (material change): **does not fire** — leverage **fell**, from 3.01x (FY2024, strict) to 1.60x (FY2025, strict) to 1.16x (30-Jun-2026, strict); total debt fell from $2,155.0m (FY2024) to $1,492.4m; net debt fell from $2,023.8m (FY2024, strict) to $1,236.4m (30-Jun-2026, strict).

Leverage is within normal range and did not change materially during the period — no dedicated treatment required.

---

## 6. Key Numbers

- **Revenue growth:** TTM to 30-Jun-2026 **$4,834.0m, +46.2%**; Q2 FY26 **+52.8%** reported, of which **+46.9pp organic, +5.4pp acquisitions, +0.5pp FX** (10-Q's own components-of-change table; bridge residual 0.01pp) [`Q2 FY26 10-Q, statements of income p.3 and MD&A p.27`; `01` §2; `02` §6a]
- **Margins, both lines, never mixed:** Q2 FY26 adjusted EBITDA margin **23.0%** (+72bps YoY, vendor basis; +86bps on the company's own definition) — the highest of the eight quarters in the pool; Q2 FY26 gross margin **37.93% as filed (−68bps)** but **36.17% ex the $25.8m IEEPA one-off (−243bps)**, and 36.17% is the run-rate figure any downstream terminal margin must use [`Q2 FY26 10-Q, MD&A p.26–27 and Note 13 p.21`; `03` §3]
- **EPS:** Q2 FY26 adjusted diluted EPS **$1.45** (+68.6% YoY); GAAP diluted **$1.32** (includes ~$0.12 from the one-off tariff refund). FY2025 adjusted **$3.35** against GAAP continuing **$2.60** — a **28.8% wedge, 87% of it acquisition intangible amortisation** [`Q2 FY26 transcript, prepared remarks`; `Q1 FY26 presentation, slide 16`; `06` §7]
- **CFO / EBITDA:** **73.0% LTM**, on a matched continuing-operations basis; four-year path 69.1% → 73.3% → 74.4% → 78.7% → 73.0%. LTM FCF (§15: CFO − capex) **$659.9m**; **normalised operating FCF ~$634.1m** after removing the ~$25.8m one-off tariff refund [`06` §1, §2]
- **Biggest driver, current level, with its qualifiers:** the **infrastructure vertical** (data centres **and** power utilities) = **$882.5m, 60.0% of Q2 FY26 sales**, from 42.5% a year earlier, and **93.1% of every incremental dollar** on a **total, not organic-only** basis. Data-centre sales alone are guided **">$2 billion in 2026, more than double last year's"** — a **transcript figure with no filed equivalent** [`Q2 FY26 10-Q, Note 2 p.9`; `Q2 FY26 transcript, prepared remarks`]
- **The forward series that contradicts it:** organic orders **~40% (Q1 FY26) → "low double digits" (Q2 FY26)**; backlog **$2.6bn → $2.5bn** after growing low-double-digits sequentially in Q1; implied Q2 book-to-bill **~0.93x (honest range 0.86–1.00x)** from ~1.2x. **All group-level, transcript-only, rounded to $0.1bn; no filed equivalent at any level** [`Q1 FY26 transcript`; `Q2 FY26 transcript`, prepared remarks; `02` §6a]
- **Consensus gap:** Q3 FY26 bar **$1,427.27m revenue / $1.3899 adjusted EPS**, standalone-quarter basis, no restatement required — **+0.31% and +0.72% above management's guided HIGH end**, and 3.0% / 4.1% **below** the quarter just delivered. Q4 FY26: consensus **+5.32% (revenue)** and **+6.4% (adjusted EPS, matched vendor-quarterly basis)** above the guidance-implied path [`04` §1A, §3; `08` §2.5]
- **Estimate revision direction:** **Rising, and 100% one-sided** — FQ3 adjusted EPS +17.8% and FY2026 revenue +8.8% over 90 days, with **zero downward revisions** on revenue, EBITDA or adjusted EPS across FY2026, FY2027 and FQ3 2026 in three months; 15 Buy of 18 opinions. The move is **catch-up to the 31-Jul raise** (4.61 → 5.11 in the final month), not independent upgrades [`04` §4, §5]
- **Leverage, with its basis label:** **1.16x strict** (net debt $1,236.4m, lease-free, filing-verified) / **1.28x broad** (net debt $1,376.9m, lease-inclusive, vendor) at 30-Jun-2026; the $140.5m gap is exactly the lease liabilities. Not this module's canonical figure — `balance-sheet-survival` owns that [`Q2 FY26 10-Q, Note 10 (Debt)` and balance sheet p.4; `01` §1 basis note]
- **Earnings volatility score: 72/100 — INVERTED, higher = WORSE** (raised from `07`'s 68; see §4)

---

## 7. What Would Change The Earnings Verdict?

| Current Verdict | What Would Upgrade It | What Would Downgrade It | Data Needed |
|---|---|---|---|
| **Mixed earnings setup** | **(a)** Organic order growth re-accelerating above organic sales growth in Q3, with **backlog stopping its fall** (i.e. rising from $2.5bn) — this is the single observable that resolves the module's central contradiction. **(b)** A **fourth guidance raise taking the FY2026 adjusted-EPS midpoint above ~$5.20**, materially more than a mechanical pass-through of a Q3 beat (which would add only ~$0.10–0.15 and land at ~$5.11, merely matching consensus). **(c)** Gross margin ex-one-offs turning positive, proving the price-cost fight is being won rather than the overhead ratio merely falling. **(d)** A Maverick close inside Q4 with disclosed funding split, segment placement and purchase-price allocation, converting an unpriced ~$700m-revenue event into a modellable one. Together these would support **Earnings accelerating** | **(a)** A Q3 print inside the guided +32–35% and **below** the $1,427.27m consensus, confirming Q2's 46.9% organic growth was a **deliberate backlog drain** rather than new demand (management's own words: "we worked hard in Q2 to really execute on that backlog"). **(b)** Backlog falling a second consecutive quarter with orders still in low double digits — at which point the enlarged fixed base (three committed Minnesota plants, capex ~$130m up 40%, D&A ~$230m) flips from a booking to an under-absorbed cost and the **453bps of SG&A absorption reverses**. **(c)** The FY range held at $5.00–$5.10 after a Q3 beat, leaving the **+5.32% revenue / +6.4% EPS Q4 gaps intact** against a panel with no bears left. **(d)** Any disclosure that a single data-centre customer has crossed 10% of sales. Together these would support **Earnings decelerating** or **Earnings inflecting — negative (driver: data-centre order intake)** | **(1)** The **Q3 FY2026 print, expected 30-Oct-2026** — specifically organic order growth versus organic sales growth, and the backlog figure. **(2)** A **filed** order-intake / backlog / book-to-bill series at group or segment level — none exists anywhere in this pool, at any level, in any period; this is the single highest-value missing input. **(3)** The **FY2025 Form 10-K** (audited statements, segment note, MD&A margin bridge, Item 7A) for the year the mix transformed. **(4)** A **customer-concentration statement after FY2024** — the disclosure gap sits precisely over the period Systems Protection roughly doubled. **(5)** Maverick Power's **funding split, segment placement and purchase-price allocation**. **(6)** Post-24-Aug-2026 consensus that actually contains the deal |

**Constraint check.** Consensus setup is **not** "Unknown" — consensus, guidance, revision history, breadth and surprise data are all present with 14–17 contributors per line — so the rule barring "Earnings accelerating" on absent consensus does not bind here. The verdict is Mixed on the evidence, not on a data gap.

---

## 8. Note To The Final Synthesizer

**Red-flag Severity Verdict, reported verbatim and not softened: "Critical concerns"** [`08_earnings-red-flags.md`, §5] — 1 Critical, 22 High, 29 Medium, 9 Low. `08` states this is the "should be downgraded" arm of that definition, not the "unreliable" arm: the pool is sufficient, the specialist work is careful, the bridges reconcile with printed residuals, and the cash behind the earnings is real. This synthesis adopts `08`'s recommended verdict category, so `08`'s verdict and §1's verdict do not conflict.

**Forensic tag propagation (CLAUDE.md §13; eval check AQ).** `06_earnings-quality.md` emitted **neither** tag, and each non-emission is recorded with its own stated reason so the master's cross-module forensic roll-up can see the check was run:
- **`RF-EQ-001` (rising accruals divergent from cash earnings) — NOT emitted.** Only one of the six accrual-quality rows triggered (deferred revenue), below the two-row threshold [`06` §6].
- **`RF-EQ-002` (cash-conversion breakdown) — NOT emitted.** CFO/EBITDA was not below 50% in any of the last three years on either the continuing-operations basis (74.4% / 78.7% / 73.0%) or the total-company basis (95.5% / 56.4% / 65.2%) [`06` §2].

**What the scores MEAN:**
- **The dominant trend is two series pointing opposite ways in the same quarter, and the honest answer is to report both rather than average them.** Delivered revenue and delivered margin are at their best of the eight quarters in the pool; the order book that feeds them has turned. The horizon decides which one you are looking at.
- **The earnings are clean and cash-backed, but the headline profit line is not the economic one.** Cash conversion is genuine and the cycle has shortened. What travels forward is a growing, recurring exclusion — acquisition intangible amortisation, $165.2m over the last twelve months, rising every year — sitting inside a measure that also **sets incentive-compensation targets**. Do not let the earnings-quality score travel as "the wedge was tested and cleared."
- **The consensus bar is beatable in the near print and stretched in the one after it**, and the whole recent estimate move is a restatement of management's own guidance raise rather than independent analyst work. There is no bearish cohort left to convert, which is a positioning risk, not a comfort.
- **Next-quarter setup: favours a beat — standalone Q3 FY2026 only.** Second-quarter look-ahead (Q4 FY2026): a **wider distribution in both directions**, and not resolvable from this pool until either Maverick closes or a fourth guidance raise on 30-Oct-2026 shows which way the gap closes.
- **Top sensitivity variable and its direction:** data-centre / infrastructure demand, currently two-handed — accelerating on delivered sales, decelerating on orders. Its published downside is a **floor on the damage, not a central estimate**, because the down-volume decremental cannot be measured from this pool.
- **Partial-data caps:** none of the six named MODULE_RULES caps binds. Three explicit, labelled **discretionary** constraints were applied instead, driven by the Critical-concerns verdict (verdict lock out of "accelerating"/"stable"; earnings-quality haircut 74 → 68; volatility uplift 68 → 72). Earnings clarity is held at 62 without a cap, for a stated reason.
- **Biggest missing data point (one, not ten):** **a filed order-intake / backlog / book-to-bill series.** The number that decides this module's verdict exists nowhere in any filing, at any level, in any period — only as two rounded, group-level, management-supplied figures on two earnings calls.

**MANDATORY RED-FLAG PROPAGATION — all 1 Critical and all 22 High flags from `08` §3, none omitted:**

- **CRITICAL — #1 The leading demand indicator turned while the verdict horizon is 3–12 months.** Orders ~40% → low double digits, backlog $2.6bn → $2.5bn after growing sequentially in Q1, book-to-bill ~0.93x from ~1.2x. This is the flag that sets the verdict category.
- **Biggest risks — data completeness (High):** **#2** consensus (7-Aug) and price (12-Aug) both **predate the 24-Aug Maverick announcement**, so every bar, gap and price figure in this module is pre-deal; **#3** no filed order, backlog or book-to-bill series at any level; **#4** no FY2025 Form 10-K — the transformation year has no audited statements, segment note, MD&A bridge or Item 7A.
- **Biggest risks — revenue (High):** **#5** 93.1% of incremental Q2 revenue, 60.0% of sales from one **vertical** (data centres *and* power utilities), Americas 94.3% of growth, Systems Protection 86.6% — **this is the module's single largest sensitivity**; **#6** customer concentration untested since FY2024, over exactly the period of change, so a concentration cliff can be neither confirmed nor excluded; **#7** Q2 sales were partly a **deliberate backlog drain — pull-forward from H2, on management's own words**, which makes the Q3 and Q4 comparisons harder, not easier.
- **Biggest risks — margins (High):** **#8** reported gross margin −70bps is flattered by a one-off; the like-for-like run-rate is **−243bps**, and only 36.17% may seed a terminal margin; **#9** **109% of the operating-margin gain is SG&A absorption**, not manufacturing economics, on a fixed base being deliberately enlarged.
- **Biggest risks — guidance / consensus (High):** **#10** Q4 consensus revenue **+5.32%** above the guide-implied path, which must be earned organically; **#11** revision breadth **100% one-sided**, 15 Buy of 18, no bear cohort left, so an in-guide print still disappoints; **#12** **Maverick Power is outside FY2026 guidance and outside every estimate in this pool** — a ~$700m-revenue business closing inside the guided quarter, priced by nobody.
- **Biggest risks — beat/miss framing (High):** **#13** "Setup favors beat" is a **one-quarter read inside a 3–12 month module** — `08` calls this the most likely misreading of the whole module; **#14** the setup needs a **fourth guidance raise above ~$5.20**, not just a Q3 beat: the quarter can be right and the year still wrong; **#23** the same defect met as framing — a one-quarter beat read travelling as the 3–12 month verdict. **Both are neutralised in this synthesis by the horizon label in §1 and the adjudication in §3(i), and the master must keep that label attached.**
- **Biggest risks — earnings quality (High):** **#15** adjusted EPS **28.8% above GAAP**, 87% recurring acquisition amortisation on $2.77bn of deals in three years (CLAUDE.md §24 Filter 4 — the business-model module applied a Filter 4 cap on the same evidence); **#16** the Maverick accretion claim is asserted on **"adjusted" EPS, the one measure that excludes the amortisation the deal itself creates** — near-circular company language about an uncompleted deal; **#17** that same excluding measure is used to **set incentive-compensation targets**, so rising segment income is not independent proof the acquisition programme is working.
- **Biggest risks — sensitivity (High):** **#18** one **uncontrolled external variable** swings adjusted EPS ±9.4%, more than all other variables combined; **#19** the down-volume decremental is **not measurable** — the published bear case is a **bound**, and that label must travel or the downside reads as symmetric when it is not; **#20** Maverick's EPS effect was recorded "not quantifiable" while the release discloses an **11.5x 2026 adjusted-EBITDA multiple** implying ~$152m of EBITDA on ~$700m of revenue, a ~21.7% margin — a §20 bad-extraction gap, corrected in §3(iii).
- **Biggest risks — narrative / classification (High):** **#21** **"Earnings accelerating" is not what the assembled evidence shows** — this synthesis reports Mixed for exactly that reason; **#22** **the thesis is a sector / technology-cycle bet, not company-specific (CLAUDE.md §14)** — `business-model/99` classifies it explicitly that way and scores business quality **41/100**, moat **45/100** ("no moat proven"), through-cycle return on capital 8.1% against a ~10.0% cost of capital. **Carry the classification, do not imply it; conviction downstream will be overstated if it is dropped.**

**Medium and Low flags, aggregated (29 Medium, 9 Low) — nothing material dropped silently.** The Medium band clusters into five themes already reflected in this synthesis: (i) *concentration of the improvement in one exceptional peak-of-cycle quarter* (#26); (ii) *bridge and basis discipline* — the −209.6bps unattributed margin residual (#29), the qualifier-drop on "93.1%" (#27, #52), three EBITDA figures for the same quarter (#50), the corrected mixed-basis Q4 EPS gap (#36); (iii) *mechanical H2 headwinds* — acquisition contribution to zero and a −$15.9m currency drag (#28), segment mix as a recurring drag that Maverick deepens (#30), a D&A ratio that falls only while growth holds (#32); (iv) *cost and rate exposure* — pass-through guided not proven with a prior cycle that gave the price back (#31), no commodity hedge and no published commodity sensitivity (#44), tariffs ~$190m all-in ≈ 3.5% of guided sales with the guide revised +25% in one quarter (#45), **interest expense stepping up after Q4 by ~9x the current-book sensitivity with committed bridge financing (#46)** — the one Medium flag worth flagging explicitly to the master because §5b's trigger test correctly returns "no dedicated treatment" on the 30-Jun-2026 balance sheet while a $1.75bn deal funded with "cash on hand and new debt" against $256.0m of cash is a dated near-term change inside this module's own window; and (v) *the FY2023 accounting distortion* (#40) — the $93.2m Luxembourg deferred-tax benefit 99.6% reversed by a $92.8m FY2024 valuation allowance, which **invalidates any multi-year EPS or return series drawn through FY2023** and is a live constraint on the valuation and business-model layers. The Low band (#53–#61) is presentational and basis-hygiene: a four-week-stale pre-Maverick price mark, two vendor-sourced Q2 non-GAAP figures, a chained tier-5 FY2025 revenue base, the Capital IQ EBIT reclassification that shrinks the FY2023 margin step-up, an unsplittable volume/price bound, unusable seasonality, ~$25.8m of one-off tariff refund inside LTM FCF (must not be double-counted against the same $25.8m already removed from the gross margin), falling contract liabilities, and the vendor's FY-versus-quarterly panel gap.

**Three checks that came back clean and should be stated positively, because they could easily have gone the other way** [`08` §2.5, §2.7, verified directly against the filing]: the +68.6% Q2 adjusted-EPS growth is **not tax-driven** (effective rate 22.4% for the six months ended 30-Jun-2026 *and* 30-Jun-2025 — identical), **not buyback-driven** (diluted shares *rose* 0.3% to 164.1m; H1 repurchases fell to $50.4m from $253.1m, consistent with cash being held for Maverick) and **not currency-driven** (0.5pp); stock-based compensation is expensed inside adjusted earnings; and no factoring or supplier-finance programme is disclosed. **The problem here is not that the earnings are fake — it is that they are cyclical, concentrated, and at risk of being framed as a trend.**

---

## 9. Simple Summary

- **Revenue:** growing very fast and slowing underneath. Sales up 52.8% in the June quarter, but new orders slowed from about 40% growth to low double digits and the order book shrank from $2.6bn to $2.5bn. Almost all the extra sales came from one place — the infrastructure vertical (data centres and power utilities), 93.1% of every extra dollar.
- **Margins:** the profit margin improved for one reason only — fixed overhead spread over far more sales. The factory itself got worse: once you remove a one-off $25.8m tariff refund, gross margin fell 243 basis points, not the 70 the filing shows.
- **Are the earnings clean?** Yes on cash — operating cash has been 69–79% of profit for four straight years. No on presentation — the "adjusted" profit runs 29% above the audited number, and 87% of that gap is the recurring cost of buying companies, on the same measure used to set management's bonus targets.
- **Is the consensus bar beatable?** For the September quarter, probably — it asks for sales 3% *below* what the company just delivered. For the December quarter, no — the Street sits 5.3% above what management's own guidance implies, and 6.4% above on earnings.
- **Next quarter:** favours a beat. That verdict covers the September quarter only and must not be stretched to the year.
- **Biggest thing that can break it:** data-centre building. A 20% swing moves earnings per share about 9.4%, and nVent does not decide how many data centres get built. The downside number is a floor, not a best guess.
- **Earnings volatility: high** (72/100 on an inverted scale where higher is worse).
- **Useful for the master synthesizer?** Yes — but only if two labels travel with it: the beat call is **one quarter**, and this is a **sector / technology-cycle bet**, not a company-specific one.



---

## earnings / 00_earnings-data-triage.md

_Source: `00_earnings-data-triage.md`_

# Earnings Data Triage — NVT

Evidence binding: frozen. `DATA_PATH` = `NOSTRA_FROZEN_EVIDENCE_ROOT`; generation `6db32848…1aecd1e6`. All reads resolved through that exact generation's `manifest.json`, `corpus.txt`, `ciq_facts.json`, and per-tab extracts. Live `data/NVT/` was not read; `data/NVT/` is a citation label only.

Pool manifest totals: 15 sources, 2 workbooks, 20 tabs, 33 extracts written, **0 failures**. Every source carries `status: ok`. No `fail`, `fallback-text`, `missing-dependency`, or `gdrive-pointer` rows exist, so no source is treated as missing on extraction grounds.

**On the "Last Modified" column (fix F23).** Every file in the frozen tree carries the same synthetic timestamp (2026-09-07 07:57) — that is the freeze/sync time, not a document date. It is analytically worthless and is not used. The column below instead reports the document's **own stated date read from inside the document** (filing signature date, presentation date, call date, or vendor data-as-of).

---

## 0. Jurisdiction & Reporting Regime

| Item | Detected Value | Evidence |
|---|---|---|
| Primary listing country | United States (issuer incorporated in Ireland; head office London, UK) | `FY24 10-K, cover page` — "Ireland (State or other jurisdiction of incorporation)"; "The Mille, 1000 Great West Road, London TW8 9DW, United Kingdom" |
| Exchange | NYSE, ticker NVT | `Q2 FY26 10-Q, cover page`; `CIQ Estimates→Consensus` header "nVent Electric plc (NYSE:NVT)" |
| Filing regime (US SEC / India SEBI-LODR / UK / Other) | **US SEC, domestic-filer forms** — 10-K, 10-Q, 11-K (not 20-F/6-K). Commission file 001-38265 | `FY24 10-K` Form 10-K; `Q1 FY26 10-Q`, `Q2 FY26 10-Q` Form 10-Q; `FY25 11-K` Form 11-K |
| Reporting standard (US GAAP / IFRS / Ind AS) | **US GAAP** | `CIQ Estimates→Surprise` header "Acctg. Standard: US GAAP"; `CIQ Estimates→Consensus` header "US GAAP\|USD" |
| Reporting currency | **USD**, statements in millions | `CIQ Financials→Income Statement` header "In Millions of the reported currency… USD"; `ciq_facts.json` `"currency": "USD"` |
| Fiscal-year end | **31 December** | `FY24 10-K` "For the Fiscal Year Ended December 31, 2024"; `CIQ Estimates→Consensus` "Current Fiscal Year End: Dec-31-2026" |
| Document language(s) | English (all 15 sources) | All extracts under the frozen generation are English |

Downstream note per CLAUDE.md §27: NVT is a **US-regime domestic filer despite Irish incorporation**. The 10-K / 10-Q / 8-K source map applies directly — do NOT look for an Irish annual report, SEBI-LODR results, or a 20-F. The interim basis is a **standalone three-month 10-Q shown alongside the cumulative year-to-date period**, so a vendor "next quarter" consensus is already on the same standalone basis the company reports; no cumulative-vs-standalone restatement is needed here.

---

## 1. File Inventory

33 rows = 13 single-file sources + 20 workbook tabs (each tab listed separately; neither workbook is left as a single opaque row).

| Filename | Type | Period Covered | Last Modified (document's own stated date) | Earnings Relevance |
|---|---|---|---|---|
| `nVent Electric plc, 2025.pdf` (666,532 ch) | **Annual filing — Form 10-K** | FY ended **31-Dec-2024** (with FY2023, FY2022 comparatives) | Filed early Feb-2025 (10-K for FY2024) | High |
| `nVent Electric plc, Q1 2026.pdf` (165,957 ch) | **Quarterly filing — Form 10-Q** | Quarter ended **31-Mar-2026**; BS as of 31-Dec-2025 | Signed **1-May-2026** | High |
| `nVent Electric plc, 2026.pdf` (151,205 ch) | Quarterly filing — Form 10-Q (**duplicate render of the Q1 FY26 10-Q**) | Quarter ended **31-Mar-2026** | Signed **1-May-2026** (same signatories, same date) | Medium (duplicate — no new content) |
| `nVent Electric plc, Q2 2026.pdf` (165,244 ch) | **Quarterly filing — Form 10-Q** | Quarter ended **30-Jun-2026**; six months ended 30-Jun-2026 | Quarter ended 30-Jun-2026; results released 31-Jul-2026 | High |
| `nVent Electric plc, Q1 2026 Earnings Call, May 01, 2026.pdf` (119,141 ch) | **Verbatim transcript** (FactSet CallStreet "Corrected Transcript", prepared remarks + Q&A) — full trust | Q1 FY2026 call | **1-May-2026** | High |
| `nVent Electric plc, Q2 2026 Earnings Call, Jul 31, 2026.pdf` (60,265 ch) | **Verbatim transcript** (S&P Global Market Intelligence / CIQ "FQ2 2026 Earnings Call Transcripts") — full trust | Q2 FY2026 call | **31-Jul-2026, 1:00 PM GMT** | High |
| `nVent Electric plc, Q1 2026 ppt.pdf` (36,833 ch) | **Investor deck — earnings presentation** | Q1 FY2026 | **1-May-2026** | High |
| `2026-William-Blair-Conference-nVent-NVT-Presentation.pdf` (48,773 ch) | Investor deck — conference presentation (CEO Beth Wozniak) | FY2026 outlook / strategy | **3-Jun-2026** | Medium |
| `nVent-to-Acquire-Maverick-Power-2026.pdf` (8,527 ch) | **Company press release — M&A** (not an earnings release) | Announcement | **24-Aug-2026** | Medium (states expected accretion to adjusted EPS in year 1; post-Q2 event affecting the forward setup) |
| `nVent Electric plc, 2026 rev.pdf` (49,740 ch) | Benefit-plan filing — **Form 11-K** (nVent Management Company Retirement Savings and Investment Plan) | Plan FY ended **31-Dec-2025** | Plan year ended 31-Dec-2025 | Low (retirement-plan accounts; not company earnings) |
| `nVent Electric plc NYSE NVT Competitors.rtf` (44,260 ch) | Data export — CIQ competitor list | Not period-bound | Vendor export | Low |
| `nVent Electric plc NYSE NVT Products.rtf` (14,937 ch) | Data export — CIQ product list | Not period-bound | Vendor export | Low |
| `nVent Electric plc NYSE NVT Strategic Alliances.rtf` (9,633 ch) | Data export — CIQ alliances list | Not period-bound | Vendor export | Low |
| — **`nVent Electric plc NYSE NVT Financials.xls` → tab `Key Stats`** | Data export (CIQ) | Annual FY2021–FY2025 + LTM Jun-30-2026 | Vendor data as of ~12-Aug-2026 | Medium |
| — tab `Income Statement` | Data export (CIQ) — **income statement** | 12m Dec-2021, Dec-2022 (R), Dec-2023 (R), Dec-2024, Dec-2025, LTM Jun-30-2026 (108×7) | Vendor, ~12-Aug-2026 | High |
| — tab `Balance Sheet` | Data export (CIQ) — **balance sheet** | Annual FY2021–FY2025 + LTM (94×7) | Vendor, ~12-Aug-2026 | High |
| — tab `Cash Flow` | Data export (CIQ) — **cash flow statement** | Annual FY2021–FY2025 + LTM Jun-30-2026 (76×7) | Vendor, ~12-Aug-2026 | High |
| — tab `Multiples` | Data export (CIQ) — valuation multiples + **closing prices** | Quarter-ends 31-Mar-2025 → 30-Jun-2026 plus **12-Aug-2026** column (91×9) | Vendor close **12-Aug-2026** | Medium |
| — tab `Historical Capitalization` | Data export (CIQ) | Annual + LTM (39×7) | Vendor, ~12-Aug-2026 | Low |
| — tab `Capital Structure Summary` | Data export (CIQ) | Annual + LTM (99×7) | Vendor, ~12-Aug-2026 | Low |
| — tab `Capital Structure Details` | Data export (CIQ) — debt maturities | As-reported block, principal by maturity as of 31-Dec-2025 (40×10) | Vendor, ~12-Aug-2026 | Low |
| — tab `Ratios` | Data export (CIQ) — returns, margins, working capital (161×7) | Annual FY2021–FY2025 + LTM | Vendor, ~12-Aug-2026 | Medium |
| — tab `Supplemental` | Data export (CIQ) (74×7) | Annual + LTM | Vendor, ~12-Aug-2026 | Low |
| — tab `Industry Specific` | Data export (CIQ) (15×6) — near-empty (20 populated cells) | Annual | Vendor, ~12-Aug-2026 | Low |
| — tab `Pension OPEB` | Data export (CIQ) (243×7) | Annual + LTM | Vendor, ~12-Aug-2026 | Low |
| — **tab `Segments`** | Data export (CIQ) — **segment P&L + geographic revenue** (84×7) | Annual, latest column 12m **Dec-31-2025** | Vendor, ~12-Aug-2026 | High |
| — **`nVentElectricplcNYSENVTEstimatesReport.xls` → tab `Consensus`** | **Consensus / estimate export** (462×41) — mean/median/high-low/std-dev/n, target price, recommendation split, **latest price/last close**, current-quarter / current-year / NTM EPS, revenue, EBITDA and company guidance | FQ3 2026, FY2026, FY2027, NTM | Vendor; latest revision in workbook **7-Aug-2026** | High |
| — tab `Recent Changes` | Consensus export — broker-level revisions with dates/analysts (265×10) | Revisions dated to **7-Aug-2026** | Vendor, 7-Aug-2026 | High |
| — tab `Guidance` | **Guidance data** — company guidance vs consensus by period, guidance dates, actual vs guided (179×41) | FQ3 2018 → FY2026 | Vendor, ~Aug-2026 | High |
| — tab `Multiples` (Estimates) | Consensus export — forward multiples (23×7) | Forward periods | Vendor, ~Aug-2026 | Medium |
| — **tab `Surprise`** | Consensus export — **actual vs estimate history, annual AND quarterly** (219×35) | Annual FY2018–FY2025; **quarterly FQ1 2018 → FQ2 2026** | Vendor, ~Aug-2026 | High |
| — tab `Trends` | Consensus export — estimate trend over time (300×16) | Multi-period | Vendor, ~Aug-2026 | High |
| — **tab `Revisions`** | Consensus export — **revision breadth (up/down counts)** (467×12) | FY2026 / FY2027 and quarters | Vendor, ~Aug-2026 | High |

Derived sidecars in the same generation (not pool documents, listed for completeness): `ciq_facts.json` (deterministic CIQ facts, 15 concepts resolved, 0 conflicts) and `relationships.json` (CIQ supplier/customer graph — tier-5 vendor export, covers only recently disclosed relationships).

**No `external/` subfolder exists in this pool** — `manifest.json` carries no `external: true` row and no `provenance` object on any source. Section 1A is therefore omitted, and no external document could have moved the verdict.

---

## 2. Most Recent Sources

Age measured to today, 2026-09-07, from the period covered (or the document's own date for calls/decks/exports).

| Source Type | Filename | Period | Age (months) |
|---|---|---|---|
| Annual filing | `nVent Electric plc, 2025.pdf` — Form 10-K | FY ended 31-Dec-2024 | **20.2** |
| Annual financials (FY2025, non-filing) | `nVent Electric plc NYSE NVT Financials.xls` → `Income Statement` / `Balance Sheet` / `Cash Flow` / `Segments` | 12 months ended 31-Dec-2025 | 8.2 (period end); vendor as of ~12-Aug-2026 |
| Quarterly filing | `nVent Electric plc, Q2 2026.pdf` — Form 10-Q | Quarter and six months ended 30-Jun-2026 | **2.2** |
| Earnings transcript | `nVent Electric plc, Q2 2026 Earnings Call, Jul 31, 2026.pdf` — **verbatim** | Q2 FY2026 call, 31-Jul-2026 | **1.2** |
| Investor deck | `2026-William-Blair-Conference-nVent-NVT-Presentation.pdf` (latest earnings deck: `nVent Electric plc, Q1 2026 ppt.pdf`, 1-May-2026) | 3-Jun-2026 | 3.1 (earnings deck 4.2) |
| Consensus / estimate export | `nVentElectricplcNYSENVTEstimatesReport.xls` → `Consensus` / `Recent Changes` / `Surprise` / `Trends` / `Revisions` | Latest broker revision 7-Aug-2026; surprise history through FQ2 2026 | **1.0** |
| Cash flow data | `nVent Electric plc, Q2 2026.pdf` (six months ended 30-Jun-2026) and `…Financials.xls` → `Cash Flow` (LTM Jun-30-2026) | 30-Jun-2026 | **2.2** |
| Guidance data | `nVentElectricplcNYSENVTEstimatesReport.xls` → `Guidance`; Q2 FY26 transcript (31-Jul-2026); Q2 FY26 10-Q | FY2026 / FQ3 2026 guidance | **1.2** |

---

## 3. Earnings Usability Check

| Requirement | Available? (Y/N) | Source | Why It Matters |
|---|---|---|---|
| Income statement | **Y** | `Q2 FY26 10-Q, condensed consolidated statements of operations` (net sales $1,471.3m Q2; $2,713.3m six months); `FY24 10-K`; `CIQ Financials→Income Statement` (FY2021–FY2025 + LTM Jun-30-2026) | Needed for revenue, margin, EPS |
| Balance sheet | **Y** | `Q2 FY26 10-Q` (30-Jun-2026, with 31-Dec-2025 comparative); `FY24 10-K`; `CIQ Financials→Balance Sheet` | Needed for working capital and leverage |
| Cash flow statement | **Y** | `Q2 FY26 10-Q` (six months ended 30-Jun-2026); `FY24 10-K, Consolidated Statements of Cash Flows` (CFO from continuing ops $501.0m in 2024, $422.2m 2023, $273.3m 2022); `CIQ Financials→Cash Flow` (LTM CFO $690.6m) | Needed for CFO, FCF, earnings quality |
| Latest quarter | **Y** | `Q2 FY26 10-Q`, quarter ended 30-Jun-2026 — 2.2 months old | Needed for trend and setup |
| Last 8 quarters | **Y — with a source-tier split** | Filing-grade: Q1 FY26 and Q2 FY26 10-Qs give Q1'26, Q2'26 and their Q1'25, Q2'25 comparatives (4 quarters). Q3'25 and Q4'25 exist only in `CIQ Estimates→Surprise` (quarterly actuals FQ1 2018 → FQ2 2026), a tier-5 vendor export | Needed for seasonality and inflection |
| Consensus estimates | **Y** | `CIQ Estimates→Consensus` (FQ3 2026 EPS normalized 1.3899, revenue $1,427.3m; FY2026 EPS 5.113, revenue $5,435.3m, EBITDA $1,225.0m; 15 target-price estimates) | Needed for the market bar |
| Estimate revisions | **Y** | `CIQ Estimates→Recent Changes` (broker-level, latest 7-Aug-2026) and `→Revisions`; `ciq_facts.json`: FY2026 EPS 6↑/0↓, revenue 14↑/0↓ last month | Needed for revision momentum |
| Earnings transcript | **Y — two VERBATIM** | `Q1 FY26 Earnings Call, 1-May-2026` (FactSet Corrected Transcript, 20 pages, prepared remarks + Q&A) and `Q2 FY26 Earnings Call, 31-Jul-2026` (S&P Global / CIQ) | Needed for management tone and driver detail |
| Segment P&L | **Y** | `Q2 FY26 10-Q, segment note` — two reportable segments (Systems Protection, Electrical Connections) with net sales **and** significant expense categories to segment profit (Q2'26 net sales: Systems Protection $1,072.1m, Electrical Connections $399.2m, total $1,471.3m). Also `CIQ Financials→Segments` (FY2025: Systems Protection $2,593m / 67%, Electrical Connections $1,300m / 33% of $3,893m) | Needed for mix shift |
| Current price | **Y — but ~4 weeks stale** | `CIQ Estimates→Consensus, Market Summary`: Latest Price / Last Close **170.70 / 171.16**; 52-wk high/low 184.64 / 85.72. Corroborated by `CIQ Financials→Multiples` close column dated **12-Aug-2026** | Needed only for master-level stock-reaction context |

---

## 4. Cross-Module Availability

Checked against the actual filesystem at `analyses/NVT_2026-09-07/business-model/`. The business-model module has completed — all 14 outputs plus a dossier and an execution provenance receipt are present.

| Business-Model Output | Available? (Y/N) |
|---|---|
| `03_segment-map.md` | **Y** |
| `06_value-chain.md` | **Y** |
| `10_external-dependency.md` | **Y** |

Also present and usable by this module: `00_data-triage.md`, `01_disqualifier-scan.md`, `02_business-identity.md`, `04_unit-economics.md`, `05_customer-geography.md`, `07_business-quality.md`, `08_competitive-map.md`, `09_moat.md`, `11_capital-allocation-governance.md`, `12_red-flags-sweep.md`, `99_business-model-synthesis.md`. Per MODULE_RULES.md, `02_revenue-drivers` and `03_margin-drivers` must read `03_segment-map.md` and decompose by segment — the no-business-model disclaimer does NOT apply to this run.

---

## 5. Partial-Data Flags

| Missing Data | Applies? (Y/N) | Affected Agents | Cap Applied |
|---|---|---|---|
| No consensus / estimate data | **N** | 04, 05, 99 | None. Consensus, Guidance, Surprise, Trends, Revisions and Recent Changes tabs all extracted `ok`; latest broker revision 7-Aug-2026 postdates the 31-Jul-2026 Q2 release, so the export is **not** stale and no staleness haircut is triggered |
| No quarterly data | **N** | 01, 02, 03, 06 | None. Two 10-Qs (Q1 FY26, Q2 FY26) plus quarterly actuals to FQ2 2026 in `CIQ Estimates→Surprise` |
| No VERBATIM transcript, sell-side proxy present | **N** | 02, 03, 04 | None. Two verbatim transcripts exist; no sell-side proxy was used and none is needed. Tone and candor ARE assessable |
| No transcript AND no sell-side proxy | **N** | 02, 03, 04 | None. Earnings-clarity ≤70 cap does **not** bind |
| No segment-level P&L | **N** | 02, 03, 99 | None. 10-Q segment note discloses net sales and significant expense categories by segment; the ≤70 clarity cap for a multi-segment business does **not** bind |
| No cash flow statement | **N** | 06, 99 | None. Earnings-quality max-45 cap does **not** bind |
| No current price | **N** | 99 | None. Price present at 170.70 / last close 171.16, as of ~12-Aug-2026. Not a cap, but agent 99 must date the price and note it predates the 24-Aug-2026 Maverick Power announcement |

**No score caps from MODULE_RULES.md bind on this pool.**

Limitations that are NOT caps but that downstream agents must carry:

- **No FY2025 Form 10-K.** The most recent audited annual filing is the **FY2024** 10-K (period end 31-Dec-2024, 20.2 months old). FY2025 full-year figures are available — `CIQ Financials` annual column 12m Dec-31-2025 (revenue $3,893.1m, EBITDA $840m, segments 67/33) and `CIQ Estimates→Surprise` FY2025 actuals (revenue $3,893.1m, GAAP EPS 4.31, normalized EPS 3.35) — but these are **tier-5 vendor data, not a filing**. Per CLAUDE.md §5, any FY2025 full-year number must be cited to the Capital IQ export with its data-as-of date, never under a 10-K's name. FY2025 audited notes, MD&A, auditor's report, and FY2025 segment expense detail are genuinely absent from this pool. The 31-Dec-2025 **balance sheet** is available filing-grade as the comparative column in both 10-Qs.
- **No Q3 FY25 or Q4 FY25 10-Q/filing, and no FY2025 earnings calls.** Only the two most recent calls (Q1 FY26, Q2 FY26) are in the pool. Quarters Q3'25 and Q4'25 are vendor-only.
- **No Q2 FY26 earnings press release or Q2 earnings deck.** The latest earnings presentation is Q1 FY26 (1-May-2026); the Q2 numbers come from the 10-Q and the 31-Jul-2026 verbatim transcript, which is the stronger pair anyway.
- **One duplicate.** `nVent Electric plc, 2026.pdf` is a second render of the Q1 FY26 10-Q (same 1-May-2026 signatures). Do not treat it as an independent source or double-count it.
- **Material post-period event.** The Maverick Power acquisition was announced **24-Aug-2026** — after the Q2 10-Q, after the consensus export (7-Aug-2026) and after the price mark (12-Aug-2026). Any forward read must state that consensus and price do not yet reflect it, and the release's "accretive to adjusted EPS in the first year" is company language, not an audited number.
- **Comparability break.** Q2 FY26 net sales of $1,471.3m against $963.1m a year earlier (`Q2 FY26 10-Q`) is not organic — the pool shows an Electrical Products Group acquisition inside Systems Protection. Growth decomposition must separate acquired from organic revenue rather than quote the headline change.

---

## 6. Sufficiency Verdict

- **Verdict: Sufficient**
- **Reason:** The pool carries full-year financials (FY2024 audited 10-K plus FY2025 annual columns in the Capital IQ Financials export), the latest quarterly filing (Q2 FY26 10-Q, quarter ended 30-Jun-2026, 2.2 months old) AND two verbatim earnings-call transcripts, with income statement, balance sheet and cash flow statement all available from filings and independently from the vendor export — every element of the sufficiency rule is met, with 0 extraction failures across 15 sources and 20 tabs.
- **Active partial-data caps:** None. No MODULE_RULES.md score cap binds.
- **Critical missing items:** None that block the module. The one gap worth naming is the absence of the **FY2025 Form 10-K** — FY2025 full-year figures must be cited to the Capital IQ export as tier-5 vendor data, and FY2025 audited notes, MD&A and auditor's report are not in the pool.



---

## earnings / 01_historical-financials.md

_Source: `01_historical-financials.md`_

# Historical Financials — NVT

**Company:** nVent Electric plc (NYSE: NVT). **Jurisdiction/regime:** US SEC domestic filer (Irish-incorporated). **Reporting standard:** US GAAP. **Currency: USD, in millions except per-share.** **Fiscal year ends 31 December.** [Triage §0]

**Evidence binding:** frozen generation `6db32848…1aecd1e6`. Live `data/NVT/` was not read; `data/NVT/…` is a citation label only.

### Definitions used in this report (CLAUDE.md §15)

- **EBITDA** = operating income + depreciation and amortisation, continuing operations. Plain meaning: operating profit before the non-cash charges for wearing out assets and writing down acquired intangibles. nVent does **not** report a GAAP EBITDA; this row is computed by this agent from company-sourced components, and the company's own *adjusted* EBITDA is shown separately in §4.
- **EBIT** = operating income as reported on the face of the income statement, continuing operations. Plain meaning: profit from running the business, before interest and tax.
- **EPS (diluted)** = diluted earnings per ordinary share. Two series are shown: **total** (includes the divested Thermal Management business reported in discontinued operations) and **continuing operations only**. They are not interchangeable.
- **FCF** = CFO − total capex (§15 default). The company defines free cash flow differently — operating cash flow of continuing operations − capex **+ proceeds from sale of property and equipment** [15] — so both are shown and labelled where they differ.
- **Net debt (strict, §15)** = total debt − cash and cash equivalents. "Total debt" here is the figure from the company's **own debt note**, which lists only the revolving facility, term loans and senior notes (net of issuance costs) — **no lease liabilities** [5][12]. See the net-debt basis note under §1.
- **Working capital** = total current assets − total current liabilities, as reported.
- **Basis points (bps)** = hundredths of a percentage point; 100bps = 1.0 percentage point.

### Two basis breaks that govern every table below — read first

1. **Thermal Management was divested.** nVent agreed to sell Thermal Management on 31-Jul-2024 and closed on 30-Jan-2025 for $1.65bn of cash proceeds. Its results are shown as **discontinued operations for all periods presented in the FY24 10-K, i.e. FY2022–FY2024** [4]. The FY2021 column was **never restated** in this pool: Capital IQ's FY2021 revenue of $2,462.0m still includes Thermal Management, whereas FY2022 onwards do not [17]. **FY2021 is therefore not comparable to FY2022+, and the FY2022 revenue "decline" of −6.8% is an artefact of that basis change, not a real fall.** It is marked "NM" (not meaningful) throughout.
2. **There is no FY2025 Form 10-K in the pool.** FY2025 full-year income-statement and cash-flow figures are cited to the **Capital IQ export (tier-5 vendor data, as of ~12-Aug-2026)** [17][19], never under a filing's name — except FY2025 operating income, net income, revenue and EPS, which the **company's own Q1 FY26 earnings presentation** restates quarter by quarter [13] and which is the better source (§4). The 31-Dec-2025 **balance sheet and debt note are filing-grade**, as the comparative column in the two 10-Qs [10][12].

---

## 1. Annual Financial Table (5 years) — USD millions, US GAAP

| Metric | FY2021 | FY2022 | FY2023 | FY2024 | FY2025 | Trend |
|---|---:|---:|---:|---:|---:|---|
| Revenue | 2,462.0 ᵃ | 2,295.1 | 2,668.9 | 3,006.1 | 3,893.1 ᵛ | Accelerating |
| Revenue YoY % | n/a | NM ᵃ | +16.3% | +12.6% | +29.5% | Accelerating |
| Gross Profit | 941.9 ᵃ | 822.9 | 1,075.2 | 1,209.1 | 1,469.1 ᵛ | Accelerating |
| Gross Margin % | 38.3% ᵃ | 35.9% | 40.3% | 40.2% | 37.7% ᵛ | Volatile |
| — GM change (bps) | n/a | NM ᵃ | +443 | −6 | −249 | Volatile |
| EBITDA (op. income + D&A) | 484.6 ᵃᵛ | 395.4 | 575.9 | 673.1 | 824.6 | Accelerating |
| EBITDA Margin % | 19.7% ᵃ | 17.2% | 21.6% | 22.4% | 21.2% | Volatile |
| — EBITDA margin change (bps) | n/a | NM ᵃ | +435 | +81 | −121 | Volatile |
| EBIT (operating income, reported) | 376.2 ᵃᵛ | 309.0 | 462.7 | 527.1 | 616.8 | Accelerating |
| EBIT Margin % | 15.3% ᵃ | 13.5% | 17.3% | 17.5% | 15.8% | Volatile |
| — EBIT margin change (bps) | n/a | NM ᵃ | +387 | +20 | −169 | Volatile |
| EPS (diluted, **total** incl. disc. ops) | 1.61 ᵃᵛ | 2.38 | 3.37 | 1.97 | 4.31 ᵛ | Volatile |
| EPS (diluted, **continuing ops only**) | n/a | 1.74 | 2.73 | 1.43 | 2.60 | Volatile |
| CFO (continuing operations) | 373.3 ᵃᵛ | 273.3 | 422.2 | 501.0 | 649.0 ᵛᵈ | Accelerating |
| Capex (continuing operations) | 39.5 ᵃᵛ | 40.5 | 65.6 | 74.0 | 93.3 ᵛ | Accelerating |
| FCF (CFO − capex) | 333.8 ᵃ | 232.8 | 356.6 | 427.0 | 555.7 | Accelerating |
| Working Capital (CA − CL, reported) | 275.2 ᵃᵛ | 579.7 ᵛ | 602.5 ᵛʰ | 587.7 ᵛʰ | 636.1 ᵛ | Stable |
| **Net Debt — strict basis** | 949.7 ᵛᵖ | 785.7 ᵛᵖ | 1,601.1 | 2,023.8 | 1,322.3 | Volatile |
| **Net Debt / EBITDA — strict basis** | 1.96x ᵃᵛᵖ | 1.99x ᵛᵖ | 2.78x | 3.01x | 1.60x | Volatile |

**Footnote keys.** ᵃ = FY2021 is on the pre-divestiture basis (includes Thermal Management) and is **not comparable** to FY2022+ — see basis break 1. ᵛ = Capital IQ export, tier-5 vendor data, as of ~12-Aug-2026 (no FY2025 10-K exists in this pool). ᵈ = FY2025 CFO derived: reported total CFO $465.2m **plus** the $183.8m operating cash *outflow* of discontinued operations that Capital IQ itemises inside it = **$649.0m** continuing-operations CFO [19]. The $183.8m outflow is consistent with cash taxes paid rising to $283.3m in FY2025 on the Thermal Management disposal gain [19]. ʰ = FY2023/FY2024 working capital includes assets and liabilities held for sale (current assets held for sale $253.6m / $300.8m; current liabilities held for sale $114.7m / $122.5m) [2]; excluding them, working capital was **$463.6m (FY2023)** and **$409.4m (FY2024)**, so the "Stable" trend is on the reported basis and the underlying ex-held-for-sale build in FY2025 is larger than the reported row suggests. ᵖ = FY2021/FY2022 total debt is built from Capital IQ's own balance-sheet split (long-term debt + current maturities, with lease liabilities listed on separate lines) — **composition inferred from the vendor line split, not confirmed against a filing debt note**, because no FY2021/FY2022 10-K is in this pool.

### Net-debt basis note (CLAUDE.md §15, WORKFLOW step 7) — required reading for every Net Debt figure in this report

- **FY2023, FY2024, FY2025 and 30-Jun-2026 net debt is "strict" without qualification.** For those four dates the total-debt figure comes from the company's **own debt note**, which itemises only the revolving credit facility, term loans and senior notes net of unamortised issuance costs — **it contains no lease liabilities** [5][12]. FY2023 $1,780.7m and FY2024 $2,155.0m [5]; FY2025 $1,559.8m and 30-Jun-2026 $1,492.4m [12]. Composition is therefore confirmed clean of operating leases, and the label is used unqualified.
- **FY2021 and FY2022 net debt is "strict basis (vendor total-debt figure; composition unconfirmed against the filing debt note)."** No FY2021/FY2022 filing debt note is in this pool.
- **This report's net debt deliberately differs from the Capital IQ "Net Debt" field, and the gap is fully explained.** `ciq_facts.json` reports net debt of **$1,376.9m** at 30-Jun-2026 on total debt of $1,632.9m. That vendor total-debt figure **folds in lease liabilities**: $1,492.4m debt-note total + $33.0m current lease liabilities + $107.5m long-term lease liabilities = **$1,632.9m exactly** [18]. Net of $256.0m cash: $1,376.9m — reconciled to the cent. This is a definitional difference, not a misread of the workbook: this report keeps the strict, lease-free basis the doctrine defaults to, and the vendor's $1,376.9m is the same balance sheet with leases added to debt.
- **Downstream note:** net debt here is a supporting line for the trend and TTM tables. The `balance-sheet-survival` module builds the canonical, filing-verified net-debt figure directly from the debt note; the two are not guaranteed to match, and this module's figure must never be quoted as if it carried that module's verification.

### Reconciliation: why this table's EBIT differs from the Capital IQ EBIT series (§5 — adjudicating the number that disagrees)

Capital IQ's Income Statement reports EBIT of 376.2 / 370.9 / 448.3 / 529.6 / 632.7 for FY2021–FY2025, against the reported operating income of 376.2 / 309.0 / 462.7 / 527.1 / 616.8 used above [17][1][13]. The whole difference is two reclassifications, and each ties exactly:

- Capital IQ moves **restructuring charges out of SG&A**: FY2022 $3.4m, FY2023 $3.9m, FY2024 $7.0m.
- Capital IQ moves **non-operating pension income/expense into SG&A**: FY2022 −$58.5m (income), FY2023 +$18.3m (expense), FY2024 +$4.5m.
- Check FY2022: reported SG&A $468.3m − $58.5m − $3.4m = **$406.4m** = Capital IQ SG&A [1][17]. Check FY2023: $557.3m + $18.3m − $3.9m = **$571.7m** [1][17]. Both tie.

**Why this matters and is not cosmetic.** The reported FY2022 EBIT margin of 13.5% is depressed by roughly 250bps purely because a $58.5m pension *income* item sits below operating income in the filing but inside Capital IQ's operating line. A reader using Capital IQ's series sees FY2022→FY2023 EBIT margin move from 16.2% to 16.8% (+63bps); the filing basis shows 13.5% → 17.3% (+387bps). **The FY2023 margin step-up is real but is materially smaller than the filing-basis row alone implies.** Downstream agents must not read the +387bps as an operating inflection without netting out this classification effect.

---

## 2. TTM Snapshot — twelve months ended 30-Jun-2026 vs twelve months ended 30-Jun-2025

Built from actual reported quarters (Q3 FY25 + Q4 FY25 + Q1 FY26 + Q2 FY26 vs Q3 FY24 + Q4 FY24 + Q1 FY25 + Q2 FY25), not estimated.

| Metric | Latest TTM (to 30-Jun-26) | Prior TTM (to 30-Jun-25) | Change | Evidence |
|---|---:|---:|---:|---|
| Revenue | 4,834.0 | 3,306.6 | +46.2% | Quarterly actuals [20]; latest TTM ties exactly to Capital IQ LTM revenue of 4,834.0 [17] and to FY2025 3,893.1 − H1'25 1,772.4 + H1'26 2,713.3 [9][13] |
| Adjusted EBITDA (company non-GAAP) | 1,061.5 | 739.9 | +43.5% | Sum of quarterly adjusted EBITDA [13][20]; FY2025 quarters 176.0 / 214.4 / 230.1 / 226.0 confirmed against the company's own reconciliation [13] |
| — Adjusted EBITDA margin | 21.96% | 22.38% | −42bps | Computed |
| Adjusted operating income (company non-GAAP) | 994.8 | 688.9 | +44.4% | [13][20]; Q2 FY26 $323m confirmed in prepared remarks [16] |
| EPS diluted — **total, GAAP** | 3.66 | 3.51 | +4.3% | [20][6][9]; ties to Capital IQ LTM diluted EPS 3.65 (rounding) [17]. **Distorted**: the prior TTM contains Q1 FY25 GAAP EPS of $2.16, of which $1.64 was discontinued operations (the Thermal Management disposal gain) [6] |
| EPS diluted — **adjusted, continuing ops** | 4.35 | 2.75 | +58.2% | [13][20]; Q2 FY26 $1.45 confirmed in prepared remarks [16] |
| CFO (continuing operations) | 772.8 | Not derivable | n/a | FY2025 continuing CFO 649.0 [19] − H1'25 154.9 [11] + H1'26 278.7 [11]. Prior TTM needs H1 FY24 cash flow; the Q2 FY25 10-Q is **not in this pool** |
| Capex | 112.9 | Not derivable | n/a | FY2025 93.3 [19] − H1'25 38.0 + H1'26 57.6 [11]. **Cross-check: ties exactly to Capital IQ LTM capex of 112.9** [19] |
| FCF (CFO − capex, §15) | 659.9 | Not derivable | n/a | 772.8 − 112.9. Cash conversion 62.2% of adjusted EBITDA |
| **Net debt at 30-Jun-2026 (point-in-time)** | **1,236.4 — strict basis** | 1,322.3 at 31-Dec-2025 — strict basis | −85.9 | Total debt 1,492.4 [12] − cash 256.0 [10]. Composition confirmed clean of operating leases against the filing debt note [12] |
| **Net debt / TTM adjusted EBITDA** | **1.16x — strict basis** | — | — | 1,236.4 ÷ 1,061.5. On Capital IQ's LTM EBITDA of 1,074.6 the same strict net debt gives **1.15x** [21] |

**Note:** Net debt is a point-in-time balance-sheet metric, not a TTM flow metric. The "Prior TTM" cell for net debt is the 31-Dec-2025 balance, labelled as such, because a 30-Jun-2025 balance sheet is not in this pool.

**Reconciliation to `ciq_facts.json` (required):** the sidecar reports net debt $1,376.9m and net debt / LTM EBITDA **1.28x**. This report's 1.16x is the same balance sheet on the strict, lease-free debt basis and against the company's own adjusted EBITDA. Both differences are itemised: $140.5m of lease liabilities on the debt side (see §1 basis note) and $13.1m between the company's adjusted EBITDA ($1,061.5m) and Capital IQ's LTM EBITDA ($1,074.6m). No figure is overridden; the vendor read is accepted as an accurate read of the workbook.

**Company-defined FCF differs.** nVent's own free-cash-flow measure adds back proceeds from the sale of property and equipment [15]. For H1 FY26 the two coincide ($278.7m − $57.6m = $221.1m, with nil property proceeds) [11]; for H1 FY25 the company measure is $1.6m higher. The difference is immaterial at these levels but is stated so the two are never mixed.

---

## 3. Latest Quarterly Trend Table (8 quarters) — USD millions

| Metric | Q3 FY24 | Q4 FY24 | Q1 FY25 | Q2 FY25 | Q3 FY25 | Q4 FY25 | Q1 FY26 | Q2 FY26 | QoQ Trend | YoY vs Same Q |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---|---|
| Revenue | 782.0 | 752.2 | 809.3 | 963.1 | 1,054.0 | 1,066.7 | 1,242.0 | 1,471.3 | Accelerating (+18.5% QoQ in Q2 FY26) | Accelerating: +34.8%, +41.8%, +53.5%, **+52.8%** |
| Gross Margin % | N/A | N/A | 38.8% | 38.6% | N/A | N/A | 35.9% | 37.9% | Volatile | Decelerating: Q2 FY26 37.9% vs Q2 FY25 38.6%, **−70bps** |
| Adjusted EBITDA (company non-GAAP) | 177.7 | 171.8 | 176.0 | 214.4 | 230.1 | 226.0 | 267.3 | 338.1 | Accelerating | Accelerating: +29.6%, +31.6%, +51.9%, **+57.7%** |
| Adjusted EBITDA Margin % | 22.7% | 22.8% | 21.8% | 22.3% | 21.8% | 21.2% | 21.5% | 23.0% | Inflecting (up 146bps QoQ in Q2 FY26) | Inflecting: −89bps, −165bps, −23bps, **+72bps** |
| EPS diluted — total, GAAP | 0.62 | 0.06 | **2.16** ᵍ | 0.67 | 0.74 | 0.73 | 0.87 | 1.32 | Accelerating | Accelerating (ex-gain): +19.4%, n/m ᵍ, +31.8%, **+97.0%** |
| EPS diluted — adjusted, continuing | 0.63 | 0.59 | 0.67 | 0.86 | 0.91 | 0.90 | 1.09 | 1.45 | Accelerating | Accelerating: +44.4%, +52.5%, +62.7%, **+68.6%** |

ᵍ Q1 FY25 GAAP diluted EPS of $2.16 includes **$1.64 from discontinued operations** — the gain on the Thermal Management disposal that closed 30-Jan-2025 [6]. Continuing-operations diluted EPS that quarter was **$0.52** [13]. Any YoY comparison against Q1 FY25 on the total GAAP line is meaningless; the adjusted continuing-operations line is the comparable series.

**Basis check on the two FY2024 quarters (done, and it passes).** Q3 FY24 $782.0m + Q4 FY24 $752.2m = $1,534.2m; FY2024 continuing-operations revenue was $3,006.1m [1], implying H1 FY24 continuing revenue of $1,471.9m. That leaves $283.0m of Thermal Management revenue in H1 FY24 against a full-year Thermal figure of $622.7m [4] — i.e. Thermal's H2 sales are absent from the Q3/Q4 FY24 columns, which is exactly what a continuing-operations presentation should show. **Q3 FY24 and Q4 FY24 are therefore on the same continuing-operations basis as every later quarter and the table is basis-consistent.** (The Q1 FY24 and Q2 FY24 columns in the same vendor export — $874.6m and $880.3m — are **not**; they are as-then-reported and include Thermal Management, so they are deliberately excluded from this table.)

**FY2025 quarters tie exactly to the full year:** 809.3 + 963.1 + 1,054.0 + 1,066.7 = **3,893.1** = FY2025 revenue [13][17].

**Gross margin is only available for four of the eight quarters.** Q1/Q2 FY25 and Q1/Q2 FY26 come from the two 10-Qs [6][9]. Q3 FY24, Q4 FY24, Q3 FY25 and Q4 FY25 gross profit is not disclosed anywhere in this pool — the Q1 FY26 deck's quarterly reconciliation starts at operating income [13], and no Q3/Q4 filing is present. Marked **N/A**, not estimated.

**Adjusted EBITDA is the company's own non-GAAP measure, and it is not the same as the GAAP-derived EBITDA in §1.** For Q1 FY26 the company reports adjusted EBITDA of $265.3m [14] against a GAAP-derived figure (operating income $195.7m + D&A $57.9m) of **$253.6m** [6] — an $11.7m gap from restructuring and acquisition costs. For Q2 FY26 the GAAP-derived figure is $359.2m (operating income $300.7m + D&A $58.5m) [9][11] against the vendor's adjusted $338.1m [20]; the two definitions treat intangible amortisation and one-off costs differently and must not be compared with each other. The row above is one consistent basis (company adjusted) across all eight quarters. FY2025's four quarters are confirmed against the company's own reconciliation [13]; Q3/Q4 FY24 and Q2 FY26 are vendor-sourced on that same stated basis [20], with Q2 FY26 adjusted operating income of $323m independently confirmed in the earnings call [16].

---

## 4. Reported vs Adjusted Metrics

The company **does** disclose adjusted metrics and gives a line-by-line reconciliation. Its definition: adjusted operating income excludes intangible amortisation, acquisition-related expenses, restructuring costs, impairments and other unusual non-operating items; adjusted EBITDA = adjusted operating income + depreciation; return on sales (ROS) = adjusted operating income ÷ net sales [13].

**FY2025 (full year, USD m):**

| Metric | Reported Value | Adjusted Value | Adjustment Amount | Adjustment Reason | Evidence |
|---|---:|---:|---:|---|---|
| Operating income | 616.8 | 785.8 | +169.0 | Intangible amortisation 147.1; acquisition transaction & integration 14.4; restructuring & other 7.5 | [13] |
| EBITDA | 824.6 (= 616.8 + D&A 207.8) | 846.5 | +21.9 | Acquisition costs 14.4 + restructuring 7.5. Intangible amortisation is *not* an add-back here because it is already outside adjusted operating income | [13][19] |
| EPS (diluted, continuing) | 2.60 | 3.35 | +0.75 | Operating adjustments +169.0, pension mark-to-market gain −12.9, tax on adjustments −33.8 | [13] |
| ROS | 15.8% | 20.2% | +438bps | Same adjustments as operating income | [13] |

**Q1 FY26 and Q2 FY26 (USD m):**

| Metric | Q1 FY26 Reported | Q1 FY26 Adjusted | Q2 FY26 Reported | Q2 FY26 Adjusted | Adjustment Reason | Evidence |
|---|---:|---:|---:|---:|---|---|
| Operating income | 195.7 | 248.5 | 300.7 | 322.7 (company: "$323 million") | Q1: intangible amortisation 41.1, restructuring & other 8.9, acquisition costs 2.8 (= +52.8) | [6][14][9][16] |
| EBITDA | 253.6 | 265.3 | 359.2 | 338.1 ᵛ | Definitions differ — see §3 note | [6][14][9][11][20] |
| EPS (diluted, continuing) | 0.86 | 1.09 | 1.32 | 1.45 | Operating adjustments net of tax | [6][14][9][16] |
| ROS | 15.8% | 20.0% | 20.4% | 21.9% | Same adjustments | [6][14][9][16] |

ᵛ Q2 FY26 adjusted EBITDA is vendor-sourced [20]; the company's Q2 reconciliation slide is not in this pool (no Q2 FY26 earnings deck exists here — the latest deck is Q1 FY26).

**The size of the adjustment is itself the finding.** In FY2025 adjusted diluted EPS of $3.35 is **29% above** reported continuing-operations EPS of $2.60, and $147.1m of the $169.0m operating add-back — 87% of it — is **intangible amortisation from acquisitions** [13]. That is a recurring, acquisition-driven charge, not a one-off. Reported and adjusted are labelled separately everywhere in this report and are never mixed. Assessing whether the adjustments are legitimate is the `earnings-quality` agent's job, not this one's.

---

## 5. Quarterly Seasonality Table (last 3 fiscal years)

*Insufficient quarterly history for seasonality analysis.*

The pool does not contain three complete fiscal years of quarterly revenue on a consistent continuing-operations basis. FY2025 is complete and ties exactly to the full year (four quarters summing to $3,893.1m) [13]. FY2026 has only two reported quarters. FY2024 has only its **second half** on the continuing-operations basis — the Q1 FY24 and Q2 FY24 vendor columns still include Thermal Management (see §3 basis check), and no restated FY2024 quarterly split exists in this pool. Building a four-quarter FY2024 share row would require estimating the Thermal split, which the seasonality rule forbids.

**What the actual data does support, at half-year granularity:**

| Period | H1 revenue share | H2 revenue share | Evidence |
|---|---:|---:|---|
| FY2024 (continuing ops) | 49.0% ($1,471.9m, derived) | 51.0% ($1,534.2m) | FY2024 total $3,006.1m [1] less Q3 $782.0m and Q4 $752.2m [20] |
| FY2025 | 45.5% ($1,772.4m) | 54.5% ($2,120.7m) | [9][13] |

| FY2025 quarter | Revenue | Share of FY2025 | Adjusted EBITDA margin |
|---|---:|---:|---:|
| Q1 FY25 | 809.3 | 20.8% | 21.8% |
| Q2 FY25 | 963.1 | 24.7% | 22.3% |
| Q3 FY25 | 1,054.0 | 27.1% | 21.8% |
| Q4 FY25 | 1,066.7 | 27.4% | 21.2% |

**No quarter crosses the >30% or <20% flag** on the one complete year available. On this single year the shape is a mild H2 weighting (54.5% of revenue), but **one year is not a seasonality pattern**, and the FY2025 H2 skew is confounded by the Electrical Products Group acquisition landing mid-year — acquisitions contributed 17.0 percentage points of the 53.5% Q1 FY26 revenue growth [13], so part of the apparent H2 lift is acquired volume arriving, not a seasonal rhythm. Treat seasonality as **Not proven from available data** and do not let any downstream agent build a quarterly phasing assumption on it.

---

## 6. Key Trend Summary

**Revenue growth is Accelerating, and sharply.** Continuing-operations revenue rose +16.3% in FY2023, +12.6% in FY2024, +29.5% in FY2025, and the trailing twelve months to 30-Jun-2026 is running **+46.2%** at $4,834.0m against $3,306.6m a year earlier [1][17][20]. Quarterly YoY growth has climbed through +34.8%, +41.8%, +53.5% and +52.8% over the last four quarters. **This is not all organic**: the company's own reconciliation splits Q1 FY26's 53.5% into 34.4pp organic, 2.1pp currency and **17.0pp acquisitions** [13], and the Q2 FY26 10-Q's own comparison of $1,471.3m against $963.1m carries the same acquisition effect. The revenue-drivers agent must decompose this rather than quote the headline.

**Margins are Volatile at the gross line and Inflecting upward at the EBITDA line.** Gross margin has moved 35.9% → 40.3% → 40.2% → 37.7% over FY2022–FY2025, a 249bps fall in the latest full year, and Q2 FY26 gross margin of 37.9% is 70bps below Q2 FY25 [9][17]. But adjusted EBITDA margin went the other way in the most recent quarter: after four quarters of YoY compression (−89bps, −165bps, −23bps) it turned **+72bps YoY and +146bps QoQ in Q2 FY26**, to 23.0% — the highest of the eight quarters shown. **These two series disagree, and the disagreement is the point:** gross margin is still down YoY while operating leverage below the gross line is more than offsetting it. The 10-Q attributes 460bps of the Q2 SG&A ratio improvement to that leverage and flags roughly $25m of tariff reimbursements inside gross profit [9] — a one-off help that the margin-drivers agent must size before treating the Q2 gross margin as run-rate.

**Seasonality: not proven.** Only one complete fiscal year of consistent-basis quarterly revenue exists (FY2025, H2-weighted at 54.5%), and that skew is confounded by a mid-year acquisition. No quarter breaches the >30% / <20% flag.

**Two clear inflection points in the last five years.** First, the **Thermal Management divestiture** (agreed 31-Jul-2024, closed 30-Jan-2025 for $1.65bn) [4] — it re-based every historical line, put $1.64 of one-off gain into Q1 FY25 GAAP EPS, drove a $183.8m operating cash *outflow* in FY2025 discontinued operations (largely disposal taxes), and funded the balance sheet repair. Second, the **acquisition programme**: $1,120.1m spent in FY2023 (ECM Industries), $677.7m in FY2024 (Trachte) and $975.7m in FY2025 (Electrical Products Group) [3][19]. Together these took strict net debt / EBITDA from 1.99x (FY2022) to **3.01x (FY2024)**, then the disposal proceeds and $873.3m of FY2025 debt repayment [19] pulled it back to **1.60x (FY2025)** and **1.16x at 30-Jun-2026** — all on the strict, lease-free basis confirmed against the filing debt note [5][12]. A third event sits outside every number above: the **Maverick Power acquisition announced 24-Aug-2026**, after the Q2 10-Q and after every price and consensus mark in this pool.

**Data limitations carried forward.** No FY2025 Form 10-K (FY2025 income-statement and cash-flow lines are vendor or company-deck sourced, never cited to a filing); no Q3/Q4 FY25 or Q3/Q4 FY24 filings (so four of eight quarterly gross-margin cells are N/A and prior-TTM cash flow is not derivable); FY2021 is on a pre-divestiture basis and is not comparable to later years.

---

## 7. Citations

All documents are in the frozen extract generation `6db32848…1aecd1e6`, cited under the logical label `data/NVT/`.

[1] FY24 10-K (nVent Electric plc, Form 10-K, fiscal year ended 31-Dec-2024), Consolidated Statements of Operations and Comprehensive Income, p.40 — `data/NVT/nVent Electric plc, 2025.pdf`
[2] FY24 10-K, Consolidated Balance Sheets, p.41
[3] FY24 10-K, Consolidated Statements of Cash Flows, p.42
[4] FY24 10-K, Note 6 (Discontinued Operations), p.55–56
[5] FY24 10-K, Note 10 (Debt)
[6] Q1 FY26 10-Q (quarter ended 31-Mar-2026, signed 1-May-2026), Condensed Consolidated Statements of Income and Comprehensive Income, p.3 — `data/NVT/nVent Electric plc, Q1 2026.pdf`
[7] Q1 FY26 10-Q, Condensed Consolidated Balance Sheets and Statements of Cash Flows, p.4–5
[8] Q1 FY26 10-Q, Note 10 (Debt)
[9] Q2 FY26 10-Q (quarter and six months ended 30-Jun-2026), Condensed Consolidated Statements of Income and Comprehensive Income, p.3, and MD&A "Results of Operations" — `data/NVT/nVent Electric plc, Q2 2026.pdf`
[10] Q2 FY26 10-Q, Condensed Consolidated Balance Sheets, p.4
[11] Q2 FY26 10-Q, Condensed Consolidated Statements of Cash Flows, p.5
[12] Q2 FY26 10-Q, Note 10 (Debt)
[13] Q1 FY26 earnings presentation, 1-May-2026, "Reported to Adjusted 2025 Reconciliation", slide 16 — `data/NVT/nVent Electric plc, Q1 2026 ppt.pdf`
[14] Q1 FY26 earnings presentation, 1-May-2026, "Reported to Adjusted 2026 Reconciliation", slide 15
[15] Q1 FY26 earnings presentation, 1-May-2026, "Organic Sales Growth and Free Cash Flow Reconciliation", slide 17
[16] Q2 FY26 earnings call transcript (S&P Global Market Intelligence, verbatim), 31-Jul-2026, prepared remarks — `data/NVT/nVent Electric plc, Q2 2026 Earnings Call, Jul 31, 2026.pdf`
[17] Capital IQ Financials export → Income Statement tab, annual FY2021–FY2025 + LTM 12 months Jun-30-2026; vendor data as of ~12-Aug-2026 — `data/NVT/nVent Electric plc NYSE NVT Financials.xls`
[18] Capital IQ Financials export → Balance Sheet tab, same workbook and as-of date
[19] Capital IQ Financials export → Cash Flow tab, same workbook and as-of date
[20] Capital IQ Estimates export → Surprise tab, quarterly actuals FQ3 2024 – FQ2 2026; vendor data as of ~Aug-2026 — `data/NVT/nVentElectricplcNYSENVTEstimatesReport.xls`
[21] `ciq_facts.json` deterministic facts sidecar, frozen generation `6db32848…1aecd1e6` (net debt $1,376.9m, total debt $1,632.9m, LTM EBITDA $1,074.6m, net debt/EBITDA 1.28x — all on Capital IQ's lease-inclusive vendor basis; reconciled in §1 and §2)

---

### Calculation provenance (fix F09)

Every growth rate, margin, basis-point delta, TTM aggregate, FCF figure and leverage ratio in this report was produced by an executed Python snippet, not mental arithmetic. Two spot-checks reproduced here:

- **FY2025 revenue YoY:** `(3893.1 − 3006.1) / 3006.1 × 100 = 29.5%`.
- **Q2 FY26 adjusted EBITDA margin YoY delta:** `(338.1/1471.3 − 214.4/963.1) × 10000 = +72bps` (22.98% vs 22.26%).
- **Independent ties confirming the series are internally consistent:** FY2025 quarterly revenue sums to $3,893.1m exactly (= the full year); TTM revenue of $4,834.0m equals Capital IQ's LTM column exactly; TTM capex of $112.9m built from FY2025 $93.3m − H1'25 $38.0m + H1'26 $57.6m equals Capital IQ's LTM capex exactly; and Capital IQ's net debt of $1,376.9m equals strict debt $1,492.4m + leases $140.5m − cash $256.0m exactly.



---

## earnings / 02_revenue-drivers.md

_Source: `02_revenue-drivers.md`_

# Revenue Drivers — NVT

**Company:** nVent Electric plc (NYSE: NVT). **Regime:** US SEC domestic filer (Irish-incorporated, London head office) — Form 10-K / 10-Q, **US GAAP**, reporting currency **USD in millions**, fiscal year ends 31 December [`FY24 10-K, cover page`; `Q2 FY26 10-Q, cover page`]. No FX conversion is performed anywhere in this report.

**Evidence binding:** frozen generation `6db32848…1aecd1e6`. Live `data/NVT/` was not read; `data/NVT/…` is a citation label only.

**Upstream baseline:** `analyses/NVT_2026-09-07/earnings/01_historical-financials.md` — TTM revenue to 30-Jun-2026 **$4,834.0m, +46.2%** on the prior TTM of $3,306.6m. That agent's own instruction to this one is followed here: *"This is not all organic … the revenue-drivers agent must decompose this rather than quote the headline."*

**Plain-English terms used below.** *Organic growth* = the change in sales excluding businesses bought or sold and excluding currency translation — the underlying demand number. *Acquisition contribution* = sales from a business owned this year but not in the year-ago period. *Currency / FX translation* = the effect of converting foreign sales into US dollars at different exchange rates, with no change in the goods sold. *Backlog* = orders received but not yet delivered as sales. *Book-to-bill* = orders taken divided by sales delivered; above 1.0x the order book is growing, below 1.0x it is shrinking. *pp* = percentage point.

---

## 1. Segment Decomposition Status

**Segment decomposition applied — 2 segments from the business-model module** (`analyses/NVT_2026-09-07/business-model/03_segment-map.md`, read in full).

The two reportable segments are **Systems Protection** (72.5% of H1 FY26 sales) and **Electrical Connections** (27.5%) [`Q2 FY26 10-Q, Note 13 (Segment information), p.20`]. This is **not** a single-segment business by the >85% test, and the segment note discloses net sales, cost of goods sold, SG&A, R&D and segment income by segment, so no consolidated-only limitation applies.

Two disclosure limits carry into everything below and are stated once here:

- **The reportable segments are not the driver.** The thing moving this company — data centres — is a *vertical* that cuts across both segments, and it is not a reportable line. It is visible only through the **infrastructure** vertical, which also contains power utilities and other non-data-centre work [`Q2 FY26 10-Q, Note 2 (Revenue), p.9`]. Management sizes data-centre sales at "more than $2 billion in 2026, more than double last year's sales" [`Q2 FY26 transcript (S&P Global, verbatim), 31-Jul-2026, prepared remarks`] — a transcript figure with no filed equivalent.
- **No FY2025 Form 10-K is in the pool**, so there is no audited FY2025 segment note. FY2025 segment figures are Capital IQ vendor data (tier 5). The H1 FY26 segment note is a filing but **unaudited** [`analyses/NVT_2026-09-07/earnings/00_earnings-data-triage.md`, §5].

---

## 2. Revenue Driver Tree

| Business Type | Revenue Formula |
|---|---|
| Manufacturer / producer | Volume × realized price |
| Subscription | Customers × ARPU / price |
| Retail | Store count × sales per store |
| Lender | Loan book × yield + fees |
| Asset manager | AUM × fee rate |
| Marketplace | GMV × take rate |
| Commodity producer | Production × realized commodity price |
| **Multi-segment (applies to NVT)** | **Sum of segment revenue drivers** |

NVT is a **two-segment electrical-equipment manufacturer with two different revenue rhythms inside it**: a long-cycle, project-and-backlog business (infrastructure, chiefly data centres and power utilities, sitting mostly in Systems Protection) and a short-cycle, distribution-fed business (commercial & residential and industrial, sitting mostly in Electrical Connections). The sector overlay that fits is capital goods / electrical equipment, so the required key measures are **order intake, backlog, book-to-bill, capacity and content per project** — not subscription or per-unit-price measures. Those are checked in §4; where the company does not disclose one at segment level, it is marked Not disclosed rather than estimated.

**NVT's revenue formula, in one line:**

> **Group revenue = [long-cycle infrastructure orders converted out of a $2.5bn backlog at whatever capacity is open × content per site] + [short-cycle industrial and commercial/residential volume pulled through distributors] + selective price increases taken to offset inflation + acquired revenue (Electrical Products Group through April 2026; Maverick Power from Q4 2026 if it closes) + FX translation.**

Backlog is disclosed at **group level only, and only on an earnings call** — $2.6bn at 31-Mar-2026, $2.5bn at 30-Jun-2026 [`Q1 FY26 transcript (FactSet Corrected Transcript), 1-May-2026, prepared remarks`; `Q2 FY26 transcript, 31-Jul-2026, prepared remarks`]. There is **no backlog, order-intake or book-to-bill figure by segment anywhere in this pool**, and none in any filing. For a business whose growth now runs through lumpy long-cycle project orders, that is the single largest disclosure gap in this section.

---

## 3. Market / Share / Price / Mix Split

Reference period: **Q2 FY26 (three months ended 30-Jun-2026) vs Q2 FY25**, the latest reported quarter. Total reported revenue growth **+52.8%** ($1,471.3m vs $963.1m) [`Q2 FY26 10-Q, Condensed Consolidated Statements of Income, p.3`].

| Driver Bucket | Current Direction | Evidence | Importance /100 |
|---|---|---|---:|
| **End-market demand** — AI data-centre and power-utility capital spending inside the infrastructure vertical | **Improving, sharply, but the leading indicator has stopped improving** | Infrastructure sales $882.5m vs $409.3m = +$473.2m, which is **49.1pp of the 52.8pp total growth (93.1% of every dollar added)** [`Q2 FY26 10-Q, Note 2, p.9`, arithmetic shown in §6a]. Against that: organic orders decelerated from "approximately 40%" in Q1 FY26 to "low double digits" in Q2, and backlog fell from $2.6bn to $2.5bn [`Q1 FY26 transcript, prepared remarks`; `Q2 FY26 transcript, prepared remarks`] | **95** |
| **Company market share / content per project** | **Improving on management's own metric; not independently verifiable** | "New products contributed over 30 points to our sales growth, and we launched 14 new products in the quarter" [`Q2 FY26 transcript, prepared remarks`] — up from "over 20 points" and 11 launches in Q1 [`Q1 FY26 transcript, prepared remarks`]. **The basis of "30 points" is not defined anywhere in this pool** and it overlaps the vertical attribution (a new liquid-cooling product sold to a data centre is counted in both), so it is NOT added into the §6 bridge. Third-party share data: none in this pool | **70** |
| **Price / realization** | **Positive but small, and not separately disclosed — it is an inflation offset, not a growth engine** | The 10-Q says organic growth "includes selective increases in selling prices" without sizing it [`Q2 FY26 10-Q, MD&A, p.27`]. The CFO frames price as defence: "Price plus productivity offset inflation of more than $50 million, including more than $30 million in tariff impact" [`Q2 FY26 transcript, prepared remarks`], and for Q3, "Pricing is expected to offset the impact of inflation, including tariffs" [same]. Upper bound derived in §6a | **30** |
| **Product / customer / geography mix** | **Shifting hard toward one vertical, one segment and one region** | Infrastructure went from 42.5% (409.3/963.1) to **60.0%** (882.5/1,471.3) of quarterly sales in one year [`Q2 FY26 10-Q, Note 2, p.9`]. Americas produced $479.1m of the $508.2m increase = **94.3%** of growth [`Q2 FY26 10-Q, Note 2, p.8`]. Systems Protection produced $440.1m = **86.6%** of it [`Q2 FY26 10-Q, MD&A, p.29`]. Mix does not add revenue by itself; it changes what the next dollar depends on | **45** |
| **FX translation** | **Fading tailwind; management's own guide implies it turns to a small drag in H2** | +2.1pp in Q1 FY26, **+0.5pp in Q2 FY26**, +1.2pp for H1 [`Q1 FY26 10-Q, MD&A, p.25`; `Q2 FY26 10-Q, MD&A, p.27`]. The FY26 guide implies roughly −$16m of non-organic revenue in H2 (arithmetic in §4a) | **15** |
| **M&A / divestitures** | **Contribution collapsing to zero in Q3, then stepping up again in Q4 if Maverick closes** | Electrical Products Group added $51.6m = **5.4pp** in Q2 FY26, down from $137.7m = **17.0pp** in Q1 [`Q2 FY26 10-Q, MD&A, p.27`; `Q1 FY26 10-Q, MD&A, p.25`]. It anniversaried on 1-May-2026 — "Sales from EPG after May 1 became part of our organic growth" [`Q2 FY26 transcript, prepared remarks`]. **Maverick Power**: $1.75bn purchase price plus up to $550m contingent, **estimated 2026 revenues of approximately $700 million**, expected to close in Q4 2026 subject to regulatory approval [`nVent press release "nVent to Acquire Maverick Power", 24-Aug-2026`] | **75** |

**This separation matters and is not decoration.** Of the 52.8pp of Q2 growth, **5.4pp was bought and 0.5pp was currency** — 5.9pp, or 11.2% of the increase, was not underlying demand. The remaining 46.9pp was organic. Nothing in this report describes acquired or currency-translated revenue as organic demand.

**Divestiture, for completeness:** Thermal Management was sold on 30-Jan-2025 for $1.6bn net cash and is a discontinued operation restated across all periods presented [`Q2 FY26 10-Q, Note 1, p.7`; `FY24 10-K, Note 6`]. It therefore does **not** appear as a negative in any growth rate above; FY2021 in the upstream table is the only period on the old basis.

---

## 4. Revenue Driver Table (consolidated)

Magnitude = how much the driver moves **total group revenue** if it changes by a reasonable amount. High = >5% of revenue; Mid = 2–5%; Low = <2%.

| Driver | Current Level | Direction | Magnitude | Evidence |
|---|---|---|---|---|
| **Data-centre demand** (inside infrastructure) | Guided **>$2.0bn of FY2026 sales**, "more than double last year's" (~$1.0bn in 2025) — roughly 37% of the ~$5,372m FY26 guidance midpoint (*derived from a transcript figure over a guidance range — inference, not from filings*) | **Improving** on sales; **Unknown / not confirmed** on forward orders (see backlog row) | **High** — a 20% move is ~$400m, ~7.4% of guided group revenue | `Q2 FY26 transcript, prepared remarks`; guidance range from same |
| **Infrastructure vertical total** (data centres + power utilities) | $882.5m = **60.0% of Q2 FY26 sales**, from 42.5% a year earlier; "nearly 60%" of H1 sales vs 45% in 2025 and 12% at the 2018 spin | **Improving** | **High** — it is 60% of the base and 93.1% of the growth | `Q2 FY26 10-Q, Note 2, p.9`; `Q2 FY26 transcript, prepared remarks` |
| **Order intake / book-to-bill** | Organic orders **"up low double digits"** in Q2 FY26, down from **"approximately 40%"** in Q1 FY26. Q1 book-to-bill ~1.2x (analyst-calculated on the call, not company-disclosed); **implied Q2 book-to-bill ~0.93x** (range 0.86x–1.00x — derivation in §6a) | **Deteriorating** | **High** — orders lead sales for the long-cycle book | `Q1 FY26 transcript, prepared remarks and Q&A (Nicole DeBlase)`; `Q2 FY26 transcript, prepared remarks` |
| **Backlog** | **$2.5bn at 30-Jun-2026**, down from $2.6bn at 31-Mar-2026; "visibility through the year and into 2027" | **Deteriorating** (down sequentially) | **High** — $2.5bn is ~47% of guided FY26 revenue | `Q2 FY26 transcript, prepared remarks`; `Q1 FY26 transcript, prepared remarks`. **Group level only, transcript only — no filed or segment figure exists in this pool** |
| **Capacity (liquid cooling)** | Three Minnesota sites: Anoka, Blaine 1 (opened early 2026, "effectively doubling our capacity", built in ~100 working days), **Blaine 2 announced 31-Jul-2026, opening H1 2027**, "of similar size" | **Improving** — but it is a constraint being relieved, not demand | **Mid** for FY2026 (Blaine 2 adds nothing until H1 2027); **High** for FY2027 | `Q2 FY26 transcript, prepared remarks` |
| **Acquired revenue — Electrical Products Group** | $51.6m = **5.4pp** in Q2 FY26; $189.3m = **10.7pp** for H1; anniversaried 1-May-2026 | **Deteriorating to zero** — contributes ~0 from Q3 FY26 | **Mid** in FY2026 (10.7pp of H1 growth), **Low** thereafter | `Q2 FY26 10-Q, MD&A, p.27`; `Q2 FY26 transcript, prepared remarks` |
| **Acquired revenue — Maverick Power** | Not yet owned. ~$700m estimated **2026 full-year** revenue for a business nVent would own for part of Q4 at best; close expected Q4 2026, subject to regulatory approval | **Improving from Q4 2026, conditional on close** | **High** — ~$700m is ~13.0% of guided FY26 revenue on a full-year basis | `nVent press release, 24-Aug-2026`. **Not in FY26 guidance and not in any consensus estimate in this pool** (`04_guidance-consensus.md` §7) |
| **Price / realization** | Not separately disclosed. Described as "selective increases in selling prices"; framed as an offset to ~$100m of FY26 tariff cost plus other inflation | **Improving marginally** | **Low–Mid** — upper bound ≤5.2pp of Q2 organic growth, almost certainly far less (§6a) | `Q2 FY26 10-Q, MD&A, p.27`; `Q2 FY26 transcript, prepared remarks` |
| **Short-cycle demand** (commercial & residential + industrial, through distribution) | Commercial & residential +2.2pp of group growth; industrial +1.4pp. Management: commercial resi "high single digits", industrial "low single digits", each guided to "mid-single digits for the year" | **Improving from a low base** — "stronger demand in our short-cycle business" was named as a reason Q2 beat guidance | **Mid** — 40.0% of Q2 sales but only 6.9% of Q2 growth | `Q2 FY26 10-Q, Note 2, p.9`; `Q2 FY26 transcript, prepared remarks` |
| **Geographic mix** | Americas $1,257.0m = 85.4% of Q2 sales and **94.3% of growth**; EMEA +1.3pp; Asia-Pacific +1.7pp | **Concentrating further into the Americas** | **Mid** | `Q2 FY26 10-Q, Note 2, p.8` |
| **FX translation** | +0.5pp in Q2 FY26 | **Deteriorating** — fading, and implied slightly negative in H2 | **Low** | `Q2 FY26 10-Q, MD&A, p.27` |
| **Customer concentration** | **Not proven from available data.** "No customer accounted for more than 10% of net sales in 2024, 2023 or 2022" — **no equivalent statement exists for FY2025 or FY2026 in this pool** | **Unknown** | **High if it has changed** — not assessable | `FY24 10-K, Note 15, p.70`; absence confirmed against the frozen pool |

**Drivers deliberately excluded as not applicable to NVT:** store count / distribution points (no owned retail estate), commodity spot price as a revenue driver (copper and steel are *inputs*, not the selling price — they belong to `03_margin-drivers`), utilization × installed capacity as a revenue formula (capacity constrains but does not set revenue here), contract renewals / retention (no subscription or recurring-contract base disclosed), regulatory or subsidy-driven volume (**no Inflation Reduction Act, CHIPS Act or Infrastructure Investment and Jobs Act reference appears anywhere in the frozen corpus** — per `10_external-dependency.md` §1A, no named policy programme may be claimed as a revenue driver for NVT).

### 4a. Cycle Position (MODULE_RULES Cycle-Position Rule)

**The latest reported quarter sits at or very near the PEAK of the AI data-centre capital-spending upswing, and it is not a normalised run-rate.** Evidence, in order of strength:

- **Organic growth of +46.9% in Q2 FY26 is far outside anything in the company's own history.** Reported revenue growth was +16.3% in FY2023 and +12.6% in FY2024 [`FY24 10-K, Consolidated Statements of Operations, p.40`], and those figures already included acquisitions. The current organic rate is roughly three times the best full-year *reported* rate this company has printed since the divestiture re-based it.
- **The mix shift is the cycle.** Infrastructure was 12% of sales at the 2018 spin, 45% in 2025, and "nearly 60%" of H1 2026 [`Q2 FY26 transcript, prepared remarks`]; on the filed quarterly numbers it is 60.0% of Q2 FY26 sales [`Q2 FY26 10-Q, Note 2, p.9`]. Data-centre sales are guided to more than double in a single year, to >$2bn.
- **The leading indicator has already rolled over while the lagging one is still accelerating.** Organic orders decelerated from ~40% to low double digits, and backlog fell $0.1bn sequentially, in the same quarter sales grew 46.9% organically [`Q1 FY26 transcript`; `Q2 FY26 transcript`, prepared remarks]. Management's explanation is that it deliberately converted backlog — "we worked hard in Q2 to really execute on that backlog" — and that data-centre orders are "large and lumpy", with "strong data center orders thus far in Q3" [`Q2 FY26 transcript, prepared remarks and Q&A`]. **That explanation is plausible and unverified.** It is management commentary about a quarter that has not been reported.
- **This read agrees with the business-model module** (`10_external-dependency.md` §3: "Partly externally driven" at the top of its range, one notch from "mostly externally driven"; the marginal dollar is "close to a pure bet on AI data-centre capital spending"). No divergence to flag.

**Items in the latest period that are NOT run-rate, labelled:**

- **The Electrical Products Group acquisition contribution is mechanically non-repeating.** It added 17.0pp in Q1 FY26 and 5.4pp in Q2, and goes to ~zero from Q3 because it anniversaried on 1-May-2026. Any forward growth rate built off H1's 53.1% reported rate without removing 10.7pp of acquisition and 1.2pp of currency is wrong by roughly 12pp.
- **The FX tailwind is fading and management's own guide has it turning negative in H2.** Arithmetic: FY26 guidance midpoint revenue = $3,893.1m × 1.38 = $5,372.5m, so total growth = $1,479.4m; organic at the 33% midpoint = $3,893.1m × 0.33 = $1,284.7m; implied non-organic for the full year = $194.7m. H1 already delivered $189.3m of acquisition plus $21.3m of currency = $210.6m. **Implied H2 non-organic contribution = 194.7 − 210.6 = −$15.9m** — a small currency drag and zero acquisition help. [Guidance from `Q2 FY26 transcript, prepared remarks`; FY2025 base revenue $3,893.1m from `Capital IQ Financials → Income Statement, 12m Dec-31-2025, vendor data as of ~12-Aug-2026`.] This is also the arithmetic proof that **Maverick Power is not in the FY2026 guide.**
- **No one-off policy or subsidy tailwind sits in the revenue line.** The $25.8m of IEEPA tariff *reimbursements* recognised in H1 FY26 is a gross-profit item, explicitly excluded from reportable segment income, and does **not** touch net sales [`Q2 FY26 10-Q, Note 13, p.19 and p.21`; `MD&A, p.28`]. It belongs to `03_margin-drivers`, not here. There is no GST-type tax change, no demand pull-forward from a rate cut, and no named subsidy programme in this pool.
- **Capacity was a live constraint through the period and is being expanded into the demand.** Blaine 1 opened at the start of 2026 and "will continue to ramp through this year"; Blaine 2 was announced on 31-Jul-2026 for H1 2027 [`Q2 FY26 transcript, prepared remarks`]. Fixed capacity is being committed against an order book management itself calls lumpy — that raises the cost of being wrong about the cycle, and it is why the cycle read matters downstream.

**Stated plainly: Q2 FY26 revenue is a peak-of-cycle print, not a normalised base.** Downstream modules must not treat +46.9% organic, 60% infrastructure mix, or 23.0% adjusted EBITDA margin as a run-rate starting point.

---

## 5. Revenue Drivers By Segment

Both segments are material (72.5% / 27.5% of H1 FY26 sales), so both are covered. Reference period is again Q2 FY26 vs Q2 FY25.

### Segment: Systems Protection (72.5% of H1 FY26 revenue; 72.9% of Q2 FY26 revenue)

Net sales $1,072.1m vs $632.0m = **+69.6%**; segment income $248.2m vs $137.1m = +81.0% [`Q2 FY26 10-Q, MD&A, p.29`].

| Driver | Current Level | Direction | Magnitude | Evidence |
|---|---|---|---|---|
| Infrastructure demand (data centres, power utilities) | Contributed **~62.5pp of the segment's 62.0pp organic growth** in Q2 (i.e. essentially all of it, with other verticals net-negative to rounding); infrastructure is $729.3m of the segment's $1,072.1m = 68.0% of segment sales | **Improving** | **High** — it is more than two-thirds of the segment | `Q2 FY26 10-Q, MD&A, p.29`; `Note 2, p.9` |
| Industrial and commercial & residential inside this segment | Both **"each flattish in the quarter"**; industrial $269.8m vs $266.0m (+1.4%), commercial & residential $73.0m vs $73.5m (−0.7%) | **Stable / flat** | **Low** | `Q2 FY26 transcript, prepared remarks`; `Q2 FY26 10-Q, Note 2, p.9` |
| Electrical Products Group acquisition | $45.2m = **7.2pp** in Q2; $166.2m = 14.6pp in H1. "Continued to exceed expectations, growing sales strong double digits year-over-year" | **Deteriorating to zero** from Q3 (anniversaried) | **Mid** | `Q2 FY26 10-Q, MD&A, p.29`; `Q2 FY26 transcript, prepared remarks` |
| Liquid-cooling capacity | Anoka + Blaine 1 (open, ramping) + Blaine 2 (H1 2027) | **Improving** | **Mid** in FY26, **High** in FY27 | `Q2 FY26 transcript, prepared remarks` |
| Currency | +0.4pp in Q2 | **Deteriorating** | **Low** | `Q2 FY26 10-Q, MD&A, p.29` |
| Price | Not separately disclosed — "includes selective increases in selling prices" | **Improving marginally** | **Low** | `Q2 FY26 10-Q, MD&A, p.29` |
| Maverick Power placement | **Not disclosed.** The release does not name the segment. Precedent: EPG's enclosures, switchgear and bus systems went "predominantly within our Systems Protection reporting segment" — *inference that Maverick lands here too, not from filings* | **Unknown** | **High if it lands here** | `nVent press release, 24-Aug-2026`; `Q2 FY26 10-Q, MD&A, p.24` |

**Segment growth check:** organic 62.0 + acquisition 7.2 + currency 0.4 = 69.6, which equals the disclosed total exactly; and $1,072.1 / $632.0 − 1 = **+69.64%**. Acquisition tie: $45.2m ÷ $632.0m = **7.15%** → the disclosed 7.2pp. Reconciled.

### Segment: Electrical Connections (27.5% of H1 FY26 revenue; 27.1% of Q2 FY26 revenue)

Net sales $399.2m vs $331.1m = **+20.6%**; segment income $108.8m vs $94.9m = +14.6% [`Q2 FY26 10-Q, MD&A, p.30`].

| Driver | Current Level | Direction | Magnitude | Evidence |
|---|---|---|---|---|
| Short-cycle distribution demand (commercial & residential) | $185.6m of $399.2m = 46.5% of segment sales; contributed **~6.5pp** of the segment's 17.9pp organic growth; "up low teens" | **Improving** | **Mid–High** for the segment; **Low** for the group (segment is 27% of sales) | `Q2 FY26 10-Q, MD&A, p.30`; `Note 2, p.9`; `Q2 FY26 transcript, prepared remarks` |
| Infrastructure pull-through (cable management into data centres) | Contributed **~8.5pp** of the 17.9pp organic growth; infrastructure $153.2m = 38.4% of segment sales, up from $116.8m | **Improving** | **Mid** | `Q2 FY26 10-Q, MD&A, p.30`; `Note 2, p.9` |
| Industrial | Contributed **~3.0pp**; $60.4m vs $50.6m | **Improving** | **Low** | `Q2 FY26 10-Q, MD&A, p.30`; `Note 2, p.9` |
| Electrical Products Group acquisition | $6.4m = **1.9pp** in Q2; $23.1m = 3.7pp in H1 | **Deteriorating to zero** from Q3 | **Low** | `Q2 FY26 10-Q, MD&A, p.30` |
| Seasonality | Demand rises in Northern-Hemisphere spring and summer; the company names this explicitly for this segment | **Stable pattern** — Q3 sits inside the seasonal-strong half | **Low–Mid** | `Q2 FY26 10-Q, MD&A, p.30`; `LIQUIDITY, p.30`: "We experience seasonal cash flows primarily due to increased demand for Electrical Connections products during the spring and summer months" |
| Currency | +0.8pp in Q2 — the larger of the two segments' currency effects | **Deteriorating** | **Low** | `Q2 FY26 10-Q, MD&A, p.30` |
| Price | Not separately disclosed; the CFO notes margin was "impacted by inflation and mix, partially offset by improving price and volume" | **Improving** | **Low** | `Q2 FY26 transcript, prepared remarks` |

**Segment growth check:** organic 17.9 + acquisition 1.9 + currency 0.8 = 20.6, equal to the disclosed total; and $399.2 / $331.1 − 1 = **+20.57%**. Acquisition tie: $6.4m ÷ $331.1m = **1.93%** → the disclosed 1.9pp. Reconciled. The two segments' acquisition dollars also tie to the group: $45.2m + $6.4m = **$51.6m**, the disclosed group figure.

**Neither segment is immaterial, so nothing is deferred as such.** The vertical acceleration in Electrical Connections is real (7.9% organic in Q1 FY26 → 17.9% in Q2) [`Q1 FY26 10-Q, MD&A, p.26`; `Q2 FY26 10-Q, MD&A, p.30`] and is the second-order piece of good news in the quarter — but at 27% of sales it moved the group by 7.1pp against Systems Protection's 45.7pp.

---

## 6. Revenue Growth Decomposition

**Period: Q2 FY26 (three months ended 30-Jun-2026) vs Q2 FY25.** All three components below are the company's **own disclosed split** in the 10-Q, not this agent's estimates.

| Component | Contribution to Growth (pp) | Evidence |
|---|---:|---|
| Volume (inside "Organic") | **not separable** | Company does not split organic between volume and price |
| Price (inside "Organic") | **not separable** | `Q2 FY26 10-Q, MD&A, p.27`: organic growth "includes selective increases in selling prices" — no figure given |
| **— Organic, volume and price combined** | **+46.9** | `Q2 FY26 10-Q, MD&A "Net sales", p.27` |
| Mix | **0.0 — no separate line** | Mix is *inside* organic here; it changes the composition of the 46.9pp, not the total. Its shape is quantified in §6a |
| FX | **+0.5** | `Q2 FY26 10-Q, MD&A, p.27` |
| Acquisitions / divestitures | **+5.4** | `Q2 FY26 10-Q, MD&A, p.27`; all of it the Electrical Products Group, $51.6m |
| Other | **0.0** (residual $0.1m on $508.2m of growth = 0.01pp) | Derived — see §6a |
| **Total revenue growth** | **+52.8** | `Q2 FY26 10-Q, MD&A, p.27`; independently checked: $1,471.3m ÷ $963.1m − 1 = **+52.77%** [`Statements of Income, p.3`] |

**Same decomposition for the first half (six months ended 30-Jun-2026 vs 2025), for the period the guidance is built on:** Organic **+41.2**, Acquisition **+10.7**, Currency **+1.2**, Total **+53.1** [`Q2 FY26 10-Q, MD&A, p.27`]. Independently checked: $2,713.3m ÷ $1,772.4m − 1 = **+53.09%**.

**What is NOT possible from this disclosure, stated rather than estimated:**
1. **A volume-versus-price split.** No filing, deck or transcript in this pool sizes price. A bound is derived in §6a; a point estimate is not available.
2. **A data-centre-only revenue line.** Data centres are not a reportable segment or a disclosed vertical; the >$2bn figure is a transcript number with no filed equivalent.
3. **A full-year FY2025 decomposition on filing evidence** — there is no FY2025 10-K in this pool.
4. **Any segment-level order, backlog or book-to-bill figure.**

---

## 6a. Decomposition Attribution and Residual (MODULE_RULES "Driver Attribution" / §15)

Every pp figure in §6 is a **reported number taken directly from the 10-Q's own components-of-change table**, not a figure this agent modelled from a ratio. Each is therefore recorded below in the "asserted from disclosure" form, and then independently re-derived from the filing's own dollar amounts so the reader can rebuild it.

```
Organic: Asserted from disclosure, no ratio applied. [Q2 FY26 10-Q, MD&A "Net sales", p.27]
  Cross-check in dollars: 46.9% x $963.1m (prior-year quarter net sales)
    = $451.7m of the $508.2m observed increase
  -> basis matches (both the ratio and the base are the same prior-year quarter, same
     continuing-operations basis, same segment scope)

Acquisitions: Asserted from disclosure, no ratio applied. [Q2 FY26 10-Q, MD&A, p.27]
  Cross-check from the filing's own dollar figure: $51.6m (Electrical Products Group sales
    in Q2 FY26 with no year-ago comparative) / $963.1m
    = 5.36% -> the disclosed 5.4pp of the 52.8pp observed growth
  -> basis matches. Segment tie: $45.2m (Systems Protection) + $6.4m (Electrical
     Connections) = $51.6m exactly [Q2 FY26 10-Q, MD&A, p.29 and p.30]

FX: Asserted from disclosure, no ratio applied. [Q2 FY26 10-Q, MD&A, p.27]
  Cross-check in dollars: 0.5% x $963.1m = $4.8m of the $508.2m observed increase
  -> basis matches

Mix: no pp figure claimed. Mix redistributes the organic block; it does not add to the total.
  Its shape, each computed on the SAME prior-year quarter base of $963.1m:
    Infrastructure vertical: ($882.5m - $409.3m) / $963.1m = +49.13pp
    Industrial vertical:     ($330.2m - $316.6m) / $963.1m =  +1.41pp
    Comm. & residential:     ($258.6m - $237.2m) / $963.1m =  +2.22pp
    Sum = 52.76pp vs the 52.77pp observed -> ties to 0.01pp
    [Q2 FY26 10-Q, Note 2 (Revenue), p.9]
  Note the basis limit: these vertical contributions are TOTAL (organic + acquired + FX),
  because Note 2 reports sales by vertical, not organic growth by vertical. They must NOT
  be compared with the organic-only 46.9pp line. The company's own organic-only vertical
  attribution, on the organic base, is ~44.0pp infrastructure and ~2.0pp commercial &
  residential of the 46.9pp organic [Q2 FY26 10-Q, MD&A, p.27] - leaving ~0.9pp of organic
  growth the filing does not attribute to a named vertical.
```

**Reconciliation to the stated Total.** 46.9 (organic) + 5.4 (acquisitions) + 0.5 (FX) = **52.8pp**, equal to the 10-Q's own stated Total of 52.8%. In dollars: $451.7m + $51.6m + $4.8m = $508.1m against the observed $508.2m increase, a residual of **$0.1m = 0.01pp**, which is rounding on percentages quoted to one decimal.

**The residual is near zero at the top level — and that is not the same as a fully understood bridge.** Two gaps sit *inside* the explained block and must travel with any downstream use of it:

1. **46.9 of the 52.8pp is a single undivided "organic" block that the pool cannot split between volume and price.** The only bound available: the CFO stated that "price plus productivity offset inflation of more than $50 million" in Q2 [`Q2 FY26 transcript, prepared remarks`]. If productivity contributed nothing (it did — the 10-Q names "increased productivity as a result of supply chain management and manufacturing efficiencies" [`MD&A, p.28`]), price would be at most ~$50m on the $963.1m prior-year base = **≤5.2pp of the 46.9pp organic**. That is a bound with zero mitigation assumed on the productivity side, **not an estimate** — *inference, not from filings*. The realistic figure is materially lower and is not knowable from this pool. **Volume is therefore the overwhelming majority of the organic block, but its exact share is not proven from available data.**
2. **~0.9pp of the organic block is unattributed by vertical** in the company's own MD&A (44.0 infrastructure + 2.0 commercial & residential = 46.0 of 46.9). Small, but it is stated rather than absorbed into infrastructure.

**Derived forward indicator — book-to-bill, with its precision stated.** Backlog is disclosed only rounded to $0.1bn. Q2 book-to-bill = 1 + (change in backlog ÷ quarterly sales) = 1 + (−$0.1bn ÷ $1,471.3m) = **~0.93x**. Because both backlog figures are rounded to the nearest $0.1bn, the true change lies between $0.00bn and $0.20bn, so the honest range is **0.86x to 1.00x** — below Q1's ~1.2x on any reading. *Derived from rounded transcript figures — inference, not from filings.* [`Q1 FY26 transcript`; `Q2 FY26 transcript`, prepared remarks; sales from `Q2 FY26 10-Q, p.3`.]

**One management metric deliberately kept OUT of the bridge.** "New products contributed over 30 points to our sales growth" [`Q2 FY26 transcript, prepared remarks`] cannot be added to the 52.8pp total: its base is not defined anywhere in this pool, and it double-counts against the vertical attribution (a new liquid-cooling product sold into a data centre appears in both). Adding it would have produced a bridge summing to well over 100% of the observed growth. It is reported in §3 as a company claim about content and share, and nowhere else.

RF-EARN-001: revenue decomposition reconciled — explained 52.8pp, residual 0.0pp, total 52.8pp

---

## 7. The Single Biggest Revenue Driver

**Data-centre capital spending, read through the infrastructure vertical, and the arithmetic supports naming it rather than hedging.** Infrastructure sales rose $473.2m in Q2 FY26, which is **49.1pp of the 52.8pp of observed growth — 93.1% of every incremental dollar** ($473.2m ÷ $508.2m), computed on the same prior-year quarter base as the total [`Q2 FY26 10-Q, Note 2, p.9`, arithmetic in §6a]. The company's own organic-only attribution says the same thing from the other side: ~44.0pp of the 46.9pp of organic growth came from infrastructure [`Q2 FY26 10-Q, MD&A, p.27`]. That clears the "roughly half" test by a wide margin, and the top-level bridge reconciles with a 0.01pp residual, so the claim is not resting on an unexplained gap. If data-centre sales — guided above $2bn of the ~$5,372m FY26 revenue midpoint — moved 10–20%, that is **$200m to $400m, or 3.7% to 7.4% of group revenue**, more than any other single driver in §4 can produce.

**Its current direction is genuinely two-handed, and both hands have to be shown.** On delivered sales it is accelerating: infrastructure organic growth "more than doubled" in Q2, data-centre sales are guided to more than double for the full year, and management raised FY26 organic growth guidance twice in five months (from +10–13% to +21–23% to +32–34%) [`Q2 FY26 transcript, prepared remarks`; `04_guidance-consensus.md` §2]. On the forward order book it is not: organic orders decelerated from ~40% to low double digits, backlog fell from $2.6bn to $2.5bn, and the implied Q2 book-to-bill of ~0.93x (range 0.86–1.00x) is below Q1's ~1.2x. **Naming the contradiction rather than averaging it:** the sales series and the order series point opposite ways in the same quarter, and only the sales series is filed — the orders and backlog figures exist solely in transcripts, at group level, with no segment split and no independent check. Management's reconciliation is that it deliberately drained backlog to protect lead times and that data-centre orders are lumpy, with Q3 orders "strong" so far [`Q2 FY26 transcript, prepared remarks and Q&A`]; that is an assertion about an unreported quarter and it is not verified by anything in this pool. The order series does not overturn the verdict — infrastructure still produced 93.1% of realised growth, and $2.5bn of backlog is still roughly 47% of guided FY26 revenue — but it does mean the case that this driver is still *accelerating* rests on delivered revenue and management commentary, not on the order book.

**What would most likely move revenue next, in order.** (1) The rate at which data-centre orders convert out of the $2.5bn backlog against newly opened Blaine capacity — this is the whole of Q3 and Q4. (2) **Maverick Power**: ~$700m of estimated 2026 revenue, expected to close in Q4 subject to regulatory approval, and — proven by the arithmetic in §4a — sitting entirely outside both the FY26 guidance and every consensus estimate in this pool. (3) The mechanical drop of the Electrical Products Group acquisition line to zero from Q3, which is why management's Q3 guide gives the *same* number for reported and organic growth (+32% to +35%) and why H2 growth has to be earned organically. Whether the guidance-implied Q4 revenue of $1,252.1m is prudence or a real step-down is the open question, and it belongs to `05_beat-miss-setup`.

---

## 8. Citations

All documents sit inside the frozen extract generation `6db32848…1aecd1e6`, cited under the logical label `data/NVT/`.

| # | Source |
|---|---|
| [1] | `FY24 10-K` (nVent Electric plc, Form 10-K, fiscal year ended 31-Dec-2024) — cover page; Consolidated Statements of Operations p.40; Note 6 (Discontinued Operations); Note 15 (Segment Information) p.69–71 |
| [2] | `Q1 FY26 10-Q` (quarter ended 31-Mar-2026, signed 1-May-2026) — MD&A "Net sales" components-of-change tables, p.25 (consolidated), p.26 (segments) |
| [3] | `Q2 FY26 10-Q` (quarter and six months ended 30-Jun-2026) — Condensed Consolidated Statements of Income p.3; Note 2 (Revenue: vertical and geographic net sales) p.8–9; Note 13 (Segment information) p.19–22; MD&A "Net sales" p.27, "Gross profit" p.28, Systems Protection p.29, Electrical Connections p.30, Liquidity p.30 |
| [4] | `Q1 FY26 earnings call transcript` (FactSet CallStreet, Corrected Transcript, verbatim), 1-May-2026 — prepared remarks and Q&A |
| [5] | `Q2 FY26 earnings call transcript` (S&P Global Market Intelligence, verbatim), 31-Jul-2026 — prepared remarks and Q&A |
| [6] | `nVent press release, "nVent to Acquire Maverick Power"`, 24-Aug-2026 |
| [7] | `Capital IQ Financials export → Income Statement tab`, 12m Dec-31-2025 column (FY2025 revenue $3,893.1m) — tier-5 vendor data, as of ~12-Aug-2026 — `nVent Electric plc NYSE NVT Financials.xls` |
| [8] | `analyses/NVT_2026-09-07/earnings/01_historical-financials.md` (upstream baseline) |
| [9] | `analyses/NVT_2026-09-07/earnings/04_guidance-consensus.md` (guidance path, consensus, Q4 implied) |
| [10] | `analyses/NVT_2026-09-07/earnings/00_earnings-data-triage.md` (pool inventory, partial-data flags) |
| [11] | `analyses/NVT_2026-09-07/business-model/03_segment-map.md` (segment structure) |
| [12] | `analyses/NVT_2026-09-07/business-model/10_external-dependency.md` (cyclicality and policy exposure) |
| [13] | `2026 William Blair Growth Stock Conference presentation`, 3-Jun-2026, slide 4 (FY2025 vertical mix) |

**Partial-data status: none applied.** Two verbatim transcripts, two 10-Qs with full segment notes and disclosed components-of-change tables, and quarterly actuals through FQ2 2026 are all present, so no MODULE_RULES score cap binds on this agent. No `external/` alt-data folder exists in this pool, so no external-data tier is cited; its absence is not a gap. The genuine limits carried forward are: no FY2025 Form 10-K (so no audited FY2025 segment note and no filing-grade FY2025 decomposition), no volume/price split at any level, no segment-level order intake or backlog, no data-centre revenue line in any filing, and no customer-concentration statement more recent than FY2024.

### Calculation provenance

Every percentage, pp contribution and dollar cross-check in §3, §5, §6 and §6a was computed from the filed dollar amounts cited beside it. Spot-checks reproduced: `1,471.3 / 963.1 − 1 = 52.77%`; `(882.5 − 409.3) / 963.1 = 49.13pp`; `(330.2 − 316.6) / 963.1 = 1.41pp`; `(258.6 − 237.2) / 963.1 = 2.22pp`; sum `= 52.76pp` against the 52.77pp observed; `51.6 / 963.1 = 5.36%`; `45.2 + 6.4 = 51.6`; `0.469 × 963.1 = 451.7`; `451.7 + 51.6 + 4.8 = 508.1` against the observed `1,471.3 − 963.1 = 508.2`; `2,713.3 / 1,772.4 − 1 = 53.09%`; `189.3 / 1,772.4 = 10.68%`; `3,893.1 × 1.38 = 5,372.5`, `3,893.1 × 0.33 = 1,284.7`, `1,479.4 − 1,284.7 = 194.7`, `194.7 − 210.6 = −15.9`.



---

## earnings / 03_margin-drivers.md

_Source: `03_margin-drivers.md`_

# Margin Drivers — NVT

**Company:** nVent Electric plc (NYSE: NVT). **Regime:** US SEC domestic filer (Irish-incorporated), **US GAAP**, **USD in millions**, fiscal year ends **31 December** [`00_earnings-data-triage.md`, §0].

**Evidence binding: frozen.** Every read resolved through generation `6db32848…1aecd1e6` (`manifest.json`, `corpus.txt`, `ciq_facts.json`, per-tab extracts). Live `data/NVT/` was not read; `data/NVT/…` is a citation label only.

**Upstream inputs used:** `01_historical-financials.md` (margin baseline), `00_earnings-data-triage.md`, `04_guidance-consensus.md`. **Cross-module inputs used:** business-model `02_business-identity.md`, `03_segment-map.md`, `06_value-chain.md`, `10_external-dependency.md` — all present, so the no-business-model disclaimer does **not** apply.

**Basis note carried from upstream:** there is **no FY2025 Form 10-K in this pool**. FY2025 full-year cost and margin lines are cited to the Capital IQ export (tier-5 vendor data, as of ~12-Aug-2026), never under a filing's name. Q2 FY26, Q1 FY26 and their prior-year comparatives are filing-grade [`00_earnings-data-triage.md`, §5].

### Plain-English definitions used here

- **Basis point (bps)** = one hundredth of a percentage point; 100bps = 1.0 percentage point.
- **Gross margin** = (net sales − cost of goods sold) ÷ net sales. What is left after the direct cost of making the product.
- **Segment income** = the company's own segment profit measure: operating income including some corporate overhead allocations, but **excluding** intangible amortisation, acquisition costs, restructuring, IEEPA tariff reimbursements, pension mark-to-market, impairments and other unusual items [Q2 FY26 10-Q, Note 13, p.19–20]. It is **not** an operating margin.
- **Return on sales (ROS)** = the company's adjusted operating income ÷ net sales — management's own headline margin measure [Q1 FY26 earnings presentation, 1-May-2026, slide 16].
- **Incrementals** = cents of extra profit earned per extra dollar of sales. Management guides "mid-20s incrementals" for H2 FY26 [Q2 FY26 transcript, Q&A (Corona)].
- **IEEPA tariffs** = tariffs previously paid under the US International Emergency Economic Powers Act and since **reimbursed** to the company. $25.8m landed in Q2 FY26 gross profit [Q2 FY26 10-Q, Note 13, p.21].

---

## 0. Sector Overlay Result (step 3b)

**No sector overlay for an electrical-hardware manufacturer with engineered project work — generic cost stack applies.**

`frameworks/SECTOR_OVERLAYS.md` carries rows for SaaS, bank, insurer, REIT, miner, oil & gas, retail, telecom, asset manager and pharma. The business-model module classified NVT as an "electrical-hardware manufacturer selling standard product through distributors alongside a fast-growing engineered, backlog-delivered project business" and matched it to the file's **"Generic operating company (default)"** row [`business-model/02_business-identity.md`, §3 and §3a]. This module reaches the same result independently: NVT reports cost of goods sold, SG&A, R&D and D&A on the face of its income statement and has no NIM, no combined ratio, no NOI, no AISC and no fee rate. The generic volume / price / mix / operating-leverage cost stack below is therefore the correct grammar, and a bank-, REIT- or miner-style margin table would be the wrong numbers.

---

## 1. Segment Decomposition Status

**Decomposed by segment. Two reportable segments, neither below the 15% threshold, so the >85% single-segment shortcut does NOT apply.**

| Item | Status |
|---|---|
| Business-model `03_segment-map.md` available? | **Yes** — read and used |
| Number of reportable segments | **Two**: Systems Protection, Electrical Connections. Plus "Enterprise and other", which is an unallocated **cost pool**, not a segment (fails the ASC 280 test) [Q2 FY26 10-Q, Note 13, p.19] |
| Revenue split, H1 FY26 | Systems Protection **72.5%** ($1,966.9m), Electrical Connections **27.5%** ($746.4m) of $2,713.3m [Q2 FY26 10-Q, Note 13, p.20] |
| Segment-level P&L disclosed? | **Yes, unusually fully.** The 10-Q gives, by segment: net sales, **cost of goods sold**, SG&A, R&D, segment income, identifiable assets, depreciation and capex [Q2 FY26 10-Q, Note 13, p.20–22] |
| Can segment **gross** margin be computed? | **Yes** — segment COGS is disclosed. This module computes it below. This is a stronger disclosure than most industrials give and it is what makes the Section 7 bridge reconcile |
| What is NOT disclosed at segment level | Intangible amortisation (all unallocated), enterprise costs, restructuring, acquisition costs, IEEPA reimbursements, freight, energy, labour, raw-material cost, segment backlog, segment order intake [Q2 FY26 10-Q, Note 13, p.19–21; `business-model/03_segment-map.md`, §3] |
| Audited annual segment note for FY2025? | **No** — FY2025 10-K absent. Latest audited segment note is FY2024 [`00_earnings-data-triage.md`, §5] |

**One structural warning that governs everything below.** The segment that is growing is the **lower-gross-margin** one. Systems Protection went from 60.7% of revenue (FY2024, audited) to 72.5% (H1 FY26) [FY24 10-K, Note 15, p.70; Q2 FY26 10-Q, Note 13, p.20], and its gross margin is roughly 9 percentage points below Electrical Connections'. Mix is therefore a standing, mechanical drag on group gross margin that has nothing to do with cost inflation — and the announced Maverick Power acquisition ($1.75bn, ~$700m of estimated 2026 revenue, expected to close Q4 2026) most likely lands in Systems Protection and pushes the mix further the same way [`nVent-to-Acquire-Maverick-Power-2026.pdf`, 24-Aug-2026; `business-model/03_segment-map.md`, §2 — segment placement is inference, not from filings].

---

## 2. Cost Stack

Consolidated, reported (not adjusted) basis. Latest quarter is filing-grade; the FY2025 column is vendor-sourced because no FY2025 10-K exists.

| Cost Line | Q2 FY26 (% of net sales) | Q2 FY25 | YoY change | Direction | Evidence | Margin Risk |
|---|---:|---:|---:|---|---|---|
| **Cost of goods sold** (total) | **62.07%** ($913.3m) | 61.40% ($591.3m) | **+68bps** (worse) | Headwind | Q2 FY26 10-Q, Statements of Income, p.3 | High — every 100bps of COGS ratio is ~$15m of quarterly profit |
| — Raw materials (steel, stainless, copper, aluminium, electronic components, paint) | **Not disclosed** as a separate line or as a share of COGS | Not disclosed | n/a | Headwind (named) | Inputs named at FY24 10-K, Item 1 — Raw materials; inflation named at Q2 FY26 10-Q, MD&A Gross profit, p.27 | High — no commodity hedging programme is disclosed anywhere in the pool [FY24 10-K, Item 7A], so metal prices move straight into COGS |
| — Labour | **Not disclosed** as a separate line | Not disclosed | n/a | Headwind (named) | "inflationary increases, primarily related to raw materials and labor costs" [Q2 FY26 10-Q, MD&A Gross profit, p.27] | Mid |
| — Tariffs (all-in cost) | **~$100m guided for FY2026** ≈ 186bps of guided revenue; ">$30m" in Q2 alone ≈ 204bps of Q2 sales | ~$90m in FY2025 (management count) | Rising | Headwind | Q2 FY26 transcript, prepared remarks (Corona), 31-Jul-2026 | **High** — see §7/§9 for the mitigation arithmetic |
| — IEEPA tariff **reimbursement** (credit inside COGS) | **+$25.8m = +175bps of gross margin** | nil | +175bps | **One-off tailwind — NOT run-rate** | Q2 FY26 10-Q, Note 13 reconciliation, p.21; MD&A Gross profit, p.27 | High — reverses to zero next quarter unless repeated |
| — Freight / logistics | **Not disclosed** | Not disclosed | n/a | Unknown | Named only generically in FY24 10-K, Item 1A (freight among costs to be mitigated) | Not assessable |
| — Energy | **Not disclosed** | Not disclosed | n/a | Unknown | Named generically at FY24 10-K, Item 1A; Q1 FY26 call cites "fuel and copper" as inflation drivers [Q1 FY26 transcript, Q&A (Corona)] | Not assessable |
| **SG&A** | **15.82%** ($232.8m) | 20.35% ($196.0m) | **−453bps** (better) | **Tailwind — the largest single mover** | Q2 FY26 10-Q, MD&A, p.26 (states "(4.6) pts") | High in both directions — it is volume-driven |
| — of which intangible amortisation | 2.79% ($41.1m) | 3.73% ($35.9m) | −93bps | Tailwind by dilution, rising in dollars | Q2 FY26 10-Q, MD&A SG&A, p.28 | Mid — dollars rise with each deal |
| — SG&A **excluding** amortisation | **13.03%** ($191.7m) | 16.62% ($160.1m) | **−359bps** | Tailwind | Computed from the two lines above | High |
| **R&D** | **1.67%** ($24.5m) | 1.98% ($19.1m) | −32bps | Tailwind by dilution (dollars +28.3%) | Q2 FY26 10-Q, MD&A, p.26 | Low |
| **D&A** (depreciation $17.4m + intangible amortisation $41.1m) | **3.98%** ($58.5m) | 5.22% ($50.3m) | −124bps | Tailwind by dilution | Q2 FY26 10-Q, Note 13 p.22 (depreciation); MD&A p.28 (amortisation) | Mid — FY2026 D&A guided ~$230m vs $207.8m in FY2025 [`CIQ Estimates→Guidance`, D&A FY2026, guidance date 1-May-2026] |
| **Net interest expense** | **1.18%** ($17.4m) | 1.83% ($17.6m) | −65bps | Tailwind now, headwind ahead | Q2 FY26 10-Q, Statements of Income, p.3 | Mid — FY2026 guided ~$65m, but Maverick Power is funded with "cash and new debt" [`nVent-to-Acquire-Maverick-Power-2026.pdf`] |

**Annual context (FY2025, vendor-sourced — no FY2025 10-K):** COGS 62.26% of revenue ($2,424.0m on $3,893.1m), gross margin 37.7%, R&D 2.02% ($78.5m), reported SG&A 19.88% ($773.8m, derived: vendor SG&A $757.9m + $7.5m restructuring + $8.4m pension reclass, which ties to reported operating income of $616.8m), D&A 5.34% ($207.8m) [`CIQ Financials→Income Statement`, 12m Dec-31-2025, vendor data as of ~12-Aug-2026; Q1 FY26 earnings presentation, 1-May-2026, slide 16].

**What this stack does and does not let you do.** It supports a clean split between the **factory line** (COGS) and the **below-the-line leverage** (SG&A, R&D, D&A). It does **not** support a raw-material, freight, energy or labour bridge in dollars — none of those is disclosed as a line item or as a share of COGS anywhere in the pool. Any input-cost decomposition beyond management's own combined dollar figure would be invention, and is not attempted.

---

## 3. Gross Margin → EBITDA Margin → EBIT Margin Walk

### Q2 FY2026 vs Q2 FY2025 (both filing-grade)

| Margin Level | Q2 FY26 | Q2 FY25 | Change (bps) | Main Reason | Evidence |
|---|---:|---:|---:|---|---|
| **Gross margin (reported)** | **37.93%** | 38.60% | **−68** (10-Q: "(0.7) pts") | Raw-material and labour inflation including tariffs, unfavourable product mix, capacity investment — partly offset by volume leverage, productivity, and **+175bps of one-off IEEPA reimbursement** | Q2 FY26 10-Q, MD&A p.26–27 |
| Gross margin **ex-IEEPA** (this module's calculation) | **36.17%** | 38.60% | **−243** | Removes the $25.8m one-off. This is the run-rate gross line | ($558.0 − $25.8) ÷ $1,471.3 |
| **EBITDA margin (GAAP-derived: operating income + D&A)** | **24.41%** ($359.2m) | 21.49% ($207.0m) | **+292** | SG&A leverage plus a falling D&A ratio; also carries the IEEPA one-off | Computed from Q2 FY26 10-Q p.3 and Note 13 p.22 |
| **Adjusted EBITDA margin (company basis: adjusted operating income + depreciation)** | **23.12%** ($340.1m) | 22.26% ($214.4m) | **+86** | Clean of IEEPA and of intangible amortisation | $322.7m + $17.4m; prior $200.0m + $14.4m |
| *Same line on the vendor's basis* | *22.98% ($338.1m)* | *22.26%* | *+72* | *Vendor does not add back the $2.0m of Q2 restructuring: $340.1m − $2.0m = $338.1m exactly* | `CIQ Estimates→Surprise`, FQ2 2026; upstream `01_historical-financials.md` §3 |
| **EBIT margin (reported operating income)** | **20.44%** ($300.7m) | 16.27% ($156.7m) | **+417** | Gross −68, SG&A +453, R&D +32 → +417. Ties exactly | Q2 FY26 10-Q, MD&A p.26 |
| **Adjusted EBIT margin / ROS (company measure)** | **21.93%** ($322.7m) | 20.77% ($200.0m) | **+117** (company states "+110bps") | Clean of IEEPA, amortisation, restructuring and acquisition costs | Q2 FY26 transcript, prepared remarks (Corona); adjustments per Q2 FY26 10-Q, Note 13, p.21 |

### Full-year context, FY2025 vs FY2024

| Margin Level | FY2025 | FY2024 | Change (bps) | Evidence |
|---|---:|---:|---:|---|
| Gross margin | 37.7% | 40.2% | **−249** | FY2025 `CIQ Financials→Income Statement` (vendor); FY2024 10-K, MD&A p.24 |
| EBITDA margin (GAAP-derived) | 21.2% | 22.4% | **−121** | Upstream `01_historical-financials.md`, §1 |
| EBIT margin (reported) | 15.8% | 17.5% | **−169** | Same |
| Blended segment-income margin | 23.37% | 25.20% | **−183** | FY2025 vendor `Segments` tab; FY2024 10-K, Note 15, p.70 |

### The three answers to the divergence this module was asked to adjudicate (CLAUDE.md §3)

Gross margin is **down** (−249bps FY2025, −70bps in Q2 FY26) while adjusted EBITDA margin is **up** (+72bps YoY in Q2 FY26, per the vendor basis; +86bps on the company's own definition). Both series are correct, and the disagreement is fully explained by arithmetic that ties to the cent:

1. **The whole of the improvement happens below the gross line.** Q2 FY26: gross margin −68bps, SG&A ratio −453bps (a help), R&D ratio −32bps (a help) = reported operating margin +417bps. That sum is exact, not approximate. The factory got worse; the overhead got cheaper per dollar of sales, by far more.
2. **The SG&A leverage is real, not an amortisation artefact.** Strip intangible amortisation out of both years and SG&A still falls from 16.62% to 13.03% of sales — **−359bps**. The remaining −93bps is amortisation being spread across 53% more revenue. Both are volume effects; neither is an accounting choice.
3. **The gross line and the adjusted line treat the IEEPA one-off oppositely, and management's line is the conservative one.** The $25.8m reimbursement is **inside** reported gross profit (+175bps) but is **excluded** from segment income and from adjusted operating income — check: $300.7m + $41.1m amortisation + $2.0m restructuring + $4.7m acquisition costs − $25.8m IEEPA = **$322.7m** adjusted operating income, which is the "$323 million" management reported [Q2 FY26 10-Q, Note 13, p.21; Q2 FY26 transcript, prepared remarks]. So the +86bps adjusted EBITDA margin gain is **clean** of the one-off, while the −68bps reported gross margin decline is **flattered** by it. On a like-for-like run-rate basis gross margin fell **243bps**, and adjusted EBITDA margin still rose. The divergence is therefore wider, not narrower, than the headline numbers suggest — and it is entirely an operating-leverage story.

**Neither series overturns the other.** Gross margin is the honest read on **price versus cost**; adjusted EBITDA margin is the honest read on **the whole operating model**. Both must be carried forward. A downstream agent that quotes only the improving one is describing a company whose factory economics are deteriorating while calling margins "expanding."

### Pass-through: the lag, stated explicitly

nVent has **no contractual pass-through** — no escalator, no index-linked price, no raw-material surcharge is disclosed on any contract, and its project work is on **fixed-price** bids where a cost overrun is nVent's loss [`business-model/06_value-chain.md`, §2, citing FY24 10-K, Item 1A and Note 1]. **That is a fact about contracts, not a measurement of realised recovery (CLAUDE.md §9).** The measurement is that nVent prices cost back with a lag of roughly **one to two quarters**, and the pool contains the arithmetic:

- **Q1 FY26:** disclosed pre-mitigation inflation "nearly $60 million, including approximately $40 million in tariff impact" ÷ $1,242.0m of sales = **~483bps**; observed gross margin change 35.9% vs 38.8% = **−290bps**; realised recovery = 1 − 290/483 ≈ **40%** [Q1 FY26 transcript, prepared remarks (Corona); Q1 FY26 10-Q, MD&A p.24].
- **Q2 FY26:** "more than $50 million, including more than $30 million in tariff impact" ÷ $1,471.3m = **~340bps**; observed −70bps; realised recovery = 1 − 70/340 ≈ **79%** [Q2 FY26 transcript, prepared remarks; Q2 FY26 10-Q, MD&A p.26].
- **H1 FY26 combined:** ~$110m ÷ $2,713.3m = ~405bps against −170bps observed = **~58%**.

This module computed those three independently and they match `business-model/06_value-chain.md` §2 exactly; no gap to reconcile. The lag is visible in the sequence itself (40% → 79% in two quarters) and in management's own account: pricing actions "take hold" a quarter after they are taken, and Electrical Connections' margin fell 390bps YoY in Q1 FY26 but only 140bps in Q2 as the pricing landed [Q1 FY26 10-Q, MD&A; Q2 FY26 transcript, Q&A (Corona)].

**Three qualifiers travel with those recovery rates and must not be dropped.** (a) The inflation dollars are management statements on a call (tier 6), not filed figures, and two are floors ("more than", "nearly") — so the denominators are at least this large and the recovery rates are conservative. (b) The observed gross-margin change is not purely input cost: the 10-Q names unfavourable product mix and capacity investment as additional drags and volume leverage plus productivity as additional offsets, so the pure price-cost recovery is **higher** than 40%/79% and these rates are a floor, not a point estimate. (c) The prior full cycle over-recovered: group price rose **+5.5%** in 2023 against volume of −0.4%, gross margin expanded **+443bps**, and the 10-K's own segment bridge attributes **+4.2 points** of Enclosures margin and **+4.0 points** of Electrical & Fastening margin to **price alone** — then price went to **−0.2%** in 2024 when cost pressure eased [FY24 10-K, Item 7, Net sales and segment income components of change, p.24–28]. Price at nVent is cost-linked and given back, not a permanent ratchet.

---

## 4. Margin Walk — Which Margin Level Matters Most?

**Track this company on adjusted operating margin (return on sales), with segment gross margin excluding the IEEPA credit as the leading indicator.**

Adjusted ROS is the right primary metric for three evidenced reasons. First, it is the measure management guides and is paid on: guidance is set in adjusted EPS and the margin shape is guided as "mid-20s incrementals in the second half", which is a statement about incremental **operating** profit, not gross profit [Q2 FY26 transcript, Q&A (Corona); `04_guidance-consensus.md`, §2]. Second, gross margin alone is currently misleading in both directions — it carries a $25.8m one-off tariff refund that inflates it by 175bps, while missing the 453bps of SG&A leverage that is the dominant real movement; a reader tracking only gross margin in Q2 FY26 would have concluded margins compressed when adjusted operating profit rose 61% and ROS rose 110bps. Third, adjusted ROS is the only margin line in the pool that is disclosed consistently at both group and segment level across every period, including the vendor-sourced FY2025.

Gross margin is not discarded — it is demoted to a **leading indicator**, and specifically **segment-level gross margin ex-IEEPA**, which this module computes in §6. That is where tariffs, metals, product mix and new-plant start-up cost land first, one to two quarters before they show up in ROS. The three levels answer different questions: gross margin answers *is price beating cost?* (currently no — down 243bps ex-one-off), adjusted ROS answers *is the business earning more per dollar?* (currently yes — up 117bps), and reported EBIT margin answers neither cleanly because the acquisition-driven adjustment burden moved 300bps between the two periods.

**What NOT to use.** Do not use reportable **segment income** margin as an operating margin. It is struck before all intangible amortisation ($82.2m in H1 FY26, equal to 12.7% of reportable segment income), before all $73.7m of enterprise cost, and before restructuring and acquisition costs [Q2 FY26 10-Q, Note 13, p.21; `business-model/03_segment-map.md`, §3]. The gap widens with every deal.

---

## 5. Margin Driver Table (consolidated)

Magnitude = how much the driver moves **adjusted ROS**, the primary metric, on a reasonable move. High >100bps, Mid 30–100bps, Low <30bps.

| Driver | Impact on Margins | Direction | Magnitude | Evidence |
|---|---|---|---|---|
| **Volume-driven operating leverage on SG&A** — fixed overhead spread over 53% more sales | Cut the SG&A ratio 453bps YoY in Q2 FY26 (359bps of it excluding amortisation). This single line is larger than the entire observed operating-margin move | **Tailwind** | **High** | Q2 FY26 10-Q, MD&A p.26 and p.28 |
| **Segment mix — Systems Protection growing at ~9pp lower gross margin than Electrical Connections** | Cost 56bps of group gross margin in Q2 FY26 on a 7.25pp weight shift (computed §7). Mechanical, recurring, and set to continue with Maverick Power | **Headwind** | **High** | Q2 FY26 10-Q, Note 13, p.20; `nVent-to-Acquire-Maverick-Power-2026.pdf` |
| **Tariffs (all-in cost, before mitigation)** | ~$100m guided for FY2026 ≈ 186bps of guided revenue; raised from ~$80m at the Q1 call, on top of ~$90m in FY2025 | **Headwind** | **High** | Q2 FY26 transcript, prepared remarks (Corona) |
| **Price realisation / pass-through** — the offset to tariffs and raw-material inflation | Realised recovery ran 40% (Q1 FY26) → 79% (Q2 FY26) at the gross line; management guides full offset in Q3 ("Pricing is expected to offset the impact of inflation, including tariffs") | **Tailwind, improving — but guided, not proven for Q3** | **High** | §3 arithmetic; Q2 FY26 transcript, prepared remarks |
| **Raw-material inflation (steel, copper, aluminium, electronic components)** | Named as the first cause of the gross-margin decline in every FY26 quarter. **No commodity hedging programme is disclosed** — metals move straight into COGS | **Headwind** | **High** | Q1/Q2 FY26 10-Q, MD&A Gross profit; FY24 10-K, Item 7A |
| **Labour cost inflation** | Named alongside raw materials in every FY26 gross-profit and SG&A discussion; never quantified | **Headwind** | **Mid** | Q2 FY26 10-Q, MD&A p.27–28 |
| **Product mix within segments** (which products inside each segment sell) | Named as "unfavorable product mix" in every FY26 quarter and in both segment discussions; never quantified. Sits inside the −209bps residual in §7 | **Headwind** | **Mid** | Q2 FY26 10-Q, MD&A p.27, p.29, p.30 |
| **Capacity investment / new-plant start-up cost** | Named as a distinct gross-margin drag in Q1 and Q2 FY26. Three Minnesota liquid-cooling sites now committed; Blaine 1 "still ramping through this year and into 2027"; Blaine 2 opens H1 2027 | **Headwind (short run), see §9 for the other sign** | **Mid** | Q2 FY26 10-Q, MD&A p.27; Q2 FY26 transcript, prepared remarks and Q&A |
| **Productivity / supply-chain and restructuring savings** | Credited in both the gross-profit and the SG&A bridge; disclosed only combined with price, never separately | **Tailwind** | **Mid** | Q2 FY26 10-Q, MD&A p.27–28 |
| **IEEPA tariff reimbursement** | +$25.8m = **+175bps of Q2 gross margin**. Excluded from segment income and from adjusted operating income by the company itself — so it moves reported gross margin but **not** the primary metric | **One-off tailwind — explicitly NOT run-rate** | **High on gross margin, nil on adjusted ROS** | Q2 FY26 10-Q, Note 13, p.21 and MD&A p.27 |
| **Intangible amortisation from acquisitions** | $41.1m in Q2 FY26 vs $35.9m a year earlier; $147.1m in FY2025, which was 87% of the entire $169.0m operating adjustment. Rises with every deal | **Headwind on reported margin, excluded from adjusted** | **Mid** | Q2 FY26 10-Q, MD&A p.28; Q1 FY26 presentation, slide 16 |
| **Depreciation step-up from the capex wave** | FY2026 D&A guided ~$230m vs $207.8m in FY2025 (+11%) against guided revenue growth of 37–39% — so the D&A **ratio falls** even as the dollars rise. Segment depreciation rose 21% YoY in Q2 ($17.4m vs $14.4m) | **Tailwind by dilution while growth holds; headwind if growth stops** | **Mid** | `CIQ Estimates→Guidance`, D&A FY2026; Q2 FY26 10-Q, Note 13, p.22 |
| **Net interest expense** | 1.18% of Q2 sales, flat in dollars YoY, FY2026 guided ~$65m. Maverick Power ($1.75bn plus up to $550m earn-out) is funded with "cash and new debt" and will raise it from Q4 2026 | **Neutral now, Headwind from FY2027** | **Mid** | Q2 FY26 10-Q p.3; `CIQ Estimates→Guidance`; `nVent-to-Acquire-Maverick-Power-2026.pdf` |
| **FX on costs** | Currency added only 0.5pp to Q2 revenue growth and 1.2pp to H1; roughly 81% of FY2025 revenue was Americas ($3,158.3m of $3,893.1m). No FX margin effect is disclosed | **Neutral** | **Low** | Q2 FY26 10-Q, MD&A p.26; `CIQ Financials→Segments`, geographic, FY2025 (vendor) |
| **Freight, energy** | Not disclosed as line items or as a share of COGS anywhere in the pool | **Unknown** | **Not assessable** | Named generically only at FY24 10-K, Item 1A |

---

## 6. Margin Drivers By Segment

Segment gross margins below are **computed by this module** from the disclosed segment COGS. They exclude the IEEPA credit, enterprise cost and intangible amortisation, so they are a cleaner price-versus-cost read than the consolidated gross line.

| Segment | Q2 FY26 gross margin | Q2 FY25 | Change | Q2 FY26 segment income margin | Q2 FY25 | Change |
|---|---:|---:|---:|---:|---:|---:|
| Systems Protection | **34.01%** | 36.47% | **−246bps** | **23.2%** | 21.7% | **+150bps** |
| Electrical Connections | **43.11%** | 44.22% | **−110bps** | **27.3%** | 28.7% | **−140bps** |
| *H1 FY26 gross margin, same basis* | *SP 34.22% vs 36.29% = **−207bps***; *EC 42.01% vs 44.38% = **−237bps*** | | | *SP 22.9% (+170bps); EC 25.9% (−260bps)* | | |

Source for every input: Q2 FY26 10-Q, Note 13, p.20 (segment net sales and COGS) and MD&A p.29–30 (segment income margins).

### Segment: Systems Protection (72.5% of H1 FY26 revenue)

| Driver | Impact | Direction | Magnitude | Evidence |
|---|---|---|---|---|
| Volume leverage on SG&A and R&D | SG&A ratio fell from 12.94% to 9.31% of segment sales (−363bps) and R&D from 1.84% to 1.55% (−29bps) on organic sales +62.0%. Check: gross −246 + SG&A +363 + R&D +29 = **+146bps**, versus the +150bps the company reports — ties within rounding | **Tailwind** | **High** | Computed from Q2 FY26 10-Q, Note 13, p.20; company figure at MD&A p.29 |
| Raw-material and labour inflation including tariffs | Named first among the offsets to the segment's margin gain | **Headwind** | **High** | Q2 FY26 10-Q, MD&A p.29 |
| Unfavourable product mix (inside the segment) | Named, unquantified | **Headwind** | **Mid** | Q2 FY26 10-Q, MD&A p.29 |
| Capacity investment (Blaine 1 ramping, Blaine 2 for H1 2027, third site announced 31-Jul-2026) | Named as an offset to the margin gain; a ~60% capacity increase was put to management on the call and not disputed | **Headwind on the gross line** | **Mid** | Q2 FY26 10-Q, MD&A p.29; Q2 FY26 transcript, Q&A (Dean Dray / Wozniak) |
| Productivity and supply-chain efficiency | Named as a positive alongside volume leverage | **Tailwind** | **Mid** | Q2 FY26 10-Q, MD&A p.29 |
| Acquired mix (Electrical Products Group, $45.2m of Q2 segment sales) | Contributed 7.2pp of segment growth; its own margin is not disclosed | **Unknown** | **Not assessable** | Q2 FY26 10-Q, MD&A p.29 |

**Read:** Systems Protection's factory margin is falling (−246bps) while its reported segment margin rises (+150bps). The entire gain is overhead absorption on 62% organic volume growth. That gain is only as durable as the volume.

### Segment: Electrical Connections (27.5% of H1 FY26 revenue)

| Driver | Impact | Direction | Magnitude | Evidence |
|---|---|---|---|---|
| Raw-material inflation including tariffs, copper specifically | Named as the first cause of the margin decline in both Q1 and Q2 FY26. Q1 call named copper explicitly: "higher than expected inflation, primarily due to copper" | **Headwind** | **High** | Q2 FY26 10-Q, MD&A p.30; Q1 FY26 transcript, Q&A (Corona) |
| Price recovery, lagging | Segment margin fell 390bps YoY in Q1 FY26, then only 140bps in Q2 and "improved sequentially back into the high 20s" as pricing took hold. Management expects it to stay "in the high 20s" this year | **Tailwind, improving — guided, not proven** | **High** | Q1 FY26 10-Q, MD&A; Q2 FY26 transcript, prepared remarks and Q&A (Corona) |
| Growth investment in digital, selling and marketing | Named as a cause of the decline. SG&A ratio actually **rose** here, from 13.86% to 14.35% of segment sales (**+49bps**) — the opposite of Systems Protection | **Headwind** | **Mid** | Q2 FY26 10-Q, MD&A p.30; computed from Note 13, p.20 |
| Unfavourable product mix | Named, unquantified | **Headwind** | **Mid** | Q2 FY26 10-Q, MD&A p.30 |
| Volume leverage | Named as the only offset; organic sales +17.9% | **Tailwind** | **Mid** | Q2 FY26 10-Q, MD&A p.30 |

Bridge check: gross −110bps, SG&A −49bps (a drag), R&D +19bps = **−140bps**, exactly the 1.4-point decline the company reports [Q2 FY26 10-Q, MD&A p.30].

**Read:** the two segments are moving in opposite directions and for opposite reasons. Systems Protection wins on overhead absorption despite a worse factory; Electrical Connections loses on price-cost **and** on growth spending, with no offsetting overhead leverage. Anyone modelling group margin off Systems Protection's improvement alone will get the wrong answer — a point `business-model/03_segment-map.md` §2 makes independently.

---

## 7. Margin Bridge — Latest Period

**Bridge target: consolidated gross margin, Q2 FY2026 vs Q2 FY2025 = 37.93% vs 38.60% = −67.9bps** (the 10-Q states "(0.7) pts") [Q2 FY26 10-Q, MD&A p.26].

The bridge is built **structurally** — from disclosed segment revenue and segment cost of goods sold — because that is the only decomposition the pool supports arithmetically. The company does **not** publish a quantified driver bridge in its 10-Qs. It publishes one in its **annual** filing (a Growth/acquisition, Price, Currency, Net productivity split by segment [FY24 10-K, p.26 and p.28]), but the latest such bridge is FY2024 vs FY2023, and no FY2025 10-K exists in this pool. So a volume/price/input-cost split in dollars is **not possible from disclosure** for the latest quarter, and is not fabricated here.

| Component | Margin Impact (bps) | Evidence |
|---|---:|---|
| Volume / operating leverage (at the gross line) | **Not separable** — sits inside "Other" below | Named as a positive offset, unquantified [Q2 FY26 10-Q, MD&A p.27] |
| Price | **Not separable** — sits inside "Other" | Disclosed only combined with productivity: "Price plus productivity offset inflation of more than $50 million" [Q2 FY26 transcript, prepared remarks] |
| Input costs (raw material + labour + tariffs) | **Not separable at the gross line** — sits inside "Other". Gross, before mitigation: **−340bps** (see derivation in §7a) | ">$50 million, including more than $30 million in tariff impact" [Q2 FY26 transcript, prepared remarks] |
| **Mix — segment mix (Systems Protection share +7.25pp at a ~9pp lower gross margin)** | **−56.1** | Computed from Q2 FY26 10-Q, Note 13, p.20 — derivation in §7a |
| Mix — product mix inside each segment | **Not separable** — sits inside "Other" | Named "unfavorable product mix" [Q2 FY26 10-Q, MD&A p.27, p.29, p.30] |
| FX | **Not disclosed** for margin; currency was +0.5pp of revenue growth and ~81% of sales are Americas, so treated as immaterial | Q2 FY26 10-Q, MD&A p.26 |
| **One-offs — IEEPA tariff reimbursement (+$25.8m in COGS)** | **+175.4** | Q2 FY26 10-Q, Note 13, p.21; MD&A p.27 |
| **Other — unallocated / corporate items inside consolidated COGS (net year-on-year)** | **+22.4** | Derived: consolidated COGS reconciles to segment COGS to the cent — derivation in §7a |
| **Other — within-segment gross-margin movement (the net of volume leverage, price, input costs, product mix and capacity cost, which the company does not split)** | **−209.6** | Systems Protection −179.3 and Electrical Connections −29.8 at current weights — derivation in §7a |
| **Total margin change** | **−67.9** | 37.93% − 38.60% [Q2 FY26 10-Q, p.3 and MD&A p.26] |

Sum of the four quantified rows: −56.1 + 175.4 + 22.4 − 209.6 = **−67.9bps**. Reconciles to the observed total.

---

## 7a. Bridge Attribution and Residual (MODULE_RULES "Driver Attribution" / CLAUDE.md §15)

Every derived figure above, with its arithmetic and its basis.

```
Segment mix: (Δ segment weight) × (PRIOR-YEAR segment gross margin, Q2 FY25 basis)
  Systems Protection weight: 1,072.1/1,471.3 = 72.870%  vs  632.0/963.1 = 65.622%   → +7.249pp
  Electrical Connections weight: 27.130% vs 34.378%                                  → −7.249pp
  Prior-year segment gross margins: SP (632.0−401.5)/632.0 = 36.472%
                                    EC (331.1−184.7)/331.1 = 44.216%
  = (+0.07249 × 36.472) + (−0.07249 × 44.216) = +2.644 − 3.205 = −0.561pp
  = -56.1bps of the -67.9bps observed change
  [Q2 FY26 10-Q, Note 13, p.20 — segment net sales and cost of goods sold, both periods]
  → BASIS: weights and margins are both SEGMENT-level and both from the SAME two quarters.
    Weight change is applied to PRIOR-year margins (Laspeyres); the current-weight residual is
    carried in the within-segment row below, so no effect is double-counted.
    → basis matches

Within-segment gross-margin movement: (CURRENT segment weight) × (Δ segment gross margin)
  SP gross margin: (1,072.1−707.5)/1,072.1 = 34.008%  vs  36.472%  → −2.4635pp
  EC gross margin: (399.2−227.1)/399.2   = 43.111%  vs  44.216%  → −1.1050pp
  = (0.72870 × −2.4635) + (0.27130 × −1.1050) = −1.795 − 0.298 = −2.093pp
  = -209.3bps of the -67.9bps observed change
  [Q2 FY26 10-Q, Note 13, p.20]
  → basis matches — same segments, same two quarters, current weights paired with margin deltas

IEEPA tariff reimbursement: +$25.8m ÷ $1,471.3m of Q2 FY26 net sales
  = +1.754pp = +175.4bps of the -67.9bps observed change
  [Q2 FY26 10-Q, Note 13, p.21 (the $25.8m) and MD&A p.27 ("approximately $25 million")]
  → BASIS: the $25.8m is a Q2 FY26 amount divided by Q2 FY26 revenue — matched period.
    It is a credit inside CONSOLIDATED cost of goods sold and is EXCLUDED from segment income,
    which is exactly why it appears here and not in the two segment rows above.
    → basis matches

Unallocated COGS items (the consolidated-vs-segment COGS reconciliation, net YoY):
  Q2 FY26: segment COGS 707.5 + 227.1 = 934.6; consolidated COGS 913.3
           934.6 − 25.8 (IEEPA) + 4.5 (unallocated) = 913.3  → ties to the cent
           effect on margin = −4.5/1,471.3 = −30.6bps
  Q2 FY25: segment COGS 401.5 + 184.7 = 586.2; consolidated 591.3 → unallocated 5.1
           effect = −5.1/963.1 = −53.0bps
  Year-on-year change = −30.6 − (−53.0) = +22.4bps
  [Q2 FY26 10-Q, Statements of Income p.3 and Note 13 p.20]
  → basis matches

Input costs, gross of mitigation (SHOWN FOR SIZE ONLY — deliberately NOT a bridge row):
  ">$50 million" of Q2 inflation ÷ $1,471.3m of Q2 net sales = -340bps (a FLOOR, since ">")
  [Q2 FY26 transcript, prepared remarks (Corona), 31-Jul-2026]
  → BASIS PROBLEM, stated rather than smoothed: this is a MANAGEMENT figure from a CALL
    (tier 6), stated GROSS of mitigation, and management states in the same sentence that
    "price plus productivity offset" it. The offset is disclosed ONLY as a combined number.
    Entering -340bps as a bridge row without an equal-and-opposite mitigation row would
    overstate the input-cost effect by the whole unmeasured offset.
    → REFUSED as a bridge row. It sits, net of its own offset, inside the -209.3bps
      within-segment residual.
```

**Reconciliation.** Sum of the quantified components = −56.1 + 175.4 + 22.4 − 209.3 = **−67.6bps**, against a stated Total of **−67.9bps**. The **−0.3bps gap is rounding** and is not assigned to any component.

**What is genuinely explained, and what is not.** Of the −67.9bps observed:
- **+141.7bps is attributed to a named, computed driver** — segment mix (−56.1), the IEEPA one-off (+175.4), and the unallocated-COGS shift (+22.4).
- **−209.6bps is residual** — the within-segment gross-margin movement (−209.3) plus rounding (−0.3). This module can say **which segments** it came from (Systems Protection −179.3bps, Electrical Connections −29.8bps) but **not which drivers**, because the company discloses volume leverage, price, productivity, input costs, product mix and capacity cost only as an unquantified list in each quarter and only as one combined "price plus productivity offset inflation" figure on the call.

**This residual is the finding, not a caveat.** Roughly three times as much of the gross-margin move is unattributed to a driver as is attributed. Any downstream claim of the form "input costs drove the gross-margin decline" cannot be supported from this pool at the gross line, and Section 8 therefore does **not** name its biggest driver off this bridge — it names it off the **operating**-margin bridge, where the arithmetic is exact (see §8).

RF-EARN-002: margin bridge reconciled — explained 141.7bps, residual -209.6bps, total -67.9bps

---

## 8. The Single Biggest Margin Driver

**Volume-driven operating leverage on SG&A.** If organic sales growth stalls, this is what compresses margins fastest and furthest.

The arithmetic that supports naming it, at the level where the arithmetic is exact. Q2 FY26 reported operating margin rose **+416.7bps** (20.44% vs 16.27%), and that move decomposes with no residual: gross margin **−67.9bps**, SG&A ratio **+452.8bps**, R&D ratio **+31.8bps** — sum **+416.7bps**, tying to the cent [Q2 FY26 10-Q, Statements of Income p.3; MD&A p.26]. The SG&A line alone is **109%** of the observed operating-margin gain, so it clears the "roughly half" test set by MODULE_RULES with room to spare, and it does so on the reported line rather than on the gross-margin bridge whose residual is large. Stripping intangible amortisation out of both years, the SG&A ratio still falls 359bps — so this is fixed overhead spread across organic sales up 46.9%, not an accounting effect [Q2 FY26 10-Q, MD&A p.26 and p.28]. The same mechanism is visible inside Systems Protection, where a **−246bps** fall in factory gross margin still produced a **+150bps** rise in segment margin purely because the segment's SG&A ratio dropped 363bps.

**Current direction: strongly favourable, and running near its own limit.** Adjusted ROS reached 21.9% in Q2 FY26, up 110bps, the highest in the eight quarters in the pool; adjusted EBITDA margin of 23.0% is likewise the highest of the eight [`01_historical-financials.md`, §3; Q2 FY26 transcript, prepared remarks].

**Why it is the biggest risk rather than the biggest comfort.** Operating leverage is symmetric and the fixed base is being enlarged on purpose. Three Minnesota liquid-cooling plants are now committed (Blaine 1 ramping through 2026 into 2027, Blaine 2 opening H1 2027, a third site announced 31-Jul-2026), FY2026 capex is guided at ~$130m (up ~40%), D&A is guided at ~$230m, and management describes data-centre orders as "large and lumpy" [Q2 FY26 transcript, prepared remarks and Q&A; `CIQ Estimates→Guidance`]. Management has already told the market where the ceiling is: it guides **"mid-20s incrementals"** for H2 FY26 and confirmed the pre-divestiture 30% figure is no longer the target, "to ensure that we can invest to support the growth" [Q2 FY26 transcript, Q&A (Corona / Scott Graham)]. So the leverage that produced 453bps in Q2 is being deliberately spent back into capacity, product and digital.

**The honest counterweight, named (CLAUDE.md §3).** Two figures in this module's own evidence point the other way from the improving-margin story. First, the gross line ex-IEEPA fell **243bps**, not 70bps — the factory is losing the price-cost fight even as the overhead ratio improves. Second, the residual in §7 is −209.6bps against +141.7bps explained, so the gross-margin deterioration is mostly unattributed. Neither overturns the operating-leverage verdict — the +416.7bps operating-margin decomposition ties exactly and SG&A carries all of it — but both mean the verdict rests on **overhead absorption, not on manufacturing economics**, and would not survive a volume stall.

---

## 9. Investment Spend — Both Signs

Capex is running well above its own history in dollars: **$93.3m (FY2025) → ~$130m guided (FY2026), +39%**, with "nearly $60 million" spent in H1 FY26, "up over 50% versus last year" [`CIQ Financials→Cash Flow`, FY2025, vendor; Q2 FY26 transcript, prepared remarks]. This section is therefore required, and both signs are scored.

| Reading | What it would show | Evidence here |
|---|---|---|
| **Spend as a future COST** | A depreciation step-up landing in COGS, plus start-up and under-absorption cost before the plants fill | **The cost is already visible and already in the numbers.** "Investments in capacity to drive growth" is named as a distinct gross-margin drag in **both** FY26 quarters and in **both** segment discussions [Q1 FY26 10-Q, MD&A p.24; Q2 FY26 10-Q, MD&A p.27, p.29, p.30]. Segment depreciation rose 21% YoY in Q2 ($17.4m vs $14.4m) [Note 13, p.22]. Recognition lag is short and disclosed: Blaine 1 opened "within approximately 100 working days" of signing and is "still ramping through this year and into 2027"; Blaine 2 opens H1 2027 [Q2 FY26 transcript, prepared remarks and Q&A]. **But the ratio is not deteriorating:** capex ÷ sales is ~2.42% on guided FY2026 revenue ($130m ÷ $5,372m) versus 2.40% in FY2025 ($93.3m ÷ $3,893.1m) — capex is up 39% because sales are up 38%, so on an intensity basis this is **not** a capex wave. D&A guided at ~$230m against ~$5,372m of guided sales is **4.28% of revenue versus 5.34% in FY2025** — the D&A ratio **falls 106bps** [`CIQ Estimates→Guidance`, D&A and Capex FY2026; `04_guidance-consensus.md`, §2] |
| **Spend as a DEMAND signal** | Backlog / contracted revenue, and management naming supply rather than demand as the binding constraint | **Backlog $2.5bn at 30-Jun-2026, "giving us visibility through the year and into 2027"** [Q2 FY26 transcript, prepared remarks]. Against $749.3m at 31-Dec-2024 and $462.8m at 31-Dec-2023 [FY24 10-K, Item 1 — Backlog], that is a 3.3x rise in eighteen months. **Management states the constraint is supply, not demand**, in its own words: capacity is being added because these businesses "are rapidly growing and more capacity is needed to meet customer demand"; on Blaine 2, "with the demand that we're seeing … we needed to ramp another facility because it takes time to get them online", and the added capacity "takes us through '27 and into '28" [Q2 FY26 transcript, prepared remarks and Q&A (Wozniak)]. Data-centre sales are expected above **$2bn in 2026, "more than double last year"**, and visibility runs "several years out", working with NVIDIA "on their road maps out through 2030" [same]. Capacity is being sold before it is built |

**Current read: the evidence favours the DEMAND reading, and the numbers back it rather than merely the language.** Capex intensity is flat, the D&A ratio falls 106bps, adjusted ROS rose 110bps *while* the capacity cost was being absorbed, and the backlog is 3.3x its level eighteen months ago with management naming supply as the binding constraint. A spend that is fully absorbed inside a rising margin, at unchanged intensity, against contracted revenue, is closer to a booking than to an expense. Reading it only as a future cost would invert the signal.

**The ONE observable that would flip it: organic order growth versus organic sales growth.** In Q2 FY26 organic **orders** grew "low double digits" while organic **sales** grew **46.9%** [Q2 FY26 transcript, prepared remarks (Wozniak); Q2 FY26 10-Q, MD&A p.26]. Backlog is being consumed faster than it is being replaced, and the reported backlog figure edged down from **$2.6bn at end-Q1 2026** to **$2.5bn at end-Q2** [2026 William Blair Conference presentation, 3-Jun-2026, slide 7; Q2 FY26 transcript]. *Both are rounded management figures given outside a filing, so a $0.1bn move is within their own rounding and must not be read as a measured 4% decline* — but the direction of travel is the thing to watch, and the orders-versus-sales gap is not a rounding artefact. If organic orders stay in low double digits for another two quarters while newly built capacity comes online, the same spend flips from a booking to an under-absorbed fixed cost, and the 453bps of SG&A leverage identified in §8 reverses. Confirmation runs the other way: management said "we've had strong data center orders thus far in Q3" [Q2 FY26 transcript, prepared remarks] — an unverified forward statement, not a reported figure, and exactly the item the Q3 print on 30-Oct-2026 will test.

---

## 10. Cycle Position (MODULE_RULES Cycle-Position Rule — Hard Rule)

**The latest reported period sits at or very near a cyclical PEAK. Q2 FY2026 margins are NOT a normalised run-rate.**

Evidence, all from the pool:

| Observable | Latest | Prior trough / earlier level | Source |
|---|---|---|---|
| Organic revenue growth | **+46.9%** (Q2 FY26) | +2.4% (FY2024), +5.1% (FY2023) | Q2 FY26 10-Q, MD&A p.26; FY24 10-K, p.24 |
| Adjusted EBITDA margin | **23.0%** — highest of the eight quarters in the pool | 21.2% (Q4 FY25) | `01_historical-financials.md`, §3 |
| Adjusted ROS | **21.9%** — highest disclosed | 20.0% (Q1 FY26), 20.2% (FY2025) | Q2 FY26 transcript; Q1 FY26 presentation, slide 16 |
| Infrastructure share of sales | **~60%** (H1 FY26) | 45% (FY2025), **12% at spin** | 2026 William Blair presentation, slide 7; Q2 FY26 transcript |
| Systems Protection share of revenue | **72.5%** (H1 FY26) | 60.7% (FY2024, audited) | Q2 FY26 10-Q, Note 13; FY24 10-K, Note 15 |
| Segment income margin, Systems Protection | **23.2%** — above every annual figure since spin | 17.0% (FY2022) | Q2 FY26 10-Q, MD&A p.29; FY24 10-K, p.25 |

The margin is being earned on one capital-spending cycle. Infrastructure organic sales "more than doubled" in Q2 while industrial and commercial/residential were "each flattish" [Q2 FY26 transcript, prepared remarks], so the cyclical breadth is narrow. The business-model module reaches the same conclusion independently and flags the same concentration [`business-model/10_external-dependency.md`; `business-model/02_business-identity.md`, §3a — CLAUDE.md §24 filter 5]. **No divergence to reconcile.**

**One-time policy item, labelled: the $25.8m IEEPA tariff reimbursement is NOT run-rate.** It is a refund of tariffs previously paid under a US emergency-powers statute, it added **+175bps to reported Q2 gross margin**, the company itself excludes it from segment income and from adjusted operating income, and the 10-Q states it "was offset by other incremental tariffs compared to the prior year periods" [Q2 FY26 10-Q, Note 13, p.21 and MD&A p.27]. It can reverse to zero next quarter, and the *incremental* tariffs it offset do not. Any downstream agent building a terminal margin, a bear case, or a leverage denominator must use the **ex-IEEPA gross margin of 36.17%**, not the reported 37.93%.

---

## 11. Limitations Carried Forward

- **No FY2025 Form 10-K in the pool.** FY2025 cost lines, the FY2025 segment note and the FY2025 MD&A margin bridge are absent; FY2025 figures are tier-5 vendor data [`00_earnings-data-triage.md`, §5]. The most recent **company-published quantified margin bridge** (Growth/acquisition, Price, Currency, Net productivity, by segment) is FY2024 vs FY2023 [FY24 10-K, p.26 and p.28].
- **Two verbatim transcripts are present** (1-May-2026 FactSet; 31-Jul-2026 S&P Global), so no transcript-absence limitation and no sell-side-proxy cap applies. No score cap from MODULE_RULES binds on this pool.
- **Raw materials, freight, energy and labour are not disclosed** as line items or as shares of COGS. No input-cost sensitivity in dollars per unit or per tonne exists in the pool, so any elasticity beyond management's own combined figures would be invented.
- **Price and productivity are never split.** Management reports them only combined. The 2023 precedent shows price was then the dominant lever (+4.2 / +4.0 points of segment margin) [FY24 10-K, p.26, p.28]; whether that still holds in 2026 is **Not proven from available data**.
- **Backlog is disclosed by segment nowhere**, and the current group figure exists only as a rounded number on an earnings call, not in a filing.
- **Post-period event outside every number here:** the Maverick Power acquisition ($1.75bn plus up to $550m earn-out, ~$700m estimated 2026 revenue, close expected Q4 2026) was announced 24-Aug-2026 — after the Q2 10-Q, after the consensus export (7-Aug-2026) and after the price mark (12-Aug-2026). Its segment placement, its own margin, its intangible amortisation and its interest cost are all undisclosed. It is a live, unquantified margin driver [`nVent-to-Acquire-Maverick-Power-2026.pdf`].



---

## earnings / 04_guidance-consensus.md

_Source: `04_guidance-consensus.md`_

# Guidance & Consensus — NVT

**Evidence binding: frozen.** All reads resolved through generation `6db32848…1aecd1e6` (`manifest.json`, `corpus.txt`, `ciq_facts.json`, per-tab extracts). Live `data/NVT/` was not read; `data/NVT/` is a citation label only.

**Reporting basis for everything below:** US GAAP, USD, in millions except per-share. Fiscal year ends 31 December. "Adjusted EPS" is the company's own non-GAAP measure; Capital IQ maps it to its **EPS Normalized** line, and the vendor's own guidance row for that line carries the company's $5.00–$5.10 range, so the two are matched. GAAP EPS is shown separately and never mixed with it.

---

## 1. Consensus Data Metadata

| Field | Value |
|---|---|
| Source | **Capital IQ** — `nVentElectricplcNYSENVTEstimatesReport.xls`, tabs `Consensus` / `Guidance` / `Trends` / `Revisions` / `Recent Changes` / `Surprise` (pool export; **not** web-sourced, not from memory) |
| Data as of date | Workbook current as of **~12-Aug-2026**; latest broker revision in `Recent Changes` dated **7-Aug-2026** (Morningstar, Aguilar). Market summary price 170.70 / last close 171.16 |
| Fiscal year basis | Company fiscal year = calendar year, ends **Dec-31-2026** (`CIQ Estimates→Consensus` header: "Current Fiscal Year End: Dec-31-2026") |
| Analyst count | FQ3 2026: adj EPS **14/14**, revenue **14/14**, EBITDA **8/10**. FY2026: adj EPS **16/16**, revenue **16/17**, EBITDA **11/14**. Target price 15/15; recommendation Buy (1.24) from 15 Buy / 1 Outperform / 0 Hold / 1 Underperform / 1 No Opinion |
| Currency | **USD** (`CIQ Estimates→Consensus`, "US GAAP\|USD") |
| Calendarization issue? | **N** — NVT is a US SEC domestic filer reporting on a calendar fiscal year; the vendor's fiscal-quarter labels (FQ3 2026 – Sep 2026) map one-for-one onto the company's own reported quarters. See §1A |

**Not stale.** The latest broker revision (7-Aug-2026) postdates the Q2 FY26 print (call 31-Jul-2026), so the estimates have absorbed the latest reported quarter. The stale-consensus guard does **not** trigger and the bar verdict below is not provisional on that ground. A separate, real staleness exists and is flagged in §7: the export predates the **24-Aug-2026 Maverick Power** acquisition announcement.

---

## 1A. Reporting-Basis Reconciliation (CLAUDE.md §27 — done before any bar is quoted)

| Field | Value |
|---|---|
| Next period the company will actually FILE | **Q3 FY2026 — the standalone three months ended 30-Sep-2026**, presented alongside the cumulative nine months ended 30-Sep-2026 |
| Expected filing date + source for that date | Results release **30-Oct-2026** (`CIQ Estimates→Consensus`, header line: "FQ3 2026 Earnings Release Date: Oct-30-2026" — vendor's expected date, not a company-confirmed date); the Form 10-Q follows the release |
| What that filing contains | **Both, side by side.** The Q2 FY26 10-Q prints "Three Months Ended" and "Six Months Ended" columns together (`Q2 FY26 10-Q, condensed consolidated statements of operations` — net sales $1,471.3 three-month / $2,713.3 six-month). Q3 will print three-month and nine-month columns the same way. The headline beat/miss is judged on the **standalone quarter** |
| Vendor estimate as pulled (period label + value) | **FQ3 2026 – Sep 2026, standalone:** revenue **$1,427.27m**; adjusted (normalized) EPS **$1.3899**; GAAP EPS **$1.24636**; EBITDA **$329.29m** [`CIQ Estimates→Consensus`, Fiscal Quarters block, col FQ3 2026] |
| Already-reported stub inside that period (period + actuals + citation) | **None inside the standalone quarter** — a US 10-Q quarter contains no prior stub. For the cumulative nine-month column the stub is H1 FY26: net sales **$2,713.3m** [`Q2 FY26 10-Q, statements of operations, six months ended 30-Jun-2026`], adjusted EPS **$1.09 + $1.45 = $2.54** [`CIQ Estimates→Consensus` FQ1/FQ2 2026 EPS Normalized actuals; corroborated by `Q2 FY26 transcript, prepared remarks` — Q2 adjusted EPS $1.45] |
| **Consensus restated onto the filing basis** — arithmetic shown | **Standalone Q3 bar = $1,427.27m revenue / $1.3899 adjusted EPS — no restatement required.** The vendor's estimate is already standalone-quarter, which is exactly what the 10-Q's three-month column reports. For the cumulative nine-month column the bar is `2,713.3 + 1,427.27 = **$4,140.6m** revenue` and `2.54 + 1.3899 = **$3.93** adjusted EPS` |
| Basis-restated bar vs the same period a year earlier | **Q3 (standalone):** revenue bar $1,427.27m vs Q3 2025 actual $1,054.0m = **+35.4%**; adjusted EPS bar $1.3899 vs Q3 2025 actual $0.91 = **+52.7%** [`CIQ Estimates→Consensus`, FQ3 2025 actual column — vendor data; no Q3 FY25 10-Q exists in this pool]. **Nine months:** revenue bar $4,140.6m vs 9M 2025 actual $2,826.4m (809.3 + 963.1 + 1,054.0) = **+46.5%** [Q1/Q2 2025 from `Q1 FY26 10-Q` and `Q2 FY26 10-Q` comparative columns; Q3 2025 vendor] |

**Sanity check.** For the standalone bar the stub-ratio test does not apply (no stub sits inside a US quarterly period) — the check is instead that the vendor's period label and the filed period are the same shape, which they are. Applying the ratio test to the cumulative column as a cross-check: restated nine-month bar ÷ reported six-month stub = 4,140.6 / 2,713.3 = **1.53x**. For a nine-month period with two of three quarters already reported, roughly 1.5x is the expected shape; a ratio near 1.0 would have signalled an unconverted standalone estimate. No conversion error is present.

**Every "bar" figure quoted downstream in this file, and by `05_beat-miss-setup` and `99_earnings-synthesis`, is the standalone-quarter figure above, labelled as such.**

---

## 2. Management Guidance

All figures below were guided on the **Q2 FY2026 earnings call, 31-Jul-2026** unless stated. Capital IQ independently records the same guidance with guidance date `2026-07-31` [`CIQ Estimates→Guidance`, cols FQ3 2026 / FY 2026], which is a clean cross-check that the vendor and the call agree.

| Metric | Period | Guidance | Type | Source |
|---|---|---|---|---|
| Reported sales growth | FY2026 | **+37% to +39%** (midpoint +38%) | Range | `Q2 FY26 transcript, prepared remarks (CFO Corona)` |
| Organic sales growth | FY2026 | **+32% to +34%** (midpoint +33%) | Range | `Q2 FY26 transcript, prepared remarks` |
| Revenue (implied in dollars) | FY2026 | **$5,333.55m – $5,411.41m** (midpoint **$5,372.48m**) | Range, derived | `CIQ Estimates→Guidance`, FY 2026 revenue guidance row, guidance date 2026-07-31. Reconciles to the call: FY2025 revenue $3,893.1m × 1.37 = 5,333.5; × 1.39 = 5,411.4 [`CIQ Financials→Income Statement`, 12m Dec-31-2025] |
| Adjusted EPS | FY2026 | **$5.00 – $5.10** (midpoint **$5.05**); +50% at the midpoint vs FY2025 | Range | `Q2 FY26 transcript, prepared remarks`; `CIQ Estimates→Guidance`, EPS Normalized FY 2026 |
| GAAP EPS | FY2026 | **$4.29 – $4.39** (midpoint $4.34) | Range | `CIQ Estimates→Guidance`, EPS (GAAP) FY 2026, guidance date 2026-07-31 |
| Reported **and** organic sales growth | Q3 FY2026 | **+32% to +35%** (midpoint +33.5%) | Range | `Q2 FY26 transcript, prepared remarks` |
| Revenue (implied in dollars) | Q3 FY2026 | **$1,391.28m – $1,422.90m** (midpoint **$1,407.09m**) | Range, derived | `CIQ Estimates→Guidance`, FQ3 2026 revenue row. Reconciles to the call: Q3 2025 revenue $1,054.0m × 1.32 = 1,391.3; × 1.35 = 1,422.9 |
| Adjusted EPS | Q3 FY2026 | **$1.35 – $1.38** (midpoint **$1.365**); +50% at the midpoint vs Q3 2025 | Range | `Q2 FY26 transcript, prepared remarks`; `CIQ Estimates→Guidance`, EPS Normalized FQ3 2026 |
| GAAP EPS | Q3 FY2026 | **$1.18 – $1.21** (midpoint $1.195) | Range | `CIQ Estimates→Guidance`, EPS (GAAP) FQ3 2026 |
| Capex | FY2026 | **~$130m**, up ~40% year on year | Point | `Q2 FY26 transcript, prepared remarks`; `CIQ Estimates→Guidance`, Capital Expenditure FY 2026 = −130 |
| Free-cash-flow conversion (FCF ÷ adjusted net income, company-defined) | FY2026 | **90% – 95%** (midpoint 92.5%) | Range, qualitative basis | `Q2 FY26 transcript, prepared remarks` — "we still expect conversion of 90% to 95%" |
| Tariff cost impact | FY2026 | **~$100m**, raised from ~$80m previously; expected to be offset by price, supply-chain productivity and mitigating actions | Point | `Q2 FY26 transcript, prepared remarks` |
| Interest expense | FY2026 | **~−$65m** (guided 1-May-2026, not re-guided 31-Jul) | Point | `CIQ Estimates→Guidance`, Interest Expense FY 2026, guidance date 2026-05-01 |
| Depreciation & amortization | FY2026 | **~$230m** (guided 1-May-2026) | Point | `CIQ Estimates→Guidance`, D&A FY 2026, guidance date 2026-05-01 |
| Second-half margin shape | H2 FY2026 | **"mid-20s incrementals in the second half"** — i.e. roughly 25 cents of incremental profit per incremental dollar of sales, embedded in the guide | Qualitative | `Q2 FY26 transcript, Q&A (CFO Corona)` |

Range midpoints are calculated above and are what the gap table in §3 uses.

**Guidance path this year — two raises, both large.** FY2026 adjusted EPS was originally guided **$4.00–$4.15** (Feb-2026), raised to **$4.45–$4.55** on 1-May-2026 [`Q1 FY26 transcript, prepared remarks`], then to **$5.00–$5.10** on 31-Jul-2026 [`Q2 FY26 transcript, prepared remarks`]. Organic sales growth went **+10–13% → +21–23% → +32–34%** over the same two calls. The FY2026 adjusted-EPS midpoint has been lifted **+25.5%** in five months (4.075 → 5.05).

**No guidance is given for:** EBITDA, segment-level revenue or margin, or Q4 FY2026 standalone. Q4 must be inferred from the FY guide less the Q3 guide (done in §3).

---

## 3. Guidance vs Consensus Table

Gap = Consensus − Guidance midpoint. Positive = the Street sits above what management guided.

### Q3 FY2026 (the next standalone quarter to be filed — the operative bar)

| Metric | Period | Management Guidance (midpoint) | Street Consensus | Gap | Gap Direction |
|---|---|---|---|---:|---|
| Revenue | Q3 FY26 | $1,391.28–1,422.90m (mid **$1,407.09m**) | **$1,427.27m** (14 est.) | **+$20.18m / +1.43%** | Consensus above guidance midpoint; **+0.31% above the guidance HIGH end** |
| Adjusted EPS | Q3 FY26 | $1.35–1.38 (mid **$1.365**) | **$1.3899** (14 est.) | **+$0.0249 / +1.82%** | Consensus above midpoint; **+0.72% above the HIGH end** |
| GAAP EPS | Q3 FY26 | $1.18–1.21 (mid **$1.195**) | **$1.24636** (6 est.) | **+$0.0514 / +4.30%** | Consensus above midpoint and above the high end |
| EBITDA | Q3 FY26 | **Not guided** | $329.29m (8 of 10 est.) | n/a | No guidance to compare |

### FY2026

| Metric | Period | Management Guidance (midpoint) | Street Consensus | Gap | Gap Direction |
|---|---|---|---|---:|---|
| Revenue | FY26 | $5,333.55–5,411.41m (mid **$5,372.48m**) | **$5,435.31m** (16 of 17 est.) | **+$62.83m / +1.17%** | Consensus above midpoint; **+0.44% above the HIGH end** |
| Adjusted EPS | FY26 | $5.00–5.10 (mid **$5.05**) | **$5.11301** (16 est.) | **+$0.063 / +1.25%** | Consensus above midpoint; **+0.26% above the HIGH end** |
| GAAP EPS | FY26 | $4.29–4.39 (mid **$4.34**) | **$4.47538** (8 of 9 est.) | **+$0.135 / +3.12%** | Consensus above midpoint and above the high end |
| EBITDA | FY26 | **Not guided** | $1,225.02m (11 of 14 est.) | n/a | No guidance to compare |
| Capex | FY26 | **−$130m** | **−$131.12m** (9 of 10 est.) | −$1.12m / 0.9% more spend | Street assumes marginally more capex than guided |

Consensus source for all rows: `CIQ Estimates→Consensus` (Fiscal Quarters and Fiscal Years blocks); guidance source per §2.

**Where the FY gap actually sits — the implied Q4.** Do the arithmetic rather than leave the FY gap as a blended number:

- H1 FY26 actual revenue = **$2,713.3m** [`Q2 FY26 10-Q, six months ended 30-Jun-2026`]
- FY26 guidance midpoint revenue = $5,372.48m → implied H2 = 5,372.48 − 2,713.3 = **$2,659.18m**
- Q3 guidance midpoint = $1,407.09m → **guidance-implied Q4 revenue = 2,659.18 − 1,407.09 = $1,252.09m**
- Street Q4 FY26 consensus revenue = **$1,318.67m** (14 est.)
- **Gap at the Q4 level = +$66.58m, or +5.32%** above what the company's own FY and Q3 guidance imply.

So the Street's total-year gap of +1.17% is not spread evenly: roughly **1.4% of stretch sits in Q3 and 5.3% in Q4**. The Q4 number is where consensus has run furthest ahead of the guide. Note the two-sided reading: the guidance-implied Q4 is a *sequential decline* from the Q3 guide (1,407.1 → 1,252.1, −11.0%), a shape an analyst pushed back on directly on the call, and management defended it as prudence against a tougher comparison rather than as a demand slowdown — "we guided 32% to 35% in the third quarter … the 2-year stack in the third quarter is 50% growth" [`Q2 FY26 transcript, Q&A (CFO Corona)`]. Whether the implied Q4 is conservatism or a real step-down is the single unresolved question in this setup, and it belongs to `05_beat-miss-setup`.

**One internal inconsistency in the vendor data, stated rather than smoothed:** the FY2026 revenue consensus of $5,435.31m does not equal the sum of the four quarterly consensus figures (1,242.0 actual + 1,471.3 actual + 1,427.27 + 1,318.67 = **$5,459.24m**, a $23.9m / 0.44% difference). The panels differ — 16 of 17 contributors on the FY line versus 14 on each quarter — so the two are not the same set of analysts. Neither number is wrong; they are not interchangeable, and the Q4 arithmetic above uses the FY figure consistently on both sides.

---

## 4. Estimate Revision Momentum Table

Source: `CIQ Estimates→Trends` (all rows), workbook current ~12-Aug-2026. The vendor's buckets are "3 months ago / 2 months ago / 1 month ago / Current", which map onto the 90/60/30-day columns below; the mapping is stated so the reader is not told these are exact day counts.

| Estimate | 90 Days Ago (3mo) | 60 Days Ago (2mo) | 30 Days Ago (1mo) | Current | Direction |
|---|---:|---:|---:|---:|---|
| Revenue, next Q (FQ3 2026) | 1,264.06 | 1,264.06 | 1,265.86 | **1,427.27** | **Rising** (+12.9% over 90 days; +12.8% in the last month alone) |
| Adjusted EPS, next Q (FQ3 2026) | 1.18 | 1.18 | 1.19 | **1.39** | **Rising** (+17.8% over 90 days) |
| Revenue, FY2026 | 4,994.99 | 5,000.73 | 5,013.83 | **5,435.31** | **Rising** (+8.8%) |
| Adjusted EPS, FY2026 | 4.58 | 4.59 | 4.61 | **5.11** | **Rising** (+11.6%) |
| EBITDA, FY2026 | 1,097.84 | 1,097.84 | 1,102.57 | **1,225.02** | **Rising** (+11.6%) |
| Revenue, FY2027 | 5,655.32 | 5,692.66 | 5,769.18 | **6,368.58** | **Rising** (+12.6%) |
| Adjusted EPS, FY2027 | 5.57 | 5.62 | 5.74 | **6.43** | **Rising** (+15.5%) |
| GAAP EPS, FY2026 | 3.77 | 3.77 | 3.78 | **4.48** | **Rising** (+18.8%) |

**Read the shape, not just the direction.** Estimates were close to flat from 90 days to 30 days ago (FY2026 adjusted EPS moved 4.58 → 4.61, +0.7% in two months) and then jumped in the final month (4.61 → 5.11, +10.8%). Essentially the whole revision is the Street catching up to the 31-Jul-2026 guidance raise, not a series of independent upgrades ahead of it. The longer history in the same tab shows the trend is not new: FY2026 adjusted EPS was 3.39 eighteen months ago and 4.14 six months ago, so the number has risen **+50.7%** in eighteen months.

---

## 5. Revision Breadth

Source: `CIQ Estimates→Revisions`. Net breadth = upward − downward. This reconciles to the deterministic sidecar, which records `EPS (GAAP) FY 2026: 6↑/0↓ last mo` and `Revenue FY 2026: 14↑/0↓ last mo` [`ciq_facts.json`, `eps_revisions` / `revenue_revisions`] — no gap between the sidecar's read and mine.

| Metric | Up Revisions | Down Revisions | Net Revision Breadth | Period |
|---|---:|---:|---:|---|
| Revenue FY2026 | 14 | 0 | **+14** (of 15 analysts) | Last month |
| EBITDA FY2026 | 10 | 0 | **+10** (of 10) | Last month |
| Adjusted EPS FY2026 | 14 | 0 | **+14** (of 15) | Last month |
| GAAP EPS FY2026 | 6 | 0 | **+6** (of 7) | Last month |
| Revenue FQ3 2026 | 12 | 0 | **+12** (of 12) | Last month |
| EBITDA FQ3 2026 | 6 | 0 | **+6** (of 6) | Last month |
| Adjusted EPS FQ3 2026 | 12 | 0 | **+12** (of 12) | Last month |
| Revenue FY2026 | 13 | 0 | **+13** (of 14) | Last 3 months |
| Adjusted EPS FY2026 | 13 | 0 | **+13** (of 14) | Last 3 months |
| EBITDA FY2026 | 10 | 0 | **+10** (of 10) | Last 3 months |
| Revenue FY2027 | 14 | 0 | **+14** (of 16) | Last month |
| Adjusted EPS FY2027 | 14 | 0 | **+14** (of 15) | Last month |

**Zero downward revisions on revenue, EBITDA or adjusted EPS for FY2026, FY2027 or FQ3 2026 across the last three months.** The only downgrades anywhere in the tab are on dividend per share (2 down on FY2026), on interest expense (a cost line, where 3 of 8 moved the expense higher last month), and one analyst cutting FQ1 2027. That is as one-sided as revision breadth gets, and it is a warning as much as a comfort: there is no remaining pool of bears to convert.

---

## 6. Historical Beat / Miss Pattern

Surprise percentages are the vendor's own, computed against its pre-print consensus [`CIQ Estimates→Surprise`, Fiscal Quarters block]. Positive = beat.

| Period | Revenue Beat/Miss | Adjusted EPS Beat/Miss | Magnitude (EBITDA) | Notes |
|---|---|---|---:|---|
| Q3 2025 (FQ3'25) | Beat **+4.81%** | Beat **+3.41%** | +2.63% | Modest across the board |
| Q4 2025 (FQ4'25) | Beat **+6.17%** | **In line, 0.00%** | −3.95% | EPS exactly met; EBITDA missed |
| Q1 2026 (FQ1'26) | Beat **+12.00%** | Beat **+15.96%** | +14.56% | Step-change; data-centre ramp |
| Q2 2026 (FQ2'26) | Beat **+16.90%** | Beat **+25.00%** | +21.27% | Largest beat in the eight-year quarterly history in this tab |

Longer window, adjusted EPS surprise, eight quarters: FQ3'24 **−22.2%** (the one clear miss), FQ4'24 0.0%, FQ1'25 +1.5%, FQ2'25 +8.9%, FQ3'25 +3.4%, FQ4'25 0.0%, FQ1'26 +16.0%, FQ2'26 +25.0%. **Five beats, two in-line, one miss.** Annual adjusted-EPS surprise has been positive in each of the last four years (+0.5% FY2022, +1.0% FY2023, −0.4% FY2024, +0.6% FY2025) [`CIQ Estimates→Surprise`, annual block] — small at the full-year level because guidance converges by Q4.

**The more useful record: actual versus the company's OWN guidance.**

| Quarter | Adjusted EPS guided | Actual | vs guidance HIGH end |
|---|---|---:|---:|
| Q1 FY26 | $0.90 – $0.93 (given 6-Feb-2026) | **$1.09** | **+17.2%** |
| Q2 FY26 | $1.12 – $1.15 (given 1-May-2026) | **$1.45** | **+26.1%** |

Guidance ranges from `CIQ Estimates→Consensus`, FQ1/FQ2 2026 EPS Normalized "Guidance Low / Guidance High" rows; Q2 actual corroborated verbatim at `Q2 FY26 transcript, prepared remarks` ("Adjusted EPS grew 69% year-over-year to $1.45"). The same pattern shows in the vendor's guidance-versus-actual net-income rows: Q1 FY26 guided $150m, actual $179.2m (+19.5%); Q2 FY26 guided $187m, actual $237.2m (+26.8%) [`CIQ Estimates→Guidance`, Net Income (Excl. Excep.)].

**And the position of consensus relative to guidance before each of those beats — the base rate that matters here:**

| Quarter | Guidance high end | Pre-print consensus | Consensus vs guidance high | Realised adjusted-EPS surprise |
|---|---:|---:|---:|---:|
| Q1 FY26 | $0.93 | $0.94199 | **+1.29%** | **+16.0%** |
| Q2 FY26 | $1.15 | $1.16378 | **+1.20%** | **+25.0%** |
| **Q3 FY26 (current)** | **$1.38** | **$1.3899** | **+0.72%** | *pending* |

Consensus sitting just above the top of the guided range is NVT's normal state, not a new stretch — and on the last two occasions it did not prevent a beat of 16% and 25%. On this measure the current setup is if anything marginally *less* demanding than the two quarters that produced those beats. Base-rate caveat per CLAUDE.md §10: this is a **two-observation** comparison inside an eight-quarter surprise history. It is judgment informed by a small sample, not a measured frequency, and both observations sit inside the same data-centre demand upswing — it would not survive a change in that cycle.

---

## 7. Bar Assessment

**Bar is fair.**

Consensus is not below guidance and estimates have not been cut, so the setup is not "low": the Street sits **above the top end** of the guided range on both the Q3 and FY2026 revenue and adjusted-EPS lines (+0.31% / +0.72% for Q3; +0.44% / +0.26% for FY26), and estimates have been marked up hard — FQ3 adjusted EPS +17.8% and FY2026 revenue +8.8% in ninety days, with **zero downward revisions** on revenue, EBITDA or adjusted EPS across FY2026, FY2027 and FQ3 2026 over three months. But the gaps are too small to call the bar high: +1.8% above the Q3 adjusted-EPS midpoint is a fraction of the +16% and +25% by which the company beat consensus in the last two quarters, and consensus has sat 1.2–1.3% above the guidance high end before each of those beats, so this positioning has a two-quarter record of being cleared rather than missed. The one place the Street has genuinely run ahead is the **implied fourth quarter**: consensus Q4 revenue of $1,318.67m is **+5.32%** above the $1,252.09m the company's own FY and Q3 guidance imply — roughly four times the stretch embedded in the Q3 number, and that is where the year's miss risk concentrates.

Two things sit outside the numbers above and both push the same way. First, the export's revision cut-off is 7-Aug-2026, so **no analyst estimate in this pool includes the Maverick Power acquisition** announced 24-Aug-2026 — $1.75bn purchase price, roughly **$700m of estimated 2026 revenue**, expected to close in Q4 2026 and, in the company's own words, "accretive to adjusted earnings per share in the first year following completion" [`nVent press release, 24-Aug-2026`]. That is company language about a deal that has not closed, not an audited number, and the closing date is subject to regulatory approval — but a business of that size arriving inside the guided Q4 is a material item the FY2026 bar does not contain in either direction. Second, management said plainly it is holding back: "it's important that we're prudent in our guidance, and we'll continue to be that way to give ourselves the flexibility" [`Q2 FY26 transcript, Q&A (CFO Corona)`], against a Q3 comparison it flagged as tough (a two-year stacked growth rate of 50%). Set against those, the honest counterweight is that the entire analyst panel is now positioned one way — 15 Buy of 18 opinions, no down-revisions in three months — so a Q3 print that merely lands inside the guided range would still be a disappointment relative to how the stock is positioned, and there is no bearish cohort left to convert.

**What would move this verdict.** A Q3 print above roughly $1.45 adjusted EPS (a beat of the guidance high end on the scale of the last two quarters) confirms the bar was beatable and shifts the read toward Low for Q4. A Q3 print inside the guided range — anywhere below $1.3899 — is a miss against consensus even though it would meet management's own guide, and would move the read to High for the balance of the year. Confirmation of the Q4 revenue path, either by a Maverick close inside Q4 or by a fourth guidance raise on 30-Oct-2026, resolves the +5.32% Q4 gap that is doing most of the work in this assessment.

---

**Partial-data status: none applied.** Consensus, guidance, revision-history, breadth and surprise data all came from the Capital IQ pool export (fix F19 satisfied — nothing here is web-sourced or from memory), and two verbatim transcripts (1-May-2026, 31-Jul-2026) carry the guidance commentary. No consensus-setup cap, no no-revision-history cap and no staleness haircut is triggered by this file. Section 3A is omitted because the pool contains no `external/` alt-data panel — its absence is not a gap.



---

## earnings / 05_beat-miss-setup.md

_Source: `05_beat-miss-setup.md`_

# Beat / Miss Setup — NVT

**Company:** nVent Electric plc (NYSE: NVT). **Regime:** US SEC domestic filer (Irish-incorporated). **Reporting standard:** US GAAP. **Currency: USD, in millions except per-share.** **Fiscal year ends 31 December.**

**Evidence binding: frozen.** Every read resolves through generation `6db32848…1aecd1e6`. Live `data/NVT/` was not read; `data/NVT/…` is a citation label only.

**Upstream inputs:** all four required outputs were read in full — `01_historical-financials.md`, `02_revenue-drivers.md`, `03_margin-drivers.md`, `04_guidance-consensus.md`. `06_earnings-quality.md` was also read and is used only in §5. **No upstream output is missing**, so no degraded-confidence note applies.

**Partial-data status.** Consensus IS present (Capital IQ pool export, 14–17 contributors per line) and `04` §1A resolved the reporting basis, so the "no consensus → cap at Unclear" rule does **not** bind. The pool contains no `external/` alt-data folder, so there is no §3A panel read to carry; its absence is not a gap [`04_guidance-consensus.md`, closing note].

**Plain-English terms.** *Adjusted EPS* = the company's own non-GAAP earnings per share, which strips out acquisition intangible write-downs, deal costs and restructuring. *Book-to-bill* = orders taken divided by sales delivered; below 1.0x the order book is shrinking. *Operating leverage* = fixed overhead spread over more sales, so profit rises faster than revenue. *bps* = basis points, hundredths of a percentage point. *Sequential* = versus the immediately preceding quarter.

---

## 1. Next Reporting Period Context

The next thing nVent will actually file is **Q3 FY2026 — the standalone three months ended 30-Sep-2026**, presented in the 10-Q alongside a cumulative nine-month column, with the results release expected **30-Oct-2026** (vendor's expected date, not company-confirmed) [`04_guidance-consensus.md` §1A, citing `CIQ Estimates→Consensus` header]. The headline beat/miss is judged on the **standalone quarter**, which is the same shape as the vendor's estimate — a US quarterly period contains no already-reported stub, so no restatement was required. Seasonality cannot be relied on either way here (§6): the pool holds only one complete fiscal year of consistent-basis quarterly revenue, and that year is confounded by a mid-year acquisition [`01_historical-financials.md` §5].

**The bar, carried verbatim from `04` §1A with its basis label:**

> **"Standalone Q3 bar = $1,427.27m revenue / $1.3899 adjusted EPS — no restatement required.** The vendor's estimate is already standalone-quarter, which is exactly what the 10-Q's three-month column reports. For the cumulative nine-month column the bar is `2,713.3 + 1,427.27 = **$4,140.6m** revenue` and `2.54 + 1.3899 = **$3.93** adjusted EPS`."

Also on the standalone-quarter basis: **GAAP EPS $1.24636** (6 estimates) and **EBITDA $329.29m** (8 of 10 estimates) [`04` §1A and §3]. Against the same period a year earlier, the revenue bar is **+35.4%** on Q3 FY2025 actual revenue of $1,054.0m and the adjusted-EPS bar is **+52.7%** on Q3 FY2025 actual adjusted EPS of $0.91 [`04` §1A].

**The one fact that shapes everything below.** The Q3 bar sits **only +0.31% above management's guided revenue high end and +0.72% above its guided adjusted-EPS high end** ($1,422.90m / $1.38) [`04` §3] — and, measured against the quarter just reported, it embeds a **sequential decline**: revenue $1,427.27m is **−3.0%** below Q2 FY26's $1,471.3m, adjusted EPS $1.3899 is **−4.1%** below Q2's $1.45, and consensus EBITDA of $329.29m is **−2.6%** below Q2's adjusted EBITDA of $338.1m on the vendor's own basis [computed from `04` §1A/§3 and `01_historical-financials.md` §3].

---

## 2. Beat Scenarios

Likelihood bands follow CLAUDE.md §10 (High = 60–75%, Mid = 45–60%, Low = 25–45%). **Every likelihood below is *judgment*, and each cell names the sample or reference class informing it.** No probability here is a measured frequency: the largest relevant sample is eight quarters of vendor surprise data spanning a divestiture basis change, and the most directly relevant sample — beats against the company's own guidance — is two observations.

| Scenario | Driver | What Would Need To Happen | Likelihood | Evidence |
|---|---|---|---|---|
| **B1. Data-centre shipments merely hold flat sequentially** | Data-centre demand inside the infrastructure vertical — the driver `02` §7 names as 93.1% of every incremental revenue dollar in Q2 FY26 | Q3 revenue only has to land **above $1,427.27m, which is 3.0% BELOW the $1,471.3m just delivered**. Flat sequential revenue would be a **+3.1% beat**; the one clean prior-year Q2→Q3 move was **+9.4%** (963.1 → 1,054.0), or **+4.7%** after removing the extra month of Electrical Products Group ownership in Q3 FY25 (~$45.9m/month, derived from Q1 FY26's $137.7m full-quarter contribution — *inference, not from filings*). Applying that adjusted +4.7% to Q2 FY26 gives ~$1,540m, **+7.9% above the bar** | **High** — judgment; reference class is the company's own last two guidance outcomes (+17.2% and +26.1% above the guided EPS high end) plus a one-observation sequential shape. Sub-8-observation, so judgment, not a frequency | `04` §1A/§3/§6; `01` §3 (quarterly actuals); `02` §7 |
| **B2. SG&A absorption repeats on higher volume** | Volume-driven operating leverage on SG&A — `03` §8's single biggest margin driver, worth 453bps of the 417bps operating-margin gain in Q2 FY26 | Adjusted return on sales holds near Q2's 21.93%. At the consensus revenue of $1,427.27m that is ~$312.6m of adjusted operating income, an incremental margin of **~26%** on the estimated Q3 FY25 base of ~$215.1m (adjusted EBITDA $230.1m less ~$15m depreciation — *inference, not from filings*). Management guides "mid-20s incrementals" for H2; Q2 actually delivered **24.1%** ((322.7−200.0)/(1,471.3−963.1)). So consensus needs roughly 2 points more than the guide and 2 points more than Q2 delivered | **Mid** — judgment; two-quarter reference class (Q1/Q2 FY26 incrementals), and the required rate sits *above* both the guide and the last print | `03` §3, §8; `01` §3; `04` §2 |
| **B3. Short-cycle recovery broadens the beat** | Short-cycle distribution demand — commercial & residential "up low teens" and industrial improving inside Electrical Connections, whose organic growth went 7.9% (Q1 FY26) → 17.9% (Q2 FY26) | Electrical Connections keeps accelerating rather than reverting to the "mid-single digits for the year" management guides for those verticals. At 27% of sales, a 5pp organic surprise here is worth roughly 1.4pp of group revenue, or ~$20m — enough on its own to clear the +$4.4m gap between the guide high end and consensus, not enough to make a material beat | **Mid** — judgment; two-observation acceleration (Q1→Q2 FY26) against management's own lower full-year framing | `02` §5 (Electrical Connections); `02` §4 |
| **B4. Pricing recovers more of the cost than guided** | Price / pass-through — realised recovery of input inflation ran **40% (Q1 FY26) → 79% (Q2 FY26)** at the gross line | Recovery moves above 79% in Q3, which is what management's own guide asserts ("Pricing is expected to offset the impact of inflation, including tariffs"). Full offset would remove the gross-margin drag that cost 243bps ex-IEEPA in Q2 | **Mid** — judgment; two-observation recovery series (40% → 79%), and the third point is management's forward assertion, not a measurement. The 2023 precedent shows nVent over-recovered on price then gave it back in 2024 (price +5.5% → −0.2%) | `03` §3 (pass-through arithmetic and its three qualifiers) |

---

## 3. Miss Scenarios

| Scenario | Driver | What Would Need To Happen | Likelihood | Evidence |
|---|---|---|---|---|
| **M1. The order book, not capacity, was the constraint** | Order intake / book-to-bill — organic orders decelerated from ~40% (Q1 FY26) to **"low double digits"** (Q2 FY26) against 46.9% organic sales; backlog fell $2.6bn → $2.5bn; implied Q2 book-to-bill **~0.93x (range 0.86–1.00x)** versus ~1.2x in Q1 | Q3 shipments run out of backlog to convert. If Q2's 46.9% organic sales came from deliberately draining the book — management's own explanation, "we worked hard in Q2 to really execute on that backlog" — then Q3 lands inside the guided +32–35% and **below** the $1,427.27m consensus, which needs 35.4%. Management's counter, "we've had strong data center orders thus far in Q3", is an unverified statement about an unreported quarter | **Mid** — judgment; the order series is two rounded transcript observations at group level with no segment split and no filed equivalent, so it cannot support a frequency | `02` §4, §6a, §7; `03` §9 |
| **M2. GAAP EPS misses even if adjusted beats** | The IEEPA tariff reimbursement — a **one-off $25.8m credit inside Q2 gross profit (+175bps of gross margin, ~$0.12 of the quarter's $1.32 GAAP EPS)** that the company itself excludes from adjusted results | The GAAP bar of **$1.24636 sits above management's guided GAAP high end of $1.21** (+3.1%) — the most stretched line in the whole estimate set. It is cleared only if a comparable one-off repeats or if reported gross margin improves. Note the asymmetry: because the company strips IEEPA out of adjusted profit, this scenario can produce an **adjusted beat and a GAAP miss in the same print** | **Mid–High** — judgment; the credit is explicitly labelled not run-rate by `03` §10, and the bar is above the guide high end. No usable sample: GAAP-EPS surprise history is not broken out in the pool | `03` §2, §3, §10; `04` §3 |
| **M3. The factory keeps losing the price-cost fight** | Raw-material, labour and tariff inflation, with **no disclosed commodity hedging programme** — metals move straight into cost of goods sold. FY2026 tariff cost guided at **~$100m, raised from ~$80m** | Gross margin ex-one-offs falls again. The Q2 headline was −70bps, but **ex the $25.8m IEEPA credit it was −243bps**. Add segment mix (Systems Protection, ~9pp lower gross margin, took 56bps out of group gross margin in Q2 on a 7.25pp weight shift) and Blaine 1 start-up cost, and the gross line stays negative into Q3 | **Mid** — judgment; three-quarter reference class of consecutive gross-margin declines (FY2025 −249bps, Q1 FY26 −290bps, Q2 FY26 −243bps ex-IEEPA), all on a consistent direction | `03` §2, §3, §5, §7, §7a |
| **M4. Electrical Connections drags** | Growth investment in digital, selling and marketing inside Electrical Connections, where the **SG&A ratio ROSE 49bps** while Systems Protection's fell 363bps | Segment income margin, already −140bps YoY in Q2 and −260bps for H1, fails to hold "in the high 20s". At 27% of sales a further 200bps here is ~55bps of group segment margin — enough to convert a small adjusted-EPS beat into a miss against a bar that is only 0.72% above the guide high end | **Low–Mid** — judgment; two-observation improving sequence (−390bps in Q1 → −140bps in Q2) argues against it, which is why this sits below M1–M3 | `03` §6 (Electrical Connections) |

---

## 4. What Magnitude Matters?

Every threshold below names its comparable, states what it implies for the not-yet-reported part of the year, and is tested against the last two reported periods (CLAUDE.md §17). **Comparable for all standalone-quarter rows: Q3 FY2025 actual, same standalone three-month continuing-operations basis.**

| Metric | Consensus / Bar (standalone Q3 FY26) | Material Beat Threshold | Material Miss Threshold | Why |
|---|---:|---:|---:|---|
| **Revenue** | **$1,427.27m** (14 est.) = +35.4% on Q3 FY25 actual $1,054.0m | **≥ $1,499m** (+5.0% vs bar; **+42.2% vs Q3 FY25**; +1.9% sequentially on Q2's $1,471.3m) | **< $1,391.28m** — management's own guided low end (−2.5% vs bar; **+32.0% vs Q3 FY25**). Below this the company missed its *own* guide, not just the Street | +5% is roughly the size of beat that has moved this stock's estimate set: the last two revenue surprises were +12.00% and +16.90%, the two before them +4.81% and +6.17%. **Failure test:** a +5% threshold would have been MET in Q1 FY26 and Q2 FY26, and would have FAILED in Q3 FY25 (+4.81%) — so it can fail. The miss threshold has not fired in eight quarters |
| **EBITDA** | **$329.29m** (8 of 10 est.) — **not guided by the company**; −2.6% below Q2 FY26 adjusted EBITDA of $338.1m (vendor basis) | **≥ $349m** (+6.0% vs bar) | **< $319m** (−3.0% vs bar) | EBITDA surprise history: +2.63% (Q3'25), −3.95% (Q4'25), +14.56% (Q1'26), +21.27% (Q2'26). **Failure test:** +6% would have been met in Q1'26 and Q2'26 and failed in Q3'25; −3.0% would have fired in Q4 FY25 (−3.95%). Both thresholds are capable of failing. Note the basis limit: the company gives **no EBITDA guidance**, so there is no management anchor on this line |
| **Adjusted EPS** | **$1.3899** (14 est.) = +52.7% on Q3 FY25 actual $0.91; only +0.72% above the guided high end of $1.38 | **≥ $1.50** (+7.9% vs bar; **+64.8% vs Q3 FY25**; +3.4% sequentially on Q2's $1.45) | **< $1.35** — the guided low end (−2.9% vs bar; **+48.4% vs Q3 FY25**) | **Failure test:** a +7.9% threshold would have been met in Q1 FY26 (+16.0%) and Q2 FY26 (+25.0%), and would have FAILED in Q3 FY25 (+3.4%) and Q4 FY25 (0.0%) — two of the last four. The miss threshold would not have fired in either of the last two quarters, when actuals of $1.09 and $1.45 cleared guided low ends of $0.90 and $1.12 |
| **GAAP EPS** | **$1.24636** (6 est.) — **above** the guided high end of $1.21 | ≥ $1.30 (+4.3% vs bar) | **< $1.21** — the guided high end, i.e. any print inside the guided range is a consensus miss on this line | This is the only bar in the set that management's own guidance range cannot reach at its top. `03` §10 states the $25.8m IEEPA credit that lifted Q2 GAAP EPS by ~$0.12 is not run-rate |
| **Guidance (FY2026 adjusted EPS)** | Current guide **$5.00–$5.10** (mid $5.05); consensus **$5.11301**. Implied Q4 arithmetic, shown: FY consensus $5.11301 − H1 actual $2.54 − Q3 bar $1.3899 = **$1.183 for Q4** (+31.5% on Q4 FY25 actual $0.90). The guide-implied Q4 is $5.05 − $2.54 − $1.365 = **$1.145** (+27.2%). **The Street's Q4 EPS sits +3.3% above the guide-implied path; its Q4 revenue sits +5.32% above it** ($1,318.67m vs $1,252.09m) | **A fourth raise lifting the FY26 midpoint above ~$5.20** — i.e. more than passing a Q3 beat straight through. The last two raises moved the midpoint **+$0.425** (Feb→May) and **+$0.550** (May→Jul); a pass-through of a Q3 beat alone would add roughly $0.10–0.15 and land the midpoint at ~$5.11, merely matching consensus | **Holding the FY range at $5.00–$5.10 after a Q3 beat**, or any narrowing that takes the top below $5.10 | **Failure test:** the >$5.20 trigger would have been met at both prior raises (+$0.425, +$0.550), so it has not yet failed — but it fires only on a raise materially larger than a mechanical pass-through, which is exactly the distinction the Q4 gap turns on. The miss trigger has not fired in FY2026 to date |

**Basis note (carried from `04` §3, not smoothed).** The vendor's FY2026 revenue consensus of $5,435.31m does not equal the sum of its four quarterly figures ($5,459.24m, a 0.44% gap) because the FY panel (16 of 17) and the quarterly panels (14) are different sets of analysts. The Q4 revenue figure quoted above is the vendor's own FQ4 line ($1,318.67m); the FY-consistent derivation gives $1,294.74m. They are not interchangeable and the $23.9m difference is exactly that panel gap.

---

## 5. In-Line Print But Bad Guidance Risk

| Risk | Evidence | Why It Matters |
|---|---|---|
| **In-line current quarter but guide-down** | The Street's Q4 revenue of **$1,318.67m is +5.32% above the $1,252.09m** implied by the company's own FY and Q3 guidance — roughly four times the stretch in the Q3 number [`04` §3, §7]. The guide-implied Q4 is a **sequential decline of −11.0%** from the Q3 guide midpoint, which an analyst challenged on the Q2 call; management defended it as prudence against a two-year stacked comparison of 50%, not as a demand slowdown | This is the largest single mispricing risk in the setup. A Q3 print that beats while the FY range is only lifted by the size of the beat leaves the Q4 gap intact and effectively confirms the step-down. With **zero downward revisions on revenue, EBITDA or adjusted EPS across FY2026, FY2027 and FQ3 2026 over three months and 15 Buy ratings of 18 opinions**, there is no bearish cohort left to convert [`04` §5, §1] |
| **Beat current quarter but weak margin guide** | Management has already capped the margin path: **"mid-20s incrementals in the second half"**, and confirmed the pre-divestiture 30% return-on-sales figure is no longer the target, "to ensure that we can invest to support the growth". Three Minnesota liquid-cooling plants are committed (Blaine 1 ramping through 2026 into 2027, Blaine 2 opening H1 2027, a third site announced 31-Jul-2026); FY2026 capex is guided ~$130m, up ~40% [`03` §8, §9; `04` §2] | Q2 delivered 24.1% incrementals, so "mid-20s" is a continuation rather than a cut — but the consensus adjusted-EPS bar needs roughly **26%** incrementals (§2, B2). A guide that reiterates mid-20s while the fixed base grows is arithmetically a cap on how far the SG&A-absorption engine can run, and that engine is 109% of the Q2 operating-margin gain |
| **Beat EPS due to one-offs, miss quality** | The direction here is **unusually the reverse**. nVent *removed* a $25.8m GAAP benefit from its own adjusted numbers in Q2, publishing H1 FY26 adjusted EBITDA ($605.4m) **below** GAAP-derived EBITDA ($612.8m); stock-based compensation is expensed inside adjusted earnings [`06_earnings-quality.md` §4]. The genuine quality wedge is the other one: **adjusted EPS ran 28.8% above GAAP continuing-operations EPS in FY2025, and 87% of the add-back is acquisition intangible amortisation** ($147.1m FY2025, $165.2m LTM), which rises with every deal | A Q3 adjusted-EPS beat carries less one-off contamination than the usual case — but it also carries a growing amortisation exclusion that Maverick Power will enlarge. `06` scores earnings quality **74/100** and names this wedge, not the cash, as the single biggest concern |
| **Beat revenue but working capital deteriorates** | Working capital consumed **$218.4m in H1 FY26** versus $153.2m in H1 FY25, with receivables alone $280.2m of it. FY2026 free-cash-flow conversion is guided at **90–95%**; `06` §2 computes that this needs **~$545m of H2 FCF against $442.5m delivered in H2 FY25 — a ~23% increase, on revenue guided up 32–35%** [`06` §2, §3; `04` §2] | The required cash growth is below the guided revenue growth, so the conversion target is demanding rather than broken — but it is a live test that a revenue beat makes harder, not easier, because faster growth consumes more receivables. `06` also flags that FY2025 continuing-operations FCF of $555.7m overstates group cash generation by $183.8m of disposal tax that left through discontinued operations |

---

## 6. Seasonality Read

**Seasonality neither helps nor hurts this setup in any way that can be relied on, and `01` forbids building a phasing assumption on it.** `01_historical-financials.md` §5 states plainly: *"Insufficient quarterly history for seasonality analysis"* and *"Treat seasonality as Not proven from available data and do not let any downstream agent build a quarterly phasing assumption on it."* Only one complete fiscal year of consistent continuing-operations quarterly revenue exists (FY2025: Q1 20.8%, Q2 24.7%, Q3 27.1%, Q4 27.4% — a mild H2 weighting at 54.5%), no quarter breaches the >30% / <20% flag, and that H2 skew is confounded by the Electrical Products Group acquisition landing on 1-May-2025. Two real seasonal facts sit underneath, and they point in opposite directions and are both small: the company itself names spring-and-summer demand for **Electrical Connections** products, so Q3 sits at the tail of that segment's seasonally stronger half [`02` §5, citing `Q2 FY26 10-Q, MD&A p.30` and the Liquidity note] — but Electrical Connections is only 27% of sales and 6.9% of Q2's growth. Cash flow is separately H2-weighted (76% of FY2025 continuing operating cash arrived in H2) [`06` §2], which supports the cash-conversion guide rather than the revenue line. **The single-year Q2→Q3 revenue step of +9.4% used as a cross-check in §2 (B1) is explicitly NOT presented as a proven seasonal pattern** — it is one observation, inflated by an extra month of acquired revenue, and it is used only to show how undemanding a −3.0% sequential consensus looks against the one prior year available.

---

## 7. Historical Pattern

**There is a real beat pattern, it is recent and large, and it should be weighted heavily on direction and lightly on magnitude.** Against Street consensus over eight quarters: **five beats, two in-line, one miss** — FQ3'24 −22.2% (the one clear miss, which sits before the Thermal Management divestiture re-based the company), FQ4'24 0.0%, FQ1'25 +1.5%, FQ2'25 +8.9%, FQ3'25 +3.4%, FQ4'25 0.0%, FQ1'26 +16.0%, FQ2'26 +25.0% [`04` §6]. **Basis label (CLAUDE.md §10):** eight observations is the minimum for an empirical read and this sample spans both a divestiture basis change and the onset of the data-centre upswing, so the five-of-eight frequency is a weak empirical prior, not a stable base rate. The far more relevant record — **actual versus the company's own guidance high end: +17.2% (Q1 FY26) and +26.1% (Q2 FY26)** — is **two observations and is judgment, not a measured frequency.** The same two-observation sample also shows consensus sitting +1.29% and +1.20% above the guidance high end before each of those beats, versus +0.72% today, so today's positioning is marginally *less* demanding than what preceded two large beats.

**How much the synthesizer should weight it:** enough to break a tie, not enough to carry a thesis. Both large beats sit inside one demand upswing driven by one vertical (data centres, 93.1% of Q2's incremental revenue), so the pattern is really one observation of a regime, repeated twice. It would not survive a change in that cycle — and the one forward-looking series in the pool (orders, book-to-bill ~0.93x) is the one that has already turned.

---

## 8. Setup Verdict

## **Setup favors beat** — for the standalone Q3 FY2026 print. The miss risk is real but sits in Q4 and in the FY guidance, not in the Q3 number.

**The single most important factor:** the Q3 consensus embeds a **sequential decline** from the quarter just reported — revenue $1,427.27m is 3.0% below Q2's $1,471.3m and adjusted EPS $1.3899 is 4.1% below Q2's $1.45 — at a company whose profit engine is fixed-overhead absorption that rises with volume (SG&A leverage was 453bps of the 417bps Q2 operating-margin gain), which has cleared its own guidance high end by 17.2% and 26.1% in the last two quarters, and which opened new liquid-cooling capacity (Blaine 1) that is still ramping. Q3 revenue does not have to grow sequentially to beat; it only has to avoid falling 3%.

**The single biggest risk that could flip it:** the order book. Organic orders decelerated to "low double digits" against 46.9% organic sales, book-to-bill fell to ~0.93x (range 0.86–1.00x) from ~1.2x, and backlog fell $2.6bn → $2.5bn. If Q2's shipments came from draining the book rather than from new demand, Q3 lands inside the guided +32–35% and misses a consensus that needs +35.4%. Management's assertion that data-centre orders have been "strong thus far in Q3" is the pivot, and it is an unverified statement about an unreported quarter, made at group level, with no segment split and no filed equivalent.

---

## 9. Second-Quarter Look-Ahead

**The Q4 FY2026 setup is materially harder on the bar and materially more uncertain on the drivers.** Consensus Q4 revenue of $1,318.67m is **+5.32% above the $1,252.09m** implied by the company's own FY and Q3 guidance (versus +1.43% of stretch in Q3), and consensus Q4 adjusted EPS of $1.183 is **+3.3% above the guide-implied $1.145** — so Q4 is where the Street has run furthest ahead, and it must be earned entirely organically because the Electrical Products Group acquisition anniversaried on 1-May-2026 and currency turns to a small drag (an implied −$15.9m of non-organic revenue across H2) [`02` §4a; `04` §3]. Cutting the other way, and cutting hard: **Maverick Power** (~$700m of estimated 2026 revenue, $1.75bn purchase price plus up to $550m contingent, close expected in Q4 2026 subject to regulatory approval) is in **no estimate in this pool** (revision cut-off 7-Aug-2026) **and outside the FY2026 guidance** — proven by the arithmetic in `02` §4a — so a Q4 close would add revenue for a reason unrelated to demand, while the company's own accretion language ("accretive to adjusted earnings per share in the first year following completion") is unaudited deal language against new debt interest and deal costs that nobody has sized. **Net: Q4 is a wider distribution in both directions, and the honest read is that it is not resolvable from this pool until either Maverick closes or a fourth guidance raise on 30-Oct-2026 tells us which way the $66.6m revenue gap closes.**

---

## 10. Pre-Mortem

**If this setup fails, the most likely reason is that we treated the order book as noise and the sequential-decline consensus as the whole story.** Book-to-bill of ~0.93x and organic orders at "low double digits" against 46.9% organic sales are the only forward-looking series in the pool, and we discounted them because they are rounded transcript figures with no segment split — but they are also the only numbers that describe Q3 rather than Q2, and if data-centre orders did not in fact rebound, revenue lands inside the guided range, misses a consensus set 35.4% above the year-ago quarter, and the SG&A absorption that produced the entire margin gain reverses with the volume. The second-most-likely failure is a base-rate error under CLAUDE.md §9: reading two guidance beats of 17% and 26% as a repeatable pattern when they are two observations inside a single data-centre capital-spending upswing that `02` §4a and `03` §10 both place at or very near its peak. The third, and the one that would look most avoidable afterwards, is being right on the quarter and wrong on the stock — a Q3 beat delivered alongside an FY guide that only passes the beat through, leaving the +5.32% Q4 revenue gap intact against a panel with 15 Buys of 18 opinions and zero down-revisions in three months.



---

## earnings / 06_earnings-quality.md

_Source: `06_earnings-quality.md`_

# Earnings Quality — NVT

**Company:** nVent Electric plc (NYSE: NVT). **Jurisdiction/regime:** US SEC domestic filer (Irish-incorporated). **Reporting standard:** US GAAP. **Currency: USD, in millions except per-share.** **Fiscal year ends 31 December.**

**Evidence binding:** frozen extract generation `6db32848…1aecd1e6`. Live `data/NVT/` was not read; `data/NVT/…` is a citation label only. Upstream `01_historical-financials.md` was read and is the baseline for this report.

**Cash flow data IS available** (FY2022–FY2024 audited statements of cash flows; H1 FY25 and H1 FY26 condensed statements; FY2025 and LTM from the Capital IQ export). The MODULE_RULES "no cash flow statement" cap (earnings quality max 45) therefore does **not** apply.

### Definitions used here (CLAUDE.md §15)

- **EBITDA** = operating income + depreciation and amortisation, **continuing operations**. Plain meaning: operating profit before the non-cash charges for wearing out plant and writing down acquired intangibles. nVent reports no GAAP EBITDA; this line is computed from company-sourced components. The company's own **adjusted EBITDA** is a different, narrower measure and is shown separately.
- **CFO** = net cash provided by operating activities **of continuing operations**, as reported on the face of the cash flow statement. A "memo" line shows total-company CFO including discontinued operations, because in FY2025 the two differ by $183.8m of real cash.
- **FCF** = CFO − total capex (§15 default). nVent defines free cash flow differently — continuing-operations CFO − capex **+ proceeds from the sale of property and equipment** [13] — so both are shown and labelled.
- **Net debt (strict basis, §15)** = total debt from the company's own debt note (revolver + term loans + senior notes, net of issuance costs; **no lease liabilities**) − cash. At 30-Jun-2026: $1,492.4m − $256.0m = **$1,236.4m, strict basis** [9][8]. Capital IQ's $1,376.9m is the same balance sheet on a **broad basis** that folds in $140.5m of lease liabilities [17]. Both labels are used inline wherever a figure appears.
- **Basis points (bps)** = hundredths of a percentage point; 100bps = 1.0 percentage point.
- **DSO / DIO / DPO** = days sales outstanding / days inventory outstanding / days payables outstanding — how many days of sales sit in receivables, how many days of cost sit in inventory, and how many days the company takes to pay suppliers.

**Basis break carried forward from upstream.** Thermal Management was sold (agreed 31-Jul-2024, closed 30-Jan-2025 for $1.65bn) and is shown as discontinued operations for FY2022–FY2024 [4]. FY2021 was never restated and is excluded from every table below. There is **no FY2025 Form 10-K in this pool**: FY2025 cash-flow detail is cited to the Capital IQ export (tier-5 vendor data, as of ~12-Aug-2026) [16], and FY2025 income-statement / non-GAAP lines to the company's own Q1 FY26 deck [12], never under a filing's name.

---

## 1. EBITDA → CFO → FCF Bridge (5 years)

All figures USD m, **continuing operations**, US GAAP.

| Item | FY2022 | FY2023 | FY2024 | FY2025 | LTM Jun-26 | Trend |
|---|---:|---:|---:|---:|---:|---|
| EBITDA (operating income + D&A) | 395.4 | 575.9 | 673.1 | 824.6 ᵛ | 1,058.4 | Improving |
| Working capital change | (56.0) | (15.0) | 2.4 | (23.5) ᵛ | (88.7) ᵐ | Deteriorating |
| Cash tax paid (consolidated) | (87.3) | (112.4) | (120.2) | (283.3) ᵛ | Not disclosed | Deteriorating |
| Cash interest paid, net (consolidated) | (49.2) | (103.2) | (134.8) | Not disclosed | Not disclosed | Deteriorating |
| Other operating items + non-cash reconciling items (**residual**) | +70.4 | +76.9 | +80.5 | +131.2 ᵉ | n/a | — |
| **CFO (continuing operations)** | **273.3** | **422.2** | **501.0** | **649.0** ᵈ | **772.8** ᵈ | Improving |
| *Memo: CFO, total company incl. discontinued ops* | *394.6* | *528.1* | *643.1* | *465.2* | *690.6* | Deteriorating |
| Maintenance capex | Not disclosed | Not disclosed | Not disclosed | Not disclosed | Not disclosed | — |
| Growth capex | Not disclosed | Not disclosed | Not disclosed | Not disclosed | Not disclosed | — |
| Total capex | 40.5 | 65.6 | 74.0 | 93.3 ᵛ | 112.9 | Rising |
| **FCF (CFO cont. ops − total capex, §15)** | **232.8** | **356.6** | **427.0** | **555.7** | **659.9** | Improving |
| *Memo: FCF on total-company CFO* | *354.1* | *462.5* | *569.1* | *371.9* | *577.7* | Volatile |
| *Memo: company-defined FCF (adds PP&E sale proceeds)* | *234.8* | *356.7* | *427.5* | *561.0* | *663.6* | Improving |
| **CFO / EBITDA %** | **69.1%** | **73.3%** | **74.4%** | **78.7%** | **73.0%** | Stable–improving |

**Footnote keys.** ᵛ = Capital IQ export, tier-5 vendor data as of ~12-Aug-2026 [16]. ᵈ = continuing-operations CFO derived by removing the itemised discontinued-operations cash flow inside the reported total: FY2025 $465.2m − (−$183.8m) = **$649.0m**; LTM $690.6m − (−$82.2m) = **$772.8m** [16]. ᵐ = mixed basis — FY2025 working capital from the vendor's own component lines, H1 FY25 and H1 FY26 from the filed cash flow statements [8]; labelled because the two are not built the same way. ᵉ = FY2025 residual is not a clean plug: see the basis warning below.

**Capex split not disclosed — total capex used. FCF may understate true recurring free cash flow.** nVent has never split maintenance from growth capex in this pool. The only colour is directional: management guided FY2026 capex to "approximately $130 million, up 40%", and said "most of this increased investment is for new capacity to support growth in data centers, power utilities and supply chain resiliency" [10]. That says the *increment* is growth spend but does not size the maintenance base, so no split is attempted here.

**Two basis warnings on this bridge (§15 matched-basis rule).**
1. **Cash taxes and cash interest paid are consolidated figures; CFO above is continuing-operations only.** The 10-K supplemental disclosure gives one company-wide number [3]. So the residual line absorbs that mismatch as well as the genuine non-cash items (share-based compensation of $23.3m / $21.8m / $27.3m / $37.5m across FY2022–FY2025, deferred taxes of −$11.4m / −$165.9m / +$85.3m in FY2022–FY2024, and pension expense/income of −$58.0m / +$19.9m / +$5.4m) [3][16]. The residual is named, not hidden, and it is not evidence of an unexplained cash gap.
2. **The FY2025 cash-tax line is dominated by the disposal, not by operations.** Cash taxes paid jumped from $120.2m (FY2024) to $283.3m (FY2025), a rise of $163.1m [3][16], and $183.8m of operating cash flowed *out* through discontinued operations that year [16]. Read together, most of the FY2025 tax step-up is the tax on the Thermal Management sale and belongs to the discontinued line, not to continuing operations. Charging the full $283.3m against continuing-operations CFO would be the wrong basis, which is why the FY2025 residual is large (+$131.2m). The vendor also reports the identical $283.3m for the LTM column, which cannot be right for a rolling twelve months that is half FY2026 — that cell is treated as **Not disclosed** rather than used.

### Lead figure: normalised operating FCF (§15)

**LTM normalised operating FCF to 30-Jun-2026: ~$634.1m.** Reported LTM FCF on the §15 definition is **$659.9m**; the company's own definition gives **$663.6m** (it adds $3.7m of property-sale proceeds) [13][16]. The normalisation removes **~$25.8m** of one-off IEEPA tariff reimbursements — a refund of tariffs the company had previously paid over — which the Q2 FY26 10-Q says benefited gross profit in the quarter and which the company itself strips out of its adjusted results [9]. No separate tariff receivable appears on the 30-Jun-2026 balance sheet [9], so the conservative treatment (§4) is that the cash was received inside the period; that is also the direction that flatters reported FCF, so it is the one to normalise against. All three figures are shown so they are never mixed. The §5 one-off table below reconciles to this $25.8m adjustment.

**A second normalisation runs the other way and matters more.** FY2025 continuing-operations FCF of **$555.7m** overstates the cash the group actually generated that year by **$183.8m**, because that much operating cash left through discontinued operations (disposal taxes). On a total-company basis FY2025 FCF was **$371.9m** — below FY2024's $569.1m. Anyone quoting $555.7m as FY2025 cash generation is quoting a continuing-operations figure for a year in which the group's bank balance did not see it.

---

## 2. Cash Conversion Assessment

CFO tracks EBITDA closely and has done for four straight years: **69.1% → 73.3% → 74.4% → 78.7% → 73.0%** on a matched continuing-operations basis (both numerator and denominator continuing ops). Every year sits above the 70% "healthy" line except FY2022 at 69.1%, and the direction is flat-to-up rather than eroding. The one year that looks weak — FY2025 at **56.4%** measured on total-company CFO of $465.2m — is weak for a disclosed, identifiable reason: $183.8m of cash went out through discontinued operations on the Thermal Management disposal [16], not because operating earnings failed to convert. Even on that unflattering total-company basis, no year in the last three is below 50%: FY2023 91.7%, FY2024 95.5%, FY2025 56.4%, LTM 65.2%.

**Adjudicating the number that disagrees (§3).** First-half FY2026 cash conversion looks poor in isolation: company-defined H1 FY26 FCF of $221.1m against H1 adjusted net income of roughly $417.1m (Q1 $179.2m [12] + Q2 $1.45 adjusted EPS × 164.1m diluted shares [10][9]) is **~53%**, against full-year guidance of **90–95% conversion** [10]. That gap does not, on the evidence, signal a break. nVent's cash is structurally second-half weighted: in FY2025, H1 continuing CFO was $154.9m and the full year $649.0m, so **76% of the year's operating cash arrived in H2** [8][16], and working capital released roughly $129.7m in H2 FY25 after consuming $153.2m in H1 [8][16] (mixed basis — vendor full-year components against filed half-year lines). Doing the arithmetic the guidance implies: FY2026 adjusted EPS guidance of $5.00–$5.10 [10] on ~164m diluted shares is roughly $828m of adjusted net income; at 92.5% conversion that is ~$766m of FCF, leaving **~$545m for H2 FY26 against $442.5m actually delivered in H2 FY25 — a required increase of ~23%, on revenue guided up 32–35%** [10]. The required cash growth is *below* the guided revenue growth, so the target is demanding but not out of line with the company's own recent shape. It is a live test, not yet a failure.

*(No RF-EQ-002 tag is emitted: CFO/EBITDA was not below 50% in any of the last three years on either the continuing-operations basis or the total-company basis.)*

---

## 3. Working Capital Trends

**Formulas and basis.** `DSO = 365 × receivables ÷ revenue`; `DIO = 365 × inventory ÷ COGS`; `DPO = 365 × payables ÷ COGS`. DSO uses **revenue**; DIO and DPO use **COGS**, not revenue. **Period-end balances are used consistently, not averages** — averaging would drag the pre-divestiture FY2022 balance sheet (which still contained Thermal Management) into the FY2023 calculation and corrupt it. Receivables, inventory and payables are the **filed** figures from the 10-K and 10-Q balance sheets [2][9], not the Capital IQ balance sheet, whose receivables line is $160–169m higher in each period because it folds contract assets into receivables [17][9].

| Metric | FY2023 | FY2024 | FY2025 | LTM / 30-Jun-26 | Direction | Risk |
|---|---:|---:|---:|---:|---|---|
| Receivable days (DSO) | 64.3 | 57.4 | 65.0 | 73.2 | Rising | See adjudication below |
| Inventory days (DIO) | 82.5 | 73.2 | 71.1 | 62.6 | Falling | Low |
| Payable days (DPO) | 54.9 | 56.9 | 54.0 | 59.4 | Broadly flat | Low |
| Cash conversion cycle (DSO + DIO − DPO) | 91.9 | 73.7 | 82.0 | 76.4 | Down 15.5 days since FY2023 | Low |

Inputs: revenue 2,668.9 / 3,006.1 / 3,893.1 / 4,834.0; COGS 1,593.7 / 1,797.0 / 2,424.0 / 3,046.8; receivables 470.2 / 473.1 / 693.0 / 969.3; inventory 360.2 / 360.3 / 471.9 / 522.4; payables 239.8 / 280.1 / 358.9 / 496.0 [1][2][7][9][16][17]. LTM COGS is built from filings and ties exactly to the vendor LTM column: 2,424.0 − 1,086.9 + 1,709.7 = 3,046.8 [7][16].

**Flag test 1 — DSO rising >10% YoY: triggered on the reported basis, and it does not survive a matched-basis check.**
- Reported: FY2024 57.4 days → FY2025 65.0 days = **+13.2%**, which trips the threshold.
- Why it trips: nVent bought the Electrical Products Group on 1-May-2025 for $979.6m, and the final purchase price allocation put **$97.7m of acquired accounts receivable** on the balance sheet at that date [9]. Those receivables arrive whole; only eight months of the matching revenue lands in the FY2025 denominator. Strip the acquired receivables and FY2025 receivables grew **+25.8%** against revenue growth of **+29.5%** — slower than sales.
- The matched-basis version (§15): DSO measured against **annualised latest-quarter revenue**, which removes the lag between an acquisition's balance sheet and its revenue: **57.4 days (Dec-24) → 59.3 days (Dec-25) → 60.1 days (Jun-26)**. That is +3.3% then +1.3%, both well inside the 10% flag. Working: 365 × 473.1 ÷ (752.2 × 4); 365 × 693.0 ÷ (1,066.7 × 4); 365 × 969.3 ÷ (1,471.3 × 4) [9][12][18].
- **Verdict: not a revenue-recognition concern.** Receivables rose $276.3m in H1 FY26 with no acquisitions in the period [8], and the 10-Q attributes it to "accounts receivable driven by the overall increase and timing of sales" [9] on revenue up 53.1% year on year. **Confidence is capped by one genuine gap:** the Q2 FY25 10-Q is not in this pool, so a 30-Jun-2025 receivables balance — the only true like-for-like comparable for the 30-Jun-2026 figure — cannot be computed. If such a balance showed a real seasonal DSO rise, this verdict would change.

**Flag test 2 — DIO rising >15% YoY: not triggered.** Inventory days fell every year: 82.5 → 73.2 → 71.1 → 62.6. FY2025 inventory rose 31.0%, of which $20.0m was acquired with EPG [9]; excluding that, +25.4% against COGS growth of +34.9%. In H1 FY26 inventory rose only 10.7% while COGS rose 57.3% year on year. There is no channel stuffing or inventory build signature here; if anything the company is running leaner into much higher volume. Raw materials rose fastest (213.5 → 253.5, +18.7%) and finished goods actually fell (227.2 → 222.5) [9] — the opposite shape to a demand stall.

**Flag test 3 — DPO rising sharply: not triggered.** DPO of 59.4 days on the LTM basis is up from 54.0, but on the matched annualised-half-year basis (365 × 496.0 ÷ (1,709.7 × 2)) it is **52.9 days**, slightly *below* FY2025. Payables grew 38.2% over six months against sequential revenue growth of 27.9% [7][9], which is a normal build on a business scaling purchases, not a supplier stretch. No supplier-finance or reverse-factoring programme is disclosed anywhere in the pool.

**The real working capital story is cash absorption from growth, not deterioration in quality.** Working capital consumed **$218.4m** in H1 FY26 versus $153.2m in H1 FY25 [8], and receivables alone were $280.2m of that. That is the cost of growing revenue 53% — and the cash conversion cycle is still 15.5 days *shorter* than in FY2023.

---

## 4. Non-GAAP Adjustments

All adjustments below come from the company's own reconciliations, not from this agent. nVent's stated definition: adjusted operating income excludes intangible amortisation, acquisition-related expenses, restructuring costs, impairments and other unusual non-operating items; adjusted EBITDA = adjusted operating income + depreciation; return on sales = adjusted operating income ÷ net sales [12].

**FY2025 (full year), adjustments to operating income — total +$169.0m = 27.4% of GAAP operating income of $616.8m:**

| Adjustment | Amount | Recurring? (Y/N) | Concern Level | Evidence |
|---|---:|---|---|---|
| Intangible amortisation from acquisitions | +147.1 | **Y** — 50.3 / 69.5 / 94.7 / 147.1 in FY2022–FY2025, rising every year; 165.2 LTM | **High** | [12][16] |
| Acquisition transaction & integration costs | +14.4 | **Y** — 0.8 / 12.8 / 13.9 / 14.4 in FY2022–FY2025; 7.5 in H1 FY26 | Mid | [12][5] |
| Restructuring and other | +7.5 | **Y** — 11.2 / 3.9 / 7.5 / 7.5 in FY2022–FY2025; 10.9 in H1 FY26 | Mid | [12][5][9] |
| Pension / OPEB mark-to-market gain (at net income line) | −12.9 | **Y by policy** — the company remeasures every Q4: +61.9 / −13.4 / +0.1 / +12.9 in FY2022–FY2025 | Low | [5][12] |
| Tax on the above (at net income line) | −33.8 | Y | Low | [12] |
| **Stock-based compensation** | **not adjusted out** ($37.5m FY2025 expense stays in adjusted earnings) | — | **None — a positive** | [16][12] |

**H1 FY26, adjustments to operating income — total +$74.8m = 15.1% of GAAP operating income of $496.4m:**

| Adjustment | Amount | Recurring? (Y/N) | Concern Level | Evidence |
|---|---:|---|---|---|
| Intangible amortisation | +82.2 | Y | High | [9] |
| Restructuring and other | +10.9 | Y | Mid | [9] |
| Acquisition transaction & integration costs | +7.5 | Y | Mid | [9] |
| IEEPA tariff reimbursements — **removed as a benefit** | **−25.8** | N (one-off refund) | **Low — conservative** | [9] |

Reconciliation check: 496.4 + 82.2 + 10.9 + 7.5 − 25.8 = **571.2** = reportable segment income 644.9 − Enterprise and other 73.7 [9]. Ties exactly.

**Which adjustments clear the flags in this agent's brief:**
- **Recurs every period, so it is not a "one-off":** intangible amortisation, acquisition costs, restructuring, and the annual pension remeasurement. All four appear in every year on record.
- **Exceeds 15% of GAAP earnings:** yes, decisively. FY2025 adjusted diluted EPS of **$3.35** is **28.8% above** GAAP continuing-operations EPS of **$2.60**, and **$147.1m of the $169.0m operating add-back — 87% of it — is acquisition intangible amortisation** [12].
- **Stock-based compensation excluded:** **no.** SBC of $37.5m (FY2025) and $23.1m (H1 FY26) is expensed inside adjusted earnings [16][8]. That is a genuinely more conservative non-GAAP definition than most US industrials use.
- **A rare mark in the company's favour:** in Q2 FY26 nVent *removed a $25.8m benefit* from its adjusted numbers. Reported GAAP operating income of $300.7m includes the tariff refund; adjusted operating income of $322.7m does not [9]. Adjusted EBITDA in H1 FY26 ($605.4m) is therefore **below** GAAP-derived EBITDA ($612.8m). A company willing to publish an adjusted number lower than its GAAP number is not running the add-backs in one direction only.

---

## 5. One-Off Items (last 3 years)

| Item | Period | Amount | Classification | Evidence |
|---|---|---:|---|---|
| Thermal Management disposal — gain in discontinued operations | Q1 FY25 / FY2025 | $281.7m disc-ops income; $1.64 of Q1 FY25 GAAP diluted EPS; $1,584.5m investing inflow | **Genuine** | [4][12][16] |
| Thermal Management disposal — operating cash **outflow** in discontinued operations | FY2025 | **−$183.8m** (cash taxes paid rose $163.1m to $283.3m the same year) | **Genuine — cash cost, easy to miss** | [16][3] |
| IEEPA tariff reimbursement inside gross profit | Q2 FY26 | +$25.8m pre-tax ≈ +$19.7m after tax ≈ **+$0.12 of GAAP diluted EPS** (9% of the quarter's $1.32) | **Genuine** — and the company excludes it from adjusted | [9] |
| Pension / OPEB mark-to-market remeasurement | Every Q4 | +61.9 (FY22) / −13.4 (FY23) / +0.1 (FY24) / +12.9 (FY25) | **Recurring "one-off"** — it happens by accounting policy every single year | [5][12] |
| Restructuring and other | Every year | 11.2 / 3.9 / 7.5 / 7.5 / 10.9 (FY22 / FY23 / FY24 / FY25 / H1 FY26) | **Recurring "one-off"** | [5][12][9] |
| Acquisition transaction & integration costs | Every year | 0.8 / 12.8 / 13.9 / 14.4 / 7.5 | **Recurring "one-off"** | [5][12][9] |
| Deferred foreign tax benefit turning FY2023 tax into a net credit | FY2023 | Tax line was a **benefit of $84.4m** on pre-tax income of $375.3m, driven by a $174.0m deferred foreign tax benefit | **Genuine but very large** | [1][16] |
| Inventory step-up amortisation (ECM deal accounting) | FY2023 | $17.7m | **Genuine** | [5] |
| Gain on sale of investment | FY2023 | +$10.3m | **Genuine** | [1][5] |
| Impairment of equity investments / release of guarantee liability | FY2024 | −$8.8m / +$12.5m (non-cash) | **Genuine** | [3][5] |

**The FY2023 tax item deserves naming.** Continuing-operations net income of $459.7m that year rests on a tax *credit*. Taxed at FY2025's 22.1% rate, FY2023 pre-tax income of $375.3m would have produced roughly $292m of net income and about **$1.74 of continuing diluted EPS instead of the reported $2.73** [1][12]. Any multi-year EPS growth line that runs through FY2023 is distorted by this, in the flattering direction for FY2023 and the punishing direction for FY2024 (which carried a 43.9% effective rate) [16].

---

## 6. Accrual Quality Flags

| Flag | Triggered (Y/N) | Evidence |
|---|---|---|
| Revenue growing faster than CFO for 2+ years | **N** | FY2023 revenue +16.3% vs continuing CFO +54.5%; FY2024 +12.6% vs +18.7%; FY2025 +29.5% vs +29.5% (dead heat); H1 FY26 revenue +53.1% vs CFO +79.9% [1][7][8][12][16] |
| Receivables growing faster than revenue | **N** | Reported FY2025 receivables +46.5% vs revenue +29.5% would trip it, but $97.7m of that came in with the EPG acquisition's opening balance sheet; excluding it, +25.8% vs +29.5%. Matched-basis DSO on annualised latest-quarter revenue: 57.4 → 59.3 → 60.1 days [2][7][9][12]. Confidence capped — no 30-Jun-2025 balance sheet in this pool |
| Inventory growing faster than COGS | **N** | FY2025 inventory +31.0% (ex-acquired +25.4%) vs COGS +34.9%; H1 FY26 inventory +10.7% vs COGS +57.3% YoY; inventory days 82.5 → 62.6 [2][7][9][16] |
| Deferred revenue declining (contract business) | **Y** | Contract liabilities fell from $176.8m to $159.9m (−9.6%) in the six months to 30-Jun-2026 while revenue rose 53.1%; net contract assets swung from −$16.0m to +$8.6m, a $24.6m move the 10-Q attributes to "the timing of milestone invoicing" [9]. Order backlog moved the other way, to ~$2.5bn [10] |
| Capitalised costs growing as % of revenue | **N** | No capitalised software or development-cost line is disclosed. The closest analogue, contract assets, rose only 4.8% ($160.8m → $168.5m) and *fell* as a share of revenue, from 4.1% of FY2025 revenue to 3.5% of LTM revenue [9] |
| Frequent accounting policy changes | **N** | No policy change in the period. The only presentation changes are a recategorisation of revenue by vertical, which the filing states "had no impact on our consolidated financial results", and the segment renaming to Systems Protection / Electrical Connections [9]. Inventory stays FIFO; depreciation lives unchanged at 5–20 / 5–50 / 3–15 years [5] |

**One row triggered (deferred revenue), and it is the mildest of the six.** The fall in contract liabilities is explained in the filing itself — the December-2025 balance was recognised as revenue during H1 FY26 — and the forward-order measure that actually matters for a project business, backlog, roughly tripled from $749.3m (FY2024) to $2.35bn (FY2025) [17] and stood at about $2.5bn at the Q2 FY26 call [10]. It is logged Y because the factual test is met, not because it reads as manipulation.

*(No RF-EQ-001 tag is emitted: only one of the six rows is triggered, below the two-row threshold.)*

---

## 7. Reported vs Adjusted Reconciliation

**FY2025 (full year, continuing operations, USD m except EPS):**

| Metric | Reported | Adjusted | Difference | % of Reported | Recurring? | Evidence |
|---|---:|---:|---:|---:|---|---|
| EBITDA | 824.6 (= op. income 616.8 + D&A 207.8) | 846.5 (= adj. op. income 785.8 + depreciation 60.7) | +21.9 | +2.7% | Y (restructuring 7.5 + acquisition costs 14.4) | [12][16] |
| EBIT (operating income) | 616.8 | 785.8 | +169.0 | **+27.4%** | Y — 87% of it is intangible amortisation | [12] |
| Net income (continuing) | 428.5 | 550.8 | +122.3 | **+28.5%** | Y | [12] |
| EPS (diluted, continuing) | 2.60 | 3.35 | +0.75 | **+28.8%** | Y | [12] |

**H1 FY26 (six months to 30-Jun-2026):**

| Metric | Reported | Adjusted | Difference | % of Reported | Recurring? | Evidence |
|---|---:|---:|---:|---:|---|---|
| EBITDA | 612.8 (= 496.4 + D&A 116.4) | 605.4 (= 571.2 + depreciation 34.2) | **−7.4** | −1.2% | Mixed — the −25.8 IEEPA removal outweighs the +18.4 of add-backs | [7][8][9] |
| EBIT (operating income) | 496.4 | 571.2 | +74.8 | +15.1% | Y | [7][9] |
| Net income (continuing) | 356.2 | ~417.1 (Q1 179.2 + Q2 ~237.9) | +60.9 | +17.1% | Y | [7][12][10] |
| EPS (diluted, continuing) | 2.17 | 2.54 (Q1 1.09 + Q2 1.45) | +0.37 | +17.1% | Y | [7][12][10] |

Note: Q2 FY26 adjusted net income is derived as $1.45 adjusted EPS × 164.1m diluted shares [10][7] — the company's Q2 FY26 reconciliation slide is not in this pool (the latest deck is Q1 FY26). It is labelled derived, not filed.

The gap narrows from 28.8% (FY2025) to 17.1% (H1 FY26) for two reasons that pull in opposite directions: intangible amortisation is still climbing in absolute terms ($82.2m in H1 FY26 vs $64.1m in H1 FY25), but reported earnings grew so much faster that the same-sized add-back is a smaller percentage — and the $25.8m tariff removal cuts the adjustment further.

---

## 8. Accounting Trap Checklist

*Severity is an **inverted** score: higher = WORSE.*

| Trap | Triggered? (Y/N) | Evidence | Severity /100 *(higher = WORSE — inverted)* |
|---|---|---|---:|
| Stock-based compensation excluded from adjusted earnings | **N** | SBC of $37.5m (FY2025) and $23.1m (H1 FY26) is expensed inside adjusted operating income; the company's stated adjustment list does not include it [12][16][8] | 5 |
| Restructuring costs recur every year | **Y** | "Restructuring and other" in every year on record: 11.2 / 3.9 / 7.5 / 7.5 / 10.9 (FY22 / FY23 / FY24 / FY25 / H1 FY26). Small in context — FY2025's 7.5 is 1.2% of operating income [5][12][9] | 30 |
| Capitalised costs rising faster than revenue | **N** | No capitalised software/development line disclosed; contract assets +4.8% vs revenue +53%, falling from 4.1% to 3.5% of revenue [9] | 10 |
| Receivable factoring / supplier finance disclosed | **N** | No factoring, securitisation, reverse-factoring or supplier-finance programme appears anywhere in the FY24 10-K or either 10-Q. US GAAP requires supplier-finance programmes to be disclosed, so silence here is reasonable evidence of absence [3][5][8][9] | 5 |
| Inventory write-downs or reserve releases | **N (material)** | Inventory carried at lower of FIFO cost or net realisable value; no write-down disclosed. The one related item is $17.7m of inventory step-up amortisation in FY2023 from the ECM deal — purchase accounting, not a reserve release [5]. Separately, accrued customer rebates *fell* from $91.5m to $78.8m while sales rose 53%, and the allowance for doubtful accounts fell from 1.94% to 1.69% of gross receivables — both small, both worth watching [9][17] | 20 |
| Revenue recognised before cash collection risk is clear | **Partial** | Long-term contracts use cost-to-cost over-time recognition, producing $168.5m of unbilled contract assets (3.5% of LTM revenue). The filing states there were "no material impairment losses recognized on our contract assets" [5][9]. This exposure grows with EPG's switchgear/bus-systems project mix | 25 |
| Change in useful life / depreciation assumptions | **N** | Useful lives unchanged: land improvements 5–20 years, buildings 5–50, machinery 3–15 [5]. Acquired-intangible lives are long but disclosed and consistent with prior deals: EPG customer relationships 16 and 20 years, technologies 8 years, customer backlog ~3 years [9] | 20 |
| Tax rate unusually low or boosted by one-off | **Y (historically, not now)** | FY2023 carried an $84.4m tax *benefit* (a $174.0m deferred foreign tax benefit) on $375.3m of pre-tax income; FY2024 then ran at 43.9%. FY2025 was 22.1% and H1 FY26 22.4% — normal, and the volatility sits in the past [1][7][16] | 30 |
| Large fair-value / mark-to-market gains | **Y** | Pension/OPEB mark-to-market by policy every Q4: +61.9 (FY22, 18.4% of that year's pre-tax income), −13.4 (FY23), +0.1 (FY24), +12.9 (FY25). Non-cash, and excluded from adjusted results in both directions [5][12] | 30 |

---

## 9. Earnings Quality Score

# **74 / 100** — band 61–80: *mostly clean but some working capital or adjustment noise*.

**The single most important reason:** cash backs the earnings — CFO has run at 69–79% of EBITDA for four straight years and the cash conversion cycle has *shortened* by 15.5 days since FY2023 — but a persistent, growing wedge sits between reported and adjusted profit, and 87% of it is acquisition intangible amortisation ($147.1m in FY2025, $165.2m LTM) that is the recurring price of a serial-acquisition growth model, not a one-off.

**What lifts the score toward the top of the band:** stock-based compensation is expensed inside adjusted earnings; the company removed a $25.8m GAAP *benefit* from its own adjusted Q2 numbers, publishing an adjusted EBITDA below its GAAP EBITDA for H1 FY26; inventory days fell from 82.5 to 62.6; no factoring or supplier-finance programme; unchanged depreciation lives and inventory method; the EPG purchase price allocation is final and disclosed line by line; and the one reported red flag (DSO up 13.2% in FY2025) dissolves on a matched-basis check.

**What holds it out of the 81–100 band:** four "one-off" adjustment categories recur every single year; adjusted EPS runs 29% above GAAP; working capital consumed $218.4m in H1 FY26 and the full-year 90–95% cash conversion target needs a large second-half swing; there is no FY2025 Form 10-K in this pool, so a full year of cash-flow detail is vendor-sourced and cash interest paid is unavailable for FY2025 and the LTM; and no 30-Jun-2025 balance sheet exists here, so the cleanest possible receivables test cannot be run.

---

## 10. The Single Biggest Quality Concern

The single biggest risk that reported earnings overstate economic reality is **the acquisition amortisation wedge, not the cash**. nVent spent $1,120.1m (ECM, FY2023), $677.7m (Trachte, FY2024) and $975.7m (Electrical Products Group, FY2025) — $2.77bn in three years [3][16] — and each deal writes a large slug of customer relationships and technology onto the balance sheet ($433.8m for EPG alone, amortised over 8 to 20 years) [9]. The company then excludes the resulting amortisation from adjusted profit, which is standard practice and correctly disclosed, but the effect is that **the headline "adjusted" earnings line systematically leaves out the cost of the very engine driving the growth**: $147.1m in FY2025, $165.2m over the last twelve months, and rising in every year on record. An investor paying for adjusted EPS of $3.35 (FY2025) is paying for a number 28.8% above the $2.60 the audited accounts report. This is a *presentation* risk rather than a *cash* risk — the amortisation is genuinely non-cash and the cash conversion (CFO at 73% of EBITDA over the last twelve months, normalised operating FCF of roughly $634.1m) is real. But it becomes an economic risk the moment the deal flow stops, because the amortisation keeps running for years after the acquisitions that created it, while the revenue those deals bought stops being flattered by "organic-plus-acquired" growth. The Maverick Power acquisition announced 24-Aug-2026 — after every filing in this pool [19] — extends the pattern rather than breaking it.

Two second-order items the master synthesizer should carry, neither large enough to change the verdict: **(1)** FY2025 continuing-operations FCF of $555.7m overstates the group's actual cash generation by $183.8m, which flowed out through discontinued operations as disposal tax — on a total-company basis FY2025 FCF was $371.9m, *below* FY2024's $569.1m; and **(2)** the last twelve months' FCF includes roughly $25.8m of one-off IEEPA tariff refunds, so the recurring figure is ~$634.1m, not $659.9m.

**Accounting judgments flagged for the master synthesizer:** cost-to-cost over-time revenue recognition on long-term contracts, carrying $168.5m of unbilled contract assets and growing with the EPG project mix; the annual Q4 pension mark-to-market, which put $61.9m through FY2022 pre-tax income (18.4% of it); and the FY2023 tax credit that lifted that year's continuing EPS from roughly $1.74 to a reported $2.73, distorting any multi-year EPS growth line drawn through it.

---

## Citations

All documents are in the frozen extract generation `6db32848…1aecd1e6`, cited under the logical label `data/NVT/`.

[1] FY24 10-K (nVent Electric plc, Form 10-K, fiscal year ended 31-Dec-2024), Consolidated Statements of Operations and Comprehensive Income, p.40
[2] FY24 10-K, Consolidated Balance Sheets, p.41
[3] FY24 10-K, Consolidated Statements of Cash Flows and Supplemental cash flow information, p.42
[4] FY24 10-K, Note 6 (Discontinued Operations) and Note 5 (Acquisitions), p.55–56
[5] FY24 10-K, Significant Accounting Policies (revenue recognition, contract balances, inventories, property useful lives), Note 3 (Restructuring), and Note 16 (Segment Information — reconciliation of reportable segment income to income before income taxes)
[6] Q1 FY26 10-Q (quarter ended 31-Mar-2026), Condensed Consolidated Statements of Income, p.3
[7] Q2 FY26 10-Q (quarter and six months ended 30-Jun-2026), Condensed Consolidated Statements of Income and Comprehensive Income, p.3
[8] Q2 FY26 10-Q, Condensed Consolidated Statements of Cash Flows, p.5
[9] Q2 FY26 10-Q — Condensed Consolidated Balance Sheets p.4; Note 2 (Revenue, contract balances); Note 3 (Restructuring); Note 5 (Acquisitions — Electrical Products Group final purchase price allocation); Note 8 (Supplemental Balance Sheet Information); Note 10 (Debt); Note 12 (Segment Information); MD&A "Results of Operations" and "Liquidity and Capital Resources"
[10] Q2 FY26 earnings call transcript (S&P Global Market Intelligence, verbatim), 31-Jul-2026, prepared remarks
[11] Q1 FY26 earnings call transcript (S&P Global Market Intelligence, verbatim), 1-May-2026
[12] Q1 FY26 earnings presentation, 1-May-2026, "Reported to Adjusted 2025 Reconciliation", slide 16
[13] Q1 FY26 earnings presentation, 1-May-2026, "Organic Sales Growth and Free Cash Flow Reconciliation", slide 17
[14] Q1 FY26 earnings presentation, 1-May-2026, "Reported to Adjusted 2026 Reconciliation", slide 15
[15] Q1 FY26 earnings presentation, 1-May-2026, Key Definitions and Notes, slide 2
[16] Capital IQ Financials export → Cash Flow and Income Statement tabs, annual FY2021–FY2025 + LTM 12 months Jun-30-2026; vendor data as of ~12-Aug-2026
[17] Capital IQ Financials export → Balance Sheet tab, same workbook and as-of date
[18] Capital IQ Estimates export → Surprise tab, quarterly actuals FQ3 2024 – FQ2 2026; vendor data as of ~Aug-2026
[19] "nVent to Acquire Maverick Power", announcement dated 24-Aug-2026
[20] `ciq_facts.json` deterministic facts sidecar, frozen generation `6db32848…1aecd1e6` — LTM CFO $690.6m, levered FCF $468.2m (after interest, NOT the §15 CFO−capex measure), net debt $1,376.9m and total debt $1,632.9m on the vendor's lease-inclusive **broad** basis
[21] Upstream `analyses/NVT_2026-09-07/earnings/01_historical-financials.md`

**Reconciliation to `ciq_facts.json` (required).** The sidecar's LTM "Cash from Ops." of **$690.6m** is accepted as an accurate read of the workbook and is the *total-company* figure; this report's $772.8m is the same figure with the itemised −$82.2m discontinued-operations outflow removed, and both are shown in the bridge. The sidecar's "Levered Free Cash Flow" of **$468.2m** is a different measure (after interest) and is deliberately not used as FCF; the §15 measure (CFO − total capex) is $659.9m and the normalised operating figure is ~$634.1m. Net debt of $1,376.9m is the **broad** basis (leases included); the strict, filing-verified figure at 30-Jun-2026 is **$1,236.4m**, and the $140.5m gap is entirely lease liabilities [9][17]. No vendor figure is overridden.

### Calculation provenance

Every ratio, day-count, growth rate and residual in this report was produced by an executed Python snippet, not mental arithmetic. Spot-checks: LTM COGS built from filings, 2,424.0 − 1,086.9 + 1,709.7 = **3,046.8**, ties exactly to the vendor LTM column; LTM D&A 207.8 − 92.3 + 116.4 = **231.9**, ties exactly to the vendor LTM column; H1 FY26 adjusted operating income 496.4 + 82.2 + 10.9 + 7.5 − 25.8 = **571.2** = segment income 644.9 − Enterprise and other 73.7; FY2025 adjusted EBITDA 785.8 + 60.7 = **846.5**, matching the company's own slide.



---

## earnings / 07_earnings-sensitivity.md

_Source: `07_earnings-sensitivity.md`_

# Earnings Sensitivity — NVT

**Company:** nVent Electric plc (NYSE: NVT). **Regime:** US SEC domestic filer (Irish-incorporated). **Reporting standard:** US GAAP. **Currency: USD, in millions except per-share.** **Fiscal year ends 31 December.** [`00_earnings-data-triage.md`, §0]

**Evidence binding: frozen.** Every read resolved through generation `6db32848…1aecd1e6` (`manifest.json`, `corpus.txt`, `ciq_facts.json`, per-tab extracts). Live `data/NVT/` was not read; `data/NVT/…` is a citation label only.

**Upstream inputs read in full:** `00_earnings-data-triage.md`, `01_historical-financials.md` (REQUIRED), `02_revenue-drivers.md` (REQUIRED), `03_margin-drivers.md` (REQUIRED), `04_guidance-consensus.md`, `06_earnings-quality.md`. **Cross-module input read:** `business-model/10_external-dependency.md`. **No upstream output is missing** — no degraded-confidence note applies.

---

## 0. The Metric Everything Below Moves, And Its Base (CLAUDE.md §15)

| Item | Value | Basis and source |
|---|---:|---|
| **Base metric** | **Adjusted diluted EPS (company non-GAAP, continuing operations)** | The company's own measure: adjusted operating income excludes intangible amortisation, acquisition-related expense, restructuring, impairments, other unusual non-operating items, and the IEEPA tariff refund [`Q1 FY26 earnings presentation, 1-May-2026, slide 16`; `Q2 FY26 10-Q, Note 13, p.21`]. It is the measure management guides and the measure consensus is set on [`04_guidance-consensus.md`, §1]. **It is NOT reported GAAP EPS** — see the wedge note below |
| **Base value** | **$5.05** | FY2026 adjusted-EPS guidance midpoint of the $5.00–$5.10 range [`Q2 FY26 transcript (S&P Global, verbatim), 31-Jul-2026, prepared remarks (CFO Corona)`; independently recorded at `CIQ Estimates→Guidance`, EPS Normalized FY 2026, guidance date 2026-07-31] |
| Base period | FY2026 (company guidance midpoint) | Same |
| Guided revenue midpoint | **$5,372.5m** | $3,893.1m × 1.38 (the +37%/+39% reported-sales guide) [`Q2 FY26 transcript, prepared remarks`; FY2025 base revenue `CIQ Financials→Income Statement`, 12m Dec-31-2025, tier-5 vendor data as of ~12-Aug-2026] |
| Diluted shares | **164.1m** | `Q2 FY26 10-Q, Note 4 (Earnings Per Share), p.9` — weighted average diluted, three and six months ended 30-Jun-2026 |
| Effective tax rate used | **22.4%** | "The effective income tax rate was 22.4% for both the six months ended June 30, 2026 and June 30, 2025" [`Q2 FY26 10-Q, income-tax note`]. The Q2 standalone rate was 23.5% [`Q2 FY26 10-Q, MD&A, p.26`]; the six-month rate is used because every move size below is annual |
| **Conversion factor used throughout** | **$1m of pre-tax profit = $0.004729 of adjusted diluted EPS** | (1 − 0.224) ÷ 164.1. Every EPS figure in §2 is this factor times a pre-tax dollar move, and the multiplication is printed in the row |

**Sanity check that the base is internally consistent.** $5.05 × 164.1m = $828.7m of adjusted net income; grossed up at 22.4% = $1,067.9m pre-tax; plus the ~$65m of guided interest expense [`CIQ Estimates→Guidance`, Interest Expense FY 2026, guidance date 2026-05-01] = **~$1,132.9m of implied adjusted operating income, an adjusted return on sales of 21.1%**. That sits between FY2025's 20.2% and Q2 FY26's 21.9% [`Q1 FY26 presentation, slide 16`; `Q2 FY26 transcript, prepared remarks`], so the guided base is arithmetically coherent. *Derived — inference, not from filings.*

**The wedge that travels with this base metric, carried with its build (CLAUDE.md §3).** Adjusted EPS runs materially above GAAP: FY2025 adjusted diluted EPS of $3.35 was **28.8% above** GAAP continuing-operations EPS of $2.60, and **$147.1m of the $169.0m operating add-back — 87% of it — is acquisition intangible amortisation** ($165.2m over the last twelve months, rising every year on record) [`06_earnings-quality.md`, §7 and §10; `Q1 FY26 presentation, slide 16`]. Every impact figure below is on the adjusted line. On GAAP EPS the same pre-tax dollar moves the same amount, but the GAAP starting level is lower (FY2026 GAAP EPS guided $4.29–$4.39 [`CIQ Estimates→Guidance`, EPS (GAAP) FY 2026]) — so the same absolute swing is a larger *percentage* of GAAP earnings. The two bases are never mixed here.

---

## 1. Variable Selection

The seven variables below were taken from the upstream driver tables and ranked by the magnitude rating those tables already assigned, not chosen freshly. From `02_revenue-drivers.md` §4 (magnitude: High = >5% of revenue): **data-centre demand inside infrastructure**, **the infrastructure vertical itself**, **order intake / backlog**, and **acquired revenue — Maverick Power**. From `03_margin-drivers.md` §5 (magnitude: High = >100bps of adjusted return on sales): **volume-driven operating leverage on SG&A**, **segment mix**, **tariffs (all-in cost)**, **price realisation / pass-through**, and **raw-material inflation**; plus **net interest expense** at Mid. Three consolidations were made to avoid double-counting the same dollar: data-centre demand, the infrastructure vertical, order intake and backlog are one variable (they are the same demand series read at three points in its own cycle — orders lead, backlog converts, infrastructure revenue prints); price realisation is not a separate row because the pool never splits it from productivity, so it enters as the **measured offset rate** applied to the two cost rows; and operating leverage is separated from volume as the *rate* at which incremental volume converts to profit, because the company guides that rate independently of the volume.

**From the business-model external-dependency output** (`business-model/10_external-dependency.md`, read in full) three variables were carried in that this module would otherwise have under-weighted: **AI / data-centre capital spending** (that file's added top row, scored High, and its §5 single biggest lever), **government policy — trade / tariffs** (High, and the largest quantified policy exposure at ~$190m all-in ≈ 3.5% of guided sales), and **interest rates** (scored "Low today, rising", with the only company-disclosed earnings sensitivity in the entire pool). Two variables that file scores were deliberately **not** given rows: **FX** (Low–Mid there; currency added only 0.5pp to Q2 FY26 revenue growth and 1.2pp to H1, and the only disclosed FX sensitivity — ±$13.6m on a ±10% USD/EUR move — hits Accumulated other comprehensive loss, i.e. equity, not earnings [`FY24 10-K, Item 7A`]) and **freight / energy** (never sized separately from raw materials and labour in any document in this pool, so it is inside the input-cost row rather than beside it).

**One disclosure limit governs the confidence column and must be stated up front.** The only company-published earnings sensitivities are the **FY2024** Item 7A interest-rate and currency coefficients [`FY24 10-K, Item 7A`]; the FY2025 Form 10-K is absent from the pool and the Q2 FY26 10-Q points to it for the current market-risk disclosure [`00_earnings-data-triage.md`, §5]. **No commodity-price sensitivity is published and no commodity derivative is disclosed** — Item 7A covers currency and interest rates only. Neither disclosed coefficient touches a top-three variable. The MODULE_RULES cap "no sensitivity disclosures and only inferred sensitivities → volatility confidence must be Low" does **not** formally bind, because company-disclosed per-unit rates do exist (Item 7A, and the "mid-20s incrementals" guide) — but the dominant variable's move size is inferred, and that is reflected row by row rather than papered over.

---

## 2. Sensitivity Table

Impacts are **adjusted diluted EPS, USD**, on the FY2026 base of $5.05. Each impact prints its own multiplication. "Mitigation assumed" is mandatory on every row (CLAUDE.md §9): a figure computed with management's response held at zero is labelled `0% — bound` and is never the only case shown where the filings let the realised offset be computed.

| Variable | Base Case | Move Basis | Bull Case | EPS Impact (bull) | Bear Case | EPS Impact (bear) | Mitigation assumed | Confidence | Evidence |
|---|---|---|---|---:|---|---:|---|---|---|
| **1. Data-centre / infrastructure demand volume** | Data-centre sales guided **>$2.0bn** of ~$5,372.5m FY2026 revenue (~37%); infrastructure vertical was $882.5m = **60.0% of Q2 FY26 sales**, from 42.5% a year earlier | (2) Historical observed range + (1) company-disclosed conversion rate. The vertical grew +115.6% YoY in Q2 ($409.3m → $882.5m) while organic **orders decelerated from ~40% to "low double digits"** and backlog fell $2.6bn → $2.5bn — a ±20% move on the $2.0bn data-centre base is well inside a series that has already moved that far in one quarter | Data-centre revenue **+20% = +$400m** of group revenue (+7.4%) | **+$0.473** `400 × 0.25 = $100.0m adj. op. income; × 0.004729 = +$0.473` (+9.4% of base) | Data-centre revenue **−20% = −$400m** | **−$0.473** (same arithmetic, opposite sign) | **0% — bound.** No cost-out, no price action, no capacity deferral assumed on either side. **Realised offset not computable from the pool** — there is no organic-revenue decline in the post-divestiture record to measure a down-volume response against. The 25% rate was measured on *rising* volume, so on the bear side it is a floor on the damage, not a central estimate (see §6) | **High on the conversion rate, Medium on the move size.** The 25 cents is company-disclosed AND corroborated by the company's own reported numbers; the ±20% is inferred | Rate: `Q2 FY26 transcript, Q&A (CFO Corona)` — "assuming mid-20s incrementals in the second half". Realised check: adjusted operating income $322.7m vs $200.0m = +$122.7m on revenue +$508.2m = **24.1% realised incremental** [`Q2 FY26 10-Q, Note 13, p.21`; `03_margin-drivers.md`, §3]. Base and vertical mix: `Q2 FY26 10-Q, Note 2 (Revenue), p.9`; `Q2 FY26 transcript, prepared remarks`. Orders/backlog: `Q1 FY26 transcript, prepared remarks`; `Q2 FY26 transcript, prepared remarks` |
| **2. Incremental margin rate on the guided volume** (operating leverage / capacity absorption) | **Mid-20s (25%) guided for H2 FY2026**; **24.1% realised in Q2 FY26**. Applied to FY2026 incremental revenue of **$1,479.4m** ($5,372.5m − $3,893.1m) | (1) Company-disclosed band. Management's pre-divestiture target was **30%** and it says that is no longer the target, "to ensure that we can invest to support the growth"; the current guide is mid-20s; the realised print is 24.1%. So 20–30% is the company's own stated range, not an invented band | Incremental rate **30%** (+5pp) | **+$0.350** `1,479.4 × 0.05 = $73.97m; × 0.004729 = +$0.350` (+6.9% of base) | Incremental rate **20%** (−5pp) | **−$0.350** | **Not applicable — this row IS the mitigation channel.** It is the rate at which management converts volume after its own growth spending, so it cannot also carry a mitigation assumption. Stated so it is not read as a zero-mitigation bound | **Medium.** The 20–30% band is company-stated; applying it to a guidance-derived incremental revenue base is inference | `Q2 FY26 transcript, Q&A (Corona / Dean Dray)` — mid-20s H2 incrementals; `Q2 FY26 transcript, Q&A (Corona / Scott Graham)` — the 30% figure is no longer the target; realised 24.1% per row 1; incremental revenue base derived from the FY26 guide [`Q2 FY26 transcript, prepared remarks`] |
| **3. All-in US tariff cost** | **~$100m incremental guided for FY2026**, raised from ~$80m at the Q1 call, on top of **~$90m in FY2025** — an all-in run rate of roughly **$190m ≈ 3.5% of guided sales** | (2) The company's own guide moved **$80m → $100m (+25%) in a single quarter**, and $90m → $100m year on year. ±$50m on the $100m incremental spans a further escalation of that size and a partial reversal | Tariff cost **−$50m** (relief) | **Base case (58% offset symmetric): +$0.099** `50 × 0.42 = $21.0m; × 0.004729`. **Bound if no price is given back: +$0.236** `50 × 0.004729` | Tariff cost **+$50m** | **Base case (58% realised offset): −$0.099** `50 × (1 − 0.58) = $21.0m; × 0.004729 = −$0.099`. **Zero-mitigation bound: −$0.236** `50 × 0.004729` | **58% — realised, H1 FY26.** Computed from the filings and the call: ~$110m of disclosed pre-mitigation inflation ÷ $2,713.3m of H1 sales = ~405bps, against an observed H1 gross-margin change of −170bps → `1 − 170/405 = 58%`. The quarterly path was **40% (Q1 FY26) → 79% (Q2 FY26)**, i.e. a one-to-two-quarter pass-through lag. The zero-mitigation figure is shown beside it and labelled `0% — bound`, never as the expected outcome | **Medium.** Cost dollars are management statements on a call and are floors ("more than", "approximately"); the offset is computed from filed gross margins | Cost: `Q2 FY26 transcript, prepared remarks` ("approximately $100 million, up from $80 million previously"); `Q1 FY26 transcript, Q&A (Sprague / Corona)` ("$80 million this year followed from $90 last year. So, $170 million all-in"). Offset arithmetic: `03_margin-drivers.md`, §3, from `Q1 FY26 10-Q, MD&A p.24`, `Q2 FY26 10-Q, MD&A p.26–27` and both transcripts |
| **4. Non-tariff input-cost inflation** (copper, steel, stainless, aluminium, electronic components, labour, fuel, freight) | Roughly **$20m per quarter ≈ $80m a year**, derived as the residual: Q2 FY26 total inflation ">$50m including >$30m of tariff"; Q1 FY26 "nearly $60 million, including approximately $40 million in tariff impact", with ex-tariff inflation put at ~$20m in the quarter | (2) The company's own revision size: in one quarter the CFO **raised the full-year inflation expectation by "a little under a point", "driven by fuel and copper"**. ±$40m/yr is ~50% of the disclosed non-tariff run-rate and roughly three-quarters of a point of guided sales | Non-tariff inflation **−$40m** | **Base case (58% offset symmetric): +$0.079** `40 × 0.42 × 0.004729`. **Bound: +$0.189** | Non-tariff inflation **+$40m** | **Base case (58% realised offset): −$0.079** `40 × 0.42 = $16.8m; × 0.004729 = −$0.079`. **Zero-mitigation bound: −$0.189** `40 × 0.004729` | **58% — realised, H1 FY26**, same computation and citation as row 3 (the disclosed offset is measured against *total* inflation, tariff and non-tariff together; the pool does not split the offset by cost type, and splitting it would be invention). Zero-mitigation figure shown beside it, labelled `0% — bound`. **Note the standing weakness: no commodity hedging programme is disclosed anywhere in the pool**, so metal prices move straight into cost of goods sold — but "unhedged" is a fact about derivatives, not a measurement of realised recovery, and the 58% is the measurement | **Low.** The base level is a residual of two "more than / approximately" call figures; the move size is inferred from a qualitative CFO statement | Cost: `Q2 FY26 transcript, prepared remarks`; `Q1 FY26 transcript, Q&A (Scott Graham / Corona)` — "we have raised our expectations for inflation a little under a point for the year. And it's really driven by fuel and copper". No hedging: `FY24 10-K, Item 7A` (covers interest-rate and currency risk only); inputs list `FY24 10-K, Item 1 — Raw materials` |
| **5. Maverick Power — close and contribution** | **Not owned.** $1.75bn purchase price plus up to $550m contingent, **~$700m of estimated 2026 revenue**, close expected **Q4 2026 subject to regulatory approval**, funded "with a combination of available cash on hand and new debt" | (1) Company-disclosed deal terms. Bull = closes 1-Oct-2026 and one quarter is owned; bear = does not close inside FY2026 | Closes for the full fourth quarter → **+~$175m of FY2026 revenue (+3.3% of the guided midpoint)**; ~$700m annualised = +13.0% | **Impact on adjusted EPS: not quantifiable** — direction only. The company says the deal is "accretive to adjusted earnings per share in the first year following completion", which is company language about an uncompleted deal, not an audited or computable number | Regulatory delay or termination → **$0 of FY2026 revenue** | **Impact on adjusted EPS: not quantifiable.** The bear is simply the guided base, which already excludes the deal — proved arithmetically upstream: the FY26 guide implies only −$15.9m of H2 non-organic revenue, so Maverick is not inside it | **Not applicable — no stress is run.** Nothing is being held at zero; the magnitude cannot be computed in either direction | **Low — sign only.** Why it is not quantifiable: Maverick's own margin is not disclosed, its intangible amortisation is unknown (and would be excluded from adjusted EPS anyway), and the cash-versus-new-debt funding split is not disclosed, so the interest drag cannot be sized. Deriving an EPS number would be invention | `nVent press release, "nVent to Acquire Maverick Power", 24-Aug-2026`; guidance-exclusion arithmetic at `02_revenue-drivers.md`, §4a; consensus exclusion at `04_guidance-consensus.md`, §7 (export cut-off 7-Aug-2026) |
| **6. Interest rates on floating-rate debt** | **$200.0m of $1,500.0m total debt was variable-rate at 30-Jun-2026 (13%)**; $1,300.0m fixed. FY2026 interest expense guided ~$65m | (1) Company-disclosed move: Item 7A tests **±100bp**. The disclosed coefficient of **±$8.7m of interest incurred** was measured on a 60% fixed / 40% variable book at 31-Dec-2024 and must be restated onto today's 87/13 book — a sensitivity carries its basis (§15) | **−100bp** | **+$0.009** `200.0 × 0.01 = $2.0m; × 0.004729 = +$0.0095`. **Pro-forma bound if Maverick's ~$1.75bn is funded entirely with floating debt: +$0.083** `1,750 × 0.01 = $17.5m` | **+100bp** | **−$0.009** (same arithmetic). **Pro-forma bound: −$0.083** | **0% — bound on the pro-forma figure only** (it assumes the whole purchase price is floating-rate new debt and that no fixed-rate or cash funding is used; cash was $256.0m at 30-Jun-2026, so most of the price must be borrowed, but the fixed/floating split is not disclosed). The $0.009 current-book figure needs no mitigation assumption — it is arithmetic on a filed balance | **Medium.** The ±100bp move and the original $8.7m are company-disclosed; the restatement onto the 30-Jun-2026 balance is arithmetic on a filed figure — *inference, not a company-disclosed sensitivity at the current balance* | Disclosed sensitivity: `FY24 10-K, Item 7A` — "a 100 basis point increase or decrease in interest rates would result in a $8.7 million increase or decrease in interest incurred". Current balance: `Q2 FY26 10-Q, fair-value note` — Variable rate debt $200.0 / Fixed rate debt $1,300.0 / Total $1,500.0. Funding language: `nVent press release, 24-Aug-2026` |
| **7. Segment mix — Systems Protection share of revenue** | **72.5% of H1 FY26 revenue**, up from 65.6% in Q2 FY25 and **60.7% in FY2024 (audited)**. Systems Protection earns a lower margin than Electrical Connections at both the gross line (~9pp lower) and the segment-income line (23.2% vs 27.3% in Q2 FY26) | (2) Historical observed range: the weight moved **+7.25pp year on year in Q2 FY26** and **+11.8pp since FY2024**. ±5pp over the next twelve months sits inside that | Systems Protection weight **−5pp** (short-cycle Electrical Connections recovers relatively) | **+$0.052** `5,372.5 × 0.05 = $268.6m of revenue re-weighted; × 4.1pp margin gap = $11.0m; × 0.004729 = +$0.052` | Systems Protection weight **+5pp** | **−$0.052** (same arithmetic). Alternative metric, computed from the company's own segment cost of goods sold: **−7.74bps of group gross margin per pp** (the −56.1bps the upstream bridge attributed to a +7.25pp weight shift) | **0% — bound.** No pricing, sourcing or cost action is assumed to offset the mix. The realised offset is **not computable from the pool**: the two segments' margins moved in opposite directions for opposite reasons in the same quarter (Systems Protection +150bps on overhead absorption, Electrical Connections −140bps on price-cost and growth spending), so no clean mix-mitigation rate can be measured | **Low.** Uses Q2 FY26 *segment income* margins as a proxy for the marginal adjusted operating margin. `03_margin-drivers.md` §4 warns segment income is not an operating margin — using its *difference* for a marginal shift is defensible but is inference, not from filings | Weights and margins: `Q2 FY26 10-Q, Note 13 (Segment information), p.20` and `MD&A p.29–30`; `FY24 10-K, Note 15, p.70`. Gross-margin coefficient: `03_margin-drivers.md`, §7a |

**Two rows share one offset rate, and that must not be double-counted.** Rows 3 and 4 both apply the 58% H1 FY26 realised offset, because the company discloses the offset only against *total* inflation, never split between tariff and non-tariff cost [`Q2 FY26 transcript, prepared remarks` — "Price plus productivity offset inflation of more than $50 million, including more than $30 million in tariff impact"]. They are shown separately because they are set by different actors — governments versus commodity and labour markets — and because `03_margin-drivers.md` §5 scores them as two separate High-magnitude drivers. Adding their bear cases together assumes both move adversely at once, which is a joint scenario, not a sensitivity; §5 handles that.

**Where the offset came from, in full, so the reader can rebuild it (CLAUDE.md §9).** Q1 FY26: disclosed pre-mitigation inflation of "nearly $60 million, including approximately $40 million in tariff impact" ÷ $1,242.0m of sales = ~483bps, against an observed gross-margin change of 35.9% vs 38.8% = −290bps → realised offset `1 − 290/483 = 40%`. Q2 FY26: "more than $50 million, including more than $30 million in tariff impact" ÷ $1,471.3m = ~340bps, against an observed −70bps → `1 − 70/340 = 79%`. H1 combined: ~$110m ÷ $2,713.3m = ~405bps against −170bps → **58%**, the rate used above. **Three qualifiers travel with it and are not dropped:** (a) the cost dollars are call figures stated as floors ("more than", "nearly"), so the denominators are at least this large and the offsets are conservative; (b) the observed gross-margin change also carries unfavourable product mix and new-plant start-up cost as drags and volume leverage plus productivity as helps, so the pure price-versus-cost recovery is *higher* than 40%/79% — these are floors, not point estimates; (c) the previous cycle **over-recovered and then gave the price back** — group price rose +5.5% in 2023 against volume of −0.4%, and the 10-K's own segment bridge attributes +4.2 points of Enclosures margin and +4.0 points of Electrical & Fastening margin to price alone, after which price went to **−0.2% in 2024** when cost pressure eased [`FY24 10-K, Item 7, components of change, p.24–28`]. That is why the *bull* cases in rows 3 and 4 are also run at 58% rather than at full retention: price at nVent is cost-linked and handed back, not a permanent ratchet.

**"No contractual pass-through" is a contractual fact, not a measurement (CLAUDE.md §9).** No escalator, index-linked price or raw-material surcharge is disclosed on any nVent contract, and the project work is fixed-price [`business-model/06_value-chain.md`, §2, citing `FY24 10-K, Item 1A and Note 1`]. That fact is stated here as a contractual fact and is nowhere used as if it were the realised recovery rate. The realised recovery rate is the 40% / 79% / 58% computed above, and that is what the bear cases run at.

---

## 3. Sensitivity Ranking

Sorted by absolute impact, computed as the average of `|bull|` and `|bear|` in adjusted diluted EPS. **The base-case column runs cost shocks at the measured 58% realised offset; the bound column runs them at zero mitigation.** The two columns rank the same variables differently, and both are shown rather than one being chosen silently.

| Rank | Variable | Absolute Impact — base case (avg of bull + bear) | As % of the $5.05 base | Absolute Impact — zero-mitigation bound | Direction of Current Trend |
|---:|---|---:|---:|---:|---|
| 1 | **Data-centre / infrastructure demand volume** | **$0.473** | 9.4% | $0.473 (no mitigation case exists) | **Two-handed.** Delivered revenue accelerating (+115.6% YoY in the vertical; data-centre sales guided to more than double to >$2bn). Forward orders decelerating: organic orders ~40% → "low double digits", backlog $2.6bn → $2.5bn, implied Q2 book-to-bill ~0.93x (range 0.86–1.00x) from ~1.2x |
| 2 | **Incremental margin rate on the guided volume** | **$0.350** | 6.9% | $0.350 (n/a — this row is the mitigation channel) | **Favourable and running near its own stated ceiling.** Adjusted ROS 21.9% and adjusted EBITDA margin 23.0% are the highest of the eight quarters in the pool; management has capped the rate at mid-20s and says the old 30% is no longer the target |
| 3 | **All-in US tariff cost** | **$0.099** | 2.0% | $0.236 (rank 1 among the cost rows) | **Rising.** Guide raised $80m → $100m in one quarter; ~$90m in FY2025 → ~$190m all-in run rate ≈ 3.5% of guided sales. Offset improving (40% → 79%) but guided, not proven, for Q3 |
| 4 | **Non-tariff input-cost inflation** | **$0.079** | 1.6% | $0.189 | **Rising, unhedged.** CFO raised the full-year inflation expectation by "a little under a point" on fuel and copper; no commodity derivative is disclosed anywhere in the pool |
| 5 | **Segment mix — Systems Protection share** | **$0.052** | 1.0% | $0.052 | **Deteriorating, mechanically.** 60.7% (FY2024) → 72.5% (H1 FY26); Maverick most likely lands in the same segment and pushes it further (segment placement is inference, not from filings) |
| 6 | **Interest rates on floating-rate debt** | **$0.009** | 0.2% | $0.083 on the Maverick pro-forma bound | **Small today, larger after Q4.** Only 13% of debt floats at 30-Jun-2026 ($200.0m of $1,500.0m); the $1.75bn acquisition is funded with "cash on hand and new debt" |
| 7 | **Maverick Power — close and contribution** | **Not quantifiable on EPS** (revenue: +$175m in Q4 = +3.3% of guided FY26 revenue; ~$700m annualised = +13.0%) | n/a | n/a | **Pending.** Announced 24-Aug-2026, expected to close Q4 2026 subject to regulatory approval; outside both the FY26 guide and every consensus estimate in this pool |

**On the ranking's own limits.** Rank 7 cannot be placed against the others because its EPS effect is not computable, and it is placed last for that reason and no other — on *revenue* it would rank second. Rank 6's bound is roughly nine times its current-book figure and would move it to rank 4 the moment the acquisition debt is drawn; that is a dated, near-term change, not a hypothetical.

---

## 4. The Single Highest-Sensitivity Variable

**Data-centre capital spending, read through the infrastructure vertical, moves earnings more than anything else, and the gap to second place is not close.** A ±20% move in the >$2.0bn of guided FY2026 data-centre sales is ±$400m of group revenue; at the company's own mid-20s incremental rate that is ±$100m of adjusted operating income and **±$0.473 of adjusted EPS, or ±9.4% of the $5.05 guided base** — larger than variables 3 through 7 combined at their base cases ($0.099 + $0.079 + $0.052 + $0.009 = $0.239). The magnitude claim rests on already-realised arithmetic rather than an assumed elasticity: infrastructure sales rose $473.2m in Q2 FY26, which is **49.1pp of the 52.8pp of observed growth — 93.1% of every incremental dollar** ($473.2m ÷ $508.2m) [`Q2 FY26 10-Q, Note 2, p.9`; arithmetic at `02_revenue-drivers.md`, §6a], and the conversion rate is the company's own guided mid-20s, independently corroborated by the 24.1% it actually printed in Q2.

**This variable is external, not company-controlled.** nVent can win content per site — new products contributed "over 30 points" to Q2 sales growth on management's own undefined measure, and it is adding a third Minnesota liquid-cooling plant — but it does not decide how many data centres get built. The business-model module reaches the same read independently and calls the marginal dollar "close to a pure bet on AI data-centre capital spending" [`business-model/10_external-dependency.md`, §3 and §5].

**What would have to happen for it to swing to the adverse case, and the honest state of the evidence today.** The mechanism is not a demand announcement — it is backlog running out faster than it is replaced. Backlog of $2.5bn at 30-Jun-2026 is roughly 47% of guided FY2026 revenue, which is why the near term is largely already sold. The adverse case needs organic order growth to stay in low double digits for another two quarters while the newly opened Blaine 1 capacity ramps and Blaine 2 is committed for H1 2027 — at which point the same fixed spend flips from a booking to an under-absorbed cost and variables 1 and 2 compress together. **The disconfirming series is already visible and is named rather than averaged away:** organic orders decelerated from approximately 40% in Q1 FY26 to "low double digits" in Q2, backlog fell from $2.6bn to $2.5bn, and the implied Q2 book-to-bill of ~0.93x (honest range 0.86–1.00x, because both backlog figures are rounded to $0.1bn) is below Q1's ~1.2x. Management's explanation — that it deliberately converted backlog ("we worked hard in Q2 to really execute on that backlog"), that data-centre orders are "large and lumpy", and that Q3 data-centre orders have been strong — is plausible and unverified: it is commentary about a quarter that has not been reported. Only the sales series is filed; the orders and backlog figures exist solely in transcripts, at group level, with no segment split. **The single observable that resolves it is the Q3 print on 30-Oct-2026:** organic order growth versus organic sales growth, and whether backlog stops falling.

---

## 5. Interaction Effects

**Three of the seven variables are the same story read at different points, and they compound rather than diversify.** Variables 1 and 2 are multiplicative by construction — the EPS impact is `incremental revenue × incremental rate`, so an adverse move in volume and an adverse move in the conversion rate hit the same product. Taken together at the bear ends (−$400m of revenue *and* a 20% incremental rate rather than 25%) the compound effect is **−$0.79**, not the −$0.82 that adding the two rows would give, because the rate change applies to a smaller incremental base: `(1,479.4 − 400) × 0.20 = $215.9m` of adjusted operating income against the guided `1,479.4 × 0.25 = $369.9m`, a shortfall of $154.0m → −$0.728 of EPS, plus the lost gross contribution already inside it. **Stated plainly: the two largest variables are not independent, and any use of this table that adds them is overstating the range by roughly 4%.** Variable 5 (Maverick) also feeds variable 7 (segment mix) and variable 6 (interest), because the acquired business most likely lands in the lower-margin Systems Protection segment and is funded with new debt — one event moving three rows the same way.

**Two pairs genuinely move together for external reasons.** Tariffs (variable 3) and non-tariff input inflation (variable 4) both respond to the same trade and commodity environment and are offset by the same single lever — price plus productivity — which the company discloses only as one combined number; if that lever underperforms, both rows deteriorate at once. And tariffs correlate with volume in an unexpected direction: management attributed the $80m → $100m tariff increase "largely… [to] our significantly higher volume growth", so a data-centre downturn would *reduce* tariff cost while cutting revenue — a small natural offset inside a much larger adverse move [`Q2 FY26 transcript, prepared remarks`].

**One pair that does not move together, contrary to the usual industrial pattern.** FX is normally correlated with commodity prices in a manufacturer's cost base; here it is immaterial in both directions — roughly 81% of FY2025 revenue was Americas, costs are generally denominated in the same local currencies as revenue, currency added only 0.5pp to Q2 revenue growth, and no FX margin effect is disclosed [`FY24 10-K, Item 7A`; `Q2 FY26 10-Q, MD&A, p.26`; `CIQ Financials→Segments`, geographic, FY2025, tier-5 vendor data]. It is not carried as a compounding factor.

---

## 6. Non-Linear Or Asymmetric Risks

**Four asymmetries are present, and three of them run against the shareholder.**

1. **Operating deleverage — the largest asymmetry, and it sits under the largest variable.** The +416.7bps of operating-margin gain in Q2 FY26 decomposes with no residual into gross margin −67.9bps, SG&A ratio +452.8bps and R&D ratio +31.8bps: **the SG&A line alone is 109% of the entire move**, and stripping intangible amortisation out of both years it still falls 359bps [`Q2 FY26 10-Q, MD&A p.26 and p.28`; `03_margin-drivers.md`, §8]. That gain is fixed overhead spread across organic sales up 46.9% — it is only as durable as the volume, and it reverses on the way down. **The 25% incremental rate used in variable 1's bear case therefore understates a down-volume decremental**, because it was measured on rising volume against a fixed base that is being deliberately *enlarged*: three Minnesota liquid-cooling plants are now committed (Blaine 1 ramping through 2026 into 2027, Blaine 2 opening H1 2027), FY2026 capex is guided ~$130m (up ~40%) and D&A ~$230m, against orders management itself calls "large and lumpy". The pool contains no organic-revenue decline since the divestiture, so the true decremental rate is **not measurable from available data** — which is exactly why variable 1's bear is labelled a bound.
2. **Pass-through lag — cost hurts before price recovers it.** The realised offset was 40% in Q1 FY26 and 79% in Q2, a one-to-two-quarter lag visible in the sequence itself and in Electrical Connections' segment margin, which fell 390bps YoY in Q1 and only 140bps in Q2 as pricing landed [`Q1 FY26 10-Q, MD&A`; `Q2 FY26 transcript, Q&A (Corona)`]. A step-change in tariffs or copper therefore lands roughly a full quarter before its offset does, so the *quarterly* damage from variables 3 and 4 exceeds the annualised base cases above even when the annual offset holds.
3. **Price is given back but cost is not.** The 2023–24 record shows the bull side of variables 3 and 4 is weaker than the bear side: price rose +5.5% in 2023 when cost pressure was high, then went to **−0.2% in 2024** when it eased [`FY24 10-K, Item 7, p.24–28`]. Cost relief is therefore competed away, which is why both bull cases are run at 42% retention rather than 100% — and why the zero-mitigation *bull* bound is the least believable number in the table.
4. **One asymmetry runs in the shareholder's favour, and it is worth stating.** The Q2 FY26 gross margin carries a **$25.8m one-off IEEPA tariff reimbursement worth +175bps** that the company itself excludes from segment income and from adjusted operating income — so the base metric used throughout this report is already clean of it, and its reversal to zero cannot damage adjusted EPS. Ex-IEEPA, run-rate gross margin fell **243bps**, not the reported 70bps, and adjusted EBITDA margin still rose 86bps [`Q2 FY26 10-Q, Note 13, p.21 and MD&A p.27`; `03_margin-drivers.md`, §3]. Anyone running these sensitivities off *reported* gross margin rather than the adjusted line would double-count a one-off in the base.

**Two candidate non-linearities checked and NOT found.** No covenant threshold effect is in play: strict, filing-verified net debt at 30-Jun-2026 was **$1,236.4m = 1.16x TTM adjusted EBITDA** (total debt $1,492.4m from the company's own debt note, which contains no lease liabilities, less cash $256.0m), well below the company's own 2.0–2.5x target [`Q2 FY26 10-Q, Note 10 (Debt)` and `Condensed Consolidated Balance Sheets, p.4`; `01_historical-financials.md`, §2]. Capital IQ's total debt of $1,632.9m is the same balance sheet on a **broad** basis that folds in $140.5m of lease liabilities, giving net debt $1,376.9m and 1.28x — a definitional difference that is reconciled to the cent upstream, not a disagreement [`ciq_facts.json`; `01_historical-financials.md`, §1 basis note]. Even the Maverick purchase price added gross to that base leaves leverage below the top of the company's stated target range on the strict basis, so no covenant cliff is identified in this pool. And no customer-concentration cliff can be assessed either way: "No customer accounted for more than 10% of net sales in 2024, 2023 or 2022", and **no equivalent statement for FY2025 or FY2026 exists in this pool** — whether the data-centre surge has created a single large customer is **not proven from available data** [`FY24 10-K, Note 15, p.70`; absence confirmed against the frozen corpus].

---

## 7. Earnings Volatility Score

# **68 / 100** — **INVERTED SCORE (higher = WORSE)**

Band **61–80: high volatility — multiple variables with large impact.**

**The one-line reason:** a single external variable nobody at nVent controls — AI data-centre capital spending — swings adjusted EPS ±9.4% on a ±20% move, its leading indicator (organic orders ~40% → low double digits, book-to-bill ~0.93x from ~1.2x, backlog $2.6bn → $2.5bn) has already turned while the reported line is still accelerating, and 109% of the latest margin gain is fixed-overhead absorption on that same volume, against a fixed-cost base being deliberately enlarged.

**What holds the score out of the 81–100 band, quantified:** the $2.5bn backlog covers roughly 47% of guided FY2026 revenue, so the next two quarters are largely already sold; cost mitigation is **measured rather than assumed** at 58% for H1 FY26 (40% → 79% across the two quarters), which cuts the cost rows to a fifth of their zero-mitigation bounds; 87% of debt is fixed-rate, so a 100bp move costs only ~$2.0m of interest today; FX moves the top line 0.5pp and its only disclosed sensitivity hits equity, not earnings; and the base metric is already clean of the $25.8m IEEPA one-off.

**What pushes it above 60 rather than into the 41–60 band:** 93.1% of Q2 growth came from one vertical and ~37% of guided FY2026 sales from one end market; the entire operating-margin improvement is volume absorption, not manufacturing economics (run-rate gross margin fell 243bps ex the one-off); tariffs of ~$190m all-in ≈ 3.5% of sales are set by governments and the guide moved 25% in a single quarter; commodity input cost is financially unhedged with **no published commodity sensitivity**; the only company-disclosed earnings sensitivities are the FY2024 interest-rate and currency coefficients, neither of which touches a top-three variable; and a $1.75bn acquisition funded with cash and new debt sits outside every number in the guide and every estimate in the pool.

---

## 8. Structured Emission

`analyses/NVT_2026-09-07/earnings/sensitivity_summary.json` was written alongside this report, conforming to `frameworks/sensitivity_summary.schema.json`. It carries **six** of the seven §2 variables — every one that has a clean per-unit coefficient. **Variable 5 (Maverick Power) is deliberately omitted**: it has deal terms and a company assertion of first-year accretion but **no clean per-unit rate**, so recording a coefficient for it would be invention. Each recorded coefficient reproduces this report's bull and bear impacts exactly when multiplied by the §2 deltas; the two cost rows record the coefficient at the **58% realised-offset base case**, with the zero-mitigation bound stated in each entry's `non_linearity` field so a modelled answer cannot present the bound as the expectation.

---

## 9. Citations

All documents sit inside the frozen extract generation `6db32848…1aecd1e6`, cited under the logical label `data/NVT/`.

| # | Source |
|---|---|
| [1] | `FY24 10-K` (nVent Electric plc, Form 10-K, fiscal year ended 31-Dec-2024) — Item 1 (Raw materials); Item 1A; **Item 7A (Quantitative and Qualitative Disclosures about Market Risk)**, p.36; Item 7 components-of-change tables p.24–28; Note 15 (Segment Information) p.70 |
| [2] | `Q1 FY26 10-Q` (quarter ended 31-Mar-2026, signed 1-May-2026) — MD&A p.24–26 |
| [3] | `Q2 FY26 10-Q` (quarter and six months ended 30-Jun-2026) — Condensed Consolidated Statements of Income p.3; Condensed Consolidated Balance Sheets p.4; Note 2 (Revenue) p.8–9; Note 4 (Earnings Per Share) p.9; Note 10 (Debt); fair-value note (variable/fixed rate debt split); income-tax note; Note 13 (Segment information) p.19–22; MD&A p.24–30 |
| [4] | `Q1 FY26 earnings call transcript` (FactSet CallStreet, Corrected Transcript, verbatim), 1-May-2026 — prepared remarks and Q&A |
| [5] | `Q2 FY26 earnings call transcript` (S&P Global Market Intelligence, verbatim), 31-Jul-2026 — prepared remarks and Q&A |
| [6] | `Q1 FY26 earnings presentation`, 1-May-2026 — slide 16 (Reported to Adjusted 2025 Reconciliation) |
| [7] | `nVent press release, "nVent to Acquire Maverick Power"`, 24-Aug-2026 |
| [8] | `Capital IQ Financials export` → Income Statement / Segments tabs, 12m Dec-31-2025 and LTM Jun-30-2026 — tier-5 vendor data, as of ~12-Aug-2026 |
| [9] | `Capital IQ Estimates export` → Guidance tab (FY2026 interest expense, D&A, capex, EPS guidance rows) and Consensus tab — tier-5 vendor data, as of ~12-Aug-2026 |
| [10] | `ciq_facts.json` deterministic facts sidecar, frozen generation `6db32848…1aecd1e6` (net debt $1,376.9m and total debt $1,632.9m on the vendor's lease-inclusive **broad** basis; reconciled to the strict basis upstream) |
| [11] | `analyses/NVT_2026-09-07/earnings/01_historical-financials.md` |
| [12] | `analyses/NVT_2026-09-07/earnings/02_revenue-drivers.md` |
| [13] | `analyses/NVT_2026-09-07/earnings/03_margin-drivers.md` |
| [14] | `analyses/NVT_2026-09-07/earnings/04_guidance-consensus.md` |
| [15] | `analyses/NVT_2026-09-07/earnings/06_earnings-quality.md` |
| [16] | `analyses/NVT_2026-09-07/earnings/00_earnings-data-triage.md` |
| [17] | `analyses/NVT_2026-09-07/business-model/10_external-dependency.md` (external variable identification; §2 disclosed sensitivities; §5 single biggest lever) |
| [18] | `analyses/NVT_2026-09-07/business-model/06_value-chain.md` (contractual pass-through terms) |

**Partial-data status: none applied.** Two verbatim transcripts, two 10-Qs with full segment notes, an audited FY2024 10-K with a published Item 7A, and full consensus/guidance exports are all present. The MODULE_RULES cap "no sensitivity disclosures and only inferred sensitivities → earnings-volatility confidence must be Low" does **not** bind, because company-disclosed per-unit sensitivities exist (Item 7A interest-rate and currency coefficients; the mid-20s incremental rate; the tariff dollar guide). The genuine limits carried forward: **no FY2025 Form 10-K**, so the market-risk disclosure used is the FY2024 set and the Q2 FY26 10-Q points to a FY2025 10-K this run cannot read; **no commodity-price sensitivity and no commodity derivative is disclosed anywhere in the pool**, which is a real disclosure gap on the input the company names first among its inflation drivers; input costs, freight, energy and labour are never disclosed as line items or as shares of cost of goods sold; price and productivity are never split; and the pool contains no organic-revenue decline since the divestiture, so a down-volume decremental rate is not measurable.

### Calculation provenance

Every EPS impact, coefficient, offset rate and percentage in this report was produced by an executed Python snippet from the cited filed figures, not mental arithmetic. Spot-checks reproduced: conversion factor `(1 − 0.224) / 164.1 = 0.004729`; `400 × 0.25 × 0.004729 = 0.4729`; realised Q2 incremental `(322.7 − 200.0) / 508.2 = 24.1%`; `1,479.4 × 0.05 × 0.004729 = 0.3498`; `50 × (1 − 0.58) × 0.004729 = 0.0993` against the bound `50 × 0.004729 = 0.2364`; `40 × 0.42 × 0.004729 = 0.0794` against the bound `0.1892`; `200.0 × 0.01 × 0.004729 = 0.00946` and `1,750 × 0.01 × 0.004729 = 0.0828`; `5,372.5 × 0.05 × 0.041 × 0.004729 = 0.0521` and the gross-margin alternative `−56.1 / 7.25 = −7.74bps per pp`; offsets `1 − 290/483 = 40.0%`, `1 − 70/340 = 79.4%`, `1 − 170/405 = 58.0%`; base coherence `5.05 × 164.1 = 828.7`, `828.7 / 0.776 = 1,067.9`, `+65 = 1,132.9`, `÷ 5,372.5 = 21.1%`.



---

## earnings / 08_earnings-red-flags.md

_Source: `08_earnings-red-flags.md`_

# Earnings Red Flags — NVT

**Company:** nVent Electric plc (NYSE: NVT). **Regime:** US SEC domestic filer (Irish-incorporated). **Standard:** US GAAP. **Currency:** USD, in millions except per-share. **Fiscal year ends 31 December.**

**Upstream status: complete.** All eight prior earnings outputs were read in full (`00`–`07`, plus the `sensitivity_summary.json` sidecar). **No upstream output is missing**, so no degraded-confidence note applies. The business-model module is also complete and was read (`03_segment-map`, `06_value-chain`, `10_external-dependency`, `11_capital-allocation-governance`, `12_red-flags-sweep`, `99_business-model-synthesis`), so the "business-model module not available" disclaimer does **not** apply to this run.

**Evidence binding: frozen.** Every read resolved through generation `6db32848…1aecd1e6` (`manifest.json`, `corpus.txt`, `ciq_facts.json`, per-tab extracts). Live `data/NVT/` was not read; `data/NVT/…` is a citation label only. Where this sweep goes back to raw evidence rather than relying on an upstream read, the filing or release is cited directly.

**All 15 pool sources are in English.** No language-based gap exists and none is recorded (CLAUDE.md §27).

**What this agent did beyond re-reading.** Four checks were run against the frozen corpus rather than taken on an upstream agent's word, because an upstream claim looked either too strong or too weak: the Maverick Power release's own valuation disclosure, the FY2024 deferred-tax valuation-allowance language, the Capital IQ quarterly consensus row for FQ4 2026, and the diluted share count and effective tax rate behind the Q2 adjusted-EPS growth. Two of the four produced findings no upstream agent carries. They are flagged as such.

---

## 1. Upstream Evidence Map

### Bullish Evidence

| Source Agent | Claim | Evidence | Confidence |
|---|---|---|---|
| `01_historical-financials` | Revenue growth is accelerating sharply — TTM to 30-Jun-2026 of $4,834.0m, +46.2% on the prior TTM | [`01_historical-financials` output, §2 and §6], from `Q2 FY26 10-Q, statements of income, p.3` and `Capital IQ Financials→Income Statement, LTM Jun-30-2026` | High |
| `01_historical-financials` | Adjusted EBITDA margin inflected up in Q2 FY26 — +72bps YoY and +146bps QoQ to 23.0%, the best of eight quarters | [`01_historical-financials` output, §3] | High |
| `02_revenue-drivers` | Infrastructure demand produced 93.1% of every incremental Q2 dollar; organic growth +46.9% | [`02_revenue-drivers` output, §6a], from `Q2 FY26 10-Q, Note 2 (Revenue), p.9` | High |
| `03_margin-drivers` | The whole operating-margin gain ties exactly: gross −67.9bps, SG&A +452.8bps, R&D +31.8bps = +416.7bps | [`03_margin-drivers` output, §8], from `Q2 FY26 10-Q, MD&A, p.26` | High |
| `03_margin-drivers` | Capacity spend reads as a demand signal, not a cost: capex intensity flat (2.42% vs 2.40%), D&A ratio down 106bps, backlog 3.3x its level 18 months ago | [`03_margin-drivers` output, §9] | Medium |
| `04_guidance-consensus` | Two large guidance raises in five months; FY26 adjusted-EPS midpoint +25.5% (4.075 → 5.05) | [`04_guidance-consensus` output, §2], from `Q2 FY26 transcript, prepared remarks, 31-Jul-2026` | High |
| `04_guidance-consensus` | Zero downward revisions on revenue, EBITDA or adjusted EPS across FY2026, FY2027 and FQ3 2026 over three months | [`04_guidance-consensus` output, §5], from `CIQ Estimates→Revisions` | High |
| `05_beat-miss-setup` | The Q3 bar embeds a sequential decline — revenue −3.0% and adjusted EPS −4.1% below the quarter just reported | [`05_beat-miss-setup` output, §1 and §8] | High |
| `06_earnings-quality` | Cash backs the earnings: CFO/EBITDA 69.1% → 73.3% → 74.4% → 78.7% → 73.0%; cash conversion cycle 15.5 days shorter than FY2023 | [`06_earnings-quality` output, §1 and §2] | High |
| `06_earnings-quality` | Stock-based compensation is expensed inside adjusted earnings, and the company removed a $25.8m GAAP benefit from its own adjusted Q2 numbers | [`06_earnings-quality` output, §4], from `Q2 FY26 10-Q, Note 13, p.21` | High |
| `07_earnings-sensitivity` | Cost mitigation is measured, not assumed: realised offset 40% (Q1 FY26) → 79% (Q2 FY26), 58% for H1 | [`07_earnings-sensitivity` output, §2] | Medium |
| `07_earnings-sensitivity` | No covenant cliff: strict net debt $1,236.4m = 1.16x TTM adjusted EBITDA, below the company's own 2.0–2.5x target | [`07_earnings-sensitivity` output, §6], from `Q2 FY26 10-Q, Note 10 (Debt)` | High |

### Bearish Evidence

| Source Agent | Claim | Evidence | Confidence |
|---|---|---|---|
| `02_revenue-drivers` | The leading indicator has turned: organic orders ~40% → "low double digits"; backlog $2.6bn → $2.5bn; implied Q2 book-to-bill ~0.93x (range 0.86–1.00x) from ~1.2x | [`02_revenue-drivers` output, §4 and §6a], from `Q1 FY26 transcript, prepared remarks, 1-May-2026`; `Q2 FY26 transcript, prepared remarks, 31-Jul-2026` | Medium — rounded transcript figures, group level only |
| `02_revenue-drivers` | Q2 FY26 is a peak-of-cycle print, not a normalised base | [`02_revenue-drivers` output, §4a] | High |
| `03_margin-drivers` | Run-rate gross margin fell 243bps ex the $25.8m IEEPA credit, not the reported 70bps | [`03_margin-drivers` output, §3], from `Q2 FY26 10-Q, Note 13, p.21` and `MD&A, p.27` | High |
| `03_margin-drivers` | The margin verdict rests on overhead absorption, not manufacturing economics, and would not survive a volume stall | [`03_margin-drivers` output, §8] | High |
| `03_margin-drivers` | Bridge residual −209.6bps against +141.7bps explained — most of the gross-margin move is unattributed to a driver | [`03_margin-drivers` output, §7a] | High |
| `04_guidance-consensus` | Q4 consensus revenue $1,318.67m is +5.32% above the $1,252.09m the company's own FY and Q3 guidance imply | [`04_guidance-consensus` output, §3] | High |
| `04_guidance-consensus` | The entire panel is positioned one way — 15 Buy of 18 opinions, no bearish cohort left to convert | [`04_guidance-consensus` output, §5 and §7] | High |
| `05_beat-miss-setup` | The beat base rate is two observations inside a single data-centre upswing — judgment, not a measured frequency | [`05_beat-miss-setup` output, §7] | High |
| `06_earnings-quality` | Adjusted EPS ran 28.8% above GAAP in FY2025; 87% of the add-back is recurring acquisition amortisation ($147.1m FY2025, $165.2m LTM, rising every year) | [`06_earnings-quality` output, §7 and §10] | High |
| `06_earnings-quality` | FY2025 continuing-operations FCF of $555.7m overstates group cash generation by $183.8m of disposal tax | [`06_earnings-quality` output, §1] | High |
| `07_earnings-sensitivity` | One uncontrollable external variable swings adjusted EPS ±9.4% — more than variables 3 to 7 combined | [`07_earnings-sensitivity` output, §3 and §4] | High |
| `07_earnings-sensitivity` | The 25% incremental rate was measured on rising volume, so the bear case is a floor on the damage, not a central estimate | [`07_earnings-sensitivity` output, §6] | High |
| `business-model/12_red-flags-sweep` | The measure that sets management's incentive-compensation targets excludes the amortisation the acquisitions create — $100.6m, 15.6% of H1 FY26 reportable segment income | [`business-model/12_red-flags-sweep` output, §2 and §3], from `Q2 FY26 10-Q, Note 13, p.19–21` | High |
| `business-model/99_business-model-synthesis` | Business quality 41/100; moat 45/100, "no moat proven"; through-cycle return on capital 8.1% against a ~10.0% cost of capital; classified a sector / technology-cycle bet | [`business-model/99_business-model-synthesis` output, §1] | High |

### Missing Evidence

| What Is Missing | Which Agent Flagged It | Impact On Setup |
|---|---|---|
| **FY2025 Form 10-K** — audited annual filing is FY2024, 20.2 months old | `00`, `01`, `03`, `06`, `07`, and `business-model/12` | The single year in which the mix transformed (infrastructure 45% of sales, EPG acquired, Systems Protection share up) has no audited income statement, cash-flow statement, segment note, MD&A margin bridge, auditor's report or Item 7A. Every FY2025 comparison base in the module is tier-5 vendor data |
| **Q2 FY25 10-Q / a 30-Jun-2025 balance sheet** | `06` §3 | The only true like-for-like comparable for the 30-Jun-2026 receivables balance cannot be built; `06` caps its own DSO verdict on this ground |
| **Q3 FY25 and Q4 FY25 filings; FY2025 earnings calls** | `00` §5; `01` §3 | Four of eight quarterly gross-margin cells are N/A; prior-TTM CFO is not derivable; seasonality is not provable |
| **Any filed order-intake, backlog or book-to-bill series, at any level** | `02` §2 and §4; `03` §11 | The only forward-looking demand data in the whole module exists solely in two earnings-call transcripts, at group level, rounded to $0.1bn |
| **Customer-concentration statement after FY2024** | `02` §4; `07` §6 | "No customer accounted for more than 10% of net sales in 2024, 2023 or 2022" is the latest; there is no equivalent for FY2025 or FY2026 anywhere in the pool [`FY24 10-K, Note 15, p.70`; absence confirmed against the frozen corpus by this agent] |
| **Volume-versus-price split; raw material, freight, energy and labour as line items or shares of COGS** | `02` §6; `03` §2 and §11 | No input-cost bridge in dollars is possible; the ≤5.2pp price figure is a zero-mitigation bound, not an estimate |
| **Any commodity-price sensitivity or commodity derivative** | `07` §1 and §9 | The input the company names first among its inflation drivers has no published coefficient and no disclosed hedge |
| **Segment placement, own margin, intangible amortisation and funding split for Maverick Power** | `02` §5; `03` §11; `07` §2 row 5 | Partly overtaken by evidence — see red flag 19 below. The release does disclose a 2026 adjusted-EBITDA multiple |
| **Q2 FY26 earnings deck / company Q2 reconciliation slide** | `00` §5; `01` §4; `06` §7 | Q2 adjusted EBITDA is vendor-sourced and Q2 adjusted net income is derived (adjusted EPS × 164.1m diluted shares) |
| **Maintenance-versus-growth capex split; cash interest paid FY2025 and LTM** | `06` §1 | FCF may understate recurring free cash flow; the EBITDA→CFO bridge carries a named residual |

### Contradictions Between Agents

| Agent A | Agent A Says | Agent B | Agent B Says | Reconcilable? (Y/N) | Which Is More Credible |
|---|---|---|---|---|---|
| `05_beat-miss-setup` §8 | "**Setup favors beat**" for the next print | `02_revenue-drivers` §4a and `07_earnings-sensitivity` §4 | The leading order series has already turned and the quarter sits at or near a cyclical peak | **Y — on horizon** | **Both, on different horizons.** Adjudicated in full below. The beat read survives for the standalone Q3 print and does not survive across the module's own 3–12 month scope |
| `01_historical-financials` §3 | Q2 FY26 gross margin **−70bps** YoY | `03_margin-drivers` §3 | **−243bps** ex the one-off $25.8m IEEPA credit | **Y** | **`03` — −243bps is the like-for-like read.** Q2 FY25 contained no such credit, so comparing a Q2 FY26 figure that includes a one-off refund against a prior year that does not is not like-for-like. `01`'s −70bps is the correct as-filed number and must keep the label "reported, flattered by a one-off the company itself excludes from its own adjusted profit" |
| `06_earnings-quality` §3 | Receivables flag **dissolves** on a matched basis — DSO 57.4 → 59.3 → 60.1 days | `business-model/11_capital-allocation-governance` | Receivable days **61.6 → 76.1**, scored a severity-40 flag | **Partly** | **`06`'s method is the correct one** (§15 matched-basis: annualised latest-quarter revenue removes the lag between an acquisition's opening balance sheet and its revenue). But `06` caps its own confidence because no 30-Jun-2025 balance sheet exists, so the flag should be recorded as *reduced*, not *cleared*. Three DSO series are now in circulation — see red flag 43 |
| `06_earnings-quality` §9 | Earnings quality **74/100**; the amortisation wedge is "a presentation risk rather than a cash risk" | `business-model/12_red-flags-sweep` §3 and `11` | Same evidence produces `RF-RFS-001` (aggressive accounting pattern, severity 52), a §24 Filter 4 serial-acquirer cap, and the finding that the excluding measure sets incentive-compensation targets | **Partly** | **Neither is wrong on fact; the calibration differs.** `06` is right that the cash is real. `12` is right that the exclusion is not neutral — it is the yardstick management is paid on, and it grows more flattering with every deal. `06` reached 74/100 without that cross-module input. The synthesis must not let 74/100 travel as if the wedge had been cleared |
| `03_margin-drivers` §9 | The evidence favours reading the capacity spend as a **demand signal**, closer to a booking than an expense | `07_earnings-sensitivity` §6 | The same deliberately enlarged fixed base is **the largest asymmetry in the setup**, and it runs against the shareholder | **Y** | **Both, and they name the same flip observable** — organic order growth versus organic sales growth. `03` describes today; `07` describes what happens if the order series does not recover. No adjudication needed beyond keeping both sentences together |

**Adjudication of the headline tension, by name (CLAUDE.md §3): does the beat read survive the order turn, and on what horizon?**

**Yes for the standalone Q3 print; no across the module's own 3–12 month scope.** Three facts decide it and they are not in conflict once the horizon is separated.

- **Q3 is largely already sold.** Backlog of $2.5bn at 30-Jun-2026 is roughly 47% of guided FY2026 revenue [`Q2 FY26 transcript, prepared remarks, 31-Jul-2026`], and the Q3 consensus bar of $1,427.27m is 3.0% *below* the $1,471.3m just delivered [`04_guidance-consensus` output, §1A; `Q2 FY26 10-Q, statements of income, p.3`]. Orders lead sales by more than one quarter in a project business converting out of a book that size, so a book-to-bill of ~0.93x in Q2 is not a Q3 revenue statement. `05`'s read is sound on its own horizon.
- **The order turn is a Q4-and-beyond statement, and it is sharper than the rounding caveat implies.** Both `02` §6a and `03` §9 correctly note that a $0.1bn move sits inside the transcripts' own rounding. But the *direction* changed, and that is not a rounding artefact: in Q1 FY26 backlog **grew** "low-double digits sequentially to $2.6 billion" [`Q1 FY26 transcript, prepared remarks, 1-May-2026`], and in Q2 it "remained healthy at $2.5 billion" — down [`Q2 FY26 transcript, prepared remarks, 31-Jul-2026`]. A swing from roughly +10–13% sequential to negative, in the same quarter organic orders fell from ~40% to "low double digits" against 46.9% organic sales, is a genuine reversal of the sequential trend even where the single-quarter magnitude is inside the rounding.
- **The horizon the module is asked about is 3–12 months, not one quarter.** Over that window: the Electrical Products Group contribution goes to zero from Q3 (it anniversaried 1-May-2026), currency turns to an implied −$15.9m drag across H2 [`02_revenue-drivers` output, §4a], Q4 consensus revenue sits +5.32% above the guide-implied path [`04_guidance-consensus` output, §3], run-rate gross margin is down 243bps, and the entire margin gain is fixed-overhead absorption on volume two agents independently place at or near a cyclical peak.

**Net adjudication:** a Q3 beat is the more likely single outcome and it does not settle the module's question. The setup that `05` describes is a one-quarter setup; the setup the module must report on is a three-to-twelve-month setup, and on that horizon the evidence is genuinely two-sided. This is the single most consequential thing in this report and it drives red flags 1 and 13.

---

## 2. Red-Flag Scan — Category By Category

Status is one of Triggered / Not Triggered / Unclear / Unavailable. Severity is one of Critical / High / Medium / Low. Probability is one of High / Medium / Low / Unknown.

### 2.1 Data Completeness

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| Consensus and price marks both predate the Maverick Power announcement | **Triggered** | **High** | **High** | Latest broker revision 7-Aug-2026 [`CIQ Estimates→Recent Changes`]; price mark 12-Aug-2026 [`CIQ Financials→Multiples`, close column]; deal announced 24-Aug-2026 [`nVent press release, "nVent to Acquire Maverick Power", 24-Aug-2026`] | Every consensus figure, every guidance-versus-consensus gap and the entire Q4 bar in `04` and `05` are pre-Maverick. A ~$700m-revenue business is expected to close inside the guided Q4 and sits in no estimate in this pool |
| No filed order-intake, backlog or book-to-bill series, at group or segment level | **Triggered** | **High** | **High** | Backlog appears only as a rounded call figure — $2.6bn at 31-Mar-2026, $2.5bn at 30-Jun-2026 [`Q1 FY26 transcript, prepared remarks`; `Q2 FY26 transcript, prepared remarks`]; no filed equivalent [`02_revenue-drivers` output, §2 and §6a] | The only forward-looking demand data in the module — the series that decides the 3–12 month verdict — is two rounded, group-level, management-supplied numbers with no segment split and no independent check |
| No FY2025 Form 10-K; the latest audited annual filing is 20.2 months old | **Triggered** | **High** | **High** | [`00_earnings-data-triage` output, §5]; FY2025 income statement, cash flow and segments cited to `Capital IQ Financials export, vendor data as of ~12-Aug-2026` | FY2025 is the transformation year and it has no audited filing: no auditor's report, no MD&A margin bridge, no segment note, no Item 7A. `03` §11 states the most recent company-published quantified margin bridge is FY2024 vs FY2023 |
| No Q2 FY25 10-Q — no 30-Jun-2025 balance sheet | **Triggered** | Medium | **High** | [`06_earnings-quality` output, §3 and §9] | The cleanest receivables test cannot be run. `06` caps its own DSO verdict on exactly this ground, and that cap must travel with the 74/100 quality score |
| No Q3/Q4 FY25 or Q3/Q4 FY24 filings | **Triggered** | Medium | **High** | [`01_historical-financials` output, §3 and §5] | Four of eight quarterly gross-margin cells are N/A; prior-TTM CFO is not derivable; seasonality is "Not proven from available data" and no phasing assumption may be built |
| Price mark ~4 weeks stale | **Triggered** | Low | **High** | Latest price / last close 170.70 / 171.16 as of ~12-Aug-2026 [`CIQ Estimates→Consensus`, Market Summary] | Not a cap under MODULE_RULES, but any stock-reaction context in the synthesis is pre-Maverick and four weeks old |
| No Q2 FY26 earnings deck or company Q2 reconciliation slide | **Triggered** | Low | **High** | [`00_earnings-data-triage` output, §5]; [`06_earnings-quality` output, §7] | Q2 adjusted EBITDA is vendor-sourced ($338.1m) and Q2 adjusted net income is derived ($1.45 × 164.1m shares), not filed |
| Chained dependency on a single tier-5 FY2025 revenue base | **Triggered** | Low | **High** | $3,893.1m [`Capital IQ Financials→Income Statement, 12m Dec-31-2025, vendor as of ~12-Aug-2026`], used as the multiplier base in [`04_guidance-consensus` output, §2] and [`02_revenue-drivers` output, §4a] | The guided revenue range in dollars, the guidance-implied Q4 of $1,252.09m, and the arithmetic proving Maverick is outside guidance all run through one vendor figure and a transcript percentage. Well corroborated (H1 FY25 of $1,772.4m is filing-grade), so severity is Low — but it is a chain, not an independent measurement |
| Consensus genuinely absent / stale enough to trigger the MODULE_RULES cap | **Not Triggered** | — | — | Latest revision 7-Aug-2026 postdates the 31-Jul-2026 print [`04_guidance-consensus` output, §1] | No consensus-setup cap and no staleness haircut binds |
| No cash flow statement / no segment P&L / no verbatim transcript | **Not Triggered** | — | — | Two verbatim transcripts, two 10-Qs with full segment notes including segment COGS, filed cash-flow statements [`00_earnings-data-triage` output, §3 and §5] | No MODULE_RULES score cap binds on this pool. Disclosure here is stronger than most industrials give |
| Fiscal-year mismatch between sources / calendarisation error | **Not Triggered** | — | — | [`04_guidance-consensus` output, §1A] — vendor FQ3 label maps one-for-one onto the standalone US quarter; the 1.53x stub-ratio cross-check passes | No CLAUDE.md §27 basis error is present. The bar needed no restatement |
| Freight, energy, labour and raw material as cost lines; commodity sensitivity; maintenance/growth capex split; cash interest FY2025 and LTM; 30-Jun-2025 balance sheet; segment backlog; volume/price split; prior-TTM CFO; FY2025 audited segment note; Maverick funding split; down-volume decremental rate | **Unavailable** | — | — | [`03_margin-drivers` output, §11]; [`06_earnings-quality` output, §1]; [`07_earnings-sensitivity` output, §9] | Twelve genuinely absent inputs. Each is disclosed by the owning agent rather than estimated. None is a language gap |

### 2.2 Historical Trend

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| One quarter carries most of the improvement | **Triggered** | Medium | **High** | Q2 FY26 is the highest of the eight quarters in the pool on adjusted EBITDA margin (23.0%) and adjusted ROS (21.9%), and the largest surprise in the eight-year quarterly history in the vendor tab (+25.0% adjusted EPS) [`01_historical-financials` output, §3; `04_guidance-consensus` output, §6] | The setup's strength is concentrated in a single, exceptional, peak-of-cycle quarter. Any run-rate extrapolation from Q2 FY26 inherits that concentration |
| Capital IQ's EBIT series reclassifies pension income and restructuring, distorting the FY2023 margin step-up | **Triggered** | Low | Medium | Reported operating income 376.2 / 309.0 / 462.7 / 527.1 / 616.8 against the vendor's 376.2 / 370.9 / 448.3 / 529.6 / 632.7; the whole difference ties to two reclassifications [`01_historical-financials` output, §1 reconciliation] | A reader on the vendor basis sees FY2022→FY2023 EBIT margin +63bps; the filing basis shows +387bps. The FY2023 step-up is real but materially smaller than the filing row alone implies. A base-rate trap for anyone drawing a margin history through FY2023 |
| Gross-margin and EBITDA-margin series point opposite ways | **Triggered** | **High** | **High** | See red flag in 2.4 — moved there to avoid double-counting. Adjudicated at [`03_margin-drivers` output, §3] | Recorded once, in 2.4 |
| Revenue growth slowing while the setup claims acceleration | **Not Triggered** | — | — | Quarterly YoY growth +34.8%, +41.8%, +53.5%, +52.8%; TTM +46.2% [`01_historical-financials` output, §3 and §6] | Delivered revenue genuinely is accelerating. The turn is in orders, not sales — that is a separate flag in 2.3, not a contradiction here |
| TTM trend contradicts annual trend | **Not Triggered** | — | — | FY2025 +29.5% then TTM +46.2%, same direction [`01_historical-financials` output, §1 and §2] | Consistent |
| Seasonality ignored | **Not Triggered** | — | — | `01` §5 states "Insufficient quarterly history for seasonality analysis" and forbids any downstream phasing assumption; `05` §6 complies explicitly | Handled correctly. The one usable year is confounded by a mid-year acquisition |
| FY2021 basis break treated as a real decline | **Not Triggered** | — | — | `01` §1 marks the FY2022 "decline" NM and footnotes the pre-divestiture basis on every affected cell | Handled correctly |

### 2.3 Revenue

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| **The leading demand indicator has turned while the module's verdict horizon is 3–12 months** | **Triggered** | **Critical** | Medium | Organic orders ~40% (Q1 FY26) → "low double digits" (Q2 FY26) against 46.9% organic sales; backlog **grew** "low-double digits sequentially to $2.6 billion" in Q1 and **fell** to $2.5bn in Q2; implied Q2 book-to-bill ~0.93x (range 0.86–1.00x) from ~1.2x [`Q1 FY26 transcript, prepared remarks, 1-May-2026`; `Q2 FY26 transcript, prepared remarks, 31-Jul-2026`; `02_revenue-drivers` output, §4 and §6a] | This is the flag most likely to change the module's verdict category. The sequential *direction* reversed, which is not a rounding artefact even where the single-quarter magnitude sits inside the transcripts' $0.1bn rounding. Probability is Medium, not High, because the entire series is two rounded management figures about a business whose orders management calls "large and lumpy" |
| Revenue concentration — one vertical, one segment, one region | **Triggered** | **High** | **High** | Infrastructure $882.5m vs $409.3m = 49.1pp of the 52.8pp total growth (**93.1% of every incremental dollar**) and 60.0% of quarterly sales, from 42.5%; Americas produced 94.3% of growth; Systems Protection 86.6% [`Q2 FY26 10-Q, Note 2 (Revenue), p.8–9`; `MD&A, p.29`; `02_revenue-drivers` output, §3 and §6a] | The marginal dollar is a near-pure bet on one end market that nVent does not control. The business-model module reaches the same read independently [`business-model/10_external-dependency` output, §3] |
| Customer concentration untested since FY2024 | **Triggered** | **High** | **Unknown** | "No customer accounted for more than 10% of net sales in 2024, 2023 or 2022" [`FY24 10-K, Note 15, p.70`]. **No equivalent statement for FY2025 or FY2026 exists anywhere in the pool — absence re-confirmed against the frozen corpus by this agent** | Systems Protection roughly doubled and infrastructure went from 42.5% to 60.0% of sales in one year. Whether that created a single large customer is **Not proven from available data**, and the disclosure gap sits precisely over the period of change |
| Q2 sales were partly a deliberate backlog drain — pull-forward from H2 | **Triggered** | **High** | Medium | "we worked hard in Q2 to really execute on that backlog because we know it's important to have good lead times" [`Q2 FY26 transcript, Q&A, 31-Jul-2026`] | Management's own explanation for the falling backlog is also an admission that part of Q2's 46.9% organic growth was H2 revenue delivered early. That makes the Q3 and Q4 comparison harder, not easier, and it is the mechanism behind the flag above |
| Qualifier drop — "93.1% from AI data centres" | **Triggered** | Medium | **High** | The 93.1% is the **infrastructure vertical**, which contains power utilities as well as data centres [`Q2 FY26 10-Q, Note 2, p.9`]. Data-centre sales are sized only in a transcript — ">$2 billion in 2026, more than double last year's" [`Q2 FY26 transcript, prepared remarks`] — with no filed equivalent [`02_revenue-drivers` output, §1 and §6] | `02` carries the qualifier correctly; `05` §2 and `07` §4 carry it more loosely. Under CLAUDE.md §3 the qualifier must travel: 93.1% is *infrastructure*, and the data-centre-only figure is a management number no filing corroborates |
| Acquisition contribution ends and currency turns negative in H2 | **Triggered** | Medium | **High** | Electrical Products Group added 17.0pp (Q1) then 5.4pp (Q2) and anniversaried 1-May-2026; implied H2 non-organic contribution is **−$15.9m** [`Q2 FY26 10-Q, MD&A, p.27`; `02_revenue-drivers` output, §4a] | Everything from Q3 must be earned organically. The Q4 consensus gap therefore has no acquisition or currency help behind it |
| Volume-versus-price split not separable | **Triggered** | Low | **High** | No filing, deck or transcript sizes price; the ≤5.2pp bound assumes productivity contributed nothing, which the 10-Q says it did [`02_revenue-drivers` output, §6a; `Q2 FY26 10-Q, MD&A, p.28`] | Volume is the overwhelming majority of the organic block but its exact share is not proven. Correctly labelled a bound, not an estimate |
| Acquired or currency revenue described as organic demand | **Not Triggered** | — | — | `02` §3 states 5.9pp of the 52.8pp was not underlying demand and decomposes to a 0.01pp residual; both segments' acquisition dollars tie to the group ($45.2m + $6.4m = $51.6m) | Handled correctly and carried correctly by `03`, `05` and `07` |
| Channel inventory / stuffing risk | **Not Triggered** | — | — | Inventory days fell 82.5 → 62.6; finished goods actually fell (227.2 → 222.5) while raw materials rose 18.7% [`06_earnings-quality` output, §3, from `Q2 FY26 10-Q, Note 8`] | The opposite shape to a demand stall |
| Market growth mistaken for share gain | **Not Triggered** | — | — | `02` §3 deliberately keeps management's "new products contributed over 30 points" out of the bridge because its base is undefined and it double-counts against the vertical attribution | Correctly excluded rather than absorbed |
| Named policy or subsidy tailwind inside revenue | **Not Triggered** | — | — | No IRA, CHIPS or IIJA reference appears anywhere in the frozen corpus; the $25.8m IEEPA item is a gross-profit credit and does not touch net sales [`02_revenue-drivers` output, §4a; `Q2 FY26 10-Q, Note 13, p.19 and p.21`] | Correctly separated |

### 2.4 Margins

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| Reported gross margin is flattered by a one-off; the like-for-like read is 3.5x worse | **Triggered** | **High** | **High** | Reported −67.9bps (10-Q: "(0.7) pts"); ex the $25.8m IEEPA reimbursement worth **+175.4bps**, the run-rate change is **−243bps** [`Q2 FY26 10-Q, Note 13, p.21` and `MD&A, p.26–27`; `03_margin-drivers` output, §3 and §7a] | **This is the like-for-like read** — Q2 FY25 contained no comparable credit. Anyone building a terminal margin, a bear case or a leverage denominator off 37.93% is using a number the company itself excludes from its own adjusted profit. `01`'s −70bps must never travel without the one-off label |
| The entire operating-margin gain is overhead absorption, not manufacturing economics | **Triggered** | **High** | **High** | +416.7bps decomposes with no residual: gross −67.9, SG&A +452.8, R&D +31.8. **SG&A alone is 109% of the move**; ex-amortisation it still falls 359bps [`Q2 FY26 10-Q, MD&A, p.26 and p.28`; `03_margin-drivers` output, §8] | Operating leverage is symmetric and the fixed base is being deliberately enlarged — three Minnesota plants committed, capex guided ~$130m (+40%), D&A ~$230m. The margin verdict does not survive a volume stall, and the pool contains no organic decline against which to measure the decremental |
| Most of the gross-margin move is unattributed to any driver | **Triggered** | Medium | **High** | Explained **+141.7bps** (segment mix −56.1, IEEPA +175.4, unallocated COGS +22.4) against a residual of **−209.6bps** [`03_margin-drivers` output, §7 and §7a, `RF-EARN-002`] | Roughly three times as much of the move is unexplained as explained. No downstream claim of the form "input costs drove the gross-margin decline" can be supported at the gross line from this pool. `03` says so plainly and does not name its biggest driver off this bridge |
| Segment mix is a mechanical, recurring drag, and the pending deal deepens it | **Triggered** | Medium | **High** | Systems Protection 60.7% of revenue (FY2024, audited) → 72.5% (H1 FY26), at a gross margin ~9pp below Electrical Connections; cost 56.1bps of group gross margin in Q2 on a 7.25pp weight shift [`FY24 10-K, Note 15, p.70`; `Q2 FY26 10-Q, Note 13, p.20`; `03_margin-drivers` output, §7a] | Maverick Power is a power-distribution business for data centres and most likely lands in the same segment (*segment placement is inference, not from filings*), pushing mix the same way. This drag has nothing to do with cost inflation and does not reverse with it |
| Pass-through is guided, not proven, and the prior cycle gave the price back | **Triggered** | Medium | Medium | Realised offset 40% (Q1 FY26) → 79% (Q2 FY26), 58% for H1; management guides full offset for Q3. Precedent: group price +5.5% in 2023 (with +4.2 and +4.0 points of segment margin attributed to price alone), then **−0.2% in 2024** when cost pressure eased [`FY24 10-K, Item 7, components of change, p.24–28`; `03_margin-drivers` output, §3] | The third point in the recovery series is a management assertion about an unreported quarter, not a measurement. Price at nVent is cost-linked and handed back, so the bull side of the cost rows is weaker than the bear side |
| D&A ratio falls only while growth holds | **Triggered** | Medium | Medium | FY2026 D&A guided ~$230m against ~$5,372m of guided sales = 4.28% versus 5.34% in FY2025 — a 106bps fall in the ratio while the dollars rise 11% [`CIQ Estimates→Guidance`, D&A FY2026; `03_margin-drivers` output, §5 and §9] | A tailwind by dilution that becomes a headwind the moment revenue growth stops, on a fixed base being enlarged into 2027 |
| SG&A cuts appear temporary / cost-out that will reverse | **Not Triggered** | — | — | The SG&A ratio fell on volume, not on a cost programme: ex-amortisation 16.62% → 13.03% while dollars *rose* [`Q2 FY26 10-Q, MD&A, p.26 and p.28`] | It is volume leverage, correctly identified. That is a different risk (symmetry, above), not a fake cut |
| EBITDA improving while EBIT or EPS worsens | **Not Triggered** | — | — | Q2 FY26: EBIT margin +417bps, adjusted EPS +68.6%, adjusted EBITDA margin +72bps — all the same direction [`01_historical-financials` output, §3; `03_margin-drivers` output, §3] | No divergence at this level |
| Utilisation risk hidden in a fixed-cost business | **Unclear** | Medium | Unknown | Capacity investment is named as a distinct gross-margin drag in both FY26 quarters and both segments, but **no capacity or utilisation figure is disclosed anywhere in the pool**, and management gave none when asked directly [`Q2 FY26 10-Q, MD&A, p.27, p.29, p.30`; `Q2 FY26 transcript, Q&A`; `business-model/12_red-flags-sweep` output, §2] | The cost of a wrong cycle call cannot be sized. Recorded Unclear because the drag is disclosed qualitatively but never quantified |
| Freight and energy cost exposure | **Unavailable** | — | — | Not disclosed as line items or as shares of COGS anywhere [`03_margin-drivers` output, §2 and §11] | Sits inside the input-cost row; cannot be assessed separately |

### 2.5 Guidance / Consensus

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| The Q4 gap is where the year's miss risk sits | **Triggered** | **High** | **High** | Guidance-implied Q4 revenue $1,252.09m against Street $1,318.67m = **+5.32%**, roughly four times the +1.43% stretch in Q3 [`04_guidance-consensus` output, §3; `CIQ Estimates→Consensus`, FQ4 2026] | The guidance-implied Q4 is a −11.0% sequential decline from the Q3 guide. Whether that is prudence or a real step-down is the single unresolved question in the setup, and it must be earned with no acquisition and no currency help |
| Revision breadth is 100% one-sided — no bear cohort left | **Triggered** | **High** | **High** | Zero downward revisions on revenue, EBITDA or adjusted EPS for FY2026, FY2027 or FQ3 2026 across three months; 15 Buy of 18 opinions; recommendation 1.24 [`CIQ Estimates→Revisions`; `CIQ Estimates→Consensus`; `04_guidance-consensus` output, §5] | This is a positioning risk, not a comfort. A Q3 print inside the guided range would meet management's own guide and still disappoint against how the panel is positioned |
| Maverick Power is outside FY2026 guidance and outside every estimate in the pool | **Triggered** | **High** | **High** | Guidance exclusion proved arithmetically — the FY26 guide implies only −$15.9m of H2 non-organic revenue [`02_revenue-drivers` output, §4a]; estimate cut-off 7-Aug-2026 predates the 24-Aug-2026 release [`04_guidance-consensus` output, §7] | A ~$700m-revenue business is expected to close inside the guided Q4. The FY2026 bar contains it in neither direction, so the Q4 consensus-versus-guidance gap is being measured against an incomplete base |
| Consensus sits above the guidance **high end** on five lines | **Triggered** | Medium | **High** | Q3 revenue +0.31%, Q3 adjusted EPS +0.72%, FY revenue +0.44%, FY adjusted EPS +0.26%, and GAAP EPS above the high end on both periods [`04_guidance-consensus` output, §3] | On GAAP EPS the guided range cannot reach the bar at its top: any print inside the guided $1.18–$1.21 is a consensus miss on that line |
| Revisions are catch-up to the guidance raise, not independent upgrades | **Triggered** | Medium | **High** | FY2026 adjusted EPS moved 4.58 → 4.59 → 4.61 over two months, then 4.61 → 5.11 (+10.8%) in the final month, after the 31-Jul-2026 raise [`CIQ Estimates→Trends`; `04_guidance-consensus` output, §4] | The revision momentum is a mechanical restatement of management's own guide. It is not independent confirmation and must not be read as one |
| **The Q4 adjusted-EPS gap is understated by a mixed basis** | **Triggered** | Medium | **High** | `05` derives Q4 EPS from the FY line ($5.11301 − $2.54 − $1.3899 = $1.183, +3.3% above the guide-implied $1.145) while taking Q4 *revenue* from the vendor's own FQ4 line. **The vendor's own FQ4 2026 EPS Normalized figure is $1.21859** [`CIQ Estimates→Consensus`, quarterly EPS Normalized row, column FQ4 2026 — read directly from the frozen extract by this agent; the same row's actuals tie exactly to 1.09 (Q1'26) and 1.45 (Q2'26)] | On a consistent vendor-quarterly basis the Q4 EPS stretch is **$1.21859 vs $1.145 = +6.4%**, not +3.3% — roughly double, and much closer to the +5.32% revenue gap it should resemble. `05` §4 correctly flags the FY-versus-quarterly panel gap on revenue but then applies the two bases inconsistently across the two metrics (CLAUDE.md §15 matched-basis). **New finding — no upstream agent carries it** |
| Analyst count too low | **Not Triggered** | — | — | FQ3 2026: 14/14 on adjusted EPS and revenue; FY2026: 16/16 adjusted EPS, 16 of 17 revenue; 15 target prices [`CIQ Estimates→Consensus`] | Panel depth is adequate |
| Management guidance vague | **Not Triggered** | — | — | Ranges given for FY and Q3 reported and organic sales, adjusted EPS and GAAP EPS, plus point guides for capex (~$130m), interest (~−$65m), D&A (~$230m), tariff cost (~$100m) and FCF conversion (90–95%) [`04_guidance-consensus` output, §2] | Guidance is specific and independently recorded by the vendor with a matching 2026-07-31 date |
| Company beat the quarter but guided down | **Not Triggered** | — | — | The FY2026 adjusted-EPS range was **raised** from $4.45–$4.55 to $5.00–$5.10 alongside the Q2 beat [`Q2 FY26 transcript, prepared remarks`] | The guide-down risk is prospective (Q4 shape), not realised |
| EPS beat driven by tax, buybacks, currency or one-offs | **Not Triggered** | — | — | **Checked directly against the filing by this agent.** Effective tax rate 22.4% for the six months ended 30-Jun-2026 *and* 30-Jun-2025 — identical [`Q2 FY26 10-Q, income-tax note`]. Diluted shares **164.1m in Q2 FY26 versus 163.6m in Q2 FY25 — up 0.3%**, so buybacks *subtracted* from per-share growth in the quarter; H1 repurchases were $50.4m against $253.1m a year earlier [`Q2 FY26 10-Q, Note 4 (EPS), p.9` and `Note on share repurchases, p.~26`]. Currency added 0.5pp of revenue; net interest was flat at $17.4m vs $17.6m [`Q2 FY26 10-Q, MD&A, p.27` and `statements of income, p.3`] | A genuinely clean result: the +68.6% adjusted-EPS growth is operational, not financial engineering. The buyback pace slowing to a fifth of the prior year is consistent with cash being held for Maverick |

### 2.6 Beat / Miss Setup

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| The "Setup favors beat" verdict is a one-quarter read inside a 3–12 month module | **Triggered** | **High** | **High** | `05` §8 verdict applies to "the standalone Q3 FY2026 print"; the module's own scope is "the next 3–12 months" [MODULE_RULES, Scope]; `05` §9 separately calls Q4 "a wider distribution in both directions… not resolvable from this pool" | The most likely misreading in the whole module: a correct one-quarter conclusion travelling upward as if it were the 3–12 month answer. `05` is careful in its own text; the verdict header is not self-limiting |
| The setup needs a fourth guidance raise, not just a beat | **Triggered** | **High** | **High** | A pass-through of a Q3 beat adds roughly $0.10–0.15 to the FY midpoint, landing at ~$5.11 — merely matching consensus of $5.11301. Clearing the Q4 gap needs a raise above ~$5.20 [`05_beat-miss-setup` output, §4 and §5] | A Q3 beat delivered with a mechanical pass-through leaves the +5.32% revenue and +6.4% EPS Q4 gaps intact. The quarter can be right and the year still wrong |
| The adjusted-EPS bar needs incrementals above both the guide and the last print | **Triggered** | Medium | Medium | Consensus needs ~26% incrementals; management guides "mid-20s" for H2 and Q2 actually delivered **24.1%** ((322.7−200.0)/(1,471.3−963.1)) [`05_beat-miss-setup` output, §2 scenario B2; `Q2 FY26 transcript, Q&A`] | The revenue side of the Q3 bar is undemanding; the margin side is not. A revenue beat with in-line incrementals produces a smaller EPS beat than the two-quarter pattern implies |
| The beat base rate is judgment, not a measured frequency | **Triggered** | Medium | **High** | Eight-quarter surprise history spans a divestiture basis change; the directly relevant record — actual versus the company's own guidance high end, +17.2% and +26.1% — is **two observations**, both inside one demand upswing [`04_guidance-consensus` output, §6; `05_beat-miss-setup` output, §7] | CLAUDE.md §10 requires the basis to be stated. `05` states it correctly and weights it "enough to break a tie, not enough to carry a thesis" — that qualifier must travel |
| Seasonality cannot help or hurt | **Triggered** | Low | **High** | One complete consistent-basis fiscal year, confounded by a mid-year acquisition [`01_historical-financials` output, §5; `05_beat-miss-setup` output, §6] | No phasing assumption is available in either direction, so the Q2→Q3 shape cross-check is one observation and is labelled as such |
| Beat case requires more things to go right than the miss case requires to go wrong | **Not Triggered** | — | — | B1 needs only that revenue not fall 3.0% sequentially; M1 needs only that Q2 shipments came from draining the book. Both are single-condition [`05_beat-miss-setup` output, §2 and §3] | Roughly symmetric construction. No conjunction artefact of the kind CLAUDE.md §10 warns about |
| Material-beat threshold set too high to fail | **Not Triggered** | — | — | Each threshold is failure-tested against the last two to four reported periods: the +5% revenue and +7.9% EPS triggers would have failed in Q3 FY25 [`05_beat-miss-setup` output, §4] | CLAUDE.md §17 satisfied — the triggers can fail |
| Beat/miss call unreliable for want of consensus | **Not Triggered** | — | — | Consensus present with 14–17 contributors per line; the "no consensus → cap at Unclear" rule does not bind [`00_earnings-data-triage` output, §5] | No cap applies |

### 2.7 Earnings Quality / Accounting

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| Adjusted EPS runs far above GAAP and the add-back is recurring acquisition amortisation (§24 Filter 4) | **Triggered** | **High** | **High** | FY2025 adjusted diluted EPS $3.35 is **28.8% above** GAAP continuing EPS of $2.60; **$147.1m of the $169.0m operating add-back — 87% — is acquisition intangible amortisation**, rising every year (50.3 / 69.5 / 94.7 / 147.1, and $165.2m LTM) on $2.77bn of deals in three years [`Q1 FY26 presentation, 1-May-2026, slide 16`; `06_earnings-quality` output, §7 and §10] | The headline profit line leaves out the recurring cost of the engine driving the growth. The business-model module applied a §24 Filter 4 cap on the same evidence [`business-model/11_capital-allocation-governance` output] and emitted `RF-RFS-001` [`business-model/12_red-flags-sweep` output, §3] |
| **The Maverick accretion claim is made on the one measure that excludes the amortisation the deal creates** | **Triggered** | **High** | **High** | "nVent expects the acquisition to be accretive to **adjusted** earnings per share in the first year following completion" [`nVent press release, "nVent to Acquire Maverick Power", 24-Aug-2026` — read directly from the frozen extract by this agent]. nVent's own definition of adjusted operating income excludes intangible amortisation and acquisition-related expense [`Q1 FY26 presentation, slide 16`; `Q2 FY26 10-Q, Note 13, p.19–20`] | The claim is close to circular: a $1.75bn deal will write a large slug of customer relationships and technology onto the balance sheet (EPG alone put on $433.8m amortised over 8–20 years), and the resulting charge is excluded from the very measure the accretion is asserted on. It is company language about an uncompleted deal, not an audited number. **New finding — no upstream agent names the circularity** |
| The excluding measure is also the one used to set incentive-compensation targets | **Triggered** | **High** | **High** | Reportable segment income is "exclusive of intangible amortization, acquisition related costs, costs of restructuring activities… impairments" and the chief operating decision maker uses it for "setting incentive compensation targets" [`Q2 FY26 10-Q, Note 13, p.19–20`; identical at `FY24 10-K, Note 15, p.69`]. H1 FY26: $100.6m excluded = 15.6% of $644.9m reportable segment income [`business-model/12_red-flags-sweep` output, §2 and §3] | Cross-module input the earnings module did not have when `06` scored 74/100. It converts the amortisation wedge from a presentation choice into an incentive design, and it means rising *segment* income is not independent confirmation that the acquisition programme is working |
| Four "one-off" adjustment categories recur every single year | **Triggered** | Medium | **High** | Intangible amortisation, acquisition transaction and integration costs (0.8 / 12.8 / 13.9 / 14.4 / 7.5), restructuring and other (11.2 / 3.9 / 7.5 / 7.5 / 10.9), and the Q4 pension remeasurement, all present in every year on record [`06_earnings-quality` output, §5 and §8] | Individually small; collectively they mean the "adjusted" label is doing structural work, not one-off work |
| **A deferred-tax recognition judgment failed within twelve months, and `06` records only half of it** | **Triggered** | Medium | Medium | FY2023 carried "$93.2 million of non-cash benefit… for the recognition of deferred tax assets related to tax-deductible statutory losses in Luxembourg". FY2024 then recorded "**$92.8 million of non-cash expense… related to the establishment of valuation allowances on deferred tax assets related to tax-deductible statutory losses in Luxembourg initially established in 2023**" [`FY24 10-K, Item 7 MD&A — Provision (benefit) for income taxes` — read directly from the frozen extract by this agent]. `06` §5 names the FY2023 tax credit and the $174.0m deferred foreign tax benefit but **not** the reversal | 99.6% of a $93.2m "more likely than not" benefit was written off one year after it was taken, having flattered FY2023 pre-tax income by 24.8%. `06` treats the FY2023 tax item as "genuine but very large"; the reversal makes it a failed judgment, which is a stronger accounting-quality signal. `business-model/12` caught it; the earnings module did not. Effect on the *current* setup is limited (FY2025 22.1%, H1 FY26 22.4% are normal rates) — the damage is to any multi-year EPS or return series drawn through FY2023 |
| FY2025 free cash flow overstates group cash generation | **Triggered** | Medium | **High** | Continuing-operations FCF of $555.7m excludes $183.8m of operating cash that left through discontinued operations as disposal tax; on a total-company basis FY2025 FCF was **$371.9m, below FY2024's $569.1m** [`06_earnings-quality` output, §1 and §10; `Capital IQ Financials→Cash Flow`, vendor as of ~12-Aug-2026] | Anyone quoting $555.7m as FY2025 cash generation is quoting a figure the group's bank balance did not see. The lead normalised figure is ~$634.1m LTM, not $659.9m |
| Working capital absorption and a demanding cash-conversion target | **Triggered** | Medium | Medium | Working capital consumed **$218.4m** in H1 FY26 versus $153.2m in H1 FY25, receivables alone $280.2m of it; the 90–95% conversion guide needs ~$545m of H2 FCF against $442.5m in H2 FY25, a ~23% increase [`Q2 FY26 10-Q, statements of cash flows, p.5`; `06_earnings-quality` output, §2 and §3] | Required cash growth is below guided revenue growth, so the target is demanding rather than broken — but a revenue beat makes it harder, not easier |
| LTM FCF contains a one-off tariff refund | **Triggered** | Low | **High** | ~$25.8m of IEEPA reimbursement inside LTM FCF; recurring figure ~$634.1m against a reported $659.9m [`06_earnings-quality` output, §1] | Small, correctly normalised, and must not be double-counted against the same $25.8m already removed from the gross margin |
| Deferred revenue declining while revenue grows | **Triggered** | Low | **High** | Contract liabilities fell $176.8m → $159.9m (−9.6%) in the six months to 30-Jun-2026 while revenue rose 53.1%; net contract assets swung −$16.0m → +$8.6m [`Q2 FY26 10-Q, Note 2 (Contract balances), p.9`] | The one triggered accrual row in `06` §6, and the mildest. The filing explains it as milestone-invoicing timing, and backlog moved the other way. Customers are funding less of the project book while nVent funds more — a cash-timing observation, not an accounting objection |
| Stock-based compensation excluded from adjusted earnings | **Not Triggered** | — | — | SBC of $37.5m (FY2025) and $23.1m (H1 FY26) stays inside adjusted operating income [`06_earnings-quality` output, §4 and §8] | A genuinely more conservative non-GAAP definition than most US industrials use, and it partly offsets the amortisation wedge above |
| Receivable factoring / supplier finance | **Not Triggered** | — | — | No factoring, securitisation, reverse-factoring or supplier-finance programme appears in the FY24 10-K or either 10-Q; US GAAP requires such programmes to be disclosed [`06_earnings-quality` output, §8] | Silence here is reasonable evidence of absence |
| Capitalised costs rising as a share of revenue | **Not Triggered** | — | — | No capitalised software or development line; contract assets +4.8% against revenue +53%, falling from 4.1% to 3.5% of revenue [`Q2 FY26 10-Q, Note 2, p.9`] | Moving the right way |
| Change in accounting policy or useful lives | **Not Triggered** | — | — | Inventory stays FIFO; useful lives unchanged at 5–20 / 5–50 / 3–15 years; the only presentation changes are a vertical recategorisation the filing states had no impact on results, and the segment renaming [`06_earnings-quality` output, §6 and §8] | No policy-change signature |
| Adjusted earnings run one-way | **Not Triggered** | — | — | nVent *removed* a $25.8m GAAP benefit from its Q2 adjusted numbers, publishing H1 FY26 adjusted EBITDA of $605.4m **below** GAAP-derived EBITDA of $612.8m [`Q2 FY26 10-Q, Note 13, p.21`] | A real mark in the company's favour, and it is why the direction of the usual "beat on one-offs" flag is reversed here |
| Cash interest paid, FY2025 and LTM | **Unavailable** | — | — | Not disclosed for FY2025 or the LTM; the vendor repeats the FY2025 figure in the LTM column, which cannot be right, and `06` treats it as Not disclosed rather than using it [`06_earnings-quality` output, §1] | The EBITDA→CFO bridge carries a named residual rather than a false plug |

### 2.8 Sensitivity / External Variables

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| Earnings are dominated by one external variable the company does not control | **Triggered** | **High** | **High** | A ±20% move in the >$2.0bn of guided data-centre sales is ±$400m of revenue → ±$100m of adjusted operating income → **±$0.473 of adjusted EPS, ±9.4% of the $5.05 base** — larger than variables 3 to 7 combined ($0.239) [`07_earnings-sensitivity` output, §3 and §4] | The single biggest lever is external. `business-model/10_external-dependency` independently calls the marginal dollar "close to a pure bet on AI data-centre capital spending". CLAUDE.md §14 implications are in 2.10 |
| The bear-case variable is already moving the wrong way | **Triggered** | **High** | **High** | The disconfirming series is the order book, and it has turned [see 2.3 flag 1]; `07` §4 names it rather than averaging it away | The adverse case does not need a demand announcement — it needs backlog to run out faster than it is replaced while newly built capacity ramps |
| Down-volume decremental is not measurable; the bear case is a floor, not a central estimate | **Triggered** | **High** | **High** | The 25% incremental rate was measured on *rising* volume; the pool contains **no organic-revenue decline since the divestiture**, so the true decremental rate is not measurable from available data [`07_earnings-sensitivity` output, §2 row 1 and §6] | The published bear case understates a genuine downside. Correctly labelled a bound — that label must travel, or the downside will read as symmetric when it is not |
| **Maverick's earnings effect recorded as "not quantifiable" when the release discloses a valuation multiple** | **Triggered** | **High** | **High** | `07` §2 row 5 states the EPS impact is "not quantifiable" because "Maverick's own margin is not disclosed". **The release does disclose it indirectly:** "The effective enterprise value multiple based on the $1.75 billion purchase price is approximately **11.5 times anticipated 2026 adjusted EBITDA**", and ~10.5x adjusted for the present value of expected tax benefits [`nVent press release, 24-Aug-2026` — read directly from the frozen extract by this agent] | $1,750m ÷ 11.5 implies roughly **$152m of anticipated 2026 adjusted EBITDA** on ~$700m of estimated 2026 revenue — an implied margin of about **21.7%**, close to nVent's own 21–23% (*derived from the release's own disclosed multiple — inference, not a company-stated margin*). This is a bad-extraction gap (CLAUDE.md §20): a partial sizing IS available and was not used. It does not make full EPS accretion computable — the funding split and the deal's own amortisation remain undisclosed — but "margin not disclosed" is not correct as written. **New finding** |
| The two largest variables are multiplicative, not additive | **Triggered** | Medium | **High** | Bear-on-bear compound is −$0.79, not the −$0.82 that adding the rows gives; and Maverick moves three rows the same way (contribution, segment mix, interest) [`07_earnings-sensitivity` output, §5] | Any downstream use that adds the sensitivity rows overstates the range by ~4% and, more importantly, misses that the same event drives several of them |
| No commodity hedging and no published commodity sensitivity | **Triggered** | Medium | **High** | Item 7A covers currency and interest rates only; no commodity derivative is disclosed anywhere in the pool [`FY24 10-K, Item 7A`; `07_earnings-sensitivity` output, §1 and §9] | Metal prices move straight into COGS on the input the company names first among its inflation drivers. Note the qualifier: unhedged is a fact about derivatives, not a measurement of realised recovery — the measurement is the 58% offset |
| Tariff cost is large, government-set and moving fast | **Triggered** | Medium | **High** | ~$100m guided for FY2026, raised from ~$80m in a single quarter, on top of ~$90m in FY2025 — roughly $190m all-in ≈ **3.5% of guided sales** [`Q2 FY26 transcript, prepared remarks`; `business-model/10_external-dependency` output] | A 25% revision to a policy-driven cost line inside one quarter, offset by a lever (price plus productivity) disclosed only as a combined number |
| Interest expense steps up after Q4, by ~9x the current-book sensitivity | **Triggered** | Medium | **High** | $200.0m of $1,500.0m debt floats today (13%), so ±100bp is only ~$2.0m; the Maverick pro-forma bound is ±$0.083 of EPS. Funding is "a combination of available cash on hand and new debt", with **committed bridge financing from Bank of America** [`Q2 FY26 10-Q, fair-value note`; `nVent press release, 24-Aug-2026`] | Cash was $256.0m at 30-Jun-2026, so most of the $1.75bn must be borrowed. This is a dated near-term change, not a hypothetical, and it lands inside the module's own 3–12 month window |
| The only disclosed sensitivities are FY2024 and touch no top-three variable | **Triggered** | Medium | **High** | Item 7A interest-rate (±$8.7m on ±100bp, measured on a 60/40 book at 31-Dec-2024) and currency (±$13.6m to equity, not earnings) [`FY24 10-K, Item 7A`; `07_earnings-sensitivity` output, §1] | The MODULE_RULES "only inferred sensitivities → confidence must be Low" cap does not formally bind, but the dominant variable's move size *is* inferred. `07` reflects that row by row rather than papering over it |
| Non-linear covenant cliff | **Not Triggered** | — | — | Strict net debt $1,236.4m = 1.16x TTM adjusted EBITDA against the company's own 2.0–2.5x target; even the Maverick price added gross leaves leverage inside the range [`Q2 FY26 10-Q, Note 10 (Debt)` and `balance sheet, p.4`; `07_earnings-sensitivity` output, §6] | No covenant threshold effect is in play in this pool |
| FX as a compounding factor | **Not Triggered** | — | — | ~81% of FY2025 revenue is Americas; currency added 0.5pp to Q2 revenue growth; the only disclosed FX sensitivity hits accumulated other comprehensive loss, i.e. equity, not earnings [`FY24 10-K, Item 7A`; `Q2 FY26 10-Q, MD&A, p.26`] | Correctly excluded rather than padded in |
| Customer-concentration cliff | **Unavailable** | — | — | No customer statement after FY2024 [see 2.3] | Cannot be assessed either way. `07` §6 records it as Not proven from available data |

### 2.9 Source Conflicts

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| Three receivable-day series in circulation, and two modules disagree on whether the flag clears | **Unclear** | Medium | **High** | `06` matched basis (annualised latest-quarter revenue): 57.4 → 59.3 → **60.1** days, flag dissolves. `06` LTM basis: FY2025 65.0 → **73.2**. `business-model/11`: **61.6 → 76.1**, scored severity 40 [`06_earnings-quality` output, §3; `business-model/11_capital-allocation-governance` output, §1] | `06`'s method is the §15-correct one for a company that acquired $97.7m of receivables mid-period. But `06` caps its own confidence for want of a 30-Jun-2025 balance sheet, so the flag is *reduced*, not *cleared*, and the synthesis must not let a "no concern" read travel unqualified against a sibling module's severity-40 finding |
| Earnings quality 74/100 versus the business-model module's read of the same amortisation evidence | **Unclear** | Medium | **High** | `06` scores 74/100 and calls the wedge "a presentation risk rather than a cash risk"; `business-model/12` emits `RF-RFS-001` (severity 52) and `11` applies a §24 Filter 4 cap (capital allocation 50) on the same facts [`06_earnings-quality` output, §9 and §10; `business-model/12_red-flags-sweep` output, §3] | Not a conflict of fact — a conflict of calibration. `06` was right that the cash is real and did not have the incentive-compensation mechanism in front of it. 74/100 should not travel as if the wedge had been tested and cleared |
| Three EBITDA figures for the same quarter and three for the same LTM | **Triggered** | Medium | **High** | Q2 FY26: GAAP-derived **$359.2m**, company adjusted **$340.1m**, vendor adjusted **$338.1m** (the vendor does not add back $2.0m of restructuring). LTM: `06` $1,058.4m, `01` adjusted $1,061.5m, `ciq_facts.json` $1,074.6m [`01_historical-financials` output, §3; `03_margin-drivers` output, §3; `06_earnings-quality` output, §1; `ciq_facts.json`] | Every gap is itemised and reconciles, and no agent mixes them internally. The risk is downstream: a synthesis or valuation layer picking one figure without its basis label produces a leverage ratio or margin that cannot be rebuilt |
| Vendor FY consensus does not equal the sum of its own quarters | **Triggered** | Low | **High** | FY2026 revenue consensus $5,435.31m against $5,459.24m summed across the four quarters — a $23.9m / 0.44% gap, because the FY panel (16 of 17) and the quarterly panels (14) are different analyst sets [`04_guidance-consensus` output, §3; `CIQ Estimates→Consensus`] | Disclosed by `04` and correctly used consistently there. It becomes a real defect only where the two bases are mixed across metrics — which is exactly what happened on the Q4 EPS figure (see 2.5) |
| Filings contradict the investor deck, or management commentary contradicts the reported numbers | **Not Triggered** | — | — | Guidance recorded on the call is independently recorded by the vendor with a matching 2026-07-31 guidance date; segment growth checks tie exactly (organic 62.0 + acquisition 7.2 + currency 0.4 = 69.6, and $45.2m + $6.4m = $51.6m) [`04_guidance-consensus` output, §2; `02_revenue-drivers` output, §5] | Numbers cross-check cleanly between call, filing and vendor |
| Net-debt figures disagree between the module and the vendor sidecar | **Not Triggered** | — | — | $1,236.4m strict versus $1,376.9m broad; the $140.5m gap is exactly the lease liabilities, reconciled to the cent [`01_historical-financials` output, §1 basis note; `ciq_facts.json`] | A definitional difference, labelled on both sides. No vendor figure is overridden |

### 2.10 Narrative / Framing

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| "Earnings accelerating" is not what the assembled evidence shows | **Triggered** | **High** | **High** | Delivered revenue is accelerating (+52.8% in Q2), but in the same quarter: orders decelerated to low double digits, backlog fell, run-rate gross margin fell 243bps, and 109% of the operating-margin gain was overhead absorption on volume two agents place at or near a cyclical peak [`02_revenue-drivers` output, §4a; `03_margin-drivers` output, §8 and §10] | The evidence supports "**Mixed earnings setup**" for the 3–12 month window, not "Earnings accelerating". Named here because the framing choice is the module's single most consequential output |
| The thesis is really a sector / technology-cycle bet (CLAUDE.md §14) | **Triggered** | **High** | **High** | 93.1% of incremental Q2 revenue and ~37% of guided FY2026 sales from one end market; the single biggest earnings lever is external; `business-model/99_business-model-synthesis` classifies it explicitly as "a sector / technology-cycle bet, not a durable compounder" and trips §24 Filter 5 | If the earnings setup is reported as company-specific, conviction downstream will be overstated. The classification must be carried, not implied |
| A one-quarter beat read travelling as the 3–12 month verdict | **Triggered** | **High** | **High** | See 2.6 flag 1 and the adjudication in §1 | Recorded in both categories because it is simultaneously a setup defect and a framing defect, and the synthesis will meet it as framing |
| Good business quality inferred from a good earnings print | **Triggered** | Medium | **High** | Business quality **41/100**; moat **45/100**, "No moat proven — a moat in structure, not in economics"; through-cycle return on capital 8.1% against a company-stated ~10.0% cost of capital; buying a dollar of revenue cost ~$2.50 at Maverick against ~$0.31 to build it [`business-model/99_business-model-synthesis` output, §1 and the Read section] | A spectacular quarter in a business the sibling module scores at 41/100 is a cycle observation, not a quality observation. The two must not be conflated at the master layer |
| Aggregate travelling without its build (CLAUDE.md §15) | **Triggered** | Medium | **High** | "93.1% of every incremental dollar" is the **infrastructure vertical** (data centres *and* power utilities), and the vertical contributions in `02` §6a are total, not organic-only — they must not be compared with the 46.9pp organic line [`02_revenue-drivers` output, §6a] | `02` states the basis limit explicitly. Downstream restatements have already begun to compress it to "AI data centres". The qualifier is part of the claim |
| Bull case relies on adjectives rather than numbers | **Not Triggered** | — | — | Every material claim in `01`–`07` carries a cited figure; bridges reconcile with printed residuals (`RF-EARN-001`, `RF-EARN-002`); probabilities state their basis and sample size | The module's evidence discipline is sound. Its risk is framing and horizon, not fabrication |
| Setup depends on a valuation re-rating, which is outside this module | **Not Triggered** | — | — | No agent produces a target, rating, scenario set or fair value; `07` §8 explicitly omits a Maverick coefficient rather than inventing one | Scope respected throughout |

---

## 3. Red-Flag Summary Table

Triggered and Unclear flags only, sorted Critical → High → Medium → Low.

| # | Category | Red Flag | Status | Severity | Probability | One-Line Impact |
|---:|---|---|---|---|---|---|
| 1 | Revenue | Leading demand indicator turned — orders ~40% → low double digits, backlog $2.6bn → $2.5bn after growing sequentially in Q1, book-to-bill ~0.93x from ~1.2x | Triggered | **Critical** | Medium | Forces the module verdict toward "Mixed earnings setup" rather than "Earnings accelerating" over the 3–12 month scope |
| 2 | Data Completeness | Consensus (7-Aug) and price (12-Aug) both predate the 24-Aug Maverick announcement | Triggered | High | High | Every bar, gap and price figure in the module is pre-deal |
| 3 | Data Completeness | No filed order, backlog or book-to-bill series at any level | Triggered | High | High | The series that decides the verdict is two rounded management figures |
| 4 | Data Completeness | No FY2025 Form 10-K; audited annual filing is 20.2 months old | Triggered | High | High | The transformation year has no audited statements, segment note, MD&A bridge or Item 7A |
| 5 | Revenue | 93.1% of incremental Q2 revenue, 60.0% of sales, from one vertical; Americas 94.3% of growth | Triggered | High | High | The marginal dollar is a near-pure bet on one uncontrolled end market |
| 6 | Revenue | Customer concentration untested since FY2024, over exactly the period of change | Triggered | High | Unknown | A concentration cliff can be neither confirmed nor excluded |
| 7 | Revenue | Q2 sales were partly a deliberate backlog drain — pull-forward from H2 | Triggered | High | Medium | Makes the Q3 and Q4 comparisons harder, on management's own words |
| 8 | Margins | Reported gross margin −70bps is flattered by a one-off; the like-for-like run-rate is −243bps | Triggered | High | High | The factory is losing the price-cost fight; only the like-for-like figure may seed a terminal margin |
| 9 | Margins | 109% of the operating-margin gain is SG&A absorption on volume, not manufacturing economics | Triggered | High | High | The margin verdict does not survive a volume stall, and the fixed base is being enlarged |
| 10 | Guidance / Consensus | Q4 consensus revenue +5.32% above the guide-implied path | Triggered | High | High | The year's miss risk sits in Q4, not Q3, and must be earned organically |
| 11 | Guidance / Consensus | Revision breadth 100% one-sided; 15 Buy of 18; no bear cohort left | Triggered | High | High | An in-guide print still disappoints against how the panel is positioned |
| 12 | Guidance / Consensus | Maverick outside FY2026 guidance and outside every estimate in the pool | Triggered | High | High | A ~$700m-revenue business closes inside the guided quarter, priced by nobody |
| 13 | Beat / Miss | "Setup favors beat" is a one-quarter read inside a 3–12 month module | Triggered | High | High | The most likely misreading of the whole module |
| 14 | Beat / Miss | The setup needs a fourth guidance raise above ~$5.20, not just a Q3 beat | Triggered | High | High | The quarter can be right and the year still wrong |
| 15 | Earnings Quality | Adjusted EPS 28.8% above GAAP; 87% recurring acquisition amortisation on $2.77bn of deals in three years | Triggered | High | High | The headline profit line omits the recurring cost of the growth engine (§24 Filter 4) |
| 16 | Earnings Quality | Maverick "accretive to adjusted EPS" is asserted on the measure that excludes the deal's own amortisation | Triggered | High | High | Near-circular company language about an uncompleted deal — **new finding** |
| 17 | Earnings Quality | The excluding measure also sets incentive-compensation targets | Triggered | High | High | Rising segment income is not independent proof the acquisition programme is working |
| 18 | Sensitivity | One uncontrolled external variable swings adjusted EPS ±9.4%, more than all others combined | Triggered | High | High | Earnings direction is set outside the company |
| 19 | Sensitivity | Down-volume decremental not measurable; the bear case is a floor on damage, not a central estimate | Triggered | High | High | Published downside is understated; the "bound" label must travel |
| 20 | Sensitivity | Maverick EPS effect recorded "not quantifiable" while the release discloses an 11.5x 2026 adjusted-EBITDA multiple | Triggered | High | High | Implies ~$152m of EBITDA and a ~21.7% margin — a partial sizing was available and unused (§20) — **new finding** |
| 21 | Narrative | "Earnings accelerating" is not what the assembled evidence shows | Triggered | High | High | The framing, not the data, is where this module can go wrong |
| 22 | Narrative | The thesis is a sector / technology-cycle bet, not company-specific (§14) | Triggered | High | High | Conviction downstream will be overstated if the classification is dropped |
| 23 | Narrative | A one-quarter beat read travelling as the 3–12 month verdict | Triggered | High | High | Same defect as #13, met by the synthesis as framing |
| 24 | Data Completeness | No Q2 FY25 10-Q — no 30-Jun-2025 balance sheet | Triggered | Medium | High | The cleanest receivables test cannot be run; `06` caps its own verdict |
| 25 | Data Completeness | No Q3/Q4 FY25 or Q3/Q4 FY24 filings | Triggered | Medium | High | Four of eight gross-margin cells N/A; seasonality unprovable |
| 26 | Historical Trend | One exceptional quarter carries the improvement | Triggered | Medium | High | Best of eight on margin and the largest surprise in the tab's history |
| 27 | Revenue | Qualifier drop — 93.1% is the infrastructure vertical, not data centres alone | Triggered | Medium | High | The data-centre-only figure is transcript-only with no filed equivalent |
| 28 | Revenue | Acquisition contribution goes to zero from Q3; currency turns to a −$15.9m H2 drag | Triggered | Medium | High | H2 growth has no inorganic help behind it |
| 29 | Margins | Bridge residual −209.6bps against +141.7bps explained | Triggered | Medium | High | Most of the gross-margin move is unattributed to any driver |
| 30 | Margins | Segment mix is a mechanical recurring drag; Maverick deepens it | Triggered | Medium | High | Unrelated to cost inflation and does not reverse with it |
| 31 | Margins | Pass-through guided, not proven, for Q3; the prior cycle gave the price back | Triggered | Medium | Medium | The third point in the recovery series is an assertion, not a measurement |
| 32 | Margins | D&A ratio falls only while growth holds, on a base being enlarged | Triggered | Medium | Medium | A dilution tailwind that inverts if revenue growth stops |
| 33 | Margins | Capacity and utilisation figures are disclosed nowhere, though start-up cost is named as a drag | **Unclear** | Medium | Unknown | The cost of a wrong cycle call cannot be sized |
| 34 | Guidance / Consensus | Consensus above the guidance high end on five lines, including a GAAP EPS bar the guided range cannot reach | Triggered | Medium | High | An in-guide GAAP print is automatically a consensus miss |
| 35 | Guidance / Consensus | Revisions are catch-up to the 31-Jul raise, not independent upgrades | Triggered | Medium | High | Revision momentum is a restatement of management's own guide |
| 36 | Guidance / Consensus | Q4 adjusted-EPS gap understated by a mixed basis — +6.4% on the vendor's own FQ4 line, not +3.3% | Triggered | Medium | High | Roughly doubles the Q4 EPS stretch — **new finding** |
| 37 | Beat / Miss | The adjusted-EPS bar needs ~26% incrementals, above both the mid-20s guide and the 24.1% delivered | Triggered | Medium | Medium | A revenue beat with in-line incrementals yields a smaller EPS beat |
| 38 | Beat / Miss | Beat base rate is two observations inside one upswing | Triggered | Medium | High | Judgment, not a measured frequency (§10) |
| 39 | Earnings Quality | Four "one-off" adjustment categories recur every year | Triggered | Medium | High | The "adjusted" label is doing structural, not one-off, work |
| 40 | Earnings Quality | FY2023 $93.2m Luxembourg deferred-tax benefit 99.6% reversed by a $92.8m FY2024 valuation allowance; `06` records only the benefit | Triggered | Medium | Medium | Distorts any multi-year EPS or return series drawn through FY2023 — **new to this module** |
| 41 | Earnings Quality | FY2025 continuing-ops FCF of $555.7m overstates group cash by $183.8m | Triggered | Medium | High | Total-company FY2025 FCF was $371.9m, below FY2024 |
| 42 | Earnings Quality | Working capital absorbed $218.4m in H1 FY26 against a 90–95% conversion guide needing ~$545m of H2 FCF | Triggered | Medium | Medium | Demanding rather than broken; a revenue beat makes it harder |
| 43 | Sensitivity | The two largest variables are multiplicative; Maverick moves three rows the same way | Triggered | Medium | High | Adding the rows overstates the range and hides the common cause |
| 44 | Sensitivity | No commodity hedging and no published commodity sensitivity | Triggered | Medium | High | Metals move straight into COGS on the first-named inflation driver |
| 45 | Sensitivity | Tariffs ~$190m all-in ≈ 3.5% of guided sales; the guide moved +25% in one quarter | Triggered | Medium | High | A government-set cost line revising fast, offset by a lever disclosed only in combination |
| 46 | Sensitivity | Interest steps up after Q4 by ~9x the current-book sensitivity; bridge financing committed | Triggered | Medium | High | A dated near-term change inside the module's own window |
| 47 | Sensitivity | Only FY2024 sensitivities are disclosed and neither touches a top-three variable | Triggered | Medium | High | The dominant variable's move size is inferred, not disclosed |
| 48 | Source Conflicts | Three receivable-day series; earnings `06` clears the flag, business-model `11` scores it 40 | **Unclear** | Medium | High | The flag is reduced, not cleared — `06` caps its own confidence |
| 49 | Source Conflicts | Earnings quality 74/100 versus the sibling module's `RF-RFS-001` and §24 Filter 4 cap on the same evidence | **Unclear** | Medium | High | A calibration gap, not a factual one; 74/100 must not travel as "tested and cleared" |
| 50 | Source Conflicts | Three EBITDA figures for the same quarter and three for the same LTM | Triggered | Medium | High | Every gap reconciles, but a basis-blind downstream pick breaks rebuildability |
| 51 | Narrative | Business quality 41/100 and no moat proven must not be inferred from a strong print | Triggered | Medium | High | A cycle observation is not a quality observation |
| 52 | Narrative | "93.1%" travelling without its build and its organic-versus-total basis | Triggered | Medium | High | The qualifier is part of the claim (§3, §15) |
| 53 | Data Completeness | Price mark ~4 weeks stale (12-Aug-2026) | Triggered | Low | High | Any stock-reaction context is pre-Maverick and four weeks old |
| 54 | Data Completeness | No Q2 FY26 earnings deck; Q2 adjusted EBITDA vendor-sourced, adjusted net income derived | Triggered | Low | High | Two latest-quarter non-GAAP figures are not filing-grade |
| 55 | Data Completeness | Guided revenue, implied Q4 and the Maverick-exclusion proof all chain through one tier-5 FY2025 revenue base | Triggered | Low | High | Well corroborated, but a chain rather than an independent measurement |
| 56 | Historical Trend | Capital IQ's EBIT series reclassifies pension income and restructuring | Triggered | Low | Medium | The FY2023 margin step-up is materially smaller than the filing basis alone implies |
| 57 | Revenue | Volume-versus-price split not separable; the ≤5.2pp price figure is a zero-mitigation bound | Triggered | Low | High | Volume is the majority of the organic block but its share is not proven |
| 58 | Beat / Miss | Seasonality can neither help nor hurt — one usable year, confounded | Triggered | Low | High | No phasing assumption is available in either direction |
| 59 | Earnings Quality | LTM FCF contains ~$25.8m of one-off tariff refunds | Triggered | Low | High | Recurring figure is ~$634.1m; must not be double-counted against the margin normalisation |
| 60 | Earnings Quality | Contract liabilities fell 9.6% while revenue rose 53.1%; net contract assets swung +$24.6m | Triggered | Low | High | Customers fund less of the project book while nVent funds more |
| 61 | Source Conflicts | Vendor FY consensus ≠ sum of its own quarters ($23.9m / 0.44%) | Triggered | Low | High | Harmless when used consistently; the defect is mixing bases across metrics (#36) |

---

## 4. Red-Flag Score

| Metric | Value |
|---|---|
| Total flags triggered | **58** |
| Critical flags | **1** |
| High flags | **22** |
| Medium flags | **29** |
| Low flags | **9** |
| Unclear flags | **3** (rows 33, 48, 49 — counted inside the severity bands above: 3 Medium) |
| Unavailable checks (data missing) | **12** |

Reconciliation to Section 3: 61 rows = 58 Triggered + 3 Unclear. By severity: 1 Critical + 22 High + 29 Medium + 9 Low = 61. The three Unclear rows sit in the Medium band, so the Medium count of 29 comprises 26 Triggered and 3 Unclear.

The twelve Unavailable checks: freight and energy as cost lines; raw material and labour as shares of COGS; any commodity-price sensitivity; maintenance-versus-growth capex split; cash interest paid for FY2025 and the LTM; a 30-Jun-2025 balance sheet; segment-level order intake and backlog; the volume-versus-price split; prior-TTM CFO; the FY2025 audited segment note and MD&A margin bridge; Maverick's funding split and segment placement; and the down-volume decremental rate.

---

## 5. Red-Flag Severity Verdict

## **Critical concerns**

This is the **"should be downgraded"** arm of that definition, not the "unreliable" arm — and the distinction matters. The data pool is genuinely sufficient, the specialist work is careful, the bridges reconcile with printed residuals, and the cash behind the earnings is real. What is wrong is the **verdict category the module is heading toward**: the only forward-looking demand series in the entire pool has turned, in the same quarter management says it deliberately drained the backlog, while the whole margin gain is fixed-overhead absorption on volume that two agents independently place at or near a cyclical peak — and the module is asked to report on 3–12 months, not on one quarter.

**The single most dangerous red flag is #1: the leading demand indicator turned while the module's verdict horizon is 3–12 months.** Organic orders fell from approximately 40% to "low double digits" against 46.9% organic sales, and backlog went from growing "low-double digits sequentially to $2.6 billion" in Q1 to $2.5bn in Q2 — a reversal of direction, not merely a move inside the transcripts' own $0.1bn rounding. **What would resolve it:** the Q3 print on 30-Oct-2026 — specifically organic order growth against organic sales growth, and whether backlog stops falling. A fourth guidance raise taking the FY2026 adjusted-EPS midpoint above ~$5.20, rather than a mechanical pass-through of a Q3 beat, would resolve it in the other direction.

---

## 6. What The Synthesis Agent Should Know

- **58 triggered plus 3 unclear: 1 Critical, 22 High, 29 Medium, 9 Low.** The concentration is in Revenue (7), Guidance/Consensus (6), Earnings Quality (8) and Sensitivity (8) — the four categories that decide the forward setup, not the historical record.
- **The verdict category should be "Mixed earnings setup", not "Earnings accelerating".** Delivered revenue is accelerating and the orders, run-rate gross margin and cycle-position evidence all point the other way over the module's own 3–12 month horizon. Do not average them; report both, and let the horizon do the reconciling.
- **`05`'s "Setup favors beat" is correct and must be re-labelled when it travels.** It is a **standalone Q3 FY2026** conclusion. The beat read survives the order turn on that horizon — $2.5bn of backlog is roughly 47% of guided FY2026 revenue and the bar embeds a 3.0% sequential revenue decline — and it does not survive to Q4 or to the full window. Carry the horizon in the sentence or do not carry the sentence.
- **On the gross-margin dispute, `03` is the like-for-like read: −243bps, not −70bps.** `01`'s −70bps is the correct as-filed figure and must keep the label "flattered by a $25.8m one-off the company itself excludes from adjusted profit". Any terminal margin, bear case or leverage denominator uses 36.17%, not 37.93%.
- **Two findings the earnings module does not currently carry, both verified against the frozen corpus by this agent:**
  1. **`07`'s "Maverick margin not disclosed" is not correct as written.** The release states the effective enterprise-value multiple is "approximately 11.5 times anticipated 2026 adjusted EBITDA" on a $1.75bn price [`nVent press release, 24-Aug-2026`], implying roughly $152m of 2026 adjusted EBITDA on ~$700m of estimated revenue — about a 21.7% margin (*derived from the disclosed multiple — inference, not a company-stated margin*). Full EPS accretion remains uncomputable (funding split and the deal's own amortisation are undisclosed), but a partial sizing was available and was not used. That is a §20 bad-extraction gap, and the synthesis should say so rather than repeat "not quantifiable".
  2. **The Q4 adjusted-EPS stretch is roughly double what `05` reports.** `05` derived Q4 EPS from the FY consensus line ($1.183, +3.3% above the guide-implied $1.145) while taking Q4 *revenue* from the vendor's own FQ4 line. The vendor's own FQ4 2026 EPS Normalized figure is **$1.21859**, which makes the stretch **+6.4%** — consistent with the +5.32% revenue gap, whereas +3.3% was not. Use the matched basis.
- **A third item the earnings module under-records:** `06` §5 names the FY2023 tax credit but not that the $93.2m Luxembourg deferred-tax benefit was reversed by a $92.8m valuation allowance in FY2024 — 99.6% of a "more likely than not" judgment failing inside twelve months [`FY24 10-K, Item 7 MD&A — Provision (benefit) for income taxes`]. It does not touch the current setup (FY2025 22.1%, H1 FY26 22.4% are normal) but it invalidates any multi-year EPS or return series drawn through FY2023.
- **Score caps and calibration the synthesis must apply or explicitly decline:**
  - **No MODULE_RULES hard cap binds** — consensus, quarterly data, verbatim transcripts, segment P&L and cash-flow statements are all present, as `00` §5 establishes. Do not invent one.
  - **Earnings clarity should not sit high.** The single largest driver — the order book — is disclosed nowhere in any filing, at any level, and the largest forward event (Maverick, ~$700m of revenue) sits outside both the guide and every estimate. That is a genuine modelling gap even though it triggers no named cap.
  - **Earnings quality 74/100 should be re-examined against, not merged with, the business-model module's read of the same evidence** (`RF-RFS-001`, severity 52; §24 Filter 4 cap applied at `11`). `06` did not have the incentive-compensation mechanism in front of it. Do not let 74/100 travel as if the amortisation wedge had been tested and cleared.
  - **Earnings volatility 68/100 (inverted, higher = worse) is if anything generous**, because `07` itself states the down-volume decremental is not measurable and its bear case is a floor on the damage.
  - **Overall usefulness:** the "conflicting sources not reconcilable → max 65" cap does **not** bind. Every conflict named in 2.9 is reconcilable and reconciled; two are calibration gaps rather than factual conflicts.
- **Five contradictions the synthesis must reconcile by name, not average:** (i) `05` beat versus `02`/`07` order turn — reconciled by horizon; (ii) `01` −70bps versus `03` −243bps — `03` is like-for-like; (iii) `06` clears the DSO flag while `business-model/11` scores it 40 — `06`'s method is correct but its own confidence cap means "reduced", not "cleared"; (iv) `06` 74/100 versus `RF-RFS-001` and the Filter 4 cap; (v) `03` §9 reading the capacity spend as a booking while `07` §6 reads the same enlarged fixed base as the largest asymmetry — both correct, one describes today and one describes the failure path, and they share the same flip observable.
- **Missing data that prevented a full scan:** twelve inputs listed in §4. The three that most constrain this sweep are the absent FY2025 10-K (no audited statements for the transformation year), the absence of any filed order or backlog series (so the flag that drives the verdict rests on management's own rounded numbers), and the absence of any customer-concentration statement after FY2024 (so a concentration cliff can be neither confirmed nor excluded over exactly the period when Systems Protection roughly doubled).
- **Is the setup cleaner or dirtier than the upstream agents suggested? Dirtier on framing and forward risk; cleaner on accounting integrity than the flag count implies.** Three checks that could easily have gone the other way came back clean and should be stated positively: the Q2 adjusted-EPS growth is not tax-driven (22.4% effective rate in both halves), not buyback-driven (diluted shares actually *rose* 0.3% year on year to 164.1m, and H1 repurchases fell to $50.4m from $253.1m), and not currency-driven (0.5pp); stock-based compensation is expensed inside adjusted earnings; and no factoring or supplier-finance programme is disclosed. The company also removed a $25.8m GAAP benefit from its own adjusted numbers. The problem here is not that the earnings are fake — it is that they are cyclical, concentrated, and being framed as a trend.

---

## 7. Pre-Mortem — If The Earnings Setup Fails

**If this setup turns out to be wrong, the most likely reason is that we let a correct one-quarter conclusion carry a three-to-twelve-month verdict, and treated the only forward-looking series we had as noise because it was rounded.** The Q3 beat read is well built and probably right: the bar sits 3.0% below the quarter just delivered and roughly 47% of guided FY2026 revenue is already in backlog, so the near print is largely pre-sold. That is exactly what makes it dangerous — it is the kind of conclusion that survives its own quarter and then gets restated upward without its horizon. Meanwhile the one number that describes Q4 and 2027 rather than Q2 is a backlog figure that went from growing "low-double digits sequentially to $2.6 billion" in Q1 to $2.5bn in Q2, alongside organic orders falling from approximately 40% to "low double digits" against 46.9% organic sales, all in the same quarter management said it "worked hard in Q2 to really execute on that backlog" [`Q1 FY26 transcript, prepared remarks, 1-May-2026`; `Q2 FY26 transcript, prepared remarks and Q&A, 31-Jul-2026`]. We discounted that series because it is rounded to $0.1bn, exists only in transcripts, and has no segment split — every one of which is true, and none of which makes it less relevant than the sales line it contradicts. If the orders did not in fact rebound in Q3, revenue lands inside the guided +32–35%, misses a consensus set 35.4% above the year-ago quarter, and the 453bps of SG&A absorption that produced the entire margin gain reverses against a fixed base three new plants larger — and the failure will be classified under CLAUDE.md §20 as *bad causal inference*: reading backlog conversion as demand.
