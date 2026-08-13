# Historical Financials — INDIAMART

**Jurisdiction / regime:** India, listed on NSE (INDIAMART) and BSE (542726). Reporting standard: Ind AS (Indian Accounting Standards, Companies Act 2013 Sec. 133). Reporting currency: INR. Fiscal year ends **March 31** (e.g. "FY26" = year ended 31-Mar-2026). All figures below are in **₹ millions** (Capital IQ's reporting unit for this export) unless stated otherwise. Consolidated basis throughout.

Note on sourcing: the pool contains no `ciq_facts.json` sidecar for this run, so all figures below are this agent's own sourced read of the Capital IQ (CIQ) financial-statement exports and the underlying SEBI-filed annual/interim reports, cross-checked against each other. Capital IQ exports are Tier-5 evidence (CLAUDE.md §4); where a figure was independently verified against the primary filing text, that filing is cited directly.

---

## 1. Annual Financial Table (5 years, FY22–FY26)

Currency: **INR million**, consolidated, Ind AS. FY22 = year ended 31-Mar-2022 … FY26 = year ended 31-Mar-2026.

| Metric | FY22 | FY23 | FY24 | FY25 | FY26 | Trend |
|---|---:|---:|---:|---:|---:|---|
| Revenue | 7,534.85 | 9,853.99 | 11,967.75 | 13,883.44 | 15,690.42 | Decelerating |
| Revenue YoY % | 12.53%¹ | 30.78% | 21.45% | 16.01% | 13.02% | Decelerating |
| Gross Profit² | 4,828.63 | 5,560.05 | 6,461.13 | 7,772.25 | 8,673.83 | Stable |
| Gross Margin %² | 64.08% | 56.42% | 53.99% | 55.98% | 55.28% | Stable (post FY23 step-down) |
| EBITDA | 2,971.01 | 2,618.07 | 3,176.77 | 5,140.44 | 5,205.94 | Volatile |
| EBITDA Margin % | 39.43% | 26.57% | 26.54% | 37.03% | 33.18% | Volatile |
| EBIT | 2,959.00 | 2,408.78 | 2,948.97 | 4,922.29 | 5,015.93 | Volatile |
| EBIT Margin % | 39.27% | 24.44% | 24.64% | 35.45% | 31.97% | Volatile |
| EPS (diluted) | ₹48.42 | ₹46.32 | ₹55.04 | ₹91.59 | ₹78.77 | Volatile |
| CFO | 4,023.14 | 4,758.28 | 5,591.66 | 6,232.13 | 6,942.19 | Stable (growing every year) |
| Capex³ | (44.20) | (172.00) | (146.80) | (78.60) | (70.00) | Volatile (small base) |
| FCF (CFO – \|Capex\|) | 3,978.94 | 4,586.28 | 5,444.86 | 6,153.53 | 6,872.19 | Stable |
| Working Capital (CA–CL)⁴ | 17,819.46 | 15,073.07 | 13,026.10 | 17,141.09 | 18,286.13 | Stable |
| Net Debt — strict basis⁵ | 67.33 (net debt) | (121.98) net cash | (441.37) net cash | (404.47) net cash | (573.11) net cash | Stable (net cash, deepening) |
| Net Debt — broad basis⁶ | (23,210.6) net cash | (22,840.3) net cash | (22,824.8) net cash | (28,392.9) net cash | (30,971.6) net cash | Stable (net cash, deepening) |
| Net Debt / EBITDA | N/M (net cash) | N/M (net cash) | N/M (net cash) | N/M (net cash) | N/M (net cash) | Stable — net-cash throughout |

Margin change, YoY, in basis points (bps; 1 bps = 0.01 percentage point), computed and verified via an executed Python snippet (Bash):
- EBITDA margin: FY23 −1,286 bps, FY24 −2 bps, FY25 +1,048 bps, FY26 −385 bps.
- EBIT margin: FY23 −1,483 bps, FY24 +20 bps, FY25 +1,081 bps, FY26 −349 bps.

¹ FY22 YoY uses FY21 revenue (₹6,695.62mn) as the base [Capital IQ export, Financials.xls, Segments tab, FY2021 column].
² **Gross Profit / Gross Margin are Capital IQ–constructed figures** (CIQ's own "Cost of Goods Sold" bucket). IndiaMART's Ind AS profit & loss statement does not present a segregated cost-of-revenue / gross-profit line (it is a single-step P&L: Employee benefit expense, Depreciation & amortisation, Finance costs, Other expenses) — confirmed by a full-text search of the FY26 Annual Report for "gross profit" / "cost of revenue" (no matches). Do not treat this row as a company-disclosed statutory line item; it is Tier-5 vendor construction, shown for comparability only (CLAUDE.md §15 — no silent use of vendor-adjusted numbers).
³ Capex shown as reported (negative cash outflow in CIQ Cash Flow tab); FCF below uses the absolute value per MODULE_RULES §Calculation Standards item 7.
⁴ Working Capital = Total Current Assets − Total Current Liabilities. **This is dominated by treasury assets, not operating working capital**: Total Current Assets includes ₹30,294.05mn of "Trading Asset Securities" (mutual-fund/bond investments) as of FY26 — IndiaMART parks its large customer-prepayment float in short-duration debt instruments. Operating working capital (excluding cash, ST investments and trading securities from current assets) is **negative** at FY26: (31,935.85 − 804.13 − 104.47 − 30,294.05) − 13,649.72 = **−₹12,916.52mn**, driven by ₹12,201.76mn of current Unearned Revenue (customers pre-pay 1-year-plus subscriptions) [Capital IQ export, Financials (1).xls, Balance Sheet tab]. Inference (from filed line items, not a company-disclosed sub-total), not from filings.
⁵ Strict net debt = Total Debt − Cash & Equivalents only (CLAUDE.md §15 strict basis). IndiaMART's "Total Debt" per CIQ is entirely lease liabilities (current + non-current) — the company carries no bank borrowings; this was cross-checked against the FY26 interim filing's own lease-liability note (₹100.12mn current + ₹130.90mn non-current = ₹231.02mn at 31-Mar-2026, matching CIQ) [`IndiaMART_InterMESH_Limited_-_Form_Interim_Report(Jul-21-2026).pdf`, Note 15/condensed balance sheet].
⁶ Broad basis nets Total Debt against Cash & Equivalents **plus** Short-Term Investments **plus** Trading Asset Securities (CIQ's own "Net Debt" line, which nets the treasury book). Labelled per CLAUDE.md §15 — never presented as the strict figure.

**Trend column definitions used:** Accelerating / Stable / Decelerating / Volatile / Inflecting, per MODULE_RULES.

Evidence: [1] (all rows unless noted) Capital IQ export, `IndiaMART InterMESH Limited NSEI INDIAMART Financials (1).xls`, Income Statement / Balance Sheet / Cash Flow tabs, FY2022–FY2026 annual columns, extraction run 2026-08-13 — sourced from CIQ & Proprietary Data (Tier 5).

---

## 2. TTM Snapshot

Latest TTM = 4 quarters ended 30-Jun-2026 (Q2 FY26–Q1 FY27). Prior TTM = 4 quarters ended 30-Jun-2025 (Q2 FY25–Q1 FY26). Both computed and cross-checked via an executed Python snippet (Bash) using two independent methods: (a) the CIQ Income Statement/Cash Flow "LTM Jun-30-2026" column for the latest period, and (b) a roll-forward / quarterly-sum reconciliation for both periods (Prior TTM = FY25 annual − Q1 FY25 + Q1 FY26; confirmed the same method reproduces the CIQ-reported Latest TTM Revenue, EBIT and Net Income exactly).

| Metric | Latest TTM (Jul-25–Jun-26) | Prior TTM (Jul-24–Jun-25) | Change | Evidence |
|---|---:|---:|---:|---|
| Revenue | 16,113.32 | 14,291.80 | +12.75% | [2] |
| EBITDA | 5,314.65 | 5,227.29⁷ | +1.67%⁷ | [2] |
| EBIT | 5,150.87 | 4,910.02 | +4.91% | [2] |
| EPS diluted | ₹81.82 | ~₹98.19⁸ | ~−16.7%⁸ | [2] |
| CFO | 6,966.86 | 6,480.28 | +7.51% | [3] |
| Capex (abs.) | 41.30 | 96.82 | −57.3% | [3] |
| FCF (CFO − \|Capex\|) | 6,925.56 | 6,383.46 | +8.49% | Calc. from [3] |
| Net debt at latest period-end (strict)⁵ | (151.83) net cash, as of 30-Jun-2026 | (17.95) net cash, as of 30-Jun-2025 | Net cash position deepened ~₹134mn | [3] |
| Net debt at latest period-end (broad)⁶ | (33,670.3) net cash, as of 30-Jun-2026 | Not extracted this run⁹ | — | [2] |

⁷ **Reconciliation flag:** summing the quarterly EBITDA actuals in the Capital IQ Estimates "Surprise" tab (Q2 FY26 1,297 + Q3 FY26 1,342 + Q4 FY26 1,326 + Q1 FY27 1,465 = 5,430) does **not** tie to the CIQ Income Statement's own "LTM Jun-30-2026" EBITDA figure (5,314.65) — a ~₹115mn (~2.2%) gap. The same gap recurs at every period checked (e.g. FY25: Income Statement EBITDA 5,140.44 vs Segments-tab Total EBITDA 5,227.92 vs quarterly-actual sum 5,087 — three different figures for the same fiscal year, all sourced from the same CIQ workbook family). This is an unreconciled inconsistency **within Capital IQ's own tabs**, not a filing-vs-vendor conflict; flagged per CLAUDE.md §4/§5 rather than silently resolved. The Income Statement "LTM" column is used above as the primary figure because it is CIQ's own designated trailing-twelve-month line.
⁸ Diluted EPS is not strictly additive across quarters (weighted-average diluted share count shifts quarter to quarter), so the Prior-TTM EPS shown is the **sum of the four quarterly diluted (GAAP) EPS actuals** (22.48 + 20.13 + 30.06 + 25.52) as an approximation, not a share-count-weighted recomputation. Treat the −16.7% change as directional. The swing is driven almost entirely by the "Gain (Loss) On Sale Of Invest." line (treasury book realised gains), which is large and volatile relative to operating earnings — see Section 6.
⁹ The broad-basis net debt at 30-Jun-2025 requires the short-term-investments and trading-securities balances as of that date, which were not extracted from the Q1 FY26 interim filing in this run; not fabricated. Strict-basis figure (row above) is available for both dates.

Evidence: [2] Capital IQ export, `Financials (1).xls`, Income Statement / Cash Flow tabs, "LTM Jun-30-2026" column and FY2025/FY2026 annual columns, cross-checked with the quarterly "Surprise" actuals in `IndiaMARTInterMESHLimitedNSEIINDIAMARTEstimatesReport.xls`. [3] `IndiaMART_InterMESH_Limited_-_Form_Interim_Report(Jul-21-2026).pdf`, condensed consolidated interim cash flow statement (three months ended 30-Jun-2026 vs 30-Jun-2025: CFO ₹1,634.31mn vs ₹1,609.64mn; capex ₹0.91mn vs ₹29.67mn) and condensed consolidated interim balance sheet (lease liabilities ₹216.28mn... total ₹216.28mn at 30-Jun-2026; cash ₹368.11mn); `IndiaMART_InterMESH_Limited_-_Form_Interim_Report(Jul-18-2025).pdf`, condensed consolidated interim cash flow statement (three months ended 30-Jun-2025 vs 30-Jun-2024: CFO ₹1,609.64mn vs ₹1,361.49mn; capex ₹29.67mn vs ₹11.45mn) and balance sheet (cash ₹322.14mn, lease liabilities ₹304.19mn at 30-Jun-2025).

---

## 3. Latest Quarterly Trend Table (8 quarters: Q2 FY25–Q1 FY27)

India fiscal-quarter labels: FQ1 = Apr–Jun, FQ2 = Jul–Sep, FQ3 = Oct–Dec, FQ4 = Jan–Mar. Currency: INR million except EPS (₹/share). Source: Capital IQ Estimates "Surprise" tab, quarterly-actuals archive [4] — this is the only quarterly-granularity series available across all 8 quarters in this pool; it is cross-checked against the two most recent quarters' own filed P&L/cash-flow figures where those filings exist in the pool (see Section 2 evidence). All growth %/margin figures computed and verified via an executed Python snippet (Bash).

| Metric | Q2 FY25 (Sep-24) | Q3 FY25 (Dec-24) | Q4 FY25 (Mar-25) | Q1 FY26 (Jun-25) | Q2 FY26 (Sep-25) | Q3 FY26 (Dec-25) | Q4 FY26 (Mar-26) | Q1 FY27 (Jun-26) | QoQ Trend | YoY vs Same Q |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---|---|
| Revenue | 3,477.0 | 3,543.0 | 3,551.0 | 3,720.8 | 3,910.0 | 4,016.0 | 4,043.0 | 4,144.0 | Decelerating (QoQ % growth shrinking each quarter since Q2 FY26) | Q1 FY27 +11.37% vs Q1 FY26's +12.31% — decelerating |
| Gross Margin %¹⁰ | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | Not available | Not available |
| EBITDA | 1,346.0 | 1,242.0 | 1,304.0 | 1,335.3 | 1,297.0 | 1,342.0 | 1,326.0 | 1,465.0 | Volatile | Q1 FY27 +9.7% vs Q1 FY26 |
| EBITDA Margin % | 38.71% | 35.06% | 36.72% | 35.89% | 33.17% | 33.42% | 32.80% | 35.35% | Decelerating through FY26, tick-up in Q1 FY27 | Compressed ~340bps YoY (38.71%→35.35% is Q2FY25 vs... see note) |
| EPS (diluted) | ₹22.48 | ₹20.13 | ₹30.06 | ₹25.52 | ₹13.71 | ₹31.24 | ₹8.33 | ₹28.56 | Volatile — no stable pattern | Volatile YoY (e.g. Q4 FY26 ₹8.33 vs Q4 FY25 ₹30.06, −72%) |

QoQ revenue growth, quarter by quarter: Q3 FY25 +1.90%, Q4 FY25 +0.23%, Q1 FY26 +4.78%, Q2 FY26 +5.08%, Q3 FY26 +2.71%, Q4 FY26 +0.67%, Q1 FY27 +2.50%.

¹⁰ Gross Margin is **not available at quarterly granularity**: neither the CIQ quarterly-actuals series nor the Ind AS interim P&L in the quarterly filings break out a cost-of-revenue / gross-profit line (see footnote ² above — the same single-step P&L structure applies at the quarterly level). EBITDA margin is used as the quarterly profitability trend line instead.

**EPS volatility driver (flagged, not smoothed away):** quarterly diluted EPS swings sharply (e.g. Q3 FY26 ₹31.24 → Q4 FY26 ₹8.33 → Q1 FY27 ₹28.56) despite EBITDA moving in a comparatively narrow ₹1,297–1,465mn band over the same three quarters. The swing traces to the "Gain (Loss) On Sale Of Invest." line in the income statement (annual figures: ₹1,037.96mn / ₹1,746.47mn / ₹2,047.16mn / ₹2,669.22mn / ₹1,906.51mn for FY22–FY26) — realised/mark-to-market gains on the company's large treasury book (₹30–33bn of trading securities), which sit below EBIT and are lumpy quarter to quarter [Capital IQ export, Financials (1).xls, Income Statement tab]. This is a below-the-line, non-operating item; EBIT and EBITDA are cleaner reads of the underlying operating trend than diluted EPS in this business. Inference (line-item read, not a company-provided attribution statement), not from filings.

Evidence: [4] Capital IQ export, `IndiaMARTInterMESHLimitedNSEIINDIAMARTEstimatesReport.xls`, Surprise tab, "Fiscal Quarters" / "Company Level (INR)" block, Revenue/EBITDA/EBIT/EPS(GAAP) Actual rows, extraction run 2026-08-13.

---

## 4. Reported vs Adjusted Metrics

**Company does not disclose adjusted metrics.** A full-text search of the FY26 Annual Report (`IndiaMART_InterMESH_Limited_-_Form_Annual_Report(Apr-30-2026).pdf`) for "adjusted EBITDA", "non-GAAP", "adjusted EPS" and "adjusted net profit" returned no matches [5]. IndiaMART reports a single set of Ind AS consolidated figures with no management-adjusted non-GAAP overlay.

Note: the Capital IQ workbook does carry its own vendor-constructed "Normalized Net Income" / "Normalized EPS" lines (e.g. Normalized Diluted EPS FY26 = ₹47.01 vs reported Diluted EPS ₹78.77) [Capital IQ export, `Financials (1).xls`, Income Statement tab]. This is **Capital IQ's own normalization** (it appears to strip out the investment-gains line discussed in Section 3), not a company-disclosed adjusted figure — it is shown here only so a downstream agent does not mistake it for management's own non-GAAP number. Per CLAUDE.md §15, no vendor adjustment is used silently anywhere else in this report without being labelled.

| Metric | Reported Value (FY26) | CIQ "Normalized" Value (FY26) | Adjustment Amount | Adjustment Reason | Evidence |
|---|---:|---:|---:|---|---|
| EPS (diluted) | ₹78.77 | ₹47.01 (CIQ-normalized, not company-disclosed) | ₹31.76 | Vendor-side exclusion, likely of treasury investment gains (see Section 3); not explained in the workbook's own documentation | [Capital IQ export, `Financials (1).xls`, Income Statement tab] |
| EBITDA | ₹5,205.94mn (reported) | Not applicable — company/CIQ does not publish a separate adjusted EBITDA line | — | — | [5] |
| EBIT | ₹5,015.93mn (reported) | Not applicable | — | — | [5] |

Evidence: [5] `IndiaMART_InterMESH_Limited_-_Form_Annual_Report(Apr-30-2026).pdf`, full-document text search (Bash grep), 2026-08-13 — no adjusted-metric disclosures found.

---

## 5. Quarterly Seasonality Table (FY24–FY26)

Computed and verified via an executed Python snippet (Bash) from the same quarterly-actuals series as Section 3.

| Quarter | FY24 Rev Share | FY25 Rev Share | FY26 Rev Share | Avg Rev Share | FY24 EBITDA Margin | FY25 EBITDA Margin | FY26 EBITDA Margin |
|---|---:|---:|---:|---:|---:|---:|---:|
| Q1 (Apr–Jun) | 23.57% | 23.86% | 23.71% | 23.71% | 27.40% | 36.07% | 35.89% |
| Q2 (Jul–Sep) | 24.62% | 25.04% | 24.92% | 24.86% | 27.15% | 38.71% | 33.17% |
| Q3 (Oct–Dec) | 25.51% | 25.52% | 25.60% | 25.54% | 28.07% | 35.06% | 33.42% |
| Q4 (Jan–Mar) | 26.30% | 25.58% | 25.77% | 25.88% | 28.09% | 36.72% | 32.80% |

**No quarter triggers the >30% or <20% revenue-share flag** — the mildest seasonality pattern visible is Q1 consistently the smallest quarter (~23.7–23.9% of annual revenue in all 3 years) and Q4 consistently the largest (~25.6–26.3%), a spread of roughly 2–3 percentage points. This is a modest, not material, seasonal skew — consistent with a subscription/renewal-driven B2B model rather than a sharply seasonal one. EBITDA margin, by contrast, shows a much larger year-to-year step (FY24's ~27–28% band vs FY25's ~35–39% band vs FY26's ~33–36% band) than quarter-to-quarter within a year — the variance is mostly a **year effect** (see Section 6), not a **quarter effect**.

Evidence: derived from [4] above (same Surprise-tab quarterly actuals), annual totals cross-checked to Section 1's FY24/FY25/FY26 revenue figures (sums reconcile to within rounding: FY24 quarterly sum ₹11,968mn vs reported ₹11,967.75mn; FY25 ₹13,884mn vs ₹13,883.44mn; FY26 ₹15,689.8mn vs ₹15,690.42mn).

---

## 6. Key Trend Summary

Revenue growth is **decelerating**: annual growth ran 30.78% (FY23) → 21.45% (FY24) → 16.01% (FY25) → 13.02% (FY26), and the latest TTM figure (+12.75%) and the most recent quarter (Q1 FY27 +11.37% YoY, the softest of the last 8 quarters) both confirm the deceleration is continuing into FY27, not just a FY23 base-effect artifact [Capital IQ export, Financials (1).xls; Surprise tab]. Margins are **volatile rather than trending in one direction**: EBITDA margin collapsed from 39.4% (FY22, a pandemic-era high) to 26.6% (FY23, −1,286 bps) as the company stepped up spending (management guided to a "28% to 29% EBITDA margins in FY24" range on the Q4 FY23 call [`IndiaMART InterMESH Limited, Q4 2023 Earnings Call, Apr 28, 2023.pdf`]), then jumped back to 37.0% in FY25 (+1,048 bps) before compressing again to 33.2% in FY26 (−385 bps); the most recent 4 quarters (Q2 FY26–Q1 FY27) show margin drifting down from 33.2% to 32.8% before a Q1 FY27 tick-up to 35.4%. Reported diluted EPS is **more volatile than either revenue or EBITDA**, swinging quarter to quarter (e.g. ₹31.24 in Q3 FY26 to ₹8.33 in Q4 FY26 to ₹28.56 in Q1 FY27) because of large, lumpy gains/losses on the company's ₹30bn+ treasury book sitting below the operating line — a downstream earnings-quality read should treat EBIT/EBITDA, not EPS, as the cleaner trend indicator (Section 3). Seasonality is **modest, not material**: Q1 (Apr–Jun) is consistently the smallest revenue quarter (~23.7–23.9% of the year) and Q4 (Jan–Mar) consistently the largest (~25.6–26.3%), a 2–3 point spread that does not clear the >30%/<20% flag threshold (Section 5). The clearest inflection point in the 5-year window is the **FY22→FY23 margin step-down** (EBITDA margin −1,286 bps on a cost build-out) followed by the **FY24→FY25 margin snap-back** (+1,048 bps); both moves are larger than any single year's revenue-growth swing, meaning cost discipline / investment cycles — not the top line — have driven most of the year-to-year swings in profitability over this period. The balance sheet is a **structural net-cash position throughout** (strict-basis net cash every year from FY23 on, deepening from ₹122mn net cash in FY23 to ₹573mn in FY26; on the broad basis that also nets the ₹30bn+ treasury book, net cash exceeds ₹30bn in FY26), so leverage is not a constraint on this business in any of the last 5 years.

---

## 7. Citations

[1] Capital IQ export, `IndiaMART InterMESH Limited NSEI INDIAMART Financials (1).xls`, Income Statement / Balance Sheet / Cash Flow tabs, FY2022–FY2026 annual columns (Source: "Capital IQ & Proprietary Data"), extraction run 2026-08-13.
[2] Capital IQ export, same workbook, Income Statement / Cash Flow tabs, "LTM Jun-30-2026" column.
[3] `IndiaMART_InterMESH_Limited_-_Form_Interim_Report(Jul-21-2026).pdf` — condensed consolidated interim financial statements, quarter ended 30-Jun-2026 (cash flow statement, balance sheet); `IndiaMART_InterMESH_Limited_-_Form_Interim_Report(Jul-18-2025).pdf` — condensed consolidated interim financial statements, quarter ended 30-Jun-2025 (cash flow statement, balance sheet). Both are SEBI LODR Reg 33 quarterly filings, audited/limited-review.
[4] Capital IQ Estimates export, `IndiaMARTInterMESHLimitedNSEIINDIAMARTEstimatesReport.xls`, Surprise tab, "Fiscal Quarters" section, Company-Level Revenue/EBITDA/EBIT/Net Income(GAAP)/EPS(GAAP) Actual rows, extraction run 2026-08-13.
[5] `IndiaMART_InterMESH_Limited_-_Form_Annual_Report(Apr-30-2026).pdf` — FY26 audited annual financial statements (Ind AS), full-text search for adjusted/non-GAAP disclosures, 2026-08-13.
[6] Capital IQ export, `IndiaMART InterMESH Limited NSEI INDIAMART Financials (1).xls`, Segments tab, FY2021–FY2026 (Web and Related Services / Accounting Software Services segments) — used for FY22 revenue-YoY base and to cross-check the Section-1/EBITDA reconciliation flag.
[7] `IndiaMART InterMESH Limited, Q4 2023 Earnings Call, Apr 28, 2023.pdf` — verbatim CIQ/S&P Global transcript, prepared remarks/Q&A, margin-guidance discussion (FY24 EBITDA margin range).
