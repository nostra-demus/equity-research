# earnings Module Dossier — SMPL

> Deterministic, lossless concatenation of every artifact in this module — the module synthesis and every specialist output, in order. Generated mechanically (no LLM rewriting), so nothing is omitted or paraphrased. This is the module's "see everything" tier; the module's decision lives in `99_*-synthesis.md` and the short read in `earnings_memo.md`.

- Generated: 2026-08-05T20:10:16Z
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

# Earnings Module — SMPL (Synthesis)

## Abstract

SMPL's earnings trend is decelerating: four straight quarters of year-over-year revenue decline sit under a genuine, non-impairment margin drop of roughly 330 basis points. Unhedged commodity input-cost inflation — the single biggest swing factor at about $27 million of Adjusted EBITDA, near 12% of the FY2026 guide — and Atkins's shelf-space losses drive both lines, while Quest's now-dominant but bar-weak mix decides where revenue goes next. Near-term consensus matches management's guidance almost exactly, but FY2027 Street estimates keep falling every month. The biggest risk is that a three-quarter widening beat streak gets read as acceleration when $391.9 million of cumulative goodwill impairment and rising accruals mask a real earnings-quality problem, a pattern the red-flag scan rates Material concerns. Verdict: a mixed earnings setup.

## 1. Earnings Verdict

- **Verdict: Mixed earnings setup.** Near-term guidance and consensus are matched (a stable-looking signal on the surface), but the trailing trend (four consecutive quarters of YoY revenue decline), the margin structure (a genuine ~330bps Adjusted EBITDA margin decline over the Latest TTM, not merely an impairment artifact), and the FY2027 revision trend (still net-negative every 30/60/90-day window) are all decelerating. These are conflicting signals across revenue, margins, and quality, not a single clean direction — which is the "Mixed earnings setup" definition in `MODULE_RULES.md`.
- Earnings quality /100: **44** (from `06_earnings-quality`, band 41–60 "Material concerns")
- Consensus setup /100 *(higher = more beatable)*: **52** — synthesis judgment, reconciling `04_guidance-consensus`'s "fair" bar call (guidance and consensus matched within 0.5% on net sales and Adjusted EBITDA) against the heavily net-negative FY2027 revision breadth (−4 to −6 across revenue/EBITDA/EPS) and a beat streak that is real but short (three quarters, already reset once at FQ4 FY25). A "fair" bar with a still-falling out-year model does not clear into the "strong/beatable" band; it sits in the mixed middle.
- Earnings volatility /100 *(higher = worse)*: **68** (from `07_earnings-sensitivity`, "High volatility" band 61–80 — inverted score, higher means worse/more sensitive)
- Next-quarter setup: **Balanced** (from `05_beat-miss-setup`)
- Biggest earnings driver (one line): Unhedged commodity/input-cost inflation (zero hedges, ~$27M/12% of the FY2026 Adjusted EBITDA guide) compounding with Quest's now-dominant but bar-weak revenue mix (63.7% of nine-month FY26 net sales; bars ~5% of consumption decline) is the single pair of forces deciding both the revenue and margin path for the next 12 months.
- Biggest earnings risk (one line): A three-quarter widening beat streak (revenue +0.1%→+7.3%, EPS +8.1%→+19.5%) is at risk of being narrated as "earnings accelerating" when the underlying trajectory is four consecutive quarters of YoY revenue decline, a genuine ~330bps margin compression, and FY2027 Street estimates still being cut every month.
- **Red-flag severity verdict (from `08_earnings-red-flags`, reported verbatim): Material concerns.**

## 1A. Module Disconfirmation

- **Strongest bear point:** Four consecutive quarters of YoY revenue decline (FQ4 FY25 through FQ3 FY26, −0.3% to −9.4%), a genuine (not impairment-driven) ~330bps Adjusted EBITDA margin decline over the Latest TTM (20.2%→19.2%→16.9%), and $391.9 million of cumulative goodwill/brand impairment across three of the last four quarters together describe a business at a margin trough with a real M&A value-destruction pattern, not one accelerating [`01_historical-financials.md` §2–3, §6; `06_earnings-quality.md` §5, §9–10].
- **Strongest bull point (steelman):** FQ4 FY26 and FY26 guidance sit within 0.5% of Street consensus on net sales and Adjusted EBITDA — a genuinely matched, not sandbagged, bar — and the company has beaten both revenue and EPS for three consecutive quarters with the beat magnitude widening each time, while Quest's household penetration (63.7% of nine-month FY26 net sales) sits at a multi-year high and is still rising [`04_guidance-consensus.md` §3, §6; `02_revenue-drivers.md` §4].
- **Single killer risk specific to earnings quality & beat/miss setup:** The September 2026 high-single-digit price increase running into volume elasticity at or above management's own stated "1 or higher" assumption, compounding with unhedged commodity inflation and an already-decelerating Quest-bar and Atkins base, with no licensed alt-data consumption panel in this pool to catch the deterioration before it shows up in the FQ1 FY27 print [`05_beat-miss-setup.md` §10; `07_earnings-sensitivity.md` §5–6; `00_earnings-data-triage.md` §1A].
- **Disconfirming evidence already visible:** FY2027 Street revenue, EBITDA, and EPS estimates have fallen in every 30/60/90-day window with net revision breadth of −4 to −6, and FQ3 FY26's largest-ever revenue/EPS beat coincided with a GAAP gross-margin *miss* against both the prior guided range (36.40%–36.60%) and consensus (33.29%), landing at 31.6% [`04_guidance-consensus.md` §4–§6].

## 2. Specialist Roll-Up

| Specialist | Verdict Line | Biggest Finding |
|---|---|---|
| earnings-data-triage | Sufficiency: Sufficient; no active partial-data caps bind | Full filing, transcript, consensus, and segment-revenue coverage; only a dated current-price confirmation and an investor deck are absent, neither material |
| historical-financials | Revenue "inflecting negative"; margins "compressing" on every basis tested | GAAP EBITDA/EBIT swung deeply negative on a $391.9M impairment, but the company's own clean Adjusted EBITDA margin also fell a genuine ~330bps over the Latest TTM — the compression is real, not just an accounting artifact |
| revenue-drivers | Quest's bar sub-category is "the single biggest driver of where SMPL's revenue goes next" | Consolidated retail takeaway fell 6.7% while the underlying category grew 10% in the same 13 weeks — a ~17-point share loss, not a soft market |
| margin-drivers | Unhedged commodity/input-cost inflation is the single biggest margin driver, worsening, with zero hedges | Gross margin sits at a five-year trough (36.2% FY25, ~32.5% latest quarter) against a 40.7% FY21 peak; management calls FY2026 "the early stages of our turnaround" |
| guidance-consensus | Bar is "fair" | Guidance and consensus matched within 0.5% on net sales/Adjusted EBITDA, but FY2027 revision breadth is −4 to −6 and every revision window is still falling |
| beat-miss-setup | Setup is "balanced" | Three straight widening beats (revenue, EPS) followed by a Q4 guide implying a steeper YoY decline than the quarter just reported |
| earnings-quality | Score 44/100 — "Material concerns" | Cash conversion has not broken down, but 4 of 5 accrual-quality flags triggered (`RF-EQ-001`) and the "clean" Adjusted EBITDA metric has now excluded $391.9M of cumulative impairment across three of the last four quarters |
| earnings-sensitivity | Volatility score 68/100 (inverted, High-volatility band) | Unhedged commodity/input-cost inflation is the single highest-sensitivity variable (±$27M Adjusted EBITDA, ~12% of the FY2026 guide), and it moves together with tariffs and the price-increase/elasticity trade-off rather than independently |

## 3. Reconciliation

- **01 vs 06 on cash flow direction:** `01_historical-financials` calls the CFO (cash from operations) trend "Deteriorating" because TTM CFO fell 19.0% in dollar terms; `06_earnings-quality` states cash conversion "itself has not broken down" because the CFO/Adjusted-EBITDA ratio has stayed above the 50% breakdown trigger throughout. Both are correct on their own metric — they measure different things (absolute CFO dollars vs. the conversion ratio) — and this synthesis carries both: cash generation is genuinely shrinking in dollar terms even though the conversion ratio has not collapsed.
- **Business-model 11 vs 12 on the leadership/impairment pattern:** `business-model/11_capital-allocation-governance.md` classifies the OWYN write-down and leadership-turnover pattern as "capital allocation concerns," explicitly not a governance red-flags case; `business-model/12_red-flags-sweep.md` adds the CEO severance economics and the CFO/Principal-Accounting-Officer dual-hat and argues "fully disclosed is not the same as governance-neutral." Neither reaches a hard governance disqualifier. This synthesis weights the fuller picture (11 + 12 together) rather than 11 alone when reading leadership-transition risk, per `08_earnings-red-flags.md`'s own reconciliation.
- No conflict exists between this synthesis's verdict and `08_earnings-red-flags`'s own recommendation: `08` itself flags that "Mixed earnings setup" fits better than a single clean direction, and this synthesis adopts that read.

## 4. Score Cap Application

| Cap Trigger | Applied? (Y/N) | Affected Score | Final Cap |
|---|---|---|---|
| No consensus / estimate data | N — current Capital IQ Consensus, Guidance, Revisions, Trends, and Surprise tabs all present, as of Jul-09/Jul-21-2026 | Consensus setup | Not capped |
| No cash flow statement | N — cash flow present in the 10-K, both 10-Qs, and CIQ Financials_Annual/Quarterly tabs | Earnings quality | Not capped |
| No revision history | N — Revisions and Trends tabs present and show a clear net-negative FY2027 trend | Consensus setup | Not capped |
| No verbatim transcript AND no sell-side proxy | N — two verbatim CIQ/S&P Global Market Intelligence transcripts (Q2 FY26, Q3 FY26) are present | Earnings clarity | Not capped |
| Transcript role filled ONLY by a sell-side proxy (no verbatim) | N — verbatim transcripts exist; no proxy substitution needed | Earnings clarity | Not capped |
| Only inferred sensitivities | N — one company-disclosed exact sensitivity exists (interest rate on the $250M term loan, "High" confidence); the remaining brand/customer-level sensitivities are inference and are already individually labeled "Low confidence" by `07_earnings-sensitivity` itself | Earnings volatility confidence | Not capped by this rule; individual inferred variables already carry a Low-confidence label at the variable level |

No cap in this table binds. The earnings quality score (44) and consensus setup score (52) reflect the underlying evidence directly, not a data-absence penalty — the pool is data-sufficient per `00_earnings-data-triage`'s own verdict.

## 5. Earnings Setup Summary

### Revenue Setup

The current revenue decline is not a one-time effect that will simply lap out — it is a genuine mix of a self-inflicted brand problem (Atkins, tied by management to reduced marketing support and Walmart shelf-space cuts) and a company-wide share loss (consolidated retail takeaway fell 6.7% while the category grew 10% in the same 13 weeks). The single factor that would flip the direction is Quest's bar sub-category, which is roughly half of the company's largest brand and is currently declining on consumption even as chips and milkshakes grow fast from a smaller base — re-accelerating bars is management's own stated "highest priority," and its failure to do so would keep total revenue negative even if Atkins comparisons ease as guided. Reported net sales and underlying demand tell somewhat different stories in two places: FY2025's 9.0% net-sales growth ran roughly 3.5 percentage points ahead of the disclosed 5.5% consumption growth (partly a calendar/OWYN-consolidation timing effect, not organic demand), and the coming FQ4 FY26 print is explicitly a deliberate under-shipment versus consumption to reset customer inventories — a temporary gap that should not be read as either a demand acceleration or a further deterioration.

### Margin Setup

Current margins sit at a five-year trough, not a cyclical peak — gross margin has fallen every year since a 40.7% FY2021 peak to 36.2% in FY2025 and roughly 32.5% in the latest quarter, and management's own long-term target ("gross margins approaching 40%… EBITDA margins approaching 20%") is itself an admission the business is running below where it believes it should. The segment or driver most likely to take the largest bite if it moves adversely by 10–20% is unhedged commodity and input-cost inflation (protein complex, packaging) — it is named first in every quarter's commentary, carries an estimated ±$27 million Adjusted EBITDA swing on its own, and has zero contractual protection. Management has no pass-through clause, hedge, or take-or-pay mechanism; price moves are negotiated list-price actions taken roughly twelve months after the cost increase already hit the P&L, making SMPL a pure price-taker on its input costs with only a lagging, elasticity-uncertain price lever as its defense.

### Quality Check

The single largest gap between reported and economic earnings is the $391.9 million cumulative goodwill/brand impairment recognized across three of the last four quarters, which is fully excluded from the company's Adjusted EBITDA every time — and the gap is arguably widening in relevance, since this is now the third such write-down against acquisitions made in FY2024 and earlier, not a single unusual event. The adjustments used to bridge GAAP to Adjusted EBITDA are only partly genuinely one-time: stock-based compensation and the impairments recur every period by construction, and "integration expense" tied to the OWYN deal has now recurred for over two years despite being labeled non-recurring. A model of next year's normalized earnings should start from GAAP, not the company's own non-GAAP Adjusted EBITDA, because the GAAP line captures the real, cash-relevant M&A value destruction that the adjusted number is structurally designed to exclude — even though GAAP EBITDA itself needs the (separately tracked) impairment stripped out to see the underlying operating trend clearly.

### Consensus Bar

For SMPL to beat the current bar by a material margin, the September 2026 price increase would need to land with volume elasticity meaningfully below management's own stated "1 or higher" assumption, and Quest's bar sub-category would need to re-accelerate faster than the roughly 5% consumption decline just posted — neither is baked into the fair, matched near-term guide. The bar is most likely mispriced on the FY2027 out-year, not the FQ4 FY26 print: Street estimates for revenue, EBITDA, and EPS have fallen in every 30/60/90-day window with net-negative revision breadth (−4 to −6), meaning the model most exposed to being wrong is the one nobody has guided yet, not the one due in three months. None of the current consensus appears anchored to a reversible macro tailwind — if anything, the tailwinds (falling interest expense, easier Atkins comps) are already known and small relative to the unresolved price/elasticity and commodity-cost variables.

## 5b. Leverage & Capital Structure

Leverage is within normal range and did not change materially during the period — no dedicated treatment required. Net debt / Adjusted EBITDA was 0.74x at FY2025-end ($206.0M net debt / $278.2M Adjusted EBITDA) and 1.38x on the Latest TTM ($324.6M / $234.6M) [`01_historical-financials.md` §1–2, §6] — a rise of roughly 0.64x, and neither figure clears the 3.0x absolute-leverage trigger or the 1.0x YoY-change trigger. Net debt did rise 57.6% year-over-year ($206.0M → $324.6M) on $242.3M of share buybacks funded while Adjusted EBITDA was falling, which this synthesis flags as a capital-allocation choice worth monitoring (see Section 8), but the absolute change does not clear the "more than 2x" (100%+) threshold that would force a dedicated leverage section here.

## 6. Key Numbers

- Revenue growth rate: TTM revenue −4.5% YoY ($1,392.2M vs. $1,457.6M); four consecutive quarters of YoY decline, FQ4 FY25 (−1.8%) through FQ3 FY26 (−6.3%), widest at FQ2 FY26 (−9.4%) [`01_historical-financials.md` §2–3]
- EBITDA margin: GAAP EBITDA margin 12.3% FY2025 (down from 17.2% FY2024); Adjusted EBITDA margin 16.9% on the Latest TTM (down from 20.2% FY2024) — a genuine ~330bps decline net of the impairment [`01_historical-financials.md` §1–2]
- EPS: GAAP diluted EPS $1.02 FY2025 (down from $1.38 FY2024); Latest TTM diluted EPS $(2.08), driven by the impairment [`01_historical-financials.md` §1–2]
- CFO / EBITDA: 100.3% on a GAAP basis FY2025; 62.9% on an Adjusted-EBITDA basis for the Latest TTM, down from 80.1% in FY2024 [`06_earnings-quality.md` §1–2]
- Biggest driver current level: Quest = 63.7% of nine-month FY26 net sales, household penetration 20.5% (+120bps y/y, multi-year high), but its largest sub-category (bars) declined ~5% on consumption in FQ3 FY26 [`02_revenue-drivers.md` §4, §7]
- Consensus gap: FQ4 FY26 guide midpoint $327.0M vs. consensus $328.53M (+0.5% net sales); Adjusted EBITDA guide $54.5M vs. consensus $54.45M (−0.1%) — essentially matched [`04_guidance-consensus.md` §3]
- Estimate revision direction: Falling in every 30/60/90-day window for FY2027 revenue, EBITDA, and EPS; net revision breadth −6 (revenue), −4 (EBITDA), −5 (EPS) over the last three months [`04_guidance-consensus.md` §4–5]
- Earnings volatility score: 68/100 (inverted, higher = worse), driven mainly by unhedged commodity inflation (~$27M swing) and its correlated interaction with tariffs and the price/elasticity trade-off [`07_earnings-sensitivity.md` §7]
- Net debt trajectory: $206.0M (FY2025-end) → $324.6M (FQ3 FY26), +57.6%, on $242.3M of buybacks funded while Adjusted EBITDA was falling [`01_historical-financials.md` §6]

## 7. What Would Change The Earnings Verdict?

| Current Verdict | What Would Upgrade It | What Would Downgrade It | Data Needed |
|---|---|---|---|
| Mixed earnings setup | A fourth consecutive beat plus an initial FY2027 guide showing the September 2026 price increase landing with volume elasticity below management's own "1 or higher" assumption, combined with FY2027 Street estimates stabilizing rather than continuing to fall, and Quest bar consumption re-accelerating | A miss versus the FQ4 FY26 guided floor ($322M net sales / $52M Adjusted EBITDA), unhedged commodity inflation worsening beyond the guided ~375bps GAAP gross-margin decline, Atkins distribution losses accelerating further, or a fourth impairment/write-down confirming the M&A value-destruction pattern is not yet finished — any of these would tip the setup to "Earnings decelerating." A proven multi-quarter turnaround record is also absent: management itself frames FY2026 as "the early stages," with no 2–3 year delivery track yet, so a downgrade is the more likely near-term move without that proof | The FQ4 FY26 print and initial FY27 guide (due Oct-23-2026); a company-disclosed volume/price/mix walk; a brand-level P&L to confirm which brand actually carries the margin risk; a licensed alt-data consumption panel for early warning ahead of the reported number |

## 8. Note To The Final Synthesizer

- **Dominant earnings trend and driver:** Four straight quarters of YoY revenue decline, a genuine (not impairment-driven) ~330bps Adjusted EBITDA margin compression, and a third impairment in four quarters ($391.9M cumulative) describe a business past its margin peak, not one accelerating — despite three widening consensus beats that risk being narrated as acceleration if read in isolation.
- **Revenue concentration and share loss:** Consolidated retail takeaway fell 6.7% while the underlying category grew 10% in the same 13 weeks — a genuine ~17-point share loss, not merely a soft market; Atkins's structural decline continues (household penetration −220bps y/y, retail takeaway −23% to −25% two quarters running); Walmart and Amazon together are roughly 49% of net sales, both at-will relationships with no minimum-purchase commitments, so a single retailer's shelf-space decision — as already happened once to Atkins — can move total revenue materially.
- **Whether earnings are clean and cash-backed:** Cash conversion itself has not broken down (GAAP CFO/EBITDA 76–100% FY2023–2025), but 4 of 5 accrual-quality flags are triggered (`RF-EQ-001 — rising accruals divergent from cash earnings`, fired in `06_earnings-quality.md`, propagated here per CLAUDE.md §13), the "clean" Adjusted EBITDA metric has now excluded $391.9M of cumulative impairment across three of the last four quarters, and restructuring/integration costs management calls non-recurring have recurred every period for over two years — earnings quality is capped at 44/100, the "Material concerns" band. (`RF-EQ-002`, the cash-conversion-breakdown tag, was tested and explicitly NOT fired by `06_earnings-quality.md` — conversion has weakened but not broken down.)
- **Consensus bar assessment:** FQ4 FY26 guidance and consensus are matched within 0.5% (a fair, not sandbagged, bar), but that same-quarter pattern coincided with a GAAP gross-margin miss versus both guidance and consensus, and FY2027 Street estimates are still falling every 30/60/90-day window with net-negative revision breadth — the setup risks an in-line FQ4 print being masked by a weak initial FY2027 guide.
- **Next-quarter setup and second-quarter look-ahead:** FQ4 FY26 is "balanced" per `05_beat-miss-setup`, complicated by a deliberate under-shipment versus consumption to reset customer inventories. The quarter that actually determines the thesis is FQ1 FY27 — the first full quarter under the September 2026 price increase — and it carries no company guidance yet; treating the near-term "balanced" FQ4 read as resolving the 12-month setup would be a framing error.
- **Top sensitivity variable and direction:** Unhedged commodity/input-cost inflation is the single highest-sensitivity variable (~$27M / ~12% of the FY2026 Adjusted EBITDA guide), zero hedges exist against it, and it compounds with tariffs on the same imported inputs rather than offsetting; the September 2026 price increase built to fix it is mechanically linked to its own volume-elasticity risk, not an independent offset.
- **Whether any partial-data cap applied:** None of the MODULE_RULES score caps bind — consensus, cash flow, transcript, revision history, and segment-revenue data are all present and current. The 44 and 68 scores reflect evidence, not a data-absence penalty.
- **Biggest missing data point:** No brand-level P&L, margin, or EBITDA figure is disclosed anywhere in the filings (SMPL reports one GAAP reportable segment under ASC 280) — every brand-level dollar figure in this module, including the sensitivity table, is a labeled inference, not a filed number.
- **What would change the earnings verdict:** A proven multi-quarter turnaround record (management itself calls FY2026 "the early stages," with no 2–3 year delivery track yet) and resolution of whether the September 2026 price-increase/elasticity trade-off lands inside or outside management's own stated range — see Section 7 for the full upgrade/downgrade table.
- **Capital allocation watch item (non-triggering):** Net debt rose 57.6% year-over-year ($206.0M → $324.6M) on $242.3M of buybacks funded while Adjusted EBITDA was falling — this does not clear either leverage trigger in Section 5b but is a capital-allocation choice worth monitoring given the margin trough.
- **Red-flag severity verdict (verbatim, from `08_earnings-red-flags`):** Material concerns — high-severity flags present; the earnings setup may be overstated or fragile.

## 9. Simple Summary

- Revenue is falling, not growing: four straight quarters of year-over-year decline, driven mainly by Atkins losing shelf space and household penetration, plus a real share loss even in the category (down 6.7% takeaway while the market grew 10%).
- Margins are at a five-year low: gross margin fell from a 40.7% peak in FY2021 to roughly 32.5% in the latest quarter, mainly because of commodity and packaging cost inflation the company has zero hedges against.
- Earnings are not fake, but they are not fully clean either: the cash coming in still roughly matches the reported profit, but the "clean" profit number the company highlights has excluded $391.9 million of write-downs in three of the last four quarters — a real, repeated cost of past acquisitions, not noise.
- The market's near-term bar looks fair, not easy: next-quarter guidance and analyst estimates line up within half a percent, but analysts have been cutting their numbers for the following year every month for the last three months.
- Next quarter's setup is balanced, complicated by a deliberate one-time move: management is shipping less than customers are actually buying to clean up inventory, so the reported number will look weaker than real demand.
- The single biggest swing factor is unhedged input costs (mainly protein and packaging) — a move of about $27 million in profit either way, with no insurance against it, and it is currently trending the wrong way.
- Earnings volatility is high (68 out of 100, where higher is worse) because several of these risk factors — the price increase, commodity costs, and tariffs — tend to move together rather than being independent risks.
- This module is useful for the master synthesizer: it shows a beat streak that could easily be mistaken for improving business, when the real story underneath is falling sales, real margin damage, and a "clean" earnings number that hides a repeated pattern of costly acquisitions gone wrong.



---

## earnings / 00_earnings-data-triage.md

_Source: `00_earnings-data-triage.md`_

# Earnings Data Triage — SMPL

## 0. Jurisdiction & Reporting Regime

| Item | Detected Value | Evidence |
|---|---|---|
| Primary listing country | United States | 10-K cover page: "Delaware" incorporation, SEC filer, Commission File No. 001-38115 [Annual Report on Form 10-K_2025.pdf] |
| Exchange | Nasdaq (NasdaqCM: SMPL) | 10-K cover: "Common Stock … Trading Symbol SMPL … Nasdaq" [Annual Report on Form 10-K_2025.pdf] |
| Filing regime | US SEC | Forms filed are 10-K / 10-Q / DEF 14A-equivalent proxy under Securities Exchange Act of 1934 [Form 10-K_2025.pdf; Form 10-Q(Jul-09-2026).doc; Annual Meeting Proxy Statement_2026.pdf] |
| Reporting standard | US GAAP | 10-K refers to "non-GAAP financial measure" reconciliations (i.e., GAAP is the base); CIQ workbook tabs also state "Acctg. Standard: US GAAP" [Annual Report on Form 10-K_2025.pdf, p.~2; TheSimplyGoodFoodsCompanyNasdaqCMSMPLEstimatesReport.xls — Consensus tab header] |
| Reporting currency | USD | CIQ tabs state "Currency: Reported Currency" / "NasdaqCM:SMPL (USD)"; filings state figures in US$ [TheSimplyGoodFoodsCompanyNasdaqCMSMPLEstimatesReport.xls — Consensus tab; Form 10-K_2025.pdf] |
| Fiscal-year end | Last Saturday in August (FY2025 ended Aug 30, 2025; CIQ states "Current Fiscal Year End: Aug-31-2026") | Form 10-K_2025.pdf cover: "For the fiscal year ended August 30, 2025"; CIQ Consensus tab header: "Current Fiscal Year End: Aug-31-2026" |
| Document language(s) | English (all documents) | Direct read of all extracts — no non-English filing present in this pool |

SMPL is a US domestic filer (Delaware incorporation, Nasdaq-listed). Standard US SEC forms (10-K, 10-Q, DEF 14A-equivalent proxy) apply directly — no local-equivalent substitution is needed here.

## 1. File Inventory

Note on "Last Modified": these timestamps are the Drive-sync dates in this pool (mostly 2026-07-24 or 2026-08-06), not the document's own statement date. Per CLAUDE.md fix F23, "Period Covered" below is parsed from text INSIDE each document. `_pool_extracts/manifest.md` confirms **11 workbooks → 54 tabs, 65 total extract files, 0 extraction failures** — nothing in this pool is in a fail / fallback-text / missing-dependency state, so nothing is treated as absent for the sufficiency verdict.

| Filename | Type | Period Covered | Last Modified | Earnings Relevance |
|---|---|---|---|---|
| Annual Report on Form 10-K_2025.pdf | Annual filing (10-K) | FY2025, fiscal year ended Aug 30, 2025; filed ~Oct 28, 2025 | 2026-08-06 | High |
| The_Simply_Good_Foods_Company_-_Form_10-K(Oct-28-2025).doc | Annual filing (10-K, mhtml/.doc duplicate) | FY2025, fiscal year ended Aug 30, 2025 | 2026-08-06 | High (duplicate of above) |
| The_Simply_Good_Foods_Company_-_Form_10-Q(Jul-09-2026).doc | Quarterly filing (10-Q) | FQ3 FY2026, quarter ended May 30, 2026; filed Jul 9, 2026 | 2026-08-06 | High — most recent quarterly filing |
| The_Simply_Good_Foods_Company_-_Form_10-Q(Apr-09-2026).doc | Quarterly filing (10-Q) | FQ2 FY2026, quarter ended Feb 28, 2026; filed Apr 9, 2026 | 2026-08-06 | High — prior quarter |
| The Simply Good Foods Company, Q3 2026 Earnings Call, Jul 09, 2026.rtf | Earnings transcript — VERBATIM (CIQ/S&P Global Market Intelligence) | FQ3 FY2026 (quarter ended May 30, 2026), call held Jul 9, 2026 | 2026-07-24 | High — most recent transcript, ~1 month old |
| The Simply Good Foods Company, Q2 2026 Earnings Call, Apr 09, 2026.rtf | Earnings transcript — VERBATIM (CIQ/S&P Global Market Intelligence) | FQ2 FY2026 (quarter ended Feb 28, 2026), call held Apr 9, 2026 | 2026-06-25 | High — prior-quarter transcript |
| Annual Meeting Proxy Statement_2026.pdf | Proxy (governance/pay) | 2026 Annual Meeting (held Jan 28, 2026), covering FY2025 comp/board matters | 2026-08-06 | Low — governance, not earnings-driver source; feeds Adj. EBITDA reconciliation reference |
| TheSimplyGoodFoodsCompanyNasdaqCMSMPLEstimatesReport.xls — Consensus | Consensus/estimate export tab | Forward consensus, current as of Jul-09-2026 1:10 PM GMT (574×46) | 2026-08-06 | High |
| TheSimplyGoodFoodsCompanyNasdaqCMSMPLEstimatesReport.xls — Recent Changes | Estimate export tab | 265×10 | 2026-08-06 | Medium |
| TheSimplyGoodFoodsCompanyNasdaqCMSMPLEstimatesReport.xls — Guidance | Guidance data export tab | Latest entry 2026-07-09 (FQ4 FY26 + FY26 guidance) (128×17) | 2026-08-06 | High |
| TheSimplyGoodFoodsCompanyNasdaqCMSMPLEstimatesReport.xls — Multiples | Estimate export tab | 33×7 | 2026-08-06 | Low |
| TheSimplyGoodFoodsCompanyNasdaqCMSMPLEstimatesReport.xls — Surprise | Estimate export tab (beat/miss history) | 288×37 | 2026-08-06 | High |
| TheSimplyGoodFoodsCompanyNasdaqCMSMPLEstimatesReport.xls — Trends | Estimate export tab | 296×18 | 2026-08-06 | Medium |
| TheSimplyGoodFoodsCompanyNasdaqCMSMPLEstimatesReport.xls — Revisions | Estimate export tab (revision history) | 467×18, multi-year forward | 2026-08-06 | High |
| The Simply Good Foods Company NasdaqCM SMPL Financials_Annual.xls — Income Statement | Financial data export | Multi-year annual (115×11) | 2026-07-24 | High |
| The Simply Good Foods Company NasdaqCM SMPL Financials_Annual.xls — Balance Sheet | Financial data export | Multi-year annual (88×11) | 2026-07-24 | High |
| The Simply Good Foods Company NasdaqCM SMPL Financials_Annual.xls — Cash Flow | Financial data export | Multi-year annual (75×11) | 2026-07-24 | High |
| The Simply Good Foods Company NasdaqCM SMPL Financials_Annual.xls — Segments | Financial data export (segment) | Multi-year annual (76×10) | 2026-07-24 | High |
| The Simply Good Foods Company NasdaqCM SMPL Financials_Annual.xls — Key Stats | Financial data export | Multi-year annual (91×12) | 2026-07-24 | Medium |
| The Simply Good Foods Company NasdaqCM SMPL Financials_Annual.xls — Multiples | Financial data export | Multi-year annual (91×41) | 2026-07-24 | Low |
| The Simply Good Foods Company NasdaqCM SMPL Financials_Annual.xls — Historical Capitalization | Financial data export | 39×37 | 2026-07-24 | Low |
| The Simply Good Foods Company NasdaqCM SMPL Financials_Annual.xls — Capital Structure Summary | Financial data export | 97×21 | 2026-07-24 | Medium |
| The Simply Good Foods Company NasdaqCM SMPL Financials_Annual.xls — Capital Structure Details | Financial data export | 26×10 | 2026-07-24 | Low |
| The Simply Good Foods Company NasdaqCM SMPL Financials_Annual.xls — Ratios | Financial data export | Multi-year annual (161×11) | 2026-07-24 | Medium |
| The Simply Good Foods Company NasdaqCM SMPL Financials_Annual.xls — Supplemental | Financial data export | 60×10 | 2026-07-24 | Low |
| The Simply Good Foods Company NasdaqCM SMPL Financials_Annual.xls — Industry Specific | Financial data export | 15×6 | 2026-07-24 | Low |
| The Simply Good Foods Company NasdaqCM SMPL Financials_Annual.xls — Pension OPEB | Financial data export | 21×10 | 2026-07-24 | Low |
| The Simply Good Foods Company NasdaqCM SMPL Financials_Quarterly.xls — Income Statement | Financial data export | Multi-quarter (113×40) | 2026-07-24 | High |
| The Simply Good Foods Company NasdaqCM SMPL Financials_Quarterly.xls — Balance Sheet | Financial data export | Multi-quarter (86×40) | 2026-07-24 | High |
| The Simply Good Foods Company NasdaqCM SMPL Financials_Quarterly.xls — Cash Flow | Financial data export | Multi-quarter (75×40) | 2026-07-24 | High |
| The Simply Good Foods Company NasdaqCM SMPL Financials_Quarterly.xls — Segments | Financial data export (segment) | Multi-quarter (71×40) | 2026-07-24 | High — supports seasonality/QoQ and segment work |
| The Simply Good Foods Company NasdaqCM SMPL Financials_Quarterly.xls — Key Stats | Financial data export | Multi-quarter (91×12) | 2026-07-24 | Medium |
| The Simply Good Foods Company NasdaqCM SMPL Financials_Quarterly.xls — Multiples | Financial data export | Multi-quarter (91×41) | 2026-07-24 | Low |
| The Simply Good Foods Company NasdaqCM SMPL Financials_Quarterly.xls — Historical Capitalization | Financial data export | 39×37 | 2026-07-24 | Low |
| The Simply Good Foods Company NasdaqCM SMPL Financials_Quarterly.xls — Capital Structure Summary | Financial data export | 70×79 | 2026-07-24 | Medium |
| The Simply Good Foods Company NasdaqCM SMPL Financials_Quarterly.xls — Capital Structure Details | Financial data export | 26×10 | 2026-07-24 | Low |
| The Simply Good Foods Company NasdaqCM SMPL Financials_Quarterly.xls — Ratios | Financial data export | Multi-quarter (161×40) | 2026-07-24 | Medium |
| The Simply Good Foods Company NasdaqCM SMPL Financials_Quarterly.xls — Supplemental | Financial data export | 50×40 | 2026-07-24 | Low |
| The Simply Good Foods Company NasdaqCM SMPL Financials_Quarterly.xls — Industry Specific | Financial data export | 15×6 | 2026-07-24 | Low |
| The Simply Good Foods Company NasdaqCM SMPL Financials_Quarterly.xls — Pension OPEB | Financial data export | 15×6 | 2026-07-24 | Low |
| The Simply Good Foods Company NasdaqCM SMPL Credit Health Panel.xls — Summary | Data export (credit) | Multi-period (63×11) | 2026-08-06 | Medium |
| The Simply Good Foods Company NasdaqCM SMPL Credit Health Panel.xls — Financials | Data export (credit) | Multi-period (40×13) | 2026-08-06 | Medium |
| The Simply Good Foods Company NasdaqCM SMPL Credit Health Panel.xls — Operational Metrics Charts | Data export (credit) | 21×19 | 2026-08-06 | Low |
| The Simply Good Foods Company NasdaqCM SMPL Credit Health Panel.xls — Solvency Metrics Charts | Data export (credit) | 18×19 | 2026-08-06 | Low |
| The Simply Good Foods Company NasdaqCM SMPL Credit Health Panel.xls — Liquidity Metrics Charts | Data export (credit) | 15×19 | 2026-08-06 | Low |
| The Simply Good Foods Company NasdaqCM SMPL Credit Health Panel.xls — Disclaimer | Non-data (boilerplate) | 26×1 | 2026-08-06 | None |
| Company Comparable Analysis The Simply Good Foods Company.xls — Financial Data | Data export (peer comps) | Multi-period (50×17) | 2026-07-24 | Low — peer benchmarking, not SMPL-specific earnings |
| Company Comparable Analysis The Simply Good Foods Company.xls — Trading Multiples | Data export (peer comps) | Current (50×9) | 2026-07-24 | Low |
| Company Comparable Analysis The Simply Good Foods Company.xls — Operating Statistics | Data export (peer comps) | Multi-period (50×13) | 2026-07-24 | Low |
| Company Comparable Analysis The Simply Good Foods Company.xls — Business Description | Data export (peer comps) | Current (44×3) | 2026-07-24 | None |
| Company Comparable Analysis The Simply Good Foods Company.xls — Implied Valuation | Data export (peer comps) | Current (69×9) | 2026-07-24 | None (valuation, out of scope for this module) |
| Company Comparable Analysis The Simply Good Foods Company.xls — Valuation Chart | Data export (peer comps) | Time-series (32×2) | 2026-07-24 | None |
| Company Comparable Analysis The Simply Good Foods Company.xls — Credit Health Panel | Data export (peer comps) | Multi-period (48×10) | 2026-07-24 | Low |
| Company Comparable Analysis The Simply Good Foods Company.xls — Disclaimer | Non-data (boilerplate) | 26×1 | 2026-07-24 | None |
| Short_Interest_12m_SMPL.xls — Chart 1 with Data | Data export (short interest) | Trailing 12 months (284×2) | 2026-08-06 | Low — not earnings-driver data |
| Short_Interest_12m_SMPL.xls — Attributions | Non-data (boilerplate) | 45×1 | 2026-08-06 | None |
| TheSimplyGoodFoodsCompanyNasdaqCMSMPL_PublicCompany.pdf | Data export (CIQ company profile) | Undated snapshot | 2026-08-06 | Low |
| The Simply Good Foods Company NasdaqCM SMPL Key Developments.rtf | Data export (CIQ news/events feed) | Rolling log, no single period | 2026-07-24 | Medium — may carry guidance/press-release event dates |
| The Simply Good Foods Company NasdaqCM SMPL Public Company Profile.rtf | Data export (CIQ company profile) | Current snapshot | 2026-07-24 | Low |
| The Simply Good Foods Company NasdaqCM SMPL Public Ownership Summary.rtf | Data export (CIQ ownership) | Current snapshot | 2026-08-06 | None (governance, not earnings) |
| The Simply Good Foods Company NasdaqCM SMPL Events Calendar.xls — Events Calendar | Data export (CIQ events) | Forward calendar (30×3) | 2026-08-06 | Medium — next earnings-date catalyst |
| The Simply Good Foods Company NasdaqCM SMPL Customers.xls — Customers | Data export (customer list) | Current (20×6) | 2026-07-24 | Low |
| The Simply Good Foods Company NasdaqCM SMPL Suppliers.xls — Suppliers | Data export (supplier list) | Current (38×8) | 2026-07-24 | Low |
| The Simply Good Foods Company NasdaqCM SMPL Public Ownership History.xls — History | Data export (ownership) | Historical (600×6) | 2026-08-06 | None (governance, not earnings) |
| The Simply Good Foods Company NasdaqCM SMPL Public Ownership Insider Trading.xls — Insider Trading | Data export (insider trades) | Historical log (455×11) | 2026-08-06 | Low — potential red-flag input for agent 08 |

No investor-presentation / investor-deck file is present in this pool.

## 1A. External Data

No `data/SMPL/external/` directory exists in the pool. No externally sourced research (alt-data panels, expert-call notes, channel checks, broker research, paid-API pulls) is present. This section is empty by design — nothing here moved (or could move) the sufficiency verdict.

## 2. Most Recent Sources

| Source Type | Filename | Period | Age (months, vs 2026-08-06) |
|---|---|---|---|
| Annual filing | Annual Report on Form 10-K_2025.pdf | FY2025, ended Aug 30, 2025; filed Oct 28, 2025 | ~9.3 months since filing |
| Quarterly filing | The_Simply_Good_Foods_Company_-_Form_10-Q(Jul-09-2026).doc | FQ3 FY2026, ended May 30, 2026; filed Jul 9, 2026 | ~1 month |
| Earnings transcript | The Simply Good Foods Company, Q3 2026 Earnings Call, Jul 09, 2026.rtf | FQ3 FY2026 call, Jul 9, 2026 | ~1 month |
| Investor deck | Not present in pool | — | — |
| Consensus / estimate export | TheSimplyGoodFoodsCompanyNasdaqCMSMPLEstimatesReport.xls — Consensus | Data as of Jul-09-2026 1:10 PM GMT | ~1 month |
| Cash flow data | The Simply Good Foods Company NasdaqCM SMPL Financials_Quarterly.xls — Cash Flow | Multi-quarter through FQ3 FY2026 | ~1 month (latest quarter) |
| Guidance data | TheSimplyGoodFoodsCompanyNasdaqCMSMPLEstimatesReport.xls — Guidance | Latest entry 2026-07-09: FQ4 FY26 net sales guided $322M–$332M and FY26 net sales guided $1.345B–$1.355B | ~1 month |

## 3. Earnings Usability Check

| Requirement | Available? (Y/N) | Source | Why It Matters |
|---|---|---|---|
| Income statement | Y | 10-K FY2025; 10-Q FQ2/FQ3 FY2026; CIQ Financials_Annual/Quarterly — Income Statement tabs | Needed for revenue, margin, EPS |
| Balance sheet | Y | 10-K FY2025; 10-Q FQ2/FQ3 FY2026; CIQ Financials_Annual/Quarterly — Balance Sheet tabs | Needed for working capital and leverage |
| Cash flow statement | Y | 10-K FY2025; 10-Q FQ2/FQ3 FY2026; CIQ Financials_Annual/Quarterly — Cash Flow tabs | Needed for CFO, FCF, earnings quality |
| Latest quarter | Y | 10-Q FQ3 FY2026 (quarter ended May 30, 2026), filed Jul 9, 2026 | Needed for trend and setup |
| Last 8 quarters | Y | CIQ Financials_Quarterly.xls — Income Statement/Balance Sheet/Cash Flow tabs (multi-quarter, 40 cols wide) | Needed for seasonality and inflection |
| Consensus estimates | Y | TheSimplyGoodFoodsCompanyNasdaqCMSMPLEstimatesReport.xls — Consensus tab, current as of Jul-09-2026 | Needed for market bar |
| Estimate revisions | Y | TheSimplyGoodFoodsCompanyNasdaqCMSMPLEstimatesReport.xls — Revisions + Recent Changes tabs | Needed for revision momentum |
| Earnings transcript | Y — VERBATIM | Q2 FY26 (Apr 9, 2026) and Q3 FY26 (Jul 9, 2026) CIQ/S&P Global Market Intelligence transcripts, prepared remarks + Q&A, named execs (Scalzo/CEO, Bealer/CFO, Siler/IR) and named sell-side analysts | Needed for management tone and driver detail |
| Segment P&L | Y | CIQ Financials_Annual.xls — Segments tab (76×10); Financials_Quarterly.xls — Segments tab (71×40); reconciles with business-model `03_segment-map.md` | Needed for mix shift |
| Current price | N — not directly checked in this triage; short-interest and comps workbooks carry market data but no explicit "current price" line was confirmed in this pass | Company Comparable Analysis.xls — Trading Multiples / peer comps carries pricing context; downstream agent 99 should re-verify a dated current price directly | Needed only for master-level stock reaction context |

## 4. Cross-Module Availability

| Business-Model Output | Available? (Y/N) |
|---|---|
| 03_segment-map.md | Y — present at `analyses/SMPL_2026-08-06/business-model/03_segment-map.md` |
| 06_value-chain.md | Y — present at `analyses/SMPL_2026-08-06/business-model/06_value-chain.md` |
| 10_external-dependency.md | Y — present at `analyses/SMPL_2026-08-06/business-model/10_external-dependency.md` |

The full business-model module (00 through 99, plus dossier) has already run and is available at `analyses/SMPL_2026-08-06/business-model/`.

## 5. Partial-Data Flags

| Missing Data | Applies? (Y/N) | Affected Agents | Cap Applied |
|---|---|---|---|
| No consensus / estimate data | N — consensus, revisions, and surprise history are all present and current (data as of Jul-09-2026) | 04, 05, 99 | Not applicable |
| No quarterly data | N — CIQ quarterly workbooks carry multi-quarter history and the two most recent 10-Qs are present | 01, 02, 03, 06 | Not applicable |
| No VERBATIM transcript, sell-side proxy present | N — this pool has TWO verbatim CIQ transcripts (Q2 FY26, Q3 FY26); no proxy needed | 02, 03, 04 | Not applicable |
| No transcript AND no sell-side proxy | N | 02, 03, 04 | Not applicable |
| No segment-level P&L | N — CIQ Segments tabs present in both annual and quarterly workbooks | 02, 03, 99 | Not applicable |
| No cash flow statement | N — cash flow present in 10-K, both 10-Qs, and CIQ Financials_Annual/Quarterly Cash Flow tabs | 06, 99 | Not applicable |
| No current price | Possible — a dated current-price figure was not directly confirmed in this triage pass (only peer-comp trading multiples were spot-checked); downstream agent 99 should re-verify directly from the comps or CIQ profile export | 99 | If confirmed absent: do not discuss stock-reaction precision; earnings-only verdict (per MODULE_RULES.md) |

## 6. Sufficiency Verdict

- **Verdict:** Sufficient
- **Reason:** The pool has a recent annual filing (FY2025 10-K), the latest quarterly filing (FQ3 FY2026 10-Q, ended May 30, 2026, filed Jul 9, 2026, ~1 month old), TWO verbatim CIQ earnings-call transcripts (Q2 and Q3 FY2026, full trust for tone/candor and driver detail), full income statement / balance sheet / cash flow statement at both annual and multi-quarter granularity, segment-level P&L, and a current consensus/estimate export with revision and surprise history — every element the Sufficient bar requires is present and none of the 65 pool extracts failed.
- **Active partial-data caps:** None bind. (Watch item, not a cap: agent 99 should independently re-verify a dated current price before discussing stock-reaction context — see Section 3/5 above.)
- **Critical missing items:** None. No investor-presentation deck is present, but this is a Low-relevance gap only (investor decks are the lowest tier in the module's own source hierarchy and every higher-tier source — filings, transcripts, CIQ financials, consensus — is present).



---

## earnings / 01_historical-financials.md

_Source: `01_historical-financials.md`_

# Historical Financials — SMPL

**Jurisdiction / regime:** US domestic filer (Delaware incorporation, Nasdaq: SMPL). US GAAP. Reporting currency: USD, in millions unless stated otherwise. Fiscal year ends the last Saturday in August (FY2025 ended August 30, 2025; FY2024 was a 53-week year ended August 31, 2024). [FY2025 10-K, cover page and Note 2 (Summary of Significant Accounting Policies)]

**Reporting structure note:** SMPL discloses one GAAP reportable segment (ASC 280) even though it manages three brands internally (Quest, Atkins, OWYN) — no brand-level profit or EBITDA is disclosed, only brand-level revenue. All figures below are consolidated. [FY2025 10-K, Note 15 (Segment and Customer Information); confirmed in `business-model/03_segment-map.md`]

**A note on EBIT/EBITDA sourcing (read before using the tables below):** Capital IQ's "Operating Income" and "EBITDA" supplemental line items reclassify loss on impairment, business-transaction costs, and M&A/integration-related restructuring charges as below-the-line "unusual items" excluded from operating income — this differs from the company's own GAAP income statement, which includes those costs as operating expenses. For FY2021–FY2023, this makes no difference (SMPL had zero such items in those years, confirmed from the same CIQ workbook's own unusual-items rows, so CIQ = GAAP). For FY2024 and FY2025 the two bases diverge materially (OWYN acquisition integration costs from FQ2 FY2024, and a $60.9 million intangible impairment in FQ4 FY2025), so this report uses the company's own GAAP "Income from operations" and GAAP EBITDA reconciliation from the 10-K for FY2024–FY2025, not the CIQ figure. This divergence is the single biggest data-quality issue in this pool and is analyzed in full in Section 4 and Section 6.

## 1. Annual Financial Table (5 years, USD millions unless noted)

| Metric | FY2021 | FY2022 | FY2023 | FY2024 (53wk) | FY2025 | Trend |
|---|---:|---:|---:|---:|---:|---|
| Revenue | 1,005.6 | 1,168.7 | 1,242.7 | 1,331.3 | 1,450.9 | Inflecting |
| Revenue YoY % | n/a | +16.2% | +6.3% | +7.1% | +9.0% | — |
| Gross Profit | 409.8 | 445.6 | 453.4 | 511.6 | 525.7 | Decelerating |
| Gross Margin % | 40.7% | 38.1% | 36.5% | 38.4% | 36.2% | Decelerating |
| EBITDA (GAAP) | 196.1 | 222.2 | 225.2 | 228.8 | 177.9 | Inflecting |
| EBITDA Margin % | 19.5% | 19.0% | 18.1% | 17.2% | 12.3% | Decelerating |
| EBIT (GAAP Income from Operations) | 178.0 | 202.9 | 204.9 | 206.5 | 156.9 | Decelerating |
| EBIT Margin % | 17.7% | 17.4% | 16.5% | 15.5% | 10.8% | Decelerating |
| EPS (diluted) | $0.42 | $1.08 | $1.32 | $1.38 | $1.02 | Decelerating |
| CFO | 132.1 | 110.6 | 171.1 | 215.7 | 178.5 | Volatile |
| Capex | 5.9 | 5.2 | 11.6 | 5.7 | 20.5 | Volatile |
| FCF (CFO – Capex) | 126.2 | 105.4 | 159.5 | 210.0 | 157.9 | Volatile |
| Working Capital (Curr. Assets − Curr. Liab.) | 185.0 | 249.4 | 281.8 | 331.7 | 329.1 | Stable |
| Net Debt (total debt incl. finance leases − cash) | 424.9 | 386.5 | 238.9 | 304.8 | 206.0 | Decelerating (i.e., falling) |
| Net Debt / EBITDA | 2.17x | 1.74x | 1.06x | 1.33x | 1.16x | Stable |

Margin change, YoY, in basis points (bps): Gross margin FY22 −260bps, FY23 −160bps, FY24 +190bps, FY25 −220bps. EBITDA margin FY22 −50bps, FY23 −90bps, FY24 −90bps, FY25 **−490bps**. EBIT margin FY22 −34bps, FY23 −87bps, FY24 −98bps, FY25 **−470bps**. [Computed by agent from the sourced figures below; see Bash computation log referenced in Section 7]

Sourcing by year: Revenue, Gross Profit, EBIT, EBITDA, EPS, CFO, and Capex for FY2023–FY2025 are the company's own GAAP figures from the FY2025 10-K (three-year income statement and cash-flow statement) [1]. FY2021–FY2022 figures for the same lines come from the Capital IQ annual financials export [2] because no 10-K for those years is in this pool — CIQ's figures equal GAAP for those two years because SMPL had zero loss-on-impairment, business-transaction, or restructuring items in FY2021–FY2022 (confirmed from the same CIQ workbook's own "unusual items" rows, all blank for those columns). Net Debt and Working Capital for all five years are sourced from the CIQ annual balance-sheet export [2]; CIQ's "Total Debt" includes finance-lease liabilities in addition to funded debt, so Net Debt here is on a **broad** basis (funded debt + finance leases − cash), labeled accordingly per CLAUDE.md §15.

FCF = CFO − Capex (capex taken as an absolute value; SMPL reports capex as a negative investing cash flow) [1, 2].

## 2. TTM Snapshot

Latest TTM = twelve months ended May 30, 2026 (FQ4 FY2025 + FQ1–FQ3 FY2026). Prior TTM = twelve months ended May 31, 2025 (FQ4 FY2024 + FQ1–FQ3 FY2025).

| Metric | Latest TTM (to May-30-26) | Prior TTM (to May-31-25) | Change | Evidence |
|---|---:|---:|---:|---|
| Revenue | $1,392.2M | $1,457.6M | −4.5% | [3][4][5] quarterly net sales, summed |
| EBITDA (GAAP, reported) | $(213.1)M | ~$255.6M* | Swing of ~$469M | [3][4][5][6] — see impairment note below |
| EBIT (GAAP) | $(243.3)M | ~$228.0M* | Swing of ~$471M | Derived: EBITDA − D&A, both TTM |
| EPS diluted | $(2.08) | n/a (sum of quarters ≈ $1.43) | n/a | [2] CIQ LTM column (official LTM EPS calc, not a simple sum of quarterly EPS) |
| CFO | $147.5M | $182.0M | −19.0% | [3][4][5][6] quarterly cash flow, summed |
| Capex | $28.1M | $6.4M | +$21.7M | [3][4][5][6] |
| FCF | $119.4M | $175.6M | −32.0% | CFO − Capex, both TTM |
| Net debt at latest period-end (May-30-26) | $324.6M | $206.7M (May-31-25) | +$117.9M (+57%) | [7] quarterly balance sheet, point-in-time |

\* The Prior TTM EBITDA/EBIT figures mix bases: FQ1–FQ3 FY2025 use GAAP-derived EBITDA (see Section 3 workings); FQ4 FY2024 uses the CIQ EBITDA figure ($71.7M) because no FY2024 10-Q is in this pool to derive the GAAP-only figure directly, and CIQ's figure for that single quarter modestly overstates true GAAP EBITDA (by an amount consistent with the ~$5–9M per-quarter OWYN-integration-cost exclusion seen in FY2024's other quarters). This is flagged, not silently used — treat the Prior TTM EBITDA/EBIT figures as approximate, not exact.

**The dominant fact in this table:** GAAP EBITDA and EBIT swung from solidly positive to sharply negative over the last four quarters, entirely because of a $391.9 million non-cash goodwill/brand impairment recognized across FQ4 FY2025, FQ2 FY2026, and FQ3 FY2026 [8]. Stripping that out, the company's own **Adjusted EBITDA** (its primary non-GAAP KPI, defined in Note/MD&A as EBITDA further adjusted for loss on impairment, stock-based compensation, business-transaction costs, inventory step-up, integration expense, term-loan fees, and restructuring) was **$234.6M for the Latest TTM**, built from FQ4 FY2025 ($66.2M) + FQ1 FY2026 ($55.6M) + FQ2 FY2026 ($55.5M) + FQ3 FY2026 ($57.2M) [3][4][5][9]. That is still a decline: Adjusted EBITDA margin was 20.2% in FY2024, 19.2% in FY2025, and has fallen further to 16.9% on the Latest TTM [1][9] — a genuine, non-impairment-related margin compression of roughly 330 basis points over the last twelve months, not just an accounting artifact of the write-down. Net debt / Adjusted EBITDA (Latest TTM) = 1.38x; Net debt / GAAP EBITDA is not a meaningful ratio in the Latest TTM column because the denominator is negative.

## 3. Latest Quarterly Trend Table (8 quarters, USD millions unless noted)

| Metric | FQ4 FY24 (Aug-31-24) | FQ1 FY25 (Nov-30-24) | FQ2 FY25 (Mar-1-25) | FQ3 FY25 (May-31-25) | FQ4 FY25 (Aug-30-25) | FQ1 FY26 (Nov-29-25) | FQ2 FY26 (Feb-28-26) | FQ3 FY26 (May-30-26) | QoQ Trend | YoY vs Same Q |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---|---|
| Revenue | 375.7 | 341.3 | 359.7 | 381.0 | 369.0 | 340.2 | 326.0 | 357.0 | Volatile | −6.3% (vs FQ3FY25) |
| Gross Margin % | 39.7% | 38.5% | 36.2% | 36.4% | 34.3% | 32.3% | 31.6% | 34.3% | Decelerating | −210bps (vs FQ3FY25's 36.4%) |
| EBITDA (GAAP) | 71.7†CIQ | 59.8 | 59.7 | 64.3 | (5.9) | 43.8 | (207.2) | (43.8) | Volatile | n/m — impairment in prior-yr comp is zero |
| EBITDA Margin % | 19.1%†CIQ | 17.5% | 16.6% | 16.9% | −1.6% | 12.9% | −63.6% | −12.3% | Decelerating | n/m |
| EPS (diluted) | $0.29 | $0.38 | $0.36 | $0.40 | $(0.12) | $0.26 | $(1.73) | $(0.58) | Volatile | n/m |

† FQ4 FY24 EBITDA is the CIQ figure (Capital IQ Financials_Quarterly, Income Statement tab), not a GAAP-reconciled figure — no FY2024 10-Q is in this pool to derive the exact GAAP number for that single quarter. All other EBITDA figures in this row (FQ1 FY25 through FQ3 FY26) are GAAP-consistent: FQ2 FY25, FQ3 FY25, FQ2 FY26, and FQ3 FY26 are the company's own disclosed GAAP EBITDA from the two 10-Qs' non-GAAP reconciliation tables [3][4]; FQ1 FY25, FQ4 FY25, and FQ1 FY26 are derived by subtracting disclosed year-to-date figures (e.g., FQ4 FY25 EBITDA = FY2025 full-year GAAP EBITDA of $177.9M minus the 39-week YTD GAAP EBITDA of $183.8M disclosed in the Q3 FY2026 10-Q) [1][3].

Revenue YoY vs same quarter one year earlier, all four most recent quarters: FQ4 FY25 vs FQ4 FY24 −1.8%; FQ1 FY26 vs FQ1 FY25 −0.3%; FQ2 FY26 vs FQ2 FY25 −9.4%; FQ3 FY26 vs FQ3 FY25 −6.3% [3][4][5]. Four consecutive quarters of YoY revenue decline.

QoQ revenue changes, most recent 7 transitions: FQ1FY25 −9.2%, FQ2FY25 +5.4%, FQ3FY25 +5.9%, FQ4FY25 −3.1%, FQ1FY26 −7.8%, FQ2FY26 −4.2%, FQ3FY26 +9.5% [3][4][5]. Some of this QoQ swing is ordinary seasonality (see Section 5 — Q1 is consistently the smallest quarter); the YoY reads above strip that out and are the more reliable signal.

## 4. Reported vs Adjusted Metrics

The company discloses a GAAP-to-Adjusted-EBITDA reconciliation every quarter and every fiscal year. It does **not** disclose an adjusted EPS or adjusted net income figure, and it does not separately reconcile an "adjusted EBIT."

| Metric | Reported (GAAP) | Adjusted (company non-GAAP) | Adjustment Amount | Adjustment Reason | Evidence |
|---|---:|---:|---:|---|---|
| EBITDA — FQ3 FY2026 (13wk, May-30-26) | $(43.8)M | $57.2M | $101.1M | Loss on impairment $82.0M (OWYN $13.0M + Atkins $31.0M + goodwill $38.0M); SBC $5.6M; integration expense $5.2M; restructuring/other $13.5M | [3] |
| EBITDA — FQ3 FY2025 (13wk, May-31-25, comp) | $64.3M | $73.9M | $9.5M | SBC $4.0M; integration expense $5.2M; other $0.3M (no impairment) | [3] |
| EBITDA — FY2025 (52wk) | $177.9M | $278.2M | $100.2M | Loss on impairment $60.9M (Atkins); SBC $15.3M; integration expense $20.9M; business-transaction costs $0.8M; inventory step-up $1.4M; term-loan fees $0.7M; other $0.2M | [1] |
| EBITDA — FY2024 (53wk) | $228.8M | $269.1M | $40.4M | SBC $18.4M; integration expense $0.6M; business-transaction costs $14.5M (OWYN deal); executive-transition costs $3.9M; inventory step-up $3.2M; other $(0.3)M (no impairment) | [1] |
| EBIT | Not separately reconciled by the company | — | — | Company only reconciles net income → EBITDA → Adjusted EBITDA; no adjusted operating-income figure is disclosed | [1][3] |
| EPS (diluted) | GAAP diluted EPS shown in Sections 1–3 | Not disclosed | — | Company does not disclose adjusted net income or adjusted EPS | [1][3] |

The scale of the FQ2 FY2026 adjustment is the largest in the pool and is not shown above only for space: reported (GAAP) EBITDA for the 13 weeks ended February 28, 2026, was $(207.2)M against Adjusted EBITDA of $55.5M — a $262.7M gap, almost entirely the $249.0M OWYN/Atkins/goodwill impairment recognized that quarter [4].

## 5. Quarterly Seasonality Table (last 3 fiscal years)

| Quarter | FY2023 Rev Share | FY2024 Rev Share | FY2025 Rev Share | Avg Rev Share | FY2023 EBITDA Margin | FY2024 EBITDA Margin | FY2025 EBITDA Margin |
|---|---:|---:|---:|---:|---:|---:|---:|
| Q1 | 24.2% | 23.2% | 23.5% | 23.6% | 19.1% | 18.7%† | 17.5% |
| Q2 | 23.9% | 23.5% | 24.8% | 24.0% | 16.1% | 17.1%† | 16.6% |
| Q3 | 26.1% | 25.1% | 26.3% | 25.8% | 18.5% | 20.0%† | 16.9% |
| Q4 | 25.8% | 28.2% | 25.4% | 26.5% | 19.7% | 19.1%† | −1.6% |

No quarter in any of the three years exceeds 30% or falls below 20% of annual revenue — this is mild, not severe, seasonality. Q1 (the quarter ending in late November, covering the September–November period) is consistently the smallest quarter (23–24% of the year); Q3 and Q4 (the quarters ending in the May–August window) are consistently the largest (25–28%). [2][3] quarterly revenue by fiscal quarter, cross-checked to sum to each year's audited annual revenue exactly.

† FY2024 EBITDA-margin cells use the CIQ quarterly EBITDA figure, not a GAAP-reconciled one — no FY2024 10-Qs are in this pool. Because FY2024 (starting FQ2, the OWYN acquisition quarter) carries integration and business-transaction costs that CIQ excludes but GAAP includes, these four cells likely overstate true GAAP quarterly margin by a few hundred basis points each (the full-year gap was $20.9M on $228.8M of GAAP EBITDA — about 9% of the annual figure). FY2023 cells (pre-OWYN, zero reclassified items that year) are GAAP-equivalent. FY2025 cells are GAAP-derived per the Section 3 workings and correctly show the FQ4 FY2025 impairment quarter turning EBITDA margin negative.

## 6. Key Trend Summary

Revenue growth is **inflecting negative**: five straight years of GAAP revenue growth (+16.2% FY22, +6.3% FY23, +7.1% FY24, +9.0% FY25) reversed into four consecutive quarters of year-over-year decline (FQ4 FY25 through FQ3 FY26, ranging from −0.3% to −9.4%), pulling trailing-twelve-month revenue down 4.5% to $1,392.2M [1][3][4][5]. Margins are **compressing** on every basis tested: gross margin fell from 40.7% (FY21) to 36.2% (FY25) and further to roughly 31–34% in the last three quarters; and even the company's own cleaned-up Adjusted EBITDA margin — which excludes the impairment — fell from 20.2% (FY24) to 19.2% (FY25) to 16.9% (Latest TTM), a genuine ~330bps deterioration that is not an artifact of the write-down [1][3][4][9]. Seasonality is mild, not material: no quarter takes more than 30% or less than 20% of annual revenue in any of the last three fiscal years, though Q1 (Sep–Nov) is consistently the smallest and Q3/Q4 (Mar–Aug) consistently the largest [2][3]. The clear **inflection point** in this dataset is the $391.9 million combined goodwill and brand-intangible impairment (OWYN $200.0M, Atkins $124.0M, goodwill $38.0M in the 39 weeks ended May 30, 2026, plus a separate $60.9M Atkins impairment in FQ4 FY2025) [8], recognized after "a sustained decline in the Company's share price and declines in the Company's market capitalization" triggered an interim goodwill/intangible test [8] — this drove three of the last four quarters' GAAP net income and EBITDA deeply negative and coincided with a CEO departure and a change in principal accounting officer inside the same two-to-three-quarter window (flagged separately and in more depth in `business-model/11_capital-allocation-governance.md` and `business-model/12_red-flags-sweep.md`). Net debt fell steadily from FY21 ($424.9M) to FY25 ($206.0M) as the company paid down its Term Facility, but has since risen back to $324.6M by FQ3 FY26 [1][2][7], driven by continued share buybacks ($242.3M repurchased across the last four quarters [3][4][5][6]) funded while Adjusted EBITDA was falling — a capital-allocation choice this report flags but does not evaluate (that is `margin-drivers`/`earnings-quality`/business-model scope).

## 7. Citations

[1] FY2025 10-K (filed Oct-28-2025), Consolidated Statements of Income and Comprehensive Income (52-weeks ended Aug-30-2025 / 53-weeks ended Aug-31-2024 / 52-weeks ended Aug-26-2023); Consolidated Balance Sheets (Aug-30-2025 / Aug-31-2024); Consolidated Statements of Cash Flows (same three years); MD&A "Reconciliation of EBITDA and Adjusted EBITDA" (FY2025 vs FY2024)
[2] The Simply Good Foods Company NasdaqCM SMPL Financials_Annual.xls — Income Statement, Balance Sheet, and Cash Flow tabs (Capital IQ & Proprietary Data, Annual, FY2017–FY2025 plus LTM to May-30-2026)
[3] Q3 FY2026 10-Q (filed Jul-09-2026), Consolidated Statements of Operations (13 & 39 weeks ended May-30-2026 and May-31-2025); MD&A "Reconciliation of EBITDA and Adjusted EBITDA" (13wk and 39wk, both years)
[4] Q2 FY2026 10-Q (filed Apr-09-2026), Consolidated Statements of Operations (13 & 26 weeks ended Feb-28-2026 and Mar-1-2025); MD&A "Reconciliation of EBITDA and Adjusted EBITDA" (13wk and 26wk, both years)
[5] The Simply Good Foods Company NasdaqCM SMPL Financials_Quarterly.xls — Income Statement tab (Capital IQ & Proprietary Data, Quarterly, FQ1 FY2017–FQ3 FY2026)
[6] The Simply Good Foods Company NasdaqCM SMPL Financials_Quarterly.xls — Cash Flow tab (same coverage)
[7] The Simply Good Foods Company NasdaqCM SMPL Financials_Quarterly.xls — Balance Sheet tab (same coverage)
[8] Q3 FY2026 10-Q (filed Jul-09-2026), Note 4 (Goodwill and Intangibles) — goodwill impairment $38.0M, OWYN impairment $13.0M (13wk)/$200.0M (39wk), Atkins impairment $31.0M (13wk)/$93.0M (39wk); MD&A "Loss on impairment" discussion ($82.0M for 13wk, $331.0M for 39wk ended May-30-2026); FY2025 10-K, Income Statement, Loss on impairment line ($60.928M, FY2025)
[9] Derived by agent: quarterly Adjusted EBITDA for FQ1 FY2025, FQ4 FY2025, and FQ1 FY2026 computed by subtracting a disclosed shorter-period (13-week) Adjusted EBITDA figure from the corresponding disclosed longer-period (26-week/39-week/52-week) Adjusted EBITDA figure, both from the same primary source [1][3][4]; all four component quarters cross-checked to sum to the disclosed FY2025/FY2024 annual Adjusted EBITDA figures exactly

Note on method: all growth rates, margin bps changes, TTM sums, FCF, and leverage ratios in this report were computed with an executed Python script (via the Bash tool) from the sourced figures above, not by mental arithmetic; representative script output is retained in the agent's working notes for this run.



---

## earnings / 02_revenue-drivers.md

_Source: `02_revenue-drivers.md`_

# Revenue Drivers — SMPL

**Reporting basis:** US GAAP, USD, fiscal year ends the last Saturday in August (FY2025 = 52 weeks ended Aug-30-2025; FY2024 = 53 weeks ended Aug-31-2024). [FY2025 10-K, cover page and Note 2]

## 1. Segment Decomposition Status

Segment decomposition applied, with a caveat: SMPL legally discloses **one** GAAP reportable segment under ASC 280 — the CEO (Chief Operating Decision Maker) reviews only consolidated net income, and no brand-level profit, EBITDA, or margin figure is disclosed anywhere in the filings [FY25 10-K, Note 15 (Segment and Customer Information); confirmed in `business-model/03_segment-map.md` §1]. The company DOES disclose **revenue** by brand (Quest, Atkins, OWYN) plus a small International line as part of a revenue-disaggregation note, and this is the decomposition used below — it is a revenue-only proxy for segments, not a GAAP segment, and profit share is "Not disclosed" for every brand. This follows the business-model module's `03_segment-map.md`, which is available for this run.

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
| Multi-segment | Sum of segment revenue drivers |

**SMPL's own formula:** Net sales = Σ across three brands (Quest, Atkins, OWYN) of [household penetration (% of US households buying the brand) × buy rate (purchase frequency/volume per buying household) × realized price net of trade promotion], converted from retail consumption into reported net sales through a shipment/channel-inventory timing gap, sold through a small number of large retail customers (Walmart ~31% and Amazon ~18% of FY2025 consolidated net sales) [FY25 10-K, Item 1A; `business-model/04_unit-economics.md` §1; `business-model/05_customer-geography.md` §1]. The company itself runs the business on household penetration and buy rate, not on a disclosed unit/price figure: "If you look at the fundamental metrics around brand health, that's households. So are we growing households, are we growing buy rate" [Q2 FY26 earnings call, Apr 9, 2026, CEO Q&A, cited via `business-model/04_unit-economics.md`]. No per-unit price, volume-per-case, or unit-count figure is disclosed anywhere in the pool, so a literal volume × price formula cannot be built from filings; household penetration × buy rate is the closest disclosed proxy for "volume," and price is only ever discussed qualitatively (a planned list-price increase, and a stated over-reliance on trade promotion) — never as a per-unit dollar figure.

## 3. Market / Share / Price / Mix Split

| Driver Bucket | Current Direction | Evidence | Importance /100 |
|---|---|---|---:|
| End-market demand | Growing — the "purposeful nutrition" category (Circana MULO++C measured-channel data) grew 10% in the 13 weeks ended May 30, 2026 | Q3 FY26 earnings call, Jul 9 2026, CEO prepared remarks | 60 |
| Company market share | Deteriorating — SMPL's own consolidated retail takeaway declined 6.7% in the same 13-week period the category grew 10%, a roughly 17-percentage-point share loss in one quarter; Atkins specifically lost Walmart shelf space during FY2025 | Q3 FY26 earnings call, Jul 9 2026, CEO prepared remarks; FY25 10-K, Item 1A (Walmart reduced Atkins assortment) | 85 |
| Price / realization | Roughly flat currently, with a stated structural weakness — the CEO named "over-reliance on price promotion" as one of the P&L's structural problems, without a dollar figure. A high single-digit list-price increase across most of the portfolio is announced for September 2026 (the start of FY2027) — it is not in the FY2026 revenue base yet | Q3 FY26 earnings call, Jul 9 2026, prepared remarks and Q&A | 55 (forward-looking; near-zero in the current run-rate) |
| Product / customer / geography mix | Shifting toward Quest and away from Atkins: Quest rose from 59.5% of FY2025 net sales to 63.7% of the nine months ended May 30, 2026, while Atkins fell from 29.0% to 24.9% over the same comparison; within Quest, chips (+17% consumption in FQ3 FY26) and milkshakes (+~50%) are outgrowing bars (−5% consumption) | FY25 10-K, Note 15; FQ3 FY26 10-Q, Note 12; Q3 FY26 earnings call, Jul 9 2026 | 50 |
| FX translation | Immaterial — International net sales were ~2.0% of FY2025 total, concentrated in Canada and Australia; no FX sensitivity is quantified | FY2025 10-K, p.24 and Item 7A, p.49 | 5 |
| M&A / divestitures | Historical, fading — the OWYN acquisition (closed Nov 2023) mechanically inflated FY2025's brand-level YoY revenue comparison (FY2025 is OWYN's first full 52-week year; FY2024 captured only a partial post-acquisition period). No new M&A is disclosed for FY2026 | FY25 10-K, shareholder letter (OWYN pro forma detail, see §6); `01_historical-financials.md` | 20 |

**Cycle-position note (evidence-based, per the Cycle-Position Rule):** the business-model `10_external-dependency.md` flags Commodity prices (High), Government policy/tariffs (High) and Consumer cycle (High) as material external dependencies for SMPL [`business-model/10_external-dependency.md` §1]. The three brands sit at different points in their own demand cycles, not one company-wide cycle: Quest's household penetration (20.5% of US households, +120bps y/y) is at a multi-year high and still rising [Q3 FY26 call]; Atkins's household penetration (8.5%, −220bps y/y) is in a structural decline tied to shelf-space losses, not an ordinary cyclical dip [Q3 FY26 call; FY25 10-K, Item 1A]; and OWYN is mid-integration with a disclosed 6-to-12-month distribution reset ahead [Q3 FY26 call]. Separately, **the FQ4 FY2026 revenue guide is explicitly stated as NOT a clean read of underlying demand**: management said it plans "to slightly undership consumption in Q4 to enter next year with correctly organized and sized customer inventories" [Q3 FY26 earnings call, Q&A, CFO Bealer] — i.e., reported net sales in FQ4 FY26 will run below actual consumer takeaway on purpose, a one-time channel/inventory reset. This must be read as a temporary shipment-versus-consumption gap, not a further demand deterioration, and should not be extrapolated into FY2027 guidance or run-rate models.

## 4. Revenue Driver Table (consolidated)

| Driver | Current Level | Direction | Magnitude | Evidence |
|---|---|---|---|---|
| Household penetration — Quest | 20.5% of US households, FQ3 FY26 | Improving (+120bps y/y) | High (Quest = 63.7% of 9-month FY26 net sales) | Q3 FY26 earnings call, Jul 9 2026, CEO prepared remarks |
| Household penetration — Atkins | 8.5% of US households, FQ3 FY26 | Deteriorating (−220bps y/y) | Mid (Atkins = 24.9% of 9-month FY26 net sales) | Q3 FY26 earnings call, Jul 9 2026, CEO prepared remarks |
| Household penetration — OWYN | 4.3% of US households, FQ3 FY26 | Stable (flat y/y) | Low (OWYN = 9.2% of 9-month FY26 net sales) | Q3 FY26 earnings call, Jul 9 2026, CEO prepared remarks |
| Buy rate (purchase frequency/volume per household) | Not quantified by the company — only directional | Deteriorating for Atkins and OWYN; Quest bars flagged weak, Quest chips/milkshakes strong (chips +17% consumption, milkshakes +~50% in FQ3 FY26) | Mid (affects the largest brand's core sub-category) | Q3 FY26 earnings call, Jul 9 2026, CEO prepared remarks |
| Distribution / retail shelf space (TDP) | Atkins and OWYN both guided to further distribution losses over the next 6–12 months; Quest continuing to gain distribution (management states TDP growth on bars, salty snacks, and the baked business) | Deteriorating (Atkins/OWYN); Improving (Quest) | High for Atkins (largest single explained cause of its −24.6% net sales decline, FQ3 FY26); Mid for OWYN | Q3 FY26 earnings call, Jul 9 2026, CEO prepared remarks and Q&A; FQ3 FY26 10-Q, MD&A |
| List price / promotional intensity (net realized price) | No broad list-price action taken in FY2026 to date; CEO names "over-reliance on price promotion" as a structural weakness (undollarized); a high single-digit list-price increase across most of the portfolio is announced effective September 2026 (start of FY2027) | Currently flat/Unknown; will turn Improving (for realized price) once the September increase lands, with management explicitly warning of an offsetting volume hit ("we would expect...elasticities to be at 1 or higher...there's going to be a volume impact") | High, once effective (a high-single-digit increase applied across "most of the portfolio" moves total revenue by several percentage points, offset partly by the stated volume elasticity) | Q3 FY26 earnings call, Jul 9 2026, prepared remarks and Q&A |
| Retail customer concentration (Walmart ~31%, Amazon ~18% of FY2025 net sales) | At-will relationships, "no recurring or minimum purchase amounts," no firm volume commitments | Deteriorating for Atkins specifically (Walmart already cut Atkins assortment in FY2025); Stable/Unknown for the relationship overall | High (Walmart + Amazon ≈ 49% of FY2025 net sales; a shelf-space or ordering-pattern change at either retailer moves total revenue materially) | FY25 10-K, Item 1A; `business-model/05_customer-geography.md` §3 |
| Channel / shipment-vs-consumption timing | Company is deliberately running shipments below consumption in FQ4 FY26 to reset customer inventories | Temporarily deteriorating reported net sales versus underlying demand (non-run-rate — see cycle-position note above) | Mid (adds several points to the FQ4 FY26 y/y decline versus a pure consumption read) | Q3 FY26 earnings call, Jul 9 2026, Q&A, CFO Bealer |
| FX translation | International ≈2.0% of FY2025 net sales (Canada, Australia) | Stable/immaterial; international net sales shrinking slightly in dollar terms (−9.9% y/y FY2025) but off a small base | Low | FY25 10-K, p.24; `business-model/03_segment-map.md` §1 |
| Acquisitions (OWYN, closed Nov 2023) | Fully consolidated in both FY2025 and FY2026 periods; no new M&A disclosed | N/A going forward — the acquisition-timing distortion is now behind the FY2025-vs-FY2024 comparison only | Low (forward), was High (FY2025 annual comparison only) | FY25 10-K, shareholder letter; §6 below |
| GLP-1 category shift (regulatory/consumer-trend) | Named risk touching Atkins's core weight-management positioning; management states it completed "a thorough assessment of GLP-1 therapies" and sees "high interactivity between Atkins...product buyers and the use of GLP-1s" | Unknown/Unclear — management frames it as an opportunity to reposition Atkins, not (yet) a quantified net demand effect | Mid (touches Atkins, 24.9% of revenue, but no dollar sizing disclosed) | Q3 FY26 earnings call, Jul 9 2026, prepared remarks and Q&A; `business-model/10_external-dependency.md` §1 |

## 5. Revenue Drivers By Segment (brand-level, revenue-only — no brand profit disclosed)

### Segment: Quest (63.7% of net sales, 9 months ended May 30, 2026)

| Driver | Current Level | Direction | Magnitude | Evidence |
|---|---|---|---|---|
| Household penetration | 20.5% of US households, +120bps y/y | Improving | High | Q3 FY26 earnings call, CEO prepared remarks |
| Bar sub-category consumption (bars + chips = ~80% of the brand) | Bar consumption declined ~5% in FQ3 FY26 (partly cushioned by an incremental club-store rotation) | Deteriorating — CEO calls re-accelerating bar growth "our highest priority" | High (bars are the largest piece of the largest brand) | Q3 FY26 earnings call, CEO prepared remarks and Q&A |
| Chips consumption | +17% in FQ3 FY26; household penetration for Quest chips ≈11% | Improving | Mid–High (chips is "a $0.5 billion brand already," growing "in the mid-teens" per CEO) | Q3 FY26 earnings call, CEO prepared remarks and Q&A |
| Milkshake / RTD sub-category | +~50% in FQ3 FY26, "albeit from a small base" | Improving | Low (small base) | Q3 FY26 earnings call, CEO prepared remarks |
| Distribution (TDP) | Continuing to gain distribution across bar, salty-snack, and baked sub-categories | Improving | Mid | Q3 FY26 earnings call, Q&A |
| Salty-snack manufacturing capacity | Capex being directed to a capacity expansion in salty snacks (chips) | Improving (removes a future capacity constraint on the fastest-growing sub-category) | Mid | Q3 FY26 earnings call, prepared remarks; `04_guidance-consensus.md` §2 (FY26 capex guide) |

FY2025 annual context: Quest net sales grew 11.1% y/y to $863.6m (59.5% of FY2025 total), and management's shareholder letter states 12% consumption growth and 13% net sales growth on a 52-week basis for FY2025 [FY25 10-K, Note 15; FY25 10-K, shareholder letter].

### Segment: Atkins (24.9% of net sales, 9 months ended May 30, 2026)

| Driver | Current Level | Direction | Magnitude | Evidence |
|---|---|---|---|---|
| Household penetration | 8.5% of US households, −220bps y/y | Deteriorating | High (largest disclosed driver of Atkins's decline) | Q3 FY26 earnings call, CEO prepared remarks |
| Distribution / shelf space | Retail takeaway declined 23.9% in FQ3 FY26 (vs −23.4% in FQ2 FY26); Walmart cut Atkins assortment in FY2025; brand and trademark intangibles impaired $60.9m in FY2025 on declining revenue projections | Deteriorating | High | Q3 FY26 earnings call, CEO prepared remarks; FY25 10-K, Item 1A and Note 9 |
| Marketing investment | CEO states the brand suffered from reduced marketing support ("insufficient marketing support"), directly linked to the household-penetration decline | Deteriorating (self-inflicted, per management) | Mid–High | Q3 FY26 earnings call, prepared remarks |
| Comparison base (year-over-year) | Management states comparisons "become more favorable as we lap household and distribution losses during the prior year" | Improving (base-effect only, starting FQ4 FY26/FY27) | Mid | Q3 FY26 earnings call, CEO prepared remarks |
| GLP-1 repositioning | Being framed as a long-term opportunity, not yet monetized | Unclear/Unknown | Unknown | Q3 FY26 earnings call, prepared remarks and Q&A |

### Segment: OWYN (9.2% of net sales, 9 months ended May 30, 2026)

| Driver | Current Level | Direction | Magnitude | Evidence |
|---|---|---|---|---|
| Household penetration | 4.3% of US households, flat y/y | Stable | Low–Mid | Q3 FY26 earnings call, CEO prepared remarks |
| Distribution reset (product-quality issue) | A disclosed product-quality issue plus "ineffective marketing execution" hurt several products; issue addressed but distribution losses expected over the next 6–12 months | Deteriorating (near-term) | Mid | Q3 FY26 earnings call, prepared remarks |
| Underlying category demand | Management points to "a significant and growing audience seeking functional nutrition benefits" as the basis for long-term confidence | Improving (qualitative; not yet reflected in near-term distribution trend) | Unknown magnitude | Q3 FY26 earnings call, prepared remarks |
| Gross margin mix | Company states OWYN "carries lower gross profit margins" than the rest of the portfolio — a mix headwind on blended margin, not a revenue driver per se, but relevant to why OWYN's growth is a weaker-quality dollar of revenue | Deteriorating (margin quality) | Low–Mid (revenue impact; margin impact covered in `03_margin-drivers`) | FY25 10-K, MD&A p.39 |

International (2.2% of net sales) is immaterial to the consolidated read and is not decomposed further — no brand split is disclosed for this line [`business-model/03_segment-map.md` §1].

## 6. Revenue Growth Decomposition

**Most recent quarter (FQ3 FY26, 13 weeks ended May 30, 2026, vs FQ3 FY25):** net sales declined 6.3% ($357.0m vs $381.0m, a $24.0m decline) [FQ3 FY26 10-Q, MD&A]. The company does not disclose a formal volume/price/mix walk; the best decomposition available is the brand-level revenue split, computed by this agent from the filed brand-revenue disaggregation table [FQ3 FY26 10-Q, Note 12]:

| Component | Contribution to Growth (pp) | Evidence |
|---|---:|---|
| Volume / distribution (as management characterizes it — see note below) | −6.3pp in total, split by brand: Atkins −7.25pp, Quest +0.66pp, OWYN +0.32pp, International −0.02pp | Computed by this agent: (brand Δ$) ÷ (prior-year total net sales $380.956m), from Atkins $84.649m (vs $112.287m), Quest $230.260m (vs $227.737m), OWYN $34.774m (vs $33.551m), International $7.300m (vs $7.381m) [FQ3 FY26 10-Q, Note 12] |
| Price / realization | Not separately quantified — no list-price increase was in effect during the quarter; management's own MD&A attributes the decline entirely to "distribution-related declines for Atkins" offset by "Quest and OWYN volume-driven growth," with no price component named | FQ3 FY26 10-Q, MD&A |
| Mix | Captured within the brand-level volume split above (Quest gaining share, Atkins losing share) | — |
| FX | ~0 (International, a small negative, is the only FX-adjacent line and is immaterial) | FQ3 FY26 10-Q, Note 12 |
| Acquisitions / divestitures | None in this comparison — OWYN was already fully consolidated in both the FQ3 FY26 and FQ3 FY25 periods, so no acquisition-timing distortion affects this quarterly comparison | — |
| Other | None disclosed | — |
| Total revenue growth | −6.3% (−$24.0m) | FQ3 FY26 10-Q, MD&A |

The brand-level split sums exactly to the total (−7.25 + 0.66 + 0.32 − 0.02 = −6.29% ≈ −6.3%, rounding), confirming internal consistency.

**Full fiscal year 2025 (annual, vs FY2024):** net sales grew 9.0% ($119.6m, to $1,450.9m) [FY25 10-K, MD&A p.38]. This is **not cleanly decomposable into volume/price/mix/FX/M&A** from disclosure, and the gap between two of the company's own disclosed figures must be flagged rather than papered over: management states "Combined consumption for our three brands grew 5.5%, led by Quest and OWYN" [FY25 10-K, shareholder letter] — a ~3.5-percentage-point gap versus the 9.0% net sales growth rate. Part of that gap is an **acquisition-timing / calendar effect, not organic demand**, and must not be described as organic: FY2025 is OWYN's first full 52-week year of consolidation, while FY2024 captured only a partial post-acquisition period (OWYN closed Nov 2023) plus FY2024 itself was a 53-week year (one extra week versus FY2025's 52 weeks — a separate, small negative comp effect) [`01_historical-financials.md` §1]. Management's own alternate, apples-to-apples comparison shows OWYN's net sales grew 22% and its consumption grew 34% against "the prior 12 months including 10 months prior to closing the acquisition" [FY25 10-K, shareholder letter] — a materially smaller organic growth rate than the raw GAAP year-over-year brand-revenue comparison ($137.020m vs $29.213m, i.e., +369%) implies [FY25 10-K, Note 15]. **The raw +369% OWYN GAAP figure is a calendar/consolidation artifact, not a demand signal, and is not used as an organic growth rate anywhere in this report.** Price is not separately quantified for FY2025 either; the 10-K's own explanation for the 9.0% growth is "driven by the acquisition of OWYN and another year of double-digit growth from Quest, partially offset by declines on Atkins and the effect of lapping the extra week in Fiscal Year 2024" [FY25 10-K, shareholder letter] — a qualitative mix of M&A, organic Quest volume growth, Atkins volume/distribution decline, and a calendar effect, with no dollar or percentage-point attribution given to each. What's missing to do this properly: a company-disclosed like-for-like (constant-brand-set, constant-week-count) organic growth rate, and any quantified price/volume split — neither exists in this pool.

## 7. The Single Biggest Revenue Driver

**Quest's bar sub-category consumption trend is the single biggest driver of where SMPL's revenue goes next.** Quest is now 63.7% of net sales (nine months ended May 30, 2026) and bars plus chips together make up roughly 80% of the Quest brand, with bars the larger and currently weaker of the two — bar consumption declined about 5% in FQ3 FY26 even as chips grew 17% and milkshakes grew roughly 50% [Q3 FY26 earnings call, Jul 9 2026, CEO prepared remarks]. Because Quest is now nearly two-thirds of the whole company, a 10–20% swing in Quest's growth rate — in either direction — would move total company revenue by roughly 6–13 percentage points, dwarfing what a similar swing in Atkins (24.9% of revenue and still shrinking as a share of the total) or OWYN (9.2%, smaller still) could do to the total. The current direction is deteriorating on the specific sub-category (bars) that matters most, even though the brand overall is still growing on a blended basis (Quest net sales +1.1% in FQ3 FY26); management itself calls "re-accelerating growth in Quest bars ... our highest priority" [Q3 FY26 earnings call, prepared remarks], which is the clearest signal that this is the variable the company itself is watching most closely for the next 3–12 months.

## 8. Data and Sourcing Limitations

- No verbatim volume, unit, or per-unit price data exists anywhere in the pool for any brand — household penetration and (qualitative-only) buy rate are the closest disclosed proxies, and buy rate is never given a number. **Not proven from available data.**
- No brand-level profit, EBITDA, or margin figure is disclosed (ASC 280 aggregation) — this report is revenue-only by brand; profitability-weighted driver importance cannot be assessed from filings alone.
- No formal company-disclosed volume/price/mix walk exists for any period; the growth-decomposition table in §6 uses the best available proxy (brand-revenue split) and states explicitly where price cannot be isolated.
- The Q3 FY2026 earnings call transcript used throughout this report is a verbatim CIQ/S&P Global Market Intelligence transcript (full trust for driver/guidance colour per this module's Transcript Sourcing rule) — this is not a sell-side proxy, so no score cap applies on that account.
- No `ciq_facts.json` sidecar exists in this run's `_pool_extracts/` — all figures in this report are cited directly from the FY2025 10-K, the FQ2/FQ3 FY2026 10-Qs, and the verbatim Q3 FY2026 earnings-call transcript, not from a facts sidecar.



---

## earnings / 03_margin-drivers.md

_Source: `03_margin-drivers.md`_

# Margin Drivers — SMPL

**Sector overlay (step 3b):** `business-model/02_business-identity.md` §3a already tested SMPL against `frameworks/SECTOR_OVERLAYS.md` and found no fit: the closest row, "Retail / consumer," is built for store-operating retailers (same-store sales, sales per square foot, store count), and SMPL owns no stores — it is a brand manufacturer that sells wholesale into other companies' stores. **No sector overlay for "branded asset-light CPG snacking company" — generic cost stack applies.** The margin analysis below therefore uses the generic candidate list (input costs, mix, pricing, SG&A leverage, one-offs), sharpened with the specific KPIs management itself uses (household penetration, retail takeaway, brand mix).

**Reporting basis:** US GAAP, USD. Fiscal year ends the last Saturday in August; FY2025 = 52 weeks ended Aug-30-2025, FY2024 = 53 weeks ended Aug-31-2024. All figures below reconcile to `earnings/01_historical-financials.md` unless a new figure is sourced directly from a primary filing not fully broken out there (cited inline).

## 1. Segment Decomposition Status

SMPL reports **one GAAP reportable segment** (ASC 280) — the CEO, as Chief Operating Decision Maker, reviews only consolidated net income, not brand-level income [FY2025 10-K, Note 15]. Brand-level **revenue** is disclosed (Quest 59.5% / Atkins 29.0% / OWYN 9.4% / International 2.0% of FY2025 net sales) [`business-model/03_segment-map.md`, §1], but **no brand-level gross margin, operating profit, EBITDA, or capital-employed figure is disclosed anywhere in the filings**. This is a hard disclosure gap, not an oversight this report can fill: any brand-level margin discussion below is limited to management's own qualitative statements (e.g., "lower gross profit margins of the OWYN business" [FY2025 10-K, Item 7, p.41]) and is labeled as such, never as a computed number. The company is not single-segment in the >85%-concentration sense used elsewhere in this module (Quest at 59.5–63.7% of revenue does not clear that bar), so it is treated as a three-brand portfolio at the revenue-mix level while all margin math stays at the consolidated level. Business-model module is available and was used for this decomposition status.

## 2. Cost Stack

COGS is reported as a single consolidated line — SMPL does not break out raw materials, packaging, tolling fees, freight, or energy separately on the income statement or in the notes. Labor shows up mainly in G&A (own employees); direct labor is embedded inside the third-party tolling fee paid to contract manufacturers and is not disclosed separately, consistent with the asset-light model [`business-model/06_value-chain.md`, §1].

| Cost Line | % of Net Sales (FY2025 / FY2024) | Direction | Evidence | Margin Risk |
|---|---:|---|---|---|
| Cost of goods sold (ingredients, packaging, tolling fees, freight — all combined, one line) | 63.8% / 61.6% (+220bps) | Worsening | "unfavorable commodity expenses compared to the prior year period and lower gross profit margins of the OWYN business" [FY2025 10-K, Item 7, p.41] | High — unhedged, single-source dependency on named core ingredients [`business-model/06_value-chain.md`, §2] |
| Raw materials (cocoa, dairy, protein, soy, nuts, packaging) | Not disclosed as a separate % — folded into COGS above | — | Named qualitatively as COGS drivers: cocoa, dairy, proteins, soy, nuts, pea/pumpkin protein, flexible film, cartons, tetra paper, plastic bottles [FY2025 10-K, Item 1, p.11] | High (see COGS row) |
| Labor (own employees, G&A) | Embedded in G&A: 10.7% / 9.7% (+100bps) | Worsening | "an increase of $8.0 million in employee-related costs" (FY2025 G&A) [FY2025 10-K, Item 7, p.41]; offset in FQ3 FY2026 by "lower employee costs" cutting G&A ex-one-offs 5% YoY [Q3 FY2026 Earnings Call, Jul-09-2026, prepared remarks] | Mid |
| Freight / logistics | Not disclosed as a separate % — folded into COGS; only an accrued-freight-expense balance-sheet note exists ($3.673M at Aug-30-2025 vs $3.376M prior year) | Not disclosed | "Supply chain challenges...relating to ingredients, freight and packaging" [FY2025 10-K, Item 1A, p.23]; analyst flagged "a fairly sharp spike in trucking costs" on the Q3 FY2026 call, CFO confirmed broad input inflation without a freight-specific number [Q3 FY2026 Earnings Call, Jul-09-2026, Q&A] | Mid — not quantified, cannot size independently |
| Energy | Not disclosed | Not disclosed | No energy-cost line or commentary found in the pool | Not assessable |
| Selling & marketing | 9.3% / 10.8% FY25 vs FY24 (−150bps FY25); reversing to 11.0% / 8.9% in FQ3 FY26 vs FQ3 FY25 (+210bps) | Reversing (was cut, now rising) | FY2025: "decrease was primarily related to an overall decrease in marketing spend" [FY2025 10-K, Item 7, p.41]. FQ3 FY2026: "increased 15.9%...driven by investments in our selling capability and increased spend to support longer-term brand growth" [Q3 FY2026 Earnings Call, Jul-09-2026, prepared remarks] | Mid — a deliberate near-term margin cost, framed by management as a *return* of underinvestment |
| G&A | 10.7% / 9.7% (+100bps FY25); 11.3% / 10.8% FQ3 FY26 vs FQ3 FY25 (+50bps, but includes $6.2M restructuring) | Worsening on a GAAP basis, improving ex-one-offs | FY2025 rise driven by "$20.3 million in integration expenses related to the OWYN Acquisition, an increase of $8.0 million in employee-related costs" [FY2025 10-K, Item 7, p.41]; FQ3 FY2026 G&A ex-restructuring/integration down 5% to $34.2M "principally due to the impact of lower employee costs" [Q3 FY2026 Earnings Call, Jul-09-2026, prepared remarks] | Mid |
| D&A | 1.2% / 1.3% FY25 vs FY24 ($16.9M both years — flat in dollars); 1.2% / 1.1% FQ3 FY26 vs FQ3 FY25 | Stable, but see Section 9 on capex | "Depreciation and amortization expenses were $16.9 million for both...periods" [FY2025 10-K, Item 7, p.41] | Low today; capex has quadrupled (Section 9), so this line is the one to watch |
| Interest expense | 1.6% / 2.0% of net sales FY25 vs FY24 ($23.2M vs $26.0M — falling as debt is repaid) | Improving (but reversing — see net debt trend) | "$150.0 million of our term loan debt" repaid in FY2025 [FY2025 10-K, Item 7, p.29]; net debt fell to $206.0M at FY2025-end but has since risen to $324.6M by FQ3 FY2026 on $242.3M of buybacks funded while Adjusted EBITDA fell [`earnings/01_historical-financials.md`, §6] | Low today, Mid if buybacks keep outrunning cash generation |

## 3. Gross Margin → EBITDA Margin → EBIT Margin Walk

| Margin Level | FY2025 | FY2024 | Change bps | Main Reason | Evidence |
|---|---:|---:|---:|---|---|
| Gross margin | 36.2% | 38.4% | −220bps | Commodity input-cost inflation + OWYN brand-mix dilution | [FY2025 10-K, Item 7, p.41] |
| EBITDA margin (GAAP) | 12.3% | 17.2% | −490bps | Gross-margin compression + $60.9M Atkins intangible impairment + G&A step-up (OWYN integration, employee costs) | [`earnings/01_historical-financials.md`, §1; FY2025 10-K] |
| EBIT margin (GAAP) | 10.8% | 15.5% | −470bps | Same as EBITDA, plus flat D&A of $16.9M | [`earnings/01_historical-financials.md`, §1; FY2025 10-K, Item 7, p.41] |

**The GAAP EBITDA/EBIT rows are distorted by a non-cash, non-run-rate item and should not be read as the underlying trend on their own.** Stripping the impairment, the company's own Adjusted EBITDA margin — its primary tracked non-GAAP KPI — fell a smaller but still real 100bps, from 20.2% (FY2024) to 19.2% (FY2025), and has continued falling to 16.9% on the latest trailing-twelve-months (a further ~330bps deterioration not explained by any one-off) [`earnings/01_historical-financials.md`, §2]. This confirms the margin compression is a genuine operating trend, not just an accounting artifact of the write-down.

**Pass-through lag (explicit, per `business-model/06_value-chain.md`):** Price increases lag input-cost increases by roughly a year in this cycle. FY2025 gross margin fell 220bps on commodity inflation with no offsetting price action that year; management only announced a high-single-digit list-price increase in Q3 FY2026 (effective September 2026), roughly twelve months after the erosion began [`business-model/06_value-chain.md`, §2; Q3 FY2026 Earnings Call, Jul-09-2026, prepared remarks]. There is no contractual cost-escalator or indexed pricing with either suppliers or retailers — price moves are negotiated list-price actions taken after the cost increase is already in the P&L, not automatic pass-throughs [`business-model/06_value-chain.md`, §2].

**Cycle position (Cycle-Position Rule — commodity and consumer-cycle exposure both flagged High in `business-model/10_external-dependency.md`):** the latest reported period sits at a **margin trough relative to the five-year window in the pool**, not a normalized run rate. Gross margin peaked at 40.7% in FY2021 and has fallen every year since (38.1% → 36.5% → 38.4% → 36.2%), reaching 32.5% in the latest quarter (FQ3 FY2026) [`earnings/01_historical-financials.md`, §1, §3]. Adjusted EBITDA margin, similarly, peaked near 20% and sits at 16.9% on the latest TTM [`earnings/01_historical-financials.md`, §2]. Management's own stated long-term target — "gross margins approaching 40%. Marketing as a percent of sales at 10%. EBITDA margins approaching 20%" [Q3 FY2026 Earnings Call, Jul-09-2026, Q&A] — is itself an implicit admission that current margins are below where the business has run before and below where management believes it should run. This is a **self-inflicted-plus-input-cost trough** (unhedged commodity inflation, a lower-margin acquisition (OWYN) diluting the mix, a cut-then-reversed marketing budget, and integration/restructuring one-offs), not a macro-cycle trough — and it can reverse if pricing holds, OWYN integration completes, and restructuring costs roll off, but management itself frames FY2026 as "the early stages of our turnaround" [Q3 FY2026 Earnings Call, Jul-09-2026, prepared remarks], meaning the current level is explicitly **not** a run-rate to extrapolate.

## 4. Margin Walk — Which Margin Level Matters Most?

**Adjusted EBITDA margin is the most useful level to track SMPL, with gross margin as the earliest warning signal underneath it.** GAAP EBIT and EBITDA margins are currently unusable as a trend signal on their own — three of the last four quarters were distorted by a cumulative $391.9 million non-cash goodwill/brand impairment [`earnings/01_historical-financials.md`, §2], which swings GAAP EBITDA from positive to deeply negative without changing the cash-generating business. Adjusted EBITDA margin is the metric management itself sets guidance on (FY2026 guided to $220–225 million, "representing a year-over-year decline of 21% to 19%" [Q3 FY2026 Earnings Call, Jul-09-2026, prepared remarks]) and the metric its own long-term target ("EBITDA margins approaching 20%") is expressed in. But because SMPL is asset-light with COGS as ~64–68% of net sales, gross margin is the line item that moves first and fastest when commodity costs, tariffs, or brand mix shift — it is the leading indicator inside the Adjusted EBITDA number, and every quarter's commentary in this pool leads with gross margin, not EBITDA margin, when explaining what changed [FY2025 10-K, Item 7, p.41; Q3 FY2026 Earnings Call, Jul-09-2026, prepared remarks].

## 5. Margin Driver Table (consolidated)

| Driver | Impact on Margins | Direction | Magnitude | Evidence |
|---|---|---|---|---|
| Unhedged commodity / input-cost inflation (protein complex, packaging; cocoa easing) | Squeezes gross margin directly; only offset is after-the-fact pricing | Headwind | High | FY2025 gross margin −220bps "primarily driven by unfavorable commodity expenses" [FY2025 10-K, Item 7, p.41]; FQ3 FY2026 gross margin −390bps (−210bps ex-restructuring) on "higher input costs" [Q3 FY2026 Earnings Call, Jul-09-2026, prepared remarks]; FY2026 guide: GAAP gross margin to decline "roughly 375 basis points" on "slightly higher input costs, especially proteins" [Q3 FY2026 Earnings Call, Jul-09-2026, prepared remarks]; zero commodity hedges in place [`business-model/06_value-chain.md`, §1] |
| September 2026 high-single-digit price increase | Raises price per unit but management explicitly expects a matching-or-larger volume offset | Unknown (net margin effect not yet observable) | High if it holds; could be net-negative if volume gives back more than price gains | "high single-digit price increase across most of our portfolio...effective in September" to "offset input inflation" [Q3 FY2026 Earnings Call, Jul-09-2026, prepared remarks]; "we would expect, as we look at fiscal '27, elasticities to be at 1 or higher. So there's going to be a volume impact to our business" [Q3 FY2026 Earnings Call, Jul-09-2026, Q&A] |
| Brand mix — OWYN (lower gross margin) growing share; Atkins (presumably higher fixed-cost-absorption risk) shrinking | Dilutes consolidated gross margin as the lower-margin brand grows and the declining brand loses scale | Headwind | Mid-High | "lower gross profit margins of the OWYN business" cited as a named driver of the FY2025 220bps gross-margin decline [FY2025 10-K, Item 7, p.41]; OWYN revenue share rose from 2.2% (FY2024, partial year) to 9.4% (FY2025) [`business-model/03_segment-map.md`, §1]; no brand-level margin number disclosed to size this precisely |
| One-off restructuring / integration / impairment costs | Distorts GAAP margins downward but is explicitly non-recurring | Headwind (but non-run-rate) | High in the periods it hits, zero going forward once it rolls off | $391.9M cumulative impairment across FQ4 FY2025–FQ3 FY2026 [`earnings/01_historical-financials.md`, §6]; $6.2M restructuring cost inside FQ3 FY2026 COGS (180bps of the quarter's 390bps gross-margin decline) [Q3 FY2026 Earnings Call, Jul-09-2026, prepared remarks]; $20.3M OWYN integration expense inside FY2025 G&A [FY2025 10-K, Item 7, p.41] |
| Marketing reinvestment (S&M reversing from a cut to a raise) | A deliberate near-term cost management calls necessary to fix a "structural issue" | Headwind (near-term), framed by management as a future tailwind for volume/brand equity | Mid | FY2025 S&M cut 6.7% ("decrease in marketing spend") [FY2025 10-K, Item 7, p.41]; FQ3 FY2026 S&M up 15.9% YoY to 11.0% of net sales, called out by the CEO as reversing "SG&A growing faster than the top line" and marketing "as a percent of sales going down" [Q3 FY2026 Earnings Call, Jul-09-2026, prepared remarks, Q&A] |
| Volume decline / fixed-cost under-absorption | Revenue down four straight quarters YoY spreads G&A and D&A over a smaller base | Headwind | Mid | Revenue YoY: FQ4 FY25 −1.8%, FQ1 FY26 −0.3%, FQ2 FY26 −9.4%, FQ3 FY26 −6.3% [`earnings/01_historical-financials.md`, §3] |
| G&A cost discipline (headcount/employee-cost cuts) | Partial offset inside G&A | Tailwind | Low-Mid | FQ3 FY2026 G&A ex-one-offs down 5% to $34.2M "principally due to the impact of lower employee costs" [Q3 FY2026 Earnings Call, Jul-09-2026, prepared remarks] |
| Productivity / supply-chain initiatives | Partial, disclosed offset to input-cost inflation inside gross margin | Tailwind | Mid | FQ3 FY2026 gross margin (ex-restructuring) "exceeding our forecast driven by productivity initiatives" [Q3 FY2026 Earnings Call, Jul-09-2026, prepared remarks]; Q4 FY2026 guided to be "our strongest [gross margin] of the year, as productivity initiatives provide some relief against sustained inflationary pressure" [Q3 FY2026 Earnings Call, Jul-09-2026, prepared remarks] |
| Tariffs (2025 US tariffs on EU/Canada/Mexico/China imports) | Adds unquantified cost to imported ingredients/packaging during FY2026 | Headwind | Unknown magnitude (not disclosed as a dollar figure) | "will cause inflationary pressures and higher costs on certain of our ingredients and packaging and imports from the affected countries during fiscal year 2026," no tariff hedge, mitigation is price increases and cost savings which "may not fully offset" [`business-model/10_external-dependency.md`, §1; FY2025 10-K, p.22-23] |
| D&A | Stable today but sits below a capex line that has quadrupled | Neutral today / Headwind ahead (Section 9) | Low today | $16.9M in both FY2025 and FY2024 (1.2%/1.3% of net sales) [FY2025 10-K, Item 7, p.41] |
| Interest expense (below EBIT, affects net margin) | Falling as term-loan debt is repaid, but net debt has since risen on buybacks | Tailwind reversing to a watch item | Low | Interest expense fell from $26.0M (FY24) to $23.2M (FY25) [FY2025 10-K, Item 7, p.41]; net debt rose from $206.0M (FY2025-end) to $324.6M (FQ3 FY2026) on $242.3M of buybacks funded while Adjusted EBITDA was falling [`earnings/01_historical-financials.md`, §6] |

## 6. Margin Drivers By Segment (brand-level, qualitative only — no brand P&L disclosed)

Section 1 already flags that no brand-level margin, EBITDA, or profit figure exists in any filing in this pool. The table below is therefore **directional only**, built from management's qualitative statements, and every "Impact"/"Magnitude" cell is *Inference, not from filings* unless a direct quote is cited.

### Segment: Quest (59.5% of FY2025 net sales, rising to 63.7% of 9-month FY2026 net sales)

| Driver | Impact | Direction | Magnitude | Evidence |
|---|---|---|---|---|
| Volume growth (chips, milkshakes) | Likely margin-accretive to the consolidated blend given rising revenue share of the legacy, presumably higher-margin brand | Tailwind (inference) | Mid | Quest net sales +1.1% in FQ3 FY2026, "both brands performed slightly better than we expected," specific momentum in "Quest chips and milkshakes" [Q3 FY2026 Earnings Call, Jul-09-2026, prepared remarks]; revenue-share rise from 59.5% (FY25) to 63.7% (9mo FY26) [`business-model/03_segment-map.md`, §2]. No brand margin figure disclosed to confirm the accretive-mix inference |
| Bar-segment softness | A near-term drag inside an otherwise-growing brand | Headwind (inference) | Low-Mid | "as we move into '27...I would expect bars to be a little bit weaker" once a promotional rotation "burns off" [Q3 FY2026 Earnings Call, Jul-09-2026, Q&A] |

### Segment: Atkins (29.0% of FY2025 net sales, declining)

| Driver | Impact | Direction | Magnitude | Evidence |
|---|---|---|---|---|
| Distribution losses / shelf-space cuts | Falling revenue base likely raises the brand's fixed-cost-per-unit even though no brand-level cost is disclosed | Headwind | Mid-High | Atkins net sales −24.6% in FQ3 FY2026 "reflecting continued pressure from declining household penetration as a result of insufficient marketing support"; Walmart "reduced the number of Atkins products it carries" in FY2025 [`business-model/03_segment-map.md`, §1; FY2025 10-K, Item 1A, p.24] |
| Brand intangible impairment | Non-cash, GAAP-only, does not affect underlying cash cost structure | Headwind (GAAP only, non-run-rate) | High in the period, zero ongoing cash impact | $60.9M FY2025 impairment plus a further $93.0M (39-week FY2026) impairment on the Atkins brand/trademark [`earnings/01_historical-financials.md`, §6, citing 10-K Note 9 and Q3 FY2026 10-Q Note 4] |

### Segment: OWYN (9.4% of FY2025 net sales, growing but troubled)

| Driver | Impact | Direction | Magnitude | Evidence |
|---|---|---|---|---|
| Structurally lower gross margin than legacy portfolio | Directly dilutes the consolidated gross margin as OWYN's revenue share grows | Headwind | Mid-High | "lower gross profit margins of the OWYN business" [FY2025 10-K, Item 7, p.41]; OWYN revenue share rose from 2.2% (FY24, partial year) to 9.4% (FY25) [`business-model/03_segment-map.md`, §1] |
| Product-quality issue / SKU rationalization | Non-core SKU cuts should reduce complexity cost over time but distribution losses hurt revenue base near-term | Headwind near-term, inference of tailwind post-cleanup | Mid | "the combination of a product quality issue and ineffective marketing execution negatively impacted performance...we have addressed the product issue, but do expect distribution losses over the next 6 to 12 months" [Q3 FY2026 Earnings Call, Jul-09-2026, prepared remarks] |

## 7. Margin Bridge — Latest Period (FQ3 FY2026 vs FQ3 FY2025, 13 weeks ended May-30-2026 vs May-31-2025)

Gross margin fell 390bps (36.4% → 32.5%). The company itself splits this into two pieces — a one-off and an underlying-cost residual — but does **not** further decompose the underlying residual into price/volume/mix; that finer split is not disclosed and is not estimated here.

| Component | Margin Impact (bps) | Evidence |
|---|---:|---|
| One-off restructuring costs (supply-chain streamlining) | −180 | "Excluding $6.2 million in restructuring costs, gross margin was 34.3%, a 210-basis-point decline" — implies restructuring alone cost 390−210 = 180bps [Q3 FY2026 Earnings Call, Jul-09-2026, prepared remarks] |
| Input costs, net of productivity offsets (residual, not further split by the company) | −210 | Same source: the residual 210bps decline is attributed to "higher input and restructuring costs" net of productivity gains that made the result "exceed our forecast" [Q3 FY2026 Earnings Call, Jul-09-2026, prepared remarks] |
| Volume / mix / price | Not separately disclosed | Revenue fell 6.3% "driven by distribution-related declines for Atkins which were partially offset by Quest and OWYN volume-driven growth" [Q3 FY2026 10-Q, MD&A, Jul-09-2026] — a mix statement, not a bps figure |
| FX | Not material / not disclosed as a margin driver | International sales ~2% of total, FX risk called "primarily related to...Canada and Australia" with no margin-bps disclosure [`business-model/10_external-dependency.md`, §1] |
| **Total gross margin change** | **−390** | [Q3 FY2026 10-Q, MD&A] |

Below gross margin, the bridge cannot be completed with disclosed bps figures: G&A rose from 10.8% to 11.3% of net sales (+50bps, including the same $6.2M restructuring charge and a comparison against $5.2M of prior-year integration expense, so the two years are not on a like-for-like clean basis) and S&M rose from 8.9% to 11.0% of net sales (+210bps, a deliberate reinvestment) [10-Q income statement, Jul-09-2026]. The $82.0 million loss on impairment (23.0% of net sales) sits entirely below the operating-expense line and is the reason GAAP operating margin swung from +15.6% to −14.0% — this is explicitly a one-off, not a bridge component to extrapolate.

## 8. The Single Biggest Margin Driver

**Unhedged commodity and input-cost inflation is the single driver that would compress margins the most if it worsens, and its current direction is a headwind, worsening year-over-year.** It is the driver management names first in every filing and every call when explaining gross-margin deterioration — FY2025's 220bps decline, FQ3 FY2026's 390bps decline (210bps of it after stripping the one-off restructuring charge), and the FY2026 full-year guide of a further ~375bps GAAP decline all lead with input costs, specifically the protein complex and packaging [FY2025 10-K, Item 7, p.41; Q3 FY2026 Earnings Call, Jul-09-2026, prepared remarks]. The company has **zero commodity hedges** ("We do not use hedges for availability of any core ingredients or packaging" [FY2025 10-K, Item 1A, p.22]), so every input-cost move flows straight through to gross margin with no buffer, and its only defense — the September 2026 price increase — is itself explicitly expected to trigger a matching-or-larger volume loss ("elasticities to be at 1 or higher" [Q3 FY2026 Earnings Call, Jul-09-2026, Q&A]), meaning the fix carries its own margin risk if volume falls faster than price gains stick.

## 9. Investment Spend — Both Signs

Capex is running well above its own history: $5.9M (FY2021) → $5.2M (FY2022) → $11.6M (FY2023) → $5.7M (FY2024) → $20.5M (FY2025) → guided $25–30 million for FY2026 (TTM actual $28.1M) [`earnings/01_historical-financials.md`, §1-§2; Q3 FY2026 Earnings Call, Jul-09-2026, prepared remarks]. That is roughly a 4–5x step-up from the FY2021–FY2024 average.

| Reading | What it would show | Evidence here |
|---|---|---|
| Spend as a future COST | Capex is "purchases of property and equipment, primarily at our contract manufacturing facilities" [FY2025 10-K, MD&A "Liquidity and Capital Resources"] — this will land as higher D&A once the assets are placed in service. D&A has stayed flat at $16.9M (FY2025 = FY2024) despite the capex jump, meaning the depreciation charge from this new capex has not yet hit the P&L and is a coming, not a current, cost. | FY2025 10-K: "$20.5 million of purchases of property and equipment, primarily at our contract manufacturing facilities"; D&A unchanged at $16.9M FY25 vs FY24 [FY2025 10-K, Item 7, p.41] |
| Spend as a DEMAND signal | No evidence supports this reading. SMPL discloses no order backlog or contracted-revenue metric (not a capital-goods or cloud business), and the demand backdrop is the opposite of a bookings wave: net sales have declined YoY for four consecutive quarters and FY2026 revenue guidance was just cut to a 6–7% decline [Q3 FY2026 Earnings Call, Jul-09-2026, prepared remarks; `earnings/01_historical-financials.md`, §3]. Management frames the capex explicitly around "productivity initiatives" and cost efficiency inside contract-manufacturing facilities, not capacity expansion for anticipated volume growth. | No backlog/bookings disclosure exists in this pool; revenue is falling, not accelerating, over the same period the capex rose |

**Current read:** the evidence favors the **cost** reading, not the demand reading — capex here is efficiency/productivity investment inside a shrinking revenue base, not capacity built ahead of contracted demand, so it should be modeled as a coming D&A step-up rather than a bullish forward indicator. The observable that would flip this read: management explicitly tying incremental capex to anticipated volume or distribution *growth* for a specific brand (rather than "productivity initiatives" and cost efficiency), or a stated capacity-utilization constraint limiting current shipments — neither appears anywhere in this pool.

## 10. Limitations

No verbatim transcript issue applies here — the Q2 FY2026 and Q3 FY2026 earnings calls in the data pool are full transcripts, not sell-side proxies, so management commentary and tone are drawn directly from the primary call record. The material limitation in this report is the total absence of brand-level profit/margin disclosure (Section 1, Section 6), which caps any brand-level margin driver read at "directional inference, not from filings" rather than a sourced number.



---

## earnings / 04_guidance-consensus.md

_Source: `04_guidance-consensus.md`_

# Guidance & Consensus — SMPL

## 1. Consensus Data Metadata

| Field | Value |
|---|---|
| Source | Capital IQ — `TheSimplyGoodFoodsCompanyNasdaqCMSMPLEstimatesReport.xls`, tabs: Consensus, Guidance, Recent Changes, Revisions, Trends, Surprise |
| Data as of date | Jul-09-2026, 1:10 PM GMT (Consensus tab header); individual analyst updates logged through 2026-07-21 in the Recent Changes tab — both dates sit on or right after the day management released the Q3 FY26 print and the current guidance, so this is not a stale snapshot (see Section 7 stale-consensus check) [Estimates Report.xls, Consensus tab header; Recent Changes tab] |
| Fiscal year basis | Company fiscal year ends the last Saturday in August. "Current Fiscal Year End: Aug-31-2026 \| FY 2026 Earnings Release Date: Oct-23-2026" — the CIQ FY columns map 1:1 to the company's own fiscal year, no calendar conversion needed [Estimates Report.xls, Consensus tab header] |
| Analyst count | Revenue FY2026: 9 of 11 tracked analysts contributing [Consensus tab, "No. of Estimates" row, FY2026 column]. EPS Normalized FY2026: 8 of 9 [Consensus tab]. Target price: 8 analysts [Consensus tab, Target Price row]. Recommendation split: 4 Buy, 0 Outperform, 7 Hold, 0 Underperform, 0 Sell (11 total with a rating) [Consensus tab, Recommendation box] |
| Currency | USD — "Currency: Reported Currency"; company reports in US dollars [Estimates Report.xls, Consensus tab header; FY2025 10-K] |
| Calendarization issue? | N — CIQ's FY2026 column is the company's own Aug-year-end fiscal year; no quarter-mapping adjustment required |

No consensus/estimate data is missing for SMPL — the pool carries a current Capital IQ Estimates Report with Consensus, Guidance, Recent Changes, Revisions, Trends and Surprise tabs, all as of Jul-09/Jul-21-2026. The partial-data cap in the module rules does not apply.

## 2. Management Guidance

All figures below are management's own guidance as given on the Q3 FY26 earnings call (period ended May 30, 2026, call held Jul 9, 2026) and echoed same-day in the company's guidance key-development release. Numbers are quoted verbatim from the call transcript (a verbatim CIQ/S&P Global Market Intelligence transcript — full trust for driver/guidance colour per this module's Transcript Sourcing rule) and cross-checked against the Capital IQ Guidance tab's same-dated entry.

| Metric | Period | Guidance | Type (Point / Range / Qualitative) | Source |
|---|---|---|---|---|
| Net sales | FQ4 FY26 (qtr ending ~Aug 29, 2026) | $322M–$332M, i.e. down 13% to 10% year-over-year | Range | Q3 FY26 earnings call transcript, prepared remarks (CFO Bealer), Jul 9 2026; corroborated by Estimates Report.xls, Guidance tab, entry dated 2026-07-09 |
| Net sales | FY26 (full year) | $1.345B–$1.355B, i.e. down 7% to 6% year-over-year | Range | same |
| Adjusted EBITDA | FQ4 FY26 | $52M–$57M, down 22% to 14% year-over-year | Range | same |
| Adjusted EBITDA | FY26 | $220M–$225M, down 21% to 19% year-over-year | Range | same |
| GAAP gross margin | FY26 | "Now expected to decline roughly 375 basis points" versus FY25's reported 36.24% — implies ~32.5% for the year | Qualitative bps guide (single implied point) | Q3 FY26 transcript, prepared remarks; the implied point (32.49%) matches the Guidance tab's FY2026 entry exactly |
| GAAP gross margin | FQ4 FY26 | "Our strongest [gross margin] of the year, as productivity initiatives provide some relief against sustained inflationary pressure" — no numeric point given for the quarter | Qualitative | Q3 FY26 transcript, prepared remarks. Note: the Guidance tab shows a FQ4 2026 gross-margin range of 36.40%–36.60%, but that entry's own "Guidance Date" is 2026-01-08 — three quarters stale, predating the July update — so it is not usable as the current guide for the quarter |
| Effective tax rate | FY26 | "Roughly 25%" | Point | Q3 FY26 transcript, prepared remarks; matches Guidance tab FY2026 entry (25%) |
| Effective tax rate | FQ4 FY26 | 25% | Point | Guidance tab entry, 2026-07-09 (not separately voiced in the reviewed transcript excerpt) |
| Interest expense | FY26 | "Our expectations on interest expense remain unchanged" (qualitative reaffirmation); Guidance tab shows $(19.00)M–$(21.00)M | Qualitative reaffirmation / Range (vendor tab) | Q3 FY26 transcript + Guidance tab, 2026-07-09 entry |
| Capital expenditure | FY26 | Transcript (verbatim CFO quote): "we now expect capital expenditures to be in the range of **$25 million to $30 million**." Guidance tab (vendor parse, same 2026-07-09 date): **$(20.00)M–$(25.00)M**. **These two same-dated sources disagree by roughly $5M on both ends of the range — flagged, not silently resolved.** Per this module's source hierarchy, a verbatim transcript quote outranks a Capital IQ export for guidance colour, so $25M–$30M is treated as the primary read below; the vendor figure is shown for transparency and should be reconciled against the company's own press release if/when it enters the pool | Range (conflicting) | Q3 FY26 transcript, prepared remarks (CFO Bealer) vs. Estimates Report.xls, Guidance tab, entry dated 2026-07-09 |
| Diluted share count | FQ4 FY26 | "Approximately 90 million shares outstanding" (weighted-average diluted, reflecting buybacks to date) | Point | Q3 FY26 transcript, prepared remarks |
| Other — capital allocation | FY26/FY27 | CFO: "first priority on capital is to provide funding for the turnaround… second priority is the capacity expansion on chips" (salty-snacks capacity); qualitative only, no dollar figure attached beyond the capex range above | Qualitative | Q3 FY26 transcript, Q&A (CFO Bealer) |

Range guidance midpoints used in Section 3: Net sales FQ4 FY26 = $327.0M; Net sales FY26 = $1,350.0M; Adjusted EBITDA FQ4 FY26 = $54.5M; Adjusted EBITDA FY26 = $222.5M.

The company does not give formal point or range guidance for EPS (normalized or GAAP) — the Guidance tab shows no entry for EPS Normalized in the FQ4 2026/FY2026 columns, and no EPS figure was voiced on the call. Section 3's EPS row is therefore consensus-only, with no guidance to compare it to.

## 3. Guidance vs Consensus Table

Gap = Consensus minus Guidance midpoint (positive = Street sits above guidance).

| Metric | Period | Management Guidance (midpoint) | Street Consensus | Gap | Gap Direction |
|---|---|---|---|---:|---|
| Net sales | FQ4 FY26 | $327.0M | $328.53M [Estimates Report.xls, Consensus tab, Market Summary — "Current Quarter" Revenue] | +$1.53M (+0.5%) | Guidance in-line — consensus sits marginally above the midpoint |
| Net sales | FY26 | $1,350.0M | $1,351.75M [Consensus tab, Market Summary — "Current Year" Revenue] | +$1.75M (+0.1%) | Guidance in-line |
| Adjusted EBITDA | FQ4 FY26 | $54.5M | $54.45M [Consensus tab, Market Summary — "Current Quarter" EBITDA] | -$0.05M (-0.1%) | Guidance in-line |
| Adjusted EBITDA | FY26 | $222.5M | $222.10M [Consensus tab, Market Summary — "Current Year" EBITDA] | -$0.40M (-0.2%) | Guidance in-line |
| EPS Normalized | FY26 | No formal company guidance (see Section 2) | $1.65 mean [Consensus tab, EPS Normalized row, FY2026 column = 1.64594] | Not computable — no guidance anchor | N/A |
| Capital expenditure | FY26 | $25M–$30M outflow per verbatim transcript (see Section 2 conflict note); vendor tab shows $(20)–$(25)M | $(24.09)M mean [Consensus tab, Capital Expenditure row, FY2026 column] | Against the transcript figure: consensus sits *below* the low end of guidance (~$21M inside the guided range on the low side); against the vendor's own guidance row, consensus sits inside the range. The unresolved guidance-source conflict (Section 2) makes this gap directionally suggestive only, not a clean read | Unclear — sourcing conflict flagged |

Guidance and consensus are essentially matched for the two headline metrics (net sales, adjusted EBITDA) at both the next-quarter and full-year level — gaps are all under 0.5%, inside normal rounding/timing noise. There is no metric here where the Street has built in a materially higher or lower number than what management just guided.

## 3A. Alt-Data Cross-Check

Not applicable. No `data/SMPL/external/` directory exists in this pool (confirmed in `00_earnings-data-triage.md`, Section 1A) — no licensed alt-data panel or vendor estimate is present. This section is omitted per instructions; its absence is not a data gap for this module.

## 4. Estimate Revision Momentum Table

Sourced from the Capital IQ Trends tab (snapshots at 1/2/3 months back, used here as the 30/60/90-day columns) and the current column. "Next Q" = FQ4 FY26 (the quarter still to be reported, release due Oct-23-2026). "Next FY" = FY2027 (the first fiscal year not yet substantially reported).

| Estimate | 90 Days Ago | 60 Days Ago | 30 Days Ago | Current | Direction |
|---|---:|---:|---:|---:|---|
| Revenue (next Q, FQ4 FY26) | $336.35M | $335.31M | $335.31M | $328.53M | Falling |
| EPS Normalized (next Q, FQ4 FY26) | $0.45 | $0.46 | $0.46 | $0.41 | Falling |
| Revenue (next FY, FY27) | $1,325.70M | $1,320.67M | $1,317.04M | $1,284.62M | Falling |
| EPS Normalized (next FY, FY27) | $1.74 | $1.77 | $1.74 | $1.71 | Falling |
| Adjusted EBITDA (next Q, FQ4 FY26) | $61.45M | $60.98M | $60.98M | $54.45M | Falling |
| Adjusted EBITDA (next FY, FY27) | $226.91M | $226.35M | $224.09M | $220.91M | Falling |

[All rows: Estimates Report.xls, Trends tab, "Revenue" / "EPS Normalized" / "EBITDA" blocks, FQ4 2026 and FY 2027 columns]

Every line is falling, at every horizon, right through the most recent 30 days — the cuts have not yet stopped. This is a genuinely different signal from the tight guidance-vs-consensus match in Section 3: Section 3 shows the *current* snapshot lines up with what management just guided; Section 4 shows the Street's own model was still coming down as recently as the last month, both for the imminent quarter and for the whole of next fiscal year.

## 5. Revision Breadth

Sourced from the Capital IQ Revisions tab, "Last 3 Months" rows, FY2027 column (next FY) — the tab does not break out Revenue/EBITDA breadth for the FQ4 FY26 (next-quarter) column beyond what is captured in Section 4's directional trend.

| Metric | Up Revisions | Down Revisions | Net Revision Breadth | Period |
|---|---:|---:|---:|---|
| Revenue next FY (FY27) | 1 | 7 | -6 | Last 3 Months |
| EBITDA next FY (FY27) | 2 | 6 | -4 | Last 3 Months |
| EPS Normalized next FY (FY27) | 1 | 6 | -5 | Last 3 Months |

[Estimates Report.xls, Revisions tab, "Last 3 Months" block, Revenue / EBITDA / EPS Normalized sections, FY 2027 column]

Breadth is lopsidedly negative across all three metrics — for every analyst who raised a FY2027 number in the last three months, five to seven cut it. This is not a market that has finished de-risking SMPL's out-year numbers; it is one still actively marking them down.

## 6. Historical Beat / Miss Pattern

The last four reported quarters, from the Capital IQ Surprise tab (quarterly block):

| Period | Revenue Beat/Miss | EPS Beat/Miss | Magnitude | Notes |
|---|---|---|---:|---|
| FQ4 FY25 (Aug 2025, reported 2025-10-23) | In-line | Miss | Revenue: actual $380.96M vs estimate $380.94M (~0.0%); EPS Normalized: actual $0.46 vs estimate $0.474 (~-2% to -3%) | Last quarter before the current three-quarter beat streak began [Estimates Report.xls, Surprise tab, FQ4 2025 column] |
| FQ1 FY26 (Nov 2025, reported 2026-01-08) | Beat | Beat | Revenue +0.1% ($369.04M vs $368.58M); EPS +8.1% ($0.39 vs $0.361) | First beat of the streak, still small [Surprise tab, FQ1 2026 column] |
| FQ2 FY26 (Feb 2026, reported 2026-04-09) | Beat | Beat | Revenue +0.3% ($340.20M vs $339.33M); EPS +13.6% ($0.45 vs $0.396) | Beat magnitude widening [Surprise tab, FQ2 2026 column] |
| FQ3 FY26 (May 2026, reported 2026-07-09) | Beat | Beat | Revenue +7.3% ($356.98M vs $332.62M); EPS +19.5% ($0.42 vs $0.353) | Largest beat of the streak on both lines. Caveat: GAAP gross margin *missed* both the prior guided range (36.40%-36.60%) and consensus (33.29%), coming in at 31.6% — the revenue/EBITDA beat was not a clean beat across every line [Estimates Report.xls, Surprise tab and Guidance tab, FQ3 2026 column] |

Three straight quarters of beats, growing in size each time, followed immediately by a Q4 guide that implies a *sharper* year-over-year sales decline (-13% to -10%) than the just-reported Q3's -6.3% actual decline. Management's own explanation on the call is a deliberate one: "we're going to slightly undership consumption in Q4 to enter next year with correctly organized and sized customer inventories" — a stated channel/inventory reset, not necessarily a demand call [Q3 FY26 transcript, Q&A, CFO Bealer].

## 7. Bar Assessment

**Bar is fair.**

**Stale-consensus check:** the consensus snapshot (data as of 2026-07-09, with individual analyst updates through 2026-07-21) is not stale — it postdates the most recently reported quarter (FQ3 FY26, also reported 2026-07-09) by design; the consensus and the guidance in Section 3 were set on the same day. No provisional-bar flag applies.

Guidance and Street consensus for the next quarter (FQ4 FY26) and the current fiscal year (FY26) sit within roughly half a percentage point of each other on both net sales and adjusted EBITDA (Section 3) — that is a genuinely matched bar, not a stretched or sandbagged one, on the two headline metrics management actually guides. Two cross-currents complicate a cleaner call. First, revision breadth for FY2027 remains heavily net-negative (-4 to -6 across revenue, EBITDA and EPS; Section 5) and every trailing-30/60/90-day trend line is still falling (Section 4) — the Street has not finished cutting its out-year model, which argues the bar could still move lower before it is genuinely settled. Second, the company has now beaten both guidance and consensus for three consecutive quarters with beats widening each time (Section 6), and it followed its largest beat yet with a Q4 guide implying a *steeper* year-over-year decline than the quarter it just posted — a pattern consistent with, though not proof of, continued conservative guide-setting. These two signals point in different directions — one says the medium-term model is still de-risking, the other says the near-term guide has recent form for being clearable — so this module calls the immediate setup fair rather than low, and flags the beat pattern as the single most useful input for `05_beat-miss-setup` to weigh explicitly.



---

## earnings / 05_beat-miss-setup.md

_Source: `05_beat-miss-setup.md`_

# Beat / Miss Setup — SMPL

## 1. Next Quarter Context

The next print is FQ4 FY2026 (13 weeks ending roughly Aug-29-2026), reporting Oct-23-2026 [`04_guidance-consensus.md` §1]. Management guided net sales to $322M–$332M (down 13% to 10% year-over-year) and Adjusted EBITDA to $52M–$57M (down 22% to 14% year-over-year), and Street consensus sits within 0.5% of the guidance midpoint on both lines — a genuinely matched bar, not obviously sandbagged or stretched [`04_guidance-consensus.md` §2–§3]. The quarter is also the first in which management is deliberately shipping below consumer takeaway to reset customer inventories, so the headline year-over-year decline embeds a one-time channel effect on top of the underlying demand trend [`02_revenue-drivers.md` §3, "Cycle-position note"; Q3 FY26 earnings call, Jul-9-2026, Q&A, CFO Bealer].

## 2. Beat Scenarios

| Scenario | Driver | What Would Need To Happen | Likelihood (High / Mid / Low) | Evidence |
|---|---|---|---|---|
| Quest sub-category momentum outruns the guide | Quest household penetration / chips & milkshake growth (`02_revenue-drivers.md` §7, single biggest revenue driver) | Chips (+17% consumption, FQ3 FY26) and milkshakes (+~50%) keep growing fast enough to offset continued bar softness (−5% in FQ3 FY26), lifting blended Quest net sales above the ~1% growth just posted | Mid | `02_revenue-drivers.md` §5 (Quest segment table); Q3 FY26 earnings call, Jul-9-2026, CEO prepared remarks |
| Deliberate under-shipment proves more conservative than needed | Channel / shipment-vs-consumption timing (`02_revenue-drivers.md` §4) | Retailers reorder faster than management's planned inventory reset, so actual FQ4 shipments land above the guided $322M–$332M range even though consumption itself does not accelerate | Mid | Q3 FY26 earnings call, Jul-9-2026, Q&A, CFO Bealer ("slightly undership consumption in Q4...") |
| Productivity initiatives keep beating the company's own forecast | Productivity / supply-chain initiatives (`03_margin-drivers.md` §5) | Gross margin in FQ4, already guided as "our strongest of the year," beats even that guide the way FQ3's ex-restructuring margin (34.3%) beat the company's internal forecast | Mid | Q3 FY26 earnings call, Jul-9-2026, prepared remarks ("exceeding our forecast driven by productivity initiatives"; Q4 "our strongest [gross margin] of the year") |
| Three-quarter beat streak continues on a genuinely matched bar | Historical beat/miss pattern (`04_guidance-consensus.md` §6) | Revenue and EPS beat guidance/consensus for a fourth straight quarter, following FQ1–FQ3 FY26 beats that widened each time (+0.1%→+0.3%→+7.3% on revenue; +8.1%→+13.6%→+19.5% on EPS) | Mid | `04_guidance-consensus.md` §6 (Surprise tab) |

## 3. Miss Scenarios

| Scenario | Driver | What Would Need To Happen | Likelihood (High / Mid / Low) | Evidence |
|---|---|---|---|---|
| Unhedged commodity/input-cost inflation worsens further | Input-cost inflation, protein complex and packaging (`03_margin-drivers.md` §8, single biggest margin driver) | Protein/packaging costs run hotter than the guided ~375bps GAAP gross-margin decline for FY26, with zero commodity hedges in place to cushion the hit | Mid | `03_margin-drivers.md` §2, §5; FY25 10-K, Item 1A, p.22 ("We do not use hedges...") |
| Atkins distribution losses accelerate beyond guide | Atkins household penetration / shelf-space losses (`02_revenue-drivers.md` §5) | Walmart or another large retailer cuts further Atkins assortment inside the quarter, pushing Atkins's −23.9% FQ3 FY26 retail-takeaway decline into a steeper drop | Mid | `02_revenue-drivers.md` §5 (Atkins segment table); FY25 10-K, Item 1A |
| Deliberate under-shipment masks a real demand deceleration, not just a timing reset | Channel / shipment-vs-consumption timing (`02_revenue-drivers.md` §4) | The stated inventory-reset framing turns out to understate an actual acceleration in the underlying consumption decline (particularly in Quest bars or Atkins), so the print misses even the lowered guide range | Low-Mid | Q3 FY26 earnings call, Jul-9-2026, Q&A, CFO Bealer; `01_historical-financials.md` §3 (four straight quarters of YoY revenue decline, magnitude widening in FQ2 to −9.4%) |
| Quest bar consumption keeps declining, dragging the company's largest single driver | Quest bar sub-category consumption (`02_revenue-drivers.md` §7) | Bar consumption (−5% in FQ3 FY26, ~80% of Quest combined with chips) fails to stabilize even as management calls re-accelerating bars "our highest priority" | Mid | `02_revenue-drivers.md` §5 and §7 |

## 4. What Magnitude Matters?

| Metric | Consensus / Bar | Material Beat Threshold | Material Miss Threshold | Why |
|---|---:|---:|---:|---|
| Revenue (FQ4 FY26) | $328.53M consensus / $327.0M guide midpoint [`04_guidance-consensus.md` §3] | >$338M (>+3% vs consensus) | <$319M (below the guided low end of $322M) | Recent beat magnitudes ranged +0.1% to +7.3% over the last three quarters; a beat above +3% would exceed all but the largest, and a miss below management's own guided floor would be a genuine break in the recent pattern of guidance accuracy [`04_guidance-consensus.md` §6] |
| Adjusted EBITDA (FQ4 FY26) | $54.45M consensus / $54.5M guide midpoint [`04_guidance-consensus.md` §3] | >$60M (>+10%) | <$49M (below the guided low end of $52M) | Prior quarter's EBITDA-line surprise was smaller in percentage terms than revenue/EPS surprises this cycle but still positive each quarter; falling below the guided range would mean the company's own downside case did not hold |
| EPS (normalized, FQ4 FY26) | $0.41 mean, already cut from $0.45 ninety days ago [`04_guidance-consensus.md` §4] | >$0.47 (>+15%) | <$0.35 (<−15%) | No formal company EPS guidance exists (`04_guidance-consensus.md` §2); thresholds are anchored to the historical beat range of +8.1% to +19.5% over the last three quarters [`04_guidance-consensus.md` §6] |
| Guidance (initial FY27 outlook, given alongside the FQ4 print) | No formal FY27 guide yet; Street FY27 revenue $1,284.6M, EBITDA $220.9M, EPS $1.71 — all still falling every month for the last 90 days [`04_guidance-consensus.md` §4] | FY27 outlook framing that shows Atkins decline narrowing and the September 2026 price increase lifting net realized price without an offsetting volume loss beyond the stated ~1.0x elasticity | FY27 outlook implying continued double-digit Adjusted EBITDA decline, further gross-margin erosion past FY26's guided ~375bps cut, or an elasticity worse than management's own 1.0x-or-higher estimate | FY27 is the first year carrying the price increase and its stated volume trade-off, and the Street's FY27 model is still actively being cut (net revision breadth −4 to −6 across revenue/EBITDA/EPS in the last three months) [`04_guidance-consensus.md` §5] — the framing of this outlook matters more to the setup than the FQ4 print itself |

## 5. In-Line Print But Bad Guidance Risk

| Risk | Evidence | Why It Matters |
|---|---|---|
| In-line FQ4 print but a weak initial FY27 guide | FY27 Street estimates already falling every 30/60/90-day window with net revision breadth −4 to −6 (revenue/EBITDA/EPS) before the FY27 guide is even issued [`04_guidance-consensus.md` §4–§5] | A matched FQ4 bar tells the market little if the initial FY27 number confirms the Street is right to keep cutting — the forward reaction is set by the FY27 framing, not the trailing print |
| Beat FQ4 EBITDA on productivity one-offs, weak underlying gross-margin trend continues | FQ3 FY26 gross margin beat the company's internal forecast on productivity initiatives, but GAAP gross margin still missed both the prior guided range and consensus that same quarter (31.6% actual vs 36.40%–36.60% guided, 33.29% consensus) [`04_guidance-consensus.md` §6] | A "clean" EBITDA beat can coexist with a genuine gross-margin miss — the two lines do not always move together, and the margin line is the one management itself calls the leading indicator [`03_margin-drivers.md` §4] |
| Beat revenue but Atkins and Quest-bar deterioration continue underneath | Atkins retail takeaway −23.9% in FQ3 FY26; Quest bar consumption −5% in the same quarter, even as consolidated Quest net sales rose +1.1% on chips/milkshake strength [`02_revenue-drivers.md` §5] | A consolidated beat driven by Quest's newer, smaller sub-categories (chips, milkshakes) does not resolve the structural weakness in the two largest disclosed problem areas (Atkins, Quest bars) — quality of any beat should be checked at the brand level, not just the headline |
| Beat print but net debt / buyback trajectory keeps worsening the balance sheet backdrop | Net debt rose from $206.0M (FY25-end) to $324.6M (FQ3 FY26) on $242.3M of buybacks funded while Adjusted EBITDA was falling [`01_historical-financials.md` §6] | A revenue/EBITDA beat does not offset a capital-allocation choice (debt-funded buybacks against declining Adjusted EBITDA) that reduces headroom ahead of the FY27 turnaround investment CFO Bealer flagged as the "first priority" [`04_guidance-consensus.md` §2] |

## 6. Seasonality Read

Seasonality is a mild net positive for the calendar quarter itself but is being deliberately overridden by management this cycle. SMPL's own three-year seasonality table shows Q3/Q4 (the March–August fiscal window) are consistently the largest revenue quarters, at 25–28% of annual sales versus 23–24% for Q1 [`01_historical-financials.md` §5]. Ordinarily that would help a Q4 print. This time it does not translate into a tailwind for the reported number, because management has explicitly chosen to ship below consumption in FQ4 FY26 to correct customer inventory levels [`02_revenue-drivers.md` §3], which is exactly why the FQ4 guide implies a steeper year-over-year decline (−13% to −10%) than the just-reported FQ3's actual decline (−6.3%) [`04_guidance-consensus.md` §6]. Seasonality supports the underlying demand base but is being netted against a one-time, company-chosen shipment reduction — the two effects should not be read as offsetting cleanly, since the size of the inventory reset relative to seasonal strength is not disclosed.

## 7. Historical Pattern

SMPL has beaten both revenue and EPS guidance/consensus for three consecutive quarters (FQ1–FQ3 FY26), with the beat magnitude widening each time — from a roughly in-line +0.1%/+8.1% (revenue/EPS) in FQ1 to a much larger +7.3%/+19.5% in FQ3 [`04_guidance-consensus.md` §6]. That streak followed an in-line-to-miss FQ4 FY25 (revenue in-line, EPS missed by 2–3%), so the pattern is short — three quarters — and should be weighted as suggestive of a management team that has recently guided conservatively, not as a proven multi-year sandbagging pattern. The synthesizer should weight it moderately: it is real, cited evidence of recent guide-beatability, but `04_guidance-consensus.md` itself calls the current FQ4 bar "fair" rather than "low," precisely because the beat streak is offset by heavily negative FY27 revision breadth that has not resolved [`04_guidance-consensus.md` §7]. A fourth consecutive beat would strengthen the pattern; a miss would immediately reset it to a much weaker three-quarters-out-of-five read.

## 8. Setup Verdict

**Setup is balanced.**

The single most important factor is that the FQ4 FY26 bar is genuinely matched to guidance — consensus sits within 0.5% of management's own midpoint on both net sales and Adjusted EBITDA [`04_guidance-consensus.md` §3] — which means the three-quarter widening beat streak [`04_guidance-consensus.md` §6] cannot be read as evidence of a sandbagged, easily-clearable bar; it is evidence of recent execution against a fair bar, no more and no less. The single biggest risk that could flip this either way is the deliberate FQ4 under-shipment: if it proves to be exactly what management describes — a timing reset — the beat streak likely continues; if it coincides with a genuine acceleration in Atkins distribution losses or Quest-bar consumption decline (both already worsening, per §2 above), the print could miss even the lowered bar and confirm the still-negative FY27 revision trend [`04_guidance-consensus.md` §4–§5].

## 9. Second-Quarter Look-Ahead

The quarter after next — FQ1 FY27, reporting around January 2027 — carries a materially different setup because it is the first full quarter under the September 2026 high-single-digit list-price increase, and management has explicitly flagged an offsetting volume risk ("elasticities to be at 1 or higher...there's going to be a volume impact") [`02_revenue-drivers.md` §4; `03_margin-drivers.md` §5]. Atkins comparisons are also expected to turn "more favorable" as the company laps last year's distribution losses [`02_revenue-drivers.md` §5]. There is no visibility yet on how the price/volume trade-off nets out — the initial FY27 guide (due with the FQ4 FY26 print on Oct-23-2026) is the first real read, and the Street's own FY27 estimates are still being cut every month with no sign of stabilizing [`04_guidance-consensus.md` §4–§5].

## 10. Pre-Mortem

If this setup fails, the most likely reason is that the September 2026 price increase triggers a larger-than-guided volume decline — management itself flagged elasticity at or above 1.0x — layering onto an already-decelerating Quest-bar and Atkins base, and that deterioration would show up in retail consumption data before it showed up in the reported numbers. No licensed alt-data consumption panel exists in this pool to catch that signal early [`04_guidance-consensus.md` §3A: "Not applicable...no `data/SMPL/external/` directory exists"], so this setup would be the kind of miss the engine could not have seen coming from filings alone.



---

## earnings / 06_earnings-quality.md

_Source: `06_earnings-quality.md`_

# Earnings Quality — SMPL

**Jurisdiction / basis:** US domestic filer (Nasdaq: SMPL), US GAAP, reporting currency USD millions unless stated otherwise. Fiscal year ends the last Saturday in August; FY2024 was a 53-week year. [FY2025 10-K, cover page and Note 2]. Upstream historical-financials output (`analyses/SMPL_2026-08-06/earnings/01_historical-financials.md`) is available and used as the baseline for this report; figures are independently re-derived from the primary cash-flow, balance-sheet, and income-statement data in the pool and cross-checked to it.

**Read this before the tables:** the single dominant fact in this pool is a $391.9 million combined goodwill/brand intangible impairment recognized across three of the last four fiscal quarters (FQ4 FY2025 $60.9M Atkins; FQ2 FY2026 $249.0M OWYN/Atkins/goodwill; FQ3 FY2026 $82.0M OWYN/Atkins/goodwill) [FY2025 10-K, Income Statement; Q2 FY2026 10-Q MD&A; Q3 FY2026 10-Q, Note 4 (Goodwill and Intangibles)]. This is a non-cash charge, so it does not by itself break cash conversion — but the company's own Adjusted EBITDA (its primary non-GAAP KPI) excludes it every time, and the repetition (three write-downs in four quarters, against acquisitions made in FY2024 and earlier) is itself an earnings-quality signal: it shows the "clean" number investors are pointed to has excluded a real, recurring pattern of value destruction from prior M&A, not a single unusual event.

## 1. EBITDA → CFO → FCF Bridge (5 years, USD millions)

| Item | FY2021 | FY2022 | FY2023 | FY2024 (53wk) | FY2025 | Trend |
|---|---:|---:|---:|---:|---:|---|
| EBITDA (GAAP, company-defined) | 196.1 | 222.2 | 225.2 | 228.8 | 177.9 | Deteriorating |
| Working capital change | (22.1) | (81.0) | (18.5) | +19.0 | (32.9) | Deteriorating (source of cash in FY24, use of cash in FY25) |
| Tax paid (cash) | (32.2) | (49.2) | (27.4) | (33.2) | (39.3) | Volatile |
| Interest paid (cash) | (27.8) | (19.2) | (25.5) | (25.7) | (22.0) | Volatile |
| Other operating items (non-cash add-backs — SBC, impairment, deferred tax, bad-debt provision, other; D&A cancels out algebraically since GAAP EBITDA already adds it back before subtraction to net income) | +18.1 | +37.9 | +17.4 | +26.9 | +94.7 | Volatile — FY25 spike driven by the $60.9M non-cash impairment add-back |
| **CFO** | **132.1** | **110.6** | **171.1** | **215.7** | **178.5** | Deteriorating (FY25 down 17.2% YoY) |
| Maintenance capex | Not disclosed | Not disclosed | Not disclosed | Not disclosed | Not disclosed | — |
| Growth capex | Not disclosed | Not disclosed | Not disclosed | Not disclosed | Not disclosed | — |
| Total capex | 5.9 | 5.2 | 11.6 | 5.7 | 20.5 | Deteriorating (FY25 +260% YoY, unexplained in filings) |
| **FCF (CFO − Total Capex)** | **126.2** | **105.4** | **159.5** | **210.0** | **157.9** | Deteriorating (FY25 down 24.8% from FY24 peak) |
| **CFO / EBITDA %** | 67.4% | 49.8% | 76.0% | 94.3% | 100.3% | Improving, but the FY24–FY25 spike is partly a denominator effect (GAAP EBITDA itself falling) rather than pure cash-conversion strength |

**Capex split not disclosed — total capex used. FCF may understate true recurring free cash flow.** SMPL states only that it "operate[s] an asset-light business model" using third-party contract manufacturers and that capex is "targeted" [FY2025 10-K, Item 1, p. business section]; no breakdown of maintenance vs growth spend is given in the 10-K or 10-Qs in this pool. The FY2025 jump to $20.5M (and further to $28.1M on a trailing-twelve-month basis, per `01_historical-financials.md` Section 2) is not explained by any capex-specific disclosure found in this pool — flagged as a limitation, not assumed to be growth spend.

**Normalised vs reported FCF (§15 check):** no evidence of a one-off cash item (e.g., a large customer advance) inflating any year's reported FCF, and the company does not define FCF differently from the standard CFO − capex convention used above (it does not publish its own FCF metric at all). Reported FCF above is therefore the correct lead figure; no normalisation adjustment is required.

Sourcing: EBITDA and CFO figures are the company's own GAAP figures (FY2023–FY2025 from the FY2025 10-K three-year statements; FY2021–FY2022 from the Capital IQ annual export, which equals GAAP for those two years per `01_historical-financials.md` Section 1, since SMPL had zero reclassified unusual items in FY2021–FY2022). Working-capital, tax-paid, and interest-paid lines are from the Capital IQ Financials_Annual.xls Cash Flow tab (supplemental items and the four working-capital change rows), cross-checked to sum to the company's own reported CFO for each year to within rounding. [The Simply Good Foods Company NasdaqCM SMPL Financials_Annual.xls, Cash Flow tab; FY2025 10-K, Consolidated Statements of Cash Flows]

## 2. Cash Conversion Assessment

On a GAAP basis, CFO has tracked EBITDA reasonably well through FY2023–FY2025 — conversion ran 76% (FY2023), 94% (FY2024), and 100% (FY2025), all comfortably above the 70% "healthy" threshold — but FY2021–FY2022 were weaker (67% and 50%), driven by working-capital build in those years (inventory and receivables growing as the company scaled post-IPO). The trajectory changes sharply in the trailing twelve months: GAAP EBITDA has swung to $(213.1)M (negative) because of the $391.9M impairment discussed above, making a GAAP CFO/EBITDA ratio not meaningful for that period; on the company's own Adjusted EBITDA (which excludes the impairment and other add-backs), conversion was 80.1% in FY2024, fell to 64.1% in FY2025, and further to 62.9% on the Latest TTM (Adjusted EBITDA $234.6M vs CFO $147.5M) [FY2025 10-K MD&A; Q3 FY2026 10-Q MD&A; `01_historical-financials.md` Section 2]. **Neither the GAAP-EBITDA basis (FY2023–FY2025: 76%/94%/100%) nor the Adjusted-EBITDA basis (FY2024–TTM: 80%/64%/63%) shows CFO/EBITDA below 50% for 2 or more of the last 3 years — the cash-conversion-breakdown trigger is NOT met, and `RF-EQ-002` is not emitted.** The more accurate read is: cash conversion off the company's clean KPI is weakening (80%→64%→63%) even though it has not broken down, and the GAAP-basis collapse is a non-cash accounting event, not a cash-generation collapse.

## 3. Working Capital Trends

| Metric | FY2023 | FY2024 | FY2025 | Direction | Risk |
|---|---:|---:|---:|---|---|
| Receivable days (DSO) | 40.8 | 40.5 | 39.7 | Stable / mildly improving | Low |
| Inventory days (DIO) | 56.0 | 57.8 | 61.1 | Rising (+9.1% cumulative FY23→FY25) | Medium — inventory building faster than COGS two years running |
| Payable days (DPO) | 26.6 | 24.9 | 27.0 | Volatile, no clear stretch | Low |
| Cash conversion cycle (DSO + DIO − DPO) | 70.2 | 73.5 | 73.8 | Lengthening (+3.6 days over two years) | Medium — entirely driven by the DIO build, not by AR or AP |

**Formulas used:** DSO = 365 × average receivables ÷ revenue; DIO = 365 × average inventory ÷ COGS; DPO = 365 × average payables ÷ COGS (purchases not separately disclosed). Averages use (opening + closing) ÷ 2 for each fiscal year, drawn from the Capital IQ annual balance sheet (Accounts Receivable, Inventory, Accounts Payable rows) and the annual income statement (Cost Of Goods Sold row) [The Simply Good Foods Company NasdaqCM SMPL Financials_Annual.xls, Balance Sheet and Income Statement tabs]. No single year's DSO, DIO, or DPO move exceeds the 10%/15% thresholds that would mechanically flag a red flag on its own (largest single-year DIO move is FY25's +5.8%), but the two-year cumulative DIO trend (56.0 → 57.8 → 61.1 days, +9.1%) is a genuine, sustained build worth flagging — consistent with `01_historical-financials.md`'s finding of decelerating gross margin and a demand slowdown (four consecutive quarters of YoY revenue decline through FQ3 FY2026), which raises the risk that some of this inventory is building against softening sell-through rather than growth.

## 4. Non-GAAP Adjustments

| Adjustment | Amount | Recurring? (Y/N) | Concern Level | Evidence |
|---|---:|---|---|---|
| Loss on impairment (goodwill/brand intangibles) | $391.9M cumulative over FQ4 FY2025–FQ3 FY2026 ($60.9M + $249.0M + $82.0M) | Y — 3 of the last 4 fiscal quarters | High | [FY2025 10-K, Income Statement; Q2 FY2026 10-Q MD&A; Q3 FY2026 10-Q, Note 4] |
| Stock-based compensation, excluded from Adjusted EBITDA | $18.4M FY2024; $15.3M FY2025; $5.6M FQ3 FY2026 | Y — every period | Mid | [FY2025 10-K MD&A, "Reconciliation of EBITDA and Adjusted EBITDA"; Q3 FY2026 10-Q MD&A] |
| Integration expense (OWYN acquisition) | $0.6M FY2024; $20.9M FY2025; $5.2M FQ3 FY2026 | Y — every period since the FY2024 acquisition | High — labelled non-recurring by the company but has recurred in every reported period for two-plus years | [FY2025 10-K MD&A; Q3 FY2026 10-Q MD&A] |
| Business-transaction costs (OWYN deal) | $14.5M FY2024; $0.8M FY2025 | N — deal-specific, tapering to near zero | Low | [FY2025 10-K MD&A] |
| Restructuring / other | $13.5M FQ3 FY2026 (13wk); net $0.2M FY2025 | Mixed — reappeared in FY2026 after being negligible in FY2025 | Mid | [Q3 FY2026 10-Q MD&A; FY2025 10-K MD&A] |
| Executive-transition costs | $3.9M FY2024 | N | Low | [FY2025 10-K MD&A, FY2024 column] |
| Inventory step-up (purchase accounting) | $3.2M FY2024; $1.4M FY2025 | N — deal-specific | Low | [FY2025 10-K MD&A] |
| Term-loan transaction fees | $0.7M FY2025 | N | Low | [FY2025 10-K MD&A] |

The FY2025 adjustment total ($100.2M) is 56.3% of GAAP EBITDA ($177.9M) — well above the 15% materiality threshold; FY2024's adjustment total ($40.4M) is 17.7% of GAAP EBITDA ($228.8M) — also above threshold. For FQ3 FY2026, the adjustment ($101.1M) exceeds GAAP EBITDA in absolute size (GAAP EBITDA is negative $(43.8)M that quarter), so the ratio is not meaningful, but in dollar terms the gap between reported and adjusted results is the largest in the five-year dataset. Company definition: "EBITDA" is net income before interest, tax, D&A; "Adjusted EBITDA" further excludes loss on impairment, SBC, business-transaction costs, inventory step-up, integration expenses, term-loan fees, restructuring, and other non-core expenses [Q3 FY2026 10-Q MD&A]. SBC is excluded from the company's own "clean" earnings metric every single period — this is the classic non-GAAP trap named in this module's mandate.

## 5. One-Off Items (last 3 fiscal years / trailing quarters)

| Item | Period | Amount | Classification | Evidence |
|---|---|---:|---|---|
| Atkins brand impairment | FQ4 FY2025 (13wk ended Aug-30-25) | $60.9M | Recurring "one-off" — first of three impairments inside four quarters | [FY2025 10-K, Income Statement, Asset Writedown line; MD&A] |
| OWYN + Atkins + goodwill impairment | FQ2 FY2026 (13wk ended Feb-28-26) | $249.0M | Recurring "one-off" | [Q2 FY2026 10-Q MD&A; `01_historical-financials.md` Section 4] |
| OWYN ($13.0M) + Atkins ($31.0M) + goodwill ($38.0M) impairment | FQ3 FY2026 (13wk ended May-30-26) | $82.0M | Recurring "one-off" | [Q3 FY2026 10-Q, Note 4 (Goodwill and Intangibles)] |
| OWYN acquisition business-transaction costs | FY2024 | $14.5M | Genuine one-off (deal-specific) | [FY2025 10-K MD&A, FY2024 column] |
| Executive-transition costs | FY2024 | $3.9M | Genuine one-off | [FY2025 10-K MD&A] |
| Tax benefit from wind-down of legacy Canadian subsidiary | 39 weeks ended May-30-2026 | Not separately quantified in dollars in the pool; described qualitatively as the primary driver of a lower effective tax rate vs the prior-year comparable period | Genuine one-off, but it flatters the near-term reported net result / effective tax rate | [Q3 FY2026 10-Q, Income Tax discussion / MD&A] |
| CEO departure and change in principal accounting officer | Inside the same FQ4 FY2025–FQ2 FY2026 window as the first two impairments | N/A (governance event, not a P&L line) | Not classified as a financial one-off, but the coincidence in timing with the impairments is itself a flag — cross-referenced to `business-model/11_capital-allocation-governance.md` and `business-model/12_red-flags-sweep.md` per `01_historical-financials.md` Section 6 | [`01_historical-financials.md` Section 6] |

The through-line across every genuinely large item in this table is M&A-related: three impairments against OWYN, Atkins, and the associated goodwill, all stemming from acquisitions made in FY2024 and earlier. None of these are accounting manipulation — they are disclosed, quantified, and reconciled to the balance-sheet Goodwill/Intangibles notes — but calling any one of them a "one-off" is no longer accurate once it is the third occurrence in four quarters.

## 6. Accrual Quality Flags

| Flag | Triggered (Y/N) | Evidence |
|---|---|---|
| Revenue growing faster than CFO for 2+ years | Y | FY2022: revenue +16.2% while CFO fell −16.3% (to $110.6M from $132.1M); FY2025: revenue +9.0% while CFO fell −17.2% (to $178.5M from $215.7M). [Capital IQ Financials_Annual.xls, Income Statement and Cash Flow tabs; `01_historical-financials.md` Section 1] |
| Receivables growing faster than revenue | Y | FY2022: AR +19.0% vs revenue +16.2%; FY2023: AR +9.4% vs revenue +6.3%. FY2024 reversed (AR +3.9% vs revenue +7.1%); FY2025 was roughly matched (AR +9.5% vs revenue +9.0%). [Capital IQ Financials_Annual.xls, Balance Sheet and Income Statement tabs] |
| Inventory growing faster than COGS | Y | FY2024: inventory +21.9% vs COGS +3.5%; FY2025: inventory +17.7% vs COGS +13.1%. Two consecutive years, consistent with the DIO build in Section 3. [Capital IQ Financials_Annual.xls, Balance Sheet and Income Statement tabs] |
| Deferred revenue declining (if subscription/contract business) | N/A | SMPL is a branded CPG business selling through retail (Quest, Atkins, OWYN); no deferred revenue / contract-liability balance is disclosed in the 10-K or 10-Qs in this pool — not a subscription or long-term-contract revenue model, so this check does not apply. |
| Capitalized costs growing as % of revenue | Y | Capex was a steady 0.4–0.9% of revenue FY2021–FY2024, then jumped to 1.4% of revenue in FY2025 ($20.5M on $1,450.9M revenue) and 2.0% on a trailing-twelve-month basis ($28.1M on $1,392.2M TTM revenue) — a step-change not explained by any capex-specific disclosure found in this pool. [Capital IQ Financials_Annual.xls and Financials_Quarterly.xls, Cash Flow tabs; `01_historical-financials.md` Section 2] |
| Frequent accounting policy changes | N | The FY2025 10-K's "Recently Issued Accounting Pronouncements" discussion covers only routine, not-yet-effective FASB updates (e.g., ASU 2025-06 on internal-use software, effective FY2028+); no evidence found of a retrospective policy change, useful-life change, or restatement in the FY2023–FY2025 filings in this pool. [FY2025 10-K, Note 2; Q3 FY2026 10-Q, Note 2] |

**Four of the five applicable rows above are triggered Y (the deferred-revenue row is genuinely not applicable to this business model, not a "no" on the merits) — this clears the "2 or more" bar for rising accruals divergent from cash earnings.**

`RF-EQ-001 (rising accruals divergent from cash earnings)`

## 7. Reported vs Adjusted Reconciliation

| Metric | Reported | Adjusted | Difference | % of Reported | Recurring? | Evidence |
|---|---:|---:|---:|---:|---|---|
| EBITDA (FY2025) | $177.9M (GAAP) | $278.2M (company Adjusted EBITDA) | $100.2M | 56.3% | Yes — impairment, SBC, and integration expense recur every period (Section 4) | [FY2025 10-K MD&A] |
| EBITDA (Latest TTM, to May-30-26) | $(213.1)M (GAAP) | $234.6M (company Adjusted EBITDA, agent-derived TTM sum per `01_historical-financials.md` Section 2) | $447.7M | Not meaningful (negative reported base) | Yes | [FY2025 10-K MD&A; Q1–Q3 FY2026 10-Qs MD&A] |
| EBIT | $156.9M (GAAP Income from Operations, FY2025, per company 10-K) | Not disclosed | — | — | — | Company reconciles net income → EBITDA → Adjusted EBITDA only; it does not publish an adjusted operating-income figure. [FY2025 10-K; `01_historical-financials.md` Section 4] |
| Net income | $103.6M (GAAP, FY2025) | Not disclosed by the company | — | — | — | The company does not reconcile an adjusted net income figure. Capital IQ separately publishes a vendor-computed "Normalized Net Income" of $137.4M for FY2025 — this is a data-vendor normalization, not a company-disclosed figure, and is cited here under Capital IQ's own name, not the company's. [Capital IQ Financials_Annual.xls, Income Statement tab, "Normalized Net Income" row] |
| EPS (diluted) | $1.02 (GAAP, FY2025) | Not disclosed by the company | — | — | — | Same caveat as net income. Capital IQ's vendor-computed "Normalized Diluted EPS" for FY2025 is $1.354 — cited under Capital IQ's name only, never presented as the company's own adjusted EPS. [Capital IQ Financials_Annual.xls, Income Statement tab, "Normalized Diluted EPS" row] |

## 8. Accounting Trap Checklist

*(Severity column is inverted per CLAUDE.md §12 — higher score = worse.)*

| Trap | Triggered? (Y/N) | Evidence | Severity /100 *(higher = WORSE — inverted)* |
|---|---|---|---:|
| Stock-based compensation excluded from adjusted earnings | Y | SBC ($15.3M FY2025, $18.4M FY2024, $5.6M FQ3 FY2026) is added back every period in the company's own EBITDA-to-Adjusted-EBITDA reconciliation. [FY2025 10-K MD&A] | 40 |
| Restructuring costs recur every year | Y | "Merger & Related Restructuring Charges" reappeared in FY2024 ($18.3M) after being zero FY2021–FY2023, then recurred FY2025 ($23.1M) and the trailing twelve months ($20.8M); a separate "Restructuring Charges" line reappeared at $18.1M on the LTM period. [Capital IQ Financials_Annual.xls, Income Statement tab] | 45 |
| Capitalized costs rising faster than revenue | Y | Capex rose from 0.4% of revenue (FY2024) to 1.4% (FY2025) to 2.0% (TTM), against 9.0% revenue growth in FY2025 and a revenue decline on the TTM. [Capital IQ Financials_Annual.xls / Financials_Quarterly.xls, Cash Flow tabs] | 35 |
| Receivable factoring / supplier finance disclosed | N | No factoring, receivables-sale, or supply-chain-finance program disclosed in the FY2025 10-K or the two FY2026 10-Qs in this pool. | 0 |
| Inventory write-downs or reserve releases | N | No inventory reserve, obsolescence, or write-down disclosure found in the pool documents — the DIO build in Section 3 is a volume/mix signal, not a disclosed write-down. | 0 |
| Revenue recognized before cash collection risk is clear | N | Standard retail-CPG revenue recognition on delivery/transfer of control; no evidence of channel-stuffing or bill-and-hold language in the filings reviewed. | 0 |
| Change in useful life / depreciation assumptions | N | No disclosed change in useful-life or depreciation-method assumptions found in Note 2 or the PP&E notes of the FY2025 10-K. | 0 |
| Tax rate unusually low or boosted by one-off | Y | The 39-week FY2026 effective tax rate was reduced by a tax benefit tied to the wind-down of a legacy Canadian subsidiary, on top of the tax effect of the non-deductible goodwill impairment. [Q3 FY2026 10-Q, Income Tax discussion] | 30 |
| Large fair-value / mark-to-market gains | N | No fair-value or mark-to-market gain line of any size found in the income statement or notes reviewed. | 0 |

## 9. Earnings Quality Score

**Score: 44 / 100 — band 41–60, "Material concerns."**

The single most important reason for this score: cash conversion itself has not broken down (GAAP CFO/EBITDA ran 76–100% in FY2023–FY2025, and the company's Adjusted EBITDA-based conversion, while declining, has stayed at 62–80% through the Latest TTM — see Section 2), so this is not a case of earnings with no cash behind them. What caps the score in the "material concerns" band rather than "mostly clean" is the accrual and adjustment pattern documented in Sections 4–8: four of the five applicable accrual-quality flags are triggered (Section 6, `RF-EQ-001`), non-GAAP adjustments have exceeded 15% of GAAP EBITDA in both of the last two full fiscal years, and — most importantly — the company's primary "clean" metric (Adjusted EBITDA) has now excluded a real, recurring pattern of impairment across three of the last four quarters ($391.9M cumulative) stemming from acquisitions the company itself made. That is not a one-off distortion of a single quarter's results; it is a multi-quarter pattern that the "adjusted" framing is structurally unable to show investors as anything other than noise.

## 10. The Single Biggest Quality Concern

The biggest risk that reported (adjusted) earnings overstate economic reality is the repeated goodwill/brand impairment pattern itself, not a single accounting trick. Three impairment charges inside four fiscal quarters — Atkins ($60.9M, FQ4 FY2025), OWYN/Atkins/goodwill ($249.0M, FQ2 FY2026), and OWYN/Atkins/goodwill again ($82.0M, FQ3 FY2026), totaling $391.9M — are each individually disclosed and non-cash, so none of them is a fabrication. But every one of them is excluded from Adjusted EBITDA, the metric management and the market use to judge "underlying" performance, and the fact that it recurred three times in four quarters means the underlying acquisitions (OWYN and Atkins) are proving to have been worth less than what the company paid and continued to carry on its balance sheet — a genuine, cash-relevant economic loss that the adjusted-earnings framing is designed to make disappear. Layered on top of that: Adjusted EBITDA margin itself has compressed roughly 330 basis points over the last twelve months net of the impairment add-back [`01_historical-financials.md` Section 2], inventory days have risen for two straight years against a demand backdrop of four consecutive quarters of YoY revenue decline, and the company has continued to buy back stock ($242.3M over the last four quarters, per `01_historical-financials.md` Section 6) while Adjusted EBITDA was falling and net debt was rising back toward $324.6M. None of these facts individually would be disqualifying, but together they describe a company whose reported "clean" earnings number is carrying less signal about the underlying business than the reconciliation tables suggest.



---

## earnings / 07_earnings-sensitivity.md

_Source: `07_earnings-sensitivity.md`_

# Earnings Sensitivity — SMPL

## 1. Variable Selection

Seven variables were selected from the driver tables in `earnings/02_revenue-drivers.md` §4 and `earnings/03_margin-drivers.md` §5, all rated High magnitude in those tables, plus the one company-disclosed rate-sensitivity even though its dollar size is small (kept for completeness because it is the only clean, filed per-unit sensitivity in the pool). The seven are: (1) unhedged commodity/input-cost inflation — the driver management names first every quarter for gross-margin moves [`03_margin-drivers.md` §8]; (2) Quest brand revenue growth, because Quest is 63.7% of nine-month FY2026 net sales and its bar sub-category is called out as "the single biggest driver of where SMPL's revenue goes next" [`02_revenue-drivers.md` §7]; (3) Atkins brand revenue decline, the second-largest brand and the one already down ~24% YoY on distribution losses [`02_revenue-drivers.md` §5]; (4) the September 2026 list-price increase, sized against management's own stated elasticity assumption [`03_margin-drivers.md` §5]; (5) retail customer concentration (Walmart + Amazon ≈ 49% of FY2025 net sales), rated High magnitude in the revenue driver table [`02_revenue-drivers.md` §4]; (6) tariffs on imported ingredients/packaging, flagged High in `business-model/10_external-dependency.md` §1 even though the company gives no dollar figure; and (7) the interest-rate sensitivity on the $250 million variable-rate term loan, the one item in this entire list with a company-disclosed exact coefficient [`business-model/10_external-dependency.md` §2, sourced to FY2025 10-K, Item 7A, p.49]. No brand-level margin is disclosed anywhere in the filings (ASC 280 single-segment reporting), so every brand-level EBITDA impact below is built on an explicitly labeled inference — the consolidated FY2025 Adjusted EBITDA margin (19.2%) applied as a flow-through proxy — not a filed number.

## 2. Sensitivity Table

Base metric for the dollar impacts below is **Adjusted EBITDA (company non-GAAP)**, FY2026 guidance midpoint of $222.5 million on FY2026 guided net sales midpoint of $1,350.0 million [`earnings/04_guidance-consensus.md` §2, sourced to Q3 FY26 earnings call, Jul 9 2026, CFO Bealer, and Estimates Report.xls Guidance tab, 2026-07-09 entry]. Brand-level dollar bases use the nine-month FY2026 brand mix (Quest 63.7% / Atkins 24.9% / OWYN 9.2% / International 2.2% of net sales [`02_revenue-drivers.md` §5]) applied to the FY2026 net sales guidance midpoint. All EBITDA-flow-through calculations use the FY2025 Adjusted EBITDA margin of 19.2% ($278.2M / $1,450.9M [`earnings/01_historical-financials.md` §4]) as the assumed incremental margin — this is an explicit, labeled inference because no brand-level margin is disclosed. EPS impact assumes ~90 million diluted shares [Q3 FY26 earnings call, prepared remarks] and a 25% effective tax rate [`earnings/04_guidance-consensus.md` §2], applied to the EBITDA delta as a proxy for the pretax income delta (D&A and below-EBITDA items held constant) — a simplification, not a full model.

| Variable | Base Case | Move Basis | Bull Case | EPS/EBITDA Impact (bull) | Bear Case | EPS/EBITDA Impact (bear) | Confidence | Evidence |
|---|---|---|---|---:|---|---:|---|---|
| Unhedged commodity / input-cost inflation (gross margin) | FY2026 guided GAAP gross margin decline of ~375bps vs FY2025's 36.24% | Historical observed range: annual gross-margin bps swings of −260 (FY22), −160 (FY23), +190 (FY24), −220 (FY25) [`earnings/01_historical-financials.md` §1] — a ±200bps swing sits inside that observed band | Input costs ease, gross margin comes in ~200bps better than the FY2026 guide implies | +$27.0M Adjusted EBITDA (+$0.23 EPS) | Input costs (protein complex, packaging) worsen further, gross margin comes in ~200bps worse than guided | −$27.0M Adjusted EBITDA (−$0.23 EPS) | Medium (historical range is observed; the bps-to-dollar conversion assumes the swing hits revenue 1:1 with no offsetting opex change — an inference) | FY2025 10-K, Item 7, p.41 ("higher commodity expenses" −220bps FY25); Q3 FY26 earnings call, Jul 9 2026, prepared remarks (FY26 guide "roughly 375 basis points" decline; zero commodity hedges, FY2025 10-K, Item 1A, p.22) |
| Quest brand revenue growth (63.7% of 9-mo FY26 net sales) | +1.1% YoY, FQ3 FY26 actual | Historical observed range: FY2025 annual Quest growth was +11.1%, versus +1.1% in the latest quarter — a ~10pp band already observed in the last 18 months | Bar sub-category re-accelerates toward the FY2025 run rate; Quest growth reaches +8% YoY | +$11.4M Adjusted EBITDA (+$0.10 EPS) | Bar softness deepens as the CEO himself flags for FY2027 ("I would expect bars to be a little bit weaker" [Q3 FY26 call, Q&A]); Quest growth falls to −5% YoY | −$10.1M Adjusted EBITDA (−$0.08 EPS) | Low (revenue range is evidence-based; EBITDA flow-through assumes the consolidated margin applies to Quest specifically — no brand P&L exists to confirm this) | Q3 FY26 earnings call, Jul 9 2026, CEO prepared remarks and Q&A; `02_revenue-drivers.md` §5, §7; FY2025 10-K, Note 15 (Quest = 59.5% of FY2025 net sales) |
| Atkins brand revenue decline (24.9% of 9-mo FY26 net sales) | −24.6% YoY, FQ3 FY26 actual (vs −23.4% FQ2 FY26) | Historical observed range: the last two quarters have run −23.4% to −24.6%; management states comparisons "become more favorable as we lap household and distribution losses" starting FQ4 FY26/FY27 | Decline decelerates to −10% YoY as tough comps lap | +$9.0M Adjusted EBITDA (+$0.08 EPS) | Distribution losses continue or worsen; decline deepens to −30% YoY | −$3.9M Adjusted EBITDA (−$0.03 EPS) | Low (same brand-margin caveat as Quest above; the specific bull/bear percentages are this agent's inference from management's qualitative "easier comps" language, not a filed range) | Q3 FY26 earnings call, Jul 9 2026, CEO prepared remarks; FY2025 10-K, Item 1A, p.24 (Walmart cut Atkins assortment); `02_revenue-drivers.md` §5 |
| September 2026 list-price increase, net of volume elasticity (≈90% of portfolio) | A high-single-digit (assumed 8%) price increase effective September 2026, against management's own stated elasticity assumption of "1 or higher" [Q3 FY26 call, Q&A] — i.e., management's own base case is roughly revenue-neutral-to-negative | Company-disclosed direction (a high-single-digit increase, elasticity language), sized here by this agent at three elasticity points (0.7 / 1.0 / 1.3) applied to an assumed 8% list-price increase — a labeled two-variable inference, not a filed sensitivity | Elasticity comes in lower than management fears (0.7×), net revenue on the affected base rises ~2% | +$7.7M Adjusted EBITDA (+$0.06 EPS) | Elasticity comes in above management's own "1 or higher" language (1.3×), net revenue on the affected base falls ~3% | −$12.8M Adjusted EBITDA (−$0.11 EPS) | Low (price % and elasticity are both this agent's point assumptions inside a qualitative company range — no filed price-elasticity table exists) | Q3 FY26 earnings call, Jul 9 2026, prepared remarks and Q&A ("high single digit price increase across most of our portfolio," "elasticities to be at 1 or higher... there's going to be a volume impact") |
| Retail customer concentration — Walmart (~31%) + Amazon (~18%) of FY2025 net sales | ≈49% of FY2025 net sales ($710.9M) runs through two at-will retail relationships with "no recurring or minimum purchase amounts" [FY2025 10-K, Item 1A] | Historical precedent: Walmart already cut Atkins's shelf assortment once during FY2025 — the move-size below (±10%) mirrors that kind of single-retailer assortment decision applied to the combined Walmart+Amazon revenue base | Walmart/Amazon shelf space or ordering expands 10% (e.g., regained Atkins distribution, new item launches) | +$13.6M Adjusted EBITDA (+$0.11 EPS) | A further 10% cut in Walmart/Amazon-sourced net sales (an assortment or ordering-pattern change at either retailer) | −$13.6M Adjusted EBITDA (−$0.11 EPS) | Low (no company-disclosed customer-level sensitivity exists; the ±10% move size and the consolidated-margin flow-through are both this agent's inference) | FY2025 10-K, Item 1A, p.24 (Walmart ~31%, Amazon ~18% of FY2025 net sales; Walmart reduced Atkins assortment in FY2025; no minimum-purchase commitments); `business-model/05_customer-geography.md` §3 |
| Tariffs on imported ingredients / packaging (EU, Canada, Mexico, China) | Company states tariffs "will cause inflationary pressures and higher costs" during FY2026, with no dollar or percentage figure disclosed [FY2025 10-K, p.22–23] | No move basis is quotable — this is a genuinely undisclosed input | Trade-policy relief (tariff reduction/removal) on affected imports | Impact: not quantifiable — the company gives no cost baseline, no affected-import dollar amount, and no offset percentage | Tariff rates rise further or expand to additional countries/categories | Impact: not quantifiable — same reason | N/A (no disclosed sensitivity exists to rate a confidence against) | FY2025 10-K, p.22–23 (tariff risk-factor language, "outside of our control," mitigation "may not fully offset"); `business-model/10_external-dependency.md` §1 |
| Interest rate on the $250.0M variable-rate (SOFR-based) term loan | No interest-rate swaps or caps in place as of Aug 30, 2025 [FY2025 10-K, Item 7A, p.49] | Company-disclosed exact sensitivity | Rates fall 1 percentage point | +$2.5M pretax income (+$0.02 EPS) | Rates rise 1 percentage point | −$2.5M pretax income (−$0.02 EPS) | High (company-disclosed, exact figure) | FY2025 10-K, Item 7A, p.49: "a hypothetical 100 basis point increase...would increase our annual interest expense by approximately $2.5 million" |

## 3. Sensitivity Ranking

Ranked by average of the absolute bull and bear Adjusted EBITDA impact (interest rate and tariffs are shown for completeness but ranked separately — interest rate moves pretax income/EPS below the EBITDA line, not EBITDA itself, and tariffs carry no quantifiable figure at all).

| Rank | Variable | Absolute Impact (avg of bull + bear) | Direction of Current Trend |
|---:|---|---:|---|
| 1 | Unhedged commodity / input-cost inflation | $27.0M Adjusted EBITDA | Deteriorating — FY2026 guide already bakes in a further ~375bps GAAP gross-margin decline |
| 2 | Retail customer concentration (Walmart + Amazon) | $13.6M Adjusted EBITDA | Deteriorating for Atkins specifically (Walmart already cut assortment in FY2025); Stable/Unknown for the relationship overall |
| 3 | Quest brand revenue growth | $10.7M Adjusted EBITDA | Improving on household penetration (+120bps y/y) but the largest sub-category (bars) is currently declining (~−5% consumption) |
| 4 | September 2026 price increase, net of elasticity | $10.2M Adjusted EBITDA | Not yet in effect — the single largest unresolved swing factor for FY2027 |
| 5 | Atkins brand revenue decline | $6.4M Adjusted EBITDA | Deteriorating, but management states comparisons ease starting FQ4 FY26/FY27 |
| 6 | Interest rate ($250M term loan) | $2.5M pretax income (not EBITDA) | Neutral — net debt has risen from $206.0M to $324.6M on buybacks [`earnings/01_historical-financials.md` §2, §6], which raises exposure to this same 1%-rate coefficient going forward even though the rate itself has not moved |
| — | Tariffs on imported ingredients/packaging | Not quantifiable | Deteriorating — named as an active FY2026 cost pressure with no disclosed offset |

## 4. The Single Highest-Sensitivity Variable

**Unhedged commodity and input-cost inflation is the single variable that would move earnings the most, at an estimated ±$27.0 million of Adjusted EBITDA (about 12% of the FY2026 guidance midpoint) for a swing inside the company's own three-year observed range of annual gross-margin moves.** It is external, not company-controlled — SMPL has "zero commodity hedges" for any core ingredient or packaging material [FY2025 10-K, Item 1A, p.22] — and its current direction is adverse: FY2026 guidance already bakes in a further ~375 basis-point GAAP gross-margin decline on top of FY2025's 220bps decline, driven by "slightly higher input costs, especially proteins" [Q3 FY26 earnings call, Jul 9 2026, prepared remarks]. For this to swing to the worse (bear) case, input costs would simply need to keep rising at or above the current pace for another year before the lone offsetting lever — the September 2026 price increase — has had time to fully land and hold, and that lever itself carries its own volume-loss risk (see §6 below).

## 5. Interaction Effects

Two pairs of these variables move together, not independently. First, **tariffs and commodity input costs are the same channel wearing two hats**: both raise the landed cost of the same imported ingredients and packaging (protein, packaging film, cartons) named in the 10-K's risk factors [FY2025 10-K, p.11, p.22–23] — a trade-policy shock and a commodity-price shock would compound rather than offset, and the company has no hedge against either. Second, **the September 2026 price increase and volume elasticity are mechanically linked by construction**, not merely correlated — management's own words make the trade-off explicit: the price increase exists specifically "to offset input inflation," and the same call warns "there's going to be a volume impact to our business" from it [Q3 FY26 earnings call, Jul 9 2026, prepared remarks and Q&A]. A worse commodity outcome (Rank 1) therefore raises the odds that management pushes the price increase harder, which raises the odds of landing in the elasticity bear case (Rank 4) — the two risks are not independent draws.

## 6. Non-Linear Or Asymmetric Risks

Three asymmetries stand out. First, **the pass-through lag is a genuine timing asymmetry, not a symmetric risk**: commodity costs hit the P&L immediately while price increases are negotiated list actions that took roughly twelve months to reach the market this cycle (input-cost inflation began showing up in FY2025's 220bps gross-margin decline; the offsetting price increase does not take effect until September 2026) [`03_margin-drivers.md` §3]. A full cycle of adverse commodity moves is felt well before any offset arrives. Second, **the price increase itself is asymmetric by management's own admission**: management explicitly frames elasticity as "1 or higher," meaning their own base case has volume losses matching or exceeding the price gain — the mechanism built to fix the margin problem is stated by the company to carry a real chance of making net revenue worse, not better. Third, **operating deleverage compounds a revenue miss**: net sales have declined YoY for four consecutive quarters while G&A and D&A are largely fixed in dollar terms [`earnings/01_historical-financials.md` §3, §6; `03_margin-drivers.md` §5 ("Volume decline / fixed-cost under-absorption")] — a further volume decline (e.g., in the Quest or Atkins bear cases above) spreads the same fixed cost base over fewer dollars of revenue, so the EBITDA-margin hit from a given revenue decline is larger than the EBITDA-margin gain from an equivalent revenue increase.

## 7. Earnings Volatility Score

**68/100** (inverted — higher = worse). Reason: five of the seven variables tested carry a plausible ±$6–27 million Adjusted EBITDA swing (roughly 3–12% of the FY2026 guidance midpoint each) on top of a base that management itself calls "the early stages of our turnaround" [`03_margin-drivers.md` §3] and that Street analysts are still cutting — FY2027 revenue, EBITDA, and EPS estimates all show net-negative revision breadth over the last three months (−6, −4, and −5 respectively) [`earnings/04_guidance-consensus.md` §5]. None of the four largest-magnitude variables (commodity inflation, retail concentration, Quest, the price increase) is hedged, and two of them (commodity inflation and the price/elasticity trade-off) move together rather than independently (§5), which raises the effective combined swing above what treating them as independent would suggest. This places SMPL in the "High volatility — multiple variables with large impact" band (61–80), not the top band, because FX and interest-rate exposure are both genuinely small (§2) and seasonality is mild (`earnings/01_historical-financials.md` §5), which caps the score below 80.



---

## earnings / 08_earnings-red-flags.md

_Source: `08_earnings-red-flags.md`_

# Earnings Red Flags — SMPL

All eight upstream earnings outputs (00 through 07) are present and were read in full. Business-model cross-module outputs are available at `analyses/SMPL_2026-08-06/business-model/` and were used, specifically `12_red-flags-sweep.md`, `11_capital-allocation-governance.md`, `03_segment-map.md`, `06_value-chain.md`, and `10_external-dependency.md`. No upstream output is missing; this scan proceeds at full confidence on data completeness (00's own sufficiency verdict is "Sufficient"), though several individual disclosure gaps are flagged below in their own right.

## 1. Upstream Evidence Map

### Bullish Evidence

| Source Agent | Claim | Evidence | Confidence |
|---|---|---|---|
| 04_guidance-consensus | FQ4 FY26 and FY26 guidance sit within 0.5% of Street consensus on net sales and Adjusted EBITDA — a genuinely matched bar, not sandbagged | [04_guidance-consensus output, §3] | High |
| 04_guidance-consensus / 05_beat-miss-setup | Three consecutive quarterly beats on revenue and EPS, widening each time (+0.1%→+0.3%→+7.3% revenue; +8.1%→+13.6%→+19.5% EPS) | [04_guidance-consensus output, §6] | High |
| 06_earnings-quality | Cash conversion has not broken down: GAAP CFO/EBITDA ran 76–100% FY2023–2025; Adjusted-EBITDA-based conversion stayed at 62–80% through the Latest TTM | [06_earnings-quality output, §2] | High |
| business-model 11_capital-allocation-governance | Conservative leverage (0.5x net debt/Adjusted EBITDA at FY2025-end) with wide covenant headroom (max 6.00x, in compliance) | [business-model/11_capital-allocation-governance, §1] | High |
| business-model 11_capital-allocation-governance | Board chair (Kilts) and an independent director (Daley) bought shares on the open market near the FY2026 lows | [business-model/11_capital-allocation-governance, §1] | Medium |
| 02_revenue-drivers | Quest household penetration at a multi-year high (20.5%, +120bps y/y) and still rising; Quest is 63.7% of nine-month FY2026 net sales | [02_revenue-drivers output, §3–4] | High |
| 03_margin-drivers | FQ4 FY26 gross margin guided as "our strongest of the year," and FQ3's productivity-driven margin already beat the company's own internal forecast | [03_margin-drivers output, §5] | Medium |

### Bearish Evidence

| Source Agent | Claim | Evidence | Confidence |
|---|---|---|---|
| 01_historical-financials | Four consecutive quarters of YoY revenue decline (−0.3% to −9.4%); TTM revenue −4.5% to $1,392.2M | [01_historical-financials output, §3, §6] | High |
| 01_historical-financials / 03_margin-drivers | Gross margin fell from 40.7% (FY21) to ~32.5% (latest quarter); the company's own Adjusted EBITDA margin fell from 20.2% (FY24) to 16.9% (Latest TTM) — a genuine ~330bps deterioration, not an impairment artifact | [01_historical-financials output, §2; 03_margin-drivers output, §3] | High |
| 06_earnings-quality | $391.9M cumulative goodwill/brand impairment across three of the last four quarters, excluded from Adjusted EBITDA every time | [06_earnings-quality output, §5, §9–10] | High |
| 04_guidance-consensus | FY2027 Street estimates falling every 30/60/90-day window; net revision breadth −4 to −6 across revenue/EBITDA/EPS over the last three months | [04_guidance-consensus output, §4–5] | High |
| 02_revenue-drivers | Atkins retail takeaway down 23.4%–24.6% two quarters running; household penetration −220bps y/y; Walmart already cut Atkins's shelf assortment | [02_revenue-drivers output, §5] | High |
| business-model 12_red-flags-sweep | CEO, principal accounting officer, and organizational structure all changed inside a 2–3 quarter window coinciding exactly with the impairment quarters; ~$25M restructuring cost | [business-model/12_red-flags-sweep, §2, §4] | Medium |
| 01_historical-financials | Net debt rose from $206.0M (FY2025-end) to $324.6M (FQ3 FY26) on $242.3M of buybacks funded while Adjusted EBITDA was falling | [01_historical-financials output, §6] | High |
| 03_margin-drivers / 07_earnings-sensitivity | Zero commodity hedges against the single highest-sensitivity variable (unhedged input-cost inflation, ~$27M / 12% of the FY2026 EBITDA guide) | [03_margin-drivers output, §8; 07_earnings-sensitivity output, §4] | High |

### Missing Evidence

| What Is Missing | Which Agent Flagged It | Impact On Setup |
|---|---|---|
| Brand-level P&L / margin / EBITDA disclosure (SMPL discloses one GAAP reportable segment under ASC 280) | 02_revenue-drivers §1; 03_margin-drivers §1 | Caps confidence in every brand-level driver and sensitivity figure; all brand-level EBITDA flow-through numbers are labeled inference, not filed data |
| Maintenance vs growth capex split | 06_earnings-quality §1 | Cannot confirm whether reported free cash flow (the cash left after running the business and paying for equipment) understates the true recurring figure now that capex has roughly quadrupled |
| Quantified tariff cost impact | 07_earnings-sensitivity §2 | A named FY2026 cost headwind carries no dollar sizing anywhere in the pool |
| Formal company volume/price/mix walk for any period | 02_revenue-drivers §6 | The growth decomposition used in this module relies on an agent-computed brand-revenue proxy, not a number the company itself discloses |
| Licensed alt-data consumption panel | 05_beat-miss-setup §10; 00_earnings-data-triage §1A | No early-warning signal exists for a consumption deceleration ahead of the reported print |

### Contradictions Between Agents

| Agent A | Agent A Says | Agent B | Agent B Says | Reconcilable? (Y/N) | Which Is More Credible |
|---|---|---|---|---|---|
| 01_historical-financials | CFO (cash from operations) trend is "Deteriorating" — TTM CFO down 19.0% year-over-year in dollar terms | 06_earnings-quality | Cash conversion "itself has not broken down" — the CFO/EBITDA ratio has stayed above the 50% breakdown trigger on every basis tested | Y | Both — they are measuring different things (absolute CFO dollars vs the CFO/EBITDA ratio), not disagreeing on the underlying numbers. The synthesis should carry both framings together: cash generation is genuinely shrinking in dollar terms even though the conversion ratio has not collapsed |
| business-model 11_capital-allocation-governance | Classifies the OWYN write-down and leadership-turnover pattern as "Capital allocation concerns," explicitly stating "this is not a governance red flags case" | business-model 12_red-flags-sweep | Adds the CEO severance economics and the CFO/Principal-Accounting-Officer dual-hat, and argues "fully disclosed is not the same as governance-neutral" | Y | 12_red-flags-sweep is more complete (it adds facts 11 did not quantify) without actually reversing 11's classification — both stop short of a hard governance disqualifier, consistent with the business-model module's own `01_disqualifier-scan` finding of no hard trigger. This is a difference in emphasis, not a factual conflict, but the earnings synthesis should weight the fuller picture (11 + 12 together) when it reads the leadership-transition risk, not 11 alone |

## 2. Red-Flag Scan — Category By Category

### 2.1 Data Completeness

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| No brand-level P&L, margin, or EBITDA disclosure (one GAAP reportable segment under ASC 280) | Triggered | High | High | [02_revenue-drivers output, §1; 03_margin-drivers output, §1] | Caps confidence in every brand-level driver and sensitivity claim; 07_earnings-sensitivity itself labels brand-level EBITDA flow-through figures "Low confidence" |
| No maintenance vs growth capex split disclosed | Triggered | Medium | High | [06_earnings-quality output, §1] | Free cash flow may understate or overstate the true recurring figure now that capex has roughly quadrupled with no disclosed reason |
| No formal company-disclosed volume/price/mix walk for any period | Triggered | Medium | High | [02_revenue-drivers output, §6] | Growth decomposition relies on an agent-computed brand-revenue proxy rather than a filed number; the FY2025 9.0% net-sales growth vs 5.5% consumption-growth gap cannot be cleanly attributed |
| Tariff cost impact not quantified by the company | Triggered | Medium | High | [07_earnings-sensitivity output, §2] | A named, active FY2026 cost headwind carries zero disclosed dollar sizing, so its size relative to the guided ~375bps gross-margin decline cannot be isolated |
| Current market price not directly confirmed in this module's triage pass | Unclear | Low | Unknown | [00_earnings-data-triage, §3, §5] | Flagged as a watch item for the master synthesizer (agent 99), not a gap that changes the earnings-setup read itself |

### 2.2 Historical Trend

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| Revenue growth inflected from five years of gains to four consecutive quarters of YoY decline | Triggered | High | High | [01_historical-financials output, §3, §6] | Directly contradicts any framing of the setup as "accelerating"; the last five quarters are the relevant trend, not the five-year growth history |
| GAAP EBITDA/EBIT swung deeply negative on a non-cash impairment while the company's own clean KPI (Adjusted EBITDA margin) also fell a genuine ~330bps on the Latest TTM | Triggered | High | High | [01_historical-financials output, §2] | Confirms the margin compression is a real operating trend, not just a one-off accounting artifact of the write-down |
| QoQ revenue improvement (FQ3 +9.5%) sits alongside continued YoY deterioration (−6.3%) in the same quarter | Unclear | Medium | Medium | [01_historical-financials output, §3] | Risk that a reader anchors on the positive quarter-over-quarter move rather than the year-over-year read the historical-financials agent itself calls more reliable |
| One-off items are now the third occurrence in four quarters ($391.9M cumulative impairment) | Triggered | High | High | [06_earnings-quality output, §5, §9] | Repetition undermines the "one-off" label management continues to use in its non-GAAP reconciliation |

### 2.3 Revenue

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| Company retail takeaway declined 6.7% while the underlying "purposeful nutrition" category grew 10% in the same 13-week period | Triggered | High | High | [02_revenue-drivers output, §3] | A clear share loss (~17 percentage points in one quarter), not merely a soft category — a stronger negative signal than a simple demand-weakness read |
| Two-customer concentration: Walmart (~31%) + Amazon (~18%) ≈ 49% of FY2025 net sales, both at-will with no minimum-purchase commitments | Triggered | High | Medium | [02_revenue-drivers output, §4; FY2025 10-K, Item 1A] | A single retailer assortment decision — as already happened once to Atkins — can move total revenue materially with no contractual protection |
| Deliberate FQ4 FY26 under-shipment relative to consumption (channel/inventory reset) | Unclear | Medium | Medium | [02_revenue-drivers output, §3; 05_beat-miss-setup output, §3] | Could be a clean, one-time timing reset as management describes, or could mask a deeper consumption deceleration; the two cannot be distinguished from filings alone |
| Atkins in structural decline (household penetration −220bps y/y, retail takeaway −23.4% to −24.6% two quarters running) tied to shelf-space loss and admitted marketing under-investment | Triggered | High | High | [02_revenue-drivers output, §5] | Second-largest brand (24.9% of nine-month FY2026 net sales) in a self-inflicted decline per management's own words, not yet stabilized |
| FY2025 net sales growth (+9.0%) vs disclosed brand consumption growth (+5.5%) leaves an unreconciled ~3.5pp gap, partly a calendar/M&A-timing artifact | Triggered | Medium | Medium | [02_revenue-drivers output, §6] | Already correctly excluded from any "organic growth" claim by 02_revenue-drivers, but the underlying gap is itself a data-quality flag for anyone using headline net-sales growth as an organic-demand proxy |

### 2.4 Margins

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| Zero commodity hedges against the cost line management itself names first every quarter for gross-margin moves | Triggered | High | High | [03_margin-drivers output, §8; FY2025 10-K, Item 1A] | No structural buffer against the single highest-sensitivity variable in the entire report (see §2.8 below) |
| Pass-through pricing lag (~12 months between cost inflation showing up and the offsetting price action reaching the market) | Triggered | Medium | High | [03_margin-drivers output, §3] | A full cycle of adverse cost moves is felt well before any price offset arrives — a timing asymmetry, not a symmetric risk |
| FY2025 marketing-spend cut (−6.7%) is named by the CEO as a direct cause of Atkins's household-penetration decline, and is now reversing (S&M +15.9% YoY in FQ3 FY26) | Triggered | Medium | High | [03_margin-drivers output, §2] | Last year's apparent SG&A "discipline" was not a sustainable margin gain — it is now a margin cost being paid back, and the S&M line is a genuine headwind again |
| Operating deleverage: a largely fixed G&A/D&A base spread over four straight quarters of declining revenue | Triggered | Medium | High | [03_margin-drivers output, §5; 07_earnings-sensitivity output, §6] | A given revenue decline now costs more margin than an equivalent revenue gain would add — the downside is structurally larger than the upside |
| Capex roughly quadrupled (FY2021–24 average ~$7M to $20.5M FY25, $28.1M TTM) while D&A has stayed flat — a coming depreciation step-up not yet in the P&L | Triggered | Medium | High | [03_margin-drivers output, §9; 06_earnings-quality output, §8] | A forward margin headwind that is invisible in the current-period numbers |

### 2.5 Guidance / Consensus

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| FY2027 estimate revisions falling every 30/60/90-day window; net revision breadth −4 to −6 across revenue/EBITDA/EPS, unresolved | Triggered | High | High | [04_guidance-consensus output, §4–5] | The Street has not finished de-risking the out-year model even though the near-term bar looks fair — the medium-term setup is still being marked down |
| Company beat FQ3 FY26 revenue/EPS by the widest margin of the streak (+7.3%/+19.5%), then guided FQ4 to a steeper YoY decline (−13% to −10%) than the just-reported quarter's actual decline (−6.3%) | Triggered | High | High | [04_guidance-consensus output, §6; 01_historical-financials output, §3] | A beat-and-lower-guide pattern that could be misread as "accelerating" if only the trailing print is weighted, not the forward guide |
| FQ3 FY26 revenue/EPS beat coincided with a GAAP gross-margin MISS versus both the prior guided range and consensus (31.6% actual vs 36.40–36.60% guided, 33.29% consensus) | Triggered | High | High | [04_guidance-consensus output, §6] | Quality-of-beat concern: the headline beat and the leading-indicator margin line moved in opposite directions in the same quarter |
| Capex guidance sourcing conflict: verbatim transcript ($25M–$30M) vs same-dated Capital IQ Guidance tab ($20M–$25M), unresolved | Triggered | Medium | Medium | [04_guidance-consensus output, §2] | A $5M discrepancy on both ends of the range that has not been reconciled against a company press release |
| EPS beat pattern partly attributable to a falling share count (buybacks) and a favorable one-off tax benefit (Canadian subsidiary wind-down), not solely operating outperformance | Triggered | Medium | Medium | [06_earnings-quality output, §5, §8] | Below-the-line items flatter the reported EPS beat magnitude relative to core operating performance |

### 2.6 Beat / Miss Setup

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| Beat streak is short (three quarters) and was already reset once before (FQ4 FY25 was an EPS miss) | Triggered | Medium | Medium | [05_beat-miss-setup output, §7] | Limited statistical power — a single miss resets the "recent conservative guide-setting" read to a much weaker three-out-of-five pattern |
| In-line FQ4 print risk is masked by a weak initial FY27 guide — the forward market reaction is set by the FY27 framing, not the trailing print | Triggered | High | Medium | [05_beat-miss-setup output, §5] | A clean FQ4 beat would not resolve the setup if the FY27 initial guide confirms the Street's already-negative revision trend |
| The miss case (unhedged, worsening commodity inflation) needs only one uncontrolled variable to move against the company, while the fuller beat case depends on several sub-category and channel-timing developments holding together at once | Unclear | Medium | Medium | [05_beat-miss-setup output, §2–3; 07_earnings-sensitivity output, §4] | Not a stark CLAUDE.md §10 conjunction violation, but the miss path is structurally simpler than the beat path |
| No licensed alt-data consumption panel exists to catch a consumption deceleration ahead of the reported number | Triggered | Medium | Medium | [05_beat-miss-setup output, §10; 00_earnings-data-triage output, §1A] | The engine's own pre-mortem names this exact blind spot as the way this setup would fail without warning |

### 2.7 Earnings Quality / Accounting

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| Four of five applicable accrual-quality flags triggered (`RF-EQ-001`): revenue outgrowing CFO, receivables/inventory outgrowing revenue/COGS, capitalized costs rising | Triggered | High | High | [06_earnings-quality output, §6] | A textbook accrual-divergence pattern — earnings growth in some periods has not been matched by cash and working-capital discipline |
| Adjusted EBITDA has now excluded a $391.9M cumulative impairment across three of the last four quarters (56.3% of FY2025 GAAP EBITDA) | Triggered | High | High | [06_earnings-quality output, §4, §9–10] | The "clean" number investors are pointed to structurally cannot show this as anything but noise, despite it being a real, cash-relevant loss on prior acquisitions |
| Restructuring / integration costs recur every period despite being labeled non-recurring in the non-GAAP reconciliation | Triggered | High | High | [06_earnings-quality output, §4, §8] | Integration expense has recurred every period for two-plus years since the OWYN deal, and a separate restructuring charge reappeared in FY2026 |
| Adjusted-EBITDA-based cash conversion weakening (80% → 64% → 63%, FY2024 to Latest TTM) even though it has not breached the "breakdown" trigger | Triggered | Medium | Medium | [06_earnings-quality output, §2] | A genuine deterioration, correctly not overstated as a breakdown by the earnings-quality agent, but a real trend the synthesis should not ignore |
| Effective tax rate reduced by a one-off benefit (wind-down of a legacy Canadian subsidiary) in the same period used for the EPS beat | Triggered | Medium | Medium | [06_earnings-quality output, §5, §8] | Flatters the near-term reported EPS and effective tax rate relative to a clean operating read |
| Inventory days up 9.1% cumulatively over two years against a demand backdrop of four straight quarters of YoY revenue decline | Triggered | Medium | High | [06_earnings-quality output, §3] | Risk that inventory is building against softening sell-through rather than growth |

### 2.8 Sensitivity / External Variables

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| Unhedged commodity/input-cost inflation is the single highest-sensitivity variable (±$27M Adjusted EBITDA, ~12% of the FY2026 guidance midpoint) and is currently moving the wrong way | Triggered | High | High | [07_earnings-sensitivity output, §2, §4] | External, uncontrolled, and the FY2026 guide already bakes in further deterioration (a further ~375bps GAAP gross-margin decline) |
| Tariffs and commodity inflation are not independent — both raise the landed cost of the same imported inputs, compounding rather than offsetting, with no hedge against either | Triggered | High | Medium | [07_earnings-sensitivity output, §5] | Treating these as two separate, additive-only risks understates the combined downside if both move adversely together |
| The September 2026 price increase and its offsetting volume elasticity are mechanically linked, not independent — a worse commodity outcome raises the odds management leans harder on price, which raises the odds of landing in the volume-loss bear case | Triggered | High | Medium | [07_earnings-sensitivity output, §5] | The proposed fix for the #1 risk above carries its own, correlated downside rather than being a clean offset |
| Operating deleverage makes the downside asymmetric — a revenue miss costs more margin than an equivalent revenue beat gains | Triggered | Medium | High | [07_earnings-sensitivity output, §6] | A non-linear risk already identified and qualitatively sized by the sensitivity agent |
| Brand-level sensitivity dollar figures rely on a consolidated-margin flow-through assumption, not a disclosed brand P&L | Triggered | Medium | High | [07_earnings-sensitivity output, §1–2] | Labeled "Low confidence" by the sensitivity agent itself — a real limitation on the precision of any brand-specific dollar estimate used elsewhere in the module |

### 2.9 Source Conflicts

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| FY2026 capex guidance: verbatim transcript ($25M–$30M) vs Capital IQ Guidance tab, same-dated entry ($20M–$25M) | Triggered | Medium | Medium | [04_guidance-consensus output, §2] | An unresolved $5M discrepancy on both ends of the range that the module could not settle from the pool alone |
| 01_historical-financials calls the CFO trend "Deteriorating" (dollar terms) while 06_earnings-quality states cash conversion "has not broken down" (ratio terms) | Unclear | Low | Low | [01_historical-financials output, §1–2; 06_earnings-quality output, §2] | Reconcilable — both are correct on their own metric, but a reader consulting either report alone could draw an inconsistent impression of cash health |
| business-model 11_capital-allocation-governance classifies the leadership/OWYN pattern as "Capital allocation concerns" while 12_red-flags-sweep adds the CEO severance economics and the CFO/Principal-Accounting-Officer dual-hat and argues disclosure is not the same as governance-neutrality | Unclear | Medium | Medium | [business-model/11_capital-allocation-governance, §2–4; business-model/12_red-flags-sweep, §2–3] | A difference in emphasis between two business-model agents on the same underlying facts; the earnings synthesis should weight the fuller (11+12) picture when assessing leadership-transition risk |

### 2.10 Narrative / Framing

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| A three-quarter widening beat streak could be narrated as "earnings accelerating," but the underlying trajectory is four consecutive quarters of YoY revenue decline, structurally compressing margins, and a guide implying an even steeper decline next quarter | Triggered | High | High | [01_historical-financials output, §3, §6; 04_guidance-consensus output, §6; 05_beat-miss-setup output, §8] | The single largest framing risk in this report — a synthesis that leads with the beat streak without the trend underneath would misstate the setup |
| Management explicitly frames FY2026 as "the early stages of our turnaround" with a returning former CEO — a turnaround narrative not yet backed by two to three years of proven delivery (CLAUDE.md §24 Filter 2) | Triggered | High | Medium | [03_margin-drivers output, §3; business-model/12_red-flags-sweep, §1] | The base rate for turnaround success is low; one quarter of productivity-driven margin outperformance is not proof of an inflection, and should not lift conviction on its own |
| The setup's single biggest sensitivity driver (unhedged commodity inflation, compounded by tariffs) is macro/commodity/policy-driven, not company-specific | Triggered | Medium | High | [07_earnings-sensitivity output, §2, §4–5] | The earnings synthesis should classify this thesis honestly per CLAUDE.md §14 rather than as a pure company-specific execution story |
| A near-term "balanced" beat/miss setup (FQ4 FY26) risks being conflated with the 12-month setup, which hinges on the unresolved September 2026 price increase / elasticity trade-off and still-falling FY27 Street estimates | Triggered | High | Medium | [05_beat-miss-setup output, §8–9; 04_guidance-consensus output, §4–5] | The quarter that actually determines the thesis (FQ1 FY27) is two quarters away and carries no company guidance yet |
| Bull case relies mostly on cited numbers rather than adjectives | Not Triggered | — | — | [Consistent across 02, 03, 04, 05, 07 output] | Upstream reports cite specific figures throughout; this specific trap is not present in this module's own work |

## 3. Red-Flag Summary Table

| # | Category | Red Flag | Status | Severity | Probability | One-Line Impact |
|---:|---|---|---|---|---|---|
| 1 | Data Completeness | No brand-level P&L/margin/EBITDA disclosure | Triggered | High | High | Every brand-level number in this module is an inference, not a filed figure |
| 2 | Historical Trend | Revenue growth inflected negative — 4 straight quarters of YoY decline | Triggered | High | High | Contradicts an "accelerating" framing outright |
| 3 | Historical Trend | GAAP collapse + genuine ~330bps Adjusted EBITDA margin decline (not just the impairment) | Triggered | High | High | Margin compression is real, not an accounting artifact |
| 4 | Historical Trend | Third impairment in four quarters ($391.9M cumulative) | Triggered | High | High | Undermines the "one-off" label management still uses |
| 5 | Revenue | Company takeaway −6.7% while category grew +10% (share loss) | Triggered | High | High | A share-loss story, not just a soft market |
| 6 | Revenue | Walmart + Amazon ≈49% of net sales, at-will, no minimums | Triggered | High | Medium | A single retailer decision can move total revenue materially |
| 7 | Revenue | Atkins structural decline (−220bps penetration, −23–25% takeaway) | Triggered | High | High | Second-largest brand still deteriorating, self-inflicted per management |
| 8 | Margins | Zero commodity hedges on the top sensitivity driver | Triggered | High | High | No structural buffer against the biggest single swing factor |
| 9 | Guidance/Consensus | FY2027 estimates still falling every 30/60/90 days, breadth −4 to −6 | Triggered | High | High | Street has not finished de-risking the out-year model |
| 10 | Guidance/Consensus | Biggest-ever beat immediately followed by a steeper decline guide | Triggered | High | High | Beat-and-lower-guide pattern risks being misread as acceleration |
| 11 | Guidance/Consensus | Revenue/EPS beat coincided with a GAAP gross-margin miss | Triggered | High | High | Quality-of-beat concern — the leading-indicator margin line missed the same quarter |
| 12 | Beat/Miss Setup | In-line FQ4 print risk masked by a weak initial FY27 guide | Triggered | High | Medium | The forward reaction is set by FY27 framing, not the trailing print |
| 13 | Earnings Quality | 4 of 5 accrual-quality flags triggered (`RF-EQ-001`) | Triggered | High | High | Textbook accrual-divergence pattern between earnings and cash/working capital |
| 14 | Earnings Quality | Adjusted EBITDA excludes a $391.9M cumulative impairment | Triggered | High | High | The "clean" KPI structurally hides a real, recurring value-destruction pattern |
| 15 | Earnings Quality | Restructuring/integration costs recur every period despite "non-recurring" label | Triggered | High | High | Adjustments meant to be one-off have become structural |
| 16 | Sensitivity | Unhedged commodity inflation is the #1 sensitivity variable, moving the wrong way | Triggered | High | High | ~$27M / ~12% of FY2026 EBITDA guide swing, external and uncontrolled |
| 17 | Sensitivity | Tariffs and commodity inflation compound rather than offset | Triggered | High | Medium | Combined downside larger than treating each risk separately |
| 18 | Sensitivity | Price increase and elasticity are mechanically linked, not independent | Triggered | High | Medium | The fix for the #1 risk carries its own correlated downside |
| 19 | Narrative/Framing | Beat streak could be misread as "accelerating" against a decelerating base | Triggered | High | High | The single largest framing risk in this report |
| 20 | Narrative/Framing | Turnaround narrative not yet backed by proven multi-year delivery | Triggered | High | Medium | Base rate for turnaround success is low; one quarter is not proof |
| 21 | Narrative/Framing | 12-month setup risks conflation with the "balanced" near-term FQ4 read | Triggered | High | Medium | The quarter that determines the thesis is 2 quarters away with no guide yet |
| 22 | Data Completeness | No maintenance vs growth capex split | Triggered | Medium | High | Cannot confirm true recurring free cash flow as capex has quadrupled |
| 23 | Data Completeness | No formal volume/price/mix walk disclosed | Triggered | Medium | High | Growth decomposition relies on an agent-built proxy, not a filed number |
| 24 | Data Completeness | Tariff cost impact not quantified | Triggered | Medium | High | A named FY2026 headwind with zero dollar sizing |
| 25 | Revenue | FQ4 under-shipment vs consumption — reset or masked deceleration? | Unclear | Medium | Medium | Cannot be distinguished from filings alone |
| 26 | Revenue | 9.0% net-sales growth vs 5.5% consumption growth gap (FY2025) | Triggered | Medium | Medium | Headline net-sales growth is not a clean organic-demand proxy |
| 27 | Margins | ~12-month pass-through lag between cost inflation and price offset | Triggered | Medium | High | A full cycle of cost inflation is felt before any price relief arrives |
| 28 | Margins | FY2025 marketing cut (linked by CEO to Atkins decline) now reversing | Triggered | Medium | High | Last year's apparent SG&A discipline is being paid back as a margin cost |
| 29 | Margins | Operating deleverage on a fixed-cost base against declining revenue | Triggered | Medium | High | Downside margin impact of a revenue miss exceeds the upside of an equal beat |
| 30 | Margins | Capex quadrupled while D&A stayed flat — coming depreciation step-up | Triggered | Medium | High | A forward margin headwind invisible in the current numbers |
| 31 | Guidance/Consensus | Capex guidance conflict: transcript ($25–30M) vs vendor tab ($20–25M) | Triggered | Medium | Medium | An unresolved $5M discrepancy on both ends of the guided range |
| 32 | Guidance/Consensus | EPS beat partly from lower share count and a one-off tax benefit | Triggered | Medium | Medium | Flatters the beat magnitude relative to core operating performance |
| 33 | Beat/Miss Setup | Beat streak is short (3 quarters) and already reset once before | Triggered | Medium | Medium | Limited statistical power; a single miss resets the pattern |
| 34 | Beat/Miss Setup | Miss case (1 uncontrolled variable) is structurally simpler than the beat case (several developments needed) | Unclear | Medium | Medium | Not a stark asymmetry, but the miss path needs less to go right |
| 35 | Beat/Miss Setup | No alt-data consumption panel to catch a deceleration early | Triggered | Medium | Medium | The engine's own named blind spot for how this setup could fail unseen |
| 36 | Earnings Quality | Adjusted-EBITDA cash conversion weakening (80%→64%→63%) | Triggered | Medium | Medium | A real deterioration, short of a "breakdown" but worth tracking |
| 37 | Earnings Quality | Tax-rate benefit (Canadian subsidiary wind-down) in the EPS-beat period | Triggered | Medium | Medium | Flatters the near-term reported EPS and effective tax rate |
| 38 | Earnings Quality | Inventory days up 9.1% over 2 years against declining revenue | Triggered | Medium | High | Risk inventory is building against softening sell-through |
| 39 | Sensitivity | Operating deleverage creates asymmetric downside | Triggered | Medium | High | Non-linear risk already qualitatively sized upstream |
| 40 | Sensitivity | Brand-level sensitivity dollars rely on a consolidated-margin proxy | Triggered | Medium | High | Labeled Low confidence upstream; a real precision limitation |
| 41 | Source Conflict | Capex guidance conflict (transcript vs vendor tab) | Triggered | Medium | Medium | Same item as #31, cross-referenced under Source Conflicts |
| 42 | Source Conflict | Business-model 11 vs 12 differ in emphasis on governance severity | Unclear | Medium | Medium | Synthesis should weight the fuller (11+12) picture, not 11 alone |
| 43 | Narrative/Framing | Setup is really a macro/commodity/policy bet on unhedged inputs | Triggered | Medium | High | Should be classified honestly per CLAUDE.md §14, not as pure execution |
| 44 | Historical Trend | QoQ improvement (+9.5%) sits beside continued YoY decline (−6.3%) | Unclear | Medium | Medium | Risk of anchoring on the less-reliable QoQ read |
| 45 | Data Completeness | Current market price not directly confirmed in this module's triage | Unclear | Low | Unknown | Watch item for agent 99; does not change the earnings-setup read |
| 46 | Source Conflict | 01 "CFO deteriorating" vs 06 "conversion has not broken down" | Unclear | Low | Low | Reconcilable — different metrics, not a real disagreement |

## 4. Red-Flag Score

| Metric | Value |
|---|---|
| Total flags triggered | 40 |
| Critical flags | 0 |
| High flags | 21 |
| Medium flags | 19 |
| Low flags | 0 |
| Unclear flags | 6 |
| Unavailable checks (data missing) | 0 |

## 5. Red-Flag Severity Verdict

**Material concerns** — high-severity flags present; the earnings setup may be overstated or fragile.

The single most dangerous red flag is #19: the risk that the three-quarter widening beat streak gets read as "earnings accelerating" when the actual trajectory is four straight quarters of YoY revenue decline, genuine (not impairment-driven) margin compression of ~330 basis points, and a guide that implies an even steeper decline next quarter than the one just reported. What would resolve it: an FQ4 FY26 print and, more importantly, the initial FY27 guide (due alongside it on Oct-23-2026) showing the September 2026 price increase landing with volume elasticity at or below management's own stated 1.0x assumption, combined with FY27 Street estimates stabilizing rather than continuing to fall.

## 6. What The Synthesis Agent Should Know

- 40 red flags triggered (21 High, 19 Medium, 0 Critical), plus 6 Unclear items requiring judgment — no single flag is a hard disqualifier, but the volume and consistency of High-severity flags across revenue, margins, guidance, quality, and sensitivity argues against treating this as a clean setup.
- The single most dangerous flag: a beat-and-lower-guide pattern (three widening beats, then a guide implying a steeper YoY decline) that risks being narrated as acceleration when the underlying trend is deceleration — see Section 5.
- This module's own agents (04, 05) already hedge appropriately (bar called "fair," setup called "balanced," not "low" or "easy") — the synthesis should preserve that hedge rather than simplify it into a bullish or bearish headline.
- Consider whether "Mixed earnings setup" (per MODULE_RULES verdict categories) fits better than "Earnings stable" or "Earnings decelerating" alone: near-term guidance/consensus are matched (a stable signal) while the trailing trend, margin structure, and FY27 revisions are all decelerating — these are genuinely conflicting signals, not a single clean direction.
- Score caps to consider: the earnings-quality score of 44/100 ("Material concerns" band, per 06's own scoring) should not be averaged up by the beat streak; the earnings-volatility score of 68/100 (inverted — high volatility) reflects unhedged, correlated external variables that the synthesis should carry forward, not treat as independent, additive risks.
- Contradictions to reconcile: (1) "CFO deteriorating" (01) vs "cash conversion has not broken down" (06) — both correct, different metrics, carry both; (2) business-model 11 vs 12 differ in emphasis (not fact) on how much weight the CEO-severance/CFO-dual-hat facts should add to the "capital allocation concerns, not governance red flags" classification — the synthesis should read 11 and 12 together.
- Missing data that limited this scan: no brand-level P&L caps precision on every brand-specific number in this module; no maintenance/growth capex split; no quantified tariff impact; no alt-data consumption panel for early warning. None of these gaps changes the sufficiency verdict (00 called the pool "Sufficient"), but they cap the precision of specific claims as noted throughout Section 2.
- Net read: this setup is dirtier than a synthesis reading only 04/05 in isolation might conclude — 04 and 05 already flag the tension between the beat streak and the falling FY27 revisions, but this report adds the accounting/governance layer (06, plus business-model 11/12) that shows the "clean" Adjusted EBITDA number itself has structurally absorbed a real, recurring pattern of M&A value destruction and rising accrual divergence on top of the demand and margin trend.

## 7. Pre-Mortem — If The Earnings Setup Fails

If this earnings setup turns out to be wrong, the most likely reason is that the market (and this module) leaned on the three-quarter widening beat streak as a signal of improving execution, while the real swing factor — the September 2026 price increase running into volume elasticity at or above management's own stated 1.0x assumption, layered onto an already-decelerating Quest-bar and Atkins base and unhedged commodity cost inflation that is still worsening — broke worse than guided, and did so in a way that showed up first in retail consumption data rather than in a reported number. No licensed alt-data consumption panel exists anywhere in this pool (confirmed absent in `00_earnings-data-triage.md` §1A and named directly in `05_beat-miss-setup.md`'s own pre-mortem), so this is precisely the kind of deterioration the engine has no early-warning channel to catch before it appears in the FQ1 FY27 print — by which point the "accelerating" read built on the beat streak would already have been wrong for two quarters.
