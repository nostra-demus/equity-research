# Solvency Data Triage — NU

NU is a regulated deposit-taking financial group, not an operating company financed principally by corporate debt. The current interim filing reports funding primarily through customer deposits and bank deposit receipts, and gives regulatory-capital ratios for the Brazilian prudential conglomerate, Mexico and Colombia. This triggers the financial-institution applicability override: this module's debt/EBITDA, FCF-runway and EBITDA-stress framework is not valid. [Q2 FY26 unaudited interim condensed consolidated financial statements, Notes 22, 32–33, pp.29, 40–43]

## 1. File Inventory

All 115 physical files in the frozen pool were reconciled to the immutable generation manifest: all have extraction status `ok` or `in-place`; none is a manifest failure, fallback-text result, missing dependency, or Drive pointer. The physical modified timestamp is the 2026-08-31 frozen-pool sync for all files and is not used as a reporting-date proxy. “Current” below means period information read from the document, not file metadata. The two `Filings/` folders contain physical duplicate copies, which are listed together so both copies are accounted for.

| Filename | Type | Period Covered | Last Modified | Solvency Relevance |
|---|---|---|---|---|
| `Filings/` **and** `Filings 2/`: `Nu_Holdings_Ltd_-_Form_20-F(Apr-08-2026).pdf`; `Nu_Holdings_Ltd_-_Form_Annual_Report(Feb-26-2026).pdf` | Annual filing duplicates | FY25, year ended 2025-12-31 | 2026-08-31 pool sync | High |
| `Filings/` **and** `Filings 2/`: `Nu_Holdings_Ltd_-_Form_Interim_Report(Aug-14-2026).pdf`; `Nu_Holdings_Ltd_-_Form_Preliminary_Interim_Report(Aug-13-2026).pdf`; `Nu_Holdings_Ltd_-_(Aug-13-2026).pdf` | Q2 FY26 interim filing / preliminary release duplicates | Three and six months ended 2026-06-30 | 2026-08-31 pool sync | High |
| `Filings/` **and** `Filings 2/`: `Nu_Holdings_Ltd_-_Form_Interim_Report(May-14-2026).pdf`; `Nu_Holdings_Ltd_-_Form_Interim_Report(May-15-2026).pdf`; `Nu_Holdings_Ltd_-_Form_Interim_Report(May-20-2026).pdf`; `Nu_Holdings_Ltd_-_Form_Preliminary_Interim_Report(May-14-2026).pdf` | Q1 FY26 interim / preliminary filing duplicates | Three months ended 2026-03-31 | 2026-08-31 pool sync | Medium |
| `Filings/` **and** `Filings 2/`: `Nu_Holdings_Ltd_-_Form_Interim_Report(Nov-17-2025).pdf`; `Nu_Holdings_Ltd_-_Form_Preliminary_Interim_Report(Nov-13-2025).pdf`; `Nu_Holdings_Ltd_-_(Aug-19-2025).pdf` | FY25 interim / preliminary filing duplicates | Q3 FY25 / as labelled | 2026-08-31 pool sync | Medium |
| `Filings/` **and** `Filings 2/`: `Nu_Holdings_Ltd_-_Form_Preliminary_Interim_Report(Feb-25-2026).pdf` | Q4 FY25 preliminary filing duplicate | FY25 / release dated 2026-02-25 | 2026-08-31 pool sync | Medium |
| `Filings/` **and** `Filings 2/`: `Nu_Holdings_Ltd_-_Form_Interim_Report(Aug-20-2026).pdf` | SEC-related interim filing duplicate; extract has no solvency detail | As labelled, 2026-08-20 | 2026-08-31 pool sync | Low |
| `Nu Holdings Ltd. Form 20-F filed on Apr-08-2026.pdf`; `Nu_Holdings_Ltd_-_Form_20-F(Apr-08-2026).pdf`; `Nu_Holdings_Ltd_-_Form_20-F(Apr-08-2026).doc` | FY25 Form 20-F copies | FY25, year ended 2025-12-31 | 2026-08-31 pool sync | High |
| `Nu_Holdings_Ltd_-_Form_20-F(Apr-16-2025).pdf`; `Nu_Holdings_Ltd_-_Form_20-F(Apr-16-2025).doc`; `Nu_Holdings_Ltd_-_Form_20-F(Apr-19-2024).pdf`; `Nu_Holdings_Ltd_-_Form_20-F(Apr-20-2023).pdf`; `Nu_Holdings_Ltd_-_Form_20-F(Apr-21-2022).pdf` | Historical annual filings | FY24 to FY21 | 2026-08-31 pool sync | Medium |
| `U21257060_20260331_20260331.pdf` | Filing / financial document | 2026-03-31 from filename; not used for the current solvency read | 2026-08-31 pool sync | Low |
| `Nu Holdings Ltd NYSE NU Financials Balance Sheet.xls`; `Nu Holdings Ltd NYSE NU Financials.xls` (Balance Sheet tab) | Capital IQ balance-sheet exports | Latest reported 2026-06-30 | 2026-08-31 pool sync | High |
| `Nu Holdings Ltd NYSE NU Financials Cash Flow.xls`; `Nu Holdings Ltd NYSE NU Financials.xls` (Cash Flow tab) | Capital IQ cash-flow exports | LTM to 2026-06-30 / annual history | 2026-08-31 pool sync | High |
| `Nu Holdings Ltd NYSE NU Financials Capital Structure Details.xls`; `Nu Holdings Ltd NYSE NU Financials Capital Structure Summary.xls`; `Nu Holdings Ltd NYSE NU Financials.xls` (both capital-structure tabs) | Capital IQ debt and maturity exports | FQ2 2026 / 2026-06-30 | 2026-08-31 pool sync | High |
| `Nu Holdings Ltd NYSE NU Fixed Income Securities Summary.xls`; `Nu Holdings Ltd NYSE NU Fixed Income S P Global Ratings.xls` | Vendor fixed-income and ratings exports | Securities dates through 2026-08-29; rating review 2025-09-22 | 2026-08-31 pool sync | High |
| `Nu Holdings Ltd NYSE NU Financials Income Statement.xls`; `Nu Holdings Ltd NYSE NU Financials Ratios.xls`; `Nu Holdings Ltd NYSE NU Financials Key Stats.xls`; `Nu Holdings Ltd NYSE NU Financials Historical Capitalization.xls`; `Nu Holdings Ltd NYSE NU Financials Supplemental.xls`; `Nu Holdings Ltd NYSE NU Financials Industry Specific.xls`; `Nu Holdings Ltd NYSE NU Financials Segments.xls`; `Nu Holdings Ltd NYSE NU Financials Segments (1).xls`; `Nu Holdings Ltd NYSE NU Financials Multiples.xls`; `Nu Holdings Ltd NYSE NU Financials Multiples (1).xls` | Capital IQ financial / sector exports | Latest annual and LTM period to 2026-06-30 where shown | 2026-08-31 pool sync | Medium |
| `Nu Holdings Ltd NYSE NU Financials.xls` (Key Stats, Income Statement, Balance Sheet, Cash Flow, Multiples, Historical Capitalization, Capital Structure Summary, Capital Structure Details, Ratios, Supplemental, Industry Specific, Pension OPEB, Segments tabs) | Consolidated Capital IQ financial workbook | Latest annual / LTM period to 2026-06-30 where shown | 2026-08-31 pool sync | High for balance sheet, cash flow and capital structure; Low for Pension OPEB (no data) |
| `Nu Holdings Ltd. (NYSE_NU) Corporate Structure Tree.xls`; `Nu Holdings Ltd NYSE NU Equity Listings.xls`; `Nu Holdings Ltd NYSE NU Equity Listings.rtf`; `Nu Holdings Ltd NYSE NU Public Company Profile.rtf`; `Nu Holdings Ltd NYSE NU Industry Classifications.rtf`; `Nu Holdings Ltd NYSE NU Long Business Description.rtf`; `Nu Holdings Ltd NYSE NU Products.xls`; `Nu Holdings Ltd NYSE NU Professionals.xls` | Company identity / structure exports | Current vendor profiles; no common issuer reporting period | 2026-08-31 pool sync | Medium |
| `Nu Holdings Ltd NYSE NU Board Members.xls`; `Nu Holdings Ltd NYSE NU Committees.xls`; `Nu Holdings Ltd NYSE NU Auditors.xls`; `Nu Holdings Ltd NYSE NU Takeover Defenses.xls`; `Nu Holdings Ltd NYSE NU Public Ownership Summary.rtf`; `Nu Holdings Ltd NYSE NU Public Ownership Detailed.xls`; `Nu Holdings Ltd NYSE NU Public Ownership History.xls`; `Nu Holdings Ltd NYSE NU Public Ownership Crossholdings.xls`; `Nu Holdings Ltd NYSE NU Public Ownership Insider Trading.xls`; `Nu Holdings Ltd NYSE NU Private Ownership.rtf` | Governance / ownership exports | Current vendor profile / dated holder records | 2026-08-31 pool sync | Low |
| `Nu Holdings Ltd NYSE NU Analyst Coverage.xls`; `Nu Holdings Ltd NYSE NU Analyst Coverage (1).xls`; `NuHoldingsLtdNYSENUEstimatesReport.xls`; `Charting Excel Export Aug-29-2026 2_02 PM.xls`; `Company Comparable Analysis Nu Holdings Ltd .xls`; `Nu Holdings Ltd NYSE NU Financials Multiples.xls`; `Nu Holdings Ltd NYSE NU Financials Multiples (1).xls`; `Nu Holdings Ltd NYSE NU Comparable M A Transactions.xls`; `Nu Holdings Ltd NYSE NU Comparable M A Transactions (1).xls` | Consensus / valuation / charting exports | As-of dates inside relevant sheets; chart export dated 2026-08-29 | 2026-08-31 pool sync | Low |
| `Nu Holdings Ltd NYSE NU Competitors.xls`; `Nu Holdings Ltd NYSE NU Customers.xls`; `Nu Holdings Ltd NYSE NU Suppliers.xls`; `Nu Holdings Ltd NYSE NU Strategic Alliances.xls`; `Nu Holdings Ltd NYSE NU Investment Analysis Co Investors.xls`; `Nu Holdings Ltd NYSE NU Investment Analysis Direct Investments.xls`; `Nu Holdings Ltd NYSE NU Corporate Timeline.xls`; `Nu Holdings Ltd NYSE NU Events Calendar.xls`; `Nu Holdings Ltd NYSE NU Key Developments.rtf`; `Transaction Summary M A Private Placements.xls`; `Transaction Summary Public Offerings.xls` | Commercial / transaction / timeline exports | Current vendor records or historical events | 2026-08-31 pool sync | Low |
| `Transcript Digest/Nu Holdings Ltd. - ShareholderAnalyst Call.pdf`; `Transcript Digest/Nu Holdings Ltd., Q1 2022 Earnings Call, May 16, 2022.pdf`; `Q1 2023 Earnings Call, May 15, 2023.pdf`; `Q1 2024 Earnings Call, May 14, 2024.pdf`; `Q1 2025 Earnings Call, May 13, 2025.pdf`; `Q1 2026 Earnings Call, May 14, 2026.pdf` | Transcript digests | Q1 FY22–FY26 / shareholder-analyst call | 2026-08-31 pool sync | Medium |
| `Transcript Digest/Nu Holdings Ltd., Q2 2022 Earnings Call, Aug 15, 2022.pdf`; `Q2 2023 Earnings Call, Aug 15, 2023.pdf`; `Q2 2024 Earnings Call, Aug 13, 2024.pdf`; `Q2 2025 Earnings Call, Aug 14, 2025.pdf`; `Q2 2026 Earnings Call, Aug 13, 2026.pdf` | Transcript digests | Q2 FY22–FY26 | 2026-08-31 pool sync | Medium |
| `Transcript Digest/Nu Holdings Ltd., Q3 2022 Earnings Call, Nov 14, 2022.pdf`; `Q3 2023 Earnings Call, Nov 14, 2023.pdf`; `Q3 2024 Earnings Call, Nov 13, 2024.pdf`; `Q3 2025 Earnings Call, Nov 13, 2025.pdf`; `Q4 2021 Earnings Call, Feb 22, 2022.pdf`; `Q4 2022 Earnings Call, Feb 14, 2023.pdf`; `Q4 2023 Earnings Call, Feb 22, 2024.pdf`; `Q4 2024 Earnings Call, Feb 20, 2025.pdf`; `Q4 2025 Earnings Call, Feb 25, 2026.pdf` | Transcript digests | Q3 FY22–FY25 and Q4 FY21–FY25 | 2026-08-31 pool sync | Medium |
| `NU_Holdings_Deep_Dive_15_Page_Memo_30_Aug_2026.pdf`; `Interactive_Brokers_Consolidated_Tax_Report_FY2025-26.xlsx`; `Interactive_Brokers_FY2025-26_CA_Audit_Note.txt`; `consolidated_tax_report_2025-26.xlsx`; `99The_Expectant_Father__th_Edition_.torrent` | User / broker material and unrelated file | Memo dated 2026-08-30; tax reports FY2025-26; torrent unrelated | 2026-08-31 pool sync | Low / none |

Every workbook sheet was extracted successfully. The material multi-tab solvency workbooks are: `Financials.xls`—Key Stats (85×9), Income Statement (94×7), Balance Sheet (89×7), Cash Flow (72×7), Multiples (61×9), Historical Capitalization (38×7), Capital Structure Summary (60×7), Capital Structure Details (33×10), Ratios (149×7), Supplemental (50×7), Industry Specific (68×7), Pension OPEB (15×6; “No Data Available”), Segments (77×7); and the one-tab dedicated Balance Sheet (89×7), Cash Flow (72×7), Capital Structure Summary (60×7), Capital Structure Details (29×10), Fixed Income Securities Summary (2,299×24), and S&P Global Ratings (20×8) exports. The remaining one-tab workbooks and the non-solvency multi-tab valuation, tax and estimates workbooks were also present and extracted `ok`; they do not determine sufficiency.

## 2. Most Recent Sources

| Source Type | Filename | Period / As-of | Age (months) |
|---|---|---|---|
| Annual filing (debt + contingency notes) | `Nu_Holdings_Ltd_-_Form_20-F(Apr-08-2026).pdf` | FY25, year ended 2025-12-31 | 8.0 |
| Quarterly filing | `Nu_Holdings_Ltd_-_Form_Interim_Report(Aug-14-2026).pdf` | Three and six months ended 2026-06-30 | 2.0 |
| Debt / capital-structure export | `Nu Holdings Ltd NYSE NU Financials Capital Structure Details.xls` | FQ2 2026 / 2026-06-30 | 2.0 |
| Fixed-income / maturities export | `Nu Holdings Ltd NYSE NU Fixed Income Securities Summary.xls` | Vendor securities record through 2026-08-29 | 0.1 |
| Cash flow statement | `Nu_Holdings_Ltd_-_Form_Interim_Report(Aug-14-2026).pdf` | Six months ended 2026-06-30 | 2.0 |
| Covenant / credit-agreement disclosure | `Nu_Holdings_Ltd_-_Form_Interim_Report(Aug-14-2026).pdf` | 2026-06-30, Note 24 | 2.0 |
| Credit rating report | `Nu Holdings Ltd NYSE NU Fixed Income S P Global Ratings.xls` | S&P issuer ratings; last review 2025-09-22 | 11.3 |

## 3. Solvency Usability Check

| Requirement | Available? (Y/N) | Source | Why It Matters |
|---|---|---|---|
| Balance sheet (recent) | Y | [Q2 FY26 unaudited interim statements, statement of financial position, p.7] | Shows financial assets, funding liabilities and equity. |
| Debt note (amounts by type) | Y | [Q2 FY26 unaudited interim statements, Note 24, pp.31–32] | Identifies financial bills and the margin-loan credit facility. |
| Maturity schedule | Y | [Q2 FY26 unaudited interim statements, Notes 24 and 32, pp.31, 40–41] | Shows contractual maturity buckets for borrowings and funding. |
| Cash flow statement | Y | [Q2 FY26 unaudited interim statements, statement of cash flows, p.11] | Shows cash movements, but is not an operating-company FCF measure. |
| Committed / undrawn facility detail | N | [Q2 FY26 unaudited interim statements, Note 24, pp.31–32] | Facility drawdown is disclosed; undrawn capacity / availability is not. |
| Interest expense detail | Y | [Q2 FY26 unaudited interim statements, Note 6, p.5] | Supports funding-cost analysis. |
| Covenant disclosure | Y | [Q2 FY26 unaudited interim statements, Note 24, p.32] | Filing states loan and financing agreements have no financial restrictive covenants at 2026-06-30. |
| Lease detail (operating/finance) | Y | [Q2 FY26 unaudited interim statements, statement of financial position, p.8] | Lease liabilities are separately reported. |
| Pension / OPEB funded status | N | [Capital IQ Financials, Pension OPEB sheet, latest annual data] | Vendor sheet says “No Data Available”; no funded-status disclosure identified. |
| Commitments & contingencies note | Y | [Q2 FY26 unaudited interim statements, Note 25, pp.32–33] | Covers provisions, possible-loss claims and judicial deposits. |
| Credit ratings | Y | [S&P Global Ratings export, issuer ratings, last review 2025-09-22] | Gives a vendor-distributed rating record; it is not a current agency rationale. |
| EBITDA base (for stress test) | N | [Capital IQ Financials, Income Statement sheet, LTM to 2026-06-30] | No reported EBITDA row; more importantly, EBITDA is not the correct bank-solvency denominator. |
| Business type (operating / bank / insurer / REIT / HoldCo-OpCo) | Y — financial institution | [Q2 FY26 unaudited interim statements, Notes 22, 32–33, pp.29, 40–43] | Selects the financial-institution framework. |
| Revolver terms + availability / borrowing base | N | [Q2 FY26 unaudited interim statements, Note 24, pp.31–32] | The collateralized margin-loan facility is described, but remaining availability is not. |
| Covenant EBITDA definition (addbacks / caps) | N / not applicable | [Q2 FY26 unaudited interim statements, Note 24, p.32] | No financial restrictive covenants are disclosed. |
| HoldCo / OpCo structure disclosure | Y | [FY25 Form 20-F, Item 4 and subsidiary disclosures] | The parent and regulated subsidiaries are identified; entity-level prudential analysis is still required. |
| Hedging / swaps disclosure | Y | [Q2 FY26 unaudited interim statements, Note 20 and Note 32, pp.24–25, 41–42] | Enables review of rate and FX hedging. |
| Change-of-control / cross-default / rating triggers | N | [FY25 Form 20-F, debt-risk and financing disclosures] | Specific contractual accelerants were not identified in the available disclosure. |

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
| Primary listing country | United States (issuer incorporated in Cayman Islands) | [FY25 Form 20-F, cover page] |
| Exchange | New York Stock Exchange (NYSE), ticker NU | [FY25 Form 20-F, cover page] |
| Filing regime (US SEC / India SEBI-LODR / UK / Other) | US SEC foreign private issuer: Form 20-F annual reporting and interim financial disclosure | [FY25 Form 20-F, cover page; Q2 FY26 unaudited interim statements, cover] |
| Reporting standard (US GAAP / IFRS / Ind AS) | IFRS Accounting Standards; Q2 interim statements under IAS 34 | [FY25 Form 20-F, “Presentation of Financial Information”; Q2 FY26 interim statements, auditor-review report, p.3] |
| Reporting currency (USD / INR / …) | USD (US$), with regulated subsidiaries using local functional currencies | [FY25 Form 20-F, “Presentation of Financial Information”] |
| Document language(s) | English; no non-English document was treated as a gap | [FY25 Form 20-F; Q2 FY26 interim statements] |

## 5. Partial-Data Flags

| Missing Data | Applies? (Y/N) | Affected Agents | Cap Applied |
|---|---|---|---|
| No debt maturity schedule | N | 02, 06 | None; a contractual maturity schedule is disclosed. |
| No covenant disclosure | N | 04, 06 | None; filing explicitly says there are no financial restrictive covenants. |
| No cash flow statement | N | 03, 04, 06 | None; a six-month cash-flow statement is available. |
| No undrawn-facility disclosure | Y | 03 | Liquidity cannot include undisclosed facility availability; regular corporate-liquidity output is in any event not applicable to this financial institution. |
| No interest-expense detail | N | 04 | None; Note 6 reports interest and other financial expenses. |
| No EBITDA base | Y | 06 | Stress test not runnable on the prescribed EBITDA basis; it must be replaced by a regulated-bank capital, liquidity and asset-quality stress framework. |

## 6. Sufficiency Verdict

- **Verdict:** Insufficient data
- **Reason:** Financial institution — requires a separate solvency framework (CET1 / LCR / NSFR / asset quality). NU's Q2 filing shows deposit-funded regulated subsidiaries and reports regulatory capital rather than an operating-company debt/EBITDA framework. [Q2 FY26 unaudited interim statements, Notes 22, 32–33, pp.29, 40–43]
- **Sections that can run:** None under the balance-sheet-survival module's operating-company framework. A separate financial-institution workstream can assess regulatory capital, liquidity, deposit funding, asset quality, interest-rate risk and legal-entity restrictions using the current filing.
- **Critical missing items:**
  - Current entity-level regulatory liquidity disclosures (LCR / NSFR or the local regulatory equivalents) and liquidity-buffer composition.
  - Current asset-quality detail sufficient to stress credit losses, including delinquency / non-performing exposures, coverage and cohort or vintage loss data.
  - Undrawn availability and legal terms for the margin-loan credit facility, plus any cross-default, change-of-control and rating-trigger provisions.
- **Single highest-value missing document:** Latest regulatory capital-and-liquidity returns for Nu Pagamentos, Nubank Mexico and Nu Colombia, including CET1 / Tier 1 / total capital, LCR / NSFR (or local equivalents), minimums and buffers.
