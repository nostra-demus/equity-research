# Guidance & Consensus — NU

**Scope note.** NU (Nu Holdings Ltd., NYSE:NU, Class A ordinary shares, USD) is a US foreign private issuer reporting under IFRS with a 31-December fiscal year (`FY2025 Form 20-F, cover page, filed Apr-08-2026`). Every number below is in USD on an IFRS basis. The pool's prior in-house memo (`NU_Holdings_Deep_Dive_15_Page_Memo_30_Aug_2026.pdf`) is verdict-bearing; its verdict, target price and expected return are stripped per CLAUDE.md §24 and it is used as a source for nothing here. The Capital IQ consensus export carries a sell-side recommendation and a mean target price; both are analyst verdicts and are deliberately not carried forward.

**One correction to upstream triage, stated by name.** `00_earnings-data-triage.md` §5 records "No formal numeric guidance… the company issues no quantitative guidance in this pool." That is not correct as written, and the difference matters for this agent's whole job. The Q2'26 call does contain no *revenue or EPS* guidance, and the word "guidance" does appear zero times — but management gave **four explicit numeric forward statements** across the Q1'26 and Q2'26 calls, one of them framed literally as "for modeling purposes". They are set out in Section 2, and one of them (the tax rate) turns out to be the single largest gap versus the Street. Triage is right that there is no revenue/EPS guidance to test; it is wrong that there is nothing quantitative.

---

## 1. Consensus Data Metadata

| Field | Value |
|---|---|
| Source | **Capital IQ Estimates export** (pool workbook `NuHoldingsLtdNYSENUEstimatesReport.xls`, tabs Consensus / Trends / Revisions / Recent Changes / Surprise). Pool export — not web-sourced, not from memory |
| Data as of date | Latest broker revision dated **Aug-26-2026**; workbook header carries the FQ3'26 release date of Nov-12-2026 (`Capital IQ Estimates→Recent Changes, top row 2026-08-26`; `Capital IQ Estimates→Consensus, header`) |
| Fiscal year basis | Fiscal year ends **Dec-31-2026**, matching the company's own fiscal year (`Capital IQ Estimates→Consensus — "Current Fiscal Year End: Dec-31-2026"`; `FY2025 Form 20-F, year ended Dec-31-2025`) |
| Analyst count | Varies by line. FY2026 EPS (GAAP) **16/16**; FQ3'26 EPS (GAAP) **9/9**; FQ3'26 net income **7/7**; FQ3'26 revenue **4/8**; FQ3'26 EBIT **4/6**; FQ3'26 effective tax rate **2/2** (`Capital IQ Estimates→Consensus, "No. of Estimates" rows`) |
| Currency | **USD**, IFRS, consolidated (`Capital IQ Estimates→Consensus — "Acctg. Standard: IFRS"`, "Consolidation: Consolidated") |
| Calendarization issue? | **N** — vendor fiscal year matches the company's. A separate *reporting-basis* question (standalone quarter vs cumulative) is resolved in Section 1A |

**Staleness check.** The latest reported quarter is Q2 2026, released Aug-13-2026. The consensus revisions run to Aug-26-2026 — after the print. Consensus has absorbed the latest quarter, so the stale-consensus guard does **not** apply and the bar verdict below is not provisional.

**Cross-check to the deterministic facts sidecar.** `ciq_facts.json` reports `eps_revisions` = "EPS (GAAP) FY 2026: 8↑/0↓ last mo" and `revenue_revisions` = "Revenue FY 2026: 5↑/2↓ last mo", both `status: present`. My own read of the Revisions tab returns exactly those counts (Section 5). No gap to flag.

---

## 1A. Reporting-Basis Reconciliation (mandatory — CLAUDE.md §27)

NU is a foreign private issuer, so there is no 10-Q. It publishes an earnings release plus **unaudited interim condensed consolidated financial statements**. The question this section answers: is the vendor's "FQ3 2026" estimate the number the company will actually print?

| Field | Value |
|---|---|
| Next period the company will actually FILE | **Q3 2026** — the three-month period ended Sep-30-2026, filed together with the nine-month period ended Sep-30-2026 |
| Expected filing date + source for that date | **Nov-12-2026** (`Capital IQ Estimates→Consensus, header — "FQ3 2026 Earnings Release Date: Nov-12-2026"`; corroborated by `Capital IQ Events Calendar export, timeframe 2026`) |
| What that filing contains | **Both, side by side.** The last filing is titled "Unaudited Interim Condensed Consolidated Statements of Income — For the three and six-month periods ended June 30, 2026 and 2025", with four columns: three-month 2026, three-month 2025, six-month 2026, six-month 2025 (`Q2'26 interim condensed consolidated financial statements, statements of income, filed Aug-14-2026`). Q3'26 will follow the same shape with three-month and nine-month columns |
| Vendor estimate as pulled (period label + value) | **FQ3 2026 – Sep 2026, standalone quarter:** revenue mean **5,936.74m USD** (4/8 estimates); EPS (GAAP) mean **0.22164 USD** (9/9); net income (GAAP) mean **1,057.35m USD** (7/7) (`Capital IQ Estimates→Consensus, Fiscal Quarters block`) |
| Already-reported stub inside that period (period + actuals + citation) | For the **standalone quarter** bar: **none** — Q3 is a fresh three-month period. For the **nine-month cumulative** column in the same filing: H1 2026 actual revenue **10,481.175m**, diluted EPS **0.3936**, net income to parent **1,932.255m** (`Q2'26 interim condensed consolidated financial statements, statements of income, six-month period ended 06/30/2026`) |
| **Consensus restated onto the filing basis** — arithmetic | **Standalone Q3'26 bar = 5,936.74m revenue / 0.2216 diluted EPS** — no restatement needed (stub = 0). **Nine-month 2026 bar = 10,481.175 + 5,936.74 ≈ 16,417.9m revenue; 0.3936 + 0.22164 ≈ 0.6152 diluted EPS** |
| Basis-restated bar vs the same period a year earlier | Standalone: Q3'25 actual revenue 4,173.0m, EPS 0.1595 → the bar is **+42.3% revenue / +39.0% EPS YoY**. Nine-month: 9M'25 revenue ≈ 6,916.159 (filing, six months to 30-Jun-2025) + 4,173.0 (vendor Q3'25 actual) ≈ 11,089.2m; 9M'25 EPS ≈ 0.2439 + 0.1595 = 0.4034 → the bar is **+48.1% revenue / +52.5% EPS YoY** (mixed-source comparator: filing for H1, vendor for Q3 — labelled, not blended silently) |

**Proof the vendor is on the standalone-quarter basis (not cumulative).** The vendor's FQ2 2026 "Actual" cells read revenue **5,513.208m** and EPS (GAAP) **0.2162**. The filing's **three-month** column reads total revenue **US$5,513,208 thousand** and **diluted** EPS **US$0.2162**; its six-month column reads 10,481,175 and 0.3936 (`Q2'26 interim condensed consolidated financial statements, statements of income`). The vendor matches the three-month column exactly, and matches *diluted* rather than basic EPS (basic was 0.2183). So Capital IQ's quarterly fields are standalone-quarter, diluted-EPS figures, and the FQ3'26 estimate is directly comparable to the headline quarter NU will report.

**Sanity ratio.** Restated nine-month bar ÷ already-reported stub = 16,417.9 ÷ 10,481.2 = **1.57**. Three quarters over two quarters should be roughly 1.5, not roughly 1.0 — the conversion was performed. (For EPS the same check gives 0.6152 ÷ 0.3936 = 1.56.)

Every "bar" figure used below is labelled with its basis: **standalone Q3'26** unless explicitly marked nine-month or full-year.

---

## 2. Management Guidance

NU **does not provide formal revenue, earnings or capex guidance**, and publishes no guidance slide: the Q2'26 earnings presentation contains no outlook page beyond the standard forward-looking-statements legal text (`Q2'26 Earnings Presentation, Aug-13-2026`), and the Q2'26 call contains no revenue or EPS number for any future period. Management said so directly when asked for a growth number: *"I won't necessarily give you a specific number of growth, but we continue to see the conditions to continue growing and taking share"* (`Q2 2026 earnings-call transcript, Aug-13-2026, Q&A — David Vélez`).

What management **did** give is a small set of numeric *modelling* parameters, plus qualitative direction. All of it is call-derived; the calls are verbatim S&P Global transcripts, so no sell-side proxy is used and no proxy cap applies.

| Metric | Period | Guidance | Type | Source |
|---|---|---|---|---|
| Revenue | — | **None given** | — | `Q2 2026 transcript, Aug-13-2026` (no figure); `Q2'26 Earnings Presentation` (no outlook page) |
| EBITDA / EBIT | — | **None given.** NU reports on a bank template and discloses no EBITDA line at all (`ciq_facts.json` `ltm_ebitda_m` = unknown, "Income Statement sheet has no 'EBITDA' row") | — | as above |
| EPS | — | **None given** | — | as above |
| Capex | — | **None given** | — | as above |
| **Efficiency ratio** (operating costs ÷ net revenues — how many cents of cost it takes to earn a dollar of net revenue; lower is better) | **FY2026** | **"approximately 20%"**, reiterated three months later as *"we continue to expect the efficiency ratio for the full year to average about 20%"* | **Point** | `Q1 2026 earnings-call transcript, May-14-2026, prepared remarks`; reiterated `Q2 2026 earnings-call transcript, Aug-13-2026, prepared remarks` |
| **IFRS effective tax rate** (the share of pre-tax profit paid in tax) | **Remainder of 2026** | *"For modeling purposes, we expect our IFRS ETR for the remainder of 2026 to converge towards the **15% to 20% range**"* — **midpoint 17.5%**. Management separately flagged a "managerial ETR" converging toward 30–35%, which it called the more economically meaningful comparison | **Range** (midpoint 17.5%) | `Q1 2026 earnings-call transcript, May-14-2026, prepared remarks — Rob Livingston, CFO` |
| **US expansion cost drag** | **2026 and 2027, each** | *"the maximum OpEx headwind we expect from U.S. investment in each of 2026 and 2027 is **less than 100 basis points** on our consolidated efficiency ratio"* — and stated to sit inside the ~20% efficiency-ratio level | **Range cap** (upper bound) | `Q1 2026 earnings-call transcript, May-14-2026, prepared remarks` |
| **Risk-adjusted net interest margin** (interest margin after credit losses) | **"foreseeable future"** | *"we see it as being in the same region as where we are today. We think that it is sustainable."* Today = **12.42%** (`Q2'26 Earnings Presentation, risk-adjusted NIM walk`). The CFO expressly refused to call 12% a floor: *"I didn't say that it was a floor. I said we'd be in that ballpark."* | **Qualitative, anchored to a reported number** | `Q2 2026 earnings-call transcript, Aug-13-2026, Q&A` |

Two caveats on the guided items, both material:

1. **The tax guide was given once and has not been repeated.** It was stated on May-14-2026 and does not appear anywhere in the Aug-13-2026 call — the words "ETR", "effective tax" and "tax rate" appear zero times in the Q2'26 transcript. It was, however, validated by outcome: Q2'26 income taxes of **175,224** on income before income taxes of **1,236,313** is an actual IFRS rate of **14.2%** — below the low end of the guided 15–20% range (`Q2'26 interim condensed consolidated financial statements, statements of income, three-month period ended 06/30/2026`).
2. **Midpoints, as required.** Efficiency ratio is a point (~20%), so no midpoint arithmetic. The tax range midpoint is (15% + 20%) ÷ 2 = **17.5%**. The US-cost item is a one-sided cap ("less than 100bps"), so its midpoint is not meaningful and it is treated as an upper bound only.

**What the efficiency-ratio guide implies for the part of the year not yet reported** (CLAUDE.md §17 — do the arithmetic). Reported quarterly efficiency ratios: Q1'25 21.4%, Q2'25 21.3%, Q3'25 20.3%, Q4'25 19.9%, **Q1'26 17.6%, Q2'26 19.5%** (`Q2'26 Earnings Presentation, slide 22 "Net Revenues & Opex · Efficiency Ratio %"`, with opex US$648m/US$806m over net revenues US$3,672m/US$4,132m). On the ratio-of-sums basis the company itself defines, H1'26 = (648 + 806) ÷ (3,672 + 4,132) = **18.63%**. On a simple average of the two quarterly ratios it is 18.55%. For the full year to land at ~20% on either basis, **H2'26 has to run at roughly 21.0–21.5%** — a step up of about **150–195 basis points** from the 19.5% just printed. In plain terms: management's own guide says costs should rise faster than net revenues in the second half. Hold that thought for Section 3.

---

## 3. Guidance vs Consensus Table

Gap = Consensus minus Guidance (positive = Street above guidance). Guidance basis = midpoint where a range was given.

| Metric | Period | Management Guidance | Street Consensus | Gap | Gap Direction |
|---|---|---|---|---:|---|
| Revenue | Q3'26 / FY26 | **No guidance** | 5,936.74m (Q3'26 standalone); 22,907.99m (FY26) | n/a | Not comparable — no guidance issued |
| EBITDA / EBIT | Q3'26 / FY26 | **No guidance** (no EBITDA disclosed) | EBIT 1,471.20m (Q3'26, 4/6 est.); 5,404.43m (FY26) | n/a | Not comparable — no guidance issued |
| EPS | Q3'26 / FY26 | **No guidance** | 0.22164 (Q3'26 diluted); 0.8482 (FY26) | n/a | Not comparable — no guidance issued |
| **Efficiency ratio** | FY2026 | **~20%** (point) | **No consensus line** — Capital IQ carries no efficiency-ratio estimate for NU, and its components (opex; net interest income + fee income net of transactional cost and revenue-based taxes) are not separately estimated, so it cannot be rebuilt without assumptions | **Not computable** | Not comparable — no consensus estimate exists for the metric management actually guided |
| **IFRS effective tax rate** | **H2 2026** | **15–20%, midpoint 17.5%** | **≈30.2% implied** by the FY26 consensus pair (arithmetic below); the vendor's own explicit quarterly tax line reads **31.25%** for both FQ3'26 and FQ4'26 (2/2 estimates) | **+12.7pp** (30.2% − 17.5%) | **Street far ABOVE guidance** — i.e. the Street assumes NU pays roughly twice the tax rate management guided |

**The tax arithmetic, shown in full.** FY2026 consensus pre-tax profit (EBT, GAAP) = **5,384.98m**; FY2026 consensus net income (GAAP) = **4,160.53m** (`Capital IQ Estimates→Consensus, Fiscal Years block, FY2026`). H1'26 actuals from the filing: pre-tax **2,190.619m**, tax **258.099m** (an 11.78% rate), net income to parent **1,932.255m** (`Q2'26 interim condensed consolidated financial statements, six-month period ended 06/30/2026`). Therefore what consensus embeds for H2'26:

- H2 pre-tax = 5,384.98 − 2,190.62 = **3,194.36m**
- H2 net income = 4,160.53 − 1,932.26 = **2,228.27m**
- H2 tax = 3,194.36 − 2,228.27 = **966.09m** → **implied H2 IFRS effective tax rate = 966.09 ÷ 3,194.36 = 30.2%**

Against a guided 15–20%, an 11.8% rate actually delivered in H1'26, and a 14.2% rate in Q2'26 alone. The same gap shows in the single quarter: consensus FQ3'26 pre-tax 1,406.02m against consensus FQ3'26 net income 1,057.35m implies a **24.8%** rate (1 − 1,057.35 ÷ 1,406.02), and the vendor's explicit tax-rate line says **31.25%**.

**Why this is a like-for-like comparison, and how it could be wrong.** Management drew a distinction between its IFRS ETR (guided 15–20%) and a "managerial ETR" (30–35%), so a reader could reasonably ask whether the Street is simply modelling the managerial basis — in which case there is no gap at all. Three things say it is not: the vendor workbook is labelled "Acctg. Standard: IFRS" throughout; the vendor's own *actual* for FQ1'26 on that same tax line is **8.6843%**, which is the IFRS rate the company reported, not a managerial one; and the vendor's net income line is "Net Income (GAAP)", whose FQ1'26 and FQ2'26 actuals (872.056m, 1,060.199m) are the IFRS numbers in the filing. So the comparison is on the vendor's own stated basis. **This remains the main way this finding could be wrong** — if analysts are deliberately taxing NU at a managerial rate inside an IFRS-labelled field, or if they simply disbelieve that the corporate-structure change is durable, then the gap is a modelling convention rather than a mispriced bar. The tax line is also thin: 2 of 2 estimates.

**A second, smaller tension, named explicitly.** Consensus FQ3'26 EBIT of 1,471.20m on revenue of 5,936.74m is a **24.78%** operating margin, against **22.51%** actually delivered in Q2'26 (EBIT 1,240.976m ÷ revenue 5,513.208m) — the Street is asking for **+227 basis points** of margin expansion in one quarter. Management's own FY efficiency-ratio guide points the other way, implying H2 cost ratios of roughly 21.0–21.5% versus 19.5% in Q2'26. On this line the bar looks demanding, not soft. (Reconciliation note so the EBIT figure is not misread: Capital IQ's "EBIT" actual for FQ2'26 of 1,240.976m equals the filing's income before income taxes of 1,236.313m plus the 4.663m share of loss in associates — it is a pre-tax measure, not an operating-profit-before-interest measure, because NU's interest expense is a cost of revenue for a lender.)

---

## 4. Estimate Revision Momentum Table

Capital IQ publishes trend snapshots at 1 / 2 / 3 / 6 / 9 / 12 months ago, not at 30 / 60 / 90 days. The columns below map the vendor's 3-months-ago → "90 days", 2-months-ago → "60 days", 1-month-ago → "30 days". All figures `Capital IQ Estimates→Trends`, data as of Aug-2026. Revenue in USD millions; EPS (GAAP, diluted) in USD. The vendor rounds its EPS trend cells to two decimals, so small moves are invisible on the EPS rows — the precise current means are given in the note beneath.

| Estimate | 90 Days Ago | 60 Days Ago | 30 Days Ago | Current | Direction |
|---|---:|---:|---:|---:|---|
| Revenue — next quarter (FQ3'26) | 5,545.80 | 5,545.47 | 5,531.80 | **5,936.74** | **Rising** — +7.3% in one month |
| EPS — next quarter (FQ3'26) | 0.22 | 0.21 | 0.21 | **0.22** | **Flat to slightly rising** |
| Revenue — current FY (FY2026) | 21,937.49 | 22,347.88 | 22,319.45 | **22,907.99** | **Rising** — +2.6% in one month, +4.4% in three |
| EPS — current FY (FY2026) | 0.83 | 0.82 | 0.81 | **0.85** | **Rising** — +4.9% in one month |
| Revenue — next FY (FY2027) | 26,273.69 | 27,071.85 | 27,254.63 | **27,655.05** | **Rising** — +5.3% in three months |
| EPS — next FY (FY2027) | 1.10 | 1.08 | 1.07 | **1.11** | **Rising** |

Precise current means (`Capital IQ Estimates→Consensus`): FQ3'26 EPS **0.22164**; FY2026 EPS **0.8482**; FY2027 EPS **1.11006**; FQ3'26 revenue **5,936.7375m**; FY2026 revenue **22,907.99m**; FY2027 revenue **27,655.05m**.

The jump is concentrated in the month after the Aug-13-2026 print, which is what one would expect: the FQ3'26 revenue line moved 5,531.80 → 5,936.74 (+7.3%) and FY2026 EPS 0.81 → 0.85 (+4.9%) inside four weeks. This is a bar that has just been raised, not one that has been cut.

---

## 5. Revision Breadth

All from `Capital IQ Estimates→Revisions`, "Last Month" window, data through Aug-26-2026. "Net" = upward minus downward. NU discloses no EBITDA, so the EBITDA row is replaced by EBIT, which is what the vendor actually collects.

| Metric | Up Revisions | Down Revisions | Net Revision Breadth | Period |
|---|---:|---:|---:|---|
| Revenue FY2026 | 5 | 2 | **+3** (of 7 analysts) | Last month |
| EBIT FY2026 (EBITDA not disclosed) | 3 | 2 | **+1** (of 5) | Last month |
| EPS (GAAP) FY2026 | 8 | 0 | **+8** (of 14) | Last month |
| Net income (GAAP) FY2026 | 11 | 0 | **+11** (of 18) | Last month |
| Revenue FQ3'26 | 3 | 0 | **+3** (of 3) | Last month |
| EPS (GAAP) FQ3'26 | 4 | 0 | **+4** (of 7) | Last month |
| Net income (GAAP) FQ3'26 | 4 | 0 | **+4** (of 6) | Last month |
| Revenue FY2027 | 4 | 3 | **+1** (of 9) | Last month |
| EPS (GAAP) FY2027 | 7 | 0 | **+7** (of 14) | Last month |

Not a single downward EPS or net-income revision in the last month at either the FY2026, FY2027 or FQ3'26 level. Three months ago the picture was materially worse (FY2026 EPS 6↑/3↓; FY2026 net income 8↑/6↓), so the breadth turned decisively positive on the Q2'26 print. Two lines are moving the other way and are named rather than buried: **book value per share FY2026 was 3↑/4↓** and **the FY2026 effective tax rate was revised UP** (broker 31.4% → 32.2%, consensus 27.3% → 27.41%, `Capital IQ Estimates→Recent Changes, 2026-08-25 and 2026-08-26`). The Street is raising its earnings numbers while simultaneously assuming NU pays *more* tax — which widens, not narrows, the gap identified in Section 3.

---

## 6. Historical Beat / Miss Pattern

Actual vs the final pre-print consensus estimate, both from `Capital IQ Estimates→Surprise` (quarterly block). Revenue and net income in USD millions; EPS (GAAP, diluted) in USD. Percentages are my own arithmetic on the vendor's actual and estimate cells, not the vendor's rounded surprise column. Q1'26 and Q2'26 actuals are independently confirmed against the primary filings.

| Period | Revenue Beat/Miss | EPS Beat/Miss | Magnitude | Notes |
|---|---|---|---:|---|
| Q3'25 (announced Nov-13-2025) | Beat — 4,173.0 vs 4,038.96 | Beat — 0.1595 vs 0.15359 | Rev **+3.3%**, EPS **+3.8%**, NI **+4.4%** | Broad-based beat |
| Q4'25 (announced Feb-25-2026) | Beat — 4,685.87 vs 4,550.75 | **Miss** — 0.1815 vs 0.18442 | Rev **+3.0%**, EPS **−1.6%**, NI **−4.0%** | Revenue beat, profit missed — costs and provisions |
| Q1'26 (announced May-14-2026) | **Miss** — 4,967.97 vs 5,059.87 | **Miss** — 0.1776 vs 0.18736 | Rev **−1.8%**, EPS **−5.2%**, NI **−6.0%** | Both missed; confirmed against `Q1'26 interim condensed consolidated financial statements, filed May-14-2026` |
| Q2'26 (announced Aug-13-2026) | Beat — 5,513.21 vs 5,479.92 | **Beat** — 0.2162 vs 0.19127 | Rev **+0.6%**, EPS **+13.0%**, NI **+12.6%** | Confirmed against `Q2'26 interim condensed consolidated financial statements` (revenue 5,513,208; diluted EPS 0.2162; net income to parent 1,060,199) |

**What actually produced the Q2'26 beat — the arithmetic, with the residual named (§15).** It was almost entirely tax, not operations:

- Pre-tax: actual 1,236.313 vs final consensus 1,230.683 → **+5.63m, +0.5%**. Essentially on the estimate.
- Net income: actual 1,060.199 vs final consensus 941.273 → **+118.93m, +12.6%**.
- Counterfactual: take the consensus pre-tax estimate of 1,230.683 and tax it at the rate NU actually paid (14.17%) → 1,230.683 × 0.8583 = **1,056.30m**, which is 115.03m above the 941.27m consensus.
- **Explained by the tax rate: 115.03 ÷ 118.93 = 96.7% of the beat. Residual: +3.90m (3.3%)**, being the small pre-tax beat plus rounding. 115.03 + 3.90 = 118.93 ✓.

So of a 12.6% net-income beat, roughly 97% came from analysts modelling too high a tax rate. That is the same modelling gap that is still sitting in the FQ3'26 and FY2026 numbers.

**Base-rate honesty (§10).** Four observations — two EPS beats, two EPS misses — is not a measured frequency. Any statement about "how often NU beats" from this table is judgment informed by a four-observation sample, and is treated as such below.

---

## 7. Bar Assessment

**Bar is low.**

The one line where a management number and a Street number can actually be compared is tax, and the gap is wide and one-directional: consensus embeds a **30.2% IFRS effective tax rate for H2 2026** (derived above from FY26 consensus pre-tax of 5,384.98m and net income of 4,160.53m against filed H1 actuals), and the vendor's explicit quarterly line reads **31.25%**, against management's "for modeling purposes" guide of **15–20%** and an **11.8%** rate actually filed for H1'26 and **14.2%** for Q2'26 alone. Holding the Street's own pre-tax estimate constant and taxing it at the 17.5% guided midpoint instead of the embedded 30.2% adds **3,194.36 × (0.825 − 0.698) ≈ 407m** to H2 net income — FY2026 net income of ~4,568m against consensus 4,161m, about **+9.8%**, with no help at all from revenue, credit costs or expenses. At the 14.2% rate NU actually just delivered, the same arithmetic gives roughly **+12.3%**. This is not a hypothetical mechanism: it is exactly what produced the Q2'26 print, where 96.7% of a 12.6% net-income beat came from the tax line while pre-tax profit landed within 0.5% of the estimate.

**The evidence pointing the other way, adjudicated by name rather than averaged out.** Two things argue the bar is *not* low. First, estimates have just been raised hard: FQ3'26 revenue went 5,531.80 → 5,936.74m (+7.3%) in one month, FY2026 EPS 0.81 → 0.85 (+4.9%), and breadth was 8↑/0↓ on FY2026 EPS and 11↑/0↓ on FY2026 net income — a rising bar, not a cut one. Second, the FQ3'26 EBIT consensus of 1,471.20m on 5,936.74m of revenue implies a **24.78%** margin versus **22.51%** delivered in Q2'26, a **+227bp** step-up that runs directly against management's own guide that the FY26 efficiency ratio averages ~20% when H1 came in at 18.63% — which requires H2 cost ratios of roughly **21.0–21.5%**, about 150–195bp *worse* than Q2'26. Neither overturns the verdict, and here is why: both sit **above** the tax line. The raised revenue estimates and the demanding EBIT margin both affect pre-tax profit, and pre-tax is the line where NU has been landing close to consensus (+0.5% in Q2'26, −0.3% in Q1'26 on the revenue line). The 12.7-percentage-point tax gap sits *below* pre-tax, is roughly twice the size of the margin tension in profit terms, and has already converted into a beat once. The honest shape of the setup is therefore: **the operating bar for Q3'26 is fair-to-demanding, the tax bar is clearly too high, and the tax bar is the bigger number.**

**What would make this call wrong**, stated plainly: if analysts are deliberately taxing NU at its "managerial" 30–35% rate inside a field the vendor labels IFRS — a convention rather than a mistake — the gap disappears. The vendor's own FQ1'26 tax actual of 8.68% (the IFRS figure) argues against that, but it is 2 estimates on that line. The tax guide is also three months old, was not repeated on the Aug-13-2026 call, and depends on a corporate-structure arrangement that a tax-law change in Brazil or elsewhere could reverse; the CFO called it "a recurring structural feature", which is a management claim, not an audited one.

---

**Partial-data caps.** None applied. The consensus came from a pool Capital IQ export (not web, not memory), it post-dates the latest reported quarter, and full revision history is present — so neither the no-consensus cap (max 30), the staleness haircut, nor the no-revision-history cap (max 60) binds. The transcript role is filled by verbatim S&P Global transcripts, so no sell-side-proxy cap applies. The absence of formal revenue/EPS guidance is a disclosure fact about how NU communicates, not a missing document, and carries no cap.

**Section 3A (alt-data cross-check) is omitted.** The frozen pool contains no `external/` folder and no manifest row carrying `external: true`, so there is no licensed alt-data panel to cross-check against. Its absence is not a gap.
