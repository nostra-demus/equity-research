# Margin Drivers — NHY

## 1. Segment Decomposition Status

Business-model `03_segment-map.md` is available and used. Norsk Hydro reports five operating segments (Hydro Bauxite & Alumina, Hydro Energy, Hydro Aluminium Metal, Hydro Metal Markets, Hydro Extrusions) plus an immaterial "Other and Eliminations" bucket, with full segment-level revenue, EBIT, EBITDA, Adjusted EBITDA, D&A, capex and assets disclosed in Note 1.4 of the FY2025 Integrated Annual Report [Integrated Annual Report 2025, Note 1.4, p.149-151]. No segment exceeds 85% of revenue or profit — Hydro Extrusions is the largest revenue segment (37.5% FY2025 external revenue) while Hydro Aluminium Metal is the largest profit segment (39.5% FY2025 Adjusted EBITDA) — so this is a genuine multi-segment decomposition, not a single-segment consolidated read [`business-model/03_segment-map.md`, §1-2]. Drivers are therefore decomposed by segment in §6 below, and the consolidated view (§2-5, §7-8) is built up from, and cross-checked against, the segment detail.

## 2. Cost Stack

**Sector overlay applied: Commodity producer / miner — margin analysis uses unit cash cost / price-cost spread grammar per `frameworks/SECTOR_OVERLAYS.md`, matching `business-model/02_business-identity.md` §3a's classification.** Hydro is a vertically-integrated producer across five linked commodity stages, so a single group-wide "AISC" figure does not exist — the closest disclosed proxies are segment-level implied unit costs, shown in Table A below. Table B supplements this with Hydro's actual audited nature-of-expense cost lines (there is no company-disclosed COGS/SG&A split — Hydro's IFRS income statement uses a "nature of expense" format), which is the only true group-wide cost breakdown this pool contains.

**Table A — Unit cash cost / price-cost spread proxies by segment (primary, sector-appropriate view)**

| Segment | Unit metric | Q1 2026 | Q1 2025 | Q4 2025 | Direction | Margin Risk |
|---|---|---:|---:|---:|---|---|
| Bauxite & Alumina | Realized alumina price (USD/mt) | 345 | 587 | 373 | Down 41% YoY | Alumina price sits near a multi-year low on an estimated 2.7-3.0 million tonne global oversupply for 2026 [Q1 2026 transcript, prepared remarks, p.5] |
| Bauxite & Alumina | Implied alumina cost (USD/mt) | 315 | 407 | 328 | Down 23% YoY (cost fell, cushioning the price drop) | Implied all-in EBITDA margin per mt fell from USD 180/mt (Q1'25) to USD 30/mt (Q1'26) — the price fell faster than cost [nhy-presentation-q1-2026.pdf, p.15] |
| Aluminium Metal | Realized aluminium price, LME (USD/mt) | 2,929 | 2,547 | 2,661 | Up 15% YoY, driven by a Middle East supply shock, not demand growth (see §6, Aluminium Metal) | [first-quarter-report-2026.pdf, p.7, Key financial data] |
| Aluminium Metal | Implied all-in primary cost (USD/mt) | 2,375 | 2,500 | 2,225 | Down 5% YoY (lower alumina cost input) | Smelting cash cost is 80-85% alumina, power and carbon anodes; Hydro's smelting placed at the 16th percentile of the global cost curve in 2025 (cheaper than 84% of global competitors) [`business-model/02_business-identity.md`, §2, §3a; integrated-annual-report-2025.pdf, p.14, 16] |
| Bauxite & Alumina (refining) | Cash-cost composition | Caustic soda, energy, coal ~85% of Alunorte's refining cash cost | — | — | n/a | Single-country input concentration: caustic soda from the USA, coal from Colombia [`business-model/06_value-chain.md`, §2; integrated-annual-report-2025.pdf, p.14] |

**Table B — Consolidated cost stack, nature-of-expense format (audited, group-wide, supplementary)**

| Cost Line | FY2025 (NOK mn) | % of Revenue | FY2024 (NOK mn) | % of Revenue | Change (bps) | Direction | Margin Risk |
|---|---:|---:|---:|---:|---:|---|---|
| Raw material and energy expense | 133,116 | 64.00% | 129,349 | 63.53% | +47 | Headwind (small) | Dominated by alumina, power, carbon anodes and caustic soda — see Table A for the unit-cost detail [Integrated Annual Report 2025, Note 5.3, p.187] |
| Employee benefits expense | 28,060 | 13.49% | 26,946 | 13.23% | +26 | Headwind (small) | Grew faster than revenue (+4.1% YoY vs revenue +2.1% YoY); partly offset by the restructuring of white-collar headcount underway since 2025 [Integrated Annual Report 2025, Note 9.2, p.6318 area; Note on restructuring, p.10240] |
| Depreciation and amortization | 10,328 | 4.97% | 10,131 | 4.97% | ~0 | Neutral | Flat as a share of revenue [Integrated Annual Report 2025, Note 2.4, p.135] |
| Impairment of non-current assets | 1,148 | 0.55% | 39 | 0.02% | +53 | One-off headwind | Driven by the five European Extrusions plants proposed for closure in 2025 [Integrated Annual Report 2025, p.6741, 7389] |
| Other expenses | 26,228 | 12.61% | 25,712 | 12.62% | ~0 | Neutral | Not further broken out in this pool |
| Freight / logistics | Not disclosed as a discrete line | — | — | — | — | — | Embedded in "Other expenses" and in the regional aluminium premiums Hydro realizes (e.g., higher oil prices compressing the U.S.-Europe Atlantic differential in Q1 2026) [Q1 2026 transcript, prepared remarks, p.4] |
| Interest expense | 2,357 | 1.13% | 2,734 | 1.34% | -21 | Tailwind (small) | Net interest expense fell YoY [Integrated Annual Report 2025, Consolidated income statement, p.6331] |
| **Total expenses** | **198,880** | **95.63%** | **192,176** | **94.37%** | **+126** | **Headwind** | Matches the reported EBIT margin decline from 8.10% to 6.92% (−118bps, §3) within rounding [Integrated Annual Report 2025, Consolidated income statement, p.6325-6327] |

Note: "Gross margin"/"SG&A" as CIQ-labelled line items do not correspond to any company-disclosed subtotal for Hydro (nature-of-expense format, no COGS/SG&A split) — Table B uses only the audited, company-disclosed expense lines instead, per the data-quality note already flagged in `01_historical-financials.md` §intro.

## 3. Gross Margin → EBITDA Margin → EBIT Margin Walk

The table below is retained (Hydro's raw-material-and-energy expense functions economically like a COGS line, so the ladder is meaningful) but is supplementary to Table A above, which is the sector-appropriate primary read.

| Margin Level | FY2025 | FY2024 | Change (bps) | Main Reason | Evidence |
|---|---:|---:|---:|---|---|
| Gross margin¹ | 35.99% | 36.48% | -49 | Raw material and energy expense grew slightly faster than revenue (64.00% vs 63.53% of revenue) | [Integrated Annual Report 2025, Note 5.3, p.187; `01_historical-financials.md` §1] |
| EBITDA margin (reported) | 12.36% | 13.03% | -67 | FY2025 included a larger negative swing in unrealized derivative timing (adjustment moved from -225 in FY2024 to +3,193 in FY2025, i.e., FY2025 reported EBITDA understates the underlying trend versus FY2024) plus higher restructuring/rationalization costs | [`01_historical-financials.md` §4] |
| EBIT margin (reported) | 6.92% | 8.10% | -118 | Same drivers as EBITDA, plus a larger FY2025 impairment charge (NOK 1,148mn vs NOK 39mn), concentrated in the five-plant Extrusions closure | [Integrated Annual Report 2025, Note 2.5, p.6322; `01_historical-financials.md` §1] |
| Adjusted EBITDA margin (company APM, quarterly) | 17.20% (Q1'26) | 16.67% (Q1'25) | +54 (YoY) | Recovered sharply after a Q4'25 trough (11.83%) on higher realized aluminium prices, stronger downstream/recycling margins, and normalizing eliminations — see §7 bridge | [`01_historical-financials.md` §3] |

¹ CIQ reclassification (revenue less raw material and energy expense), not a company-disclosed subtotal — flagged per `01_historical-financials.md`.

**Pass-through lag.** Hydro does not "pass through" costs to customers in a retail sense — it is a price-taker on both its main input (alumina, for the smelting segments) and its main output (LME aluminium) — but the pricing mechanisms carry stated, evidenced lags: alumina bought or sold externally is "priced with reference to alumina spot price indexes" with a one-month delay [Integrated Annual Report 2025, Note 8.2, p.186-187], and realized aluminium prices "lag the LME price developments by approximately 1.5-2 months," including the effect of Hydro's own LME strategic hedging program [first-quarter-report-2026.pdf, p.7, footnote 4]. This means a sudden LME move (such as the Q1 2026 spike from USD 2,995/mt to above USD 3,400/mt) shows up in realized results with a roughly 1.5-2 month delay, so its full effect is still flowing through into Q2 2026 rather than having been fully captured in the Q1 2026 print.

## 4. Margin Walk — Which Margin Level Matters Most?

**Adjusted EBITDA margin, read at the segment level, is the most useful metric for this business.** Reported EBITDA and EBIT are distorted quarter to quarter by large, non-cash, unrealized derivative mark-to-market swings on LME-linked contracts — the FY2023-FY2025 adjustment to EBITDA flipped sign each year (-1,033 in FY2023, -225 in FY2024, +3,193 in FY2025) and Q4 2025 reported EBITDA collapsed to NOK 1,974mn (a 4.2% margin) almost entirely on one such timing loss before recovering in Q1 2026 [`01_historical-financials.md` §3-4]. Gross margin is a CIQ-only construct with no company subtotal behind it. Adjusted EBITDA margin, and its segment-level Adjusted EBITDA components, is both the metric management itself uses to run the business (it is the profit-share basis in the segment map) and the metric least distorted by hedge-accounting timing — it is the right level to track whether the underlying price-cost spread, not derivative noise, is improving or worsening.

## 5. Margin Driver Table (consolidated)

| Driver | Impact on Margins | Direction | Magnitude | Evidence |
|---|---|---|---|---|
| LME aluminium price (incl. premiums) | Directly sets Aluminium Metal segment revenue per tonne; disclosed sensitivity +NOK 150mn Adjusted EBITDA per +USD 10/mt | Tailwind currently, but the Q1 2026 level (>USD 3,400/mt) is driven by a Middle East supply shock (curtailments plus closure of the Strait of Hormuz), not demand growth — **flagged as NOT run-rate; could reverse** | High (a USD 400/mt reversal implies roughly -NOK 6.0bn Adjusted EBITDA, ~21% of FY2025 Adjusted EBITDA) | [`business-model/10_external-dependency.md`, §2; Q1 2026 transcript, prepared remarks, p.4-5] |
| Alumina price | Directly sets Bauxite & Alumina segment revenue per tonne; index-linked with a one-month lag | Headwind — realized alumina price down 41% YoY (USD 587/mt to USD 345/mt) on an estimated 2.7-3.0 million tonne 2026 oversupply | High for Bauxite & Alumina (segment Adjusted EBITDA fell 85% QoQ to NOK 747mn); partially offset at group level because it lowers Aluminium Metal's input cost | [nhy-presentation-q1-2026.pdf, p.15; Q1 2026 transcript, prepared remarks, p.5] |
| USD/NOK exchange rate | Revenue is USD/LME-linked, cost base is mostly NOK; company-disclosed sensitivity NOK 4,900mn Adjusted EBITDA per NOK 1.00 move | Headwind — the Norwegian krone strengthened against the U.S. dollar through Q1 2026, cutting NOK-reported results by NOK 700mn QoQ | High (~17% of FY2025 Adjusted EBITDA for a NOK 1.00 move) | [`business-model/10_external-dependency.md`, §2, §5; Q1 2026 transcript, prepared remarks, p.6-7] |
| Energy and carbon costs (Aluminium Metal) | 80-85% of smelting cash cost is alumina, power and carbon anodes combined | Headwind — Q2 2026 guidance: energy costs +NOK 200-300mn, carbon costs +NOK 150-250mn versus Q1 2026, driven by coal/LME-linked power contracts and rising carbon prices | Mid | [Q1 2026 transcript, prepared remarks, p.7] |
| EU ETS free-allocation phase-out / CBAM | Turns CO2 into "a variable operational cost at plant level" for EU production as free allowances phase out 2026-2034; Norway's ICC compensation only runs through 2030 | Structural headwind, slow-moving; CBAM may partly offset via higher EU import-competing premiums, but the net effect on Hydro is management's own words "uncertain" | Mid, multi-year | [`business-model/10_external-dependency.md`, §1; integrated-annual-report-2025.pdf, p.52, p.3937-3940] |
| Extrusions demand (Europe/North America) | Largest revenue segment (37.5%); reported EBIT margin fell from ~4% (2020-2023) to -2.2% (2025) | Headwind, structural — European full-year 2026 extrusion demand growth cut to ~1% during the quarter; five European plants proposed for closure | High (this segment alone dragged group reported EBIT down materially in FY2025 via the impairment) | [`business-model/03_segment-map.md`, §1; Q1 2026 transcript, prepared remarks, p.5] |
| U.S. recycling spread (product premium vs. scrap price) | Benefits Metal Markets recycling and Extrusions' U.S. recycling operations | Tailwind currently — annualized run-rate recycling EBITDA rose from a theoretical NOK 1.8bn (cited at the Nov-2025 Investor Day) to an actual NOK 2.4bn run rate in Q1 2026, driven by the same Middle East supply shock widening premiums faster than scrap costs — **flagged as NOT fully run-rate**, though management expects the trend to continue into Q2 2026 | Mid (small in absolute NOK terms versus total group Adjusted EBITDA of NOK 28.9bn, but High for the segments it hits) | [Q1 2026 transcript, prepared remarks, p.5-6] |
| Improvement program (self-help cost savings) | Structural, controllable cost-out program: NOK 6.5bn cumulative target by 2030 vs. a 2024 baseline; NOK 1.4bn realized by end-2025 (versus a NOK 0.6bn target for the year — ahead of plan) | Tailwind, durable | Mid (~NOK 1bn/year average realization pace implied by the remaining NOK 5.1bn to 2030, against NOK 208bn FY2025 revenue ≈ ~50bps/year of margin if delivered at that average pace) | [integrated-annual-report-2025.pdf, p.1586-1607] |
| Fixed-cost seasonality / operating leverage | Volume-driven absorption of fixed costs, particularly in Extrusions and Bauxite & Alumina | Mixed — Q1 2026 saw NOK 550mn of favorable fixed-cost development (NOK 300mn lower in Extrusions, NOK 200mn lower in Bauxite & Alumina) QoQ, but Q2 2026 guidance flags B&A fixed costs rising NOK 300-400mn on seasonal maintenance | Mid | [Q1 2026 transcript, prepared remarks, p.6-7] |
| Unrealized derivative mark-to-market timing (non-cash) | Distorts reported (not Adjusted) EBITDA/EBIT quarter to quarter; sign flips year to year (-1,033 FY2023, -225 FY2024, +3,193 FY2025) | Unknown/volatile — not a directional driver of underlying margin, but a large source of reported-margin noise | High on reported metrics specifically (drove the Q4 2025 reported-EBITDA collapse to a 4.2% margin) | [`01_historical-financials.md` §3-4] |
| Curtailments (Qatalum ~40%, Slovalco fully curtailed) | Reduces primary-aluminium volume | Headwind on volume, partly offset by the higher price environment that is itself linked to the same supply disruption | Mid | [Q1 2026 transcript, prepared remarks, p.4, 128] |

## 6. Margin Drivers By Segment

### Segment: Hydro Bauxite & Alumina (16.6% revenue / 32.3% Adj. EBITDA FY2025; fell to a much smaller share in Q1 2026)

| Driver | Impact | Direction | Magnitude | Evidence |
|---|---|---|---|---|
| Alumina price (index-linked, ~1-month lag) | Sets segment revenue directly | Headwind — realized price down 41% YoY (USD 587/mt → USD 345/mt); segment Adjusted EBITDA fell from NOK 5,135mn (Q1'25) to NOK 747mn (Q1'26), an 85% drop | High | [`business-model/03_segment-map.md`, §1; nhy-presentation-q1-2026.pdf, p.15] |
| Implied alumina cost (bauxite, energy, caustic soda ≈85% of cash cost) | Cushions the price decline | Tailwind — implied cost fell from USD 407/mt to USD 315/mt YoY | Mid-High | [nhy-presentation-q1-2026.pdf, p.15; `business-model/02_business-identity.md` §2] |
| BRL/USD, BRL/NOK currency | Alunorte and Paragominas costs are Brazil-based | Headwind — a stronger BRL was cited as a drag on Q1 2026 YoY results | Mid | [Q1 2026 transcript, prepared remarks, p.6-7 area, results bullet] |
| Fixed-cost seasonality | Seasonal maintenance and social-investment timing in Brazil | Headwind into Q2 2026 — guided +NOK 300-400mn | Low-Mid | [Q1 2026 transcript, prepared remarks, p.7] |
| Improvement program | Debottlenecking at Alunorte plus commercial performance | Tailwind — largest single-segment contributor to the NOK 1.4bn realized to date (NOK 0.7bn of it) | Mid | [integrated-annual-report-2025.pdf, p.1586-1607] |

### Segment: Hydro Energy (2.4% revenue / 14.4% Adj. EBITDA FY2025)

| Driver | Impact | Direction | Magnitude | Evidence |
|---|---|---|---|---|
| Nordic hydrology / power price | Roughly half the ~18 TWh/year portfolio is captive hydropower | Headwind currently — Q1 2026 Adjusted EBITDA fell to NOK 780mn from NOK 1.2bn Q1'25 on lower production (maintenance) and loss of price-area differences | Mid | [Q1 2026 transcript, prepared remarks, p.8-9 area] |
| Long-term contract book | New Statkraft (0.88 TWh, 2029-2038; 0.44 TWh, 2031-2038) and Alpiq (0.22 TWh, 2031-2038) contracts signed in Q1 2026 | Tailwind for medium-term revenue visibility, not near-term margin | Low near-term | [nhy-presentation-q1-2026.pdf, p.5-6] |
| Brazilian hydrology | Weak rainfall raised local power prices/costs in 2025 | Headwind, structural risk — precedent set by the full Tomago (Australia) impairment on power-contract-expiry uncertainty | Mid | [`business-model/10_external-dependency.md`, §1] |

### Segment: Hydro Aluminium Metal (7.1% revenue / 39.5% Adj. EBITDA FY2025 — dominant profit segment)

| Driver | Impact | Direction | Magnitude | Evidence |
|---|---|---|---|---|
| LME aluminium price + premiums | Segment Adjusted EBITDA nearly doubled QoQ (+98%) to NOK 5,034mn on higher all-in metal prices | Tailwind, but explicitly a Middle East supply-shock effect — **not run-rate** | High | [`business-model/03_segment-map.md`, §1; Q1 2026 transcript, prepared remarks, p.7-8] |
| Alumina cost (input) | Lower alumina price directly cuts this segment's input cost | Tailwind — implied all-in primary cost fell from USD 2,500/mt to USD 2,375/mt YoY | High | [nhy-presentation-q1-2026.pdf, p.16] |
| USD/NOK | Revenue is USD-linked, cost base largely NOK | Headwind — stronger NOK cited explicitly as an offsetting drag both YoY and QoQ | High | [Q1 2026 transcript, prepared remarks, p.7-8] |
| Energy/carbon cost | 80-85% of smelting cash cost | Headwind — Q2 2026 guidance: energy +NOK 200-300mn, carbon +NOK 150-250mn | Mid | [Q1 2026 transcript, prepared remarks, p.7] |
| Curtailment (Qatalum ~40%, Slovalco fully curtailed) | Reduces volume | Headwind on volume, offset by the price environment | Mid | [Q1 2026 transcript, prepared remarks, p.4, 128] |

### Segment: Hydro Metal Markets (36.4% revenue / 1.2% Adj. EBITDA FY2025 — turned negative reported EBIT in FY2025)

| Driver | Impact | Direction | Magnitude | Evidence |
|---|---|---|---|---|
| U.S. recycling spread (premium vs. scrap) | Segment swung from negative NOK 14mn (Q1'25) to positive NOK 541mn (Q1'26) Adjusted EBITDA | Tailwind, supply-shock linked — **not fully run-rate**, though management expects continuation into Q2 2026 | High relative to this segment's thin margin base | [Q1 2026 transcript, prepared remarks, p.5-6] |
| Trading/sourcing activity | A NOK 900mn "net other effects" benefit QoQ, mainly commercial activities | Management flags this as normalizing (i.e., reverting) into Q2 2026 | Mid, one-off | [Q1 2026 transcript, prepared remarks, p.6-7] |
| Currency/inventory valuation effects | Adds noise: Adjusted EBITDA excluding currency/inventory effects was NOK 588mn vs. reported NOK 541mn in Q1'26 | Not a real margin driver, a reporting-timing effect | Low-Mid | [Q1 2026 transcript, prepared remarks, p.6-7] |

### Segment: Hydro Extrusions (37.5% revenue / 12.0% Adj. EBITDA FY2025; reported EBIT margin -2.2% FY2025)

| Driver | Impact | Direction | Magnitude | Evidence |
|---|---|---|---|---|
| European/North American demand | Full-year 2026 European extrusion demand growth cut to ~1% during the quarter | Headwind, structural | High (drove the segment to a negative FY2025 reported margin and five proposed plant closures) | [`business-model/03_segment-map.md`, §1; Q1 2026 transcript, prepared remarks, p.5-6] |
| U.S. recycling margin spread | "Strongest results since mid-2023" | Tailwind, but same supply-shock link as Metal Markets above — **not fully run-rate** | Mid-High for this segment | [Q1 2026 transcript, prepared remarks, p.6-7] |
| Fixed-cost reduction (restructuring/plant closures) | NOK 300mn lower fixed cost QoQ specifically in Extrusions | Tailwind, durable/structural | Mid | [Q1 2026 transcript, prepared remarks, p.6-7] |
| Restructuring/impairment (5 European plant closures) | Drags reported EBIT via the FY2025 impairment charge; forward operating-cost tailwind once complete | Headwind now, Tailwind later | Mid-High | [integrated-annual-report-2025.pdf, p.6741, p.10240] |

## 7. Margin Bridge — Latest Period

Hydro discloses its own Adjusted EBITDA bridge in NOK million (not in margin basis points) between consecutive quarters — Q4 2025 (NOK 5,587mn) to Q1 2026 (NOK 8,668mn), a change of +NOK 3,100mn (management's own rounded figure; the exact underlying figures are NOK 5,587mn and NOK 8,668mn, an implied +NOK 3,081mn) [`01_historical-financials.md` §3; Q1 2026 transcript, prepared remarks, p.6-7]. The table below reproduces the CFO's own component breakdown verbatim from the earnings call, cited to the primary/verbatim transcript:

| Component (as reported by management) | Margin Impact (NOK million) | Evidence |
|---|---:|---|
| Realized all-in aluminium and alumina prices (net) | +1,200 | [Q1 2026 transcript, prepared remarks, p.6] |
| Upstream volumes (Bauxite & Alumina lower, Aluminium Metal slightly higher, net) | -300 | [Q1 2026 transcript, prepared remarks, p.6] |
| Raw material costs (higher energy/carbon in Aluminium Metal) | -50 | [Q1 2026 transcript, prepared remarks, p.6] |
| Extrusions — seasonal sales-volume increase | +650 | [Q1 2026 transcript, prepared remarks, p.6] |
| Extrusions — margin effect | +500 | [Q1 2026 transcript, prepared remarks, p.6] |
| Metal Markets — recycling improvement | +100 | [Q1 2026 transcript, prepared remarks, p.6] |
| Energy business area (lower production, loss of price-area differences) | -500 | [Q1 2026 transcript, prepared remarks, p.6] |
| Fixed cost (NOK 300mn lower in Extrusions, NOK 200mn lower in Bauxite & Alumina) | +550 | [Q1 2026 transcript, prepared remarks, p.6] |
| FX (stronger NOK vs. USD) | -700 | [Q1 2026 transcript, prepared remarks, p.6] |
| Other (commercial activities in Metal Markets/Bauxite & Alumina, plus NOK 600mn release of previously eliminated internal margins) | +1,600 | [Q1 2026 transcript, prepared remarks, p.6] |
| **Total (sum of components)** | **≈ +3,050** | Reconciles to management's own rounded "+NOK 3.1 billion" within normal rounding of verbal component figures |

This is a NOK-value EBITDA bridge, not a margin-percentage bridge — Hydro does not disclose a component-level bps breakdown. The aggregate margin move it corresponds to is verified separately: Adjusted EBITDA margin rose from 11.83% (Q4'25) to 17.20% (Q1'26), +537bps [`01_historical-financials.md` §3]. Attempting to convert each NOK component above into a standalone bps figure would require allocating a revenue base across components that Hydro does not disclose, and is not attempted here — doing so would be inference presented as precision.

## 8. The Single Biggest Margin Driver

**The LME aluminium price — specifically, how much of its current level is a one-time supply-shock premium rather than a durable price.** Hydro Aluminium Metal is the largest single contributor to group Adjusted EBITDA (39.5% of FY2025, and roughly 6.7x Bauxite & Alumina's contribution in Q1 2026), and the company's own disclosed sensitivity is +NOK 150mn of Adjusted EBITDA per +USD 10/mt of aluminium price [`business-model/03_segment-map.md`, §2; `business-model/10_external-dependency.md`, §2]. The Q1 2026 price move — from USD 2,995/mt to above USD 3,400/mt within the quarter — was driven explicitly by a Middle East conflict, regional production curtailments (~40% of Qatalum), and the closure of the Strait of Hormuz, a region that supplies "some 9%" of global aluminium output and exports 4-5 million tonnes a year [Q1 2026 transcript, prepared remarks, p.4]. This is a textbook one-time, non-run-rate supply shock, not demand-led growth. If the shock unwinds — Gulf capacity resumes, the strait reopens, or China curtails more supply to rebalance the market as management itself flags as the open question for 2027 — a reversion of even USD 400/mt (back toward the pre-shock USD 2,995/mt-2,300/mt range) implies roughly NOK 6.0bn of Adjusted EBITDA downside on the disclosed sensitivity, about 21% of FY2025 group Adjusted EBITDA of NOK 28,889mn. The current level of realized aluminium price is therefore the single variable most likely, if it reverses, to compress group margins the most — and it is currently a tailwind resting on a geopolitical shock rather than a structural improvement.
