# earnings Module Dossier — DHER

> Deterministic, lossless concatenation of every artifact in this module — the module synthesis and every specialist output, in order. Generated mechanically (no LLM rewriting), so nothing is omitted or paraphrased. This is the module's "see everything" tier; the module's decision lives in `99_*-synthesis.md` and the short read in `earnings_memo.md`.

- Generated: 2026-08-12T14:12:59Z
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

# Earnings Module — DHER (Synthesis)

## Abstract

DHER's earnings trend is mixed: statutory operating income turned positive for the first time in five years and Adjusted EBITDA guidance has landed in-line or better for three straight years, but that improvement rests on an own-delivery take-rate shift (78% of GMV) management says is running out of room in FY2026. Consensus Adjusted EBITDA sits in the guided range's upper half, roughly matching management's steer, yet revenue and EPS have missed Street repeatedly and a 12-point gap between management's stated growth and the reported figures remains unexplained. The biggest risk: FY2025's headline free cash flow excludes an implied €600–650m cash outflow tied to an auditor-flagged going-concern-adjacent risk at Glovo Spain, carried into FY2026 guidance as standing policy. The verdict is a mixed earnings setup.

## 1. Earnings Verdict

- **Verdict: Mixed earnings setup**
- Earnings quality /100: **36** — "Poor quality — significant gap between reported earnings and cash" [06_earnings-quality.md §9]
- Consensus setup /100 *(higher = more beatable)*: **50** — no formal numeric score from upstream 04; this synthesis derives it from a "fair" bar assessment (Adjusted EBITDA consensus in the guided range's upper half, matching management's own steer) tempered down from the top of the mixed band by the 5-year EPS miss streak, the unresolved 12-point revenue-reconciliation gap, and Target Price/Recommendation consensus contamination from the live Uber offer [04_guidance-consensus.md §1, §4, §6, §7]
- Earnings volatility /100 *(higher = worse)*: **66** — "High volatility" [07_earnings-sensitivity.md §7]
- Next-quarter setup: **Balanced** [05_beat-miss-setup.md §8]
- Biggest earnings driver (one line): The own-delivery take-rate/mix shift drove 61% of the one period this pool can decompose exactly (FY2024) but is explicitly guided to decelerate in FY2026, shifting the burden to GMV/order growth, which is itself accelerating (7.9%→8.8% LFL, Q4'25→Q1'26) [02_revenue-drivers.md §7].
- Biggest earnings risk (one line): FY2025's "second consecutive year of positive free cash flow" (+€250m) excludes an implied ~€600–650m legal/regulatory cash outflow tied to the same rider-classification exposure that KPMG's auditor report flags as a going-concern-adjacent "Material Uncertainty" for the Glovo Spain subsidiary (€440–770m contingent liability) — a connection no earnings-module agent (00–07) made before this review [06_earnings-quality.md §5, §10; 08_earnings-red-flags.md §2.7, §5].
- **Red-flag Severity Verdict (from 08_earnings-red-flags, reported verbatim): Critical concerns.**

## 1A. Module Disconfirmation

- **Strongest bear point:** Cash conversion (CFO/Adjusted EBITDA) collapsed to 8.8% in FY2025 from 92.2% in FY2024, and the "clean" FCF/EBITDA narrative depends on excluding a ~€600–650m cash outflow tied to an auditor-flagged going-concern-adjacent risk at Glovo Spain — if that exposure recurs in FY2026, the guided ">€200m FCF" and "in-line" Adjusted EBITDA prints could both look on-track while real cash generation disappoints [06_earnings-quality.md §2, §5, §10].
- **Strongest bull point:** Management's Adjusted EBITDA guidance track record has landed in-line or better for three straight fiscal years (FY2023 beat +1.4%, FY2024 in-line -0.1%, FY2025 in-line near the low end), and management raised its own confidence to the upper half of the FY2026 range only 35 days after setting it, explicitly citing early demand returns already visible in accelerating GMV/order growth [04_guidance-consensus.md §6; 03_margin-drivers.md §9].
- **Single killer risk:** An Italy (or other-jurisdiction) rider-employment-reclassification ruling that follows Spain's July-2025 precedent, crystallizing a cost DHER has no disclosed pass-through mechanism to price around (company's own stress test implies a -€344.5m bear case, ~38% of FY2025 Adjusted EBITDA) while simultaneously validating the auditor's going-concern-adjacent language on the same subsidiary [07_earnings-sensitivity.md §4, §6; 08_earnings-red-flags.md §2.7].
- **Disconfirming evidence already visible:** The unreconciled 12+ point gap between management's stated LFL/constant-currency revenue growth and the CIQ-computed reported-currency growth, in both of the last two reported periods (FY2025: 23% stated vs. 14.4% computed; Q1 2026: 18% stated vs. 5.8% computed) — management's own accelerating-demand narrative has not yet been verified against the numbers the Street's consensus model is actually built on [01_historical-financials.md §3, §6; 02_revenue-drivers.md §6].

## 2. Specialist Roll-Up

| Specialist | Verdict Line | Biggest Finding |
|---|---|---|
| earnings-data-triage | Sufficient — no active partial-data caps triggered | DHER is inside a live Uber acquisition approach (M&A call, Jul 16, 2026); no audited FY2025 annual report exists in the pool, so all FY2025 figures rest on Tier 5/6 sources |
| historical-financials | Revenue growth decelerating (+46.5%→+15.9%→+23.7%→+14.4%, FY2022–FY2025); Adjusted EBITDA margin expanding but gross margin inflecting downward | Management's stated Q1 2026 revenue growth (+18%) does not reconcile to the CIQ-computed +5.8% — a 12+ point unresolved gap |
| revenue-drivers | Own-delivery take-rate/mix shift is the single biggest revenue driver (61% of FY2024 growth) but is explicitly decelerating | The historically largest revenue driver is running out of runway faster than the GMV/order-volume driver replacing it |
| margin-drivers | Adjusted EBITDA margin expanding but at a sharply decelerating pace; gross margin compressing for 2 straight years | Rider-cost inflation/employment-classification regulation is the single biggest margin driver, with no disclosed pass-through mechanism |
| guidance-consensus | Bar is fair — consensus Adjusted EBITDA sits in the guided range's upper half, matching management's own steer | FY2026 EPS Normalized consensus has been cut ~€1.78 over the trailing 12 months; Target Price/Recommendation consensus is deal-contaminated by the Uber offer |
| beat-miss-setup | Setup is balanced | EPS has missed Street 5 straight years; the reported-currency vs. LFL revenue reconciliation gap is the single most likely failure mode |
| earnings-quality | Score 36/100 — "Poor quality" | FY2025's headline FCF/cash-conversion story excludes an implied ~€600–650m legal/regulatory cash outflow, carried forward as FY2026 guidance policy |
| earnings-sensitivity | Volatility 66/100 (inverted, worse) — "High volatility" | Rider-cost inflation bear case (-€344.5m) is ~38% of FY2025 Adjusted EBITDA — the single highest-magnitude, most asymmetric variable |

## 3. Reconciliation

Two disagreements surfaced across the specialist chain, both already flagged upstream rather than silently resolved one way:

1. **02_revenue-drivers frames Q4'25→Q1'26 GMV/order acceleration as "Improving" while 01_historical-financials shows CIQ-computed reported-currency revenue growth actually decelerating over the same window (19.0%→15.5%→4.7%→5.8%).** Both readings are correctly sourced to different bases — management's own LFL/constant-currency commentary versus the CIQ reported-currency series — and neither upstream agent can reconcile them from this pool. This synthesis treats the gap as **genuinely unresolved**, consistent with the conservative default (CLAUDE.md §4): DHER's own growth narrative should be treated as unverified against the reported-currency numbers the Street's consensus is built on, not adopted at face value.

2. **06_earnings-quality frames the ~€600–650m FY2025 "extraordinary" cash-outflow exclusion as a disclosure/definitional issue** ("clearly disclosed and explained... a trend-reading risk, not an aggressive-accounting pattern"), **while business-model/01_disqualifier-scan documents that KPMG's own auditor report attaches a "Material Uncertainty about the Ability of Subsidiaries to Continue as a Going Concern" note to the identical underlying exposure** (Glovo Spain rider-classification risk, €440–770m contingent liability). These are not factually inconsistent — both describe the same exposure — but the severity gap is real. Per §4 (audited filings beat transcripts/vendor exports) and the conservative-default rule, this synthesis adopts the more source-grounded, auditor-language read: the FCF-exclusion issue is escalated beyond a pure disclosure question and is the basis for the Critical severity carried in Section 1 and Section 8, consistent with 08_earnings-red-flags' own escalation.

No other material disagreements were found between specialists.

## 4. Score Cap Application

| Cap Trigger | Applied? (Y/N) | Affected Score | Final Cap |
|---|---|---|---|
| No consensus / estimate data | N — consensus data present (CIQ Estimates workbook) | Consensus setup | Not capped |
| No cash flow statement | N — annual cash flow statement present through FY2025 | Earnings quality | Not capped (36/100 stands on its own merits, not a data-absence cap) |
| No revision history | N — Trends and Revisions tabs populated | Consensus setup | Not capped |
| No verbatim transcript AND no sell-side proxy | N — two verbatim S&P CIQ transcripts present (FY2025 earnings call, Q1 2026 trading-statement call) | Earnings clarity | Not capped |
| Transcript role filled ONLY by a sell-side proxy (no verbatim) | N — verbatim transcripts present, not proxy-only | Earnings clarity | Not capped |
| Only inferred sensitivities | **Partial (Y for the single largest variable)** — most sensitivity rows carry Medium/High confidence (FX High, GMV/order growth Medium, Asia margin Medium), but the single highest-magnitude variable (rider-cost inflation, -€344.5m bear case) is explicitly Low confidence, inferred from the company's own stress-test methodology rather than a directly disclosed elasticity | Earnings volatility confidence | Confidence on the rider-cost variable specifically must be read as **Low**; the overall 66/100 volatility score stands but its single largest driver carries the weakest evidentiary basis in the table [07_earnings-sensitivity.md §2, §4] |

No cap changes the headline verdict — the "Mixed earnings setup" call rests on the genuine split between a strong Adjusted-EBITDA-guidance track record and a weak revenue/EPS/cash-quality track record (Section 3, Section 8), not on a data-absence cap.

## 5. Earnings Setup Summary

### Revenue Setup

The revenue growth engine that produced DHER's recent outperformance is not steady-state — it is dominated by an own-delivery take-rate/mix shift that management itself says is running out of runway in FY2026 as the rollout nears saturation in several segments (Europe already at 95% own-delivery share). That leaves raw GMV/order growth to carry more of the load going forward; it is accelerating (7.9%→8.8% LFL, orders 9%→10%, Q4'25→Q1'26) but from a base that includes at least one already-reversed one-time item (the Iran-conflict "eat-at-home" demand spike in Saudi Arabia, explicitly flagged by management as fully normalized by late April 2026) and one single-quarter inflection (Korea's return to growth after a two-year competitive trough) that is not yet proven across multiple quarters. The single factor that would flip the revenue direction is whether GMV/order growth holds its acceleration once the take-rate tailwind fades — a simultaneous stall in both levers would expose the underlying growth rate directly. The most consequential unresolved issue, however, is not a driver question but a measurement one: management's own stated growth (Q1 2026 "+18%"; FY2025 "+23%") sits 12+ points above the CIQ-computed reported-currency growth (+5.8% and +14.4% respectively) in both of the last two reported periods, with no bridge disclosed anywhere in the pool — this gap must be carried as genuinely uncertain, not resolved toward either figure.

### Margin Setup

Adjusted EBITDA margin has expanded every year for five straight years, but the pace of that expansion has collapsed from +814bps (FY2022) to +79bps (FY2025) — this is not a cyclical peak (management still guides continued absolute growth to €910m–€960m for FY2026) but a structurally flattening trajectory, and FY2026's stepped-up investment in loyalty programs and Integrated Verticals is explicitly named by management as the reason the guide is not a simple extrapolation of FY2025's rate. The single driver capable of taking the largest bite out of consolidated margins is rider-cost inflation transmitted through employment-reclassification regulation: delivery expenses run through 93.7% freelance/third-party riders and sit at ~49% of revenue group-wide, so the company's own 5%-cost-increase stress test implies roughly -€344.5m, about 38% of FY2025 Adjusted EBITDA and larger than the entire FY2026 guided range — and this risk is not confined to one segment the way Asia's competitive margin erosion is. DHER has no contractual or structural margin-protection mechanism for this line: there is no disclosed pass-through clause tying commission or delivery-fee rates to rider-cost inflation, and when a reclassification-driven cost shock hit Europe in FY2024, the company absorbed it rather than pricing around it, missing its own guided Adjusted EBITDA range as a direct result. The only demonstrated lever is voucher/discount discipline, not price — DHER is effectively a price-taker on its single largest cost line.

### Quality Check

The single largest gap between reported and economic earnings is cash conversion, and it just widened sharply rather than narrowing: CFO/Adjusted EBITDA fell from a healthy 92.2% in FY2024 to 8.8% in FY2025, and the headline "+€250m FCF, up 15%" figure is only reached by excluding an implied ~€600–650m cash outflow the company labels "extraordinary" — a methodology now carried into FY2026 guidance as standing policy. The adjustments bridging reported to Adjusted EBITDA are not genuinely one-time: stock-based compensation, "management adjustments" (legal/restructuring provisions), and goodwill impairments have each recurred in every one of the last five years, and the total bridge (€598.1m in FY2025) is 66% the size of the Adjusted EBITDA figure itself. Modeling normalized earnings for next year should start from the GAAP cash-flow-statement figures (CFO minus capex) as the anchor, treating Adjusted EBITDA as a directional-only guide — the gap between the two bases is now too large, too structurally recurring, and too closely tied to an auditor-flagged going-concern-adjacent exposure to build a forward model on the non-GAAP figure alone.

### Consensus Bar

For DHER to beat the current bar by a material margin, reported-currency revenue growth would need to actually resolve toward management's higher LFL framing (validating the "+18%" Q1 2026 claim against the CIQ-computed +5.8% reported-currency figure), and the margin-rate gains at Integrated Verticals and Americas — which drove 71% of the entire FY2025 Adjusted EBITDA increase, not volume — would need to hold or extend. The bar looks roughly correctly priced on Adjusted EBITDA itself (consensus €951.85m sits in the guided range's upper half, matching management's own steer), but the Free Cash Flow consensus (€220.14m) looks set too high relative to the FY2025 precedent, where a guided ~€120m point became a reported -€246m once extraordinary items were folded in — a comparable pattern in FY2026 would blow through the >€200m floor the Street is currently modeling. Part of the current calm in EPS revisions is an artifact of a prior cut, not a stable base: the FY2026 EPS Normalized consensus has already been cut ~€1.78 over the trailing 12 months (from €1.71 to -€0.07), and DHER has missed Street's EPS estimate in every one of the last five reported fiscal years.

## 5b. Leverage & Capital Structure

Leverage is within normal range and did not change materially during the period — no dedicated treatment required. (Net debt / Adjusted EBITDA was 2.68x at FY2024-end and 2.78x at FY2025-end — below the 3.0x Trigger-A threshold — and the year-over-year ratio change of +0.10x and net-debt change of +35% (€1,858.7m → €2,512.8m) both fall well short of the Trigger-B thresholds [01_historical-financials.md §1].) The Glovo Spain going-concern-adjacent contingent liability (€440m–€770m) discussed in Section 1A and Section 8 is a litigation/contingent-liability exposure, not a funded-debt leverage metric, and does not itself trigger this section — it is instead carried in Section 8 per the red-flag propagation rule.

## 6. Key Numbers

- Revenue growth rate: FY2025 +14.4% YoY (€14,059.6m vs. €12,294.7m); Q1 2026 CIQ-computed +5.8% vs. management-stated +18% (unreconciled 12+ point gap) [01_historical-financials.md §1, §3]
- EBITDA margin: Adjusted EBITDA margin 6.4% FY2025, +79bps YoY (pace decelerating sharply from +814bps FY2022) [01_historical-financials.md §1, §6]
- EPS: FY2025 diluted GAAP EPS -€2.62; CIQ-normalized -€0.86 [01_historical-financials.md §1, §4]
- CFO / EBITDA: 8.8% FY2025, down from 92.2% FY2024 — 2 of the last 3 fiscal years below 50% [06_earnings-quality.md §1, §2]
- Biggest driver current level: own-delivery share 78% of Group GMV FY2025, up from 67% FY2024, but guided to decelerate in FY2026 [02_revenue-drivers.md §4, §7]
- Consensus gap: FY2026 Adjusted EBITDA consensus €951.85m vs. guidance midpoint €935m, +1.8% (inside the guided range's upper half) [04_guidance-consensus.md §3]
- Estimate revision direction: flat/near-flat on core operating lines over the last 90 days; FY2026 EPS Normalized cut ~€1.78 over the trailing 12 months [04_guidance-consensus.md §4, §5]
- Earnings volatility score: 66/100 (inverted, higher = worse) — "High volatility" [07_earnings-sensitivity.md §7]

## 7. What Would Change The Earnings Verdict?

| Current Verdict | What Would Upgrade It | What Would Downgrade It | Data Needed |
|---|---|---|---|
| Mixed earnings setup | The Aug-27 FQ2 2026 print resolves the revenue-reconciliation gap toward management's higher LFL framing on a reported-currency basis; FY2026 FCF lands on guide without a comparably large "extraordinary" exclusion; an audited FY2025 annual report narrows or removes the going-concern-adjacent language on Glovo Spain | The Aug-27 print confirms reported-currency growth decelerating toward the CIQ-consistent rate (4.7%–5.8%); Italy's rider-reclassification follows Spain's precedent, crystallizing a comparable or larger cash cost; FY2026 FCF again misses the >€200m floor via the same extraordinary-item exclusion methodology | Audited FY2025 annual report (to confirm or update the going-concern note and contingent-liability figures); a quarterly Adjusted EBITDA/CFO/FCF series (to build a clean TTM/QoQ read instead of relying on annual/half-year granularity) |

## 8. Note To The Final Synthesizer

- **Red-flag Severity Verdict (verbatim from 08_earnings-red-flags): Critical concerns.**
- **RF-EQ-002 (cash-conversion breakdown)** — fired in 06_earnings-quality; propagated here as a standalone forensic tag per CLAUDE.md §13 / eval check AQ, even though the module's own Earnings Quality Score (36/100) already absorbs the underlying finding.
- **Critical flag #1 (surfaced by 08, not by any earnings-module agent 00–07):** KPMG's auditor report carries a subsidiary-level "Material Uncertainty about the Ability of Subsidiaries to Continue as a Going Concern" note on Glovo Spain (contingent liability €440m–€770m), tied to the identical rider-classification exposure driving the FY2025 cash-conversion collapse and FCF exclusion. This is the single most consequential connection missed by the specialist layer and is the primary reason this synthesis adopts "Mixed" rather than a more constructive verdict.
- **Critical flag #2:** FY2025's "+€250m FCF, +15% YoY" headline excludes an implied ~€600–650m legal/regulatory cash outflow; the identical exclusion methodology stands as FY2026 guidance policy — a repeat of a comparable outflow would let the FY2026 print look "on guide" while cash generation disappoints.
- **High flags:** cash conversion (CFO/Adjusted EBITDA) at 8.8% FY2025, 2 of last 3 years below 50%; rider-cost inflation with no pass-through mechanism (bear case ~38% of FY2025 Adjusted EBITDA); the unresolved 12+ point revenue-reconciliation gap (05's own named most-likely failure mode); Adjusted EBITDA non-GAAP adjustments at 66%–100%+ of the metric itself, recurring every year; EPS missed Street 5 straight fiscal years, revenue missed 3 of the last 4; the FY2026 FCF guidance floor uses the identical exclusion construct that produced a -€366m miss against the FY2025 guide.
- Dominant earnings trend: profitability (Adjusted EBITDA, statutory EBIT) is genuinely improving on a level basis, but the growth engine behind it (own-delivery take-rate shift) is fading and the cash quality behind the profitability improvement is poor — these two facts do not average into a single clean direction.
- Whether earnings are clean and cash-backed: no — cash conversion collapsed to 8.8% in FY2025 and the FCF headline depends on excluding a cash outflow tied to an auditor-flagged going-concern-adjacent risk.
- Consensus bar assessment: roughly fairly priced on Adjusted EBITDA (the metric with the best track record), but the FCF consensus looks too high relative to the FY2025 precedent, and Target Price/Recommendation consensus is contaminated by the live Uber acquisition offer.
- Next-quarter setup and second-quarter look-ahead: balanced for the Aug-27 FQ2 2026 print (seasonally the weakest quarter); FQ3 2026 looks structurally different — the Spain rider-transition annualizes (tailwind) while the Taiwan divestiture closing (mechanical headwind to Asia) has undisclosed timing within H2.
- Top sensitivity variable and its current direction: rider-cost inflation / employment-classification regulation — contained but not resolved (Italy risk unresolved), and the confidence on this specific variable is Low (Section 4).
- Whether any partial-data cap applied and what it limits: no formal data-absence cap applied (Section 4); the only limitation carried forward is that the rider-cost sensitivity — the single largest variable in the table — rests on Low-confidence, inferred stress-test math rather than a directly disclosed elasticity.
- Biggest missing data point: an audited FY2025 annual report (or any standalone interim financial-statement filing) that would confirm or update the going-concern language and the €440m–€770m contingent-liability figure, currently FY2024-vintage and unconfirmed for FY2025.
- What would change the earnings verdict: see Section 7 — the Aug-27 print's resolution of the revenue-reconciliation gap and whether a comparable "extraordinary" cash outflow recurs in FY2026 are the two most decisive near-term tests.

## 9. Simple Summary

- Revenue is growing but decelerating on the numbers everyone can check (+14.4% FY2025), while management's own claimed growth rate (18%–23%) runs 12+ points higher and has never been reconciled — that gap alone is a real reason for caution.
- Margins are a split story: the metric management guides to (Adjusted EBITDA) keeps expanding, but gross margin has fallen for two straight years, and the pace of Adjusted EBITDA margin expansion has nearly stopped (from +814bps to +79bps a year).
- Earnings are not clean: cash conversion collapsed to 8.8% in FY2025, and the "positive free cash flow" headline only works by excluding a ~€600–650m cash outflow tied to a risk the company's own auditor flagged as going-concern-adjacent for one of its subsidiaries.
- The consensus bar is fair on the metric that matters most (Adjusted EBITDA) but looks too optimistic on free cash flow, given the FY2025 precedent of a huge guided-vs-reported gap.
- Next quarter's setup is balanced — not clearly a beat or a miss — and it lands in the seasonally weakest quarter of the year, inside a live Uber takeover process that could overshadow the print itself.
- The single biggest swing factor is rider-cost regulation: a bad outcome (an Italy ruling like Spain's) could wipe out more than a third of a year's Adjusted EBITDA, and DHER has no way to price around it.
- Earnings volatility is high (66/100, worse than average) — GAAP EPS has swung wildly for five years straight and the company has missed Street's EPS estimate every single year in that span.
- This module is useful to the final synthesizer specifically because it connects a cash-quality problem (06) to an auditor-flagged risk (business-model module) that no single specialist report made on its own — that connection should carry real weight in the overall rating.



---

## earnings / 00_earnings-data-triage.md

_Source: `00_earnings-data-triage.md`_

# Earnings Data Triage — DHER

## 0. Jurisdiction & Reporting Regime

| Item | Detected Value | Evidence |
|---|---|---|
| Primary listing country | Germany | Annual Report states listing on the "Prime Standard segment of the Frankfurt Stock Exchange" [FY24 Annual Report, cover/corporate governance section]; ticker XTRA:DHER (Deutsche Börse Xetra) confirmed across all Capital IQ exports |
| Exchange | Deutsche Börse Xetra (Prime Standard, Frankfurt Stock Exchange) | Capital IQ workbook headers: "Delivery Hero SE (XTRA:DHER)" [all CIQ tabs] |
| Filing regime (US SEC / India SEBI-LODR / UK / Other) | Other — EU/Germany, SE (Societas Europaea) regulated under German/EU disclosure rules (BaFin) | No US SEC forms or India SEBI filings in the pool; local documents present are the German-regime Annual Report and S&P CIQ earnings/trading-statement call transcripts standing in for interim disclosure |
| Reporting standard (US GAAP / IFRS / Ind AS) | IFRS as adopted by the EU, consolidated | FY24 Annual Report text: "International Financial Reporting Standards (IFRS) as adopted by the [EU]"; Capital IQ Estimates workbook header: "Acctg. Standard: IFRS" [DeliveryHeroSEXTRADHEREstimatesReport.xls, Consensus tab] |
| Reporting currency | EUR | CIQ Financials workbook: "Currency: Reported Currency ... EUR" [Delivery Hero SE XTRA DHER Financials.xls, Balance Sheet / Income Statement / Cash Flow tabs]; Annual Report tables in "EUR million" |
| Fiscal-year end | December 31 | CIQ workbooks: "For the Fiscal Period Ending ... Dec-31-2025" [Income Statement, Balance Sheet, Cash Flow tabs]; "Current Fiscal Year End: Dec-31-2026" [Estimates workbook, Consensus/Guidance/Surprise/Trends/Revisions tabs] |
| Document language(s) | English (all documents in the pool — Annual Report, transcripts, Capital IQ exports) | Direct read of all extracted files; no non-English document encountered, so §27's "language is not a data gap" is not triggered either way |

Downstream agents should read the Annual Report as the Tier-1 audited source (§4) for FY2024, and treat the FY2025/FQ1 2026 figures sourced from the CIQ workbook and earnings-call transcripts as Tier-5/Tier-6 pending an audited FY2025 filing. **DHER is currently subject to a live, announced acquisition offer from Uber** (M&A Call transcript, Jul 16, 2026) — the earnings module should flag guidance/consensus reads as occurring inside an active M&A situation, not steady-state standalone commentary.

## 1. File Inventory

Multi-tab workbooks were pre-extracted with `.claude/tools/extract_pool.py` (`analyses/DHER_2026-08-12/_pool_extracts/`, manifest: 3 workbooks → 28 tabs, 37 extract files, 0 failures — none of the three workbooks failed or fell back). Every workbook tab is listed as its own row, reconciled against `_pool_extracts/manifest.md`.

| Filename | Type | Period Covered | Last Modified | Earnings Relevance |
|---|---|---|---|---|
| Delivery_Hero_SE-Annual_Report(Apr-25-2025).pdf | Annual filing (Annual Report incl. Combined Management Report + audited IFRS consolidated financials + Auditor's Report) | FY2024 (year ended Dec-31-2024); published Apr 25, 2025 | Aug 10, 2025 (Drive sync date — not authoritative, F23) | High |
| Delivery_Hero_SE_-_Form_Annual_Report(Apr-25-2025).pdf | Annual filing — byte-identical duplicate (MD5-identical to the file above) | Same as above | Aug 10, 2025 (sync date) | High (same document, counted once) |
| Delivery Hero SE, 2025 Earnings Call, Mar 26, 2026.pdf | Earnings transcript — verbatim (S&P CIQ FY2025 full-year earnings call, prepared remarks + Q&A) | FY2025 actuals (Revenue €14,059.6m vs. consensus €14,212.8m; EPS Normalized €(1.32) vs. consensus €0.51); call held Mar 26, 2026 | Aug 10, 2025 (sync date) | High — reports FY2025 actuals ahead of any FY2025 audited annual report being in the pool |
| Delivery Hero SE, Q1 2026 Sales_ Trading Statement Call, Apr 30, 2026.pdf | Earnings transcript — verbatim (S&P CIQ Sales/Trading Statement Call, prepared remarks + Q&A); quarterly-equivalent | Q1 2026 (call held Apr 30, 2026) | Aug 10, 2025 (sync date) | High — closest surrogate in the pool for a Q1 2026 quarterly filing; no interim financial-statement filing itself is present |
| Uber Technologies, Inc., Delivery Hero SE - M&A Call.pdf | Deal / M&A transcript — verbatim (S&P CIQ), NOT an earnings call | Call held Jul 16, 2026 | Aug 10, 2025 (sync date) | Medium — material event overlay (announced acquisition offer), not itself an earnings source; most recent document in the pool by call date |
| Delivery Hero SE XTRA DHER Analyst Coverage.rtf | Data export (sell-side coverage list — names/ratings/targets only, not an earnings-call summary) | Undated snapshot | Aug 10, 2025 (sync date) | Low — not a transcript proxy (no call-summary content), just a coverage roster |
| Delivery Hero SE XTRA DHER Competitors.rtf | Data export (competitor list) | Undated snapshot | Aug 10, 2025 (sync date) | Low |
| Delivery Hero SE XTRA DHER Customers.rtf | Data export (customer relationships) | Undated snapshot | Aug 8, 2025 (sync date) | Low |
| Delivery Hero SE XTRA DHER Fixed Income Securities Summary.rtf | Data export (debt securities) | Undated snapshot | Aug 10, 2025 (sync date) | Low for earnings; relevant to balance-sheet-survival module |
| Company Comparable Analysis Delivery Hero SE.xls — Financial Data | Data export (workbook tab) | Multi-year financials, USD, As-Of 2026-08-10 | same | Medium |
| Company Comparable Analysis Delivery Hero SE.xls — Trading Multiples | Data export (workbook tab) | As-Of 2026-08-10 | same | Medium |
| Company Comparable Analysis Delivery Hero SE.xls — Operating Statistics | Data export (workbook tab) | As-Of 2026-08-10 | same | Low |
| Company Comparable Analysis Delivery Hero SE.xls — Business Description | Data export (workbook tab) | As-Of 2026-08-10 | same | Low |
| Company Comparable Analysis Delivery Hero SE.xls — Implied Valuation | Data export (workbook tab) | As-Of 2026-08-10 | same | Low (out of scope for earnings) |
| Company Comparable Analysis Delivery Hero SE.xls — Valuation Chart | Data export (workbook tab) | As-Of 2026-08-10 | same | Low |
| Company Comparable Analysis Delivery Hero SE.xls — Credit Health Panel | Data export (workbook tab) | As-Of 2026-08-10 | same | Low |
| Company Comparable Analysis Delivery Hero SE.xls — Disclaimer | Data export (workbook tab) | n/a | same | n/a |
| Delivery Hero SE XTRA DHER Financials.xls — Key Stats | Data export (workbook tab) | Annual, Dec-31-2021A → Dec-31-2027E, EUR; includes current Share Price €37.2 and Market Cap | Aug 10, 2025 (sync date) | High |
| Delivery Hero SE XTRA DHER Financials.xls — Income Statement | Data export (workbook tab) | Annual, Dec-31-2020 (Restated) → Dec-31-2025, EUR | same | High |
| Delivery Hero SE XTRA DHER Financials.xls — Balance Sheet | Data export (workbook tab) | Annual, Dec-31-2020 (Restated) → Dec-31-2025, EUR | same | High |
| Delivery Hero SE XTRA DHER Financials.xls — Cash Flow | Data export (workbook tab) | Annual, Dec-31-2020 (Restated) → Dec-31-2025, EUR | same | High |
| Delivery Hero SE XTRA DHER Financials.xls — Multiples | Data export (workbook tab) | — | same | Low |
| Delivery Hero SE XTRA DHER Financials.xls — Historical Capitalization | Data export (workbook tab) | EUR | same | Low |
| Delivery Hero SE XTRA DHER Financials.xls — Capital Structure Summary | Data export (workbook tab) | EUR | same | Medium |
| Delivery Hero SE XTRA DHER Financials.xls — Capital Structure Details | Data export (workbook tab) | EUR | same | Low |
| Delivery Hero SE XTRA DHER Financials.xls — Ratios | Data export (workbook tab) | — | same | Medium |
| Delivery Hero SE XTRA DHER Financials.xls — Supplemental | Data export (workbook tab) | EUR | same | Low |
| Delivery Hero SE XTRA DHER Financials.xls — Industry Specific | Data export (workbook tab) | EUR | same | Low |
| Delivery Hero SE XTRA DHER Financials.xls — Pension OPEB | Data export (workbook tab) | EUR | same | Low |
| Delivery Hero SE XTRA DHER Financials.xls — Segments | Data export (workbook tab) | Annual, restated series, Dec-31-2020 → Dec-31-2025, EUR | same | High — segment GMV/revenue/Adj. EBITDA by region (Asia, MENA, Europe, Americas, Integrated Verticals) |
| DeliveryHeroSEXTRADHEREstimatesReport.xls — Consensus | Data export (workbook tab) | Annual FY estimates + quarterly (FQ) actual/estimate series from FQ3 2017 through FQ4 2026; current fiscal-year end Dec-31-2026, next print FQ2 2026 due Aug-27-2026 | Aug 10, 2025 (sync date) | High — includes recommendation mix (Hold, mean 2.86), target price mean €37.97, and quarterly Revenue actuals through FQ1 2026 |
| DeliveryHeroSEXTRADHEREstimatesReport.xls — Recent Changes | Data export (workbook tab) | — | same | Medium |
| DeliveryHeroSEXTRADHEREstimatesReport.xls — Guidance | Data export (workbook tab) | Historical formal-guidance-vs-actual, FY2017–FY2022 populated; FY2023–FY2026 rows blank (no formal numeric guidance range captured for those years in this export) | same | Medium |
| DeliveryHeroSEXTRADHEREstimatesReport.xls — Multiples | Data export (workbook tab) | Current Fiscal Year End: Dec-31-2026 | same | Low |
| DeliveryHeroSEXTRADHEREstimatesReport.xls — Surprise | Data export (workbook tab) | Annual EPS Normalized / EPS GAAP surprise history FY2017–FY2025 (Announced Dates through 2026-03-25) | same | High — beat/miss history |
| DeliveryHeroSEXTRADHEREstimatesReport.xls — Trends | Data export (workbook tab) | EPS Normalized estimate-revision trend by vintage (current, 1/2/3/6/9/12/18 months ago), FY2026–FY2035 | same | High — revision momentum |
| DeliveryHeroSEXTRADHEREstimatesReport.xls — Revisions | Data export (workbook tab) | Analyst count / upward-downward revision counts by month, FY2026–FY2035 | same | High — revision momentum |

Note on "Last Modified": these are Drive-sync timestamps (Aug 8–10, 2025), not document dates. Per fix F23, document currency is taken from dates printed inside each document. Several documents (the Q1 2026 call, the M&A call, and the Comparable Analysis "As-Of Date: 2026-08-10") post-date the sync timestamp, confirming the sync date is not a reliable freshness signal and is not used for the sufficiency read below.

No `ciq_facts.json` sidecar exists at `analyses/DHER_2026-08-12/_pool_extracts/ciq_facts.json`. Headline figures cited in this triage are this agent's own sourced read of the workbooks/filings/transcripts, each individually cited.

## 1A. External Data

Not applicable — no `data/DHER/external/` directory exists in this pool. No externally sourced research (alt-data panels, expert calls, channel checks, broker research) is present; nothing here affects the sufficiency verdict.

## 2. Most Recent Sources

| Source Type | Filename | Period | Age (months, to 2026-08-12) |
|---|---|---|---|
| Annual filing | Delivery_Hero_SE-Annual_Report(Apr-25-2025).pdf | FY2024 (year ended Dec-31-2024); published Apr 25, 2025 | ~15.6 months from publish date; ~19.4 months from period end — no FY2025 audited annual report is present |
| Quarterly filing | None present (no standalone interim financial-statement filing in the pool) | — | — |
| Earnings transcript | Delivery Hero SE, Q1 2026 Sales/Trading Statement Call, Apr 30, 2026.pdf (verbatim) | Q1 2026 | ~3.4 months |
| Earnings transcript (secondary, full-year) | Delivery Hero SE, 2025 Earnings Call, Mar 26, 2026.pdf (verbatim) | FY2025 actuals | ~4.6 months |
| Investor deck | None present | — | — |
| Consensus / estimate export | DeliveryHeroSEXTRADHEREstimatesReport.xls — Consensus tab | FY2026E, target price mean €37.97 as of consensus data | ~0.1 months (CIQ export, exact "data as of" not separately timestamped beyond FQ2 2026 release date field) |
| Cash flow data | Delivery Hero SE XTRA DHER Financials.xls — Cash Flow tab | Annual through Dec-31-2025 | Latest column FY2025 (audited-equivalent via CIQ, actual not audited filing) |
| Guidance data | DeliveryHeroSEXTRADHEREstimatesReport.xls — Guidance tab | Populated FY2017–FY2022; FY2023–FY2026 rows blank in this export | — |

## 3. Earnings Usability Check

| Requirement | Available? (Y/N) | Source | Why It Matters |
|---|---|---|---|
| Income statement | Y | Delivery Hero SE XTRA DHER Financials.xls, Income Statement tab (annual, through FY2025), and FY24 Annual Report (audited) | Needed for revenue, margin, EPS |
| Balance sheet | Y | Delivery Hero SE XTRA DHER Financials.xls, Balance Sheet tab (annual, through Dec-31-2025), and FY24 Annual Report (audited) | Needed for working capital and leverage |
| Cash flow statement | Y | Delivery Hero SE XTRA DHER Financials.xls, Cash Flow tab (annual, through FY2025), and FY24 Annual Report (audited) | Needed for CFO, FCF, earnings quality |
| Latest quarter | Y (partial) | DeliveryHeroSEXTRADHEREstimatesReport.xls, Consensus tab — quarterly Revenue actuals through FQ1 2026 (Mar 2026); plus Q1 2026 Sales/Trading Statement Call transcript (Apr 30, 2026) for qualitative colour. No FQ2 2026 print yet (scheduled Aug-27-2026, after this run's data cutoff) | Needed for trend and setup |
| Last 8 quarters | Y (partial) | DeliveryHeroSEXTRADHEREstimatesReport.xls, Consensus/Surprise tabs — quarterly Revenue series runs FQ1 2025 through FQ1 2026 actuals (and further back, non-contiguous for some quarters, e.g. FQ4 2024 blank); EBITDA quarterly is sparse/mostly blank in recent quarters — no full 8-quarter EBITDA/margin series is populated in this export | Needed for seasonality and inflection |
| Consensus estimates | Y | DeliveryHeroSEXTRADHEREstimatesReport.xls, Consensus tab — Target Price mean €37.97, Recommendation Hold (2.86), FY2026E/FY2027E EPS and revenue | Needed for market bar |
| Estimate revisions | Y | DeliveryHeroSEXTRADHEREstimatesReport.xls, Trends and Revisions tabs — EPS Normalized estimate history by vintage, analyst upward/downward revision counts | Needed for revision momentum |
| Earnings transcript | Y (verbatim) | Delivery Hero SE, 2025 Earnings Call (Mar 26, 2026) and Q1 2026 Sales/Trading Statement Call (Apr 30, 2026) — both S&P CIQ verbatim transcripts with prepared remarks and Q&A | Needed for management tone and driver detail |
| Segment P&L | Y | Delivery Hero SE XTRA DHER Financials.xls, Segments tab — GMV/revenue/Adj. EBITDA by region (Asia, MENA, Europe, Americas, Integrated Verticals), annual through FY2025; also business-model `03_segment-map.md` | Needed for mix shift |
| Current price | Y | Delivery Hero SE XTRA DHER Financials.xls, Key Stats tab — "Latest Capitalization": Share Price €37.2, Market Capitalization €11,299.3m | Needed only for master-level stock reaction context |

## 4. Cross-Module Availability

| Business-Model Output | Available? (Y/N) |
|---|---|
| 03_segment-map.md | Y |
| 06_value-chain.md | Y |
| 10_external-dependency.md | Y |

The full business-model module has completed (00 through 99, plus dossier) at `analyses/DHER_2026-08-12/business-model/`. That module's `00_data-triage.md` independently confirms the same jurisdiction/regime findings and flags the live Uber M&A call as a material overlay — consistent with this triage.

## 5. Partial-Data Flags

| Missing Data | Applies? (Y/N) | Affected Agents | Cap Applied |
|---|---|---|---|
| No consensus / estimate data | N — consensus data IS present (CIQ Estimates workbook, Consensus/Trends/Revisions/Surprise tabs) | 04, 05, 99 | None |
| No quarterly data | N (partial) — quarterly Revenue actuals present through FQ1 2026, but no standalone quarterly financial-statement filing and no full 8-quarter EBITDA/margin series | 01, 02, 03, 06 | No score cap triggered (quarterly data is not absent, only thinner than a filed 10-Q/quarterly-results equivalent would give); note the gap explicitly when doing QoQ/seasonality work |
| No VERBATIM transcript, sell-side proxy present | N — verbatim transcripts ARE present (both the FY2025 Earnings Call and the Q1 2026 Sales/Trading Statement Call are S&P CIQ verbatim call transcripts, not sell-side proxies) | 02, 03, 04 | None |
| No transcript AND no sell-side proxy | N | 02, 03, 04 | None |
| No segment-level P&L | N — Segments tab (CIQ) and business-model `03_segment-map.md` both provide segment revenue/Adj. EBITDA by region | 02, 03, 99 | None |
| No cash flow statement | N — annual cash flow statement present through FY2025 (CIQ) and FY2024 (audited Annual Report) | 06, 99 | None |
| No current price | N — Share Price €37.2 / Market Cap €11,299.3m present (Key Stats tab, "Latest Capitalization") | 99 | None |

## 6. Sufficiency Verdict

- **Verdict:** Sufficient
- **Reason:** The pool has an audited annual filing (FY24 Annual Report, published Apr-25-2025, inside the sufficiency window) AND two verbatim earnings-call transcripts inside the last 5 months (FY2025 results call, Mar-26-2026; Q1 2026 trading-statement call, Apr-30-2026) AND a full income statement, balance sheet, and cash flow statement (through FY2025 via the CIQ workbook, through FY2024 via the audited filing) — both legs of the sufficiency rule (annual + quarterly/transcript, and the three core statements) are met, plus segment P&L, consensus estimates, revision history, and a current price.
- **Active partial-data caps:** None triggered — this is not a Partial verdict.
- **Critical missing items (do not block the verdict, but downstream agents should account for them):**
  - No audited FY2025 annual report is present. The only FY2025 full-year numbers in the pool come from the verbatim earnings-call transcript (Tier 6, per this module's source hierarchy) and the Capital IQ workbook exports (Tier 5), not an audited Tier-1 filing. The FY2024 Annual Report remains the most recent Tier-1 source and its numbers are ~19.4 months old relative to today.
  - No standalone quarterly/interim financial-statement filing is present — the closest surrogate is the Q1 2026 "Sales/Trading Statement Call" transcript plus quarterly Revenue actuals in the CIQ Consensus tab. Quarterly EBITDA/margin data is sparse (mostly blank) in the exported series, so a clean, contiguous 8-quarter EBITDA/margin trend is not directly available — agents doing QoQ/seasonality work on margins should state this limitation rather than interpolate.
  - No investor presentation/deck is present in the pool.
  - No `external/` documents and no `ciq_facts.json` sidecar exist for this ticker/date.
  - DHER is currently the subject of an announced acquisition offer from Uber (M&A Call transcript, Jul 16, 2026, ~0.9 months old — the most recent document in the pool). Downstream agents (especially 04_guidance-consensus, 05_beat-miss-setup, and 99_earnings-synthesis) should treat any post-Jul-16-2026 guidance, consensus, or price commentary as occurring inside a live M&A situation and flag it accordingly, rather than reading it as a steady-state standalone earnings setup.



---

## earnings / 01_historical-financials.md

_Source: `01_historical-financials.md`_

# Historical Financials — DHER

Reporting standard: **IFRS as adopted by the EU**, consolidated [1]. Reporting currency: **EUR** (euro), figures in EUR million unless stated per-share [4][5][6]. Fiscal year end: **31 December** [4]. Listing: Deutsche Börse Xetra (XTRA:DHER), Prime Standard, Frankfurt [00_earnings-data-triage.md]. No audited FY2025 annual report is present in the pool — FY2025 full-year figures below come from the verbatim FY2025 earnings-call transcript (management-stated figures) and the Capital IQ workbook export, cross-checked against each other; FY2021–FY2024 figures are cross-checked against the audited FY2024 Annual Report where that report covers the year (FY2023, FY2024). This is flagged wherever it matters.

DHER is currently the subject of a live, announced acquisition approach from Uber and has an ongoing strategic review (JPMorgan-advised) [10]. The most recent commentary (Q1 2026 trading-statement call, Apr 30, 2026) sits inside that live situation — noted here for downstream modules, not analyzed further in this agent.

## 1. Annual Financial Table (5 years, FY2021–FY2025)

Currency: EUR million, except per-share items (EUR).

| Metric | FY2021 | FY2022 | FY2023 | FY2024 | FY2025 | Trend |
|---|---:|---:|---:|---:|---:|---|
| Revenue | 5,855.6 | 8,577.3 | 9,941.9 | 12,294.7 | 14,059.6 | Decelerating |
| Revenue YoY % | +136.9% | +46.5% | +15.9% | +23.7% | +14.4% | Decelerating |
| Gross Profit | 1,258.0 | 2,231.8 | 2,972.7 | 3,329.2 | 3,433.1 | Inflecting |
| Gross Margin % | 21.5% | 26.0% | 29.9% | 27.1% | 24.4% | Inflecting |
| EBITDA (Adjusted, company-defined)¹ | -795.6 | -467.2 | 253.6 | 692.5 | 903.0 | Decelerating |
| EBITDA Margin % (Adjusted)¹ | -13.6% | -5.5% | 2.6% | 5.6% | 6.4% | Decelerating |
| EBIT (reported Operating Income) | -1,658.5 | -1,437.0 | -707.4 | -261.2 | 93.7 | Inflecting |
| EBIT Margin % | -28.3% | -16.8% | -7.1% | -2.1% | 0.7% | Inflecting |
| EPS (diluted, GAAP) | -4.57 | -11.28 | -8.57 | -3.10 | -2.62 | Volatile |
| CFO | -901.4 | -688.8 | -19.5 | 638.3 | 79.5 | Volatile |
| Capex (PP&E + capitalized intangibles)² | -320.9 | -251.5 | -260.0 | -279.5 | -325.8 | Stable |
| FCF (CFO – Capex)² | -1,222.3 | -940.3 | -279.5 | 358.8 | -246.3 | Volatile |
| Working Capital (Curr. Assets – Curr. Liab.) | 1,840.2 | 1,126.5 | -109.9 | 1,463.6 | -133.9 | Volatile |
| Net Debt (strict: total debt − cash)³ | 2,071.3 | 3,266.8 | 3,983.4 | 1,858.7 | 2,512.8 | Volatile |
| Net Debt / EBITDA (Adjusted)¹ | N/M (EBITDA neg.) | N/M (EBITDA neg.) | 15.71x | 2.68x | 2.78x | Inflecting |

¹ "EBITDA" here is the company's own non-GAAP **Adjusted EBITDA** (earnings from continuing operations before tax, financial result, and D&A, further adjusted for stock-based comp, restructuring/M&A costs, impairments of goodwill, and excluding right-of-use-asset depreciation) [1, FY24 Annual Report, Note on Alternative Performance Measures]. It is the metric the company guides to and that analysts model — see Section 4 for the reported (GAAP-derived) EBITDA, which is materially lower. FY2023/FY2024 Adjusted EBITDA (253.6 / 692.5) is confirmed against the audited FY24 Annual Report's own "Targets and Results" table [1]; FY2025 (903.0) is management's stated figure from the FY2025 earnings call ("Adjusted EBITDA grew by a strong 30% year-over-year, reaching EUR 903 million") [9], cross-checked against the Capital IQ Estimates workbook's "EBITDA" actual line, which shows the identical 903 [8].

² Capex = PP&E capital expenditure + capitalized intangible-asset investment (both cash-flow-statement line items, absolute value used per capex sign convention), matching the CIQ Estimates workbook's own "Capital Expenditure" and "Free Cash Flow" reconciliation for FY2023–FY2024 exactly and for FY2025 within rounding [8]. This is a **normalized operating FCF**, not the company's own guided/reported FCF figure — see Section 4 and the note below the table; the company's own FCF definition further subtracts lease payments and *excludes disclosed extraordinary cash outflows* (e.g., EU antitrust and Glovo-Spain rider-reclassification payments), which is why the company's headline FY2025 FCF (+€250m, [9]) is far above the €-246.3m calculated here — the gap is the finding, not a rounding issue (see note under Section 4).

³ Total debt − cash and equivalents, Capital IQ's own calculation, reconciles arithmetically from the Balance Sheet tab (e.g., FY2025: total debt 4,625.5 − cash 2,112.7 = 2,512.8) [5].

FY2020 reference point (not shown as a column, used only to compute FY2021 YoY): Revenue €2,471.9m [4].

## 2. TTM Snapshot

TTM = latest four reported quarters. Latest TTM = FQ2 2025–FQ1 2026; Prior TTM = FQ2 2024–FQ1 2025. FQ4 2024 and FQ4 2025 revenue are **not directly disclosed** in the pool's sparse quarterly export and are derived as an arithmetic residual (audited/management-stated FY total minus the three disclosed quarters); flagged wherever used [8].

| Metric | Latest TTM | Prior TTM | Change | Evidence |
|---|---:|---:|---:|---|
| Revenue | €14,264.0m | €12,866.8m | +10.9% | FQ2 2025 (3,356.2) + FQ3 2025 (3,736.1) + FQ4 2025 (3,444.0, derived residual) + FQ1 2026 (3,727.7) vs. FQ2 2024 (2,821.1) + FQ3 2024 (3,234.5) + FQ4 2024 (3,287.9, derived residual) + FQ1 2025 (3,523.3) [8] |
| EBITDA | Not available | Not available | Not available | Adjusted EBITDA is disclosed only annually or in half-year blocks (FH1 2025 €410.7m, FH2 2025 €492.3m); FQ1 2026 standalone Adjusted EBITDA is **not disclosed anywhere in the pool** — no call in the pool gives a Q1 2026 euro figure, only the FY2026 guidance range (€910–960m) [10]. A clean TTM cannot be computed |
| EBIT | Not available | Not available | Not available | No quarterly EBIT breakdown for the required quarters; only annual (Section 1) |
| EPS diluted | Not available | Not available | Not available | No quarterly EPS series in the pool |
| CFO | Not available | Not available | Not available | No quarterly cash-flow statement in the pool (annual only) |
| Capex | Not available | Not available | Not available | Same as above |
| FCF | Not available | Not available | Not available | Same as above |
| Net debt at latest period-end | €2,512.8m (Dec-31-2025) | — | — | Balance-sheet point-in-time figure; no Q1 2026 balance sheet is in the pool, so this is the latest **disclosed** position, not a Q1 2026 figure [5] |

**Partial-data flag:** only Revenue supports a clean TTM in this pool. EBITDA, EBIT, EPS, CFO, capex and FCF TTM are *"Not available from current data"* at quarterly granularity — the closest reference points are the FY2025 annual figures in Section 1, which are NOT a TTM (they end three months earlier, at Dec-31-2025, not Mar-31-2026).

## 3. Latest Quarterly Trend Table (8 quarters, FQ2 2024 – FQ1 2026)

Currency: EUR million. Source: Capital IQ Estimates workbook, Consensus tab, "Company Level" quarterly series [8], cross-checked against the Q1 2026 trading-statement call [10] and FY2025 earnings call [9] for qualitative color. Two quarters (marked *) are not directly disclosed in the export and are derived as the arithmetic residual: FY total minus the three known quarters.

| Metric | Q-7<br>FQ2'24 | Q-6<br>FQ3'24 | Q-5<br>FQ4'24* | Q-4<br>FQ1'25 | Q-3<br>FQ2'25 | Q-2<br>FQ3'25 | Q-1<br>FQ4'25* | Q0<br>FQ1'26 | QoQ Trend | YoY vs Same Q |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---|---|
| Revenue | 2,821.1 | 3,234.5 | 3,287.9 | 3,523.3 | 3,356.2 | 3,736.1 | 3,444.0 | 3,727.7 | Volatile (seasonal — see §5) | Q1'26 +5.8%; Q4'25 +4.7%; Q3'25 +15.5%; Q2'25 +19.0% |
| Gross Margin % | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | Not available | Not available — no quarterly COGS/gross-profit breakdown is disclosed anywhere in the pool (Income Statement tab is annual-only) |
| EBITDA (Adjusted) | 133.0 | 95.0* | 334.5 | N/A | N/A | N/A | N/A | N/A | Not available | Not available for most of the window |
| EBITDA Margin % (Adjusted) | 4.7% | 2.9%* | 10.2% | N/A | N/A | N/A | N/A | N/A | Not available | Not available |
| EPS (diluted) | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | Not available | Not available — no quarterly EPS series in the pool |

**Data-quality flag on the YoY revenue reads:** the CIQ-derived Q1 2026 YoY revenue growth computed above is +5.8%. This directly conflicts with management's own statement on the Q1 2026 call: *"Revenue grew by 18%, exceeding order and GMV growth"* [10]. The call in the same breath flags a currency headwind ("year-over-year FX comparisons remain a headwind following last year's USD and Korean won devaluation" [10]), so the 18% figure is very likely like-for-like/constant-currency while the CIQ Revenue actual (used above) is the reported (as-filed) euro figure — but the pool does not contain a reconciliation, and an FX effect of ~12 points of growth on a single quarter would be unusually large. This is flagged as an **unresolved reconciliation gap**, not silently picked one way — downstream agents (especially `02_revenue-drivers`) should treat the group revenue growth rate for Q1 2026 as uncertain within this range and investigate the FX bridge directly.

**EBITDA quarterly data quality:** only 3 of the 8 quarters have a directly disclosed or residual-derivable Adjusted EBITDA figure (FQ2 2024, FQ3 2024*, FQ4 2024). From FQ1 2025 onward, the company/CIQ export only discloses Adjusted EBITDA in half-year blocks (FH1 2025 €410.7m, FH2 2025 €492.3m — both reconcile exactly to the FY2025 total of €903.0m [8]), not by quarter, and FQ1 2026 Adjusted EBITDA is not disclosed at all in this pool. QoQ/margin trend for FQ1 2025–FQ1 2026 is *"Not available from current data."*

## 4. Reported vs Adjusted Metrics

| Metric | Reported Value | Adjusted Value | Adjustment Amount | Adjustment Reason | Evidence |
|---|---:|---:|---:|---|---|
| EBITDA (FY2024) | -24.3 | 692.5 | +716.8 | Adjusted EBITDA excludes stock-based comp, restructuring/legal-provision items, impairments of goodwill, gains/losses on disposals, and right-of-use-asset depreciation, on top of the standard EBITDA add-back of D&A | Reported: CIQ Income Statement tab "EBITDA" line [4]; Adjusted: FY24 Annual Report "Targets and Results" table, and Segments tab reconciliation [1][7] |
| EBITDA (FY2025) | 304.9 | 903.0 | +598.1 | Same adjustments as above; company states "Management adjustments came down considerably to EUR 147 million" and "this translates into an EBITDA increase of 74%, ahead of the adjusted EBITDA increase of 30%" — i.e., the reported/statutory EBITDA actually grew *faster* than Adjusted EBITDA in FY2025 because FY2024's reported EBITDA was depressed by a larger one-off (the Uber breakup-fee-related reconciliation swung from +€158m to -€260m, partly reflecting a 2025 goodwill impairment) | Reported: CIQ Income Statement tab [4]; Adjusted: FY2025 earnings call, prepared remarks [9] |
| EBIT | -261.2 (FY24) / 93.7 (FY25) | Company does not disclose a separate "Adjusted EBIT" line | N/A | Adjusted EBITDA is the company's sole headline non-GAAP profitability metric; it does not publish an Adjusted EBIT/Adjusted Operating Income bridge | [1][4][9] |
| EPS (FY2024) | -3.10 (GAAP diluted) | -0.89 (CIQ "Normalized" diluted) | +2.21 | CIQ's normalization strips unusual items (impairments, restructuring, gains/losses on disposal, and similar) from net income before recalculating EPS; this is a data-vendor normalization, not a company-published "Adjusted EPS" figure — the company itself does not publish an adjusted-EPS metric in the sources reviewed | CIQ Income Statement tab, "Normalized Diluted EPS" line [4] |
| EPS (FY2025) | -2.62 (GAAP diluted) | -0.86 (CIQ "Normalized" diluted) | +1.76 | Same as above | [4] |

**FCF definition conflict (flagged, not resolved away):** this agent's calculated FY2025 FCF (CFO €79.5m − total capex €325.8m = **-€246.3m**, Section 1 footnote 2) is negative. The company's own guided/reported FY2025 FCF is **+€250m**, up 15% YoY [9], and its own definition (footnote 13 of the FY24 Annual Report) is "cash flow from operating activities, less capital expenditures and payment of lease liabilities," explicitly **excluding extraordinary cash outflows related to ongoing legal disputes (e.g., EU antitrust and Glovo Spain)** [1]. Management confirmed on the FY2025 call that the FY2026 FCF guidance (>€200m) is likewise "excluding extraordinary outflows" [9]. The ~€496m gap between the company's +€250m headline and this agent's -€246m calculated figure is driven mainly by that extraordinary-item exclusion (plus the lease-payment subtraction, which would push the company figure lower, not higher — so the exclusion of legal/antitrust outflows is doing essentially all the work). **This agent leads with the unadjusted, GAAP-cash-flow-based FCF figure in Section 1** per the instruction to headline the normalized operating figure rather than the company-defined one; the company's own guided FCF is presented here, labeled, for reference. This gap is a material earnings-quality flag for `06_earnings-quality` to examine directly.

## 5. Quarterly Seasonality Table (last 3 fiscal years, FY2023–FY2025)

Revenue-share seasonality (Adjusted-EBITDA seasonality is *not* shown — quarterly Adjusted EBITDA is not disclosed for FY2023 at all, and only partially for FY2024/FY2025; see Section 3). FQ4 of each year is derived as an arithmetic residual (FY total minus three disclosed quarters), flagged with *.

| Quarter | FY2023 Rev Share | FY2024 Rev Share | FY2025 Rev Share | Avg Rev Share |
|---|---:|---:|---:|---:|
| Q1 | 25.1% | 24.0% | 25.1% | 24.7% |
| Q2 | 23.6% | 22.9% | 23.9% | 23.5% |
| Q3 | 27.3% | 26.3% | 26.6% | 26.7% |
| Q4* | 24.0% | 26.7% | 24.5% | 25.1% |

No quarter breaches the >30% / <20% flag threshold. There is a **modest, consistent** pattern: Q3 is the strongest quarter in all three years (avg 26.7% of annual revenue) and Q2 is the weakest in all three years (avg 23.5%) — roughly a 3.2-point swing between the strongest and weakest quarter, every year, in the same direction. This is not extreme seasonality but it is real and repeatable; treat Q2 as a seasonally soft quarter and Q3 as a seasonally strong one when reading QoQ moves.

## 6. Key Trend Summary

Revenue growth is **decelerating** on an annual basis (+46.5% FY2022 → +15.9% FY2023 → +23.7% FY2024 → +14.4% FY2025 [4]) and, on the CIQ-derived quarterly reads, decelerated further through 2025 (Q2'25 +19.0% YoY → Q3'25 +15.5% → Q4'25 +4.7% → Q1'26 +5.8% [8]) — though management's own Q1 2026 commentary claims an acceleration to "+18%" revenue growth, a figure this agent could not reconcile to the CIQ actual and has flagged rather than resolved (Section 3). Margins show two different, opposite stories that must not be averaged together: **Adjusted EBITDA margin has expanded every year for five straight years** (-13.6% → -5.5% → +2.6% → +5.6% → +6.4%, FY2021–FY2025 [1][8][9]) but the *pace* of that expansion has decelerated sharply (+814bps, +800bps, +308bps, +79bps YoY [computed]), while **gross margin inflected downward**, peaking at 29.9% in FY2023 and compressing for two consecutive years to 24.4% in FY2025 (-282bps then -266bps [computed]) — a genuine reversal, not noise, and one this agent's scope does not explain (that is `03_margin-drivers`' job). Seasonality is modest but repeatable: Q3 is consistently the strongest quarter (avg 26.7% of annual revenue) and Q2 consistently the weakest (avg 23.5%) across all three fiscal years reviewed (Section 5). The clearest inflection point in the five-year window is FY2025's statutory (reported) Operating Income turning positive (€93.7m) for the first time after five consecutive years of operating losses [4] — but this sits alongside a large, unresolved FCF-definition gap (Section 4: company-guided +€250m FY2025 FCF vs. this agent's calculated -€246m), which is a genuine earnings-quality question, not a rounding artifact, and should be treated as unresolved rather than reassuring.

## 7. Citations

[1] FY24 Annual Report (IFRS as adopted by the EU), Delivery_Hero_SE-Annual_Report(Apr-25-2025).pdf — Combined Management Report, "Targets and Results" table (Adjusted EBITDA €692.5m FY2024 / €253.6m FY2023), Alternative Performance Measures footnote (Adjusted EBITDA definition), Consolidated Statement of Profit or Loss, Consolidated Statement of Cash Flows, FCF definition footnote 13
[2] FY24 Annual Report (IFRS), Consolidated Statement of Financial Position (balance sheet), audited
[3] FY24 Annual Report (IFRS), Consolidated Statement of Cash Flows, Note 1–3 (Cash flows from operating/investing/financing activities), audited
[4] Delivery Hero SE XTRA:DHER Financials.xls (Capital IQ), Income Statement tab, Annual Dec-31-2020(Restated)–Dec-31-2025
[5] Delivery Hero SE XTRA:DHER Financials.xls (Capital IQ), Balance Sheet tab, Annual Dec-31-2020(Restated)–Dec-31-2025
[6] Delivery Hero SE XTRA:DHER Financials.xls (Capital IQ), Cash Flow tab, Annual Dec-31-2020(Restated)–Dec-31-2025
[7] Delivery Hero SE XTRA:DHER Financials.xls (Capital IQ), Segments tab, Annual Dec-31-2020(Restated)–Dec-31-2025
[8] DeliveryHeroSEXTRADHEREstimatesReport.xls (Capital IQ Estimates), Consensus tab, Fiscal Years and Fiscal Quarters/Halves sections, "Company Level (EUR)" series, data as of 2026-08-10
[9] Delivery Hero SE, 2025 Earnings Call transcript (S&P CIQ, verbatim), Mar 26, 2026 — CFO prepared remarks
[10] Delivery Hero SE, Q1 2026 Sales/Trading Statement Call transcript (S&P CIQ, verbatim), Apr 30, 2026 — CEO and CFO prepared remarks



---

## earnings / 02_revenue-drivers.md

_Source: `02_revenue-drivers.md`_

# Revenue Drivers — DHER

Reporting standard: IFRS as adopted by the EU, consolidated. Reporting currency: EUR (euro), figures in EUR million unless stated. Fiscal year end 31 December. Listing: Deutsche Börse Xetra (XTRA:DHER), Prime Standard, Frankfurt [01_historical-financials.md]. No audited FY2025 annual report is present in the pool; FY2025/FY2026 figures below come from verbatim earnings-call transcripts (S&P CIQ transcripts, full trust per this module's Transcript Sourcing rule — not a sell-side proxy) and a Capital IQ workbook export, cross-checked where possible, and flagged wherever the two disagree. DHER is currently the subject of a live, announced acquisition approach from Uber with an ongoing JPMorgan-advised strategic review; this agent treats that as out of scope (it is not a revenue driver of the standalone business) except where it changes the asset base (the pending Taiwan divestiture, noted in Section 4).

## 1. Segment Decomposition Status

Segment decomposition applied — 5 segments from the business-model module (`analyses/DHER_2026-08-12/business-model/03_segment-map.md`): MENA, Asia, Europe, Americas, Integrated Verticals. MENA is dominant on profit (68.3% of FY2024 Group Adjusted EBITDA) but not on revenue (27.6% of FY2024 Total Segment Revenue); Asia is dominant on revenue (31.8%). Neither clears the 85% single-segment threshold, so this is a genuine multi-segment decomposition, not a consolidated-only read [FY24 Annual Report, "Key Figures," p.4; 03_segment-map.md §2].

## 2. Revenue Driver Tree

| Business Type | Revenue Formula |
|---|---|
| Marketplace | GMV × take rate (commission %) |
| Multi-segment, mixed marketplace + principal model | Sum of segment revenue drivers |

Company-specific formula: **Group Total Segment Revenue = Σ over 5 segments of (segment GMV × segment take-rate)**, where take-rate is not a single commission percentage but a blend of (a) marketplace commission on orders delivered by third-party riders, (b) the full delivery fee plus commission recognized when Delivery Hero's own riders deliver the order ("own delivery"), (c) AdTech/advertising revenue layered on top of GMV, and (d) for the Integrated Verticals segment (Dmarts quick commerce, where DH acts as principal — buys and resells inventory), revenue recognized at ~100% of GMV net of VAT rather than a marketplace commission [FY24 Annual Report, p.108, "Reconciliation Total Segment Revenue to Revenue"; p.5793–5797 (Integrated Verticals revenue recognition)]. This mixed-model structure is why revenue can and does grow materially faster than GMV — the take-rate itself is rising as the mix shifts toward own delivery, AdTech, and Integrated Verticals (see Section 6).

## 3. Market / Share / Price / Mix Split

| Driver Bucket | Current Direction | Evidence | Importance /100 |
|---|---|---|---:|
| End-market demand (GMV like-for-like) | Improving — GMV LFL growth accelerated from +7.9% (Q4'25) to +8.8% (Q1'26); order growth accelerated from 9% to 10% over the same period [Q1 2026 Sales/Trading Statement Call, prepared remarks] | Company-stated LFL series, not independently reconciled to reported-currency revenue (see Section 6a) | 70 |
| Company market share | Mixed/Improving — Asia GMV fell -7.7% in FY2024 on competitive pressure [FY24 AR, p.4]; but by Q1 2026 management states Korea "returned to positive order and GMV growth" after a 2-year rebuild, and Saudi Arabia is "starting to see category share increasing 1.5 years after a new competitor entered the market with deep discounts" [Q1 2026 Call, prepared remarks] | 60 |
| Price / realization (take-rate) | Improving — Group own-delivery share rose to 78% in FY2025 from 67% in FY2024, and management guides the revenue-vs-GMV growth gap to narrow in FY2026 "reflecting a slowdown in the transition to own delivery" [FY2025 Earnings Call, prepared remarks] — i.e., this lever is decelerating even as it stays positive | 65 |
| Product / customer / geography mix | Improving (for revenue) — Quick Commerce GMV share of Group GMV rose from an estimated ~14% (FY2025, inference from FY2025's disclosed >€7.5bn Quick Commerce GMV vs. an estimated ~€53bn total Group GMV at +9% LFL on the FY2024 base of €48,754.0m — **Inference, not from filings**, since no FY2025 total GMV euro figure is disclosed) to an explicitly-stated 18% in Q1 2026 [Q1 2026 Call, prepared remarks]. Integrated Verticals' principal-model revenue recognition amplifies this mix effect on Group revenue (Section 2) | 60 |
| FX translation | Deteriorating (headwind) — "year-over-year FX comparisons remain a headwind following last year's USD and Korean won devaluation" [FY2025 Earnings Call, prepared remarks, guidance section]; ~85% of Group revenue is earned in non-EUR functional currencies (inference from segment mix, not from filings) [10_external-dependency.md §1]. No group-level revenue-translation sensitivity is disclosed — only monetary/financial-instrument FX sensitivities (Section 4 below) | 40 |
| M&A / divestitures | Not a driver of FY2024/FY2025 reported growth — Talabat's Dec-2024 DFM listing did not change consolidation (100% of talabat's results remain consolidated in MENA) [03_segment-map.md §1]. The Taiwan disposal (agreed for $600m, guided to close H2 2026) is a **future** negative revenue driver once it closes — it removes a (undisclosed-size) slice of the Asia segment — but had not closed as of the Q1 2026 call [Q1 2026 Call, prepared remarks: "on track to close that transaction in H2"] | 15 (rising once closed) |

## 4. Revenue Driver Table (consolidated)

| Driver | Current Level | Direction | Magnitude | Evidence |
|---|---|---|---|---|
| GMV / order volume | Group GMV +7.7% FY2024 (€48,754.0m vs €45,275.2m); GMV LFL +9% FY2025 (management-stated, no absolute euro figure disclosed); GMV LFL +8.8% Q1 2026, orders +10% Q1 2026 | Improving — LFL growth accelerating each of the last two reported quarters (Q4'25 9% order growth → Q1'26 10%, stated directly) | High | [FY24 AR, "Development of GMV," p.111; FY2025 Earnings Call, prepared remarks; Q1 2026 Call, prepared remarks] |
| Own-delivery mix / take-rate | Group own-delivery share 78% (FY2025) vs 67% (FY2024); segment-level FY2024: MENA 72.6% (from 65.0%), Europe 95.3% (from 93.9%), Asia 55.0% (from 44.9%) | Improving, but decelerating — management explicitly guides the FY2026 revenue-vs-GMV growth gap to be "lower than in 2025... reflecting a slowdown in the transition to own delivery" | High | [FY24 AR, segment tables, p.112–113; FY2025 Earnings Call, prepared remarks (guidance section)] |
| AdTech / advertising monetization | Approaching €1.5bn revenue run-rate (FY2025); Europe AdTech revenue +34% YoY in Q1 2026, Americas AdTech +33%, Integrated Verticals AdTech run-rate >€100m annualized | Improving | Mid (~10% of Group revenue at the stated run-rate, growing faster than the base) | [FY2025 Earnings Call, prepared remarks; Q1 2026 Call, prepared remarks (segment sections)] |
| Quick commerce (Integrated Verticals / Dmarts) penetration | 18% of Group GMV (Q1 2026), +30% YoY GMV growth; 800 Dmart stores (FY2025 call), orders/store up ~30% on "just a marginal increase in number of stores" | Improving — company targets €10bn Quick Commerce GMV for FY2026 (vs >€7.5bn FY2025) | High | [FY2025 Earnings Call, prepared remarks and Q&A ("800 Dmarts"); Q1 2026 Call, prepared remarks] |
| Subscription penetration / retention | 43% of Group GMV from subscribers (Q1 2026); Saudi Arabia 61% of GMV, South Korea 50% of GMV, Europe only 22% of GMV (headroom) | Improving | Mid — an engagement/retention lever that supports order frequency rather than a direct revenue-line item | [Q1 2026 Call, prepared remarks] |
| Competitive dynamics — Korea | Baemin returned to positive order and GMV growth in Q1 2026 after ~2 years of rebuild (single tech stack, repricing, new subscription program at "nearly 50% of total order volumes") | Improving — inflecting from a multi-year trough | High | [FY2025 Earnings Call, Q&A (Giles Thorne exchange); Q1 2026 Call, prepared remarks] |
| Competitive dynamics — Saudi Arabia / KSA | A discount-heavy competitor entered KSA in Sept 2024; DHER responded with subscription (61% GMV penetration) and vendor-funded deals (+8pp YoY) rather than discounting; category share now increasing vs. Q4 2025 | Improving, but the competitive threat is not resolved — "hard to tell" per CEO on whether/when the entrant reduces its own spend | High | [Q1 2026 Call, prepared remarks and Q&A (Joseph Barnet-Lamb exchange)] |
| Regulatory — rider classification (Europe) | Spain's Glovo riders moved to an employment-based model July 2025; created "transitory headwinds, leading to a temporary moderation in GMV growth" for the Europe segment in FY2025, with growth gains already appearing and expected to "translate into accelerated top line growth in H2 [2026]" as the change annualizes | Deteriorating near-term, expected to normalize | Mid | [Q1 2026 Call, prepared remarks; FY2025 Earnings Call, Q&A (Silvia Cuneo exchange)] |
| FX translation | ~85% of revenue non-EUR (inference); no group revenue-translation sensitivity disclosed; only monetary-exposure sensitivities: 10% USD/EUR move = ±€26.8m P&L (Dec-2024), 10% KRW/EUR = ±€72.0m P&L | Deteriorating — explicit FY2025/26 headwind flagged from USD and KRW devaluation | Mid (quantified monetary exposure is Low-Mid relative to €14bn revenue; full revenue-translation exposure is unquantified and could be larger) | [10_external-dependency.md §2; FY2025 Earnings Call, prepared remarks] |
| GCC consumer spending / oil-linked macro | MENA (~29% of FY2025 revenue, inference from segment mix) concentrated in GCC oil-exporting economies; filing flags "continued voluntary oil production cuts... dampening overall growth prospects" for GCC economies | Stable/Mid risk — MENA growth has in fact accelerated (Q1 2026), so this has not yet manifested as a drag | Low-Mid, indirect | [FY24 AR, "Macroeconomic Environment," p.~103; 10_external-dependency.md §1] |
| Geopolitics — Iran conflict (Mar–Apr 2026) | "Extra high single-digit growth" boost to KSA GMV in March 2026 from a shift to eat-at-home consumption; by late April, "completely back to normal... back to where we were prior to the war" | **One-time, non-run-rate** — explicitly stated by management to have already reversed | Low (already normalized) but real in the quarter it occurred | [Q1 2026 Call, prepared remarks and Q&A (Andrew Ross exchange)] — see Cycle-Position note below |
| Taiwan divestiture (pending) | Agreed sale for $600m (Grab), guided to close H2 2026; DHER will continue to run the tech platform "for up to 1 year after the deal closes" | Future negative (mechanical) — removes an undisclosed slice of Asia-segment revenue once closed | Low (Taiwan's standalone revenue contribution is not broken out in this pool) | [Q1 2026 Call, prepared remarks and Q&A] |

**Cycle-position note (Cycle-Position Rule):** DHER's demand is Mid cyclicality per the business-model external-dependency read (consumer discretionary spend tied to GDP, inflation, and rates) [10_external-dependency.md §1, §4]. Two segment-level items in the latest reported period are explicitly NOT run-rate and must not be treated as baseline: (1) the Iran-conflict-driven KSA demand boost in March 2026, which management states had already fully reversed by late April 2026 — call this out whenever Q1 2026 MENA growth is cited; (2) Korea's Q1 2026 return to growth is a recovery off a multi-year competitive trough (Keeta's 2024 entry, ~2 years of platform rebuild), not a fresh acceleration off a normal base — this is inflection-from-trough, and its sustainability depends on continued execution, not yet a full cycle of standalone evidence.

## 5. Revenue Drivers By Segment

### Segment: MENA (27.6% of FY2024 Total Segment Revenue; 68.3% of FY2024 Group Adjusted EBITDA)

| Driver | Current Level | Direction | Magnitude | Evidence |
|---|---|---|---|---|
| GMV | €12,825.9m FY2024 (+28.8% vs €9,959.3m FY2023) | Improving | High | [FY24 AR, p.112] |
| Own-delivery share | 72.6% FY2024 (from 65.0% FY2023, +7.2pp) | Improving | High | [FY24 AR, p.112] |
| Segment revenue | €3,527.8m FY2024 (+30.6% vs €2,700.8m) — revenue growth exceeded GMV growth | Improving | High | [FY24 AR, p.112] |
| Q1 2026 trading | "Reacceleration relative to Q4," broad-based across HungerStation and Talabat, particularly strong Quick Commerce | Improving (with the Iran-conflict caveat above) | High | [Q1 2026 Call, prepared remarks] |
| Talabat minority-listing structure | 80% economic interest retained post Dec-2024 DFM listing; 100% still consolidated | Not a revenue driver (consolidation unchanged) — but overstates DHER shareholders' claim on the segment's profit if read naively | Flagged, not scored | [03_segment-map.md, MENA row] |

### Segment: Asia (31.8% of FY2024 Total Segment Revenue; 55.6% of FY2024 Group Adjusted EBITDA — largest segment by revenue)

| Driver | Current Level | Direction | Magnitude | Evidence |
|---|---|---|---|---|
| GMV | €23,407.4m FY2024 (**-7.7%** vs €25,354.2m FY2023) — the only segment with a GMV decline | Deteriorating in FY2024, Improving by Q1 2026 (Korea inflection, see Section 4) | High | [FY24 AR, p.112] |
| Own-delivery share | 55.0% FY2024 (from 44.9% FY2023, +10.1pp) | Improving | High | [FY24 AR, p.112] |
| Segment revenue | €4,417.7m FY2025 (per CIQ Segments tab); FY2024 €4,071.9m (+9.2% vs €3,729.4m despite the GMV decline — revenue grew because own-delivery/take-rate rose faster than GMV fell) | Improving on revenue even while GMV fell | Mid-High | [FY24 AR, p.112; Segments tab CIQ, FY2025 column] |
| Korea competitive position | Returned to positive order/GMV growth Q1 2026 after ~2 years of platform rebuild; subscription now ~50% of order volumes | Improving — inflection, not yet proven multi-quarter | High | [Q1 2026 Call, prepared remarks; FY2025 Earnings Call, Q&A] |
| Quick Commerce penetration (Asia) | Company states Asia "is still only at 7% [Quick Commerce] penetration and the catch up is inevitable" | Improving, large disclosed headroom | Mid-High (asserted, unquantified in euros) | [Q1 2026 Call, prepared remarks] |

### Segment: Europe (14.8% of FY2024 Total Segment Revenue; -11.1% of FY2024 Group Adjusted EBITDA — a net drag)

| Driver | Current Level | Direction | Magnitude | Evidence |
|---|---|---|---|---|
| GMV | €8,878.7m FY2024 (+18.2% vs €7,510.0m) | Improving FY2024; "temporary moderation" in FY2025/H1 2026 from the Spain rider-model transition | Mid | [FY24 AR, p.113; Q1 2026 Call, prepared remarks] |
| Own-delivery share | 95.3% FY2024 (from 93.9%) — already near-saturated, limited further take-rate lift available from this lever specifically | Stable (little further room) | Low (already high) | [FY24 AR, p.113] |
| AdTech | "Group-leading 34% revenue growth" in Q1 2026, "broad-based across our entire European footprint," Glovo AdTech "scaling at a rapid pace" | Improving | Mid | [Q1 2026 Call, prepared remarks] |
| Subscription penetration | Only 22% of GMV — lowest of the disclosed regional figures | Improving, large headroom | Mid | [Q1 2026 Call, prepared remarks] |
| Regulatory (rider reclassification) | Spain transition completed July 2025; Italy prosecution ongoing, no employment-model change expected per management | Deteriorating near-term (revenue growth moderation), expected to normalize H2 2026 | Mid | [Q1 2026 Call, prepared remarks and Q&A] |

### Segment: Americas (7.3% of FY2024 Total Segment Revenue; 1.5% of FY2024 Group Adjusted EBITDA — smallest, thinnest margin)

| Driver | Current Level | Direction | Magnitude | Evidence |
|---|---|---|---|---|
| GMV | €3,642.0m FY2024 (+48.6% vs €2,451.7m) — fastest-growing segment by GMV | Improving | Mid (small base) | [FY24 AR, p.113] |
| Own-delivery share | Not separately disclosed for Americas in the FY24 AR pages reviewed | Not available | — | — |
| Order growth | Accelerated to 25% in Q1 2026, "13 out of 15 markets growing above 20%" | Improving | Mid | [Q1 2026 Call, prepared remarks] |
| Quick Commerce | +34% YoY in Q1 2026, a "key contributor" | Improving | Mid | [Q1 2026 Call, prepared remarks] |
| AdTech | +33% YoY in Q1 2026 | Improving | Low-Mid (small base) | [Q1 2026 Call, prepared remarks] |

### Segment: Integrated Verticals / Dmarts (21.2% of FY2024 Total Segment Revenue; -14.3% of FY2024 Group Adjusted EBITDA — still loss-making)

| Driver | Current Level | Direction | Magnitude | Evidence |
|---|---|---|---|---|
| GMV | €2,904.7m FY2024 (+30.6% vs €2,224.4m); +28% YoY GMV growth Q1 2026 | Improving | High (structurally, this segment's revenue ≈ its GMV, a 1:1 lever on Group revenue mix — see Section 2) | [FY24 AR, p.114; Q1 2026 Call, prepared remarks] |
| Store count (Dmarts) | 786 stores FY2023 → 800 stores stated on the FY2025 call, "slight increase" after several years of net reduction | Stable/slightly improving | Low (store count itself is nearly flat) | [FY24 AR, p.5801; FY2025 Earnings Call, Q&A] |
| Orders per store / utilization | "Very few new store openings in Q1 [2026]... growth was fundamentally organic and driven by higher utilization" | Improving | High — this is now the primary growth mechanism for the segment, not store expansion | [Q1 2026 Call, prepared remarks] |
| AdTech (retail media) | >€100m annualized run-rate | Improving | Low-Mid (small base, high growth) | [Q1 2026 Call, prepared remarks] |

## 6. Revenue Growth Decomposition

**Primary basis: FY2024 vs FY2023, Total Segment Revenue vs Total GMV — both audited, disclosed together on the same page, and the only period where a full multiplicative decomposition is possible from this pool.** FY2025 and Q1 2026 growth rates are not decomposable to the same standard — see the flag beneath the table and Section 6a.

| Component | Contribution to Growth (pp) | Evidence |
|---|---:|---|
| Volume (GMV) | +7.7pp | GMV €48,754.0m (FY2024) vs €45,275.2m (FY2023), +7.685% [FY24 AR, "Development of GMV," p.111] |
| Price / Take-rate & Mix (own-delivery rollout, AdTech, Integrated Verticals principal-model mix — see Section 6a, these cannot be separated further from available disclosure) | +13.6pp | Take-rate (Total Segment Revenue / GMV) rose from 23.11% (FY2023) to 26.25% (FY2024), +13.575% [derived, Section 6a] |
| Interaction (mathematical cross-term — GMV and take-rate both changed in the same direction) | +1.0pp | Derived residual of the exact multiplicative identity; not a separate causal driver (Section 6a) |
| FX | Not separately quantifiable at this level — embedded within each segment's local-currency GMV and take-rate before euro translation; no group revenue-translation sensitivity is disclosed | [10_external-dependency.md §2] |
| Acquisitions / divestitures | 0.0pp | None in FY2024 (Talabat listing did not change consolidation; Taiwan divestiture had not been announced) |
| Other | 0.0pp | None — the identity above is exact (Revenue ≡ GMV × take-rate by construction) |
| **Total revenue growth (Total Segment Revenue basis)** | **+22.3pp** | €12,796.4m (FY2024) vs €10,463.2m (FY2023) [FY24 AR, "Segment Revenue 2024," p.111] |

**Basis note:** this decomposition uses **Total Segment Revenue** (the company's own primary segment KPI, disclosed alongside GMV), not the audited IFRS "Revenue" line in the P&L. IFRS Revenue grew +23.7pp in FY2024 (€12,294.7m vs €9,941.9m) [01_historical-financials.md §1] — about 140bps higher than the +22.3pp Total Segment Revenue growth used here. The gap is the company's own disclosed voucher and reconciliation adjustment (vouchers -€884.1m in FY2024 vs -€849.8m FY2023, plus other reconciliation effects) [FY24 AR, p.108], which is not attributable to volume or take-rate from the disclosure available — it sits outside this table by construction, since GMV is only disclosed against Total Segment Revenue, not IFRS Revenue.

**FY2025 and Q1 2026: not decomposed — data-quality flag, not an estimate.** Two management-quoted revenue growth figures in this pool do not reconcile to the CIQ/audited-consistent computed growth rates, and this agent will not build a decomposition on an unreconciled number:
- FY2025 earnings call: CFO states "GMV growth of 9% on a like-for-like basis and revenue growth of 23%" [FY2025 Earnings Call, prepared remarks]. The audited-consistent FY2025 IFRS revenue growth, computed from the disclosed €14,059.6m (FY2025) vs €12,294.7m (FY2024), is **+14.4%**, not 23% [01_historical-financials.md §1]. No reconciliation between "23%" and 14.4% is available in this pool.
- Q1 2026 trading call: CFO states "Revenue grew by 18%, exceeding order and GMV growth." The CIQ-derived Q1 2026 YoY revenue growth (€3,727.7m vs €3,523.3m FQ1'25) is **+5.8%** [01_historical-financials.md §3]. This gap is partially explained by FX (management flags a USD/KRW headwind on reported-currency figures in the same call), but a 12-point gap from FX alone would be unusually large for a single quarter, and this pool contains no bridge.

Both gaps point the same direction (management's stated growth rate is well above the computed reported-currency rate), which is consistent with — but does not prove — a like-for-like/constant-currency vs. reported-currency mismatch. Downstream modules should treat any FY2025/Q1 2026 revenue growth rate as **uncertain within this range** rather than picking one figure silently.

## 6a. Decomposition Attribution and Residual (MODULE_RULES "Driver Attribution" / §15)

```
Volume (GMV): GMV_FY2024 (€48,754.0m) / GMV_FY2023 (€45,275.2m) − 1 = +7.685%
  [FY24 Annual Report, "Development of GMV," p.111 — audited]
  = +7.7pp of the +22.3pp observed Total Segment Revenue growth
  → Basis: Group-level Total GMV, FY2024 vs FY2023, same audited table as the revenue figure below. Matches — same basis, same period, same level. No cross-basis application.

Price/Take-rate & Mix: Take-rate_FY2024 (Total Segment Revenue / GMV = €12,796.4m / €48,754.0m = 26.247%)
  vs. Take-rate_FY2023 (€10,463.2m / €45,275.2m = 23.110%)
  Ratio growth = 26.247% / 23.110% − 1 = +13.575%
  [Both figures from FY24 Annual Report, "Segment Revenue 2024" and "Development of GMV," p.111 — audited]
  = +13.6pp of the +22.3pp observed growth
  → Basis: same Group-level Total Segment Revenue / Total GMV pair, FY2024 vs FY2023. This ratio is NOT applied to any other period or level (e.g., not carried into the FY2025/Q1 2026 figures below, which are explicitly left undecomposed instead).

Interaction: +22.307pp (observed) − 7.685pp (volume) − 13.575pp (take-rate) = +1.047pp ≈ +1.0pp
  This is not a separate causal driver — it is the mathematically required cross-term of an exact multiplicative
  identity (Revenue ≡ GMV × take-rate). It is shown, not hidden inside either component.
```

**Reconciliation: 22.3pp reconciled, 0.0pp residual.** This is an exact identity (Total Segment Revenue is defined as the sum of GMV × take-rate across segments, both disclosed on the same audited page), not an approximation — so unlike a typical driver bridge, there is no unexplained gap for this specific FY2024 decomposition. The residual risk instead sits in what the "Price/Take-rate & Mix" line actually contains: it bundles at least three distinct, unseparated causes (own-delivery-share mix shift, AdTech monetization layered on top of GMV, and Integrated Verticals' near-100%-of-GMV revenue recognition) that this pool's disclosure does not allow to be split further. Section 4 gives the qualitative weight of each (own-delivery share is the largest of the three, based on its disclosed segment-level magnitude — MENA +7.2pp, Asia +10.1pp own-delivery share YoY — versus AdTech's smaller ~10%-of-revenue run-rate), but that ordering is Inference, not from filings at the euro-contribution level.

The FY2025/Q1 2026 figures are explicitly NOT decomposed (Section 6) because the two headline growth rates management quoted for those periods do not reconcile to the computed reported-currency figures — applying the FY2024 take-rate ratio, or any ratio, to an unreconciled headline number would be exactly the basis-mismatch error this rule exists to prevent.

## 7. The Single Biggest Revenue Driver

**The single biggest driver of DHER's revenue is the take-rate/mix shift — specifically the own-delivery rollout — not underlying transaction volume (GMV) growth.** In the one period this pool can decompose exactly (FY2024), the take-rate/mix component contributed +13.6pp of the +22.3pp Total Segment Revenue growth (about 61%), against +7.7pp (about 34%) from GMV growth itself — clearing the "roughly half" bar for naming a single biggest driver (Section 6a). The largest identifiable piece of that take-rate shift is the own-delivery rollout: Group own-delivery share rose from 67% (FY2024) to 78% (FY2025), with the largest segment-level moves in Asia (+10.1pp FY2024) and MENA (+7.2pp FY2024) [FY2025 Earnings Call, prepared remarks; FY24 AR, p.112–113]. If this driver moved another 10–20% (e.g., own-delivery share rising toward Europe's already-96% level in the segments still well below it), it would move Group revenue by several points more than the equivalent move in GMV, holding GMV constant — because the take-rate conversion is close to 1:1 on the delivery-fee revenue newly captured, while marginal GMV growth converts at the lower blended marketplace commission rate. Its current direction is **improving, but explicitly decelerating**: management's own FY2026 guidance states the revenue-vs-GMV growth gap will be "lower than in 2025... reflecting a slowdown in the transition to own delivery" now that the group-level rollout is largely done [FY2025 Earnings Call, prepared remarks]. This means the single biggest historical driver of DHER's revenue outperformance is running out of runway faster than the underlying GMV/order-volume driver — which is itself accelerating (Section 4) — making GMV/order growth the more important driver to watch going forward even though it was not the largest historical contributor.



---

## earnings / 03_margin-drivers.md

_Source: `03_margin-drivers.md`_

# Margin Drivers — DHER

Reporting standard: IFRS as adopted by the EU, reporting currency EUR (€) [FY24 Annual Report]. No audited FY2025 Annual Report exists in this pool — FY2025 figures below come from the verbatim FY2025 earnings-call transcript (management-stated) and the Capital IQ (CIQ) workbook export, cross-checked against each other; this is flagged wherever the FY2025 figure cannot be reconciled to an audited line item, consistent with `01_historical-financials.md`.

**Sector overlay (step 3b):** No row in `frameworks/SECTOR_OVERLAYS.md` matches "on-demand delivery marketplace converting into an owned-inventory quick-commerce retailer" cleanly. The nearest analogue is the **Retail / consumer** row, but the business-model module's own check (`business-model/02_business-identity.md` §3a) found it a poor fit — DHER does not disclose a single retail-style gross margin or inventory turns for its Dmarts business, and same-store-sales-style metrics exist only as GMV like-for-like growth. **No sector overlay cleanly applies — the generic cost stack is used, supplemented with the company's own primary KPI grammar (GMV, Total Segment Revenue, Adjusted EBITDA, Adjusted EBITDA margin), since that fits the actual business better than a generic retail read** — consistent with the business-identity module's own conclusion.

## 1. Segment Decomposition Status

`business-model/03_segment-map.md` exists and is used. DHER is **not** single-segment: it reports five segments (Asia, MENA, Europe, Americas, Integrated Verticals), and MENA — the profit-dominant segment — is only 68.3% of FY2024 Group Adjusted EBITDA and 27.6% of Total Segment Revenue, well below the 85% single-segment threshold [Segment Map §2; FY24 Annual Report, "Key Figures," p.4]. Full segment-level P&L (revenue and Adjusted EBITDA) is disclosed and used below.

**Data-vintage flag carried forward from the segment-map:** the FY2024 segment figures are audited (FY24 Annual Report). No FY2025 audited annual report or segment note exists in this pool — the FY2025 segment figures used in Sections 6–7 come from a Capital IQ workbook export tied to the Mar-26-2026 FY2025 earnings call (Tier 5/6, unaudited), flagged everywhere they are used [Delivery Hero SE XTRA DHER Financials.xls, Segments tab, Dec-31-2025 column].

## 2. Cost Stack

Generic cost stack applies (no sector-overlay match — see above), adapted to DHER's actual disclosed cost lines. Two vintages are used because the granular cost-of-sales breakdown is disclosed only in the audited FY2024 Annual Report — no equivalent FY2025 breakdown exists in this pool.

| Cost Line | % of Revenue | Direction | Evidence | Margin Risk |
|---|---:|---|---|---|
| **Total Cost of Sales (COGS)** | FY2025: 75.6% (CIQ) / FY2024: 72.9% (audited) | Rising (worsening gross margin) | CIQ Income Statement tab; FY24 AR, Consolidated Statement of Profit or Loss, p.107 | High — largest cost block, 3 of 4 last years rising as % of revenue |
| — of which Delivery expenses (external riders + own fleet) | FY2024: 49.0% of revenue, 67.2% of COGS (up from 64.5% FY2023) | Rising | FY24 AR, Note 15/2 "Cost of Sales," p.109 | High — single largest line; no disclosed pass-through mechanism (§3) |
| — of which Dmarts cost of goods (merchandise sold, net of rebates) | FY2024: 16.2% of revenue | Roughly flat as % of revenue | FY24 AR, Note 15/2, p.182 | Mid — inventory-heavy, still loss-making at segment level (§6) |
| — of which Payment-service fees | FY2024: 3.7% of revenue (down from 4.3% FY2023) | Falling (scale economies) | FY24 AR, Note 15/2, p.182 | Low |
| — of which Server hosting | FY2024: 1.2% of revenue (down from 1.3% FY2023) | Falling | FY24 AR, Note 15/2, p.182 | Low |
| — of which Picker cost (Dmarts) | FY2024: 0.9% of revenue (up from 0.9% FY2023) | Roughly flat | FY24 AR, Note 15/2, p.182 | Low |
| Labor (group total) | Not disclosed as a single group figure | Not assessable | Personnel costs are split across functional lines: IT personnel €441.0m FY2024 (down from €500.8m); G&A personnel €593.0m FY2024 (down from €625.4m) — "Not proven from available data" as a single group labor total | Mid — embedded mainly in Delivery expenses (rider pay) and functional opex |
| Freight / logistics | Covered under Delivery expenses above — DHER *is* the logistics network (riders largely freelance/third-party) | Rising | FY24 AR, p.109; Value Chain §2 | High (see Delivery expenses row) |
| Energy / fuel | Not disclosed as a quantified P&L line — only qualitative reference to fuel vouchers as a rider-retention perk | Not assessable | `business-model/10_external-dependency.md` §1 | Low-Mid, unquantified |
| SG&A — Marketing + IT + G&A (audited, FY2024 basis) | FY2024: Marketing 11.8% + IT 4.3% + G&A 14.7% = 30.8% of revenue (down from 14.7%+5.9%+17.6%=38.2% FY2023) | Falling (leverage) | FY24 AR, "Results of Operations," p.108–109 | Mid — improving, but FY2024 G&A includes a €225.5m antitrust-provision allocation (one-off), so the underlying decline is smaller than the headline |
| SG&A — CIQ single bucket (FY2025, **different categorization, not directly comparable to the audited FY2024 functional split above**) | FY2025: 23.5% of revenue (CIQ "Selling General & Admin Exp.") vs FY2024: 30.5% on the same CIQ basis | Falling, large magnitude | CIQ Income Statement tab | Flagged — CIQ's own FY2024 SG&A figure (30.5%) does not match the audited AR's Marketing+IT+G&A sum (30.8%, close by coincidence) or its individual G&A line (14.7% audited vs CIQ's own implied ~18.7% G&A share) precisely; treated as directional only, not decomposed line-by-line (§7a basis rule) |
| R&D (CIQ supplemental line, not a separate AR P&L line) | FY2025: 2.8% of revenue vs FY2024: 3.4% | Falling | CIQ Income Statement tab, Supplemental Operating Expense Items | Low — embedded within IT/G&A in the audited AR presentation |
| D&A (cash-flow-statement basis, consistent across both years) | FY2025: 2.6% of revenue vs FY2024: 3.1% | Falling | CIQ Cash Flow tab; FY24 AR, p.108–109 ("Depreciation, amortization and impairment expenses decreased by 20.6%") | Low-Mid — tailwind for EBIT margin |
| Stock-based compensation (non-cash, excluded from Adjusted EBITDA) | FY2025: 1.6% of revenue (€224.1m) vs FY2024: 1.4% (€171.1m) | Rising | FY2025 Earnings Call, CFO remarks: "Share-based compensation increased to EUR 224 million... we expect it to remain broadly stable" | Mid — widens the Adjusted-vs-reported EBITDA gap (earnings-quality flag, see `06`) |
| Interest expense (below operating line, shown for completeness) | FY2025: 2.7% of revenue (€382.1m) vs FY2024: 2.6% (€316.9m) | Rising | CIQ Income Statement tab | Low-Mid — non-operating, but relevant to net-margin/FCF |

## 3. Gross Margin → EBITDA Margin → EBIT Margin Walk

| Margin Level | FY2025 | FY2024 | Change bps | Main Reason | Evidence |
|---|---:|---:|---:|---|---|
| Gross margin | 24.4% | 27.1% | **-266bps** | COGS grew faster than revenue (+18.5% vs +14.4%), driven mainly by the continued own-delivery mix shift raising delivery-expense share of COGS (mechanism confirmed for FY2024 vs FY2023 in §7; FY2025 vs FY2024 line-item breakdown not disclosed — data gap, see §7) | CIQ Income Statement tab; `01_historical-financials.md` §1 |
| EBITDA margin (Adjusted, company-defined) | 6.4% | 5.6% | **+79bps** | Segment margin-rate improvement (Americas, Integrated Verticals) outweighing Asia's competitive-driven margin decline — see §7 segment bridge. Pace of expansion has decelerated sharply vs prior years (+814bps FY22, +800bps FY23, +308bps FY24, +79bps FY25 YoY — see `01` §6) | FY2025 Earnings Call, CFO remarks: "Adjusted EBITDA grew by a strong 30%... reaching EUR 903 million" |
| EBITDA margin (reported/GAAP, CIQ line) | 2.2% | -0.2% | **+237bps** | Large swing driven mostly by one-off items normalizing (FY2024's reported figure was depressed by the Uber-breakup-fee-related reconciliation swing and a smaller goodwill impairment than FY2025's own impairment) — a quality flag, not a clean operating signal (see `06_earnings-quality`) | CIQ Income Statement tab; `01_historical-financials.md` §4 |
| EBIT margin (Operating Income) | 0.7% | -2.1% | **+280bps** | First positive statutory operating result in five years, driven by declining D&A (-53bps of revenue) and normalizing one-off items, partly offset by the -266bps gross-margin compression above | CIQ Income Statement tab |

**Pass-through lag, stated explicitly:** DHER has **no disclosed contractual mechanism** tying commission or delivery-fee rates to rider-cost inflation. `business-model/06_value-chain.md` §2 states plainly: "The filing does not describe any contractual pass-through mechanism, escalator, or indexed-pricing clause tying commission or delivery-fee rates to rider cost inflation." Where a cost shock is regulatory rather than commercial, the company has **absorbed it, not passed it through** — the Europe segment's FY2024 Adjusted EBITDA miss versus the Group's own guided range was explicitly attributed to "additional expenses recognized for rider-related reclassification risks in Italy" [FY24 AR, p.4, p.106]. The only demonstrated lever that behaves like a price increase is discount/voucher pull-back (vouchers fell from 8.1% to 6.9% of Total Segment Revenue FY2024 while GMV still grew) [FY24 AR, p.109]. There is effectively **no lag to measure because there is no pass-through mechanism at all** — cost increases are managed through mix shift (own delivery capturing the fee) and voucher discipline, not price.

## 4. Margin Walk — Which Margin Level Matters Most?

**Adjusted EBITDA margin is the most useful metric for this business**, for three reasons. First, it is what management actually guides to and what the Street tracks most closely — `04_guidance-consensus.md` confirms Adjusted EBITDA is the sole headline non-GAAP profitability metric DHER publishes guidance on (FY2026: €910m–€960m), and consensus is built around it. Second, gross margin is structurally distorted by an accounting mix effect that has nothing to do with underlying profitability: shifting revenue toward the Dmarts/Integrated Verticals segment (where DHER is "principal" and recognizes close to the full sale price) mechanically compresses reported gross margin relative to the commission-based marketplace segments, even when the shift is economically positive — the FY24 Annual Report itself attributes the FY2024 gross-margin decline explicitly to "higher own delivery volumes and the increasing Integrated Verticals share" [FY24 AR, p.108], a mix effect, not an efficiency signal. Third, EBIT margin, while now marginally positive, is still whipsawed by non-cash impairments and legal/antitrust provisions that swing by hundreds of millions of euros year to year (§3) — too noisy to read as a clean quarter-to-quarter signal. Adjusted EBITDA margin strips these distortions out, at the cost of being a company-defined, not-fully-audited-for-FY2025 metric — a real earnings-quality caveat that `06_earnings-quality` should examine, not a reason to prefer a noisier GAAP line here.

## 5. Margin Driver Table (consolidated)

| Driver | Impact on Margins | Direction | Magnitude | Evidence |
|---|---|---|---|---|
| Own-delivery mix shift (78% of group orders FY2025, up from 67% FY2024) | Adds the delivery fee to revenue (tailwind for revenue/take-rate) but raises delivery-expense share of COGS (headwind for gross margin) — net effect on Adjusted EBITDA margin ambiguous, historically net positive but decelerating | Mixed / Headwind on gross margin specifically | High — drove the entire -288bps of COGS/revenue-ratio increase in FY2024 vs FY2023 (§7) | FY2025 Earnings Call, prepared remarks; FY24 AR, p.108–109 |
| Segment mix shift toward MENA (highest-margin segment, 13.5% Adj. EBITDA/segment revenue FY2025, ~60.5% of segment Adj. EBITDA) | Tailwind — MENA both grows and improves margin | Tailwind | High | CIQ Segments tab, Dec-31-2025; Segment Map §2 |
| Integrated Verticals (Dmarts) reaching near-breakeven (-3.6% FY2024 → +0.1% FY2025 segment margin) | Tailwind — single largest positive margin-rate contributor to the FY2025 Adjusted EBITDA increase | Tailwind | High — contributed ~€119m of the ~€150m group margin-rate effect (§7) | CIQ Segments tab; Q1 2026 Trading Statement Call ("we will remain on slight positive EBITDA, while still reinvesting") |
| Asia competitive intensity (GMV -7.7% FY2024; Adj. EBITDA margin -192bps FY2025) | Headwind — the only segment where margin is actively eroding | Headwind | Mid-High — Asia is ~29% of segment revenue | FY24 AR, p.4, p.105–106; CIQ Segments tab |
| Rider employment-reclassification regulation (Spain, Italy; contingent liability €440m–€770m in Spain alone) | Headwind — hits the largest cost line (delivery expenses, 93.7% freelance/third-party) with no pass-through mechanism | Headwind | High if it spreads beyond Spain/Italy — already realized in Europe's FY2024 EBITDA miss | Value Chain §5; FY24 AR, p.126–128, p.203–204 |
| Voucher/discount discipline (vouchers 8.1%→6.9% of Total Segment Revenue FY2024; vendor-funded deals +8pp YoY in Saudi Arabia vs DH-funded discounts) | Tailwind — a demonstrated, controllable lever | Tailwind | Mid | FY24 AR, p.109; Q1 2026 Trading Statement Call |
| Advertising / AdTech revenue (nearing €1.5bn run-rate) | Tailwind — high-margin layer growing faster than the base business; explicitly framed by management as reducing "reliance on commission alone" | Tailwind | Mid-High (Inference on margin rate — no disclosed AdTech-specific margin %) | FY2025 Earnings Call, prepared remarks |
| Stock-based compensation (+31% YoY to €224.1m FY2025, management says "broadly stable" going forward) | Headwind on reported EBITDA/EBIT (excluded from Adjusted EBITDA) | Headwind (reported basis only) | Mid | FY2025 Earnings Call, CFO remarks |
| FX (USD, KRW devaluation vs EUR) | Headwind flagged for FY2026 revenue/GMV comparability; disclosed monetary-exposure sensitivity is modest at group P&L level (10% USD/EUR move = €26.8m, ~0.19% of FY2025 revenue) but does **not** cover full income-statement translation of the ~85% of revenue earned outside the eurozone | Headwind | Mid — disclosed sensitivity is Low, but translation exposure is understated by that sensitivity (see `10_external-dependency.md` §2) | FY2025 Earnings Call, prepared remarks; `10_external-dependency.md` §2 |
| FY2026 stepped-up investment (customer loyalty in MENA/South Korea, Integrated Verticals) | Headwind to near-term Adjusted EBITDA margin *expansion pace* — see §9 for the demand-side counter-read | Headwind (near-term) / Unknown (net, pending §9) | Mid-High — explicitly named by management as the reason FY2026 guidance is not simply extrapolated growth | FY2025 Earnings Call, prepared remarks: "we increase our investments in customer loyalty... as well as investments in integrated verticals" |
| D&A declining as % of revenue | Tailwind for EBIT margin | Tailwind | Low-Mid (-53bps FY2025 vs FY2024) | CIQ Cash Flow tab |
| One-off legal/antitrust/impairment items (management adjustments) | Volatile — swung from -€511.9m (FY2024) to -€147m (FY2025) on the Adjusted-EBITDA-to-EBT bridge | Tailwind in FY2025 relative to FY2024, but inherently unpredictable | Mid-High on reported (not Adjusted) profit measures | FY2025 Earnings Call, CFO remarks; CIQ Segments tab reconciliation |

## 6. Margin Drivers By Segment

FY2025 figures below are sourced from the CIQ Segments tab (Tier 5, tied to the Mar-26-2026 FY2025 earnings call, Tier 6) — **unaudited**, no FY2025 audited segment note exists in this pool. FY2024 figures are audited.

### Segment: MENA (26.6% of FY2025 Total Segment Revenue)

| Driver | Impact | Direction | Magnitude | Evidence |
|---|---|---|---|---|
| Subscription penetration (up to 61% of GMV in Saudi Arabia) | Reduces discount spend, supports margin | Tailwind | High | Q1 2026 Trading Statement Call |
| Category-share defense vs. a discount-heavy new entrant (Saudi Arabia, entered Sep-2024) without matching discounts | Margin preserved via loyalty/product, not price war | Tailwind | High — segment margin held at 13.5% FY2025 vs 13.4% FY2024, essentially flat despite the competitive entry | Q1 2026 Trading Statement Call: "growth has accelerated since the annualization of Keeta's market entry and margin impact has been limited" |
| Iran-conflict-driven "eat-at-home" demand spike in Saudi Arabia (Mar-2026) | One-time revenue/mix boost — **flagged non-run-rate** per the Cycle-Position Rule | Tailwind, but explicitly temporary | Low-Mid — management states KSA GMV growth was already >20% before the conflict, so the underlying trend does not depend on it | Q1 2026 Trading Statement Call |
| Stepped-up FY2026 loyalty/quick-commerce investment | Near-term margin-rate headwind, offset by accelerating GMV/order growth (see §9) | Mixed | Mid-High | FY2025 Earnings Call; Q1 2026 Trading Statement Call |

### Segment: Asia (29.1% of FY2025 Total Segment Revenue, largest by revenue)

| Driver | Impact | Direction | Magnitude | Evidence |
|---|---|---|---|---|
| Competitive intensity in "certain regions" | GMV fell 7.7% FY2024; Adj. EBITDA margin fell to 7.5% FY2025 from 9.5% FY2024, a -192bps decline | Headwind | High — the only segment with an outright margin decline in the latest period | FY24 AR, p.4, p.105–106; CIQ Segments tab |
| South Korea operating-model rebuild ("completely rebuilt the Korean operating model over the last 2 years") | Returned to positive order/GMV growth in Q1 2026 after investment; still a drag historically | Tailwind (emerging), Headwind (historically) | Mid | Q1 2026 Trading Statement Call |
| Own-delivery rollout in Asia (+12pp to 77% of segment orders) | Same mixed gross-margin-vs-take-rate effect as group-level (§5) | Mixed | Mid | Q1 2026 Trading Statement Call |

### Segment: Integrated Verticals / Dmarts (21.0% of FY2025 Total Segment Revenue)

| Driver | Impact | Direction | Magnitude | Evidence |
|---|---|---|---|---|
| Store rationalization (fewer, more profitable Dmarts locations) plus order-per-store growth (~30% revenue growth on "just a marginal increase in number of stores") | Operating leverage — orders per store rising is "very healthy for economics" per management | Tailwind | High — segment swung from -3.6% to +0.1% Adj. EBITDA margin FY2024→FY2025, the largest single margin-rate improvement in the group (§7) | FY2025 Earnings Call, Q&A |
| Still not commercially breakeven at scale; management guides only to "slight positive EBITDA" while continuing to reinvest | Caps near-term upside from this segment | Neutral-to-Tailwind, capped | Mid | Q1 2026 Trading Statement Call |

### Segment: Europe (16.4% of FY2025 Total Segment Revenue)

| Driver | Impact | Direction | Magnitude | Evidence |
|---|---|---|---|---|
| Rider employment-model transition in Spain (Glovo, employment-based from mid-2025) | One-off transition costs depressed H1 2025; segment "ended up around breakeven in the fourth quarter as planned" | Headwind (transitory) → improving | High while transition was live | FY2025 Earnings Call, Q&A |
| Italy rider-reclassification legal risk, unresolved | Contingent future headwind if a broader employment mandate follows | Headwind (contingent) | Unknown magnitude — no employment-model shift currently expected per management ("there is no discussions at this point in time that we will move to employment model") | FY2025 Earnings Call, Q&A |

### Segment: Americas (7.0% of FY2025 Total Segment Revenue, smallest)

| Driver | Impact | Direction | Magnitude | Evidence |
|---|---|---|---|---|
| Segment turned solidly profitable (1.1% FY2024 → 9.5% FY2025 Adj. EBITDA margin, +836bps) | Tailwind — second-largest positive margin-rate contributor to the group bridge after Integrated Verticals | Tailwind | High for a small segment (7% of revenue) | CIQ Segments tab; Segment Map §1 |
| Argentina IAS 29 hyperinflation accounting | Distorts comparability of reported growth/margin | Headwind on comparability, not necessarily on cash economics | Low-Mid | Segment Map §1 |

## 7. Margin Bridge — Latest Period

Two separate, fully reconciled bridges are shown because the data available at each granularity differs. **A full FY2025-vs-FY2024 gross-margin cost-of-sales-line bridge is not possible from available disclosure** — no audited FY2025 Annual Report or cost-of-sales note exists in this pool, so the -266bps FY2025 gross-margin change (§3) cannot be decomposed into delivery/Dmarts/payment/hosting/picker lines the way FY2024 vs FY2023 can. This is stated as a data gap, not estimated.

### 7a-i. Gross margin bridge, FY2024 vs FY2023 (audited — the most granular bridge the pool supports)

| Cost-of-sales line | FY2024 % of revenue | FY2023 % of revenue | Change (bps of revenue) | Direction |
|---|---:|---:|---:|---|
| Delivery expenses | 48.98% | 45.22% | **-376bps** (worsens gross margin) | Headwind |
| Dmarts cost of goods | 16.21% | 16.12% | -9bps | Headwind (small) |
| Payment-service fees | 3.74% | 4.33% | +59bps | Tailwind |
| Server hosting | 1.16% | 1.29% | +13bps | Tailwind |
| Picker cost | 0.93% | 0.88% | -5bps | Headwind (small) |
| Other cost of sales | 1.90% | 2.25% | +35bps | Tailwind |
| **Total COGS/revenue change** | 72.92% | 70.11% | **-282bps** (sum of components: -376-9+59+13-5+35 = -283bps) | — |
| **Stated Total gross margin change** | | | **-282bps** | Reconciled — **1bps residual**, immaterial |

### 7a-ii. Adjusted EBITDA € bridge, FY2025 vs FY2024, by segment (CIQ Segments tab, both years — consistent basis)

Group Adjusted EBITDA (segment sum) rose from €692.6m (FY2024) to €902.8m (FY2025), a change of **+€210.2m**, decomposed per segment into a volume effect (revenue growth at the prior year's margin) and a margin-rate effect (this year's margin applied to this year's revenue, net of the volume effect):

| Segment | Volume effect (€m) | Margin-rate effect (€m) | Total ΔEBITDA (€m) | Actual ΔEBITDA (€m) |
|---|---:|---:|---:|---:|
| MENA | +67.8 | +5.4 | +73.2 | +73.1 |
| Asia | +32.7 | -84.8 | -52.1 | -52.0 |
| Europe | -24.2 | +22.0 | -2.2 | -2.2 |
| Americas | +1.3 | +88.4 | +89.7 | +89.7 |
| Integrated Verticals | -17.5 | +119.0 | +101.5 | +101.6 |
| **Total** | **+60.1** | **+150.0** | **+210.1** | **+210.2** |

**Reconciliation: 210.1 of 210.2 = fully reconciled, ~0.1m residual, immaterial.** The finding: **71% of the Adjusted EBITDA increase came from margin-rate improvement, not revenue growth** (+150.0m margin-rate vs +60.1m volume) — driven overwhelmingly by Integrated Verticals (+119.0m) and Americas (+88.4m), almost entirely offset on the negative side by Asia (-84.8m).

**Basis note (§7a rule):** this segment bridge is built on Total Segment Revenue (€15,184.3m FY2025 / €13,141.0m FY2024), not the IFRS Revenue used for the headline Adjusted EBITDA/Revenue margin in §3 (€14,059.6m / €12,294.7m). On the Total-Segment-Revenue basis, group Adjusted EBITDA margin moved 902.8/15,184.3=5.95% vs 692.6/13,141.0=5.27%, a change of **+68bps** — this does **not** exactly equal the headline +79bps (§3, computed on IFRS Revenue). The **11bps gap is the residual from the basis difference**: Total Segment Revenue grew faster than IFRS Revenue in FY2025 (+15.6% vs +14.4%) because the voucher/reconciliation-effects gap between the two bases widened (from -€846.3m to -€1,124.7m) — this is stated explicitly rather than treating the two bases as interchangeable.

## 7a. Bridge Attribution and Residual

**Gross margin bridge (FY2024 vs FY2023):**
```
Delivery expenses: (48.98% - 45.22%) of revenue = 3.76pp = 376bps
  Basis: audited FY2024 Annual Report cost-of-sales note, both years on the same revenue-denominator basis
  = 376bps of the 282bps observed gross-margin decline (this single line, on its own, is larger than the
    total decline — offset by Payment fees +59bps, Server hosting +13bps, Other COGS +35bps)
  → basis matches, both years drawn from the same audited note
Sum of all six cost-of-sales-line components = -283bps vs stated Total -282bps
  → 1bps residual, reconciled
```

**Adjusted EBITDA € bridge (FY2025 vs FY2024, segment level):**
```
Integrated Verticals margin-rate effect: €3,189.0m (FY2025 segment revenue) × (0.09% - (-3.64%))
  = €3,189.0m × 3.733% = €119.0m
  Basis: CIQ Segments tab, both years on the same (Total Segment Revenue, per-segment) basis
  = €119.0m of the €210.2m total group Adjusted EBITDA increase (57% of the total, the single largest
    component)
  → basis matches (same source, same denominator convention, both years)
Sum of volume + margin-rate effects across all five segments = €210.1m vs stated actual €210.2m
  → €0.1m residual, immaterial, reconciled
On the margin-percentage read (not the € read): segment-revenue-basis margin change (+68bps) vs
  IFRS-revenue-basis headline margin change (+79bps, §3) — an 11bps gap from the two bases growing at
  different rates (Total Segment Revenue +15.6% vs IFRS Revenue +14.4%) — this gap is NOT applied silently;
  it is named here as a basis-mismatch residual, not folded into either figure.
```

Both bridges reconcile with residuals under 2bps / €0.1m — small enough that a "biggest driver" claim in §8 can be made with confidence for each respective period, subject to the explicit caveat that the two bridges cover **different periods** (FY2024-vs-FY2023 for the gross-margin line-item bridge; FY2025-vs-FY2024 for the Adjusted-EBITDA segment bridge) because the pool does not support the same granularity in both years.

## 8. The Single Biggest Margin Driver

**Rider employment-classification regulation, applied to a cost line DHER cannot currently price around.** Delivery expenses are 67.2% of cost of sales and ~49% of revenue (FY2024, audited) [FY24 AR, p.109], and 93.7% of that spend runs through external/freelance riders, not DHER's own employed fleet [Value Chain §2]. There is no disclosed contractual mechanism to pass a rider-cost increase through to commission or delivery-fee pricing (§3) — when a reclassification-driven cost shock hit Europe in FY2024, the company absorbed it rather than pricing around it, missing its own guided Adjusted EBITDA range as a direct result [FY24 AR, p.4, p.106]. The disclosed contingent liability for the Spain courier-fleet reclassification alone is €440.0m–€770.0m [FY24 AR, p.203–204], and a comparable outcome in Italy (or any of the several jurisdictions where legislation is "shifting, evolving" per management's own Q&A comment) would hit the *same* cost line group-wide, not one segment in isolation — unlike Asia's competitive-margin erosion (§6), which is contained to a single segment and has shown some evidence of being manageable (Saudi Arabia's response to a discount-heavy entrant, §6). A stress illustration using the §7a-i basis: a 5% rider-cost increase applied to the ~49%-of-revenue delivery-expense line, with no offsetting price action (consistent with the demonstrated absence of a pass-through mechanism), would be roughly 49% × 5% ≈ 245bps of revenue — a High-magnitude move on the primary margin metric (§4), larger than any single driver identified in §5 or §7 except the delivery-expense mix-shift effect itself. **Current direction: contained but not resolved** — Italy's reclassification risk is unresolved ("we will come back with more information, when there is something to say" — FY2025 Earnings Call, Q&A), and the EU Platform Work Directive gives member states 24 months to transpose new rules DHER itself flags as a source of "additional obligations for platforms and an increased risk regarding the reclassification of workers" [`10_external-dependency.md` §1].

## 9. Investment Spend — Both Signs

FY2026 opex investment (customer loyalty programs in MENA and South Korea, continued Integrated Verticals build-out) is running well above the prior steady state — management explicitly named it as the reason Adjusted EBITDA margin *expansion pace* is guided to slow sharply (from +308bps FY2024 to a guided-implied lower rate for FY2026, continuing the deceleration already visible: +814bps→+800bps→+308bps→+79bps YoY, FY2021–FY2025 per `01_historical-financials.md` §6). Capex itself grew a more modest +16.6% FY2025 vs FY2024 (€325.8m vs €279.5m, broad capex measure) or +23% on the CIQ narrow PP&E-only measure (€171.0m vs €139.1m) — not an extreme step-change — but the qualitative commentary is explicit that this is a deliberate, named investment cycle, so both signs are scored below.

| Reading | What it would show | Evidence here |
|---|---|---|
| Spend as a future COST | Increased loyalty/subscription-funding and Dmarts investment lowers near-term Adjusted EBITDA margin *expansion pace* even as absolute Adjusted EBITDA still grows; management explicitly cited this as the reason the FY2026 guide isn't a simple extrapolation of FY2025's growth rate | FY2025 Earnings Call, prepared remarks: "we increase our investments in customer loyalty in key markets, including MENA and South Korea as well as investments in integrated verticals" — flagged as an FY2026 EBITDA-guidance driver |
| Spend as a DEMAND signal | Group order growth accelerated to 10% in Q1 2026 from 9% in Q4 2025; GMV growth accelerated to 8.8% like-for-like from 7.9%; South Korea "returned to positive order and GMV growth" after two years of rebuild investment; management raised its own confidence to the **upper half** of the FY2026 EBITDA range only 35 days after setting it, explicitly because of "positive results from investments in MENA, Asia and Quick Commerce" | Q1 2026 Trading Statement Call, prepared remarks and Q&A (UBS exchange: "why don't we see... a step change in economics... what's changed over the last 35 days" → management: "we have seen very positive results in Korea... very good results also in Middle East... we feel confident that we are going to land in the higher end of the range") |

**Current read:** the evidence favors the **demand-signal reading as the dominant one, not merely the cost reading**. Management did not merely absorb higher near-term investment against flat or slower growth — it raised its own guidance confidence toward the top of the FY2026 range specifically citing early returns from the same investment 35 days after guidance was set, and Q1 2026 order/GMV growth accelerated across MENA, Asia (South Korea specifically), and Quick Commerce simultaneously. The single observable that would flip this read: **if the FQ2 2026 print (scheduled 2026-08-27, per `04_guidance-consensus.md` §1) shows GMV/order growth decelerating from Q1's pace while the elevated investment continues** — that would indicate the spend is not converting to demand and the cost reading should dominate instead. As of this report, no such deceleration is visible in the data reviewed.

**Cycle-position note (§ Cycle-Position Rule):** DHER's Adjusted EBITDA margin is in an early-stage structural ramp, not a cyclical peak — it turned positive only in FY2023 (2.6%) and has expanded every year since to 6.4% in FY2025, with no prior profitability cycle in this company's history to compare against (Adjusted EBITDA/GMV margin: 0.6% FY2023 → 1.4% FY2024) [`01_historical-financials.md` §1; FY24 AR, p.4]. The one identified one-time tailwind in the current data — Saudi Arabia's "extra high single-digit growth" in March 2026, attributed by management to a shift toward eat-at-home consumption during the Iran conflict — is explicitly non-run-rate and should not be extrapolated into FY2026 MENA margin or growth expectations, though management states KSA GMV growth was already above 20% before the conflict began [Q1 2026 Trading Statement Call].



---

## earnings / 04_guidance-consensus.md

_Source: `04_guidance-consensus.md`_

# Guidance & Consensus — DHER

## 1. Consensus Data Metadata

| Field | Value |
|---|---|
| Source | Capital IQ Estimates workbook (`DeliveryHeroSEXTRADHEREstimatesReport.xls` — Consensus, Guidance, Trends, Revisions, Recent Changes, Surprise tabs) |
| Data as of date | No later than 2026-08-05 (Guidance tab, "Actual/Latest Date" field for FY2026 Adjusted EBITDA consensus, `DeliveryHeroSEXTRADHEREstimatesReport.xls, Guidance tab`); cross-checked against the most recent logged analyst revision event, 2026-07-24 (`…Recent Changes tab`) |
| Fiscal year basis | FY ends Dec-31; current fiscal year FY2026 (in progress); next print is the FQ2 2026 result, scheduled 2026-08-27 (`…Consensus tab`, header) |
| Analyst count | Varies by line item: 13 analysts on Target Price/Recommendation; 14 on FY2026 Revenue; 10–13 on FY2026 Adjusted EBITDA; 7–9 on FY2026 Free Cash Flow; 10–12 on FY2026 EPS Normalized (`…Consensus tab` and `…Revisions tab`, each cited inline below) |
| Currency | EUR (reported currency; IFRS as adopted by the EU) — `…Consensus tab`, header: "Currency: Reported Currency", "Acctg. Standard: IFRS" |
| Calendarization issue? | N — fiscal year (Dec-31) matches calendar year; no cross-calendar reconciliation needed |

**Live M&A overlay (material caveat carried from `00_earnings-data-triage.md`):** DHER is the subject of an announced acquisition offer from Uber, discussed on a dedicated M&A call held 2026-07-16 (`Uber Technologies, Inc., Delivery Hero SE - M&A Call.pdf`; Uber's own materials price the deal around "8x adjusted EBITDA" and note Prosus has "irrevocably committed to tender" its stake — `Uber M&A Call transcript, Jul 16 2026`). The Recent-Changes log shows a cluster of large Target Price and Recommendation revisions dated 2026-07-16 through 2026-07-24 (e.g. one broker's target price moving from €25.40 to €36.00, another from €33.00 to €41.50, and multiple Recommendation flips — `…Recent Changes tab`), consistent with sell-side price targets re-anchoring to the deal terms rather than to a fresh fundamental re-rate. **Target Price (mean €37.97) and Recommendation (Hold, 2.86) should therefore be read as deal-contaminated, not as a clean fundamentals-only consensus signal.** The Revenue/EBITDA/FCF/EPS operating-line consensus figures used below are less directly affected (most of the July revision cluster is concentrated in Target Price and Recommendation fields, not the P&L/cash-flow estimate lines), but the overall market attention on DHER post-2026-07-16 is dominated by deal mechanics, not the standalone earnings setup this module assesses.

## 2. Management Guidance

| Metric | Period | Guidance | Type (Point / Range / Qualitative) | Source |
|---|---|---|---|---|
| GMV (like-for-like growth) | FY2026 | 8%–10% | Range | FY2025 Earnings Call, Mar 26 2026, prepared remarks: "Our full year GMV guidance remains 8% to 10% like-for-like" |
| Revenue | FY2026 | No formal €/range figure. Qualitative: revenue growth "expected to continue to exceed growth in GMV," with the revenue/GMV gap narrower than in FY2025 as the own-delivery mix-shift tailwind fades (own-delivery reached 78% of group GMV in FY2025, up from 67% in FY2024) | Qualitative | FY2025 Earnings Call, Mar 26 2026, prepared remarks |
| Adjusted EBITDA | FY2026 | €910m–€960m (midpoint €935m) | Range | FY2025 Earnings Call, Mar 26 2026, prepared remarks: "For adjusted EBITDA, we expect a range between EUR 910 million to EUR 960 million in 2026" |
| Free Cash Flow | FY2026 | More than €200m (open-ended floor) | Point/floor, qualitative upper bound | FY2025 Earnings Call, Mar 26 2026, prepared remarks: "Free cash flow is expected to be more than EUR 200 million for 2026" |
| Capex | FY2026 | Company does not provide formal guidance. | — | Not proven from available data — no capex figure or range appears in either transcript; consensus estimates capex at ~€363m for FY2026 (`Capital IQ Consensus tab`, Capital Expenditure row, FY2026 median, 9/10 analysts) |
| Other KPI — GMV progress vs. guide (Q1 2026) | Q1 2026 | Group GMV grew 8.8% like-for-like in Q1 2026, up from 7.9% in Q4 2025 — inside, but toward the low end of, the 8–10% FY guide | Actual, reported | Q1 2026 Sales/Trading Statement Call, Apr 30 2026, prepared remarks |

**Guidance basis matters here — FCF is not guided on the same basis as the reported "Actual" figure.** In the FY2025 results Q&A, CFO Marie-Anne Popp confirmed the free-cash-flow guide excludes "extraordinary outflows" (legal costs/contingencies, the minority dividend to Talabat, and related interest payments): *"we guided on free cash flow, excluding extraordinary outflows… at this stage, the guidance we can give is on… cash flow before extraordinary items"* (FY2025 Earnings Call, Mar 26 2026, Q&A, Andrew Ross/Barclays exchange). The same "before extraordinary items" framing applies to the FY2026 >€200m guide. The reported "Actual" figure carried in the CIQ Guidance tab, by contrast, is total/unadjusted free cash flow (CFO − capex) — see Section 6 for the resulting FY2025 gap between guided and reported FCF.

Midpoint used for the EBITDA range: (€910m + €960m) / 2 = **€935m**.

## 3. Guidance vs Consensus Table

| Metric | Period | Management Guidance | Street Consensus | Gap | Gap Direction |
|---|---|---|---|---:|---|
| Revenue | FY2026 | No formal figure (qualitative: growth above GMV growth) | €15,653.2m (mean, 14 analysts) — implies +11.3% YoY vs. FY2025 actual €14,059.6m | Not computable (no guided figure) | Not assessable — company does not guide a revenue number |
| Adjusted EBITDA | FY2026 | €910m–€960m (midpoint €935m) | €951.85m (mean, 10–13 analysts, data as of ~2026-08-05) | +€16.85m (+1.8% vs. midpoint) | Guidance below Street — but consensus sits inside the guided range, in its upper half, matching management's own steer (see below) |
| Free Cash Flow | FY2026 | More than €200m (floor; "before extraordinary items") | €220.14m (mean, ~7–9 analysts) | +€20.14m (+10.1% vs. floor) | Guidance below Street — consensus already prices meaningfully above the guided floor |
| EPS (Normalized) | FY2026 | Company does not provide formal EPS guidance. | -€0.07 (mean, 10–12 analysts) | Not computable (no guided figure) | Not assessable |
| EPS (GAAP) | FY2026 | Company does not provide formal EPS guidance. | -€1.42 (mean) | Not computable (no guided figure) | Not assessable |

Gap = Consensus minus Guidance (midpoint for the EBITDA range, floor for FCF); positive = Street above guidance.

**On the EBITDA gap:** the Apr 30 2026 Q1 trading-statement call moved management's own signal toward the upper half of the range — *"the solid start to the year… make us confident in our ability to deliver adjusted EBITDA in the upper half of the guidance range of EUR 910 million to EUR 960 million"* (Q1 2026 Sales/Trading Statement Call, prepared remarks). The upper half of €910m–€960m is €935m–€960m; consensus at €951.85m sits inside that upper half, i.e., the Street has already moved to reflect management's own upgraded language rather than sitting meaningfully ahead of or behind it.

**On the FCF gap:** consensus (€220.14m) has actually drifted DOWN slightly since the guidance was set on 2026-04-30, when the consensus estimate stood at €242.05m (`Guidance tab`, "As Of Guidance" Consensus Estimate, FY2026 column) — a small downward revision of about €22m in the ~3.5 months since guidance, even as the guided floor itself has not changed.

## 3A. Alt-Data Cross-Check

Not applicable — no `data/DHER/external/` directory exists in this pool (confirmed in `00_earnings-data-triage.md`, Section 1A). No licensed alt-data panel is available for DHER; this section is omitted per the module rule that its absence is not a gap.

## 4. Estimate Revision Momentum Table

CIQ's Trends tab reports estimate vintages by month-lag (1/2/3/6/9/12/18 months ago), not by fixed 30/60/90-day windows. The mapping below (1 month ≈ 30 days, 2 months ≈ 60 days, 3 months ≈ 90 days) is an approximation, stated explicitly.

| Estimate | ~90 Days Ago | ~60 Days Ago | ~30 Days Ago | Current | Direction |
|---|---:|---:|---:|---:|---|
| Revenue (next Q, FQ2 2026) | €3,903m | €3,903m | €3,903m | €3,903m | Flat — unchanged across all four vintages |
| EBITDA (next Q, FQ2 2026 stand-alone) | N/A | N/A | N/A | N/A | Not available — Trends tab does not break out FQ2 2026 EBITDA on its own (only half-year FH1/FH2 2026 aggregates are populated, both also flat across vintages) |
| EPS Normalized (next Q, FQ2 2026) | N/A | N/A | N/A | N/A | Not available — Trends tab EPS Normalized series is annual-only (FY vintages), no FQ breakdown |
| Revenue (next FY, FY2026) | €15,736.2m | €15,711.5m | €15,711.5m | €15,653.2m | Falling (slightly) — down ~0.5% over the quarter, no move between the 60- and 30-day marks |
| EBITDA (next FY, FY2026) | €948.2m | €949.6m | €949.6m | €951.9m | Rising (slightly) — up ~0.4% over the quarter |
| EPS Normalized (next FY, FY2026) | -€0.21 | €0.02 | €0.02 | -€0.07 | Volatile — improved vs. 90 days ago but has fallen back in the most recent month |

Source for all rows: `DeliveryHeroSEXTRADHEREstimatesReport.xls, Trends tab`.

For reference, the same FY2026 EPS Normalized series 6/9/12/18 months ago was €0.68 / €1.52 / €1.71 / €1.22 — the estimate has been cut by roughly €1.78 (from €1.71 twelve months ago to -€0.07 now), i.e. the FY2026 EPS story has been through a large multi-quarter downgrade cycle that predates, and is much larger than, the small moves visible in the last 90 days. The FY2026 EBITDA estimate shows the same pattern at a smaller scale: €1,366m twelve months ago vs. €952m now, a cut of roughly €414m (~30%) — almost all of which happened before the last quarter, not within it.

## 5. Revision Breadth

| Metric | Up Revisions | Down Revisions | Net Revision Breadth | Period |
|---|---:|---:|---:|---|
| Revenue FY2026 | 3 | 2 | +1 | Last 3 months (17 analysts tracked, 13 still in consensus) |
| Adjusted EBITDA FY2026 | 1 | 0 | +1 | Last 3 months (12 analysts tracked, 7 still in consensus) |
| EPS Normalized FY2026 | 1 | 1 | 0 | Last 3 months (10 analysts tracked, 6 still in consensus) |

Source: `DeliveryHeroSEXTRADHEREstimatesReport.xls, Revisions tab`. Over the most recent single month the picture is even quieter: Revenue +1/-0, EBITDA 0/-0, EPS Normalized 0/-0 — essentially no active revision traffic on the core operating lines in the last 30 days, consistent with the flat/near-flat 90-day trend in Section 4. This is a low-conviction, low-activity revision picture — not a market actively debating the numbers either up or down.

## 6. Historical Beat / Miss Pattern

Quarterly-level revenue/EBITDA surprise data is not populated cleanly in this pool export (the Surprise tab carries full-year figures only for Revenue/EBITDA/EBIT). The table below therefore uses the last four reported FISCAL YEARS (FY2022–FY2025) rather than quarters; this substitution is stated explicitly per the module's TTM/data-availability rule.

| Period | Revenue Beat/Miss (vs. Street) | EPS (Normalized) Beat/Miss (vs. Street) | Magnitude (Revenue) | Notes |
|---|---|---|---:|---|
| FY2022 | Miss | Miss | -3.9% (€8,577.3m actual vs. €8,922.3m est.) | EPS miss of -€1.93 (actual -€7.48 vs. est. -€5.55); EBITDA actually beat (+€107.65m, narrower loss than expected) |
| FY2023 | Miss | Miss | -0.3% (€9,941.9m actual vs. €9,972.2m est.) | EPS miss of -€1.87; EBITDA marginal beat (+€0.32m, +0.1%) |
| FY2024 | Beat | Miss | +2.2% (€12,294.7m actual vs. €12,026.5m est.) | EPS miss of -€0.39; EBITDA miss of -€43.55m (-5.9%) despite the revenue beat — a mix/margin story, not a top-line problem |
| FY2025 | Miss | Miss | -1.1% (€14,059.6m actual vs. €14,212.8m est.) | EPS miss of -€1.39 (actual -€1.32 vs. est. +€0.07 — Street expected roughly breakeven, got a loss); EBITDA miss of -€14.33m (-1.6%), landing near the low end of the €900m–€940m guided range |

Source: `DeliveryHeroSEXTRADHEREstimatesReport.xls, Surprise tab` (Company Level, EUR).

**The base rate this sets for FY2026: DHER has missed Street's EPS Normalized estimate in every one of the last five reported fiscal years (FY2021–FY2025), including the FY2025 print where consensus expected a near-breakeven year and got a loss instead.** Revenue has missed Street in 3 of the last 4 years. This is relevant context for how much weight to put on the currently calm, low-activity revision picture in Sections 4–5 — the historical pattern argues for treating any FY2026 EPS/EBITDA optimism with more caution than the flat recent-revision trend alone would suggest.

**Guidance-vs-actual (a separate, better-behaved series) for Adjusted EBITDA:** FY2023 guided €250m / actual €253.6m (beat +1.4%); FY2024 guided €693m / actual €692.5m (in-line, -0.1%); FY2025 guided €900m–€940m / actual €903m (in-line, landed near the low end of the range). Management's Adjusted EBITDA guidance has been tracked closely for three straight years — a materially better record than the Street-consensus EPS line above (`Guidance tab`).

**Guidance-vs-actual for Free Cash Flow tells the opposite story.** FY2024 guided €50m–€100m / actual reported €358.8m (beat by ~4x). FY2025 guided €120m (point) / actual reported -€246m (a swing of -€366m against guidance). As Section 2 notes, this gap is largely a definitional one — the guide excludes "extraordinary" cash items (legal/contingency outflows, the Talabat minority dividend, related interest) that the reported "Actual" figure includes — but the practical effect for FY2026 is that the >€200m FCF floor carries real headline miss risk if FY2026 sees outflows of a similar scale to FY2025, even if the underlying "before extraordinary items" cash generation comes in on guide.

## 7. Bar Assessment

**Bar is fair.**

On the metric management actually guides and the Street tracks most closely — Adjusted EBITDA — consensus (€951.85m) sits inside the upper half of the €910m–€960m guided range, which is exactly where management's own Apr-30-2026 commentary pointed ("confidence… in the upper half of the guidance range"). The Street has not raced ahead of guidance, nor is it sitting meaningfully below it: the €16.85m gap versus the range midpoint is only 1.8%. Revision activity on the core operating lines (Revenue, EBITDA, EPS Normalized) has been essentially flat over the past 30–90 days (Section 4) with a near-even net revision breadth over the last three months (Section 5) — not a Street bracing for a beat, and not one bracing for a miss either.

Two things complicate a cleaner "low" or "high" call. First, Free Cash Flow: consensus (€220.14m) already sits ~10% above the guided ">€200m" floor, and the FY2025 precedent shows the guided-vs-reported FCF bridge can swing by hundreds of millions of euros once "extraordinary" cash items (legal costs, the Talabat minority dividend, contingencies) are included in the reported figure — a real, evidenced source of headline miss risk that the calm consensus number does not capture. Second, DHER's five-year record of missing Street's EPS estimate (Section 6) argues for treating the currently quiet EPS revision picture with caution rather than as reassurance. Finally, the ongoing Uber acquisition process (announced 2026-07-16) has visibly reset Target Price and Recommendation consensus toward deal terms rather than fundamentals (Section 1) — a genuine complication for reading "consensus" as a clean market view on the standalone earnings setup, even though the underlying Revenue/EBITDA/FCF estimate lines used for this assessment show comparatively little contamination from the deal news.

## Out-of-scope

None — this report stays within guidance/consensus scope; valuation, price target, and rating questions raised by the Uber offer are noted only as context for how to read consensus (Section 1) and are not assessed here.



---

## earnings / 05_beat-miss-setup.md

_Source: `05_beat-miss-setup.md`_

# Beat / Miss Setup — DHER

## 1. Next Quarter Context

The next print is the FQ2 2026 (Apr–Jun 2026) result, scheduled **2026-08-27** — 15 days from today [04_guidance-consensus.md §1]. Q2 is DHER's seasonally **weakest** quarter: it has averaged the smallest share of annual revenue (23.5%) in each of the last three fiscal years, roughly 3.2 points below Q3, the strongest quarter, in every year [01_historical-financials.md §5]. The consensus bar for the metric management actually guides to — Adjusted EBITDA — sits inside the upper half of the FY2026 guided range (€910m–€960m), matching management's own Apr-30-2026 steer that it expects to land "in the upper half" [04_guidance-consensus.md §3]. Revenue for FQ2 2026 stands at a flat €3,903m Street consensus, unchanged across the last 90 days of estimate vintages [04_guidance-consensus.md §4]. DHER is also mid-way through a live, announced Uber acquisition approach (offer disclosed 2026-07-16); Target Price and Recommendation consensus are deal-contaminated, though the operating-line (Revenue/EBITDA/FCF) estimates used here are comparatively unaffected [04_guidance-consensus.md §1].

## 2. Beat Scenarios

| Scenario | Driver | What Would Need To Happen | Likelihood (High / Mid / Low) | Evidence |
|---|---|---|---|---|
| GMV/order acceleration continues into Q2 | GMV / order volume (revenue driver, "High" importance) | Group like-for-like GMV growth needs to hold or extend the Q4'25→Q1'26 acceleration (7.9%→8.8% LFL; orders 9%→10%) into Q2, rather than reverting | Mid | Two consecutive quarters of accelerating LFL growth [02_revenue-drivers.md §3–4, Q1 2026 Call, prepared remarks] |
| Korea (Baemin) inflection sustains | Asia segment competitive dynamics | South Korea needs to post a second straight quarter of positive order/GMV growth after its ~2-year rebuild, proving the Q1 2026 return to growth was not a one-off | Mid | "Returned to positive order and GMV growth" Q1 2026 after 2-year platform rebuild — one data point only [02_revenue-drivers.md §4, §5 (Asia)] |
| Adjusted EBITDA lands in upper half of guide, as management signaled | Segment margin-rate improvement (Integrated Verticals, Americas) | Integrated Verticals needs to hold its swing to +0.1% segment margin and Americas its jump to 9.5% margin, both of which drove 71% of the FY2025 EBITDA increase from margin-rate, not volume | Mid-High | Management raised its own confidence to the upper half of the €910m–€960m range only 35 days after setting it, explicitly citing early returns from MENA/Asia/Quick Commerce investment [03_margin-drivers.md §7a-ii, §9; 04_guidance-consensus.md §3] |
| MENA share defense against KSA discount entrant holds | Category-share / subscription penetration | Saudi Arabia's category-share gains (visible since Q4 2025) need to continue without DHER matching the entrant's discounting, preserving MENA's 13.5% segment margin | Mid | MENA segment margin held flat (13.5% vs 13.4%) through the competitive entry via subscription/vendor-funded deals, not discounting [03_margin-drivers.md §6 (MENA)] |

## 3. Miss Scenarios

| Scenario | Driver | What Would Need To Happen | Likelihood (High / Mid / Low) | Evidence |
|---|---|---|---|---|
| Reported-currency revenue growth reverts toward the CIQ trend, not management's LFL narrative | Revenue growth rate reconciliation gap | The Q1 2026 gap between management's stated "+18%" revenue growth and the CIQ-computed reported-currency +5.8% needs to resolve toward the lower figure for Q2 as well, rather than being a one-quarter FX artifact | Mid-High | Unreconciled in the data pool; both FY2025 (23% stated vs 14.4% computed) and Q1 2026 (18% vs 5.8%) point the same direction — management's stated growth well above the computed reported-currency rate, with no bridge disclosed [01_historical-financials.md §3, §6; 02_revenue-drivers.md §6] |
| FX (USD/KRW) headwind larger than the disclosed monetary sensitivity implies | FX translation | Reported-currency revenue and EBITDA need to be hit harder than the disclosed ±€26.8m (10% USD move) / ±€72.0m (10% KRW move) monetary-exposure sensitivities suggest, since no full income-statement translation sensitivity is disclosed for the ~85% of revenue earned outside the eurozone | Mid | Explicit management flag: "year-over-year FX comparisons remain a headwind following last year's USD and Korean won devaluation" [02_revenue-drivers.md §4; 03_margin-drivers.md §5] |
| Gross-margin compression continues for a third straight year | Own-delivery/Integrated Verticals mix shift | Delivery-expense share of COGS needs to keep rising faster than revenue, extending the -282bps (FY2024) and -266bps (FY2025) gross-margin declines | High | Two consecutive years of gross-margin compression on the same mechanism (own-delivery mix, no pass-through pricing) [01_historical-financials.md §6; 03_margin-drivers.md §3, §7a-i] |
| Asia margin erosion deepens | Asia segment competitive intensity | Asia's Adjusted EBITDA margin needs to keep falling (already -192bps FY2025, the only segment with an outright margin decline) if Korea's Q1 2026 inflection does not hold or does not yet offset ongoing pressure elsewhere in the segment | Mid | Asia margin fell to 7.5% (FY2025) from 9.5% (FY2024); Korea's positive turn is a single-quarter data point, not yet proven [03_margin-drivers.md §6 (Asia)] |
| FCF misses the >€200m guided floor on a headline basis | "Extraordinary" cash items (legal/antitrust, Talabat minority dividend) | Reported (unadjusted) FCF needs to be hit by legal/contingency outflows or the Talabat dividend of a similar scale to FY2025, when the guided ~€120m point became a reported -€246m (a -€366m swing) | Mid | Direct FY2025 precedent for the identical guidance construct; consensus (€220.14m) already sits above the guided floor and has been quietly revised down ~€22m since guidance was set [04_guidance-consensus.md §3, §6] |

## 4. What Magnitude Matters?

| Metric | Consensus / Bar | Material Beat Threshold | Material Miss Threshold | Why |
|---|---:|---:|---:|---|
| Revenue (FQ2 2026) | €3,903m (flat vs. 90-day-ago estimate) [04_guidance-consensus.md §4] | >€4,050m (≈+4% above consensus, implying reported YoY growth closer to management's "+18%" LFL narrative than the CIQ reported-currency trend) | <€3,750m (≈-4%, implying reported YoY growth in the mid-single digits, consistent with the CIQ-computed Q4'25/Q1'26 trend of 4.7%/5.8%) | No formal company revenue guide exists, so materiality is set relative to the unreconciled growth-rate gap itself (Section 3) — a print near the top or bottom of this band effectively resolves which growth-rate narrative was closer to reported-currency reality |
| Adjusted EBITDA (H1 2026, half-year block — quarterly not disclosed) | ~€425m implied (Inference, not from filings — FH1 2025 was €410.7m, 45.5% of FY2025's €903m; applying the same H1 share to the FY2026 midpoint of €935m) | >€460m (would put the company visibly ahead of an on-guide pace for the upper half of the FY26 range) | <€390m (would put H1 behind pace for even the low end of the €910m–€960m FY26 range) | Adjusted EBITDA is the sole metric management guides on and the Street tracks most closely [03_margin-drivers.md §4; 04_guidance-consensus.md §7]; disclosed only annually/half-yearly, not quarterly [01_historical-financials.md §3] |
| EPS (Normalized) | -€0.07 (FY2026 consensus, mean of 10–12 analysts) [04_guidance-consensus.md §3] | Cannot define — company gives no EPS guidance and the FY2026 consensus itself has been cut ~€1.78 over the last 12 months (from €1.71 to -€0.07) [04_guidance-consensus.md §4] | Same | EPS is the metric with the worst historical hit rate (missed Street 5 straight fiscal years, Section 7) but the least-anchored consensus (no company guide, largest recent cut) — a beat/miss threshold here would be false precision |
| Guidance (FY2026 Adjusted EBITDA range, reaffirmed/raised/cut on the call) | €910m–€960m, management already steering to the upper half as of Apr-30-2026 | Range narrowed/raised (e.g., to €930m–€960m or higher) | Range widened or lowered, or management walks back the "upper half" language | A guide change on the Aug-27 call carries more information than the quarter's own print, given Adjusted EBITDA's half-year-only disclosure cadence |

## 5. In-Line Print But Bad Guidance Risk

| Risk | Evidence | Why It Matters |
|---|---|---|
| In-line Q2 EBITDA but FY2026 margin-expansion pace guided down further | Adjusted EBITDA margin expansion has already decelerated sharply for three straight years (+814bps→+800bps→+308bps→+79bps, FY2021–FY2025) and management has named FY2026 stepped-up loyalty/Integrated Verticals investment as an explicit reason the guide is "not simply an extrapolation" of FY2025 [01_historical-financials.md §6; 03_margin-drivers.md §9] | A quarter that lands in-line on EBITDA can still disappoint if the cadence of margin expansion is guided to decelerate further than the Street currently models |
| Beat headline revenue on FX/LFL framing but reported-currency growth actually weaker | The unreconciled gap between management's "+18%" and the CIQ-computed +5.8% (Q1 2026) means a Q2 print that "beats" on management's own framing could still miss the CIQ-consensus reported-currency figure the Street's model is built on [01_historical-financials.md §3, §6; 02_revenue-drivers.md §6] | The two readings can diverge by double digits of growth in the same quarter — a genuine risk of the market reading the print differently than the company frames it |
| Beat EBITDA due to one-off item normalization, miss quality | FY2025's reported/GAAP EBITDA swing (+237bps YoY) was driven mostly by one-off items normalizing (the Uber breakup-fee reconciliation and a smaller impairment than FY2024's), not a clean operating improvement [01_historical-financials.md §4; 03_margin-drivers.md §3] | A Q2 print flattered by one-off timing (legal provisions, impairment timing, management-adjustment swings) would not represent a durable earnings quality improvement |
| Beat revenue/EBITDA but FCF misses on "extraordinary" items | The FY2025 FCF guide (€120m point) vs. reported actual (-€246m) — a -€366m swing — was driven by items the company excludes from its own guided figure (legal/antitrust, Talabat minority dividend, related interest) [04_guidance-consensus.md §2, §6] | An operationally in-line or beat quarter can still produce a negative market reaction if the reported/unadjusted FCF headline disappoints against the >€200m FY2026 floor |

## 6. Seasonality Read

Seasonality is a modest headwind for the Aug-27 print. Q2 has been DHER's weakest revenue quarter in every one of the last three fiscal years, averaging 23.5% of annual revenue versus Q3's 26.7% — a real, repeatable ~3.2-point swing, though not extreme enough to breach the module's >30%/<20% flag threshold [01_historical-financials.md §5]. This does not by itself argue for a miss (the pattern is fully priced into a seasonally-aware consensus, and Street quarterly consensus already reflects it — Section 1), but it does mean any sequential (QoQ) revenue softness in the Aug-27 print should be read against this known seasonal pattern rather than as a fresh deceleration signal. It works modestly against a beat because Q2 is also the quarter that historically shows the smallest buffer for absorbing an unexpected cost or FX shock, given the thinner revenue base over which fixed costs are spread.

## 7. Historical Pattern

DHER has a clear, asymmetric historical pattern that should be weighted differently by metric. On EPS (Normalized), the company has missed Street's estimate in every one of the last five reported fiscal years, including FY2025 where consensus expected a near-breakeven year and the company delivered a loss instead [04_guidance-consensus.md §6] — this is a strong, five-year base rate that argues for real caution on any EPS-based beat narrative for FY2026, even though the current 90-day EPS revision picture looks quiet (Section 4/5 of `04`). On revenue, DHER has missed Street in 3 of the last 4 fiscal years (FY2022, FY2023, FY2025), with FY2024 the sole beat [04_guidance-consensus.md §6]. By contrast, on Adjusted EBITDA — the metric the company actually guides to — the company's own guidance-vs-actual record has been tracked closely for three straight years (FY2023 beat +1.4%, FY2024 in-line -0.1%, FY2025 in-line landing near the low end of range) [04_guidance-consensus.md §6], a materially better and more relevant record than the Street-consensus EPS line. FCF guidance-vs-actual is the least reliable series of all: a +4x beat in FY2024 followed by a -€366m miss against guide in FY2025, both driven by the same "extraordinary items" definitional gap [04_guidance-consensus.md §6]. The synthesizer should weight the EBITDA-guidance track record most heavily (it is the metric management actually manages to and the Street tracks most closely), the EPS miss streak as a real caution on any EPS-driven beat story, and the FCF pattern as a standing source of headline-versus-reality divergence risk independent of underlying operating performance.

## 8. Setup Verdict

**Setup is balanced.**

The single most important factor is the split between metrics: Adjusted EBITDA — the metric management guides to and the Street tracks most closely — has a three-year track record of landing in-line or better against guidance, and management raised its own confidence to the upper half of the FY2026 range only 35 days after setting it, citing early demand returns from MENA, Asia, and Quick Commerce [03_margin-drivers.md §9; 04_guidance-consensus.md §3]. Against that, revenue and EPS carry real, evidenced miss risk: EPS has missed Street five straight years, revenue has missed in 3 of the last 4 years, and — most concretely — the reported-currency growth rate management has been citing ("+18%" for Q1 2026) has not reconciled to the CIQ-computed actual (+5.8%) in either of the last two reported periods [01_historical-financials.md §3, §6; 04_guidance-consensus.md §6]. The single biggest risk that could flip this to a clean "favors miss": if the Aug-27 print resolves the revenue reconciliation gap toward the lower (CIQ-consistent) growth rate, it would confirm that the market has been under-appreciating a materially sharper revenue deceleration than management's own framing suggests.

## 9. Second-Quarter Look-Ahead

The setup for FQ3 2026 (the quarter after next, historically the strongest seasonally at 26.7% of annual revenue) looks structurally different in two specific ways: the Spain rider-employment transition should be fully annualized by then, which management explicitly expects to "translate into accelerated top-line growth in H2 2026" for the Europe segment [02_revenue-drivers.md §4, §5 (Europe)], a tailwind not yet in the Q2 print. Working against that, the Taiwan divestiture (agreed for $600m, guided to close H2 2026) is a mechanical future revenue headwind to the Asia segment once it closes, and its exact timing within H2 is not disclosed [02_revenue-drivers.md §4]. Beyond these two named items, there is no further forward visibility in this pool on FQ3 2026 specifically.

## 10. Pre-Mortem

If this setup fails, the most likely reason is that the revenue reconciliation gap (Section 3, 8) turns out to be a real, sustained reported-currency deceleration rather than an FX/LFL-framing artifact — a headline revenue miss on that basis would surprise a Street whose FQ2 2026 estimate has sat flat at €3,903m for 90 days with no analyst actively modeling the gap [04_guidance-consensus.md §4]. A secondary risk is that the live Uber acquisition process (Section 1) makes the earnings print itself a secondary market event — if deal-related news dominates trading around Aug-27, the market's reaction to the underlying beat/miss setup described here may not show up cleanly in the stock at all.

## Out-of-scope

None.



---

## earnings / 06_earnings-quality.md

_Source: `06_earnings-quality.md`_

# Earnings Quality — DHER

Reporting standard: IFRS as adopted by the EU, consolidated. Reporting currency: EUR million unless stated per-share. No audited FY2025 annual report is present in the pool — FY2025 figures below come from the verbatim FY2025 earnings-call transcript (management-stated) and the Capital IQ workbook export; FY2021–FY2024 figures are cross-checked against the audited FY2024 Annual Report where it covers the year. This is the same sourcing caveat carried from `01_historical-financials.md` and applies throughout this report.

## 1. EBITDA → CFO → FCF Bridge (5 years, FY2021–FY2025)

Currency: EUR million. "EBITDA" here is the company's own non-GAAP **Adjusted EBITDA** (the metric the company guides to and the market tracks) [FY24 Annual Report, Alternative Performance Measures footnote; FY2025 Earnings Call transcript, CFO prepared remarks]. "Working capital change" and "Other operating items" are this agent's own derivation (not a company-published bridge): Working capital change = the sum of the disclosed cash-flow-statement lines "Change in Acc. Receivable" + "Change in Inventories" + "Change in Acc. Payable" + "Change in Other Net Operating Assets" [Delivery Hero SE XTRA DHER Financials.xls, Cash Flow tab]; "Other operating items" is a balancing plug (D&A add-back already embedded in the EBITDA-to-EBIT gap, plus stock-based comp neutralization, restructuring/impairment non-cash portions, M&A gains/losses, FX, minority-interest funding items) that makes the row **reconcile exactly to reported CFO** — this plug is NOT a company-disclosed line item; the company does not publish a full Adjusted-EBITDA-to-CFO bridge.

| Item | FY2021 | FY2022 | FY2023 | FY2024 | FY2025 | Trend |
|---|---:|---:|---:|---:|---:|---|
| EBITDA (Adjusted, company-defined) | -795.6 | -467.2 | 253.6 | 692.5 | 903.0 | Improving (level), decelerating (pace) |
| Working capital change (derived, see note) | +117.0 | +183.1 | +18.1 | +630.9 | -459.9 | Deteriorating (FY2025 reversal) |
| Tax paid | -66.1 | -68.1 | -198.1 | -292.9 | -272.6 | Rising then flat |
| Interest paid | -46.7 | -92.6 | -173.4 | -254.9 | -246.5 | Rising then flat |
| Other operating items (plug, see note) | -110.0 | -244.0 | +80.3 | -137.3 | +155.6 | Volatile |
| **CFO** | -901.4 | -688.8 | -19.5 | 638.3 | 79.5 | Volatile |
| Maintenance capex | Not disclosed | Not disclosed | Not disclosed | Not disclosed | Not disclosed | — |
| Growth capex | Not disclosed | Not disclosed | Not disclosed | Not disclosed | Not disclosed | — |
| Total capex (PP&E + capitalized intangibles) | -320.9 | -251.5 | -260.0 | -279.5 | -325.8 | Rising |
| **FCF (CFO − Total Capex) — this agent's normalized operating figure** | -1,222.3 | -940.3 | -279.5 | +358.8 | **-246.3** | Volatile |
| **CFO / EBITDA (Adjusted) %** | N/M (both negative) | N/M (both negative) | -7.7% | 92.2% | **8.8%** | Deteriorating |

**Capex split not disclosed — total capex used. FCF may understate true recurring free cash flow.** No maintenance-vs-growth capex breakdown is disclosed anywhere in the pool.

**Company-defined FCF, shown alongside for reference (labeled, not headlined per CLAUDE.md §15):** FY2024 ≈ **€210–217m** (derived two ways — cross-checked: (a) €250m ÷ 1.15 from the stated "+15% year-over-year" FY2025 growth figure [FY2025 Earnings Call, CFO prepared remarks] = ~€217.4m; (b) directly computed as CFO(638.3) − Capex(279.5) − Payments of lease liabilities(148.7, FY24 Annual Report, Consolidated Statement of Cash Flows) = €210.1m — the two methods agree within ~€7m, i.e., FY2024's company FCF needed **no material extraordinary-item adjustment**, consistent with management's own statement that legal provisions were only *increased* (a non-cash accrual) in FY2024, not paid in cash [FY2025 Earnings Call, CFO prepared remarks]). FY2025 company-guided/reported FCF = **+€250m**, stated as "+15% year-over-year" [FY2025 Earnings Call, CFO prepared remarks], defined by the company as "cash flow from operating activities, less capital expenditures and payment of lease liabilities," **explicitly excluding extraordinary cash outflows related to ongoing legal disputes (e.g., EU antitrust and Glovo Spain)** and extraordinary M&A breakup-fee inflows [FY24 Annual Report, footnote 13]. **This report leads with the normalized figure (-€246.3m) per CLAUDE.md §15 — the company's own +€250m headline is not the recurring cash the operations threw off in FY2025; see Section 2 for the resolution of this gap.**

## 2. Cash Conversion Assessment

Cash conversion (CFO ÷ Adjusted EBITDA) swung from a healthy 92.2% in FY2024 to a very weak 8.8% in FY2025, even though Adjusted EBITDA itself grew 30% to €903.0m [FY2025 Earnings Call]. This is not a one-year blip against an otherwise clean history: CFO/EBITDA was also negative (-7.7%) in FY2023, meaning **2 of the last 3 fiscal years (FY2023 and FY2025) show CFO/EBITDA below 50%.** The FY2025 collapse is driven almost entirely by a single working-capital swing — "Change in Other Net Operating Assets" moved from +€489.1m (FY2024, a cash inflow) to -€173.9m (FY2025, a cash outflow), a €663.0m negative swing [Delivery Hero SE XTRA DHER Financials.xls, Cash Flow tab] — which management directly attributes to paying out and releasing the EU antitrust provision and making rider-model-transition payments in Glovo Spain that had only been *accrued* (not paid) the year before [FY2025 Earnings Call, CFO prepared remarks: "we made the payment and released the provision for the EU antitrust case," "payments related to the shift in rider model in Glovo Spain"]. On a stricter, unadjusted (GAAP) EBITDA basis the picture is somewhat better for FY2025 (CFO/GAAP-EBITDA = 79.5/304.9 = 26.1%) but still well below a healthy conversion rate, and GAAP EBITDA was itself negative or near-zero in FY2021–FY2024, making that ratio not meaningful for most of the window.

**RF-EQ-002 (cash-conversion breakdown)**

## 3. Working Capital Trends

Formulas: DSO = 365 × average Accounts Receivable ÷ Revenue; DIO = 365 × average Inventory ÷ COGS; DPO = 365 × average Accounts Payable ÷ COGS. Average balances = (opening + closing) / 2. Source: Delivery Hero SE XTRA DHER Financials.xls, Balance Sheet and Income Statement tabs.

| Metric | FY2023 | FY2024 | FY2025 | Direction | Risk |
|---|---:|---:|---:|---|---|
| Receivable days (DSO) | 20.9 | 16.9 | 12.6 | Improving (falling) | Low — no evidence of aggressive revenue recognition; collection is getting faster, not slower |
| Inventory days (DIO) | 7.5 | 6.5 | 6.3 | Improving (falling) | Low — inventory turns are stable/fast, consistent with a delivery/quick-commerce business, not a goods inventory build |
| Payable days (DPO) | 16.1 | 15.1 | 15.9 | Stable | Low — no material supplier-stretching pattern |
| Cash conversion cycle (DSO + DIO − DPO) | 12.3 | 8.3 | 2.9 | Improving (shrinking) | Low — the underlying operating cash cycle is genuinely getting more efficient |

None of the three flag thresholds (DSO +10% YoY, DIO +15% YoY, sharply rising DPO) are triggered — all three metrics moved favorably every year in this window. This is a **genuine positive quality signal**, distinct from and partly offsetting the legal/regulatory cash-outflow story above: the *operating* working-capital engine (collections, inventory turns, supplier terms) is healthy and improving; the FY2025 cash-conversion breakdown in Section 2 is a one-off-payment story, not a deteriorating operating cash cycle.

**Data-quality flag (not one of the three formal triggers above, but material):** the Capital IQ cash-flow-statement line "Change in Inventories" shows -€547.7m in FY2025 (and -€193.0m in FY2024) — far larger in magnitude than the actual balance-sheet inventory movement over the same periods (+€16.0m FY2025: €174.6m → €190.6m; +€31.1m FY2024: €143.5m → €174.6m) [Delivery Hero SE XTRA DHER Financials.xls, Balance Sheet and Cash Flow tabs]. This gap is present in both years reviewed, suggesting the vendor's "Change in Inventories" cash-flow line is not a pure inventory-account movement (it may bundle Dmarts merchandise/vendor-prepayment items differently from the balance-sheet "Inventory" line). This is flagged as an unresolved vendor-mapping inconsistency, not evidence of manipulation — but it means the DSO/DIO/DPO reads above (based on the cleaner balance-sheet figures) should be trusted over any working-capital reading built from the CIQ cash-flow "Change in Inventories" line.

## 4. Non-GAAP Adjustments

| Adjustment | Amount (FY2025) | Recurring? (Y/N) | Concern Level (Low / Mid / High) | Evidence |
|---|---:|---|---|---|
| Stock-based compensation excluded from Adjusted EBITDA | €224.1m (24.8% of Adj. EBITDA; up from €171.1m FY2024, +31% YoY) | Y — recurring every year, 5 of 5 years (2021–2025: 303.1, 325.9, 247.4, 171.1, 224.1) | High | FY2025 Earnings Call, CFO prepared remarks; CIQ Income Statement tab, "Stock-Based Comp., Total" |
| "Management adjustments" (mainly reorganization/legal-risk provisions, incl. Glovo Spain rider-model transition) | €147m (down from a higher prior-year level; company states this is "less than 0.3% of GMV") | Y — this bucket recurs every year under different labels (restructuring, legal provisions); the underlying driver (rider-classification legal risk) is multi-jurisdictional and unresolved | High | FY2025 Earnings Call, CFO prepared remarks |
| "Other reconciliation items" (Uber breakup-fee gain reversal / goodwill impairment) | swung from +€158m (FY2024) to -€260m (FY2025) | N (the specific items — Uber Taiwan breakup fee, FY2025 goodwill impairment — are each individually non-recurring) but the SIZE of this swing bucket recurs, just with different contents each year | Mid | FY2025 Earnings Call, CFO prepared remarks: "traced back to the Uber breakup fee we recognized in 2024 as well as goodwill impairment in 2025" |
| Right-of-use asset depreciation excluded from Adjusted EBITDA | Not separately quantified in this pool | Y (structural, applies every year) | Low-Mid — a defensible IFRS 16 add-back but still moves reported vs. adjusted profitability | FY24 Annual Report, Alternative Performance Measures footnote |

Total adjustment from reported (GAAP) EBITDA to Adjusted EBITDA in FY2025 = €598.1m (€304.9m → €903.0m) — this is **66% of the entire Adjusted EBITDA figure itself**, and in FY2024 the adjustment (€716.8m, from -€24.3m to €692.5m) was **larger than the whole Adjusted EBITDA total.** These adjustments recur every period (they are not "one-off" by the report template's own test) and materially exceed the 15%-of-GAAP-earnings threshold that should trigger scrutiny.

## 5. One-Off Items (last 3 years, FY2023–FY2025)

| Item | Period | Amount | Classification (Genuine / Suspicious / Recurring "one-off") | Evidence |
|---|---|---:|---|---|
| Uber Taiwan-deal breakup fee (gain) | FY2024 | +€220.9m | Genuine (non-recurring M&A break-fee gain) — but it flatters reported FY2024 EBITDA/EBIT even after Adjusted-EBITDA stripping, and is the main driver of the "other reconciliation items" swing described above | FY24 Annual Report, Note 6 "Other Operating Income" |
| Goodwill impairment | FY2021–FY2025, every year | -85.9 / -760.9 / -857.8 / -89.7 / -259.7 | **Recurring "one-off"** — a goodwill impairment has occurred every single year in the 5-year window, never zero | CIQ Income Statement tab, "Impairment of Goodwill" |
| Asset writedown & restructuring costs (cash-flow addback) | FY2020–FY2025, every year | 1.2 / 85.9 / 748.4 / 1,004.7 / 133.2 / 248.3 | **Recurring "one-off"** — present in every one of the 6 years shown, and material (>€700m in 2 of those years) | CIQ Cash Flow tab, "Asset Writedown & Restructuring Costs" |
| EU antitrust provision payment + release | FY2025 | Payment made and provision released; FY2024 P&L allocation to the provision was €225.5m | Suspicious as an "extraordinary" label — the underlying antitrust investigation and the associated cash cost is a multi-year item (provisioned/increased in 2023–2024, paid in 2025) that the company nonetheless excludes from its guided FCF, including for FY2026 | FY2025 Earnings Call, CFO prepared remarks; FY24 Annual Report, Note 5 "General Administrative Expenses" ("Allocation to antitrust provisions" €225.5m FY2024) |
| Glovo Spain rider-model-transition payments | FY2025 (ongoing) | Not separately quantified in this pool | **Recurring "one-off"** — rider-classification legal risk is explicitly flagged by the company as ongoing and unresolved in Spain, Italy, and Argentina [FY24 Annual Report, risk section], so cash costs tied to this issue are likely to recur, not to be a single clean exclusion | FY2025 Earnings Call, CFO prepared remarks; FY24 Annual Report, litigation/risk disclosures |

**Resolving the ~€496m FY2025 FCF gap flagged by `01_historical-financials.md`:** this agent's normalized FY2025 FCF (CFO − total capex) = -€246.3m; the company's own guided/reported FY2025 FCF = +€250m; the gap = €496.3m. The company's FCF definition (footnote 13) is CFO − capex − lease payments, EXCLUDING extraordinary legal cash outflows and extraordinary M&A inflows. Algebraically: (Extraordinary outflow addback) − (Lease payments) = €496.3m. Using FY2024's directly disclosed lease-payment figure (€148.7m, FY24 Annual Report, Consolidated Statement of Cash Flows) as the best available proxy for FY2025 (not separately disclosed for FY2025 in this pool — **inference, not from filings**), the **implied FY2025 extraordinary legal/regulatory cash outflow is approximately €645m** — roughly 4.6% of FY2025 revenue and nearly 3x the entire FY2024 antitrust provision allocation (€225.5m) taken alone. This scale strongly suggests the excluded bucket covers both the EU antitrust settlement AND material Glovo Spain rider-reclassification cash costs (severance, back-pay, social-security reclassification costs typically run large across multiple markets), consistent with the CFO naming both items as distinct drivers on the call. **This is not a rounding artifact — it is the single largest earnings-quality finding in this report:** DHER's "second consecutive year of positive free cash flow" narrative is built on excluding a legal/regulatory cash cost on the order of €600–650m in FY2025 alone, and the same exclusion methodology is explicitly carried into FY2026 guidance (">€200m, excluding extraordinary outflows") for a company that discloses unresolved rider-classification litigation risk in at least three jurisdictions. The precise euro split between the lease-payment subtraction and the extraordinary-item addback is **not disclosed in this pool** and is flagged as an open item for a future audited FY2025 filing to close.

## 6. Accrual Quality Flags

| Flag | Triggered (Y/N) | Evidence |
|---|---|---|
| Revenue growing faster than CFO for 2+ years | **Y** | FY2021–FY2023: revenue grew +136.9%/+46.5%/+15.9% while CFO stayed negative all three years (-901.4/-688.8/-19.5) [CIQ Income Statement, Cash Flow tabs]; again in FY2025: revenue +14.4% while CFO fell -87.5% (638.3 → 79.5) despite Adjusted EBITDA growing +30% |
| Receivables growing faster than revenue | N | AR grew faster than revenue in FY2023 only (+18.4% vs. +15.9%); the trend has since reversed — AR fell -15.7% (FY2024) and -13.5% (FY2025) while revenue kept growing, the opposite of a quality concern (Section 3) |
| Inventory growing faster than COGS | N | Inventory grew slower than COGS in all three years reviewed (FY2023: +1.6% vs. +9.8%; FY2024: +21.7% vs. +28.7%; FY2025: +9.2% vs. +18.5%) — balance-sheet basis, per the data-quality flag in Section 3 |
| Deferred revenue declining (if subscription/contract business) | N | Unearned Revenue, Current: €77.2m (FY2023) → €68.9m (FY2024) → €81.9m (FY2025) — one down year followed by recovery, not a sustained decline |
| Capitalized costs growing as % of revenue | N | Capitalized intangible investment stable at ~1.1% of revenue across FY2023–FY2025 (1.13% / 1.14% / 1.10%) |
| Frequent accounting policy changes | N | No specific company-disclosed policy changes found beyond the CIQ vendor's own restatement/reclassification labels (Restated/Reclassified/Other across years), which reflect the data vendor's own presentation, not confirmed company policy changes — insufficient evidence to trigger this flag |

Only 1 of 6 flags is triggered — below the 2-flag threshold for RF-EQ-001, so that tag is **not** emitted here. (The single triggered flag — revenue outpacing CFO — is itself material and is captured through RF-EQ-002 above and the FCF-gap finding in Section 5.)

## 7. Reported vs Adjusted Reconciliation

| Metric | Reported (FY2025) | Adjusted (FY2025) | Difference | % of Reported | Recurring? | Evidence |
|---|---:|---:|---:|---:|---|---|
| EBITDA | €304.9m | €903.0m | +€598.1m | 196% (of reported) / 66% (of adjusted) | Y — every year, always material | CIQ Income Statement tab; FY2025 Earnings Call |
| EBIT | €93.7m | Not disclosed — company does not publish an "Adjusted EBIT" line | N/A | N/A | — | FY24 Annual Report, FY2025 Earnings Call — Adjusted EBITDA is the sole headline non-GAAP profitability metric |
| Net income | -€782.9m | -€257.7m (CIQ "Normalized Net Income" — a data-vendor normalization, not a company-published figure) | +€525.2m | 67.1% | Y | CIQ Income Statement tab, "Normalized Net Income" |
| EPS (diluted) | -€2.62 | -€0.86 (CIQ "Normalized Diluted EPS") | +€1.76 | 67.2% | Y | CIQ Income Statement tab |

FY2024 for context: reported EBITDA -€24.3m vs. Adjusted €692.5m (+€716.8m, adjustment exceeds the entire adjusted figure); reported net income -€882.4m vs. CIQ-normalized -€251.9m (+€630.5m, 71.4% of reported).

## 8. Accounting Trap Checklist

Severity column is inverted — higher = WORSE.

| Trap | Triggered? (Y/N) | Evidence | Severity /100 |
|---|---|---|---:|
| Stock-based compensation excluded from adjusted earnings | Y | FY2025 SBC €224.1m = 24.8% of Adjusted EBITDA, up 31% YoY; excluded from Adjusted EBITDA by definition [FY24 Annual Report APM footnote; CIQ Income Statement] | 55 |
| Restructuring costs recur every year | Y | Asset Writedown & Restructuring Costs present in all 6 years reviewed (2020–2025), never zero, exceeding €700m in FY2022 and FY2023 | 60 |
| Capitalized costs rising faster than revenue | N | Stable ~1.1% of revenue FY2023–FY2025 | 10 |
| Receivable factoring / supplier finance disclosed | N (not quantified) | FY24 Annual Report confirms adoption of the IAS 7/IFRS 7 supplier-finance disclosure amendment, but no quantified outstanding supplier-finance or receivables-factoring balance was found in the reviewed sections — Not proven from available data | 15 |
| Inventory write-downs or reserve releases | Y (unclear magnitude) | FY24 Annual Report bundles "inventory write-downs" inside a €1,883.3m Dmarts merchandise-cost line with no separate quantification; separately, the CIQ cash-flow "Change in Inventories" line diverges sharply from the balance-sheet inventory movement (Section 3) — flagged as unresolved, not confirmed manipulation | 40 |
| Revenue recognized before cash collection risk is clear | N | DSO improved every year (20.9 → 16.9 → 12.6 days, FY2023–FY2025) | 10 |
| Change in useful life / depreciation assumptions | N | Not proven from available data — no disclosure found in reviewed sections | 0 |
| Tax rate unusually low or boosted by one-off | Y | Effective tax rate "NM" every year (positive tax expense despite pre-tax losses); management directly stated FY2024 tax was elevated by a one-off, with FY2025 "a better reflection of ongoing tax levels" [FY2025 Earnings Call, CFO prepared remarks] — explained and disclosed, but still a real driver of the FY2025 net-income improvement | 35 |
| Large fair-value / mark-to-market gains | Y (modest) | "Other Non-Operating Inc. (Exp.)" swung from +€64.0m (FY2024) to -€53.0m (FY2025), attributed to fair-value adjustments of minority investments [FY2025 Earnings Call, CFO prepared remarks; CIQ Income Statement] | 20 |

## 9. Earnings Quality Score

**Score: 36/100** — Band: 21–40, "Poor quality — significant gap between reported earnings and cash."

The single most important reason: FY2025's headline "second consecutive year of positive free cash flow" (+€250m, +15% YoY) is built on excluding an implied ~€600–650m legal/regulatory cash outflow (Section 5) tied to unresolved, multi-jurisdiction rider-classification litigation and an EU antitrust settlement — and cash conversion (CFO/Adjusted EBITDA) collapsed to 8.8% in FY2025, the second of the last three years below the 50% cash-conversion threshold (RF-EQ-002). This sits alongside Adjusted EBITDA adjustments (€598.1m FY2025) that are 66% the size of the adjusted metric itself, and restructuring/impairment charges that have recurred in every one of the last five years. These are offset only partially by genuinely improving operating working-capital metrics (DSO, DIO, cash conversion cycle all improved every year, Section 3) and by the company's own transparent, well-labeled disclosure of every adjustment discussed here — nothing in this report rests on undisclosed information, but the scale of the gap between statutory and adjusted/guided figures is too large for a higher score.

## 10. The Single Biggest Quality Concern

The single biggest risk that DHER's reported earnings overstate economic reality is the FCF exclusion methodology itself. Delivery Hero now guides free cash flow "excluding extraordinary outflows" as a standing policy (adopted from January 1, 2025 onward, per FY24 Annual Report footnote 13) in a business that discloses ongoing, unresolved legal and regulatory risk across at least three jurisdictions (EU antitrust; rider employment-classification disputes in Spain, Italy, and Argentina). In FY2024, when those risks were only being provisioned (a non-cash accrual), the company's guided FCF and this agent's simple CFO-minus-capex-minus-lease calculation agreed closely (~€210–217m both ways) — the exclusion did essentially no work. In FY2025, when the antitrust case was actually settled in cash and Glovo Spain rider-transition payments were made, the exclusion did an implied ~€600–650m of work, turning a genuinely negative operating free cash flow year (-€246.3m, CFO minus total capex) into a headline "+€250m, up 15%." Because the underlying legal risks that generate these "extraordinary" outflows are not resolved — the company itself still flags them as live risks — there is a real possibility this pattern repeats: provisions get booked in one year (flattering that year's guided FCF), and the cash leaves in a later year (excluded from that year's guided FCF too, because it is again labeled "extraordinary"). That is a structural, repeatable gap between the cash DHER's core delivery/marketplace operations generate and the cash figure management presents to the market, not a one-time reporting quirk.



---

## earnings / 07_earnings-sensitivity.md

_Source: `07_earnings-sensitivity.md`_

# Earnings Sensitivity — DHER

Reporting standard: IFRS as adopted by the EU. Reporting currency: EUR. Fiscal year end 31 December [01_historical-financials.md]. All EBITDA figures below are **Adjusted EBITDA** — the company's own non-GAAP, company-defined metric (earnings before tax, financial result and D&A, further adjusted for stock-based comp, restructuring/M&A costs, and goodwill impairments) — never reported/GAAP EBITDA, unless a row explicitly says otherwise [01_historical-financials.md §1, footnote 1]. This is the metric management guides to and the Street tracks [04_guidance-consensus.md §2]. EPS impact is **not separately quantified** in this report: DHER does not disclose a clean Adjusted-EBITDA-to-EPS bridge (tax rate, minority-interest treatment, and one-off items below the operating line move independently of Adjusted EBITDA — see the reported-vs-adjusted EPS gap in `01_historical-financials.md` §4), so translating an EBITDA sensitivity into an EPS number would be false precision. All EBITDA impacts below are stated against the FY2025 Adjusted EBITDA base of €903.0m [01_historical-financials.md §1].

## 1. Variable Selection

Six variables were selected from the revenue and margin driver tables in `02_revenue-drivers.md` and `03_margin-drivers.md`, chosen for the highest magnitude ratings in those tables: **GMV/order growth** (rated High magnitude, §4 of `02`), **own-delivery mix/take-rate shift** (rated High magnitude, historically 61% of FY2024 revenue growth, §7 of `02`), **rider-cost inflation / employment-classification regulation** (named "the single biggest margin driver," §8 of `03`), **FX (USD/EUR and KRW/EUR)** (rated High dependency in the cross-module `business-model/10_external-dependency.md` §1, and the only two currencies with a company-disclosed P&L sensitivity large enough to matter, §2), **Asia segment margin** (the only segment with an outright FY2025 margin decline, §6 of `03`), and **Integrated Verticals (Dmarts) segment margin** (the single largest positive margin-rate contributor to the FY2025 Adjusted EBITDA bridge, accounting for 57% of the €210.2m group increase, §7a-ii of `03`). Interest-rate exposure (100bp move = €18.3m P&L effect) and the broader consumer-cycle/oil-linked GCC macro exposure were considered but excluded — both are smaller in disclosed magnitude than the six selected variables and are noted qualitatively in Section 5/6 instead. The pending Uber acquisition and its regulatory-approval risk are excluded entirely — per `business-model/10_external-dependency.md` §5 that is the single largest external variable right now, but it is a deal-completion risk, not an earnings-sensitivity variable, and is out of this module's scope.

## 2. Sensitivity Table

*Confidence: High = company-disclosed sensitivity. Medium = historical observed range or an inferred but mechanically-grounded pairing of disclosed figures. Low = inference from the driver table with no direct disclosed elasticity.*

| Variable | Base Case | Move Basis | Bull Case | EBITDA Impact (bull) | Bear Case | EBITDA Impact (bear) | Confidence | Evidence |
|---|---|---|---|---:|---|---:|---|---|
| GMV / order growth (demand) | FY2026 GMV LFL guidance midpoint 9% (guided range 8%–10%); Adjusted EBITDA guidance midpoint €935m | Company-disclosed guidance ranges, paired (the two ranges are disclosed together but management does not state a formal 1:1 linkage between them — pairing them is this agent's inference) | GMV LFL growth at the top of the guided range (10%), consistent with Q1 2026's 8.8% trajectory and management's "upper half" confidence signal | **+€25m** (Adjusted EBITDA €960m, top of guided range) | GMV LFL growth at the bottom of the guided range (8%) | **-€25m** (Adjusted EBITDA €910m, bottom of guided range) | Medium | FY2025 Earnings Call, prepared remarks, Mar 26 2026 (guidance section); Q1 2026 Trading Statement Call, prepared remarks [04_guidance-consensus.md §2] |
| Rider cost inflation / employment-classification regulation (no pass-through) | Delivery-expense cost-of-sales ratio 49.0% of revenue (FY2024, audited — the latest disclosed cost-of-sales breakdown; no FY2025 line-item breakdown exists in this pool) | Inference — mechanical translation of the disclosed FY2024 cost ratio and the company's own §8 stress-test methodology, applied to the FY2025 revenue base | Ratio improves -100bps (48.0% of revenue) — payment/hosting/other-cost tailwinds continue, no reclassification shock materializes | **+€140.6m** (100bps × €14,059.6m FY2025 revenue) | The company's own stress test: a 5% rider-cost/wage increase with no offsetting price action ≈ +245bps of the ratio, driven by a reclassification outcome (e.g. Italy following Spain's July 2025 employment-model shift) | **-€344.5m** (245bps × €14,059.6m FY2025 revenue) — see Section 6, this is asymmetric and severe (~38% of FY2025 Adjusted EBITDA) | Low | 03_margin-drivers.md §2, §8; FY24 Annual Report, Note 15/2 "Cost of Sales," p.109; Note H.5 "Contingencies — Rider Status," p.203–204 (Spain contingent liability €440m–€770m) |
| FX — USD/EUR and KRW/EUR (monetary/transaction exposure) | 10% USD/EUR move = ±€26.8m P&L effect; 10% KRW/EUR move = ±€72.0m P&L effect (both Dec-31-2024) — figures are on **profit or loss / financial result**, a different metric from Adjusted EBITDA (see sidecar `impact_metric`), not folded into the Adjusted EBITDA base | Company-disclosed sensitivity | USD and KRW each appreciate 10% vs EUR (favorable) | **+€26.8m** (USD) / **+€72.0m** (KRW) on profit or loss, not Adjusted EBITDA | USD and KRW each depreciate 10% vs EUR (adverse) — consistent with management's stated FY2025/26 headwind from "last year's USD and Korean won devaluation" | **-€26.8m** (USD) / **-€72.0m** (KRW) on profit or loss | High | FY24 Annual Report, Note H.3.b "Sensitivity Analysis of Foreign Exchange Rate Changes," p.201; FY2025 Earnings Call, prepared remarks (headwind commentary) [business-model/10_external-dependency.md §2] |
| Own-delivery mix / take-rate shift | Group own-delivery share 78% (FY2025), up from 67% (FY2024, +11pp); FY2026 guided to a slower pace ("slowdown in the transition to own delivery") | Historical observed range (FY2024 own-delivery share move), extrapolated — Inference, not from filings, for the FY2026 forward read | Mix shift continues at a pace closer to FY2024/FY2025 (own-delivery share in Asia/MENA continues catching up toward Europe's already-95% saturation level) | Not quantifiable in clean EBITDA € terms — net effect on Adjusted EBITDA margin is explicitly ambiguous per `03_margin-drivers.md` §5 ("historically net positive but decelerating"); directionally this was 61% of FY2024's total revenue growth (+13.6pp of +22.3pp, `02_revenue-drivers.md` §7) | Mix shift stalls entirely (own-delivery share flat at 78%), removing this historically-largest revenue-growth lever | Not quantifiable in clean EBITDA € terms — a full stall would mechanically slow Group revenue growth toward the underlying GMV growth rate alone, absent an offsetting acceleration elsewhere | Low | 02_revenue-drivers.md §4, §7; 03_margin-drivers.md §5; FY2025 Earnings Call, prepared remarks |
| Asia segment Adjusted EBITDA margin (competitive intensity — Korea, Saudi entrant spillover) | 7.5% FY2025, down -192bps from 9.5% FY2024 — the only segment with an outright margin decline in the latest period | Historical observed range (the segment's own realized FY2025 swing) | Margin recovers +192bps toward the FY2024 level (7.5%→9.5%), consistent with Korea's Q1 2026 return to positive order/GMV growth after a 2-year platform rebuild | **+€84.8m** (192bps × €4,418.6m FY2025 Asia segment revenue) | Margin declines a further -192bps (continued or renewed competitive intensity, e.g. from the Saudi entrant's spillover into Asia-adjacent markets or a stalled Korea recovery) | **-€84.8m** | Medium | 03_margin-drivers.md §6, §7a-ii; FY24 Annual Report p.4, p.105–106; CIQ Segments tab |
| Integrated Verticals (Dmarts) Adjusted EBITDA margin | +0.09% FY2025, up +373bps from -3.64% FY2024 — the single largest positive margin-rate contributor to the FY2025 group bridge (57% of the total €210.2m increase) | Historical observed range, deliberately narrower than the full realized 373bps swing (see Confidence note) | Margin improves a further +200bps toward sustained profitability, continuing the order-per-store utilization gains management cites | **+€63.8m** (200bps × €3,189.0m FY2025 IV segment revenue) | Margin reverts -200bps toward breakeven-to-negative (reinvestment ramps, or Dmart unit economics disappoint) | **-€63.8m** | Low | 03_margin-drivers.md §6, §7a-ii; Q1 2026 Trading Statement Call ("we will remain on slight positive EBITDA, while still reinvesting") |

## 3. Sensitivity Ranking

*Ranked by the average of the absolute bull and bear € impact. The two FX rows are on a different metric (profit or loss / financial result, not Adjusted EBITDA — see Section 2) and are ranked here for scale comparison only, flagged as such.*

| Rank | Variable | Absolute Impact (avg of bull + bear) | Direction of Current Trend |
|---:|---|---:|---|
| 1 | Rider cost inflation / employment-classification regulation | €242.6m (avg of +€140.6m / -€344.5m — note the asymmetry, Section 6) | Contained but not resolved — Italy reclassification risk unresolved |
| 2 | Asia segment Adjusted EBITDA margin | €84.8m | Improving (Korea inflecting) but only one quarter of evidence after a 2-year decline |
| 3 | KRW/EUR FX* | €72.0m (*different metric — profit or loss, not Adjusted EBITDA) | Deteriorating (headwind, per management commentary) |
| 4 | Integrated Verticals (Dmarts) segment margin | €63.8m | Improving — turnaround underway, one year of evidence |
| 5 | USD/EUR FX* | €26.8m (*different metric — profit or loss, not Adjusted EBITDA) | Deteriorating (headwind, per management commentary) |
| 6 | GMV / order growth (demand) | €25.0m | Improving — accelerated from 7.9% (Q4'25) to 8.8% (Q1'26) |
| — | Own-delivery mix / take-rate shift | Not quantifiable in clean EBITDA € terms (see Section 2) — directionally the largest historical revenue driver | Improving, but explicitly decelerating per management guidance |

## 4. The Single Highest-Sensitivity Variable

**Rider-cost inflation, transmitted through the absence of any disclosed pass-through mechanism, is the single variable most capable of moving DHER's earnings.** The bear-case impact alone (-€344.5m, using the company's own §8 stress-test methodology applied to the FY2025 revenue base) is roughly 38% of FY2025 Adjusted EBITDA (€903.0m) — larger than any other variable in this table, and larger than the FY2026 guided range itself (€910m–€960m, a €50m span). It is currently **largely externally driven**: delivery expenses are 93.7% freelance/third-party riders, not DHER's own employed fleet [`03_margin-drivers.md` §8, citing `business-model/06_value-chain.md` §2], and the direction is set by courts and legislators (Spain's employment-model shift completed July 2025; Italy's reclassification confirmed in courts April 2025 but no employment-model change yet expected per management; the EU Platform Work Directive gives member states 24 months to transpose). The company has demonstrated it currently **absorbs** this cost rather than pricing around it — the FY2024 Europe-segment Adjusted EBITDA miss versus guidance was directly attributed to "additional expenses recognized for rider-related reclassification risks in Italy" [FY24 AR, p.4, p.106]. For this variable to swing to the full adverse case, Italy (or another jurisdiction) would need to follow Spain's precedent and DHER would need to continue absorbing the resulting cost step-up without a corresponding price or mix offset — precisely the pattern already observed once, in Europe, in FY2024.

## 5. Interaction Effects

Three of the six selected variables are not independent draws. First, **KRW/EUR FX and the Asia segment margin are mechanically linked through the same underlying event**: Korea's Q1 2026 recovery (the main driver of the Asia-margin bull case) is reported in euros, so a simultaneous KRW depreciation (the FX bear case) would offset some of that operational improvement once translated — a genuine Asia-margin gain could show up smaller, or not at all, in Group euro-reported Adjusted EBITDA. Second, **GMV/order growth and the own-delivery mix/take-rate shift move together by construction**: the FY2024 revenue decomposition in `02_revenue-drivers.md` §6a found a +1.0pp positive interaction term because GMV and take-rate both moved in the same direction that year — a demand acceleration and a mix-shift acceleration are not independent scenarios, they tend to co-occur. Third, **FX and rider-cost inflation can compound in hyperinflationary markets** (Argentina, Türkiye, Laos under IAS 29): a currency devaluation in those markets is often accompanied by local wage inflation, meaning the FX and rider-cost rows are not fully independent risks even though this report treats them as separate line items — this is qualitative, not quantified, since no disclosed source links the two directly for DHER.

## 6. Non-Linear Or Asymmetric Risks

**Rider-cost inflation is genuinely asymmetric, not merely large.** The bull case (a 100bp improvement in the delivery-expense ratio) is worth +€140.6m; the bear case (the company's own 5%-rider-cost-increase stress, +245bps) is worth -€344.5m — a downside more than double the equivalent-scale upside, because there is no disclosed pass-through mechanism to cap the downside the way normal commercial pricing would (`03_margin-drivers.md` §3: "no disclosed contractual mechanism tying commission or delivery-fee rates to rider cost inflation"). On top of the continuous-ratio scenario, a discrete reclassification event carries its own separate, larger, one-off tail: the disclosed contingent liability for the Spain courier-fleet reclassification alone is €440.0m–€770.0m [FY24 AR, Note H.5, p.203–204] — a sum that, if it crystallized, would by itself exceed the FY2025 Adjusted EBITDA base.

**The Integrated Verticals margin recovery is capped on the upside by management's own stated intent but not on the downside.** Management guides only to "slight positive EBITDA, while still reinvesting" [Q1 2026 Trading Statement Call] — meaning further large positive margin swings are unlikely to be allowed to flow straight to Adjusted EBITDA near-term (the company will reinvest gains instead), while a reversal toward negative margin (weaker Dmart unit economics, a return to net new store openings) is not similarly bounded.

**The disclosed FX sensitivity understates the real exposure.** The €26.8m (USD) and €72.0m (KRW) figures cover only monetary/transaction exposure, not full income-statement translation of the ~85% of Group revenue earned outside the eurozone (inference on the translation scale, not from filings) [`business-model/10_external-dependency.md` §2]. A large, sustained move in a major operating currency could therefore have a materially larger earnings effect than the linear scale in Section 2's JSON sidecar implies — this is exactly the kind of move the sidecar's `valid_range` and `non_linearity` fields are designed to flag, not silently extrapolate past.

**A covenant threshold sits below the continuous variables tested here.** The RCF/term-loan facilities carry a financial covenant requiring minimum Group liquidity; a breach could trigger termination [`business-model/10_external-dependency.md` §1, citing FY24 AR Note H.3/H.4]. None of the six variables in this table are sized to breach that covenant on their own in the bear case shown, but a simultaneous adverse move across several of them (see Section 5's interaction effects) would move the balance sheet closer to that threshold — a discrete, non-linear risk this continuous sensitivity table does not itself model.

## 7. Earnings Volatility Score

**66/100 — higher = WORSE (inverted). Band: High volatility.**

Reason: multiple variables in this table are each capable of moving Adjusted EBITDA by a double-digit percentage of the FY2025 base on their own — most severely, rider-cost inflation with no disclosed pass-through mechanism (bear case ~38% of FY2025 Adjusted EBITDA) — and several are largely externally driven (FX, regulatory/labor-court outcomes, a competitor's pricing strategy in Asia) rather than management-controlled. This sits on top of a demonstrated five-year history of real earnings volatility already documented upstream: diluted GAAP EPS swung from -€4.57 to -€11.28 to -€8.57 to -€3.10 to -€2.62 (FY2021–FY2025), CFO swung from -€901.4m to +€638.3m to +€79.5m in the last three years, and DHER has missed Street's EPS Normalized estimate in every one of the last five reported fiscal years [`01_historical-financials.md` §1; `04_guidance-consensus.md` §6]. The score is held below the 81–100 "extremely volatile" band because Adjusted EBITDA guidance itself has been tracked closely for three straight years (FY2023–FY2025 all landed in-line or better against the guided range, `04_guidance-consensus.md` §6) and management retains real, demonstrated levers (voucher discipline, subscription mix, own-delivery rollout) that have kept the headline Adjusted EBITDA metric more stable than the GAAP figures beneath it.



---

## earnings / 08_earnings-red-flags.md

_Source: `08_earnings-red-flags.md`_

# Earnings Red Flags — DHER

Upstream status: all eight required earnings-module outputs (00–07) are present and were read in full. Business-model cross-module outputs are available at `analyses/DHER_2026-08-12/business-model/` and were read (03_segment-map, 06_value-chain, 10_external-dependency, 12_red-flags-sweep, 99_business-model-synthesis, plus 01_disqualifier-scan for the going-concern trigger it carries). No upstream output is missing, so this scan proceeds at full confidence on data completeness grounds.

DHER is currently the subject of a live, announced Uber acquisition offer (M&A call, Jul 16, 2026), and no audited FY2025 annual report exists in the pool — both facts are carried from `00_earnings-data-triage.md` and shape several flags below rather than being repeated as standalone findings each time.

## 1. Upstream Evidence Map

### Bullish Evidence

| Source Agent | Claim | Evidence | Confidence |
|---|---|---|---|
| 01_historical-financials | Adjusted EBITDA margin expanded every year for 5 straight years (-13.6% → 6.4%, FY2021–FY2025) | [01_historical-financials output, Section 6] | High |
| 01_historical-financials | FY2025 statutory Operating Income turned positive (€93.7m) — first time in 5 years | [01_historical-financials output, Section 1, Section 6] | High |
| 02_revenue-drivers | GMV like-for-like growth and order growth both accelerated Q4'25 → Q1'26 (7.9%→8.8% GMV; 9%→10% orders) | [02_revenue-drivers output, Section 3] | Medium — company-stated LFL series, not independently reconciled to reported-currency revenue (see Bearish/Contradictions below) |
| 03_margin-drivers | MENA segment margin held flat (13.5% vs 13.4%) through a discount-heavy Saudi competitor entry, via subscription/vendor-funded deals rather than price war | [03_margin-drivers output, Section 6 (MENA)] | High |
| 03_margin-drivers | Management raised its own confidence to the upper half of FY2026 EBITDA guidance only 35 days after setting it, citing early returns from MENA/Asia/Quick Commerce investment | [03_margin-drivers output, Section 9] | High |
| 04_guidance-consensus | Consensus Adjusted EBITDA (€951.85m) sits inside the guided range's upper half, matching management's own steer — bar assessed as "fair" | [04_guidance-consensus output, Section 7] | High |
| 04_guidance-consensus | Adjusted-EBITDA guidance-vs-actual has landed in-line or better for 3 straight fiscal years (FY2023–FY2025) | [04_guidance-consensus output, Section 6] | High |
| 05_beat-miss-setup | Overall beat/miss setup is "balanced," with the metric management actually guides to (Adjusted EBITDA) carrying the strongest track record | [05_beat-miss-setup output, Section 8] | Medium |
| 06_earnings-quality | Working-capital metrics (DSO, DIO, cash-conversion cycle) improved every year FY2023–FY2025 — a genuine, distinct positive quality signal | [06_earnings-quality output, Section 3] | High |

### Bearish Evidence

| Source Agent | Claim | Evidence | Confidence |
|---|---|---|---|
| 01_historical-financials | Gross margin compressed for 2 consecutive years (29.9% FY2023 → 27.1% FY2024 → 24.4% FY2025) — a genuine reversal | [01_historical-financials output, Section 1, Section 6] | High |
| 01_historical-financials | Revenue growth decelerated on an annual basis every year since FY2022 (+46.5% → +15.9% → +23.7% → +14.4%) | [01_historical-financials output, Section 1, Section 6] | High |
| 01_historical-financials | Management's stated Q1 2026 revenue growth ("+18%") does not reconcile to the CIQ-computed reported-currency growth (+5.8%) — a 12+ point unresolved gap | [01_historical-financials output, Section 3] | High (gap is real and evidenced; the explanation for it is not) |
| 02_revenue-drivers | The single biggest historical revenue driver (own-delivery take-rate/mix shift, 61% of FY2024 growth) is explicitly guided to decelerate in FY2026 | [02_revenue-drivers output, Section 7] | High |
| 03_margin-drivers | Rider-cost inflation/employment-reclassification is "the single biggest margin driver," with no disclosed pass-through mechanism and a demonstrated FY2024 miss already realized in Europe | [03_margin-drivers output, Section 8] | High |
| 04_guidance-consensus | FY2026 EPS Normalized consensus has been cut ~€1.78 over the trailing 12 months (from €1.71 to -€0.07), almost all before the last quarter | [04_guidance-consensus output, Section 4] | High |
| 05_beat-miss-setup | EPS (Normalized) has missed Street's estimate in every one of the last 5 fiscal years; revenue missed in 3 of the last 4 | [05_beat-miss-setup output, Section 7; 04_guidance-consensus output, Section 6] | High |
| 06_earnings-quality | Cash conversion (CFO/Adjusted EBITDA) collapsed to 8.8% in FY2025, the second of the last 3 fiscal years below 50% | [06_earnings-quality output, Section 2] | High |
| 06_earnings-quality | FY2025's "+€250m, +15% YoY" FCF headline is built on excluding an implied ~€600–650m legal/regulatory cash outflow, and the same exclusion methodology is carried into FY2026 guidance | [06_earnings-quality output, Section 5, Section 10] | High |
| 06_earnings-quality | Adjusted EBITDA adjustments are 66% of the FY2025 metric itself and exceeded 100% of the FY2024 metric | [06_earnings-quality output, Section 4] | High |
| 06_earnings-quality | Earnings quality score: 36/100 — "Poor quality — significant gap between reported earnings and cash" | [06_earnings-quality output, Section 9] | High |
| 07_earnings-sensitivity | Rider-cost bear case (-€344.5m) is ~38% of FY2025 Adjusted EBITDA — the single highest-magnitude, most asymmetric variable in the sensitivity table | [07_earnings-sensitivity output, Section 4, Section 6] | Medium (company-disclosed cost ratio; the stress magnitude is the agent's own mechanical application of the company's own 5% stress test) |
| 07_earnings-sensitivity | Earnings volatility score: 66/100 — "High volatility" (inverted, higher = worse) | [07_earnings-sensitivity output, Section 7] | High |
| business-model/01_disqualifier-scan | KPMG's auditor report carries a "Material Uncertainty about the Ability of Subsidiaries to Continue as a Going Concern" note tied to Glovo Spain and the same rider-classification risk, contingent liability €440–770m | [business-model/01_disqualifier-scan.md, Section 1–2] | High — Tier-1 audited source |

### Missing Evidence

| What Is Missing | Which Agent Flagged It | Impact On Setup |
|---|---|---|
| Audited FY2025 annual report / any standalone interim financial-statement filing | 00, 01, 02, 03, 06 | All FY2025 figures rest on a verbatim transcript (Tier 6) and CIQ workbook exports (Tier 5), not an audited Tier-1 filing; the going-concern note and contingent-liability figures used throughout this report are FY2024-audited and have not been re-confirmed or updated for FY2025 |
| Quarterly Adjusted EBITDA / EBIT / EPS / CFO / capex / FCF series (only Revenue TTM is computable) | 01 | No clean TTM or QoQ margin/cash trend can be built; the module's own margin, quality, and sensitivity reads all rest on annual or half-year granularity |
| Reconciliation of management's stated LFL/constant-currency revenue growth ("+18%" Q1'26, "+23%" FY2025) to the CIQ-computed reported-currency growth (+5.8%, +14.4%) | 01, 02, 05 | Directly undermines confidence in reading DHER's own headline growth commentary; 05's own pre-mortem names this the single most likely failure mode |
| FY2025 cost-of-sales line-item breakdown (delivery expense / Dmarts COGS / payment fees / etc.) | 03 | The -266bps FY2025 gross-margin decline cannot be decomposed the way FY2024 vs FY2023 was; the mechanism is inferred from FY2024's pattern, not confirmed for FY2025 |
| Precise euro split of the FY2025 ~€496m FCF gap between the lease-payment subtraction and the "extraordinary outflow" addback | 06 | The implied ~€600–650m legal/regulatory cash-outflow figure is itself a derived estimate (inference), not a company-disclosed line item |
| Maintenance vs. growth capex split | 06 | FCF may understate or overstate true recurring free cash flow; cannot assess capex discretion |
| Full income-statement FX translation sensitivity (only monetary/transaction exposure is disclosed, ~85% of revenue is non-EUR by inference) | 02, 03, 07, business-model/10 | The disclosed ±€26.8m (USD) / ±€72.0m (KRW) figures materially understate the true earnings sensitivity to sustained FX moves |
| Whether the Glovo Spain going-concern contingent liability (€440–770m) has moved since the FY24 Annual Report (no updated audited disclosure exists) | This agent (cross-referencing business-model/01) — not surfaced by any earnings-module agent 00–07 | The single largest unquantified tail risk to the FY2026 FCF/EBITDA setup is not tracked by any earnings-module output |

### Contradictions Between Agents

| Agent A | Agent A Says | Agent B | Agent B Says | Reconcilable? (Y/N) | Which Is More Credible |
|---|---|---|---|---|---|
| 06_earnings-quality | Names the ~€600–650m FY2025 "extraordinary" cash-outflow exclusion (tied to Glovo Spain rider payments and the EU antitrust settlement) as "the single biggest quality concern" but frames it as a disclosure/definitional issue — "clearly disclosed and explained... this is a trend-reading risk, not an aggressive-accounting pattern" [06_earnings-quality output, Section 10] | business-model/01_disqualifier-scan | The auditor itself (KPMG) attached a "Material Uncertainty about the Ability of Subsidiaries to Continue as a Going Concern" note to the SAME Glovo Spain rider-classification exposure, sufficient to lock the business-model module's own verdict [business-model/01_disqualifier-scan.md, Section 2–3] | Y — not a factual contradiction (both describe the same underlying exposure), but a severity-of-characterization gap: 06 treats it as a quality/definitional issue, the auditor's own language treats it as going-concern-adjacent | Business-model/01's read is more credible on THIS point because it is sourced directly to the audited Tier-1 auditor's report language, not inferred — 06's earnings-quality read should have been strengthened by this fact, not silent on it (see Section 2.7, flag #1 below) |
| 02_revenue-drivers | Frames Q4'25→Q1'26 GMV/order acceleration as "Improving" (Importance 70/100) [02_revenue-drivers output, Section 3] | 01_historical-financials | The same-period CIQ-computed reported-currency revenue growth actually decelerated further through 2025 into Q1 2026 (19.0%→15.5%→4.7%→5.8%) [01_historical-financials output, Section 6] | N — genuinely unresolved; both figures are correctly sourced to different bases (management's own LFL/constant-currency commentary vs. the CIQ reported-currency series) and neither agent can reconcile them from this pool | Neither — both agents flag the gap rather than pick a side, which is the correct discipline; the synthesizer must treat DHER's own growth narrative as unverified against the reported-currency numbers the Street's consensus is built on |

## 2. Red-Flag Scan — Category By Category

### 2.1 Data Completeness

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| No audited FY2025 annual report or standalone interim filing in the pool | Triggered | Medium | High | [00_earnings-data-triage output, Section 6] | All FY2025 figures (and the FY2026 guidance built on them) rest on Tier 5/6 sources, not the Tier-1 audited filing that would confirm them and update the going-concern/contingent-liability disclosures |
| Quarterly Adjusted EBITDA/EBIT/EPS/CFO/capex/FCF series largely unavailable — only Revenue TTM is computable | Triggered | Medium | High | [01_historical-financials output, Section 2, Section 3] | No clean QoQ or TTM margin/cash-quality trend exists; every quality and volatility read in this module rests on annual or half-year data |
| No quarterly gross-margin/COGS breakdown at all | Triggered | Low | High | [01_historical-financials output, Section 3] | Cannot verify whether the FY2025 gross-margin decline is accelerating or decelerating within the year |
| Maintenance-vs-growth capex split not disclosed | Unavailable | Low | Unknown | [06_earnings-quality output, Section 1] | FCF quality cannot be fully assessed — total capex may overstate or understate the truly recurring cash cost of the business |
| No investor presentation/deck in the pool | Not Triggered (immaterial) | Low | — | [00_earnings-data-triage output, Section 1] | No material impact — verbatim call transcripts substitute adequately for this module's needs |

### 2.2 Historical Trend

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| Gross margin compressed 2 consecutive years (-282bps FY2024, -266bps FY2025) while the Adjusted-EBITDA/EBIT narrative reads as "improving" | Triggered | Medium | High | [01_historical-financials output, Section 6; 03_margin-drivers output, Section 3] | These two trends must not be averaged into a single "margins improving" story; the improving metric (Adjusted EBITDA) and the deteriorating one (gross margin) reflect different, partly offsetting mechanisms (mix shift raises take-rate but also raises COGS share) |
| Adjusted EBITDA margin-expansion pace has decelerated sharply for 4 straight years (+814bps→+800bps→+308bps→+79bps YoY, FY2022–FY2025) even though the level has expanded every year | Triggered | Medium | High | [01_historical-financials output, Section 6] | A "5 straight years of margin expansion" headline can mask that the pace is nearly flat now; FY2026 guidance itself is not a simple extrapolation for this reason (management's own words, per 03_margin-drivers §9) |
| FY2025 reported (GAAP) EBITDA swing (+237bps YoY) was driven mostly by one-off items normalizing (Uber breakup-fee reconciliation, a smaller impairment than FY2024's), not a clean operating improvement | Triggered | Medium | High | [01_historical-financials output, Section 4; 03_margin-drivers output, Section 3] | A reader comparing statutory EBITDA/EBIT year-over-year without adjusting for this would overstate the pace of genuine operating improvement |

### 2.3 Revenue

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| Management's stated revenue growth ("+18%" Q1 2026, "+23%" FY2025) does not reconcile to the CIQ-computed reported-currency growth (+5.8%, +14.4%) — a 12+ point gap in both of the last 2 reported periods, same direction | Triggered | High | Medium-High | [01_historical-financials output, Section 3, Section 6; 02_revenue-drivers output, Section 6; 05_beat-miss-setup output, Section 3, Section 10] | This is the single item 05_beat-miss-setup's own pre-mortem names as the most likely reason the setup fails; if the Aug-27 print resolves toward the lower (CIQ-consistent) rate, it confirms a materially sharper reported-currency deceleration than management's own framing suggests |
| The single biggest historical revenue driver (own-delivery take-rate/mix shift, 61% of the one period this pool can decompose exactly) is explicitly guided to decelerate in FY2026 | Triggered | Medium | High | [02_revenue-drivers output, Section 7] | The lever that did most of the work is running out of runway faster than the underlying GMV/order-volume driver it is being replaced by — a genuine driver-substitution risk, not merely a deceleration |
| Iran-conflict-driven "eat-at-home" demand boost in Saudi Arabia (Mar 2026) already fully reversed by late April 2026, per management's own statement | Triggered | Low | High (already realized and disclosed) | [02_revenue-drivers output, Section 4, Cycle-Position note] | If a reader extrapolates Q1 2026 MENA acceleration into FY2026 MENA growth without discounting this one-time item, the FY2026 MENA read would be overstated — though management itself pre-empts this by stating KSA growth was already >20% before the conflict |
| Korea (Baemin) return to positive order/GMV growth is a single-quarter data point after a ~2-year competitive trough, not yet a proven multi-quarter trend | Triggered | Low | Medium | [02_revenue-drivers output, Section 4, Section 5 (Asia)] | A material share of the FY2026 beat-scenario narrative (05_beat-miss-setup §2) rests on this one quarter sustaining — genuinely unproven |

### 2.4 Margins

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| Rider-cost inflation / employment-classification regulation has no disclosed pass-through mechanism and has already produced one realized guidance miss (Europe, FY2024) | Triggered | High | Medium | [03_margin-drivers output, Section 3, Section 8; 07_earnings-sensitivity output, Section 4, Section 6] | The company's own stress test implies a bear case (-€344.5m) worth ~38% of FY2025 Adjusted EBITDA — larger than the entire FY2026 guided range (€50m span) — with no commercial lever to cap the downside the way pricing normally would |
| FY2025 gross-margin mechanism (own-delivery/Integrated Verticals mix shift raising COGS share) cannot be independently confirmed for FY2025 — no line-item cost-of-sales breakdown exists for that year, only for FY2024 | Triggered | Low | — | [03_margin-drivers output, Section 7] | The FY2025 gross-margin decline is explained by extrapolating the FY2024 mechanism, not by direct FY2025 disclosure — a data gap, not a confirmed causal read |
| FY2026 stepped-up investment (loyalty programs, Integrated Verticals) is guided to slow Adjusted EBITDA margin-expansion pace further, and the "demand signal vs. cost" question is explicitly unresolved by management's own framing | Unclear | Medium | Unknown | [03_margin-drivers output, Section 9] | 03_margin-drivers itself states the read could flip if the Aug-27 print shows GMV/order deceleration alongside continued elevated investment — this is a genuinely open question, not yet evidenced either way |

### 2.5 Guidance / Consensus

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| FY2026 Free Cash Flow guidance (>€200m floor) is constructed on the same "excluding extraordinary outflows" methodology that produced a -€366m miss against the FY2025 guide once actual legal/regulatory cash payments occurred | Triggered | High | Medium | [04_guidance-consensus output, Section 2, Section 6; 06_earnings-quality output, Section 5, Section 10] | Real, evidenced headline-miss risk independent of underlying operating performance — an in-line or beat operating quarter could still produce a negative FCF headline |
| Target Price and Recommendation consensus are deal-contaminated by the live Uber acquisition offer (cluster of large July 2026 revisions re-anchoring to deal terms) | Triggered | Medium | High (already realized) | [04_guidance-consensus output, Section 1] | Consensus cannot be read as a clean fundamentals-only signal for those two fields; the operating-line estimates (Revenue/EBITDA/FCF) used for this module's own beat/miss read are comparatively less affected, but the overall market-attention context is deal-driven |
| No formal company revenue guidance exists — beat/miss materiality thresholds for revenue are constructed by this agent's own inference, not anchored to a company number | Triggered | Low | — | [04_guidance-consensus output, Section 2; 05_beat-miss-setup output, Section 4] | Reduces confidence in any revenue-specific beat/miss call; the module already discloses this rather than hiding it |

### 2.6 Beat / Miss Setup

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| EPS (Normalized) has missed Street's estimate in every one of the last 5 fiscal years; revenue missed in 3 of the last 4 | Triggered | High | High (established base rate) | [05_beat-miss-setup output, Section 7; 04_guidance-consensus output, Section 6] | The currently "quiet" 90-day EPS revision picture (04_guidance-consensus §4–5) should be weighted with real caution given this multi-year miss pattern — the calm is not itself reassuring |
| An "in-line" Adjusted EBITDA print could still disappoint if the FY2026 margin-expansion-pace guide is cut further, given the metric's already-decelerating trajectory | Triggered | Medium | Medium | [05_beat-miss-setup output, Section 5] | A quarter that looks fine on the headline number can still carry a negative signal buried in the guidance language |
| A beat on management's own LFL/framing basis could coincide with a miss on the CIQ-consensus reported-currency basis the Street's model is actually built on | Triggered | High | Medium-High | [05_beat-miss-setup output, Section 5, Section 8] | Genuine risk that the market and the company read the same print differently — this compounds the unresolved revenue reconciliation gap already flagged in 2.3 |

### 2.7 Earnings Quality / Accounting

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| KPMG's auditor report carries a subsidiary-level "Material Uncertainty about the Ability of Subsidiaries to Continue as a Going Concern" note (Glovo Spain, contingent liability €440–770m) tied to the identical rider-classification risk that drives the FY2025 cash-conversion collapse and FCF exclusion — **not surfaced by any earnings-module agent (00–07)** | Triggered | Critical | High (unresolved, litigation ongoing in multiple jurisdictions) | [business-model/01_disqualifier-scan.md, Section 1–2; cross-referenced against 06_earnings-quality output, Section 2, Section 5, Section 10, which analyzes the same cash-outflow event without ever naming the going-concern note] | This is the single most consequential gap in the upstream earnings-module chain: 06_earnings-quality correctly identifies the ~€600–650m FY2025 "extraordinary" cash exclusion as its biggest quality concern but frames it as a definitional/disclosure issue, not as connected to the auditor's own going-concern-adjacent language on the same subsidiary and the same unresolved exposure |
| FY2025's "second consecutive year of positive free cash flow" headline (+€250m, +15% YoY) is built on excluding an implied ~€600–650m legal/regulatory cash outflow, and the identical exclusion methodology is carried forward as standing policy into FY2026 guidance | Triggered | Critical | Medium-High | [06_earnings-quality output, Section 5, Section 10] | If a comparable cash outflow recurs in FY2026 (e.g., an Italy reclassification outcome, further Spain-related payments) it will again be excluded from the guided figure, meaning the FY2026 FCF headline could look "on guide" while cash generation is materially weaker than the guided number implies |
| Cash conversion (CFO/Adjusted EBITDA) collapsed to 8.8% in FY2025; 2 of the last 3 fiscal years (FY2023, FY2025) show CFO/EBITDA below 50% | Triggered | High | High (already realized twice in 3 years) | [06_earnings-quality output, Section 1, Section 2; RF-EQ-002] | Adjusted EBITDA growth (+30% FY2025) is not translating into cash at anything close to a 1:1 rate in most years — a structural, recurring pattern, not a single-year blip |
| Adjusted EBITDA non-GAAP adjustments are recurring and outsized: 66% of the FY2025 metric itself, and exceeded 100% of the FY2024 metric | Triggered | High | High (already realized every year) | [06_earnings-quality output, Section 4] | The headline metric the company guides to and the Street tracks is built on adjustments larger than a normal materiality threshold would tolerate as "one-off" — SBC (24.8% of Adj. EBITDA, +31% YoY) and "management adjustments" both recur every year under different labels |
| Goodwill impairment and restructuring/asset-writedown costs have occurred in every single one of the last 5–6 fiscal years — neither is a genuine one-off despite being excluded as such | Triggered | Medium | High (already realized every year) | [06_earnings-quality output, Section 5, Section 8] | The "one-off" framing used for Adjusted EBITDA reconciliation does not match the empirical recurrence pattern |
| One-off gains (Uber Taiwan breakup fee +€220.9m, debt-modification gain +€99.3m) flattered FY2024 statutory profitability and the FY2024→FY2025 cash-flow comparison, partly unwound by the FY2025 goodwill impairment (-€259.7m) | Triggered | Medium | High (already realized) | [business-model/12_red-flags-sweep.md, Section 2; 01_historical-financials output, Section 4] | A reader comparing FY2024 to FY2025 without normalizing for this two-way swing would misread how much the underlying operating business actually improved — this specific item was not raised by any earnings-module agent (00–07), only by the business-model red-flags sweep |
| Effective tax rate is "NM" every year; management states FY2024's tax level was elevated by a one-off, making FY2025 "a better reflection of ongoing tax levels" | Triggered | Low | — | [06_earnings-quality output, Section 8] | A real, disclosed driver of the FY2025 net-income improvement that is not purely operational — small in scale relative to the flags above but part of the same pattern of non-operating items shaping the year-over-year read |

### 2.8 Sensitivity / External Variables

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| Rider-cost inflation / regulatory reclassification is the single highest-sensitivity variable in the model, genuinely asymmetric (bull +€140.6m vs. bear -€344.5m), with no disclosed pass-through and a demonstrated realized instance (Europe, FY2024) | Triggered | High | Medium | [07_earnings-sensitivity output, Section 2, Section 4, Section 6] | This variable alone can move Adjusted EBITDA by more than the entire FY2026 guided range; it is also the same exposure underlying the going-concern note (flag #1 above), compounding rather than diversifying the risk |
| Disclosed FX sensitivity (±€26.8m USD, ±€72.0m KRW, both on profit/loss, not Adjusted EBITDA) covers only monetary/transaction exposure, not the full income-statement translation of ~85% of Group revenue earned outside the eurozone | Triggered | Medium | Medium | [07_earnings-sensitivity output, Section 6; business-model/10_external-dependency.md, Section 2] | A sustained major-currency move (KRW, TRY, ARS) could have a materially larger earnings effect than the linear sensitivity table implies — the sidecar itself flags this rather than silently extrapolating |
| A discrete covenant-breach risk sits below the continuous sensitivity variables tested — none of the 6 variables alone breaches the RCF/term-loan minimum-liquidity covenant, but a simultaneous adverse move across several (FX + rider cost + Asia margin) would move the balance sheet closer to it | Triggered | Medium | Low-Medium | [07_earnings-sensitivity output, Section 6] | A non-linear, discrete risk this module's continuous sensitivity table does not itself model — correctly flagged by 07 as outside the linear framework |
| KRW/EUR FX and Asia segment margin are not independent — Korea's recovery (the Asia-margin bull case) is reported in euros, so a simultaneous KRW depreciation would offset some of the operational gain in Group-reported figures | Triggered | Low | Medium | [07_earnings-sensitivity output, Section 5] | The bull case for Asia margin recovery could show up smaller (or not at all) in euro-reported Adjusted EBITDA than the standalone Asia-margin sensitivity implies |

### 2.9 Source Conflicts

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| CIQ cash-flow-statement "Change in Inventories" line diverges sharply from the balance-sheet inventory movement in both FY2024 and FY2025 (e.g., -€547.7m vs. +€16.0m in FY2025) | Triggered | Low | Low | [06_earnings-quality output, Section 3] | Flagged as an unresolved vendor-mapping inconsistency, not evidence of manipulation; the balance-sheet-based DSO/DIO/DPO reads are correctly prioritized over the CIQ cash-flow line by 06 itself |
| Business-model module carries two different FY2024 Group Adjusted EBITDA figures internally (€692.5m, used by 4 of 5 business-model reports and matching the audited segment sum, vs. €791.3m, used only by 11_capital-allocation-governance) | Not Triggered (for the earnings module) | Low | — | [business-model/99_business-model-synthesis.md, Section 3] | Every earnings-module output in this pool (00–07) consistently and correctly uses the audited €692.5m figure — this inconsistency exists only inside the business-model module and does not propagate into any earnings-module claim, but the synthesizer should be aware it exists if reconciling across modules |

### 2.10 Narrative / Framing

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| "Second consecutive year of positive free cash flow" and "Adjusted EBITDA up 30%" are the company's own headline framings; both rest on definitions (FCF exclusions, Adjusted EBITDA add-backs) that this module's own earnings-quality agent scored 36/100 ("Poor quality") | Triggered | Medium | High (already realized) | [06_earnings-quality output, Section 9, Section 10] | A synthesis that leans on the company's own framing without carrying forward the earnings-quality score would overstate how "clean" the current earnings trajectory actually is |
| An "earnings accelerating" or "inflecting positive" read (EBIT turned positive, EBITDA guidance confidence raised) is defensible on the Adjusted EBITDA guidance track record alone, but sits uneasily next to a decelerating revenue trend, an unresolved 12+ point revenue-reconciliation gap, and an earnings-quality score in the "poor" band | Triggered | Medium | — | Synthesis of 01, 02, 03, 04, 05, 06 above | The setup is genuinely mixed across metrics (EBITDA-guidance track record is strong; revenue, EPS, and cash-quality tracks are weak) — a single-direction verdict risks averaging away a real split rather than naming it |
| The live Uber M&A situation risks making the Aug-27 FQ2 2026 print a secondary market event, per 05_beat-miss-setup's own pre-mortem, independent of whether the underlying beat/miss setup described in this module actually plays out | Triggered | Low | Medium | [05_beat-miss-setup output, Section 10] | The market's reaction to the earnings print itself may not cleanly reflect the standalone operating setup this module assesses |

## 3. Red-Flag Summary Table

| # | Category | Red Flag | Status | Severity | Probability | One-Line Impact |
|---:|---|---|---|---|---|---|
| 1 | Earnings Quality | Auditor going-concern note (Glovo Spain, €440–770m contingent liability) tied to the same exposure driving the FY2025 FCF/cash-conversion collapse — not connected by any earnings-module agent | Triggered | Critical | High | The "clean earnings" narrative rests on excluding cash tied to an unresolved, auditor-flagged going-concern-adjacent risk |
| 2 | Earnings Quality | FY2025's "+€250m FCF, +15% YoY" headline excludes an implied ~€600–650m legal/regulatory cash outflow; the same exclusion methodology stands as FY2026 guidance policy | Triggered | Critical | Medium-High | FY2026 FCF could again look "on guide" while real cash generation disappoints, if a comparable outflow recurs and is again excluded |
| 3 | Earnings Quality | Cash conversion (CFO/Adjusted EBITDA) fell to 8.8% FY2025; 2 of last 3 years below 50% | Triggered | High | High | Adjusted EBITDA growth is not translating into cash at anything near a 1:1 rate in most years |
| 4 | Margins / Sensitivity | Rider-cost inflation/regulatory reclassification — no pass-through, asymmetric bear case ~38% of FY2025 Adjusted EBITDA, already realized once (Europe FY2024) | Triggered | High | Medium | The single largest-magnitude variable capable of moving earnings, and largely outside company control |
| 5 | Revenue | Unresolved 12+ point gap between management's stated LFL/constant-currency growth and CIQ-computed reported-currency growth, twice in a row | Triggered | High | Medium-High | 05_beat-miss-setup's own named single most likely failure mode for the whole setup |
| 6 | Earnings Quality | Adjusted EBITDA non-GAAP adjustments are 66% (FY2025) to >100% (FY2024) of the metric itself, recurring every year | Triggered | High | High | The headline metric management guides to is built on adjustments too large and too recurring to treat as clean |
| 7 | Beat/Miss Setup | EPS missed Street 5 straight fiscal years; revenue missed 3 of last 4 | Triggered | High | High | A real, established base rate that should temper optimism from the currently quiet revision picture |
| 8 | Guidance/Consensus | FY2026 FCF guidance floor (>€200m) uses the same exclusion construct that produced a -€366m miss against the FY2025 guide | Triggered | High | Medium | Real, evidenced headline-miss risk independent of underlying operating performance |
| 9 | Historical Trend | Gross margin compressed 2 consecutive years while the Adjusted-EBITDA/EBIT narrative reads as "improving" | Triggered | Medium | High | Two opposite margin trends must not be averaged into one "margins improving" story |
| 10 | Historical Trend | Adjusted EBITDA margin-expansion pace decelerated sharply for 4 straight years (+814→+800→+308→+79bps) | Triggered | Medium | High | The "5 straight years of expansion" headline masks a pace now near flat |
| 11 | Data Completeness | No audited FY2025 annual report or interim filing — all FY2025 figures are Tier 5/6 | Triggered | Medium | High | The going-concern/contingent-liability disclosures underlying flags #1–2 have not been re-confirmed for FY2025 |
| 12 | Sensitivity | Disclosed FX sensitivity covers only monetary/transaction exposure, materially understating true translation exposure on ~85% non-EUR revenue | Triggered | Medium | Medium | A sustained major-currency move could have a materially larger earnings effect than the disclosed table implies |
| 13 | Earnings Quality | One-off gains (Uber breakup fee €220.9m, debt-mod gain €99.3m) flattered FY2024 statutory profit, partly unwound by FY2025 impairment | Triggered | Medium | High | Distorts the FY2024→FY2025 "improvement" comparison; raised only by the business-model red-flag sweep, not by any earnings-module agent |
| 14 | Margins/Beat-Miss | FY2026 investment-cycle "demand signal vs. cost" read is genuinely unresolved, pending the Aug-27 print | Unclear | Medium | Unknown | 03_margin-drivers' own named flip condition has not yet been tested |
| 15 | Data Completeness | Quarterly Adjusted EBITDA/EBIT/EPS/CFO/FCF series largely unavailable — only Revenue TTM is computable | Triggered | Medium | High | No clean QoQ or TTM margin/cash-quality trend exists to sanity-check the annual reads |
| 16 | Guidance/Narrative | Live Uber M&A situation contaminates Target Price/Recommendation consensus; the Aug-27 print risks being a secondary market event | Triggered | Medium | Medium | Consensus and market reaction may not cleanly reflect the standalone earnings setup |
| 17 | Revenue/Narrative | One-time demand boosts (Iran-conflict KSA spike, single-quarter Korea inflection) risk being read as durable trend if not carefully discounted | Triggered | Low | High | Already well-labeled upstream, but a real risk if carried into FY2026 extrapolation without the caveat |
| 18 | Source Conflict | CIQ "Change in Inventories" cash-flow line diverges sharply from balance-sheet inventory movement | Triggered | Low | Low | Unresolved vendor-mapping inconsistency; correctly not relied upon by 06's own working-capital reads |

## 4. Red-Flag Score

| Metric | Value |
|---|---|
| Total flags triggered | 17 |
| Critical flags | 2 |
| High flags | 6 |
| Medium flags | 7 |
| Low flags | 2 |
| Unclear flags | 1 |
| Unavailable checks (data missing) | 1 (maintenance-vs-growth capex split) |

## 5. Red-Flag Severity Verdict

**Critical concerns.**

Two Critical-severity flags are present and connected: KPMG's own auditor report carries a subsidiary-level going-concern-adjacent note on Glovo Spain (contingent liability €440–770m) tied to the identical rider-classification exposure that produced the FY2025 cash-conversion collapse (8.8%) and the ~€600–650m "extraordinary" cash outflow excluded from the company's headline FCF figure — and this connection was never made by any earnings-module agent (00–07), even though 06_earnings-quality independently identified the FCF-exclusion issue as its single biggest quality concern. The single most dangerous red flag is #1/#2 combined: the "second consecutive year of positive free cash flow, up 30% Adjusted EBITDA" narrative rests on excluding cash tied to an unresolved, auditor-flagged risk that the company itself has now built into its FY2026 guidance methodology as standing policy. This would be resolved by an updated audited FY2025 filing (or a subsequent audited filing) showing the going-concern language removed or the underlying litigation settled/capped, combined with an FY2026 print that does not repeat the same exclusion pattern on a comparably large cash outflow.

## 6. What The Synthesis Agent Should Know

- 17 flags triggered (2 Critical, 6 High, 7 Medium, 2 Low), plus 1 Unclear and 1 genuinely Unavailable check.
- The single most dangerous red flag: the FY2025/FY2026 FCF and cash-conversion story is built on excluding cash tied to the same rider-classification exposure that KPMG's auditor report flags as a going-concern-adjacent "Material Uncertainty" for the Glovo Spain subsidiary — not surfaced by any earnings-module agent before this review.
- This should change the earnings verdict: a headline read of "Earnings accelerating" or "Earnings inflecting — positive" (supported by the EBIT turn, the EBITDA-guidance track record, and the raised guidance confidence) should not be adopted without also weighting the earnings-quality score (36/100, "Poor quality") and the unresolved revenue-reconciliation gap. "Mixed earnings setup" is the more defensible category given the genuine split between a strong Adjusted-EBITDA-guidance track record and a weak revenue/EPS/cash-quality track record.
- Score caps this should reinforce, not relax: earnings-quality (already self-capped at 36/100 by 06) and earnings-volatility (already self-scored 66/100, inverted/worse, by 07) should NOT be revised upward by the synthesis layer — if anything, the going-concern connection argues the volatility score may still understate the discrete tail risk (the €440–770m contingent liability sits below the continuous sensitivity table, as 07 itself notes).
- Contradiction to reconcile: 06_earnings-quality's characterization of the FCF-exclusion issue as a "disclosure/definitional" matter should be read alongside business-model/01_disqualifier-scan's characterization of the same underlying exposure as auditor-flagged going-concern risk — these are not factually inconsistent, but the severity gap between them is real and the synthesizer should adopt the more source-grounded (auditor-language) read.
- Missing data that prevented a fuller scan: no audited FY2025 annual report (so the going-concern language and contingent-liability figures used here are FY2024-vintage, not independently re-confirmed for FY2025); no quarterly EBITDA/EBIT/EPS/CFO/FCF series (so quality and volatility reads rest on annual/half-year granularity only).
- Net read vs. the upstream agents: the setup is dirtier than a reading of 01–05 alone would suggest. Those agents each correctly flag their own local caveats (the revenue-reconciliation gap, the FCF-guidance construct, the EPS miss streak), but no single upstream agent connects the FCF-exclusion issue to the auditor's going-concern note — that connection, made here, is the single biggest reason to discount the "balanced setup" / "fair bar" characterizations in 04 and 05 when forming the final verdict.

## 7. Pre-Mortem — If The Earnings Setup Fails

If this earnings setup turns out to be wrong, the most likely reason is that the "accelerating profitability, second year of positive free cash flow" narrative — built on Adjusted EBITDA guidance that management has tracked closely for three straight years — collapses because the cash behind it was never really there: DHER's FY2025 FCF headline already excludes an implied ~€600–650m legal/regulatory cash outflow tied to unresolved, multi-jurisdiction rider-classification litigation (the same exposure KPMG's own auditor report flags as a going-concern-adjacent risk at Glovo Spain), and the identical "excluding extraordinary outflows" methodology is carried into FY2026 guidance as standing policy. If a comparable cash cost recurs in FY2026 — an Italy reclassification ruling following Spain's precedent, or further Spain-related payments — the FY2026 print could look "in line" or even a "beat" on the metric the Street tracks (Adjusted EBITDA) while the cash actually generated disappoints materially, exactly repeating the FY2025 pattern (+€250m guided-style headline vs. -€246.3m normalized operating FCF). This is a missing-connection error, not a missing-data error: every fact needed to see it was already disclosed in the audited FY2024 Annual Report and in 06_earnings-quality's own analysis — it simply was not connected to the auditor's own going-concern language until this review.
