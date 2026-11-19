# earnings Module Dossier — TTWO

> Deterministic, lossless concatenation of every artifact in this module — the module synthesis and every specialist output, in order. Generated mechanically (no LLM rewriting), so nothing is omitted or paraphrased. This is the module's "see everything" tier; the module's decision lives in `99_*-synthesis.md` and the short read in `earnings_memo.md`.

- Generated: 2026-11-19T15:01:48Z
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

# Earnings Module — TTWO (Synthesis)

**Company:** Take-Two Interactive Software, Inc. (NasdaqGS:TTWO) · **Regime:** US SEC (10-K / 10-Q / 8-K Ex. 99.1) · **Standard:** US GAAP · **Currency:** USD, millions · **Fiscal year ends 31 March** (FY2026 = year ended 2026-03-31; FY2027 in progress) · **Current price USD 216.61 as of 2026-11-19** (CIQ Comps · Financial Data; shares outstanding 187.2m).

**Basis rules that govern every figure in this report (CLAUDE.md §15, §27). Nothing below mixes them.**

1. **GAAP total net revenue is not Net Bookings.** Q2 FY27 GAAP net revenue $1,497.0m vs Net Bookings $1,601.3m, a $104.3m difference equal to the net build in deferred revenue [`Q2 FY27 10-Q, MD&A`; `TTWO 2Q27 Earnings Release, 2026-11-09, p.1–2`]. The Capital IQ consensus field labelled "Revenue" is on the **Net Bookings** basis, proven two ways upstream: its FQ2 2027 actual is 1,601.30 (not 1,497.0), and its FY2027 Guidance Low/High of 8,000 / 8,200 matches the Net Bookings range exactly, not the GAAP range of 7,980 / 8,180 [`04` §1].
2. **FY2027 guidance is issued on BOTH bases in one table:** GAAP total net revenue $7,980–8,180m **and** Net Bookings $8,000–8,200m [`TTWO 2Q27 Earnings Release, "Outlook for Fiscal Year 2027"`].
3. **Capital IQ "EPS Normalized" and "EBITDA" are management-basis, not GAAP** — reconciled to the cent on two consecutive quarters in `04` §0 (Q1 FY27 EPS 0.353 derived vs 0.3532 vendor; Q1 EBITDA 127.1 vs 127.1; Q2 EBITDA 277.1 vs 277.1).
4. **Four profit bases exist for the same quarter** and are never interchangeable: GAAP net loss $(54.0)m; company-defined non-GAAP EBITDA $92.2m; management-reporting EBITDA $277.1m; vendor-computed EBITDA $75.9m [`Q2 FY27 earnings release, p.2 and p.11`; `CIQ Financials_Quarterly`].
5. **Evidence binding.** Frozen supervisor-verified read mode; the live logical path `data/TTWO/` was not read and is a citation label only. `Alphabet Inc NasdaqGS GOOGL Key Developments.xls` is a wrong-company pool contaminant and is cited nowhere. The vendor's recommendation distribution and target prices are stripped and not carried (§24); only the analyst **count** (29) is used.

---

## Abstract

Take-Two's earnings sit at the trough of its own release cycle: September-quarter GAAP net revenue fell 15.6% to $1,497.0m, the lowest of eight quarters, while December is guided to roughly double. Nearly all of that rests on one title, Grand Theft Auto VI, which launched on this report's date and appears in no reported period. The Street's FY2027 Net Bookings bar of $8,554.7m sits 4.3% above the top of management's own $8,000–8,200m range. The biggest risk is the $2,577.3m of capitalised content that launch must earn back — $2,149.7m of it on unreleased titles, 61% of equity at the last annual date. No data cap applies, but the deciding variable is unmeasurable, so the setup is mixed.

---

## 1. Earnings Verdict

- **Verdict: Mixed earnings setup** — conflicting signals across revenue, margins and quality, with the deciding variable unmeasurable from this pool.
- **Earnings quality /100 (higher = better): 48** *(from `06` §9 — unchanged; the no-cash-flow max-45 cap does not bind, so 48 is set on evidence)*
- **Consensus setup /100 (higher = more beatable): 33** *(from `04` §7's "Bar is high", scored from BOTH the level and the trend — see §3 row 7)*
- **Earnings volatility /100 (INVERTED — higher = WORSE): 78, confidence Low** *(score from `07` §7; confidence adjudicated DOWN from `07`'s stated Medium — see §4)*
- **Next-quarter setup: Favors miss** *(from `05` §8 — and the qualifier travels: favors miss **relative to the bar management has underwritten**, not relative to the outcome, which no reported period contains)*
- **Earnings clarity /100 (higher = better): 38** *(no `MODULE_RULES` clarity cap binds — two verbatim transcripts, ~42 quarters, single reportable segment is a disclosure fact. The score is low on substance, not on a cap: the dominant driver has zero reported history and three of seven sector KPIs are undisclosed)*
- **Data quality /100: 82** *(`00` verdict Sufficient; 30 sources, 0 extraction failures)*
- **Overall usefulness /100: 68** *(the "conflicting sources not reconcilable → max 65" cap is NOT applied — see §4)*
- **Biggest earnings driver (one line):** the sell-through of Grand Theft Auto VI, launched 2026-11-19 — the guided Q3 FY27 Net Bookings step-up of $1,667.9m ($3,425m midpoint vs $1,757.1m) is **120.9%** of the entire FY2027 guided step-up of $1,379.0m ($8,100m vs $6,721.0m), and its own share inside that quarter is disclosed nowhere.
- **Biggest earnings risk (one line):** the $2,577.3m capitalised content asset at 2026-09-30 having to be earned back by that launch — $2,149.7m (91.6% of the then $2,346.3m balance, 61% of $3,510.9m equity) sat on **unreleased** titles at 2026-03-31, amortising at the **greater of** revenue-proportional or straight-line over 9–36 months, with impairment charged straight to cost of revenue; the 2026-09-30 unreleased split is **not disclosed**, so today's exposure is Not assessable.
- **`08_earnings-red-flags` Severity Verdict, reported verbatim and not softened: "Critical concerns."** 39 triggered flags — 1 Critical, 9 High, 19 Medium, 10 Low — plus 1 Unclear and 2 Unavailable checks.

---

## 1A. Module Disconfirmation (CLAUDE.md §8)

- **Strongest bear point.** The bar is above what management itself underwrote, and the company just failed to clear its own. Q3 FY27 Net Bookings consensus 3,573.61 sits +2.1% above the TOP of guided $3,350–3,500m and +4.34% above the $3,425m midpoint, so Take-Two must beat its own guidance merely to meet the Street — one quarter after missing it ($1,601.3m vs $1,620–1,670m, with recurrent spending −9% against a guided −5%) [`04` §2.4, §3.2; `05` §8]. Worse, no operational disappointment is needed: reiterating FY2027 on 2027-02-09 mechanically implies a Q4 of $1,687.8m against the Street's own $1,950.67m — a 13.5% guide-down from arithmetic alone [`05` §5].
- **Strongest bull point (the steelman).** The operating leverage is measured, not assumed, and it reverses upward. In Q2 FY27 the company took out $257.3m of cost in one quarter ($156.7m cost of revenue, $100.6m operating expenses) and still lost 232bps of EBIT margin purely because revenue fell $276.8m — a −1,683bps denominator drag against +1,450bps of cost relief [`03` §7a]. Run the same near-fixed $1,172m of guided Q3 operating expenses against roughly doubled revenue and the operating-expense ratio goes 65.3% → 35.0%, worth about +2,227bps of EBIT margin (−7.8% actual → +14.4% guided) [`03` §3.3]. Guidance is unusually specific — component by component, on both bases, with named assumptions — and FY27 GAAP revenue guidance was **raised** ($7,900–8,100m → $7,980–8,180m) while operating-expense guidance was **cut** ($4,150–4,170m → $4,078–4,098m) at the same print [`04` §2.1].
- **Single killer risk.** The content asset and the launch are the same bet taken twice. If GTA VI sell-through lands below the forecast embedded in the carrying value, the straight-line amortisation leg charges cost against revenue that did not arrive **and** a separate impairment is charged directly to cost of revenue — after the cash has already gone out ($716.3m of cash into content over the TTM against $411.9m amortised, a $304.4m gap) [`06` §10; `FY26 10-K, Note 1`]. The mechanism is live, not hypothetical: $43.4m fired in Q1 FY27 and $0.2m in Q2 FY27.
- **Disconfirming evidence already visible — on both sides.** Against the bear: the GTA series' revenue was **up** in Q2 FY27 (amount not quantified by the filing), GTA+ recurrent spending and average monthly members each "grew a double-digit percentage", four consecutive management-basis EBITDA and EPS beats stand in the record, and Q3 management-basis EBITDA consensus sits within 0.2% of the derived guidance midpoint (965.28 vs 963.5) — the one unstretched line [`Q2 FY27 10-Q, MD&A p.25`; `Q2 2027 transcript, prepared remarks`; `04` §3.2, §6]. Against the bull: the beat magnitude has collapsed (+48.2% → +42.9% → +6.1% → +3.1% on management-basis EPS), full-year GAAP-EPS surprise was **0% in each of FY2023–FY2026**, FY2027 Net Bookings revision breadth is **negative at 6↑/9↓**, and the forward book is shrinking (total deferred revenue $1,268.1m → $1,042.1m, −17.8% YoY) [`04` §5, §6; `06` §6].

---

## 2. Specialist Roll-Up

Every row restates the sub-agent's own words, qualifier and basis. Checked against the four §3 failure shapes (qualifier dropped / basis dropped / build dropped / verdict hardened) before publishing; where the short form could not carry the truth, the long form is published.

| Specialist | Verdict Line | Biggest Finding |
|---|---|---|
| **`00` earnings-data-triage** | **Sufficient.** No partial-data flag resolves Y and no `MODULE_RULES` score cap is triggered by the data pool | The hazard is not missing data but a **basis trap**: consensus "Revenue" is Net Bookings ($1,601.3m vendor actual for Q2 FY27) while the GAAP line is net revenue ($1,497.0m), and FY27 guidance is issued on both ($7,980–8,180m GAAP vs $8,000–8,200m Net Bookings). Pool hygiene: 30 sources / 0 failures; one wrong-company contaminant (Alphabet); DEF 14A payload empty (a governance input, not an earnings one) |
| **`01` historical-financials** | Revenue **accelerating through FY2026, then reversing in H1 FY2027** — and the agent refuses to collapse the two: "decelerating" over the last two reported quarters, "accelerating" over the five-year annual series, "Both statements are true on their own period" | Annual GAAP revenue growth −0.0% (FY24) → +5.3% (FY25) → +18.2% (FY26, $6,656.4m vs $5,633.6m), with FY2023's +52.6% acquisition-driven (Zynga, closed 2022-05-23) and **not organic**. Then Q1 FY27 +2.0% and Q2 FY27 **−15.6%** to $1,497.0m; TTM only **+3.1%** ($6,409.7m vs $6,219.9m). TTM FCF (CFO − total capex) **$62.6m** ($367.1m − $304.5m) vs $181.0m, −65.4%; strict-basis net debt $972.5m → **$1,370.4m (1.89x LTM vendor EBITDA $724.9m)**, with the vendor's broad-basis $1,237.8m / 1.71x reconciled exactly (1,370.4 − 524.2 short-term investments + 391.6 lease liabilities = 1,237.8) |
| **`02` revenue-drivers** | Single reportable segment (a disclosure fact, not a gap); the revenue line is driven by **its own release calendar and continuing in-game spend on titles already shipped** — not market growth, not price, not currency. Latest period at the **trough** of its own release cycle; next period a **launch peak**; "neither … is a normalised run-rate" | Q2 FY27 GAAP decomposition, full build: Borderlands −$128.0m (−7.22pp), Mafia −$56.3m (−3.17pp), Color Block Jam −$31.4m (−1.77pp), Match Factory! −$21.9m (−1.23pp), FX −$0.6m (−0.03pp) = **−13.42pp explained**; residual **−2.18pp** (14% of the move, containing the filing's unquantified GTA-series **increase** netted against unnamed declines, net sign negative); total **−15.61pp** on a $1,773.8m base. **No single title reaches half** — Borderlands is 46%, so the honest statement is a set of four prior-year launches lapping, not one driver. `RF-EARN-001` closed reconciled. Separately: the narrowing deferral wedge ($186.7m → $104.3m) added **+4.65pp** to reported GAAP growth, so GAAP understated the bookings fall by 2.7pp (−15.6% vs −18.3%) |
| **`03` margin-drivers** | **Gross margin expanding, EBITDA margin inflecting, EBIT margin down — and the gap between them is the finding.** The latest quarter is a release-cycle trough and Q3 FY27 a launch peak; "there is no quarter in the next twelve months that can be read as run-rate" | Q2 FY27 EBIT-margin bridge, filing basis, full build and **0bps residual**: gross margin **+220bps** (software-development amortisation +249, product costs +64, acquired intangibles −45, internal royalties −37, licences −11); operating expenses **−452bps** (S&M +54, R&D −189, G&A −271, D&A −46); total **−232bps** (−7.849% vs −5.525%). `RF-EARN-002` closed reconciled. The causal split is the real finding: **+1,450bps of cost-dollar relief against −1,683bps of denominator drag** — negative operating leverage roughly seven times the size of the net margin change it produced. Single biggest margin driver: the revenue the **$2,577.3m** capitalised content asset has to earn. **Qualifier carried from `03` §8, not §9 (see §3 row 4):** the claim "does rest on a forward input the engine cannot verify, and that distinction travels with it" |
| **`04` guidance-consensus** | **Bar is high** — with its own stated limitation attached: "the bar is high **relative to what management has underwritten**; it is not proven high relative to the outcome, and that distinction must travel with this verdict" | FY2027 consensus Net Bookings **8,554.69** (20 of 29 contributors) vs reiterated guidance $8,000–8,200m = **+$454.7m (+5.6%) above the midpoint and +$354.7m (+4.3%) above the TOP**; the single lowest of 20 estimates (8,112) still sits above the $8,100m midpoint. H1 is already in the ground at $2,987.2m, so the Street needs H2 of $5,567.5m against a guidance-implied $5,112.8m. FY2027 GAAP diluted EPS consensus $1.9057 (14 of 18) is ~2.9x the guided $0.66 midpoint (**+189%**) — and `04` itself calls this "the lowest-quality of the gaps in this table", locating it below the EBITDA line in tax and non-operating items. **Direction is mixed, and `04` says so:** FY27 Net Bookings level +0.4% over three months while breadth is **negative 6↑/9↓**; FY27 EPS Normalized **−13.3% vs six months ago** (7.95 → 6.89); FY27 GAAP EPS **−46.8%** (3.59 → 1.91); FY27 management-basis EBITDA cut 4.1% (1,765.43 → 1,692.79) |
| **`05` beat-miss-setup** | **Setup favors miss** — on the bar, with the `04` qualifier carried intact ("high relative to what management has underwritten; not proven high relative to the outcome") | The company can deliver its own plan and still miss: at the top of the guided range (3,500) Q3 is a **−2.1%** consensus miss, at the midpoint a **−4.2%** miss. The sharpest risk needs no operational disappointment at all — reiterating FY2027 implies a Q4 of **$1,687.8m** against the Street's **$1,950.67m**, a **13.5%** guide-down, with FQ4 breadth already −8 / −8 / −7 against FQ3's +8 / +10 / +7. `05` **refuses to set a GAAP-EPS threshold** (nine contributors, 5.0x high/low spread, the gap sitting below the EBITDA line, and a November-2026 intangible reorganisation landing inside the quarter). Cash trigger, with its build: FY27 CFO guided over $1,000m while H1 FY27 CFO was **$(173.5)m**, so H2 must deliver **more than $1,173.5m** against H2 FY26's **$540.6m** — roughly 2.17x |
| **`06` earnings-quality** | **48/100** — band 41–60, "material concerns — cash conversion weak OR recurring one-offs. Here, both" | CFO/EBITDA **38.4% / 0.2% / −3.7% / −11.9% / 79.2% / 50.6%** across FY2022–FY2026 and the TTM; **negative FCF in three of five fiscal years**; four of six accrual flags fire. The lead cash figure carries its normalisation: **normalised operating FCF of up to $154.4m** (367.1 − (304.5 − 91.8)) against **$62.6m reported** — "up to", because the cash element of the $91.8m London building purchase is not separately disclosed, so $154.4m is a **ceiling**; and even at the full add-back it is below the prior year's $181.0m. Largest exposure: **$2,149.7m** of the $2,346.3m capitalised balance on unreleased titles at 2026-03-31 (91.6%, **61% of $3,510.9m equity**), with **no interim update in the 10-Q**. Mechanical cause of the conversion gap, not fraud: $716.3m of cash into content vs $411.9m amortised = a $304.4m gap. Standalone tags emitted: `RF-EQ-001`, `RF-EQ-002` |
| **`07` earnings-sensitivity** | **Earnings volatility 78/100 (INVERTED — higher = worse), confidence stated Medium** (adjudicated to **Low** here — see §4). Top variable: GTA VI sell-through, direction **"unproven, not favourable or adverse"** | On the one comparable metric (FY2027 guided GAAP EBIT of $252.5m = 8,080 − 3,739.5 − 4,088, a 3.12% margin) the top variable is **$248.2m** average absolute impact — 2.4x the second ($105.0m gross margin), 4.5x the fifth ($55.0m content impairment), and **4.0x** the second if the bear runs at the fixed-cost-of-revenue bound ($417.3m). Q3 coefficient printed, basis named: 1 − (1,690.5 ÷ 3,345) = **$0.4946 of EBIT per $1 of Q3 revenue**, on the **Q3** guided cost-of-revenue ratio of 50.538% — not the FY27 46.281% and not the Q2 actual 42.525%. Four asymmetries, three adverse; the amortisation floor makes a miss worth **1.0x–2.0x** a beat. The FY-step-up decomposition closes exactly: H1 realised −$396.4m + Q3 guided +$1,667.9m + Q4 implied +$107.5m = **+$1,379.0m, residual $0.0m** |
| **`08` earnings-red-flags** | **Severity verdict (verbatim): "Critical concerns."** 39 triggered — 1 Critical, 9 High, 19 Medium, 10 Low, plus 1 Unclear and 2 Unavailable checks | The Critical flag is **evidentiary, not an upstream error**: the primary driver has zero reported history, no in-pool base rate (vendor quarterly history starts Jun-2016; GTA V launched Sep-2013), no preorder or unit figure, and no alt-data panel — so "a module whose single largest revenue driver, single largest margin driver and top-ranked sensitivity are all the same unmeasurable variable cannot support a directional verdict." Most dangerous single flag: `07`'s **117.1% "realised, measured"** mitigation offset, which is measured between **two guidance tables**, not from a realised print |

---

## 3. Reconciliation

| # | Disagreement | Side A (source) | Side B (source) | Reconciled view |
|---:|---|---|---|---|
| 1 | **Does the Critical evidentiary flag cap the verdict at Mixed?** | `08` §5: "must be capped at 'Mixed earnings setup'" | No agent argues otherwise; `02` §3b and `03` §1b independently reach the same substantive place | **Cap ACCEPTED, and it is not the only reason.** Two independent grounds converge. (i) **Doctrine:** data sufficiency caps conviction (§11) and a Critical flag caps the verdict unless explicitly resolved by primary evidence (§13) — and no primary evidence resolves it, because GTA VI launched 2026-11-19 and no reported period contains a dollar of it. (ii) **Substance:** the evidence genuinely conflicts across the three axes the verdict is built on. Revenue is decelerating as realised (−15.6% YoY) and guided to roughly double; margins are expanding at the gross line (+220bps) and down at EBIT (−232bps) with FY27 gross margin guided −351bps; quality is weak (48/100, CFO/EBITDA 50.6%). "Mixed earnings setup" is the definitional match — "conflicting signals across revenue, margins, and quality" — not a fallback. "Accelerating" or "decelerating" would each pick one period over the other |
| 2 | **`08`'s "Critical concerns" severity verdict vs this module's non-directional "Mixed" verdict** | `08` §5 | §1 above | **No conflict — different axes, both reported.** `08` scores how dirty the setup is; §1 scores which direction earnings are going. A Critical-severity evidentiary flag is precisely what *produces* a non-directional verdict. `08`'s verdict is reported verbatim in §1 and §8 and is not softened anywhere in this report |
| 3 | **May the 117.1% mitigation offset be carried as "realised, measured"?** | `07` §2 row 2 leads with "**117% — realised, measured, and it over-covered**" (with both qualifiers attached in the same cell) | `08` flag 2 (High): it is derived from two **guidance** tables, not a realised print; §9 requires a realised offset to be computed from what the company actually absorbed | **NO. It may not travel as realised, and this synthesis demotes it.** The build is preserved and relabelled: between the 2026-08-07 and 2026-11-09 FY2027 outlooks, guided gross profit fell **$61.5m** ($4,402.0m → $4,340.5m) while guided operating expenses were cut **$72.0m** ($4,160m → $4,088m), so guided EBIT **rose $10.5m** ($242.0m → $252.5m); 72.0 ÷ 61.5 = **117.1%**. That is a **guided/planned offset between two forecasts**, from a company that missed its own bookings guidance in the same release, and management attributed part of the operating-expense favourability to "lower personnel and user acquisition costs… some of that was due to timing" — timing is not a durable cost action. **Carried forward as: zero mitigation is the labelled bound; 117.1% is management's plan, not a measurement.** *The correction is not only a demotion:* the module does contain a genuine §9 realised offset, and it sits elsewhere — product costs (where the Apple/Google fee lands) fell **160bps of revenue across FY2026** (14.6% → 13.0%) and a further **110bps across H1 FY27** (13.4% → 12.3%), realised from the filings, through platform mix (mobile 52.2% → 50.1% of FY2026 revenue) and a direct-to-consumer channel whose share is **not disclosed**. That is the measured absorption rate; the 117.1% is not |
| 4 | **Is the Q3 guide a "firm company commitment"?** | `03` §9: "a **firm company commitment** made ten days before launch, not a hope", and "on the evidence available today the **demand sign dominates**" | `02` §7 ("unproven"), `05` §8 ("favors miss"), `06` §10 ("quantified nowhere in this pool"), `07` §4 ("unproven, not favourable or adverse") | **Adjudicated to the four. §3 claim-fidelity applied; the hedged form is what travels.** `03`'s arithmetic is sound and its own §8 carries the correct version — "it does rest on a forward input the engine cannot verify, and that distinction travels with it." The restated claim: **on the company's own guided components the demand reading is better evidenced than the cost reading, conditional on a launch outcome no reported period contains.** Guidance is a management forward statement that the company itself warns "may not foot to the totals" and that it **missed** in the same print ($1,601.3m vs $1,620–1,670m). The words "firm commitment" and "demand sign dominates" are not carried anywhere in this synthesis |
| 5 | **TTM free cash flow: −65.4% or up to −14.7%?** | `01` §2/§6: **$62.6m vs $181.0m, −65.4%**, with no mention of the London building | `06` §1: normalised operating FCF **up to $154.4m** excluding the one-off $91.8m London purchase — "still below the $181.0m of the prior twelve months" | **Both figures are right; both bases travel.** Reported FCF (CFO − total capex, §15) = $367.1m − $304.5m = **$62.6m, −65.4%**. Normalised, excluding the $91.8m capitalised cost of the London building bought 2026-08-10 ($82.9m land + $8.9m building, 20-year life) = **up to $154.4m, −14.7%**. The ceiling qualifier is mandatory: the filing states the $91.8m "includes cash consideration, direct transaction costs, net of the derecognition of the preexisting lease liability and right-of-use asset", so **the cash element is not separately disclosed** and $154.4m is a ceiling, not a point estimate. **FCF fell on either basis.** A synthesis quoting `01` alone overstates the cash deterioration by roughly four times |
| 6 | **The $2,577.3m content asset: double-counted or under-counted?** | `06` §10: the $2,149.7m unreleased portion (61% of equity) is the single biggest **quality** concern | `03` §5 driver 2 / §8: the same asset's release-timed amortisation is the single biggest **margin** driver (guided −351bps of FY27 gross margin). `07` §2 row 4 / §3 ranks incremental impairment **fifth and last** at $55.0m | **UNDER-counted, not double-counted — three different objects, and only two are in guidance.** (i) A **P&L flow**: amortisation at the greater of revenue-proportional or straight-line over 9–36 months, already embedded in the guided FY27 gross margin of 53.72% (−351bps vs FY2026's 57.23%). (ii) A **balance-sheet stock**: $2,149.7m on unreleased titles at 2026-03-31 = 91.6% of the then $2,346.3m balance and 61% of $3,510.9m equity. (iii) An **incremental impairment charge**, for which **guidance allows nothing** — base $0 for H2 FY27, against a disclosed historical range of $109.9m (FY2024), $77.5m (FY2025), $(1.0)m credit (FY2026) and $43.6m already charged in H1 FY27. Do not net them and do not add them. The actionable correction: `07`'s own text calls the $109.9m bear "a floor on the plausible bear, not a cap" because it was measured against a **smaller** unreleased base ($1,815.0m at FY2025 vs $2,149.7m at FY2026, against a $2,577.3m total now) — yet its ranking table presents it as the smallest EBIT risk. **The ranking communicates the opposite of the text.** The 2026-09-30 unreleased split is **not disclosed in the 10-Q**, so today's exposure is **Not assessable** |
| 7 | **`04` "Bar is high" (level) vs `04`'s own trend data** | `04` §7 verdict rests on the level: consensus above the top of guidance on both FY27 and Q3 Net Bookings | `04` §4: FY27 EPS Normalized **−13.3% over six months**, FY27 GAAP EPS **−46.8%**, FY27 management-basis EBITDA **−4.1% over three months**, FY2028 revenue/EPS/EBITDA all cut last month | **Both signals are carried, and the consensus-setup score is built from both — not from the level alone.** The level says hard-to-beat (+4.3% above the top of the FY range; the lowest of 20 estimates above the midpoint; the company just missed its own guidance). The trend says partially de-risked (estimates cut 13–47% over six months). Net: **33/100** — weak/hard to beat, but not the very-low band the level alone would imply. Note `04` already called its own direction read "mixed, and honestly so"; the defect was only that the one-line verdict carried the level |
| 8 | **`04` "Bar is high" vs `05` "Favors miss"** | `04` §7 | `05` §8 | **Not a disagreement — `05` is the arithmetic consequence of `04`.** Both rest on the same measured distance: Q3 consensus 3,573.61 is +2.1% above the top of guided $3,350–3,500m and +4.34% above the $3,425m midpoint; FY27 consensus 8,554.7 is +4.3% above the top of $8,000–8,200m. Both carry the same qualifier about the outcome. Carried as one finding |
| 9 | **Revenue "accelerating" or "decelerating"?** | `01` §1 trend column reads **Accelerating** on the five-year annual series (+18.2% in FY2026) | `01` §3/§6 reads **Decelerating** on the last two reported quarters (Q2 FY27 −15.6%) | **Both kept, neither collapsed — `01`'s own instruction.** "Both statements are true on their own period, and they must not be collapsed into one." The TTM figure is the bridge and is itself modest: **+3.1%** ($6,409.7m vs $6,219.9m), far below the +18.2% the last closed year printed. This is a direct input to the Mixed verdict |
| 10 | **Deferred-revenue basis** | `03` §9: $1,017.1m current + $25.0m non-current at 2026-09-30, "fell from $1,159.9m at 2026-03-31, a $147.3m six-month outflow" — a current-only prior balance against a total-basis change | `02` §2 / `06` §6: total deferred revenue $1,189.6m → $1,042.1m | **`02`/`06` are correct; `03`'s sentence mixes bases (§15 matched-basis).** The correct statements, both from the filing: **current −$142.8m** ($1,159.9m → $1,017.1m) and **total −$147.5m** ($1,189.6m → $1,042.1m) [`Q2 FY27 10-Q, Balance Sheets p.2 and Note 3`]. The direction — a shrinking forward book into a launch — survives on any basis |
| 11 | **FY26 → FY27 EBITDA-margin trend** | `03` §3.2 shows FY2026 11.8% and FY2025 6.7% on the **vendor** basis | `03` §3.3 shows FY2027 guided 13.0% on the **company-defined** basis | **No FY26→FY27 EBITDA-margin trend claim is made in this synthesis, and none should be made downstream.** The two measures differ (the vendor adds back goodwill impairment; the company's excludes impairment of **acquired** intangibles and charges stock-based compensation), and **no company-defined full-year FY2026 EBITDA exists in this pool** because no Q4 FY26 release was admitted. An Unavailable check, not a conflict |
| 12 | **Mixed analyst panels in the Q4 arithmetic** | `05` §5 headline: Street Q4 $1,950.67m vs guidance-implied $1,687.8m (−13.5%) | `08` flag 33: the annual mean comes from a 20-contributor panel, FQ3 from 17 of 22, FQ4 from 15 — the subtraction mixes them | **The 13.5% conclusion survives; the basis is labelled every time it is quoted.** Cross-check: FQ3 3,573.61 + FQ4 1,950.67 + H1 actual 2,987.2 = **8,511.5 against the annual mean of 8,554.69** — a $43.2m (0.5%) panel gap. Material to precision, immaterial to the conclusion |
| 13 | **`04`'s revision-composition claim** | `04` §5: "the cuts came from smaller-revenue models and the raises from larger ones" | `08` flag 32: breadth counts (6↑/9↓ against a +0.4% mean) cannot identify which models moved | **Dropped as unsupported.** What this synthesis carries is the observable and sufficient fact: **FY2027 Net Bookings breadth is negative (6↑/9↓) while the mean level rose 0.4%**, and FQ3 breadth (+8/+10/+7) is the mirror of FQ4 (−8/−8/−7) — analysts redistributing quarters rather than raising the year |

---

## 4. Score Cap Application

| Cap Trigger | Applied? (Y/N) | Affected Score | Final Cap |
|---|---|---|---|
| No consensus / estimate data | **N** | Consensus setup | None. Capital IQ 7-tab pool export, data as of 2026-11-19, revision events to 2026-11-18 — **after** the 2026-11-09 print. The max-30 cap does not bind and must not be borrowed [`00` §5; `04` §7] |
| No cash flow statement | **N** | Earnings quality | None. Audited FY2026 and FY2025 statements, interim six-month statements to 2026-09-30, ~42 quarters of vendor history. The max-45 cap does not bind; 48/100 is set on evidence [`06` §9] |
| No revision history | **N** | Consensus setup | None. `Revisions` (467×21), `Recent Changes` (265×10, latest 2026-11-18) and `Trends` (303×21) tabs all present; breadth reconciles to `ciq_facts.json` exactly. The max-60 cap does not bind |
| No verbatim transcript AND no sell-side proxy | **N** | Earnings clarity | None. **Two verbatim** S&P Capital IQ transcripts with Presentation and Q&A (Q1 FY27 2026-08-07; Q2 FY27 2026-11-09). Tone and candor ARE assessable |
| Transcript role filled ONLY by a sell-side proxy | **N** | Earnings clarity | None. No proxy is used; the transcripts carry no Rating/Target-Price verdict block |
| Only inferred sensitivities | **N on the literal trigger — Low confidence applied anyway on adjudication** | Earnings volatility **confidence** | **Confidence = Low** (not `07`'s stated Medium). The literal cap ("no sensitivity disclosures AND only inferred sensitivities") is avoided because one company-disclosed coefficient exists and is used (FX, ±4.0% of revenue per 10% USD move, restated in `FY26 10-K Item 7A` and `Q2 FY27 10-Q Item 3`). But that row is the **least material** one: it is excluded from the EBIT ranking, the company declines to size its own stated local-currency cost offset, and realised FX has moved revenue by **$9.9m or less in every disclosed period** against a ±$323.2m hypothetical bound. Every row that drives the 78/100 is inferred, and the top-ranked row is Low confidence on **both** coefficient and move size. The **score stays 78** (`07`'s band reasoning holds: the dominant variable is the company's own release calendar, not an external one, so the 81–100 "dominated by external variables" band does not fit) — but 78 is a **floor**, because the five co-moving variables in `07` §5 are never sized as one joint adverse case, so the ranked single-variable impacts understate the correlated tail |
| *(additional)* No quarterly data | **N** | Earnings clarity | None. ~42 standalone quarters (Jun-2016 → Sep-2026) plus two 10-Qs. The max-60 cap does not bind |
| *(additional)* No segment-level P&L for a multi-segment business | **N** | Earnings clarity | None. The company discloses **one operating and reportable segment** [`FY26 10-K, Note 21`] — the single-segment path, not a disclosure gap. Revenue IS disaggregated on four axes (content / platform / channel / geography); **costs are disclosed on none of them**, which is a stated limitation, not a cap trigger |
| *(additional)* Conflicting sources not reconcilable | **N — explicitly not applied** | Overall usefulness | None. All three vendor-vs-filing conflicts were genuinely reconciled: (i) gross profit — the vendor reclassifies asset writedowns out of cost of revenue, both bases named and the filing used (Q1 FY27 filing-basis gross margin 57.5%, not the vendor's 60.4%); (ii) a $7.4m vendor-internal annual-vs-quarterly EBITDA gap, identified as a vendor restatement difference; (iii) net debt — strict $1,370.4m − $524.2m short-term investments + $391.6m lease liabilities = the vendor's broad $1,237.8m, exactly. **Do not over-penalise a conflict the module resolved.** Usefulness is set at 68 on judgment, above the max-65 cap it does not trigger |
| *(additional)* Consensus present but stale | **N** | Consensus setup | None. Data-as-of 2026-11-19 postdates the 2026-09-30 quarter-end and the 2026-11-09 print. No staleness haircut |

**Caps that DO bind, after adjudication — two, neither from missing data:**
1. **Earnings volatility confidence → Low** (reasoning above). The score itself is unchanged at 78 and is a floor.
2. **The verdict is capped at "Mixed earnings setup"** by the Critical evidentiary flag (§13: a critical flag caps unless explicitly resolved by primary evidence; §11: data sufficiency caps conviction). No primary evidence resolves it — the deciding title launched on this report's date.

**Most restrictive rule applied where caps overlap:** none overlap. No data-availability cap binds anywhere in this module, which is itself the finding — the limitation is evidentiary about a future event, not a gap in the pool.

---

## 5. Earnings Setup Summary

### Revenue Setup

The current trajectory is not sustainable in either direction, because neither reported quarter nor the next guided one is a run-rate — and that is a disclosure-grounded read, not a hedge: `02` §3b and `03` §1b reach it independently. **(a) One-time effects are large and run both ways.** The last two quarters are a lapping effect by construction — four prior-year launches annualising out account for 86% of the fall — while the FY2026 base against which FY2027 growth is measured itself contained a launch-year effect now reversing (Color Block Jam, released November 2024, added $206.6m to FY2026 revenue and cost $31.4m in Q2 FY27). M&A contributed **zero** revenue in FY2026 and H1 FY27; FX has never moved annual growth by more than ±0.2pp. **(b) The single factor that flips direction** is GTA VI sell-through on the Net Bookings basis: a 10% shortfall against the Q3 guided midpoint is $342.5m = 4.2% of the FY27 guided Net Bookings midpoint of $8,100m, a 20% shortfall 8.5% — and more than the entire year's guided growth ($1,379.0m) sits inside that one quarter's guided step-up ($1,667.9m, 120.9%). **(c) Reported and underlying tell different stories, and the gap is sized:** the narrowing deferral wedge ($186.7m → $104.3m) added **+4.65pp** to reported GAAP revenue growth, so GAAP fell 15.6% while bookings fell 18.3% — a 2.7pp understatement caused by recognition, not trading. For FY2027 as a whole that wedge is guided at only ~$20m (0.2% of the $8,080m GAAP midpoint), so the two bases should converge over the year.

### Margin Setup

Current margins are neither a peak nor a trough — they are a **release-cycle artefact**, and the company's own guidance says so. **(a)** Q2 FY27's +220bps of gross-margin improvement came from "lower amortization of capitalized software and development costs primarily due to the timing of releases" — margin improved *because nothing shipped*, which reverses on launch; FY2027 gross margin is already guided to 53.72% from 57.23% (−351bps) and Q3 to 49.5%, about 801bps below Q2's 57.5%. **(b)** The driver that takes the largest bite if it moves 10–20% adversely is the **revenue denominator in the launch quarter**, not a cost line: at the Q3 guided structure each $1 of revenue carries $0.4946 of EBIT (1 − 1,690.5 ÷ 3,345), so a 10% shortfall is −$165.4m of EBIT, about 39bps of EBIT margin per 1% of revenue — and at the opposite bound, with cost-of-revenue **dollars** held at the guided $1,690.5m, the coefficient is $1.00, making a 20% shortfall −$669.0m rather than −$330.9m. The truth sits between the two bounds and is not disclosed; a miss is therefore worth 1.0x–2.0x a beat. **(c)** On protection mechanisms the hedged finding travels intact: there is **no contractual pass-through** — business-model `06_value-chain` records 0% of revenue under a disclosed escalator, indexed-pricing or cost-plus clause, and the platforms retain discretion over their own fees — **but that is a fact about contracts, not a measurement of realised recovery.** Realised absorption is measurable and real: product costs fell 160bps of revenue across FY2026 and a further 110bps across H1 FY27 through platform mix and an unquantified direct-to-consumer channel. The price lever is release-timed and runs the wrong way after launch: price can be raised only at a launch (GTA VI at $80 against the $70 norm) and the company describes **cutting** wholesale prices "typically three to nine months after a product's initial launch."

### Quality Check

**(a)** The largest gap between reported and economic earnings is the **content asset**: $716.3m of cash went into software development and licences over the TTM against only $411.9m charged as amortisation — a $304.4m gap, which is the arithmetic reason $724.9m of EBITDA converted to $62.6m of reported free cash flow. It is **widening**: the capitalisation rate rose from 10.53% to 12.29% of revenue (H1 FY26 → H1 FY27) and the balance grew 9.8% in six months to $2,577.3m while revenue fell 7.5%. **(b)** The adjustments are **not genuinely one-time, and the company is candid about the build rather than opaque**: stock-based compensation ($90.0m in the quarter, $462m guided for FY2027), acquired-intangible amortisation, the deferred-revenue timing effect and acquisition-related expenses appear in **every** period disclosed — and the acquisition-related line still ran $3.8m in the half, four and a half years after the Zynga deal closed. Two "one-off" lines also **reversed** in FY2026 (business reorganisation +$4.4m credit, software-development impairment +$1.0m recovery), a $189.4m year-on-year swing against FY2025's $184.0m of combined charges, which flattered the FY2026 operating-income improvement with no operating cause — and FY2026 is the base for every FY2027 comparison. **(c)** For normalised next-year earnings I would start from **GAAP and add back only acquired-intangible amortisation**, because that is the one large add-back that is genuinely purchase accounting being consumed. I would **not** start from the management-reporting basis the Street scores: stock-based compensation is 32.5% of Q2's $277.1m and 29.5% of the derived FY27 $1,565m midpoint, and the deferred-revenue add-back was +$104.3m for the quarter but **−$43.7m for the half** — so roughly 30% of the market's own yardstick is non-cash by construction and part of the rest is billing timing.

### Consensus Bar

**(a)** To beat the current bar by a material margin the company has to clear its own plan by about 9.6% on the Q3 Net Bookings line (≥3,752.3 against a $3,425m guided midpoint) — a margin reached once in four quarters (+11.6% in Q3 FY26) — **and** then raise the FY2027 range so its top sits at or above 8,554.7, because a simple reiteration leaves a Q4 of $1,687.8m against the Street's $1,950.67m. In practice that means GTA VI sell-through materially above the undisclosed assumption inside guidance, plus the Q3 recurrent-spending guide of +12% (a 21-percentage-point turn from the realised −9%) actually landing. **(b)** The bar is most likely set incorrectly **at the full year and in Q4** rather than in the launch quarter: breadth is strongly positive for FQ3 (+8/+10/+7) and the mirror image for FQ4 (−8/−8/−7), yet the FQ4 mean still sits 15.6% above the guidance-implied figure. The bar is probably set **correctly** on Q3 management-basis EBITDA, where consensus is within 0.2% of the derived guidance midpoint, and it is **not meaningfully set at all** on GAAP EPS — nine contributors, a 5.0x high/low spread, and the gap sitting below the EBITDA line. **(c)** How much of consensus rests on something that could reverse: not a macro tailwind — there is no commodity input, the company states no material interest-rate exposure with no borrowings drawn, and realised FX has moved revenue by $9.9m or less in every disclosed period. The exposure is to a **single one-off event**: both the guidance and the consensus were set before any sell-through existed, resting on pre-orders management described only as "tracking far in excess of our initial expectations", with no preorder count, unit figure, price or attach rate anywhere in the pool and the tie ratio explicitly declined.

---

## 5b. Leverage & Capital Structure

Leverage is within normal range and did not change materially during the period — no dedicated treatment required.

*For the record (neither trigger fires, figures carried so the basis is not lost):* net debt / LTM EBITDA at 2026-09-30 is **1.89x on the strict basis** ($1,370.4m ÷ $724.9m) and 1.71x on the vendor's broad basis ($1,237.8m), both below the 3.0x Trigger-A line; the direction over the last twelve months is **down**, from 5.81x at FY2025 and 1.23x at FY2026 year-end, so the +1.0x Trigger-B test is not met either; total debt per the filing's own debt note is flat at $2,518.0m (FY2026) → $2,519.8m (2026-09-30), far short of the +50% test; and strict-basis net debt moved $972.5m → $1,370.4m (+41%), short of the 2x test. Strict basis = total debt per the debt note (senior notes plus convertible notes; lease liabilities of $391.6m excluded) less cash and equivalents of $1,149.4m [`Q2 FY27 10-Q, Note 10 (Debt)` and `p.2`]. Canonical net debt is the `balance-sheet-survival` module's output, not this one's.

---

## 6. Key Numbers

Each figure carries its basis and, where it is a headline aggregate, its build (§15).

- **Revenue growth — GAAP total net revenue:** Q2 FY27 **−15.6%** ($1,497.0m vs $1,773.8m); TTM to 2026-09-30 **+3.1%** ($6,409.7m vs $6,219.9m); FY2026 **+18.2%** ($6,656.4m vs $5,633.6m, of which FY2023's +52.6% was the Zynga acquisition, not organic). **On the Net Bookings basis** Q2 FY27 was **−18.3%** ($1,601.3m vs $1,960.5m); the 2.7pp difference is the deferral wedge, worth **+4.65pp** ($82.4m ÷ $1,773.8m) [`01` §2–3; `02` §6.3].
- **EBITDA margin — four bases, never mixed.** Q2 FY27: company-defined non-GAAP **6.2%** ($92.2m), vendor-computed **5.1%** ($75.9m), management-reporting **18.5%** ($277.1m). TTM vendor **11.3%** ($724.9m ÷ $6,409.7m). FY2027 guided: non-GAAP as printed **$1,024–1,082m** (midpoint $1,053m = 13.0% of the $8,080m GAAP revenue midpoint); management-basis **derived $1,536–1,594m** (midpoint $1,565m = 1,024 + 47 deferred + 462 stock compensation + 3 other, through the `04` §0 bridge). No company-defined FY2026 full-year EBITDA exists in this pool, so no FY26→FY27 margin trend is stated [`03` §3.3; `04` §2.1; `06` §11].
- **EBIT margin, filing basis:** Q2 FY27 **−7.8%** ($(117.5)m), from −5.5% a year earlier = **−232bps**, reconciled to 0bps residual (gross margin +220bps; operating-expense ratio −452bps) with the causal split **+1,450bps of cost-dollar relief against −1,683bps of denominator drag**. FY2027 guided **+3.1%** ($252.5m = 8,080 − 3,739.5 − 4,088); Q3 FY27 guided **+14.4%** ($482.5m) [`03` §7, §7a; `07` §2].
- **EPS:** GAAP diluted Q2 FY27 **$(0.29)**; TTM **$(1.29)**; FY2026 **$(1.62)**. FY2027 guided GAAP diluted **$0.57–0.75 (midpoint $0.66)** against consensus **$1.9057** (14 of 18 contributors) = **+189%**, which `04` itself calls the lowest-quality gap in its table. Management-reporting Q2 FY27 **≈$0.99** derived (pre-tax (111.9) + 101.9 + 90.0 + 153.0 + 3.7 − 9.4 = 227.3; × 0.82 at the 18% management tax rate = 186.4; ÷ 188.0m shares), against the vendor's recorded actual of **$1.00** [`01` §4; `04` §3.1; `06` §7].
- **CFO / EBITDA (cash conversion, vendor EBITDA basis):** TTM **50.6%** ($367.1m ÷ $724.9m); the series runs **38.4% / 0.2% / −3.7% / −11.9% / 79.2% / 50.6%** across FY2022–FY2026 and the TTM — below 50% in four of six periods. **FCF (CFO − total capex, §15):** TTM **$62.6m reported** ($367.1m − $304.5m) and **up to $154.4m normalised** excluding the one-off $91.8m London building (a ceiling — the cash element is not separately disclosed), against **$181.0m** a year earlier. Negative FCF in three of five fiscal years [`06` §1–2].
- **Biggest driver, current level:** Grand Theft Auto VI — **zero reported history** (launched 2026-11-19). Q3 FY27 Net Bookings guided **$3,350–3,500m** against $1,757.1m = +90.6% to +99.2%; guided step-up **$1,667.9m** = **120.9%** of the FY2027 guided step-up of $1,379.0m. The FY step-up decomposes exactly: H1 realised −$396.4m + Q3 guided +$1,667.9m + Q4 implied +$107.5m = +$1,379.0m, **residual $0.0m** [`07` §4].
- **Consensus gap (Net Bookings basis — the metric the Street scores):** FY2027 **8,554.69** (20 of 29) vs guidance $8,000–8,200m = **+$454.7m (+5.6%) vs midpoint, +$354.7m (+4.3%) above the TOP**; lowest of 20 estimates 8,112, above the $8,100m midpoint. Q3 FY2027 **3,573.61** (17 of 22) = **+4.34% vs the $3,425m midpoint, +$73.6m (+2.1%) above the $3,500m top**. The one unstretched line: Q3 management-basis EBITDA **965.28 vs a derived guidance midpoint of 963.5 (+0.2%)** [`04` §3.1–3.2].
- **Estimate revision direction — level and trend disagree, both carried:** FY2027 Net Bookings level **+0.4% over three months** while breadth is **negative 6↑/9↓**; FQ3 breadth +8 / +10 / +7 against FQ4 **−8 / −8 / −7**; FY2027 EPS Normalized **−13.3% vs six months ago** (7.95 → 6.89), FY2027 GAAP EPS **−46.8%** (3.59 → 1.91), FY2027 management-basis EBITDA **−4.1% over three months** (1,765.43 → 1,692.79); FY2028 revenue / EPS / EBITDA all cut last month (−2.6% / −2.5% / −2.0%) [`04` §4–5].
- **Earnings volatility score: 78/100, INVERTED (higher = worse), confidence Low** (adjudicated). Top variable $248.2m average absolute FY27 GAAP EBIT impact — 2.4x the second ($105.0m), 4.5x the fifth ($55.0m), and 4.0x the second at the fixed-cost bound ($417.3m). 78 is a floor: the five co-moving variables are never sized as one joint case [`07` §3, §5, §7].
- **Quality exposure:** capitalised software development and licences **$2,577.3m** at 2026-09-30 ($82.4m current + $2,494.9m non-current), of which the unreleased split is **not disclosed**; at 2026-03-31 **$2,149.7m of $2,346.3m (91.6%)** sat on unreleased titles = **61% of $3,510.9m equity**. Content cash in $716.3m vs amortisation charged $411.9m = a **$304.4m** gap (TTM) [`06` §6, §10].

---

## 7. What Would Change The Earnings Verdict?

| Current Verdict | What Would Upgrade It | What Would Downgrade It | Data Needed |
|---|---|---|---|
| **Mixed earnings setup** | **To "Earnings inflecting — positive (driver: GTA VI sell-through and the attached Ultimate Edition recurrent spend)":** (i) Q3 FY27 Net Bookings at or above **3,752.3** (≥+9.56% over the company's own $3,425m midpoint) **with** cost of revenue inside the guided $1,649–1,732m on revenue inside $3,270–3,420m — proving the "greater of" amortisation floor is not binding; (ii) the FY2027 Net Bookings range **raised** so its top sits at or above 8,554.7, or Q4 FY27 initiated with a midpoint ≥1,950.7; (iii) Q3 recurrent spending at or above the guided +12% YoY, showing the launch-attached add-on converting; (iv) nine-month FY27 CFO on a run-rate consistent with H2 above **$1,173.5m** (vs H2 FY26's $540.6m, 2.17x), which would start repairing the 50.6% conversion rate | **To "Earnings inflecting — negative":** (i) Q3 FY27 Net Bookings at or below **3,466.4** — note this sits **inside** the guided range, so the company can deliver its plan near the top and still print a material consensus miss; (ii) **an impairment appearing inside cost of revenue** against the $2,577.3m balance, the mechanism that already produced $43.4m in Q1 FY27 and whose historical range reaches $109.9m — measured against a *smaller* unreleased base, so a floor not a cap; (iii) Q4 FY27 initiated with a Net Bookings midpoint **≤1,862.8**, or FY2027 simply reiterated, which mechanically implies a Q4 13.5% below the Street with no operational disappointment required; (iv) recurrent spending missing its guide a second quarter running; (v) **a large GAAP-EPS "beat" delivered through the tax line** — a release of the 86.8% deferred-tax valuation allowance or the November-2026 intangible reorganisation would close the +189% consensus gap with a non-cash, non-operating credit, which is a downgrade to earnings *quality* even as it looks like a beat | **Ranked, and the first is decisive.** (1) **GTA VI sell-through: units, price and attach/tie ratio** — currently absent in every form (no preorder count, no unit figure, no price-times-volume build, no comparable launch quarter in the pool, no alternative-data panel; management declined the tie ratio). (2) **The unreleased-title split of the $2,577.3m balance at 2026-09-30** — verified absent from the 10-Q, so today's impairment exposure is genuinely Not assessable. (3) **An FY2026 quarterly content split**, without which the FY2027 "recurrent spending flat" guide cannot be tested against the realised −9% and the guided +12%. (4) **A company-defined full-year FY2026 EBITDA** (no Q4 FY26 release admitted), without which no like-for-like FY26→FY27 EBITDA-margin comparison exists. (5) Q3 FY26 and Q4 FY26 filings — both quarters are vendor-constructed, which is why one of the four surprise observations is derived |

**Constraint check (template rule).** The "consensus setup Unknown → cannot be Earnings accelerating" constraint does **not** bind here: consensus is present, fresh (data as of 2026-11-19) and basis-resolved, and the consensus setup score is a real 33/100, not Unknown. The verdict is nonetheless not directional — for the reasons in §3 rows 1–2, which are evidentiary and substantive rather than a consensus gap.

---

## 8. Note To The Final Synthesizer

**Severity verdict, reported verbatim and not overridden: `08_earnings-red-flags` returns "Critical concerns"** — 39 triggered flags (1 Critical, 9 High, 19 Medium, 10 Low), plus 1 Unclear and 2 Unavailable checks. Its own characterisation travels too: the distribution is heavily Medium "because the upstream work is unusually well-documented — most Medium rows are findings the agents got right and that must not be averaged away, not defects."

**Forensic tags, propagated as standalone lines (CLAUDE.md §13; `06` emitted both, and they are escalated here as named flags, NOT as inputs already priced into the 48/100 quality score):**

- `RF-EQ-001 (rising accruals divergent from cash earnings)` — four of six accrual rows fire. The two that carry weight: capitalised-cost intensity rising 10.53% → 12.29% of revenue with the balance up 9.8% in six months while revenue fell 7.5%; and a forward book falling (total deferred revenue −17.8% YoY, deferred-revenue days 71.8 → 65.2 → 59.3). The inventory trigger is a $26.8m physical-launch build and the revenue-vs-CFO trigger is historical (FY2024–FY2025, reversed in FY2026).
- `RF-EQ-002 (cash-conversion breakdown)` — CFO/EBITDA below 50% in four of six periods and at 50.6% in the TTM; negative FCF in three of five fiscal years. The cause is identified and is **not fraud**: $716.3m of cash into content against $411.9m amortised (a $304.4m gap), plus a payables-and-accruals outflow in every year of the series.

**The dominant trend and its driver — what the scores mean.** This is not an earnings trend at all; it is a single-product event wearing an earnings module's clothes. Classify it under §14 as **company-specific, single-product-event**, not a trend read. The realised evidence is a release-cycle trough caused by four prior-year launches lapping, with no single title reaching half the move; the forward evidence is one unshipped title carrying 120.9% of the whole year's guided growth. Neither period is a run-rate, and both specialists who looked say so independently.

**Whether earnings are clean and cash-backed.** Clean in disclosure, weak in cash. There is no fraud signal anywhere in this pool: Ernst & Young unqualified continuously since at least FY2017, no auditor change, no restatement, the only policy adoption disclosure-only, the $215.0m receivables-purchase facility **disclosed but not used** in FY2026 or H1 FY27, and the company publishes the entire line-by-line build of both its non-GAAP measures — which is why the vendor's fields reconciled to the cent on two consecutive quarters. What is weak is conversion, and it has been weak for most of a cycle rather than one year. The honest asymmetry: the cash risk on the content asset is already taken and visible; the earnings risk is deferred and sits inside one unverifiable management estimate.

**The consensus bar — read the level AND the trend.** The level is above what management underwrote on both the year and the quarter; the trend has been cut 13–47% over six months. Those point opposite ways and the score reflects both. The most actionable single line in the module needs no forecast at all: reiterating FY2027 on **2027-02-09** mechanically implies a Q4 13.5% below the Street's own number.

**Next-quarter setup and the look-ahead.** Q3 FY27 favors miss *on the bar* — and the bar was set before any sell-through existed, so this is not a prediction about the title. **Q4 FY2027 looks worse and for a more measurable reason:** the Street's $1,950.67m against a guidance-implied $1,687.8m, FQ4 breadth already deeply negative, the company's own practice of cutting wholesale prices "typically three to nine months after a product's initial launch" landing squarely in that window, Q4 management-basis operating expenses implied up ~10% "mostly being driven by increases in R&D", and an FY27 cash-flow floor that requires H2 CFO above $1,173.5m against $540.6m a year earlier. Visibility beyond that is genuinely absent: management refused FY2028 guidance and would say only that it expects "to set a new baseline for performance going forward" — the size of the recurring post-launch tail is **not proven from available data**.

**Top sensitivity variable and its current direction.** GTA VI sell-through, direction **unproven — neither favourable nor adverse**, because no reported period contains a dollar of it. Two of the five EBIT-scale variables are, however, already moving adversely before the launch result is known: FY2027 gross margin is guided −351bps and was revised a further −130.6bps between the two FY2027 outlooks, and the impairment mechanism fired twice in two quarters.

**Biggest risks — every Critical and High flag from `08`, carried, none silently omitted (1 Critical + 9 High):**

1. **[Critical] The primary driver has zero reported history and no in-pool base rate.** GTA VI launched 2026-11-19; no preorder count, unit figure, price-times-volume build or attach rate exists; no comparable launch quarter is in the pool (vendor quarterly history starts Jun-2016, GTA V launched Sep-2013); no alternative-data panel exists; management declined the tie ratio. This is the cap on the verdict, and it is evidentiary, not an upstream error.
2. **[High] Do not let the 117.1% mitigation offset travel as realised.** It is measured between two **guidance** tables (guided gross profit −$61.5m, guided operating expenses −$72.0m, guided EBIT +$10.5m). Carry the zero-mitigation bound as the bound and 117.1% as management's **plan**. The module's genuine §9 realised offset is elsewhere and smaller: product costs −160bps of revenue across FY2026 and −110bps across H1 FY27.
3. **[High] Earnings-volatility confidence is Low, not Medium** — six of seven coefficients are inferred and the one disclosed row is the least material. The 78/100 score is a floor because the correlated bear is unsized.
4. **[High] A hedged upstream finding hardened on the pivotal claim and has been corrected here.** `03` §9's "firm company commitment / demand sign dominates" is **not** carried; `03` §8's hedged form is.
5. **[High] `RF-EQ-002` is a §13 escalation trigger, not an input already absorbed into 48/100** — propagated above as a standalone line, with `RF-EQ-001`.
6. **[High] The mechanism behind the +189% FY2027 GAAP-EPS gap is a tax mechanism, and it belongs here — DECISION: include.** `04` could only locate the gap as "tax and non-operating items"; business-model `12_red-flags-sweep` names it. The company has written down **$1,262.3m of $1,454.8m of gross deferred tax assets (86.8%)** on its own stated "cumulative loss position, which provides significant negative evidence", recognising a $135.3m tax expense from the increase in that allowance; it printed a **(50.8)% effective rate in FY2026** (a $100.4m tax charge **on a pre-tax loss**); and it completed a **November-2026 reorganisation of certain intangible assets** "to simplify our global operating structure" whose effect it says it is **still evaluating** — and that reorganisation lands **inside Q3 FY2027** [`FY26 10-K, Note 17 (Income Taxes)` and `MD&A — Provision for income taxes, p.46–47`; `Q2 FY27 10-Q, Note 16 (Subsequent Events)`]. It cuts both ways and must be stated as such: a valuation-allowance release after a successful launch would close that gap with a very large **non-cash** credit that is not operating performance. **Consequence for the master layer: treat any large GAAP-EPS beat as uninformative, and do not read "guidance far below the Street" as proof of a high operating bar.** This is also why `05` refused to set a GAAP-EPS threshold at all.
7. **[High] Platform-agreement renewal and termination exposure — DECISION: include, with the softener travelling.** The Sony agreement **"expires on March 31, 2027"** (the last day of FY2027) with automatic one-year renewals, and "Sony may terminate the agreement for any or no reason upon 30 days' notice"; the current-generation Xbox licence was **replaced effective 2026-09-17** by an agreement whose Initial Term, Renewal Term, notice window and Royalty Percentage are all redacted `[***]`, with a Microsoft right to terminate "without cost or penalty on a Game-by-Game or country-by-country basis" [`FY26 10-K, Item 1 — Arrangements with Platform Manufacturers, pp.3–4`; `Q2 FY27 10-Q, Exhibit 10.1, §17.1, §17.2, §18.10`, via business-model `12`]. Console was **41.4% of H1 FY2027 net revenue** (business-model `05` records the expiring console licences at **39.0% of FY2026 revenue** — two different period bases, both named), and the GTA VI launch is **console-only at release**. **The qualifier is mandatory: because renewal is automatic, this is a renegotiation and termination-right exposure, not an expiry event** — low probability, high impact, and it matters most for the FY2028 read `05` already calls the weakest. The earnings module listed platform gatekeepers as "High tail, zero realised" and named no date, renewal mechanism or termination right; it must not be re-lost.
8. **[High] Capitalised costs rising as a share of revenue** — 10.53% → 12.29%, balance +9.8% in six months while revenue fell 7.5%. The largest accrual flag; correctly sized upstream and not to be averaged away.
9. **[High] Earnings dominated by one variable** — top row 2.4x the second, 4.0x at the fixed-cost bound. This is what makes it a single-event setup rather than an earnings trend.
10. **[High] The setup depends on a guidance raise, not just a beat** — the fully testable 2027-02-09 line described above.

**Medium and Low flags, aggregated (discretion exercised, with the two forensic tags above exempt from it).** The 19 Medium rows cluster into five themes already carried in §3, §5 and §6: content-asset sizing (under-counted, three objects, current unreleased split undisclosed); consensus trap mechanics (negative breadth with a rising mean; level vs trend; SG&A savings explicitly attributed to timing against Q3 operating expenses guided +21% YoY); non-GAAP construction (stock compensation ~30% of the yardstick the Street scores; the deferred-revenue add-back sign-flipping +$104.3m for the quarter and −$43.7m for the half; a $331.1m adjusted-vs-reported step = 22.1% of quarterly revenue; the $189.4m reserve-reversal swing that flattered FY2026); forward-book and concentration (deferred revenue −17.8% YoY; five customers 80.6% of FY2026 revenue with four each above 10.0%); and base-rate weakness (a four-observation surprise sample with one derived period, magnitude collapsing, regime change — `05` weights it **Low** and that weighting must not be upgraded). The 10 Low rows are the §15 hygiene corrections adjudicated in §3 (the deferred-revenue basis mix, the unlabelled revision-composition inference, the mixed analyst panels at a verified 0.5% gap, the vendor leg of the YoY deferred-revenue magnitude, the whole-balance amortisation attribution, the null `realised_offset_pct` fields in the sidecar) plus the TTM-vs-annual growth contrast, the vendor-constructed Q3/Q4 FY26 quarters, the filing-vs-management disagreement on consumer spending (the filing wins on the historical claim under §4), and the out-of-scope positioning data. The single **Unclear** flag is substantive and carried: the FY2027 "recurrent spending flat" guide **cannot be tested**, because no FY2026 quarterly content split exists in the pool — a 21-percentage-point one-quarter swing is being underwritten on an untestable full-year assumption. State it as untestable; do not estimate it.

**Which partial-data cap applied and what it limits.** **None from data availability** — that is the finding. The pool is strong (30 sources, 0 extraction failures, audited FY2026 10-K, Q2 FY27 10-Q, two verbatim transcripts, a 7-tab consensus export refreshed the day before this run, a current price). Two caps bind on adjudication instead: earnings-volatility confidence → Low, and the verdict capped at Mixed by the Critical evidentiary flag. The "conflicting sources → usefulness max 65" cap is **explicitly not applied** because all three vendor-vs-filing conflicts genuinely reconciled. Do not borrow an absent-data cap for data that is present.

**Biggest missing data point — one item, not ten.** GTA VI sell-through in any quantified form: units, price realised, or attach/tie ratio for the launch window. Everything else on the list is second-order. Note what this costs: not a weaker estimate, but the inability to form a directional earnings view at all.

**Two housekeeping items for the master layer.** (i) The vendor's recommendation distribution and target prices are stripped under §24 and are **not** restated in this synthesis; the legitimate field is the analyst count (29). (ii) "Favors miss" is a statement about the bar, not a stock call — the pool's positioning data (4.96% short interest) is out of this module's scope and was used by no agent.

---

## 9. Simple Summary

- **Revenue trend and driver.** Falling now, guided to roughly double next quarter. The fall is four prior-year game launches lapping (−13.4pp of a −15.6pp quarter, 86% explained, no single title reaching half); the jump is one game — Grand Theft Auto VI — that went on sale today and is in no reported figures.
- **Margin trend and driver.** Gross margin rose 220bps *because nothing shipped*, while EBIT margin fell 232bps because revenue fell $276.8m. The company cut $257.3m of cost in the quarter and still lost margin. Full-year gross margin is already guided down 351bps.
- **Are earnings clean?** Honest and fully disclosed, but weakly backed by cash. Cash conversion is 50.6% and has been under 50% in four of six periods. $2.6bn of game development sits on the balance sheet, $2.1bn of it on games not yet released at the last annual date — 61% of shareholders' equity.
- **Is the consensus bar beatable?** Hard. The Street's full-year bookings number sits 4.3% **above the top** of management's own range, and the company just missed its own quarterly guidance. But estimates have also been cut 13–47% over six months, so the bar has come down even as it sits above guidance.
- **Next-quarter setup.** Favors miss — mostly arithmetic. Take-Two can deliver its own plan at the top of the range and still miss the Street by 2.1%, and simply repeating its full-year guidance in February implies a March quarter 13.5% below what analysts have.
- **Biggest sensitivity variable.** GTA VI sales. It is 2.4 times the next-largest variable, and up to 4 times it if costs do not flex. Its direction is unproven, not good or bad.
- **Earnings volatility level.** High and inverted: 78/100 where higher is worse, confidence **Low**, and 78 is a floor because five of the seven variables move together on the same event and nobody has sized that combination.
- **Is this module useful for the master synthesizer?** Yes, with one boundary. It gives a precise bar, a dated and testable trigger (2027-02-09), a measured quality read, and one named variable. It cannot tell you how many copies of a game will sell — and that, not any data gap, is why the verdict is mixed rather than directional.



---

## earnings / 00_earnings-data-triage.md

_Source: `00_earnings-data-triage.md`_

# Earnings Data Triage — TTWO

**Evidence binding (MODULE_PIPELINE Step 1.5).** `NOSTRA_FROZEN_EVIDENCE_ROOT` is set and the full quartet is present and consistent (`NOSTRA_FROZEN_POOL_DATA_PATH`, `NOSTRA_FROZEN_POOL_OUT_DIR`, `NOSTRA_FROZEN_POOL_GENERATION`, `NOSTRA_FROZEN_EVIDENCE_ROOT`). This run therefore operates in **frozen supervisor-verified read mode**: the extractor was NOT run, the live logical path `data/TTWO/` was NOT read, and every manifest / corpus / CIQ-facts / relationships / extract read resolved inside the single bound generation `.extract-generations/0af638492ecb0521db2676c79d75e6940c7227bb9f192567527b8a57eb43203d/`. `data/TTWO/` below is a citation label only.

**Manifest totals (frozen generation):** 30 sources · 19 workbooks · 62 tabs · 73 extracts written · **0 failures**. No source carries status `fail`, `fallback-text`, `missing-dependency`, or `gdrive-pointer`. No `external/` subfolder exists in the pool, so there is no external-data section.

**Period rule (fix F23).** Every "Period Covered" below is parsed from INSIDE the document (the cover-page fiscal-period line, the "as of" row, or the latest dated column). The filesystem mtime on every frozen file is `2026-11-19 18:43` — that is the evidence-freeze timestamp, not a period signal, and it is used nowhere in this report.

---

## 0. Jurisdiction & Reporting Regime

| Item | Detected Value | Evidence |
|---|---|---|
| Primary listing country | United States | `FY26 10-K, cover page` ("UNITED STATES SECURITIES AND EXCHANGE COMMISSION"; Delaware incorporation; 110 West 44th Street, New York) |
| Exchange | NASDAQ Global Select Market (NasdaqGS: TTWO) | `Q2 FY27 earnings release, 2026-11-09, p.1` ("NASDAQ:TTWO"); `Capital IQ Financials_Quarterly export, Income Statement tab` header ("NasdaqGS:TTWO") |
| Filing regime (US SEC / India SEBI-LODR / UK / Other) | **US SEC** — Form 10-K (annual), Form 10-Q (quarterly), Form 8-K Exhibit 99.1 (earnings release), DEF 14A (proxy). Commission file number 001-34003 | `FY26 10-K, cover page`; `Q2 FY27 10-Q, cover page`; `TTWO 2Q27 Earnings Release, p.1` ("Exhibit 99.1") |
| Reporting standard (US GAAP / IFRS / Ind AS) | **US GAAP** | `Capital IQ Estimates export, Recent Changes tab` header ("Acctg. Standard: US GAAP"); `Q2 FY27 earnings release` presents GAAP and separately labelled non-GAAP (EBITDA, Net Bookings) |
| Reporting currency | **USD** (US dollars, millions) | `Capital IQ Financials_Annual export, Income Statement tab` ("Currency: Reported Currency … In Millions; USD"); `ciq_facts.json` → `currency: USD` |
| Fiscal-year end | **31 March**. Latest closed FY = FY2026 (ended 2026-03-31). Current FY = FY2027 (ends 2027-03-31) | `FY26 10-K, cover page` ("For the fiscal year ended March 31, 2026"); `Capital IQ Estimates export, Guidance tab` header ("Current Fiscal Year End: Mar-31-2027") |
| Interim reporting basis (CLAUDE.md §27) | **Standalone three-month quarter** (US 10-Q). Q2 FY27 = the three months ended 2026-09-30, with six-month cumulative shown alongside. A vendor "next quarter" estimate maps directly onto a standalone quarter here — no cumulative-stub restatement needed | `Q2 FY27 10-Q, cover page` ("For the quarterly period ended September 30, 2026"); `Capital IQ Financials_Quarterly export, Income Statement tab` ("Period Type: Quarterly … 3 months") |
| Document language(s) | English only (all 30 sources) | All extracts in the frozen generation are English |

**Downstream source map (no US-form gap exists).** This is a US domestic filer, so the §4 / §27 tiers resolve to their US names directly: audited annual = 10-K; interim = 10-Q; material-event / earnings = 8-K Ex. 99.1; proxy = DEF 14A. Do not search for or flag non-US equivalents.

**Basis warning for every downstream agent (carry this forward).** Take-Two reports a GAAP line and a company-defined operational metric that are NOT the same number, and the vendor consensus tracks the operational one:
- Q2 FY27 **Net Bookings $1.60bn** vs Q2 FY27 **GAAP net revenue $1.50bn** [`TTWO 2Q27 Earnings Release, 2026-11-09, p.1 and p.2`].
- The CIQ consensus header on the Q2 FY27 call prints `Revenue (mm) ACTUAL 1601.30` — i.e. the vendor's "Revenue" actual for the quarter is the **Net Bookings** figure, not GAAP net revenue [`Take-Two Interactive Software, Inc., Q2 2027 Earnings Call transcript, Nov 09 2026, S&P Global Market Intelligence Estimates header block`].
- FY27 guidance is issued on **both** bases in one table: GAAP total net revenue $7,980–8,180m and the operational metric Net Bookings $8,000–8,200m [`TTWO 2Q27 Earnings Release, 2026-11-09, "Outlook for Fiscal Year 2027"`].
Any beat/miss, bar-to-beat, or growth comparison must state which basis it is on and must not mix them (§15, no silent basis switch).

---

## 1. File Inventory

30 pool files → 73 inventory rows (11 single-document sources + 62 workbook tabs). Every multi-tab workbook is decomposed; no workbook appears as a single opaque row. "Last Modified" is the freeze timestamp for all rows and is deliberately non-informative (fix F23).

### 1.1 Single-document sources (11)

| Filename | Type | Period Covered (from inside the doc) | Last Modified | Earnings Relevance |
|---|---|---|---|---|
| `10K_2025_26_0001628280-26-037434.pdf` (1,913 KB, 170 pp, native text) | Annual filing (Form 10-K) | **FY2026, fiscal year ended 2026-03-31** (comparatives FY2025, FY2024) | 2026-11-19 freeze | **High** |
| `10K_2024_25_0001628280-25-026694.pdf` (2,803 KB, 274 pp, native text) | Annual filing (Form 10-K) | **FY2025, fiscal year ended 2025-03-31** (comparatives FY2024, FY2023) | 2026-11-19 freeze | **High** |
| `10Q_2Q_0001628280-26-072254.pdf` (999 KB, 72 pp, native text) | Quarterly filing (Form 10-Q) | **Q2 FY2027, quarter ended 2026-09-30** + six months ended 2026-09-30 | 2026-11-19 freeze | **High** |
| `10Q_1Q_0001628280-26-054870.pdf` (538 KB, 38 pp, native text) | Quarterly filing (Form 10-Q) | **Q1 FY2027, quarter ended 2026-06-30** | 2026-11-19 freeze | **High** |
| `TTWO 2Q27 Earnings Release FINAL.pdf` (291 KB, 14 pp) | Earnings press release (8-K Ex. 99.1) — NOT a transcript, NOT a call source | **Q2 FY2027** results, release dated **2026-11-09**; carries FY27 full-year outlook + initial Q3 FY27 outlook | 2026-11-19 freeze | **High** |
| `TTWO 1Q27 Earnings Release FINAL 8-6-2026.pdf` (241 KB, 12 pp) | Earnings press release (8-K Ex. 99.1) | **Q1 FY2027** results, release dated **2026-08-07** | 2026-11-19 freeze | **High** |
| `Take-Two Interactive Software, Inc., Q2 2027 Earnings Call, Nov 09, 2026.rtf` (283 KB) | **Verbatim transcript** (S&P Capital IQ earnings-call transcript: Call Participants + Presentation + Question and Answer). Full trust | **Q2 FY2027 call, 2026-11-09 21:30 GMT** | 2026-11-19 freeze | **High** |
| `Take-Two Interactive Software, Inc., Q1 2027 Earnings Call, Aug 07, 2026.rtf` (294 KB) | **Verbatim transcript** (S&P Capital IQ earnings-call transcript) | **Q1 FY2027 call, 2026-08-07** | 2026-11-19 freeze | **High** |
| `Take-Two_Interactive_2Q FY27 FINAL.pdf` (854 KB, 16 pp) | Investor deck ("Second Quarter Fiscal 2027 Results & Guidance Summary") | **Q2 FY2027** (companion to the 2026-11-09 release) | 2026-11-19 freeze | **High** |
| `Take-Two_Interactive_1Q FY27 FINAL.pdf` (882 KB, 16 pp) | Investor deck ("First Quarter Fiscal 2027 Results & Guidance Summary") | **Q1 FY2027** (companion to the 2026-08-07 release) | 2026-11-19 freeze | Medium |
| `Take Two Interactive Software Inc NasdaqGS TTWO Public Company Profile.rtf` (264 KB) | Data export (CIQ company profile — business description, officers, listing detail) | Profile as-of the 2026-11 export | 2026-11-19 freeze | Low |

### 1.2 Workbook tabs — `Take-TwoInteractiveSoftware,IncNasdaqGSTTWOEstimatesReport.xls` (8,085 KB, 7 tabs)

The single most earnings-critical structured export in the pool. Extraction status `ok` on all 7 tabs.

| Parent file · Sheet | Rows × Cols | Type | Period Covered (from inside the tab) | Last Modified | Earnings Relevance |
|---|---|---|---|---|---|
| EstimatesReport · **Consensus** | 604 × 123 | Consensus / estimate export | FQ1 2000 → **FQ4 2029** and FY history → **FY2029**; forward set includes FQ3 2027, FY2027, FY2028, FY2029 | 2026-11-19 freeze | **High** |
| EstimatesReport · **Recent Changes** | 265 × 10 | Estimate-revision event log (broker, analyst, data point, before/after) | **Latest dated change 2026-11-18**, plus an intraday row (post-Q2 FY27 print) | 2026-11-19 freeze | **High** |
| EstimatesReport · **Guidance** | 198 × 117 | Company guidance history + latest guidance key development | Guidance history FQ2 2002 → **FY2027 / FQ3 2027**; latest guidance event dated **2026-11-09** (Q3 FY27 + updated FY27) | 2026-11-19 freeze | **High** |
| EstimatesReport · **Surprise** | 311 × 113 | Historical estimate-vs-actual surprise | Quarterly and annual surprise series through **FQ2 2027** | 2026-11-19 freeze | **High** |
| EstimatesReport · **Trends** | 303 × 21 | Estimate trend (how the forward number moved over time) | Forward periods incl. FQ3 2027 / FY2027–FY2029 | 2026-11-19 freeze | **High** |
| EstimatesReport · **Revisions** | 467 × 21 | Revision breadth (up/down counts by period) | Last-week / last-month / last-3-month breadth as-of the 2026-11 export | 2026-11-19 freeze | **High** |
| EstimatesReport · **Multiples** | 34 × 7 | Forward valuation multiples (consensus-based) | Forward multiples as-of the 2026-11 export | 2026-11-19 freeze | Low (valuation, not earnings) |

### 1.3 Workbook tabs — `Take Two Interactive Software Inc NasdaqGS TTWO Financials_Quarterly.xls` (530 KB, 13 tabs)

| Parent file · Sheet | Rows × Cols | Type | Period Covered | Last Modified | Earnings Relevance |
|---|---|---|---|---|---|
| Financials_Quarterly · **Income Statement** | 116 × 43 | Quarterly P&L (USD m, reported currency, latest-filings restatement) | **FQ1 2017 (Jun-30-2016) → FQ2 2027 (Sep-30-2026)** — ~42 standalone quarters | 2026-11-19 freeze | **High** |
| Financials_Quarterly · **Cash Flow** | 73 × 43 | Quarterly cash flow statement | Jun-30-2016 → **Sep-30-2026** | 2026-11-19 freeze | **High** |
| Financials_Quarterly · **Balance Sheet** | 98 × 43 | Quarterly balance sheet | Jun-30-2016 → **Sep-30-2026** | 2026-11-19 freeze | **High** |
| Financials_Quarterly · **Ratios** | 161 × 43 | Quarterly margins, returns, working-capital ratios | Jun-30-2016 → **Sep-30-2026** | 2026-11-19 freeze | **High** |
| Financials_Quarterly · **Segments** | 72 × 43 | Segment / geographic revenue split (vendor view) | Jun-30-2016 → **Sep-30-2026** | 2026-11-19 freeze | **High** |
| Financials_Quarterly · **Supplemental** | 35 × 43 | Supplemental items (capex, SBC, D&A detail) | Jun-30-2016 → **Sep-30-2026** | 2026-11-19 freeze | Medium |
| Financials_Quarterly · **Key Stats** | 91 × 13 | Headline stats snapshot | Latest periods through **Sep-30-2026** | 2026-11-19 freeze | Medium |
| Financials_Quarterly · **Capital Structure Summary** | 74 × 85 | Debt / equity composition by quarter | Through **Sep-30-2026** | 2026-11-19 freeze | Medium |
| Financials_Quarterly · **Capital Structure Details** | 38 × 10 | As-reported debt detail (principal × maturity × rate) | Latest as-reported block | 2026-11-19 freeze | Medium |
| Financials_Quarterly · **Historical Capitalization** | 39 × 43 | Market cap / TEV history | Through **Sep-30-2026** | 2026-11-19 freeze | Low |
| Financials_Quarterly · **Multiples** | 91 × 42 | Trailing valuation multiples by quarter | Through the 2026-11 export | 2026-11-19 freeze | Low (valuation) |
| Financials_Quarterly · **Industry Specific** | 15 × 6 | Industry-specific lines (20 populated cells — near-empty) | n/a | 2026-11-19 freeze | Low |
| Financials_Quarterly · **Pension OPEB** | 15 × 6 | Pension / OPEB (20 populated cells — near-empty) | n/a | 2026-11-19 freeze | Low |

### 1.4 Workbook tabs — `Take Two Interactive Software Inc NasdaqGS TTWO Financials_Annual.xls` (309 KB, 13 tabs)

| Parent file · Sheet | Rows × Cols | Type | Period Covered | Last Modified | Earnings Relevance |
|---|---|---|---|---|---|
| Financials_Annual · **Income Statement** | 119 × 12 | Annual P&L (USD m) | **FY2017 (Mar-31-2017) → FY2026 (Mar-31-2026)** + **LTM Sep-30-2026** | 2026-11-19 freeze | **High** |
| Financials_Annual · **Cash Flow** | 74 × 12 | Annual cash flow statement | FY2017 → FY2026 + LTM Sep-30-2026 | 2026-11-19 freeze | **High** |
| Financials_Annual · **Balance Sheet** | 97 × 12 | Annual balance sheet | FY2017 → FY2026 + Sep-30-2026 | 2026-11-19 freeze | **High** |
| Financials_Annual · **Ratios** | 161 × 12 | Annual margins, returns, conversion ratios | FY2017 → FY2026 + LTM | 2026-11-19 freeze | **High** |
| Financials_Annual · **Segments** | 76 × 11 | Segment / geographic revenue (vendor view) | FY2017 → FY2026 | 2026-11-19 freeze | **High** |
| Financials_Annual · **Supplemental** | 67 × 11 | Capex, SBC, D&A, other supplemental | FY2017 → FY2026 | 2026-11-19 freeze | Medium |
| Financials_Annual · **Key Stats** | 91 × 13 | Headline stats snapshot | Through FY2026 / LTM | 2026-11-19 freeze | Medium |
| Financials_Annual · **Capital Structure Summary** | 99 × 23 | Annual debt / equity composition | Through FY2026 | 2026-11-19 freeze | Medium |
| Financials_Annual · **Capital Structure Details** | 38 × 10 | As-reported debt detail by maturity | Latest as-reported block (from 2026-03-31) | 2026-11-19 freeze | Medium |
| Financials_Annual · **Historical Capitalization** | 39 × 43 | Market cap / TEV history | Through the 2026-11 export | 2026-11-19 freeze | Low |
| Financials_Annual · **Multiples** | 90 × 42 | Trailing valuation multiples | Through the 2026-11 export | 2026-11-19 freeze | Low (valuation) |
| Financials_Annual · **Industry Specific** | 15 × 6 | Industry-specific lines (20 cells — near-empty) | n/a | 2026-11-19 freeze | Low |
| Financials_Annual · **Pension OPEB** | 21 × 11 | Pension / OPEB (65 cells — sparse) | Through FY2026 | 2026-11-19 freeze | Low |

### 1.5 Workbook tabs — `Company Comparable Analysis Take Two Interactive Software Inc.xls` (145 KB, 8 tabs)

| Parent file · Sheet | Rows × Cols | Type | Period Covered | Last Modified | Earnings Relevance |
|---|---|---|---|---|---|
| Comps · **Financial Data** | 50 × 17 | Peer + subject financial data; carries subject **Day Close Price $216.61** and **shares outstanding 187.2m**, as-of **2026-11-19** | as-of 2026-11-19 | 2026-11-19 freeze | Medium (price anchor for `99`) |
| Comps · **Trading Multiples** | 50 × 9 | Peer trading multiples (subject TEV/EBITDA 52.2x vs peer median 13.0x) | as-of 2026-11-19 | 2026-11-19 freeze | Low (valuation) |
| Comps · **Operating Statistics** | 50 × 13 | Peer operating stats (growth, margins) | as-of 2026-11-19 | 2026-11-19 freeze | Medium |
| Comps · **Business Description** | 44 × 3 | Peer-set business descriptions | n/a | 2026-11-19 freeze | Low |
| Comps · **Implied Valuation** | 69 × 9 | Implied valuation from peer multiples | as-of 2026-11-19 | 2026-11-19 freeze | Low (valuation, out of module scope) |
| Comps · **Credit Health Panel** | 48 × 10 | Peer credit-health comparison | as-of 2026-11-19 | 2026-11-19 freeze | Low |
| Comps · **Valuation Chart** | 32 × 2 | Chart data (11 cells) | n/a | 2026-11-19 freeze | Low |
| Comps · **Disclaimer** | 26 × 1 | Vendor disclaimer | n/a | 2026-11-19 freeze | Low |

### 1.6 Workbook tabs — `Take Two Interactive Software Inc NasdaqGS TTWO Credit Health Panel.xls` (230 KB, 6 tabs)

| Parent file · Sheet | Rows × Cols | Type | Period Covered | Last Modified | Earnings Relevance |
|---|---|---|---|---|---|
| Credit Health Panel · **Financials** | 40 × 13 | Credit-view financial summary | Through the latest reported period (Sep-30-2026) | 2026-11-19 freeze | Medium |
| Credit Health Panel · **Summary** | 46 × 11 | Credit-health scores / summary | as-of the 2026-11 export | 2026-11-19 freeze | Low |
| Credit Health Panel · **Operational Metrics Charts** | 21 × 19 | Chart data (13 cells) | n/a | 2026-11-19 freeze | Low |
| Credit Health Panel · **Solvency Metrics Charts** | 18 × 19 | Chart data (8 cells) | n/a | 2026-11-19 freeze | Low |
| Credit Health Panel · **Liquidity Metrics Charts** | 15 × 19 | Chart data (6 cells) | n/a | 2026-11-19 freeze | Low |
| Credit Health Panel · **Disclaimer** | 26 × 1 | Vendor disclaimer | n/a | 2026-11-19 freeze | Low |

### 1.7 Workbook tabs — `Short_Interest_Charting Excel Export Nov-19-2026 2_50 AM.xls` (100 KB, 2 tabs)

| Parent file · Sheet | Rows × Cols | Type | Period Covered | Last Modified | Earnings Relevance |
|---|---|---|---|---|---|
| Short Interest · **Chart 1 with Data** | 284 × 2 | Data export — short interest as % of shares outstanding, daily | **2025-11-19 → 2026-11-18** (last value 4.96%) | 2026-11-19 freeze | Low (positioning, not earnings) |
| Short Interest · **Attributions** | 45 × 1 | Vendor attribution text (13 cells) | n/a | 2026-11-19 freeze | Low |

### 1.8 Workbook tabs — single-tab CIQ exports (10 tabs)

| Parent file · Sheet | Rows × Cols | Type | Period Covered | Last Modified | Earnings Relevance |
|---|---|---|---|---|---|
| `…TTWO Events Calendar.xls` · **Events Calendar** | 16 × 3 | Data export — event dates | **Timeframe November 2026**: earnings release + call **2026-11-09**, BMO conference 2026-11-12 | 2026-11-19 freeze | Medium (next-catalyst dating; note the FQ3 FY27 release date **2027-02-09** comes from the EstimatesReport header) |
| `…TTWO Customers.xls` · **Customers** | 30 × 8 | Data export — disclosed customers (tier-5 vendor view) | Recently disclosed relationships only | 2026-11-19 freeze | Medium (revenue-concentration context) |
| `…TTWO Suppliers.xls` · **Suppliers** | 28 × 8 | Data export — disclosed suppliers (tier-5 vendor view) | Recently disclosed relationships only | 2026-11-19 freeze | Medium (cost-driver context) |
| `…TTWO Strategic Alliances.xls` · **Strategic Alliances** | 22 × 7 | Data export — alliances / licences | As disclosed | 2026-11-19 freeze | Medium (licence-driven revenue, e.g. sports licences) |
| `…TTWO Auditors.xls` · **Auditors** | 75 × 6 | Data export — auditor history | Historical through 2026 | 2026-11-19 freeze | Low (earnings-quality context) |
| `…TTWO Board Members.xls` · **Board Members** | 28 × 25 | Data export — board roster | Current | 2026-11-19 freeze | Low (governance module) |
| `…TTWO Professionals.xls` · **Professionals** | 24 × 24 | Data export — senior management roster | Current | 2026-11-19 freeze | Low |
| `…TTWO Public Ownership History.xls` · **History** | 1,835 × 6 | Data export — institutional holdings by period | **2025-12-31 → 2026-09-30** | 2026-11-19 freeze | Low |
| `…TTWO Public Ownership Insider Trading.xls` · **Insider Trading** | 5,058 × 11 | Data export — insider transactions | Full history; trailing-12m window to **2026-10-05** | 2026-11-19 freeze | Low (red-flag context) |
| `…TTWO Investment Analysis Direct Investments.xls` · **Direct Investments** | 173 × 21 | Data export — direct investments / M&A history | Historical | 2026-11-19 freeze | Low |

### 1.9 Workbook tabs — low/no-value and contaminant rows (4 tabs)

| Parent file · Sheet | Rows × Cols | Type | Period Covered | Last Modified | Earnings Relevance |
|---|---|---|---|---|---|
| `…TTWO Investment Analysis Co Investors.xls` · **Co-Investors** | 90 × 3 | Data export — co-investor list | Historical | 2026-11-19 freeze | Low |
| `Take-Two_Interactive_Software_Inc_-_Form_DEF_14A(Jul-27-2026).xls` · **No Data** | 4 × 4 (**1 populated cell**) | Proxy export — **empty payload**, extraction status `ok` but the only content is the literal string "This filing has no tabular data to export." The DEF 14A dated **2026-07-27** is referenced but its substance is NOT in the pool | Nominally 2026-07-27 | 2026-11-19 freeze | Low for earnings (governance/pay gap, owned by the management-governance module, not this one) |
| `Alphabet Inc NasdaqGS GOOGL Key Developments.xls` · **Key Developments** | 520 × 7 | **Wrong-company pool contaminant** — this is **Alphabet Inc. (NasdaqGS:GOOGL)** Key Developments, last 6 months, including current subsidiaries. It is not TTWO evidence and must not be cited as TTWO's | GOOGL, last 6 months to 2026-11 | 2026-11-19 freeze | **None for TTWO** — do not use |
| *(reconciliation)* | | | | | 73 rows total = 11 documents + 62 tabs, matching manifest `extracts_written: 73` |

**Note — no `## 1A. External Data` section.** The pool contains no `external/` subfolder and no manifest row carries `external: true` or a `provenance` object. There is no alt-data, expert-call, channel-check, or broker-research document in this pool, so nothing external influenced (or could influence) the sufficiency verdict.

**Note — `relationships.json` is present** in the frozen generation (90 KB, parsed from the Customers/Suppliers exports). It is a tier-5 vendor export covering only recently disclosed relationships, never a filing, and any `likely_group` entity in it is not arm's-length.

---

## 2. Most Recent Sources

Age measured from the period covered (or the document date, where that is the meaningful anchor) to today, 2026-11-19.

| Source Type | Filename | Period | Age (months) |
|---|---|---|---|
| Annual filing | `10K_2025_26_0001628280-26-037434.pdf` | FY2026, year ended **2026-03-31** | **7.6** |
| Quarterly filing | `10Q_2Q_0001628280-26-072254.pdf` | Q2 FY2027, quarter ended **2026-09-30** | **1.6** |
| Earnings transcript | `Take-Two Interactive Software, Inc., Q2 2027 Earnings Call, Nov 09, 2026.rtf` — **verbatim** CIQ transcript, Presentation + Q&A | Q2 FY2027 call, **2026-11-09** | **0.3** |
| Investor deck | `Take-Two_Interactive_2Q FY27 FINAL.pdf` | Q2 FY2027 results & guidance summary, **2026-11-09** | **0.3** |
| Consensus / estimate export | `Take-TwoInteractiveSoftware,IncNasdaqGSTTWOEstimatesReport.xls` (7 tabs) | Forward set to FY2029; latest revision event **2026-11-18**; consensus refreshed post-print | **~0.03** (≈1 day) |
| Cash flow data | `10Q_2Q_0001628280-26-072254.pdf` (Condensed Consolidated Statements of Cash Flows, six months ended 2026-09-30) + `10K_2025_26…pdf` (FY2026/25/24) + CIQ `Financials_Quarterly · Cash Flow` and `Financials_Annual · Cash Flow` | Through **2026-09-30** (quarterly) and FY2026 (audited) | **1.6** |
| Guidance data | `TTWO 2Q27 Earnings Release FINAL.pdf` ("Outlook for Fiscal Year 2027" — GAAP revenue, net income, diluted EPS, CFO, capex, non-GAAP EBITDA, Net Bookings; plus initial Q3 FY27) + `EstimatesReport · Guidance` tab (guidance key development dated 2026-11-09) | FY2027 and Q3 FY2027, issued **2026-11-09** | **0.3** |
| *(supplementary)* Earnings press release | `TTWO 2Q27 Earnings Release FINAL.pdf` — primary numbers/official-guidance anchor; NOT a transcript and NOT a call source | Q2 FY2027, **2026-11-09** | **0.3** |

**Staleness read:** nothing material is stale. The latest closed quarter (Q2 FY27, ended 2026-09-30) has its 10-Q, its press release, its deck, and its verbatim transcript all in the pool, and the consensus export was refreshed *after* that print (revision events dated 2026-11-13 and 2026-11-18). The consensus-staleness cap in `MODULE_RULES.md` does **not** trigger.

---

## 3. Earnings Usability Check

| Requirement | Available? (Y/N) | Source | Why It Matters |
|---|---|---|---|
| Income statement | **Y** | `FY26 10-K, Consolidated Statements of Operations`; `Q2 FY27 10-Q, Condensed Consolidated Statements of Operations`; `Capital IQ Financials_Annual · Income Statement` (FY2017→FY2026 + LTM Sep-30-2026); `Capital IQ Financials_Quarterly · Income Statement` (42 quarters) | Needed for revenue, margin, EPS |
| Balance sheet | **Y** | `FY26 10-K, Consolidated Balance Sheets`; `Q2 FY27 10-Q, Condensed Consolidated Balance Sheets`; CIQ `Financials_Quarterly · Balance Sheet` and `Financials_Annual · Balance Sheet` | Needed for working capital and leverage |
| Cash flow statement | **Y** | `FY26 10-K, Consolidated Statements of Cash Flows` (FY2026/2025/2024); `Q2 FY27 10-Q, Condensed Consolidated Statements of Cash Flows` (six months ended 2026-09-30); CIQ `Financials_Quarterly · Cash Flow`, `Financials_Annual · Cash Flow`. `ciq_facts.json` pins LTM CFO **$367.1m** and LTM levered FCF **$787.6m** (levered basis — after interest, NOT the §15 CFO−capex definition; downstream must compute CFO−capex itself) | Needed for CFO, FCF, earnings quality |
| Latest quarter | **Y** | Q2 FY27 ended 2026-09-30 — `10Q_2Q` + `TTWO 2Q27 Earnings Release` + Q2 FY27 deck + verbatim Q2 FY27 transcript | Needed for trend and setup |
| Last 8 quarters | **Y** — far more: ~42 standalone quarters | `Capital IQ Financials_Quarterly · Income Statement` / `Cash Flow` / `Balance Sheet` / `Ratios`, FQ1 2017 (Jun-30-2016) → FQ2 2027 (Sep-30-2026) | Needed for seasonality and inflection |
| Consensus estimates | **Y** | `EstimatesReport · Consensus` (604 × 123; FQ3 2027, FY2027–FY2029). Transcript header block prints the live set: FQ2 2027 EPS consensus 0.97 vs actual 1.00; FQ3 2027 EPS 3.09, FY2027 3.92, FY2028 6.98 [`Q2 2027 Earnings Call transcript, Nov 09 2026, S&P Global MI Estimates header`] | Needed for market bar |
| Estimate revisions | **Y** | `EstimatesReport · Revisions` (467 × 21; last-month breadth) + `Recent Changes` (265 × 10, event-level, latest 2026-11-18) + `Trends` (303 × 21). `ciq_facts.json`: FY2027 EPS (GAAP) 9↑/2↓ last month; FY2027 revenue 6↑/9↓ last month | Needed for revision momentum |
| Earnings transcript | **Y — verbatim, two consecutive quarters** | `Q2 2027 Earnings Call, Nov 09, 2026.rtf` and `Q1 2027 Earnings Call, Aug 07, 2026.rtf` — both S&P Capital IQ transcripts with Call Participants, Presentation, and Question and Answer sections; executives named (Strauss Zelnick, Karl Slatoff, Lainie Goldstein, Nicole Shevins) plus sell-side analysts. No Rating/Target-Price verdict block, so these are **not** sell-side proxies | Needed for management tone and driver detail |
| Segment P&L | **Y, as disclosed — single-segment company, not a data gap** | "We have one operating and reportable segment" [`FY26 10-K, Item 1 / Note 21`]. `ciq_facts.json` segments: "Sale of Software Titles 6,656 (100%) of Total 6,656" [12 months Mar-31-2026]. Revenue IS disaggregated and usable: by content (recurrent consumer spending $1,210.2m = 81% vs full game and other $286.8m), by platform (Mobile $731.1m / 49%, Console $615.4m / 41%, PC and other $150.5m / 10%), by distribution channel (digital online 97.9% of net revenue), and by geography (US $3,940m / 59%, International $2,716m / 41% for FY2026) [`Q2 FY27 10-Q, Disaggregation of Revenue`; `TTWO 2Q27 Earnings Release, "Net Revenue and Net Bookings by Content, Platform Mix, Distribution Channel, and Geographic Region"`; `ciq_facts.json` geographic] | Needed for mix shift |
| Current price | **Y** | **USD 216.61**, CIQ Comps · Financial Data "Day Close Price Latest" (subject row) as-of **2026-11-19**; shares outstanding 187.2m [`ciq_facts.json` → `current_price`, `shares_outstanding_m`] | Needed only for master-level stock reaction context |

All 10 rows resolve Y. Nothing in the usability table is absent.

---

## 4. Cross-Module Availability

Checked against the actual filesystem at `analyses/TTWO_2026-11-19/business-model/`.

| Business-Model Output | Available? (Y/N) |
|---|---|
| `03_segment-map.md` | **Y** (20,774 bytes) |
| `06_value-chain.md` | **Y** (31,386 bytes) |
| `10_external-dependency.md` | **Y** (34,530 bytes) |

The business-model module appears to have run to completion: all 14 agent outputs (`00`–`12`, `99_business-model-synthesis.md`) plus `business-model_dossier.md` are present. Downstream earnings agents should read `03_segment-map.md` before writing their own segment read, `06_value-chain.md` for pricing-power context, and `10_external-dependency.md` for the external-variable and cyclicality read — and must reconcile against it rather than diverge silently (`MODULE_RULES.md` Cycle-Position Rule). No agent should emit the "Business-model module not available" disclaimer.

---

## 5. Partial-Data Flags

| Missing Data | Applies? (Y/N) | Affected Agents | Cap Applied |
|---|---|---|---|
| No consensus / estimate data | **N** | 04, 05, 99 | None. Consensus present AND fresh (7-tab EstimatesReport; revision events to 2026-11-18, after the 2026-11-09 Q2 FY27 print). Neither the no-consensus max-30 cap nor the staleness haircut triggers |
| No quarterly data | **N** | 01, 02, 03, 06 | None. ~42 standalone quarters (Jun-2016 → Sep-2026) plus two 10-Qs. QoQ, seasonality, and TTM are all computable; the clarity max-60 cap does not bind |
| No VERBATIM transcript, sell-side proxy present | **N** | 02, 03, 04 | None. Two verbatim CIQ transcripts (Q1 and Q2 FY27). Tone and candor ARE assessable from the actual Q&A, so no proxy clarity cap and no management-governance `06` candor cap arise from this module's pool |
| No transcript AND no sell-side proxy | **N** | 02, 03, 04 | None. Verbatim transcripts present; the clarity ≤70 no-call cap does not bind |
| No segment-level P&L | **N** | 02, 03, 99 | None. The company discloses **one operating and reportable segment** [`FY26 10-K, Note 21`] — the single-segment path in the Segment-Level Rule, not a disclosure gap. The "no segment P&L for a **multi-segment** business" clarity ≤70 cap is not triggered. Agents `02`/`03` must state the single-segment fact and then decompose on the disclosed axes (content / platform / distribution channel / geography), which are fully available |
| No cash flow statement | **N** | 06, 99 | None. Audited FY2026 and interim six-month-to-Sep-2026 cash flow statements plus full CIQ cash-flow history. The earnings-quality max-45 cap does not bind |
| No current price | **N** | 99 | None. USD 216.61 as-of 2026-11-19 (CIQ Comps · Financial Data) |

**No score cap from this module's data pool binds.** Three pool-hygiene items are recorded, none of which is a sufficiency gap for the earnings module:
1. **Wrong-company contaminant.** `Alphabet Inc NasdaqGS GOOGL Key Developments.xls` is Alphabet's data, not Take-Two's. Every downstream agent must ignore it; citing it as TTWO evidence would be a §20 bad-source error.
2. **Empty proxy export.** The DEF 14A (2026-07-27) workbook extracted successfully but contains one cell — "This filing has no tabular data to export." The proxy's substance (pay, governance) is therefore not in the pool. That is a management-governance input, not an earnings input; it is flagged for that module, not capped here.
3. **No TTWO Key Developments export.** There is no TTWO equivalent of the (mis-ticketed) Key Developments file, so intra-quarter announcement flow between the 2026-11-09 print and today is not covered by a structured export. The Events Calendar covers November 2026 only, and the next scheduled earnings date (FQ3 FY27, **2027-02-09**) comes from the EstimatesReport header rather than the calendar tab. Immaterial to revenue/margin/cash-flow analysis.

---

## 6. Sufficiency Verdict

- **Verdict:** Sufficient
- **Reason:** The pool carries a recent audited annual filing (FY2026 10-K, year ended 2026-03-31, 7.6 months old), the latest quarterly filing (Q2 FY27 10-Q, quarter ended 2026-09-30, 1.6 months old) **and** a verbatim earnings-call transcript for that same quarter, with income statement, balance sheet, and cash flow statement all available from both the filings and ~42 quarters of Capital IQ history — plus fresh consensus, revision breadth, company guidance on both GAAP and Net Bookings bases, and a current price.
- **Active partial-data caps:** none — no partial-data flag in Section 5 resolves Y, and no score cap in `MODULE_RULES.md` is triggered by the data pool. (Caps may still arise later from analytical findings, e.g. absent sensitivity disclosures forcing Low confidence on earnings volatility, or an unresolved source conflict capping overall usefulness at 65 — but none is pre-bound by data availability.)
- **Critical missing items:** none for this module. For completeness, two non-blocking items: the DEF 14A payload is empty (a management-governance input), and one pool file belongs to a different issuer (Alphabet/GOOGL) and must not be cited as TTWO evidence.
- **Data quality read for `99`:** the evidence base supports the top sufficiency band — primary audited and interim filings, two verbatim transcripts, a complete 7-tab consensus/estimates export refreshed one day before this run, and a decade of annual plus ~42 quarters of vendor-normalised history. The one standing analytical hazard is not missing data but a basis trap: consensus "revenue" for TTWO is tracked on the company's **Net Bookings** metric ($1,601.3m vendor actual for Q2 FY27) while the GAAP line is **net revenue** ($1.50bn), and FY27 guidance is issued on both bases ($7,980–8,180m GAAP revenue vs $8,000–8,200m Net Bookings). Every beat/miss and growth comparison downstream must name its basis and must not mix the two (§15).



---

## earnings / 01_historical-financials.md

_Source: `01_historical-financials.md`_

# Historical Financials — TTWO

**Company:** Take-Two Interactive Software, Inc. (NasdaqGS:TTWO) · **Regime:** US SEC (10-K / 10-Q / 8-K Ex. 99.1) · **Standard:** US GAAP · **Currency:** USD, millions unless stated · **Fiscal year:** ends 31 March (FY2026 = year ended 2026-03-31; FY2027 is in progress) [1][3].

**Three basis warnings that govern every number below (read first).**

1. **GAAP net revenue ≠ Net Bookings.** Take-Two reports a GAAP line (total net revenue) and a company-defined operational metric (Net Bookings). Q2 FY27 GAAP net revenue was $1,497.0m while Net Bookings were $1,601.3m [3][5]. **Every revenue figure in this report is GAAP total net revenue.** Net Bookings appears only where it is named.
2. **Two gross-profit / EBIT bases exist.** The audited filing and the Capital IQ export do not agree, because the vendor reclassifies asset writedowns and business-reorganisation charges out of cost of revenue and operating expense. FY2026 filing gross profit was $3,809.7m; the vendor's was $3,838.8m [1][7]. Where the filing discloses the line, the filing is used (§4) and the vendor difference is named. Where the filing does not disclose the line (EBITDA; FY2022; individual Q3/Q4 quarters), the vendor is used and labelled.
3. **EBITDA has two definitions here.** "EBITDA (CIQ)" is the vendor's computed figure. "EBITDA (company-defined)" is Take-Two's own non-GAAP measure — GAAP net income (loss) excluding interest income/expense, income taxes, depreciation and amortisation, and amortisation of acquired intangibles [3, p.11 of 14]. It does **not** add back stock-based compensation; the company's separate "management reporting" table does. The three are different numbers and are never mixed below.

All growth rates, margin deltas, TTM sums, FCF and leverage in this report were computed by an executed Python snippet; the commands and their printed results are reproduced in §8.

---

## 1. Annual Financial Table (FY2022–FY2026, USD millions)

| Metric | FY2022 | FY2023 | FY2024 | FY2025 | FY2026 | Trend |
|---|---:|---:|---:|---:|---:|---|
| Revenue (total net revenue) | 3,504.8 ᵛ | 5,349.9 | 5,349.6 | 5,633.6 | 6,656.4 | Accelerating |
| Revenue YoY % | n/a | +52.6% | −0.0% | +5.3% | +18.2% | Accelerating |
| Gross Profit | 2,040.0 ᵛ | 2,285.3 | 2,241.8 | 3,062.2 | 3,809.7 | Inflecting |
| Gross Margin % | 58.2% ᵛ | 42.7% | 41.9% | 54.4% | 57.2% | Inflecting |
| Gross Margin Δ (bps) | n/a | n/c ᵉ | −81 | +1,245 | +288 | Inflecting |
| EBITDA (CIQ vendor-computed) | 671.0 ᵛ | 555.5 ᵛ | 432.2 ᵛ | 379.5 ᵛ | 788.5 ᵛ | Inflecting |
| EBITDA Margin % (CIQ) | 19.1% | 10.4% | 8.1% | 6.7% | 11.8% | Inflecting |
| EBITDA Margin Δ (bps) | n/a | −876 | −230 | −134 | +511 | Inflecting |
| EBIT (income/(loss) from operations) | 545.0 ᵛ | (1,165.2) | (3,590.6) | (4,391.1) | (104.2) | Volatile |
| EBIT Margin % | 15.6% ᵛ | −21.8% | −67.1% | −77.9% | −1.6% | Volatile |
| EPS (diluted, GAAP) | $3.58 ᵛ | $(7.03) | $(22.01) | $(25.58) | $(1.62) | Volatile |
| CFO (net cash from operating activities) | 258.0 ᵛ | 1.1 | (16.1) | (45.2) | 624.3 | Inflecting |
| Capex (total: fixed assets + asset acquisitions) | 158.6 ᵛ | 204.2 | 169.1 | 189.7 | 190.2 | Accelerating |
| FCF (CFO − total capex) | 99.4 | (203.1) | (185.2) | (234.9) | 434.1 | Inflecting |
| Working Capital (current assets − current liabilities) | 1,766.1 ᵛ | (1,343.5) ᵛ | (146.7) | (799.9) | 610.7 | Volatile |
| Net Debt — **strict basis** (total debt per the filing debt note − cash & equivalents) | (1,732.1) net cash | 2,252.4 ᵛ | 2,328.9 | 2,205.0 | 972.5 | Inflecting |
| Net Debt / EBITDA (strict net debt ÷ CIQ EBITDA) | net cash (−2.58x) | 4.05x | 5.39x | 5.81x | 1.23x | Inflecting |

ᵛ = Capital IQ vendor figure (`Financials_Annual` export, restatement basis "Latest Filings"), not the filing's own number [7][8]. All unmarked FY2023–FY2026 figures are from the 10-K statements [1][2].
ᵉ = not computed. The FY2022 gross margin is on the **vendor** basis (writedowns excluded from cost of revenue) and the FY2023 figure is on the **filing** basis; a FY2022→FY2023 margin delta would be a basis switch, so it is suppressed rather than printed (§15, no mixing of bases). On a like-for-like vendor basis the vendor's own series runs FY2022 58% → FY2023 53% → FY2024 53% → FY2025 58% → FY2026 58% [9].

**Notes on construction.**

- **Capex definition.** "Total capex" = *Purchases of fixed assets* + *Asset acquisitions*, both from the cash-flow statement. FY2026: 162.8 + 27.4 = 190.2; FY2025: 169.4 + 20.3 = 189.7; FY2024: 141.7 + 27.4 = 169.1 [1][2]. This reconciles exactly to the vendor's own capex line for all four years [8], so the two sources agree on capex. Capex is shown as a positive number here; the cash-flow statement shows it as a cash outflow, and the absolute value is used in the FCF subtraction.
- **What capex does *not* capture.** Take-Two's largest discretionary spend is *software development costs and licenses* — $688.9m in FY2026 — which sits **inside** operating cash flow, not in capex [1, p.66]. CFO is therefore already net of game development spend. Do not treat FCF of $434.1m as "cash before content investment".
- **FCF definition.** FCF = CFO − total capex (§15). FY2026: 624.3 − 190.2 = **434.1**. No company-defined FCF is disclosed in the pool, and the vendor's "Levered Free Cash Flow" of $787.6m for the LTM is an after-interest vendor construction, **not** the §15 definition — it is not used here [10].
- **Net debt, strict basis, composition confirmed.** Total debt is taken from the filing's own debt note, which contains **only** senior notes and convertible notes; lease liabilities are a separate balance-sheet line and are **not** in the debt note. FY2026: short-term debt, net $30.0m + long-term debt, net $2,488.0m = $2,518.0m, against cash & equivalents of $1,545.5m → **net debt $972.5m, strict basis** [1, Note 11 (Debt), p.85–86; 1, p.63]. Restricted cash ($13.2m current + $79.4m long-term) and short-term investments ($443.8m) are deliberately excluded from the cash side. FY2024 and FY2025 debt figures are likewise from the filings' own debt notes [2]; the FY2023 debt split is vendor-sourced [7].
- **The vendor's net-debt figure is a different measure and is not used in this table.** Capital IQ reports net debt of $969.0m at FY2026 and $1,237.8m at 2026-09-30, pinned in the deterministic facts sidecar [10]. That figure is on a **broad** basis on the cash side (it nets short-term investments) *and* its total-debt input includes lease liabilities, which the filing's debt note excludes. At 2026-09-30 the gap reconciles exactly: strict $1,370.4m − short-term investments $524.2m + lease liabilities $391.6m = $1,237.8m. No misread — two different definitions, both named.
- **Canonical net debt is not this module's output.** The `balance-sheet-survival` module builds the filing-verified, canonical net-debt figure from the debt note directly. This row is a supporting line for the trend table and is not guaranteed to match that module's figure.

---

## 2. TTM Snapshot (four quarters ended 2026-09-30 vs four quarters ended 2025-09-30)

Latest TTM = Q3 FY26 + Q4 FY26 + Q1 FY27 + Q2 FY27 (Dec-2025, Mar-2026, Jun-2026, Sep-2026). Prior TTM = Q3 FY25 + Q4 FY25 + Q1 FY26 + Q2 FY26. Both are sums of actual reported standalone quarters — nothing is estimated or annualised.

| Metric | Latest TTM | Prior TTM | Change | Evidence |
|---|---:|---:|---:|---|
| Revenue (GAAP total net revenue) | 6,409.7 | 6,219.9 | +189.8 / **+3.1%** | [9] quarterly columns; latest TTM ties exactly to the vendor's own LTM column 6,409.7 [7] |
| EBITDA (CIQ vendor) | 724.9 (vendor LTM column) | 703.2 (sum of quarters) | +21.7 / **+3.1%** | [10] pins LTM EBITDA 724.9; [9] quarterly sum = 732.3 — see reconciliation note |
| EBITDA margin % (CIQ) | 11.3% | 11.3% | **+2 bps** | derived, §8 |
| EBIT (income/(loss) from operations) | (112.5) (vendor LTM column) | (387.3) (sum of quarters) | +274.8 | [7] LTM column; [9] quarterly sum = (105.1) |
| EPS diluted (GAAP) | $(1.29) | $(22.59) | +$21.30 | [9]; latest TTM ties to the vendor LTM column $(1.29) [7] |
| CFO | 367.1 | 357.9 | +9.2 / **+2.6%** | [9]; ties exactly to [10] LTM CFO 367.1 |
| Capex (total) | 304.5 | 176.9 | +127.6 / **+72.1%** | [9]; ties exactly to the filing: H2 FY26 (162.8−57.0=105.8 fixed assets) + 6M FY27 163.3 + asset acquisitions 35.4 = 304.5 [1][3] |
| FCF (CFO − capex) | **62.6** | **181.0** | **−118.4 / −65.4%** | derived, §8 |
| Net debt at latest period-end (2026-09-30) — **strict basis** | **1,370.4** | 2,205.0 (at 2025-03-31) | — | 629.2 + 1,890.6 = 2,519.8 total debt per the filing debt note, less cash & equivalents 1,149.4 [3, Note 10 (Debt); 3, p.2] |
| Net debt / EBITDA at 2026-09-30 (strict ÷ LTM CIQ EBITDA) | **1.89x** | — | — | 1,370.4 ÷ 724.9, derived, §8 |

**Note:** net debt is a point-in-time balance-sheet metric, not a TTM flow metric. The strict-basis label is carried unqualified here because the total-debt composition **is** confirmed against the filing's own debt note (senior notes plus convertible notes; lease liabilities of $391.6m excluded) [3, Note 10]. The vendor's broad-basis figure for the same date is $1,237.8m → 1.71x [10], reconciled in §1.

**Reconciliation — the $7.4m vendor-internal EBITDA gap.** Capital IQ's own LTM column says EBITDA $724.9m [7][10], while summing its own four quarterly columns gives $732.3m [9]. The same $7.4m gap appears between its FY2026 annual column (788.5) and its FY2026 quarterly sum (795.9). This is a vendor restatement difference between its annual/LTM and quarterly series, not a misread on either side. The sidecar-pinned $724.9m is used as the authoritative latest-TTM read; the prior-TTM figure has no vendor LTM column and is therefore a sum of quarters, so the +3.1% change carries a ~1% basis difference. It is not precise enough to call a trend on its own.

---

## 3. Latest Quarterly Trend Table (8 quarters, USD millions)

Single basis: Capital IQ `Financials_Quarterly` for all eight quarters, so the columns are comparable to each other. The filing's own figures for the quarters covered by a 10-Q are reconciled beneath the table.

| Metric | Q3 FY25 (Dec-24) | Q4 FY25 (Mar-25) | Q1 FY26 (Jun-25) | Q2 FY26 (Sep-25) | Q3 FY26 (Dec-25) | Q4 FY26 (Mar-26) | Q1 FY27 (Jun-26) | Q2 FY27 (Sep-26) | QoQ Trend | YoY vs Same Q |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---|---|
| Revenue | 1,359.8 | 1,582.5 | 1,503.8 | 1,773.8 | 1,699.0 | 1,679.8 | 1,533.9 | 1,497.0 | Decelerating (last 4 QoQ: −1.1%, −8.7%, −2.4%, ... Q2 FY27 −2.4% on Q1) | Q2 FY27 **−15.6%** vs Q2 FY26; Q1 FY27 **+2.0%** vs Q1 FY26 |
| Gross Margin % | 55.9% | 62.1% | 62.8% | 55.3% | 55.8% | 57.6% | 60.4% | 57.5% | Volatile (range 55.3%–62.8%) | Q2 FY27 **+220 bps** vs Q2 FY26 |
| EBITDA (CIQ) | 120.5 | 226.7 | 238.5 | 117.5 | 182.2 | 257.7 | 216.5 | 75.9 | Volatile | Q2 FY27 **−35.4%** vs Q2 FY26 |
| EBITDA Margin % (CIQ) | 8.9% | 14.3% | 15.9% | 6.6% | 10.7% | 15.3% | 14.1% | 5.1% | Volatile | Q2 FY27 **−150 bps** vs Q2 FY26 |
| EPS (diluted, GAAP) | $(0.71) | $(21.08) | $(0.07) | $(0.73) | $(0.50) | $(0.32) | $(0.18) | $(0.29) | Volatile (Q4 FY25 carries a $3,545.2m goodwill impairment) | Q2 FY27 loss narrowed from $(0.73) to $(0.29) |
| CFO | (4.8) | 279.0 | (44.7) | 128.4 | 305.2 | 235.4 | (168.8) | (4.7) | Volatile | 6M FY27 CFO **$(173.5)m** vs 6M FY26 **+$83.7m** |
| Capex (total) | 50.2 | 58.3 | 29.5 | 38.9 | 77.5 | 44.3 | 40.8 | 141.9 | Accelerating | Q2 FY27 capex 3.6x Q2 FY26 |

**Reconciliation to the filings (the quarters a 10-Q covers).**
- Q2 FY27: filing revenue 1,497.0, cost of revenue 636.6, gross profit **860.4** (57.5%), diluted loss per share $(0.29) [3, p.3]. The vendor shows gross profit 860.6 — a $0.2m difference equal to the quarter's asset writedown, which the vendor reclassifies out of cost of revenue [9].
- Q1 FY27: filing cost of revenue 651.4 and gross profit **882.5** (57.5%), derived as 6M (1,288.0 / 1,742.9) less Q2 [3, p.3]. The vendor shows 925.9 (60.4%) — a **$43.4m** difference, again the quarter's asset writedown moved out of cost of revenue [9]. **This is the single largest filing-vs-vendor gap in the table:** on the filing basis Q1 FY27 gross margin was 57.5%, not 60.4%, and the "Q1→Q2 margin fell 290 bps" read from the vendor row disappears entirely on the filing basis (57.5% → 57.5%).
- Q2 FY26 and Q1 FY26: vendor and filing agree (980.5 / 1,773.8 and revenue 1,503.8) [3, p.3; 9].
- **Q3 FY26 and Q4 FY26 have no filing in the pool.** There is no Q3 FY27-year 10-Q for the December-2025 quarter and no FY2026 Q4 release; both columns are vendor-constructed (a March-year-end Q4 is itself derived as the annual figure less the nine-month figure). They are used, labelled, and not treated as filing-grade.
- 10-Q cash-flow statements are **six-month cumulative**, not standalone quarters [3, p.5]. The standalone quarterly CFO and capex columns above are the vendor's; they reconcile to the filings at the six-month and full-year level (6M FY27 CFO −168.8 + −4.7 = −173.5 = filing; FY26 CFO quarterly sum = 624.3 = filing) [1][3][9].

---

## 4. Reported vs Adjusted Metrics — Q2 FY27 (three months ended 2026-09-30, USD millions)

Take-Two **does** disclose adjusted metrics, on two levels: a non-GAAP **EBITDA**, and a separate "management reporting" adjustment table used internally by management and the Board [3, p.2 and p.11–12].

| Metric | Reported Value | Adjusted Value | Adjustment Amount | Adjustment Reason | Evidence |
|---|---:|---:|---:|---|---|
| EBITDA (company-defined non-GAAP) | Net loss $(54.0) | **$92.2** | **+146.2** | Removes income tax benefit (57.9), interest income (19.3), interest expense +30.2, D&A +48.1, amortisation of acquired intangibles +145.1 | [3, p.11 "Reconciliation of GAAP to Non-GAAP Measure"] |
| EBITDA — management-reporting basis (further adjusted) | $92.2 (non-GAAP EBITDA) | **$277.1** | **+184.9** | Change in deferred net revenue and related cost of revenue +101.9, stock-based compensation +90.0, business acquisition +2.4, other (9.4) | [3, p.2 management-reporting table] |
| EBIT (income/(loss) from operations) | $(117.5) | **$229.6** (management-reporting) | **+347.1** | Deferred net revenue +101.0, stock-based compensation +90.0, amortisation of acquired intangibles +153.0, business acquisition +3.1 | [3, p.2]; the company discloses **no** adjusted EBIT as a named non-GAAP line — this is the arithmetic of its own disclosed adjustment columns |
| EPS (diluted) | $(0.29) GAAP | **≈ $0.99** (management-reporting, derived) | **+$1.28** | Pre-tax (111.9) + 101.9 + 90.0 + 153.0 + 3.7 − 9.4 = 227.3; × (1 − 18% management tax rate) = 186.4; ÷ 188.0m share count = $0.99 | [3, p.2] discloses the adjustment columns, the 18% management tax rate and the 188.0m share count but not the resulting per-share figure; the vendor's consensus header records the quarter's EPS **actual at $1.00** [11] |

**Three things this table is saying plainly.** First, the gap between GAAP and the company's own preferred number is very large: a $(54.0)m GAAP net loss becomes $277.1m of management-reporting EBITDA, a $331m swing on $1,497m of revenue. Second, **$90.0m of that is stock-based compensation** — a real cost of paying employees, added back every quarter ($305.3m in FY2026) [1, p.66]. Third, **$101.9m is a deferred-revenue timing adjustment** — revenue the company has billed but GAAP defers; it shifts income between periods rather than creating it. Any downstream comparison must name which of the four columns it is using.

**FY2027 guidance is issued on all of these bases at once** — GAAP total net revenue $7,980–8,180m, GAAP diluted EPS $0.57–0.75, non-GAAP EBITDA $1,024–1,082m, and the operational metric Net Bookings $8,000–8,200m [3, "Outlook for Fiscal Year 2027"]. Guidance analysis belongs to `04_guidance-consensus`; it is named here only because the four bases are not interchangeable.

No full-year company-defined EBITDA for FY2026 exists in this pool (no Q4 FY26 release was admitted), so §1's EBITDA row is vendor-computed throughout rather than company-defined.

---

## 5. Quarterly Seasonality Table (FY2024–FY2026, GAAP net revenue)

| Quarter | FY2024 Rev Share | FY2025 Rev Share | FY2026 Rev Share | Avg Rev Share | FY2024 EBITDA Margin | FY2025 EBITDA Margin | FY2026 EBITDA Margin |
|---|---:|---:|---:|---:|---:|---:|---:|
| Q1 (Jun) | 24.0% | 23.8% | 22.6% | **23.5%** | 8.0% | 6.2% | 15.9% |
| Q2 (Sep) | 24.3% | 24.0% | 26.6% | **25.0%** | 7.1% | −3.7% | 6.6% |
| Q3 (Dec) | 25.5% | 24.1% | 25.5% | **25.1%** | 11.2% | 8.9% | 10.7% |
| Q4 (Mar) | 26.2% | 28.1% | 25.2% | **26.5%** | 6.1% | 14.3% | 15.3% |
| Total | 5,349.6 | 5,633.6 | 6,656.4 | | 8.1% | 6.7% | 12.0% |

Built from actual reported standalone quarterly revenue, not estimates; each year's four quarters sum exactly to the audited annual revenue (FY2024 5,349.6; FY2025 5,633.6; FY2026 6,656.4) [1][2][9]. The Total-row EBITDA margins are computed from the **quarterly** EBITDA columns, so FY2026 reads 12.0% (795.9 / 6,656.4) against 11.8% in §1, which uses the vendor's annual column (788.5) — the same $7.4m vendor-internal gap reconciled in §2.

**Flag: no quarter consistently takes more than 30% or less than 20% of annual revenue.** The spread between the heaviest quarter (Q4, 26.5% average) and the lightest (Q1, 23.5%) is only about 3 percentage points. On GAAP net revenue, **Take-Two has almost no revenue seasonality** — which is the opposite of what a game publisher's release calendar would suggest.

The reason is mechanical, and it matters: 81% of Net Bookings is recurrent consumer spending (in-game purchases and virtual currency), and GAAP defers a large part of each quarter's billings over the expected service period, so lumpy bookings arrive as smoothed revenue [3, p.1; 3, "Net Bookings by content"]. **Seasonality that is invisible in GAAP revenue is still present in bookings and in margin.** EBITDA margin is where the lumpiness shows: it ranged from −3.7% (Q2 FY25) to +15.9% (Q1 FY26) across these twelve quarters — a 19.6-percentage-point spread on revenue that barely moves.

---

## 6. Key Trend Summary

**Revenue: accelerating through FY2026, then reversing in the first half of FY2027.** Annual revenue growth ran −0.0% (FY2024) → +5.3% (FY2025) → +18.2% (FY2026), and the FY2023 jump of +52.6% was acquisition-driven (the Zynga deal, closed May 2022) rather than organic [1][2][7]. That acceleration has now broken: Q1 FY27 grew +2.0% year on year and Q2 FY27 fell **−15.6%** to $1,497.0m, with Net Bookings down 18% to $1,601.3m and below the company's own $1,620–1,670m guidance for the quarter [3; 5]. On a trailing-twelve-month basis revenue is still up, but only +3.1% (6,409.7 vs 6,219.9) — far below the +18.2% the last closed fiscal year printed. The dominant direction over the last two reported quarters is **decelerating**; over the five-year annual series it is **accelerating**. Both statements are true on their own period, and they must not be collapsed into one.

**Margins: expanding on gross margin, inflecting upward on EBITDA from a FY2025 trough, but down sharply in the latest quarter.** Filing-basis gross margin rose from 41.9% (FY2024) to 54.4% (FY2025, +1,245 bps) to 57.2% (FY2026, +288 bps) [1][2]. Vendor-basis EBITDA margin bottomed at 6.7% in FY2025 and recovered to 11.8% in FY2026 (+511 bps) [7]. Then Q2 FY27 broke the pattern: EBITDA margin 5.1% against 6.6% a year earlier (−150 bps), with absolute EBITDA down 35.4% to $75.9m, even though gross margin in the same quarter *improved* 220 bps [3][9]. **Margin direction is: gross margin expanding, EBITDA margin inflecting — and the gap between the two is the finding, not a rounding issue.** Gross margin up while EBITDA margin down means the compression sits below the gross line (operating cost absorption on a smaller revenue base), not in cost of revenue. Attributing that is `03_margin-drivers`' job, not this module's.

**Seasonality: material in bookings and margin, essentially absent in GAAP revenue.** No quarter takes more than 26.5% or less than 23.5% of annual GAAP revenue on a three-year average, so there is no "quarter that matters most" in reported revenue; but EBITDA margin swung across a 19.6-point range over the same twelve quarters, so profit timing is genuinely lumpy [9]. The company's own FY2027 outlook makes the point sharply: Q3 FY27 GAAP revenue is guided to $3,270–3,420m against $1,699.0m in Q3 FY26 — roughly a doubling in a single quarter — which would be the largest quarterly revenue skew anywhere in this history [3]. That skew is a forward company statement, not realised history, and nothing in §1–§5 assumes it.

**Inflection points in the last five years: three, all identifiable.** (i) **FY2023 — the Zynga acquisition.** Revenue +52.6%, total debt from effectively nil at 2022-03-31 to $3,079.8m, net cash of $1,732.1m becoming net debt of $2,252.4m, leverage 4.05x, and the first of three consecutive years of negative FCF [1][2][7]. (ii) **FY2024–FY2025 — goodwill written off.** $2,342.1m of goodwill impairment in FY2024 and $3,545.2m in FY2025 drove operating losses of $(3,590.6)m and $(4,391.1)m and diluted losses of $(22.01) and $(25.58); goodwill fell from $6,767.1m to $1,057.3m. These are non-cash: EBITDA over the same two years was positive ($432.2m, $379.5m), which is exactly why the EBIT and EPS rows read "Volatile" while the EBITDA row reads "Inflecting" [1][2][7]. (iii) **FY2026 — a cash and balance-sheet reset.** CFO swung from $(45.2)m to $+624.3m, FCF from $(234.9)m to $+434.1m, $1,150.0m of debt was repaid and $1,247.5m of common stock was issued, and strict-basis net debt more than halved from $2,205.0m to $972.5m, taking leverage from 5.81x to 1.23x [1][7]. **That reset has partly unwound in the six months since:** FCF over the latest TTM is only $62.6m against $181.0m a year earlier (CFO roughly flat at $367.1m while total capex rose 72% to $304.5m), and strict-basis net debt has risen from $972.5m to $1,370.4m (1.89x) [1][3][9][10].

---

## 7. Citations

[1] FY2026 Form 10-K (fiscal year ended 2026-03-31), filed 2026-05-22 — Consolidated Balance Sheets p.63; Consolidated Statements of Operations p.64; Consolidated Statements of Cash Flows p.66; Note 11 (Debt) p.85–86. `data/TTWO/10K_2025_26_0001628280-26-037434.pdf`
[2] FY2025 Form 10-K (fiscal year ended 2025-03-31) — Consolidated Balance Sheets p.65; Consolidated Statements of Operations p.66 (FY2025 / FY2024 / FY2023); Consolidated Statements of Cash Flows p.68; Note (Debt) p.85–86. `data/TTWO/10K_2024_25_0001628280-25-026694.pdf`
[3] Q2 FY2027 Form 10-Q (quarter ended 2026-09-30) — Condensed Consolidated Balance Sheets p.2; Statements of Operations p.3; Statements of Cash Flows p.5 (six months); Note 10 (Debt). `data/TTWO/10Q_2Q_0001628280-26-072254.pdf`
[4] Q1 FY2027 Form 10-Q (quarter ended 2026-06-30) — Condensed Consolidated Statements of Operations. `data/TTWO/10Q_1Q_0001628280-26-054870.pdf`
[5] TTWO Q2 FY2027 earnings release (Form 8-K Exhibit 99.1), dated 2026-11-09 — p.1 (Net Bookings $1,601.3m, −18%); p.2 (management-reporting adjustment table; "Outlook for Fiscal Year 2027" and Q3 FY27 outlook); p.11 (Reconciliation of GAAP to Non-GAAP Measure — EBITDA definition and bridge); "Net Revenue and Net Bookings by Content, Platform Mix, Distribution Channel, and Geographic Region". `data/TTWO/TTWO 2Q27 Earnings Release FINAL.pdf`
[6] TTWO Q1 FY2027 earnings release (Form 8-K Exhibit 99.1), dated 2026-08-07 — Q1 FY27 company-defined EBITDA $167.0m vs $225.5m prior-year quarter; Net Bookings $1,385.9m (−3%). `data/TTWO/TTWO 1Q27 Earnings Release FINAL 8-6-2026.pdf`
[7] Capital IQ `Financials_Annual` export, **Income Statement** tab (FY2017 → FY2026 + LTM Sep-30-2026; reported currency USD m; restatement basis "Latest Filings"), data as of the 2026-11 export. `data/TTWO/Take Two Interactive Software Inc NasdaqGS TTWO Financials_Annual.xls`
[8] Capital IQ `Financials_Annual` export, **Cash Flow** and **Balance Sheet** tabs (FY2017 → FY2026 + Sep-30-2026), data as of the 2026-11 export. Same workbook as [7].
[9] Capital IQ `Financials_Quarterly` export, **Income Statement**, **Cash Flow** and **Balance Sheet** tabs (FQ1 2017 / Jun-30-2016 → FQ2 2027 / Sep-30-2026; ~42 standalone quarters), data as of the 2026-11 export. `data/TTWO/Take Two Interactive Software Inc NasdaqGS TTWO Financials_Quarterly.xls`
[10] `ciq_facts.json` deterministic facts sidecar (frozen extract generation) — `total_debt_m` 2,911.4; `net_debt_m` 1,237.8 (CIQ vendor basis); `ltm_ebitda_m` 724.9; `ltm_ocf_m` 367.1; `levered_fcf_m` 787.6 (levered, **not** the §15 CFO−capex definition); `margin_trend`; `multi_year_trajectory`; all referencing the Capital IQ workbooks at [7]–[9].
[11] Take-Two Interactive Software, Inc., Q2 2027 Earnings Call transcript, 2026-11-09 — S&P Global Market Intelligence Estimates header block (quarter EPS actual 1.00; "Revenue (mm) ACTUAL 1601.30", i.e. the vendor's revenue actual is the Net Bookings figure, not GAAP net revenue). `data/TTWO/Take-Two Interactive Software, Inc., Q2 2027 Earnings Call, Nov 09, 2026.rtf`
[12] Upstream triage: `analyses/TTWO_2026-11-19/earnings/00_earnings-data-triage.md` — jurisdiction, reporting standard, currency, fiscal-year end, interim basis, and the GAAP-revenue-vs-Net-Bookings basis warning.

Not used: `Alphabet Inc NasdaqGS GOOGL Key Developments.xls` is a wrong-company pool contaminant (Alphabet Inc., not Take-Two) and is cited nowhere in this report [12].

---

## 8. Computation Log (executed, not mental arithmetic)

All growth rates, margin deltas in basis points, TTM sums, FCF and leverage above were produced by this executed Python snippet. Inputs are the sourced figures in §1–§5; the printed output is reproduced verbatim.

```python
def g(c,p): return (c-p)/p*100
# --- ANNUAL: FY2022..FY2026 ---
rev=[3504.8,5349.9,5349.6,5633.6,6656.4]      # [7] FY22; [1][2] FY23-26
gp =[2040.0,2285.3,2241.8,3062.2,3809.7]      # [7] FY22 vendor basis; [1][2] filing basis
eb =[671.0,555.5,432.2,379.5,788.5]           # [7] CIQ EBITDA, one basis throughout
ebit=[545.0,-1165.2,-3590.6,-4391.1,-104.2]   # [7] FY22; [1][2] income/(loss) from operations
cfo=[258.0,1.1,-16.1,-45.2,624.3]; cap=[158.6,204.2,169.1,189.7,190.2]
tca=[3871.1,2508.1,2259.7,2815.9,3199.5]; tcl=[2105.0,3851.6,2406.4,3615.8,2588.8]
dbt=[0.0,3079.8,3082.9,3661.1,2518.0]         # filing debt notes [1][2]; FY23 [7]; leases EXCLUDED
csh=[1732.1,827.4,754.0,1456.1,1545.5]        # cash & equivalents only (strict)
# --- QUARTERLY: Q3FY25..Q2FY27 ---  [9]
qr=[1359.8,1582.5,1503.8,1773.8,1699.0,1679.8,1533.9,1497.0]
qgp=[759.9,982.7,945.0,980.5,948.8,967.8,925.9,860.6]
qeb=[120.5,226.7,238.5,117.5,182.2,257.7,216.5,75.9]
```

```
Rev YoY%            [52.6 (FY23), -0.0 (FY24), 5.3 (FY25), 18.2 (FY26)]
GM%                 [58.2, 42.7, 41.9, 54.4, 57.2]      GM bps (FY24..FY26) [-81, 1245, 288]
EBITDA mgn%         [19.1, 10.4, 8.1, 6.7, 11.8]        bps [-876, -230, -134, 511]
EBIT mgn%           [15.6, -21.8, -67.1, -77.9, -1.6]
FCF  (CFO-capex)    [99.4, -203.1, -185.2, -234.9, 434.1]
Working capital     [1766.1, -1343.5, -146.7, -799.9, 610.7]
Net debt (strict)   [-1732.1, 2252.4, 2328.9, 2205.0, 972.5]
Net debt / EBITDA   [-2.58 (net cash), 4.05, 5.39, 5.81, 1.23]
Quarterly GM%       [55.9, 62.1, 62.8, 55.3, 55.8, 57.6, 60.4, 57.5]
Quarterly EBITDA m% [8.9, 14.3, 15.9, 6.6, 10.7, 15.3, 14.1, 5.1]
QoQ revenue%        [16.4, -5.0, 18.0, -4.2, -1.1, -8.7, -2.4]
Q2 FY27 YoY: revenue -15.6%  EBITDA -35.4%  GM +220bps  EBITDA mgn -150bps ; Q1 FY27 revenue +2.0%
TTM revenue 6409.7 vs 6219.9 = +3.1% ; TTM CFO 367.1 vs 357.9 = +2.6%
TTM capex 304.5 vs 176.9 = +72.1% ; TTM FCF 62.6 vs 181.0 = -65.4%
TTM EBITDA margin 11.3% vs 11.3% = +2bps
Net debt/EBITDA at 2026-09-30: strict 1370.4/724.9 = 1.89x ; CIQ broad 1237.8/724.9 = 1.71x
Seasonality rev share  FY2024 [24.0, 24.3, 25.5, 26.2] / FY2025 [23.8, 24.0, 24.1, 28.1] / FY2026 [22.6, 26.6, 25.5, 25.2]
Seasonality avg share  [23.5, 25.0, 25.1, 26.5]
Seasonality EBITDA mgn FY2024 [8.0, 7.1, 11.2, 6.1] / FY2025 [6.2, -3.7, 8.9, 14.3] / FY2026 [15.9, 6.6, 10.7, 15.3]
Ties checked: FY24 4Q rev = 5349.6 OK ; FY25 = 5633.6 OK ; FY26 = 6656.4 OK
             FY26 4Q CFO = 624.3 OK ; 6M FY27 CFO = -173.5 OK ; 6M FY27 capex = 182.7 OK
             latest-TTM revenue = CIQ LTM column 6409.7 OK ; latest-TTM CFO = sidecar 367.1 OK
             latest-TTM capex = sidecar/LTM 304.5 OK ; latest-TTM diluted EPS = CIQ LTM -1.29 OK
             strict - ST investments + leases = 1370.4 - 524.2 + 391.6 = 1237.8 = sidecar net debt OK
```



---

## earnings / 02_revenue-drivers.md

_Source: `02_revenue-drivers.md`_

# Revenue Drivers — TTWO

**Company:** Take-Two Interactive Software, Inc. (NasdaqGS:TTWO) · **Regime:** US SEC (10-K / 10-Q / 8-K Ex. 99.1) · **Standard:** US GAAP · **Currency:** USD, millions · **Fiscal year:** ends 31 March (FY2026 = year ended 2026-03-31; FY2027 in progress) [1][3].

**Evidence binding.** Frozen supervisor-verified read mode. Every manifest / corpus / CIQ-facts / extract read resolved inside the single bound generation `.extract-generations/0af638492ecb0521db2676c79d75e6940c7227bb9f192567527b8a57eb43203d/`. The live logical path `data/TTWO/` was not read; it is a citation label only. `Alphabet Inc NasdaqGS GOOGL Key Developments.xls` is a wrong-company pool contaminant and is cited nowhere below.

**Upstream inputs used.** `00_earnings-data-triage.md`, `01_historical-financials.md` (revenue baseline), `04_guidance-consensus.md` (guidance and the bar). Cross-module: business-model `03_segment-map.md` and `10_external-dependency.md` — both present, so no "business-model module not available" disclaimer applies.

**Two basis traps carried forward — they govern every number below.**

1. **GAAP net revenue ≠ Net Bookings.** Take-Two reports a statutory line (total net revenue) and a company-defined operational metric (Net Bookings = "the net amount of products and services sold digitally or sold-in physically during the period … includes licensing fees, merchandise, in-game advertising, and publisher incentives") [3, MD&A — Net Bookings]. Q2 FY27: Net Bookings **$1,601.3m** vs GAAP net revenue **$1,497.0m** [3; 5]. The gap is the net build in deferred revenue. **The vendor consensus "Revenue" field is on the Net Bookings basis, not GAAP** [12]. FY27 guidance is issued on BOTH bases at once (GAAP net revenue $7,980–8,180m; Net Bookings $8,000–8,200m) [5]. Every figure below names its basis. Nothing mixes them.
2. **The vendor's gross-profit series is not the filing's.** Capital IQ reclassifies asset writedowns out of cost of revenue, so vendor and filing margins are not interchangeable [11]. This report therefore takes **all revenue and all revenue-attribution figures from the filings themselves**, never from the vendor workbooks. The vendor export is used nowhere in Sections 3–6.

All percentage-point (pp) arithmetic below was executed, not estimated; the snippet and its printed output are in Section 8.

---

## 1. Segment Decomposition Status

**Single-segment business (>85% from one segment) — consolidated analysis.**

Take-Two discloses **one operating and reportable segment**, "sale of software titles", equal to 100% of revenue: $6,656.4m of $6,656.4m in FY2026 [1, Note 21 (Segment Reporting and Geographic Information), p.102]. The chief operating decision maker (the CEO) "manages our operations on a consolidated basis" and the segment measure of profit **is** consolidated net income (loss) [1, Note 21]. The same wording repeats in the latest interim filing [3, Note 14]. This is a disclosure fact, not a data gap, so the `MODULE_RULES.md` "no segment P&L for a multi-segment business" clarity cap (max 70) does **not** trigger — consistent with triage `00` §5.

This agrees with business-model `03_segment-map.md`, which reaches the same read from the same note. No divergence to flag.

**What that means in practice, stated plainly.** There is no segment-level profit, margin, or capital figure anywhere in the pool. What the company *does* publish is **four different ways of cutting the same single segment's revenue** — by content type, by platform, by distribution channel, and by geography — each with **no profit attached** [1, MD&A p.44; 3, MD&A p.24]. Section 5 therefore repeats the driver work on those disclosed axes rather than on invented sub-segments. The one structure that implies a real economic split — **two unnamed goodwill reporting units**, one of which absorbed $5,887.3m of accumulated impairment — is disclosed without revenue, profit, or identity, so it cannot be used as a segment [1, Critical Accounting Policies — Goodwill; 1, Note 9, p.83].

---

## 2. Revenue Driver Tree

| Business Type | Revenue Formula |
|---|---|
| Subscription / live-service | Customers × ARPU |
| Manufacturer / producer | Volume × realized price |
| Retail | Store count × sales per store |
| **Hit-driven publisher with a live-service tail (the applicable one)** | **(Full-game units × price) + (engaged players × in-game spend per player) + licensing / in-game advertising** |

**The company-specific formula, in one line (two layers, because the GAAP line is one step removed from the economics):**

> **Net Bookings** = (full-game units sold-in × price per unit, per title in the release slate) + (engaged players × recurrent in-game spend per player, per live title) + licensing fees + in-game advertising + publisher incentives — **and GAAP total net revenue = Net Bookings − the net build in deferred revenue**, because a large part of each quarter's billings is recognised over the expected service period rather than on sale [3, MD&A — Net Bookings; 3, Note 4 — Deferred Revenue, p.501-ff].

Three consequences that drive everything below:

- **There is no disclosed unit or price input at all.** The filings disclose neither units sold per title, nor average selling price, nor players, nor spend per player, nor attach / tie ratios. Management was asked directly for the GTA VI tie ratio embedded in guidance and declined: "I understand that clarity on the question would benefit your models. It really doesn't do anything for us, so we don't spend a lot of time on it" [4, Q&A (Crum / Zelnick)]. **Any volume × price split of this company's revenue would be invention, not analysis.** What the filings disclose instead is the **dollar change by title**, which is what Section 6 uses.
- **The second layer is where the timing lives.** The deferral wedge was $104.3m in Q2 FY27 against $186.7m a year earlier, so the GAAP line fell less than bookings (−15.6% vs −18.3%) [3; 5]. That is a recognition effect, not demand. Section 6.3 bridges it separately so it is never double-counted against the GAAP decomposition.
- **Deferred revenue is the only backlog-like disclosure.** At 2026-09-30 the deferred revenue balance was $1,042.1m (from $1,189.6m at 2026-03-31), and total revenue allocated to unsatisfied performance obligations was **$1,492.5m, of which about $1,117.9m is expected to be recognised over the next 12 months** [3, Note 4, p.511–513]. This is a real forward-revenue anchor — about 14% of the FY27 guided GAAP revenue midpoint of $8,080m — and it is the closest thing to an order book this business has.

---

## 3. Market / Share / Price / Mix Split

Importance /100 — higher = more important to the revenue line. **Not** an inverted score.

| Driver Bucket | Current Direction | Evidence | Importance /100 |
|---|---|---|---:|
| **Own release slate / title performance** *(row added — the first-order driver here, and none of the six template buckets captures it)* | **Deteriorating in realised periods, guided to inflect sharply up in Q3 FY27.** Q2 FY27 GAAP revenue −$276.8m (−15.6%), of which $237.6m is four named titles lapping prior-year launches. Q3 FY27 Net Bookings guided $3,350–3,500m against $1,757.1m a year earlier | `Q2 FY27 10-Q, MD&A p.25` (title-level deltas); `TTWO 2Q27 Earnings Release, "Fiscal Third Quarter Ending December 31, 2026"`; `Q2 2027 Earnings Call transcript, 2026-11-09, prepared remarks (Goldstein)` ("compared to $1.76 billion in the prior year") | **90** |
| **End-market demand** (discretionary consumer spending + third-party console installed base) | **Mixed, and the two sources disagree — named per §3.** The filing says reduced consumer spending "**has** and may in the future continue to result in reduced demand"; management says the opposite about today. Console was 41.4% of H1 FY27 revenue and rides an installed base Sony and Microsoft build and price. Guidance assumes "continued growth in the installed base of PlayStation 5 and Xbox Series X\|S" | `FY26 10-K, Item 1A (Declines in consumer spending)`; `Q2 FY27 10-Q, MD&A (Hardware Platforms, 41.4%)`; `TTWO 2Q27 Earnings Release, "Key assumptions and dependencies"`; `Q1 2027 Earnings Call transcript, 2026-08-07, Q&A (Zelnick: "we don't feel like the consumer is pulling back at all")` | **55** |
| **Company market share** | **Unknown — not disclosed.** No market-share figure, industry-size figure, or share series exists anywhere in the pool. What exists is concentration *inside* Take-Two: Grand Theft Auto products were 12.4% of FY26 net revenue and 12.6% of H1 FY27 net revenue; the five best-selling franchises were 54.3% of FY26 net revenue | `FY26 10-K, Item 1A, p.10` (12.4%, 54.3%); `Q2 FY27 10-Q, MD&A (Product Release Schedule)` (12.6%) | **30** (important in principle, unmeasurable from this pool) |
| **Price / realization** | **Unknown — not disclosed, and management declined to quantify it.** No ASP, no price per title, no ARPU, no spend-per-player series. The only pricing-adjacent disclosure is directional and about someone else's price: analysts raised rising *console hardware* prices; management answered that new SKU information "will always come from our labels" | `Q2 2027 Earnings Call transcript, 2026-11-09, Q&A (Schoell / Zelnick; Crum / Zelnick)` | **20** (would be high if disclosed; it is not) |
| **Product / customer / geography mix** | **Shifting materially, and dated.** Content mix: RCS was 80.8% of Q2 FY27 GAAP revenue vs 71.9% a year earlier; FY27 guidance implies RCS falling to **65% of Net Bookings** from 78% in FY26 (RCS flat in dollars while total bookings grow ~20.5%). Platform mix: on GAAP revenue mobile is largest (48.8%) but **on Net Bookings console is largest (46%) ahead of mobile (45%)** — the deferral wedge sits disproportionately in console/full-game. Geography mix barely moves (US 59% / International 41%) | `Q2 FY27 10-Q, MD&A p.24`; `TTWO 2Q27 Earnings Release, "Net Revenue and Net Bookings by Content, Platform Mix, Distribution Channel, and Geographic Region"`; `Take-Two_Interactive_2Q FY27 deck, slides 5 and 8`; `Q2 2027 transcript, prepared remarks (Goldstein)` | **60** |
| **FX translation** | **Stable and small, with a published sensitivity.** Realised: FX **decreased** net revenue by $0.6m in Q2 FY27 and by $0.0m in the six months; it **increased** FY26 net revenue by $9.9m. Disclosed sensitivity: a 10.0% rise in the USD against all currencies cuts revenue by 4.0% | `Q2 FY27 10-Q, MD&A pp.25 and 28`; `FY26 10-K, MD&A p.44`; `FY26 10-K, Item 7A (Foreign Currency Exchange Rate Risk)` | **25** |
| **M&A / divestitures** | **Zero contribution in the reported periods — and this must not be confused with the FY23 acquisition effect.** No business combination contributed revenue in FY2026 or H1 FY27; the only acquisition-related item is a $2.4m management-basis *expense* adjustment in Q2 FY27, not revenue. The FY2023 revenue jump of +52.6% was the Zynga acquisition (closed 2022-05-23) and was **not** organic demand. Management states an intent to pursue further acquisitions; nothing is announced or sized | `01_historical-financials.md §6`; `FY26 10-K, Note (Debt)` (Zynga closed 2022-05-23); `TTWO 2Q27 Earnings Release, p.2` (business acquisition adjustment $2.4m); `Q2 2027 transcript, prepared remarks (Goldstein)` | **10** (today; it was the dominant bucket in FY2023) |

**What this table separates, and why it matters.** FY2026's +18.2% and FY2023's +52.6% are different animals: FY2023 was an **acquisition**, FY2026 was **own-title performance** (Section 6.2 shows five named franchises accounting for +19.0pp of the +18.2pp). Neither was price, and neither was measurable market-share gain. FX has never been more than ±0.2pp of annual growth in the periods disclosed. **On the evidence in this pool, Take-Two's revenue line is driven by its own release calendar and by continuing in-game spend on titles already shipped — not by market growth, not by pricing, and not by currency.**

---

### 3a. Sector-KPI check (`frameworks/SECTOR_OVERLAYS.md` / business-identity §3a)

The sector-appropriate KPIs for a hit-driven publisher with a live-service tail are: **bookings** (present), **deferred revenue / unsatisfied performance obligations** (present), **recurrent-spend share and growth** (present), **units per title** (absent from filings; two franchise-cumulative numbers exist only in the transcript), **players / MAU / DAU** (absent), **spend per player / ARPU** (absent), **attach or tie ratio to installed base** (absent and explicitly declined). Flagging rather than skipping: **three of the seven sector KPIs that would let an outsider model this company's revenue bottom-up are not disclosed anywhere in the pool.** That is the binding limitation on this module's revenue read, and it is the reason Section 6 is a title-level dollar decomposition rather than a volume × price build.

---

### 3b. Cycle Position (`MODULE_RULES.md` Cycle-Position Rule — hard rule)

This business has a demand cycle, but it is a **release/content cycle plus a third-party console hardware cycle**, not a commodity cycle. Business-model `10_external-dependency.md` classifies it "Partly externally driven" (risk score 52/100, inverted — higher = worse), scores the console hardware cycle **Mid**, and concludes the first-order driver of both FY27 quarters to date was "its own product." **This agent reaches the same read. No divergence to flag.**

**Where the latest reported period sits: at the TROUGH of the company's own release cycle — and it is emphatically not a run-rate.** Evidence, not assertion:

- Q2 FY27 GAAP net revenue of **$1,497.0m is the lowest of the last eight reported quarters** (range $1,359.8m–$1,773.8m, and the lowest since Q3 FY25) [`01_historical-financials.md §3`].
- Full game and other revenue fell to **19.2% of revenue from 28.1%** a year earlier — the new-release component is at its thinnest [3, MD&A p.24].
- The next quarter is guided to roughly **double**: Q3 FY27 GAAP revenue $3,270–3,420m against $1,699.0m in Q3 FY26; Net Bookings $3,350–3,500m against $1,757.1m [5; `01 §6`].

**Where the NEXT reported period will sit: at a launch peak that is explicitly not run-rate.** Grand Theft Auto VI launched **2026-11-19** — today, the run date [3, MD&A (Product Release Schedule); 10, p.13]. Three items must be labelled as one-time or non-run-rate, with the direction of the driver reflecting that they can reverse:

1. **The GTA VI launch itself** — a one-time full-game sell-in event. Management's own framing of what comes after is unquantified: it "expect[s] to set a new baseline for performance going forward" and explicitly refused FY28 guidance [4, Q&A (Creutz / Zelnick)]. **Non-run-rate; size of the recurring tail not proven from available data.**
2. **GTA VI: Ultimate Edition add-on content** — the company confirms this add-on content is allocated to recurrent consumer spending and "can be purchased separately", and it is the stated reason RCS for the GTA series is guided up [4, Q&A (Dessouky / Goldstein); 10, slides 8 and 10]. So part of the guided RCS "growth" is **launch-attached**, not steady-state engagement. **Non-run-rate.**
3. **The FY26 base itself contains a launch-year effect now reversing.** Color Block Jam released November 2024 and added $206.6m to FY26 revenue; in Q2 FY27 its net bookings "decreased double digits compared to its peak performance during last year's second quarter" and it cost $31.4m of GAAP revenue [1, MD&A p.44; 4, prepared remarks (Zelnick); 3, MD&A p.25]. **FY26's growth rate is therefore not a normalised base either.**

**Console hardware cycle: mid-cycle, no disclosed transition.** Guidance assumes "continued growth in the installed base of PlayStation 5 and Xbox Series X|S" [5, "Key assumptions and dependencies"]. The 10-K warns that demand for older-platform software "typically declines" when new hardware arrives and that results "may be more volatile and difficult to predict during console transitions", while noting backwards compatibility "could mitigate" it — with the hedge kept: "we cannot be certain how backwards compatibility will affect demand" [1, Item 1A]. No next-generation console announcement appears anywhere in the pool. Rising console hardware prices were raised by an analyst as a potential constraint on reach; management did not quantify any effect [4, Q&A (Schoell / Zelnick)].

**Stated plainly: neither the latest reported quarter nor the next guided quarter is a normalised run-rate.** Q2 FY27 is a pre-launch trough; Q3 FY27 is a launch spike. Downstream modules must not treat either as a baseline.

---

## 4. Revenue Driver Table (consolidated)

Magnitude is computed, not asserted: each row states what a **10% move in that driver** does to total revenue, measured on the latest reported quarter (Q2 FY27 GAAP net revenue $1,497.0m) or the six months to 2026-09-30, as labelled. High = >5%, Mid = 2–5%, Low = <2%.

| Driver | Current Level | Direction | Magnitude | Evidence |
|---|---|---|---|---|
| **Release slate — new title launches** | GTA VI launched 2026-11-19. NBA 2K27 shipped in Q2 FY27; PGA TOUR 2K27 and WWE 2K27 slated for the rest of FY27. Q3 FY27 Net Bookings guided $3,350–3,500m vs $1,757.1m prior year (+90.6% to +99.2%) | **Improving (guided), after deteriorating in both reported FY27 quarters** | **High.** A 10% shortfall against the Q3 FY27 guided midpoint of $3,425m is $342.5m = **4.2% of the FY27 guided Net Bookings midpoint ($8,100m)**; a 20% shortfall is $685.0m = **8.5%** | `Q2 FY27 10-Q, MD&A (Product Release Schedule)`; `TTWO 2Q27 Earnings Release, Q3 FY27 outlook`; `Q2 2027 transcript, prepared remarks (Goldstein)` |
| **Recurrent consumer spending (RCS) — in-game spend on titles already shipped** | $1,210.2m = **80.8%** of Q2 FY27 GAAP net revenue (71.9% a year earlier); $1,302.1m = 81% of Q2 FY27 Net Bookings. Realised: RCS **−9% YoY against guidance of −5%**, which management attributed to NBA 2K. Guided: FY27 flat YoY (→ 65% of bookings); Q3 FY27 **+12% YoY** | **Deteriorating in the reported quarter; guided to inflect up in H2 FY27** | **High.** A 10% move in RCS = **8.1%** of Q2 FY27 total GAAP revenue | `Q2 FY27 10-Q, MD&A p.24`; `TTWO 2Q27 Earnings Release, content tables`; `Q2 2027 transcript, prepared remarks (Goldstein)`; `Take-Two_Interactive_2Q FY27 deck, slides 8 and 10` |
| **Deferred-revenue recognition wedge** (bookings → GAAP revenue) | Q2 FY27 wedge **$104.3m** (7.0% of GAAP revenue) vs **$186.7m** a year earlier. Deferred revenue balance $1,042.1m at 2026-09-30 vs $1,189.6m at 2026-03-31. Guided wedge: $80m in Q3 FY27; ~$20m for FY27 as a whole | **Narrowing** — which flattered reported GAAP revenue growth by **+4.65pp** in Q2 FY27 (see §6.3) | **High on a quarterly GAAP basis** (the $104.3m wedge is 7.0% of quarterly revenue); **Low annually** (guided $20m = 0.2% of the $8,080m GAAP midpoint) | `TTWO 2Q27 Earnings Release, p.1–2`; `Q2 FY27 10-Q, Note 4 (Deferred Revenue)`; `TTWO 2Q27 Earnings Release, "Outlook"` |
| **Unsatisfied performance obligations** (the nearest thing to a backlog) | $1,492.5m total at 2026-09-30, of which **~$1,117.9m expected to be recognised within 12 months** = ~14% of the FY27 guided GAAP revenue midpoint | **Direction not assessable** — no prior-period comparative for the $1,492.5m figure is given in the 10-Q | **Mid.** A 10% move in the 12-month recognisable portion = $111.8m = **1.4%** of the FY27 GAAP midpoint — Low on that test; scored Mid because it is a disclosed forward anchor rather than an estimate | `Q2 FY27 10-Q, Note 4, p.511–513` |
| **Mobile portfolio (Zynga mature titles + new mobile launches)** | $731.1m = 48.8% of Q2 FY27 GAAP revenue, **down $90.5m YoY**; $1,493.4m = 49.3% of H1 FY27. FY27 guidance assumes mobile **down**, lapping Color Block Jam and moderating mature Zynga titles | **Deteriorating** (guided down; realised down in both FY27 quarters) | **Mid at a 10% move** (4.9% of H1 FY27 revenue); **High at 20%** (9.9%) | `Q2 FY27 10-Q, MD&A p.24 and p.27`; `Take-Two_Interactive_2Q FY27 deck, slide 8` |
| **Console revenue / third-party installed base** | $615.4m = 41.1% of Q2 FY27 GAAP revenue, **down $104.6m YoY**; 41.4% of H1 FY27. On the **Net Bookings** basis console is the largest platform at $742.6m (46%) | **Deteriorating in the reported quarter; guidance assumes the installed base keeps growing** | **Mid.** A 10% move in console revenue = **4.1%** of H1 FY27 total revenue | `Q2 FY27 10-Q, MD&A pp.23–24`; `TTWO 2Q27 Earnings Release, platform tables`; `TTWO 2Q27 Earnings Release, "Key assumptions"` |
| **Platform gatekeepers — Apple, Google, Sony, Microsoft (distribution access and terms)** | Five largest customers = **80.6%** of FY26 net revenue, with **Apple, Sony, Google and Microsoft each above 10.0%**. Each "generally ha[s] the discretion to set the amounts of their platform fees and change their platforms' terms of service … at their sole discretion" | **Stable as observed — no change in terms is disclosed in any reported period** | **High tail, zero realised.** Fees themselves hit cost of revenue, not revenue; the revenue exposure is access. No pool document quantifies any realised revenue effect, so this is sized only by the 80.6% exposed base | `FY26 10-K, Item 1 (Business — Sales and Marketing), p.294-ff`; `Q2 FY27 10-Q, MD&A (Online Content and Digital Distribution)` |
| **Direct-to-consumer channel shift** | **Not sized anywhere.** Management: "We have not described the percentage of our business that comes direct to consumer mobile. It is significant, and it is growing" | **Improving, per management — unquantified** | **Unknown.** Cannot be sized from available data; do not treat as a known offset to platform fees | `Q2 2027 transcript, 2026-11-09, Q&A (Heaney / Zelnick)`; `Q2 FY27 10-Q, MD&A (Online Content and Digital Distribution)` |
| **In-game advertising** | Inside RCS; "improved sequentially as we successfully attract new partners and increase ad yields" — **no dollar figure disclosed** | **Improving, per management — unquantified** | **Low / Unknown.** No disclosed base to sensitise | `Q2 2027 transcript, prepared remarks (Zelnick)` |
| **FX translation** | Realised −$0.6m on Q2 FY27 revenue and −$0.0m on the six months; +$9.9m on FY26. 40.6% of Q2 FY27 revenue was non-US | **Stable** | **Mid at the disclosed sensitivity** (a 10% USD move = 4.0% of revenue); **Low as realised** (−0.04% in Q2 FY27) | `Q2 FY27 10-Q, MD&A pp.25 and 28`; `FY26 10-K, Item 7A`; `FY26 10-K, MD&A p.44` |
| **Geographic mix** | US $888.9m (59%) / International $608.1m (41%) of Q2 FY27 GAAP revenue, against 58% / 42% a year earlier — a 1pp shift | **Stable** | **Low.** The entire year-on-year mix shift is ~1pp of revenue | `TTWO 2Q27 Earnings Release, geographic tables`; `FY26 10-K, Note 21, p.102` |
| **Physical retail channel** | $38.2m = 2.6% of Q2 FY27 GAAP revenue, down from 4.5%; digital online 97.4% | **Shrinking** | **Low.** A 10% move = 0.3% of revenue | `Q2 FY27 10-Q, MD&A p.24`; `TTWO 2Q27 Earnings Release, channel tables` |
| **Regulation of in-game monetisation (loot boxes, virtual currency)** | Exposed base = the **80.8%** of Q2 FY27 revenue that is RCS. Items in force: Australia's Phase 2 Industry Codes, Brazil's rules, the EU network's interpretive principles. Items proposed/unresolved: UK review, EU Digital Fairness Act draft, Spanish and Portuguese bills | **Unknown — no realised impact disclosed in any period** | **High tail, zero realised.** No pool document quantifies any revenue effect on Take-Two | `FY26 10-K, Item 1A (loot boxes / virtual currencies)`; business-model `10_external-dependency.md §1 and §1A` |
| **M&A** | Zero revenue contribution in FY2026 and H1 FY27. Stated intent to pursue acquisitions; nothing announced or sized | **No change** | **Low** today (it was the dominant driver in FY2023: Zynga, +52.6% revenue) | `01_historical-financials.md §6`; `Q2 2027 transcript, prepared remarks (Goldstein)` |

**Drivers deliberately NOT listed, with the reason** (per `MODULE_RULES.md` — no filler rows): commodity price (no commodity input; 97.4% digital delivery); utilisation / installed capacity (no plant-capacity constraint — fixed-asset capex was $162.8m in FY26 on $6,656.4m of revenue); store count / distribution points (no owned retail); order backlog / book-to-bill in the industrial sense (the nearest disclosure is deferred revenue and unsatisfied performance obligations, which IS listed); loan book / AUM / GMV (not a financial or marketplace business). Contract renewals and retention are not listed separately because no renewal or retention metric is disclosed — player retention is discussed qualitatively on the call but never quantified [4, prepared remarks (Zelnick) on Borderlands 4 promotions "driving improved engagement and player retention"].

---

## 5. Revenue Drivers By Disclosed Revenue Cut

Not segments — the company has one segment (§1). These are the four axes on which revenue IS disaggregated. **No profit, margin, or capital figure exists for any of them**, and the only directional profit statement in the whole pool is that "our mobile net revenue generally generates a lower gross margin percentage than our Console or PC revenue" because platform fees run through cost of revenue — with the size of that gap **not disclosed** [3, MD&A p.23]. Margin attribution belongs to `03_margin-drivers`, not here.

### Cut: By content — Recurrent consumer spending (80.8% of Q2 FY27 GAAP net revenue)

| Driver | Current Level | Direction | Magnitude | Evidence |
|---|---|---|---|---|
| Engagement spend on mature mobile titles (Color Block Jam, Match Factory!) | The two named decliners cost **$31.4m and $21.9m** of Q2 FY27 revenue — $53.3m together, which is **81%** of the $65.7m RCS decline ($53.3m ÷ $65.7m); the remaining $12.4m of the RCS fall is unattributed in the filing | **Deteriorating** | **Mid** (a 10% move in the mobile RCS base ≈ 4.9% of total revenue, using mobile revenue as the proxy base) | `Q2 FY27 10-Q, MD&A p.25` |
| NBA 2K in-game content and seasons | The RCS miss (−9% vs guided −5%) was attributed to NBA 2K; the H1 FY27 RCS decline was "partially offset by higher net revenue from NBA 2K" of **+$94.0m** over six months. FY27 guidance: NBA 2K up high single digits | **Deteriorating in Q2, guided to accelerate in H2 FY27** | **High** (NBA 2K was the single largest contributor to FY26 growth at +$416.9m = +7.40pp) | `Q2 2027 transcript, prepared remarks (Goldstein)`; `Q2 FY27 10-Q, MD&A p.27`; `FY26 10-K, MD&A p.44`; `deck slide 8` |
| Grand Theft Auto Online / GTA+ engagement, and GTA VI: Ultimate Edition add-on content | GTA series revenue was **up** in Q2 FY27 (amount not quantified). Management: the series "grew a double-digit percentage for both recurrent consumer spending and average monthly members for GTA+"; GTA V has sold "nearly 235 million units worldwide" | **Improving** | **High** (GTA products were 12.4% of FY26 and 12.6% of H1 FY27 net revenue; a 10% move = ~1.3% of revenue on the *current* base, but the FY27 guided step-up is far larger — see §7) | `Q2 FY27 10-Q, MD&A p.25`; `Q2 2027 transcript, prepared remarks (Zelnick)` |
| In-game advertising | "Improved sequentially"; no dollar figure | **Improving, unquantified** | **Unknown** | `Q2 2027 transcript, prepared remarks (Zelnick)` |

### Cut: By content — Full game and other (19.2% of Q2 FY27 GAAP net revenue)

| Driver | Current Level | Direction | Magnitude | Evidence |
|---|---|---|---|---|
| Prior-year launch titles lapping (Borderlands 4, released Sep-2025; Mafia: The Old Country, released Aug-2025) | These two cost **$128.0m and $56.3m** of Q2 FY27 revenue — $184.3m against a full-game decline of $211.1m (**87%**) | **Deteriorating** (a lapping effect, by construction) | **High** — $184.3m = 10.4% of prior-year quarterly revenue | `Q2 FY27 10-Q, MD&A p.25` |
| New full-game launches in the slate (GTA VI, PGA TOUR 2K27, WWE 2K27) | GTA VI launched 2026-11-19; the other two are slated within FY27 | **Improving (guided)** | **High** — the entire FY27 guided bookings increase of ~$1,379m (8,100 midpoint vs 6,721.0 actual) sits in H2 | `Q2 FY27 10-Q, MD&A (Product Release Schedule)`; `FY26 10-K, MD&A p.44` (FY26 bookings $6,721.0m); `TTWO 2Q27 Earnings Release, "Outlook"` |

### Cut: By platform

| Driver | Current Level | Direction | Magnitude | Evidence |
|---|---|---|---|---|
| Mobile | $731.1m (48.8% of GAAP revenue), −$90.5m YoY; on Net Bookings $707.6m (45%) | **Deteriorating** (guided down for FY27) | **Mid** (10% move = 4.9% of H1 FY27 revenue) | `Q2 FY27 10-Q, MD&A p.24`; `TTWO 2Q27 Earnings Release, platform tables` |
| Console | $615.4m (41.1% of GAAP revenue), −$104.6m YoY; on Net Bookings $742.6m (**46% — the largest platform on the bookings basis**) | **Deteriorating in Q2; the GTA VI launch is console-only at release** | **Mid** (10% move = 4.1% of H1 FY27 revenue) | same; `Q2 2027 transcript, Q&A (Yang / Zelnick)` ("GTA VI is available on 2 consoles when it launches on November 19") |
| PC and other | $150.5m (10.1%), −$81.7m YoY — the steepest percentage fall of the three | **Deteriorating** | **Mid** (10% move = 1.0% of revenue → Low on that test; scored Mid because it fell 4.6pp of total revenue growth in one quarter) | `Q2 FY27 10-Q, MD&A p.24` |

### Cut: By distribution channel and by geography — immaterial as *drivers*

Digital online is 97.4% of Q2 FY27 GAAP revenue and physical retail 2.6%, so the channel cut carries almost no independent driver content — it mirrors the title mix. Geography moved 1pp (US 59% vs 58%). Both are recorded for completeness and are **not** material revenue drivers on this evidence [3, MD&A p.24; 5, geographic tables].

---

## 6. Revenue Growth Decomposition

### 6.1 Primary decomposition — Q2 FY27 GAAP total net revenue, year on year

Basis: **GAAP total net revenue**, three months ended 2026-09-30 vs three months ended 2025-09-30. Prior-year base = **$1,773.8m**. Observed change = **−$276.8m = −15.6%** [3, MD&A p.24–25].

| Component | Contribution to Growth (pp) | Evidence |
|---|---:|---|
| **Volume / title performance** — Borderlands franchise (Borderlands 4 released Sep-2025) | **−7.22** | `Q2 FY27 10-Q, MD&A p.25` ("lower net revenue of $128.0 from our Borderlands franchise") |
| **Volume / title performance** — Mafia franchise (Mafia: The Old Country released Aug-2025) | **−3.17** | same ("$56.3 from our Mafia franchise") |
| **Volume / title performance** — Color Block Jam | **−1.77** | same ("$31.4 from Color Block Jam") |
| **Volume / title performance** — Match Factory! | **−1.23** | same ("$21.9 from Match Factory!") |
| **Price** | **Not separately disclosed — 0.00pp assignable** | No ASP, price-per-title, or ARPU disclosure exists in the pool; management declined to quantify tie ratios or SKU pricing [4, Q&A (Crum / Zelnick; Schoell / Zelnick)] |
| **Mix** | **Not separately disclosed as a revenue effect — 0.00pp assignable** | The company discloses mix only as a *margin* factor ("the overall product mix between mobile and other game sales may affect our gross margin percentage") [3, MD&A p.23]. The content / platform / channel / geography cuts are **identities that re-slice the same −$276.8m**, not additional components — they are shown separately in §6.2 and are not added here |
| **FX** | **−0.03** | `Q2 FY27 10-Q, MD&A p.25` ("Changes in foreign currency exchange rates decreased net revenue by $0.6") |
| **Acquisitions / divestitures** | **0.00** | No business combination contributed revenue in the period; the only acquisition item is a $2.4m management-basis *expense* adjustment [5, p.2] |
| **Other (net residual — includes the unquantified INCREASE in Grand Theft Auto series revenue, netted against unnamed declines)** | **−2.18** | Derived as the gap between the Total row and the named components. The filing states the decline "was partially offset by higher net revenue from our Grand Theft Auto series" and does **not** quantify it [3, MD&A p.25] |
| **Total revenue growth** | **−15.61** | `Q2 FY27 10-Q, MD&A p.24` (total net revenue $1,497.0 vs $1,773.8, −15.6%) |

### 6.2 Cross-checks — the four disclosed axis identities (each reconciles exactly, zero residual)

These are **identities, not additional drivers.** Each re-slices the same −$276.8m. They are shown because each sums exactly to the Total, which independently validates the base and the total used in §6.1.

| Axis | Components (pp of the $1,773.8m base) | Sum |
|---|---|---:|
| **By content** | RCS −$65.7m = **−3.70pp**; Full game and other −$211.1m = **−11.90pp** | **−15.61** ✓ |
| **By platform** | Mobile −$90.5m = **−5.10pp**; Console −$104.6m = **−5.90pp**; PC and other −$81.7m = **−4.61pp** | **−15.61** ✓ |
| **By channel** | Digital online −$234.3m = **−13.21pp**; Physical retail and other −$42.5m = **−2.40pp** | **−15.61** ✓ |
| **By geography** | United States −$147.2m = **−8.30pp**; International −$129.6m = **−7.31pp** | **−15.61** ✓ |

Sources: `Q2 FY27 10-Q, MD&A p.24–25` (content, platform, channel deltas); `TTWO 2Q27 Earnings Release, geographic tables` (US $888.9m vs $1,036.1m; International $608.1m vs $737.7m).

**Supplementary — six months ended 2026-09-30 (base $3,277.6m; observed −$246.7m = −7.5%).** Named: Borderlands −$111.5m (−3.40pp), Color Block Jam −$64.2m (−1.96pp), Mafia −$55.2m (−1.68pp), Match Factory! −$36.1m (−1.10pp), Toy Blast −$14.9m (−0.46pp), WWE 2K −$14.0m (−0.43pp), **partially offset by NBA 2K +$94.0m (+2.87pp)**; FX −$0.0m (0.00pp). Named components sum to **−6.16pp**; residual **−1.37pp**; total **−7.53pp** [3, MD&A p.27–28].

**Supplementary — FY2026 annual (base $5,633.6m; observed +$1,022.8m = +18.2%).** Named: NBA 2K +$416.9m (+7.40pp), Borderlands +$210.3m (+3.73pp), Color Block Jam +$206.6m (+3.67pp), Toon Blast +$121.9m (+2.16pp), Grand Theft Auto +$115.1m (+2.04pp); FX +$9.9m (+0.18pp). Named components sum to **+19.18pp**; residual **−1.03pp** (net unnamed declines, of which the filing names only the lapping of Sid Meier's Civilization VII, released Feb-2025, without a figure); total **+18.16pp** [1, MD&A p.44].

### 6.3 Bookings-to-GAAP basis bridge — kept SEPARATE so it is never double-counted

This is a **recognition** effect, not demand, and it does **not** enter §6.1 (whose components are already GAAP net revenue deltas). Adding it there would double-count.

| Item | Q2 FY27 | Q2 FY26 | Change |
|---|---:|---:|---:|
| Net Bookings | 1,601.3 | 1,960.5 | **−359.2 / −18.3%** |
| less: net build in deferred net revenue (the wedge) | 104.3 | 186.7 | −82.4 |
| **GAAP total net revenue** | **1,497.0** | **1,773.8** | **−276.8 / −15.6%** |

**What the narrowing wedge did:** holding the deferral build at the prior year's $186.7m, GAAP revenue would have been $1,601.3 − $186.7 = **$1,414.6m**, i.e. **−20.2%** year on year. Reported was −15.6%. So the smaller deferral build added **$82.4m ÷ $1,773.8m = +4.65pp** to reported GAAP revenue growth. **The GAAP line understated the fall in the underlying bookings by 2.7 percentage points (−15.6% vs −18.3%), and the reason is the wedge, not trading.** Sources: [5, p.1–2]; [3, MD&A — Net Bookings].

**No Net Bookings decomposition is possible.** The 10-Q attributes the −$359.2m bookings decline to "lower Net Bookings from our Borderlands franchise … NBA 2K; our Mafia franchise … Color Block Jam and Match Factory!", "partially offset by higher Net Bookings from our Grand Theft Auto series" — **with no dollar amount against any name** [3, MD&A — Net Bookings]. The named set also differs from the GAAP set (it adds NBA 2K). The GAAP-basis title deltas therefore **cannot** be carried onto the bookings basis; see §6a.

---

## 6a. Decomposition Attribution and Residual (`MODULE_RULES.md` "Driver Attribution" / §15)

Every pp figure in §6.1 is derived by one multiplication: **the filing's own stated dollar change for that component, divided by the prior-year-period GAAP total net revenue**. The ratio's basis is named on every line and is the same for every line.

```
Ratio basis for ALL lines below: denominator = prior-year-quarter GAAP TOTAL NET REVENUE
  = $1,773.8m (three months ended 2025-09-30) [Q2 FY27 10-Q, MD&A p.24]
Numerator basis: the MD&A's own stated year-on-year change in GAAP NET REVENUE for that
  component, same period pair [Q2 FY27 10-Q, MD&A p.25]
→ numerator basis and denominator basis MATCH (both GAAP net revenue, same period pair).

Borderlands franchise: -$128.0m ÷ $1,773.8m [Q2 FY27 10-Q, MD&A p.25, 2026-11-09]
  = -7.22pp of the -15.61pp observed growth
  → basis matches

Mafia franchise: -$56.3m ÷ $1,773.8m [Q2 FY27 10-Q, MD&A p.25, 2026-11-09]
  = -3.17pp of the -15.61pp observed growth
  → basis matches

Color Block Jam: -$31.4m ÷ $1,773.8m [Q2 FY27 10-Q, MD&A p.25, 2026-11-09]
  = -1.77pp of the -15.61pp observed growth
  → basis matches

Match Factory!: -$21.9m ÷ $1,773.8m [Q2 FY27 10-Q, MD&A p.25, 2026-11-09]
  = -1.23pp of the -15.61pp observed growth
  → basis matches

FX: -$0.6m ÷ $1,773.8m [Q2 FY27 10-Q, MD&A p.25, 2026-11-09]
  = -0.03pp of the -15.61pp observed growth
  → basis matches. NOTE: this is the filing's own REALISED FX effect on net revenue, NOT
    the Item 7A sensitivity (a 10% USD move = 4.0% of revenue). The sensitivity is a
    hypothetical bound measured against "all currencies" and is NOT applied here.

Price: Asserted from disclosure as NOT DISCLOSED — no ratio applied, 0.00pp assignable.
Mix: Asserted from disclosure as NOT DISCLOSED as a revenue effect — no ratio applied,
  0.00pp assignable. The content/platform/channel/geography cuts are identities on the
  same total (§6.2), not components, and are deliberately NOT added into §6.1.
Acquisitions / divestitures: Asserted from disclosure — no business combination revenue
  in the period; 0.00pp. No ratio applied.
Other (residual): derived as Total minus named components, NOT asserted:
  -$276.8m - (-$237.6m named titles) - (-$0.6m FX) = -$38.6m
  -$38.6m ÷ $1,773.8m = -2.18pp
  → includes the filing's unquantified INCREASE in Grand Theft Auto series revenue,
    netted against unnamed declines. Its sign is net negative, so the GTA increase is
    smaller than the unnamed declines it offsets.
```

**A basis the ratios were NOT measured on, and are therefore refused.** These deltas are measured on **GAAP net revenue**. They must not be applied to **Net Bookings**, because (a) the bookings decline is a different number (−$359.2m / −18.3% vs −$276.8m / −15.6%), (b) the filing's bookings attribution names a **different set of titles** (it adds NBA 2K), and (c) the Net Bookings attribution carries **no dollar amounts at all**. Carrying a GAAP-basis title delta onto the bookings basis — or onto the vendor consensus "Revenue" field, which is Net Bookings [12] — would be the exact basis switch §15 bans. **Refused.**

**Reconciliation to the Total row.** Named components (four titles + FX) = −7.22 − 3.17 − 1.77 − 1.23 − 0.03 = **−13.42pp**. Residual = **−2.18pp**. Sum = **−15.60pp**, against the stated Total of **−15.61pp** (the $0.01pp gap is rounding on six figures). **So: −13.4pp reconciled, −2.2pp residual, −15.6pp total.**

**How large is the residual, and what does it cap?** The residual is **14% of the observed change** (2.18 ÷ 15.61). The decomposition therefore explains **86%** of the quarter's revenue fall from named, filed sources — this bridge reconciles well, and Section 7 is not resting on a mostly-unexplained bridge. But the single largest named component, Borderlands, is **−7.22pp of −15.61pp = 46% of the observed fall** — **just under half**. Under the "adjective must match the number" rule that permits "the main driver" only where the printed arithmetic clears roughly half, Borderlands sits marginally **below** that threshold: it is the largest single named contributor, and it is **not** a majority of the move. The honest statement is that **the move was caused by a set of four prior-year launches lapping, which together account for −13.40pp (86%) of the fall; no single title accounts for half of it.**

The two supplementary bridges reconcile as follows: six months — explained −6.16pp, residual −1.37pp, total −7.53pp (residual = 18% of the move); FY2026 — explained +19.18pp, residual −1.03pp, total +18.16pp (residual = 6% of the move, and it runs *against* the named components).

```
RF-EARN-001: revenue decomposition reconciled — explained -13.4pp, residual -2.2pp, total -15.6pp
```

---

## 7. The Single Biggest Revenue Driver

**The single biggest revenue driver is the sell-through of Grand Theft Auto VI — units sold and the attached GTA VI: Ultimate Edition add-on content that the company allocates to recurrent consumer spending.** Its current direction is **unproven**: the title launched on **2026-11-19**, the run date, so **zero reported periods contain any of it.**

**Actual contribution evidence** — for every component discussed in this conclusion or in the realised attribution above:

- **Actual contribution evidence — Grand Theft Auto VI: unknown**; the title launched 2026-11-19 and appears in no reported period. There is no matched-period, matched-scope bridge to any company total because no period containing it has been reported. Management's only stated input is unverifiable and unquantified: preorders "tracking far in excess of our initial expectations" and "the level of preorders generated is extraordinary", with **no preorder count, no price, and no unit figure anywhere in the pool** [4, prepared remarks (Zelnick; Goldstein)]. Management explicitly declined to quantify the tie ratio or installed-base assumption embedded in guidance [4, Q&A (Crum / Zelnick)]. **Its actual contribution magnitude and importance are held unknown throughout this conclusion.**
- **Actual contribution evidence — Grand Theft Auto series (realised, Q2 FY27): unknown**; the filing states only that the decline "was partially offset by higher net revenue from our Grand Theft Auto series" and gives **no dollar amount** [3, MD&A p.25]. It sits inside the −2.18pp residual, whose net sign is negative. The nearest sized facts are scope-matched shares, not contributions: GTA products were **12.4%** of FY26 net revenue and **12.6%** of H1 FY27 net revenue [1, Item 1A p.10; 3, MD&A (Product Release Schedule)]. A share of revenue is not a contribution to growth, and is not treated as one here.
- **Actual contribution evidence — Borderlands franchise: disclosed**; −$128.0m of GAAP net revenue, three months ended 2026-09-30 vs 2025-09-30, from the company's own MD&A attribution, which also names the cause (Borderlands 4 released Sep-2025) [3, MD&A p.25]. Bridged to the same company total in §6a: −7.22pp of −15.61pp (46%).
- **Actual contribution evidence — Mafia franchise: disclosed**; −$56.3m, same period pair, same source and bridge (−3.17pp) [3, MD&A p.25].
- **Actual contribution evidence — Color Block Jam: disclosed**; −$31.4m, same period pair and bridge (−1.77pp) [3, MD&A p.25]. The company's qualification is retained: management attributed the fall to lapping "its peak performance during last year's second quarter", not to weak demand [4, prepared remarks (Zelnick)].
- **Actual contribution evidence — Match Factory!: disclosed**; −$21.9m, same period pair and bridge (−1.23pp) [3, MD&A p.25].
- **Actual contribution evidence — NBA 2K: disclosed for the six months, unknown for the quarter.** Six months ended 2026-09-30: **+$94.0m** of GAAP net revenue, stated by the company as a partial offset (+2.87pp of the −7.53pp six-month move) [3, MD&A p.27]. For the **quarter**, NBA 2K is named among mobile decliners with **no dollar amount** and is named by the CFO as the cause of the RCS miss (−9% vs guided −5%) — a source-attributed management explanation, retained as such and **not** converted into a quantified quarterly contribution [3, MD&A p.25; 4, prepared remarks (Goldstein)].
- **Actual contribution evidence — recurrent consumer spending (RCS): disclosed**; −$65.7m of GAAP net revenue for the quarter (−3.70pp), from the company's own content-axis table, which reconciles exactly with full game and other to the −$276.8m total [3, MD&A p.24–25]. Of that −$65.7m, $53.3m (81%) is attributed by name to Color Block Jam and Match Factory!; **$12.4m is unattributed in the filing**.
- **Actual contribution evidence — FX: disclosed**; −$0.6m for the quarter and −$0.0m for the six months, stated by the company as the effect of exchange-rate changes on net revenue [3, MD&A pp.25 and 28]. The Item 7A ±4.0%-per-10%-USD sensitivity is a **separate hypothetical bound** and is not used as a realised contribution.
- **Actual contribution evidence — the deferred-revenue recognition wedge: disclosed and derived.** Disclosed: Net Bookings $1,601.3m vs GAAP net revenue $1,497.0m, and $1,960.5m vs $1,773.8m a year earlier [5, p.1–2]. Derived (reproducible bridge, §6.3): the $82.4m smaller deferral build added **+4.65pp** to reported GAAP revenue growth. Assumption stated: the counterfactual holds the prior-year deferral build constant; uncertainty is that the wedge is itself an outcome of title and SKU mix, which the company does not decompose. This is a **recognition** effect, not demand, and it is deliberately excluded from §6.1.
- **Actual contribution evidence — direct-to-consumer channel, in-game advertising, and regulation of in-game monetisation: unknown** in all three cases. D2C: "We have not described the percentage of our business that comes direct to consumer mobile. It is significant, and it is growing" — no base, no bridge [4, Q&A (Heaney / Zelnick)]. Advertising: "improved sequentially" — no figure [4, prepared remarks (Zelnick)]. Regulation: no pool document quantifies any realised revenue effect on Take-Two [1, Item 1A]. None is converted into established group-growth importance.
- **Actual contribution evidence — the −2.18pp residual: unknown by construction.** It is derived (Total less named components) rather than disclosed, and the filing identifies only its direction-of-offset ("partially offset by higher net revenue from our Grand Theft Auto series"), not its composition.

**Separately labelled HYPOTHESIS — the forward sensitivity question, under explicit assumptions. This is not proof of realised historical contribution.**

*Question asked:* which driver, if it moved 10–20%, would move revenue most?
*Answer, as a hypothesis:* GTA VI sell-through, on the **Net Bookings** basis.
*Assumptions, stated:* (i) management's Q3 FY27 Net Bookings guidance of $3,350–3,500m (midpoint $3,425m) against $1,757.1m a year earlier is the embedded expectation [5; 4, prepared remarks (Goldstein)]; (ii) a shortfall or beat in GTA VI is **not offset elsewhere in the portfolio** — this is a **zero-mitigation bound, not a forecast** (§9), and the company itself warns "the individual components of the financial outlook may not foot to the totals" [5, "Key assumptions and dependencies"]; (iii) the arithmetic stays on the Net Bookings basis and is not carried onto GAAP revenue, where an $80m guided deferral wedge sits [5].
*Arithmetic:* a **10%** shortfall against the Q3 FY27 guided midpoint = $342.5m = **4.2%** of the FY27 guided Net Bookings midpoint of $8,100m. A **20%** shortfall = $685.0m = **8.5%**. For scale, the whole FY27 guided bookings increase is $8,100m − $6,721.0m = **$1,379.0m (+20.5%)**, and the Q3 guided increase alone is $3,425m − $1,757.1m = **$1,667.9m** — i.e. **more than the entire year's guided growth sits in the launch quarter**, which is why one title clears the High magnitude bar on its own.
*Uncertainty, stated:* the embedded GTA VI unit and price assumptions are undisclosed, so the "10–20% move" is a move against *guidance*, not against a known unit forecast. No preorder figure, unit figure, price, or attach rate exists in the pool. Both management's guidance and the Street's consensus were set **before any sell-through existed** [`04_guidance-consensus.md §7`].

**The one thing worth saying twice.** The realised evidence and the forward driver point in opposite directions, and both are true on their own period. Realised: the last two reported quarters were driven by four prior-year launches lapping (−13.40pp of a −15.61pp quarter, 86% explained, no single title reaching half). Forward: essentially the entire FY27 guided increase rests on one title that had not shipped in any reported period. **That is a release-calendar business at the trough of its own cycle immediately before its largest launch — not a demand trend, and not a run-rate in either direction** (§3b).

---

## 8. Computation Log (executed, not mental arithmetic)

```python
# Q2 FY27 GAAP net revenue decomposition. Base = prior-year quarter 1773.8 [3, MD&A p.24]
base=1773.8; tot=-276.8
named={'Borderlands':-128.0,'Mafia':-56.3,'ColorBlockJam':-31.4,'MatchFactory':-21.9}
fx=-0.6
resid = tot - sum(named.values()) - fx
# axis identities
content=[-65.7,-211.1]; platform=[-90.5,-104.6,-81.7]; channel=[-234.3,-42.5]
geo=[888.9-1036.1, 608.1-737.7]
# 6M FY27. Base 3277.6 ; total -246.7
# FY2026. Base 5633.6 ; total +1022.8
# wedge counterfactual
cf = (1601.3-186.7)/1773.8-1
```

```
Q2 FY27 pp: Borderlands -7.22  Mafia -3.17  ColorBlockJam -1.77  MatchFactory -1.23
            FX -0.03   Other/residual -2.18   TOTAL -15.61
            named+FX explained = -13.42 ; residual = -2.18 ; sum = -15.60 vs total -15.61 (rounding)
            residual share of move = 13.9%  ; largest named (Borderlands) share = 46.2%
Axis identities (pp, must equal -15.61):
  content  [-3.70, -11.90] sum -15.61 OK
  platform [-5.10, -5.90, -4.61] sum -15.61 OK
  channel  [-13.21, -2.40] sum -15.61 OK
  geography[-8.30, -7.31] sum -15.61 OK
6M FY27 pp: Bor -3.40 CBJ -1.96 Mafia -1.68 MF -1.10 ToyBlast -0.46 WWE -0.43 NBA2K +2.87
            FX 0.00 ; explained -6.16 ; residual -1.37 ; TOTAL -7.53 OK
FY2026 pp : NBA2K +7.40 Bor +3.73 CBJ +3.67 ToonBlast +2.16 GTA +2.04 FX +0.18
            explained +19.18 ; residual -1.03 ; TOTAL +18.16 OK
Wedge: Q2FY27 1601.3-1497.0 = 104.3 (7.0% of GAAP rev) ; Q2FY26 1960.5-1773.8 = 186.7 (10.5%)
       constant-wedge counterfactual GAAP growth = -20.25% vs reported -15.61%  -> +4.65pp effect
       82.4/1773.8 = 4.65pp OK
GTA VI sensitivity (Net Bookings basis): 10% of 3425 = 342.5 = 4.23% of 8100
                                         20% of 3425 = 685.0 = 8.46% of 8100
       FY27 guided increase 8100-6721.0 = 1379.0 (+20.5%) ; Q3 guided increase 3425-1757.1 = 1667.9
RCS attribution: 31.4+21.9 = 53.3 of 65.7 = 81.1% named ; 12.4 unattributed
Full-game attribution: 128.0+56.3 = 184.3 of 211.1 = 87.3% named
RCS share arithmetic check: 6721.0 x 0.78 = 5242.4 ; 5242.4/8100 = 64.7% ~ guided 65% OK
Deferred-revenue forward anchor: 1117.9/8080 = 13.8% of FY27 guided GAAP revenue midpoint
```

---

## 9. Citations

[1] FY2026 Form 10-K (fiscal year ended 2026-03-31) — Item 1 Business pp.1, 292–296 (five largest customers 80.6%; Apple, Sony, Google, Microsoft each >10.0%); Item 1A Risk Factors p.10 (GTA 12.4%; five best-selling franchises 54.3%), Item 1A (declines in consumer spending; console transitions; loot boxes / virtual currencies); MD&A pp.43–44 (consolidated statements of operations; Net Bookings $6,721.0m vs $5,648.0m, +19.0%; title-level revenue drivers; content / platform / channel cuts; FX +$9.9m); Item 7A (Interest Rate Risk; Foreign Currency Exchange Rate Risk); Critical Accounting Policies — Goodwill (two unnamed reporting units); Note 9 (Goodwill and Intangible Assets, Net) p.83; Note 21 (Segment Reporting and Geographic Information) p.102. `data/TTWO/10K_2025_26_0001628280-26-037434.pdf`
[2] FY2025 Form 10-K (fiscal year ended 2025-03-31) — prior-year comparatives. `data/TTWO/10K_2024_25_0001628280-25-026694.pdf`
[3] Q2 FY2027 Form 10-Q (quarter ended 2026-09-30) — MD&A "Trends and Factors Affecting our Business" pp.22–23 (Product Release Schedule; GTA 12.6% of six-month net revenue; GTA VI launch 2026-11-19; Hardware Platforms 41.4%; Online Content and Digital Distribution 97.9%; platform fees in cost of revenue and mobile's lower gross margin; Player acquisition costs); MD&A "Operating Metric — Net Bookings" p.23 (Net Bookings definition; $1,601.3m vs $1,960.5m, −18.3%; $2,987.2m vs $3,383.6m, −11.7%; title attribution without amounts); MD&A Results of Operations pp.24–25 (total net revenue $1,497.0m vs $1,773.8m; content / platform / channel cuts; title-level deltas Borderlands −$128.0m, Mafia −$56.3m, Color Block Jam −$31.4m, Match Factory! −$21.9m; RCS −$65.7m; full game −$211.1m; FX −$0.6m); MD&A pp.27–28 (six-month comparison; NBA 2K +$94.0m; FX −$0.0m); Note 4 (Revenue — Deferred Revenue $1,042.1m / $1,189.6m; unsatisfied performance obligations $1,492.5m, of which ~$1,117.9m within 12 months); Note 14 (Segment Reporting). `data/TTWO/10Q_2Q_0001628280-26-072254.pdf`
[4] Take-Two Interactive Software, Inc., **Q2 FY2027 Earnings Call, 2026-11-09** — S&P Capital IQ **verbatim transcript** (Presentation + Question and Answer), prepared remarks (Zelnick: Q2 net bookings $1.6bn below the $1.62–1.67bn range; preorders "tracking far in excess of our initial expectations"; GTA V "nearly 235 million units worldwide"; GTA series "grew a double-digit percentage for both recurrent consumer spending and average monthly members for GTA+"; NBA 2K27 "sold over 4 million units so far"; Borderlands franchise "surpassed 100 million units sold"; Toon Blast +4%, Words With Friends +6%; advertising "improved sequentially"; Color Block Jam down double digits vs its peak quarter); prepared remarks (Goldstein: RCS −9% vs guidance −5%, "driven by NBA 2K", 81% of net bookings; label mix 37% Rockstar / 34% Zynga / 29% 2K; Q3 net bookings vs "$1.76 billion in the prior year"; RCS +12% in Q3; FY27 RCS flat at 65% of net bookings); Q&A (Schoell / Zelnick on preorders, console prices, PC and streaming; Crum / Zelnick on tie ratios and installed base; Heaney / Zelnick on direct-to-consumer; Dessouky / Goldstein on GTA VI: Ultimate Edition add-on content allocated to RCS; Creutz / Zelnick on "set a new baseline for performance"; Yang / Zelnick on console-only launch). `data/TTWO/Take-Two Interactive Software, Inc., Q2 2027 Earnings Call, Nov 09, 2026.rtf`
[5] TTWO Q2 FY2027 earnings release (Form 8-K Exhibit 99.1), dated 2026-11-09 — p.1 (Net Bookings $1,601.3m, −18%); p.2 (management-reporting adjustment table incl. business acquisition $2.4m); "Outlook for Fiscal Year 2027" (GAAP net revenue $7,980–8,180m; Net Bookings $8,000–8,200m; capex ~$290m; CFO over $1,000m); "Fiscal Third Quarter Ending December 31, 2026" (Net Bookings $3,350–3,500m; GAAP net revenue $3,270–3,420m); "Key assumptions and dependencies"; "Net Revenue and Net Bookings by Content, Platform Mix, Distribution Channel, and Geographic Region" (Q2 FY27 and Q2 FY26, three- and six-month). `data/TTWO/TTWO 2Q27 Earnings Release FINAL.pdf`
[6] TTWO Q1 FY2027 earnings release (Form 8-K Exhibit 99.1), dated 2026-08-07 — prior FY27 guidance (GAAP net revenue $7,900–8,100m) and Q1 FY27 results. `data/TTWO/TTWO 1Q27 Earnings Release FINAL 8-6-2026.pdf`
[7] Take-Two Interactive Software, Inc., **Q1 FY2027 Earnings Call, 2026-08-07** — verbatim transcript; Q&A (Creutz / Zelnick: "it's really not what we're seeing… we don't feel like the consumer is pulling back at all"; direct-to-consumer margin comment). `data/TTWO/Take-Two Interactive Software, Inc., Q1 2027 Earnings Call, Aug 07, 2026.rtf`
[8] Upstream: `analyses/TTWO_2026-11-19/earnings/00_earnings-data-triage.md` — jurisdiction, reporting standard, currency, fiscal-year end, interim basis, the GAAP-revenue-vs-Net-Bookings basis warning, and the partial-data table (no caps bind).
[9] Upstream: `analyses/TTWO_2026-11-19/earnings/01_historical-financials.md` — revenue baseline (FY2022–FY2026 annual; eight-quarter trend; TTM), the FY2023 Zynga acquisition effect, the seasonality read, and the vendor-vs-filing gross-profit basis warning.
[10] Cross-module: `analyses/TTWO_2026-11-19/business-model/03_segment-map.md` (single-segment confirmation; the four disclosed revenue cuts; the two unnamed goodwill reporting units) and `.../10_external-dependency.md` (cyclicality classification "Partly externally driven", external dependency risk 52/100 **inverted — higher = worse**, console hardware cycle Mid, platform-gatekeeper concentration High, FX sensitivity, policy register). Deck references ("Take-Two_Interactive_2Q FY27 FINAL deck, slides 5, 8, 10, 13") are to `data/TTWO/Take-Two_Interactive_2Q FY27 FINAL.pdf`.
[11] Capital IQ `Financials_Quarterly` / `Financials_Annual` exports — **tier-5 vendor exports, named here only to record that they are NOT used for any revenue figure in this report**, because the vendor reclassifies asset writedowns out of cost of revenue and its revenue/gross-profit series is therefore not interchangeable with the filings' [9 §1, note 2]. `data/TTWO/Take Two Interactive Software Inc NasdaqGS TTWO Financials_Quarterly.xls`; `…Financials_Annual.xls`
[12] Upstream: `analyses/TTWO_2026-11-19/earnings/04_guidance-consensus.md` — the proof that the Capital IQ consensus "Revenue" field is on the **Net Bookings** basis (FQ2 2027 actual 1,601.30; FY2027 guidance low/high 8,000 / 8,200 matching the Net Bookings range, not the GAAP range), the FY27 and Q3 FY27 guidance tables, and the "bar is high" read with its stated limitation that guidance and consensus both predate any GTA VI sell-through.

**Not used:** `Alphabet Inc NasdaqGS GOOGL Key Developments.xls` — a wrong-company pool contaminant (Alphabet Inc., not Take-Two). It is cited nowhere in this report. The DEF 14A export (2026-07-27) is an empty one-cell shell and carries no revenue content; it is a management-governance input, not an earnings one [8].



---

## earnings / 03_margin-drivers.md

_Source: `03_margin-drivers.md`_

# Margin Drivers — TTWO

**Company:** Take-Two Interactive Software, Inc. (NasdaqGS:TTWO) · **Regime:** US SEC (10-K / 10-Q / 8-K Ex. 99.1) · **Standard:** US GAAP · **Currency:** USD, millions · **Fiscal year:** ends 31 March (FY2026 = year ended 2026-03-31; FY2027 in progress) [1][3].

**Evidence binding.** Frozen supervisor-verified read mode. Every manifest / corpus / CIQ-facts / extract read resolved inside the single bound generation `.extract-generations/0af638492ecb0521db2676c79d75e6940c7227bb9f192567527b8a57eb43203d/`. The live logical path `data/TTWO/` was not read; it is a citation label only. One pool file (`Alphabet Inc NasdaqGS GOOGL Key Developments.xls`) is a wrong-company contaminant and is cited nowhere below.

**Upstream inputs present.** `00_earnings-data-triage.md`, `01_historical-financials.md` and `04_guidance-consensus.md` were all read. Business-model module available: `02_business-identity.md`, `03_segment-map.md`, `06_value-chain.md`, `10_external-dependency.md` were read. No "module not available" disclaimer applies.

**Three basis rules that govern every margin number below — read first.**

1. **Filing basis only for margins.** The Capital IQ vendor series reclassifies asset writedowns out of cost of revenue. On the vendor basis Q1 FY27 gross margin reads 60.4%; on the filing basis it is **57.5%**, because a $43.4m impairment charged to cost of revenue is moved out [3, Item 2 MD&A; 9]. The widely-quoted "Q1→Q2 gross margin fell 290bps" is a **vendor artefact** — on the filing basis it was 57.5% → 57.5%, flat. **Every margin in Sections 2–9 is on the filing basis.** Vendor figures appear only where the filing does not disclose the line, and are labelled ᵛ.
2. **Three profit bases exist and are never mixed.** GAAP income/(loss) from operations; the company's own **non-GAAP EBITDA** (GAAP net income excluding interest income/expense, income taxes, depreciation, and amortisation and impairment of **acquired** intangibles — it does *not* add back stock-based compensation and does *not* add back amortisation of internally capitalised software) [5, "Non-GAAP Financial Measure"]; and a further **management-reporting** basis that adds back stock-based compensation and a deferred-revenue timing adjustment. In Q2 FY27 a GAAP net loss of $(54.0)m becomes $92.2m of non-GAAP EBITDA and $277.1m of management-reporting EBITDA — a $331m swing on $1,497.0m of revenue, of which **$90.0m is stock-based compensation** (a real cost of paying staff) and **$101.9m is deferred-revenue timing** (shifting income between periods, not creating it) [3; 5, p.2 and p.11].
3. **Margins are on GAAP net revenue, not Net Bookings.** Q2 FY27 GAAP net revenue was $1,497.0m; Net Bookings were $1,601.3m [3; 5, p.1]. Net Bookings appears below only where it is named.

All percentages, basis-point deltas and the bridge in Sections 7 and 7a were produced by an executed Python snippet; the inputs are the sourced figures cited in each row, and the derivations are printed in Section 7a and Section 10.

---

## 1. Segment Decomposition Status

**Single reportable segment — stated by the company, not a disclosure gap.** "We have one operating and reportable segment" [1, Item 1 and Note 21]; the vendor's own segment tab reads "Sale of Software Titles 6,656 (100%) of Total 6,656" for FY2026 [7]. This matches business-model `03_segment-map.md`. Under the `MODULE_RULES.md` Segment-Level Rule the single-segment path applies: the consolidated read below is the primary read, and the "no segment P&L for a multi-segment business" clarity cap does **not** trigger.

**Revenue IS disaggregated on four axes, and costs are NOT.** The company discloses revenue by content (recurrent consumer spending vs full game), by platform (mobile / console / PC), by distribution channel (digital / physical) and by geography [1, Item 7; 3, Item 2; 5, "Net Revenue and Net Bookings by Content, Platform Mix…"]. It discloses **no cost of revenue, gross profit, operating expense or margin for any of those axes.** The only cost statement attached to an axis is qualitative: mobile revenue "generally generates a lower gross margin percentage than our Console or PC revenue" because of the Apple/Google platform fee [1, Item 7 — Online Content and Digital Distribution].

Consequence, stated plainly: **mix is the most-cited margin driver in this company's own filings and the one that cannot be quantified from disclosure.** Section 6 therefore gives directional mix reads with the disclosed revenue weights and refuses to put a margin number on any single platform or content line. No mix figure below is invented.

---

## 1a. Sector Overlay Status (step 3b)

**No sector overlay for "hit-driven owner-operator of entertainment intellectual property — premium console/PC franchise publisher plus free-to-play mobile microtransactions" — generic cost stack applies.** No row in `frameworks/SECTOR_OVERLAYS.md` matches: it is not a bank (no NIM, no credit costs), not a REIT (no NOI), not SaaS/subscription (recurrent consumer spending is per-item microtransaction and in-game advertising, not a contracted recurring fee — there is no RPO/ARR/net-retention grammar to apply), not an insurer, miner, E&P, retailer, telecom, asset manager or pharma. This matches business-model `02_business-identity.md` §3a, which reached the same conclusion independently.

Two consequences for the cost stack in Section 2. First, the generic raw-material / freight / energy rows do **not** exist here: "Take-Two does not occupy the raw-material or component-supply stages: there is no commodity input" [business-model `06_value-chain.md`, §1], and 97.4% of Q2 FY27 net revenue moved through digital channels so there is no meaningful freight line [3, Item 2]. Those rows are marked "Not applicable / not disclosed" rather than padded. Second, the generic candidate list is replaced in practice by the company's **own five disclosed cost-of-revenue lines** plus its four operating-expense lines — which is what the filing gives and what the margin actually moves on.

One item from the SaaS row is borrowed deliberately, because it applies on its own evidence rather than by sector label: **stock-based compensation charged in full, with the GAAP-to-non-GAAP gap made visible.** FY2027 guidance embeds $462m of stock-based compensation — $113m inside cost of revenue and $349m inside operating expenses — equal to **5.7% of the $8,080m guided revenue midpoint** [5, "Outlook for Fiscal Year 2027"]. That gap is itself a margin driver and is scored as one in Section 5.

---

## 1b. Cycle Position (`MODULE_RULES.md` Cycle-Position Rule)

**The latest reported quarter sits at the TROUGH of a release cycle — and the very next quarter is the peak. Neither is a run-rate.**

This business has a release cycle, not a commodity or credit cycle. Business-model `10_external-dependency.md` classifies TTWO as **"partly externally driven"** with consumer cycle Mid and console-hardware cycle Mid, and concludes that "the observed driver of results in both reported FY27 quarters was its own product". This module agrees — the cycle that moves margin here is the company's own release slate, and the external cycles sit behind it.

Evidence for the trough read on Q2 FY27 (three months ended 2026-09-30):
- GAAP net revenue $1,497.0m is the **lowest of the last eight quarters** (range $1,359.8m–$1,773.8m, with the last four all above $1,497.0m until this one) [9; upstream `01`, §3].
- Full-game revenue fell to **19.2% of net revenue from 28.1%** a year earlier, as Borderlands 4 (Sep-2025) and Mafia: The Old Country (Aug-2025) annualised out — $128.0m and $56.3m of revenue decline respectively [3, Item 2].
- Vendor-basis EBITDA margin of 5.1% is the lowest of the eight quarters [9; upstream `01`, §3]. Company-defined non-GAAP EBITDA margin was 6.2% ($92.2m on $1,497.0m) against 6.6% ($116.7m on $1,773.8m) a year earlier [5, p.11].
- The company describes itself as between launches; Grand Theft Auto VI released **2026-11-19 — today** — inside Q3 FY27 [1, Item 7; 5, release schedule].

Evidence that Q3 FY27 is the peak, not a new level: guided GAAP net revenue of **$3,270–3,420m against $1,699.0m in Q3 FY26** — roughly a doubling in one quarter, the largest quarterly revenue skew anywhere in the five-year history [5; 9].

**Three things that are explicitly NOT run-rate, labelled:**
- **FY2026's +288bps gross-margin expansion is partly a base effect, not an operating gain.** The filing attributes it to "lower amortization of intangible assets primarily due to higher impairments in the prior year" — i.e. the FY2025 $3,545.2m goodwill-impairment cycle having already written the assets down — "partially offset by higher amortization of capitalized software and development costs" [1, Item 7]. Game-intangible amortisation fell from 14.4% to 9.9% of revenue on that mechanic [1, Item 7].
- **Q2 FY27's +220bps gross-margin improvement is release-timing, not cost control.** The filing's own one-line cause: "primarily driven by lower amortization of capitalized software and development costs primarily due to the timing of releases" [3, Item 2]. It reverses when a title ships.
- **Q3 FY27's guided 49.5% gross margin is a launch-quarter margin.** It is ~800bps below Q2 FY27's 57.5% and is not a normalised level either. There is no quarter in the next twelve months that can be read as run-rate; this business must be judged across a full release cycle.

**No one-time policy or macro tailwind sits in the latest margin.** The only quantified policy benefit in the pool is a $45.7m software-development tax-credit effect on the FY2026 **tax** line, below EBIT, not in margin [business-model `10_external-dependency.md`, §1A]. A November-2026 intangible-asset reorganisation will change the jurisdictional mix of earnings from November 2026 — again a tax-line effect, with the company stating it is "still" assessing it [3, Note 16 (Subsequent Events)]. Neither is a margin driver and neither is counted as one below.

---

## 2. Cost Stack

Generic operating company (Section 1a) — the rows below are the company's **own disclosed cost lines**, not a template. Percentages are of GAAP net revenue for the three months ended 2026-09-30 (Q2 FY27), with the prior-year quarter beside them. Direction = where the **ratio** is heading on the evidence cited.

| Cost Line | % of Revenue or Amount (Q2 FY27 vs Q2 FY26) | Direction | Evidence | Margin Risk |
|---|---:|---|---|---|
| **Raw materials / commodity inputs** | Not applicable — none exist | n/a | "no commodity input"; 97.4% of Q2 FY27 revenue digital [business-model `06_value-chain.md`, §1; 3, Item 2] | None |
| **Freight / logistics** | Not disclosed; physical retail is only **2.6%** of revenue (was 4.5%) | Shrinking | [3, Item 2 — net revenue by distribution channel] | Immaterial |
| **Energy** | Not disclosed | Unknown | No energy line in any filing in the pool | Not assessable |
| **Product costs** (platform/app-store fees, physical goods, payment costs) | **$184.0m / 12.3%** vs $229.3m / 12.9% | **Falling (Tailwind)** | [3, Item 2 — Cost of revenue]; platform fees "are recorded as Cost of revenue as incurred" [3, Item 2 — Online Content and Digital Distribution] | **High** — Apple and Google "generally have the discretion to set the amounts of their platform fees" [1, Item 1A] |
| **Game intangibles** (amortisation of **acquired** intangibles, mainly Zynga/Gearbox purchase accounting) | **$140.8m / 9.4%** vs $158.8m / 9.0% | **Rising as a ratio** | [3, Item 2]; FY2027 guidance embeds **$572m** of acquired-intangible amortisation inside cost of revenue [5, Outlook] | High — but non-cash and excluded from the company's own non-GAAP EBITDA |
| **Software development costs and royalties** (amortisation of **internally** capitalised game development, plus impairments) | **$107.9m / 7.2%** vs $172.1m / 9.7% | **Fell in Q2; set to rise on launch** | [3, Item 2]; capitalised balance **$2,577.3m** at 2026-09-30, up from $2,346.3m at 2026-03-31 [3, Balance Sheets] | **Highest in the stack** — see Sections 5 and 8 |
| **Licenses** (sports and third-party IP) | **$131.9m / 8.8%** vs $154.4m / 8.7% | **Rising as a ratio** | [3, Item 2]; FY2026 $463.5m / 7.0% of revenue vs 6.5% in FY2025 [1, Item 7]; H1 FY27 7.6% vs 6.9% [3, Item 2] | Mid — guaranteed minimum payments, "may not be able to terminate these agreements" [1, Item 1A] |
| **Internal royalties** (pay-outs to in-house studios on their own titles' success) | **$72.0m / 4.8%** vs $78.7m / 4.4% | **Rising as a ratio** | [3, Item 2]; FY2026 6.3% vs FY2025 7.2% [1, Item 7] | Mid — mechanically rises when owned franchises perform |
| **Total cost of revenue** | **$636.6m / 42.5%** vs $793.3m / 44.7% | Falling (−220bps) | [3, Item 2] | — |
| **Selling and marketing** (includes mobile player-acquisition spend) | **$444.9m / 29.7%** vs $536.7m / 30.3% | **Dollars down $91.8m; ratio down 54bps** | [3, Item 2 — Operating Expenses]; "lower marketing expense for our Borderlands franchise, partially offset by higher marketing expense for our Grand Theft Auto series" [3, Item 2] | **High** — Q3 FY27 management-basis operating expense guided **+21% YoY** "driven by GTA VI launch marketing" [11, prepared remarks (Goldstein)] |
| **Research and development** (pre-feasibility development, charged not capitalised) | **$254.4m / 17.0%** vs $268.0m / 15.1% | **Dollars down $13.6m; ratio UP 189bps** | [3, Item 2]; "lower personnel expense and lower production expenses" [3, Item 2] | High — Q4 FY27 management-basis operating expense implied up ~10%, "mostly being driven by increases in R&D" [11, Q&A (Song / Goldstein)] |
| **General and administrative** | **$230.5m / 15.4%** vs $225.0m / 12.7% | **Dollars UP $5.5m; ratio UP 271bps** | [3, Item 2]; "higher IT-related expenses for cloud-based services and IT infrastructure" [3, Item 2] | Mid |
| **Depreciation and amortisation** (operating-expense line only) | **$48.1m / 3.2%** vs $48.8m / 2.8% | Dollars flat; ratio up 46bps | [3, Item 2]; FY2027 depreciation guided **$165m** [5, EBITDA reconciliation] | Low |
| **Total operating expenses** | **$977.9m / 65.3%** vs $1,078.5m / 60.9% | Dollars down $100.6m; ratio **UP 452bps** | [3, Item 2] | — |
| **Stock-based compensation** (sits inside the lines above, not separate) | **$90.0m / 6.0%** of revenue — $23.1m S&M, $22.5m R&D, $41.0m G&A, $3.4m in cost of revenue | Rising as a ratio | [3, Item 2 — Operating Expenses footnote (1); 3, Item 2 — Cost of revenue footnote (1); 5, p.2] | **High** — $462m guided for FY2027, 5.7% of guided revenue [5, Outlook] |
| **Interest expense** | **$30.2m / 2.0%** vs $37.4m / 2.2% | Falling | [3, Statements of Operations]; FY2027 interest expense, net guided **$41m** [5, EBITDA reconciliation] | Low — below the margin line; zero floating-rate debt [business-model `10_external-dependency.md`, §3] |
| **Labour / wages** | Not disclosed as a line; 9,998 of 12,909 full-time staff sit in development studios | Unknown as a line | [1, Item 1]; payroll is split between capitalised software, R&D, S&M and G&A rather than shown separately | **High but not measurable** — this is the real input cost and it is not a disclosed line |

**One structural point the table makes.** Take-Two's real input is developer time, and it reaches the income statement by **two different routes with different timing**: before a title clears "technological feasibility" it is charged straight to R&D; after that point it is capitalised and then amortised into cost of revenue **only when the game is released** [1, Note 1 — Software Development Costs and Licenses]. So the same payroll dollar hits the P&L either immediately, as research and development inside operating expenses, or years later, as amortisation inside cost of revenue. That split is why gross margin and operating margin can move in opposite directions in the same quarter, which is exactly what Q2 FY27 did.

---

## 3. Gross Margin → EBITDA Margin → EBIT Margin Walk

### 3.1 Latest quarter — Q2 FY27 vs Q2 FY26 (three months ended 30 September, filing basis)

| Margin Level | Latest (Q2 FY27) | Prior Year (Q2 FY26) | Change bps | Main Reason | Evidence |
|---|---:|---:|---:|---|---|
| **Gross margin** | **57.5%** ($860.4m) | 55.3% ($980.5m) | **+220** | "lower amortization of capitalized software and development costs primarily due to the timing of releases" — the internally capitalised development line fell from 9.7% to 7.2% of revenue | [3, Item 2 — Cost of revenue and gross profit] |
| **EBITDA margin (company-defined non-GAAP)** | **6.2%** ($92.2m) | 6.6% ($116.7m) | **−42** | Gross-margin gain more than given back by operating-expense ratios on a 15.6%-smaller revenue base; the measure excludes acquired-intangible amortisation and depreciation but **charges** stock-based compensation and internal software amortisation | [5, p.11 "EBITDA" reconciliation] |
| **EBITDA margin (vendor-computed)** ᵛ | 5.1% ($75.9m) ᵛ | 6.6% ($117.5m) ᵛ | −150 ᵛ | Shown only for continuity with upstream `01` §3; a **different measure** from the row above and never mixed with it | [9] |
| **EBITDA margin (management-reporting basis)** | **18.5%** ($277.1m) | Not disclosed for the prior-year quarter in the pool | Not computable | Adds back $90.0m stock-based compensation, $101.9m deferred-revenue timing, $2.4m business acquisition, less $9.4m other | [5, p.2] |
| **EBIT margin** (income/(loss) from operations) | **−7.8%** $(117.5)m | −5.6% $(98.0)m | **−232** (filing's rounded print: −220) | Gross margin +220bps swamped by operating-expense ratio +452bps, which is overwhelmingly the smaller revenue base, not higher spending — operating-expense **dollars fell $100.6m** | [3, Item 2 and Statements of Operations] |

### 3.2 Last closed fiscal year — FY2026 vs FY2025 (filing basis)

| Margin Level | FY2026 | FY2025 | Change bps | Main Reason | Evidence |
|---|---:|---:|---:|---|---|
| Gross margin | **57.2%** ($3,809.7m) | 54.3% ($3,062.2m) | **+288** | (i) lower acquired-intangible amortisation "primarily due to higher impairments in the prior year", (ii) lower product costs, partly offset by (iii) higher internal software amortisation | [1, Item 7] |
| EBITDA margin (vendor) ᵛ | 11.8% ᵛ | 6.7% ᵛ | +511 ᵛ | No company-defined full-year EBITDA for FY2026 exists in this pool (no Q4 FY26 release admitted) | [7]; upstream `01` §1 |
| EBIT margin | **−1.6%** $(104.2)m | −77.9% $(4,391.1)m | +7,634 | FY2025 carried a $3,545.2m goodwill impairment (62.9% of revenue) that did not recur | [1][2, Item 7] |

### 3.3 Guided — FY2027 and Q3 FY2027 (company's own GAAP outlook, midpoints)

| Margin Level | Q3 FY27 guided | FY2027 guided | vs Q2 FY27 / FY2026 actual | Main Reason | Evidence |
|---|---:|---:|---|---|---|
| Gross margin | **49.5%** (rev 3,345; cost of revenue 1,690.5) | **53.7%** (rev 8,080; cost of revenue 3,739.5) | **−801bps** vs Q2 FY27's 57.5% · **−351bps** vs FY2026's 57.2% | The CFO's own one-line cause, asked directly: *"it appears the gross margins are down slightly in the full year guidance. Can you just help us understand the drivers there?" → "So it's due to the mix of the business, and it's being offset by some changes in the operating expenses."* | [5, Outlook]; [11, Q&A (Schoell / Goldstein)] |
| Operating-expense ratio | **35.0%** (1,172) | **50.6%** (4,088) | −3,029bps vs Q2 FY27's 65.3% · −821bps vs FY2026's 58.8% | Near-fixed cost base against roughly doubled revenue — operating leverage, in the favourable direction this time | [5, Outlook] |
| **EBIT margin** | **+14.4%** ($482.5m) | **+3.1%** ($252.5m) | **+2,227bps** vs Q2 FY27 · **+469bps** vs FY2026 | — | derived from [5, Outlook]; see Section 10 |
| EBITDA margin (company-defined non-GAAP) | 20.2% ($674.5m) | 13.0% ($1,053m) | — | FY2027 add-backs: depreciation $165m, acquired-intangible amortisation $623m | [5, EBITDA reconciliation] |

**Pass-through: what it is here, and the lag.** There is no commodity to pass through. The pass-through question for TTWO is whether it can recover **platform fees and licence costs it does not set**, and business-model `06_value-chain.md` answers it with evidence: **"No — 0% of revenue sits under a disclosed escalator, indexed-pricing or cost-plus clause"**, and the platforms "have retained the right to change the fee structures" at their own discretion [1, Item 1A]. But — and this qualifier must travel (§3) — *no contractual pass-through is a fact about contracts, not a measurement of realised recovery.* The filings show real absorption: product costs (where the app-store fee sits) fell 160bps of revenue in FY2026 and a further 110bps in H1 FY27, through platform mix (mobile 52.2% → 50.1% of FY2026 revenue) and a growing direct-to-consumer channel that bypasses the Apple/Google fee entirely [1, Item 7; 3, Item 2; business-model `06_value-chain.md`, §2].

**The pass-through lag is release-timed, measured in years, and it runs the wrong way after launch.** Take-Two's price lever is the launch price of a new premium title — it set Grand Theft Auto VI at **$80** against the $70 industry norm (a ~14% rise) while holding NBA 2K27 at $70 by choice [business-model `06_value-chain.md`, §3, citing the Q1 FY27 call Q&A]. Between launches there is no price lever on the 80.8% of Q2 FY27 revenue that is recurrent consumer spending, and that spend **fell 9% at unchanged prices** [5, p.1; 3, Item 2]. Worse, after a launch the company deliberately cuts price: it describes "reducing the wholesale prices of our products… typically three to nine months after a product's initial launch" [1, Item 1 — Marketing]. **So the stated lag is: price can be raised only at a launch (years apart), and is cut 3–9 months after one.** A platform-fee increase arriving mid-cycle cannot be priced through for years.

---

## 4. Margin Walk — Which Margin Level Matters Most?

**EBIT margin on the filing basis is the primary metric for this business, with gross margin as the mix signal and company-defined non-GAAP EBITDA as the cross-check. The reason is that only EBIT charges the full cost of making a game.** A game publisher's real production cost is developer payroll, and it reaches the income statement by two routes: charged immediately to research and development (pre-feasibility work, $254.4m in Q2 FY27, sitting in operating expenses) or capitalised and amortised into cost of revenue when the title ships ($107.9m in Q2 FY27, against a $2,577.3m unamortised balance) [3, Item 2 and Balance Sheets; 1, Note 1]. Gross margin sees only the second route, so it can rise 220bps in a quarter precisely *because* nothing shipped — which is what happened in Q2 FY27 and is the opposite of good news. The company's non-GAAP EBITDA is better than the vendor's because it keeps internal software amortisation and keeps stock-based compensation as costs, but it still strips out $145.1m a quarter of acquired-intangible amortisation (the Zynga and Gearbox purchase price being consumed), and the management-reporting basis strips a further $90.0m of stock-based compensation and $101.9m of revenue timing — on those bases a quarter with a $(117.5)m operating loss reads as $277.1m of profit [5, p.2 and p.11]. EBIT is also the only level management guides component by component (revenue, cost of revenue, operating expenses, each with a range), so it is the only level at which the next print can be **tested** against what was underwritten [5, Outlook]. The honest caveat: a single quarter's EBIT margin on this business is close to meaningless — it ranges from −7.8% actual (Q2 FY27) to +14.4% guided (Q3 FY27) on the same cost base — so EBIT margin must be read across a full release cycle, and Section 1b says why neither of the next two quarters is a run-rate.

---

## 5. Margin Driver Table (consolidated)

Magnitude = how much this driver moves **EBIT margin** if it moves plausibly. High >100bps, Mid 30–100bps, Low <30bps.

| Driver | Impact on Margins | Direction | Magnitude | Evidence |
|---|---|---|---|---|
| **1. Operating leverage — the revenue denominator against a near-fixed cost base** | The dominant swing factor in both directions. Q2 FY27: operating-expense **dollars fell $100.6m** yet the ratio rose 452bps because revenue fell 15.6%. Q3 FY27 guided: the same near-fixed $1,172m of operating expenses against roughly doubled revenue takes the ratio from 65.3% to 35.0% | **Tailwind into Q3 FY27, Headwind thereafter** (guided FY27 operating-expense ratio of 50.6% implies a Q4 ratio far above Q3's) | **High** (±2,000bps+ across the cycle; ~39bps of EBIT margin per 1% of revenue variance around the Q3 guide — see Section 7a) | [3, Item 2]; [5, Outlook]; [11, Q&A (Song / Goldstein)] |
| **2. Release-timed amortisation of the $2,577.3m capitalised software balance** | Amortisation starts only "when a product is available for general release" and is then the **greater of** revenue-proportional and straight-line over 9–36 months; if the title underperforms, an impairment is charged **to cost of revenue** | **Headwind from Q3 FY27** — the balance starts amortising as GTA VI releases; FY2027 cost of revenue guided to 46.3% of revenue vs 42.8% in FY2026 | **High** (−351bps of gross margin already guided for FY2027) | [1, Note 1 — Software Development Costs and Licenses]; [3, Balance Sheets]; [5, Outlook] |
| **3. Content mix — full-game vs recurrent consumer spending** | Full game fell to 19.2% of Q2 FY27 revenue from 28.1%; the FY2027 plan takes recurrent spending **down to 65% of Net Bookings from 78%** as GTA VI full-game sales land. Full-game sales carry the capitalised-development amortisation and the heavier platform/royalty load | **Headwind to gross margin** — the CFO names mix as *the* cause of the lower full-year gross margin | **High** | [3, Item 2]; [5, Outlook; deck slide 8 via upstream `04`, §2.1]; [11, Q&A (Schoell / Goldstein)] |
| **4. Platform mix and the direct-to-consumer channel (product costs)** | Mobile pays the Apple/Google fee and "generally generates a lower gross margin percentage than our Console or PC revenue". Product costs fell to 12.3% of revenue from 12.9% in the quarter, and 160bps across FY2026. Direct-to-consumer bypasses the fee entirely: "a significant driver of revenue and margins"; "it obviously has a very meaningful margin and bottom line impact" | **Tailwind** — but **unquantified by the company**: "We have not described the percentage of our business that comes direct to consumer mobile" | **Mid** (sized from the realised 60bps quarterly / 160bps annual move in product costs, not from the unquantified D2C share) | [1, Item 7 — Online Content and Digital Distribution]; [3, Item 2]; [11, prepared remarks and Q&A (Heaney / Zelnick)] |
| **5. Stock-based compensation** | $90.0m in Q2 FY27 = 6.0% of revenue, charged across four lines; $462m guided for FY2027 = 5.7% of guided revenue. It is the single largest difference between the GAAP margin and the management-reporting margin management is paid on | **Headwind as a ratio** (rising against falling revenue in H1 FY27; $113m of the FY27 total lands in cost of revenue, $96m of it in Q3 alone as capitalised dev costs containing it begin amortising) | **High** | [3, Item 2 footnotes]; [5, p.2 and Outlook] |
| **6. Marketing / player-acquisition spend** | S&M dollars fell $91.8m in Q2 FY27 on lower Borderlands marketing; management-basis operating expenses came in 9% lower YoY, "favorable to our forecast due to lower personnel and user acquisition costs… some of that was due to timing" | **Tailwind in the reported quarter, Headwind next** — Q3 management-basis operating expenses guided **+21% YoY** on GTA VI launch marketing | **High** | [3, Item 2]; [11, prepared remarks and Q&A (Smilek / Goldstein)] |
| **7. R&D intensity** | $254.4m = 17.0% of Q2 FY27 revenue vs 15.1%. Dollars fell 5.1% but the ratio rose 189bps. Management flags R&D as the main driver of a ~10% implied Q4 FY27 operating-expense increase | **Headwind** | **High** | [3, Item 2]; [11, Q&A (Song / Goldstein)] |
| **8. Licence costs (sports and third-party IP)** | 8.8% of Q2 FY27 revenue vs 8.7%; 7.6% of H1 FY27 vs 6.9%; $463.5m / 7.0% in FY2026 vs 6.5%. Multi-year sports licences carry guaranteed minimum payments the company "may not be able to terminate" | **Headwind** — the ratio has risen on three consecutive comparisons | **Mid** (+70bps of gross margin consumed across H1 FY27) | [1, Item 7 and Item 1A]; [3, Item 2] |
| **9. Internal royalties** | 4.8% of Q2 FY27 revenue vs 4.4%; 4.8% of H1 FY27 vs 5.1%; 6.3% of FY2026 vs 7.2%. These are pay-outs to in-house studios geared to their own titles' performance | **Headwind when owned franchises succeed** — mechanically rises with GTA VI | **Mid** | [1, Item 7]; [3, Item 2] |
| **10. Title impairments charged to cost of revenue** | $43.4m in Q1 FY27 and $0.2m in Q2 FY27 — "$43.6 of impairment charges were recorded within Cost of revenue" for the six months, "primarily related to… a decision not to proceed with further development of certain interactive entertainment software products". Worth **144bps of H1 FY27 gross margin** | **Unknown** — episodic by nature, but the mechanism is live and the recoverability test runs quarterly against a $2,577.3m balance | **High** when it trips, and it tripped twice in two quarters | [3, Item 2 and footnotes]; [1, Note 1] |
| **11. FX on costs** | FX cut net revenue by $0.6m, gross profit by $3.8m and total operating expenses by $3.2m in Q2 FY27 — a net EBIT effect of about $(0.6)m, roughly 4bps. FY2026: +$9.9m revenue, +$45.4m gross profit, +$31.2m operating expenses | **Neutral to mildly Headwind** | **Low** (<30bps on the realised quarterly figures; business-model `10_external-dependency.md` records a published ±4.0%-per-10% revenue sensitivity, which is a revenue not a margin sensitivity) | [3, Item 2]; [1, Item 7] |
| **12. General and administrative / IT infrastructure** | $230.5m = 15.4% of revenue vs 12.7%; the only operating line whose **dollars rose** (+$5.5m), on "higher IT-related expenses for cloud-based services and IT infrastructure" | **Headwind** | **Mid** | [3, Item 2] |
| **13. Deferred-revenue timing** | Moves the margin **denominator**, not the cost: GAAP revenue is deferred over a five-to-fifteen-month service period while Net Bookings are recognised on sale. FY2027 guidance embeds +$20m of revenue and $(27)m of cost from this; Q3 embeds +$80m and $(13)m. Deferred revenue fell from $1,159.9m to $1,017.1m over six months | **Unknown direction** — a timing shift, not a margin gain | **Mid** | [5, Outlook]; [3, Balance Sheets and Statements of Cash Flows] |
| **14. Energy / freight / raw materials** | **Not applicable.** No commodity input; physical retail is 2.6% of revenue | n/a | n/a | [business-model `06_value-chain.md`, §1]; [3, Item 2] |
| **15. Labour cost per head** | **Not assessable as a line.** 9,998 of 12,909 staff are in development studios, but payroll is split between capitalised software, R&D, S&M and G&A and never disclosed as a cost | **Unknown** | **Not assessable** — this is the true input cost and the filings do not isolate it | [1, Item 1]; [1, Note 1] |

---

## 6. Margin Drivers By Segment

**Not applicable as a segment table — one reportable segment (Section 1).** What follows is the honest substitute: the disclosed revenue axes, each with the mix direction and the one cost statement the company actually makes about it. **No gross margin, cost of revenue or operating expense is disclosed for any axis below**, so none is estimated.

### Axis: Platform (Q2 FY27 revenue weights)

| Line | Revenue share | Mix direction | Cost statement the company makes | Margin read |
|---|---:|---|---|---|
| Mobile | **48.8%** ($731.1m, −$90.5m YoY) | Share **rose** from 46.3% a year earlier, but **fell** from 52.2% to 50.1% across FY2026 | Mobile "generally generates a lower gross margin percentage than our Console or PC revenue" because of the platform fee; 91.0% of mobile revenue runs on Apple and Google | **Headwind when mobile share rises** — direction, not size. The offset is direct-to-consumer, "significant and growing" but share **not disclosed** |
| Console | **41.1%** ($615.4m, −$104.6m YoY) | Share rose from 40.6%; rose from 37.3% to 39.0% across FY2026 | No separate cost disclosure | Tailwind to gross margin by implication from the mobile statement |
| PC and other | **10.1%** ($150.5m, −$81.7m YoY) | Share **fell** from 13.1% | No separate cost disclosure | Not assessable |

[3, Item 2 — net revenue by platform; 1, Item 7 — Online Content and Digital Distribution; 11, Q&A (Heaney / Zelnick)]

### Axis: Content (Q2 FY27 revenue weights)

| Line | Revenue share | Mix direction | Cost statement | Margin read |
|---|---:|---|---|---|
| Recurrent consumer spending | **80.8%** ($1,210.2m, −$65.7m YoY) | Share rose from 71.9% in the quarter; guided **down to 65% of FY2027 Net Bookings from 78%** | None disclosed | Carries no new capitalised-development amortisation, so a high recurrent share coincides with high gross margin — which is exactly why Q2 FY27 printed 57.5% while losing money at EBIT |
| Full game and other | **19.2%** ($286.8m, −$211.1m YoY) | Share fell from 28.1%; set to rise sharply in Q3 FY27 | Carries the capitalised-development amortisation that commences on release | **The mix shift the CFO means** when she attributes lower FY2027 gross margin to "the mix of the business" |

[3, Item 2 — net revenue by content; 5, Outlook; 11, Q&A (Schoell / Goldstein)]

### Axis: Distribution channel and geography

Digital online was 97.4% of Q2 FY27 revenue (up from 95.5%) and physical retail 2.6% (down from 4.5%) [3, Item 2]. Geography: FY2026 United States $3,940m / 59% and international $2,716m / 41% [1, Item 7 via upstream `00`]. **Neither axis has any cost or margin disclosure**, and FX — the only margin mechanism geography offers — is Low magnitude on the realised figures (driver 11). Nothing further is claimed.

---

## 7. Margin Bridge — Latest Period

**Q2 FY27 vs Q2 FY26 — EBIT margin, filing basis, three months ended 30 September.** Total EBIT margin moved from −5.524% to −7.849%, i.e. **−232bps** (the filing's rounded print is −5.6% → −7.8%, −220bps; the difference is rounding in the filing's own percentages, not a basis change).

Every component below is a **disclosed cost line expressed as a percentage of GAAP net revenue in its own period**, so the bridge is built from the filing's own table rather than from an assumed sensitivity. Favourable to margin = positive.

| Component | Margin Impact (bps) | Evidence |
|---|---:|---|
| **Gross margin — lower internal software amortisation** (software development costs and royalties 7.21% vs 9.70% of revenue) | **+249** | [3, Item 2 — Cost of revenue]; the filing's stated cause: "lower amortization of capitalized software and development costs primarily due to the timing of releases" |
| **Gross margin — lower product costs** (12.29% vs 12.93%; platform fees, physical goods, payment costs) | **+64** | [3, Item 2] |
| **Gross margin — higher acquired-intangible amortisation** (game intangibles 9.41% vs 8.95%) | **−45** | [3, Item 2] |
| **Gross margin — higher internal royalties** (4.81% vs 4.44%) | **−37** | [3, Item 2] |
| **Gross margin — higher licence costs** (8.81% vs 8.70%) | **−11** | [3, Item 2] |
| *Subtotal — gross margin* | **+220** | 57.475% vs 55.277% [3, Item 2] |
| **Operating expenses — selling and marketing** (29.72% vs 30.26%; dollars −$91.8m on lower Borderlands marketing) | **+54** | [3, Item 2 — Operating Expenses] |
| **Operating expenses — research and development** (16.99% vs 15.11%; dollars −$13.6m but revenue −15.6%) | **−189** | [3, Item 2] |
| **Operating expenses — general and administrative** (15.40% vs 12.68%; dollars **+$5.5m** on higher cloud/IT spend) | **−271** | [3, Item 2] |
| **Operating expenses — depreciation and amortisation** (3.21% vs 2.75%) | **−46** | [3, Item 2] |
| *Subtotal — operating expenses* | **−452** | 65.324% vs 60.802% [3, Item 2] |
| **Other / unexplained residual** | **0** | Nothing is left over: the components are the filing's complete cost stack |
| **Total margin change (EBIT)** | **−232** | −7.849% vs −5.525% [3, Statements of Operations and Item 2] |

**Memo lines — already inside the components above, shown for completeness and NOT additive (adding them would double-count):**
- **FX:** cut net revenue $0.6m, gross profit $3.8m and total operating expenses $3.2m — net EBIT effect about $(0.6)m, roughly **−4bps** [3, Item 2].
- **One-offs:** $0.2m of impairment inside cost of revenue this quarter, about **−1bp**. The comparable figure for Q1 FY27 was $43.4m, worth about −283bps of that quarter's gross margin [3, Item 2 and footnote].
- **Price:** no separate price component is shown because **none is disclosed.** The company publishes no price or unit volumes per title per period; business-model `02_business-identity.md` §3a records period volume as "Partial — must be inferred from revenue, not read". Inventing a price/volume split here would be the exact defect §15 bans. The one priced event in the window is GTA VI's $80 launch price, which falls in Q3 FY27, not this quarter.

---

## 7a. Bridge Attribution and Residual (`MODULE_RULES.md` "Driver Attribution" / §15)

**Component status: every bps figure in Section 7 is a reported ratio, not a modelled one.** Each line is `(disclosed cost dollars ÷ that period's own GAAP net revenue)` differenced across two periods, both printed in the same filing table. So for all eleven components: **"Asserted from disclosure, no sensitivity applied."** No cost ratio was projected, no elasticity was used, and no ratio measured on one period's mix was applied to another's.

**Reconciliation.** Sum of components vs Section 7's stated Total:

```
Gross-margin components:  +249.3 (software dev) +64.4 (product) −45.5 (game intang)
                          −36.8 (internal roy)  −11.3 (licences)      = +219.8bps
Operating-expense items:   +54.0 (S&M) −188.9 (R&D) −271.3 (G&A) −46.0 (D&A) = −452.2bps
Sum of components                                                     = −232.4bps
Stated Total (EBIT margin, −7.849% less −5.525%)                      = −232.4bps
```

**= −232bps reconciled, 0bps residual.** The bridge closes exactly because the components are the filing's complete cost stack, not a selection from it.

**The causal decomposition — where the arithmetic is actually required.** A zero residual on the ratio bridge does **not** tell you *why* the ratios moved, and the honest answer is that almost none of it is cost action. Separating the two forces, with the derivation printed:

```
Operating expenses:
  cost-dollar effect  = 977.9/1,773.8 − 1,078.5/1,773.8   [both on Q2 FY26 revenue — basis named]
                      = 55.13% − 60.80%                   = −567bps  (favourable)
  denominator effect  = 977.9/1,497.0 − 977.9/1,773.8      [same $977.9m, two revenue bases]
                      = 65.32% − 55.13%                    = +1,019bps (unfavourable)
  sum                                                      = +452bps  → matches Section 7 ✓

Cost of revenue:
  cost-dollar effect  = 636.6/1,773.8 − 793.3/1,773.8      = −883bps  (favourable)
  denominator effect  = 636.6/1,497.0 − 636.6/1,773.8      = +664bps  (unfavourable)
  sum                                                      = −220bps  → matches Section 7 ✓

EBIT margin:
  total cost-dollar relief   = +883 + 567                  = +1,450bps
  total denominator drag     = −(664 + 1,019)              = −1,683bps
  net                                                      = −233bps
  vs stated Total                                          = −232bps  → residual −1bp (rounding)
```

**Basis statement.** Both effects are measured on the periods' own reported revenue ($1,773.8m for Q2 FY26, $1,497.0m for Q2 FY27) and the periods' own reported cost dollars, all from one table in one filing [3, Item 2]. No ratio crosses a basis it was not measured on, and no vendor figure enters the bridge — which matters here, because the vendor's reclassification of impairments out of cost of revenue would have corrupted the gross-margin leg (upstream `01`, §3).

**What this changes about the read.** The company **cut $156.7m of cost of revenue and $100.6m of operating expenses** — $257.3m of cost taken out in one quarter — and still lost 232bps of EBIT margin, because revenue fell $276.8m. Of the −232bps, **−1,683bps is the revenue denominator and +1,450bps is cost reduction**: the single largest force by a wide margin is negative operating leverage, and it is roughly seven times the size of the net margin change it produced. That is also the force that reverses hardest in Q3 FY27.

```
RF-EARN-002: margin bridge reconciled — explained -232bps, residual 0bps, total -232bps
```

---

## 8. The Single Biggest Margin Driver

**One driver: the revenue the $2,577.3m capitalised content asset has to earn — in plain terms, how much Grand Theft Auto VI actually sells against the cost already sunk into it. If that moves adversely, margins compress twice over, and nothing else in the stack comes close.** The mechanism is in the accounting policy, not in a forecast. Amortisation of capitalised development starts only when a title is released and is then **"the greater of"** (a) the proportion of this year's revenue to total revenue expected over the title's life, or (b) straight-line over its remaining estimated life, across amortisation periods that "generally range from 9 to 36 months" [1, Note 1]. On the upside that is roughly self-correcting: strong sell-through means amortisation tracks revenue and the gross-margin ratio holds. On the downside **both legs bite** — the straight-line floor charges cost against revenue that did not arrive, and separately, "when we determine that capitalized cost of the title is unlikely to be recovered by product sales, an impairment of software development and license costs capitalized is charged to cost of revenue" [1, Note 1]. The pool already contains two realised examples of that second leg inside two quarters: $43.4m in Q1 FY27 and $0.2m in Q2 FY27, the first worth about 283bps of that quarter's gross margin [3, Item 2]. Layered on top is the operating leverage quantified in Section 7a: against the Q3 FY27 guide, holding operating expenses at the guided $1,172m and cost of revenue at the guided 50.5% of revenue, **a 10% revenue shortfall takes EBIT margin from +14.4% to +10.5% — about 39bps of EBIT margin per 1% of revenue** (*inference, labelled: it assumes cost of revenue is fully variable, which the "greater of" policy makes optimistic, and assumes no management response*).

**Current direction: Headwind, already guided and already acknowledged.** FY2027 gross margin is guided to 53.7% against 57.2% in FY2026 — **−351bps** — and the CFO, asked directly why, answered: "it's due to the mix of the business, and it's being offset by some changes in the operating expenses" [5, Outlook; 11, Q&A (Schoell / Goldstein)]. The one input that would settle whether this is a manageable headwind or a serious one is pre-order volume, and it is **not quantifiable from this pool**: management described pre-orders as "extraordinary" and "tracking far in excess of our initial expectations" without a number [11, prepared remarks]. The bridge in Section 7 reconciles to zero residual, so the "biggest driver" claim here is not resting on unexplained arithmetic — but it does rest on a forward input the engine cannot verify, and that distinction travels with it.

---

## 9. Investment Spend — Both Signs

**Trigger met.** Capital expenditure is guided to **approximately $290m for FY2027, +52% above FY2026's $190.2m** and above every year in the five-year history ($158.6m, $204.2m, $169.1m, $189.7m, $190.2m). Trailing-twelve-month capex is $304.5m, up 72.1% year on year. Purchases of fixed assets in the six months to 2026-09-30 were **$163.3m against $57.0m** a year earlier — 2.9x. Separately, cash spend on software development costs and licences (which sits *inside* operating cash flow, not capex) was **$372.4m in H1 FY27 against $345.0m** [1, p.66; 3, Statements of Cash Flows; 5, Outlook; upstream `01`, §2].

| Reading | What it would show | Evidence here |
|---|---|---|
| **Spend as a future COST** | A depreciation and amortisation step-up, its recognition lag, the line it lands in, and what it does to margin as it arrives | **Two separate cost tails, with very different weights.** (i) **The real one — content, not capex.** Capitalised software development costs and licences stand at **$2,577.3m** at 2026-09-30, up $231.0m in six months ($82.4m current + $2,494.9m non-current, from $68.8m + $2,277.5m). This lands in **cost of revenue** when titles release, over 9–36 months, at the greater of revenue-proportional or straight-line [1, Note 1; 3, Balance Sheets]. It is already visible in guidance: FY2027 cost of revenue guided to 46.3% of revenue vs 42.8% in FY2026, a **−351bps** gross-margin effect, with $572m of acquired-intangible amortisation and $113m of stock-based compensation inside that cost line [5, Outlook]. (ii) **The fixed-asset tail is small and partly a lease swap.** The six-month capex surge is substantially "our purchase of the building where we previously leased office space in London, England" — a $91.8m asset acquisition allocated **$82.9m to land (not depreciated) and $8.9m to building over 20 years**, "net of the derecognition of the preexisting lease liability and right-of-use asset" [3, Note 15 (Asset Acquisition) and MD&A — Liquidity]. That replaces rent with a trivial depreciation charge; it is not capacity. FY2027 depreciation is guided at **$165m**, against $198.5m of operating-expense D&A in FY2026 — i.e. **guided lower, not higher** [5, EBITDA reconciliation; 1, Item 7]. The rest of the increase is cloud and IT infrastructure, already showing up as the +$5.5m of G&A dollars [3, Item 2]. |
| **Spend as a DEMAND signal** | Backlog / bookings / contracted revenue, management's own supply-vs-demand language, whether capacity is sold before it is built | **The content spend is pre-sold in a way the fixed-asset spend is not.** (i) Q3 FY27 Net Bookings guided to **$3,350–3,500m against $1,757.1m a year earlier — +90.6% to +99.2%** — with GAAP revenue guided to $3,270–3,420m against $1,699.0m [5, Outlook; upstream `04`, §1A]. That is a firm company commitment made ten days before launch, not a hope. (ii) Deferred revenue of **$1,017.1m current plus $25.0m non-current** at 2026-09-30 is billed-but-unrecognised revenue — the closest thing this business has to a backlog, though note it **fell** from $1,159.9m at 2026-03-31, a $147.3m six-month outflow [3, Balance Sheets and Statements of Cash Flows]. (iii) Management's own language is demand-side and emphatic but **unquantified**: "The launch of Grand Theft Auto VI is only 10 days away, and the level of preorders generated is extraordinary", "tracking far in excess of our initial expectations" [11, prepared remarks]. (iv) The Street has moved toward it, though only by shifting money between quarters: FQ3 2027 Net Bookings consensus rose +5.2% in the ten days after the print while FY2027 was left flat and FY2028 was cut 1.8% [upstream `04`, §4]. (v) There is **no supply constraint** on digital software — the "capacity sold before it is built" test does not apply in the physical sense; the analogue is content built against a dated, pre-ordered release, which is what the $2,577.3m balance is. |

**Current read: the demand reading is better evidenced for the CONTENT spend, and the cost reading is correct for the FIXED-ASSET spend — and conflating the two is the error to avoid here.** The headline "+52% capex" is mostly an office building and IT, carries a *falling* guided depreciation charge, and is not a demand signal at all. The spend that genuinely carries both signs is the $2,577.3m capitalised content asset: it is simultaneously the guided −351bps gross-margin headwind for FY2027 and the only reason Q3 FY27 revenue can roughly double. On the evidence available today the demand sign dominates, because it is anchored in a company-guided, component-by-component outlook (revenue, cost of revenue and operating expenses each with a range) rather than in an adjective — and because the operating-leverage arithmetic in Section 7a says a doubling of revenue against a near-fixed cost base is worth about +2,227bps of EBIT margin, dwarfing the −801bps of gross margin it costs.

**The ONE observable that would flip it:** the Q3 FY27 print on **2027-02-09** — specifically whether cost of revenue lands inside the guided **$1,649–1,732m** on revenue inside **$3,270–3,420m**. If revenue lands in range but cost of revenue overshoots, the "greater of" amortisation floor is binding and the content asset is not earning its cost; if revenue misses and an impairment appears in cost of revenue (the mechanism that already produced $43.4m in Q1 FY27), the cost reading wins outright and the FY2027 53.7% guided gross margin becomes the ceiling rather than the forecast [5, Outlook; 1, Note 1; upstream `04`, §1A for the filing date].

---

## 10. Computation Log (executed, not mental arithmetic)

All percentages and basis-point deltas above were produced by an executed Python snippet. Inputs are the cited filing figures; the printed output is reproduced verbatim.

```python
# Q2 FY27 vs Q2 FY26, filing basis [3, Item 2].  rev: 1497.0 vs 1773.8
# cost of revenue lines (2026, 2025): product 184.0/229.3 ; game intangibles 140.8/158.8
#   software dev & royalties 107.9/172.1 ; licences 131.9/154.4 ; internal royalties 72.0/78.7
# opex: S&M 444.9/536.7 ; R&D 254.4/268.0 ; G&A 230.5/225.0 ; D&A 48.1/48.8
# guidance midpoints [5]: FY27 rev 8080 CoR 3739.5 opex 4088 ; Q3 rev 3345 CoR 1690.5 opex 1172
```

```
rev change            -276.8   = -15.60%
Product costs          12.29% vs 12.93%  ->  +64bps favourable
Game intangibles        9.41% vs  8.95%  ->  -45bps
Software dev & royalty  7.21% vs  9.70%  -> +249bps favourable
Licenses                8.81% vs  8.70%  ->  -11bps
Internal royalties      4.81% vs  4.44%  ->  -37bps
Cost of revenue        42.525% vs 44.723%   Gross margin 57.475% vs 55.277% = +220bps
S&M  29.72% vs 30.26% = +54bps   ($ -91.8)     R&D 16.99% vs 15.11% = -189bps  ($ -13.6)
G&A  15.40% vs 12.68% = -271bps  ($  +5.5)     D&A  3.21% vs  2.75% =  -46bps  ($  -0.7)
Total opex 65.324% vs 60.802% = -452bps ;  EBIT margin -7.849% vs -5.525% = -232bps
opex split: cost-dollar -567bps / denominator +1019bps  (sum +452 OK)
CoR  split: cost-dollar -883bps / denominator  +664bps  (sum -220 OK)
EBIT: cost relief +1450bps - denominator drag 1683bps = -233bps (vs -232, residual -1bp rounding)
non-GAAP EBITDA margin  6.16% (92.2) vs 6.58% (116.7) = -42bps ; mgmt-basis 18.51% (277.1)
H1 FY27 gross margin 57.504% vs 58.747% = -124bps ; impairment 43.6 = 144bps of H1 revenue
FY26 gross 57.23% opex 58.80% EBIT -1.57% ; FY25 gross 54.34%
FY27 guided: gross 53.72% (-351bps vs FY26) opex 50.59% (-820bps) EBIT +3.13% (+469bps)
Q3 FY27 guided: gross 49.46% (-801bps vs Q2 FY27) opex 35.04% EBIT +14.42% (+2227bps)
Q3 FY27 guided CoR embeds SBC 96 = 2.87% of rev ; acquired intangibles 141 = 4.22%
FY27 guided CoR embeds SBC 113 = 1.40% of rev ; acquired intangibles 572 = 7.08%
Q3 sensitivity (opex fixed at 1172, CoR ratio held at 50.54%): -10% revenue -> EBIT 10.53%
   i.e. -387bps for a 10% miss = ~39bps of EBIT margin per 1% of revenue
capex: FY22-26 158.6/204.2/169.1/189.7/190.2 ; FY27 guide 290 = +52.5% vs FY26
6M fixed assets 163.3 vs 57.0 = 2.86x ; capitalised sw dev 2577.3 vs 2346.3 (+231.0)
```

---

## 11. Citations

[1] FY2026 Form 10-K (fiscal year ended 2026-03-31), filed 2026-05-22 — Item 1 (Business — General / Our Businesses / Sales / Marketing); Item 1A (Risk Factors — dependence on key products; limited number of channel partners; ability to acquire and maintain licenses); Item 7 (MD&A — Cost of revenue and gross profit; Operating Expenses; net revenue by content / platform / distribution channel; Online Content and Digital Distribution); Note 1 (Basis of Presentation and Significant Accounting Policies — Software Development Costs and Licenses); Note 21 (Segment); Consolidated Statements of Cash Flows p.66. `data/TTWO/10K_2025_26_0001628280-26-037434.pdf`
[2] FY2025 Form 10-K (fiscal year ended 2025-03-31) — Item 7 (MD&A — Cost of revenue and gross profit; Operating Expenses, FY2025 / FY2024 / FY2023). `data/TTWO/10K_2024_25_0001628280-25-026694.pdf`
[3] Q2 FY2027 Form 10-Q (quarter ended 2026-09-30) — Condensed Consolidated Balance Sheets p.2; Statements of Operations p.3; Statements of Cash Flows p.5 (six months); Item 2 (MD&A — Results of Operations: Three Months Ended September 30, 2026 Compared to September 30, 2025, and Six Months comparison; Cost of revenue; Operating Expenses; Net Bookings; Online Content and Digital Distribution; Liquidity and Capital Resources); Note 15 (Asset Acquisition); Note 16 (Subsequent Events). `data/TTWO/10Q_2Q_0001628280-26-072254.pdf`
[4] Q1 FY2027 Form 10-Q (quarter ended 2026-06-30) — Condensed Consolidated Statements of Operations. `data/TTWO/10Q_1Q_0001628280-26-054870.pdf`
[5] TTWO Q2 FY2027 earnings release (Form 8-K Exhibit 99.1), dated 2026-11-09 — p.1 (Net Bookings $1,601.3m, −18%); p.2 (management-reporting adjustment table, 18% management tax rate, 188.0m share count); "Outlook for Fiscal Year 2027" and "Fiscal Third Quarter Ending December 31, 2026" (GAAP revenue, cost of revenue, operating expenses, EPS, capex, non-GAAP EBITDA, Net Bookings, and the deferred-revenue / stock-based-compensation / acquired-intangible adjustment columns); "Non-GAAP Financial Measure" (EBITDA definition); p.11 (Reconciliation of GAAP to Non-GAAP Measure); "Key assumptions and dependencies"; release schedule. `data/TTWO/TTWO 2Q27 Earnings Release FINAL.pdf`
[6] TTWO Q1 FY2027 earnings release (Form 8-K Exhibit 99.1), dated 2026-08-07 — p.2 (management-reporting adjustment table; Q1 FY27 impairment on an abandoned third-party title). `data/TTWO/TTWO 1Q27 Earnings Release FINAL 8-6-2026.pdf`
[7] Capital IQ `Financials_Annual` export, **Income Statement** and **Segments** tabs (FY2017 → FY2026 + LTM Sep-30-2026; reported currency USD m; restatement basis "Latest Filings"), data as of the 2026-11 export. `data/TTWO/Take Two Interactive Software Inc NasdaqGS TTWO Financials_Annual.xls`
[8] Capital IQ `Financials_Annual` export, **Cash Flow** and **Supplemental** tabs. Same workbook as [7].
[9] Capital IQ `Financials_Quarterly` export, **Income Statement** tab (FQ1 2017 / Jun-30-2016 → FQ2 2027 / Sep-30-2026), data as of the 2026-11 export — used ONLY where the filing does not disclose the line (Q3 FY26 and Q4 FY26 columns), and never mixed with filing-basis margins. `data/TTWO/Take Two Interactive Software Inc NasdaqGS TTWO Financials_Quarterly.xls`
[10] `ciq_facts.json` deterministic facts sidecar (frozen extract generation) — `ltm_ebitda_m` 724.9; `ltm_ocf_m` 367.1; `margin_trend`; `segments`; all referencing the Capital IQ workbooks at [7]–[9]. Tier-5 vendor export, never cited as a filing.
[11] Take-Two Interactive Software, Inc., **Q2 2027 Earnings Call verbatim transcript**, 2026-11-09 (S&P Capital IQ; Call Participants + Presentation + Question and Answer) — prepared remarks (Goldstein: cost of revenue, operating expenses, management-basis operating expense growth, FY27 and Q3 outlook, pre-orders; Zelnick: Q2 shortfall); Q&A (Schoell / Goldstein on full-year gross margin drivers; Smilek / Goldstein on user-acquisition costs; Song / Goldstein on Q4 operating expenses; Heaney / Zelnick on direct-to-consumer margins). `data/TTWO/Take-Two Interactive Software, Inc., Q2 2027 Earnings Call, Nov 09, 2026.rtf`
[12] Take-Two Interactive Software, Inc., Q1 2027 Earnings Call verbatim transcript, 2026-08-07 (S&P Capital IQ). `data/TTWO/Take-Two Interactive Software, Inc., Q1 2027 Earnings Call, Aug 07, 2026.rtf`

**Upstream and cross-module inputs used:** `analyses/TTWO_2026-11-19/earnings/00_earnings-data-triage.md` (jurisdiction, reporting basis, pool inventory, the Net-Bookings-vs-GAAP basis warning); `…/01_historical-financials.md` (margin baseline, the vendor-vs-filing gross-margin trap, TTM and capex series); `…/04_guidance-consensus.md` (guidance table, basis bridges, Q3 FY27 filing date, consensus revision pattern); `analyses/TTWO_2026-11-19/business-model/02_business-identity.md` §3a (sector-overlay determination, KPI presence/absence), `03_segment-map.md` (single-segment structure), `06_value-chain.md` (pricing power, pass-through, realised cost absorption), `10_external-dependency.md` (cyclicality classification, policy register, FX sensitivity).

**Not used:** `Alphabet Inc NasdaqGS GOOGL Key Developments.xls` is a wrong-company pool contaminant (Alphabet Inc., not Take-Two) and is cited nowhere in this report. The DEF 14A export (2026-07-27) contains no tabular payload and carries no margin content.

---

## 12. Self-Check

- Segment decomposition status stated explicitly (Section 1): single reportable segment per the company; revenue disaggregated on four axes, costs disclosed on none.
- Sector overlay step completed (Section 1a): no matching row in `SECTOR_OVERLAYS.md`; generic cost stack applies, built from the company's own nine disclosed cost lines; bank / REIT / SaaS / miner grammars explicitly rejected with reasons.
- Every driver row carries direction, magnitude and evidence. Two rows carry **Unknown** and two carry **Not assessable** rather than a manufactured read.
- The bridge uses reported line items only; the residual is **0bps** on the ratio bridge and **−1bp** (rounding) on the causal decomposition, both printed with their arithmetic and their basis named.
- Section 7a closes with the standalone `RF-EARN-002` tag line in the reconciled form.
- Primary margin metric (EBIT, filing basis) chosen and justified in Section 4, with the single-quarter limitation stated.
- Section 8 names ONE driver.
- Section 9 states both signs with evidence on each, separates the content spend from the fixed-asset spend (which is largely a lease buyout with a *falling* guided depreciation charge), and names the one observable that would flip the read.
- Pass-through lag stated explicitly (Section 3): price rises only at a launch, price **cuts** 3–9 months after one; no contractual escalator, but realised absorption of 160bps in FY2026 shown separately from the contractual fact.
- Cycle position stated with evidence (Section 1b): release-cycle trough in Q2 FY27, peak in Q3 FY27, with three non-run-rate items labelled. Reconciled against business-model `10_external-dependency.md` — no divergence.
- Segment/content/platform mix treated as a scored driver (Sections 5 and 6), not buried in prose.
- Verbatim transcript present for the latest quarter, so no transcript limitation and no `MODULE_RULES.md` score cap arises from this agent's inputs.
- No banned phrases. No vendor margin figure mixed with a filing margin figure.



---

## earnings / 04_guidance-consensus.md

_Source: `04_guidance-consensus.md`_

# Guidance & Consensus — TTWO

**Evidence binding.** Frozen supervisor-verified read mode. Every manifest / corpus / CIQ-facts / extract read resolved inside the single bound generation `.extract-generations/0af638492ecb0521db2676c79d75e6940c7227bb9f192567527b8a57eb43203d/`. The live logical path `data/TTWO/` was not read; it is a citation label only. Reporting standard **US GAAP**, currency **USD, millions**, fiscal year ends **31 March** (FY2027 = year ending 2027-03-31).

**Basis warning carried forward from triage `00` (read this before any number below).** Take-Two reports two different top-line numbers and the vendor consensus tracks the *operational* one:

- **Net Bookings** — the company's own operational metric ("the net amount of products and services sold digitally or sold-in physically during the period … includes licensing fees, merchandise, in-game advertising, and publisher incentives") [`Q2 FY27 10-Q, MD&A — Net Bookings`].
- **GAAP total net revenue** — the statutory line.
- Q2 FY27: Net Bookings **$1,601.3m** vs GAAP net revenue **$1,497.0m** — a $104.3m difference equal to the change in deferred net revenue [`TTWO 2Q27 Earnings Release, 2026-11-09, p.1–2`; `Q2 FY27 10-Q, MD&A`].
- The Capital IQ consensus field labelled "Revenue" is on the **Net Bookings** basis, proven two ways: its FQ2 2027 actual is 1,601.30, not 1,497.0, and its FY2027 "Guidance Low/High" of 8,000 / 8,200 matches the Net Bookings range exactly, not the GAAP range of 7,980 / 8,180 [`Capital IQ Estimates export, Consensus tab, Fiscal Years + Fiscal Quarters sections, data as of 2026-11-19`; `TTWO 2Q27 Earnings Release, "Outlook for Fiscal Year 2027"`].

Every bar below is labelled with its basis. No figure mixes the two (§15).

**Definitional bridge — verified, not assumed.** Two vendor fields needed proving before they could be compared to guidance, because the company guides a GAAP column and a management-basis column in the same table:

- `Capital IQ "EPS Normalized" = the company's management-reporting diluted EPS at an 18% management tax rate.` Test on Q1 FY27: pre-tax loss (49.3) − 132.0 (deferred) + 86.0 (stock comp) + 168.4 (amortisation of acquired intangibles) + 4.6 (business acquisition) + 3.2 (other) = 80.9; × 0.82 = 66.3; ÷ 187.8m shares = **$0.353**. Vendor FQ1 2027 actual = **0.3532** [`TTWO 1Q27 Earnings Release, 2026-08-07, p.2`; `Capital IQ Estimates export, Surprise tab, FQ1 2027`].
- `Capital IQ "EBITDA" = the company's management-basis non-GAAP EBITDA.` Test on Q1 FY27: 167.0 − 132.0 + 86.0 + 2.9 + 3.2 = **127.1**. Vendor FQ1 2027 actual = **127.1** [same sources]. Repeat on Q2 FY27: 92.2 + 101.9 + 90.0 + 2.4 − 9.4 = **277.1**; vendor actual = **277.1** [`TTWO 2Q27 Earnings Release, p.2`; `Capital IQ Estimates export, Surprise tab, FQ2 2027`].

Both bridges reconcile to the cent on two consecutive quarters, so the consensus-vs-guidance comparisons in Section 3 are like-for-like. Where a guidance figure below is *derived* through these bridges rather than printed by the company, it is marked **(derived — arithmetic shown)**.

---

## 1. Consensus Data Metadata

| Field | Value |
|---|---|
| Source | **Capital IQ** — `Take-TwoInteractiveSoftware,IncNasdaqGSTTWOEstimatesReport.xls`, 7 tabs (Consensus, Recent Changes, Guidance, Surprise, Trends, Revisions, Multiples). Pool export, not web, not memory |
| Data as of date | **2026-11-19** (latest revision event timestamped 1:08 AM on the export date; prior dated events 2026-11-18, 2026-11-13, 2026-11-11) [`Capital IQ Estimates export, Recent Changes tab`]. Consensus was refreshed **after** the 2026-11-09 Q2 FY27 print — the stale-consensus guard does **not** trigger |
| Fiscal year basis | Company fiscal year, FYE **31 March**. FY2027 = year ending 2027-03-31; FQ3 2027 = three months ending 2026-12-31. Header: "Current Fiscal Year End: Mar-31-2027 \| FQ3 2027 Earnings Release Date: Feb-09-2027" |
| Analyst count | 29 analysts cover the name (29/29 on target price; recommendation Buy 1.21 — 25 Buy / 3 Outperform / 0 Hold / 1 Underperform / 0 Sell). Per-metric contributing counts: FY2027 revenue 20/29, FY2027 EPS Normalized 24/28, FY2027 EPS (GAAP) 14/18, FY2027 EBITDA 15/22; FQ3 2027 revenue 17/22, EPS Normalized 21/23, EPS (GAAP) 9/11, EBITDA 12/14 |
| Currency | **USD**, millions (EPS in USD/share). "Currency: Reported Currency \| Conversion: Today's Spot Rate"; `ciq_facts.json` → `currency: USD` |
| Calendarization issue? | **N for the period mapping, Y for the metric definition.** All figures below are taken from the vendor's *Fiscal Years* and *Fiscal Quarters* sections, which match the company's own 31-March fiscal calendar — no calendar-year splicing. The real mismatch is definitional, not calendrical: the vendor's "Revenue" field is **Net Bookings**, and its "EPS Normalized" / "EBITDA" fields are the company's **management basis**, not GAAP. All three are bridged and labelled above |

Note on the vendor's "Recommendation" and "Target Price" fields: not ingested, not carried forward. The engine forms its own verdict and does not use sell-side ratings or price targets as evidence (§24). They are recorded here only to show how many analysts are in the panel.

---

## 1A. Reporting-Basis Reconciliation (mandatory — CLAUDE.md §27; done BEFORE any bar is quoted)

| Field | Value |
|---|---|
| Next period the company will actually FILE | **Q3 FY2027 — the standalone three months ending 2026-12-31** (Form 10-Q), with the nine months ended 2026-12-31 shown alongside |
| Expected filing date + source for that date | Earnings release **2027-02-09**, from the vendor header line "FQ3 2027 Earnings Release Date: Feb-09-2027" [`Capital IQ Estimates export, Consensus tab header, data as of 2026-11-19`]. The 10-Q follows on or about that date; the company's last two 10-Qs were filed alongside their releases [`Q1 FY27 10-Q, cover page`; `Q2 FY27 10-Q, cover page`] |
| What that filing contains | **Standalone period** (US 10-Q three-month column), **with a cumulative nine-month column beside it**. Proven on the current filing: "For the quarterly period ended September 30, 2026", presenting "Three Months Ended September 30," and "Six Months Ended September 30," side by side [`Q2 FY27 10-Q, cover page and MD&A, Results of Operations`] |
| Vendor estimate as pulled (period label + value) | **FQ3 2027 — Dec 2026, standalone quarter**: Revenue (Net Bookings basis) mean **3,573.61** / median 3,500.90 / high 4,087 / low 3,403 (17 of 22); EPS Normalized (management basis) mean **4.21322** / median 3.99 (21 of 23); EPS (GAAP) mean **2.02115** / median 1.77 (9 of 11); EBITDA (management basis) mean **965.28** / median 977.95 (12 of 14) [`Capital IQ Estimates export, Consensus tab, Fiscal Quarters section`] |
| Already-reported stub inside that period (period + actuals + citation) | **None — the vendor's FQ3 label and the filing's reporting period are the same standalone three months, so there is no stub to add back.** For the FY2027 *annual* bar there IS a stub: H1 FY27 (six months ended 2026-09-30) Net Bookings **$2,987.2m** (down 11.7% from $3,383.6m), GAAP net revenue **$3,030.9m**, GAAP net loss **$(88.1)m**, GAAP diluted EPS **$(0.47)** = Q1 $(0.18) + Q2 $(0.29) [`Q2 FY27 10-Q, MD&A — Net Bookings` and `Results of Operations`; `TTWO 1Q27 Earnings Release, p.2`; `TTWO 2Q27 Earnings Release, p.1`] |
| **Consensus restated onto the filing basis** — show the arithmetic | **Q3 FY2027 (standalone quarter): no restatement required.** 3,573.61 Net-Bookings-basis = 3,573.61; 4.21 management-basis EPS = 4.21; 2.02 GAAP EPS = 2.02. The vendor period label and the filing period coincide, which was verified, not assumed. **Cross-basis conversion (inference, not from filings):** the company guides Q3 Net Bookings $3,350–3,500 and Q3 GAAP net revenue $3,270–3,420 — an $80m wedge at both ends, equal to the guided "change in deferred net revenue and related cost of revenue" of $80m. Applying that same wedge, a Net-Bookings-basis consensus of 3,573.6 implies roughly **3,494 on the GAAP net-revenue basis the 10-Q will print**, if deferred revenue moves as guided. **FY2027 (annual): bar = H1 actual + implied H2.** Net Bookings: 2,987.2 (reported) + 5,567.5 (implied by the 8,554.7 annual consensus) = **8,554.7**. GAAP diluted EPS: $(0.47) (reported) + $2.38 (implied H2) = **$1.91** |
| Basis-restated bar vs the same period a year earlier | **Q3 FY2027 Net Bookings:** restated bar 3,573.6 vs Q3 FY26 actual **1,757.1** = **+103.4% YoY**; management guidance of 3,350–3,500 is +90.6% to +99.2% YoY [`Capital IQ Estimates export, Surprise tab, FQ3 2026 actual`; corroborated on the call — "compared to $1.76 billion in the prior year", `Q2 2027 Earnings Call transcript, 2026-11-09, prepared remarks (Goldstein)`]. **Q3 FY2027 management-basis EPS:** 4.21 vs 1.2271 a year earlier = +243%. **FY2027 Net Bookings:** restated bar 8,554.7 vs FY2026 actual **$6,721.0m** = **+27.3% YoY**; guidance 8,000–8,200 is +19.0% to +22.0% YoY [`FY26 10-K, Item 7 MD&A — Net Bookings` ("Net Bookings $6,721.0 … 5,648.0 … 19.0%")]. **FY2027 GAAP diluted EPS:** restated bar $1.91 vs FY2026 actual **$(1.62)** — a swing from loss to profit |

**Sanity check (restated bar ÷ already-reported stub).** Not applicable in the template's half-year form, because the next filing is a standalone quarter with no stub inside it — the exact condition the check screens for (a vendor standalone estimate carried into a cumulative print) does not exist for a US 10-Q filer. Run at the annual level instead: FY2027 restated bar 8,554.7 ÷ H1 stub 2,987.2 = **2.86**. A full year over a half-year stub should exceed 2 (here skewed well above 2 because the GTA VI launch sits in H2), and it is nowhere near 1 — so the vendor's annual figure is a genuine full-year number, not an unconverted stub. The period labels resolve cleanly; the "basis unresolved" path is not taken and no consensus-setup cap arises from basis.

**Every "bar" figure in Sections 3, 6 and 7 is the restated figure above, labelled with its basis.**

---

## 2. Management Guidance

Issued **2026-11-09** alongside the Q2 FY27 print: FY2027 outlook updated, Q3 FY2027 outlook initiated [`TTWO 2Q27 Earnings Release, 2026-11-09, "Outlook for Fiscal Year 2027"`; `Take-Two_Interactive_2Q FY27 FINAL deck, slides 7–10`; corroborated as a guidance event by `Capital IQ Estimates export, Guidance tab, Latest Guidance Key Development, 2026-11-09`].

### 2.1 Fiscal year 2027 (ending 2027-03-31)

| Metric | Period | Guidance | Midpoint | Type | Source |
|---|---|---|---|---|---|
| **Net Bookings** (operational metric) | FY2027 | $8,000 to $8,200m | **8,100** | Range — reiterated, unchanged from the Q1 outlook | `TTWO 2Q27 Earnings Release, "Outlook for Fiscal Year 2027"` |
| **GAAP total net revenue** | FY2027 | $7,980 to $8,180m | **8,080** | Range — **raised** from $7,900–8,100m | `TTWO 2Q27 Earnings Release`; prior from `TTWO 1Q27 Earnings Release, 2026-08-07, p.3` |
| GAAP cost of revenue | FY2027 | $3,679 to $3,800m | 3,739.5 | Range — raised from $3,538–3,658m | same |
| GAAP operating expenses | FY2027 | $4,078 to $4,098m | 4,088 | Range — **cut** from $4,150–4,170m | same |
| GAAP income before income taxes | FY2027 | $194 to $253m | 223.5 | Range — raised from $159–219m | same |
| GAAP net income | FY2027 | $109 to $142m | 125.5 | Range — vs prior $104–143m | same |
| **GAAP diluted EPS** | FY2027 | $0.57 to $0.75 | **0.66** | Range — vs prior $0.55–0.75 | same |
| **Non-GAAP EBITDA (as printed, GAAP column)** | FY2027 | $1,024 to $1,082m | 1,053 | Range — raised from $993–1,053m | same |
| **Non-GAAP EBITDA, management basis** | FY2027 | **$1,536 to $1,594m** | **1,565** | **Derived — arithmetic shown:** 1,024 + 47 (deferred) + 462 (stock comp) + 3 (other) = 1,536; 1,082 + 512 = 1,594 | derived from `TTWO 2Q27 Earnings Release` outlook table via the Section-0 bridge |
| **Management-reporting diluted EPS** | FY2027 | **$5.75 to $6.01** | **5.88** | **Derived — arithmetic shown:** (194 + 47 + 462 + 623 + 3) × 0.82 ÷ 189.5m = 5.75; (253 + 1,135) × 0.82 ÷ 189.5m = 6.01 | derived from `TTWO 2Q27 Earnings Release` outlook table via the Section-0 bridge |
| Net cash from operating activities | FY2027 | **over $1,000m** | n/a (floor) | One-sided — unchanged | `TTWO 2Q27 Earnings Release`; repeated verbally — "We remain … to deliver operating cash flow in excess of $1 billion and to be in a net cash position by the end of the fiscal year" [`Q2 2027 Earnings Call transcript, 2026-11-09, prepared remarks (Goldstein)`] |
| Capital expenditures | FY2027 | **approximately $290m** | 290 | Point — unchanged | same |
| Recurrent consumer spending (RCS) growth | FY2027 | **flat YoY**, 65% of Net Bookings | n/a | Qualitative + mix point — unchanged | `Take-Two_Interactive_2Q FY27 FINAL deck, slide 8`; `Q2 2027 transcript, prepared remarks` |
| RCS composition assumption | FY2027 | GTA series up (GTA VI: Ultimate Edition add-on content); NBA 2K up high single digits; mobile down | n/a | Qualitative | same |
| Label mix of Net Bookings | FY2027 | roughly 37% Rockstar Games / 34% Zynga / 29% 2K | n/a | Point mix | `Q2 2027 transcript, prepared remarks (Goldstein)` |
| Management-basis operating expense growth | FY2027 | approximately **+5% YoY** (favourable to the prior forecast on lower user-acquisition costs, part timing) | n/a | Point | same |
| Diluted share count assumption | FY2027 | 189.5m | n/a | Point | `TTWO 2Q27 Earnings Release` |
| Management tax rate assumption | FY2027 | 18% | n/a | Point | same |

### 2.2 Fiscal third quarter 2027 (three months ending 2026-12-31) — initial outlook

| Metric | Period | Guidance | Midpoint | Type | Source |
|---|---|---|---|---|---|
| **Net Bookings** | Q3 FY2027 | $3,350 to $3,500m | **3,425** | Range — initial | `TTWO 2Q27 Earnings Release, "Fiscal Third Quarter Ending December 31, 2026"` |
| **GAAP total net revenue** | Q3 FY2027 | $3,270 to $3,420m | **3,345** | Range — initial | same |
| GAAP cost of revenue | Q3 FY2027 | $1,649 to $1,732m | 1,690.5 | Range | same |
| GAAP operating expenses | Q3 FY2027 | $1,162 to $1,182m | 1,172 | Range | same |
| GAAP income before income taxes | Q3 FY2027 | $446 to $493m | 469.5 | Range | same |
| GAAP net income | Q3 FY2027 | $250 to $276m | 263 | Range | same (the companion deck labels this row "GAAP Net Loss" — a label error in the deck; the release says "Net income", and the filing-tier document wins, §4) |
| **GAAP diluted EPS** | Q3 FY2027 | $1.30 to $1.44 | **1.37** | Range | same |
| **Non-GAAP EBITDA (as printed)** | Q3 FY2027 | $651 to $698m | 674.5 | Range | same |
| **Non-GAAP EBITDA, management basis** | Q3 FY2027 | **$940 to $987m** | **963.5** | **Derived:** 651 + 93 + 196 = 940; 698 + 289 = 987 | derived via the Section-0 bridge |
| **Management-reporting diluted EPS** | Q3 FY2027 | **$3.80 to $4.00** | **3.90** | **Derived:** (446 + 93 + 196 + 153 + 1) × 0.82 ÷ 192.0m = 3.80; (493 + 443) × 0.82 ÷ 192.0m = 4.00 | derived via the Section-0 bridge |
| RCS growth | Q3 FY2027 | **approximately +12% YoY** | n/a | Point | `Take-Two_Interactive_2Q FY27 FINAL deck, slide 10`; `Q2 2027 transcript, prepared remarks` |
| Management-basis operating expense growth | Q3 FY2027 | approximately **+21% YoY**, driven by GTA VI launch marketing | n/a | Point | `Q2 2027 transcript, prepared remarks (Goldstein)` |
| Diluted share count assumption | Q3 FY2027 | 192.0m | n/a | Point | `TTWO 2Q27 Earnings Release` |

### 2.3 Stated assumptions the guidance depends on

Management names them: "a continuation of the current economic backdrop; the timely delivery of the titles included in this financial outlook; continued growth in the installed base of PlayStation 5 and Xbox Series X|S; … factors affecting our performance on mobile, such as player acquisition costs; our ongoing focus on our live services portfolio and new game pipeline; and stable foreign exchange rates" [`TTWO 2Q27 Earnings Release, "Key assumptions and dependencies"`]. It also warns that the components may not foot: "The individual components of the financial outlook may not foot to the totals, as the Company does not expect actual results for every component to be at the low end or high end of the outlook range simultaneously" [same].

### 2.4 What management said about the quarter it just missed

Q2 FY27 Net Bookings came in at **$1,601.3m against its own guidance of $1,620–1,670m** — below the low end by $18.7m. On the call: "We delivered second quarter net bookings of $1.6 billion, which was slightly below our guidance range of $1.62 billion to $1.67 billion. While NBA 2K27 launched successfully and achieved the second highest net bookings performance in the history of the series, it was below our forecast for the period" [`Q2 2027 Earnings Call transcript, 2026-11-09, prepared remarks (Zelnick)`]. The RCS assumption also missed: "Recurrent consumer spending was down 9% for the period compared to our guidance of a 5% decline, driven by NBA 2K" [same, Goldstein]. The offsets were the GTA series ahead of forecast and management-basis operating expenses 9% lower YoY, "favorable to our forecast due to lower personnel and user acquisition costs" [same].

---

## 3. Guidance vs Consensus Table

**Gap = Consensus mean − Guidance midpoint.** Positive = the Street sits above guidance. Consensus as of **2026-11-19**; guidance issued **2026-11-09**. Each row states its basis.

### 3.1 Fiscal year 2027 (ending 2027-03-31)

| Metric (basis) | Period | Management Guidance (midpoint) | Street Consensus (mean, analysts) | Gap | Gap Direction |
|---|---|---|---|---:|---|
| **Net Bookings** (operational metric) | FY2027 | $8,000–8,200m (**8,100**) | **8,554.69** (20 of 29) | **+454.7 (+5.6%)** | **Guidance BELOW the Street** — and the Street sits **+354.7 (+4.3%) above the TOP of the guided range** |
| GAAP total net revenue | FY2027 | $7,980–8,180m (8,080) | Not separately polled — the vendor "Revenue" field is Net Bookings | n/a | Not assessable from this export |
| **GAAP diluted EPS** | FY2027 | $0.57–0.75 (**0.66**) | **1.9057** (14 of 18; median 2.03242; high 3.18; low 0.41) | **+1.246 (+189%)** | **Guidance far below the Street** — consensus is ~2.9x the guided midpoint |
| **Management-reporting diluted EPS** | FY2027 | **$5.75–6.01 (5.88)** — derived | **EPS Normalized 6.89386** (24 of 28; median 6.875; high 8.47; low 5.79) | **+1.01 (+17.3%)** | Guidance below the Street |
| **Non-GAAP EBITDA, management basis** | FY2027 | **$1,536–1,594m (1,565)** — derived | **1,692.79** (15 of 22; median 1,722.43; high 2,123.7; low 1,080) | **+127.8 (+8.2%)** | Guidance below the Street |
| GAAP net income | FY2027 | $109–142m (125.5) | **338.22** (12 of 17; median 338.7) | **+212.7 (+169%)** | Guidance far below the Street |
| Cash from operations | FY2027 | **over $1,000m** (floor) | **1,364.50** (14 of 14; median 1,351.55; low 1,000) | **+364.5 above the floor** | Street above the guided floor; the lowest estimate sits exactly on it |
| Capital expenditure | FY2027 | approximately **$290m** | **281.81** (15 of 16; **median exactly 290**) | **−8.2 (−2.8%)** | Street at guidance |

**The low-estimate test.** On Net Bookings, the single *lowest* FY2027 estimate in the panel is **8,112** — above the guidance midpoint of 8,100. There is no analyst in the set modelling the bottom half of management's own range. On GAAP EPS the panel is split instead: the low estimate of **0.41** sits below the guided floor of 0.57 while the mean of 1.91 is nearly three times the midpoint — a very wide dispersion (high 3.18, low 0.41 on 14 contributors), which says the Street has no settled view of where GAAP earnings land, only of where bookings do.

**What the FY2027 bar implies for the half not yet reported (§17).** H1 FY27 Net Bookings are already in the ground at **2,987.2**. So:
- Guidance midpoint implies H2 of 8,100 − 2,987.2 = **5,112.8**.
- Top of the guided range implies H2 of 8,200 − 2,987.2 = **5,212.8**.
- Street implies H2 of 8,554.7 − 2,987.2 = **5,567.5** — i.e. **+8.9% above the guidance-implied H2 midpoint and +6.8% above even the top-of-range H2**.
- Pushing one period further: Q3 guidance midpoint 3,425 leaves a guidance-implied Q4 of 8,100 − 2,987.2 − 3,425 = **1,687.8**; the most generous combination (top of the FY range, bottom of the Q3 range) leaves **1,862.8**. The Street's own FQ4 2027 estimate is **1,950.67** — above both. **Most of the Street's above-guidance assumption therefore sits in Q4 FY27, not in the GTA VI launch quarter.**
- Same arithmetic on GAAP EPS: H1 reported **$(0.47)**; guidance midpoint implies H2 of 0.66 + 0.47 = **$1.13**; the Street implies H2 of 1.91 + 0.47 = **$2.38** — roughly **2.1x** the guidance-implied H2.

### 3.2 Fiscal third quarter 2027 (three months ending 2026-12-31)

| Metric (basis) | Period | Management Guidance (midpoint) | Street Consensus (mean, analysts) | Gap | Gap Direction |
|---|---|---|---|---:|---|
| **Net Bookings** | Q3 FY2027 | $3,350–3,500m (**3,425**) | **3,573.61** (17 of 22; median 3,500.90; high 4,087; low 3,403) | **+148.6 (+4.3%)** | Guidance below the Street; consensus sits **+73.6 above the top of the range** |
| GAAP total net revenue | Q3 FY2027 | $3,270–3,420m (3,345) | **~3,494 implied** (3,573.6 less the guided $80m deferred-revenue wedge — *inference, not from filings*) | **~+149 (+4.5%)** | Guidance below the Street, on the inferred basis |
| **GAAP diluted EPS** | Q3 FY2027 | $1.30–1.44 (**1.37**) | **2.02115** (9 of 11; median 1.77; high 3.18; low 0.63) | **+0.651 (+47.5%)** | Guidance far below the Street |
| **Management-reporting diluted EPS** | Q3 FY2027 | **$3.80–4.00 (3.90)** — derived | **EPS Normalized 4.21322** (21 of 23; median 3.99; high 5.57; low 3.43) | **+0.313 (+8.0%)** | Guidance below the Street |
| **Non-GAAP EBITDA, management basis** | Q3 FY2027 | **$940–987m (963.5)** — derived | **965.28** (12 of 14; median 977.95; high 1,183.3; low 666.6) | **+1.8 (+0.2%)** | **Street sits on the guidance midpoint** |
| GAAP net income | Q3 FY2027 | $250–276m (263) | **382.24** (10 of 12; median 378.25) | **+119.2 (+45.3%)** | Guidance far below the Street |

**The one row that is not stretched.** Management-basis EBITDA for Q3 is the single metric where the Street is level with guidance (+0.2%). The gap on GAAP EPS (+47.5%) and GAAP net income (+45.3%) is therefore not an earnings-power disagreement — it is mostly a disagreement about non-operating and tax lines below EBITDA, and the Q2 print shows why: the GAAP result carried a **$57.9m benefit from income taxes** against a pre-tax loss [`Q2 FY27 10-Q, Results of Operations`], while the company's own outlook is built on a flat 18% management tax rate. Treat the GAAP-EPS gap as the lowest-quality of the gaps in this table.

---

## 4. Estimate Revision Momentum Table

Source: `Capital IQ Estimates export, Trends tab, data as of 2026-11-19`. The vendor publishes month-interval snapshots, not day counts, so the template's 90/60/30-day columns are the vendor's own **3 / 2 / 1 months ago** rows — labelled as such rather than re-dated. Basis labels carry: "Revenue" = Net Bookings; "EPS Normalized" = management basis.

| Estimate (basis) | 3 months ago | 2 months ago | 1 month ago | Current | Direction |
|---|---:|---:|---:|---:|---|
| Revenue — Net Bookings (FQ3 2027, next Q) | 3,385.37 | 3,381.70 | 3,384.76 | **3,573.61** | **Rising** — flat for two months, then +188.9 (+5.6%) in the last month |
| EPS Normalized — management basis (FQ3 2027) | 3.83 | 3.83 | 3.89 | **4.21** | **Rising** — +0.32 (+8.2%) last month |
| EPS (GAAP) (FQ3 2027) | 1.82 | 1.82 | 1.94 | **2.02** | **Rising** — +11.0% over three months |
| EBITDA — management basis (FQ3 2027) | 952.29 | 922.22 | 925.77 | **965.28** | **Rising** — +39.5 (+4.3%) last month, +1.4% over three months |
| Revenue — Net Bookings (FQ4 2027) | 2,057.07 | 2,054.75 | 2,054.55 | **1,950.67** | **Falling** — −103.9 (−5.1%) last month |
| EPS Normalized (FQ4 2027) | 1.63 | 1.64 | 1.64 | **1.21** | **Falling** — −0.43 (−26.2%) last month |
| Revenue — Net Bookings (FY2027, next FY) | 8,520.55 | 8,530.15 | 8,536.71 | **8,554.68** | **Rising, barely** — +34.1 (+0.4%) over three months |
| EPS Normalized (FY2027) | 6.87 | 6.91 | 6.96 | **6.89** | **Flat** — +0.3% over three months, −1.0% last month; but **−13.3% vs the 7.95 standing six months ago** |
| EPS (GAAP) (FY2027) | 1.92 | 1.84 | 1.84 | **1.91** | **Flat** — −0.5% over three months; **−46.8% vs the 3.59 standing six months ago** |
| EBITDA — management basis (FY2027) | 1,765.43 | 1,750.31 | 1,741.00 | **1,692.79** | **Falling** — −72.6 (−4.1%) over three months; −13.2% vs six months ago (1,951.19) |
| Revenue — Net Bookings (FY2028) | 9,224.60 | 9,278.70 | 9,279.85 | **9,039.05** | **Falling** — −240.8 (−2.6%) last month |
| EPS Normalized (FY2028) | 10.30 | 10.35 | 10.35 | **10.09** | **Falling** — −0.26 (−2.5%) last month |
| EBITDA — management basis (FY2028) | 2,518.53 | 2,507.62 | 2,509.27 | **2,458.89** | **Falling** — −50.4 (−2.0%) last month, −2.4% over three months |

**Independent cross-check of the post-print move.** The pre-call consensus printed in the transcript header lets the 2026-11-09 to 2026-11-19 move be measured directly rather than inferred from month buckets [`Q2 2027 Earnings Call transcript, 2026-11-09, S&P Global Market Intelligence Estimates header, "Consensus as of Nov-09-2026 4:45 PM GMT"`]:

| Estimate | Consensus 2026-11-09 (pre-call) | Consensus 2026-11-19 | Move in 10 days |
|---|---:|---:|---|
| Revenue — Net Bookings, FQ3 2027 | 3,397.47 | 3,573.61 | **+176.1 (+5.2%)** |
| Revenue — Net Bookings, FY2027 | 8,560.87 | 8,554.68 | −6.2 (−0.1%) |
| Revenue — Net Bookings, FY2028 | 9,205.51 | 9,039.05 | **−166.5 (−1.8%)** |
| EPS Normalized, FQ3 2027 | 3.92 | 4.21 | **+0.29 (+7.4%)** |
| EPS Normalized, FY2027 | 6.98 | 6.89 | −0.09 (−1.3%) |
| EPS Normalized, FY2028 | 10.19 | 10.09 | −0.10 (−1.0%) |

The post-print pattern is a **shift within FY2027, not an upgrade of it**: the Street moved roughly $176m of Net Bookings and $0.29 of EPS into the GTA VI launch quarter while leaving the full year unchanged and cutting FY2028. That is consistent with the company having reiterated FY27 while pre-announcing a larger Q3.

---

## 5. Revision Breadth

Source: `Capital IQ Estimates export, Revisions tab, data as of 2026-11-19`. "Net" = Upward − Downward. Analyst counts are the vendor's "# of Analysts" with "# still in Consensus" in brackets where they differ.

| Metric (basis) | Up Revisions | Down Revisions | Net Revision Breadth | Period |
|---|---:|---:|---:|---|
| Revenue — Net Bookings, FQ3 2027 | 11 | 3 | **+8** | Last month (15 analysts, 14 still in consensus) |
| Revenue — Net Bookings, FQ4 2027 | 2 | 10 | **−8** | Last month (15 analysts, 14 still in) |
| **Revenue — Net Bookings, FY2027** | **6** | **9** | **−3** | Last month (18 analysts, 18 still in) |
| Revenue — Net Bookings, FY2028 | 8 | 5 | **+3** | Last month (19 analysts, 18 still in) |
| EBITDA — management basis, FQ3 2027 | 8 | 1 | **+7** | Last month (11 analysts, 9 still in) |
| EBITDA — management basis, FQ4 2027 | 1 | 8 | **−7** | Last month (11 analysts, 9 still in) |
| **EBITDA — management basis, FY2027** | **8** | **4** | **+4** | Last month (14 analysts, 13 still in) |
| EBITDA — management basis, FY2028 | 9 | 2 | **+7** | Last month (14 analysts, 13 still in) |
| EPS Normalized, FQ3 2027 | 14 | 4 | **+10** | Last month (19 analysts, 19 still in) |
| EPS Normalized, FQ4 2027 | 5 | 13 | **−8** | Last month (20 analysts, 19 still in) |
| **EPS Normalized, FY2027** | **11** | **9** | **+2** | Last month (25 analysts, 23 still in) |
| EPS Normalized, FY2028 | 10 | 7 | **+3** | Last month (25 analysts, 24 still in) |
| **EPS (GAAP), FY2027** | **9** | **2** | **+7** | Last month (13 analysts, 12 still in) |
| EPS (GAAP), FY2028 | 10 | 3 | **+7** | Last month (15 analysts, 14 still in) |

Reconciled to the deterministic facts sidecar: `ciq_facts.json` reports "EPS (GAAP) FY 2027: 9↑/2↓ last mo" and "Revenue FY 2027: 6↑/9↓ last mo" — both match this table exactly, with no material gap to flag.

**Read.** Breadth is **internally contradictory by period, and that is the signal.** For the launch quarter it is strongly positive (FQ3: revenue +8, EPS +10, EBITDA +7). For the quarter immediately after it is the mirror image (FQ4: revenue −8, EPS −8, EBITDA −7). At the full-year level the two cancel out: FY2027 Net Bookings breadth is actually **negative (6 up / 9 down)** even while the FY2027 mean level crept up 0.4%, which means the cuts came from smaller-revenue models and the raises from larger ones. Analysts are redistributing the same annual number across quarters rather than taking the year up.

---

## 6. Historical Beat / Miss Pattern

Two bars are shown because both matter for this name and they do not agree: the Street's bar (vendor consensus) and the company's own guidance. "Revenue" = Net Bookings basis throughout; "EPS" here = EPS Normalized (management basis). Source: `Capital IQ Estimates export, Surprise tab` for actuals/estimates; guidance low/high from the same tab, cross-checked to the company releases where those releases are in the pool.

| Period | Revenue (Net Bookings) vs Street | EPS (mgmt basis) vs Street | Magnitude | Notes |
|---|---|---|---:|---|
| **Q3 FY26** (Dec-2025, announced 2026-02-03) | **Beat** — actual 1,757.1 vs est 1,581.66 | **Beat** — 1.2271 vs 0.83186 | Revenue **+11.1%** ( +175.4); EPS **+48.2%**; EBITDA 331.9 vs 250.38 = **+32.6%** | Also beat its own guidance of 1,550–1,600 by +11.6% vs midpoint. GAAP EPS $(0.50) came in *below* the guided $(0.49)–$(0.35) |
| **Q4 FY26** (Mar-2026, announced 2026-05-21) | **Beat** — 1,580.3 vs 1,551.60 | **Beat** — 0.7985 vs 0.55658 | Revenue **+1.8%** (+28.7); EPS **+42.9%**; EBITDA 235.8 vs 188.73 = **+24.9%** | Beat guidance of 1,510–1,560 by +3.0% vs midpoint. GAAP EPS $(0.32) beat the guided $(0.70)–$(0.54) |
| **Q1 FY27** (Jun-2026, announced 2026-08-07) | **Beat** — 1,385.9 vs 1,360.64 | **Beat** — 0.3532 vs 0.32765 | Revenue **+1.9%** (+25.3); EPS **+6.1%**; EBITDA 127.1 vs 123.82 = **+2.6%** | Beat guidance of 1,320–1,370 by +3.0% vs midpoint. GAAP EPS $(0.18) landed inside the guided $(0.23)–$(0.15). The quarter carried a $43.4m impairment on an abandoned third-party title [`TTWO 1Q27 Earnings Release, p.2`] |
| **Q2 FY27** (Sep-2026, announced 2026-11-09) | **MISS** — 1,601.3 vs 1,655.30 | **Beat** — 0.9962 vs 0.97026 | Revenue **−3.3%** (−54.0); EPS **+3.1%**; EBITDA 277.1 vs 257.84 = **+7.5%** | **Also missed its own guidance** of 1,620–1,670 — below the low end by 18.7, i.e. **−2.7% vs the midpoint**. RCS fell 9% against guidance of a 5% decline. GAAP EPS $(0.29) beat the guided $(0.84)–$(0.75), helped by a $57.9m tax benefit |

**Pattern, stated plainly.** Four straight management-basis EPS and EBITDA beats, but the **magnitude has collapsed**: EPS surprise ran +48.2% → +42.9% → +6.1% → +3.1%, and EBITDA surprise +32.6% → +24.9% → +2.6% → +7.5%. On the top line the record broke outright last quarter: three revenue beats of +11.1%, +1.8%, +1.9% followed by a **−3.3% miss**, and the first miss of its own guidance range in the set. The annual record is thinner still: `ciq_facts.json` records GAAP-EPS surprise of +10% in FY2022 and **0% in each of FY2023, FY2024, FY2025 and FY2026**, with revenue surprise of −1%, +1%, +1%, 0%, 0% — i.e. at the full-year level this company has been landing on the number, not beating it.

**Probability discipline (§10).** Four quarterly observations is not a measured frequency. Any statement about the odds of the next beat built on this table is **judgment informed by a four-observation sample**, not an empirical rate, and must be labelled that way downstream.

---

## 7. Bar Assessment

### **Bar is high.**

**Rationale.** On the metric the Street actually tracks — Net Bookings — consensus for FY2027 of **8,554.7** sits **$354.7m (+4.3%) above the TOP of management's reiterated $8,000–8,200m range** and **$454.7m (+5.6%) above its midpoint**, with the single lowest estimate in the 20-contributor panel (8,112) still above the guidance midpoint; on GAAP diluted EPS the Street's $1.91 is roughly **2.9x** the guided $0.66 midpoint. Stripping out the half already reported makes the stretch concrete: the Street needs H2 FY27 Net Bookings of **5,567.5 against a guidance-implied 5,112.8**, and a Q4 FY27 of **1,950.7 against a guidance-implied 1,687.8** — above even the most generous reading of the range (1,862.8) — so most of the above-guidance assumption sits in the quarter *after* the GTA VI launch, not in the launch itself. Set against a company that has just **missed its own Q2 Net Bookings guidance** (1,601.3 vs 1,620–1,670, the RCS assumption missing by 4 percentage points) and whose management-basis beat magnitude has shrunk from +48.2% to +3.1% over four quarters, the bar for the next twelve months is set above what management is underwriting.

**Direction of estimates — mixed, and honestly so.** This is not a case of estimates having been cut into a beatable setup, nor of a clean ramp. Over the last three months FY2027 Net Bookings crept up just +0.4% while FY2027 management-basis EBITDA was **cut 4.1%** (1,765.4 → 1,692.8) and FY2028 revenue, EPS and EBITDA were all cut last month (−2.6% / −2.5% / −2.0%). Breadth says the same thing in a different language: FQ3 2027 breadth is strongly positive (revenue 11↑/3↓, EPS 14↑/4↓) and FQ4 2027 is its mirror (2↑/10↓, 5↑/13↓), while FY2027 Net Bookings breadth is actually **negative at 6↑/9↓**. The Street is moving money between quarters, not raising the year. The one place consensus is *not* stretched is Q3 management-basis EBITDA, where it sits within 0.2% of the derived guidance midpoint (965.3 vs 963.5) — which locates the large GAAP-EPS and GAAP-net-income gaps below the EBITDA line, in tax and non-operating items, and makes those the weakest-quality part of the gap.

**The limitation that matters, stated rather than buried.** Both the guidance and the consensus were set *before* any Grand Theft Auto VI sell-through existed. Management framed the launch as "ten days away" on the 2026-11-09 call, i.e. **today, 2026-11-19**, and rested the reiterated range on pre-orders "tracking far in excess of our initial expectations" — an input the engine cannot verify and which is not quantified anywhere in the pool. One title therefore determines whether an above-guidance consensus is a high bar or a low one, and no post-launch evidence exists yet. The bar is high **relative to what management has underwritten**; it is not proven high relative to the outcome, and that distinction must travel with this verdict (§3). The stale-consensus guard does not trigger — the consensus export is dated 2026-11-19, ten days *after* the latest reported quarter — so the verdict is not provisional on staleness.

**Partial-data caps:** none. Consensus came from a pool Capital IQ export (7 tabs), not from the web or memory; revision history and revision breadth are both present, so neither the no-consensus (max 30) nor the no-revision-history (max 60) cap applies, and no staleness haircut is warranted. The vendor's basis and definitional mismatches (Net Bookings vs GAAP revenue; management-basis vs GAAP EPS and EBITDA) were resolved arithmetically against two reported quarters, so the "definitions prevent a like-for-like comparison → keep the bar Unknown" path is not taken.

**Section 3A (alt-data cross-check) is omitted deliberately.** The pool contains no `external/` subfolder, no manifest row flagged `external: true`, and no licensed alt-data panel. Its absence is not a gap and no panel figure was substituted for consensus.



---

## earnings / 05_beat-miss-setup.md

_Source: `05_beat-miss-setup.md`_

# Beat / Miss Setup — TTWO

**Company:** Take-Two Interactive Software, Inc. (NasdaqGS:TTWO) · **Regime:** US SEC (10-K / 10-Q / 8-K Ex. 99.1) · **Standard:** US GAAP · **Currency:** USD, millions · **Fiscal year:** ends 31 March (FY2027 ends 2027-03-31).

**Upstream inputs.** All four required upstream outputs were read and informed this report: `00_earnings-data-triage.md`, `01_historical-financials.md`, `02_revenue-drivers.md`, `03_margin-drivers.md`, `04_guidance-consensus.md`. `06_earnings-quality.md` was also read (it is not a dependency of this agent; it is used only where a quality item is itself a beat/miss mechanism, in Section 5). **No upstream output is missing — no degraded-confidence note applies.**

**Evidence binding.** Frozen supervisor-verified read mode. Every manifest / corpus / CIQ-facts / extract read resolved inside the single bound generation `.extract-generations/0af638492ecb0521db2676c79d75e6940c7227bb9f192567527b8a57eb43203d/`. The live logical path `data/TTWO/` was not read; it is a citation label only. `Alphabet Inc NasdaqGS GOOGL Key Developments.xls` is a wrong-company pool contaminant and is cited nowhere below.

**Three basis rules that govern every bar, trigger and threshold in this report (CLAUDE.md §27, §17, §10).**

1. **Two top lines, and the Street scores the operational one.** The vendor consensus field labelled "Revenue" is on the **Net Bookings** basis, not GAAP net revenue — proven upstream two ways (its FQ2 2027 actual is 1,601.30, not the GAAP 1,497.0; and its FY2027 Guidance Low/High of 8,000 / 8,200 matches the Net Bookings range exactly, not the GAAP range of 7,980 / 8,180) [`04_guidance-consensus.md` §1, citing `Capital IQ Estimates export, Consensus tab, data as of 2026-11-19` and `TTWO 2Q27 Earnings Release, 2026-11-09, "Outlook for Fiscal Year 2027"`]. FY2027 guidance is issued on **both** bases at once. **Every bar below names its basis. Nothing mixes them.**
2. **Every numeric trigger carries (a) its like-for-like comparable — the same period a year earlier on the same reporting basis, (b) what it implies for any part of the period not yet reported, and (c) what it would have done on the last two reported periods**, so it is capable of failing rather than rubber-stamping the status quo (§17).
3. **Probability language is mapped to the §10 bands and states its basis.** Every likelihood in this report is **judgment**, in most cases judgment informed by a **four-observation** sample — and that sample contains **one derived period** (Q4 FY26 has no filing in the pool; a March-year-end Q4 is itself the annual figure less the nine-month figure) [`01_historical-financials.md` §3]. **Nothing below is a measured frequency.** §10 bands used: Almost certain 90–100% · Very likely 75–90% · Likely 60–75% · Toss-up 45–60% · Unlikely 25–45% · Very unlikely 10–25% · Remote 0–10%.

**No partial-data cap applies.** Consensus is present and post-print (Capital IQ 7-tab pool export, data as of 2026-11-19, ten days after the 2026-11-09 Q2 FY27 print), revision history and revision breadth are both present, and `04` §1A resolved the reporting basis cleanly rather than leaving it unresolved. The `MODULE_RULES.md` "no consensus → cap the beat/miss setup at Unclear" rule does **not** trigger, and the verdict in Section 8 is not capped at Unclear on that ground [`04` §1A and §7].

---

## 1. Next Reporting Period Context

The next document Take-Two will actually file is its **Q3 FY2027 Form 10-Q — the standalone three months ending 2026-12-31**, with a cumulative nine-month column shown beside it, expected alongside the earnings release on **2027-02-09** [`04` §1A, citing `Capital IQ Estimates export, Consensus tab header` ("FQ3 2027 Earnings Release Date: Feb-09-2027") and `Q2 FY27 10-Q, cover page`]. It is the **single most important quarter in this company's five-year history on its own guidance**: Grand Theft Auto VI launched **2026-11-19 — the date of this report** — inside that quarter, and guided Q3 Net Bookings of $3,350–3,500m stand against $1,757.1m a year earlier, roughly a doubling in one quarter and the largest quarterly skew anywhere in the five-year record [`02` §3b; `01` §6; `TTWO 2Q27 Earnings Release, "Fiscal Third Quarter Ending December 31, 2026"`]. Seasonality is **not** what makes it important — GAAP revenue has almost none (Section 6); the release calendar is.

**The bar, carried verbatim from `04` §1A with its basis label:**

> **Q3 FY2027 (standalone quarter): no restatement required.** 3,573.61 Net-Bookings-basis = 3,573.61; 4.21 management-basis EPS = 4.21; 2.02 GAAP EPS = 2.02. The vendor period label and the filing period coincide, which was verified, not assumed. **Cross-basis conversion (inference, not from filings):** the company guides Q3 Net Bookings $3,350–3,500 and Q3 GAAP net revenue $3,270–3,420 — an $80m wedge at both ends, equal to the guided "change in deferred net revenue and related cost of revenue" of $80m. Applying that same wedge, a Net-Bookings-basis consensus of 3,573.6 implies roughly **3,494 on the GAAP net-revenue basis the 10-Q will print**, if deferred revenue moves as guided. **FY2027 (annual): bar = H1 actual + implied H2.** Net Bookings: 2,987.2 (reported) + 5,567.5 (implied by the 8,554.7 annual consensus) = **8,554.7**. GAAP diluted EPS: $(0.47) (reported) + $2.38 (implied H2) = **$1.91**.

Three things that bar means, and none of them is softened here. First, **the Q3 Net Bookings consensus of 3,573.61 sits $73.6m (+2.1%) above the TOP of management's own guided range of $3,350–3,500m** — so the company must beat its own guidance by at least 2.1% merely to *meet* the Street, and by **+4.34% against its own guided midpoint of 3,425** (3,573.61 ÷ 3,425 − 1) [`04` §3.2]. Second, at the full-year level the stretch is larger and sits in the quarter *after* the launch: FY2027 consensus Net Bookings of **8,554.7 is +4.3% above the top of the reiterated $8,000–8,200m range**, H1 is already in the ground at **$2,987.2m**, and the residual arithmetic leaves the Street needing a **Q4 FY27 of 1,950.7 against a guidance-implied 1,687.8** [`04` §3.1]. Third, the company **just missed its own Q2 Net Bookings guidance** — $1,601.3m against $1,620–1,670m, below the low end by $18.7m, with the recurrent-spend assumption missing by four percentage points (−9% actual vs −5% guided, attributed to NBA 2K) [`TTWO 2Q27 Earnings Release, p.1`; `Q2 2027 Earnings Call transcript, 2026-11-09, prepared remarks (Zelnick; Goldstein)`].

**No in-quarter alternative-data read exists, and that absence is material here.** `04` §3A was omitted deliberately: the pool contains no `external/` subfolder, no manifest row flagged `external: true`, and no licensed alt-data panel [`04` §3A; `00` manifest totals — 30 sources, 0 failures, no external folder]. A launch-week sell-through panel is exactly the evidence that would settle this setup, and the engine does not have it. Nothing below substitutes a panel figure for consensus.

---

## 2. Beat Scenarios

Each scenario names a driver carried from `02_revenue-drivers` or `03_margin-drivers`. Likelihood bands are **judgment** per §10 — see the basis note on each row.

| Scenario | Driver | What Would Need To Happen | Likelihood (High / Mid / Low) | Evidence |
|---|---|---|---|---|
| **B1. GTA VI sell-through above the assumption embedded in guidance** | **Release slate / new title launches** — the first-order revenue driver, scored Importance **90/100** in `02` §3 | Q3 FY27 **Net Bookings above 3,573.6** (Net Bookings basis), i.e. the company beating its own guided midpoint of 3,425 by more than **+4.34%**. For a *material* beat (Section 4) it needs **≥3,752.3**, which is **+9.56% vs its own midpoint** — a margin only one of the last four quarters produced (+11.6% in Q3 FY26) | **Mid** — §10 band **Toss-up (45–60%)** for clearing the consensus mean; **Unlikely (25–45%)** for clearing the material-beat line. **Basis: judgment.** Informed by a four-observation sample of actual-vs-own-guidance-midpoint (+11.6%, +3.0%, +3.0%, −2.7%), one of which (Q4 FY26) is a derived period — not a measured frequency | Pre-orders "tracking far in excess of our initial expectations" and "the level of preorders generated is extraordinary" — **with no preorder count, unit figure or price anywhere in the pool**, and management declining to quantify the tie ratio embedded in guidance [`Q2 2027 Earnings Call transcript, 2026-11-09, prepared remarks (Zelnick; Goldstein) and Q&A (Crum / Zelnick)`]. Scale references, not forecasts: GTA V has sold "nearly 235 million units worldwide" [same]; GTA VI is priced at **$80** against the $70 industry norm [`business-model 06_value-chain.md` §3]. Beat-magnitude history: `04` §6 |
| **B2. Recurrent consumer spending beats the +12% Q3 guide, because the GTA VI: Ultimate Edition add-on is allocated to it** | **Recurrent consumer spending (RCS)** — `02` §4, magnitude **High** (a 10% move in RCS = 8.1% of Q2 FY27 total GAAP revenue) | Q3 FY27 RCS growth above the guided **≈+12% YoY**. The mechanism is launch-attached rather than engagement-led: the Ultimate Edition add-on content "can be purchased separately" and is allocated to RCS, and it is the stated reason GTA-series RCS is guided up | **Mid** — §10 band **Toss-up (45–60%)**. **Basis: judgment.** It is levered to the same unverifiable launch as B1, and the company missed its own RCS guide last quarter by 4pp | Guided +12% RCS for Q3 and flat for FY27 at 65% of Net Bookings [`Take-Two_Interactive_2Q FY27 FINAL deck, slides 8 and 10`; `Q2 2027 transcript, prepared remarks (Goldstein)`]. Ultimate Edition allocated to RCS [`Q2 2027 transcript, Q&A (Dessouky / Goldstein)`]. Realised support: GTA series RCS and GTA+ average monthly members each "grew a double-digit percentage" in Q2 FY27 [`Q2 2027 transcript, prepared remarks (Zelnick)`]; GTA-series revenue was **up** in Q2 FY27, amount not quantified [`Q2 FY27 10-Q, MD&A p.25`] |
| **B3. Cost and marketing timing beats the guide, so EBITDA and management-basis EPS beat even on in-line revenue** | **Operating leverage against a near-fixed cost base** (`03` §5 driver 1) plus **marketing / player-acquisition timing** (`03` §5 driver 6) | Q3 FY27 management-basis **EBITDA above 965.3** and management-basis **EPS above 4.21** on revenue inside the guided range. Mechanically this needs management-basis operating expenses to land below the guided **+21% YoY**, and the cost-of-revenue line inside the guided $1,649–1,732m. `03` §8 sizes the leverage at roughly **39bps of EBIT margin per 1% of revenue** around the Q3 guide | **High for a small beat** — §10 band **Likely (60–75%)**; **Unlikely (25–45%)** for a material (≥+5%) EBITDA beat. **Basis: judgment** informed by four consecutive management-basis EBITDA and EPS beats (EBITDA +32.6%, +24.9%, +2.6%, +7.5%; EPS +48.2%, +42.9%, +6.1%, +3.1%), a four-observation sample containing one derived period — not a measured frequency | Four straight management-basis beats, with magnitude collapsing [`04` §6, from `Capital IQ Estimates export, Surprise tab`]. Realised mechanism last quarter: management-basis operating expenses **9% lower YoY**, "favorable to our forecast due to lower personnel and user acquisition costs… some of that was due to timing" [`Q2 2027 transcript, prepared remarks and Q&A (Smilek / Goldstein)`]; FY27 management-basis opex growth guided down to ~+5% "on lower user-acquisition costs, part timing" [`04` §2.1]. The Street is **level with** the derived Q3 management-basis EBITDA guidance midpoint (965.3 vs 963.5, +0.2%) — the only unstretched row in the table [`04` §3.2] |
| **B4. The deferred-revenue wedge comes in smaller than the guided $80m, so the GAAP line beats — but this is not the metric the Street scores** | **Deferred-revenue recognition wedge** (`02` §4, High on a quarterly GAAP basis) | GAAP net revenue above the implied **~3,494** even with Net Bookings inside the guided range, because the net build in deferred revenue is below the guided $80m. **The wedge does not move the Net Bookings bar at all** — it is a recognition effect, not demand | **Mid for the mechanism, Low for the scoring impact** — §10 band **Toss-up (45–60%)** that the wedge lands materially away from $80m; **Very unlikely (10–25%)** that it changes the beat/miss the Street records. **Basis: judgment** | The wedge is volatile and has flipped sign: **+$104.3m** in Q2 FY27, **+$186.7m** in Q2 FY26, and **−$43.7m** for the six months to 2026-09-30 (Net Bookings $2,987.2m *below* GAAP net revenue $3,030.9m) [`TTWO 2Q27 Earnings Release, p.1–2`; `06_earnings-quality.md` §7]. The guided Q3 wedge is $80m and the guided FY27 wedge only ~$20m — 0.2% of the $8,080m GAAP midpoint [`02` §4] |

**What is deliberately NOT listed as a beat path, and why.** Price: no ASP, price-per-title or ARPU is disclosed anywhere in the pool, and management declined to quantify it — a price-led beat cannot be evidenced [`02` §3, Importance 20/100]. Market-share gain: no market-share figure, industry-size figure or share series exists in the pool [`02` §3, Importance 30/100]. FX: realised FX moved Q2 FY27 revenue by −$0.6m and the six months by −$0.0m, so it cannot carry a beat of the size in question [`Q2 FY27 10-Q, MD&A pp.25 and 28`]. M&A: no business combination contributed revenue in FY2026 or H1 FY27, and nothing is announced or sized [`02` §3].

---

## 3. Miss Scenarios

| Scenario | Driver | What Would Need To Happen | Likelihood (High / Mid / Low) | Evidence |
|---|---|---|---|---|
| **M1. The company lands inside its own guided range and still misses the Street** | **Release slate / new title launches** (`02` §3, Importance 90/100) — and the arithmetic of where the bar is set | Q3 FY27 Net Bookings anywhere **below 3,573.6**. That includes the **entire guided range**: landing at the top (3,500) is a **−2.1%** consensus miss; at the midpoint (3,425) a **−4.2%** miss. The company does not have to disappoint its own plan to miss the Street — it has to merely deliver it | **High** — §10 band **Likely (60–75%)** for a consensus miss of any size; **Unlikely (25–45%)** for a *material* miss (≤3,466). **Basis: judgment.** Informed by the four-observation actual-vs-own-midpoint sample (+11.6%, +3.0%, +3.0%, −2.7%): meeting the Street needs **+4.34%** vs midpoint, which one of four cleared; the material-miss line needs **≤+1.21%** vs midpoint, which one of four breached. One of the four periods is derived. **Not a measured frequency** | Consensus 3,573.61 vs guidance $3,350–3,500m — **+2.1% above the top of the range** [`04` §3.2]. At the full-year level the lowest of 20 FY2027 Net Bookings estimates is **8,112, above the guidance midpoint of 8,100** — no analyst in the panel models the bottom half of management's own range [`04` §3.1]. And the company **missed its own Q2 guidance** ($1,601.3m vs $1,620–1,670m) [`TTWO 2Q27 Earnings Release, p.1`] |
| **M2. Recurrent consumer spending misses its guide a second quarter running** | **RCS** (`02` §4, High) and **content mix** (`03` §5 driver 3) | Q3 FY27 RCS below the guided ≈+12% YoY. Note the size of the required swing: RCS printed **−9%** in Q2 FY27 and is guided to **+12%** in Q3 — a **21-percentage-point** turn in one quarter, most of which is launch-attached rather than engagement-led | **Mid** — §10 band **Toss-up (45–60%)**. **Basis: judgment** | The identical assumption missed last quarter by 4pp: "Recurrent consumer spending was down 9% for the period compared to our guidance of a 5% decline, driven by NBA 2K" [`Q2 2027 transcript, prepared remarks (Goldstein)`]. The non-GTA RCS base is shrinking on named titles: Color Block Jam −$31.4m and Match Factory! −$21.9m, together 81% of the $65.7m quarterly RCS decline [`Q2 FY27 10-Q, MD&A p.25`], with FY27 guidance assuming **mobile down** [`04` §2.1]. The forward book is also thinner: total deferred revenue **$1,268.1m at 2025-09-30 → $1,042.1m at 2026-09-30, −17.8% YoY**, with deferred-revenue days falling 71.8 → 65.2 → 59.3 across three periods [`06` §6] |
| **M3. Launch-quarter cost of revenue overshoots, or a new title impairment lands in it** | **Release-timed amortisation of the $2,577.3m capitalised software balance** (`03` §5 driver 2) and **title impairments charged to cost of revenue** (`03` §5 driver 10) — together the single biggest margin driver in `03` §8 | Cost of revenue above the guided **$1,649–1,732m** on revenue inside the guided $3,270–3,420m. Two separate mechanisms: amortisation runs at the **"greater of"** revenue-proportional or straight-line over 9–36 months, so a straight-line floor charges cost against revenue that did not arrive; and separately, an unrecoverable title is impaired **directly into cost of revenue** | **Mid** — §10 band **Toss-up (45–60%)**. **Basis: judgment.** The impairment mechanism fired twice in the last two reported quarters ($43.4m in Q1 FY27, $0.2m in Q2 FY27), so it is live rather than hypothetical | Accounting policy and the "greater of" rule [`FY26 10-K, Note 1 — Software Development Costs and Licenses`]. Q3 FY27 gross margin is **guided at 49.5%, about 801bps below Q2 FY27's 57.5%**, and FY2027 at 53.7% vs FY2026's 57.2% (**−351bps**); asked directly why, the CFO answered "it's due to the mix of the business" [`03` §3.3; `Q2 2027 transcript, Q&A (Schoell / Goldstein)`]. Q3 cost of revenue embeds **$96m of stock compensation and $141m of acquired-intangible amortisation** [`03` §10]. Carrying value exposure: **$2,149.7m (91.6%) of the FY2026 capitalised balance sat on unreleased titles = 61% of equity**, with no interim update in the 10-Q [`06` §6 and §10, citing `FY26 10-K, Note 7`] |
| **M4. Launch marketing steps up as guided while revenue lands only mid-range, so EBITDA misses** | **Marketing / player-acquisition spend** (`03` §5 driver 6) and **operating leverage in reverse** (`03` §5 driver 1) | Management-basis operating expenses at or above the guided **+21% YoY** while Net Bookings land near the guided midpoint rather than near consensus. `03` §8 sizes the leverage: holding opex at the guided $1,172m and cost of revenue at the guided ratio, **a 10% revenue shortfall takes EBIT margin from +14.4% to +10.5%** — about 39bps per 1% of revenue (*inference, labelled: it assumes cost of revenue is fully variable, which the "greater of" policy makes optimistic, and assumes no management response*) | **Mid** — §10 band **Toss-up (45–60%)**. **Basis: judgment.** Cuts against it: four consecutive management-basis EBITDA beats, and the Street is already level with the guidance midpoint on this line rather than above it | Q3 management-basis operating expenses guided **approximately +21% YoY, "driven by GTA VI launch marketing"** [`Q2 2027 transcript, prepared remarks (Goldstein)`]. The Q2 FY27 precedent runs the other way and is explicitly flagged as timing — opex 9% lower YoY, "some of that was due to timing" [same, Q&A (Smilek / Goldstein)], which means some of the saving is deferred into exactly this quarter. Street Q3 management-basis EBITDA 965.28 vs derived guidance midpoint 963.5 [`04` §3.2] |

---

## 4. What Magnitude Matters?

**Basis labels are mandatory on every row (§27).** Thresholds are set against the **consensus mean**, which `04` §1A verified needs no restatement for a standalone-quarter US 10-Q filer. Each row states the like-for-like comparable (the same period a year earlier, same basis), what the threshold implies for the part of FY2027 not yet reported, and what it would have done on the last two reported periods (§17).

| Metric | Consensus / Bar | Material Beat Threshold | Material Miss Threshold | Why |
|---|---:|---:|---:|---|
| **Revenue — Net Bookings basis** (the metric the Street actually scores), Q3 FY2027 | **3,573.61** mean (17 of 22; median 3,500.90; high 4,087; low 3,403). Guidance $3,350–3,500m, midpoint **3,425** | **≥ 3,752.3** (+5.0% vs mean) | **≤ 3,466.4** (−3.0% vs mean) | **Why these levels.** +5.0% is above three of the last four revenue surprises (+11.1%, +1.8%, +1.9%, −3.3%) and requires beating the company's own midpoint by **+9.56%** — a margin reached once in four quarters. −3.0% is calibrated to the size of the miss just delivered (−3.3%), and it sits **inside** the guided range (3,466 is below the 3,500 top), which is the whole point: the company can deliver its own plan near the top and still print a material consensus miss. **Like-for-like comparable:** Q3 FY26 Net Bookings **1,757.1** actual — so the beat line is **+113.6% YoY**, the miss line **+97.3% YoY**, the consensus mean +103.4% and guidance +90.6% to +99.2% [`04` §1A]. **What it implies for the unreported stub of FY2027:** H1 is reported at 2,987.2, so the Street's annual 8,554.7 needs H2 of 5,567.5; a Q3 at the miss line leaves **Q4 needing 2,101.1** (= 5,567.5 − 3,466.4), i.e. **+33.0% on Q4 FY26's 1,580.3**, against the Street's own Q4 of 1,950.7 (+23.4%) and a guidance-implied 1,687.8 (+6.8%); a Q3 at the beat line leaves Q4 needing 1,815.2 (+14.9%). **Capable of failing — last two reported periods:** Q1 FY27 printed +1.9% vs the Street (neither threshold fires); **Q2 FY27 printed −3.3% (the miss threshold fires)**. Further back, Q3 FY26's +11.1% fires the beat threshold. Both lines have fired and not fired inside the available sample |
| **Revenue — GAAP total net revenue basis**, Q3 FY2027 | **~3,494 implied** (3,573.6 less the guided $80m deferred-revenue wedge — *inference, not from filings*; the vendor does not poll the GAAP line). Guidance $3,270–3,420m, midpoint 3,345 | **≥ 3,669** (+5.0%) | **≤ 3,389** (−3.0%) | Shown because the **10-Q will print this line, not Net Bookings**, so a reader comparing the filing to a vendor screen will be comparing two different numbers. The wedge is a recognition effect, not demand, and the Street does not score it. **Like-for-like comparable:** Q3 FY26 GAAP net revenue **1,699.0** — beat line +115.9% YoY, miss line +99.5% [`01` §3]. **Note the trap:** the −3.0% miss line (3,389) sits *inside* the guided GAAP range of 3,270–3,420 **and above the guided midpoint**. **Capable of failing:** Q2 FY27 GAAP revenue fell 15.6% YoY while Net Bookings fell 18.3% — the wedge alone added **+4.65pp** to reported GAAP growth [`02` §6.3], so these two bases can and do print different beat/miss answers in the same quarter |
| **EBITDA — management basis** (Capital IQ's "EBITDA" field, reconciled to the cent on two consecutive quarters in `04` §0), Q3 FY2027 | **965.28** mean (12 of 14; median 977.95; high 1,183.3; low 666.6). Derived guidance $940–987m, midpoint **963.5** — the Street sits **+0.2%** from the midpoint, the only unstretched row in the whole table | **≥ 1,013.5** (+5.0%) | **≤ 917.0** (−5.0%) | ±5% is the width of the derived guidance range itself (±2.4%) roughly doubled, so the threshold cannot be cleared by rounding inside guidance. **This is the highest-quality bar in the table** precisely because consensus and guidance agree on it: a beat or miss here is an earnings-power result, not a tax or non-operating artefact. **Like-for-like comparable:** Q3 FY26 management-basis EBITDA **331.9** actual — beat line **+205.4% YoY**, miss line +176.3% [`04` §6]. **Also carries a memo caution (§15, from `06` §4):** $462m of guided FY2027 stock-based compensation is **29.5%** of the derived management-basis EBITDA midpoint, so roughly 30% of this metric is non-cash by construction. **Capable of failing:** Q1 FY27 printed +2.6% (neither fires); **Q2 FY27 printed +7.5% (the beat threshold fires)** |
| **EPS — management basis** ("EPS Normalized"), Q3 FY2027 | **4.21322** mean (21 of 23; median 3.99; high 5.57; low 3.43). Derived guidance $3.80–4.00, midpoint **3.90** — consensus **+8.0%** above it | **≥ 4.550** (+8.0%) | **≤ 4.002** (−5.0%) | +8% is set above the last two realised EPS surprises (+6.1%, +3.1%) so the threshold is not already satisfied by the status quo; −5% is roughly the distance from the consensus mean down to the *top* of the derived guidance range (4.00), i.e. the company delivering the best end of its own plan is already a 5% consensus miss. **Like-for-like comparable:** Q3 FY26 management-basis EPS **1.2271** actual — beat line +270.8% YoY, miss line +226.2%; consensus +243% [`04` §1A and §6]. **Capable of failing:** neither line fires on Q1 FY27 (+6.1%) or Q2 FY27 (+3.1%); both earlier quarters in the sample fire the beat line (+48.2%, +42.9%) |
| **EPS — GAAP diluted**, Q3 FY2027 | **2.02115** mean (**only 9 of 11 contributors**; median 1.77; high 3.18; **low 0.63** — a 5.0x high/low spread). Guidance $1.30–1.44, midpoint 1.37 | **Not usable as a bar — do not set one** | **Not usable as a bar — do not set one** | Stated as a refusal, not an omission. Three reasons, all from `04` §3.2: the panel is nine contributors with a five-fold spread; the +47.5% consensus-vs-guidance gap on this line sits **below** the EBITDA line, in tax and non-operating items, not in earnings power — the same quarter's GAAP result carried a **$57.9m income-tax benefit against a pre-tax loss** [`Q2 FY27 10-Q, Results of Operations`]; and a **November-2026 intangible-asset reorganisation** shifts the jurisdictional mix of earnings from that month, with the company "still evaluating" the impact [`Q2 FY27 10-Q, Note 16 (Subsequent Events)`] — it lands *inside* this very quarter. `04` calls this "the lowest-quality of the gaps in this table" and that qualifier travels. Directional context only, with its comparable: Q3 FY26 GAAP diluted EPS was **$(0.50)** [`01` §3] |
| **Guidance** — the FY2027 Net Bookings range and the **initiation of Q4 FY2027** | FY2027 Net Bookings guidance **$8,000–8,200m** (reiterated 2026-11-09) vs FY2027 consensus **8,554.7** (+4.3% above the top). Street FQ4 2027 Net Bookings **1,950.67**; **guidance-implied Q4 = 8,100 − 2,987.2 − 3,425 = 1,687.8** | **Raise the FY2027 Net Bookings range to a top at or above 8,554.7**, and/or initiate Q4 FY2027 Net Bookings with a **midpoint ≥ 1,950.7** | **Initiate Q4 FY2027 Net Bookings with a midpoint ≤ 1,862.8** — the number implied by the most generous combination available today (top of the FY range, bottom of the Q3 range: 8,200 − 2,987.2 − 3,350) | **This is the row most likely to decide the market's reading of the print, and it is arithmetic, not opinion.** Holding the FY range unchanged mechanically implies a Q4 near 1,687.8 — **13.5% below the Street's own 1,950.67** (1,687.8 ÷ 1,950.67 − 1). So a reiteration *is* a guide-down relative to the Street unless the FY range moves up. **Like-for-like comparable:** Q4 FY26 Net Bookings **1,580.3** actual — guidance-implied 1,687.8 is **+6.8% YoY**, the Street's 1,950.7 is +23.4%, and the miss line 1,862.8 is +17.9% [`04` §6]. **What it implies for the unreported stub:** by the Q3 print, H1 (2,987.2) plus Q3 actual will be known, so Q4 is the only open quarter and this threshold is directly testable. **Capable of failing:** FY2027 GAAP net revenue guidance was **raised** at the Q2 print ($7,900–8,100m → $7,980–8,180m) while Net Bookings was held, and FY2027 GAAP operating expenses were **cut** ($4,150–4,170m → $4,078–4,098m) — so management does move these ranges in both directions, and a raise is a real possibility rather than a formality [`04` §2.1] |

---

## 5. In-Line Print But Bad Guidance Risk

| Risk | Evidence | Why It Matters |
|---|---|---|
| **In-line current quarter but guide-down** — the sharpest single risk in this setup | Street FQ4 2027 Net Bookings **1,950.67** against a guidance-implied **1,687.8** (and 1,862.8 on the most generous reading). Revision breadth already says the Street half-knows: **FQ4 2027 breadth is revenue 2↑/10↓ (−8), EPS 5↑/13↓ (−8), EBITDA 1↑/8↓ (−7)** — the exact mirror of FQ3's +8 / +10 / +7 [`04` §3.1 and §5]. FY2027 Net Bookings breadth is **negative at 6↑/9↓** even while the FY2027 mean level crept up only **+0.4%** over three months, and FY2028 revenue, EPS and EBITDA were all cut last month (−2.6% / −2.5% / −2.0%) [`04` §4 and §5] | The company can deliver Q3 at the top of its range, reiterate FY2027, and that reiteration **mechanically implies a Q4 13.5% below the Street's own Q4 number.** Analysts have been moving money between quarters rather than raising the year — "a shift within FY2027, not an upgrade of it", with roughly $176m of Net Bookings and $0.29 of EPS pushed into the launch quarter in the ten days after the print while FY2027 was left flat and FY2028 cut 1.8% [`04` §4]. The in-line-print-plus-weak-Q4-guide path therefore needs **no operational disappointment at all** — only the arithmetic already on the page |
| **Beat current quarter but weak margin guide** | FY2027 gross margin is **already guided down to 53.7% from FY2026's 57.2% (−351bps)**, and Q3 FY27 to 49.5% — about 801bps below Q2 FY27's 57.5% [`03` §3.3]. Asked directly why the full-year margin is lower, the CFO said "it's due to the mix of the business, and it's being offset by some changes in the operating expenses" [`Q2 2027 transcript, Q&A (Schoell / Goldstein)`]. Looking one quarter further, **Q4 FY27 management-basis operating expenses are implied up ~10%, "mostly being driven by increases in R&D"** [`Q2 2027 transcript, Q&A (Song / Goldstein)`]. The Street has FY2027 management-basis EBITDA at **1,692.79, already cut 4.1%** over three months (1,765.4 → 1,692.8) [`04` §4] | A bookings beat with a cost-of-revenue overshoot prints as *revenue beat, EBITDA miss* — the exact split `03` §9 names as the one observable that flips its read: "whether cost of revenue lands inside the guided **$1,649–1,732m** on revenue inside **$3,270–3,420m**. If revenue lands in range but cost of revenue overshoots, the 'greater of' amortisation floor is binding and the content asset is not earning its cost." Because consensus and guidance are level on Q3 management-basis EBITDA (+0.2%), there is no cushion on that line to absorb it |
| **Beat EPS due to one-offs, miss quality** | Q2 FY27's GAAP loss was halved by a **$57.9m income-tax benefit** against a $(111.9)m pre-tax loss — a 51.7% effective rate against the 21% statutory rate, "primarily driven by tax benefits of $57.1 related to geographic mix of earnings **and changes in reserves**" [`06` §8, citing `Q2 FY27 10-Q, Note 13`]. The **November-2026 intangible-asset reorganisation** changes the jurisdictional mix of earnings from that month, impact "still evaluating" — i.e. it lands inside Q3 FY27 [`Q2 FY27 10-Q, Note 16`]. On the management basis the number the Street scores is roughly **30% non-cash by construction**: $90.0m of stock compensation was **32.5%** of Q2's $277.1m management-basis EBITDA, and $462m guided for FY2027 is **29.5%** of the derived $1,565m midpoint [`06` §4 and §8]. The deferred-revenue add-back was **+$104.3m for the quarter and −$43.7m for the half** [`06` §7] | A GAAP EPS "beat" on this name can be manufactured below the EBITDA line by tax and timing, which is why Section 4 refuses to set a GAAP-EPS threshold. The quality asymmetry `06` §10 names is also live in this quarter: **$2,149.7m (91.6%) of the FY2026 capitalised development balance sat on unreleased titles — 61% of equity** — so if the launch underperforms the forecast embedded in that carrying value, the write-down arrives as a non-cash charge **after** the cash has already gone out |
| **Beat revenue but working capital deteriorates** | FY2027 operating cash flow is guided at **over $1,000m** and reiterated verbally, alongside "to be in a net cash position by the end of the fiscal year" [`04` §2.1, citing `Q2 2027 transcript, prepared remarks (Goldstein)`]. **H1 FY27 CFO was $(173.5)m** [`01` §3], so **H2 FY27 must deliver more than $1,173.5m** (1,000.0 + 173.5) — against **H2 FY26 of $540.6m** (624.3 − 83.7), i.e. **roughly 2.17x the prior-year half**. Supporting strains already visible: TTM CFO roughly flat at $367.1m while total capex rose 72.1% to $304.5m, cutting reported FCF to **$62.6m from $181.0m** (up to $154.4m normalised for the $91.8m London building); TTM cash conversion **CFO/EBITDA 50.6%**, below 50% in four of the prior five years; total deferred revenue **−17.8% YoY**; broad-basis payable days down 22.3 days since FY2025; strict-basis net debt up from $972.5m to **$1,370.4m (1.89x)** [`01` §2; `06` §1, §2, §3] | A launch quarter converts billings to cash with a lag, and the FY2027 cash guidance is the one line in the outlook that cannot be met by a strong revenue print alone. **The testable trigger, with its comparable and its stub arithmetic: H2 FY27 CFO > $1,173.5m, against H2 FY26's $540.6m (2.17x).** It is capable of failing — on the last two reported periods it would have failed outright: H1 FY27 CFO was negative, and H1 FY26 was only +$83.7m. If Q3 prints a large bookings beat while nine-month CFO stays well short of the run-rate that trigger implies, the beat is a billing event ahead of a cash event, and `06`'s RF-EQ-002 cash-conversion flag hardens rather than clears |

---

## 6. Seasonality Read

**Seasonality neither helps nor hurts this setup — and the reason that is true is itself the finding.** On GAAP net revenue, Take-Two has almost no seasonality: the three-year average revenue share runs Q1 23.5% / Q2 25.0% / **Q3 25.1%** / Q4 26.5%, a spread of only about 3 percentage points between the heaviest and lightest quarter, and no quarter ever takes more than 30% or less than 20% of the year [`01` §5]. The December quarter is not even the strongest margin quarter in the record: Q3 EBITDA margins ran 11.2% (FY2024), 8.9% (FY2025) and 10.7% (FY2026), against Q4 margins of 6.1%, 14.3% and 15.3% [`01` §5]. So the seasonal base rate offers **no lift and no drag** for a Q3 print — there is no "quarter that matters most" in reported revenue to lean on. The mechanical cause is disclosed: a high share of Net Bookings is recurrent consumer spending, and GAAP defers a large part of each quarter's billings over the expected service period, so lumpy bookings arrive as smoothed revenue [`01` §5, citing `TTWO 2Q27 Earnings Release, p.1` and the Net Bookings by content tables]. Where the lumpiness does show is **margin**: EBITDA margin ranged from −3.7% (Q2 FY25) to +15.9% (Q1 FY26) across twelve quarters — a 19.6-percentage-point spread on revenue that barely moves [`01` §5]. The practical consequence for this report is a **warning, not a tailwind**: the guided Q3 FY27 skew — GAAP revenue of $3,270–3,420m against $1,699.0m a year earlier, roughly a doubling — "would be the largest quarterly revenue skew anywhere in this history", and `01` is explicit that it "is a forward company statement, not realised history" [`01` §6]. Seasonality therefore cannot be used to argue the guide is conservative or heroic; the release calendar, not the calendar, is doing all the work, and both `02` §3b and `03` §1b independently conclude that **neither the latest reported quarter (a release-cycle trough) nor the next guided quarter (a launch peak) is a run-rate.**

---

## 7. Historical Pattern

**There is a pattern, it is weakening, and the synthesizer should weight it Low.** The record from `04` §6: four consecutive management-basis EPS and EBITDA beats against the Street, with the **magnitude collapsing** — EPS surprise +48.2% → +42.9% → +6.1% → +3.1%, EBITDA surprise +32.6% → +24.9% → +2.6% → +7.5%. On the top line the record broke outright last quarter: three Net Bookings beats of +11.1%, +1.8% and +1.9% followed by a **−3.3% miss**, and the **first miss of the company's own guidance range in the set** (Q2 FY27 $1,601.3m vs $1,620–1,670m). Measured against its own guidance midpoint rather than the Street, the four quarters read +11.6%, +3.0%, +3.0%, −2.7% — a company that normally clears its own plan by about three points, cleared it by eleven once, and undershot once. At the **annual** level there is no beat pattern at all: `ciq_facts.json` records GAAP-EPS surprise of +10% in FY2022 and **0% in each of FY2023, FY2024, FY2025 and FY2026**, with revenue surprise of −1%, +1%, +1%, 0%, 0% — this company lands on the full-year number rather than beating it [`04` §6].

**How much to weight it: Low, for three stated reasons.** (i) **Sample size.** Four quarterly observations is not a measured frequency; any odds read off this table are **judgment informed by a four-observation sample** (§10), and `04` §6 says so in its own words. (ii) **One of the four periods is derived, not reported.** Q4 FY26 has no filing in the pool — a March-year-end Q4 is constructed as the annual figure less the nine-month figure — so the sample contains a derived period, which under the binding rule makes the read judgment twice over, never a frequency [`01` §3]. (iii) **Regime change.** No quarter in the sample contains a launch remotely the size of the one now in progress: the Q3 FY27 guided Net Bookings step-up alone is **$1,667.9m (3,425 − 1,757.1), more than the entire year's guided growth of $1,379.0m**, and **$1,379m of that rests on a title that has not shipped in any reported period** [`02` §7]. A beat/miss base rate estimated on four pre-launch quarters is being asked to predict the first post-launch one. Use the pattern as a mild prior on the *management-basis* lines (where the company has beaten four times running and where the Street is level with guidance) and essentially not at all on the Net Bookings line.

---

## 8. Setup Verdict

### **Setup favors miss.**

**The single most important factor is where the bar sits relative to what management has underwritten: the Q3 FY2027 Net Bookings consensus of 3,573.6 (Net Bookings basis) is +2.1% above the TOP of the company's own guided $3,350–3,500m range and +4.34% above its guided midpoint — so Take-Two must beat its own guidance to merely meet the Street, in the quarter immediately after it missed that guidance ($1,601.3m vs $1,620–1,670m).** The same shape repeats at the full year, where FY2027 consensus Net Bookings of 8,554.7 is +4.3% above the top of a reiterated range and the lowest of twenty estimates (8,112) still sits above the guidance midpoint, and it is worst in the quarter after the launch, where the Street's Q4 of 1,950.7 stands against a guidance-implied 1,687.8 — so a simple reiteration of FY2027 at the February print reads as a 13.5% Q4 guide-down [`04` §3.1, §3.2, §7].

**The single biggest risk that could flip the verdict is the one thing the pool cannot measure: the absolute size of Grand Theft Auto VI.** The title launched on 2026-11-19 — this report's date — so **no reported period contains any of it**, and the only forward input management offered is unverifiable and unquantified ("pre-orders tracking far in excess of our initial expectations"; "the level of preorders generated is extraordinary"), with the tie-ratio assumption behind guidance explicitly declined and no preorder count, unit figure or attach rate anywhere in the pool [`02` §7; `Q2 2027 transcript, prepared remarks and Q&A (Crum / Zelnick)`]. There is no alternative-data panel to cross-check it [`04` §3A]. **The qualifier `04` attached to its "bar is high" verdict travels intact: the bar is high relative to what management has underwritten; it is not proven high relative to the outcome** — and in the equivalent December quarter last year the company beat its own guidance by +11.6%, which on today's numbers would clear both bars at once.

---

## 9. Second-Quarter Look-Ahead

**The setup for Q4 FY2027 (the three months ending 2027-03-31, reported around May 2027) looks worse than Q3's, and for a different and more measurable reason.** Q3's miss risk rests on an unverifiable launch; Q4's rests on arithmetic that is already on the page — the Street's **1,950.67** against a guidance-implied **1,687.8** (and 1,862.8 on the most generous reading of the current ranges), with FQ4 revision breadth already deeply negative (revenue 2↑/10↓, EPS 5↑/13↓, EBITDA 1↑/8↓) and FY2028 revenue, EPS and EBITDA all cut last month [`04` §3.1, §4, §5]. Three disclosed mechanisms point the same way into that quarter: the company's own practice of **"reducing the wholesale prices of our products… typically three to nine months after a product's initial launch"**, which lands squarely in Q4 FY27 and H1 FY28 [`03` §3, citing `FY26 10-K, Item 1 — Marketing`]; **Q4 management-basis operating expenses implied up ~10%, "mostly being driven by increases in R&D"** [`Q2 2027 transcript, Q&A (Song / Goldstein)`]; and the FY2027 operating-cash-flow floor of over $1,000m, which requires H2 CFO above $1,173.5m against $540.6m in H2 FY26. **Visibility beyond that is genuinely absent and is not manufactured here:** management refused to guide FY2028 and would say only that it "expect[s] to set a new baseline for performance going forward", with the size of the recurring post-launch tail **not proven from available data** [`02` §3b, citing `Q2 2027 transcript, Q&A (Creutz / Zelnick)`].

---

## 10. Pre-Mortem

**If this setup read fails, the most likely reason is that we sized the bar correctly and the title incorrectly.** The whole verdict rests on a bar standing above guidance — an arithmetic fact — while the variable that decides the print is a launch with **zero reported history, no disclosed preorder count, no unit figure, no price-times-volume build, and no alternative-data panel to triangulate it**; if GTA VI's sell-through is a multiple of the assumption embedded in both guidance and consensus, then both bars were low, not high, and "beating its own guidance by 4.3% to meet the Street" was never the constraint it looks like on paper. In the `CLAUDE.md` §20 taxonomy that is a **bad base rate compounded by missing data** — judging the first post-launch quarter in this company's history against a four-observation pre-launch surprise sample that contains one derived period — and the secondary failure mode, if the Q3 print lands as expected, is a **timing error**: being right that the bar is high for Q3 while the market has already moved past it to the Q4 and FY2028 numbers that revision breadth shows the Street cutting.



---

## earnings / 06_earnings-quality.md

_Source: `06_earnings-quality.md`_

# Earnings Quality — TTWO

**Company:** Take-Two Interactive Software, Inc. (NasdaqGS:TTWO) · **Regime:** US SEC (10-K / 10-Q / 8-K Ex. 99.1) · **Standard:** US GAAP · **Currency:** USD, millions unless stated · **Fiscal year:** ends 31 March (FY2026 = year ended 2026-03-31; FY2027 in progress).

**Evidence binding.** Frozen supervisor-verified read mode. Every manifest / corpus / CIQ-facts / extract read resolved inside the single bound generation `.extract-generations/0af638492ecb0521db2676c79d75e6940c7227bb9f192567527b8a57eb43203d/`. The live logical path `data/TTWO/` was not read; it is a citation label only. `Alphabet Inc NasdaqGS GOOGL Key Developments.xls` is a wrong-company pool contaminant and is cited nowhere below.

**Definitions used throughout (§15).**

- **FCF = CFO − total capex.** "Total capex" = *Purchases of fixed assets* + *Asset acquisitions*, both from the cash-flow statement. The company discloses **no** FCF definition anywhere in this pool, so the §15 definition is used. The Capital IQ "Levered Free Cash Flow" of $787.6m for the latest twelve months is an **after-interest vendor construction** and is **not** used [10].
- **Net debt = total debt − cash and cash equivalents (strict basis).** Every net-debt figure below carries its basis label inline. The vendor's $1,237.8m at 2026-09-30 is a **broad** basis (it nets short-term investments) **and** its debt input includes lease liabilities [10].
- **EBITDA has three different meanings for this company and they are never mixed below.** (i) **EBITDA (CIQ vendor-computed)** — the vendor's figure, used in the bridge because the company publishes no full-year non-GAAP EBITDA in this pool. Critically, the vendor adds back only depreciation plus amortisation of acquired intangibles and goodwill; it leaves the **amortisation of capitalised software development costs inside cost of revenue**, so this EBITDA is already charged for content amortisation (proof: FY2024 EBIT $(544.8)m + D&A $977.0m = $432.2m) [7]. (ii) **Non-GAAP EBITDA (company-defined)** — GAAP net income excluding tax, interest income/expense, D&A and amortisation of acquired intangibles; it does **not** add back stock-based compensation [5, p.11]. (iii) **EBITDA, management-reporting basis** — (ii) further adjusted for deferred revenue, stock compensation, business acquisition and other; this is the number Capital IQ's "EBITDA" field tracks [5, p.2; 12].
- **Capital IQ "EPS Normalized" and "EBITDA" are management-basis, not GAAP** — carried forward from `04_guidance-consensus`, which reconciled both to the cent on two consecutive quarters [12].

---

## 1. EBITDA → CFO → FCF Bridge (FY2023–FY2026 + latest TTM)

This bridge is built from **the filing's own cash-flow line groupings**, so it foots exactly to reported CFO in every column (verified by executed arithmetic, §9). A generic template bridge would not foot for this company, because Take-Two's dominant operating outflow is **cash spent on software development costs and licenses** ($688.9m in FY2026) which sits *inside* operating cash flow, not in capex [1, p.66].

| Item | FY2023 | FY2024 | FY2025 | FY2026 | TTM to 2026-09-30 | Trend |
|---|---:|---:|---:|---:|---:|---|
| **EBITDA (CIQ vendor-computed)** | 555.5 | 432.2 | 379.5 | 788.5 | **724.9** | Inflecting up from FY2025 trough |
| Memo: GAAP net loss | (1,124.7) | (3,744.2) | (4,478.9) | (298.2) | (240.5) | Improving |
| + Depreciation | 90.3 | 135.5 | 153.9 | 166.4 | 164.0 | Stable |
| + Amortisation & impairment of intangibles | 1,506.7 | 1,418.9 | 922.6 | 725.7 | 697.5 | Falling |
| + Goodwill impairment (non-cash) | — | 2,342.1 | 3,545.2 | — | — | Gone |
| + Amortisation & impairment of software development costs and licenses (non-cash) | 268.3 | 292.7 | 333.8 | 412.8 | 411.9 | Rising |
| + Stock-based compensation (non-cash) | 317.8 | 335.6 | 324.0 | 305.3 | 344.7 | Stable ~$320m/yr |
| + Other non-cash (noncash lease, interest expense add-back, deferred tax, fair-value, other) | (201.5) | 90.4 | 398.0 | 319.5 | 277.7 | Volatile |
| **− Cash spend on software development costs and licenses** | **(492.8)** | **(603.4)** | **(691.6)** | **(688.9)** | **(716.3)** | Rising |
| **Working capital change** (receivables, software-dev **excluded** here, prepaid/other, inventory, deferred revenue, payables/accruals) | **(363.0)** | **(283.7)** | **(552.2)** | **(318.3)** | **(569.9)** | Persistent drag |
| — of which receivables | 106.8 | 83.7 | (105.0) | 35.0 | 384.1 | Large release in TTM |
| — of which prepaid / other current & non-current assets | 77.2 | (154.7) | 11.9 | (66.5) | (266.6) | **Deteriorating sharply** |
| — of which inventory | — | — | — | — | (19.3) | New drag |
| — of which deferred revenue | (141.9) | (11.8) | 6.8 | 78.5 | (225.0) | **Reversed to a drag** |
| — of which payables, accrued expenses and other liabilities | (405.1) | (200.9) | (465.9) | (365.3) | (443.1) | Persistent drag every year |
| **= CFO (reported)** | **1.1** | **(16.1)** | **(45.2)** | **624.3** | **367.1** | Inflecting, then flattening |
| Memo: cash interest paid | 137.0 | 137.0 | 147.1 | 153.0 | n/d | See note |
| Memo: cash income taxes paid | 176.8 | 150.2 | 144.3 | 149.4 | n/d | See note |
| Maintenance capex | not disclosed | not disclosed | not disclosed | not disclosed | not disclosed | — |
| Growth capex | not disclosed | not disclosed | not disclosed | not disclosed | not disclosed | — |
| Total capex (purchases of fixed assets + asset acquisitions) | 204.2 | 169.1 | 189.7 | 190.2 | **304.5** | **+72.1% in TTM** |
| **= FCF (CFO − total capex), reported** | **(203.1)** | **(185.2)** | **(234.9)** | **434.1** | **62.6** | Negative 3 of 5 years |
| **= Normalised operating FCF** (excl. the London building one-off) | (203.1) | (185.2) | (234.9) | 434.1 | **up to 154.4** | Still down ~15% YoY |
| **CFO / EBITDA %** | **0.2%** | **(3.7)%** | **(11.9)%** | **79.2%** | **50.6%** | **Below 50% in 4 of 5 years** |

*Sources: FY2023–FY2025 lines from `FY2025 10-K, Consolidated Statements of Cash Flows, p.68` [2]; FY2026 from `FY2026 10-K, Consolidated Statements of Cash Flows, p.66` [1]; TTM = FY2026 − six months ended 2025-09-30 + six months ended 2026-09-30, both six-month columns from `Q2 FY27 10-Q, Condensed Consolidated Statements of Cash Flows, p.5` [3]; EBITDA from `Capital IQ Financials_Annual, Income Statement tab, EBITDA row` [7], with the LTM $724.9m pinned by the deterministic facts sidecar [10].*

**Capex split: not disclosed.** *"Capex split not disclosed — total capex used. FCF may understate true recurring free cash flow."* Two things make that caveat less generous than it sounds for this company. First, the **largest discretionary spend is not in capex at all**: $716.3m of cash went into software development costs and licenses over the latest twelve months, inside CFO [1, p.66; 3, p.5] — so **FCF of $62.6m is already net of content investment and must never be read as "cash before content spend"**. Second, a usable recurring-capex proxy does exist: FY2024–FY2026 total capex averaged **$183.0m** ((169.1 + 189.7 + 190.2) ÷ 3), against $304.5m in the latest twelve months.

**Lead figure — normalised operating FCF of up to $154.4m, not the reported $62.6m (§15).** On 2026-08-10 Take-Two bought the London building it had previously leased, for a **total capitalised cost of $91.8m**, of which **$82.9m was allocated to land and $8.9m to the building (20-year life)** [3, Note 15 (Asset Acquisition)]. That purchase sits in *Purchases of fixed assets* and is a one-off property transaction, not recurring plant spend. Excluding it, normalised operating FCF for the twelve months to 2026-09-30 is **up to $154.4m** (367.1 − (304.5 − 91.8)) against the **reported $62.6m**. Two honesty qualifications travel with that figure: (a) the filing states the $91.8m capitalised cost "includes cash consideration, direct transaction costs, net of the derecognition of the preexisting lease liability and right-of-use asset" — **the cash element is not separately disclosed**, so $91.8m is a ceiling on the add-back, which is why the normalised figure is stated as "up to"; and (b) **even at the full add-back, normalised FCF of $154.4m is still below the $181.0m of the prior twelve months** [upstream `01_historical-financials.md` §2]. The capex spike explains most of the FCF fall; it does not make the fall disappear.

**Why the memo rows for interest and tax rather than bridge rows.** Take-Two's cash-flow statement adds back the full **interest expense** as a reconciling item ($151.4m in FY2026) and routes the actual cash interest and tax payments through the *accounts payable, accrued expenses and other liabilities* change [1, p.66]. Putting a separate "interest paid" and "tax paid" line into the bridge would therefore double-count them and the bridge would stop footing. They are shown as memo items from the filing's own supplemental disclosure instead. **`n/d` for the TTM** is deliberate: the 10-Q carries no supplemental interest/tax-paid disclosure, and Capital IQ's LTM column simply repeats the FY2026 figures ($153.0m and $149.4m), with the Jun-2026 and Sep-2026 quarters marked `NA` [9] — so no twelve-month figure exists and none is invented. The filing's **interest expense** for the six months to 2026-09-30 was $60.6m [3, p.5].

**FY2022 for context (vendor basis, one column back):** EBITDA $671.0m, CFO $258.0m, total capex $158.6m, FCF $99.4m, **CFO/EBITDA 38.4%** [7][8]. Adding that column does not improve the picture — it makes the sub-50% conversion read five years long rather than four.

---

## 2. Cash Conversion Assessment

CFO has not tracked EBITDA over this cycle. On the vendor EBITDA basis, cash conversion was **38.4% (FY2022), 0.2% (FY2023), −3.7% (FY2024), −11.9% (FY2025), 79.2% (FY2026) and 50.6% in the twelve months to 2026-09-30** — below the 70% healthy mark in five of six periods and below the 50% red-flag line in four of them, with FY2026 the single clean year [1][2][7][10]. Three of the five fiscal years printed **negative** free cash flow (FY2023 $(203.1)m, FY2024 $(185.2)m, FY2025 $(234.9)m), and the FY2026 recovery has already given back most of its ground: CFO over the latest twelve months is roughly flat at $367.1m while total capex rose 72.1% to $304.5m, cutting FCF to $62.6m from $181.0m, and strict-basis net debt rose from **$972.5m (1.23x, strict basis)** at FY2026 year-end to **$1,370.4m (1.89x, strict basis)** at 2026-09-30 [1, Note 11 (Debt); 3, Note 10 (Debt); 9][10]. The trajectory is therefore **not a trend but a swing**: one strong year inside a five-year run of weak conversion, with the latest twelve months back on the 50% line.

The mechanical cause is identifiable and is not fraud. EBITDA on this basis is already charged the **amortisation** of capitalised content ($411.9m in the TTM), while CFO is charged the **cash spend** on content ($716.3m) — a gap of **$304.4m** that is pure growth investment ahead of the Grand Theft Auto VI release, and a gap that ran $310.7m / $357.8m / $276.1m in FY2024 / FY2025 / FY2026 as well [1][2][3]. On top of that sits a payables-and-accruals outflow in **every single year** of the series (−$405.1m, −$200.9m, −$465.9m, −$365.3m, −$443.1m), which is the Zynga-era accrual base unwinding.

RF-EQ-002 (cash-conversion breakdown)

That tag is emitted because CFO/EBITDA was below 50% in **two of the last three fiscal years** (FY2024 −3.7% and FY2025 −11.9%; FY2026 79.2%), and the latest twelve months sit at 50.6%, barely over the line. It is emitted as a source signal for the synthesis layer's cross-module roll-up regardless of whether it alone moves this module's own score band in Section 9.

---

## 3. Working Capital Trends

**Formulas and basis, pinned.** `DSO = 365 × accounts receivable ÷ revenue`; `DIO = 365 × inventory ÷ COGS`; `DPO = 365 × accounts payable ÷ COGS`. DSO uses **revenue**; DIO and DPO use **cost of revenue**, never revenue. **Period-end balances are used consistently**, not averages — because the opening balances for FY2024 (Mar-31-2023, filing basis, receivables net of contract assets) are not in this pool, an average-balance series would silently switch bases mid-table (§15). All balances are the **filing's own** lines; the latest column divides the 2026-09-30 period-end balance by trailing-twelve-month revenue / COGS, matching the annual columns' construction. TTM COGS = $2,846.7m − $1,352.1m + $1,288.0m = **$2,782.6m** [1; 5 "Additional Data"].

| Metric | FY2025 (Mar-31-2025) | FY2026 (Mar-31-2026) | Latest (2026-09-30) | Direction | Risk |
|---|---:|---:|---:|---|---|
| Receivable days (DSO) | 50.0 | 40.4 | **44.5** | Up 4.1 days (+10.1%) vs FY2026 — but **down from 73.4 days a year earlier** (2026-09-30 vs 2025-09-30) | **Low.** The YoY direction is sharply better; the sequential rise is normal pre-launch |
| Inventory days (DIO) | not disclosed | 0.9 | **4.5** | Rising from a near-zero base (inventory $7.3m → $34.1m) | **Low in dollars, notable in direction** — see below |
| Payable days (DPO), accounts payable only | 27.6 | 27.1 | **27.2** | Flat | **Low.** No supplier stretching |
| Payable days (DPO), accounts payable **+ accrued expenses and other current liabilities** (labelled broad basis) | 187.7 | 170.4 | **165.4** | **Falling 22.3 days over 18 months** | **Medium** — the accrual base is shrinking, which is the cash drag in §1 |
| Cash conversion cycle (DSO + DIO − DPO, accounts-payable basis) | 22.3 (DIO not disclosed) | **14.3** | **21.7** | Up 7.4 days | Low |
| Memo: deferred-revenue days (365 × total deferred revenue ÷ revenue) | 71.8 | 65.2 | **59.3** | **Falling three periods running** | **Medium** — see Section 6 |

*Balances: `FY2025 10-K, Consolidated Balance Sheets, p.65` [2]; `FY2026 10-K, Consolidated Balance Sheets, p.63` [1]; `Q2 FY27 10-Q, Condensed Consolidated Balance Sheets, p.2` [3]. The 2025-09-30 receivable balance ($1,249.9m, vendor basis incl. contract assets) comes from `Capital IQ Financials_Quarterly, Balance Sheet tab, FQ2/CQ3 Sep-30-2025` [9] — a tier-5 vendor export, used because no Q2 FY26 10-Q exists in this pool.*

**Flag tests, answered explicitly.**

- **DSO rising >10% YoY?** **No.** DSO fell from roughly 73.4 days at 2025-09-30 to 44.5 days at 2026-09-30 — a 29-day improvement — because the abnormal H1 FY26 receivable build ($393.1m outflow) unwound into a $384.1m receivable release in the latest twelve months [3, p.5; 9]. The +10.1% move against the FY2026 year-end is sequential, not year-on-year, and does not meet the test. **No revenue-recognition concern from receivables.**
- **DIO rising >15% YoY?** **Yes on the percentage, immaterial on the dollars, and explained.** Inventory went from $7.3m to $34.1m (+367%) in six months while six-month cost of revenue *fell* 4.7% ($1,352.1m → $1,288.0m). The composition is the giveaway: **parts and supplies rose from $1.2m to $24.0m** while finished products went $6.2m → $10.1m [3, Note 8 (Inventory)]. That is componentry for physical/collector editions ahead of a launch, in a company whose revenue is **97.9% digital** [3, Disaggregation of Revenue]. It is a real accrual flag by the letter of the test and a $26.8m item in a $6.4bn revenue business. **Not channel stuffing** — there is no receivable build beside it.
- **DPO rising sharply?** **No — the opposite, and that is the finding.** Accounts payable days are flat at ~27. On the broad basis that actually matters here (accrued expenses and other current liabilities are $1,053.1m against accounts payable of only $207.7m), payable days have fallen 22.3 days since FY2025. Inside the accrual, **compensation and benefits fell from $371.5m to $234.8m** in six months — an annual-bonus payout — while **software development royalties accrued rose from $359.3m to $421.4m** [3, Note 9]. There is no liquidity signal from supplier stretching; there is a steady cash cost of paying down an accrual base built during the Zynga era.

---

## 4. Non-GAAP Adjustments

Take-Two's own reconciliations, not reconstructions. Q2 FY27 (three months ended 2026-09-30). The chain is: GAAP net loss $(54.0)m → **non-GAAP EBITDA $92.2m** → **management-reporting EBITDA $277.1m** [5, p.2 and p.11].

| Adjustment | Amount | Recurring? (Y/N) | Concern Level | Evidence |
|---|---:|---|---|---|
| Amortisation of acquired intangibles | +145.1 | **Y** — every quarter; $305.6m in the half, $333.2m in the year-ago half; guided $623m for FY2027 | **Low** | `Q2 FY27 earnings release, p.11 (Reconciliation of GAAP to Non-GAAP Measure)`; `same, Outlook table` |
| Depreciation and amortisation | +48.1 | **Y** | **Low** | `Q2 FY27 earnings release, p.11` |
| Interest expense | +30.2 | **Y** — real cash cost ($60.6m in the half) | **Low** (standard EBITDA exclusion) | `Q2 FY27 earnings release, p.11` |
| Interest income | (19.3) | **Y** | **Low** | `Q2 FY27 earnings release, p.11` |
| Benefit from income taxes | (57.9) | Y as a line, **N as a benefit** | **Mid** — the benefit, not the add-back, is the issue (Section 8) | `Q2 FY27 earnings release, p.11`; `Q2 FY27 10-Q, Note 13 (Income Taxes)` |
| **Stock-based compensation** | **+90.0** | **Y — every single quarter** ($176.0m in the half; $305.3m in FY2026; guided **$462m** for FY2027) | **HIGH** | `Q2 FY27 earnings release, p.2 (management-reporting table: cost of revenue 3.4 + S&M 23.1 + R&D 22.5 + G&A 41.0 = 90.0)`; `FY2026 10-K, p.66`; FY27 guidance derived in `04_guidance-consensus` §2.1 |
| **Net effect from deferred net revenue and related cost of revenue** | **+101.9** | **Y as a line, but sign-flipping** | **HIGH** | `Q2 FY27 earnings release, p.2` (revenue +104.3, cost of revenue +3.3, interest/other +0.9) |
| Business acquisition / acquisition-related expenses | +2.4 | **Y** — present in every quarter shown ($3.8m in the half; $7.5m in the year-ago half) | **Mid** — a "one-off" that never stops | `Q2 FY27 earnings release, p.2` |
| Other | (9.4) | Y | **Low** — reduces adjusted EBITDA | `Q2 FY27 earnings release, p.2` |
| Impact of business reorganisation | — in FY27; **$(0.1)m / $(0.5)m / +$5.0m / $(0.4)m** in FY26 quarters | Was recurring FY2024–FY2026, now absent | **Mid** (see Section 5) | `Q2 FY27 earnings release, p.2 (Six Months Ended September 30, 2025 columns)` |

**The three flag tests.**

1. **Adjustments that recur every period.** Amortisation of acquired intangibles, stock-based compensation, the deferred-revenue effect and acquisition-related expenses all appear in **every** period disclosed. None of them is a one-off. The acquisition-related line is the clearest offender in kind: $3.8m in the half and $7.5m a year earlier, four and a half years after the Zynga deal closed.
2. **Adjustments exceeding 15% of GAAP earnings.** All of them, trivially — GAAP earnings are a loss. The honest sizing is against revenue: the **total** step from GAAP net loss $(54.0)m to management-reporting EBITDA $277.1m is **$331.1m on $1,497.0m of revenue, i.e. 22.1% of the quarter's revenue**.
3. **Stock-based compensation excluded from "adjusted" numbers.** **Yes, and this is the single largest judgment-free distortion in the chain.** $90.0m was added back in Q2 FY27 — **32.5% of the $277.1m management-reporting EBITDA the Street's consensus field actually tracks**. For FY2027 the company's own outlook implies **$462m of stock compensation inside a derived management-basis EBITDA midpoint of $1,565m — 29.5%** [5; 12]. Stock compensation is a real cost of employing people: it diluted the share count from 177.1m shares outstanding at 2025-03-31 to 187.2m at 2026-09-30 [1, p.63; 3, p.2], and it is added back every quarter without exception.

---

## 5. One-Off Items (last three years)

| Item | Period | Amount | Classification | Evidence |
|---|---|---:|---|---|
| Goodwill impairment | FY2024 | 2,342.1 | **Genuine** one-off, non-cash; none in FY2026 | `FY2025 10-K, Consolidated Statements of Operations, p.66` |
| Goodwill impairment | FY2025 | 3,545.2 | **Genuine** one-off, non-cash; the auditor's sole Critical Audit Matter is the goodwill impairment assessment | `FY2026 10-K, p.64`; `FY2026 10-K, Report of Independent Registered Public Accounting Firm — Critical Audit Matter: Goodwill Impairment Assessment` |
| Business reorganisation expense | FY2024 | 104.6 | **Recurring "one-off"** — charged two years running | `FY2026 10-K, p.64` |
| Business reorganisation expense | FY2025 | 106.5 | **Recurring "one-off"** | `FY2026 10-K, p.64` |
| Business reorganisation — net **credit** | FY2026 | **(4.4)** | **Suspicious direction** — a reserve release, not a charge; it *added* $4.4m to FY2026 operating income | `FY2026 10-K, p.64`; `FY2026 10-K, MD&A` ("decreased by $110.9 … primarily") |
| Impairment of software development costs and licenses | FY2024 | 109.9 | **Recurring "one-off"** ($88.2m of it from the cost-reduction programme) | `FY2026 10-K, Note 7 (Software Development Costs and Licenses)` |
| Impairment of software development costs and licenses | FY2025 | 77.5 | **Recurring "one-off"** ($42.4m abandoned titles, $35.1m cost-reduction programme) | `FY2026 10-K, Note 7` |
| Impairment of software development costs and licenses | FY2026 | **(1.0)** | **Suspicious direction** — a net **recovery**: $(6.0)m written back on two terminated titles, $5.0m of new charges | `FY2026 10-K, Note 7` |
| Impairment of software development costs — abandoned third-party title | Q1 FY27 | 43.4 | **Recurring "one-off"** — same line, fourth year running | `Q1 FY27 10-Q, Note 7` |
| Impairment of software development costs | Q2 FY27 | 0.2 | Recurring, immaterial | `Q2 FY27 10-Q, Note 7` |
| **London building purchase** | Q2 FY27 (2026-08-10) | **91.8** capitalised cost (82.9 land + 8.9 building) | **Genuine** one-off — the capex normalisation in §1 | `Q2 FY27 10-Q, Note 15 (Asset Acquisition)`; `Q2 FY27 10-Q, MD&A — Liquidity` |
| **Government grants on qualified production spend** (reduce cost of revenue and R&D) | FY2024 / FY2025 / FY2026 | **51.2 / 210.6 / 85.4** | **Recurring but wildly lumpy** — and FY2025's was **55% of that year's $379.5m EBITDA** | `FY2026 10-K, Note 7` (cost of revenue reduced by $75.5 / $167.4 / $45.3; R&D reduced by $9.9 / $43.2 / $5.9) |
| Income tax benefit including reserve releases | Q2 FY27 | 57.9 | **Suspicious as a quality item** — turns a $(111.9)m pre-tax loss into a $(54.0)m net loss | `Q2 FY27 10-Q, Note 13` |
| Non-cash acquisition of non-voting equity shares in a privately-held entity | H1 FY27 | 62.1 | **Genuine** one-off, non-cash, **consideration not disclosed** | `Q2 FY27 10-Q, Note 5 (Fair Value Measurements — Nonrecurring)` |
| Equity issuance (underwritten offering) | FY2026 | 1,247.5 cash in | Genuine one-off — financing, not earnings; it is what halved net debt in FY2026 | `FY2026 10-K, p.66` |

**Reconciliation to the §1 normalisation.** Only one item in this table changes a §1 figure: the London building. $304.5m TTM capex − $91.8m = $212.7m; $367.1m CFO − $212.7m = **$154.4m normalised operating FCF**, against **$62.6m reported**. Nothing else above is adjusted out of the bridge, and the government-grant and tax-benefit items are deliberately **left in** — they are recurring features of this P&L, not removable one-offs.

**The reserve-release pattern deserves naming.** FY2026 is the clean cash year, and two of its lines are reversals of prior-year charges rather than an absence of charges: business reorganisation **+$4.4m** and software-development impairment **+$1.0m**. Together $5.4m — small against $788.5m of EBITDA. But the *year-on-year* optics are larger: those two lines moved from $184.0m of combined charges in FY2025 to a $5.4m combined credit in FY2026, a $189.4m swing that flattered the FY2026 operating-income improvement without any operating cause.

---

## 6. Accrual Quality Flags

| Flag | Triggered (Y/N) | Evidence |
|---|---|---|
| Revenue growing faster than CFO for 2+ years | **Y** | FY2024 revenue flat at $5,349.6m while CFO fell from $+1.1m to $(16.1)m; FY2025 revenue **+5.3%** to $5,633.6m while CFO fell again to $(45.2)m — two consecutive years. The latest twelve months are marginal in the same direction: revenue **+3.1%** (6,409.7 vs 6,219.9) against CFO **+2.6%** (367.1 vs 357.9). **Not** triggered in FY2026, when revenue rose 18.2% and CFO swung to $+624.3m [1][2][9][10] |
| Receivables growing faster than revenue | **N** | Receivables **fell** from $1,249.9m (2025-09-30, vendor basis incl. contract assets) to $780.8m (2026-09-30) — DSO 73.4 → 44.5 days — against TTM revenue up 3.1%. The sequential rise (737.0 → 780.8, +5.9%) is pre-launch and does not meet the year-on-year test [1][3][9] |
| Inventory growing faster than COGS | **Y** | Inventory $7.3m → $34.1m (+367%) in six months while six-month cost of revenue fell 4.7% ($1,352.1m → $1,288.0m). Composition is parts and supplies $1.2m → $24.0m. Immaterial in dollars; triggered by the letter of the test [3, Note 8; 5] |
| Deferred revenue declining (contract/recurrent business) | **Y** | Total deferred revenue (current + non-current) **$1,268.1m at 2025-09-30 → $1,042.1m at 2026-09-30, −17.8% YoY**, and $1,189.6m → $1,042.1m in six months. Deferred-revenue days fell 71.8 → 65.2 → 59.3 across three periods. This matters because **65% of FY2027 Net Bookings is recurrent consumer spending** and GAAP defers a large share of billings — a falling deferred balance is a falling forward book [3, Note 3; 9; `Q2 FY27 deck, slide 8`] |
| Capitalised costs growing as % of revenue | **Y** | Cash capitalised into software development costs and licenses: **10.53% of revenue in H1 FY26 → 12.29% in H1 FY27** (345.0/3,277.6 → 372.4/3,030.9). The balance rose from $1,973.4m (FY2025) → $2,346.3m (FY2026) → **$2,577.3m (2026-09-30)**, i.e. **+9.8% in six months while revenue fell 7.5%** [1][3] |
| Frequent accounting policy changes | **N** | The only adoption in the period is **ASU 2023-09 (income-tax disclosures)**, prospective from FY2026 and **disclosure-only** — it changes no measurement. Everything else cited (ASU 2025-10 government grants, ASU 2025-06 internal-use software, ASU 2024-03) is *not yet effective* (FY2028–FY2030). Auditor **Ernst & Young LLP, unqualified opinion, continuously since at least FY2017** — no auditor change, no restatement [1, Note 1 and Note 15; `Capital IQ Auditors export, FY2017–FY2026`] |

**Four of six rows triggered Y.**

RF-EQ-001 (rising accruals divergent from cash earnings)

That tag is emitted mechanically because two or more rows resolve Y, and it is emitted for the synthesis layer regardless of whether it alone moves this module's score band in Section 9. The honest reading of *which* four: the two large ones are the **capitalised-cost intensity** and the **falling deferred-revenue book**; the inventory trigger is a $26.8m rounding item on a physical-launch build, and the revenue-vs-CFO trigger is historical (FY2024–FY2025) with FY2026 having reversed it.

**The one line in this section that is not a flag but is the real exposure.** At 2026-03-31, **$2,149.7m of the $2,277.5m non-current capitalised software development balance — 91.6% of the total $2,346.3m — related to titles that had not yet been released** [1, Note 7]. That is **61% of total stockholders' equity of $3,510.9m** and 32% of FY2026 revenue, carried as an asset whose recoverability is tested on *management's expected performance of unreleased products*, using criteria the company itself lists as "historical performance of comparable products … orders for the product prior to its release, general market conditions, and past performance of the franchise" [1, Significant Accounting Policies]. **The 10-Q gives no interim update of the unreleased-title split**, so the 2026-09-30 portion of the larger $2,577.3m balance is not disclosed and is not estimated here. Amortisation runs over 9–36 months on a revenue-proportional or straight-line basis, whichever is greater [1, Significant Accounting Policies].

---

## 7. Reported vs Adjusted Reconciliation — Q2 FY27 (three months ended 2026-09-30)

The company **does** disclose adjusted metrics, on two levels, and discloses the full line-by-line build of both [5, p.2 and p.11]. No full-year FY2026 company-defined reconciliation exists in this pool (no Q4 FY26 release was admitted), so the latest quarter is used.

| Metric | Reported (GAAP) | Adjusted | Difference | % of Reported | Recurring? | Evidence |
|---|---:|---:|---:|---:|---|---|
| EBITDA (company-defined non-GAAP) | Net loss (54.0) | **92.2** | **+146.2** | n/m (reported base negative) — **= 9.8% of the quarter's $1,497.0m net revenue** | Y — same five lines every quarter | `Q2 FY27 earnings release, p.11` |
| EBITDA (management-reporting basis) | Net loss (54.0) | **277.1** | **+331.1** | n/m — **= 22.1% of net revenue** | Y | `Q2 FY27 earnings release, p.2 and p.11`; bridge: 92.2 + 101.9 + 90.0 + 2.4 − 9.4 = 277.1 |
| EBIT (income/(loss) from operations) | **(117.5)** | **229.6** (management-reporting) | **+347.1** | n/m — **= 23.2% of net revenue** | Y | `Q2 FY27 earnings release, p.2`. **The company discloses no adjusted EBIT as a named line** — this is the arithmetic of its own adjustment columns: deferred revenue +101.0, stock compensation +90.0, amortisation of acquired intangibles +153.0, acquisition-related +3.1 |
| Net income | **(54.0)** | **≈186.4** (management-reporting, derived) | **+240.4** | n/m | Y | Derived from `Q2 FY27 earnings release, p.2`: pre-tax (111.9) + 101.9 + 90.0 + 153.0 + 3.7 − 9.4 = 227.3; × (1 − 18% management tax rate) = 186.4. The company discloses the columns and the 18% rate but not this total |
| EPS (diluted) | **$(0.29)** | **≈$0.99** (management-reporting, derived) | **+$1.28** | n/m | Y | 186.4 ÷ 188.0m shares [5, p.2]. Capital IQ records the quarter's EPS **actual at $1.00** on its management basis [11] |

**Four columns exist and they are not interchangeable.** GAAP net loss $(54.0)m; non-GAAP EBITDA $92.2m; management-reporting EBITDA $277.1m; management-reporting EPS ≈$0.99. The step from the first to the third is **$331.1m on $1,497.0m of revenue**, and the two largest components are **$90.0m of stock-based compensation** (a cash-equivalent cost of employing people, added back every quarter) and **$101.9m of deferred-revenue timing** (revenue the company billed but GAAP defers — it moves income between periods rather than creating it).

**The deferred-revenue adjustment cuts both ways, and in this quarter it cut the helpful way.** For the **three** months to 2026-09-30 the net effect on revenue was **+$104.3m** (Net Bookings $1,601.3m above GAAP net revenue $1,497.0m). For the **six** months it was **−$43.7m** (Net Bookings $2,987.2m *below* GAAP net revenue $3,030.9m) [5, p.2 and "Net Bookings by content"]. So the single largest non-amortisation add-back in the quarter's management-reporting EBITDA was a positive only because of where the quarter fell in the billing cycle; on the half it was a subtraction. Any claim built on the Q2 management-basis number must carry that.

---

## 8. Accounting Trap Checklist

**Severity is an INVERTED score — higher means WORSE.**

| Trap | Triggered? (Y/N) | Evidence | Severity /100 *(higher = WORSE — inverted)* |
|---|---|---|---:|
| Stock-based compensation excluded from adjusted earnings | **Y** | $90.0m added back in Q2 FY27 = **32.5%** of the $277.1m management-reporting EBITDA the consensus field tracks; $176.0m in the half; $305.3m in FY2026; **$462m guided for FY2027 = 29.5%** of the derived management-basis EBITDA midpoint. Share count rose 177.1m → 187.2m over 18 months [5, p.2; 1, p.63 and p.66; 3, p.2; 12] | **75** |
| Restructuring costs recur every year | **Y (FY2024–FY2025), then reversed** | Business reorganisation $104.6m (FY2024), $106.5m (FY2025), **$(4.4)m credit (FY2026)**, absent in FY2027 to date. Software-development impairment $109.9m / $77.5m / $(1.0)m / $43.6m (H1 FY27) — the same line in four consecutive years [1, p.64 and Note 7; 2, p.66; 4, Note 7] | **50** |
| Capitalised costs rising faster than revenue | **Y** | Capitalised software-development cash spend **10.53% → 12.29% of revenue** H1 FY26 → H1 FY27; balance $2,346.3m → $2,577.3m (+9.8%) in six months while revenue fell 7.5%. **$2,149.7m (91.6% of the FY2026 balance) sat on unreleased titles = 61% of equity** [1, Note 7; 3, p.2 and Note 7] | **80** |
| Receivable factoring / supplier finance disclosed | **Y (disclosed), N (used)** | Uncommitted accounts-receivable purchase facility of up to **$215.0m** on a true-sale basis, entered 2025-05-19, with proceeds reported **inside operating cash flow**. "**No receivables were sold under this facility during the fiscal year ended March 31, 2026**" and "**No receivables were sold … during the six months ended September 30, 2026**" [1, MD&A — Accounts Receivable sale program; 3, Note 3]. So CFO is **not** flattered by factoring today; the mechanism to flatter it exists and is pre-approved | **30** |
| Inventory write-downs or reserve releases | **Y — releases, not write-downs** | FY2026 software-development impairment was a net **$(1.0)m recovery**, including **$(6.0)m written back** on two titles terminated under the FY2025 cost-reduction plan; business reorganisation a **$(4.4)m credit**. Combined $5.4m credit in FY2026 against $184.0m of charges in FY2025 [1, p.64 and Note 7] | **45** |
| Revenue recognised before cash collection risk is clear | **N** | 97.9% of revenue is digital online; five customers are **80.8% of net revenue** and 76.2% of gross receivables, but these are platform storefronts, allowances are **$0.7m** on $780.8m of gross receivables, and the company carries trade credit insurance on the majority of customers. Revenue split: $4,504.8m over time vs $1,128.8m point-in-time in FY2025 — a service-period model, not a sell-in model [3, MD&A — Financial Condition and Disaggregation of Revenue; 2, Note on revenue recognised] | **20** |
| Change in useful life / depreciation assumptions | **N** | No change disclosed. Policies unchanged: software titles amortised over **9 to 36 months**; office equipment 5 years; computer equipment 3–5 years; leasehold improvements ~7 years; buildings ~30 years. The London purchase was allocated $82.9m to **land (not depreciated)** and $8.9m to building over 20 years — honest allocation, but it means a $91.8m cash-equivalent outlay adds almost no depreciation [1, Significant Accounting Policies; 3, Note 15] | **15** |
| Tax rate unusually low or boosted by one-off | **Y** | Q2 FY27 **benefit** from income taxes of $57.9m against a $(111.9)m pre-tax loss — an **effective rate of 51.7% vs the 21% statutory rate**, "primarily driven by tax benefits of $57.1 related to geographic mix of earnings **and changes in reserves**, offset by tax expense of $20.0 related to tax credits". Six-month rate 45.3%. Without the benefit the quarter's net loss would have been $(111.9)m, not $(54.0)m. A **November 2026 reorganisation of certain intangible assets "to simplify our global operating structure"** will shift the jurisdictional mix of earnings from that month, impact "still evaluating" [3, Note 13 and Note 16] | **65** |
| Large fair-value / mark-to-market gains | **N** | Fair-value adjustments of $12.5m (FY2026), $6.9m (FY2025), $8.6m (FY2024) — immaterial against EBITDA. Level 3 assets $24.0m of $1,380.4m total financial assets. One non-cash item to note rather than a gain: **$62.1m of non-voting equity shares in a privately-held entity acquired in a non-cash transaction** in H1 FY27, consideration not disclosed [1, p.66; 3, Note 5] | **20** |

---

## 9. Earnings Quality Score

### **48 / 100** — band 41–60: *material concerns — cash conversion weak OR recurring one-offs*. Here, both.

**The single most important reason:** cash conversion has failed for most of this cycle, not for one year — CFO/EBITDA of **38.4% / 0.2% / −3.7% / −11.9% / 79.2% / 50.6%** across FY2022–FY2026 and the latest twelve months, with **negative free cash flow in three of five fiscal years** and the one clean year (FY2026) already half given back (normalised operating FCF of up to $154.4m in the latest twelve months against $181.0m a year earlier, reported FCF $62.6m against $181.0m) [1][2][3][7][9][10].

**What holds the score up to 48 rather than lower.** The disclosure is unusually complete, and that is worth real credit: Take-Two publishes the **entire line-by-line build** of both its non-GAAP and its management-reporting measures, and `04_guidance-consensus` reconciled the vendor's "EBITDA" and "EPS Normalized" fields to those builds **to the cent on two consecutive quarters** [12]. The deferred-revenue note states how much of the opening balance was recognised ($971.5m in the half). The auditor is **Ernst & Young LLP with an unqualified opinion continuously since at least FY2017**, no auditor change and no restatement of the filings; the sole Critical Audit Matter is the goodwill impairment assessment. The receivable-factoring facility exists but was **not used** in FY2026 or H1 FY27, so CFO is not flattered by it. DSO improved 29 days year on year. And the capex spike that cut reported FCF has a **named, verifiable one-off cause** — the $91.8m London building. None of this is an opaque set of accounts.

**What holds it down to 48.** Four of six accrual flags fire (`RF-EQ-001`) and cash conversion breaks the 50% test in two of the last three fiscal years (`RF-EQ-002`). $90.0m a quarter of stock-based compensation is excluded from the number the market tracks. A $101.9m deferred-revenue timing adjustment lifted the quarter's management-basis EBITDA while the same adjustment was *negative* $43.7m for the half. FY2026's operating-income improvement was flattered by $189.4m of swing in reserve lines that reversed rather than recurred. The quarter's GAAP loss was halved by a $57.9m tax benefit that included reserve releases, at a 51.7% effective rate against a 21% statutory rate. And $2,149.7m of capitalised development cost — 61% of equity — sits on titles that had not been released at the last annual balance-sheet date, with no interim update.

**No partial-data cap applies.** Audited FY2026 and FY2025 cash-flow statements, the six-month interim statements to 2026-09-30, and ~42 quarters of vendor cash-flow history are all present, so the `MODULE_RULES.md` "no cash flow statement → earnings quality max 45" cap does **not** bind, and the score is set on evidence rather than by a cap.

---

## 10. The Single Biggest Quality Concern

**The risk is not that reported earnings are fabricated — it is that $2.5bn of the balance sheet is an unamortised bet on games nobody has bought yet, and the cash cost of making them runs through operating cash flow every quarter while the charge against profit does not.** At 2026-03-31, **$2,149.7m of the $2,346.3m capitalised software-development balance related to titles that had not been released** — 91.6% of the asset, **61% of total stockholders' equity of $3,510.9m**, carried at cost and tested for recoverability against *management's forecast* of how unreleased products will perform [1, Note 7 and Significant Accounting Policies]. The balance has since grown to **$2,577.3m at 2026-09-30**, up 9.8% in six months while revenue fell 7.5% and the capitalisation rate rose from 10.53% to 12.29% of revenue [3, p.2 and Note 7]. Meanwhile **$716.3m of cash** went into content over the latest twelve months against only **$411.9m** of amortisation charged — a $304.4m gap that is why EBITDA of $724.9m converted to just $62.6m of reported free cash flow. The company has already shown it will write this asset down when a title dies: $109.9m in FY2024, $77.5m in FY2025, $43.4m in a single quarter in Q1 FY27 [1, Note 7; 4, Note 7]. If Grand Theft Auto VI — the title this build-up plainly funds, launched within days of this report's date with pre-orders management described only as "tracking far in excess of our initial expectations" and quantified nowhere in this pool — performs below the forecast embedded in that carrying value, the write-down lands as a non-cash charge **after** the cash has already gone out. That is the asymmetry: the cash risk is taken now and is visible in a 50.6% cash-conversion rate; the earnings risk is deferred and sits entirely inside one unverifiable management estimate. Secondary but real: the market's own yardstick for this company is a management-reporting EBITDA that excludes **$462m of guided FY2027 stock compensation (29.5% of it)** and adds back a deferred-revenue timing effect that was positive $104.3m for the quarter and negative $43.7m for the half — so the headline number the Street beats or misses is roughly 30% non-cash by construction and partly a function of billing timing.

---

## 11. Citations

[1] FY2026 Form 10-K (fiscal year ended 2026-03-31), filed 2026-05-22 — Consolidated Balance Sheets p.63; Consolidated Statements of Operations p.64; Consolidated Statements of Cash Flows p.66; Report of Independent Registered Public Accounting Firm (Critical Audit Matter — Goodwill Impairment Assessment); Significant Accounting Policies (software development costs, fixed assets, goodwill); Note 7 (Software Development Costs and Licenses); Note 11 (Debt) p.85–86; Note 15 (Income Taxes); MD&A (Accounts Receivable sale program; Business reorganization). `data/TTWO/10K_2025_26_0001628280-26-037434.pdf`
[2] FY2025 Form 10-K (fiscal year ended 2025-03-31) — Consolidated Balance Sheets p.65; Consolidated Statements of Operations p.66 (FY2025 / FY2024 / FY2023); Consolidated Statements of Cash Flows p.68 (FY2025 / FY2024 / FY2023); revenue recognised over time vs point in time. `data/TTWO/10K_2024_25_0001628280-25-026694.pdf`
[3] Q2 FY2027 Form 10-Q (quarter ended 2026-09-30) — Condensed Consolidated Balance Sheets p.2; Statements of Operations p.3; Statements of Cash Flows p.5 (six months ended 2026-09-30 and 2025-09-30); Note 3 (Revenue — Deferred Revenue, Contract assets, Accounts Receivable sale program); Note 5 (Fair Value Measurements); Note 7 (Software Development Costs and Licenses); Note 8 (Inventory); Note 9 (Accrued Expenses and Other Current Liabilities); Note 10 (Debt); Note 13 (Income Taxes); Note 15 (Asset Acquisition); Note 16 (Subsequent Events); MD&A (Liquidity and Capital Resources, Financial Condition, Capital Expenditures). `data/TTWO/10Q_2Q_0001628280-26-072254.pdf`
[4] Q1 FY2027 Form 10-Q (quarter ended 2026-06-30) — Note 7 (Software Development Costs and Licenses — $43.4 impairment); Note 8 (Accrued Expenses). `data/TTWO/10Q_1Q_0001628280-26-054870.pdf`
[5] TTWO Q2 FY2027 earnings release (Form 8-K Exhibit 99.1), dated 2026-11-09 — p.1 (Net Bookings $1,601.3m); p.2 (management-reporting adjustment columns; Outlook for Fiscal Year 2027; Q3 FY27 outlook); p.11 (Reconciliation of GAAP to Non-GAAP Measure — EBITDA bridge and FY27/Q3 outlook reconciliations); "Additional Data" (cost-of-revenue components by quarter and half); "Net Revenue and Net Bookings by Content, Platform Mix, Distribution Channel, and Geographic Region". `data/TTWO/TTWO 2Q27 Earnings Release FINAL.pdf`
[6] Take-Two Q2 FY27 investor deck, 2026-11-09 — slide 8 (FY27 recurrent consumer spending flat YoY, 65% of Net Bookings). `data/TTWO/Take-Two_Interactive_2Q FY27 FINAL.pdf`
[7] Capital IQ `Financials_Annual` export, **Income Statement** tab (FY2017 → FY2026 + LTM Sep-30-2026; reported currency USD m; restatement basis "Latest Filings"), data as of the 2026-11 export — EBITDA / EBIT rows. `data/TTWO/Take Two Interactive Software Inc NasdaqGS TTWO Financials_Annual.xls`
[8] Capital IQ `Financials_Annual` export, **Cash Flow**, **Balance Sheet** and **Supplemental** tabs (FY2017 → FY2026 + Sep-30-2026) — capex, FY2022 cash-flow lines, stock-based compensation before tax, unrecognised tax benefits. Same workbook as [7].
[9] Capital IQ `Financials_Quarterly` export, **Income Statement**, **Cash Flow** and **Balance Sheet** tabs (FQ1 2017 / Jun-30-2016 → FQ2 2027 / Sep-30-2026), data as of the 2026-11 export — standalone quarterly CFO and capex; the 2025-09-30 receivable and unearned-revenue balances (used because no Q2 FY26 10-Q is in this pool); `NA` cash interest/tax paid for Jun-2026 and Sep-2026. `data/TTWO/Take Two Interactive Software Inc NasdaqGS TTWO Financials_Quarterly.xls`
[10] `ciq_facts.json` deterministic facts sidecar (frozen extract generation) — `ltm_ebitda_m` 724.9; `ltm_ocf_m` 367.1; `levered_fcf_m` 787.6 (levered, **not** the §15 CFO−capex definition, and not used); `net_debt_m` 1,237.8 (CIQ **broad** vendor basis); `total_debt_m` 2,911.4; `margin_trend`; `multi_year_trajectory`. All referencing the Capital IQ workbooks at [7]–[9]. Reconciled: this report's EBITDA and CFO reads match the sidecar exactly; no material gap.
[11] Take-Two Interactive Software, Inc., Q2 2027 Earnings Call transcript, 2026-11-09 — S&P Global Market Intelligence Estimates header block (quarter EPS actual 1.00, management basis). `data/TTWO/Take-Two Interactive Software, Inc., Q2 2027 Earnings Call, Nov 09, 2026.rtf`
[12] Upstream module outputs: `analyses/TTWO_2026-11-19/earnings/00_earnings-data-triage.md` (jurisdiction, reporting standard, currency, fiscal-year end, GAAP-revenue-vs-Net-Bookings basis warning, no partial-data cap); `analyses/TTWO_2026-11-19/earnings/01_historical-financials.md` (annual and TTM baseline, prior-TTM FCF $181.0m, strict-basis net-debt series); `analyses/TTWO_2026-11-19/earnings/04_guidance-consensus.md` (the verified bridges proving Capital IQ "EBITDA" and "EPS Normalized" are management-basis, and the derived FY27 management-basis EBITDA range $1,536–1,594m including $462m of stock compensation).
[13] Capital IQ `Auditors` export — auditor history FY1996 → FY2026 (Ernst & Young LLP, unqualified, no change). `data/TTWO/Take Two Interactive Software Inc NasdaqGS TTWO Auditors.xls`

**Not used:** `Alphabet Inc NasdaqGS GOOGL Key Developments.xls` is a wrong-company pool contaminant (Alphabet Inc., not Take-Two) and is cited nowhere in this report [12].

---

## 12. Computation Log (executed, not mental arithmetic)

Every percentage, day-count, bridge total and residual above was produced by executed Python over the sourced figures in §1–§8. The bridge was verified to foot to reported CFO in every column before publication.

```
FY2023 bridge sum 1.1   = reported CFO 1.1   diff -0.0
FY2024 bridge sum -16.1 = reported CFO -16.1 diff -0.0
FY2025 bridge sum -45.2 = reported CFO -45.2 diff  0.0
FY2026 bridge sum 624.3 = reported CFO 624.3 diff  0.0
H1FY27 bridge sum -173.5 = reported CFO -173.5 diff 0.0
H1FY26 bridge sum   83.7 = reported CFO   83.7 diff -0.0
TTM    bridge sum  367.1 = reported CFO  367.1 diff  0.0   (= FY2026 - H1FY26 + H1FY27, ties to sidecar 367.1)

FY2022 EBITDA 671.0 CFO 258.0 capex 158.6 FCF   99.4 CFO/EBITDA 38.4%
FY2023 EBITDA 555.5 CFO   1.1 capex 204.2 FCF -203.1 CFO/EBITDA  0.2%
FY2024 EBITDA 432.2 CFO -16.1 capex 169.1 FCF -185.2 CFO/EBITDA -3.7%
FY2025 EBITDA 379.5 CFO -45.2 capex 189.7 FCF -234.9 CFO/EBITDA -11.9%
FY2026 EBITDA 788.5 CFO 624.3 capex 190.2 FCF  434.1 CFO/EBITDA 79.2%
TTM    EBITDA 724.9 CFO 367.1 capex 304.5 FCF   62.6 CFO/EBITDA 50.6%
TTM normalised FCF excl. London building = 367.1 - (304.5 - 91.8) = 154.4
Recurring-capex proxy = (169.1+189.7+190.2)/3 = 183.0

Working-capital days (period-end balances; DSO on revenue, DIO/DPO on COGS; TTM COGS = 2846.7-1352.1+1288.0 = 2782.6)
FY2025 DSO 50.0  DIO n/d  DPO(AP) 27.6  DPO(AP+accrued, broad) 187.7  CCC 22.3  DefRev days 71.8
FY2026 DSO 40.4  DIO  0.9  DPO(AP) 27.1  DPO(AP+accrued, broad) 170.4  CCC 14.3  DefRev days 65.2
Sep-26 DSO 44.5  DIO  4.5  DPO(AP) 27.2  DPO(AP+accrued, broad) 165.4  CCC 21.7  DefRev days 59.3
Sep-25 DSO 73.4 (vendor AR 1249.9 / prior-TTM revenue 6219.9)  ->  Sep-26 44.5 : -28.9 days YoY

Content investment vs charge:  FY2024 amort 292.7 vs cash 603.4 gap -310.7
                               FY2025 amort 333.8 vs cash 691.6 gap -357.8
                               FY2026 amort 412.8 vs cash 688.9 gap -276.1
                               TTM    amort 411.9 vs cash 716.3 gap -304.4
Capitalisation rate: H1FY26 345.0/3277.6 = 10.53% ; H1FY27 372.4/3030.9 = 12.29%
Capitalised balance: FY2024 1534.8 -> FY2025 1973.4 -> FY2026 2346.3 -> Sep-26 2577.3
Unreleased-title portion FY2026 2149.7 = 91.6% of balance = 61% of equity 3510.9
SBC: FY2024 335.6 (6.27% of rev) ; FY2025 324.0 (5.75%) ; FY2026 305.3 (4.59%) ; TTM 344.7 (5.38%)
SBC as % of mgmt-basis EBITDA: Q2 FY27 90.0/277.1 = 32.5% ; FY27 guided 462/1565 = 29.5%
Q2 FY27 pre-tax loss = -54.0 - 57.9 = -111.9 ; 6M pre-tax loss -161.2, benefit rate 45.3%
Government grants in P&L: FY2024 51.2 (12% of EBITDA) ; FY2025 210.6 (55%) ; FY2026 85.4 (11%)
Inventory 7.3 -> 34.1 = +367% while H1 COGS 1352.1 -> 1288.0 = -4.7%
Deferred revenue (curr+non-curr): Sep-25 1268.1 -> Sep-26 1042.1 = -17.8% YoY
GAAP->mgmt-EBITDA step Q2 FY27 = 331.1 on revenue 1497.0 = 22.1% of revenue
```



---

## earnings / 07_earnings-sensitivity.md

_Source: `07_earnings-sensitivity.md`_

# Earnings Sensitivity — TTWO

**Company:** Take-Two Interactive Software, Inc. (NasdaqGS:TTWO) · **Regime:** US SEC (10-K / 10-Q / 8-K Ex. 99.1) · **Standard:** US GAAP · **Currency:** USD, millions · **Fiscal year:** ends 31 March (FY2026 = year ended 2026-03-31; FY2027 in progress) [1][3][5].

**Evidence binding.** Frozen supervisor-verified read mode. Every manifest / corpus / CIQ-facts / extract read resolved inside the single bound generation `.extract-generations/0af638492ecb0521db2676c79d75e6940c7227bb9f192567527b8a57eb43203d/`. The live logical path `data/TTWO/` was not read; it is a citation label only. `Alphabet Inc NasdaqGS GOOGL Key Developments.xls` is a wrong-company pool contaminant (Alphabet Inc., not Take-Two) and is cited nowhere below.

**Upstream inputs present — no dependency disclaimer applies.** `00_earnings-data-triage.md`, `01_historical-financials.md`, `02_revenue-drivers.md`, `03_margin-drivers.md`, `04_guidance-consensus.md` and `06_earnings-quality.md` were all read. Cross-module: business-model `10_external-dependency.md` and `06_value-chain.md` were read.

**Four basis rules that govern every number below. Read these first — the figures are not interchangeable without them.**

1. **The base metric is FY2027 guided GAAP income from operations (EBIT) of $252.5m.** It is derived from the company's own three guided GAAP components at their midpoints: revenue $8,080m − cost of revenue $3,739.5m − operating expenses $4,088m = **$252.5m**, a **3.12% EBIT margin** [5, "Outlook for Fiscal Year 2027"]. EBIT means operating profit — what is left after every cost of making and selling the games, but before interest and tax. EBIT is used because it is the only profit level the company guides component by component, so it is the only level at which a next print can be tested (see `03_margin-drivers` §4).
2. **GAAP net revenue ≠ Net Bookings, and consensus tracks the second one.** Q2 FY27 GAAP net revenue was $1,497.0m; Net Bookings (the company's own operational metric) were $1,601.3m [3; 5, p.1]. FY2027 guidance is issued on **both** bases at once — GAAP net revenue $7,980–8,180m and Net Bookings $8,000–8,200m [5]. The Capital IQ consensus "Revenue" field is on the **Net Bookings** basis [12]. Every row below names its basis. Nothing mixes them.
3. **Capital IQ "EPS Normalized" and "EBITDA" are management-basis, not GAAP** — reconciled to the cent on two consecutive quarters in `04_guidance-consensus` [12]. No vendor-basis figure is used as a coefficient here.
4. **A zero-mitigation figure is a bound, not a forecast (CLAUDE.md §9).** Every row in §2 carries a "Mitigation assumed" cell. Where the filings let the realised offset be computed, it is computed from the numbers, shown with its arithmetic, and run as a second case. Where it cannot be computed, the row says so rather than presenting the bound as the expected outcome.

---

## 1. Variable Selection

Seven variables were selected from the magnitude ratings in the two driver tables upstream, not invented here. From `02_revenue-drivers` §4 the three rows rated **High** are the release slate (GTA VI), recurrent consumer spending, and the platform gatekeepers; the deferred-revenue wedge is rated High quarterly but **Low annually** (guided at $20m for FY2027 = 0.2% of the $8,080m guided revenue midpoint), so on this report's annual base it was dropped and is named here so the omission is visible rather than silent [5]. From `03_margin-drivers` §5 the rows rated **High** are operating leverage on the revenue denominator (driver 1), release-timed amortisation of the capitalised content asset (driver 2), content mix (driver 3), stock-based compensation (driver 5), marketing (driver 6), R&D intensity (driver 7) and title impairments charged to cost of revenue (driver 10). Drivers 1, 3, 6 and 7 all act through the same two measurable things — the revenue denominator in the launch quarter and the guided full-year cost-of-revenue ratio — so they are carried as **two** variables rather than four, to avoid counting the same move twice. Drivers 2 and 10 are kept as one impairment variable because the company discloses the impairment charge as its own line.

From the business-model cross-module read, `10_external-dependency.md` identifies **FX** as the only external variable with a published company sensitivity (±4.0% of revenue per 10% USD move) and names **discretionary consumer spending on games** as the external variable that would do the most damage, with no sizeable disclosure attached to it [cross-module `10_external-dependency.md` §1 and §4]. FX is therefore included as a row in its own right — it is the single company-disclosed per-unit sensitivity in the whole pool. Consumer spending is **not** given a separate row: it has no disclosed sensitivity anywhere, and it acts entirely through the two rows that are measurable (launch-quarter revenue and the recurrent-spending run-rate). Interest rates are deliberately excluded: the company states "based on the composition of our investment portfolio, there was no material interest rate risk exposure to our Consolidated Financial Statements or liquidity as of March 31, 2026" and had **no borrowings** under its 2022 Credit Agreement at that date [1, Item 7A (Interest Rate Risk)].

---

## 2. Sensitivity Table

Impact is **FY2027 GAAP EBIT in USD millions** unless the row states a different metric. Favourable to earnings = positive. "Bound" means management's response is held at zero; it is a limit, not a forecast.

| Variable | Base Case | Move Basis | Bull Case | EBIT Impact (bull) | Bear Case | EBIT Impact (bear) | Mitigation assumed | Confidence | Evidence |
|---|---|---|---|---:|---|---:|---|---|---|
| **1. Q3 FY27 GAAP net revenue vs the guided midpoint** (the GTA VI launch quarter) | $3,345m guided midpoint (range $3,270–3,420m); Q3 FY26 actual $1,699.0m | Inference, labelled — no evidence in the pool bounds the outcome of an unshipped title. The ±10%/−20% band mirrors the move sizes `02_revenue-drivers` §4 already uses. The only measured base rate — the company's own guidance deviation over four quarters (+11.6%, +3.0%, +3.0%, −2.7% vs midpoint) — was measured on quarters with **no** launch of this scale and is refused as the band here | Revenue **+10%** = +$334.5m | **+165.4** (at the guided Q3 cost structure; = +$0.49 of GAAP diluted EPS) | Revenue **−20%** = −$669.0m | **−330.9** (variable-cost bound) / **−669.0** (fixed-cost-of-revenue bound — see §6) | **0% — bound.** Realised offset **not computable from the pool.** The one period that tests it cuts the other way: Q2 FY27 Net Bookings missed the guided midpoint by $43.7m ($1,601.3m vs $1,645m) and GAAP EPS still beat the guided $(0.84)–$(0.75) at $(0.29) — but $57.9m of that was a **benefit from income taxes below the operating line**, not an operating response, and the operating-expense favourability was partly attributed to timing. Attributing it to mitigation would be bad causal inference | **Low** (inferred coefficient, inferred move size) | Guided components: [5, Q3 FY27 outlook]. Coefficient derivation: [5] + `03_margin-drivers` §10. Prior-year quarter: [11, prepared remarks (Goldstein) — "compared to $1.76 billion in the prior year"]. Q2 miss and tax benefit: [5, p.1]; [3, Results of Operations] |
| **2. FY2027 gross margin (the cost-of-revenue ratio)** | **53.72%** guided ($8,080m − $3,739.5m) vs **57.23%** actual in FY2026 — already guided **−351bps** | Company-disclosed, measured: the size of the company's own **revision between its two FY2027 outlooks**. The 2026-08-07 outlook implied a 55.03% gross margin (revenue $8,000m − cost of revenue $3,598m); the 2026-11-09 outlook implies 53.72% — a **−130.6bps** revision in one quarter's update | Revision reverses: **+130bps** | **+105.0** (1bp of FY27 gross margin = $0.808m of EBIT on $8,080m of revenue). Upper bound if margin returns all the way to FY2026's 57.23% (+351.4bps): **+283.9** | Another **−130bps** | **−105.0** | **117% — realised, measured, and it over-covered.** Between the two outlooks guided gross profit fell **$61.5m** ($4,402.0m → $4,340.5m) while guided operating expenses were cut **$72.0m** ($4,160m → $4,088m), so guided EBIT **rose $10.5m**. Offset = 1 − (+10.5 ÷ −61.5) = **117.1%**; equivalently 72.0 ÷ 61.5 = 117.1%. The CFO's own attribution: the lower gross margin "is due to the mix of the business, and it's being offset by some changes in the operating expenses". **Two qualifiers travel with it:** the offset is measured from two guidance tables, not from a realised print, and management attributed part of the operating-expense favourability to "lower personnel and user acquisition costs… some of that was due to timing" — timing is not a durable cost action. The zero-mitigation figure stays beside it as the bound | **Medium** (guided components are company-disclosed; the offset is measured from guidance, not actuals) | [5, FY2027 outlook]; [6, p.3 prior outlook]; [1, Item 7] for FY2026's 57.23%; [11, Q&A (Schoell / Goldstein)] |
| **3. Recurrent consumer spending (in-game spend on titles already shipped) run-rate** | FY2027 guided **flat YoY** at 65% of Net Bookings. FY2026 base = 78% × $6,721.0m = **$5,242.4m** (5,242.4 ÷ 8,100 = 64.7%, which ties to the guided 65%) | Historical observed, measured: the realised **Q2 FY27 deviation** — recurrent spending fell **9%** against guidance of a **5%** decline, a 4-percentage-point miss in one quarter | **+4pp** vs guided flat | **+209.7 of Net Bookings** (1pp = $52.42m). **EBIT impact: not quantifiable** — the company discloses no cost of revenue, gross profit or margin for any content line, so there is no disclosed rate at which recurrent spending converts to EBIT. Inventing one would be the §15 defect | The realised **−9%** run-rate persists against a guided flat year: **−9pp** | **−471.8 of Net Bookings.** EBIT impact: not quantifiable, same reason | **0% — bound.** Realised offset **not computable from the pool.** The same tax-benefit contamination described in row 1 applies: the Q2 FY27 absorption cannot be separated into operating response versus a below-the-line tax benefit | **Medium** on the bookings coefficient (disclosed base, disclosed deviation); **Not assessable** on EBIT | [5, p.1 and FY2027 outlook]; [11, prepared remarks (Goldstein) — "down 9% for the period compared to our guidance of a 5% decline, driven by NBA 2K"]; [1, Item 7] for FY2026 Net Bookings $6,721.0m and the 78% share; `03_margin-drivers` §1 and §6 for the absence of any content-level cost disclosure |
| **4. Impairment of capitalised software development costs and licences, charged to cost of revenue** | **$0m of further impairment in H2 FY27** — the guidance table discloses no allowance for one, so the base is zero and every impact below is measured against zero, not against the $43.6m already charged in H1 FY27 ($43.4m in Q1, $0.2m in Q2). Carried balance **$2,577.3m** at 2026-09-30 ($82.4m current + $2,494.9m non-current) | Historical observed range, from the company's own annual impairment line: **$109.9m** (FY2024), **$77.5m** (FY2025), **$(1.0)m** (FY2026 — a reversal) | FY2026's outcome repeats: **$0m further impairment** | **0.0** (and FY2026's line was in fact a $1.0m *credit*, so a small positive is possible) | The FY2024 observed high repeats: **$109.9m** | **−109.9** (1:1 — the charge lands in cost of revenue by the disclosed policy) | **0% — bound.** Realised offset **not computable on this basis and deliberately refused.** The only measured offset in the pool (117%, row 2) was measured on a **mix-driven** gross-profit reduction. Applying it to an impairment would be using a sensitivity across a basis it was not measured on — the §15 defect. The contractual position is separately a fact and not a measurement: `06_value-chain.md` records 0% of revenue under a disclosed escalator or cost-plus clause | **Medium** (the coefficient is 1:1 by disclosed policy; the move size is a measured historical range) | [1, Note 1 — Software Development Costs and Licenses]; [1, Note (Software development costs and licenses) — amortisation and impairment table, FY2024 $109.9, FY2025 $77.5, FY2026 $(1.0)]; [3, Item 2 and footnote — $43.6 of impairment within cost of revenue for the six months]; [3, Balance Sheets] |
| **5. Product costs (platform / app-store fees, payment and physical costs) as a share of revenue** | **12.3%** of H1 FY27 revenue ($371.8m) vs 13.4% a year earlier. Exposed base: four gatekeepers each above 10.0% of FY26 revenue, 80.6% top five, each with "the discretion to set the amounts of their platform fees" | Historical observed range of the ratio's own **annual** moves: **−160bps** (FY2025 14.6% → FY2026 13.0%) and **+50bps** (FY2024 14.1% → FY2025 14.6%) | Ratio improves **−160bps**, as it did in FY2026 | **+129.3** (1bp = $0.808m of EBIT on $8,080m) | Ratio worsens **+50bps**, as it did in FY2025 | **−40.4** | **0% — bound, and the demonstrated response channel is sized separately.** No platform-fee increase occurred in **any** reported period, so a gross-to-net offset for one cannot be measured. What **is** measured is the company's demonstrated capacity to move this ratio in its own favour: **−160bps across FY2026** and a further **−110bps across H1 FY27**, through platform mix (mobile 52.2% → 50.1% of FY2026 revenue) and a direct-to-consumer channel that bypasses the Apple/Google fee. **"No contractual pass-through" is a fact about contracts, not a measurement of realised recovery (§9)** — the 160bps is the measurement, and it was realised without any fee increase to recover | **Medium** (disclosed ratios, disclosed historical range) | [1, Item 7 — Cost of revenue, Product costs 863.8/13.0% vs 821.1/14.6%; FY2025 10-K Item 7 756.6/14.1%]; [3, Item 2 — 371.8/12.3% vs 439.7/13.4%]; [1, Item 1 and Item 1A — customer concentration and platform-fee discretion]; `06_value-chain.md` §2 |
| **6. Stock-based compensation** | **$462m** guided for FY2027 = **5.72%** of the $8,080m guided revenue midpoint, of which $113m sits inside cost of revenue and $349m inside operating expenses. $90.0m in Q2 FY27 alone. FY2026 actual **$305.3m** | Historical observed range: the annual series ran $317.8m (FY2023), $335.6m (FY2024), $324.0m (FY2025), $305.3m (FY2026), **$344.7m** (TTM to 2026-09-30) — a 12.9% spread. The guide is **+51.3%** above FY2026 actual | Lands at the TTM run-rate **$344.7m** instead of the guided $462m: **−$117.3m of cost**. *This is a favourable bound — it assumes the entire guided step-up does not happen* | **+117.3** (1:1 — the charge sits inside the guided cost lines) | Lands **+13% above** the guide (the observed annual spread): **+$60.1m of cost** | **−60.1** | **Not applicable — this row IS the response channel.** Stock-based compensation is set by the company's own grant decisions, so there is no separate management response to hold at zero. It is a real cost of paying staff: the share count rose from 177.1m outstanding at 2025-03-31 to 187.2m at 2026-09-30 | **Medium** (disclosed guide, disclosed historical series; the 1:1 coefficient is mechanical) | [5, FY2027 outlook — $462m split $113m / $349m]; [3, Item 2 footnotes — Q2 FY27 $90.0m across four lines]; [1, p.66 — FY2026 $305.3m]; `06_earnings-quality.md` §1 for the TTM $344.7m and the share count |
| **7. US dollar against all currencies — the one company-disclosed per-unit sensitivity** | FX is **published**: "a hypothetical 10.0% increase in the value of the U.S. dollar against all currencies would decrease revenues by 4.0%, while a hypothetical 10.0% decrease … would increase revenues by 4.0%". 40.8% of FY2026 revenue and 40.0% of Q1 FY27 revenue was earned outside the US | **Company-disclosed**, ±10.0% — the exact band the company itself tests. For scale, the realised FX effect on revenue has been **$9.9m or less** in every disclosed period (FY2026 +$9.9m = +0.15%; FY2025 −$2.5m; Q2 FY27 −$0.6m; six months to 2026-09-30 −$0.0m), so the disclosed ±10% sits far outside anything realised | USD **−10.0%** | **+323.2 of GAAP net revenue** (4.0% of $8,080m; = $32.32m per 1% of USD move). **EBIT impact: not quantifiable** — see the mitigation cell | USD **+10.0%** | **−323.2 of GAAP net revenue.** EBIT impact: not quantifiable | **0% — bound on the revenue line, and the coefficient is explicitly gross.** The company's own next sentence: "In our opinion, a substantial portion of this fluctuation would be offset by cost of revenue and operating expenses incurred in local currency" — and it does **not** size "a substantial portion". The realised EBIT offset is **not computable**: the four disclosed periods are tiny and sign-inconsistent (FY2026 revenue +$9.9m but EBIT +$14.2m, from gross profit +$45.4m less operating expenses +$31.2m, i.e. an **amplification**, not an offset; Q2 FY27 revenue −$0.6m and EBIT −$0.6m, a 0% offset on a $0.6m move; Q1 FY27 revenue +$0.6m but EBIT −$1.0m, a sign flip). **The hedge book does not cover this exposure and the coefficient is therefore not position-inclusive:** the forwards ($748.7m to sell / $327.8m to buy at 2026-09-30) cover "non-functional currency denominated cash balances and intercompany funding loans… accounts receivable and… accounts payable", are "not designated as hedging instruments", and their gains and losses are recorded in *Interest and other, net* — below the revenue line the coefficient is measured on | **High** on the revenue coefficient (company-disclosed, restated identically in two filings); **Not assessable** on EBIT | [1, Item 7A (Foreign Currency Exchange Rate Risk)]; [3, Item 3 — same sensitivity restated]; [1, Item 7] and [3, Item 2] for the realised revenue / gross-profit / operating-expense effects; [1, Item 7A (Balance Sheet Hedging Activities)]; cross-module `10_external-dependency.md` §3 |

**Coefficient derivation for row 1, printed rather than asserted.** The Q3 FY27 guided components are revenue $3,345m, cost of revenue $1,690.5m (**50.538%** of revenue) and operating expenses $1,172m, giving EBIT of $482.5m (14.42%) [5]. Holding operating expenses fixed at the guided $1,172m and treating cost of revenue as fully variable at its own guided 50.538% ratio, each $1 of revenue carries **$0.4946 of EBIT** (1 − 0.50538). Check against the bear case: −$669.0m × 0.4946 = **−$330.9m**, taking the Q3 EBIT margin from 14.42% to 5.67% on revenue of $2,676.0m. The ratio's basis is named and is not transported: **50.538% is the Q3 guided cost-of-revenue ratio**, not the FY2027 guided 46.281% and not the Q2 FY27 actual 42.525% — a Q3 revenue move is priced on the Q3 structure [5; `03_margin-drivers` §10]. Two things make this an inference rather than a disclosure, and both are labelled: the company publishes no per-unit revenue sensitivity, and treating cost of revenue as fully variable is **optimistic** on the downside because the amortisation policy contains a straight-line floor (§6).

---

## 3. Sensitivity Ranking

Ranked on the **same metric** — FY2027 GAAP EBIT, USD millions — using the average of the absolute bull and bear impacts. Two of the seven variables carry coefficients on a **different** metric and cannot be ranked on this scale without the basis switch §15 bans; they are listed separately beneath, in their own units.

| Rank | Variable | Absolute Impact, FY27 GAAP EBIT (avg of bull + bear) | Direction of Current Trend |
|---:|---|---:|---|
| 1 | Q3 FY27 GAAP net revenue vs the guided midpoint (GTA VI launch quarter) | **$248.2m** (and $417.3m if the bear runs at the fixed-cost-of-revenue bound) | **Unproven** — the title launched 2026-11-19, the run date; zero reported periods contain any of it. The two reported FY27 quarters fell (−15.6% and +2.0% YoY on GAAP revenue); the next quarter is guided to roughly double |
| 2 | FY2027 gross margin (the cost-of-revenue ratio) | **$105.0m** | **Adverse, already guided and already acknowledged** — guided 53.72% against 57.23% in FY2026 (−351bps), and revised down a further 130.6bps between the two FY2027 outlooks |
| 3 | Stock-based compensation | **$88.7m** | **Adverse** — guided $462m for FY2027, +51.3% above FY2026's $305.3m actual and 5.72% of guided revenue |
| 4 | Product costs as a share of revenue | **$84.9m** | **Favourable as realised** — the ratio fell 160bps across FY2026 and a further 110bps across H1 FY27. No fee increase has occurred in any reported period |
| 5 | Impairment of capitalised software development costs and licences | **$55.0m** | **Adverse and live** — $43.6m charged in H1 FY27 across two consecutive quarters, against a $2,577.3m carried balance |
| — | *Recurrent consumer spending run-rate* | **$340.8m of Net Bookings** — a different metric; EBIT conversion not quantifiable (no content-level cost disclosure) | **Adverse as realised, guided to inflect up** — fell 9% in Q2 FY27 against guidance of −5%; guided flat for FY2027 and +12% YoY in Q3 FY27 |
| — | *US dollar against all currencies* | **$323.2m of GAAP net revenue** — a different metric; EBIT conversion not quantifiable (the company does not size its own stated cost offset) | **Stable** — the realised effect on revenue has been $9.9m or less in every disclosed period, against a disclosed ±$323.2m hypothetical bound |

**One thing the ranking makes plain.** On the metric that is actually comparable — FY2027 GAAP EBIT — the top variable is roughly **2.4 times** the second and roughly **4.5 times** the fifth. If the bear leg of row 1 runs at the fixed-cost bound instead of the variable-cost bound, it is **4.0 times** the second. This is not a portfolio of comparable risks; it is one variable with a tail of smaller ones.

---

## 4. The Single Highest-Sensitivity Variable

**The single variable that moves earnings most is the sell-through of Grand Theft Auto VI, measured as Q3 FY27 revenue against the guided $3,345m midpoint.** Its current direction is **unproven, not favourable or adverse**: the title launched on **2026-11-19 — the run date — so no reported period contains a single dollar of it** [3, MD&A (Product Release Schedule)]. It is **company-controlled in production and entirely outside company control in demand**: Take-Two sets the release date, the $80 launch price and the marketing spend, but not whether the units sell.

**The arithmetic of how much of the year rests on it, with the residual named.** The FY2027 guided Net Bookings step-up is $8,100m − $6,721.0m = **+$1,379.0m**. Decomposing it into the periods that produce it: H1 FY27 is **already reported at −$396.4m** ($2,987.2m vs $3,383.6m); Q3 FY27 is **guided at +$1,667.9m** ($3,425m vs $1,757.1m); the implied Q4 FY27 is **+$107.5m** ($8,100m − $2,987.2m − $3,425m = $1,687.8m, against $1,580.3m actual). Sum: −396.4 + 1,667.9 + 107.5 = **+$1,379.0m, residual $0.0m — the decomposition closes exactly** [5; 1, Item 7; 12]. So the guided launch quarter is **120.9%** of the whole year's guided growth: the other three quarters are guided to shrink by $288.9m in aggregate, and the launch quarter has to cover that as well as deliver the growth.

**What is *not* proven, and the qualifier must travel.** The step-up above is the **whole Q3 quarter**, not GTA VI alone. The company also guides Q3 recurrent spending **+12% YoY** and names PGA TOUR 2K27 and WWE 2K27 in the FY27 slate, and part of the guided recurrent-spending increase is the **GTA VI: Ultimate Edition add-on content** that the company allocates to recurrent spending [11, prepared remarks; 11, Q&A (Dessouky / Goldstein)]. **GTA VI's own share of the $1,667.9m is not disclosed anywhere in the pool, and no Q3 FY26 filing exists in the pool from which to derive the prior-year recurrent-spending base** [`01_historical-financials.md` §3]. That residual share is the finding, not a caveat: the engine can size the quarter, and cannot size the title inside it.

**What would need to happen for it to swing to the adverse case.** Three observable things, each with a date. (i) The **Q3 FY27 print on 2027-02-09**: GAAP revenue below the guided $3,270m floor, or cost of revenue above the guided $1,732m ceiling on revenue inside the range — the second would mean the straight-line amortisation floor is binding and the content asset is not earning its cost [5; 12]. (ii) An **impairment appearing inside cost of revenue** against the $2,577.3m balance, the mechanism that already produced $43.4m in Q1 FY27. (iii) **Recurrent spending missing the guided +12%** for Q3, which would say the launch-attached add-on content is not converting. Note what is already visible as disconfirming evidence on the other side of the ledger: management describes pre-orders as "tracking far in excess of our initial expectations" and "extraordinary", with **no pre-order count, no unit figure, no price and no attach rate anywhere in the pool**, and it declined to quantify the tie ratio embedded in guidance — "It really doesn't do anything for us, so we don't spend a lot of time on it" [11, prepared remarks; 11, Q&A (Crum / Zelnick)]. That is an input the engine cannot verify, and it is the input the entire top-ranked row turns on.

---

## 5. Interaction Effects

**Five of the seven variables move together, in the same direction, on the same event — and the compounding is mechanical, not a judgment.** A GTA VI sell-through shortfall (row 1) does four other things at once. First, it makes the **cost-of-revenue ratio** (row 2) worse rather than leaving it flat, because the amortisation of capitalised development is the **"greater of"** revenue-proportional or straight-line over 9–36 months — so when revenue does not arrive, the straight-line leg keeps charging [1, Note 1]. Second, it raises the odds of an **impairment** (row 5 in the ranking), because the recoverability test runs against the $2,577.3m balance and trips "when we determine that capitalized cost of the title is unlikely to be recovered by product sales" [1, Note 1]. Third, it hits **recurrent spending** on the same title, because the GTA VI: Ultimate Edition add-on content is allocated to recurrent spending and is the stated reason the GTA series' recurrent line is guided up [11, Q&A (Dessouky / Goldstein)]. Fourth, **stock-based compensation** does not fall with it: $96m of the FY2027 total lands in Q3 cost of revenue as the capitalised development costs containing it begin amortising on release, whether or not the units sell [5, Q3 FY27 outlook].

Three narrower links are worth naming. **Product costs (row 4 in the ranking) and recurrent spending** are linked because recurrent spending is mobile-weighted and the Apple/Google fee sits inside product costs — 91.0% of mobile revenue runs on those two platforms, so a mobile-led recurrent-spending mix raises the fee load at the same time [1, Item 7]. **Row 2's measured 117% offset and row 1 push against each other**: the offset was delivered by an operating-expense cut, while Q3 management-basis operating expenses are guided **+21% YoY** on GTA VI launch marketing — so the lever that absorbed the mix headwind is being pushed the other way in the quarter the launch risk lands [11, prepared remarks (Goldstein)]. **FX is the one row that is genuinely independent** of the release calendar, and it is also the smallest as realised.

---

## 6. Non-Linear Or Asymmetric Risks

**Four asymmetries, three of them adverse, each measurable.**

1. **The amortisation floor makes the downside coefficient up to twice the upside coefficient.** Row 1's published coefficient of **$0.4946 of EBIT per $1 of revenue** assumes cost of revenue is **fully variable**. It is not. Acquired-intangible amortisation is guided at a fixed **$572m** inside FY2027 cost of revenue, stock-based compensation at a fixed **$113m**, and the internally capitalised development amortisation runs at the **greater of** revenue-proportional or straight-line [5; 1, Note 1]. At the opposite bound — cost-of-revenue **dollars** held at the guided $1,690.5m — the coefficient is **$1.00 of EBIT per $1 of revenue**, so a −20% revenue move costs **−$669.0m** rather than −$330.9m. The truth sits between the two bounds and is not disclosed. **A 10% miss and a 10% beat are therefore not mirror images: the miss is worth between 1.0x and 2.0x the beat.**
2. **Impairment is a step, not a slope.** A title judged unrecoverable does not cost a proportion of its carried value — it writes down what the quarterly test says is unrecoverable, in one charge, in cost of revenue. The exposed base is large and growing: **$2,149.7m** of the non-current balance related to **titles that had not been released** at 2026-03-31, equal to **61.2%** of the $3,510.9m of total stockholders' equity at that date, up from $1,815.0m a year earlier [1, Note (Software Development Costs and Licenses); 1, Balance Sheets]. **The equivalent unreleased split at 2026-09-30 is not disclosed in the 10-Q** — only the $2,577.3m total is — so the current unreleased exposure is **Not assessable** and the FY2024 $109.9m move size in §2 was measured against a *smaller* unreleased base. That makes it a floor on the plausible bear, not a cap. Recoverability is one management estimate against an unobservable future, and the pool contains two realised charges inside two quarters.
3. **Operating deleverage is already measured, and it is roughly seven times the margin change it produced.** In Q2 FY27 the company took out **$257.3m of cost in one quarter** ($156.7m of cost of revenue and $100.6m of operating expenses) and still lost 232bps of EBIT margin, because revenue fell $276.8m: **−1,683bps of revenue-denominator drag against +1,450bps of cost relief** [`03_margin-drivers` §7a]. The same mechanism runs in reverse into Q3 FY27, which is why the guided EBIT margin swings from −7.8% actual to +14.4% guided on essentially the same cost base. **A business that can move 2,227bps of EBIT margin in one quarter on its own release calendar has no normalised quarter to anchor on.**
4. **Launch marketing is spent before sell-through is known.** Q3 management-basis operating expenses are guided **+21% YoY** "driven by GTA VI launch marketing" [11, prepared remarks (Goldstein)]. That spend is committed ahead of the units. A launch miss therefore carries the full marketing cost against the shortfall — which is the mechanical reason the bear case on row 1 cannot assume an operating-expense response in the same quarter.

**The one row with no asymmetry** is FX: the company discloses it as symmetric by construction (+4.0% of revenue on a 10% USD fall, −4.0% on a 10% rise) [1, Item 7A].

---

## 7. Earnings Volatility Score

### **78 / 100 — inverted score: higher = WORSE (more volatile, more sensitive to small input changes).**

**Reason, in one line:** on the comparable metric the top variable is 2.4x the second and can reach 4.0x it at the fixed-cost bound, the entire FY2027 guided step-up of $1,379.0m is covered by one quarter's guided $1,667.9m step-up for a title that had not shipped in any reported period, and the EBIT margin swings from −7.8% actual to +14.4% guided on the same cost base in consecutive quarters.

**Why 78 and not 85+.** The 81–100 band reads "earnings are dominated by external variables", and that label does not fit this company: the dominant variable is its **own release calendar**, which it controls in timing, price and spend — and FX, the only genuinely external variable with a published sensitivity, has moved revenue by $9.9m or less in every disclosed period. On magnitude alone the score would sit higher; on the band's own definition it belongs at the top of 61–80 ("High volatility — multiple variables with large impact"). Both halves of that judgment are stated rather than averaged.

**Confidence in this score: Medium, not High.** Only **one** of the seven coefficients is company-disclosed (the FX revenue sensitivity); the other six are derived from disclosed components and are labelled inference in §2. Under `MODULE_RULES.md` the "no sensitivity disclosures and only inferred sensitivities → confidence must be Low" cap does **not** bind, because a real company-disclosed sensitivity exists and is used — but six-of-seven inferred coefficients will not carry a High confidence either.

---

## 8. Computation Log (executed, not mental arithmetic)

Every coefficient, bull/bear impact, offset and ranking figure above was produced by an executed Python snippet. Inputs are the sourced figures cited in §2; the printed output is reproduced verbatim.

```python
rev27, cor27, opex27 = 8080.0, 3739.5, 4088.0          # FY27 guided GAAP midpoints [5]
ebit27 = rev27-cor27-opex27                             # = 252.5
q3r, q3c, q3o = 3345.0, 1690.5, 1172.0                  # Q3 FY27 guided GAAP midpoints [5]
k1 = 1 - q3c/q3r                                        # EBIT per $1 of Q3 revenue, CoR variable
r1, c1, o1 = 8000.0, 3598.0, 4160.0                     # the 2026-08-07 FY27 outlook midpoints [6]
rcs26 = 6721.0*0.78                                     # FY26 recurrent spending on bookings [1]
```

```
FY27 guided EBIT midpoint 252.5   margin 3.12%   CoR ratio 46.281%   GM 53.719%
FY26 GM 57.234%  ->  FY27 guided GM delta  -351.5 bps
Q3 guided EBIT 482.5  margin 14.42%  CoR ratio 50.538%  coefficient 0.494619 per $1 revenue
   rev +10% = +334.5m -> dEBIT +165.4 (var-CoR) / +334.5 (fixed-CoR) ; new Q3 margin 17.61%
   rev -10% = -334.5m -> dEBIT -165.4 (var-CoR) / -334.5 (fixed-CoR) ; new Q3 margin 10.53%
   rev -20% = -669.0m -> dEBIT -330.9 (var-CoR) / -669.0 (fixed-CoR) ; new Q3 margin  5.67%
FY27 guided implied GAAP tax rate 43.85% -> $0.296 of EPS per $100m of EBIT, 189.5m shares
   dEBIT +165.4 -> +$0.49 EPS ; -330.9 -> -$0.98 EPS ; -669.0 -> -$1.98 EPS
1bp of FY27 gross margin on 8080 = $0.808m of EBIT ; 130bps = 105.0 ; 351.4bps = 283.9
Two FY27 outlooks: GM 55.025% -> 53.719% = -130.6bps ; GP 4402.0 -> 4340.5 = -61.5
   opex 4160 -> 4088 = -72.0 ; EBIT 242.0 -> 252.5 = +10.5
   realised offset = 1 - (+10.5 / -61.5) = 117.1%  (= 72.0/61.5 = 117.1%)
FY26 recurrent spending on bookings 5242.4 = 64.7% of FY27 guided 8100 (ties to guided 65%)
   1pp = 52.42 of Net Bookings ; +4pp = +209.7 ; -9pp = -471.8
Impairment of sw dev & licences: FY24 109.9 / FY25 77.5 / FY26 (1.0) ; H1 FY27 43.6
   unreleased 2149.7 / stockholders' equity 3510.9 (both at 2026-03-31) = 61.2%
Product cost ratio FY24 14.1% / FY25 14.6% / FY26 13.0% ; H1 FY27 12.3% vs 13.4%
   bull -160bps = +129.3 EBIT ; bear +50bps = -40.4 EBIT
SBC FY23 317.8 / FY24 335.6 / FY25 324.0 / FY26 305.3 / TTM 344.7 ; FY27 guide 462.0
   guide vs FY26 +51.3% ; gap to TTM 117.3 ; observed spread 12.9% ; 13% of guide 60.1
FX: 1% USD = 0.40% of revenue = 32.32 of GAAP revenue ; 10% = 323.2
   realised: FY26 rev +9.9 / GP +45.4 / opex +31.2 -> EBIT +14.2 (amplification, not offset)
             Q2 FY27 rev -0.6 / GP -3.8 / opex -3.2 -> EBIT -0.6 -> measured offset 0.0%
             Q1 FY27 rev +0.6 / GP +1.7 / opex +2.7 -> EBIT -1.0 (sign flip)
FY27 guided bookings step-up 8100 - 6721.0 = +1379.0
   H1 realised -396.4 + Q3 guided +1667.9 + Q4 implied +107.5 = +1379.0  residual 0.0 OK
   Q3 step-up / FY step-up = 120.9%
Ranking, avg absolute FY27 GAAP EBIT impact:
   Q3 FY27 revenue 248.2 (417.3 at the fixed-CoR bear bound) > gross margin 105.0
   > stock-based comp 88.7 > product cost ratio 84.9 > content impairment 55.0
```

---

## 9. Citations

[1] FY2026 Form 10-K (fiscal year ended 2026-03-31), filed 2026-05-22 — Item 1 (Business — Sales and Marketing; customer concentration); Item 1A (platform-fee discretion; declines in consumer spending; console transitions); Item 7 (MD&A — Cost of revenue and gross profit, Product costs $863.8/13.0% vs $821.1/14.6%; Operating Expenses; Net Bookings $6,721.0m and the 78% recurrent-spending share; Online Content and Digital Distribution; realised FX effects +$9.9m net revenue, +$45.4m gross profit, +$31.2m total operating expenses); Item 7A (Interest Rate Risk — "no material interest rate risk exposure", no borrowings under the 2022 Credit Agreement; Foreign Currency Exchange Rate Risk — the ±4.0%-per-10%-USD sensitivity and the stated local-currency cost offset; Balance Sheet Hedging Activities); Note 1 (Basis of Presentation and Significant Accounting Policies — Software Development Costs and Licenses, the "greater of" amortisation policy, 9–36 month periods, impairment to cost of revenue); Note (Software Development Costs and Licenses — the $2,149.7m / $1,815.0m unreleased split and the amortisation-and-impairment table, FY2024 $109.9, FY2025 $77.5, FY2026 $(1.0)); Consolidated Balance Sheets (total stockholders' equity $3,510.9m at 2026-03-31); Consolidated Statements of Cash Flows p.66 (stock-based compensation $305.3m). `data/TTWO/10K_2025_26_0001628280-26-037434.pdf`
[2] FY2025 Form 10-K (fiscal year ended 2025-03-31) — Item 7 (MD&A — Cost of revenue, Product costs $756.6/14.1% for FY2024 and $821.1/14.6% for FY2025; realised FX effects). `data/TTWO/10K_2024_25_0001628280-25-026694.pdf`
[3] Q2 FY2027 Form 10-Q (quarter ended 2026-09-30) — Condensed Consolidated Balance Sheets p.2 (software development costs and licenses $82.4m current + $2,494.9m non-current = $2,577.3m; total stockholders' equity $3,673.6m); Statements of Operations p.3; Item 2 (MD&A — Product Release Schedule and the GTA VI launch date 2026-11-19; Results of Operations three and six months; Cost of revenue, Product costs $184.0/12.3% and $371.8/12.3%; the $43.6m of impairment within cost of revenue for the six months; Operating Expenses and the stock-based-compensation footnotes; realised FX effects −$0.6m net revenue, −$3.8m gross profit, −$3.2m operating expenses for the quarter and −$0.0m / −$2.1m / −$0.5m for the six months); Item 3 (Foreign Currency Exchange Rate Risk — the ±4.0% sensitivity restated; forward contracts $748.7m sell / $327.8m buy at 2026-09-30, not designated as hedging instruments). `data/TTWO/10Q_2Q_0001628280-26-072254.pdf`
[4] Q1 FY2027 Form 10-Q (quarter ended 2026-06-30) — Item 2 (realised FX effects +$0.6m net revenue, +$1.7m gross profit, +$2.7m total operating expenses); Item 3 (the ±4.0% sensitivity, measured on a quarter in which 40.0% of revenue was non-US; forward contracts $338.0m sell / $87.8m buy at 2026-06-30). `data/TTWO/10Q_1Q_0001628280-26-054870.pdf`
[5] TTWO Q2 FY2027 earnings release (Form 8-K Exhibit 99.1), dated 2026-11-09 — p.1 (Net Bookings $1,601.3m, −18%); p.2 (management-reporting adjustment table; 18% management tax rate; 188.0m share count); "Outlook for Fiscal Year 2027" (GAAP net revenue $7,980–8,180m; cost of revenue $3,679–3,800m; operating expenses $4,078–4,098m; income before income taxes $194–253m; net income $109–142m; diluted EPS $0.57–0.75; non-GAAP EBITDA $1,024–1,082m; Net Bookings $8,000–8,200m; capex ~$290m; the embedded $462m of stock-based compensation split $113m cost of revenue / $349m operating expenses; depreciation $165m; acquired-intangible amortisation $623m); "Fiscal Third Quarter Ending December 31, 2026" (Net Bookings $3,350–3,500m; GAAP net revenue $3,270–3,420m; cost of revenue $1,649–1,732m; operating expenses $1,162–1,182m; diluted EPS $1.30–1.44; the embedded $96m of stock-based compensation in Q3 cost of revenue); "Key assumptions and dependencies". `data/TTWO/TTWO 2Q27 Earnings Release FINAL.pdf`
[6] TTWO Q1 FY2027 earnings release (Form 8-K Exhibit 99.1), dated 2026-08-07 — p.3 (the prior FY2027 outlook: GAAP net revenue $7,900–8,100m; cost of revenue $3,538–3,658m; operating expenses $4,150–4,170m; diluted EPS $0.55–0.75); p.2 (the Q1 FY27 impairment on an abandoned third-party title). `data/TTWO/TTWO 1Q27 Earnings Release FINAL 8-6-2026.pdf`
[11] Take-Two Interactive Software, Inc., **Q2 FY2027 Earnings Call verbatim transcript**, 2026-11-09 (S&P Capital IQ; Presentation + Question and Answer) — prepared remarks (Zelnick: Q2 net bookings "slightly below our guidance range of $1.62 billion to $1.67 billion"; pre-orders "tracking far in excess of our initial expectations" and "extraordinary"; Goldstein: recurrent consumer spending "down 9% for the period compared to our guidance of a 5% decline, driven by NBA 2K"; Q3 net bookings "compared to $1.76 billion in the prior year"; Q3 recurrent spending +12%; FY27 recurrent spending flat at 65% of net bookings; Q3 management-basis operating expenses +21% YoY "driven by GTA VI launch marketing"); Q&A (Schoell / Goldstein on the full-year gross-margin drivers — "it's due to the mix of the business, and it's being offset by some changes in the operating expenses"; Crum / Zelnick on tie ratios — "It really doesn't do anything for us, so we don't spend a lot of time on it"; Dessouky / Goldstein on GTA VI: Ultimate Edition add-on content allocated to recurrent consumer spending; Song / Goldstein on Q4 operating expenses). `data/TTWO/Take-Two Interactive Software, Inc., Q2 2027 Earnings Call, Nov 09, 2026.rtf`
[12] Upstream: `analyses/TTWO_2026-11-19/earnings/04_guidance-consensus.md` — the FY2027 and Q3 FY2027 guidance tables and their midpoints, the proof that the Capital IQ "Revenue" field is on the Net Bookings basis and that "EPS Normalized" / "EBITDA" are management-basis, the Q3 FY2027 earnings-release date of 2027-02-09, the Q4 FY26 Net Bookings actual of $1,580.3m and the Q3 FY26 actual of $1,757.1m, the H1 FY27 Net Bookings stub of $2,987.2m vs $3,383.6m, and the four-quarter guidance-deviation record.

**Other upstream and cross-module inputs used:** `analyses/TTWO_2026-11-19/earnings/00_earnings-data-triage.md` (jurisdiction, reporting standard, currency, fiscal-year end, interim basis, the Net-Bookings-vs-GAAP basis warning); `…/01_historical-financials.md` (the FY2022–FY2026 annual and eight-quarter baselines, the TTM, the absence of any Q3 FY26 or Q4 FY26 filing in the pool, and the vendor-vs-filing gross-profit basis trap); `…/02_revenue-drivers.md` (the revenue driver table and its magnitude ratings; the GTA VI forward-sensitivity hypothesis on the Net Bookings basis; the four disclosed revenue cuts); `…/03_margin-drivers.md` (the cost stack, the margin walk, the Q2 FY27 bridge and its cost-dollar / denominator split, the $0.4946-per-$1 Q3 operating-leverage derivation, and the FY2027 guided margin table); `…/06_earnings-quality.md` (the TTM stock-based-compensation figure of $344.7m, the share-count series, and the cash-conversion read); business-model `10_external-dependency.md` (the external-variable register, the FX sensitivity with its two company-stated qualifiers, the hedge-book scope, and the cyclicality classification) and `06_value-chain.md` (the pass-through finding — 0% of revenue under a disclosed escalator, indexed-pricing or cost-plus clause — and the realised 160bps of product-cost absorption).

**Not used:** `Alphabet Inc NasdaqGS GOOGL Key Developments.xls` is a wrong-company pool contaminant (Alphabet Inc., not Take-Two) and is cited nowhere in this report.

---

## 10. Self-Check

- Seven variables selected and ranked — inside the 3–7 bound. Every one traces to a **High**-rated row in `02_revenue-drivers` §4 or `03_margin-drivers` §5, or to the only published sensitivity in the pool (FX); none is invented. Three candidate variables were considered and dropped with the reason stated: the deferred-revenue wedge (Low annually, 0.2% of guided revenue), discretionary consumer spending (no disclosed sensitivity; acts through rows 1 and 3) and interest rates (company states no material exposure, no borrowings drawn).
- Bull and bear move sizes are variable-specific and each states its place in the move-size hierarchy: company-disclosed (FX ±10.0%; the gross-margin guidance revision), historical observed range (recurrent-spending deviation 4pp; impairment $109.9m/$77.5m/$(1.0)m; product-cost ratio −160bps/+50bps; stock-based compensation ±12.9%), and labelled inference (row 1 only, where the pool bounds nothing).
- The one company-disclosed sensitivity in the pool is used, cited twice (10-K Item 7A and 10-Q Item 3), and is **not** relabelled: it is stated as a **revenue-line** coefficient, gross of the company's own unsized cost offset, and explicitly **not** position-inclusive — the hedge book covers balance-sheet items and its gains and losses land in *Interest and other, net*, below the revenue line. `disclosed_positions` was therefore rejected for this row and `zero_bound` used.
- Every row carries its "Mitigation assumed" value. Row 2 carries a **measured 117.1% realised offset with its arithmetic printed and its two qualifiers attached**, beside the zero-mitigation bound. Rows 1, 3, 4, 5 and 7 are labelled bounds with the reason the offset is not computable named in each case, and row 5's demonstrated response channel (−160bps in FY2026, −110bps in H1 FY27) is sized separately from the contractual fact. Row 6 is `not applicable` because the row is itself the response channel. **No row treats "no contractual pass-through" as a measurement of realised recovery.**
- Inferences are labelled: the row-1 coefficient, the fully-variable cost-of-revenue assumption, and the EPS conversion (which names the FY2027 guidance-implied GAAP tax rate of 43.85% it uses).
- Impact is in the correct unit and never mixed: FY2027 GAAP EBIT in USD millions for five rows, Net Bookings in USD millions for recurrent spending, GAAP net revenue in USD millions for FX. The two non-EBIT rows are excluded from the EBIT ranking and shown separately with the reason.
- The ranking table is sorted by absolute impact on the single comparable metric.
- The volatility score is flagged **inverted (higher = worse)** in its heading, and its confidence is stated as Medium with the reason (one of seven coefficients company-disclosed).
- `sensitivity_summary.json` emitted alongside this report for all seven rows, each carrying a clean per-unit coefficient. Recurrent consumer spending and FX carry their own `impact_metric` because their coefficients are on Net Bookings and GAAP net revenue, not on the EBIT base. No variable lacking a clean per-unit rate was given an invented coefficient.
- No banned phrases. No vendor-basis figure used as a coefficient.



---

## earnings / 08_earnings-red-flags.md

_Source: `08_earnings-red-flags.md`_

# Earnings Red Flags — TTWO

**All eight upstream earnings outputs were present and read in full** (`00`–`07`, plus the structured sidecar `sensitivity_summary.json`). No upstream output is missing, so no degraded-confidence note applies. The business-model module is available and was read (`03_segment-map.md`, `06_value-chain.md`, `10_external-dependency.md`, `12_red-flags-sweep.md`, `99_business-model-synthesis.md`), so the "business-model module not available" disclaimer does not apply anywhere below.

**Evidence binding.** Frozen supervisor-verified read mode. Every raw read resolved inside the single bound generation `.extract-generations/0af638492ecb0521db2676c79d75e6940c7227bb9f192567527b8a57eb43203d/`. The live logical path `data/TTWO/` was not read; it is a citation label only.

**Pool contaminant — checked, and NOT triggered.** `Alphabet Inc NasdaqGS GOOGL Key Developments.xls` is Alphabet Inc. data, not Take-Two's. I checked all eight upstream outputs: seven carry an explicit "not used" exclusion note and **none cites it as TTWO evidence anywhere.** `04_guidance-consensus` is the only report that does not print the exclusion note, but it cites only the Capital IQ Estimates export, the company releases and the transcript, so no contamination occurred. No §20 bad-source error exists in this module.

**One scope note.** This report tests the upstream setup. It produces no valuation, no rating, no scenarios and no price target. Where I recommend a cap or a verdict, it is a recommendation to `99_earnings-synthesis`, which owns the decision.

---

## 1. Upstream Evidence Map

### Bullish Evidence

| Source Agent | Claim | Evidence | Confidence |
|---|---|---|---|
| `04_guidance-consensus` | Q3 FY27 Net Bookings guided $3,350–3,500m against $1,757.1m a year earlier — roughly a doubling, guided component by component (revenue, cost of revenue, operating expenses each with a range) | [`04_guidance-consensus` output, §2.2, citing `TTWO 2Q27 Earnings Release, 2026-11-09, "Fiscal Third Quarter Ending December 31, 2026"`] | High (the guidance exists; the outcome does not) |
| `03_margin-drivers` | Operating leverage reverses hard into Q3 FY27: the same near-fixed $1,172m of operating expenses against roughly doubled revenue takes the ratio from 65.3% to 35.0%, worth about +2,227bps of EBIT margin | [`03_margin-drivers` output, §3.3 and §7a] | High on the arithmetic, conditional on the revenue |
| `03_margin-drivers` | Cost discipline is real and measured: $257.3m of cost taken out in one quarter ($156.7m cost of revenue, $100.6m operating expenses) | [`03_margin-drivers` output, §7a, from `Q2 FY27 10-Q, Item 2`] | High |
| `03_margin-drivers` / `07_earnings-sensitivity` | A measured offset exists: between the two FY2027 outlooks, guided gross profit fell $61.5m while guided operating expenses were cut $72.0m, so guided EBIT **rose** $10.5m | [`07_earnings-sensitivity` output, §2 row 2] | Medium — and see flag 2 below: this is guidance-to-guidance, not realised |
| `06_earnings-quality` | Disclosure is unusually complete: the company publishes the full line-by-line build of both non-GAAP and management-reporting measures, and the vendor's "EBITDA" / "EPS Normalized" fields reconcile to the cent on two consecutive quarters | [`06_earnings-quality` output, §9; `04_guidance-consensus` output, §0 bridges] | High |
| `06_earnings-quality` | No audit or policy red flag: Ernst & Young, unqualified, continuously since at least FY2017; no restatement; the $215.0m receivables-purchase facility was **not used** in FY2026 or H1 FY27 | [`06_earnings-quality` output, §6 and §8, citing `FY26 10-K, Note 1`; `Q2 FY27 10-Q, Note 3`] | High |
| `06_earnings-quality` | Receivable days improved 29 days year on year (73.4 → 44.5) | [`06_earnings-quality` output, §3] | Medium (prior-year leg is a tier-5 vendor balance) |
| `04_guidance-consensus` | Four consecutive management-basis EBITDA and EPS beats; FY27 GAAP revenue guidance was **raised** and FY27 operating-expense guidance **cut** at the Q2 print | [`04_guidance-consensus` output, §6 and §2.1] | Medium (four observations, one derived) |

### Bearish Evidence

| Source Agent | Claim | Evidence | Confidence |
|---|---|---|---|
| `01_historical-financials` | Q2 FY27 GAAP revenue fell 15.6% to $1,497.0m — the lowest of eight quarters; TTM revenue growth only +3.1% against FY2026's +18.2% | [`01_historical-financials` output, §3 and §6] | High |
| `01_historical-financials` | TTM FCF fell to $62.6m from $181.0m (−65.4%); strict-basis net debt rose from $972.5m to $1,370.4m (1.89x) | [`01_historical-financials` output, §2, citing `Q2 FY27 10-Q, Note 10 (Debt)`] | High on the figures; see flag 10 on the basis |
| `04_guidance-consensus` | The company **missed its own Q2 Net Bookings guidance** — $1,601.3m vs $1,620–1,670m — and missed its own RCS assumption by 4pp (−9% actual vs −5% guided) | [`04_guidance-consensus` output, §2.4, citing `TTWO 2Q27 Earnings Release, p.1`] | High |
| `04_guidance-consensus` | FY2027 consensus Net Bookings of 8,554.7 sits +4.3% above the **top** of the reiterated $8,000–8,200m range; the lowest of 20 estimates (8,112) is above the guidance midpoint | [`04_guidance-consensus` output, §3.1, from `Capital IQ Estimates export, Consensus tab, data as of 2026-11-19`] | High |
| `04_guidance-consensus` | FY2027 Net Bookings revision **breadth is negative (6↑/9↓)** while the mean level crept up only +0.4%; FY2028 revenue, EPS and EBITDA all cut last month | [`04_guidance-consensus` output, §4 and §5] | High |
| `05_beat-miss-setup` | Reiterating FY2027 at the February print mechanically implies a Q4 of 1,687.8 against the Street's own 1,950.67 — a 13.5% guide-down with no operational disappointment required | [`05_beat-miss-setup` output, §5] | High (arithmetic) |
| `03_margin-drivers` | FY2027 gross margin guided to 53.7% from 57.2% (−351bps); Q3 FY27 guided 49.5%, about 801bps below Q2 FY27 | [`03_margin-drivers` output, §3.3] | High |
| `06_earnings-quality` | Earnings quality 48/100. CFO/EBITDA 38.4% / 0.2% / −3.7% / −11.9% / 79.2% / 50.6% across FY2022–TTM; negative FCF in three of five years; `RF-EQ-001` and `RF-EQ-002` both emitted | [`06_earnings-quality` output, §1, §2, §6, §9] | High |
| `06_earnings-quality` | $2,149.7m of capitalised development cost sat on **unreleased** titles at 2026-03-31 — 91.6% of the balance and 61% of equity — recoverable only against one management estimate | [`06_earnings-quality` output, §6 and §10, citing `FY26 10-K, Note 7`] | High |
| `07_earnings-sensitivity` | Earnings volatility 78/100 (inverted — higher = worse). The top variable is 2.4x the second on the comparable metric, and up to 4.0x at the fixed-cost bound | [`07_earnings-sensitivity` output, §3 and §7] | Medium stated; see flag 3 |
| `05_beat-miss-setup` | Setup favors miss: Q3 consensus 3,573.61 is +2.1% above the top of guidance, so the company must beat its own guidance to merely meet the Street | [`05_beat-miss-setup` output, §8] | High on the arithmetic, Low on the outcome |

### Missing Evidence

| What Is Missing | Which Agent Flagged It | Impact On Setup |
|---|---|---|
| Any GTA VI sell-through, preorder count, unit figure, price-times-volume build or attach rate — and **no comparable launch quarter anywhere in the pool** (vendor quarterly history starts Jun-2016; GTA V launched Sep-2013) | `02` §7, `04` §7, `05` §1 and §8, `06` §10, `07` §4 — all five | **Binding.** The single biggest revenue driver, the single biggest margin driver and the top-ranked sensitivity are all the same unmeasurable variable |
| The **unreleased-title split of the $2,577.3m balance at 2026-09-30** — the 10-Q discloses only the total. I verified this independently: the Q2 FY27 10-Q text contains no "unreleased" / "not yet released" disclosure at all | `06` §6 and §10; `07` §6 item 2 | Prevents sizing the current impairment exposure. The FY2024 $109.9m bear move was measured against a *smaller* unreleased base ($1,815.0m), so it is a floor, not a cap |
| No in-quarter alternative-data / sell-through panel (no `external/` folder in the pool) | `04` §3A; `05` §1 | The one evidence type that would settle the setup is absent |
| No company-defined full-year FY2026 EBITDA (no Q4 FY26 release admitted) | `01` §4; `03` §3.2 | FY27 guided company-defined EBITDA cannot be compared like-for-like to a FY26 company-defined actual — see flag 11 |
| No Q3 FY26 or Q4 FY26 filing; both quarters are vendor-constructed | `01` §3; `05` §7 | The four-quarter surprise sample contains one derived period; no FY26 quarterly content split exists, so the FY27 "RCS flat" guide cannot be tested — see flag 17 |
| Units, price, ASP, ARPU, players/MAU/DAU, attach ratio — three of seven sector KPIs absent; management explicitly declined the tie ratio | `02` §3a and §3 | No bottom-up revenue build is possible; the decomposition is a title-level dollar bridge only |
| DEF 14A payload empty (one cell) | `00` §5 | A management-governance input, not an earnings one. No earnings impact |

### Contradictions Between Agents

| Agent A | Agent A Says | Agent B | Agent B Says | Reconcilable? (Y/N) | Which Is More Credible |
|---|---|---|---|---|---|
| `03_margin-drivers` §9 | "On the evidence available today the **demand sign dominates**", and the Q3 guide "is a **firm company commitment** made ten days before launch, not a hope" | `05_beat-miss-setup` §8 / `07_earnings-sensitivity` §4 | The launch is "**unproven**"; the setup "favors miss"; "no reported period contains a single dollar of it" | **Y, but only by stripping an adjective.** Both read the same guidance; `03` converts a forecast into a commitment | **`05`/`07`.** Guidance is a management forward statement the company itself warns "may not foot to the totals" and which it **missed last quarter**. Calling it a firm commitment is a §3 hardening. See flag 4 |
| `01_historical-financials` §2 and §6 | TTM FCF **$62.6m vs $181.0m, −65.4%**; no mention of the London building | `06_earnings-quality` §1 | Normalised operating FCF **up to $154.4m** excluding the $91.8m one-off London purchase — "still below the $181.0m of the prior twelve months" | **Y — same metric, different normalisation.** Both numbers are right | **`06`.** It names the one-off, shows the ceiling ("up to"), and keeps the honest residual. `01`'s figure is not wrong but the qualifier did not travel. See flag 10 |
| `06_earnings-quality` §10 | The $2,149.7m unreleased balance (61% of equity) is "the single biggest quality concern" — "one unverifiable management estimate" | `03_margin-drivers` §5 driver 2 and §8 | The same asset's release-timed amortisation is "the single biggest margin driver"; guided −351bps already in the plan | **Y — different objects: a balance-sheet stock vs a P&L flow.** Not a double count | **Both, in their own frame.** The gap is that neither reconciles to the other, and `07` ranks the incremental impairment *last* — see flag 8 |
| `04_guidance-consensus` §5 | FY2027 Net Bookings breadth negative (6↑/9↓) while the mean rose — "the cuts came from smaller-revenue models and the raises from larger ones" | — | — | Breadth counts cannot identify which models moved | The direction (negative breadth, rising mean) is proven; the **composition claim is an unlabelled inference.** See flag 14 |
| `03_margin-drivers` §9 | Deferred revenue "$1,017.1m current plus $25.0m non-current at 2026-09-30 … fell from $1,159.9m at 2026-03-31, a $147.3m six-month outflow" | `02` §2 / `06` §6 | Total deferred revenue $1,189.6m → $1,042.1m | **Y.** I verified both from the filing: current $1,017.1 vs $1,159.9; total $1,042.1 vs $1,189.6 [`Q2 FY27 10-Q, Balance Sheets p.2 and Note 3`] | **`02`/`06`.** `03` compares a current-only prior balance to a total-basis change. See flag 13 |

---

## 2. Red-Flag Scan — Category By Category

### 2.1 Data Completeness

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| **The primary driver of the next 3–12 months has zero reported history and no in-pool base rate** — GTA VI launched 2026-11-19, the run date; no preorder count, unit figure, price-times-volume build or attach rate exists; no comparable launch quarter is in the pool (vendor quarterly history starts Jun-2016, GTA V launched Sep-2013); no alt-data panel exists | **Triggered** | **Critical** | **High** | [`02_revenue-drivers` output, §7]; [`05_beat-miss-setup` output, §1 and §8]; [`07_earnings-sensitivity` output, §4]; [`04_guidance-consensus` output, §3A]; management declined the tie ratio — "It really doesn't do anything for us" [`Q2 FY2027 Earnings Call transcript, 2026-11-09, Q&A (Crum / Zelnick)`] | **Caps the verdict.** The module can measure the bar and the realised trough; it cannot measure the variable that decides the print. No directional 3–12 month verdict is supportable beyond **Mixed earnings setup** |
| Current unreleased-title split of the $2,577.3m capitalised balance not disclosed | **Unavailable** | High | — | Verified independently: the Q2 FY27 10-Q contains no "unreleased"/"not yet released" text. Only the FY2026 figure exists: $2,149.7m [`FY26 10-K, Note 7`] | Prevents sizing today's impairment exposure; makes the $109.9m bear move a floor, not a cap |
| No company-defined full-year FY2026 EBITDA (no Q4 FY26 release in the pool) | **Unavailable** | Medium | — | [`01_historical-financials` output, §4]; [`03_margin-drivers` output, §3.2] | FY27 guided company-defined EBITDA has no like-for-like FY26 actual — see 2.4 |
| No Q3 FY26 / Q4 FY26 filing; both quarters vendor-constructed; one of the four surprise observations is derived | **Triggered** | Low | High | [`01_historical-financials` output, §3]; [`05_beat-miss-setup` output, §7] | Named and weighted Low by `05` already. No further action beyond carrying the label |
| Stale financials / stale consensus | **Not triggered** | — | — | Q2 FY27 10-Q 1.6 months old; verbatim transcript 0.3 months; consensus export data-as-of 2026-11-19 with revision events to 2026-11-18, **after** the 2026-11-09 print [`00_earnings-data-triage` output, §2] | No staleness haircut. Do not apply one |
| Missing consensus / revision history / cash flow / segment P&L / current price / transcript | **Not triggered** | — | — | All ten usability rows resolve Y [`00_earnings-data-triage` output, §3]. Single reportable segment is a disclosure fact, not a gap [`FY26 10-K, Note 21`] | **No `MODULE_RULES` data cap binds.** Do not borrow an absent-data cap |
| Wrong-company contaminant cited as TTWO evidence | **Not triggered** | — | — | Checked all eight outputs: seven print the exclusion note, none cites the file | No §20 bad-source error |
| Capital IQ data used without filing backup | **Not triggered** | — | — | Vendor use is confined to lines the filings do not disclose (EBITDA, FY2022, Q3/Q4 FY26, the 2025-09-30 receivable balance) and is labelled in every case [`01` §1 note; `03` §11 note [9]; `06` §11 note [9]] | Hygiene is good; two specific vendor-leg items are flagged at Low in 2.7 and 2.9 |

### 2.2 Historical Trend

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| **Reported TTM free cash flow is quoted two ways across the module without the normalisation qualifier travelling** — `01` leads with $62.6m (−65.4% YoY) and never mentions the $91.8m one-off London building; `06` leads with normalised "up to $154.4m" (−14.7% YoY). A synthesis quoting `01` alone overstates the cash deterioration by a factor of roughly four | **Triggered** | **Medium** | High | [`01_historical-financials` output, §2 and §6] vs [`06_earnings-quality` output, §1 "Lead figure"], both resting on `Q2 FY27 10-Q, Note 15 (Asset Acquisition)` and `Statements of Cash Flows p.5` | Carry **both** figures with their bases. The honest statement is: FCF fell on any basis; the fall is −65.4% reported and up to −14.7% normalised, and the $91.8m cash element is not separately disclosed so $154.4m is a ceiling |
| Revenue growth slowing while the setup says acceleration | **Not triggered** | — | — | `01` §6 states both periods explicitly and refuses to collapse them: "decelerating" over two quarters, "accelerating" over five years, "Both statements are true on their own period" | Correctly handled. The synthesis must keep both |
| EBITDA improving while EBIT/EPS worsen | **Not triggered** | — | — | `01` §1 labels the EBIT and EPS rows "Volatile" against "Inflecting" EBITDA and names the cause: $2,342.1m and $3,545.2m of non-cash goodwill impairment [`FY26 10-K, p.64`] | Correctly handled |
| One quarter driving most of the improvement | **Triggered** | Low | High | FY2026's +288bps gross-margin gain is attributed by the filing to "lower amortization of intangible assets primarily due to higher impairments in the prior year" — a base effect, labelled as such [`03_margin-drivers` output, §1b] | Already labelled non-run-rate. No action |
| Seasonality ignored | **Not triggered** | — | — | `01` §5 and `05` §6 both find almost no GAAP revenue seasonality (3pp spread) and state why — the deferral of recurrent billings — while showing a 19.6pp EBITDA-margin spread | Correctly handled, and the finding (no seasonal lift to lean on) is the right one |
| TTM trend contradicts annual trend | **Triggered** | Low | High | TTM revenue +3.1% vs FY2026's +18.2% [`01` §2 and §6] | Named upstream. Carry it |

### 2.3 Revenue

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| **Platform-agreement renewal and termination exposure on 41.4% of revenue is absent from the entire earnings module** — the Sony agreement "expires on March 31, 2027" (the last day of FY2027) with automatic one-year renewals, and "Sony may terminate the agreement for any or no reason upon 30 days' notice"; the current-generation Xbox licence was **replaced** effective 2026-09-17 by an agreement whose Initial Term, Renewal Term, notice window and Royalty Percentage are all redacted `[***]`, and which lets Microsoft terminate "without cost or penalty on a Game-by-Game or country-by-country basis". GTA VI launches console-only | **Triggered** | **High** | **Low** | [`FY26 10-K, Item 1 — Arrangements with Platform Manufacturers, pp.3–4`] (verified verbatim in the frozen extract); [business-model `12_red-flags-sweep` output, §1 correction and §2 row 2, citing `Q2 FY27 10-Q, Exhibit 10.1, §17.1, §17.2, §18.10`]; console 41.4% of H1 FY27 revenue [`Q2 FY27 10-Q, MD&A p.23`]. `02_revenue-drivers` §4 lists platform gatekeepers as "High tail, zero realised" but names **no** expiry date, renewal mechanism or termination right | A low-probability, high-impact item the earnings module does not carry at all. It matters most for the FY2028 read `05` §9 already calls weakest. The business-model module found it; the earnings module must not re-lose it. Note the softener that must travel: the Sony expiry carries **automatic one-year renewal**, so it is a renegotiation and termination-right exposure, not a cliff |
| **The FY2027 "recurrent consumer spending flat" guide cannot be tested** against the realised −9% in Q2 FY27 and the guided +12% in Q3 FY27, because no FY2026 quarterly content split exists in the pool (no Q3 FY26 10-Q, no Q4 FY26 release). No agent attempted the implied-H2 arithmetic | **Unclear** | Medium | Unknown | Realised and guided figures: [`04_guidance-consensus` output, §2.1, §2.2, §2.4]; the absent quarterly content split: [`01_historical-financials` output, §3] | A 21-percentage-point one-quarter swing (`05` M2) is being underwritten on a full-year assumption whose quarterly build is not disclosed. State it as untestable; do not estimate it |
| Growth driven by price, FX or acquisition but described as organic demand | **Not triggered** | — | — | `02` §3 separates them explicitly: FY2023's +52.6% was the Zynga acquisition, FY2026's +18.2% was own-title performance, FX has never been more than ±0.2pp of annual growth, and price is "Not disclosed — 0.00pp assignable" | Correctly handled. This is the cleanest part of the module |
| Volume weak but pricing hides it | **Not triggered** | — | — | No ASP/ARPU disclosure exists and `02` §6a refuses to invent a price/volume split | Correct refusal |
| Customer concentration | **Triggered** | Medium | High | Five largest customers 80.6% of FY26 net revenue, with Apple, Sony, Google and Microsoft each above 10.0% [`FY26 10-K, Item 1`, via `02` §4] | Disclosed and carried by `02`. The *receivable* leg (five customers 69.6% of gross receivables, no collateral, insurance only on the 3% physical channel) sits in business-model `12` and is not in the earnings module — relevant to the launch-quarter cash conversion `05` row 4 tests |
| Pull-forward / non-run-rate risk | **Not triggered** | — | — | `02` §3b labels three items non-run-rate: the launch itself, the launch-attached Ultimate Edition add-on inside RCS, and the FY26 base's own Color Block Jam launch-year effect | Correctly handled and explicitly stated twice |
| Backlog conversion slowing | **Triggered** | Medium | High | Total deferred revenue $1,268.1m (2025-09-30) → $1,042.1m (2026-09-30), −17.8%; deferred-revenue days 71.8 → 65.2 → 59.3 [`06_earnings-quality` output, §6]; unsatisfied performance obligations $1,492.5m with **no prior-period comparative** in the 10-Q [`02` §4] | The nearest thing to a forward book is shrinking and its direction cannot be cross-checked on the UPO measure. Carried by `05` M2 |
| Market growth mistaken for share gain | **Not triggered** | — | — | `02` §3 scores market share 30/100 and says plainly: "Unknown — not disclosed. No market-share figure, industry-size figure, or share series exists anywhere in the pool" | Correct |

### 2.4 Margins

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| **The same $2,577.3m content asset is sized three different ways and the one number that would reconcile them is undisclosed.** `03` calls its release-timed amortisation the single biggest **margin** driver (guided −351bps); `06` calls the $2,149.7m unreleased portion (61% of equity) the single biggest **quality** concern; `07` ranks the incremental impairment **fifth and last** at $55.0m average. Judgment: the impairment risk is **under-counted, not double-counted** — the three are a flow, a stock and an incremental charge, and guidance embeds the first but explicitly allows nothing for the third | **Triggered** | **Medium** | **High** | [`03_margin-drivers` output, §5 driver 2, §5 driver 10, §8]; [`06_earnings-quality` output, §6 and §10]; [`07_earnings-sensitivity` output, §2 row 4 and §3]; `sensitivity_summary.json` → `content_impairment_to_cost_of_revenue.non_linearity` ("a floor on the plausible bear, not a cap") | Do not net these three against each other and do not add them. The actionable point: `07`'s own text says the $109.9m bear is a **floor** measured against a smaller base ($1,815.0m unreleased at FY2025 vs $2,149.7m at FY2026, against a $2,577.3m total now), yet its ranking table presents it as the smallest EBIT risk. The ranking communicates the opposite of the text |
| **`03` attaches the whole $2,577.3m balance's amortisation start to one title's release** — "the balance starts amortising as GTA VI releases" — when the balance covers many titles and GTA VI's own component is disclosed nowhere | **Triggered** | **Low** | High | [`03_margin-drivers` output, §5 driver 2]; the 10-Q discloses only $82.4m current + $2,494.9m non-current [`Q2 FY27 10-Q, Balance Sheets p.2`] | §15 aggregate-travels-with-its-build. The claim should read: the portion of the balance attributable to titles releasing in FY2027 begins amortising — size not disclosed |
| **A vendor-basis EBITDA margin history sits beside a company-defined guided EBITDA margin in adjacent tables with no comparability caveat** — `03` §3.2 shows FY2026 11.8%ᵛ / FY2025 6.7%ᵛ (vendor), `03` §3.3 shows FY2027 guided 13.0% (company-defined). A reader could take +120bps of expansion off two different measures | **Triggered** | **Medium** | Medium | [`03_margin-drivers` output, §3.2 and §3.3]; `03` states "No company-defined full-year EBITDA for FY2026 exists in this pool" but never says the two rows are therefore not comparable | Any FY26→FY27 EBITDA-margin trend statement must be refused or re-based. The company-defined and vendor measures differ (the vendor adds back goodwill impairment; the company's excludes impairment of **acquired** intangibles) |
| Gross margin improving for the wrong reason | **Not triggered** | — | — | `03` §1b labels it outright: "Q2 FY27's +220bps gross-margin improvement is release-timing, not cost control … It reverses when a title ships", quoting the filing's own cause [`Q2 FY27 10-Q, Item 2`] | Correctly handled, and stated as "the opposite of good news" |
| EBITDA improves while gross margin weakens / EBIT not improving | **Not triggered** | — | — | `03` §7 and §7a print the full bridge: gross margin +220bps, operating-expense ratio −452bps, EBIT −232bps, **0bps residual**, with the cost-dollar (+1,450bps) and denominator (−1,683bps) split separated and reconciled | This is the best-evidenced section in the module |
| Vendor-vs-filing margin basis trap | **Not triggered** | — | — | Caught and corrected upstream: the widely-quoted "Q1→Q2 gross margin fell 290bps" is a vendor artefact; on the filing basis it was 57.5% → 57.5%, flat [`01` §3; `03` §1 rule 1] | A real trap, correctly defused. Credit, not a flag |
| SG&A cuts appear temporary | **Triggered** | Medium | High | S&M dollars fell $91.8m on lower Borderlands marketing, and management said the favourability was partly "due to timing"; Q3 management-basis operating expenses are guided **+21% YoY** on launch marketing, Q4 implied up ~10% on R&D [`03` §5 drivers 6–7; `Q2 FY2027 Earnings Call transcript, 2026-11-09, prepared remarks and Q&A (Smilek / Goldstein; Song / Goldstein)`] | Carried by `05` M4. The saving is deferred into the quarter that carries the risk |
| Low-margin segment growing faster | **Not triggered** | — | — | Mobile (the stated lower-gross-margin platform) is guided **down** for FY2027, and its share fell 52.2% → 50.1% across FY2026 [`03` §6] | Direction is favourable, not adverse |

### 2.5 Guidance / Consensus

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| **The mechanism that could close the module's largest consensus gap is named nowhere in the earnings module.** FY2027 GAAP-EPS consensus of $1.91 is ~2.9x the guided $0.66 midpoint (+189%). `04` locates the gap "below the EBITDA line, in tax and non-operating items" and calls it lowest-quality, and `05` rightly refuses to set a GAAP-EPS bar. Neither names **what** sits there: the company has written down **$1,262.3m of $1,454.8m of gross deferred tax assets (86.8%)** on its own "cumulative loss position", printed a **(50.8)% effective rate** in FY2026 (a $100.4m tax charge on a pre-tax loss), and completed a **November-2026 intangible-asset reorganisation** whose effect it is "still evaluating" | **Triggered** | **High** | **Medium** | [`04_guidance-consensus` output, §3.1 and §3.2]; [`05_beat-miss-setup` output, §4 GAAP-EPS row]; valuation allowance, (50.8)% rate and the $113.4m / $18.2m build verified verbatim in [`FY26 10-K, Note 17 (Income Taxes)` and `MD&A — Provision for income taxes, p.46–47`]; [`Q2 FY27 10-Q, Note 16 (Subsequent Events)`]; [business-model `12_red-flags-sweep` output, §2 row 1 and §3] | **Cuts both ways and must be stated as such.** A valuation-allowance release after a successful launch would drop a very large **non-cash** credit into GAAP EPS — closing the +189% gap for a reason that is not operating performance. The same line produced a tax charge on a pre-tax loss in FY2026. Consequence: a large GAAP-EPS "beat" would be uninformative, and "guidance far below the Street" must not be read as proof of a high operating bar |
| **Consensus level and consensus trend point opposite ways, and only the level is in the verdict.** `04` concludes "Bar is high" from the level (consensus above the top of guidance) while its own §4 shows FY2027 EPS Normalized **−13.3% vs six months ago** (7.95 → 6.89), FY2027 GAAP EPS **−46.8%** (3.59 → 1.91), and FY2027 management-basis EBITDA cut 4.1% over three months | **Triggered** | Medium | High | [`04_guidance-consensus` output, §4 and §7] | Estimates being cut by 13–47% over six months usually **de-risks** a bar. `04` does print both and calls direction "mixed, and honestly so" — but the one-line verdict carries only the level. The synthesis should score consensus setup from both, not from the level alone |
| Revision breadth negative while the mean creeps up — a genuine consensus trap | **Triggered** | Medium | High | FY2027 Net Bookings breadth **6↑/9↓ (−3)** with the mean +0.4% over three months; FQ3 breadth +8/+10/+7 against FQ4 −8/−8/−7 [`04_guidance-consensus` output, §5]; reconciled to `ciq_facts.json` ("Revenue FY 2027: 6↑/9↓ last mo") | Correctly identified by `04` as "redistributing the same annual number across quarters rather than taking the year up", and converted by `05` §5 into the sharpest risk in the setup (an in-line print plus a mechanical 13.5% Q4 guide-down). Carry it as the single most actionable consensus finding |
| **`04` reproduces the sell-side recommendation distribution** ("recommendation Buy 1.21 — 25 Buy / 3 Outperform / 0 Hold / 1 Underperform / 0 Sell") despite the `MODULE_RULES` / §24 instruction to drop and never carry forward the analyst rating | **Triggered** | Medium | Medium | [`04_guidance-consensus` output, §1, with its own note "not ingested, not carried forward … recorded here only to show how many analysts are in the panel"] | The label is honest and the figures are used nowhere. The residual risk is that a 25-Buy skew is on the page and can colour a downstream read. **The synthesis must not restate it.** Analyst *count* (29) is the legitimate field |
| **FY-level and quarter-level consensus means come from different analyst panels and the Q4 arithmetic mixes them** — FY2027 revenue 20 of 29 contributors, FQ3 17 of 22, FQ4 15 analysts. The headline "Street Q4 1,950.67 vs guidance-implied 1,687.8" subtracts a reported H1 from one panel's annual mean and compares it to another panel's quarterly mean | **Triggered** | **Low** | Medium | [`04_guidance-consensus` output, §1, §3.1, §5]; [`05_beat-miss-setup` output, §4 guidance row and §5]. I cross-checked the panels for consistency: FQ3 3,573.61 + FQ4 1,950.67 + H1 actual 2,987.2 = 8,511.5 against the annual mean of 8,554.69 — a **$43.2m (0.5%) gap**, verified in `Capital IQ Estimates export, Consensus tab, lines 108 and 449` | Small in size, but the basis must be labelled every time the 13.5% figure is quoted (§15 matched basis). The conclusion survives: the panels are consistent to within 0.5% |
| Consensus stale / absent / no revision history | **Not triggered** | — | — | [`00` §2 and §5; `04` §1 and §7] | No `MODULE_RULES` cap binds. Do not apply the max-30 or max-60 caps |
| Company beat the quarter but guides down | **Not triggered** (worse: it **missed**) | — | — | Q2 FY27 Net Bookings $1,601.3m vs its own $1,620–1,670m, below the low end by $18.7m [`TTWO 2Q27 Earnings Release, 2026-11-09, p.1`] | The first guidance miss in the four-quarter set. Carried by `04` §2.4 and `05` §1 |
| Management guidance vague | **Not triggered** | — | — | Guidance is component-by-component on both bases, with named assumptions and an explicit footing warning [`04` §2.1–2.3] | Unusually specific. Credit |

### 2.6 Beat / Miss Setup

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| Beat case requires more things to go right than the miss case | **Triggered** | Medium | High | `05` §2 B1 needs a beat of the company's own midpoint by +4.34% merely to meet consensus and +9.56% for a material beat; `05` §3 M1 needs only that the company **deliver** its guidance — "it has to merely deliver it" [`05_beat-miss-setup` output, §2 and §3] | This is the correct and well-evidenced core of the setup. The asymmetry is arithmetic, not framing. **But see the Critical flag**: the asymmetry is measured against guidance, and guidance itself was set before any sell-through existed, so the asymmetry does not establish the *outcome* |
| Historical beat pattern weak, derived, or regime-shifted | **Triggered** | Medium | High | Four observations, one derived (Q4 FY26 has no filing); beat magnitude collapsing +48.2% → +42.9% → +6.1% → +3.1%; full-year GAAP-EPS surprise 0% in each of FY2023–FY2026 [`04` §6; `05` §7] | `05` weights it **Low** and says why in three stated reasons, including regime change. Correctly handled — do not let the synthesis upgrade it |
| Setup depends on a guidance raise, not just a current-quarter beat | **Triggered** | **High** (carried, not new) | High | Reiterating FY2027 mechanically implies a Q4 of 1,687.8 vs the Street's 1,950.67 — a 13.5% guide-down with no operational disappointment required [`05_beat-miss-setup` output, §5] | The most actionable single line in the module. It is testable on 2027-02-09 and requires no forecast |
| Material-beat threshold too high / thresholds that cannot fail | **Not triggered** | — | — | `05` §4 states, for every threshold, the like-for-like prior-year comparable, the implication for the unreported stub, and what it would have done on the last two reported periods — and shows both lines firing and not firing inside the sample (§17 compliance) | Thresholds are capable of failing. This is done properly |
| Consensus unavailable, making the call unreliable | **Not triggered** | — | — | [`05` §15 note; `04` §7] | The "cap at Unclear" rule does not trigger |
| GAAP-EPS bar set on a nine-contributor panel with a 5x spread | **Not triggered** | — | — | `05` §4 **refuses** to set a GAAP-EPS threshold and states the refusal with three reasons | Correct refusal — and see 2.5 flag 1 for the mechanism `05` could not name |

### 2.7 Earnings Quality / Accounting

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| **`RF-EQ-002` (cash-conversion breakdown) is a `CLAUDE.md` §13 standardized escalation trigger and must not be absorbed into the 48/100 score.** CFO/EBITDA below 50% in four of six periods and at 50.6% in the latest twelve months; negative FCF in three of five years | **Triggered** | **High** | **High** | [`06_earnings-quality` output, §2 and §9, from `FY26 10-K, Statements of Cash Flows p.66`; `FY25 10-K, p.68`; `Q2 FY27 10-Q, p.5`; `Capital IQ Financials_Annual, Income Statement tab`] | §13: "When a governance red flag surfaces in any module, it is escalated, not absorbed." `06` itself says the tag is emitted "regardless of whether it alone moves this module's own score band". **The synthesis must carry `RF-EQ-002` and `RF-EQ-001` to the master layer as named flags, not as inputs already priced into 48/100** |
| Stock-based compensation excluded from the number the market tracks | **Triggered** | **Medium** | High | $90.0m = **32.5%** of Q2 FY27 management-reporting EBITDA; $462m guided for FY2027 = **29.5%** of the derived $1,565m midpoint; share count 177.1m → 187.2m over 18 months [`06_earnings-quality` output, §4 and §8, severity 75/100 inverted] | The Street's own yardstick is roughly 30% non-cash by construction. Carried into `05` §5 correctly. This is a real and well-sized flag |
| Deferred-revenue add-back sign-flips | **Triggered** | Medium | High | +$104.3m for the quarter but **−$43.7m** for the half (Net Bookings $2,987.2m *below* GAAP net revenue $3,030.9m) [`06_earnings-quality` output, §7] | Any claim built on the Q2 management-basis EBITDA must carry this. `06` states it; `05` B4 carries it |
| Recurring "one-offs" and reserve-release direction | **Triggered** | Medium | High | Business reorganisation $104.6m / $106.5m / **$(4.4)m credit**; software-development impairment $109.9m / $77.5m / **$(1.0)m recovery** — a $189.4m swing that flattered FY2026 operating income with no operating cause [`06_earnings-quality` output, §5] | Well-caught. FY2026 — the one clean cash year and the base for every FY27 comparison — was flattered by reversals |
| Tax rate boosted by a one-off | **Triggered** | Medium | High | Q2 FY27 **benefit** of $57.9m against a $(111.9)m pre-tax loss — a 51.7% effective rate vs 21% statutory, "primarily driven by tax benefits of $57.1 related to geographic mix of earnings **and changes in reserves**" [`06_earnings-quality` output, §8, from `Q2 FY27 10-Q, Note 13`] | Carried into `05` §5 and into `07`'s refusal to read the Q2 absorption as mitigation. Correct. The valuation-allowance context in 2.5 extends it |
| Capitalised costs rising as a share of revenue | **Triggered** | **High** | High | Capitalisation rate 10.53% → 12.29% of revenue (H1 FY26 → H1 FY27); balance $1,973.4m → $2,346.3m → $2,577.3m, **+9.8% in six months while revenue fell 7.5%** [`06_earnings-quality` output, §6 and §8, severity 80/100 inverted] | The largest accrual flag in the module, correctly sized and correctly separated from the cash cost ($716.3m cash in vs $411.9m amortised — a $304.4m gap) |
| **The −17.8% YoY deferred-revenue decline — one of the four triggered accrual flags — rests on a tier-5 vendor balance for its prior-year leg** ("unearned revenue" at 2025-09-30, $1,268.1m), because no Q2 FY26 10-Q exists in the pool | **Triggered** | **Low** | Medium | [`06_earnings-quality` output, §6 and §11 note [9]] | `06` labels the source. The flag's *direction* is independently confirmed on a pure filing basis ($1,189.6m → $1,042.1m over six months, verified in `Q2 FY27 10-Q, Note 3`), so the finding survives; only the YoY magnitude carries vendor-definition risk |
| Receivable factoring / supplier finance used | **Not triggered** | — | — | "No receivables were sold under this facility" in FY2026 or the six months to 2026-09-30 [`FY26 10-K, MD&A`; `Q2 FY27 10-Q, Note 3`] | CFO is **not** flattered today. The pre-approved $215.0m mechanism is a watch item, not a finding |
| Receivables growing faster than revenue | **Not triggered** | — | — | DSO 73.4 → 44.5 days year on year [`06` §3 and §6] | Direction is favourable |
| Auditor change, restatement, or accounting-policy change | **Not triggered** | — | — | Ernst & Young, unqualified, continuously since at least FY2017; the only adoption is ASU 2023-09, disclosure-only [`06_earnings-quality` output, §6, from `FY26 10-K, Note 1`; `Capital IQ Auditors export`] | No fraud or policy-manipulation signal exists in this pool |
| Adjusted earnings materially above reported | **Triggered** | Medium | High | GAAP net loss $(54.0)m → management-reporting EBITDA $277.1m = **$331.1m on $1,497.0m of revenue (22.1%)** [`06_earnings-quality` output, §7] | Fully disclosed by the company, fully reconciled by `06` and `04`. The flag is size, not opacity |

### 2.8 Sensitivity / External Variables

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| **The module's only measured mitigation is not a measurement of realised mitigation.** `07` row 2 leads with "**117% — realised, measured, and it over-covered**", but the 117.1% is derived from the difference between **two guidance tables** (the 2026-08-07 and 2026-11-09 FY2027 outlooks), not from a realised print. `CLAUDE.md` §9 requires the realised offset to be computed from "how much of a past shock it actually absorbed" | **Triggered** | **High** | **High** | [`07_earnings-sensitivity` output, §2 row 2]; `sensitivity_summary.json` → `fy27_gross_margin_bps.mitigation_note` (which does state "the offset is measured from two GUIDANCE tables, not from a realised print") | **Do not use 117.1% as a §9 realised-mitigation base case.** It is management's *plan* to offset, from a company that missed its own bookings guidance in the same print. `07` attaches both qualifiers in the same cell — the defect is the lead words, and under §3 the hedge, not the headline, is what travels |
| **The stated confidence on the volatility score is generous in substance.** `07` scores volatility 78/100 at **Medium** confidence because "a real company-disclosed sensitivity exists and is used" — but the one disclosed coefficient (FX) is the **least material row**, excluded from the EBIT ranking, and has moved revenue by **$9.9m or less in every disclosed period** against a ±$323.2m hypothetical bound. Every row that drives the score is inferred, and the top-ranked row carries an inferred coefficient **and** an inferred move size at **Low** confidence | **Triggered** | **High** | **High** | [`07_earnings-sensitivity` output, §2 rows 1 and 7, §3, §7]; `MODULE_RULES.md` score-cap table: "No sensitivity disclosures and only inferred sensitivities → Earnings volatility confidence must be Low" | **Recommend the synthesis state earnings-volatility confidence as Low, not Medium.** The cap's literal trigger is avoided on a technicality: the disclosed sensitivity is immaterial to the score it is being used to support |
| **Five of seven variables move together on one event, and the joint adverse case is never sized.** `07` §5 states the compounding mechanically (launch shortfall → worse cost-of-revenue ratio via the straight-line floor → higher impairment odds → weaker launch-attached RCS → stock compensation that does not fall), but §3 ranks each row independently, so the largest number a reader sees is $248.2m when the correlated bear is materially larger | **Triggered** | **Medium** | **High** | [`07_earnings-sensitivity` output, §5 and §3]; `sensitivity_summary.json` notes rows are "alternative cuts and are never additive" for the component rows but gives no joint case | The bear tail is under-sized in the only table the synthesis is likely to lift. Ask for the correlated case, or state that the module's ranked impacts are single-variable and therefore a floor |
| **The only measured offset in the whole module is invisible to any machine consumer.** All seven `realised_offset_pct` fields in `sensitivity_summary.json` are `null`, including row 2's — because the schema caps the field at 100 and the measured value is 117.1%, so it was moved into free text | **Triggered** | **Low** | High | `sensitivity_summary.json` → every `realised_offset_pct: null`; `fy27_gross_margin_bps.mitigation_note` carries the 117.1% in prose | Any automated consumer reads "zero mitigation measured anywhere". Combined with the flag above, that is arguably the *safer* error — but it is a schema defect worth naming to the owner |
| Earnings dominated by one variable | **Triggered** | **High** (carried) | High | Top variable 2.4x the second on the comparable metric, 4.0x at the fixed-cost bound; the guided Q3 step-up of $1,667.9m is **120.9%** of the whole year's guided growth of $1,379.0m [`07_earnings-sensitivity` output, §3 and §4] | Correctly identified and correctly honest ("not a portfolio of comparable risks; it is one variable with a tail of smaller ones") |
| Non-linear downside | **Not triggered** (correctly handled) | — | — | `07` §6 names four asymmetries with arithmetic: the amortisation floor makes the downside coefficient 1.0x–2.0x the upside; impairment is a step not a slope; operating deleverage is ~7x the margin change it produced; launch marketing is committed before sell-through | This is model work done to standard |
| Bear-case variable currently moving the wrong way | **Triggered** | Medium | High | FY2027 gross margin already guided −351bps and revised a further −130.6bps between the two FY2027 outlooks; RCS already missed its guide by 4pp; the impairment mechanism fired twice in two quarters [`07` §2 rows 2–4] | Two of the five EBIT-scale variables are already adverse before the launch result is known |
| Commodity / rates / policy risk not controllable | **Not triggered** | — | — | No commodity input; the company states "no material interest rate risk exposure" with no borrowings drawn; FX symmetric and immaterial as realised [`07` §1 and §2 row 7, from `FY26 10-K, Item 7A`] | Correct exclusions, each with a stated reason |

### 2.9 Source Conflicts

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| **`03` mixes current-only and total deferred-revenue bases in one sentence** — quotes $1,017.1m current + $25.0m non-current at 2026-09-30, then says it "fell from $1,159.9m at 2026-03-31" (the **current-only** prior balance) and calls the change "$147.3m" (the **total**-basis change, which is $147.5m on the filing's own figures) | **Triggered** | **Low** | **High** | [`03_margin-drivers` output, §9]. Verified from the filing: current $1,017.1 vs $1,159.9 [`Q2 FY27 10-Q, Balance Sheets p.2`]; total "including current and non-current … were $1,042.1 and $1,189.6" [`Q2 FY27 10-Q, Note 3`] | A §15 matched-basis slip plus a $0.2m arithmetic drift. The correct statements are: current −$142.8m, total −$147.5m. `02` §2 and `06` §6 use the total basis correctly |
| **`04` asserts an unlabelled inference about revision composition** — "the cuts came from smaller-revenue models and the raises from larger ones" — which breadth counts (6↑/9↓ against a +0.4% mean) cannot establish | **Triggered** | **Low** | High | [`04_guidance-consensus` output, §5] | The observable fact (negative breadth, rising mean) is proven and sufficient. The composition claim needs the label "Inference, not from filings" or should be dropped |
| Filings contradict the deck | **Not triggered** (caught and adjudicated) | — | — | The Q2 FY27 deck labels the Q3 GAAP net income row "GAAP Net Loss"; `04` §2.2 identifies it as a deck label error and applies §4 ("the filing-tier document wins") | Correctly adjudicated |
| Vendor export contradicts the filings | **Not triggered** (all three reconciled) | — | — | (i) Gross profit: the vendor reclassifies asset writedowns out of cost of revenue — both bases named, filing used [`01` §1 note 2; `03` §1 rule 1]. (ii) EBITDA: a $7.4m vendor-internal annual-vs-quarterly gap, identified as a vendor restatement difference [`01` §2]. (iii) Net debt: strict $1,370.4m vs vendor broad $1,237.8m **reconciles exactly** — 1,370.4 − 524.2 short-term investments + 391.6 lease liabilities = 1,237.8 [`01` §1 and §2] | **No irreconcilable source conflict exists.** The `MODULE_RULES` "conflicting sources not reconcilable → overall usefulness max 65" cap should **NOT** be applied. Do not over-penalise a conflict the module actually resolved |
| Management commentary contradicts the numbers | **Triggered** | Low | High | The 10-K says reduced consumer spending "**has** and may in the future continue to result in reduced demand"; management said "we don't feel like the consumer is pulling back at all" [`02_revenue-drivers` output, §3, citing `FY26 10-K, Item 1A` and `Q1 FY2027 Earnings Call transcript, 2026-08-07, Q&A (Creutz / Zelnick)`] | `02` names the disagreement rather than averaging it (§3 compliant). Under §4 the filing's risk-factor language wins on the historical claim |
| Net-debt / FCF basis labels inconsistent across the module | **Not triggered** on labels, **Triggered** on emphasis | Low | High | Every net-debt figure in `01` and `06` carries "strict basis" or "broad basis" inline, and 1.89x vs 1.71x are both shown with their inputs. The FCF emphasis gap is flag 10 in 2.2 | Basis labelling is to §15 standard throughout. The only defect is which figure leads |

### 2.10 Narrative / Framing

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| **A hedged upstream finding has hardened into an absolute, on the module's pivotal claim.** `03` §9 writes that the Q3 guide "is a **firm company commitment** made ten days before launch, **not a hope**" and concludes "on the evidence available today the **demand sign dominates**". Guidance is a management forecast that (i) the company itself warns "may not foot to the totals", (ii) it **missed** in the same print it was issued alongside, and (iii) rests on preorders described only as "extraordinary" with no number anywhere in the pool. `03` is the **only** agent of the eight that leans on an unevidenced assumption about GTA VI | **Triggered** | **High** | **High** | [`03_margin-drivers` output, §9, both cells]; against [`02_revenue-drivers` output, §7] ("unproven"), [`05_beat-miss-setup` output, §8] ("favors miss"), [`07_earnings-sensitivity` output, §4] ("unproven, not favourable or adverse"), [`06_earnings-quality` output, §10] ("quantified nowhere in this pool"); the footing warning is in [`TTWO 2Q27 Earnings Release, 2026-11-09, "Key assumptions and dependencies"`] | §3 claim fidelity. **Recommend the synthesis restate `03` §9 as: on the company's own guided components the demand reading is better evidenced than the cost reading, conditional on a launch outcome no reported period contains.** The arithmetic in `03` is sound; only the adjective overreaches. Note `03` itself ends §8 with the correct version — "it does rest on a forward input the engine cannot verify, and that distinction travels with it" — so the module contains both the hardened and the hedged form |
| **"Earnings accelerating" would be unsupportable, and so would "decelerating".** Realised evidence is a release-cycle trough (revenue −15.6%, EBITDA margin 5.1%, the lowest of eight quarters); guided evidence is a launch peak (revenue roughly doubling, EBIT margin −7.8% → +14.4%). Both `02` §3b and `03` §1b state independently that **neither** quarter is a run-rate | **Triggered** | **Medium** | High | [`01_historical-financials` output, §6]; [`02_revenue-drivers` output, §3b]; [`03_margin-drivers` output, §1b]; [`05_beat-miss-setup` output, §6] | The only verdict the evidence carries is **Mixed earnings setup**. A directional verdict in either direction would be picking one period over the other |
| The setup is really a single-event bet | **Triggered** | **High** (carried) | High | The guided Q3 step-up of $1,667.9m is 120.9% of the whole year's guided growth; `07` §3 calls it "one variable with a tail of smaller ones" | Under `CLAUDE.md` §14 this is closer to a **company-specific single-product-event** thesis than an earnings-trend thesis. The synthesis should classify it that way rather than as a trend read |
| Stock-reaction framing confused with earnings framing | **Triggered** | **Low** | Medium | The pool carries short interest at **4.96%** of shares outstanding (daily series to 2026-11-18) and a 25-Buy recommendation skew [`00_earnings-data-triage` output, §1.7 and `04` §1]. No earnings agent uses either — correctly, since positioning is out of module scope | Flagged so the synthesis does not read "setup favors miss" as a stock call. `05`'s verdict is about the bar, not about the share price, and `05` §10 says so |
| Business quality confused with earnings setup | **Not triggered** | — | — | The earnings module reaches its own reads and reconciles to business-model `10_external-dependency` (cyclicality "partly externally driven", 52/100 inverted) without importing its quality score. Business-model quality is 38/100 and appears nowhere as an earnings input | Correct separation |
| Bull case relies on adjectives, not numbers | **Partly triggered** — see flag 4 | — | — | The only bull inputs that are not numbers are management's "extraordinary" and "far in excess of our initial expectations". Every agent except `03` §9 refuses to convert them | Covered by flag 4 |

---

## 3. Red-Flag Summary Table

| # | Category | Red Flag | Status | Severity | Probability | One-Line Impact |
|---:|---|---|---|---|---|---|
| 1 | Data completeness | Primary driver (GTA VI sell-through) has zero reported history, no in-pool base rate, no alt-data panel | Triggered | **Critical** | High | Caps the module verdict at **Mixed earnings setup**; no directional read is supportable |
| 2 | Sensitivity | The module's only "realised" mitigation (117.1%) is measured between two **guidance** tables, not from a realised print | Triggered | High | High | Must not be used as the §9 realised-mitigation base case |
| 3 | Sensitivity | Volatility confidence stated Medium while every material coefficient is inferred and the one disclosed row is immaterial | Triggered | High | High | Recommend earnings-volatility confidence = **Low** |
| 4 | Narrative / framing | `03` §9 hardens guidance into a "firm company commitment" and concludes "demand sign dominates" — the only agent leaning on the launch | Triggered | High | High | §3 breach on the pivotal claim; restate with the qualifier |
| 5 | Earnings quality | `RF-EQ-002` cash-conversion breakdown is a §13 escalation trigger, not an input already priced into 48/100 | Triggered | High | High | Must be escalated to the master layer as a named flag |
| 6 | Guidance / consensus | The mechanism behind the +189% FY27 GAAP-EPS gap — an 86.8% deferred-tax valuation allowance plus a Nov-2026 intangible reorganisation — is named nowhere in the module | Triggered | High | Medium | A large GAAP-EPS beat could be non-cash and non-operating; the gap is not evidence of a high operating bar |
| 7 | Revenue | Platform-agreement renewal/termination exposure on 41.4% of revenue is absent from the entire earnings module | Triggered | High | Low | Low-probability, high-impact; matters most for the FY2028 read |
| 8 | Earnings quality | Capitalised costs rising as a share of revenue: 10.53% → 12.29%, balance +9.8% in six months while revenue fell 7.5% | Triggered | High | High | Largest accrual flag; correctly sized upstream, must not be averaged away |
| 9 | Sensitivity | Earnings dominated by one variable — top row 2.4x the second, 4.0x at the fixed-cost bound | Triggered | High | High | Confirms a single-event setup, not an earnings trend |
| 10 | Beat / miss | Setup depends on a guidance raise: reiterating FY2027 mechanically implies a Q4 13.5% below the Street | Triggered | High | High | The most actionable, fully testable line in the module (2027-02-09) |
| 11 | Margins | The same $2,577.3m content asset sized three ways; current unreleased split undisclosed → **under-counted, not double-counted** | Triggered | Medium | High | Do not net or add the three; `07`'s ranking understates its own text |
| 12 | Sensitivity | Five of seven co-moving variables never sized as one joint adverse case | Triggered | Medium | High | The ranked bear impacts are a floor, not the tail |
| 13 | Historical trend | TTM FCF quoted as −65.4% in `01` and up to −14.7% normalised in `06`; the normalisation qualifier did not travel | Triggered | Medium | High | Carry both bases; the $91.8m cash element is undisclosed so $154.4m is a ceiling |
| 14 | Margins | Vendor-basis FY26 EBITDA margin sits beside company-defined FY27 guided margin with no comparability caveat | Triggered | Medium | Medium | Refuse any FY26→FY27 EBITDA-margin trend claim or re-base it |
| 15 | Guidance / consensus | Consensus level (above guidance) and consensus trend (−13.3% / −46.8% over six months) point opposite ways; only the level is in the verdict | Triggered | Medium | High | Score consensus setup from both signals |
| 16 | Guidance / consensus | Revision breadth negative (6↑/9↓) while the FY2027 mean crept up — a genuine consensus trap | Triggered | Medium | High | Analysts are redistributing quarters, not raising the year |
| 17 | Guidance / consensus | `04` reproduces the sell-side recommendation distribution despite the §24 strip rule | Triggered | Medium | Medium | Labelled and unused, but must not travel into the synthesis |
| 18 | Margins | SG&A savings explicitly attributed to timing; Q3 operating expenses guided +21% YoY | Triggered | Medium | High | The saving is deferred into the quarter that carries the risk |
| 19 | Earnings quality | Stock-based compensation is 32.5% of the management-basis EBITDA the Street scores (29.5% guided for FY27) | Triggered | Medium | High | The market's yardstick is ~30% non-cash by construction |
| 20 | Earnings quality | Deferred-revenue add-back sign-flips: +$104.3m for the quarter, −$43.7m for the half | Triggered | Medium | High | Any Q2 management-basis claim must carry it |
| 21 | Earnings quality | Recurring "one-offs" reversed into FY2026: a $189.4m swing in reorganisation and impairment lines with no operating cause | Triggered | Medium | High | FY2026 — the base for every FY27 comparison — was flattered |
| 22 | Earnings quality | Q2 FY27 tax **benefit** of $57.9m against a $(111.9)m pre-tax loss (51.7% effective vs 21% statutory) | Triggered | Medium | High | GAAP EPS can be manufactured below the EBITDA line |
| 23 | Earnings quality | Adjusted-vs-reported step of $331.1m = 22.1% of quarterly revenue | Triggered | Medium | High | Fully disclosed; the flag is size, not opacity |
| 24 | Revenue | Backlog proxy shrinking: total deferred revenue −17.8% YoY, deferred-revenue days 71.8 → 65.2 → 59.3 | Triggered | Medium | High | The forward book is falling into a launch |
| 25 | Revenue | Customer concentration: five customers 80.6% of FY26 revenue, four each above 10.0% | Triggered | Medium | High | Access risk, plus an uncollateralised receivable leg the earnings module does not carry |
| 26 | Beat / miss | Beat case needs +4.34% above the company's own midpoint to meet consensus; miss case needs only delivery | Triggered | Medium | High | Correct and well-evidenced, but measured against guidance, not the outcome |
| 27 | Beat / miss | Four-observation surprise sample, one period derived, magnitude collapsing, regime change | Triggered | Medium | High | `05` weights it Low — do not let the synthesis upgrade it |
| 28 | Sensitivity | Two of five EBIT-scale variables already moving adversely before the launch result is known | Triggered | Medium | High | Gross margin already guided −351bps and revised a further −130.6bps |
| 29 | Narrative / framing | Neither "accelerating" nor "decelerating" is supportable — realised trough vs guided peak, neither a run-rate | Triggered | Medium | High | Reinforces the Mixed verdict |
| 30 | Revenue | The FY2027 "RCS flat" guide cannot be tested — no FY2026 quarterly content split exists in the pool | **Unclear** | Medium | Unknown | A 21pp one-quarter swing is underwritten on an untestable full-year assumption |
| 31 | Source conflicts | `03` §9 mixes current-only and total deferred-revenue bases and drifts $0.2m | Triggered | Low | High | §15 matched-basis slip; correct figures are −$142.8m current / −$147.5m total |
| 32 | Source conflicts | `04` asserts revision composition ("cuts from smaller-revenue models") that breadth counts cannot establish | Triggered | Low | High | Label as inference or drop; the proven fact is sufficient |
| 33 | Guidance / consensus | FY-level and quarter-level consensus means come from different analyst panels; the Q4 arithmetic mixes them (gap verified at 0.5%) | Triggered | Low | Medium | Label the basis; the 13.5% conclusion survives |
| 34 | Earnings quality | The −17.8% YoY deferred-revenue flag's prior-year leg is a tier-5 vendor balance | Triggered | Low | Medium | Direction independently confirmed on a filing basis; only the magnitude carries vendor risk |
| 35 | Margins | `03` attaches the whole $2,577.3m balance's amortisation start to one title's release | Triggered | Low | High | §15 aggregate-without-build; GTA VI's own component is undisclosed |
| 36 | Sensitivity | All seven `realised_offset_pct` fields in `sensitivity_summary.json` are null, including the one measured offset | Triggered | Low | High | Machine consumers read "no mitigation measured anywhere" |
| 37 | Source conflicts | Filing risk-factor language on consumer spending contradicts management's call commentary | Triggered | Low | High | `02` names it rather than averaging; filing wins on the historical claim |
| 38 | Historical trend | TTM growth (+3.1%) contradicts the last annual print (+18.2%); FY26's gross-margin gain is partly a base effect | Triggered | Low | High | Both labelled upstream |
| 39 | Data completeness | Q3 FY26 and Q4 FY26 are vendor-constructed; one of four surprise observations is derived | Triggered | Low | High | Named and weighted Low by `05` |
| 40 | Narrative / framing | Positioning data in the pool (4.96% short interest, 25-Buy skew) is out of scope and unused | Triggered | Low | Medium | Flagged so "favors miss" is not read as a stock call |

---

## 4. Red-Flag Score

| Metric | Value |
|---|---|
| Total flags triggered | **39** |
| Critical flags | **1** |
| High flags | **9** |
| Medium flags | **19** |
| Low flags | **10** |
| Unclear flags | **1** (the FY2027 "RCS flat" guide — severity Medium, probability Unknown) |
| Unavailable checks (data missing) | **2** (the unreleased-title split of the $2,577.3m balance at 2026-09-30; no company-defined full-year FY2026 EBITDA) |

*(Severity counts cover the 39 triggered flags only. The single Unclear flag is counted in its own row, not in the severity bands, per the summary-table rule that only triggered and unclear flags appear in Section 3.)*

---

## 5. Red-Flag Severity Verdict

### **Critical concerns.**

The critical flag is not an error by any upstream agent — it is a property of the evidence. The variable that decides the next 3–12 months of this company's earnings, Grand Theft Auto VI sell-through, launched **on this run's date**, so no reported period contains a single dollar of it, no preorder count or unit figure exists anywhere in the pool, there is no comparable launch quarter in the data (vendor quarterly history starts Jun-2016; GTA V launched Sep-2013), and there is no alternative-data panel to triangulate it. Six of the eight upstream agents say exactly that and refuse to fill the hole; the consequence they do not draw is the one that matters here: **a module whose single largest revenue driver, single largest margin driver and top-ranked sensitivity are all the same unmeasurable variable cannot support a directional verdict, and must be capped at "Mixed earnings setup."**

The single most dangerous red flag is **#2 — the 117.1% "realised, measured" mitigation offset in `07_earnings-sensitivity`, which is measured between two guidance tables rather than from a realised print.** It is dangerous precisely because it is the module's only quantified mitigation: if it travels upward as a realised offset, every bear case in the downstream stack gets silently reduced by more than 100% of its own size, on the authority of a forecast issued by a company that missed its own bookings guidance in the same press release. **What would resolve it:** the Q3 FY2027 print on **2027-02-09** — specifically whether cost of revenue lands inside the guided $1,649–1,732m on revenue inside $3,270–3,420m. That is the first observation that would convert a guidance-to-guidance offset into a measured one, in either direction.

---

## 6. What The Synthesis Agent Should Know

- **39 triggered flags: 1 Critical, 9 High, 19 Medium, 10 Low, plus 1 Unclear and 2 Unavailable checks.** The distribution is heavily Medium because the upstream work is unusually well-documented — most Medium rows are findings the agents got right and that must not be averaged away, not defects.
- **Most dangerous flag:** `07`'s 117.1% mitigation offset is a **guidance-to-guidance** figure presented with the lead words "realised, measured, and it over-covered". `CLAUDE.md` §9 requires a realised offset to be computed from a shock the company actually absorbed. Do not carry 117.1% as a realised-mitigation base case; carry the zero-mitigation bound and the 117.1% plan separately, with the two qualifiers `07` itself attaches.
- **Verdict recommendation:** the only supportable verdict is **Mixed earnings setup**. Realised evidence is a release-cycle trough (revenue −15.6% YoY, the lowest of eight quarters, EBITDA margin 5.1%); guided evidence is a launch peak (revenue roughly doubling, EBIT margin −7.8% → +14.4%); `02` §3b and `03` §1b independently state that **neither is a run-rate**. "Accelerating" and "decelerating" each pick one period over the other. Classify the thesis under §14 as **company-specific, single-product-event** rather than an earnings-trend read.
- **Cap recommendations — three, each with its trigger:**
  1. **Earnings volatility confidence → Low, not Medium.** The `MODULE_RULES` cap ("only inferred sensitivities → confidence must be Low") is avoided on a technicality: the one company-disclosed coefficient (FX) is the least material row, excluded from the EBIT ranking, and has moved revenue by $9.9m or less in every disclosed period against a ±$323.2m bound. Every row that drives the 78/100 score is inferred, and the top-ranked row is Low confidence on both coefficient and move size.
  2. **Escalate `RF-EQ-002` (cash-conversion breakdown) and `RF-EQ-001` (rising accruals) as named flags, not as inputs already priced into the 48/100 quality score.** §13 lists cash-conversion breakdown as a standardized trigger and requires escalation, not absorption.
  3. **Do NOT apply the "conflicting sources not reconcilable → overall usefulness max 65" cap.** All three vendor-vs-filing conflicts were genuinely reconciled: gross profit (both bases named, filing used), the $7.4m vendor-internal EBITDA gap (identified as a vendor restatement difference), and net debt (strict $1,370.4m − $524.2m short-term investments + $391.6m leases = the vendor's $1,237.8m, exactly). Do not over-penalise a conflict the module actually resolved.
- **Contradictions to reconcile, with my adjudication:**
  - **`03` §9 vs `02`/`05`/`06`/`07` on GTA VI.** `03` calls the Q3 guide "a firm company commitment … not a hope" and concludes the "demand sign dominates"; the other four hold the launch "unproven". **Adjudicate to the four.** Guidance is a management forecast the company warns "may not foot to the totals" and which it missed in the same print. `03`'s arithmetic is sound and its §8 contains the correct hedged version — restate from §8, not §9.
  - **`01` vs `06` on TTM FCF.** −65.4% reported ($62.6m) vs up to −14.7% normalised ($154.4m, excluding the one-off $91.8m London building). **Carry both with their bases.** FCF fell on either; the $91.8m cash element is not separately disclosed, so $154.4m is a ceiling, and even at the full add-back it is below the prior year's $181.0m.
  - **`03`/`06`/`07` on the $2,577.3m content asset.** Sized as a margin flow, an equity-coverage stock and an incremental charge. **Not a double count — three different objects.** It is **under-counted**: `07`'s own text calls the $109.9m impairment bear "a floor on the plausible bear, not a cap" because it was measured against a smaller unreleased base, yet its ranking table shows it as the smallest EBIT risk.
- **Two under-counted items the module does not carry at all, both found in business-model `12_red-flags-sweep` and both earnings-relevant:**
  1. **The tax line.** The company has written down **86.8% of its gross deferred tax assets ($1,262.3m of $1,454.8m)** citing its own "cumulative loss position", printed a **(50.8)% effective rate** in FY2026 (a $100.4m charge on a pre-tax loss), and completed a **November-2026 intangible-asset reorganisation** whose effect it is "still evaluating" — and that reorganisation lands **inside Q3 FY2027**. This is the mechanism behind the +189% FY2027 GAAP-EPS consensus gap that `04` could only locate as "tax and non-operating items". A valuation-allowance release would close that gap with a large **non-cash** credit. Treat any GAAP-EPS beat as uninformative, and do not read "guidance far below the Street" as proof of a high operating bar.
  2. **Platform agreements.** The Sony licence "expires on March 31, 2027" with automatic one-year renewals and a right for Sony to "terminate the agreement for any or no reason upon 30 days' notice"; the Xbox licence was replaced effective 2026-09-17 by an agreement with its term and Royalty Percentage redacted and a Microsoft right to terminate per-game and per-country "without cost or penalty" — on a channel that was 41.4% of H1 FY2027 revenue, into a console-only launch. The earnings module lists platform gatekeepers as "High tail, zero realised" but names no date, renewal mechanism or termination right.
- **Missing data that prevented a full scan:** the 2026-09-30 unreleased-title split (verified absent from the 10-Q — so today's impairment exposure is genuinely Not assessable); any GTA VI sell-through or launch base rate; no company-defined FY2026 EBITDA; no FY2026 quarterly content split (so the FY2027 "RCS flat" guide is untestable).
- **Is the setup cleaner or dirtier than upstream suggested? Dirtier on the forward side, cleaner on the accounting side.** Cleaner: no fraud, no restatement, no auditor change, no factoring used, basis labels carried to §15 standard throughout, the vendor-vs-filing margin trap caught and defused, two reconciliation tags (`RF-EARN-001`, `RF-EARN-002`) both closing with printed residuals. Dirtier: one agent hardened the pivotal claim, the module's only mitigation measurement is not a measurement, the correlated bear is unsized, the tax mechanism behind the largest consensus gap is unnamed, and a 41%-of-revenue contractual exposure is absent entirely.
- **One more item for the record:** `04` reproduces the sell-side recommendation distribution (25 Buy / 3 Outperform / 0 Hold / 1 Underperform) with an honest "not ingested" label. It is used nowhere, but under §24 it must not be restated in the synthesis. Analyst **count** (29) is the legitimate field.
- **The wrong-company contaminant is clean.** I checked all eight outputs: `Alphabet Inc NasdaqGS GOOGL Key Developments.xls` is cited nowhere as TTWO evidence. No §20 bad-source error exists in this module.

---

## 7. Pre-Mortem — If The Earnings Setup Fails

**If this earnings setup turns out to be wrong, the single most likely reason is that the module measured the bar with great precision and had no way to measure the thing the bar is about — and then let one agent quietly convert management's forecast into evidence that it would be cleared.** Every load-bearing number in the setup is a distance: consensus +2.1% above the top of guidance, +4.34% above its midpoint, a guidance-implied Q4 13.5% below the Street, a bear case 2.4x the next-largest variable. All of those are arithmetic on figures that exist. None of them is a measurement of how many copies of Grand Theft Auto VI will sell, because no such measurement exists anywhere in this pool — no preorder count, no unit figure, no price-times-volume build, no attach rate, no comparable launch quarter in the data, and no alternative-data panel. The specific place that gap turns into a wrong answer is flag 4: `03_margin-drivers` §9 calls the Q3 guide "a firm company commitment … not a hope" and concludes "the demand sign dominates", and if the synthesis lifts that sentence instead of `03` §8's hedged version, an unverifiable forward input becomes the module's evidence base. In the `CLAUDE.md` §20 taxonomy the failure is **bad base rate compounded by missing data**: a four-observation, one-derived, pre-launch surprise sample asked to predict the first post-launch quarter in the company's history, with the one agent that leaned on management's adjectives supplying the confidence the data could not.
