# Margin Drivers — EMAR (Emaar Properties PJSC, DFM: EMAAR)

*Reporting basis: IFRS. Currency: AED millions unless stated (the dirham is pegged to the US dollar at ~3.6725 AED/USD). Fiscal year ends 31 December. Diluted shares ~8,838.8m. Upstream: `earnings/01_historical-financials.md` (present). Cross-module: business-model `02_business-identity`, `03_segment-map`, `06_value-chain`, `10_external-dependency` (all present).*

*Plain-English glossary (first use): **gross margin** = sales minus the cost of the land and building in what was handed over; **EBITDA** = rough operating cash profit before interest, tax and depreciation; **EBIT** = operating profit; **NOI** = net operating income (rent minus running costs of a property); **bps** = basis points (100bps = 1.0 percentage point); **off-plan** = homes sold before they are built, paid in instalments during construction; **DMTT** = Domestic Minimum Top-up Tax (the OECD "Pillar Two" 15% minimum corporate tax).*

**Transcript source (MODULE_RULES — Transcript Sourcing).** No verbatim earnings-call transcript is in the pool. Management margin commentary comes from FAB Securities "Earnings Call Insight" notes for 3Q25 and 4Q25 — a paraphrase of the call, used **verdict-stripped** (the BUY rating and AED price target are dropped and never cited). Every margin **number** is anchored to the audited filing, the CIQ workbooks, or the company press release; call-derived colour is flagged "via unverified sell-side paraphrase." Tone/candor is not assessable from a paraphrase.

**Sector overlay (step 3b).** Sector overlay applied: **REIT / real estate** (business type per `02_business-identity` §3a) — but with a **hybrid margin grammar**, because Emaar is ~80% a **build-to-sell developer**, not a rent-collecting REIT. So: (a) the dominant developer engine uses **homebuilder grammar** — cost of sales (land + construction) and development **gross margin**, which management explicitly guides; (b) the 15% leasing/retail annuity uses **REIT grammar** — NOI / segment margin with depreciation treated as non-economic (backed out); (c) the 5% hospitality uses occupancy / room-rate. A pure-REIT "use NOI, D&A is non-economic, no COGS" table would be **wrong** here: for 80% of revenue, cost of sales (land + construction) is the single largest and most economically real cost, so it stays in the cost stack.

**Cycle position (Cycle-Position Rule).** Emaar's margins sit at or near a **Dubai property-cycle peak — not a normalised run-rate.** Evidence: 2025 was Dubai's strongest year on record (215,458 residential transactions, +18.9%; 270,000+ total deals worth AED 892bn) [Q4'25 call, unverified]; group revenue near-doubled FY2021 AED 27,896m → FY2025 AED 49,557m [CIQ Financials_Annual, Income Statement]; consensus long-term growth is −14.8%, i.e. the market prices a roll-over [ciq_facts.json consensus_view]; base rate is Dubai boom-bust (2009; 2015–2019) [10_external-dependency §3]. Two forces flatter today's margin and can reverse: (1) the **land-vs-price spread** — cheap legacy land (land bank at cost AED 50,235m [AR Industry-Specific tab]) sold at peak prices — which management is already guiding down (gross margin 63% FY2023 → 55% FY2025 → "low 50s sustainably") [06_value-chain §2; Q4'25 call, unverified]; and (2) large **net finance income** on the peak-cycle cash pile (below EBIT — see driver 5). One-time policy items labelled non-run-rate: the UAE corporate tax + DMTT is a **new, largely permanent step-down in net margin** (added AED 2,114m of tax in 2025) — a structural headwind, not a tailwind; and a Q3-2025 one-off tax relief (MD120) that reversed part of the charge is non-recurring [10_external-dependency §1; Q3'25 call, unverified].

---

## 1. Segment Decomposition Status

**Segment-level P&L is disclosed and used.** `business-model/03_segment-map` (audited FY2025 Note 3) and the CIQ quarterly Segments tab give revenue AND pre-tax result by segment back to FY2020, so margins are decomposed per segment (Section 6). Emaar is **not** single-segment: Real Estate is 79.8% of FY2025 revenue and 74.9% of segment profit — dominant but below the 85% line [FY2025 AR, Note 3, p.187–188; ciq_facts.json segments_revenue].

Three reportable segments (FY2025 revenue / share):
- **Real Estate (build-to-sell)** — AED 39,550m / 79.8%
- **Leasing, Retail & Related (malls)** — AED 7,681m / 15.5%
- **Hospitality** — AED 2,326m / 4.7%

Caveat carried from segment-map: the segment "result" is struck **after** finance income/cost, so it is **not** a clean operating (EBIT) margin — the Real Estate result is lifted by ~AED 2,770m of finance income; strip it and the clean development operating margin is ~45%, not ~50% [FY2025 AR, Note 3, p.188; 03_segment-map §1].

## 2. Cost Stack

Disclosed consolidated cost lines (CIQ standardized income statement; ties to the audited IFRS statements). This is the **developer-appropriate** stack — cost of sales (land + construction) is a real cash cost for 80% of revenue and stays in; the REIT "D&A non-economic" note applies only to the leasing/hotel investment property sitting inside the D&A line. Freight, energy and labour are not separately disclosed — they sit inside contractor cost of sales.

| Cost Line | % of Revenue FY2025 (FY2024) | Direction | Evidence | Margin Risk |
|---|---:|---|---|---|
| Cost of sales (land + construction) | 45.1% (42.6%) | Rising — up ~250bps | [CIQ IS; AR Industry-Specific, Total Cost of Sales 22,330] | **High** — mix, construction-cost inflation, narrowing land-price spread |
| Labour / freight / energy | Not disclosed (inside cost of sales, via contractors) | n/a | [06_value-chain §2] | n/a — construction outsourced to a fragmented contractor pool |
| SG&A | 7.3% (9.1%) | Falling as % — operating leverage | [CIQ IS, SG&A 3,595] | **Mid** — tailwind reverses if revenue growth slows (SG&A grew ~24% YoY in Q4'25 vs +11% for the full year) |
| R&D | none | n/a | [CIQ IS] | n/a |
| D&A | 3.1% (4.0%) | Falling as % | [CIQ IS, D&A 1,530] | **Low** — non-cash; mostly leasing/hotel investment property |
| Interest expense | 1.0% (1.7%) | Falling | [CIQ IS, interest 492] | **Low** — net cash, ~52x interest cover |
| Income tax (effective rate) | 13.0% (7.7%) | Rising sharply | [FY2025 AR, tax note 2.4; CIQ IS] | **High** — UAE CT + DMTT (Pillar Two); below EBIT, hits net margin, largely permanent |

Reconciliation to the facts sidecar: FY2025 gross margin 54.9% ≈ sidecar 55%; EBITDA margin 48.7% ≈ 49% — no material gap [ciq_facts.json margin_trend].

## 3. Gross Margin → EBITDA Margin → EBIT Margin Walk

Latest full year (FY2025) vs prior year (FY2024). EBITDA = CIQ standardized (operating income + D&A) — kept apart from the company's non-IFRS EBITDA, which is ~AED 1.0–1.5bn higher because it folds in net finance income and joint-venture results (§15) [01_historical-financials §4].

| Margin Level | FY2025 | FY2024 | Change bps | Main Reason | Evidence |
|---|---:|---:|---:|---|---|
| Gross margin | 54.9% | 57.4% | **−246** | Mix — faster-growing residential/commercial development carries a lower gross margin than leasing; land-price spread narrowing; construction-cost inflation absorbed on the sold backlog | [CIQ IS; Q4'25 & Q3'25 calls, unverified] |
| EBITDA margin (CIQ std) | 48.7% | 49.5% | **−77** | Gross-margin compression (−246bps) mostly offset by SG&A operating leverage (+185bps) | [CIQ IS] |
| EBIT margin | 45.5% | 45.4% | **+6** | Flat — D&A leverage (+93bps) offsets the rest; EBIT margin has held ~45% for three years | [CIQ IS] |

**Pass-through lag (input costs → price).** Emaar has **no** contractual cost-escalator on off-plan units already sold, so construction-cost inflation is absorbed on the ~AED 155bn sold-but-not-built backlog. It is passed forward only at the **next launch** — a lag of roughly **one launch cycle**; FY2025 launches were re-priced up while still clearing 90–100% absorption [06_value-chain §2; Q4'25 call, unverified].

## 4. Margin Walk — Which Margin Level Matters Most?

**Gross margin is the primary metric for Emaar, tracked alongside the leasing NOI (segment) margin.** For the 80%-of-revenue developer engine, gross margin (sales minus the land and construction cost of what was handed over) is the number management actually guides — "low 50s sustainably" — and it is where the core economics live: the spread between cheap legacy land and current selling prices, plus product mix. That is homebuilder grammar, not REIT grammar. EBITDA margin is a weaker lens because the company's own EBITDA folds in finance income and JV profit, which flatters and muddies the operating read (I use CIQ standardized EBITDA to avoid that). EBIT margin has been almost flat (~45%) for three years and hides the gross-margin move under SG&A leverage. The 15% leasing annuity is best tracked at its NOI/segment margin (~69%, depreciation backed out). One caution for downstream modules: **the reported net margin is now shaped as much by two below-EBIT forces — net finance income (up) and tax/DMTT (up) — as by the operating margin**, so gross margin tells you the operating story while net margin needs those two moves read on top.

## 5. Margin Driver Table (consolidated)

Magnitude = bps impact on the primary metric (gross margin) from a reasonable move, **except** where a driver sits below EBIT (finance income, tax, minority interest), where the impact is on PBT / net margin — labelled inline. Direction: **Tailwind** = pushes margin up; **Headwind** = pushes margin down; **Neutral**; **Unknown**.

| Driver | Impact on Margins | Direction | Magnitude | Evidence |
|---|---|---|---|---|
| **Segment mix (development vs leasing)** | Real Estate (~55% gross / ~45% clean operating) growing faster than Leasing (~69%); revenue share 74.7%→79.8%, so more weight lands on the lower, falling margin | **Headwind** | **High** | [FY2025 AR Note 3; CIQ Segments; Q3'25 call, unverified] |
| **Within-development margin (land-price spread, vintage, unit mix)** | Cheap legacy land vs peak prices gives ~55% dev gross margin; narrows as new land is bought at current prices and newer vintages hand over; guided to "low 50s" | **Headwind** | **High** | [06_value-chain §2; Q4'25 call, unverified] |
| **Construction / input-cost inflation** | Steel, cement, labour bought through contractors sit in cost of sales (~45% of revenue); no pass-through on the sold backlog, re-priced only at next launch (~1 launch-cycle lag) | **Headwind** | **Mid** | [10_external-dependency §1; 06_value-chain §2] |
| **SG&A operating leverage** | SG&A fell 9.1%→7.3% of revenue (14.5% in FY2021) as revenue scaled; +185bps to EBITDA margin FY24→25 | **Tailwind** | **Mid** | [CIQ IS] |
| **Net finance income (net-cash pile × rates)** | ~AED 25bn net cash (broad basis) earns ~AED 2,505m interest vs ~AED 492m interest cost → net +AED 2,013m; lifts PBT/segment-result margin ~+400bps; rate-sensitive (US Fed via AED peg) | **Tailwind** (below EBIT) | **Mid** | [CIQ IS; ciq_facts.json net_debt] |
| **Tax — UAE CT + DMTT (Pillar Two)** | Effective rate 1.5% (FY23) → 7.7% (FY24) → 13.0% (FY25); DMTT added AED 2,114m in 2025; cuts net margin, largely permanent | **Headwind** (net margin) | **High** | [FY2025 AR tax note 2.4; CIQ IS] |
| **Minority interest (Emaar Development sub)** | ~AED 4,726m of net income (21%) leaks to Emaar Development minorities; rises as that faster-growing arm outgrows the group | **Headwind** (net-to-owners) | **Mid** | [CIQ IS, Minority Int. 4,726] |
| **Leasing occupancy / NOI** | Malls ~98% occupancy; ~69% segment margin, stable — the annuity that cushions, not the swing factor | **Neutral** | **Low** | [Q1'26 press release; FY2025 AR Note 3] |
| **Hospitality occupancy / room rate** | 5% of revenue; margin volatile 27–43%; UAE hotel occupancy 82% FY25 → 69% Q1'26 | **Unknown** | **Low** | [CIQ Segments; Q4'25 & Q1'26 press releases] |
| **FX** | 93% UAE, AED pegged to USD; only Egypt (EGP) / India (INR) exposed, and those flow to reserves (OCI), not the margin | **Neutral** | **Low** | [10_external-dependency §1–2] |

## 6. Margin Drivers By Segment

Segment "result" is pre-tax and post-finance (not a clean EBIT). Real Estate is lifted by finance income; the clean development operating margin is ~45% [03_segment-map §1].

### Segment: Real Estate (79.8% of revenue)

Segment margin (result ÷ revenue): **FY2024 52.3% → FY2025 49.9% (−239bps)**; ~45% on a clean, ex-finance-income basis. This is where the group compression comes from.

| Driver | Impact | Direction | Magnitude | Evidence |
|---|---|---|---|---|
| Land-price spread / project vintage | Cheap legacy land vs peak selling prices; spread narrows over time | Headwind | High | [06_value-chain §2] |
| Unit mix (residential/commercial; villa/apartment) | 2026 unit mix guided ~40% villa / ~60% apartment, similar to 2025; residential-unit margin softened | Headwind | High | [Q4'25 call, unverified] |
| Construction-cost inflation | Absorbed on fixed-price sold backlog; passed forward only at new launch | Headwind | Mid | [10_external-dependency §1] |
| Finance income on segment cash/receivables | +AED 2,770m lifts the reported segment margin ~500bps above clean operating | Tailwind (below op) | Mid | [FY2025 AR Note 3, p.188] |

### Segment: Leasing, Retail & Related (15.5% of revenue)

Segment margin: **FY2024 67.1% → FY2025 69.3% (+220bps)** — the stable, high-margin annuity; revenue share slipped 19.6%→15.5% only because development grew faster.

| Driver | Impact | Direction | Magnitude | Evidence |
|---|---|---|---|---|
| Mall occupancy / footfall | ~98% occupancy; Dubai Mall 110m+ visitors 2025 | Tailwind | Mid | [Q1'26 & Q4'25 press releases / call] |
| Rent escalation + turnover rent | Base rent + turnover rent + service charges; pricing power over tenants | Tailwind | Mid | [06_value-chain §1] |
| New GLA (Dubai Mall / Square expansion) | Adds capacity from 2H27–2H28; near-term depreciation/opex before new rent matures | Headwind (near-term) | Low | [Q3'25 call, unverified] |
| E-commerce / retail shift | Structural risk to footfall-linked rent | Headwind | Low | [03_segment-map] |

### Segment: Hospitality (4.7% of revenue)

Segment margin: **FY2024 36.7% → FY2025 37.4% (roughly flat)**; volatile and seasonal.

| Driver | Impact | Direction | Magnitude | Evidence |
|---|---|---|---|---|
| Occupancy / room rate (RevPAR) | UAE hotel occupancy 82% FY25 → 69% Q1'26 (seasonal); Dubai tourism sets rates, not Emaar | Unknown | Low | [Q4'25 & Q1'26 press releases] |
| Management-contract mix | 75%+ of the hotel pipeline is fee-based management contracts (capital-light) | Tailwind | Low | [Q3'25 call, unverified] |

## 7. Margin Bridge — Latest Period

EBITDA-margin bridge, FY2025 vs FY2024 (CIQ standardized). The full-year comparison is used because it has complete cost-line disclosure and is cleaner than a QoQ that is dominated by Q4 seasonality. Numbers are actual; the split **inside** the gross-margin line is management's qualitative attribution, labelled where it is not separately disclosed.

| Component | Margin Impact (bps) | Evidence |
|---|---:|---|
| Volume / operating leverage (SG&A) | **+185** | [CIQ IS — SG&A 9.1%→7.3% of revenue] |
| Price (launch price increases) | positive, not quantified | Sits inside the gross-margin line; no ASP disclosed [Q4'25 call, unverified] |
| Input costs (construction) | negative, not quantified | Sits inside the gross-margin line; no input-cost split disclosed [10_external-dependency §1] |
| Mix (segment + within-development) | **≈ −246** (the gross-margin line; the dominant, management-named driver) | [Q4'25 & Q3'25 calls, unverified; CIQ IS] |
| FX | ~0 | AED pegged to USD; 93% UAE [10_external-dependency §2] |
| One-offs | 0 (no writedowns FY24–25; asset writedowns were FY21–23) | [CIQ IS] |
| Other (other operating income −26; amortization add-back +10) | **−16** | [CIQ IS] |
| **Total EBITDA-margin change** | **≈ −77 (≈ −80)** | 49.5% → 48.7% [CIQ IS] |

**What's missing for a fuller bridge:** Emaar does not disclose average selling price, units-by-price, or an input-cost breakdown, so **price, volume and input cost cannot be split out of the single gross-margin line** — they collapse into it, and only the mix driver is named qualitatively. Below EBITDA, two further moves shape net margin: net finance income (+, rate-driven) and the DMTT tax step-up (effective rate +530bps FY24→25) — both flagged separately, outside this EBITDA bridge.

## 8. The Single Biggest Margin Driver

**Development mix — the Dubai residential development gross margin — is the single biggest driver, and its current direction is down.** It cut group gross margin 246bps in FY2025 (57.4%→54.9%), and management guides it further to "low 50s sustainably." It matters most because 80% of revenue is build-to-sell development, the group sits at or near a Dubai-cycle peak (so the flattering land-vs-price spread narrows from here), and a demand roll-over would hit both the price side (softer selling prices, weaker absorption) and, mechanically, the mix side. A useful contrast: the two below-EBIT forces move in opposite directions — net finance income helps net margin while the new DMTT tax hurts it — but neither is the operating story. If one number decides whether margins expand or compress next year, it is the development gross margin, and today it is compressing off a cycle high.
