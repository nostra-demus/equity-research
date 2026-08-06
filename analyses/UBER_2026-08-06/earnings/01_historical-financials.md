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
