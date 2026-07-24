# Margin Drivers — TSLA

**Jurisdiction / regime:** United States, US GAAP, USD millions. Fiscal year end Dec-31. [Form 10-Q, Jul-23-2026, cover page]

## 1. Segment Decomposition Status

Segment decomposition applied, matching `02_revenue-drivers` — Tesla reports two ASC 280 segments (Automotive, Energy Generation and Storage) plus a disclosed "Services and other" sub-line inside Automotive that this report treats as a third, informational row [`business-model/03_segment-map.md`, §1]. Automotive alone is 88.9% of Q2 FY2026 revenue — above the >85% single-segment threshold — but Tesla discloses full revenue, cost of revenue, and gross-profit lines for both segments, and margin trends differ sharply between them (Automotive GAAP gross margin 16.9% vs Energy 20.4% in Q2 FY2026 [`FY26 Q2 10-Q, Note 14`]), so segment-level margin decomposition adds real information here.

**Critical disclosure limit carried over from `03_segment-map.md`, §3:** Tesla allocates **revenue, cost of revenue, and gross profit** to each segment — it does **not** allocate operating expenses (R&D, SG&A), operating income, or D&A-below-the-gross-profit-line by segment in the primary segment note. Every segment margin figure in this report is therefore a **gross-margin** read; segment-level EBIT or EBITDA margin cannot be computed from disclosure and is not attempted. (A CIQ vendor tab does carry a segment D&A allocation — Automotive $3,780M / Energy $355M, FY2025 — but this is a vendor apportionment, not a line Tesla itself discloses, and is flagged as such wherever used [`CIQ Financials_Annual export, Segments tab, FY2025`].)

Business-model cross-module inputs used: `03_segment-map.md`, `06_value-chain.md`, `10_external-dependency.md`, and `02_business-identity.md` §3a (sector-overlay determination) — all present and read for this report.

---

## 2. Sector Overlay

Per `business-model/02_business-identity.md` §3a: *"No row in `frameworks/SECTOR_OVERLAYS.md` covers 'auto OEM' or 'EV manufacturer' by name... no sector overlay for vertically-integrated EV manufacturer — generic read applies."* Confirmed directly against `frameworks/SECTOR_OVERLAYS.md`, which lists SaaS, bank, insurer, REIT, commodity producer/miner, oil & gas, retail, telecom, asset manager, and pharma rows only — none match a vertically integrated EV/energy-storage manufacturer.

**Sector overlay applied: none — generic operating-company cost stack applies** (volume, price/mix, input costs, SG&A/R&D leverage, D&A, one-offs).

---

## 3. Cost Stack

Basis: three months ended Jun-30-2026 vs three months ended Jun-30-2025 (Q2 FY2026 vs Q2 FY2025), GAAP, USD millions, from the Q2 FY2026 10-Q Condensed Consolidated Statements of Operations and Note 9 (Stock-Based Compensation) [`FY26 Q2 10-Q, Item 1`]. Tesla does not break out a standalone raw-material, labor, freight, or energy cost line — cost of revenue is disclosed only by segment (Automotive, Energy, Services and other), so those generic rows are marked "Not disclosed" and the segment cost-of-revenue rows are used instead.

| Cost Line | Q2 FY2026 | Q2 FY2025 | Direction | Evidence | Margin Risk |
|---|---:|---|---|---|---|
| Automotive sales cost of revenue | $16,866M (24.6% higher deliveries drove the $) | $13,567M | Rising with volume; average cost per unit "relatively consistent" | `FY26 Q2 10-Q, Item 2 MD&A` — "Cost of automotive sales revenue increased $3.30 billion, or 24%... Average cost per unit was relatively consistent due to unfavorable sales mix and a negative impact from the weakening of the United States dollar... offset by favorable impacts related to warranty adjustments and tariffs" | Mid — cost tracks volume almost 1:1, so cost discipline (not volume) is what protects margin |
| Energy generation & storage cost of revenue | $2,499M | $1,943M (+29% YoY) | Rising faster than the segment's own revenue growth (13% YoY) | `FY26 Q2 10-Q, Item 2 MD&A` — "increase in average cost per MWh primarily driven by sales mix and unfavorable warranty adjustments" | High — cost outpacing revenue is the direct cause of the segment's margin collapse (see §4) |
| Services and other cost of revenue | $3,933M | $2,880M (+37% YoY, slower than the segment's 50% revenue growth) | Improving relative to revenue | `FY26 Q2 10-Q, Item 2 MD&A` | Low-to-Mid — this is the one segment where cost growth is currently running below revenue growth |
| Raw materials / commodity inputs (standalone line) | Not disclosed | Not disclosed | Unknown | Embedded inside the three cost-of-revenue lines above; no separate raw-material, freight, or energy-cost line is broken out anywhere in the pool | Cannot be isolated from available data |
| Labor (standalone line) | Not disclosed | Not disclosed | Unknown | Not broken out separately from cost of revenue / R&D / SG&A | Cannot be isolated from available data |
| R&D | $2,371M (8% of revenue) | $1,589M (7% of revenue) | Rising, +49% YoY vs +25.5% revenue growth | `FY26 Q2 10-Q, Item 2 MD&A` — "increased $782 million, or 49%... primarily due to significant research and development-related activities, including preproduction ramp costs for new products like the Semi Truck, Optimus, Cybercab and other AI initiatives... additional compute" [Q2 FY2026 transcript, prepared remarks] | High — growing roughly 2x faster than revenue |
| SG&A | $1,982M (7% of revenue) | $1,366M (6% of revenue) | Rising, +45% YoY vs +25.5% revenue growth | `FY26 Q2 10-Q, Item 2 MD&A` — SG&A increased "$616 million, or 45%"; the note attributes a large piece to stock-based compensation (below) | High — same negative-leverage pattern as R&D |
| — of which Stock-based compensation (all lines) | $1,151M total (COGS $258M / R&D $487M / SG&A $406M) | $635M total (COGS $213M / R&D $298M / SG&A $124M) | Rising sharply, +81% YoY | `FY26 Q2 10-Q, Note 9 (Stock-Based Compensation)` | High — see §8; this is the single largest identifiable driver of the opex-ratio increase |
| D&A | $1,619M (5.7% of revenue) | $1,433M (6.4% of revenue) | Falling as a % of revenue (D&A growing slower than revenue for now) | `Financials_Quarterly.xls, Cash Flow tab` [CIQ]; consistent with company Op. Income of $398M [`FY26 Q2 10-Q, Item 1`] | Mid — a forward risk, not a current one: capex "more than doubled sequentially" to fund robotaxi, Optimus, AI compute and new factories, and management guides FY2026 capex ">$25 billion" and rising "for the next two to three years" [Q2 FY2026 transcript, prepared remarks] — D&A has not yet caught up with this capex ramp |
| Restructuring and other (one-off) | $94M | $0 | New this quarter | `FY26 Q2 10-Q, Item 1` — line item appears for the first time in the periods shown; management ties the increase in opex partly to "charges related to litigation expenses in the quarter" [Q2 FY2026 transcript, prepared remarks] | Low on its own, but a genuine one-off that inflates the reported opex growth rate |
| Interest expense | $81M | $86M | Roughly flat, slightly down | `FY26 Q2 10-Q, Item 1` | Low — immaterial to the margin picture |

---

## 4. Gross Margin → EBITDA Margin → EBIT Margin Walk

Basis: three months ended Jun-30-2026 vs three months ended Jun-30-2025 (company-reported GAAP figures, cross-checked against CIQ D&A — see `01_historical-financials` reconciliation flag, which does **not** affect Q2'25/Q2'26, only Q3/Q4 2025).

| Margin Level | Q2 FY2026 | Q2 FY2025 | Change bps | Main Reason | Evidence |
|---|---:|---:|---:|---|---|
| Gross margin | 16.83% ($4,751M / $28,236M) | 17.24% ($3,878M / $22,496M) | −41 bps | Net of a shrinking, near-pure-margin regulatory-credit line (−67% YoY), a sharp Energy-segment margin drop (30.3%→20.4%, warranty true-up + non-repeating tariff benefit + falling Megapack ASP), and a large Services-margin improvement (5.45%→14.15%) that partly offsets the other two | `TSLA-Q2-2026-Update.pdf, p.3` (company states "-41 bp"); `FY26 Q2 10-Q, Item 2 MD&A` |
| EBITDA margin (GAAP, Op. Income + D&A) | 7.14% ($2,017M) | 10.47% ($2,356M) | −333 bps | Gross-margin erosion (−41bps) plus a sharply higher operating-expense ratio (R&D+SG&A rose from 13.13% to 15.42% of revenue, +229bps) plus a smaller D&A add-back relative to revenue (D&A ratio fell from 6.37% to 5.73%, which mechanically widens the EBITDA-margin decline once EBIT has already fallen) | `01_historical-financials.md`, §3; `FY26 Q2 10-Q, Item 1` |
| EBIT margin (Operating Income) | 1.41% ($398M) | 4.10% ($923M) | −269 bps | Almost entirely the opex-ratio increase (+229bps) plus the small gross-margin decline (−41bps, rounds to ≈−270bps combined) — **not** a gross-margin story | `FY26 Q2 10-Q, Item 1`; calculation shown in §7 |

**Annual complement (structural, not one-quarter):** FY2023→FY2025, gross margin was roughly flat (18.25%→18.03%) while combined R&D+SG&A rose from 9.06% of revenue (FY2023) to 12.91% (FY2025) to 14.25% on a TTM basis (Jun-30-2026) [CIQ Financials_Annual export, Income Statement tab — R&D $3,969M/$4,540M/$6,411M/$7,730M(TTM); SG&A $4,800M/$5,150M/$5,834M/$7,032M(TTM); revenue $96,773M/$97,690M/$94,827M/$103,619M(TTM)]. EBIT margin fell from 9.19% (FY2023) to 4.59% (FY2025) almost in lockstep with the opex-ratio rise, not with gross margin. This is the same pattern the single quarter shows, at a larger scale, over a longer window.

**Pass-through lag (business-model value-chain input, `06_value-chain.md`):** "Tesla's ability to pass rising input costs to customers is partial and lossy, not automatic... the gap was closed mostly by regulatory-credit contribution and cost cuts, not by raising sticker prices" [`06_value-chain.md`, §2]. No numeric lag (in days or quarters) between an input-cost rise and a matching price change is disclosed anywhere in the pool beyond the tariff-recognition timing noted in §7 below — **not proven from available data**.

---

## 5. Margin Walk — Which Margin Level Matters Most?

**EBIT margin (operating income) is the most useful level for Tesla, not gross margin.** Gross margin has been comparatively stable for three years (18.2%–18.9% range, FY2023–TTM) and tells a segment-mix story more than a company-wide profitability story — it moves on regulatory-credit phase-out and Energy-segment one-offs that partly cancel each other out (§4). The real profitability story for the next 3–12 months is happening below the gross-profit line: R&D and SG&A have grown roughly twice as fast as revenue for three straight years, driven by a large, disclosed, and structurally rising stock-based-compensation charge (§8) plus genuine cash investment in Robotaxi, Optimus, Semi, and AI compute that management itself says will keep growing ("we are in a big investment cycle and expect our operating expenses largely driven by R&D to continue to grow in 2026 and beyond" [Q2 FY2026 transcript, prepared remarks]). EBITDA margin is a reasonable secondary check because it strips out the D&A line, which is about to become a forward risk of its own as the current capex ramp (>$25bn FY2026, guided to keep rising [Q2 FY2026 transcript, prepared remarks]) converts into placed-in-service assets — but EBIT margin is the cleanest single number for tracking whether the operating-expense trend (the actual driver identified in this report) is stabilizing or not.

---

## 6. Margin Driver Table (consolidated)

| Driver | Impact on Margins | Direction | Magnitude | Evidence |
|---|---|---|---|---|
| Stock-based compensation ramp (2025 CEO Performance Award + broader grants) | Directly inflates COGS, R&D, and SG&A; SBC rose from 2.82% to 4.08% of revenue YoY (Q2'25→Q2'26) | Headwind | High (>100bps YoY on its own — see §8 calculation) | `FY26 Q2 10-Q, Note 9`; total SBC $635M→$1,151M YoY |
| R&D / SG&A opex growth beyond SBC (AI compute, Semi/Optimus/Cybercab preproduction, litigation) | Non-SBC opex ratio rose from 10.31% to 11.34% of revenue YoY | Headwind | Mid-to-High (~100bps YoY) | `FY26 Q2 10-Q, Item 2 MD&A`; Q2 FY2026 transcript, prepared remarks |
| Automotive regulatory-credit phase-out | Near-100%-margin revenue line down 67% YoY ($439M→$146M), removing a margin cushion | Headwind, policy-driven, non-reversing | Mid on consolidated margin (small dollar base but high margin quality) | `FY26 Q2 10-Q, Item 2 MD&A` |
| Energy-segment warranty true-up and non-repeat of tariff relief | One-off items compressed Q2'26 energy gross margin; management explicitly separates these from the underlying ASP trend | Headwind this quarter, expected to partially reverse (one-off, not run-rate) | Mid | Q2 FY2026 transcript, prepared remarks — "$240 million" warranty true-up; "more than $200 million" Q1 tariff benefit "did not repeat" |
| Energy Megapack/industrial-storage ASP decline | Structural, competition-driven price erosion, separate from the one-offs above | Headwind, ongoing | Mid — management's own long-term normalized range (mid-to-low 20s% gross margin) is itself below Q1 FY2026's 39.5% print, implying further margin give-back is expected even absent one-offs | Q2 FY2026 transcript, prepared remarks — "ASPs for industrial storage is coming down amidst growing competition... we believe the energy business should normalize at a gross margin rate in the mid- to low 20% range" |
| Services and other margin improvement | Segment margin rose from 5.45% (Q2'25, calculated) to 14.15% (Q2'26), an all-time high per management | Tailwind | Mid (16.2% of revenue, so a meaningful absolute-dollar gross-profit contributor) | `FY26 Q2 10-Q, Item 2 MD&A`; Q2 FY2026 transcript, prepared remarks — "Service and other margins improved sequentially from 9.2% to 14.1%, an all-time high" |
| Vehicle mix / ASP (ex-FX) | Update-letter bridge lists "lower vehicle ASP (excl. FX), inclusive of mix" as a drag; per-unit cost "relatively consistent" | Headwind (mild) | Low-to-Mid | `TSLA-Q2-2026-Update.pdf, p.25`; `FY26 Q2 10-Q, Item 2 MD&A` |
| FX (weaker USD) | Mixed: favorable to reported automotive ASP, unfavorable to reported cost per unit — net effect described by management as roughly offsetting | Neutral-to-mild-headwind on cost side | Low-to-Mid, but the underlying exposure is large (a 10% adverse FX move swings pre-tax income $1.64bn) [`FY26 Q2 10-Q, Item 3`] | `FY26 Q2 10-Q, Item 2 MD&A` |
| Interest-rate subvention cost | Tesla subsidizes below-market vehicle financing; subvention cost is booked upfront against automotive revenue, and rising rates raise this cost | Headwind, macro-linked | Low-to-Mid, not separately quantified in the pool | Q2 FY2026 transcript, prepared remarks — "as interest rates have risen this year, the cost of subvention has risen along with them, which had a negative impact on automotive margins" |
| Capacity utilization / battery-cell supply constraint | Battery-pack capacity is the named constraint on vehicle volume growth; underused new capacity (Megafactory ramps) can depress near-term unit economics before volume catches up | Unknown / potentially headwind | Unknown — no utilization rate is disclosed (flagged as a gap in `business-model/02_business-identity.md` §3a) | `TSLA-Q2-2026-Update.pdf, p.2`; `business-model/02_business-identity.md` §3a |
| D&A step-up from the capex ramp | Not yet visible in the reported ratio (D&A/revenue fell YoY), but capex more than doubled sequentially and is guided to keep rising for 2-3 years | Forward headwind, not a current one | Mid (timing and size not disclosed — Inference, not from filings, on when it hits) | `01_historical-financials.md`, §6; Q2 FY2026 transcript, prepared remarks |
| Restructuring / litigation one-off | New $94M charge this quarter, absent a year ago | Headwind, one-off | Low | `FY26 Q2 10-Q, Item 1`; Q2 FY2026 transcript, prepared remarks |

---

## 7. Margin Drivers By Segment

### Segment: Automotive incl. Services and other sub-line (~88.9% of Q2 FY2026 revenue)

| Driver | Impact | Direction | Magnitude | Evidence |
|---|---|---|---|---|
| Automotive GAAP gross margin (with credits) | 17.2% (Q2'25) → 16.9% (Q2'26), −30bps YoY | Headwind (mild) | Mid | `FY26 Q2 10-Q, Item 2 MD&A` |
| Automotive gross margin ex-regulatory-credits | 19.2% (Q1'26) → 16.3% (Q2'26), −290bps QoQ; no comparable Q2'25 ex-credit figure disclosed in the pool — YoY ex-credit change **not proven from available data** | Headwind, but management attributes most of the QoQ drop to a non-repeating Q1 one-off, not underlying deterioration | Mid | Q2 FY2026 transcript, prepared remarks — "Controlling for the impact of those [Q1] benefits... automotive gross margins, excluding credits would have been approximately flat" |
| Regulatory-credit revenue | $439M (Q2'25) → $146M (Q2'26), −67% YoY | Headwind, policy-driven, non-reversing | Mid-High on margin quality despite small revenue size | `FY26 Q2 10-Q, Item 2 MD&A` — "Recent governmental and regulatory actions have restricted certain regulatory credit programs" |
| Services and other margin | 5.45% (Q2'25, calculated from disclosed revenue/cost) → 14.15% (Q2'26) | Tailwind | High within this sub-line | `FY26 Q2 10-Q, Item 2 MD&A`; Q2 FY2026 transcript |
| Interest-rate subvention cost | Rising with rates, booked against automotive revenue upfront | Headwind | Low-to-Mid, unquantified | Q2 FY2026 transcript, prepared remarks |

### Segment: Energy Generation and Storage (~11.1% of Q2 FY2026 revenue)

| Driver | Impact | Direction | Magnitude | Evidence |
|---|---|---|---|---|
| Segment gross margin | 30.3% (Q2'25) → 20.4% (Q2'26), −990bps YoY; also 39.5% (Q1'26) → 20.4% (Q2'26) QoQ | Headwind | High | `FY26 Q2 10-Q, Item 2 MD&A`; Q2 FY2026 transcript |
| Warranty true-up (vendor cell issue, legacy deployments) | ~$240M one-off cost in Q2'26 | Headwind, one-off | High for this quarter, non-recurring | Q2 FY2026 transcript, prepared remarks |
| Tariff-relief timing | >$200M benefit recognized in Q1'26 "did not repeat" in Q2'26 | Headwind (absence of a prior tailwind), one-off | Mid-High | Q2 FY2026 transcript, prepared remarks |
| Megapack/industrial-storage ASP | Declining "amidst growing competition" | Headwind, structural | Mid, ongoing | Q2 FY2026 transcript, prepared remarks |
| Long-term normalized margin guide | Management targets "mid- to low 20% range" | Neutral (this is management's own steady-state expectation, below the Q1'26 print) | — | Q2 FY2026 transcript, prepared remarks |
| China battery-cell sourcing / tariff exposure | "most of the battery cells are procured from China," named as the reason "tariffs in this business can have outsized impacts" | Headwind risk, not yet in the reported numbers this quarter beyond the tariff-timing item above | High if tariffs escalate | `06_value-chain.md`, §2, citing Q1 FY2026 transcript |

---

## 8. Margin Bridge — Latest Period

Basis: Q2 FY2026 vs Q2 FY2025, EBIT margin (the primary metric per §5). All components computed from disclosed GAAP figures; no estimation was required because gross profit, R&D, SG&A, SBC, and D&A are each separately disclosed for both periods.

| Component | Margin Impact (bps) | Evidence |
|---|---:|---|
| Gross margin (segment mix net effect: credits down, Energy margin down, Services margin up) | −41 | `TSLA-Q2-2026-Update.pdf, p.3`; §4 above |
| Operating-expense ratio — stock-based compensation | −126 | Calculated: SBC/revenue 2.82% (Q2'25, $635M/$22,496M) → 4.08% (Q2'26, $1,151M/$28,236M) = +126bps of revenue consumed, i.e., a 126bps drag on EBIT margin. `FY26 Q2 10-Q, Note 9` |
| Operating-expense ratio — R&D/SG&A ex-SBC (AI compute, product preproduction, litigation, headcount) | −103 | Calculated: opex-ex-SBC/revenue 10.31% (Q2'25, $2,320M/$22,496M) → 11.34% (Q2'26, $3,202M/$28,236M) = +103bps drag. `FY26 Q2 10-Q, Item 1` |
| **Total EBIT margin change** | **−269** (calculated: 4.10%→1.41%; components above sum to −270, within rounding) | `FY26 Q2 10-Q, Item 1` |
| Memo: D&A ratio effect on EBITDA margin (not part of the EBIT bridge above) | −64 (widens the EBITDA-margin decline to −333bps total) | D&A/revenue 6.37% (Q2'25) → 5.73% (Q2'26); `Financials_Quarterly.xls, Cash Flow tab` [CIQ] |

The bridge is unusually clean for this business: **the entire EBIT margin decline is an operating-expense story, not a gross-margin story.** Volume, price, one-offs, and segment mix roughly netted out to a −41bps gross-margin effect; the −229bps of additional EBIT-margin damage came entirely from R&D and SG&A growing far faster than revenue, and just over half of that (−126bps of the −229bps) is directly attributable to the rise in stock-based compensation.

---

## 9. The Single Biggest Margin Driver

**The stock-based-compensation ramp tied to the 2025 CEO Performance Award, and the broader R&D/SG&A opex growth riding alongside it, is the single biggest driver of where Tesla's margins go next.** Total company SBC rose from $635M to $1,151M YoY (+81%), and more than half of that increase ($267M of the ~$516M YoY rise) is directly tied to a single new item: the 2025 CEO Performance Award (granted Sept 3, 2025), for which Tesla began recognizing expense in the last several quarters after determining the "20 million vehicles delivered" operational milestone is now probable [`FY26 Q2 10-Q, Note 9`]. As of Jun-30-2026, Tesla still has **$9.82 billion of unrecognized expense** for this now-probable tranche, to be recognized over roughly **9.2 more years** — a locked-in, rising, non-cash cost that will keep pressuring SG&A margin regardless of what the underlying auto or energy business does. Behind that sits a far larger overhang: **$105.82 billion to $120.37 billion of unrecognized expense for tranches tied to milestones not yet deemed probable** (further vehicle-delivery, FSD-subscription, Robotaxi, and Adjusted-EBITDA targets up to $400bn) [`FY26 Q2 10-Q, Note 9`] — if even one or two of those become probable in a future quarter, the same mechanism (a lumpy, multi-quarter step-up in SG&A) will repeat and could be materially larger than the current one. Layered on top, management has explicitly guided that non-SBC operating expenses will also keep growing ("we expect our operating expenses largely driven by R&D to continue to grow in 2026 and beyond" [Q2 FY2026 transcript, prepared remarks]) to fund Robotaxi, Optimus, Semi, and AI-compute build-out — all pre-revenue or early-revenue programs today. Its current direction is a clear, quantified headwind (−229bps of the −269bps total EBIT-margin decline this quarter came from the opex ratio, of which SBC alone was −126bps), and nothing in the disclosed record suggests this reverses in the next several quarters — the opposite: both the CEO-award recognition schedule and management's own guidance point to further opex-ratio growth ahead.

---

## 10. Citations

[1] `Tesla_Inc_-_Form_10-Q(Jul-23-2026)` (Q2 FY2026 10-Q) — Item 1 Financial Statements (Condensed Consolidated Statements of Operations); Note 9 (Stock-Based Compensation, incl. 2025 CEO Performance Award and Summary Stock-Based Compensation table); Note 14 (Segment Reporting); Item 2 MD&A (Results of Operations, Automotive & Services and Other Segment; Energy Generation and Storage Segment; R&D and SG&A expense discussion); Item 3 (FX sensitivity)
[2] Tesla Q2 2026 Earnings Call transcript, Jul 22, 2026 (verbatim, S&P Global Market Intelligence) — prepared remarks (Vaibhav Taneja, CFO; Elon Musk, CEO)
[3] `TSLA-Q2-2026-Update.pdf` (Q2 2026 shareholder Update letter, unaudited) — Financial Summary p.3, Key Metrics YoY Financial Summary p.25
[4] `analyses/TSLA_2026-07-24/earnings/01_historical-financials.md` — margin baseline, quarterly EBITDA/EBIT tables, D&A reconciliation
[5] `analyses/TSLA_2026-07-24/earnings/02_revenue-drivers.md` — revenue-side context (regulatory credits, geographic mix, cycle-position note)
[6] `analyses/TSLA_2026-07-24/business-model/03_segment-map.md` — segment structure, disclosure-depth gap (no opex/EBIT allocation by segment)
[7] `analyses/TSLA_2026-07-24/business-model/06_value-chain.md` — pass-through / pricing-power context
[8] `analyses/TSLA_2026-07-24/business-model/10_external-dependency.md` — cyclicality, FX, interest-rate, and policy dependency classification
[9] `analyses/TSLA_2026-07-24/business-model/02_business-identity.md` §3a — sector-overlay determination (no match; generic read)
[10] Capital IQ export, Tesla Inc NasdaqGS TSLA Financials_Annual.xls — Income Statement, Segments tabs (FY2017–FY2025, data as of 2026-07-24 extraction)
[11] Capital IQ export, Tesla Inc NasdaqGS TSLA Financials_Quarterly.xls — Income Statement (Stock-Based Comp. detail), Cash Flow (D&A) tabs (data as of 2026-07-24 extraction)
[12] `frameworks/SECTOR_OVERLAYS.md` — confirms no auto-OEM / EV-manufacturer row exists
