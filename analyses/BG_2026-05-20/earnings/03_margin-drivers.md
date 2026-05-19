# Margin Drivers — BG

## 1. Segment Decomposition Status

Bunge reports **four reportable segments plus Corporate & Other** [FY25 10-K, p.30; Q1 FY26 10-Q, p.32]. Segment EBIT, segment net sales, segment COGS, segment SG&A, and (in the 10-Q only) segment-level raw materials cost, fixed industrial expense, variable industrial expense, and segment depreciation are disclosed [Q1 FY26 10-Q, p.32]. Soybean Processing and Refining is dominant at **51.6% of FY25 net sales and 52.6% of FY25 segment EBIT** but does not exceed the 85% single-segment threshold from MODULE_RULES, so margin drivers are decomposed by segment below. **Note**: in Q1 FY26 the "Other Oilseeds" segment was renamed to "Tropical Oils and Specialty Ingredients" with no impact on composition [Q1 FY26 10-Q, p.37].

Limitation: only Q1 FY25 and Q1 FY26 quarterly data are in the supplied data pool; the 8-quarter trend table and multi-year quarterly seasonality are not possible. Business-model `03_segment-map.md` and `06_value-chain.md` are available and used below.

## 2. Cost Stack

Consolidated cost stack (FY25, in US$M) — primary cost lines from the consolidated income statement:

| Cost Line | FY25 Amount (US$M) | % of Revenue | Direction | Evidence | Margin Risk |
|---|---:|---:|---|---|---|
| Cost of goods sold | $66,920 | 95.2% [calc A] | Up 35% YoY (Viterra + commodity prices) | FY25 10-K, p.F-10 | Very high — every 100bps of COGS/sales = ~$700M of EBIT |
| Selling, general & administrative | $2,113 | 3.00% [calc A] | Up 19% YoY (+$337M) — Viterra labor + integration | FY25 10-K, p.F-10; Q1 FY26 10-Q, p.37 | Mid — Viterra synergies should reduce; $70M synergies realized YE25 [FY25 Annual Report letter, p.1] |
| Depreciation, depletion & amortization | $703 | 1.00% [calc A] | Up 50% YoY (+$235M) — Viterra step-up | FY25 10-K, p.F-13 | Mid — mgmt guides ~$975M for FY26 [Q1 FY26 transcript, p.5] = further step-up ~$272M |
| Interest expense (below the line, not in EBIT) | $628 | 0.89% [calc A] | Up 33% YoY (+$157M) — Viterra debt | FY25 10-K, p.43; Q1 FY26 10-Q, p.37 | High at EPS level — mgmt guides $620-660M FY26 [Q1 FY26 transcript, p.5] |
| Raw materials cost (Q1 FY26 segment disclosure) | $19,985 (consolidated, Q1 FY26 only) | 91.4% of Q1 sales [calc B] | Up 93% YoY (Viterra) | Q1 FY26 10-Q, p.32 | Very high — by far the dominant cost line |
| Industrial expenses — fixed (Q1 FY26 only) | $615 (Q1 FY26 only) | 2.81% of Q1 sales [calc B] | Up 59% YoY | Q1 FY26 10-Q, p.32 | Mid — fixed-cost absorption / utilization driver |
| Industrial expenses — variable (Q1 FY26 only) | $271 (Q1 FY26 only) | 1.24% of Q1 sales [calc B] | Up 42% YoY | Q1 FY26 10-Q, p.32 | Mid — energy / freight component |
| FX losses — net | $51 (FY25 consolidated) | 0.07% | Loss narrowed (FY24: $189M loss) | FY25 10-K, p.F-10 | Low–Mid — Q1 FY26 swung to $94M loss [Q1 FY26 10-Q, p.37] |
| Labor cost (specific quantum not separately disclosed) | Not separately broken out | — | "Increased labor costs as a result of the Viterra Acquisition" cited as the primary SG&A driver in Q1 FY26 [Q1 FY26 10-Q, p.37] | Q1 FY26 10-Q, p.37 | Mid |
| Energy / bunker fuel (not separately broken out at consolidated level; called out as Q1 FY26 driver) | Not disclosed | — | Headwind in Q1 FY26 — "significant spike in bunker fuel costs" [Q1 FY26 transcript, p.3] | Q1 FY26 transcript, p.3 | Mid–High in Grain Merchandising segment |
| Freight / ocean shipping (not separately broken out; embedded in Grain Merchandising COGS) | Not disclosed | — | Headwind in Q1 FY26; Grain Merch & Milling Q1 FY26 segment EBIT went from $46M to $(76)M [Q1 FY26 10-Q, p.41] | Q1 FY26 10-Q, p.41; Q1 FY26 transcript, p.7-8 | Mid in 2026 — driving Grain segment FY26 outlook lower [Q1 FY26 transcript, p.5] |
| R&D | Not separately disclosed in income statement | — | Not applicable to commodity processing | FY25 10-K | Low |

Calculation notes:
- [calc A] FY25 line items / $70,329M net sales.
- [calc B] Q1 FY26 segment-level line items aggregated across four reportable segments + Corp & Other / $21,861M Q1 net sales. Note that the segment-level breakdown of cost into raw materials / fixed industrial / variable industrial is only available in the 10-Q at this granularity; the FY25 10-K does not provide a consolidated raw-materials vs industrial-cost split.

## 3. Gross Margin → EBITDA Margin → EBIT Margin Walk

| Margin Level | FY25 Latest | FY24 Prior Year | Change (bps) | Main Reason | Evidence |
|---|---:|---:|---:|---|---|
| Gross margin (consolidated) | 4.85% [calc C] | 6.39% [calc C] | -154 bps | Higher mix of low-margin Viterra grain merchandising volume + crush-margin compression and unfavorable MTM in Soybean and Softseed segments | FY25 10-K, p.F-10; segment narratives p.38, p.40, p.42 |
| EBITDA margin (consolidated, reported) | 3.18% [calc C] | 4.26% [calc C] | -108 bps | Same drivers as gross margin compression, partly offset by SG&A leverage on the much-larger revenue base | FY25 10-K, p.F-10, F-13 |
| EBIT margin (consolidated Total EBIT, non-GAAP) | 2.18% [calc C] | 3.37% [calc C] | -119 bps | Largely Corporate & Other EBIT loss widening from $(367)M to $(796)M — pension settlement loss $118M + impairment $30M + absence of FY24 BP Bunge Bioenergia gain of $195M | FY25 10-K, p.43 |

Pass-through lag (per business-model `06_value-chain.md`): Bunge has **no formal pass-through pricing** on its core flows — it buys and sells commodities at world reference prices and hedges the spread. The Q1 FY26 bunker-fuel spike from Middle East disruption hit Grain Merchandising EBIT in the same quarter with no offset described, evidence that energy and freight pass-through lag is essentially "not at all" on the merchandising leg [Q1 FY26 transcript, p.3, p.7]. On the crush leg, Bunge does not lock in margin "until we have all three legs priced" — the company is a spread-taker, not a price-setter [Q1 FY26 transcript, p.11].

## 4. Margin Walk — Which Margin Level Matters Most?

**Segment EBIT margin is the most useful metric for Bunge, with crush margin as the underlying economic driver.** Consolidated gross margin (4.85% FY25) is uninformative because it averages high-volume / low-margin grain merchandising (raw materials are ~96% of segment net sales in Q1 FY26 — Soybean COGS $9,154M / sales $9,552M = 95.8%; Grain Merch COGS $7,132M / sales $7,177M = 99.4%) with the higher-quality processing and refining margins. EBITDA margin is distorted by the Viterra-driven D&A step-up (FY25 D&A $703M vs FY24 $468M; FY26 guidance ~$975M [Q1 FY26 transcript, p.5]). EBIT margin is distorted by the volatile Corporate & Other EBIT line ($(796)M in FY25). **Segment EBIT margin by segment** (Soybean 3.4% FY25, Softseed 4.6%, Tropical Oils 2.5%, Grain Merch 2.6% — most of which is the $155M corn-milling divestiture gain) is what management discusses and what isolates the underlying spread economics from financing, D&A step-up, and one-offs [FY25 10-K, p.37-42].

## 5. Margin Driver Table (consolidated)

| Driver | Impact on Margins | Direction | Magnitude | Evidence |
|---|---|---|---|---|
| **Crush margin** (soy + softseed spread between oilseed input and combined meal + oil output) | Drives segment EBIT margin in Soybean (52.6% of EBIT) and Softseed (22.4% of EBIT) | **Tailwind** for FY26 outlook | **High** (>100 bps on segment EBIT) | Q1 FY26 transcript, p.3 ("higher results primarily driven by soybean and soft seed processing and refining segments… improved market conditions"); FY25 10-K, p.38 |
| **Biofuel demand & policy** (US EPA RVO, Brazilian/Indonesian/EU biofuel mandates) | Drives soy oil and softseed oil prices, refining premiums, renewable diesel feedstock demand | **Tailwind** (RVO clarity is "very helpful"; Brazil/Indonesia/EU policies "moving to utilize more biofuels") | **High** (>100 bps on Soybean & Softseed segment EBIT) | Q1 FY26 transcript, p.2, p.7 (Heckman); FY25 10-K, p.14 risk factors |
| **Mark-to-market timing** (derivative hedges revalued each quarter; reverses over time) | Drives reported gross profit / Total EBIT volatility but is "timing only" | **Headwind** in Q1 FY26 ($336M segment MTM hit, $1.28/share GAAP vs adjusted EPS gap) — reverses by end of year | **High** in any single quarter on GAAP basis; zero on cycle-adjusted basis | Q1 FY26 earnings release, p.2, p.12; Q1 FY26 transcript, p.3 |
| **Mix shift to Grain Merchandising post-Viterra** | Grain Merch is a much lower-margin segment (2.6% FY25 segment EBIT margin vs 3.4% Soybean / 4.6% Softseed) and now ~26% of revenue vs much smaller pre-Viterra | **Headwind** (mechanical mix dilution of consolidated gross margin) | **Mid** (30-100 bps consolidated gross margin compression attributable to mix) | FY25 10-K, p.34, p.42 — Grain Merch volumes +83% YoY post-Viterra; consolidated gross margin -154 bps FY25 |
| **Energy / bunker fuel cost** | Hits ocean freight cost embedded in Grain Merchandising COGS; no contractual offset | **Headwind** in 1H FY26 (Middle East / Iran conflict spike) | **Mid** (drove Grain Merch & Milling Q1 FY26 segment EBIT from $46M to $(76)M YoY; full-year segment outlook revised lower) | Q1 FY26 transcript, p.3, p.5, p.7; Q1 FY26 10-Q, p.41 |
| **Refining premiums** (over-and-above crush margin earned on the refining of crude veg oil into refined oil for food / fuel customers) | Drives the refining-leg contribution within Soybean and Softseed segment EBIT | **Headwind vs FY22/23 peak but Neutral / "pretty resilient" near-term** ("not where we were back in '22 and '23 but pretty resilient") | **Mid** | Q1 FY26 transcript, p.9 (Neppl) |
| **Argentina / South American crush margin & FX** | Argentina is the location of much of Soybean and Softseed segment growth (Q1 FY26 Argentina was the dominant positive driver of Soybean processing & refining results) | **Tailwind** ("stronger processing performance in Argentina and Brazil") | **Mid–High** | Q1 FY26 transcript, p.3, p.11; Q1 FY26 10-Q, p.40 |
| **Farmer selling behavior** (price elasticity of farmers' willingness to release stored grain) | Drives merchandising volumes and origination margin | **Tailwind** Q1 FY26 ("higher origination in Brazil… better farmer selling globally, really everywhere but Argentina") — **could reverse** if prices fall | **Mid** | Q1 FY26 transcript, p.10; FY25 10-K, p.15 |
| **Viterra cost synergies** | Reduces SG&A and combined COGS over time vs standalone baselines | **Tailwind** — "$70 million in cost synergies realized by year-end 2025… greater gains in 2026 and beyond"; "synergies running ahead of plan" | **Mid** (multi-year, full target unspecified in supplied data) | FY25 Annual Report letter, p.1; Q1 FY26 transcript, p.6 |
| **Viterra integration costs** | One-time charges in Corp & Other EBIT | **Headwind** but declining ($244M FY24 → $223M FY25; $35M in Q1 FY26 vs $32M Q1 FY25) | **Low–Mid** | FY25 10-K, p.43; Q1 FY26 10-Q, p.41 |
| **D&A step-up from Viterra** | Increases consolidated D&A from $468M FY24 → $703M FY25 → guided ~$975M FY26 | **Headwind** to EBIT margin (mechanical, ~38 bps on FY26 revenue at the run-rate) | **Mid** | FY25 10-K, p.F-13; Q1 FY26 transcript, p.5 |
| **Tropical oils / cocoa-butter-equivalent (CBE) margin** | Tropical Oils & Specialty Ingredients segment EBIT (5.1% of FY25 segment EBIT) | **Headwind** — "cocoa prices come off… margins are definitely down"; FY26 outlook revised lower | **Low** (small segment) | Q1 FY26 transcript, p.8 |
| **One-off items** | FY25 included $155M corn-milling divestiture gain (Grain Merch), $118M US pension settlement loss (Corp & Other), $30M impairment (Corp & Other), absence of FY24 $195M BP Bunge Bioenergia gain | **Mixed** historical; Q1 FY26 includes ongoing Viterra integration | **Mid** | FY25 10-K, p.42, p.43 |
| **FX** | Functional-currency translation + USD-denominated debt remeasurement in non-USD subs | **Headwind** Q1 FY26 ($94M FX loss vs $25M gain Q1 FY25) | **Low–Mid** | Q1 FY26 10-Q, p.37 |
| **Operating leverage / utilization** | Higher process volumes spread fixed industrial expense; Q1 FY26 soybean process volumes up 33%, softseed up 50% (mostly Viterra contribution) | **Tailwind** (combined company expanded production capacity is being utilized) | **Mid** | Q1 FY26 transcript, p.4; Q1 FY26 10-Q, p.39-40 |
| **El Niño weather / 2026 crop development** | Affects South American crop yield (FY24 Argentina drought disrupted softseed) and forward crush margins | **Unknown** (called out as a watch item) | **Mid–High** if it materializes | Q1 FY26 transcript, p.5, p.13 |

## 6. Margin Drivers By Segment

### Segment: Soybean Processing and Refining (51.6% of FY25 revenue, 52.6% of FY25 segment EBIT)

| Driver | Impact | Direction | Magnitude | Evidence |
|---|---|---|---|---|
| Soybean crush margin (US, Brazil, Argentina) | Primary EBIT driver | Tailwind near-term | High (>100 bps) | Q1 FY26 transcript, p.3; FY25 10-K, p.38 |
| Refining premium for soy oil | Refining-leg contribution | Neutral ("pretty resilient" but below FY22/FY23 peak) | Mid | Q1 FY26 transcript, p.9 |
| RVO / biofuel demand for soy oil | Demand for refined / crude soy oil into renewable diesel | Tailwind (RVO set, stocks drawing down) | High | Q1 FY26 transcript, p.2, p.11 |
| Argentina contribution | Expanded Viterra footprint, "biggest ag business in Argentina" | Tailwind | Mid–High | Q1 FY26 transcript, p.11; Q1 FY26 10-Q, p.40 |
| Mark-to-market timing (segment level) | $336M MTM hit in Q1 FY26 segment EBIT | Headwind near-term, reverses | High in single quarter | Q1 FY26 earnings release, p.2 |
| Farmer selling | Brazil farmer selling drove Q1 FY26 origination | Tailwind Q1 FY26; rain slowed Argentina selling | Mid | Q1 FY26 transcript, p.10 |
| FX (USD vs BRL/ARS) | Translation + USD-denominated debt remeasurement | Mixed (Q1 FY26 segment FX loss of $47M) | Low–Mid | Q1 FY26 10-Q, p.39 |

### Segment: Softseed Processing and Refining (16.0% of FY25 revenue, 22.4% of FY25 segment EBIT)

| Driver | Impact | Direction | Magnitude | Evidence |
|---|---|---|---|---|
| European / Black Sea sunseed crop | "Two tough soft seed crops the last two years in Europe… margins will be pressured until we get to a new crop" | Headwind near-term, potential tailwind on new crop | High (segment EBIT margin compressed from 13.9% FY23 to 4.6% FY25 driven by European drought) | Q1 FY26 transcript, p.12; FY25 10-K, p.39 |
| Canola crush spread (North America) | Driven by RVO clarity + ample seed supply per mgmt | Tailwind for FY26 | Mid–High | Q1 FY26 transcript, p.12 |
| Argentina sunseed business | Seasonal offset to European sunseed | Tailwind | Mid | Q1 FY26 transcript, p.11 |
| Viterra Canada / Australia origination | Expanded footprint in large crops | Tailwind | Mid | Q1 FY26 transcript, p.3-4 |

### Segment: Tropical Oils and Specialty Ingredients (6.6% of FY25 revenue, 5.1% of FY25 segment EBIT)

| Driver | Impact | Direction | Magnitude | Evidence |
|---|---|---|---|---|
| Tropical oil (palm/coconut) prices & biofuel mandates | Drives sales-price | Mixed — higher Q1 FY26 prices from Iran conflict, but food customer volumes lower | Mid | FY25 10-K, p.41; Q1 FY26 10-Q, p.40 |
| Cocoa butter equivalent margins | Specialty ingredient margin | Headwind — "cocoa prices come off… margins are definitely down" | Mid (within small segment) | Q1 FY26 transcript, p.8 |
| Loders Croklaan JV results (Europe competitive market) | Minority-owned, hits EBIT attributable to NCI | Headwind FY25 vs FY24 ($(13)M vs $(33)M NCI in FY25 was an improvement, but segment-level results lower) | Low–Mid | FY25 10-K, p.41 |
| IFF soy-protein-concentrate acquisition (closed March 2026) | Adds protein-ingredient capacity | Tailwind (small near-term contribution; $105M purchase price) | Low | Q1 FY26 transcript, p.5 |

### Segment: Grain Merchandising and Milling (25.8% of FY25 revenue, 20.0% of FY25 segment EBIT — most of FY25 was a one-time corn-mill gain)

| Driver | Impact | Direction | Magnitude | Evidence |
|---|---|---|---|---|
| Ocean freight rates / bunker fuel cost | Direct hit when fuel spikes (Middle East / Iran in Q1 FY26) | Headwind 1H FY26 | High — drove segment EBIT from $46M to $(76)M Q1 FY26 YoY; FY26 segment outlook revised lower | Q1 FY26 transcript, p.3, p.5, p.7-8 |
| Wheat milling margin | Drives South American milling sub-segment | Tailwind Q1 FY26 ("higher results in wheat milling, global cotton, and commercial services") | Low | Q1 FY26 transcript, p.4 |
| Feed grains / wheat S&D (supply / demand balance) | "Continues to be fairly heavy S&Ds" | Headwind | Mid | Q1 FY26 transcript, p.7 |
| Viterra grain merchandising synergies | Combined company larger volume base (Q1 FY26 volumes +212% YoY) | Tailwind multi-year | Mid | Q1 FY26 10-Q, p.41 |
| One-time corn-milling divestiture gain in FY25 | $155M Other income — net gain in FY25 segment EBIT | Tailwind FY25 only, won't recur in FY26 | Mid — without the gain, FY25 segment EBIT was ~$310M / ~1.7% margin | FY25 10-K, p.42 |

### Segment: Corporate and Other (negative $(796)M EBIT in FY25)

| Driver | Impact | Direction | Magnitude | Evidence |
|---|---|---|---|---|
| Viterra integration costs | One-time, declining | Headwind but improving ($244M FY24 → $223M FY25 → $35M Q1 FY26) | Mid in 2025/2026 | FY25 10-K, p.43; Q1 FY26 10-Q, p.41 |
| US pension plan settlement loss | $118M in FY25 | One-off Headwind (FY25) | Mid (FY25 only) | FY25 10-K, p.43 |
| Investment impairment | $30M long-term-investment charge in FY25 | One-off Headwind (FY25) | Low | FY25 10-K, p.43 |
| Absence of FY24 BP Bunge Bioenergia gain | $195M gain that did not repeat | Headwind FY25 vs FY24 | Mid | FY25 10-K, p.43 |
| Corporate SG&A (post-Viterra higher labor base) | Recurring | Headwind (Viterra step-up) | Mid | Q1 FY26 10-Q, p.37, p.41 |
| Performance-based comp timing | "Timing of performance-based compensation" affects QoQ | Mixed | Low | Q1 FY26 transcript, p.4, p.14 |

## 7. Margin Bridge — Latest Period

A full quantitative margin bridge in basis points for Q1 FY26 vs Q1 FY25 is **not directly disclosed**. Management's qualitative bridge from the Q1 FY26 release, transcript, and 10-Q, with quantified components labeled:

| Component | Margin / EBIT Impact (Q1 FY26 vs Q1 FY25) | Evidence |
|---|---:|---|
| Mark-to-market timing (segment-level) | $336M headwind to GAAP segment EBIT (reverses over time) | Q1 FY26 earnings release, p.2, p.12 |
| Viterra acquisition / integration costs (Corp & Other) | $35M expense in Q1 FY26 (vs $32M Q1 FY25) — small incremental headwind | Q1 FY26 10-Q, p.41 |
| Bunker fuel / ocean freight cost spike | Primary driver of Grain Merchandising Q1 FY26 segment EBIT going from $46M to $(76)M (= ~$122M headwind) | Q1 FY26 transcript, p.7; Q1 FY26 10-Q, p.41 |
| Soybean & Softseed underlying performance (adjusted, ex-MTM) | Adjusted Segment EBIT rose from $406M Q1 FY25 to $661M Q1 FY26 (+$255M) — bulk attributed to Argentina + Viterra footprint + improved crush margins | Q1 FY26 earnings release, p.2; Q1 FY26 transcript, p.3-4 |
| Tropical Oils improvement | Segment EBIT went from $5M to $110M (+$105M), primarily from favorable MTM | Q1 FY26 10-Q, p.40 |
| Corporate & Other (ex-acq/integration) | EBIT loss widened from $(76)M to $(135)M; "increase in SG&A as a result of Viterra and the timing of performance-based compensation… $15M cash benefit received in 2025 related to a prior JV did not repeat" | Q1 FY26 10-Q, p.41 |
| FX | Swung from $25M gain to $94M loss = ~$119M FX headwind | Q1 FY26 10-Q, p.37 |
| Interest expense (below EBIT) | Up $77M to $181M = full Viterra debt step-up | Q1 FY26 10-Q, p.37 |
| Volume / operating leverage | Soybean processed volumes +33%, softseed +50%, tropical oils +3%, grain merchandising +212% — overwhelmingly Viterra contribution | Q1 FY26 10-Q, p.39-41 |
| **Reported Total EBIT change** | $328M → $184M = **$(144)M** | Q1 FY26 10-Q, p.38 |

Volume vs price split, mix-rate, and FX-isolated quantification at the consolidated-margin level is **not separately broken out in available disclosure**. The Soybean segment narrative attributes the increase to "Net sales contributions from the Acquisition of Viterra… higher prices across all regions due to strong demand from higher global energy prices as a result of uncertainty from the conflict with Iran, as well as biofuel mandates in North America" [Q1 FY26 10-Q, p.39] but does not split price vs volume vs Viterra in dollars.

## 8. The Single Biggest Margin Driver

**The combined soybean + softseed crush margin (with biofuel mandate / RVO setting the soy-oil demand level as its prime mover).** Soybean Processing and Refining plus Softseed Processing and Refining together generated **75.0% of FY25 segment EBIT** ($1,746M of $2,329M) on a 67.6% revenue share [FY25 10-K, p.37]. The two segments saw EBIT margin compress from a combined 7.8% in FY23 to 6.0% in FY24 to 3.8% in FY25, and then mgmt raised FY26 adjusted EPS guidance from $7.50-$8.00 to $9.00-$9.50 explicitly because "soybean and soft seed processing and refining segment results are forecasted to be higher" [Q1 FY26 transcript, p.5]. The driver currently sits in **Tailwind** direction — RVO clarity, distillate shortages, Middle East-driven crude oil prices, biofuel mandate momentum in Brazil / Indonesia / EU, and "the consumer favoring eating a lot of animal protein" supporting soybean meal demand are all working in Bunge's favor [Q1 FY26 transcript, p.2, p.7, p.12]. If any of those reverse — particularly an RVO walk-back, an unfavorable EPA action, lower crude oil, or a global recession compressing meat demand — Bunge has **no contractual pass-through mechanism** on either side of the spread [business-model `06_value-chain.md`, Section 4], and the consolidated margin compression already seen from FY23 to FY25 (gross margin -329 bps; EBIT margin -342 bps) shows the magnitude available on the downside. **Crush margin is both the biggest opportunity and the biggest single point of failure for FY26 margins.**

Calculations:
- [calc C] Margins from historical-financials Section 1 (FY25 10-K p.F-10 and p.37 source data): Gross margin FY25 = 3,409/70,329 = 4.85%; FY24 = 3,393/53,108 = 6.39%. EBITDA margin FY25 = (1,533+703)/70,329 = 3.18%; FY24 = (1,792+468)/53,108 = 4.26%. Total EBIT margin FY25 = 1,533/70,329 = 2.18%; FY24 = 1,792/53,108 = 3.37%.
