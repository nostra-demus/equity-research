# Data Triage — EMAR

## 1. File Inventory

All 46 files found in `data/EMAR/`. The extractor ran successfully: 20 workbooks yielded 57 tabs; 0 failures. The manifest status for every source is `ok`. Periods below are parsed from inside each document, not from file-system timestamps.

### PDF filings

| Filename | Type | Period Covered (from inside doc) | File Size | Notes |
|---|---|---|---|---|
| `Emaar_Properties_PJSC-Annual_Report(Mar-14-2025).pdf` | Annual filing (full) | FY2024 (year ended 31 Dec 2024) | 19 MB | Comprehensive Arabic/English annual report; duplicate of the `-Form-` version below |
| `Emaar_Properties_PJSC_-_Form_Annual_Report(Mar-14-2025).pdf` | Annual filing (full) | FY2024 (year ended 31 Dec 2024) | 19 MB | Same document; DFM "Form" prefix is the portal's wrapper name |
| `Emaar_Properties_PJSC-Preliminary_Annual_Report(Feb-12-2026).pdf` | Investor presentation / FY2025 results | FY2025 (year ended 31 Dec 2025) | 4.7 MB | "Prepared for the Future" investor deck covering Q4 & FY2025; duplicate of the `-Form-` version below |
| `Emaar_Properties_PJSC_-_Form_Preliminary_Annual_Report(Feb-12-2026).pdf` | Investor presentation / FY2025 results | FY2025 (year ended 31 Dec 2025) | 4.7 MB | Same document |
| `Emaar_Properties_PJSC_-_Form_Preliminary_Annual_Report(Mar-30-2026).pdf` | Preliminary annual results release | FY2025 (year ended 31 Dec 2025) | 608 KB | DFM press release; references data as of 31 Dec 2025 |
| `Emaar_Properties_PJSC_-_Form_Preliminary_Annual_Report(Feb-08-2024).pdf` | Preliminary annual results release | FY2023 (year ended 31 Dec 2023) | 1.5 MB | Historical |
| `Emaar_Properties_PJSC_-_Form_Preliminary_Annual_Report(Feb-14-2023).pdf` | Preliminary annual results release | FY2022 (year ended 31 Dec 2022) | 1.6 MB | Historical |
| `Emaar_Properties_PJSC_-_Form_Annual_Report(Nov-03-2020).pdf` | Annual filing (full) | FY2019 (year ended 31 Dec 2019) | 16 MB | Historical |
| `Emaar_Properties_PJSC_-_Form_Annual_Report(Dec-20-2019).pdf` | Annual filing (full) | FY2018 (year ended 31 Dec 2018) | 14 MB | Historical |
| `Emaar_Properties_PJSC_-_Form_Preliminary_Interim_Report(Apr-08-2026).pdf` | Quarterly filing (preliminary interim results) | Q1 2025 (3 months ended 31 Mar 2025) | 488 KB | Published 8 May 2025; DFM crawl date Apr-08-2026 is a portal artefact |
| `Emaar_Properties_PJSC_-_Form_Preliminary_Interim_Report(Dec-17-2025).pdf` | Preliminary interim results / material disclosure | Dec 2025 press release ("Dubai Square" project announcement) | 88 KB | Exchange announcement, not quarterly results |
| `Emaar_Properties_PJSC_-_Form_Preliminary_Interim_Report(Dec-03-2025).pdf` | Preliminary interim results / material disclosure | Nov 2025 press release (NYE event announcement) | 115 KB | Exchange announcement, not quarterly results |
| `Emaar_Properties_PJSC_-_Form_Preliminary_Interim_Report(Nov-17-2025).pdf` | Preliminary interim / material disclosure | Nov 2025 | 596 KB | Garbled extraction (OCR artefacts); content unreadable |
| `Emaar_Properties_PJSC_-_Form_Preliminary_Interim_Report(May-14-2024).pdf` | Quarterly filing (preliminary interim) | Q1 2024 (3 months ended 31 Mar 2024) | 6.2 MB | Historical |
| `Emaar_Properties_PJSC_-_Form_Preliminary_Interim_Report(Aug-30-2023).pdf` | Quarterly filing (preliminary interim) | H1 2023 (6 months ended 30 Jun 2023) | 6.6 MB | Historical |
| `Emaar_Properties_PJSC_-_Form_Preliminary_Interim_Report(Dec-13-2022).pdf` | Quarterly filing (preliminary interim) | 9M 2022 (9 months ended 30 Sep 2022) | 6.3 MB | Historical |
| `Emaar_Properties_PJSC_-_Form_Preliminary_Interim_Report(Aug-12-2020).pdf` | Quarterly filing (preliminary interim) | H1 2020 (6 months ended 30 Jun 2020) | 1.4 MB | Historical |
| `Emaar_Properties_PJSC_-_Form_Preliminary_Interim_Report(Aug-11-2021).pdf` | Quarterly filing (preliminary interim) | H1 2021 (6 months ended 30 Jun 2021) | 1.8 MB | Historical |
| `Emaar_Properties_PJSC_-_Form_Preliminary_Interim_Report(Nov-14-2021).pdf` | Quarterly filing (preliminary interim) | 9M 2021 (9 months ended 30 Sep 2021) | 571 KB | Historical |
| `Emaar_Properties_PJSC_-_Form_Preliminary_Interim_Report(Feb-14-2022).pdf` | Quarterly filing (preliminary interim) | FY2021 full-year results | 1.6 MB | Historical |
| `Emaar_Properties_PJSC_-_Form_Preliminary_Interim_Report(May-13-2022).pdf` | Quarterly filing (preliminary interim) | Q1 2022 (3 months ended 31 Mar 2022) | 1.4 MB | Historical |

### Workbook data exports (Capital IQ — each tab listed as its own row)

| Filename | Tab | Type | Period Covered | Rows×Cols | Notes |
|---|---|---|---|---|---|
| `01_Consensus.xlsx` | Consensus | Data export — consensus estimates | FY2026 current year; NTM | 517×81 | Capital IQ; accounting standard IFRS; fiscal year end Dec-31 |
| `02_Recent Changes.xlsx` | Recent Changes | Data export — estimate revisions | Recent | 266×10 | Capital IQ |
| `03_Guidance.xlsx` | Guidance | Data export — management guidance | Current | 42×3 | Capital IQ |
| `04_Multiples.xlsx` | Multiples | Data export — trading multiples | FY2026–FY2028; NTM | 26×7 | Capital IQ |
| `05_Surprise.xlsx` | Surprise | Data export — earnings surprise history | Multi-year historical | 248×74 | Capital IQ |
| `06_Trends.xlsx` | Trends | Data export — estimate trends | Multi-period | 306×15 | Capital IQ |
| `07_Revisions.xlsx` | Revisions | Data export — estimate revisions log | Multi-period | 476×13 | Capital IQ |
| `EmaarPropertiesPJSCDFMEMAAREstimatesReport.xls` | Consensus | Data export — consensus estimates | FY2026; NTM | 514×81 | Capital IQ (duplicate of 01_Consensus with minor row-count delta) |
| `EmaarPropertiesPJSCDFMEMAAREstimatesReport.xls` | Recent Changes | Data export | Recent | 265×10 | |
| `EmaarPropertiesPJSCDFMEMAAREstimatesReport.xls` | Guidance | Data export | Current | 42×3 | |
| `EmaarPropertiesPJSCDFMEMAAREstimatesReport.xls` | Multiples | Data export | FY2026–FY2028 | 25×7 | |
| `EmaarPropertiesPJSCDFMEMAAREstimatesReport.xls` | Surprise | Data export | Historical | 245×74 | |
| `EmaarPropertiesPJSCDFMEMAAREstimatesReport.xls` | Trends | Data export | Multi-period | 305×15 | |
| `EmaarPropertiesPJSCDFMEMAAREstimatesReport.xls` | Revisions | Data export | Multi-period | 467×13 | |
| `Company Comparable Analysis Emaar Properties PJSC.xls` | Financial Data | Data export — comp financials | Multi-year (through FY2025) | 50×17 | Capital IQ comparable set |
| `Company Comparable Analysis Emaar Properties PJSC.xls` | Trading Multiples | Data export — comp multiples | Current | 50×9 | |
| `Company Comparable Analysis Emaar Properties PJSC.xls` | Operating Statistics | Data export — comp ops | Current | 50×13 | |
| `Company Comparable Analysis Emaar Properties PJSC.xls` | Business Description | Data export — comp descriptions | — | 44×3 | |
| `Company Comparable Analysis Emaar Properties PJSC.xls` | Implied Valuation | Data export — implied valuations | Current | 69×9 | |
| `Company Comparable Analysis Emaar Properties PJSC.xls` | Valuation Chart | Chart data | Current | 32×2 | |
| `Company Comparable Analysis Emaar Properties PJSC.xls` | Credit Health Panel | Data export — credit metrics | Current | 48×10 | |
| `Company Comparable Analysis Emaar Properties PJSC.xls` | Disclaimer | Disclaimer text | — | 26×1 | |
| `Emaar Properties PJSC DFM EMAAR Financials_Annual.xls` | Key Stats | Data export — annual financials | FY2021–FY2025 | 91×9 | Capital IQ; currency AED; IFRS |
| `Emaar Properties PJSC DFM EMAAR Financials_Annual.xls` | Income Statement | Data export | FY2021–FY2025; LTM Mar-31-2026 | 98×7 | |
| `Emaar Properties PJSC DFM EMAAR Financials_Annual.xls` | Balance Sheet | Data export | FY2021–FY2025; LTM Mar-31-2026 | 101×7 | |
| `Emaar Properties PJSC DFM EMAAR Financials_Annual.xls` | Cash Flow | Data export | FY2021–FY2025; LTM Mar-31-2026 | 77×7 | |
| `Emaar Properties PJSC DFM EMAAR Financials_Annual.xls` | Multiples | Data export | FY2021–FY2025 | 91×9 | |
| `Emaar Properties PJSC DFM EMAAR Financials_Annual.xls` | Historical Capitalization | Data export | FY2021–FY2025 | 39×7 | |
| `Emaar Properties PJSC DFM EMAAR Financials_Annual.xls` | Capital Structure Summary | Data export | FY2021–FY2025 | 96×7 | |
| `Emaar Properties PJSC DFM EMAAR Financials_Annual.xls` | Capital Structure Details | Data export | As of latest | 44×10 | |
| `Emaar Properties PJSC DFM EMAAR Financials_Annual.xls` | Ratios | Data export | FY2021–FY2025 | 161×7 | |
| `Emaar Properties PJSC DFM EMAAR Financials_Annual.xls` | Supplemental | Data export | FY2021–FY2025 | 38×7 | |
| `Emaar Properties PJSC DFM EMAAR Financials_Annual.xls` | Industry Specific | Data export — real estate KPIs | FY2021–FY2025 | 65×7 | |
| `Emaar Properties PJSC DFM EMAAR Financials_Annual.xls` | Pension OPEB | Data export | FY2021–FY2025 | 44×7 | |
| `Emaar Properties PJSC DFM EMAAR Financials_Annual.xls` | Segments | Data export | FY2021–FY2025 | 84×7 | |
| `Emaar Properties PJSC DFM EMAAR Financials_Quarterly.xls` | Key Stats | Data export — quarterly financials | Q1 2022–Q1 2026 | 91×7 | Capital IQ; most recent period Q1 Mar-31-2026 |
| `Emaar Properties PJSC DFM EMAAR Financials_Quarterly.xls` | Income Statement | Data export | Q1 2022–Q1 2026 | 95×18 | |
| `Emaar Properties PJSC DFM EMAAR Financials_Quarterly.xls` | Balance Sheet | Data export | Q1 2022–Q1 2026 | 99×18 | |
| `Emaar Properties PJSC DFM EMAAR Financials_Quarterly.xls` | Cash Flow | Data export | Q1 2022–Q1 2026 | 77×18 | |
| `Emaar Properties PJSC DFM EMAAR Financials_Quarterly.xls` | Multiples | Data export | Q1 2022–Q1 2026 | 91×19 | |
| `Emaar Properties PJSC DFM EMAAR Financials_Quarterly.xls` | Historical Capitalization | Data export | Q1 2022–Q1 2026 | 39×18 | |
| `Emaar Properties PJSC DFM EMAAR Financials_Quarterly.xls` | Capital Structure Summary | Data export | Q1 2022–Q1 2026 | 74×35 | |
| `Emaar Properties PJSC DFM EMAAR Financials_Quarterly.xls` | Capital Structure Details | Data export | As of latest | 44×10 | |
| `Emaar Properties PJSC DFM EMAAR Financials_Quarterly.xls` | Ratios | Data export | Q1 2022–Q1 2026 | 161×18 | |
| `Emaar Properties PJSC DFM EMAAR Financials_Quarterly.xls` | Supplemental | Data export | Q1 2022–Q1 2026 | 26×18 | |
| `Emaar Properties PJSC DFM EMAAR Financials_Quarterly.xls` | Industry Specific | Data export | Q1 2022–Q1 2026 | 65×18 | |
| `Emaar Properties PJSC DFM EMAAR Financials_Quarterly.xls` | Pension OPEB | Data export | Q1 2022–Q1 2026 | 30×18 | |
| `Emaar Properties PJSC DFM EMAAR Financials_Quarterly.xls` | Segments | Data export | Q1 2022–Q1 2026 | 84×18 | |
| `Emaar Properties PJSC DFM EMAAR Analyst Coverage.xls` | Analyst Coverage | Data export — sell-side coverage list | Current | 34×6 | Capital IQ |
| `Emaar Properties PJSC DFM EMAAR Board Members.xls` | Board Members | Data export — governance | Current | 29×25 | Capital IQ |
| `Emaar Properties PJSC DFM EMAAR Compensation Summary Compensation.xls` | Summary Compensation | Data export — pay | Current | 27×18 | Capital IQ |
| `Emaar Properties PJSC DFM EMAAR Customers.xls` | Customers | Data export — customer data | Current | 40×8 | Capital IQ |
| `Emaar Properties PJSC DFM EMAAR Events Calendar.xls` | Events Calendar | Data export — corporate events | Current | 23×3 | Capital IQ |
| `Emaar Properties PJSC DFM EMAAR Investment Analysis Direct Investments.xls` | Direct Investments | Data export — investment portfolio | Current | 69×21 | Capital IQ |
| `Emaar Properties PJSC DFM EMAAR Key Developments.xls` | Key Developments | Data export — material events log | Recent (up to mid-2026 per export) | 49×7 | Capital IQ |
| `Emaar Properties PJSC DFM EMAAR Professionals.xls` | Professionals | Data export — senior management | Current | 33×24 | Capital IQ |
| `Emaar Properties PJSC DFM EMAAR Suppliers.xls` | Suppliers | Data export — supplier list | Current | 46×8 | Capital IQ |

### RTF text exports

| Filename | Type | Period Covered | File Size | Notes |
|---|---|---|---|---|
| `Emaar Properties PJSC DFM EMAAR Private Ownership.rtf` | Data export — private ownership detail | Current | 99 KB | Capital IQ |
| `Emaar Properties PJSC DFM EMAAR Public Ownership Summary.rtf` | Data export — public shareholding | Current | 271 KB | Capital IQ |
| `Emaar Properties PJSC DFM EMAAR Strategic Alliances.rtf` | Data export — JVs/alliances | Current | 83 KB | Capital IQ |

---

## 2. Most Recent Sources

| Source Type | Filename | Period | Age (months as of 2026-07-03) |
|---|---|---|---|
| Annual filing (full audited) | `Emaar_Properties_PJSC-Annual_Report(Mar-14-2025).pdf` | FY2024 (year ended 31 Dec 2024) | ~15 months |
| Preliminary full-year results | `Emaar_Properties_PJSC_-_Form_Preliminary_Annual_Report(Mar-30-2026).pdf` | FY2025 (year ended 31 Dec 2025) | ~3 months |
| Investor deck (FY2025 results) | `Emaar_Properties_PJSC-Preliminary_Annual_Report(Feb-12-2026).pdf` | FY2025 (year ended 31 Dec 2025) | ~5 months |
| Quarterly filing (preliminary interim) | `Emaar_Properties_PJSC_-_Form_Preliminary_Interim_Report(Apr-08-2026).pdf` | Q1 2025 (3 months ended 31 Mar 2025) | ~15 months (this is Q1 2025, not Q1 2026) |
| Quarterly data export (Capital IQ) | `Emaar Properties PJSC DFM EMAAR Financials_Quarterly.xls` | Q1 2026 (3 months ended 31 Mar 2026) | ~3 months |
| Consensus estimates | `01_Consensus.xlsx` | FY2026 forward (current fiscal year end Dec-31-2026) | Current |
| Data export | `Emaar Properties PJSC DFM EMAAR Financials_Annual.xls` | FY2025 annual + LTM Mar-31-2026 | ~3 months |

**Note on the quarterly PDF filing:** The file named `…Preliminary_Interim_Report(Apr-08-2026).pdf` contains the Q1 2025 press release (issued 8 May 2025, period ended 31 March 2025). The Apr-08-2026 date in the filename is the DFM portal's crawl/retrieval date, not the report publication date. The most recent quarterly financials in structured form come from the Capital IQ quarterly export which covers through Q1 2026 (Mar-31-2026).

**Note on the FY2025 annual filing:** The audited FY2025 full annual report (equivalent to the FY2024 document filed Mar-14-2025) has not yet appeared in the pool. The pool holds: (a) a preliminary FY2025 results press release (Mar-30-2026) and (b) an FY2025 investor presentation (Feb-12-2026). Audited FY2025 financials with full notes will likely be filed around March–April 2026; they are absent from the pool. However, the Capital IQ annual export covers FY2025 (Dec-31-2025) with an LTM through Mar-31-2026 — sufficient for most quantitative work.

---

## 2A. Filing Regime

| Item | Detected Value | Evidence |
|---|---|---|
| Primary listing country | United Arab Emirates | DFM: EMAAR; ISIN AEE0003010011; filings reference "سوق دبي المالي" (Dubai Financial Market) throughout |
| Filing regime | UAE — Securities and Commodities Authority (SCA) / Dubai Financial Market (DFM) | All filings labelled as DFM exchange announcements; no SEBI, SEC, or FCA references |
| Reporting standard | IFRS | Capital IQ exports confirm "Acctg. Standard: IFRS"; FY2025 investor deck and FY2024 annual report both reference IFRS consolidated financials |
| Reporting currency + fiscal-year end | AED (UAE Dirham); fiscal year ends 31 December | Capital IQ exports state "Currency: AED"; annual periods end Dec-31 throughout |

**Downstream agent guidance (per CLAUDE.md §27):** EMAR is a UAE-listed company. Downstream agents must read and cite the local-equivalent documents:
- Annual report = Emaar's full audited Annual Report filed on DFM (equivalent tier to a 10-K / 20-F)
- Preliminary results = DFM exchange announcements (SEBI LODR Reg 30 equivalent under UAE SCA/DFM rules)
- AGM / governance filings = DFM corporate governance disclosures and board resolutions
- Do NOT mark filings as "missing" because a US 10-K or Indian Annual Report is absent — the DFM equivalents are present.
- All figures are in AED millions unless otherwise stated; any USD equivalents provided by the company should be taken verbatim from filings (not re-derived), per CLAUDE.md §27.

---

## 3. Sufficiency Verdict

- **Verdict:** Sufficient
- **Reason:** The pool contains a FY2024 full audited annual report (filed Mar 2025, 15 months old — within the 18-month window) and multiple sources covering periods within the last 6 months: a preliminary FY2025 full-year results release (Mar-30-2026, ~3 months old), a detailed FY2025 investor deck (Feb-12-2026, ~5 months old), Capital IQ quarterly data through Q1 2026 (Mar-31-2026), and a current forward consensus — together meeting both prongs of the sufficiency rule.
- **Critical missing items:** None that block analysis. One gap to note for downstream agents: the audited FY2025 annual report with full notes to accounts (the UAE equivalent of a filed 10-K for FY2025) is not yet in the pool. Agents relying on detailed audited footnotes (debt covenants, related-party disclosures, segment notes) must draw from the FY2024 audited report and supplement with the FY2025 preliminary results where available; the Capital IQ structured exports cover FY2025 quantitatively. Additionally, the `…Nov-17-2025.pdf` file failed to extract cleanly (OCR artefacts) — treat as unavailable; it appears to be a minor exchange announcement rather than a substantive filing.
