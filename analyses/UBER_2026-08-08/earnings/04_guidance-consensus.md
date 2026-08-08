# Guidance & Consensus — UBER

## 1. Consensus Data Metadata

| Field | Value |
|---|---|
| Source | Capital IQ Estimates Report (`UberTechnologies,IncNYSEUBEREstimatesReport.xls` — Consensus, Guidance, Surprise, Trends, Revisions, Recent Changes tabs) [Capital IQ Estimates export, data as of 2026-08-05 through 2026-08-08] |
| Data as of date | 2026-08-05 (initial post-print snapshot, embedded in the FQ2 2026 transcript header as "Consensus as of Aug-05-2026 10:04 AM GMT" [Q2 FY26 transcript, S&P Global Market Intelligence Estimates header]) through 2026-08-08 (continued intraday revisions captured in the Recent Changes tab) |
| Fiscal year basis | US GAAP, fiscal year end Dec-31 (calendar year) [Capital IQ Estimates export, Consensus tab: "Acctg. Standard: US GAAP", "Current Fiscal Year End: Dec-31-2026"] |
| Analyst count | Varies by metric: Target Price 47/47; Revenue (FQ3 2026) 36–39; EBITDA (FQ3 2026) 28–49; EPS Normalized (FQ3 2026) 28–39; EPS (GAAP, FQ3 2026) 24–31 [Capital IQ Estimates export, Consensus tab and Revisions tab] |
| Currency | USD [Capital IQ Estimates export, Consensus tab: "Currency: Reported Currency"] |
| Calendarization issue? | N — fiscal year end Dec-31 matches calendar year, no reconciliation needed |

The two `EstimatesReport.xls` files in the data pool are byte-identical duplicates (confirmed in `00_earnings-data-triage.md`); this agent treats them as one source. Two verbatim earnings-call transcripts are also in the pool (FQ1 2026, FQ2 2026), both used for management-guidance colour per Section 2.

## 2. Management Guidance

Uber's formal, numeric quarterly guidance currently covers two metrics: (adjusted) EBITDA — guided continuously since 2019 — and EPS Normalized, which the company began guiding as a distinct range only starting FQ1 2026 (no guidance values appear for this line in any prior quarter in the pool's Guidance tab). Uber does not issue formal revenue guidance; the CIQ Guidance tab's Revenue row has been blank for every quarter since FQ2 2020, consistent with the transcript record. The company also stopped issuing EBIT, Net Income (GAAP), Capex, and Free Cash Flow guidance ranges years ago (last guided in 2019, 2019, 2021, and 2023 respectively) — none of those rows carry current values.

| Metric | Period | Guidance | Type (Point / Range / Qualitative) | Source |
|---|---|---|---|---|
| EBITDA (Uber's guided metric, understood to be company-defined Adjusted EBITDA; the CIQ export line is simply labelled "EBITDA" and its definition is not independently re-stated in this pool extract — flagged per hygiene rule) | FQ3 2026 (quarter ending Sep-2026) | $2,860mm – $2,960mm (midpoint $2,910mm) | Range | [Capital IQ Estimates export, Guidance tab, guidance issued 2026-08-05] |
| EPS Normalized | FQ3 2026 | $0.84 – $0.88 (midpoint $0.86) | Range | [Capital IQ Estimates export, Guidance tab, guidance issued 2026-08-05] |
| Revenue | FQ3 2026 | Not guided | — | No formal revenue guidance issued; CIQ Guidance tab shows no revenue range for any quarter since FQ2 2020 |
| Capex | — | Not guided | — | No Capex guidance range since FY2020 (last: "$550mm–$600mm" outflow, guided 2020-05-07) |
| Free Cash Flow | — | Not guided as a range | — | No FCF guidance range since FY2022 (last guide was "0", i.e. a floor/breakeven signal, guided 2022-05-04) |
| Gross Bookings (qualitative) | FQ3 2026 | "Relatively healthy trends for delivery in the third quarter"; continued expectation the U.S. business "accelerate[s] through this year," attributed to three items: an insurance-cost tailwind being reinvested into pricing, product-innovation velocity (Reserve, U4B, Black, Wait & Save), and AV rollout | Qualitative | [Q2 FY26 transcript, prepared remarks — Dara Khosrowshahi, CEO; Balaji Krishnamurthy, CFO, Q&A] |

No specific numeric Gross Bookings guidance figure for FQ3 2026 is present anywhere in the extracted CIQ Guidance tab (it tracks EPS Normalized, Revenue, EBITDA, EBIT, Net Income GAAP, Capex, and FCF only — not Gross Bookings). Management's own historical framing is useful context: on the Q2 2026 call, the CEO stated Q2 gross bookings "grew 22% year-on-year to more than $58 billion, above the high end of our guidance and marking our fourth consecutive quarter above 20% growth" [Q2 FY26 transcript, prepared remarks]. That confirms Uber does guide gross bookings internally (and beat that guide in Q2), but the specific FQ3 2026 gross-bookings range itself is not captured in this pool's structured data — a genuine gap, not treated as "not proven," but flagged as unavailable for the guidance-vs-consensus comparison below.

## 3. Guidance vs Consensus Table

| Metric | Period | Management Guidance | Street Consensus | Gap | Gap Direction |
|---|---|---|---|---:|---|
| EBITDA | FQ3 2026 | $2,860mm – $2,960mm (midpoint $2,910mm) | $2,918.95mm (32–49 analysts) [Capital IQ Estimates export, Consensus tab, Market Summary] | +$8.95mm (+0.31% vs midpoint) | In-line — consensus sits essentially at the guidance midpoint |
| EPS Normalized | FQ3 2026 | $0.84 – $0.88 (midpoint $0.86) | $0.8632 (28–39 analysts) [Capital IQ Estimates export, Consensus tab, fiscal-quarters section] | +$0.0032 (+0.37% vs midpoint) | In-line — consensus sits essentially at the guidance midpoint |
| Revenue | FQ3 2026 | Not guided | $14,694.75mm (36–39 analysts) [Capital IQ Estimates export, Consensus tab, Market Summary] | N/A (no guidance to compare against) | No formal guidance issued |

Gap = Consensus minus Guidance midpoint. For the two metrics Uber actually guides, consensus has converged almost exactly onto the guidance midpoint (both gaps under 0.4%) — this is the literal definition of a "fair" bar for those two lines, not a stretched or discounted one.

**A material post-print drift on Revenue is worth flagging separately.** The FQ2 2026 transcript's own embedded consensus snapshot — captured at "Aug-05-2026 10:04 AM GMT," i.e. the morning of the print — showed FQ3 2026 Revenue consensus at $14,849.61mm [Q2 FY26 transcript, S&P Global Market Intelligence Estimates header]. By the time of this pool's most current pull (Aug-08-2026), that figure had fallen to $14,694.75mm — a $154.86mm (−1.04%) cut in three trading days, consistent with the Revisions-tab pattern in Section 5 below (heavy net-downward revenue revisions in the days right after the print). Since Revenue carries no formal guidance to anchor against, this drift is a pure Street sentiment signal, not a guidance gap — but it is the single largest, freshest move in the whole estimate set.

## 3A. Alt-Data Cross-Check

No external alt-data panel exists for this ticker — `data/UBER/external/` does not exist in the data pool (confirmed in `00_earnings-data-triage.md`, Section 1A). This section is omitted; its absence is not a data gap.

## 4. Estimate Revision Momentum Table

| Estimate | 3 Months Ago | 2 Months Ago | 1 Month Ago | Current | Direction |
|---|---:|---:|---:|---:|---|
| Revenue (next Q, FQ3 2026, $mm) | 14,795.07 | 14,789.07 | 14,846.89 | 14,697.36 | Falling (recent) |
| EPS Normalized (next Q, FQ3 2026, $) | 0.86 | 0.87 | 0.87 | 0.86 | Flat |
| Revenue (current FY, FY2026, $mm) | 58,308.00 | 58,132.30 | 58,181.97 | 57,834.88 | Falling |
| EPS Normalized (current FY, FY2026, $) | 3.33 | 3.35 | 3.34 | 3.37 | Rising (modest) |
| Revenue (next FY, FY2027, $mm) — supplemental | 66,705.07 | 67,042.58 | 67,043.88 | 67,028.29 | Roughly flat |
| EPS Normalized (next FY, FY2027, $) — supplemental | 4.31 | 4.37 | 4.42 | 4.42 | Rising |
| EBITDA (current FY, FY2026, $mm) — supplemental | 11,033.97 | 11,261.16 | 11,272.84 | 11,365.18 | Rising |

[Capital IQ Estimates export, Trends tab — "1 month ago" / "2 months ago" / "3 months ago" columns, current as of the pool pull]

Revenue estimates have been cut at both the next-quarter and current-year horizon over the last three months, with the cut concentrated in the days right after the Q2 print (see Section 3). Profitability estimates (EBITDA, EPS Normalized) have moved the opposite way — modestly higher over the same window, most clearly for EBITDA (+3.0% over three months at the FY2026 level). This is a genuine divergence, not noise: the Street is trimming the top line while raising the profit line for the same company over the same period.

## 5. Revision Breadth

| Metric | Up Revisions | Down Revisions | Net Revision Breadth | Period |
|---|---:|---:|---:|---|
| Revenue, FQ3 2026 (next Q) | 8 | 19 | −11 | Last Month (≈ Aug 5–8, 2026, the post-Q2-print / Q3-guide window) |
| Revenue, FY 2026 (current FY) | 11 | 20 | −9 | Last Month |
| EBITDA, FQ3 2026 (next Q) | 13 | 7 | +6 | Last Month |
| EBITDA, FY 2026 (current FY) | 19 | 5 | +14 | Last Month |
| EPS Normalized, FQ3 2026 (next Q) | 9 | 7 | +2 | Last Month |
| EPS Normalized, FY 2026 (current FY) | 12 | 9 | +3 | Last Month |

[Capital IQ Estimates export, Revisions tab, "Last Month" section]

Over the slightly longer "Last 3 Months" window the pattern is similar but less lopsided on Revenue (FQ3 2026: 16 up / 18 down; FY2026: 24 up / 19 down) and more strongly positive on EBITDA (FQ3 2026: 20 up / 3 down; FY2026: 28 up / 0 down) [Capital IQ Estimates export, Revisions tab, "Last 3 Months" section]. The direction is consistent across both windows: Revenue revisions skew negative, profitability revisions skew positive, and the skew is sharpest in the freshest (Last Month) window — i.e. it intensified right around this print, it did not fade.

One likely structural driver of the EPS-specific (though not EBITDA-specific) softness in upward breadth: the Street's Effective Tax Rate assumption for FQ3 2026 has risen from 16.77% three months ago to 18.94% currently, and the FY2026 assumption has risen from 9.5% twelve months ago to 20.77% currently [Capital IQ Estimates export, Trends tab and Consensus tab, Effective Tax Rate % row]. A rising tax-rate assumption eats into EPS upside even where EBITDA estimates are being raised — consistent with EPS Normalized revision breadth (+2 to +3, barely positive) being far weaker than EBITDA revision breadth (+6 to +14) over the identical window.

## 6. Historical Beat / Miss Pattern

| Period | Revenue Beat/Miss | EPS (Normalized) Beat/Miss | Magnitude | Notes |
|---|---|---|---:|---|
| Q3 FY25 (Sep-2025) | Beat | Miss | Rev +1.55% ($13,467mm vs $13,261.49mm est.); EPS Norm. −25.4% ($0.6468 vs $0.8676 est.) | EBITDA landed inside its own guided range ($2,190–2,290mm; actual $2,256mm, +0.71% vs midpoint). GAAP EPS beat by +350.7% (one-off equity-stake gain) — the Normalized-EPS miss was driven by items below the EBITDA line, not core operating execution [Capital IQ Estimates export, Surprise tab; Q2 FY26 transcript, embedded S&P estimates table] |
| Q4 FY25 (Dec-2025) | Beat | Miss | Rev +0.30% ($14,366mm vs $14,322.67mm est.); EPS Norm. −10.1% ($0.71 vs $0.7854 est.) | EBITDA landed inside its own guided range ($2,410–2,510mm; actual $2,487mm, +1.10% vs midpoint), near the high end. GAAP EPS missed by −82.1% (one-off item), the mirror image of Q3's pattern [Capital IQ Estimates export, Surprise tab; Q2 FY26 transcript, embedded S&P estimates table] |
| Q1 FY26 (Mar-2026) | Miss | Beat | Rev −0.45% ($13,203mm vs $13,262.69mm est.); EPS Norm. +4.31% ($0.72 vs $0.6933 est.) | First quarter EBITDA cleared ABOVE the top of its own guided range ($2,370–2,470mm; actual $2,481mm, +2.52% vs midpoint, +$11mm above the high end). This is also the first quarter Uber issued a formal EPS Normalized guide (0.65–0.72) — actual landed exactly at the top of that range. GAAP EPS missed −81.7% (one-off item) [Capital IQ Estimates export, Surprise tab and Guidance tab; Q2 FY26 transcript, embedded S&P estimates table] |
| Q2 FY26 (Jun-2026) | Miss | Beat | Rev −0.52% ($14,191mm vs $14,265.78mm est.); EPS Norm. +1.25% ($0.81 vs $0.8046 est.) | Second straight quarter EBITDA cleared ABOVE the top of its own guided range ($2,700–2,800mm; actual $2,819mm, +2.51% vs midpoint, +$19mm above the high end). GAAP EPS beat +41.0% this quarter (favourable one-off) [Capital IQ Estimates export, Surprise tab and Guidance tab; Q2 FY26 transcript, prepared remarks: "Gross bookings grew 22% year-on-year... above the high end of our guidance"] |

**Reported (GAAP) EPS is not usable for a beat/miss read on its own** — it has swung from +350.7% to −82.1% to −81.7% to +41.0% over these four quarters, almost certainly driven by mark-to-market movements in Uber's equity stakes (Aurora, Didi, Grab, Joby, and similar), which the company itself separates out in its non-GAAP reconciliation. EPS Normalized is the cleaner series and is used for the beat/miss and bar calls in this report.

**The pattern that matters for the bar going forward:** EBITDA has beaten its own guidance in all four of the last four quarters, and — critically — has beaten ABOVE the guided high end in each of the last two (Q1 and Q2 FY26), by a consistent ~2.5% over the guided midpoint both times. Revenue has flipped from small beats (Q3/Q4 FY25, +0.3% to +1.6%) to small misses (Q1/Q2 FY26, −0.5%) against consensus (there being no formal revenue guide to measure against). EPS Normalized has flipped from large misses (driven by below-the-line items, not core execution) to small beats over the same window, coinciding with Uber's decision to start guiding EPS Normalized as its own range beginning Q1 FY26.

## 7. Bar Assessment

**Bar is fair.**

For the two metrics Uber actually guides — EBITDA and EPS Normalized — the current Street consensus for FQ3 2026 sits within roughly 0.3–0.4% of the guidance midpoint in both cases (Section 3). That is the textbook definition of an in-line bar: analysts have simply adopted management's own guided range as their base case, neither discounting it (bar low) nor stretching above it (bar high).

Two secondary signals complicate a pure "fair" call and are worth weighing directly, because they point in opposite directions and neither is decisive on its own:

- **A tailwind for beat odds on EBITDA/EPS:** the company has now beaten its own EBITDA guidance in four straight quarters, and beaten ABOVE the guided high end in the last two by a near-identical ~2.5% margin each time (Section 6). Consensus is set at the guidance midpoint, not at a "beat-adjusted" level that reflects this streak — so if the pattern holds a third straight quarter, the guided range itself, not just consensus, would likely be cleared again. This is evidence-based streak continuation, not a guarantee (a two-quarter streak is a short base rate), but it tilts the odds toward another EBITDA/EPS beat rather than a miss.
- **A headwind for beat odds on Revenue:** Revenue carries no formal guidance to anchor against, and the freshest revision data (the three days immediately following the Q2 print and Q3 guide) shows a clear net-downward skew — 8 up vs. 19 down at the FQ3 2026 level, 11 up vs. 20 down at the FY2026 level (Section 5) — alongside a −1.04% cut in the specific FQ3 2026 revenue consensus number itself since the morning of the print (Section 3). Revenue has also missed (very narrowly, under 0.6%) consensus in each of the last two reported quarters. None of this points to a stretched ("high") bar in the sense of consensus sitting meaningfully above where the company is likely to land — the misses have been small — but it does argue against calling the revenue bar "low."

Net: this is not a single clean signal in one direction, so "fair" is the correct call for the guided metrics that anchor this section, with the qualifier that the profitability line (EBITDA/EPS) carries a modest continuation-of-streak beat tilt while the revenue line carries a modest continuation-of-trend miss tilt (both small, single-digit-percent in magnitude, not the kind of gap that would justify "low" or "high" outright).

