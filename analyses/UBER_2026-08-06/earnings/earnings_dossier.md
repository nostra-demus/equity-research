# earnings Module Dossier — UBER

> Deterministic, lossless concatenation of every artifact in this module — the module synthesis and every specialist output, in order. Generated mechanically (no LLM rewriting), so nothing is omitted or paraphrased. This is the module's "see everything" tier; the module's decision lives in `99_*-synthesis.md` and the short read in `earnings_memo.md`.

- Generated: 2026-08-06T16:15:47Z
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

# Earnings Module — UBER (Synthesis)

## Abstract

Uber's earnings setup is mixed, not accelerating: Adjusted EBITDA margin (a profit measure that adds back non-cash items like stock pay) has expanded every quarter for two years and beaten guidance highs twice running, while reported revenue growth slowed to the two weakest quarters of the last eight and missed the Street twice. The main driver, Mobility Gross Bookings (total spend flowing through the app before Uber's cut), grew 22% year-on-year for a fourth straight quarter, but a roughly 10-percentage-point gap to the 12% reported revenue figure is unverified against any primary filing. Consensus already sits at management's new guidance midpoints, not below them, so the bar is fair, not easy to beat. The biggest risk is that unresolved bookings-to-revenue gap, alongside net debt that has more than doubled to $9,340 million to help fund the pending Delivery Hero deal.

## 1. Earnings Verdict

- **Verdict: Mixed earnings setup** — revenue is decelerating on the reported number even as Gross Bookings (the underlying volume KPI) keeps growing above 20%; margins are expanding but the largest quantified swing factor (SG&A leverage) is already reversing; earnings quality is decent on a cash basis but headline GAAP profit is mostly a tax event, not an operating one.
- Earnings quality /100: **68** *(from 06 — cash-backed, but GAAP net income/EPS distorted by non-cash tax benefits)*
- Consensus setup /100 *(higher = more beatable)*: **45** *(from 04 — bar is "fair," sitting at, not below, the new guidance midpoints; not capped, since consensus data is present and current)*
- Earnings volatility /100 *(higher = worse)*: **45** *(from 07 — Low confidence per the inferred-sensitivities cap; no company-disclosed sensitivity table exists)*
- Next-quarter setup: **Balanced** *(from 05)*
- Biggest earnings driver (one line): Mobility Gross Bookings growth (+22% YoY, 4th straight quarter above 20%) — but a ~10pp gap to reported revenue growth (+12.2% YoY) is not decomposable from this pool and is the real swing factor behind whether this reads as acceleration or deceleration.
- Biggest earnings risk (one line): The unreconciled ~10pp Gross-Bookings-to-Revenue gap [02_revenue-drivers.md §6] — if it reflects real price/take-rate erosion rather than the "optical" UK accounting reclassification management describes, the Adjusted EBITDA/EPS beat streak is resting on a shrinking take rate, not durable cost discipline.
- **Red-flag severity verdict (from `08_earnings-red-flags.md`, reported verbatim): Material concerns** — high-severity flags present; earnings setup may be overstated or fragile.

## 1A. Module Disconfirmation

- **Strongest bear point:** Reported revenue has missed the Street's own pre-print estimate in each of the last two quarters (FQ1'26 −0.45%, FQ2'26 −0.52%) and printed its two slowest YoY growth rates of the last eight quarters (+14.5%, +12.2%), with revenue estimates still being cut (~−1.0% last month) [`01_historical-financials.md` §3, §6; `04_guidance-consensus.md` §4, §6].
- **Strongest bull point (steelman):** Cash conversion is genuinely clean and improving — CFO has exceeded Adjusted EBITDA for three straight fiscal years, reaching 115.7% in FY2025 and 103.8% on a TTM basis, with a shrinking working-capital cycle (18.5 → 14.5 days) and no receivables-quality red flags [`06_earnings-quality.md` §1–§3]. Adjusted EBITDA margin has expanded every single quarter for at least two years (15.11% → 19.86%) and beaten the high end of guidance in each of the last two quarters [`01_historical-financials.md` §3; `04_guidance-consensus.md` §6].
- **Single killer risk specific to earnings quality & the beat/miss setup:** The insurance-cost/driver-incentive tailwind inside COGS — the largest disclosed cost line — is being fully reinvested into pricing, not banked, so there is zero disclosed buffer if it reverses; it would hit Adjusted EBITDA directly and immediately with nothing else in the cost structure available to offset it [`03_margin-drivers.md` §6, §8; `07_earnings-sensitivity.md` §6].
- **Disconfirming evidence already visible:** SG&A leverage — the single largest quantified sensitivity variable in this module (±$780mm) — has already started reversing: the LTM SG&A ratio (20.50%) sits 63bps above the FY2025 low (19.87%) [`07_earnings-sensitivity.md` §3–§4; `03_margin-drivers.md` §3]. This is not a hypothetical bear case; it is a trend already printing.

## 2. Specialist Roll-Up

| Specialist | Verdict Line | Biggest Finding |
|---|---|---|
| earnings-data-triage | Sufficient — verbatim, one-day-old transcript, current consensus, full three-statement data | No primary SEC filing (10-K/10-Q/8-K) anywhere in the pool; every figure is a Capital IQ vendor transcription |
| historical-financials | Revenue growth decelerating at the margin while margins expand; FY22→FY23 was the durable inflection to Adjusted EBITDA profitability | GAAP EPS in FY2024/FY2025 inflated by one-time deferred-tax benefits ($5,758mm, $4,346mm); normalized EPS (0.73→1.70) is the cleaner trend |
| revenue-drivers | Mobility Gross Bookings growth is the single biggest revenue driver, and its current direction is improving | The ~10pp gap between +22% bookings growth and +12.2% reported revenue growth cannot be cleanly decomposed from this pool |
| margin-drivers | Adjusted EBITDA margin is the most useful margin metric; the insurance-cost/driver-incentive line is the single biggest margin driver | That insurance-cost tailwind is fully reinvested into pricing, leaving zero disclosed buffer if it reverses |
| guidance-consensus | Bar is fair | Adjusted EBITDA/EPS consensus now sits at, not below, the new guidance midpoints, closing the gap that supported the last two quarters' beats; Revenue estimates keep falling |
| beat-miss-setup | Setup is balanced | Bifurcated pattern: Revenue missed the Street twice running while Adjusted EBITDA/EPS beat the guidance high end twice running; risk of an in-line Q3 print masking a soft, unsized Q4 guide |
| earnings-quality | Score 68/100 — mostly clean, cash-backed, capped by GAAP-earnings distortion | CFO has exceeded Adjusted EBITDA every year since FY2023 (115.7% FY2025), but GAAP net income/EPS is dominated by a non-cash, two-years-running deferred-tax benefit |
| earnings-sensitivity | Earnings Volatility Score 45/100, confidence explicitly Low | SG&A leverage is the largest quantified sensitivity (±$780mm) and is already reversing in the LTM data |
| earnings-red-flags | **Material concerns** | The single most dangerous flag is the unreconciled ~10pp Gross-Bookings-to-Revenue gap — it determines whether the setup is genuinely accelerating or decelerating |

## 3. Reconciliation

- **02_revenue-drivers' "improving"/"durable" bookings framing vs. 01_historical-financials/04_guidance-consensus's decelerating reported-revenue framing.** Both are evidenced from the same pool and are not in factual conflict — Gross Bookings genuinely grew 22% YoY while reported Revenue genuinely grew only 12.2% YoY the same quarter. The disagreement is one of emphasis: 02 highlights the operational KPI, 01/04 highlight the audited-adjacent financial-statement metric. Per CLAUDE.md §4 (use the more conservative interpretation when sources disagree on framing) and 08_earnings-red-flags's own explicit recommendation, this synthesis weights the reported-Revenue deceleration at least as heavily as the Gross Bookings acceleration story — reported revenue is what the earnings module ultimately measures, and Gross Bookings has no audited multi-period series in this pool (only management quotes) [`02_revenue-drivers.md` §1.2, §6; `08_earnings-red-flags.md` §1].
- **An analyst's live-call claim ("bookings +22% constant currency, revenue +19%") vs. the CIQ-sourced +12.2% reported revenue figure for the same quarter.** Unreconciled by any upstream agent. This synthesis treats the CIQ-reported +12.2% figure as the anchor (it is the module's own primary, cross-checked number), and flags the analyst's live remark as unverified per source hierarchy §4 [`02_revenue-drivers.md` §3, §6].
- **Quarterly Gross Margin % step-change (39.6%→45.0%, FQ4'25→FQ1'26) vs. the LTM GAAP gross margin, which moved only +225bps over the same window.** Both 01_historical-financials and 03_margin-drivers independently flag this same divergence. Management's "optical, UK-reclassification" explanation is plausible and internally consistent with the smooth Adjusted EBITDA margin trend over the same quarters, but it is management's own unverified assertion — no 10-Q is in this pool to confirm the reclassification mechanics. This synthesis treats the quarterly Gross Margin % series from FQ1'26 onward as not comparable to prior quarters without adjustment, consistent with both upstream agents.

## 4. Score Cap Application

| Cap Trigger | Applied? (Y/N) | Affected Score | Final Cap |
|---|---|---|---|
| No consensus / estimate data | N — consensus is present and current (Aug-05/06-2026) | Consensus setup | Not capped |
| No cash flow statement | N — full cash flow statement present | Earnings quality | Not capped |
| No revision history | N — extensive revision history (1/2/3-month-ago snapshots) present | Consensus setup | Not capped |
| No verbatim transcript AND no sell-side proxy | N — verbatim Q2 FY2026 transcript present | Earnings clarity | Not capped |
| Transcript role filled ONLY by a sell-side proxy (no verbatim) | N — verbatim transcript present, no proxy needed | Earnings clarity | Not capped |
| Only inferred sensitivities | Y — no company-disclosed sensitivity table exists anywhere in the pool | Earnings volatility confidence | **Must be Low** (applied; the 45/100 score above carries explicitly Low confidence) |

Additional partial cap carried forward from `00_earnings-data-triage.md` and `02_revenue-drivers.md`/`03_margin-drivers.md`: segment P&L is annual-only (FY2020–FY2025, no interim/LTM column), roughly two quarters stale versus the Jun-30-2026 period-end. This caps earnings clarity at **max 70** for the **current-quarter mix-shift read specifically**; the annual-period segment reads (used throughout Sections 2 and 3 above) are not subject to this cap.

## 5. Earnings Setup Summary

### Revenue Setup

The current revenue trajectory is not a clean read of demand: reported growth (+12.2% YoY, the second-slowest quarter of the last eight) sits roughly 10 percentage points below Gross Bookings growth (+22% YoY), and the gap cannot be cleanly split into take rate, mix, FX, and M&A effects from this data pool. Management attributes most of the gap to a UK accounting reclassification it calls "optical," but that claim is unverified against any primary filing. If the true split favors real price/take-rate erosion over accounting noise, revenue growth would flip from "decelerating on optics" to "decelerating on economics" — a materially worse read. The single factor that would flip the direction is the FQ3 2026 10-Q's MD&A revenue bridge (or an investor deck with a bookings-to-revenue reconciliation), neither of which is in this pool. Delivery's reported growth also carries a real, one-time M&A base effect: the Trendyol Go divestiture still sits in the year-ago comparison base and only laps in Q3 FY2026, meaning any Q3 "acceleration" in Delivery's reported growth will be partly mechanical, not organic.

### Margin Setup

Adjusted EBITDA margin expansion (15.11% → 19.86% over the last eight quarters) looks durable on its face, but the pace of annual expansion is decelerating (+204bps FY2025 vs. +550bps FY2023), which is normal maturation, not a red flag by itself. The bigger question is sustainability of the current run rate: the insurance-cost/driver-incentive line inside COGS — the single largest cost line at 61.5% of FY2025 revenue — is currently a tailwind, but every dollar of it is being reinvested into pricing rather than banked, so a state-regulated, tort-driven reversal in insurance or litigation costs would hit margins directly with no disclosed buffer. Uber has no contractual pass-through mechanism for this cost line; take-rate and incentive-spend decisions are described by management as real-time, discretionary calls, not hedged or contracted. The segment most exposed to an adverse 10–20% move is Mobility (57% of revenue, 90.5% of total-company EBITDA) via this same insurance/incentive line, since a comparable move at Freight (near-zero EBITDA contribution) would barely register at the consolidated level.

### Quality Check

The single largest gap between reported and economic earnings is GAAP net income/EPS versus cash-backed operating earnings, and it is widening in dollar terms even as CFO conversion improves: GAAP EPS ($4.56 → $4.73, FY2024→FY2025) is dominated by a non-cash, two-years-running deferred-tax valuation-allowance release ($5,758mm and $4,346mm) plus a volatile equity-stake mark-to-market line, while normalized EPS ($0.73 → $1.70) and CFO (+42% YoY FY2025) tell a genuinely improving, cleaner story. The Adjusted-EBITDA-vs-GAAP-EBITDA bridge is roughly 75% explained by stock-based compensation (a real, recurring, dilutive cost, not a one-off), but the remaining ~25% (~$592mm FY2025) is not itemized anywhere in this pool. To model normalized earnings for next year, start from CFO/FCF and Adjusted EBITDA, not GAAP net income or GAAP EPS — the tax-benefit mechanism has now recurred twice and its scale (already shrinking as the underlying net operating loss carryforward balance declines) makes headline GAAP EPS growth an unreliable year-over-year comparison.

### Consensus Bar

For Uber to beat the current bar by a material margin, Adjusted EBITDA would need to clear $2,960mm (above the guidance high end, extending a two-quarter beat streak) or Revenue would need to reverse its two-quarter miss pattern and clear roughly $14,845mm — neither is the base case implied by current revision momentum, since Revenue estimates are still being cut (~−1.0% last month) while Adjusted EBITDA estimates are still being raised (~+2.9% over three months). The bar looks most likely mispriced on the Revenue line specifically: it carries no company guidance (none issued since FQ2 2020), so the Street's own estimate — not a management commitment — is the only anchor, and that anchor has already proven wrong twice running. The Adjusted EBITDA/EPS bar, by contrast, looks correctly priced, not too low: consensus has already moved to sit at the new guidance midpoints rather than below them, closing the room that powered the last two quarters' beats. None of the current bar is obviously anchored to a one-off macro or event tailwind, though the World Cup boost to US Mobility volume this quarter is explicitly labeled non-run-rate by management and should not be extrapolated into the Q3 comparison.

## 5b. Leverage & Capital Structure

**Trigger B fires:** net debt (strict basis: total debt − cash & equivalents) more than doubled year-over-year — $3,816mm (Jun-30-2025) → $9,340mm (Jun-30-2026), a 2.45x absolute change (+144.8%) [`01_historical-financials.md` §2, citing Financials.xls Balance Sheet tab]. This exceeds the "net debt changed by more than 2x year-over-year" trigger threshold. Trigger A (net debt / Adjusted EBITDA > 3.0x) does not fire: the current ratio is 0.93x.

1. **Current leverage level:** Net debt / Adjusted EBITDA (company-defined, non-GAAP) = 0.93x ($9,340mm net debt ÷ $10,043mm TTM Adjusted EBITDA, both at Jun-30-2026) [`01_historical-financials.md` §2].
2. **Year-over-year change:** Ratio terms: 0.51x (Jun-25: $3,816mm ÷ $7,519mm TTM Adj. EBITDA) → 0.93x (Jun-26) — a +0.42x move, below the 1.0x ratio-change trigger on its own. Absolute dollar terms: $3,816mm → $9,340mm, a +$5,524mm / +144.8% move — this is what fires the section [`01_historical-financials.md` §2].
3. **Largest driver of the change:** The pending Delivery Hero acquisition. Total debt issued jumped to $6,229mm on an LTM basis from $3,359mm in FY2025 [`03_margin-drivers.md` §3], a likely precursor to drawing the disclosed ~€14bn Delivery Hero bridge facility. Separately, Uber already deployed about $4bn of capital in Q2 FY2026 alone on market purchases of Delivery Hero stock, which also diverted cash from the company's own ~50%-of-FCF buyback target ($3.5bn bought back YTD, below that target) [`03_margin-drivers.md` §9].
4. **Adjusted vs. GAAP EBITDA basis:** The 0.93x ratio above uses company-defined Adjusted EBITDA. Using GAAP-based EBITDA (Operating Income + D&A, LTM = $7,474mm) with the same $9,340mm net debt, the ratio would be **1.25x** — still well under the 3.0x Trigger-A threshold, but a reminder that the Adjusted metric flatters the ratio by roughly 34% relative to the GAAP-based one [`01_historical-financials.md` §4].
5. **Debt maturity profile:** Not disclosed anywhere in this data pool — no note-level debt schedule or maturity ladder is present (no 10-K/10-Q). *"Not proven from available data."*
6. **Capital-allocation constraint:** Yes, already visible and management-disclosed, not merely inferred — buybacks have already been diverted below the company's own stated ~50%-of-FCF target because of the $4bn Q2 Delivery Hero share purchase [`03_margin-drivers.md` §9]. No dividend exists to constrain. No rating-agency action (upgrade, downgrade, or negative watch) is disclosed anywhere in this pool.

**Cross-reference check:** The Section 1 verdict is "Mixed earnings setup," not "Earnings decelerating" or "Earnings inflecting — negative," so the mandatory cross-reference requirement (updating the Section 1 "Biggest earnings risk" line to reference both leverage and earnings trajectory together) does not apply. The leverage build is nonetheless a real, separate risk surfaced here and in Section 8 below.

## 6. Key Numbers

- Revenue growth rate: TTM (Jun-26) +16.7% YoY; most recent single quarter (FQ2'26) +12.2% YoY, the second-slowest of the last 8 quarters [`01_historical-financials.md` §2–§3]
- Adjusted EBITDA margin: FY2025 16.78%; latest quarter (FQ2'26) 19.86%, expanding every quarter for 2+ years [`01_historical-financials.md` §1, §3]
- EPS: GAAP diluted FY2025 $4.73 (distorted by a $4,346mm non-cash tax benefit); Normalized diluted FY2025 $1.70 — the cleaner comparison [`01_historical-financials.md` §4]
- CFO / EBITDA: 115.7% FY2025; 103.8% TTM (Jun-26) — comfortably above the 70% "healthy" threshold [`06_earnings-quality.md` §1–§2]
- Biggest driver current level: Gross Bookings >$58bn in Q2 FY2026, +22% YoY, 4th straight quarter above 20% growth [`02_revenue-drivers.md` §4]
- Consensus gap: Adjusted EBITDA consensus $2,919.3mm vs. guidance midpoint $2,910mm (+0.3%); Adjusted EPS consensus $0.86 exactly at the $0.86 guidance midpoint [`04_guidance-consensus.md` §3]
- Estimate revision direction: Revenue falling (~−1.0% last month, ~−0.6% for FY2026); Adjusted EBITDA rising (~+2.9% since 3 months ago, net revision breadth +14 to +28 analysts) [`04_guidance-consensus.md` §4–§5]
- Earnings volatility score: 45/100 (higher = worse), confidence explicitly Low per the inferred-sensitivities cap [`07_earnings-sensitivity.md` §7]

## 7. What Would Change The Earnings Verdict?

| Current Verdict | What Would Upgrade It | What Would Downgrade It | Data Needed |
|---|---|---|---|
| Mixed earnings setup | A primary filing (10-Q/10-K) confirming the bookings-to-revenue gap is genuinely accounting-driven (UK reclassification) rather than real price erosion, combined with Revenue re-accelerating above the Street's cut estimate and SG&A leverage resuming its prior improving trend | A Q3 print or Q4 guide showing the SG&A-reversal trend widening further, the insurance-cost tailwind reversing with the disclosed zero buffer, or Revenue missing the Street's estimate for a third straight quarter | The FY2025 10-K or FQ3 2026 10-Q's MD&A revenue bridge (bookings-to-revenue decomposition by take rate/mix/FX/M&A); a disclosed Gross Bookings guidance range; the Q4 2026 Adjusted EBITDA guide, which would first show any sizing of AV/Delivery Hero P&L costs |

Consensus setup here is not "Unknown" — current, dated (Aug-05/06-2026), post-print consensus data is present with full revision history, so the constraint against calling "Earnings accelerating" with unknown consensus does not directly apply. The verdict is "Mixed," not "Accelerating," because the driver evidence itself is genuinely split (Gross Bookings up, reported Revenue down; margins expanding, but the largest quantified margin lever already reversing) — not because of a data-sufficiency gap.

## 8. Note To The Final Synthesizer

- Dominant earnings trend: split, not unified — Gross Bookings (the volume KPI) is accelerating, reported Revenue (the financial-statement metric) is decelerating, and the ~10pp gap between them is unresolved from this pool.
- Whether earnings are clean and cash-backed: yes on a cash basis (CFO has exceeded Adjusted EBITDA for three straight years, 115.7% FY2025) but no on a GAAP-headline basis — GAAP net income/EPS in FY2024 and FY2025 was mostly a non-cash tax event, not marketplace economics.
- Consensus bar assessment: fair, not low — the Street has already moved Adjusted EBITDA/EPS estimates up to sit at the new guidance midpoints, closing the room that powered the last two quarters' beats; Revenue estimates are still being cut into the print.
- Next-quarter setup and second-quarter look-ahead: balanced for Q3 FY2026, but Q4 FY2026 (Uber's seasonally strongest quarter) has no guidance yet issued and is the first quarter where Delivery Hero/AV investment costs could plausibly start to be sized by management — an in-line Q3 combined with a weak or newly cost-laden Q4 guide would flip the setup to inflecting negative without a Q3 miss occurring at all.
- Top sensitivity variable and its current direction: SG&A leverage (±$780mm, the largest quantified swing factor) — direction already reversing in the LTM data (20.50% vs. the FY2025 low of 19.87%).
- Whether any partial-data cap applied and what it limits: yes — earnings volatility confidence is capped at Low because no company-disclosed sensitivity table exists anywhere in the pool; current-quarter segment mix-shift clarity is capped at max 70 because the segment P&L is annual-only and roughly two quarters stale.
- Biggest missing data point: no primary SEC filing (10-K/10-Q/8-K) is anywhere in this pool — every figure in this entire module is a Capital IQ vendor transcription, one layer removed from the audited source. The single highest-value next data request is the FQ3 2026 10-Q (or the FY2025 10-K's MD&A), which would resolve the ~10pp bookings-to-revenue gap.
- What would change the earnings verdict: see Section 7 — primarily, whether the bookings-to-revenue gap resolves as accounting noise or real price erosion.
- **Red-flag severity verdict (verbatim from `08_earnings-red-flags.md`): Material concerns.**
- **Forensic tag check (CLAUDE.md §13, §11):** `06_earnings-quality.md` did **not** emit RF-EQ-001 (rising accruals divergent from cash earnings) — fewer than 2 of the 6 accrual-quality flag rows triggered Y. `06_earnings-quality.md` also did **not** emit RF-EQ-002 (cash-conversion breakdown) — CFO/Adjusted EBITDA stayed above 70% in all of the last three fiscal years (88.5%, 110.1%, 115.7%). Neither forensic tag fired; there is nothing to propagate here.
- Biggest risks not otherwise captured above (Critical/High severity flags from `08_earnings-red-flags.md`, propagated per the mandatory-propagation rule): (1) no primary SEC filing anywhere in the pool — every module figure is unverified against the audited source; (2) the unreconciled ~10pp Gross-Bookings-to-Revenue gap; (3) insurance-cost tailwind fully reinvested with zero disclosed buffer if reversed; (4) SG&A leverage — the largest quantified sensitivity — already reversing; (5) in-line Q3 print risk masking a soft, unsized Q4 guide as AV/Delivery Hero costs begin to show up; (6) GAAP net income/EPS dominated by a recurring non-cash deferred-tax benefit; (7) driver/worker-classification regulation — an unbounded-magnitude tail risk, the "single biggest lever" per the business-model module; (8) revenue narrative leaning on an unaudited Gross Bookings KPI while reported Revenue decelerates and misses; (9) the "earnings accelerating" impression resting on Adjusted EBITDA/EPS while GAAP net income is majority non-operating. All nine High-severity flags from `08_earnings-red-flags.md` §4 are captured across this bullet list and Section 5b above; none were excluded.

## 9. Simple Summary

- Revenue trend: growing, but slowing — the last two quarters were the weakest of the past eight, and the company missed the Street's own estimate both times.
- Margin trend: improving every quarter, driven mostly by cost discipline in SG&A and a currently-favorable but fully-spent insurance-cost line.
- Whether earnings are clean: cash earnings are clean (the company collects more cash than its own headline profit measure), but the GAAP profit number investors see first is mostly a one-time tax credit, not real operating improvement.
- Whether the consensus bar is beatable: not easily — Wall Street has already moved its estimates up to match the new guidance, closing the gap that let the company beat the last two quarters.
- Next-quarter setup: balanced — decent odds of another profit beat, real odds of another revenue miss.
- Biggest sensitivity variable: cost discipline in SG&A (sales, general and administrative spending) — and it is already showing early signs of loosening.
- Earnings volatility level: moderate (45 out of 100, where higher is worse), but the company itself has never disclosed a sensitivity table, so this estimate has low confidence.
- Whether this module is useful for the master synthesizer: yes — it surfaces a genuine, unresolved fork (is the ~10-point bookings-vs-revenue gap accounting noise or real price erosion?) that no single upstream specialist fully connected, plus a leverage build (net debt more than doubled to $9.3 billion) tied directly to the pending Delivery Hero acquisition.



---

## earnings / 00_earnings-data-triage.md

_Source: `00_earnings-data-triage.md`_

# Earnings Data Triage — UBER

## 0. Jurisdiction & Reporting Regime

| Item | Detected Value | Evidence |
|---|---|---|
| Primary listing country | United States | "Uber Technologies, Inc. (NYSE:UBER)"; primary office 1725 3rd Street, San Francisco, CA [Public Company Profile.rtf] |
| Exchange | NYSE | Ticker "UBER (NYSE)" [Public Company Profile.rtf] |
| Filing regime (US SEC / India SEBI-LODR / UK / Other) | US SEC (10-K / 10-Q / 8-K cadence) | No 10-K/10-Q document itself is IN this pool — only vendor (Capital IQ) exports and the earnings-call transcript. Capital IQ's "Restatement: Latest Filings" tabs and the Segments tab's "Filing Date" row (e.g. 2026-02-13 for FY2025) confirm a US annual-filing cadence consistent with a 10-K [Uber Technologies Inc NYSE UBER Financials.xls, Segments tab] |
| Reporting standard (US GAAP / IFRS / Ind AS) | US GAAP | "Consolidation: Consolidated / Acctg. Standard: US GAAP" stated explicitly in the Estimates Report workbook (Consensus, Guidance, Surprise, Trends tabs) [UberTechnologies,IncNYSEUBEREstimatesReport (1).xls, Consensus tab] |
| Reporting currency | USD | "Currency: USD" on Income Statement / Balance Sheet / Cash Flow tabs [Uber Technologies Inc NYSE UBER Financials.xls] |
| Fiscal-year end | December 31 | "Current Fiscal Year End: Dec-31-2026"; annual periods run "12 months Dec-31-20XX" [Financials.xls, Income Statement tab; Estimates Report, Consensus tab] |
| Document language(s) | English | All 13 source files / 45 extracted tabs are in English |

**Critical caveat carried forward:** No primary SEC filing (10-K, 10-Q, 8-K) is present in the data pool — every income statement, balance sheet, and cash flow figure is sourced from Capital IQ's vendor transcription of those filings (source-hierarchy tier 5, §4), not the filing itself. The business-model module's `00_data-triage.md` flags the identical gap. Downstream earnings agents must cite these figures as Capital IQ exports, not as "10-K" or "10-Q," and should treat the CIQ workbook's own labelled "LTM / Press Release Jun-30-2026" column as the closest available proxy for the FQ2 2026 quarterly filing.

## 1. File Inventory

| Filename | Type | Period Covered | Last Modified (pool sync date — not authoritative, §23/F23) | Earnings Relevance |
|---|---|---|---|---|
| Charting Excel Export Aug-05-2026 2_49 PM.xls — Chart 1 with Data | data export | Multi-year daily price series through Aug-05-2026 | 2026-08-06 | Low |
| Charting Excel Export Aug-05-2026 2_49 PM.xls — Attributions | data export | n/a (source attribution list) | 2026-08-06 | Low |
| Company Comparable Analysis Uber Technologies Inc.xls — Financial Data | data export (peer comps) | As-Of Date 2026-08-06; peer LTM figures dated Apr–Aug 2026 | 2026-08-06 | Low (peer set, not Uber's own detail) |
| Company Comparable Analysis Uber Technologies Inc.xls — Trading Multiples | data export (peer comps) | As of 2026-08-06 | 2026-08-06 | Low |
| Company Comparable Analysis Uber Technologies Inc.xls — Operating Statistics | data export (peer comps) | As of 2026-08-06 | 2026-08-06 | Low |
| Company Comparable Analysis Uber Technologies Inc.xls — Business Description | data export | Undated narrative | 2026-08-06 | Low |
| Company Comparable Analysis Uber Technologies Inc.xls — Implied Valuation | data export | As of 2026-08-06 | 2026-08-06 | Low (out of module scope — valuation) |
| Company Comparable Analysis Uber Technologies Inc.xls — Valuation Chart | data export | As of 2026-08-06 | 2026-08-06 | Low |
| Company Comparable Analysis Uber Technologies Inc.xls — Credit Health Panel | data export | LTM, as of 2026-08-06 | 2026-08-06 | Medium (leverage/coverage feeds earnings-quality/cash context) |
| Company Comparable Analysis Uber Technologies Inc.xls — Disclaimer | data export | n/a | 2026-08-06 | Low |
| Company_Comparable_Analysis_Uber_Technologies _Inc.rtf | data export (rtf render of same workbook) | As of 2026-08-06 | 2026-08-06 | Low (duplicate of Company Comparable Analysis.xls content) |
| Uber Technologies Inc NYSE UBER Analyst Coverage.rtf | data export (analyst roster) | Current sell-side roster, targets/ratings as of pool date | 2026-08-06 | Medium — consensus-setup context ONLY; per-analyst Rating/Target Price is verdict-bearing and must be stripped (§24) before use |
| Uber Technologies Inc NYSE UBER Board Members.rtf | governance data export | Current board roster | 2026-08-06 | Low (not earnings-relevant) |
| Uber Technologies Inc NYSE UBER Financials.xls — Key Stats | data export | Annual/LTM, latest column Jun-30-2026 | 2026-08-06 | Medium |
| Uber Technologies Inc NYSE UBER Financials.xls — Income Statement | data export | Annual FY2021–FY2025 + LTM "Press Release Jun-30-2026" | 2026-08-06 | High |
| Uber Technologies Inc NYSE UBER Financials.xls — Balance Sheet | data export | FY2021–FY2025 year-end + "Press Release Jun-30-2026" | 2026-08-06 | High |
| Uber Technologies Inc NYSE UBER Financials.xls — Cash Flow | data export | Annual FY2021–FY2025 + LTM "Press Release Jun-30-2026" | 2026-08-06 | High |
| Uber Technologies Inc NYSE UBER Financials.xls — Multiples | data export | Annual/LTM through Jun-30-2026 | 2026-08-06 | Low |
| Uber Technologies Inc NYSE UBER Financials.xls — Historical Capitalization | data export | Historical, through recent | 2026-08-06 | Low |
| Uber Technologies Inc NYSE UBER Financials.xls — Capital Structure Summary | data export | Through recent | 2026-08-06 | Medium (debt load feeds interest-expense driver) |
| Uber Technologies Inc NYSE UBER Financials.xls — Capital Structure Details | data export | Through recent, incl. filing-date markers | 2026-08-06 | Medium |
| Uber Technologies Inc NYSE UBER Financials.xls — Ratios | data export | Annual/LTM through Jun-30-2026 | 2026-08-06 | Medium |
| Uber Technologies Inc NYSE UBER Financials.xls — Supplemental | data export | Annual/LTM | 2026-08-06 | Medium |
| Uber Technologies Inc NYSE UBER Financials.xls — Industry Specific | data export | Sparse | 2026-08-06 | Low |
| Uber Technologies Inc NYSE UBER Financials.xls — Pension OPEB | data export | Sparse/not applicable | 2026-08-06 | Low |
| Uber Technologies Inc NYSE UBER Financials.xls — Segments | data export | Annual FY2020–FY2025 only (no LTM/interim column) | 2026-08-06 | High, but stale by ~2 quarters vs the Jun-30-2026 period-end — flag for `02_revenue-drivers` |
| Uber Technologies Inc NYSE UBER Products.rtf | data export (business description) | Undated narrative | 2026-08-06 | Low |
| Uber Technologies Inc NYSE UBER Professionals.rtf | data export (management bios) | Current roster | 2026-08-06 | Low |
| Uber Technologies Inc NYSE UBER Public Company Profile.rtf | data export (company profile / market data) | Price/market data as of Aug-05/06-2026 | 2026-08-06 | Medium (current price $69.48, market cap, shares out.) |
| Uber Technologies, Inc., Q2 2026 Earnings Call, Aug 05, 2026.pdf | **VERBATIM earnings transcript** (S&P Global Market Intelligence / CIQ) | FQ2 2026 (quarter ended Jun-30-2026), call held Aug-05-2026, prepared remarks + Q&A | 2026-08-06 | **High** |
| UberTechnologies,IncNYSEUBEREstimatesReport (1).xls — Consensus | consensus/estimate export | Current-quarter/year/NTM as of Aug-05/06-2026 | 2026-08-06 | High |
| UberTechnologies,IncNYSEUBEREstimatesReport (1).xls — Recent Changes | estimate-revision export | Recent revision snapshots | 2026-08-06 | High |
| UberTechnologies,IncNYSEUBEREstimatesReport (1).xls — Guidance | guidance data export | Quarterly guidance-vs-actual, FQ1 2019–FQ3 2026 | 2026-08-06 | High |
| UberTechnologies,IncNYSEUBEREstimatesReport (1).xls — Multiples | consensus/estimate export | As of pool date | 2026-08-06 | Low |
| UberTechnologies,IncNYSEUBEREstimatesReport (1).xls — Surprise | consensus/estimate export | Quarterly, FQ1 2019–FQ2 2026 (30 quarters) + annual 2018–2025 | 2026-08-06 | High |
| UberTechnologies,IncNYSEUBEREstimatesReport (1).xls — Trends | estimate-revision export | Forward FQ3 2026–FY2035, with 1/2/3/6/9/12/18-month-ago revision snapshots | 2026-08-06 | High |
| UberTechnologies,IncNYSEUBEREstimatesReport (1).xls — Revisions | estimate-revision export | Revision history | 2026-08-06 | High |
| UberTechnologies,IncNYSEUBEREstimatesReport.xls — Consensus | consensus/estimate export | **Duplicate of the "(1)" workbook above** — identical row/col/cell counts | 2026-08-06 | High (but redundant; do not double-count) |
| UberTechnologies,IncNYSEUBEREstimatesReport.xls — Recent Changes | estimate-revision export | Duplicate | 2026-08-06 | High (redundant) |
| UberTechnologies,IncNYSEUBEREstimatesReport.xls — Guidance | guidance data export | Duplicate | 2026-08-06 | High (redundant) |
| UberTechnologies,IncNYSEUBEREstimatesReport.xls — Multiples | consensus/estimate export | Duplicate | 2026-08-06 | Low |
| UberTechnologies,IncNYSEUBEREstimatesReport.xls — Surprise | consensus/estimate export | Duplicate | 2026-08-06 | High (redundant) |
| UberTechnologies,IncNYSEUBEREstimatesReport.xls — Trends | estimate-revision export | Duplicate | 2026-08-06 | High (redundant) |
| UberTechnologies,IncNYSEUBEREstimatesReport.xls — Revisions | estimate-revision export | Duplicate | 2026-08-06 | High (redundant) |
| UberTechnologiesIncNYSEUBER_CIQReportLandscape.rtf | CIQ daily-digest / broad company report (news + comps blend) | Dated entries through Aug-06-2026 02:49 AM | 2026-08-06 | Medium — contains a dated headline ("Uber Technologies reports moderating growth, issues soft forecast," Aug-05/06-2026) that is directionally useful market-reaction context but is a TMT-sector news digest, not an Uber-dedicated earnings source; treat any specific claim from it as `Web: dated, unverified` unless corroborated in the transcript/CIQ financials |

**Note on duplication:** the two "EstimatesReport" workbooks (`...Report.xls` and `...Report (1).xls`) are identical exports — same row/col/cell counts across all 7 tabs. They are counted once for sufficiency purposes; downstream agents should not treat them as two independent sources.

## 1A. External Data

No `data/UBER/external/` directory exists in this pool. No externally sourced research (alt-data panels, expert calls, channel checks, broker research, paid-API pulls) is present. Not applicable.

## 2. Most Recent Sources

| Source Type | Filename | Period | Age (months) |
|---|---|---|---|
| Annual filing | *None present* — closest is the CIQ "equivalent full-year financials" export | FY2025 (year ended Dec-31-2025); filing-date marker 2026-02-13 | ~6 months since filing date; ~7–8 months since period-end |
| Quarterly filing | *None present* — no 10-Q in pool | Closest proxy: CIQ "LTM / Press Release Jun-30-2026" column (quarter ended Jun-30-2026) | ~1 month since period-end (period end Jun-30-2026 vs today Aug-06-2026) |
| Earnings transcript | Uber Technologies, Inc., Q2 2026 Earnings Call, Aug 05, 2026.pdf | FQ2 2026 (quarter ended Jun-30-2026), call Aug-05-2026 | 0 months (1 day old) |
| Investor deck | *None present* | — | — |
| Consensus / estimate export | UberTechnologies,IncNYSEUBEREstimatesReport (1).xls — Consensus tab | Current quarter FQ3 2026, current year FY2026, NTM; consensus "as of Aug-05-2026 10:04 AM GMT" | 0 months |
| Cash flow data | Uber Technologies Inc NYSE UBER Financials.xls — Cash Flow tab | Annual through FY2025 + LTM "Press Release Jun-30-2026" | 0–1 month (LTM column) |
| Guidance data | UberTechnologies,IncNYSEUBEREstimatesReport (1).xls — Guidance tab | FQ3 2026 guidance issued 2026-08-05 (EPS 0.84–0.88) | 0 months (1 day old) |

## 3. Earnings Usability Check

| Requirement | Available? (Y/N) | Source | Why It Matters |
|---|---|---|---|
| Income statement | Y | Financials.xls, Income Statement tab (annual FY2021–FY2025 + LTM Jun-30-2026) | Needed for revenue, margin, EPS |
| Balance sheet | Y | Financials.xls, Balance Sheet tab (annual FY2021–FY2025 + Jun-30-2026 press-release column) | Needed for working capital and leverage |
| Cash flow statement | Y | Financials.xls, Cash Flow tab (annual FY2021–FY2025 + LTM Jun-30-2026) | Needed for CFO, FCF, earnings quality |
| Latest quarter | Y (via vendor export, not a filed 10-Q) | Estimates Report, Surprise tab — FQ2 2026 actual EPS 1.17, Revenue $14,191mm vs consensus $14,265.78mm; Financials.xls "Press Release Jun-30-2026" column | Needed for trend and setup |
| Last 8 quarters | Y | Estimates Report, Surprise tab — quarterly Revenue/EBITDA/EPS surprise from FQ1 2019 through FQ2 2026 (30 quarters) | Needed for seasonality and inflection |
| Consensus estimates | Y | Estimates Report, Consensus tab — mean/median/high-low/std dev/# estimates for target price, LT growth; current-quarter/year/NTM EPS, Revenue, EBITDA | Needed for market bar |
| Estimate revisions | Y | Estimates Report, Trends & Revisions tabs — 1/2/3/6/9/12/18-month-ago revision snapshots through FY2035 | Needed for revision momentum |
| Earnings transcript | Y — verbatim | Uber, Inc., Q2 2026 Earnings Call, Aug 05, 2026.pdf (S&P Global Market Intelligence transcript; prepared remarks + Q&A, participants incl. CEO Dara Khosrowshahi, CFO Balaji Krishnamurthy) | Needed for management tone and driver detail |
| Segment P&L | Y, but annual-only (stale ~2 quarters) | Financials.xls, Segments tab — Mobility / Delivery / Freight revenue and EBITDA, FY2020–FY2025 only; no interim/LTM column | Needed for mix shift |
| Current price | Y | Public Company Profile.rtf — Last (Delayed) $69.48, Market Cap $139,261.7mm, as of pool date | Needed only for master-level stock reaction context |

## 4. Cross-Module Availability

| Business-Model Output | Available? (Y/N) |
|---|---|
| 03_segment-map.md | Y — `analyses/UBER_2026-08-06/business-model/03_segment-map.md` exists |
| 06_value-chain.md | Y — `analyses/UBER_2026-08-06/business-model/06_value-chain.md` exists |
| 10_external-dependency.md | Y — `analyses/UBER_2026-08-06/business-model/10_external-dependency.md` exists |

The full business-model module (00–12, 99, and dossier) has completed for this ticker and is available for the earnings module to read.

## 5. Partial-Data Flags

| Missing Data | Applies? (Y/N) | Affected Agents | Cap Applied |
|---|---|---|---|
| No consensus / estimate data | N — consensus is present and current (as of Aug-05-2026) | 04, 05, 99 | Not applicable |
| No quarterly data | N — quarterly actuals/surprise exist for 30 quarters via the Estimates Report Surprise tab, and a "Press Release Jun-30-2026" quarter-end column exists in Financials.xls; however no primary 10-Q/quarterly filing itself is in the pool | 01, 02, 03, 06 | None from this trigger; see the standalone "no primary filing" caveat in §0 instead |
| No VERBATIM transcript, sell-side proxy present | N — a verbatim transcript IS present | 02, 03, 04 | Not applicable |
| No transcript AND no sell-side proxy | N | 02, 03, 04 | Not applicable |
| No segment-level P&L | N — segment P&L exists, but only at annual granularity (FY2020–FY2025), not for the Jun-30-2026 interim/LTM period | 02, 03, 99 | Apply the "No segment-level P&L for multi-segment business" clarity cap (Earnings clarity max 70) only for the CURRENT-QUARTER mix-shift read, since the segment table itself is ~2 quarters stale; annual-period segment analysis is unaffected |
| No cash flow statement | N | 06, 99 | Not applicable |
| No current price | N | 99 | Not applicable |

## 6. Sufficiency Verdict

- **Verdict:** Sufficient
- **Reason:** The pool has a verbatim, one-day-old Q2 FY2026 earnings-call transcript (Aug-05-2026), current consensus/guidance/revision data (as of Aug-05/06-2026), and a full income statement, balance sheet, and cash flow statement (Capital IQ export, annual FY2021–FY2025 plus a Jun-30-2026 LTM/press-release column) — meeting the letter of the sufficiency rule (equivalent full-year financials + verbatim transcript + all three core statements).
- **Active partial-data caps:**
  - Segment P&L is annual-only (FY2020–FY2025, no interim column) — cap segment/mix-shift clarity for the CURRENT quarter specifically at Earnings clarity max 70 per the "no segment-level P&L" trigger; annual-period segment reads are unaffected.
- **Critical missing items:**
  - No primary SEC filing (10-K, 10-Q, or 8-K/press release) is present anywhere in the pool. Every income-statement, balance-sheet, and cash-flow figure is sourced from a Capital IQ vendor export (source-hierarchy tier 5, §4), not from the audited/regulatory filing itself. This does not trip the module's "only CIQ exports, no filing AND no transcript" downgrade trigger (a verbatim transcript is present), but every downstream agent must cite these numbers as Capital IQ exports — never as "10-K" or "10-Q" — and should flag this gap in its own evidence notes.
  - No investor presentation / earnings deck is in the pool.
  - The two "EstimatesReport" workbooks are exact duplicates; treat as one source, not two.



---

## earnings / 01_historical-financials.md

_Source: `01_historical-financials.md`_

# Historical Financials — UBER

**Reporting standard:** US GAAP. **Currency:** USD, in millions unless per-share. **Fiscal year end:** December 31. **Source caveat (carried from `00_earnings-data-triage.md`):** no primary SEC filing (10-K/10-Q/8-K) is in the data pool. Every income statement, balance sheet, and cash flow figure below is sourced from Capital IQ's vendor transcription of Uber's filings (source-hierarchy tier 5, §4) — cited as "CIQ export," never as "10-K" or "10-Q." The verbatim Q2 FY2026 earnings-call transcript (Aug-05-2026) is a primary call record and is cited as such.

**A note on EBITDA definitions, used throughout this report:** two different EBITDA series appear in the data pool and they are NOT the same number. (1) **Reported/GAAP-based EBITDA** = Operating Income + Depreciation & Amortization, a CapIQ-standardized calculation built directly off GAAP income-statement lines [Financials.xls, Income Statement tab, "EBITDA" supplemental row]. (2) **Adjusted EBITDA (company-defined, non-GAAP)** = the metric Uber itself guides to and discloses by segment — it adds back stock-based compensation and other items [Financials.xls, Segments tab, "Total EBITDA" row; Estimates Report, Guidance/Surprise tabs]. The Annual and Quarterly tables below use **Adjusted EBITDA** as the primary EBITDA line, because it is the metric the company guides to, the market tracks, and the only one available at quarterly granularity with full cross-checks to reported segment and guidance totals. The Reported/GAAP EBITDA is shown for FY2025/LTM in Section 4 for reconciliation. Every EBITDA cell in Sections 1–3 is labeled "Adj. EBITDA."

## 1. Annual Financial Table (5 years)

Currency: USD millions, except per-share items. All figures per CIQ export of Uber's audited annual filings, "Latest Filings" restatement basis.

| Metric | FY2021 | FY2022 | FY2023 | FY2024 | FY2025 | Trend |
|---|---:|---:|---:|---:|---:|---|
| Revenue | 17,455 | 31,877 | 37,281 | 43,978 | 52,017 | Stable (last 3 yrs: 17.0% / 18.0% / 18.3% YoY — see note) |
| Revenue YoY % | n/a | +82.6% | +17.0% | +18.0% | +18.3% | — |
| Gross Profit | 6,227 | 9,805 | 13,835 | 16,495 | 20,025 | Inflecting |
| Gross Margin % | 35.67% | 30.76% | 37.11% | 37.51% | 38.50% | Inflecting (margin compressed FY22, expanded every year since) |
| Adj. EBITDA (company-defined) | -774 | 1,713 | 4,052 | 6,484 | 8,730 | Inflecting |
| Adj. EBITDA Margin % | -4.43% | 5.37% | 10.87% | 14.74% | 16.78% | Inflecting (loss to profit FY22, expansion decelerating: +980bps/+550bps/+387bps/+204bps) |
| EBIT (Operating Income) | -3,834 | -1,832 | 1,110 | 2,799 | 5,565 | Inflecting |
| EBIT Margin % | -21.97% | -5.75% | 2.98% | 6.36% | 10.70% | Inflecting |
| EPS (diluted, GAAP) | -0.28 | -4.65 | 0.87 | 4.56 | 4.73 | Volatile (see §4 — FY24/FY25 inflated by one-time tax benefits) |
| CFO | -445 | 642 | 3,585 | 7,137 | 10,099 | Stable (strong growth, decelerating rate: +244%/+458%/+99%/+42%) |
| Capex | -298 | -252 | -223 | -242 | -336 | Stable |
| FCF (CFO − \|Capex\|) | -743 | 390 | 3,362 | 6,895 | 9,763 | Stable |
| Working Capital (CA − CL) | -205 | 396 | 1,843 | 769 | 1,673 | Volatile |
| Net Debt (strict: total debt − cash & equiv.) | -4,050 (net cash) | 5,229 | 2,894 | -647 (net cash) | 76 | Volatile |
| Net Debt / Adj. EBITDA | N/M (Adj. EBITDA negative) | 3.05x | 0.71x | net cash | 0.01x | Volatile |

Evidence: Revenue, Gross Profit, EBIT, EPS [1]; Adj. EBITDA [2]; CFO, Capex, FCF [3]; Working capital, Net debt [4]. FY2022 revenue growth of 82.6% reflects the post-COVID demand recovery off a depressed FY2021 base — a one-time base-effect distortion, not a repeatable growth rate. Revenue trend column reflects the tight, stable 17.0–18.3% band across FY2023–FY2025 following that base-effect year.

## 2. TTM Snapshot

Latest TTM = LTM period ended Jun-30-2026 (CIQ "Press Release Jun-30-2026" column). Prior TTM = period ended Jun-30-2025, reconstructed as FY2024 full year minus FQ1+FQ2 2024 actuals plus FQ1+FQ2 2025 actuals (all four component quarters cross-checked: each pair sums exactly to its respective audited annual total). EBITDA row uses Adj. EBITDA per the definition note above; GAAP-based EBITDA is not independently reconstructable at quarterly granularity from this pool and is not shown here (see §4 for the FY2025/LTM point comparison only).

| Metric | Latest TTM (Jun-26) | Prior TTM (Jun-25) | Change | Evidence |
|---|---:|---:|---:|---|
| Revenue | 55,227 | 47,331 | +16.7% | [1][5] |
| Adj. EBITDA | 10,043 | 7,519 | +33.6% | [2][5] |
| EBIT | 6,700 | 4,509 | +48.6% | [1][5] |
| EPS diluted (GAAP) | 4.58 | ~5.86 (approx.)* | ~-21.8%* | [1][5] |
| CFO | 10,424 | 8,789 | +18.6% | [3][5] |
| Capex | -308 | -249 | +23.7% (higher spend) | [3][5] |
| FCF | 10,116 | 8,540 | +18.5% | calc. |
| Net debt at latest period-end (strict) | 9,340 (Jun-30-2026) | 3,816 (Jun-30-2025, per CIQ) | +5,524 | [4][6] |

\* Prior-TTM EPS is an approximation (sum of four quarterly diluted-EPS actuals), not an exact recombination — diluted EPS does not sum cleanly across quarters because the diluted share count moves each quarter. The apparent EPS decline is driven almost entirely by a large one-time tax benefit recognized in the FQ3 2024–FQ2 2025 window that will not recur at the same scale; see §4 for the reported-vs-normalized reconciliation, which shows the underlying (normalized) EPS trend rising, not falling.

FCF = CFO − |Capex| in both periods, per module calculation standard.

Management corroboration: "trailing 12-month free cash flow exceeding $10 billion for the first time in our history" [7] — consistent with the $10,116mm computed above.

## 3. Latest Quarterly Trend Table (8 quarters)

Currency: USD millions except EPS and margin %. Gross Margin % source note: see flag below the table.

| Metric | FQ3'24 | FQ4'24 | FQ1'25 | FQ2'25 | FQ3'25 | FQ4'25 | FQ1'26 | FQ2'26 | QoQ Trend | YoY vs Same Q |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---|---|
| Revenue | 11,188 | 11,959 | 11,533 | 12,651 | 13,467 | 14,366 | 13,203 | 14,191 | Volatile (Q1 seasonal dip both years) | Decelerating — +20.4%/+20.4%/+13.8%/+18.2%/+20.4%/+20.1%/+14.5%/+12.2% |
| Gross Margin %* | 39.57% | 39.51% | 39.85% | 39.84% | 39.79% | 39.57% | 45.03% | 44.93% | Inflecting (step-change FQ1'26) | n/a — see flag |
| Adj. EBITDA | 1,690 | 1,842 | 1,868 | 2,119 | 2,256 | 2,487 | 2,481 | 2,819 | Stable, steady growth | Decelerating but still strong — +54.8%/+43.6%/+35.2%/+35.0%/+33.5%/+35.0%/+32.8%/+33.0% |
| Adj. EBITDA Margin % | 15.11% | 15.40% | 16.20% | 16.75% | 16.75% | 17.31% | 18.79% | 19.86% | Accelerating | Expanding every quarter |
| EPS (diluted, GAAP) | 1.20 | 3.21 | 0.83 | 0.63 | 3.11 | 0.14 | 0.13 | 1.17 | Volatile — swung by one-time tax items each Q4/Q3 | Volatile — not a clean read; see §4 |

Evidence: Revenue, EPS, Adj. EBITDA — all cross-checked to annual totals [Estimates Report, Surprise tab, quarterly actuals for FQ3 2024–FQ2 2026] [8]. Gross Margin % — [Estimates Report, Consensus tab, "Gross Margin %" company-level actual row] [9].

**Flag on quarterly Gross Margin %:** this series shows a sharp, sustained jump from ~39.6% (FQ4'25) to ~45.0% (FQ1'26–FQ2'26) that is NOT corroborated by the annual/LTM GAAP gross-margin trend computed from the Income Statement tab (LTM Jun-30-2026 = 40.75% [1], only +225bps above FY2025's 38.50% — nowhere near a 5+pp jump). Management explains the mechanism on the Q2 FY2026 call: a U.K. mobility business-model change "moves cost from cost of revenue," described by the CFO as "an optical impact" that alone accounts for roughly 400bps of a ~500bps year-on-year mobility take-rate decline this quarter [10]. This is a reclassification effect on reported cost lines, not a genuine gross-margin step-change in cash economics — treat the FQ1'26–FQ2'26 Gross Margin % figures as **not comparable** to prior quarters without adjustment.

## 4. Reported vs Adjusted Metrics

Company does disclose adjusted metrics (Adjusted EBITDA, normalized EPS/net income). Both series are shown below with sourced reconciliation. Per CLAUDE.md §15, adjustments are shown explicitly, not netted silently.

| Metric | Reported Value | Adjusted Value | Adjustment Amount | Adjustment Reason | Evidence |
|---|---:|---:|---:|---|---|
| EBITDA, FY2025 | 6,312 (GAAP-based: Op. Income + D&A) | 8,730 (Adj. EBITDA, company-defined) | +2,418 | Add-back of $1,826mm stock-based compensation [11] explains ~76% of the gap ($1,826mm); remaining ~$592mm is other company-defined non-GAAP add-backs (e.g., legal reserves, restructuring) not individually itemized in this pool | [1][2][11] |
| EBITDA, LTM Jun-26 | 7,474 (GAAP-based) | 10,043 (Adj. EBITDA) | +2,569 | SBC of $1,939mm [11] explains ~75% of the gap; remainder (~$630mm) not itemized in this pool | [1][2][11] |
| EPS (diluted), FY2024 | 4.56 (GAAP) | 0.73 (Normalized) | -3.83 | Reported net income of $9,856mm vs. normalized net income of $1,568mm — an $8,288mm gap driven primarily by a **$5,758mm one-time deferred-tax benefit** (Income Tax Expense line = -5,758, i.e. a tax credit, not a cash tax refund) and a **$1,832mm gain on sale of investments** (equity-stake mark-to-market) | [1][12] |
| EPS (diluted), FY2025 | 4.73 (GAAP) | 1.70 (Normalized) | -3.03 | Reported net income of $10,053mm vs. normalized net income of $3,613mm — a $6,441mm gap, again driven primarily by a **$4,346mm one-time deferred-tax benefit** in the same Income Tax Expense line | [1][12] |

**Why this matters for the earnings baseline:** GAAP net income and diluted EPS in both FY2024 and FY2025 were inflated by multi-billion-dollar, non-cash deferred-tax valuation-allowance releases (a tax benefit, not operating performance). The reported EPS series (-0.28 → -4.65 → 0.87 → 4.56 → 4.73) is not a clean read of Uber's operating trajectory; the normalized EPS series (-1.48 → -0.67 → 0.06 → 0.73 → 1.70) — which strips these one-offs and investment mark-to-market swings — shows a much steadier, monotonically improving trend and is the more reliable series for judging earnings quality. This is flagged here for the downstream `06_earnings-quality` agent, not resolved further — that is out of this agent's scope.

## 5. Quarterly Seasonality Table (FY2023–FY2025)

All three fiscal years' quarterly revenue sum exactly to their respective audited annual totals (cross-checked). No quarter exceeds 30% or falls below 20% of annual revenue — seasonality is present but mild.

| Quarter | FY2023 Rev Share | FY2024 Rev Share | FY2025 Rev Share | Avg Rev Share | FY2023 Adj. EBITDA Margin | FY2024 Adj. EBITDA Margin | FY2025 Adj. EBITDA Margin |
|---|---:|---:|---:|---:|---:|---:|---:|
| Q1 | 23.67% | 23.04% | 22.17% | 22.96% | 8.63% | 13.64% | 16.20% |
| Q2 | 24.76% | 24.33% | 24.32% | 24.47% | 9.92% | 14.67% | 16.75% |
| Q3 | 24.92% | 25.44% | 25.89% | 25.42% | 11.75% | 15.11% | 16.75% |
| Q4 | 26.65% | 27.19% | 27.62% | 27.15% | 12.91% | 15.40% | 17.31% |

Evidence: quarterly revenue and Adj. EBITDA actuals for FY2023–FY2025, each quarter cross-checked to sum to the audited annual total [8]. Pattern: Q1 is consistently the seasonally softest quarter (~23% of annual revenue, ~lowest EBITDA margin of the year); Q4 is consistently the strongest (~27% of revenue, highest margin of the year). This pattern holds in all three years and is widening slightly year over year (Q1 share falling from 23.67% to 22.17%, Q4 share rising from 26.65% to 27.62%), consistent with a business gaining operating leverage into the holiday-season peak.

## 6. Key Trend Summary

Revenue growth is decelerating at the margin: after the FY2022 post-COVID base-effect spike (+82.6%) and three stable years around 17–18% (FY2023–FY2025), the two most recent quarters (FQ1'26 +14.5% YoY, FQ2'26 +12.2% YoY) are the two slowest prints in the last eight quarters, a pattern corroborated by the pool's news-digest headline "Uber Technologies reports moderating growth, issues soft forecast" [13] — though gross bookings still grew 22% YoY in FQ2'26 per management [7], so part of the revenue deceleration is a take-rate/mix effect (see the UK business-model reclassification flag in §3), not purely a demand slowdown. Margins are clearly expanding — Adj. EBITDA margin has risen every single quarter for at least two years (15.11% → 19.86% from FQ3'24 to FQ2'26) — but the pace of annual margin expansion is decelerating (+980bps in FY2022 down to +141bps LTM), a normal pattern as a business scales toward maturity. Seasonality is real but mild: Q1 is the softest quarter (~23% of annual revenue) and Q4 the strongest (~27%) in every one of the last three fiscal years, with no single quarter exceeding the 30%/20% flag thresholds. The single biggest inflection in the last five years is FY2022→FY2023: Adj. EBITDA flipped from a $774mm loss to a $1,713mm profit and has expanded every year since, while GAAP EBIT flipped from a $1,832mm loss to a $1,110mm profit the following year (FY2023) — a durable operating turnaround. Separately, reported GAAP net income and EPS in FY2024 and FY2025 are not a clean read of the operating trend: both years carried multi-billion-dollar one-time deferred-tax benefits ($5,758mm and $4,346mm respectively) that inflated GAAP EPS well above the normalized EPS series (§4) — the historical baseline the rest of this module should use for cash-backed earnings quality is CFO/FCF and Adj. EBITDA, not headline GAAP EPS.

## 7. Citations

[1] CIQ export — Uber Technologies Inc NYSE UBER Financials.xls, Income Statement tab (annual FY2021–FY2025 + LTM "Press Release Jun-30-2026" column)
[2] CIQ export — Uber Technologies Inc NYSE UBER Financials.xls, Segments tab, "Total EBITDA" row (FY2020–FY2025, company-defined Adjusted EBITDA)
[3] CIQ export — Uber Technologies Inc NYSE UBER Financials.xls, Cash Flow tab (annual FY2021–FY2025 + LTM "Press Release Jun-30-2026" column)
[4] CIQ export — Uber Technologies Inc NYSE UBER Financials.xls, Balance Sheet tab (FY2021–FY2025 year-end + "Press Release Jun-30-2026" column), "Net Debt" and current asset/liability rows
[5] Calc. — TTM figures reconstructed from CIQ Estimates Report Surprise/Consensus tab quarterly actuals per the TTM Rule (latest four reported quarters); component quarters cross-checked to sum exactly to their respective CIQ-reported annual totals
[6] CIQ export — UberTechnologies,IncNYSEUBEREstimatesReport (1).xls, Surprise tab, "Net Debt" quarterly actual row, FQ2 2025 announced 2025-08-06
[7] Uber Technologies, Inc., Q2 2026 Earnings Call transcript, Aug-05-2026, CEO Dara Khosrowshahi prepared remarks (verbatim, S&P Global Market Intelligence transcript)
[8] CIQ export — UberTechnologies,IncNYSEUBEREstimatesReport (1).xls, Surprise tab, "Revenue," "EBITDA," and "EPS (GAAP)" quarterly actual rows, FQ1 2019–FQ2 2026
[9] CIQ export — UberTechnologies,IncNYSEUBEREstimatesReport (1).xls, Consensus tab, "Gross Margin %" company-level actual row, Fiscal Quarters section
[10] Uber Technologies, Inc., Q2 2026 Earnings Call transcript, Aug-05-2026, CFO Balaji Krishnamurthy, Q&A (verbatim)
[11] CIQ export — Uber Technologies Inc NYSE UBER Financials.xls, Income Statement tab, "Stock-Based Comp., Total" supplemental row (FY2025: 1,826; LTM: 1,939)
[12] CIQ export — Uber Technologies Inc NYSE UBER Financials.xls, Income Statement tab, "Income Tax Expense," "Gain (Loss) On Sale Of Invest.," and "Normalized Net Income" supplemental rows
[13] UberTechnologiesIncNYSEUBER_CIQReportLandscape.rtf, dated news-digest entry, Aug-05/06-2026 — Web/vendor news digest, dated and labeled unverified per source-hierarchy tier



---

## earnings / 02_revenue-drivers.md

_Source: `02_revenue-drivers.md`_

# Revenue Drivers — UBER

## 1. Segment Decomposition Status

Segment decomposition applied — 3 segments (Mobility, Delivery, Freight) from the business-model module's `03_segment-map.md`, cross-checked against this agent's own read of the same Capital IQ segment tab. Two caveats carry forward from that module and from `00_earnings-data-triage.md`:

1. The segment P&L (`Uber Technologies Inc NYSE UBER Financials.xls`, Segments tab) is **annual-only, through FY2025** — there is no interim/LTM segment column, so it is roughly two quarters stale versus the Jun-30-2026 period covered by the historical-financials baseline. Per the Score Cap Rules in `MODULE_RULES.md`, this caps earnings clarity at max 70 for the current-quarter mix-shift read specifically; the annual-period segment reads below are not affected by that cap.
2. `business-model/02_business-identity.md §3a` already classified Uber against `frameworks/SECTOR_OVERLAYS.md` and found no matching row: *"No sector overlay for multi-sided take-rate marketplace (ride-hailing / delivery / freight brokerage) — generic read."* This agent applies the same generic "Generic operating company" KPI grammar (volume, price/mix, order book, segment mix) rather than inventing a bespoke marketplace overlay, and inherits the same flagged gap: **Gross Bookings and Monthly Active Platform Consumers (MAPCs) — the two KPIs this business model actually lives or dies by — have no audited, multi-period time series in this pool.** The only Gross Bookings figures available are one-off numbers quoted verbatim by management on the Q2 FY2026 call. Every Gross Bookings figure below is cited to the call, not to a filing, and should be re-verified once the FY2025 10-K itself (filed 2026-02-13, absent from this pool) or an investor deck is added.

## 2. Revenue Driver Tree

| Business Type | Revenue Formula |
|---|---|
| Multi-segment (marketplace, closest engine template) | Sum of segment revenue drivers; each segment = Gross Bookings × take rate |

**Uber's specific formula:** Revenue = Σ over {Mobility, Delivery, Freight} of (Gross Bookings in that segment × the commission/take rate Uber keeps), where Gross Bookings itself = trips or orders × average fare/basket value. Uber does not own the cars, restaurants, or trucks that move through the marketplace — it owns the matching software and payment rails and keeps a cut of each transaction [`business-model/02_business-identity.md`, §1, citing Financials.xls Segments tab FY2025 and Q2 FY2026 transcript prepared remarks]. This means two separate levers move revenue independently: how much transaction volume flows through the platform (Gross Bookings), and what slice of that volume Uber keeps (take rate) — and, as Section 6 shows, those two levers moved in very different directions this quarter.

## 3. Market / Share / Price / Mix Split

| Driver Bucket | Current Direction | Evidence | Importance /100 |
|---|---|---|---:|
| End-market demand | Improving | Gross bookings grew 22% year-on-year to more than $58 billion in Q2 FY2026, above the high end of guidance and "marking our fourth consecutive quarter of growth above 20%" [Q2 2026 transcript, prepared remarks, Dara Khosrowshahi]. In the U.S., less than 10% of eligible consumers in sparse markets have used Uber in the past 12 months versus over 50% in dense markets — a long, largely un-penetrated demand pool by management's own account [Q2 2026 transcript, Q&A, Eric Sheridan question, Balaji Krishnamurthy] | 85 |
| Company market share | Mixed | In Brazil, management says Uber "continue[s] to hold our share" in mobility even as DiDi Food and Meituan's iFood escalate delivery competition and bid up 2-wheeler driver supply, which is "affecting those trip volumes" in Mobility [Q2 2026 transcript, Q&A, Doug Anmuth question, Dara Khosrowshahi]. In markets with an active AV product, "our category position in these markets is actually higher today than it was a year ago" [Q2 2026 transcript, Q&A, Nikhil Devnani question, Dara Khosrowshahi] | 40 |
| Price / realization | Deteriorating (headline) | Mobility's revenue take rate declined nearly 500 basis points year-on-year; the CFO states "about 400 basis points is entirely related to this U.K. business model change," calling it "an optical impact" that "moves cost from cost of revenue" rather than a real economic change — the remaining ~100bps reflects genuine, deliberate investment in lower-cost products (e.g. Moto in Brazil) [Q2 2026 transcript, Q&A, Justin Post question, Balaji Krishnamurthy] | 70 |
| Product / customer / geography mix | Mixed | Lower-cost products (Wait & Save, 2- and 3-wheelers) are "growing very, very quickly" and pull down average revenue per trip while widening the user base; higher-margin enterprise products pull the other way — Uber for Business (U4B) grew 40% year-on-year and Uber Health "is growing even faster" [Q2 2026 transcript, Q&A, Eric Sheridan question, Dara Khosrowshahi] | 55 |
| FX translation | Unclear | ~49% of FY2025 revenue was booked outside the U.S. and Canada (EMEA $16,364mm + LATAM $3,327mm + APAC $5,857mm of $52,017mm total) [`business-model/10_external-dependency.md`, citing Financials.xls Segments tab FY2025]. On the call, an analyst stated bookings "were up 22% constant currency, revenues up 19%" [Q2 2026 transcript, Q&A, Justin Post question] — **this "19%" figure does not reconcile with the CIQ-sourced reported revenue growth of +12.2% YoY for the same quarter** [`earnings/01_historical-financials.md`, §3, Row: Revenue]. This gap is flagged, not resolved: it may reflect a different metric (e.g. a constant-currency revenue figure not disclosed elsewhere in this pool), an analyst misstatement live on the call, or something this agent cannot reconcile from available data. No FX sensitivity table exists in the pool [`business-model/10_external-dependency.md`, §2] | 35 |
| M&A / divestitures | Deteriorating this quarter, structurally important going forward | Delivery's reported growth carries a net M&A headwind this quarter: the Trendyol Go acquisition (closed back half of June 2025) is still in the year-ago comparison base and only laps in Q3 FY2026; the newly closed Getir acquisition and a smaller Careem reconsolidation are "putting a couple of puts and takes there," but "on the whole, it is a headwind to delivery reported growth on a net basis... because Trendyol Go was a lot larger in size than the 2 acquisitions" [Q2 2026 transcript, Q&A, Ross Sandler question, Balaji Krishnamurthy]. Separately, the pending Delivery Hero acquisition (announced this quarter, expected to close in the second half of 2027) would roughly double the number of markets where Uber offers its full mobility-and-delivery platform — a major future inorganic driver, not yet reflected in reported revenue [Q2 2026 transcript, prepared remarks, Dara Khosrowshahi] | 45 |

Growth attributable to M&A (Getir, Careem, the pending Delivery Hero deal) or to a divestiture lapping (Trendyol Go) must not be described as organic demand — it is flagged as inorganic in every table below.

## 4. Revenue Driver Table (Consolidated)

| Driver | Current Level | Direction | Magnitude | Evidence |
|---|---|---|---|---|
| Gross Bookings (trip/order volume) | >$58bn in Q2 FY2026, +22% YoY; fourth straight quarter above 20% growth | Improving | High | "Gross bookings grew 22% year-on-year to more than $58 billion... marking our fourth consecutive quarter of growth above 20%" [Q2 2026 transcript, prepared remarks, Dara Khosrowshahi] |
| Take rate / price realization | Mobility take rate down ~500bps YoY; ~400bps is a U.K. accounting reclassification, ~100bps is deliberate low-cost-product mix | Deteriorating (headline), but ~80% is non-economic | High | "About 400 basis points is entirely related to this U.K. business model change, and it's an optical impact" [Q2 2026 transcript, Q&A, Justin Post question, Balaji Krishnamurthy] |
| Product / geographic mix | Shift toward Wait & Save, 2-/3-wheelers, and sparse-market build-out; offset partly by high-margin U4B (+40% YoY) and Uber Health | Mixed (broadens the base, dilutes average revenue per trip) | Mid | [Q2 2026 transcript, Q&A, Eric Sheridan question, Dara Khosrowshahi and Balaji Krishnamurthy] |
| FX translation | ~49% of FY2025 revenue booked outside U.S./Canada; specific quarter impact unresolved (see §3) | Unclear | Mid | [`business-model/10_external-dependency.md`, §1; Q2 2026 transcript, Q&A, Justin Post question] |
| M&A / divestitures (Delivery) | Trendyol Go still in base (headwind, laps Q3 FY2026); Getir + Careem reconsolidation (smaller offset); Delivery Hero pending, expected close 2H2027 | Mixed — near-term net headwind, large future step-change if Delivery Hero closes | Mid now / High post-close | [Q2 2026 transcript, Q&A, Ross Sandler question, Balaji Krishnamurthy; prepared remarks] |
| Regulatory / policy-driven volume and pricing | U.K. mobility business-model change already cut reported take rate; driver/worker-classification and insurance regulation remain live, city-by-city and state-by-state | Deteriorating (net drag on reported revenue optics; unresolved classification risk) | Mid | "We are a highly regulated business... concerns about job loss... safety... congestion" [Q2 2026 transcript, Q&A, John Colantuoni question, Dara Khosrowshahi]; U.K. reclassification detail above |
| New product launches / cross-platform expansion | Wait & Save, U4B (+40% YoY), Uber Health, Uber Teens, Women Preferred; only 20% of consumers use both Rides and Eats, growing 1.5x faster than single-product users | Improving | Mid | [Q2 2026 transcript, Q&A, Eric Sheridan question, Dara Khosrowshahi] |
| AV commercialization (utilization) | AVs doing "hundreds of thousands of trips per week," under 0.5% of total trip volume; live in 7 cities, targeting 15 by year-end | Improving off a tiny base | Low today, potential High longer-term | "It's even less than 0.5% of our total trip volume" [Q2 2026 transcript, Q&A, Doug Anmuth question, Dara Khosrowshahi] |

Utilization/capacity, order-book/backlog, store count, commodity price, and contract-renewal drivers are not applicable to Uber's spot-transaction marketplace model and are excluded per the "only relevant drivers" instruction (confirmed by `business-model/02_business-identity.md §3a`: "Order book / backlog — Not applicable to this business model").

## 5. Revenue Drivers By Segment

### Segment: Mobility (57.0% of FY2025 revenue, $29,670mm of $52,017mm; 90.5% of FY2025 total-company EBITDA) [`business-model/03_segment-map.md`, §1, citing Financials.xls Segments tab FY2025]

| Driver | Current Level | Direction | Magnitude | Evidence |
|---|---|---|---|---|
| Trip/bookings volume, U.S. | Accelerating; trip growth in San Francisco, L.A., and Phoenix accelerated in Q2 versus Q1 | Improving | High | "Our trip growth in San Francisco, L.A. and Phoenix accelerated in Q2 versus Q1" [Q2 2026 transcript, Q&A, Nikhil Devnani question, Dara Khosrowshahi] |
| Insurance-cost tailwind, reinvested into pricing | Insurance "becoming a tailwind this year," savings reinvested rather than banked, particularly in California | Improving (but reversible — see §6/Cycle note) | Mid | "Insurance... is becoming a tailwind this year. We are reinvesting the savings back into the market... in L.A. and SF, our trip growth, for example, meaningfully outpaced the rest of the country" [Q2 2026 transcript, Q&A, Eric Sheridan question, Balaji Krishnamurthy] |
| Take rate | Down ~500bps YoY; ~400bps a U.K. accounting reclassification, not economic | Deteriorating (headline only) | High | See §3/§4 above |
| Sparse-market penetration | <10% of eligible U.S. sparse-market consumers used Uber in the past 12 months vs. >50% in dense markets | Improving (long runway) | Mid | [Q2 2026 transcript, Q&A, Eric Sheridan question, Balaji Krishnamurthy] |
| Brazil competitive intensity | New delivery entrants (DiDi Food, Meituan's iFood) bidding up 2-wheeler driver supply, diverting it from Mobility to Delivery; share held, but trip volumes hurt | Deteriorating (localized) | Low–Mid | [Q2 2026 transcript, Q&A, Doug Anmuth question, Dara Khosrowshahi] |
| World Cup one-time boost | Contributed to U.S. mobility acceleration this quarter | Non-run-rate — do not extrapolate | Low–Mid, one-time | "The World Cup definitely was a benefit, but it was as expected to a large extent" [Q2 2026 transcript, Q&A, Eric Sheridan question, Balaji Krishnamurthy] |
| AV commercialization | <0.5% of trip volume; live in 7 cities, 15 by year-end | Improving off tiny base | Low today | See §4 above |

### Segment: Delivery (33.2% of FY2025 revenue, $17,248mm of $52,017mm; 40.9% of FY2025 total-company EBITDA) [`business-model/03_segment-map.md`, §1]

| Driver | Current Level | Direction | Magnitude | Evidence |
|---|---|---|---|---|
| Organic order/bookings growth | "Very strong trends in the U.S.... continuing to see very, very strong trends internationally as well. We gained category position in all of our large markets" | Improving | High | [Q2 2026 transcript, Q&A, Ross Sandler question, Balaji Krishnamurthy] |
| Take rate | "Largely stable" (unlike Mobility) | Stable | Mid | "If you were to look at our revenue margin for delivery, it's largely stable" [Q2 2026 transcript, Q&A, Justin Post question, Balaji Krishnamurthy] |
| M&A / divestiture mix | Trendyol Go still in year-ago base (headwind, laps Q3 FY2026); Getir (closed this month) and Careem reconsolidation are smaller, partial offsets | Deteriorating on a reported basis this quarter, though management frames it as "an organic acceleration and inorganic handoff from a large acquisition to a small one" | Mid | [Q2 2026 transcript, Q&A, Ross Sandler question, Balaji Krishnamurthy] — this is inorganic mix, not underlying demand, and is labelled as such |
| Pending Delivery Hero acquisition | Announced this quarter; expected to close 2H2027; would extend the platform to nearly 100 markets, roughly doubling reach | Not yet in the base — future step-change, purely inorganic | High if it closes, zero today | "Our recently announced agreement to acquire Delivery Hero... extend[s] the proven strategy... by roughly doubling the number of markets where we can offer the full power of our platform" [Q2 2026 transcript, prepared remarks, Dara Khosrowshahi] |
| Brazil competitive intensity | New entrants (DiDi Food) and incumbent (iFood) raising delivery-driver acquisition costs; incentives shifted toward delivery side | Mixed (drives Delivery volume, at a margin cost — see `03_margin-drivers`) | Low–Mid | [Q2 2026 transcript, Q&A, Doug Anmuth question, Dara Khosrowshahi] |

### Segment: Freight (9.8% of FY2025 revenue, $5,099mm of $52,017mm; -0.4% of FY2025 total-company EBITDA — immaterial to profit) [`business-model/03_segment-map.md`, §1]

Freight was not discussed anywhere on the Q2 FY2026 earnings call — no management commentary on freight-market conditions, volumes, or pricing appears in the transcript. This is a real gap, not an inference: *"Not proven from available data"* for any Q2 FY2026-specific Freight driver read. The only evidence available is the stale FY2025 annual segment data already captured in `business-model/03_segment-map.md`: Freight revenue fell from a FY2022 peak of $6,947mm to $5,099mm in FY2025 (-27% over three years), tracking the broader trucking-freight recession, with segment EBITDA negative or flat-to-breakeven in five of the last six disclosed fiscal years [`business-model/03_segment-map.md`, §1, citing Financials.xls Segments tab]. Direction as of the latest available (FY2025 annual) data: **Deteriorating / trough**, magnitude Low given the segment's ~10% revenue share and near-zero EBITDA contribution.

## 6. Revenue Growth Decomposition

FQ2 FY2026 reported revenue growth was +12.2% YoY ($14,191mm vs. $12,651mm) [`earnings/01_historical-financials.md`, §3]. Gross Bookings grew +22% YoY over the same period [Q2 2026 transcript, prepared remarks, Dara Khosrowshahi]. That ~10-percentage-point gap between bookings growth and revenue growth is the single most important number in this section, and the pool does not allow it to be cleanly split into precise percentage-point contributions:

| Component | Contribution to Growth (pp) | Evidence |
|---|---:|---|
| Volume (Gross Bookings growth) | Directionally the dominant positive driver (+22% YoY bookings) | [Q2 2026 transcript, prepared remarks] |
| Take rate / price (mostly Mobility) | Directionally the dominant negative driver, closing most of the bookings-to-revenue gap; ~400bps of Mobility's ~500bps YoY take-rate decline is a U.K. accounting reclassification, not a real price cut, and the remaining ~100bps is a deliberate low-cost-mix investment | [Q2 2026 transcript, Q&A, Justin Post question, Balaji Krishnamurthy] |
| Mix | Not separately quantified from take rate in this pool — the low-cost-product mix effect (Wait & Save, Moto) overlaps with the price/take-rate line above and cannot be cleanly isolated from it | Inference, not from filings |
| FX | Not resolvable — an analyst's live-call statement ("bookings 22% constant currency, revenues up 19%") does not reconcile with the CIQ-sourced +12.2% reported revenue figure for the same quarter; no FX sensitivity table exists in the pool | [Q2 2026 transcript, Q&A, Justin Post question]; `business-model/10_external-dependency.md`, §2: "Not proven from available data" |
| Acquisitions / divestitures | Net headwind this quarter (Trendyol Go still in Delivery's base; Getir/Careem too small/late to offset), not separately quantified in dollar or pp terms in this pool | [Q2 2026 transcript, Q&A, Ross Sandler question, Balaji Krishnamurthy] |
| Other | Not itemized | — |
| Total revenue growth | +12.2% (actual, reported) | [`earnings/01_historical-financials.md`, §3] |

**What's missing:** the pool contains no line-item bridge (e.g., a management-disclosed "bookings-to-revenue" waterfall or a 10-Q MD&A reconciliation) that would let this agent assign a specific number of percentage points to take rate versus mix versus FX versus M&A. The qualitative direction of each component is well evidenced by the transcript; the precise arithmetic split is not. This is flagged rather than estimated with false precision, per CLAUDE.md §9/§15.

## 7. The Single Biggest Revenue Driver

The single biggest driver of Uber's revenue over the next 3–12 months is **Mobility Gross Bookings growth (trip volume)** — not the take-rate/mix effects that dominate the headline growth-rate story in Section 6. Mobility is 57% of consolidated revenue and 90.5% of total-company EBITDA [`business-model/03_segment-map.md`, §2], so a 10–20% swing in Mobility trip volume — up or down — moves total-company revenue by roughly that same order of magnitude, dwarfing the ~1 percentage-point-scale effects of take-rate mix shifts or FX. The current direction is improving: gross bookings grew 22% year-on-year company-wide for a fourth straight quarter above 20%, U.S. trip growth in San Francisco, L.A., and Phoenix accelerated quarter-on-quarter, and management describes a broad, multi-year set of levers behind it — insurance-savings reinvestment, sparse-market build-out (still under 10% penetrated in the U.S.), and new lower-cost products bringing in first-time users — that it characterizes as durable rather than one-off [Q2 2026 transcript, prepared remarks and Q&A, Balaji Krishnamurthy, Dara Khosrowshahi]. The one real caveat is that part of this quarter's U.S. acceleration was flattered by the World Cup, a labelled one-time event management itself says was "as expected" and should not be extrapolated forward [Q2 2026 transcript, Q&A, Eric Sheridan question, Balaji Krishnamurthy], and that the Brazil market shows the same volume driver can turn negative when a competitor bids up driver supply.

**Cycle-position note (Cycle-Position Rule):** Mobility and Delivery carry Mid external-dependency on the consumer cycle [`business-model/10_external-dependency.md`, §1] but show no visible multi-year downturn in this pool comparable to FY2020's COVID trough — the current run of four consecutive quarters above 20% bookings growth reads as an expansion, not a peak or a trough, though this agent has no multi-year bookings series to confirm that beyond management's own quarterly framing. Freight, by contrast, is clearly in a multi-year trough: revenue is down 27% from its FY2022 peak of $6,947mm to $5,099mm in FY2025, tracking the broader trucking-freight recession [`business-model/03_segment-map.md`, §1]. Two items in the current print are explicitly one-time or reversible and must not be treated as run-rate: the World Cup boost to U.S. mobility (labelled above), and the insurance-cost "tailwind" being reinvested into growth rather than banked — a cost line set by state insurance/tort regimes that "could reverse if litigation/insurance costs turn back up" [`business-model/10_external-dependency.md`, §1].



---

## earnings / 03_margin-drivers.md

_Source: `03_margin-drivers.md`_

# Margin Drivers — UBER

**Data-pool caveat (carried from `01_historical-financials.md` and `00_earnings-data-triage.md`):** no primary SEC filing (10-K, 10-Q, 8-K/press release) is present in this pool. Every income-statement, cost-line, and segment figure below is a Capital IQ vendor transcription of Uber's filings (source-hierarchy tier 5, §4) — cited as "CIQ export," never as "10-K"/"10-Q." The Q2 FY2026 earnings-call transcript (Aug-05-2026, S&P Global Market Intelligence) is a verbatim primary call record and is cited as such — full trust applies to management commentary; no sell-side proxy was needed.

## 1. Segment Decomposition Status

Business-model `03_segment-map.md` is available and used. Uber is **not** a single-segment company under the >85% threshold: Mobility is 57.0% of FY2025 revenue but Delivery is a real second segment at 33.2% (Freight, 9.8%, is immaterial to profit). Segment-level P&L (revenue and EBITDA) is disclosed for all three segments, but **only at annual granularity** (FY2020–FY2025) — no interim/LTM segment column exists in this pool, so the segment table is stale by roughly two quarters relative to the Jun-30-2026 period-end [Uber Technologies Inc NYSE UBER Financials.xls, Segments tab, FY2025 column; `00_earnings-data-triage.md`, §5]. Per the module's partial-data rule, this caps the **current-quarter** mix-shift read at Earnings clarity max 70; the FY2025-vs-FY2024 annual segment decomposition below is not subject to that cap. Sections 5 and 6 below decompose drivers at both consolidated and segment level using the annual segment table plus the verbatim Q2 FY2026 transcript for the more current (but qualitative-only) quarter read.

## 2. Sector Overlay

Per business-model `02_business-identity.md` §3a: Uber's classified type — a multi-sided, take-rate transaction marketplace (ride-hailing / on-demand delivery / freight brokerage) — **does not match any row in `frameworks/SECTOR_OVERLAYS.md`** (bank, REIT, SaaS, miner, insurer, oil & gas, retail, telecom, asset manager, pharma). **No sector overlay for multi-sided take-rate marketplace — generic cost stack applies.** The margin analysis below therefore uses the generic candidate list (COGS/take-rate, SG&A, R&D, D&A, segment mix, operating leverage) rather than a sector-specific grammar.

## 3. Cost Stack

Currency: USD millions. Reporting standard: US GAAP. All figures per CIQ export of the Income Statement tab (annual FY2024–FY2025 + LTM Jun-30-2026 column) [Uber Technologies Inc NYSE UBER Financials.xls, Income Statement tab].

| Cost Line | % of Revenue (FY2025 / LTM Jun-26) | Direction | Evidence | Margin Risk |
|---|---:|---|---|---|
| Cost of revenue (COGS — includes driver/courier payments, insurance, incentive spend, payment processing) | 61.50% / 59.25% | Improving (down from 62.49% FY2024) | [Financials.xls, Income Statement tab: COGS $31,992mm FY2025 of $52,017mm revenue; $32,721mm LTM of $55,227mm] | High — this is the single largest cost line and the one management says swings hundreds of bps on take-rate mix, insurance-cost cycles, and reclassifications (§5) |
| Labor (Uber's own corporate payroll) | Not disclosed as a standalone line | — | Driver/courier payments are not company payroll; they sit inside COGS/take-rate. Corporate headcount cost is embedded in SG&A/R&D, not broken out separately | Not separately assessable |
| Freight / logistics (as a cost input to Uber) | Not applicable | — | Uber does not buy freight capacity as an input; Freight is a reported *segment* (a brokerage business), not a cost line — see §6 | n/a |
| Energy / fuel | Not disclosed | — | Drivers/couriers bear fuel cost directly; it does not appear on Uber's own income statement | Low direct exposure, indirect via driver economics/supply (external-dependency `10`, Low–Mid) |
| SG&A | 19.87% / 20.50% | Improving vs FY2024 (22.45%), but LTM ticked up ~63bps above the FY2025 endpoint | [Financials.xls, Income Statement tab: SG&A $10,339mm FY2025; $11,320mm LTM] | Mid — largest disclosed operating-leverage lever; CFO cites AI-driven headcount discipline as the driver (§5) |
| R&D | 6.54% / 6.77% | Improving vs FY2024 (7.07%), LTM ticked up slightly | [Financials.xls, Income Statement tab: R&D $3,402mm FY2025; $3,741mm LTM] | Low–Mid — AV-related R&D sits partly here; AI coding-tool adoption cited as a productivity offset (§5) |
| D&A | 1.38% / 1.35% | Roughly flat | [Financials.xls, Income Statement tab: D&A $719mm FY2025; $745mm LTM] | Low today; flagged as a forward risk once Delivery Hero closes and AV assets are deployed (§9) |
| Interest expense | Gross interest expense $440mm FY2025 / $462mm LTM; but net interest income +$303mm FY2025 / +$278mm LTM (interest & investment income exceeds interest expense) | Stable, net favorable | [Financials.xls, Income Statement tab: Interest Expense, Interest and Invest. Income, Net Interest Exp. rows] | Low today; total debt issued jumped to $6,229mm LTM from $3,359mm FY2025 [Financials.xls, Cash Flow tab] — a forward risk if the Delivery Hero bridge facility draws down (§9) |

**Stock-based compensation (SBC), memo item:** SBC allocated to COGS is small and stable ($218mm FY2024 → $225mm FY2025 → $225mm LTM) [Financials.xls, Income Statement tab, "Stock-Based Comp., COGS" row], but total company SBC is $1,826mm FY2025 / $1,939mm LTM and explains ~75–76% of the gap between GAAP-based EBITDA and company-defined Adjusted EBITDA [`01_historical-financials.md`, §4]. Unlike a SaaS business, this is not scored as a primary margin driver here because Uber is not a sector-overlay SaaS company and SBC sits mostly in SG&A/R&D, not gross margin.

## 4. Gross Margin → EBITDA Margin → EBIT Margin Walk

| Margin Level | FY2025 | FY2024 | Change (bps) | Main Reason | Evidence |
|---|---:|---:|---:|---|---|
| Gross margin | 38.50% | 37.51% | +99 | COGS fell from 62.49% to 61.50% of revenue — a mix of take-rate management and cost-of-revenue efficiency; **not** attributable to the UK reclassification, which is a quarterly, not annual, distortion (see flag below) | [`01_historical-financials.md`, §1; Financials.xls, Income Statement tab] |
| Adj. EBITDA margin (company-defined) | 16.78% | 14.74% | +204 | Broad-based operating leverage across COGS, SG&A, and R&D; pace of expansion is decelerating (+204bps FY2025 vs +387bps FY2024 vs +550bps FY2023) — a normal pattern as the business scales, not a red flag | [`01_historical-financials.md`, §1] |
| EBIT margin (GAAP) | 10.70% | 6.36% | +434 | Full P&L leverage: COGS improvement contributes ≈+99bps, SG&A leverage ≈+255bps, R&D leverage ≈+53bps, D&A ≈+23bps (sums to ≈+430bps, consistent with the +434bps actual change within rounding) — computed directly from disclosed GAAP cost lines, not a vendor-supplied bridge | Calc. from [Financials.xls, Income Statement tab, FY2024/FY2025 columns] |

**Flag — quarterly gross margin is not comparable to this annual walk.** The FQ1'26–FQ2'26 quarterly Gross Margin % jumped from ~39.6% (FQ4'25) to ~45.0% — a 5+ point move the annual/LTM data does not corroborate (LTM Jun-26 gross margin is 40.75%, only +225bps above FY2025's 38.50%). Management attributes ~400bps of a ~500bps YoY Mobility take-rate decline this quarter to a U.K. "business model change" that "moves cost from cost of revenue" — an "optical impact," per the CFO, not a genuine step-change in cash economics [Q2 FY2026 transcript, Q&A, Balaji Krishnamurthy, l.508-519]. Treat quarterly gross-margin prints from FQ1'26 onward as **not comparable** to prior quarters without adjustment [`01_historical-financials.md`, §3, flag].

**Pass-through lag:** no disclosed contractual pass-through lag exists in this pool. Management describes take-rate and incentive-spend adjustments as real-time, discretionary decisions — reallocating incentive spend from consumers to couriers in Brazil within the same quarter, and choosing to reinvest an insurance-cost saving into pricing rather than bank it, in the same year it is realized [`06_value-chain.md`, §2, citing Q2 FY2026 transcript Q&A]. **Not proven from available data:** any specific multi-quarter lag between an input-cost change and a pricing/take-rate response.

## 5. Margin Walk — Which Margin Level Matters Most?

**Adjusted EBITDA margin is the most useful metric for this business**, for three reasons visible in the data. First, it is the metric Uber itself guides to (FQ3 2026 guidance: $2,860mm–$2,960mm) and the metric the market has already re-rated around — Adj. EBITDA consensus revision breadth is strongly positive (net +14 to +28 analysts raising over the last one to three months) even as revenue estimates are being cut [`04_guidance-consensus.md`, §4–§5]. Second, the UK reclassification (§4 flag) shows gross margin can move mechanically on a cost/revenue-recognition change without any change in cash economics, while Adjusted EBITDA margin expanded smoothly through the same quarters (18.79% → 19.86%, FQ1'26 → FQ2'26) with no comparable step-change — meaning EBITDA margin is less distorted by these reclassifications than gross margin is [`01_historical-financials.md`, §3]. Third, EBIT margin is directionally useful but is a capital-light marketplace business where D&A is small (1.4% of revenue) and not a primary swing factor the way it would be for a manufacturer — so the extra EBIT-margin step (below EBITDA) adds less analytical value here than in a capex-heavy business.

## 6. Margin Driver Table (consolidated)

| Driver | Impact on Margins | Direction | Magnitude | Evidence |
|---|---|---|---|---|
| Insurance-cost cycle (embedded in COGS/take-rate) | Currently a cost tailwind, but being fully reinvested into pricing rather than banked — meaning zero current margin buffer if the cycle reverses | Tailwind today / Headwind risk if reversed | High | "Insurance...is becoming a tailwind this year. We are reinvesting the savings from insurance back into the market" [Q2 FY2026 transcript, Q&A, Balaji Krishnamurthy, l.263-264] |
| Driver/courier incentive competition (local markets) | Forces Uber to shift subsidy spend to defend supply rather than hold it as margin | Headwind (localized, could widen) | Mid | In Brazil, "the cost of securing that supply has gone up pretty significantly," forcing incentive reallocation from consumers to couriers [Q2 FY2026 transcript, Q&A, l.334; `06_value-chain.md`, §1] |
| UK "business model change" (regulatory reclassification) | Mechanically shifts ~400bps of Mobility's reported take rate; an accounting/optical effect on gross margin, not an operating-income effect | Neutral to true economics; Headwind to reported gross-margin comparability | High on gross margin optics, Low on EBITDA/EBIT | "About 400 basis points is entirely related to this U.K. business model change, and it's an optical impact" [Q2 FY2026 transcript, Q&A, l.508-512] |
| SG&A leverage (AI-driven headcount discipline) | SG&A fell from 22.45% to 19.87% of revenue FY2024→FY2025, the single largest EBIT-margin contributor in the annual bridge (§4) | Tailwind | High | "We have now shown a track record of being disciplined on headcount addition... AI...should allow us to be moderating some of the headcount additions"; engineering code output per engineer has doubled per management's internal measure [Q2 FY2026 transcript, Q&A, l.401-412] |
| R&D leverage | R&D fell from 7.07% to 6.54% of revenue FY2024→FY2025 | Tailwind | Mid | [Financials.xls, Income Statement tab]; AI productivity commentary as above |
| Segment mix (Mobility growing, high-EBITDA-margin; Freight shrinking, negative-margin) | Mobility (26.6% segment EBITDA margin, up from 19.2% FY2020) is 57% of revenue and 90.5% of total EBITDA; Freight (9.8% of revenue) runs negative-to-breakeven margin and has been shrinking since FY2022 | Tailwind (mix shift toward the higher-margin segment) | High | [`03_segment-map.md`, §1] |
| Premium-tier upsell (Reserve, U4B, Black) | U4B grew 40% YoY — volume/mix growth in a higher-margin product line | Tailwind | Mid | "Higher-margin product like U4B gives us high margins" [Q2 FY2026 transcript, Q&A, l.311]; `06_value-chain.md`, §3 |
| Low-cost product mix (2/3-wheelers, Wait & Save) | Brings in lower-ticket, price-sensitive users; management says margins in the 2-wheeler business "are quite low," though not dilutive to the bottom line yet | Mild headwind on blended take rate, offset by volume | Mid | "The margins in that business are quite low. So it's certainly not hitting the bottom line, but it is affecting trip volumes" [Q2 FY2026 transcript, Q&A, l.339-341] |
| Freight segment cyclicality | Revenue down 27% from a FY2022 peak ($6,947mm) to FY2025 ($5,099mm); EBITDA margin negative or near-breakeven in 5 of the last 6 disclosed years | Headwind, but bounded (≈10% of group revenue, -0.4% of group EBITDA) | Low at consolidated level | [`03_segment-map.md`, Freight row] |
| World Cup one-time volume boost (Q2 2026) | Boosted Mobility volume in the quarter; management calls it "a benefit, but...as expected," i.e. already anticipated and not incremental to plan | Not a margin driver per se, but inflates the operating-leverage base this quarter — label as non-run-rate | Low–Mid | "The World Cup definitely was a benefit, but it was as expected to a large extent" [Q2 FY2026 transcript, Q&A, l.259-260 / external-dependency `10`, Consumer cycle row] |
| Driver/worker classification regulation | A reclassification of gig drivers as employees in a major market would strike at the independent-contractor cost structure across Mobility and Delivery simultaneously | Headwind if triggered (low near-term probability, very high magnitude) | High (tail risk, not base case) | Business-model `10_external-dependency.md`, §5, "Single Biggest Lever"; UK reclass already a live precedent |
| Delivery Hero acquisition (future) | Adds interest expense on the bridge facility and future intangible amortization once the deal closes (H2 2027) and integrates (2028–2029); not yet in the P&L | Headwind, deferred (not yet run-rate) | Unknown magnitude (not yet sized by management) | "There will be a P&L impact, and we'll size that for investors clearly as we have historically done" [Q2 FY2026 transcript, Q&A, l.482-484] — see §9 |

## 7. Margin Drivers By Segment

### Segment: Mobility (57.0% of FY2025 revenue, 90.5% of FY2025 total-company EBITDA)

| Driver | Impact | Direction | Magnitude | Evidence |
|---|---|---|---|---|
| UK take-rate reclassification | Cuts reported Mobility take rate ~400bps YoY; CFO says the *net* take rate disclosed in the 10-Q "will largely show take rate remaining broadly stable" | Neutral on true economics; Headwind on reported optics | High on optics | [Q2 FY2026 transcript, Q&A, l.508-519] |
| Operating income margin (management's preferred Mobility metric) | 7.6% for the quarter, cited by the CFO as "remain[ing] very strong" | Tailwind (stable) | Mid | [Q2 FY2026 transcript, Q&A, l.518-519] |
| Insurance-cost reinvestment (California-specific mention) | Insurance savings reinvested into pricing, particularly in California | Tailwind today / reversal risk | High (largest single line in Mobility economics) | [Q2 FY2026 transcript, Q&A, l.263-267] |
| Segment EBITDA margin trend | 26.6% FY2025, up from 19.2% FY2020, improving every year in between | Tailwind (structural) | High | [`03_segment-map.md`, Mobility row] |

### Segment: Delivery (33.2% of FY2025 revenue, 40.9% of FY2025 total-company EBITDA)

| Driver | Impact | Direction | Magnitude | Evidence |
|---|---|---|---|---|
| Segment EBITDA margin trend | Improved from -22.4% (FY2020) to +20.7% (FY2025) — the segment ran negative EBITDA for its first two disclosed years | Tailwind (structural, still catching up to Mobility) | High | [`03_segment-map.md`, Delivery row] |
| Trendyol Go divestiture | Creates a reported-growth (and by extension, scale/margin-leverage) headwind for Delivery in current-period comparisons | Headwind (reported growth, not underlying economics) | Low–Mid | [`03_segment-map.md`, Delivery row, citing Q2 2026 transcript l.700-701] |
| Courier-incentive competition (Brazil: DiDi Food, Meituan-backed entrants) | Forces incentive-spend reallocation to hold courier supply | Headwind | Mid, localized | [Q2 FY2026 transcript, Q&A, l.327-341] |
| Uber Direct (white-label delivery-as-a-service) and advertising | Not separately quantified in this pool, but flagged by business-identity as a margin-additive product line | Tailwind (unquantified) | Unknown | [`02_business-identity.md`, §1] |
| Delivery Hero acquisition (pending) | Would materially change Delivery's segment mix/geography once closed; not yet reflected in any disclosed segment figure | Unknown (deferred) | Unknown | [`03_segment-map.md`, §3] |

### Segment: Freight (9.8% of FY2025 revenue, -0.4% of FY2025 total-company EBITDA)

| Driver | Impact | Direction | Magnitude | Evidence |
|---|---|---|---|---|
| Freight-rate cycle (trucking recession) | Segment EBITDA negative or near-breakeven in 5 of the last 6 years; revenue down 27% from the FY2022 peak | Headwind (industrial cycle, not company-specific) | Low at consolidated level, High within the segment | [`03_segment-map.md`, Freight row; `10_external-dependency.md`, Industrial cycle row] |
| Brokerage-spread economics | Freight sits at the weak end of value-chain bargaining power on both sides (shippers and carriers) | Headwind (structural) | Low at consolidated level | [`06_value-chain.md`, §1, Freight row] |

## 8. The Single Biggest Margin Driver

The single driver that would compress margins the most if it moved adversely is the **insurance-cost / driver-incentive cost line embedded in COGS** — the largest cost line in the business (COGS is 61.5% of FY2025 revenue) and the one management itself describes as currently unbanked. Insurance costs are "becoming a tailwind this year," but every dollar of that tailwind is being reinvested into pricing rather than kept as margin [Q2 FY2026 transcript, Q&A, l.263-267] — so if insurance/litigation costs turn back up (a state-regulated, tort-driven cost line Uber does not control, per `10_external-dependency.md` §1), there is no disclosed buffer against it, and it hits COGS directly and immediately. The same cost line is also exposed to local competitive pressure on driver/courier incentive spend, already visible in Brazil [Q2 FY2026 transcript, Q&A, l.327-341]. Its current direction is a tailwind, but an unbuffered, policy- and competition-sensitive one — in contrast to the SG&A/R&D leverage drivers, which are more structural and less exposed to a single reversible input.

## 9. Investment Spend — Both Signs

Uber's own physical capital expenditure is **not** running above its own history — Capital Expenditure was $336mm in FY2025 and $308mm on an LTM basis (≈0.6% of revenue in both periods), essentially flat versus FY2021–FY2024 [Financials.xls, Cash Flow tab]. What **is** running well above history is total **investing-activities cash outflow**: $7,723mm on an LTM basis versus $3,564mm in FY2025 (more than 2x the prior full year, annualized) [Financials.xls, Cash Flow tab, "Cash from Investing" row], driven by two items — equity stakes in autonomous-vehicle (AV) software partners and the Delivery Hero share purchases. "Invest. in Marketable & Equity Securt." rose to $4,772mm LTM from $2,077mm FY2025, and "Other Investing Activities" rose to $1,979mm LTM from $336mm FY2025 [Financials.xls, Cash Flow tab]. This is the item Section 9 applies to.

| Reading | What it would show | Evidence here |
|---|---|---|
| Spend as a future COST | A future D&A/amortization step-up and interest-expense increase once assets are deployed or the Delivery Hero deal closes; buybacks already diluted this year ($3.5bn bought back YTD vs. a stated ~50%-of-FCF target, after $4bn was diverted to Delivery Hero market purchases in Q2 alone) | CFO: "In terms of the P&L versus cash flow impacts...The closer we get to deployment and scale out, there will be a P&L impact, and we'll size that for investors clearly as we have historically done" [Q2 FY2026 transcript, Q&A, l.482-484]; "we deployed about $4 billion of capital in the second quarter...market purchases of Delivery Hero stock" [Q2 FY2026 transcript, Q&A, l.580-583]; Total Debt Issued jumped to $6,229mm LTM from $3,359mm FY2025, a likely precursor to the disclosed ~€14bn Delivery Hero bridge facility drawing down [Financials.xls, Cash Flow tab; `10_external-dependency.md`, FX row] |
| Spend as a DEMAND signal | Capital crowding in behind Uber's AV bet; forward commitments already contracted; management frames AV as one of the largest opportunities in company history | "For every dollar that we have invested, our partners have been able to raise an additional $2.50 from other investors" — a crowd-in signal [Q2 FY2026 transcript, Q&A, l.460-462]; 120,000 vehicle-purchase commitments already on the books [Q2 FY2026 transcript, prepared remarks, l.151 area; `02_business-identity.md`, §1]; CEO: continuing to "invest behind one of the largest opportunities in Uber's history, autonomous vehicles" [Q2 FY2026 transcript, prepared remarks, l.151] |

**Current read: the cost reading dominates, for now.** Unlike a capacity-constrained business with a disclosed backlog (contracted revenue booked ahead of the spend), Uber discloses no AV revenue, AV trip count, or AV-attributable Gross Bookings series anywhere in this pool — the CFO explicitly deferred quantifying any P&L benefit ("we'll size that...as we get closer to deployment") [Q2 FY2026 transcript, Q&A, l.482-484]. The cash outflow (equity stakes, the $4bn Delivery Hero purchase, and prospective bridge-facility interest) is real and already visible in this quarter's cash flow and reduced buyback pace; the demand-side payoff (external capital crowd-in, 120,000-vehicle offtake) is directionally positive but has no revenue or margin number attached yet. **The observable that would flip this read:** a disclosed AV trip volume, AV-attributable Gross Bookings, or Delivery Hero synergy figure with a dollar amount and a date attached — until management sizes the P&L impact, this is booked as cost with an unquantified option value, not the reverse.



---

## earnings / 04_guidance-consensus.md

_Source: `04_guidance-consensus.md`_

# Guidance & Consensus — UBER

## 1. Consensus Data Metadata

| Field | Value |
|---|---|
| Source | Capital IQ Estimates Report (`UberTechnologies,IncNYSEUBEREstimatesReport (1).xls`, tabs: Consensus, Guidance, Trends, Revisions, Recent Changes, Surprise). The second workbook in the pool (`...Report.xls`, no "(1)") is an exact duplicate — counted once. No FactSet/Bloomberg export is present. |
| Data as of date | Guidance issued 2026-08-05 (same day as the FQ2 2026 print). Consensus figures reflect the Aug-05-2026 10:04 AM GMT snapshot embedded in the transcript cover page PLUS a further sweep of same-day/next-morning analyst revisions timestamped 4:41 AM–8:03 AM in the "Recent Changes" tab (the pool itself was synced Aug-06-2026 2:49 PM). Consensus is current — it already reflects the post-print, post-guidance re-rating, not a stale pre-print snapshot. |
| Fiscal year basis | FY ends Dec-31. Current quarter for this read = FQ3 2026 (quarter ending Sep-30-2026); current year = FY2026 [Capital IQ Estimates Report, Consensus tab, header block]. |
| Analyst count | Varies by metric: Revenue FY2026 47–52 estimates; Adjusted EBITDA FY2026 32–49; Adjusted (Normalized) EPS FY2026 31–39; GAAP EPS FY2026 32–42; Target Price 47 [Capital IQ Estimates Report, Consensus tab, "No. of Estimates" rows]. |
| Currency | USD, reported currency, today's spot rate conversion where applicable [Capital IQ Estimates Report, Consensus tab, header]. |
| Calendarization issue? | N — standard Dec-31 fiscal year-end, no cross-calendar reconciliation needed. |

**Transcript-sourcing note:** a VERBATIM earnings-call transcript is present (S&P Global Market Intelligence transcript of the Aug-05-2026 FQ2 2026 call). Full trust applies to management commentary and tone in this report. However, the call's "Presentation" section contains only the CEO's opening highlights — no CFO numeric guidance walk-through (e.g., a stated Gross Bookings range) appears in the call itself; Uber's practice separates a written CFO shareholder letter/press release from the live Q&A, and that letter is not present in this data pool. Every guidance NUMBER in this report is therefore taken from the Capital IQ Guidance tab (a vendor-parsed, filing/press-release-anchored data point), never from the transcript's authority alone, per the Transcript Sourcing & Fallback rule.

## 2. Management Guidance

| Metric | Period | Guidance | Type (Point / Range / Qualitative) | Source |
|---|---|---|---|---|
| Adjusted EBITDA (company-defined non-GAAP; CIQ line labelled "EBITDA") | FQ3 2026 (quarter ending Sep-30-2026) | $2,860mm – $2,960mm (midpoint $2,910mm) | Range | [Capital IQ Estimates Report, Guidance tab, "EBITDA" row, Guidance Date 2026-08-05] |
| Adjusted EPS (non-GAAP; CIQ line labelled "EPS Normalized") | FQ3 2026 | $0.84 – $0.88 (midpoint $0.86) | Range | [Capital IQ Estimates Report, Guidance tab, "EPS Normalized" row, Guidance Date 2026-08-05] |
| Revenue | FQ3 2026 | Not guided — company has not issued formal Revenue guidance since FQ2 2020 [Capital IQ Estimates Report, Guidance tab, "Revenue" row shows no entries after FQ2 2020] | — | [Capital IQ Estimates Report, Guidance tab] |
| Capex | FQ3 2026 | Not guided — last standalone Capex guidance on file is FY2020 ($550mm–$600mm) | — | [Capital IQ Estimates Report, Guidance tab, "Capital Expenditure" row] |
| GAAP EPS / GAAP Net Income | FQ3 2026 | Not guided — company guides on a non-GAAP (Adjusted) basis only | Qualitative (implicit exclusion) | [Capital IQ Estimates Report, Guidance tab] |
| Gross Bookings | FQ3 2026 | Not disclosed in pool documents — the transcript confirms the company guides Gross Bookings qualitatively ("gross bookings grew 22% year-on-year to more than $58 billion, above the high end of our guidance" for FQ2 2026) but the FQ3 2026 guided range itself is not stated anywhere in this data pool (no press release, no 8-K, no investor deck present) | Qualitative confirmation only; range unavailable | [Uber Technologies, Inc., FQ2 2026 Earnings Call transcript, Aug-05-2026, prepared remarks, Dara Khosrowshahi] |

**Reading the guidance basis:** Uber guides on Adjusted EBITDA and Adjusted (non-GAAP) EPS — not GAAP EPS. This matters because GAAP EPS at Uber swings heavily on non-operating mark-to-market gains/losses on its equity-method stakes (e.g., Aurora, Grab, Didi, Aurora Innovation, etc.): FQ3 2025 GAAP EPS actual came in at $3.11 vs. a $0.69 estimate (a +350.7% surprise) on a large one-off gain, while FQ4 2025 and FQ1 2026 GAAP EPS missed by roughly -82% and -82% respectively [Uber Technologies, Inc., FQ2 2026 Earnings Call transcript, Aug-05-2026, cover-page surprise table; Capital IQ Estimates Report, Surprise tab, "EPS (GAAP)" row]. None of that volatility is guided or comparable to consensus in a meaningful way — it is why the guidance vs. consensus comparison below is built on the Adjusted (non-GAAP) EPS and Adjusted EBITDA lines, the metrics management actually guides.

## 3. Guidance vs Consensus Table

| Metric | Period | Management Guidance | Street Consensus | Gap | Gap Direction |
|---|---|---|---|---:|---|
| Adjusted EBITDA | FQ3 2026 | $2,860mm–$2,960mm (midpoint $2,910mm) | $2,919.3mm (current, post-print) | +$9.3mm (+0.3%) | Consensus slightly above guidance midpoint — within the guided range, essentially at the middle |
| Adjusted EPS | FQ3 2026 | $0.84–$0.88 (midpoint $0.86) | $0.86 (current, post-print; down from $0.88 at the moment guidance was issued) | $0.00 (0.0%) | Consensus exactly at guidance midpoint |
| Revenue | FQ3 2026 | Not guided | $14,697.4mm (current, post-print) | Not applicable — no guidance to compare against | N/A |
| GAAP EPS (memo only — not the guided metric) | FQ3 2026 | Not guided | $0.96 (current) | Not applicable | N/A (included for reference only; driven by non-operating items) |

Gap = Consensus − Guidance midpoint. [Capital IQ Estimates Report, Trends tab, "EBITDA"/"EPS Normalized"/"Revenue" — Company Level, "Current" column, FQ3 2026]

**Revision-in-motion note:** the Adjusted EPS consensus was $0.88 (the top of the guided range) at the moment guidance was issued on Aug-05-2026, but has since settled to $0.86 (the exact midpoint) as individual analysts revised down through the morning of Aug-06-2026 [Capital IQ Estimates Report, Guidance tab, "Consensus Estimate" row, FQ3 2026 vs. Trends tab, "EPS Normalized" — Current]. The bar eased slightly from the initial post-guide read but still sits at, not below, the guided midpoint — this is not a "beat-friendly" low bar on EPS.

## 3A. Alt-Data Cross-Check

No `data/UBER/external/` directory exists in this pool — no licensed alt-data panel, expert-call note, or channel-check is present. Section omitted per the report structure (its absence is not a gap).

## 4. Estimate Revision Momentum Table

| Estimate | ~3 Months Ago | ~2 Months Ago | ~1 Month Ago | Current | Direction |
|---|---:|---:|---:|---:|---|
| Revenue (FQ3 2026, next Q) | $14,795.1mm | $14,789.1mm | $14,846.9mm | $14,697.4mm | Falling — cut ~1.0% in the last month, post-print |
| Adjusted EPS (FQ3 2026, next Q) | $0.86 | $0.87 | $0.87 | $0.86 | Flat |
| GAAP EPS (FQ3 2026, next Q, memo) | $0.88 | $0.91 | $0.92 | $0.96 | Rising (non-operating-driven; not the guided metric) |
| Adjusted EBITDA (FQ3 2026, next Q) | $2,837.3mm | $2,891.1mm | $2,907.9mm | $2,919.3mm | Rising — up ~2.9% since 3 months ago |
| Revenue (FY2026, current year) | $58,308.0mm | $58,132.3mm | $58,182.0mm | $57,834.9mm | Falling — cut ~0.6% in the last month |
| Adjusted EPS (FY2026, current year) | $3.33 | $3.35 | $3.34 | $3.37 | Rising, modestly |
| Adjusted EBITDA (FY2026, current year) | $11,034.0mm | $11,261.2mm | $11,272.8mm | $11,365.2mm | Rising — up ~3.0% since 3 months ago |

[Capital IQ Estimates Report, Trends tab, "Revenue"/"EPS Normalized"/"EPS (GAAP)"/"EBITDA" — Company Level and Per-Share tables, "3 months ago"/"2 months ago"/"1 month ago"/"Current" columns]

**Reading the split:** revenue estimates have been trimmed over the last one to three months (both for the next quarter and for the full year), while Adjusted EBITDA and margin estimates have been raised over the same window. The Street is not cutting the earnings outlook broadly — it is shifting the driver from top-line growth toward margin, consistent with the guidance itself (no Revenue guide, but a raised-versus-prior-quarter Adjusted EBITDA range).

## 5. Revision Breadth

| Metric | Up Revisions | Down Revisions | Net Revision Breadth | Period |
|---|---:|---:|---:|---|
| Revenue, FY2026 | 11 | 20 | −9 | Last month |
| Revenue, FY2026 | 24 | 19 | +5 | Last 3 months |
| Adjusted EBITDA, FY2026 | 19 | 5 | +14 | Last month |
| Adjusted EBITDA, FY2026 | 28 | 0 | +28 | Last 3 months |
| Adjusted (Normalized) EPS, FY2026 | 12 | 9 | +3 | Last month |
| Adjusted (Normalized) EPS, FY2026 | 17 | 7 | +10 | Last 3 months |
| GAAP EPS, FY2026 (memo) | 21 | 3 | +18 | Last month |
| GAAP EPS, FY2026 (memo) | 5 | 24 | −19 | Last 3 months |

[Capital IQ Estimates Report, Revisions tab, "Revenue"/"EBITDA"/"EPS Normalized"/"EPS (GAAP)" sections, FY2026 column]

Revenue breadth is negative over the last month (more analysts cutting than raising, following the FQ2 print and soft FQ3 revenue read) but still net positive over three months. Adjusted EBITDA breadth is strongly positive on both windows — nearly every recent revision has been upward. GAAP EPS breadth is volatile and sign-flips between windows, consistent with its exposure to non-operating equity-stake marks rather than operating performance.

## 6. Historical Beat / Miss Pattern

| Period | Revenue Beat/Miss | Adjusted EPS Beat/Miss | GAAP EPS Beat/Miss (memo) | Magnitude (Revenue / Adj. EPS) | Notes |
|---|---|---|---|---:|---|
| Q-4 (FQ3 2025) | Beat | Miss | Beat (one-off driven) | +1.55% / −25.4% | GAAP EPS beat of +350.7% was driven by a large non-operating gain, not operations [transcript cover table] |
| Q-3 (FQ4 2025) | Beat | Miss | Miss | +0.30% / −9.6% | Adjusted EPS missed consensus for a second straight quarter |
| Q-2 (FQ1 2026) | Miss | Beat | Miss | −0.45% / +3.9% | Adjusted EPS returned to beating; Revenue missed for the first time in the four-quarter window |
| Q-1 (FQ2 2026) | Miss | Beat | Beat | −0.52% / +0.67% | Revenue missed consensus for a second straight quarter; Adjusted EBITDA beat guidance's high end by 0.68% ($2,819mm actual vs. $2,800mm guidance high) |

[Capital IQ Estimates Report, Surprise tab, "Revenue"/"EPS Normalized"/"EPS (GAAP)" — Fiscal Quarters, FQ3 2025–FQ2 2026 columns; Guidance tab, "EBITDA" row, Actual vs. Guidance High, FQ1–FQ2 2026]

**Pattern:** Revenue has missed the Street's own pre-print estimate in each of the last two quarters (small magnitude, ~0.5% each time), while Adjusted EPS and Adjusted EBITDA have beaten in each of the last two quarters — including beating the HIGH END of management's own Adjusted EBITDA guidance range in both FQ1 2026 (+0.45% above the guidance high) and FQ2 2026 (+0.68% above the guidance high) [Capital IQ Estimates Report, Guidance tab, "EBITDA" row, "Actual" vs. "Guidance High," FQ1–FQ2 2026]. GAAP EPS beat/miss is not a reliable signal either way — it flips sign nearly every quarter, driven by non-operating equity-stake marks.

## 7. Bar Assessment

**Bar is fair.**

Adjusted EPS and Adjusted EBITDA consensus for FQ3 2026 sit almost exactly at management's own newly issued guidance midpoints ($0.86 vs. a $0.86 midpoint; $2,919.3mm vs. a $2,910mm midpoint) — the Street has not left obvious room below the guide for an easy beat on the metrics the company actually guides [Capital IQ Estimates Report, Guidance tab and Trends tab, FQ3 2026]. At the same time, Revenue consensus has been cut roughly 1.0% over the last month and Revenue itself has missed the Street's pre-print estimate in each of the last two reported quarters (−0.45%, −0.52%) [Capital IQ Estimates Report, Surprise tab], so there is some genuine miss risk concentrated on the top line, not fabricated by this read but visible in both the actual print history and the revision direction. Margin/EBITDA revision breadth is strongly positive (net +14 to +28 analysts raising over the last one to three months) even as Revenue breadth is negative over the last month (net −9) [Capital IQ Estimates Report, Revisions tab] — the Street has already priced continued margin execution as the driver, which raises (not lowers) the bar specifically on Adjusted EBITDA delivery, while leaving the Revenue line more exposed to a further miss given the two-quarter trend. Company has beaten the high end of its own Adjusted EBITDA guidance range in each of the last two quarters, but consensus has already caught up to that pattern (sitting at or slightly above the new midpoint, not below it), closing the gap that would otherwise have supported a "bar is low" call.



---

## earnings / 05_beat-miss-setup.md

_Source: `05_beat-miss-setup.md`_

# Beat / Miss Setup — UBER

## 1. Next Quarter Context

The next print is FQ3 2026 (quarter ending Sep-30-2026), a seasonally solid but not peak quarter — Q3 has historically taken ~25.4% of annual revenue and run the third-highest Adjusted EBITDA margin of the four quarters, on the way up to the Q4 peak [`01_historical-financials.md`, §5]. Management guides Adjusted EBITDA to $2,860mm–$2,960mm (midpoint $2,910mm) and Adjusted EPS to $0.84–$0.88 (midpoint $0.86); Street consensus sits almost exactly on both midpoints ($2,919.3mm and $0.86), and Revenue — which the company has not guided since FQ2 2020 — carries a $14,697.4mm consensus that has been cut roughly 1.0% in the last month [`04_guidance-consensus.md`, §2–§4].

## 2. Beat Scenarios

| Scenario | Driver | What Would Need To Happen | Likelihood (High / Mid / Low) | Evidence |
|---|---|---|---|---|
| Adjusted EBITDA beats the guidance high end for a third straight quarter | SG&A / R&D leverage (AI-driven headcount discipline) | Cost discipline in SG&A (19.87% of FY2025 revenue, down from 22.45% FY2024) and R&D (6.54%, down from 7.07%) continues at the pace seen the last two quarters, where Adj. EBITDA beat the guidance high end by +0.45% (FQ1'26) and +0.68% (FQ2'26) | High | Two-quarter beat streak above the guidance high end [`04_guidance-consensus.md`, §6]; SG&A/R&D leverage trend [`03_margin-drivers.md`, §3, §6] |
| Trendyol Go divestiture headwind laps, lifting reported Delivery growth | M&A / divestiture mix (Delivery) | The Trendyol Go acquisition, which closed back half of June 2025, drops out of the year-ago comparison base in Q3 FY2026, removing a reported-growth drag that management explicitly flagged as depressing Delivery's YoY comps through FQ2 2026 | Mid-High | "It is a headwind to delivery reported growth on a net basis... because Trendyol Go was a lot larger in size than the 2 acquisitions" [Q2 2026 transcript, Q&A, Ross Sandler question, Balaji Krishnamurthy, cited in `02_revenue-drivers.md`, §3, §5] |
| Mobility bookings growth stays above 20% YoY for a fifth straight quarter | Gross Bookings / trip volume (the single biggest revenue driver per `02_revenue-drivers.md`, §7) | Sparse-market penetration (<10% of eligible U.S. consumers used Uber in the past 12 months) and insurance-savings reinvestment into pricing keep converting into trip growth at the pace seen in San Francisco, L.A., and Phoenix, which "accelerated in Q2 versus Q1" | Mid | Four consecutive quarters of >20% bookings growth [Q2 2026 transcript, prepared remarks, Dara Khosrowshahi, cited in `02_revenue-drivers.md`, §3, §4] |
| Revenue beats a consensus bar that has already been cut | Take-rate stabilization / bookings-to-revenue gap narrowing | The ~10pp gap between +22% bookings growth and +12.2% reported revenue growth narrows if the U.K. reclassification effect (an "optical impact" per the CFO) fully anniversarizes or the low-cost-mix drag (Wait & Save, Moto) moderates | Low-Mid | UK reclassification explained as ~400bps of the ~500bps Mobility take-rate decline [Q2 2026 transcript, Q&A, Justin Post question, Balaji Krishnamurthy, cited in `01_historical-financials.md`, §3 flag; `03_margin-drivers.md`, §4]; Revenue consensus already cut ~1.0% in the last month, meaning the bar has already come down some [`04_guidance-consensus.md`, §4] |

## 3. Miss Scenarios

| Scenario | Driver | What Would Need To Happen | Likelihood (High / Mid / Low) | Evidence |
|---|---|---|---|---|
| Revenue misses the Street's pre-print estimate for a third straight quarter | Take rate / price realization deteriorating faster than the "optical" explanation implies, or bookings-to-revenue gap widening further | The low-cost product mix (2-/3-wheelers, Wait & Save) continues pulling down average revenue per trip faster than volume growth offsets it, and/or the genuine (non-U.K.-reclass) ~100bps of Mobility take-rate decline widens | Mid-High | Revenue missed consensus in FQ1'26 (-0.45%) and FQ2'26 (-0.52%), the last two reported quarters [`04_guidance-consensus.md`, §6]; Revenue estimate momentum falling (-1.0% last month, -0.6% for FY2026) [`04_guidance-consensus.md`, §4] |
| Adjusted EBITDA misses guidance midpoint | Insurance-cost tailwind reverses or is not fully offset | Insurance/litigation costs — a state-regulated, tort-driven line management does not control — turn back up mid-quarter; since the current savings are being fully reinvested into pricing rather than banked, there is no disclosed buffer against a reversal | Low | "Insurance...is becoming a tailwind this year. We are reinvesting the savings...back into the market" [Q2 2026 transcript, Q&A, Balaji Krishnamurthy, cited in `03_margin-drivers.md`, §6, §8] |
| Mobility trip volumes soften in competitively contested markets | Company market share / local competitive intensity | Brazil-style dynamics — new delivery entrants (DiDi Food, Meituan's iFood) bidding up 2-wheeler driver supply and diverting it away from Mobility — spread to additional markets, forcing incremental incentive spend that both suppresses volume and compresses margin | Low-Mid | "The cost of securing that supply has gone up pretty significantly," diverting driver supply from Mobility to Delivery in Brazil [Q2 2026 transcript, Q&A, Doug Anmuth question, Dara Khosrowshahi, cited in `02_revenue-drivers.md`, §3, §5; `03_margin-drivers.md`, §6] |
| Adjusted EPS misses the guided range | Non-operating items swing the wrong way, or Delivery Hero-related financing costs begin showing up early | Interest expense rises faster than expected on the debt issued ahead of the Delivery Hero bridge facility ($6,229mm LTM debt issued vs. $3,359mm FY2025), pulling EPS below the $0.84 guidance floor even before the deal closes | Low | Total Debt Issued jump [`03_margin-drivers.md`, §3, §9]; guided range $0.84–$0.88 [`04_guidance-consensus.md`, §2] |

## 4. What Magnitude Matters?

| Metric | Consensus / Bar | Material Beat Threshold | Material Miss Threshold | Why |
|---|---:|---:|---:|---|
| Revenue | $14,697.4mm (no formal company guide) | Above ~$14,845mm (+1.0%, reversing the last month's cut) | Below ~$14,550mm (in line with or worse than the recent -0.45%/-0.52% miss pattern) | No guided anchor exists, so the threshold is set against the Street's own recent revision and miss history [`04_guidance-consensus.md`, §4, §6] |
| EBITDA (Adjusted, company-defined) | Guide $2,860mm–$2,960mm; consensus $2,919.3mm | Above $2,960mm (above the guidance high end, extending the two-quarter beat streak) | Below $2,860mm (below the guidance low end — no precedent in the last four quarters) | Consensus already sits inside, not below, the guided range, so a "material" beat means clearing the top of the range, not merely matching consensus [`04_guidance-consensus.md`, §2–§3, §6] |
| EPS (Adjusted, non-GAAP; guided metric) | Guide $0.84–$0.88; consensus $0.86 (midpoint) | Above $0.88 (top of guided range) | Below $0.84 (bottom of guided range) | Consensus sits exactly at the guide midpoint — no room below the guide for an "easy" beat [`04_guidance-consensus.md`, §3, §7] |
| Guidance (forward, for Q4 2026) | No guidance yet issued for the quarter after next | A raised Adjusted EBITDA range for Q4 2026, Uber's seasonally strongest quarter | A held-flat or cut Adjusted EBITDA range, or first disclosed sizing of Delivery Hero-related costs | Q4 carries the highest historical revenue share (~27.6% FY2025) and highest Adjusted EBITDA margin (17.31% FY2025) of any quarter [`01_historical-financials.md`, §5] |

## 5. In-Line Print But Bad Guidance Risk

| Risk | Evidence | Why It Matters |
|---|---|---|
| In-line current quarter but guide-down into Q4 | CFO has deferred quantifying the P&L impact of AV and Delivery Hero investment spend: "the closer we get to deployment and scale out, there will be a P&L impact, and we'll size that for investors" [Q2 2026 transcript, Q&A, Balaji Krishnamurthy, cited in `03_margin-drivers.md`, §9] | Q4 is the seasonally strongest quarter; a soft Q4 guide issued alongside an in-line Q3 print would flip the setup from "beat streak intact" to "inflecting negative" even without a Q3 miss |
| Beat current quarter but weak margin guide | Insurance-cost tailwind is being fully reinvested into pricing rather than banked, so there is no disclosed buffer if it reverses [`03_margin-drivers.md`, §6, §8] | A margin beat funded entirely by an unbanked, reversible cost tailwind is not a repeatable beat — the same driver could turn into next quarter's miss |
| Beat EPS due to one-offs, miss quality | GAAP EPS has swung on non-operating equity-stake marks every recent quarter — FQ3'25 GAAP EPS beat by +350.7% on a large one-off gain, while FQ4'25 and FQ1'26 GAAP EPS missed by roughly -82% each [`04_guidance-consensus.md`, §2]; FY2024/FY2025 GAAP EPS were inflated by $5,758mm and $4,346mm one-time deferred-tax benefits [`01_historical-financials.md`, §4] | The guided metric (Adjusted EPS) strips these, but any headline "EPS beat" that leans on the GAAP line rather than the Adjusted line is a quality flag, not a clean beat |
| Beat revenue but working capital deteriorates | Working capital has been volatile (CA − CL: $1,843mm FY2023 → $769mm FY2024 → $1,673mm FY2025) [`01_historical-financials.md`, §1]; CFO growth is decelerating (+244%/+458%/+99%/+42% YoY) even as it stays strongly positive [`01_historical-financials.md`, §1] | A revenue beat unaccompanied by proportional cash conversion would be a quality flag for the downstream `06_earnings-quality` agent, not addressed further here |

## 6. Seasonality Read

Seasonality is a mild net positive for the setup, not a strong one. Q3 has historically been the third-strongest of Uber's four quarters by revenue share (24.92% FY2023, 25.44% FY2024, 25.89% FY2025 — trending up each year) and the third-highest by Adjusted EBITDA margin (11.75%, 15.11%, 16.75% in the same years) [`01_historical-financials.md`, §5], meaning the business is on the seasonal upswing into the Q4 peak rather than in its softest period (that is Q1). This modestly favors an EBITDA-margin beat on pure seasonal mix, but it is a small, well-known effect the Street has already built into its estimates — it does not, by itself, tilt the revenue-line setup, which is driven more by the bookings-to-revenue gap than by calendar mix [`02_revenue-drivers.md`, §6].

## 7. Historical Pattern

Uber shows a clear, bifurcated two-quarter pattern rather than a single directional bias: Revenue has missed the Street's own pre-print estimate in each of the last two quarters (FQ1'26 -0.45%, FQ2'26 -0.52%), while Adjusted EPS and Adjusted EBITDA have beaten in each of the last two quarters — including beating the high end of management's own Adjusted EBITDA guidance range both times (+0.45% and +0.68% above the guidance high) [`04_guidance-consensus.md`, §6]. This pattern is specific and consistent enough (two data points, same direction, similar magnitude each time) to carry real weight for the synthesizer, but it is a short run — two quarters is not a long base rate — and the Street has already partly caught up to it: Adjusted EBITDA/EPS consensus now sits at, not below, the new guidance midpoints, closing the gap that supported the prior beats [`04_guidance-consensus.md`, §7].

## 8. Setup Verdict

**Setup is balanced.**

The single most important factor is the bifurcation between the top line and the bottom line: Revenue carries genuine, evidenced miss risk (a two-quarter miss streak, consensus cut ~1.0% in the last month, and a bookings-to-revenue gap the pool cannot fully explain), while Adjusted EBITDA and Adjusted EPS carry a genuine beat pattern (guidance-high-end beats in each of the last two quarters, positive revision breadth) — but that bottom-line bar is now "fair," not low, since consensus has already moved to sit on the new guidance midpoints rather than below them [`04_guidance-consensus.md`, §7]. The biggest risk that could flip this balance in either direction is the insurance-cost line: it is currently an unbanked, fully-reinvested tailwind with no disclosed buffer, so a reversal would hit the beat streak directly, while continued reinvestment sustaining the current bookings growth would extend the beat pattern.

## 9. Second-Quarter Look-Ahead

The quarter after next (Q4 2026, ending Dec-31-2026) is Uber's seasonally strongest — highest historical revenue share (~27.6% FY2025) and highest Adjusted EBITDA margin (17.31% FY2025) of any quarter [`01_historical-financials.md`, §5] — but no guidance has been issued for it yet, and it is the first quarter where Delivery Hero-related financing costs or AV-investment P&L effects could plausibly begin to be sized, per the CFO's own deferred commitment to "size that for investors clearly as we have historically done" [`03_margin-drivers.md`, §9]. Visibility beyond the Q3 print is limited to that one qualitative flag; there is no quantified Q4 estimate or driver in this pool to assess further.

## 10. Pre-Mortem

If this setup fails, the most likely reason is that the "optical, not economic" framing of the U.K. take-rate reclassification and the low-cost-product mix drag understated a genuine, ongoing deceleration in revenue realization — i.e., the bookings-to-revenue gap that this pool could not cleanly decompose into take-rate, mix, FX, and M&A components turns out to be driven more by real price/mix erosion than by the one-time accounting effect management described on the call. A secondary reason would be the insurance-cost tailwind reversing faster than the fully-reinvested, no-buffer cost structure could absorb.



---

## earnings / 06_earnings-quality.md

_Source: `06_earnings-quality.md`_

# Earnings Quality — UBER

**Reporting standard:** US GAAP. **Currency:** USD millions unless noted. **Source caveat (carried from `01_historical-financials.md`):** no primary SEC filing (10-K/10-Q/8-K) is in the data pool. Every income-statement, balance-sheet, and cash-flow figure below is sourced from Capital IQ's vendor transcription of Uber's filings (source-hierarchy tier 5, CLAUDE.md §4) and cited as "CIQ export," never as "10-K." The verbatim Q2 FY2026 earnings-call transcript (Aug-05-2026) is a primary call record and is cited as such. Cash flow data IS available in this pool — the partial-data cap for missing cash flow does not apply.

**EBITDA definitions used throughout (carried from `01_historical-financials.md` §0):** "Adj. EBITDA" = the company-defined, non-GAAP metric Uber guides to (adds back stock-based compensation and other items) [Financials.xls, Segments tab, "Total EBITDA" row]. "GAAP-based EBITDA" = Operating Income + D&A, a CapIQ-standardized calculation [Financials.xls, Income Statement tab, "EBITDA" supplemental row]. Section 1 uses Adj. EBITDA as the primary line (it is the metric available at full granularity and the one management and the market track); Section 7 shows the GAAP-based reconciliation.

## 1. EBITDA → CFO → FCF Bridge (5 years)

| Item | FY2021 | FY2022 | FY2023 | FY2024 | FY2025 | Trend |
|---|---:|---:|---:|---:|---:|---|
| Adj. EBITDA | -774 | 1,713 | 4,052 | 6,484 | 8,730 | Improving — loss to profit in FY2022, expanding every year since |
| Working capital change | -1,079 | 439 | 227 | -1,554 | -906 | Volatile — no clean directional trend, but never the swing factor behind the CFO growth story |
| Tax paid (cash) | -87 | -175 | -234 | -324 | -345 | Rising with the business (small vs. CFO) |
| Interest paid (cash) | -449 | -513 | -629 | -475 | -386 | Improving — falling in absolute terms as debt is refinanced/repaid |
| Other operating items (reconciling plug — see note) | 1,944 | -822 | 169 | 3,006 | 3,006 | See note below table |
| **CFO** | **-445** | **642** | **3,585** | **7,137** | **10,099** | **Improving — strong, though decelerating growth rate (+244%/+458%/+99%/+42% YoY)** |
| Maintenance capex | Not split — see note | | | | | |
| Growth capex | Not split — see note | | | | | |
| Total capex | -298 | -252 | -223 | -242 | -336 | Stable — small and asset-light (<1% of revenue every year) |
| **FCF (CFO − Total Capex)** | **-743** | **390** | **3,362** | **6,895** | **9,763** | **Improving** |
| **CFO / EBITDA %** | N/M (EBITDA negative) | 37.5% | 88.5% | 110.1% | 115.7% | Improving — crossed above the 70% "healthy" threshold in FY2023 and has stayed above 85% every year since |

Evidence: Adj. EBITDA [1]; CFO, capex, cash taxes paid, cash interest paid, Change in Net Working Capital (supplemental) [2]; FCF = CFO − |capex| per module calculation standard, matching `01_historical-financials.md` §1 exactly.

**Capex split not disclosed — total capex used.** Uber does not break out maintenance vs. growth capex in this pool. FCF may understate true recurring free cash flow if a portion of the (already small, <1% of revenue) capex is growth-related, but given the small absolute size of total capex this has minimal effect on the FCF conclusion either way.

**"Other operating items" plug note.** This row is a derived balancing figure (CFO − Adj. EBITDA − WC change − tax paid − interest paid), not a single disclosed line. It is large and positive in FY2024–FY2025 (+$3,006mm each year) primarily because: (a) stock-based compensation ($1,796mm FY2024 / $1,826mm FY2025) is a non-cash add-back inside GAAP net income → CFO that is separate from — and not captured by — the Adj. EBITDA-based bridge above (Adj. EBITDA already adds SBC back at the EBITDA level, so re-adding it in the CFO build is a genuine reconciling item, not double-counting cash); and (b) the CFO build reverses the large non-cash deferred-tax valuation-allowance release ($5,758mm FY2024 / $4,346mm FY2025 recognized in net income — see Section 8) via the "Other Operating Activities" line (-$5,543mm FY2024 / -$4,693mm FY2025) [3], since that tax benefit was never a cash inflow. Evidence: [Financials.xls, Cash Flow tab, "Stock-Based Compensation" and "Other Operating Activities" rows; Income Statement tab, "Income Tax Expense" row] [2][4].

**Normalised operating FCF vs. reported (CLAUDE.md §15).** No one-off cash item (e.g. a large customer advance) or non-standard company-defined FCF add-back was found inflating reported FCF. Uber's own FCF claim on the Q2 FY2026 call — "trailing 12-month free cash flow exceeding $10 billion for the first time in our history" [5] — reconciles almost exactly to the standard CFO − capex calculation (TTM Jun-30-2026: $10,116mm) [2]. Reported FCF is used as the lead figure without adjustment; there is no distortion to normalise out.

## 2. Cash Conversion Assessment

CFO has tracked and then **exceeded** Adj. EBITDA every year since FY2023: 88.5% (FY2023) → 110.1% (FY2024) → 115.7% (FY2025), comfortably above the 70% "healthy" threshold and above 100% for the last two fiscal years [2]. The TTM figure (Jun-30-2026) is 103.8% (CFO $10,424mm / Adj. EBITDA $10,043mm) [2], confirming this is not a one-year artifact. The mechanism is structural, not accounting sleight-of-hand: Uber collects rider/eater payment immediately (via card) while paying drivers and merchants with a short lag, funding a persistent negative-working-capital tailwind that is visible in the growing Accrued Expenses balance ($5,258mm FY2021 → $7,842mm FY2025 → $11,330mm LTM Jun-26, largely funds owed to drivers/merchants) [6] and in the "Change in Other Net Operating Assets" cash-flow line, which has been positive every year (+$2,189mm to +$2,567mm) [2]. Trajectory: improving and now stable at a high level — this is a genuine positive earnings-quality signal, the single strongest one in this dataset.

CFO/EBITDA was NOT below 50% in 2 or more of the last 3 fiscal years (FY2023 88.5%, FY2024 110.1%, FY2025 115.7% — all comfortably above 70%). The RF-EQ-002 cash-conversion-breakdown trigger does not apply and is not emitted.

## 3. Working Capital Trends

Uber is an asset-light marketplace/platform business with no inventory (Mobility, Delivery, and Freight are all brokerage/matching businesses) — "Inventory Turnover: NA" and "Avg. Days Inventory Out.: NA" for every year in the CIQ export [7]. DIO is not applicable to this business model and is shown as N/A throughout, per the module's own DSO/revenue vs. DIO,DPO/COGS denominator convention.

| Metric | FY2023 | FY2024 | FY2025 | Direction | Risk |
|---|---:|---:|---:|---|---|
| Receivable days (DSO) — 365×avg AR÷revenue | 30.3 | 28.0 | 25.1 | Falling (improving) | Low |
| Inventory days (DIO) | N/A | N/A | N/A | N/A — no inventory in this business model | N/A |
| Payable days (DPO) — 365×avg AP÷COGS | 11.8 | 10.9 | 10.7 | Falling (paying suppliers slightly faster) | Low |
| Cash conversion cycle (DSO + DIO − DPO) | 18.5 | 17.0 | 14.5 | Shrinking (improving) | Low |

Own calculation using average (opening + closing) balances, cross-checked against and matching (within rounding) the CIQ-computed "Avg. Days Sales Out." / "Avg. Days Payable Out." ratio-tab rows (FY2023: 30.27/11.82; FY2024: 28.03/10.97; FY2025: 25.12/10.67) [7]. Inputs: Accounts Receivable and Accounts Payable balance-sheet lines [6]; COGS and Revenue income-statement lines [4].

None of the flag thresholds trip: DSO is falling, not rising >10% YoY (revenue-recognition concern absent); DIO is not applicable; DPO is falling, not rising sharply (no supplier-stretching liquidity signal). The shrinking cash conversion cycle (18.5 → 14.5 days) corroborates the strong CFO/EBITDA conversion in Section 2 rather than contradicting it.

## 4. Non-GAAP Adjustments

| Adjustment | Amount | Recurring? (Y/N) | Concern Level | Evidence |
|---|---:|---|---|---|
| Stock-based compensation add-back (to Adj. EBITDA) | $1,826mm (FY2025); $1,939mm (LTM Jun-26) | Y — every year | Mid — SBC is a real, non-cash but genuinely dilutive cost (~3.5% of FY2025 revenue) that Adj. EBITDA excludes entirely; common across ride-hail/delivery peers but still a material headline-EBITDA inflator | [Financials.xls, Income Statement tab, "Stock-Based Comp., Total" row; Segments tab, "Total EBITDA"] |
| Other unitemized non-GAAP add-backs (Adj. EBITDA vs. GAAP-based EBITDA gap beyond SBC) | ~$592mm (FY2025, = $2,418mm total gap − $1,826mm SBC); ~$630mm (LTM) | Y — recurs every period, composition not itemized in this pool | Mid-High — the ~24-25% of the total EBITDA adjustment that is not SBC is not broken out (legal reserves, restructuring, and similar per `01_historical-financials.md` §4); genuine opacity, not a language issue | [01_historical-financials.md §4; Financials.xls, Income Statement & Segments tabs] |
| Deferred-tax valuation-allowance release (non-cash tax benefit lifting GAAP net income/EPS) | +$5,758mm (FY2024); +$4,346mm (FY2025) | Y — occurred in 2 consecutive fiscal years, though each is technically a distinct one-time deferred-tax-asset recognition event, not an operating item | High — this is the largest single distortion in the dataset; see Section 8 | [Financials.xls, Income Statement tab, "Income Tax Expense" & "Total Deferred Taxes" rows; Balance Sheet tab, "Deferred Tax Assets, LT" row] |
| Gain/(loss) on sale of investments (equity-stake mark-to-market, e.g. Aurora/Didi/Grab-type holdings) | +$1,832mm (FY2024) / -$97mm (FY2025) / -$7,227mm (FY2022) | Y — recurs every year with unpredictable sign and large magnitude | Mid-High — non-operating and highly volatile; embedded in GAAP EBT and net income, correctly excluded from the company's own Normalized Net Income | [Financials.xls, Income Statement tab, "Gain (Loss) On Sale Of Invest." row] |

## 5. One-Off Items (last 3 fiscal years)

| Item | Period | Amount | Classification | Evidence |
|---|---|---:|---|---|
| Merger & Related Restructuring Charges | FY2024 | -$236mm | Genuine one-off (does not recur FY2021–FY2023 or FY2025) | [Financials.xls, Income Statement tab, "Merger & Related Restruct. Charges" row] |
| Deferred-tax valuation-allowance release | FY2024 | +$5,758mm (non-cash tax benefit) | Recurring "one-off" — occurred again the following year at reduced scale (see next row); should not be modelled as a step-change in the tax rate | [Financials.xls, Income Statement tab, "Income Tax Expense" row; Balance Sheet tab, "Deferred Tax Assets, LT" row (+$6,001mm FY2024, matching within $26mm)] |
| Deferred-tax valuation-allowance release | FY2025 | +$4,346mm (non-cash tax benefit) | Recurring "one-off" — same mechanism as FY2024, confirming this is a multi-year unwind, not a single clean event | [same, Balance Sheet DTA +$4,780mm FY2025, matching within $1mm] |
| Gain on sale of investments | FY2024 | +$1,832mm | Genuine but non-operating and volatile — sign flips year to year (see FY2022 -$7,227mm) | [Financials.xls, Income Statement tab, "Gain (Loss) On Sale Of Invest." row] |
| Loss on sale of investments | FY2025 | -$97mm | Genuine but non-operating and volatile | [same row] |
| UK Mobility cost-of-revenue reclassification ("optical" impact on reported gross margin/take-rate) | FQ1'26–FQ2'26 | Not separately dollar-quantified in this pool; described by management as ~400bps of a ~500bps YoY mobility take-rate decline | Suspicious as a **presentation** change, not a cash or economic item — moves costs between P&L lines without changing underlying unit economics, and inflates the reported quarterly Gross Margin % series by ~5+pp versus the LTM GAAP gross margin (which moved only +225bps) [8] | [Q2 FY2026 Earnings Call transcript, Aug-05-2026, CFO Balaji Krishnamurthy, Q&A (verbatim)] |

## 6. Accrual Quality Flags

| Flag | Triggered (Y/N) | Evidence |
|---|---|---|
| Revenue growing faster than CFO for 2+ years | N | Opposite pattern: FY2025 CFO grew +42% YoY vs. revenue +18.3% YoY; FY2024 CFO +99% vs. revenue +18.0%. CFO has outpaced revenue every year since FY2022 [2][4]. |
| Receivables growing faster than revenue | N (borderline) | FY2023 AR growth (+22.5%) did exceed revenue growth (+17.0%) — one year triggered. But the most recent two years reversed this: FY2024 AR growth -2.1% vs. revenue +18.0%; FY2025 AR growth +14.8% vs. revenue +18.3%. DSO has fallen every year since (Section 3). Net: not a persistent pattern. [6][7] |
| Inventory growing faster than COGS | N/A | No inventory in this business model (marketplace/brokerage) [7]. |
| Deferred revenue declining (if subscription/contract business) | N/A | Not disclosed as a separate line in this pool; Uber is not primarily a deferred-revenue/subscription business (Uber One membership revenue is not broken out here) — "Not proven from available data." |
| Capitalized costs growing as % of revenue | Not assessable from available data | "Other Long-Term Assets" grew from $3,276mm (FY2021) to $14,019mm (FY2025) — faster than revenue — but this pool has no note-level detail on composition (could be equity-method investments, right-of-use assets, or capitalized development costs). Flagging as an open item rather than asserting Y, per "no source = no claim" [6]. |
| Frequent accounting policy changes | Y | CIQ vendor export marks the FY2022 and FY2023 income-statement columns "Reclassified" [4]; separately, the UK mobility cost-of-revenue reclassification disclosed on the Q2 FY2026 call created a ~5pp step-change in reported quarterly gross margin with no corresponding change in LTM GAAP gross margin, described by the CFO as "an optical impact" [8]. This is a genuine presentation-comparability issue, not a cash or accrual-quality problem in the strict sense, but it recurs and affects how margin trend should be read. |

Only 1 of 6 rows is a clear Y (accounting policy/presentation changes); the two most consequential accrual-adjacent rows (revenue-vs-CFO, receivables-vs-revenue) are both N on the most recent evidence. Fewer than 2 rows triggered Y — the RF-EQ-001 (rising accruals divergent from cash earnings) trigger does not apply and is not emitted.

## 7. Reported vs Adjusted Reconciliation

| Metric | Reported | Adjusted | Difference | % of Reported | Recurring? | Evidence |
|---|---:|---:|---:|---:|---|---|
| EBITDA, FY2025 | 6,312 (GAAP-based: Op. Income + D&A) | 8,730 (Adj. EBITDA, company-defined) | +2,418 | +38.3% | Y | [4][1] |
| EBIT | 5,565 (GAAP, FY2025) | Not separately disclosed — Uber does not report an "Adjusted EBIT" non-GAAP metric in this pool | — | — | — | [4] |
| Net income, FY2025 | 10,053 (GAAP) | 3,613 (Normalized) | -6,441 | -64.1% | N (tax-benefit-driven, though the mechanism recurred FY2024→FY2025 — see Section 5) | [4][9] |
| Net income, FY2024 | 9,856 (GAAP) | 1,568 (Normalized) | -8,288 | -84.1% | N | [4][9] |
| EPS diluted, FY2025 | 4.73 (GAAP) | 1.70 (Normalized) | -3.03 | -64.1% | N | [4][9] |
| EPS diluted, FY2024 | 4.56 (GAAP) | 0.73 (Normalized) | -3.83 | -84.0% | N | [4][9] |

The reported figure is HIGHER than the adjusted figure for net income/EPS in both years — the opposite direction from the usual "adjusted beats reported" non-GAAP pattern — because the company's own normalization strips out one-time gains (the deferred-tax benefit and investment mark-to-market gains) rather than one-time charges. This is company-disclosed and directionally conservative (the company's own normalized numbers are lower, more cautious, than the GAAP headline), which is a mild positive for disclosure quality even though the underlying GAAP EPS series remains an unreliable growth narrative on its own (see Section 8).

## 8. Accounting Trap Checklist

*(Severity /100 — higher = WORSE, inverted per module scoring rules)*

| Trap | Triggered? (Y/N) | Evidence | Severity /100 |
|---|---|---|---:|
| Stock-based compensation excluded from adjusted earnings | Y | SBC $1,826mm FY2025 (~3.5% of revenue) added back to Adj. EBITDA [1] | 45 |
| Restructuring costs recur every year | N | Merger & Restructuring charges appear only in FY2024 (-$236mm); zero in FY2021, FY2022, FY2023, FY2025 [4] | 10 |
| Capitalized costs rising faster than revenue | Not conclusively verifiable | "Other Long-Term Assets" growth outpaces revenue growth, but composition is not itemized in this pool (Section 6) | 20 |
| Receivable factoring / supplier finance disclosed | N | No factoring, securitization, or supplier-finance program disclosed anywhere in the data pool | 5 |
| Inventory write-downs or reserve releases | N/A | No inventory in this business model | 0 |
| Revenue recognized before cash collection risk is clear | N | DSO shrinking (30.3 → 25.1 days FY2023–FY2025); Accum. Allowance for Doubtful Accts stable at ~2.1–2.4% of AR, not rising [6][7] | 10 |
| Change in useful life / depreciation assumptions | Not assessable from available data | No note-level detail on depreciation policy in this pool (no 10-K) | 15 |
| Tax rate unusually low or boosted by one-off | Y | Effective Tax Rate % marked "NM" most years; FY2024/FY2025 GAAP tax line shows a net BENEFIT of -$5,758mm / -$4,346mm from a non-cash deferred-tax valuation-allowance release, confirmed by the matching Balance Sheet "Deferred Tax Assets, LT" jump of +$6,001mm/+$4,780mm in the same years [4][6] — the single largest earnings-quality distortion in this dataset | 75 |
| Large fair-value / mark-to-market gains | Y | "Gain (Loss) On Sale Of Invest." swings from -$7,227mm (FY2022) to +$1,536/+$1,832/-$97mm (FY2023–FY2025), tied to equity-stake holdings — non-operating and highly volatile, embedded in GAAP EBT and net income [4] | 65 |

## 9. Earnings Quality Score

**Score: 68/100** (band: 61–80, "Mostly clean but some working capital or adjustment noise")

The single most important reason for this score: **cash-backed operating earnings are genuinely strong and improving — CFO has exceeded Adj. EBITDA for three straight years, reaching 115.7% in FY2025, with a shrinking working-capital cycle and no inventory, factoring, or capex games** — but **headline GAAP net income and EPS are not a clean read of the business** for FY2024–FY2025 because of back-to-back multi-billion-dollar non-cash deferred-tax valuation-allowance releases ($5,758mm and $4,346mm) plus a volatile, non-operating investment mark-to-market line. The score is capped below the 81–100 band by this combination — a real distortion to the metric (GAAP EPS) most investors read first, plus a ~24–25% slice of Adj. EBITDA's own add-backs that is not itemized in this data pool — even though the more reliable cash-flow-based earnings measure (CFO/FCF) shows minimal noise.

## 10. The Single Biggest Quality Concern

The single biggest risk that reported earnings overstate economic reality is the GAAP EPS/net-income series for FY2024 and FY2025, which was inflated in both years by a non-cash deferred-tax valuation-allowance release ($5,758mm in FY2024, $4,346mm in FY2025 — together explaining the bulk of the $8,288mm and $6,441mm gaps to the company's own Normalized Net Income) [4][9]. This is a legitimate, disclosed GAAP accounting event — once a company shows sustained profitability it must reassess and often release a valuation allowance against previously unrecognized net operating loss carryforwards, which are shrinking accordingly (Total NOL carryforward: $43,733mm FY2023 → $31,443mm FY2025) [10] — but it is non-operating, non-cash, and (having now recurred two years running) risks being extrapolated by anyone reading headline GAAP EPS growth (+4.56 → +4.73, a modest 3.6% increase that masks how distorted both numbers already are) as if it reflects the operating trend. It does not: the company's own normalized diluted EPS (0.73 → 1.70, +133%) and CFO (+42% YoY FY2025) are the cleaner, cash-backed measures of Uber's actual earnings trajectory, and both show a business genuinely improving rather than one manufacturing its growth story through cash.

## 11. Citations

[1] CIQ export — Uber Technologies Inc NYSE UBER Financials.xls, Segments tab, "Total EBITDA" row (FY2021–FY2025, company-defined Adjusted EBITDA)
[2] CIQ export — Uber Technologies Inc NYSE UBER Financials.xls, Cash Flow tab (FY2021–FY2025 + LTM "Press Release Jun-30-2026" column)
[3] CIQ export — Uber Technologies Inc NYSE UBER Financials.xls, Cash Flow tab, "Other Operating Activities" row
[4] CIQ export — Uber Technologies Inc NYSE UBER Financials.xls, Income Statement tab (FY2021–FY2025 + LTM "Press Release Jun-30-2026" column)
[5] Uber Technologies, Inc., Q2 2026 Earnings Call transcript, Aug-05-2026, CEO Dara Khosrowshahi prepared remarks (verbatim, S&P Global Market Intelligence transcript)
[6] CIQ export — Uber Technologies Inc NYSE UBER Financials.xls, Balance Sheet tab (FY2021–FY2025 year-end + "Press Release Jun-30-2026" column)
[7] CIQ export — Uber Technologies Inc NYSE UBER Financials.xls, Ratios tab, "Short Term Liquidity" and "Asset Turnover" sections (FY2021–FY2025 + LTM)
[8] Uber Technologies, Inc., Q2 2026 Earnings Call transcript, Aug-05-2026, CFO Balaji Krishnamurthy, Q&A (verbatim); cross-checked against `01_historical-financials.md` §3
[9] CIQ export — Uber Technologies Inc NYSE UBER Financials.xls, Income Statement tab, "Normalized Net Income" and "Normalized Diluted EPS" supplemental rows
[10] CIQ export — Uber Technologies Inc NYSE UBER Financials.xls, Supplemental tab, "Total NOL C/F" row (FY2023–FY2025)
[11] `analyses/UBER_2026-08-06/earnings/01_historical-financials.md` — upstream historical-financials output, used for cross-checks throughout



---

## earnings / 07_earnings-sensitivity.md

_Source: `07_earnings-sensitivity.md`_

# Earnings Sensitivity — UBER

## 1. Variable Selection

Six variables were selected from the magnitude ratings in `02_revenue-drivers.md` §4 and `03_margin-drivers.md` §6: three carry a "High" magnitude rating and a clean enough cost/revenue base to convert into a dollar Adjusted EBITDA impact (Mobility Gross Bookings growth, proxied by consolidated revenue growth; the insurance-cost/driver-incentive line inside COGS; SG&A leverage from AI-driven headcount discipline). Three more carry a "High" magnitude rating but cannot be converted to a clean dollar figure from this data pool and are still included because excluding them would understate the earnings range: Mobility's real (non-optical) take-rate erosion, driver/worker-classification regulation (named the "Single Biggest Lever" in `business-model/10_external-dependency.md` §5), and FX translation (flagged Mid dependency, ~49% of FY2025 revenue booked outside the U.S./Canada, in `10_external-dependency.md` §1). No FX, commodity, or interest-rate sensitivity table exists anywhere in this pool [`10_external-dependency.md` §2: "Not proven from available data"], so those three are scored qualitatively, not with an invented dollar figure.

## 2. Sensitivity Table

Base metric throughout: **Adjusted EBITDA (company-defined, non-GAAP)**, FY2025 = $8,730mm on FY2025 revenue of $52,017mm [`01_historical-financials.md` §1]. Where a dollar impact is shown, it uses an inferred incremental-EBITDA-margin or a straight cost-ratio-times-revenue calculation — clearly labeled as inference, not a company-disclosed sensitivity (none exists in this pool per `10_external-dependency.md` §2).

| Variable | Base Case | Move Basis | Bull Case | EPS/EBITDA Impact (bull) | Bear Case | EPS/EBITDA Impact (bear) | Confidence | Evidence |
|---|---|---|---|---:|---|---:|---|---|
| Mobility Gross Bookings growth (proxy: consolidated revenue YoY growth) | FY2025 revenue +18.3% YoY; most recent quarter (FQ2 FY2026) decelerated to +12.2% YoY | Historical observed range — quarterly YoY revenue growth ran from +20.4% (FQ3'24/FQ4'24) to +12.2% (FQ2'26), an ~8pp band over 8 quarters | Growth re-accelerates +4pp vs. FY2025 pace (~22%) | +$581mm (Inference, not from filings — uses FY2024→FY2025 incremental EBITDA margin of ~27.9%, i.e. $2,246mm EBITDA gained on $8,039mm revenue gained) | Growth decelerates a further -4pp vs. FY2025 pace (~14%), roughly matching the deceleration already printed in FQ1'26–FQ2'26 | -$581mm (same inferred incremental-margin basis) | Low | `01_historical-financials.md` §1, §3; `02_revenue-drivers.md` §7 ("Single Biggest Revenue Driver") |
| Insurance-cost / driver-incentive line (embedded in COGS) | COGS = 61.50% of FY2025 revenue ($31,992mm) | Historical observed range — COGS ratio improved 99bps, FY2024 (62.49%) → FY2025 (61.50%) | Insurance/incentive tailwind persists, COGS ratio improves a further 100bps | +$520mm (100bps × $52,017mm FY2025 revenue base) | Insurance/litigation costs reverse — the tailwind management says is being fully reinvested, not banked — COGS ratio deteriorates 100bps back toward the FY2024 level | -$520mm | Medium | `03_margin-drivers.md` §3–4, §8; Financials.xls Income Statement tab |
| SG&A leverage (AI-driven headcount discipline) | SG&A = 19.87% of FY2025 revenue ($10,339mm); LTM already ticked back up to 20.50% | Historical observed range — SG&A ratio fell 258bps FY2024 (22.45%) → FY2025 (19.87%); LTM shows a partial +63bps reversal already underway | Headcount discipline continues, SG&A ratio improves a further 150bps | +$780mm (150bps × $52,017mm FY2025 revenue base) | LTM reversal (+63bps) continues and widens to +150bps | -$780mm | Medium | `03_margin-drivers.md` §3–4, §6; Financials.xls Income Statement tab |
| Mobility take rate — real (non-optical) component | Mobility take rate down ~500bps YoY in FQ2 FY2026; CFO attributes ~400bps to a U.K. accounting reclassification ("optical," not economic) and ~100bps to deliberate low-cost-product mix investment (real) | Company-disclosed split of the 500bps move (High confidence on the split itself); no annual Gross Bookings figure exists in this pool to convert bps into a dollar amount | Real take-rate erosion narrows as low-cost-mix investment moderates | Not quantifiable — no audited annual Gross Bookings series in this pool [`02_revenue-drivers.md` §1.2] | Real take-rate erosion widens as Wait & Save / 2-/3-wheeler mix keeps growing | Not quantifiable, same reason | High (on the bps split) / Low (on any dollar conversion) | `02_revenue-drivers.md` §3–4; Q2 FY2026 transcript, Q&A, Balaji Krishnamurthy |
| Driver/worker-classification regulation | Independent-contractor model intact today; the U.K. reclassification already shows a regulatory change can move a market's reported take rate ~400bps in one step | No company-quantified sensitivity exists; qualitative tail-risk framing only | Status quo holds / favorable rulings in major markets | Not quantifiable | A major-market reclassification ruling strikes the independent-contractor cost structure across Mobility and Delivery simultaneously | Not quantifiable — "Inference, not from filings" per `10_external-dependency.md` §5 on comparative scale | Low | `10_external-dependency.md` §1, §5; `02_revenue-drivers.md` §4 (regulatory row) |
| FX translation | ~49% of FY2025 revenue booked outside U.S./Canada ($25,548mm of $52,017mm: EMEA $16,364mm + LATAM $3,327mm + APAC $5,857mm) | No disclosed FX sensitivity table exists in this pool; the only in-quarter FX data point (an analyst's live-call claim of "bookings +22% constant currency, revenue +19%") does not reconcile with the CIQ-reported +12.2% revenue growth for the same quarter | Favorable FX translation on international revenue | Not quantifiable | Adverse FX translation on international revenue, compounded by the pending Delivery Hero deal's euro-denominated ~€14bn bridge facility | Not quantifiable | Low | `10_external-dependency.md` §1–§2; `02_revenue-drivers.md` §3 (FX row) |

## 3. Sensitivity Ranking

| Rank | Variable | Absolute Impact (avg of bull + bear) | Direction of Current Trend |
|---:|---|---:|---|
| 1 | SG&A leverage (AI-driven headcount discipline) | $780mm | Recently reversing — LTM ratio (20.50%) is +63bps above the FY2025 low (19.87%), after two years of steady improvement |
| 2 | Mobility Gross Bookings growth (revenue-growth proxy) | $581mm | Decelerating — two most recent quarters (FQ1'26 +14.5%, FQ2'26 +12.2%) are the slowest of the last 8 |
| 3 | Insurance-cost / driver-incentive line (COGS) | $520mm | Currently a tailwind, but explicitly unbanked (fully reinvested into pricing) |
| — | Driver/worker-classification regulation | N/A — see §2 | Status quo; low near-term probability, highest potential magnitude if triggered |
| — | Mobility take rate (real, non-optical component) | N/A — see §2 | Deteriorating — the ~100bps real component is widening as low-cost-mix products grow |
| — | FX translation | N/A — see §2 | Unclear — the only in-quarter data point does not reconcile |

## 4. The Single Highest-Sensitivity Variable

By raw dollar magnitude among the variables this pool lets us quantify, **SG&A leverage (the AI-driven headcount-discipline lever)** moves Adjusted EBITDA the most — a plausible 150bps swing either way, sized off the actual 258bps improvement Uber delivered FY2024→FY2025, is worth roughly ±$780mm of Adjusted EBITDA against an $8,730mm FY2025 base, and it is company-controlled, not external. Its current direction is mixed: the multi-year trend is favorable, but the LTM ratio (20.50%) has already reversed +63bps versus the FY2025 low (19.87%) [`03_margin-drivers.md` §3], so the swing back toward the bear case has visibly started, not merely a hypothetical. That said, two caveats matter: first, `03_margin-drivers.md` §8 names the insurance-cost/driver-incentive line as the module's own "single biggest margin driver" not because its central dollar estimate is larger, but because it is explicitly unbuffered — every dollar of the current tailwind is being reinvested into pricing, so there is zero disclosed cushion if it reverses (see §6 below). Second, if driver/worker-classification regulation ever moves against Uber in a major market, its potential magnitude — "strik[ing] directly at Uber's core independent-contractor cost structure across Mobility and Delivery simultaneously" [`10_external-dependency.md` §5] — would very likely dwarf all three quantified variables combined; it is excluded from the numeric ranking only because no company-disclosed or reliably inferable dollar figure exists, not because its potential impact is smaller.

## 5. Interaction Effects

Three of these variables are mechanically or economically linked, not independent. First, Gross Bookings growth and SG&A leverage move together in a downturn: if consumer demand softens and bookings growth decelerates (the bear case in row 1), SG&A dollars do not fall proportionally in the near term (the cost base is semi-fixed), so the SG&A bear case (row 3) is more likely to co-occur with, not offset, the revenue-growth bear case — the two largest deltas in this table can compound rather than diversify. Second, the insurance-cost line and driver/worker-classification regulation share a root cause: both are set by the same state-level insurance and tort/labor regimes [`10_external-dependency.md` §1], so a state or national move toward stricter worker classification would plausibly raise insurance/liability costs and trigger the regulatory tail risk simultaneously, not as separate, independent shocks. Third, FX and the pending Delivery Hero acquisition interact through the same euro exposure: a weaker euro reduces the USD cost of servicing the ~€14bn euro-denominated bridge facility (a partial natural offset), while a weaker basket of the international currencies Uber actually earns revenue in still hurts operating revenue translation — the two FX effects run in different directions on different parts of the business and do not net out cleanly.

## 6. Non-Linear Or Asymmetric Risks

The insurance-cost/driver-incentive line carries a disclosed asymmetry, not an inferred one: management states the current tailwind is being fully reinvested into pricing rather than banked [`03_margin-drivers.md` §8, citing Q2 FY2026 transcript], so there is no margin buffer to absorb a reversal — the bear case in row 2 of §2 would hit Adjusted EBITDA directly and immediately, with nothing else in the cost structure disclosed as available to offset it. Separately, the revenue-growth sensitivity in row 1 likely understates true bear-case severity: its ±$581mm figure uses an incremental EBITDA margin (~27.9%) measured during two years of double-digit growth, when SG&A and R&D were being held flat or cut as a share of a rising revenue base (operating leverage working in Uber's favor); in an actual deceleration, that same cost base cannot be cut as fast as revenue slows, so the true bear-case EBITDA hit from a bookings slowdown is plausibly larger than the linear estimate shown. Finally, driver/worker-classification regulation is a genuine step-function risk, not a continuous variable: the U.K. business-model change already shows that a single regulatory ruling can move ~400bps of reported take rate in one step [`03_margin-drivers.md` §4 flag], and a reclassification ruling in a large market (the U.S. or a major EU country) would not arrive as a gradual drift the way a cost-ratio bps move does — it is a discrete, binary trigger with a magnitude this report cannot bound.

## 7. Earnings Volatility Score

**45/100** (higher = worse; inverted per CLAUDE.md §12 and `MODULE_RULES.md`).

Reason: Adjusted EBITDA has expanded for at least two straight years with a smooth, monotonic quarterly margin trend (15.11% → 19.86%, FQ3'24 → FQ2'26) [`01_historical-financials.md` §3] and the company has beaten the high end of its own Adjusted EBITDA guidance in each of the last two quarters [`04_guidance-consensus.md` §6] — this argues for the lower half of the "material sensitivity" band, not "high volatility." But three of the six variables in §2 (SG&A, an already-reversing lever worth up to ~$780mm; the unbuffered insurance-cost line; and the disclosed operating-deleverage risk in §6) can plausibly move Adjusted EBITDA by high-single-digit percentage points within twelve months, and one variable (driver/worker-classification regulation) carries a magnitude this report cannot bound at all. Per the module's Score Cap Rule ("No sensitivity disclosures and only inferred sensitivities → Earnings volatility confidence must be Low"), the confidence behind this 45/100 score is explicitly **Low**: no company-disclosed sensitivity table exists anywhere in this pool, and every dollar figure in §2 is this agent's own inference from historical cost-ratio and revenue-growth swings, not a management-provided coefficient.



---

## earnings / 08_earnings-red-flags.md

_Source: `08_earnings-red-flags.md`_

# Earnings Red Flags — UBER

Business-model module outputs ARE available for this run and are used below (`03_segment-map.md`, `06_value-chain.md`, `10_external-dependency.md`, `12_red-flags-sweep.md`, `99_business-model-synthesis.md`).

All eight required upstream earnings outputs (`00`–`07`) are present. No upstream output is missing.

## 1. Upstream Evidence Map

### Bullish Evidence

| Source Agent | Claim | Evidence | Confidence |
|---|---|---|---|
| 02_revenue-drivers | Gross Bookings grew 22% YoY, a fourth straight quarter above 20% growth; framed as durable, broad-based demand | "Gross bookings grew 22% year-on-year to more than $58 billion... marking our fourth consecutive quarter of growth above 20%" [Q2 2026 transcript, prepared remarks] | Medium — figure is management-quoted only, no audited multi-period Gross Bookings series exists in the pool |
| 03_margin-drivers / 06_earnings-quality | Adjusted EBITDA margin has expanded every quarter for at least two years (15.11% → 19.86%, FQ3'24→FQ2'26) | [01_historical-financials.md, §3] | High — cross-checked to annual totals |
| 06_earnings-quality | CFO has exceeded Adj. EBITDA every year since FY2023, reaching 115.7% in FY2025; TTM FCF over $10bn for the first time | [06_earnings-quality.md, §1–§2] | High — corroborated by management's own TTM FCF statement |
| 04_guidance-consensus | Company beat the high end of its own Adjusted EBITDA guidance in each of the last two quarters | [04_guidance-consensus.md, §6] | High |
| 06_earnings-quality | Working capital cycle shrinking (18.5→14.5 days), DSO falling — no receivables-quality concern | [06_earnings-quality.md, §3] | High |

### Bearish Evidence

| Source Agent | Claim | Evidence | Confidence |
|---|---|---|---|
| 01_historical-financials / 04_guidance-consensus | Revenue growth decelerating — two most recent quarters (+14.5%, +12.2% YoY) are the slowest of the last 8, and Revenue missed the Street's pre-print estimate in each of the last two quarters | [01_historical-financials.md, §3, §6; 04_guidance-consensus.md, §6] | High |
| 02_revenue-drivers | ~10pp gap between Gross Bookings growth (+22%) and reported Revenue growth (+12.2%) cannot be cleanly decomposed into take rate/mix/FX/M&A | [02_revenue-drivers.md, §6] | Medium — qualitative direction evidenced, precise split not resolvable from this pool |
| 06_earnings-quality / business-model 12_red-flags-sweep | GAAP net income/EPS in FY2024–FY2025 inflated by back-to-back non-cash deferred-tax valuation-allowance releases ($5,758mm, $4,346mm) | [06_earnings-quality.md, §5, §8, §10; 12_red-flags-sweep.md, §2] | High |
| 03_margin-drivers / 07_earnings-sensitivity | Insurance-cost tailwind is fully reinvested into pricing, not banked — zero disclosed buffer if it reverses | [03_margin-drivers.md, §6, §8; 07_earnings-sensitivity.md, §6] | High |
| 07_earnings-sensitivity | SG&A leverage — the single largest quantified sensitivity ($780mm) — is already reversing (LTM ratio 20.50% vs. FY2025 low of 19.87%) | [07_earnings-sensitivity.md, §4] | High |
| business-model 12_red-flags-sweep | Delivery Hero deal carries an asymmetric break fee (€700mm Uber vs. €200mm target), an ~18-month uncertain closing runway, and an unsized future P&L impact | [12_red-flags-sweep.md, §2] | High |

### Missing Evidence

| What Is Missing | Which Agent Flagged It | Impact On Setup |
|---|---|---|
| No primary SEC filing (10-K/10-Q/8-K) anywhere in the pool; all figures are Capital IQ vendor transcriptions | 00_earnings-data-triage, carried through 01–07 | No line item in this entire module has been independently verified against the audited/regulatory filing itself |
| Segment P&L is annual-only (FY2020–FY2025), no interim/LTM column | 00, 02, 03 | Current-quarter mix-shift read capped at Earnings clarity max 70 |
| Gross Bookings and Monthly Active Platform Consumers — the two KPIs the business model runs on — have no audited multi-period series, only one-off management quotes | 02_revenue-drivers, §1.2 | Bookings-driven bull narrative rests on unaudited, single-point figures |
| No FX, commodity, or interest-rate sensitivity table (Item 7A equivalent) anywhere in the pool | 07_earnings-sensitivity, §1; business-model 10_external-dependency, §2 | Every dollar figure in the sensitivity table is this module's own inference, not company-disclosed |
| No investor deck / no CFO shareholder letter in the pool | 04_guidance-consensus, §1 | Every guidance number is sourced from the vendor Guidance tab, not verified against a company-issued document |
| No FQ3 2026 Gross Bookings guidance range in the pool (only qualitative confirmation that Uber guides Gross Bookings internally) | 04_guidance-consensus, §2 | Cannot assess whether the single biggest revenue driver is set up to beat or miss its own internal bar |

### Contradictions Between Agents

| Agent A | Agent A Says | Agent B | Agent B Says | Reconcilable? (Y/N) | Which Is More Credible |
|---|---|---|---|---|---|
| 02_revenue-drivers | Frames Mobility Gross Bookings growth as "improving," "durable," the single biggest driver of the next 3–12 months | 01_historical-financials / 04_guidance-consensus | Reported Revenue is decelerating (two slowest quarters of the last 8) and has missed Street pre-print estimates twice running | Y — both are consistent with the facts once the ~10pp bookings-to-revenue gap is acknowledged, but the *framing* differs: 02 emphasizes the volume KPI, 01/04 emphasize the reported financial-statement metric | 01/04's reported-Revenue read is more credible for the earnings-module's own purpose (this module measures reported earnings, not an unaudited operational KPI); 02's own §6 flags the same gap and does not overstate it |
| 02_revenue-drivers (§3) | Cites an analyst's live-call claim that "revenue [was] up 19%" constant-currency | 01_historical-financials | CIQ-sourced reported revenue growth for the same quarter is +12.2% YoY | N — flagged explicitly by 02 itself as unreconciled, not resolved by either agent | Neither source wins outright; the CIQ figure [1_historical-financials.md §3] is the module's own primary number and is used as the anchor throughout this module — the analyst's live-call figure is treated as unverified |
| 03_margin-drivers (Section 4, quarterly gross-margin walk) | Accepts management's characterization that ~400bps of the ~500bps Mobility take-rate decline is "an optical impact" of a UK reclassification, not economic | 01_historical-financials (§3 flag) | Independently flags that the resulting ~5pp quarterly Gross Margin % jump (39.6%→45%) is not corroborated by the LTM GAAP gross margin, which moved only +225bps | Y, partially — both agents flag the same discrepancy; neither can verify the CFO's explanation against a primary filing (no 10-Q in pool) | Neither — this agent treats the CFO's explanation as management's own unverified assertion, not confirmed fact, until the 10-Q is available |

## 2. Red-Flag Scan — Category By Category

### 2.1 Data Completeness

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| No primary SEC filing (10-K/10-Q/8-K) present in the data pool — every figure used across this module is a Capital IQ vendor transcription | Triggered | High | High | [00_earnings-data-triage.md, §0, §6] | No number in this module — revenue, margin, cash flow, guidance — has been checked against the audited/regulatory source itself; all figures are one layer removed from the primary evidence |
| Segment P&L (Mobility/Delivery/Freight) is annual-only, stale ~2 quarters vs. the Jun-30-2026 period | Triggered | Medium | High | [02_revenue-drivers.md, §1; 00_earnings-data-triage.md, §5] | Current-quarter mix-shift read capped (Earnings clarity max 70, per MODULE_RULES); the "which segment is actually driving this quarter" question cannot be answered with current data |
| Gross Bookings / Monthly Active Platform Consumers — the two KPIs this business model lives on — have no audited, multi-period time series in the pool | Triggered | Medium | High | [02_revenue-drivers.md, §1.2] | The entire "bookings accelerating" bull narrative rests on isolated management quotes, not a verifiable series |
| No FX, commodity, or interest-rate sensitivity table (Item 7A equivalent) anywhere in the pool | Triggered | Low | High | [07_earnings-sensitivity.md, §1; business-model 10_external-dependency.md, §2] | Every dollar sensitivity figure in `07_earnings-sensitivity.md` is this module's own inference, explicitly labeled Low confidence |
| Change in useful-life or depreciation assumptions | Unavailable | Low | Unknown | [06_earnings-quality.md, §8] | No note-level detail on depreciation policy exists in this pool (no 10-K); cannot be assessed either way |

### 2.2 Historical Trend

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| Revenue growth decelerating (two most recent quarters, +14.5% and +12.2% YoY, are the slowest of the last 8) while Gross Bookings still grew >20% for a fourth straight quarter | Triggered | High | High | [01_historical-financials.md, §3, §6; 02_revenue-drivers.md, §6] | Central to whether the setup is "accelerating" (bookings) or "decelerating" (reported revenue) — the module cannot fully resolve which is the truer signal |
| Quarterly Gross Margin % step-change (39.6%→45.0%, FQ4'25→FQ1'26) is not corroborated by the annual/LTM GAAP gross margin, which moved only +225bps over the same window | Triggered | Medium | High | [01_historical-financials.md, §3 flag; 03_margin-drivers.md, §4 flag] | Quarterly gross-margin comparisons from FQ1'26 onward are not usable at face value without adjustment |
| Adj. EBITDA margin expansion pace is decelerating (+204bps FY2025 vs. +550bps FY2023) | Not Triggered (benign) | Low | High | [01_historical-financials.md, §1] | A normal maturation pattern as the business scales, not evidence of a breaking margin story |

### 2.3 Revenue

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| ~10pp gap between Gross Bookings growth (+22% YoY) and reported Revenue growth (+12.2% YoY) cannot be cleanly decomposed into take rate, mix, FX, or M&A | Triggered | High | High | [02_revenue-drivers.md, §6] | Without this decomposition, the module cannot distinguish "real demand growth masked by one-time accounting" from "genuine, ongoing price/take-rate erosion" — the exact fork 05_beat-miss-setup's own pre-mortem names as the single most likely failure mode |
| Reported growth this quarter and next carries a real M&A/divestiture base effect (Trendyol Go still in the year-ago Delivery base; laps in Q3 FY2026) rather than pure organic demand | Triggered | Medium | High | [02_revenue-drivers.md, §3, §5; 05_beat-miss-setup.md, §2] | A Q3 FY2026 Delivery growth "improvement" driven by lapping a divestiture must not be read as accelerating organic demand |
| Freight segment is in a structural, multi-year trough (revenue -27% from FY2022 peak, negative-to-breakeven EBITDA in 5 of 6 years) and was not discussed at all on the Q2 FY2026 call | Triggered | Low | High | [02_revenue-drivers.md, §5, Freight row; business-model 03_segment-map.md] | Bounded impact (~10% of revenue, near-zero EBITDA), but a full quarter's worth of driver commentary for this segment is simply absent |
| US/Canada is 50.9% of FY2025 revenue and the entire business is transactional (spot, per-trip/per-order) with no long-term contracts of any kind | Triggered | Low | High | [business-model 12_red-flags-sweep.md, §1, customer-geography row] | Structural — no revenue backlog exists to smooth a demand shock; every quarter's revenue must be re-earned |
| Analyst live-call claim ("revenue up 19% constant currency") for the same quarter does not reconcile with the CIQ-reported +12.2% figure | Triggered | Medium | Unclear | [02_revenue-drivers.md, §3] | Leaves the FX/constant-currency component of the growth story unresolved |

### 2.4 Margins

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| Insurance-cost / driver-incentive tailwind is being fully reinvested into pricing, not banked — zero disclosed buffer if the cost line reverses | Triggered | High | Medium | [03_margin-drivers.md, §6, §8; 07_earnings-sensitivity.md, §6] | This is a state-regulated, tort-driven cost line management does not control; a reversal hits Adjusted EBITDA directly and immediately with no offset disclosed anywhere in this pool |
| SG&A leverage — the module's single largest quantified sensitivity variable (±$780mm) — is already reversing (LTM ratio 20.50% vs. the FY2025 low of 19.87%, a +63bps move) | Triggered | High | Medium-High | [07_earnings-sensitivity.md, §3–§4; 03_margin-drivers.md, §3] | The bear-case direction on the biggest quantified swing factor has already started, not merely a hypothetical scenario |
| ~25% of the Adj. EBITDA-vs-GAAP-EBITDA gap (~$592mm FY2025, ~$630mm LTM) beyond stock-based compensation is not itemized anywhere in the pool | Triggered | Medium | High | [06_earnings-quality.md, §4] | A material slice of the headline Adjusted EBITDA figure the company guides to and the Street tracks cannot be explained from available data |
| Corporate G&A / Platform R&D is a single unallocated cost pool (-31% of total EBITDA) with no split between fixed overhead and discretionary R&D (including AV spend) | Triggered | Medium | High | [business-model 03_segment-map.md, §3] | Obscures how much of the cost base is genuinely fixed vs. discretionary — a real constraint on judging operating leverage durability |
| Quarterly Gross Margin step-change accepted as an "optical" accounting effect on management's word alone, with no primary filing (10-Q) available to verify the reclassification mechanics | Unclear | Medium | Unknown | [03_margin-drivers.md, §4 flag] | If the "optical, non-economic" framing is wrong or incomplete, the FQ1'26–FQ2'26 gross-margin improvement is smaller than it appears |

### 2.5 Guidance / Consensus

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| Company has not issued formal Revenue guidance since FQ2 2020 — the exact metric that is currently decelerating and missing has no company-guided anchor | Triggered | Medium | High | [04_guidance-consensus.md, §2] | Revenue beat/miss thresholds in `05_beat-miss-setup.md` §4 are set against the Street's own estimate history, not a company commitment — a weaker anchor than the guided EBITDA/EPS lines |
| Adjusted EBITDA and Adjusted EPS consensus now sit at (not below) management's newly issued FQ3 2026 guidance midpoints, closing the gap that supported the last two quarters' beats | Triggered | Medium | High | [04_guidance-consensus.md, §3, §7] | The "bar is fair, not low" — the two-quarter EBITDA/EPS beat pattern was partly a function of a bar the Street has now caught up to |
| Revenue estimate revisions falling (FQ3 2026 cut ~1.0% in the last month; FY2026 cut ~0.6%), with negative net revision breadth over the last month (-9) | Triggered | Medium | High | [04_guidance-consensus.md, §4–§5] | Revision momentum on the one un-guided, decelerating metric is moving the wrong direction heading into the print |
| GAAP EPS revision breadth sign-flips between windows (+18 net last month, -19 net over 3 months) | Triggered | Low | High | [04_guidance-consensus.md, §5] | Confirms GAAP EPS revisions are noise-driven (non-operating marks), not a usable signal — already correctly excluded from the guided-metric analysis |

### 2.6 Beat / Miss Setup

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| Revenue miss case (a straightforward continuation of a two-quarter miss streak, Mid-High likelihood) is simpler and more probable than the revenue beat case (Low-Mid likelihood, requires the U.K.-reclassification/mix drag to moderate) | Triggered | Medium | Medium-High | [05_beat-miss-setup.md, §2–§3] | Asymmetric setup on the metric with the least company-guided support |
| The historical "beat streak" backing the Adjusted EBITDA/EPS beat case is only two quarters — a short base rate by the module's own admission | Triggered | Low | High (as a data-limitation, not a forecast) | [05_beat-miss-setup.md, §7] | Two data points, however consistent, is a thin foundation for treating the beat pattern as a durable base rate |
| In-line Q3 print risk masking a soft, unsized Q4 guide — CFO has explicitly deferred quantifying the P&L impact of AV and Delivery Hero investment spend | Triggered | High | Unknown | [05_beat-miss-setup.md, §5, §9; 03_margin-drivers.md, §9] | Q4 is Uber's seasonally strongest quarter; an in-line Q3 print combined with a weak or newly-cost-laden Q4 guide would flip the setup from "beat streak intact" to "inflecting negative" without a Q3 miss occurring at all |

### 2.7 Earnings Quality / Accounting

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| GAAP net income and diluted EPS for FY2024 and FY2025 are dominated by a non-cash deferred-tax valuation-allowance release ($5,758mm and $4,346mm respectively, recurring two years running) | Triggered | High | Medium (probability of a future reversal / non-recurrence, not of the fact itself) | [06_earnings-quality.md, §5, §8, §10; business-model 12_red-flags-sweep.md, §2] | Anyone reading headline GAAP EPS growth (+4.56 → +4.73) as an operating signal is measuring a tax event, not the marketplace's economics; normalized EPS (+0.73 → +1.70) is the cleaner series |
| Large, sign-flipping fair-value / mark-to-market gains on equity-stake holdings embedded in GAAP net income (-$7,227mm FY2022 to +$1,832mm FY2024 to -$97mm FY2025) | Triggered | Medium | High (recurs every year) | [06_earnings-quality.md, §4, §8] | A second, independent source of GAAP-earnings noise stacked on top of the tax-benefit distortion |
| Stock-based compensation ($1,826mm FY2025, ~3.5% of revenue) excluded from Adjusted EBITDA | Triggered | Medium | High | [06_earnings-quality.md, §8] | Standard non-GAAP practice, but a real, dilutive cost the headline Adjusted EBITDA/EPS figures management guides to do not reflect |
| Deferred Tax Assets, LT now equal to ~39–40% of FY2025 total equity — a non-cash balance-sheet asset whose value is conditional on Uber generating enough future taxable income to use it | Triggered | Medium | Low-Medium (reversal probability) | [business-model 12_red-flags-sweep.md, §2] | If a valuation allowance is ever reinstated, it would appear as a large negative one-off — the mirror image of the tailwind already booked |
| "Other Long-Term Assets" grew from $3,276mm (FY2021) to $14,019mm (FY2025), faster than revenue, with composition not itemized in this pool | Unclear | Medium | Unknown | [06_earnings-quality.md, §6] | Could be equity-method investments, right-of-use assets, or capitalized costs — cannot be resolved from available data |
| CFO tracking / cash conversion | Not Triggered | — | — | [06_earnings-quality.md, §2] | CFO has exceeded Adj. EBITDA every year since FY2023 (up to 115.7% in FY2025) — checked and clean, the strongest positive signal in the dataset |
| Working capital build / receivables growing faster than revenue | Not Triggered | — | — | [06_earnings-quality.md, §3, §6] | DSO falling every year (30.3→25.1 days FY2023–FY2025); no persistent pattern |

### 2.8 Sensitivity / External Variables

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| No company-disclosed sensitivity table exists anywhere in the pool — every dollar figure in `07_earnings-sensitivity.md` is this module's own inference; the module's own Earnings Volatility Score (45/100) carries explicitly Low confidence | Triggered | Medium | High | [07_earnings-sensitivity.md, §7] | The entire sensitivity read rests on the agent's own extrapolation of historical cost ratios, not a management-provided coefficient |
| Driver/worker-classification regulation — named the "single biggest lever" — carries a magnitude this pool cannot bound at all | Triggered | High | Low (near-term) | [07_earnings-sensitivity.md, §4, §6; business-model 10_external-dependency.md, §5] | A reclassification ruling in a major market would strike Mobility and Delivery's independent-contractor cost structure simultaneously — a discrete, binary trigger, not a gradual drift |
| Multiple sensitivity variables are linked, not independent: bookings deceleration and SG&A operating-deleverage compound in a downturn; insurance-cost and regulation share the same root cause (state insurance/tort/labor regimes) | Triggered | Medium | Medium | [07_earnings-sensitivity.md, §5] | The two largest quantified deltas in the sensitivity table can move together, not diversify — the range shown likely understates true downside |
| ~49% of FY2025 revenue booked outside the U.S./Canada with no disclosed hedge ratio, compounded by a euro-denominated ~€14bn Delivery Hero bridge facility | Triggered | Medium | Unknown | [business-model 10_external-dependency.md, §1; 02_revenue-drivers.md, §3] | Two FX exposures (revenue translation vs. euro-denominated debt) run in different directions and do not net out cleanly per the module's own interaction-effects read |

### 2.9 Source Conflicts

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| An analyst's live-call statement ("bookings +22% constant currency, revenue +19%") does not reconcile with the CIQ-reported +12.2% revenue growth for the same quarter | Triggered | Medium | Unclear | [02_revenue-drivers.md, §3, §6] | Leaves an unresolved ~7pp gap between two sources describing the same quarter's revenue growth |
| Quarterly Gross Margin % (Estimates Report Consensus tab) diverges 5+pp from the annual/LTM GAAP gross margin (Income Statement tab) for the same company in the same period, only partially explained by an unverified management claim | Triggered | Medium | Unclear | [01_historical-financials.md, §3 flag; 03_margin-drivers.md, §4 flag] | Two internally-sourced CIQ series disagree with each other; resolution depends on a primary filing this pool does not contain |
| Upstream agents' framing of the earnings trajectory (02's "accelerating"/"durable" language for bookings vs. 01/04's "decelerating" reported-revenue read) | Not a hard contradiction — reconciled in §1 above | — | — | See §1, Contradictions Between Agents | Both readings are evidenced; the divergence is in emphasis (KPI vs. financial-statement metric), not in the underlying facts |

### 2.10 Narrative / Framing

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| The revenue-driver narrative ("Mobility Gross Bookings is the single biggest driver," "improving," "durable rather than one-off") is built substantially on an unaudited, management-quoted KPI, while the audited-adjacent, CIQ-reported Revenue metric is decelerating and has missed consensus for two straight quarters | Triggered | High | High | [02_revenue-drivers.md, §7; 01_historical-financials.md, §3, §6] | The module's own "single biggest driver" framing risks anchoring the reader to the more favorable of two available growth measures |
| The "earnings accelerating" impression from the Adjusted EBITDA/EPS beat streak sits alongside a GAAP net income series that is majority non-operating (deferred-tax benefit, mark-to-market swings) in both FY2024 and FY2025 | Triggered | High | High | [06_earnings-quality.md, §10; business-model 12_red-flags-sweep.md, §3–§4] | A synthesizer reading "profitability turned the corner" from GAAP net income growth would be measuring a tax and mark-to-market swing, not marketplace economics, per the business-model module's own cross-cutting-pattern finding |
| The pending Delivery Hero acquisition — an asymmetric €700mm/€200mm break fee, an ~18-month uncertain multi-jurisdiction closing runway, and an explicitly unsized future P&L impact — sits outside this module's current-quarter scope but is a real overhang the beat/miss setup does not price | Triggered | Medium | Unknown (timing and outcome both) | [business-model 12_red-flags-sweep.md, §2; 03_margin-drivers.md, §9] | The current-quarter "setup is balanced" verdict in `05_beat-miss-setup.md` does not extend to the 12-month horizon once this deal's financing and integration costs begin to show up |

## 3. Red-Flag Summary Table

| # | Category | Red Flag | Status | Severity | Probability | One-Line Impact |
|---:|---|---|---|---|---|---|
| 1 | Data Completeness | No primary SEC filing anywhere in the pool; all figures are vendor transcriptions | Triggered | High | High | No number in this module is independently verified against the audited filing |
| 2 | Historical Trend | Revenue growth decelerating (two slowest quarters of last 8) while bookings still grow >20% | Triggered | High | High | Central unresolved fork: accelerating (bookings) vs. decelerating (revenue) |
| 3 | Revenue | ~10pp bookings-to-revenue gap not decomposable into take rate/mix/FX/M&A | Triggered | High | High | Cannot separate real demand growth from genuine price/take-rate erosion |
| 4 | Margins | Insurance-cost tailwind fully reinvested, zero disclosed buffer if reversed | Triggered | High | Medium | Would hit Adjusted EBITDA directly and immediately if the tailwind reverses |
| 5 | Margins | SG&A leverage (largest quantified sensitivity, ±$780mm) already reversing | Triggered | High | Medium-High | The bear-case direction on the biggest swing factor has already started |
| 6 | Beat/Miss Setup | In-line Q3 print risk masking a soft, unsized Q4 guide (AV/Delivery Hero costs) | Triggered | High | Unknown | Could flip the setup from "beat streak intact" to "inflecting negative" without a Q3 miss |
| 7 | Earnings Quality | GAAP net income/EPS dominated by a recurring non-cash deferred-tax benefit ($5,758mm FY24 / $4,346mm FY25) | Triggered | High | Medium | Headline GAAP EPS growth is a tax event, not an operating signal |
| 8 | Sensitivity | Driver/worker-classification regulation — unbounded magnitude, single biggest lever | Triggered | High | Low (near-term) | A major-market reclassification ruling would strike Mobility and Delivery simultaneously |
| 9 | Narrative/Framing | Revenue narrative leans on unaudited Gross Bookings KPI while reported Revenue decelerates/misses | Triggered | High | High | Risks anchoring the reader to the more favorable of two available growth measures |
| 10 | Narrative/Framing | "Earnings accelerating" impression rests on Adj. EBITDA/EPS while GAAP net income is majority non-operating | Triggered | High | High | A naive GAAP-profitability read would be measuring tax/mark-to-market swings, not the business |
| 11 | Margins | ~25% of the Adj. EBITDA-vs-GAAP-EBITDA gap beyond SBC (~$592mm FY25) is not itemized | Triggered | Medium | High | A material slice of the guided EBITDA metric cannot be explained from available data |
| 12 | Margins | Corporate G&A/Platform R&D unallocated cost pool (-31% of EBITDA) not broken out | Triggered | Medium | High | Obscures how much of the cost base is fixed vs. discretionary |
| 13 | Margins | Quarterly gross-margin "optical" reclassification claim unverified against a primary filing | Unclear | Medium | Unknown | If the framing is wrong, the FQ1'26–FQ2'26 gross-margin gain is smaller than reported |
| 14 | Guidance/Consensus | No formal Revenue guidance issued since FQ2 2020 | Triggered | Medium | High | The decelerating metric has no company-guided anchor, only a Street estimate |
| 15 | Guidance/Consensus | Adj. EBITDA/EPS consensus now sits at, not below, the new guidance midpoints | Triggered | Medium | High | The beat cushion that supported the last two quarters has largely closed |
| 16 | Guidance/Consensus | Revenue estimate revisions falling, negative net breadth last month | Triggered | Medium | High | Revision momentum on the un-guided metric is moving the wrong way into the print |
| 17 | Beat/Miss Setup | Revenue miss case simpler/more probable than the revenue beat case | Triggered | Medium | Medium-High | Asymmetric setup on the metric with the least company-guided support |
| 18 | Earnings Quality | Large, sign-flipping mark-to-market gains/losses embedded in GAAP net income | Triggered | Medium | High | A second, independent source of GAAP-earnings noise |
| 19 | Earnings Quality | SBC ($1,826mm FY25, ~3.5% of revenue) excluded from Adjusted EBITDA | Triggered | Medium | High | Standard practice, but a real dilutive cost the guided metric does not reflect |
| 20 | Earnings Quality | Deferred Tax Assets now ~39–40% of total equity, contingent on future taxable income | Triggered | Medium | Low-Medium | A future valuation-allowance reinstatement would be a large negative one-off |
| 21 | Earnings Quality | "Other Long-Term Assets" growing faster than revenue, composition not itemized | Unclear | Medium | Unknown | Cannot resolve whether this reflects capitalized costs, equity stakes, or ROU assets |
| 22 | Sensitivity | No company-disclosed sensitivity table; Earnings Volatility Score confidence explicitly Low | Triggered | Medium | High | The entire sensitivity read is this module's own inference, not a management coefficient |
| 23 | Sensitivity | Bookings-deceleration and SG&A-deleverage risks can compound; insurance cost and regulation share a root cause | Triggered | Medium | Medium | The disclosed sensitivity range likely understates true downside |
| 24 | Sensitivity | ~49% of revenue FX-exposed, no disclosed hedge ratio, compounded by euro Delivery Hero facility | Triggered | Medium | Unknown | Two FX exposures run in different directions and do not net out cleanly |
| 25 | Source Conflicts | Analyst live-call "+19% constant currency" claim does not reconcile with CIQ +12.2% reported revenue | Triggered | Medium | Unclear | Leaves a ~7pp gap between two sources describing the same quarter unresolved |
| 26 | Source Conflicts | Quarterly gross margin diverges 5+pp from annual/LTM GAAP gross margin, only partly explained | Triggered | Medium | Unclear | Two internally-sourced CIQ series disagree; resolution needs a primary filing |
| 27 | Narrative/Framing | Delivery Hero deal overhang (asymmetric break fee, unsized P&L impact) not priced into the current-quarter setup | Triggered | Medium | Unknown | The "setup is balanced" verdict does not extend past the current quarter once this deal's costs begin to show |
| 28 | Beat/Miss Setup | Historical Adj. EBITDA/EPS "beat streak" backing the beat case is only two quarters | Triggered | Low | High (as a data-limitation) | A thin base rate for a pattern the setup partly relies on |
| 29 | Revenue | Freight in a multi-year trough, not discussed at all on the Q2 FY2026 call | Triggered | Low | High | A full quarter of driver commentary is absent for ~10% of revenue |
| 30 | Revenue | US/Canada 50.9% of revenue, fully transactional, no long-term contracts anywhere | Triggered | Low | High | No revenue backlog exists to smooth a demand shock |
| 31 | Guidance/Consensus | GAAP EPS revision breadth sign-flips between windows | Triggered | Low | High | Confirms GAAP EPS revisions are non-operating noise, already correctly excluded from the guided-metric read |
| 32 | Data Completeness | No FX/commodity/interest-rate sensitivity table anywhere in the pool | Triggered | Low | High | Every sensitivity dollar figure in this module is inference, not disclosure |

## 4. Red-Flag Score

| Metric | Value |
|---|---|
| Total flags triggered | 29 |
| Critical flags | 0 |
| High flags | 9 |
| Medium flags | 18 |
| Low flags | 5 |
| Unclear flags | 3 |
| Unavailable checks (data missing) | 1 |

## 5. Red-Flag Severity Verdict

**Material concerns** — high-severity flags present; earnings setup may be overstated or fragile.

The setup's cash-backed core (CFO exceeding Adjusted EBITDA for three straight years, a shrinking working-capital cycle) is genuinely clean. But the earnings *narrative* leans on two things that this scan cannot fully verify: an unaudited Gross Bookings KPI standing in for a decelerating, twice-missing reported Revenue line, and an Adjusted EBITDA/EPS beat streak sitting next to a GAAP net income series that is majority non-operating tax benefit two years running. The single most dangerous red flag is the unreconciled ~10-percentage-point gap between +22% Gross Bookings growth and +12.2% reported Revenue growth [02_revenue-drivers.md, §6] — if that gap turns out to be driven more by genuine price/take-rate erosion than by the "optical" U.K. accounting explanation management offers, the entire "demand is accelerating" framing inverts. This would be resolved by the FY2025 10-K's actual MD&A revenue bridge or the FQ3 2026 10-Q, neither of which is in this data pool.

## 6. What The Synthesis Agent Should Know

- 29 flags triggered/unclear across 10 categories: 9 High, 18 Medium, 5 Low, 3 Unclear, 1 Unavailable. Zero Critical.
- The single most dangerous red flag: the unreconciled ~10pp Gross Bookings-to-Revenue growth gap [02_revenue-drivers.md, §6] — this determines whether the setup is genuinely "accelerating" (management's framing) or "decelerating" (the reported-financials framing in 01/04). Would be resolved by a primary filing's revenue bridge, which is absent from this pool.
- No red flag here should independently change the earnings verdict category chosen by `99_earnings-synthesis` — but the synthesis should weight the reported-Revenue deceleration (two consecutive Street misses, falling revision momentum) at least as heavily as the Gross Bookings acceleration story, since 02_revenue-drivers's own optimistic framing is not fully corroborated by the module's own reported numbers.
- Score caps to carry forward: current-quarter mix-shift clarity is already capped at max 70 per the stale segment P&L (02, 03); Earnings Volatility Score confidence is explicitly Low per 07's own score cap trigger (no disclosed sensitivity table).
- Contradictions to reconcile: (1) 02's "durable"/"improving" bookings framing vs. 01/04's decelerating reported-revenue framing — both evidenced, differ in which metric is emphasized; (2) the analyst's unreconciled "+19% constant currency" claim vs. CIQ's +12.2% reported figure — neither source resolves this; (3) the quarterly gross-margin step-change vs. the LTM GAAP gross margin — CFO's "optical" explanation is unverified against a primary filing.
- Missing data that prevented a full scan: no primary 10-K/10-Q/8-K anywhere in the pool (every figure is a CIQ vendor transcription); no company-disclosed sensitivity table; no Gross Bookings/MAPC audited series; no FQ3 2026 CFO shareholder letter or investor deck.
- The setup is dirtier than the upstream agents' individual framings suggest in isolation — each of 01–07 flags its own caveats accurately, but no single upstream agent connects the bookings-vs-revenue gap, the SG&A-reversal-already-visible point, and the GAAP-earnings-quality distortion into one combined read of how fragile the "beat streak" narrative actually is. This agent's job was to make that connection explicit.

## 7. Pre-Mortem — If The Earnings Setup Fails

If this earnings setup turns out to be wrong, the most likely reason is that the ~10-percentage-point gap between +22% Gross Bookings growth and +12.2% reported Revenue growth [02_revenue-drivers.md, §6] was driven more by genuine, ongoing price/take-rate erosion in Mobility than by the "optical, non-economic" U.K. reclassification management described on the call — a claim this scan could not verify against a primary filing because no 10-Q is present in the data pool. If that is the true driver, the Adjusted EBITDA/EPS beat streak the bull case leans on is being funded by a shrinking take rate rather than durable cost discipline, and the two-quarter Revenue miss streak already visible in the data [04_guidance-consensus.md, §6] is the leading indicator that was underweighted relative to the more favorable Gross Bookings framing.
