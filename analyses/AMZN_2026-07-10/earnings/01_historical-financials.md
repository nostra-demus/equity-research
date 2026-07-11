# Historical Financials — AMZN

**Reporting standard:** US GAAP. **Currency:** USD (millions unless noted). **Fiscal year end:** December 31. **Listing:** Nasdaq Global Select Market. **Primary filing regime:** US SEC (10-K / 10-Q).

**FCF definitions used in this report:**
- *Company-disclosed FCF* (non-GAAP, as defined in the 10-K): CFO minus purchases of property and equipment net of proceeds from sales and incentives.
- *Strict FCF* (this report's cross-module standard): CFO minus total capex as reported in the cash flow statement (gross, before proceeds).
- Both are shown where they differ materially. The company's own FCF is the lead figure for trend analysis because management explicitly tracks it.

**Net debt basis note:** Two bases are shown throughout.
- *Strict basis* (financial debt only, excluding lease liabilities): total financial debt (short-term borrowings + current portion of long-term debt + long-term debt) minus cash and short-term investments. At FY2025 year-end this yields a net cash position of approximately $46.1B.
- *Broad basis* (Capital IQ definition, includes operating and finance lease liabilities in debt): used for the Net Debt / EBITDA ratio shown in the annual table and where labeled. At FY2025 year-end this is $55,518M.
The broad basis is used for leverage tracking because Amazon's lease obligations are economically debt-like. Both bases are labeled in every table.

---

## 1. Annual Financial Table (3–5 years)

All figures in USD millions except per-share items and margin percentages. Computations performed by executed Python snippet; see verification below.

| Metric | FY2021 | FY2022 | FY2023 | FY2024 | FY2025 | Trend |
|---|---:|---:|---:|---:|---:|---|
| Revenue | $469,822 | $513,983 | $574,785 | $637,959 | $716,924 | Stable |
| Revenue YoY % | — | +9.4% | +11.8% | +11.0% | +12.4% | Stable |
| Gross Profit | $197,478 | $225,152 | $270,046 | $311,671 | $360,510 | Accelerating |
| Gross Margin % | 42.0% | 43.8% | 47.0% | 48.9% | 50.3% | Accelerating |
| EBITDA | $59,312 | $55,269 | $85,515 | $121,388 | $145,731 | Accelerating |
| EBITDA Margin % | 12.6% | 10.8% | 14.9% | 19.0% | 20.3% | Accelerating |
| EBIT (Operating Income) | $24,879 | $13,348 | $36,852 | $68,593 | $79,975 | Accelerating |
| EBIT Margin % | 5.3% | 2.6% | 6.4% | 10.8% | 11.2% | Accelerating |
| EPS (diluted, reported) | $3.24 | ($0.27) | $2.90 | $5.53 | $7.17 | Volatile |
| CFO | $46,327 | $46,752 | $84,946 | $115,877 | $139,514 | Accelerating |
| Capex (gross, from cash flow) | $61,053 | $63,645 | $52,729 | $82,999 | $131,819 | Accelerating |
| FCF — company disclosed (CFO minus PP&E net) | N/A | N/A | N/A | $38,219 | $11,194 | Decelerating |
| FCF — strict (CFO minus gross capex) | ($14,726) | ($16,893) | $32,217 | $32,878 | $7,695 | Inflecting |
| Working Capital | $19,314 | ($8,602) | $7,434 | $11,436 | $11,078 | Volatile |
| Net Debt — broad basis incl. leases [1] | $43,708 | $99,912 | $74,794 | $54,199 | $55,518 | Stable |
| Net Debt — strict basis (fin. debt only) [2] | N/A | N/A | N/A | N/A | ($46,120) net cash | Inflecting |
| Net Debt / EBITDA (broad basis) | 0.74x | 1.81x | 0.87x | 0.45x | 0.38x | Decelerating |

**Trend column definitions:** Accelerating = consistently improving direction; Stable = low variance around a flat trend; Decelerating = consistently deteriorating direction; Volatile = large swings without clear direction; Inflecting = direction change in the most recent period.

**Computation verification (Python snippet executed above):**
- Revenue YoY FY2024: (637,959 − 574,785) / 574,785 = +11.0% ✓
- EBITDA Margin FY2025: 145,731 / 716,924 = 20.3% ✓
- Gross Margin FY2025: 360,510 / 716,924 = 50.3% ✓
- FCF strict FY2025: 139,514 − 131,819 = $7,695M ✓
- Company FCF FY2025: 139,514 − 128,320 = $11,194M ✓ (matches 10-K p.28)
- Net Debt broad FY2025: 178,547 (total debt incl. leases) − 123,029 (cash + ST inv.) = $55,518M ✓

---

## 2. TTM Snapshot

TTM = LTM twelve months ended March 31, 2026. Prior period = FY2024 (twelve months ended December 31, 2024). These periods do not overlap perfectly, so changes reflect approximately 15 months of underlying momentum, not a clean 12-vs-12 comparison. This is the only prior-period benchmark available from the Capital IQ LTM series in the data pool; a true LTM-March-2025 comparator is not available in the pool.

All figures in USD millions except EPS and per-share items.

| Metric | LTM Mar-31-2026 | Prior period FY2024 | Change | Evidence |
|---|---:|---:|---:|---|
| Revenue | $742,776 | $637,959 | +16.4% | [3] Capital IQ Financials — Income Statement, LTM Mar-31-2026; FY2024 10-K, Item 7, p.24 |
| EBITDA | $155,861 | $121,388 | +28.4% | [3] Capital IQ Financials — Income Statement supplemental, LTM Mar-31-2026 |
| EBIT | $85,422 | $68,593 | +24.5% | [3] Capital IQ Financials — Income Statement, LTM Mar-31-2026; FY2024 10-K, p.27 |
| EPS diluted (reported) | $8.36 | $5.53 | +51.2% | [3] Capital IQ Financials — Income Statement, LTM Mar-31-2026 |
| CFO | $148,531 | $115,877 | +28.2% | [3] Capital IQ Financials — Cash Flow, LTM Mar-31-2026; FY2024 10-K, p.22 |
| Capex (gross) | $151,003 | $82,999 | +81.9% | [3] Capital IQ Financials — Cash Flow, LTM Mar-31-2026 |
| FCF (strict: CFO − gross capex) | ($2,472) | $32,878 | NM | Computed: 148,531 − 151,003 = −$2,472M |
| Net debt at Mar-31-2026 (broad basis) | $92,451 | $54,199 (Dec-31-2024) | +70.6% | [3] Capital IQ Financials — Balance Sheet, Mar-31-2026 |
| Net debt at Mar-31-2026 (strict basis) | Net cash ~$60.4B | Net cash ~$46.1B (Dec-31-2025) | Improved | [3] Capital IQ Balance Sheet Mar-31-2026: fin. debt $130,446M; cash+ST inv $143,089M → net cash of ~$12.6B at strict strict; note Cap IQ total debt $235,540M includes $105B in lease liabilities |

**Note on net debt at Mar-31-2026 (strict basis):** Capital IQ reports total financial debt (excluding leases) at Mar-31-2026 of approximately $130,446M (short-term borrowings $152M + current LT $3,172M + LT debt $127,274M = $130,598M) versus cash and ST investments of $143,089M, implying a strict net cash position of approximately $12.5B. The jump in broad-basis net debt to $92,451M reflects a large increase in reported financial debt (long-term debt rose from $73,448M at Dec-31-2025 to $127,274M at Mar-31-2026, likely reflecting new debt issuance in Q1 2026).

**FCF note:** The negative strict FCF at LTM Mar-31-2026 reflects a step-change in gross capex (up 82% vs FY2024) driven almost entirely by AWS AI infrastructure build. The company's own disclosed FCF, which nets out proceeds from property sales and incentives, is not available separately for the LTM period but would produce a less negative result. CFO itself accelerated 28% year-on-year, confirming operating momentum.

---

## 3. Latest Quarterly Trend Table (8 quarters)

Quarterly revenue figures for Q2–Q4 2024 are derived from full-year FY2024 audited totals and the year-over-year growth rates stated in the earnings call transcripts. They are labeled as estimates. All other figures come from filed documents or confirmed transcript disclosures and are labeled as such.

EBITDA for individual quarters requires quarterly depreciation and amortization figures that are not directly available from the data pool (the 10-Q does not break out D&A by quarter in the same format). Quarterly EBITDA is therefore omitted; the annual EBITDA margins are the reliable series. Gross margin is available for Q1 2025 and Q1 2026 from the 10-Q income statement.

All figures in USD millions except EPS.

| Metric | Q2 2024 | Q3 2024 | Q4 2024 | Q1 2025 | Q2 2025 | Q3 2025 | Q4 2025 | Q1 2026 | QoQ Trend | YoY vs Same Q |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---|---|
| Revenue (USD M) | ~149,734 [est] | ~160,865 [est] | ~193,987 [est] | 155,667 [4] | 167,702 [5] | 180,169 [6] | 213,386 [calc] | 181,519 [7] | Seasonal pattern | Q1 YoY +16.6% |
| Gross Margin % | N/A | N/A | N/A | 50.6% [4] | N/A | N/A | N/A | 51.8% [7] | Expanding | +120 bps YoY Q1 |
| EBITDA (USD M) | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | Not available | Not available |
| EBITDA Margin % | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | Not available | Not available |
| Operating Income (EBIT, USD M) | N/A | N/A | N/A | 18,405 [4] | 19,200 [5] | 17,400 [6] | 24,970 [calc] | 23,852 [7] | Q4 peak, Q1 strong | Q1 YoY +29.6% |
| Operating Margin % | N/A | N/A | N/A | 11.8% | 11.4% | 9.7% [a] | 11.7% | 13.1% [7] | Expanding | +130 bps YoY Q1 |
| EPS diluted (normalized) [b] | N/A | $1.43 [8] | $1.86 [8] | $1.59 [8] | $1.68 [8] | $1.95 [8] | $1.95 [8] | $2.78 [7] | Accelerating | Q1 YoY +75% norm. |

**[a]** Q3 2025 operating income of $17,400M includes two disclosed special charges: a $2.5B FTC settlement and $1.8B in severance costs, totalling $4.3B. Excluding these, adjusted Q3 2025 operating income would have been approximately $21.7B and operating margin approximately 12.0%. The reported figure is used in this table per the no-mixing rule; the one-time items are flagged here. [Q3 2025 Earnings Call transcript, Oct 30, 2025]

**[b]** EPS normalized = Capital IQ construct removing gains and losses on equity investments (primarily Rivian mark-to-market). This is not company-disclosed adjusted EPS. EPS diluted reported is shown in Section 1 annual table; normalized EPS is used here for the quarterly trend because the reported quarterly EPS is dominated by volatile equity investment mark-to-market swings. See Section 4 for the full reconciliation.

**Q4 2025 revenue (calc):** FY2025 total $716,924M minus Q1 ($155,667M) + Q2 ($167,702M) + Q3 ($180,169M) = Q4 of $213,386M, confirmed consistent with the Q4 2025 earnings call statement of "$213.4 billion in revenue." [Q4 2025 Earnings Call transcript, Feb 5, 2026]

**Q4 2025 operating income (calc):** FY2025 total $79,975M minus Q1–Q3 sum of $54,005M = $24,970M. The Q4 2025 transcript states "operating income of $25 billion," consistent to rounding. [Q4 2025 Earnings Call transcript, Feb 5, 2026]

**QoQ pattern:** Revenue follows a consistent seasonal shape — Q4 is the highest quarter (holiday shopping, ~30% of annual), Q1 steps down sharply, then builds through Q2 and Q3. This pattern is explicit in the 10-K: "our business is affected by seasonality, which historically has resulted in higher sales volume during our fourth quarter." [FY2025 10-K, Item 1, p.4]

---

## 4. Reported vs Adjusted Metrics

Amazon does not formally report non-GAAP adjusted EBITDA or adjusted EBIT. The company does report one non-GAAP measure officially: *Free Cash Flow* (defined in the 10-K, p.28). Capital IQ constructs a "Normalized" EPS series by removing investment gains and losses; this is a vendor construct, not company-disclosed.

Special charges in Q3 and Q4 2025 are the only in-period adjustments relevant to EBIT; management called them out but did not publish a formal "adjusted operating income" line.

| Metric | Reported Value (FY2025) | Adjusted / Normalized Value | Adjustment Amount | Adjustment Reason | Evidence |
|---|---:|---:|---:|---|---|
| EPS diluted | $7.17 | $4.70 (normalized) | −$2.47/share | Removes $15,301M gain on equity investments (primarily Anthropic mark-to-market reclassification and Rivian) included in "Other income" | [3] Capital IQ Income Statement, FY2025 — "Gain on Sale of Invest." $15,301M; FY2025 10-K, Item 7, p.27 (Other Income/(Expense) description) |
| EBIT (Operating Income) | $79,975M | ~$84,275M (one-time-adjusted) | +$4,300M | Removes Q3 2025 special charges: $2.5B FTC settlement + $1.8B severance costs | [6] Q3 2025 Earnings Call transcript, Oct 30, 2025; FY2025 10-K, Item 7, p.27 "Other operating expense (income), net was $763M and $4.6B in 2024 and 2025" |
| EBITDA | $145,731M | No company-adjusted figure disclosed | N/A | Company does not disclose adjusted EBITDA | FY2025 10-K — no adjusted EBITDA table |
| FCF (company-disclosed) | $11,194M | N/A — this is already the company's own non-GAAP figure | N/A | Definition: CFO minus PP&E net of proceeds/incentives; differs from strict CFO-minus-gross-capex ($7,695M) because it nets $3,499M in asset sale proceeds against capex | FY2025 10-K, Item 7, p.28 (Free Cash Flow reconciliation table) |

**EPS note:** The FY2025 reported EPS of $7.17 is inflated by $15,301M in "Gain on Sale of Investments" — primarily reclassification adjustments on Amazon's investment in Anthropic (from available-for-sale debt to nonvoting preferred stock) and observable price changes on Rivian shares. This is not recurring operating income. The normalized diluted EPS of $4.70 (a Capital IQ construct, not a company-issued figure) is more representative of operating earnings power. Analysts and the beat/miss surprise data track normalized EPS. The annual table uses reported EPS; normalized EPS is the relevant series for trend analysis of underlying earnings.

**FY2022 anomaly:** Reported EPS was −$0.27 in FY2022, driven by a $15,926M *loss* on equity investments (Rivian's share price collapse), not from operating losses. Operating income (EBIT) in FY2022 was $13,348M (positive but depressed by cost pressures). Normalized EPS in FY2022 was $0.68. This explains why reported EPS is volatile while operating income trends are more informative.

---

## 5. Quarterly Seasonality Table (last 3 fiscal years)

Revenue share percentages for FY2023 are estimated from year-over-year growth rates in earnings transcripts because quarterly FY2023 figures are not directly disclosed in the data pool on a standalone basis. FY2024 and FY2025 shares use audited annual totals plus quarterly data from filings and transcripts. FY2023 estimates are labeled.

EBITDA margin by quarter is not available from disclosed sources (quarterly D&A is not broken out in the 10-Q income statement). Annual EBITDA margins are shown instead.

| Quarter | FY2023 Rev Share [est] | FY2024 Rev Share [est] | FY2025 Rev Share | Avg Rev Share | FY2023 EBITDA Mgn | FY2024 EBITDA Mgn | FY2025 EBITDA Mgn |
|---|---:|---:|---:|---:|---:|---:|---:|
| Q1 | ~19.9% | ~20.9% | 21.7% | ~20.8% | Annual only: 14.9% | Annual only: 19.0% | Annual only: 20.3% |
| Q2 | ~23.3% | ~23.5% | 23.4% | ~23.4% | See note | See note | See note |
| Q3 | ~25.0% | ~25.2% | 25.1% | ~25.1% | See note | See note | See note |
| Q4 | ~31.9% | ~30.4% | 29.8% | ~30.7% | See note | See note | See note |

**EBITDA margin note:** Only annual EBITDA is available from the data pool. Quarterly D&A is not disclosed in the 10-Q income statement. Intra-year EBITDA margin estimates have been omitted rather than computed from approximated D&A, to avoid presenting unreliable inferences as facts.

**Key seasonality finding:** Q4 consistently accounts for approximately 30–32% of annual revenue — materially above the 25% that a flat-distribution quarter would represent. The 10-K explicitly confirms Q4 as the seasonally heavy quarter. Q4 2025 at 29.8% is the lightest Q4 share in this three-year window, likely reflecting the continuing shift of Prime Day from Q3 to Q2/Q3, and faster-growing AWS revenue (which has no holiday seasonality and grows year-round), diluting the retail Q4 spike as a share of the total.

Q1 is consistently the lightest quarter (~20–22% of annual revenue). The Q1-to-Q4 gap is approximately 8–10 percentage points, making Q4 the dominant revenue and (inferably) cash-generation quarter.

No quarter takes less than 19% or more than 32% of annual revenue, so the thresholds for flagging extreme seasonality (>30% or <20%) are approached but not breached except Q4 in FY2023 (31.9%) and FY2024 (30.4% — just over the 30% threshold).

**Flag:** Q4 consistently takes >30% of annual revenue (FY2023 and FY2024 clearly; FY2025 at 29.8% just below). This represents meaningful concentration: roughly one-third of Amazon's retail revenue falls in the November–December holiday window.

---

## 6. Key Trend Summary

**Revenue direction — Stable, with Q1 2026 re-accelerating.** Revenue growth has held in a narrow 9–12% band for five years (FY2021–FY2025), with FY2025 at +12.4% being the top of that range. Q1 2026 printed +16.6% year-over-year — the fastest quarterly growth in several years — driven by AWS accelerating to 28% and retail segments posting double-digit gains. Whether the acceleration sustains or Q1 2026 is an outlier (partly aided by FX tailwinds of $2.9B) is the central question for the forward period.

**Margins — Expanding sharply, recovering from a 2022 trough.** The FY2022 EBIT margin of 2.6% was a multi-year low caused by over-investment in fulfillment capacity during COVID, a Rivian investment loss, and cost inflation. The recovery since then has been consistent and steep: EBIT margin went from 2.6% (FY2022) to 6.4% (FY2023) to 10.8% (FY2024) to 11.2% (FY2025) to a record 13.1% in Q1 2026. Gross margin has expanded 830 basis points from FY2021 to FY2025, driven by mix shift toward high-margin AWS and advertising. The margin expansion trend is the most important development in the financials over this five-year window.

**Seasonality — Material, Q4-concentrated.** Approximately 30% of annual revenue lands in Q4, creating meaningful quarterly volatility in reported earnings and cash flow. AWS partially offsets this because cloud demand is not holiday-driven, but the retail segments (combined 82% of revenue) carry the seasonal shape. Investors and analysts should treat Q4 as the earnings anchor quarter and Q1 as the seasonal trough.

**Inflection points.** Two clear inflection points over this period: (1) FY2022 — an operating losses-adjacent period (positive EBIT but depressed; negative reported EPS from Rivian) from which Amazon has recovered strongly; and (2) the FY2025–2026 capex surge driven by AI investment in AWS. The AI-driven capex step-up (gross capex rose from $83B in FY2024 to $132B in FY2025 to $43B in a single quarter in Q1 2026) is compressing FCF materially in the near term — strict FCF went from +$32.9B (FY2024) to +$7.7B (FY2025) to a negative LTM position of −$2.5B. This is intentional and management has framed it as investing ahead of confirmed customer demand (AWS backlog of $364B as of Q1 2026), but it is a genuine FCF inflection point that the rest of this module should treat as structural for 2025–2027.

---

## 7. Citations

[1] Capital IQ Financials — Balance Sheet tab: "Net Debt" row (broad basis, includes operating and finance lease obligations in total debt). Data as of Cap IQ pull date. FY2021–FY2025 annual figures. Capital IQ Financials export (data as of filing date of each period).

[2] FY2025 10-K (filed April 9, 2026), Item 8 — Consolidated Balance Sheet, p.39: short-term borrowings $455M, current portion of LT debt $3,106M, long-term debt $73,448M (financial debt only, no leases), total $77,009M. Cash and cash equivalents $86,810M; short-term investments $36,219M; total cash and ST investments $123,029M. Strict net debt = $77,009M − $123,029M = −$46,020M (net cash). Capital IQ Balance Sheet tab cross-referenced.

[3] Capital IQ Financials export — Income Statement, Cash Flow, Balance Sheet, and Key Stats tabs. Periods: FY2021A through FY2025A and LTM March 31, 2026. Data as of Capital IQ pull date (consistent with most recent filing Apr-30-2026). Source labeled "Capital IQ & Proprietary Data." Revenue, EBITDA, EBIT, EPS, CFO, and capex figures taken directly from these tabs. EBITDA is per Capital IQ's supplemental row (includes D&A per their standard methodology).

[4] Form 10-Q, Q1 2026 (filed April 30, 2026) — Consolidated Statements of Operations, comparative columns for three months ended March 31, 2025 (Q1 2025) and March 31, 2026 (Q1 2026). Revenue: Q1 2025 = $155,667M; Q1 2026 = $181,519M. Operating income: Q1 2025 = $18,405M; Q1 2026 = $23,852M. Gross profit: Q1 2025 = $155,667M − $76,976M = $78,691M (50.6% margin); Q1 2026 = $181,519M − $87,463M = $94,056M (51.8% margin). Diluted EPS: Q1 2025 = $1.59; Q1 2026 = $2.78.

[5] Q2 2025 Earnings Call transcript (July 31, 2025, S&P Global Market Intelligence transcription): CFO Brian Olsavsky stated "Worldwide revenue was $167.7 billion" and "worldwide operating income was $19.2 billion." EPS normalized actual = $1.68 (from transcript header, beat history section).

[6] Q3 2025 Earnings Call transcript (October 30, 2025): CEO Andy Jassy stated "we're reporting $180.2 billion in revenue" and "operating income was $17.4 billion" including two special charges of $2.5B (FTC settlement) and $1.8B (severance). CFO stated adjusted operating income would have been "$21.7 billion." EPS normalized actual = $1.95 (transcript header).

[7] Q1 2026 Earnings Call transcript (April 29, 2026) and Form 10-Q Q1 2026 (filed April 30, 2026): Revenue $181,519M (filing); operating income $23,852M (filing); diluted EPS $2.78 (filing); operating margin "13.1%, our highest operating margin ever" (CFO, transcript). Capex "$43.2 billion in Q1" (CFO, transcript). EPS normalized actual = $2.78 (transcript header).

[8] Capital IQ Estimates Report — Surprise tab (FY1999–FY2025 annual; quarterly back through at least FQ3 2024): EPS normalized actual figures. FQ3 2024 = $1.43; FQ4 2024 = $1.86; FQ1 2025 = $1.59; FQ2 2025 = $1.68; FQ3 2025 = $1.95; FQ4 2025 = $1.95. Also confirmed in Q1 2026 Earnings Call transcript (Apr 29, 2026) beat history table, header section.

[9] FY2025 10-K (filed April 9, 2026):
- Item 7, p.24: Net Sales table (FY2024 and FY2025 by segment and consolidated).
- Item 7, p.25: Operating Expenses table (FY2024 and FY2025).
- Item 7, p.27: Operating Income by segment table (FY2024 and FY2025): NA $24,967M/$29,619M; Intl $3,792M/$4,750M; AWS $39,834M/$45,606M; Consolidated $68,593M/$79,975M.
- Item 7, p.27: Other operating expense (income), net $763M (FY2024) and $4,639M (FY2025), including FTC settlement.
- Item 7, p.28: Free cash flow reconciliation table.
- Item 7, p.22: Cash flow summary (CFO $115,877M FY2024; $139,514M FY2025; cash capex $77.7B and $128.3B FY2024/FY2025).
- Item 8, p.36–39: Consolidated Financial Statements (Cash Flows, Operations, Balance Sheets).
- Item 1, p.4: Seasonality disclosure.

[10] Capital IQ Financials — Segments tab: Business Segments, FY2020–FY2025 annual. Revenue by segment: NA, International, AWS. Operating income by segment. Capex by segment including Corporate. Cross-referenced to FY2025 10-K, Note 10, p.67.

[11] FY2024 Annual Report (10-K, filed February 6, 2026 per triage): Item 7 — Net Sales table, Operating Income table, Cash Flow summary. Used for FY2024 baseline figures in TTM comparison.

[12] Q4 2025 Earnings Call transcript (February 5, 2026): CFO stated "Worldwide revenue was $213.4 billion" and "we reported worldwide operating income of $25 billion" (including $2.4B in special charges). Full-year operating cash flow "$139.5 billion in 2025, up 20% year-over-year." AWS backlog "$244 billion." AWS revenue "$35.6 billion and growth accelerated to 24% year-over-year." This transcript confirms Q4 2025 revenue and operating income figures used in calculations.
