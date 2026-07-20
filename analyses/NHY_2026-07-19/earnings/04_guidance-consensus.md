# Guidance & Consensus — NHY

## 1. Consensus Data Metadata

| Field | Value |
|---|---|
| Source | Capital IQ (S&P Global Market Intelligence) estimates export — `NorskHydroASAOBNHYEstimatesReport.xls` (Consensus, Trends, Revisions, Recent Changes, Surprise, Guidance tabs). Two copies of this workbook are in the pool (`...Report.xls` and `...Report (1).xls`); they are treated as one source per the earnings data triage, using the primary file |
| Data as of date | **2026-07-15** — the most recent dated entry in the Recent Changes tab (a broker revision log dated 2026-07-15 whose "Consensus After" values tie out exactly to the Consensus/Trends tabs' "Current" column, e.g. FY2026 EPS Normalized consensus after = 8.80, matching Trends "Current" = 8.8). **This corrects the earnings-data-triage (`00_earnings-data-triage.md`), which dated the Consensus tab "as of Apr-29-2026 7:13 AM GMT."** That Apr-29 timestamp belongs to the earnings-call transcript's own auto-generated cover page (an S&P estimates snapshot taken at call time), not to the live Consensus/Trends/Revisions tabs, which roll forward continuously — the 2026-07-15 revision log is the most current dated evidence of when the "Current" consensus column was last touched. This is a bad-extraction correction (CLAUDE.md §20), flagged rather than silently overridden |
| Fiscal year basis | FY ends 31-Dec. FY2026 = year ending 31-Dec-2026. Next print is FQ2 2026 (quarter ended 30-Jun-2026), release date **22-Jul-2026** — three days after this report's as-of date of 19-Jul-2026 [Guidance/Consensus/Trends tab headers, "FQ2 2026 Earnings Release Date: Jul-22-2026"] |
| Analyst count | FY2026 EPS Normalized / EBITDA / Revenue: 12–15 analysts still in consensus depending on revision window [Revisions tab, "# of Analysts still in Consensus," FY2026 column]. Target price: 17 analysts (OB:NHY, NOK) [Consensus tab] |
| Currency | Norwegian Krone (NOK) — revenue/EBITDA/EBIT in NOK millions, EPS in NOK per share. A separate OTCPK:NHYD.Y (USD) ADR line exists in the export with far fewer contributing analysts (1–3); this report uses the NOK-denominated OB:NHY consensus throughout, matching the company's own reporting currency |
| Calendarization issue? | N — fiscal year matches the calendar year (31-Dec year end); no reconciliation needed |

**Second reconciliation flag (CLAUDE.md §4/§20):** the FQ1 2026 earnings-call transcript's own auto-generated cover page states an EPS Normalized "SURPRISE" of 24.70% and a revenue "SURPRISE" of 1.46% for the quarter just reported. Recomputing directly from the Surprise tab's own stored actual/estimate pair (actual EPS Normalized 2.07 vs estimate 1.53983 → +34.4%; actual revenue 50,388 vs estimate 50,242.68 → +0.29%) — both of which tie to the primary filing (`first-quarter-report-2026.pdf`, Key figures: "Adjusted earnings per share 2.07" and Condensed consolidated statements of income: "Revenue 50,388") — gives materially different surprise percentages than the transcript cover page states. The filing-anchored actuals are used throughout this report; the transcript's auto-stat block is flagged as internally inconsistent with the workbook it is drawn from, not overridden silently.

## 2. Management Guidance

Norsk Hydro does not issue formal point or range guidance for group revenue, EBITDA, or EPS. Formal quantitative guidance is limited to capital expenditure and one segment-specific EBITDA range; beyond that, management gives quarter-over-quarter qualitative and partially-quantified segment bridges each quarter.

| Metric | Period | Guidance | Type (Point / Range / Qualitative) | Source |
|---|---|---|---|---|
| Capital Expenditure (total) | FY2026 | NOK −13,500 million (≈NOK 13.5bn spend) | Point | [`NorskHydroASAOBNHYEstimatesReport.xls`, Guidance tab, guidance dated 2026-02-13 — issued alongside FQ4 2025 results] |
| Maintenance Capital Expenditure | FY2026 | NOK −9,000 million | Point | [Guidance tab, dated 2026-02-13] |
| Metal Markets — Commercial Adjusted EBITDA (excl. currency & inventory valuation effects) | FY2026 | NOK 200–400 million (midpoint NOK 300 million) | Range | [`nhy-presentation-q1-2026.pdf`, "Outlook Q2 2026" summary slide, Metal Markets] — reiterated unchanged from the figure originally given at FQ4 2025 results |
| Revenue / EBITDA / EPS (group) | FY2026 | Not given | — | Company does not provide formal group-level revenue/EBITDA/EPS guidance [absence confirmed across Guidance tab, Q1 2026 report, Q1/Q4 2026 transcripts, Q1 2026 presentation] |
| Segment quarter-over-quarter bridge items (5 segments) | Q2 2026 vs Q1 2026 | Qualitative directional commentary plus several bounded NOK/USD cost-and-price ranges (below) | Qualitative + partial quantitative | [`nhy-presentation-q1-2026.pdf`, "Outlook Q2 26 vs Q1 26," slides 15–19] |
| Extrusion market full-year demand growth | FY2026 | Europe ~1%; North America ~1% (both revised down from the January view, front-loaded weakness in Q1/Q2, recovery expected H2) | Qualitative | [FQ1 2026 transcript, prepared remarks] |

**Q2 2026 segment bridge detail** (all vs Q1 2026 unless noted), the only source of forward quantification beyond capex:
- **Bauxite & Alumina:** positive LNG price effect NOK 50–150m; lower alumina price (negative, unquantified); higher fixed cost from seasonality, estimated NOK 300–400m; higher raw material costs, NOK 100–200m [slide 15]
- **Aluminium Metal:** ~67% of Q2 2026 primary production priced at USD 3,000/mt; ~51% of premiums affecting Q2 booked at USD ~571/mt; realized premium expected USD 530–580/mt; lower sales volumes due to the Middle East situation; higher energy cost NOK 150–250m and higher carbon costs NOK 200–300m; stable fixed cost [slide 16]
- **Metal Markets:** continued strengthening recycling margins; normalizing results from sourcing and trading activities; continued volatile trading and currency effects [slide 17]
- **Extrusions** (vs Q2 2025): higher sales volumes; stabilization of overall margins; continued strong U.S. recycling margins [slide 18]
- **Energy:** low reservoir levels and historically low snow levels; expect lower production from drier hydrological conditions; seasonally lower prices; volume and price uncertainty [slide 19]

## 3. Guidance vs Consensus Table

| Metric | Period | Management Guidance | Street Consensus | Gap | Gap Direction |
|---|---|---|---|---:|---|
| Capital Expenditure (total) | FY2026 | NOK −13,500m | NOK −14,377.4m (current, as of 2026-07-15) [`...Report.xls`, Guidance tab, "Actual/Latest Consensus Estimate"] | −877.4m | Street models ~6.5% **more** capex spend than guided — consensus above (more negative than) the guided figure, and the gap has widened since the Feb-2026 guidance date (it was −340.8m at the time guidance was issued) |
| Metal Markets Commercial Adj. EBITDA | FY2026 | NOK 200–400m (mid 300m) | Not separately tracked as a standalone consensus line in this export (too granular a company-specific segment metric for the standard CIQ template) | N/A | Not assessable — no comparable consensus line |
| Revenue (group) | FY2026 | No formal guidance | NOK 213,365.5m (current) | N/A | No guidance exists to compare against |
| EBITDA (group) | FY2026 | No formal guidance | NOK 36,330.5m (current) | N/A | No guidance exists to compare against |
| EPS Normalized (Adjusted EPS) (group) | FY2026 | No formal guidance | NOK 8.80 (current) | N/A | No guidance exists to compare against |

Because the company gives no group P&L guidance, the only clean guidance-vs-consensus read available is capex — where the Street currently models spend above management's plan. For revenue/EBITDA/EPS, Section 4's revision-momentum trend is the only usable read of whether the market's own bar is moving up or down.

*(Section 3A — Alt-Data Cross-Check — omitted. No files exist under `data/NHY/external/`; the earnings-data-triage confirms this. Absence noted, not treated as a gap.)*

## 4. Estimate Revision Momentum Table

All figures NOK; revenue/EBITDA in NOK millions, EPS in NOK per share. "90/60/30 Days Ago" mapped to the Trends tab's "3 months ago / 2 months ago / 1 month ago" snapshots (the workbook does not carry exact day-counts).

| Estimate | 90 Days Ago | 60 Days Ago | 30 Days Ago | Current (2026-07-15) | Direction |
|---|---:|---:|---:|---:|---|
| Revenue (next Q, FQ2 2026) | 53,665.8 | 54,248.1 | 54,589.4 | 55,954.2 | Rising |
| EPS Normalized (next Q, FQ2 2026) | 1.95 | 2.20 | 2.21 | 2.01 | Falling — cut in the most recent month, right before the 22-Jul print |
| EBITDA (next Q, FQ2 2026) | 8,527.8 | 9,584.2 | 9,486.4 | 8,581.8 | Falling — cut ~9.5% in the most recent month |
| Revenue (next FY, FY2026) | 209,746.5 | 212,808.8 | 214,889.6 | 213,365.5 | Rising overall (vs 90 days ago), but pulled back in the most recent month |
| EPS Normalized (next FY, FY2026) | 7.78 | 9.13 | 9.31 | 8.80 | Rising overall (vs 90 days ago), but cut ~5.5% in the most recent month |
| EBITDA (next FY, FY2026) | 34,502.9 | 37,627.9 | 37,916.7 | 36,330.5 | Rising overall (vs 90 days ago), but cut ~4.2% in the most recent month |

[Source for all rows: `NorskHydroASAOBNHYEstimatesReport.xls`, Trends tab, OB:NHY (NOK) — EPS Normalized, Revenue, EBITDA blocks]

**Read:** the 90-day trend is a large upward re-rating — the Street raised FY2026 numbers meaningfully after digesting the FQ1 2026 beat (reported 29-Apr-2026). But nearly all of that move has reversed in just the last 30 days, right into the FQ2 2026 print (release 22-Jul-2026, three days after this report's as-of date). Revenue held up better than profit — the FQ2 2026 top-line estimate kept rising into the print while EPS/EBITDA were both cut — consistent with the company's own Q2 bridge (higher energy/carbon/raw-material costs, lower Aluminium Metal volumes) pressuring margins even where volumes/prices are not falling.

## 5. Revision Breadth

Net Revision Breadth = Upward revisions − Downward revisions (analyst count, not weighted by size).

| Metric | Up Revisions | Down Revisions | Net Revision Breadth | Period |
|---|---:|---:|---:|---|
| Revenue next FY (FY2026) | 1 | 7 | −6 | Last Month |
| Revenue next FY (FY2026) | 8 | 3 | +5 | Last 3 Months |
| EBITDA next FY (FY2026) | 3 | 9 | −6 | Last Month |
| EBITDA next FY (FY2026) | 11 | 3 | +8 | Last 3 Months |
| EPS Normalized next FY (FY2026) | 2 | 8 | −6 | Last Month |
| EPS Normalized next FY (FY2026) | 9 | 2 | +7 | Last 3 Months |
| EPS Normalized next Q (FQ2 2026) | 0 | 4 | −4 | Last Month |
| Revenue next Q (FQ2 2026) | 3 | 1 | +2 | Last Month |

[Source: `NorskHydroASAOBNHYEstimatesReport.xls`, Revisions tab, Revenue / EBITDA / EPS Normalized blocks]

Breadth has flipped sign inside the last month: the 3-month window is broadly positive (more analysts raising than cutting FY2026 numbers), but the 1-month window — which lands right ahead of the FQ2 2026 print — is sharply negative for FY2026 EPS/EBITDA/Revenue and for FQ2 2026 EPS specifically (zero analysts raised FQ2 EPS in the last month; four cut it). The one exception is FQ2 2026 revenue itself, where the last-month count is still net positive (3 up, 1 down) even as EPS and EBITDA for the same quarter were cut — a margin-specific, not demand-specific, reset.

## 6. Historical Beat / Miss Pattern

Last four reported quarters, oldest to most recent. EPS Normalized is the company's own "Adjusted earnings per share" metric (confirmed by reconciling CIQ's FQ1 2026 actual of 2.07 to the filing's "Adjusted earnings per share ¹⁾... 2.07" line) — distinct from reported/GAAP EPS (Q1 2026 reported EPS was NOK 2.16 per the filing's condensed income statement).

| Period | Revenue Beat/Miss | EPS Beat/Miss | Magnitude | Notes |
|---|---|---|---:|---|
| FQ2 2025 (Jun-2025) | Beat | Beat | Rev +3.3% / EPS +15.1% | Actual revenue NOK 53,116m vs consensus NOK 51,418.7m; actual EPS Normalized NOK 1.68 vs consensus NOK 1.46 |
| FQ3 2025 (Sep-2025) | Beat | Miss | Rev +6.0% / EPS −12.8% | Actual revenue NOK 50,546m vs consensus NOK 47,701.0m; actual EPS Normalized NOK 1.02 vs consensus NOK 1.17 |
| FQ4 2025 (Dec-2025) | Beat | Miss | Rev +1.5% / EPS −6.8% | Actual revenue NOK 47,215m vs consensus NOK 46,504.4m; actual EPS Normalized NOK 0.69 vs consensus NOK 0.74 |
| FQ1 2026 (Mar-2026) | Beat | Beat | Rev +0.3% / EPS +34.4% | Actual revenue NOK 50,388m vs consensus NOK 50,242.7m [`first-quarter-report-2026.pdf`, Condensed consolidated statements of income]; actual Adjusted EPS NOK 2.07 vs consensus NOK 1.54 [`first-quarter-report-2026.pdf`, Key figures — "Adjusted earnings per share... 2.07"]. See the Section 1 reconciliation flag: the recomputed +34.4% EPS / +0.3% revenue surprise differs from the transcript cover page's own stated +24.70% / +1.46% |

[Source for FQ2–FQ4 2025: `NorskHydroASAOBNHYEstimatesReport.xls`, Surprise tab, Fiscal Quarters section; cross-checked against the FQ1 2026 and FQ4 2025 transcript cover pages]

Revenue has beaten Street consensus in all four of the last four quarters, though by shrinking, then re-widening, margins (+3.3%, +6.0%, +1.5%, +0.3%). EPS is more mixed — two beats bracketing two misses, with the most recent quarter's beat unusually large. There is no clean pattern of the company consistently sandbagging or consistently missing; the last print (FQ1 2026) was the strongest EPS beat of the four.

## 7. Bar Assessment

**Bar is low.**

FY2026 EPS Normalized, EBITDA, and revenue consensus were all cut in the 30 days immediately before this report's as-of date (2026-07-15), and the cut is broadest and clearest at exactly the metric and quarter that matters most right now: zero analysts raised FQ2 2026 EPS in the last month while four cut it, and FQ2 2026 EBITDA fell ~9.5% in the same window — this is the module's own low-bar trigger ("estimates have been cut recently"), landing just three days before the 22-Jul-2026 print. The cuts track the company's own Q2 bridge commentary (higher energy/carbon/raw-material costs, lower Aluminium Metal volumes from the Middle East situation) rather than looking like an independent, unexplained Street markdown — but FQ2 2026 revenue itself was still revised net-upward in the same window (3 up, 1 down), so the reset is margin-specific, not a broad-based demand cut, which argues the bar has been lowered on costs the Street may be over-extrapolating rather than on volumes. The one guidance-comparable metric available (FY2026 capex) shows the Street modeling ~6.5% more spend than management guided, which — if capex undershoots toward the company's own NOK 13,500m plan — is a second, independent way the setup could beat on free cash flow even without an EBITDA beat. This bar read is not provisional under the stale-consensus guard: the consensus data-as-of date (2026-07-15) sits after the last reported quarter (FQ1 2026, 29-Apr-2026) and only three days before the next print, so it is current, not stale.
