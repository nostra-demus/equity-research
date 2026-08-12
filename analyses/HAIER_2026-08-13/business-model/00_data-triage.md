# Data Triage — HAIER

Company: Haier Smart Home Co., Ltd. — SSE (A-share): 600690; HKEX (H-share): 6690; Frankfurt (D-share); ADR program (F-6, Deutsche Bank Trust Company Americas, depositary).

Extraction: `.claude/tools/extract_pool.py` run against `data/HAIER/` → `analyses/HAIER_2026-08-13/_pool_extracts/`. Manifest totals: **62 source files → 95 workbook tabs / streams, 126 extract files, 0 failures.** Every source in `manifest.json` carries `status: ok` — nothing in the pool is in a fail / fallback-text / missing-dependency state, so no source is treated as missing on extraction grounds. No `ciq_facts.json` sidecar is present in `_pool_extracts/`, so all figures below are the agent's own sourced read, not a mechanically-pinned sidecar value. No `data/HAIER/external/` folder exists — there is no externally sourced research in this pool (Section 1A omitted).

**Filesystem last-modified dates are a Drive-sync artifact, not filing dates** (all files show 2026-08-12 or 2026-08-13, the day of pool sync). Every period below is read from inside each document (period-end / "as of" / fiscal-year lines), per CLAUDE.md §27 / F23.

## 1. File Inventory

| Filename | Type | Period Covered | Last Modified (sync date, not filing date) | Notes |
|---|---|---|---|---|
| Haier_Smart_Home_Co_Ltd_-_Form_Annual_Report(Mar-26-2026).pdf | Annual filing (A-share, SSE) | FY2025 (ended Dec-31-2025) | 2026-08-12 | 2025年年度报告, 600690; audited, "标准无保留意见" (unqualified) by 和信会计师事务所; reporting standard 企业会计准则 (China ASBE/CAS). Filed 2026-03-27 per cross-reference in the May-18-2026 briefing notice. |
| Haier_Smart_Home_Co_Ltd_-_Form_Annual_Report(Apr-27-2026).pdf | Annual filing (H-share, HKEX) | FY2025 (ended Dec-31-2025) | 2026-08-12 | 2025年報, stock code 6690; reporting standard 國際財務報告準則 (IFRS). Same fiscal year as the A-share annual report, different accounting standard — reconcile, do not average. |
| Haier_Smart_Home_Co_Ltd_-_Form_Preliminary_Annual_Report(Mar-26-2026).pdf | Preliminary results announcement (HKEX) | FY2025 (ended Dec-31-2025), vs FY2024 restated comparative | 2026-08-12 | HKEX "全年業績公告" — headline P&L only (Revenue RMB302,329m, gross profit RMB78,955m, adjusted operating profit RMB20,504m, net profit RMB20,163m, EPS basic RMB2.12). Precedes/mirrors the full annual reports above. |
| Haier_Smart_Home_Co_Ltd_-_Form_Interim_Report(Apr-27-2026).pdf | Quarterly filing (HKEX overseas-regulatory announcement of an SSE filing) | Q1 2026 (ended Mar-31-2026) | 2026-08-12 | Filename says "Interim Report" but content is "2026 FIRST QUARTER REPORT." Unaudited, prepared under China ASBE; states net profit/equity attributable to parent do not differ materially from IFRS. |
| Haier_Smart_Home_Co_Ltd_-_Form_Interim_Report(Oct-30-2025).pdf | Quarterly filing (HKEX overseas-regulatory announcement of an SSE filing) | Q3 2025 (ended Sep-30-2025) | 2026-08-12 | Filename says "Interim Report" but content is "2025 THIRD QUARTER REPORT." Unaudited, China ASBE, reconciled-to-IFRS statement as above. |
| Haier_Smart_Home_Co_Ltd_-_Form_Interim_Report(Oct-31-2025).pdf | Administrative filing (SSE) | Implements H1 2025 dividend (2025半年度) | 2026-08-12 | "2025年半年度A股权益分派实施公告" — A-share cash-dividend implementation notice (RMB0.2692/share), not a fresh results filing. No standalone H1 2025 interim results report is present in this pool. |
| Haier_Smart_Home_Co_Ltd_-_(Oct-23-2025).pdf | Administrative filing (SSE) | Adjusts H1 2025 dividend ratio | 2026-08-12 | "关于2025年半年度利润分配方案调整每股分配比例的公告" — dividend-plan adjustment notice, references but does not restate H1 2025 results. |
| Haier_Smart_Home_Co_Ltd_-_Form_Interim_Report(Nov-28-2025).pdf | Investor-event notice (SSE/HKEX cross-filed) | References Q3 2025 results (filed Oct-31-2025) | 2026-08-12 | Notice of a Dec-8-2025 investor briefing call on Q3 2025 results. Not a results document itself. |
| Haier_Smart_Home_Co_Ltd_-_Form_Interim_Report(May-18-2026).pdf | Investor-event notice (SSE/HKEX cross-filed) | References FY2025 annual + Q1 2026 results (filed Mar-27-2026 / Apr-28-2026) | 2026-08-12 | Notice of a May-27-2026 investor briefing call. Not a results document itself. |
| Haier Smart Home Co., Ltd., Q2 2019 Earnings Call, Aug 30, 2019.pdf | Earnings transcript | Q2 2019 (ended ~Jun-30-2019) | 2026-08-13 | Nearly 7 years stale — no probative value for a current business-model read. |
| Haier Smart Home Co., Ltd., Q3 2019 Earnings Call, Oct 31, 2019.pdf | Earnings transcript | Q3 2019 (ended ~Sep-30-2019) | 2026-08-13 | Same staleness issue. No transcript exists in the pool for any period after 2019. |
| Key Document Digest.pdf | Regulatory exhibit (SEC, US ADR program) | Filed 2021-11-19 | 2026-08-13 | Form F-6 registration statement for the ADR program (Deutsche Bank Trust Company Americas depositary). Administrative/legal exhibit, not an operating disclosure. |
| HaierSmartHomeCoLtdSHSE600690_AllAccess.pdf | Data export (Capital IQ, single consolidated PDF pull) | Multi-period (see Key Stats/Consensus tabs below); pulled ahead of the FQ2 2026 release date of Aug-27-2026 | 2026-08-13 | Consolidated CapIQ "AllAccess" print bundling company profile, financials, estimates, ownership, corporate tree, transactions — duplicates the standalone workbooks below in one PDF. |
| Company Comparable Analysis Haier Smart Home Co Ltd .xls — tab: Financial Data | Data export (Capital IQ comps) | Peer set financials, USD | 2026-08-13 | 50×17, 302 cells. |
| Company Comparable Analysis Haier Smart Home Co Ltd .xls — tab: Trading Multiples | Data export (Capital IQ comps) | Peer set multiples | 2026-08-13 | 50×9, 166 cells. |
| Company Comparable Analysis Haier Smart Home Co Ltd .xls — tab: Operating Statistics | Data export (Capital IQ comps) | Peer set operating stats | 2026-08-13 | 50×13, 234 cells. |
| Company Comparable Analysis Haier Smart Home Co Ltd .xls — tab: Business Description | Data export (Capital IQ comps) | n/a | 2026-08-13 | 44×3, 49 cells. |
| Company Comparable Analysis Haier Smart Home Co Ltd .xls — tab: Implied Valuation | Data export (Capital IQ comps) | n/a | 2026-08-13 | 69×9, 222 cells. |
| Company Comparable Analysis Haier Smart Home Co Ltd .xls — tab: Valuation Chart | Data export (Capital IQ comps) | n/a | 2026-08-13 | 32×2, 11 cells. |
| Company Comparable Analysis Haier Smart Home Co Ltd .xls — tab: Credit Health Panel | Data export (Capital IQ comps) | n/a | 2026-08-13 | 48×10, 134 cells. |
| Company Comparable Analysis Haier Smart Home Co Ltd .xls — tab: Disclaimer | Data export (Capital IQ comps) | n/a | 2026-08-13 | boilerplate. |
| Haier Smart Home Co Ltd SHSE 600690 Analyst Coverage.rtf | Data export (Capital IQ) | current coverage list | 2026-08-13 | |
| Haier Smart Home Co Ltd SHSE 600690 Board Members.rtf | Data export (Capital IQ) | current roster | 2026-08-13 | |
| Haier Smart Home Co Ltd SHSE 600690 Committees.rtf | Data export (Capital IQ) | current | 2026-08-13 | |
| Haier Smart Home Co Ltd SHSE 600690 Comparable M A Transactions.xls — tab: Comparable M&A Transactions | Data export (Capital IQ) | historical M&A comps | 2026-08-13 | 17×9, 84 cells. |
| Haier Smart Home Co Ltd SHSE 600690 Compensation Summary Compensation.rtf | Data export (Capital IQ) | most recent disclosed comp | 2026-08-13 | |
| Haier Smart Home Co Ltd SHSE 600690 Competitors.rtf | Data export (Capital IQ) | current | 2026-08-13 | |
| Haier Smart Home Co Ltd SHSE 600690 Corporate Timeline.rtf | Data export (Capital IQ) | historical | 2026-08-13 | |
| Haier Smart Home Co Ltd SHSE 600690 Corporate Timeline.xls — tab: Corporate Timeline | Data export (Capital IQ) | historical | 2026-08-13 | 41×4, 106 cells; duplicates the .rtf. |
| Haier Smart Home Co Ltd SHSE 600690 Credit Health Panel.xls — tab: Summary | Data export (Capital IQ credit) | multi-period | 2026-08-13 | 43×11, 247 cells. |
| Haier Smart Home Co Ltd SHSE 600690 Credit Health Panel.xls — tab: Financials | Data export (Capital IQ credit) | multi-period | 2026-08-13 | 40×13, 338 cells. |
| Haier Smart Home Co Ltd SHSE 600690 Credit Health Panel.xls — tab: Operational Metrics Charts | Data export (Capital IQ credit) | multi-period | 2026-08-13 | 21×19, 13 cells. |
| Haier Smart Home Co Ltd SHSE 600690 Credit Health Panel.xls — tab: Solvency Metrics Charts | Data export (Capital IQ credit) | multi-period | 2026-08-13 | 18×19, 8 cells. |
| Haier Smart Home Co Ltd SHSE 600690 Credit Health Panel.xls — tab: Liquidity Metrics Charts | Data export (Capital IQ credit) | multi-period | 2026-08-13 | 15×19, 6 cells. |
| Haier Smart Home Co Ltd SHSE 600690 Credit Health Panel.xls — tab: Disclaimer | Data export (Capital IQ credit) | n/a | 2026-08-13 | boilerplate. |
| Haier Smart Home Co Ltd SHSE 600690 Customers.xls — tab: Customers | Data export (Capital IQ) | current | 2026-08-13 | 31×8, 141 cells. |
| Haier Smart Home Co Ltd SHSE 600690 Equity Listings.xls — tab: Equity Listings | Data export (Capital IQ) | current | 2026-08-13 | 33×11, 209 cells. |
| Haier Smart Home Co Ltd SHSE 600690 Equity Listings (1).xls — tab: Equity Listings | Data export (Capital IQ) | current | 2026-08-13 | 33×11, 209 cells; duplicate of the above. |
| Haier Smart Home Co Ltd SHSE 600690 Events Calendar.xls — tab: Events Calendar | Data export (Capital IQ) | forward events | 2026-08-13 | 23×3, 42 cells; includes the FQ2 2026 earnings date (Aug-27-2026). |
| Haier Smart Home Co Ltd SHSE 600690 Financials.xls (and duplicates "Financials (1).xls", "Financials (2).xls") — tab: Key Stats | Data export (Capital IQ) | FY2022A–FY2025A, LTM Mar-31-2026A, FY2026E–FY2028E | 2026-08-13 | 103×9, 306 cells. Three near-identical copies of the same workbook in the pool (Financials.xls / (1) / (2)) — redundant, not additive. |
| " " — tab: Income Statement | Data export (Capital IQ) | multi-year, CNY | 2026-08-13 | 113×7, 516 cells (×3 copies). |
| " " — tab: Balance Sheet | Data export (Capital IQ) | multi-year, CNY | 2026-08-13 | 103×7, 522 cells (×3 copies). |
| " " — tab: Cash Flow | Data export (Capital IQ) | multi-year, CNY | 2026-08-13 | 77×7, 379 cells (×3 copies). |
| " " — tab: Multiples | Data export (Capital IQ) | multi-year | 2026-08-13 | 91×10, 542 cells (×3 copies). |
| " " — tab: Historical Capitalization | Data export (Capital IQ) | multi-year | 2026-08-13 | 40×7, 147 cells (×3 copies). |
| " " — tab: Capital Structure Summary | Data export (Capital IQ) | multi-year | 2026-08-13 | 72×7 (313 cells) / 80×7 (337 cells) in (2) — copies differ slightly, (2) has extra rows. |
| " " — tab: Capital Structure Details | Data export (Capital IQ) | multi-year | 2026-08-13 | 38×10, 206 cells (×3 copies + 2 standalone duplicate workbooks, see below). |
| " " — tab: Ratios | Data export (Capital IQ) | multi-year | 2026-08-13 | 162×7, 870 cells (×3 copies). |
| " " — tab: Supplemental | Data export (Capital IQ) | multi-year | 2026-08-13 | 42×7, 144 cells (×3 copies). |
| " " — tab: Industry Specific | Data export (Capital IQ) | multi-year | 2026-08-13 | 16×6, 22 cells (×3 copies). |
| " " — tab: Pension OPEB | Data export (Capital IQ) | multi-year | 2026-08-13 | 159×7, 589 cells (×3 copies). |
| " " — tab: Segments | Data export (Capital IQ) | multi-year | 2026-08-13 | 76×7, 347 cells (×3 copies + 1 standalone duplicate workbook, see below). |
| Haier Smart Home Co Ltd SHSE 600690 Financials Capital Structure Details.xls — tab: Capital Structure Details | Data export (Capital IQ) | multi-year | 2026-08-13 | 41×10, 235 cells; standalone duplicate of the Financials.xls tab. |
| Haier Smart Home Co Ltd SHSE 600690 Financials Capital Structure Summary.xls — tab: Capital Structure Summary | Data export (Capital IQ) | multi-year | 2026-08-13 | 72×7, 313 cells; standalone duplicate. |
| Haier Smart Home Co Ltd SHSE 600690 Financials Segments.xls — tab: Segments | Data export (Capital IQ) | multi-year | 2026-08-13 | 76×7, 347 cells; standalone duplicate — this is the segment-map module's primary CapIQ segment source. |
| Haier Smart Home Co Ltd SHSE 600690 Fixed Income Securities Summary.rtf | Data export (Capital IQ) | current outstanding debt | 2026-08-13 | |
| Haier Smart Home Co Ltd SHSE 600690 Fixed Income Summary.rtf | Data export (Capital IQ) | current | 2026-08-13 | |
| Haier Smart Home Co Ltd SHSE 600690 Industry Classifications.rtf | Data export (Capital IQ) | current | 2026-08-13 | |
| Haier Smart Home Co Ltd SHSE 600690 Investment Analysis Co Investors.xls — tab: Co-Investors | Data export (Capital IQ) | current | 2026-08-13 | 115×3, 311 cells. |
| Haier Smart Home Co Ltd SHSE 600690 Investment Analysis Direct Investments.xls — tab: Direct Investments | Data export (Capital IQ) | historical M&A/investment list | 2026-08-13 | 170×21, 3052 cells. |
| Haier Smart Home Co Ltd SHSE 600690 Investment Criteria Direct Investments.xls — tab: Direct Investments | Data export (Capital IQ) | n/a | 2026-08-13 | 24×5, 39 cells. |
| Haier Smart Home Co Ltd SHSE 600690 Key Developments.xls — tab: Key Developments | Data export (Capital IQ news/events log) | historical, multi-year | 2026-08-13 | 51×7, 255 cells. |
| Haier Smart Home Co Ltd SHSE 600690 LP Co Investors.xls — tab: LP Co-Investors | Data export (Capital IQ) | current | 2026-08-13 | 56×3, 140 cells. |
| Haier Smart Home Co Ltd SHSE 600690 LP Investments.xls — tab: LP Investments | Data export (Capital IQ) | current | 2026-08-13 | 15×7, 26 cells. |
| Haier Smart Home Co Ltd SHSE 600690 Long Business Description.rtf | Data export (Capital IQ) | current | 2026-08-13 | |
| Haier Smart Home Co Ltd SHSE 600690 News.rtf | Data export (Capital IQ news log) | recent | 2026-08-13 | |
| Haier Smart Home Co Ltd SHSE 600690 Offices.rtf | Data export (Capital IQ) | current | 2026-08-13 | |
| Haier Smart Home Co Ltd SHSE 600690 Portfolio Exposure.xls — tab: Portfolio Exposure | Data export (Capital IQ) | current | 2026-08-13 | 17×2, 11 cells. |
| Haier Smart Home Co Ltd SHSE 600690 Private Ownership.rtf | Data export (Capital IQ) | current | 2026-08-13 | |
| Haier Smart Home Co Ltd SHSE 600690 Products.rtf | Data export (Capital IQ) | current | 2026-08-13 | |
| Haier Smart Home Co Ltd SHSE 600690 Professionals.rtf | Data export (Capital IQ) | current | 2026-08-13 | |
| Haier Smart Home Co Ltd SHSE 600690 Public Holdings Detailed.xls — tab: Detailed | Data export (Capital IQ ownership) | current | 2026-08-13 | 41×15, 53 cells. |
| Haier Smart Home Co Ltd SHSE 600690 Public Ownership Summary.rtf | Data export (Capital IQ ownership) | current | 2026-08-13 | |
| Haier Smart Home Co Ltd SHSE 600690 Strategic Alliances.xls — tab: Strategic Alliances | Data export (Capital IQ) | historical | 2026-08-13 | 38×7, 175 cells. |
| Haier Smart Home Co Ltd SHSE 600690 Suppliers.xls — tab: Suppliers | Data export (Capital IQ) | current | 2026-08-13 | 41×8, 220 cells — value-chain module's primary supplier list. |
| Haier Smart Home Co Ltd SHSE 600690 Takeover Defenses.rtf | Data export (Capital IQ governance) | current | 2026-08-13 | |
| Haier Smart Home Co Ltd SHSE 600690 Takeover Defenses.xls — tab: Corporate Governance | Data export (Capital IQ governance) | current | 2026-08-13 | 42×4, 70 cells. |
| Haier Smart Home Co Ltd SHSE 600690 Takeover Defenses.xls — tab: Takeover Defenses | Data export (Capital IQ governance) | current | 2026-08-13 | 21×4, 29 cells. |
| Haier Smart Home Co Ltd SHSE 600690 Takeover Defenses.xls — tab: Compare Defenses | Data export (Capital IQ governance) | current, vs. peers | 2026-08-13 | 36×8, 210 cells. |
| Haier Smart Home Co Ltd SHSE 600690 Transaction Advisors.xls — tab: Transaction Advisors | Data export (Capital IQ) | historical | 2026-08-13 | 217×5, 905 cells. |
| Haier Smart Home Co Ltd SHSE 600690 海尔智家股份有限公司 Public Company Profile.rtf | Data export (Capital IQ) | current | 2026-08-13 | Company name in Chinese (Simplified) — not a data gap, see below. |
| Haier Smart Home Co., Ltd. (SHSE_600690) Corporate Structure Tree.xls — tab: Haier Smart Home Co Ltd SHSE60... | Data export (Capital IQ corporate structure) | current | 2026-08-13 | 278×17, 4612 cells. |
| " " — tab: Filtered Count | Data export (Capital IQ) | current | 2026-08-13 | 22×4, 50 cells. |
| " " — tab: Aggregates | Data export (Capital IQ) | current | 2026-08-13 | 22×4, 50 cells. |
| HaierSmartHomeCo,LtdSHSE600690EstimatesReport.xls (and duplicate "(1).xls") — tab: Consensus | Data export (Capital IQ estimates) | FY2022A–FY2028E, quarterly through FQ2 2026 (release Aug-27-2026) | 2026-08-13 | 736×77, 28,637 cells (×2 copies — "(1)" and unnumbered are identical structure). |
| " " — tab: Recent Changes | Data export (Capital IQ estimates) | recent revisions | 2026-08-13 | 265×10, 2518 cells (×2 copies). |
| " " — tab: Guidance | Data export (Capital IQ estimates) | company guidance history | 2026-08-13 | 41×6, 181 cells (×2 copies, plus a 3rd standalone "EstimatesReport (2).xls" containing only this tab). |
| " " — tab: Multiples | Data export (Capital IQ estimates) | current + forward | 2026-08-13 | 23×7, 59 cells (×2 copies). |
| " " — tab: Surprise | Data export (Capital IQ estimates) | historical earnings surprise | 2026-08-13 | 380×66, 13,173 cells (×2 copies). |
| " " — tab: Trends | Data export (Capital IQ estimates) | estimate trend history | 2026-08-13 | 422×19, 6082 cells (×2 copies). |
| " " — tab: Revisions | Data export (Capital IQ estimates) | estimate revision history | 2026-08-13 | 615×19, 7113 cells (×2 copies). |
| HaierSmartHomeCo,LtdSHSE600690EstimatesReport (2).xls — tab: Guidance | Data export (Capital IQ estimates) | company guidance history | 2026-08-13 | 41×6, 181 cells; third copy, guidance-only workbook. |
| Transaction Summary Public Offerings.xls — tab: Public Offerings | Data export (Capital IQ) | historical offerings | 2026-08-13 | 19×9, 68 cells. |

**Duplication note:** "Financials.xls", "Financials (1).xls" and "Financials (2).xls" are near-identical 13-tab CapIQ exports (same Key Stats/Income Statement/Balance Sheet/Cash Flow/Multiples/etc.), and "EstimatesReport.xls" / "EstimatesReport (1).xls" / "EstimatesReport (2).xls" likewise duplicate each other. These do not add distinct evidence — they are redundant re-pulls, not three independent sources.

## 2. Most Recent Sources

| Source Type | Filename | Period | Age (months, vs 2026-08-13) |
|---|---|---|---|
| Annual filing | Haier_Smart_Home_Co_Ltd_-_Form_Annual_Report(Apr-27-2026).pdf [H-share, IFRS] / (Mar-26-2026).pdf [A-share, China ASBE] | FY2025 (ended Dec-31-2025) | ~4.5–4.6 |
| Quarterly filing | Haier_Smart_Home_Co_Ltd_-_Form_Interim_Report(Apr-27-2026).pdf | Q1 2026 (ended Mar-31-2026) | ~4.5 |
| Earnings transcript | Haier Smart Home Co., Ltd., Q3 2019 Earnings Call, Oct 31, 2019.pdf | Q3 2019 | ~82 (stale — no post-2019 transcript in pool) |
| Investor deck | None in pool | — | Not present |
| Data export | HaierSmartHomeCo,LtdSHSE600690EstimatesReport.xls — Consensus tab | Estimates through FY2028E; FQ2 2026 release dated Aug-27-2026 | Pulled ahead of the next print, i.e. current |

## 2A. Filing Regime

| Item | Detected Value | Evidence |
|---|---|---|
| Primary listing country | China (mainland-incorporated, PRC) | "於中華人民共和國註冊成立之股份有限公司" — Haier_Smart_Home_Co_Ltd_-_Form_Interim_Report(Apr-27-2026).pdf, p.1 |
| Filing regime | Dual-primary: SSE (A-share, 600690) under China Securities Law / CSRC disclosure rules, and HKEX (H-share, 6690) under SFO Part XIVA / HK Listing Rules 13.09(2)/13.10B; plus Frankfurt D-share and a Level-I ADR program (Form F-6) | Haier_Smart_Home_Co_Ltd_-_Form_Annual_Report(Mar-26-2026).pdf (SSE cover page, "公司代码：600690"); Haier_Smart_Home_Co_Ltd_-_Form_Annual_Report(Apr-27-2026).pdf (HKEX cover, "股份代號：6690"); Key Document Digest.pdf (SEC Form F-6, filed 2021-11-19) |
| Reporting standard | China ASBE (企业会计准则 / CAS) for the SSE annual report and both quarterly reports; IFRS (國際財務報告準則) for the HKEX annual report. Quarterly filings state net profit/equity attributable to parent "are not different" from IFRS. | Haier_Smart_Home_Co_Ltd_-_Form_Annual_Report(Mar-26-2026).pdf p.1; Haier_Smart_Home_Co_Ltd_-_Form_Annual_Report(Apr-27-2026).pdf (contents page); Haier_Smart_Home_Co_Ltd_-_Form_Interim_Report(Apr-27-2026).pdf p.1 |
| Reporting currency + fiscal-year end | RMB (CNY); fiscal year ends Dec-31 | "人民幣百萬元" (Preliminary Annual Report, Mar-26-2026.pdf); "12月31日止年度" (Annual Report, Apr-27-2026.pdf); CapIQ Key Stats tab confirms currency = CNY and fiscal periods ending Dec-31 |
| Document language(s) | Simplified Chinese (SSE filings, most CapIQ .rtf exports), Traditional Chinese + English (HKEX filings, bilingual), English (CapIQ workbooks, 2019 transcripts, Form F-6) | throughout — see Section 1 |

Downstream agents should read the SSE annual report as the CAS-basis primary source and the HKEX annual report as the IFRS-basis primary source for the same FY2025 period, reconciling rather than averaging any line-item differences (CLAUDE.md §15, §27). Both quarterly filings are unaudited CAS figures with a company-stated immateriality-to-IFRS note — treat that note as management's own claim, not an independent reconciliation.

## 3. Sufficiency Verdict

- **Verdict:** Sufficient
- **Reason:** The pool holds an audited FY2025 annual report (both the A-share/CAS and H-share/IFRS versions, filed Mar/Apr 2026, ~4.5 months old) AND a Q1 2026 quarterly filing (filed Apr-27-2026, ~4.5 months old) — both well inside the 18-month / 6-month sufficiency windows, satisfying the rule without needing a transcript or deck.
- **Critical missing items:** None that block the verdict, but note for downstream agents:
  - No investor-deck-type document exists anywhere in the pool.
  - No earnings transcript newer than Q3 2019 (~7 years stale) exists — the business-quality and moat modules will have no management-commentary color for FY2025/Q1 2026 results and should rely on the filings' MD&A/business-review sections instead.
  - No standalone H1 2025 interim results report is in the pool — only two administrative dividend-implementation notices that reference it. If segment-level H1 2025 detail is needed, it is not directly available; the Q3 2025 quarterly report and FY2025 annual report are the nearest full disclosures bracketing it.
  - The FQ2 2026 (H1 2026) results are not yet out — CapIQ Events Calendar shows the release date as Aug-27-2026, two weeks after this triage date.
