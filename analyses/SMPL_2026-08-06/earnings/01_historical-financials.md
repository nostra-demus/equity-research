# Historical Financials — SMPL

**Jurisdiction / regime:** US domestic filer (Delaware incorporation, Nasdaq: SMPL). US GAAP. Reporting currency: USD, in millions unless stated otherwise. Fiscal year ends the last Saturday in August (FY2025 ended August 30, 2025; FY2024 was a 53-week year ended August 31, 2024). [FY2025 10-K, cover page and Note 2 (Summary of Significant Accounting Policies)]

**Reporting structure note:** SMPL discloses one GAAP reportable segment (ASC 280) even though it manages three brands internally (Quest, Atkins, OWYN) — no brand-level profit or EBITDA is disclosed, only brand-level revenue. All figures below are consolidated. [FY2025 10-K, Note 15 (Segment and Customer Information); confirmed in `business-model/03_segment-map.md`]

**A note on EBIT/EBITDA sourcing (read before using the tables below):** Capital IQ's "Operating Income" and "EBITDA" supplemental line items reclassify loss on impairment, business-transaction costs, and M&A/integration-related restructuring charges as below-the-line "unusual items" excluded from operating income — this differs from the company's own GAAP income statement, which includes those costs as operating expenses. For FY2021–FY2023, this makes no difference (SMPL had zero such items in those years, confirmed from the same CIQ workbook's own unusual-items rows, so CIQ = GAAP). For FY2024 and FY2025 the two bases diverge materially (OWYN acquisition integration costs from FQ2 FY2024, and a $60.9 million intangible impairment in FQ4 FY2025), so this report uses the company's own GAAP "Income from operations" and GAAP EBITDA reconciliation from the 10-K for FY2024–FY2025, not the CIQ figure. This divergence is the single biggest data-quality issue in this pool and is analyzed in full in Section 4 and Section 6.

## 1. Annual Financial Table (5 years, USD millions unless noted)

| Metric | FY2021 | FY2022 | FY2023 | FY2024 (53wk) | FY2025 | Trend |
|---|---:|---:|---:|---:|---:|---|
| Revenue | 1,005.6 | 1,168.7 | 1,242.7 | 1,331.3 | 1,450.9 | Inflecting |
| Revenue YoY % | n/a | +16.2% | +6.3% | +7.1% | +9.0% | — |
| Gross Profit | 409.8 | 445.6 | 453.4 | 511.6 | 525.7 | Decelerating |
| Gross Margin % | 40.7% | 38.1% | 36.5% | 38.4% | 36.2% | Decelerating |
| EBITDA (GAAP) | 196.1 | 222.2 | 225.2 | 228.8 | 177.9 | Inflecting |
| EBITDA Margin % | 19.5% | 19.0% | 18.1% | 17.2% | 12.3% | Decelerating |
| EBIT (GAAP Income from Operations) | 178.0 | 202.9 | 204.9 | 206.5 | 156.9 | Decelerating |
| EBIT Margin % | 17.7% | 17.4% | 16.5% | 15.5% | 10.8% | Decelerating |
| EPS (diluted) | $0.42 | $1.08 | $1.32 | $1.38 | $1.02 | Decelerating |
| CFO | 132.1 | 110.6 | 171.1 | 215.7 | 178.5 | Volatile |
| Capex | 5.9 | 5.2 | 11.6 | 5.7 | 20.5 | Volatile |
| FCF (CFO – Capex) | 126.2 | 105.4 | 159.5 | 210.0 | 157.9 | Volatile |
| Working Capital (Curr. Assets − Curr. Liab.) | 185.0 | 249.4 | 281.8 | 331.7 | 329.1 | Stable |
| Net Debt (total debt incl. finance leases − cash) | 424.9 | 386.5 | 238.9 | 304.8 | 206.0 | Decelerating (i.e., falling) |
| Net Debt / EBITDA | 2.17x | 1.74x | 1.06x | 1.33x | 1.16x | Stable |

Margin change, YoY, in basis points (bps): Gross margin FY22 −260bps, FY23 −160bps, FY24 +190bps, FY25 −220bps. EBITDA margin FY22 −50bps, FY23 −90bps, FY24 −90bps, FY25 **−490bps**. EBIT margin FY22 −34bps, FY23 −87bps, FY24 −98bps, FY25 **−470bps**. [Computed by agent from the sourced figures below; see Bash computation log referenced in Section 7]

Sourcing by year: Revenue, Gross Profit, EBIT, EBITDA, EPS, CFO, and Capex for FY2023–FY2025 are the company's own GAAP figures from the FY2025 10-K (three-year income statement and cash-flow statement) [1]. FY2021–FY2022 figures for the same lines come from the Capital IQ annual financials export [2] because no 10-K for those years is in this pool — CIQ's figures equal GAAP for those two years because SMPL had zero loss-on-impairment, business-transaction, or restructuring items in FY2021–FY2022 (confirmed from the same CIQ workbook's own "unusual items" rows, all blank for those columns). Net Debt and Working Capital for all five years are sourced from the CIQ annual balance-sheet export [2]; CIQ's "Total Debt" includes finance-lease liabilities in addition to funded debt, so Net Debt here is on a **broad** basis (funded debt + finance leases − cash), labeled accordingly per CLAUDE.md §15.

FCF = CFO − Capex (capex taken as an absolute value; SMPL reports capex as a negative investing cash flow) [1, 2].

## 2. TTM Snapshot

Latest TTM = twelve months ended May 30, 2026 (FQ4 FY2025 + FQ1–FQ3 FY2026). Prior TTM = twelve months ended May 31, 2025 (FQ4 FY2024 + FQ1–FQ3 FY2025).

| Metric | Latest TTM (to May-30-26) | Prior TTM (to May-31-25) | Change | Evidence |
|---|---:|---:|---:|---|
| Revenue | $1,392.2M | $1,457.6M | −4.5% | [3][4][5] quarterly net sales, summed |
| EBITDA (GAAP, reported) | $(213.1)M | ~$255.6M* | Swing of ~$469M | [3][4][5][6] — see impairment note below |
| EBIT (GAAP) | $(243.3)M | ~$228.0M* | Swing of ~$471M | Derived: EBITDA − D&A, both TTM |
| EPS diluted | $(2.08) | n/a (sum of quarters ≈ $1.43) | n/a | [2] CIQ LTM column (official LTM EPS calc, not a simple sum of quarterly EPS) |
| CFO | $147.5M | $182.0M | −19.0% | [3][4][5][6] quarterly cash flow, summed |
| Capex | $28.1M | $6.4M | +$21.7M | [3][4][5][6] |
| FCF | $119.4M | $175.6M | −32.0% | CFO − Capex, both TTM |
| Net debt at latest period-end (May-30-26) | $324.6M | $206.7M (May-31-25) | +$117.9M (+57%) | [7] quarterly balance sheet, point-in-time |

\* The Prior TTM EBITDA/EBIT figures mix bases: FQ1–FQ3 FY2025 use GAAP-derived EBITDA (see Section 3 workings); FQ4 FY2024 uses the CIQ EBITDA figure ($71.7M) because no FY2024 10-Q is in this pool to derive the GAAP-only figure directly, and CIQ's figure for that single quarter modestly overstates true GAAP EBITDA (by an amount consistent with the ~$5–9M per-quarter OWYN-integration-cost exclusion seen in FY2024's other quarters). This is flagged, not silently used — treat the Prior TTM EBITDA/EBIT figures as approximate, not exact.

**The dominant fact in this table:** GAAP EBITDA and EBIT swung from solidly positive to sharply negative over the last four quarters, entirely because of a $391.9 million non-cash goodwill/brand impairment recognized across FQ4 FY2025, FQ2 FY2026, and FQ3 FY2026 [8]. Stripping that out, the company's own **Adjusted EBITDA** (its primary non-GAAP KPI, defined in Note/MD&A as EBITDA further adjusted for loss on impairment, stock-based compensation, business-transaction costs, inventory step-up, integration expense, term-loan fees, and restructuring) was **$234.6M for the Latest TTM**, built from FQ4 FY2025 ($66.2M) + FQ1 FY2026 ($55.6M) + FQ2 FY2026 ($55.5M) + FQ3 FY2026 ($57.2M) [3][4][5][9]. That is still a decline: Adjusted EBITDA margin was 20.2% in FY2024, 19.2% in FY2025, and has fallen further to 16.9% on the Latest TTM [1][9] — a genuine, non-impairment-related margin compression of roughly 330 basis points over the last twelve months, not just an accounting artifact of the write-down. Net debt / Adjusted EBITDA (Latest TTM) = 1.38x; Net debt / GAAP EBITDA is not a meaningful ratio in the Latest TTM column because the denominator is negative.

## 3. Latest Quarterly Trend Table (8 quarters, USD millions unless noted)

| Metric | FQ4 FY24 (Aug-31-24) | FQ1 FY25 (Nov-30-24) | FQ2 FY25 (Mar-1-25) | FQ3 FY25 (May-31-25) | FQ4 FY25 (Aug-30-25) | FQ1 FY26 (Nov-29-25) | FQ2 FY26 (Feb-28-26) | FQ3 FY26 (May-30-26) | QoQ Trend | YoY vs Same Q |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---|---|
| Revenue | 375.7 | 341.3 | 359.7 | 381.0 | 369.0 | 340.2 | 326.0 | 357.0 | Volatile | −6.3% (vs FQ3FY25) |
| Gross Margin % | 39.7% | 38.5% | 36.2% | 36.4% | 34.3% | 32.3% | 31.6% | 34.3% | Decelerating | −210bps (vs FQ3FY25's 36.4%) |
| EBITDA (GAAP) | 71.7†CIQ | 59.8 | 59.7 | 64.3 | (5.9) | 43.8 | (207.2) | (43.8) | Volatile | n/m — impairment in prior-yr comp is zero |
| EBITDA Margin % | 19.1%†CIQ | 17.5% | 16.6% | 16.9% | −1.6% | 12.9% | −63.6% | −12.3% | Decelerating | n/m |
| EPS (diluted) | $0.29 | $0.38 | $0.36 | $0.40 | $(0.12) | $0.26 | $(1.73) | $(0.58) | Volatile | n/m |

† FQ4 FY24 EBITDA is the CIQ figure (Capital IQ Financials_Quarterly, Income Statement tab), not a GAAP-reconciled figure — no FY2024 10-Q is in this pool to derive the exact GAAP number for that single quarter. All other EBITDA figures in this row (FQ1 FY25 through FQ3 FY26) are GAAP-consistent: FQ2 FY25, FQ3 FY25, FQ2 FY26, and FQ3 FY26 are the company's own disclosed GAAP EBITDA from the two 10-Qs' non-GAAP reconciliation tables [3][4]; FQ1 FY25, FQ4 FY25, and FQ1 FY26 are derived by subtracting disclosed year-to-date figures (e.g., FQ4 FY25 EBITDA = FY2025 full-year GAAP EBITDA of $177.9M minus the 39-week YTD GAAP EBITDA of $183.8M disclosed in the Q3 FY2026 10-Q) [1][3].

Revenue YoY vs same quarter one year earlier, all four most recent quarters: FQ4 FY25 vs FQ4 FY24 −1.8%; FQ1 FY26 vs FQ1 FY25 −0.3%; FQ2 FY26 vs FQ2 FY25 −9.4%; FQ3 FY26 vs FQ3 FY25 −6.3% [3][4][5]. Four consecutive quarters of YoY revenue decline.

QoQ revenue changes, most recent 7 transitions: FQ1FY25 −9.2%, FQ2FY25 +5.4%, FQ3FY25 +5.9%, FQ4FY25 −3.1%, FQ1FY26 −7.8%, FQ2FY26 −4.2%, FQ3FY26 +9.5% [3][4][5]. Some of this QoQ swing is ordinary seasonality (see Section 5 — Q1 is consistently the smallest quarter); the YoY reads above strip that out and are the more reliable signal.

## 4. Reported vs Adjusted Metrics

The company discloses a GAAP-to-Adjusted-EBITDA reconciliation every quarter and every fiscal year. It does **not** disclose an adjusted EPS or adjusted net income figure, and it does not separately reconcile an "adjusted EBIT."

| Metric | Reported (GAAP) | Adjusted (company non-GAAP) | Adjustment Amount | Adjustment Reason | Evidence |
|---|---:|---:|---:|---|---|
| EBITDA — FQ3 FY2026 (13wk, May-30-26) | $(43.8)M | $57.2M | $101.1M | Loss on impairment $82.0M (OWYN $13.0M + Atkins $31.0M + goodwill $38.0M); SBC $5.6M; integration expense $5.2M; restructuring/other $13.5M | [3] |
| EBITDA — FQ3 FY2025 (13wk, May-31-25, comp) | $64.3M | $73.9M | $9.5M | SBC $4.0M; integration expense $5.2M; other $0.3M (no impairment) | [3] |
| EBITDA — FY2025 (52wk) | $177.9M | $278.2M | $100.2M | Loss on impairment $60.9M (Atkins); SBC $15.3M; integration expense $20.9M; business-transaction costs $0.8M; inventory step-up $1.4M; term-loan fees $0.7M; other $0.2M | [1] |
| EBITDA — FY2024 (53wk) | $228.8M | $269.1M | $40.4M | SBC $18.4M; integration expense $0.6M; business-transaction costs $14.5M (OWYN deal); executive-transition costs $3.9M; inventory step-up $3.2M; other $(0.3)M (no impairment) | [1] |
| EBIT | Not separately reconciled by the company | — | — | Company only reconciles net income → EBITDA → Adjusted EBITDA; no adjusted operating-income figure is disclosed | [1][3] |
| EPS (diluted) | GAAP diluted EPS shown in Sections 1–3 | Not disclosed | — | Company does not disclose adjusted net income or adjusted EPS | [1][3] |

The scale of the FQ2 FY2026 adjustment is the largest in the pool and is not shown above only for space: reported (GAAP) EBITDA for the 13 weeks ended February 28, 2026, was $(207.2)M against Adjusted EBITDA of $55.5M — a $262.7M gap, almost entirely the $249.0M OWYN/Atkins/goodwill impairment recognized that quarter [4].

## 5. Quarterly Seasonality Table (last 3 fiscal years)

| Quarter | FY2023 Rev Share | FY2024 Rev Share | FY2025 Rev Share | Avg Rev Share | FY2023 EBITDA Margin | FY2024 EBITDA Margin | FY2025 EBITDA Margin |
|---|---:|---:|---:|---:|---:|---:|---:|
| Q1 | 24.2% | 23.2% | 23.5% | 23.6% | 19.1% | 18.7%† | 17.5% |
| Q2 | 23.9% | 23.5% | 24.8% | 24.0% | 16.1% | 17.1%† | 16.6% |
| Q3 | 26.1% | 25.1% | 26.3% | 25.8% | 18.5% | 20.0%† | 16.9% |
| Q4 | 25.8% | 28.2% | 25.4% | 26.5% | 19.7% | 19.1%† | −1.6% |

No quarter in any of the three years exceeds 30% or falls below 20% of annual revenue — this is mild, not severe, seasonality. Q1 (the quarter ending in late November, covering the September–November period) is consistently the smallest quarter (23–24% of the year); Q3 and Q4 (the quarters ending in the May–August window) are consistently the largest (25–28%). [2][3] quarterly revenue by fiscal quarter, cross-checked to sum to each year's audited annual revenue exactly.

† FY2024 EBITDA-margin cells use the CIQ quarterly EBITDA figure, not a GAAP-reconciled one — no FY2024 10-Qs are in this pool. Because FY2024 (starting FQ2, the OWYN acquisition quarter) carries integration and business-transaction costs that CIQ excludes but GAAP includes, these four cells likely overstate true GAAP quarterly margin by a few hundred basis points each (the full-year gap was $20.9M on $228.8M of GAAP EBITDA — about 9% of the annual figure). FY2023 cells (pre-OWYN, zero reclassified items that year) are GAAP-equivalent. FY2025 cells are GAAP-derived per the Section 3 workings and correctly show the FQ4 FY2025 impairment quarter turning EBITDA margin negative.

## 6. Key Trend Summary

Revenue growth is **inflecting negative**: five straight years of GAAP revenue growth (+16.2% FY22, +6.3% FY23, +7.1% FY24, +9.0% FY25) reversed into four consecutive quarters of year-over-year decline (FQ4 FY25 through FQ3 FY26, ranging from −0.3% to −9.4%), pulling trailing-twelve-month revenue down 4.5% to $1,392.2M [1][3][4][5]. Margins are **compressing** on every basis tested: gross margin fell from 40.7% (FY21) to 36.2% (FY25) and further to roughly 31–34% in the last three quarters; and even the company's own cleaned-up Adjusted EBITDA margin — which excludes the impairment — fell from 20.2% (FY24) to 19.2% (FY25) to 16.9% (Latest TTM), a genuine ~330bps deterioration that is not an artifact of the write-down [1][3][4][9]. Seasonality is mild, not material: no quarter takes more than 30% or less than 20% of annual revenue in any of the last three fiscal years, though Q1 (Sep–Nov) is consistently the smallest and Q3/Q4 (Mar–Aug) consistently the largest [2][3]. The clear **inflection point** in this dataset is the $391.9 million combined goodwill and brand-intangible impairment (OWYN $200.0M, Atkins $124.0M, goodwill $38.0M in the 39 weeks ended May 30, 2026, plus a separate $60.9M Atkins impairment in FQ4 FY2025) [8], recognized after "a sustained decline in the Company's share price and declines in the Company's market capitalization" triggered an interim goodwill/intangible test [8] — this drove three of the last four quarters' GAAP net income and EBITDA deeply negative and coincided with a CEO departure and a change in principal accounting officer inside the same two-to-three-quarter window (flagged separately and in more depth in `business-model/11_capital-allocation-governance.md` and `business-model/12_red-flags-sweep.md`). Net debt fell steadily from FY21 ($424.9M) to FY25 ($206.0M) as the company paid down its Term Facility, but has since risen back to $324.6M by FQ3 FY26 [1][2][7], driven by continued share buybacks ($242.3M repurchased across the last four quarters [3][4][5][6]) funded while Adjusted EBITDA was falling — a capital-allocation choice this report flags but does not evaluate (that is `margin-drivers`/`earnings-quality`/business-model scope).

## 7. Citations

[1] FY2025 10-K (filed Oct-28-2025), Consolidated Statements of Income and Comprehensive Income (52-weeks ended Aug-30-2025 / 53-weeks ended Aug-31-2024 / 52-weeks ended Aug-26-2023); Consolidated Balance Sheets (Aug-30-2025 / Aug-31-2024); Consolidated Statements of Cash Flows (same three years); MD&A "Reconciliation of EBITDA and Adjusted EBITDA" (FY2025 vs FY2024)
[2] The Simply Good Foods Company NasdaqCM SMPL Financials_Annual.xls — Income Statement, Balance Sheet, and Cash Flow tabs (Capital IQ & Proprietary Data, Annual, FY2017–FY2025 plus LTM to May-30-2026)
[3] Q3 FY2026 10-Q (filed Jul-09-2026), Consolidated Statements of Operations (13 & 39 weeks ended May-30-2026 and May-31-2025); MD&A "Reconciliation of EBITDA and Adjusted EBITDA" (13wk and 39wk, both years)
[4] Q2 FY2026 10-Q (filed Apr-09-2026), Consolidated Statements of Operations (13 & 26 weeks ended Feb-28-2026 and Mar-1-2025); MD&A "Reconciliation of EBITDA and Adjusted EBITDA" (13wk and 26wk, both years)
[5] The Simply Good Foods Company NasdaqCM SMPL Financials_Quarterly.xls — Income Statement tab (Capital IQ & Proprietary Data, Quarterly, FQ1 FY2017–FQ3 FY2026)
[6] The Simply Good Foods Company NasdaqCM SMPL Financials_Quarterly.xls — Cash Flow tab (same coverage)
[7] The Simply Good Foods Company NasdaqCM SMPL Financials_Quarterly.xls — Balance Sheet tab (same coverage)
[8] Q3 FY2026 10-Q (filed Jul-09-2026), Note 4 (Goodwill and Intangibles) — goodwill impairment $38.0M, OWYN impairment $13.0M (13wk)/$200.0M (39wk), Atkins impairment $31.0M (13wk)/$93.0M (39wk); MD&A "Loss on impairment" discussion ($82.0M for 13wk, $331.0M for 39wk ended May-30-2026); FY2025 10-K, Income Statement, Loss on impairment line ($60.928M, FY2025)
[9] Derived by agent: quarterly Adjusted EBITDA for FQ1 FY2025, FQ4 FY2025, and FQ1 FY2026 computed by subtracting a disclosed shorter-period (13-week) Adjusted EBITDA figure from the corresponding disclosed longer-period (26-week/39-week/52-week) Adjusted EBITDA figure, both from the same primary source [1][3][4]; all four component quarters cross-checked to sum to the disclosed FY2025/FY2024 annual Adjusted EBITDA figures exactly

Note on method: all growth rates, margin bps changes, TTM sums, FCF, and leverage ratios in this report were computed with an executed Python script (via the Bash tool) from the sourced figures above, not by mental arithmetic; representative script output is retained in the agent's working notes for this run.
