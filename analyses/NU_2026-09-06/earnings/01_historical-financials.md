# Historical Financials — NU

**Reporting basis.** Nu Holdings Ltd. (NYSE:NU) reports under **IFRS Accounting Standards**, in **US dollars**, with a fiscal year ending **31 December**. It is a US-listed foreign private issuer, so the audited annual filing is a **Form 20-F** and the quarterly disclosure is an **unaudited interim condensed consolidated financial statement** furnished to the SEC — there is no 10-K or 10-Q, and their absence is not a data gap (CLAUDE.md §27). All figures below are **US$ millions unless stated**, and all are **reported (IFRS)** unless a cell says otherwise. Where a figure comes from a Capital IQ export rather than a filing it is labelled "CIQ" with its data-as-of date.

**One structural point that governs this whole report.** NU is a **bank/lender**, and it files a bank-style income statement: Total revenue → cost of financial and transactional services (funding cost, transactional expenses, expected credit loss) → **Gross profit** → operating expenses → **Income before income taxes**. There is no EBITDA line, no operating-vs-financing cost split of the kind an industrial has, and the balance sheet is unclassified (no current/non-current split). So three rows of the standard template — **EBITDA, EBITDA margin, and working capital** — do not exist in this company's disclosure and are marked N/A with the reason, not estimated. The `ciq_facts.json` sidecar agrees: `ltm_ebitda_m` is `unknown` ("Income Statement sheet has no 'EBITDA' row") and `net_debt_ebitda_x` is `unknown`. Nothing here is manufactured to fill the template.

**Prior in-house memo.** `NU_Holdings_Deep_Dive_15_Page_Memo_30_Aug_2026.pdf` is in the pool and is verdict-bearing. Its verdict is stripped (CLAUDE.md §24) and **no number in this report comes from it**.

---

## 1. Annual Financial Table (FY2021–FY2025)

**Currency: US$ millions, IFRS, fiscal year ended 31 December.** "Reported", not adjusted. Percentages are computed, not quoted; margin changes are in basis points (bps — one hundredth of a percentage point).

| Metric | FY2021 | FY2022 | FY2023 | FY2024 | FY2025 | Trend |
|---|---:|---:|---:|---:|---:|---|
| Revenue (Total revenue) [1][3] | 1,698.0 | 4,792.2 | 8,029.0 | 11,517.0 | 15,774.8 | Decelerating |
| Revenue YoY % | n/a | +182.2% | +67.5% | +43.4% | +37.0% | Decelerating |
| Gross Profit [1][3] | 732.9 | 1,663.0 | 3,491.0 | 5,252.8 | 6,625.0 | Decelerating |
| Gross Margin % | 43.16% | 34.70% | 43.48% | 45.61% | 42.00% | Volatile |
| Gross Margin change (bps) | n/a | −846 | +878 | +213 | −361 | Volatile |
| EBITDA | N/A | N/A | N/A | N/A | N/A | N/A — not disclosed; a bank income statement has no EBITDA line [13] |
| EBITDA Margin % | N/A | N/A | N/A | N/A | N/A | N/A — same reason |
| EBIT-equivalent: Income before income taxes (EBT) [1][3] | (170.2) | (308.9) | 1,539.2 | 2,795.1 | 3,868.4 | Inflecting |
| EBT Margin % | −10.02% | −6.45% | 19.17% | 24.27% | 24.52% | Inflecting |
| EBT Margin change (bps) | n/a | +358 | +2,562 | +510 | +25 | Inflecting |
| Net income to parent shareholders [1][3] | (165.0) | (364.6) | 1,030.6 | 1,972.1 | 2,868.9 | Inflecting |
| Net margin % | −9.72% | −7.61% | 12.84% | 17.12% | 18.19% | Inflecting |
| EPS (diluted, US$) [1][3] | (0.10) | (0.08) | 0.2121 | 0.4034 | 0.5846 | Inflecting |
| EPS YoY % | n/a | n.m. (loss both years) | n.m. (loss to profit) | +90.2% | +44.9% | Decelerating |
| CFO (company-reported, IFRS) [2][3] | (2,924.3) | 755.6 | 1,266.2 | 2,399.1 | 3,500.5 | Inflecting |
| Capex (PP&E + intangibles, absolute value) [2][11] | 28.5 (CIQ) | 114.3 (CIQ) | 177.0 | 175.0 | 340.8 | Accelerating |
| FCF (CFO − capex) | (2,952.8) | 641.3 | 1,089.2 | 2,224.1 | 3,159.7 | Inflecting |
| Working Capital | N/A | N/A | N/A | N/A | N/A | N/A — the IFRS statement of financial position is unclassified (no current/non-current split), so working capital is not a defined quantity for this issuer [5] |
| Net debt (negative = net cash), strict basis [3][4][5][10] | (2,438.4) † | (3,389.5) | (4,576.6) | (7,146.7) | (9,821.6) | Inflecting ‡ |
| Net Debt / EBITDA | N/A | N/A | N/A | N/A | N/A | N/A — company is in net cash and EBITDA is not disclosed [13] |

**Trend-column note.** The Trend word describes the *direction of change*, not the level. Revenue **levels** rose every single year; the **growth rate** fell every year (+182.2% → +37.0%), which is why the row reads Decelerating. The quarterly picture disagrees with the annual one and is adjudicated by name in §6.

**Capex definition and sign.** Capex = acquisition of property, plant and equipment + acquisition and development of intangible assets, taken as a **positive (absolute) number** for the FCF subtraction. FY2025 = 7.2 (PP&E) + 333.6 (intangibles) = 340.8; FY2024 = 5.4 + 169.6 = 175.0; FY2023 = 20.2 + 156.8 = 177.0 [2]. FY2021 and FY2022 use the Capital IQ cash-flow export (6.0 + 22.5; 20.0 + 94.3) because those two years' filed statements did not extract cleanly from this pool — labelled CIQ in the cell [11].

**FCF definition (CLAUDE.md §15).** FCF = CFO − total capex. Worked: FY2025 3,500.5 − 340.8 = **3,159.7**. The company does not publish its own FCF definition, so the doctrine default is used. For a lender this number is not the "cash the business can hand shareholders" — most of the cash movement in the operating line is the loan book and the deposit book growing, not operating surplus. Read it as an arithmetic disclosure, not a distribution capacity.

**Net debt — basis, composition, and the honest caveat (CLAUDE.md §15, WORKFLOW step 7).** For FY2022–FY2025 the figure is built **from the filings' own statement of financial position**: total debt = *Borrowings and financing* + *Repurchase agreements*; cash = *Cash and cash equivalents*. This composition is **confirmed to exclude lease liabilities**, which the company reports as a separate line (US$29.2m at Dec-31-2025, US$66.4m at Jun-30-2026 [5]), and it deliberately excludes **customer deposits** and **payables to network**, which are the funding of the banking business rather than corporate debt — that exclusion is stated so a reader can undo it. On that confirmed-composition basis the label is **strict** unqualified. Worked, FY2025: (4,398.2 + 783.8) − 15,003.6 = **−9,821.6**, i.e. net cash of US$9,821.6m.
- † **FY2021 is the exception and carries the caveat.** The FY2021 borrowings/repo split did not extract from this pool's FY2021/FY2022 20-F, so FY2021 uses the Capital IQ *Total Debt* aggregate (267.3) against the filing's cash (2,705.7): **strict basis (vendor total-debt figure; composition unconfirmed against the filing debt note)**. That vendor aggregate is known to fold in lease and derivative liabilities in later years (see below), so treat FY2021 as indicative only.
- ‡ Net cash built every year to FY2025 and then **partly reversed** in H1 2026 to −7,811.0 (§2), which is why the trend word is Inflecting rather than Accelerating.

**Reconciliation to the `ciq_facts.json` sidecar (required, not overridden).** The sidecar reports `net_debt_m` = **−9,274.2** and `total_debt_m` = **5,896.7** at Jun-30-2026 [13]. My filing-built strict figure for the same date is **−7,811.0** — a gap of 1,463.2. The gap is explained, not disputed, and it runs in two places: (a) the vendor's **total debt** of 5,896.7 is *not* the filing's borrowings line — it decomposes exactly as borrowings 4,682.3 + repurchase agreements 1,058.3 + derivative liabilities 89.7 + lease liabilities 66.4 = 5,896.7 [5][10], so it includes leases and derivatives; and (b) the vendor's net-debt row nets liquidity of 15,170.9 (= 5,896.7 + 9,274.2), which is **more** than the filing's cash and cash equivalents of 13,551.6 — i.e. the sidecar figure sits on a **broad** basis, not a strict one. Both figures say the same thing directionally (large net cash); the difference is definitional. **This module's net debt is a supporting line for the trend and TTM tables, not this module's specialty — the `balance-sheet-survival` module builds the canonical, filing-verified net-debt figure from the debt note, and the two are not guaranteed to match.**

---

## 2. TTM Snapshot

**TTM = the four latest reported quarters: Q3 2025 + Q4 2025 + Q1 2026 + Q2 2026.** Prior TTM = Q3 2024 + Q4 2024 + Q1 2025 + Q2 2025. Every TTM figure below is summed from actual reported quarters — none is estimated or annualised.

| Metric | Latest TTM (to Jun-30-2026) | Prior TTM (to Jun-30-2025) | Change | Evidence |
|---|---:|---:|---:|---|
| Revenue | 19,340.0 | 12,848.6 | +50.5% | Q2'26 and Q1'26 interim statements [5][6]; Q3'25/Q4'25 quarters from CIQ Estimates→Surprise actuals, data as of Aug-2026 [9] |
| EBITDA | Not disclosed | Not disclosed | — | `ciq_facts.json` `ltm_ebitda_m` = unknown — no EBITDA row in a bank template [13] |
| EBIT-equivalent (income before income taxes) | 4,384.6 | 3,165.7 | +38.5% | Sum of quarters [5][6][9]; ties exactly to CIQ LTM "EBT Incl. Unusual Items" 4,384.603 [12] |
| Gross profit (IFRS) | 7,969.0 | Not derivable | n/a | FY2025 6,625.0 − H1'25 2,867.4 + Q1'26 1,864.9 + Q2'26 2,346.5 [1][5][6]. Prior TTM needs H1 2024 statements, which are not in this pool |
| Gross margin % | 41.20% | Not derivable | n/a | 7,969.0 ÷ 19,340.0 |
| EPS diluted (US$) | 0.7348 | 0.4700 | +56.3% | Sum of quarterly diluted EPS [5][6][9]; ties to CIQ LTM diluted EPS excl. extra items 0.734069 [12] |
| Net income to parent | 3,607.1 | 2,300.1 | +56.8% | [5][6][9]; ties to CIQ LTM net income 3,607.106 [12] |
| CFO (company-reported, IFRS) | **(1,381.6)** | Not derivable | n/a | FY2025 3,500.5 − H1'25 3,640.0 + H1'26 (1,242.0) [2][5]. Prior TTM needs H1 2024, absent from this pool |
| Capex | 288.4 | Not derivable | n/a | FY2025 340.8 − H1'25 152.9 + H1'26 100.5 [2][5] |
| FCF (CFO − capex) | **(1,669.9)** | Not derivable | n/a | −1,381.6 − 288.4 |
| Net debt at latest period-end (Jun-30-2026) | **(7,811.0)** = net cash 7,811.0 | (n/a — point in time) | — | (Borrowings and financing 4,682.3 + repurchase agreements 1,058.3) − cash and cash equivalents 13,551.6 [5]. **Strict basis**, composition confirmed against the filing's own statement of financial position and Note 24 — excludes lease liabilities (66.4), customer deposits and payables to network |

*Note: net debt is a point-in-time balance sheet metric, not a TTM flow metric.*

**The cash-flow reconciliation the triage flagged, resolved.** The sidecar reports `ltm_ocf_m` = **−10,304.8** [13], which is the Capital IQ read and is correct **on the vendor's own basis**. It is not the company's reported number and the two reconcile exactly: **CIQ CFO = company CFO − net increase in customer deposits**, because Capital IQ moves the deposit inflow out of operating and into financing. Worked, FY2025: 3,500.5 − 12,861.3 = −9,360.8, which is precisely the CIQ FY2025 figure [11]. Worked, LTM to Jun-30-2026: −10,304.8 + 8,923.2 = −1,381.6, which is precisely the company-basis TTM CFO above. Both reads are internally consistent; I use the **filing's** figure per §4/§5 and show the vendor's alongside. What is *not* a definitional artefact: on the company's own basis, operating cash flow went from **+3,640.0m in H1 2025 to −1,242.0m in H1 2026** [5], turning the TTM company-basis figure negative. That is a real swing in the reported line, driven by credit-card receivables (−8,135.7m in H1'26) and loans to customers (−6,604.2m) growing faster than deposits (+3,408.7m, versus +7,346.8m in H1'25) [5]. Whether that is a quality problem or normal balance-sheet growth for a lender is `06_earnings-quality`'s call, not mine — I record the number and its build.

---

## 3. Latest Quarterly Trend Table (8 quarters)

**US$ millions, IFRS, reported.** Quarters Q1'25, Q2'25, Q1'26 and Q2'26 are taken **directly from the interim filings** [5][6]. Q3'24, Q4'24, Q3'25 and Q4'25 come from the **Capital IQ Estimates→Surprise actuals export (data as of Aug-2026)** [9], because this pool contains no interim filing for those quarters. That vendor series is verified against the filings wherever both exist — e.g. Q2'26 revenue 5,513.208 and diluted EPS 0.2162 match the Aug-14-2026 interim statements to the last digit — so it is a like-for-like extension of the same IFRS series, not a different basis. These are actual quarterly figures, never an annual number divided by four.

| Metric | Q3'24 | Q4'24 | Q1'25 | Q2'25 | Q3'25 | Q4'25 | Q1'26 | Q2'26 | QoQ Trend | YoY vs Same Q |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---|---|
| Revenue (Total revenue) | 2,943.2 | 2,989.3 | 3,247.7 | 3,668.5 | 4,173.0 | 4,685.9 | 4,968.0 | 5,513.2 | Up every quarter; QoQ +3.3, +1.6, +8.6, +13.0, +13.8, +12.3, +6.0, +11.0% | Accelerating: +37.7, +24.3, +18.7, +28.8, +41.8, +56.8, +53.0, **+50.3%** |
| Gross Profit (IFRS) | n/d | n/d | 1,319.5 | 1,548.0 | n/d | n/d | 1,864.9 | 2,346.5 | Not computable for four quarters (no Q3/Q4 interim filing in this pool) | Q1: +41.3%; Q2: +51.6% |
| Gross Margin % (IFRS) | n/d | n/d | 40.63% | 42.20% | n/d | n/d | 37.54% | 42.56% | Volatile | Q1'26 −309bps YoY; Q2'26 **+36bps** YoY |
| Gross Profit (company-defined, deck basis) | 1,301.7 | 1,317.0 | 1,327.5 | 1,519.3 | 1,811.2 | 1,961.1 | 1,878 | 2,441 | Rising, with a QoQ dip in Q1'26 (−7% FX-neutral) | +43% YoY FX-neutral in Q2'26 |
| EBITDA | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A — not disclosed | N/A |
| EBIT-equivalent (income before income taxes) | 723.8 | 767.5 | 795.1 | 879.4 | 1,116.3 | 1,077.7 | 954.3 | 1,236.3 | Volatile — fell in Q4'25 and again in Q1'26 before recovering | Q2'26 +40.6% |
| Net income to parent | 553.4 | 552.6 | 557.2 | 636.8 | 782.5 | 892.4 | 872.1 | 1,060.2 | Rising, with a QoQ dip in Q1'26 | +82.6, +53.1, +47.1, +30.7, +41.4, +61.5, +56.5, **+66.5%** |
| Net margin % (substitute for EBITDA margin) | 18.80% | 18.49% | 17.16% | 17.36% | 18.75% | 19.04% | 17.55% | 19.23% | Stable in a 17.2–19.2% band | Q2'26 +187bps YoY |
| EPS (diluted, US$) | 0.1132 | 0.1129 | 0.1139 | 0.1300 | 0.1595 | 0.1815 | 0.1776 | 0.2162 | QoQ −0.3, +0.9, +14.1, +22.7, +13.8, −2.1, +21.7% | +81.4, +52.6, +47.0, +30.3, +40.9, +60.8, +55.9, **+66.3%** |

**Two labelling points that matter.**
1. **"n/d" is not "missing data"** — it means the quarter's IFRS gross profit is not separately disclosed in this pool, because NU files interim statements only for the quarters present here (Q1'26, Q2'26 and their prior-year comparatives). I do not interpolate it. Where the company's own **deck-defined** gross profit exists for all eight quarters I show it as a separate, clearly-labelled row [7][8] rather than mixing two definitions inside one row. The two definitions do **not** tie: Q2'26 deck 2,441 versus IFRS 2,346.5 (gap 94.5); Q2'25 deck 1,519.3 versus IFRS 1,548.0 (gap −28.7). The gap is not stable, so the deck series must never be substituted into the IFRS row.
2. **A large slice of the headline USD growth is currency, not volume.** NU reports in USD but earns mostly Brazilian reais. The company's own FX-neutral figures put Q2'26 gross revenue growth at **+39% YoY** and gross profit at **+43% YoY**, against my computed **+50.3%** YoY in reported USD revenue — the average USD/BRL rate moved from R$5.6625 in Q2'25 to R$5.0496 in Q2'26, a roughly 12% real appreciation [7]. Anyone reading the acceleration in the table above as pure business acceleration is reading a currency move as an operating one.

---

## 4. Reported vs Adjusted Metrics

The company **does** disclose one adjusted measure — **Adjusted Net Income** — and reconciles it in the 20-F [14]. It discloses no adjusted EBITDA, no adjusted EBIT, and no adjusted EPS.

| Metric | Reported Value (FY2025) | Adjusted Value (FY2025) | Adjustment Amount | Adjustment Reason | Evidence |
|---|---:|---:|---:|---|---|
| EBITDA | Not disclosed | Not disclosed | — | No EBITDA line exists in a bank income statement; the sidecar records `ltm_ebitda_m` as unknown for the same reason | [13] |
| EBIT (proxied by income before income taxes) | 3,868.4 | Not disclosed | — | Company publishes no adjusted EBIT / adjusted pre-tax profit | [1] |
| EPS (diluted, US$) | 0.5846 | 0.6261 — **derived, not disclosed** | +0.0415 | Derived by me as Adjusted Net Income 3,072.6 ÷ weighted-average diluted shares 4,907.352m. The company does not publish an adjusted EPS. *Inference, not from filings — the inputs are filed, the ratio is mine.* | [1][12][14] |
| Net income to parent | 2,868.9 | 3,072.6 | +203.7 | Share-based compensation +359.0; allocated tax effects on share-based compensation −125.8; hedge of the tax effects on share-based compensation −29.5. Arithmetic: 2,868.9 + 359.0 − 125.8 − 29.5 = 3,072.6 | [14] |
| Net income to parent (FY2024 / FY2023 comparatives) | 1,972.1 / 1,030.6 | 2,207.5 / 1,196.5 | +235.4 / +165.9 | Same three items | [14] |

**Two cautions.** First, the adjustment is essentially **adding back stock compensation**, a real and recurring cost paid in shares — the reported IFRS figure is the conservative one and is what §1–§3 use throughout. Second, Capital IQ publishes its **own** "Normalized Diluted EPS" of 0.4922 for FY2025 [12], which is *lower* than reported EPS and is a vendor construct built on a different set of adjustments than the company's. It is not the company's adjusted number and the two must never be quoted as if they were the same thing.

---

## 5. Quarterly Seasonality Table (FY2023, FY2024, FY2025 — the last three complete fiscal years)

FY2026 has only two reported quarters, so the three complete years used are FY2023–FY2025. **EBITDA margin is not disclosed, so the margin columns use net margin (net income to parent ÷ total revenue)** — the substitution is labelled in the header, not hidden.

| Quarter | FY2023 Rev Share | FY2024 Rev Share | FY2025 Rev Share | Avg Rev Share | FY2023 Net Margin | FY2024 Net Margin | FY2025 Net Margin |
|---|---:|---:|---:|---:|---:|---:|---:|
| Q1 | 20.2% | 23.8% | 20.6% | 21.5% | 8.8% | 13.8% | 17.2% |
| Q2 | 23.3% | 24.7% | 23.3% | 23.8% | 12.0% | 17.1% | 17.4% |
| Q3 | 26.6% | 25.6% | 26.5% | 26.2% | 14.2% | 18.8% | 18.8% |
| Q4 | 30.0% | 26.0% | 29.7% | 28.5% | 15.0% | 18.5% | 19.0% |
| Total | 100.0% | 100.0% | 100.0% | 100.0% | | | |

**Flag test (>30% or <20% consistently): no quarter trips it.** Q4 is the largest quarter in all three years (30.0%, 26.0%, 29.7%) and averages 28.5%, but it clears 30% only once, so it does not meet the "consistently >30%" bar. Q1 is the smallest in two of three years and averages 21.5%, but never falls below 20%.

**The more important reading: this pattern is compounding, not seasonality.** A business whose revenue grows roughly 3–13% *every quarter* will mechanically put more of the year's revenue in Q4 than in Q1 even with perfectly flat seasonal demand. The rising within-year share is therefore mostly an arithmetic consequence of growth. The one genuine tell is FY2024, where the spread compressed sharply (23.8% → 26.0%, a range of just 2.2 points versus 9.8 points in FY2023 and 9.1 in FY2025) — that was the year sequential growth slowed to +1.6% and +3.3% in Q4'24 and Q3'24. Seasonality, as a standalone effect, is **not proven from available data**; what the table actually measures is the sequential growth rate.

---

## 6. Key Trend Summary

**Revenue growth: the annual and quarterly series disagree, and both are true.** On an annual basis revenue growth **decelerated** every year — +182.2% (FY2022), +67.5%, +43.4%, +37.0% (FY2025) — while the *level* rose from 1,698.0 to 15,774.8. On a quarterly basis growth **inflected upward**: YoY revenue growth bottomed at +18.7% in Q1'25 and has run +28.8%, +41.8%, +56.8%, +53.0%, +50.3% since. I name the contradiction rather than average it: the annual row is dominated by the enormous early-stage base effect, the quarterly row by the recent re-acceleration — and a material part of that re-acceleration is the Brazilian real, since the company's own FX-neutral figure for Q2'26 gross revenue is **+39%** against my computed **+50.3%** in USD [7]. Direction: **decelerating on the multi-year annual view, inflecting positive on the last six quarters, with roughly a fifth of the recent USD acceleration attributable to currency.**

**Margins: expanding at the bottom line, compressing at the top.** Net margin rose from −9.72% (FY2021) to 18.19% (FY2025), and TTM net margin is 18.65% versus 17.90% a year earlier (+75bps). EBT margin went from −10.02% to 24.52%. But I must adjudicate the series that points the other way, by name (CLAUDE.md §3): **gross margin fell 361bps in FY2025** (45.61% → 42.00%), **Q1'26 gross margin fell 309bps year on year** (40.63% → 37.54%), and **TTM gross margin of 41.20% sits below the FY2024 full-year 45.61%**. The compression is real and sits in the cost of financial and transactional services — expected credit loss grew from 3,169.0 (FY2024) to 4,204.9 (FY2025) [1], faster than revenue. It has not yet overturned the bottom-line expansion because operating costs grew slower than revenue (Q2'26 gross margin was back up +36bps YoY at 42.56%), but a reader told only "margins are expanding" would be reading one metric and ignoring three. Direction: **net margin expanding; gross margin compressing; the two have not yet met.**

**Seasonality: not material as a standalone effect.** Q4 is the biggest quarter (28.5% of revenue on a three-year average) and Q1 the smallest (21.5%), but no quarter consistently breaches the 30%/20% flags, and the within-year gradient is explained by compounding sequential growth rather than by a demand season. Do not build a Q4-uplift assumption off this table.

**Inflection points, with what happened.** Three are visible. (i) **FY2023 — loss to profit**: EBT swung from −308.9 to +1,539.2 and net income from −364.6 to +1,030.6, with gross margin recovering 878bps to 43.48% after the FY2022 trough (34.70%, itself depressed by credit loss expense rising 192% and a US$355.6m contingent-share-award termination charge in G&A [3]). (ii) **Q1'25 — a growth trough at +18.7% YoY revenue**, followed by six quarters of re-acceleration to +50.3%. (iii) **H1 2026 — the reported operating cash line turned negative**: company-basis CFO went from +3,640.0m (H1'25) to −1,242.0m (H1'26), making TTM CFO −1,381.6m even as TTM net income hit a record 3,607.1m [2][5]. Receivables and loans grew faster than deposits in the half. That gap between accounting profit and reported operating cash is the single most important thing in these tables for the modules downstream, and interpreting it belongs to `06_earnings-quality`.

**Balance sheet, one line.** NU is in net cash on a strict, filing-confirmed basis at every year-end from FY2022 (−3,389.5) to FY2025 (−9,821.6), and at −7,811.0 on Jun-30-2026. The H1'26 reduction is partly a US$500.4m share repurchase, the first in the company's history in this data [5].

---

## 7. Citations

All documents live in the frozen extract generation and are cited logically as `data/NU/`.

[1] FY2025 Form 20-F (filed Apr-08-2026), Item 5 Operating and Financial Review and Consolidated Statements of Income — total revenue, gross profit, income before income taxes, net income and per-share data for FY2025 / FY2024 / FY2023.
[2] FY2025 Form 20-F (filed Apr-08-2026), Item 5 Liquidity and Capital Resources and Consolidated Statements of Cash Flows — cash flows generated from operating activities (FY2025 3,500.5 / FY2024 2,399.1 / FY2023 1,266.2); acquisition of property, plant and equipment and acquisition and development of intangible assets.
[3] FY2022 Form 20-F (filed Apr-20-2023), Consolidated Statements of Income, Consolidated Statements of Cash Flows and Note on borrowings and financing — FY2022 / FY2021 revenue, gross profit, loss before income taxes, loss per share, operating cash flow, and the 2022 funding-by-maturity table (borrowings and financing 585,568; repurchase agreements 197,242).
[4] FY2024 Form 20-F (filed Apr-16-2025), Consolidated Statements of Financial Position as of Dec-31-2024 and Dec-31-2023 — borrowings and financing (1,730.4 / 1,136.3), repurchase agreements (308.6 / 210.5), cash and cash equivalents (9,185.7 / 5,923.4).
[5] Unaudited interim condensed consolidated financial statements for the three and six-month periods ended Jun-30-2026 (filed Aug-14-2026) — Statements of Income, Statements of Financial Position (Note 24 Borrowings and financing; Note 11 Cash and cash equivalents; Note 22 Deposits), and Statements of Cash Flows.
[6] Unaudited interim condensed consolidated financial statements for the three-month period ended Mar-31-2026 (filed May-14-2026) — Statements of Income for Q1 2026 and Q1 2025 comparatives.
[7] Q2 2026 Earnings Presentation, Aug-13-2026 — Gross Revenue and Gross Profit by quarter (Q1'25–Q2'26), Net Revenues / Opex / Efficiency Ratio, Net Income and ROE by quarter; FX-Neutral methodology note (R$5.6625 Q2'25 → R$5.0496 Q2'26).
[8] Q4 2025 Earnings Presentation, Feb-25-2026 — Gross Profit, Net Revenues / Opex / Efficiency Ratio, Net Income, ROE and Adjusted Net Income by quarter (Q3'24–Q4'25).
[9] Capital IQ Estimates → Surprise tab, quarterly and annual actuals FQ4 2021–FQ2 2026, data as of Aug-2026 — quarterly total revenue, EBT (GAAP), net income (GAAP) and diluted EPS actuals; used for Q3'24, Q4'24, Q3'25 and Q4'25, verified against the filings for every overlapping quarter.
[10] Capital IQ Financials → Balance Sheet (bank template, annual FY2021–FY2025 plus Jun-30-2026), data as of Aug-2026 — Total Debt component rows used only to decompose and caveat the vendor aggregate, and the FY2021 total-debt figure of 267.3.
[11] Capital IQ Financials → Cash Flow (bank template, FY2021–LTM Jun-30-2026), data as of Aug-2026 — FY2021/FY2022 capital expenditures and purchases of intangibles; net increase in deposit accounts used for the CFO reconciliation.
[12] Capital IQ Financials → Income Statement (bank template, FY2021–LTM Jun-30-2026), data as of Aug-2026 — LTM cross-checks (EBT 4,384.603; net income 3,607.106; diluted EPS excl. extra items 0.734069), weighted-average diluted shares 4,907.352m (FY2025), and the vendor's Normalized Diluted EPS of 0.4922.
[13] `ciq_facts.json` deterministic sidecar for this extract generation — `ltm_ebitda_m` unknown, `net_debt_ebitda_x` unknown, `ltm_ocf_m` −10,304.8, `net_debt_m` −9,274.2, `total_debt_m` 5,896.7.
[14] FY2025 Form 20-F (filed Apr-08-2026), Non-IFRS Financial Measures — Adjusted Net Income (Loss) reconciliation for FY2025 / FY2024 / FY2023 (3,072.6 / 2,207.5 / 1,196.5).

**Not used as a source for any number:** `NU_Holdings_Deep_Dive_15_Page_Memo_30_Aug_2026.pdf` (verdict-bearing prior in-house memo, verdict stripped per CLAUDE.md §24).
