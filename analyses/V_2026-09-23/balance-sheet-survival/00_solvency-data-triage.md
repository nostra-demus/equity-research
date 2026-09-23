# Solvency Data Triage — V

The frozen generation contains 23 raw files and 44 extracted workbook tabs (59 inventory rows below). All manifest sources have `status: ok`; no external-research rows are present. Every file's 2026-09-23 modification date is the frozen-pool ingestion date, not its reporting date. The relationship graph is a tier-5 Capital IQ export limited to recently disclosed customers/suppliers and does not change this solvency assessment. `[Capital IQ Suppliers/Customers relationship graph, frozen generation 2c6c2e, scope notes]`

The CIQ facts sidecar is present. Its reported total-debt read of $23,858m agrees with the latest filing's $23,858m total carrying value of debt; its $10,066m net-debt figure is explicitly a vendor basis that may net short-term investments, so it is not adopted as a strict debt-minus-cash figure. `[CIQ Financials→Balance Sheet, FQ3/CQ2 Jun-30-2026]` `[Visa Form 10-Q, quarter ended Jun. 30, 2026, Note 8 (Debt)]`

## 1. File Inventory

| Filename | Type | Period Covered | Last Modified | Solvency Relevance |
|---|---|---|---|---|
| Company Comparable Analysis Visa Inc.xls — Financial Data (115 KB) | Capital IQ comparable export tab | As of 2026-08-17 | 2026-09-23 | Medium |
| Company Comparable Analysis Visa Inc.xls — Trading Multiples (115 KB) | Capital IQ comparable export tab | As of 2026-08-17 | 2026-09-23 | Low |
| Company Comparable Analysis Visa Inc.xls — Operating Statistics (115 KB) | Capital IQ comparable export tab | As of 2026-08-17 | 2026-09-23 | Low |
| Company Comparable Analysis Visa Inc.xls — Business Description (115 KB) | Capital IQ comparable export tab | As of 2026-08-17 | 2026-09-23 | Low |
| Company Comparable Analysis Visa Inc.xls — Implied Valuation (115 KB) | Capital IQ comparable export tab | As of 2026-08-17 | 2026-09-23 | Low |
| Company Comparable Analysis Visa Inc.xls — Valuation Chart (115 KB) | Capital IQ comparable export tab | As of 2026-08-17 | 2026-09-23 | Low |
| Visa Inc NYSE V Customers.rtf (1.5 MB) | Capital IQ customers export | Recently disclosed relationships; two-year scope | 2026-09-23 | Low |
| Visa Inc NYSE V Events Calendar.xls — Events Calendar (34 KB) | Capital IQ events export tab | Calendar year 2026 | 2026-09-23 | Low |
| Visa Inc NYSE V Financials_Annual.xls — Key Stats (327 KB) | Capital IQ financials export tab | FY25 and LTM through 2026-06-30 | 2026-09-23 | Medium |
| Visa Inc NYSE V Financials_Annual.xls — Income Statement (327 KB) | Capital IQ financials export tab | FY25 and LTM through 2026-06-30 | 2026-09-23 | High |
| Visa Inc NYSE V Financials_Annual.xls — Balance Sheet (327 KB) | Capital IQ financials export tab | FY25 and latest balance sheet through 2026-06-30 | 2026-09-23 | High |
| Visa Inc NYSE V Financials_Annual.xls — Cash Flow (327 KB) | Capital IQ financials export tab | FY25 and LTM through 2026-06-30 | 2026-09-23 | High |
| Visa Inc NYSE V Financials_Annual.xls — Multiples (327 KB) | Capital IQ financials export tab | Historical through 2026-08-07 | 2026-09-23 | Low |
| Visa Inc NYSE V Financials_Annual.xls — Historical Capitalization (327 KB) | Capital IQ financials export tab | Historical through 2026-06-30 | 2026-09-23 | Medium |
| Visa Inc NYSE V Financials_Annual.xls — Capital Structure Summary (327 KB) | Capital IQ financials export tab | Through 2026-06-30 | 2026-09-23 | High |
| Visa Inc NYSE V Financials_Annual.xls — Capital Structure Details (327 KB) | Capital IQ financials export tab | Latest as-reported block FY25; current filing source Q3 FY26 | 2026-09-23 | High |
| Visa Inc NYSE V Financials_Annual.xls — Ratios (327 KB) | Capital IQ financials export tab | Historical through 2026-06-30 | 2026-09-23 | Medium |
| Visa Inc NYSE V Financials_Annual.xls — Supplemental (327 KB) | Capital IQ financials export tab | Historical through 2026-06-30 | 2026-09-23 | Medium |
| Visa Inc NYSE V Financials_Annual.xls — Industry Specific (327 KB) | Capital IQ financials export tab | Historical through 2026-06-30 | 2026-09-23 | Low |
| Visa Inc NYSE V Financials_Annual.xls — Pension OPEB (327 KB) | Capital IQ financials export tab | Historical through 2026-06-30 | 2026-09-23 | High |
| Visa Inc NYSE V Financials_Annual.xls — Segments (327 KB) | Capital IQ financials export tab | FY25 and historical periods | 2026-09-23 | Low |
| Visa Inc NYSE V Financials_Quarterly.xls — Key Stats (561 KB) | Capital IQ financials export tab | LTM through 2026-06-30 | 2026-09-23 | Medium |
| Visa Inc NYSE V Financials_Quarterly.xls — Income Statement (561 KB) | Capital IQ financials export tab | Quarterly through Q3 FY26 (2026-06-30) | 2026-09-23 | High |
| Visa Inc NYSE V Financials_Quarterly.xls — Balance Sheet (561 KB) | Capital IQ financials export tab | Quarterly through 2026-06-30 | 2026-09-23 | High |
| Visa Inc NYSE V Financials_Quarterly.xls — Cash Flow (561 KB) | Capital IQ financials export tab | LTM through 2026-06-30 | 2026-09-23 | High |
| Visa Inc NYSE V Financials_Quarterly.xls — Multiples (561 KB) | Capital IQ financials export tab | Historical through 2026-08-07 | 2026-09-23 | Low |
| Visa Inc NYSE V Financials_Quarterly.xls — Historical Capitalization (561 KB) | Capital IQ financials export tab | Quarterly through 2026-06-30 | 2026-09-23 | Medium |
| Visa Inc NYSE V Financials_Quarterly.xls — Capital Structure Summary (561 KB) | Capital IQ financials export tab | Quarterly through Q3 FY26 (2026-06-30) | 2026-09-23 | High |
| Visa Inc NYSE V Financials_Quarterly.xls — Capital Structure Details (561 KB) | Capital IQ financials export tab | Q3 FY26 filed 2026-07-29; latest as-reported detail FY25 | 2026-09-23 | High |
| Visa Inc NYSE V Financials_Quarterly.xls — Ratios (561 KB) | Capital IQ financials export tab | Quarterly through 2026-06-30 | 2026-09-23 | Medium |
| Visa Inc NYSE V Financials_Quarterly.xls — Supplemental (561 KB) | Capital IQ financials export tab | Quarterly through 2026-06-30 | 2026-09-23 | Medium |
| Visa Inc NYSE V Financials_Quarterly.xls — Industry Specific (561 KB) | Capital IQ financials export tab | Quarterly through 2026-06-30 | 2026-09-23 | Low |
| Visa Inc NYSE V Financials_Quarterly.xls — Pension OPEB (561 KB) | Capital IQ financials export tab | Quarterly through 2026-06-30 | 2026-09-23 | High |
| Visa Inc NYSE V Financials_Quarterly.xls — Segments (561 KB) | Capital IQ financials export tab | Quarterly through Q3 FY26 (2026-06-30) | 2026-09-23 | Low |
| Visa Inc NYSE V Key Developments.rtf (1.0 MB) | Capital IQ key-developments export | Reporting period not stated in document | 2026-09-23 | Low |
| Visa Inc NYSE V Public Company Profile.rtf (293 KB) | Capital IQ company profile | Reporting period not stated in document | 2026-09-23 | Low |
| Visa Inc NYSE V Public Ownership History.xls — History (693 KB) | Capital IQ ownership export tab | Dated snapshots through 2026-06-30 plus latest column | 2026-09-23 | Low |
| Visa Inc NYSE V Public Ownership Insider Trading.xls — Insider Trading (382 KB) | Capital IQ insider-trading export tab | All history; latest trailing-12-month sidecar period ends 2026-07-31 | 2026-09-23 | Low |
| Visa Inc NYSE V Public Ownership Summary.rtf (303 KB) | Capital IQ ownership-summary export | Reporting period not stated in document | 2026-09-23 | Low |
| Visa Inc NYSE V Suppliers.rtf (167 KB) | Capital IQ suppliers export | Recently disclosed relationships; two-year scope | 2026-09-23 | Low |
| Visa Inc., Q1 2026 Earnings Call, Jan 29, 2026.pdf (413 KB) | Earnings transcript | Q1 FY26; 2026-01-29 | 2026-09-23 | Medium |
| Visa Inc., Q2 2026 Earnings Call, Apr 28, 2026.rtf (309 KB) | Earnings transcript | Q2 FY26; 2026-04-28 | 2026-09-23 | Medium |
| Visa Inc., Q3 2026 Earnings Call, Jul 28, 2026.rtf (304 KB) | Earnings transcript | Q3 FY26; 2026-07-28 | 2026-09-23 | Medium |
| Visa-Fiscal-2025-Annual-Report.pdf (10.8 MB) | Audited annual report | FY25 ended 2025-09-30 | 2026-09-23 | High |
| Visa-Inc-Q2-2026-Financial-Results-Presentation.pdf (186 KB) | Investor presentation | Q2 FY26 ended 2026-03-31 | 2026-09-23 | Medium |
| Visa-Inc-Q3-2026-Earnings-Release.pdf (273 KB) | Company earnings release | Q3 FY26 ended 2026-06-30 | 2026-09-23 | Medium |
| Visa-Inc-Q3-2026-Financial-Results-Presentation.pdf (183 KB) | Investor presentation | Q3 FY26 ended 2026-06-30 | 2026-09-23 | Medium |
| VisaIncNYSEVEstimatesReport.xls — Consensus (7.8 MB) | Capital IQ estimates export tab | FY26/FY27 consensus; current as of document refresh after Q3 FY26 | 2026-09-23 | Low |
| VisaIncNYSEVEstimatesReport.xls — Recent Changes (7.8 MB) | Capital IQ estimates export tab | Latest changes through 2026-08-11 | 2026-09-23 | Low |
| VisaIncNYSEVEstimatesReport.xls — Guidance (7.8 MB) | Capital IQ estimates export tab | Guidance history through 2026-07-28 | 2026-09-23 | Low |
| VisaIncNYSEVEstimatesReport.xls — Multiples (7.8 MB) | Capital IQ estimates export tab | Current/forward estimate periods; as-of date not separately stated | 2026-09-23 | Low |
| VisaIncNYSEVEstimatesReport.xls — Surprise (7.8 MB) | Capital IQ estimates export tab | Historical announced results through Q1 FY26 (2026-01-29) | 2026-09-23 | Low |
| VisaIncNYSEVEstimatesReport.xls — Trends (7.8 MB) | Capital IQ estimates export tab | Estimate history through current FY26/FY27 periods | 2026-09-23 | Low |
| VisaIncNYSEVEstimatesReport.xls — Revisions (7.8 MB) | Capital IQ estimates export tab | Revisions through August 2026 | 2026-09-23 | Low |
| Visa_Inc_-_Form_10-K(Nov-06-2025).doc (6.0 MB) | SEC annual filing | FY25 ended 2025-09-30; filed 2025-11-06 | 2026-09-23 | High |
| Visa_Inc_-_Form_10-Q(Jul-29-2026).doc (2.3 MB) | SEC quarterly filing | Q3 FY26 ended 2026-06-30; filed 2026-07-29 | 2026-09-23 | High |
| Visa_Inc_-_Form_DEF_14A(Dec-08-2025).doc (63.0 MB) | SEC proxy filing | FY25 proxy; filed 2025-12-08 | 2026-09-23 | Low |
| Visa_Short_Interest_Charting Excel Export Aug-17-2026 8_53 AM.xls — Chart 1 with Data (99 KB) | Short-interest export tab | Through 2026-08-17 | 2026-09-23 | Low |
| Visa_Short_Interest_Charting Excel Export Aug-17-2026 8_53 AM.xls — Attributions (99 KB) | Short-interest export tab | Through 2026-08-17 | 2026-09-23 | Low |

## 2. Most Recent Sources

| Source Type | Filename | Period / As-of | Age (months) |
|---|---|---|---|
| Annual filing (debt + contingency notes) | Visa_Inc_-_Form_10-K(Nov-06-2025).doc; Visa-Fiscal-2025-Annual-Report.pdf | FY25 ended 2025-09-30 | 12 |
| Quarterly filing | Visa_Inc_-_Form_10-Q(Jul-29-2026).doc | Q3 FY26 ended 2026-06-30 | 3 |
| Debt / capital-structure export | Visa Inc NYSE V Financials_Quarterly.xls — Capital Structure Summary and Details | Q3 FY26 filed 2026-07-29; debt detail’s latest as-reported block is FY25 | 3 / 12 |
| Fixed-income / maturities export | Visa Inc NYSE V Financials_Quarterly.xls — Capital Structure Details | Q3 FY26 filed 2026-07-29; dated notes and leases | 3 / 12 |
| Cash flow statement | Visa_Inc_-_Form_10-Q(Jul-29-2026).doc | Nine months ended 2026-06-30 | 3 |
| Covenant / credit-agreement disclosure | Visa_Inc_-_Form_10-Q(Jul-29-2026).doc, Note 8; Visa_Inc_-_Form_10-K(Nov-06-2025).doc, Note 10 | Q3 FY26 compliance statement; FY25 facility terms | 3 / 12 |
| Credit rating report | None in data pool | Not available | N/A |

The most recent primary sources are the Q3 FY26 Form 10-Q balance sheet, cash-flow statement and Note 8 debt table. The 10-Q identifies individual senior-note maturities, commercial paper, seniority/security and covenant compliance; the CIQ detail export is a tier-5 cross-check rather than a substitute for the filing. `[Visa Form 10-Q, quarter ended Jun. 30, 2026, Consolidated Balance Sheets; Consolidated Statements of Cash Flows; Note 8 (Debt)]` `[Capital IQ Financials Quarterly — Capital Structure Details, Q3 FY26 filed 2026-07-29]`

## 3. Solvency Usability Check

| Requirement | Available? (Y/N) | Source | Why It Matters |
|---|---|---|---|
| Balance sheet (recent) | Y | `[Visa Form 10-Q, quarter ended Jun. 30, 2026, Consolidated Balance Sheets]` | Debt, cash, equity base |
| Debt note (amounts by type) | Y | `[Visa Form 10-Q, quarter ended Jun. 30, 2026, Note 8 (Debt)]` | The debt stack and seniority |
| Maturity schedule | Y | `[Visa Form 10-Q, quarter ended Jun. 30, 2026, Note 8 (Debt)]`; `[Capital IQ Financials Quarterly — Capital Structure Details, Q3 FY26 filed 2026-07-29]` | The maturity wall and refinancing exposure |
| Cash flow statement | Y | `[Visa Form 10-Q, nine months ended Jun. 30, 2026, Consolidated Statements of Cash Flows]` | CFO/FCF for runway and coverage |
| Committed / undrawn facility detail | N | FY25 discloses a five-year unsecured revolving credit facility, but the latest 10-Q does not disclose current availability or reserves. `[Visa Form 10-K, FY25, Note 10 (Debt—Credit Facility)]` | True liquidity beyond cash |
| Interest expense detail | Y | `[Visa Form 10-Q, nine months ended Jun. 30, 2026, Consolidated Statements of Operations and Note 8 (Debt)]` | Coverage ratios |
| Covenant disclosure | N | The 10-Q says Visa complied with related covenants, but gives no covenant thresholds, calculations, headroom or covenant-EBITDA definition. `[Visa Form 10-Q, quarter ended Jun. 30, 2026, Note 8 (Debt)]` | Headroom to a breach |
| Lease detail (operating/finance) | Y | `[Visa Form 10-Q, quarter ended Jun. 30, 2026, Note 7 (Leases)]` | Debt-like obligations |
| Pension / OPEB funded status | Y | `[Visa Form 10-K, FY25, Note 11 (Pension and Other Postretirement Benefits)]`; `[Capital IQ Financials Quarterly — Pension OPEB, through Jun. 30, 2026]` | Off-balance-sheet obligation |
| Commitments & contingencies note | Y | `[Visa Form 10-Q, quarter ended Jun. 30, 2026, Notes 9, 14 and 16]` | Guarantees, LCs, litigation, tax claims |
| Credit ratings | N | No rating-agency report or dated rating action is in the frozen pool. | Refinancing access and cost |
| EBITDA base (for stress test) | Y | `[Visa Form 10-Q, nine months ended Jun. 30, 2026, Statements of Operations and Cash Flows]`; `[CIQ Financials→Income Statement, LTM Jun-30-2026]` | Required for the survival stress test |
| Business type (operating / bank / insurer / REIT / HoldCo-OpCo) | Y — operating payments-network company | `[Visa Form 10-K, FY25, Item 1 (Business)]` | Selects the correct framework (Business Type Applicability Gate) |
| Revolver terms + availability / borrowing base | N | FY25 terms identify a facility expiring May 2028 and zero FY25 draw, but no June-2026 availability/borrowing-base/reserve disclosure is in the filing. `[Visa Form 10-K, FY25, Note 10 (Debt—Credit Facility)]` | Determines usable liquidity and springing covenants |
| Covenant EBITDA definition (addbacks / caps) | N | Not disclosed in the 10-Q or the supplied credit-facility summary. `[Visa Form 10-Q, quarter ended Jun. 30, 2026, Note 8 (Debt)]` | Prevents “fake headroom” |
| HoldCo / OpCo structure disclosure | Y — no separate HoldCo debt identified | Senior notes are Visa Inc. senior unsecured obligations and are not guaranteed by subsidiaries. `[Visa Form 10-Q, quarter ended Jun. 30, 2026, Note 8 (Debt)]` | Structural subordination and upstreaming |
| Hedging / swaps disclosure | Y | Interest-rate swap fair-value adjustments are disclosed in the debt note. `[Visa Form 10-Q, quarter ended Jun. 30, 2026, Note 8 (Debt)]` | Floating-rate exposure net of hedges |
| Change-of-control / cross-default / rating triggers | N | The supplied filing material does not provide a complete trigger scan; the FY25 debt description gives payment and covenant-event defaults, but not a complete change-of-control/cross-default/rating-trigger read. `[Visa Form 10-K, FY25, debt-security description]` | Hidden accelerants to distress |

## 4. Cross-Module Availability

| Cross-Module Output | Available? (Y/N) |
|---|---|
| business-model/10_external-dependency.md | Y |
| business-model/11_capital-allocation-governance.md | Y |
| business-model/03_segment-map.md | Y |
| earnings/01_historical-financials.md | Y |
| earnings/06_earnings-quality.md | Y |
| earnings/03_margin-drivers.md | Y |

## 4A. Jurisdiction & Reporting Regime

| Item | Detected Value | Evidence |
|---|---|---|
| Primary listing country | United States | `[Visa Form 10-Q, quarter ended Jun. 30, 2026, Cover Page]` |
| Exchange | NYSE (ticker V) | `[Visa Form 10-Q, quarter ended Jun. 30, 2026, Cover Page]` |
| Filing regime (US SEC / India SEBI-LODR / UK / Other) | US SEC | `[Visa Form 10-Q, quarter ended Jun. 30, 2026, Cover Page]` |
| Reporting standard (US GAAP / IFRS / Ind AS) | US GAAP | `[Visa Form 10-Q, quarter ended Jun. 30, 2026, Basis of Presentation]` |
| Reporting currency (USD / INR / …) | USD | `[Visa Form 10-Q, quarter ended Jun. 30, 2026, Consolidated Financial Statements]` |
| Document language(s) | English | `[Visa Form 10-Q, quarter ended Jun. 30, 2026]` |

## 5. Partial-Data Flags

| Missing Data | Applies? (Y/N) | Affected Agents | Cap Applied |
|---|---|---|---|
| No debt maturity schedule | N | 02, 06 | None — individual debt maturities are disclosed in the 10-Q debt note. |
| No covenant disclosure | Y | 04, 06 | Covenant headroom not assessable; overall usefulness max 75. |
| No cash flow statement | N | 03, 04, 06 | None — nine-month cash flow statement is available. |
| No undrawn-facility disclosure | Y | 03 | Liquidity = cash and eligible liquid investments only; exclude the revolver from headline liquidity. |
| No interest-expense detail | N | 04 | None — interest expense is available. |
| No EBITDA base | N | 06 | None — reported operating results and an LTM vendor cross-check are available. |
| Revolver exists but current availability / borrowing-base detail is unknown | Y | 03, 06 | Liquidity-runway score max 60; describe the facility as committed but availability unknown. |
| Covenant EBITDA definition / addback detail absent | Y | 04, 06 | Headroom quality not assessable; do not infer covenant headroom from reported EBITDA. |

## 6. Sufficiency Verdict

- **Verdict:** Partial
- **Reason:** The Q3 FY26 10-Q provides a recent balance sheet, debt amounts and individual maturities, cash flow, interest expense, lease, pension, guarantee, commitment and legal-matter disclosures; however, it does not supply current revolver availability or numerical covenant terms, headroom and covenant-EBITDA definitions. `[Visa Form 10-Q, quarter ended Jun. 30, 2026, Notes 7–9, 14 and 16; Statements of Cash Flows]`
- **Sections that can run:** capital structure; maturity wall; liquidity on a cash-and-investments-only basis; coverage; contingencies; and the downside stress test. Coverage/covenants can identify covenant information as unavailable, but cannot calculate covenant headroom.
- **Active partial-data caps:**
  - Covenant headroom is **Not assessable**; overall usefulness is capped at 75.
  - Do not include the revolver in usable liquidity: current availability is unknown; liquidity-runway score is capped at 60.
  - Do not treat reported EBITDA as covenant EBITDA; addbacks and caps are not disclosed.
- **Critical missing items:**
  - Latest facility availability, including any letters-of-credit or other reserves.
  - Covenant thresholds, tested ratios, covenant-EBITDA definition and addback caps.
  - A current rating-agency report and a complete change-of-control/cross-default/rating-trigger disclosure.
- **Single highest-value missing document:** Latest revolving-credit-facility compliance certificate or lender availability report, showing current availability and the tested covenant definitions/thresholds.
