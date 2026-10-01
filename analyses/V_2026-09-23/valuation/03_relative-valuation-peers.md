# Relative Valuation — Peers — V

Visa Inc. is a U.S. GAAP operating company, reporting in USD with a September fiscal year-end. The decision line is Visa Class A common stock (`V`, NYSE, USD). The pool price is $364.15 at 2026-08-17 and is 26 U.S. trading days stale at the 2026-09-23 run date; price-relative results below carry that limitation. [data/V/Company Comparable Analysis Visa Inc.xls — Financial Data, 2026-08-17; data/V/Visa_Inc_-_Form_10-Q(Jul-29-2026).doc, cover; analyses/V_2026-09-23/valuation/01_price-and-capital-structure.md, Price freshness]

## 1. Peer Set

| Peer | Ticker | Why Comparable | Source of Inclusion |
|---|---|---|---|
| Mastercard Incorporated | MA / NYSE | The closest public direct rival: a global, multi-regional branded card network that authorizes, clears and settles transactions for issuers, acquirers and merchants. | Visa names Mastercard as a global or multi-regional network competitor. [data/V/Visa-Fiscal-2025-Annual-Report.pdf, Competition, p. 17; Mastercard FY2025 Form 10-K, Item 1] |
| American Express Company | AXP / NYSE | A named branded-network rival, but it also carries loans and card-member receivables. Its lender/issuer economics do not match Visa's stand-alone network model. | Visa names American Express as a global or multi-regional network competitor. [data/V/Visa-Fiscal-2025-Annual-Report.pdf, Competition, p. 17; American Express FY2025 Form 10-K, Table 1, p. 42] |

The set comes from `business-model/08_competitive-map.md`, not a self-selected screen. Mastercard is the sole quantitative direct peer: the frozen Capital IQ comparable export contains MA, but not AXP. AXP is public, not private, but no frozen AXP price/multiple row permits a same-date calculation; it is therefore not guessed. No named private peer is used.

Capital IQ's default ten-company set has a much broader business mix (including merchant acquirers, processors and fintech platforms). Its $V 21.7x LTM EV/EBITDA versus a 11.0x median reconciles exactly to the facts sidecar, but is not the primary peer comparison: the set ranges from 7.0x to 52.9x and is not a same-economics payment-network group. [CIQ facts sidecar, `peer_ev_ebitda`, present; data/V/Company Comparable Analysis Visa Inc.xls — Trading Multiples, 2026-08-17]

## 2. Peer Multiples & Operating Stats

All multiple, growth, margin and vendor-net-debt fields below are from the frozen Capital IQ Company Comparable Analysis workbook, data as of 2026-08-17. They are vendor-defined LTM measures, not Visa-reported non-GAAP measures. Net debt/EBITDA is calculated as the workbook's LTM net-debt field divided by its LTM EBITDA field; Visa's $10,066m net debt is the **broad** basis that also nets $1,433m of current investment securities. [data/V/Company Comparable Analysis Visa Inc.xls — Financial Data, Trading Multiples and Operating Statistics, 2026-08-17; CIQ facts sidecar, `net_debt_m` and `net_debt_ebitda_x`, present]

| Company | P/E | EV/EBITDA | EV/EBIT | EV/Sales | FCF Yield | Rev Growth | EBITDA Margin | ROIC | Net Debt/EBITDA | Data As-of |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| Visa | 31.0x | 21.7x | 22.8x | 15.3x | 3.1%* | 14.4% | 69.9% | 22.4%† | 0.32x broad | 2026-08-17; LTM through 2026-06-30 |
| Mastercard | 31.3x | 23.0x | 24.4x | 14.6x | Not available | 16.0% | 63.3% | Not available‡ | 0.58x broad | 2026-08-17; latest LTM filing 2026-07-30 |
| **Peer median (n=1)** | **31.3x** | **23.0x** | **24.4x** | **14.6x** | **Not assessable** | **16.0%** | **63.3%** | **Not assessable** | **0.58x broad** | **2026-08-17** |
| **Peer mean (n=1)** | **31.3x** | **23.0x** | **24.4x** | **14.6x** | **Not assessable** | **16.0%** | **63.3%** | **Not assessable** | **0.58x broad** | **2026-08-17** |

\* Visa FCF yield = $21,013m LTM CFO less capex / $668,435.9m market capitalization = 3.14%. Mastercard FCF is not in the admitted comparable export, so a peer yield and a yield discount are not calculated. [data/V/Visa_Inc_-_Form_10-Q(Jul-29-2026).doc, p. 10; data/V/Company Comparable Analysis Visa Inc.xls — Financial Data, 2026-08-17; calculation]

† Visa ROIC is the conservative FY2021–FY2025 standardized return-on-capital average, not an LTM figure. ‡ The available Mastercard disclosure gives a 210.5% FY2025 ROE on a small post-repurchase equity base, not a comparable operating ROIC, so it is not substituted. [data/V/Visa-Inc-NYSE-V-Financials_Annual.xls — Ratios, FY2021–FY2025; Mastercard FY2025 Form 10-K, pp. 68, 70; analyses/V_2026-09-23/business-model/09_moat.md, Competitive Economics]

## 3. Premium / Discount to Peer Median

`Premium / (discount) = (Visa multiple − direct-peer median) / direct-peer median`. Positive means Visa carries a price-multiple premium. The forward rows use each company's Capital IQ NTM measure and are the relevant inputs for Section 5. [data/V/Company Comparable Analysis Visa Inc.xls — Trading Multiples, 2026-08-17]

| Multiple | Visa | Peer Median | Premium / (Discount) |
|---|---:|---:|---:|
| LTM P/E | 31.0x | 31.3x | (1.0%) |
| LTM EV/EBITDA | 21.7x | 23.0x | (5.7%) |
| LTM EV/EBIT | 22.8x | 24.4x | (6.6%) |
| LTM EV/Sales | 15.3x | 14.6x | 4.8% |
| NTM P/E | 25.20x | 26.78x | (5.9%) |
| NTM EV/EBITDA | 19.42x | 20.50x | (5.3%) |
| NTM EV/Sales | 13.73x | 12.96x | 5.9% |
| FCF yield | Not assessable | Not assessable | Not assessable |

The yield reading is intentionally not inferred: a higher yield would mean a lower valuation, but Mastercard's comparable FCF yield is unavailable. [data/V/Company Comparable Analysis Visa Inc.xls — Financial Data, 2026-08-17]

**Is the gap typical or unusual?** Not assessable. The admitted evidence supplies only one direct-peer multiple snapshot; Visa's own 38-quarter history is not a history of the Visa–Mastercard relative gap and cannot replace it. [CIQ facts sidecar, `ev_ebitda_percentile`, present; data/V/Company Comparable Analysis Visa Inc.xls — Trading Multiples, 2026-08-17]

## 4. Is the Gap Warranted?

Visa's 5.3%–5.9% NTM earnings-multiple discount to Mastercard is broadly warranted, not a proven relative-value error. Visa's vendor LTM EBITDA and EBIT margins are 69.9% and 66.9%, above Mastercard's 63.3% and 59.9%, while its broad net debt/EBITDA is lower (0.32x versus 0.58x); those facts support its 5.9% NTM EV/Sales premium. [data/V/Company Comparable Analysis Visa Inc.xls — Operating Statistics and Financial Data, 2026-08-17]

But Visa's LTM revenue growth is 14.4% versus Mastercard's 16.0%, and its vendor NTM long-term EPS-growth field is 13.5% versus 16.6%. [data/V/Company Comparable Analysis Visa Inc.xls — Operating Statistics, 2026-08-17] Visa also faces routing, interchange and domestic-processing rules; the DOJ debit-network case remained active after its motion-to-dismiss defeat, while Visa's moat read is stable rather than confirmed to be widening. [data/V/Visa-Fiscal-2025-Annual-Report.pdf, Government Regulation, pp. 18–22; Legal Matters, Note 20; analyses/V_2026-09-23/business-model/09_moat.md, Moat Verdict]

**Conclusion: discount is warranted.** The better margin and lower leverage do not alone establish that Visa should trade at Mastercard's full earnings multiple when the forward-growth and regulatory differences run the other way.

## 5. Implied Value from Peer Multiples

All applications use a forward peer multiple on a forward Visa metric: NTM revenue $49,437.52m, NTM EBITDA $34,971.48m and NTM EPS $14.45. For EV methods, `implied equity = implied EV − $23,858m debt + $12,359m cash − $514m preferred equity`, then `/ 1,898m` reported Q3 diluted Class-A-equivalent shares. The bridge uses the canonical **strict** cash basis, so it differs from the Capital IQ broad-cash vendor EV by the $1,433m current-investment-security amount. [data/V/Company Comparable Analysis Visa Inc.xls — Financial Data and Trading Multiples, 2026-08-17; data/V/Visa_Inc_-_Form_10-Q(Jul-29-2026).doc, pp. 4, 14, 17–18, Note 12; analyses/V_2026-09-23/valuation/01_price-and-capital-structure.md, Anchor Summary]

| Multiple | Applied Peer Multiple | Implied EV or Equity | Implied Price/Share | vs Current Price |
|---|---:|---:|---:|---:|
| NTM P/E — primary | 25.44x | Equity, direct P/E per-share output | $367.62 | 0.9% |
| NTM EV/EBITDA | 19.48x | EV $681.1bn; equity $669.1bn | $352.51 | (3.2%) |
| NTM EV/Sales | 12.96x | EV $640.7bn; equity $628.7bn | $331.24 | (9.0%) |

The base-case peer point is **$367.62 per share**, from NTM P/E. The cross-multiple dispersion is **$331.24–$367.62 per share**, not an averaged target. The 0.9% comparison uses the stale $364.15 pool close; against the $361.52 same-day indicative web cross-check, the P/E point is 1.7% higher, but that quote is unverified and does not replace the pool anchor. [data/V/Company Comparable Analysis Visa Inc.xls — Financial Data and Trading Multiples, 2026-08-17; Web: Visa Investor Relations and StockAnalysis, 2026-09-23 close (indicative, unverified); analyses/V_2026-09-23/valuation/01_price-and-capital-structure.md, Price freshness]

**Quality-adjustment ledger**

| Multiple adjusted | Peer median | Adjusted to | Gap already in the denominator? | What the extra adjustment pays for | How it was sized |
|---|---:|---:|---|---|---|
| NTM P/E | 26.78x | 25.44x | Yes | Lower vendor long-term EPS growth (13.5% versus 16.6%) and Visa's regulatory risk, not lower margin | 5% judgmental discount. *Inference, not from filings:* it is not an empirical frequency, a margin ratio, or a price-based adjustment. |
| NTM EV/EBITDA | 20.50x | 19.48x | Yes | The same forward-growth and regulatory-risk difference, not Visa's margin | 5% judgmental discount, applied consistently with the P/E row. |
| NTM EV/Sales | 12.96x | 12.96x | No | None. Visa's higher margin could support a premium, but the one-peer evidence does not independently size one. | No adjustment; the unadjusted direct-peer multiple is the conservative output. |

The double-count test is therefore passed: Visa's margin is already in its own EBITDA and EPS denominators, so no earnings-multiple haircut is based on a margin ratio. The revenue-multiple row has no margin in its denominator, but no unsupported premium is added. Any convergence with Visa's own-history multiple work would be a coincidence, not independent corroboration.

## 6. Sector Cycle Reality Test

Not assessable — no sector-level multiple history. The frozen evidence contains the 2026-08-17 direct-peer snapshot but no three-to-five-year Mastercard/direct-peer aggregate multiple series or sector-ETF valuation series. The peer median is therefore not assumed to be a stable anchor. [data/V/Company Comparable Analysis Visa Inc.xls — Trading Multiples, 2026-08-17]

## 7. Relative Read

Against the only clean quantified direct peer, Visa carries a 5.3%–5.9% forward earnings-multiple discount but a 5.9% forward EV/Sales premium. A 5% growth-and-regulatory-risk adjustment produces a $367.62 peer-comparison point, only 0.9% above the stale pool price, with a $331.24–$367.62 cross-multiple range. The direct sample is one company and the sector-cycle test is not assessable, so this is not evidence of material relative upside.
