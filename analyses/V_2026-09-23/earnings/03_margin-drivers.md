# Margin Drivers — V

Basis: Visa Inc. (NYSE: V) reports in USD under U.S. GAAP. This report uses the standalone three months ended June 30, 2026 (Q3 FY26) against Q3 FY25 unless noted. EBIT is operating income; EBITDA is a GAAP-derived cross-check (EBIT plus depreciation and amortization), because Visa does not report EBITDA. All evidence references are to the frozen package cited logically as `data/V/`.

## 1. Segment Decomposition Status

Visa has one reportable segment, Payment Services, representing all FY25 net revenue; it does not disclose a revenue-category or geography-level profit-and-loss account. Margin analysis therefore stays consolidated. [Visa FY25 Form 10-K, Note 14, p.87]

Sector overlay applied: **No sector overlay for global payments-network and transaction processor — generic cost stack applies.** The relevant generic variables are client incentives, pricing and transaction/product mix, then personnel, marketing and technology costs—not raw materials or freight. [Business Model 02, §3a; Visa Q3 FY26 Form 10-Q, MD&A, pp.32–34]

**Cycle position: mid-cycle expansion (inference, not from filings), and not a normalised run-rate.** Q3 nominal payments volume grew 11%, processed transactions 10%, and cross-border volume excluding intra-Europe 14%; Q4 guidance assumes consumer-spending stability. The June FIFA World Cup lifted inbound North American and Latin American volume, so that part of Q3 travel-related activity is a one-time tailwind rather than a run-rate. The pool does not provide a long enough like-for-like volume-and-margin series to call this a peak. [Visa Q3 FY26 Form 10-Q, MD&A, pp.32–33; Visa Q3 FY26 earnings call, CFO prepared remarks, 2026-07-28]

## 2. Cost Stack

Visa does not disclose cost of revenue, raw-material, freight, energy, or R&D lines. Client incentives are a contra-revenue line; the percentage below is deliberately shown against *net* revenue and must not be added to operating-expense percentages.

| Cost Line | % of Revenue or Amount | Direction | Evidence | Margin Risk |
|---|---:|---|---|---|
| Client incentives (contra revenue) | $4,680m; 40.2% of $11,633m net revenue | Headwind: +18% YoY versus net-revenue growth of 14% | [Visa Q3 FY26 Form 10-Q, MD&A, p.33] | High — Q4 nominal incentive growth is expected to be slightly above Q3 as Visa renews about 20% of payments volume and adds new business. [Visa Q3 FY26 earnings call, CFO prepared remarks, 2026-07-28] |
| Personnel | $2,458m; 21.1% | Headwind: ratio up from 17.2%; includes $563m severance | [Visa Q3 FY26 Form 10-Q, pp.4, 34–35] | High — the Q3 ratio increase was 394bps, though severance makes the reported step-up non-recurring by management’s definition. |
| Marketing | $649m; 5.6% | Headwind: ratio up from 4.1% | [Visa Q3 FY26 Form 10-Q, pp.4, 34] | High — client marketing and campaigns tied to FIFA; some expense shifted from Q3 into Q4. [Visa Q3 FY26 earnings call, CFO prepared remarks, 2026-07-28] |
| Network and processing | $280m; 2.4% | Headwind: ratio up from 2.2% | [Visa Q3 FY26 Form 10-Q, pp.4, 34] | Low in the latest bridge (21bps); driven by technology and network investments and acquisitions. |
| Professional fees | $246m; 2.1% | Headwind: ratio up from 1.8% | [Visa Q3 FY26 Form 10-Q, pp.4, 34] | Low in the latest bridge (28bps); legal fees, client engagements and Prisma/Newpay acquisition costs contribute. |
| Depreciation and amortization | $367m; 3.2% | Headwind: ratio up from 3.1% | [Visa Q3 FY26 Form 10-Q, pp.4, 34] | Low in the latest bridge (4bps). |
| General and administrative | $503m; 4.3% | Tailwind: ratio down from 4.7% | [Visa Q3 FY26 Form 10-Q, pp.4, 34] | Low favourable effect (42bps); this line includes card benefits, facilities, FX gains/losses and corporate costs. [Visa FY25 Form 10-K, p.46] |
| Litigation provision | $253m; 2.2% | Tailwind versus $615m / 6.0% last year | [Visa Q3 FY26 Form 10-Q, pp.4, 34] | High but non-run-rate: provision depends on case-specific accruals and is excluded from Visa’s non-GAAP results. |
| Interest expense (below EBIT) | $194m; 1.7% | Headwind: up from $39m | [Visa Q3 FY26 Form 10-Q, p.4] | Not an operating-margin driver; it affects income before tax and EPS, not EBIT margin. |

## 3. Gross Margin → EBITDA Margin → EBIT Margin Walk

| Margin Level | Latest | Prior Year | Change bps | Main Reason | Evidence |
|---|---:|---:|---:|---|---|
| Gross margin | 97.6% — CIQ vendor-defined, not a Visa GAAP measure | 97.8% — CIQ vendor-defined | (21) | No company-defined gross-profit line; not decision-useful for Visa | [Capital IQ Financials Quarterly workbook, Income Statement, Q3 FY25–Q3 FY26 — vendor export] |
| EBITDA margin | 62.3% — GAAP-derived: ($6,877m EBIT + $367m D&A) / $11,633m | 63.8% — GAAP-derived | (157) | Expense growth outpaced revenue; the small extra decline versus EBIT comes from D&A | [Visa Q3 FY26 Form 10-Q, p.4] |
| EBIT margin | 59.1% — $6,877m / $11,633m | 60.7% — $6,177m / $10,172m | (161) | Personnel and marketing cost ratios rose; lower litigation provision and lower G&A partly offset | [Visa Q3 FY26 Form 10-Q, pp.4, 34] |

The historical-financials output reported a 152bps Q3 GAAP-derived EBITDA-margin decrease. The cited quarterly values instead calculate to 62.27% less 63.84% = **157bps**; this report uses the arithmetically reconciled figure. The same output’s $31,094m LTM EBITDA is also the source-bound Capital IQ value in `ciq_facts.json`, with a 70% vendor margin. It is $2,756m above GAAP-derived LTM EBITDA of $28,338m. **Inference, not from filings:** the reconciled difference reflects the vendor’s special-item-excluding treatment; it is retained as a vendor cross-check, not substituted for reported GAAP operating income. [ciq_facts.json, `ltm_ebitda_m` and `margin_trend`; Visa Q3 FY26 Form 10-Q, pp.3–4]

Price increases have supported service, data-processing and other revenue, but the filings do not disclose an indexed cost escalator, the timing of price changes relative to cost changes, or a realised input-cost recovery rate. **Pass-through lag: not assessable from available data.** Visa’s service-revenue recognition uses prior-quarter payments volume, which is a revenue-recognition timing rule, not evidence of cost pass-through. [Visa FY25 Form 10-K, Note 1, p.69; Visa FY25 Form 10-K, pp.45–46]

## 4. Margin Walk — Which Margin Level Matters Most?

GAAP EBIT margin is the primary metric: Visa has no reported gross-profit measure, and its operating costs—including client-facing marketing, staff, technology and litigation—sit below net revenue. The reported 59.1% Q3 margin is the clearest whole-company measure, but it needs a second read excluding the separately disclosed litigation and severance effects before being treated as a run-rate. EBITDA is only a cross-check, not a company-reported measure. [Visa Q3 FY26 Form 10-Q, pp.4, 34–35]

## 5. Margin Driver Table (consolidated)

| Driver | Impact on Margins | Direction (Tailwind / Neutral / Headwind / Unknown) | Magnitude (High / Mid / Low) | Evidence |
|---|---|---|---|---|
| Client incentives / renewals | Higher rebates, discounts and performance payments reduce net revenue directly. The Q3 $708m increase equals 608bps of Q3 net revenue before considering the volume that generated it. | Headwind | High | Q3 incentives were $4,680m, +18% YoY; Q4 growth is expected slightly above Q3 as renewals and new wins are added. [Visa Q3 FY26 Form 10-Q, p.33; Visa Q3 FY26 earnings call, CFO prepared remarks, 2026-07-28] |
| Personnel and workforce actions | Salary, compensation, headcount, acquisition costs and $563m severance increased the personnel ratio by 394bps. | Headwind | High | Personnel was $2,458m, +40% YoY; management cites severance, employees and compensation. [Visa Q3 FY26 Form 10-Q, pp.4, 34–35] |
| Client marketing and FIFA activity | Marketing expenses rose $228m and the ratio increased 144bps; marketing-services revenue also helped “other revenue,” so the net product-level margin is not disclosed. | Headwind | High | Marketing was $649m, +54% YoY, driven by client marketing and campaigns, in part FIFA; some cost shifted into Q4. [Visa Q3 FY26 Form 10-Q, p.34; Visa Q3 FY26 earnings call, CFO prepared remarks, 2026-07-28] |
| Pricing, value-added services and transaction mix | Pricing, higher value-added services and cross-border transaction mix lift revenue faster than baseline payment/transaction volumes, but Visa does not disclose their incremental margins. | Tailwind | High — inference, not from filings; no category cost disclosure | Service revenue grew 14% on 11% payments-volume growth; data processing grew 17% on 10% transactions; VAS revenue was $3.8bn, +34% constant currency. [Visa Q3 FY26 Form 10-Q, p.33; Visa Q3 FY26 earnings call, CFO prepared remarks, 2026-07-28] |
| FX | FX added about one percentage point to both Q3 net-revenue and operating-expense growth. A net EBIT-margin effect is not disclosed. | Unknown | Unknown — no EBIT sensitivity disclosed | [Visa Q3 FY26 Form 10-Q, MD&A, p.32] |
| Technology / network investment and D&A | Continued network investment and acquisitions increased network-and-processing cost 25% and D&A 16%, but their latest ratio impacts were 21bps and 4bps. | Headwind | Low | [Visa Q3 FY26 Form 10-Q, pp.4, 34] |
| Litigation provision | Lower provision improved the reported operating margin by 387bps versus Q3 FY25. This is not an operating improvement and should not be annualised. | Tailwind | High, non-run-rate | [Visa Q3 FY26 Form 10-Q, pp.4, 34–35] |
| Prisma and Newpay acquisition | On Visa’s adjusted constant-currency basis, the acquisitions added under 1.5 points to Q3 revenue growth and about 2 points to operating-expense growth. Growth-rate contributions cannot be converted to a margin-bps effect from the disclosure. | Headwind | Mid — directional only | [Visa Q3 FY26 earnings call, CFO prepared remarks, 2026-07-28] |

## 6. Margin Drivers By Segment (if applicable)

Not applicable. Payment Services is Visa’s sole reportable segment and accounts for 100% of reported revenue. No revenue-category, geographic, or product-level profit pool is disclosed, so allocating margins among service, data-processing, international-transaction and other revenue would be an unsupported inference. [Visa FY25 Form 10-K, Note 14, p.87]

## 7. Margin Bridge — Latest Period

This is a **reported expense-ratio bridge**, not a causal allocation of price, volume, client incentives or product mix. Visa discloses the operating-expense lines and consolidated net revenue, but not their price/volume/mix contribution to margin. Each row calculates the change in the disclosed cost line as a percentage of that quarter’s own consolidated net revenue.

| Component | Margin Impact (bps) | Evidence |
|---|---:|---|
| Personnel | (394) | Personnel ratio rose from $1,749m / $10,172m to $2,458m / $11,633m. [Visa Q3 FY26 Form 10-Q, p.4] |
| Marketing | (144) | Marketing ratio rose from $421m / $10,172m to $649m / $11,633m. [Visa Q3 FY26 Form 10-Q, p.4] |
| Network and processing | (21) | Cost ratio rose from $224m / $10,172m to $280m / $11,633m. [Visa Q3 FY26 Form 10-Q, p.4] |
| Professional fees | (28) | Cost ratio rose from $187m / $10,172m to $246m / $11,633m. [Visa Q3 FY26 Form 10-Q, p.4] |
| D&A | (4) | Cost ratio rose from $317m / $10,172m to $367m / $11,633m. [Visa Q3 FY26 Form 10-Q, p.4] |
| G&A | 42 | Cost ratio fell from $482m / $10,172m to $503m / $11,633m. [Visa Q3 FY26 Form 10-Q, p.4] |
| Litigation provision | 387 | Cost ratio fell from $615m / $10,172m to $253m / $11,633m. [Visa Q3 FY26 Form 10-Q, p.4] |
| Other | 0 | All reported operating-expense lines are included; price, volume, client incentives and mix remain causally unallocated, rather than being inserted into a residual. |
| **Total EBIT-margin change** | **(161)** | $6,877m / $11,633m less $6,177m / $10,172m. [Visa Q3 FY26 Form 10-Q, p.4] |

## 7a. Bridge Attribution and Residual (MODULE_RULES "Driver Attribution" / §15)

All of the following are asserted from the disclosed quarterly expense lines; no sensitivity, pass-through rate or elasticity is applied. Basis matches throughout: standalone Q3 FY26 and Q3 FY25, consolidated U.S.-GAAP net revenue.

```
Personnel: ($2,458m / $11,633m) − ($1,749m / $10,172m) [Visa Q3 FY26 Form 10-Q, p.4]
  = +393.5bps expense ratio = −393.5bps of the −160.9bps observed EBIT-margin change
  → basis matches
Marketing: ($649m / $11,633m) − ($421m / $10,172m) [Visa Q3 FY26 Form 10-Q, p.4]
  = +144.0bps expense ratio = −144.0bps
  → basis matches
Network and processing: ($280m / $11,633m) − ($224m / $10,172m) [Visa Q3 FY26 Form 10-Q, p.4]
  = +20.5bps expense ratio = −20.5bps
  → basis matches
Professional fees: ($246m / $11,633m) − ($187m / $10,172m) [Visa Q3 FY26 Form 10-Q, p.4]
  = +27.6bps expense ratio = −27.6bps
  → basis matches
D&A: ($367m / $11,633m) − ($317m / $10,172m) [Visa Q3 FY26 Form 10-Q, p.4]
  = +3.8bps expense ratio = −3.8bps
  → basis matches
G&A: ($503m / $11,633m) − ($482m / $10,172m) [Visa Q3 FY26 Form 10-Q, p.4]
  = −41.5bps expense ratio = +41.5bps
  → basis matches
Litigation provision: ($253m / $11,633m) − ($615m / $10,172m) [Visa Q3 FY26 Form 10-Q, p.4]
  = −387.1bps expense ratio = +387.1bps
  → basis matches
```

Sum of disclosed components = **−160.9bps**; reported EBIT-margin change = **−160.9bps**; residual = **0.0bps**. This fully reconciles the accounting bridge, but not the causal split of price, volume, incentive and product mix; those are not disclosed at a margin level.

RF-EARN-002: margin bridge reconciled — explained -161bps, residual 0bps, total -161bps

## 8. The Single Biggest Margin Driver

**Client incentives / renewals are the single biggest forward margin driver, and their current direction is a headwind.** Q3 personnel was the largest reported bridge item at −394bps, but $563m of that quarter’s expense was management-defined severance and the call also identifies deferred-compensation mark-to-market effects. In contrast, Visa gave a direct Q4 warning that incentives should grow slightly faster than Q3 as it renews roughly 20% of payments volume and adds new business. At the Q3 revenue base, each additional $100m of incentives lowers net revenue, and therefore EBIT margin before any offset, by $100m / $11,633m = 86bps. The contract renewal outcome and offsetting volume/pricing are not disclosed, so this is an exposure arithmetic, not a forecast. [Visa Q3 FY26 Form 10-Q, pp.4, 33–35; Visa Q3 FY26 earnings call, CFO prepared remarks, 2026-07-28]

## 9. Investment Spend — Both Signs (only when capex/opex is running well above its own history)

Not triggered as a capex-wave read. Latest TTM capex was $1,567m, up 11.8%, while TTM revenue grew 14.4%; nine-month FY26 capex was $1,178m, up 7.8% versus 15.3% revenue growth. The evidence does not show capex rising well above Visa’s own growth rate. [Visa Q3 FY26 Form 10-Q, p.10 and MD&A, p.32; Capital IQ Financials Quarterly workbook, Cash Flow and Income Statement, LTM June 2026 — vendor export]

The observable that would change this treatment is a future disclosed capex or technology-spend step-up that materially exceeds revenue growth, accompanied by either contracted processing demand or evidence that capacity rather than demand is the binding constraint. Neither is established from the current pool.
