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
