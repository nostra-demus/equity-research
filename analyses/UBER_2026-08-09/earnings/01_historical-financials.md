# Historical Financials — UBER

Reporting standard: US GAAP. Reporting currency: USD, in millions unless noted. Fiscal year end: December 31 (calendar year) [FY25 10-K, cover page].

## 1. Annual Financial Table (5 years, FY2021–FY2025)

All figures in $ millions except per-share items. "EBITDA" below is the unadjusted measure (income from operations + total depreciation & amortization) — it is NOT Uber's company-defined "Adjusted EBITDA," which is shown separately in Section 4.

| Metric | FY2021 | FY2022 | FY2023 | FY2024 | FY2025 | Trend |
|---|---:|---:|---:|---:|---:|---|
| Revenue | 17,455 | 31,877 | 37,281 | 43,978 | 52,017 | Stable |
| Revenue YoY % | n/m | +82.6% | +17.0% | +18.0% | +18.3% | Stable |
| Gross Profit* | 6,227 | 9,805 | 13,835 | 16,495 | 20,025 | Stable |
| Gross Margin %* | 35.7% | 30.8% | 37.1% | 37.5% | 38.5% | Stable |
| EBITDA (unadjusted) | (2,932) | (885) | 1,933 | 3,536 | 6,312 | Inflecting |
| EBITDA Margin % | (16.8)% | (2.8)% | 5.2% | 8.0% | 12.1% | Inflecting |
| EBIT | (3,834) | (1,832) | 1,110 | 2,799 | 5,565 | Inflecting |
| EBIT Margin % | (22.0)% | (5.7)% | 3.0% | 6.4% | 10.7% | Inflecting |
| EPS (diluted, GAAP) | (0.28) | (4.65) | 0.87 | 4.56 | 4.73 | Volatile |
| CFO | (445) | 642 | 3,585 | 7,137 | 10,099 | Stable |
| Capex | (298) | (252) | (223) | (242) | (336) | Stable |
| FCF (CFO – Capex) | (743) | 390 | 3,362 | 6,895 | 9,763 | Stable |
| Working Capital (Total Current Assets − Total Current Liabilities) | (205) | 396 | 1,843 | 769 | 1,673 | Volatile |
| Net Debt (strict: total debt − cash & equivalents) | 7,309 | 7,509 | 7,022 | 5,543 | 5,197 | Stable |
| Net Debt / EBITDA (unadjusted) | NM (EBITDA<0) | NM (EBITDA<0) | 3.63x | 1.57x | 0.82x | Inflecting |

*Data quality note on Gross Profit / Gross Margin: Uber's GAAP income statement does not report a "gross profit" line — it discloses five cost/opex categories (cost of revenue excl. D&A; operations & support; sales & marketing; R&D; G&A) [FY25 10-K, Item 8, Consolidated Statements of Operations]. The Gross Profit/Margin rows above are Capital IQ's own construction (Revenue less CIQ's "Cost of Goods Sold" classification, which nets cost of revenue and operations & support) [CIQ Financials_Annual.xls → Income Statement]. See Section 3 for a flagged inconsistency in this classification across quarterly vs. annual-sourced columns.

**Growth math check (spot-check):** FY2025 Revenue YoY = (52,017 − 43,978) / 43,978 = 18.28% ≈ 18.3%. FY2025 EBITDA margin = 6,312 / 52,017 = 12.14% ≈ 12.1%. Both computed by an executed Python script (see method note in Section 7).

**Margin change (bps):** EBITDA margin FY2021→FY2022 +1,402bps; FY2022→FY2023 +796bps; FY2023→FY2024 +286bps; FY2024→FY2025 +409bps. Gross margin FY2024→FY2025 +99bps; FY2023→FY2024 +40bps [computed from CIQ Financials_Annual.xls → Income Statement].

**FCF definition:** FCF = CFO − |Capex| (capex is reported as a negative cash outflow in the source; absolute value used) [CIQ Financials_Annual.xls → Cash Flow].

**Net debt definition (strict basis, per CLAUDE.md §15):** Total debt (long-term debt + current portion of long-term debt + short-term borrowings, excluding operating lease liabilities) minus cash and cash equivalents only (short-term investments excluded). FY2025: Total debt $12,302M − Cash $7,105M = $5,197M [FY25 10-K, Consolidated Balance Sheets; CIQ Financials_Annual.xls → Balance Sheet]. Note: Capital IQ's own "Net Debt" export line reports different (lower) figures in most years (e.g., $76M for FY2025 vs. $5,197M strict here) — its exact netting basis could not be reproduced from the disclosed balance-sheet components in this pool and is not used in this report; it is flagged here rather than silently used or discarded.

## 2. TTM Snapshot

TTM = four quarters ended Jun-30-2026 (latest). Prior TTM = four quarters ended Jun-30-2025.

| Metric | Latest TTM (Jul-25–Jun-26) | Prior TTM (Jul-24–Jun-25) | Change | Evidence |
|---|---:|---:|---:|---|
| Revenue | 55,227 | 47,331 | +16.7% | [CIQ Financials_Annual.xls → Income Statement, LTM Jun-30-2026 column; CIQ Financials_Quarterly.xls → Income Statement, Q3 FY24–Q2 FY26 sum] |
| EBITDA (unadjusted) | 7,474 | 5,230 | +42.9% | [same sources] |
| EBIT | 6,700 | 4,509 | +48.6% | [same sources] |
| EPS diluted (GAAP) | 4.58 (CIQ LTM calc); 4.55 (sum of 4 quarterly EPS) | 5.87 (sum of 4 quarterly EPS) | n/m — prior-TTM EPS was inflated by one-time items concentrated in Q3 FY24/Q4 FY24 (see Section 6) | [CIQ Financials_Annual.xls → Income Statement, LTM column; CIQ Financials_Quarterly.xls → Income Statement] |
| CFO | 10,424 | 8,789 | +18.6% | [CIQ Financials_Annual.xls → Cash Flow, LTM column; quarterly sum] |
| Capex | (308) | (249) | +23.7% | [same] |
| FCF | 10,116 | 8,540 | +18.5% | [computed: CFO − |Capex|] |
| Net debt at latest period-end (strict) | 9,861 (as of Jun-30-2026) | 5,904 (as of Jun-30-2025) | +$3,957M (+67.0%) | [Q2 FY26 10-Q, Condensed Consolidated Balance Sheets; CIQ Financials_Quarterly.xls → Balance Sheet] |

Note: Net debt is a point-in-time balance-sheet metric, not a TTM flow metric — the "Latest"/"Prior" columns above are balance-sheet dates (period-end), not summed flows.

**Biggest single number in this table:** strict net debt rose $3.96B (+67%) in one year, driven by a large H1 FY26 debt raise ($3,997M long-term debt issued in Q2 FY26 alone) funding an accelerated buyback program (LTM repurchases of common stock: $6,904M vs. FY2025 full-year $6,523M) [CIQ Financials_Quarterly.xls → Cash Flow; CIQ Financials_Annual.xls → Cash Flow].

## 3. Latest Quarterly Trend Table (8 quarters, Q3 FY2024–Q2 FY2026)

| Metric | Q3 FY24 | Q4 FY24 | Q1 FY25 | Q2 FY25 | Q3 FY25 | Q4 FY25 | Q1 FY26 | Q2 FY26 | QoQ Trend | YoY vs Same Q |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---|---|
| Revenue | 11,188 | 11,959 | 11,533 | 12,651 | 13,467 | 14,366 | 13,203 | 14,191 | +7.5% QoQ (Q2 FY26) | +12.2% YoY (Q2 FY26) |
| Gross Margin %* | 33.4% | 49.7% | 34.1% | 34.3% | 34.3% | 49.6% | 39.2% | 39.3% | See data-quality note below | n/a |
| EBITDA (unadjusted) | 1,247 | 946 | 1,406 | 1,631 | 1,308 | 1,967 | 2,114 | 2,085 | −1.4% QoQ | +27.8% YoY |
| EBITDA Margin % | 11.1% | 7.9% | 12.2% | 12.9% | 9.7% | 13.7% | 16.0% | 14.7% | −130bps QoQ | +180bps YoY |
| EPS (diluted, GAAP) | 1.20 | 3.21 | 0.83 | 0.63 | 3.11 | 0.14 | 0.13 | 1.17 | See note below | −7bps n/m (one-time-item driven) |

*Data-quality flag (Gross Margin %): the Q4 FY24 and Q4 FY25 columns jump to ~49.6–49.7% while every Q1–Q3 column sits at 33–39%. This is a Capital IQ classification artifact, not a real quarterly margin inflection: Uber's actual filed FY2024 "Cost of revenue, exclusive of D&A" was $26,651M (60.6% of revenue) and FY2025 was $31,338M (60.3% of revenue) [FY25 10-K, Item 8], implying a revenue-less-cost-of-revenue-alone margin of ~39.4%/39.7% for the full year — much closer to the Q1–Q3 pattern than the Q4-only spike. The FY24 income-statement export is also flagged "Reclassified" for the Q4 FY24 column in the source data [CIQ Financials_Quarterly.xls → Income Statement, Restatement Type row]. Working hypothesis: CIQ's annual/10-K-sourced columns classify "Cost of Goods Sold" as cost-of-revenue only, while its 10-Q-sourced quarterly columns also fold in "Operations and support" expense — an inconsistent basis within the same export. **This is not proven from available data as to the exact vendor mechanism** and is flagged rather than silently used.

EPS volatility note: the Q4 FY24 EPS spike (3.21, +160% QoQ) and continued elevated FY24/FY25 GAAP EPS coincide with a large non-cash income-tax benefit — FY2024 income tax expense was a $5,758M benefit and FY2025 a $4,346M benefit, both consistent with release of a deferred-tax-asset valuation allowance (balance-sheet Deferred Tax Assets, LT: $170M FY2023 → $6,171M FY2024 → $10,951M FY2025) [FY25 10-K, Item 8, Income Statement and Balance Sheet; CIQ Financials_Annual.xls → Income Statement/Balance Sheet]. This is a hygiene flag for the earnings-quality agent (`06_earnings-quality`), not a full causal claim — the tax note itself is not in this pool.

QoQ / YoY revenue detail (all 8 quarters): Q3 FY24 +4.6% QoQ / +20.4% YoY; Q4 FY24 +6.9% / +20.4%; Q1 FY25 −3.6% / +13.8%; Q2 FY25 +9.7% / +18.2%; Q3 FY25 +6.5% / +20.4%; Q4 FY25 +6.7% / +20.1%; Q1 FY26 −8.1% / +14.5%; Q2 FY26 +7.5% / +12.2% [computed from CIQ Financials_Quarterly.xls → Income Statement].

**Most important recent-quarter finding:** Q2 FY26 revenue growth decelerated to +12.2% YoY (from a ~20% run rate in the four quarters before it) even as Gross Bookings grew +24% YoY in the same quarter. The gap is explained by a disclosed one-time item: "Mobility business model changes in the United Kingdom... negatively impacted revenue by $1.1 billion" [Q2 FY26 10-Q, MD&A, Revenue discussion]. Labelled as a one-time revenue-recognition change, not a demand slowdown — reported revenue growth understates underlying platform activity in this quarter.

Sources: [CIQ Financials_Quarterly.xls → Income Statement, Q3 FY24–Q2 FY26 columns]; [Q2 FY26 10-Q, Condensed Consolidated Statements of Operations, filed Aug-05-2026]; [Q1 FY26 10-Q, filed May-06-2026].

## 4. Reported vs Adjusted Metrics

| Metric | Reported Value (FY2025) | Adjusted Value (FY2025) | Adjustment Amount | Adjustment Reason | Evidence |
|---|---:|---:|---:|---|---|
| EBITDA | 6,312 (unadjusted: EBIT + total D&A) | 8,730 (company-defined "Adjusted EBITDA") | +2,418 | Adds back stock-based comp ($1,826M, the largest single item), legal/non-income-tax/regulatory reserve changes and settlements ($564M), goodwill/asset impairments ($2M), acquisition/financing/divestiture expenses ($43M), loss on lease arrangements ($2M), restructuring ($9M) [components sum to $2,446M against the operating-income base; the $2,418M gap to the unadjusted-EBITDA base reflects a $28M difference in the D&A add-back methodology between CIQ's total-D&A figure and the company's opex-line D&A] | [FY25 10-K, Item 7 MD&A, Adjusted EBITDA reconciliation table] |
| EBIT | 5,565 (GAAP income from operations) | Company does not disclose a separate Adjusted EBIT / Adjusted operating income metric. | n/a | n/a | [FY25 10-K, Item 7; no Adjusted EBIT reconciliation present] |
| EPS | 4.73 (GAAP diluted EPS) | 1.94 (Capital IQ "Normalized Diluted EPS," LTM basis; FY2025 = 1.70) | −3.03 (FY2025); −2.64 (LTM) | Uber does not publish a company-defined "Adjusted EPS." The figure shown is Capital IQ's own normalization (removes one-time/unusual items per CIQ's standard methodology) and is labelled as a vendor estimate, not a company metric. Directionally consistent with the large non-cash tax benefits described in Section 3 that inflate reported GAAP EPS. | [CIQ Financials_Annual.xls → Income Statement, "Normalized Diluted EPS" row — vendor-derived, not company-disclosed] |

**Disclosure-change flag (material for downstream tracking):** Uber stopped presenting company-level "Adjusted EBITDA" as a headline non-GAAP metric starting with the Q1 FY26 10-Q — the term does not appear anywhere in either the Q1 FY26 or Q2 FY26 earnings-call transcripts (zero mentions in both, confirmed by full-text search) [Q1 FY26 Earnings Call, May-06-2026; Q2 FY26 Earnings Call, Aug-05-2026], and the Q1/Q2 FY26 10-Qs reconcile only "Free cash flow," not company Adjusted EBITDA [Q1 FY26 10-Q, filed May-06-2026; Q2 FY26 10-Q, filed Aug-05-2026]. Segment-level profit measure also changed from "Segment Adjusted EBITDA" to "Segment Operating Income" effective Q1 FY26, with prior-period segment figures recast [Q1 FY26 10-Q, MD&A]. The last disclosed company-level Adjusted EBITDA is therefore the FY2025 annual figure ($8,730M) from the FY25 10-K — no FY26 quarterly Adjusted EBITDA update exists in this pool. Downstream agents relying on Adjusted EBITDA trend should use the unadjusted CIQ "EBITDA" figures in Sections 1–3 for FY26 quarters, or Free Cash Flow, which the company continues to report.

## 5. Quarterly Seasonality Table (last 3 fiscal years: FY2023–FY2025)

| Quarter | FY2023 Rev Share | FY2024 Rev Share | FY2025 Rev Share | Avg Rev Share | FY2023 EBITDA Margin | FY2024 EBITDA Margin | FY2025 EBITDA Margin |
|---|---:|---:|---:|---:|---:|---:|---:|
| Q1 | 23.7% | 23.0% | 22.2% | 23.0% | (0.6)% | 3.6% | 12.2% |
| Q2 | 24.8% | 24.3% | 24.3% | 24.5% | 5.8% | 9.1% | 12.9% |
| Q3 | 24.9% | 25.4% | 25.9% | 25.4% | 6.4% | 11.1% | 9.7% |
| Q4 | 26.7% | 27.2% | 27.6% | 27.2% | 8.6% | 7.9% | 13.7% |

No quarter exceeds 30% or falls below 20% of annual revenue, so the >30%/<20% flag threshold is not tripped. That said, there is a consistent, mild pattern: Q4 is the strongest revenue quarter in all three years (26.7–27.6% of the year, and rising each year) and Q1 the weakest (22.2–23.7%, and falling each year) [computed from CIQ Financials_Quarterly.xls → Income Statement]. EBITDA margin does not show the same clean seasonal pattern — FY2024's Q4 dip (7.9%, below both Q2 and Q3 that year) breaks the revenue-share pattern and coincides with the concentrated legal/regulatory reserve charges added back in the FY2024 Adjusted EBITDA reconciliation ($1,123M for the full year) [FY25 10-K, Item 7]; this is a one-time-item effect layered on top of the underlying seasonal revenue pattern, not a contradiction of it.

## 6. Key Trend Summary

Revenue growth has held in a stable high-teens band for three straight fiscal years (+17.0% FY2023, +18.0% FY2024, +18.3% FY2025) [CIQ Financials_Annual.xls → Income Statement], but the two most recent quarters (Q1 FY26 +14.5% YoY, Q2 FY26 +12.2% YoY) show a real deceleration in reported revenue growth versus the ~20% run rate of the prior four quarters — though Gross Bookings still grew 24% YoY in Q2 FY26, and the gap is substantially explained by a disclosed $1.1B one-time UK Mobility revenue-recognition change, not weaker underlying demand [Q2 FY26 10-Q, MD&A]. Margins are expanding: EBITDA margin (unadjusted) has risen every year from FY2021's (16.8)% to FY2025's 12.1%, and the company's Adjusted EBITDA margin reached 16.8% in FY2025 (up from 14.7% in FY2024) [FY25 10-K, Item 7], though the company stopped disclosing this adjusted metric on a quarterly basis after Q4 FY2025 (see Section 4), which limits visibility into whether the margin-expansion trend continued into FY26. There is material but not extreme seasonality: Q4 is consistently the strongest revenue quarter (~27% of the year) and Q1 the weakest (~23%), a pattern that has held for three straight fiscal years (Section 5). The clearest inflection points in the last five years are (1) the FY2022→FY2023 swing from negative to positive EBIT/EBITDA, marking the transition from growth-at-a-loss to sustained profitability, and (2) a large, recent balance-sheet inflection: strict net debt rose $3.96B (+67%) in the year to Jun-30-2026, funded by a $3,997M debt raise in Q2 FY26 alone used substantially to fund an accelerated buyback program (LTM repurchases of $6,904M) — a leverage increase (Net Debt/unadjusted-EBITDA rising from 0.82x at FY2025 year-end to 1.32x on an LTM basis) that this module flags for the balance-sheet/capital-allocation-focused agents to examine further, since it sits outside this agent's scope to evaluate (Section 2).

## 7. Citations

[1] FY25 10-K (filed Feb-13-2026), Item 8, Consolidated Statements of Operations
[2] FY25 10-K (filed Feb-13-2026), Item 8, Consolidated Balance Sheets
[3] FY25 10-K (filed Feb-13-2026), Item 8, Consolidated Statements of Cash Flows
[4] FY25 10-K (filed Feb-13-2026), Item 7, MD&A — Adjusted EBITDA reconciliation table
[5] Q1 FY26 10-Q (filed May-06-2026), MD&A — Segment Operating Income basis change (Segment Adjusted EBITDA → Segment Operating Income, effective Q1 FY26)
[6] Q2 FY26 10-Q (filed Aug-05-2026), Condensed Consolidated Statements of Operations
[7] Q2 FY26 10-Q (filed Aug-05-2026), Condensed Consolidated Balance Sheets
[8] Q2 FY26 10-Q (filed Aug-05-2026), MD&A — Free Cash Flow reconciliation
[9] Q2 FY26 10-Q (filed Aug-05-2026), MD&A — Revenue discussion (UK Mobility business-model change, −$1.1B impact)
[10] Q1 FY26 Earnings Call transcript, May-06-2026 (verbatim CIQ transcript) — zero mentions of "Adjusted EBITDA" (full-text search)
[11] Q2 FY26 Earnings Call transcript, Aug-05-2026 (verbatim CIQ transcript) — zero mentions of "Adjusted EBITDA" (full-text search)
[12] Capital IQ export, Uber Technologies Inc NYSE UBER Financials_Annual.xls → Income Statement / Balance Sheet / Cash Flow / Segments tabs, data pulled Aug-2026
[13] Capital IQ export, Uber Technologies Inc NYSE UBER Financials_Quarterly.xls → Income Statement / Balance Sheet / Cash Flow tabs, data pulled Aug-2026

Method note: all growth rates, margins (bps), TTM sums, FCF, and leverage ratios in this report were computed via executed Python scripts (not mental arithmetic) that read the values transcribed from the sources above; annual and quarterly CIQ figures were cross-checked against each other (quarterly sums reconciled exactly to annual/LTM totals for revenue, EBITDA, EBIT, CFO, and capex) and against the Q1/Q2 FY26 10-Q primary filings for CFO, capex, and revenue, all of which tied out exactly.
