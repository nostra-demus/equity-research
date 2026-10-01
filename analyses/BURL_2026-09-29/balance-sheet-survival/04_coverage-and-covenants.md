# Coverage & Covenants — BURL

Amounts are USD millions. Burlington is a U.S. GAAP operating retailer. Coverage uses Capital IQ standard LTM EBITDA of $1,360.7m rather than a BURL-reported GAAP EBITDA subtotal or company-adjusted EBITDA; the source-bound CIQ facts sidecar reports the same value. Gross interest expense is used, not net interest. [CIQ Financials→Income Statement `EBITDA` and `EBITDA ÷ Interest Expense`, LTM 12 months ended 2026-08-01 — vendor export]

## 1. Coverage Ratios

| Ratio | Value | Source |
|---|---:|---|
| EBITDA / interest | 18.4x | `$1,360.7m ÷ $74.1m` gross interest. The sidecar's authoritative CIQ read is 18.4x. [CIQ Financials→Income Statement `EBITDA ÷ Interest Expense`, LTM 12 months ended 2026-08-01 — vendor export] |
| EBIT / interest | 12.8x | `$951.6m ÷ $74.1m`; EBIT is the CIQ operating-income calculation, not a BURL GAAP subtotal. [CIQ Financials Quarterly workbook, Income Statement, last four reported quarters through 2026-08-01 — vendor export] |
| (EBITDA − capex) / interest | 4.8x | `($1,360.7m − $1,002.9m) ÷ $74.1m`. Capex is total cash paid for property and equipment, not an estimate of maintenance capex. [FY2025 Form 10-K, Consolidated Statements of Cash Flows, pp.45–46; Q2 FY2026 Form 10-Q, Condensed Consolidated Statements of Cash Flows, pp.5–6; CIQ Financials Quarterly workbook, Income Statement — vendor export] |
| Fixed-charge coverage | 3.8x | Financial-debt proxy: `($1,360.7m − $1,002.9m) ÷ ($74.1m gross interest + $17.5m Term Loan amortization + $2.4m finance-lease principal)`. Operating-lease cash payments are already reflected in operating expense before EBITDA and are excluded to keep the ratio on a matched basis. [FY2025 Form 10-K, Consolidated Statements of Cash Flows, pp.45–46 and Note 3, p.65; Q2 FY2026 Form 10-Q, Condensed Consolidated Statements of Cash Flows, pp.5–6 and Note 3, p.10] |

Latest-TTM CFO of $1,415.5m exceeds the $1,360.7m CIQ standard EBITDA base, so the ratio is cash-backed at the CFO level. It is not a clean recurring-cash measure: reported TTM FCF of $412.5m includes a $55.5m tariff refund; the earnings-quality read estimates about $357.0m after removing that benefit. [CIQ Financials→Cash Flow `Cash from Ops.`, LTM 12 months ended 2026-08-01 — vendor export; Q2 FY2026 Form 10-Q, pp.20, 30; earnings/06_earnings-quality]

Calculation check (executed Bash/`awk`):

```text
EBITDA / gross interest = 18.36x
EBIT / gross interest = 12.84x
(EBITDA - capex) / gross interest = (1360.700 - 1002.936) / 74.100 = 4.83x
Financial-debt fixed-charge proxy = 357.764 / (74.100 + 17.526 + 2.381) = 3.81x
Indicative max-leverage headroom (4.0x / 4.5x) = 78.9% / 81.2%; EBITDA decline to threshold = 78.9% / 81.2%; debt increase = $4545.0m / $5265.1m
Illustrative min-coverage headroom (2.0x / 3.0x floors at 18.4x) = 820.0% / 513.3%
```

## 2. Covenant Inventory

The available filings do not disclose a live maintenance-covenant threshold, BURL's current covenant ratio, covenant EBITDA definition, addback caps, or equity-cure rights. The 3.50x consolidated-leverage condition disclosed in Schedule I gates restricted payments under the Term Loan Facility; it is not shown as a maintenance test, and the company does not disclose the current calculation. The ABL provides $942.0m of current availability and had no borrowing, but the filing does not state a springing-covenant trigger. [FY2025 Form 10-K, Schedule I, Note 1; Q2 FY2026 Form 10-Q, Note 4, pp.12–14]

| Covenant | Threshold | Current Actual | Headroom | Source |
|---|---|---:|---:|---|
| Max net leverage | **Not disclosed.** Illustrative generic leveraged-borrower ceiling: 4.0–4.5x. | 0.84x using strict financial net debt of $1,215.8m / filing-derived LTM EBITDA of $1,440.2m; this is not a covenant calculation. | **Not assessable.** Illustrative 78.9%–81.2% under the stated generic ceiling. | *Inference, not from filings* for 4.0–4.5x; [Q2 FY2026 Form 10-Q, pp.5, 10, 12–13; FY2025 Form 10-K, p.29; balance-sheet-survival/01_capital-structure-and-leverage] |
| Min interest coverage | **Not disclosed.** Illustrative generic floor: 2.0–3.0x. | 18.4x CIQ-standard EBITDA / gross interest; not a covenant definition. | **Not assessable.** Illustrative 513.3%–820.0% above the stated generic floor. | *Inference, not from filings* for 2.0–3.0x; [CIQ Financials→Income Statement `EBITDA ÷ Interest Expense`, LTM 12 months ended 2026-08-01 — vendor export] |
| Min liquidity / net worth | Not disclosed | Not disclosed | Not assessable | [Q2 FY2026 Form 10-Q, Note 4, pp.13–14] |
| Springing covenant trigger (e.g., revolver utilization threshold) | Not disclosed | ABL availability $942.0m; no ABL borrowings | Not assessable; active/not active cannot be determined | [Q2 FY2026 Form 10-Q, Note 4, pp.13–14] |
| Equity cure rights (Y/N, limits) | Not disclosed | Not disclosed | Not assessable | [FY2025 Form 10-K, Schedule I, Note 1; Q2 FY2026 Form 10-Q, Note 4, pp.12–14] |
| Other — restricted-payment condition | Consolidated leverage must not exceed 3.50x and no default for certain Term Loan distributions; ABL restricted-payment conditions also apply. | Not disclosed; the 0.84x accounting ratio above is not the contractual ratio. | Not assessable | [FY2025 Form 10-K, Schedule I, Note 1] |

The generic thresholds above satisfy the partial-data rule only. They are not evidence that BURL has those covenants, so true covenant headroom remains **Not assessable** for scoring.

### Covenant EBITDA Definition & Quality (required if headroom is computed)

| Item | Value / Description | Source |
|---|---|---|
| Covenant EBITDA definition summary | Not disclosed in the data pool. The $1,360.7m coverage denominator is CIQ standard EBITDA, and the $1,440.2m illustrative leverage denominator is a filing-derived GAAP calculation; neither can be assumed to equal covenant EBITDA. | [CIQ Financials→Income Statement `EBITDA`, LTM 12 months ended 2026-08-01 — vendor export; FY2025 Form 10-K, p.29; Q2 FY2026 Form 10-Q, pp.3, 20] |
| Addbacks permitted (types) | Not disclosed | [FY2025 Form 10-K, Schedule I, Note 1; Q2 FY2026 Form 10-Q, Note 4, pp.12–14] |
| Addback caps / limits | Not disclosed | [FY2025 Form 10-K, Schedule I, Note 1; Q2 FY2026 Form 10-Q, Note 4, pp.12–14] |
| Is covenant EBITDA materially above reported EBITDA? | Unknown. Headroom quality is unknown; there is an addback-illusion risk. | [FY2025 Form 10-K, Schedule I, Note 1; Q2 FY2026 Form 10-Q, Note 4, pp.12–14] |

## 3. Headroom & Breach Proximity

| Metric | Value |
|---|---:|
| Tightest covenant | Not assessable — no maintenance covenant with a current contractual calculation is disclosed. |
| Headroom on tightest covenant (%) | Not assessable. |
| EBITDA decline that would breach it (approx.) | Not assessable. Illustrative only: 78.9%–81.2% if a 4.0–4.5x generic maximum-leverage test used strict net debt and filing-derived GAAP EBITDA, with debt and cash held constant. |
| Debt increase that would breach it (approx.) | Not assessable. Illustrative only: $4,545.0m–$5,265.1m of additional strict net debt on the same assumptions. |

The disclosed 3.50x ratio would restrict certain distributions if its contractual test fails, but the definition and present measurement are absent; it cannot be used to identify a breach point. [FY2025 Form 10-K, Schedule I, Note 1]

## 4. Coverage / Covenant Read

Earnings cover gross interest 18.4x, while cash remaining after all reported capex covers it 4.8x; the financial-debt fixed-charge proxy is 3.8x. [CIQ Financials→Income Statement `EBITDA ÷ Interest Expense`, LTM 12 months ended 2026-08-01 — vendor export; FY2025 Form 10-K, pp.45–46; Q2 FY2026 Form 10-Q, pp.5–6]

The tightest covenant and contractual breach point are not assessable because BURL does not disclose maintenance thresholds, current covenant EBITDA, or addback limits. The only disclosed 3.50x condition is a restricted-payment condition, not evidence of live maintenance-covenant headroom; the next needed document is the current Term Loan/ABL credit agreement or compliance certificate. [FY2025 Form 10-K, Schedule I, Note 1; Q2 FY2026 Form 10-Q, Note 4, pp.12–14]
