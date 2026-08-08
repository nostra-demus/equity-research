# Margin Drivers — UBER

Reporting standard: US GAAP. Reporting currency: USD (millions). Fiscal year end: December 31. All dollar and percentage figures below are transcribed from the FY2025 10-K (filed Feb-13-2026), the Q1 FY2026 10-Q (filed May-06-2026), and the Q2 FY2026 10-Q (filed Aug-05-2026), unless otherwise cited. Basis-point (bps) math is shown inline where a ratio is derived rather than directly disclosed.

## 1. Segment Decomposition Status

`business-model/03_segment-map.md` is available and is used throughout this report. Uber is **not** a single-segment business under the module's >85% threshold: Mobility is 57.0% of FY2025 revenue and 69.1% of FY2025 total segment profit ($7,899M of $11,438M segment Adjusted EBITDA), Delivery is 33.2% of revenue / 31.2% of profit, and Freight is 9.8% of revenue / a small loss (-0.3% of segment profit) [FY25 10-K, Note 13, p.114]. Segment-level profit IS disclosed (not just revenue), so full segment decomposition is possible below.

Two disclosure-quality caveats carry into this report:
- **Segment profit-measure change (comparability break).** Beginning Q1 FY2026, Uber switched its segment operating-performance measure from "Segment Adjusted EBITDA" to "Segment Operating Income" and recast the FY2025 comparable prior-year period on the new basis [Q2 FY26 10-Q, Note 10]. The two measures are not identical (Segment Operating Income includes D&A and other items Adjusted EBITDA excluded), so this report does NOT compare FY2025 segment Adjusted EBITDA margins directly against FY2026 Segment Operating Income margins. All FY2026 segment margin figures below use the recast, comparable Q2'25-vs-Q2'26 Segment Operating Income basis disclosed in the Q2 FY26 10-Q.
- **Consolidated non-GAAP profitability disclosure gap.** FY2025's $8,730M Adjusted EBITDA [FY25 10-K, "Adjusted EBITDA reconciliation" table] is the last disclosed consolidated non-GAAP profitability figure in this data pool. The term "EBITDA" does not appear anywhere in the Q1 or Q2 FY2026 10-Qs or transcripts outside the one segment-methodology sentence [Q1 FY26 10-Q; Q2 FY26 10-Q; Q1 FY26 and Q2 FY26 earnings calls — confirmed absent]. This has a direct consequence for Section 4 below: GAAP operating income (EBIT) margin, not Adjusted EBITDA margin, is now the only consistently disclosed consolidated profitability metric across the FY2025→FY2026 comparison window.

## 2. Sector Overlay

Per `business-model/02_business-identity.md` §3a: *"No row in `frameworks/SECTOR_OVERLAYS.md` matches an on-demand, multi-sided mobility/delivery/freight marketplace platform... No sector overlay for two-sided on-demand mobility/delivery/freight marketplace platform — generic read."* This agent independently re-checked `frameworks/SECTOR_OVERLAYS.md` and found no matching row (not a bank, REIT, SaaS, miner, insurer, E&P, retailer, telecom, asset manager, or pharma). **No sector overlay for UBER — the generic operating-company cost stack applies below, refined by the platform-specific Gross Bookings / take-rate grammar Uber itself discloses** (Revenue = Gross Bookings × take rate for Mobility/Delivery; Revenue ≈ Gross Bookings for Freight, which books on a principal basis) [`business-model/02_business-identity.md` §2].

## 3. Cost Stack

FY2025 vs FY2024, GAAP lines exactly as reported in the 10-K MD&A [FY25 10-K, Item 7, "Results of Operations"]. Percentage-of-revenue columns are the company's own disclosed rounding; the bps-change column is this agent's own precise calculation shown for verification.

| Cost Line | FY2024 ($M / % of rev) | FY2025 ($M / % of rev) | $ Change | Precise bps Change | Direction | Evidence | Margin Risk |
|---|---:|---:|---:|---:|---|---|---|
| Cost of revenue, excl. D&A | $26,651M / 61% | $31,338M / 60% | +$4,684M (+18%) | −35bps (margin-favorable) | Tailwind (mild) | +$1.6bn Driver payments/incentives, +$1.6bn Courier payments/incentives (both scaling with Gross Bookings), +$851M insurance expense "primarily due to an increase in insurance rate per mile and miles driven in our Mobility business" [FY25 10-K, Item 7] | High — this is 60% of revenue, by far the largest cost line; a swing in driver-incentive intensity moves margin more than any other single line |
| Operations and support | $2,732M / 6% | $2,854M / 5% | +$122M (+4%) | −73bps | Tailwind | +$138M headcount costs, partially offset by −$30M contractor expense [FY25 10-K, Item 7] | Low |
| Sales and marketing | $4,337M / 10% | $4,898M / 9% | +$561M (+13%) | −45bps | Tailwind | +$221M indirect advertising/marketing, +$207M consumer discounts/promotions/credits/refunds, +$129M headcount [FY25 10-K, Item 7] | Mid |
| Research and development | $3,109M / 7% | $3,402M / 7% | +$293M (+9%) | −53bps | Tailwind | +$313M headcount costs [FY25 10-K, Item 7] | Low |
| General and administrative | $3,639M / 8% | $3,241M / 6% | −$398M (−11%) | −204bps | Tailwind, but flagged as a lumpy, non-repeatable one-off (see §7a) | −$549M decrease in legal-related accruals and expenses, partially offset by +$65M headcount and +$47M other corporate expenses [FY25 10-K, Item 7] | High — this is the single largest FY2025 margin-driver line, and it reversed direction the very next quarter (see §7) |
| Depreciation and amortization | $711M / 2% | $719M / 1% | +$8M (+1%) | −24bps | Neutral ("not material" per company) | "The change in depreciation and amortization expenses was not material." [FY25 10-K, Item 7] | Low today; rises if AV vehicle fleet/infrastructure investment is capitalized (see §9) |
| Interest expense | Not decomposed | Not decomposed | — | — | — | Below the operating-income (EBIT) line — out of scope for a gross/EBITDA/EBIT margin-drivers report. See `01_historical-financials.md` §3 for how below-the-line items (equity-stake mark-to-market, one-off tax items) drive large GAAP EPS swings unrelated to operating margin. | n/a |

Sum of the six operating-line bps changes above = −434bps (i.e., total operating costs fell 434bps as a share of revenue). This reconciles to the stated FY2025 EBIT margin change of +430bps (`01_historical-financials.md` §1) within 4bps — full reconciliation, no meaningful residual.

## 4. Gross Margin → EBITDA Margin → EBIT Margin Walk

| Margin Level | FY2024 | FY2025 | Change (bps) | Main Reason | Evidence |
|---|---:|---:|---:|---|---|
| Gross margin (CIQ-standardized: Revenue − [Cost of revenue + Operations and support]) | 37.5% | 38.5% | +99bps | Cost-of-revenue leverage (−35bps) plus Operations and support leverage (−73bps); flagged in `01_historical-financials` §1/§3 as a "Volatile" line because of a CIQ Q4-classification artifact — treat the annual figure, not any single quarter, as reliable | `01_historical-financials.md` §1 |
| EBITDA margin (GAAP operating income + D&A, NOT the company's own "Adjusted EBITDA") | 8.0% | 12.1% | +409bps | Broad-based operating leverage across every cost line (§3) | `01_historical-financials.md` §1 |
| EBIT margin (GAAP Income from operations) | 6.4% | 10.7% | +430bps | Same as above, plus the D&A line itself | `01_historical-financials.md` §1; reconciled independently in §3 above |

**Pass-through lag.** `business-model/06_value-chain.md` §2 finds no automatic cost-escalator or indexed-pricing clause: Uber resets its algorithmic fare/fee schedule at its own discretion. The clearest evidence of an actual lag comes from the insurance-cost cycle: Mobility insurance expense rose $851M in FY2025 as "insurance rate per mile" rose [FY25 10-K, Item 7], and management chose NOT to pass this straight through to riders; instead, when March-2026 insurance renewals delivered savings, CFO Krishnamurthy said Uber's "philosophy has been to return that goodness back to the market" via fare cuts in Los Angeles and San Francisco, which "translate[d] to acceleration in trip growth" within the same reporting quarter [Q1 FY26 earnings call, Q&A]. **Pass-through, when it happens, runs same-quarter-to-next-quarter and in the DIRECTION of buying volume (price cuts), not extracting margin (price increases)** — this is the opposite of a typical manufacturer's cost pass-through and is central to how Uber actually uses cost tailwinds (see §5, driver 3).

## 5. Margin Walk — Which Margin Level Matters Most?

**GAAP operating income (EBIT) margin, at both consolidated and segment level, is the most useful metric for Uber going forward — not Adjusted EBITDA.** Three reasons. First, Uber itself stopped disclosing a consolidated non-GAAP Adjusted EBITDA reconciliation after FY2025 (§1) — there is no FY2026 apples-to-apples Adjusted EBITDA figure to track even if an analyst wanted one. Second, the company's own new segment metric is "Segment Operating Income," an EBIT-level measure, not an EBITDA-level one [Q2 FY26 10-Q, Note 10] — management itself has moved the goalposts to EBIT. Third, D&A is a small, non-material swing factor for Uber (1–2% of revenue, §3) precisely because it is an asset-light marketplace that owns no vehicles or trucks (`business-model/06_value-chain.md` §1) — the EBITDA-vs-EBIT gap that matters enormously for a capital-intensive manufacturer barely matters here. Gross margin is a secondary, supporting read only: it is distorted by a known CIQ Q4-classification artifact (`01_historical-financials.md` §3) and is not itself a GAAP-disclosed line (Uber discloses cost of revenue and operating expenses separately, not a "gross profit" subtotal).

## 6. Margin Driver Table (Consolidated)

| Driver | Impact on Margins | Direction | Magnitude | Evidence |
|---|---|---|---|---|
| Driver/Courier/Carrier variable payments (cost of revenue) | Largest cost line (55–61% of revenue); scales with Gross Bookings growth but is also where genuine cost discipline shows up | Tailwind (currently — genuine ex-reclassification improvement of ~377bps in Q2'26, see §7a) | High | [FY25 10-K, Item 7; Q2 FY26 10-Q, MD&A Cost of Revenue] |
| Mobility insurance costs | Rose $851M in FY2025 (headwind); March-2026 renewals delivered "hundreds of millions" in savings, but management reinvests the savings into fare cuts rather than banking them as margin | Neutral-to-Tailwind on margin (the cost relief is being spent on volume, not kept as profit) | High on the cost line itself; Low-to-Mid on realized margin because it is given back | [FY25 10-K, Item 7; Q1 FY26 earnings call, Q&A] |
| G&A / legal-accrual swings | A single line item (legal-related accruals) improved FY2025 G&A by ~106bps of the 204bps total G&A leverage, then worsened Q2 FY26 G&A by 97bps of the 130bps deterioration — same line, opposite direction, two periods in a row | Unknown / volatile (genuinely two-way, not a repeatable trend) | High — the single most unpredictable swing item in the cost stack | [FY25 10-K, Item 7; Q2 FY26 10-Q, MD&A G&A — see §7a derivation] |
| UK Mobility revenue/cost reclassification | Cuts both revenue (−$1.1bn in Q2'26 alone) and cost of revenue (−$808M Driver payments) together; CFO calls it "an optical impact" | Distorting, not a real margin driver — Unknown net effect on reported ratios depending on which ratio is read | High on reported optics; effectively zero on underlying cash economics | [Q2 FY26 10-Q, MD&A; Q2 FY26 earnings call, CFO Q&A] |
| Segment mix (Delivery revenue share rising, Mobility share falling) | Delivery's revenue share rose from 33.2% (FY2025) to 37.0% (Q2 FY26); Delivery's take rate (~19%) is structurally lower than Mobility's (~30%) | Headwind on blended take rate, but NOT a headwind on blended EBIT margin — Delivery's Segment Operating Income grew faster (+38% Q2'26 YoY) than its revenue (+28%), i.e. margin in the mix-shifting segment is itself expanding | Mid | [`business-model/03_segment-map.md` §1; `business-model/02_business-identity.md` §4; Q2 FY26 10-Q, MD&A Segment Results] |
| SG&A headcount discipline / AI productivity | CFO: "a track record of being disciplined on headcount addition," "a doubling in the code output per engineer," and "surgically... cut headcount by about 10% to 20%" in select organizations during Q2 FY26 | Tailwind (early-stage, modest — CFO calls the savings "modest in the grand scheme of things") | Low-to-Mid today; could become Mid-to-High if AI productivity claims compound | [Q2 FY26 earnings call, Q&A] |
| Driver-classification / labor-regulation risk | Not currently in the numbers; a reclassification ruling in a major market would force Uber to "incur significant additional expenses" for wages, benefits, and taxes | Headwind risk (contingent, not current) | High if triggered, currently Low probability of near-term realization based on disclosed litigation status | [`business-model/10_external-dependency.md` §1, §5; FY25 10-K, Item 1A] |
| Freight segment cyclicality | FY2025 Gross Bookings −1% (constant currency) on a "challenging freight market cycle"; Q2 FY26 Freight revenue +26% and Gross Bookings +25% (constant currency) — signs of a cyclical turn | Currently a small headwind (Freight Segment Operating Loss persists at ~−1.5% to −2% of segment revenue) but Direction is improving | Low at consolidated level (Freight is 9.8–11.2% of revenue and near-breakeven) | [`business-model/03_segment-map.md` §1; Q2 FY26 10-Q, MD&A Freight Segment] |
| Uber One subscription mix | 46 million members at FY2025 year-end; subscription fees "add to Revenue Margin without adding to Gross Bookings volume" | Tailwind (directionally, high-margin recurring revenue) | Not independently quantified in filings — Not proven from available data at what bps this specifically contributes | [`business-model/02_business-identity.md` §1, §2] |
| AV / autonomous-vehicle investment | $10bn of multiyear AV investment disclosed on the Q2 FY26 call; not yet flowing through GAAP capex (TTM capex is only $308M, `01_historical-financials.md` §2) | Unknown — see §9 for the full both-signs treatment | Currently Low P&L impact (CFO: "there will be a P&L impact, and we'll size that for investors clearly as we go" — i.e., not yet landed); potentially High once it lands | [Q2 FY26 earnings call, Q&A] |

## 7. Margin Drivers By Segment

### Segment: Mobility (57.0% of FY2025 revenue, 51.9% of Q2 FY26 revenue)

| Driver | Impact | Direction | Magnitude | Evidence |
|---|---|---|---|---|
| Driver payments/incentives | Fell $813M YoY in Q2 FY26 Segment Operating Income build, but $808M of that decrease is the UK reclassification, not underlying cost discipline (see §7a) | Mixed — mostly optical this quarter | High | [Q2 FY26 10-Q, MD&A Mobility Segment] |
| Insurance rate per mile | +$851M FY2025 headwind, turning to savings from March-2026 renewals, but savings are being reinvested into fare cuts in California, not kept as margin | Neutral-to-Tailwind on realized margin | High on the cost line; Low-Mid on margin (given back) | [FY25 10-K, Item 7; Q1 FY26 earnings call] |
| Revenue take rate (Revenue ÷ Gross Bookings) | CFO: "nearly 500 basis points decline year-on-year. Of that 500 basis points, about 400 basis points is entirely related to this U.K. business model change, and it's an optical impact... And other than that, it's really deliberate investments... largely a function of some investments in our lower-cost offerings" (Moto in Brazil) | Headwind — ~100bps of genuine, deliberate take-rate compression (a strategic choice, not a competitive loss), separate from the ~400bps optical UK effect | Mid (genuine portion); High (optical portion, but not real) | [Q2 FY26 earnings call, CFO Q&A] — **Note: this take-rate figure is measured on Revenue ÷ Gross Bookings, a different base than the Segment Operating Income margin figures elsewhere in this table (Segment Operating Income ÷ Revenue); the two are not combined to avoid a basis mismatch (see §7a).** |
| Segment Operating Income margin (Segment Operating Income ÷ Mobility revenue) | Q2'25: $1,729M / $7,288M = 23.72%. Q2'26: $2,215M / $7,363M = 30.08%. Change = +636bps | Tailwind, but see §7a for how much of this is genuine vs. UK-reclassification-driven | High | Computed from [Q2 FY26 10-Q, MD&A Segment Results, Note 10] |
| Segment Operating Income margin, ex-Gross-Bookings basis (CFO's preferred lens) | CFO cites Mobility "operating income margin remains very strong at 7.6%" measured against Gross Bookings, not revenue — a materially different denominator that is unaffected by the UK revenue reclassification | Informational — management's own preferred, reclassification-immune metric | High relevance for tracking real margin through further accounting changes | [Q2 FY26 earnings call, CFO Q&A] |
| Airport/large-metro concentration; driver-classification regulation | ~15% of FY2025 Mobility Gross Bookings from airport trips; NYC and Washington State minimum-pay rules already bind | Headwind risk, not currently realized in the numbers | Mid | [`business-model/03_segment-map.md` §1] |

### Segment: Delivery (33.2% of FY2025 revenue, 37.0% of Q2 FY26 revenue)

| Driver | Impact | Direction | Magnitude | Evidence |
|---|---|---|---|---|
| Courier payments/incentives | +$545M YoY in Q2 FY26, scaling with a 26% Delivery Gross Bookings increase | Neutral (proportionate to growth, not a leverage story on its own) | High (largest Delivery cost line) | [Q2 FY26 10-Q, MD&A Delivery Segment] |
| Advertising revenue growth | +$182M YoY in Q2 FY26 — high-margin revenue that grows without a matching Gross-Bookings increase | Tailwind | Mid | [Q2 FY26 10-Q, MD&A Delivery Segment] |
| Segment Operating Income growth vs. revenue growth | Segment Operating Income +38% ($766M→$1,055M) vs. revenue +28% in Q2 FY26 — margin expanding, not just scaling | Tailwind | Mid-High | [Q2 FY26 10-Q, MD&A Delivery Segment] |
| Revenue take rate | CFO: Delivery's "revenue margin... is largely stable" — unlike Mobility, no material take-rate compression | Neutral | Low | [Q2 FY26 earnings call, CFO Q&A] |
| Merchant concentration | "A significant amount of our Delivery Gross Bookings come from a limited number of large restaurant groups and other merchants" | Headwind risk, not currently realized | Low-Mid | [`business-model/03_segment-map.md` §1; FY25 10-K, Item 1A] |

### Segment: Freight (9.8% of FY2025 revenue, 11.2% of Q2 FY26 revenue)

| Driver | Impact | Direction | Magnitude | Evidence |
|---|---|---|---|---|
| Industrial/freight-rate cycle | FY2025 Gross Bookings −1% (constant currency) on a "challenging freight market cycle"; Q2 FY26 Gross Bookings +25% (constant currency), revenue +26% — a cyclical turn, tentative | Was Headwind (FY2025); now Tailwind (Q2 FY26) — see Cycle-Position note below | Low at consolidated level (9.8–11.2% of revenue); High within the segment itself | [`business-model/03_segment-map.md` §1; Q2 FY26 10-Q, MD&A Freight Segment] |
| Carrier payments | +$320M YoY in Q2 FY26, tracking the Gross Bookings recovery | Headwind on segment profit dollars, proportionate to the revenue recovery | Low at consolidated level | [Q2 FY26 10-Q, MD&A Freight Segment] |
| Segment Operating Loss | −$26M (Q2'25) → −$24M (Q2'26), a modest 8% improvement; still a loss | Mild tailwind, still negative | Low | [Q2 FY26 10-Q, MD&A Freight Segment] |

**Cycle-Position Rule note (Freight).** Freight is the one segment with clear cyclicality evidence in this pool. FY2025 sat in what management itself called a "challenging freight market cycle" (Gross Bookings −1% CC) [FY25 10-K, MD&A] — closer to a cyclical trough than a mid-cycle reading, given the segment had never posted a positive Adjusted EBITDA margin in any disclosed year (`business-model/03_segment-map.md` §1). Q2 FY26's +25% CC Gross Bookings growth and a narrowing Segment Operating Loss are the first hard evidence of a turn, but one quarter of data is not proof of a durable freight-cycle recovery — the reader should not treat Q2 FY26's Freight growth rate as a new run-rate. Mobility and Delivery show no comparable cyclical peak/trough evidence; both have grown Gross Bookings above 20% (constant currency) for four consecutive quarters [`earnings/04_guidance-consensus.md` §6], which reads as steady expansion, not a cycle extreme, based on the evidence available in this pool.

## 8. Margin Bridge — Latest Period (Q2 FY26 vs. Q2 FY25)

Consolidated EBIT margin (GAAP Income from operations ÷ revenue): Q2'25 = $1,450M / $12,651M = 11.46%. Q2'26 = $1,890M / $14,191M = 13.32%. **Total margin change = +186bps.** [Q2 FY26 10-Q, Condensed Consolidated Statements of Operations]

| Component | Margin Impact (bps) | Evidence |
|---|---:|---|
| Cost of revenue — genuine improvement (ex-UK-reclassification) | +377 | [Q2 FY26 10-Q, MD&A Cost of Revenue] — see §7a for the derivation |
| Cost of revenue — UK reclassification (optical, one-off) | +132 | [Q2 FY26 10-Q, MD&A; Q2 FY26 earnings call, CFO Q&A] — see §7a |
| G&A — legal-accrual swing (one-off) | −97 | [Q2 FY26 10-Q, MD&A G&A] — see §7a |
| SG&A ex-one-off (Operations & support + Sales & marketing + R&D + G&A-ex-legal: headcount/AI investment, marketing spend, consumer discounts, credit-card processing) | −232 | [Q2 FY26 10-Q, MD&A, each expense-line table] |
| Depreciation and amortization | +6 | [Q2 FY26 10-Q, MD&A D&A] |
| Price / take-rate effect (Mobility, ex-UK) | Not integrated into this bps table — see basis-mismatch note below | [Q2 FY26 earnings call, CFO Q&A] |
| Segment mix (Delivery share rising) | Not separately quantified in EBIT-margin bps terms from current disclosure | [`business-model/03_segment-map.md` §1] |
| FX | Not quantified for cost ratios; disclosed only for Gross Bookings/revenue growth rates (+2pp / +1pp tailwind respectively, a different base — see basis-mismatch note) | [`business-model/10_external-dependency.md` §2] |
| **Total margin change** | **+186** | Computed directly from GAAP Income from operations, both periods |

**Basis-mismatch note (required by CLAUDE.md §15 / MODULE_RULES "Driver Attribution"):** the CFO's ~100bps "genuine take-rate compression" figure and the ~400bps "optical UK impact" figure are both measured on **Revenue ÷ Gross Bookings** (a Mobility-segment-only ratio). This bridge is measured on **Cost of revenue ÷ Total company revenue** (a different ratio, a different base, consolidated across three segments). The two figures are directionally consistent (both point to the UK reclassification being the majority driver of any Mobility-specific ratio move) but are NOT numerically interchangeable, and are not summed together in the table above — doing so would apply a segment-level, revenue-based sensitivity to a consolidated, cost-based bridge it was never measured on.

## 8a. Bridge Attribution and Residual

**Cost of revenue — UK reclassification derivation:**
```
Reported cost-of-revenue ratio: $7,815M / $14,191M = 55.07%
Ex-UK ratio: ($7,815M + $808M) / ($14,191M + $1,100M) = $8,623M / $15,291M = 56.40%
  [$808M Driver-payment decrease and $1,100M revenue decrease both attributed to "Mobility business
  model changes in the UK" — Q2 FY26 10-Q, MD&A Cost of Revenue and Revenue sections]
Difference: 55.07% − 56.40% = −1.32pp = −132bps of the total −509bps cost-of-revenue ratio move
  → 132bps of the 509bps (26%) is the UK reclassification; 377bps (74%) is genuine.
```

**G&A — legal-accrual-swing derivation:**
```
Q2 FY26 G&A increase from legal-related accruals: $138M
÷ Q2 FY26 revenue: $14,191M = 0.97% ≈ 97bps
Total G&A ratio deterioration Q2'25→Q2'26: 5.29% → 6.59% = +130bps
  → 97bps of the 130bps (75%) is a single lumpy legal-accrual line; 33bps (25%) is other G&A growth
  (headcount, contractor/professional services).
```
This is the mirror image of what happened in FY2025, where a **$549M decrease** in the same legal-related-accruals line drove ~106bps of the annual 204bps G&A improvement [FY25 10-K, Item 7] — the identical line item moved margin favorably by ~106bps in FY2025 and unfavorably by ~97bps in the very next comparable quarter. **This is the clearest evidence in the whole cost stack that a G&A/legal-accrual driver is a two-way swing item, not a repeatable trend, and should not be extrapolated in either direction.**

**Reconciliation:** Sum of quantified components (+377 + 132 − 97 − 232 + 6) = **+186bps**, against the stated Total row of **+186bps. Residual = 0bps** (full reconciliation, computed directly from the same GAAP Income-from-operations figures used for the Total row, not estimated). The two components explicitly NOT integrated into the bps sum (Price/take-rate and FX) are flagged, not silently dropped, because they are measured on a different base than this bridge (see basis-mismatch note above) — their omission is a scope choice, not a gap.

## 9. The Single Biggest Margin Driver

**Driver/Courier/Carrier variable payments within cost of revenue** — the single largest cost line at 55–61% of revenue (§3) — is the biggest lever on Uber's margin if it moves adversely. The reconciled Q2 FY26 bridge (§8a) shows the genuine (ex-reclassification) improvement in this line contributed +377bps of the +186bps total EBIT-margin gain — more than the entire net margin change on its own, meaning every other driver in the bridge (SG&A investment, the G&A swing, D&A) is currently a net drag against it. A reversal of this driver — competitive pressure forcing higher driver/courier incentives to defend supply, which `business-model/06_value-chain.md` §1 flags as an active risk ("we may need to increase or may not be able to reduce the Driver incentives that we offer without adversely affecting the supply liquidity") — would compress margin by a larger amount than any other single item in this report, because it is both the largest cost line and the one growing structurally with Gross Bookings. The G&A/legal-accrual line (§8a) is the single most VOLATILE and LEAST PREDICTABLE driver (it has swung ~100–200bps in opposite directions across two consecutive comparable periods), but it is smaller in absolute size than the driver-payment line and should not be confused with "biggest" — biggest and most volatile are two different drivers here, and this report names them separately rather than picking one label for both.

## 10. Investment Spend — Both Signs

Uber's disclosed GAAP capex line is small and stable (TTM capex $308M, historically $242M–$336M annually, `01_historical-financials.md` §1–§2) — there is no capex wave visible in the reported capital-expenditure line. However, on the Q2 FY26 call management disclosed a **$10 billion multiyear autonomous-vehicle (AV) investment program**, large enough relative to Uber's ~$9.8–10.1bn of TTM free cash flow (`01_historical-financials.md` §2) to warrant the same both-signs treatment even though it has not yet appeared as reported capex.

| Reading | What it would show | Evidence here |
|---|---|---|
| Spend as a future COST | The $10bn breaks into (a) equity investments in AV software partners (Lucid, Nuro, Waymo, Wayve, and others) with "clear milestones," and (b) balance-sheet support for "fleet ops, real estate," and OEM offtake — including 120,000 vehicle-purchase commitments over the next few years. CFO: "In terms of the P&L versus cash flow impacts... The closer we get to deployment and scale out, there will be a P&L impact, and we'll size that for investors clearly as we go" — i.e., a future depreciation/lease-cost charge is coming but has NOT yet landed in the D&A line (§3 shows D&A still "not material," +1% YoY) [Q2 FY26 earnings call, CFO Q&A]. No dollar sensitivity for the eventual P&L impact is disclosed anywhere in this pool. |
| Spend as a DEMAND signal | Management frames the spend explicitly as positioning "front of the line for commercialization" and states that "for every dollar that we have invested, our partners have been able to raise an additional $2.50 from other investors" — an external capital-markets confirmation that AV partners see the anchor investment as de-risking, not merely as Uber absorbing cost. The CEO separately states AVs are "doing kind of hundreds of thousands of trips per week" today across a 15-market footprint expanding to "many, many more markets" next year, and that industry structure is shifting from "whether the technology can deliver a compelling service to how broadly, reliably and economically it can scale" [Q2 FY26 earnings call, prepared remarks and Q&A]. |

**Current read:** the evidence favors the DEMAND reading over the COST reading for now, because the disclosed facts are asymmetric — the demand-side evidence (external co-investment ratio, live trip volume, market-count expansion, management's own "front of the line" framing) is quantified and already observable, while the cost-side evidence is explicitly NOT yet quantified ("we'll size that for investors... as we go," no dollar or bps figure disclosed for the future P&L impact, and current D&A remains flat). **The one observable that would flip this read:** the first quarter Uber discloses a material AV-related step-up in the D&A line, or a specific dollar sensitivity for the future P&L impact of the vehicle-purchase commitments — at that point the cost side becomes measurable and this report's current demand-leaning read should be revisited against the actual number, not the framing.

## 11. Citations

[1] Uber Technologies, Inc. Form 10-K, filed Feb-13-2026 (fiscal year ended Dec-31-2025) — Item 7 MD&A "Results of Operations," Item 1A Risk Factors, Item 7A, Note 13 (Segment Information)
[2] Uber Technologies, Inc. Form 10-Q, filed May-06-2026 (Q1 FY2026, period ended Mar-31-2026)
[3] Uber Technologies, Inc. Form 10-Q, filed Aug-05-2026 (Q2 FY2026, period ended Jun-30-2026) — MD&A "Results of Operations," "Segment Results of Operations," Note 10 (Segment Information)
[4] Uber Technologies, Inc., Q1 2026 Earnings Call transcript, May-06-2026 (verbatim CIQ transcript)
[5] Uber Technologies, Inc., Q2 2026 Earnings Call transcript, Aug-05-2026 (verbatim CIQ transcript)
[6] `analyses/UBER_2026-08-08/earnings/01_historical-financials.md`
[7] `analyses/UBER_2026-08-08/earnings/04_guidance-consensus.md`
[8] `analyses/UBER_2026-08-08/business-model/02_business-identity.md`, `03_segment-map.md`, `06_value-chain.md`, `10_external-dependency.md`
[9] `frameworks/SECTOR_OVERLAYS.md` — checked directly, no matching row for a multi-sided mobility/delivery/freight marketplace

All bps deltas, cost-ratio derivations, and bridge reconciliations in this report were computed by this agent directly from the $ figures cited above (cost of revenue, each operating-expense line, Income from operations, and segment revenue/Segment Operating Income), shown inline for verification, not asserted from a vendor-standardized figure.
