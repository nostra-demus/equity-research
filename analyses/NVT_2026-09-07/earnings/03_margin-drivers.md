# Margin Drivers — NVT

**Company:** nVent Electric plc (NYSE: NVT). **Regime:** US SEC domestic filer (Irish-incorporated), **US GAAP**, **USD in millions**, fiscal year ends **31 December** [`00_earnings-data-triage.md`, §0].

**Evidence binding: frozen.** Every read resolved through generation `6db32848…1aecd1e6` (`manifest.json`, `corpus.txt`, `ciq_facts.json`, per-tab extracts). Live `data/NVT/` was not read; `data/NVT/…` is a citation label only.

**Upstream inputs used:** `01_historical-financials.md` (margin baseline), `00_earnings-data-triage.md`, `04_guidance-consensus.md`. **Cross-module inputs used:** business-model `02_business-identity.md`, `03_segment-map.md`, `06_value-chain.md`, `10_external-dependency.md` — all present, so the no-business-model disclaimer does **not** apply.

**Basis note carried from upstream:** there is **no FY2025 Form 10-K in this pool**. FY2025 full-year cost and margin lines are cited to the Capital IQ export (tier-5 vendor data, as of ~12-Aug-2026), never under a filing's name. Q2 FY26, Q1 FY26 and their prior-year comparatives are filing-grade [`00_earnings-data-triage.md`, §5].

### Plain-English definitions used here

- **Basis point (bps)** = one hundredth of a percentage point; 100bps = 1.0 percentage point.
- **Gross margin** = (net sales − cost of goods sold) ÷ net sales. What is left after the direct cost of making the product.
- **Segment income** = the company's own segment profit measure: operating income including some corporate overhead allocations, but **excluding** intangible amortisation, acquisition costs, restructuring, IEEPA tariff reimbursements, pension mark-to-market, impairments and other unusual items [Q2 FY26 10-Q, Note 13, p.19–20]. It is **not** an operating margin.
- **Return on sales (ROS)** = the company's adjusted operating income ÷ net sales — management's own headline margin measure [Q1 FY26 earnings presentation, 1-May-2026, slide 16].
- **Incrementals** = cents of extra profit earned per extra dollar of sales. Management guides "mid-20s incrementals" for H2 FY26 [Q2 FY26 transcript, Q&A (Corona)].
- **IEEPA tariffs** = tariffs previously paid under the US International Emergency Economic Powers Act and since **reimbursed** to the company. $25.8m landed in Q2 FY26 gross profit [Q2 FY26 10-Q, Note 13, p.21].

---

## 0. Sector Overlay Result (step 3b)

**No sector overlay for an electrical-hardware manufacturer with engineered project work — generic cost stack applies.**

`frameworks/SECTOR_OVERLAYS.md` carries rows for SaaS, bank, insurer, REIT, miner, oil & gas, retail, telecom, asset manager and pharma. The business-model module classified NVT as an "electrical-hardware manufacturer selling standard product through distributors alongside a fast-growing engineered, backlog-delivered project business" and matched it to the file's **"Generic operating company (default)"** row [`business-model/02_business-identity.md`, §3 and §3a]. This module reaches the same result independently: NVT reports cost of goods sold, SG&A, R&D and D&A on the face of its income statement and has no NIM, no combined ratio, no NOI, no AISC and no fee rate. The generic volume / price / mix / operating-leverage cost stack below is therefore the correct grammar, and a bank-, REIT- or miner-style margin table would be the wrong numbers.

---

## 1. Segment Decomposition Status

**Decomposed by segment. Two reportable segments, neither below the 15% threshold, so the >85% single-segment shortcut does NOT apply.**

| Item | Status |
|---|---|
| Business-model `03_segment-map.md` available? | **Yes** — read and used |
| Number of reportable segments | **Two**: Systems Protection, Electrical Connections. Plus "Enterprise and other", which is an unallocated **cost pool**, not a segment (fails the ASC 280 test) [Q2 FY26 10-Q, Note 13, p.19] |
| Revenue split, H1 FY26 | Systems Protection **72.5%** ($1,966.9m), Electrical Connections **27.5%** ($746.4m) of $2,713.3m [Q2 FY26 10-Q, Note 13, p.20] |
| Segment-level P&L disclosed? | **Yes, unusually fully.** The 10-Q gives, by segment: net sales, **cost of goods sold**, SG&A, R&D, segment income, identifiable assets, depreciation and capex [Q2 FY26 10-Q, Note 13, p.20–22] |
| Can segment **gross** margin be computed? | **Yes** — segment COGS is disclosed. This module computes it below. This is a stronger disclosure than most industrials give and it is what makes the Section 7 bridge reconcile |
| What is NOT disclosed at segment level | Intangible amortisation (all unallocated), enterprise costs, restructuring, acquisition costs, IEEPA reimbursements, freight, energy, labour, raw-material cost, segment backlog, segment order intake [Q2 FY26 10-Q, Note 13, p.19–21; `business-model/03_segment-map.md`, §3] |
| Audited annual segment note for FY2025? | **No** — FY2025 10-K absent. Latest audited segment note is FY2024 [`00_earnings-data-triage.md`, §5] |

**One structural warning that governs everything below.** The segment that is growing is the **lower-gross-margin** one. Systems Protection went from 60.7% of revenue (FY2024, audited) to 72.5% (H1 FY26) [FY24 10-K, Note 15, p.70; Q2 FY26 10-Q, Note 13, p.20], and its gross margin is roughly 9 percentage points below Electrical Connections'. Mix is therefore a standing, mechanical drag on group gross margin that has nothing to do with cost inflation — and the announced Maverick Power acquisition ($1.75bn, ~$700m of estimated 2026 revenue, expected to close Q4 2026) most likely lands in Systems Protection and pushes the mix further the same way [`nVent-to-Acquire-Maverick-Power-2026.pdf`, 24-Aug-2026; `business-model/03_segment-map.md`, §2 — segment placement is inference, not from filings].

---

## 2. Cost Stack

Consolidated, reported (not adjusted) basis. Latest quarter is filing-grade; the FY2025 column is vendor-sourced because no FY2025 10-K exists.

| Cost Line | Q2 FY26 (% of net sales) | Q2 FY25 | YoY change | Direction | Evidence | Margin Risk |
|---|---:|---:|---:|---|---|---|
| **Cost of goods sold** (total) | **62.07%** ($913.3m) | 61.40% ($591.3m) | **+68bps** (worse) | Headwind | Q2 FY26 10-Q, Statements of Income, p.3 | High — every 100bps of COGS ratio is ~$15m of quarterly profit |
| — Raw materials (steel, stainless, copper, aluminium, electronic components, paint) | **Not disclosed** as a separate line or as a share of COGS | Not disclosed | n/a | Headwind (named) | Inputs named at FY24 10-K, Item 1 — Raw materials; inflation named at Q2 FY26 10-Q, MD&A Gross profit, p.27 | High — no commodity hedging programme is disclosed anywhere in the pool [FY24 10-K, Item 7A], so metal prices move straight into COGS |
| — Labour | **Not disclosed** as a separate line | Not disclosed | n/a | Headwind (named) | "inflationary increases, primarily related to raw materials and labor costs" [Q2 FY26 10-Q, MD&A Gross profit, p.27] | Mid |
| — Tariffs (all-in cost) | **~$100m guided for FY2026** ≈ 186bps of guided revenue; ">$30m" in Q2 alone ≈ 204bps of Q2 sales | ~$90m in FY2025 (management count) | Rising | Headwind | Q2 FY26 transcript, prepared remarks (Corona), 31-Jul-2026 | **High** — see §7/§9 for the mitigation arithmetic |
| — IEEPA tariff **reimbursement** (credit inside COGS) | **+$25.8m = +175bps of gross margin** | nil | +175bps | **One-off tailwind — NOT run-rate** | Q2 FY26 10-Q, Note 13 reconciliation, p.21; MD&A Gross profit, p.27 | High — reverses to zero next quarter unless repeated |
| — Freight / logistics | **Not disclosed** | Not disclosed | n/a | Unknown | Named only generically in FY24 10-K, Item 1A (freight among costs to be mitigated) | Not assessable |
| — Energy | **Not disclosed** | Not disclosed | n/a | Unknown | Named generically at FY24 10-K, Item 1A; Q1 FY26 call cites "fuel and copper" as inflation drivers [Q1 FY26 transcript, Q&A (Corona)] | Not assessable |
| **SG&A** | **15.82%** ($232.8m) | 20.35% ($196.0m) | **−453bps** (better) | **Tailwind — the largest single mover** | Q2 FY26 10-Q, MD&A, p.26 (states "(4.6) pts") | High in both directions — it is volume-driven |
| — of which intangible amortisation | 2.79% ($41.1m) | 3.73% ($35.9m) | −93bps | Tailwind by dilution, rising in dollars | Q2 FY26 10-Q, MD&A SG&A, p.28 | Mid — dollars rise with each deal |
| — SG&A **excluding** amortisation | **13.03%** ($191.7m) | 16.62% ($160.1m) | **−359bps** | Tailwind | Computed from the two lines above | High |
| **R&D** | **1.67%** ($24.5m) | 1.98% ($19.1m) | −32bps | Tailwind by dilution (dollars +28.3%) | Q2 FY26 10-Q, MD&A, p.26 | Low |
| **D&A** (depreciation $17.4m + intangible amortisation $41.1m) | **3.98%** ($58.5m) | 5.22% ($50.3m) | −124bps | Tailwind by dilution | Q2 FY26 10-Q, Note 13 p.22 (depreciation); MD&A p.28 (amortisation) | Mid — FY2026 D&A guided ~$230m vs $207.8m in FY2025 [`CIQ Estimates→Guidance`, D&A FY2026, guidance date 1-May-2026] |
| **Net interest expense** | **1.18%** ($17.4m) | 1.83% ($17.6m) | −65bps | Tailwind now, headwind ahead | Q2 FY26 10-Q, Statements of Income, p.3 | Mid — FY2026 guided ~$65m, but Maverick Power is funded with "cash and new debt" [`nVent-to-Acquire-Maverick-Power-2026.pdf`] |

**Annual context (FY2025, vendor-sourced — no FY2025 10-K):** COGS 62.26% of revenue ($2,424.0m on $3,893.1m), gross margin 37.7%, R&D 2.02% ($78.5m), reported SG&A 19.88% ($773.8m, derived: vendor SG&A $757.9m + $7.5m restructuring + $8.4m pension reclass, which ties to reported operating income of $616.8m), D&A 5.34% ($207.8m) [`CIQ Financials→Income Statement`, 12m Dec-31-2025, vendor data as of ~12-Aug-2026; Q1 FY26 earnings presentation, 1-May-2026, slide 16].

**What this stack does and does not let you do.** It supports a clean split between the **factory line** (COGS) and the **below-the-line leverage** (SG&A, R&D, D&A). It does **not** support a raw-material, freight, energy or labour bridge in dollars — none of those is disclosed as a line item or as a share of COGS anywhere in the pool. Any input-cost decomposition beyond management's own combined dollar figure would be invention, and is not attempted.

---

## 3. Gross Margin → EBITDA Margin → EBIT Margin Walk

### Q2 FY2026 vs Q2 FY2025 (both filing-grade)

| Margin Level | Q2 FY26 | Q2 FY25 | Change (bps) | Main Reason | Evidence |
|---|---:|---:|---:|---|---|
| **Gross margin (reported)** | **37.93%** | 38.60% | **−68** (10-Q: "(0.7) pts") | Raw-material and labour inflation including tariffs, unfavourable product mix, capacity investment — partly offset by volume leverage, productivity, and **+175bps of one-off IEEPA reimbursement** | Q2 FY26 10-Q, MD&A p.26–27 |
| Gross margin **ex-IEEPA** (this module's calculation) | **36.17%** | 38.60% | **−243** | Removes the $25.8m one-off. This is the run-rate gross line | ($558.0 − $25.8) ÷ $1,471.3 |
| **EBITDA margin (GAAP-derived: operating income + D&A)** | **24.41%** ($359.2m) | 21.49% ($207.0m) | **+292** | SG&A leverage plus a falling D&A ratio; also carries the IEEPA one-off | Computed from Q2 FY26 10-Q p.3 and Note 13 p.22 |
| **Adjusted EBITDA margin (company basis: adjusted operating income + depreciation)** | **23.12%** ($340.1m) | 22.26% ($214.4m) | **+86** | Clean of IEEPA and of intangible amortisation | $322.7m + $17.4m; prior $200.0m + $14.4m |
| *Same line on the vendor's basis* | *22.98% ($338.1m)* | *22.26%* | *+72* | *Vendor does not add back the $2.0m of Q2 restructuring: $340.1m − $2.0m = $338.1m exactly* | `CIQ Estimates→Surprise`, FQ2 2026; upstream `01_historical-financials.md` §3 |
| **EBIT margin (reported operating income)** | **20.44%** ($300.7m) | 16.27% ($156.7m) | **+417** | Gross −68, SG&A +453, R&D +32 → +417. Ties exactly | Q2 FY26 10-Q, MD&A p.26 |
| **Adjusted EBIT margin / ROS (company measure)** | **21.93%** ($322.7m) | 20.77% ($200.0m) | **+117** (company states "+110bps") | Clean of IEEPA, amortisation, restructuring and acquisition costs | Q2 FY26 transcript, prepared remarks (Corona); adjustments per Q2 FY26 10-Q, Note 13, p.21 |

### Full-year context, FY2025 vs FY2024

| Margin Level | FY2025 | FY2024 | Change (bps) | Evidence |
|---|---:|---:|---:|---|
| Gross margin | 37.7% | 40.2% | **−249** | FY2025 `CIQ Financials→Income Statement` (vendor); FY2024 10-K, MD&A p.24 |
| EBITDA margin (GAAP-derived) | 21.2% | 22.4% | **−121** | Upstream `01_historical-financials.md`, §1 |
| EBIT margin (reported) | 15.8% | 17.5% | **−169** | Same |
| Blended segment-income margin | 23.37% | 25.20% | **−183** | FY2025 vendor `Segments` tab; FY2024 10-K, Note 15, p.70 |

### The three answers to the divergence this module was asked to adjudicate (CLAUDE.md §3)

Gross margin is **down** (−249bps FY2025, −70bps in Q2 FY26) while adjusted EBITDA margin is **up** (+72bps YoY in Q2 FY26, per the vendor basis; +86bps on the company's own definition). Both series are correct, and the disagreement is fully explained by arithmetic that ties to the cent:

1. **The whole of the improvement happens below the gross line.** Q2 FY26: gross margin −68bps, SG&A ratio −453bps (a help), R&D ratio −32bps (a help) = reported operating margin +417bps. That sum is exact, not approximate. The factory got worse; the overhead got cheaper per dollar of sales, by far more.
2. **The SG&A leverage is real, not an amortisation artefact.** Strip intangible amortisation out of both years and SG&A still falls from 16.62% to 13.03% of sales — **−359bps**. The remaining −93bps is amortisation being spread across 53% more revenue. Both are volume effects; neither is an accounting choice.
3. **The gross line and the adjusted line treat the IEEPA one-off oppositely, and management's line is the conservative one.** The $25.8m reimbursement is **inside** reported gross profit (+175bps) but is **excluded** from segment income and from adjusted operating income — check: $300.7m + $41.1m amortisation + $2.0m restructuring + $4.7m acquisition costs − $25.8m IEEPA = **$322.7m** adjusted operating income, which is the "$323 million" management reported [Q2 FY26 10-Q, Note 13, p.21; Q2 FY26 transcript, prepared remarks]. So the +86bps adjusted EBITDA margin gain is **clean** of the one-off, while the −68bps reported gross margin decline is **flattered** by it. On a like-for-like run-rate basis gross margin fell **243bps**, and adjusted EBITDA margin still rose. The divergence is therefore wider, not narrower, than the headline numbers suggest — and it is entirely an operating-leverage story.

**Neither series overturns the other.** Gross margin is the honest read on **price versus cost**; adjusted EBITDA margin is the honest read on **the whole operating model**. Both must be carried forward. A downstream agent that quotes only the improving one is describing a company whose factory economics are deteriorating while calling margins "expanding."

### Pass-through: the lag, stated explicitly

nVent has **no contractual pass-through** — no escalator, no index-linked price, no raw-material surcharge is disclosed on any contract, and its project work is on **fixed-price** bids where a cost overrun is nVent's loss [`business-model/06_value-chain.md`, §2, citing FY24 10-K, Item 1A and Note 1]. **That is a fact about contracts, not a measurement of realised recovery (CLAUDE.md §9).** The measurement is that nVent prices cost back with a lag of roughly **one to two quarters**, and the pool contains the arithmetic:

- **Q1 FY26:** disclosed pre-mitigation inflation "nearly $60 million, including approximately $40 million in tariff impact" ÷ $1,242.0m of sales = **~483bps**; observed gross margin change 35.9% vs 38.8% = **−290bps**; realised recovery = 1 − 290/483 ≈ **40%** [Q1 FY26 transcript, prepared remarks (Corona); Q1 FY26 10-Q, MD&A p.24].
- **Q2 FY26:** "more than $50 million, including more than $30 million in tariff impact" ÷ $1,471.3m = **~340bps**; observed −70bps; realised recovery = 1 − 70/340 ≈ **79%** [Q2 FY26 transcript, prepared remarks; Q2 FY26 10-Q, MD&A p.26].
- **H1 FY26 combined:** ~$110m ÷ $2,713.3m = ~405bps against −170bps observed = **~58%**.

This module computed those three independently and they match `business-model/06_value-chain.md` §2 exactly; no gap to reconcile. The lag is visible in the sequence itself (40% → 79% in two quarters) and in management's own account: pricing actions "take hold" a quarter after they are taken, and Electrical Connections' margin fell 390bps YoY in Q1 FY26 but only 140bps in Q2 as the pricing landed [Q1 FY26 10-Q, MD&A; Q2 FY26 transcript, Q&A (Corona)].

**Three qualifiers travel with those recovery rates and must not be dropped.** (a) The inflation dollars are management statements on a call (tier 6), not filed figures, and two are floors ("more than", "nearly") — so the denominators are at least this large and the recovery rates are conservative. (b) The observed gross-margin change is not purely input cost: the 10-Q names unfavourable product mix and capacity investment as additional drags and volume leverage plus productivity as additional offsets, so the pure price-cost recovery is **higher** than 40%/79% and these rates are a floor, not a point estimate. (c) The prior full cycle over-recovered: group price rose **+5.5%** in 2023 against volume of −0.4%, gross margin expanded **+443bps**, and the 10-K's own segment bridge attributes **+4.2 points** of Enclosures margin and **+4.0 points** of Electrical & Fastening margin to **price alone** — then price went to **−0.2%** in 2024 when cost pressure eased [FY24 10-K, Item 7, Net sales and segment income components of change, p.24–28]. Price at nVent is cost-linked and given back, not a permanent ratchet.

---

## 4. Margin Walk — Which Margin Level Matters Most?

**Track this company on adjusted operating margin (return on sales), with segment gross margin excluding the IEEPA credit as the leading indicator.**

Adjusted ROS is the right primary metric for three evidenced reasons. First, it is the measure management guides and is paid on: guidance is set in adjusted EPS and the margin shape is guided as "mid-20s incrementals in the second half", which is a statement about incremental **operating** profit, not gross profit [Q2 FY26 transcript, Q&A (Corona); `04_guidance-consensus.md`, §2]. Second, gross margin alone is currently misleading in both directions — it carries a $25.8m one-off tariff refund that inflates it by 175bps, while missing the 453bps of SG&A leverage that is the dominant real movement; a reader tracking only gross margin in Q2 FY26 would have concluded margins compressed when adjusted operating profit rose 61% and ROS rose 110bps. Third, adjusted ROS is the only margin line in the pool that is disclosed consistently at both group and segment level across every period, including the vendor-sourced FY2025.

Gross margin is not discarded — it is demoted to a **leading indicator**, and specifically **segment-level gross margin ex-IEEPA**, which this module computes in §6. That is where tariffs, metals, product mix and new-plant start-up cost land first, one to two quarters before they show up in ROS. The three levels answer different questions: gross margin answers *is price beating cost?* (currently no — down 243bps ex-one-off), adjusted ROS answers *is the business earning more per dollar?* (currently yes — up 117bps), and reported EBIT margin answers neither cleanly because the acquisition-driven adjustment burden moved 300bps between the two periods.

**What NOT to use.** Do not use reportable **segment income** margin as an operating margin. It is struck before all intangible amortisation ($82.2m in H1 FY26, equal to 12.7% of reportable segment income), before all $73.7m of enterprise cost, and before restructuring and acquisition costs [Q2 FY26 10-Q, Note 13, p.21; `business-model/03_segment-map.md`, §3]. The gap widens with every deal.

---

## 5. Margin Driver Table (consolidated)

Magnitude = how much the driver moves **adjusted ROS**, the primary metric, on a reasonable move. High >100bps, Mid 30–100bps, Low <30bps.

| Driver | Impact on Margins | Direction | Magnitude | Evidence |
|---|---|---|---|---|
| **Volume-driven operating leverage on SG&A** — fixed overhead spread over 53% more sales | Cut the SG&A ratio 453bps YoY in Q2 FY26 (359bps of it excluding amortisation). This single line is larger than the entire observed operating-margin move | **Tailwind** | **High** | Q2 FY26 10-Q, MD&A p.26 and p.28 |
| **Segment mix — Systems Protection growing at ~9pp lower gross margin than Electrical Connections** | Cost 56bps of group gross margin in Q2 FY26 on a 7.25pp weight shift (computed §7). Mechanical, recurring, and set to continue with Maverick Power | **Headwind** | **High** | Q2 FY26 10-Q, Note 13, p.20; `nVent-to-Acquire-Maverick-Power-2026.pdf` |
| **Tariffs (all-in cost, before mitigation)** | ~$100m guided for FY2026 ≈ 186bps of guided revenue; raised from ~$80m at the Q1 call, on top of ~$90m in FY2025 | **Headwind** | **High** | Q2 FY26 transcript, prepared remarks (Corona) |
| **Price realisation / pass-through** — the offset to tariffs and raw-material inflation | Realised recovery ran 40% (Q1 FY26) → 79% (Q2 FY26) at the gross line; management guides full offset in Q3 ("Pricing is expected to offset the impact of inflation, including tariffs") | **Tailwind, improving — but guided, not proven for Q3** | **High** | §3 arithmetic; Q2 FY26 transcript, prepared remarks |
| **Raw-material inflation (steel, copper, aluminium, electronic components)** | Named as the first cause of the gross-margin decline in every FY26 quarter. **No commodity hedging programme is disclosed** — metals move straight into COGS | **Headwind** | **High** | Q1/Q2 FY26 10-Q, MD&A Gross profit; FY24 10-K, Item 7A |
| **Labour cost inflation** | Named alongside raw materials in every FY26 gross-profit and SG&A discussion; never quantified | **Headwind** | **Mid** | Q2 FY26 10-Q, MD&A p.27–28 |
| **Product mix within segments** (which products inside each segment sell) | Named as "unfavorable product mix" in every FY26 quarter and in both segment discussions; never quantified. Sits inside the −209bps residual in §7 | **Headwind** | **Mid** | Q2 FY26 10-Q, MD&A p.27, p.29, p.30 |
| **Capacity investment / new-plant start-up cost** | Named as a distinct gross-margin drag in Q1 and Q2 FY26. Three Minnesota liquid-cooling sites now committed; Blaine 1 "still ramping through this year and into 2027"; Blaine 2 opens H1 2027 | **Headwind (short run), see §9 for the other sign** | **Mid** | Q2 FY26 10-Q, MD&A p.27; Q2 FY26 transcript, prepared remarks and Q&A |
| **Productivity / supply-chain and restructuring savings** | Credited in both the gross-profit and the SG&A bridge; disclosed only combined with price, never separately | **Tailwind** | **Mid** | Q2 FY26 10-Q, MD&A p.27–28 |
| **IEEPA tariff reimbursement** | +$25.8m = **+175bps of Q2 gross margin**. Excluded from segment income and from adjusted operating income by the company itself — so it moves reported gross margin but **not** the primary metric | **One-off tailwind — explicitly NOT run-rate** | **High on gross margin, nil on adjusted ROS** | Q2 FY26 10-Q, Note 13, p.21 and MD&A p.27 |
| **Intangible amortisation from acquisitions** | $41.1m in Q2 FY26 vs $35.9m a year earlier; $147.1m in FY2025, which was 87% of the entire $169.0m operating adjustment. Rises with every deal | **Headwind on reported margin, excluded from adjusted** | **Mid** | Q2 FY26 10-Q, MD&A p.28; Q1 FY26 presentation, slide 16 |
| **Depreciation step-up from the capex wave** | FY2026 D&A guided ~$230m vs $207.8m in FY2025 (+11%) against guided revenue growth of 37–39% — so the D&A **ratio falls** even as the dollars rise. Segment depreciation rose 21% YoY in Q2 ($17.4m vs $14.4m) | **Tailwind by dilution while growth holds; headwind if growth stops** | **Mid** | `CIQ Estimates→Guidance`, D&A FY2026; Q2 FY26 10-Q, Note 13, p.22 |
| **Net interest expense** | 1.18% of Q2 sales, flat in dollars YoY, FY2026 guided ~$65m. Maverick Power ($1.75bn plus up to $550m earn-out) is funded with "cash and new debt" and will raise it from Q4 2026 | **Neutral now, Headwind from FY2027** | **Mid** | Q2 FY26 10-Q p.3; `CIQ Estimates→Guidance`; `nVent-to-Acquire-Maverick-Power-2026.pdf` |
| **FX on costs** | Currency added only 0.5pp to Q2 revenue growth and 1.2pp to H1; roughly 81% of FY2025 revenue was Americas ($3,158.3m of $3,893.1m). No FX margin effect is disclosed | **Neutral** | **Low** | Q2 FY26 10-Q, MD&A p.26; `CIQ Financials→Segments`, geographic, FY2025 (vendor) |
| **Freight, energy** | Not disclosed as line items or as a share of COGS anywhere in the pool | **Unknown** | **Not assessable** | Named generically only at FY24 10-K, Item 1A |

---

## 6. Margin Drivers By Segment

Segment gross margins below are **computed by this module** from the disclosed segment COGS. They exclude the IEEPA credit, enterprise cost and intangible amortisation, so they are a cleaner price-versus-cost read than the consolidated gross line.

| Segment | Q2 FY26 gross margin | Q2 FY25 | Change | Q2 FY26 segment income margin | Q2 FY25 | Change |
|---|---:|---:|---:|---:|---:|---:|
| Systems Protection | **34.01%** | 36.47% | **−246bps** | **23.2%** | 21.7% | **+150bps** |
| Electrical Connections | **43.11%** | 44.22% | **−110bps** | **27.3%** | 28.7% | **−140bps** |
| *H1 FY26 gross margin, same basis* | *SP 34.22% vs 36.29% = **−207bps***; *EC 42.01% vs 44.38% = **−237bps*** | | | *SP 22.9% (+170bps); EC 25.9% (−260bps)* | | |

Source for every input: Q2 FY26 10-Q, Note 13, p.20 (segment net sales and COGS) and MD&A p.29–30 (segment income margins).

### Segment: Systems Protection (72.5% of H1 FY26 revenue)

| Driver | Impact | Direction | Magnitude | Evidence |
|---|---|---|---|---|
| Volume leverage on SG&A and R&D | SG&A ratio fell from 12.94% to 9.31% of segment sales (−363bps) and R&D from 1.84% to 1.55% (−29bps) on organic sales +62.0%. Check: gross −246 + SG&A +363 + R&D +29 = **+146bps**, versus the +150bps the company reports — ties within rounding | **Tailwind** | **High** | Computed from Q2 FY26 10-Q, Note 13, p.20; company figure at MD&A p.29 |
| Raw-material and labour inflation including tariffs | Named first among the offsets to the segment's margin gain | **Headwind** | **High** | Q2 FY26 10-Q, MD&A p.29 |
| Unfavourable product mix (inside the segment) | Named, unquantified | **Headwind** | **Mid** | Q2 FY26 10-Q, MD&A p.29 |
| Capacity investment (Blaine 1 ramping, Blaine 2 for H1 2027, third site announced 31-Jul-2026) | Named as an offset to the margin gain; a ~60% capacity increase was put to management on the call and not disputed | **Headwind on the gross line** | **Mid** | Q2 FY26 10-Q, MD&A p.29; Q2 FY26 transcript, Q&A (Dean Dray / Wozniak) |
| Productivity and supply-chain efficiency | Named as a positive alongside volume leverage | **Tailwind** | **Mid** | Q2 FY26 10-Q, MD&A p.29 |
| Acquired mix (Electrical Products Group, $45.2m of Q2 segment sales) | Contributed 7.2pp of segment growth; its own margin is not disclosed | **Unknown** | **Not assessable** | Q2 FY26 10-Q, MD&A p.29 |

**Read:** Systems Protection's factory margin is falling (−246bps) while its reported segment margin rises (+150bps). The entire gain is overhead absorption on 62% organic volume growth. That gain is only as durable as the volume.

### Segment: Electrical Connections (27.5% of H1 FY26 revenue)

| Driver | Impact | Direction | Magnitude | Evidence |
|---|---|---|---|---|
| Raw-material inflation including tariffs, copper specifically | Named as the first cause of the margin decline in both Q1 and Q2 FY26. Q1 call named copper explicitly: "higher than expected inflation, primarily due to copper" | **Headwind** | **High** | Q2 FY26 10-Q, MD&A p.30; Q1 FY26 transcript, Q&A (Corona) |
| Price recovery, lagging | Segment margin fell 390bps YoY in Q1 FY26, then only 140bps in Q2 and "improved sequentially back into the high 20s" as pricing took hold. Management expects it to stay "in the high 20s" this year | **Tailwind, improving — guided, not proven** | **High** | Q1 FY26 10-Q, MD&A; Q2 FY26 transcript, prepared remarks and Q&A (Corona) |
| Growth investment in digital, selling and marketing | Named as a cause of the decline. SG&A ratio actually **rose** here, from 13.86% to 14.35% of segment sales (**+49bps**) — the opposite of Systems Protection | **Headwind** | **Mid** | Q2 FY26 10-Q, MD&A p.30; computed from Note 13, p.20 |
| Unfavourable product mix | Named, unquantified | **Headwind** | **Mid** | Q2 FY26 10-Q, MD&A p.30 |
| Volume leverage | Named as the only offset; organic sales +17.9% | **Tailwind** | **Mid** | Q2 FY26 10-Q, MD&A p.30 |

Bridge check: gross −110bps, SG&A −49bps (a drag), R&D +19bps = **−140bps**, exactly the 1.4-point decline the company reports [Q2 FY26 10-Q, MD&A p.30].

**Read:** the two segments are moving in opposite directions and for opposite reasons. Systems Protection wins on overhead absorption despite a worse factory; Electrical Connections loses on price-cost **and** on growth spending, with no offsetting overhead leverage. Anyone modelling group margin off Systems Protection's improvement alone will get the wrong answer — a point `business-model/03_segment-map.md` §2 makes independently.

---

## 7. Margin Bridge — Latest Period

**Bridge target: consolidated gross margin, Q2 FY2026 vs Q2 FY2025 = 37.93% vs 38.60% = −67.9bps** (the 10-Q states "(0.7) pts") [Q2 FY26 10-Q, MD&A p.26].

The bridge is built **structurally** — from disclosed segment revenue and segment cost of goods sold — because that is the only decomposition the pool supports arithmetically. The company does **not** publish a quantified driver bridge in its 10-Qs. It publishes one in its **annual** filing (a Growth/acquisition, Price, Currency, Net productivity split by segment [FY24 10-K, p.26 and p.28]), but the latest such bridge is FY2024 vs FY2023, and no FY2025 10-K exists in this pool. So a volume/price/input-cost split in dollars is **not possible from disclosure** for the latest quarter, and is not fabricated here.

| Component | Margin Impact (bps) | Evidence |
|---|---:|---|
| Volume / operating leverage (at the gross line) | **Not separable** — sits inside "Other" below | Named as a positive offset, unquantified [Q2 FY26 10-Q, MD&A p.27] |
| Price | **Not separable** — sits inside "Other" | Disclosed only combined with productivity: "Price plus productivity offset inflation of more than $50 million" [Q2 FY26 transcript, prepared remarks] |
| Input costs (raw material + labour + tariffs) | **Not separable at the gross line** — sits inside "Other". Gross, before mitigation: **−340bps** (see derivation in §7a) | ">$50 million, including more than $30 million in tariff impact" [Q2 FY26 transcript, prepared remarks] |
| **Mix — segment mix (Systems Protection share +7.25pp at a ~9pp lower gross margin)** | **−56.1** | Computed from Q2 FY26 10-Q, Note 13, p.20 — derivation in §7a |
| Mix — product mix inside each segment | **Not separable** — sits inside "Other" | Named "unfavorable product mix" [Q2 FY26 10-Q, MD&A p.27, p.29, p.30] |
| FX | **Not disclosed** for margin; currency was +0.5pp of revenue growth and ~81% of sales are Americas, so treated as immaterial | Q2 FY26 10-Q, MD&A p.26 |
| **One-offs — IEEPA tariff reimbursement (+$25.8m in COGS)** | **+175.4** | Q2 FY26 10-Q, Note 13, p.21; MD&A p.27 |
| **Other — unallocated / corporate items inside consolidated COGS (net year-on-year)** | **+22.4** | Derived: consolidated COGS reconciles to segment COGS to the cent — derivation in §7a |
| **Other — within-segment gross-margin movement (the net of volume leverage, price, input costs, product mix and capacity cost, which the company does not split)** | **−209.6** | Systems Protection −179.3 and Electrical Connections −29.8 at current weights — derivation in §7a |
| **Total margin change** | **−67.9** | 37.93% − 38.60% [Q2 FY26 10-Q, p.3 and MD&A p.26] |

Sum of the four quantified rows: −56.1 + 175.4 + 22.4 − 209.6 = **−67.9bps**. Reconciles to the observed total.

---

## 7a. Bridge Attribution and Residual (MODULE_RULES "Driver Attribution" / CLAUDE.md §15)

Every derived figure above, with its arithmetic and its basis.

```
Segment mix: (Δ segment weight) × (PRIOR-YEAR segment gross margin, Q2 FY25 basis)
  Systems Protection weight: 1,072.1/1,471.3 = 72.870%  vs  632.0/963.1 = 65.622%   → +7.249pp
  Electrical Connections weight: 27.130% vs 34.378%                                  → −7.249pp
  Prior-year segment gross margins: SP (632.0−401.5)/632.0 = 36.472%
                                    EC (331.1−184.7)/331.1 = 44.216%
  = (+0.07249 × 36.472) + (−0.07249 × 44.216) = +2.644 − 3.205 = −0.561pp
  = -56.1bps of the -67.9bps observed change
  [Q2 FY26 10-Q, Note 13, p.20 — segment net sales and cost of goods sold, both periods]
  → BASIS: weights and margins are both SEGMENT-level and both from the SAME two quarters.
    Weight change is applied to PRIOR-year margins (Laspeyres); the current-weight residual is
    carried in the within-segment row below, so no effect is double-counted.
    → basis matches

Within-segment gross-margin movement: (CURRENT segment weight) × (Δ segment gross margin)
  SP gross margin: (1,072.1−707.5)/1,072.1 = 34.008%  vs  36.472%  → −2.4635pp
  EC gross margin: (399.2−227.1)/399.2   = 43.111%  vs  44.216%  → −1.1050pp
  = (0.72870 × −2.4635) + (0.27130 × −1.1050) = −1.795 − 0.298 = −2.093pp
  = -209.3bps of the -67.9bps observed change
  [Q2 FY26 10-Q, Note 13, p.20]
  → basis matches — same segments, same two quarters, current weights paired with margin deltas

IEEPA tariff reimbursement: +$25.8m ÷ $1,471.3m of Q2 FY26 net sales
  = +1.754pp = +175.4bps of the -67.9bps observed change
  [Q2 FY26 10-Q, Note 13, p.21 (the $25.8m) and MD&A p.27 ("approximately $25 million")]
  → BASIS: the $25.8m is a Q2 FY26 amount divided by Q2 FY26 revenue — matched period.
    It is a credit inside CONSOLIDATED cost of goods sold and is EXCLUDED from segment income,
    which is exactly why it appears here and not in the two segment rows above.
    → basis matches

Unallocated COGS items (the consolidated-vs-segment COGS reconciliation, net YoY):
  Q2 FY26: segment COGS 707.5 + 227.1 = 934.6; consolidated COGS 913.3
           934.6 − 25.8 (IEEPA) + 4.5 (unallocated) = 913.3  → ties to the cent
           effect on margin = −4.5/1,471.3 = −30.6bps
  Q2 FY25: segment COGS 401.5 + 184.7 = 586.2; consolidated 591.3 → unallocated 5.1
           effect = −5.1/963.1 = −53.0bps
  Year-on-year change = −30.6 − (−53.0) = +22.4bps
  [Q2 FY26 10-Q, Statements of Income p.3 and Note 13 p.20]
  → basis matches

Input costs, gross of mitigation (SHOWN FOR SIZE ONLY — deliberately NOT a bridge row):
  ">$50 million" of Q2 inflation ÷ $1,471.3m of Q2 net sales = -340bps (a FLOOR, since ">")
  [Q2 FY26 transcript, prepared remarks (Corona), 31-Jul-2026]
  → BASIS PROBLEM, stated rather than smoothed: this is a MANAGEMENT figure from a CALL
    (tier 6), stated GROSS of mitigation, and management states in the same sentence that
    "price plus productivity offset" it. The offset is disclosed ONLY as a combined number.
    Entering -340bps as a bridge row without an equal-and-opposite mitigation row would
    overstate the input-cost effect by the whole unmeasured offset.
    → REFUSED as a bridge row. It sits, net of its own offset, inside the -209.3bps
      within-segment residual.
```

**Reconciliation.** Sum of the quantified components = −56.1 + 175.4 + 22.4 − 209.3 = **−67.6bps**, against a stated Total of **−67.9bps**. The **−0.3bps gap is rounding** and is not assigned to any component.

**What is genuinely explained, and what is not.** Of the −67.9bps observed:
- **+141.7bps is attributed to a named, computed driver** — segment mix (−56.1), the IEEPA one-off (+175.4), and the unallocated-COGS shift (+22.4).
- **−209.6bps is residual** — the within-segment gross-margin movement (−209.3) plus rounding (−0.3). This module can say **which segments** it came from (Systems Protection −179.3bps, Electrical Connections −29.8bps) but **not which drivers**, because the company discloses volume leverage, price, productivity, input costs, product mix and capacity cost only as an unquantified list in each quarter and only as one combined "price plus productivity offset inflation" figure on the call.

**This residual is the finding, not a caveat.** Roughly three times as much of the gross-margin move is unattributed to a driver as is attributed. Any downstream claim of the form "input costs drove the gross-margin decline" cannot be supported from this pool at the gross line, and Section 8 therefore does **not** name its biggest driver off this bridge — it names it off the **operating**-margin bridge, where the arithmetic is exact (see §8).

RF-EARN-002: margin bridge reconciled — explained 141.7bps, residual -209.6bps, total -67.9bps

---

## 8. The Single Biggest Margin Driver

**Volume-driven operating leverage on SG&A.** If organic sales growth stalls, this is what compresses margins fastest and furthest.

The arithmetic that supports naming it, at the level where the arithmetic is exact. Q2 FY26 reported operating margin rose **+416.7bps** (20.44% vs 16.27%), and that move decomposes with no residual: gross margin **−67.9bps**, SG&A ratio **+452.8bps**, R&D ratio **+31.8bps** — sum **+416.7bps**, tying to the cent [Q2 FY26 10-Q, Statements of Income p.3; MD&A p.26]. The SG&A line alone is **109%** of the observed operating-margin gain, so it clears the "roughly half" test set by MODULE_RULES with room to spare, and it does so on the reported line rather than on the gross-margin bridge whose residual is large. Stripping intangible amortisation out of both years, the SG&A ratio still falls 359bps — so this is fixed overhead spread across organic sales up 46.9%, not an accounting effect [Q2 FY26 10-Q, MD&A p.26 and p.28]. The same mechanism is visible inside Systems Protection, where a **−246bps** fall in factory gross margin still produced a **+150bps** rise in segment margin purely because the segment's SG&A ratio dropped 363bps.

**Current direction: strongly favourable, and running near its own limit.** Adjusted ROS reached 21.9% in Q2 FY26, up 110bps, the highest in the eight quarters in the pool; adjusted EBITDA margin of 23.0% is likewise the highest of the eight [`01_historical-financials.md`, §3; Q2 FY26 transcript, prepared remarks].

**Why it is the biggest risk rather than the biggest comfort.** Operating leverage is symmetric and the fixed base is being enlarged on purpose. Three Minnesota liquid-cooling plants are now committed (Blaine 1 ramping through 2026 into 2027, Blaine 2 opening H1 2027, a third site announced 31-Jul-2026), FY2026 capex is guided at ~$130m (up ~40%), D&A is guided at ~$230m, and management describes data-centre orders as "large and lumpy" [Q2 FY26 transcript, prepared remarks and Q&A; `CIQ Estimates→Guidance`]. Management has already told the market where the ceiling is: it guides **"mid-20s incrementals"** for H2 FY26 and confirmed the pre-divestiture 30% figure is no longer the target, "to ensure that we can invest to support the growth" [Q2 FY26 transcript, Q&A (Corona / Scott Graham)]. So the leverage that produced 453bps in Q2 is being deliberately spent back into capacity, product and digital.

**The honest counterweight, named (CLAUDE.md §3).** Two figures in this module's own evidence point the other way from the improving-margin story. First, the gross line ex-IEEPA fell **243bps**, not 70bps — the factory is losing the price-cost fight even as the overhead ratio improves. Second, the residual in §7 is −209.6bps against +141.7bps explained, so the gross-margin deterioration is mostly unattributed. Neither overturns the operating-leverage verdict — the +416.7bps operating-margin decomposition ties exactly and SG&A carries all of it — but both mean the verdict rests on **overhead absorption, not on manufacturing economics**, and would not survive a volume stall.

---

## 9. Investment Spend — Both Signs

Capex is running well above its own history in dollars: **$93.3m (FY2025) → ~$130m guided (FY2026), +39%**, with "nearly $60 million" spent in H1 FY26, "up over 50% versus last year" [`CIQ Financials→Cash Flow`, FY2025, vendor; Q2 FY26 transcript, prepared remarks]. This section is therefore required, and both signs are scored.

| Reading | What it would show | Evidence here |
|---|---|---|
| **Spend as a future COST** | A depreciation step-up landing in COGS, plus start-up and under-absorption cost before the plants fill | **The cost is already visible and already in the numbers.** "Investments in capacity to drive growth" is named as a distinct gross-margin drag in **both** FY26 quarters and in **both** segment discussions [Q1 FY26 10-Q, MD&A p.24; Q2 FY26 10-Q, MD&A p.27, p.29, p.30]. Segment depreciation rose 21% YoY in Q2 ($17.4m vs $14.4m) [Note 13, p.22]. Recognition lag is short and disclosed: Blaine 1 opened "within approximately 100 working days" of signing and is "still ramping through this year and into 2027"; Blaine 2 opens H1 2027 [Q2 FY26 transcript, prepared remarks and Q&A]. **But the ratio is not deteriorating:** capex ÷ sales is ~2.42% on guided FY2026 revenue ($130m ÷ $5,372m) versus 2.40% in FY2025 ($93.3m ÷ $3,893.1m) — capex is up 39% because sales are up 38%, so on an intensity basis this is **not** a capex wave. D&A guided at ~$230m against ~$5,372m of guided sales is **4.28% of revenue versus 5.34% in FY2025** — the D&A ratio **falls 106bps** [`CIQ Estimates→Guidance`, D&A and Capex FY2026; `04_guidance-consensus.md`, §2] |
| **Spend as a DEMAND signal** | Backlog / contracted revenue, and management naming supply rather than demand as the binding constraint | **Backlog $2.5bn at 30-Jun-2026, "giving us visibility through the year and into 2027"** [Q2 FY26 transcript, prepared remarks]. Against $749.3m at 31-Dec-2024 and $462.8m at 31-Dec-2023 [FY24 10-K, Item 1 — Backlog], that is a 3.3x rise in eighteen months. **Management states the constraint is supply, not demand**, in its own words: capacity is being added because these businesses "are rapidly growing and more capacity is needed to meet customer demand"; on Blaine 2, "with the demand that we're seeing … we needed to ramp another facility because it takes time to get them online", and the added capacity "takes us through '27 and into '28" [Q2 FY26 transcript, prepared remarks and Q&A (Wozniak)]. Data-centre sales are expected above **$2bn in 2026, "more than double last year"**, and visibility runs "several years out", working with NVIDIA "on their road maps out through 2030" [same]. Capacity is being sold before it is built |

**Current read: the evidence favours the DEMAND reading, and the numbers back it rather than merely the language.** Capex intensity is flat, the D&A ratio falls 106bps, adjusted ROS rose 110bps *while* the capacity cost was being absorbed, and the backlog is 3.3x its level eighteen months ago with management naming supply as the binding constraint. A spend that is fully absorbed inside a rising margin, at unchanged intensity, against contracted revenue, is closer to a booking than to an expense. Reading it only as a future cost would invert the signal.

**The ONE observable that would flip it: organic order growth versus organic sales growth.** In Q2 FY26 organic **orders** grew "low double digits" while organic **sales** grew **46.9%** [Q2 FY26 transcript, prepared remarks (Wozniak); Q2 FY26 10-Q, MD&A p.26]. Backlog is being consumed faster than it is being replaced, and the reported backlog figure edged down from **$2.6bn at end-Q1 2026** to **$2.5bn at end-Q2** [2026 William Blair Conference presentation, 3-Jun-2026, slide 7; Q2 FY26 transcript]. *Both are rounded management figures given outside a filing, so a $0.1bn move is within their own rounding and must not be read as a measured 4% decline* — but the direction of travel is the thing to watch, and the orders-versus-sales gap is not a rounding artefact. If organic orders stay in low double digits for another two quarters while newly built capacity comes online, the same spend flips from a booking to an under-absorbed fixed cost, and the 453bps of SG&A leverage identified in §8 reverses. Confirmation runs the other way: management said "we've had strong data center orders thus far in Q3" [Q2 FY26 transcript, prepared remarks] — an unverified forward statement, not a reported figure, and exactly the item the Q3 print on 30-Oct-2026 will test.

---

## 10. Cycle Position (MODULE_RULES Cycle-Position Rule — Hard Rule)

**The latest reported period sits at or very near a cyclical PEAK. Q2 FY2026 margins are NOT a normalised run-rate.**

Evidence, all from the pool:

| Observable | Latest | Prior trough / earlier level | Source |
|---|---|---|---|
| Organic revenue growth | **+46.9%** (Q2 FY26) | +2.4% (FY2024), +5.1% (FY2023) | Q2 FY26 10-Q, MD&A p.26; FY24 10-K, p.24 |
| Adjusted EBITDA margin | **23.0%** — highest of the eight quarters in the pool | 21.2% (Q4 FY25) | `01_historical-financials.md`, §3 |
| Adjusted ROS | **21.9%** — highest disclosed | 20.0% (Q1 FY26), 20.2% (FY2025) | Q2 FY26 transcript; Q1 FY26 presentation, slide 16 |
| Infrastructure share of sales | **~60%** (H1 FY26) | 45% (FY2025), **12% at spin** | 2026 William Blair presentation, slide 7; Q2 FY26 transcript |
| Systems Protection share of revenue | **72.5%** (H1 FY26) | 60.7% (FY2024, audited) | Q2 FY26 10-Q, Note 13; FY24 10-K, Note 15 |
| Segment income margin, Systems Protection | **23.2%** — above every annual figure since spin | 17.0% (FY2022) | Q2 FY26 10-Q, MD&A p.29; FY24 10-K, p.25 |

The margin is being earned on one capital-spending cycle. Infrastructure organic sales "more than doubled" in Q2 while industrial and commercial/residential were "each flattish" [Q2 FY26 transcript, prepared remarks], so the cyclical breadth is narrow. The business-model module reaches the same conclusion independently and flags the same concentration [`business-model/10_external-dependency.md`; `business-model/02_business-identity.md`, §3a — CLAUDE.md §24 filter 5]. **No divergence to reconcile.**

**One-time policy item, labelled: the $25.8m IEEPA tariff reimbursement is NOT run-rate.** It is a refund of tariffs previously paid under a US emergency-powers statute, it added **+175bps to reported Q2 gross margin**, the company itself excludes it from segment income and from adjusted operating income, and the 10-Q states it "was offset by other incremental tariffs compared to the prior year periods" [Q2 FY26 10-Q, Note 13, p.21 and MD&A p.27]. It can reverse to zero next quarter, and the *incremental* tariffs it offset do not. Any downstream agent building a terminal margin, a bear case, or a leverage denominator must use the **ex-IEEPA gross margin of 36.17%**, not the reported 37.93%.

---

## 11. Limitations Carried Forward

- **No FY2025 Form 10-K in the pool.** FY2025 cost lines, the FY2025 segment note and the FY2025 MD&A margin bridge are absent; FY2025 figures are tier-5 vendor data [`00_earnings-data-triage.md`, §5]. The most recent **company-published quantified margin bridge** (Growth/acquisition, Price, Currency, Net productivity, by segment) is FY2024 vs FY2023 [FY24 10-K, p.26 and p.28].
- **Two verbatim transcripts are present** (1-May-2026 FactSet; 31-Jul-2026 S&P Global), so no transcript-absence limitation and no sell-side-proxy cap applies. No score cap from MODULE_RULES binds on this pool.
- **Raw materials, freight, energy and labour are not disclosed** as line items or as shares of COGS. No input-cost sensitivity in dollars per unit or per tonne exists in the pool, so any elasticity beyond management's own combined figures would be invented.
- **Price and productivity are never split.** Management reports them only combined. The 2023 precedent shows price was then the dominant lever (+4.2 / +4.0 points of segment margin) [FY24 10-K, p.26, p.28]; whether that still holds in 2026 is **Not proven from available data**.
- **Backlog is disclosed by segment nowhere**, and the current group figure exists only as a rounded number on an earnings call, not in a filing.
- **Post-period event outside every number here:** the Maverick Power acquisition ($1.75bn plus up to $550m earn-out, ~$700m estimated 2026 revenue, close expected Q4 2026) was announced 24-Aug-2026 — after the Q2 10-Q, after the consensus export (7-Aug-2026) and after the price mark (12-Aug-2026). Its segment placement, its own margin, its intangible amortisation and its interest cost are all undisclosed. It is a live, unquantified margin driver [`nVent-to-Acquire-Maverick-Power-2026.pdf`].
