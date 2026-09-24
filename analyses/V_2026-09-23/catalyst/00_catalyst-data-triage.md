# Catalyst Data Triage — V

## 0. Jurisdiction & Reporting Regime

| Item | Detected Value | Evidence |
|---|---|---|
| Listing jurisdiction (US SEC / India SEBI-LODR / UK / Other) | US SEC; Visa Inc. Class A common stock trades on the NYSE as V. | [FY25 Form 10-K, Cover] |
| Reporting standard (US GAAP / IFRS / Ind AS) | U.S. GAAP. | [FY25 Form 10-K, Note 1—Summary of Significant Accounting Policies] |
| Reporting currency (and fiscal year-end) | USD; fiscal year ends September 30. | [FY25 Form 10-K, Cover] |
| Document language(s) | English. | [Frozen pool manifest, exact generation 2c6c2e4…574ef9c90, source and tab inventory] |

These fields mean the relevant scheduled-event sources are SEC filings, earnings releases, the proxy/annual-meeting notice, and company disclosures—not Indian or other local-market equivalents.

## Language is not a data gap (CLAUDE.md §27)

The frozen generation completed extraction of all 23 sources, including 44 workbook tabs and 59 text extracts, with zero failures. The documents in this pool are in English. There are no non-English filings to translate, and language creates no data-quality reduction. [Frozen pool manifest, exact generation 2c6c2e4…574ef9c90, `totals`]

No `data/V/external/` document is registered in the frozen manifest, so no external-data inventory is required and no external research affects this triage verdict. [Frozen pool manifest, exact generation 2c6c2e4…574ef9c90, source inventory]

## 1. Scheduled-Event Inventory

| Category | Present? (Y/N) | What / When | Source |
|---|---|---|---|
| Next results / guidance date | Y | FQ4 FY26 and FY26 results are expected on **27 October 2026**. The date is Capital IQ-derived, not company-confirmed. Visa has issued its Q4 outlook: constant-dollar non-GAAP net-revenue growth at the high end of low-double-digit, operating-expense growth low-double-digit, and diluted EPS growth at the low end of mid-teens. | [Capital IQ Events Calendar export, 2026, row Oct-27-2026—CIQ Derived]; [Q3 FY26 Financial Results Presentation, Financial Outlook for Fiscal Fourth Quarter and Fiscal Full-Year 2026, p.13] |
| Debt maturity / refinancing date | Y | Three senior-note maturity windows fall inside 12 months: **$1.5bn in April 2027, $0.5bn in August 2027, and $0.75bn in September 2027**. The $2.75bn calendar-2027 total matches the CIQ workbook sidecar’s stated maturity aggregate; the filing is the higher-tier and current source. Visa says it has sufficient liquidity for the April payment, so these are scheduled funding events rather than a proven refinancing stress. | [Q3 FY26 Form 10-Q, Note 8—Debt]; [Q3 FY26 Form 10-Q, MD&A—Liquidity and Capital Resources]; [`ciq_facts.json`, `debt_maturity_wall` = dated debt 2027 $2.750bn, source: CIQ Financials → Capital Structure Details] |
| AGM / EGM / record date | N | The supplied FY26 proxy scheduled the 27 January 2026 Annual Meeting, which is already past as of 23 September 2026. No FY27 AGM/EGM notice, record date, or proxy timetable is in the frozen pool. | [FY26 DEF 14A, Notice of 2026 Annual Meeting]; [Frozen pool manifest, exact generation 2c6c2e4…574ef9c90, source inventory] |
| Scheduled regulatory / legal decision | N | Material interchange litigation is disclosed, including a 15 July 2026 motion for final approval of the injunctive-relief settlement, but the filing gives no future hearing or decision date. It is a risk with unbounded timing, not a dated catalyst. | [Q3 FY26 Form 10-Q, Note 16—Legal Matters] |
| Policy / government decision date | N | Visa has submitted enhanced operating-rule provisions to Brazil’s central bank; approval would increase settlement exposure, but the filing gives no decision date. | [Q3 FY26 Form 10-Q, MD&A—Liquidity and Capital Resources] |
| Operational event (launch / commissioning / contract) | N | The Q3 materials describe launches, client wins, and longer-run initiatives, but provide no future launch, commissioning, or contract-decision date that can enter a calendar. | [Q3 FY26 earnings call, prepared remarks, 2026-07-28] |
| Capital-return event (dividend / buyback) | N | The most recent disclosed $0.67 quarterly dividend was payable 1 September 2026 to holders of record on 11 August 2026, both past at the run date. Visa expects quarterly dividends subject to board approval and has multi-year buyback authority with no expiry, but neither is a future scheduled event. | [Q3 FY26 earnings release, Capital Return, 2026-07-28]; [Q3 FY26 Form 10-Q, Note 11—Stockholders’ Equity] |
| Market-structure event (index review / lock-up) | N | No future index review, lock-up expiry, listing change, or similarly dated market-structure event appears in the complete frozen-pool inventory. | [Frozen pool manifest, exact generation 2c6c2e4…574ef9c90, 59-extract inventory] |

## 2. Upstream Modules Available

| Module | Output present? (Y/N) | Catalyst it can feed |
|---|---|---|
| earnings | Y | The 27 October expected FQ4 result, the qualitative Q4 outlook, consensus bars, and the payment-volume, incentive, and marketing variables that can move the print. [analyses/V_2026-09-23/earnings/05_beat-miss-setup.md, §§1–5] |
| balance-sheet-survival | Y | The April/August/September 2027 maturity windows, liquidity, commercial-paper capacity, and any funding-risk read. [analyses/V_2026-09-23/balance-sheet-survival/02_maturity-wall-and-refinancing.md] |
| management-governance | Y | Next proxy/AGM, board, capital-return, acquisition, and succession disclosures once issued; the current proxy date has passed. [analyses/V_2026-09-23/management-governance/05_board-and-shareholder-rights.md] |
| valuation | Y | The operating evidence that could validate or challenge the earnings path and the multiple/discount-rate assumptions behind the 12-month cases. [analyses/V_2026-09-23/valuation/07_scenario-and-fair-value.md, §§3–6] |
| business-model | Y | Dated primary-source updates on interchange, domestic-payment rails, data localization, consumer spending, or other policy/regulatory variables; none is presently calendared. [analyses/V_2026-09-23/business-model/10_external-dependency.md, §§1A, 3–5] |

## 3. Triage Verdict

**Sufficient.** The calendar can carry multiple evidenced forward events: a vendor-estimated 27 October 2026 FQ4/FY26 result with company-issued Q4 guidance, plus three primary-filed 2027 senior-note maturity windows. The earnings date is not company-confirmed, and the debt maturities are not a proven stress event because Visa states it has sufficient liquidity. There is no proven future AGM, dividend/buyback date, regulatory decision, legal decision, operational launch, or market-structure event in the frozen evidence.

The extraction check covered all 23 sources and 44 workbook tabs (59 extracts) with no failures; all five upstream modules are available. The calendar should therefore use the October earnings date with its estimated-timing qualifier and the filed debt windows, while keeping the unbounded legal, policy, and operational themes out of dated-catalyst rows.
