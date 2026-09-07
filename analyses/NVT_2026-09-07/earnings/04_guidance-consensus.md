# Guidance & Consensus — NVT

**Evidence binding: frozen.** All reads resolved through generation `6db32848…1aecd1e6` (`manifest.json`, `corpus.txt`, `ciq_facts.json`, per-tab extracts). Live `data/NVT/` was not read; `data/NVT/` is a citation label only.

**Reporting basis for everything below:** US GAAP, USD, in millions except per-share. Fiscal year ends 31 December. "Adjusted EPS" is the company's own non-GAAP measure; Capital IQ maps it to its **EPS Normalized** line, and the vendor's own guidance row for that line carries the company's $5.00–$5.10 range, so the two are matched. GAAP EPS is shown separately and never mixed with it.

---

## 1. Consensus Data Metadata

| Field | Value |
|---|---|
| Source | **Capital IQ** — `nVentElectricplcNYSENVTEstimatesReport.xls`, tabs `Consensus` / `Guidance` / `Trends` / `Revisions` / `Recent Changes` / `Surprise` (pool export; **not** web-sourced, not from memory) |
| Data as of date | Workbook current as of **~12-Aug-2026**; latest broker revision in `Recent Changes` dated **7-Aug-2026** (Morningstar, Aguilar). Market summary price 170.70 / last close 171.16 |
| Fiscal year basis | Company fiscal year = calendar year, ends **Dec-31-2026** (`CIQ Estimates→Consensus` header: "Current Fiscal Year End: Dec-31-2026") |
| Analyst count | FQ3 2026: adj EPS **14/14**, revenue **14/14**, EBITDA **8/10**. FY2026: adj EPS **16/16**, revenue **16/17**, EBITDA **11/14**. Target price 15/15; recommendation Buy (1.24) from 15 Buy / 1 Outperform / 0 Hold / 1 Underperform / 1 No Opinion |
| Currency | **USD** (`CIQ Estimates→Consensus`, "US GAAP\|USD") |
| Calendarization issue? | **N** — NVT is a US SEC domestic filer reporting on a calendar fiscal year; the vendor's fiscal-quarter labels (FQ3 2026 – Sep 2026) map one-for-one onto the company's own reported quarters. See §1A |

**Not stale.** The latest broker revision (7-Aug-2026) postdates the Q2 FY26 print (call 31-Jul-2026), so the estimates have absorbed the latest reported quarter. The stale-consensus guard does **not** trigger and the bar verdict below is not provisional on that ground. A separate, real staleness exists and is flagged in §7: the export predates the **24-Aug-2026 Maverick Power** acquisition announcement.

---

## 1A. Reporting-Basis Reconciliation (CLAUDE.md §27 — done before any bar is quoted)

| Field | Value |
|---|---|
| Next period the company will actually FILE | **Q3 FY2026 — the standalone three months ended 30-Sep-2026**, presented alongside the cumulative nine months ended 30-Sep-2026 |
| Expected filing date + source for that date | Results release **30-Oct-2026** (`CIQ Estimates→Consensus`, header line: "FQ3 2026 Earnings Release Date: Oct-30-2026" — vendor's expected date, not a company-confirmed date); the Form 10-Q follows the release |
| What that filing contains | **Both, side by side.** The Q2 FY26 10-Q prints "Three Months Ended" and "Six Months Ended" columns together (`Q2 FY26 10-Q, condensed consolidated statements of operations` — net sales $1,471.3 three-month / $2,713.3 six-month). Q3 will print three-month and nine-month columns the same way. The headline beat/miss is judged on the **standalone quarter** |
| Vendor estimate as pulled (period label + value) | **FQ3 2026 – Sep 2026, standalone:** revenue **$1,427.27m**; adjusted (normalized) EPS **$1.3899**; GAAP EPS **$1.24636**; EBITDA **$329.29m** [`CIQ Estimates→Consensus`, Fiscal Quarters block, col FQ3 2026] |
| Already-reported stub inside that period (period + actuals + citation) | **None inside the standalone quarter** — a US 10-Q quarter contains no prior stub. For the cumulative nine-month column the stub is H1 FY26: net sales **$2,713.3m** [`Q2 FY26 10-Q, statements of operations, six months ended 30-Jun-2026`], adjusted EPS **$1.09 + $1.45 = $2.54** [`CIQ Estimates→Consensus` FQ1/FQ2 2026 EPS Normalized actuals; corroborated by `Q2 FY26 transcript, prepared remarks` — Q2 adjusted EPS $1.45] |
| **Consensus restated onto the filing basis** — arithmetic shown | **Standalone Q3 bar = $1,427.27m revenue / $1.3899 adjusted EPS — no restatement required.** The vendor's estimate is already standalone-quarter, which is exactly what the 10-Q's three-month column reports. For the cumulative nine-month column the bar is `2,713.3 + 1,427.27 = **$4,140.6m** revenue` and `2.54 + 1.3899 = **$3.93** adjusted EPS` |
| Basis-restated bar vs the same period a year earlier | **Q3 (standalone):** revenue bar $1,427.27m vs Q3 2025 actual $1,054.0m = **+35.4%**; adjusted EPS bar $1.3899 vs Q3 2025 actual $0.91 = **+52.7%** [`CIQ Estimates→Consensus`, FQ3 2025 actual column — vendor data; no Q3 FY25 10-Q exists in this pool]. **Nine months:** revenue bar $4,140.6m vs 9M 2025 actual $2,826.4m (809.3 + 963.1 + 1,054.0) = **+46.5%** [Q1/Q2 2025 from `Q1 FY26 10-Q` and `Q2 FY26 10-Q` comparative columns; Q3 2025 vendor] |

**Sanity check.** For the standalone bar the stub-ratio test does not apply (no stub sits inside a US quarterly period) — the check is instead that the vendor's period label and the filed period are the same shape, which they are. Applying the ratio test to the cumulative column as a cross-check: restated nine-month bar ÷ reported six-month stub = 4,140.6 / 2,713.3 = **1.53x**. For a nine-month period with two of three quarters already reported, roughly 1.5x is the expected shape; a ratio near 1.0 would have signalled an unconverted standalone estimate. No conversion error is present.

**Every "bar" figure quoted downstream in this file, and by `05_beat-miss-setup` and `99_earnings-synthesis`, is the standalone-quarter figure above, labelled as such.**

---

## 2. Management Guidance

All figures below were guided on the **Q2 FY2026 earnings call, 31-Jul-2026** unless stated. Capital IQ independently records the same guidance with guidance date `2026-07-31` [`CIQ Estimates→Guidance`, cols FQ3 2026 / FY 2026], which is a clean cross-check that the vendor and the call agree.

| Metric | Period | Guidance | Type | Source |
|---|---|---|---|---|
| Reported sales growth | FY2026 | **+37% to +39%** (midpoint +38%) | Range | `Q2 FY26 transcript, prepared remarks (CFO Corona)` |
| Organic sales growth | FY2026 | **+32% to +34%** (midpoint +33%) | Range | `Q2 FY26 transcript, prepared remarks` |
| Revenue (implied in dollars) | FY2026 | **$5,333.55m – $5,411.41m** (midpoint **$5,372.48m**) | Range, derived | `CIQ Estimates→Guidance`, FY 2026 revenue guidance row, guidance date 2026-07-31. Reconciles to the call: FY2025 revenue $3,893.1m × 1.37 = 5,333.5; × 1.39 = 5,411.4 [`CIQ Financials→Income Statement`, 12m Dec-31-2025] |
| Adjusted EPS | FY2026 | **$5.00 – $5.10** (midpoint **$5.05**); +50% at the midpoint vs FY2025 | Range | `Q2 FY26 transcript, prepared remarks`; `CIQ Estimates→Guidance`, EPS Normalized FY 2026 |
| GAAP EPS | FY2026 | **$4.29 – $4.39** (midpoint $4.34) | Range | `CIQ Estimates→Guidance`, EPS (GAAP) FY 2026, guidance date 2026-07-31 |
| Reported **and** organic sales growth | Q3 FY2026 | **+32% to +35%** (midpoint +33.5%) | Range | `Q2 FY26 transcript, prepared remarks` |
| Revenue (implied in dollars) | Q3 FY2026 | **$1,391.28m – $1,422.90m** (midpoint **$1,407.09m**) | Range, derived | `CIQ Estimates→Guidance`, FQ3 2026 revenue row. Reconciles to the call: Q3 2025 revenue $1,054.0m × 1.32 = 1,391.3; × 1.35 = 1,422.9 |
| Adjusted EPS | Q3 FY2026 | **$1.35 – $1.38** (midpoint **$1.365**); +50% at the midpoint vs Q3 2025 | Range | `Q2 FY26 transcript, prepared remarks`; `CIQ Estimates→Guidance`, EPS Normalized FQ3 2026 |
| GAAP EPS | Q3 FY2026 | **$1.18 – $1.21** (midpoint $1.195) | Range | `CIQ Estimates→Guidance`, EPS (GAAP) FQ3 2026 |
| Capex | FY2026 | **~$130m**, up ~40% year on year | Point | `Q2 FY26 transcript, prepared remarks`; `CIQ Estimates→Guidance`, Capital Expenditure FY 2026 = −130 |
| Free-cash-flow conversion (FCF ÷ adjusted net income, company-defined) | FY2026 | **90% – 95%** (midpoint 92.5%) | Range, qualitative basis | `Q2 FY26 transcript, prepared remarks` — "we still expect conversion of 90% to 95%" |
| Tariff cost impact | FY2026 | **~$100m**, raised from ~$80m previously; expected to be offset by price, supply-chain productivity and mitigating actions | Point | `Q2 FY26 transcript, prepared remarks` |
| Interest expense | FY2026 | **~−$65m** (guided 1-May-2026, not re-guided 31-Jul) | Point | `CIQ Estimates→Guidance`, Interest Expense FY 2026, guidance date 2026-05-01 |
| Depreciation & amortization | FY2026 | **~$230m** (guided 1-May-2026) | Point | `CIQ Estimates→Guidance`, D&A FY 2026, guidance date 2026-05-01 |
| Second-half margin shape | H2 FY2026 | **"mid-20s incrementals in the second half"** — i.e. roughly 25 cents of incremental profit per incremental dollar of sales, embedded in the guide | Qualitative | `Q2 FY26 transcript, Q&A (CFO Corona)` |

Range midpoints are calculated above and are what the gap table in §3 uses.

**Guidance path this year — two raises, both large.** FY2026 adjusted EPS was originally guided **$4.00–$4.15** (Feb-2026), raised to **$4.45–$4.55** on 1-May-2026 [`Q1 FY26 transcript, prepared remarks`], then to **$5.00–$5.10** on 31-Jul-2026 [`Q2 FY26 transcript, prepared remarks`]. Organic sales growth went **+10–13% → +21–23% → +32–34%** over the same two calls. The FY2026 adjusted-EPS midpoint has been lifted **+25.5%** in five months (4.075 → 5.05).

**No guidance is given for:** EBITDA, segment-level revenue or margin, or Q4 FY2026 standalone. Q4 must be inferred from the FY guide less the Q3 guide (done in §3).

---

## 3. Guidance vs Consensus Table

Gap = Consensus − Guidance midpoint. Positive = the Street sits above what management guided.

### Q3 FY2026 (the next standalone quarter to be filed — the operative bar)

| Metric | Period | Management Guidance (midpoint) | Street Consensus | Gap | Gap Direction |
|---|---|---|---|---:|---|
| Revenue | Q3 FY26 | $1,391.28–1,422.90m (mid **$1,407.09m**) | **$1,427.27m** (14 est.) | **+$20.18m / +1.43%** | Consensus above guidance midpoint; **+0.31% above the guidance HIGH end** |
| Adjusted EPS | Q3 FY26 | $1.35–1.38 (mid **$1.365**) | **$1.3899** (14 est.) | **+$0.0249 / +1.82%** | Consensus above midpoint; **+0.72% above the HIGH end** |
| GAAP EPS | Q3 FY26 | $1.18–1.21 (mid **$1.195**) | **$1.24636** (6 est.) | **+$0.0514 / +4.30%** | Consensus above midpoint and above the high end |
| EBITDA | Q3 FY26 | **Not guided** | $329.29m (8 of 10 est.) | n/a | No guidance to compare |

### FY2026

| Metric | Period | Management Guidance (midpoint) | Street Consensus | Gap | Gap Direction |
|---|---|---|---|---:|---|
| Revenue | FY26 | $5,333.55–5,411.41m (mid **$5,372.48m**) | **$5,435.31m** (16 of 17 est.) | **+$62.83m / +1.17%** | Consensus above midpoint; **+0.44% above the HIGH end** |
| Adjusted EPS | FY26 | $5.00–5.10 (mid **$5.05**) | **$5.11301** (16 est.) | **+$0.063 / +1.25%** | Consensus above midpoint; **+0.26% above the HIGH end** |
| GAAP EPS | FY26 | $4.29–4.39 (mid **$4.34**) | **$4.47538** (8 of 9 est.) | **+$0.135 / +3.12%** | Consensus above midpoint and above the high end |
| EBITDA | FY26 | **Not guided** | $1,225.02m (11 of 14 est.) | n/a | No guidance to compare |
| Capex | FY26 | **−$130m** | **−$131.12m** (9 of 10 est.) | −$1.12m / 0.9% more spend | Street assumes marginally more capex than guided |

Consensus source for all rows: `CIQ Estimates→Consensus` (Fiscal Quarters and Fiscal Years blocks); guidance source per §2.

**Where the FY gap actually sits — the implied Q4.** Do the arithmetic rather than leave the FY gap as a blended number:

- H1 FY26 actual revenue = **$2,713.3m** [`Q2 FY26 10-Q, six months ended 30-Jun-2026`]
- FY26 guidance midpoint revenue = $5,372.48m → implied H2 = 5,372.48 − 2,713.3 = **$2,659.18m**
- Q3 guidance midpoint = $1,407.09m → **guidance-implied Q4 revenue = 2,659.18 − 1,407.09 = $1,252.09m**
- Street Q4 FY26 consensus revenue = **$1,318.67m** (14 est.)
- **Gap at the Q4 level = +$66.58m, or +5.32%** above what the company's own FY and Q3 guidance imply.

So the Street's total-year gap of +1.17% is not spread evenly: roughly **1.4% of stretch sits in Q3 and 5.3% in Q4**. The Q4 number is where consensus has run furthest ahead of the guide. Note the two-sided reading: the guidance-implied Q4 is a *sequential decline* from the Q3 guide (1,407.1 → 1,252.1, −11.0%), a shape an analyst pushed back on directly on the call, and management defended it as prudence against a tougher comparison rather than as a demand slowdown — "we guided 32% to 35% in the third quarter … the 2-year stack in the third quarter is 50% growth" [`Q2 FY26 transcript, Q&A (CFO Corona)`]. Whether the implied Q4 is conservatism or a real step-down is the single unresolved question in this setup, and it belongs to `05_beat-miss-setup`.

**One internal inconsistency in the vendor data, stated rather than smoothed:** the FY2026 revenue consensus of $5,435.31m does not equal the sum of the four quarterly consensus figures (1,242.0 actual + 1,471.3 actual + 1,427.27 + 1,318.67 = **$5,459.24m**, a $23.9m / 0.44% difference). The panels differ — 16 of 17 contributors on the FY line versus 14 on each quarter — so the two are not the same set of analysts. Neither number is wrong; they are not interchangeable, and the Q4 arithmetic above uses the FY figure consistently on both sides.

---

## 4. Estimate Revision Momentum Table

Source: `CIQ Estimates→Trends` (all rows), workbook current ~12-Aug-2026. The vendor's buckets are "3 months ago / 2 months ago / 1 month ago / Current", which map onto the 90/60/30-day columns below; the mapping is stated so the reader is not told these are exact day counts.

| Estimate | 90 Days Ago (3mo) | 60 Days Ago (2mo) | 30 Days Ago (1mo) | Current | Direction |
|---|---:|---:|---:|---:|---|
| Revenue, next Q (FQ3 2026) | 1,264.06 | 1,264.06 | 1,265.86 | **1,427.27** | **Rising** (+12.9% over 90 days; +12.8% in the last month alone) |
| Adjusted EPS, next Q (FQ3 2026) | 1.18 | 1.18 | 1.19 | **1.39** | **Rising** (+17.8% over 90 days) |
| Revenue, FY2026 | 4,994.99 | 5,000.73 | 5,013.83 | **5,435.31** | **Rising** (+8.8%) |
| Adjusted EPS, FY2026 | 4.58 | 4.59 | 4.61 | **5.11** | **Rising** (+11.6%) |
| EBITDA, FY2026 | 1,097.84 | 1,097.84 | 1,102.57 | **1,225.02** | **Rising** (+11.6%) |
| Revenue, FY2027 | 5,655.32 | 5,692.66 | 5,769.18 | **6,368.58** | **Rising** (+12.6%) |
| Adjusted EPS, FY2027 | 5.57 | 5.62 | 5.74 | **6.43** | **Rising** (+15.5%) |
| GAAP EPS, FY2026 | 3.77 | 3.77 | 3.78 | **4.48** | **Rising** (+18.8%) |

**Read the shape, not just the direction.** Estimates were close to flat from 90 days to 30 days ago (FY2026 adjusted EPS moved 4.58 → 4.61, +0.7% in two months) and then jumped in the final month (4.61 → 5.11, +10.8%). Essentially the whole revision is the Street catching up to the 31-Jul-2026 guidance raise, not a series of independent upgrades ahead of it. The longer history in the same tab shows the trend is not new: FY2026 adjusted EPS was 3.39 eighteen months ago and 4.14 six months ago, so the number has risen **+50.7%** in eighteen months.

---

## 5. Revision Breadth

Source: `CIQ Estimates→Revisions`. Net breadth = upward − downward. This reconciles to the deterministic sidecar, which records `EPS (GAAP) FY 2026: 6↑/0↓ last mo` and `Revenue FY 2026: 14↑/0↓ last mo` [`ciq_facts.json`, `eps_revisions` / `revenue_revisions`] — no gap between the sidecar's read and mine.

| Metric | Up Revisions | Down Revisions | Net Revision Breadth | Period |
|---|---:|---:|---:|---|
| Revenue FY2026 | 14 | 0 | **+14** (of 15 analysts) | Last month |
| EBITDA FY2026 | 10 | 0 | **+10** (of 10) | Last month |
| Adjusted EPS FY2026 | 14 | 0 | **+14** (of 15) | Last month |
| GAAP EPS FY2026 | 6 | 0 | **+6** (of 7) | Last month |
| Revenue FQ3 2026 | 12 | 0 | **+12** (of 12) | Last month |
| EBITDA FQ3 2026 | 6 | 0 | **+6** (of 6) | Last month |
| Adjusted EPS FQ3 2026 | 12 | 0 | **+12** (of 12) | Last month |
| Revenue FY2026 | 13 | 0 | **+13** (of 14) | Last 3 months |
| Adjusted EPS FY2026 | 13 | 0 | **+13** (of 14) | Last 3 months |
| EBITDA FY2026 | 10 | 0 | **+10** (of 10) | Last 3 months |
| Revenue FY2027 | 14 | 0 | **+14** (of 16) | Last month |
| Adjusted EPS FY2027 | 14 | 0 | **+14** (of 15) | Last month |

**Zero downward revisions on revenue, EBITDA or adjusted EPS for FY2026, FY2027 or FQ3 2026 across the last three months.** The only downgrades anywhere in the tab are on dividend per share (2 down on FY2026), on interest expense (a cost line, where 3 of 8 moved the expense higher last month), and one analyst cutting FQ1 2027. That is as one-sided as revision breadth gets, and it is a warning as much as a comfort: there is no remaining pool of bears to convert.

---

## 6. Historical Beat / Miss Pattern

Surprise percentages are the vendor's own, computed against its pre-print consensus [`CIQ Estimates→Surprise`, Fiscal Quarters block]. Positive = beat.

| Period | Revenue Beat/Miss | Adjusted EPS Beat/Miss | Magnitude (EBITDA) | Notes |
|---|---|---|---:|---|
| Q3 2025 (FQ3'25) | Beat **+4.81%** | Beat **+3.41%** | +2.63% | Modest across the board |
| Q4 2025 (FQ4'25) | Beat **+6.17%** | **In line, 0.00%** | −3.95% | EPS exactly met; EBITDA missed |
| Q1 2026 (FQ1'26) | Beat **+12.00%** | Beat **+15.96%** | +14.56% | Step-change; data-centre ramp |
| Q2 2026 (FQ2'26) | Beat **+16.90%** | Beat **+25.00%** | +21.27% | Largest beat in the eight-year quarterly history in this tab |

Longer window, adjusted EPS surprise, eight quarters: FQ3'24 **−22.2%** (the one clear miss), FQ4'24 0.0%, FQ1'25 +1.5%, FQ2'25 +8.9%, FQ3'25 +3.4%, FQ4'25 0.0%, FQ1'26 +16.0%, FQ2'26 +25.0%. **Five beats, two in-line, one miss.** Annual adjusted-EPS surprise has been positive in each of the last four years (+0.5% FY2022, +1.0% FY2023, −0.4% FY2024, +0.6% FY2025) [`CIQ Estimates→Surprise`, annual block] — small at the full-year level because guidance converges by Q4.

**The more useful record: actual versus the company's OWN guidance.**

| Quarter | Adjusted EPS guided | Actual | vs guidance HIGH end |
|---|---|---:|---:|
| Q1 FY26 | $0.90 – $0.93 (given 6-Feb-2026) | **$1.09** | **+17.2%** |
| Q2 FY26 | $1.12 – $1.15 (given 1-May-2026) | **$1.45** | **+26.1%** |

Guidance ranges from `CIQ Estimates→Consensus`, FQ1/FQ2 2026 EPS Normalized "Guidance Low / Guidance High" rows; Q2 actual corroborated verbatim at `Q2 FY26 transcript, prepared remarks` ("Adjusted EPS grew 69% year-over-year to $1.45"). The same pattern shows in the vendor's guidance-versus-actual net-income rows: Q1 FY26 guided $150m, actual $179.2m (+19.5%); Q2 FY26 guided $187m, actual $237.2m (+26.8%) [`CIQ Estimates→Guidance`, Net Income (Excl. Excep.)].

**And the position of consensus relative to guidance before each of those beats — the base rate that matters here:**

| Quarter | Guidance high end | Pre-print consensus | Consensus vs guidance high | Realised adjusted-EPS surprise |
|---|---:|---:|---:|---:|
| Q1 FY26 | $0.93 | $0.94199 | **+1.29%** | **+16.0%** |
| Q2 FY26 | $1.15 | $1.16378 | **+1.20%** | **+25.0%** |
| **Q3 FY26 (current)** | **$1.38** | **$1.3899** | **+0.72%** | *pending* |

Consensus sitting just above the top of the guided range is NVT's normal state, not a new stretch — and on the last two occasions it did not prevent a beat of 16% and 25%. On this measure the current setup is if anything marginally *less* demanding than the two quarters that produced those beats. Base-rate caveat per CLAUDE.md §10: this is a **two-observation** comparison inside an eight-quarter surprise history. It is judgment informed by a small sample, not a measured frequency, and both observations sit inside the same data-centre demand upswing — it would not survive a change in that cycle.

---

## 7. Bar Assessment

**Bar is fair.**

Consensus is not below guidance and estimates have not been cut, so the setup is not "low": the Street sits **above the top end** of the guided range on both the Q3 and FY2026 revenue and adjusted-EPS lines (+0.31% / +0.72% for Q3; +0.44% / +0.26% for FY26), and estimates have been marked up hard — FQ3 adjusted EPS +17.8% and FY2026 revenue +8.8% in ninety days, with **zero downward revisions** on revenue, EBITDA or adjusted EPS across FY2026, FY2027 and FQ3 2026 over three months. But the gaps are too small to call the bar high: +1.8% above the Q3 adjusted-EPS midpoint is a fraction of the +16% and +25% by which the company beat consensus in the last two quarters, and consensus has sat 1.2–1.3% above the guidance high end before each of those beats, so this positioning has a two-quarter record of being cleared rather than missed. The one place the Street has genuinely run ahead is the **implied fourth quarter**: consensus Q4 revenue of $1,318.67m is **+5.32%** above the $1,252.09m the company's own FY and Q3 guidance imply — roughly four times the stretch embedded in the Q3 number, and that is where the year's miss risk concentrates.

Two things sit outside the numbers above and both push the same way. First, the export's revision cut-off is 7-Aug-2026, so **no analyst estimate in this pool includes the Maverick Power acquisition** announced 24-Aug-2026 — $1.75bn purchase price, roughly **$700m of estimated 2026 revenue**, expected to close in Q4 2026 and, in the company's own words, "accretive to adjusted earnings per share in the first year following completion" [`nVent press release, 24-Aug-2026`]. That is company language about a deal that has not closed, not an audited number, and the closing date is subject to regulatory approval — but a business of that size arriving inside the guided Q4 is a material item the FY2026 bar does not contain in either direction. Second, management said plainly it is holding back: "it's important that we're prudent in our guidance, and we'll continue to be that way to give ourselves the flexibility" [`Q2 FY26 transcript, Q&A (CFO Corona)`], against a Q3 comparison it flagged as tough (a two-year stacked growth rate of 50%). Set against those, the honest counterweight is that the entire analyst panel is now positioned one way — 15 Buy of 18 opinions, no down-revisions in three months — so a Q3 print that merely lands inside the guided range would still be a disappointment relative to how the stock is positioned, and there is no bearish cohort left to convert.

**What would move this verdict.** A Q3 print above roughly $1.45 adjusted EPS (a beat of the guidance high end on the scale of the last two quarters) confirms the bar was beatable and shifts the read toward Low for Q4. A Q3 print inside the guided range — anywhere below $1.3899 — is a miss against consensus even though it would meet management's own guide, and would move the read to High for the balance of the year. Confirmation of the Q4 revenue path, either by a Maverick close inside Q4 or by a fourth guidance raise on 30-Oct-2026, resolves the +5.32% Q4 gap that is doing most of the work in this assessment.

---

**Partial-data status: none applied.** Consensus, guidance, revision-history, breadth and surprise data all came from the Capital IQ pool export (fix F19 satisfied — nothing here is web-sourced or from memory), and two verbatim transcripts (1-May-2026, 31-Jul-2026) carry the guidance commentary. No consensus-setup cap, no no-revision-history cap and no staleness haircut is triggered by this file. Section 3A is omitted because the pool contains no `external/` alt-data panel — its absence is not a gap.
