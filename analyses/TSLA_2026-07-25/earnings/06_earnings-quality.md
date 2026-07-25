# Earnings Quality — TSLA

**Jurisdiction / regime:** United States, Nasdaq Global Select Market, US GAAP, SEC filer. **Reporting currency:** USD millions unless stated. **Fiscal year end:** Dec-31. All figures in this report are GAAP unless labelled "non-GAAP" or "Adjusted." [Form 10-Q, Jun-30-2026 cover page]

**Source note (carried from upstream):** The standalone audited FY2025 10-K (Item 8 financial statements) is not in this data pool — only its Part III-only amendment (10-K/A, Apr-30-2026) and the company's own unaudited shareholder "Update" letters, which function as the earnings-release equivalent and are labelled "(Unaudited)" by the company itself. All FY2025 figures below are cited to those Update letters or to the Capital IQ (CIQ) vendor export, never mislabeled as "10-K." The Jun-30-2026 10-Q (filed and reviewed, not fully audited under US GAAP interim-review standards) is the latest filed period and is used for the most recent quarter's detail. [01_historical-financials.md §Source note]

Cash flow data is fully available (CIQ annual/quarterly Cash Flow tabs, plus the company's own quarterly statement of cash flows in each Update letter and the 10-Q) — no partial-data cap applies to this report.

---

## 1. EBITDA → CFO → FCF Bridge (5 years)

EBITDA (earnings before interest, tax, depreciation and amortization — a rough measure of operating cash-generating power before financing and accounting non-cash charges) is shown here on a **GAAP** basis (Operating Income + D&A), not the company's "Adjusted EBITDA" (defined in §4/§7). CFO = cash from operations. FCF (free cash flow — the cash left after running and re-investing in the business) = CFO − total capex, matching both this module's default definition and the company's own stated definition ("Free cash flow = operating cash flow less capital expenditures") [TSLA-Q2-2026-Update.pdf, p.24].

| Item | FY2021 | FY2022 | FY2023 | FY2024 | FY2025 | Trend |
|---|---:|---:|---:|---:|---:|---|
| EBITDA (GAAP) | 9,434 | 17,235 | 13,558 | 13,027 | 10,503 | Deteriorating |
| Working capital change¹ | 667 | (3,712) | (2,248) | 81 | 642 | Volatile |
| Tax paid (cash) | (561) | (1,203) | (1,120) | (1,330) | (1,232) | Stable |
| Interest paid (cash) | (266) | (152) | (126) | (277) | (292) | Stable |
| Other operating items² | 2,223 | 2,556 | 3,192 | 3,422 | 5,126 | Deteriorating (growing plug) |
| **CFO** | **11,497** | **14,724** | **13,256** | **14,923** | **14,747** | Stable |
| Capex (total, abs.)³ | 6,514 | 7,163 | 8,899 | 11,342 | 8,527 | Volatile |
| **FCF (CFO − Total Capex)** | **4,983** | **7,561** | **4,357** | **3,581** | **6,220** | Volatile |
| **CFO / EBITDA %** | **121.9%** | **85.4%** | **97.8%** | **114.6%** | **140.4%** | Rising, but see §2 |

¹ Sum of the five cash-flow reconciling lines (change in receivables, inventory, payables, unearned revenue, other net operating assets) [Financials_Annual.xls, Cash Flow tab].
² Plug = CFO − EBITDA − Working capital change + Tax paid + Interest paid. This mechanically reconciles to CFO in every year (checked to the dollar) and is dominated by the stock-based compensation (SBC) add-back — a genuine non-cash charge already deducted inside EBITDA, so adding it back to reach CFO is standard, not a distortion. SBC alone was $2,121M / $1,560M / $1,812M / $1,999M / $2,825M in FY2021–FY2025 [Financials_Annual.xls, Income Statement tab, "Stock-Based Comp., Total"] — i.e. the plug's growth from $2,223M to $5,126M tracks SBC's near-doubling plus deferred-tax and other non-cash reconciling items, not a hidden cash inflow.
³ **Capex split not disclosed — total capex used. FCF may understate true recurring free cash flow** if a meaningful share of capex is growth rather than maintenance spend (see §2). Beginning Q1 2025 the company redefined capex to include energy-generation/storage-system purchases and restated all prior periods on this basis [TSLA-Q1-2026-Update.pdf, p.4, fn.4] — the FY2024/FY2025 figures above are on the restated basis.

Every year in this bridge is arithmetically checked and reconciles exactly to reported CFO (to the dollar) [Financials_Annual.xls, Cash Flow tab].

**No normalisation trigger found:** the FY2021–FY2025 FCF figures above are not inflated by any single itemised one-off cash item (e.g. a large customer advance) or by a company-defined FCF add-back (interest/dividend received) — Tesla's own FCF definition matches the plain CFO-minus-capex default, so the reported figures above are also the normalised figures. The one real distortion to flag for the FCF trend is **forward-looking, not backward**: the CFO has explicitly guided capex will exceed $25 billion for full-year 2026 (more than double FY2025's $8,527M) and "will grow for the next two to three years" to fund robotaxi, Optimus, a semiconductor fab, solar manufacturing and AI compute buildout [Tesla Q2 2026 Earnings Call, Jul-22-2026, Vaibhav Taneja prepared remarks] — this pushed quarterly FCF negative for the first time in the eight quarters shown in §3 of the upstream report (Q2 2026: −$1,092M) [TSLA-Q2-2026-Update.pdf, p.3]. This is disclosed growth investment, not a hidden earnings-quality problem, but it means FY2025's $6,220M FCF is not a run-rate for 2026.

---

## 2. Cash Conversion Assessment

CFO has stayed close to or above EBITDA every year (85%–140% of EBITDA over FY2021–FY2025), which on its face clears the >70% "healthy" bar in every single year [Financials_Annual.xls, Cash Flow + Income Statement tabs]. But the ratio's recent rise is not a story of improving quality — it mixes two things going the same direction: EBITDA has shrunk every year since FY2022's $17,235M peak to $10,503M in FY2025 (a 39% drop in the denominator), while the non-cash SBC add-back inside CFO has grown from $1,560M to $2,825M over the same period (the numerator's biggest reconciling item). A CFO/EBITDA ratio rising because the EBITDA base is compressing is not the same signal as a ratio rising because collections are improving — read the 140% FY2025 figure with that caveat, not as a standalone positive. The underlying trajectory that matters more for earnings quality is that operating profit itself (EBIT margin, 16.8% in FY2022 to 4.6% in FY2025 — a drop of 1,222 basis points, i.e. hundredths of a percentage point) has fallen every year even as cash conversion of that shrinking profit pool looked fine.

---

## 3. Working Capital Trends

Days sales outstanding (DSO — how many days of sales are sitting uncollected in receivables), days inventory outstanding (DIO — days of cost of goods sold sitting in inventory) and days payable outstanding (DPO — days of cost of goods sold Tesla has not yet paid suppliers for) are computed on average balances ((opening + closing)/2), DSO against revenue, DIO and DPO against cost of goods sold (COGS) — per this module's formula rule, never COGS/DSO or revenue/DIO-DPO cross-mixing.

| Metric | FY2023 | FY2024 | FY2025 | Direction | Risk |
|---|---:|---:|---:|---|---|
| Receivable days (DSO) | 12.1 | 14.2 (+16.7%) | 17.0 (+20.4%) | Rising | **Flagged** — both years breach the >10% YoY threshold |
| Inventory days (DIO) | 61.1 | 58.3 (−4.5%) | 57.3 (−1.7%) | Falling | None — below the >15% rise threshold and moving the right way |
| Payable days (DPO) | 68.5 | 61.2 (−10.6%) | 60.7 (−0.8%) | Falling | None — Tesla is paying suppliers slightly faster, not stretching them further |
| Cash conversion cycle (DSO + DIO − DPO) | 4.7 days | 11.3 days | 13.7 days | Lengthening | Driven entirely by the DSO rise above |

Source: Accounts Receivable, Inventory and Accounts Payable balances from CIQ Financials_Annual.xls Balance Sheet tab; Revenue and COGS from the Income Statement tab [Financials_Annual.xls]. **Cross-check:** the company's own quarterly Update letter discloses DSO and DPO directly — Q4-2025 DSO = 17 days and DPO = 61 days [TSLA-Q2-2026-Update.pdf, p.27, Balance Sheet supplemental] — which matches this report's independently-computed FY2025 DSO of 17.0 and DPO of 60.7 almost exactly, validating the method.

**The DSO flag is the one genuine working-capital concern here.** Absolute days (12→17) are still low for a manufacturer and nowhere near a channel-stuffing signal on their own, but the direction is consistent and two consecutive years both clear this module's 10% YoY flag line, and it runs opposite to falling revenue (FY2025 revenue fell 2.9% while receivables grew 8.1% year-end to year-end) — receivables are growing faster than sales, which is one of the accrual-quality flags in §6. Not proven from available data whether this reflects looser payment terms to move units, growth in the FSD-subscription/financing-adjacent receivable base, or a genuinely benign mix shift; flagged for downstream review, not resolved here.

---

## 4. Non-GAAP Adjustments

The company discloses "Adjusted EBITDA (non-GAAP)," "non-GAAP net income attributable to common stockholders," and non-GAAP diluted EPS every quarter. It does not disclose a separate adjusted EBIT. [TSLA-Q2-2026-Update.pdf, p.24, non-GAAP definitions]

| Adjustment | Amount (FY2025) | Recurring? (Y/N) | Concern Level | Evidence |
|---|---:|---|---|---|
| Stock-based compensation (SBC), net of tax, excluded from non-GAAP net income | $2,825M gross (pre-tax) | Y — every quarter, growing | High | [Annual_Report_TSLA-Q4-2025.pdf, p.4/24; Financials_Annual.xls] — SBC is 65% of FY2025 GAAP operating income ($2,825M / $4,355M) |
| Digital-assets (bitcoin) unrealized gain/loss excluded from Adjusted EBITDA and non-GAAP net income | Quarterly swings of roughly $100M–$300M each direction; LTM net loss ≈ $561M | Y — every quarter since the Q1'25 redefinition | Mid | [TSLA-Q2-2026-Update.pdf, p.23, fn.3: "Beginning in Q1'25, Adjusted EBITDA … is presented net of digital assets gains and losses and all prior periods have been adjusted"] |
| SpaceX equity-investment unrealized mark-to-market gain excluded from Adjusted EBITDA and non-GAAP net income | $1,005M pre-tax / ~$763M net of tax, Q2 2026 only | N so far (first occurrence, tied to the Q1 2026 $2,002M SpaceX equity purchase) — but the position is now held on the balance sheet and can mark up or down every quarter | High for the single quarter it hit | [TSLA-Q2-2026-Update.pdf, p.24, non-GAAP reconciliation; Tesla Q2 2026 Earnings Call, Jul-22-2026, Vaibhav Taneja: "Net income was positively impacted by a mark-to-market gain of $1 billion on our SpaceX holdings"] |
| Release of valuation allowance on deferred tax assets excluded from non-GAAP net income | $5,927M, Q4 2023; $274M (California-specific), Q2 2026 | Y — recurred twice in under 3 years | High | [Annual_Report_TSLA-Q4-2024.pdf, p.32, annual reconciliation table: "Release of valuation allowance on deferred tax assets (5,927)" FY2023; Form 10-Q, Jun-30-2026, Note 10 (Income Taxes): "$274 million income tax benefit" from the California SB 122 valuation-allowance release] |

**Materiality:** FY2025 Adjusted EBITDA ($14,596M) exceeds GAAP EBITDA ($10,503M) by $4,093M, or 39% — well above this module's 15% flag threshold — and the gap is driven almost entirely by SBC, which is excluded from "adjusted" earnings every single quarter. That is a real and recurring adjustment, not a one-off; it should not be read as making the "clean" number 39% better every year going forward without also weighing that SBC is a genuine cost of the business (it dilutes existing shareholders) even though it is non-cash.

---

## 5. One-Off Items (last 3 years)

| Item | Period | Amount | Classification | Evidence |
|---|---|---:|---|---|
| Release of valuation allowance on deferred tax assets (federal) | Q4 2023 | $5,927M non-cash tax benefit, added to GAAP net income | Genuine (disclosed, tied to a specific tax-law/realizability judgment) but materially distorts the FY2023 headline — GAAP EPS $4.30 vs non-GAAP $3.12, a 38% overstatement from this single item | [Annual_Report_TSLA-Q4-2024.pdf, p.32] |
| Automotive warranty "true-down" benefit | Q1 2026 | ~$230M favorable, did not repeat in Q2 | Genuine one-off — CFO explicitly flagged it as non-repeating: "we had highlighted in Q1 that we had a $230 million benefit from warranty true-downs and some tariff relief, which did not repeat in Q2" | [Tesla Q2 2026 Earnings Call, Jul-22-2026, Vaibhav Taneja] |
| Tariff-relief benefit | Q1 2026 | >$200M favorable, did not repeat in Q2 | Genuine one-off, same disclosure as above | [Tesla Q2 2026 Earnings Call, Jul-22-2026, Vaibhav Taneja] |
| Energy-storage warranty "true-up" charge (vendor cell issue) | Q2 2026 | ~$240M unfavorable, related to legacy deployments | Genuine but recurring risk — a **vendor** quality issue in energy storage cells that management called out by name; also visible in the accrued-warranty rollforward, where "net changes in liability for pre-existing warranties" rose to $380M in Q2 2026 from $105M in Q2 2025 | [Tesla Q2 2026 Earnings Call, Jul-22-2026; Form 10-Q, Jun-30-2026, Note 1 (Warranties)] |
| SpaceX equity-investment unrealized mark-to-market gain | Q2 2026 | $1,005M pre-tax | Genuine, non-cash, explicitly excluded from the company's own non-GAAP metrics — but it is a **related-party** holding (Tesla purchased $2,002M of SpaceX equity in Q1 2026 and separately sells Megapack products to SpaceX, $318M of revenue in Q2 2026 alone) whose future mark-to-market swings will keep hitting GAAP net income | [TSLA-Q2-2026-Update.pdf, p.24; Form 10-Q, Jun-30-2026, Note 13 (Related Party Transactions)] |
| California deferred-tax valuation-allowance release | Q2 2026 | $274M tax benefit | Genuine, disclosed, but the second valuation-allowance release in under 3 years — lowered the effective tax rate from 23% to 15% for the quarter | [Form 10-Q, Jun-30-2026, Note 10 (Income Taxes)] |
| Restructuring and other charges | Q3 2025 ($238M), Q4 2025 ($162M), FY2024 ($583M) | See amounts | **Recurring "one-off"** — restructuring charges have appeared in 5 of the last 9 fiscal years shown in the annual data (2018, 2019, 2022, 2024) plus two of the last four quarters — frequent enough that "restructuring" functions as a recurring cost line, not a true one-time event | [Financials_Annual.xls, Income Statement tab, "Restructuring Charges"; TSLA-Q2-2026-Update.pdf, p.27, Statement of Operations] |

---

## 6. Accrual Quality Flags

| Flag | Triggered (Y/N) | Evidence |
|---|---|---|
| Revenue growing faster than CFO for 2+ years | N currently, Y historically | FY2022–FY2023: revenue grew 51.4% then 18.8% while CFO grew only 28.1% then fell 10.0% — triggered then. FY2024–FY2025: CFO held up (+12.6%, then −1.2%) better than revenue (+0.9%, then −2.9%) — not triggered in the most recent two years [Financials_Annual.xls] |
| Receivables growing faster than revenue | **Y** | FY2024: receivables +28.2% vs revenue +0.9%. FY2025: receivables +8.1% vs revenue −2.9% (revenue fell while receivables grew) — matches the DSO flag in §3 [Financials_Annual.xls, Balance Sheet + Income Statement tabs] |
| Inventory growing faster than COGS | Marginal/Y (FY2025 only) | FY2024: inventory fell 11.8% while COGS rose 1.4% — not triggered. FY2025: inventory rose 3.1% while COGS fell 3.1% — a modest 6.2-point gap, triggered but small in absolute terms [Financials_Annual.xls] |
| Deferred revenue declining (unearned revenue / contract liabilities) | N | Total deferred revenue (current + non-current) has grown every year: $3,499M (FY2021) → $4,551M → $6,115M → $6,485M → $7,055M (FY2025) → $7,500M (Jun-2026) — a positive signal for the FSD-software and extended-service-plan contract book [Financials_Annual.xls, Balance Sheet tab; TSLA-Q2-2026-Update.pdf, p.27] |
| Capitalized costs growing as % of revenue | Not proven from available data | No disclosed policy of capitalizing software/development costs beyond ordinary property, plant & equipment; capex growth is disclosed as new-facility/new-product investment (robotaxi, Optimus, semiconductor fab), not capitalized opex — no evidence found of an aggressive capitalization shift in this pool |
| Frequent accounting policy / presentation changes | **Y** | At least four distinct definitional or presentation changes inside roughly 18 months: (1) crypto-asset fair-value accounting standard (ASU 2023-08) adopted, recasting Q4'24 EPS from $0.66 to $0.60 [Annual_Report_TSLA-Q4-2025.pdf, fn.1]; (2) capex redefinition beginning Q1 2025 to include energy-storage purchases, all prior periods restated [TSLA-Q1-2026-Update.pdf, p.4, fn.4]; (3) Adjusted EBITDA redefinition beginning Q1 2025 to net out digital-assets gains/losses, all prior periods restated [TSLA-Q2-2026-Update.pdf, p.23, fn.3]; (4) "other non-current assets" reclassified beginning Q4 2025 to include goodwill/intangibles, all prior periods restated [TSLA-Q2-2026-Update.pdf, p.28, fn.2] |

---

## 7. Reported vs Adjusted Reconciliation

Basis: FY2025 full year, all figures GAAP unless labelled non-GAAP.

| Metric | Reported | Adjusted | Difference | % of Reported | Recurring? | Evidence |
|---|---:|---:|---:|---:|---|---|
| EBITDA | 10,503 (GAAP: Op. Income + D&A) | 14,596 (Adjusted EBITDA, non-GAAP) | +4,093 | +39.0% | Y — SBC, digital-assets gain/loss, and (from Q1'26) SpaceX gain excluded every quarter | [Annual_Report_TSLA-Q4-2025.pdf, p.4/24] |
| EBIT | 4,355 (GAAP Operating Income) | Not disclosed | N/A | N/A | N/A — the company does not publish an adjusted EBIT | [Annual_Report_TSLA-Q4-2025.pdf, p.4] |
| Net income (attributable to common) | 3,794 | 5,858 (non-GAAP) | +2,064 | +54.4% | Y — same exclusions net of tax | [Annual_Report_TSLA-Q4-2025.pdf, p.4] |
| EPS (diluted) | 1.08 | 1.66 (non-GAAP) | +0.58 | +53.7% | Y — same exclusions per share | [Annual_Report_TSLA-Q4-2025.pdf, p.4] |

For comparison, the largest historical gap in this reconciliation was FY2023: GAAP net income $14,997M vs non-GAAP $10,882M — here the *adjusted* number is **lower** than GAAP, because the $5,927M valuation-allowance tax benefit (a GAAP-only, non-recurring gain) was stripped out along with the usual SBC add-back [Annual_Report_TSLA-Q4-2024.pdf, p.32]. This is the one year in the last five where reported (GAAP) earnings quality was worse than the adjusted figure suggests, in the opposite direction from the usual SBC-driven gap.

---

## 8. Accounting Trap Checklist

Severity is inverted — higher score means a worse (more concerning) finding.

| Trap | Triggered? (Y/N) | Evidence | Severity /100 |
|---|---|---|---:|
| Stock-based compensation excluded from adjusted earnings | Y | SBC $2,825M FY2025 = 65% of GAAP operating income, excluded from Adjusted EBITDA and non-GAAP EPS every quarter [Financials_Annual.xls; TSLA-Q2-2026-Update.pdf, p.24] | 65 |
| Restructuring costs recur every year | Partial (recurs frequently, not literally every year) | Charges in 2018, 2019, 2022, 2024, Q3'25, Q4'25 [Financials_Annual.xls; TSLA-Q2-2026-Update.pdf, p.27] | 40 |
| Capitalized costs rising faster than revenue | N — not proven from available data | No disclosed capitalization policy shift found in this pool | 10 |
| Receivable factoring / supplier finance disclosed | N — not proven from available data | No mention of a supplier-finance or factoring program found in the 10-Q or 10-K/A text searched | 5 |
| Inventory write-downs or reserve releases | Y (small, recurring) | "Inventory and purchase commitments write-downs" of $136M/$65M/$49M/$77M/$110M in the last five quarters shown — a recurring cost, not a reversal [TSLA-Q2-2026-Update.pdf, p.27, cash flow statement] | 25 |
| Revenue recognized before cash collection risk is clear | Y (moderate) | DSO up 16.7% then 20.4% YoY over FY2024–FY2025 while revenue fell in FY2025 (§3, §6) | 35 |
| Change in useful life / depreciation assumptions | N — not proven from available data | No useful-life or depreciation-estimate change disclosed in the 10-Q or 10-K/A text searched | 10 |
| Tax rate unusually low or boosted by one-off | Y | $5,927M valuation-allowance release (Q4 2023) and $274M California valuation-allowance release (Q2 2026, cutting the quarterly effective tax rate from 23% to 15%) [Annual_Report_TSLA-Q4-2024.pdf, p.32; Form 10-Q, Jun-30-2026, Note 10] | 55 |
| Large fair-value / mark-to-market gains | Y | $1,005M pre-tax SpaceX equity unrealized gain in Q2 2026 alone, plus recurring smaller digital-assets (bitcoin) mark-to-market swings [TSLA-Q2-2026-Update.pdf, p.24] | 50 |

---

## 9. Earnings Quality Score

**Score: 58/100 — Mixed / average (41–60 band).**

The single most important reason: cash generation itself is genuinely solid — CFO has exceeded 85% of GAAP EBITDA in every one of the last five years and deferred revenue keeps growing, so there is no evidence of manufactured revenue or a collections crisis — but reported GAAP earnings have twice in under three years been materially boosted by one-off, non-operating items that the company itself excludes from its own "adjusted" numbers (the $5,927M FY2023 tax-valuation-allowance release, and the $1,005M Q2 2026 SpaceX mark-to-market gain plus a $274M tax-valuation-allowance release in the same quarter). Layer on a rising DSO trend running opposite to falling revenue, a large and growing SBC exclusion (65% of GAAP operating income), and frequent presentation/definitional restatements, and the honest read is that GAAP headline numbers need real translation work every quarter to see the recurring, cash-backed earnings power underneath — that translation work is exactly what caps this out of the "strong" (61–80) band.

---

## 10. The Single Biggest Quality Concern

The single biggest risk that reported GAAP earnings overstate the recurring, cash-backed economics of the business is the recurring pattern of large, one-off, non-operating items landing directly in GAAP net income in specific quarters — a $5,927M tax-valuation-allowance release that alone accounted for 40% of FY2023's reported net income, and, two-and-a-half years later, the same pattern repeating in miniature with a $1,005M SpaceX equity mark-to-market gain and a $274M California tax-valuation-allowance release both hitting Q2 2026 in the same quarter that free cash flow turned negative for the first time in two years. None of these are hidden — the company's own non-GAAP reconciliation calls each one out by name every time — but a reader who only looks at the GAAP headline (net income, EPS) in the quarter or year these land will see a materially better underlying earnings trend than what CFO, EBITDA, and the DSO trend actually support. The rising DSO trend (+16.7%, then +20.4% YoY, against falling revenue) is the second-largest concern and is the one flag in this report that has not yet been explained by management commentary in the available data.

