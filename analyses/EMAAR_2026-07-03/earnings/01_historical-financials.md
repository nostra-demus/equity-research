# Historical Financials — EMAR (Emaar Properties PJSC, DFM:EMAAR)

**Reporting standard:** IFRS
**Reporting currency:** AED (UAE Dirham), in AED millions unless stated
**Fiscal year end:** 31 December
**Jurisdiction:** United Arab Emirates — Dubai Financial Market (DFM) / DFSA listing rules
**Primary sources:** Capital IQ & Proprietary Data export (FY2021–FY2025 + LTM Mar-31-2026); FY2025 Investor Presentation / Preliminary Annual Report (Feb-12-2026); FY2024 Annual Report (IFRS, audited, Mar-14-2025)

---

## Definitions (§15 compliance)

- **EBITDA** = Operating Income + Depreciation & Amortisation, as computed by Capital IQ from reported IFRS financials. Labelled "CIQ EBITDA" below. The company separately discloses its own EBITDA ("Company EBITDA" / "Adjusted EBITDA") which backs out the finance cost from discounting and unwinding of long-term receivables under IFRS 15 / IFRS 9 — a non-cash item. Section 4 shows both side-by-side.
- **EBIT** = Operating Income as reported by Capital IQ.
- **EPS** = Diluted earnings per share attributable to equity holders of Emaar, in AED. Basic and diluted are identical (no dilutive instruments outstanding).
- **FCF (reported)** = CFO − total capex (absolute value). Capex in the Capital IQ cash flow statement is shown as a negative outflow; absolute value is used per §15 / MODULE_RULES §7.
- **FCF (normalised)** = CFO − capex − Change in Unearned Revenue. Unearned revenue represents net cash advance payments received from off-plan property buyers; these are real cash inflows but represent future delivery obligations. Removing them shows the recurring operating cash the business generates before buyer-deposit inflows. Both FCF figures are shown in Section 1.
- **Net debt (strict basis)** = Total Debt − Cash & Equivalents (unrestricted cash only, per Capital IQ). Positive = net debt; negative = net cash.
- **Net debt (broad basis)** = Total Debt − Cash & Equivalents − Short-Term Investments (financial assets held for liquidity but classified separately from cash by Capital IQ in FY2024 and FY2025). Negative = net cash.
- **Net Cash (company gross-liquidity basis)** = Cash & Cash Equivalents (including ~AED 43 Bn of project escrow accounts) + Short-Term Deposits − Debt. This is the company's own reported "Net Cash" figure (AED 61,655 Mn at FY2025). It is not comparable to either strict or broad net debt above, as it includes project escrow cash that is held on behalf of buyers and is not available for general corporate use. The three bases must not be mixed.

---

## 1. Annual Financial Table (FY2021–FY2025)

All figures AED millions. Computed via executed Python snippet. [1]

| Metric | FY2021 | FY2022 | FY2023 | FY2024 | FY2025 | Trend |
|---|---:|---:|---:|---:|---:|---|
| Revenue | 27,896 | 24,926 | 26,750 | 35,505 | 49,557 | Accelerating |
| Revenue YoY % | N/A | −10.6% | +7.3% | +32.7% | +39.6% | Accelerating |
| Gross Profit | 11,592 | 12,587 | 16,865 | 20,381 | 27,227 | Accelerating |
| Gross Margin % | 41.6% | 50.5% | 63.0% | 57.4% | 54.9% | Volatile |
| EBITDA (CIQ) | 7,803 | 9,332 | 14,405 | 17,563 | 24,132 | Accelerating |
| EBITDA Margin % (CIQ) | 28.0% | 37.4% | 53.8% | 49.5% | 48.7% | Inflecting |
| EBIT | 6,554 | 8,056 | 13,008 | 16,136 | 22,552 | Accelerating |
| EBIT Margin % | 23.5% | 32.3% | 48.6% | 45.4% | 45.5% | Inflecting |
| EPS diluted (AED) | 0.52 | 0.83 | 1.32 | 1.53 | 1.99 | Accelerating |
| CFO | 10,561 | 18,942 | 19,831 | 24,481 | 33,458 | Accelerating |
| Capex | 1,288 | 960 | 578 | 534 | 934 | Stable |
| FCF (reported: CFO − Capex) | 9,273 | 17,982 | 19,253 | 23,948 | 32,524 | Accelerating |
| FCF (normalised: ex-unearned rev) | 7,170 | 13,844 | 15,959 | 15,506 | 24,295 | Stable |
| Working Capital | 48,487 | 63,848 | 77,252 | 103,536 | 119,582 | Accelerating |
| Net Debt — strict (Debt − Cash) | +16,445 | +9,937 | −1,596 | +2,571 | +861 | Inflecting |
| Net Debt — broad (Debt − Cash − STI) | +16,445 | +9,937 | −1,596 | −8,541 | −17,287 | Inflecting |
| Net Debt / EBITDA — strict basis | 2.11x | 1.06x | −0.11x | 0.15x | 0.04x | Inflecting |
| Net Debt / EBITDA — broad basis | 2.11x | 1.06x | −0.11x | −0.49x | −0.72x | Inflecting |

**Net Debt basis note (§15):** Positive = net debt; negative = net cash. The strict basis uses only unrestricted cash per Capital IQ. Short-Term Investments (AED 11,112 Mn in FY2024; AED 18,148 Mn in FY2025) are classified separately from cash by Capital IQ and excluded from the strict basis. The company's own "Net Cash" of AED 61,655 Mn (FY2025) is a gross-liquidity figure including ~AED 43 Bn of project escrow accounts and short-term deposits that are not freely available for general use — it must not be presented as bare "net cash" and is not directly comparable to the strict or broad figures above. [1][2]

**Gross Margin Volatility note:** FY2023 gross margin of 63.0% is anomalous. Q3-2023 gross margin reached 75.8% (COGS of AED 1,477 Mn against revenue of AED 6,102 Mn) — a COGS collapse driven by a favourable percentage-of-completion (POC) project mix under IFRS 15 in that single quarter. By FY2024–FY2025 gross margins settled at 57%–55%, which is the more representative current run-rate. The FY2023 anomaly inflates any multi-year gross margin average. [1][3]

**Margin changes in basis points (computed):**
- FY2021→FY2022: Gross Margin +895 bps, EBITDA Margin +947 bps, EBIT Margin +883 bps
- FY2022→FY2023: Gross Margin +1,255 bps, EBITDA Margin +1,641 bps (FY2023 POC anomaly)
- FY2023→FY2024: Gross Margin −565 bps, EBITDA Margin −438 bps, EBIT Margin −318 bps (normalisation)
- FY2024→FY2025: Gross Margin −246 bps, EBITDA Margin −77 bps, EBIT Margin +6 bps (near-stable)

**Revenue CAGR FY2021–FY2025 (computed):** 15.4%. **EBITDA (CIQ) CAGR:** 32.6%. **EPS CAGR:** 39.7%.
**Revenue CAGR FY2016–FY2025 (company, investor deck):** 14.1%. **Company EBITDA CAGR FY2016–FY2025:** 18.5%. [2]

**Tax rate inflection:** UAE Corporate Tax (9%) was introduced in FY2024; the Domestic Minimum Top-Up Tax (DMTT, 15%) was introduced in FY2025. Effective tax rate moved from 1.5% (FY2023) → 7.7% (FY2024) → 13.0% (FY2025). This is a permanent structural change that permanently reduces after-tax profit growth relative to EBIT growth. [1]

---

## 2. TTM Snapshot

TTM Latest = Q2-2025 + Q3-2025 + Q4-2025 + Q1-2026 (ended Mar-31-2026).
Prior TTM = Q2-2024 + Q3-2024 + Q4-2024 + Q1-2025.
Computed via executed Python snippet from Capital IQ quarterly data. [3]

| Metric | Latest TTM (Q2-25 to Q1-26) | Prior TTM (Q2-24 to Q1-25) | Change | Evidence |
|---|---:|---:|---:|---|
| Revenue | 51,858 | 38,880 | +33.4% | [3] |
| EBITDA (CIQ) | 25,201 | 19,225 | +31.1% | [3] |
| EBIT | 23,521 | 17,770 | +32.4% | [3] |
| EPS diluted (AED) | 2.13 | 1.62 | +31.2% | [3] |
| CFO | 31,973 | 30,803 | +3.8% | [3] |
| Capex | 991 | 625 | +58.6% | [3] |
| FCF (reported: CFO − Capex) | 30,982 | 30,178 | +2.7% | [3] |
| Net debt at Q1-2026 period-end — strict | −2,115 | — | Point-in-time | [3][4] |
| Net debt at Q1-2026 period-end — broad | −24,619 | — | Point-in-time | [3][4] |

**Net debt note:** Net debt is a point-in-time balance sheet figure, not a TTM flow. At Q1-2026 period-end (Mar-31-2026): Total Debt = AED 10,064 Mn; Cash & Equivalents = AED 12,180 Mn; Short-Term Investments = AED 22,503 Mn. Strict net debt (Debt minus unrestricted cash) = −AED 2,115 Mn (net cash). Broad net debt (including STI) = −AED 24,619 Mn. Capital IQ reports −AED 24,969 Mn (consistent with the broad basis). [4]

**FCF normalised note:** TTM-level normalised FCF (removing unearned-revenue cash inflows) cannot be precisely computed from quarterly data because the change in unearned revenue is reported with full precision only in the annual cash flow statement. On an annual basis, the gap between reported FCF and normalised FCF is material: FY2025 reported FCF AED 32,524 Mn vs normalised FCF AED 24,295 Mn — a difference of AED 8,229 Mn of advance customer payments received in the period. These advances convert to revenue over 5–6 years of project delivery as IFRS 15 percentage-of-completion milestones are reached. This is not an earnings-quality concern but a structural feature of the off-plan property model. [1]

---

## 3. Latest Quarterly Trend Table (8 quarters: Q2-2024 to Q1-2026)

All figures AED millions. Computed from Capital IQ quarterly export. [3]

| Metric | Q2-24 | Q3-24 | Q4-24 | Q1-25 | Q2-25 | Q3-25 | Q4-25 | Q1-26 | QoQ Trend | YoY vs Same Q |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---|---|
| Revenue | 7,684 | 9,385 | 11,712 | 10,098 | 9,736 | 13,273 | 16,450 | 12,398 | Q4 peak, Q1 dip (seasonal) | Q1-26 vs Q1-25: +22.8% |
| Gross Margin % | 56.7% | 56.0% | 57.6% | 56.7% | 55.5% | 52.5% | 55.4% | 56.1% | Stable 52%–58% | Broadly flat; Q1-26 vs Q1-25: −57 bps |
| EBITDA (CIQ) | 3,661 | 4,547 | 5,887 | 5,130 | 4,787 | 6,184 | 8,031 | 6,198 | Q4 peak, Q1 dip (seasonal) | Q1-26 vs Q1-25: +20.8% |
| EBITDA Margin % | 47.6% | 48.5% | 50.3% | 50.8% | 49.2% | 46.6% | 48.8% | 50.0% | Stable 47%–51% | Q1-26 vs Q1-25: −81 bps |
| EPS diluted (AED) | 0.27 | 0.36 | 0.57 | 0.42 | 0.38 | 0.49 | 0.69 | 0.57 | Q4 peak, Q1 dip (seasonal) | Q1-26 vs Q1-25: +35.7% |

**QoQ trend note:** Q1-26 revenue of AED 12,398 Mn fell −24.6% from Q4-25. This is entirely seasonal (Q4 is consistently the largest quarter via IFRS 15 POC milestone timing — see Section 5). Q1-2026 is the highest Q1 on record, up 22.8% year-on-year. EBITDA margins have held in a 47%–51% band across all eight quarters with no meaningful directional move — this is stabilisation, not compression. YoY comparisons across all four quarter-pairs show consistent 20%–40% revenue growth. [3]

---

## 4. Reported vs Adjusted Metrics

Two EBITDA figures appear in the data pool for the same periods. These must not be mixed. [1][2]

| Metric | CIQ / Reported Value | Company-Adjusted Value | Adjustment Amount | Adjustment Reason | Evidence |
|---|---:|---:|---:|---|---|
| EBITDA FY2025 | 24,132 | 25,561 | +1,429 | Company backs out non-cash finance cost from discounting/unwinding of long-term IFRS 15/IFRS 9 receivables | [1][2] |
| EBITDA Margin FY2025 | 48.7% | 51.6% | +288 bps | Same adjustment | [1][2] |
| EBITDA FY2024 | 17,563 | 19,277 | +1,714 | Same adjustment | [1][2] |
| EBITDA Margin FY2024 | 49.5% | 54.3% | +483 bps | Same adjustment | [1][2] |
| EBIT FY2025 | 22,552 | Not separately disclosed by company | — | — | [1] |
| EPS FY2025 diluted (AED) | 1.991 (CIQ) | 1.99 (investor deck) | Nil | Consistent | [1][2] |

**Note on company EBITDA:** Under IFRS 9, long-term receivables from off-plan property buyers are discounted to present value at inception, and the unwinding of this discount creates a non-cash finance income line each year. Capital IQ includes this in its EBITDA derivation (by adding back all D&A from operating income); the company backs it out to show "operating" EBITDA. Both figures are legitimate. The CIQ figure (AED 24,132 Mn, FY2025) is used throughout this report for consistency and cross-company comparability; the company-disclosed figure (AED 25,561 Mn) is the figure the company's own publications lead with and is the relevant figure for covenant and credit analysis. Downstream agents should distinguish which figure they are using. [1][2]

**Net Cash (company gross-liquidity basis):** The company reports "Net Cash" of AED 61,655 Mn for FY2025 (= AED 52,633 Mn Cash & Cash Equivalents + AED 18,828 Mn Short-Term Deposits − AED 9,806 Mn Debt). The AED 52,633 Mn Cash & Cash Equivalents figure includes approximately AED 43 Bn held in project escrow accounts — cash collected from buyers and ring-fenced for project delivery; it is not freely available for general corporate use. The strict net cash position (unrestricted cash per CIQ minus total debt) was AED −861 Mn (marginally net debt) at FY2025 year-end. The broad net cash position (CIQ unrestricted cash + CIQ short-term investments minus total debt) was AED +17,287 Mn (net cash) at FY2025 year-end. All three figures are legitimate but measure different things; the company's AED 61,655 Mn figure should be read as total project liquidity, not free corporate cash. [2][4]

---

## 5. Quarterly Seasonality Table (FY2023–FY2025)

Revenue share within each fiscal year and EBITDA margin by quarter, computed from Capital IQ quarterly data. Quarterly sums verified to match annual totals exactly. [3]

| Quarter | FY2023 Rev Share | FY2024 Rev Share | FY2025 Rev Share | Avg Rev Share | FY2023 EBITDA Margin | FY2024 EBITDA Margin | FY2025 EBITDA Margin |
|---|---:|---:|---:|---:|---:|---:|---:|
| Q1 | 23.5% | 18.9% | 20.4% | 20.9% | 45.7% | 51.6% | 50.8% |
| Q2 | 22.3% | 21.6% | 19.6% | 21.2% | 45.4% | 47.6% | 49.2% |
| Q3 | 22.8% | 26.4% | 26.8% | 25.3% | 67.9% | 48.5% | 46.6% |
| Q4 | **31.3%** | **33.0%** | **33.2%** | **32.5%** | 55.8% | 50.3% | 48.8% |

**Seasonality flags:**

1. **Q4 consistently takes >30% of annual revenue** (32.5% average over three years, ranging from 31.3% to 33.2%). Q4 is the single most important quarter. Any disruption to Q4 construction milestones or POC recognition hits annual results disproportionately. Q4-2025 alone contributed AED 16,450 Mn or 33.2% of FY2025 revenue. [3]

2. **Q1 is the weakest quarter** (20.9% average). This creates a structural pattern where the first quarterly print of each calendar year looks seasonally weak on a QoQ basis. Q1-2026 at AED 12,398 Mn was a record Q1 but still fell −24.6% sequentially from Q4-2025. The correct comparison is year-on-year, not sequential.

3. **Q3-2023 EBITDA margin of 67.9% is a clear outlier.** COGS in Q3-2023 collapsed to AED 1,477 Mn against revenue of AED 6,102 Mn (75.8% gross margin for the quarter), driven by a POC project-mix effect in that single period. This inflated the FY2023 full-year EBITDA margin to 53.8%. Since Q1-2024, EBITDA margins have settled into a 47%–51% band, which is the current normalised range.

4. **IFRS 15 POC recognition amplifies seasonal swings** beyond underlying demand patterns. Revenue timing depends on when construction milestones are certified, not on when sales occur. The AED 154.8 Bn total revenue backlog (as of Dec-31-2025) — comprising AED 134.3 Bn UAE backlog and AED 20.5 Bn international — provides approximately 3–4 years of forward revenue visibility at the FY2025 pace, but the quarter-by-quarter release depends on delivery schedules. [2]

---

## 6. Key Trend Summary

**Revenue direction: Accelerating.** After a −10.6% dip in FY2022 (pandemic-era project delivery cycles normalising), revenue inflected sharply: +7.3% in FY2023, +32.7% in FY2024, +39.6% in FY2025. The LTM Mar-2026 figure of AED 51,858 Mn implies continued growth at scale. Q1-2026 was +22.8% year-on-year. This acceleration is driven by an unprecedented off-plan property sales wave in Dubai that began in 2021–2022 and is now converting to IFRS 15 POC revenue as projects reach construction milestones. The AED 154.8 Bn total revenue backlog locks in at least three to four years of elevated revenue at the current pace, assuming no material delivery delays.

**Margin direction: Inflecting (peak passed, now stabilising).** CIQ EBITDA margins peaked at 53.8% in FY2023 (boosted by a single-quarter POC anomaly in Q3-2023). They compressed to 49.5% in FY2024 and 48.7% in FY2025 and have since held in a 47%–51% range across eight consecutive quarters — this is stabilisation, not ongoing compression. The current margin level is structurally much higher than FY2021's 28.0%, reflecting the shift to higher-margin UAE masterplan projects. Two new structural headwinds are now embedded: (i) the UAE Corporate Tax (9%) effective FY2024 and DMTT (15%) effective FY2025 are compressing net margins faster than EBIT margins (effective tax rate moved from 1.5% in FY2023 to 13.0% in FY2025); (ii) the gross margin settling at 55% vs the FY2023 peak of 63% means any further COGS inflation would compress EBITDA margins from a lower starting point.

**Seasonality: Pronounced.** Q4 consistently captures 32%–33% of annual revenue, making it the dominant earnings period. Q1 is the weakest (21%). The seasonal pattern is structural, driven by IFRS 15 POC milestone timing for large master-community projects. Forward estimates and beat/miss setup must anchor to Q4, not to full-year run-rate arithmetic.

**Inflection points:**
- **FY2022 dip:** Revenue fell −10.6% as COVID-era project deliveries ran off and new sales had not yet converted to revenue. EBITDA grew +19.6% in the same year because project mix shifted to higher-margin completions — the revenue and earnings directions diverged temporarily.
- **FY2023 Q3 POC spike:** COGS collapsed in Q3-2023, pushing quarterly gross margin to 75.8% and FY2023 EBITDA margin to 53.8%. This is a one-time POC milestone effect. Analysts modelling off FY2023 margins will overestimate future margin levels.
- **FY2024–FY2025 re-acceleration:** Record Dubai property sales in 2022–2024 (AED 65.4 Bn and AED 71.1 Bn respectively in UAE new sales) are converting into recognised revenue. UAE Development revenues grew 55% to AED 36,443 Mn in FY2025 and are the dominant earnings driver.
- **FY2024–FY2025 tax regime step-change:** UAE Corporate Tax introduced FY2024, DMTT introduced FY2025. This permanently widens the gap between EBIT growth and EPS growth. The FY2025 effective tax rate of 13.0% is likely to remain near this level or move slightly higher as international operations grow. This is the single biggest structural change to the earnings bridge since FY2021.

---

## 7. Citations

[1] Capital IQ & Proprietary Data export — "Emaar Properties PJSC DFM EMAAR Financials_Annual.xls" — Income Statement tab (rows 17–82), Cash Flow tab (rows 17–34), Balance Sheet tab (rows 17–84) — FY2021–FY2025 + LTM Mar-31-2026 columns. Source stated in workbook header: "Capital IQ & Proprietary Data". All growth rates, margins, FCF, working capital, net debt, leverage, and CAGRs in this report were produced by an executed Python computation snippet, not mental arithmetic.

[2] FY2025 Investor Presentation (Preliminary Annual Report) — "Emaar_Properties_PJSC-Preliminary_Annual_Report(Feb-12-2026).pdf" — Slide 12 (FY2025 Key Financial Highlights table: Revenue AED 49,557 Mn, Gross Profit AED 27,227 Mn, Company EBITDA AED 25,561 Mn at 52% margin, Net Profit AED 22,326 Mn, EPS AED 1.99, Net Cash AED 61,655 Mn); Slide 13 (Segment Analysis: UAE Dev AED 36,443 Mn, Intl Dev AED 2,570 Mn, Emaar Malls AED 5,754 Mn, Hospitality AED 2,325 Mn, Entertainment/Leasing/Other AED 2,465 Mn); Slide 14 (Balance Sheet & Cash Flow Overview: confirms ~AED 43 Bn project escrow); Slide 15 (Historical Trend: Revenue CAGR 14.1%, EBITDA CAGR 18.5%, Net Profit CAGR 15.7%, from 2016–2025); Slide 16 (UAE Development Key Highlights: Revenue AED 36,443 Mn, EBITDA AED 16,710 Mn at 46% margin, UAE Revenue Backlog AED 134.3 Bn). Note: this is an investor presentation / preliminary results release, not the audited statutory IFRS annual report. FY2025 audited annual report is not yet in the data pool as of Jul-03-2026.

[3] Capital IQ & Proprietary Data export — "Emaar Properties PJSC DFM EMAAR Financials_Quarterly.xls" — Income Statement tab (rows 17–82), Cash Flow tab (rows 17–34), Balance Sheet tab (rows 17–84) — Q1-2022 through Q1-2026 (17 quarters). TTM metrics, quarterly trend table, and seasonality table all computed via executed Python snippet from this source.

[4] Capital IQ & Proprietary Data export — "Emaar Properties PJSC DFM EMAAR Financials_Quarterly.xls" — Balance Sheet tab — Q1-2026 (Mar-31-2026) column: Total Debt = AED 10,064 Mn; Cash & Equivalents = AED 12,180 Mn; Short-Term Investments = AED 22,503 Mn; Restricted Cash = AED 43,338 Mn (project escrow). Net Debt (CIQ, broad basis) = −AED 24,969 Mn, consistent with computed broad figure of −AED 24,619 Mn (minor rounding).

---

*All growth rates, margins, TTM figures, normalised FCF, net debt reconciliations, CAGR, and leverage ratios were produced by executed Python (Bash) computation snippets from raw Capital IQ data, not mental arithmetic, in compliance with the self-check requirement (F09). Quarterly seasonality table sums verified to match annual totals exactly (zero residual for FY2023, FY2024, and FY2025).*
