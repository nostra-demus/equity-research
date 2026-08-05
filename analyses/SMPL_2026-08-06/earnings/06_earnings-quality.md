# Earnings Quality — SMPL

**Jurisdiction / basis:** US domestic filer (Nasdaq: SMPL), US GAAP, reporting currency USD millions unless stated otherwise. Fiscal year ends the last Saturday in August; FY2024 was a 53-week year. [FY2025 10-K, cover page and Note 2]. Upstream historical-financials output (`analyses/SMPL_2026-08-06/earnings/01_historical-financials.md`) is available and used as the baseline for this report; figures are independently re-derived from the primary cash-flow, balance-sheet, and income-statement data in the pool and cross-checked to it.

**Read this before the tables:** the single dominant fact in this pool is a $391.9 million combined goodwill/brand intangible impairment recognized across three of the last four fiscal quarters (FQ4 FY2025 $60.9M Atkins; FQ2 FY2026 $249.0M OWYN/Atkins/goodwill; FQ3 FY2026 $82.0M OWYN/Atkins/goodwill) [FY2025 10-K, Income Statement; Q2 FY2026 10-Q MD&A; Q3 FY2026 10-Q, Note 4 (Goodwill and Intangibles)]. This is a non-cash charge, so it does not by itself break cash conversion — but the company's own Adjusted EBITDA (its primary non-GAAP KPI) excludes it every time, and the repetition (three write-downs in four quarters, against acquisitions made in FY2024 and earlier) is itself an earnings-quality signal: it shows the "clean" number investors are pointed to has excluded a real, recurring pattern of value destruction from prior M&A, not a single unusual event.

## 1. EBITDA → CFO → FCF Bridge (5 years, USD millions)

| Item | FY2021 | FY2022 | FY2023 | FY2024 (53wk) | FY2025 | Trend |
|---|---:|---:|---:|---:|---:|---|
| EBITDA (GAAP, company-defined) | 196.1 | 222.2 | 225.2 | 228.8 | 177.9 | Deteriorating |
| Working capital change | (22.1) | (81.0) | (18.5) | +19.0 | (32.9) | Deteriorating (source of cash in FY24, use of cash in FY25) |
| Tax paid (cash) | (32.2) | (49.2) | (27.4) | (33.2) | (39.3) | Volatile |
| Interest paid (cash) | (27.8) | (19.2) | (25.5) | (25.7) | (22.0) | Volatile |
| Other operating items (non-cash add-backs — SBC, impairment, deferred tax, bad-debt provision, other; D&A cancels out algebraically since GAAP EBITDA already adds it back before subtraction to net income) | +18.1 | +37.9 | +17.4 | +26.9 | +94.7 | Volatile — FY25 spike driven by the $60.9M non-cash impairment add-back |
| **CFO** | **132.1** | **110.6** | **171.1** | **215.7** | **178.5** | Deteriorating (FY25 down 17.2% YoY) |
| Maintenance capex | Not disclosed | Not disclosed | Not disclosed | Not disclosed | Not disclosed | — |
| Growth capex | Not disclosed | Not disclosed | Not disclosed | Not disclosed | Not disclosed | — |
| Total capex | 5.9 | 5.2 | 11.6 | 5.7 | 20.5 | Deteriorating (FY25 +260% YoY, unexplained in filings) |
| **FCF (CFO − Total Capex)** | **126.2** | **105.4** | **159.5** | **210.0** | **157.9** | Deteriorating (FY25 down 24.8% from FY24 peak) |
| **CFO / EBITDA %** | 67.4% | 49.8% | 76.0% | 94.3% | 100.3% | Improving, but the FY24–FY25 spike is partly a denominator effect (GAAP EBITDA itself falling) rather than pure cash-conversion strength |

**Capex split not disclosed — total capex used. FCF may understate true recurring free cash flow.** SMPL states only that it "operate[s] an asset-light business model" using third-party contract manufacturers and that capex is "targeted" [FY2025 10-K, Item 1, p. business section]; no breakdown of maintenance vs growth spend is given in the 10-K or 10-Qs in this pool. The FY2025 jump to $20.5M (and further to $28.1M on a trailing-twelve-month basis, per `01_historical-financials.md` Section 2) is not explained by any capex-specific disclosure found in this pool — flagged as a limitation, not assumed to be growth spend.

**Normalised vs reported FCF (§15 check):** no evidence of a one-off cash item (e.g., a large customer advance) inflating any year's reported FCF, and the company does not define FCF differently from the standard CFO − capex convention used above (it does not publish its own FCF metric at all). Reported FCF above is therefore the correct lead figure; no normalisation adjustment is required.

Sourcing: EBITDA and CFO figures are the company's own GAAP figures (FY2023–FY2025 from the FY2025 10-K three-year statements; FY2021–FY2022 from the Capital IQ annual export, which equals GAAP for those two years per `01_historical-financials.md` Section 1, since SMPL had zero reclassified unusual items in FY2021–FY2022). Working-capital, tax-paid, and interest-paid lines are from the Capital IQ Financials_Annual.xls Cash Flow tab (supplemental items and the four working-capital change rows), cross-checked to sum to the company's own reported CFO for each year to within rounding. [The Simply Good Foods Company NasdaqCM SMPL Financials_Annual.xls, Cash Flow tab; FY2025 10-K, Consolidated Statements of Cash Flows]

## 2. Cash Conversion Assessment

On a GAAP basis, CFO has tracked EBITDA reasonably well through FY2023–FY2025 — conversion ran 76% (FY2023), 94% (FY2024), and 100% (FY2025), all comfortably above the 70% "healthy" threshold — but FY2021–FY2022 were weaker (67% and 50%), driven by working-capital build in those years (inventory and receivables growing as the company scaled post-IPO). The trajectory changes sharply in the trailing twelve months: GAAP EBITDA has swung to $(213.1)M (negative) because of the $391.9M impairment discussed above, making a GAAP CFO/EBITDA ratio not meaningful for that period; on the company's own Adjusted EBITDA (which excludes the impairment and other add-backs), conversion was 80.1% in FY2024, fell to 64.1% in FY2025, and further to 62.9% on the Latest TTM (Adjusted EBITDA $234.6M vs CFO $147.5M) [FY2025 10-K MD&A; Q3 FY2026 10-Q MD&A; `01_historical-financials.md` Section 2]. **Neither the GAAP-EBITDA basis (FY2023–FY2025: 76%/94%/100%) nor the Adjusted-EBITDA basis (FY2024–TTM: 80%/64%/63%) shows CFO/EBITDA below 50% for 2 or more of the last 3 years — the cash-conversion-breakdown trigger is NOT met, and `RF-EQ-002` is not emitted.** The more accurate read is: cash conversion off the company's clean KPI is weakening (80%→64%→63%) even though it has not broken down, and the GAAP-basis collapse is a non-cash accounting event, not a cash-generation collapse.

## 3. Working Capital Trends

| Metric | FY2023 | FY2024 | FY2025 | Direction | Risk |
|---|---:|---:|---:|---|---|
| Receivable days (DSO) | 40.8 | 40.5 | 39.7 | Stable / mildly improving | Low |
| Inventory days (DIO) | 56.0 | 57.8 | 61.1 | Rising (+9.1% cumulative FY23→FY25) | Medium — inventory building faster than COGS two years running |
| Payable days (DPO) | 26.6 | 24.9 | 27.0 | Volatile, no clear stretch | Low |
| Cash conversion cycle (DSO + DIO − DPO) | 70.2 | 73.5 | 73.8 | Lengthening (+3.6 days over two years) | Medium — entirely driven by the DIO build, not by AR or AP |

**Formulas used:** DSO = 365 × average receivables ÷ revenue; DIO = 365 × average inventory ÷ COGS; DPO = 365 × average payables ÷ COGS (purchases not separately disclosed). Averages use (opening + closing) ÷ 2 for each fiscal year, drawn from the Capital IQ annual balance sheet (Accounts Receivable, Inventory, Accounts Payable rows) and the annual income statement (Cost Of Goods Sold row) [The Simply Good Foods Company NasdaqCM SMPL Financials_Annual.xls, Balance Sheet and Income Statement tabs]. No single year's DSO, DIO, or DPO move exceeds the 10%/15% thresholds that would mechanically flag a red flag on its own (largest single-year DIO move is FY25's +5.8%), but the two-year cumulative DIO trend (56.0 → 57.8 → 61.1 days, +9.1%) is a genuine, sustained build worth flagging — consistent with `01_historical-financials.md`'s finding of decelerating gross margin and a demand slowdown (four consecutive quarters of YoY revenue decline through FQ3 FY2026), which raises the risk that some of this inventory is building against softening sell-through rather than growth.

## 4. Non-GAAP Adjustments

| Adjustment | Amount | Recurring? (Y/N) | Concern Level | Evidence |
|---|---:|---|---|---|
| Loss on impairment (goodwill/brand intangibles) | $391.9M cumulative over FQ4 FY2025–FQ3 FY2026 ($60.9M + $249.0M + $82.0M) | Y — 3 of the last 4 fiscal quarters | High | [FY2025 10-K, Income Statement; Q2 FY2026 10-Q MD&A; Q3 FY2026 10-Q, Note 4] |
| Stock-based compensation, excluded from Adjusted EBITDA | $18.4M FY2024; $15.3M FY2025; $5.6M FQ3 FY2026 | Y — every period | Mid | [FY2025 10-K MD&A, "Reconciliation of EBITDA and Adjusted EBITDA"; Q3 FY2026 10-Q MD&A] |
| Integration expense (OWYN acquisition) | $0.6M FY2024; $20.9M FY2025; $5.2M FQ3 FY2026 | Y — every period since the FY2024 acquisition | High — labelled non-recurring by the company but has recurred in every reported period for two-plus years | [FY2025 10-K MD&A; Q3 FY2026 10-Q MD&A] |
| Business-transaction costs (OWYN deal) | $14.5M FY2024; $0.8M FY2025 | N — deal-specific, tapering to near zero | Low | [FY2025 10-K MD&A] |
| Restructuring / other | $13.5M FQ3 FY2026 (13wk); net $0.2M FY2025 | Mixed — reappeared in FY2026 after being negligible in FY2025 | Mid | [Q3 FY2026 10-Q MD&A; FY2025 10-K MD&A] |
| Executive-transition costs | $3.9M FY2024 | N | Low | [FY2025 10-K MD&A, FY2024 column] |
| Inventory step-up (purchase accounting) | $3.2M FY2024; $1.4M FY2025 | N — deal-specific | Low | [FY2025 10-K MD&A] |
| Term-loan transaction fees | $0.7M FY2025 | N | Low | [FY2025 10-K MD&A] |

The FY2025 adjustment total ($100.2M) is 56.3% of GAAP EBITDA ($177.9M) — well above the 15% materiality threshold; FY2024's adjustment total ($40.4M) is 17.7% of GAAP EBITDA ($228.8M) — also above threshold. For FQ3 FY2026, the adjustment ($101.1M) exceeds GAAP EBITDA in absolute size (GAAP EBITDA is negative $(43.8)M that quarter), so the ratio is not meaningful, but in dollar terms the gap between reported and adjusted results is the largest in the five-year dataset. Company definition: "EBITDA" is net income before interest, tax, D&A; "Adjusted EBITDA" further excludes loss on impairment, SBC, business-transaction costs, inventory step-up, integration expenses, term-loan fees, restructuring, and other non-core expenses [Q3 FY2026 10-Q MD&A]. SBC is excluded from the company's own "clean" earnings metric every single period — this is the classic non-GAAP trap named in this module's mandate.

## 5. One-Off Items (last 3 fiscal years / trailing quarters)

| Item | Period | Amount | Classification | Evidence |
|---|---|---:|---|---|
| Atkins brand impairment | FQ4 FY2025 (13wk ended Aug-30-25) | $60.9M | Recurring "one-off" — first of three impairments inside four quarters | [FY2025 10-K, Income Statement, Asset Writedown line; MD&A] |
| OWYN + Atkins + goodwill impairment | FQ2 FY2026 (13wk ended Feb-28-26) | $249.0M | Recurring "one-off" | [Q2 FY2026 10-Q MD&A; `01_historical-financials.md` Section 4] |
| OWYN ($13.0M) + Atkins ($31.0M) + goodwill ($38.0M) impairment | FQ3 FY2026 (13wk ended May-30-26) | $82.0M | Recurring "one-off" | [Q3 FY2026 10-Q, Note 4 (Goodwill and Intangibles)] |
| OWYN acquisition business-transaction costs | FY2024 | $14.5M | Genuine one-off (deal-specific) | [FY2025 10-K MD&A, FY2024 column] |
| Executive-transition costs | FY2024 | $3.9M | Genuine one-off | [FY2025 10-K MD&A] |
| Tax benefit from wind-down of legacy Canadian subsidiary | 39 weeks ended May-30-2026 | Not separately quantified in dollars in the pool; described qualitatively as the primary driver of a lower effective tax rate vs the prior-year comparable period | Genuine one-off, but it flatters the near-term reported net result / effective tax rate | [Q3 FY2026 10-Q, Income Tax discussion / MD&A] |
| CEO departure and change in principal accounting officer | Inside the same FQ4 FY2025–FQ2 FY2026 window as the first two impairments | N/A (governance event, not a P&L line) | Not classified as a financial one-off, but the coincidence in timing with the impairments is itself a flag — cross-referenced to `business-model/11_capital-allocation-governance.md` and `business-model/12_red-flags-sweep.md` per `01_historical-financials.md` Section 6 | [`01_historical-financials.md` Section 6] |

The through-line across every genuinely large item in this table is M&A-related: three impairments against OWYN, Atkins, and the associated goodwill, all stemming from acquisitions made in FY2024 and earlier. None of these are accounting manipulation — they are disclosed, quantified, and reconciled to the balance-sheet Goodwill/Intangibles notes — but calling any one of them a "one-off" is no longer accurate once it is the third occurrence in four quarters.

## 6. Accrual Quality Flags

| Flag | Triggered (Y/N) | Evidence |
|---|---|---|
| Revenue growing faster than CFO for 2+ years | Y | FY2022: revenue +16.2% while CFO fell −16.3% (to $110.6M from $132.1M); FY2025: revenue +9.0% while CFO fell −17.2% (to $178.5M from $215.7M). [Capital IQ Financials_Annual.xls, Income Statement and Cash Flow tabs; `01_historical-financials.md` Section 1] |
| Receivables growing faster than revenue | Y | FY2022: AR +19.0% vs revenue +16.2%; FY2023: AR +9.4% vs revenue +6.3%. FY2024 reversed (AR +3.9% vs revenue +7.1%); FY2025 was roughly matched (AR +9.5% vs revenue +9.0%). [Capital IQ Financials_Annual.xls, Balance Sheet and Income Statement tabs] |
| Inventory growing faster than COGS | Y | FY2024: inventory +21.9% vs COGS +3.5%; FY2025: inventory +17.7% vs COGS +13.1%. Two consecutive years, consistent with the DIO build in Section 3. [Capital IQ Financials_Annual.xls, Balance Sheet and Income Statement tabs] |
| Deferred revenue declining (if subscription/contract business) | N/A | SMPL is a branded CPG business selling through retail (Quest, Atkins, OWYN); no deferred revenue / contract-liability balance is disclosed in the 10-K or 10-Qs in this pool — not a subscription or long-term-contract revenue model, so this check does not apply. |
| Capitalized costs growing as % of revenue | Y | Capex was a steady 0.4–0.9% of revenue FY2021–FY2024, then jumped to 1.4% of revenue in FY2025 ($20.5M on $1,450.9M revenue) and 2.0% on a trailing-twelve-month basis ($28.1M on $1,392.2M TTM revenue) — a step-change not explained by any capex-specific disclosure found in this pool. [Capital IQ Financials_Annual.xls and Financials_Quarterly.xls, Cash Flow tabs; `01_historical-financials.md` Section 2] |
| Frequent accounting policy changes | N | The FY2025 10-K's "Recently Issued Accounting Pronouncements" discussion covers only routine, not-yet-effective FASB updates (e.g., ASU 2025-06 on internal-use software, effective FY2028+); no evidence found of a retrospective policy change, useful-life change, or restatement in the FY2023–FY2025 filings in this pool. [FY2025 10-K, Note 2; Q3 FY2026 10-Q, Note 2] |

**Four of the five applicable rows above are triggered Y (the deferred-revenue row is genuinely not applicable to this business model, not a "no" on the merits) — this clears the "2 or more" bar for rising accruals divergent from cash earnings.**

`RF-EQ-001 (rising accruals divergent from cash earnings)`

## 7. Reported vs Adjusted Reconciliation

| Metric | Reported | Adjusted | Difference | % of Reported | Recurring? | Evidence |
|---|---:|---:|---:|---:|---|---|
| EBITDA (FY2025) | $177.9M (GAAP) | $278.2M (company Adjusted EBITDA) | $100.2M | 56.3% | Yes — impairment, SBC, and integration expense recur every period (Section 4) | [FY2025 10-K MD&A] |
| EBITDA (Latest TTM, to May-30-26) | $(213.1)M (GAAP) | $234.6M (company Adjusted EBITDA, agent-derived TTM sum per `01_historical-financials.md` Section 2) | $447.7M | Not meaningful (negative reported base) | Yes | [FY2025 10-K MD&A; Q1–Q3 FY2026 10-Qs MD&A] |
| EBIT | $156.9M (GAAP Income from Operations, FY2025, per company 10-K) | Not disclosed | — | — | — | Company reconciles net income → EBITDA → Adjusted EBITDA only; it does not publish an adjusted operating-income figure. [FY2025 10-K; `01_historical-financials.md` Section 4] |
| Net income | $103.6M (GAAP, FY2025) | Not disclosed by the company | — | — | — | The company does not reconcile an adjusted net income figure. Capital IQ separately publishes a vendor-computed "Normalized Net Income" of $137.4M for FY2025 — this is a data-vendor normalization, not a company-disclosed figure, and is cited here under Capital IQ's own name, not the company's. [Capital IQ Financials_Annual.xls, Income Statement tab, "Normalized Net Income" row] |
| EPS (diluted) | $1.02 (GAAP, FY2025) | Not disclosed by the company | — | — | — | Same caveat as net income. Capital IQ's vendor-computed "Normalized Diluted EPS" for FY2025 is $1.354 — cited under Capital IQ's name only, never presented as the company's own adjusted EPS. [Capital IQ Financials_Annual.xls, Income Statement tab, "Normalized Diluted EPS" row] |

## 8. Accounting Trap Checklist

*(Severity column is inverted per CLAUDE.md §12 — higher score = worse.)*

| Trap | Triggered? (Y/N) | Evidence | Severity /100 *(higher = WORSE — inverted)* |
|---|---|---|---:|
| Stock-based compensation excluded from adjusted earnings | Y | SBC ($15.3M FY2025, $18.4M FY2024, $5.6M FQ3 FY2026) is added back every period in the company's own EBITDA-to-Adjusted-EBITDA reconciliation. [FY2025 10-K MD&A] | 40 |
| Restructuring costs recur every year | Y | "Merger & Related Restructuring Charges" reappeared in FY2024 ($18.3M) after being zero FY2021–FY2023, then recurred FY2025 ($23.1M) and the trailing twelve months ($20.8M); a separate "Restructuring Charges" line reappeared at $18.1M on the LTM period. [Capital IQ Financials_Annual.xls, Income Statement tab] | 45 |
| Capitalized costs rising faster than revenue | Y | Capex rose from 0.4% of revenue (FY2024) to 1.4% (FY2025) to 2.0% (TTM), against 9.0% revenue growth in FY2025 and a revenue decline on the TTM. [Capital IQ Financials_Annual.xls / Financials_Quarterly.xls, Cash Flow tabs] | 35 |
| Receivable factoring / supplier finance disclosed | N | No factoring, receivables-sale, or supply-chain-finance program disclosed in the FY2025 10-K or the two FY2026 10-Qs in this pool. | 0 |
| Inventory write-downs or reserve releases | N | No inventory reserve, obsolescence, or write-down disclosure found in the pool documents — the DIO build in Section 3 is a volume/mix signal, not a disclosed write-down. | 0 |
| Revenue recognized before cash collection risk is clear | N | Standard retail-CPG revenue recognition on delivery/transfer of control; no evidence of channel-stuffing or bill-and-hold language in the filings reviewed. | 0 |
| Change in useful life / depreciation assumptions | N | No disclosed change in useful-life or depreciation-method assumptions found in Note 2 or the PP&E notes of the FY2025 10-K. | 0 |
| Tax rate unusually low or boosted by one-off | Y | The 39-week FY2026 effective tax rate was reduced by a tax benefit tied to the wind-down of a legacy Canadian subsidiary, on top of the tax effect of the non-deductible goodwill impairment. [Q3 FY2026 10-Q, Income Tax discussion] | 30 |
| Large fair-value / mark-to-market gains | N | No fair-value or mark-to-market gain line of any size found in the income statement or notes reviewed. | 0 |

## 9. Earnings Quality Score

**Score: 44 / 100 — band 41–60, "Material concerns."**

The single most important reason for this score: cash conversion itself has not broken down (GAAP CFO/EBITDA ran 76–100% in FY2023–FY2025, and the company's Adjusted EBITDA-based conversion, while declining, has stayed at 62–80% through the Latest TTM — see Section 2), so this is not a case of earnings with no cash behind them. What caps the score in the "material concerns" band rather than "mostly clean" is the accrual and adjustment pattern documented in Sections 4–8: four of the five applicable accrual-quality flags are triggered (Section 6, `RF-EQ-001`), non-GAAP adjustments have exceeded 15% of GAAP EBITDA in both of the last two full fiscal years, and — most importantly — the company's primary "clean" metric (Adjusted EBITDA) has now excluded a real, recurring pattern of impairment across three of the last four quarters ($391.9M cumulative) stemming from acquisitions the company itself made. That is not a one-off distortion of a single quarter's results; it is a multi-quarter pattern that the "adjusted" framing is structurally unable to show investors as anything other than noise.

## 10. The Single Biggest Quality Concern

The biggest risk that reported (adjusted) earnings overstate economic reality is the repeated goodwill/brand impairment pattern itself, not a single accounting trick. Three impairment charges inside four fiscal quarters — Atkins ($60.9M, FQ4 FY2025), OWYN/Atkins/goodwill ($249.0M, FQ2 FY2026), and OWYN/Atkins/goodwill again ($82.0M, FQ3 FY2026), totaling $391.9M — are each individually disclosed and non-cash, so none of them is a fabrication. But every one of them is excluded from Adjusted EBITDA, the metric management and the market use to judge "underlying" performance, and the fact that it recurred three times in four quarters means the underlying acquisitions (OWYN and Atkins) are proving to have been worth less than what the company paid and continued to carry on its balance sheet — a genuine, cash-relevant economic loss that the adjusted-earnings framing is designed to make disappear. Layered on top of that: Adjusted EBITDA margin itself has compressed roughly 330 basis points over the last twelve months net of the impairment add-back [`01_historical-financials.md` Section 2], inventory days have risen for two straight years against a demand backdrop of four consecutive quarters of YoY revenue decline, and the company has continued to buy back stock ($242.3M over the last four quarters, per `01_historical-financials.md` Section 6) while Adjusted EBITDA was falling and net debt was rising back toward $324.6M. None of these facts individually would be disqualifying, but together they describe a company whose reported "clean" earnings number is carrying less signal about the underlying business than the reconciliation tables suggest.
