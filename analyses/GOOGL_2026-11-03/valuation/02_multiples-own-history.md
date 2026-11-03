# Multiples — Own History — GOOGL

Alphabet reports under U.S. GAAP in USD and has a 31 December fiscal year. This report applies to **GOOGL, Class A common stock, Nasdaq Global Select Market, USD**. Current price is **$278.99 on 3 November 2026**; the canonical enterprise value (EV, the value of equity plus financing claims less cash) is **$3,523,015m** and the per-share value count is **12,368m fully diluted shares**. [Valuation 01 Price & Capital Structure — GOOGL, §7; `data/GOOGL/Alphabet_Inc_-_Form_10-Q(Oct-29-2026).doc`, Q3 FY2026 Form 10-Q, cover and Note 12]

For compact citations below, CIQ Comps means `data/GOOGL/Company Comparable Analysis Alphabet Inc.xls`; CIQ Financials means `data/GOOGL/Alphabet Inc NasdaqGS GOOGL Financials_Quarterly.xls`; and CIQ Estimates means `data/GOOGL/AlphabetIncNasdaqGSGOOGLEstimatesReport.xls`. These are Tier-5 vendor exports in the frozen 3 November 2026 pool.

## 1. Current Multiples

The EV multiples below use the canonical strict-basis EV from `01`: $3,424,603m market capitalization + $129,823m debt including finance leases + $6,900m non-controlling interests + $18,023m preferred equity − $56,334m cash. This is deliberately different from Capital IQ's broad-net-cash TEV used in its historical EV series. [Valuation 01 Price & Capital Structure — GOOGL, §§3–5]

| Multiple | Basis (LTM / NTM / FY) | Metric Value | Current Multiple | Source |
|---|---|---:|---:|---|
| P / E | LTM, reported GAAP | $19.15 diluted EPS | 14.57x | [CIQ Comps → Financial Data, subject row, 2026-11-03; `ciq_facts.json` `pe_ltm_current_x` = 14.6x, status present] |
| P / E | NTM, Capital IQ consensus GAAP; basic-share vendor convention | $13.79 EPS | 20.24x | [CIQ Comps → Financial Data, subject row, 2026-11-03; CIQ Estimates → Multiples, NTM; CIQ Financials → Multiples header: Dilution = Basic] |
| EV / EBITDA | LTM, calculated GAAP-derived EBITDA; not management-adjusted | $185,516m | 18.99x | [$3,523,015m ÷ $185,516m; Valuation 01, §7; `ciq_facts.json` `ltm_ebitda_m` = $185,516m, status present] |
| EV / EBIT | LTM, reported operating income | $156,976m | 22.44x | [$3,523,015m ÷ $156,976m; Valuation 01, §7; CIQ Financials → Income Statement, LTM ended 2026-09-30] |
| EV / Sales | LTM, reported revenue | $471,098m | 7.48x | [$3,523,015m ÷ $471,098m; Valuation 01, §7; CIQ Financials → Income Statement, LTM ended 2026-09-30] |
| P / Book | Q3 FY2026 common equity | $652,626m | 5.25x | [$3,424,603m ÷ $652,626m; Valuation 01, §§3 and 6; Q3 FY2026 Form 10-Q, Consolidated Balance Sheets and Note 7] |
| P / FCF / FCF yield | LTM operating FCF = CFO − capex | $19,747m / 0.58% yield | 173.42x | [$3,424,603m ÷ $19,747m; Earnings 01 Historical Financials — GOOGL, §2; Q3 FY2026 Form 10-Q, Statements of Cash Flows] |
| Dividend yield | Forward annualised common dividend, gross; not contractual | $0.88 per share (= 4 × $0.22) | 0.32% | [Q3 FY2026 Form 10-Q, Note 11 (Preferred and Common Dividends): $0.22 quarterly common dividend declared in October 2026, record date 7 December and payment date 14 December 2026] |

The $19.747bn FCF figure is operating CFO less total capex, not Capital IQ's levered FCF. It is sharply lower because LTM capex was $159.804bn, so its 173.42x P/FCF is not a normal earnings multiple and has no matched own-history series here. [Earnings 01 Historical Financials — GOOGL, §2; CIQ Financials → Cash Flow, LTM ended 2026-09-30]

Capital IQ's own current TEV/LTM EBITDA read is **17.4x**, which matches the direct extraction of **17.4225x** from the Multiples close series and the deterministic sidecar. Its $3,327,859m TEV is **$195,156m lower** than the canonical bridge because CIQ nets marketable securities and uses its own lease/debt convention; it must not replace the 18.99x canonical read. [CIQ Financials → Multiples, TEV/LTM EBITDA Close, latest; `ciq_facts.json` `ev_ebitda_current_x` = 17.4x, status present; Valuation 01, §4]

## 2. Historical Multiple Bands (3–5 years)

The bands use 20 settled quarterly closes from **31 December 2021 through 30 September 2026**. The 2 November 2026 close is the current observation and is excluded. Mean and median are simple statistics of those 20 closes. Rank percentile is `historical closes at or below current ÷ 20`; range position is `(current − minimum) ÷ (maximum − minimum)`. [CIQ Financials → Multiples, Close rows, 2021-12-31–2026-11-02; vendor export data as of 2026-11-03]

| Multiple | Basis (LTM / NTM / FY) | Observations (n, window) | Min | Mean | Median | Max | Current | Rank percentile | Range position |
|---|---|---|---:|---:|---:|---:|---:|---:|---:|
| P / E | NTM consensus EPS; CIQ basic-share convention, same forward series throughout | 20, 2021-12-31–2026-09-30 | 17.23x | 22.38x | 21.87x | 29.40x | 20.24x | 25.0% | 24.7% |
| P / E | LTM GAAP EPS; current denominator includes a non-operating Q2 FY2026 gain | 20, 2021-12-31–2026-09-30 | 17.26x | 24.07x | 25.51x | 30.88x | 14.56x | 0.0% | -19.8% |
| P / Book | Basic-share CIQ P/B. Current CIQ close is 5.20x; canonical P/B is 5.25x, a 0.9% difference | 20, 2021-12-31–2026-09-30 | 4.51x | 6.82x | 6.70x | 9.77x | 5.20x CIQ / 5.25x canonical | 10.0% | 13.1% |
| EV / EBITDA | LTM, **CIQ vendor TEV**; this row is internally comparable but not the canonical strict-basis EV | 20, 2021-12-31–2026-09-30 | 10.93x | 17.54x | 16.98x | 25.81x | 17.42x CIQ / 18.99x canonical | 55.0% vendor-only | 43.6% vendor-only |

The P/NTM EPS band is the cleanest own-history series: the current 20.24x is **9.6% below the 22.38x mean** and **7.5% below the 21.87x median**, calculated as `(20.24 ÷ reference) − 1`. The P/B read is lower still: canonical 5.25x is **23.1% below its mean** and **21.7% below its median**. Its historical rank uses the 5.20x CIQ close to keep the series on its stated basic-share basis; the result remains two of 20 observations at or below current using 5.25x. [CIQ Financials → Multiples, P/NTM EPS and P/BV Close rows, 2021-12-31–2026-11-02]

The LTM P/E discount is not a reliable valuation signal: 14.56x is 39.5% below the five-year mean and 42.9% below the median, but Q2 FY2026 contains a disclosed $98.999bn gain on sale of investments in the vendor series. That gain inflates LTM GAAP EPS; it does not establish normal cash earnings. [Earnings 01 Historical Financials — GOOGL, §§2–3; CIQ Financials → Quarterly Income Statement, Q2 FY2026]

**Admissibility for `07_scenario-and-fair-value`:** use the P/NTM EPS band (17.23x–29.40x) as the primary own-history anchor and P/B only as a lower-weight cross-check. The LTM P/E band is not admissible because its current denominator is one-off-inflated. The TEV/EBITDA band is not admissible because its broad-net-cash vendor TEV cannot be applied to the canonical strict-basis EV without reconstructing historical debt, cash, investments, leases, preferred equity, and non-controlling interests on the same basis.

## 3. Re-Rating / De-Rating Read

On the forward earnings measure that avoids the Q2 gain, GOOGL trades at 20.24x NTM P/E: 7.5% below its five-year median and at the 25th historical rank percentile. That is a modest de-rating versus the company's own forward-earnings history, not a claim that the historical median is automatically warranted. [CIQ Financials → Multiples, P/NTM EPS Close rows, 2021-12-31–2026-11-02]

P/B gives a larger de-rating read—5.25x canonical P/B versus a 6.70x median—but is a secondary measure for an operating platform because it does not test the return on the new AI and Cloud infrastructure. The $98.999bn Q2 investment-sale gain makes the much larger LTM P/E discount uninformative; conversely, vendor-basis EV/EBITDA is roughly at its own mean (17.42x versus 17.54x), but it cannot be compared to the canonical EV. The evidence therefore does not support one uniform multiple conclusion. [Q3 FY2026 Form 10-Q, Item 2 (Capital Expenditures and Leases); Earnings 01 Historical Financials — GOOGL, §§2–3; CIQ Financials → Multiples]

## 4. Implied Value from Reversion

| Multiple | Reversion Target (mean / median) | Implied EV or Equity | Implied Price/Share | vs Current Price |
|---|---:|---:|---:|---:|
| P / NTM EPS | Median 21.87x × $169,534m NTM earnings | $3,707,469m equity | $299.76 | +7.45% |
| P / NTM EPS | Mean 22.38x × $169,534m NTM earnings | $3,793,676m equity | $306.73 | +9.94% |
| P / Book | Median 6.70x × $652,626m common equity | $4,371,538m equity | $353.46 | +26.69% |
| P / Book | Mean 6.82x × $652,626m common equity | $4,453,614m equity | $360.09 | +29.07% |

The one base-case own-history point is **$299.76 per GOOGL share**, from the **21.87x five-year median P/NTM EPS**. The fully diluted bridge is explicit: $13.79 CIQ basic EPS × 12,294m issued shares = $169,534m implied NTM earnings; 21.87x × $169,534m = $3,707,469m equity; $3,707,469m ÷ 12,368m fully diluted shares = $299.76. The $299.76–$360.09 dispersion across the NTM P/E and P/B methods is an exhibit of method disagreement, not a probability range or a final fair-value range. P/B is higher because it does not directly charge the reduced cash conversion from the AI build; it should not receive equal weight merely because it produces a higher level. [CIQ Comps → Financial Data, subject row, 2026-11-03; CIQ Financials → Multiples, P/NTM EPS and P/BV Close rows; Valuation 01 Price & Capital Structure — GOOGL, §7; Earnings 01 Historical Financials — GOOGL, §2]

Reversion assumes the warranted multiple has not changed. That assumption is only partly supported: reported margins improved, but the business-model work classifies the company as exposed to fast AI-led change, notes that nine-month FY2026 capex of $132.0bn exceeded CFO of $127.1bn, and says returns on the additional infrastructure are unproven. The P/NTM median is therefore a conditional reference point, not a floor. [Q3 FY2026 Form 10-Q, Statements of Cash Flows and Item 2; Business Model Reality Check — GOOGL, §1]

## 5. Sector Cycle Reality Test

The broad growth-sector proxy does **not** show a material same-direction five-year multiple move on the available evidence: Nasdaq-100 trailing P/E was 38.00x in December 2021 and 35.09x in September 2026, a 7.7% decrease, below the roughly 25% trigger. This is an imperfect proxy for Alphabet's advertising-plus-cloud mix and is web-sourced, so it is indicative and unverified; it does not trigger a cycle-elevated or cycle-depressed flag. [Web: Siblis Research, *NASDAQ 100 P/E Ratio & Earnings*, year-end table, retrieved 2026-11-03 — indicative, unverified]

## 6. Own-History Read

GOOGL trades at **20.24x NTM P/E**, 7.5% below its five-year median; after converting the basic-share vendor EPS to the 12,368m fully diluted valuation share count, simple median reversion gives **$299.76**, 7.5% above the $278.99 pool-verified price. P/B suggests $353–$360, but that result is a secondary cross-check rather than a clean base case because it does not answer whether the AI-capacity build will earn an adequate return.

The biggest caveat is denominator and business-model change. LTM P/E is depressed by the disclosed Q2 investment-sale gain, while current cash conversion is pressured by capex; a return to the old median is not warranted unless future Cloud and Search returns validate the larger infrastructure base. The sector-proxy test did not show a material five-year valuation reset, but it is an indicative broad-index check rather than proof that Alphabet's own history is a stable anchor. [Earnings 01 Historical Financials — GOOGL, §§2–3; Q3 FY2026 Form 10-Q, Item 2; Web: Siblis Research, retrieved 2026-11-03 — indicative, unverified]
