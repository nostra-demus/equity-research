# Historical Financials — GOOGL

Alphabet reports under U.S. GAAP in USD and has a 31 December year-end. Unless stated otherwise, figures below are reported USD millions; EBITDA (earnings before interest, tax, depreciation and amortisation) is calculated as operating income plus depreciation and amortisation, not a company-adjusted measure. Free cash flow (FCF) means cash from operations (CFO) less purchases of property and equipment (capex). Working capital is total current assets less total current liabilities.

## 1. Annual Financial Table (3–5 years)

**Reported USD millions, except per-share data and ratios.** Net debt uses the **strict** basis: filing debt excluding operating-lease liabilities, less cash and cash equivalents (not marketable securities). A negative number denotes net cash.

| Metric | FY2023 | FY2024 | FY2025 | Trend |
|---|---:|---:|---:|---|
| Revenue [1] | 307,394 | 350,018 | 402,836 | Accelerating |
| Revenue YoY % [1] | 8.7% | 13.9% | 15.1% | Accelerating |
| Gross Profit [1] | 174,062 | 203,712 | 240,301 | Accelerating |
| Gross Margin % [1] | 56.6% | 58.2% | 59.7% | Accelerating |
| EBITDA (calculated; not company-adjusted) [1] | 96,239 | 127,701 | 150,175 | Accelerating |
| EBITDA Margin % [1] | 31.3% | 36.5% | 37.3% | Accelerating |
| EBIT / income from operations [1] | 84,293 | 112,390 | 129,039 | Accelerating |
| EBIT Margin % [1] | 27.4% | 32.1% | 32.0% | Stable |
| EPS (diluted) [1] | $5.80 | $8.04 | $10.81 | Accelerating |
| CFO [1] | 101,746 | 125,299 | 164,713 | Accelerating |
| Capex [1] | 32,251 | 52,535 | 91,447 | Accelerating |
| FCF (CFO − capex) [1] | 69,495 | 72,764 | 73,266 | Stable |
| Working capital [1][5] | 89,716 | 74,589 | 103,293 | Volatile |
| Net debt — **strict basis** [1][5] | (11,178) | (9,284) | 17,835 | Inflecting |
| Net Debt / EBITDA — **strict basis** [1][5] | (0.12)x | (0.07)x | 0.12x | Inflecting |

The strict-debt build is reconstructable from filed components. FY2023 debt was $12.870bn ($11.870bn long-term debt plus $1.000bn current portion), less $24.048bn cash; FY2024 debt was $14.182bn ($10.883bn long-term debt, $2.300bn commercial paper and $0.999bn current portion), less $23.466bn cash; FY2025 debt was $48.543bn ($46.547bn long-term debt plus $1.996bn current portion), less $30.708bn cash. Operating-lease liabilities are excluded. [FY2024 Form 10-K, Note 6 (Debt); FY2025 Form 10-K, Consolidated Balance Sheets p.48 and Note 6 p.71]

**Calculation check (executed Bash/AWK; USD millions):**

```text
$ awk 'BEGIN { print 164713-91447, 179551-159804, (402836-350018)/350018*100 }'
73266 19747 15.0904
```

The complete executed check produced FY2023/FY2024/FY2025 FCF of $69,495m/$72,764m/$73,266m; FY2025 gross, EBITDA and EBIT margins of 59.65%/37.28%/32.03%; and FY2025 strict net debt/EBITDA of 0.12x. The same calculation produced TTM September 2026 CFO of $179,551m, capex of $159,804m and FCF of $19,747m.

## 2. TTM Snapshot

**TTM ended 30 September 2026; USD millions, except EPS and ratios.** “Prior TTM” is the four quarters ended 30 September 2025. Net debt is a period-end balance rather than a TTM flow.

| Metric | Latest TTM | Prior TTM | Change | Evidence |
|---|---:|---:|---:|---|
| Revenue | 471,098 | 385,477 | +22.2% | [2][3] |
| EBITDA (calculated; not company-adjusted) | 185,516 | 143,753 | +29.1% | [3][4] |
| EBIT / income from operations | 156,976 | 124,077 | +26.5% | [2][3] |
| EPS diluted | $19.17 | $10.13 | +89.2% | [2][3] |
| CFO | 179,551 | 151,424 | +18.6% | [2][3][4] |
| Capex | 159,804 | 77,872 | +105.2% | [2][3] |
| FCF (CFO − capex) | 19,747 | 73,552 | −73.2% | [2][3] |
| Net debt at latest period-end | 69,784 **(strict basis)** | 3,512 **(strict basis; vendor total-debt figure; composition unconfirmed against the FY2025 Q3 filing debt note)** | +66,272 | [2][3] |

At 30 September 2026, filing-clean debt is $126.118bn ($125.102bn long-term debt plus $1.016bn current portion; no commercial paper), less $56.334bn cash and cash equivalents, yielding $69.784bn strict net debt and 0.38x TTM EBITDA. [Q3 2026 Form 10-Q, Consolidated Balance Sheets; Note 6 (Debt), p.26]

This is deliberately different from the CIQ sidecar’s vendor figure: CIQ reports $150.331bn total debt and **net debt of negative $114.767bn** because its $150.331bn aggregate includes $24.213bn operating-lease liabilities and its net-debt convention nets $265.098bn cash **plus marketable securities**. This is net cash on the **broad basis** (cash plus marketable securities, net of vendor debt), not strict net debt. The filing-clean strict calculation above is therefore used. [CIQ Financials → Balance Sheet, Q3 2026; CIQ facts sidecar, `total_debt_m` and `net_debt_m`, 2026-09-30]

The CIQ facts sidecar’s authoritative workbook read for LTM EBITDA is $185.516bn. The four quarterly CIQ EBITDA fields sum to $185.891bn, a $0.375bn (0.2%) mismatch. This report uses the sidecar’s $185.516bn figure; the small cross-workbook restatement/definition difference is not overridden silently. [CIQ facts sidecar, `ltm_ebitda_m`, 2026-09-30; CIQ Financials → Quarterly Income Statement, Q4 2025–Q3 2026]

## 3. Latest Quarterly Trend Table (up to 8 quarters)

**Reported USD millions, except per-share data and margins.** Gross and EBITDA margins are calculated from the quarterly data; EBITDA remains a calculated, not company-adjusted, measure.

| Metric | Q4 FY24 | Q1 FY25 | Q2 FY25 | Q3 FY25 | Q4 FY25 | Q1 FY26 | Q2 FY26 | Q3 FY26 | QoQ Trend | YoY vs Same Q |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---|---|
| Revenue [2][3] | 96,469 | 90,234 | 96,428 | 102,346 | 113,829 | 109,896 | 119,796 | 127,577 | Accelerating; +6.5% | +24.7% |
| Gross Margin % [2][3] | 57.9% | 59.7% | 59.5% | 59.6% | 59.8% | 62.5% | 61.6% | 59.7% | Volatile; −195bp | +12bp |
| EBITDA [3] | 35,177 | 35,215 | 36,393 | 36,968 | 41,974 | 46,356 | 48,241 | 49,320 | Accelerating; +2.2% | +33.4% |
| EBITDA Margin % [3] | 36.5% | 39.0% | 37.7% | 36.1% | 36.9% | 42.2% | 40.3% | 38.7% | Volatile; −161bp | +254bp |
| EPS (diluted) [2][3] | $2.14 | $2.81 | $2.31 | $2.87 | $2.81 | $5.11 | $9.11 | $2.14 | Volatile; −76.5% | −25.4% |

Q3 FY2026 revenue and operating income agree to the filed 10-Q ($127.577bn and $40.576bn, respectively). EPS is not a clean operating trend: Q2 FY2026 included a $98.999bn gain on sale of investments in the vendor quarterly series, while Q3 FY2026 included $8.221bn of other expense in the filed income statement. These disclosed/non-operating movements explain why TTM EPS growth is much faster than the revenue and EBIT trends. [Q3 2026 Form 10-Q, Consolidated Statements of Income; CIQ Financials → Quarterly Income Statement, Q2–Q3 2026]

## 4. Reported vs Adjusted Metrics

| Metric | Reported Value | Adjusted Value | Adjustment Amount | Adjustment Reason | Evidence |
|---|---:|---:|---:|---|---|
| EBITDA | Not reported by Alphabet; CIQ calculated Q3 FY2026 EBITDA is 49,320 | Not disclosed | N/A | Alphabet does not provide an adjusted-EBITDA reconciliation in the reviewed filing. | [2][3] |
| EBIT | Q3 FY2026 operating income 40,576 | Not disclosed | N/A | Alphabet reports income from operations; no adjusted EBIT was disclosed. | [2] |
| EPS | Q3 FY2026 diluted EPS $2.14 | Not disclosed | N/A | Alphabet reports GAAP diluted EPS; no adjusted EPS was disclosed. | [2] |

*Company does not disclose adjusted metrics in the reviewed 10-K and Q3 2026 10-Q.*

## 5. Quarterly Seasonality Table (last 3 fiscal years)

**Actual quarterly CIQ data; revenue shares are calculated against filed annual revenue.** EBITDA margins use the calculated EBITDA convention described above.

| Quarter | FY2023 Rev Share | FY2024 Rev Share | FY2025 Rev Share | Avg Rev Share | FY2023 EBITDA Margin | FY2024 EBITDA Margin | FY2025 EBITDA Margin |
|---|---:|---:|---:|---:|---:|---:|---:|
| Q1 [1][3] | 22.7% | 23.0% | 22.4% | 22.7% | 28.7% | 35.9% | 39.0% |
| Q2 [1][3] | 24.3% | 24.2% | 23.9% | 24.1% | 33.1% | 36.7% | 37.7% |
| Q3 [1][3] | 25.0% | 25.2% | 25.4% | 25.2% | 32.0% | 36.8% | 36.1% |
| Q4 [1][3] | 28.1% | 27.6% | 28.3% | 28.0% | 31.3% | 36.5% | 36.9% |

Q4 is consistently the largest revenue quarter, but no quarter takes more than 30% or less than 20% of annual revenue in this three-year history. The revenue pattern is therefore present but does not breach the report’s material-seasonality flags. [CIQ Financials → Quarterly Income Statement, FY2023–FY2025]

## 6. Key Trend Summary

Revenue growth is accelerating: it rose from 8.7% in FY2023 to 15.1% in FY2025, and TTM September 2026 revenue grew 22.2% year on year. Gross margin expanded from 56.6% in FY2023 to 59.7% in FY2025, while Q3 FY2026 gross margin was broadly flat year on year (+12bp) but fell 195bp sequentially; the latest quarter therefore does not establish continued quarterly expansion. EBITDA margin improved over the multi-year period, but the Q3 FY2026 margin of 38.7% was below Q1 FY2026’s 42.2%, so the quarterly pattern is volatile rather than a straight line. Q4 is the largest seasonal revenue quarter at roughly 28% of annual revenue, but it is not dominant. The important financial inflection is cash intensity: TTM CFO rose $28.127bn year on year, but capex rose $81.932bn, leaving FCF down $53.805bn to $19.747bn. [1][2][3][4]

## 7. Citations

[1] `data/GOOGL/Alphabet_Inc_-_Form_10-K(Feb-05-2026).doc`, FY2025 Form 10-K, Consolidated Balance Sheets p.48, Consolidated Statements of Income p.49, Consolidated Statements of Cash Flows p.51, and Note 6 (Debt) p.71 — audited FY2023–FY2025 income/cash-flow history and FY2024–FY2025 balance-sheet/debt data.

[2] `data/GOOGL/Alphabet_Inc_-_Form_10-Q(Oct-29-2026).doc`, Q3 FY2026 Form 10-Q, Consolidated Balance Sheets, Consolidated Statements of Income and Cash Flows, and Note 6 (Debt) p.26 — Q3 FY2026 primary reported figures, nine-month cash flow, cash and debt composition.

[3] `data/GOOGL/Alphabet Inc NasdaqGS GOOGL Financials_Quarterly.xls`, CIQ Financials → Quarterly Income Statement, Cash Flow and Balance Sheet, actual quarterly columns Q1 FY2023–Q3 FY2026; vendor export, data as of 2026-11-03 — intervening quarter, prior-TTM and seasonal-history data. Q3 FY2026 revenue and operating income were cross-checked to [2].

[4] `ciq_facts.json`, `ltm_ebitda_m` and `ltm_ocf_m`, source references CIQ Financials → Income Statement / Cash Flow, LTM ended 2026-09-30 — deterministic source-bound CIQ workbook read: EBITDA $185.516bn and CFO $179.551bn.

[5] `data/GOOGL/Alphabet_Inc-Annual_Report_2024.pdf`, FY2024 Form 10-K, Consolidated Balance Sheets p.52 and Note 6 (Debt) — FY2023 working-capital and strict-debt components.
