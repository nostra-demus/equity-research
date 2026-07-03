# Governance Data Triage — EMAR

**Ticker:** EMAR (Emaar Properties PJSC, DFM:EMAAR)
**Date:** 2026-07-03
**Triage agent:** 00_governance-data-triage
**Pool extractor run:** Fresh — 57 tabs across 20 workbooks, 81 extract files, 0 failures
**Manifest:** `analyses/EMAR_2026-07-03/_pool_extracts/manifest.md`

---

## 1. File Inventory

All 50 files in `data/EMAR/` are listed. Multi-tab workbooks are expanded per tab. Reporting periods are parsed from inside each document. Pool extractor status: all 81 extracts have `status = ok` — zero failures, zero fallbacks.

| Filename | Tab / Stream | Rows×Cols | Type | Period (from inside doc) | Governance Relevance |
|---|---|---|---|---|---|
| `Emaar_Properties_PJSC-Annual_Report(Mar-14-2025).pdf` | — | — | Audited annual report (Arabic) | FY2024 (Dec-31-2024) | High |
| `Emaar_Properties_PJSC_-_Form_Annual_Report(Mar-14-2025).pdf` | — | — | Audited annual report (Arabic, exchange copy) | FY2024 (Dec-31-2024) | High |
| `Emaar_Properties_PJSC_-_Form_Annual_Report(Nov-03-2020).pdf` | — | — | Audited annual report | FY2019 (Dec-31-2019) | Medium |
| `Emaar_Properties_PJSC_-_Form_Annual_Report(Dec-20-2019).pdf` | — | — | Audited annual report | FY2018 (Dec-31-2018) | Medium |
| `Emaar_Properties_PJSC-Preliminary_Annual_Report(Feb-12-2026).pdf` | — | — | Investor presentation / preliminary results | FY2025 (Dec-31-2025) | High |
| `Emaar_Properties_PJSC_-_Form_Preliminary_Annual_Report(Feb-12-2026).pdf` | — | — | Preliminary annual results (exchange filing) | FY2025 (Dec-31-2025) | High |
| `Emaar_Properties_PJSC_-_Form_Preliminary_Annual_Report(Mar-30-2026).pdf` | — | — | Preliminary annual results (exchange filing, revised) | FY2025 (Dec-31-2025) | High |
| `Emaar_Properties_PJSC_-_Form_Preliminary_Annual_Report(Feb-08-2024).pdf` | — | — | Preliminary annual results | FY2023 (Dec-31-2023) | Medium |
| `Emaar_Properties_PJSC_-_Form_Preliminary_Annual_Report(Feb-14-2023).pdf` | — | — | Preliminary annual results | FY2022 (Dec-31-2022) | Medium |
| `Emaar_Properties_PJSC_-_Form_Preliminary_Interim_Report(Apr-08-2026).pdf` | — | — | Preliminary interim results (Q1 2025, Arabic) | Q1 2025 (Mar-31-2025) | Medium |
| `Emaar_Properties_PJSC_-_Form_Preliminary_Interim_Report(Dec-17-2025).pdf` | — | — | Preliminary interim results | 9M 2025 (Sep-30-2025) | Medium |
| `Emaar_Properties_PJSC_-_Form_Preliminary_Interim_Report(Dec-03-2025).pdf` | — | — | Preliminary interim results | 9M 2025 (alternate) | Medium |
| `Emaar_Properties_PJSC_-_Form_Preliminary_Interim_Report(Nov-17-2025).pdf` | — | — | Preliminary interim results | Q3 2025 (Sep-30-2025) | Medium |
| `Emaar_Properties_PJSC_-_Form_Preliminary_Interim_Report(May-14-2024).pdf` | — | — | Preliminary interim results | Q1 2024 (Mar-31-2024) | Low |
| `Emaar_Properties_PJSC_-_Form_Preliminary_Interim_Report(Aug-30-2023).pdf` | — | — | Preliminary interim results | H1 2023 (Jun-30-2023) | Low |
| `Emaar_Properties_PJSC_-_Form_Preliminary_Interim_Report(Dec-13-2022).pdf` | — | — | Preliminary interim results | 9M 2022 (Sep-30-2022) | Low |
| `Emaar_Properties_PJSC_-_Form_Preliminary_Interim_Report(May-13-2022).pdf` | — | — | Preliminary interim results | Q1 2022 (Mar-31-2022) | Low |
| `Emaar_Properties_PJSC_-_Form_Preliminary_Interim_Report(Feb-14-2022).pdf` | — | — | Preliminary interim results | FY2021 prelim | Low |
| `Emaar_Properties_PJSC_-_Form_Preliminary_Interim_Report(Nov-14-2021).pdf` | — | — | Preliminary interim results | 9M 2021 | Low |
| `Emaar_Properties_PJSC_-_Form_Preliminary_Interim_Report(Aug-11-2021).pdf` | — | — | Preliminary interim results | H1 2021 | Low |
| `Emaar_Properties_PJSC_-_Form_Preliminary_Interim_Report(Aug-12-2020).pdf` | — | — | Preliminary interim results | H1 2020 | Low |
| `Emaar Properties PJSC DFM EMAAR Board Members.xls` | Board Members | 29×25 | Board composition export | Current (data as of Jun-2026) | High |
| `Emaar Properties PJSC DFM EMAAR Compensation Summary Compensation.xls` | Summary Compensation | 27×18 | Compensation export | FY2022–FY2025 | High |
| `Emaar Properties PJSC DFM EMAAR Public Ownership Summary.rtf` | — | — | Ownership summary | As of May–Jun 2026 | High |
| `Emaar Properties PJSC DFM EMAAR Private Ownership.rtf` | — | — | Private/corporate ownership | As of May–Jun 2026 | High |
| `Emaar Properties PJSC DFM EMAAR Professionals.xls` | Professionals | 33×24 | Management profiles | Current (data as of Jun-2026) | High |
| `Emaar Properties PJSC DFM EMAAR Key Developments.xls` | Key Developments | 49×7 | Corporate events / announcements | Last 6 months (Jan–Jun 2026) | High |
| `Emaar Properties PJSC DFM EMAAR Investment Analysis Direct Investments.xls` | Direct Investments | 69×21 | Subsidiaries, investment history | As of Jun-2026 | Medium |
| `Emaar Properties PJSC DFM EMAAR Strategic Alliances.rtf` | — | — | Strategic alliances | As of Jun-2026 | Low |
| `Emaar Properties PJSC DFM EMAAR Analyst Coverage.xls` | Analyst Coverage | 34×6 | Analyst coverage list | As of Jun-2026 | Low |
| `Emaar Properties PJSC DFM EMAAR Events Calendar.xls` | Events Calendar | 23×3 | Upcoming events | Forward-looking, 2026 | Low |
| `Emaar Properties PJSC DFM EMAAR Customers.xls` | Customers | 40×8 | Customer / counterparty data | As of Jun-2026 | Low |
| `Emaar Properties PJSC DFM EMAAR Suppliers.xls` | Suppliers | 46×8 | Supplier data | As of Jun-2026 | Low |
| `Emaar Properties PJSC DFM EMAAR Financials_Annual.xls` | Key Stats | 91×9 | Annual financials | FY2021–FY2025 + LTM Mar-2026 | High |
| `Emaar Properties PJSC DFM EMAAR Financials_Annual.xls` | Income Statement | 98×7 | Annual financials | FY2021–FY2025 + LTM Mar-2026 | High |
| `Emaar Properties PJSC DFM EMAAR Financials_Annual.xls` | Balance Sheet | 101×7 | Annual financials | FY2021–FY2025 + LTM Mar-2026 | High |
| `Emaar Properties PJSC DFM EMAAR Financials_Annual.xls` | Cash Flow | 77×7 | Annual financials | FY2021–FY2025 + LTM Mar-2026 | High |
| `Emaar Properties PJSC DFM EMAAR Financials_Annual.xls` | Multiples | 91×9 | Annual financials | FY2021–FY2025 + LTM Mar-2026 | Medium |
| `Emaar Properties PJSC DFM EMAAR Financials_Annual.xls` | Historical Capitalization | 39×7 | Annual financials | FY2021–FY2025 + LTM Mar-2026 | Medium |
| `Emaar Properties PJSC DFM EMAAR Financials_Annual.xls` | Capital Structure Summary | 96×7 | Debt/capital structure | FY2021–FY2025 + LTM Mar-2026 | High |
| `Emaar Properties PJSC DFM EMAAR Financials_Annual.xls` | Capital Structure Details | 44×10 | Individual debt instruments | As of Dec-2025 | High |
| `Emaar Properties PJSC DFM EMAAR Financials_Annual.xls` | Ratios | 161×7 | Annual ratios | FY2021–FY2025 + LTM Mar-2026 | Medium |
| `Emaar Properties PJSC DFM EMAAR Financials_Annual.xls` | Supplemental | 38×7 | Annual supplemental | FY2021–FY2025 | Low |
| `Emaar Properties PJSC DFM EMAAR Financials_Annual.xls` | Industry Specific | 65×7 | Real estate metrics | FY2021–FY2025 | Medium |
| `Emaar Properties PJSC DFM EMAAR Financials_Annual.xls` | Pension OPEB | 44×7 | Pension/benefits data | FY2021–FY2025 | Low |
| `Emaar Properties PJSC DFM EMAAR Financials_Annual.xls` | Segments | 84×7 | Segment financials | FY2021–FY2025 | Medium |
| `Emaar Properties PJSC DFM EMAAR Financials_Quarterly.xls` | Key Stats | 91×7 | Quarterly financials | Q1 2021–Q1 2026 | Medium |
| `Emaar Properties PJSC DFM EMAAR Financials_Quarterly.xls` | Income Statement | 95×18 | Quarterly financials | Q1 2021–Q1 2026 | Medium |
| `Emaar Properties PJSC DFM EMAAR Financials_Quarterly.xls` | Balance Sheet | 99×18 | Quarterly financials | Q1 2021–Q1 2026 | Medium |
| `Emaar Properties PJSC DFM EMAAR Financials_Quarterly.xls` | Cash Flow | 77×18 | Quarterly financials | Q1 2021–Q1 2026 | Medium |
| `Emaar Properties PJSC DFM EMAAR Financials_Quarterly.xls` | Multiples | 91×19 | Quarterly financials | Q1 2021–Q1 2026 | Low |
| `Emaar Properties PJSC DFM EMAAR Financials_Quarterly.xls` | Historical Capitalization | 39×18 | Quarterly capitalization | Q1 2021–Q1 2026 | Low |
| `Emaar Properties PJSC DFM EMAAR Financials_Quarterly.xls` | Capital Structure Summary | 74×35 | Quarterly capital structure | Q1 2021–Q1 2026 | Medium |
| `Emaar Properties PJSC DFM EMAAR Financials_Quarterly.xls` | Capital Structure Details | 44×10 | Quarterly debt detail | As of Mar-2026 | Medium |
| `Emaar Properties PJSC DFM EMAAR Financials_Quarterly.xls` | Ratios | 161×18 | Quarterly ratios | Q1 2021–Q1 2026 | Low |
| `Emaar Properties PJSC DFM EMAAR Financials_Quarterly.xls` | Supplemental | 26×18 | Quarterly supplemental | Q1 2021–Q1 2026 | Low |
| `Emaar Properties PJSC DFM EMAAR Financials_Quarterly.xls` | Industry Specific | 65×18 | Real estate quarterly | Q1 2021–Q1 2026 | Low |
| `Emaar Properties PJSC DFM EMAAR Financials_Quarterly.xls` | Pension OPEB | 30×18 | Quarterly pension | Q1 2021–Q1 2026 | Low |
| `Emaar Properties PJSC DFM EMAAR Financials_Quarterly.xls` | Segments | 84×18 | Quarterly segments | Q1 2021–Q1 2026 | Low |
| `Company Comparable Analysis Emaar Properties PJSC.xls` | Financial Data | 50×17 | Comparable company financials | As of Jun-2026 | Medium |
| `Company Comparable Analysis Emaar Properties PJSC.xls` | Trading Multiples | 50×9 | Comps multiples | As of Jun-2026 | Low |
| `Company Comparable Analysis Emaar Properties PJSC.xls` | Operating Statistics | 50×13 | Comps operating stats | As of Jun-2026 | Medium |
| `Company Comparable Analysis Emaar Properties PJSC.xls` | Business Description | 44×3 | Comps descriptions | As of Jun-2026 | Low |
| `Company Comparable Analysis Emaar Properties PJSC.xls` | Implied Valuation | 69×9 | Comps valuation | As of Jun-2026 | Low |
| `Company Comparable Analysis Emaar Properties PJSC.xls` | Valuation Chart | 32×2 | Chart data | As of Jun-2026 | Low |
| `Company Comparable Analysis Emaar Properties PJSC.xls` | Credit Health Panel | 48×10 | Credit metrics | As of Jun-2026 | Low |
| `Company Comparable Analysis Emaar Properties PJSC.xls` | Disclaimer | 26×1 | Disclaimer | — | Low |
| `EmaarPropertiesPJSCDFMEMAAREstimatesReport.xls` | Consensus | 514×81 | Analyst consensus estimates | As of Jun-22-2026 | Medium |
| `EmaarPropertiesPJSCDFMEMAAREstimatesReport.xls` | Recent Changes | 265×10 | Estimate revisions | As of Jun-22-2026 | Low |
| `EmaarPropertiesPJSCDFMEMAAREstimatesReport.xls` | Guidance | 42×3 | Company guidance | As of Jun-22-2026 | Medium |
| `EmaarPropertiesPJSCDFMEMAAREstimatesReport.xls` | Multiples | 25×7 | Forward multiples | As of Jun-22-2026 | Low |
| `EmaarPropertiesPJSCDFMEMAAREstimatesReport.xls` | Surprise | 245×74 | Beat/miss history | As of Jun-22-2026 | Medium |
| `EmaarPropertiesPJSCDFMEMAAREstimatesReport.xls` | Trends | 305×15 | Estimate trend history | As of Jun-22-2026 | Low |
| `EmaarPropertiesPJSCDFMEMAAREstimatesReport.xls` | Revisions | 467×13 | Revision history | As of Jun-22-2026 | Low |
| `01_Consensus.xlsx` | Consensus | 517×81 | Analyst consensus | As of Jun-22-2026 | Medium |
| `02_Recent Changes.xlsx` | Recent Changes | 266×10 | Estimate changes | As of Jun-22-2026 | Low |
| `03_Guidance.xlsx` | Guidance | 42×3 | Company guidance | As of Jun-22-2026 | Medium |
| `04_Multiples.xlsx` | Multiples | 26×7 | Forward multiples | As of Jun-22-2026 | Low |
| `05_Surprise.xlsx` | Surprise | 248×74 | Beat/miss history | As of Jun-22-2026 | Medium |
| `06_Trends.xlsx` | Trends | 306×15 | Estimate trend history | As of Jun-22-2026 | Low |
| `07_Revisions.xlsx` | Revisions | 476×13 | Revision history | As of Jun-22-2026 | Low |

**Notes on the annual reports:** The FY2024 Annual Report (Mar-14-2025) and FY2025 Preliminary Annual Report (Feb-12-2026) are both primarily in Arabic. Text extraction succeeded but the governance sections (Board's Report, Corporate Governance Report, RPT notes, Auditor's Report) are in Arabic and were not fully English-readable by the extractor. Key numbers from the FY2025 Investor Presentation (also named "Preliminary Annual Report") are in English and were accessible.

**No transcripts are present in the pool.** Earnings call announcements appear in Key Developments (Feb-12-2026 FY2025 call; May-11-2026 Q1 2026 call), but no transcript text is available.

---

## 2. Most Recent Sources

| Source Type | Filename | Period / As-of | Age (months) |
|---|---|---|---|
| Annual filing (audited full) | `Emaar_Properties_PJSC-Annual_Report(Mar-14-2025).pdf` | FY2024 (Dec-31-2024), filed Mar-14-2025 | ~15 months |
| Preliminary annual results | `Emaar_Properties_PJSC-Preliminary_Annual_Report(Feb-12-2026).pdf` (FY2025 investor deck) | FY2025 (Dec-31-2025), filed Feb-12-2026 | ~5 months |
| Interim / quarterly filing | `Emaar_Properties_PJSC_-_Form_Preliminary_Interim_Report(Apr-08-2026).pdf` | Q1 2025 (Mar-31-2025) | ~3 months |
| Compensation disclosure | `Emaar Properties PJSC DFM EMAAR Compensation Summary Compensation.xls` | FY2025 (AED director fees, Capital IQ export) | Current |
| Ownership / insider data | `Emaar Properties PJSC DFM EMAAR Public Ownership Summary.rtf` | Position dates May–Jun 2026 | Current |
| Board composition | `Emaar Properties PJSC DFM EMAAR Board Members.xls` | Current board (data as of Jun-2026) | Current |
| Shareholder letter | None in pool | — | — |
| Transcript | None in pool | — | — |
| Corporate events / 8-K equivalent | `Emaar Properties PJSC DFM EMAAR Key Developments.xls` | Last 6 months (Jan–Jun 2026) | Current |
| Comparable / peer analysis | `Company Comparable Analysis Emaar Properties PJSC.xls` | As of Jun-2026 | Current |

---

## 3. Governance Usability Check

| Requirement | Available? (Y/N) | Source | Why It Matters |
|---|---|---|---|
| Proxy / AGM Notice equivalent | Partial — AGM agenda items referenced in Key Developments (Mar-25-2026); full AGM Notice not in pool as a standalone filing | Key Developments export (Capital IQ); Arabic Annual Report | Governance resolutions, director approval, remuneration approval |
| Compensation disclosure (metrics/weights) | Partial — director fees (AED amounts, FY2022–FY2025) available via Capital IQ export; executive salary, bonus, and LTIP structure NOT available (UAE-listed companies do not file a proxy equivalent with the disclosure depth of a US DEF 14A or Indian CG Report; management compensation is not separately disclosed) | `Emaar Properties PJSC DFM EMAAR Compensation Summary Compensation.xls` | Incentive alignment; whether pay rewards per-share value vs size |
| Beneficial ownership table | Y — full ownership breakdown by type and top 5 holders available; position dates May–Jun 2026 | `Emaar Properties PJSC DFM EMAAR Public Ownership Summary.rtf` | Skin in the game, control structure, government alignment |
| Insider-transaction data (buys/sells) | Partial — Capital IQ Ownership Activity shows institutional changes (Dec-31-2025 to Mar-31-2026) and the major ICD→Emirates Power Investment transfer (May 2026); individual insider buy/sell data is limited (Individuals/Insiders hold only 3.06 mn shares, 0.03%); UAE DFM does not have a Form 4 equivalent with the same frequency | `Emaar Properties PJSC DFM EMAAR Public Ownership Summary.rtf`; Key Developments | Conviction signal; insider buying vs selling |
| Board composition / independence | Y — full board member list (10 members), roles, independence status, years on board, committee assignments available | `Emaar Properties PJSC DFM EMAAR Board Members.xls` | Board quality, independence, entrenchment |
| Related-party disclosure | Partial — RPT notes exist in FY2024 Annual Report (Arabic text, not English-extracted); Capital IQ identifies related-party relationships (Alabbar external board seats, government shareholder relationships); quantitative RPT values not recoverable from available data | FY2024 Annual Report (Arabic); CIQ Board Members; CIQ Key Developments | Value leakage; minority-shareholder risk |
| Control structure (dual-class / blocs) | Y — single share class; government-linked entities (Dubai Holding / Emirates Power Investment) hold ~44.5% combined; Eitl Difc Spc 1 Ltd holds 7.46%; no dual-class shares | `Emaar Properties PJSC DFM EMAAR Public Ownership Summary.rtf` | Minority-shareholder rights |
| Prior shareholder letters / guidance | Partial — investor presentations (FY2025 deck Feb-12-2026) and AGM agenda items serve as management communications; no standalone shareholder letter or CEO letter to shareholders in pool | FY2025 Investor Presentation; Key Developments (AGM agenda) | Promise-vs-delivery |
| M&A / buyback / dividend history | Y — multi-year dividend history (FY2021–FY2025: AED 0.15→1.00/share), share count history (flat since FY2022), acquisition history (CIQ Direct Investments) available | Capital IQ Financials Annual (CFS, Balance Sheet); Key Developments | Capital-allocation scorecard |
| Management tenure / turnover | Y — CEO Amit Jain since Jun-2017 (9 yrs); founder/MD Mohamed Alabbar since 1997; CFO change May-2026 disclosed; Board profiles with start dates | CIQ Professionals; CIQ Board Members; CIQ Key Developments (May-22-2026 CFO change) | Stability and competence |
| Transcripts | N — no earnings call transcripts in pool; call dates recorded in Key Developments but text not available | Key Developments (call dates only) | Candor and tone; verbal commitment tracking |

---

## 4. Cross-Module Availability

| Cross-Module Output | Available? (Y/N) |
|---|---|
| `business-model/11_capital-allocation-governance.md` | Y |
| `business-model/01_disqualifier-scan.md` | Y |
| `business-model/12_red-flags-sweep.md` | Y |
| `business-model/02_business-identity.md` | Y |
| `earnings/06_earnings-quality.md` | Y |
| `earnings/04_guidance-consensus.md` | Y |

All six cross-module files are present. Key findings to carry forward:

- **`01_disqualifier-scan`:** No disqualifier triggered. KPMG audit clean; no pledging; no material RPT breach proven; no auditor change; FY2021 restatement outside 2-year window; no regulatory enforcement; positive OCF every year.
- **`11_capital-allocation-governance`:** Rising dividends (AED 0.15→1.00/share FY2021–FY2025), flat share count, debt retired to net-cash position; CFO departure May 2026 (internal succession); founder Alabbar has extensive outside board commitments including Eagle Hills (a real-estate competitor) — potential conflict not disclosed in RPT; government-counterparty RPT note accessible only in Arabic.
- **`12_red-flags-sweep`:** Seven material flags including Emaar Misr income collapse (net income down 64% in FY2025), OCF inflated by buyer advance inflows, Syria exposure (USD 500 mn development project, exiting JV structure), AED 200 bn new masterplan at cycle peak, key-person risk (Alabbar, no succession plan), EGP-denominated high-interest debt at subsidiary. No hard disqualifier.
- **`06_earnings-quality`:** CFO structurally inflated by unearned revenue inflows; normalised OCF materially lower than headline; FY2025 International Development EBITDA margin collapsed to 31% from 96% prior year.
- **`04_guidance-consensus`:** No transcripts in pool; guidance extracted from filings only; consensus current as of Jun-22-2026.

---

## 5. Partial-Data Flags

| Missing Data | Applies? (Y/N) | Affected Agents | Cap Applied |
|---|---|---|---|
| No proxy / compensation disclosure (executive comp: salary, bonus metrics, LTIP weights not disclosed) | Y — director fees available but executive compensation structure (CEO/CFO salary, bonus metrics, LTIP) is not disclosed; UAE listing regime does not require individual executive pay disclosure equivalent to US DEF 14A or Indian CG Report | 03, 99 | Incentive alignment max 50; Overall usefulness max 70 |
| No ownership / insider-transaction data | N — beneficial ownership table present and current; institutional activity available; individual insider data limited to 0.03% stake with no recent transactions | None — not triggered | None |
| No board disclosure | N — full board composition (10 members), independence status, committee membership, years on board available | None — not triggered | None |
| No multi-year history | N — annual financials cover FY2021–FY2025 (5 years); dividend and capital allocation history fully traceable; M&A history via Direct Investments export | None — not triggered | None |
| No transcripts / prior letters | Y — no earnings call transcripts; no standalone CEO/shareholder letters; communications limited to filings and investor decks | 01, 06 | Disclosure candor max 65; promise-vs-delivery read limited to filings |

---

## 5A. Jurisdiction & Filing Regime

| Item | Detected Value | Evidence |
|---|---|---|
| Primary listing country | United Arab Emirates | `02_business-identity.md`; CIQ Board Members (DFM:EMAAR, Dubai) |
| Exchange | Dubai Financial Market (DFM) | CIQ exports throughout (ticker "DFM:EMAAR") |
| Filing regime | UAE / SCA-LODR — DFM exchange filings, UAE Companies Law, UAE SCA governance code | Key Developments (DFM announcements format); Annual Report filed as Arabic statutory document to DFM |
| Sector | Real estate development, retail malls, hospitality | `02_business-identity.md` |
| Sector-specific governance overlay required? | Y — Infra/Real Estate overlay: related-party land transactions, project SPVs, customer advances, pledge / promoter debt, revenue recognition | `MODULE_RULES.md` Sector-Specific Governance Overlays |

**Jurisdiction mapping applied (per CLAUDE.md §27 and MODULE_RULES.md):** Emaar is a UAE company listed on the DFM. The applicable filing regime uses: annual report (not 10-K), DFM exchange announcements (not 8-K), AGM Notice / Corporate Governance Report section of the annual report (not DEF 14A), shareholding structure disclosures (not Schedule 13D/Form 4). US form names are not required. US equivalents not present are NOT marked missing when the local equivalent exists in the pool.

**Accounting standard:** IFRS. **Currency:** AED. **Fiscal year:** January 1 – December 31.

---

## 5B. Source Coverage Matrix

| Governance Need | Best Available Source | Period | Confidence 1–5 | Missing? | Replacement Source |
|---|---|---|---:|---|---|
| Board composition | CIQ Board Members export | Current (Jun-2026) | 4 | N | — |
| Compensation (director fees) | CIQ Compensation Summary export | FY2022–FY2025 | 4 | N (partial) | — |
| Compensation (executive salary/bonus/LTIP metrics) | Not available | — | — | Y — material gap | Arabic Annual Report CG section (not extracted); no UAE-equivalent disclosure |
| Ownership | CIQ Public Ownership Summary rtf | May–Jun 2026 | 4 | N | — |
| Insider trades (individual) | CIQ Ownership Activity (institutional) | Dec-2025 to Mar-2026 | 3 | Partial | UAE SCA filings not in pool; no DFM Form 4 equivalent |
| Related-party transactions (quantitative) | Arabic Annual Report Notes (not English-extracted) | FY2024 | 1 | Y — material gap | FY2025 audited annual report when filed |
| Auditor report | Key Developments (no audit qualification; KPMG named in disqualifier-scan from Arabic AR) | FY2024 | 3 | Partial | Arabic AR FY2024 auditor's section |
| Secretarial / compliance report | Not present (UAE equivalent not in pool) | — | — | Y | Not required in UAE in the same form as Indian Secretarial Audit Report |
| AGM voting | Key Developments (AGM dates/agenda items; vote outcomes not in pool) | Mar-2026 | 2 | Partial | DFM exchange announcement not in pool |
| Capital-allocation history | CIQ Annual CFS, Balance Sheet, Key Developments | FY2021–FY2025 | 5 | N | — |
| Legal / regulatory cases | Key Developments (last 6 months) | Jan–Jun 2026 | 3 | Partial | No litigation disclosure; UAE courts not publicly indexed |

---

## 5C. Data Freshness

| Source | Period | As-of Date | Age | Stale? | Impact |
|---|---|---|---|---|---|
| FY2024 Annual Report (audited) | FY2024 (Dec-31-2024) | Filed Mar-14-2025 | ~15 months | Borderline — FY2025 audited not yet filed | Only audited source for RPT notes, auditor report; FY2025 preliminary used for financials |
| FY2025 Preliminary Annual Results | FY2025 (Dec-31-2025) | Filed Feb-12-2026 | ~5 months | N | Main reference for FY2025 financials; not fully audited |
| FY2025 Preliminary Annual Results (revised) | FY2025 (Dec-31-2025) | Filed Mar-30-2026 | ~3 months | N | Revised filing; current |
| Q1 2026 interim results | Q1 2026 (Mar-31-2026) | Filed Apr-08-2026 | ~3 months | N | Most recent trading period |
| CIQ Ownership data | Position dates Dec-2025 to Jun-2026 | As of Jun-27-2026 | Current | N | — |
| CIQ Financials Annual | FY2025 | LTM Mar-31-2026 | Current | N | — |
| CIQ Board Members | Current | As of Jun-2026 | Current | N | — |
| CIQ Compensation | FY2025 | As of Jun-2026 | Current | N | Director fees only |
| CIQ Key Developments | Last 6 months | Jun-2026 | Current | N | — |
| Earnings transcripts | N/A — not in pool | — | — | Stale/absent | Candor read limited to filings |

**Source manifest CSV:** included as markdown table above. CSV export pending (no Write tool for sidecar files — orchestrator manages file IO).

---

## 6. Sufficiency Verdict

- **Verdict:** Partial

- **Reason:** The pool has strong data for capital allocation, ownership, board composition, and management track record — all five full annual periods (FY2021–FY2025), a current board export, full ownership data, and robust CIQ financial exports — but executive compensation structure (salary, bonus metrics, LTIP) is not disclosed anywhere in the pool due to the UAE filing regime, and no earnings transcripts are present, capping two specialists.

- **Specialists that can run:**
  - Management track record (agent 01) — can run fully; CEO tenure, CFO change, Alabbar profile, multi-year delivery record available
  - Capital allocation scorecard (agent 02) — can run fully; 5-year dividends, M&A, debt, buyback (none), capex data all available
  - Incentives and compensation (agent 03) — can run in partial mode; director fees (FY2022–FY2025) available, but executive salary/bonus/LTIP metrics are absent; cap applies
  - Ownership and insider behavior (agent 04) — can run fully; beneficial ownership, control structure, institutional activity, government bloc all present
  - Board and shareholder rights (agent 05) — can run fully; 10-member board with independence, committees, tenure data
  - Candor and disclosure quality (agent 06) — can run in partial mode; filings and investor decks available, but no transcripts; cap applies

- **Hard disqualifier already flagged by `business-model/01_disqualifier-scan`?** No — no disqualifier triggered. All specialists run without verdict-lock.

- **Active partial-data caps:**
  - No proxy / executive compensation disclosure: incentive alignment score capped at max 50; overall usefulness capped at max 70 [agents 03, 99]
  - No transcripts or prior shareholder letters: disclosure candor score capped at max 65; promise-vs-delivery read limited to filings [agents 01, 06]

- **Critical missing items:**
  - Executive compensation structure (CEO/CFO salary, bonus metrics, LTIP performance conditions and weights) — not available due to UAE listing regime; the most significant governance data gap in this pool
  - Quantitative RPT values — the Arabic Annual Report contains the RPT note but it was not English-extracted; the amount, counterparty, and terms of related-party transactions with government-linked entities (especially given Alabbar's Eagle Hills chairmanship) are unquantified from available data
  - Earnings call transcripts — no text in pool; candor assessment rests entirely on written filings and investor decks
  - AGM voting outcomes — agenda items referenced but shareholder vote counts / dissent levels not available

- **Single highest-value missing document:** Executive compensation disclosure (CEO/Group CEO salary, annual bonus metrics and weights, LTIP performance conditions) — either from an Arabic-to-English extract of the Corporate Governance Report section of the FY2024 Annual Report, or from a UAE SCA/DFM supplemental governance disclosure if one exists.

