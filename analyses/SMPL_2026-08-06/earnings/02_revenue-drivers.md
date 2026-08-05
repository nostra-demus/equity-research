# Revenue Drivers — SMPL

**Reporting basis:** US GAAP, USD, fiscal year ends the last Saturday in August (FY2025 = 52 weeks ended Aug-30-2025; FY2024 = 53 weeks ended Aug-31-2024). [FY2025 10-K, cover page and Note 2]

## 1. Segment Decomposition Status

Segment decomposition applied, with a caveat: SMPL legally discloses **one** GAAP reportable segment under ASC 280 — the CEO (Chief Operating Decision Maker) reviews only consolidated net income, and no brand-level profit, EBITDA, or margin figure is disclosed anywhere in the filings [FY25 10-K, Note 15 (Segment and Customer Information); confirmed in `business-model/03_segment-map.md` §1]. The company DOES disclose **revenue** by brand (Quest, Atkins, OWYN) plus a small International line as part of a revenue-disaggregation note, and this is the decomposition used below — it is a revenue-only proxy for segments, not a GAAP segment, and profit share is "Not disclosed" for every brand. This follows the business-model module's `03_segment-map.md`, which is available for this run.

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
| Multi-segment | Sum of segment revenue drivers |

**SMPL's own formula:** Net sales = Σ across three brands (Quest, Atkins, OWYN) of [household penetration (% of US households buying the brand) × buy rate (purchase frequency/volume per buying household) × realized price net of trade promotion], converted from retail consumption into reported net sales through a shipment/channel-inventory timing gap, sold through a small number of large retail customers (Walmart ~31% and Amazon ~18% of FY2025 consolidated net sales) [FY25 10-K, Item 1A; `business-model/04_unit-economics.md` §1; `business-model/05_customer-geography.md` §1]. The company itself runs the business on household penetration and buy rate, not on a disclosed unit/price figure: "If you look at the fundamental metrics around brand health, that's households. So are we growing households, are we growing buy rate" [Q2 FY26 earnings call, Apr 9, 2026, CEO Q&A, cited via `business-model/04_unit-economics.md`]. No per-unit price, volume-per-case, or unit-count figure is disclosed anywhere in the pool, so a literal volume × price formula cannot be built from filings; household penetration × buy rate is the closest disclosed proxy for "volume," and price is only ever discussed qualitatively (a planned list-price increase, and a stated over-reliance on trade promotion) — never as a per-unit dollar figure.

## 3. Market / Share / Price / Mix Split

| Driver Bucket | Current Direction | Evidence | Importance /100 |
|---|---|---|---:|
| End-market demand | Growing — the "purposeful nutrition" category (Circana MULO++C measured-channel data) grew 10% in the 13 weeks ended May 30, 2026 | Q3 FY26 earnings call, Jul 9 2026, CEO prepared remarks | 60 |
| Company market share | Deteriorating — SMPL's own consolidated retail takeaway declined 6.7% in the same 13-week period the category grew 10%, a roughly 17-percentage-point share loss in one quarter; Atkins specifically lost Walmart shelf space during FY2025 | Q3 FY26 earnings call, Jul 9 2026, CEO prepared remarks; FY25 10-K, Item 1A (Walmart reduced Atkins assortment) | 85 |
| Price / realization | Roughly flat currently, with a stated structural weakness — the CEO named "over-reliance on price promotion" as one of the P&L's structural problems, without a dollar figure. A high single-digit list-price increase across most of the portfolio is announced for September 2026 (the start of FY2027) — it is not in the FY2026 revenue base yet | Q3 FY26 earnings call, Jul 9 2026, prepared remarks and Q&A | 55 (forward-looking; near-zero in the current run-rate) |
| Product / customer / geography mix | Shifting toward Quest and away from Atkins: Quest rose from 59.5% of FY2025 net sales to 63.7% of the nine months ended May 30, 2026, while Atkins fell from 29.0% to 24.9% over the same comparison; within Quest, chips (+17% consumption in FQ3 FY26) and milkshakes (+~50%) are outgrowing bars (−5% consumption) | FY25 10-K, Note 15; FQ3 FY26 10-Q, Note 12; Q3 FY26 earnings call, Jul 9 2026 | 50 |
| FX translation | Immaterial — International net sales were ~2.0% of FY2025 total, concentrated in Canada and Australia; no FX sensitivity is quantified | FY2025 10-K, p.24 and Item 7A, p.49 | 5 |
| M&A / divestitures | Historical, fading — the OWYN acquisition (closed Nov 2023) mechanically inflated FY2025's brand-level YoY revenue comparison (FY2025 is OWYN's first full 52-week year; FY2024 captured only a partial post-acquisition period). No new M&A is disclosed for FY2026 | FY25 10-K, shareholder letter (OWYN pro forma detail, see §6); `01_historical-financials.md` | 20 |

**Cycle-position note (evidence-based, per the Cycle-Position Rule):** the business-model `10_external-dependency.md` flags Commodity prices (High), Government policy/tariffs (High) and Consumer cycle (High) as material external dependencies for SMPL [`business-model/10_external-dependency.md` §1]. The three brands sit at different points in their own demand cycles, not one company-wide cycle: Quest's household penetration (20.5% of US households, +120bps y/y) is at a multi-year high and still rising [Q3 FY26 call]; Atkins's household penetration (8.5%, −220bps y/y) is in a structural decline tied to shelf-space losses, not an ordinary cyclical dip [Q3 FY26 call; FY25 10-K, Item 1A]; and OWYN is mid-integration with a disclosed 6-to-12-month distribution reset ahead [Q3 FY26 call]. Separately, **the FQ4 FY2026 revenue guide is explicitly stated as NOT a clean read of underlying demand**: management said it plans "to slightly undership consumption in Q4 to enter next year with correctly organized and sized customer inventories" [Q3 FY26 earnings call, Q&A, CFO Bealer] — i.e., reported net sales in FQ4 FY26 will run below actual consumer takeaway on purpose, a one-time channel/inventory reset. This must be read as a temporary shipment-versus-consumption gap, not a further demand deterioration, and should not be extrapolated into FY2027 guidance or run-rate models.

## 4. Revenue Driver Table (consolidated)

| Driver | Current Level | Direction | Magnitude | Evidence |
|---|---|---|---|---|
| Household penetration — Quest | 20.5% of US households, FQ3 FY26 | Improving (+120bps y/y) | High (Quest = 63.7% of 9-month FY26 net sales) | Q3 FY26 earnings call, Jul 9 2026, CEO prepared remarks |
| Household penetration — Atkins | 8.5% of US households, FQ3 FY26 | Deteriorating (−220bps y/y) | Mid (Atkins = 24.9% of 9-month FY26 net sales) | Q3 FY26 earnings call, Jul 9 2026, CEO prepared remarks |
| Household penetration — OWYN | 4.3% of US households, FQ3 FY26 | Stable (flat y/y) | Low (OWYN = 9.2% of 9-month FY26 net sales) | Q3 FY26 earnings call, Jul 9 2026, CEO prepared remarks |
| Buy rate (purchase frequency/volume per household) | Not quantified by the company — only directional | Deteriorating for Atkins and OWYN; Quest bars flagged weak, Quest chips/milkshakes strong (chips +17% consumption, milkshakes +~50% in FQ3 FY26) | Mid (affects the largest brand's core sub-category) | Q3 FY26 earnings call, Jul 9 2026, CEO prepared remarks |
| Distribution / retail shelf space (TDP) | Atkins and OWYN both guided to further distribution losses over the next 6–12 months; Quest continuing to gain distribution (management states TDP growth on bars, salty snacks, and the baked business) | Deteriorating (Atkins/OWYN); Improving (Quest) | High for Atkins (largest single explained cause of its −24.6% net sales decline, FQ3 FY26); Mid for OWYN | Q3 FY26 earnings call, Jul 9 2026, CEO prepared remarks and Q&A; FQ3 FY26 10-Q, MD&A |
| List price / promotional intensity (net realized price) | No broad list-price action taken in FY2026 to date; CEO names "over-reliance on price promotion" as a structural weakness (undollarized); a high single-digit list-price increase across most of the portfolio is announced effective September 2026 (start of FY2027) | Currently flat/Unknown; will turn Improving (for realized price) once the September increase lands, with management explicitly warning of an offsetting volume hit ("we would expect...elasticities to be at 1 or higher...there's going to be a volume impact") | High, once effective (a high-single-digit increase applied across "most of the portfolio" moves total revenue by several percentage points, offset partly by the stated volume elasticity) | Q3 FY26 earnings call, Jul 9 2026, prepared remarks and Q&A |
| Retail customer concentration (Walmart ~31%, Amazon ~18% of FY2025 net sales) | At-will relationships, "no recurring or minimum purchase amounts," no firm volume commitments | Deteriorating for Atkins specifically (Walmart already cut Atkins assortment in FY2025); Stable/Unknown for the relationship overall | High (Walmart + Amazon ≈ 49% of FY2025 net sales; a shelf-space or ordering-pattern change at either retailer moves total revenue materially) | FY25 10-K, Item 1A; `business-model/05_customer-geography.md` §3 |
| Channel / shipment-vs-consumption timing | Company is deliberately running shipments below consumption in FQ4 FY26 to reset customer inventories | Temporarily deteriorating reported net sales versus underlying demand (non-run-rate — see cycle-position note above) | Mid (adds several points to the FQ4 FY26 y/y decline versus a pure consumption read) | Q3 FY26 earnings call, Jul 9 2026, Q&A, CFO Bealer |
| FX translation | International ≈2.0% of FY2025 net sales (Canada, Australia) | Stable/immaterial; international net sales shrinking slightly in dollar terms (−9.9% y/y FY2025) but off a small base | Low | FY25 10-K, p.24; `business-model/03_segment-map.md` §1 |
| Acquisitions (OWYN, closed Nov 2023) | Fully consolidated in both FY2025 and FY2026 periods; no new M&A disclosed | N/A going forward — the acquisition-timing distortion is now behind the FY2025-vs-FY2024 comparison only | Low (forward), was High (FY2025 annual comparison only) | FY25 10-K, shareholder letter; §6 below |
| GLP-1 category shift (regulatory/consumer-trend) | Named risk touching Atkins's core weight-management positioning; management states it completed "a thorough assessment of GLP-1 therapies" and sees "high interactivity between Atkins...product buyers and the use of GLP-1s" | Unknown/Unclear — management frames it as an opportunity to reposition Atkins, not (yet) a quantified net demand effect | Mid (touches Atkins, 24.9% of revenue, but no dollar sizing disclosed) | Q3 FY26 earnings call, Jul 9 2026, prepared remarks and Q&A; `business-model/10_external-dependency.md` §1 |

## 5. Revenue Drivers By Segment (brand-level, revenue-only — no brand profit disclosed)

### Segment: Quest (63.7% of net sales, 9 months ended May 30, 2026)

| Driver | Current Level | Direction | Magnitude | Evidence |
|---|---|---|---|---|
| Household penetration | 20.5% of US households, +120bps y/y | Improving | High | Q3 FY26 earnings call, CEO prepared remarks |
| Bar sub-category consumption (bars + chips = ~80% of the brand) | Bar consumption declined ~5% in FQ3 FY26 (partly cushioned by an incremental club-store rotation) | Deteriorating — CEO calls re-accelerating bar growth "our highest priority" | High (bars are the largest piece of the largest brand) | Q3 FY26 earnings call, CEO prepared remarks and Q&A |
| Chips consumption | +17% in FQ3 FY26; household penetration for Quest chips ≈11% | Improving | Mid–High (chips is "a $0.5 billion brand already," growing "in the mid-teens" per CEO) | Q3 FY26 earnings call, CEO prepared remarks and Q&A |
| Milkshake / RTD sub-category | +~50% in FQ3 FY26, "albeit from a small base" | Improving | Low (small base) | Q3 FY26 earnings call, CEO prepared remarks |
| Distribution (TDP) | Continuing to gain distribution across bar, salty-snack, and baked sub-categories | Improving | Mid | Q3 FY26 earnings call, Q&A |
| Salty-snack manufacturing capacity | Capex being directed to a capacity expansion in salty snacks (chips) | Improving (removes a future capacity constraint on the fastest-growing sub-category) | Mid | Q3 FY26 earnings call, prepared remarks; `04_guidance-consensus.md` §2 (FY26 capex guide) |

FY2025 annual context: Quest net sales grew 11.1% y/y to $863.6m (59.5% of FY2025 total), and management's shareholder letter states 12% consumption growth and 13% net sales growth on a 52-week basis for FY2025 [FY25 10-K, Note 15; FY25 10-K, shareholder letter].

### Segment: Atkins (24.9% of net sales, 9 months ended May 30, 2026)

| Driver | Current Level | Direction | Magnitude | Evidence |
|---|---|---|---|---|
| Household penetration | 8.5% of US households, −220bps y/y | Deteriorating | High (largest disclosed driver of Atkins's decline) | Q3 FY26 earnings call, CEO prepared remarks |
| Distribution / shelf space | Retail takeaway declined 23.9% in FQ3 FY26 (vs −23.4% in FQ2 FY26); Walmart cut Atkins assortment in FY2025; brand and trademark intangibles impaired $60.9m in FY2025 on declining revenue projections | Deteriorating | High | Q3 FY26 earnings call, CEO prepared remarks; FY25 10-K, Item 1A and Note 9 |
| Marketing investment | CEO states the brand suffered from reduced marketing support ("insufficient marketing support"), directly linked to the household-penetration decline | Deteriorating (self-inflicted, per management) | Mid–High | Q3 FY26 earnings call, prepared remarks |
| Comparison base (year-over-year) | Management states comparisons "become more favorable as we lap household and distribution losses during the prior year" | Improving (base-effect only, starting FQ4 FY26/FY27) | Mid | Q3 FY26 earnings call, CEO prepared remarks |
| GLP-1 repositioning | Being framed as a long-term opportunity, not yet monetized | Unclear/Unknown | Unknown | Q3 FY26 earnings call, prepared remarks and Q&A |

### Segment: OWYN (9.2% of net sales, 9 months ended May 30, 2026)

| Driver | Current Level | Direction | Magnitude | Evidence |
|---|---|---|---|---|
| Household penetration | 4.3% of US households, flat y/y | Stable | Low–Mid | Q3 FY26 earnings call, CEO prepared remarks |
| Distribution reset (product-quality issue) | A disclosed product-quality issue plus "ineffective marketing execution" hurt several products; issue addressed but distribution losses expected over the next 6–12 months | Deteriorating (near-term) | Mid | Q3 FY26 earnings call, prepared remarks |
| Underlying category demand | Management points to "a significant and growing audience seeking functional nutrition benefits" as the basis for long-term confidence | Improving (qualitative; not yet reflected in near-term distribution trend) | Unknown magnitude | Q3 FY26 earnings call, prepared remarks |
| Gross margin mix | Company states OWYN "carries lower gross profit margins" than the rest of the portfolio — a mix headwind on blended margin, not a revenue driver per se, but relevant to why OWYN's growth is a weaker-quality dollar of revenue | Deteriorating (margin quality) | Low–Mid (revenue impact; margin impact covered in `03_margin-drivers`) | FY25 10-K, MD&A p.39 |

International (2.2% of net sales) is immaterial to the consolidated read and is not decomposed further — no brand split is disclosed for this line [`business-model/03_segment-map.md` §1].

## 6. Revenue Growth Decomposition

**Most recent quarter (FQ3 FY26, 13 weeks ended May 30, 2026, vs FQ3 FY25):** net sales declined 6.3% ($357.0m vs $381.0m, a $24.0m decline) [FQ3 FY26 10-Q, MD&A]. The company does not disclose a formal volume/price/mix walk; the best decomposition available is the brand-level revenue split, computed by this agent from the filed brand-revenue disaggregation table [FQ3 FY26 10-Q, Note 12]:

| Component | Contribution to Growth (pp) | Evidence |
|---|---:|---|
| Volume / distribution (as management characterizes it — see note below) | −6.3pp in total, split by brand: Atkins −7.25pp, Quest +0.66pp, OWYN +0.32pp, International −0.02pp | Computed by this agent: (brand Δ$) ÷ (prior-year total net sales $380.956m), from Atkins $84.649m (vs $112.287m), Quest $230.260m (vs $227.737m), OWYN $34.774m (vs $33.551m), International $7.300m (vs $7.381m) [FQ3 FY26 10-Q, Note 12] |
| Price / realization | Not separately quantified — no list-price increase was in effect during the quarter; management's own MD&A attributes the decline entirely to "distribution-related declines for Atkins" offset by "Quest and OWYN volume-driven growth," with no price component named | FQ3 FY26 10-Q, MD&A |
| Mix | Captured within the brand-level volume split above (Quest gaining share, Atkins losing share) | — |
| FX | ~0 (International, a small negative, is the only FX-adjacent line and is immaterial) | FQ3 FY26 10-Q, Note 12 |
| Acquisitions / divestitures | None in this comparison — OWYN was already fully consolidated in both the FQ3 FY26 and FQ3 FY25 periods, so no acquisition-timing distortion affects this quarterly comparison | — |
| Other | None disclosed | — |
| Total revenue growth | −6.3% (−$24.0m) | FQ3 FY26 10-Q, MD&A |

The brand-level split sums exactly to the total (−7.25 + 0.66 + 0.32 − 0.02 = −6.29% ≈ −6.3%, rounding), confirming internal consistency.

**Full fiscal year 2025 (annual, vs FY2024):** net sales grew 9.0% ($119.6m, to $1,450.9m) [FY25 10-K, MD&A p.38]. This is **not cleanly decomposable into volume/price/mix/FX/M&A** from disclosure, and the gap between two of the company's own disclosed figures must be flagged rather than papered over: management states "Combined consumption for our three brands grew 5.5%, led by Quest and OWYN" [FY25 10-K, shareholder letter] — a ~3.5-percentage-point gap versus the 9.0% net sales growth rate. Part of that gap is an **acquisition-timing / calendar effect, not organic demand**, and must not be described as organic: FY2025 is OWYN's first full 52-week year of consolidation, while FY2024 captured only a partial post-acquisition period (OWYN closed Nov 2023) plus FY2024 itself was a 53-week year (one extra week versus FY2025's 52 weeks — a separate, small negative comp effect) [`01_historical-financials.md` §1]. Management's own alternate, apples-to-apples comparison shows OWYN's net sales grew 22% and its consumption grew 34% against "the prior 12 months including 10 months prior to closing the acquisition" [FY25 10-K, shareholder letter] — a materially smaller organic growth rate than the raw GAAP year-over-year brand-revenue comparison ($137.020m vs $29.213m, i.e., +369%) implies [FY25 10-K, Note 15]. **The raw +369% OWYN GAAP figure is a calendar/consolidation artifact, not a demand signal, and is not used as an organic growth rate anywhere in this report.** Price is not separately quantified for FY2025 either; the 10-K's own explanation for the 9.0% growth is "driven by the acquisition of OWYN and another year of double-digit growth from Quest, partially offset by declines on Atkins and the effect of lapping the extra week in Fiscal Year 2024" [FY25 10-K, shareholder letter] — a qualitative mix of M&A, organic Quest volume growth, Atkins volume/distribution decline, and a calendar effect, with no dollar or percentage-point attribution given to each. What's missing to do this properly: a company-disclosed like-for-like (constant-brand-set, constant-week-count) organic growth rate, and any quantified price/volume split — neither exists in this pool.

## 7. The Single Biggest Revenue Driver

**Quest's bar sub-category consumption trend is the single biggest driver of where SMPL's revenue goes next.** Quest is now 63.7% of net sales (nine months ended May 30, 2026) and bars plus chips together make up roughly 80% of the Quest brand, with bars the larger and currently weaker of the two — bar consumption declined about 5% in FQ3 FY26 even as chips grew 17% and milkshakes grew roughly 50% [Q3 FY26 earnings call, Jul 9 2026, CEO prepared remarks]. Because Quest is now nearly two-thirds of the whole company, a 10–20% swing in Quest's growth rate — in either direction — would move total company revenue by roughly 6–13 percentage points, dwarfing what a similar swing in Atkins (24.9% of revenue and still shrinking as a share of the total) or OWYN (9.2%, smaller still) could do to the total. The current direction is deteriorating on the specific sub-category (bars) that matters most, even though the brand overall is still growing on a blended basis (Quest net sales +1.1% in FQ3 FY26); management itself calls "re-accelerating growth in Quest bars ... our highest priority" [Q3 FY26 earnings call, prepared remarks], which is the clearest signal that this is the variable the company itself is watching most closely for the next 3–12 months.

## 8. Data and Sourcing Limitations

- No verbatim volume, unit, or per-unit price data exists anywhere in the pool for any brand — household penetration and (qualitative-only) buy rate are the closest disclosed proxies, and buy rate is never given a number. **Not proven from available data.**
- No brand-level profit, EBITDA, or margin figure is disclosed (ASC 280 aggregation) — this report is revenue-only by brand; profitability-weighted driver importance cannot be assessed from filings alone.
- No formal company-disclosed volume/price/mix walk exists for any period; the growth-decomposition table in §6 uses the best available proxy (brand-revenue split) and states explicitly where price cannot be isolated.
- The Q3 FY2026 earnings call transcript used throughout this report is a verbatim CIQ/S&P Global Market Intelligence transcript (full trust for driver/guidance colour per this module's Transcript Sourcing rule) — this is not a sell-side proxy, so no score cap applies on that account.
- No `ciq_facts.json` sidecar exists in this run's `_pool_extracts/` — all figures in this report are cited directly from the FY2025 10-K, the FQ2/FQ3 FY2026 10-Qs, and the verbatim Q3 FY2026 earnings-call transcript, not from a facts sidecar.
