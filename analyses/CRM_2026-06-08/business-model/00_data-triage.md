# Data Triage — CRM

Salesforce, Inc. (NYSE: CRM). Capital IQ export set. 12 source files; 7 are multi-tab workbooks. The canonical extractor (`.claude/tools/extract_pool.py`) split those workbooks into 49 tabs and decoded the mislabeled files: the 10-K and DEF 14A ship as `.doc` but are MHTML, and the three `.rtf` files are binary Word. All 12 sources extracted with 0 failures (manifest: `analyses/CRM_2026-06-08/_pool_extracts/manifest.md`). Every workbook tab below is its own inventory row.

## 1. File Inventory

| Filename | Type | Period Covered | Last Modified | Notes |
|---|---|---|---|---|
| Salesforce_Inc_-_Form_10-K(Mar-02-2026).doc | Annual filing (10-K) | FY ended Jan-31-2026 | 2026-05-29 | Mislabeled `.doc`; actually MHTML. Decoded OK. Notes Informatica acquisition (Nov 2025), $6.0bn borrowed. |
| Salesforce_Inc_-_Form_DEF_14A(Apr-16-2026).doc | Proxy (DEF 14A) | 2026 Annual Meeting (FY ended Jan-31-2026) | 2026-06-08 | Mislabeled `.doc`; actually MHTML. Decoded OK. 24.5 MB. |
| Salesforce, Inc., Q1 2027 Earnings Call, May 27, 2026.rtf | Earnings transcript | Q1 FY2027 (qtr ended Apr-30-2026) | 2026-05-29 | Mislabeled `.rtf`; actually binary Word. Decoded OK. |
| Salesforce, Inc., Q4 2026 Earnings Call, Feb 25, 2026.rtf | Earnings transcript | Q4 FY2026 (qtr ended Jan-31-2026) | 2026-05-29 | Mislabeled `.rtf`; actually binary Word. Decoded OK. |
| Salesforce Inc NYSE CRM Key Developments.rtf | Data export (news/events log) | Through Jun 2026 (fwd refs to 2027) | 2026-06-08 | RTF decoded OK. Event timeline. |
| Salesforce Inc NYSE CRM Financials_annual.xls — Key Stats | Data export (workbook tab) | Annual, FY2022–FY2026 | 2026-05-29 | Tab of annual financials workbook. 91×9. |
| Salesforce Inc NYSE CRM Financials_annual.xls — Income Statement | Data export (workbook tab) | Annual, FY2022–FY2026 | 2026-05-29 | 117×7. Periods Jan-31 year-ends. |
| Salesforce Inc NYSE CRM Financials_annual.xls — Balance Sheet | Data export (workbook tab) | Annual, FY2022–FY2026 | 2026-05-29 | 87×7. |
| Salesforce Inc NYSE CRM Financials_annual.xls — Cash Flow | Data export (workbook tab) | Annual, FY2022–FY2026 | 2026-05-29 | 71×7. |
| Salesforce Inc NYSE CRM Financials_annual.xls — Multiples | Data export (workbook tab) | Annual | 2026-05-29 | 91×9. |
| Salesforce Inc NYSE CRM Financials_annual.xls — Historical Capitalization | Data export (workbook tab) | Annual | 2026-05-29 | 39×7. |
| Salesforce Inc NYSE CRM Financials_annual.xls — Capital Structure Summary | Data export (workbook tab) | Annual | 2026-05-29 | 106×7. |
| Salesforce Inc NYSE CRM Financials_annual.xls — Capital Structure Details | Data export (workbook tab) | Annual | 2026-05-29 | 41×10. |
| Salesforce Inc NYSE CRM Financials_annual.xls — Ratios | Data export (workbook tab) | Annual | 2026-05-29 | 161×7. |
| Salesforce Inc NYSE CRM Financials_annual.xls — Supplemental | Data export (workbook tab) | Annual | 2026-05-29 | 64×7. |
| Salesforce Inc NYSE CRM Financials_annual.xls — Industry Specific | Data export (workbook tab) | Annual | 2026-05-29 | 15×6. Sparse. |
| Salesforce Inc NYSE CRM Financials_annual.xls — Pension OPEB | Data export (workbook tab) | Annual | 2026-05-29 | 15×6. Sparse. |
| Salesforce Inc NYSE CRM Financials_annual.xls — Segments | Data export (workbook tab) | Annual | 2026-05-29 | 79×7. Segment data. |
| Salesforce Inc NYSE CRM Financials_quarterly.xls — Key Stats | Data export (workbook tab) | Quarterly, through Q1 FY2027 | 2026-05-29 | 91×8. |
| Salesforce Inc NYSE CRM Financials_quarterly.xls — Income Statement | Data export (workbook tab) | Quarterly (from Jan-31-2021) | 2026-05-29 | 115×22. |
| Salesforce Inc NYSE CRM Financials_quarterly.xls — Balance Sheet | Data export (workbook tab) | Quarterly | 2026-05-29 | 85×22. |
| Salesforce Inc NYSE CRM Financials_quarterly.xls — Cash Flow | Data export (workbook tab) | Quarterly | 2026-05-29 | 72×22. |
| Salesforce Inc NYSE CRM Financials_quarterly.xls — Multiples | Data export (workbook tab) | Quarterly | 2026-05-29 | 91×23. |
| Salesforce Inc NYSE CRM Financials_quarterly.xls — Historical Capitalization | Data export (workbook tab) | Quarterly | 2026-05-29 | 39×22. |
| Salesforce Inc NYSE CRM Financials_quarterly.xls — Capital Structure Summary | Data export (workbook tab) | Quarterly | 2026-05-29 | 76×43. |
| Salesforce Inc NYSE CRM Financials_quarterly.xls — Capital Structure Details | Data export (workbook tab) | Quarterly | 2026-05-29 | 41×10. |
| Salesforce Inc NYSE CRM Financials_quarterly.xls — Ratios | Data export (workbook tab) | Quarterly | 2026-05-29 | 161×22. |
| Salesforce Inc NYSE CRM Financials_quarterly.xls — Supplemental | Data export (workbook tab) | Quarterly | 2026-05-29 | 37×22. |
| Salesforce Inc NYSE CRM Financials_quarterly.xls — Industry Specific | Data export (workbook tab) | Quarterly | 2026-05-29 | 15×6. Sparse. |
| Salesforce Inc NYSE CRM Financials_quarterly.xls — Pension OPEB | Data export (workbook tab) | Quarterly | 2026-05-29 | 15×6. Sparse. |
| Salesforce Inc NYSE CRM Financials_quarterly.xls — Segments | Data export (workbook tab) | Quarterly | 2026-05-29 | 81×22. Segment data. |
| Salesforce,IncNYSECRMEstimatesReport.xls — Consensus | Data export (workbook tab) | Forward estimates | 2026-05-29 | 554×105. Analyst consensus. |
| Salesforce,IncNYSECRMEstimatesReport.xls — Recent Changes | Data export (workbook tab) | Estimate revisions | 2026-05-29 | 265×10. |
| Salesforce,IncNYSECRMEstimatesReport.xls — Guidance | Data export (workbook tab) | Company guidance | 2026-05-29 | 137×110. |
| Salesforce,IncNYSECRMEstimatesReport.xls — Multiples | Data export (workbook tab) | Forward multiples | 2026-05-29 | 26×7. |
| Salesforce,IncNYSECRMEstimatesReport.xls — Surprise | Data export (workbook tab) | Estimate vs actual | 2026-05-29 | 258×94. |
| Salesforce,IncNYSECRMEstimatesReport.xls — Trends | Data export (workbook tab) | Estimate trends | 2026-05-29 | 325×22. |
| Salesforce,IncNYSECRMEstimatesReport.xls — Revisions | Data export (workbook tab) | Estimate revisions | 2026-05-29 | 485×22. |
| Company Comparable Analysis Salesforce Inc .xls — Financial Data | Data export (workbook tab) | Peer comp | 2026-06-08 | 50×17. |
| Company Comparable Analysis Salesforce Inc .xls — Trading Multiples | Data export (workbook tab) | Peer comp | 2026-06-08 | 50×9. |
| Company Comparable Analysis Salesforce Inc .xls — Operating Statistics | Data export (workbook tab) | Peer comp | 2026-06-08 | 50×13. |
| Company Comparable Analysis Salesforce Inc .xls — Business Description | Data export (workbook tab) | Peer comp | 2026-06-08 | 44×3. |
| Company Comparable Analysis Salesforce Inc .xls — Implied Valuation | Data export (workbook tab) | Peer comp | 2026-06-08 | 69×9. |
| Company Comparable Analysis Salesforce Inc .xls — Valuation Chart | Data export (workbook tab) | Peer comp | 2026-06-08 | 32×2. Sparse (chart). |
| Company Comparable Analysis Salesforce Inc .xls — Credit Health Panel | Data export (workbook tab) | Peer comp | 2026-06-08 | 48×10. |
| Company Comparable Analysis Salesforce Inc .xls — Disclaimer | Other (boilerplate) | n/a | 2026-06-08 | 26×1. CapIQ disclaimer. |
| Salesforce Inc NYSE CRM Credit Health Panel.xls — Summary | Data export (workbook tab) | Credit metrics | 2026-06-08 | 43×11. |
| Salesforce Inc NYSE CRM Credit Health Panel.xls — Financials | Data export (workbook tab) | Credit metrics | 2026-06-08 | 40×13. |
| Salesforce Inc NYSE CRM Credit Health Panel.xls — Operational Metrics Charts | Data export (workbook tab) | Credit metrics | 2026-06-08 | 21×19. Sparse (charts). |
| Salesforce Inc NYSE CRM Credit Health Panel.xls — Solvency Metrics Charts | Data export (workbook tab) | Credit metrics | 2026-06-08 | 18×19. Sparse (charts). |
| Salesforce Inc NYSE CRM Credit Health Panel.xls — Liquidity Metrics Charts | Data export (workbook tab) | Credit metrics | 2026-06-08 | 15×19. Sparse (charts). |
| Salesforce Inc NYSE CRM Credit Health Panel.xls — Disclaimer | Other (boilerplate) | n/a | 2026-06-08 | 26×1. CapIQ disclaimer. |
| Salesforce Inc NYSE CRM Public Ownership History.xls — History | Data export (workbook tab) | Ownership over time | 2026-05-29 | 4496×6. Holder history. |
| Salesforce Inc NYSE CRM Public Ownership Insider Trading.xls — Insider Trading | Data export (workbook tab) | Insider transactions | 2026-05-29 | 995×11. Insider buys/sells. |
| data/CRM/.DS_Store | Other (macOS metadata) | n/a | 2026-06-08 | Not a data file. Ignored. |

## 2. Most Recent Sources

| Source Type | Filename | Period | Age (months) |
|---|---|---|---|
| Annual filing | Salesforce_Inc_-_Form_10-K(Mar-02-2026).doc | FY ended Jan-31-2026 (filed Mar-02-2026) | ~3 |
| Quarterly filing | Salesforce Inc NYSE CRM Financials_quarterly.xls (Income Statement tab, through Q1 FY2027 / qtr ended Apr-30-2026) | Q1 FY2027 | ~1 |
| Earnings transcript | Salesforce, Inc., Q1 2027 Earnings Call, May 27, 2026.rtf | Q1 FY2027 (qtr ended Apr-30-2026) | ~0.4 |
| Investor deck | None in pool | — | — |
| Data export | Salesforce,IncNYSECRMEstimatesReport.xls / Company Comparable Analysis / Credit Health Panel | Through Jun 2026 | ~0 |

## 2A. Filing Regime

| Item | Detected Value | Evidence |
|---|---|---|
| Primary listing country | United States (NYSE: CRM) | 10-K cover: "UNITED STATES / SECURITIES AND EXCHANGE COMMISSION"; file/export names tagged "NYSE CRM" |
| Filing regime (US SEC / India SEBI-LODR / UK / Other) | US SEC | 10-K: "Annual report pursuant to Section 13 or 15(d) of the Securities Exchange Act of 1934"; DEF 14A: "Proxy Statement Pursuant to Section 14(a)" |
| Reporting standard (US GAAP / IFRS / Ind AS) | US GAAP | US domestic SEC registrant filing Form 10-K (not 20-F/IFRS); consistent with US filer profile |
| Reporting currency + fiscal-year end | USD; fiscal year ends January 31 | 10-K: "fiscal year ended January 31, 2026"; annual workbook columns are Jan-31 year-ends (FY2022–FY2026); USD figures (e.g. "$6.0 billion Informatica Credit Agreements") |

Downstream agents: apply CLAUDE.md §27 for a US/SEC issuer. The audited annual document is the 10-K (FY ended Jan-31-2026), the proxy/governance + pay document is the DEF 14A (2026 Proxy), interim results are the quarterly financials, and ownership/insider data is the Public Ownership / Insider Trading export. Do not treat the absence of an India/other-market form as a gap. Note: this is a Jan-31 fiscal-year company — "FY2026" ends Jan-31-2026 and "Q1 FY2027" ends Apr-30-2026; do not assume a calendar year (§15, §27).

## 3. Sufficiency Verdict

- **Verdict:** Sufficient
- **Reason:** An audited annual filing (10-K, FY ended Jan-31-2026, filed Mar-02-2026) is well within the last 18 months, and recent quarterly/transcript coverage exists (Q1 FY2027 earnings call dated May 27, 2026, plus quarterly financials through the quarter ended Apr-30-2026) within the last 6 months.
- **Critical missing items:** None for sufficiency. Note for downstream agents: no investor presentation / slide deck is present in the pool — business-overview and segment narrative should lean on the 10-K MD&A and segment note plus the two transcripts rather than a deck.
