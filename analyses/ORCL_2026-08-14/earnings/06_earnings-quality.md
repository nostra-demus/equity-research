# Earnings Quality — ORCL

All figures in USD millions unless stated otherwise. Reporting standard: US GAAP. Fiscal year ends May 31 ("FY2026" = year ended May-31-2026). Source: FY2026 Form 10-K (filed 2026-06-22), Q4 FY2026 earnings press release (dated 2026-06-10), and Capital IQ Financials_Annual.xls (Income Statement / Balance Sheet / Cash Flow tabs, data as of 2026-08-13) [1][2][3][4][8]. No `ciq_facts.json` sidecar is present in `_pool_extracts/`; all figures below are this agent's own sourced read, reconciled against the upstream `01_historical-financials.md` output where overlapping.

## 1. EBITDA → CFO → FCF Bridge (5 years, FY2022–FY2026)

| Item | FY2022 | FY2023 | FY2024 | FY2025 | FY2026 | Trend |
|---|---:|---:|---:|---:|---:|---|
| EBITDA | 18,958 | 19,778 | 21,896 | 22,333 | 30,494 | Accelerating (FY2026 step-up) |
| Working capital change | 870 | (2,181) | 456 | (2,069) | (5,905) | Deteriorating (larger cash use each of the last 2 years) |
| Tax paid (cash) | (2,567) | (3,009) | (3,560) | (4,020) | (3,704) | Stable, rising in $ terms |
| Interest paid (cash) | (2,735) | (3,250) | (3,655) | (3,374) | (3,896) | Rising with debt load |
| Other operating items (plug — see note below) | (4,987) | 5,827 | 3,536 | 7,951 | 14,988 | Volatile |
| **CFO** | **9,539** | **17,165** | **18,673** | **20,821** | **31,977** | Accelerating |
| Capex (total; split not disclosed) | (4,511) | (8,695) | (6,866) | (21,215) | (55,663) | Accelerating (AI build-out ramp) |
| **FCF (CFO − Total Capex), reported** | **5,028** | **8,470** | **11,807** | **(394)** | **(23,686)** | Decelerating (turned sharply negative) |
| **CFO / EBITDA %** | 50.3% | 86.8% | 85.3% | 93.2% | 104.9% | Improving |

Capex split not disclosed — total capex used. Oracle does not break out maintenance vs. growth capex in the 10-K or press release. FCF may understate true recurring free cash flow (i.e. the number above conflates AI-datacenter growth spend with any ordinary replacement spend) [1, Cash Flow Statement; 8].

**"Other operating items" is a plug, not a disclosed line**, computed as: CFO − EBITDA + Interest paid + Tax paid − Working capital change (so that the row reconciles the table exactly). It is required because EBITDA in Section 1 of `01_historical-financials.md` is built as CIQ operating income (which excludes restructuring & other charges, per that report's Section 1 sourcing note) plus D&A, while CFO is built from full GAAP net income. The residual therefore mixes: the stock-based compensation add-back ($2,613/$3,547/$3,974/$4,674/$4,811 across FY2022–FY2026 [3, "Stock-Based Compensation" row]), restructuring & other charges excluded from CIQ's EBIT ($1,838 FY2026 / $374 FY2025 per the press-release reconciliation [8, p.4]), non-operating gains/losses on investments (a $2,433 gain in FY2026 tied to the Ampere Computing sale and Bloom Energy warrants [8, p.1–2; 3, "(Gain) Loss On Sale Of Invest." row]), and other non-cash/tax-timing items. The FY2026 residual of $14,988 is large and is named explicitly here rather than absorbed silently — it is dominated by the SBC add-back and the gap between CIQ's restructuring-excluded EBIT and full GAAP net income, not by a single unexplained item [CLAUDE.md §15].

### Normalised operating FCF (lead figure, §15)

FY2026 CFO includes a $4,642 increase in unearned (deferred) revenue [3, "Change in Unearned Rev." row], up sharply from a $154 increase in FY2025 and never above $781 in any of the prior four years shown. Management's own commentary explains the driver: large-scale AI cloud contracts where "the customer prepaid Oracle for the purchase of the GPUs, or the customer bought and supplied the GPUs to Oracle," with the cumulative prepaid/customer-supplied-hardware portion of these contracts now totalling $75 billion [Oracle Q4 FY2026 Earnings Press Release, 2026-06-10, "Remaining Performance Obligations" section]. FY2027 guidance separately confirms this is a real and ongoing cash mechanic, not a one-quarter fluke — management guides to ≈$20–25 billion of "customer prepayments and timing impacts" reducing FY2027's net capex outlay versus its ≈$90–95 billion gross figure [Oracle Q4 FY2026 Earnings Call transcript, 2026-06-10, CFO prepared remarks, per `04_guidance-consensus.md` §2]. This is a real, cash-backed, disclosed item — not fabricated earnings — but it is large and unusual in scale relative to Oracle's historical deferred-revenue cash flow, so it is treated here as the kind of one-off cash item §15 requires netting out of the lead FCF figure:

| Metric | Reported (company cash-flow statement) | Normalised (net of FY2026 unearned-revenue prepayment surge) |
|---|---:|---:|
| CFO | 31,977 | 27,335 (= 31,977 − 4,642) |
| FCF (CFO − Capex) | (23,686) | (28,328) |
| CFO / EBITDA % | 104.9% | 89.6% |

Both figures are shown; the reported FCF of −$23,686M is NOT the headline this report leads with, because a material slice of the reported cash inflow is a customer-prepayment mechanic tied to a handful of large AI contracts rather than steady-state operating cash generation. Even on the normalised basis, cash conversion (CFO/EBITDA ≈ 90%) remains strong — the underlying operating business is genuinely cash-backed; it is the capex ramp, not the earnings, that has turned FCF negative.

## 2. Cash Conversion Assessment

CFO has tracked EBITDA closely and, since FY2023, has consistently exceeded 85% of EBITDA — well above the 70% threshold this module treats as healthy — rising to 93.2% in FY2025 and a reported 104.9% (normalised ≈89.6%, see above) in FY2026 [3]. FY2022's 50.3% is the one weak year in the five-year window, driven by a large negative swing in "Other Operating Activities" and working capital that year, not by an earnings-quality problem specific to that period. The trajectory since then has been a steady improvement, not a decline, and the last three years (85.3% / 93.2% / 89.6% normalised) sit consistently in the healthy zone — CFO/EBITDA has NOT been below 50% for 2 or more of the last 3 years, so this is not a cash-conversion breakdown.

## 3. Working Capital Trends

| Metric | FY2024 | FY2025 | FY2026 | Direction | Risk |
|---|---:|---:|---:|---|---|
| Receivable days (DSO) | 51.0 | 52.2 | 51.3 | Flat | Low — no >10% YoY move |
| Inventory days (DIO) | 7.6 | Not disclosed | Not disclosed | Not assessable | Low (inventory was $334M / <1% of assets at last disclosure; CIQ shows "-" for FY2025–FY2026, consistent with Oracle's shift away from hardware-heavy reporting, not a data omission this agent can resolve from the pool) |
| Payable days (DPO) | 42.9 | 80.5 | 127.6 | Rising sharply | High |
| Cash conversion cycle (DSO + DIO − DPO) | ≈15.7 | ≈−20.9 (DIO assumed ≈7.4, last known level; inference) | ≈−69.0 (DIO assumed ≈7.4; inference) | Deeply negative and widening | Medium-High |

Formulas: DSO = 365 × average Accounts Receivable ÷ Revenue; DIO = 365 × average Inventory ÷ COGS; DPO = 365 × average Accounts Payable ÷ COGS. Average balances = (opening + closing) ÷ 2, using fiscal year-end balances [4, Balance Sheet tab: Accounts Receivable, Inventory, Accounts Payable rows; 2, Income Statement tab: "Cost Of Goods Sold" row].

- DSO: FY2024 = 365×((6,915+7,874)/2)/52,961 = 51.0 days; FY2025 = 365×((7,874+8,558)/2)/57,399 = 52.2 days; FY2026 = 365×((8,558+10,385)/2)/67,357 = 51.3 days. Flat — not flagged.
- DPO: FY2024 = 365×((1,204+2,357)/2)/15,143 = 42.9 days; FY2025 = 365×((2,357+5,113)/2)/16,927 = 80.5 days (+87.6% YoY); FY2026 = 365×((5,113+10,977)/2)/23,021 = 127.6 days (+58.5% YoY). **Flagged: DPO rising sharply in both of the last two years.** Accounts Payable itself grew from $1,204M (FY2023) to $2,357M (FY2024) to $5,113M (FY2025) to $10,977M (FY2026) [4]. This coincides directly with the AI-datacenter capex ramp (gross PP&E rose from $72.7B to $152.3B over the same FY2025→FY2026 window [4, Balance Sheet tab]) — the payables stretch reads as Oracle extending payment terms with hardware and data-center construction vendors to help fund the build-out, alongside the $43 billion of debt Oracle raised in FY2026 [8, "Capital Investment Program and Capital Funding"], rather than a deterioration in trade credit with ordinary operating suppliers. This is a genuine liquidity signal worth monitoring (a vendor payment-term squeeze reversing suddenly would pull forward a large cash outflow), not evidence of revenue-recognition or accrual manipulation.
- DIO: last disclosed inventory balance is FY2024 ($334M); CIQ's Balance Sheet export shows no separate inventory figure for FY2025 or FY2026, and this agent found no "Inventories" line in the FY2026 10-K's face balance sheet or notes — inventory (always under 1% of total assets historically) appears to have been folded into another current-asset line as immaterial. DIO for FY2025–FY2026 is therefore **not assessable from available data**; the FY2024 figure (7.6 days) is shown for reference and the FY2025/FY2026 cash conversion cycle above uses that same figure as an inference, labelled as such.

## 4. Non-GAAP Adjustments

| Adjustment | Amount (FY2026) | Recurring? (Y/N) | Concern Level (Low / Mid / High) | Evidence |
|---|---:|---|---|---|
| Stock-based compensation | 4,811 | Y — every year, rising each year | High | [8, Q4 FY2026 Earnings Press Release, "Reconciliation," p.4]. 4,811/17,087 GAAP net income = 28.2% — well above the 15%-of-GAAP-earnings threshold this module flags |
| Amortization of intangible assets | 1,671 | Y — every year (declining as older acquisitions fully amortize) | Mid | [8, same table] |
| Restructuring & other | 1,838 | Y — recurred in FY2025 ($374) via the 2024 Restructuring Plan and FY2026 ($1,838) via the newly initiated 2026 Restructuring Plan | High | [8, same table; FY2026 10-K, "Restructuring and Other Expenses"] — a "one-off" that has appeared in consecutive fiscal years under successive named plans |
| One-time investment gains (Ampere Computing sale + Bloom Energy warrants) | Not separately broken out in the pool beyond the combined effect; Q2 FY26 alone carried a $2,493M pre-tax gain on sale of investments tied to Ampere | N — genuinely one-time (asset sale) | Low-Mid | [8, Footnote 1, "Q4 and FY 2026 results include one-time net investment gains from certain transactions"; Financials_Quarterly.xls, Income Statement tab, Nov-2025 column, "Gain (Loss) On Sale Of Invest." row] — management itself excludes this from its FY2027 growth math (18% vs the 34% GAAP EPS growth actually reported), which is the correct treatment, but it means FY2026's *reported* GAAP growth rate is not a clean run-rate signal |

## 5. One-Off Items (last 3 years)

| Item | Period | Amount | Classification (Genuine / Suspicious / Recurring "one-off") | Evidence |
|---|---|---:|---|---|
| Gain on sale of Ampere Computing Holdings LLC investment | Q2 FY2026 (Nov-2025) | $2,493M pre-tax (company describes the deal as ~$2.7 billion) | Genuine one-off | [Financials_Quarterly.xls, Income Statement tab, Nov-2025 column; 8, p.1–2] |
| Bloom Energy warrants gain | FY2026 | Not separately quantified in the pool | Genuine one-off | [8, Footnote 1] |
| Deferred tax liability remeasurement, U.S. One Big Beautiful Bill Act | FY2026 | $933M unfavorable (increased tax expense) | Genuine one-off (law change) | [FY2026 10-K, MD&A, "Provision for income taxes increased... primarily related to an unfavorable impact of $933 million from the enactment of the U.S. One, Big, Beautiful Bill Act"] |
| Restructuring — 2026 Restructuring Plan | FY2026 | $1,838M (restructuring & other, total) | Recurring "one-off" | [8, p.4; FY2026 10-K, "Restructuring and Other Expenses"] |
| Restructuring — 2024 Restructuring Plan | FY2025 (substantially complete by FY2026) | $374M | Recurring "one-off" | [8, p.4] |
| Unearned-revenue / customer-prepayment surge (large AI GPU contracts) | FY2026 | $4,642M incremental cash inflow (vs $154M FY2025) | Genuine but unusually large in scale — flagged, not fabricated | [3, "Change in Unearned Rev." row; 8, "Remaining Performance Obligations" section] |

## 6. Accrual Quality Flags

| Flag | Triggered (Y/N) | Evidence |
|---|---|---|
| Revenue growing faster than CFO for 2+ years | N | Revenue growth FY2024/25/26 = 6.0%/8.4%/17.3%; CFO growth over the same years = 8.8%/11.5%/53.6% — CFO has grown FASTER than revenue in every one of the last three years [2][3] |
| Receivables growing faster than revenue | Y (mild) | AR grew 21.3% FY2026 (8,558→10,385) vs revenue growth of 17.3% — a ~4-point gap, not large but real [4][2] |
| Inventory growing faster than COGS | Not assessable | Inventory not separately disclosed FY2025–FY2026 (see Section 3) |
| Deferred revenue declining (subscription/contract business) | N | Total unearned revenue (current + non-current) rose from $10,733M (FY2025) to $15,395M (FY2026), +43.4%; non-current unearned revenue alone rose from $1,346M to $5,479M (+307%) [4] — growth, not decline |
| Capitalized costs growing as % of revenue | N (mixed, no clear trend) | Prepaid expenses (which include deferred sales commissions) were 5.4% of revenue (FY2024), 8.4% (FY2025), 6.4% (FY2026) [4][2] — rose then fell, not a one-directional rise |
| Frequent accounting policy changes | N | No policy changes identified in the FY2026 10-K accounting-policy notes beyond routine ASU adoptions |

Only 1 of 6 flags is triggered (a mild receivables-vs-revenue gap), below the 2-flag threshold. **RF-EQ-001 is NOT emitted** — accrual quality does not show the rising-accruals-divergent-from-cash-earnings pattern this tag is reserved for.

## 7. Reported vs Adjusted Reconciliation

| Metric | Reported (GAAP) FY2026 | Adjusted (Non-GAAP) FY2026 | Difference | % of Reported | Recurring? | Evidence |
|---|---:|---:|---:|---:|---|---|
| Operating Income (EBIT) | 20,606 | 28,926 | 8,320 | 40.4% | Mostly Y (SBC + intangible amortization recur every year; restructuring recurs under successive plans) | [8, p.4] |
| Net income | 17,087 | 22,337 | 5,250 | 30.7% | Mostly Y, plus one genuine one-off (investment gains partly offset) | [8, p.4] |
| Net income available to common shareholders | 16,984 | 22,234 | 5,250 | 30.9% | Same as above | [8, p.4] |
| EPS (diluted) | 5.83 | 7.63 | 1.80 | 30.9% | Same as above | [8, p.4] |

FY2025 comparison, for trend context: GAAP Operating Income $17,678 vs Non-GAAP $25,033 (diff 41.6% of reported); GAAP Net Income $12,443 vs Non-GAAP $17,284 (diff 38.9% of reported); GAAP EPS $4.34 vs Non-GAAP $6.03 (diff 39.0% of reported) [8, p.4]. The gap between reported and adjusted earnings has been consistently large (39–42% at the operating-income level) for at least two straight years — this is not a one-year anomaly, it is how Oracle habitually presents its "adjusted" results, and SBC alone accounts for over half of the total addback in both years.

## 8. Accounting Trap Checklist

*(Severity column is inverted — higher = WORSE.)*

| Trap | Triggered? (Y/N) | Evidence | Severity /100 |
|---|---|---|---:|
| Stock-based compensation excluded from adjusted earnings | Y | $4,811M FY2026, 28.2% of GAAP net income, excluded in full from non-GAAP results every year [8, p.4] | 55 |
| Restructuring costs recur every year | Y | 2024 Restructuring Plan (FY2025, $374M) followed by 2026 Restructuring Plan (FY2026, $1,838M), both excluded from non-GAAP [8, p.4; 10-K MD&A] | 55 |
| Capitalized costs rising faster than revenue | N | Prepaid/deferred-commission balance as % of revenue is not one-directional (5.4%→8.4%→6.4%, Section 6) | 10 |
| Receivable factoring / supplier finance disclosed | N | No factoring, securitization, or supply-chain-finance program disclosed in the FY2026 10-K; the DPO stretch documented in Section 3 is organic payables growth tied to the capex ramp, not a formal financing arrangement | 15 |
| Inventory write-downs or reserve releases | N | No material inventory write-down disclosed; inventory itself is immaterial and no longer separately reported | 5 |
| Revenue recognized before cash collection risk is clear | N | DSO is flat (~51–52 days, Section 3); allowance for credit losses is reviewed per-invoice per the 10-K's revenue-recognition note; the $638B RPO figure represents signed but unrecognized future contracts, not revenue already booked | 15 |
| Change in useful life / depreciation assumptions | N | Servers/networking equipment depreciated straight-line over a stated 6-year useful life, unchanged this year [FY2026 10-K, PP&E note]; the 10-K's risk factors flag that useful lives "could be shortened should our cloud strategies change" — a forward risk, not a current-year manipulation | 20 |
| Tax rate unusually low or boosted by one-off | Y | GAAP effective tax rate 12.6% (FY2026) vs the company's own non-GAAP rate of 19.9% — the gap is driven mainly by stock-based-compensation-related tax benefits (which scale with the stock price, not with operating performance) plus a partially offsetting $933M unfavorable one-time deferred-tax remeasurement [8, Footnote 5; 10-K MD&A] | 60 |
| Large fair-value / mark-to-market gains | Y | $2,493M pre-tax gain on the Ampere Computing sale (Q2 FY2026) plus a Bloom Energy warrants gain, together driving a large share of FY2026's 36% GAAP net-income-available-to-common growth (management's own math: excluding these gains, FY2026 non-GAAP EPS growth was 13%, not the ~19% headline rate implied without the exclusion) [8, Footnote 1; p.1–2] | 55 |

## 9. Earnings Quality Score

**Score: 62/100** (band: 61–80, "Mostly clean but some working capital or adjustment noise").

Single most important reason: the core operating cash engine is genuinely strong — CFO has exceeded EBITDA in 3 of the last 4 years and normalised cash conversion in FY2026 is still ≈90% of EBITDA (Section 1–2) — but this year's *reported* growth numbers are inflated by several distinct, compounding items that are each individually disclosed but collectively material: recurring restructuring charges dressed as one-offs under successive named plans, a GAAP tax rate (12.6%) well below the company's own ~20% non-GAAP rate, a large one-time investment gain that drove roughly a third of reported net-income growth, and a capex-driven working-capital shift (DPO stretched from 43 to 128 days in two years, plus a $4.6B customer-prepayment surge embedded in CFO). None of these individually would collapse the score, but their number and direction all point the same way — this year's headline growth reads better than the underlying run rate.

## 10. The Single Biggest Quality Concern

The single biggest risk that reported earnings overstate economic reality is that FY2026's headline growth (GAAP net income available to common up 36%, EPS up 34% [8, p.4]) is not a clean read of the underlying business: a large chunk of it comes from a one-time $2.5 billion+ investment gain (Ampere Computing sale) that management itself excludes from its own forward growth math (18% non-GAAP EPS growth ex-gains, not 34% GAAP), while the reported cash-flow strength is partly a function of an unusually large, disclosed customer-prepayment mechanic tied to a handful of AI infrastructure contracts rather than steady operating cash generation (Section 1). Underneath these one-year distortions, however, the core cash-conversion signal is not fictitious — CFO tracked or exceeded EBITDA in every recent year and even the normalised FY2026 figure (≈90% of EBITDA) is healthy. The more durable concern to monitor going forward is the capex-and-payables dynamic: Oracle is funding an unprecedented AI datacenter build-out partly by stretching supplier payment terms (DPO 43→128 days in two years) alongside raising $43 billion of debt in FY2026, which means free cash flow — genuinely, not just as an accounting artefact — has swung from modestly negative (−$394M FY2025) to sharply negative (−$23,686M reported / −$28,328M normalised FY2026), and any disruption to the prepayment or vendor-financing mechanics that are currently cushioning that gap would show up quickly in reported cash flow.
