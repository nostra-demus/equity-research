# Historical Financials — CRM

**Company:** Salesforce, Inc. (NYSE:CRM). **Reporting standard:** US GAAP. **Currency:** USD, millions unless stated. **Fiscal year ends January 31** — so "FY26" = the 12 months ended Jan-31-2026. **As-of date:** 2026-06-08.

**GAAP vs non-GAAP — read this first.** Salesforce books very large stock-based compensation (pay employees in shares instead of cash): $3,509M in FY26, about 8.5% of revenue [1]. That expense IS inside every GAAP number below — GAAP revenue, GAAP operating income, GAAP EPS. Salesforce also reports a "non-GAAP" set that adds SBC and some other items back; those numbers are much higher (e.g. Q1 FY27 non-GAAP operating margin 34.8% vs GAAP 21.1% [7]). **The annual and TTM tables in sections 1–3 are GAAP** (audited 10-K plus the Capital IQ standardized feed, which is GAAP). Section 4 shows the non-GAAP figures the company discloses, clearly separated. Wherever a non-GAAP figure appears it is labeled "non-GAAP" in the same cell.

**One source-reconciliation flag (carry into every table).** Two trusted sources define "operating income / EBIT" differently:
- The **audited 10-K** reports GAAP **"Income from operations"** of **$8,331M** (FY26), **$7,205M** (FY25), **$5,011M** (FY24) — this keeps restructuring charges inside operating costs [1].
- The **Capital IQ standardized feed** reports **"Operating Income / EBIT"** of **$8,917M** (FY26), **$7,666M** (FY25), **$5,999M** (FY24) — it moves restructuring charges ($586M FY26, $461M FY25, $988M FY24) below the operating line and treats them as one-off items [2].
Both are GAAP; the difference is the restructuring reclassification. **This report uses the 10-K GAAP "Income from operations" as the primary EBIT figure** (audited filing beats vendor feed, CLAUDE.md §4) and footnotes the Capital IQ version. EBITDA below is the Capital IQ figure (no audited EBITDA exists; EBITDA is not a GAAP line).

**Definitions (plain meaning on first use):**
- **EBITDA** = earnings before interest, tax, depreciation and amortization — a rough cash-operating-profit proxy. Here it is the Capital IQ figure (operating income + D&A; restructuring excluded) [2].
- **EBIT** = operating profit (earnings before interest and tax). Primary = 10-K GAAP "Income from operations" [1].
- **EPS (diluted)** = net profit per share, counting all shares that options/RSUs could create (treasury-stock method). Share count from 10-K [1].
- **CFO** = cash from operations (actual cash the business generated). **Capex** = cash spent on property and equipment. **FCF** = CFO − capex (free cash flow — cash left after running and maintaining the business). Capex is shown as a negative cash outflow in the source; its absolute value is used in FCF [1][2].
- **Net debt** = total debt − cash and short-term investments. **Working capital** = current assets − current liabilities (a level, not a flow).

---

## 1. Annual Financial Table (FY22–FY26)

Currency: USD millions, US GAAP. Fiscal year ends Jan-31.

| Metric | FY22 (Jan-22) | FY23 (Jan-23) | FY24 (Jan-24) | FY25 (Jan-25) | FY26 (Jan-26) | Trend |
|---|---:|---:|---:|---:|---:|---|
| Revenue | 26,492 | 31,352 | 34,857 | 37,895 | 41,525 | Decelerating |
| Revenue YoY % | +24.7% | +18.3% | +11.2% | +8.7% | +9.6% | Decelerating |
| Gross Profit | 19,466 | 22,992 | 26,316 | 29,252 | 32,255 | Stable |
| Gross Margin % | 73.5% | 73.3% | 75.5% | 77.2% | 77.7% | Stable (high) |
| EBITDA (Capital IQ) | 3,846 | 5,644 | 9,958 | 11,143 | 12,548 | Accelerating→stable |
| EBITDA Margin % | 14.5% | 18.0% | 28.6% | 29.4% | 30.2% | Accelerating→stable |
| EBIT — 10-K GAAP "Income from operations" | 1,431* | 1,030* | 5,011 | 7,205 | 8,331 | Accelerating→stable |
| EBIT Margin % (GAAP) | 5.4%* | 3.3%* | 14.4% | 19.0% | 20.1% | Accelerating→stable |
| EBIT — Capital IQ (restructuring excluded) | 548 | 1,858 | 5,999 | 7,666 | 8,917 | Accelerating→stable |
| Net Income (GAAP) | 1,444 | 208 | 4,136 | 6,197 | 7,457 | Inflecting (up) |
| EPS diluted (GAAP) | 1.48 | 0.21 | 4.20 | 6.36 | 7.80 | Inflecting (up) |
| Diluted shares (M) | 974 | 997 | 984 | 974 | 956 | Falling (buybacks) |
| CFO | 6,000 | 7,111 | 10,234 | 13,092 | 14,996 | Accelerating |
| Capex | (717) | (798) | (736) | (658) | (594) | Falling |
| FCF (CFO − capex) | 5,283 | 6,313 | 9,498 | 12,434 | 14,402 | Accelerating |
| Working Capital (CA − CL) | 1,062 | 504 | 2,443 | 1,747 | (8,896) | Inflecting (down) |
| Net Debt (debt − cash & ST inv.) | 3,833 | 2,371 | (632) | (1,962) | 8,146 | Volatile |
| Net Debt / EBITDA | 1.0x | 0.4x | net cash | net cash | 0.65x | Volatile |

\* **FY22 and FY23 GAAP EBIT footnote.** The 10-K filed Mar-02-2026 presents only FY24–FY26 income statements [1]. For FY22 and FY23 the audited "income from operations" was not in this filing's three-year statement; the figures shown (FY22 $1,431M = $548M Capital IQ operating income + ~$883M of items Capital IQ pushed below the line incl. the FY22 strategic-investment swing; FY23 $1,030M) are reconstructed and should be treated as approximate. The Capital IQ "Operating Income" row (FY22 $548M, FY23 $1,858M) is the clean vendor figure for those two years [2]. *Inference for FY22/FY23 GAAP EBIT split — not directly from the FY26 10-K.* FY24–FY26 GAAP EBIT is audited and exact [1].

Trend notes:
- **Revenue:** clear multi-year deceleration (24.7% → 8.7%) that stopped falling in FY26 (+9.6%). Marked **Decelerating** because the level of growth is far below FY22–FY23, even though FY26 ticked up slightly.
- **Net debt swing:** FY24–FY25 the company held more cash + short-term investments than debt (net cash). FY26 flipped to +$8.1B net debt after a $6.0B debt raise [4] and $12.9B of buybacks [1]; the LTM figure (section 2) jumps further on a new $30.8B debt issuance tied to the Informatica acquisition. Marked **Volatile** — this is capital-allocation choice (buybacks + M&A funded partly by debt), not operating stress.
- **Working capital negative in FY26 (−$8.9B):** driven by (a) $24.3B current unearned/deferred revenue — cash collected upfront for subscriptions not yet delivered, a source of funding, and (b) a $4.0B current portion of long-term debt [3]. Negative working capital here reflects the upfront-billing subscription model, not a liquidity problem.

---

## 2. TTM Snapshot

TTM = latest twelve months ended **Apr-30-2026** (i.e. through Q1 FY27), from the Capital IQ LTM column [2]; prior TTM = FY26 (12 months ended Jan-31-2026) [1][2]. All figures GAAP.

| Metric | Latest TTM (to Apr-30-2026) | Prior TTM (FY26, to Jan-31-2026) | Change | Evidence |
|---|---:|---:|---:|---|
| Revenue | 42,829 | 41,525 | +3.1% | [2] LTM col / [1] FY26 |
| EBITDA (Capital IQ) | 12,895 | 12,548 | +2.8% | [2] |
| EBIT (Capital IQ, restructuring excl.) | 9,366 | 8,917 | +5.0% | [2] |
| EPS diluted (GAAP) | 8.61 | 7.80 | +10.4% | [2] LTM / [1] FY26 |
| CFO | 15,221 | 14,996 | +1.5% | [2] |
| Capex | (560) | (594) | −5.7% (less spend) | [2] |
| FCF (CFO − capex) | 14,661 | 14,402 | +1.8% | [2], computed |
| Net debt at latest period-end (Apr-30-2026) | 30,711 | 8,146 (Jan-31-2026) | +22,565 | [3] balance sheet |

Note: Net debt is a point-in-time balance-sheet figure, not a TTM flow. The Apr-30-2026 jump to $30.7B net debt reflects a ~$30.8B debt issuance in the quarter [2] tied to the Informatica acquisition (cash acquisitions of $10.7B in the LTM [2]); total debt rose to $42,548M against $11,837M cash + short-term investments [3]. This is balance-sheet structure to fund M&A and buybacks, not an earnings event — flagged here for the balance-sheet-survival module to assess; it is outside this agent's scope.

TTM EBIT note: this uses the Capital IQ LTM operating figure ($9,366M) [2], which excludes restructuring. A directly-audited GAAP LTM "income from operations" is not published between filings; the closest audited GAAP figure is FY26 $8,331M [1]. Do not treat the Key-Stats tab's "EBIT $15,811M (LTM)" as actual — that field blends forward consensus estimates and is not a reported number [5].

---

## 3. Latest Quarterly Trend Table (8 quarters, Q2 FY25 → Q1 FY27)

Currency: USD millions, US GAAP unless flagged. FY ends Jan-31. The Capital IQ quarterly feed covers through **Q2 FY26 (Jul-31-2025)** [6]; the three most recent quarters — **Q3 FY26 (Oct-2025), Q4 FY26 (Jan-2026), Q1 FY27 (Apr-2026)** — are taken from the company's reported results in the earnings releases/calls [7][8] and reconciled to the FY26 10-K total [1]. Source of each quarter is flagged.

| Metric | Q2 FY25 (Jul-24) | Q3 FY25 (Oct-24) | Q4 FY25 (Jan-25) | Q1 FY26 (Apr-25) | Q2 FY26 (Jul-25) | Q3 FY26 (Oct-25) | Q4 FY26 (Jan-26) | Q1 FY27 (Apr-26) | QoQ Trend | YoY vs Same Q |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---|---|
| Revenue | 9,325 | 9,444 | 9,993 | 9,829 | 10,236 | 10,259† | 11,201 | 11,133 | Up, Q4-seasonal | +9.8% / +8.6% / +12.1% / +13.3%‡ |
| Gross Margin % (GAAP) | 80.5% | 80.4% | 79.6% | 80.0% | 81.0% | n/d | n/d | n/d | Stable ~80% | flat |
| EBITDA (Capital IQ) | 2,789 | 2,763 | 2,995 | 2,821 | 3,153 | n/d | n/d | n/d | Stable/up | +13% (Q2) |
| EBITDA Margin % | 29.9% | 29.3% | 30.0% | 28.7% | 30.8% | n/d | n/d | n/d | Stable ~30% | flat |
| Operating Margin % — **GAAP** | n/d | n/d | n/d | n/d | n/d | n/d | n/d | **21.1%** | Up | +130 bps YoY [7] |
| Operating Margin % — **non-GAAP** | n/d | n/d | n/d | n/d | n/d | n/d | n/d | **34.8%** | Up | +250 bps YoY [7] |
| EPS diluted (GAAP) | 1.58 | 1.76 | 1.59 | 1.96 | 1.96 | n/d | n/d | n/d | Up | +24% (Q1) |
| EPS — **non-GAAP** (reported) | 2.56 | 2.41§ | 2.78 | 2.58 | 2.91 | 3.25 | 3.81 | 3.88 | Up | +50% (Q1FY27) [8] |

† **Q3 FY26 revenue $10,259M is derived**, not separately published in the pool: FY26 total $41,525M [1] − Q1 $9,829M − Q2 $10,236M − Q4 $11,201M = $10,259M. The Q4 call confirmed Q4 ≈ "$11.2 billion" [8] and FY26 total $41.5B [8]. *Inference by subtraction — labeled.*
‡ YoY shown for the four most recent quarters: Q2 FY26 vs Q2 FY25 +9.8%; Q3 FY26 vs Q3 FY25 +8.6%; Q4 FY26 vs Q4 FY25 +12.1%; Q1 FY27 vs Q1 FY26 +13.3% (nominal). Management cited Q1 FY27 +12% and Q4 FY26 +10% on a constant-currency basis [7][8].
§ Q3 FY25 non-GAAP EPS $2.41 is the Capital IQ "normalized" proxy [6]; the other non-GAAP EPS values (Q2 FY26 $2.91, Q3 FY26 $3.25, Q4 FY26 $3.81, Q1 FY27 $3.88) are the company's reported non-GAAP actuals from the earnings-release consensus/actual blocks [7][8].

"n/d" = not disclosed in the pool for that exact quarter at that GAAP/non-GAAP basis. **GAAP gross margin, GAAP EBITDA and GAAP EPS for the three newest quarters (Q3 FY26 onward) are not in the pool** because the Capital IQ quarterly feed stops at Q2 FY26 and the transcripts lead with non-GAAP; this is a real data gap for those three quarters at the line-item level, flagged for the synthesizer. Revenue and the GAAP-vs-non-GAAP operating-margin gap (Q1 FY27) are sourced and reliable.

QoQ pattern: revenue steps up into each fiscal Q4 (Jan-31, the strongest selling/renewal quarter) and dips slightly in the following Q1 — Q1 FY26 −1.6% QoQ, Q1 FY27 −0.6% QoQ [computed from 6,7,8]. This is the company's normal seasonality (section 5), not a deceleration.

---

## 4. Reported vs Adjusted Metrics

Salesforce **does disclose** a non-GAAP set. The single biggest adjustment is adding back stock-based compensation (SBC) [1][7]. Full-year non-GAAP operating margin and EPS reconciliations for FY26 were not extracted as line items in the pool; the cleanest disclosed reconciliation is Q1 FY27 (operating margin) plus the FY26 SBC total. Reported (GAAP) figures are audited [1]; non-GAAP figures are management-defined [7][8].

| Metric | Reported (GAAP) | Adjusted (non-GAAP) | Adjustment Amount | Adjustment Reason | Evidence |
|---|---:|---:|---:|---|---|
| Operating margin — Q1 FY27 | 21.1% | 34.8% | +13.7 pts | Mainly adds back SBC; also amortization of acquired intangibles, restructuring | [7] Q1 FY27 call, prepared remarks |
| Operating margin guidance — FY27 (mgmt) | 20.6% | 34.3% | +13.7 pts | Same add-backs | [7] Q1 FY27 call (GAAP cut to 20.6% on higher restructuring; non-GAAP held 34.3%) |
| EPS — Q1 FY27 | n/d (GAAP per-Q not in pool) | 3.88 | — | SBC + acquisition/restructuring add-backs | [7][8] reported non-GAAP actual |
| EPS — Q4 FY26 | n/d | 3.81 | — | Same | [8] reported non-GAAP actual |
| SBC expense — FY26 (the main add-back) | included in GAAP (−$3,509M to op. profit) | excluded from non-GAAP | $3,509M (~8.5% of revenue) | Equity pay added back to reach non-GAAP | [1] 10-K; [2] SBC detail |

Caution (CLAUDE.md §15): the gap between GAAP and non-GAAP operating margin is ~13.7 points and is mostly a real, recurring cash-equity cost (SBC). Treat the non-GAAP margin as the company's preferred presentation, not as the economic margin. The GAAP operating margin (FY26 20.1% [1]; Q1 FY27 21.1% [7]) is the figure this report leads with.

---

## 5. Quarterly Seasonality Table (FY24, FY25, FY26)

Revenue share = quarter revenue ÷ that fiscal year's total revenue. Q4 ends Jan-31 (fiscal year-end). All quarters from the Capital IQ quarterly feed [6] except Q3 FY26 (derived, see section 3 †); FY totals from 10-K [1]. EBITDA margins from Capital IQ [6]; FY26 Q3/Q4 EBITDA not separately disclosed in the pool.

| Quarter | FY24 Rev Share | FY25 Rev Share | FY26 Rev Share | Avg Rev Share | FY24 EBITDA Margin | FY25 EBITDA Margin | FY26 EBITDA Margin |
|---|---:|---:|---:|---:|---:|---:|---:|
| Q1 (Apr) | 23.7% | 24.1% | 23.7% | 23.8% | 23.9% | 28.7% | 28.7% |
| Q2 (Jul) | 24.7% | 24.6% | 24.7% | 24.6% | 26.4% | 29.9% | 30.8% |
| Q3 (Oct) | 25.0% | 24.9% | 24.7%† | 24.9% | 27.7% | 29.3% | n/d |
| Q4 (Jan) | 26.6% | 26.4% | 27.0% | 26.7% | 29.6% | 30.0% | n/d |

Seasonality read: **mild and stable.** Q4 (fiscal year-end, Jan-31) is consistently the strongest quarter at ~26.7% of annual revenue, and Q1 the weakest at ~23.8%. **No quarter trips the >30% or <20% flag** — the spread between the biggest and smallest quarter is only about 3 points of annual revenue. Management itself notes Q4 "has historically been our strongest quarter for new business and renewals" [9]. The subscription model (revenue recognized ratably from a large deferred-revenue balance) smooths the top line; the seasonality shows up more in bookings/cRPO than in recognized revenue.

---

## 6. Key Trend Summary

- **Revenue direction: decelerating, then stabilizing.** Year-over-year growth fell from +24.7% (FY22) to +8.7% (FY25), then edged up to +9.6% (FY26) [1][2]; the four most recent quarters ran +8.6% to +13.3% YoY nominal (about +9% to +12% constant currency per management) [7][8]. The multi-year story is deceleration from the ~25% era to a low-double-digit / high-single-digit pace, holding roughly flat over the last two years rather than still falling.
- **Margin direction: expanding, with the pace slowing.** GAAP operating margin rose from 14.4% (FY24) to 19.0% (FY25) to 20.1% (FY26) [1]; Capital IQ EBITDA margin climbed from 18.0% (FY23) to 30.2% (FY26) [2]. The biggest step-up was FY24 (cost cuts and restructuring after the FY23 trough); expansion has since narrowed to ~80 bps a year. Q1 FY27 GAAP operating margin was 21.1%, up 130 bps YoY [7]. Margins are still widening, just more slowly.
- **Material seasonality? Mild.** Fiscal Q4 (ends Jan-31) is the strongest quarter at ~26.7% of annual revenue; Q1 the weakest at ~23.8% [1][6]. No quarter is outside a normal 20–30% band, so seasonality is a minor modeling factor for recognized revenue.
- **Inflection points in the last 3–5 years:** (1) **FY23 profit trough** — GAAP net income collapsed to $208M / $0.21 diluted EPS [1] as costs ran ahead of slowing revenue, triggering activist pressure and restructuring. (2) **FY24 profitability reset** — restructuring and headcount cuts (FY24 restructuring $988M [1], employees fell from ~79,400 to ~72,700 [3]) drove GAAP operating margin from 3.3% to 14.4% and EPS from $0.21 to $4.20. (3) **FY26 balance-sheet shift** — net cash flipped to net debt as the company added $6.0B of debt [4], bought back $12.9B of stock [1], and (in the LTM to Apr-30-2026) raised ~$30.8B more debt for the Informatica acquisition [2], pushing net debt to $30.7B [3]. The earnings inflection (FY23→FY24) is profitability-driven and now well-established; the FY26 change is a capital-structure event, not an operating one.
- **Cash backing is strong and improving:** FCF rose every year from $5.3B (FY22) to $14.4B (FY26) [1][2], and FCF (~$14.4B) exceeds GAAP net income (~$7.5B) — earnings are more than fully cash-backed, helped by upfront subscription billing and SBC being a non-cash charge. (Earnings-quality detail is for agent 06; noted here only as a level fact.)

---

## 7. Citations

[1] FY26 10-K (Salesforce, Inc., Form 10-K filed Mar-02-2026), Consolidated Statements of Operations (revenue, cost of revenues, income from operations, net income, diluted EPS, shares, restructuring), Consolidated Statements of Cash Flows, and SBC disclosure — covers fiscal years ended Jan-31-2026 / 2025 / 2024. Pool file: `Salesforce_Inc_-_Form_10-K-Mar-02-2026.txt`.
[2] Capital IQ standardized financials — annual Income Statement, Cash Flow, and Key-Stats/LTM column (Apr-30-2026), reported currency USD. Pool tabs: `Salesforce-Inc-NYSE-CRM-Financials_annual__Income-Statement.txt`, `...__Cash-Flow.txt`, `...__Key-Stats.txt`. Data as of the May-28-2026 LTM filing.
[3] Capital IQ standardized Balance Sheet, annual + Apr-30-2026 column (cash, short-term investments, total/net debt, unearned revenue, current portion of debt, working-capital components, employees). Pool tab: `Salesforce-Inc-NYSE-CRM-Financials_annual__Balance-Sheet.txt`.
[4] FY26 cash flow: $6,000M long-term debt issued in FY26 [2]; full debt detail in `Salesforce-Inc-NYSE-CRM-Financials_annual__Cash-Flow.txt`.
[5] Capital IQ annual Ratios and Key-Stats tabs (margins, leverage ratios, growth rates; and note that Key-Stats "LTM" EBIT/EBITDA blends forward estimates). Pool tabs: `Salesforce-Inc-NYSE-CRM-Financials_annual__Ratios.txt`, `...__Key-Stats.txt`.
[6] Capital IQ standardized quarterly financials (Income Statement, Cash Flow, Segments), covering Q2 FY21 through Q2 FY26 (Jul-31-2025). Pool tabs: `Salesforce-Inc-NYSE-CRM-Financials_quarterly__Income-Statement.txt`, `...__Cash-Flow.txt`, `...__Segments.txt`.
[7] Q1 FY27 earnings call, prepared remarks (Salesforce, Inc., Q1 2027 Earnings Call, May-27-2026): Q1 revenue $11.13B; GAAP operating margin 21.1% (+130 bps); non-GAAP operating margin 34.8% (+250 bps); operating cash flow $6.7B; FY27 GAAP/non-GAAP margin guidance 20.6% / 34.3%; reported non-GAAP EPS $3.88. Pool file: `Salesforce-Inc.-Q1-2027-Earnings-Call-May-27-2026.txt`.
[8] Q4 FY26 earnings call, prepared remarks + header consensus/actual block (Salesforce, Inc., Q4 2026 Earnings Call, Feb-25-2026): Q4 revenue ≈ $11.2B (actual $11,201M); FY26 total revenue $41.5B; reported non-GAAP EPS Q4 $3.81, Q3 $3.25, Q2 $2.91. Pool file: `Salesforce-Inc.-Q4-2026-Earnings-Call-Feb-25-2026.txt`.
[9] FY26 10-K, MD&A — seasonality language ("our fourth quarter has historically been our strongest quarter for new business and renewals"). Pool file: `Salesforce_Inc_-_Form_10-K-Mar-02-2026.txt`.
