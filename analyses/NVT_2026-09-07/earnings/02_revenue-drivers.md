# Revenue Drivers — NVT

**Company:** nVent Electric plc (NYSE: NVT). **Regime:** US SEC domestic filer (Irish-incorporated, London head office) — Form 10-K / 10-Q, **US GAAP**, reporting currency **USD in millions**, fiscal year ends 31 December [`FY24 10-K, cover page`; `Q2 FY26 10-Q, cover page`]. No FX conversion is performed anywhere in this report.

**Evidence binding:** frozen generation `6db32848…1aecd1e6`. Live `data/NVT/` was not read; `data/NVT/…` is a citation label only.

**Upstream baseline:** `analyses/NVT_2026-09-07/earnings/01_historical-financials.md` — TTM revenue to 30-Jun-2026 **$4,834.0m, +46.2%** on the prior TTM of $3,306.6m. That agent's own instruction to this one is followed here: *"This is not all organic … the revenue-drivers agent must decompose this rather than quote the headline."*

**Plain-English terms used below.** *Organic growth* = the change in sales excluding businesses bought or sold and excluding currency translation — the underlying demand number. *Acquisition contribution* = sales from a business owned this year but not in the year-ago period. *Currency / FX translation* = the effect of converting foreign sales into US dollars at different exchange rates, with no change in the goods sold. *Backlog* = orders received but not yet delivered as sales. *Book-to-bill* = orders taken divided by sales delivered; above 1.0x the order book is growing, below 1.0x it is shrinking. *pp* = percentage point.

---

## 1. Segment Decomposition Status

**Segment decomposition applied — 2 segments from the business-model module** (`analyses/NVT_2026-09-07/business-model/03_segment-map.md`, read in full).

The two reportable segments are **Systems Protection** (72.5% of H1 FY26 sales) and **Electrical Connections** (27.5%) [`Q2 FY26 10-Q, Note 13 (Segment information), p.20`]. This is **not** a single-segment business by the >85% test, and the segment note discloses net sales, cost of goods sold, SG&A, R&D and segment income by segment, so no consolidated-only limitation applies.

Two disclosure limits carry into everything below and are stated once here:

- **The reportable segments are not the driver.** The thing moving this company — data centres — is a *vertical* that cuts across both segments, and it is not a reportable line. It is visible only through the **infrastructure** vertical, which also contains power utilities and other non-data-centre work [`Q2 FY26 10-Q, Note 2 (Revenue), p.9`]. Management sizes data-centre sales at "more than $2 billion in 2026, more than double last year's sales" [`Q2 FY26 transcript (S&P Global, verbatim), 31-Jul-2026, prepared remarks`] — a transcript figure with no filed equivalent.
- **No FY2025 Form 10-K is in the pool**, so there is no audited FY2025 segment note. FY2025 segment figures are Capital IQ vendor data (tier 5). The H1 FY26 segment note is a filing but **unaudited** [`analyses/NVT_2026-09-07/earnings/00_earnings-data-triage.md`, §5].

---

## 2. Revenue Driver Tree

| Business Type | Revenue Formula |
|---|---|
| Manufacturer / producer | Volume × realized price |
| Subscription | Customers × ARPU / price |
| Retail | Store count × sales per store |
| Lender | Loan book × yield + fees |
| Asset manager | AUM × fee rate |
| Marketplace | GMV × take rate |
| Commodity producer | Production × realized commodity price |
| **Multi-segment (applies to NVT)** | **Sum of segment revenue drivers** |

NVT is a **two-segment electrical-equipment manufacturer with two different revenue rhythms inside it**: a long-cycle, project-and-backlog business (infrastructure, chiefly data centres and power utilities, sitting mostly in Systems Protection) and a short-cycle, distribution-fed business (commercial & residential and industrial, sitting mostly in Electrical Connections). The sector overlay that fits is capital goods / electrical equipment, so the required key measures are **order intake, backlog, book-to-bill, capacity and content per project** — not subscription or per-unit-price measures. Those are checked in §4; where the company does not disclose one at segment level, it is marked Not disclosed rather than estimated.

**NVT's revenue formula, in one line:**

> **Group revenue = [long-cycle infrastructure orders converted out of a $2.5bn backlog at whatever capacity is open × content per site] + [short-cycle industrial and commercial/residential volume pulled through distributors] + selective price increases taken to offset inflation + acquired revenue (Electrical Products Group through April 2026; Maverick Power from Q4 2026 if it closes) + FX translation.**

Backlog is disclosed at **group level only, and only on an earnings call** — $2.6bn at 31-Mar-2026, $2.5bn at 30-Jun-2026 [`Q1 FY26 transcript (FactSet Corrected Transcript), 1-May-2026, prepared remarks`; `Q2 FY26 transcript, 31-Jul-2026, prepared remarks`]. There is **no backlog, order-intake or book-to-bill figure by segment anywhere in this pool**, and none in any filing. For a business whose growth now runs through lumpy long-cycle project orders, that is the single largest disclosure gap in this section.

---

## 3. Market / Share / Price / Mix Split

Reference period: **Q2 FY26 (three months ended 30-Jun-2026) vs Q2 FY25**, the latest reported quarter. Total reported revenue growth **+52.8%** ($1,471.3m vs $963.1m) [`Q2 FY26 10-Q, Condensed Consolidated Statements of Income, p.3`].

| Driver Bucket | Current Direction | Evidence | Importance /100 |
|---|---|---|---:|
| **End-market demand** — AI data-centre and power-utility capital spending inside the infrastructure vertical | **Improving, sharply, but the leading indicator has stopped improving** | Infrastructure sales $882.5m vs $409.3m = +$473.2m, which is **49.1pp of the 52.8pp total growth (93.1% of every dollar added)** [`Q2 FY26 10-Q, Note 2, p.9`, arithmetic shown in §6a]. Against that: organic orders decelerated from "approximately 40%" in Q1 FY26 to "low double digits" in Q2, and backlog fell from $2.6bn to $2.5bn [`Q1 FY26 transcript, prepared remarks`; `Q2 FY26 transcript, prepared remarks`] | **95** |
| **Company market share / content per project** | **Improving on management's own metric; not independently verifiable** | "New products contributed over 30 points to our sales growth, and we launched 14 new products in the quarter" [`Q2 FY26 transcript, prepared remarks`] — up from "over 20 points" and 11 launches in Q1 [`Q1 FY26 transcript, prepared remarks`]. **The basis of "30 points" is not defined anywhere in this pool** and it overlaps the vertical attribution (a new liquid-cooling product sold to a data centre is counted in both), so it is NOT added into the §6 bridge. Third-party share data: none in this pool | **70** |
| **Price / realization** | **Positive but small, and not separately disclosed — it is an inflation offset, not a growth engine** | The 10-Q says organic growth "includes selective increases in selling prices" without sizing it [`Q2 FY26 10-Q, MD&A, p.27`]. The CFO frames price as defence: "Price plus productivity offset inflation of more than $50 million, including more than $30 million in tariff impact" [`Q2 FY26 transcript, prepared remarks`], and for Q3, "Pricing is expected to offset the impact of inflation, including tariffs" [same]. Upper bound derived in §6a | **30** |
| **Product / customer / geography mix** | **Shifting hard toward one vertical, one segment and one region** | Infrastructure went from 42.5% (409.3/963.1) to **60.0%** (882.5/1,471.3) of quarterly sales in one year [`Q2 FY26 10-Q, Note 2, p.9`]. Americas produced $479.1m of the $508.2m increase = **94.3%** of growth [`Q2 FY26 10-Q, Note 2, p.8`]. Systems Protection produced $440.1m = **86.6%** of it [`Q2 FY26 10-Q, MD&A, p.29`]. Mix does not add revenue by itself; it changes what the next dollar depends on | **45** |
| **FX translation** | **Fading tailwind; management's own guide implies it turns to a small drag in H2** | +2.1pp in Q1 FY26, **+0.5pp in Q2 FY26**, +1.2pp for H1 [`Q1 FY26 10-Q, MD&A, p.25`; `Q2 FY26 10-Q, MD&A, p.27`]. The FY26 guide implies roughly −$16m of non-organic revenue in H2 (arithmetic in §4a) | **15** |
| **M&A / divestitures** | **Contribution collapsing to zero in Q3, then stepping up again in Q4 if Maverick closes** | Electrical Products Group added $51.6m = **5.4pp** in Q2 FY26, down from $137.7m = **17.0pp** in Q1 [`Q2 FY26 10-Q, MD&A, p.27`; `Q1 FY26 10-Q, MD&A, p.25`]. It anniversaried on 1-May-2026 — "Sales from EPG after May 1 became part of our organic growth" [`Q2 FY26 transcript, prepared remarks`]. **Maverick Power**: $1.75bn purchase price plus up to $550m contingent, **estimated 2026 revenues of approximately $700 million**, expected to close in Q4 2026 subject to regulatory approval [`nVent press release "nVent to Acquire Maverick Power", 24-Aug-2026`] | **75** |

**This separation matters and is not decoration.** Of the 52.8pp of Q2 growth, **5.4pp was bought and 0.5pp was currency** — 5.9pp, or 11.2% of the increase, was not underlying demand. The remaining 46.9pp was organic. Nothing in this report describes acquired or currency-translated revenue as organic demand.

**Divestiture, for completeness:** Thermal Management was sold on 30-Jan-2025 for $1.6bn net cash and is a discontinued operation restated across all periods presented [`Q2 FY26 10-Q, Note 1, p.7`; `FY24 10-K, Note 6`]. It therefore does **not** appear as a negative in any growth rate above; FY2021 in the upstream table is the only period on the old basis.

---

## 4. Revenue Driver Table (consolidated)

Magnitude = how much the driver moves **total group revenue** if it changes by a reasonable amount. High = >5% of revenue; Mid = 2–5%; Low = <2%.

| Driver | Current Level | Direction | Magnitude | Evidence |
|---|---|---|---|---|
| **Data-centre demand** (inside infrastructure) | Guided **>$2.0bn of FY2026 sales**, "more than double last year's" (~$1.0bn in 2025) — roughly 37% of the ~$5,372m FY26 guidance midpoint (*derived from a transcript figure over a guidance range — inference, not from filings*) | **Improving** on sales; **Unknown / not confirmed** on forward orders (see backlog row) | **High** — a 20% move is ~$400m, ~7.4% of guided group revenue | `Q2 FY26 transcript, prepared remarks`; guidance range from same |
| **Infrastructure vertical total** (data centres + power utilities) | $882.5m = **60.0% of Q2 FY26 sales**, from 42.5% a year earlier; "nearly 60%" of H1 sales vs 45% in 2025 and 12% at the 2018 spin | **Improving** | **High** — it is 60% of the base and 93.1% of the growth | `Q2 FY26 10-Q, Note 2, p.9`; `Q2 FY26 transcript, prepared remarks` |
| **Order intake / book-to-bill** | Organic orders **"up low double digits"** in Q2 FY26, down from **"approximately 40%"** in Q1 FY26. Q1 book-to-bill ~1.2x (analyst-calculated on the call, not company-disclosed); **implied Q2 book-to-bill ~0.93x** (range 0.86x–1.00x — derivation in §6a) | **Deteriorating** | **High** — orders lead sales for the long-cycle book | `Q1 FY26 transcript, prepared remarks and Q&A (Nicole DeBlase)`; `Q2 FY26 transcript, prepared remarks` |
| **Backlog** | **$2.5bn at 30-Jun-2026**, down from $2.6bn at 31-Mar-2026; "visibility through the year and into 2027" | **Deteriorating** (down sequentially) | **High** — $2.5bn is ~47% of guided FY26 revenue | `Q2 FY26 transcript, prepared remarks`; `Q1 FY26 transcript, prepared remarks`. **Group level only, transcript only — no filed or segment figure exists in this pool** |
| **Capacity (liquid cooling)** | Three Minnesota sites: Anoka, Blaine 1 (opened early 2026, "effectively doubling our capacity", built in ~100 working days), **Blaine 2 announced 31-Jul-2026, opening H1 2027**, "of similar size" | **Improving** — but it is a constraint being relieved, not demand | **Mid** for FY2026 (Blaine 2 adds nothing until H1 2027); **High** for FY2027 | `Q2 FY26 transcript, prepared remarks` |
| **Acquired revenue — Electrical Products Group** | $51.6m = **5.4pp** in Q2 FY26; $189.3m = **10.7pp** for H1; anniversaried 1-May-2026 | **Deteriorating to zero** — contributes ~0 from Q3 FY26 | **Mid** in FY2026 (10.7pp of H1 growth), **Low** thereafter | `Q2 FY26 10-Q, MD&A, p.27`; `Q2 FY26 transcript, prepared remarks` |
| **Acquired revenue — Maverick Power** | Not yet owned. ~$700m estimated **2026 full-year** revenue for a business nVent would own for part of Q4 at best; close expected Q4 2026, subject to regulatory approval | **Improving from Q4 2026, conditional on close** | **High** — ~$700m is ~13.0% of guided FY26 revenue on a full-year basis | `nVent press release, 24-Aug-2026`. **Not in FY26 guidance and not in any consensus estimate in this pool** (`04_guidance-consensus.md` §7) |
| **Price / realization** | Not separately disclosed. Described as "selective increases in selling prices"; framed as an offset to ~$100m of FY26 tariff cost plus other inflation | **Improving marginally** | **Low–Mid** — upper bound ≤5.2pp of Q2 organic growth, almost certainly far less (§6a) | `Q2 FY26 10-Q, MD&A, p.27`; `Q2 FY26 transcript, prepared remarks` |
| **Short-cycle demand** (commercial & residential + industrial, through distribution) | Commercial & residential +2.2pp of group growth; industrial +1.4pp. Management: commercial resi "high single digits", industrial "low single digits", each guided to "mid-single digits for the year" | **Improving from a low base** — "stronger demand in our short-cycle business" was named as a reason Q2 beat guidance | **Mid** — 40.0% of Q2 sales but only 6.9% of Q2 growth | `Q2 FY26 10-Q, Note 2, p.9`; `Q2 FY26 transcript, prepared remarks` |
| **Geographic mix** | Americas $1,257.0m = 85.4% of Q2 sales and **94.3% of growth**; EMEA +1.3pp; Asia-Pacific +1.7pp | **Concentrating further into the Americas** | **Mid** | `Q2 FY26 10-Q, Note 2, p.8` |
| **FX translation** | +0.5pp in Q2 FY26 | **Deteriorating** — fading, and implied slightly negative in H2 | **Low** | `Q2 FY26 10-Q, MD&A, p.27` |
| **Customer concentration** | **Not proven from available data.** "No customer accounted for more than 10% of net sales in 2024, 2023 or 2022" — **no equivalent statement exists for FY2025 or FY2026 in this pool** | **Unknown** | **High if it has changed** — not assessable | `FY24 10-K, Note 15, p.70`; absence confirmed against the frozen pool |

**Drivers deliberately excluded as not applicable to NVT:** store count / distribution points (no owned retail estate), commodity spot price as a revenue driver (copper and steel are *inputs*, not the selling price — they belong to `03_margin-drivers`), utilization × installed capacity as a revenue formula (capacity constrains but does not set revenue here), contract renewals / retention (no subscription or recurring-contract base disclosed), regulatory or subsidy-driven volume (**no Inflation Reduction Act, CHIPS Act or Infrastructure Investment and Jobs Act reference appears anywhere in the frozen corpus** — per `10_external-dependency.md` §1A, no named policy programme may be claimed as a revenue driver for NVT).

### 4a. Cycle Position (MODULE_RULES Cycle-Position Rule)

**The latest reported quarter sits at or very near the PEAK of the AI data-centre capital-spending upswing, and it is not a normalised run-rate.** Evidence, in order of strength:

- **Organic growth of +46.9% in Q2 FY26 is far outside anything in the company's own history.** Reported revenue growth was +16.3% in FY2023 and +12.6% in FY2024 [`FY24 10-K, Consolidated Statements of Operations, p.40`], and those figures already included acquisitions. The current organic rate is roughly three times the best full-year *reported* rate this company has printed since the divestiture re-based it.
- **The mix shift is the cycle.** Infrastructure was 12% of sales at the 2018 spin, 45% in 2025, and "nearly 60%" of H1 2026 [`Q2 FY26 transcript, prepared remarks`]; on the filed quarterly numbers it is 60.0% of Q2 FY26 sales [`Q2 FY26 10-Q, Note 2, p.9`]. Data-centre sales are guided to more than double in a single year, to >$2bn.
- **The leading indicator has already rolled over while the lagging one is still accelerating.** Organic orders decelerated from ~40% to low double digits, and backlog fell $0.1bn sequentially, in the same quarter sales grew 46.9% organically [`Q1 FY26 transcript`; `Q2 FY26 transcript`, prepared remarks]. Management's explanation is that it deliberately converted backlog — "we worked hard in Q2 to really execute on that backlog" — and that data-centre orders are "large and lumpy", with "strong data center orders thus far in Q3" [`Q2 FY26 transcript, prepared remarks and Q&A`]. **That explanation is plausible and unverified.** It is management commentary about a quarter that has not been reported.
- **This read agrees with the business-model module** (`10_external-dependency.md` §3: "Partly externally driven" at the top of its range, one notch from "mostly externally driven"; the marginal dollar is "close to a pure bet on AI data-centre capital spending"). No divergence to flag.

**Items in the latest period that are NOT run-rate, labelled:**

- **The Electrical Products Group acquisition contribution is mechanically non-repeating.** It added 17.0pp in Q1 FY26 and 5.4pp in Q2, and goes to ~zero from Q3 because it anniversaried on 1-May-2026. Any forward growth rate built off H1's 53.1% reported rate without removing 10.7pp of acquisition and 1.2pp of currency is wrong by roughly 12pp.
- **The FX tailwind is fading and management's own guide has it turning negative in H2.** Arithmetic: FY26 guidance midpoint revenue = $3,893.1m × 1.38 = $5,372.5m, so total growth = $1,479.4m; organic at the 33% midpoint = $3,893.1m × 0.33 = $1,284.7m; implied non-organic for the full year = $194.7m. H1 already delivered $189.3m of acquisition plus $21.3m of currency = $210.6m. **Implied H2 non-organic contribution = 194.7 − 210.6 = −$15.9m** — a small currency drag and zero acquisition help. [Guidance from `Q2 FY26 transcript, prepared remarks`; FY2025 base revenue $3,893.1m from `Capital IQ Financials → Income Statement, 12m Dec-31-2025, vendor data as of ~12-Aug-2026`.] This is also the arithmetic proof that **Maverick Power is not in the FY2026 guide.**
- **No one-off policy or subsidy tailwind sits in the revenue line.** The $25.8m of IEEPA tariff *reimbursements* recognised in H1 FY26 is a gross-profit item, explicitly excluded from reportable segment income, and does **not** touch net sales [`Q2 FY26 10-Q, Note 13, p.19 and p.21`; `MD&A, p.28`]. It belongs to `03_margin-drivers`, not here. There is no GST-type tax change, no demand pull-forward from a rate cut, and no named subsidy programme in this pool.
- **Capacity was a live constraint through the period and is being expanded into the demand.** Blaine 1 opened at the start of 2026 and "will continue to ramp through this year"; Blaine 2 was announced on 31-Jul-2026 for H1 2027 [`Q2 FY26 transcript, prepared remarks`]. Fixed capacity is being committed against an order book management itself calls lumpy — that raises the cost of being wrong about the cycle, and it is why the cycle read matters downstream.

**Stated plainly: Q2 FY26 revenue is a peak-of-cycle print, not a normalised base.** Downstream modules must not treat +46.9% organic, 60% infrastructure mix, or 23.0% adjusted EBITDA margin as a run-rate starting point.

---

## 5. Revenue Drivers By Segment

Both segments are material (72.5% / 27.5% of H1 FY26 sales), so both are covered. Reference period is again Q2 FY26 vs Q2 FY25.

### Segment: Systems Protection (72.5% of H1 FY26 revenue; 72.9% of Q2 FY26 revenue)

Net sales $1,072.1m vs $632.0m = **+69.6%**; segment income $248.2m vs $137.1m = +81.0% [`Q2 FY26 10-Q, MD&A, p.29`].

| Driver | Current Level | Direction | Magnitude | Evidence |
|---|---|---|---|---|
| Infrastructure demand (data centres, power utilities) | Contributed **~62.5pp of the segment's 62.0pp organic growth** in Q2 (i.e. essentially all of it, with other verticals net-negative to rounding); infrastructure is $729.3m of the segment's $1,072.1m = 68.0% of segment sales | **Improving** | **High** — it is more than two-thirds of the segment | `Q2 FY26 10-Q, MD&A, p.29`; `Note 2, p.9` |
| Industrial and commercial & residential inside this segment | Both **"each flattish in the quarter"**; industrial $269.8m vs $266.0m (+1.4%), commercial & residential $73.0m vs $73.5m (−0.7%) | **Stable / flat** | **Low** | `Q2 FY26 transcript, prepared remarks`; `Q2 FY26 10-Q, Note 2, p.9` |
| Electrical Products Group acquisition | $45.2m = **7.2pp** in Q2; $166.2m = 14.6pp in H1. "Continued to exceed expectations, growing sales strong double digits year-over-year" | **Deteriorating to zero** from Q3 (anniversaried) | **Mid** | `Q2 FY26 10-Q, MD&A, p.29`; `Q2 FY26 transcript, prepared remarks` |
| Liquid-cooling capacity | Anoka + Blaine 1 (open, ramping) + Blaine 2 (H1 2027) | **Improving** | **Mid** in FY26, **High** in FY27 | `Q2 FY26 transcript, prepared remarks` |
| Currency | +0.4pp in Q2 | **Deteriorating** | **Low** | `Q2 FY26 10-Q, MD&A, p.29` |
| Price | Not separately disclosed — "includes selective increases in selling prices" | **Improving marginally** | **Low** | `Q2 FY26 10-Q, MD&A, p.29` |
| Maverick Power placement | **Not disclosed.** The release does not name the segment. Precedent: EPG's enclosures, switchgear and bus systems went "predominantly within our Systems Protection reporting segment" — *inference that Maverick lands here too, not from filings* | **Unknown** | **High if it lands here** | `nVent press release, 24-Aug-2026`; `Q2 FY26 10-Q, MD&A, p.24` |

**Segment growth check:** organic 62.0 + acquisition 7.2 + currency 0.4 = 69.6, which equals the disclosed total exactly; and $1,072.1 / $632.0 − 1 = **+69.64%**. Acquisition tie: $45.2m ÷ $632.0m = **7.15%** → the disclosed 7.2pp. Reconciled.

### Segment: Electrical Connections (27.5% of H1 FY26 revenue; 27.1% of Q2 FY26 revenue)

Net sales $399.2m vs $331.1m = **+20.6%**; segment income $108.8m vs $94.9m = +14.6% [`Q2 FY26 10-Q, MD&A, p.30`].

| Driver | Current Level | Direction | Magnitude | Evidence |
|---|---|---|---|---|
| Short-cycle distribution demand (commercial & residential) | $185.6m of $399.2m = 46.5% of segment sales; contributed **~6.5pp** of the segment's 17.9pp organic growth; "up low teens" | **Improving** | **Mid–High** for the segment; **Low** for the group (segment is 27% of sales) | `Q2 FY26 10-Q, MD&A, p.30`; `Note 2, p.9`; `Q2 FY26 transcript, prepared remarks` |
| Infrastructure pull-through (cable management into data centres) | Contributed **~8.5pp** of the 17.9pp organic growth; infrastructure $153.2m = 38.4% of segment sales, up from $116.8m | **Improving** | **Mid** | `Q2 FY26 10-Q, MD&A, p.30`; `Note 2, p.9` |
| Industrial | Contributed **~3.0pp**; $60.4m vs $50.6m | **Improving** | **Low** | `Q2 FY26 10-Q, MD&A, p.30`; `Note 2, p.9` |
| Electrical Products Group acquisition | $6.4m = **1.9pp** in Q2; $23.1m = 3.7pp in H1 | **Deteriorating to zero** from Q3 | **Low** | `Q2 FY26 10-Q, MD&A, p.30` |
| Seasonality | Demand rises in Northern-Hemisphere spring and summer; the company names this explicitly for this segment | **Stable pattern** — Q3 sits inside the seasonal-strong half | **Low–Mid** | `Q2 FY26 10-Q, MD&A, p.30`; `LIQUIDITY, p.30`: "We experience seasonal cash flows primarily due to increased demand for Electrical Connections products during the spring and summer months" |
| Currency | +0.8pp in Q2 — the larger of the two segments' currency effects | **Deteriorating** | **Low** | `Q2 FY26 10-Q, MD&A, p.30` |
| Price | Not separately disclosed; the CFO notes margin was "impacted by inflation and mix, partially offset by improving price and volume" | **Improving** | **Low** | `Q2 FY26 transcript, prepared remarks` |

**Segment growth check:** organic 17.9 + acquisition 1.9 + currency 0.8 = 20.6, equal to the disclosed total; and $399.2 / $331.1 − 1 = **+20.57%**. Acquisition tie: $6.4m ÷ $331.1m = **1.93%** → the disclosed 1.9pp. Reconciled. The two segments' acquisition dollars also tie to the group: $45.2m + $6.4m = **$51.6m**, the disclosed group figure.

**Neither segment is immaterial, so nothing is deferred as such.** The vertical acceleration in Electrical Connections is real (7.9% organic in Q1 FY26 → 17.9% in Q2) [`Q1 FY26 10-Q, MD&A, p.26`; `Q2 FY26 10-Q, MD&A, p.30`] and is the second-order piece of good news in the quarter — but at 27% of sales it moved the group by 7.1pp against Systems Protection's 45.7pp.

---

## 6. Revenue Growth Decomposition

**Period: Q2 FY26 (three months ended 30-Jun-2026) vs Q2 FY25.** All three components below are the company's **own disclosed split** in the 10-Q, not this agent's estimates.

| Component | Contribution to Growth (pp) | Evidence |
|---|---:|---|
| Volume (inside "Organic") | **not separable** | Company does not split organic between volume and price |
| Price (inside "Organic") | **not separable** | `Q2 FY26 10-Q, MD&A, p.27`: organic growth "includes selective increases in selling prices" — no figure given |
| **— Organic, volume and price combined** | **+46.9** | `Q2 FY26 10-Q, MD&A "Net sales", p.27` |
| Mix | **0.0 — no separate line** | Mix is *inside* organic here; it changes the composition of the 46.9pp, not the total. Its shape is quantified in §6a |
| FX | **+0.5** | `Q2 FY26 10-Q, MD&A, p.27` |
| Acquisitions / divestitures | **+5.4** | `Q2 FY26 10-Q, MD&A, p.27`; all of it the Electrical Products Group, $51.6m |
| Other | **0.0** (residual $0.1m on $508.2m of growth = 0.01pp) | Derived — see §6a |
| **Total revenue growth** | **+52.8** | `Q2 FY26 10-Q, MD&A, p.27`; independently checked: $1,471.3m ÷ $963.1m − 1 = **+52.77%** [`Statements of Income, p.3`] |

**Same decomposition for the first half (six months ended 30-Jun-2026 vs 2025), for the period the guidance is built on:** Organic **+41.2**, Acquisition **+10.7**, Currency **+1.2**, Total **+53.1** [`Q2 FY26 10-Q, MD&A, p.27`]. Independently checked: $2,713.3m ÷ $1,772.4m − 1 = **+53.09%**.

**What is NOT possible from this disclosure, stated rather than estimated:**
1. **A volume-versus-price split.** No filing, deck or transcript in this pool sizes price. A bound is derived in §6a; a point estimate is not available.
2. **A data-centre-only revenue line.** Data centres are not a reportable segment or a disclosed vertical; the >$2bn figure is a transcript number with no filed equivalent.
3. **A full-year FY2025 decomposition on filing evidence** — there is no FY2025 10-K in this pool.
4. **Any segment-level order, backlog or book-to-bill figure.**

---

## 6a. Decomposition Attribution and Residual (MODULE_RULES "Driver Attribution" / §15)

Every pp figure in §6 is a **reported number taken directly from the 10-Q's own components-of-change table**, not a figure this agent modelled from a ratio. Each is therefore recorded below in the "asserted from disclosure" form, and then independently re-derived from the filing's own dollar amounts so the reader can rebuild it.

```
Organic: Asserted from disclosure, no ratio applied. [Q2 FY26 10-Q, MD&A "Net sales", p.27]
  Cross-check in dollars: 46.9% x $963.1m (prior-year quarter net sales)
    = $451.7m of the $508.2m observed increase
  -> basis matches (both the ratio and the base are the same prior-year quarter, same
     continuing-operations basis, same segment scope)

Acquisitions: Asserted from disclosure, no ratio applied. [Q2 FY26 10-Q, MD&A, p.27]
  Cross-check from the filing's own dollar figure: $51.6m (Electrical Products Group sales
    in Q2 FY26 with no year-ago comparative) / $963.1m
    = 5.36% -> the disclosed 5.4pp of the 52.8pp observed growth
  -> basis matches. Segment tie: $45.2m (Systems Protection) + $6.4m (Electrical
     Connections) = $51.6m exactly [Q2 FY26 10-Q, MD&A, p.29 and p.30]

FX: Asserted from disclosure, no ratio applied. [Q2 FY26 10-Q, MD&A, p.27]
  Cross-check in dollars: 0.5% x $963.1m = $4.8m of the $508.2m observed increase
  -> basis matches

Mix: no pp figure claimed. Mix redistributes the organic block; it does not add to the total.
  Its shape, each computed on the SAME prior-year quarter base of $963.1m:
    Infrastructure vertical: ($882.5m - $409.3m) / $963.1m = +49.13pp
    Industrial vertical:     ($330.2m - $316.6m) / $963.1m =  +1.41pp
    Comm. & residential:     ($258.6m - $237.2m) / $963.1m =  +2.22pp
    Sum = 52.76pp vs the 52.77pp observed -> ties to 0.01pp
    [Q2 FY26 10-Q, Note 2 (Revenue), p.9]
  Note the basis limit: these vertical contributions are TOTAL (organic + acquired + FX),
  because Note 2 reports sales by vertical, not organic growth by vertical. They must NOT
  be compared with the organic-only 46.9pp line. The company's own organic-only vertical
  attribution, on the organic base, is ~44.0pp infrastructure and ~2.0pp commercial &
  residential of the 46.9pp organic [Q2 FY26 10-Q, MD&A, p.27] - leaving ~0.9pp of organic
  growth the filing does not attribute to a named vertical.
```

**Reconciliation to the stated Total.** 46.9 (organic) + 5.4 (acquisitions) + 0.5 (FX) = **52.8pp**, equal to the 10-Q's own stated Total of 52.8%. In dollars: $451.7m + $51.6m + $4.8m = $508.1m against the observed $508.2m increase, a residual of **$0.1m = 0.01pp**, which is rounding on percentages quoted to one decimal.

**The residual is near zero at the top level — and that is not the same as a fully understood bridge.** Two gaps sit *inside* the explained block and must travel with any downstream use of it:

1. **46.9 of the 52.8pp is a single undivided "organic" block that the pool cannot split between volume and price.** The only bound available: the CFO stated that "price plus productivity offset inflation of more than $50 million" in Q2 [`Q2 FY26 transcript, prepared remarks`]. If productivity contributed nothing (it did — the 10-Q names "increased productivity as a result of supply chain management and manufacturing efficiencies" [`MD&A, p.28`]), price would be at most ~$50m on the $963.1m prior-year base = **≤5.2pp of the 46.9pp organic**. That is a bound with zero mitigation assumed on the productivity side, **not an estimate** — *inference, not from filings*. The realistic figure is materially lower and is not knowable from this pool. **Volume is therefore the overwhelming majority of the organic block, but its exact share is not proven from available data.**
2. **~0.9pp of the organic block is unattributed by vertical** in the company's own MD&A (44.0 infrastructure + 2.0 commercial & residential = 46.0 of 46.9). Small, but it is stated rather than absorbed into infrastructure.

**Derived forward indicator — book-to-bill, with its precision stated.** Backlog is disclosed only rounded to $0.1bn. Q2 book-to-bill = 1 + (change in backlog ÷ quarterly sales) = 1 + (−$0.1bn ÷ $1,471.3m) = **~0.93x**. Because both backlog figures are rounded to the nearest $0.1bn, the true change lies between $0.00bn and $0.20bn, so the honest range is **0.86x to 1.00x** — below Q1's ~1.2x on any reading. *Derived from rounded transcript figures — inference, not from filings.* [`Q1 FY26 transcript`; `Q2 FY26 transcript`, prepared remarks; sales from `Q2 FY26 10-Q, p.3`.]

**One management metric deliberately kept OUT of the bridge.** "New products contributed over 30 points to our sales growth" [`Q2 FY26 transcript, prepared remarks`] cannot be added to the 52.8pp total: its base is not defined anywhere in this pool, and it double-counts against the vertical attribution (a new liquid-cooling product sold into a data centre appears in both). Adding it would have produced a bridge summing to well over 100% of the observed growth. It is reported in §3 as a company claim about content and share, and nowhere else.

RF-EARN-001: revenue decomposition reconciled — explained 52.8pp, residual 0.0pp, total 52.8pp

---

## 7. The Single Biggest Revenue Driver

**Data-centre capital spending, read through the infrastructure vertical, and the arithmetic supports naming it rather than hedging.** Infrastructure sales rose $473.2m in Q2 FY26, which is **49.1pp of the 52.8pp of observed growth — 93.1% of every incremental dollar** ($473.2m ÷ $508.2m), computed on the same prior-year quarter base as the total [`Q2 FY26 10-Q, Note 2, p.9`, arithmetic in §6a]. The company's own organic-only attribution says the same thing from the other side: ~44.0pp of the 46.9pp of organic growth came from infrastructure [`Q2 FY26 10-Q, MD&A, p.27`]. That clears the "roughly half" test by a wide margin, and the top-level bridge reconciles with a 0.01pp residual, so the claim is not resting on an unexplained gap. If data-centre sales — guided above $2bn of the ~$5,372m FY26 revenue midpoint — moved 10–20%, that is **$200m to $400m, or 3.7% to 7.4% of group revenue**, more than any other single driver in §4 can produce.

**Its current direction is genuinely two-handed, and both hands have to be shown.** On delivered sales it is accelerating: infrastructure organic growth "more than doubled" in Q2, data-centre sales are guided to more than double for the full year, and management raised FY26 organic growth guidance twice in five months (from +10–13% to +21–23% to +32–34%) [`Q2 FY26 transcript, prepared remarks`; `04_guidance-consensus.md` §2]. On the forward order book it is not: organic orders decelerated from ~40% to low double digits, backlog fell from $2.6bn to $2.5bn, and the implied Q2 book-to-bill of ~0.93x (range 0.86–1.00x) is below Q1's ~1.2x. **Naming the contradiction rather than averaging it:** the sales series and the order series point opposite ways in the same quarter, and only the sales series is filed — the orders and backlog figures exist solely in transcripts, at group level, with no segment split and no independent check. Management's reconciliation is that it deliberately drained backlog to protect lead times and that data-centre orders are lumpy, with Q3 orders "strong" so far [`Q2 FY26 transcript, prepared remarks and Q&A`]; that is an assertion about an unreported quarter and it is not verified by anything in this pool. The order series does not overturn the verdict — infrastructure still produced 93.1% of realised growth, and $2.5bn of backlog is still roughly 47% of guided FY26 revenue — but it does mean the case that this driver is still *accelerating* rests on delivered revenue and management commentary, not on the order book.

**What would most likely move revenue next, in order.** (1) The rate at which data-centre orders convert out of the $2.5bn backlog against newly opened Blaine capacity — this is the whole of Q3 and Q4. (2) **Maverick Power**: ~$700m of estimated 2026 revenue, expected to close in Q4 subject to regulatory approval, and — proven by the arithmetic in §4a — sitting entirely outside both the FY26 guidance and every consensus estimate in this pool. (3) The mechanical drop of the Electrical Products Group acquisition line to zero from Q3, which is why management's Q3 guide gives the *same* number for reported and organic growth (+32% to +35%) and why H2 growth has to be earned organically. Whether the guidance-implied Q4 revenue of $1,252.1m is prudence or a real step-down is the open question, and it belongs to `05_beat-miss-setup`.

---

## 8. Citations

All documents sit inside the frozen extract generation `6db32848…1aecd1e6`, cited under the logical label `data/NVT/`.

| # | Source |
|---|---|
| [1] | `FY24 10-K` (nVent Electric plc, Form 10-K, fiscal year ended 31-Dec-2024) — cover page; Consolidated Statements of Operations p.40; Note 6 (Discontinued Operations); Note 15 (Segment Information) p.69–71 |
| [2] | `Q1 FY26 10-Q` (quarter ended 31-Mar-2026, signed 1-May-2026) — MD&A "Net sales" components-of-change tables, p.25 (consolidated), p.26 (segments) |
| [3] | `Q2 FY26 10-Q` (quarter and six months ended 30-Jun-2026) — Condensed Consolidated Statements of Income p.3; Note 2 (Revenue: vertical and geographic net sales) p.8–9; Note 13 (Segment information) p.19–22; MD&A "Net sales" p.27, "Gross profit" p.28, Systems Protection p.29, Electrical Connections p.30, Liquidity p.30 |
| [4] | `Q1 FY26 earnings call transcript` (FactSet CallStreet, Corrected Transcript, verbatim), 1-May-2026 — prepared remarks and Q&A |
| [5] | `Q2 FY26 earnings call transcript` (S&P Global Market Intelligence, verbatim), 31-Jul-2026 — prepared remarks and Q&A |
| [6] | `nVent press release, "nVent to Acquire Maverick Power"`, 24-Aug-2026 |
| [7] | `Capital IQ Financials export → Income Statement tab`, 12m Dec-31-2025 column (FY2025 revenue $3,893.1m) — tier-5 vendor data, as of ~12-Aug-2026 — `nVent Electric plc NYSE NVT Financials.xls` |
| [8] | `analyses/NVT_2026-09-07/earnings/01_historical-financials.md` (upstream baseline) |
| [9] | `analyses/NVT_2026-09-07/earnings/04_guidance-consensus.md` (guidance path, consensus, Q4 implied) |
| [10] | `analyses/NVT_2026-09-07/earnings/00_earnings-data-triage.md` (pool inventory, partial-data flags) |
| [11] | `analyses/NVT_2026-09-07/business-model/03_segment-map.md` (segment structure) |
| [12] | `analyses/NVT_2026-09-07/business-model/10_external-dependency.md` (cyclicality and policy exposure) |
| [13] | `2026 William Blair Growth Stock Conference presentation`, 3-Jun-2026, slide 4 (FY2025 vertical mix) |

**Partial-data status: none applied.** Two verbatim transcripts, two 10-Qs with full segment notes and disclosed components-of-change tables, and quarterly actuals through FQ2 2026 are all present, so no MODULE_RULES score cap binds on this agent. No `external/` alt-data folder exists in this pool, so no external-data tier is cited; its absence is not a gap. The genuine limits carried forward are: no FY2025 Form 10-K (so no audited FY2025 segment note and no filing-grade FY2025 decomposition), no volume/price split at any level, no segment-level order intake or backlog, no data-centre revenue line in any filing, and no customer-concentration statement more recent than FY2024.

### Calculation provenance

Every percentage, pp contribution and dollar cross-check in §3, §5, §6 and §6a was computed from the filed dollar amounts cited beside it. Spot-checks reproduced: `1,471.3 / 963.1 − 1 = 52.77%`; `(882.5 − 409.3) / 963.1 = 49.13pp`; `(330.2 − 316.6) / 963.1 = 1.41pp`; `(258.6 − 237.2) / 963.1 = 2.22pp`; sum `= 52.76pp` against the 52.77pp observed; `51.6 / 963.1 = 5.36%`; `45.2 + 6.4 = 51.6`; `0.469 × 963.1 = 451.7`; `451.7 + 51.6 + 4.8 = 508.1` against the observed `1,471.3 − 963.1 = 508.2`; `2,713.3 / 1,772.4 − 1 = 53.09%`; `189.3 / 1,772.4 = 10.68%`; `3,893.1 × 1.38 = 5,372.5`, `3,893.1 × 0.33 = 1,284.7`, `1,479.4 − 1,284.7 = 194.7`, `194.7 − 210.6 = −15.9`.
