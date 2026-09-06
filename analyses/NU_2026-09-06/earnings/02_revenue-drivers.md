# Revenue Drivers — NU

**Reporting basis carried from upstream.** Nu Holdings Ltd. (NYSE: NU) is a US-listed **foreign private issuer** incorporated in the Cayman Islands, reporting under **IFRS Accounting Standards**, in **US dollars**, fiscal year ending **31 December**. The audited annual filing is a **Form 20-F**; the quarterly disclosure is an **unaudited interim condensed consolidated financial statement** — there is no 10-K or 10-Q and their absence is not a data gap (CLAUDE.md §27). All figures are US$ unless stated. Amounts taken from the interim filings are in **US$ thousands**; amounts taken from the earnings presentation are in **US$ millions** and are **company-defined, non-IFRS** where labelled.

**Two qualifiers that must travel with every growth number in this report (CLAUDE.md §3).**
1. Upstream `01_historical-financials` found revenue **decelerating on the multi-year annual view** (+182.2% FY2022 → +37.0% FY2025) while **inflecting positive over the last six quarters** (+18.7% YoY in Q1'25 → +50.3% in Q2'26), with **a material part of that recent USD acceleration attributable to Brazilian real appreciation**. Neither half of that finding may be quoted without the other, and no headline growth rate in this report is quoted without its currency component.
2. NU earns almost all of its money in Brazilian reais, Mexican pesos and Colombian pesos and reports in US dollars. **Constant-currency ("FX-neutral") and as-reported growth are kept separate throughout and are never blended.** Every cross-currency figure carries its rate and date (§15/§27).

**Prior in-house memo.** `NU_Holdings_Deep_Dive_15_Page_Memo_30_Aug_2026.pdf` sits in the pool and carries its own verdict. That verdict is stripped (CLAUDE.md §24) and **no number in this report comes from it.**

---

## 1. Segment Decomposition Status

**Single-segment business (>85% from one segment) — consolidated analysis, with the geographic cut the filing does disclose.**

The business-model module has run and `analyses/NU_2026-09-06/business-model/03_segment-map.md` is available. It records the company's own position, which my own read of the filing confirms: *"The CODM considers the whole Group as a single operating and reportable segment."* The CODM (Chief Operating Decision Maker — the executive whose reviews define what counts as a segment under IFRS 8) is the CEO, and what he reviews is the consolidated income statement. `[FY2025 Form 20-F (filed Apr-08-2026), Note 34 (Segment information), p.F-97]`, restated word-for-word at `[Q2'26 interim condensed consolidated financial statements (filed Aug-14-2026), Note 34, p.43]`. One segment, "Banking", 100% of revenue and 100% of profit. The >85% test is met at 100%.

**Segment-level profit is not disclosed at all** — no country margin, no product margin, no country net income. I do not construct it. Two disaggregations *are* disclosed and I use both, labelled as disaggregations rather than segments:
- **Geography** (Note 34(b)) — but on a **narrower revenue base** than IFRS total revenue. The Note-34 base for Q2'26 is **US$4,380,927k against IFRS total revenue of US$5,513,208k**, i.e. it covers **79.5%** of revenue. The missing **US$1,132,281k** is treasury income (interest on other assets at amortised cost 765,339 + fair-value instruments 363,558 + other fair-value 3,383 = 1,132,280; the 1k difference is rounding in the filing's own columns). `[Q2'26 interim statements, Note 6(a) and Note 34(b), pp.16, 43]` **So roughly a fifth of revenue is nowhere in the geographic split** — the same gap `03_segment-map.md` names.
- **Product / income type** (Note 6), on that same narrower base for the fee lines but with the full interest detail. I use Note 6 for the exact line-item decomposition in §6.

---

## 2. Revenue Driver Tree

| Business Type | Revenue Formula |
|---|---|
| **Lender (the applicable row)** | Loan book × yield + fees |

**NU's company-specific revenue formula, in one line:**

> **Total revenue = (credit portfolio × blended credit yield) + (deposits and liquid assets × treasury/float yield) + (card purchase volume × interchange take rate) + late fees + other fees — all earned in BRL/MXN/COP and then translated into US dollars at each month's average rate.**

The company states the same thing in a simpler form and uses it as its headline framework: **Revenue = active customers × ARPAC** (ARPAC = average monthly revenue per active customer). `[Q2'26 Earnings Presentation, Aug-13-2026, "Our model powers our earnings-generating formula", slide 6]`

Both forms are used below. The first is the one that carries the yield, mix and funding detail; the second is the one management guides the market with.

**Where the money actually comes from, Q2'26 (US$ thousands, share of IFRS total revenue of 5,513,208):** `[Q2'26 interim statements, Note 6(a) and 6(b), p.16]`

| Line | Q2'26 | Share of revenue |
|---|---:|---:|
| Interest income — credit card | 1,805,581 | 32.75% |
| Interest income — loan | 1,734,365 | 31.46% |
| Interest income — other assets at amortised cost (treasury / float) | 765,339 | 13.88% |
| Interest and gains — financial instruments at fair value | 363,558 | 6.59% |
| Interest income — other receivables | 88,347 | 1.60% |
| Other income at fair value | 3,383 | 0.06% |
| Credit and prepaid card income (interchange — the fee a merchant's bank pays Nu on each card purchase) | 534,970 | 9.70% |
| Late fees | 136,801 | 2.48% |
| Other fee and commission income | 70,455 | 1.28% |
| Insurance commission | 10,409 | 0.19% |
| **Total revenue** | **5,513,208** | **100.00%** |

**Interest on cards and loans alone is 64.21% of revenue.** Interest income of every kind is 86.35%; fees are 13.65%. This is a consumer credit book first and a payments business second, and any read that treats it primarily as an app or a payments platform is looking at the smaller seventh of the revenue.

---

## 3. Market / Share / Price / Mix Split

Importance is scored /100, higher = more important to revenue (not inverted).

| Driver Bucket | Current Direction | Evidence | Importance /100 |
|---|---|---|---:|
| **End-market demand** (Brazilian consumer credit) | **Softening at the macro level, not yet visible in the book.** Brazil GDP growth 2.3% in 2025, down from 3.4% in 2024; unemployment improved to 5.1% from 6.2%. Management: *"we don't really see any significant or structural deterioration in our numbers"* — a statement about NU's own portfolio, not about the market | `FY2025 Form 20-F, Item 5, macroeconomic indicators table`; `Q2 2026 earnings-call transcript, Aug-13-2026, Q&A — David Vélez` | 55 |
| **Company market share** | **Improving, from a small base.** Management sizes the Brazil consumer + SME gross profit pool at ~US$100bn and puts NU's share at 7%: *"we have 7% market share of that profit pool. So we're still a small player in that big market"*. 139m customers, of which ~118m in Brazil; Mexico at 16.5% of the adult population. CFO: *"growth remained strong relative to the broader market"*. The 7% and US$100bn figures are management estimates, not filed numbers | `Q2 2026 earnings-call transcript, Aug-13-2026, prepared remarks and Q&A`; `Q2'26 Earnings Presentation, Aug-13-2026, slide 7 note 2 (gross profit pool US$100B)` | **85** |
| **Price / realization** | **Improving.** Net interest margin (NIM — interest earned minus funding cost, as a percentage of interest-earning assets) rose from 18.8% in Q2'25 to **22.9%** in Q2'26 (+410bps YoY; +180bps QoQ from 21.1%). My own derived blended yield on the total gross credit portfolio rose from ~34.55% to ~36.97% annualised (+242bps) — see the basis caveat in §6a. Funding got cheaper: cost of deposits fell from 91% to **88% of the interbank rate** | `Q2'26 Earnings Presentation, Aug-13-2026, slides 14 and 15`; `Q2 2026 transcript, prepared remarks` | **90** |
| **Product / customer / geography mix** | **Shifting toward higher-yield unsecured lending.** Unsecured lending grew **+45% YoY FX-neutral** to US$10.3bn versus credit cards +35% to US$26.0bn and secured +30% to US$3.1bn; unsecured share of the portfolio moved 25% → 26% and cards 67% → 66%. Geography mix is moving slowly: Mexico 6.7% of the Note-34 revenue base in FY2025 → **7.2% in H1'26**. CFO attributes NIM expansion partly to *"a mix weighted further towards unsecured lending"* | `Q2'26 Earnings Presentation, slide 13`; `Q2 2026 transcript, prepared remarks`; `FY2025 20-F, Note 34(b), p.F-97`; `Q2'26 interim statements, Note 34(b), p.43` | 70 |
| **FX translation** | **Large tailwind in the reported number, and it is not operating growth.** Average USD/BRL moved from **R$5.6625 (Q2'25) to R$5.0496 (Q2'26)** — the real appreciated **12.14%**. Spot at Jun-30-2026 was **R$5.1617**, i.e. **2.2% weaker than the quarter's own average**, so if spot holds, Q3'26 translates less favourably than Q2'26 did | `Q2'26 Earnings Presentation, Aug-13-2026, Non-IFRS Financial Measures — FX-Neutral methodology and FX rates, pp.34–35` | **88** |
| **M&A / divestitures** | **Zero contribution to Q2'26 revenue.** The only deal in the period is the **Banco Porto Real** share purchase agreement announced Jul-20-2026 — after quarter-end, still subject to Brazilian Central Bank approval, and explicitly a **banking-licence** acquisition to satisfy Joint Resolution No. 17 brand-name rules: *"does not impose additional capital or liquidity requirements"*. No revenue is attributed to it. Nubank N.A. (US) has conditional OCC approval from Jan-29-2026 and **is not yet operating** | `Q2'26 interim statements, Note 35 (Subsequent events), p.44`; `FY2025 Form 20-F, Note 35(a), p.F-98` | 5 |

**The separation this table exists to make, stated plainly:** none of NU's Q2'26 revenue growth is acquisition-driven, but a large slice of it is currency. Reported +50.3% YoY revenue growth is **not** +50.3% of demand. The organic, constant-currency figure is roughly +34% (arithmetic in §6a), and the company's own FX-neutral gross-revenue measure says +39%. Anyone quoting +50.3% as customer demand is reading a currency move as an operating one — the exact error upstream `01` flagged.

---

## 4. Revenue Driver Table (consolidated)

Magnitude test: **High** = a reasonable move in this driver moves total revenue by more than 5%; **Mid** = 2–5%; **Low** = under 2%. The magnitude column shows the arithmetic where it is not obvious.

| Driver | Current Level | Direction | Magnitude | Evidence |
|---|---|---|---|---|
| **Credit portfolio (loan book size)** | **US$39.4bn** at Jun-30-2026; +37% YoY FX-neutral, +5% QoQ FX-neutral. Cards US$26.0bn (+35%), unsecured US$10.3bn (+45%), secured US$3.1bn (+30%) | **Improving, but decelerating sequentially.** QoQ FX-neutral run: +8% (Q2'25), +9%, +11%, +7%, **+5%** (Q2'26). CFO: *"Sequential growth remained solid while normalizing after a period of exceptionally strong expansion"* | **High** — card + loan interest is 64.21% of revenue, so a 10% move in the book at constant yield ≈ 6.4% of revenue (≈US$354m per quarter at Q2'26 scale) | `Q2'26 Earnings Presentation, slide 13`; `Q2 2026 transcript, prepared remarks` |
| **Blended credit yield / NIM (the price of credit)** | NIM **22.9%** (Q2'25 18.8%); risk-adjusted NIM (NIM after credit losses) **12.4%**, up from 9.5% in Q1'26. Derived blended yield on total gross portfolio ~36.97% annualised vs ~34.55% a year earlier | **Improving.** Driven by the growth put on the books, unsecured mix, and deliberate risk expansions. Cost of deposits 88% of the interbank rate vs 91% a year earlier | **High** — same 64.21% base as above; a 10% relative yield move ≈ 6.4% of revenue | `Q2'26 Earnings Presentation, slides 14–16`; `Q2 2026 transcript, prepared remarks`; my derivation in §6a |
| **Customer count** | **139m** total (Brazil ~118m, Mexico 16m at end-July, Colombia >5m); +13.0% YoY from 123m. Net adds by year at Q2: 65 → 84 → 105 → 123 → 139m, i.e. **+19, +21, +18, +16m** | **Improving in level, decelerating in adds** | **High** — the first term in the company's own revenue formula; a 10% move ≈ 10% of revenue if ARPAC holds | `Q2 2026 transcript, prepared remarks`; `Q2'26 Earnings Presentation, slide 6` |
| **Activity rate** (share of customers who generated revenue in the last 30 days) | **83.5%**, up sequentially; Brazil above 86% for the first time | **Improving, slowly** — 83.0–83.5% band for several quarters | **Mid** — a 1-point move on 139m customers is ~1.4m active customers, ~1.2% of revenue; a 5-point move ~6% | `Q2 2026 transcript, prepared remarks`; `FY2025 Form 20-F, Key Business Metrics — Activity Rate` |
| **ARPAC** (average monthly revenue per active customer) | **US$17.1** in Q2'26, from US$12.5 in Q2'25 — **+36.8% as reported, +22% FX-neutral**. Quarterly path: 11.6, 12.5, 13.8, 15.0, 15.9, 17.1 | **Improving, every quarter for six quarters** | **High** — the second term in the company's formula; ARPAC is what carries yield, mix and fee take together | `Q2'26 Earnings Presentation, Aug-13-2026, slide 28` |
| **FX translation (BRL/USD above all)** | Average R$5.0496 in Q2'26 vs R$5.6625 in Q2'25 (**BRL +12.14%**). Spot R$5.1617 at Jun-30-2026 | **Tailwind now, and already less favourable at quarter-end spot than the quarter average (−2.2%).** The pool contains no BRL reading after Jun-30-2026 — do not assume the current level | **High** — roughly 90% of revenue is non-USD, so a 10% currency move ≈ 9% of revenue (≈US$496m per quarter at Q2'26 scale) | `Q2'26 Earnings Presentation, Non-IFRS Financial Measures — FX rates, pp.34–35`; `FY2025 20-F, Note 34(b)` for the 91% Brazil weight |
| **Product mix (unsecured share)** | Unsecured 26% of the portfolio (25% a year earlier), growing +45% YoY FX-neutral | **Improving revenue yield; raising credit risk at the same time.** 90+ day non-performing loans rose 35bps in the quarter to **6.9%**, the highest in the 13-quarter series the deck shows; CFO attributes it to *"a mix shift"* rather than deterioration | **Mid** — a 1-point mix shift on a US$39.4bn book is ~US$0.4bn moving to a higher-yield product; roughly 0.3–0.5% of revenue per point | `Q2'26 Earnings Presentation, slides 13 and 17`; `Q2 2026 transcript, Q&A — Rob Livingston` |
| **Deposits / funding base** | **US$45.3bn** (Brazil 36.4, Mexico 5.7, Colombia 3.3); +18% YoY FX-neutral, +6% QoQ. Average loan-to-deposit ratio (how much of the deposit base is lent out) rose **50% → 54% → 58%** across Q4'25–Q2'26 | **Improving in level, but growing at half the rate of the loan book (+18% vs +37%).** That gap is being absorbed by the rising loan-to-deposit ratio, which is finite | **Mid–High** — deposits set the ceiling on how fast the loan book can grow, and treasury/float income (interest on other assets at amortised cost) is 13.88% of revenue | `Q2'26 Earnings Presentation, slides 14 and 16`; `Q2 2026 transcript, prepared remarks` |
| **Card purchase volume / interchange** | Credit and prepaid card income **US$534,970k**, +36.3% YoY | **Improving, but slower than interest income** (+36.3% vs +52.2% for total interest income), so its revenue share is falling | **Mid** — 9.70% of revenue; a 10% volume move ≈ 1.0% of revenue | `Q2'26 interim statements, Note 6(b), p.16` |
| **Late fees** | **US$136,801k**, +51.7% YoY | Improving | **Low** — 2.48% of revenue | `Q2'26 interim statements, Note 6(b), p.16` |
| **Brazilian policy rate (Selic / CDI)** | Selic **15.00%** as of the FY2025 20-F date (Apr-2026); average CDI 14.3% in 2025 vs 10.8% in 2024. **The pool holds no Selic or CDI reading later than Apr-08-2026** | **Unknown from available data.** High rates lift the treasury/float line (interest on other assets at amortised cost, +53.5% YoY) and lift funding cost at the same time; a cutting cycle would reverse both | **Mid** — the float line is 13.88% of revenue; a 200bp policy move on that line is roughly 1.5–2% of revenue, before any funding-cost offset | `FY2025 Form 20-F, Item 3.D and Item 5, macroeconomic indicators table`; `Q2'26 interim statements, Note 6(a), p.16` |
| **Revolving-card charge cap (Lei 14.690/2023 + CMN Res. 5.112/2023)** | **In force and unchanged** since Jan-03-2024: total interest and charges on revolving/instalment card financing may not exceed the original debt. The 20-F states the provisions *"have been applied throughout 2024 and 2025"* | **Stable** — a standing ceiling on the price of the largest revenue line, not a new change | **Low today, High if tightened** — it caps price on the 32.75% of revenue that is card interest | `FY2025 Form 20-F, Item 4.B, Revolving Credit and Interest Rate Regulations` |
| **M&A** | Banco Porto Real (licence only, post quarter-end, pending BCB approval); Nubank N.A. not yet operating | **No contribution** | **Low** — zero in the reported period | `Q2'26 interim statements, Note 35, p.44` |

**Drivers deliberately not listed, because they do not apply:** store count / distribution points (there are no branches), commodity price, utilisation / installed capacity, backlog / order book, contract renewals. NU discloses none of these and inventing rows for them would be filler.

**Sector-KPI completeness check (the bank overlay).** The KPIs a lender's revenue read requires are present: NIM, risk-adjusted NIM, loan growth by product, deposit growth, cost of deposits as a share of the interbank rate, loan-to-deposit ratio, NPL 15–90 and 90+, coverage, ROE, ARPAC, activity rate. **Three are absent from this pool and are flagged rather than skipped:** (i) the **interest-earning portfolio (IEP)** balance is defined in the deck's glossary but no quarterly IEP figure was extracted, so the yield I compute in §6a uses the *total gross* portfolio instead and is therefore a blended, not a true earning-asset, yield; (ii) **purchase volume** is defined in the glossary but no quarterly figure appears, so interchange growth cannot be split into volume versus take rate; (iii) **ARPAC by country** is not disclosed, so Mexico's revenue growth cannot be split into customers versus monetisation.

---

## 5. Revenue Drivers By Segment

**There is one reportable segment, so this section is a geographic cut, not a segment P&L.** All figures are on the **Note-34(b) revenue base**, which covers 79.5% of IFRS total revenue and excludes treasury income (§1). Revenue shares are of that narrower base. **Profit by country is not disclosed** — I do not estimate it.

`[Q2'26 interim condensed consolidated financial statements (filed Aug-14-2026), Note 34(b), p.43]`, three-month periods, US$ thousands:

| Geography | Q2'26 | Q2'25 | YoY as reported | Share of Note-34 base Q2'26 | Contribution to the base's +53.53% growth |
|---|---:|---:|---:|---:|---:|
| Brazil | 3,990,286 | 2,621,626 | **+52.20%** | 91.08% | **+47.96pp** |
| Mexico | 314,603 | 175,693 | **+79.06%** | 7.18% | +4.87pp |
| Other countries (incl. Colombia, US) | 76,038 | 56,201 | +35.30% | 1.74% | +0.70pp |
| **Total (Note-34 base)** | **4,380,927** | **2,853,520** | **+53.53%** | 100.00% | **+53.53pp** |

Components sum exactly to the stated total. Note the base's +53.53% is **not** the same as IFRS total revenue growth of +50.29% — the two differ because treasury income (outside this table) grew more slowly than the customer-facing lines.

### Segment: Brazil (91.08% of the Note-34 revenue base)

| Driver | Current Level | Direction | Magnitude | Evidence |
|---|---|---|---|---|
| Customers | ~118m; activity rate above 86% for the first time | Improving | High | `Q2 2026 transcript, prepared remarks` |
| Credit portfolio | Not disclosed by country. Group portfolio US$39.4bn, and Brazil holds 90.2% of the regulatory capital in the three regulated entities (5,597,604 of 6,204,917 at Jun-30-2026) | Improving | High | `Q2'26 interim statements, Note 33, pp.42–43` |
| Deposits | **US$36.4bn**, 80.4% of the group's US$45.3bn | Improving | Mid–High | `Q2 2026 transcript, prepared remarks` |
| FX (BRL) | Average R$5.6625 → R$5.0496 (**+12.14%**) | Tailwind, weaker at quarter-end spot | **High** | `Q2'26 Earnings Presentation, pp.34–35` |
| Constant-currency revenue growth | **~+35.7%** — *derived*: reported +52.20% ÷ 1.1214 (the BRL average-rate move) − 1. *Inference, not from filings*; the company publishes no country-level FX-neutral figure | Improving | High | My arithmetic on `Q2'26 interim statements, Note 34(b)` and the deck's FX rates |
| Regulatory price cap | Card revolving/instalment charge ceiling in force, unchanged | Stable | Low today | `FY2025 20-F, Item 4.B` |

### Segment: Mexico (7.18% of the Note-34 revenue base)

| Driver | Current Level | Direction | Magnitude | Evidence |
|---|---|---|---|---|
| Customers | 16m as of end-July 2026; 16.5% of Mexico's adult population | Improving | High for Mexico, Low for the group | `Q2 2026 transcript, prepared remarks` |
| Revenue | US$314,603k in Q2'26, **+79.06% YoY as reported** | Improving, fastest of the three regions | Low for the group — 7.18% of the base, so even a 20% swing here is ~1.4% of the base | `Q2'26 interim statements, Note 34(b), p.43` |
| Deposits | **US$5.7bn**, and **declining modestly for a second quarter** — deliberate: CFO calls it *"our ongoing deposit optimization strategy"* to lower funding cost | Deliberately shrinking | Mid for Mexico | `Q2 2026 transcript, prepared remarks`; `Q2'26 Earnings Presentation, slide 14` |
| Banking licence | Became a full multiple bank on **Aug-06-2026** after CNBV authorisation on Jul-09-2026 — after quarter-end. CEO says it *"unlocks capabilities we did not have before. Payroll direct deposits strengthen primary [banking relationships]"* | **New driver, not yet in any reported revenue** | Mid for Mexico in FY2027 | `Q2'26 interim statements, Note 35, p.44`; `Q2 2026 transcript, prepared remarks` |
| Monetisation | Management states ARPAC *"in Mexico is $12.3 against $5.6 in Brazil"* **at the same stage of penetration** — a like-for-like cohort comparison, not current group ARPAC. It is a transcript claim with **no supporting country income statement anywhere in the filings** and must not be converted into a profit or revenue share | Claimed improving | Not verifiable | `Q2 2026 transcript, prepared remarks`; limitation also flagged in `business-model/03_segment-map.md` §3 |
| FX (MXN) | The pool gives monthly MXN rates for Mar/Apr/May 2026 (17.78 / 17.46 / 17.31) but **no Q2'25 MXN average**, so Mexico's +79.06% cannot be split into currency and operating growth | **Not available** | — | `Q2'26 Earnings Presentation, FX Rates — Monthly translation, p.35` |

### Other countries (1.74% of the base) — immaterial to group revenue

Colombia has more than 5m customers and US$3.3bn of deposits, and Nubank N.A. in the US is not yet operating. The bucket is 1.74% of the Note-34 revenue base but **13.9% of group non-current assets** — the disclosure narrowed from FY2024 onward when Colombia stopped being named separately. `[Q2'26 interim statements, Note 34(b), p.43; FY2025 20-F, Note 34(b), p.F-97]` No separate driver table is warranted at 1.74% of revenue.

---

## 6. Revenue Growth Decomposition

**Period decomposed: Q2'26 versus Q2'25 (three months), IFRS total revenue, US$ thousands.** Observed: **5,513,208 vs 3,668,470 = +1,844,738 = +50.29%.** `[Q2'26 interim condensed consolidated financial statements, Consolidated Statements of Income, three-month period ended 06/30/2026, p.6]`

### 6.1 Driver decomposition (the required view)

| Component | Contribution to Growth (pp) | Evidence |
|---|---:|---|
| Volume — customer count (+13.0%: 123m → 139m) | **+13.00** | `Q2'26 Earnings Presentation, slide 6`; `Q2 2026 transcript, prepared remarks` |
| Price / monetisation — ARPAC per active customer, **FX-neutral +22%** | **+24.86** | `Q2'26 Earnings Presentation, slide 28` |
| Mix (product, customer, geography) | **Not separable** — sits inside the ARPAC row; the company publishes no mix bridge for revenue | `Q2'26 Earnings Presentation, slides 13, 28` |
| FX translation — BRL average R$5.6625 → R$5.0496 (**+12.14%**) | **+16.27** | `Q2'26 Earnings Presentation, Non-IFRS Financial Measures — FX rates, pp.34–35` |
| Acquisitions / divestitures | **0.00** | `Q2'26 interim statements, Note 35, p.44` — Banco Porto Real is post-quarter, licence-only, pending BCB approval |
| **Other (residual)** | **−3.84** | Basis mismatch between the ARPAC denominator and the customer count, plus rounding in the published ARPAC levels — see §6a |
| **Total revenue growth** | **+50.29** | `Q2'26 interim statements, Statements of Income, p.6` |

### 6.2 Line-item decomposition (a second, exact view from the filing)

This one needs no modelled ratio at all — every figure is a reported number, and the components tie to the total with **zero residual**. `[Q2'26 interim statements, Note 6(a) and 6(b), p.16]`

| Income line | Q2'26 | Q2'25 | Change | Contribution to the +50.29% (pp) |
|---|---:|---:|---:|---:|
| Interest income — credit card | 1,805,581 | 1,091,598 | +713,983 | **+19.46** |
| Interest income — loan | 1,734,365 | 1,128,020 | +606,345 | **+16.53** |
| Interest income — other assets at amortised cost (float) | 765,339 | 498,610 | +266,729 | +7.27 |
| Credit and prepaid card income (interchange) | 534,970 | 392,568 | +142,402 | +3.88 |
| Interest and gains — instruments at fair value | 363,558 | 296,219 | +67,339 | +1.84 |
| Late fees | 136,801 | 90,193 | +46,608 | +1.27 |
| Other fee and commission income | 70,455 | 48,473 | +21,982 | +0.60 |
| Insurance commission | 10,409 | 8,493 | +1,916 | +0.05 |
| Interest income — other receivables | 88,347 | 94,175 | **−5,828** | **−0.16** |
| Other income at fair value | 3,383 | 20,121 | **−16,738** | **−0.46** |
| **Total revenue** | **5,513,208** | **3,668,470** | **+1,844,738** | **+50.29** |

**Read:** credit-card interest and loan interest together contributed **+35.99pp of the +50.29pp — 71.6% of all the growth.** Float/treasury income added +7.27pp, interchange +3.88pp. Two lines went backwards. This view is exact but it is *not* a driver story: it says which income lines grew, not whether they grew on volume, price or currency. That is what 6.1 and 6a are for.

---

## 6a. Decomposition Attribution and Residual (MODULE_RULES "Driver Attribution" / §15)

Every component of §6.1 that was derived from a quoted ratio, with the multiplication printed and the ratio's basis named.

```
Volume — customer count: 123m (Q2'25) → 139m (Q2'26) = +13.02%, taken as +13.00%
  [Q2'26 Earnings Presentation, Aug-13-2026, slide 6; Q2 2026 transcript, Aug-13-2026]
  Contribution = 13.00pp of the 50.29pp observed growth
  → BASIS: a headcount of TOTAL customers at each period end. It is a unit count, so it carries
    no currency. Asserted from disclosure, no ratio applied.

Price / monetisation — ARPAC, FX-neutral +22% YoY
  [Q2'26 Earnings Presentation, Aug-13-2026, slide 28]
  1.1300 (customers) x 0.22 (FX-neutral ARPAC growth) = 0.2486
  = +24.86pp of the 50.29pp observed growth
  → BASIS MISMATCH, STATED NOT HIDDEN: the published ARPAC ratio is measured as total revenue
    divided by the AVERAGE number of INDIVIDUAL ACTIVE customers in the period. The customer row
    above is TOTAL customers at period end, including the ~6.8m small businesses ARPAC excludes.
    The two denominators are not the same population, so multiplying the rows overstates the
    product. I do not net that away into another component — it is the main part of the residual
    below. I also refuse to apply the +22% FX-neutral ARPAC figure to an as-reported base: the
    currency effect is carried in its own row, once.

FX translation — BRL average rate R$5.6625 (Q2'25) -> R$5.0496 (Q2'26)
  [Q2'26 Earnings Presentation, Aug-13-2026, Non-IFRS Financial Measures, pp.34-35]
  5.6625 / 5.0496 = 1.1214, i.e. the real appreciated 12.14% on the period-AVERAGE rate
  Constant-currency revenue growth = 1.5029 / 1.1214 - 1 = +34.02%
  FX contribution = 1.3402 x 0.1214 = 0.1627
  = +16.27pp of the 50.29pp observed growth
  → BASIS: the AVERAGE rate for the quarter, which is the correct basis for an income-statement
    flow (CLAUDE.md §27). I refuse to use the Jun-30-2026 SPOT rate of R$5.1617 here: that is the
    balance-sheet basis and the deck itself uses it only for deposits and the interest-earning
    portfolio. Applying it to a revenue flow would be the same class of error as using a
    period-end rate on a full-year income line.
  → SCOPE CAVEAT, NOT NETTED AWAY: this applies the BRL move to 100% of revenue, whereas roughly
    9% of revenue is Mexican peso and Colombian peso (Note-34 base: Brazil 91.08%, Mexico 7.18%,
    Other 1.74%). To the extent MXN and COP moved less than BRL, this row is slightly too large
    and the residual slightly too negative.

Blended credit yield (used in §3 and §4, not a §6.1 row)
  Card + loan interest: Q2'25 2,219,618k; Q2'26 3,539,946k  [Q2'26 interim statements, Note 6(a)]
  Average total gross portfolio: Q2'25 (24.1 + 27.3)/2 = US$25.7bn; Q2'26 (37.2 + 39.4)/2 = US$38.3bn
    [Q2'26 Earnings Presentation, slide 13]
  Yield = 2,219.6 / 25,700 x 4 = 34.55% ; 3,539.9 / 38,300 x 4 = 36.97%  (+242bps)
  Cross-check: 1.4903 (portfolio) x 1.0700 (yield) = 1.5946 = +59.46% vs the actual card+loan
  interest growth of +59.49%. Residual 0.03pp.
  → MIXED-BASIS WARNING (CLAUDE.md §15): the numerator is a FLOW translated at average rates; the
    denominator is period-END balances translated at closing rates, gross of provisions, and
    includes non-interest-earning transactor card balances. Both bases are labelled here every
    time the figure appears. It is an approximate blended yield, NOT the company's own
    interest-earning-portfolio yield, which is not disclosed quarterly in this pool.

Acquisitions / divestitures: 0.00pp
  → Asserted from disclosure, no ratio applied. Banco Porto Real is a post-quarter-end,
    licence-only agreement pending Brazilian Central Bank approval; Nubank N.A. is not operating.
    [Q2'26 interim statements, Note 35, p.44]
```

**Reconciliation.** Sum of the named components = 13.00 + 24.86 + 16.27 + 0.00 = **+54.13pp**, against the stated Total of **+50.29pp**. The gap is **−3.84pp**, and it is the residual, quantified in the "Other" row rather than rounded away. It is **7.6% of the observed growth** — the decomposition explains the great majority of the move, but not all of it, and the residual runs in a direction that says the customer × ARPAC product is slightly too generous.

**The upstream disagreement, adjudicated by name rather than averaged (CLAUDE.md §3).** Upstream `01_historical-financials` put the currency share at *"roughly a fifth"* of the Q2'26 YoY rate. That figure comes from comparing the company's FX-neutral **gross revenue** growth of **+39%** with IFRS total revenue growth of +50.3%, which gives an FX contribution of about **+11.3pp** (22% of the move). My figure is **+16.27pp** (32% of the move). Both are defensible and the difference is definitional, not a dispute about facts:
- `01`'s read compares a **company-defined, non-IFRS "Gross Revenue"** measure (Q2'25 US$3,772m → Q2'26 US$5,876m on the deck's own series, i.e. +55.78% as reported) against **IFRS total revenue** growth. Those are two different top lines, so the subtraction mixes bases.
- Notably, the deck's own series is internally consistent with my rate arithmetic: 1.5578 ÷ 1.39 = **1.1207**, an implied FX factor of **+12.07%**, against the actual BRL average-rate move of **+12.14%**. Two independent reads of the currency effect agree to within 7 basis points.
- My read applies that measured rate move to the whole IFRS revenue base, which is slightly too wide because ~9% of revenue is MXN/COP.

**So the honest range for the FX contribution is +11.3pp to +16.3pp of the +50.3pp, i.e. between a fifth and a third of the reported growth.** I use +16.27pp in the table because it is built from the actual average exchange rate on a matched (income-statement, average-rate) basis, and because when reads of equal quality disagree the more conservative one governs (§4) — here the conservative read is the one that leaves less growth attributable to the business. Upstream's "roughly a fifth" qualifier travels with this and is not overwritten.

RF-EARN-001: revenue decomposition reconciled — explained 54.1pp, residual -3.8pp, total 50.3pp

---

## 6b. Cycle Position (Cycle-Position Rule)

NU is a consumer lender, which `business-model/10_external-dependency.md` scores **High** on both the interest-rate cycle and the consumer-credit cycle. That output does not put a peak/mid/trough label on the latest quarter; I do, and I flag rather than merge the difference.

**Where Q2'26 sits: at or very near a cyclical high on profitability, and NOT a normalised run-rate.** The evidence:
- **Risk-adjusted NIM 12.4% is a record** and the top of its own six-quarter series (9.3%, 9.9%, 10.8%, 10.5%, 9.5%, **12.4%**). NIM 22.9% is likewise the top of its series (18.6%–22.9%). `[Q2'26 Earnings Presentation, slide 15]`
- **First quarter in the company's history above US$1bn of net income** (US$1,061m), ROE 33%. `[Q2 2026 transcript, prepared remarks; Q2'26 Earnings Presentation, slide 23]`
- Against that, **90+ day non-performing loans at 6.9% are the highest in the 13-quarter series** the deck shows (Q2'23 5.8% → Q2'26 6.9%), so asset quality is not at a cyclical best — profitability and credit quality are pointing in opposite directions. `[Q2'26 Earnings Presentation, slide 17]`

**One-time tailwinds in the latest period, labelled non-run-rate:**
1. **Desenrola, the Brazilian government debt-renegotiation programme.** CFO: *"Desenrola… impacted this number by just about 5%"* of cost of credit, and *"we've already seen more than 4/5 of that hitting us in or benefiting us in Q2"*, with *"a little bit more impact… in Q3"*. About **one third** of the risk-adjusted-NIM beat versus management's own Q1 expectation came from it. This is a **policy tailwind that mostly does not repeat** — and note precisely what it touches: it flatters **cost of credit and therefore gross profit and risk-adjusted NIM, not revenue.** `[Q2 2026 transcript, prepared remarks and Q&A — Rob Livingston]`
2. **BRL appreciation of 12.14% year on year.** A translation tailwind, not demand. Spot at Jun-30-2026 (R$5.1617) was already 2.2% weaker than the quarter's own average, so the same rate held flat gives less help next quarter. `[Q2'26 Earnings Presentation, pp.34–35]`
3. **A high Brazilian policy rate.** Selic 15.00% at the 20-F date and average CDI 14.3% in 2025 versus 10.8% in 2024 support the float/treasury line (13.88% of revenue, +53.5% YoY). A cutting cycle shrinks that line. The pool holds no rate reading after Apr-08-2026 — the current level is unknown, not assumed. `[FY2025 20-F, Item 3.D and Item 5]`

**Stated plainly: the Q2'26 margin and profitability numbers are not a normalised run-rate.** The revenue line itself is less cycle-flattered than the profit line, because the biggest one-off (Desenrola) sits below revenue — but the currency component of revenue is fully a cycle effect. Downstream modules should not treat Q2'26 risk-adjusted NIM of 12.4% or reported revenue growth of +50.3% as a baseline.

One genuine offset, evidence-based: with a claimed 7% share of a US$100bn profit pool, growth need not come from the cycle. *"we're still a small player in that big market, and we get to cherry pick our customers"* `[Q2 2026 transcript, Q&A — David Vélez]`. Both the 7% and the US$100bn are management estimates, not filed figures.

---

## 7. The Single Biggest Revenue Driver

**The Brazilian real against the US dollar.** On the equal-move test this section asks — which driver, moved 10–20%, does most to reported revenue — nothing else is close. Roughly **90% of revenue is earned in non-USD currencies** (Brazil is 91.08% of the Note-34 revenue base, and the treasury income outside that base is also predominantly Brazilian), so revenue's sensitivity to the currency is close to one-for-one: a **10% move ≈ 9.0% of revenue, about US$496m in a quarter at Q2'26 scale; a 20% move ≈ 18%, about US$992m.** `[Q2'26 interim statements, Note 34(b), p.43; Q2'26 Earnings Presentation, pp.34–35]` The next-largest lever is the credit portfolio itself, where card and loan interest is 64.21% of revenue, so a 10% move in the book at constant yield is **6.4% of revenue (~US$354m)** and a 20% move is 12.8% — real, but roughly two-thirds of the currency's leverage on the same size of move.

**Its current direction: a fading tailwind.** The real appreciated **12.14%** on the quarterly average (R$5.6625 → R$5.0496) and that alone contributed **+16.27pp of the +50.29pp** of reported revenue growth. But the spot rate at Jun-30-2026 was **R$5.1617 — 2.2% weaker than the quarter's own average** — so if spot merely holds, Q3'26 translates less favourably than Q2'26 did, and the year-ago comparison base is getting harder. The pool contains no BRL reading after Jun-30-2026, so the *current* level is **not proven from available data**; what is proven is that the tailwind was already smaller at quarter-end than the quarter average implies.

**Two honesty checks this paragraph has to pass.** First, the arithmetic behind the claim: the FX component is derived above and printed, and it is **32% of the observed growth**, so it is not "the bulk" of the move and I do not call it that — it is the single largest *sensitivity*, not the majority *contributor*. Second, no component of the §6.1 decomposition on its own clears half the growth: monetisation (ARPAC) is the largest contributor at **+24.86pp, or 49.4%** — just under half — and it is itself a composite of yield, product mix and fee take rather than one clean driver. The decomposition reconciles to a **−3.84pp residual (7.6% of the move)**, which is small enough to support naming a biggest driver, but the naming is a claim about *sensitivity per unit of move*, not about which line did most of the work in Q2'26. What did most of the work in Q2'26 was, in order, monetisation per customer (+24.86pp), currency (+16.27pp) and customer count (+13.00pp) — and on the exact line-item view, credit-card and loan interest together (+35.99pp, 71.6% of all growth).

---

## 8. Data Limitations

- **Segment-level P&L does not exist.** One reportable segment, no country or product profit disclosure. Geographic revenue is on a base covering 79.5% of IFRS total revenue.
- **Mexico's growth cannot be split into currency and operating growth** — the pool has no Q2'25 MXN average rate.
- **No interest-earning-portfolio and no purchase-volume quarterly figures** were extracted, so the yield in §6a is a blended gross-portfolio yield and interchange growth cannot be split into volume versus take rate.
- **No Brazilian policy-rate reading after Apr-08-2026** in the pool; the current Selic/CDI level is not assumed.
- **No quantitative company guidance** for revenue exists (`04_guidance-consensus` confirms no revenue or EPS guidance was given on the Q2'26 call), so no forward driver level is management-anchored.
- **Verbatim transcripts are available** (19 consecutive calls through Q2 2026), so no transcript-proxy limitation applies and no MODULE_RULES score cap binds on this agent's inputs.
- QoQ analysis is available and used — quarterly data is present, so the no-quarterly-data rule does not apply.

---

## 9. Citations

`[FY2025 Form 20-F (filed Apr-08-2026), Note 34 (Segment information), p.F-97]` — single reportable segment; FY2025 geographic revenue base.
`[FY2025 Form 20-F, Note 35(a), p.F-98]` — Nubank N.A. conditional OCC approval, Jan-29-2026.
`[FY2025 Form 20-F, Item 3.D]` — Selic 15.00% as of the annual-report date; Brazil credit-rating and fiscal risk factors.
`[FY2025 Form 20-F, Item 4.B, Revolving Credit and Interest Rate Regulations]` — Lei 14.690/2023 and CMN Res. 5.112/2023 card-charge cap, applied throughout 2024 and 2025.
`[FY2025 Form 20-F, Item 5, macroeconomic indicators table]` — Brazil GDP growth 2.3% (2025) vs 3.4% (2024); unemployment 5.1% vs 6.2%; average CDI 14.3% vs 10.8%.
`[FY2025 Form 20-F, Key Business Metrics — Activity Rate]` — activity rate 83.4% / 83.0% / 83.1%.
`[Q2'26 unaudited interim condensed consolidated financial statements (filed Aug-14-2026), Consolidated Statements of Income, p.6]` — total revenue 5,513,208 (Q2'26) and 3,668,470 (Q2'25); net income to parent 1,060,199.
`[Q2'26 interim statements, Note 6(a) and 6(b), p.16]` — the ten income lines used in §2 and §6.2, three-month columns for 06/30/2026 and 06/30/2025.
`[Q2'26 interim statements, Note 33(a)(b)(c), pp.42–43]` — regulatory capital by entity (Brazil 5,597,604 of 6,204,917).
`[Q2'26 interim statements, Note 34(b), p.43]` — geographic revenue Q2'26/Q2'25 and H1'26/H1'25; non-current assets.
`[Q2'26 interim statements, Note 35 (Subsequent events), p.44]` — Banco Porto Real share purchase agreement (Jul-20-2026, licence acquisition, pending BCB approval); Mexico CNBV authorisation Jul-09-2026, operating as a bank from Aug-06-2026.
`[Q2'26 Earnings Presentation, Aug-13-2026, slide 6]` — customers 65/84/105/123/139m at Q2'22–Q2'26; ARPAC; efficiency ratio; the "customers × ARPAC" formula.
`[Q2'26 Earnings Presentation, slide 13]` — total credit portfolio US$39.4bn, +37% YoY FX-neutral, +5% QoQ; cards US$26.0bn +35%, unsecured US$10.3bn +45%, secured US$3.1bn +30%; portfolio mix by product Q1'25–Q2'26.
`[Q2'26 Earnings Presentation, slide 14]` — deposits US$45.3bn (+18% YoY FX-neutral, +6% QoQ), Brazil 36.4 / Mexico 5.7 / Colombia 3.3; cost of deposits 88% of the interbank rate (91% a year earlier).
`[Q2'26 Earnings Presentation, slide 15]` — NII US$3,687m; NIM 19.2/18.8/18.6/19.5/21.1/22.9%; risk-adjusted NIM 9.3/9.9/10.8/10.5/9.5/12.4%; cost of credit by quarter.
`[Q2'26 Earnings Presentation, slide 16]` — risk-adjusted NIM QoQ walk; average loan-to-deposit ratio 50% / 54% / 58%.
`[Q2'26 Earnings Presentation, slide 17]` — NPL 15–90 and 90+ series, Q2'23–Q2'26.
`[Q2'26 Earnings Presentation, slide 21]` — company-defined Gross Revenue US$3,373/3,772/4,317/4,857/5,316/5,876m (Q1'25–Q2'26), +39% YoY FX-neutral in Q2'26.
`[Q2'26 Earnings Presentation, slide 23]` — net income and ROE by quarter; ROE 33% in Q2'26.
`[Q2'26 Earnings Presentation, slide 28]` — monthly ARPAC US$11.6/12.5/13.8/15.0/15.9/17.1 (Q1'25–Q2'26), +22% YoY FX-neutral; cost to serve.
`[Q2'26 Earnings Presentation, Non-IFRS Financial Measures — FX-Neutral methodology and FX Rates, pp.34–35]` — average USD/BRL R$5.0496 (Q2'26) and R$5.6625 (Q2'25); spot R$5.1617 at Jun-30-2026; monthly MXN and COP rates for Mar–May 2026.
`[Q2 2026 earnings-call transcript, Aug-13-2026 (S&P Global Market Intelligence), prepared remarks]` — 139m customers, ~118m Brazil, >5m Colombia, 16m Mexico at end-July; activity rate 83.5%, Brazil above 86%; portfolio and deposit commentary; NIM +180bps to 22.9%; Desenrola ~5% of cost of credit; NPL commentary; ~US$30bn Brazil mass-market industry gross profit pool.
`[Q2 2026 earnings-call transcript, Aug-13-2026, Q&A]` — 7% share of the profit pool; Desenrola "more than 4/5" already recognised in Q2 and about one third of the risk-adjusted-NIM outperformance; mix-shift explanation of NPL; private-payroll pace.
`[analyses/NU_2026-09-06/business-model/03_segment-map.md]` — cross-module segment structure, the Note-34 revenue-base caveat, and the flag on management's Mexico-versus-Brazil ARPAC claim.
`[analyses/NU_2026-09-06/business-model/10_external-dependency.md]` — interest-rate and consumer-credit-cycle exposure ratings used in §6b.
`[analyses/NU_2026-09-06/earnings/01_historical-financials.md]` — revenue baseline and the FX qualifier adjudicated in §6a.
`[analyses/NU_2026-09-06/earnings/04_guidance-consensus.md]` — confirmation that no revenue guidance exists; FQ3'26 consensus revenue mean US$5,936.74m (`Capital IQ Estimates→Consensus`, data as of Aug-2026).

**Not used as a source for any number:** `NU_Holdings_Deep_Dive_15_Page_Memo_30_Aug_2026.pdf` (verdict-bearing prior in-house memo; verdict stripped per CLAUDE.md §24).
