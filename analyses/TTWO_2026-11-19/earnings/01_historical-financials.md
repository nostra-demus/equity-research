# Historical Financials — TTWO

**Company:** Take-Two Interactive Software, Inc. (NasdaqGS:TTWO) · **Regime:** US SEC (10-K / 10-Q / 8-K Ex. 99.1) · **Standard:** US GAAP · **Currency:** USD, millions unless stated · **Fiscal year:** ends 31 March (FY2026 = year ended 2026-03-31; FY2027 is in progress) [1][3].

**Three basis warnings that govern every number below (read first).**

1. **GAAP net revenue ≠ Net Bookings.** Take-Two reports a GAAP line (total net revenue) and a company-defined operational metric (Net Bookings). Q2 FY27 GAAP net revenue was $1,497.0m while Net Bookings were $1,601.3m [3][5]. **Every revenue figure in this report is GAAP total net revenue.** Net Bookings appears only where it is named.
2. **Two gross-profit / EBIT bases exist.** The audited filing and the Capital IQ export do not agree, because the vendor reclassifies asset writedowns and business-reorganisation charges out of cost of revenue and operating expense. FY2026 filing gross profit was $3,809.7m; the vendor's was $3,838.8m [1][7]. Where the filing discloses the line, the filing is used (§4) and the vendor difference is named. Where the filing does not disclose the line (EBITDA; FY2022; individual Q3/Q4 quarters), the vendor is used and labelled.
3. **EBITDA has two definitions here.** "EBITDA (CIQ)" is the vendor's computed figure. "EBITDA (company-defined)" is Take-Two's own non-GAAP measure — GAAP net income (loss) excluding interest income/expense, income taxes, depreciation and amortisation, and amortisation of acquired intangibles [3, p.11 of 14]. It does **not** add back stock-based compensation; the company's separate "management reporting" table does. The three are different numbers and are never mixed below.

All growth rates, margin deltas, TTM sums, FCF and leverage in this report were computed by an executed Python snippet; the commands and their printed results are reproduced in §8.

---

## 1. Annual Financial Table (FY2022–FY2026, USD millions)

| Metric | FY2022 | FY2023 | FY2024 | FY2025 | FY2026 | Trend |
|---|---:|---:|---:|---:|---:|---|
| Revenue (total net revenue) | 3,504.8 ᵛ | 5,349.9 | 5,349.6 | 5,633.6 | 6,656.4 | Accelerating |
| Revenue YoY % | n/a | +52.6% | −0.0% | +5.3% | +18.2% | Accelerating |
| Gross Profit | 2,040.0 ᵛ | 2,285.3 | 2,241.8 | 3,062.2 | 3,809.7 | Inflecting |
| Gross Margin % | 58.2% ᵛ | 42.7% | 41.9% | 54.4% | 57.2% | Inflecting |
| Gross Margin Δ (bps) | n/a | n/c ᵉ | −81 | +1,245 | +288 | Inflecting |
| EBITDA (CIQ vendor-computed) | 671.0 ᵛ | 555.5 ᵛ | 432.2 ᵛ | 379.5 ᵛ | 788.5 ᵛ | Inflecting |
| EBITDA Margin % (CIQ) | 19.1% | 10.4% | 8.1% | 6.7% | 11.8% | Inflecting |
| EBITDA Margin Δ (bps) | n/a | −876 | −230 | −134 | +511 | Inflecting |
| EBIT (income/(loss) from operations) | 545.0 ᵛ | (1,165.2) | (3,590.6) | (4,391.1) | (104.2) | Volatile |
| EBIT Margin % | 15.6% ᵛ | −21.8% | −67.1% | −77.9% | −1.6% | Volatile |
| EPS (diluted, GAAP) | $3.58 ᵛ | $(7.03) | $(22.01) | $(25.58) | $(1.62) | Volatile |
| CFO (net cash from operating activities) | 258.0 ᵛ | 1.1 | (16.1) | (45.2) | 624.3 | Inflecting |
| Capex (total: fixed assets + asset acquisitions) | 158.6 ᵛ | 204.2 | 169.1 | 189.7 | 190.2 | Accelerating |
| FCF (CFO − total capex) | 99.4 | (203.1) | (185.2) | (234.9) | 434.1 | Inflecting |
| Working Capital (current assets − current liabilities) | 1,766.1 ᵛ | (1,343.5) ᵛ | (146.7) | (799.9) | 610.7 | Volatile |
| Net Debt — **strict basis** (total debt per the filing debt note − cash & equivalents) | (1,732.1) net cash | 2,252.4 ᵛ | 2,328.9 | 2,205.0 | 972.5 | Inflecting |
| Net Debt / EBITDA (strict net debt ÷ CIQ EBITDA) | net cash (−2.58x) | 4.05x | 5.39x | 5.81x | 1.23x | Inflecting |

ᵛ = Capital IQ vendor figure (`Financials_Annual` export, restatement basis "Latest Filings"), not the filing's own number [7][8]. All unmarked FY2023–FY2026 figures are from the 10-K statements [1][2].
ᵉ = not computed. The FY2022 gross margin is on the **vendor** basis (writedowns excluded from cost of revenue) and the FY2023 figure is on the **filing** basis; a FY2022→FY2023 margin delta would be a basis switch, so it is suppressed rather than printed (§15, no mixing of bases). On a like-for-like vendor basis the vendor's own series runs FY2022 58% → FY2023 53% → FY2024 53% → FY2025 58% → FY2026 58% [9].

**Notes on construction.**

- **Capex definition.** "Total capex" = *Purchases of fixed assets* + *Asset acquisitions*, both from the cash-flow statement. FY2026: 162.8 + 27.4 = 190.2; FY2025: 169.4 + 20.3 = 189.7; FY2024: 141.7 + 27.4 = 169.1 [1][2]. This reconciles exactly to the vendor's own capex line for all four years [8], so the two sources agree on capex. Capex is shown as a positive number here; the cash-flow statement shows it as a cash outflow, and the absolute value is used in the FCF subtraction.
- **What capex does *not* capture.** Take-Two's largest discretionary spend is *software development costs and licenses* — $688.9m in FY2026 — which sits **inside** operating cash flow, not in capex [1, p.66]. CFO is therefore already net of game development spend. Do not treat FCF of $434.1m as "cash before content investment".
- **FCF definition.** FCF = CFO − total capex (§15). FY2026: 624.3 − 190.2 = **434.1**. No company-defined FCF is disclosed in the pool, and the vendor's "Levered Free Cash Flow" of $787.6m for the LTM is an after-interest vendor construction, **not** the §15 definition — it is not used here [10].
- **Net debt, strict basis, composition confirmed.** Total debt is taken from the filing's own debt note, which contains **only** senior notes and convertible notes; lease liabilities are a separate balance-sheet line and are **not** in the debt note. FY2026: short-term debt, net $30.0m + long-term debt, net $2,488.0m = $2,518.0m, against cash & equivalents of $1,545.5m → **net debt $972.5m, strict basis** [1, Note 11 (Debt), p.85–86; 1, p.63]. Restricted cash ($13.2m current + $79.4m long-term) and short-term investments ($443.8m) are deliberately excluded from the cash side. FY2024 and FY2025 debt figures are likewise from the filings' own debt notes [2]; the FY2023 debt split is vendor-sourced [7].
- **The vendor's net-debt figure is a different measure and is not used in this table.** Capital IQ reports net debt of $969.0m at FY2026 and $1,237.8m at 2026-09-30, pinned in the deterministic facts sidecar [10]. That figure is on a **broad** basis on the cash side (it nets short-term investments) *and* its total-debt input includes lease liabilities, which the filing's debt note excludes. At 2026-09-30 the gap reconciles exactly: strict $1,370.4m − short-term investments $524.2m + lease liabilities $391.6m = $1,237.8m. No misread — two different definitions, both named.
- **Canonical net debt is not this module's output.** The `balance-sheet-survival` module builds the filing-verified, canonical net-debt figure from the debt note directly. This row is a supporting line for the trend table and is not guaranteed to match that module's figure.

---

## 2. TTM Snapshot (four quarters ended 2026-09-30 vs four quarters ended 2025-09-30)

Latest TTM = Q3 FY26 + Q4 FY26 + Q1 FY27 + Q2 FY27 (Dec-2025, Mar-2026, Jun-2026, Sep-2026). Prior TTM = Q3 FY25 + Q4 FY25 + Q1 FY26 + Q2 FY26. Both are sums of actual reported standalone quarters — nothing is estimated or annualised.

| Metric | Latest TTM | Prior TTM | Change | Evidence |
|---|---:|---:|---:|---|
| Revenue (GAAP total net revenue) | 6,409.7 | 6,219.9 | +189.8 / **+3.1%** | [9] quarterly columns; latest TTM ties exactly to the vendor's own LTM column 6,409.7 [7] |
| EBITDA (CIQ vendor) | 724.9 (vendor LTM column) | 703.2 (sum of quarters) | +21.7 / **+3.1%** | [10] pins LTM EBITDA 724.9; [9] quarterly sum = 732.3 — see reconciliation note |
| EBITDA margin % (CIQ) | 11.3% | 11.3% | **+2 bps** | derived, §8 |
| EBIT (income/(loss) from operations) | (112.5) (vendor LTM column) | (387.3) (sum of quarters) | +274.8 | [7] LTM column; [9] quarterly sum = (105.1) |
| EPS diluted (GAAP) | $(1.29) | $(22.59) | +$21.30 | [9]; latest TTM ties to the vendor LTM column $(1.29) [7] |
| CFO | 367.1 | 357.9 | +9.2 / **+2.6%** | [9]; ties exactly to [10] LTM CFO 367.1 |
| Capex (total) | 304.5 | 176.9 | +127.6 / **+72.1%** | [9]; ties exactly to the filing: H2 FY26 (162.8−57.0=105.8 fixed assets) + 6M FY27 163.3 + asset acquisitions 35.4 = 304.5 [1][3] |
| FCF (CFO − capex) | **62.6** | **181.0** | **−118.4 / −65.4%** | derived, §8 |
| Net debt at latest period-end (2026-09-30) — **strict basis** | **1,370.4** | 2,205.0 (at 2025-03-31) | — | 629.2 + 1,890.6 = 2,519.8 total debt per the filing debt note, less cash & equivalents 1,149.4 [3, Note 10 (Debt); 3, p.2] |
| Net debt / EBITDA at 2026-09-30 (strict ÷ LTM CIQ EBITDA) | **1.89x** | — | — | 1,370.4 ÷ 724.9, derived, §8 |

**Note:** net debt is a point-in-time balance-sheet metric, not a TTM flow metric. The strict-basis label is carried unqualified here because the total-debt composition **is** confirmed against the filing's own debt note (senior notes plus convertible notes; lease liabilities of $391.6m excluded) [3, Note 10]. The vendor's broad-basis figure for the same date is $1,237.8m → 1.71x [10], reconciled in §1.

**Reconciliation — the $7.4m vendor-internal EBITDA gap.** Capital IQ's own LTM column says EBITDA $724.9m [7][10], while summing its own four quarterly columns gives $732.3m [9]. The same $7.4m gap appears between its FY2026 annual column (788.5) and its FY2026 quarterly sum (795.9). This is a vendor restatement difference between its annual/LTM and quarterly series, not a misread on either side. The sidecar-pinned $724.9m is used as the authoritative latest-TTM read; the prior-TTM figure has no vendor LTM column and is therefore a sum of quarters, so the +3.1% change carries a ~1% basis difference. It is not precise enough to call a trend on its own.

---

## 3. Latest Quarterly Trend Table (8 quarters, USD millions)

Single basis: Capital IQ `Financials_Quarterly` for all eight quarters, so the columns are comparable to each other. The filing's own figures for the quarters covered by a 10-Q are reconciled beneath the table.

| Metric | Q3 FY25 (Dec-24) | Q4 FY25 (Mar-25) | Q1 FY26 (Jun-25) | Q2 FY26 (Sep-25) | Q3 FY26 (Dec-25) | Q4 FY26 (Mar-26) | Q1 FY27 (Jun-26) | Q2 FY27 (Sep-26) | QoQ Trend | YoY vs Same Q |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---|---|
| Revenue | 1,359.8 | 1,582.5 | 1,503.8 | 1,773.8 | 1,699.0 | 1,679.8 | 1,533.9 | 1,497.0 | Decelerating (last 4 QoQ: −1.1%, −8.7%, −2.4%, ... Q2 FY27 −2.4% on Q1) | Q2 FY27 **−15.6%** vs Q2 FY26; Q1 FY27 **+2.0%** vs Q1 FY26 |
| Gross Margin % | 55.9% | 62.1% | 62.8% | 55.3% | 55.8% | 57.6% | 60.4% | 57.5% | Volatile (range 55.3%–62.8%) | Q2 FY27 **+220 bps** vs Q2 FY26 |
| EBITDA (CIQ) | 120.5 | 226.7 | 238.5 | 117.5 | 182.2 | 257.7 | 216.5 | 75.9 | Volatile | Q2 FY27 **−35.4%** vs Q2 FY26 |
| EBITDA Margin % (CIQ) | 8.9% | 14.3% | 15.9% | 6.6% | 10.7% | 15.3% | 14.1% | 5.1% | Volatile | Q2 FY27 **−150 bps** vs Q2 FY26 |
| EPS (diluted, GAAP) | $(0.71) | $(21.08) | $(0.07) | $(0.73) | $(0.50) | $(0.32) | $(0.18) | $(0.29) | Volatile (Q4 FY25 carries a $3,545.2m goodwill impairment) | Q2 FY27 loss narrowed from $(0.73) to $(0.29) |
| CFO | (4.8) | 279.0 | (44.7) | 128.4 | 305.2 | 235.4 | (168.8) | (4.7) | Volatile | 6M FY27 CFO **$(173.5)m** vs 6M FY26 **+$83.7m** |
| Capex (total) | 50.2 | 58.3 | 29.5 | 38.9 | 77.5 | 44.3 | 40.8 | 141.9 | Accelerating | Q2 FY27 capex 3.6x Q2 FY26 |

**Reconciliation to the filings (the quarters a 10-Q covers).**
- Q2 FY27: filing revenue 1,497.0, cost of revenue 636.6, gross profit **860.4** (57.5%), diluted loss per share $(0.29) [3, p.3]. The vendor shows gross profit 860.6 — a $0.2m difference equal to the quarter's asset writedown, which the vendor reclassifies out of cost of revenue [9].
- Q1 FY27: filing cost of revenue 651.4 and gross profit **882.5** (57.5%), derived as 6M (1,288.0 / 1,742.9) less Q2 [3, p.3]. The vendor shows 925.9 (60.4%) — a **$43.4m** difference, again the quarter's asset writedown moved out of cost of revenue [9]. **This is the single largest filing-vs-vendor gap in the table:** on the filing basis Q1 FY27 gross margin was 57.5%, not 60.4%, and the "Q1→Q2 margin fell 290 bps" read from the vendor row disappears entirely on the filing basis (57.5% → 57.5%).
- Q2 FY26 and Q1 FY26: vendor and filing agree (980.5 / 1,773.8 and revenue 1,503.8) [3, p.3; 9].
- **Q3 FY26 and Q4 FY26 have no filing in the pool.** There is no Q3 FY27-year 10-Q for the December-2025 quarter and no FY2026 Q4 release; both columns are vendor-constructed (a March-year-end Q4 is itself derived as the annual figure less the nine-month figure). They are used, labelled, and not treated as filing-grade.
- 10-Q cash-flow statements are **six-month cumulative**, not standalone quarters [3, p.5]. The standalone quarterly CFO and capex columns above are the vendor's; they reconcile to the filings at the six-month and full-year level (6M FY27 CFO −168.8 + −4.7 = −173.5 = filing; FY26 CFO quarterly sum = 624.3 = filing) [1][3][9].

---

## 4. Reported vs Adjusted Metrics — Q2 FY27 (three months ended 2026-09-30, USD millions)

Take-Two **does** disclose adjusted metrics, on two levels: a non-GAAP **EBITDA**, and a separate "management reporting" adjustment table used internally by management and the Board [3, p.2 and p.11–12].

| Metric | Reported Value | Adjusted Value | Adjustment Amount | Adjustment Reason | Evidence |
|---|---:|---:|---:|---|---|
| EBITDA (company-defined non-GAAP) | Net loss $(54.0) | **$92.2** | **+146.2** | Removes income tax benefit (57.9), interest income (19.3), interest expense +30.2, D&A +48.1, amortisation of acquired intangibles +145.1 | [3, p.11 "Reconciliation of GAAP to Non-GAAP Measure"] |
| EBITDA — management-reporting basis (further adjusted) | $92.2 (non-GAAP EBITDA) | **$277.1** | **+184.9** | Change in deferred net revenue and related cost of revenue +101.9, stock-based compensation +90.0, business acquisition +2.4, other (9.4) | [3, p.2 management-reporting table] |
| EBIT (income/(loss) from operations) | $(117.5) | **$229.6** (management-reporting) | **+347.1** | Deferred net revenue +101.0, stock-based compensation +90.0, amortisation of acquired intangibles +153.0, business acquisition +3.1 | [3, p.2]; the company discloses **no** adjusted EBIT as a named non-GAAP line — this is the arithmetic of its own disclosed adjustment columns |
| EPS (diluted) | $(0.29) GAAP | **≈ $0.99** (management-reporting, derived) | **+$1.28** | Pre-tax (111.9) + 101.9 + 90.0 + 153.0 + 3.7 − 9.4 = 227.3; × (1 − 18% management tax rate) = 186.4; ÷ 188.0m share count = $0.99 | [3, p.2] discloses the adjustment columns, the 18% management tax rate and the 188.0m share count but not the resulting per-share figure; the vendor's consensus header records the quarter's EPS **actual at $1.00** [11] |

**Three things this table is saying plainly.** First, the gap between GAAP and the company's own preferred number is very large: a $(54.0)m GAAP net loss becomes $277.1m of management-reporting EBITDA, a $331m swing on $1,497m of revenue. Second, **$90.0m of that is stock-based compensation** — a real cost of paying employees, added back every quarter ($305.3m in FY2026) [1, p.66]. Third, **$101.9m is a deferred-revenue timing adjustment** — revenue the company has billed but GAAP defers; it shifts income between periods rather than creating it. Any downstream comparison must name which of the four columns it is using.

**FY2027 guidance is issued on all of these bases at once** — GAAP total net revenue $7,980–8,180m, GAAP diluted EPS $0.57–0.75, non-GAAP EBITDA $1,024–1,082m, and the operational metric Net Bookings $8,000–8,200m [3, "Outlook for Fiscal Year 2027"]. Guidance analysis belongs to `04_guidance-consensus`; it is named here only because the four bases are not interchangeable.

No full-year company-defined EBITDA for FY2026 exists in this pool (no Q4 FY26 release was admitted), so §1's EBITDA row is vendor-computed throughout rather than company-defined.

---

## 5. Quarterly Seasonality Table (FY2024–FY2026, GAAP net revenue)

| Quarter | FY2024 Rev Share | FY2025 Rev Share | FY2026 Rev Share | Avg Rev Share | FY2024 EBITDA Margin | FY2025 EBITDA Margin | FY2026 EBITDA Margin |
|---|---:|---:|---:|---:|---:|---:|---:|
| Q1 (Jun) | 24.0% | 23.8% | 22.6% | **23.5%** | 8.0% | 6.2% | 15.9% |
| Q2 (Sep) | 24.3% | 24.0% | 26.6% | **25.0%** | 7.1% | −3.7% | 6.6% |
| Q3 (Dec) | 25.5% | 24.1% | 25.5% | **25.1%** | 11.2% | 8.9% | 10.7% |
| Q4 (Mar) | 26.2% | 28.1% | 25.2% | **26.5%** | 6.1% | 14.3% | 15.3% |
| Total | 5,349.6 | 5,633.6 | 6,656.4 | | 8.1% | 6.7% | 12.0% |

Built from actual reported standalone quarterly revenue, not estimates; each year's four quarters sum exactly to the audited annual revenue (FY2024 5,349.6; FY2025 5,633.6; FY2026 6,656.4) [1][2][9]. The Total-row EBITDA margins are computed from the **quarterly** EBITDA columns, so FY2026 reads 12.0% (795.9 / 6,656.4) against 11.8% in §1, which uses the vendor's annual column (788.5) — the same $7.4m vendor-internal gap reconciled in §2.

**Flag: no quarter consistently takes more than 30% or less than 20% of annual revenue.** The spread between the heaviest quarter (Q4, 26.5% average) and the lightest (Q1, 23.5%) is only about 3 percentage points. On GAAP net revenue, **Take-Two has almost no revenue seasonality** — which is the opposite of what a game publisher's release calendar would suggest.

The reason is mechanical, and it matters: 81% of Net Bookings is recurrent consumer spending (in-game purchases and virtual currency), and GAAP defers a large part of each quarter's billings over the expected service period, so lumpy bookings arrive as smoothed revenue [3, p.1; 3, "Net Bookings by content"]. **Seasonality that is invisible in GAAP revenue is still present in bookings and in margin.** EBITDA margin is where the lumpiness shows: it ranged from −3.7% (Q2 FY25) to +15.9% (Q1 FY26) across these twelve quarters — a 19.6-percentage-point spread on revenue that barely moves.

---

## 6. Key Trend Summary

**Revenue: accelerating through FY2026, then reversing in the first half of FY2027.** Annual revenue growth ran −0.0% (FY2024) → +5.3% (FY2025) → +18.2% (FY2026), and the FY2023 jump of +52.6% was acquisition-driven (the Zynga deal, closed May 2022) rather than organic [1][2][7]. That acceleration has now broken: Q1 FY27 grew +2.0% year on year and Q2 FY27 fell **−15.6%** to $1,497.0m, with Net Bookings down 18% to $1,601.3m and below the company's own $1,620–1,670m guidance for the quarter [3; 5]. On a trailing-twelve-month basis revenue is still up, but only +3.1% (6,409.7 vs 6,219.9) — far below the +18.2% the last closed fiscal year printed. The dominant direction over the last two reported quarters is **decelerating**; over the five-year annual series it is **accelerating**. Both statements are true on their own period, and they must not be collapsed into one.

**Margins: expanding on gross margin, inflecting upward on EBITDA from a FY2025 trough, but down sharply in the latest quarter.** Filing-basis gross margin rose from 41.9% (FY2024) to 54.4% (FY2025, +1,245 bps) to 57.2% (FY2026, +288 bps) [1][2]. Vendor-basis EBITDA margin bottomed at 6.7% in FY2025 and recovered to 11.8% in FY2026 (+511 bps) [7]. Then Q2 FY27 broke the pattern: EBITDA margin 5.1% against 6.6% a year earlier (−150 bps), with absolute EBITDA down 35.4% to $75.9m, even though gross margin in the same quarter *improved* 220 bps [3][9]. **Margin direction is: gross margin expanding, EBITDA margin inflecting — and the gap between the two is the finding, not a rounding issue.** Gross margin up while EBITDA margin down means the compression sits below the gross line (operating cost absorption on a smaller revenue base), not in cost of revenue. Attributing that is `03_margin-drivers`' job, not this module's.

**Seasonality: material in bookings and margin, essentially absent in GAAP revenue.** No quarter takes more than 26.5% or less than 23.5% of annual GAAP revenue on a three-year average, so there is no "quarter that matters most" in reported revenue; but EBITDA margin swung across a 19.6-point range over the same twelve quarters, so profit timing is genuinely lumpy [9]. The company's own FY2027 outlook makes the point sharply: Q3 FY27 GAAP revenue is guided to $3,270–3,420m against $1,699.0m in Q3 FY26 — roughly a doubling in a single quarter — which would be the largest quarterly revenue skew anywhere in this history [3]. That skew is a forward company statement, not realised history, and nothing in §1–§5 assumes it.

**Inflection points in the last five years: three, all identifiable.** (i) **FY2023 — the Zynga acquisition.** Revenue +52.6%, total debt from effectively nil at 2022-03-31 to $3,079.8m, net cash of $1,732.1m becoming net debt of $2,252.4m, leverage 4.05x, and the first of three consecutive years of negative FCF [1][2][7]. (ii) **FY2024–FY2025 — goodwill written off.** $2,342.1m of goodwill impairment in FY2024 and $3,545.2m in FY2025 drove operating losses of $(3,590.6)m and $(4,391.1)m and diluted losses of $(22.01) and $(25.58); goodwill fell from $6,767.1m to $1,057.3m. These are non-cash: EBITDA over the same two years was positive ($432.2m, $379.5m), which is exactly why the EBIT and EPS rows read "Volatile" while the EBITDA row reads "Inflecting" [1][2][7]. (iii) **FY2026 — a cash and balance-sheet reset.** CFO swung from $(45.2)m to $+624.3m, FCF from $(234.9)m to $+434.1m, $1,150.0m of debt was repaid and $1,247.5m of common stock was issued, and strict-basis net debt more than halved from $2,205.0m to $972.5m, taking leverage from 5.81x to 1.23x [1][7]. **That reset has partly unwound in the six months since:** FCF over the latest TTM is only $62.6m against $181.0m a year earlier (CFO roughly flat at $367.1m while total capex rose 72% to $304.5m), and strict-basis net debt has risen from $972.5m to $1,370.4m (1.89x) [1][3][9][10].

---

## 7. Citations

[1] FY2026 Form 10-K (fiscal year ended 2026-03-31), filed 2026-05-22 — Consolidated Balance Sheets p.63; Consolidated Statements of Operations p.64; Consolidated Statements of Cash Flows p.66; Note 11 (Debt) p.85–86. `data/TTWO/10K_2025_26_0001628280-26-037434.pdf`
[2] FY2025 Form 10-K (fiscal year ended 2025-03-31) — Consolidated Balance Sheets p.65; Consolidated Statements of Operations p.66 (FY2025 / FY2024 / FY2023); Consolidated Statements of Cash Flows p.68; Note (Debt) p.85–86. `data/TTWO/10K_2024_25_0001628280-25-026694.pdf`
[3] Q2 FY2027 Form 10-Q (quarter ended 2026-09-30) — Condensed Consolidated Balance Sheets p.2; Statements of Operations p.3; Statements of Cash Flows p.5 (six months); Note 10 (Debt). `data/TTWO/10Q_2Q_0001628280-26-072254.pdf`
[4] Q1 FY2027 Form 10-Q (quarter ended 2026-06-30) — Condensed Consolidated Statements of Operations. `data/TTWO/10Q_1Q_0001628280-26-054870.pdf`
[5] TTWO Q2 FY2027 earnings release (Form 8-K Exhibit 99.1), dated 2026-11-09 — p.1 (Net Bookings $1,601.3m, −18%); p.2 (management-reporting adjustment table; "Outlook for Fiscal Year 2027" and Q3 FY27 outlook); p.11 (Reconciliation of GAAP to Non-GAAP Measure — EBITDA definition and bridge); "Net Revenue and Net Bookings by Content, Platform Mix, Distribution Channel, and Geographic Region". `data/TTWO/TTWO 2Q27 Earnings Release FINAL.pdf`
[6] TTWO Q1 FY2027 earnings release (Form 8-K Exhibit 99.1), dated 2026-08-07 — Q1 FY27 company-defined EBITDA $167.0m vs $225.5m prior-year quarter; Net Bookings $1,385.9m (−3%). `data/TTWO/TTWO 1Q27 Earnings Release FINAL 8-6-2026.pdf`
[7] Capital IQ `Financials_Annual` export, **Income Statement** tab (FY2017 → FY2026 + LTM Sep-30-2026; reported currency USD m; restatement basis "Latest Filings"), data as of the 2026-11 export. `data/TTWO/Take Two Interactive Software Inc NasdaqGS TTWO Financials_Annual.xls`
[8] Capital IQ `Financials_Annual` export, **Cash Flow** and **Balance Sheet** tabs (FY2017 → FY2026 + Sep-30-2026), data as of the 2026-11 export. Same workbook as [7].
[9] Capital IQ `Financials_Quarterly` export, **Income Statement**, **Cash Flow** and **Balance Sheet** tabs (FQ1 2017 / Jun-30-2016 → FQ2 2027 / Sep-30-2026; ~42 standalone quarters), data as of the 2026-11 export. `data/TTWO/Take Two Interactive Software Inc NasdaqGS TTWO Financials_Quarterly.xls`
[10] `ciq_facts.json` deterministic facts sidecar (frozen extract generation) — `total_debt_m` 2,911.4; `net_debt_m` 1,237.8 (CIQ vendor basis); `ltm_ebitda_m` 724.9; `ltm_ocf_m` 367.1; `levered_fcf_m` 787.6 (levered, **not** the §15 CFO−capex definition); `margin_trend`; `multi_year_trajectory`; all referencing the Capital IQ workbooks at [7]–[9].
[11] Take-Two Interactive Software, Inc., Q2 2027 Earnings Call transcript, 2026-11-09 — S&P Global Market Intelligence Estimates header block (quarter EPS actual 1.00; "Revenue (mm) ACTUAL 1601.30", i.e. the vendor's revenue actual is the Net Bookings figure, not GAAP net revenue). `data/TTWO/Take-Two Interactive Software, Inc., Q2 2027 Earnings Call, Nov 09, 2026.rtf`
[12] Upstream triage: `analyses/TTWO_2026-11-19/earnings/00_earnings-data-triage.md` — jurisdiction, reporting standard, currency, fiscal-year end, interim basis, and the GAAP-revenue-vs-Net-Bookings basis warning.

Not used: `Alphabet Inc NasdaqGS GOOGL Key Developments.xls` is a wrong-company pool contaminant (Alphabet Inc., not Take-Two) and is cited nowhere in this report [12].

---

## 8. Computation Log (executed, not mental arithmetic)

All growth rates, margin deltas in basis points, TTM sums, FCF and leverage above were produced by this executed Python snippet. Inputs are the sourced figures in §1–§5; the printed output is reproduced verbatim.

```python
def g(c,p): return (c-p)/p*100
# --- ANNUAL: FY2022..FY2026 ---
rev=[3504.8,5349.9,5349.6,5633.6,6656.4]      # [7] FY22; [1][2] FY23-26
gp =[2040.0,2285.3,2241.8,3062.2,3809.7]      # [7] FY22 vendor basis; [1][2] filing basis
eb =[671.0,555.5,432.2,379.5,788.5]           # [7] CIQ EBITDA, one basis throughout
ebit=[545.0,-1165.2,-3590.6,-4391.1,-104.2]   # [7] FY22; [1][2] income/(loss) from operations
cfo=[258.0,1.1,-16.1,-45.2,624.3]; cap=[158.6,204.2,169.1,189.7,190.2]
tca=[3871.1,2508.1,2259.7,2815.9,3199.5]; tcl=[2105.0,3851.6,2406.4,3615.8,2588.8]
dbt=[0.0,3079.8,3082.9,3661.1,2518.0]         # filing debt notes [1][2]; FY23 [7]; leases EXCLUDED
csh=[1732.1,827.4,754.0,1456.1,1545.5]        # cash & equivalents only (strict)
# --- QUARTERLY: Q3FY25..Q2FY27 ---  [9]
qr=[1359.8,1582.5,1503.8,1773.8,1699.0,1679.8,1533.9,1497.0]
qgp=[759.9,982.7,945.0,980.5,948.8,967.8,925.9,860.6]
qeb=[120.5,226.7,238.5,117.5,182.2,257.7,216.5,75.9]
```

```
Rev YoY%            [52.6 (FY23), -0.0 (FY24), 5.3 (FY25), 18.2 (FY26)]
GM%                 [58.2, 42.7, 41.9, 54.4, 57.2]      GM bps (FY24..FY26) [-81, 1245, 288]
EBITDA mgn%         [19.1, 10.4, 8.1, 6.7, 11.8]        bps [-876, -230, -134, 511]
EBIT mgn%           [15.6, -21.8, -67.1, -77.9, -1.6]
FCF  (CFO-capex)    [99.4, -203.1, -185.2, -234.9, 434.1]
Working capital     [1766.1, -1343.5, -146.7, -799.9, 610.7]
Net debt (strict)   [-1732.1, 2252.4, 2328.9, 2205.0, 972.5]
Net debt / EBITDA   [-2.58 (net cash), 4.05, 5.39, 5.81, 1.23]
Quarterly GM%       [55.9, 62.1, 62.8, 55.3, 55.8, 57.6, 60.4, 57.5]
Quarterly EBITDA m% [8.9, 14.3, 15.9, 6.6, 10.7, 15.3, 14.1, 5.1]
QoQ revenue%        [16.4, -5.0, 18.0, -4.2, -1.1, -8.7, -2.4]
Q2 FY27 YoY: revenue -15.6%  EBITDA -35.4%  GM +220bps  EBITDA mgn -150bps ; Q1 FY27 revenue +2.0%
TTM revenue 6409.7 vs 6219.9 = +3.1% ; TTM CFO 367.1 vs 357.9 = +2.6%
TTM capex 304.5 vs 176.9 = +72.1% ; TTM FCF 62.6 vs 181.0 = -65.4%
TTM EBITDA margin 11.3% vs 11.3% = +2bps
Net debt/EBITDA at 2026-09-30: strict 1370.4/724.9 = 1.89x ; CIQ broad 1237.8/724.9 = 1.71x
Seasonality rev share  FY2024 [24.0, 24.3, 25.5, 26.2] / FY2025 [23.8, 24.0, 24.1, 28.1] / FY2026 [22.6, 26.6, 25.5, 25.2]
Seasonality avg share  [23.5, 25.0, 25.1, 26.5]
Seasonality EBITDA mgn FY2024 [8.0, 7.1, 11.2, 6.1] / FY2025 [6.2, -3.7, 8.9, 14.3] / FY2026 [15.9, 6.6, 10.7, 15.3]
Ties checked: FY24 4Q rev = 5349.6 OK ; FY25 = 5633.6 OK ; FY26 = 6656.4 OK
             FY26 4Q CFO = 624.3 OK ; 6M FY27 CFO = -173.5 OK ; 6M FY27 capex = 182.7 OK
             latest-TTM revenue = CIQ LTM column 6409.7 OK ; latest-TTM CFO = sidecar 367.1 OK
             latest-TTM capex = sidecar/LTM 304.5 OK ; latest-TTM diluted EPS = CIQ LTM -1.29 OK
             strict - ST investments + leases = 1370.4 - 524.2 + 391.6 = 1237.8 = sidecar net debt OK
```
