# Earnings Data Triage — HAIER

## 0. Jurisdiction & Reporting Regime

| Item | Detected Value | Evidence |
|---|---|---|
| Primary listing country | China (mainland-incorporated, PRC), dual-primary listed | "於中華人民共和國註冊成立之股份有限公司" [Q1 2026 Interim/Quarterly Report, p.1] |
| Exchange | Shanghai Stock Exchange (A-share, 600690, primary) + Hong Kong Stock Exchange (H-share, 6690); also Frankfurt (D-share) and a US Level-I ADR program | SSE cover page "公司代码：600690" [FY2025 Annual Report (A-share/CAS), Mar-26-2026]; HKEX cover "股份代號：6690" [FY2025 Annual Report (H-share/IFRS), Apr-27-2026]; Form F-6, filed 2021-11-19 [Key Document Digest.pdf] |
| Filing regime (US SEC / India SEBI-LODR / UK / Other) | Other — China Securities Law / CSRC disclosure rules (SSE) and HK SFO Part XIVA / HKEX Listing Rules 13.09(2)/13.10B (HKEX) | Same as above |
| Reporting standard (US GAAP / IFRS / Ind AS) | China ASBE (企业会计准则 / CAS) for the SSE annual report and both quarterly filings; IFRS (國際財務報告準則) for the HKEX annual report. Quarterly filings state net profit/equity attributable to parent "are not different" from IFRS | FY2025 Annual Report (A-share/CAS), Mar-26-2026, p.1; FY2025 Annual Report (H-share/IFRS), Apr-27-2026, contents page; Q1 2026 Quarterly Report, Apr-27-2026, p.1 |
| Reporting currency | RMB (CNY) | "人民幣百萬元" [FY2025 Preliminary Annual Report, Mar-26-2026]; "Operating revenue ... RMB 73,686,720,161.13" [Q1 2026 Quarterly Report, p.1] |
| Fiscal-year end | December 31 | "12月31日止年度" [FY2025 Annual Report (H-share/IFRS), Apr-27-2026]; CapIQ Key Stats confirms fiscal periods ending Dec-31 |
| Document language(s) | Simplified Chinese (SSE filings), Traditional Chinese + English bilingual (HKEX filings), English (CapIQ workbooks, 2019 transcripts, Form F-6). Non-English filings are read and translated, not treated as a data gap (CLAUDE.md §27) | Throughout Section 1 |

This is an Other-jurisdiction (mainland China, dual A/H-share) filer. US SEC form names (10-K/10-Q/8-K) do not apply; downstream agents should read the SSE Annual Report / quarterly financial results as the CAS-basis primary source and the HKEX Annual Report as the IFRS-basis primary source for the same period, reconciling rather than averaging line-item differences (CLAUDE.md §15, §27).

## 1. File Inventory

Extraction ran via `.claude/tools/extract_pool.py` against `data/HAIER/` → `analyses/HAIER_2026-08-13/_pool_extracts/`. Manifest totals: **62 source files → 95 workbook tabs/streams, 126 extract files, 0 failures.** Every source in `manifest.json` carries `status: ok` — nothing is in a fail / fallback-text / missing-dependency state, so no source is excluded on extraction grounds. No `ciq_facts.json` sidecar exists in `_pool_extracts/`, so all figures cited below (and by later earnings agents) are the agents' own sourced reads, not a mechanically-pinned sidecar value. **Filesystem last-modified dates are a Drive-sync artifact** (all files show 2026-08-12/13, the sync date) — every period below is read from inside each document per CLAUDE.md §27/F23.

| Filename | Type | Period Covered | Last Modified (sync date, not filing date) | Earnings Relevance |
|---|---|---|---|---|
| Haier_Smart_Home_Co_Ltd_-_Form_Annual_Report(Mar-26-2026).pdf | Annual filing (A-share, SSE, audited, CAS) | FY2025 (ended Dec-31-2025) | 2026-08-12 | High |
| Haier_Smart_Home_Co_Ltd_-_Form_Annual_Report(Apr-27-2026).pdf | Annual filing (H-share, HKEX, IFRS) | FY2025 (ended Dec-31-2025) | 2026-08-12 | High |
| Haier_Smart_Home_Co_Ltd_-_Form_Preliminary_Annual_Report(Mar-26-2026).pdf | Earnings press release (HKEX "全年業績公告" results announcement) | FY2025 vs FY2024 restated | 2026-08-12 | High |
| Haier_Smart_Home_Co_Ltd_-_Form_Interim_Report(Apr-27-2026).pdf | Quarterly filing ("2026 FIRST QUARTER REPORT", unaudited, CAS) | Q1 2026 (ended Mar-31-2026) | 2026-08-12 | High |
| Haier_Smart_Home_Co_Ltd_-_Form_Interim_Report(Oct-30-2025).pdf | Quarterly filing ("2025 THIRD QUARTER REPORT", unaudited, CAS) | Q3 2025 (ended Sep-30-2025) | 2026-08-12 | High |
| Haier_Smart_Home_Co_Ltd_-_Form_Interim_Report(Oct-31-2025).pdf | Administrative filing — A-share dividend implementation notice | References H1 2025 dividend | 2026-08-12 | Low |
| Haier_Smart_Home_Co_Ltd_-_(Oct-23-2025).pdf | Administrative filing — dividend-plan adjustment notice | References H1 2025 dividend | 2026-08-12 | Low |
| Haier_Smart_Home_Co_Ltd_-_Form_Interim_Report(Nov-28-2025).pdf | Investor-event notice (briefing-call announcement, not results) | References Q3 2025 results | 2026-08-12 | Low |
| Haier_Smart_Home_Co_Ltd_-_Form_Interim_Report(May-18-2026).pdf | Investor-event notice (briefing-call announcement, not results) | References FY2025/Q1 2026 results | 2026-08-12 | Low |
| Haier Smart Home Co., Ltd., Q2 2019 Earnings Call, Aug 30, 2019.pdf | Earnings transcript (verbatim) | Q2 2019 | 2026-08-13 | Low — ~84 months stale, no probative value for the next 3-12 months |
| Haier Smart Home Co., Ltd., Q3 2019 Earnings Call, Oct 31, 2019.pdf | Earnings transcript (verbatim) | Q3 2019 | 2026-08-13 | Low — same staleness issue |
| Key Document Digest.pdf | Regulatory exhibit (SEC Form F-6, ADR program) | Filed 2021-11-19 | 2026-08-13 | Low — administrative/legal, not operating disclosure |
| HaierSmartHomeCoLtdSHSE600690_AllAccess.pdf | Data export (CapIQ consolidated PDF print) | Multi-period, pulled ahead of FQ2 2026 (Aug-27-2026) | 2026-08-13 | Medium — duplicates the workbooks below |
| Company Comparable Analysis Haier Smart Home Co Ltd .xls — tab: Financial Data | Data export (CapIQ comps) | Peer set, USD | 2026-08-13 | Low (peer comps, not HAIER-specific earnings) |
| Company Comparable Analysis Haier Smart Home Co Ltd .xls — tab: Trading Multiples | Data export (CapIQ comps) | Peer set | 2026-08-13 | Low |
| Company Comparable Analysis Haier Smart Home Co Ltd .xls — tab: Operating Statistics | Data export (CapIQ comps) | Peer set | 2026-08-13 | Low |
| Company Comparable Analysis Haier Smart Home Co Ltd .xls — tab: Business Description | Data export (CapIQ comps) | n/a | 2026-08-13 | Low |
| Company Comparable Analysis Haier Smart Home Co Ltd .xls — tab: Implied Valuation | Data export (CapIQ comps) | n/a | 2026-08-13 | Low (out of module scope) |
| Company Comparable Analysis Haier Smart Home Co Ltd .xls — tab: Valuation Chart | Data export (CapIQ comps) | n/a | 2026-08-13 | Low |
| Company Comparable Analysis Haier Smart Home Co Ltd .xls — tab: Credit Health Panel | Data export (CapIQ comps) | n/a | 2026-08-13 | Low |
| Company Comparable Analysis Haier Smart Home Co Ltd .xls — tab: Disclaimer | Data export (CapIQ comps) | n/a | 2026-08-13 | Low |
| Haier Smart Home Co Ltd SHSE 600690 Analyst Coverage.rtf | Data export (CapIQ) — list of covering analysts, no note content | current | 2026-08-13 | Low |
| Haier Smart Home Co Ltd SHSE 600690 Board Members.rtf | Data export (CapIQ) | current | 2026-08-13 | Low |
| Haier Smart Home Co Ltd SHSE 600690 Committees.rtf | Data export (CapIQ) | current | 2026-08-13 | Low |
| Haier Smart Home Co Ltd SHSE 600690 Comparable M A Transactions.xls — tab: Comparable M&A Transactions | Data export (CapIQ) | historical M&A comps | 2026-08-13 | Low |
| Haier Smart Home Co Ltd SHSE 600690 Compensation Summary Compensation.rtf | Data export (CapIQ) | most recent disclosed comp | 2026-08-13 | Low |
| Haier Smart Home Co Ltd SHSE 600690 Competitors.rtf | Data export (CapIQ) | current | 2026-08-13 | Low |
| Haier Smart Home Co Ltd SHSE 600690 Corporate Timeline.rtf | Data export (CapIQ) | historical | 2026-08-13 | Low |
| Haier Smart Home Co Ltd SHSE 600690 Corporate Timeline.xls — tab: Corporate Timeline | Data export (CapIQ) | historical | 2026-08-13 | Low (duplicates the .rtf) |
| Haier Smart Home Co Ltd SHSE 600690 Credit Health Panel.xls — tab: Summary | Data export (CapIQ credit) | multi-period | 2026-08-13 | Medium (cash flow / solvency context) |
| Haier Smart Home Co Ltd SHSE 600690 Credit Health Panel.xls — tab: Financials | Data export (CapIQ credit) | multi-period | 2026-08-13 | Medium |
| Haier Smart Home Co Ltd SHSE 600690 Credit Health Panel.xls — tab: Operational Metrics Charts | Data export (CapIQ credit) | multi-period | 2026-08-13 | Low |
| Haier Smart Home Co Ltd SHSE 600690 Credit Health Panel.xls — tab: Solvency Metrics Charts | Data export (CapIQ credit) | multi-period | 2026-08-13 | Low |
| Haier Smart Home Co Ltd SHSE 600690 Credit Health Panel.xls — tab: Liquidity Metrics Charts | Data export (CapIQ credit) | multi-period | 2026-08-13 | Low |
| Haier Smart Home Co Ltd SHSE 600690 Credit Health Panel.xls — tab: Disclaimer | Data export (CapIQ credit) | n/a | 2026-08-13 | Low |
| Haier Smart Home Co Ltd SHSE 600690 Customers.xls — tab: Customers | Data export (CapIQ) | current | 2026-08-13 | Low |
| Haier Smart Home Co Ltd SHSE 600690 Equity Listings.xls — tab: Equity Listings | Data export (CapIQ) | current | 2026-08-13 | Low |
| Haier Smart Home Co Ltd SHSE 600690 Equity Listings (1).xls — tab: Equity Listings | Data export (CapIQ) | current | 2026-08-13 | Low (duplicate) |
| Haier Smart Home Co Ltd SHSE 600690 Events Calendar.xls — tab: Events Calendar | Data export (CapIQ) | forward events, incl. FQ2 2026 release date Aug-27-2026 | 2026-08-13 | Medium (next print date) |
| Haier Smart Home Co Ltd SHSE 600690 Financials.xls / "(1)" / "(2)" — tab: Key Stats | Data export (CapIQ) | FY2022A–FY2025A, LTM Mar-31-2026A, FY2026E–FY2028E | 2026-08-13 | High (×3 near-identical copies — redundant, not additive) |
| " " — tab: Income Statement | Data export (CapIQ) | multi-year (annual), CNY | 2026-08-13 | High |
| " " — tab: Balance Sheet | Data export (CapIQ) | multi-year (annual), CNY | 2026-08-13 | High |
| " " — tab: Cash Flow | Data export (CapIQ) | multi-year (annual), CNY | 2026-08-13 | High |
| " " — tab: Multiples | Data export (CapIQ) | multi-year | 2026-08-13 | Medium |
| " " — tab: Historical Capitalization | Data export (CapIQ) | multi-year | 2026-08-13 | Low |
| " " — tab: Capital Structure Summary | Data export (CapIQ) | multi-year | 2026-08-13 | Medium |
| " " — tab: Capital Structure Details | Data export (CapIQ) | multi-year | 2026-08-13 | Medium |
| " " — tab: Ratios | Data export (CapIQ) | multi-year | 2026-08-13 | Medium |
| " " — tab: Supplemental | Data export (CapIQ) | multi-year | 2026-08-13 | Low |
| " " — tab: Industry Specific | Data export (CapIQ) | multi-year | 2026-08-13 | Low |
| " " — tab: Pension OPEB | Data export (CapIQ) | multi-year | 2026-08-13 | Low |
| " " — tab: Segments | Data export (CapIQ) | multi-year (annual) | 2026-08-13 | High |
| Haier Smart Home Co Ltd SHSE 600690 Financials Capital Structure Details.xls — tab: Capital Structure Details | Data export (CapIQ) | multi-year | 2026-08-13 | Medium (standalone duplicate) |
| Haier Smart Home Co Ltd SHSE 600690 Financials Capital Structure Summary.xls — tab: Capital Structure Summary | Data export (CapIQ) | multi-year | 2026-08-13 | Medium (standalone duplicate) |
| Haier Smart Home Co Ltd SHSE 600690 Financials Segments.xls — tab: Segments | Data export (CapIQ) | multi-year | 2026-08-13 | High (standalone duplicate) |
| Haier Smart Home Co Ltd SHSE 600690 Fixed Income Securities Summary.rtf | Data export (CapIQ) | current outstanding debt | 2026-08-13 | Low |
| Haier Smart Home Co Ltd SHSE 600690 Fixed Income Summary.rtf | Data export (CapIQ) | current | 2026-08-13 | Low |
| Haier Smart Home Co Ltd SHSE 600690 Industry Classifications.rtf | Data export (CapIQ) | current | 2026-08-13 | Low |
| Haier Smart Home Co Ltd SHSE 600690 Investment Analysis Co Investors.xls — tab: Co-Investors | Data export (CapIQ) | current | 2026-08-13 | Low |
| Haier Smart Home Co Ltd SHSE 600690 Investment Analysis Direct Investments.xls — tab: Direct Investments | Data export (CapIQ) | historical M&A/investment list | 2026-08-13 | Low |
| Haier Smart Home Co Ltd SHSE 600690 Investment Criteria Direct Investments.xls — tab: Direct Investments | Data export (CapIQ) | n/a | 2026-08-13 | Low |
| Haier Smart Home Co Ltd SHSE 600690 Key Developments.xls — tab: Key Developments | Data export (CapIQ news/events log) | historical, multi-year | 2026-08-13 | Medium |
| Haier Smart Home Co Ltd SHSE 600690 LP Co Investors.xls — tab: LP Co-Investors | Data export (CapIQ) | current | 2026-08-13 | Low |
| Haier Smart Home Co Ltd SHSE 600690 LP Investments.xls — tab: LP Investments | Data export (CapIQ) | current | 2026-08-13 | Low |
| Haier Smart Home Co Ltd SHSE 600690 Long Business Description.rtf | Data export (CapIQ) | current | 2026-08-13 | Low |
| Haier Smart Home Co Ltd SHSE 600690 News.rtf | Data export (CapIQ news log) | recent | 2026-08-13 | Low |
| Haier Smart Home Co Ltd SHSE 600690 Offices.rtf | Data export (CapIQ) | current | 2026-08-13 | Low |
| Haier Smart Home Co Ltd SHSE 600690 Portfolio Exposure.xls — tab: Portfolio Exposure | Data export (CapIQ) | current | 2026-08-13 | Low |
| Haier Smart Home Co Ltd SHSE 600690 Private Ownership.rtf | Data export (CapIQ) | current | 2026-08-13 | Low |
| Haier Smart Home Co Ltd SHSE 600690 Products.rtf | Data export (CapIQ) | current | 2026-08-13 | Low |
| Haier Smart Home Co Ltd SHSE 600690 Professionals.rtf | Data export (CapIQ) | current | 2026-08-13 | Low |
| Haier Smart Home Co Ltd SHSE 600690 Public Holdings Detailed.xls — tab: Detailed | Data export (CapIQ ownership) | current | 2026-08-13 | Low |
| Haier Smart Home Co Ltd SHSE 600690 Public Ownership Summary.rtf | Data export (CapIQ ownership) | current | 2026-08-13 | Low |
| Haier Smart Home Co Ltd SHSE 600690 Strategic Alliances.xls — tab: Strategic Alliances | Data export (CapIQ) | historical | 2026-08-13 | Low |
| Haier Smart Home Co Ltd SHSE 600690 Suppliers.xls — tab: Suppliers | Data export (CapIQ) | current | 2026-08-13 | Low |
| Haier Smart Home Co Ltd SHSE 600690 Takeover Defenses.rtf | Data export (CapIQ governance) | current | 2026-08-13 | Low |
| Haier Smart Home Co Ltd SHSE 600690 Takeover Defenses.xls — tab: Corporate Governance | Data export (CapIQ governance) | current | 2026-08-13 | Low |
| Haier Smart Home Co Ltd SHSE 600690 Takeover Defenses.xls — tab: Takeover Defenses | Data export (CapIQ governance) | current | 2026-08-13 | Low |
| Haier Smart Home Co Ltd SHSE 600690 Takeover Defenses.xls — tab: Compare Defenses | Data export (CapIQ governance) | current, vs. peers | 2026-08-13 | Low |
| Haier Smart Home Co Ltd SHSE 600690 Transaction Advisors.xls — tab: Transaction Advisors | Data export (CapIQ) | historical | 2026-08-13 | Low |
| Haier Smart Home Co Ltd SHSE 600690 海尔智家股份有限公司 Public Company Profile.rtf | Data export (CapIQ, Chinese-language) | current | 2026-08-13 | Low — not a data gap, see §0 on language |
| Haier Smart Home Co., Ltd. (SHSE_600690) Corporate Structure Tree.xls — tab: Haier Smart Home Co Ltd SHSE60... | Data export (CapIQ corporate structure) | current | 2026-08-13 | Low |
| " " — tab: Filtered Count | Data export (CapIQ) | current | 2026-08-13 | Low |
| " " — tab: Aggregates | Data export (CapIQ) | current | 2026-08-13 | Low |
| HaierSmartHomeCo,LtdSHSE600690EstimatesReport.xls (+"(1)" duplicate) — tab: Consensus | Data export (CapIQ estimates) | FY2022A–FY2028E, quarterly consensus history from FQ3 2008 through FQ2 2026+, across SHSE/SEHK/DB listings | 2026-08-13 | High |
| " " — tab: Recent Changes | Data export (CapIQ estimates) | recent revisions | 2026-08-13 | High |
| " " — tab: Guidance | Data export (CapIQ estimates) | company guidance history (last entry FH1 2012 — stale, no current formal guidance) | 2026-08-13 | Medium |
| " " — tab: Multiples | Data export (CapIQ estimates) | current + forward | 2026-08-13 | Medium |
| " " — tab: Surprise | Data export (CapIQ estimates) | annual + quarterly earnings-surprise history back to 2004/FQ3 2008 | 2026-08-13 | High |
| " " — tab: Trends | Data export (CapIQ estimates) | estimate trend history | 2026-08-13 | High |
| " " — tab: Revisions | Data export (CapIQ estimates) | estimate revision history | 2026-08-13 | High |
| HaierSmartHomeCo,LtdSHSE600690EstimatesReport (2).xls — tab: Guidance | Data export (CapIQ estimates) | company guidance history | 2026-08-13 | Medium (third copy, guidance-only workbook) |
| Transaction Summary Public Offerings.xls — tab: Public Offerings | Data export (CapIQ) | historical offerings | 2026-08-13 | Low |

**Duplication note:** "Financials.xls" / "(1)" / "(2)" are near-identical 13-tab CapIQ exports, and the three "EstimatesReport*.xls" files likewise duplicate each other (two full 7-tab copies plus a third guidance-only copy). These are redundant re-pulls, not independent corroborating sources.

**No `data/HAIER/external/` folder exists** — there is no externally sourced research (alt-data, expert calls, broker notes) in this pool. Section 1A (External Data) is omitted.

## 2. Most Recent Sources

| Source Type | Filename | Period | Age (months) |
|---|---|---|---|
| Annual filing | Haier_Smart_Home_Co_Ltd_-_Form_Annual_Report(Apr-27-2026).pdf [H-share/IFRS] and (Mar-26-2026).pdf [A-share/CAS] | FY2025 (ended Dec-31-2025) | ~4.5–4.6 |
| Quarterly filing | Haier_Smart_Home_Co_Ltd_-_Form_Interim_Report(Apr-27-2026).pdf ("2026 First Quarter Report") | Q1 2026 (ended Mar-31-2026) | ~4.5 |
| Earnings transcript | Haier Smart Home Co., Ltd., Q3 2019 Earnings Call, Oct 31, 2019.pdf | Q3 2019 | ~82 (stale — no transcript post-2019 in pool) |
| Investor deck | None in pool | — | Not present |
| Consensus / estimate export | HaierSmartHomeCo,LtdSHSE600690EstimatesReport.xls — Consensus tab | FY2022A–FY2028E; quarterly through FQ2 2026 (release Aug-27-2026) and beyond | Pulled ahead of the next print — current |
| Cash flow data | Haier Smart Home Co Ltd SHSE 600690 Financials.xls — Cash Flow tab (annual) + Q1 2026 / Q3 2025 quarterly filings' own cash flow statements | FY2021–FY2025 annual + Q1 2026 / Q3 2025 quarterly | ~4.5 (quarterly) |
| Guidance data | HaierSmartHomeCo,LtdSHSE600690EstimatesReport.xls — Guidance tab | Last entry FH1 2012 | ~170 (effectively no current formal guidance) |

## 3. Earnings Usability Check

| Requirement | Available? (Y/N) | Source | Why It Matters |
|---|---|---|---|
| Income statement | Y | FY2025 Annual Report (A-share/CAS, Mar-26-2026 and H-share/IFRS, Apr-27-2026); Q1 2026 Quarterly Report (Apr-27-2026), p.1; CapIQ Financials.xls — Income Statement tab (annual, FY2022A–FY2025A) | Needed for revenue, margin, EPS |
| Balance sheet | Y | FY2025 Annual Report; Q1 2026 Quarterly Report; CapIQ Financials.xls — Balance Sheet tab | Needed for working capital and leverage |
| Cash flow statement | Y | FY2025 Annual Report; Q1 2026 / Q3 2025 Quarterly Reports (own cash flow statements); CapIQ Financials.xls — Cash Flow tab (annual) | Needed for CFO, FCF, earnings quality |
| Latest quarter | Y | Haier_Smart_Home_Co_Ltd_-_Form_Interim_Report(Apr-27-2026).pdf — "2026 First Quarter Report", revenue RMB 73.687bn, net profit attributable to shareholders RMB 4.652bn | Needed for trend and setup |
| Last 8 quarters | Y (via CapIQ estimate/surprise history, not standalone quarterly filings) | HaierSmartHomeCo,LtdSHSE600690EstimatesReport.xls — Consensus/Surprise tabs carry quarterly EPS actuals back to FQ3 2008. Only two standalone quarterly filings are in the pool (Q1 2026, Q3 2025) — Q2/Q4 quarters must be derived from the annual report and the CapIQ quarterly series, not read from a standalone quarterly filing | Needed for seasonality and inflection |
| Consensus estimates | Y | HaierSmartHomeCo,LtdSHSE600690EstimatesReport.xls — Consensus tab, FY2022A–FY2028E and FQ-level through FQ2 2026+ | Needed for market bar |
| Estimate revisions | Y | HaierSmartHomeCo,LtdSHSE600690EstimatesReport.xls — Revisions and Recent Changes tabs | Needed for revision momentum |
| Earnings transcript | N (verbatim transcripts present but ~7 years stale; no sell-side proxy in pool) | Only Q2 2019 / Q3 2019 transcripts exist — no post-2019 transcript and no broker "Earnings Call Insight" note anywhere in `data/HAIER/` | Needed for management tone and driver detail |
| Segment P&L | Y | CapIQ Financials.xls — Segments tab (annual, multi-year); FY2025 Annual Report MD&A also carries segment/business-line revenue commentary (e.g. "CCR" channel, up >15% YoY in Q1 2026) | Needed for mix shift |
| Current price | Y | CapIQ Financials.xls — Key Stats tab: Share Price (domestic A-share) RMB 22; H-share HKD 18.50; D-share EUR 14.51; consolidated market cap RMB 191,626m | Needed only for master-level stock reaction context |

## 4. Cross-Module Availability

| Business-Model Output | Available? (Y/N) |
|---|---|
| 03_segment-map.md | Y — `analyses/HAIER_2026-08-13/business-model/03_segment-map.md` exists |
| 06_value-chain.md | Y — `analyses/HAIER_2026-08-13/business-model/06_value-chain.md` exists |
| 10_external-dependency.md | Y — `analyses/HAIER_2026-08-13/business-model/10_external-dependency.md` exists |

The full business-model module (00 through 99, plus a combined dossier) has run and is available at `analyses/HAIER_2026-08-13/business-model/`.

## 5. Partial-Data Flags

| Missing Data | Applies? (Y/N) | Affected Agents | Cap Applied |
|---|---|---|---|
| No consensus / estimate data | N | 04, 05, 99 | Not applicable — Consensus, Recent Changes, Trends, Revisions, and Surprise tabs are all present in the CapIQ EstimatesReport workbooks |
| No quarterly data | N | 01, 02, 03, 06 | Not applicable — Q1 2026 and Q3 2025 quarterly filings are present, plus CapIQ quarterly consensus/surprise history back to FQ3 2008 |
| No VERBATIM transcript, sell-side proxy present | N | 02, 03, 04 | Not applicable — no sell-side / analyst earnings note exists anywhere in `data/HAIER/` to act as a proxy |
| No transcript AND no sell-side proxy | Y | 02, 03, 04 | Applies. The only transcripts in the pool (Q2/Q3 2019) are ~7 years stale and carry no probative value for the next 3-12 months, so the current pool is effectively call-source-free. Drivers/guidance colour must come from the filings' MD&A / business-review sections and the earnings press release (FY2025 Preliminary Annual Report). Earnings clarity capped at 70 (MODULE_RULES.md score-cap table). Tone/candor is Not assessable — that cap binds management-governance `06`, not earnings `06` (cash-flow quality) |
| No segment-level P&L | N | 02, 03, 99 | Not applicable — CapIQ Segments tab (annual) plus MD&A business-line commentary in the quarterly reports are available |
| No cash flow statement | N | 06, 99 | Not applicable — cash flow statements present in both the annual report and each quarterly filing, plus the CapIQ Cash Flow tab |
| No current price | N | 99 | Not applicable — CapIQ Key Stats tab carries current share price for all three listed share classes (A/H/D) |

## 6. Sufficiency Verdict

- **Verdict:** Partial
- **Reason:** The pool holds an audited FY2025 annual report (both A-share/CAS and H-share/IFRS, ~4.5 months old), a Q1 2026 quarterly filing (~4.5 months old), full income statement/balance sheet/cash flow (annual and quarterly), segment P&L, and an extensive CapIQ consensus/estimates/revisions/surprise history — satisfying every leg of the Sufficient rule except the call-derived commentary source: the only earnings transcripts present (Q2/Q3 2019) are ~7 years stale and no sell-side/analyst earnings-note proxy exists in the pool, so the module has no current call-derived management commentary.
- **Active partial-data caps:**
  - No transcript AND no sell-side proxy (effectively, given the 2019 transcripts' staleness) — earnings clarity capped at 70; drivers/guidance colour sourced from filings' MD&A and the earnings press release instead of a call.
  - Tone/candor read is Not assessable from this pool (affects management-governance `06`, not earnings `06`).
  - No current formal management guidance (CapIQ Guidance tab's last entry is FH1 2012, ~170 months stale) — `04_guidance-consensus` should treat guidance as effectively absent and work from consensus and MD&A outlook language instead.
- **Critical missing items:**
  - No investor-deck-type document anywhere in the pool.
  - No post-2019 earnings-call transcript and no sell-side "Earnings Call Insight" note — no verbatim or proxy commentary source for FY2025/Q1 2026 results.
  - No standalone H1 2025 interim results report — only two administrative dividend-implementation notices reference it; if H1 2025 segment-level detail is needed, it is not directly available and must be bracketed from the Q3 2025 quarterly report and the FY2025 annual report.
  - The FQ2 2026 (H1 2026) results are not yet released — CapIQ Events Calendar shows Aug-27-2026, after this triage date (2026-08-13).

