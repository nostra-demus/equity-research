# Earnings Quality — NHY

Norsk Hydro ASA reports under IFRS Accounting Standards as adopted by the EU, in Norwegian Krone (NOK million), fiscal year ending 31 December [Integrated Annual Report 2025, p.140]. Figures below are company-reported (audited) or company-disclosed Alternative Performance Measures (APMs) unless labelled as a Capital IQ (CIQ) vendor field; per the data-quality note in `01_historical-financials.md`, CIQ's own EBITDA/EBIT reclassification for Hydro does not reconcile to the audited figures and is not used here — company-reported EBITDA/EBIT (audited "Other performance measures" table) are used instead [Integrated Annual Report 2025, p.36].

Cash flow data is available (full Consolidated Statement of Cash Flows for FY2021–FY2025, plus Q1 2026) — the partial-data cap for missing cash flow data does not apply.

## 1. EBITDA → CFO → FCF Bridge (5 years)

Currency: NOK million. Basis: company-reported (audited) EBITDA for FY2023–FY2025; company-reported EBITDA/EBIT are **not disclosed for FY2021–FY2022 in this data pool** (the pre-FY2023 annual report is not in the pool) — these two years are marked N/A rather than estimated [Integrated Annual Report 2025, p.36, "Other performance measures" table, FY2023–FY2025 columns only].

| Item | FY2021 | FY2022 | FY2023 | FY2024 | FY2025 | Trend |
|---|---:|---:|---:|---:|---:|---|
| EBITDA (reported) | N/A | N/A | 23,291 | 26,543 | 25,696 | Volatile |
| Working capital change¹ | 1,542 | 5,295 | (1,059) | 709 | (2,777) | Volatile |
| Tax paid (cash) | (2,862) | (5,312) | (7,177) | (4,719) | (4,765) | Volatile |
| Interest paid (cash) | (904) | (1,034) | (1,959) | (2,661) | (2,358) | Rising |
| Other operating items² | N/A | N/A | 9,124 | (4,516) | 7,515 | Volatile |
| **CFO** | 14,330 | 29,337 | 22,220 | 15,356 | 23,311 | Volatile |
| Maintenance capex | Not disclosed³ | Not disclosed³ | Not disclosed³ | Not disclosed³ | Not disclosed³ | — |
| Growth capex | Not disclosed³ | Not disclosed³ | Not disclosed³ | Not disclosed³ | Not disclosed³ | — |
| Total capex (abs.) | 6,020 | 9,604 | 13,638 | 13,555 | 11,582 | Easing off FY23 peak |
| **FCF (CFO − Total Capex)** | 8,310 | 19,733 | 8,582 | 1,801 | 11,729 | Volatile |
| **CFO / EBITDA %** | N/A | N/A | 95.4% | 57.9% | 90.7% | Volatile — 3yr avg 81.3% |

[Norsk Hydro ASA OB NHY Financials.xls, Cash Flow tab (CFO, capex, WC change, tax paid, interest paid); Integrated Annual Report 2025, p.36 (EBITDA)]

¹ "Working capital change" is the CIQ Cash Flow tab's own "Change in Net Working Capital" supplemental line (sum of changes in receivables, inventories, payables, and other net operating assets), sign convention: positive = cash inflow [Norsk Hydro ASA OB NHY Financials.xls, Cash Flow tab, "Change in Net Working Capital" row].

² "Other operating items" is a derived plug (CFO minus EBITDA minus the three lines above), not itself a single audited line. It reconciles the audited EBITDA APM (which excludes depreciation & amortization, and nets certain non-operating items differently) to the cash-flow statement, which is built starting from Net Income. It captures the D&A add-back, non-cash unrealized derivative mark-to-market swings on LME/power/raw-material contracts (a structural feature of Hydro's hedge accounting — see §4), income/loss from equity-accounted investees, discontinued operations, and non-cash asset write-downs. Its size and sign volatility (+9,124 / −4,516 / +7,515 across FY2023–FY2025) is itself a quality signal, not a rounding residual — see §2 and §10. FY2021–FY2022 marked N/A because company-reported EBITDA is unavailable for those years (see table header).

³ **Capex split not disclosed — total capex used. FCF may understate true recurring free cash flow.** Norsk Hydro discloses total Capex as an APM (Purchases of PP&E plus other long-term investments, less investment grants received: NOK 12,097m FY2025, NOK 15,078m FY2024) but does not split maintenance/sustaining spend from growth spend in this data pool [Integrated Annual Report 2025, "Capital expenditure (Capex)" APM table, p.233–234]. Management has referred qualitatively to "historically high sustaining capital expenditure" without giving a number [Integrated Annual Report 2025, p.51 narrative]. This report's FCF uses the cash-flow-statement capex line (Purchases of PP&E only: NOK 11,582m FY2025) per the module-standard FCF definition (CFO − total capex), which is a narrower capex figure than the company's own broader Capex APM.

**Lead figure — normalised operating FCF vs company FCF APM (§15):** The module-standard FCF above (CFO − total capex) is the **lead figure** in this report. Norsk Hydro also discloses its own **company-defined Free Cash Flow APM**, which nets out changes in derivative collateral and short-term-investment purchases/sales — a different, non-standard definition, not a one-off inflator: **NOK 13,034m FY2025**, **NOK 2,844m FY2024**, and **NOK (3,985m) — negative — for Q1 2026** [Integrated Annual Report 2025, "Free cash flow" APM table, p.233; First Quarter Report 2026, p.37]. The two bases diverge because the company version excludes collateral and short-term-investment cash effects that the module-standard CFO − capex definition does not adjust for. Both are shown, labelled, so they are not conflated: module-standard FY2025 FCF = NOK 11,729m vs company APM NOK 13,034m (a modest NOK 1,305m gap); module-standard FY2024 FCF = NOK 1,801m vs company APM NOK 2,844m (a NOK 1,043m gap). Neither year shows evidence of FCF being inflated by an itemised one-off cash item (e.g., a customer advance) — the gap is a definitional/collateral-netting difference, disclosed and reconciled by the company itself.

## 2. Cash Conversion Assessment

Multi-year cash conversion is decent on average but volatile year to year: CFO/EBITDA was 95.4% in FY2023, fell to 57.9% in FY2024 (below the 70% "healthy" threshold), then recovered to 90.7% in FY2025 — a 3-year average of 81.3%, and the trailing-twelve-month (TTM, ended 31-Mar-2026) figure is 79.4% (TTM CFO NOK 17,440m ÷ TTM EBITDA NOK 21,976m) [derived from `01_historical-financials.md`, §2]. The FY2024 dip tracks a working-capital build (receivables +24.5% YoY and inventory +10.8% YoY, both outpacing revenue/COGS growth — see §6) that partly reversed in FY2025. The most recent standalone quarter is the weak point: Q1 2026 net cash from operating activities was **negative NOK (1,891)m** against a positive Adjusted EBITDA of NOK 8,668m, driven by "operating capital build from higher prices and sales" [Integrated Annual Report 2025, p.4 highlights; First Quarter Report 2026, p.37, "Free cash flow" table] — a genuine, disclosed cash-conversion breakdown in the latest quarter, attributable to the ordinary working-capital cycle of a commodity producer riding higher prices, not to accrual manipulation, but a real near-term signal that reported/adjusted profit is currently running ahead of cash.

## 3. Working Capital Trends

Basis: average of opening and closing balances `(FY{-1} closing + FY{0} closing) / 2`. DSO uses revenue as the denominator; DIO and DPO use COGS (Raw material and energy expense), per module formula. [Norsk Hydro ASA OB NHY Financials.xls, Balance Sheet tab (Accounts Receivable, Inventory, Accounts Payable) and Income Statement tab (Revenue, Cost of Goods Sold)]

| Metric | FY2023 | FY2024 | FY2025 | Direction | Risk |
|---|---:|---:|---:|---|---|
| Receivable days (DSO) | 32.1 | 33.0 | 33.0 | Rising slightly (+2.6% FY24, +0.1% FY25 YoY) | Low — well under the 10% YoY flag threshold |
| Inventory days (DIO) | 82.0 | 75.7 | 76.8 | Fell then flat (−7.7% FY24, +1.4% FY25 YoY) | Low — no build; well under 15% YoY flag threshold |
| Payable days (DPO) | 55.4 | 54.1 | 53.2 | Falling slightly (−2.2% FY24, −1.8% FY25 YoY) | Low-Medium — paying suppliers modestly faster, not stretching them; not a liquidity-stress pattern given the company's net-cash-generative, sub-1x-leverage position (see `01`, §1 footnote 5) |
| Cash conversion cycle (DSO + DIO − DPO) | 58.7 | 54.5 | 56.6 | Stable (54.5–58.7 day range) | Low |

None of the three flag thresholds (DSO rising >10% YoY; DIO rising >15% YoY; DPO rising sharply) are triggered in FY2024 or FY2025. The FY2024 receivables (+24.5% YoY, 16,382→20,396) and inventory (+10.8% YoY, 25,449→28,187) *balance* growth outpaced revenue/COGS growth that year (see §6, accrual quality flags) even though the resulting *days* metrics stayed within threshold — both reversed in FY2025.

## 4. Non-GAAP Adjustments

Company discloses "Adjusting items to EBITDA, EBIT and net income" as audited APMs, fully reconciled line by line in the annual report [Integrated Annual Report 2025, p.36–37, "Adjustments to EBIT and other performance measures"]. FY2025 detail shown; FY2023–FY2024 composition in §7 and §5.

| Adjustment (FY2025) | Amount (NOK m) | Recurring? (Y/N) | Concern Level | Evidence |
|---|---:|---|---|---|
| Unrealized derivative (gain)/loss — LME-linked contracts | +1,504 | Y — recurs every year, sign flips with the metal-price path (−1,530 FY23, +580 FY24, +1,504 FY25) | Mid — large, non-cash, structural | [Integrated Annual Report 2025, p.36] |
| Unrealized derivative (gain)/loss — power/raw-material contracts | +453 | Y — recurs, sign flips (+887 FY23, −90 FY24, +453 FY25) | Mid | [Integrated Annual Report 2025, p.36] |
| Significant rationalization charges and closure costs | +1,795 | **Y — recurs every year and is growing** (265 FY23 → 407 FY24 → 1,795 FY25) | High — labelled "one-off" each year but never absent; the add-back treats a recurring cost of running an aging asset base as non-recurring | [Integrated Annual Report 2025, p.36] |
| Impairment charges (equity-accounted investments) | +444 | Y — recurs 2 of 3 years (0 FY23, 1,079 FY24, 444 FY25) | Mid | [Integrated Annual Report 2025, p.36] |
| Impairment charges (PP&E/goodwill, added to EBIT only) | +1,069 | Y — recurs every year, large swings (4,424 FY23, 22 FY24, 1,069 FY25) | High — the FY2023 impairment alone was ~46% of that year's reported EBIT | [Integrated Annual Report 2025, p.36–37] |
| Transaction-related (gain)/loss | (429) | Mixed — recurs, sign flips (120 FY23, −439 FY24, −429 FY25) | Low — deal-specific, disclosed | [Integrated Annual Report 2025, p.36] |
| Net foreign exchange (gain)/loss | (322) | Y — recurs every year, sign flips (−883 FY23, −595 FY24, −322 FY25) | Low-Mid — structural currency exposure, non-cash | [Integrated Annual Report 2025, p.36] |
| Other effects | (251) | Y — recurs every year | Mid — limited disclosure on composition ("as described in the Alternative Performance Measures section") | [Integrated Annual Report 2025, p.36] |
| Share-based compensation | NOK 17.4m (2025) / 38.6m (2024) | Y, but immaterial | Low — not material enough to matter whether it is excluded from "adjusted" figures (net income NOK 8,304m FY2025) | [Integrated Annual Report 2025, Note 9.2 Employee remuneration, p.199] |

**Exceeding 15% of GAAP earnings:** at the EBITDA level the FY2025 adjustment (+3,193 / +12.4% of reported EBITDA) stays under 15%, but at EBIT and net-income level it does not: FY2025 EBIT adjustment +4,262 = **29.6%** of reported EBIT; FY2025 net-income adjustment +2,851 = **34.3%** of reported net income. FY2024 and FY2023 are larger still at the net-income line (see §7). Flagged as a standing concern, not a one-off.

## 5. One-Off Items (last 3 years)

| Item | Period | Amount (NOK m) | Classification | Evidence |
|---|---|---:|---|---|
| Significant rationalization & closure costs | FY2023 / FY2024 / FY2025 | 265 / 407 / 1,795 | **Recurring "one-off"** — occurs every year, size is growing, and is described as "significant" each time | [Integrated Annual Report 2025, p.36] |
| Impairment of goodwill/PP&E (Bauxite & Alumina, Tomago, Slovalco smelter, Extrusions sites) | FY2023 / FY2024 / FY2025 | 4,424 / 22 / 1,069 | Recurring "one-off" — an impairment has been booked every year, amounts genuinely tied to specific asset revaluations | [Integrated Annual Report 2025, p.37, note 7] |
| Impairment of equity-accounted investments | FY2024 / FY2025 | 1,079 / 444 | Genuine — associate-specific, not core operating assets, but recurs 2 of 3 years | [Integrated Annual Report 2025, p.36] |
| Unrealized derivative timing (LME/power/raw material) | FY2023 / FY2024 / FY2025 | (642) / 491 / 1,956 | Recurring structural feature (hedge-accounting timing mismatch), not a discrete event — flagged in `01_historical-financials.md` §4 as "a structural feature of Hydro's earnings…not a one-off" | [Integrated Annual Report 2025, p.36] |
| Community contributions Brazil (TAC/TC agreements, Ministério Público) | FY2023 | 25 | Genuine one-off — specific to a Brazil litigation/environmental settlement | [Integrated Annual Report 2025, p.36–37, note 3] |
| Transaction-related gain/loss (divestments) | FY2023 / FY2024 / FY2025 | 120 / (439) / (429) | Genuine, deal-specific | [Integrated Annual Report 2025, p.36–37, note 4] |

## 6. Accrual Quality Flags

| Flag | Triggered (Y/N) | Evidence |
|---|---|---|
| Revenue growing faster than CFO for 2+ years | **N (isolated to one year, not sustained)** | FY2024: revenue +5.2% vs CFO −30.9% (diverged). FY2025: revenue +2.1% vs CFO +51.8% (CFO grew far faster) — the divergence reversed the following year rather than persisting [Norsk Hydro ASA OB NHY Financials.xls, Income Statement / Cash Flow tabs] |
| Receivables growing faster than revenue | **Y in FY2024, reversed FY2025** | FY2024: Accounts Receivable +24.5% (16,382→20,396) vs revenue +5.2%. FY2025: Accounts Receivable −16.2% (20,396→17,212) vs revenue +2.1% [Norsk Hydro ASA OB NHY Financials.xls, Balance Sheet tab] |
| Inventory growing faster than COGS | **Y in FY2024, reversed FY2025** | FY2024: Inventory +10.8% (25,449→28,187) vs COGS +4.7%. FY2025: Inventory −1.4% vs COGS +2.9% [Norsk Hydro ASA OB NHY Financials.xls, Balance Sheet / Income Statement tabs] |
| Deferred revenue declining (if subscription/contract business) | **N/A** — Hydro is a commodity metals producer; no contract-liability/deferred-revenue balance is disclosed in this pool | Not proven from available data — no such line found |
| Capitalized costs growing as % of revenue | **N** | Other Intangibles fell from NOK 4,697m (FY2023) to NOK 3,831m (FY2025) while revenue rose — capitalized intangibles are shrinking as a share of revenue, not growing [Norsk Hydro ASA OB NHY Financials.xls, Balance Sheet tab] |
| Frequent accounting policy changes | **N — not proven from available data** | No disclosure of a policy change was found in the pool for FY2023–FY2025; standard IFRS boilerplate on useful-life judgment appears but no disclosed change [Integrated Annual Report 2025, Note on PP&E, useful-life judgment section] |

The FY2024 receivables/inventory build and the FY2024 CFO/EBITDA dip to 57.9% (§1–§2) are the same event — a genuine, disclosed working-capital cycle, not a persistent multi-year pattern.

## 7. Reported vs Adjusted Reconciliation

Currency: NOK million, except per-share (NOK). All rows are audited APMs, reconciled by the company [Integrated Annual Report 2025, p.36].

| Metric | FY2025 Reported | FY2025 Adjusted | Difference | % of Reported | Recurring? | Evidence |
|---|---:|---:|---:|---:|---|---|
| EBITDA | 25,696 | 28,889 | +3,193 | +12.4% | Y — dominated by non-cash derivative timing and recurring rationalization costs | [Integrated Annual Report 2025, p.36] |
| EBIT | 14,401 | 18,663 | +4,262 | +29.6% | Y | [Integrated Annual Report 2025, p.36] |
| Net income | 8,304 | 11,155 | +2,851 | +34.3% | Y | [Integrated Annual Report 2025, p.36] |
| EPS (diluted) | 3.41 | 5.02 | +1.61 | +47.2% | Y | [Integrated Annual Report 2025, p.36, p.64] |

| Metric | FY2024 Reported | FY2024 Adjusted | Difference | % of Reported | Evidence |
|---|---:|---:|---:|---:|---|
| EBITDA | 26,543 | 26,318 | (225) | −0.8% | [Integrated Annual Report 2025, p.36] |
| EBIT | 16,487 | 16,284 | (203) | −1.2% | [Integrated Annual Report 2025, p.36] |
| Net income | 5,040 | 9,278 | +4,238 | **+84.1%** | [Integrated Annual Report 2025, p.36] |
| EPS (diluted) | 2.90 | 4.50 | +1.60 | +55.2% | [Integrated Annual Report 2025, p.36, p.64] |

| Metric | FY2023 Reported | FY2023 Adjusted | Difference | % of Reported | Evidence |
|---|---:|---:|---:|---:|---|
| EBITDA | 23,291 | 22,258 | (1,033) | −4.4% | [Integrated Annual Report 2025, p.36] |
| EBIT | 9,592 | 12,983 | +3,391 | +35.4% | [Integrated Annual Report 2025, p.36] |
| Net income | 2,804 | 7,835 | +5,031 | **+179.5%** | [Integrated Annual Report 2025, p.36] |
| EPS (diluted) | 1.77 | 4.26 | +2.49 | +140.7% | [Integrated Annual Report 2025, p.36, p.64] |

The EBITDA-level gap is modest and sign-flipping across years (−4.4% / −0.8% / +12.4%), consistent with the disclosed structural derivative-timing feature. But the **net-income/EPS-level gap is large and directionally consistent every year** (+34% to +180%) — reported bottom-line earnings are systematically and materially below the adjusted figure in all three years shown, driven by the compounding effect of impairments, rationalization costs, and non-cash FX/derivative items that hit further down the income statement than EBITDA. This is the single largest reported-vs-adjusted divergence in this report (see §10).

## 8. Accounting Trap Checklist

*(Severity column is inverted — higher = WORSE)*

| Trap | Triggered? (Y/N) | Evidence | Severity /100 |
|---|---|---|---:|
| Stock-based compensation excluded from adjusted earnings | N | SBC is NOK 17.4m (2025) / 38.6m (2024) — immaterial against NOK 8,304m net income; whether or not it is excluded from "adjusted" figures does not move the number [Integrated Annual Report 2025, Note 9.2, p.199] | 5 |
| Restructuring costs recur every year | **Y** | Significant rationalization & closure costs booked every year and rising: 265 (FY23) → 407 (FY24) → 1,795 (FY25) [Integrated Annual Report 2025, p.36] | 60 |
| Capitalized costs rising faster than revenue | N | Other Intangibles fell NOK 4,697m→3,831m FY2023–FY2025 while revenue rose [Norsk Hydro ASA OB NHY Financials.xls, Balance Sheet tab] | 5 |
| Receivable factoring / supplier finance disclosed | **Y** | "Trade finance products such as factoring and reverse factoring are used to some extent by subsidiaries…Hydro has set a total limit for such arrangements…currently NOK 5.5 billion but was not fully utilized at year-end" [Integrated Annual Report 2025, p.179, "Funding of subsidiaries, associates and jointly controlled entities"] | 25 |
| Inventory write-downs or reserve releases | N — not proven from available data | No specific inventory write-down/reserve-release disclosure found in this pool beyond the general asset-writedown line already captured in §4/§5 | 10 |
| Revenue recognized before cash collection risk is clear | N | DSO stable at 32–33 days across FY2023–FY2025 (§3); no disclosed bad-debt spike found | 10 |
| Change in useful life / depreciation assumptions | N — not proven from available data | Standard IFRS boilerplate on useful-life judgment present, but no disclosed *change* in FY2025 found in this pool | 10 |
| Tax rate unusually low or boosted by one-off | N | Reported effective tax rate is *high*, not low: 57% (FY23), 43% (FY24), 39% (FY25) vs adjusted 35%/37%/34% [Integrated Annual Report 2025, p.37] | 5 |
| Large fair-value / mark-to-market gains | **Y** | Unrealized derivative timing differences on LME/power/raw-material contracts swing reported EBIT by NOK (642)m to +1,956m across the three years shown, non-cash and structurally embedded in the *reported* (not adjusted) figures [Integrated Annual Report 2025, p.36] | 55 |

## 9. Earnings Quality Score

**Score: 55/100 — Mixed / average (41–60 band): material concerns from recurring "one-off" charges.**

The single most important reason for this score is that Hydro books "significant rationalization and closure costs" as an EBITDA/EBIT add-back **every single year**, with the amount growing (265 → 407 → 1,795 NOK m over FY2023–FY2025), alongside an impairment charge in every year [Integrated Annual Report 2025, p.36–37] — the module rule treats a charge that recurs every period as not genuinely one-off, and the band description (41–60: "material concerns…recurring one-offs") applies directly. This is compounded by a large, persistent gap between reported and adjusted net income/EPS (+34% to +180% across the three years, §7) driven by non-cash derivative and FX swings, which makes reported bottom-line EPS an unreliable stand-alone read of underlying earnings power in any single year. Offsetting factors that keep the score in the middle band rather than lower: cash conversion is decent on a multi-year average (81.3% 3-year avg CFO/EBITDA, 79.4% TTM — both above the 70% "healthy" threshold), working-capital days show no sustained build (§3), receivable factoring is disclosed with a hard cap and was not fully utilized, share-based compensation is immaterial, and every adjustment is transparently reconciled in the audited annual report rather than hidden or vaguely described.

## 10. The Single Biggest Quality Concern

The single biggest risk that reported earnings misstate the economic picture is not fraud or hidden cash weakness — it is that Hydro's reported net income and EPS are dominated, in every one of the last three years, by large non-cash items that sit below the EBITDA line: unrealized derivative mark-to-market timing on LME-linked hedges, impairments, and "significant" rationalization costs that recur annually despite being labelled one-off. Together these pushed reported net income *below* the company's own adjusted net income by 34% (FY2025), 84% (FY2024), and 180% (FY2023) [Integrated Annual Report 2025, p.36]. A reader who takes the headline reported EPS (NOK 1.77 in FY2023, for example) at face value without cross-checking the adjusted figure (NOK 4.26) or the cash-flow statement would badly misjudge the year's underlying earnings power. The company discloses this fully and audits it, so it is a volatility-and-interpretation risk rather than a concealment risk — but it means reported net income/EPS should never be used on a standalone basis for this company, and the recurring rationalization add-back (§8) means even the *adjusted* EBITDA figure likely overstates the ongoing cash cost of running Hydro's aging, high-capex asset base by a modest but persistent amount each year.

