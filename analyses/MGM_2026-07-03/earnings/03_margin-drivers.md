# Margin Drivers — MGM

**Ticker:** MGM (NYSE) | **Reporting Standard:** US GAAP | **Currency:** USD | **Fiscal Year End:** December 31
**Analysis Date:** 2026-07-03

Sector overlay applied: Integrated resort / gaming operator — no dedicated row in `SECTOR_OVERLAYS.md`. Generic operating company path applies, with gaming-specific KPI grammar layered on top (Segment Adjusted EBITDAR, EBITDA vs EBITDAR bridge, gaming hold, RevPAR, triple-net lease rent as structural cost line). See §3a of `02_business-identity.md`.

---

## 1. Segment Decomposition Status

MGM reports four segments: Las Vegas Strip Resorts (48.1% of FY2025 revenue), MGM China (25.4%), Regional Operations (21.5%), and MGM Digital (3.7%). A "Corporate and other" bucket (-$2,708M EBITDAR) captures the ~$2.3B annual triple-net lease rent paid to VICI Properties and Bellagio REIT. Segment-level Adjusted EBITDAR is disclosed; segment-level GAAP operating income is not. This analysis decomposes margin drivers by segment where disclosure permits.

The primary margin metric used throughout this report is **Segment Adjusted EBITDAR** at the segment level and **Consolidated Adjusted EBITDA** (after deducting the VICI rent in Corporate) at the consolidated level. EBITDA is earnings before interest, taxes, depreciation and amortization — in MGM's case, also excluding preopening costs, property transactions, and impairments. EBITDAR is the same measure before also deducting rent. The rent lives entirely in Corporate and Other, so segment EBITDAR margins appear higher than the all-in economics; an analyst must add back rent to compare MGM with peers that own their real estate.

Business-model cross-module outputs available and used: `02_business-identity.md`, `03_segment-map.md`, `06_value-chain.md`, `10_external-dependency.md`.

**Cycle position:** MGM is at a mid-cycle softening point in Las Vegas — not a recessionary trough, but clearly past the 2022–2023 post-COVID catch-up peak. Las Vegas visitor volume fell 8% in 2025 (LVCVA data, cited in `FY2025 10-K, Item 7, MD&A, p.36`). Las Vegas Strip revenue of $8,442M in FY2025 is below the FY2024 level of $8,816M, and below the FY2023 level of $8,799M, despite nominal GDP growth — suggesting demand has not fully recovered even from the convention-heavy FY2023 peak. Macau is in a post-reopening recovery cycle (visitor arrivals up 15% in 2025 vs. the near-zero 2022 base), with margins stabilizing. The most recent quarters are NOT a normalized run-rate for Las Vegas.

---

## 2. Cost Stack

MGM is a gaming and hospitality service business with no raw-material inputs. The cost structure is dominated by (1) operating costs of gaming and hotel floors, captured in COGS; (2) SG&A covering the overhead and administrative layer; (3) the triple-net lease rent obligation to VICI (~$1.87B in annual cash operating lease outflows), which sits in Corporate and Other and is therefore excluded from segment EBITDAR; and (4) D&A. Gaming taxes are embedded in COGS for each jurisdiction and are a legally fixed percentage of gaming win — not a management-controllable lever.

| Cost Line | Amount / % of Revenue (FY2025) | Direction vs FY2024 | Evidence | Margin Risk |
|---|---:|---|---|---|
| COGS (casino ops, rooms, F&B, gaming taxes, other ops) | $9,748M / 55.6% of revenue | Rising (+110 bps vs FY2024 54.5%) | Capital IQ Financials_Annual.xls, Income Statement tab; FY2025 10-K, Item 7 | High — COGS has risen faster than revenue in each of the last three years, compressing gross margin by 490 bps since FY2022 |
| Gaming taxes (within COGS) | Not separately quantified at consolidated level; embedded in segment casino expenses | Neutral to rising | FY2025 10-K, Item 1A, Risk Factors p.25 ("If jurisdictions increase taxes") | High — fixed percentage of win, cannot be managed; regulatory risk if states raise rates |
| Labor / payroll (within COGS and SG&A) | Not separately disclosed at consolidated level; described as "an important part of our cost structure" | Stable — management stated "we have been able to largely offset wage growth with the labor complement" | Q4 2025 earnings call (Feb 05, 2026), CFO remarks | Mid — ~37,000 US employees under collective bargaining agreements; union contracts expiring in first half of 2026 represent a potential step-up |
| SG&A (selling, general and administrative) | $5,434M / 31.0% of revenue | Stable (+0 bps vs FY2024) | Capital IQ Financials_Annual.xls, Income Statement tab; FY2025 10-K | Low-Mid — SGA has grown 4.2% YoY but in line with revenue (+1.7%), showing modest leverage |
| Triple-net lease rent (operating lease outflows to VICI) | ~$1,867M cash outflow in FY2025 / ~10.6% of revenue; sits in Corporate and Other below segment EBITDAR | Rising — rent escalates annually; +$34M YoY (FY2024: $1,833M) | FY2025 10-K, p.4436 (cash outflows from operating leases: $1,867,130K); FY2025 10-K, Note 11 | High — fixed, non-negotiable, escalates annually up to 2% in first 10 years and up to 3% in years 11–20; cannot be reduced if revenue falls |
| D&A (depreciation and amortization) | $1,018M / 5.8% of revenue (FY2025 CIQ figure; note: the VICI lease ROU asset amortization is the primary driver) | Rising — stepped up from $831M in FY2024 (+$187M) | Capital IQ Financials_Annual.xls, Income Statement tab (D&A line); FY2025 10-K | Mid — D&A step-up depresses EBIT and GAAP net income but does not affect Consolidated Adjusted EBITDA (which adds it back) |
| Energy | Not disclosed quantitatively; 10-K describes MGM as "particularly sensitive to energy prices" | Unknown — no year-on-year disclosure | FY2025 10-K, Item 1A, Risk Factors p.21 | Mid — a large electricity consumer across the Las Vegas and regional footprint; no hedging program disclosed |
| Self-insurance / litigation accruals | $46M incremental charge in Q1 2026 (LV: $37M, Regional: $9M) — one-time true-up | Headwind in Q1 2026; management expects not to recur | Q1 2026 earnings call (Apr 29, 2026), CFO Jonathan Halkyard remarks | Mid near-term; described as non-recurring by management but flagged as "an increasing cost in our business" |
| MGM Digital losses | -$90M EBITDAR loss (FY2025) — dilutive to consolidated margin | Deepening — FY2024: -$77M; loss grew by $13M | FY2025 10-K, Item 7, MD&A, p.37–40; Capital IQ Financials_Annual.xls, Segments tab | Low-Mid — small vs total but drag growing as Brazil investment increases |
| Interest expense | $419M (FY2025) / 2.4% of revenue | Declining — was $443M in FY2024; benefiting from fixed-rate structure | Capital IQ Financials_Annual.xls, Income Statement tab | Low near-term (13% of debt is variable-rate); refinancing risk in 2026–2027 ($1,150M due 2026, $1,425M due 2027) |
| R&D | Not applicable — MGM does not disclose separate R&D expense | N/A | FY2025 10-K | N/A |
| Freight / logistics | Low — not a material input cost for a hotel-casino operator | Neutral | `06_value-chain.md`; FY2025 10-K, Item 1A | Low |

**Note on COGS composition:** MGM's "Cost of Goods Sold" in the CIQ income statement aggregates casino expenses (gaming floor labor, gaming taxes, comps cost), rooms expenses (housekeeping labor, amenities), food and beverage expenses, and entertainment/retail expenses. It does not include SG&A or D&A. Labor is embedded across both COGS and SG&A — a single labor cost figure is not disclosed.

---

## 3. Gross Margin → EBITDA Margin → EBIT Margin Walk

**Note on the right margin ladder for MGM:** The gross margin line captures casino, room, F&B, and entertainment operating costs but excludes the triple-net lease rent (which sits in Corporate). This makes EBITDAR (before rent) the most economically meaningful segment-level metric. At the consolidated level, Consolidated Adjusted EBITDA (after rent flows through Corporate) is the company's primary disclosed non-GAAP metric. EBIT is distorted by D&A from the VICI lease ROU asset. Therefore:
- Segment-level analysis: Segment Adjusted EBITDAR margin
- Consolidated operating performance: Consolidated Adjusted EBITDA margin (13.8% in FY2025)
- GAAP EBIT margin: useful for tracking D&A step-ups but not the primary performance lens

| Margin Level | FY2025 | FY2024 | Change (bps) | Main Reason | Evidence |
|---|---:|---:|---:|---|---|
| Gross margin | 44.4% | 45.5% | -110 | COGS growing faster than revenue (+3.8% vs +1.7%): gaming taxes fixed on lower LV volumes; LV labor costs maintained despite softer demand; Macau gaming mix shift | Capital IQ Financials_Annual.xls, Income Statement tab (Revenue: $17,538M / $17,241M; Gross Profit: $7,790M / $7,847M) |
| Consolidated Adj. EBITDA margin | 13.8% | 14.0% | -20 | Near-flat in dollar terms ($2,426M vs $2,411M); LV Strip segment EBITDAR down $249M offset by China +$116M, lower Corporate drag +$141M, and Regional +$20M | FY2025 10-K, Item 7, MD&A, Non-GAAP reconciliation, p.2486; Capital IQ Segments tab |
| EBIT margin (GAAP operating income) | 7.6% | 9.6% | -202 | D&A step-up of $187M ($1,018M in FY2025 vs $831M in FY2024) — VICI lease ROU amortization; plus $278.9M goodwill impairment (Empire City) excluded from Adj EBITDA but in GAAP | Capital IQ Financials_Annual.xls, Income Statement tab; FY2025 10-K, Item 7 |

**Pass-through lag:** MGM does not pass through cost increases via contractual revenue escalators. Labor wage increases from union renewals must be absorbed or offset by operating efficiency. Energy cost increases hit the P&L directly. The VICI lease rent escalates regardless of revenue. There is no pass-through mechanism on the cost side — cost increases either compress margins or are offset by volume/price-driven revenue growth. Given the fixed-cost nature of the VICI rent ($1.87B/year), the most effective offset to any cost increase is revenue growth at existing fixed cost base (operating leverage), which has been absent at Las Vegas Strip since FY2024.

---

## 4. Margin Walk — Which Margin Level Matters Most?

For MGM, **Segment Adjusted EBITDAR margin** at the property level and **Consolidated Adjusted EBITDA margin** at the company level are the most decision-relevant metrics. Here is why.

MGM does not own its US real estate — VICI does. The triple-net lease converts a capital asset into a fixed annual rent obligation of ~$1.87B. Gross margin captures the property-level operational performance before this structural obligation and before D&A (which is economically non-representative because the lease ROU amortization is an accounting consequence of a sale-leaseback transaction, not capital consumption). EBIT and net income are further distorted by: (1) the $278.9M goodwill impairment in FY2025; (2) large FX swings from USD-denominated MGM China debt; (3) income-tax benefits from deferred tax assets. None of these reflects the underlying cash-generating power of the operating properties.

Consolidated Adjusted EBITDA of $2,426M in FY2025 (13.8% margin) is the figure that, after netting capital expenditure ($1,069M), produces free cash flow and determines debt capacity. It is also what the company itself guides toward and what sell-side consensus tracks.

EBIT and gross margin remain useful as directional indicators of the fixed-cost absorption story: if COGS rises faster than revenue (which it has every year since FY2022), gross margin compression tells you the operating cost trend before rent and D&A.

---

## 5. Margin Driver Table (Consolidated)

| Driver | Impact on Margins | Direction | Magnitude | Evidence |
|---|---|---|---|---|
| Las Vegas Strip visitor volume and RevPAR | LV Strip is 48% of revenue and 54.7% of positive-segment EBITDAR. A 1% decline in LV Strip revenue with fixed labor and rent flows almost entirely to EBITDAR. LV Strip RevPAR fell 7% in FY2025 ($229 vs $245 in FY2024); revenue fell 4% ($8,442M vs $8,816M); EBITDAR fell 8% ($2,858M vs $3,107M), implying an ~85% flow-through to EBITDAR on revenue declines. | Headwind (partial recovery underway) — Q1 2026 LV Strip net revenue grew YoY for first time in six quarters; convention calendar improving. But midweek value-customer softness persists; Canadian inbound down 30–40% | High — a 3% move in LV Strip revenue moves consolidated Adj EBITDA by ~$90–100M (~4% of total), based on historical flow-through | FY2025 10-K, Item 7, MD&A, p.37–38; Q1 2026 earnings call (Apr 29, 2026), CEO Bill Hornbuckle and COO Ayesha Molino prepared remarks |
| Triple-net lease rent escalation (VICI) | The ~$1.87B rent obligation in FY2025 ($34M higher than FY2024) is a fixed cost line that does not decline with revenue. Each year's escalator (up to 2% in the first 10 lease years) reduces the amount of revenue growth that converts to EBITDA. At 1.7% revenue growth in FY2025, the $34M rent increase consumed a meaningful share of incremental gross profit. | Headwind — rent escalates every year; FY2026 will see another $20–40M increase (Inference, not from filings). | High — on $1.87B of annual rent, a 2% escalation is $37M; at 13.8% Adj EBITDA margin, generating $37M of additional EBITDA requires ~$270M of incremental revenue | FY2025 10-K, Item 1A, Risk Factors p.14; Note 11 (lease structure); p.4436 (FY2023–2025 cash outflows: $1,803M / $1,833M / $1,867M) |
| Labor cost — union contract renewals | ~37,000 US employees are covered by collective bargaining agreements. Contracts for "small groups of Las Vegas property and corporate employees" expire in first half of 2026; ~3,000 regional employees also expire in 2026. CFO noted in Q4 2025 call: "wages are an important part of our cost structure, and we have been able to largely offset wage growth with labor complement." Ability to offset via headcount management is real but limited in a service business that requires minimum staffing. | Headwind — union contract renewals in H1 2026 likely bring higher base wages; management's ability to offset is only partial | Mid — a 3% wage increase across 37,000 employees would add roughly $75–90M to the labor cost base (Inference, not from filings — no payroll figure disclosed); partially offsettable by labor mix management | FY2025 10-K, Item 1A, Risk Factors ("significant portion of labor force covered by CBAs"); `06_value-chain.md`; Q4 2025 earnings call (Feb 05, 2026), CFO remarks |
| Table games hold percentage volatility | Gaming hold (the fraction of money wagered the house keeps) is partially random quarter-to-quarter. A 1-percentage-point hold swing on LV Strip table drop of $6.1B represents ~$61M in revenue impact. In Q1 2026, China hold was cited as negative in February but recovered to normal in March. CFO confirmed Q2 2025 was impacted by ~$20M negative hold. | Unknown — inherent volatility; current trending at or slightly above normalized levels in LV Strip and China | Mid — a 1pp hold swing on combined Strip+Regional+China table drop is ~$90–110M of revenue (Inference from disclosed drop figures: Strip $6.1B, Regional $4.0B, China $15.8B) | FY2025 10-K, MD&A, pp.38–39 (Strip 25.2%, Regional 20.4%, China 25.5%); Q4 2025 earnings call (Feb 05, 2026) on hold normalization; Q1 2026 earnings call (Apr 29, 2026), CEO remarks on March recovery |
| Macau (MGM China) volume growth | China net revenues grew 11% in FY2025, with EBITDAR up 11% to $1,203M. Q1 2026: China revenues grew 9% YoY, though segment Adj EBITDAR declined by $13M due entirely to the new brand fee structure (fee doubled from 1.75% to 3.5% of revenue — incremental ~$70M annual cost from 2026). Market share at 15.4% in Q1 2026, recovered to 17.3% in March 2026. | Tailwind (revenue side) but partially offset by brand-fee headwind in 2026 | Mid — brand fee step-up of ~$70M YoY is a one-time margin headwind in FY2026; underlying Macau volume trends supportive | Q1 2026 earnings call (Apr 29, 2026), CFO on brand fee: "brand fee increased from 1.75% to 3.5% of revenue starting this year"; FY2025 10-K, Item 7, MD&A, p.39 (EBITDAR $1,203M) |
| Segment mix shift | LV Strip (highest margin at 33.9% EBITDAR) declined as a % of revenue (-4% in FY2025), while China (27.0%) grew (+11%). This mix shift compressed consolidated margins: a segment earning lower margin became a larger share of total. MGM Digital (loss-making at -$90M EBITDAR) is growing fastest (+19% revenue), adding drag. | Headwind — mix continues to shift away from highest-margin segment (LV Strip) toward lower-margin China and loss-making Digital | Mid — LV Strip at 33.9% EBITDAR vs China at 27.0% and Digital at negative; if Strip continues declining as a revenue share, the margin mix headwind persists | FY2025 10-K, Item 7, MD&A, p.37–40 (segment revenue and EBITDAR tables); Capital IQ Financials_Annual.xls, Segments tab |
| MGM Digital losses | Digital EBITDAR loss was -$90M in FY2025, widening from -$77M in FY2024. Q1 2026 loss was -$26M (annualized: ~-$104M). Brazil investment could increase beyond original guidance. Management expects FY2026 loss to be "approximately half the losses that we had in 2025," implying ~-$45M target, but flagged Brazil as a potential upside risk. | Headwind near-term; management targets losses halving by FY2026 and approaching breakeven by FY2027 | Low-Mid — -$90M on $17.5B revenue is small in percentage terms (~50 bps on total revenue), but growing | Q4 2025 earnings call (Feb 05, 2026), CFO; Q1 2026 earnings call (Apr 29, 2026), Gary Fritz; FY2025 10-K, Item 7, MD&A, p.40 |
| Self-insurance / litigation accruals | Q1 2026: $46M one-time increase in self-insurance expense (LV $37M + Regional $9M). CFO described as "an increasing cost in our business" but characterized the specific charge as a one-time true-up, not expected to recur. Business interruption proceeds also declined $41M YoY in Q1 2026. | Headwind in Q1 2026; described as one-time but flagged as a structural trend | Mid near-term — $46M represents ~8% of quarterly Adj EBITDA ($580M in Q1 2026); if it does recur, roughly 100 bps annualized impact on EBITDA margin | Q1 2026 earnings call (Apr 29, 2026), CFO Jonathan Halkyard; Q1 2026 10-Q (Apr-29-2026), Non-GAAP reconciliation, p.1293 |
| Energy costs | Named as a specific risk in 10-K Risk Factors ("particularly sensitive to energy prices"). No dollar-quantified sensitivity disclosed. Higher gasoline prices also reduce drive-in traffic to Las Vegas and regional properties. | Unknown — no current-period commentary quantifying energy cost moves | Low-Mid — a meaningful operating cost but unquantified; management has not cited energy as a current quarter driver | FY2025 10-K, Item 1A, Risk Factors p.21; `10_external-dependency.md` |
| Operating leverage (fixed-cost absorption) | With revenue growth near stall (+1.7% in FY2025), fixed costs (rent, minimum staffing, D&A) absorbed a disproportionate share of the cost base. If revenue accelerates, the operating leverage reversal is the primary tailwind; if revenue stalls or declines, fixed-cost drag is the primary risk. | Neutral — revenue growth at +1.7% in FY2025 and +4.2% YoY in Q1 2026 is insufficient to generate meaningful leverage on the fixed base | High — this is the core dynamic: with $1.87B of fixed rent plus substantial fixed labor, every 1% of revenue growth that converts to EBITDA requires the fixed cost to stay flat | FY2025 10-K, Item 7, MD&A, p.36–41; historical financials analysis (see §01_historical-financials.md) |
| FX — USD-denominated MGM China debt | A 1% adverse move in USD/HKD-MOP creates a $20M FX loss. USD/HKD is pegged, so day-to-day this is low risk, but large USD strengthening creates balance-sheet translation losses that flow through net income and EPS. | Neutral (peg holds); medium risk if peg breaks or Chinese capital flows tighten | Low — operational revenue not directly FX-sensitive for China due to peg; financial statement impact mainly via mark-to-market on debt | FY2025 10-K, Item 7A, p.49 (quantified FX sensitivities) |

---

## 6. Margin Drivers By Segment

### Segment: Las Vegas Strip Resorts (48.1% of revenue)

| Driver | Impact | Direction | Magnitude | Evidence |
|---|---|---|---|---|
| Visitor volume and RevPAR | Primary revenue and margin driver. RevPAR fell 7% in FY2025 ($229 vs $245); revenue fell 4% ($8,442M vs $8,816M); EBITDAR fell 8% ($2,858M vs $3,107M). Q1 2026: LV net revenue grew YoY for first time in six quarters | Partially recovering — improvement in Q1 2026; convention business up; but midweek value-customer softness and Canadian visitor decline (down 30–40%) persist | High | FY2025 10-K, Item 7, MD&A, p.37–38; Q1 2026 earnings call (Apr 29, 2026), CEO and COO remarks |
| Convention and group business mix | Convention room-night mix expected at 20% in Q2 2026 (up 2 percentage points YoY). Q1 2026 set record 1Q convention ADRs and catering revenue. Convention demand supports higher ADR and fills midweek capacity that leisure underperforms | Tailwind — conventions drive premium ADR and higher margin vs leisure bookings; Google, Cisco, and other groups booked for summer | Mid | Q1 2026 earnings call (Apr 29, 2026), CEO; FY2025 10-K, MD&A p.38 (convention mix commentary) |
| Labor — union contract renewals | LV-specific: contracts for "small groups of Las Vegas property and corporate employees" expiring H1 2026. COO noted "cost control" as an active initiative at lower-tier properties (Luxor, Excalibur) | Headwind — expected wage increases on renewal | Mid | FY2025 10-K, Item 1, Employees; `06_value-chain.md`; Q4 2025 earnings call (Feb 05, 2026), CFO |
| Property damage/remodel disruption | FY2025 gross profit and EBITDAR were depressed by MGM Grand room remodel (offline capacity), estimated at ~$65M EBITDA impact. Remodel completed October 2025; ~54,000 incremental room-nights in FY2026 vs prior year | Tailwind for FY2026 — rooms fully back online; the prior-year comparison is easier | Mid | Q4 2025 earnings call (Feb 05, 2026), CFO; Q1 2026 earnings call (Apr 29, 2026), CEO |
| Self-insurance / litigation accruals | Q1 2026: $37M one-time charge; business interruption proceeds down $31M vs Q1 2025. Net ~$68M headwind in the quarter | One-time headwind in Q1 2026; not expected to recur at same magnitude | Mid (Q1 2026) | Q1 2026 earnings call (Apr 29, 2026), CFO; Q1 2026 10-Q, Non-GAAP reconciliation |
| Value-customer weakness (Luxor/Excalibur) | Midweek softness at lower-tier properties. CEO noted these two properties represent only ~6% of Las Vegas segment Adj EBITDA — limited P&L impact if portfolio as a whole holds | Headwind — midweek demand at value tier remains soft; deploying all-inclusive bundles to attract customers | Low | Q1 2026 earnings call (Apr 29, 2026), CEO and COO; Q4 2025 earnings call (Feb 05, 2026), CEO |

### Segment: MGM China (25.4% of revenue)

| Driver | Impact | Direction | Magnitude | Evidence |
|---|---|---|---|---|
| Macau visitor arrivals | Chinese visitor arrivals to Macau +15% in FY2025; revenue +11%; EBITDAR margin held at 27.0%. Q1 2026 revenue +9% YoY. Market share 15.4% in Q1 2026 (recovered to 17.3% by March 2026) | Tailwind — Macau tourism recovering; Golden Week and upcoming 100-suite renovation at MGM Macau supportive | Mid | FY2025 10-K, Item 7, MD&A, p.39; Q1 2026 earnings call (Apr 29, 2026), CEO Kenny Feng |
| Brand fee doubling (1.75% → 3.5% of revenue, from 2026) | Fee increase from 1.75% to 3.5% of MGM China revenue — on ~$4.46B revenue run-rate, this represents ~$78M additional fee to parent MGM Resorts in FY2026. This reduces MGM China segment EBITDAR while increasing parent cash flow (the fee is intercompany) | Headwind to segment margin — segment Adj EBITDAR declined $13M in Q1 2026 with $23M more in fees. At the parent level it is cash-flow neutral to positive | Mid — at segment level, ~$78M headwind in FY2026; at parent/consolidated level, net neutral (intercompany elimination) | Q1 2026 earnings call (Apr 29, 2026), CFO: "brand fee increased from 1.75% to 3.5% of revenue starting this year" |
| Table games hold | China Q1 2026 segment margin impacted by February hold weakness; March recovered to normalized levels. Side-bet adoption growing (higher house edge, up to 15 new side bets being rolled out per Q1 2026 call) | Neutral-to-tailwind near-term; inherently volatile | Mid | Q1 2026 earnings call (Apr 29, 2026), CEO Kenny Feng on side bets; FY2025 10-K, MD&A, p.39 (hold 25.5% FY2025 vs 25.0% FY2024) |
| Premium mass investment (suite renovation) | 60 suites opened at MGM Cotai in Q1 2026; 100+ suites in design phase for MGM Macau. Premium suite and gaming space upgrades targeted at premium mass customers | Tailwind — incremental capex ($195M in FY2025) drives premium mix improvement and higher win per visitor | Mid | Q1 2026 earnings call (Apr 29, 2026), CEO Kenny Feng; FY2025 10-K, Capital Expenditures |
| Gaming taxes (Macau) | Macau gaming taxes are a large, jurisdiction-fixed cost. Not disclosed as a specific percentage in filings, but broadly ~35–40% of gross gaming revenue in Macau (Inference from industry norms and cost structure analysis). | Neutral — stable regulatory environment under the renewed concession through 2032 | High (absolute magnitude) | FY2025 10-K, Item 1A, Risk Factors, Macau section |

### Segment: Regional Operations (21.5% of revenue)

| Driver | Impact | Direction | Magnitude | Evidence |
|---|---|---|---|---|
| Slot handle (volume) | Regional is gaming-primary (~70% of revenue from gaming). Slot handle drives the majority of regional casino revenue. Q4 2025 delivered "best-ever annual slot win performance," up 2% net revenue; Q1 2026 showed top-line growth of 2% | Stable-to-improving — slot volumes solid; CFO noted "strength in slot handle" continuing into Q1 2026 | High | Q4 2025 earnings call (Feb 05, 2026), CFO; FY2025 10-K, Item 7, MD&A, p.39 |
| Self-insurance and weather | Q1 2026: $9M self-insurance charge; weather disruptions at Borgata (NJ) and National Harbor (MD). | One-time headwind in Q1 2026 | Low | Q1 2026 earnings call (Apr 29, 2026), CFO |
| Portfolio change (Northfield Park sale) | Northfield Park sold for $546M (6.6x trailing EBITDA); closed in April 2026. Removes a slot-only regional asset from the portfolio. Management will provide same-store comparisons going forward. | Neutral — the sold asset's EBITDA was already embedded; going-forward results on smaller base | Low-Mid | Q1 2026 earnings call (Apr 29, 2026), CFO; FY2025 10-K, Item 7, MD&A, Regional section |
| Regional competitive dynamics | Stable; management characterized regional as "maintaining steady market share" and "consistent, reliable performance" | Neutral | Low | Q1 2026 earnings call (Apr 29, 2026), CEO |

### Segment: MGM Digital (3.7% of revenue)

| Driver | Impact | Direction | Magnitude | Evidence |
|---|---|---|---|---|
| LeoVegas revenue growth | LeoVegas B2C business growing >30% in Sweden and U.K.; Q1 2026 MGM Digital revenue +43% YoY | Tailwind on revenue; still loss-making at EBITDAR level (-$26M in Q1 2026) | Low-Mid (on consolidated margins) | Q1 2026 earnings call (Apr 29, 2026), Gary Fritz and CFO |
| Brazil investment increase | Brazil regulatory/tax changes may cause investment to exceed original guidance in FY2026 | Headwind — incremental spend pushes segment to deeper losses near-term | Low | Q1 2026 earnings call (Apr 29, 2026), CFO: "we may drive investment beyond our original guidance" |
| Path to breakeven | Management targeting FY2026 losses ~half of FY2025 (~-$45M target) and close to breakeven in FY2027 | Improving directionally; execution risk in the Brazil market | Low (on FY2026 consolidated margins) | Q4 2025 earnings call (Feb 05, 2026); Q1 2026 earnings call (Apr 29, 2026), Gary Fritz |

---

## 7. Margin Bridge — Latest Period

**FY2024 → FY2025 at Consolidated Adjusted EBITDA level:**

| Component | Margin Impact (bps) | Dollar Impact ($M) | Evidence |
|---|---:|---:|---|
| LV Strip EBITDAR decline | -142 | -$249 | Revenue fell 4% ($8,816M → $8,442M); EBITDAR fell 8% ($3,107M → $2,858M); FY2025 10-K, Segment table |
| MGM China EBITDAR growth | +67 | +$116 | Revenue grew 11% ($4,022M → $4,462M); EBITDAR grew 11% ($1,087M → $1,203M); FY2025 10-K, Segment table |
| Regional EBITDAR growth | +11 | +$20 | Revenue grew 1.4% ($3,720M → $3,772M); EBITDAR grew 1.7% ($1,144M → $1,163M); FY2025 10-K |
| MGM Digital EBITDAR worsening | -8 | -$13 | Loss deepened from -$77M to -$90M; FY2025 10-K |
| Corporate / rent / other improvement | +81 | +$141 | Corporate and Other EBITDAR improved from -$2,849M to -$2,708M; may include BetMGM income swing ($60M in FY2025 vs -$91M in FY2024 = $151M swing in affiliate income, partially offset by rent escalation); Capital IQ Segments tab |
| **Total Consolidated Adj EBITDA change** | **+9** | **+$15** | Matches filing: $2,426M vs $2,411M; FY2025 10-K, MD&A, Non-GAAP reconciliation |
| Revenue growth effect (volume/price) | — | — | Revenue grew $297M (+1.7%); most of this is from Macau volume recovery |
| COGS absorption (COGS grew 3.8% vs rev +1.7%) | -110 bps gross margin | — | COGS: $9,394M → $9,748M; Capital IQ Income Statement tab |
| D&A step-up (EBIT-level only) | -202 bps EBIT margin (not EBITDA) | -$187 | D&A: $831M → $1,018M; Capital IQ Income Statement tab |
| Goodwill impairment (Empire City) | EBIT-level only | -$279 | Q3 2025; FY2025 10-K, MD&A, Regional section; excluded from Adj EBITDA |

**Note on bridge limitations:** MGM does not publish a formal margin bridge. The segment decomposition above is constructed from the disclosed segment EBITDAR table (FY2025 10-K, MD&A, p.37–39) and reconciles within $1M to the reported consolidated Adj EBITDA. The "Corporate / rent / other improvement" row includes the BetMGM equity income swing and other intercompany items that are not individually disclosed. Rent escalation of $34M is embedded within Corporate and partially offset by the BetMGM improvement.

**Q1 2026 vs Q1 2025 Adjusted EBITDA bridge:**

| Component | Dollar Impact ($M) | Evidence |
|---|---:|---|
| Self-insurance true-up — LV | -$37 | Q1 2026 earnings call (Apr 29, 2026), CFO |
| Self-insurance true-up — Regional | -$9 | Q1 2026 earnings call (Apr 29, 2026), CFO |
| Business interruption proceeds decline — LV | -$31 | Q1 2026 earnings call (Apr 29, 2026), CFO |
| Business interruption proceeds decline — Regional | -$10 | Q1 2026 earnings call (Apr 29, 2026), CFO |
| China brand fee increase | -$23 | Q1 2026 earnings call (Apr 29, 2026), CFO; brand fee doubled to 3.5% |
| LV Strip operating improvement (convention, MGM Grand rooms) | +$40–50 (estimated, Inference) | Revenue grew YoY for first time in six quarters |
| China volume growth (partially offset by brand fee) | ~flat net | Q1 2026 earnings call (Apr 29, 2026), CEO: "solid performance" |
| Other (FX, Digital, Regional) | ~flat | Various |
| **Total Q1 2026 Adj EBITDA vs Q1 2025** | **-$57** | $580M vs $637M; Q1 2026 10-Q (Apr-29-2026), p.1293 |

Without the self-insurance and business interruption items ($77M combined), Q1 2026 Adj EBITDA would have been roughly $657M — an improvement vs the $637M prior-year quarter, as underlying operations recovered.

---

## 8. The Single Biggest Margin Driver

**Las Vegas Strip operating leverage under fixed rent.**

The Triple-net lease rent to VICI ($1.87B/year, rising annually) is the structural constraint on MGM's margin recovery. But it is not itself a "driver" — it is fixed. What makes it the central margin variable is the operating leverage it creates: every dollar of Las Vegas Strip revenue growth above the zero line converts at an extremely high rate to EBITDA (roughly 80–85% flow-through on incremental Strip revenue, based on the FY2024–2025 reverse), while every dollar of revenue decline below flat destroys EBITDA at the same rate.

The Las Vegas Strip ($8.4B revenue, 48% of total) is currently in a softening cycle — visitor volume fell 8% in 2025, RevPAR fell 7%, and revenue fell 4% despite a flat overall hospitality market. The business has partially stabilized in Q1 2026 (LV revenue grew YoY for the first time in six quarters, driven by convention calendar and the return of MGM Grand room inventory). But the midweek value-customer segment remains soft, Canadian visitors are down 30–40%, and international first-time visitors are at record lows.

If Las Vegas Strip revenue decelerates again or contracts from here — due to a US consumer slowdown, further decline in Canadian/international inbound, or convention cancellations — the fixed rent structure means EBITDA will compress sharply. Conversely, if the convention calendar holds and leisure stabilizes, the operating leverage means a modest 3–4% Strip revenue recovery could deliver outsized EBITDA uplift.

The current direction is a tentative partial recovery, but it is fragile: the short booking cycle (management's own word) means forward visibility is limited, and any macro shock (rising gasoline prices reducing drive-to-Vegas traffic, a recession, geopolitical disruption to international travel) could reverse the Q1 2026 momentum quickly.

---

*Limitation note: The earnings transcripts for Q1 2026 and Q4 2025 were available and provided material commentary on costs, margins, and forward-looking factors, which is incorporated above. No segment-level GAAP operating income is disclosed by MGM — analysis is conducted on segment Adjusted EBITDAR, which is the company's standard segment reporting measure. Energy cost exposure is named as a risk but not quantified; no sensitivity table appears in the 10-K for energy. Gaming tax rates by jurisdiction are embedded in disclosed segment revenues and costs but are not separately disclosed in a single consolidated table.*
