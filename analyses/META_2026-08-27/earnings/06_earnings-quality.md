# Earnings Quality — META

Reporting standard: US GAAP. Currency: USD millions except per-share items. Fiscal year end: December 31. All figures reused from `01_historical-financials.md` are cited to it directly; figures newly extracted for this report are cited to the FY2025 10-K (filed Jan-29-2026) and the Capital IQ Financials_Annual/Quarterly exports (data as of Aug-26-2026, used only where no 10-K line exists for FY2021–FY2022, since no FY21/FY22 10-K sits in this data pool).

## 1. EBITDA → CFO → FCF Bridge (5 years)

| Item | FY2021 | FY2022 | FY2023 | FY2024 | FY2025 | Trend |
|---|---:|---:|---:|---:|---:|---|
| EBITDA (EBIT + D&A, calc) | 54,720 | 42,241 | 57,929 | 84,820 | 101,892 | Inflecting — FY22 trough, re-accelerated, FY25 margin dip [01_historical-financials §1] |
| Working capital change | +700 | +5,683 | +3,836 | +1,048 | (885) | Deteriorating — a growing cash source through FY2023, shrinking since, a cash use in FY2025 |
| Tax paid (cash) | (8,525) | (6,407) | (6,607) | (10,554) | (7,578) | Volatile |
| Interest paid (cash, net of capitalized) | Not disclosed (no FY21/22 10-K in pool) | Not disclosed | (448) | (486) | (696) | Rising — small in absolute terms |
| Other operating items (plug — mainly stock-based compensation, plus deferred taxes, non-cash impairments/gains, and book-tax-vs-cash-tax timing; see note below) | 10,788 | 8,958 | 16,403 | 16,500 | 23,067 | Rising — tracks SBC growth |
| **CFO** | **57,683** | **50,475** | **71,113** | **91,328** | **115,800** | Inflecting — dipped FY22, accelerated since |
| Total capex (property & equipment purchases; split not disclosed) | 18,690 | 31,186 | 27,045 | 37,256 | 69,691 | Accelerating sharply |
| **FCF (company-defined: CFO − PP&E capex − finance-lease principal, per company's own FY23–25 reconciliation; FY21–22 = CFO − PP&E capex only, narrower basis — methodology break, see note)** | **38,993** | **19,289** | **43,010** | **52,103** | **43,585** | Volatile — down in FY2025 despite CFO growth |
| **CFO / EBITDA %** | **105.4%** | **119.5%** | **122.8%** | **107.7%** | **113.6%** | Consistently >100% — cash conversion exceptionally strong every year |

**Capex split not disclosed — total capex used.** Meta does not break out maintenance versus growth capex in any filing in this data pool. FCF above therefore nets total capex against CFO and may understate the truly "maintenance" component of recurring free cash flow, though the far bigger issue in FY2025–2026 is that total capex itself has grown +87% (FY2025) and is running +71.2% YoY on a TTM basis [01_historical-financials §2], swamping any maintenance/growth distinction.

**"Other operating items" row, shown not asserted.** This is a residual that reconciles EBITDA to CFO once working capital, cash taxes paid, and cash interest paid are removed. For FY2023–FY2025 it is built from the 10-K's own itemized reconciliation (Net income + D&A + share-based compensation (SBC) + deferred income taxes + unrealized gains/losses on equity investments + impairment charges + other, plus the working-capital changes above), which sums exactly to the reported CFO in every year [FY2025 10-K, Consolidated Statements of Cash Flows, p.91–92]. SBC is the dominant component — $14,027m (FY2023), $16,690m (FY2024), $20,427m (FY2025) — roughly 85–90% of the plug in each year; the remainder is deferred taxes, non-cash impairments/gains, and the gap between book tax expense and cash taxes actually paid. For FY2021–FY2022 (no 10-K in this pool), the plug is derived from Capital IQ's standardized Cash Flow tab and is therefore an approximation, not an exact reconciliation — flagged accordingly.

**Normalised operating FCF is not needed as a separate lead figure here (§15 check).** No year's FCF is inflated by a one-off cash item or a non-standard company add-back. The FY2025 CFO reconciliation includes a large positive "deferred income taxes" adjustment (+$18,738m, versus −$4,738m in FY2024), but this is the non-cash reversal of a one-time non-cash tax CHARGE (the $15.93bn OBBBA valuation-allowance charge — see §5), which DEPRESSED reported net income; adding it back in the CFO walk is standard mechanics, not an inflator. The one genuine one-off cash item in the period — the $2.55bn "Proceeds from Venture distribution" (Oct 2025, see §5) — sits in investing activities, not operating activities, and does not touch CFO or the company's own FCF definition at all [FY2025 10-K, Consolidated Statements of Cash Flows, p.91]. The FY2025/TTM FCF decline is real and capex-driven, not an accounting artifact.

## 2. Cash Conversion Assessment

CFO has tracked, and in every one of the last five years exceeded, EBITDA — CFO/EBITDA (cash generated for every $1 of EBITDA the company books) has run from 105% to 123% every year FY2021–FY2025, comfortably above the 70% "healthy" bar and never close to the 50% red-flag line [FY2025 10-K, Consolidated Statements of Cash Flows and Income Statement, p.89, 91–92]. The trajectory dipped in FY2022 (119.5%, still strong) and again in FY2024 (107.7%) as EBITDA re-accelerated faster than the cash items reconciling it, then recovered to 113.6% in FY2025. Reported earnings at META are, on this measure, unambiguously cash-backed — the gap between CFO and reported net income (which fell in FY2025 versus EBITDA/EBIT because of a one-off tax charge, not a cash issue) actually favors cash over the accrual figure, not the other way around.

## 3. Working Capital Trends

| Metric | FY2023 | FY2024 | FY2025 | Direction | Risk |
|---|---:|---:|---:|---|---|
| Receivable days (DSO = 365 × average AR ÷ revenue) | 40.1 | 36.8 | 33.4 | Improving (faster collection) | Low |
| Inventory days (DIO) | Not disclosed / not material | Not disclosed / not material | Not disclosed / not material | Not assessable | N/A — Meta reports no separate inventory line; Reality Labs hardware and content costs are embedded in cost of revenue with no material balance-sheet inventory disclosed [FY2025 10-K, Note 1 — Cost of Revenue / Content Costs, p.95] |
| Payable days (DPO = 365 × average AP ÷ COGS) | 69.2 | 75.9 | 83.6 | Rising — stretching suppliers | Medium |
| Cash conversion cycle (DSO − DPO; DIO excluded — not disclosed) | (29.1) | (39.1) | (50.2) | Increasingly negative — collects faster than it pays, by a widening margin | Low (favors META's cash position) |

Average balances (opening + closing) / 2 are used throughout. AR: FY2023 $13,466m→$16,169m; FY2024 $16,169m→$16,994m; FY2025 $16,994m→$19,769m. AP: FY2023 $4,990m→$4,849m; FY2024 $4,849m→$7,687m; FY2025 $7,687m→$8,894m. COGS (cost of revenue): FY2023 $25,959m; FY2024 $30,161m; FY2025 $36,175m [FY2025 10-K, Consolidated Balance Sheets p.88, Consolidated Statements of Income p.89; Capital IQ Financials_Annual export for the FY2022 opening AR/AP balances, data as of Aug-26-2026].

**Flags checked:** DSO fell (not rose) every year — no flag. DIO not assessable — no inventory disclosed. DPO rose +9.7% (FY2024) and +10.1% (FY2025), a cumulative +21% over two years (69.2→83.6 days) — this crosses into "rising sharply" territory and is flagged Medium: it modestly stretches suppliers, though it happens alongside a genuine multi-year cash-conversion improvement (falling DSO, deeply negative and widening cash conversion cycle) rather than a liquidity strain — Meta's cash and marketable securities balance ($81.6bn at FY2025 year-end) [FY2025 10-K, Item 7 MD&A — Overview highlights] gives no indication this is funding-driven.

## 4. Non-GAAP Adjustments

| Adjustment | Amount | Recurring? (Y/N) | Concern Level (Low / Mid / High) | Evidence |
|---|---:|---|---|---|
| Revenue / advertising revenue excluding FX effect | Disclosed each quarter, not material distortion currently | Y | Low — standard FX-neutral disclosure, no earnings inflation | [Q2 FY26 Earnings Release, Non-GAAP Reconciliation, p.9] |
| Free Cash Flow (non-GAAP: CFO − PP&E capex − finance-lease principal) | FY2025 $43,585m | Y | Low — fully reconciled to CFO and capex line items each quarter, standard definition | [FY2025 10-K, Item 7 MD&A, p.78] |
| Pro-forma EPS excluding one-time tax items (Q3 FY25, Q1 FY26) | +$6.20/sh (Q3'25), −$3.13/sh (Q1'26) | N — tied to specific one-time law changes (OBBBA, CAMT transitional relief), not a recurring adjustment | Low-Mid — legitimate and clearly sourced to discrete, named law changes, but a reader relying only on the adjusted figures would miss two real quarters of GAAP tax-line volatility | [Q2 FY26 Investor Presentation, footnotes 1–2, p.2; Q1 FY26 Investor Presentation] |

Meta does **not** disclose an adjusted EBITDA, adjusted EBIT, or adjusted net income measure of any kind — the only two recurring non-GAAP measures are FX-neutral revenue and free cash flow [FY2025 10-K and Q2 FY26 Earnings Release, Non-GAAP Reconciliation, p.9]. This is a genuinely disciplined non-GAAP posture relative to large-cap technology peers and is a positive earnings-quality signal on its own — there is no "adjusted EPS" bucket into which recurring costs (like SBC) can be quietly excluded.

## 5. One-Off Items (last 3 years + latest interim)

| Item | Period | Amount | Classification (Genuine / Suspicious / Recurring "one-off") | Evidence |
|---|---|---:|---|---|
| OBBBA tax valuation-allowance charge (non-cash, mostly a $14.03bn valuation allowance against US federal deferred tax assets, remainder from reduced FDII benefit) | Q3 FY2025 | $15.93bn (pre-tax-line charge; +17pp to the FY2025 effective tax rate, which would otherwise have been ~13% instead of 30%) | Genuine — discrete, law-change-driven, fully disclosed with a reconciliation table; depresses (not inflates) reported earnings | [FY2025 10-K, Note 14 — Income Taxes, p.121; Item 7 MD&A Overview, "Effective tax rate was 30%..."] |
| CAMT transitional-relief tax benefit (Treasury Notice 2026-7) | Q1 FY2026 | $8.03bn benefit (+$3.13/sh pro-forma impact) | Genuine — discrete, law-change-driven | [Q1 FY26 Investor Presentation footnote 2; 01_historical-financials §4] |
| Impairment charges for facilities consolidation | FY2023 $2,432m; FY2024 $383m; FY2025 $0 | Genuine — real-estate related, declining to zero over the period, not a recurring pattern going forward on this evidence | [FY2025 10-K, Consolidated Statements of Cash Flows, p.91] |
| "Venture" data-center joint venture formation (Louisiana campus, ~20% Meta stake, ~$27bn total committed development cost across all partners) — Meta contributed $4.30bn of held-for-sale assets and received a one-time $2.55bn cash distribution | Q4 2025 | $2.55bn cash distribution (investing activities, does not touch CFO or FCF); $4.30bn assets contributed; up to $45.95bn total disclosed maximum exposure to loss (equity stake + lease commitments + future fundings + residual value guarantees) | Genuine, but structurally significant — a real, one-time transaction that also shifts a large slice of AI infrastructure spend into an unconsolidated VIE, off Meta's own balance sheet and capex line | [FY2025 10-K, Note 5 — Non-Marketable Equity Investments, p.105–106] |

## 6. Accrual Quality Flags

| Flag | Triggered (Y/N) | Evidence |
|---|---|---|
| Revenue growing faster than CFO for 2+ years | N | Revenue grew +21.9% (FY2024) and +22.2% (FY2025); CFO grew faster in both years, +28.4% and +26.8% respectively [01_historical-financials §1] |
| Receivables growing faster than revenue | N | AR grew +5.1% (FY2024) and +16.3% (FY2025), both below revenue growth of +21.9% and +22.2% — DSO fell in both years (§3) |
| Inventory growing faster than COGS | Not assessable | No inventory line disclosed (§3) |
| Deferred revenue declining (if subscription/contract business) | N | Deferred revenue rose from $772m (FY2024) to $1.08bn (FY2025), +40% — small in absolute size (~0.5% of revenue) but growing, not declining [FY2025 10-K, Note on Revenue, p.101–102] |
| Capitalized costs growing as % of revenue | N | Software development and content costs are explicitly disclosed as "not material to date" — expensed as incurred, not capitalized [FY2025 10-K, Note 1 — Software Development Costs / Content Costs, p.95] |
| Frequent accounting policy changes | N (one material change on this evidence) | One disclosed estimate change in the period covered by this filing — the January 2025 useful-life extension (§8) — but this data pool contains only the FY2025 10-K, so "frequent" is not proven from available data; this single change is material and addressed in §8 instead |

None of the six flags above are triggered Y (two are Not assessable due to a genuine absence of an inventory line, not a red flag). **`RF-EQ-001` is NOT emitted** — accrual quality here tracks cash cleanly; if anything, cash generation is running ahead of accrual earnings, the opposite of the pattern the flag exists to catch.

## 7. Reported vs Adjusted Reconciliation

| Metric | Reported | Adjusted | Difference | % of Reported | Recurring? | Evidence |
|---|---:|---:|---:|---:|---|---|
| EBITDA | Not a company-reported metric (101,892, this agent's own calc) | — | — | — | — | Company discloses no adjusted or GAAP EBITDA line [01_historical-financials §4] |
| EBIT | 83,276 (FY2025 GAAP "Income from operations") | — | — | — | — | Company discloses no adjusted operating-income measure |
| Net income, FY2025 | 60,458 | 76,388 (this agent's own calculation: reported net income + the $15.93bn OBBBA one-time charge, added back at face value since it ran entirely through the tax line with no further tax effect to unwind) | +15,930 | +26.3% | N — tied to a specific, one-time law change (§5) | [FY2025 10-K, Note 14, p.121; this agent's calc, "Inference, not from filings" for the full-year adjusted figure — the company itself disclosed only the underlying charge amount and its quarterly EPS effect, not a full-year adjusted net income] |
| EPS (diluted), FY2025 | $23.49 | $29.69 (own calc: adjusted net income ÷ 2,574m diluted weighted-average shares) | +$6.20 | +26.4% | N | Same basis as above; diluted share count from [FY2025 10-K, Consolidated Statements of Income, p.89] |
| EPS (diluted), Q3 FY2025 (company-disclosed pro-forma, not this agent's estimate) | $1.05 | $7.25 | +$6.20 | +590% (quarter distorted almost entirely by the one-off) | N | [Q2 FY26 Investor Presentation footnote 1, p.2; 01_historical-financials §4] |
| EPS (diluted), Q1 FY2026 (company-disclosed pro-forma) | $10.44 | $7.31 | −$3.13 | −30.0% | N | [Q1 FY26 Investor Presentation footnote 2; 01_historical-financials §4] |

The full-year FY2025 "adjusted" net income/EPS row above is this agent's own arithmetic, not a company-published figure — Meta discloses the discrete charge and its quarterly EPS effect but does not publish a full-year adjusted net income. It is shown to make the scale of the one-off transparent (roughly a quarter of reported net income), not as a substitute headline number.

## 8. Accounting Trap Checklist

*(Severity is inverted: higher = WORSE.)*

| Trap | Triggered? (Y/N) | Evidence | Severity /100 |
|---|---|---|---:|
| Stock-based compensation excluded from adjusted earnings | N | Meta publishes no adjusted EBITDA/EBIT/EPS measure of any kind, so there is no bucket from which SBC could be excluded — SBC always sits inside reported GAAP figures (§4) | 0 |
| Restructuring costs recur every year | N | Facilities-consolidation impairment charges declined from $2,432m (FY2023) to $383m (FY2024) to $0 (FY2025) — ending, not recurring [FY2025 10-K, Cash Flow Statement, p.91] | 10 |
| Capitalized costs rising faster than revenue | N | Software/content development costs explicitly stated "not material to date" — expensed, not capitalized (§6) | 5 |
| Receivable factoring / supplier finance disclosed | N | No factoring or supplier-finance program disclosed anywhere in the FY2025 10-K | 0 |
| Inventory write-downs or reserve releases | Not assessable | No inventory line disclosed | 0 |
| Revenue recognized before cash collection risk is clear | N | Standard ASC 606 advertising recognition; allowance for credit losses on AR "not material" for FY2025 and FY2024; DSO falling, not rising (§3) [FY2025 10-K, Note 1 — Accounts Receivable and Allowances, p.98] | 5 |
| Change in useful life / depreciation assumptions | **Y** | January 2025 extension of the useful life of most servers and network assets to 5.5 years reduced FY2025 depreciation by $2.92bn and increased net income by $2.59bn, or $1.00 per diluted share (≈4.3% of the year's $23.49 reported diluted EPS) — a real, audited, disclosed estimate change, but a material and non-cash boost to reported earnings at the exact moment capex (and the asset base it depreciates) is accelerating fastest [FY2025 10-K, Note 1 — Use of Estimates, p.93–94; Item 7 MD&A — Cost of Revenue discussion] | 60 |
| Tax rate unusually low or boosted by one-off | **Y** | Cuts both ways: FY2024 effective tax rate was unusually LOW at 11.8% (vs the 21% US statutory rate), driven by a −4.9pp foreign-derived intangible income deduction, −3.7pp share-based-compensation benefit, and −2.9pp R&D credits; FY2025 was unusually HIGH at 29.6% (vs ~13% absent the one-off OBBBA charge). Both are well-reconciled and explained, but the swings are large enough to distort period-over-period earnings comparability if read without the tax note [FY2025 10-K, Note 14 — Income Taxes, p.121–122] | 35 |
| Large fair-value / mark-to-market gains | Y | Unrealized gain on equity investments rose from $53m (FY2024) to $1,138m (FY2025) — a growing but still modest 1.9% of FY2025 net income | 15 |

## 9. Earnings Quality Score

**Score: 74/100 — Band 61–80 (Mostly clean but some working capital or adjustment noise).**

The single most important reason for the score: cash conversion is exceptional and consistent — CFO has exceeded EBITDA in every one of the last five years (105%–123%, §2) — and Meta runs one of the more disciplined non-GAAP postures among large-cap technology peers (no adjusted EBITDA/EPS bucket at all, §4). That alone would support a score in the 80s. What keeps the score in the 70s rather than the 80s is two real, disclosed items that both flatter or obscure the picture at the same time capex is accelerating fastest: a useful-life extension that lifted FY2025 diluted EPS by roughly $1.00 (≈4.3%, §8), and a $27bn data-center joint venture structured so that a large piece of AI infrastructure spend sits outside Meta's own consolidated capex line and balance sheet (§5). Neither is manipulation — both are fully disclosed and audited — but both reduce how cleanly the reported numbers describe the true scale of capital being deployed right now.

## 10. The Single Biggest Quality Concern

The cash-generation engine itself is not in question — CFO has outrun EBITDA every year for five years running, and free cash flow's -20.4% TTM decline is a real, transparent, capex-driven story (capex +71.2% TTM YoY), not an accounting artifact (§1–2). The single biggest quality concern is instead that reported figures are, at the margin, prettier and smaller than the underlying capital reality on two fronts at once: (1) a January 2025 change in the useful life of servers and network assets added back roughly $1.00 to FY2025 diluted EPS through a purely non-cash reduction in depreciation, right as the asset base being depreciated is growing fastest — a favorable assumption that carries increasing earnings leverage exactly when it is hardest to verify against limited real-world AI-hardware service-life history; and (2) the October 2025 "Venture" data-center joint venture keeps roughly $27bn of committed infrastructure spend (Meta's pro rata share of the total) out of Meta's own consolidated capex and balance sheet, with Meta's own disclosed maximum exposure running to $45.95bn including residual value guarantees. Individually, each is a disclosed, audited, and reasoned accounting or structuring choice, not a red flag on its own. Together, at a moment when Meta's capex is already growing far faster than revenue, they mean the GAAP earnings and capex figures the market is pricing modestly understate both how favorable a recent estimate change has been to reported profit and how much total capital is actually being committed to the AI buildout.
