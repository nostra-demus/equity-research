# Historical Financials — UBER

Reporting standard: US GAAP. Reporting currency: USD (millions, except per-share items). Fiscal year end: December 31. Uber is a Delaware corporation listed on the NYSE (US SEC filer) — US form names below (10-K, 10-Q) are the company's actual primary documents, not jurisdiction placeholders [FY25 10-K, p.1].

## 1. Annual Financial Table (3–5 years)

All figures in USD millions except EPS. FY0 = FY2025 (year ended Dec-31-2025), the latest audited annual filing [FY25 10-K].

| Metric | FY2021 | FY2022 | FY2023 | FY2024 | FY2025 | Trend |
|---|---:|---:|---:|---:|---:|---|
| Revenue | 17,455 | 31,877 | 37,281 | 43,978 | 52,017 | Decelerating |
| Revenue YoY % | — | +82.6% | +17.0% | +18.0% | +18.3% | Decelerating |
| Gross Profit [a] | 6,227 | 9,805 | 13,835 | 16,495 | 20,025 | Volatile |
| Gross Margin % | 35.7% | 30.8% | 37.1% | 37.5% | 38.5% | Volatile |
| EBITDA (reported) [b] | (2,932) | (885) | 1,933 | 3,536 | 6,312 | Accelerating |
| EBITDA Margin % | (16.8%) | (2.8%) | 5.2% | 8.0% | 12.1% | Accelerating |
| EBIT | (3,834) | (1,832) | 1,110 | 2,799 | 5,565 | Accelerating |
| EBIT Margin % | (22.0%) | (5.7%) | 3.0% | 6.4% | 10.7% | Accelerating |
| EPS (diluted) | $(0.28) | $(4.65) | $0.87 | $4.56 | $4.73 | Volatile |
| CFO | (445) | 642 | 3,585 | 7,137 | 10,099 | Decelerating |
| Capex | (298) | (252) | (223) | (242) | (336) | Stable |
| FCF (CFO − \|Capex\|) [c] | (743) | 390 | 3,362 | 6,895 | 9,763 | Decelerating |
| Working Capital [d] | (205) | 396 | 1,843 | 769 | 1,673 | Volatile |
| Net Debt (strict) [e] | 7,309 | 7,509 | 7,022 | 5,543 | 5,197 | Stable (declining) |
| Net Debt / EBITDA | NM (neg. EBITDA) | NM (neg. EBITDA) | 3.63x | 1.57x | 0.82x | Stable (declining) |

[a] "Gross Profit" is not a GAAP line item Uber discloses — it is Capital IQ's standardized Total Revenue minus its standardized Cost of Goods Sold [CIQ Financials_Annual.xls → Income Statement]. See §3 note on a data-quality artifact in the quarterly breakout of this line.
[b] "EBITDA (reported)" = GAAP Income from operations + D&A, Capital IQ standardized [CIQ Financials_Annual.xls → Income Statement]. This is NOT the company's own non-GAAP "Adjusted EBITDA" (see §4) — the two differ by ~$2.4bn in FY2025 because Adjusted EBITDA also adds back stock-based compensation and other items.
[c] FCF = CFO − |Capex|, per module standard (capex convention: absolute value of a negative cash-flow-statement figure) [MODULE_RULES.md §Calculation Standards].
[d] Working Capital = Total Current Assets − Total Current Liabilities [CIQ Financials_Annual.xls → Balance Sheet].
[e] Net Debt (strict) = Total Debt − Cash and Equivalents only (excludes short-term/long-term investments), computed by this agent per the module's strict definition, using Total Debt and Cash and Equivalents as they appear in [CIQ Financials_Annual.xls → Balance Sheet]. Capital IQ's own "Net Debt" field nets a broader, not-fully-decomposable cash/investment base and is NOT used here to avoid mixing bases — see CLAUDE §15 basis-labeling requirement.

Growth-rate and margin-delta arithmetic (computed via Python, shown for verification): Revenue YoY 2022 = (31,877−17,455)/17,455 = +82.6%; 2023 = (37,281−31,877)/31,877 = +17.0%; 2024 = (43,978−37,281)/37,281 = +18.0%; 2025 = (52,017−43,978)/43,978 = +18.3%. EBITDA margin bps change: 2022 +1,402bps; 2023 +796bps; 2024 +286bps; 2025 +409bps. EBIT margin bps change: 2022 +1,630bps; 2023 +870bps; 2024 +340bps; 2025 +430bps. Gross margin bps change: 2022 −492bps; 2023 +635bps; 2024 +40bps; 2025 +99bps.

FY2022's revenue jump (+82.6%) reflects post-pandemic Mobility-demand recovery plus a revenue-recognition/gross-vs-net presentation change in certain markets disclosed in that period's filings — it is a base-effect/classification event, not a repeatable growth rate; FY2023–FY2025 (+17.0% to +18.3%) is the more representative recent run-rate. FY2022's Gross Margin dip (30.8%, from 35.7% in FY2021) coincides with the same reclassification and is why the Gross Profit/Gross Margin row is marked Volatile rather than a clean trend.

## 2. TTM Snapshot

Latest TTM = twelve months ended Jun-30-2026 (Q3 FY25 + Q4 FY25 + Q1 FY26 + Q2 FY26). Prior TTM = twelve months ended Jun-30-2025 (Q3 FY24 + Q4 FY24 + Q1 FY25 + Q2 FY25). Figures computed by summing the four constituent quarters from the CIQ quarterly workbook; the latest-TTM revenue/EBITDA/EBIT figures independently tie out to the CIQ Annual workbook's own "LTM Jun-30-2026" column.

| Metric | Latest TTM | Prior TTM | Change | Evidence |
|---|---:|---:|---:|---|
| Revenue | 55,227 | 47,331 | +16.7% | [CIQ Financials_Quarterly.xls → Income Statement; cross-checked to CIQ Financials_Annual.xls → Income Statement, "LTM Jun-30-2026" column = 55,227] |
| EBITDA (reported) | 7,474 | 5,230 | +42.9% | [CIQ Financials_Quarterly.xls → Income Statement; cross-checked to CIQ Financials_Annual.xls "LTM" EBITDA = 7,474] |
| EBIT | 6,700 | 4,509 | +48.6% | [CIQ Financials_Quarterly.xls → Income Statement; cross-checked to CIQ Financials_Annual.xls "LTM" EBIT = 6,700] |
| EPS diluted | $4.58 | $5.91 [f] | −22.5% | [CIQ Financials_Annual.xls → Income Statement, "LTM" column = 4.58; prior-TTM computed from CIQ Financials_Quarterly.xls → Income Statement (NI to Common $12,626M ÷ average diluted shares 2,136.0M)] |
| CFO | 10,424 | 8,789 | +18.6% | [CIQ Financials_Quarterly.xls → Cash Flow; cross-checked to CIQ Financials_Annual.xls "LTM" CFO = 10,424] |
| Capex | (308) | (249) | +23.7% (higher spend) | [CIQ Financials_Quarterly.xls → Cash Flow; cross-checked to CIQ Financials_Annual.xls "LTM" capex = (308)] |
| FCF | 10,116 | 8,540 | +18.5% | Computed: CFO − \|Capex\| for each TTM period |
| Net debt at latest period-end [e] | $9,861M (as of Jun-30-2026) | $5,904M (as of Jun-30-2025) | +$3,957M | [CIQ Financials_Quarterly.xls → Balance Sheet: Total Debt 14,731 − Cash and Equivalents 4,870 (Jun-30-2026); Total Debt 12,342 − Cash and Equivalents 6,438 (Jun-30-2025)] |

[f] Prior-TTM diluted EPS is a computed figure (NI to Common ÷ average diluted share count across the four constituent quarters), not a number that appears verbatim in any single source, since Capital IQ only publishes one "LTM" column (for the most recent period). The simple sum of the four quarterly diluted-EPS figures gives $5.87, close to the $5.91 share-weighted figure; the small gap is the effect of quarter-to-quarter share-count changes on a simple sum. Both math paths point to the same conclusion: TTM diluted EPS fell materially even as EBITDA, EBIT, CFO, and FCF all grew double-digits — see §6.

Net debt is a point-in-time balance-sheet figure, not a TTM flow — the "change" column above compares two balance-sheet dates a year apart, not two summed TTM flows.

## 3. Latest Quarterly Trend Table (8 quarters)

Figures in USD millions except EPS and margins. Source: CIQ Financials_Quarterly.xls tabs (Income Statement, Cash Flow), cross-checked against the Q1 FY26 and Q2 FY26 10-Qs for the two most recent quarters.

| Metric | Q3'24 | Q4'24 | Q1'25 | Q2'25 | Q3'25 | Q4'25 | Q1'26 | Q2'26 | QoQ Trend | YoY vs Same Q |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---|---|
| Revenue | 11,188 | 11,959 | 11,533 | 12,651 | 13,467 | 14,366 | 13,203 | 14,191 | Decelerating | +12.2% (Q2'26 vs Q2'25) |
| Gross Margin % [g] | 33.4% | 49.7%† | 34.1% | 34.3% | 34.3% | 49.6%† | 39.2% | 39.3% | Volatile | +492bps (Q2'26 vs Q2'25) |
| EBITDA (reported) | 1,247 | 946 | 1,406 | 1,631 | 1,308 | 1,967 | 2,114 | 2,085 | Accelerating | +27.8% (Q2'26 vs Q2'25) |
| EBITDA Margin % | 11.1% | 7.9% | 12.2% | 12.9% | 9.7% | 13.7% | 16.0% | 14.7% | Accelerating | +180bps (Q2'26 vs Q2'25) |
| EPS (diluted) | $1.20 | $3.21 | $0.83 | $0.63 | $3.11 | $0.14 | $0.13 | $1.17 | Volatile | +85.7% (Q2'26 vs Q2'25) |

† **Data-quality flag on the two Q4 columns (Q4'24, Q4'25):** US filers do not report a standalone Q4 10-Q — Capital IQ derives Q4 as (audited full-year 10-K total) minus (sum of the three reported 10-Q quarters), which is standard practice and does not distort line items that are consistent between the annual and quarterly templates (confirmed: summed quarterly Operating Income exactly ties to each year's reported annual Operating Income). However, Capital IQ's "Cost of Goods Sold" field is built on a different cost-line classification in its "Reclassified" annual template than in its quarterly template (verified against the Q2 FY26 10-Q: GAAP "Cost of revenue" $7,815M + "Operations and support" $805M = CIQ's quarterly COGS of $8,620M for Q2'26 exactly, but the annual-template COGS does not reconcile the same way). Because Q4 is a plug (Annual − 9 months), this classification gap concentrates entirely into the Q4 column, producing an artificially elevated Q4 gross margin (≈49.6–49.7%) that does not reflect an actual quarterly step-change — it is a vendor-classification artifact, not a real one-quarter margin swing. EBITDA, EBIT, and EPS do not have this problem (their quarterly sums tie exactly to audited annual totals), so they are the more reliable margin/profitability read across quarters.

[g] Gross Margin % here uses the same CIQ-standardized Gross Profit definition as §1[a].

**Q1 FY2026 revenue deceleration:** Revenue fell 8.1% quarter-on-quarter from Q4'25 to Q1'26 — this is the normal seasonal Q4→Q1 pattern (see §5) and is not itself an alarm; the more relevant signal is that YoY growth cooled to +14.5% (Q1'26) and +12.2% (Q2'26), down from the +18–20% band that held through all of FY2025 — see §6.

**GAAP EPS volatility is driven by items below the operating line, not by operations:** Q3'25's $3.11 and Q2'26's $1.17 diluted EPS both include large unrealized mark-to-market gains on Uber's minority equity stakes (Gain (Loss) On Sale Of Invest. was +$1,471M in Q3'25 and +$1,612M in Q2'26 [CIQ Financials_Quarterly.xls → Income Statement]); Q4'25 and Q1'26's low EPS ($0.14, $0.13) reflect the same line item swinging to losses of $(1,602)M and $(1,474)M in those quarters. EBITDA and EBIT do not include this line item and show a much steadier climb across the same eight quarters.

## 4. Reported vs Adjusted Metrics

| Metric | Reported Value | Adjusted Value | Adjustment Amount | Adjustment Reason | Evidence |
|---|---:|---:|---:|---|---|
| EBITDA (FY2025) | $6,284M (GAAP Income from operations $5,565M + D&A $719M, per the company's own reconciliation table) | $8,730M (company-disclosed "Adjusted EBITDA") | +$2,446M | Adds back stock-based compensation $1,826M; legal, non-income-tax and regulatory reserve changes/settlements $564M; acquisition, financing and divestiture-related expenses $43M; restructuring and related charges $9M; loss on lease arrangement, net $2M; goodwill and asset impairments/loss on sale of assets, net $2M (sums to $2,446M, reconciling exactly to $6,284M + $2,446M = $8,730M) | [FY25 10-K, "Adjusted EBITDA reconciliation" table] |
| EBIT (FY2025) | $5,565M (GAAP Income from operations) | Not separately disclosed | n/a | Uber's disclosed non-GAAP measures are Adjusted EBITDA and Free Cash Flow; it does not present a distinct non-GAAP operating-income/EBIT figure | [FY25 10-K, Consolidated Statements of Operations; FY25 10-K Non-GAAP Measures section] |
| EPS (FY2025) | $4.73 diluted (GAAP) | Not disclosed | n/a | Company does not disclose an adjusted/non-GAAP EPS measure | [FY25 10-K, Consolidated Statements of Operations] |

**Material disclosure change flagged for downstream agents:** Beginning Q1 FY2026, Uber discontinued its segment-level "Segment Adjusted EBITDA" non-GAAP measure and replaced it with "Segment Operating Income" [Q1 FY26 10-Q; Q2 FY26 10-Q, both stating: "Beginning in the first quarter of 2026, we changed our segment operating performance measure from Segment Adjusted EBITDA to Segment Operating Income... Segment results for the comparable prior period have been recast to reflect these changes"]. At the consolidated level, the term "EBITDA" does not appear anywhere in the Q2 FY2026 10-Q outside that one segment-methodology sentence, and does not appear at all in either the Q1 FY2026 or Q2 FY2026 earnings-call transcripts in this data pool [Q1 FY26 10-Q; Q2 FY26 10-Q; Q1 FY26 earnings call, May-06-2026; Q2 FY26 earnings call, Aug-05-2026 — reviewed and confirmed absent]. FY2025's $8,730M Adjusted EBITDA [FY25 10-K] is therefore the last disclosed figure of its kind in this data pool; no consolidated non-GAAP profitability reconciliation is available for Q1 or Q2 FY2026. This is a comparability break, not a data gap this agent can fill — the `03_margin-drivers` and `06_earnings-quality` agents should treat any FY2026 "Adjusted EBITDA" figure quoted elsewhere (e.g., a sell-side note or press release not in this pool) with caution until its definition is confirmed against a primary source.

## 5. Quarterly Seasonality Table (last 3 fiscal years)

| Quarter | FY2023 Rev Share | FY2024 Rev Share | FY2025 Rev Share | Avg Rev Share | FY2023 EBITDA Margin | FY2024 EBITDA Margin | FY2025 EBITDA Margin |
|---|---:|---:|---:|---:|---:|---:|---:|
| Q1 | 23.7% | 23.0% | 22.2% | 23.0% | (0.6%) | 3.6% | 12.2% |
| Q2 | 24.8% | 24.3% | 24.3% | 24.5% | 5.8% | 9.1% | 12.9% |
| Q3 | 24.9% | 25.4% | 25.9% | 25.4% | 6.4% | 11.1% | 9.7% |
| Q4 | 26.7% | 27.2% | 27.6% | 27.2% | 8.6% | 7.9%‡ | 13.7%‡ |

No quarter breaches the >30% or <20% flag threshold, so this is not classified as a hard seasonality flag — but there is a consistent, real pattern: Q1 is the smallest revenue quarter and Q4 the largest in all three fiscal years shown (a ~4.2-point spread between Q1's 23.0% average share and Q4's 27.2% average share), consistent with Mobility/Delivery demand being seasonally lower in Q1 (post-holiday) and higher in Q4 (holiday season, year-end travel). ‡ Q4 EBITDA margin figures should be read alongside the §3 Q4 gross-margin caveat — EBITDA itself is not subject to the same classification-plug artifact (its quarterly sums tie exactly to audited annual totals), so the Q4 EBITDA margin figures above are usable as reported, unlike Q4 gross margin.

## 6. Key Trend Summary

Revenue growth is decelerating from a stable ~17–18% annual run-rate in FY2023–FY2025 to +14.5% (Q1 FY2026) and +12.2% (Q2 FY2026) year-on-year in the two most recent quarters [CIQ Financials_Quarterly.xls → Income Statement] — FY2022's +82.6% print was a post-pandemic recovery and revenue-recognition-classification event, not a repeatable base rate. Margins are expanding: EBITDA margin has risen every year for five straight years, from (16.8%) in FY2021 to 12.1% in FY2025 (+409bps in FY2025 alone) [FY25 10-K; CIQ Financials_Annual.xls], and the two most recent quarters (16.0% and 14.7% EBITDA margin) sit 310–180bps above their year-ago comparators — profitability is expanding faster than revenue is decelerating so far. There is real but moderate seasonality: Q1 is consistently the smallest revenue quarter (~23.0% of the year) and Q4 the largest (~27.2%), a pattern that has held in all three fiscal years examined, though it does not cross the module's >30%/<20% hard-flag threshold. The clearest inflection points in the last five years are: (1) FY2022→FY2023, when Uber's cash flow from operations turned durably positive (from $(445)M to $642M, then to $3,585M in FY2023) and free cash flow followed the same path — a structural shift from cash-burn to cash-generation; and (2) a leverage reversal after Jun-30-2025: net debt (strict basis) had declined every year from FY2022's $7,509M to FY2025's $5,197M (Net Debt/EBITDA falling from 3.63x to 0.82x), but then rose to $9,861M by Jun-30-2026 (Net Debt/EBITDA back up to ~1.32x on an LTM EBITDA basis), driven by $6,904M of trailing-twelve-month share buybacks against $10,424M of trailing CFO [CIQ Financials_Quarterly.xls → Cash Flow, Balance Sheet] — a capital-allocation shift toward returning cash to shareholders that downstream balance-sheet/survival work should pick up. A third, non-obvious finding: GAAP diluted EPS is not tracking the operating trend at all — TTM diluted EPS actually fell 22.5% (from $5.91 to $4.58) even as TTM EBITDA rose 42.9%, TTM EBIT rose 48.6%, and TTM FCF rose 18.5% [see §2], because GAAP net income is dominated in several recent quarters by large, non-operating mark-to-market swings on Uber's minority equity stakes (e.g., +$1,612M in Q2'26, −$1,602M in Q4'25) and, in FY2024, a one-off $6.0B deferred-tax valuation-allowance release [FY25 10-K; CIQ Financials_Quarterly.xls → Income Statement] — the operating-earnings trend (revenue, EBITDA, EBIT, FCF) is the more representative read of the business than the reported EPS line.

## 7. Citations

[1] Uber Technologies, Inc. Form 10-K, filed Feb-13-2026 (fiscal year ended Dec-31-2025) — Consolidated Statements of Operations, Balance Sheets, Statements of Cash Flows, and "Adjusted EBITDA reconciliation" table in the Non-GAAP Financial Measures section
[2] Uber Technologies Inc NYSE:UBER Financials_Annual.xls (Capital IQ export) → Income Statement tab, annual series FY2016–FY2025 + LTM Jun-30-2026 column
[3] Uber Technologies Inc NYSE:UBER Financials_Annual.xls → Balance Sheet tab, annual series FY2016–FY2025 + Jun-30-2026 column
[4] Uber Technologies Inc NYSE:UBER Financials_Annual.xls → Cash Flow tab, annual series FY2016–FY2025 + LTM Jun-30-2026 column
[5] Uber Technologies Inc NYSE:UBER Financials_Quarterly.xls → Income Statement tab, quarterly series Q1 FY2018–Q2 FY2026
[6] Uber Technologies Inc NYSE:UBER Financials_Quarterly.xls → Cash Flow tab, quarterly series Q1 FY2018–Q2 FY2026
[7] Uber Technologies Inc NYSE:UBER Financials_Quarterly.xls → Balance Sheet tab, quarterly series Q1 FY2018–Q2 FY2026
[8] Uber Technologies, Inc. Form 10-Q, filed May-06-2026 (Q1 FY2026, period ended Mar-31-2026)
[9] Uber Technologies, Inc. Form 10-Q, filed Aug-05-2026 (Q2 FY2026, period ended Jun-30-2026)
[10] Uber Technologies, Inc., Q1 2026 Earnings Call transcript, May-06-2026 (verbatim CIQ transcript)
[11] Uber Technologies, Inc., Q2 2026 Earnings Call transcript, Aug-05-2026 (verbatim CIQ transcript)

All annual and quarterly growth rates, margin percentages, basis-point deltas, TTM sums, FCF, and Net Debt/EBITDA figures in this report were computed by an executed Python script from the source figures cited above (not derived mentally); the script and its output were reviewed before being transcribed into these tables.
