# Guidance & Consensus — TTWO

**Evidence binding.** Frozen supervisor-verified read mode. Every manifest / corpus / CIQ-facts / extract read resolved inside the single bound generation `.extract-generations/0af638492ecb0521db2676c79d75e6940c7227bb9f192567527b8a57eb43203d/`. The live logical path `data/TTWO/` was not read; it is a citation label only. Reporting standard **US GAAP**, currency **USD, millions**, fiscal year ends **31 March** (FY2027 = year ending 2027-03-31).

**Basis warning carried forward from triage `00` (read this before any number below).** Take-Two reports two different top-line numbers and the vendor consensus tracks the *operational* one:

- **Net Bookings** — the company's own operational metric ("the net amount of products and services sold digitally or sold-in physically during the period … includes licensing fees, merchandise, in-game advertising, and publisher incentives") [`Q2 FY27 10-Q, MD&A — Net Bookings`].
- **GAAP total net revenue** — the statutory line.
- Q2 FY27: Net Bookings **$1,601.3m** vs GAAP net revenue **$1,497.0m** — a $104.3m difference equal to the change in deferred net revenue [`TTWO 2Q27 Earnings Release, 2026-11-09, p.1–2`; `Q2 FY27 10-Q, MD&A`].
- The Capital IQ consensus field labelled "Revenue" is on the **Net Bookings** basis, proven two ways: its FQ2 2027 actual is 1,601.30, not 1,497.0, and its FY2027 "Guidance Low/High" of 8,000 / 8,200 matches the Net Bookings range exactly, not the GAAP range of 7,980 / 8,180 [`Capital IQ Estimates export, Consensus tab, Fiscal Years + Fiscal Quarters sections, data as of 2026-11-19`; `TTWO 2Q27 Earnings Release, "Outlook for Fiscal Year 2027"`].

Every bar below is labelled with its basis. No figure mixes the two (§15).

**Definitional bridge — verified, not assumed.** Two vendor fields needed proving before they could be compared to guidance, because the company guides a GAAP column and a management-basis column in the same table:

- `Capital IQ "EPS Normalized" = the company's management-reporting diluted EPS at an 18% management tax rate.` Test on Q1 FY27: pre-tax loss (49.3) − 132.0 (deferred) + 86.0 (stock comp) + 168.4 (amortisation of acquired intangibles) + 4.6 (business acquisition) + 3.2 (other) = 80.9; × 0.82 = 66.3; ÷ 187.8m shares = **$0.353**. Vendor FQ1 2027 actual = **0.3532** [`TTWO 1Q27 Earnings Release, 2026-08-07, p.2`; `Capital IQ Estimates export, Surprise tab, FQ1 2027`].
- `Capital IQ "EBITDA" = the company's management-basis non-GAAP EBITDA.` Test on Q1 FY27: 167.0 − 132.0 + 86.0 + 2.9 + 3.2 = **127.1**. Vendor FQ1 2027 actual = **127.1** [same sources]. Repeat on Q2 FY27: 92.2 + 101.9 + 90.0 + 2.4 − 9.4 = **277.1**; vendor actual = **277.1** [`TTWO 2Q27 Earnings Release, p.2`; `Capital IQ Estimates export, Surprise tab, FQ2 2027`].

Both bridges reconcile to the cent on two consecutive quarters, so the consensus-vs-guidance comparisons in Section 3 are like-for-like. Where a guidance figure below is *derived* through these bridges rather than printed by the company, it is marked **(derived — arithmetic shown)**.

---

## 1. Consensus Data Metadata

| Field | Value |
|---|---|
| Source | **Capital IQ** — `Take-TwoInteractiveSoftware,IncNasdaqGSTTWOEstimatesReport.xls`, 7 tabs (Consensus, Recent Changes, Guidance, Surprise, Trends, Revisions, Multiples). Pool export, not web, not memory |
| Data as of date | **2026-11-19** (latest revision event timestamped 1:08 AM on the export date; prior dated events 2026-11-18, 2026-11-13, 2026-11-11) [`Capital IQ Estimates export, Recent Changes tab`]. Consensus was refreshed **after** the 2026-11-09 Q2 FY27 print — the stale-consensus guard does **not** trigger |
| Fiscal year basis | Company fiscal year, FYE **31 March**. FY2027 = year ending 2027-03-31; FQ3 2027 = three months ending 2026-12-31. Header: "Current Fiscal Year End: Mar-31-2027 \| FQ3 2027 Earnings Release Date: Feb-09-2027" |
| Analyst count | 29 analysts cover the name (29/29 on target price; recommendation Buy 1.21 — 25 Buy / 3 Outperform / 0 Hold / 1 Underperform / 0 Sell). Per-metric contributing counts: FY2027 revenue 20/29, FY2027 EPS Normalized 24/28, FY2027 EPS (GAAP) 14/18, FY2027 EBITDA 15/22; FQ3 2027 revenue 17/22, EPS Normalized 21/23, EPS (GAAP) 9/11, EBITDA 12/14 |
| Currency | **USD**, millions (EPS in USD/share). "Currency: Reported Currency \| Conversion: Today's Spot Rate"; `ciq_facts.json` → `currency: USD` |
| Calendarization issue? | **N for the period mapping, Y for the metric definition.** All figures below are taken from the vendor's *Fiscal Years* and *Fiscal Quarters* sections, which match the company's own 31-March fiscal calendar — no calendar-year splicing. The real mismatch is definitional, not calendrical: the vendor's "Revenue" field is **Net Bookings**, and its "EPS Normalized" / "EBITDA" fields are the company's **management basis**, not GAAP. All three are bridged and labelled above |

Note on the vendor's "Recommendation" and "Target Price" fields: not ingested, not carried forward. The engine forms its own verdict and does not use sell-side ratings or price targets as evidence (§24). They are recorded here only to show how many analysts are in the panel.

---

## 1A. Reporting-Basis Reconciliation (mandatory — CLAUDE.md §27; done BEFORE any bar is quoted)

| Field | Value |
|---|---|
| Next period the company will actually FILE | **Q3 FY2027 — the standalone three months ending 2026-12-31** (Form 10-Q), with the nine months ended 2026-12-31 shown alongside |
| Expected filing date + source for that date | Earnings release **2027-02-09**, from the vendor header line "FQ3 2027 Earnings Release Date: Feb-09-2027" [`Capital IQ Estimates export, Consensus tab header, data as of 2026-11-19`]. The 10-Q follows on or about that date; the company's last two 10-Qs were filed alongside their releases [`Q1 FY27 10-Q, cover page`; `Q2 FY27 10-Q, cover page`] |
| What that filing contains | **Standalone period** (US 10-Q three-month column), **with a cumulative nine-month column beside it**. Proven on the current filing: "For the quarterly period ended September 30, 2026", presenting "Three Months Ended September 30," and "Six Months Ended September 30," side by side [`Q2 FY27 10-Q, cover page and MD&A, Results of Operations`] |
| Vendor estimate as pulled (period label + value) | **FQ3 2027 — Dec 2026, standalone quarter**: Revenue (Net Bookings basis) mean **3,573.61** / median 3,500.90 / high 4,087 / low 3,403 (17 of 22); EPS Normalized (management basis) mean **4.21322** / median 3.99 (21 of 23); EPS (GAAP) mean **2.02115** / median 1.77 (9 of 11); EBITDA (management basis) mean **965.28** / median 977.95 (12 of 14) [`Capital IQ Estimates export, Consensus tab, Fiscal Quarters section`] |
| Already-reported stub inside that period (period + actuals + citation) | **None — the vendor's FQ3 label and the filing's reporting period are the same standalone three months, so there is no stub to add back.** For the FY2027 *annual* bar there IS a stub: H1 FY27 (six months ended 2026-09-30) Net Bookings **$2,987.2m** (down 11.7% from $3,383.6m), GAAP net revenue **$3,030.9m**, GAAP net loss **$(88.1)m**, GAAP diluted EPS **$(0.47)** = Q1 $(0.18) + Q2 $(0.29) [`Q2 FY27 10-Q, MD&A — Net Bookings` and `Results of Operations`; `TTWO 1Q27 Earnings Release, p.2`; `TTWO 2Q27 Earnings Release, p.1`] |
| **Consensus restated onto the filing basis** — show the arithmetic | **Q3 FY2027 (standalone quarter): no restatement required.** 3,573.61 Net-Bookings-basis = 3,573.61; 4.21 management-basis EPS = 4.21; 2.02 GAAP EPS = 2.02. The vendor period label and the filing period coincide, which was verified, not assumed. **Cross-basis conversion (inference, not from filings):** the company guides Q3 Net Bookings $3,350–3,500 and Q3 GAAP net revenue $3,270–3,420 — an $80m wedge at both ends, equal to the guided "change in deferred net revenue and related cost of revenue" of $80m. Applying that same wedge, a Net-Bookings-basis consensus of 3,573.6 implies roughly **3,494 on the GAAP net-revenue basis the 10-Q will print**, if deferred revenue moves as guided. **FY2027 (annual): bar = H1 actual + implied H2.** Net Bookings: 2,987.2 (reported) + 5,567.5 (implied by the 8,554.7 annual consensus) = **8,554.7**. GAAP diluted EPS: $(0.47) (reported) + $2.38 (implied H2) = **$1.91** |
| Basis-restated bar vs the same period a year earlier | **Q3 FY2027 Net Bookings:** restated bar 3,573.6 vs Q3 FY26 actual **1,757.1** = **+103.4% YoY**; management guidance of 3,350–3,500 is +90.6% to +99.2% YoY [`Capital IQ Estimates export, Surprise tab, FQ3 2026 actual`; corroborated on the call — "compared to $1.76 billion in the prior year", `Q2 2027 Earnings Call transcript, 2026-11-09, prepared remarks (Goldstein)`]. **Q3 FY2027 management-basis EPS:** 4.21 vs 1.2271 a year earlier = +243%. **FY2027 Net Bookings:** restated bar 8,554.7 vs FY2026 actual **$6,721.0m** = **+27.3% YoY**; guidance 8,000–8,200 is +19.0% to +22.0% YoY [`FY26 10-K, Item 7 MD&A — Net Bookings` ("Net Bookings $6,721.0 … 5,648.0 … 19.0%")]. **FY2027 GAAP diluted EPS:** restated bar $1.91 vs FY2026 actual **$(1.62)** — a swing from loss to profit |

**Sanity check (restated bar ÷ already-reported stub).** Not applicable in the template's half-year form, because the next filing is a standalone quarter with no stub inside it — the exact condition the check screens for (a vendor standalone estimate carried into a cumulative print) does not exist for a US 10-Q filer. Run at the annual level instead: FY2027 restated bar 8,554.7 ÷ H1 stub 2,987.2 = **2.86**. A full year over a half-year stub should exceed 2 (here skewed well above 2 because the GTA VI launch sits in H2), and it is nowhere near 1 — so the vendor's annual figure is a genuine full-year number, not an unconverted stub. The period labels resolve cleanly; the "basis unresolved" path is not taken and no consensus-setup cap arises from basis.

**Every "bar" figure in Sections 3, 6 and 7 is the restated figure above, labelled with its basis.**

---

## 2. Management Guidance

Issued **2026-11-09** alongside the Q2 FY27 print: FY2027 outlook updated, Q3 FY2027 outlook initiated [`TTWO 2Q27 Earnings Release, 2026-11-09, "Outlook for Fiscal Year 2027"`; `Take-Two_Interactive_2Q FY27 FINAL deck, slides 7–10`; corroborated as a guidance event by `Capital IQ Estimates export, Guidance tab, Latest Guidance Key Development, 2026-11-09`].

### 2.1 Fiscal year 2027 (ending 2027-03-31)

| Metric | Period | Guidance | Midpoint | Type | Source |
|---|---|---|---|---|---|
| **Net Bookings** (operational metric) | FY2027 | $8,000 to $8,200m | **8,100** | Range — reiterated, unchanged from the Q1 outlook | `TTWO 2Q27 Earnings Release, "Outlook for Fiscal Year 2027"` |
| **GAAP total net revenue** | FY2027 | $7,980 to $8,180m | **8,080** | Range — **raised** from $7,900–8,100m | `TTWO 2Q27 Earnings Release`; prior from `TTWO 1Q27 Earnings Release, 2026-08-07, p.3` |
| GAAP cost of revenue | FY2027 | $3,679 to $3,800m | 3,739.5 | Range — raised from $3,538–3,658m | same |
| GAAP operating expenses | FY2027 | $4,078 to $4,098m | 4,088 | Range — **cut** from $4,150–4,170m | same |
| GAAP income before income taxes | FY2027 | $194 to $253m | 223.5 | Range — raised from $159–219m | same |
| GAAP net income | FY2027 | $109 to $142m | 125.5 | Range — vs prior $104–143m | same |
| **GAAP diluted EPS** | FY2027 | $0.57 to $0.75 | **0.66** | Range — vs prior $0.55–0.75 | same |
| **Non-GAAP EBITDA (as printed, GAAP column)** | FY2027 | $1,024 to $1,082m | 1,053 | Range — raised from $993–1,053m | same |
| **Non-GAAP EBITDA, management basis** | FY2027 | **$1,536 to $1,594m** | **1,565** | **Derived — arithmetic shown:** 1,024 + 47 (deferred) + 462 (stock comp) + 3 (other) = 1,536; 1,082 + 512 = 1,594 | derived from `TTWO 2Q27 Earnings Release` outlook table via the Section-0 bridge |
| **Management-reporting diluted EPS** | FY2027 | **$5.75 to $6.01** | **5.88** | **Derived — arithmetic shown:** (194 + 47 + 462 + 623 + 3) × 0.82 ÷ 189.5m = 5.75; (253 + 1,135) × 0.82 ÷ 189.5m = 6.01 | derived from `TTWO 2Q27 Earnings Release` outlook table via the Section-0 bridge |
| Net cash from operating activities | FY2027 | **over $1,000m** | n/a (floor) | One-sided — unchanged | `TTWO 2Q27 Earnings Release`; repeated verbally — "We remain … to deliver operating cash flow in excess of $1 billion and to be in a net cash position by the end of the fiscal year" [`Q2 2027 Earnings Call transcript, 2026-11-09, prepared remarks (Goldstein)`] |
| Capital expenditures | FY2027 | **approximately $290m** | 290 | Point — unchanged | same |
| Recurrent consumer spending (RCS) growth | FY2027 | **flat YoY**, 65% of Net Bookings | n/a | Qualitative + mix point — unchanged | `Take-Two_Interactive_2Q FY27 FINAL deck, slide 8`; `Q2 2027 transcript, prepared remarks` |
| RCS composition assumption | FY2027 | GTA series up (GTA VI: Ultimate Edition add-on content); NBA 2K up high single digits; mobile down | n/a | Qualitative | same |
| Label mix of Net Bookings | FY2027 | roughly 37% Rockstar Games / 34% Zynga / 29% 2K | n/a | Point mix | `Q2 2027 transcript, prepared remarks (Goldstein)` |
| Management-basis operating expense growth | FY2027 | approximately **+5% YoY** (favourable to the prior forecast on lower user-acquisition costs, part timing) | n/a | Point | same |
| Diluted share count assumption | FY2027 | 189.5m | n/a | Point | `TTWO 2Q27 Earnings Release` |
| Management tax rate assumption | FY2027 | 18% | n/a | Point | same |

### 2.2 Fiscal third quarter 2027 (three months ending 2026-12-31) — initial outlook

| Metric | Period | Guidance | Midpoint | Type | Source |
|---|---|---|---|---|---|
| **Net Bookings** | Q3 FY2027 | $3,350 to $3,500m | **3,425** | Range — initial | `TTWO 2Q27 Earnings Release, "Fiscal Third Quarter Ending December 31, 2026"` |
| **GAAP total net revenue** | Q3 FY2027 | $3,270 to $3,420m | **3,345** | Range — initial | same |
| GAAP cost of revenue | Q3 FY2027 | $1,649 to $1,732m | 1,690.5 | Range | same |
| GAAP operating expenses | Q3 FY2027 | $1,162 to $1,182m | 1,172 | Range | same |
| GAAP income before income taxes | Q3 FY2027 | $446 to $493m | 469.5 | Range | same |
| GAAP net income | Q3 FY2027 | $250 to $276m | 263 | Range | same (the companion deck labels this row "GAAP Net Loss" — a label error in the deck; the release says "Net income", and the filing-tier document wins, §4) |
| **GAAP diluted EPS** | Q3 FY2027 | $1.30 to $1.44 | **1.37** | Range | same |
| **Non-GAAP EBITDA (as printed)** | Q3 FY2027 | $651 to $698m | 674.5 | Range | same |
| **Non-GAAP EBITDA, management basis** | Q3 FY2027 | **$940 to $987m** | **963.5** | **Derived:** 651 + 93 + 196 = 940; 698 + 289 = 987 | derived via the Section-0 bridge |
| **Management-reporting diluted EPS** | Q3 FY2027 | **$3.80 to $4.00** | **3.90** | **Derived:** (446 + 93 + 196 + 153 + 1) × 0.82 ÷ 192.0m = 3.80; (493 + 443) × 0.82 ÷ 192.0m = 4.00 | derived via the Section-0 bridge |
| RCS growth | Q3 FY2027 | **approximately +12% YoY** | n/a | Point | `Take-Two_Interactive_2Q FY27 FINAL deck, slide 10`; `Q2 2027 transcript, prepared remarks` |
| Management-basis operating expense growth | Q3 FY2027 | approximately **+21% YoY**, driven by GTA VI launch marketing | n/a | Point | `Q2 2027 transcript, prepared remarks (Goldstein)` |
| Diluted share count assumption | Q3 FY2027 | 192.0m | n/a | Point | `TTWO 2Q27 Earnings Release` |

### 2.3 Stated assumptions the guidance depends on

Management names them: "a continuation of the current economic backdrop; the timely delivery of the titles included in this financial outlook; continued growth in the installed base of PlayStation 5 and Xbox Series X|S; … factors affecting our performance on mobile, such as player acquisition costs; our ongoing focus on our live services portfolio and new game pipeline; and stable foreign exchange rates" [`TTWO 2Q27 Earnings Release, "Key assumptions and dependencies"`]. It also warns that the components may not foot: "The individual components of the financial outlook may not foot to the totals, as the Company does not expect actual results for every component to be at the low end or high end of the outlook range simultaneously" [same].

### 2.4 What management said about the quarter it just missed

Q2 FY27 Net Bookings came in at **$1,601.3m against its own guidance of $1,620–1,670m** — below the low end by $18.7m. On the call: "We delivered second quarter net bookings of $1.6 billion, which was slightly below our guidance range of $1.62 billion to $1.67 billion. While NBA 2K27 launched successfully and achieved the second highest net bookings performance in the history of the series, it was below our forecast for the period" [`Q2 2027 Earnings Call transcript, 2026-11-09, prepared remarks (Zelnick)`]. The RCS assumption also missed: "Recurrent consumer spending was down 9% for the period compared to our guidance of a 5% decline, driven by NBA 2K" [same, Goldstein]. The offsets were the GTA series ahead of forecast and management-basis operating expenses 9% lower YoY, "favorable to our forecast due to lower personnel and user acquisition costs" [same].

---

## 3. Guidance vs Consensus Table

**Gap = Consensus mean − Guidance midpoint.** Positive = the Street sits above guidance. Consensus as of **2026-11-19**; guidance issued **2026-11-09**. Each row states its basis.

### 3.1 Fiscal year 2027 (ending 2027-03-31)

| Metric (basis) | Period | Management Guidance (midpoint) | Street Consensus (mean, analysts) | Gap | Gap Direction |
|---|---|---|---|---:|---|
| **Net Bookings** (operational metric) | FY2027 | $8,000–8,200m (**8,100**) | **8,554.69** (20 of 29) | **+454.7 (+5.6%)** | **Guidance BELOW the Street** — and the Street sits **+354.7 (+4.3%) above the TOP of the guided range** |
| GAAP total net revenue | FY2027 | $7,980–8,180m (8,080) | Not separately polled — the vendor "Revenue" field is Net Bookings | n/a | Not assessable from this export |
| **GAAP diluted EPS** | FY2027 | $0.57–0.75 (**0.66**) | **1.9057** (14 of 18; median 2.03242; high 3.18; low 0.41) | **+1.246 (+189%)** | **Guidance far below the Street** — consensus is ~2.9x the guided midpoint |
| **Management-reporting diluted EPS** | FY2027 | **$5.75–6.01 (5.88)** — derived | **EPS Normalized 6.89386** (24 of 28; median 6.875; high 8.47; low 5.79) | **+1.01 (+17.3%)** | Guidance below the Street |
| **Non-GAAP EBITDA, management basis** | FY2027 | **$1,536–1,594m (1,565)** — derived | **1,692.79** (15 of 22; median 1,722.43; high 2,123.7; low 1,080) | **+127.8 (+8.2%)** | Guidance below the Street |
| GAAP net income | FY2027 | $109–142m (125.5) | **338.22** (12 of 17; median 338.7) | **+212.7 (+169%)** | Guidance far below the Street |
| Cash from operations | FY2027 | **over $1,000m** (floor) | **1,364.50** (14 of 14; median 1,351.55; low 1,000) | **+364.5 above the floor** | Street above the guided floor; the lowest estimate sits exactly on it |
| Capital expenditure | FY2027 | approximately **$290m** | **281.81** (15 of 16; **median exactly 290**) | **−8.2 (−2.8%)** | Street at guidance |

**The low-estimate test.** On Net Bookings, the single *lowest* FY2027 estimate in the panel is **8,112** — above the guidance midpoint of 8,100. There is no analyst in the set modelling the bottom half of management's own range. On GAAP EPS the panel is split instead: the low estimate of **0.41** sits below the guided floor of 0.57 while the mean of 1.91 is nearly three times the midpoint — a very wide dispersion (high 3.18, low 0.41 on 14 contributors), which says the Street has no settled view of where GAAP earnings land, only of where bookings do.

**What the FY2027 bar implies for the half not yet reported (§17).** H1 FY27 Net Bookings are already in the ground at **2,987.2**. So:
- Guidance midpoint implies H2 of 8,100 − 2,987.2 = **5,112.8**.
- Top of the guided range implies H2 of 8,200 − 2,987.2 = **5,212.8**.
- Street implies H2 of 8,554.7 − 2,987.2 = **5,567.5** — i.e. **+8.9% above the guidance-implied H2 midpoint and +6.8% above even the top-of-range H2**.
- Pushing one period further: Q3 guidance midpoint 3,425 leaves a guidance-implied Q4 of 8,100 − 2,987.2 − 3,425 = **1,687.8**; the most generous combination (top of the FY range, bottom of the Q3 range) leaves **1,862.8**. The Street's own FQ4 2027 estimate is **1,950.67** — above both. **Most of the Street's above-guidance assumption therefore sits in Q4 FY27, not in the GTA VI launch quarter.**
- Same arithmetic on GAAP EPS: H1 reported **$(0.47)**; guidance midpoint implies H2 of 0.66 + 0.47 = **$1.13**; the Street implies H2 of 1.91 + 0.47 = **$2.38** — roughly **2.1x** the guidance-implied H2.

### 3.2 Fiscal third quarter 2027 (three months ending 2026-12-31)

| Metric (basis) | Period | Management Guidance (midpoint) | Street Consensus (mean, analysts) | Gap | Gap Direction |
|---|---|---|---|---:|---|
| **Net Bookings** | Q3 FY2027 | $3,350–3,500m (**3,425**) | **3,573.61** (17 of 22; median 3,500.90; high 4,087; low 3,403) | **+148.6 (+4.3%)** | Guidance below the Street; consensus sits **+73.6 above the top of the range** |
| GAAP total net revenue | Q3 FY2027 | $3,270–3,420m (3,345) | **~3,494 implied** (3,573.6 less the guided $80m deferred-revenue wedge — *inference, not from filings*) | **~+149 (+4.5%)** | Guidance below the Street, on the inferred basis |
| **GAAP diluted EPS** | Q3 FY2027 | $1.30–1.44 (**1.37**) | **2.02115** (9 of 11; median 1.77; high 3.18; low 0.63) | **+0.651 (+47.5%)** | Guidance far below the Street |
| **Management-reporting diluted EPS** | Q3 FY2027 | **$3.80–4.00 (3.90)** — derived | **EPS Normalized 4.21322** (21 of 23; median 3.99; high 5.57; low 3.43) | **+0.313 (+8.0%)** | Guidance below the Street |
| **Non-GAAP EBITDA, management basis** | Q3 FY2027 | **$940–987m (963.5)** — derived | **965.28** (12 of 14; median 977.95; high 1,183.3; low 666.6) | **+1.8 (+0.2%)** | **Street sits on the guidance midpoint** |
| GAAP net income | Q3 FY2027 | $250–276m (263) | **382.24** (10 of 12; median 378.25) | **+119.2 (+45.3%)** | Guidance far below the Street |

**The one row that is not stretched.** Management-basis EBITDA for Q3 is the single metric where the Street is level with guidance (+0.2%). The gap on GAAP EPS (+47.5%) and GAAP net income (+45.3%) is therefore not an earnings-power disagreement — it is mostly a disagreement about non-operating and tax lines below EBITDA, and the Q2 print shows why: the GAAP result carried a **$57.9m benefit from income taxes** against a pre-tax loss [`Q2 FY27 10-Q, Results of Operations`], while the company's own outlook is built on a flat 18% management tax rate. Treat the GAAP-EPS gap as the lowest-quality of the gaps in this table.

---

## 4. Estimate Revision Momentum Table

Source: `Capital IQ Estimates export, Trends tab, data as of 2026-11-19`. The vendor publishes month-interval snapshots, not day counts, so the template's 90/60/30-day columns are the vendor's own **3 / 2 / 1 months ago** rows — labelled as such rather than re-dated. Basis labels carry: "Revenue" = Net Bookings; "EPS Normalized" = management basis.

| Estimate (basis) | 3 months ago | 2 months ago | 1 month ago | Current | Direction |
|---|---:|---:|---:|---:|---|
| Revenue — Net Bookings (FQ3 2027, next Q) | 3,385.37 | 3,381.70 | 3,384.76 | **3,573.61** | **Rising** — flat for two months, then +188.9 (+5.6%) in the last month |
| EPS Normalized — management basis (FQ3 2027) | 3.83 | 3.83 | 3.89 | **4.21** | **Rising** — +0.32 (+8.2%) last month |
| EPS (GAAP) (FQ3 2027) | 1.82 | 1.82 | 1.94 | **2.02** | **Rising** — +11.0% over three months |
| EBITDA — management basis (FQ3 2027) | 952.29 | 922.22 | 925.77 | **965.28** | **Rising** — +39.5 (+4.3%) last month, +1.4% over three months |
| Revenue — Net Bookings (FQ4 2027) | 2,057.07 | 2,054.75 | 2,054.55 | **1,950.67** | **Falling** — −103.9 (−5.1%) last month |
| EPS Normalized (FQ4 2027) | 1.63 | 1.64 | 1.64 | **1.21** | **Falling** — −0.43 (−26.2%) last month |
| Revenue — Net Bookings (FY2027, next FY) | 8,520.55 | 8,530.15 | 8,536.71 | **8,554.68** | **Rising, barely** — +34.1 (+0.4%) over three months |
| EPS Normalized (FY2027) | 6.87 | 6.91 | 6.96 | **6.89** | **Flat** — +0.3% over three months, −1.0% last month; but **−13.3% vs the 7.95 standing six months ago** |
| EPS (GAAP) (FY2027) | 1.92 | 1.84 | 1.84 | **1.91** | **Flat** — −0.5% over three months; **−46.8% vs the 3.59 standing six months ago** |
| EBITDA — management basis (FY2027) | 1,765.43 | 1,750.31 | 1,741.00 | **1,692.79** | **Falling** — −72.6 (−4.1%) over three months; −13.2% vs six months ago (1,951.19) |
| Revenue — Net Bookings (FY2028) | 9,224.60 | 9,278.70 | 9,279.85 | **9,039.05** | **Falling** — −240.8 (−2.6%) last month |
| EPS Normalized (FY2028) | 10.30 | 10.35 | 10.35 | **10.09** | **Falling** — −0.26 (−2.5%) last month |
| EBITDA — management basis (FY2028) | 2,518.53 | 2,507.62 | 2,509.27 | **2,458.89** | **Falling** — −50.4 (−2.0%) last month, −2.4% over three months |

**Independent cross-check of the post-print move.** The pre-call consensus printed in the transcript header lets the 2026-11-09 to 2026-11-19 move be measured directly rather than inferred from month buckets [`Q2 2027 Earnings Call transcript, 2026-11-09, S&P Global Market Intelligence Estimates header, "Consensus as of Nov-09-2026 4:45 PM GMT"`]:

| Estimate | Consensus 2026-11-09 (pre-call) | Consensus 2026-11-19 | Move in 10 days |
|---|---:|---:|---|
| Revenue — Net Bookings, FQ3 2027 | 3,397.47 | 3,573.61 | **+176.1 (+5.2%)** |
| Revenue — Net Bookings, FY2027 | 8,560.87 | 8,554.68 | −6.2 (−0.1%) |
| Revenue — Net Bookings, FY2028 | 9,205.51 | 9,039.05 | **−166.5 (−1.8%)** |
| EPS Normalized, FQ3 2027 | 3.92 | 4.21 | **+0.29 (+7.4%)** |
| EPS Normalized, FY2027 | 6.98 | 6.89 | −0.09 (−1.3%) |
| EPS Normalized, FY2028 | 10.19 | 10.09 | −0.10 (−1.0%) |

The post-print pattern is a **shift within FY2027, not an upgrade of it**: the Street moved roughly $176m of Net Bookings and $0.29 of EPS into the GTA VI launch quarter while leaving the full year unchanged and cutting FY2028. That is consistent with the company having reiterated FY27 while pre-announcing a larger Q3.

---

## 5. Revision Breadth

Source: `Capital IQ Estimates export, Revisions tab, data as of 2026-11-19`. "Net" = Upward − Downward. Analyst counts are the vendor's "# of Analysts" with "# still in Consensus" in brackets where they differ.

| Metric (basis) | Up Revisions | Down Revisions | Net Revision Breadth | Period |
|---|---:|---:|---:|---|
| Revenue — Net Bookings, FQ3 2027 | 11 | 3 | **+8** | Last month (15 analysts, 14 still in consensus) |
| Revenue — Net Bookings, FQ4 2027 | 2 | 10 | **−8** | Last month (15 analysts, 14 still in) |
| **Revenue — Net Bookings, FY2027** | **6** | **9** | **−3** | Last month (18 analysts, 18 still in) |
| Revenue — Net Bookings, FY2028 | 8 | 5 | **+3** | Last month (19 analysts, 18 still in) |
| EBITDA — management basis, FQ3 2027 | 8 | 1 | **+7** | Last month (11 analysts, 9 still in) |
| EBITDA — management basis, FQ4 2027 | 1 | 8 | **−7** | Last month (11 analysts, 9 still in) |
| **EBITDA — management basis, FY2027** | **8** | **4** | **+4** | Last month (14 analysts, 13 still in) |
| EBITDA — management basis, FY2028 | 9 | 2 | **+7** | Last month (14 analysts, 13 still in) |
| EPS Normalized, FQ3 2027 | 14 | 4 | **+10** | Last month (19 analysts, 19 still in) |
| EPS Normalized, FQ4 2027 | 5 | 13 | **−8** | Last month (20 analysts, 19 still in) |
| **EPS Normalized, FY2027** | **11** | **9** | **+2** | Last month (25 analysts, 23 still in) |
| EPS Normalized, FY2028 | 10 | 7 | **+3** | Last month (25 analysts, 24 still in) |
| **EPS (GAAP), FY2027** | **9** | **2** | **+7** | Last month (13 analysts, 12 still in) |
| EPS (GAAP), FY2028 | 10 | 3 | **+7** | Last month (15 analysts, 14 still in) |

Reconciled to the deterministic facts sidecar: `ciq_facts.json` reports "EPS (GAAP) FY 2027: 9↑/2↓ last mo" and "Revenue FY 2027: 6↑/9↓ last mo" — both match this table exactly, with no material gap to flag.

**Read.** Breadth is **internally contradictory by period, and that is the signal.** For the launch quarter it is strongly positive (FQ3: revenue +8, EPS +10, EBITDA +7). For the quarter immediately after it is the mirror image (FQ4: revenue −8, EPS −8, EBITDA −7). At the full-year level the two cancel out: FY2027 Net Bookings breadth is actually **negative (6 up / 9 down)** even while the FY2027 mean level crept up 0.4%, which means the cuts came from smaller-revenue models and the raises from larger ones. Analysts are redistributing the same annual number across quarters rather than taking the year up.

---

## 6. Historical Beat / Miss Pattern

Two bars are shown because both matter for this name and they do not agree: the Street's bar (vendor consensus) and the company's own guidance. "Revenue" = Net Bookings basis throughout; "EPS" here = EPS Normalized (management basis). Source: `Capital IQ Estimates export, Surprise tab` for actuals/estimates; guidance low/high from the same tab, cross-checked to the company releases where those releases are in the pool.

| Period | Revenue (Net Bookings) vs Street | EPS (mgmt basis) vs Street | Magnitude | Notes |
|---|---|---|---:|---|
| **Q3 FY26** (Dec-2025, announced 2026-02-03) | **Beat** — actual 1,757.1 vs est 1,581.66 | **Beat** — 1.2271 vs 0.83186 | Revenue **+11.1%** ( +175.4); EPS **+48.2%**; EBITDA 331.9 vs 250.38 = **+32.6%** | Also beat its own guidance of 1,550–1,600 by +11.6% vs midpoint. GAAP EPS $(0.50) came in *below* the guided $(0.49)–$(0.35) |
| **Q4 FY26** (Mar-2026, announced 2026-05-21) | **Beat** — 1,580.3 vs 1,551.60 | **Beat** — 0.7985 vs 0.55658 | Revenue **+1.8%** (+28.7); EPS **+42.9%**; EBITDA 235.8 vs 188.73 = **+24.9%** | Beat guidance of 1,510–1,560 by +3.0% vs midpoint. GAAP EPS $(0.32) beat the guided $(0.70)–$(0.54) |
| **Q1 FY27** (Jun-2026, announced 2026-08-07) | **Beat** — 1,385.9 vs 1,360.64 | **Beat** — 0.3532 vs 0.32765 | Revenue **+1.9%** (+25.3); EPS **+6.1%**; EBITDA 127.1 vs 123.82 = **+2.6%** | Beat guidance of 1,320–1,370 by +3.0% vs midpoint. GAAP EPS $(0.18) landed inside the guided $(0.23)–$(0.15). The quarter carried a $43.4m impairment on an abandoned third-party title [`TTWO 1Q27 Earnings Release, p.2`] |
| **Q2 FY27** (Sep-2026, announced 2026-11-09) | **MISS** — 1,601.3 vs 1,655.30 | **Beat** — 0.9962 vs 0.97026 | Revenue **−3.3%** (−54.0); EPS **+3.1%**; EBITDA 277.1 vs 257.84 = **+7.5%** | **Also missed its own guidance** of 1,620–1,670 — below the low end by 18.7, i.e. **−2.7% vs the midpoint**. RCS fell 9% against guidance of a 5% decline. GAAP EPS $(0.29) beat the guided $(0.84)–$(0.75), helped by a $57.9m tax benefit |

**Pattern, stated plainly.** Four straight management-basis EPS and EBITDA beats, but the **magnitude has collapsed**: EPS surprise ran +48.2% → +42.9% → +6.1% → +3.1%, and EBITDA surprise +32.6% → +24.9% → +2.6% → +7.5%. On the top line the record broke outright last quarter: three revenue beats of +11.1%, +1.8%, +1.9% followed by a **−3.3% miss**, and the first miss of its own guidance range in the set. The annual record is thinner still: `ciq_facts.json` records GAAP-EPS surprise of +10% in FY2022 and **0% in each of FY2023, FY2024, FY2025 and FY2026**, with revenue surprise of −1%, +1%, +1%, 0%, 0% — i.e. at the full-year level this company has been landing on the number, not beating it.

**Probability discipline (§10).** Four quarterly observations is not a measured frequency. Any statement about the odds of the next beat built on this table is **judgment informed by a four-observation sample**, not an empirical rate, and must be labelled that way downstream.

---

## 7. Bar Assessment

### **Bar is high.**

**Rationale.** On the metric the Street actually tracks — Net Bookings — consensus for FY2027 of **8,554.7** sits **$354.7m (+4.3%) above the TOP of management's reiterated $8,000–8,200m range** and **$454.7m (+5.6%) above its midpoint**, with the single lowest estimate in the 20-contributor panel (8,112) still above the guidance midpoint; on GAAP diluted EPS the Street's $1.91 is roughly **2.9x** the guided $0.66 midpoint. Stripping out the half already reported makes the stretch concrete: the Street needs H2 FY27 Net Bookings of **5,567.5 against a guidance-implied 5,112.8**, and a Q4 FY27 of **1,950.7 against a guidance-implied 1,687.8** — above even the most generous reading of the range (1,862.8) — so most of the above-guidance assumption sits in the quarter *after* the GTA VI launch, not in the launch itself. Set against a company that has just **missed its own Q2 Net Bookings guidance** (1,601.3 vs 1,620–1,670, the RCS assumption missing by 4 percentage points) and whose management-basis beat magnitude has shrunk from +48.2% to +3.1% over four quarters, the bar for the next twelve months is set above what management is underwriting.

**Direction of estimates — mixed, and honestly so.** This is not a case of estimates having been cut into a beatable setup, nor of a clean ramp. Over the last three months FY2027 Net Bookings crept up just +0.4% while FY2027 management-basis EBITDA was **cut 4.1%** (1,765.4 → 1,692.8) and FY2028 revenue, EPS and EBITDA were all cut last month (−2.6% / −2.5% / −2.0%). Breadth says the same thing in a different language: FQ3 2027 breadth is strongly positive (revenue 11↑/3↓, EPS 14↑/4↓) and FQ4 2027 is its mirror (2↑/10↓, 5↑/13↓), while FY2027 Net Bookings breadth is actually **negative at 6↑/9↓**. The Street is moving money between quarters, not raising the year. The one place consensus is *not* stretched is Q3 management-basis EBITDA, where it sits within 0.2% of the derived guidance midpoint (965.3 vs 963.5) — which locates the large GAAP-EPS and GAAP-net-income gaps below the EBITDA line, in tax and non-operating items, and makes those the weakest-quality part of the gap.

**The limitation that matters, stated rather than buried.** Both the guidance and the consensus were set *before* any Grand Theft Auto VI sell-through existed. Management framed the launch as "ten days away" on the 2026-11-09 call, i.e. **today, 2026-11-19**, and rested the reiterated range on pre-orders "tracking far in excess of our initial expectations" — an input the engine cannot verify and which is not quantified anywhere in the pool. One title therefore determines whether an above-guidance consensus is a high bar or a low one, and no post-launch evidence exists yet. The bar is high **relative to what management has underwritten**; it is not proven high relative to the outcome, and that distinction must travel with this verdict (§3). The stale-consensus guard does not trigger — the consensus export is dated 2026-11-19, ten days *after* the latest reported quarter — so the verdict is not provisional on staleness.

**Partial-data caps:** none. Consensus came from a pool Capital IQ export (7 tabs), not from the web or memory; revision history and revision breadth are both present, so neither the no-consensus (max 30) nor the no-revision-history (max 60) cap applies, and no staleness haircut is warranted. The vendor's basis and definitional mismatches (Net Bookings vs GAAP revenue; management-basis vs GAAP EPS and EBITDA) were resolved arithmetically against two reported quarters, so the "definitions prevent a like-for-like comparison → keep the bar Unknown" path is not taken.

**Section 3A (alt-data cross-check) is omitted deliberately.** The pool contains no `external/` subfolder, no manifest row flagged `external: true`, and no licensed alt-data panel. Its absence is not a gap and no panel figure was substituted for consensus.
