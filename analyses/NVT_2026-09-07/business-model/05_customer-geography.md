# Customer And Geography Map — NVT

**Company:** nVent Electric plc (NYSE: NVT). Incorporated in Ireland, head office London, US-domestic SEC filer (Form 10-K / 10-Q). US GAAP, reported in USD millions, fiscal year ends 31 December. [FY24 10-K, cover page; Q2 FY26 10-Q, cover page]

**Evidence note (read this before the tables).** The FY2025 Form 10-K is **absent from the data pool**. The only company annual filing available is the FY2024 10-K (year ended 2024-12-31, filed 2025-02-18). So the latest *audited annual* customer-concentration statement is a FY2024 statement. The latest *filed* geographic split is the unaudited six-month note in the Q2 FY26 10-Q (period ended 2026-06-30). The FY2025 full-year geographic split used below comes from the **Capital IQ Financials workbook, `Segments` tab — a tier-5 vendor export, not a filing** (CLAUDE.md §4, §5), and is labelled as such on every line it appears.

**No counterparty graph.** `relationships.json` in the bound extraction generation exists but is empty (`sources: []`, `nodes: []`, `edges: []`, `relationship_rows: 0`, `named_entities: 0`). The pool holds **no** Capital IQ Suppliers or Customers export, so no customer is named by a vendor graph. Every customer statement below therefore comes from the company's own filings, its transcripts, or its deck — or is recorded as not disclosed. This is the honest answer "no customer list has been provided", not an extraction failure.

---

## 1. Customer Map

nVent **does not name a single customer anywhere in the pool's filings**, and does not disclose a top-customer table. What it does disclose is (a) a negative concentration statement, and (b) the *types* of buyer it sells through. Both are below. The percentage column is filled only where a filing or the company's own document gives a number; otherwise it says "Not disclosed".

| Customer Type | Importance (% of revenue if disclosed) | Long-term Contract? (Y/N/Not disclosed) | Evidence | Risk |
|---|---|---|---|---|
| **Any individual customer** | **None above 10% of net sales** in 2024, 2023 or 2022 — the company's own words: "No customer accounted for more than 10% of net sales in 2024, 2023 or 2022." | Not applicable — no individual customer is named | FY24 10-K, Note 15 (Segment Information), p.70 | Low on the face of it. But the statement is a **FY2024** statement and has not been refreshed in the pool: the FY2025 10-K is missing and neither 10-Q repeats it. Over that gap Systems Protection sales roughly doubled (FY2024 1,823.3 → Q2 FY26 annualised run-rate over $4bn), driven by large data-centre orders, so the FY2024 "<10%" is stale for today's mix |
| **Any individual customer (receivables cross-check)** | **No customer receivable balance above 10%** of total net receivables at 2024-12-31 or 2023-12-31 | Not applicable | FY24 10-K, Note 1 (Trade receivables and concentration of credit risk), p.48 | Low. This is a second, independent test of the same FY2024 picture and it agrees. Also FY2024-dated |
| **Electrical distributors** (channel partners / distribution integrators) | Not disclosed as a share of revenue. The company states its success "depends on building and partnering with a strong channel and distribution network" | Not disclosed | FY24 10-K, Item 1 Business — Competition, p.2; Q2 FY26 transcript, prepared remarks ("also through our distribution partners") | Medium. The channel is named as a dependency in Item 1 but never sized, so the engine cannot test how much revenue sits behind it |
| **Contractors and retail** | Not disclosed | Not disclosed | FY24 10-K, Item 1 Business — Competition, p.2 ("sell through electrical distributors, retail, contractors and original equipment manufacturers") | Medium — unsized |
| **Original equipment manufacturers (OEMs)** | Not disclosed | Not disclosed | FY24 10-K, Item 1 Business — Competition, p.2 | Medium — unsized |
| **Data-centre owners: hyperscalers, neo-clouds, multi-tenant (colocation) operators** | Not disclosed individually. Data centres as an end market were **~$1.0bn of FY2025 sales** (~26% of the $3.9bn FY2025 total), growing at a ~40% sales CAGR 2022–2025 — company internal estimate, investor deck, not a filing | Not disclosed. Management describes large, lumpy project orders, not disclosed multi-year contracts | 2026 William Blair Conference deck, 2026-06-03, slide 11 ("nVent Sales (2025) $1.0B"; "Opportunity analysis is based on nVent internal estimates"); Q1 FY26 transcript, prepared remarks; Q2 FY26 transcript, prepared remarks ("winning with a wide range of customers from hyperscalers to neo-clouds, multi-tenants") | **High.** This is the fastest-growing buyer group and the one the pool sizes least well. The $1.0bn is a deck number on the company's own estimate (tier 7), not a filed disaggregation. Management itself flags that "data center orders tend to be large and lumpy, impacting growth rates quarter-to-quarter" [Q2 FY26 transcript, prepared remarks] — lumpy orders are what customer concentration looks like before it is disclosed |
| **Power utilities** | Not disclosed individually. Power utilities as an end market were **~$0.6bn of FY2025 sales** (~15%) — company internal estimate, investor deck, not a filing | Not disclosed | 2026 William Blair Conference deck, 2026-06-03, slide 12 | Medium. Same evidence weakness as above: a deck estimate, not a filed number |
| **Industrial customers (broad)** | Not disclosed as customers. As a *vertical*, Industrial was 23.9% of H1 FY26 net sales (647.5 of 2,713.3) | Not disclosed | Q2 FY26 10-Q, Note 2 (Revenue) — vertical net sales, six months ended 2026-06-30 | Medium. The 10-K states these customers' own businesses "are to varying degrees cyclical and have experienced periodic downturns" [FY24 10-K, Item 1A Risk Factors, p.9] |
| **NVIDIA** (named by management as a roadmap counterparty, not as a disclosed customer) | Not disclosed. No revenue share, no contract, no filing mention | Not disclosed | Q2 FY26 transcript, Q&A — CEO Beth Wozniak: "we're working with NVIDIA and others on their road maps out through 2030" | Not assessable. This is the only counterparty named anywhere in the pool. It is a transcript reference to product-roadmap collaboration, **not** a disclosed customer or a disclosed revenue share, and it must not be carried downstream as one |

**Contract duration — the honest measure.** nVent's revenue is mostly short-cycle and un-contracted. "A majority of our revenues result from orders received and products delivered in the same month and products generally ship within 90 days of the date on which a customer places an order" [FY24 10-K, Item 1 Business — Backlog of Orders, p.2]. Only **$139.8 million** of remaining performance obligations sat on contracts with an original expected duration of one year or more at 2024-12-31 — about **4.7%** of FY2024 net sales of $3,006.1m [FY24 10-K, Note 2 (Revenue) — Remaining performance obligations, p.53; net sales from Note 2 geographic table, p.50]. Revenue recognised over time (rather than at a point in time) was **24%** of FY2024 revenue, up from 21% in each of 2023 and 2022 [FY24 10-K, Note 1, p.47].

Remaining performance obligations at 2026-06-30 were **$2.5 billion**, with the majority expected to be recognised within the next twelve months [Q2 FY26 10-Q, Note 2 (Revenue), p.9]. **This is not comparable to the FY2024 $139.8m**: the FY2024 figure used the practical expedient and covered only contracts of one year or more original duration, while the Q2 FY26 figure is stated without that limitation. Do not read the jump as a rise in contracted duration. CEO commentary puts backlog at the same $2.5bn level, "giving us visibility through the year and into 2027" [Q2 FY26 transcript, prepared remarks].

---

## 2. Geography Map

nVent discloses revenue by **geographic destination of the sale** — where the customer is, not where the factory is. It discloses at region level only. **No country-level revenue split exists anywhere in the pool**: the FY2024 note aggregates the US, Canada and Mexico into "North America", and US-only revenue is never given. Only property/identifiable assets are split to country level.

**Primary table — the latest filed split (Q2 FY26 10-Q, six months ended 2026-06-30, unaudited):**

| Geography | % of Revenue | Trend (Growing / Stable / Declining / Unknown) | Evidence | Risk |
|---|---:|---|---|---|
| **Americas** | **85.0%** ($2,307.2m of $2,713.3m) | **Growing, and growing as a share.** 77.4% FY2024 → 81.1% FY2025 → 85.0% H1 FY26 on a matched Americas basis (see reconciliation below). Dollar growth H1 FY26 vs H1 FY25: $2,307.2m vs $1,411.8m = **+63.4%** | Q2 FY26 10-Q, Note 2 (Revenue) — geographic net sales, six months ended 2026-06-30, p.8 | **High.** Single region above 50% and rising fast. Everything that has gone right for nVent in the last 18 months has happened here |
| **EMEA** (Europe, Middle East, India, Africa) | **11.2%** ($305.0m) | **Growing in dollars, shrinking as a share.** $305.0m vs $273.9m in H1 FY25 = **+11.4%**; share fell 17.8% FY2024 → 15.1% FY2025 → 11.2% H1 FY26. The share fall is dilution by Americas growth, **not** an EMEA decline — do not restate this as "declining" | Q2 FY26 10-Q, Note 2, p.8; H1 FY25 comparative in the same note; FY2024 in FY24 10-K, Note 2, p.50 | Medium. Absolute growth is positive but roughly one-sixth of the Americas rate, so the group's fortunes are decreasingly tied to it |
| **Asia-Pacific** | **3.7%** ($101.1m) | **Growing in dollars, roughly flat-to-lower as a share.** $101.1m vs $86.7m in H1 FY25 = **+16.6%**; share 4.9% FY2024 → 3.8% FY2025 → 3.7% H1 FY26 | Q2 FY26 10-Q, Note 2, p.8 | Low as an exposure; also low as a diversifier — too small to offset anything |
| **Total** | **100.0%** | — | Q2 FY26 10-Q, Note 2, p.8 ($2,713.3m) | Shares sum to 99.9% before rounding; there is no "Other" bucket in the H1 FY26 presentation |

**Supporting table — the last audited annual split (FY24 10-K, year ended 2024-12-31):**

| Geography | % of Revenue | $m | Evidence |
|---|---:|---:|---|
| North America (US, Canada, Mexico) | 77.0% | 2,314.2 | FY24 10-K, Note 2 (Revenue) — geographic net sales, p.50 |
| EMEA (Europe, Middle East, India, Africa) | 17.8% | 533.9 | FY24 10-K, Note 2, p.50 |
| Asia-Pacific | 4.9% | 146.7 | FY24 10-K, Note 2, p.50 |
| Rest of World (Latin and South America) | 0.4% | 11.3 | FY24 10-K, Note 2, p.50 |
| **Total** | **100.0%** | **3,006.1** | FY24 10-K, Note 2, p.50 |

**Supporting table — FY2025 full year (vendor export, tier 5 — not a filing):**

| Geography | % of Revenue | $m | Evidence |
|---|---:|---:|---|
| Americas | 81.1% | 3,158.3 | Capital IQ Financials workbook, `Segments` tab, Geographic Segments, FY ending Dec-31-2025 — vendor export, not a filing |
| EMEA | 15.1% | 587.3 | Capital IQ Financials workbook, `Segments` tab, FY2025 — vendor export |
| Asia-Pacific | 3.8% | 147.5 | Capital IQ Financials workbook, `Segments` tab, FY2025 — vendor export |
| **Total** | **100.0%** | **3,893.1** | Capital IQ Financials workbook, `Segments` tab, FY2025 — vendor export |

The company's own June 2026 deck rounds the same FY2025 split to Americas 81% / EMEA 15% / APAC 4% on $3.9bn of revenue [2026 William Blair Conference deck, 2026-06-03, slide 4] — an independent corroboration of the vendor numbers at one decimal place of precision, from the company itself.

**Basis reconciliation (so the trend is matched-basis, CLAUDE.md §15).** The FY2024 note reports "North America" and "Rest of World" separately; the 2026 filings report a single "Americas". FY2024 North America $2,314.2m + Rest of World $11.3m = **$2,325.5m**, which is exactly the figure the Capital IQ `Segments` tab carries as FY2024 Americas. So the two labels reconcile, and the like-for-like Americas share series is **77.4% (FY2024, from the 10-K's own components) → 81.1% (FY2025, vendor export) → 85.0% (H1 FY26, 10-Q)**. Do not compare the FY2024 "77.0% North America" figure directly against the H1 FY26 "85.0% Americas" figure — that mixes bases by 0.4 percentage points.

**Where the assets sit, not the customers.** Identifiable assets by country: U.S. $292.8m, EMEA $80.8m, Mexico $43.3m, Rest of World $17.6m of $434.5m total at 2025-12-31 [Capital IQ Financials workbook, `Segments` tab, Geographic Segments — Assets, FY2025 — vendor export, not a filing]. The US carries 67.4% of identifiable assets against an Americas revenue share of 81.1%.

**End-market mix, for context (this is a vertical split, not a geography or a customer split).** H1 FY26: Infrastructure $1,575.9m = 58.1%; Industrial $647.5m = 23.9%; Commercial & Residential $489.9m = 18.1% of $2,713.3m [Q2 FY26 10-Q, Note 2 — vertical net sales, six months ended 2026-06-30, p.9]. Management's own framing: "Infrastructure made up 12% of sales at spin, expanded to 45% last year and was nearly 60% in the first [half]" [Q2 FY26 transcript, prepared remarks]. In FY2024 the same verticals were Industrial 35.4%, Infrastructure 32.6%, Commercial & Residential 29.2%, Energy 2.7% [FY24 10-K, Note 2, p.51]. **The vertical categories were redefined in Q1 2026** — Energy was folded away and FY25 comparatives were recategorised — so the FY2024 and H1 FY26 vertical splits are not on the same basis [Q2 FY26 10-Q, Note 2, p.9]. The geographic split was not redefined and is comparable.

---

## 3. Concentration Flags

| Concentration Flag | Triggered (Y/N) | Evidence |
|---|---|---|
| **One customer >20% of revenue** | **N** — on the latest filed disclosure, which is FY2024 | "No customer accounted for more than 10% of net sales in 2024, 2023 or 2022" [FY24 10-K, Note 15 (Segment Information), p.70]. Corroborated on the balance-sheet side: "No customer receivable balances exceeded 10% of total net receivable balances as of December 31, 2024 or 2023" [FY24 10-K, Note 1, p.48]. **Qualifier that must travel with this N:** the FY2025 10-K is absent from the pool and neither 10-Q repeats the statement, so no customer-concentration disclosure exists for FY2025 or H1 FY26 — the period in which data-centre-driven revenue roughly doubled the Systems Protection segment. The N is a FY2024 fact, not a current one |
| **Top 3 customers >40% of revenue** | **N** — arithmetically, on FY2024 data | nVent does not disclose a top-three figure anywhere in the pool. But if no single customer exceeded 10% of net sales in 2024 [FY24 10-K, Note 15, p.70], the top three together cannot have exceeded 30%, so the 40% test cannot have been triggered in FY2024. Same staleness qualifier as the row above: not testable for FY2025 or H1 FY26 |
| **One geography >50% of revenue** | **Y** | Americas = **85.0%** of net sales for the six months ended 2026-06-30 ($2,307.2m of $2,713.3m) [Q2 FY26 10-Q, Note 2, p.8]. Also triggered on the last audited annual: North America = 77.0% of FY2024 net sales ($2,314.2m of $3,006.1m) [FY24 10-K, Note 2, p.50]. Triggered on every period and every source in the pool, filing and vendor alike |
| **One customer or geography >30% with no long-term contract disclosed** | **Y** — on the geography side | The Americas at 85.0% of H1 FY26 net sales [Q2 FY26 10-Q, Note 2, p.8] far exceeds 30%, and **no long-term contract underpins it**. The company's own description of its selling model: "A majority of our revenues result from orders received and products delivered in the same month and products generally ship within 90 days of the date on which a customer places an order" [FY24 10-K, Item 1 Business — Backlog of Orders, p.2]. Contracts of one year or more original duration carried only $139.8m of remaining performance obligations at 2024-12-31 — 4.7% of FY2024 net sales [FY24 10-K, Note 2, p.53]. The $2.5bn of remaining performance obligations at 2026-06-30 is expected to convert to revenue mostly **within twelve months** [Q2 FY26 10-Q, Note 2, p.9] and is stated on a different basis than the FY2024 figure, so it does not evidence long-duration contracting. Not triggered on the customer side: no customer is disclosed above 10% (FY2024) |

---

## 4. Read

This is a **geographically concentrated business with no disclosed customer concentration** — the concentration is on the geography side, and it is getting worse, not better: the Americas moved from 77.4% of FY2024 sales to 81.1% in FY2025 (vendor export) to 85.0% of first-half FY2026 sales, because Americas revenue grew 63.4% year on year while EMEA grew 11.4% and Asia-Pacific 16.6% [Q2 FY26 10-Q, Note 2, p.8; FY24 10-K, Note 2, p.50; Capital IQ `Segments` tab, FY2025 — vendor export]. On the customer side the last filed statement says no customer exceeded 10% of net sales in 2024, 2023 or 2022 [FY24 10-K, Note 15, p.70] — but that statement is FY2024-dated and the missing FY2025 10-K means nobody has re-tested it across the period when data-centre orders roughly doubled the Systems Protection segment, so "no customer concentration" is a fact about 2024, not a proven fact about today.

The concentration is **naked, not contractually secured**. nVent ships most of its revenue within 90 days of the order, and at the last audited year-end only $139.8m — 4.7% of FY2024 sales — sat on contracts with an original duration of one year or more [FY24 10-K, Item 1 Business p.2 and Note 2 p.53]. The $2.5bn of remaining performance obligations at June 2026 converts mostly inside twelve months and is reported on a different basis than the FY2024 number, so it is order visibility, not contractual lock-in [Q2 FY26 10-Q, Note 2, p.9].

**The single biggest dependency the synthesizer should know about:** the Americas region now supplies 85.0% of revenue, and the growth inside it is the data-centre build — a market the company sizes at only ~$1.0bn of FY2025 sales on its own internal estimate in a conference deck (tier 7), never in a filing, with orders management itself calls "large and lumpy" [2026 William Blair Conference deck, 2026-06-03, slide 11; Q2 FY26 transcript, prepared remarks]. One region, one end market, no long-term contracts, and no filed disclosure of who the buyers are.
