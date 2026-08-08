# Earnings Quality — UBER

Reporting standard: US GAAP. Reporting currency: USD millions unless stated. FY0 = FY2025 (year ended Dec-31-2025). Uber is a US SEC filer (10-K/10-Q); US form names below are its actual primary documents [FY25 10-K, p.1].

## 1. EBITDA → CFO → FCF Bridge (5 years)

All figures USD millions. EBITDA = GAAP Income from operations + total D&A (Capital IQ-standardized, matching `01_historical-financials` §1) — this is the reported/GAAP-basis EBITDA, distinct from the company's own non-GAAP "Adjusted EBITDA" shown in §7 below. "Working capital change" = Δ Accounts Receivable + Δ Accounts Payable + Δ Other Net Operating Assets (the latter includes the buildup of Uber's self-insurance reserves — see the note beneath the table). "Other operating items" is the reconciling balance needed to tie EBITDA to CFO once cash tax, cash interest, and the working-capital line are removed; it is mostly the non-cash stock-based-compensation (SBC) add-back plus deferred-tax and other non-cash reconciling items. All figures traced to and independently re-summed from [CIQ Financials_Annual.xls → Cash Flow, Income Statement; FY25 10-K].

| Item | FY2021 | FY2022 | FY2023 | FY2024 | FY2025 | Trend |
|---|---:|---:|---:|---:|---:|---|
| EBITDA (reported/GAAP-basis) | (2,932) | (885) | 1,933 | 3,536 | 6,312 | Accelerating |
| Working capital change | +1,682 | +335 | +165 | +2,374 | +2,227 | Volatile (large, insurance-reserve-driven) |
| Tax paid (cash) | (87) | (175) | (234) | (324) | (345) | Rising with profitability |
| Interest paid (cash) | (449) | (513) | (629) | (475) | (386) | Declining (lower gross debt cost) |
| Other operating items (mainly SBC add-back + non-cash reconciling items) | +1,341 | +1,880 | +2,350 | +2,026 | +2,291 | Stable, large |
| **CFO** | **(445)** | **642** | **3,585** | **7,137** | **10,099** | Decelerating (still growing, but slower than FY23→24) |
| Total capex (maintenance/growth not split — see note) | (298) | (252) | (223) | (242) | (336) | Stable, small (<1% of revenue) |
| **FCF (CFO − Total Capex)** | **(743)** | **390** | **3,362** | **6,895** | **9,763** | Decelerating (still growing) |
| **CFO / EBITDA %** | NM (neg. EBITDA) | NM (neg. EBITDA) | 185.5% | 201.8% | 160.0% | Consistently well above 100% |

Capex split not disclosed — total capex used. FCF may understate true recurring free cash flow if a material share of the $298–336M/year is growth rather than maintenance capex; however, total capex is under 1% of revenue in every year shown, so the split matters far less here than in a capital-intensive business [CIQ Financials_Annual.xls → Cash Flow].

**Lead figure is the reported FCF above — it is not inflated by a one-off cash item or a company-defined add-back.** Uber's own free-cash-flow reconciliation table is identical to the module standard: "Net cash provided by operating activities" minus "Purchases of property and equipment," with no interest/dividend add-back or other adjustment [FY25 10-K, "Free cash flow reconciliation" table: FY2024 $7,137M − $242M = $6,895M; FY2025 $10,099M − $336M = $9,763M — both tie exactly to the bridge above]. No normalisation adjustment is required under §15.

**Bridge reconciles exactly** in every year shown (EBITDA + WC change − tax paid − interest paid + other operating items = CFO, verified by direct recomputation from the cited cash-flow-statement lines).

**Note on "Other operating items" and "Working capital change":** these two lines are large relative to reported EBITDA, mainly because (i) SBC of $1.8–1.9bn/year is expensed in GAAP operating income (lowering EBITDA) but added back as non-cash in the CFO build, and (ii) Uber's self-insurance reserves (auto liability, workers' comp — $12.5bn total balance at Dec-31-2025) have grown every year, and that growth shows up as a non-cash increase in operating liabilities within "Change in Other Net Operating Assets" [FY25 10-K, p. re "Valuation of Insurance Reserves" critical audit matter and Note 1; FY25 10-K MD&A: "the increase in cash from working capital was primarily driven by an increase in our accrued insurance reserves … liabilities recorded during the period exceeding claims paid out"]. Growing insurance reserves are a real, cited, long-tail liability — not a fabricated item — but they mean a meaningful share of the CFO-over-EBITDA gap is a deferred cash outflow (future claims payments) rather than pure organic operating cash generation. See §2.

## 2. Cash Conversion Assessment

CFO has tracked and in every profitable year exceeded reported EBITDA by a wide margin: 185.5% in FY2023, 201.8% in FY2024, and 160.0% in FY2025 [computed above from CIQ Financials_Annual.xls]. This is well above the 70% "healthy" threshold and is not a cash-conversion concern in the mechanical sense the module tests for — but the ratio being this far above 100% is itself informative rather than simply "good": a large part of the gap is the SBC add-back (a real, recurring, dilutive cost that EBITDA already deducts but CFO does not) and the buildup of self-insurance reserves (a liability that will eventually require cash to settle claims, even if the exact timing is actuarially uncertain). The trajectory is decelerating in ratio terms (201.8% → 160.0% FY24→FY25) even as absolute CFO keeps growing, because EBITDA itself is growing faster than the non-cash addback base. Net: cash conversion is not a red flag — CFO/EBITDA has never fallen below ~150% in the profitable years shown — but the composition of that conversion (SBC + insurance-reserve build, not pure receivables/payables efficiency) should temper how "clean" the headline ratio looks.

CFO/EBITDA was not below 50% in any of the last 3 years (185.5%, 201.8%, 160.0%), so the cash-conversion-breakdown trigger does not apply; no RF-EQ-002 tag is emitted.

## 3. Working Capital Trends

Uber is an asset-light, on-demand marketplace and does not report an inventory line [CIQ Financials_Annual.xls → Balance Sheet, "Inventory Method: NA" in all periods] — DIO ("inventory days") is Not Applicable, and the cash conversion cycle below uses DSO and DPO only. DSO uses revenue as the denominator; DPO uses COGS. Balances are period-end averages ((opening + closing)/2).

| Metric | FY2023 | FY2024 | FY2025 | Direction | Risk |
|---|---:|---:|---:|---|---|
| Receivable days (DSO = 365 × avg AR ÷ revenue) | 30.3 | 28.0 | 25.1 | Falling | Low — faster collection, not a red flag |
| Inventory days (DIO) | N/A | N/A | N/A | N/A | Not applicable — no inventory (marketplace model) |
| Payable days (DPO = 365 × avg AP ÷ COGS) | 11.8 | 10.9 | 10.7 | Roughly stable, slightly falling | Low — no evidence of stretching suppliers/drivers for cash |
| Cash conversion cycle (DSO + DIO − DPO) | 18.5 | 17.0 | 14.4 | Shortening | Low — favourable trend |

Evidence: Accounts Receivable FY2022 $2,779M / FY2023 $3,404M / FY2024 $3,333M / FY2025 $3,827M; Accounts Payable FY2022 $728M / FY2023 $790M / FY2024 $858M / FY2025 $1,013M; COGS FY2023 $23,446M / FY2024 $27,483M / FY2025 $31,992M; Revenue FY2023 $37,281M / FY2024 $43,978M / FY2025 $52,017M [all CIQ Financials_Annual.xls → Balance Sheet, Income Statement].

None of the three hard-flag conditions trigger: DSO fell (not rose) in both FY2024 and FY2025; DIO is not applicable; DPO is roughly flat, not sharply rising. AR growth (FY2024: −2.1% YoY; FY2025: +14.8% YoY) has run below revenue growth (+18.0% FY2024; +18.3% FY2025) in both years, consistent with the falling DSO — no receivables-growing-faster-than-revenue concern (see §6).

## 4. Non-GAAP Adjustments

| Adjustment | Amount (FY2025) | Recurring? (Y/N) | Concern Level (Low/Mid/High) | Evidence |
|---|---:|---|---|---|
| Stock-based compensation add-back | $1,826M | Y — every year, rising in dollar terms | High | [FY25 10-K, "Adjusted EBITDA reconciliation" table] |
| Legal, non-income tax, and regulatory reserve changes and settlements | $564M (FY2024: $1,123M) | Y — appears in both years shown despite being an "adjustment" item | High | [FY25 10-K, "Adjusted EBITDA reconciliation" table] |
| Depreciation and amortization | $719M | Y (standard EBITDA add-back, not a quality concern on its own) | Low | [FY25 10-K, "Adjusted EBITDA reconciliation" table] |
| Acquisition, financing and divestitures related expenses | $43M (FY2024: $25M) | Y — present both years | Mid | [FY25 10-K, "Adjusted EBITDA reconciliation" table] |
| Restructuring and related charges | $9M (FY2024: $25M) | Y — present both years, small | Low | [FY25 10-K, "Adjusted EBITDA reconciliation" table] |
| Goodwill and asset impairments/loss on sale of assets, net | $2M (FY2024: $3M) | Y — small, present both years | Low | [FY25 10-K, "Adjusted EBITDA reconciliation" table] |
| Loss on lease arrangement, net | $2M (FY2024: $2M) | Y — small | Low | [FY25 10-K, "Adjusted EBITDA reconciliation" table] |

Total FY2025 add-backs from Income from operations ($5,565M) to Adjusted EBITDA ($8,730M) = $3,165M, i.e. Adjusted EBITDA is 56.9% above GAAP operating income — a large gap. SBC ($1,826M) is the single largest component and is excluded from "adjusted" earnings every year despite being a real, recurring, dilutive cost — this is the classic quality flag the module tests for. The "legal, non-income tax, and regulatory reserve changes and settlements" line ($564M FY2025, $1,123M FY2024) is presented as an adjustment but recurs in both years shown at material size (6.5–17% of the total add-back), which by the module's own test ("Recur every period → then they're not one-off") is a genuine earnings-quality concern, addressed further in §5 and §8.

## 5. One-Off Items (last 3 years)

| Item | Period | Amount | Classification (Genuine / Suspicious / Recurring "one-off") | Evidence |
|---|---|---:|---|---|
| Legal, non-income tax, and regulatory reserve changes and settlements | FY2024–FY2025 | $1,123M (FY24), $564M (FY25) | **Recurring "one-off"** — appears in the non-GAAP add-back every year shown; FY2023 figure not disclosed in this filing's two-year comparison table, so the full multi-year pattern cannot be confirmed beyond FY2024–FY2025, but two consecutive years at >$500M each is enough to flag | [FY25 10-K, "Adjusted EBITDA reconciliation" table] |
| Restructuring and related charges | FY2024–FY2025 | $25M (FY24), $9M (FY25) | Recurring "one-off" — small dollar amount, low concern | [FY25 10-K, "Adjusted EBITDA reconciliation" table] |
| Deferred-tax valuation-allowance release | FY2024 | ~$6.0bn (non-cash, embedded in the $9,856M FY2024 net income and the $(5,758)M FY2024 tax "provision" (i.e., benefit) shown in §7 below) | Genuine one-off — a discrete tax-accounting event, does not recur at this scale in FY2025 (FY2025 tax benefit was smaller, $(4,346)M, but still a benefit — see §8) | [FY25 10-K MD&A: "primarily consisting of $9.8 billion of net income … which primarily included $6.0 billion of deferred income taxes" for FY2024 CFO build; `01_historical-financials` §6] |
| Gain/(loss) on sale of/mark-to-market on minority equity investments (Didi, Aurora, Grab and others) | Every quarter, FY2023–Q2 FY2026 | Swings from +$1,612M (Q2'26) to −$1,602M (Q4'25) to +$1,471M (Q3'25); FY2025 full-year net −$61M (small net, large gross swings) | **Recurring — not a one-off at all.** This line item appears in every quarter and is a permanent structural feature of GAAP net income given Uber's large minority equity stakes are marked at fair value through P&L | [CIQ Financials_Annual.xls → Cash Flow, "(Gain) Loss On Sale Of Invest." row; `01_historical-financials` §3] |

## 6. Accrual Quality Flags

| Flag | Triggered (Y/N) | Evidence |
|---|---|---|
| Revenue growing faster than CFO for 2+ years | N | Revenue grew +18.0% (FY24) and +18.3% (FY25); CFO grew +99.1% (FY24) and +41.5% (FY25) — CFO has grown far faster than revenue in both years [CIQ Financials_Annual.xls] |
| Receivables growing faster than revenue | N | AR fell −2.1% YoY in FY2024 (vs +18.0% revenue growth) and rose +14.8% YoY in FY2025 (vs +18.3% revenue growth) — AR growth trails revenue growth in both years [CIQ Financials_Annual.xls → Balance Sheet] |
| Inventory growing faster than COGS | N | Not applicable — Uber carries no inventory (marketplace model) [CIQ Financials_Annual.xls → Balance Sheet, "Inventory Method: NA"] |
| Deferred revenue declining (if subscription/contract business) | N/A — not disclosed | Uber does not report a separate "Unearned Revenue" balance-sheet line from FY2020 onward [CIQ Financials_Annual.xls → Balance Sheet]; Uber One membership fees exist but a standalone deferred-revenue/contract-liability balance is not broken out in the data available here. Not proven from available data — cannot confirm trend either way |
| Capitalized costs growing as % of revenue | N (proxy only) | No standalone capitalized-software-cost disclosure found in the reviewed 10-K sections; total capex (a partial proxy, since some capitalized software sits in capex) has been stable at 0.55–0.65% of revenue in FY2023–FY2025, showing no rising trend [CIQ Financials_Annual.xls → Cash Flow, Income Statement] |
| Frequent accounting policy changes | N | One disclosure-methodology change identified — the segment non-GAAP measure moved from "Segment Adjusted EBITDA" to "Segment Operating Income" beginning Q1 FY2026 [Q1 FY26 10-Q; Q2 FY26 10-Q] — a single change, not evidence of a pattern of "frequent" changes, but flagged for downstream awareness (see §7 comparability note) |

0 of 6 flags triggered Y (the "N/A — not disclosed" and "N (proxy only)" rows are not counted as triggers). Because fewer than 2 rows are triggered Y, no `RF-EQ-001` tag is emitted.

## 7. Reported vs Adjusted Reconciliation

| Metric | Reported | Adjusted | Difference | % of Reported | Recurring? | Evidence |
|---|---:|---:|---:|---:|---|---|
| EBITDA (FY2025) | $6,284M (GAAP Income from operations $5,565M + D&A $719M, per the company's own reconciliation table) | $8,730M ("Adjusted EBITDA") | +$2,446M | +38.9% | Y — SBC and legal/regulatory reserve add-backs recur every year | [FY25 10-K, "Adjusted EBITDA reconciliation" table] |
| EBIT (FY2025) | $5,565M (GAAP Income from operations) | Not separately disclosed | n/a | n/a | n/a — Uber presents only Adjusted EBITDA and Free Cash Flow as non-GAAP measures | [FY25 10-K, Non-GAAP Measures section] |
| Net income (FY2025) | $10,053M (incl. non-controlling interests) / $10,053M attributable... $9,856M and $10,053M figures per period — see note | Not disclosed | n/a | n/a | n/a — no adjusted net income measure disclosed | [FY25 10-K, Consolidated Statements of Operations] |
| EPS (FY2025) | $4.73 diluted (GAAP) | Not disclosed | n/a | n/a | n/a — no adjusted EPS measure disclosed | [FY25 10-K, Consolidated Statements of Operations] |

**Material comparability break flagged for downstream:** Beginning Q1 FY2026 Uber discontinued its segment-level "Segment Adjusted EBITDA" non-GAAP measure in favour of "Segment Operating Income," and the term "EBITDA" does not appear anywhere in the Q2 FY2026 10-Q outside that one segment-methodology sentence, nor in either the Q1 or Q2 FY2026 earnings-call transcripts [Q1 FY26 10-Q; Q2 FY26 10-Q; Q1 FY26 call, May-06-2026; Q2 FY26 call, Aug-05-2026]. FY2025's $8,730M Adjusted EBITDA is the last disclosed figure of its kind in this data pool — no consolidated non-GAAP profitability reconciliation exists for Q1 or Q2 FY2026. Any FY2026 "Adjusted EBITDA" figure quoted by a third party (sell-side note, press summary) not in this pool should be treated with caution until its definition is confirmed against a primary source [carried forward from `01_historical-financials` §4].

**GAAP net income/EPS is not a clean quality signal independent of the two items below (already documented in `01_historical-financials` §6, restated here for the earnings-quality read):** FY2024's $9,856M net income included a ~$6.0bn non-cash deferred-tax valuation-allowance release, and both FY2024 and FY2025 recorded large non-operating tax *benefits* (provision for income taxes of $(5,758)M and $(4,346)M respectively — i.e., negative tax expense) [FY25 10-K, "Adjusted EBITDA reconciliation" table]. On top of that, quarterly GAAP EPS swings 5–10x quarter to quarter on unrealized mark-to-market gains/losses on minority equity stakes unrelated to operations (e.g., +$1,612M in Q2 FY2026, −$1,602M in Q4 FY2025) [`01_historical-financials` §3]. Neither of these affects EBITDA, CFO, or FCF — but they mean GAAP net income and diluted EPS materially overstate the stability of underlying earnings, and TTM diluted EPS actually fell 22.5% (Jun-30-2025 to Jun-30-2026) even as TTM EBITDA rose 42.9%, EBIT rose 48.6%, and FCF rose 18.5% [`01_historical-financials` §2].

## 8. Accounting Trap Checklist

| Trap | Triggered? (Y/N) | Evidence | Severity /100 *(higher = WORSE — inverted)* |
|---|---|---|---:|
| Stock-based compensation excluded from adjusted earnings | Y | SBC $1,826M FY2025 (3.5% of revenue, 20.9% of Adjusted EBITDA) added back every year in the Adjusted EBITDA reconciliation [FY25 10-K] | 55 |
| Restructuring costs recur every year | Y | $25M (FY24), $9M (FY25) both added back as "non-recurring" — small absolute size limits the concern | 20 |
| Capitalized costs rising faster than revenue | N (insufficient data) | No standalone capitalized-software disclosure found; capex/revenue stable at 0.55–0.65% FY2023–FY2025 (partial proxy only) [CIQ Financials_Annual.xls] | 10 |
| Receivable factoring / supplier finance disclosed | N | No factoring, receivables-sale, or supply-chain-finance disclosure found in the reviewed 10-K sections | 5 |
| Inventory write-downs or reserve releases | N/A | No inventory (marketplace model) [CIQ Financials_Annual.xls → Balance Sheet] | 0 |
| Revenue recognized before cash collection risk is clear | N | DSO is falling, not rising (§3); no evidence of premature recognition beyond the already-flagged FY2022 gross/net presentation reclassification, which is a presentation issue, not a collectability issue [`01_historical-financials` §1] | 10 |
| Change in useful life / depreciation assumptions | N (not identified) | No disclosed change in useful-life assumptions found in the reviewed sections | 5 |
| Tax rate unusually low or boosted by one-off | Y | FY2024: ~$6.0bn non-cash deferred-tax valuation-allowance release; FY2024 and FY2025 both show a net tax *benefit* (negative provision) rather than an expense [FY25 10-K, Adjusted EBITDA reconciliation table] | 65 |
| Large fair-value / mark-to-market gains | Y | Unrealized gains/losses on minority equity stakes (Didi, Aurora, Grab) swing GAAP net income by $1.4–1.6bn in single quarters, unrelated to operating performance [`01_historical-financials` §3] | 60 |

## 9. Earnings Quality Score

**Score: 68/100** (band: 61–80, "Mostly clean but some working capital or adjustment noise").

The single most important reason: underlying operating cash generation is genuinely strong and improving — CFO has exceeded reported EBITDA by 150–200% in every profitable year (FY2023–FY2025), FCF matches the company's own straightforward CFO-minus-capex definition with no inflating add-back, and the cash conversion cycle is shortening (18.5 → 14.4 days) with no accrual-quality flags triggered (0 of 6). That keeps the score in the upper-middle band rather than lower. It is capped below the 81–100 "very strong, minimal adjustments" band by three real and cited concerns: (1) a recurring "legal, non-income tax, and regulatory reserve changes and settlements" add-back ($564M–$1,123M in the two years shown) that by its own repetition contradicts its "adjustment" framing; (2) SBC of ~$1.8bn/year (20.9% of Adjusted EBITDA) permanently excluded from the company's headline non-GAAP profitability measure; and (3) GAAP net income and EPS — the metric most investors quote — being materially distorted by a one-off $6.0bn deferred-tax valuation-allowance release (FY2024) and recurring large mark-to-market swings on minority equity stakes, none of which touch EBITDA, CFO, or FCF but all of which mean the headline earnings numbers require real interpretive work to use.

## 10. The Single Biggest Quality Concern

The cash economics of Uber's business are not in question here — CFO and FCF are large, growing, and well in excess of reported EBITDA, and no accrual-quality red flag (receivables outrunning revenue, inventory build, deferred-revenue erosion) is present. The single biggest quality concern is that the two metrics most commonly quoted for Uber — Adjusted EBITDA and GAAP EPS — are each distorted in ways that are disclosed but easy to miss. Adjusted EBITDA excludes a real, recurring, dilutive cost (SBC, ~21% of the FY2025 adjusted figure) and a "legal, non-income tax, and regulatory reserve" charge that has recurred at material size (>$500M) in both years this filing discloses, meaning the "clean" $8,730M FY2025 Adjusted EBITDA is $2,446M above a GAAP-basis figure that already excludes cash tax and cash interest. Separately, GAAP net income and diluted EPS — which fell 22.5% on a TTM basis even as EBITDA, EBIT, and FCF all grew double digits — are dominated by a one-off $6.0bn deferred-tax benefit (FY2024) and by unrealized mark-to-market swings of $1.4–1.6bn per quarter on minority equity stakes that have nothing to do with the ride-hailing and delivery business. An investor relying on either headline number without adjusting for these items would materially mis-read the trajectory of the business in either direction depending on which quarter they looked at.
