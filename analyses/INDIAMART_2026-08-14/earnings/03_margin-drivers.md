# Margin Drivers — INDIAMART

**Sector overlay applied (analog, per business-model `02_business-identity` §3a — a judgment call, not a literal type match):** SaaS / subscription-software margin grammar. IndiaMART's Ind AS profit & loss is a single-step statement with no cost-of-revenue / gross-profit line (confirmed by full-text search of the FY26 Annual Report — no matches for "gross profit" or "cost of revenue" [`01_historical-financials.md` §1, footnote 2]), so the SaaS overlay's headline "GAAP vs non-GAAP gross-margin gap" concept does not apply here — there is no gross-margin line to charge SBC against. The overlay concepts that DO apply and drive this report: stock-based comp as % of revenue, customer-acquisition/servicing cost as the primary opex-leverage metric (there is no raw-material, freight, or energy cost line — confirmed in business-model `06_value-chain.md` §2: "no commodity or raw-material input... it does not itself ship physical goods"), and Deferred Revenue as the RPO-analog leading indicator. The generic Cost Stack table (Section 2) is therefore built from IndiaMART's own disclosed cost lines (Employee benefits, Other expenses sub-lines), not a raw-material/freight/SG&A table, consistent with the overlay's intent.

## 1. Segment Decomposition Status

Web and related Services (the core marketplace) is 91.96% of FY26 consolidated revenue [FY26 Annual Report (Ind AS), Note 32 — Segment information] — it clears the >85% single-segment threshold in `MODULE_RULES.md`. Despite that, this agent decomposes anyway: segment-level P&L **is** disclosed for both segments (Note 32), and the second segment (Accounting Software Services, Busy Infotech + Livekeeping, 8.04% of revenue) has a large, quantifiable, disclosed margin story — its segment loss narrowed from −17.47% to −2.23% margin YoY, and its growing revenue share is itself a measurable drag on the consolidated blend (Section 7a). Standalone entity has no segment disclosure of its own ("the Company has disclosed the segment information only as part of consolidated financial statements" [FY26 Annual Report, Note 32, Standalone Financial Statements]) — the standalone P&L is, for practical purposes, the core marketplace segment, and its own voluntary "function-wise results" note (Note 34) is used below as the cleanest, fully-reconciled cost breakdown for that segment.

## 2. Cost Stack

IndiaMART has no COGS / raw-material / freight / energy line — confirmed absent in both the P&L structure and `06_value-chain.md` §2 ("no commodity or raw-material input... no freight-cost line or logistics-rate risk is disclosed"). The two EBITDA-level cost lines in the audited consolidated P&L are Employee benefits expense and Other expenses; there is no separate line for R&D (embedded in "Technology and Content Expenses" per Note 34) or SG&A (split across Selling & Distribution, Marketing, and G&A per Note 34). Figures are FY26 vs FY25, consolidated, computed and verified via an executed Python snippet (Bash) from the audited P&L notes.

| Cost Line | FY26 (₹mn, % of revenue) | FY25 (₹mn, % of revenue) | Direction | Evidence | Margin Risk |
|---|---:|---:|---|---|---|
| Employee benefits expense (total) | 6,928.25 (44.16%) | 6,009.86 (43.29%) | Worsening (+87bps) | [FY26 Annual Report, Note 21] | Mid — driven almost entirely by SBC + a one-off provision (see Section 7a), not headcount/wage inflation |
| — of which stock-based comp (SBC) | 366.20 (2.33%) | 187.44 (1.35%) | Worsening (+98bps, YoY +95%) | [FY26 Annual Report, Note 21/28] | High if sustained — sector-overlay-flagged metric; growing roughly 2x the pace of revenue |
| — of which salaries/bonus | 6,170.13 (39.32%) | 5,487.17 (39.52%) | Improving (−20bps) | [FY26 Annual Report, Note 21] | Low — base payroll tracked revenue growth closely |
| Other expenses (total) | 3,461.76 (22.06%) | 2,645.66 (19.06%) | Worsening (+301bps) | [FY26 Annual Report, Note 24] | High — the dominant driver of FY26 margin compression |
| — of which Customer support expenses | 628.92 (4.01%) | 291.45 (2.10%) | Worsening (+191bps, YoY +116%) | [FY26 Annual Report, Note 24] | High — includes RFQ/buy-lead verification & enrichment cost (Note 34 definition) |
| — of which Advertisement expenses | 339.13 (2.16%) | 56.64 (0.41%) | Worsening (+175bps, YoY +499%) | [FY26 Annual Report, Note 24] | High — deliberate buyer-acquisition digital-marketing ramp (see Section 9) |
| — of which Outsourced sales cost | 800.45 (5.10%) | 785.93 (5.66%) | Improving (−56bps) | [FY26 Annual Report, Note 24] | Mid — a pulled-back cost line, not a structurally lower one (see Section 8) |
| Depreciation, amortisation & impairment | 284.48 (1.81%) | 329.44 (2.37%) | Improving (−56bps) | [FY26 Annual Report, Note 23] | Low, but see goodwill note below |
| Finance costs | 29.81 (0.19%) | 74.06 (0.53%) | Improving (−34bps) | [FY26 Annual Report, Note 22] | Negligible — 100% lease-liability interest, Total Debt/EBITDA ~0.04x [external-dependency `10`] |
| Raw materials / freight / energy | Not applicable | Not applicable | — | [`06_value-chain.md` §2] | None — no physical cost base |
| R&D (embedded in Technology & Content, standalone-only) | 2,256.28 (15.64% of standalone rev) | 2,007.96 (15.21%) | Worsening (+43bps) | [FY26 Annual Report, Note 34] | Mid |

**Goodwill note (not a current cost-stack item, but a tail risk to D&A/impairment):** ₹4,122.34mn (Busy Infotech) + ₹420.38mn (Livekeeping) = ₹4,542.72mn of goodwill sits on the consolidated balance sheet, and the FY26 statutory auditor (B S R & Co. LLP) named goodwill impairment a Key Audit Matter requiring judgement on revenue-growth, terminal-growth and WACC assumptions [`03_segment-map.md` §1, citing FY26 Annual Report, Independent Auditor's Report]. An impairment charge would land inside the "Depreciation, amortisation and impairment expense" line (Note 23's own title) and would hit EBITDA margin directly, not just EBIT — unlike most companies' impairment treatment. Not currently triggered; flagged as a risk, not a driver.

## 3. Gross Margin → EBITDA Margin → EBIT Margin Walk

No gross-margin concept exists for this business (no COGS line — see Section 2 preamble). The walk below uses the company's own audited "EBITDA Margin ratio" (Note 8-referenced, in the Ind AS-mandated ratio-disclosure note) as the primary figure, cross-checked against the CIQ-sourced figure already used in `01_historical-financials.md` §1 (a ~3bps gap exists between the two, consistent with the CIQ-internal reconciliation inconsistency already flagged in that report's footnote 7 — not a new gap introduced here).

| Margin Level | FY26 | FY25 | Change (bps) | Main Reason | Evidence |
|---|---:|---:|---:|---|---|
| EBITDA margin (company's own ratio, consolidated) | 33.78% | 37.66% | −388 | Other expenses ratio +301bps (Customer support + Advertisement dominant) and Employee benefits ratio +87bps (SBC-driven) | [FY26 Annual Report, Note 39(b)/Note 40(b) — "Ratios" note, EBITDA Margin ratio] |
| EBITDA margin (CIQ-sourced, consolidated — cross-check) | 33.18% | 37.03% | −385 | Same drivers; ~3bps gap vs company figure is a pre-existing CIQ-internal inconsistency, not newly introduced | [`01_historical-financials.md` §1, §2 footnote 7] |
| EBIT margin (consolidated) | 31.97% | 35.45% | −349 | Same EBITDA-level drivers, partially offset by a 56bps favorable D&A decline (Note 23) | [`01_historical-financials.md` §1] |

Pass-through lag: not applicable in the traditional input-cost sense (no commodity/raw-material input to pass through — `06_value-chain.md` §2). The nearest analog is customer-facing price realization on the Silver subscription tier, where management raised prices at the end of Q2 FY26 and, by Q4 FY26, attributed 1,000–1,500 of a ~3,000-supplier quarterly net-add shortfall directly to that price increase [`06_value-chain.md` §3, citing Q4 FY26 transcript] — pricing action shows up with roughly a 1–2 quarter lag in supplier churn/net-adds, not in the cost stack.

## 4. Margin Walk — Which Margin Level Matters Most?

EBITDA margin is the most useful level for this business. There is no gross margin to track (Section 3), D&A is small and mostly amortisation of the Busy Infotech/Livekeeping intangibles rather than a real economic charge on the core marketplace (asset-light, near-zero capex — ₹70mn FY26 per `01_historical-financials.md` §1), and Finance costs are structurally negligible (lease-only, Total Debt/EBITDA ~0.04x). EBITDA is also what management itself reports and discusses on every call ("Consolidated EBITDA was INR 146 crores for the quarter, representing margin of 35%" [Q1 FY27 transcript, prepared remarks, CFO Jitin Diwan]) — it is the number the company, not just this agent, treats as the operating profitability metric.

## 5. Margin Driver Table (consolidated)

| Driver | Impact on Margins | Direction | Magnitude | Evidence |
|---|---|---|---|---|
| Customer support / trust-&-verification cost buildout (KYC, OTP, buy-lead verification, agentic call handling) | Raises Other expenses ratio | Headwind | High (+191bps FY26; +168bps YoY again in Q1 FY27 — still running) | [FY26 Annual Report, Note 24; Q1 FY27 transcript, prepared remarks re: seller/buyer verification, agentic call center] |
| Buyer-acquisition digital marketing spend (Advertisement expenses) | Raises Other expenses ratio | Headwind, but decelerating | High in FY26 (+175bps); Low in Q1 FY27 (+19bps YoY — growth has slowed) | [FY26 Annual Report, Note 24; Q1 FY27/Q3 FY26 transcripts] |
| Outsourced sales cost (customer-acquisition spend) — currently pulled back | Currently a margin tailwind; reversible | Tailwind now / Headwind risk later | High (−56bps FY26; −86bps YoY in Q1 FY27) | [FY26 Annual Report, Note 24; Q1 FY27 transcript, CFO: "Margins continue to be elevated on account of savings arising from lower customer acquisition"] |
| Stock-based compensation (SBC) | Raises Employee benefits ratio | Headwind, decelerating | Mid (+98bps FY26; SBC grew only +1.9% YoY in Q1 FY27 vs +95% for FY26, a sharp deceleration) | [FY26 Annual Report, Note 21/28; Q1 FY27 interim filing, Note 21] |
| Base payroll (salaries/bonus) operating leverage | Lowers Employee benefits ratio | Tailwind | Low-Mid (−20bps FY26, standalone G&A leverage −60bps) | [FY26 Annual Report, Note 21; Note 34] |
| Segment mix shift (Accounting Software Services growing share while still loss-making) | Drags consolidated blend even as the segment's own losses narrow | Headwind | Mid (−122bps FY26, shift-share decomposition — see Section 7a) | [FY26 Annual Report, Note 32] |
| One-off New Labour Codes provision (Ind AS 19 gratuity/leave re-measurement) | Raised Employee benefits ratio, non-recurring | Headwind, one-off | Low (≈+55bps at consolidated-revenue basis; will not repeat unless further Codes rules are notified) | [FY26 Annual Report, Note 38 (standalone)] |
| Silver-tier pricing/churn dynamics | Indirect — interacts with the acquisition-spend decision, not a direct cost line | Headwind (revenue-side, cross-referenced) | Not scored here — see `02_revenue-drivers` | [`06_value-chain.md` §3] |
| AI/automation of customer servicing (agentic voice call center) | Uncertain — early cost gains being redeployed into verification depth rather than banked as savings | Unknown | Low-Mid, Unknown confidence | [Q1 FY27 transcript, Q&A: "we may or may not gain much on the cost side"] |
| Goodwill impairment risk (Busy Infotech/Livekeeping, Key Audit Matter) | Would hit D&A/impairment line directly if triggered | Tail risk, not a current driver | Potentially High if triggered (₹4,542.72mn goodwill), currently Unknown probability | [`03_segment-map.md` §1] |

Magnitude bands: High >100bps, Mid 30–100bps, Low <30bps, applied to the consolidated EBITDA margin.

## 6. Margin Drivers By Segment

### Segment: Web and related Services (91.96% of FY26 revenue)

Segment margin fell from 40.50% (FY25) to 36.93% (FY26), a −357bps decline [FY26 Annual Report, Note 32]. Because the standalone entity is, for practical purposes, this segment (standalone revenue ₹14,428.03mn vs segment revenue ₹14,429.94mn — a ₹1.91mn gap, immaterial), the standalone functional P&L (Note 34) is used as the driver breakdown, and it reconciles almost exactly to the standalone entity's own −283.7bps EBITDA-margin change (a smaller number than the segment's raw −357bps, because Note 32's segment scope and Note 34's standalone-entity scope are not identical bases — both are audited but drawn from different notes; the gap is flagged, not resolved, per the Driver Attribution rule).

| Driver | Impact | Direction | Magnitude | Evidence |
|---|---|---|---|---|
| Marketing Expenses (digital buyer-acquisition ads) | +166.5bps of standalone EBITDA-margin change | Headwind | High | [FY26 Annual Report, Note 34] |
| Customer service cost (incl. RFQ/buy-lead verification) | +82.1bps | Headwind | High | [FY26 Annual Report, Note 34] |
| Selling & Distribution Expenses | +51.9bps | Headwind | Mid | [FY26 Annual Report, Note 34] |
| Technology and Content Expenses | +42.7bps | Headwind | Mid | [FY26 Annual Report, Note 34] |
| General and Administrative Expenses | −59.5bps | Tailwind (leverage) | Mid | [FY26 Annual Report, Note 34] |

### Segment: Accounting Software Services (8.04% of FY26 revenue — Busy Infotech + Livekeeping)

Segment result improved from a loss of ₹(119.16)mn (−17.47% margin) in FY25 to a loss of ₹(28.15)mn (−2.23% margin) in FY26 on revenue that nearly doubled (₹681.91mn → ₹1,261.04mn, +84.9%) [FY26 Annual Report, Note 32]. This is a genuine, quantifiable margin tailwind at the segment level — driven by billing/license growth (Busy billed ~₹59 crore in Q1 FY27 vs ~₹10 crore a year earlier per management commentary [`03_segment-map.md` §1, citing Q1 FY27 transcript]) scaling faster than the segment's cost base, plus the recent "Busy Magic" product relaunch. But because the segment is still loss-making and its revenue share nearly doubled (4.91% → 8.04% of consolidated revenue), its growing weight in the blend is a net drag on the CONSOLIDATED margin even as its own trajectory improves — this is the mix effect quantified in Section 7a. Segment-level cost-line detail (employee cost vs other cost split) is not disclosed at this granularity; the improvement is described only at the segment-result level.

## 7. Margin Bridge — Latest Period (FY26 vs FY25, consolidated)

This bridge uses the two audited P&L expense lines directly (Employee benefits, Other expenses) — there is no COGS to decompose into volume/price/input-cost/mix/FX in the traditional sense, so those template categories are populated only where a genuine, evidence-backed analog exists; categories with no applicable analog are marked N/A rather than forced. All figures computed and verified via an executed Python snippet (Bash) from Notes 21, 22, 23, 24, 34, 38.

| Component | Margin Impact (bps) | Evidence |
|---|---:|---|
| Volume / operating leverage (base payroll: salaries, PF, staff welfare — ex-SBC, ex-one-off) | −66.3 (favorable) | [FY26 Annual Report, Note 21] — see Section 7a for the derivation |
| Price | N/A — no cost-side pass-through mechanism exists (no COGS; `06_value-chain.md` §2) | — |
| Input costs (stock-based compensation) | +98.4 | [FY26 Annual Report, Note 21/28] |
| Mix (segment-weight shift toward the still-loss-making Accounting Software Services segment) | −122.4 (memo item — different basis, see caveat below; NOT summed into Total) | [FY26 Annual Report, Note 32] |
| FX | N/A — 99.6% India revenue, unhedged FX exposure stated "not material" [`10_external-dependency.md`] | — |
| One-offs (New Labour Codes provision, Ind AS 19 re-measurement) | +54.7 | [FY26 Annual Report, Note 38 (standalone)] |
| Other (Customer support/verification ramp + Advertisement ramp, net of Outsourced-sales/Content-development pullback and other smaller Other-expense items) | +300.7 | [FY26 Annual Report, Note 24] — full sub-line breakdown in Section 2 and 7a |
| **Total margin change (sum of Volume/opleverage + Input costs + One-offs + Other; excludes the Mix memo line)** | **−387.5** | Reconciles to the company's own −388bps EBITDA-margin-ratio change (Note 8) to within 0.5bps |

**Mix-line caveat:** the −122.4bps Mix figure is measured on a segment-revenue-weight basis (Note 32), a different basis from the P&L-line-ratio basis (Notes 21/24) used for every other row in this table. It is shown as a complementary cross-check (Section 7a), not summed into the Total, to avoid double-counting the Accounting Software Services segment's costs (which are already embedded inside the consolidated Employee-benefits and Other-expenses totals used above). Applying a segment-weight-shift figure inside a P&L-line-ratio total would be exactly the basis-mismatch error the Driver Attribution rule prohibits.

## 7a. Bridge Attribution and Residual (MODULE_RULES "Driver Attribution" / §15)

```
Volume/opleverage (base payroll): Employee benefits total ratio change (+86.8bps) minus SBC (+98.4bps)
  minus the one-off Labour Code provision (+54.7bps) = −66.3bps
  Basis: consolidated revenue (₹15,690.42mn FY26 / ₹13,883.44mn FY25), Note 21 sub-lines
  → Asserted directly from disclosed sub-line ratios, not a modelled sensitivity — arithmetic shown above

Input costs (SBC): SBC expense ₹366.20mn (FY26) vs ₹187.44mn (FY25) → ratio 2.33% vs 1.35%
  = +98.4bps of the −387.5bps total observed change (≈25.4% of the total)
  Basis: consolidated revenue, Note 21/28 → basis matches (same revenue denominator as the Total row)

One-offs (Labour Code provision): ₹85.79mn one-time provision (standalone-disclosed, Note 38) ÷
  consolidated FY26 revenue ₹15,690.42mn = 0.5468% = +54.7bps of the −387.5bps total (≈14.1%)
  Basis caveat: the ₹85.79mn is a STANDALONE-only disclosed figure (Note 38 sits in the standalone
  financial statements, not the consolidated notes); it is applied here against the CONSOLIDATED revenue
  base as an approximation, since a consolidated-only equivalent figure is not separately disclosed. This
  slightly understates the true bps impact if Busy Infotech/Livekeeping had their own, undisclosed Labour
  Code provisions — flagged, not resolved. → basis partially mismatched, applied as the best available
  approximation, not silently as an exact consolidated figure.

Other (Customer support + Advertisement, net of pullback lines): Other expenses total ratio change
  +300.7bps = +190.9bps (Customer support) + 175.3bps (Advertisement) + 38.9bps (Internet/online) +
  18.5bps (Rent) + 16.9bps (Legal) + smaller net items, minus 55.9bps (Outsourced sales, favorable) minus
  40.6bps (Content development, favorable) minus 27.2bps (Buyer engagement, favorable) minus 17.1bps
  (FY25 one-off investment impairment that did not recur, favorable base effect) minus other small
  favorable items = +300.7bps of the −387.5bps total (≈77.6% of the total)
  Basis: consolidated revenue, Note 24 full sub-line breakdown (21 line items, individually computed and
  verified — see Section 2 table and the underlying calculation) → basis matches, fully reconciled to the
  audited Note 24 total (₹3,461.76mn FY26 / ₹2,645.66mn FY25) to the rupee.

Mix (segment-weight shift): (Web-segment revenue weight FY26 91.96% − FY25 95.09%) × Web-segment
  FY26 margin 36.93% + (AcctSW weight FY26 8.04% − FY25 4.91%) × AcctSW FY26 margin (−2.23%) = −122.4bps
  Basis: Note 32 segment revenue/result, a DIFFERENT basis (segment-weight decomposition) than the
  Notes 21/24 P&L-line-ratio basis used elsewhere in this bridge → NOT applied to the Total row; shown as
  a memo/cross-check only, per the caveat in Section 7.

Reconciliation: sum of Total-row components (−66.3 + 98.4 + 54.7 + 300.7 = 387.5bps of cost-ratio
increase) = −387.5bps margin change, vs the company's own audited EBITDA-margin-ratio change of
−388bps (Note 8) → **387.5bps reconciled, ~0.5bps residual** (rounding only; not a material unexplained
gap). The Mix line (−122.4bps) is a complementary, different-basis decomposition of the SAME total
(reconciled separately in Section 7a's segment shift-share calc to −387.2bps, matching within 0.3bps of
the Note 8 figure) — it is not additive with the P&L-line components above.
```

Given the reconciliation above clears essentially the full amount (99.9%+), Section 8's single-biggest-driver claim below rests on arithmetic that is fully, not partially, explained.

## 8. The Single Biggest Margin Driver

Looking forward — the question this report exists to answer — the single biggest margin driver is **management's own choice on customer-acquisition spend** (Outsourced sales cost + the digital marketing budget), not a market or input-cost force outside the company's control. The evidence: FY26's margin compression was driven roughly 78% by the Other-expenses line (Section 7a), inside which Customer support (+191bps) and Advertisement (+175bps) were the two largest single items — both discretionary. Then, in Q1 FY27, management explicitly reversed course on part of that spend: the CFO stated "margins continue to be elevated on account of savings arising from lower customer acquisition and operating leverage" [Q1 FY27 transcript, prepared remarks], and the numbers confirm it — Outsourced sales cost fell −86bps YoY in the quarter (vs −56bps for the full FY26 year, i.e., the pullback accelerated), while Customer support (+168bps) and Internet/online costs (+118bps) kept rising, meaning the pullback was selective, not a broad-based cost cut. Management has also stated it is deliberately not "pressing the growth pedal" on supplier acquisition for "2, 3 more quarters" while it works through Silver-tier churn [`04_guidance-consensus.md` §2, citing Q1 FY27 transcript]. This makes the current Q1 FY27 margin level (35.35% EBITDA margin) a policy choice, not a new run-rate: the direction today is favorable (margin expanding QoQ off the FY26 trough), but the single biggest reversal risk is management resuming the outsourced-sales/marketing spend it has throttled — a budgeted ~₹10 crore/quarter digital-marketing spend was cited on the Q3 FY26 call as the target run-rate, above where actual spend has been running [Q3 FY26 transcript, Q&A].

## 9. Investment Spend — Both Signs

Capex itself is trivial for this business (₹70mn FY26, declining YoY [`01_historical-financials.md` §1]) and shows no wave to evaluate. The relevant "spend running well above its own history" is discretionary OPEX: Advertisement expenses grew +499% YoY in FY26 (₹56.64mn → ₹339.13mn, standalone Marketing Expenses +320% to ₹324.58mn [FY26 Annual Report, Note 24/34]). Both signs are stated below, rather than reading this only as a cost.

| Reading | What it would show | Evidence here |
|---|---|---|
| Spend as a future COST | A discretionary opex ramp that drags EBITDA margin now, with no committed offsetting revenue | Advertisement expenses added +175bps of margin drag in FY26 alone (Section 2/7a); management's own framing on the Q3 FY26 call describes a target run-rate of "₹10 crore" per quarter, well above where actual spend has landed most quarters, i.e. an intended further ramp, not a one-off [Q3 FY26 transcript, Q&A] |
| Spend as a DEMAND signal | Evidence that the spend is buying a real, monetizable outcome — a growing, more valuable buyer base that would eventually lift ARPU/leads | Management explicitly ties the ad spend to "shifted the buyer base... to the more higher ARPU buyers... the categories where we are able to monetize" [Q1 FY27 transcript, Q&A, CEO Dinesh Agarwal]; Deferred Revenue (the closest RPO analog) grew faster than recognised revenue in FY26 (+14% standalone vs +9% recognised revenue [`02_business-identity.md` §4]), a genuine leading indicator, though not one specifically tied to this ad spend |

**Current read: the evidence favours the COST reading, not yet the demand reading.** The volume metric management itself uses to judge the buyer-acquisition funnel — unique business inquiries — has been flat to declining through the exact period of the ad-spend ramp: 29mn (Q1 FY26) → 31mn (Q2 FY26) → 28mn (Q3 FY26) → ~27mn, described by management as a 1% decline (Q4 FY26) → 26mn (Q1 FY27) [Q1–Q4 FY26 and Q1 FY27 transcripts, prepared remarks]. An analyst asked management directly on the Q4 FY26 call: "despite of us investing so much on performance marketing, why this number is not inching up?" [Q4 FY26 transcript, Q&A] — management's answer pointed to mix/quality effects (shifting spend toward higher-ARPU categories) rather than disputing the flat volume trend. The observable that would flip this read: a sustained rise in unique business inquiries and/or in paying-supplier net-additions attributable to the higher-ARPU categories the ad spend targets — not yet visible across the four quarters of data available in this pool. Until that shows up, the ad-spend ramp reads as a margin cost with an unproven payoff, not a demand signal comparable to a backlog or bookings figure.

## Cycle-Position Read (Cyclicality — MODULE_RULES Hard Rule)

`10_external-dependency.md` flags "Consumer/SME cycle" and "Geopolitics" as High-dependency rows for this business, so a cycle-position statement is required. Consolidated EBITDA margin over the last five fiscal years ran 39.43% (FY22, described in `01_historical-financials.md` as "a pandemic-era high") → 26.57% (FY23, trough — a deliberate cost build-out) → 26.54% (FY24, trough continued) → 37.03% (FY25, a snapback close to the FY22 peak) → 33.18% (FY26, mid-range) [`01_historical-financials.md` §1]. The latest reported quarter (Q1 FY27, 35.35%) sits in the mid-to-upper part of this five-year band — above the FY23/FY24 trough and above FY26's full-year average, but below both the FY22 pandemic-era high and the FY25 peak. This is explicitly **not a normalised run-rate**: management's own words describe the current level as "elevated" because of a deliberate, temporary pullback in customer-acquisition spend while Silver-tier churn is being addressed (Section 8) — a policy choice that management has said will persist for roughly "2, 3" more quarters, not a structural cost improvement, and one that reverses the moment outsourced-sales/marketing spend resumes toward its stated ~₹10 crore/quarter target.
