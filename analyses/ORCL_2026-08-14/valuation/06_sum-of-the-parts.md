# Sum-of-the-Parts — ORCL

Reporting standard: US GAAP. Currency: USD (millions, except per-share). Fiscal year ends May 31 (FY2026 = year ended May-31-2026; FY2027 = year ending May-31-2027).

## 1. Segment Inventory

Oracle reports three ASC 280 operating segments: Cloud and Software, Hardware, and Services [FY26 10-K, Note 13 (Segment Information), p.99–100, via `business-model/03_segment-map.md` §1]. "Margin" below is Oracle's own company-defined segment-profit measure — it includes only the "direct controllable costs" of each business and excludes R&D, G&A, stock-based compensation, amortization of intangibles, restructuring, interest and other non-operating items [FY26 10-K, Note 13, p.100–101, footnote 1].

| Segment | Revenue (FY26) | Segment Margin — company-defined EBIT (FY26) | Margin % | % of Total Segment Margin | Source |
|---|---:|---:|---:|---:|---|
| Cloud and Software | $58,530M | $34,468M | 58.9% | 90.7% | FY26 10-K, Note 13, p.100 |
| Hardware | $3,084M | $2,017M | 65.4% | 5.3% | FY26 10-K, Note 13, p.100 |
| Services | $5,743M | $1,533M | 26.7% | 4.0% | FY26 10-K, Note 13, p.100 |
| **Total (reportable segments)** | **$67,357M** | **$38,018M** | **56.5%** | **100.0%** | FY26 10-K, Note 13, p.100 |

**Denominator definition (Gate 3).** "% of Total Segment Margin" sums to 100% of the $38,018M reportable-segment total — it is **not** 100% of consolidated profit. FY26 audited consolidated GAAP operating income is $20,606M [FY26 10-K / Q4 FY26 Earnings Press Release, "Reconciliation of Selected GAAP Measures to Non-GAAP Measures," p.4, via `earnings/01_historical-financials.md` §4]. The **$17,412M gap** ($38,018M − $20,606M) is a named, disclosed unallocated/corporate bucket — R&D ($10,272M), G&A ($1,618M), segment-level stock-based compensation ($1,618M), other allocations ($395M), amortization of intangibles ($1,671M), and restructuring & other charges ($1,838M) [FY26 10-K, Note 13, p.101 reconciliation table, via `business-model/03_segment-map.md` §3; tie-out: 10,272+1,618+1,618+395+1,671+1,838 = 17,412, reconciling exactly to 38,018−20,606]. This bucket is **not dropped** — see §3–4 for how it is handled.

Segment revenue is fully allocated (no "Other"/Corporate revenue bucket): $58,530M + $3,084M + $5,743M = $67,357M ties to consolidated revenue [FY26 10-K, Note 13, p.100].

**Partial-data rule triggered — effectively single-segment.** Cloud and Software is 86.9% of FY26 revenue and 90.7% of FY26 total segment margin [`business-model/03_segment-map.md` §2], clearing the >85%-of-EBIT threshold in both directions. **Oracle is, in substance, a single-reportable-segment company — SOTP collapses to the consolidated read**, rather than a forced three-way breakup. Hardware and Services are shown below only as a scale check (they are non-core, low-growth-to-shrinking adjuncts per `business-model/03_segment-map.md` §2), and the $17,412M corporate/unallocated bucket is capitalized-consistent (netted into the metric used, not dropped) per §3–4.

## 2. Segment Multiples & Comparables

| Segment | Metric Used | Period Basis | Multiple Applied | Named Comparable | Comparable's Multiple | Source |
|---|---|---|---:|---|---:|---|
| Consolidated (collapsed proxy for Cloud & Software, 90.7% of profit) | Forward consensus EBITDA, $49,996M | **NTM / FY2027** (fiscal year ending May-31-2027) — already nets the $17,412M unallocated corporate bucket, since it is a bottom-up, whole-company forward estimate | 14.95x (low) – 15.43x (high); 15.19x (base, average) | SAP SE (XTRA:SAP) — closest applications-layer economics to Oracle's ERP/SaaS franchise, directly named as a competitor to Oracle Fusion/NetSuite [FY26 10-K, Item 1A Risk Factors]; Microsoft Corp (NasdaqGS:MSFT) — spans BOTH halves of Oracle's dominant segment (Azure = direct OCI infrastructure rival; Dynamics 365 = applications rival), also directly named [FY26 10-K, Item 1A Risk Factors] | SAP: NTM TEV/Forward EBITDA 14.95x; MSFT: NTM TEV/Forward EBITDA 15.43x | `Company Comparable Analysis Oracle Corporation.xls`, Trading Multiples tab, data as of 2026-08-13 |
| Hardware (scale check only — see caveat) | Segment margin, $2,017M (FY26) | **Trailing (LTM/FY26)** — not structurable on a forward basis: Oracle discloses no segment-level forward guidance or consensus for Hardware, and states it "does not track assets for each business" [FY26 10-K, Note 13, p.100] | 16.98x (TTM EV/EBITDA) | Hewlett Packard Enterprise (HPE) — enterprise servers/storage/engineered-systems economics match Oracle's Hardware business (Oracle Engineered Systems, servers, storage); HPE is named directly alongside ORCL's other 10-K competitors as a hardware rival | 16.98x TTM EV/EBITDA | Web: valueinvesting.io, HPE valuation page, as of 2026-08-14 (unverified, dated) |
| Services (scale check only — see caveat) | Segment margin, $1,533M (FY26) | **Trailing (LTM/FY26)** — not structurable on a forward basis (no segment forward guidance/consensus disclosed) | 7.45x (TTM EV/EBITDA) | Accenture plc (ACN) — asset-light IT consulting/implementation-services economics match Oracle's Services business (consulting + customer success services, personnel-cost-driven) [FY26 10-K, Note 13, p.100: "primarily personnel-related expenses...facilities...external contractor expenses"] | 7.45x TTM EV/EBITDA | Web: valueinvesting.io, Accenture valuation page, as of 2026-08-14 (unverified, dated) |

**Why the consolidated forward metric, not a segment-level forward metric, for Cloud & Software.** Oracle guides and consensus estimates revenue, EPS and (implicitly) EBITDA only at the whole-company level [Oracle Q4 FY26 Earnings Press Release, 2026-06-10; `earnings/04_guidance-consensus.md` §2; Capital IQ Estimates Report, Consensus tab] — there is no disclosed or evidenced forward EBIT/EBITDA estimate specifically for the Cloud and Software segment. Per the Forward Basis Hard Rule's "suppress rather than guess" clause, a segment-specific forward SOTP for Cloud & Software is **not structurable** and is not fabricated here. Because Cloud & Software is 90.7% of segment profit, the whole-company forward consensus metric is used as the collapsed proxy instead — and because it is a bottom-up consolidated estimate, it already nets the $17,412M corporate bucket (R&D, G&A, SBC, amortization, restructuring), satisfying Reconciliation Gate 3 without a separate capitalize-and-subtract step.

**Hardware and Services are trailing-only and excluded from the primary sum.** Neither has a forward metric or forward comparable — both are marked *"not structurable on a forward basis — trailing sanity check only."* Their trailing EVs (below) are **not** added to the primary collapsed EV: they are already embedded inside the consolidated forward EBITDA used above (which covers 100% of the company, all three segments plus corporate costs). Adding them again would double-count.

**AWS excluded as a segment comparable.** Amazon Web Services is the most direct economic match for Oracle's cloud-infrastructure (OCI) sub-segment, but AWS is not separately listed — Amazon's consolidated multiples blend a mostly non-software e-commerce/logistics/advertising business and are not a clean OCI comparable [`business-model/08_competitive-map.md` §2, §5; consistent with `valuation/03_relative-valuation-peers.md` §1 exclusion]. AWS's disclosed segment operating margin (39.4% in Q2 2026 [Web, unverified]) is referenced qualitatively only, not as a multiple.

## 3. Segment Valuation

| Segment | Metric Value | Multiple | Segment EV |
|---|---:|---:|---:|
| Consolidated (collapsed — covers Cloud & Software + Hardware + Services + corporate, net of the $17,412M unallocated bucket) | $49,996M (FY2027 consensus EBITDA) | 14.95x – 15.43x (base 15.19x) | $747,440M – $771,438M (base $759,439M) |
| **Gross enterprise value (primary, collapsed)** | | | **$759,439M (base); range $747,440M–$771,438M** |
| Hardware (trailing, scale check — NOT additive) | $2,017M segment margin | 16.98x | ≈$34,249M |
| Services (trailing, scale check — NOT additive) | $1,533M segment margin | 7.45x | ≈$11,421M |

Formula: Segment EV = Metric Value × Multiple. Base case: $49,996M × 15.19x = $759,439M. The Hardware and Services rows total ≈$45.7B combined (≈6% of the primary gross EV) — shown to demonstrate their immateriality (consistent with the single-segment collapse in §1), not summed into the $759,439M line above.

**Scale cross-check on the corporate bucket.** FY26 trailing total segment margin ($38,018M) overstates true consolidated operating profit by 84% relative to audited GAAP operating income ($20,606M) because $17,412M of R&D, G&A, stock-based compensation, intangible amortization and restructuring sit below the segment-margin line (§1). Any segment-multiple SOTP that sums segment-margin-based EVs without netting this bucket materially overstates value — this is exactly why §2–3 value the collapsed business on **consolidated** forward EBITDA (which nets the bucket) rather than summing three segment-margin-based EVs and then trying to capitalize-and-subtract the corporate drag separately.

## 4. Equity Bridge

| Step | Value ($M) |
|---|---:|
| Gross enterprise value (base case) | 759,439 |
| − Capitalized unallocated corporate costs | 0 — already netted in the FY2027 consensus EBITDA metric used above (see §2–3); not a separate deduction (avoids double-counting) |
| − Net debt (strict basis, per `01_price-and-capital-structure.md` §5) | (136,143) |
| − Minority / non-controlling interest (per `01` §4) | (548) |
| − Preferred equity, carrying value (Mandatory Convertible Preferred, per `01` §4) | (4,954) |
| + Equity-method investments | 0 — not separately disclosed/carved out from "Other Long-Term Assets"; per `01` §4, none is excluded from EV |
| − Conglomerate / holdco discount | 0 — none applied. Oracle is not a diversified conglomerate of unrelated businesses; Hardware and Services are small, integrated adjuncts of the same core enterprise-software/cloud franchise (§1), so no diversification/complexity discount is warranted |
| **= Equity value (base case)** | **617,794** |
| ÷ Diluted shares (GAAP diluted weighted-average, per `01` §2, disclosure-clean default — excludes the Mandatory Convertible Preferred, consistent with subtracting its carrying value above rather than if-converting it) | 2,914M |
| **= SOTP value per share (base case)** | **$212.01** |
| Range (low SAP 14.95x / high MSFT 15.43x) | $207.89 – $216.13 |
| vs current price ($153.94, Aug-13-2026, pool-verified — per `01` §1) | **+35.0% to +40.4% (base +37.7%)** |

Net debt: Oracle is **net debt**, not net cash, throughout — no add-back sign issue applies. Cash quality was checked and cleared in `01` §4 (no financial-subsidiary trapped-cash pool; restricted cash immaterial); no haircut carried into this bridge.

**Reference / internal-consistency check (not part of the SOTP range).** Applying Oracle's own current NTM EV/EBITDA multiple (11.65x, same Trading Multiples export) to the identical $49,996M forward EBITDA base gives EV $582,453M → equity $440,808M → **$151.27/share**, essentially reproducing today's $153.94 price (within ~2%, consistent with normal quote-date/rounding). This confirms the bridge mechanics are internally consistent and isolates the entire SOTP-vs-price gap to one question: **does Oracle's dominant segment deserve a peer (MSFT/SAP-level, ~15x) multiple, or does the market's own ~11.65x multiple already reflect a warranted discount?** See §5.

## 5. SOTP Read

Oracle clears the single-segment threshold (Cloud and Software = 86.9% of revenue, 90.7% of profit), so there is no hidden multi-business breakup value to unlock here — this SOTP mechanically **collapses to the consolidated read**, and the two non-core segments (Hardware, Services) are worth a combined ≈$45.7B on a trailing basis, about 6% of the primary gross EV, confirming they are not where Oracle's value sits.

The mechanical named-comp exercise (Cloud & Software's economics proxied by the whole-company forward EBITDA, multiplied by SAP's and Microsoft's forward EV/EBITDA) produces a base case of **$212.01/share (+37.7% vs the $153.94 price)**, with a peer-driven range of $207.89–$216.13. That number should be read as a **peer-parity ceiling, not a base fair value**: it implicitly assumes Oracle's dominant segment deserves the same multiple as MSFT (net debt roughly 0.6x EBITDA) and SAP (roughly 0.8x), when Oracle itself carries net debt/EBITDA of 4.46x and generated **negative** free cash flow of −$23.7B in FY26 [`earnings/01_historical-financials.md` §1; `valuation/03_relative-valuation-peers.md` §2, §4]. `valuation/03_relative-valuation-peers.md` independently derived a leverage-and-moat-erosion-adjusted "quality-adjusted" multiple of 11.5x on the **same** $49,996M forward-EBITDA base and arrived at $148.70/share (−3.4% vs price) — essentially fair value. Per CLAUDE.md Core Principle 3 (warranted vs observed) and Core Principle 6 (default to the lower value when methods conflict), that quality-adjusted reading is the more defensible one: **the raw peer-multiple SOTP overstates fair value by roughly 40 percentage points because it prices Oracle's balance sheet as if it were MSFT's or SAP's, which it is not.** The market's own ~11.65x multiple (which reproduces the current price almost exactly, per §4) is not obviously irrational — it already looks close to what the leverage and negative-FCF gap versus true peers would warrant.

One further flag on the primary metric itself: FY2027 consensus EBITDA of $49,996M implies a jump from FY26's 45.3% actual EBITDA margin to ~56.0% — a roughly 1,070bp margin expansion in a single year, driven by the assumption that OCI's infrastructure margin "improves rapidly" once data centers reach full contractual revenue [`earnings/04_guidance-consensus.md` §2]. If that margin instead holds flat at FY26's 45.3%, forward EBITDA falls to ≈$40,445M and the same 15.19x base multiple implies ≈$162/share instead of $212 — a reminder that the primary SOTP number is highly sensitive to a margin-expansion assumption embedded in consensus, not yet realized in a reported quarter.

**Bottom line:** the segment breakdown does not surface a masked high-value business the consolidated multiple is hiding — Cloud and Software already IS effectively the whole company. The real question this SOTP surfaces is a quality-of-multiple question, not a mix question: once leverage and free-cash-flow quality are priced in (consistent with `03`'s independent read), Oracle's SOTP-implied value sits close to, not far above, the current price.

