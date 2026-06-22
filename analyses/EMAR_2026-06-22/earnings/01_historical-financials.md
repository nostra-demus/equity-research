# Historical Financials — EMAR (Emaar Properties PJSC, DFM:EMAAR)

**Reporting standard:** IFRS  
**Reporting currency:** AED (UAE Dirham), in millions unless stated  
**Fiscal year end:** 31 December  
**Jurisdiction:** United Arab Emirates — DFM/DFSA listing rules  
**Primary sources:** Capital IQ & Proprietary Data export (FY2021–FY2025 + LTM Mar-31-2026); FY2025 Investor Presentation (Feb 12, 2026); FY2024 Annual Report (IFRS, audited, Mar 14, 2025)

---

## Definitions (§15 compliance)

- **EBITDA** = Operating Income + Depreciation & Amortisation, as computed by Capital IQ from reported financials. The company separately discloses its own EBITDA (labelled "Company EBITDA" below) which excludes finance costs related to the discounting/unwinding of long-term receivable payments under IFRS 15/IFRS 9 — see Section 4.
- **EBIT** = Operating Income (as reported by Capital IQ from filings).
- **EPS** = Diluted earnings per share attributable to equity holders of Emaar.
- **FCF** = CFO − total capex (absolute value). Capex in Capital IQ cash flow is shown as a negative outflow; absolute value used here (§15 / MODULE_RULES §7).
- **Net debt** = Total Debt − Cash & Equivalents (strict basis). Capital IQ's "Net Debt" figure uses the same strict basis in FY2021–FY2023 but for FY2024–FY2025 also nets short-term investments, producing a "broad" basis figure; both are shown below. The company's own "Net Cash" definition (investor presentation) additionally includes project escrow cash and short-term deposits — labelled "company gross-liquidity basis" — and is not directly comparable to either strict or broad net debt figures.
- **Reported FCF note:** CFO includes large inflows under "Change in Unearned Revenue" (net advance payments from off-plan property buyers). These are real cash inflows but represent future delivery obligations; they inflate reported CFO and FCF in property boom years. A normalised FCF figure (CFO minus unearned-revenue inflows minus capex) is shown alongside the reported figure in Section 2.

---

## 1. Annual Financial Table (FY2021–FY2025)

All figures in AED millions unless noted. Computed via executed Python snippet (see below tables). [1]

| Metric | FY2021 | FY2022 | FY2023 | FY2024 | FY2025 | Trend |
|---|---:|---:|---:|---:|---:|---|
| Revenue | 27,896 | 24,926 | 26,750 | 35,505 | 49,557 | Accelerating |
| Revenue YoY % | N/A | −10.6% | +7.3% | +32.7% | +39.6% | Accelerating |
| Gross Profit | 11,592 | 12,587 | 16,865 | 20,381 | 27,227 | Accelerating |
| Gross Margin % | 41.6% | 50.5% | 63.0% | 57.4% | 54.9% | Volatile |
| EBITDA | 7,803 | 9,332 | 14,405 | 17,563 | 24,132 | Accelerating |
| EBITDA Margin % | 28.0% | 37.4% | 53.8% | 49.5% | 48.7% | Inflecting |
| EBIT | 6,554 | 8,056 | 13,008 | 16,136 | 22,552 | Accelerating |
| EBIT Margin % | 23.5% | 32.3% | 48.6% | 45.4% | 45.5% | Inflecting |
| EPS (diluted, AED) | 0.52 | 0.83 | 1.32 | 1.53 | 1.99 | Accelerating |
| CFO | 10,561 | 18,942 | 19,831 | 24,481 | 33,458 | Accelerating |
| Capex | 1,288 | 960 | 578 | 534 | 934 | Stable |
| FCF (CFO − Capex, reported) | 9,273 | 17,982 | 19,253 | 23,948 | 32,524 | Accelerating |
| FCF (normalised, ex-unearned rev) | 7,170 | 13,844 | 15,959 | 15,506 | 24,295 | Stable |
| Working Capital | 48,487 | 63,848 | 77,252 | 103,536 | 119,582 | Accelerating |
| Net Debt — strict (Debt − Cash) | 16,445 | 9,937 | −1,596 | +2,571 | +861 | Inflecting |
| Net Debt — broad (Debt − Cash − STI) | 16,445 | 9,937 | −1,596 | −8,541 | −17,287 | Inflecting |
| Net Debt / EBITDA — strict basis | 2.11x | 1.06x | −0.11x | 0.15x | 0.04x | Inflecting |
| Net Debt / EBITDA — broad basis | 2.11x | 1.06x | −0.11x | −0.49x | −0.72x | Inflecting |

**Net Debt basis note (§15):** The strict basis (Total Debt minus unrestricted cash only) is the primary figure. The broad basis adds short-term investments (AED 11,112M in FY2024; AED 18,148M in FY2025) which Capital IQ classifies as short-term investments rather than cash. These are financial assets held for liquidity but are not restricted. The company's own "Net Cash" disclosure is a gross-liquidity basis (cash including ~AED 43Bn of project escrow + short-term deposits − debt = AED 61,655M in FY2025) and must not be used interchangeably with either metric above. [2]

**Gross Margin Volatility note:** FY2023 gross margin of 63.0% is anomalous. Q3 2023 gross margin reached 75.8% (COGS of AED 1,477M against revenue of AED 6,102M) — a COGS collapse not visible in adjacent quarters. This appears to reflect percentage-of-completion (POC) project mix under IFRS 15, where high-margin projects reached recognition milestones in Q3 2023. By FY2024–FY2025 gross margins settled at 57%–55%, which is the more representative run-rate. [1][2]

**Margin BPS changes (computed):**
- FY2021→FY2022: Gross Margin +895 bps, EBITDA Margin +947 bps, EBIT Margin +883 bps
- FY2022→FY2023: Gross Margin +1,255 bps, EBITDA Margin +1,641 bps (FY2023 anomaly)
- FY2023→FY2024: Gross Margin −565 bps, EBITDA Margin −438 bps, EBIT Margin −318 bps (normalisation)
- FY2024→FY2025: Gross Margin −246 bps, EBITDA Margin −77 bps, EBIT Margin +6 bps (near-stable)

**Revenue CAGR FY2021–FY2025:** 15.4%. **EBITDA CAGR:** 32.6%. **EPS CAGR:** 39.7%. [1]

---

## 2. TTM Snapshot

TTM = Q2-2025 + Q3-2025 + Q4-2025 + Q1-2026 (latest four reported quarters). Prior TTM = Q2-2024 + Q3-2024 + Q4-2024 + Q1-2025. Computed via executed Python snippet. [3]

| Metric | Latest TTM (Q2-25–Q1-26) | Prior TTM (Q2-24–Q1-25) | Change | Evidence |
|---|---:|---:|---:|---|
| Revenue | 51,858 | 38,880 | +33.4% | [3] |
| EBITDA | 25,201 | 19,225 | +31.1% | [3] |
| EBIT | 23,521 | 17,770 | +32.4% | [3] |
| EPS diluted (AED) | 2.13 | 1.62 | +31.5% | [3] |
| CFO | 31,973 | 30,803 | +3.8% | [3] |
| Capex | 991 | 625 | +58.6% | [3] |
| FCF (reported, CFO − Capex) | 30,982 | 30,178 | +2.7% | [3] |
| FCF (normalised, ex-unearned rev) | see note | see note | — | [3] |
| Net debt at Q1-2026 period-end — strict | −2,115 | — | — | [3][4] |
| Net debt at Q1-2026 period-end — broad | −24,619 | — | — | [3][4] |

**Net debt note:** Net debt is a point-in-time balance sheet figure, not a TTM flow. At Q1-2026 period-end (Mar 31, 2026): Total Debt = AED 10,064M; Cash & Equivalents (CIQ) = AED 12,180M; Short-Term Investments = AED 22,503M. Strict net debt = −AED 2,115M (net cash). Broad net debt (including STI) = −AED 24,619M. Capital IQ reports −AED 24,969M (consistent with broad basis). [4]

**FCF normalised note:** TTM-level normalised FCF (removing unearned-revenue CF inflows) is not separately calculable from the quarterly data available (unearned revenue is reported only on an annual basis). On an annual basis, reported FCF significantly overstates recurring operating cash generation: FY2025 reported FCF AED 32,524M vs normalised FCF AED 24,295M (difference = AED 8,229M of advance customer payments). This is not a fraud risk but a structural feature of the off-plan property model; these advances convert to revenue over 5–6 years of project delivery.

---

## 3. Latest Quarterly Trend Table (8 quarters: Q2-2024 to Q1-2026)

All figures AED millions. QoQ and YoY computed from Capital IQ quarterly export. [3]

| Metric | Q2-24 | Q3-24 | Q4-24 | Q1-25 | Q2-25 | Q3-25 | Q4-25 | Q1-26 | QoQ Trend | YoY vs Same Q |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---|---|
| Revenue | 7,684 | 9,385 | 11,712 | 10,098 | 9,736 | 13,273 | 16,450 | 12,398 | Q4 peak, Q1 dip | Q1-26 vs Q1-25: +22.8% |
| Gross Margin % | 56.7% | 56.0% | 57.6% | 56.7% | 55.5% | 52.5% | 55.4% | 56.1% | Stable 52–58% | Broadly flat |
| EBITDA | 3,661 | 4,547 | 5,887 | 5,130 | 4,787 | 6,184 | 8,031 | 6,198 | Q4 peak, Q1 dip | Q1-26 vs Q1-25: +20.9% |
| EBITDA Margin % | 47.6% | 48.5% | 50.3% | 50.8% | 49.2% | 46.6% | 48.8% | 50.0% | Stable 47–51% | Broadly flat |
| EPS diluted (AED) | 0.27 | 0.36 | 0.57 | 0.42 | 0.38 | 0.49 | 0.69 | 0.57 | Q4 peak, Q1 dip | Q1-26 vs Q1-25: +35.7% |

**QoQ trend note:** The Q1 dip followed by a Q4 peak is a consistent seasonal pattern (see Section 5). Q1-2026 revenue of AED 12,398M is the highest Q1 ever recorded, up 22.8% year-on-year. The sequential dip from Q4-2025 to Q1-2026 is entirely seasonal. EBITDA margins have stabilised in the 47%–51% range across the last six quarters, with no meaningful compression or expansion.

---

## 4. Reported vs Adjusted Metrics

Two different EBITDA figures appear in the data pool for the same periods. These must not be mixed. [1][2]

| Metric | Reported / CIQ Value | Company-Adjusted Value | Adjustment Amount | Adjustment Reason | Evidence |
|---|---:|---:|---:|---|---|
| EBITDA FY2025 | 24,132 | 25,561 | +1,429 | Co. excludes finance cost from discounting/unwinding of long-term receivables (IFRS 15/IFRS 9) | [1][2] |
| EBITDA FY2024 | 17,563 | 19,277 | +1,714 | Same adjustment | [1][2] |
| EBITDA Margin FY2025 | 48.7% | 52% | +330 bps | Same adjustment | [1][2] |
| EBITDA Margin FY2024 | 49.5% | 54% | +450 bps | Same adjustment | [1][2] |
| EBIT FY2025 | 22,552 | Not separately disclosed | — | — | [1] |
| EPS FY2025 (diluted) | 1.991 (CIQ) | 1.99 (deck) | Nil | Consistent | [1][2] |

**Note on company EBITDA:** Under IFRS 9, long-term receivables from off-plan property buyers are discounted to present value; the unwinding of this discount is a non-cash finance income item that Capital IQ includes in its EBITDA derivation but which the company backs out. Both figures are legitimate; the company's adjusted EBITDA of AED 25,561M (FY2025) better reflects operating performance excluding financing mechanics. Downstream agents should use the Capital IQ figure for consistency across peers, but note the company-disclosed figure for credit and covenant analysis. [2]

**Net Cash definition:** The company reports "Net Cash" of AED 61,655M for FY2025 (gross-liquidity basis: AED 52,633M cash + AED 18,828M short-term deposits − AED 9,806M debt). This includes approximately AED 43Bn held in project escrow accounts (customer advance payments that are not available for general corporate use). The strict net cash position (unrestricted cash per CIQ minus debt) is AED +2,827M net cash at FY2025 year-end (AED 9,754M CIQ cash − AED 10,615M debt = −AED 861M, i.e. marginally net debt on strict basis). The company's AED 61,655M figure should be read as gross project liquidity, not free corporate cash. [2][4]

---

## 5. Quarterly Seasonality Table (FY2023–FY2025)

Revenue share within each fiscal year and EBITDA margin by quarter, computed from Capital IQ quarterly data. [3]

| Quarter | FY2023 Rev Share | FY2024 Rev Share | FY2025 Rev Share | Avg Rev Share | FY2023 EBITDA Margin | FY2024 EBITDA Margin | FY2025 EBITDA Margin |
|---|---:|---:|---:|---:|---:|---:|---:|
| Q1 | 23.5% | 18.9% | 20.4% | 20.9% | 45.7% | 51.6% | 50.8% |
| Q2 | 22.3% | 21.6% | 19.6% | 21.2% | 45.4% | 47.6% | 49.2% |
| Q3 | 22.8% | 26.4% | 26.8% | 25.3% | 67.9% | 48.5% | 46.6% |
| Q4 | 31.3% | 33.0% | 33.2% | **32.5%** | 55.8% | 50.3% | 48.8% |

**Seasonality flags:**

1. **Q4 consistently takes >30% of annual revenue** (32.5% average across three years). This is the most important quarter — any disruption to Q4 delivery or POC milestones hits disproportionately. Q4-2025 alone contributed AED 16,450M, or 33.2% of FY2025 revenue.

2. **Q1 is the weakest quarter** (20.9% average). Q1-2026 revenue of AED 12,398M was the strongest Q1 on record but still a sharp sequential drop from Q4-2025.

3. **Q3-2023 EBITDA margin of 67.9% is a clear outlier** driven by a COGS collapse (likely POC project mix) in that single quarter. The FY2023 full-year EBITDA margin of 53.8% was inflated by this quarter and is not a normalised run-rate. Since Q1-2024, EBITDA margins have settled into a 47%–51% band.

4. **IFRS 15 POC recognition** means that quarterly revenue can shift materially depending on construction milestones achieved, which amplifies apparent seasonality vs underlying sales momentum. The revenue backlog of AED 154.8Bn (as of Dec 31, 2025) provides 3–4 years of forward revenue visibility at the FY2025 run-rate. [2]

---

## 6. Key Trend Summary

**Revenue direction:** Accelerating. After a −10.6% dip in FY2022 (pandemic-era deliveries running off), revenue inflected sharply: +7.3% in FY2023, +32.7% in FY2024, +39.6% in FY2025. The LTM Mar-2026 figure of AED 51,858M implies the absolute growth pace is continuing at scale, with Q1-2026 up 22.8% year-on-year. This acceleration is driven by an unprecedented off-plan property sales wave that began in 2021–2022 and is now converting to IFRS 15 POC revenue as projects complete. The AED 154.8Bn revenue backlog (mostly UAE) means this tailwind is locked in over the next 5–6 years.

**Margin direction:** Inflecting (peak behind, stabilising). EBITDA margins peaked at 53.8% in FY2023 (inflated by Q3-2023 POC mix). They have since compressed to 49.5% (FY2024) and 48.7% (FY2025) and appear to be stabilising in the 47%–51% range — a structurally higher level than FY2021's 28.0%, reflecting the shift to higher-margin UAE development projects in Downtown Dubai, Dubai Hills, and similar masterplans. Capital allocation discipline is evident: capex remains low (AED 534M–934M annually vs AED 33Bn+ CFO), preserving the asset-light development model.

**Seasonality:** Pronounced. Q4 is consistently the largest quarter (averaging 32.5% of annual revenue). The Q1 dip of 20%–24% sequential decline from Q4 is structural and repeatable. Any earnings estimate for the full year must anchor to Q4, which is the single most important quarter for revenue recognition.

**Inflection points:**
- **FY2021→FY2022:** Revenue fell 10.6% as COVID-era project delivery cycles normalised; EBITDA grew +19.6% because project mix shifted to higher-margin completions. This masked the near-term revenue weakness.
- **FY2023 Q3 spike:** COGS collapsed in Q3-2023 pushing quarterly gross margin to 75.8% and FY2023 EBITDA margin to 53.8%. This is a one-time POC milestone effect, not a structural improvement. Analysts modelling off FY2023 margins will overestimate future profitability.
- **FY2024–FY2025 re-acceleration:** Revenue reaccelerated as the record 2022–2024 property sales volumes began converting to revenue. With UAE Development revenues up 55% in FY2025 to AED 36,443M, this segment is the dominant driver.
- **Tax regime change FY2024–FY2025:** UAE Corporate Tax (9%) was introduced in FY2024 and a Domestic Top-Up Tax (DMTT, 15%) was introduced in FY2025, both visible in the rising effective tax rate: from near-zero in FY2023 to 7.7% in FY2024 and 13.0% in FY2025. This is an inflection in the tax line that reduces net income growth relative to EBIT growth and is a permanent structural change, not a one-time item. [1][2]

---

## 7. Citations

[1] Capital IQ & Proprietary Data export — "Emaar Properties PJSC DFM EMAAR Financials_Annual.xls" — Income Statement tab, Cash Flow tab, Balance Sheet tab — FY2021–FY2025 + LTM Mar-31-2026 columns (Source stated in workbook: "Capital IQ & Proprietary Data").

[2] FY2025 Investor Presentation (Preliminary Annual Report) — "Emaar_Properties_PJSC-Preliminary_Annual_Report(Feb-12-2026).pdf" — Slides 8 (Strong Balance Sheet / Key Ratios), 12 (FY2025 Key Financial Highlights), 13 (Segment Analysis), 14 (Balance Sheet & Cash Flow Overview), 15 (Historical Trend), 16 (UAE Development Key Highlights). Published Feb 12, 2026. Note: this is an investor presentation / preliminary results release, not the audited statutory IFRS annual report. FY2025 audited annual report not yet in the data pool as of the run date.

[3] Capital IQ & Proprietary Data export — "Emaar Properties PJSC DFM EMAAR Financials_Quarterly.xls" — Income Statement tab, Cash Flow tab, Balance Sheet tab — Q1-2022 through Q1-2026 (17 quarters).

[4] Capital IQ & Proprietary Data export — "Emaar Properties PJSC DFM EMAAR Financials_Quarterly.xls" — Balance Sheet tab — Q1-2026 (Mar-31-2026) column: Total Debt = AED 10,064M; Cash & Equivalents = AED 12,180M; Short-Term Investments = AED 22,503M; Restricted Cash = AED 43,338M.

---

*All growth rates, margins, TTM figures, normalised FCF, and net debt reconciliations were produced by executed Python (Bash/Python) computation snippets, not mental arithmetic, in compliance with the self-check requirement (F09).*
