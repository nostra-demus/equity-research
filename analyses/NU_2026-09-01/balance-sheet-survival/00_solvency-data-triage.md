# Solvency Data Triage — NU

The frozen generation is complete: 115 physical sources, including 48 workbooks with 109 tabs, and no extraction failures. `Last Modified` is intentionally not used to determine period freshness; the period column uses the source’s stated period where available. No `external/` documents were present. The CIQ sidecar and relationship graph were read; neither changes the financial-institution applicability result.

## 1. File Inventory

| Filename | Type | Period Covered | Last Modified | Solvency Relevance |
|---|---|---|---|---|
| 99The_Expectant_Father__th_Edition_.torrent | Unrelated file | Not a reporting document | Snapshot mtime not used | Low |
| Charting Excel Export Aug-29-2026 2_02 PM.xls — Chart 1 with Data (284×2) | Chart export — workbook tab | 2026-08-29 | Snapshot mtime not used | Low |
| Charting Excel Export Aug-29-2026 2_02 PM.xls — Attributions (45×1) | Chart export — workbook tab | 2026-08-29 | Snapshot mtime not used | Low |
| Company Comparable Analysis Nu Holdings Ltd .xls — Financial Data; Trading Multiples; Operating Statistics; Business Description; Implied Valuation; Valuation Chart (50×17; 50×9; 50×13; 44×3; 69×9; 32×2) | Capital IQ vendor export — six workbook tabs | As-of not stated inside source | Snapshot mtime not used | Medium |
| Interactive_Brokers_Consolidated_Tax_Report_FY2025-26.xlsx — IBKR - Tax Summary; Consolidated Events; Capital Gains Detail; Income and Taxes; Closing Holdings; Performance Summary; Cash Report; SBI FX Rates; Audit & Reconciliation; Source Statement Tables; Unmapped Numeric Rows; Source Totals; Source Statement Text; README; LTCG; STCG; F&O; Intraday; Dividend; Interest; Bonds & SGB; Schedule FA; Schedule FSI; Form 67; Schedule TR (24×8; 37×17; 6×25; 35×15; 4×17; 4×15; 4×5; 5×10; 24×8; 1037×27; 1136×8; 60×7; 2122×4; 12×2; 146×18; 163×20; 51×10; 46×12; 68×10; 19×5; 25×12; 41×13; 33×10; 27×13; 28×8) | IBKR tax/portfolio export — 25 workbook tabs | FY2025-26 | Snapshot mtime not used | Low |
| Interactive_Brokers_FY2025-26_CA_Audit_Note.txt | IBKR tax/portfolio export | FY2025-26 | Snapshot mtime not used | Low |
| NU_Holdings_Deep_Dive_15_Page_Memo_30_Aug_2026.pdf | User memo | 2026-08-30 | Snapshot mtime not used | Medium |
| Nu Holdings Ltd NYSE NU Analyst Coverage (1).xls — Analyst Coverage (41×6) | Vendor export — workbook tab | As-of not stated inside source | Snapshot mtime not used | Low |
| Nu Holdings Ltd NYSE NU Analyst Coverage.xls — Analyst Coverage (41×6) | Vendor export — workbook tab | As-of not stated inside source | Snapshot mtime not used | Low |
| Nu Holdings Ltd NYSE NU Auditors.xls — Auditors (18×5) | Vendor export — workbook tab | As-of not stated inside source | Snapshot mtime not used | Low |
| Nu Holdings Ltd NYSE NU Board Members.xls — Board Members (28×25) | Vendor export — workbook tab | As-of not stated inside source | Snapshot mtime not used | Low |
| Nu Holdings Ltd NYSE NU Committees.xls — Committees (35×2) | Vendor export — workbook tab | As-of not stated inside source | Snapshot mtime not used | Low |
| Nu Holdings Ltd NYSE NU Comparable M A Transactions (1).xls — Comparable M A Transactions (17×9) | Vendor export — workbook tab | As-of not stated inside source | Snapshot mtime not used | Low |
| Nu Holdings Ltd NYSE NU Comparable M A Transactions.xls — Comparable M A Transactions (17×9) | Vendor export — workbook tab | As-of not stated inside source | Snapshot mtime not used | Low |
| Nu Holdings Ltd NYSE NU Competitors.xls — Competitors (89×8) | Vendor export — workbook tab | As-of not stated inside source | Snapshot mtime not used | Low |
| Nu Holdings Ltd NYSE NU Corporate Timeline.xls — Corporate Timeline (51×4) | Vendor export — workbook tab | As-of not stated inside source | Snapshot mtime not used | Low |
| Nu Holdings Ltd NYSE NU Customers.xls — Customers (16×8) | Vendor export — workbook tab | Recently disclosed relationships only | Snapshot mtime not used | Low |
| Nu Holdings Ltd NYSE NU Equity Listings.rtf; Nu Holdings Ltd NYSE NU Equity Listings.xls — Equity Listings (25×11) | Vendor export | As-of not stated inside source | Snapshot mtime not used | Low |
| Nu Holdings Ltd NYSE NU Events Calendar.xls — Events Calendar (27×3) | Vendor export — workbook tab | As-of not stated inside source | Snapshot mtime not used | Low |
| Nu Holdings Ltd NYSE NU Financials Balance Sheet.xls — Balance Sheet (89×7) | Capital IQ vendor export — workbook tab | Latest FQ2 2026 / LTM 2026-06-30 | Snapshot mtime not used | High |
| Nu Holdings Ltd NYSE NU Financials Capital Structure Details.xls — Capital Structure Details (29×10) | Capital IQ vendor export — workbook tab | FQ2 2026, 2026-06-30 | Snapshot mtime not used | High |
| Nu Holdings Ltd NYSE NU Financials Capital Structure Summary.xls — Capital Structure Summary (60×7) | Capital IQ vendor export — workbook tab | Latest FQ2 2026 / LTM 2026-06-30 | Snapshot mtime not used | High |
| Nu Holdings Ltd NYSE NU Financials Cash Flow.xls — Cash Flow (72×7) | Capital IQ vendor export — workbook tab | Latest FQ2 2026 / LTM 2026-06-30 | Snapshot mtime not used | High |
| Nu Holdings Ltd NYSE NU Financials Historical Capitalization.xls — Historical Capitalization (38×7); Income Statement.xls — Income Statement (94×7); Industry Specific.xls — Industry Specific (68×7); Key Stats.xls — Key Stats (80×9) | Capital IQ vendor exports — four workbook tabs | Latest FQ2 2026 / LTM 2026-06-30 | Snapshot mtime not used | Medium |
| Nu Holdings Ltd NYSE NU Financials Multiples (1).xls — Multiples (61×9); Nu Holdings Ltd NYSE NU Financials Multiples.xls — Multiples (60×9) | Capital IQ vendor exports — two workbook tabs | Latest FQ2 2026 / LTM 2026-06-30 | Snapshot mtime not used | Medium |
| Nu Holdings Ltd NYSE NU Financials Ratios.xls — Ratios (149×7); Segments (1).xls — Segments (77×7); Segments.xls — Segments (77×7); Supplemental.xls — Supplemental (50×7) | Capital IQ vendor exports — four workbook tabs | Latest FQ2 2026 / LTM 2026-06-30 | Snapshot mtime not used | Medium |
| Nu Holdings Ltd NYSE NU Financials.xls — Key Stats; Income Statement; Balance Sheet; Cash Flow; Multiples; Historical Capitalization; Capital Structure Summary; Capital Structure Details; Ratios; Supplemental; Industry Specific; Pension OPEB; Segments (85×9; 94×7; 89×7; 72×7; 61×9; 38×7; 60×7; 33×10; 149×7; 50×7; 68×7; 15×6; 77×7) | Capital IQ vendor export — 13 workbook tabs | Latest FQ2 2026 / LTM 2026-06-30 | Snapshot mtime not used | Medium |
| Nu Holdings Ltd NYSE NU Fixed Income S P Global Ratings.xls — S P Global Ratings (20×8) | Capital IQ vendor export — workbook tab | Rating dated 2023-09-22; review 2025-09-22 | Snapshot mtime not used | High |
| Nu Holdings Ltd NYSE NU Fixed Income Securities Summary.xls — Securities Summary (2299×24) | Capital IQ vendor export — workbook tab | As-of not stated; instrument maturities shown | Snapshot mtime not used | High |
| Nu Holdings Ltd NYSE NU Industry Classifications.rtf | Vendor export | As-of not stated inside source | Snapshot mtime not used | Low |
| Nu Holdings Ltd NYSE NU Investment Analysis Co Investors.xls — Co-Investors (53×3); Direct Investments.xls — Direct Investments (55×21) | Vendor export — two workbook tabs | As-of not stated inside source | Snapshot mtime not used | Low |
| Nu Holdings Ltd NYSE NU Key Developments.rtf; Long Business Description.rtf; Private Ownership.rtf; Public Company Profile.rtf; Public Ownership Summary.rtf | Vendor exports | As-of not stated inside source | Snapshot mtime not used | Low |
| Nu Holdings Ltd NYSE NU Products.xls — Products (31×5); Professionals.xls — Professionals (29×24) | Vendor exports — two workbook tabs | As-of not stated inside source | Snapshot mtime not used | Low |
| Nu Holdings Ltd NYSE NU Public Ownership Crossholdings.xls — Crossholdings (1840×7); Detailed.xls — Detailed (1346×15); History.xls — History (1499×5); Insider Trading.xls — Insider Trading (46×11) | Vendor exports — four workbook tabs | As-of not stated inside source | Snapshot mtime not used | Low |
| Nu Holdings Ltd NYSE NU Strategic Alliances.xls — Strategic Alliances (25×7); Suppliers.xls — Suppliers (25×8) | Vendor relationship exports — two workbook tabs | Recently disclosed relationships only | Snapshot mtime not used | Low |
| Nu Holdings Ltd NYSE NU Takeover Defenses.xls — Corporate Governance; Takeover Defenses; Compare Defenses (48×4; 26×4; 36×8) | Vendor export — three workbook tabs | As-of not stated inside source | Snapshot mtime not used | Low |
| Nu Holdings Ltd. (NYSE_NU) Corporate Structure Tree.xls — Nu Holdings Ltd NYSENU Corpor; Filtered Count; Aggregates (53×17; 22×4; 22×4) | Vendor export — three workbook tabs | As-of not stated inside source | Snapshot mtime not used | Medium |
| Nu Holdings Ltd. Form 20-F filed on Apr-08-2026.pdf | Audited annual filing | FY25, year ended 2025-12-31 | Snapshot mtime not used | High |
| NuHoldingsLtdNYSENUEstimatesReport.xls — Consensus; Recent Changes; Multiples; Surprise; Trends; Revisions (397×30; 265×10; 26×5; 200×20; 238×21; 357×17) | Capital IQ vendor export — six workbook tabs | As-of not stated inside source | Snapshot mtime not used | Medium |
| Nu_Holdings_Ltd_-_Form_20-F(Apr-08-2026).doc; Nu_Holdings_Ltd_-_Form_20-F(Apr-08-2026).pdf; duplicated PDF copies | Audited annual filing | FY25, year ended 2025-12-31 | Snapshot mtime not used | High |
| Nu_Holdings_Ltd_-_Form_20-F(Apr-16-2025).doc; Nu_Holdings_Ltd_-_Form_20-F(Apr-16-2025).pdf | Audited annual filing | FY24, year ended 2024-12-31 | Snapshot mtime not used | High |
| Nu_Holdings_Ltd_-_Form_20-F(Apr-19-2024).pdf; Nu_Holdings_Ltd_-_Form_20-F(Apr-20-2023).pdf; Nu_Holdings_Ltd_-_Form_20-F(Apr-21-2022).pdf | Audited annual filings | FY23; FY22; FY21 | Snapshot mtime not used | High |
| Transaction Summary M A Private Placements.xls — M A Private Placements (25×14); Transaction Summary Public Offerings.xls — Public Offerings (15×8) | Vendor exports — two workbook tabs | As-of not stated inside source | Snapshot mtime not used | Low |
| U21257060_20260331_20260331.pdf | Unclassified PDF | Period not established from the source review | Snapshot mtime not used | Low |
| consolidated_tax_report_2025-26.xlsx — LTCG; STCG; F&O; Intraday; Dividend; Interest; Bonds & SGB; Schedule FA; Schedule FSI; Form 67; Schedule TR (146×18; 163×20; 51×10; 46×12; 68×10; 19×5; 25×12; 41×13; 33×10; 27×13; 28×8) | IBKR tax/portfolio export — 11 workbook tabs | FY2025-26 | Snapshot mtime not used | Low |
| Nu_Holdings_Ltd_-_(Aug-13-2026).pdf; duplicated copy | Interim results | Q2/6M ended 2026-06-30 | Snapshot mtime not used | Medium |
| Nu_Holdings_Ltd_-_(Aug-19-2025).pdf; duplicated copy | Interim results | Q2/6M ended 2025-06-30 | Snapshot mtime not used | Medium |
| Nu_Holdings_Ltd_-_Form_20-F(Apr-08-2026).pdf; duplicated copy | Audited annual filing | FY25, year ended 2025-12-31 | Snapshot mtime not used | High |
| Nu_Holdings_Ltd_-_Form_Annual_Report(Feb-26-2026).pdf; duplicated copy | Annual report / FY25 results | FY25, year ended 2025-12-31 | Snapshot mtime not used | High |
| Nu_Holdings_Ltd_-_Form_Interim_Report(Aug-14-2026).pdf; duplicated copy | Unaudited interim filing | Q2/6M ended 2026-06-30 | Snapshot mtime not used | High |
| Nu_Holdings_Ltd_-_Form_Interim_Report(Aug-20-2026).pdf; duplicated copy | Interim filing | Q2/6M ended 2026-06-30 | Snapshot mtime not used | High |
| Nu_Holdings_Ltd_-_Form_Interim_Report(May-14-2026).pdf; May-15-2026; May-20-2026 — each duplicated | Interim filings | Q1/3M ended 2026-03-31 | Snapshot mtime not used | High |
| Nu_Holdings_Ltd_-_Form_Interim_Report(Nov-17-2025).pdf; duplicated copy | Interim filing | Q3/9M ended 2025-09-30 | Snapshot mtime not used | High |
| Nu_Holdings_Ltd_-_Form_Preliminary_Interim_Report(Aug-13-2026).pdf; duplicated copy | Preliminary interim results | Q2/6M ended 2026-06-30 | Snapshot mtime not used | High |
| Nu_Holdings_Ltd_-_Form_Preliminary_Interim_Report(Feb-25-2026).pdf; duplicated copy | Preliminary FY25 results | FY25 / Q4 2025 | Snapshot mtime not used | High |
| Nu_Holdings_Ltd_-_Form_Preliminary_Interim_Report(May-14-2026).pdf; duplicated copy | Preliminary Q1 results | Q1/3M ended 2026-03-31 | Snapshot mtime not used | High |
| Nu_Holdings_Ltd_-_Form_Preliminary_Interim_Report(Nov-13-2025).pdf; duplicated copy | Preliminary Q3 results | Q3/9M ended 2025-09-30 | Snapshot mtime not used | High |
| Nu Holdings Ltd. - ShareholderAnalyst Call.pdf | Transcript | As-of not stated inside source | Snapshot mtime not used | Medium |
| Nu Holdings Ltd., Q1 2022; Q1 2023; Q1 2024; Q1 2025; Q1 2026 Earnings Call PDFs | Transcripts — five physical files | Quarters stated in titles | Snapshot mtime not used | Medium |
| Nu Holdings Ltd., Q2 2022; Q2 2023; Q2 2024; Q2 2025; Q2 2026 Earnings Call PDFs | Transcripts — five physical files | Quarters stated in titles | Snapshot mtime not used | Medium |
| Nu Holdings Ltd., Q3 2022; Q3 2023; Q3 2024; Q3 2025 Earnings Call PDFs | Transcripts — four physical files | Quarters stated in titles | Snapshot mtime not used | Medium |
| Nu Holdings Ltd., Q4 2021; Q4 2022; Q4 2023; Q4 2024; Q4 2025 Earnings Call PDFs | Transcripts — five physical files | Quarters stated in titles | Snapshot mtime not used | Medium |

The rows above enumerate every physical source and every workbook tab in the immutable manifest; entries expressed as a semicolon-delimited group are separate source files or tabs whose title, dimensions, period and classification are individually stated in that row. No source had `fail`, `fallback-text`, `missing-dependency`, or `gdrive-pointer` status. The source/tabs are all frozen under `data/NU/` for citation purposes.

## 2. Most Recent Sources

| Source Type | Filename | Period / As-of | Age (months) |
|---|---|---|---|
| Annual filing (debt + contingency notes) | Nu Holdings Ltd. Form 20-F filed on Apr-08-2026.pdf | FY25, year ended 2025-12-31 | 8 |
| Quarterly filing | Nu_Holdings_Ltd_-_Form_Interim_Report(Aug-14-2026).pdf | Q2/6M ended 2026-06-30 | 2 |
| Debt / capital-structure export | Nu Holdings Ltd NYSE NU Financials Capital Structure Details.xls — Capital Structure Details | FQ2 2026, 2026-06-30 | 2 |
| Fixed-income / maturities export | Nu Holdings Ltd NYSE NU Fixed Income Securities Summary.xls — Securities Summary | As-of not stated; maturities shown | Not assessable |
| Cash flow statement | Nu_Holdings_Ltd_-_Form_Interim_Report(Aug-14-2026).pdf | Q2/6M ended 2026-06-30 | 2 |
| Covenant / credit-agreement disclosure | Nu_Holdings_Ltd_-_Form_Interim_Report(Aug-14-2026).pdf | Q2/6M ended 2026-06-30 | 2 |
| Credit rating report | Nu Holdings Ltd NYSE NU Fixed Income S P Global Ratings.xls — S P Global Ratings | last review 2025-09-22 | 11 |

## 3. Solvency Usability Check

| Requirement | Available? (Y/N) | Source | Why It Matters |
|---|---|---|---|
| Balance sheet (recent) | Y | [Q2 2026 Interim Report, interim statement of financial position] | Debt, cash, equity base |
| Debt note (amounts by type) | Y | [Q2 2026 Interim Report, Note 24 (Borrowings and financing)] | The debt stack and seniority |
| Maturity schedule | Y | [Q2 2026 Interim Report, Note 22 (Deposits) and Note 32 (Management of financial risks)]; [Capital IQ Capital Structure Details, FQ2 2026] | The maturity wall and refinancing exposure |
| Cash flow statement | Y | [Q2 2026 Interim Report, interim statement of cash flows] | CFO/FCF for runway and coverage |
| Committed / undrawn facility detail | N | Capital-structure sources identify a margin-loan facility but not committed availability | True liquidity beyond cash |
| Interest expense detail | Y | [Q2 2026 Interim Report, statement of income and Notes 6/19] | Coverage ratios |
| Covenant disclosure | Y | [Q2 2026 Interim Report, Note 24 (Borrowings and financing)] — no financial restrictive covenants reported | Headroom to a breach |
| Lease detail (operating/finance) | Y | [Q2 2026 Interim Report, statement of financial position (Lease liabilities)] | Debt-like obligations |
| Pension / OPEB funded status | N | No primary filing pension/OPEB disclosure located; vendor Pension OPEB tab is not a substitute | Off-balance-sheet obligation |
| Commitments & contingencies note | Y | [Q2 2026 Interim Report, Note 25 (Provisions and contingent liabilities)] | Guarantees, LCs, litigation, tax claims |
| Credit ratings | Y | [Capital IQ S&P Global Ratings export, last review 2025-09-22] | Refinancing access and cost |
| EBITDA base (for stress test) | N | CIQ cash-flow workbook is explicitly a Bank template and the CIQ facts sidecar marks LTM EBITDA unknown | Required for the corporate survival stress test |
| Business type (operating / bank / insurer / REIT / HoldCo-OpCo) | Financial institution | [FY2025 Form 20-F, Item 4.B and regulation discussion]; [Q2 2026 Interim Report, Note 33 (Capital management)] | Selects the correct framework (Business Type Applicability Gate) |
| Revolver terms + availability / borrowing base | N | Capital IQ Capital Structure Details, FQ2 2026 | Determines usable liquidity and springing covenants |
| Covenant EBITDA definition (addbacks / caps) | N/A — no reported financial restrictive covenants | [Q2 2026 Interim Report, Note 24] | Prevents “fake headroom” |
| HoldCo / OpCo structure disclosure | Y | [FY2025 Form 20-F, Exhibit 8.1 (Subsidiaries)]; [Capital IQ Corporate Structure Tree] | Structural subordination and upstreaming |
| Hedging / swaps disclosure | Y | [Q2 2026 Interim Report, Note 20 (Derivatives and hedge accounting)] | Floating-rate exposure net of hedges |
| Change-of-control / cross-default / rating triggers | N | Not disclosed in the data pool | Hidden accelerants to distress |

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
| Primary listing country | United States (issuer incorporated in Cayman Islands) | [FY2025 Form 20-F, cover page and Item 4.B] |
| Exchange | New York Stock Exchange — NYSE: NU | [FY2025 Form 20-F, cover page] |
| Filing regime (US SEC / India SEBI-LODR / UK / Other) | SEC foreign private issuer — Form 20-F and interim results | [FY2025 Form 20-F, cover page]; [Q2 2026 Interim Report, cover] |
| Reporting standard (US GAAP / IFRS / Ind AS) | IFRS Accounting Standards | [FY2025 Form 20-F, Item 3 (Presentation of Financial Information)] |
| Reporting currency (USD / INR / …) | USD | [FY2025 Form 20-F, Item 3 (Presentation of Financial Information)] |
| Document language(s) | English | [FY2025 Form 20-F; Q2 2026 Interim Report] |

NU is a regulated financial-services group, not an operating company for which debt/EBITDA and corporate FCF runway answer the survival question. Its FY25 Form 20-F identifies regulated Brazilian financial-institution subsidiaries, and the Q2 report presents regulatory capital for Nu Pagamentos’ BCB Type 3 prudential conglomerate, including CET1, Tier 1 and CAR. The Q2 report also reports deposits, loans, compulsory central-bank deposits and liquidity-risk maturity tables. [FY2025 Form 20-F, Item 4.B (Regulation)]; [Q2 2026 Interim Report, Notes 22, 32 and 33]

## 5. Partial-Data Flags

| Missing Data | Applies? (Y/N) | Affected Agents | Cap Applied |
|---|---|---|---|
| No debt maturity schedule | N | 02, 06 | Not applicable — maturity information is present, but the corporate-debt framework is overridden |
| No covenant disclosure | N | 04, 06 | Not applicable — Q2 filing states no financial restrictive covenants on loan and financing agreements |
| No cash flow statement | N | 03, 04, 06 | Not applicable — Q2 interim cash-flow statement is present |
| No undrawn-facility disclosure | Y | 03 | Corporate liquidity = cash only under the default rule; do not use this rule for NU’s regulated-deposit model |
| No interest-expense detail | N | 04 | Not applicable — interest detail is available |
| No EBITDA base | Y | 06 | Corporate EBITDA stress test not runnable; financial-institution override requires regulatory-capital, liquidity and asset-quality stress testing instead |

## 6. Sufficiency Verdict

- **Verdict:** Insufficient data
- **Reason:** Financial institution — requires a separate solvency framework (CET1 / LCR / NSFR / asset quality). NU’s filings establish a regulated digital-financial-services group with deposit funding, loan and credit-card exposures, central-bank reserves and prudential capital; corporate debt/EBITDA, coverage and FCF-runway tests are not fit for purpose. [FY2025 Form 20-F, Item 4.B (Regulation)]; [Q2 2026 Interim Report, Notes 22, 32 and 33]
- **Sections that can run:** None of the standard capital-structure, maturity-wall, liquidity, coverage/covenants, contingencies, or EBITDA stress-test agents should run under this module’s corporate-debt framework. A dedicated financial-institution solvency review can use the available regulatory-capital, liquidity-risk and credit-risk disclosures.
- **Critical missing items:**
  - A financial-institution-specific module is required; this is an applicability failure, not a filing-data failure.
  - Committed margin-loan availability / borrowing-base detail is not disclosed in the pool.
  - The primary filing does not disclose change-of-control, cross-default or rating-trigger terms in a way that supports a complete corporate debt-document scan.
- **Single highest-value missing document:** Latest primary-regulator prudential return for each material regulated perimeter, showing CET1/Tier 1/total capital, RWA, liquidity coverage or equivalent, asset quality and provisioning. It would independently validate and complete a dedicated bank-style solvency framework.
