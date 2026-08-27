# Guidance & Consensus — META

## 1. Consensus Data Metadata

| Field | Value |
|---|---|
| Source | Capital IQ Estimates export — `MetaPlatforms,IncNasdaqGSMETAEstimatesReport.xls` (Consensus, Guidance, Recent Changes, Revisions, Surprise, Trends tabs) |
| Data as of date | Headline consensus figures (target price, FY2026/FY2027 revenue, EBITDA, EPS) reflect analyst updates through **2026-08-24/25** (cross-checked: the "Consensus After" values in the Recent Changes tab for entries dated 2026-08-24 match the Consensus tab's headline mean figures exactly, e.g. Revenue FY2026 mean $254,182.75M = the 2026-08-24 "Consensus After" value). The file itself was synced into the pool on 2026-08-26. Historical quarterly Surprise entries run through the Q2 2026 earnings release (2026-07-29) |
| Fiscal year basis | FY2026, ending Dec-31-2026 (current/"next" fiscal year in this report). Current-quarter consensus is FQ3 2026, ending Sep-30-2026, scheduled release **Oct-28-2026** [Capital IQ Estimates export, Consensus tab header] |
| Analyst count | Revenue FY2026: 55 of 59 submitted estimates still in consensus. EPS (GAAP) FY2026: 52 of 56. Target Price: 57 of 57. LT Growth: 12 of 12 [Capital IQ Estimates export, Consensus tab] |
| Currency | USD (Reported Currency, CIQ default conversion = today's spot rate) [Capital IQ Estimates export, Consensus tab] |
| Calendarization issue? | N — Meta's fiscal year end (Dec-31) matches the standard calendar year and calendar quarters; no reconciliation needed |

## 1A. Reporting-Basis Reconciliation (mandatory — CLAUDE.md §27)

| Field | Value |
|---|---|
| Next period the company will actually FILE | Third quarter 2026 (three months ended Sep-30-2026) — a **standalone** quarter. Meta is a US domestic filer reporting under US GAAP on a 10-Q basis; it does not file cumulative half-year or nine-month statements the way some non-US issuers do |
| Expected filing date + source for that date | Earnings release ~Oct-28-2026, per "FQ3 2026 Earnings Release Date: Oct-28-2026" [Capital IQ Estimates export, Consensus/Guidance tab header]; the Form 10-Q itself typically follows within days under SEC deadlines |
| What that filing contains | **Standalone period** (three months ended Sep-30-2026) — not cumulative |
| Vendor estimate as pulled (period label + value) | "FQ3 2026" (Current Quarter): Revenue mean $63,314.92M; EPS Normalized mean $6.97; EBITDA mean $35,224.53M [Capital IQ Estimates export, Consensus tab] |
| Already-reported stub inside that period (period + actuals + citation) | **None.** Because Meta reports standalone quarters (not cumulative interim periods), FQ3 2026 has no partial-quarter stub already reported that needs adding back — the vendor's "FQ3 2026" field already IS the standalone period the company will file |
| Consensus restated onto the filing basis — show the arithmetic | **No restatement required.** Vendor period label ("FQ3 2026") already matches the filing basis (a discrete quarter). Bar = $63,314.92M revenue / $6.97 EPS Normalized, as-is |
| Basis-restated bar vs the same period a year earlier | Q3 2025 actual (same standalone-quarter basis): Revenue $51,242M; EPS Normalized $7.25 [Capital IQ Estimates export, Surprise tab, FQ3 2025 column, announced 2025-10-29]. The consensus bar for Q3 2026 therefore implies **+23.6% YoY revenue growth** ($63,314.92M vs $51,242M) but **−3.9% YoY on normalized EPS** ($6.97 vs $7.25) — the Street expects revenue to accelerate sharply while normalized per-share earnings are expected to be flat-to-down, consistent with the capex-driven depreciation increase and the raised FY2026 tax-rate guidance discussed in Section 2 below |

**Sanity check:** not applicable in the ratio form described (no stub to compare against, since this is a standalone-quarter filer). The relevant check here is the YoY comparison above, which is shown explicitly rather than assumed.

## 2. Management Guidance

All guidance below is from the **Q2 2026 earnings press release** (Exhibit 99.1, released 2026-07-29), "CFO Outlook Commentary" section, cross-checked against the Q2 2026 verbatim earnings-call transcript (2026-07-29). Meta does not issue EPS guidance, full-year revenue guidance, or non-GAAP margin guidance — only the items below.

| Metric | Period | Guidance | Type (Point / Range / Qualitative) | Source |
|---|---|---|---|---|
| Revenue | Q3 2026 | $61–64 billion (midpoint $62.5bn); assumes FX is a ~1% headwind to YoY growth | Range | Q2 2026 Press Release (Ex-99.1), CFO Outlook Commentary |
| Total expenses | FY2026 | $165–169 billion (midpoint $167bn); lower end raised from the prior $162–169bn range to incorporate the $2.4bn Q2 2026 legal-proceedings charge | Range | Q2 2026 Press Release (Ex-99.1), CFO Outlook Commentary |
| Operating income (EBIT) | FY2026 | "Continue to expect to deliver operating income this year that is above 2025 operating income" — i.e. above the FY2025 actual of $83,276M [FY25 10-K, MD&A — Income from Operations] | Qualitative (floor, no point/range figure given) | Q2 2026 Press Release (Ex-99.1), CFO Outlook Commentary |
| Capex | FY2026 | $130–145 billion (midpoint $137.5bn), including finance-lease principal payments; narrowed from the prior $125–145bn range issued at Q1 2026 | Range | Q2 2026 Press Release (Ex-99.1), CFO Outlook Commentary |
| Effective tax rate | Remaining FY2026 quarters (Q3–Q4) | 15–17% (midpoint 16%); raised from the 13–16% guided at Q1 2026, "absent any changes to our tax landscape" | Range | Q2 2026 Press Release (Ex-99.1), CFO Outlook Commentary |
| Other KPIs — FX assumption | Q3 2026 | ~1% revenue headwind from FX at current exchange rates (vs. a ~2% FX *tailwind* assumed for the Q2 2026 guide one quarter earlier) | Qualitative | Q2 2026 Press Release (Ex-99.1), CFO Outlook Commentary |

**Guidance evolution (last three quarters), for context on direction of travel:**
- Capex: FY2026 guided $115–135bn (as of the Q4 2025 call, per the Q1 2026 press release's own reference to "our prior range") → raised to $125–145bn at Q1 2026 → narrowed to $130–145bn at Q2 2026. Each revision has raised the floor of the range.
- Tax rate: 13–16% (Q1 2026 guide) → 15–17% (Q2 2026 guide). Raised.
- Total expenses: $162–169bn (Q1 2026, "unchanged from prior outlook") → $165–169bn (Q2 2026, raised lower end for the legal charge).

Guidance midpoints are used for all gap calculations in Section 3.

## 3. Guidance vs Consensus Table

Gap = Consensus minus Guidance midpoint (or, for Operating Income, minus the qualitative floor). Positive = Street sits above management's guidance.

| Metric | Period | Management Guidance | Street Consensus | Gap | Gap Direction |
|---|---|---|---|---:|---|
| Revenue | Q3 2026 | $61,000M–$64,000M (midpoint $62,500M) | $63,314.92M (mean, 55/59 analysts) [Capital IQ Estimates export, Consensus tab] | +$814.92M (+1.30%) | Guidance above/below: **Consensus above the guidance midpoint**, sitting at ~77% of the way up the $3bn range |
| Operating income (EBIT) | FY2026 | Qualitative floor: above FY2025 actual of $83,276M | $88,293.54M [Capital IQ Estimates export, Guidance tab, FY2026 "Consensus Estimate" row, matched to the EBIT guidance line] | +$5,017.54M (+6.03% above the floor) | **Consensus above guidance's own floor** — the Street already expects EBIT growth well beyond "merely above 2025," so the qualitative floor itself is not the operative bar |
| Capex | FY2026 | $130,000M–$145,000M (midpoint $137,500M) | $139,602.75M [Capital IQ Estimates export, Trends tab, "Current" column, FY2026] | +$2,102.75M (+1.53%) | **Consensus above the guidance midpoint**, tracking toward the upper-middle of the range |
| Total expenses (derived) | FY2026 | $165,000M–$169,000M (midpoint $167,000M) | **Not a directly tracked consensus line in this vendor export.** Derived: consensus revenue ($254,182.75M) − consensus EBIT ($88,293.54M) ≈ **$165,889.21M** implied total costs & expenses | −$1,110.79M vs midpoint (−0.67%) | Implied consensus sits **near the low end** of management's guided range — i.e., the Street is not pricing in an expense overshoot |
| Effective tax rate | FY2026 (blended, not matched-basis) | 15–17% guided for **remaining quarters only** (Q3–Q4) | FY2026 blended-annual consensus mean: 5.86% [Capital IQ Estimates export, Recent Changes tab, 2026-08-24 entries] | Not comparable — see note | **Not a matched-basis gap.** The FY2026 consensus blends in Q1 2026's actual effective tax rate of −23% (a one-time benefit from Treasury Notice 2026-7 on capitalized R&D costs [Q1 2026 Press Release, Effective tax rate footnote]), which management's forward guidance explicitly excludes. Comparing the two directly would understate how much tax-rate pressure is actually guided for H2 2026 |

## 3A. Alt-Data Cross-Check

No external alt-data panel exists for META in this pool (`data/META/external/` is absent). Section omitted per instructions — its absence is not a gap.

## 4. Estimate Revision Momentum Table

Capital IQ's Trends tab reports snapshots at 1/2/3 months back rather than exact 90/60/30-day marks; mapped as: 30 Days Ago ≈ 1 month ago, 60 Days Ago ≈ 2 months ago, 90 Days Ago ≈ 3 months ago.

| Estimate | 90 Days Ago | 60 Days Ago | 30 Days Ago | Current | Direction |
|---|---:|---:|---:|---:|---|
| Revenue (next Q, FQ3 2026, $M) | 63,163.35 | 63,163.35 | 63,235.57 | 63,314.92 | Rising (modest, +0.24% over 90 days) |
| EPS Normalized (next Q, FQ3 2026) | 7.39 | 7.39 | 7.36 | 6.97 | Falling — a 5.3% drop concentrated in the last 30 days |
| Revenue (next FY, FY2026, $M) | 253,075.16 | 252,840.34 | 253,303.57 | 254,182.75 | Rising |
| EPS Normalized (next FY, FY2026) | 31.67 | 31.86 | 31.18 | 31.16 | Falling then flat — down from 31.86 two months ago to 31.18 one month ago, essentially unchanged since |
| EPS (GAAP) (next FY, FY2026) — supplementary | 32.91 | 32.87 | 33.05 | 31.73 | **Falling sharply** — down ~4% in the most recent month alone, while the Normalized EPS line above barely moved over the same window |

[Capital IQ Estimates export, Trends tab]

**Adjudicating the disagreement (CLAUDE.md §3):** revenue and EBITDA estimates are rising modestly (see Section 5), while GAAP EPS has been cut sharply in the past month (31.73 now vs. 33.05 one month ago) even as Normalized EPS held roughly flat (31.16 vs. 31.18). The GAAP-only cut is consistent with the Q2 2026 one-off items that hit GAAP but not adjusted earnings — the $2.4bn legal-proceedings charge and $1.18bn severance expense (Section 6) — plus the raised FY2026 tax-rate guidance (15–17%, up from 13–16%) and the narrowed-but-higher capex range, both of which raise cost/D&A assumptions embedded in GAAP forecasts more than in some analysts' adjusted models. The revenue/EBITDA uptrend does not overturn the GAAP-EPS downtrend; they are consistent with two different things moving — the top line and adjusted profitability are viewed as intact, while the reported (GAAP) bottom line is being marked down for cost items analysts do not exclude.

## 5. Revision Breadth

Windows below are the "Last Month" figures from the Revisions tab (most current available breadth window).

| Metric | Up Revisions | Down Revisions | Net Revision Breadth | Period |
|---|---:|---:|---:|---|
| Revenue next FY | 37 | 16 | **+21** (of 55 analysts still in consensus) | FY2026, last month |
| EBITDA next FY | 13 | 19 | **−6** (of 33 analysts still in consensus) | FY2026, last month |
| EPS (GAAP) next FY | 5 | 44 | **−39** (of 52 analysts still in consensus) | FY2026, last month |
| EPS Normalized next FY — supplementary | 2 | 6 | **−4** (of 8 analysts still in consensus) | FY2026, last month. *Sample of 8 is below the ~8-observation empirical threshold — treat this row as directional, judgment-level, not a statistically robust breadth read* |

[Capital IQ Estimates export, Revisions tab]

Revenue breadth is solidly positive; EBITDA breadth is mildly negative despite the EBITDA *level* estimate barely moving quarter to quarter (Section 4); GAAP EPS breadth is heavily negative — 44 of 52 analysts cut their FY2026 GAAP EPS estimate in the last month, versus only 5 raising it. This lines up with the price-target action in the same window: of 58 analysts, 45 cut their target price and zero raised it in the last month, while the mean 12-month target fell from $825.84 (1 month ago) to $754.84 (current) — an 8.6% cut [Capital IQ Estimates export, Trends and Revisions tabs, Non-Periodic Data Items]. Long-term growth consensus also fell, from 22.04% to 19.24% over the same month. None of this is a valuation call by this module — it is cited only as evidence of the direction analysts are currently revising the earnings/estimate picture, which is squarely in scope.

## 6. Historical Beat / Miss Pattern

All figures verified directly from the Capital IQ Estimates export, Surprise tab (Fiscal Quarters block), cross-checked against each period's own press release for the one-off items that explain the GAAP EPS swings.

| Period | Revenue Beat/Miss | EPS Beat/Miss | Magnitude | Notes |
|---|---|---|---:|---|
| Q3 2025 (Sep-2025, ann. 2025-10-29) | Beat | Normalized: Beat +8.70% ($7.25 vs. $6.67 est.). GAAP: **Miss −84.35%** ($1.05 vs. $6.71 est.) | Revenue +3.71% ($51,242M vs. $49,407.71M est.) | GAAP EPS miss driven by a one-time tax charge tied to a change in US tax law (2025 "One Big Beautiful Bill Act"-related item); Normalized EPS excludes it and beat comfortably |
| Q4 2025 (Dec-2025, ann. 2026-01-28) | Beat | Normalized: Beat +8.56% ($8.88 vs. $8.18 est.). GAAP: Beat +8.03% ($8.88 vs. $8.22 est.) | Revenue +2.43% ($59,893M vs. $58,469.62M est.) | Clean beat on both bases; GAAP and Normalized EPS converge to the same figure this quarter |
| Q1 2026 (Mar-2026, ann. 2026-04-29) | Beat | Normalized: Beat +7.18% ($7.31 vs. $6.82 est.). GAAP: **Beat +56.76%** ($10.44 vs. $6.66 est.) | Revenue +1.36% ($56,311M vs. $55,555.59M est.) | Outsized GAAP beat driven by a one-time tax benefit from Treasury Notice 2026-7 (Corporate Alternative Minimum Tax treatment of capitalized R&D costs), which cut the reported effective tax rate to −23% and added $3.13 to diluted EPS [Q1 2026 Press Release, effective tax rate footnote] |
| Q2 2026 (Jun-2026, ann. 2026-07-29) | Beat (smallest of the last 4 quarters) | Normalized: **Miss −16.49%** ($6.18 vs. $7.40 est.). GAAP: **Miss −14.40%** ($6.18 vs. $7.22 est.) | Revenue +0.85% ($60,801M vs. $60,286.77M est.) | Both EPS bases missed — driven by $2.40bn of legal-proceedings charges and $1.18bn of severance tied to a May-2026 headcount reduction [Q2 2026 Press Release] |

**The pattern that matters for the forward bar:** revenue beats have shrunk in every one of the last four quarters — 3.71% → 2.43% → 1.36% → 0.85% — and the most recent quarter was an outright EPS miss on both bases. Combined with the current consensus sitting above the Q3 2026 guidance midpoint (Section 3) and heavily negative GAAP-EPS revision breadth (Section 5), the historical cushion that supported four straight revenue beats has been almost fully priced out.

## 7. Bar Assessment

**Bar is high** — driven principally by the earnings/cost line, with revenue closer to fair-but-thinning.

Consensus already sits above management's own guidance on every quantifiable line in Section 3: revenue consensus is 1.3% above the Q3 2026 guidance midpoint (sitting ~77% up the $3bn range), EBIT consensus is 6.0% above the qualitative "above 2025" floor management gave, and capex consensus (1.5% above the guided midpoint) sits toward the top of a range management itself has raised twice in the last two quarters. That alone would argue for a demanding bar; it is reinforced by the beat-magnitude trend in Section 6, where four consecutive quarters of shrinking revenue beats (3.71% down to 0.85%) leave little historical cushion, and by the most recent quarter's outright EPS miss on both GAAP and Normalized bases. Revenue-estimate revision breadth is genuinely positive (+21 net in the last month, Section 5) and does not, on its own, argue for a high bar — but it is outweighed by the GAAP-EPS revision breadth of −39 net (44 of 52 analysts cutting) and the accompanying wave of price-target cuts (45 of 58 analysts, zero raising), which reflect the market digesting a raised tax-rate guide (15–17%, up from 13–16%) and a raised-and-narrowed capex range ($130–145bn) that push cost and depreciation assumptions higher just as GAAP earnings absorbed a one-off charge in the print just reported. Section 1A's YoY math on the Q3 2026 bar itself makes the same point directly: consensus implies +23.6% revenue growth against roughly flat-to-down (−3.9%) normalized EPS growth for the same quarter a year ago — a bar that is comfortably beatable on the top line but demanding on the bottom line.
