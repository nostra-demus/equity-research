# Data Triage — SMPL

## 1. File Inventory

Note on "Last Modified": these are Google-Drive sync timestamps (mostly 2026-07-24 or 2026-08-06), not statement dates — per CLAUDE.md fix F23, "Period Covered" below is parsed from text INSIDE each document, not from the file's mtime. `_pool_extracts/manifest.md` confirms 11 workbooks → 54 tabs, 65 total extract files, **0 extraction failures** — nothing in this pool is in a fail/fallback/missing-dependency state, so nothing is treated as absent for the sufficiency verdict.

| Filename | Type | Period Covered | Last Modified (Drive sync) | Notes |
|---|---|---|---|---|
| Annual Report on Form 10-K_2025.pdf | Annual filing (10-K) | FY2025, fiscal year ended Aug 30, 2025 | 2026-08-06 | Filed with SEC ~Oct 28, 2025. Primary annual filing, PDF. |
| The_Simply_Good_Foods_Company_-_Form_10-K(Oct-28-2025).doc | Annual filing (10-K) | FY2025, fiscal year ended Aug 30, 2025 | 2026-08-06 | Duplicate of above in mhtml/.doc export format, filed Oct 28, 2025. |
| The_Simply_Good_Foods_Company_-_Form_10-Q(Jul-09-2026).doc | Quarterly filing (10-Q) | FQ3 FY2026, quarter ended May 30, 2026 | 2026-08-06 | Filed with SEC Jul 9, 2026. Most recent quarterly filing. |
| The_Simply_Good_Foods_Company_-_Form_10-Q(Apr-09-2026).doc | Quarterly filing (10-Q) | FQ2 FY2026, quarter ended Feb 28, 2026 | 2026-08-06 | Filed with SEC Apr 9, 2026. |
| The Simply Good Foods Company, Q3 2026 Earnings Call, Jul 09, 2026.rtf | Earnings transcript | FQ3 FY2026 (quarter ended May 30, 2026), call held Jul 9, 2026 | 2026-07-24 | Most recent transcript, ~1 month old. |
| The Simply Good Foods Company, Q2 2026 Earnings Call, Apr 09, 2026.rtf | Earnings transcript | FQ2 FY2026 (quarter ended Feb 28, 2026), call held Apr 9, 2026 | 2026-06-25 | Prior-quarter transcript. |
| Annual Meeting Proxy Statement_2026.pdf | Proxy (governance/pay) | Governance data as of the 2026 Annual Meeting (held Jan 28, 2026), covering FY2025 compensation/board matters | 2026-08-06 | US DEF 14A-equivalent. Not a business-model primary source but useful for capital-allocation-governance agent. |
| TheSimplyGoodFoodsCompanyNasdaqCMSMPL_PublicCompany.pdf | Data export (CIQ company profile) | As-of current (undated snapshot, no explicit period statement found in file) | 2026-08-06 | Vendor profile PDF, not a filing. |
| The Simply Good Foods Company NasdaqCM SMPL Key Developments.rtf | Data export (CIQ news/events feed) | Rolling news log, no single period | 2026-07-24 | Not a filing; supplementary. |
| The Simply Good Foods Company NasdaqCM SMPL Public Company Profile.rtf | Data export (CIQ company profile) | As-of current snapshot | 2026-07-24 | Not a filing; supplementary. |
| The Simply Good Foods Company NasdaqCM SMPL Public Ownership Summary.rtf | Data export (CIQ ownership summary) | As-of current snapshot | 2026-08-06 | Not a filing; supplementary. |
| Company Comparable Analysis The Simply Good Foods Company.xls — Financial Data | Data export tab (CIQ comps) | Multi-period comps, 50×17 | 2026-07-24 | Peer-comp financial data. |
| Company Comparable Analysis The Simply Good Foods Company.xls — Trading Multiples | Data export tab (CIQ comps) | Current trading multiples, 50×9 | 2026-07-24 | |
| Company Comparable Analysis The Simply Good Foods Company.xls — Operating Statistics | Data export tab (CIQ comps) | Multi-period, 50×13 | 2026-07-24 | |
| Company Comparable Analysis The Simply Good Foods Company.xls — Business Description | Data export tab (CIQ comps) | As-of current, 44×3 | 2026-07-24 | |
| Company Comparable Analysis The Simply Good Foods Company.xls — Implied Valuation | Data export tab (CIQ comps) | As-of current, 69×9 | 2026-07-24 | |
| Company Comparable Analysis The Simply Good Foods Company.xls — Valuation Chart | Data export tab (CIQ comps) | Time-series chart, 32×2 | 2026-07-24 | |
| Company Comparable Analysis The Simply Good Foods Company.xls — Credit Health Panel | Data export tab (CIQ comps) | Multi-period, 48×10 | 2026-07-24 | |
| Company Comparable Analysis The Simply Good Foods Company.xls — Disclaimer | Data export tab | Boilerplate, 26×1 | 2026-07-24 | Non-data tab. |
| Short_Interest_12m_SMPL.xls — Chart 1 with Data | Data export tab (short interest) | Trailing 12 months, 284×2 | 2026-08-06 | |
| Short_Interest_12m_SMPL.xls — Attributions | Data export tab | Boilerplate, 45×1 | 2026-08-06 | Non-data tab. |
| Credit Health Panel.xls — Summary | Data export tab (CIQ credit) | Multi-period, 63×11 | 2026-08-06 | |
| Credit Health Panel.xls — Financials | Data export tab (CIQ credit) | Multi-period, 40×13 | 2026-08-06 | |
| Credit Health Panel.xls — Operational Metrics Charts | Data export tab | 21×19 | 2026-08-06 | |
| Credit Health Panel.xls — Solvency Metrics Charts | Data export tab | 18×19 | 2026-08-06 | |
| Credit Health Panel.xls — Liquidity Metrics Charts | Data export tab | 15×19 | 2026-08-06 | |
| Credit Health Panel.xls — Disclaimer | Data export tab | Boilerplate, 26×1 | 2026-08-06 | Non-data tab. |
| Customers.xls — Customers | Data export tab (CIQ customer list) | As-of current, 20×6 | 2026-07-24 | |
| Events Calendar.xls — Events Calendar | Data export tab (CIQ events) | Forward calendar, 30×3 | 2026-08-06 | |
| Financials_Annual.xls — Key Stats | Data export tab (CIQ annual financials) | Multi-year annual, 91×12 | 2026-07-24 | |
| Financials_Annual.xls — Income Statement | Data export tab | Multi-year annual, 115×11 | 2026-07-24 | |
| Financials_Annual.xls — Balance Sheet | Data export tab | Multi-year annual, 88×11 | 2026-07-24 | |
| Financials_Annual.xls — Cash Flow | Data export tab | Multi-year annual, 75×11 | 2026-07-24 | |
| Financials_Annual.xls — Multiples | Data export tab | Multi-year annual, 91×41 | 2026-07-24 | |
| Financials_Annual.xls — Historical Capitalization | Data export tab | 39×37 | 2026-07-24 | |
| Financials_Annual.xls — Capital Structure Summary | Data export tab | 97×21 | 2026-07-24 | |
| Financials_Annual.xls — Capital Structure Details | Data export tab | 26×10 | 2026-07-24 | |
| Financials_Annual.xls — Ratios | Data export tab | Multi-year annual, 161×11 | 2026-07-24 | |
| Financials_Annual.xls — Supplemental | Data export tab | 60×10 | 2026-07-24 | |
| Financials_Annual.xls — Industry Specific | Data export tab | 15×6 | 2026-07-24 | |
| Financials_Annual.xls — Pension OPEB | Data export tab | 21×10 | 2026-07-24 | |
| Financials_Annual.xls — Segments | Data export tab (CIQ segment data) | Multi-year annual, 76×10 | 2026-07-24 | Feeds segment-map agent. |
| Financials_Quarterly.xls — Key Stats | Data export tab (CIQ quarterly financials) | Multi-quarter, 91×12 | 2026-07-24 | |
| Financials_Quarterly.xls — Income Statement | Data export tab | Multi-quarter, 113×40 | 2026-07-24 | |
| Financials_Quarterly.xls — Balance Sheet | Data export tab | Multi-quarter, 86×40 | 2026-07-24 | |
| Financials_Quarterly.xls — Cash Flow | Data export tab | Multi-quarter, 75×40 | 2026-07-24 | |
| Financials_Quarterly.xls — Multiples | Data export tab | Multi-quarter, 91×41 | 2026-07-24 | |
| Financials_Quarterly.xls — Historical Capitalization | Data export tab | 39×37 | 2026-07-24 | |
| Financials_Quarterly.xls — Capital Structure Summary | Data export tab | 70×79 | 2026-07-24 | |
| Financials_Quarterly.xls — Capital Structure Details | Data export tab | 26×10 | 2026-07-24 | |
| Financials_Quarterly.xls — Ratios | Data export tab | Multi-quarter, 161×40 | 2026-07-24 | |
| Financials_Quarterly.xls — Supplemental | Data export tab | 50×40 | 2026-07-24 | |
| Financials_Quarterly.xls — Industry Specific | Data export tab | 15×6 | 2026-07-24 | |
| Financials_Quarterly.xls — Pension OPEB | Data export tab | 15×6 | 2026-07-24 | |
| Financials_Quarterly.xls — Segments | Data export tab (CIQ segment data) | Multi-quarter, 71×40 | 2026-07-24 | Feeds segment-map agent. |
| Public Ownership History.xls — History | Data export tab (CIQ ownership) | Historical, 600×6 | 2026-08-06 | |
| Public Ownership Insider Trading.xls — Insider Trading | Data export tab (CIQ insider trades) | Historical log, 455×11 | 2026-08-06 | Feeds capital-allocation-governance / disqualifier-scan. |
| Suppliers.xls — Suppliers | Data export tab (CIQ supplier list) | As-of current, 38×8 | 2026-07-24 | Feeds value-chain / external-dependency agent. |
| TheSimplyGoodFoodsCompanyNasdaqCMSMPLEstimatesReport.xls — Consensus | Data export tab (CIQ estimates) | Forward consensus, 574×46 | 2026-08-06 | |
| TheSimplyGoodFoodsCompanyNasdaqCMSMPLEstimatesReport.xls — Recent Changes | Data export tab | 265×10 | 2026-08-06 | |
| TheSimplyGoodFoodsCompanyNasdaqCMSMPLEstimatesReport.xls — Guidance | Data export tab | 128×17 | 2026-08-06 | |
| TheSimplyGoodFoodsCompanyNasdaqCMSMPLEstimatesReport.xls — Multiples | Data export tab | 33×7 | 2026-08-06 | |
| TheSimplyGoodFoodsCompanyNasdaqCMSMPLEstimatesReport.xls — Surprise | Data export tab | 288×37 | 2026-08-06 | |
| TheSimplyGoodFoodsCompanyNasdaqCMSMPLEstimatesReport.xls — Trends | Data export tab | 296×18 | 2026-08-06 | |
| TheSimplyGoodFoodsCompanyNasdaqCMSMPLEstimatesReport.xls — Revisions | Data export tab | 467×18 | 2026-08-06 | |

No investor presentation / investor deck file is present in the pool. No `ciq_facts.json` sidecar exists in `_pool_extracts/` (checked directly) — downstream agents must cite CIQ figures from the tab extracts listed above, sourced by their own reads.

## 1A. External Data

No `data/SMPL/external/` directory exists in the pool. No externally sourced research (alt-data panels, expert-call notes, channel checks, broker research, paid-API pulls) is present. This section is empty by design — nothing here moved (or could move) the sufficiency verdict.

## 2. Most Recent Sources

| Source Type | Filename | Period | Age (months, vs. 2026-08-06) |
|---|---|---|---|
| Annual filing | Annual Report on Form 10-K_2025.pdf (and its .doc twin) | FY2025, fiscal year ended Aug 30, 2025 (filed ~Oct 28, 2025) | ~9.3 months since FYE |
| Quarterly filing | The_Simply_Good_Foods_Company_-_Form_10-Q(Jul-09-2026).doc | FQ3 FY2026, quarter ended May 30, 2026 (filed Jul 9, 2026) | ~2.2 months since period end; ~1 month since filing |
| Earnings transcript | The Simply Good Foods Company, Q3 2026 Earnings Call, Jul 09, 2026.rtf | FQ3 FY2026, call held Jul 9, 2026 | ~1 month |
| Investor deck | Not present in pool | — | — |
| Data export | TheSimplyGoodFoodsCompanyNasdaqCMSMPLEstimatesReport.xls (Consensus tab, consensus as of Jul-09-2026 per embedded transcript header cross-check) | Forward consensus, current as of early Jul 2026 | ~1 month |

## 2A. Filing Regime

| Item | Detected Value | Evidence |
|---|---|---|
| Primary listing country | United States (Nasdaq: SMPL) | 10-K cover page; CIQ profile "NasdaqCM:SMPL" [Annual Report on Form 10-K_2025.pdf; TheSimplyGoodFoodsCompanyNasdaqCMSMPL_PublicCompany.pdf] |
| Filing regime | US SEC | Form 10-K, Form 10-Q, DEF 14A-style proxy filed with SEC [Annual Report on Form 10-K_2025.pdf, cover page; Form 10-Q(Jul-09-2026).doc, SOX 906 certification referencing SEC filing] |
| Reporting standard | US GAAP | 10-K consolidated financial statements presented under US GAAP conventions (standard SEC domestic filer format) [Annual Report on Form 10-K_2025.pdf] |
| Reporting currency + fiscal-year end | USD; fiscal year ends the last Saturday in August (FY2025 ended Aug 30, 2025) | "fiscal year ended August 30, 2025" [Annual Report on Form 10-K_2025.pdf, cover/MD&A]; Q3 2026 earnings-call header states "Currency: USD" [Q3 2026 Earnings Call transcript, header] |
| Document language(s) | English (all documents) | Direct read of all extracts; no non-English filings in this pool |

Downstream agents should apply the US/SEC document map from CLAUDE.md §27: 10-K = annual filing, 10-Q = interim filing, proxy = governance/pay disclosure. No local-equivalent substitution is needed for this issuer.

## 3. Sufficiency Verdict

- **Verdict:** Sufficient
- **Reason:** The pool has an annual filing (FY2025 10-K, fiscal year ended Aug 30, 2025 — ~9.3 months old, within the 18-month window) AND a quarterly filing plus an earnings transcript both from FQ3 FY2026 (quarter ended May 30, 2026, filed/held early Jul 2026 — roughly 1 month old, well within the 6-month window), satisfying the Sufficient rule on both legs.
- **Critical missing items:** None required for sufficiency. Noted gaps that do not block the verdict: no standalone investor presentation/deck is in the pool (the earnings transcripts and CIQ exports substitute for the "deck" leg of the rule, which only requires one of {quarterly filing, transcript, investor deck}); no `ciq_facts.json` sidecar exists, so downstream agents must source CIQ figures directly from the tab-level extracts listed in Section 1, each cited by its own workbook/tab name and reconciled against the filing's own numbers per CLAUDE.md §5 where the same metric appears in both.
