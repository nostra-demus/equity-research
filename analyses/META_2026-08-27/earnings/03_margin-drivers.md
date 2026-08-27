# Margin Drivers — META

Reporting standard: US GAAP. Currency: USD, millions unless stated. Fiscal year end: December 31. All figures reported vs adjusted are labelled; Meta does not disclose an adjusted (non-GAAP) operating income or EBITDA measure [Q2 FY26 10-Q, MD&A, p.41; Q2 FY26 Earnings Release, GAAP-to-Non-GAAP Reconciliation, p.9].

## 1. Segment Decomposition Status

Business-model module output is available: `03_segment-map.md` and `06_value-chain.md` and `10_external-dependency.md` all exist and are used below.

Family of Apps (FoA) generated 99.3% of Q2 FY26 revenue ($60,370m of $60,801m), which clears the module's own >85% single-segment threshold for a "state it and proceed at consolidated level" treatment [Q2 FY26 10-Q, Note 12 — Segment Information]. This report nonetheless gives a segment-level margin view in Section 6 because Meta discloses full income-statement segment data for both reportable segments (revenue, employee compensation, other costs and expenses, and income/loss from operations), and Reality Labs' (RL) operating loss is a large, real drag on consolidated operating income ($4,619m lost in Q2 FY26 alone) [Q2 FY26 10-Q, Note 12]. That said, the disclosure has a real limit: Meta does **not** break out cost of revenue, R&D, marketing and sales, or G&A by segment — only two cost buckets ("employee compensation" and "other costs and expenses") are given per segment [Q2 FY26 10-Q, Note 12, footnotes (1)–(3)]. This report does not guess a segment split for the four P&L cost lines; the bridge in Section 7 is therefore built at the consolidated level, where the full cost-line detail exists.

## 2. Sector Overlay

**No sector overlay for global digital advertising platform whose advertising profits fund an early-stage VR/AR hardware and research unit — generic cost stack applies**, consistent with `02_business-identity.md` §3a's own read (no `SECTOR_OVERLAYS.md` row matches this business type; no such framework file exists in this pool as of the run date). The generic cost-line grammar (cost of revenue, R&D, marketing and sales, G&A, D&A, interest expense) is used below.

## 3. Cost Stack

**Basis:** three months ended June 30, 2026 vs three months ended June 30, 2025 (the "Q2 FY26" / "Q2 FY25" columns), the basis with the clearest, most current signal; six-month figures are given alongside for confirmation. All dollar figures and percentages below are recomputed from the 10-Q's own reported dollars, not merely copied from its rounded percentage table, so figures below carry one more decimal of precision than the filing's own "% of revenue" table.

| Cost Line | Q2 FY26 ($m / % of rev) | Q2 FY25 ($m / % of rev) | Direction | Evidence | Margin Risk |
|---|---:|---:|---|---|---|
| Cost of revenue | 11,330 / 18.63% | 8,491 / 17.87% | Headwind, +76bps | "increased $2.84 billion, or 33%... primarily due to higher infrastructure expenses related to our data centers, technical infrastructure, and third-party cloud services" [Q2 FY26 10-Q, MD&A—Cost of revenue, p.42] | High — this line carries the data-center energy/bandwidth/cloud cost base directly tied to the AI buildout |
| Research and development | 21,656 / 35.62% | 12,942 / 27.24% | Headwind, +838bps | "increased $8.71 billion, or 67%... primarily due to higher employee compensation, infrastructure expenses..., and third-party AI token costs. The higher employee compensation was mainly from increases in share-based compensation expense and severance expenses" [Q2 FY26 10-Q, MD&A—Research and development, p.43] | High — the single largest cost-line driver of the quarter (see §7/§7a) |
| Marketing and sales | 3,431 / 5.64% | 2,979 / 6.27% | Tailwind, -63bps | "increased $452 million, or 15%... primarily due to higher third-party AI token costs and severance expenses" — but grew slower than the 28% revenue increase [Q2 FY26 10-Q, MD&A—Marketing and sales, p.43] | Low — smallest cost line, currently a source of operating leverage |
| General and administrative | 5,609 / 9.22% | 2,663 / 5.60% | Headwind, +362bps | "increased $2.95 billion, or 111%... primarily due to $2.40 billion of charges related to legal proceedings" [Q2 FY26 10-Q, MD&A—General and administrative, p.44] | High this quarter, but a one-off (see §7a) — underlying (ex-charge) G&A actually improved |
| D&A (property & equipment, disclosed separately; embedded inside the four lines above, not a standalone P&L line) | 6,000 (9.87% of rev) | 4,280 (9.01% of rev) | Headwind | "Depreciation expense on property and equipment was $6.00 billion and $4.28 billion for the three months ended June 30, 2026 and 2025... servers and network assets depreciation expense was $4.62 billion and $3.12 billion" [Q2 FY26 10-Q, Note 5 — Property and Equipment, net] | High — rising with the AI capex wave; not separately broken out by cost line, so its contribution to each of COGS/R&D above cannot be isolated |
| Total D&A (cash-flow-statement add-back, broader than PP&E depreciation above — includes intangibles/ROU amortisation) | H1 FY26: 12,355 | H1 FY25: 8,242 | Headwind, +49.9% YoY | [Q2 FY26 10-Q, Consolidated Statements of Cash Flows] | High |
| Share-based compensation (total company) | H1 FY26: 13,690 | H1 FY25: 8,981 | Headwind, +52.5% YoY | [Q2 FY26 10-Q, Note 6 — Share-based Compensation] | High — see §7a for the R&D-specific SBC split |
| Interest expense (below the operating-income line; does not affect operating margin) | 783 | 241 | Headwind to net margin only, +225% | "increased $542 million... due to higher long-term debt balances" [Q2 FY26 10-Q, MD&A—Interest expense] | Medium — net-margin/EPS effect, not an operating-margin driver; reflects the FY2025 net-cash-to-net-debt flip already flagged in `01_historical-financials` |

Six-month (H1 FY26 vs H1 FY25) figures for the same four lines, shown for confirmation: cost of revenue 21,549 vs 16,063 (+34%); R&D 39,354 vs 25,092 (+57%); marketing and sales 6,339 vs 5,735 (+11%); G&A 8,222 vs 4,943 (+66%) [Q2 FY26 10-Q, MD&A, p.41]. The direction of every line is the same at the six-month horizon as at the quarterly horizon used above.

**Headcount context (a real driver, not a filler row):** total headcount was 75,472 at quarter-end, DOWN 1% year over year — including roughly 8,000 employees still counted from the May 2026 reduction who will mostly roll off by the end of Q3 FY26 [Q2 FY26 10-Q, MD&A, p.39–40]. Employee compensation cost still grew sharply (FoA segment alone: employee compensation $14,571m in Q2 FY26 vs $9,336m in Q2 FY25, +56%) [Q2 FY26 10-Q, Note 12]. Falling headcount alongside surging comp cost means this is a **cost-per-employee** story (technical/AI hiring at premium pay, higher SBC, one-off severance), not a **headcount-growth** story — an important distinction for anyone modelling this line forward.

## 4. Gross Margin → Operating (EBIT) Margin Walk

**Annual basis (FY2025 vs FY2024), from `01_historical-financials`:**

| Margin Level | FY2025 | FY2024 | Change bps | Main Reason | Evidence |
|---|---:|---:|---:|---|---|
| Gross margin (Revenue − cost of revenue only; a constructed, non-GAAP-labelled figure — Meta reports no gross-profit subtotal) | 82.0% | 81.7% | +30 | Ad revenue (+22.2%) outgrew cost of revenue | `01_historical-financials` §1; FY2025 10-K, Item 7 MD&A |
| EBITDA margin (calc = Op. Income + D&A; a computed figure, not company-disclosed — see data-quality flag below) | 50.7% | 51.6% | -90 | D&A and opex growth outpaced revenue in FY2025 | `01_historical-financials` §1 |
| EBIT (operating) margin | 41.4% | 42.2% | -80 | Costs and expenses grew faster than revenue for the first time since FY2022 | `01_historical-financials` §1; FY2025 10-K, Item 7 |

**Quarterly basis (Q2 FY26 vs Q2 FY25) — where the live signal actually is:**

| Margin Level | Q2 FY26 | Q2 FY25 | Change bps | Main Reason | Evidence |
|---|---:|---:|---:|---|---|
| Gross margin | 81.36% | 82.13% | -77 | Cost of revenue (+33%) grew faster than the 28% revenue increase | Recomputed from Q2 FY26 10-Q income-statement dollars, p.41 |
| EBITDA margin (calc) | ~45.3% (as reported in `01_historical-financials` §3) | ~52.2% | ~-690 | See data-quality flag below | `01_historical-financials` §3 |
| EBIT (operating) margin | 30.88% | 43.02% | -1,214 | R&D cost growth (mostly AI-related comp/SBC/infrastructure) plus a one-off legal charge in G&A — decomposed in full in §7 | Q2 FY26 10-Q, MD&A, p.41 (Meta's own disclosed figures: "31% operating margin," down from 43%) |

**Data-quality flag (CLAUDE.md §3 — naming the number that disagrees):** the EBITDA figures above are `01_historical-financials`'s own calculation (Operating Income + Depreciation & Amortisation from the cash-flow statement), not a company-reported number. Cross-checking that calculation against this report's own directly-sourced figures produces a gap: `01_historical-financials`'s implied Q1+Q2 FY26 D&A add-back (28,871 − 22,872 = 5,999; 27,531 − 18,775 = 8,756; sum 14,755) is about $2,400m higher than the actual disclosed H1 FY26 cash-flow-statement D&A add-back of $12,355m [Q2 FY26 10-Q, Consolidated Statements of Cash Flows]. This report cannot resolve the source of that $2,400m gap from the data available (possibly a different quarterly D&A allocation convention in the Capital IQ export `01_historical-financials` used) — it is flagged rather than silently used. **Because of this, the EBIT (operating) margin — built directly and verifiably from the 10-Q's own reported Income from Operations line every time — is used as the primary margin metric in this report, not the calculated EBITDA margin** (see §5 for the full justification).

## 5. Margin Walk — Which Margin Level Matters Most?

**Operating (EBIT) margin is the most useful level for this business**, for three reasons. First, Meta reports no GAAP gross-profit subtotal — the "gross margin" used above is this report's own construction (Revenue − cost of revenue), and it excludes R&D, which is now both the single fastest-growing cost line (+67% YoY in Q2 FY26) and the line carrying the AI investment story; a gross-margin-only view would miss the most important thing happening to this company's cost base right now. Second, Meta's own management guides and is held accountable to "total expenses" and "operating income" (its Q3 FY26 outlook and FY2026 guidance are stated in exactly those terms — see §9), not to a gross-margin figure — so EBIT margin is the metric management itself targets. Third, the EBITDA figure requires this report's own D&A add-back calculation, and §4 above found it does not reconcile cleanly against the actual disclosed cash-flow D&A for FY2026 quarters — a reliability problem that a directly-reported GAAP line (Income from Operations) does not have.

## 6. Margin Drivers By Segment

### Segment: Family of Apps (99.3% of Q2 FY26 revenue)

| Driver | Impact | Direction | Magnitude | Evidence |
|---|---|---|---|---|
| "Other costs and expenses" (infrastructure, professional services, partner arrangements, marketing, facilities, legal-related costs) | FoA-segment cost rose from $12,839m to $22,405m, +74.5% — faster than FoA's own 28% revenue growth | Headwind | High | Q2 FY26 10-Q, Note 12, footnote (2) |
| Employee compensation (FoA segment) | $9,336m → $14,571m, +56% | Headwind | High | Q2 FY26 10-Q, Note 12 |
| FoA operating margin | 52.96% (Q2 FY25) → 38.75% (Q2 FY26), a 1,421bps compression, even as FoA revenue grew 28% | Headwind | High | Q2 FY26 10-Q, Note 12 ($23,394m op. income / $60,370m revenue vs $24,971m / $47,146m) |

### Segment: Reality Labs (0.7% of Q2 FY26 revenue)

| Driver | Impact | Direction | Magnitude | Evidence |
|---|---|---|---|---|
| Operating loss, essentially flat in dollars | $(4,530)m → $(4,619)m, a $89m wider loss even as RL revenue grew 16% (AI glasses growth offsetting weaker Quest headset sales) | Headwind (structural, expected to continue) | Low at the consolidated level (RL is 0.7% of revenue) but a persistent drag | Q2 FY26 10-Q, Note 12; company guidance is that RL operating losses will stay similar to FY2025's $19.19bn full-year loss through 2026 [`03_segment-map.md`, citing Q2 FY26 Form 10-Q, Risk Factors] |

Because segment disclosure does not split cost of revenue, R&D, marketing and sales, or G&A by segment, the consolidated-level bridge in §7 is where the precise dollar attribution lives; the segment tables above show WHERE the dollars are concentrated (FoA), not a segment-level version of the same bridge.

## 7. Margin Bridge — Q2 FY26 vs Q2 FY25 (Operating Margin)

Operating margin fell from 43.02% to 30.88%, a change of **-1,214bps**. The bridge below is built from the cost-line percentages in §3, not estimated.

| Component | Margin Impact (bps) | Evidence |
|---|---:|---|
| Volume / operating leverage (marketing & sales, and underlying G&A excluding the legal charge, both grew slower than the 28% revenue increase) | +96 | Recomputed from Q2 FY26 10-Q dollars, p.41–44 (see §7a) |
| Price | Not applicable at the cost-line level | Average price per ad (+12% YoY) is a revenue-side driver, covered in `02_revenue-drivers`; it does not appear as a distinct cost-line item here |
| Input costs (cost of revenue: data-center, technical infrastructure, third-party cloud) | -76 | Q2 FY26 10-Q, MD&A—Cost of revenue, p.42 |
| Mix | Not disclosed | No cost-side product/segment mix commentary is given in the filing |
| FX | Not applicable on the cost side | FX is disclosed only as a revenue effect ($685m Q2 favourable revenue impact — `01_historical-financials`/`10_external-dependency`); no FX cost-line effect is disclosed |
| One-offs (G&A: $2.40bn legal-proceedings charge) | -395 | Q2 FY26 10-Q, MD&A—General and administrative, p.44; Note 9 — Commitments and Contingencies |
| Other (R&D cost-ratio increase, net of the leverage already counted above) | -838 | Q2 FY26 10-Q, MD&A—Research and development, p.43 (decomposed in §7a) |
| **Total margin change** | **-1,213 (modeled) vs -1,214 (actual)** | 1bp residual — effectively fully reconciled (rounding only) |

## 7a. Bridge Attribution and Residual

```
Input costs (cost of revenue): $2.84bn / 33% dollar increase vs 28% revenue increase
  → cost-of-revenue ratio moved 17.87% (Q2 FY25) → 18.63% (Q2 FY26)
  = -76bps of the -1,214bps observed change [Q2 FY26 10-Q, MD&A p.42]
  → basis: both ratios measured against their own quarter's consolidated revenue — matches, no cross-basis use

One-offs (G&A legal charge): $2.40bn charge ÷ $60,801m Q2 FY26 revenue = 3.95%
  = -395bps of the -1,214bps observed change [Q2 FY26 10-Q, MD&A p.44; Note 9]
  → underlying (ex-charge) G&A: ($5,609m - $2,400m) / $60,801m = 5.28% vs 5.60% in Q2 FY25
    = +33bps, i.e. G&A EX the legal charge actually IMPROVED — the entire net G&A
    drag of -362bps is more than explained by this one item (+33 leverage, -395 charge = -362, matches)
  → basis: charge and revenue both Q2 FY26 figures — matches

"Other" / R&D (-838bps of the -1,214bps observed change):
  R&D share-based compensation alone: $4,080m (8.59% of Q2 FY25 revenue) → $6,760m (11.12% of Q2 FY26 revenue)
    = +253bps of margin drag [Q2 FY26 10-Q, Note 6 — Share-based Compensation]
  → 253 / 838 = 30% of the R&D-driven margin drag is dollar-precise (SBC)
  → the remaining 585bps (70% of the R&D drag) is a NAMED-BUT-UNQUANTIFIED residual: the
    10-Q's own MD&A attributes it to "higher employee compensation [ex-SBC: technical hires and
    severance], infrastructure expenses..., and third-party AI token costs" [Q2 FY26 10-Q, MD&A p.43]
    but discloses none of these four items by dollar amount or by P&L line. The $1.18bn company-wide
    severance figure is disclosed only as a segment-level "employee compensation" footnote spanning
    BOTH FoA and RL [Q2 FY26 10-Q, Note 12, footnote (1)] — it cannot be allocated to the R&D P&L
    line specifically without assuming a split the company does not provide, so it is left inside
    this unallocated residual rather than forced into a precise bps figure.
  → basis check: SBC-by-line table and R&D MD&A narrative are both Q2 FY26 vs Q2 FY25, same basis — matches
```

**Reconciliation:** +96 (leverage) − 76 (input costs) − 395 (one-off) − 838 (R&D/other) = **-1,213bps**, against the stated Total of **-1,214bps** → **1,213bps reconciled, 1bp residual**. The bridge reconciles almost exactly. The finding that matters is not the (near-zero) residual — it is that **within the single largest component (R&D, -838bps), 70% of it (-585bps) is a residual this report cannot break down further**, because Meta's own disclosure names four drivers (technical hiring, severance, infrastructure, AI token costs) without quantifying any of them individually. Section 8's "biggest driver" claim below is made at the R&D-line level, where the arithmetic clears well over half the total change (838/1,214 = 69%); it is NOT made at the level of any single named sub-driver within R&D, because none of those four clears anywhere near half on its own from disclosed dollars.

## 8. The Single Biggest Margin Driver

**R&D cost growth is the single biggest margin driver**, and it is currently a headwind. At -838bps it accounts for 69% of the total -1,214bps operating-margin decline in Q2 FY26 — more than double the one-off G&A legal charge (-395bps) and more than ten times the cost-of-revenue drag (-76bps). Of that -838bps, only -253bps (30%) is precisely attributable to a named, dollar-measured item (share-based compensation); the remaining -585bps is real but not further decomposable from what Meta discloses (technical/AI headcount comp, severance, data-center/cloud infrastructure, and third-party AI token costs, bundled together). This driver's direction is unlikely to reverse soon: FY2026 total-expense guidance was raised (not cut) to $165bn–$169bn [Q2 FY26 earnings call transcript, Jul-29-2026, CFO Susan Li prepared remarks], and headcount-adjusted compensation growth (SBC plus technical hiring, discussed in §3) is a structural AI-investment cost, not a one-off like the G&A legal charge.

## 9. Investment Spend — Both Signs

Capex is running well above its own history: FY2025 capex was $69.69bn [`01_historical-financials` §1]; the FY2026 guidance range of $130bn–$145bn implies roughly a 90%–108% increase in a single year, and that guidance has been raised at every quarterly checkpoint this year — $115bn–$135bn (Q4 FY25 call) → $125bn–$145bn (Q1 FY26 call) → $130bn–$145bn (Q2 FY26 call, narrowing upward at the low end) [Q1 FY26 Earnings Release, Financial Outlook; Q2 FY26 10-Q, MD&A—Liquidity and Capital Resources, p.46; Q2 FY26 earnings call transcript, CFO prepared remarks].

| Reading | What it would show | Evidence here |
|---|---|---|
| Spend as a future COST | D&A already ramping now, not just in the future: PP&E depreciation +40.2% YoY in Q2 FY26 ($6.00bn vs $4.28bn), total D&A +49.9% YoY on an H1 basis ($12.36bn vs $8.24bn); TTM capex +71.2% YoY has already pulled disclosed free cash flow down -20.4% TTM even as cash from operations grew +27.4% [`01_historical-financials` §2; Q2 FY26 10-Q, Note 5]. This cost is landing inside cost of revenue and R&D right now (§3, §7), not deferred to a future period. | Directly measured, current-period |
| Spend as a DEMAND signal | CFO, Q2 FY26 call, on record: "we are today and expect to be in the sort of foreseeable future demand constrained... we still have numerous ROI-positive places that we would put compute toward if we had it" and "we are getting a lot of offers for compute at a significant premium over what we paid for it," while framing the binding constraint as supply ("the industry has underbuilt historically for the wave of AI adoption, making existing capacity, including our own, extremely valuable") [Q2 FY26 earnings call transcript, Jul-29-2026, CFO Susan Li prepared remarks and Q&A]. Ad revenue itself is accelerating, not decelerating, alongside this spend (+28% YoY in Q2 FY26, the fourth straight quarter of YoY acceleration per `01_historical-financials` §3). | Management language + observed revenue growth, NOT a disclosed backlog number |

**Important asymmetry versus a backlog-disclosing business:** unlike a company that publishes a contracted-revenue or remaining-performance-obligation figure, Meta's own business-model output records that "order book / backlog" is "absent / not a natural KPI" for an ad-auction business [`02_business-identity.md` §3a]. So the demand-signal reading here rests on management's qualitative "demand constrained" language and on the ad business's own accelerating growth rate — it is real evidence, but it is weaker than a disclosed backlog number would be, and it should be weighted accordingly.

**Current read:** the evidence favours treating this capex/opex wave as PRINCIPALLY a demand signal with a genuinely simultaneous, currently-landing cost — not a cost that will show up only later. Both signs are true at once: margin IS compressing now (§7), and the company IS turning away monetisable compute demand at a premium price now. The observable that would flip this read toward "cost got ahead of demand": ad-impression growth or average-price-per-ad growth decelerating in the next one to two quarters without a clean FX/macro explanation, or FY2026 total-expense guidance being cut rather than raised at the next print, would both suggest the spend outran what the business can currently monetise.

## 10. Cycle Position (external-dependency cross-check)

`10_external-dependency.md` flags "Consumer cycle" as a High dependency (advertiser budgets are the largest external lever on this business) [`10_external-dependency.md` §1]. The current period is **not** at a cyclical trough: advertising revenue YoY growth has accelerated for four consecutive quarters (Q3 FY24 +18.9% → Q4 FY24 +20.6% → Q1 FY25 +16.1% → Q2 FY25 +21.6% → Q3 FY25 +26.2% → Q4 FY25 +23.8% → Q1 FY26 +33.1% → Q2 FY26 +28.0%) [`01_historical-financials` §3]. Management itself attributes part of the Q2 FY26 price gain to "improvements in macro conditions relative to Q2 of last year" [Q2 FY26 10-Q, MD&A—Advertising, p.42] — an explicit comparison-base effect that will roll off as the comps normalise, and should be read as a tailwind that is **not run-rate**, consistent with the Cycle-Position Rule. The margin implication: Meta is compressing operating margin now, in a period of accelerating ad demand and a favourable macro comparison; if advertiser demand turns down from here (the stated High external dependency), the now-larger, largely fixed AI-infrastructure cost base (D&A, technical compensation) would amplify — not cushion — any resulting margin decline, because operating leverage cuts in both directions.
