# Guidance & Consensus — TSLA

## 1. Consensus Data Metadata

| Field | Value |
|---|---|
| Source | Capital IQ (`Tesla,IncNasdaqGSTSLAEstimatesReport.xls` — Consensus, Recent Changes, Revisions, Trends, Surprise tabs) |
| Data as of date | Consensus cover-page timestamp "Jul-22-2026 10:12 PM GMT" [Q2 2026 Earnings Call transcript, Jul 22, 2026, embedded S&P Global Market Intelligence consensus block]; Recent Changes tab shows individual analyst revisions dated through 2026-07-23 [EstimatesReport.xls, Recent Changes tab] — both **post-date** the Q2 2026 print (reported Jul 22, 2026) and the Q2 2026 10-Q (filed Jul 23, 2026), so this is a current, not stale, consensus snapshot |
| Fiscal year basis | Calendar year; "Current Fiscal Year End: Dec-31-2026 \| FQ3 2026 Earnings Release Date: Oct-21-2026" [EstimatesReport.xls, Consensus tab] |
| Analyst count | Varies by line item: Revenue FY2026 44–46 estimates; EPS Normalized FY2026 34–40 estimates; EBITDA FY2026 19–22 estimates [EstimatesReport.xls, Consensus tab and Revisions tab] |
| Currency | US Dollar (USD), reported currency, today's spot rate for any converted line [EstimatesReport.xls, Consensus tab header] |
| Calendarization issue? | N — Tesla's fiscal year matches the calendar year; no reconciliation needed |

## 2. Management Guidance

Tesla does not issue point revenue, EBITDA, or EPS guidance. The Capital IQ "Guidance" tab confirms this from the vendor side: it carries populated entries only through roughly 2014–2015 and is empty for every year since — "Tesla does not issue point EPS/revenue guidance that CIQ tracks in this field" [EstimatesReport.xls, Guidance tab; corroborated in `00_earnings-data-triage.md`]. **Company does not provide formal point guidance for revenue, EBITDA, or EPS.** The only quantified forward figure management gives is a capex floor. All other forward commentary is qualitative, delivered in the Update-letter "Outlook" section and reaffirmed on the earnings calls.

| Metric | Period | Guidance | Type (Point / Range / Qualitative) | Source |
|---|---|---|---|---|
| Revenue | FY2026 | Not guided. Qualitative only: "Deliveries and deployments will be impacted by aggregate demand for our products, supply chain readiness and allocation decisions" | Qualitative | TSLA-Q2-2026-Update.pdf, Outlook section, p.10 |
| EBITDA / EBIT | FY2026 | Not guided. Qualitative only: "we expect our hardware-related profits to be accompanied by an acceleration of AI, software and fleet-based profits" (no time-bound number) | Qualitative | TSLA-Q2-2026-Update.pdf, Outlook section, p.10 |
| EPS | FY2026 | Not guided | — | — |
| Capex | FY2026 | "We continue to expect that CapEx for this year will be more than $25 billion" — reaffirmed from the Q1 2026 call ("our current expectation for 2025 -- 2026 is over $25 billion of CapEx") | Point (floor) | Q2 2026 Earnings Call transcript, Jul 22, 2026, prepared remarks (Vaibhav Taneja, CFO); Q1 2026 Earnings Call transcript, Apr 22, 2026, prepared remarks (Vaibhav Taneja, CFO) |
| Other KPIs — Operating expenses | FY2026+ | "Expect our operating expenses largely driven by R&D to continue to grow in 2026 and beyond" | Qualitative | Q2 2026 Earnings Call transcript, Jul 22, 2026, prepared remarks |
| Other KPIs — Energy gross margin | Long-term | "We believe the energy business should normalize at a gross margin rate in the mid- to low 20% range" | Range (long-term, not FY2026-specific) | Q2 2026 Earnings Call transcript, Jul 22, 2026, prepared remarks |
| Other KPIs — Robotaxi fleet | FY2026 | "We expect the ramp of the fleet to accelerate throughout the year, along with the expansion into new U.S. markets" | Qualitative | Q2 2026 Earnings Call transcript, Jul 22, 2026, prepared remarks |
| Other KPIs — Semi / Megapack 3 | 2026 | "Tesla Semi and Megapack 3 remain on schedule for production starting in 2026" | Qualitative (timing) | TSLA-Q2-2026-Update.pdf, Outlook section, p.10 |

No range guidance is given for any P&L line, so no midpoint calculation applies. The only quantified figure — capex — is a floor ("more than $25 billion"), not a range, so it is compared directly to consensus below rather than to a midpoint.

## 3. Guidance vs Consensus Table

Because Tesla gives no point guidance for revenue, EBITDA, or EPS, this table can only be built for capex, where a quantified management figure exists. The other rows are shown as "Not guided" per the partial-guidance rule in the template, rather than omitted, so the gap is visible.

| Metric | Period | Management Guidance | Street Consensus | Gap | Gap Direction |
|---|---|---|---|---:|---|
| Revenue | FY2026 | Not guided | $105,415.0mm (44–46 ests.) [EstimatesReport.xls, Consensus tab] | N/A | N/A — no guidance to compare |
| EBITDA | FY2026 | Not guided | $14,096.1mm (19–22 ests.) [EstimatesReport.xls, Consensus tab] | N/A | N/A — no guidance to compare |
| EPS (Normalized) | FY2026 | Not guided | $1.83 (34–40 ests.) [EstimatesReport.xls, Consensus tab] | N/A | N/A — no guidance to compare |
| Capex | FY2026 | >$25.0bn (floor) [Q2 2026 Earnings Call transcript, Jul 22, 2026] | $26,166.7mm ($26.17bn) [EstimatesReport.xls, Consensus tab, "Capital Expenditure" row] | +$1.17bn | Consensus above the guided floor — the Street already expects more capital spending than management's stated minimum, which is a headwind for the free-cash-flow line specifically |

## 3A. Alt-Data Cross-Check

No `data/TSLA/external/` folder exists in this pool [`00_earnings-data-triage.md`, Section 1]. This section is omitted — its absence is not a gap.

## 4. Estimate Revision Momentum Table

| Estimate | 90 Days Ago (3 months) | 60 Days Ago (2 months) | 30 Days Ago (1 month) | Current | Direction |
|---|---:|---:|---:|---:|---|
| Revenue (next Q — FQ3 2026) | $27,149.4mm | $26,855.5mm | $26,915.0mm | $27,420.6mm | Rising (net up vs. all three lookbacks) |
| EPS Normalized (next Q — FQ3 2026) | $0.55 | $0.54 | $0.54 | $0.46 | Falling — down 14.8% just in the last month |
| Revenue (current FY — FY2026) | $101,947.4mm | $102,284.8mm | $102,551.8mm | $105,415.0mm | Rising |
| EPS Normalized (current FY — FY2026) | $2.08 | $2.04 | $2.05 | $1.83 | Falling — down 10.7% in the last month |
| Revenue (next FY — FY2027, supplemental) | $119,267.6mm | $118,138.3mm | $118,526.9mm | $119,591.9mm | Rising modestly |
| EPS Normalized (next FY — FY2027, supplemental) | $2.53 | $2.53 | $2.52 | $2.24 | Falling — down 11.1% in the last month |

Source for all rows: [EstimatesReport.xls, Trends tab]. The pattern is consistent across every horizon: **revenue estimates have been raised while profit-per-share estimates have been cut**, and most of the EPS cut happened in just the last 30 days — after the Q2 2026 print (reported Jul 22, 2026; see Section 6).

## 5. Revision Breadth

| Metric | Up Revisions | Down Revisions | Net Revision Breadth | Period |
|---|---:|---:|---:|---|
| Revenue, FY2026 | 23 | 3 | +20 | Last month [EstimatesReport.xls, Revisions tab] |
| EBITDA, FY2026 | 5 | 7 | -2 | Last month [EstimatesReport.xls, Revisions tab] |
| EPS Normalized, FY2026 | 6 | 16 | -10 | Last month [EstimatesReport.xls, Revisions tab] |
| EPS (GAAP), FY2026 (supplemental) | 5 | 9 | -4 | Last month [EstimatesReport.xls, Revisions tab] |
| EBIT, FY2026 (supplemental) | 3 | 12 | -9 | Last month [EstimatesReport.xls, Revisions tab] |

Revenue is the only line with broad-based, net-positive revision breadth. Every profit line (EBITDA, EBIT, EPS Normalized, EPS GAAP) has more analysts cutting than raising, even one month after the Q2 print — the negative revision trend on profitability has not yet stabilized.

## 6. Historical Beat / Miss Pattern

| Period | Revenue Beat/Miss | EPS (Normalized) Beat/Miss | Magnitude | Notes |
|---|---|---|---:|---|
| Q3 2025 | Beat (+5.21%) | Miss (-10.71%) | Rev: Actual $28,095mm vs. Est. $26,703.6mm; EPS: Actual $0.50 vs. Est. $0.559 | [EstimatesReport.xls, Surprise tab] |
| Q4 2025 | Beat (+0.49%) | Beat (+11.11%) | Rev: Actual $24,901mm vs. Est. $24,779.9mm; EPS: Actual $0.50 vs. Est. $0.451 | [EstimatesReport.xls, Surprise tab] |
| Q1 2026 | Beat (+0.81%) | Beat (+17.14%) | Rev: Actual $22,387mm vs. Est. $22,208.1mm; EPS: Actual $0.41 vs. Est. $0.350 | Beat partly aided by a "$230 million benefit from warranty true-downs and some tariff relief" that did not repeat in Q2 [Q2 2026 Earnings Call transcript, Jul 22, 2026, prepared remarks; EstimatesReport.xls, Surprise tab] |
| Q2 2026 | Beat (+6.84%) | Miss (-38.89%) | Rev: Actual $28,236mm vs. Est. $26,428.5mm; EPS: Actual $0.33 vs. Est. $0.535; EBIT Actual $398mm vs. Est. $1,369.3mm (-70.9%) | Revenue beat coincided with a large profitability miss — automotive gross margin ex-credits fell sequentially from 19.2% to 16.3%, and energy gross margin fell from 39.5% to 20.4%, both flagged by the CFO as driven by non-repeating Q1 benefits plus a $240mm energy warranty true-up [Q2 2026 Earnings Call transcript, Jul 22, 2026, prepared remarks; EstimatesReport.xls, Surprise tab] |

The last four quarters show a consistent revenue-beat, margin-inconsistent pattern: four straight revenue beats, but EPS alternated miss-beat-beat-miss, with the two misses (Q3 2025, Q2 2026) both tied to margin compression rather than a volume shortfall.

## 7. Bar Assessment

**Bar is fair.** The picture is split by line item and neither half dominates cleanly enough to call it Low or High outright.

On revenue, the bar is arguably *higher* than it was: FY2026 consensus revenue has been revised up every lookback window (+20 net analyst revisions in the last month alone, from $102.6bn to $105.4bn), following four consecutive quarterly revenue beats (Section 6) — the Street has already extrapolated the recent beat streak into its model, so clearing revenue again requires a fifth straight beat against a raised number.

On profitability, the bar has just been *lowered* hard: FY2026 EPS Normalized consensus fell 10.7% in the last month (from $2.05 to $1.83) and the next-quarter (FQ3 2026) EPS Normalized estimate fell 14.8% (from $0.54 to $0.46), both cuts arriving in the two days after the Q2 2026 print missed EPS by -38.9% on a margin-driven basis (Section 6). But the revision breadth on every profit line — EBITDA, EBIT, EPS Normalized, EPS GAAP — is still net-negative even in the most recent month (Section 5), meaning analysts are still cutting, not yet done cutting: the estimate has come down, but the direction of travel has not turned, so a lower EPS bar does not by itself prove beat risk is elevated. Management's only quantified guidance point — capex "more than $25 billion" for FY2026 — is already undercut by a consensus of $26.17bn (Section 3), so the Street is modeling more spending than the stated floor, a modest incremental drag on the free-cash-flow read specifically.

Net: the earnings bar has been freshly reset for the known margin problem, but the reset is not yet complete, and the revenue bar it sits alongside has simultaneously gotten harder to clear. Neither a confident beat call nor a confident miss call is supported by the evidence available.
