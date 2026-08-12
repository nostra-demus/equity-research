# Historical Financials — HAIER (Haier Smart Home Co., Ltd., SHSE: 600690 / SEHK: 6690)

**Jurisdiction note:** Haier Smart Home is a mainland-China-incorporated, dual-primary-listed filer (Shanghai Stock Exchange A-shares + Hong Kong Stock Exchange H-shares, plus a Frankfurt D-share line). The A-share annual and quarterly filings are prepared under China Accounting Standards for Business Enterprises (CAS/ASBE); the H-share annual report restates to IFRS, but the filings state net profit and equity attributable to owners "are not different" between the two bases [FY2025 Annual Report (H-share/IFRS), Apr-27-2026, contents page]. All figures below are in RMB (CNY) millions unless stated otherwise, fiscal year ending December 31. Where a number is drawn from the CapIQ workbook export rather than a company filing, it is labelled "CapIQ export" — no `ciq_facts.json` sidecar exists for this ticker, so these are this agent's own sourced reads, not a mechanically-pinned sidecar value.

**Data limitation flagged up front:** the only call-derived commentary source in the pool is two ~7-year-stale 2019 transcripts (no probative value) and no sell-side proxy exists, so all narrative colour below comes from filings' MD&A, not a call — consistent with the `00_earnings-data-triage` finding. Separately, Haier's quarterly filings (CAS "quarterly report" format) disclose only revenue, net profit attributable to shareholders, net profit excluding non-recurring items, EPS, and operating cash flow at the discrete-quarter level — **not** a quarterly income statement with COGS/gross margin or EBITDA. Gross margin is disclosed narratively only for the standalone latest quarter and cumulative year-to-date; EBITDA is never disclosed on a quarterly basis. This caps what Section 3 can show — flagged in place, not silently left blank.

---

## 1. Annual Financial Table (5 years)

**Currency: RMB (CNY) millions. Reporting standard: China ASBE (CAS), A-share basis.** Revenue, net profit attributable to shareholders, CFO, and EPS for FY2023–FY2025 are the company's own reported figures [FY2025 Annual Report (A-share/CAS), Mar-26-2026, p.12, "近三年主要会计数据和财务指标" (Major Accounting Data and Financial Indicators, Last 3 Years)]; these reconcile to within rounding of the CapIQ export for the same years. FY2021–FY2022, plus Gross Profit/EBITDA/EBIT (non-headline items the company does not report as standalone metrics), are CapIQ export values only, sourced from "Haier Smart Home Co Ltd SHSE 600690 Financials.xls" (Income Statement / Balance Sheet / Cash Flow / Key Stats tabs), data as of 2026-08-13.

| Metric | FY2021 | FY2022 | FY2023 | FY2024 | FY2025 | Trend |
|---|---:|---:|---:|---:|---:|---|
| Revenue | 227,105.8 | 243,578.9 | 274,204.5 | 286,015.3 | 302,346.8 | Volatile |
| Revenue YoY % | n/a | +7.25% | +12.57% | +4.31% | +5.71% | Volatile |
| Gross Profit | 70,098.6 | 75,170.7 | 74,274.6 | 78,600.5 | 79,614.3 | Volatile |
| Gross Margin % | 30.87% | 30.86% | 27.09% | 27.48% | 26.33% | Volatile |
| EBITDA | 18,229.1 | 19,678.9 | 23,668.6 | 28,024.6 | 26,543.4 | Inflecting |
| EBITDA Margin % | 8.03% | 8.08% | 8.63% | 9.80% | 8.78% | Inflecting |
| EBIT | 13,423.7 | 14,934.9 | 18,140.5 | 21,899.0 | 20,866.8 | Inflecting |
| EBIT Margin % | 5.91% | 6.13% | 6.62% | 7.66% | 6.90% | Inflecting |
| EPS (diluted) | 1.40 | 1.57 | 1.78 | 2.02 | 2.10 | Decelerating |
| CFO | 23,235.4 | 20,256.6 | 26,535.8 | 26,318.1 | 26,002.9 | Volatile |
| Capex | (7,372.4) | (8,209.8) | (10,541.6) | (10,080.1) | (8,851.6) | Inflecting |
| FCF (CFO − Capex) | 15,863.0 | 12,046.8 | 15,994.2 | 16,238.0 | 17,151.3 | Stable |
| Working Capital | (974.9) | 11,707.7 | 15,099.0 | 2,359.3 | 10,487.2 | Volatile |
| Net Debt (strict)¹ | (22,083.3) | (24,316.9) | (23,065.2) | (15,949.5) | (4,952.2) | Inflecting |
| Net Debt / EBITDA | (1.21x) | (1.24x) | (0.97x) | (0.57x) | (0.19x) | Inflecting |

Evidence: Revenue/Net Profit/CFO/EPS FY2023–FY2025 [FY2025 Annual Report (A-share/CAS), Mar-26-2026, p.12]; all other cells [CapIQ export "Financials.xls" — Income Statement/Balance Sheet/Cash Flow/Key Stats tabs, data as of 2026-08-13].

¹ **Net Debt basis note (§15):** "Net Debt (strict)" = Total Debt − Cash and Equivalents only, computed by this agent (Bash-executed, shown below). CapIQ's own "Net Debt" line nets a **broad** cash base (cash + short-term investments + trading securities) against total debt and is more negative each year: FY2021 (25,186.0), FY2022 (26,479.3), FY2023 (25,552.5), FY2024 (19,121.3), FY2025 (16,975.1) — CapIQ export, Balance Sheet tab. Both bases show the same direction: Haier's net-cash cushion has shrunk every year since FY2022, i.e., leverage has been rising off a very light base even though the company remains net-cash on both measures through FY2025.

**Gross margin reconciliation flag:** the company's own FY2025 P&L movement table gives 营业成本 (cost of revenue) of RMB 221,738.8mn against revenue of RMB 302,346.8mn — a gross margin of 26.66% — versus the CapIQ-derived 26.33% shown above (COGS 222,732.5mn); FY2024 shows a similar ~34bp gap (27.82% company-derived vs. 27.48% CapIQ) [FY2025 Annual Report (A-share/CAS), Mar-26-2026, p.40, "利润表及现金流量表相关科目变动分析表"]. The gap is consistent in direction and small (30–35bps); it likely reflects a different classification of a minor cost line (e.g., taxes and surcharges) between CapIQ's standard template and the company's own COGS line. The CapIQ-based series is used throughout for cross-year comparability since FY2021–FY2022 company-reported COGS is not in this data pool; the company's own audited FY2025/FY2024 figures are the higher-tier source where the two diverge (§4).

**Bash verification (self-check requirement):** all YoY %, margin %, FCF, and Net Debt/EBITDA cells above were computed via an executed Python script, not mental arithmetic. Sample output:
```
FY2023: RevYoY=12.57% GM=27.09% EBITDAmgn=8.63% EBITmgn=6.62% FCF=15994.2 NetDebtStrict=-23065.2 ND/EBITDA=-0.975x WC=15099.0
FY2025: RevYoY=5.71%  GM=26.33% EBITDAmgn=8.78% EBITmgn=6.90% FCF=17151.3 NetDebtStrict=-4952.2  ND/EBITDA=-0.187x WC=10487.2
```

---

## 2. TTM Snapshot

Latest TTM = 12 months ended Mar-31-2026 (CapIQ "LTM" column, reconciling Q1 2026's reported figures into the trailing period). A true prior-TTM ending Mar-31-2025 cannot be cleanly computed from this pool: it would require a standalone Q1 2024 figure, and the only Q1 2024 number available (CapIQ quarterly consensus "actual," RMB 68,977.5mn) pre-dates the Dec-2024/Mar-2025 restatement from the Youjin and COSMOPlat business combinations under common control, so combining it with the restated FY2024 total would silently mix two accounting bases (§15). Instead, **FY2025 (12 months ended Dec-31-2025)** is shown as the nearest reconcilable prior 12-month window — it overlaps 9 of the latest TTM's 12 months rather than being a clean non-overlapping prior year, and that overlap is the reason the "change" column reads small.

| Metric | Latest TTM (ended Mar-31-2026) | FY2025 (ended Dec-31-2025, nearest reconcilable prior period) | Change | Evidence |
|---|---:|---:|---:|---|
| Revenue | 296,915.3 | 302,346.8 | −1.80% | CapIQ export, Financials.xls, LTM Mar-2026 column |
| EBITDA | 25,950.2 | 26,543.4 | −2.23% | CapIQ export, Financials.xls |
| EBIT | 20,385.9 | 20,866.8 | −2.30% | CapIQ export, Financials.xls |
| EPS diluted | 2.01 | 2.10 | −4.28% | CapIQ export, Financials.xls |
| CFO | 25,329.8 | 26,002.9 | −2.59% | CapIQ export, Financials.xls |
| Capex | (9,137.2) | (8,851.6) | +3.23% (more capex) | CapIQ export, Financials.xls |
| FCF | 16,192.6 | 17,151.3 | −5.59% | CFO − Capex, computed by this agent |
| Net debt at latest period-end (strict, Mar-31-2026) | (8,503.5) | (4,952.2) at Dec-31-2025 | Net debt rose RMB 3,551.3mn q/q | Balance Sheet tab, CapIQ export |

Note: net debt is a point-in-time balance-sheet figure, not a TTM flow — the two dates shown are Mar-31-2026 and Dec-31-2025, three months apart, not a 12-month change. CapIQ's own LTM growth-over-prior-year figure for revenue is +1.25% [Key Stats tab] — that compares the LTM window to the LTM ending 12 months earlier (a cleaner like-for-like comparison than the −1.80% shown above, which compares LTM to the overlapping FY2025 full year). Both are shown because the two answer different questions; CapIQ's own LTM-vs-LTM growth rate is the more decision-useful YoY read.

---

## 3. Latest Quarterly Trend Table (5 quarters — fewer than 8 available)

Only 5 consecutive quarters can be built on a single, internally consistent basis from this pool: Q1 2025–Q1 2026. These come from two primary sources that cross-check exactly — the FY2025 Annual Report's own quarterly breakdown table [FY2025 Annual Report (A-share/CAS), Mar-26-2026, p.13, "2025年分季度主要财务数据" (2025 Quarterly Financial Data)] for Q1–Q4 2025, and the Q1 2026 Quarterly Report for Q1 2026 and its Q1 2025 comparative [2026 First Quarter Report, Apr-27-2026, p.2]. The four 2025 quarters sum exactly to the FY2025 annual total (RMB 302,346.8mn revenue, RMB 19,552.8mn net profit — verified by Bash arithmetic, zero residual), confirming internal consistency. **Q2–Q4 2024 quarterly figures are deliberately excluded**: the only available quarterly source for 2024 (CapIQ's quarterly consensus "actual" series) predates the same 2024/2025 restatement noted in Section 2 and sums to RMB 276,212.7mn for FY2024 — RMB 9,802.6mn (3.4%) short of the restated FY2024 annual total of RMB 286,015.3mn — so using it would mix a pre-restatement quarterly split with a post-restatement base (§15). This is a real gap, not an oversight.

Gross Margin % and EBITDA / EBITDA Margin % are **not disclosed by the company at the discrete-quarter level** — Chinese CAS quarterly filings give revenue, net profit, EPS, and CFO only; gross margin is disclosed narratively but only for the standalone latest quarter and the cumulative year-to-date, never for interior quarters. Those cells are marked "Not disclosed."

| Metric | Q1 2025 | Q2 2025 | Q3 2025 | Q4 2025 | Q1 2026 | QoQ Trend | YoY vs Same Q |
|---|---:|---:|---:|---:|---:|---|---|
| Revenue | 79,118.2 | 77,375.9 | 77,559.6 | 68,293.2 | 73,686.7 | Volatile (−2.20%, +0.24%, −11.95%, +7.90%) | Q3 2025 +9.51%² ; Q1 2026 −6.86%³; Q1/Q2/Q4 2025 vs 2024 not computable (§15, see above) |
| Gross Margin % | ~25.4% (derived)⁴ | Not disclosed | Not disclosed | Not disclosed | 25.3%³ | Not assessable | Q1 2026 down ~0.1pp YoY³ |
| EBITDA | Not disclosed | Not disclosed | Not disclosed | Not disclosed | Not disclosed | Not assessable | Not assessable |
| EBITDA Margin % | Not disclosed | Not disclosed | Not disclosed | Not disclosed | Not disclosed | Not assessable | Not assessable |
| EPS (diluted) | 0.59³ | 0.70 (derived)⁵ | 0.58² | 0.23 (derived)⁵ | 0.50³ | Volatile | Q1 2026 −15.25%³ |

² [2025 Third Quarter Report, Oct-30-2025, p.2–3] — Q3 2025 revenue RMB 77,559,583,508.49, +9.51% YoY (vs Q3 2024 after restatement); diluted EPS RMB 0.58.
³ [2026 First Quarter Report, Apr-27-2026, p.2] — Q1 2026 revenue RMB 73,686,720,161.13 (−6.86% YoY), net profit attributable RMB 4,651,612,980.68 (−15.22% YoY), basic and diluted EPS RMB 0.50 (−15.25% YoY); gross margin 25.3%, "down 0.1 percentage points year-on-year" [same filing, p.9, "II. Gross Margin"].
⁴ Q1 2025 gross margin is not separately disclosed as an absolute figure; it is back-solved from the Q1 2026 filing's own stated YoY delta (25.3% + 0.1pp ≈ 25.4%). Labelled *Inference, not from filings* for the absolute Q1 2025 number, though the delta itself is company-disclosed.
⁵ Q2 2025 and Q4 2025 diluted EPS are not separately disclosed by the company at the standalone-quarter level. Derived by this agent as (quarterly net profit attributable to shareholders) ÷ (FY2025 weighted-average diluted share count, 9,310.9mn) — RMB 6,546.4mn ÷ 9,310.9mn = RMB 0.70 for Q2; RMB 2,180.1mn ÷ 9,310.9mn = RMB 0.23 for Q4. *Inference, not from filings.* Cross-check: the same method applied to the three company-disclosed quarters (Q1 2025, Q3 2025, Q1 2026) reproduces the reported EPS within RMB 0.01, supporting the approximation.

Net profit attributable to shareholders by quarter (context, not a template row but the underlying driver of the EPS swings above): Q1 2025 RMB 5,486.6mn; Q2 2025 RMB 6,546.4mn; Q3 2025 RMB 5,339.7mn; Q4 2025 RMB 2,180.1mn; Q1 2026 RMB 4,651.6mn [FY2025 Annual Report, p.13; 2026 First Quarter Report, p.2]. Q4 2025 was the weakest quarter of the year by a wide margin — net profit fell 59% quarter-on-quarter from Q3 2025 before recovering to RMB 4,651.6mn in Q1 2026.

---

## 4. Reported vs Adjusted Metrics

The company adjusts **net profit and basic EPS only** — for non-recurring items defined under China's CSRC disclosure rules (asset-disposal gains/losses, government subsidies unrelated to core operations, fair-value gains on equity investments, and similar one-off items) [FY2025 Annual Report (A-share/CAS), Mar-26-2026, p.12–13 and p.15 ("非经常性损益项目和金额")]. It does **not** publish an adjusted/non-GAAP EBITDA or EBIT.

| Metric | Reported Value (FY2025) | Adjusted Value (FY2025, ex non-recurring items) | Adjustment Amount | Adjustment Reason | Evidence |
|---|---:|---:|---:|---|---|
| EBITDA | 26,543.4 | — | — | Company does not disclose adjusted metrics. | — |
| EBIT | 20,866.8 | — | — | Company does not disclose adjusted metrics. | — |
| Net Profit attributable to shareholders | 19,552.8 | 18,603.6 | 949.2 | Deducts non-recurring gains (asset disposals, non-core government subsidies, equity fair-value gains) per CSRC-defined non-recurring P&L list. | [FY2025 Annual Report, p.12] |
| Basic EPS | 2.12 | 2.02 | 0.10 | Same basis as above, per-share. | [FY2025 Annual Report, p.12] |

Quarterly adjusted net profit (ex non-recurring items), for reference: Q1 2025 RMB 5,364.1mn; Q2 2025 RMB 6,338.3mn; Q3 2025 RMB 5,189.9mn; Q4 2025 RMB 1,711.3mn; Q1 2026 RMB 4,441.4mn [FY2025 Annual Report, p.13; 2026 First Quarter Report, p.2].

---

## 5. Quarterly Seasonality Table (last 3 fiscal years)

**Insufficient quarterly history for a 3-year seasonality table.** Only FY2025 has a clean, filing-sourced quarterly split in this pool; FY2024 and FY2023 quarterly splits either do not exist as standalone filings in `data/HAIER/` or (for the CapIQ consensus-actual series) sit on a pre-restatement basis that does not reconcile to the restated annual totals (Section 3). Per the module's partial-data rule, the formal 3-year table is skipped rather than built on an inconsistent base.

As directional colour only (one year, not a seasonality pattern — do not treat as confirmed seasonality), FY2025's own quarterly revenue shares [computed from FY2025 Annual Report, p.13, verified by Bash]:

| Quarter | FY2025 Revenue Share | FY2025 EBITDA Margin |
|---|---:|---:|
| Q1 | 26.17% | Not disclosed (quarterly) |
| Q2 | 25.59% | Not disclosed (quarterly) |
| Q3 | 25.65% | Not disclosed (quarterly) |
| Q4 | 22.59% | Not disclosed (quarterly) |

No quarter in FY2025 exceeds 30% or falls below 20% of annual revenue, so no flag applies under the module's seasonality threshold — but Q4 is notably the softest of the four (about 3.5–3.6 percentage points below the other three), and Q4 2025 net profit (Section 3) was also the weakest of the year by a wide margin. Whether this is a repeating seasonal pattern or specific to 2025 cannot be established from one year of clean data.

---

## 6. Key Trend Summary

Revenue growth is **volatile, not smoothly decelerating or accelerating**: +7.25% (FY2022) → +12.57% (FY2023, the strongest year) → +4.31% (FY2024) → +5.71% (FY2025) → +1.25% on a trailing-twelve-month basis to Mar-2026 [CapIQ Key Stats, LTM growth-over-prior-year] → an outright −6.86% year-on-year decline in the standalone Q1 2026 quarter [2026 First Quarter Report, p.2]. Margins **expanded through FY2024 and then compressed in FY2025**: gross margin fell steadily from 30.9% (FY2021) to 26.3% (FY2025, a ~460bp compression over the period, largest single-year drop in FY2023), while EBITDA and EBIT margins rose from FY2021 through a FY2024 peak (9.80% EBITDA margin, 7.66% EBIT margin) before falling back in FY2025 (8.78% and 6.90% respectively) — both margin lines inflect downward in the same year. Seasonality cannot be confirmed with the available data (Section 5), though FY2025's one clean year shows Q4 as the softest quarter for both revenue share and profit. The clearest inflection point in the most recent data is Q1 2026: management attributes the quarter's profit weakness explicitly to two dated, named, one-time items in the North American market — unusual winter storms that management says cut industry volume by roughly 10%, and a year-on-year increase in tariff costs — stating that **excluding North America, operating profit grew over 10%** in the quarter [2026 First Quarter Report, Apr-27-2026, p.2]. That is a company claim about an ex-one-off result, not an independently verified figure, and it has not been reconciled to a segment P&L in this report — but it is directly relevant to how the Q1 2026 revenue and profit decline should be read: as a plausible one-time regional shock layered on an already-decelerating consolidated growth rate, not evidence that the whole business inflected negative. Separately, the balance sheet shows a genuine multi-year trend, not noise: Haier's net-cash cushion has shrunk every year since FY2022 on both the strict basis (net debt/EBITDA moving from −1.24x in FY2022 to −0.19x in FY2025) and CapIQ's broader cash-inclusive basis — the company remains net-cash through the latest quarter, but the cushion is visibly thinner than it was three years ago.

---

## 7. Citations

[1] FY2025 Annual Report (A-share/CAS), "海尔智家股份有限公司2025年年度报告," filed 2026-03-26 — `Haier_Smart_Home_Co_Ltd_-_Form_Annual_Report(Mar-26-2026).pdf`, pp.12–13, 15, 40
[2] FY2025 Annual Report (H-share/IFRS), filed 2026-04-27 — `Haier_Smart_Home_Co_Ltd_-_Form_Annual_Report(Apr-27-2026).pdf`, contents page
[3] 2026 First Quarter Report (Q1 2026, CAS, unaudited), filed 2026-04-27 — `Haier_Smart_Home_Co_Ltd_-_Form_Interim_Report(Apr-27-2026).pdf`, pp.2, 9
[4] 2025 Third Quarter Report (Q3 2025, CAS, unaudited), filed 2025-10-30 — `Haier_Smart_Home_Co_Ltd_-_Form_Interim_Report(Oct-30-2025).pdf`, pp.2–3, 8
[5] CapIQ export, "Haier Smart Home Co Ltd SHSE 600690 Financials.xls" — Income Statement, Balance Sheet, Cash Flow, Key Stats tabs, data as of 2026-08-13
[6] CapIQ export, "HaierSmartHomeCo,LtdSHSE600690EstimatesReport.xls" — Consensus tab (quarterly actuals series, used only to identify and flag the pre-restatement basis mismatch, not as a cited figure), data as of 2026-08-13
[7] Earnings Data Triage — HAIER, `analyses/HAIER_2026-08-13/earnings/00_earnings-data-triage.md` (jurisdiction, source inventory, and partial-data flags referenced throughout)
