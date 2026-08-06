# Earnings Quality — UBER

**Reporting standard:** US GAAP. **Currency:** USD millions unless noted. **Source caveat (carried from `01_historical-financials.md`):** no primary SEC filing (10-K/10-Q/8-K) is in the data pool. Every income-statement, balance-sheet, and cash-flow figure below is sourced from Capital IQ's vendor transcription of Uber's filings (source-hierarchy tier 5, CLAUDE.md §4) and cited as "CIQ export," never as "10-K." The verbatim Q2 FY2026 earnings-call transcript (Aug-05-2026) is a primary call record and is cited as such. Cash flow data IS available in this pool — the partial-data cap for missing cash flow does not apply.

**EBITDA definitions used throughout (carried from `01_historical-financials.md` §0):** "Adj. EBITDA" = the company-defined, non-GAAP metric Uber guides to (adds back stock-based compensation and other items) [Financials.xls, Segments tab, "Total EBITDA" row]. "GAAP-based EBITDA" = Operating Income + D&A, a CapIQ-standardized calculation [Financials.xls, Income Statement tab, "EBITDA" supplemental row]. Section 1 uses Adj. EBITDA as the primary line (it is the metric available at full granularity and the one management and the market track); Section 7 shows the GAAP-based reconciliation.

## 1. EBITDA → CFO → FCF Bridge (5 years)

| Item | FY2021 | FY2022 | FY2023 | FY2024 | FY2025 | Trend |
|---|---:|---:|---:|---:|---:|---|
| Adj. EBITDA | -774 | 1,713 | 4,052 | 6,484 | 8,730 | Improving — loss to profit in FY2022, expanding every year since |
| Working capital change | -1,079 | 439 | 227 | -1,554 | -906 | Volatile — no clean directional trend, but never the swing factor behind the CFO growth story |
| Tax paid (cash) | -87 | -175 | -234 | -324 | -345 | Rising with the business (small vs. CFO) |
| Interest paid (cash) | -449 | -513 | -629 | -475 | -386 | Improving — falling in absolute terms as debt is refinanced/repaid |
| Other operating items (reconciling plug — see note) | 1,944 | -822 | 169 | 3,006 | 3,006 | See note below table |
| **CFO** | **-445** | **642** | **3,585** | **7,137** | **10,099** | **Improving — strong, though decelerating growth rate (+244%/+458%/+99%/+42% YoY)** |
| Maintenance capex | Not split — see note | | | | | |
| Growth capex | Not split — see note | | | | | |
| Total capex | -298 | -252 | -223 | -242 | -336 | Stable — small and asset-light (<1% of revenue every year) |
| **FCF (CFO − Total Capex)** | **-743** | **390** | **3,362** | **6,895** | **9,763** | **Improving** |
| **CFO / EBITDA %** | N/M (EBITDA negative) | 37.5% | 88.5% | 110.1% | 115.7% | Improving — crossed above the 70% "healthy" threshold in FY2023 and has stayed above 85% every year since |

Evidence: Adj. EBITDA [1]; CFO, capex, cash taxes paid, cash interest paid, Change in Net Working Capital (supplemental) [2]; FCF = CFO − |capex| per module calculation standard, matching `01_historical-financials.md` §1 exactly.

**Capex split not disclosed — total capex used.** Uber does not break out maintenance vs. growth capex in this pool. FCF may understate true recurring free cash flow if a portion of the (already small, <1% of revenue) capex is growth-related, but given the small absolute size of total capex this has minimal effect on the FCF conclusion either way.

**"Other operating items" plug note.** This row is a derived balancing figure (CFO − Adj. EBITDA − WC change − tax paid − interest paid), not a single disclosed line. It is large and positive in FY2024–FY2025 (+$3,006mm each year) primarily because: (a) stock-based compensation ($1,796mm FY2024 / $1,826mm FY2025) is a non-cash add-back inside GAAP net income → CFO that is separate from — and not captured by — the Adj. EBITDA-based bridge above (Adj. EBITDA already adds SBC back at the EBITDA level, so re-adding it in the CFO build is a genuine reconciling item, not double-counting cash); and (b) the CFO build reverses the large non-cash deferred-tax valuation-allowance release ($5,758mm FY2024 / $4,346mm FY2025 recognized in net income — see Section 8) via the "Other Operating Activities" line (-$5,543mm FY2024 / -$4,693mm FY2025) [3], since that tax benefit was never a cash inflow. Evidence: [Financials.xls, Cash Flow tab, "Stock-Based Compensation" and "Other Operating Activities" rows; Income Statement tab, "Income Tax Expense" row] [2][4].

**Normalised operating FCF vs. reported (CLAUDE.md §15).** No one-off cash item (e.g. a large customer advance) or non-standard company-defined FCF add-back was found inflating reported FCF. Uber's own FCF claim on the Q2 FY2026 call — "trailing 12-month free cash flow exceeding $10 billion for the first time in our history" [5] — reconciles almost exactly to the standard CFO − capex calculation (TTM Jun-30-2026: $10,116mm) [2]. Reported FCF is used as the lead figure without adjustment; there is no distortion to normalise out.

## 2. Cash Conversion Assessment

CFO has tracked and then **exceeded** Adj. EBITDA every year since FY2023: 88.5% (FY2023) → 110.1% (FY2024) → 115.7% (FY2025), comfortably above the 70% "healthy" threshold and above 100% for the last two fiscal years [2]. The TTM figure (Jun-30-2026) is 103.8% (CFO $10,424mm / Adj. EBITDA $10,043mm) [2], confirming this is not a one-year artifact. The mechanism is structural, not accounting sleight-of-hand: Uber collects rider/eater payment immediately (via card) while paying drivers and merchants with a short lag, funding a persistent negative-working-capital tailwind that is visible in the growing Accrued Expenses balance ($5,258mm FY2021 → $7,842mm FY2025 → $11,330mm LTM Jun-26, largely funds owed to drivers/merchants) [6] and in the "Change in Other Net Operating Assets" cash-flow line, which has been positive every year (+$2,189mm to +$2,567mm) [2]. Trajectory: improving and now stable at a high level — this is a genuine positive earnings-quality signal, the single strongest one in this dataset.

CFO/EBITDA was NOT below 50% in 2 or more of the last 3 fiscal years (FY2023 88.5%, FY2024 110.1%, FY2025 115.7% — all comfortably above 70%). The RF-EQ-002 cash-conversion-breakdown trigger does not apply and is not emitted.

## 3. Working Capital Trends

Uber is an asset-light marketplace/platform business with no inventory (Mobility, Delivery, and Freight are all brokerage/matching businesses) — "Inventory Turnover: NA" and "Avg. Days Inventory Out.: NA" for every year in the CIQ export [7]. DIO is not applicable to this business model and is shown as N/A throughout, per the module's own DSO/revenue vs. DIO,DPO/COGS denominator convention.

| Metric | FY2023 | FY2024 | FY2025 | Direction | Risk |
|---|---:|---:|---:|---|---|
| Receivable days (DSO) — 365×avg AR÷revenue | 30.3 | 28.0 | 25.1 | Falling (improving) | Low |
| Inventory days (DIO) | N/A | N/A | N/A | N/A — no inventory in this business model | N/A |
| Payable days (DPO) — 365×avg AP÷COGS | 11.8 | 10.9 | 10.7 | Falling (paying suppliers slightly faster) | Low |
| Cash conversion cycle (DSO + DIO − DPO) | 18.5 | 17.0 | 14.5 | Shrinking (improving) | Low |

Own calculation using average (opening + closing) balances, cross-checked against and matching (within rounding) the CIQ-computed "Avg. Days Sales Out." / "Avg. Days Payable Out." ratio-tab rows (FY2023: 30.27/11.82; FY2024: 28.03/10.97; FY2025: 25.12/10.67) [7]. Inputs: Accounts Receivable and Accounts Payable balance-sheet lines [6]; COGS and Revenue income-statement lines [4].

None of the flag thresholds trip: DSO is falling, not rising >10% YoY (revenue-recognition concern absent); DIO is not applicable; DPO is falling, not rising sharply (no supplier-stretching liquidity signal). The shrinking cash conversion cycle (18.5 → 14.5 days) corroborates the strong CFO/EBITDA conversion in Section 2 rather than contradicting it.

## 4. Non-GAAP Adjustments

| Adjustment | Amount | Recurring? (Y/N) | Concern Level | Evidence |
|---|---:|---|---|---|
| Stock-based compensation add-back (to Adj. EBITDA) | $1,826mm (FY2025); $1,939mm (LTM Jun-26) | Y — every year | Mid — SBC is a real, non-cash but genuinely dilutive cost (~3.5% of FY2025 revenue) that Adj. EBITDA excludes entirely; common across ride-hail/delivery peers but still a material headline-EBITDA inflator | [Financials.xls, Income Statement tab, "Stock-Based Comp., Total" row; Segments tab, "Total EBITDA"] |
| Other unitemized non-GAAP add-backs (Adj. EBITDA vs. GAAP-based EBITDA gap beyond SBC) | ~$592mm (FY2025, = $2,418mm total gap − $1,826mm SBC); ~$630mm (LTM) | Y — recurs every period, composition not itemized in this pool | Mid-High — the ~24-25% of the total EBITDA adjustment that is not SBC is not broken out (legal reserves, restructuring, and similar per `01_historical-financials.md` §4); genuine opacity, not a language issue | [01_historical-financials.md §4; Financials.xls, Income Statement & Segments tabs] |
| Deferred-tax valuation-allowance release (non-cash tax benefit lifting GAAP net income/EPS) | +$5,758mm (FY2024); +$4,346mm (FY2025) | Y — occurred in 2 consecutive fiscal years, though each is technically a distinct one-time deferred-tax-asset recognition event, not an operating item | High — this is the largest single distortion in the dataset; see Section 8 | [Financials.xls, Income Statement tab, "Income Tax Expense" & "Total Deferred Taxes" rows; Balance Sheet tab, "Deferred Tax Assets, LT" row] |
| Gain/(loss) on sale of investments (equity-stake mark-to-market, e.g. Aurora/Didi/Grab-type holdings) | +$1,832mm (FY2024) / -$97mm (FY2025) / -$7,227mm (FY2022) | Y — recurs every year with unpredictable sign and large magnitude | Mid-High — non-operating and highly volatile; embedded in GAAP EBT and net income, correctly excluded from the company's own Normalized Net Income | [Financials.xls, Income Statement tab, "Gain (Loss) On Sale Of Invest." row] |

## 5. One-Off Items (last 3 fiscal years)

| Item | Period | Amount | Classification | Evidence |
|---|---|---:|---|---|
| Merger & Related Restructuring Charges | FY2024 | -$236mm | Genuine one-off (does not recur FY2021–FY2023 or FY2025) | [Financials.xls, Income Statement tab, "Merger & Related Restruct. Charges" row] |
| Deferred-tax valuation-allowance release | FY2024 | +$5,758mm (non-cash tax benefit) | Recurring "one-off" — occurred again the following year at reduced scale (see next row); should not be modelled as a step-change in the tax rate | [Financials.xls, Income Statement tab, "Income Tax Expense" row; Balance Sheet tab, "Deferred Tax Assets, LT" row (+$6,001mm FY2024, matching within $26mm)] |
| Deferred-tax valuation-allowance release | FY2025 | +$4,346mm (non-cash tax benefit) | Recurring "one-off" — same mechanism as FY2024, confirming this is a multi-year unwind, not a single clean event | [same, Balance Sheet DTA +$4,780mm FY2025, matching within $1mm] |
| Gain on sale of investments | FY2024 | +$1,832mm | Genuine but non-operating and volatile — sign flips year to year (see FY2022 -$7,227mm) | [Financials.xls, Income Statement tab, "Gain (Loss) On Sale Of Invest." row] |
| Loss on sale of investments | FY2025 | -$97mm | Genuine but non-operating and volatile | [same row] |
| UK Mobility cost-of-revenue reclassification ("optical" impact on reported gross margin/take-rate) | FQ1'26–FQ2'26 | Not separately dollar-quantified in this pool; described by management as ~400bps of a ~500bps YoY mobility take-rate decline | Suspicious as a **presentation** change, not a cash or economic item — moves costs between P&L lines without changing underlying unit economics, and inflates the reported quarterly Gross Margin % series by ~5+pp versus the LTM GAAP gross margin (which moved only +225bps) [8] | [Q2 FY2026 Earnings Call transcript, Aug-05-2026, CFO Balaji Krishnamurthy, Q&A (verbatim)] |

## 6. Accrual Quality Flags

| Flag | Triggered (Y/N) | Evidence |
|---|---|---|
| Revenue growing faster than CFO for 2+ years | N | Opposite pattern: FY2025 CFO grew +42% YoY vs. revenue +18.3% YoY; FY2024 CFO +99% vs. revenue +18.0%. CFO has outpaced revenue every year since FY2022 [2][4]. |
| Receivables growing faster than revenue | N (borderline) | FY2023 AR growth (+22.5%) did exceed revenue growth (+17.0%) — one year triggered. But the most recent two years reversed this: FY2024 AR growth -2.1% vs. revenue +18.0%; FY2025 AR growth +14.8% vs. revenue +18.3%. DSO has fallen every year since (Section 3). Net: not a persistent pattern. [6][7] |
| Inventory growing faster than COGS | N/A | No inventory in this business model (marketplace/brokerage) [7]. |
| Deferred revenue declining (if subscription/contract business) | N/A | Not disclosed as a separate line in this pool; Uber is not primarily a deferred-revenue/subscription business (Uber One membership revenue is not broken out here) — "Not proven from available data." |
| Capitalized costs growing as % of revenue | Not assessable from available data | "Other Long-Term Assets" grew from $3,276mm (FY2021) to $14,019mm (FY2025) — faster than revenue — but this pool has no note-level detail on composition (could be equity-method investments, right-of-use assets, or capitalized development costs). Flagging as an open item rather than asserting Y, per "no source = no claim" [6]. |
| Frequent accounting policy changes | Y | CIQ vendor export marks the FY2022 and FY2023 income-statement columns "Reclassified" [4]; separately, the UK mobility cost-of-revenue reclassification disclosed on the Q2 FY2026 call created a ~5pp step-change in reported quarterly gross margin with no corresponding change in LTM GAAP gross margin, described by the CFO as "an optical impact" [8]. This is a genuine presentation-comparability issue, not a cash or accrual-quality problem in the strict sense, but it recurs and affects how margin trend should be read. |

Only 1 of 6 rows is a clear Y (accounting policy/presentation changes); the two most consequential accrual-adjacent rows (revenue-vs-CFO, receivables-vs-revenue) are both N on the most recent evidence. Fewer than 2 rows triggered Y — the RF-EQ-001 (rising accruals divergent from cash earnings) trigger does not apply and is not emitted.

## 7. Reported vs Adjusted Reconciliation

| Metric | Reported | Adjusted | Difference | % of Reported | Recurring? | Evidence |
|---|---:|---:|---:|---:|---|---|
| EBITDA, FY2025 | 6,312 (GAAP-based: Op. Income + D&A) | 8,730 (Adj. EBITDA, company-defined) | +2,418 | +38.3% | Y | [4][1] |
| EBIT | 5,565 (GAAP, FY2025) | Not separately disclosed — Uber does not report an "Adjusted EBIT" non-GAAP metric in this pool | — | — | — | [4] |
| Net income, FY2025 | 10,053 (GAAP) | 3,613 (Normalized) | -6,441 | -64.1% | N (tax-benefit-driven, though the mechanism recurred FY2024→FY2025 — see Section 5) | [4][9] |
| Net income, FY2024 | 9,856 (GAAP) | 1,568 (Normalized) | -8,288 | -84.1% | N | [4][9] |
| EPS diluted, FY2025 | 4.73 (GAAP) | 1.70 (Normalized) | -3.03 | -64.1% | N | [4][9] |
| EPS diluted, FY2024 | 4.56 (GAAP) | 0.73 (Normalized) | -3.83 | -84.0% | N | [4][9] |

The reported figure is HIGHER than the adjusted figure for net income/EPS in both years — the opposite direction from the usual "adjusted beats reported" non-GAAP pattern — because the company's own normalization strips out one-time gains (the deferred-tax benefit and investment mark-to-market gains) rather than one-time charges. This is company-disclosed and directionally conservative (the company's own normalized numbers are lower, more cautious, than the GAAP headline), which is a mild positive for disclosure quality even though the underlying GAAP EPS series remains an unreliable growth narrative on its own (see Section 8).

## 8. Accounting Trap Checklist

*(Severity /100 — higher = WORSE, inverted per module scoring rules)*

| Trap | Triggered? (Y/N) | Evidence | Severity /100 |
|---|---|---|---:|
| Stock-based compensation excluded from adjusted earnings | Y | SBC $1,826mm FY2025 (~3.5% of revenue) added back to Adj. EBITDA [1] | 45 |
| Restructuring costs recur every year | N | Merger & Restructuring charges appear only in FY2024 (-$236mm); zero in FY2021, FY2022, FY2023, FY2025 [4] | 10 |
| Capitalized costs rising faster than revenue | Not conclusively verifiable | "Other Long-Term Assets" growth outpaces revenue growth, but composition is not itemized in this pool (Section 6) | 20 |
| Receivable factoring / supplier finance disclosed | N | No factoring, securitization, or supplier-finance program disclosed anywhere in the data pool | 5 |
| Inventory write-downs or reserve releases | N/A | No inventory in this business model | 0 |
| Revenue recognized before cash collection risk is clear | N | DSO shrinking (30.3 → 25.1 days FY2023–FY2025); Accum. Allowance for Doubtful Accts stable at ~2.1–2.4% of AR, not rising [6][7] | 10 |
| Change in useful life / depreciation assumptions | Not assessable from available data | No note-level detail on depreciation policy in this pool (no 10-K) | 15 |
| Tax rate unusually low or boosted by one-off | Y | Effective Tax Rate % marked "NM" most years; FY2024/FY2025 GAAP tax line shows a net BENEFIT of -$5,758mm / -$4,346mm from a non-cash deferred-tax valuation-allowance release, confirmed by the matching Balance Sheet "Deferred Tax Assets, LT" jump of +$6,001mm/+$4,780mm in the same years [4][6] — the single largest earnings-quality distortion in this dataset | 75 |
| Large fair-value / mark-to-market gains | Y | "Gain (Loss) On Sale Of Invest." swings from -$7,227mm (FY2022) to +$1,536/+$1,832/-$97mm (FY2023–FY2025), tied to equity-stake holdings — non-operating and highly volatile, embedded in GAAP EBT and net income [4] | 65 |

## 9. Earnings Quality Score

**Score: 68/100** (band: 61–80, "Mostly clean but some working capital or adjustment noise")

The single most important reason for this score: **cash-backed operating earnings are genuinely strong and improving — CFO has exceeded Adj. EBITDA for three straight years, reaching 115.7% in FY2025, with a shrinking working-capital cycle and no inventory, factoring, or capex games** — but **headline GAAP net income and EPS are not a clean read of the business** for FY2024–FY2025 because of back-to-back multi-billion-dollar non-cash deferred-tax valuation-allowance releases ($5,758mm and $4,346mm) plus a volatile, non-operating investment mark-to-market line. The score is capped below the 81–100 band by this combination — a real distortion to the metric (GAAP EPS) most investors read first, plus a ~24–25% slice of Adj. EBITDA's own add-backs that is not itemized in this data pool — even though the more reliable cash-flow-based earnings measure (CFO/FCF) shows minimal noise.

## 10. The Single Biggest Quality Concern

The single biggest risk that reported earnings overstate economic reality is the GAAP EPS/net-income series for FY2024 and FY2025, which was inflated in both years by a non-cash deferred-tax valuation-allowance release ($5,758mm in FY2024, $4,346mm in FY2025 — together explaining the bulk of the $8,288mm and $6,441mm gaps to the company's own Normalized Net Income) [4][9]. This is a legitimate, disclosed GAAP accounting event — once a company shows sustained profitability it must reassess and often release a valuation allowance against previously unrecognized net operating loss carryforwards, which are shrinking accordingly (Total NOL carryforward: $43,733mm FY2023 → $31,443mm FY2025) [10] — but it is non-operating, non-cash, and (having now recurred two years running) risks being extrapolated by anyone reading headline GAAP EPS growth (+4.56 → +4.73, a modest 3.6% increase that masks how distorted both numbers already are) as if it reflects the operating trend. It does not: the company's own normalized diluted EPS (0.73 → 1.70, +133%) and CFO (+42% YoY FY2025) are the cleaner, cash-backed measures of Uber's actual earnings trajectory, and both show a business genuinely improving rather than one manufacturing its growth story through cash.

## 11. Citations

[1] CIQ export — Uber Technologies Inc NYSE UBER Financials.xls, Segments tab, "Total EBITDA" row (FY2021–FY2025, company-defined Adjusted EBITDA)
[2] CIQ export — Uber Technologies Inc NYSE UBER Financials.xls, Cash Flow tab (FY2021–FY2025 + LTM "Press Release Jun-30-2026" column)
[3] CIQ export — Uber Technologies Inc NYSE UBER Financials.xls, Cash Flow tab, "Other Operating Activities" row
[4] CIQ export — Uber Technologies Inc NYSE UBER Financials.xls, Income Statement tab (FY2021–FY2025 + LTM "Press Release Jun-30-2026" column)
[5] Uber Technologies, Inc., Q2 2026 Earnings Call transcript, Aug-05-2026, CEO Dara Khosrowshahi prepared remarks (verbatim, S&P Global Market Intelligence transcript)
[6] CIQ export — Uber Technologies Inc NYSE UBER Financials.xls, Balance Sheet tab (FY2021–FY2025 year-end + "Press Release Jun-30-2026" column)
[7] CIQ export — Uber Technologies Inc NYSE UBER Financials.xls, Ratios tab, "Short Term Liquidity" and "Asset Turnover" sections (FY2021–FY2025 + LTM)
[8] Uber Technologies, Inc., Q2 2026 Earnings Call transcript, Aug-05-2026, CFO Balaji Krishnamurthy, Q&A (verbatim); cross-checked against `01_historical-financials.md` §3
[9] CIQ export — Uber Technologies Inc NYSE UBER Financials.xls, Income Statement tab, "Normalized Net Income" and "Normalized Diluted EPS" supplemental rows
[10] CIQ export — Uber Technologies Inc NYSE UBER Financials.xls, Supplemental tab, "Total NOL C/F" row (FY2023–FY2025)
[11] `analyses/UBER_2026-08-06/earnings/01_historical-financials.md` — upstream historical-financials output, used for cross-checks throughout
